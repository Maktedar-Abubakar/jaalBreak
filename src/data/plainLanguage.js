// ---------------------------------------------------------------------------
// Plain-language verdict text in English, Hindi and Kannada.
// Used by the big plain verdict card, "Read aloud" and "Ask family".
// Fixed text. The Kannada lines are BETA — listed in KANNADA_REVIEW.md for a
// fluent speaker to check.
// ---------------------------------------------------------------------------

export const SPEECH_LANGS = [
  { code: 'en', label: 'English', voice: 'en-IN' },
  { code: 'hi', label: 'हिन्दी', voice: 'hi-IN' },
  { code: 'kn', label: 'ಕನ್ನಡ', voice: 'kn-IN' },
];

const T = {
  en: {
    heading: {
      high: 'Likely a scam — stop here.',
      medium: 'Warning signs found — check before you do anything.',
      low: 'No known scam pattern found — that does not make it safe.',
    },
    type: 'Type',
    donts: ["Don't click the link.", "Don't share any OTP, PIN or password.", "Don't pay, and don't call the number in the message."],
    lowNote: 'If it asks for money, an OTP or a click, still check through the official app or number.',
    lost: 'If money is already gone, call 1930 now.',
    family: (h, c, flags) =>
      `Hi, I got a message and checked it on JaalBreak. It says: "${h}" (${c}).${flags ? ` Warning signs: ${flags}.` : ''} I have not clicked anything or shared any OTP. Can you check with me before I do anything?`,
  },
  hi: {
    heading: {
      high: 'यह स्कैम (धोखाधड़ी) लगता है — यहीं रुकिए।',
      medium: 'चेतावनी के संकेत मिले — कुछ भी करने से पहले जांच लें।',
      low: 'कोई जाना-पहचाना स्कैम पैटर्न नहीं मिला — इसका मतलब यह नहीं कि यह सुरक्षित है।',
    },
    type: 'प्रकार',
    donts: ['लिंक पर क्लिक न करें।', 'OTP, PIN या पासवर्ड किसी को न बताएं।', 'पैसे न भेजें, और मैसेज में दिए नंबर पर कॉल न करें।'],
    lowNote: 'अगर यह पैसे, OTP या क्लिक मांगता है, तो भी ऑफिशियल ऐप या नंबर से जांच लें।',
    lost: 'अगर पैसे कट चुके हैं, तो तुरंत 1930 पर कॉल करें।',
    family: (h, c, flags) =>
      `नमस्ते, मुझे एक मैसेज आया है और मैंने उसे JaalBreak पर जांचा। यह कहता है: "${h}" (${c})।${flags ? ` चेतावनी के संकेत: ${flags}।` : ''} मैंने कुछ भी क्लिक नहीं किया है और कोई OTP नहीं बताया है। कुछ भी करने से पहले क्या आप मेरे साथ जांच सकते हैं?`,
  },
  kn: {
    heading: {
      high: 'ಇದು ವಂಚನೆ (ಸ್ಕ್ಯಾಮ್) ಇರಬಹುದು — ಇಲ್ಲೇ ನಿಲ್ಲಿಸಿ.',
      medium: 'ಎಚ್ಚರಿಕೆಯ ಸೂಚನೆಗಳು ಕಂಡುಬಂದಿವೆ — ಏನಾದರೂ ಮಾಡುವ ಮೊದಲು ಪರಿಶೀಲಿಸಿ.',
      low: 'ಯಾವುದೇ ಪರಿಚಿತ ವಂಚನೆಯ ಮಾದರಿ ಕಂಡುಬಂದಿಲ್ಲ — ಅದರರ್ಥ ಇದು ಸುರಕ್ಷಿತ ಎಂದಲ್ಲ.',
    },
    type: 'ಪ್ರಕಾರ',
    donts: ['ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ.', 'OTP, PIN ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ಯಾರಿಗೂ ಹೇಳಬೇಡಿ.', 'ಹಣ ಕಳುಹಿಸಬೇಡಿ, ಸಂದೇಶದಲ್ಲಿರುವ ನಂಬರ್‌ಗೆ ಕರೆ ಮಾಡಬೇಡಿ.'],
    lowNote: 'ಇದು ಹಣ, OTP ಅಥವಾ ಕ್ಲಿಕ್ ಕೇಳಿದರೆ, ಅಧಿಕೃತ ಆಪ್ ಅಥವಾ ನಂಬರ್ ಮೂಲಕ ಪರಿಶೀಲಿಸಿ.',
    lost: 'ಹಣ ಈಗಾಗಲೇ ಹೋಗಿದ್ದರೆ, ತಕ್ಷಣ 1930 ಗೆ ಕರೆ ಮಾಡಿ.',
    family: (h, c, flags) =>
      `ನಮಸ್ಕಾರ, ನನಗೆ ಒಂದು ಸಂದೇಶ ಬಂದಿದೆ, ಅದನ್ನು JaalBreak ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿದೆ. ಅದು ಹೇಳುತ್ತದೆ: "${h}" (${c}).${flags ? ` ಎಚ್ಚರಿಕೆಯ ಸೂಚನೆಗಳು: ${flags}.` : ''} ನಾನು ಏನನ್ನೂ ಕ್ಲಿಕ್ ಮಾಡಿಲ್ಲ, ಯಾವ OTP ಯನ್ನೂ ಹೇಳಿಲ್ಲ. ಏನಾದರೂ ಮಾಡುವ ಮೊದಲು ನನ್ನ ಜೊತೆ ಪರಿಶೀಲಿಸುತ್ತೀರಾ?`,
  },
};

const CATEGORY = {
  hi: {
    bank_kyc: 'बैंक / KYC बंद होने का झांसा',
    job_fee: 'नौकरी या इंटर्नशिप के लिए फीस',
    delivery_fee: 'पार्सल / कस्टम फीस',
    family_emergency: 'परिवार के सदस्य के नाम पर धोखा',
    prize_reward: 'इनाम, रिफंड या पॉइंट्स का झांसा',
    investment_task: 'निवेश या टास्क से कमाई का झांसा',
    authority_threat: 'पुलिस / सरकारी धमकी (डिजिटल अरेस्ट)',
    tech_support: 'रिमोट ऐप / टेक सपोर्ट धोखा',
    utility_bill: 'बिजली कनेक्शन कटने का झांसा',
    blackmail: 'ब्लैकमेल',
    account_takeover: 'सोशल मीडिया अकाउंट हैक करने की कोशिश',
    fake_challan: 'नकली ट्रैफिक ई-चालान',
    fake_loan: 'नकली लोन या पैसे जमा होने का झांसा',
    general: 'सामान्य संदिग्ध मैसेज',
    unclassified: 'कोई खास पैटर्न नहीं',
  },
  kn: {
    bank_kyc: 'ಬ್ಯಾಂಕ್ / KYC ಬ್ಲಾಕ್ ಆಗುವ ವಂಚನೆ',
    job_fee: 'ಉದ್ಯೋಗ ಅಥವಾ ಇಂಟರ್ನ್‌ಶಿಪ್ ಶುಲ್ಕದ ವಂಚನೆ',
    delivery_fee: 'ಪಾರ್ಸೆಲ್ / ಕಸ್ಟಮ್ಸ್ ಶುಲ್ಕದ ವಂಚನೆ',
    family_emergency: 'ಕುಟುಂಬದವರ ಹೆಸರಿನಲ್ಲಿ ವಂಚನೆ',
    prize_reward: 'ಬಹುಮಾನ, ರಿಫಂಡ್ ಅಥವಾ ಪಾಯಿಂಟ್ಸ್ ವಂಚನೆ',
    investment_task: 'ಹೂಡಿಕೆ ಅಥವಾ ಟಾಸ್ಕ್ ಗಳಿಕೆ ವಂಚನೆ',
    authority_threat: 'ಪೊಲೀಸ್ / ಸರ್ಕಾರಿ ಬೆದರಿಕೆ (ಡಿಜಿಟಲ್ ಅರೆಸ್ಟ್)',
    tech_support: 'ರಿಮೋಟ್ ಆಪ್ / ಟೆಕ್ ಸಪೋರ್ಟ್ ವಂಚನೆ',
    utility_bill: 'ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತದ ವಂಚನೆ',
    blackmail: 'ಬ್ಲ್ಯಾಕ್‌ಮೇಲ್',
    account_takeover: 'ಸೋಶಿಯಲ್ ಮೀಡಿಯಾ ಖಾತೆ ಕದಿಯುವ ವಂಚನೆ',
    fake_challan: 'ನಕಲಿ ಟ್ರಾಫಿಕ್ ಇ-ಚಲನ್',
    fake_loan: 'ನಕಲಿ ಸಾಲ ಅಥವಾ ಹಣ ಜಮೆ ವಂಚನೆ',
    general: 'ಸಾಮಾನ್ಯ ಅನುಮಾನಾಸ್ಪದ ಸಂದೇಶ',
    unclassified: 'ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಮಾದರಿ ಇಲ್ಲ',
  },
};

export function plainVerdict(result, lang = 'en') {
  const t = T[lang] || T.en;
  const band = result.band.key;
  const category = lang === 'en' ? result.category.label : CATEGORY[lang]?.[result.category.key] || result.category.label;
  return {
    heading: t.heading[band] || t.heading.low,
    typeLabel: t.type,
    category,
    actions: band === 'low' ? [t.lowNote] : t.donts,
    lost: t.lost,
  };
}

export function spokenVerdict(result, lang = 'en') {
  const v = plainVerdict(result, lang);
  return [v.heading, `${v.typeLabel}: ${v.category}.`, ...v.actions, v.lost].join(' ');
}

export function familyMessage(result, lang = 'en', includeMessage = false) {
  const t = T[lang] || T.en;
  const v = plainVerdict(result, lang);
  const flags = result.signals.slice(0, 3).map((s) => `"${s.quote}"`).join(', ');
  let text = t.family(v.heading, v.category, flags);
  if (includeMessage) text += `\n\n---\n${result.text.slice(0, 600)}${result.text.length > 600 ? '…' : ''}`;
  return text;
}
