// ---------------------------------------------------------------------------
// Shared tactic vocabulary.
// Used by BOTH the message analyzer (Manipulation X-Ray) and the Scam Journey
// Simulator, so users learn one consistent set of names.
// To add a tactic: add an entry here, then reference its key in rules.js or
// in a scenario file.
// ---------------------------------------------------------------------------

export const TACTICS = {
  urgency: {
    label: 'Urgency / time pressure',
    short: 'Urgency',
    why: 'A short deadline discourages you from pausing to check. Genuine organisations rarely require action within minutes or hours.',
    doInstead: 'Slow down. Any real deadline will still exist after you verify through an official channel you find yourself.',
  },
  threat: {
    label: 'Threat of loss or penalty',
    short: 'Threat',
    why: 'Warning that an account, service or opportunity will be blocked or cancelled creates fear, which makes careful checking harder.',
    doInstead: 'Check the status yourself in the official app, or call the number printed on your card or on the official website.',
  },
  advance_fee: {
    label: 'Upfront-payment request',
    short: 'Upfront fee',
    why: 'You are asked to pay money to secure a job, prize, parcel or service. Legitimate employers and most genuine services do not charge to release an opportunity.',
    doInstead: 'Do not pay. Verify the offer through the organisation\'s official website or careers page, not through contacts given in the message.',
  },
  credential_request: {
    label: 'Request for OTP, PIN or password',
    short: 'Credential request',
    why: 'An OTP, PIN, password or CVV gives direct control over your money or accounts. Banks and genuine services do not ask you to share them.',
    doInstead: 'Never share an OTP, PIN, password or CVV with anyone, including someone who says they are from your bank.',
  },
  verification_pretext: {
    label: 'Official-sounding pretext (KYC / verification)',
    short: 'Verification pretext',
    why: 'Phrases like "update your KYC" make a request sound routine and official, which lowers suspicion before a link or data request.',
    doInstead: 'Complete KYC only inside your bank\'s official app or at a branch. Do not use links or numbers from the message.',
  },
  impersonation: {
    label: 'Claimed authority or identity',
    short: 'Impersonation',
    why: 'The sender claims to be a bank, government body, police, courier or a person you know. Anyone can type a name into a message.',
    doInstead: 'Contact the organisation or person through a number or website you already know is genuine.',
  },
  suspicious_link: {
    label: 'Suspicious link',
    short: 'Suspicious link',
    why: 'The link uses a shortener, an unusual domain ending, an IP address, or words such as "kyc" or "verify" that copy official wording.',
    doInstead: 'Do not open the link. Type the official website address yourself or use the official app.',
  },
  link_present: {
    label: 'Contains a link',
    short: 'Link',
    why: 'Links are not suspicious on their own, but JaalBreak does not open or verify them, so their destination is unknown.',
    doInstead: 'If the message is unexpected, reach the service through its official app or a website address you type yourself.',
  },
  channel_switch: {
    label: 'Channel switching',
    short: 'Channel switch',
    why: 'The sender pushes the conversation to Telegram, WhatsApp or a personal number, away from official, traceable channels.',
    doInstead: 'Verify the organisation independently before continuing. Official processes use official channels.',
  },
  reward_bait: {
    label: 'Unexpected reward or selection',
    short: 'Reward bait',
    why: 'An unexpected prize, refund, offer or selection creates excitement that can override caution.',
    doInstead: 'Ask yourself whether you entered or applied. Verify on the official website before replying or paying anything.',
  },
  secrecy: {
    label: 'Request for secrecy',
    short: 'Secrecy',
    why: 'Being told not to tell anyone isolates you from people who could spot the scam.',
    doInstead: 'Talk to someone you trust before acting. A genuine request will survive a second opinion.',
  },
  emotional_pressure: {
    label: 'Emotional pressure / emergency',
    short: 'Emotional pressure',
    why: 'A story about an accident, arrest or emergency involving someone you love is designed to trigger panic and fast payment.',
    doInstead: 'Call the person on the number you already have, or someone close to them, before sending anything.',
  },
  remote_access: {
    label: 'Remote-access request',
    short: 'Remote access',
    why: 'Screen-sharing or remote-control apps can let a stranger see your OTPs and operate your phone or computer.',
    doInstead: 'Do not install apps or share your screen at a stranger\'s request.',
  },
  payment_redirect: {
    label: 'Unusual payment method',
    short: 'Payment redirect',
    why: 'Requests to pay a personal UPI ID, scan a QR code to "receive" money, or buy gift cards are common in fraud. You never need to enter a UPI PIN to receive money.',
    doInstead: 'Pay only through official websites or apps. Remember: a UPI PIN is only needed to send money, never to receive it.',
  },
  blackmail: {
    label: 'Blackmail / threat to expose private content',
    short: 'Blackmail',
    why: 'The sender claims to hold private photos, videos or chats and demands money to keep them hidden. Paying rarely stops the threats; it usually leads to more demands.',
    doInstead: 'Do not pay. Stop replying, take screenshots as evidence, block the sender and report it on cybercrime.gov.in or call 1930.',
  },
  unrealistic_offer: {
    label: 'Unrealistic earnings or returns',
    short: 'Unrealistic offer',
    why: 'Guaranteed returns or high pay for simple tasks are a common hook for task-based and investment scams.',
    doInstead: 'Be sceptical of guaranteed money. Research the company through independent sources before engaging.',
  },
  account_hijack: {
    label: 'Account takeover trick',
    short: 'Account takeover',
    why: 'The message is trying to get your login, the reset link or code sent to you, or to change your login email. With any one of these, the sender can lock you out of your Instagram, Facebook or WhatsApp and use it to scam your followers.',
    doInstead: 'Never send codes, reset links or screenshots of them to anyone. Instagram and Meta never DM you about copyright or badges. Open the app yourself and check Settings → Security.',
  },
  app_install: {
    label: 'Install an app from a link',
    short: 'App install',
    why: 'A file ending in .apk installs an app outside the Play Store. Fake "RTO challan", bank and KYC apps read your SMS and OTPs and can empty your account.',
    doInstead: 'Never install an app sent in a message. Get apps only from the Play Store, and pay challans only on the official Parivahan website.',
  },
  generic_greeting: {
    label: 'Generic greeting',
    short: 'Generic greeting',
    why: 'Greetings like "Dear Customer" are weak evidence alone, because many genuine messages use them too. They matter only alongside other signs.',
    doInstead: 'Treat this as minor context. Look at what the message is actually asking you to do.',
  },
};

export function getTactic(key) {
  return (
    TACTICS[key] || {
      label: key,
      short: key,
      why: 'No description available for this tactic.',
      doInstead: 'Verify through an official channel before acting.',
    }
  );
}
