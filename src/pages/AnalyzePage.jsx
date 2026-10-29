import { useRef, useState } from 'react';
import { ScanSearch, Image as ImageIcon, TriangleAlert, Info, ArrowRight, QrCode, FileUp, PhoneCall, LoaderCircle, Sparkles } from '../components/Icons.js';
import CallDescribe from '../components/CallDescribe.jsx';
import { detectInputKind, INPUT_KINDS } from '../utils/inputDetect.js';
import { qrToText } from '../utils/upiCheck.js';
import { decodeQrFromFile, extractPdfText } from '../utils/fileReaders.js';

const KIND_HELP = {
  link: 'We will check the address itself. JaalBreak never opens the link.',
  upi: 'We will check the UPI ID. Your UPI app shows the registered name before you pay — always read it.',
  'upi-qr': 'This is a UPI payment code: it sends money from you.',
  email: 'We will compare the sender name with the real address and check the content.',
};
import PageHeader from '../components/PageHeader.jsx';
import ScreenshotOcr from '../components/ScreenshotOcr.jsx';
import ResultSummary from '../components/ResultSummary.jsx';
import { SAMPLE_MESSAGES } from '../data/sampleMessages.js';
import { MAX_INPUT_LENGTH } from '../utils/analyzer.js';

export default function AnalyzePage({ draft, setDraft, analysis, onAnalyze, onClear, simple = false }) {
  const [tab, setTab] = useState('text');
  const [error, setError] = useState('');
  const [sampleId, setSampleId] = useState('');
  const resultsRef = useRef(null);
  const textRef = useRef(null);
  const fileRef = useRef(null);
  const [fileBusy, setFileBusy] = useState('');
  const [pendingImage, setPendingImage] = useState(null);
  const [pendingAudio, setPendingAudio] = useState(null);
  const kind = detectInputKind(draft.text);

  const showResults = () => setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);

  // Smart file handling: PDF -> text layer; image -> QR first, otherwise OCR; audio -> voice call analyzer.
  const handleFile = async (file, preferred) => {
    if (!file) return;
    setError('');
    try {
      if (file.type.startsWith('audio/') || /\.(mp3|wav|m4a|ogg|webm|aac|flac)$/i.test(file.name)) {
        setPendingAudio(file);
        setTab('call');
        return;
      }
      if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
        setFileBusy('Reading the PDF…');
        const { text, pages } = await extractPdfText(file);
        if (!text) {
          setError('This PDF has no readable text (it is probably a scanned image). Take a screenshot of the page and use the Screenshot tab.');
          return;
        }
        setDraft({ text: text.slice(0, MAX_INPUT_LENGTH), source: 'pdf', ocrConfidence: null });
        setTab('text');
        if (pages > 6) setError('Only the first 6 pages were read.');
        return;
      }
      if (file.type.startsWith('image/')) {
        setFileBusy('Looking for a QR code…');
        const payload = await decodeQrFromFile(file);
        if (payload) {
          const text = qrToText(payload);
          setDraft({ text, source: 'qr', ocrConfidence: null });
          setTab('text');
          onAnalyze(text, 'qr');
          showResults();
          return;
        }
        if (preferred === 'qr') {
          setError('No QR code found in this image. Try a sharper, closer picture — or use the Screenshot tab to read the text.');
          return;
        }
        setPendingImage(file);
        setTab('image');
        return;
      }
      setError('Choose an image (PNG, JPG, WebP), a PDF offer letter, or a voice recording (MP3, WAV, M4A).');
    } catch (e) {
      setError(`Could not read this file: ${e.message}`);
    } finally {
      setFileBusy('');
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleAnalyze = () => {
    if (!draft.text.trim()) {
      setError('The message box is empty. Paste a message, choose a sample, or extract text from a screenshot.');
      textRef.current?.focus();
      return;
    }
    try {
      onAnalyze(draft.text, draft.source);
      setError('');
      showResults();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSample = (id) => {
    setSampleId(id);
    const sample = SAMPLE_MESSAGES.find((m) => m.id === id);
    if (sample) {
      setDraft({ text: sample.text, source: 'sample', ocrConfidence: null });
      setError('');
    }
  };

  const handleClear = () => {
    setSampleId('');
    setError('');
    onClear();
    textRef.current?.focus();
  };

  const handleExtracted = (text, confidence) => {
    setDraft({ text, source: 'screenshot', ocrConfidence: confidence });
    setTab('text');
    setError('');
    setTimeout(() => textRef.current?.focus(), 50);
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Message Analysis"
        title="Inspect a suspicious message"
        lede="Paste a message, link, UPI ID or email — or check a screenshot, QR code, offer letter PDF or a phone call. Everything runs in your browser and the same input always gives the same result."
      />

      <section className="panel analyze-input">
        <div className="tabs" role="tablist" aria-label="Input method">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'text'}
            className={`tab ${tab === 'text' ? 'is-active' : ''}`}
            onClick={() => setTab('text')}
          >
            <ScanSearch size={16} aria-hidden="true" /> Paste text
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'image'}
            className={`tab ${tab === 'image' ? 'is-active' : ''}`}
            onClick={() => setTab('image')}
          >
            <ImageIcon size={16} aria-hidden="true" /> Screenshot (OCR)
          </button>
          {[
            ['qr', QrCode, 'QR code'],
            ['pdf', FileUp, 'Offer letter / PDF'],
            ['call', PhoneCall, 'Describe a call'],
          ].map(([id, Icon, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`tab ${tab === id ? 'is-active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={16} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>

        {tab === 'text' ? (
          <div className="analyze-input__body" role="tabpanel">
            <div className="analyze-input__toolbar">
              <label className="field field--inline">
                <span className="field__label">Load a sample</span>
                <select className="select" value={sampleId} onChange={(e) => handleSample(e.target.value)}>
                  <option value="">Choose a sample message…</option>
                  {SAMPLE_MESSAGES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>
              <span className="fine-print">All samples are fictional.</span>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => fileRef.current?.click()} disabled={!!fileBusy}>
                {fileBusy ? <LoaderCircle size={15} className="spin" aria-hidden="true" /> : <FileUp size={15} aria-hidden="true" />}
                {fileBusy || 'Add screenshot, QR, PDF or voice note'}
              </button>
              <input ref={fileRef} type="file" accept="image/*,application/pdf,.pdf,audio/*,.mp3,.wav,.m4a,.ogg,.webm" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
            {kind !== 'message' && draft.text.trim() && (
              <div className="kind-chip" role="status">
                <Sparkles size={15} aria-hidden="true" /> Detected: <strong>{INPUT_KINDS[kind]}</strong> — {KIND_HELP[kind]}
              </div>
            )}
            {draft.source === 'pdf' && draft.text && (
              <div className="callout callout--info">
                <Info size={18} aria-hidden="true" />
                <p><strong>Text taken from your PDF.</strong> The file never left your device. Check it below, then analyse.</p>
              </div>
            )}

            {draft.source === 'screenshot' && draft.text && (
              <div className="callout callout--info">
                <Info size={18} aria-hidden="true" />
                <p>
                  <strong>Text extracted from your screenshot.</strong> OCR can misread words and numbers
                  {typeof draft.ocrConfidence === 'number' ? ` (engine confidence ${draft.ocrConfidence}/100)` : ''}.
                  Review and correct it below before analysing.
                </p>
              </div>
            )}

            <label htmlFor="message-input" className="visually-hidden">
              Message to analyse
            </label>
            <textarea
              id="message-input"
              ref={textRef}
              className="textarea textarea--lg"
              rows={9}
              maxLength={MAX_INPUT_LENGTH}
              value={draft.text}
              placeholder="Paste a message, a link, a UPI ID or an email (with its From: line). English, Hindi, Hinglish and Kannada (beta) are supported."
              onChange={(e) => {
                setDraft({ ...draft, text: e.target.value });
                if (error) setError('');
              }}
              aria-invalid={!!error}
              aria-describedby="message-help"
            />
            <div className="input-meta" id="message-help">
              {error ? (
                <span className="field-error" role="alert">
                  <TriangleAlert size={14} aria-hidden="true" /> {error}
                </span>
              ) : (
                <span className="fine-print">Never paste an OTP, PIN, password or CVV. Your message never leaves your browser.</span>
              )}
              <span className={`counter ${draft.text.length > MAX_INPUT_LENGTH * 0.9 ? 'counter--warn' : ''}`}>
                {draft.text.length.toLocaleString('en-IN')} / {MAX_INPUT_LENGTH.toLocaleString('en-IN')} characters
              </span>
            </div>
            <div className="button-row">
              <button type="button" className="btn btn--primary" onClick={handleAnalyze}>
                Analyze <ArrowRight size={16} aria-hidden="true" />
              </button>
              <button type="button" className="btn btn--secondary" onClick={handleClear}>
                Clear
              </button>
            </div>
          </div>
        ) : tab === 'image' ? (
          <div className="analyze-input__body" role="tabpanel">
            {pendingImage && <p className="fine-print">No QR code in that image — reading its text instead.</p>}
            <ScreenshotOcr
              initialFile={pendingImage}
              onExtracted={handleExtracted}
              onUseTranscript={(text) => handleExtracted(text, null)}
            />
          </div>
        ) : tab === 'call' ? (
          <div className="analyze-input__body" role="tabpanel">
            <CallDescribe
              initialAudioFile={pendingAudio}
              onCheck={(text) => {
                setDraft({ text, source: 'call', ocrConfidence: null });
                onAnalyze(text, 'call');
                showResults();
              }}
            />
          </div>
        ) : (
          <div className="analyze-input__body" role="tabpanel">
            <FileDrop
              kind={tab}
              busy={fileBusy}
              error={error}
              onFile={(f) => handleFile(f, tab)}
            />
          </div>
        )}
      </section>

      <div ref={resultsRef} className="scroll-anchor">
        {analysis ? (
          <ResultSummary result={analysis} simple={simple} />
        ) : (
          <div className="placeholder-results">
            <p className="eyebrow">Results</p>
            <p className="muted">
              Your assessment, the exact evidence from your message, and recommended next steps will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FileDrop({ kind, busy, error, onFile }) {
  const isQr = kind === 'qr';
  return (
    <div className="file-drop">
      <p className="muted">
        {isQr
          ? 'Upload a photo or screenshot of a QR code someone sent you. JaalBreak decodes it on your device and shows exactly where the money or link goes — before you scan it in a payment app.'
          : 'Upload a job offer letter, invoice or notice as a PDF. JaalBreak reads its text on your device and checks it for fees, deposits, fake HR emails and other red flags.'}
      </p>
      <label className="file-drop__zone">
        {busy ? <LoaderCircle size={22} className="spin" aria-hidden="true" /> : isQr ? <QrCode size={22} aria-hidden="true" /> : <FileUp size={22} aria-hidden="true" />}
        <span>{busy || (isQr ? 'Choose a QR image' : 'Choose a PDF')}</span>
        <input type="file" accept={isQr ? 'image/*' : 'application/pdf,.pdf'} hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      {error && (
        <span className="field-error" role="alert">
          <TriangleAlert size={14} aria-hidden="true" /> {error}
        </span>
      )}
      <p className="fine-print">The file never leaves your device.</p>
    </div>
  );
}
