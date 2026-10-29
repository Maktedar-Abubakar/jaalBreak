// ---------------------------------------------------------------------------
// Incident report draft builder.
// Uses ONLY details the user typed (plus evidence quoted from their own
// message). Anything missing is written as "[not provided]" — nothing is
// invented. JaalBreak does not submit this anywhere.
// ---------------------------------------------------------------------------

export const NOT_PROVIDED = '[not provided]';

export const EMPTY_REPORT_FIELDS = {
  dateReceived: '',
  channel: '',
  senderId: '',
  description: '',
  moneyLost: 'not-sure',
  amount: '',
  paymentMethod: '',
  transactionRef: '',
};

const value = (v) => (v && String(v).trim() ? String(v).trim() : NOT_PROVIDED);

const MONEY_LOST_LABEL = {
  yes: 'Yes',
  no: 'No',
  'not-sure': 'Not sure',
};

export function buildIncidentReport(fields, analysis) {
  const lines = [];
  lines.push('SUSPECTED FRAUD COMMUNICATION — INCIDENT NOTE');
  lines.push('(Draft prepared with JaalBreak. Review and edit before submitting through an official channel.)');
  lines.push('');
  lines.push(`Date and time received: ${value(fields.dateReceived)}`);
  lines.push(`Channel (SMS, WhatsApp, call, email…): ${value(fields.channel)}`);
  lines.push(`Sender number / ID / email as shown: ${value(fields.senderId)}`);
  lines.push('');
  lines.push('What happened:');
  lines.push(value(fields.description));
  lines.push('');
  lines.push(`Money lost: ${MONEY_LOST_LABEL[fields.moneyLost] || NOT_PROVIDED}`);
  if (fields.moneyLost === 'yes') {
    lines.push(`Amount: ${value(fields.amount)}`);
    lines.push(`Payment method (UPI, card, bank transfer…): ${value(fields.paymentMethod)}`);
    lines.push(`Transaction reference / UTR: ${value(fields.transactionRef)}`);
  }
  lines.push('');
  lines.push('Message text:');
  lines.push(analysis ? analysis.text : NOT_PROVIDED);
  lines.push('');
  if (analysis && analysis.signals.length) {
    lines.push('Warning signs noted (quoted from the message):');
    for (const s of analysis.signals) lines.push(`- "${s.quote}" (${s.tacticLabel})`);
    lines.push('');
  }
  lines.push('Note: I have not shared and will not share any OTP, PIN, password or CVV in this report.');
  return lines.join('\n');
}
