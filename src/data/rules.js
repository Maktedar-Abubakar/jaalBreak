// ---------------------------------------------------------------------------
// JaalBreak rule catalogue (deterministic).
//
// Each rule:
//   id           Stable identifier shown to users in the X-Ray panel.
//   tactic       Key from tactics.js.
//   severity     1 = weak signal, 2 = moderate, 3 = strong.
//   lang         'en', 'hi' (Devanagari Hindi), 'hinglish' (Hindi in Latin script),
//                'kn' (Kannada script) or 'kanglish' (Kannada in Latin script).
//   categories   Which scam category this signal points towards, with a weight.
//   negationGuard  If true, a match is ignored when it is preceded by words like
//                "never" or "do not" (e.g. "we will never ask you to share your OTP").
//   patterns     Regular expressions. Always case-insensitive. The analyzer adds
//                the global flag itself.
//
// NOTE: rules run on a normalised match view (NFKC, zero-width characters removed,
// single line breaks turned into spaces) - see buildMatchView in analyzer.js.
//
// IMPORTANT: Hindi (Devanagari) patterns must NOT use \b, because JavaScript's
// \b only understands English letters.
//
// To add a rule: copy an existing entry, give it a new unique id, and add a
// test case in src/utils/analyzer.test.js.
// ---------------------------------------------------------------------------

export const CATEGORY_LABELS = {
  bank_kyc: 'Bank / KYC suspension',
  job_fee: 'Job or internship fee',
  delivery_fee: 'Delivery / customs fee',
  family_emergency: 'Family emergency impersonation',
  prize_reward: 'Prize, refund or reward',
  investment_task: 'Investment or task-earning offer',
  authority_threat: 'Authority / legal threat',
  tech_support: 'Remote-access / tech support',
  utility_bill: 'Electricity / utility disconnection',
  blackmail: 'Blackmail / sextortion',
  account_takeover: 'Social media account takeover',
  fake_challan: 'Fake traffic e-challan',
  fake_loan: 'Fake loan or money-credit offer',
  general: 'General suspicious message',
  unclassified: 'No specific pattern',
};

const MONEY = String.raw`(?:rs\.?|inr|₹)\s?[\d,]+(?:\.\d+)?(?:\s?\/-)?`;
const AMOUNT = String.raw`(?:(?:rs\.?|inr|₹)\s?)?[\d,]+(?:\.\d+)?(?:\s?\/-)?`;

export const RULES = [
  // ----------------------------------------------------------------- Urgency
  {
    id: 'URG-01',
    tactic: 'urgency',
    severity: 3,
    lang: 'en',
    categories: { general: 1 },
    description: 'Deadline combined with a consequence',
    patterns: [
      /\b(?:today|tonight|now|immediately|right away|within \d+\s?(?:hours?|hrs?|minutes?|mins?|days?))\b,?\s+(?:or|else|otherwise)\s+[^.!?\n]{0,60}?\b(?:cancel+ed|blocked|suspended|deactivated|closed|terminated|frozen|forfeited|lost|disconnected|expire[sd]?|rejected|returned|sent back|destroyed)\b/iu,
    ],
  },
  {
    id: 'URG-02',
    tactic: 'urgency',
    severity: 2,
    lang: 'en',
    categories: { general: 1 },
    description: 'Time-pressure wording',
    patterns: [
      /\b(?:immediately|urgent(?:ly)?|right now|asap|act now|respond now|last chance|final (?:notice|warning|reminder)|before it['’]?s too late|limited time only)\b/iu,
      /\bwithin\s+(?:the\s+next\s+)?\d+\s?(?:hours?|hrs?|minutes?|mins?)\b/iu,
      /\b(?:expires?|expiring|valid)\s+(?:today|tonight|in\s+\d+\s?(?:hours?|hrs?|minutes?|mins?))\b/iu,
    ],
  },
  {
    id: 'URG-03',
    tactic: 'urgency',
    severity: 1,
    lang: 'en',
    categories: { general: 1 },
    description: 'Scarcity wording',
    patterns: [
      /\b(?:seats|slots|spots|places|vacancies) (?:are )?(?:limited|filling fast)\b/iu,
      /\bonly \d+ (?:seats|slots|spots|places) (?:left|remaining)\b/iu,
    ],
  },
  {
    id: 'URG-HI',
    tactic: 'urgency',
    severity: 2,
    lang: 'hi',
    categories: { general: 1 },
    description: 'Time pressure (Hindi)',
    patterns: [/(?:तुरंत|तुरन्त|फौरन|अभी तुरंत|आज ही|जल्दी करें|जल्द से जल्द|\d+\s?घंटे (?:के अंदर|में))/u],
  },
  {
    id: 'URG-HG',
    tactic: 'urgency',
    severity: 2,
    lang: 'hinglish',
    categories: { general: 1 },
    description: 'Time pressure (Hinglish)',
    patterns: [/\b(?:turant|fauran|jaldi karo|jaldi karein|aaj hi|abhi ke abhi)\b/iu],
  },

  // ------------------------------------------------------------------ Threat
  {
    id: 'THR-01',
    tactic: 'threat',
    severity: 2,
    lang: 'en',
    categories: { bank_kyc: 2, general: 1 },
    description: 'Threat of suspension or blocking',
    patterns: [
      /\b(?:account|card|sim|mobile number|number|kyc|service|wallet|upi|pan|aadhaar)\b[^.!?\n]{0,30}?\b(?:will be|is being|has been|shall be|is going to be|gets?)\s+(?:permanently\s+|temporarily\s+)?(?:suspended|blocked|deactivated|closed|frozen|terminated|disconnected|cancel+ed|barred|cut)\b/iu,
    ],
  },
  {
    id: 'THR-03',
    tactic: 'threat',
    severity: 2,
    lang: 'en',
    categories: { utility_bill: 3, general: 1 },
    description: 'Threat to cut electricity, gas, water or another connection',
    patterns: [
      /\b(?:electricity|power|power supply|light|gas|water|internet|broadband|connection|meter)\b[^.!?\n]{0,30}?\b(?:will be|is being|has been|shall be|is going to be|gets?)\s+(?:permanently\s+|temporarily\s+)?(?:disconnected|cut(?: off)?|suspended|blocked|stopped|terminated|deactivated)\b/iu,
    ],
  },
  {
    id: 'THR-02',
    tactic: 'threat',
    severity: 3,
    lang: 'en',
    categories: { authority_threat: 3 },
    description: 'Legal or arrest threat',
    patterns: [
      /\b(?:arrest warrant|digital arrest|legal action|fir (?:has been|will be) (?:registered|filed)|case (?:has been|will be) (?:registered|filed)|you will be arrested|money laundering case)\b/iu,
    ],
  },
  {
    id: 'THR-HI',
    tactic: 'threat',
    severity: 2,
    lang: 'hi',
    categories: { bank_kyc: 2, general: 1 },
    description: 'Threat of blocking (Hindi)',
    patterns: [
      /(?:खाता|अकाउंट|सिम|कार्ड|नंबर|बिजली|कनेक्शन)[^।.!?\n]{0,25}?(?:बंद|ब्लॉक|निलंबित|सस्पेंड)\s?(?:हो जाएगा|हो जायेगा|कर दिया जाएगा|किया जाएगा|हो जाएगी|कर दी जाएगी)/u,
      /(?:गिरफ्तार|गिरफ़्तार|कानूनी कार्रवाई)/u,
    ],
  },
  {
    id: 'THR-HG',
    tactic: 'threat',
    severity: 2,
    lang: 'hinglish',
    categories: { bank_kyc: 2, general: 1 },
    description: 'Threat of blocking (Hinglish)',
    patterns: [/\b(?:account|khata|sim|card|number)\b[^.!?\n]{0,20}?\b(?:band|block)\s+(?:ho jayega|ho jaega|kar diya jayega|kar dia jayega)\b/iu],
  },

  // -------------------------------------------------------------- Upfront fee
  {
    id: 'FEE-01',
    tactic: 'advance_fee',
    severity: 3,
    lang: 'en',
    categories: { job_fee: 2, delivery_fee: 1 },
    description: 'Payment demanded to secure or release something',
    patterns: [
      new RegExp(
        String.raw`\bpay\s+(?:a\s+|the\s+|only\s+|just\s+)?${AMOUNT}\s*(?:as\s+)?(?:a\s+|the\s+)?(?:refundable\s+)?(?:registration|processing|joining|security|verification|training|documentation|onboarding|customs|clearance|redelivery|release|handling|activation|application)\s+(?:fees?|charges?|deposit|amount)\b`,
        'iu'
      ),
      new RegExp(
        String.raw`\b(?:pay|deposit|send|transfer|submit|remit)\b[^.!?\n]{0,30}?\b(?:registration|processing|joining|training kit|onboarding|documentation|application|activation)\s+(?:fees?|charges?)\b`,
        'iu'
      ),
      new RegExp(
        String.raw`\b(?:registration|processing|joining|training kit|onboarding|documentation|application|activation)\s+(?:service\s+)?(?:fees?|charges?|tax)\s*(?:of|:|-|is|are|be|=)?\s*${MONEY}`,
        'iu'
      ),
      /\bsecurity deposit\b/iu,
    ],
  },
  {
    id: 'FEE-03',
    tactic: 'advance_fee',
    severity: 2,
    lang: 'en',
    categories: { job_fee: 1 },
    description: 'Mentions a registration or processing fee (weak on its own)',
    patterns: [
      /\b(?:registration|processing|joining|training kit|onboarding|documentation|application|activation)\s+(?:service\s+)?(?:fees?|charges?|tax)\b/iu,
    ],
  },
  {
    id: 'FEE-02',
    tactic: 'advance_fee',
    severity: 3,
    lang: 'en',
    categories: { delivery_fee: 3 },
    description: 'Fee to release a parcel',
    patterns: [
      /\b(?:customs|clearance|redelivery|re-delivery|address update|delivery|handling)\s+(?:fee|charge|duty|amount)\s+(?:of\s+)?(?:(?:rs\.?|inr|₹)\s?[\d,]+(?:\.\d+)?)/iu,
      /\b(?:parcel|package|shipment|consignment)\b[^.!?\n]{0,40}?\b(?:on hold|held|pending|returned|could not be delivered|undelivered)\b/iu,
    ],
  },
  {
    id: 'FEE-HI',
    tactic: 'advance_fee',
    severity: 3,
    lang: 'hi',
    categories: { job_fee: 2 },
    description: 'Upfront fee (Hindi)',
    patterns: [/(?:रजिस्ट्रेशन|पंजीकरण|प्रोसेसिंग|प्रक्रिया)\s?(?:फीस|शुल्क)/u, /(?:शुल्क|फीस)\s?(?:जमा करें|भरें|का भुगतान करें)/u],
  },
  {
    id: 'FEE-HG',
    tactic: 'advance_fee',
    severity: 3,
    lang: 'hinglish',
    categories: { job_fee: 2 },
    description: 'Upfront fee (Hinglish)',
    patterns: [/\b(?:registration|processing|joining)\s+(?:fees?|charge)\s+(?:bharo|bharein|jama karo|jama karein|dena hoga|deni hogi)\b/iu],
  },

  // -------------------------------------------------------- Credential request
  {
    id: 'CRD-01',
    tactic: 'credential_request',
    severity: 3,
    lang: 'en',
    negationGuard: true,
    categories: { bank_kyc: 2, general: 1 },
    description: 'Asks you to share an OTP, PIN, password or CVV',
    patterns: [
      /\b(?:share|send|provide|enter|tell|confirm|give|forward|reply with|submit|read out|type)\b[^.!?\n]{0,35}?\b(?:o\s?t\s?p|0\s?t\s?p|one[- ]time password|upi pin|atm pin|pin|password|passcode|c\s?v\s?v|card details|net ?banking (?:id|password|credentials))\b/iu,
    ],
  },
  {
    id: 'CRD-02',
    tactic: 'credential_request',
    severity: 3,
    lang: 'en',
    negationGuard: true,
    categories: { bank_kyc: 2, general: 1 },
    description: 'Asks you to forward the verification code you received',
    patterns: [
      /\b(?:send|forward|share|tell|read out|give|reply with)\b[^.!?\n]{0,25}?\b(?:the|that|this|your)\s+(?:\d{4,8}[- ]digit\s+)?(?:verification |security |confirmation )?code\b[^.!?\n]{0,30}?\b(?:received|sent|just got|on your phone|by sms|via sms)\b/iu,
    ],
  },
  {
    id: 'CRD-03',
    tactic: 'credential_request',
    severity: 3,
    lang: 'en',
    negationGuard: true,
    categories: { bank_kyc: 2, general: 1 },
    description: 'States that your card or login details are "required"',
    patterns: [
      /\b(?:card (?:details|number|information)|cvv|net ?banking (?:details|credentials)|upi pin|atm pin)\b[^.!?\n]{0,25}?\b(?:is|are) (?:required|needed|necessary|mandatory)\b/iu,
      /\b(?:require|requires|required|need|needs|needed)\s+your\b[^.!?\n]{0,15}?\b(?:card details|card number|cvv|pin|password|otp)\b/iu,
    ],
  },
  {
    id: 'CRD-HI',
    tactic: 'credential_request',
    severity: 3,
    lang: 'hi',
    negationGuard: true,
    categories: { bank_kyc: 2 },
    description: 'Asks for OTP / PIN (Hindi)',
    patterns: [/(?:OTP|ओटीपी|पिन|PIN|पासवर्ड)[^।.!?\n]{0,15}?(?:भेजें|भेजो|बताएं|बताएँ|बताओ|शेयर करें|दें|दीजिए)/iu],
  },
  {
    id: 'CRD-HG',
    tactic: 'credential_request',
    severity: 3,
    lang: 'hinglish',
    negationGuard: true,
    categories: { bank_kyc: 2 },
    description: 'Asks for OTP / PIN (Hinglish)',
    patterns: [/\b(?:otp|pin|password)\b[^.!?\n]{0,15}?\b(?:bhejo|bhejein|batao|bataiye|share karo|share karein|de do|dijiye)\b/iu],
  },

  // ---------------------------------------------------- Verification pretext
  {
    id: 'PRT-01',
    tactic: 'verification_pretext',
    severity: 2,
    lang: 'en',
    negationGuard: true,
    categories: { bank_kyc: 3 },
    description: 'KYC / account verification request',
    patterns: [
      /\b(?:update|complete|verify|re-?verify|link|renew|submit)\s+(?:your\s+)?(?:e-?kyc|kyc|pan(?: card)?|aadhaar|account details|bank details)\b/iu,
      /\b(?:kyc|pan|aadhaar)\b[^.!?\n]{0,20}?\b(?:incomplete|pending|expired|not updated|not verified)\b/iu,
    ],
  },
  {
    id: 'PRT-HI',
    tactic: 'verification_pretext',
    severity: 2,
    lang: 'hi',
    categories: { bank_kyc: 3 },
    description: 'KYC update request (Hindi)',
    patterns: [/(?:KYC|केवाईसी|पैन|आधार)\s?(?:अपडेट|अपडेट करें|सत्यापित करें|पूरा करें|लंबित)/iu],
  },

  // ------------------------------------------------------------ Impersonation
  {
    id: 'IMP-01',
    tactic: 'impersonation',
    severity: 2,
    lang: 'en',
    categories: { authority_threat: 2 },
    description: 'Claims to be police, a regulator or a government body',
    patterns: [
      /\b(?:rbi|reserve bank|cbi|police|cyber cell|cyber crime (?:department|cell)|customs department|income tax department|trai|narcotics|enforcement directorate)\b/iu,
    ],
  },
  {
    id: 'IMP-02',
    tactic: 'impersonation',
    severity: 2,
    lang: 'en',
    categories: { family_emergency: 3 },
    description: 'Claims to be a family member on a new number',
    patterns: [
      /\b(?:this is (?:your )?(?:son|daughter|brother|sister|mom|mum|dad|beta|uncle|aunty|cousin))\b/iu,
      /\b(?:my|this is my) new number\b/iu,
      /\b(?:mom|mum|maa|ammi|dad|papa|abba|abbu|bhai|didi)\b[,!]?\s+(?:it['’]?s me|this is me|i lost my phone)/iu,
    ],
  },
  {
    id: 'IMP-HI',
    tactic: 'impersonation',
    severity: 2,
    lang: 'hi',
    categories: { family_emergency: 3 },
    description: 'Family member on a new number (Hindi)',
    patterns: [/(?:मेरा नया नंबर|मैं आपका बेटा|मैं आपकी बेटी|पापा मैं|मम्मी मैं)/u],
  },

  // -------------------------------------------------------- Channel switching
  {
    id: 'CHN-01',
    tactic: 'channel_switch',
    severity: 2,
    lang: 'en',
    categories: { job_fee: 1, general: 1 },
    description: 'Pushes conversation to Telegram, WhatsApp or a personal number',
    patterns: [
      /\b(?:contact|message|reach|text|chat with|connect with|ping|dm|call)\s+(?:us|me|our [a-z]+|the [a-z]+)?\s*(?:on|via|through|at)\s+(?:telegram|whatsapp|signal|this number|my personal number)(?:\s+only)?\b/iu,
      /\b(?:telegram|whatsapp) only\b/iu,
      /\bjoin\s+(?:our|my|the|this)\s+(?:telegram|whatsapp)\s+(?:group|channel)\b/iu,
    ],
  },

  // ------------------------------------------------------------ Reward bait
  {
    id: 'RWD-01',
    tactic: 'reward_bait',
    severity: 2,
    lang: 'en',
    categories: { prize_reward: 3 },
    description: 'Unexpected prize, lottery or cashback',
    patterns: [
      /\b(?:you have won|you've won|you won|lucky winner|lottery|jackpot|claim your (?:prize|reward|cashback|refund)|cashback of|reward points? (?:worth|expir))\b/iu,
    ],
  },
  {
    id: 'RWD-02',
    tactic: 'reward_bait',
    severity: 1,
    lang: 'en',
    categories: { job_fee: 2 },
    description: 'Unsolicited selection or offer',
    patterns: [
      /\b(?:you have been|you've been|you are)\s+(?:shortlisted|selected)\b/iu,
      /\b(?:internship|job|offer) (?:is )?confirmed\b/iu,
    ],
  },
  {
    id: 'RWD-HI',
    tactic: 'reward_bait',
    severity: 2,
    lang: 'hi',
    categories: { prize_reward: 3 },
    description: 'Prize or lottery (Hindi)',
    patterns: [/(?:लॉटरी|इनाम जीत|आपने जीता|आपने जीते|कैशबैक)/u],
  },

  // --------------------------------------------------------------- Secrecy
  {
    id: 'SEC-01',
    tactic: 'secrecy',
    severity: 2,
    lang: 'en',
    categories: { family_emergency: 1, authority_threat: 1 },
    description: 'Asks you to keep it secret',
    patterns: [
      /\b(?:don['’]?t|do not) (?:tell|inform|share this with) (?:anyone|anybody|your family|papa|mom|dad|the bank)\b/iu,
      /\bkeep (?:this|it) (?:confidential|secret|between us)\b/iu,
    ],
  },
  {
    id: 'SEC-HI',
    tactic: 'secrecy',
    severity: 2,
    lang: 'hi',
    categories: { family_emergency: 1 },
    description: 'Secrecy (Hindi)',
    patterns: [/(?:किसी को (?:मत|न) (?:बताना|बताएं|बताइए))/u],
  },

  // ------------------------------------------------------ Emotional pressure
  {
    id: 'EMO-01',
    tactic: 'emotional_pressure',
    severity: 2,
    lang: 'en',
    categories: { family_emergency: 3 },
    description: 'Emergency story asking for money',
    patterns: [
      /\b(?:i['’]?m|i am|he is|she is|your (?:son|daughter)(?: is)?) (?:in (?:trouble|hospital|police custody)|stuck|arrested|in an accident|had an accident)\b/iu,
    ],
  },
  {
    id: 'EMO-02',
    tactic: 'emotional_pressure',
    severity: 3,
    lang: 'en',
    categories: { family_emergency: 2 },
    description: 'Urgent request to send money',
    patterns: [
      new RegExp(
        String.raw`\b(?:send|transfer)\s+(?:me\s+)?(?:the\s+)?(?:money|amount|${MONEY})[^.!?\n]{0,30}?\b(?:urgently|now|immediately|asap)\b`,
        'iu'
      ),
    ],
  },
  {
    id: 'EMO-HI',
    tactic: 'emotional_pressure',
    severity: 2,
    lang: 'hi',
    categories: { family_emergency: 3 },
    description: 'Emergency story (Hindi)',
    patterns: [/(?:मुसीबत में|अस्पताल में|एक्सीडेंट|दुर्घटना|पैसे भेजो|पैसे भेज दो|पैसे भेजें)/u],
  },

  // ------------------------------------------------------------ Remote access
  {
    id: 'RMT-01',
    tactic: 'remote_access',
    severity: 3,
    lang: 'en',
    categories: { tech_support: 3 },
    description: 'Asks you to install a remote-access app or share your screen',
    patterns: [/\b(?:anydesk|teamviewer|quicksupport|rustdesk|screen ?share|share your screen|remote access app)\b/iu],
  },

  // ---------------------------------------------------------- Payment redirect
  {
    id: 'PAY-01',
    tactic: 'payment_redirect',
    severity: 3,
    lang: 'en',
    categories: { prize_reward: 2, general: 1 },
    description: 'Scan or enter PIN to "receive" money',
    patterns: [
      /\b(?:scan|enter (?:your )?(?:upi )?pin)\b[^.!?\n]{0,30}?\bto (?:receive|get|claim|accept)\b/iu,
    ],
  },
  {
    id: 'PAY-02',
    tactic: 'payment_redirect',
    severity: 2,
    lang: 'en',
    categories: { general: 1 },
    description: 'Payment to a personal UPI ID, QR code or gift card',
    patterns: [
      /\b(?:pay|send|transfer)\b[^.!?\n]{0,30}?\b(?:to (?:this|the following|my) (?:upi|upi id|account|number|qr)|via (?:this )?qr|on (?:this )?upi)\b/iu,
      /\b(?:gift ?cards?|google play cards?|amazon pay cards?)\b/iu,
    ],
  },
  {
    id: 'PAY-03',
    tactic: 'payment_redirect',
    severity: 3,
    lang: 'en',
    categories: { general: 1 },
    description: 'Asks you to buy gift cards or send their codes',
    patterns: [
      /\b(?:buy|purchase|send|share|scratch)\b[^.!?\n]{0,30}?\b(?:gift ?cards?|google play cards?|amazon pay cards?|itunes cards?|steam cards?)\b/iu,
      /\b(?:gift ?cards?|google play cards?)\b[^.!?\n]{0,40}?\b(?:send|share|read out|tell|give)\b[^.!?\n]{0,15}?\b(?:codes?|pins?|numbers?)\b/iu,
    ],
  },

  // --------------------------------------------------------- Unrealistic offer
  {
    id: 'OFR-01',
    tactic: 'unrealistic_offer',
    severity: 2,
    lang: 'en',
    categories: { investment_task: 3 },
    description: 'Easy daily earnings or paid "simple tasks"',
    patterns: [
      new RegExp(String.raw`\b(?:earn|income of|make)\s+(?:up to\s+)?${MONEY}\s*(?:per|a|\/)\s*(?:day|daily|hour)\b`, 'iu'),
      /\b(?:like (?:youtube )?videos|rate (?:hotels|products)|simple online tasks?)\b[^.!?\n]{0,40}?\b(?:earn|paid|income)\b/iu,
    ],
  },
  {
    id: 'OFR-02',
    tactic: 'unrealistic_offer',
    severity: 3,
    lang: 'en',
    categories: { investment_task: 3 },
    description: 'Guaranteed returns or money-doubling scheme',
    patterns: [
      /\b(?:guaranteed\s+(?:[\w%.]+\s+){0,2}?(?:returns?|profits?|income)|assured\s+(?:[\w%.]+\s+){0,2}?returns?|\d+(?:\.\d+)?\s?x\s+(?:returns?|profits?|your money)|double your money|risk[- ]free (?:returns?|profit)|\d+% (?:daily|weekly) returns?|100% (?:safe|guaranteed|secure|risk[- ]free))\b/iu,
      new RegExp(String.raw`\b(?:invest|deposit)\s+${AMOUNT}\s+(?:and\s+)?(?:get|receive|earn)\s+${AMOUNT}\s+(?:back|in return|profit)`, 'iu'),
    ],
  },

  // --------------------------------------------------------------- Blackmail
  {
    id: 'EXT-01',
    tactic: 'blackmail',
    severity: 3,
    lang: 'en',
    categories: { blackmail: 3, general: 1 },
    description: 'Threatens to leak private photos, videos or chats unless you pay',
    patterns: [
      /\bi (?:have|will)\b[^.!?\n]{0,25}?\b(?:recorded|leak|expose|upload)\b[^.!?\n]{0,40}?\b(?:your (?:video|videos|photos?|pictures?|chats?)|your contacts|all your contacts|your family)\b/iu,
      /\b(?:pay|send|transfer)\b[^.!?\n]{0,40}?\b(?:or|otherwise|else)\b[^.!?\n]{0,25}?\b(?:leak|expose|post|share|upload|send)\b[^.!?\n]{0,30}?\b(?:contacts|friends|family|relatives|social media|online|public)\b/iu,
    ],
  },


  // =====================================================================
  // v1.2 — rules written from real reported scam messages (public datasets).
  // Real scam texts are often in broken English ("account have be suspend"),
  // with junk characters inside words ("PAT'YM", "K.YC", "blo cked").
  // =====================================================================

  // ------------------------------------------- Threats in broken English
  {
    id: 'THR-04',
    tactic: 'threat',
    severity: 2,
    lang: 'en',
    categories: { bank_kyc: 2, general: 1 },
    description: 'Says your account, SIM, card or KYC will be blocked (any grammar)',
    patterns: [
      /\b(?:account|acc?ount|a\/c|a c|kyc|k\.?\s?y\.?\s?c|kcy|s'?\s?im|sim card|atm card|debit card|credit card|card|wallet|upi|yono|net ?banking|number|mobile number|service|services|id|profile|pan card|aadhaar|adhaar)\b[^.!?\n]{0,40}?\b(?:will|wil|shall|have|has|had|is|are|was|be|been|get|gets|got|going to)\s+(?:be\s+|been\s+|be be\s+)?(?:permanently\s+|temporarily\s+)?(?:suspend(?:ed)?|block(?:ed)?|blo\s?c?\s?ked|deactivat(?:e|ed)|freez(?:e|ed)|frozen|terminat(?:e|ed)|disabl(?:e|ed)|lock(?:ed)?|put on hold|on hold|hold|barred|restrict(?:ed)?|close(?:d)?|delet(?:e|ed)|remov(?:e|ed)|permanently disabled)\b/iu,
      /\b(?:block|suspend|deactivate|close)(?:ed)?\s+(?:with\s?in|in|after)\s+(?:\d+|xx|24|48)\s?(?:hrs?|hours?|min(?:ute)?s?)\b/iu,
    ],
  },
  {
    id: 'PRT-02',
    tactic: 'verification_pretext',
    severity: 2,
    lang: 'en',
    categories: { bank_kyc: 3 },
    description: 'Says your KYC, PAN, Aadhaar or SIM documents expired or are pending',
    patterns: [
      /\b(?:kyc|k\.?\s?y\.?\s?c|kcy|e-?kyc|documents?|pan(?: card)?|aadhaar|adhaar)\b[^.!?\n]{0,30}?\b(?:have|has|is|are|be|been|was|will|got)?\s*(?:be\s+|been\s+)?(?:expire[sd]?|expiry|pending|suspend(?:ed)?|not updated?)\b/iu,
      /\bre-?\s?kyc\b|\bkyc\s+(?:update|verification|updation)\b|\bupdate\s+(?:your\s+)?(?:full\s+)?(?:kyc|k\.?yc|document|documents|pan|adhaar|aadhaar)\b/iu,
    ],
  },
  {
    id: 'CALL-01',
    tactic: 'channel_switch',
    severity: 2,
    lang: 'en',
    categories: { bank_kyc: 1, utility_bill: 1, general: 1 },
    description: 'Pushes you to call a "customer care" or "office" number urgently',
    patterns: [
      /\b(?:call|contact)\s+(?:our\s+|the\s+)?(?:customer\s?car(?:e)?|customer care (?:no|number)|cust(?:omer)? care|office|helpline|executive|electricity (?:office|officer)|support team)\b[^.!?\n]{0,40}?\b(?:immediately|imme\s?diately|now|urgently|asap|within|today|to continue|to avoid)\b/iu,
      /\b(?:please|kindly|plz)\s+(?:call|contact)\s+(?:customer\s?car(?:e)?|our office|helpline|electricity (?:office|officer))\b/iu,
    ],
  },

  // ------------------------------------------- Rewards, refunds and loans
  {
    id: 'RWD-03',
    tactic: 'reward_bait',
    severity: 3,
    lang: 'en',
    categories: { prize_reward: 3 },
    description: 'Card or reward points "expiring today" — redeem in cash through a link',
    patterns: [
      /\bpoints?\b[^.!?\n]{0,50}?\bexpir\w*\b[^.!?\n]{0,60}?\bredeem\b[^.!?\n]{0,50}?\b(?:cash|click|link|here)\b/iu,
      /\bredeem\b[^.!?\n]{0,30}?\bpoints?\b[^.!?\n]{0,20}?\bin (?:cash|money)\b/iu,
      /\bconvert\s+(?:your\s+)?points?\s+(?:in|into|to)\s+cash\b/iu,
    ],
  },
  {
    id: 'RWD-04',
    tactic: 'reward_bait',
    severity: 2,
    lang: 'en',
    categories: { prize_reward: 3 },
    description: 'Unexpected prize, lucky draw or award',
    patterns: [
      /\b(?:lucky draw|bumper (?:draw|prize|dhamaka)|you (?:have |has |be |are )?(?:w[o0]n|win)\b|(?:are|be|is) (?:the )?winner of|awarded (?:with )?(?:a |an )?[^.!?\n]{0,25}?\b(?:prize|bonus|cash|award|gift)|(?:luckily )?selected (?:to receive|among|as (?:a |the )?winner)|(?:1st|first|2nd|second) prize|guaranteed (?:cash )?prize|claim (?:your |the )?(?:prize|award|gift|reward))\b/iu,
    ],
  },
  {
    id: 'REF-01',
    tactic: 'reward_bait',
    severity: 2,
    lang: 'en',
    categories: { prize_reward: 3 },
    description: 'Unexpected refund or money "owed" to you, claimed through a link',
    patterns: [
      /\b(?:you are|you're|you be) (?:owed|eligible (?:for|to receive) (?:a )?(?:tax )?refund)\b/iu,
      /\b(?:tax refund|refund of|have a refund|overpayment|over payment|billing error|system error)\b[^.!?\n]{0,80}?\b(?:click|visit|confirm|claim|apply|tap|link|http|www)\b/iu,
      /\bhere (?:is|be) your refund\b/iu,
    ],
  },
  {
    id: 'LOAN-01',
    tactic: 'reward_bait',
    severity: 2,
    lang: 'en',
    categories: { fake_loan: 3 },
    description: 'Unexpected loan or money "approved / credited" — register or enter details',
    patterns: [
      /\b(?:loan|credit line|loan amount|application|wallet amount|amount|a\/?\s?c|account)\b[^.!?\n]{0,40}?\b(?:is |has |have |be |been |can be |will be )*(?:successfully )?(?:approved?|sanctioned|pre-?approved|credit(?:ed)?|transferred|disbursed)\b[^.!?\n]{0,80}?\b(?:register|click|check (?:your )?(?:loan )?status|enter (?:your )?details?|verify|claim|link|http)\b/iu,
      /\b(?:instant|pre-?approved)\s+loan\b[^.!?\n]{0,40}?\b(?:without|no)\s+(?:documents?|cibil|credit check)\b/iu,
    ],
  },

  // ------------------------------------------- Electricity bill (broken English)
  {
    id: 'UTL-01',
    tactic: 'threat',
    severity: 3,
    lang: 'en',
    categories: { utility_bill: 3 },
    description: 'Electricity will be cut "tonight" because the bill "was not updated"',
    patterns: [
      /\b(?:electricity|power|light|bijli|connection)\b[^.!?\n]{0,40}?\b(?:disconnect(?:ed|ion)?|cut)\b[^.!?\n]{0,40}?\b(?:tonight|today|night|at\s+\d{1,2}[.:]\d{2}|\d{1,2}[.:]\d{2}\s?(?:pm|am))/iu,
    ],
  },
  {
    id: 'UTL-02',
    tactic: 'verification_pretext',
    severity: 3,
    lang: 'en',
    categories: { utility_bill: 3 },
    description: 'Says your electricity bill "was not updated" and to call an "electricity officer"',
    patterns: [
      /\b(?:previous month(?:['’]?s)?\s+)?bill\s+(?:is\s+|was\s+|be\s+|has\s+|have\s+)?(?:not|n['’]?t)\s+(?:been\s+)?updat(?:e|ed)\b/iu,
      /\bcontact\s+(?:our\s+|the\s+)?electricity\s+(?:officer|office|department)\b/iu,
    ],
  },

  // ------------------------------------------- Digital arrest / authority (English)
  {
    id: 'AUTH-01',
    tactic: 'threat',
    severity: 3,
    lang: 'en',
    categories: { authority_threat: 3 },
    description: 'Says your parcel, number or Aadhaar is linked to a crime (digital-arrest script)',
    patterns: [
      /\b(?:parcel|package|courier|shipment)\b[^.!?\n]{0,60}?\b(?:drugs|narcotics|mdma|illegal items|fake passports?|contraband)\b/iu,
      /\b(?:aadhaar|aadhar|mobile number|phone number|number|sim|bank account|account|name)\b[^.!?\n]{0,40}?\b(?:used|involved|linked|found)\b[^.!?\n]{0,30}?\b(?:money laundering|illegal|crime|criminal|terror\w*|trafficking|drugs)\b/iu,
      /\b(?:stay on (?:the )?(?:video )?call|don['’]?t (?:disconnect|cut) (?:the )?call|do not (?:disconnect|cut) (?:the )?call|video call (?:for|with) (?:verification|investigation|statement))\b/iu,
      /\b(?:number|mobile number|sim)\s+will\s+be\s+(?:disconnected|blocked|suspended)\s+(?:in|within)\s+(?:2|two)\s+hours\b/iu,
      /\b(?:transfer|move|send|deposit)\b[^.!?\n]{0,40}?\b(?:safe|secure|verification|rbi|government|escrow|supervision|supervisory)\s+(?:bank\s+)?account\b/iu,
    ],
  },
  {
    id: 'AUTH-HG',
    tactic: 'impersonation',
    severity: 3,
    lang: 'hinglish',
    categories: { authority_threat: 3 },
    description: 'Caller claims to be police / cyber cell / CBI (Hinglish)',
    patterns: [
      /\b(?:police|cyber cell|cyber crime|crime branch|cbi|customs|trai|narcotics|police headquarters|thana)\b[^.!?\n]{0,30}?\bse\s+bol\s+(?:raha|rahi|rahe)\s+(?:hoon|hu|hun|hain|he|hai)\b/iu,
    ],
  },
  {
    id: 'THR-HG2',
    tactic: 'threat',
    severity: 3,
    lang: 'hinglish',
    categories: { authority_threat: 3 },
    description: 'Says a complaint, case or crime is linked to you (Hinglish)',
    patterns: [
      /\baapk[ea]\s+(?:naam|number|aadhaar|aadhar|account|phone number|mobile|mobile number|phone)\b[^.!?\n]{0,40}?\b(?:se|par|pe|mein|me)\b[^.!?\n]{0,50}?\b(?:complaint|case|fir|warrant|suspicious activity|illegal|cyber crime|crime|money laundering|drugs)\b/iu,
      /\b(?:arrest|giraftar|giraftaar|warrant)\b[^.!?\n]{0,30}?\b(?:ho\s+(?:sakta|sakti|jayega|jaega|jayegi)|hoga|hogi|nikla|jaari)\b/iu,
      /\b(?:deactivate|block|band|suspend|bandh)\s+hone\s+wal[aei]\s+hai\b/iu,
      /\b(?:asleel|ashleel|ashlil|obscene|gande)\b[^.!?\n]{0,40}?\b(?:images?|photos?|videos?|tasveer)\b/iu,
    ],
  },

  // ------------------------------------------- Fake e-challan
  {
    id: 'CHL-01',
    tactic: 'threat',
    severity: 2,
    lang: 'en',
    categories: { fake_challan: 3 },
    description: 'Traffic e-challan "pending" — pay or download through a link',
    patterns: [
      /\b(?:e-?\s?challan|traffic challan|challan)\b[^.!?\n]{0,60}?\b(?:pending|unpaid|due|pay|fine|penalty|issued|generated|click|download|link|http)\b/iu,
      /\b(?:traffic (?:fine|violation)|vehicle (?:fine|violation))\b[^.!?\n]{0,60}?\b(?:pay|click|link|http|download)\b/iu,
    ],
  },
  {
    id: 'APK-01',
    tactic: 'app_install',
    severity: 3,
    lang: 'any',
    categories: { fake_challan: 1, bank_kyc: 1, general: 1 },
    description: 'Asks you to download and install an app file (.apk) from a message',
    patterns: [/\b[\w-]+\.apk\b/iu, /\b(?:download|install|open)\b[^.!?\n]{0,30}?\bapk\b/iu],
  },

  // ------------------------------------------- Task / part-time job scams
  {
    id: 'TSK-01',
    tactic: 'unrealistic_offer',
    severity: 3,
    lang: 'en',
    categories: { investment_task: 3 },
    description: 'Paid to like videos, rate hotels or do "simple tasks" (task scam)',
    patterns: [
      /\b(?:like|subscribe|rate|review|follow)\b[^.!?\n]{0,30}?\b(?:videos?|youtube|channels?|hotels?|products?|posts?|pages?|maps|restaurants?)\b[^.!?\n]{0,60}?\b(?:earn|paid|payment|income|salary|commission|₹|rs\.?|inr)/iu,
      /\b(?:prepaid|merchant|vip|premium)\s+tasks?\b/iu,
      /\bearn\b[^.!?\n]{0,25}?\d[\d,.]*\s*(?:-|to)\s*\d[\d,.]*[^.!?\n]{0,15}?\b(?:per day|a day|daily|every day|each day)\b/iu,
    ],
  },
  {
    id: 'TSK-02',
    tactic: 'unrealistic_offer',
    severity: 2,
    lang: 'en',
    categories: { investment_task: 2, job_fee: 1 },
    description: 'Unsolicited part-time / work-from-home job with daily pay',
    patterns: [
      /\b(?:part[- ]?time|full[- ]?time|work from home|wfh|home[- ]based)\b[^.!?\n]{0,60}?\b(?:daily (?:salary|income|payment|pay)|earn|salary|income)\b/iu,
      /\b(?:daily (?:salary|income|payment|earning)s?|earn (?:daily|every day|per day))\b/iu,
    ],
  },
  {
    id: 'CHN-02',
    tactic: 'channel_switch',
    severity: 2,
    lang: 'any',
    categories: { job_fee: 1, investment_task: 1, general: 1 },
    description: 'Link straight into a WhatsApp or Telegram chat with a stranger',
    patterns: [/\b(?:wa\.me|t\.me|telegram\.me|api\.whatsapp\.com\/send)\/?\S*/iu],
  },
  {
    id: 'INV-01',
    tactic: 'unrealistic_offer',
    severity: 2,
    lang: 'en',
    categories: { investment_task: 3 },
    description: 'Stock or crypto "sure-shot tip" — buy now in bulk',
    patterns: [
      /\b(?:buy (?:strongly|in bulk|aggressively)|sure[- ]?(?:shot|target|profit)|multibagger|upper circuits?|circuits? left|target \d+\s*\/\s*\d+|insider (?:tip|news))\b/iu,
    ],
  },
  {
    id: 'ADV-01',
    tactic: 'reward_bait',
    severity: 2,
    lang: 'en',
    categories: { prize_reward: 2 },
    description: 'Stranger offering to transfer a large fund or inheritance to you',
    patterns: [
      /\b(?:transfer|release|send)\b[^.!?\n]{0,30}?\b(?:my |the |a |large |pending |unclaimed )?(?:fund|funds|inheritance|consignment)\b[^!?\n]{0,40}?\b(?:to you|in your name|your name|attach(?:ed)? to your name)\b/iu,
      /\b(?:pending|unclaimed|large) funds?\b[^.!?\n]{0,30}?\b(?:your name|attached|in your favou?r)\b/iu,
    ],
  },

  // ------------------------------------------- Generic account-security phishing
  {
    id: 'ACC-01',
    tactic: 'threat',
    severity: 2,
    lang: 'en',
    categories: { bank_kyc: 1, account_takeover: 1, general: 1 },
    description: '"Unusual activity" on your account — verify through a link',
    patterns: [
      /\b(?:unusual|suspicious|unrecogni[sz]ed|unauthori[sz]ed|irregular)\s+(?:activity|activities|attempt|log-?\s?in|sign-?\s?in|transactions?|access|payment)\b/iu,
      /\b(?:identity|account)\s+(?:is |be |has been |have been )?(?:no longer|not)\s+verified\b/iu,
    ],
  },

  // ------------------------------------------- Social media account takeover (Instagram, Facebook, YouTube)
  {
    id: 'ATO-01',
    tactic: 'account_hijack',
    severity: 3,
    lang: 'en',
    categories: { account_takeover: 3 },
    description: 'Fake copyright / policy violation — "appeal here or lose your account"',
    patterns: [
      /\b(?:copyright|community guidelines?|terms of (?:use|service)|policy|policies)\b[^.!?\n]{0,60}?\b(?:violation|violates|violated|violating|infringement|infringes|complaint|strike|reported)\b[^.!?\n]{0,120}?\b(?:appeal|verify|confirm|form|link|click|disabled|deleted|removed|suspended|within \d+)/iu,
      /\bappeal\b[^.!?\n]{0,40}?\b(?:form|link|here|this decision|within \d+)\b/iu,
    ],
  },
  {
    id: 'ATO-02',
    tactic: 'impersonation',
    severity: 2,
    lang: 'en',
    categories: { account_takeover: 3 },
    description: 'Claims to be Instagram, Meta, Facebook or YouTube support',
    patterns: [
      /\b(?:instagram|insta|meta|facebook|fb|youtube|whatsapp)\s+(?:copyright|help|support|security|verification|business|safety|policy|trust)\s*(?:center|centre|team|department|desk|services?)?\b/iu,
      /\b(?:meta|instagram)\s+(?:verified|verification)\s+(?:program|team|request)\b/iu,
    ],
  },
  {
    id: 'ATO-03',
    tactic: 'account_hijack',
    severity: 3,
    lang: 'en',
    negationGuard: true,
    categories: { account_takeover: 3 },
    description: 'Asks for the code, reset link or a screenshot you received — or to change your login email',
    patterns: [
      /\b(?:send|share|forward|give)\b(?:(?!payment|transaction|receipt|paid)[^.!?\n]){0,30}?\b(?:screenshot|ss)\b/iu,
      /\b(?:send|share|forward|give)\b[^.!?\n]{0,30}?\b(?:code|otp|link|reset link)\b[^.!?\n]{0,40}?\b(?:instagram|insta|ig|facebook|fb|whatsapp|meta)\b/iu,
      /\b(?:i|we)\s+(?:sent|send|have sent)\b[^.!?\n]{0,30}?\b(?:code|otp|link)\b[^.!?\n]{0,25}?\b(?:by mistake|accidentally|wrongly|to your number)\b/iu,
      /\b(?:change|update|replace)\s+(?:your\s+)?(?:login |account |registered |linked )?(?:email|e-mail|email address|phone number|mobile number)\b[^.!?\n]{0,50}?\b(?:to|with|as)\b[^.!?\n]{0,20}?(?:this|mine|my|ours|our|@)/iu,
      /\bverify\s+(?:the\s+)?authenticity\s+of\s+(?:your\s+)?account\b/iu,
    ],
  },
  {
    id: 'ATO-04',
    tactic: 'reward_bait',
    severity: 2,
    lang: 'en',
    categories: { account_takeover: 3 },
    description: 'Free blue tick / verification badge offer',
    patterns: [/\b(?:blue (?:tick|badge|check(?:mark)?)|verification badge|verified badge|get verified (?:for free|now|today))\b/iu],
  },
  {
    id: 'ATO-05',
    tactic: 'account_hijack',
    severity: 2,
    lang: 'en',
    categories: { account_takeover: 3 },
    description: 'Brand collab / paid promotion that needs you to download something or log in',
    patterns: [
      /\b(?:collab(?:oration)?|sponsorship|sponsor(?:ed)? post|brand deal|paid promotion|promote our)\b[^.!?\n]{0,100}?\b(?:download|install|try (?:our|the) (?:app|software|game)|log ?in|sign ?in|login)\b/iu,
      /\bvote for me\b|\bvote kar(?:o| do| dijiye)\b/iu,
    ],
  },


  // =====================================================================
  // Kannada (BETA) — every phrase is listed in KANNADA_REVIEW.md for a
  // fluent speaker to check. Kannada patterns must NOT use \b (same reason
  // as Hindi). Zero-width joiners are removed before matching, so write
  // "ಅಪ್ಡೇಟ್" without them.
  // =====================================================================
  {
    id: 'URG-KN',
    tactic: 'urgency',
    severity: 2,
    lang: 'kn',
    categories: { general: 1 },
    description: 'Time pressure (Kannada)',
    patterns: [/(?:ತಕ್ಷಣವೇ|ತಕ್ಷಣ|ಕೂಡಲೇ|ಈಗಲೇ|ಇಂದೇ|ಇವತ್ತೇ|\d+\s?ಗಂಟೆ(?:ಗಳ)?(?:ಲ್ಲಿ|ಒಳಗೆ|ಯೊಳಗೆ|ಗಳೊಳಗೆ))/u],
  },
  {
    id: 'THR-KN',
    tactic: 'threat',
    severity: 2,
    lang: 'kn',
    categories: { bank_kyc: 2, general: 1 },
    description: 'Threat of blocking (Kannada)',
    patterns: [
      /(?:ಖಾತೆ|ಅಕೌಂಟ್|ಸಿಮ್|ಕಾರ್ಡ್|ನಂಬರ್|ಸಂಖ್ಯೆ|ಕೆವೈಸಿ|KYC)[^।.!?\n]{0,30}?(?:ಬ್ಲಾಕ್|ಸ್ಥಗಿತ|ಬಂದ್|ನಿಷ್ಕ್ರಿಯ|ರದ್ದು)\s?(?:ಆಗುತ್ತದೆ|ಆಗುತ್ತೆ|ಆಗಲಿದೆ|ಗೊಳ್ಳುತ್ತದೆ|ಗೊಳ್ಳಲಿದೆ|ಮಾಡಲಾಗುವುದು|ಮಾಡಲಾಗುತ್ತದೆ)/iu,
    ],
  },
  {
    id: 'PRT-KN',
    tactic: 'verification_pretext',
    severity: 2,
    lang: 'kn',
    categories: { bank_kyc: 3 },
    description: 'KYC / PAN / Aadhaar update request (Kannada)',
    patterns: [/(?:KYC|ಕೆವೈಸಿ|ಪ್ಯಾನ್|ಆಧಾರ್)[^।.!?\n]{0,15}?(?:ಅಪ್ಡೇಟ್|ನವೀಕರಿಸಿ|ಪರಿಶೀಲಿಸಿ|ಬಾಕಿ ಇದೆ|ಅವಧಿ ಮುಗಿದಿದೆ)/iu],
  },
  {
    id: 'CRD-KN',
    tactic: 'credential_request',
    severity: 3,
    lang: 'kn',
    negationGuard: true,
    categories: { bank_kyc: 2 },
    description: 'Asks for OTP / PIN (Kannada)',
    patterns: [/(?:OTP|ಒಟಿಪಿ|ಓಟಿಪಿ|ಪಿನ್|PIN|ಪಾಸ್ವರ್ಡ್)[^।.!?\n]{0,25}?(?:ಹಂಚಿಕೊಳ್ಳಿ|ಕಳುಹಿಸಿ|ಕಳಿಸಿ|ತಿಳಿಸಿ|ಹೇಳಿ|ನೀಡಿ|ಕೊಡಿ)(?!ಬೇಡ)/iu],
  },
  {
    id: 'FEE-KN',
    tactic: 'advance_fee',
    severity: 3,
    lang: 'kn',
    categories: { job_fee: 2 },
    description: 'Upfront fee (Kannada)',
    patterns: [/(?:ನೋಂದಣಿ|ರಿಜಿಸ್ಟ್ರೇಶನ್|ಪ್ರೊಸೆಸಿಂಗ್)\s?(?:ಶುಲ್ಕ|ಫೀ|ಫೀಸ್)/u, /ಶುಲ್ಕ(?:ವನ್ನು)?\s?(?:ಪಾವತಿಸಿ|ಕಟ್ಟಿ|ಕಳುಹಿಸಿ)/u],
  },
  {
    id: 'RWD-KN',
    tactic: 'reward_bait',
    severity: 2,
    lang: 'kn',
    categories: { prize_reward: 3 },
    description: 'Prize or lottery (Kannada)',
    patterns: [/(?:ನೀವು\s?ಗೆದ್ದಿದ್ದೀರಿ|ಗೆದ್ದಿದ್ದೀರಿ|ಲಾಟರಿ|ಲಕ್ಕಿ ಡ್ರಾ|ಬಹುಮಾನ ಪಡೆಯಲು|ಬಹುಮಾನ ಗೆದ್ದಿ)/u],
  },
  {
    id: 'UTL-KN',
    tactic: 'threat',
    severity: 3,
    lang: 'kn',
    categories: { utility_bill: 3 },
    description: 'Electricity will be cut (Kannada)',
    patterns: [/(?:ವಿದ್ಯುತ್|ಕರೆಂಟ್|ಬೆಸ್ಕಾಂ|ಜೆಸ್ಕಾಂ|ಹೆಸ್ಕಾಂ|ಲೈಟ್)[^।.!?\n]{0,40}?(?:ಕಡಿತ|ಕಟ್|ಸ್ಥಗಿತ)/u],
  },
  {
    id: 'AUTH-KN',
    tactic: 'threat',
    severity: 3,
    lang: 'kn',
    categories: { authority_threat: 3 },
    description: 'Police / cyber crime / arrest threat (Kannada)',
    patterns: [
      /(?:ಪೊಲೀಸ್|ಸೈಬರ್ ಕ್ರೈಮ್|ಸೈಬರ್ ಸೆಲ್|ಸಿಬಿಐ|ಕಸ್ಟಮ್ಸ್)[^।.!?\n]{0,30}?(?:ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ|ಮಾತಾಡ್ತಿದ್ದೀನಿ|ಕರೆ ಮಾಡುತ್ತಿದ್ದೇನೆ)/u,
      /(?:ಡಿಜಿಟಲ್ ಅರೆಸ್ಟ್|ಬಂಧನ ವಾರಂಟ್|ನಿಮ್ಮನ್ನು ಬಂಧಿಸಲಾಗುವುದು|ಪ್ರಕರಣ ದಾಖಲಾಗಿದೆ|ಕೇಸ್ ದಾಖಲಾಗಿದೆ)/u,
    ],
  },
  {
    id: 'SEC-KN',
    tactic: 'secrecy',
    severity: 2,
    lang: 'kn',
    categories: { family_emergency: 1, authority_threat: 1 },
    description: 'Secrecy (Kannada)',
    patterns: [/(?:ಯಾರಿಗೂ ಹೇಳಬೇಡಿ|ಯಾರಿಗೂ ತಿಳಿಸಬೇಡಿ|ರಹಸ್ಯವಾಗಿಡಿ)/u],
  },
  {
    id: 'GEN-KN',
    tactic: 'generic_greeting',
    severity: 1,
    lang: 'kn',
    categories: { general: 0 },
    description: 'Generic greeting (Kannada, weak signal)',
    patterns: [/(?:ಆತ್ಮೀಯ ಗ್ರಾಹಕರೇ|ಪ್ರಿಯ ಗ್ರಾಹಕರೇ)/u],
  },
  // ---------------------------------------------- Kanglish (Kannada in English letters)
  {
    id: 'CRD-KG',
    tactic: 'credential_request',
    severity: 3,
    lang: 'kanglish',
    negationGuard: true,
    categories: { bank_kyc: 2 },
    description: 'Asks for OTP / PIN (Kannada in English letters)',
    patterns: [/\b(?:otp|pin|password)\b[^.!?\n]{0,20}?\b(?:heli|helri|kodi|kalsi|kalisi|share madi|share maadi|send madi|send maadi)\b/iu],
  },
  {
    id: 'THR-KG',
    tactic: 'threat',
    severity: 2,
    lang: 'kanglish',
    categories: { bank_kyc: 2, general: 1 },
    description: 'Threat of blocking (Kannada in English letters)',
    patterns: [/\b(?:account|khate|khaate|sim|card|number)\b[^.!?\n]{0,25}?\b(?:block|band|bandh|suspend)\s+(?:aagutte|agutte|aagatte|aaguttade|madtivi|maadtivi)\b/iu],
  },
  {
    id: 'AUTH-KG',
    tactic: 'impersonation',
    severity: 3,
    lang: 'kanglish',
    categories: { authority_threat: 3 },
    description: 'Caller claims to be police / cyber crime (Kannada in English letters)',
    patterns: [/\b(?:police|cyber crime|cyber cell|cbi|police station)\b[^.!?\n]{0,30}?\b(?:inda|ninda)\s+(?:maatadtiddini|matadtidini|maatadtidini|call madtidini|call maadtiddini)\b/iu],
  },
  {
    id: 'PRT-KG',
    tactic: 'verification_pretext',
    severity: 2,
    lang: 'kanglish',
    categories: { bank_kyc: 3 },
    description: 'KYC update request (Kannada in English letters)',
    patterns: [/\b(?:kyc|pan|aadhaar|aadhar)\s+(?:update|link)\s+(?:maadi|madi|maadbeku|madbeku)\b/iu],
  },


  // ------------------------------------------- UPI IDs, offer letters, invoice emails
  {
    id: 'UPI-01',
    tactic: 'payment_redirect',
    severity: 3,
    lang: 'any',
    categories: { prize_reward: 1, bank_kyc: 1, general: 1 },
    description: 'A personal UPI ID dressed up as a bank, refund desk or government office',
    patterns: [
      /\b[a-z0-9._-]*(?:refund|kyc|support|customercare|care|helpdesk|rbi|govt|cashback|reward|lottery|prize|police|customs|electricity|verify|official)[a-z0-9._-]*@[a-z]{2,20}\b(?![.\w-])/iu,
    ],
  },
  {
    id: 'JOB-01',
    tactic: 'advance_fee',
    severity: 3,
    lang: 'en',
    categories: { job_fee: 3 },
    description: 'Offer letter asks for a deposit, kit, laptop or verification fee',
    patterns: [
      /\b(?:refundable|security|caution|laptop|training kit|kit|background verification|bgv|document verification|uniform|id card|offer letter|joining kit)\s+(?:deposit|fees?|charges?|amount)\b/iu,
    ],
  },
  {
    id: 'JOB-02',
    tactic: 'impersonation',
    severity: 2,
    lang: 'en',
    categories: { job_fee: 2 },
    description: 'A "company HR" writing from a free Gmail / Yahoo address',
    patterns: [/\b(?:hr|recruit\w*|careers?|hiring|talent|placements?|jobs?)[\w.+-]*@(?:gmail|yahoo|outlook|hotmail|rediffmail)\.(?:com|co\.in)\b/iu],
  },
  {
    id: 'BEC-01',
    tactic: 'payment_redirect',
    severity: 3,
    lang: 'en',
    categories: { general: 2 },
    description: 'Says the bank account has changed — pay the invoice to a new account',
    patterns: [
      /\b(?:bank (?:details|account)|account details|beneficiary)\b[^.!?\n]{0,30}?\b(?:has|have|are|is) (?:been )?(?:changed|updated|revised)\b/iu,
      /\b(?:pay|transfer|remit)\b[^.!?\n]{0,40}?\bto (?:our|the) (?:new|updated|revised) (?:bank )?account\b/iu,
    ],
  },

  // ---------------------------------------------------------- Generic greeting
  {
    id: 'GEN-01',
    tactic: 'generic_greeting',
    severity: 1,
    lang: 'en',
    categories: { general: 0 },
    description: 'Generic greeting (weak signal)',
    patterns: [/\b(?:dear (?:customer|user|sir\/madam|account ?holder|valued customer)|valued customer)\b/iu],
  },
  {
    id: 'GEN-HI',
    tactic: 'generic_greeting',
    severity: 1,
    lang: 'hi',
    categories: { general: 0 },
    description: 'Generic greeting (Hindi, weak signal)',
    patterns: [/(?:प्रिय ग्राहक|प्रिय उपभोक्ता)/u],
  },
];
