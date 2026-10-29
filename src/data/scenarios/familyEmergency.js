// Scenario: Family emergency impersonation.
// All names, numbers and UPI IDs are fictional. See fakeInternship.js for the format.

const familyEmergency = {
  id: 'family-emergency',
  title: 'The message from “your brother”',
  pressure: 'Unknown number claims a loved one is in trouble and demands money',
  objective: 'Contact the family member using a known number and verify independently.',
  persona: 'Your younger brother Sami studies in another city. You talk most weekends.',
  start: 'message',
  steps: {
    message: {
      stage: 1,
      situation: 'Late at night, a WhatsApp message arrives from an unknown number.',
      message: {
        from: '+91 8XXXX X1907',
        channel: 'WhatsApp',
        text:
          'Bhai it’s me Sami, my phone fell in water, this is my new number. I had a bike accident and I’m at the hospital, they need ₹15,000 deposit before treatment. Please send to this UPI fast: care.desk@exampleupi. Don’t tell Ammi, she will panic.',
      },
      tactics: ['impersonation', 'emotional_pressure', 'urgency', 'secrecy', 'payment_redirect'],
      warningSigns: [
        'A “new number” explanation',
        'An emergency that needs money immediately',
        'Payment to an unfamiliar UPI ID',
        'A request to keep it from family',
      ],
      question: 'What do you do?',
      choices: [
        {
          id: 'send',
          label: 'Send the ₹15,000 right away. He is hurt.',
          rating: 'risky',
          next: 'moreMoney',
          tactics: ['emotional_pressure', 'urgency'],
          consequence: 'The money is sent. “Sami” replies: “Thank you bhai ❤️ will call soon.”',
          explanation:
            'Fear for someone you love is the strongest pressure there is. That is exactly why this scam uses it, together with a reason the real number cannot be used.',
          nextAction: 'Before sending money in any emergency, call the person on their known number.',
        },
        {
          id: 'quiz',
          label: 'Ask a question in the chat that only Sami would know.',
          rating: 'caution',
          next: 'dodge',
          tactics: ['impersonation'],
          consequence: 'The reply avoids your question and adds more pressure.',
          explanation:
            'A personal question is a good instinct, but it still happens inside the scammer’s channel. Calling a known number is stronger.',
          nextAction: 'Use a channel the scammer cannot control: Sami’s old number, a friend, or family.',
        },
        {
          id: 'call',
          label: 'Call Sami’s usual number, and if he does not answer, call a friend of his.',
          rating: 'safer',
          next: 'stillPushing',
          tactics: ['impersonation', 'secrecy'],
          consequence: 'Sami answers his usual number, confused. He is in his hostel and his phone is fine.',
          explanation:
            'You verified through a channel you already trusted. The “phone fell in water” story existed only to stop you doing this.',
          nextAction: 'Do not reply to the unknown number.',
        },
      ],
    },

    moreMoney: {
      stage: 2,
      situation: 'Twenty minutes later, another message.',
      message: {
        from: '+91 8XXXX X1907',
        channel: 'WhatsApp',
        text: 'Bhai doctor says ₹22,000 more for scan and medicines. Please fast, they won’t start without it 🙏',
      },
      tactics: ['emotional_pressure', 'urgency', 'payment_redirect'],
      warningSigns: ['A second, larger amount right after the first'],
      question: 'What do you do?',
      choices: [
        {
          id: 'sendMore',
          label: 'Send it. You cannot risk his treatment.',
          rating: 'risky',
          next: 'aftermath',
          tactics: ['emotional_pressure'],
          consequence: 'You send ₹22,000. The number stops replying.',
          explanation:
            'Once a first payment works, scammers ask for more while the emotional pressure is still high.',
          nextAction: 'Pause before any second payment and verify on a known number.',
        },
        {
          id: 'verifyNow',
          label: 'Stop and call Sami’s usual number first.',
          rating: 'safer',
          next: 'aftermath',
          tactics: ['impersonation'],
          consequence: 'Sami answers from his hostel. He is fine. The ₹15,000 went to a scammer.',
          explanation: 'Verifying, even late, stopped a second loss.',
          nextAction: 'Report the payment now; do not wait until morning.',
        },
      ],
    },

    dodge: {
      stage: 2,
      situation: 'The unknown number replies to your question.',
      message: {
        from: '+91 8XXXX X1907',
        channel: 'WhatsApp',
        text: 'Bhai no time for games, doctor is waiting!! You don’t trust your own brother?? Just send please 😭',
      },
      tactics: ['emotional_pressure', 'urgency'],
      warningSigns: ['Avoiding a simple question', 'Guilt-tripping you for checking'],
      question: 'How do you respond?',
      choices: [
        {
          id: 'guilt',
          label: 'You feel guilty. Send the money.',
          rating: 'risky',
          next: 'aftermath',
          tactics: ['emotional_pressure'],
          consequence: 'You send ₹15,000. The number goes silent.',
          explanation:
            'Guilt is a pressure tactic. A real family member in an emergency would understand you checking for a minute.',
          nextAction: 'Treat “don’t you trust me?” as a warning sign, not a reason to pay.',
        },
        {
          id: 'callKnown',
          label: 'The dodge is a red flag. Call Sami’s usual number.',
          rating: 'safer',
          next: 'safe',
          tactics: ['impersonation'],
          consequence: 'Sami answers. He is fine and has not been in any accident.',
          explanation: 'You recognised that avoiding your question was itself evidence.',
          nextAction: 'Block and report the unknown number.',
        },
      ],
    },

    stillPushing: {
      stage: 2,
      situation: 'While you are on the phone with the real Sami, the unknown number keeps messaging.',
      message: {
        from: '+91 8XXXX X1907',
        channel: 'WhatsApp',
        text: 'Bhai?? Why are you not sending? Every minute matters. Send now, I will return it tomorrow.',
      },
      tactics: ['urgency', 'emotional_pressure'],
      warningSigns: ['Pressure continues even after you go quiet'],
      question: 'What do you do with the chat?',
      choices: [
        {
          id: 'confront',
          label: 'Reply: “I just spoke to my brother. I know this is a scam.”',
          rating: 'caution',
          next: 'safe',
          tactics: ['urgency'],
          consequence: 'The number replies with abuse, then goes quiet.',
          explanation:
            'You are safe, but replying confirms your number is active and may invite new attempts from other numbers.',
          nextAction: 'You do not need to reply. Screenshot the chat and block the number.',
        },
        {
          id: 'screenshot',
          label: 'Do not reply. Take screenshots of the chat and the UPI ID for reporting.',
          rating: 'safer',
          next: 'safe',
          tactics: ['payment_redirect'],
          consequence: 'You now have the number, the UPI ID and the messages saved.',
          explanation: 'Evidence makes your report useful. The UPI ID in particular helps authorities act.',
          nextAction: 'Report the number on Chakshu and block it.',
        },
      ],
    },

    aftermath: {
      stage: 3,
      situation: 'You now know it was a scam, and money has been sent.',
      message: null,
      tactics: ['secrecy'],
      warningSigns: ['Embarrassment keeps many victims from reporting'],
      question: 'What do you do now?',
      choices: [
        {
          id: 'hide',
          label: 'Feel embarrassed and tell no one.',
          rating: 'risky',
          end: 'lostQuiet',
          tactics: ['secrecy'],
          consequence: 'No report is made. The UPI ID keeps receiving money from other victims.',
          explanation:
            'The scam asked you to keep secrets from the start. Staying silent afterwards continues to help it work.',
          nextAction: 'It is never too late to report. Call 1930 with the UPI transaction IDs.',
        },
        {
          id: 'reportNow',
          label: 'Call 1930 now with the UPI transaction IDs and tell your family what happened.',
          rating: 'safer',
          end: 'recovering',
          tactics: ['secrecy'],
          consequence: 'Your complaint is logged. Your family agrees on a safe word for emergencies.',
          explanation:
            'Reporting fast gives the best chance of action against the receiving account. Telling family protects them from the next attempt.',
          nextAction: 'File a written complaint at cybercrime.gov.in too.',
        },
      ],
    },

    safe: {
      stage: 3,
      situation: 'Sami is safe. You are still holding the scammer’s messages.',
      message: null,
      tactics: ['impersonation', 'secrecy'],
      warningSigns: ['The same scammers may try other family members next'],
      question: 'What do you do next?',
      choices: [
        {
          id: 'blockOnly',
          label: 'Block the number and move on.',
          rating: 'caution',
          end: 'protected',
          tactics: ['impersonation'],
          consequence: 'You are safe, but your mother receives a similar message the next day.',
          explanation: 'Blocking protects you. Warning family closes the gap the scammer will try next.',
          nextAction: 'Tell close family about the attempt.',
        },
        {
          id: 'safeWord',
          label: 'Report it on Chakshu, warn the family group and agree a family safe word.',
          rating: 'safer',
          end: 'protectedShared',
          tactics: ['secrecy'],
          consequence: 'When your mother gets a similar message the next day, she asks for the safe word and the scammer disappears.',
          explanation: 'A shared safe word is a simple, strong check that scammers cannot fake.',
          nextAction: 'Choose a word that is not on social media.',
        },
      ],
    },
  },

  endings: {
    protected: {
      tone: 'safe',
      title: 'You avoided the scam',
      summary: 'You verified on a known number before sending anything.',
    },
    protectedShared: {
      tone: 'safe',
      title: 'You avoided the scam and protected your family',
      summary: 'You verified, reported, and set up a safe word your family can use.',
    },
    recovering: {
      tone: 'partial',
      title: 'Money was lost, but you reported quickly',
      summary: 'Quick reporting and openness with family give the best chance of limiting harm.',
    },
    lostQuiet: {
      tone: 'loss',
      title: 'The scam stayed hidden',
      summary: 'Silence helps scammers keep going. In real life, call 1930 promptly and tell someone you trust.',
    },
  },

  checklist: [
    'A “new number” plus an emergency plus a money request is a classic pattern.',
    'Call the person on the number you already have before sending anything.',
    'Ask someone who is with them, or another family member.',
    'Treat requests for secrecy as a warning sign.',
    'Agree a family safe word for real emergencies.',
  ],
};

export default familyEmergency;
