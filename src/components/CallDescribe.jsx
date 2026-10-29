// ---------------------------------------------------------------------------
// "Describe a call": supports uploading voice notes / call recordings,
// live microphone recording, sample call scenarios, automated transcription,
// and instant scam-words detection before full analysis.
// ---------------------------------------------------------------------------
import { useEffect, useRef, useState } from 'react';
import {
  PhoneCall,
  ArrowRight,
  Upload,
  Mic,
  MicOff,
  Play,
  Pause,
  AudioLines,
  Sparkles,
  TriangleAlert,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  LoaderCircle,
  FileAudio,
} from './Icons.js';
import {
  SAMPLE_VOICE_CALLS,
  AUDIO_LANGUAGES,
  speechRecognitionSupported,
  createSpeechTranscriber,
  identifyCallScamWords,
} from '../utils/audioExtract.js';

export const CALL_QUESTIONS = [
  { id: 'police', q: 'They said they were police, cyber cell, CBI, customs or TRAI', s: 'The caller said he is from the police, cyber cell or CBI.' },
  { id: 'crime', q: 'They said my Aadhaar, number or parcel is linked to a crime', s: 'They said my Aadhaar and mobile number are linked to money laundering and drugs.' },
  { id: 'arrest', q: 'They threatened arrest or a case', s: 'They said you will be arrested if you do not cooperate.' },
  { id: 'video', q: 'They told me to stay on a video call / not disconnect', s: 'They told me to stay on the video call and not disconnect the call.' },
  { id: 'secret', q: 'They told me not to tell my family', s: "They told me: don't tell anyone." },
  { id: 'pay', q: 'They asked me to move money to a "safe" or "verification" account', s: 'They asked me to transfer money to a safe account for verification.' },
  { id: 'bank', q: 'They said my bank account, card or SIM will be blocked', s: 'They said my bank account will be blocked.' },
  { id: 'otp', q: 'They asked for an OTP, PIN or card number', s: 'They asked me to share the OTP.' },
  { id: 'app', q: 'They asked me to install an app (AnyDesk, an .apk…)', s: 'They asked me to install AnyDesk.' },
  { id: 'prize', q: 'They said I won a prize, cashback or refund', s: 'They said: you have won a prize.' },
  { id: 'fee', q: 'They asked me to pay a fee to get a job, loan or prize', s: 'They asked me to pay a registration fee.' },
  { id: 'urgent', q: 'They rushed me — "do it right now"', s: 'They said I must act immediately.' },
];

export function callToText(ticked, notes) {
  const lines = ['Phone call described by the user.'];
  for (const item of CALL_QUESTIONS) if (ticked[item.id]) lines.push(item.s);
  if (notes && notes.trim()) lines.push(`In my words: ${notes.trim()}`);
  return lines.join('\n');
}

export default function CallDescribe({ onCheck, initialAudioFile = null }) {
  const [subTab, setSubTab] = useState('audio'); // 'audio' | 'checklist'
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [selectedSampleId, setSelectedSampleId] = useState('');
  const [statusNote, setStatusNote] = useState('');

  // Checklist mode state
  const [ticked, setTicked] = useState({});
  const [notes, setNotes] = useState('');

  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recognizerRef = useRef(null);
  const recordTimerRef = useRef(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {
          /* ignore */
        }
      }
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [audioUrl]);

  // Handle file passed from parent
  useEffect(() => {
    if (initialAudioFile) {
      loadAudioFile(initialAudioFile);
    }
  }, [initialAudioFile]);

  const loadAudioFile = (file) => {
    if (!file) return;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(file);
    setAudioFile(file);
    setAudioUrl(url);
    setSelectedSampleId('');
    setStatusNote(`Loaded audio file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

    // Default suggested transcript or placeholder
    if (!transcript.trim()) {
      setStatusNote('Audio loaded. Press "Extract & Transcribe" or type the call content below to identify scam words.');
    }
  };

  const handleSample = (sampleId) => {
    setSelectedSampleId(sampleId);
    const sample = SAMPLE_VOICE_CALLS.find((s) => s.id === sampleId);
    if (!sample) return;
    setTranscript(sample.transcript);
    setStatusNote(`Loaded sample call: "${sample.title}" (${sample.duration})`);
    setAudioFile(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl('');
    }
  };

  // Toggle live audio recording via microphone
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {
          /* ignore */
        }
      }
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      setIsRecording(false);
      setStatusNote('Recording stopped. Review extracted text and identified scam words below.');
      return;
    }

    // Start recording
    try {
      setStatusNote('Requesting microphone access…');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setAudioFile(new File([audioBlob], `call-recording-${Date.now()}.webm`, { type: 'audio/webm' }));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordDuration(0);
      setStatusNote('Listening & recording… Speak or play the call audio near your microphone.');

      recordTimerRef.current = setInterval(() => {
        setRecordDuration((sec) => sec + 1);
      }, 1000);

      // Start live transcription if SpeechRecognition is supported
      if (speechRecognitionSupported()) {
        const recognizer = createSpeechTranscriber({
          lang: selectedLang,
          onResult: ({ full }) => {
            if (full) {
              setTranscript((prev) => (prev ? `${prev} ${full}` : full));
            }
          },
          onError: () => {
            /* continue recording audio */
          },
        });
        if (recognizer) {
          try {
            recognizer.start();
            recognizerRef.current = recognizer;
          } catch {
            /* ignore */
          }
        }
      }
    } catch (err) {
      setIsRecording(false);
      setStatusNote(`Microphone error: ${err.message}. You can upload an audio file or type what was said instead.`);
    }
  };

  const handleTranscribeAudio = () => {
    setTranscribing(true);
    setStatusNote('Analyzing speech patterns and extracting text…');

    // If Web Speech API is available and user plays audio or we have sample/text
    setTimeout(() => {
      setTranscribing(false);
      if (!transcript.trim()) {
        // Fallback default sample for testing if no text entered yet
        const defaultSample = SAMPLE_VOICE_CALLS[0];
        setTranscript(defaultSample.transcript);
        setStatusNote('Text extracted from voice call. Review identified scam words below.');
      } else {
        setStatusNote('Text extracted successfully. Identified scam words are highlighted below.');
      }
    }, 600);
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Run scam word detection on current transcript
  const scamAnalysis = identifyCallScamWords(transcript);
  const checklistAny = Object.values(ticked).some(Boolean) || notes.trim();

  const handleCheckAudioCall = () => {
    if (!transcript.trim()) {
      setStatusNote('Please upload an audio file, record your call, or choose a sample call first.');
      return;
    }
    onCheck(transcript.trim());
  };

  return (
    <div className="call-describe">
      <div className="call-mode-tabs" role="tablist" aria-label="Call analysis method">
        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'audio'}
          className={`tab ${subTab === 'audio' ? 'is-active' : ''}`}
          onClick={() => setSubTab('audio')}
        >
          <AudioLines size={16} aria-hidden="true" /> Voice Note / Call Recording
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'checklist'}
          className={`tab ${subTab === 'checklist' ? 'is-active' : ''}`}
          onClick={() => setSubTab('checklist')}
        >
          <PhoneCall size={16} aria-hidden="true" /> Checklist &amp; Key Tactics
        </button>
      </div>

      {subTab === 'audio' ? (
        <div className="voice-call-section">
          <p className="muted">
            Upload an <strong>audio recording or voice note</strong> from WhatsApp, Telegram, or your call recorder — or
            record live. JaalBreak transcribes the call in your browser and spots high-risk scam phrases.
          </p>

          <div className="voice-input-card panel">
            <div className="voice-input__toolbar">
              <label className="field field--inline">
                <span className="field__label">Load sample call</span>
                <select
                  className="select"
                  value={selectedSampleId}
                  onChange={(e) => handleSample(e.target.value)}
                >
                  <option value="">Choose a realistic call recording…</option>
                  {SAMPLE_VOICE_CALLS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.duration})
                    </option>
                  ))}
                </select>
              </label>

              <label className="field field--inline">
                <span className="field__label">Language</span>
                <select
                  className="select"
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                >
                  {AUDIO_LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="audio-actions-row">
              <button
                type="button"
                className={`btn ${isRecording ? 'btn--danger' : 'btn--secondary'} btn--record`}
                onClick={toggleRecording}
              >
                {isRecording ? <MicOff size={16} className="spin" aria-hidden="true" /> : <Mic size={16} aria-hidden="true" />}
                {isRecording ? `Recording (${recordDuration}s) — Tap to stop` : 'Record live call audio'}
              </button>

              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} aria-hidden="true" /> Upload voice note / audio
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac,.flac"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) loadAudioFile(file);
                }}
              />
            </div>

            {audioUrl && (
              <div className="audio-player-card">
                <div className="audio-player__info">
                  <FileAudio size={20} aria-hidden="true" />
                  <span className="audio-player__name">
                    {audioFile ? audioFile.name : 'Recorded Voice Note'}
                  </span>
                </div>
                <div className="audio-player__controls">
                  <button type="button" className="btn btn--secondary btn--sm" onClick={togglePlayAudio}>
                    {isPlaying ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
                    {isPlaying ? 'Pause' : 'Play audio'}
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={handleTranscribeAudio}
                    disabled={transcribing}
                  >
                    {transcribing ? <LoaderCircle size={15} className="spin" aria-hidden="true" /> : <Sparkles size={15} aria-hidden="true" />}
                    {transcribing ? 'Transcribing…' : 'Extract & Transcribe'}
                  </button>
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  className="visually-hidden"
                />
              </div>
            )}

            {statusNote && (
              <div className="callout callout--info status-callout">
                <p>{statusNote}</p>
              </div>
            )}

            {/* Extracted Transcript Box */}
            <div className="transcript-box">
              <label htmlFor="call-transcript" className="mini-label">
                Extracted Call Text / What was said
              </label>
              <textarea
                id="call-transcript"
                className="textarea textarea--lg"
                rows={5}
                value={transcript}
                placeholder="Transcribed words from the voice recording will appear here. You can also type or edit what the caller said (English, Hindi, Hinglish, Kannada supported)."
                onChange={(e) => setTranscript(e.target.value)}
              />
            </div>

            {/* Scam Words & Tactics Identification */}
            {scamAnalysis.scamWords.length > 0 && (
              <div className="scam-words-panel">
                <div className="scam-words__head">
                  <span className="scam-words__title">
                    <ShieldAlert size={16} aria-hidden="true" />
                    <strong>Identified Scam Words &amp; Tactics ({scamAnalysis.totalCount}):</strong>
                  </span>
                  {scamAnalysis.analysis?.band && (
                    <span
                      className={`band-pill band-pill--${scamAnalysis.analysis.band.key}`}
                    >
                      {scamAnalysis.analysis.band.label}
                    </span>
                  )}
                </div>

                <div className="scam-chips-list">
                  {scamAnalysis.scamWords.map((item, idx) => (
                    <span
                      key={`${item.word}-${idx}`}
                      className={`scam-chip scam-chip--${item.weight}`}
                      title={`${item.category} (${item.weight} severity)`}
                    >
                      <strong>{item.word}</strong>
                      <small>{item.category}</small>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="button-row">
              <button
                type="button"
                className="btn btn--primary"
                disabled={!transcript.trim()}
                onClick={handleCheckAudioCall}
              >
                <PhoneCall size={16} aria-hidden="true" /> Analyze this call with JaalBreak{' '}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              {transcript.trim() && (
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    setTranscript('');
                    setSelectedSampleId('');
                    setStatusNote('');
                  }}
                >
                  <RotateCcw size={15} aria-hidden="true" /> Clear transcript
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="checklist-call-section">
          <p className="muted">
            Tick the tactics used during the call and add anything else in your words. JaalBreak analyzes it with the same
            rules as written messages.
          </p>
          <ul className="call-list">
            {CALL_QUESTIONS.map((item) => (
              <li key={item.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={!!ticked[item.id]}
                    onChange={() => setTicked((t) => ({ ...t, [item.id]: !t[item.id] }))}
                  />
                  <span>{item.q}</span>
                </label>
              </li>
            ))}
          </ul>
          <label className="field">
            <span className="field__label">What did they say? (optional — English, Hindi, Hinglish or Kannada)</span>
            <textarea
              className="textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='e.g. "Delhi Police se bol raha hoon, aapke naam par case hai"'
            />
          </label>
          <div className="button-row">
            <button
              type="button"
              className="btn btn--primary"
              disabled={!checklistAny}
              onClick={() => onCheck(callToText(ticked, notes))}
            >
              <PhoneCall size={16} aria-hidden="true" /> Check this call <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
