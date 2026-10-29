// ---------------------------------------------------------------------------
// Sample messages for demos. ALL names, numbers, links and organisations are
// fictional. Do not replace them with real brands.
// ---------------------------------------------------------------------------

export const SAMPLE_MESSAGES = [
  {
    id: 'bank-kyc',
    label: 'Bank account suspension / KYC warning',
    channel: 'SMS',
    text:
      'Dear Customer, your Meridian Bank account will be SUSPENDED within 24 hours due to incomplete KYC. Update your KYC immediately at http://meridian-kyc-verify.xyz/update and enter the OTP sent to your phone to confirm. Ignore this and your account will be permanently blocked. - Meridian Bank Team',
  },
  {
    id: 'internship-fee',
    label: 'Fake internship registration fee',
    channel: 'WhatsApp',
    text:
      'Congratulations! You have been selected for the Data Analyst Internship at Nexora Global. Your internship is confirmed. Pay ₹2,500 registration fee today or your slot will be cancelled. Contact us on Telegram only: @nexora_hr_desk. Seats are limited.',
  },
  {
    id: 'legit-delivery',
    label: 'Routine delivery notification (legitimate-looking)',
    channel: 'SMS',
    text:
      'Hi Priya, your order #48213 from Northwind Store was delivered today at 2:14 PM. You can view the delivery photo or request a return from the Orders section of the Northwind app. Northwind will never ask you to share your OTP, PIN or bank details.',
  },
  {
    id: 'hindi-kyc',
    label: 'Hindi: account block threat with OTP request',
    channel: 'SMS',
    text:
      'प्रिय ग्राहक, आपका बैंक खाता आज रात बंद हो जाएगा। तुरंत KYC अपडेट करें और OTP भेजें: http://kyc-sahayata.top/form',
  },
  {
    id: 'family-emergency',
    label: 'Family emergency on a new number',
    channel: 'WhatsApp',
    text:
      "Ammi it's me, I lost my phone, this is my new number. I'm in trouble at the hospital, please transfer ₹18,000 to this UPI immediately. Don't tell papa, I'll explain later.",
  },
  {
    id: 'insta-copyright',
    label: 'Instagram: fake copyright appeal (account takeover)',
    channel: 'Instagram DM',
    text:
      'Instagram Copyright Help Center: Your recent post violates copyright law and has been reported. If you think this is a mistake, submit an appeal here within 24 hours or your account will be permanently deleted: http://lnstagram-appeal-center.xyz/form',
  },
  {
    id: 'insta-code',
    label: 'Instagram: "send me the code" from a friend',
    channel: 'Instagram DM',
    text: 'Hey! I sent a code to your number by mistake while logging in, can you send me a screenshot of it please? It is from Instagram. Urgent!',
  },
  {
    id: 'e-challan',
    label: 'Fake traffic e-challan with an app file',
    channel: 'WhatsApp',
    text:
      'Dear vehicle owner, your traffic e-challan of Rs 1,000 is pending. Pay today to avoid legal action. Download the RTO-eChallan.apk to view the photo and pay.',
  },
  {
    id: 'digital-arrest',
    label: 'Hinglish: digital arrest call script',
    channel: 'Phone / video call',
    text:
      'Crime Branch se bol raha hoon. Aapke Aadhaar se linked account par money laundering ka case hai. Video call par rahiye, call mat kaatiye, kisi ko mat batana. Verification ke liye paise safe account mein transfer kariye.',
  },
  {
    id: 'kannada-kyc',
    label: 'Kannada: account block + OTP request (beta)',
    channel: 'SMS',
    text: 'ಆತ್ಮೀಯ ಗ್ರಾಹಕರೇ, ನಿಮ್ಮ ಖಾತೆ ಇಂದು ಬ್ಲಾಕ್ ಆಗುತ್ತದೆ. ತಕ್ಷಣ KYC ಅಪ್ಡೇಟ್ ಮಾಡಿ ಮತ್ತು OTP ಹಂಚಿಕೊಳ್ಳಿ: http://kyc-sahaya.top',
  },
  {
    id: 'electricity',
    label: 'Electricity cut "tonight 9.30" (broken English)',
    channel: 'SMS',
    text:
      'Dear consumer your electricity power will be disconnect tonight at 9.30 pm from electricity office because your previous month bill was not update. Please contact electricity officer 9876543210 immediately. Thank you',
  },
];

// The illustrative example shown on the Overview page.
export const ILLUSTRATIVE_EXAMPLE = SAMPLE_MESSAGES[1];

// Transcript of the bundled sample screenshot (public/samples/sample-sms-screenshot.png).
// Used as a demo fallback if OCR cannot run (for example, no internet for the
// OCR language files).
export const SAMPLE_SCREENSHOT = {
  src: '/samples/sample-sms-screenshot.png',
  transcript:
    'SwiftParcel: Your parcel is on hold at our facility due to unpaid customs fee of Rs.49. Pay within 12 hours or it will be returned to sender. Pay now: http://swiftparcel-redeliver.top/pay',
};
