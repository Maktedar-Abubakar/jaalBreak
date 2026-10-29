// ---------------------------------------------------------------------------
// Labelled evaluation set. Run:  node --test src/utils/evalset.test.js
//
// Every time you add or change a rule, add the message that motivated it here.
// The suite fails if a scam drops below "medium" or a genuine message rises
// above "low", so a rule change can never silently trade one error for another.
// ---------------------------------------------------------------------------
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeMessage } from './analyzer.js';

const SCAMS = [
  'Dear Customer, your bank account will be blocked today. Update your KYC at http://meridian-kyc-verify.xyz/update and share the OTP you receive.',
  'This is the cyber cell. A digital arrest warrant is issued in your name. Do not tell anyone and stay on this video call.',
  'Install AnyDesk so our agent can help fix your refund.',
  'Accept the collect request on your UPI app and enter your UPI PIN to receive Rs 5000.',
  'TRAI: Your mobile number will be disconnected in 2 hours. Press 9 to talk to officer.',
  'Dear consumer your electricity power will be disconnected tonight 9:30pm. Call 98XXXXXXXX immediately.',
  'Congratulations! You are selected for the internship. Pay ₹2,500 registration fee today or your slot will be cancelled.',
  'Instant loan approved! Pay Rs 999 processing fee to receive Rs 50,000 in your account.',
  'Your parcel is held at customs. Pay a customs fee of Rs 49 at http://swiftparcel-redeliver.top/pay or it will be returned.',
  'You have won a lottery of Rs.5,00,000. Claim your prize now.',
  'बधाई हो! आपने 25 लाख की लॉटरी जीती है। इनाम पाने के लिए फीस जमा करें',
  'Earn ₹5000 per day by liking videos. Guaranteed returns, double your money!',
  'Invest 10000 get 20000 back in 24 hours, 100% safe.',
  'I have recorded your video. Pay Rs 20000 or I will leak it to all your contacts.',
  'Buy Google Play cards and send the codes.',
  'Please send me the code you just received by SMS',
  'Your card details are required to complete the refund.',
  'Aapka account band ho jayega. Turant OTP bhejo.',
  'Papa I am in trouble, my phone is lost. Send the money urgently to this UPI and do not tell mom.',
  'Share your OTP now',
  'Sh\u200bare your O\u200bTP now',
  'Ｓｈａｒｅ ｙｏｕｒ ＯＴＰ ｎｏｗ',
  'Please share your O T P with us',
  'Share your\nOTP now',
  'We never call you, but share your OTP now',
  'Do not worry, just share your OTP and the refund will be credited.',
  'Work from home! Earn Rs 3000 per day. Message us on WhatsApp 98XXXXXXXX to start.',
  'आपका खाता बंद हो जाएगा। तुरंत OTP भेजें।',
];

const GENUINE = [
  'Hey, are we still meeting for lunch tomorrow at 1?',
  'Your OTP is 482913. Do not share it with anyone. - Meridian Bank',
  'Rs.2,500 debited from A/c XX1234 on 20-Oct. If not you, call the bank helpline immediately.',
  'We will never ask you to share your OTP.',
  'Do not share your OTP with anyone.',
  'Nobody from the bank will ask you to share your OTP.',
  'Meridian Bank never asks for your PIN or password on calls or SMS.',
  'OTP kabhi share mat karo.',
  'Aapka OTP 482913 hai. Kisi ko mat batayein. - Meridian Bank',
  'OTP कभी किसी को न बताएं',
  'The bank charges a processing fee of 1% on personal loans.',
  'Customs duty is charged on imports above the threshold.',
  'My brother joined the police last year.',
  'Webinar slots are limited, register on our official site.',
  'I forgot my password, can you send me the link to reset it?',
  'Your order has shipped. Track it at https://www.amazon.in/orders',
  'Your Amazon gift card code is ABCD-1234. Enjoy!',
  'Reminder: your dentist appointment is tomorrow at 4pm. Reply C to confirm.',
  'Please log in at https://netbanking.hdfcbank.com to view your statement.',
  'The band played all night, it was amazing.',
  'Can you send me the notes from yesterday’s class?',
  'Happy birthday! Let’s catch up this weekend.',
];

test(`eval set: all ${SCAMS.length} scam messages reach at least medium`, () => {
  const missed = SCAMS.filter((m) => analyzeMessage(m).band.key === 'low');
  assert.deepEqual(missed, [], `missed scams:\n${missed.join('\n')}`);
});

test(`eval set: none of ${GENUINE.length} genuine messages rises above low`, () => {
  const alarms = GENUINE.filter((m) => analyzeMessage(m).band.key !== 'low').map(
    (m) => `${analyzeMessage(m).band.key}: ${m}`
  );
  assert.deepEqual(alarms, [], `false alarms:\n${alarms.join('\n')}`);
});

test('eval set: reports precision and recall (informational)', () => {
  const tp = SCAMS.filter((m) => analyzeMessage(m).band.key !== 'low').length;
  const fp = GENUINE.filter((m) => analyzeMessage(m).band.key !== 'low').length;
  console.log(`# scams caught ${tp}/${SCAMS.length}, false alarms ${fp}/${GENUINE.length}`);
  assert.ok(true);
});
