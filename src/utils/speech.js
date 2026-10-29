// Read aloud with the browser's built-in voices (Web Speech API).
// Nothing is sent anywhere by JaalBreak. Which languages are available depends
// on the device: most Android phones have English and Hindi; Kannada needs the
// Google Text-to-speech Kannada voice installed.

export function speechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
}

export function findVoice(voiceLang) {
  if (!speechSupported()) return null;
  const want = voiceLang.toLowerCase();
  const base = want.split('-')[0];
  const voices = window.speechSynthesis.getVoices() || [];
  return voices.find((v) => v.lang.toLowerCase() === want) || voices.find((v) => v.lang.toLowerCase().startsWith(base)) || null;
}

export function speak(text, voiceLang, { onEnd } = {}) {
  if (!speechSupported()) return false;
  window.speechSynthesis.cancel();
  const u = new window.SpeechSynthesisUtterance(text);
  u.lang = voiceLang;
  const voice = findVoice(voiceLang);
  if (voice) u.voice = voice;
  u.rate = 0.92;
  if (onEnd) {
    u.onend = onEnd;
    u.onerror = onEnd;
  }
  window.speechSynthesis.speak(u);
  return true;
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel();
}
