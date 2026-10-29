// ---------------------------------------------------------------------------
// Audio and Voice Recording Extraction & Scam Words Analysis
// ---------------------------------------------------------------------------
import { analyzeMessage } from './analyzer.js';

export const SAMPLE_VOICE_CALLS = [
  {
    id: 'digital-arrest',
    title: 'Digital Arrest / Police Impersonation Call',
    channel: 'Video / Phone Call',
    duration: '0:42',
    transcript:
      'This is Inspector Sharma from Cyber Crime Branch Mumbai. Your Aadhaar card is linked to a 38 crore money laundering case. Do not disconnect the video call, stay on the line. You are under digital arrest. Transfer ₹50,000 to the RBI safe verification account immediately or police will reach your house in 2 hours.',
    sampleAudioText: 'Police threat, digital arrest, money laundering, safe account demand',
  },
  {
    id: 'bank-kyc-call',
    title: 'Bank KYC & Account Block Warning Call',
    channel: 'Incoming Phone Call',
    duration: '0:35',
    transcript:
      'Hello, I am calling from Meridian Bank customer care. Your bank account and debit card will be permanently blocked tonight because your KYC is pending. I have sent a 6-digit OTP to your mobile. Please share your OTP immediately to verify your account and stop the blockage.',
    sampleAudioText: 'Bank block threat, urgent KYC, OTP request over phone',
  },
  {
    id: 'job-fee-call',
    title: 'Job Offer Letter & Registration Fee Call',
    channel: 'WhatsApp Audio Call',
    duration: '0:28',
    transcript:
      'Congratulations! You have been selected for the Data Analyst position at Nexora Global. Your monthly salary will be ₹45,000. To release your offer letter and courier your work laptop, pay ₹2,500 registration fee right now on our official UPI. Seats are limited.',
    sampleAudioText: 'Fake employment offer, deposit fee demand via UPI',
  },
  {
    id: 'lottery-tax-call',
    title: 'Lottery Prize / Customs Clearance Call',
    channel: 'Unknown Mobile Number',
    duration: '0:31',
    transcript:
      'Congratulations! Your number was selected for the lucky draw prize of 25 lakh rupees. Before releasing the funds into your bank account, you must pay government tax and processing charges of Rs.1,500. Transfer the amount now to avoid losing your prize.',
    sampleAudioText: 'Lure of large prize money, upfront fee/tax demand',
  },
];

export const AUDIO_LANGUAGES = [
  { value: 'en-IN', label: 'English (India)' },
  { value: 'hi-IN', label: 'Hindi (हिंदी)' },
  { value: 'kn-IN', label: 'Kannada (ಕನ್ನಡ)' },
  { value: 'en-US', label: 'English (US / Global)' },
];

/** Check if Web Speech Recognition API is supported in this browser. */
export function speechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Creates a SpeechRecognition instance for transcribing audio from mic or audio playback.
 */
export function createSpeechTranscriber({
  lang = 'en-IN',
  onResult,
  onError,
  onEnd,
  continuous = true,
} = {}) {
  if (!speechRecognitionSupported()) return null;
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognizer = new SpeechRec();
  recognizer.lang = lang;
  recognizer.continuous = continuous;
  recognizer.interimResults = true;
  recognizer.maxAlternatives = 1;

  recognizer.onresult = (event) => {
    let finalTranscript = '';
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }
    if (onResult) {
      onResult({
        final: finalTranscript.trim(),
        interim: interimTranscript.trim(),
        full: (finalTranscript + interimTranscript).trim(),
      });
    }
  };

  recognizer.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognizer.onend = () => {
    if (onEnd) onEnd();
  };

  return recognizer;
}

/**
 * High-risk scam keyword definitions commonly used over phone / video calls.
 */
const SCAM_WORD_PATTERNS = [
  { word: 'digital arrest', category: 'Authority / Arrest threat', weight: 'high' },
  { word: 'cyber crime branch', category: 'Police / Agency impersonation', weight: 'high' },
  { word: 'cbi', category: 'Police / Agency impersonation', weight: 'high' },
  { word: 'police', category: 'Police / Agency impersonation', weight: 'medium' },
  { word: 'trai', category: 'Authority impersonation', weight: 'medium' },
  { word: 'money laundering', category: 'Criminal intimidation', weight: 'high' },
  { word: 'safe account', category: 'Fund transfer trap', weight: 'high' },
  { word: 'verification account', category: 'Fund transfer trap', weight: 'high' },
  { word: 'video call', category: 'Surveillance / Isolation', weight: 'medium' },
  { word: 'do not disconnect', category: 'Isolation pressure', weight: 'high' },
  { word: 'not tell anyone', category: 'Secrecy tactic', weight: 'high' },
  { word: 'share your otp', category: 'Credential theft', weight: 'high' },
  { word: 'otp', category: 'Credential verification', weight: 'high' },
  { word: 'pin', category: 'Credential verification', weight: 'high' },
  { word: 'cvv', category: 'Credential verification', weight: 'high' },
  { word: 'account blocked', category: 'Service suspension threat', weight: 'high' },
  { word: 'sim blocked', category: 'Service suspension threat', weight: 'high' },
  { word: 'permanently blocked', category: 'Service suspension threat', weight: 'high' },
  { word: 'kyc update', category: 'Phishing pretext', weight: 'medium' },
  { word: 'anydesk', category: 'Remote access tool', weight: 'high' },
  { word: 'teamviewer', category: 'Remote access tool', weight: 'high' },
  { word: 'registration fee', category: 'Advance fee fraud', weight: 'high' },
  { word: 'security deposit', category: 'Advance fee fraud', weight: 'high' },
  { word: 'processing fee', category: 'Advance fee fraud', weight: 'high' },
  { word: 'processing charges', category: 'Advance fee fraud', weight: 'high' },
  { word: 'lucky draw', category: 'Prize lure', weight: 'high' },
  { word: 'won', category: 'Prize lure', weight: 'medium' },
  { word: 'prize', category: 'Prize lure', weight: 'medium' },
  { word: 'immediately', category: 'Urgency pressure', weight: 'medium' },
  { word: 'within 24 hours', category: 'Urgency pressure', weight: 'medium' },
  { word: 'right now', category: 'Urgency pressure', weight: 'medium' },
];

/**
 * Analyzes audio transcript text:
 * 1. Runs full JaalBreak analyzer for deterministic scam detection
 * 2. Highlights specific call scam words and categorized tactics
 */
export function identifyCallScamWords(transcriptText) {
  if (!transcriptText || !transcriptText.trim()) {
    return {
      analysis: null,
      scamWords: [],
      highRiskCount: 0,
      totalCount: 0,
    };
  }

  const analysis = analyzeMessage(transcriptText, { source: 'call' });
  const textLower = transcriptText.toLowerCase();

  const foundScamWords = [];
  const seenWords = new Set();

  for (const item of SCAM_WORD_PATTERNS) {
    if (textLower.includes(item.word) && !seenWords.has(item.word)) {
      seenWords.add(item.word);
      foundScamWords.push({
        word: item.word,
        category: item.category,
        weight: item.weight,
      });
    }
  }

  // Also include exact quotes from the analyzer's verified signals
  for (const signal of analysis.signals) {
    const qLower = signal.quote.toLowerCase();
    if (!seenWords.has(qLower)) {
      seenWords.add(qLower);
      foundScamWords.push({
        word: signal.quote,
        category: signal.tacticLabel,
        weight: signal.severity >= 3 ? 'high' : signal.severity === 2 ? 'medium' : 'low',
      });
    }
  }

  return {
    analysis,
    scamWords: foundScamWords,
    highRiskCount: foundScamWords.filter((w) => w.weight === 'high').length,
    totalCount: foundScamWords.length,
  };
}
