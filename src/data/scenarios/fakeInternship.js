// Scenario: Fake internship registration fee.
// All names, numbers and UPI IDs are fictional.
//
// HOW SCENARIO FILES WORK
//   start      → id of the first step
//   steps      → each step has a situation, an optional incoming message,
//                and 2–3 choices
//   choice.rating  → 'safer' | 'caution' | 'risky'
//   choice.next    → id of the next step, OR
//   choice.end     → key of an ending in `endings`
//   tactics    → keys from src/data/tactics.js (same vocabulary as X-Ray)
// Every path must contain 3 or 4 decisions (checked by the tests).

const fakeInternship = {
  id: 'fake-internship',
  title: 'The internship offer',
  pressure: 'Registration fee, artificial deadline, unofficial contact channel',
  objective: 'Verify recruiters independently; do not pay to secure a job.',
  persona: 'You are a final-year student who applied to several internships on job portals last month.',
  start: 'offer',
  steps: {
    offer: {
      stage: 1,
      situation: 'A WhatsApp message arrives from a number you do not recognise.',
      message: {
        from: '+91 9XXXX X4821 · “Nexora Global HR”',
        channel: 'WhatsApp',
        text:
          'Congratulations! You have been shortlisted for a paid Data Analyst internship at Nexora Global (₹25,000/month, remote). To confirm your seat, pay a refundable ₹2,500 registration fee to hr.nexora@exampleupi within 6 hours. Seats are limited. Contact us on Telegram only.',
      },
      tactics: ['reward_bait', 'advance_fee', 'urgency', 'channel_switch', 'payment_redirect'],
      warningSigns: [
        'A fee to “confirm” a job offer',
        'A 6-hour deadline',
        'Telegram-only contact',
        'Payment to a personal UPI ID',
      ],
      question: 'What do you do?',
      choices: [
        {
          id: 'pay',
          label: 'Pay the ₹2,500 quickly. It is refundable and the stipend is good.',
          rating: 'risky',
          next: 'secondFee',
          tactics: ['advance_fee', 'reward_bait'],
          consequence: 'The payment goes through. Within minutes, “HR” thanks you and says onboarding is almost complete.',
          explanation:
            'The word “refundable” and an attractive stipend lowered your guard. A fee to secure a job is the core of this scam; genuine employers do not charge candidates.',
          nextAction: 'Keep the transaction ID and screenshots. You will need them if you report.',
        },
        {
          id: 'ask',
          label: 'Message them on Telegram to ask questions about the role first.',
          rating: 'caution',
          next: 'pressure',
          tactics: ['channel_switch'],
          consequence: 'A friendly “HR executive” replies instantly with confident answers and reminds you the deadline is close.',
          explanation:
            'Asking questions is sensible, but you are asking inside a channel the sender controls. Anyone can sound convincing there.',
          nextAction: 'Verify the company using contact details you find yourself, not ones from the message.',
        },
        {
          id: 'verify',
          label: 'Find Nexora Global’s official careers page yourself before replying.',
          rating: 'safer',
          next: 'afterVerify',
          tactics: ['impersonation'],
          consequence:
            'The official careers page lists no Data Analyst internship and states that Nexora never charges candidates any fee.',
          explanation:
            'You verified through a channel you found yourself. That single habit defeats most job scams, because scammers can copy a company name but not its official website.',
          nextAction: 'Do not reply. Keep the message so you can report it.',
        },
      ],
    },

    secondFee: {
      stage: 2,
      situation: 'An hour later, a new message arrives.',
      message: {
        from: '“Nexora Global HR”',
        channel: 'Telegram',
        text:
          'Payment received ✅ Final step: pay ₹4,800 for your training kit and laptop security deposit today. Without it, your joining will be cancelled and the registration fee cannot be refunded.',
      },
      tactics: ['advance_fee', 'threat', 'urgency'],
      warningSigns: ['A second, larger fee', 'A threat to forfeit your first payment'],
      question: 'How do you respond?',
      choices: [
        {
          id: 'payAgain',
          label: 'Pay again so the first ₹2,500 is not wasted.',
          rating: 'risky',
          next: 'deeper',
          tactics: ['advance_fee', 'threat'],
          consequence: 'They confirm receipt and immediately mention one more “verification” charge.',
          explanation:
            'This is the sunk-cost trap: your earlier payment is being used as leverage to extract more. Each new fee is presented as the last one.',
          nextAction: 'Stop paying. More money will not recover what has already been sent.',
        },
        {
          id: 'refund',
          label: 'Refuse to pay more and demand the refund first.',
          rating: 'caution',
          next: 'recovery',
          tactics: ['advance_fee'],
          consequence: 'They say refunds are only processed after the training kit fee is paid, then stop replying.',
          explanation:
            'Refusing to pay more was right. Expecting a refund from the same people is unlikely to work; “refundable” was part of the hook.',
          nextAction: 'Report the payment through 1930 or cybercrime.gov.in rather than negotiating.',
        },
        {
          id: 'report',
          label: 'Stop all contact, call 1930 and report on cybercrime.gov.in.',
          rating: 'safer',
          next: 'recovery',
          tactics: ['advance_fee'],
          consequence: 'You stop the losses at ₹2,500. The helpline records your complaint and asks for the transaction ID.',
          explanation:
            'Reporting quickly gives the best chance of a transfer being flagged. Money cannot always be recovered, but speed matters.',
          nextAction: 'Also inform your bank using the number printed on your card.',
        },
      ],
    },

    pressure: {
      stage: 2,
      situation: 'The “HR executive” keeps messaging you on Telegram.',
      message: {
        from: '“Nexora HR Desk”',
        channel: 'Telegram',
        text:
          '37 candidates have already paid. Only 3 seats left. If you don’t pay within 1 hour we will give your seat to the next candidate. Attaching your official offer letter with company stamp.',
      },
      tactics: ['urgency', 'impersonation', 'advance_fee'],
      warningSigns: [
        'Fake social proof (“37 already paid”)',
        'A shrinking deadline',
        'An official-looking PDF that anyone can make',
      ],
      question: 'What now?',
      choices: [
        {
          id: 'trustLetter',
          label: 'The offer letter looks official. Pay now.',
          rating: 'risky',
          next: 'deeper',
          tactics: ['impersonation', 'advance_fee'],
          consequence: 'You pay ₹2,500. A new request for a ₹4,800 “training kit” follows the same evening.',
          explanation:
            'Logos, stamps and signatures are easy to copy into a PDF. A document sent by the sender cannot prove the sender is genuine.',
          nextAction: 'Judge an offer by where you verified it, not by how official it looks.',
        },
        {
          id: 'placementCell',
          label: 'Show the messages to your college placement cell before doing anything.',
          rating: 'safer',
          next: 'classmate',
          tactics: ['urgency'],
          consequence:
            'Your placement coordinator recognises the pattern immediately: a fee, a deadline and a Telegram-only recruiter.',
          explanation:
            'Getting a second opinion breaks the isolation that pressure tactics rely on. The “1 hour” deadline was there to stop you doing exactly this.',
          nextAction: 'Block the contact and report it on Chakshu (sancharsaathi.gov.in/sfc).',
        },
      ],
    },

    afterVerify: {
      stage: 2,
      situation: 'You have confirmed the role does not exist. That evening another message arrives.',
      message: {
        from: '+91 9XXXX X4821',
        channel: 'WhatsApp',
        text: 'Why no reply?? LAST REMINDER. Your seat will be cancelled at 6 PM today. Pay now to avoid losing this opportunity.',
      },
      tactics: ['urgency', 'threat'],
      warningSigns: ['Escalating pressure when you go quiet'],
      question: 'How do you handle it?',
      choices: [
        {
          id: 'argue',
          label: 'Reply and tell them you know it is a scam.',
          rating: 'caution',
          next: 'classmate',
          tactics: ['urgency'],
          consequence: 'They reply with insults, then a “special discount” on the fee.',
          explanation:
            'Understandable, but replying keeps you in the conversation and confirms your number is active and responsive.',
          nextAction: 'You do not owe scammers a reply. Block and report instead.',
        },
        {
          id: 'blockReport',
          label: 'Do not reply. Block the number and report it on Chakshu.',
          rating: 'safer',
          next: 'classmate',
          tactics: ['threat'],
          consequence: 'The messages stop. Your report adds the number to the data used to act against fraud connections.',
          explanation:
            'The “last reminder” was empty pressure. Blocking and reporting protects you and helps others.',
          nextAction: 'Keep a screenshot in case you need it later.',
        },
      ],
    },

    deeper: {
      stage: 3,
      situation: 'You have now paid twice. “HR” sends one more message.',
      message: {
        from: '“Nexora Global HR”',
        channel: 'Telegram',
        text:
          'Last step: ₹7,500 background verification charge. After this, all fees will be refunded with your first stipend. Do it today or your profile will be blacklisted.',
      },
      tactics: ['advance_fee', 'reward_bait', 'threat'],
      warningSigns: ['A promise that paying more will unlock refunds', 'A threat to “blacklist” you'],
      question: 'What do you do?',
      choices: [
        {
          id: 'payLast',
          label: 'Pay the last charge to unlock the refunds.',
          rating: 'risky',
          end: 'lostMore',
          tactics: ['advance_fee', 'reward_bait'],
          consequence: 'The account goes silent. The Telegram profile is deleted.',
          explanation:
            'There is never a “last” fee in this scam. Each payment is used to justify the next one until you stop.',
          nextAction: 'Call 1930 now with all transaction IDs, even though it feels embarrassing.',
        },
        {
          id: 'stopReport',
          label: 'Stop now, call 1930 and file a report with all your receipts.',
          rating: 'safer',
          end: 'recovering',
          tactics: ['advance_fee'],
          consequence: 'Your complaint is registered with the transaction details. You stop further losses.',
          explanation:
            'Stopping is the hardest and most important step. Reporting promptly gives the best chance of action on the receiving accounts.',
          nextAction: 'Watch for “recovery agents” who contact you offering to get money back for a fee.',
        },
      ],
    },

    recovery: {
      stage: 3,
      situation: 'The next day you get a call from someone who says they are a “cyber police refund officer”.',
      message: {
        from: 'Unknown caller',
        channel: 'Phone call',
        text:
          '“We have traced your ₹2,500. To release it back to your account, pay a ₹500 processing charge to this UPI ID.”',
      },
      tactics: ['impersonation', 'advance_fee'],
      warningSigns: ['A “recovery” offer that charges a fee is a second scam'],
      question: 'How do you respond?',
      choices: [
        {
          id: 'payRecovery',
          label: 'Pay ₹500. It is worth it to get ₹2,500 back.',
          rating: 'risky',
          end: 'lostMore',
          tactics: ['impersonation', 'advance_fee'],
          consequence: 'The “officer” stops answering after the payment.',
          explanation:
            'Victims are often targeted again by “recovery” callers. Genuine police and banks do not charge fees to return money.',
          nextAction: 'Report this second contact too. Use only 1930 and cybercrime.gov.in.',
        },
        {
          id: 'declineRecovery',
          label: 'Decline. Real complaints go through 1930 or cybercrime.gov.in, never a fee-charging caller.',
          rating: 'safer',
          end: 'recovering',
          tactics: ['impersonation'],
          consequence: 'You hang up and add the caller’s number to your existing complaint.',
          explanation: 'You spotted the follow-up scam. Recovery never requires paying a stranger.',
          nextAction: 'Follow up only through the official complaint reference number.',
        },
      ],
    },

    classmate: {
      stage: 3,
      situation: 'In your class group chat, a friend says she got the same offer and is about to pay.',
      message: {
        from: 'Class group',
        channel: 'WhatsApp group',
        text: 'Guys I got selected at Nexora Global!! Just need to pay the ₹2,500 registration fee by 6 PM 🎉',
      },
      tactics: ['advance_fee', 'reward_bait'],
      warningSigns: ['Scams spread quickly through peer groups'],
      question: 'Do you say something?',
      choices: [
        {
          id: 'stayOut',
          label: 'Stay out of it. It is her decision.',
          rating: 'caution',
          end: 'protected',
          tactics: ['reward_bait'],
          consequence: 'You are safe, but your friend pays before anyone warns her.',
          explanation:
            'You protected yourself. Sharing what you learned is one of the most effective ways scams are stopped in a community.',
          nextAction: 'A short, kind message such as “I checked their official site — the role isn’t listed” can save someone money.',
        },
        {
          id: 'share',
          label: 'Share what you found and the official careers page with the group.',
          rating: 'safer',
          end: 'protectedShared',
          tactics: ['advance_fee'],
          consequence: 'Your friend checks the official page and does not pay. Two others say they received the same message.',
          explanation: 'You turned your own verification into protection for others.',
          nextAction: 'Encourage everyone who received it to report the number on Chakshu.',
        },
      ],
    },
  },

  endings: {
    protected: {
      tone: 'safe',
      title: 'You avoided the scam',
      summary: 'You did not pay and verified the offer independently. Next time, consider warning others too.',
    },
    protectedShared: {
      tone: 'safe',
      title: 'You avoided the scam and protected others',
      summary: 'You verified independently, refused to pay and helped your classmates do the same.',
    },
    recovering: {
      tone: 'partial',
      title: 'Money was lost, but you limited the damage',
      summary: 'You stopped paying and reported promptly. Recovery is not guaranteed, but quick reporting gives the best chance.',
    },
    lostMore: {
      tone: 'loss',
      title: 'The losses grew',
      summary: 'Each payment was used to justify the next. In real life, call 1930 as soon as you realise, however much was lost.',
    },
  },

  checklist: [
    'Genuine employers do not charge you to hire you.',
    'Verify the role on the company’s official careers page that you find yourself.',
    'Treat Telegram- or WhatsApp-only recruiters with suspicion.',
    'If you paid, call 1930 quickly and keep every transaction ID.',
    'Ignore “recovery agents” who ask for a fee.',
  ],
};

export default fakeInternship;
