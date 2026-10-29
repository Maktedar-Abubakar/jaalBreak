// src/data/rules.js
var CATEGORY_LABELS = {
  bank_kyc: "Bank / KYC suspension",
  job_fee: "Job or internship fee",
  delivery_fee: "Delivery / customs fee",
  family_emergency: "Family emergency impersonation",
  prize_reward: "Prize, refund or reward",
  investment_task: "Investment or task-earning offer",
  authority_threat: "Authority / legal threat",
  tech_support: "Remote-access / tech support",
  utility_bill: "Electricity / utility disconnection",
  blackmail: "Blackmail / sextortion",
  account_takeover: "Social media account takeover",
  fake_challan: "Fake traffic e-challan",
  fake_loan: "Fake loan or money-credit offer",
  general: "General suspicious message",
  unclassified: "No specific pattern"
};
var MONEY = String.raw`(?:rs\.?|inr|₹)\s?[\d,]+(?:\.\d+)?(?:\s?\/-)?`;
var AMOUNT = String.raw`(?:(?:rs\.?|inr|₹)\s?)?[\d,]+(?:\.\d+)?(?:\s?\/-)?`;
var RULES = [
  // ----------------------------------------------------------------- Urgency
  {
    id: "URG-01",
    tactic: "urgency",
    severity: 3,
    lang: "en",
    categories: { general: 1 },
    description: "Deadline combined with a consequence",
    patterns: [
      /\b(?:today|tonight|now|immediately|right away|within \d+\s?(?:hours?|hrs?|minutes?|mins?|days?))\b,?\s+(?:or|else|otherwise)\s+[^.!?\n]{0,60}?\b(?:cancel+ed|blocked|suspended|deactivated|closed|terminated|frozen|forfeited|lost|disconnected|expire[sd]?|rejected|returned|sent back|destroyed)\b/iu
    ]
  },
  {
    id: "URG-02",
    tactic: "urgency",
    severity: 2,
    lang: "en",
    categories: { general: 1 },
    description: "Time-pressure wording",
    patterns: [
      /\b(?:immediately|urgent(?:ly)?|right now|asap|act now|respond now|last chance|final (?:notice|warning|reminder)|before it['’]?s too late|limited time only)\b/iu,
      /\bwithin\s+(?:the\s+next\s+)?\d+\s?(?:hours?|hrs?|minutes?|mins?)\b/iu,
      /\b(?:expires?|expiring|valid)\s+(?:today|tonight|in\s+\d+\s?(?:hours?|hrs?|minutes?|mins?))\b/iu
    ]
  },
  {
    id: "URG-03",
    tactic: "urgency",
    severity: 1,
    lang: "en",
    categories: { general: 1 },
    description: "Scarcity wording",
    patterns: [
      /\b(?:seats|slots|spots|places|vacancies) (?:are )?(?:limited|filling fast)\b/iu,
      /\bonly \d+ (?:seats|slots|spots|places) (?:left|remaining)\b/iu
    ]
  },
  {
    id: "URG-HI",
    tactic: "urgency",
    severity: 2,
    lang: "hi",
    categories: { general: 1 },
    description: "Time pressure (Hindi)",
    patterns: [/(?:तुरंत|तुरन्त|फौरन|अभी तुरंत|आज ही|जल्दी करें|जल्द से जल्द|\d+\s?घंटे (?:के अंदर|में))/u]
  },
  {
    id: "URG-HG",
    tactic: "urgency",
    severity: 2,
    lang: "hinglish",
    categories: { general: 1 },
    description: "Time pressure (Hinglish)",
    patterns: [/\b(?:turant|fauran|jaldi karo|jaldi karein|aaj hi|abhi ke abhi)\b/iu]
  },
  // ------------------------------------------------------------------ Threat
  {
    id: "THR-01",
    tactic: "threat",
    severity: 2,
    lang: "en",
    categories: { bank_kyc: 2, general: 1 },
    description: "Threat of suspension or blocking",
    patterns: [
      /\b(?:account|card|sim|mobile number|number|kyc|service|wallet|upi|pan|aadhaar)\b[^.!?\n]{0,30}?\b(?:will be|is being|has been|shall be|is going to be|gets?)\s+(?:permanently\s+|temporarily\s+)?(?:suspended|blocked|deactivated|closed|frozen|terminated|disconnected|cancel+ed|barred|cut)\b/iu
    ]
  },
  {
    id: "THR-03",
    tactic: "threat",
    severity: 2,
    lang: "en",
    categories: { utility_bill: 3, general: 1 },
    description: "Threat to cut electricity, gas, water or another connection",
    patterns: [
      /\b(?:electricity|power|power supply|light|gas|water|internet|broadband|connection|meter)\b[^.!?\n]{0,30}?\b(?:will be|is being|has been|shall be|is going to be|gets?)\s+(?:permanently\s+|temporarily\s+)?(?:disconnected|cut(?: off)?|suspended|blocked|stopped|terminated|deactivated)\b/iu
    ]
  },
  {
    id: "THR-02",
    tactic: "threat",
    severity: 3,
    lang: "en",
    categories: { authority_threat: 3 },
    description: "Legal or arrest threat",
    patterns: [
      /\b(?:arrest warrant|digital arrest|legal action|fir (?:has been|will be) (?:registered|filed)|case (?:has been|will be) (?:registered|filed)|you will be arrested|money laundering case)\b/iu
    ]
  },
  {
    id: "THR-HI",
    tactic: "threat",
    severity: 2,
    lang: "hi",
    categories: { bank_kyc: 2, general: 1 },
    description: "Threat of blocking (Hindi)",
    patterns: [
      /(?:खाता|अकाउंट|सिम|कार्ड|नंबर|बिजली|कनेक्शन)[^।.!?\n]{0,25}?(?:बंद|ब्लॉक|निलंबित|सस्पेंड)\s?(?:हो जाएगा|हो जायेगा|कर दिया जाएगा|किया जाएगा|हो जाएगी|कर दी जाएगी)/u,
      /(?:गिरफ्तार|गिरफ़्तार|कानूनी कार्रवाई)/u
    ]
  },
  {
    id: "THR-HG",
    tactic: "threat",
    severity: 2,
    lang: "hinglish",
    categories: { bank_kyc: 2, general: 1 },
    description: "Threat of blocking (Hinglish)",
    patterns: [/\b(?:account|khata|sim|card|number)\b[^.!?\n]{0,20}?\b(?:band|block)\s+(?:ho jayega|ho jaega|kar diya jayega|kar dia jayega)\b/iu]
  },
  // -------------------------------------------------------------- Upfront fee
  {
    id: "FEE-01",
    tactic: "advance_fee",
    severity: 3,
    lang: "en",
    categories: { job_fee: 2, delivery_fee: 1 },
    description: "Payment demanded to secure or release something",
    patterns: [
      new RegExp(
        String.raw`\bpay\s+(?:a\s+|the\s+|only\s+|just\s+)?${AMOUNT}\s*(?:as\s+)?(?:a\s+|the\s+)?(?:refundable\s+)?(?:registration|processing|joining|security|verification|training|documentation|onboarding|customs|clearance|redelivery|release|handling|activation|application)\s+(?:fees?|charges?|deposit|amount)\b`,
        "iu"
      ),
      new RegExp(
        String.raw`\b(?:pay|deposit|send|transfer|submit|remit)\b[^.!?\n]{0,30}?\b(?:registration|processing|joining|training kit|onboarding|documentation|application|activation)\s+(?:fees?|charges?)\b`,
        "iu"
      ),
      new RegExp(
        String.raw`\b(?:registration|processing|joining|training kit|onboarding|documentation|application|activation)\s+(?:service\s+)?(?:fees?|charges?|tax)\s*(?:of|:|-|is|are|be|=)?\s*${MONEY}`,
        "iu"
      ),
      /\bsecurity deposit\b/iu
    ]
  },
  {
    id: "FEE-03",
    tactic: "advance_fee",
    severity: 2,
    lang: "en",
    categories: { job_fee: 1 },
    description: "Mentions a registration or processing fee (weak on its own)",
    patterns: [
      /\b(?:registration|processing|joining|training kit|onboarding|documentation|application|activation)\s+(?:service\s+)?(?:fees?|charges?|tax)\b/iu
    ]
  },
  {
    id: "FEE-02",
    tactic: "advance_fee",
    severity: 3,
    lang: "en",
    categories: { delivery_fee: 3 },
    description: "Fee to release a parcel",
    patterns: [
      /\b(?:customs|clearance|redelivery|re-delivery|address update|delivery|handling)\s+(?:fee|charge|duty|amount)\s+(?:of\s+)?(?:(?:rs\.?|inr|₹)\s?[\d,]+(?:\.\d+)?)/iu,
      /\b(?:parcel|package|shipment|consignment)\b[^.!?\n]{0,40}?\b(?:on hold|held|pending|returned|could not be delivered|undelivered)\b/iu
    ]
  },
  {
    id: "FEE-HI",
    tactic: "advance_fee",
    severity: 3,
    lang: "hi",
    categories: { job_fee: 2 },
    description: "Upfront fee (Hindi)",
    patterns: [/(?:रजिस्ट्रेशन|पंजीकरण|प्रोसेसिंग|प्रक्रिया)\s?(?:फीस|शुल्क)/u, /(?:शुल्क|फीस)\s?(?:जमा करें|भरें|का भुगतान करें)/u]
  },
  {
    id: "FEE-HG",
    tactic: "advance_fee",
    severity: 3,
    lang: "hinglish",
    categories: { job_fee: 2 },
    description: "Upfront fee (Hinglish)",
    patterns: [/\b(?:registration|processing|joining)\s+(?:fees?|charge)\s+(?:bharo|bharein|jama karo|jama karein|dena hoga|deni hogi)\b/iu]
  },
  // -------------------------------------------------------- Credential request
  {
    id: "CRD-01",
    tactic: "credential_request",
    severity: 3,
    lang: "en",
    negationGuard: true,
    categories: { bank_kyc: 2, general: 1 },
    description: "Asks you to share an OTP, PIN, password or CVV",
    patterns: [
      /\b(?:share|send|provide|enter|tell|confirm|give|forward|reply with|submit|read out|type)\b[^.!?\n]{0,35}?\b(?:o\s?t\s?p|0\s?t\s?p|one[- ]time password|upi pin|atm pin|pin|password|passcode|c\s?v\s?v|card details|net ?banking (?:id|password|credentials))\b/iu
    ]
  },
  {
    id: "CRD-02",
    tactic: "credential_request",
    severity: 3,
    lang: "en",
    negationGuard: true,
    categories: { bank_kyc: 2, general: 1 },
    description: "Asks you to forward the verification code you received",
    patterns: [
      /\b(?:send|forward|share|tell|read out|give|reply with)\b[^.!?\n]{0,25}?\b(?:the|that|this|your)\s+(?:\d{4,8}[- ]digit\s+)?(?:verification |security |confirmation )?code\b[^.!?\n]{0,30}?\b(?:received|sent|just got|on your phone|by sms|via sms)\b/iu
    ]
  },
  {
    id: "CRD-03",
    tactic: "credential_request",
    severity: 3,
    lang: "en",
    negationGuard: true,
    categories: { bank_kyc: 2, general: 1 },
    description: 'States that your card or login details are "required"',
    patterns: [
      /\b(?:card (?:details|number|information)|cvv|net ?banking (?:details|credentials)|upi pin|atm pin)\b[^.!?\n]{0,25}?\b(?:is|are) (?:required|needed|necessary|mandatory)\b/iu,
      /\b(?:require|requires|required|need|needs|needed)\s+your\b[^.!?\n]{0,15}?\b(?:card details|card number|cvv|pin|password|otp)\b/iu
    ]
  },
  {
    id: "CRD-HI",
    tactic: "credential_request",
    severity: 3,
    lang: "hi",
    negationGuard: true,
    categories: { bank_kyc: 2 },
    description: "Asks for OTP / PIN (Hindi)",
    patterns: [/(?:OTP|ओटीपी|पिन|PIN|पासवर्ड)[^।.!?\n]{0,15}?(?:भेजें|भेजो|बताएं|बताएँ|बताओ|शेयर करें|दें|दीजिए)/iu]
  },
  {
    id: "CRD-HG",
    tactic: "credential_request",
    severity: 3,
    lang: "hinglish",
    negationGuard: true,
    categories: { bank_kyc: 2 },
    description: "Asks for OTP / PIN (Hinglish)",
    patterns: [/\b(?:otp|pin|password)\b[^.!?\n]{0,15}?\b(?:bhejo|bhejein|batao|bataiye|share karo|share karein|de do|dijiye)\b/iu]
  },
  // ---------------------------------------------------- Verification pretext
  {
    id: "PRT-01",
    tactic: "verification_pretext",
    severity: 2,
    lang: "en",
    negationGuard: true,
    categories: { bank_kyc: 3 },
    description: "KYC / account verification request",
    patterns: [
      /\b(?:update|complete|verify|re-?verify|link|renew|submit)\s+(?:your\s+)?(?:e-?kyc|kyc|pan(?: card)?|aadhaar|account details|bank details)\b/iu,
      /\b(?:kyc|pan|aadhaar)\b[^.!?\n]{0,20}?\b(?:incomplete|pending|expired|not updated|not verified)\b/iu
    ]
  },
  {
    id: "PRT-HI",
    tactic: "verification_pretext",
    severity: 2,
    lang: "hi",
    categories: { bank_kyc: 3 },
    description: "KYC update request (Hindi)",
    patterns: [/(?:KYC|केवाईसी|पैन|आधार)\s?(?:अपडेट|अपडेट करें|सत्यापित करें|पूरा करें|लंबित)/iu]
  },
  // ------------------------------------------------------------ Impersonation
  {
    id: "IMP-01",
    tactic: "impersonation",
    severity: 2,
    lang: "en",
    categories: { authority_threat: 2 },
    description: "Claims to be police, a regulator or a government body",
    patterns: [
      /\b(?:rbi|reserve bank|cbi|police|cyber cell|cyber crime (?:department|cell)|customs department|income tax department|trai|narcotics|enforcement directorate)\b/iu
    ]
  },
  {
    id: "IMP-02",
    tactic: "impersonation",
    severity: 2,
    lang: "en",
    categories: { family_emergency: 3 },
    description: "Claims to be a family member on a new number",
    patterns: [
      /\b(?:this is (?:your )?(?:son|daughter|brother|sister|mom|mum|dad|beta|uncle|aunty|cousin))\b/iu,
      /\b(?:my|this is my) new number\b/iu,
      /\b(?:mom|mum|maa|ammi|dad|papa|abba|abbu|bhai|didi)\b[,!]?\s+(?:it['’]?s me|this is me|i lost my phone)/iu
    ]
  },
  {
    id: "IMP-HI",
    tactic: "impersonation",
    severity: 2,
    lang: "hi",
    categories: { family_emergency: 3 },
    description: "Family member on a new number (Hindi)",
    patterns: [/(?:मेरा नया नंबर|मैं आपका बेटा|मैं आपकी बेटी|पापा मैं|मम्मी मैं)/u]
  },
  // -------------------------------------------------------- Channel switching
  {
    id: "CHN-01",
    tactic: "channel_switch",
    severity: 2,
    lang: "en",
    categories: { job_fee: 1, general: 1 },
    description: "Pushes conversation to Telegram, WhatsApp or a personal number",
    patterns: [
      /\b(?:contact|message|reach|text|chat with|connect with|ping|dm|call)\s+(?:us|me|our [a-z]+|the [a-z]+)?\s*(?:on|via|through|at)\s+(?:telegram|whatsapp|signal|this number|my personal number)(?:\s+only)?\b/iu,
      /\b(?:telegram|whatsapp) only\b/iu,
      /\bjoin\s+(?:our|my|the|this)\s+(?:telegram|whatsapp)\s+(?:group|channel)\b/iu
    ]
  },
  // ------------------------------------------------------------ Reward bait
  {
    id: "RWD-01",
    tactic: "reward_bait",
    severity: 2,
    lang: "en",
    categories: { prize_reward: 3 },
    description: "Unexpected prize, lottery or cashback",
    patterns: [
      /\b(?:you have won|you've won|you won|lucky winner|lottery|jackpot|claim your (?:prize|reward|cashback|refund)|cashback of|reward points? (?:worth|expir))\b/iu
    ]
  },
  {
    id: "RWD-02",
    tactic: "reward_bait",
    severity: 1,
    lang: "en",
    categories: { job_fee: 2 },
    description: "Unsolicited selection or offer",
    patterns: [
      /\b(?:you have been|you've been|you are)\s+(?:shortlisted|selected)\b/iu,
      /\b(?:internship|job|offer) (?:is )?confirmed\b/iu
    ]
  },
  {
    id: "RWD-HI",
    tactic: "reward_bait",
    severity: 2,
    lang: "hi",
    categories: { prize_reward: 3 },
    description: "Prize or lottery (Hindi)",
    patterns: [/(?:लॉटरी|इनाम जीत|आपने जीता|आपने जीते|कैशबैक)/u]
  },
  // --------------------------------------------------------------- Secrecy
  {
    id: "SEC-01",
    tactic: "secrecy",
    severity: 2,
    lang: "en",
    categories: { family_emergency: 1, authority_threat: 1 },
    description: "Asks you to keep it secret",
    patterns: [
      /\b(?:don['’]?t|do not) (?:tell|inform|share this with) (?:anyone|anybody|your family|papa|mom|dad|the bank)\b/iu,
      /\bkeep (?:this|it) (?:confidential|secret|between us)\b/iu
    ]
  },
  {
    id: "SEC-HI",
    tactic: "secrecy",
    severity: 2,
    lang: "hi",
    categories: { family_emergency: 1 },
    description: "Secrecy (Hindi)",
    patterns: [/(?:किसी को (?:मत|न) (?:बताना|बताएं|बताइए))/u]
  },
  // ------------------------------------------------------ Emotional pressure
  {
    id: "EMO-01",
    tactic: "emotional_pressure",
    severity: 2,
    lang: "en",
    categories: { family_emergency: 3 },
    description: "Emergency story asking for money",
    patterns: [
      /\b(?:i['’]?m|i am|he is|she is|your (?:son|daughter)(?: is)?) (?:in (?:trouble|hospital|police custody)|stuck|arrested|in an accident|had an accident)\b/iu
    ]
  },
  {
    id: "EMO-02",
    tactic: "emotional_pressure",
    severity: 3,
    lang: "en",
    categories: { family_emergency: 2 },
    description: "Urgent request to send money",
    patterns: [
      new RegExp(
        String.raw`\b(?:send|transfer)\s+(?:me\s+)?(?:the\s+)?(?:money|amount|${MONEY})[^.!?\n]{0,30}?\b(?:urgently|now|immediately|asap)\b`,
        "iu"
      )
    ]
  },
  {
    id: "EMO-HI",
    tactic: "emotional_pressure",
    severity: 2,
    lang: "hi",
    categories: { family_emergency: 3 },
    description: "Emergency story (Hindi)",
    patterns: [/(?:मुसीबत में|अस्पताल में|एक्सीडेंट|दुर्घटना|पैसे भेजो|पैसे भेज दो|पैसे भेजें)/u]
  },
  // ------------------------------------------------------------ Remote access
  {
    id: "RMT-01",
    tactic: "remote_access",
    severity: 3,
    lang: "en",
    categories: { tech_support: 3 },
    description: "Asks you to install a remote-access app or share your screen",
    patterns: [/\b(?:anydesk|teamviewer|quicksupport|rustdesk|screen ?share|share your screen|remote access app)\b/iu]
  },
  // ---------------------------------------------------------- Payment redirect
  {
    id: "PAY-01",
    tactic: "payment_redirect",
    severity: 3,
    lang: "en",
    categories: { prize_reward: 2, general: 1 },
    description: 'Scan or enter PIN to "receive" money',
    patterns: [
      /\b(?:scan|enter (?:your )?(?:upi )?pin)\b[^.!?\n]{0,30}?\bto (?:receive|get|claim|accept)\b/iu
    ]
  },
  {
    id: "PAY-02",
    tactic: "payment_redirect",
    severity: 2,
    lang: "en",
    categories: { general: 1 },
    description: "Payment to a personal UPI ID, QR code or gift card",
    patterns: [
      /\b(?:pay|send|transfer)\b[^.!?\n]{0,30}?\b(?:to (?:this|the following|my) (?:upi|upi id|account|number|qr)|via (?:this )?qr|on (?:this )?upi)\b/iu,
      /\b(?:gift ?cards?|google play cards?|amazon pay cards?)\b/iu
    ]
  },
  {
    id: "PAY-03",
    tactic: "payment_redirect",
    severity: 3,
    lang: "en",
    categories: { general: 1 },
    description: "Asks you to buy gift cards or send their codes",
    patterns: [
      /\b(?:buy|purchase|send|share|scratch)\b[^.!?\n]{0,30}?\b(?:gift ?cards?|google play cards?|amazon pay cards?|itunes cards?|steam cards?)\b/iu,
      /\b(?:gift ?cards?|google play cards?)\b[^.!?\n]{0,40}?\b(?:send|share|read out|tell|give)\b[^.!?\n]{0,15}?\b(?:codes?|pins?|numbers?)\b/iu
    ]
  },
  // --------------------------------------------------------- Unrealistic offer
  {
    id: "OFR-01",
    tactic: "unrealistic_offer",
    severity: 2,
    lang: "en",
    categories: { investment_task: 3 },
    description: 'Easy daily earnings or paid "simple tasks"',
    patterns: [
      new RegExp(String.raw`\b(?:earn|income of|make)\s+(?:up to\s+)?${MONEY}\s*(?:per|a|\/)\s*(?:day|daily|hour)\b`, "iu"),
      /\b(?:like (?:youtube )?videos|rate (?:hotels|products)|simple online tasks?)\b[^.!?\n]{0,40}?\b(?:earn|paid|income)\b/iu
    ]
  },
  {
    id: "OFR-02",
    tactic: "unrealistic_offer",
    severity: 3,
    lang: "en",
    categories: { investment_task: 3 },
    description: "Guaranteed returns or money-doubling scheme",
    patterns: [
      /\b(?:guaranteed\s+(?:[\w%.]+\s+){0,2}?(?:returns?|profits?|income)|assured\s+(?:[\w%.]+\s+){0,2}?returns?|\d+(?:\.\d+)?\s?x\s+(?:returns?|profits?|your money)|double your money|risk[- ]free (?:returns?|profit)|\d+% (?:daily|weekly) returns?|100% (?:safe|guaranteed|secure|risk[- ]free))\b/iu,
      new RegExp(String.raw`\b(?:invest|deposit)\s+${AMOUNT}\s+(?:and\s+)?(?:get|receive|earn)\s+${AMOUNT}\s+(?:back|in return|profit)`, "iu")
    ]
  },
  // --------------------------------------------------------------- Blackmail
  {
    id: "EXT-01",
    tactic: "blackmail",
    severity: 3,
    lang: "en",
    categories: { blackmail: 3, general: 1 },
    description: "Threatens to leak private photos, videos or chats unless you pay",
    patterns: [
      /\bi (?:have|will)\b[^.!?\n]{0,25}?\b(?:recorded|leak|expose|upload)\b[^.!?\n]{0,40}?\b(?:your (?:video|videos|photos?|pictures?|chats?)|your contacts|all your contacts|your family)\b/iu,
      /\b(?:pay|send|transfer)\b[^.!?\n]{0,40}?\b(?:or|otherwise|else)\b[^.!?\n]{0,25}?\b(?:leak|expose|post|share|upload|send)\b[^.!?\n]{0,30}?\b(?:contacts|friends|family|relatives|social media|online|public)\b/iu
    ]
  },
  // =====================================================================
  // v1.2 — rules written from real reported scam messages (public datasets).
  // Real scam texts are often in broken English ("account have be suspend"),
  // with junk characters inside words ("PAT'YM", "K.YC", "blo cked").
  // =====================================================================
  // ------------------------------------------- Threats in broken English
  {
    id: "THR-04",
    tactic: "threat",
    severity: 2,
    lang: "en",
    categories: { bank_kyc: 2, general: 1 },
    description: "Says your account, SIM, card or KYC will be blocked (any grammar)",
    patterns: [
      /\b(?:account|acc?ount|a\/c|a c|kyc|k\.?\s?y\.?\s?c|kcy|s'?\s?im|sim card|atm card|debit card|credit card|card|wallet|upi|yono|net ?banking|number|mobile number|service|services|id|profile|pan card|aadhaar|adhaar)\b[^.!?\n]{0,40}?\b(?:will|wil|shall|have|has|had|is|are|was|be|been|get|gets|got|going to)\s+(?:be\s+|been\s+|be be\s+)?(?:permanently\s+|temporarily\s+)?(?:suspend(?:ed)?|block(?:ed)?|blo\s?c?\s?ked|deactivat(?:e|ed)|freez(?:e|ed)|frozen|terminat(?:e|ed)|disabl(?:e|ed)|lock(?:ed)?|put on hold|on hold|hold|barred|restrict(?:ed)?|close(?:d)?|delet(?:e|ed)|remov(?:e|ed)|permanently disabled)\b/iu,
      /\b(?:block|suspend|deactivate|close)(?:ed)?\s+(?:with\s?in|in|after)\s+(?:\d+|xx|24|48)\s?(?:hrs?|hours?|min(?:ute)?s?)\b/iu
    ]
  },
  {
    id: "PRT-02",
    tactic: "verification_pretext",
    severity: 2,
    lang: "en",
    categories: { bank_kyc: 3 },
    description: "Says your KYC, PAN, Aadhaar or SIM documents expired or are pending",
    patterns: [
      /\b(?:kyc|k\.?\s?y\.?\s?c|kcy|e-?kyc|documents?|pan(?: card)?|aadhaar|adhaar)\b[^.!?\n]{0,30}?\b(?:have|has|is|are|be|been|was|will|got)?\s*(?:be\s+|been\s+)?(?:expire[sd]?|expiry|pending|suspend(?:ed)?|not updated?)\b/iu,
      /\bre-?\s?kyc\b|\bkyc\s+(?:update|verification|updation)\b|\bupdate\s+(?:your\s+)?(?:full\s+)?(?:kyc|k\.?yc|document|documents|pan|adhaar|aadhaar)\b/iu
    ]
  },
  {
    id: "CALL-01",
    tactic: "channel_switch",
    severity: 2,
    lang: "en",
    categories: { bank_kyc: 1, utility_bill: 1, general: 1 },
    description: 'Pushes you to call a "customer care" or "office" number urgently',
    patterns: [
      /\b(?:call|contact)\s+(?:our\s+|the\s+)?(?:customer\s?car(?:e)?|customer care (?:no|number)|cust(?:omer)? care|office|helpline|executive|electricity (?:office|officer)|support team)\b[^.!?\n]{0,40}?\b(?:immediately|imme\s?diately|now|urgently|asap|within|today|to continue|to avoid)\b/iu,
      /\b(?:please|kindly|plz)\s+(?:call|contact)\s+(?:customer\s?car(?:e)?|our office|helpline|electricity (?:office|officer))\b/iu
    ]
  },
  // ------------------------------------------- Rewards, refunds and loans
  {
    id: "RWD-03",
    tactic: "reward_bait",
    severity: 3,
    lang: "en",
    categories: { prize_reward: 3 },
    description: 'Card or reward points "expiring today" \u2014 redeem in cash through a link',
    patterns: [
      /\bpoints?\b[^.!?\n]{0,50}?\bexpir\w*\b[^.!?\n]{0,60}?\bredeem\b[^.!?\n]{0,50}?\b(?:cash|click|link|here)\b/iu,
      /\bredeem\b[^.!?\n]{0,30}?\bpoints?\b[^.!?\n]{0,20}?\bin (?:cash|money)\b/iu,
      /\bconvert\s+(?:your\s+)?points?\s+(?:in|into|to)\s+cash\b/iu
    ]
  },
  {
    id: "RWD-04",
    tactic: "reward_bait",
    severity: 2,
    lang: "en",
    categories: { prize_reward: 3 },
    description: "Unexpected prize, lucky draw or award",
    patterns: [
      /\b(?:lucky draw|bumper (?:draw|prize|dhamaka)|you (?:have |has |be |are )?(?:w[o0]n|win)\b|(?:are|be|is) (?:the )?winner of|awarded (?:with )?(?:a |an )?[^.!?\n]{0,25}?\b(?:prize|bonus|cash|award|gift)|(?:luckily )?selected (?:to receive|among|as (?:a |the )?winner)|(?:1st|first|2nd|second) prize|guaranteed (?:cash )?prize|claim (?:your |the )?(?:prize|award|gift|reward))\b/iu
    ]
  },
  {
    id: "REF-01",
    tactic: "reward_bait",
    severity: 2,
    lang: "en",
    categories: { prize_reward: 3 },
    description: 'Unexpected refund or money "owed" to you, claimed through a link',
    patterns: [
      /\b(?:you are|you're|you be) (?:owed|eligible (?:for|to receive) (?:a )?(?:tax )?refund)\b/iu,
      /\b(?:tax refund|refund of|have a refund|overpayment|over payment|billing error|system error)\b[^.!?\n]{0,80}?\b(?:click|visit|confirm|claim|apply|tap|link|http|www)\b/iu,
      /\bhere (?:is|be) your refund\b/iu
    ]
  },
  {
    id: "LOAN-01",
    tactic: "reward_bait",
    severity: 2,
    lang: "en",
    categories: { fake_loan: 3 },
    description: 'Unexpected loan or money "approved / credited" \u2014 register or enter details',
    patterns: [
      /\b(?:loan|credit line|loan amount|application|wallet amount|amount|a\/?\s?c|account)\b[^.!?\n]{0,40}?\b(?:is |has |have |be |been |can be |will be )*(?:successfully )?(?:approved?|sanctioned|pre-?approved|credit(?:ed)?|transferred|disbursed)\b[^.!?\n]{0,80}?\b(?:register|click|check (?:your )?(?:loan )?status|enter (?:your )?details?|verify|claim|link|http)\b/iu,
      /\b(?:instant|pre-?approved)\s+loan\b[^.!?\n]{0,40}?\b(?:without|no)\s+(?:documents?|cibil|credit check)\b/iu
    ]
  },
  // ------------------------------------------- Electricity bill (broken English)
  {
    id: "UTL-01",
    tactic: "threat",
    severity: 3,
    lang: "en",
    categories: { utility_bill: 3 },
    description: 'Electricity will be cut "tonight" because the bill "was not updated"',
    patterns: [
      /\b(?:electricity|power|light|bijli|connection)\b[^.!?\n]{0,40}?\b(?:disconnect(?:ed|ion)?|cut)\b[^.!?\n]{0,40}?\b(?:tonight|today|night|at\s+\d{1,2}[.:]\d{2}|\d{1,2}[.:]\d{2}\s?(?:pm|am))/iu
    ]
  },
  {
    id: "UTL-02",
    tactic: "verification_pretext",
    severity: 3,
    lang: "en",
    categories: { utility_bill: 3 },
    description: 'Says your electricity bill "was not updated" and to call an "electricity officer"',
    patterns: [
      /\b(?:previous month(?:['’]?s)?\s+)?bill\s+(?:is\s+|was\s+|be\s+|has\s+|have\s+)?(?:not|n['’]?t)\s+(?:been\s+)?updat(?:e|ed)\b/iu,
      /\bcontact\s+(?:our\s+|the\s+)?electricity\s+(?:officer|office|department)\b/iu
    ]
  },
  // ------------------------------------------- Digital arrest / authority (English)
  {
    id: "AUTH-01",
    tactic: "threat",
    severity: 3,
    lang: "en",
    categories: { authority_threat: 3 },
    description: "Says your parcel, number or Aadhaar is linked to a crime (digital-arrest script)",
    patterns: [
      /\b(?:parcel|package|courier|shipment)\b[^.!?\n]{0,60}?\b(?:drugs|narcotics|mdma|illegal items|fake passports?|contraband)\b/iu,
      /\b(?:aadhaar|aadhar|mobile number|phone number|number|sim|bank account|account|name)\b[^.!?\n]{0,40}?\b(?:used|involved|linked|found)\b[^.!?\n]{0,30}?\b(?:money laundering|illegal|crime|criminal|terror\w*|trafficking|drugs)\b/iu,
      /\b(?:stay on (?:the )?(?:video )?call|don['’]?t (?:disconnect|cut) (?:the )?call|do not (?:disconnect|cut) (?:the )?call|video call (?:for|with) (?:verification|investigation|statement))\b/iu,
      /\b(?:number|mobile number|sim)\s+will\s+be\s+(?:disconnected|blocked|suspended)\s+(?:in|within)\s+(?:2|two)\s+hours\b/iu,
      /\b(?:transfer|move|send|deposit)\b[^.!?\n]{0,40}?\b(?:safe|secure|verification|rbi|government|escrow|supervision|supervisory)\s+(?:bank\s+)?account\b/iu
    ]
  },
  {
    id: "AUTH-HG",
    tactic: "impersonation",
    severity: 3,
    lang: "hinglish",
    categories: { authority_threat: 3 },
    description: "Caller claims to be police / cyber cell / CBI (Hinglish)",
    patterns: [
      /\b(?:police|cyber cell|cyber crime|crime branch|cbi|customs|trai|narcotics|police headquarters|thana)\b[^.!?\n]{0,30}?\bse\s+bol\s+(?:raha|rahi|rahe)\s+(?:hoon|hu|hun|hain|he|hai)\b/iu
    ]
  },
  {
    id: "THR-HG2",
    tactic: "threat",
    severity: 3,
    lang: "hinglish",
    categories: { authority_threat: 3 },
    description: "Says a complaint, case or crime is linked to you (Hinglish)",
    patterns: [
      /\baapk[ea]\s+(?:naam|number|aadhaar|aadhar|account|phone number|mobile|mobile number|phone)\b[^.!?\n]{0,40}?\b(?:se|par|pe|mein|me)\b[^.!?\n]{0,50}?\b(?:complaint|case|fir|warrant|suspicious activity|illegal|cyber crime|crime|money laundering|drugs)\b/iu,
      /\b(?:arrest|giraftar|giraftaar|warrant)\b[^.!?\n]{0,30}?\b(?:ho\s+(?:sakta|sakti|jayega|jaega|jayegi)|hoga|hogi|nikla|jaari)\b/iu,
      /\b(?:deactivate|block|band|suspend|bandh)\s+hone\s+wal[aei]\s+hai\b/iu,
      /\b(?:asleel|ashleel|ashlil|obscene|gande)\b[^.!?\n]{0,40}?\b(?:images?|photos?|videos?|tasveer)\b/iu
    ]
  },
  // ------------------------------------------- Fake e-challan
  {
    id: "CHL-01",
    tactic: "threat",
    severity: 2,
    lang: "en",
    categories: { fake_challan: 3 },
    description: 'Traffic e-challan "pending" \u2014 pay or download through a link',
    patterns: [
      /\b(?:e-?\s?challan|traffic challan|challan)\b[^.!?\n]{0,60}?\b(?:pending|unpaid|due|pay|fine|penalty|issued|generated|click|download|link|http)\b/iu,
      /\b(?:traffic (?:fine|violation)|vehicle (?:fine|violation))\b[^.!?\n]{0,60}?\b(?:pay|click|link|http|download)\b/iu
    ]
  },
  {
    id: "APK-01",
    tactic: "app_install",
    severity: 3,
    lang: "any",
    categories: { fake_challan: 1, bank_kyc: 1, general: 1 },
    description: "Asks you to download and install an app file (.apk) from a message",
    patterns: [/\b[\w-]+\.apk\b/iu, /\b(?:download|install|open)\b[^.!?\n]{0,30}?\bapk\b/iu]
  },
  // ------------------------------------------- Task / part-time job scams
  {
    id: "TSK-01",
    tactic: "unrealistic_offer",
    severity: 3,
    lang: "en",
    categories: { investment_task: 3 },
    description: 'Paid to like videos, rate hotels or do "simple tasks" (task scam)',
    patterns: [
      /\b(?:like|subscribe|rate|review|follow)\b[^.!?\n]{0,30}?\b(?:videos?|youtube|channels?|hotels?|products?|posts?|pages?|maps|restaurants?)\b[^.!?\n]{0,60}?\b(?:earn|paid|payment|income|salary|commission|₹|rs\.?|inr)/iu,
      /\b(?:prepaid|merchant|vip|premium)\s+tasks?\b/iu,
      /\bearn\b[^.!?\n]{0,25}?\d[\d,.]*\s*(?:-|to)\s*\d[\d,.]*[^.!?\n]{0,15}?\b(?:per day|a day|daily|every day|each day)\b/iu
    ]
  },
  {
    id: "TSK-02",
    tactic: "unrealistic_offer",
    severity: 2,
    lang: "en",
    categories: { investment_task: 2, job_fee: 1 },
    description: "Unsolicited part-time / work-from-home job with daily pay",
    patterns: [
      /\b(?:part[- ]?time|full[- ]?time|work from home|wfh|home[- ]based)\b[^.!?\n]{0,60}?\b(?:daily (?:salary|income|payment|pay)|earn|salary|income)\b/iu,
      /\b(?:daily (?:salary|income|payment|earning)s?|earn (?:daily|every day|per day))\b/iu
    ]
  },
  {
    id: "CHN-02",
    tactic: "channel_switch",
    severity: 2,
    lang: "any",
    categories: { job_fee: 1, investment_task: 1, general: 1 },
    description: "Link straight into a WhatsApp or Telegram chat with a stranger",
    patterns: [/\b(?:wa\.me|t\.me|telegram\.me|api\.whatsapp\.com\/send)\/?\S*/iu]
  },
  {
    id: "INV-01",
    tactic: "unrealistic_offer",
    severity: 2,
    lang: "en",
    categories: { investment_task: 3 },
    description: 'Stock or crypto "sure-shot tip" \u2014 buy now in bulk',
    patterns: [
      /\b(?:buy (?:strongly|in bulk|aggressively)|sure[- ]?(?:shot|target|profit)|multibagger|upper circuits?|circuits? left|target \d+\s*\/\s*\d+|insider (?:tip|news))\b/iu
    ]
  },
  {
    id: "ADV-01",
    tactic: "reward_bait",
    severity: 2,
    lang: "en",
    categories: { prize_reward: 2 },
    description: "Stranger offering to transfer a large fund or inheritance to you",
    patterns: [
      /\b(?:transfer|release|send)\b[^.!?\n]{0,30}?\b(?:my |the |a |large |pending |unclaimed )?(?:fund|funds|inheritance|consignment)\b[^!?\n]{0,40}?\b(?:to you|in your name|your name|attach(?:ed)? to your name)\b/iu,
      /\b(?:pending|unclaimed|large) funds?\b[^.!?\n]{0,30}?\b(?:your name|attached|in your favou?r)\b/iu
    ]
  },
  // ------------------------------------------- Generic account-security phishing
  {
    id: "ACC-01",
    tactic: "threat",
    severity: 2,
    lang: "en",
    categories: { bank_kyc: 1, account_takeover: 1, general: 1 },
    description: '"Unusual activity" on your account \u2014 verify through a link',
    patterns: [
      /\b(?:unusual|suspicious|unrecogni[sz]ed|unauthori[sz]ed|irregular)\s+(?:activity|activities|attempt|log-?\s?in|sign-?\s?in|transactions?|access|payment)\b/iu,
      /\b(?:identity|account)\s+(?:is |be |has been |have been )?(?:no longer|not)\s+verified\b/iu
    ]
  },
  // ------------------------------------------- Social media account takeover (Instagram, Facebook, YouTube)
  {
    id: "ATO-01",
    tactic: "account_hijack",
    severity: 3,
    lang: "en",
    categories: { account_takeover: 3 },
    description: 'Fake copyright / policy violation \u2014 "appeal here or lose your account"',
    patterns: [
      /\b(?:copyright|community guidelines?|terms of (?:use|service)|policy|policies)\b[^.!?\n]{0,60}?\b(?:violation|violates|violated|violating|infringement|infringes|complaint|strike|reported)\b[^.!?\n]{0,120}?\b(?:appeal|verify|confirm|form|link|click|disabled|deleted|removed|suspended|within \d+)/iu,
      /\bappeal\b[^.!?\n]{0,40}?\b(?:form|link|here|this decision|within \d+)\b/iu
    ]
  },
  {
    id: "ATO-02",
    tactic: "impersonation",
    severity: 2,
    lang: "en",
    categories: { account_takeover: 3 },
    description: "Claims to be Instagram, Meta, Facebook or YouTube support",
    patterns: [
      /\b(?:instagram|insta|meta|facebook|fb|youtube|whatsapp)\s+(?:copyright|help|support|security|verification|business|safety|policy|trust)\s*(?:center|centre|team|department|desk|services?)?\b/iu,
      /\b(?:meta|instagram)\s+(?:verified|verification)\s+(?:program|team|request)\b/iu
    ]
  },
  {
    id: "ATO-03",
    tactic: "account_hijack",
    severity: 3,
    lang: "en",
    negationGuard: true,
    categories: { account_takeover: 3 },
    description: "Asks for the code, reset link or a screenshot you received \u2014 or to change your login email",
    patterns: [
      /\b(?:send|share|forward|give)\b(?:(?!payment|transaction|receipt|paid)[^.!?\n]){0,30}?\b(?:screenshot|ss)\b/iu,
      /\b(?:send|share|forward|give)\b[^.!?\n]{0,30}?\b(?:code|otp|link|reset link)\b[^.!?\n]{0,40}?\b(?:instagram|insta|ig|facebook|fb|whatsapp|meta)\b/iu,
      /\b(?:i|we)\s+(?:sent|send|have sent)\b[^.!?\n]{0,30}?\b(?:code|otp|link)\b[^.!?\n]{0,25}?\b(?:by mistake|accidentally|wrongly|to your number)\b/iu,
      /\b(?:change|update|replace)\s+(?:your\s+)?(?:login |account |registered |linked )?(?:email|e-mail|email address|phone number|mobile number)\b[^.!?\n]{0,50}?\b(?:to|with|as)\b[^.!?\n]{0,20}?(?:this|mine|my|ours|our|@)/iu,
      /\bverify\s+(?:the\s+)?authenticity\s+of\s+(?:your\s+)?account\b/iu
    ]
  },
  {
    id: "ATO-04",
    tactic: "reward_bait",
    severity: 2,
    lang: "en",
    categories: { account_takeover: 3 },
    description: "Free blue tick / verification badge offer",
    patterns: [/\b(?:blue (?:tick|badge|check(?:mark)?)|verification badge|verified badge|get verified (?:for free|now|today))\b/iu]
  },
  {
    id: "ATO-05",
    tactic: "account_hijack",
    severity: 2,
    lang: "en",
    categories: { account_takeover: 3 },
    description: "Brand collab / paid promotion that needs you to download something or log in",
    patterns: [
      /\b(?:collab(?:oration)?|sponsorship|sponsor(?:ed)? post|brand deal|paid promotion|promote our)\b[^.!?\n]{0,100}?\b(?:download|install|try (?:our|the) (?:app|software|game)|log ?in|sign ?in|login)\b/iu,
      /\bvote for me\b|\bvote kar(?:o| do| dijiye)\b/iu
    ]
  },
  // =====================================================================
  // Kannada (BETA) — every phrase is listed in KANNADA_REVIEW.md for a
  // fluent speaker to check. Kannada patterns must NOT use \b (same reason
  // as Hindi). Zero-width joiners are removed before matching, so write
  // "ಅಪ್ಡೇಟ್" without them.
  // =====================================================================
  {
    id: "URG-KN",
    tactic: "urgency",
    severity: 2,
    lang: "kn",
    categories: { general: 1 },
    description: "Time pressure (Kannada)",
    patterns: [/(?:ತಕ್ಷಣವೇ|ತಕ್ಷಣ|ಕೂಡಲೇ|ಈಗಲೇ|ಇಂದೇ|ಇವತ್ತೇ|\d+\s?ಗಂಟೆ(?:ಗಳ)?(?:ಲ್ಲಿ|ಒಳಗೆ|ಯೊಳಗೆ|ಗಳೊಳಗೆ))/u]
  },
  {
    id: "THR-KN",
    tactic: "threat",
    severity: 2,
    lang: "kn",
    categories: { bank_kyc: 2, general: 1 },
    description: "Threat of blocking (Kannada)",
    patterns: [
      /(?:ಖಾತೆ|ಅಕೌಂಟ್|ಸಿಮ್|ಕಾರ್ಡ್|ನಂಬರ್|ಸಂಖ್ಯೆ|ಕೆವೈಸಿ|KYC)[^।.!?\n]{0,30}?(?:ಬ್ಲಾಕ್|ಸ್ಥಗಿತ|ಬಂದ್|ನಿಷ್ಕ್ರಿಯ|ರದ್ದು)\s?(?:ಆಗುತ್ತದೆ|ಆಗುತ್ತೆ|ಆಗಲಿದೆ|ಗೊಳ್ಳುತ್ತದೆ|ಗೊಳ್ಳಲಿದೆ|ಮಾಡಲಾಗುವುದು|ಮಾಡಲಾಗುತ್ತದೆ)/iu
    ]
  },
  {
    id: "PRT-KN",
    tactic: "verification_pretext",
    severity: 2,
    lang: "kn",
    categories: { bank_kyc: 3 },
    description: "KYC / PAN / Aadhaar update request (Kannada)",
    patterns: [/(?:KYC|ಕೆವೈಸಿ|ಪ್ಯಾನ್|ಆಧಾರ್)[^।.!?\n]{0,15}?(?:ಅಪ್ಡೇಟ್|ನವೀಕರಿಸಿ|ಪರಿಶೀಲಿಸಿ|ಬಾಕಿ ಇದೆ|ಅವಧಿ ಮುಗಿದಿದೆ)/iu]
  },
  {
    id: "CRD-KN",
    tactic: "credential_request",
    severity: 3,
    lang: "kn",
    negationGuard: true,
    categories: { bank_kyc: 2 },
    description: "Asks for OTP / PIN (Kannada)",
    patterns: [/(?:OTP|ಒಟಿಪಿ|ಓಟಿಪಿ|ಪಿನ್|PIN|ಪಾಸ್ವರ್ಡ್)[^।.!?\n]{0,25}?(?:ಹಂಚಿಕೊಳ್ಳಿ|ಕಳುಹಿಸಿ|ಕಳಿಸಿ|ತಿಳಿಸಿ|ಹೇಳಿ|ನೀಡಿ|ಕೊಡಿ)(?!ಬೇಡ)/iu]
  },
  {
    id: "FEE-KN",
    tactic: "advance_fee",
    severity: 3,
    lang: "kn",
    categories: { job_fee: 2 },
    description: "Upfront fee (Kannada)",
    patterns: [/(?:ನೋಂದಣಿ|ರಿಜಿಸ್ಟ್ರೇಶನ್|ಪ್ರೊಸೆಸಿಂಗ್)\s?(?:ಶುಲ್ಕ|ಫೀ|ಫೀಸ್)/u, /ಶುಲ್ಕ(?:ವನ್ನು)?\s?(?:ಪಾವತಿಸಿ|ಕಟ್ಟಿ|ಕಳುಹಿಸಿ)/u]
  },
  {
    id: "RWD-KN",
    tactic: "reward_bait",
    severity: 2,
    lang: "kn",
    categories: { prize_reward: 3 },
    description: "Prize or lottery (Kannada)",
    patterns: [/(?:ನೀವು\s?ಗೆದ್ದಿದ್ದೀರಿ|ಗೆದ್ದಿದ್ದೀರಿ|ಲಾಟರಿ|ಲಕ್ಕಿ ಡ್ರಾ|ಬಹುಮಾನ ಪಡೆಯಲು|ಬಹುಮಾನ ಗೆದ್ದಿ)/u]
  },
  {
    id: "UTL-KN",
    tactic: "threat",
    severity: 3,
    lang: "kn",
    categories: { utility_bill: 3 },
    description: "Electricity will be cut (Kannada)",
    patterns: [/(?:ವಿದ್ಯುತ್|ಕರೆಂಟ್|ಬೆಸ್ಕಾಂ|ಜೆಸ್ಕಾಂ|ಹೆಸ್ಕಾಂ|ಲೈಟ್)[^।.!?\n]{0,40}?(?:ಕಡಿತ|ಕಟ್|ಸ್ಥಗಿತ)/u]
  },
  {
    id: "AUTH-KN",
    tactic: "threat",
    severity: 3,
    lang: "kn",
    categories: { authority_threat: 3 },
    description: "Police / cyber crime / arrest threat (Kannada)",
    patterns: [
      /(?:ಪೊಲೀಸ್|ಸೈಬರ್ ಕ್ರೈಮ್|ಸೈಬರ್ ಸೆಲ್|ಸಿಬಿಐ|ಕಸ್ಟಮ್ಸ್)[^।.!?\n]{0,30}?(?:ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ|ಮಾತಾಡ್ತಿದ್ದೀನಿ|ಕರೆ ಮಾಡುತ್ತಿದ್ದೇನೆ)/u,
      /(?:ಡಿಜಿಟಲ್ ಅರೆಸ್ಟ್|ಬಂಧನ ವಾರಂಟ್|ನಿಮ್ಮನ್ನು ಬಂಧಿಸಲಾಗುವುದು|ಪ್ರಕರಣ ದಾಖಲಾಗಿದೆ|ಕೇಸ್ ದಾಖಲಾಗಿದೆ)/u
    ]
  },
  {
    id: "SEC-KN",
    tactic: "secrecy",
    severity: 2,
    lang: "kn",
    categories: { family_emergency: 1, authority_threat: 1 },
    description: "Secrecy (Kannada)",
    patterns: [/(?:ಯಾರಿಗೂ ಹೇಳಬೇಡಿ|ಯಾರಿಗೂ ತಿಳಿಸಬೇಡಿ|ರಹಸ್ಯವಾಗಿಡಿ)/u]
  },
  {
    id: "GEN-KN",
    tactic: "generic_greeting",
    severity: 1,
    lang: "kn",
    categories: { general: 0 },
    description: "Generic greeting (Kannada, weak signal)",
    patterns: [/(?:ಆತ್ಮೀಯ ಗ್ರಾಹಕರೇ|ಪ್ರಿಯ ಗ್ರಾಹಕರೇ)/u]
  },
  // ---------------------------------------------- Kanglish (Kannada in English letters)
  {
    id: "CRD-KG",
    tactic: "credential_request",
    severity: 3,
    lang: "kanglish",
    negationGuard: true,
    categories: { bank_kyc: 2 },
    description: "Asks for OTP / PIN (Kannada in English letters)",
    patterns: [/\b(?:otp|pin|password)\b[^.!?\n]{0,20}?\b(?:heli|helri|kodi|kalsi|kalisi|share madi|share maadi|send madi|send maadi)\b/iu]
  },
  {
    id: "THR-KG",
    tactic: "threat",
    severity: 2,
    lang: "kanglish",
    categories: { bank_kyc: 2, general: 1 },
    description: "Threat of blocking (Kannada in English letters)",
    patterns: [/\b(?:account|khate|khaate|sim|card|number)\b[^.!?\n]{0,25}?\b(?:block|band|bandh|suspend)\s+(?:aagutte|agutte|aagatte|aaguttade|madtivi|maadtivi)\b/iu]
  },
  {
    id: "AUTH-KG",
    tactic: "impersonation",
    severity: 3,
    lang: "kanglish",
    categories: { authority_threat: 3 },
    description: "Caller claims to be police / cyber crime (Kannada in English letters)",
    patterns: [/\b(?:police|cyber crime|cyber cell|cbi|police station)\b[^.!?\n]{0,30}?\b(?:inda|ninda)\s+(?:maatadtiddini|matadtidini|maatadtidini|call madtidini|call maadtiddini)\b/iu]
  },
  {
    id: "PRT-KG",
    tactic: "verification_pretext",
    severity: 2,
    lang: "kanglish",
    categories: { bank_kyc: 3 },
    description: "KYC update request (Kannada in English letters)",
    patterns: [/\b(?:kyc|pan|aadhaar|aadhar)\s+(?:update|link)\s+(?:maadi|madi|maadbeku|madbeku)\b/iu]
  },
  // ------------------------------------------- UPI IDs, offer letters, invoice emails
  {
    id: "UPI-01",
    tactic: "payment_redirect",
    severity: 3,
    lang: "any",
    categories: { prize_reward: 1, bank_kyc: 1, general: 1 },
    description: "A personal UPI ID dressed up as a bank, refund desk or government office",
    patterns: [
      /\b[a-z0-9._-]*(?:refund|kyc|support|customercare|care|helpdesk|rbi|govt|cashback|reward|lottery|prize|police|customs|electricity|verify|official)[a-z0-9._-]*@[a-z]{2,20}\b(?![.\w-])/iu
    ]
  },
  {
    id: "JOB-01",
    tactic: "advance_fee",
    severity: 3,
    lang: "en",
    categories: { job_fee: 3 },
    description: "Offer letter asks for a deposit, kit, laptop or verification fee",
    patterns: [
      /\b(?:refundable|security|caution|laptop|training kit|kit|background verification|bgv|document verification|uniform|id card|offer letter|joining kit)\s+(?:deposit|fees?|charges?|amount)\b/iu
    ]
  },
  {
    id: "JOB-02",
    tactic: "impersonation",
    severity: 2,
    lang: "en",
    categories: { job_fee: 2 },
    description: 'A "company HR" writing from a free Gmail / Yahoo address',
    patterns: [/\b(?:hr|recruit\w*|careers?|hiring|talent|placements?|jobs?)[\w.+-]*@(?:gmail|yahoo|outlook|hotmail|rediffmail)\.(?:com|co\.in)\b/iu]
  },
  {
    id: "BEC-01",
    tactic: "payment_redirect",
    severity: 3,
    lang: "en",
    categories: { general: 2 },
    description: "Says the bank account has changed \u2014 pay the invoice to a new account",
    patterns: [
      /\b(?:bank (?:details|account)|account details|beneficiary)\b[^.!?\n]{0,30}?\b(?:has|have|are|is) (?:been )?(?:changed|updated|revised)\b/iu,
      /\b(?:pay|transfer|remit)\b[^.!?\n]{0,40}?\bto (?:our|the) (?:new|updated|revised) (?:bank )?account\b/iu
    ]
  },
  // ---------------------------------------------------------- Generic greeting
  {
    id: "GEN-01",
    tactic: "generic_greeting",
    severity: 1,
    lang: "en",
    categories: { general: 0 },
    description: "Generic greeting (weak signal)",
    patterns: [/\b(?:dear (?:customer|user|sir\/madam|account ?holder|valued customer)|valued customer)\b/iu]
  },
  {
    id: "GEN-HI",
    tactic: "generic_greeting",
    severity: 1,
    lang: "hi",
    categories: { general: 0 },
    description: "Generic greeting (Hindi, weak signal)",
    patterns: [/(?:प्रिय ग्राहक|प्रिय उपभोक्ता)/u]
  }
];

// src/data/tactics.js
var TACTICS = {
  urgency: {
    label: "Urgency / time pressure",
    short: "Urgency",
    why: "A short deadline discourages you from pausing to check. Genuine organisations rarely require action within minutes or hours.",
    doInstead: "Slow down. Any real deadline will still exist after you verify through an official channel you find yourself."
  },
  threat: {
    label: "Threat of loss or penalty",
    short: "Threat",
    why: "Warning that an account, service or opportunity will be blocked or cancelled creates fear, which makes careful checking harder.",
    doInstead: "Check the status yourself in the official app, or call the number printed on your card or on the official website."
  },
  advance_fee: {
    label: "Upfront-payment request",
    short: "Upfront fee",
    why: "You are asked to pay money to secure a job, prize, parcel or service. Legitimate employers and most genuine services do not charge to release an opportunity.",
    doInstead: "Do not pay. Verify the offer through the organisation's official website or careers page, not through contacts given in the message."
  },
  credential_request: {
    label: "Request for OTP, PIN or password",
    short: "Credential request",
    why: "An OTP, PIN, password or CVV gives direct control over your money or accounts. Banks and genuine services do not ask you to share them.",
    doInstead: "Never share an OTP, PIN, password or CVV with anyone, including someone who says they are from your bank."
  },
  verification_pretext: {
    label: "Official-sounding pretext (KYC / verification)",
    short: "Verification pretext",
    why: 'Phrases like "update your KYC" make a request sound routine and official, which lowers suspicion before a link or data request.',
    doInstead: "Complete KYC only inside your bank's official app or at a branch. Do not use links or numbers from the message."
  },
  impersonation: {
    label: "Claimed authority or identity",
    short: "Impersonation",
    why: "The sender claims to be a bank, government body, police, courier or a person you know. Anyone can type a name into a message.",
    doInstead: "Contact the organisation or person through a number or website you already know is genuine."
  },
  suspicious_link: {
    label: "Suspicious link",
    short: "Suspicious link",
    why: 'The link uses a shortener, an unusual domain ending, an IP address, or words such as "kyc" or "verify" that copy official wording.',
    doInstead: "Do not open the link. Type the official website address yourself or use the official app."
  },
  link_present: {
    label: "Contains a link",
    short: "Link",
    why: "Links are not suspicious on their own, but JaalBreak does not open or verify them, so their destination is unknown.",
    doInstead: "If the message is unexpected, reach the service through its official app or a website address you type yourself."
  },
  channel_switch: {
    label: "Channel switching",
    short: "Channel switch",
    why: "The sender pushes the conversation to Telegram, WhatsApp or a personal number, away from official, traceable channels.",
    doInstead: "Verify the organisation independently before continuing. Official processes use official channels."
  },
  reward_bait: {
    label: "Unexpected reward or selection",
    short: "Reward bait",
    why: "An unexpected prize, refund, offer or selection creates excitement that can override caution.",
    doInstead: "Ask yourself whether you entered or applied. Verify on the official website before replying or paying anything."
  },
  secrecy: {
    label: "Request for secrecy",
    short: "Secrecy",
    why: "Being told not to tell anyone isolates you from people who could spot the scam.",
    doInstead: "Talk to someone you trust before acting. A genuine request will survive a second opinion."
  },
  emotional_pressure: {
    label: "Emotional pressure / emergency",
    short: "Emotional pressure",
    why: "A story about an accident, arrest or emergency involving someone you love is designed to trigger panic and fast payment.",
    doInstead: "Call the person on the number you already have, or someone close to them, before sending anything."
  },
  remote_access: {
    label: "Remote-access request",
    short: "Remote access",
    why: "Screen-sharing or remote-control apps can let a stranger see your OTPs and operate your phone or computer.",
    doInstead: "Do not install apps or share your screen at a stranger's request."
  },
  payment_redirect: {
    label: "Unusual payment method",
    short: "Payment redirect",
    why: 'Requests to pay a personal UPI ID, scan a QR code to "receive" money, or buy gift cards are common in fraud. You never need to enter a UPI PIN to receive money.',
    doInstead: "Pay only through official websites or apps. Remember: a UPI PIN is only needed to send money, never to receive it."
  },
  blackmail: {
    label: "Blackmail / threat to expose private content",
    short: "Blackmail",
    why: "The sender claims to hold private photos, videos or chats and demands money to keep them hidden. Paying rarely stops the threats; it usually leads to more demands.",
    doInstead: "Do not pay. Stop replying, take screenshots as evidence, block the sender and report it on cybercrime.gov.in or call 1930."
  },
  unrealistic_offer: {
    label: "Unrealistic earnings or returns",
    short: "Unrealistic offer",
    why: "Guaranteed returns or high pay for simple tasks are a common hook for task-based and investment scams.",
    doInstead: "Be sceptical of guaranteed money. Research the company through independent sources before engaging."
  },
  account_hijack: {
    label: "Account takeover trick",
    short: "Account takeover",
    why: "The message is trying to get your login, the reset link or code sent to you, or to change your login email. With any one of these, the sender can lock you out of your Instagram, Facebook or WhatsApp and use it to scam your followers.",
    doInstead: "Never send codes, reset links or screenshots of them to anyone. Instagram and Meta never DM you about copyright or badges. Open the app yourself and check Settings \u2192 Security."
  },
  app_install: {
    label: "Install an app from a link",
    short: "App install",
    why: 'A file ending in .apk installs an app outside the Play Store. Fake "RTO challan", bank and KYC apps read your SMS and OTPs and can empty your account.',
    doInstead: "Never install an app sent in a message. Get apps only from the Play Store, and pay challans only on the official Parivahan website."
  },
  generic_greeting: {
    label: "Generic greeting",
    short: "Generic greeting",
    why: 'Greetings like "Dear Customer" are weak evidence alone, because many genuine messages use them too. They matter only alongside other signs.',
    doInstead: "Treat this as minor context. Look at what the message is actually asking you to do."
  }
};
function getTactic(key) {
  return TACTICS[key] || {
    label: key,
    short: key,
    why: "No description available for this tactic.",
    doInstead: "Verify through an official channel before acting."
  };
}

// src/data/advice.js
var UNIVERSAL_STEPS = [
  "Do not share an OTP, PIN, password or CVV with anyone.",
  "Do not pay, click links or install apps because a message told you to.",
  "If money has already left your account, call 1930 immediately and contact your bank using the number printed on your card."
];
var CATEGORY_ADVICE = {
  bank_kyc: {
    headline: "Check your account only through your bank\u2019s official app or branch.",
    steps: [
      "Do not open the link in the message.",
      "Open your bank\u2019s official app yourself, or call the customer-care number printed on your card.",
      "Banks do not suspend accounts over SMS links or ask for OTPs to \u201Cupdate KYC\u201D.",
      "Report the message on Chakshu (Sanchar Saathi) so the number can be investigated."
    ]
  },
  job_fee: {
    headline: "Do not pay to secure a job or internship.",
    steps: [
      "Do not pay any registration, training or joining fee.",
      "Find the company\u2019s official careers page yourself and check whether the role exists.",
      "Contact HR through an official company email domain, not Telegram or WhatsApp.",
      "Search the company name with the word \u201Cscam\u201D and check independent reviews."
    ]
  },
  delivery_fee: {
    headline: "Track the parcel through the courier\u2019s official website or app.",
    steps: [
      "Do not pay small \u201Ccustoms\u201D or \u201Credelivery\u201D fees through a message link.",
      "Type the courier\u2019s official website address yourself and enter your tracking number.",
      "If you are not expecting a parcel, you can ignore and report the message."
    ]
  },
  family_emergency: {
    headline: "Call the person on the number you already have before sending anything.",
    steps: [
      "Do not send money to a new number or account, even if the story sounds real.",
      "Call your family member on their known number, or call someone who is with them.",
      "Ask a question only the real person would know.",
      "Agree a family \u201Csafe word\u201D for emergencies in future."
    ]
  },
  prize_reward: {
    headline: "You do not need to pay or enter a PIN to receive a genuine prize or refund.",
    steps: [
      "Do not scan QR codes or enter your UPI PIN to \u201Creceive\u201D money.",
      "Ask yourself whether you actually entered this contest or requested this refund.",
      "Check any refund inside the official app of the company concerned."
    ]
  },
  investment_task: {
    headline: "Be sceptical of guaranteed returns and paid \u201Csimple tasks\u201D.",
    steps: [
      "Do not deposit money to \u201Cunlock\u201D earnings or withdraw a balance.",
      "Check whether the platform is registered with the relevant regulator before investing.",
      "Leave groups that pressure you to invest more to recover earlier losses."
    ]
  },
  utility_bill: {
    headline: "Power, gas and water companies do not cut your supply over a text asking you to call a personal number.",
    steps: [
      "Do not call the number in the message or install any app it suggests.",
      "Check your bill status on the official provider website or app, or the number printed on a past bill.",
      'Never share card details, OTPs or screen access to "update" a bill.',
      "Report the message on Chakshu (Sanchar Saathi)."
    ]
  },
  authority_threat: {
    headline: "Police and government agencies do not demand money or \u201Cdigital arrest\u201D over calls or chats.",
    steps: [
      "End the call or chat. Do not stay on video calls with people claiming to be officials.",
      "Do not transfer money to \u201Cverify\u201D your funds or \u201Cclear your name\u201D.",
      "Contact your local police station directly using an official number.",
      "Report the attempt on Chakshu or cybercrime.gov.in."
    ]
  },
  tech_support: {
    headline: "Do not install remote-access apps for someone who contacted you.",
    steps: [
      "Do not install AnyDesk, TeamViewer or similar apps at a stranger\u2019s request.",
      "If you already did, uninstall the app, disconnect from the internet and contact your bank.",
      "Change passwords from a different, trusted device."
    ]
  },
  blackmail: {
    headline: "Do not pay. Blackmail demands usually escalate if you give in.",
    steps: [
      "Stop replying and do not send money or more photos or videos.",
      "Take screenshots of the messages, profile and any payment details as evidence.",
      "Block the sender and report the account on the platform.",
      "Report on cybercrime.gov.in or call 1930. If you are a minor or the content involves a minor, tell a trusted adult and report it to the police."
    ]
  },
  account_takeover: {
    headline: "Do not click, log in or send any code. Instagram and Meta do not message you about copyright or badges.",
    steps: [
      'Do not open the link or fill any "appeal" form. Do not send screenshots of messages you received.',
      "Never share the 6-digit code or password-reset link that Instagram, Facebook or WhatsApp sends you \u2014 not even to a friend.",
      'Open the app yourself \u2192 Settings \u2192 Security: turn on two-factor authentication and check "Where you are logged in".',
      'If you already lost access, go to instagram.com/hacked (or facebook.com/hacked) from your browser \u2014 do not pay anyone who offers to "recover" it.',
      "Warn your followers from another account that messages from your account may be fake."
    ]
  },
  fake_challan: {
    headline: "Check challans only on the official Parivahan website, never through a message link.",
    steps: [
      "Do not open the link and never install an app (.apk) sent in a message.",
      "Type echallan.parivahan.gov.in yourself and search with your vehicle number.",
      "If you installed an app from the message, uninstall it, call your bank and report on 1930."
    ]
  },
  fake_loan: {
    headline: "No real lender approves or credits money you did not apply for.",
    steps: [
      "Do not click the link or enter your PAN, Aadhaar or bank details.",
      'Do not pay any "processing" or "insurance" fee to receive a loan.',
      "Check that a lender is RBI-registered before you apply, and apply only through its official app or website."
    ]
  },
  general: {
    headline: "Pause and verify through a channel you find yourself.",
    steps: [
      "Do not act on the message until you have verified it independently.",
      "Contact the organisation using contact details from its official website or app.",
      "Report suspicious messages on Chakshu (Sanchar Saathi)."
    ]
  },
  unclassified: {
    headline: "Few warning signs were found, but that is not a guarantee of safety.",
    steps: [
      "If the message was unexpected, verify it through the official app or website anyway.",
      "Do not share an OTP, PIN or password even if the message seems genuine."
    ]
  }
};

// src/utils/linkCheck.js
var SHORTENERS = [
  "bit.ly",
  "tinyurl.com",
  "t.ly",
  "is.gd",
  "cutt.ly",
  "rb.gy",
  "shorturl.at",
  "goo.gl",
  "ow.ly",
  "tiny.cc",
  "rebrand.ly",
  "shorte.st",
  "v.gd",
  "s.id",
  "t.co"
];
var RISKY_TLDS = [
  "xyz",
  "top",
  "click",
  "live",
  "online",
  "site",
  "icu",
  "buzz",
  "link",
  "vip",
  "cc",
  "tk",
  "ml",
  "ga",
  "cf",
  "gq",
  "work",
  "loan",
  "win",
  "shop",
  "support",
  "info"
];
var LURE_WORDS = [
  "kyc",
  "verify",
  "verification",
  "update",
  "secure",
  "login",
  "signin",
  "account",
  "bank",
  "reward",
  "refund",
  "claim",
  "customs",
  "parcel",
  "redeliver",
  "support",
  "bonus",
  "prize",
  "unblock",
  "reactivate"
];
var BRANDS = {
  sbi: ["sbi.co.in", "onlinesbi.sbi", "onlinesbi.com", "sbi.bank.in", "onlinesbi.sbi.bank.in"],
  hdfc: ["hdfcbank.com", "hdfc.com", "hdfcbank.net", "hdfc.bank.in"],
  icici: ["icicibank.com", "icici.bank.in"],
  paytm: ["paytm.com"],
  phonepe: ["phonepe.com"],
  npci: ["npci.org.in"],
  uidai: ["uidai.gov.in"],
  irctc: ["irctc.co.in"],
  incometax: ["incometax.gov.in"],
  amazon: ["amazon.in", "amazon.com", "amazonaws.com"],
  instagram: ["instagram.com"],
  facebook: ["facebook.com", "fb.com"],
  whatsapp: ["whatsapp.com", "whatsapp.net"],
  flipkart: ["flipkart.com"],
  axisbank: ["axisbank.com", "axis.bank.in"],
  kotak: ["kotak.com", "kotaksecurities.com", "kotaklife.com"],
  parivahan: ["parivahan.gov.in"]
};
var TYPO_TARGETS = {
  onlinesbi: "onlinesbi.sbi",
  hdfcbank: "hdfcbank.com",
  icicibank: "icicibank.com",
  axisbank: "axisbank.com",
  paytm: "paytm.com",
  phonepe: "phonepe.com",
  amazon: "amazon.in",
  flipkart: "flipkart.com",
  instagram: "instagram.com",
  facebook: "facebook.com",
  whatsapp: "whatsapp.com",
  irctc: "irctc.co.in",
  uidai: "uidai.gov.in",
  incometax: "incometax.gov.in",
  parivahan: "parivahan.gov.in",
  google: "google.com",
  youtube: "youtube.com",
  netflix: "netflix.com",
  paypal: "paypal.com"
};
var TUNNEL_HOSTS = ["ngrok.io", "ngrok-free.app", "ngrok.app", "trycloudflare.com", "loca.lt", "serveo.net", "localtunnel.me"];
var FREE_HOSTS = ["000webhostapp.com", "weebly.com", "wixsite.com", "blogspot.com", "web.app", "firebaseapp.com", "pages.dev", "netlify.app", "vercel.app", "github.io", "glitch.me", "repl.co", "sites.google.com", "godaddysites.com", "webflow.io"];
function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
    }
  }
  return dp[a.length][b.length];
}
function typoLookalike(host) {
  const labels = host.split(".");
  const unswap = (x) => x.replace(/0/g, "o").replace(/1/g, "l").replace(/3/g, "e").replace(/5/g, "s").replace(/rn/g, "m");
  for (const raw of labels.flatMap((l) => l.split("-"))) {
    if (raw.length < 4) continue;
    const label = unswap(raw);
    for (const [name, official] of Object.entries(TYPO_TARGETS)) {
      if (isHostOrSubdomainOf(host, official)) continue;
      if (raw === name) continue;
      const limit = name.length >= 8 ? 2 : 1;
      if (label === name || editDistance(label, name) <= limit) return name;
    }
  }
  return null;
}
function isHostOrSubdomainOf(host, domain) {
  return host === domain || host.endsWith(`.${domain}`);
}
function lookalikeBrand(host) {
  const parts = host.split(".").flatMap((label) => label.split("-"));
  for (const [brand, official] of Object.entries(BRANDS)) {
    if (!parts.some((part) => part.startsWith(brand))) continue;
    if (official.some((domain) => isHostOrSubdomainOf(host, domain))) continue;
    return brand;
  }
  return null;
}
var TLD_GROUP = [
  "com",
  "in",
  "net",
  "org",
  "co",
  "me",
  "ly",
  "gd",
  "io",
  "app",
  "gov",
  "edu",
  "ac",
  "ai",
  ...RISKY_TLDS
].join("|");
var URL_RE = new RegExp(
  String.raw`(?:https?:\/\/[^\s<>"'()]+|www\.[^\s<>"'()]+|(?<![@\w.-])(?:[a-z0-9-]+\.)+(?:${TLD_GROUP})(?![a-z0-9-])(?:\/[^\s<>"'()]*)?)`,
  "giu"
);
function trimTrailingPunctuation(value) {
  return value.replace(/[.,;:!?…]+$/u, "");
}
function getHost(url) {
  const withoutProtocol = url.replace(/^https?:\/\//i, "");
  const host = withoutProtocol.split(/[/?#]/)[0].toLowerCase();
  return host.replace(/:\d+$/, "");
}
function assessLink(url) {
  const reasons = [];
  const host = getHost(url);
  const labels = host.split(".");
  const tld = labels[labels.length - 1];
  if (SHORTENERS.includes(host)) {
    reasons.push("Uses a link shortener, which hides the real destination.");
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
    reasons.push("Points to a raw IP address instead of a named website.");
  }
  if (RISKY_TLDS.includes(tld)) {
    reasons.push(`Uses the domain ending ".${tld}", which official banks and government services in India rarely use.`);
  }
  if (host.startsWith("xn--") || host.includes(".xn--")) {
    reasons.push("Uses an encoded (punycode) domain that can imitate familiar names.");
  }
  const lure = LURE_WORDS.find((word) => host.includes(word));
  if (lure && (host.includes("-") || /\d/.test(host) || RISKY_TLDS.includes(tld))) {
    reasons.push(`The domain contains the word "${lure}", copying official-sounding wording.`);
  }
  const brand = lookalikeBrand(host);
  if (brand) {
    reasons.push(`The domain uses the name "${brand}" but is not one of its official websites.`);
  }
  const typo = typoLookalike(host);
  if (typo && typo !== brand) {
    reasons.push(`The domain looks like "${typo}" but is spelled differently \u2014 a typo look-alike of a real website.`);
  }
  if (TUNNEL_HOSTS.some((d) => isHostOrSubdomainOf(host, d))) {
    reasons.push("The link runs through a temporary tunnel service (like ngrok). Banks and government services never use these.");
  }
  if (FREE_HOSTS.some((d) => isHostOrSubdomainOf(host, d)) && (brand || typo || lure)) {
    reasons.push("A free website builder is being used with an official-sounding name. Real banks and brands use their own domain.");
  }
  if ((host.replace(/xn--/g, "").match(/-/g) || []).length >= 2) {
    reasons.push("The domain contains several hyphens, a common trait of look-alike sites.");
  }
  if (/^http:\/\//i.test(url)) {
    reasons.push("Uses an unencrypted http:// address.");
  }
  return { url, host, suspicious: reasons.length > 0, reasons };
}
function extractLinks(text) {
  const found = [];
  for (const match of text.matchAll(URL_RE)) {
    const raw = trimTrailingPunctuation(match[0]);
    if (!raw || raw.length < 4) continue;
    if (/^[\d.,]+$/.test(raw)) continue;
    found.push({ start: match.index, end: match.index + raw.length, url: raw });
  }
  return found;
}

// src/utils/analyzer.js
var RULES_VERSION = "1.2.0";
var MAX_INPUT_LENGTH = 5e3;
var BANDS = {
  high: {
    key: "high",
    label: "Strong match for a known scam pattern",
    short: "Strong indicators",
    level: 3
  },
  medium: {
    key: "medium",
    label: "Several warning signs",
    short: "Several warning signs",
    level: 2
  },
  low: {
    key: "low",
    label: "Few warning signs found",
    short: "Few warning signs",
    level: 1
  }
};
var THRESHOLDS = {
  high: 7,
  // total severity of distinct matched checks
  medium: 3,
  strongChecksForHigh: 2
  // OR at least this many severity-3 checks
};
var CLAUSE_BREAK = /[.!?;\n।]|\b(?:but|however|though|although|yet)\b/giu;
var NEGATOR_EN = /\b(?:never|do not|does not|did not|don['’]?t|won['’]?t|will not|should not|shouldn['’]?t|must not|can['’]?t|cannot|not to|no one|nobody|kabhi|mat|nahi|nahin)\b/giu;
var NEGATION_CANCEL = /\b(?:and|then|so|just|simply|worry|hesitate|delay|wait|ignore|forget|panic|fear)\b/iu;
var NEGATOR_HI = /(?:कभी|मत|नहीं|(?:^|\s)न(?:\s|$))/u;
var NEGATOR_HG = /\b(?:kabhi|mat|nahi|nahin)\b/iu;
var NEGATOR_KN = /ಬೇಡ/u;
var NEGATOR_KG = /\b(?:beda|bedi|madbedi|maadbedi|kodbedi|helbedi|yarigu)\b/iu;
var NEGATION_LOOKBACK = 120;
var NEGATION_MAX_GAP = 60;
function normaliseInput(raw) {
  return String(raw ?? "").normalize("NFC").replace(/\r\n?/g, "\n");
}
var INVISIBLE_RE = /[\u200B-\u200D\u2060\uFEFF\u00AD]/u;
var HIDDEN_CHARS_RE = /[\u200B-\u200D\u2060\uFEFF]/u;
var FULLWIDTH_LETTER_RE = /[\uFF21-\uFF3A\uFF41-\uFF5A]/u;
function buildMatchView(text) {
  let match = "";
  const startMap = [];
  const endMap = [];
  let i = 0;
  while (i < text.length) {
    const ch = String.fromCodePoint(text.codePointAt(i));
    const next = i + ch.length;
    let piece;
    if (INVISIBLE_RE.test(ch)) piece = "";
    else if (ch === "\n") piece = text[i - 1] === "\n" || text[next] === "\n" ? "\n" : " ";
    else piece = ch.normalize("NFKC");
    for (let k = 0; k < piece.length; k += 1) {
      startMap.push(i);
      endMap.push(next);
    }
    match += piece;
    i = next;
  }
  return { match, startMap, endMap };
}
function clauseBefore(view, start) {
  const before = view.slice(Math.max(0, start - NEGATION_LOOKBACK), start);
  let cut = 0;
  for (const m of before.matchAll(CLAUSE_BREAK)) cut = m.index + m[0].length;
  return before.slice(cut);
}
function isNegated(view, start, end, lang) {
  const clause = clauseBefore(view, start);
  let last = null;
  for (const m of clause.matchAll(NEGATOR_EN)) last = m;
  if (last) {
    const gap = clause.slice(last.index + last[0].length);
    if (gap.length <= NEGATION_MAX_GAP && !NEGATION_CANCEL.test(gap)) return true;
  }
  if (NEGATOR_HI.test(clause)) return true;
  const inner = view.slice(start, end);
  if (lang === "hi" && NEGATOR_HI.test(inner)) return true;
  if (lang === "hinglish" && NEGATOR_HG.test(inner)) return true;
  if (lang === "kn" && NEGATOR_KN.test(inner)) return true;
  if (lang === "kanglish" && NEGATOR_KG.test(inner)) return true;
  return false;
}
function toGlobal(pattern) {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  return new RegExp(pattern.source, flags);
}
function tightenSpan(text, start, end) {
  let s = start;
  let e = end;
  while (s < e && /\s/u.test(text[s])) s += 1;
  while (e > s && /\s/u.test(text[e - 1])) e -= 1;
  return [s, e];
}
var HINGLISH_MARKERS = [
  "aapka",
  "apka",
  "apna",
  "turant",
  "jaldi",
  "bhejo",
  "batao",
  "batayein",
  "karo",
  "kijiye",
  "jayega",
  "jayegi",
  "warna",
  "nahi",
  "nahin",
  "khata",
  "paise",
  "paisa",
  "bharo",
  "dijiye",
  "hai",
  "abhi",
  "kripya"
];
var KANGLISH_MARKERS = [
  "nimma",
  "nimge",
  "maadi",
  "madi",
  "aagutte",
  "agutte",
  "beku",
  "illa",
  "heli",
  "kodi",
  "kalsi",
  "eega",
  "bega",
  "inda",
  "ninda",
  "khate",
  "maatadtiddini",
  "madbeku",
  "aaguttade",
  "banni"
];
function detectLanguage(text) {
  const devanagari = (text.match(/[ऀ-ॿ]/gu) || []).length;
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  const kannada = (text.match(/[ಀ-೿]/gu) || []).length;
  const otherScripts = (text.match(/[ঀ-೿ഀ-෿؀-ۿ฀-๿一-鿿]/gu) || []).length - kannada;
  const total = devanagari + latin + otherScripts + kannada || 1;
  if (kannada / total > 0.15) {
    const note = "Kannada support is new (beta). Some Kannada scam wording may be missed.";
    if (latin / total > 0.1) return { code: "kn-mixed", label: "Kannada + English", supported: true, note };
    return { code: "kn", label: "Kannada", supported: true, note };
  }
  if (otherScripts / total > 0.15) {
    return {
      code: "other",
      label: "Unreviewed language",
      supported: false,
      note: "Part of this message is in a language JaalBreak has not reviewed rules for (supported: English, Hindi, Hinglish and Kannada). Warnings may be missed."
    };
  }
  if (devanagari > 0 && latin > 0 && devanagari / total > 0.1 && latin / total > 0.1) {
    return { code: "mixed", label: "Hindi + English", supported: true, note: null };
  }
  if (devanagari > latin) {
    return { code: "hi", label: "Hindi", supported: true, note: null };
  }
  const words = new Set(text.toLowerCase().match(/[a-z]+/g) || []);
  const hinglishHits = HINGLISH_MARKERS.filter((w) => words.has(w)).length;
  const kanglishHits = KANGLISH_MARKERS.filter((w) => words.has(w)).length;
  if (devanagari === 0 && kanglishHits >= 2 && kanglishHits > hinglishHits) {
    return { code: "kanglish", label: "Kannada in English letters", supported: true, note: "Kannada support is new (beta)." };
  }
  if (devanagari === 0 && hinglishHits >= 2) {
    return { code: "hinglish", label: "Hinglish (Hindi in English letters)", supported: true, note: null };
  }
  return { code: "en", label: "English", supported: true, note: null };
}
function findRuleCandidates(view) {
  const candidates = [];
  const { match: text, startMap, endMap } = view;
  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      for (const match of text.matchAll(toGlobal(pattern))) {
        if (!match[0] || !match[0].trim()) continue;
        const [start, end] = tightenSpan(text, match.index, match.index + match[0].length);
        if (end <= start) continue;
        if (rule.negationGuard && isNegated(text, start, end, rule.lang)) continue;
        candidates.push({
          ruleId: rule.id,
          tactic: rule.tactic,
          severity: rule.severity,
          lang: rule.lang,
          description: rule.description,
          categories: rule.categories,
          start: startMap[start],
          end: endMap[end - 1]
        });
      }
    }
  }
  return candidates;
}
function findLinkCandidates(view) {
  const { match: text, startMap, endMap } = view;
  return extractLinks(text).map((link) => {
    const assessment = assessLink(link.url);
    return {
      ruleId: assessment.suspicious ? "LNK-02" : "LNK-01",
      tactic: assessment.suspicious ? "suspicious_link" : "link_present",
      severity: assessment.suspicious ? 3 : 1,
      lang: "any",
      description: assessment.suspicious ? "Link with suspicious characteristics" : "Contains a link",
      categories: assessment.suspicious ? { bank_kyc: 1, delivery_fee: 1, general: 1 } : { general: 0 },
      start: startMap[link.start],
      end: endMap[link.end - 1],
      linkReasons: assessment.reasons,
      host: assessment.host
    };
  });
}
function resolveOverlaps(candidates) {
  const ordered = [...candidates].sort(
    (a, b) => b.severity - a.severity || b.end - b.start - (a.end - a.start) || a.start - b.start || a.ruleId.localeCompare(b.ruleId)
  );
  const accepted = [];
  for (const candidate of ordered) {
    const overlaps = accepted.some((kept) => candidate.start < kept.end && kept.start < candidate.end);
    if (!overlaps) accepted.push(candidate);
  }
  return accepted.sort((a, b) => a.start - b.start);
}
function verifySignals(text, signals) {
  const verified = [];
  let discarded = 0;
  for (const signal of signals) {
    const atPosition = text.slice(signal.start, signal.end);
    const ok = typeof signal.quote === "string" && signal.quote.length > 0 && atPosition === signal.quote && text.includes(signal.quote);
    if (ok) verified.push({ ...signal, verified: true });
    else discarded += 1;
  }
  return { verified, discarded };
}
var REWARD_FOLLOW_UPS = /* @__PURE__ */ new Set(["advance_fee", "credential_request", "payment_redirect", "suspicious_link"]);
var REPEAT_BONUS_TACTICS = /* @__PURE__ */ new Set([
  "reward_bait",
  "unrealistic_offer",
  "advance_fee",
  "credential_request",
  "payment_redirect",
  "blackmail",
  "emotional_pressure"
]);
var MAX_BONUS = 3;
var HIDDEN_CHARS_POINTS = 2;
function scoreSignals(signals, { hiddenCharacters = false } = {}) {
  const byRule = /* @__PURE__ */ new Map();
  const phrasesByRule = /* @__PURE__ */ new Map();
  for (const signal of signals) {
    const current = byRule.get(signal.ruleId) || 0;
    byRule.set(signal.ruleId, Math.max(current, signal.severity));
    const phrases = phrasesByRule.get(signal.ruleId) || /* @__PURE__ */ new Set();
    phrases.add(signal.quote.toLowerCase());
    phrasesByRule.set(signal.ruleId, phrases);
  }
  let score = 0;
  let strongChecks = 0;
  for (const severity of byRule.values()) {
    score += severity;
    if (severity >= 3) strongChecks += 1;
  }
  const adjustments = [];
  for (const [ruleId, severity] of byRule.entries()) {
    const tactic = signals.find((x) => x.ruleId === ruleId).tactic;
    if (severity >= 2 && REPEAT_BONUS_TACTICS.has(tactic) && phrasesByRule.get(ruleId).size >= 2) {
      adjustments.push({ kind: "repeat", points: 1, note: `Several different phrases matched rule ${ruleId}.` });
    }
  }
  const tactics = new Set(signals.map((x) => x.tactic));
  if (tactics.has("reward_bait") && [...REWARD_FOLLOW_UPS].some((t) => tactics.has(t))) {
    adjustments.push({ kind: "combo", points: 1, note: "A reward or prize combined with a payment, credential or link request." });
  }
  if (tactics.has("threat") && tactics.has("suspicious_link")) {
    adjustments.push({ kind: "combo", points: 1, note: "A threat combined with a suspicious link." });
  }
  let bonus = 0;
  const kept = [];
  for (const adj of adjustments) {
    if (bonus + adj.points > MAX_BONUS) break;
    bonus += adj.points;
    kept.push(adj);
  }
  if (hiddenCharacters) {
    bonus += HIDDEN_CHARS_POINTS;
    kept.push({ kind: "hidden", points: HIDDEN_CHARS_POINTS, note: "The message contains hidden or full-width characters, often used to dodge filters." });
  }
  return { score: score + bonus, matchedChecks: byRule.size, strongChecks, adjustments: kept };
}
function pickBand({ score, strongChecks }) {
  if (score >= THRESHOLDS.high || strongChecks >= THRESHOLDS.strongChecksForHigh) return BANDS.high;
  if (score >= THRESHOLDS.medium) return BANDS.medium;
  return BANDS.low;
}
function pickCategory(signals, band) {
  const totals = {};
  const seenRules = /* @__PURE__ */ new Set();
  for (const signal of signals) {
    if (seenRules.has(signal.ruleId)) continue;
    seenRules.add(signal.ruleId);
    for (const [key, weight] of Object.entries(signal.categories || {})) {
      totals[key] = (totals[key] || 0) + weight;
    }
  }
  const order = Object.keys(CATEGORY_LABELS);
  let best = null;
  for (const key of order) {
    if (key === "general" || key === "unclassified") continue;
    const value = totals[key] || 0;
    if (value > 0 && (!best || value > best.value)) best = { key, value };
  }
  if (best && (band.key !== "low" || best.value >= 3)) return best.key;
  if (band.key !== "low") return "general";
  return "unclassified";
}
function buildUncertainty({ text, links, band, language, hiddenCharacters }) {
  const notes = ["JaalBreak cannot confirm who sent this message."];
  if (links.length > 0) {
    notes.push("We did not open or verify any link. Its real destination is unknown.");
  }
  if (band.key === "low") {
    notes.push("Finding few warning signs is not a guarantee that the message is safe.");
  } else {
    notes.push("Matching patterns are warning signs, not proof of fraud.");
  }
  if (language.note) notes.push(language.note);
  if (hiddenCharacters) {
    notes.push("This message contains hidden or full-width characters. Scammers use them to hide words from filters, so treat it with extra care.");
  }
  if (text.trim().length < 40) {
    notes.push("Very short messages give the rules little to work with.");
  }
  return notes;
}
function analyzeMessage(rawText, options = {}) {
  const text = normaliseInput(rawText).slice(0, MAX_INPUT_LENGTH);
  if (!text.trim()) {
    throw new Error("Please paste or type a message before analysing.");
  }
  const language = detectLanguage(text);
  const view = buildMatchView(text);
  const hiddenCharacters = HIDDEN_CHARS_RE.test(text) || FULLWIDTH_LETTER_RE.test(text);
  const candidates = [...findRuleCandidates(view), ...findLinkCandidates(view)];
  const resolved = resolveOverlaps(candidates).map((candidate, index) => {
    const tactic = getTactic(candidate.tactic);
    return {
      id: `sig-${index + 1}`,
      ...candidate,
      quote: text.slice(candidate.start, candidate.end),
      tacticLabel: tactic.label,
      tacticShort: tactic.short,
      why: tactic.why,
      doInstead: tactic.doInstead
    };
  });
  const { verified: signals, discarded } = verifySignals(text, resolved);
  const { score, matchedChecks, strongChecks, adjustments } = scoreSignals(signals, { hiddenCharacters });
  const band = pickBand({ score, strongChecks });
  const categoryKey = pickCategory(signals, band);
  const advice = CATEGORY_ADVICE[categoryKey] || CATEGORY_ADVICE.general;
  const links = extractLinks(view.match).map((link) => assessLink(link.url));
  const tactics = [...new Set(signals.map((s) => s.tactic))];
  return {
    mode: "rules-only",
    rulesVersion: RULES_VERSION,
    analyzedAt: (/* @__PURE__ */ new Date()).toISOString(),
    source: options.source || "pasted",
    text,
    language,
    signals,
    discardedQuotes: discarded,
    score,
    scoreAdjustments: adjustments,
    hiddenCharacters,
    matchedChecks,
    strongChecks,
    tactics,
    band,
    category: { key: categoryKey, label: CATEGORY_LABELS[categoryKey] },
    advice: { headline: advice.headline, steps: advice.steps },
    universalSteps: UNIVERSAL_STEPS,
    links,
    uncertainty: buildUncertainty({ text, links, band, language, hiddenCharacters })
  };
}
function buildSummary(result) {
  const lines = [];
  lines.push("JaalBreak analysis (rules-only prototype)");
  lines.push(`Assessment: ${result.band.label}`);
  lines.push(`Category: ${result.category.label}`);
  lines.push(`Matched checks: ${result.matchedChecks} across ${result.tactics.length} tactic(s)`);
  lines.push("");
  if (result.signals.length) {
    lines.push("Evidence found in the message:");
    for (const s of result.signals) {
      lines.push(`- "${s.quote}" \u2014 ${s.tacticLabel}`);
    }
  } else {
    lines.push("No warning patterns matched.");
  }
  lines.push("");
  lines.push(`Next step: ${result.advice.headline}`);
  for (const step of result.advice.steps) lines.push(`- ${step}`);
  lines.push("");
  lines.push("Limitations:");
  for (const note of result.uncertainty) lines.push(`- ${note}`);
  lines.push("");
  lines.push("JaalBreak highlights suspicious patterns; it does not prove fraud or safety.");
  return lines.join("\n");
}
export {
  BANDS,
  MAX_INPUT_LENGTH,
  RULES_VERSION,
  THRESHOLDS,
  analyzeMessage,
  buildMatchView,
  buildSummary,
  detectLanguage,
  normaliseInput,
  verifySignals
};
