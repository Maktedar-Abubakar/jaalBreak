// Scenario: Fake delivery / customs fee.
// All names, numbers and links are fictional. See fakeInternship.js for the format.

const deliveryFee = {
  id: 'delivery-fee',
  title: 'The parcel on hold',
  pressure: 'Small urgent payment to release a parcel',
  objective: 'Check tracking through the official courier website or app.',
  persona: 'You ordered a phone case online last week and are waiting for it to arrive.',
  start: 'sms',
  steps: {
    sms: {
      stage: 1,
      situation: 'An SMS arrives about a parcel.',
      message: {
        from: 'AX-SWFTPL',
        channel: 'SMS',
        text:
          'SwiftParcel: Your parcel is on hold at our facility due to unpaid customs fee of Rs.49. Pay within 12 hours or it will be returned to sender: http://swiftparcel-redeliver.top/pay',
      },
      tactics: ['advance_fee', 'urgency', 'threat', 'suspicious_link'],
      warningSigns: [
        'A small fee that feels harmless',
        'A 12-hour deadline',
        'A “.top” payment link with “redeliver” in it',
      ],
      question: 'What do you do?',
      choices: [
        {
          id: 'payLink',
          label: 'It is only ₹49. Pay through the link and get it over with.',
          rating: 'risky',
          next: 'cardPage',
          tactics: ['advance_fee', 'suspicious_link'],
          consequence: 'A payment page asks for your full card number, expiry date and CVV.',
          explanation:
            'The small amount made it feel low-risk. The real target is your card details and the OTP that follows, not the ₹49.',
          nextAction: 'Never enter card details on a page you reached from an SMS link.',
        },
        {
          id: 'reply',
          label: 'Reply to the SMS asking which parcel this is.',
          rating: 'caution',
          next: 'reply',
          tactics: ['impersonation'],
          consequence: 'You get a quick, confident reply.',
          explanation:
            'Asking the sender to prove themselves gives them a chance to perform. Verification has to come from a source you choose.',
          nextAction: 'Use the tracking number from your order confirmation on the official site.',
        },
        {
          id: 'track',
          label: 'Open the store’s official app and check the tracking for your order.',
          rating: 'safer',
          next: 'tracked',
          tactics: ['impersonation'],
          consequence: 'Tracking shows: “Out for delivery tomorrow. No charges due.” The courier is not even SwiftParcel.',
          explanation: 'You verified through the official channel attached to your actual order. The SMS was a guess.',
          nextAction: 'You can ignore and report the SMS.',
        },
      ],
    },

    cardPage: {
      stage: 2,
      situation: 'After you enter your card details, an OTP arrives.',
      message: {
        from: 'Your bank',
        channel: 'SMS',
        text: 'OTP 482913 for a transaction of Rs 4,999.00 at SWFT-PAYMENTS. Do not share this OTP with anyone.',
      },
      tactics: ['credential_request', 'suspicious_link'],
      warningSigns: ['The OTP is for ₹4,999, not ₹49'],
      question: 'The page is asking for the OTP. What do you do?',
      choices: [
        {
          id: 'enterOtp',
          label: 'Enter the OTP. The page said ₹49, so it must be fine.',
          rating: 'risky',
          next: 'charged',
          tactics: ['credential_request'],
          consequence: 'The page shows “Payment successful”.',
          explanation:
            'The OTP message stated the real amount. Reading the OTP SMS carefully is one of the best last-second checks you have.',
          nextAction: 'Always read what an OTP is for before using it.',
        },
        {
          id: 'stop',
          label: 'Notice the amount mismatch and stop.',
          rating: 'safer',
          next: 'exposed',
          tactics: ['credential_request'],
          consequence: 'No money moves. But your card details have already been typed into the fake page.',
          explanation: 'Stopping at the OTP prevented the payment. The card details are still exposed, though.',
          nextAction: 'Block or reissue the card through your bank’s official app.',
        },
      ],
    },

    reply: {
      stage: 2,
      situation: 'The sender replies within a minute.',
      message: {
        from: 'AX-SWFTPL',
        channel: 'SMS',
        text: 'Sir/Madam it is your mobile accessory parcel. Pay now to avoid return. Link valid for 2 hours only.',
      },
      tactics: ['impersonation', 'urgency'],
      warningSigns: ['A vague description that fits most online orders', 'A deadline that keeps shrinking'],
      question: 'Do you believe them?',
      choices: [
        {
          id: 'believe',
          label: 'They know it is a phone accessory, so it must be real. Pay.',
          rating: 'risky',
          next: 'charged',
          tactics: ['impersonation'],
          consequence: 'You enter card details and an OTP. A larger amount than ₹49 is debited.',
          explanation:
            '“Mobile accessory” is a lucky guess that fits millions of people. Scammers send these messages in bulk and wait for one to match.',
          nextAction: 'Treat vague details as no proof at all.',
        },
        {
          id: 'checkOfficial',
          label: 'That could fit anyone. Check the official tracking instead.',
          rating: 'safer',
          next: 'neighbour',
          tactics: ['urgency'],
          consequence: 'Official tracking shows no fees due.',
          explanation: 'You noticed that the “proof” was generic and returned to a trusted source.',
          nextAction: 'Report the number on Chakshu.',
        },
      ],
    },

    tracked: {
      stage: 2,
      situation: 'You now know the SMS is fake.',
      message: null,
      tactics: ['impersonation'],
      warningSigns: ['The same SMS is likely sent to thousands of people'],
      question: 'What do you do with the message?',
      choices: [
        {
          id: 'delete',
          label: 'Just delete it.',
          rating: 'caution',
          next: 'neighbour',
          tactics: ['impersonation'],
          consequence: 'You are safe, but the number stays active for its next target.',
          explanation: 'Deleting protects you. Reporting also helps authorities act on the number.',
          nextAction: 'Reporting takes about two minutes at sancharsaathi.gov.in/sfc.',
        },
        {
          id: 'report',
          label: 'Report it on Chakshu, then delete it.',
          rating: 'safer',
          next: 'neighbour',
          tactics: ['impersonation'],
          consequence: 'Your report is submitted with the sender ID and the link.',
          explanation: 'You protected yourself and contributed to stopping the campaign.',
          nextAction: 'Keep watching for follow-up messages from similar senders.',
        },
      ],
    },

    charged: {
      stage: 3,
      situation: 'Your bank sends a debit alert.',
      message: {
        from: 'Your bank',
        channel: 'SMS',
        text: 'Rs 4,999.00 spent on your card XX7731 at SWFT-PAYMENTS.',
      },
      tactics: ['credential_request'],
      warningSigns: ['A debit far larger than the fee you were shown'],
      question: 'What do you do now?',
      choices: [
        {
          id: 'askRefund',
          label: 'Reply to the SwiftParcel SMS and ask for a refund.',
          rating: 'risky',
          end: 'lostMore',
          tactics: ['impersonation'],
          consequence: 'They offer a “refund link” that asks for your card details again.',
          explanation: 'Asking the scammer for help gives them another opportunity.',
          nextAction: 'Only deal with your bank and official complaint channels.',
        },
        {
          id: 'blockReport',
          label: 'Block the card in the official app, call 1930 and file at cybercrime.gov.in.',
          rating: 'safer',
          end: 'recovering',
          tactics: ['credential_request'],
          consequence: 'The card is blocked and your complaint is logged within minutes.',
          explanation: 'Blocking stops further charges; reporting quickly gives the best chance of action.',
          nextAction: 'Ask your bank about raising a dispute for the card transaction.',
        },
      ],
    },

    exposed: {
      stage: 3,
      situation: 'No money was taken, but your card number, expiry and CVV were typed into the fake page.',
      message: null,
      tactics: ['credential_request'],
      warningSigns: ['Card details can be misused later'],
      question: 'What do you do?',
      choices: [
        {
          id: 'nothing',
          label: 'Nothing. No money was lost, so it is fine.',
          rating: 'risky',
          end: 'exposed',
          tactics: ['credential_request'],
          consequence: 'Your details remain with the scammers and could be tried again later.',
          explanation: 'Stolen card details are often used days later or sold on.',
          nextAction: 'Block or reissue the card even if no money has moved yet.',
        },
        {
          id: 'reissue',
          label: 'Block and reissue the card through the official bank app, and watch your statements.',
          rating: 'safer',
          end: 'protected',
          tactics: ['credential_request'],
          consequence: 'The old card is blocked; a new one is on the way.',
          explanation: 'You closed the remaining risk instead of hoping for the best.',
          nextAction: 'Report the SMS and link on Chakshu.',
        },
      ],
    },

    neighbour: {
      stage: 3,
      situation: 'Your elderly neighbour shows you the same SMS and asks you to help her pay the ₹49.',
      message: null,
      tactics: ['advance_fee', 'suspicious_link'],
      warningSigns: ['Older people are frequent targets of “small fee” messages'],
      question: 'How do you help?',
      choices: [
        {
          id: 'helpPay',
          label: 'Help her pay. It is only ₹49.',
          rating: 'risky',
          end: 'neighbourAtRisk',
          tactics: ['advance_fee'],
          consequence: 'Her card details go into the fake page.',
          explanation: 'Even knowing the pattern, the small amount made it feel harmless.',
          nextAction: 'Help her block the card now through her bank.',
        },
        {
          id: 'showHer',
          label: 'Show her how to check official tracking and explain the warning signs.',
          rating: 'safer',
          end: 'protectedShared',
          tactics: ['suspicious_link'],
          consequence: 'She sees she has no parcel pending and deletes the SMS.',
          explanation: 'You passed on a habit she can reuse: track parcels only in the official app or website.',
          nextAction: 'Save the 1930 helpline in her phone.',
        },
      ],
    },
  },

  endings: {
    protected: {
      tone: 'safe',
      title: 'You closed the risk',
      summary: 'No money was lost and you made sure the exposed card cannot be misused.',
    },
    protectedShared: {
      tone: 'safe',
      title: 'You avoided the scam and helped someone else',
      summary: 'You verified through official tracking and helped your neighbour do the same.',
    },
    exposed: {
      tone: 'partial',
      title: 'No loss yet, but still exposed',
      summary: 'Your card details are in the wrong hands. Blocking the card would close the risk.',
    },
    neighbourAtRisk: {
      tone: 'partial',
      title: 'You were careful, but your neighbour was exposed',
      summary: 'Sharing the warning signs is part of staying safe as a community.',
    },
    recovering: {
      tone: 'partial',
      title: 'Money was taken, but you acted fast',
      summary: 'You blocked the card and reported promptly. Recovery is not guaranteed.',
    },
    lostMore: {
      tone: 'loss',
      title: 'The scammers got a second chance',
      summary: 'Asking the scammer for a refund led to more exposure. Use only official channels after a loss.',
    },
  },

  checklist: [
    'Track parcels only through the official app or website of the store or courier.',
    'A small fee can be the hook for a much larger card charge.',
    'Read what an OTP is for — the amount in the OTP SMS is the truth.',
    'If card details were exposed, block or reissue the card.',
    'Report the SMS on Chakshu so the sender can be acted on.',
  ],
};

export default deliveryFee;
