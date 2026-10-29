// Big, plain-language verdict at the top of every result, with Read aloud,
// Ask family and Report. Designed for people who will not read the evidence table.
import { useEffect, useState } from 'react';
import { Volume2, VolumeX, Users, Flag, ShieldAlert, TriangleAlert, ShieldCheck, Phone } from './Icons.js';
import { SPEECH_LANGS, plainVerdict, spokenVerdict, familyMessage } from '../data/plainLanguage.js';
import { speak, stopSpeaking, speechSupported, findVoice } from '../utils/speech.js';
import CopyButton from './CopyButton.jsx';

const LANG_KEY = 'jaalbreak.lang.v1';
function loadLang() {
  try {
    const v = window.localStorage.getItem(LANG_KEY);
    return SPEECH_LANGS.some((l) => l.code === v) ? v : 'en';
  } catch {
    return 'en';
  }
}

const ICON = { high: ShieldAlert, medium: TriangleAlert, low: ShieldCheck };

export default function PlainVerdict({ result, onReport }) {
  const [lang, setLang] = useState(loadLang);
  const [speaking, setSpeaking] = useState(false);
  const [voiceNote, setVoiceNote] = useState('');
  const [includeMessage, setIncludeMessage] = useState(false);
  const v = plainVerdict(result, lang);
  const band = result.band.key;
  const Icon = ICON[band] || ShieldCheck;
  const voiceLang = SPEECH_LANGS.find((l) => l.code === lang)?.voice || 'en-IN';

  useEffect(() => {
    try {
      window.localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* private mode: ignore */
    }
  }, [lang]);
  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => {
    stopSpeaking();
    setSpeaking(false);
    setVoiceNote('');
  }, [result, lang]);

  const toggleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    if (!speechSupported()) {
      setVoiceNote('Read aloud is not available in this browser.');
      return;
    }
    if (lang !== 'en' && !findVoice(voiceLang)) {
      setVoiceNote(
        lang === 'kn'
          ? 'No Kannada voice on this device. On Android: Settings → Text-to-speech → Google → install Kannada.'
          : 'No Hindi voice on this device. On Android: Settings → Text-to-speech → Google → install Hindi.'
      );
    }
    setSpeaking(speak(spokenVerdict(result, lang), voiceLang, { onEnd: () => setSpeaking(false) }));
  };

  const familyText = familyMessage(result, lang, includeMessage);
  const waUrl = `https://wa.me/?text=${encodeURIComponent(familyText)}`;

  return (
    <div className={`plain-verdict plain-verdict--${band}`} lang={lang === 'en' ? undefined : lang}>
      <div className="plain-verdict__top">
        <Icon size={34} aria-hidden="true" className="plain-verdict__icon" />
        <div>
          <p className="plain-verdict__heading">{v.heading}</p>
          <p className="plain-verdict__type">
            {v.typeLabel}: <strong>{v.category}</strong>
          </p>
        </div>
      </div>
      <ul className="plain-verdict__actions">
        {v.actions.map((a) => (
          <li key={a}>{a}</li>
        ))}
        <li className="plain-verdict__lost">
          <Phone size={15} aria-hidden="true" /> <a href="tel:1930">{v.lost}</a>
        </li>
      </ul>

      <div className="plain-verdict__tools">
        <div className="lang-switch" role="group" aria-label="Language">
          {SPEECH_LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`lang-switch__btn ${lang === l.code ? 'is-active' : ''}`}
              aria-pressed={lang === l.code}
              onClick={() => setLang(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn--secondary" onClick={toggleSpeak}>
          {speaking ? <VolumeX size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
          {speaking ? 'Stop' : 'Read aloud'}
        </button>
        <a className="btn btn--secondary" href={waUrl} target="_blank" rel="noopener noreferrer">
          <Users size={16} aria-hidden="true" /> Ask family on WhatsApp
        </a>
        {band !== 'low' && (
          <button type="button" className="btn btn--primary" onClick={onReport}>
            <Flag size={16} aria-hidden="true" /> Report this scam
          </button>
        )}
      </div>
      <div className="plain-verdict__family">
        <label className="checkbox-inline">
          <input type="checkbox" checked={includeMessage} onChange={(e) => setIncludeMessage(e.target.checked)} />
          <span>Include the message text when I ask family</span>
        </label>
        <CopyButton getText={() => familyText} label="Copy text for family" />
      </div>
      {voiceNote && <p className="plain-verdict__note">{voiceNote}</p>}
    </div>
  );
}
