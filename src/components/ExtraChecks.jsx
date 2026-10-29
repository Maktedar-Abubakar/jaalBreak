// Extra checks under the verdict: every link, UPI ID, QR payment and email
// sender found in the input, each with plain reasons. All offline.
import { Link2, Wallet, AtSign, QrCode, TriangleAlert, CircleCheck } from './Icons.js';
import { extractUpiIds, assessUpi } from '../utils/upiCheck.js';
import { assessEmail, looksLikeEmail } from '../utils/emailCheck.js';

function Item({ title, flagged, reasons, okText }) {
  return (
    <li className={`xcheck ${flagged ? 'xcheck--bad' : 'xcheck--ok'}`}>
      <div className="xcheck__head">
        {flagged ? <TriangleAlert size={15} aria-hidden="true" /> : <CircleCheck size={15} aria-hidden="true" />}
        <code>{title}</code>
        <span className="xcheck__tag">{flagged ? 'Warning signs' : 'No warning signs'}</span>
      </div>
      {reasons.length > 0 ? (
        <ul className="xcheck__reasons">
          {reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ) : (
        <p className="xcheck__ok">{okText}</p>
      )}
    </li>
  );
}

export default function ExtraChecks({ result }) {
  const links = result.links || [];
  const upis = extractUpiIds(result.text).map(assessUpi);
  const email = looksLikeEmail(result.text) ? assessEmail(result.text) : null;
  const isQr = result.source === 'qr';
  if (!links.length && !upis.length && !email && !isQr) return null;

  return (
    <div className="panel extra-checks">
      <p className="eyebrow">Checked separately</p>
      {isQr && (
        <div className="callout callout--danger qr-callout">
          <QrCode size={18} aria-hidden="true" />
          <p>
            <strong>Scanning a QR code can only SEND money from you.</strong> You never need to scan a QR or enter your UPI
            PIN to <em>receive</em> money, a refund or a prize.
          </p>
        </div>
      )}
      {links.length > 0 && (
        <>
          <h3 className="xcheck-title"><Link2 size={16} aria-hidden="true" /> Links ({links.length})</h3>
          <ul className="xcheck-list">
            {links.map((l, i) => (
              <Item key={`${l.url || l.host}-${i}`} title={l.host} flagged={l.suspicious} reasons={l.reasons} okText="No warning signs in the address itself. JaalBreak did not open it — check you typed the official site yourself." />
            ))}
          </ul>
        </>
      )}
      {upis.length > 0 && (
        <>
          <h3 className="xcheck-title"><Wallet size={16} aria-hidden="true" /> UPI IDs ({upis.length})</h3>
          <ul className="xcheck-list">
            {upis.map((u, i) => (
              <Item key={`${u.id}-${i}`} title={u.id} flagged={u.suspicious} reasons={u.reasons} okText="The ID looks ordinary, but only pay people you know. Your UPI app shows the registered name before you pay — check it." />
            ))}
          </ul>
        </>
      )}
      {email && (
        <>
          <h3 className="xcheck-title"><AtSign size={16} aria-hidden="true" /> Email sender</h3>
          <ul className="xcheck-list">
            <Item
              title={`${email.from.displayName ? `${email.from.displayName} ` : ''}<${email.from.address}>`}
              flagged={email.suspicious}
              reasons={email.reasons}
              okText="The sender address matches the name. Senders can still be faked — verify anything about money by phone."
            />
          </ul>
        </>
      )}
      <p className="fine-print">These checks read the text only. JaalBreak never opens links or contacts anyone.</p>
    </div>
  );
}
