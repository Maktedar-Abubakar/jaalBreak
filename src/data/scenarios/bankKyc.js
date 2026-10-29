// Scenario: Bank KYC suspension threat.
// All names, numbers and links are fictional. See fakeInternship.js for the format.

const bankKyc = {
  id: 'bank-kyc',
  title: 'The KYC suspension warning',
  pressure: 'Threat of account blocking and a link asking for details',
  objective: 'Use the bank’s official app or contact details, not the message link.',
  persona: 'You have a savings account with Meridian Bank and use its mobile app every week.',
  start: 'sms',
  steps: {
    sms: {
      stage: 1,
      situation: 'At 9:40 PM an SMS arrives from a sender ID that looks like your bank.',
      message: {
        from: 'VM-MRDNBK',
        channel: 'SMS',
        text:
          'Dear Customer, your Meridian Bank account will be BLOCKED today due to pending KYC. Update now to avoid suspension: http://meridian-kyc-update.xyz',
      },
      tactics: ['generic_greeting', 'threat', 'urgency', 'verification_pretext', 'suspicious_link'],
      warningSigns: [
        '“Blocked today” deadline at night',
        'A KYC update requested through a link',
        'A “.xyz” web address that is not the bank’s',
      ],
      question: 'What do you do?',
      choices: [
        {
          id: 'tapLink',
          label: 'Tap the link and update quickly before the account is blocked.',
          rating: 'risky',
          next: 'fakePage',
          tactics: ['suspicious_link', 'threat'],
          consequence: 'A page opens with your bank’s logo and colours, asking for your Customer ID and password.',
          explanation:
            'The fear of a blocked account pushed you to act fast. Look-alike pages copy logos easily; the web address is the giveaway.',
          nextAction: 'Close the page. Never sign in through a link sent by SMS.',
        },
        {
          id: 'callNumber',
          label: 'Call the “customer care” number that arrives in a follow-up SMS.',
          rating: 'caution',
          next: 'fakeAgent',
          tactics: ['impersonation'],
          consequence: 'A polite “bank executive” answers, already knowing your name and the last four digits of your card.',
          explanation:
            'Calling seems safer than a link, but a number from the same sender leads to the same people. Partial details are often leaked or guessed.',
          nextAction: 'Only call the number printed on your card or on the bank’s official website.',
        },
        {
          id: 'officialApp',
          label: 'Open the Meridian Bank app you already have installed.',
          rating: 'safer',
          next: 'appClear',
          tactics: ['verification_pretext'],
          consequence: 'The app shows your KYC as complete and your account as active. No alerts.',
          explanation:
            'You checked through a channel you already trust. Banks show genuine account problems inside their official app and branch, not only by SMS.',
          nextAction: 'You can report the SMS on Chakshu (sancharsaathi.gov.in/sfc).',
        },
      ],
    },

    fakePage: {
      stage: 2,
      situation: 'The page now asks for your Customer ID, password and then the OTP “to verify your identity”.',
      message: {
        from: 'meridian-kyc-update.xyz',
        channel: 'Web page',
        text: 'Enter the 6-digit OTP sent to your registered mobile to complete KYC re-verification.',
      },
      tactics: ['credential_request', 'impersonation', 'suspicious_link'],
      warningSigns: ['A web page asking for your OTP', 'The OTP SMS mentions a payment, not KYC'],
      question: 'What do you do?',
      choices: [
        {
          id: 'enterOtp',
          label: 'Enter your details and the OTP to finish quickly.',
          rating: 'risky',
          next: 'debited',
          tactics: ['credential_request'],
          consequence: 'The page says “KYC updated successfully”.',
          explanation:
            'An OTP authorises an action, often a payment. Sharing it with any page or person hands them control. The OTP SMS itself usually says what it is for.',
          nextAction: 'If you ever do this, call 1930 and your bank immediately.',
        },
        {
          id: 'closePage',
          label: 'Stop, close the page and check the app instead.',
          rating: 'safer',
          next: 'family',
          tactics: ['suspicious_link'],
          consequence: 'You close the page without entering anything. The app shows your account is fine.',
          explanation:
            'You noticed the mismatch in time. Stopping mid-way is always possible, and always worth it.',
          nextAction: 'If you typed a password on the page, change it from the official app now.',
        },
      ],
    },

    fakeAgent: {
      stage: 2,
      situation: 'The “executive” says he will fix your KYC on the call.',
      message: {
        from: '“Meridian Bank KYC desk”',
        channel: 'Phone call',
        text:
          '“I am sending a code to your phone. Please read it out to me for verification. Also install the Meridian Support app from this link so I can help you faster.”',
      },
      tactics: ['credential_request', 'remote_access', 'impersonation'],
      warningSigns: ['Asked to read out a code', 'Asked to install a support or screen-sharing app'],
      question: 'What do you do?',
      choices: [
        {
          id: 'readOtp',
          label: 'Read out the code. He clearly works at the bank.',
          rating: 'risky',
          next: 'debited',
          tactics: ['credential_request', 'impersonation'],
          consequence: 'He thanks you and says KYC will update within 24 hours.',
          explanation:
            'Knowing your name or card digits does not prove someone works for your bank. Bank staff never ask for OTPs or remote access.',
          nextAction: 'Never read an OTP aloud to anyone, for any reason.',
        },
        {
          id: 'hangUp',
          label: 'Hang up and call the number printed on your debit card.',
          rating: 'safer',
          next: 'family',
          tactics: ['impersonation'],
          consequence: 'The real bank confirms your KYC is complete and that they made no such call.',
          explanation: 'You broke the call and re-contacted the bank through a channel you know is genuine.',
          nextAction: 'Report the caller’s number on Chakshu.',
        },
      ],
    },

    appClear: {
      stage: 2,
      situation: 'An hour later, a second SMS arrives.',
      message: {
        from: 'VM-MRDNBK',
        channel: 'SMS',
        text: 'FINAL WARNING: KYC pending. Account will be suspended in 30 minutes. Update: http://meridian-kyc-update.xyz',
      },
      tactics: ['urgency', 'threat'],
      warningSigns: ['A shorter deadline that contradicts what the app shows'],
      question: 'What do you do?',
      choices: [
        {
          id: 'doubtApp',
          label: 'Maybe the app is out of date. Tap the link just to be sure.',
          rating: 'risky',
          next: 'debited',
          tactics: ['urgency', 'suspicious_link'],
          consequence: 'You enter your details and an OTP on the page before noticing the address.',
          explanation:
            'The repeated warning made you doubt a trusted source. Escalating deadlines are designed to override what you have already checked.',
          nextAction: 'Trust what your official app shows over what an SMS claims.',
        },
        {
          id: 'trustApp',
          label: 'Trust the app. Report the SMS on Chakshu and delete it.',
          rating: 'safer',
          next: 'family',
          tactics: ['threat'],
          consequence: 'Nothing happens to your account. The deadline was invented.',
          explanation: 'You relied on verified information rather than pressure.',
          nextAction: 'Consider setting up transaction alerts in the official app.',
        },
      ],
    },

    debited: {
      stage: 3,
      situation: 'A few minutes later your phone buzzes.',
      message: {
        from: 'Meridian Bank',
        channel: 'SMS',
        text: 'Rs 49,999.00 debited from A/c XX4821 via IMPS. Not you? Contact the bank immediately.',
      },
      tactics: ['credential_request'],
      warningSigns: ['The OTP you shared approved a transfer'],
      question: 'What is your next move?',
      choices: [
        {
          id: 'wait',
          label: 'Wait until morning to see if the bank reverses it automatically.',
          rating: 'risky',
          end: 'lost',
          tactics: ['credential_request'],
          consequence: 'By morning, the money has moved through several accounts.',
          explanation: 'Fraudulent transfers are moved on quickly. Banks do not reverse them automatically without a report.',
          nextAction: 'Report the same hour. Speed matters more than anything else here.',
        },
        {
          id: 'act',
          label: 'Call 1930 now, block the account via the official app or card number, then file at cybercrime.gov.in.',
          rating: 'safer',
          end: 'recovering',
          tactics: ['credential_request'],
          consequence: 'Your complaint is logged with the transaction reference within minutes.',
          explanation:
            'Calling 1930 quickly gives the best chance of the transfer being flagged. Recovery is not guaranteed, but delay makes it much harder.',
          nextAction: 'Keep the SMS, the web address and timings for your complaint.',
        },
      ],
    },

    family: {
      stage: 3,
      situation: 'Your father forwards you the same SMS and asks whether he should update his KYC.',
      message: {
        from: 'Papa',
        channel: 'WhatsApp',
        text: 'Got this message from the bank. Should I click and update? It says blocked today.',
      },
      tactics: ['verification_pretext', 'suspicious_link'],
      warningSigns: ['Older relatives are frequent targets of the same message'],
      question: 'What do you tell him?',
      choices: [
        {
          id: 'dismiss',
          label: '“Probably fine, just do what it says.”',
          rating: 'risky',
          end: 'familyAtRisk',
          tactics: ['suspicious_link'],
          consequence: 'He opens the link and starts entering his details.',
          explanation: 'You knew the pattern but did not pass it on. A quick explanation would have protected him.',
          nextAction: 'Call him back now and ask him to stop.',
        },
        {
          id: 'explain',
          label: 'Explain the warning signs and show him how to check in the official app.',
          rating: 'safer',
          end: 'protectedShared',
          tactics: ['verification_pretext'],
          consequence: 'He checks the app, sees no problem and deletes the SMS.',
          explanation: 'You passed on a habit he can use for every future message: check the official app, never the link.',
          nextAction: 'Remind him: banks never ask for an OTP or PIN.',
        },
      ],
    },
  },

  endings: {
    protectedShared: {
      tone: 'safe',
      title: 'Your account and your family are safe',
      summary: 'You checked through the official app and helped your father do the same.',
    },
    familyAtRisk: {
      tone: 'partial',
      title: 'You were safe, but your family was exposed',
      summary: 'You avoided the scam yourself. Sharing what you know is part of staying safe.',
    },
    recovering: {
      tone: 'partial',
      title: 'Money was taken, but you acted fast',
      summary: 'You reported within minutes, which gives the best chance of action. Recovery is not guaranteed.',
    },
    lost: {
      tone: 'loss',
      title: 'The money was moved on',
      summary: 'Waiting gave the fraudsters time. In real life, call 1930 as soon as you see an unknown debit.',
    },
  },

  checklist: [
    'Banks do not block accounts through SMS links.',
    'Check KYC only in the official app, the official website you type yourself, or at a branch.',
    'Never share or read out an OTP, PIN or password — to anyone.',
    'Never install screen-sharing apps at a caller’s request.',
    'Unknown debit? Call 1930 immediately and block through official channels.',
  ],
};

export default bankKyc;
