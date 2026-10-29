// ---------------------------------------------------------------------------
// Screenshot OCR — runs entirely in the browser with Tesseract.js.
// The image is NOT uploaded to any JaalBreak server.
//
// Note: the first time OCR runs, Tesseract.js downloads its engine and
// language data (English ≈ 10 MB, Hindi adds more) from a public CDN. After
// that the browser caches them. If that download fails, we show a clear error
// and the user can type the text instead.
//
// OCR output is never treated as ground truth: it is placed in an editable
// box so the user can correct it before analysis.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react';
import { Upload, Image as ImageIcon, LoaderCircle, TriangleAlert, ScanLine } from './Icons.js';
import { SAMPLE_SCREENSHOT } from '../data/sampleMessages.js';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_DIMENSION = 5000; // pixels
const MIN_DIMENSION = 60;

const OCR_LANGUAGES = [
  { value: 'eng', label: 'English' },
  { value: 'eng+hin', label: 'English + Hindi (larger download)' },
];

function readImageSize(url) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('This file could not be opened as an image.'));
    img.src = url;
  });
}

export default function ScreenshotOcr({ onExtracted, onUseTranscript, initialFile = null }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSample, setIsSample] = useState(false);
  const [lang, setLang] = useState('eng');
  const [status, setStatus] = useState('idle'); // idle | ready | working | done | error
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Free the preview URL when it changes or the component unmounts.
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const acceptFile = async (candidate, sample = false) => {
    setError('');
    setStatus('idle');
    if (!candidate) return;
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      setError('Please choose a PNG, JPG or WebP image.');
      setStatus('error');
      return;
    }
    if (candidate.size > MAX_BYTES) {
      setError('This image is larger than 8 MB. Please crop it or take a smaller screenshot.');
      setStatus('error');
      return;
    }
    const url = URL.createObjectURL(candidate);
    try {
      const { width, height } = await readImageSize(url);
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        URL.revokeObjectURL(url);
        setError(`This image is ${width}×${height}px. The limit is ${MAX_DIMENSION}px on each side.`);
        setStatus('error');
        return;
      }
      if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
        URL.revokeObjectURL(url);
        setError('This image is too small to read.');
        setStatus('error');
        return;
      }
    } catch (e) {
      URL.revokeObjectURL(url);
      setError(e.message);
      setStatus('error');
      return;
    }
    setFile(candidate);
    setPreviewUrl(url);
    setIsSample(sample);
    setStatus('ready');
  };
  // A file handed over from the smart box (an image without a QR code).
  useEffect(() => {
    if (initialFile) acceptFile(initialFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFile]);


  const loadSample = async () => {
    try {
      const response = await fetch(SAMPLE_SCREENSHOT.src);
      if (!response.ok) throw new Error('missing');
      const blob = await response.blob();
      await acceptFile(new File([blob], 'sample-sms-screenshot.png', { type: 'image/png' }), true);
    } catch {
      setError('The sample screenshot could not be loaded.');
      setStatus('error');
    }
  };

  const runOcr = async () => {
    if (!file) return;
    setStatus('working');
    setProgress(0);
    setStageText('Loading the text-recognition engine…');
    setError('');
    let worker;
    try {
      const { createWorker } = await import('tesseract.js');
      worker = await createWorker(lang, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setStageText('Reading text from the image…');
            setProgress(Math.round((m.progress || 0) * 100));
          } else if (m.status) {
            setStageText(`${m.status.charAt(0).toUpperCase()}${m.status.slice(1)}…`);
          }
        },
      });
      const { data } = await worker.recognize(file);
      const text = (data.text || '').replace(/\n{3,}/g, '\n\n').trim();
      if (text.length < 8) {
        setError('We could not read clear text from this image. It may be blurry, very small or mostly graphics. Try a sharper screenshot, or type the message instead.');
        setStatus('error');
        return;
      }
      setStatus('done');
      onExtracted(text, typeof data.confidence === 'number' ? Math.round(data.confidence) : null);
    } catch (e) {
      console.error('[JaalBreak OCR]', e);
      setError(
        'Text recognition could not run. The OCR engine downloads its language files the first time it is used, so check your internet connection and try again — or type the message instead.'
      );
      setStatus('error');
    } finally {
      if (worker) {
        try {
          await worker.terminate();
        } catch {
          /* ignore */
        }
      }
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    acceptFile(e.dataTransfer.files && e.dataTransfer.files[0]);
  };

  return (
    <div className="ocr">
      <div
        className={`dropzone ${previewUrl ? 'has-preview' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Selected screenshot preview" className="dropzone__preview" />
        ) : (
          <div className="dropzone__empty">
            <ImageIcon size={28} strokeWidth={1.5} aria-hidden="true" />
            <p>
              <strong>Drop a screenshot here</strong> or choose a file
            </p>
            <p className="fine-print">PNG, JPG or WebP · up to 8 MB · processed in your browser</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="visually-hidden"
          onChange={(e) => acceptFile(e.target.files && e.target.files[0])}
        />
      </div>

      <div className="ocr__controls">
        <button type="button" className="btn btn--secondary" onClick={() => inputRef.current?.click()}>
          <Upload size={16} aria-hidden="true" /> Choose image
        </button>
        <button type="button" className="btn btn--ghost" onClick={loadSample}>
          Use sample screenshot
        </button>
        <label className="field field--inline">
          <span className="field__label">OCR language</span>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="select">
            {OCR_LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn btn--primary"
          onClick={runOcr}
          disabled={!file || status === 'working'}
        >
          {status === 'working' ? (
            <LoaderCircle size={16} className="spin" aria-hidden="true" />
          ) : (
            <ScanLine size={16} aria-hidden="true" />
          )}
          Extract text
        </button>
      </div>

      {status === 'working' && (
        <div className="progress" role="status" aria-live="polite">
          <div className="progress__bar">
            <span style={{ width: `${progress}%` }} />
          </div>
          <span className="progress__label">
            {stageText} {progress > 0 ? `${progress}%` : ''}
          </span>
        </div>
      )}

      {status === 'error' && (
        <div className="callout callout--warning" role="alert">
          <TriangleAlert size={18} aria-hidden="true" />
          <div>
            <p>{error}</p>
            {isSample && (
              <button type="button" className="btn btn--link" onClick={() => onUseTranscript(SAMPLE_SCREENSHOT.transcript)}>
                Demo fallback: load this sample’s text instead
              </button>
            )}
          </div>
        </div>
      )}

      <p className="fine-print">
        Text recognition can misread characters (for example 0 and O, or ₹ and 2). You will be able to review and
        correct the extracted text before it is analysed. JaalBreak does not judge whether a receipt or payment
        screenshot is genuine — check your own bank or UPI app for that.
      </p>
    </div>
  );
}
