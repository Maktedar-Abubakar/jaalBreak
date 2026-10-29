# JaalBreak

**See the manipulation. Understand the risk. Make the right move.**

JaalBreak is an evidence-first scam triage and awareness prototype. It inspects suspicious messages and screenshots, highlights the exact words that may be manipulating the reader (Manipulation X-Ray), and lets people practise safer decisions in branching scam scenarios (Scam Journey Simulator).

Every analysis runs in the browser — no AI API, and verdicts come from deterministic rules, so the same text always gives the same result.

People can **Continue as Guest** (history stays in their browser) or **create an account** with Supabase (history summaries follow them across devices — never the message text). **Setup, deployment and the testing checklist are in [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md).**

> JaalBreak highlights suspicious patterns; it does not prove fraud or safety. Never share an OTP, PIN, password, or CVV with anyone. Verify through an independent official channel.

### New in 1.2 (October 2026)
Plain verdict with **Read aloud** (English / Hindi / Kannada) · **Ask family** on WhatsApp · **One-tap report pack** · "What happens next" · **QR code, UPI ID, offer-letter PDF, email and "describe a call"** checks · Instagram account-takeover rules · Kannada (beta) · Scam Library · community **Scam Trends** · history export · installable & offline · `/api/check` · browser extension. Details: [`CHANGES.md`](CHANGES.md). Accuracy: [`ACCURACY.md`](ACCURACY.md).

---

## 1. Run it on Windows (PowerShell)

You need **Node.js 18 or newer**. Check with:

```powershell
node -v
```

If you see something like `v20.11.0` or higher, you're fine. If PowerShell says `node` is not recognised, install the LTS version from https://nodejs.org, then close and reopen PowerShell.

Then, one command at a time:

```powershell
cd "C:\path\to\jaalbreak"
```

(Replace the path with wherever you saved the folder. Tip: type `cd ` then drag the folder into the PowerShell window.)

Before the first run, make sure `.env.local` exists (copy `.env.example` and fill in your Supabase values — see `SUPABASE_SETUP.md`). Without it the app still runs, in guest-only mode.

```powershell
npm install
```

Expected: it downloads packages for 30–90 seconds and ends with something like `added 70 packages`. Warnings are normal. Errors in red are not.

```powershell
npm run dev
```

Expected output includes:

```
  VITE v5.4.11  ready in 400 ms
  ➜  Local:   http://localhost:5173/
```

Your browser should open automatically. If not, open **http://localhost:5173** yourself. To stop the app, click in PowerShell and press **Ctrl + C**.

### If PowerShell blocks `npm`

If you see *"running scripts is disabled on this system"*, run this once, then try again:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### Other commands

```powershell
npm test          # runs the analyzer, scenario, auth-validation and history-privacy tests
npm run build     # makes a production build in the dist folder
npm run preview   # serves that build at http://localhost:4173
```

---

## 2. What's in the app

| Section | What it does |
|---|---|
| **Overview** | Headline, quick message input, the three stages (Inspect → Explain → Respond), a labelled illustrative example, recent analyses, simulator shortcut. |
| **Message Analysis** | Paste text or upload a screenshot (OCR). Sample selector, character counter, empty-input validation, risk band, category, verified evidence, next steps, copy summary. |
| **Manipulation X-Ray** | Your message with each evidence phrase highlighted. Click a phrase to see the tactic, why it's concerning, what to do instead, and proof that the quote exists at those exact characters. Honest empty state when nothing matches. |
| **Scam Journey Simulator** | Four branching scenarios (fake internship fee, bank KYC threat, delivery/customs fee, family emergency). Three decisions each, consequence feedback, named tactics, learning summary, restart. |
| **Analysis History** | Local-only table with search, risk filter, view details, per-row delete and Delete all. |
| **Report & Next Steps** | "No money lost" vs "money lost" guidance, official links (Chakshu, 1930, cybercrime.gov.in), and an editable incident-report draft that writes `[not provided]` for anything you leave blank. |
| **Privacy & Method** | Storage toggles, delete-all, what the app does and does not do, how verdicts are reached, and the full rule catalogue. |
| **Sign-in screen** | Sign in, Create account, Forgot password, Continue as Guest. Guest Mode or "Hello, name" shown at the top of every page. |
| **I feel pressured** | A 60-second cooling-off pause with a verification checklist (sidebar and Overview). |

---

## 3. How the analyzer works

`src/utils/analyzer.js`

1. **Normalise** – the analysed text (shown in X-Ray) is Unicode NFC with unified line endings. Rules run on a *match view* of it: NFKC (folds full-width letters), zero-width characters removed, single line breaks turned into spaces. Every match is mapped back to exact positions in the analysed text, so quotes stay verbatim. Hidden or full-width characters also add +2 to the score and show a warning.
2. **Match rules** – `src/data/rules.js` (English, Hindi in Devanagari, and Hinglish) plus offline link checks in `src/utils/linkCheck.js`. Links are **never opened**.
3. **Resolve overlaps** – the strongest, longest match wins.
4. **Verify spans** – every quote must equal `text.slice(start, end)` and exist in the text, otherwise it is discarded.
5. **Band** – each matched check adds its weight once (weak 1, moderate 2, strong 3), plus small explained bonuses (`result.scoreAdjustments`): +1 when a bait/demand rule matches two different phrases, +1 for reward bait combined with a payment/credential/link demand, +1 for a threat combined with a suspicious link (these capped at +3 in total), and +2 for hidden characters:
   - total ≥ 7 **or** 2+ strong checks → **Strong match for a known scam pattern**
   - total ≥ 3 → **Several warning signs**
   - otherwise → **Few warning signs found**
6. **Advise** – fixed next-step templates per category in `src/data/advice.js`.

No percentages are shown, because the bands are not validated probabilities.

---

## 4. Screenshot OCR

Uses **Tesseract.js** in the browser. The image is not uploaded anywhere.

- Accepts PNG, JPG, WebP up to 8 MB and 5000 px per side.
- The **first** OCR run downloads the OCR engine and language data (~10 MB for English; more for English + Hindi) from a public CDN, so it needs internet that first time. The browser caches it afterwards.
- Extracted text always goes into the editable box so you can fix misreads before analysing.
- If OCR fails (offline, blurry image), you get a clear message. For the bundled sample screenshot, a **"Demo fallback: load this sample's text instead"** button appears.

---

## 5. Editing content (beginner guide)

| I want to… | Edit this file |
|---|---|
| Add or change a detection rule | `src/data/rules.js` (then run `npm test`) |
| Change a tactic's explanation | `src/data/tactics.js` |
| Change next-step advice | `src/data/advice.js` |
| Change sample messages | `src/data/sampleMessages.js` |
| Update official links | `src/data/officialResources.js` |
| Add a simulator scenario | Copy a file in `src/data/scenarios/`, edit it, add it to `src/data/scenarios/index.js`, run `npm test` |
| Change colours / fonts | `src/styles/tokens.css` |
| Change icons | `src/components/Icons.js` |

`npm test` checks that every scenario path has 3–4 decisions, every choice names a tactic from `tactics.js`, and that the sample messages still produce grounded evidence.

---

## 6. Project structure

```
jaalbreak/
  index.html
  package.json
  vite.config.js
  README.md
  public/
    favicon.svg
    samples/sample-sms-screenshot.png     fictional demo screenshot
  src/
    main.jsx                              entry point, imports CSS
    App.jsx                               shared state + page switching
    components/                           reusable UI pieces
    pages/                                one file per section
    data/                                 rules, tactics, advice, samples, scenarios
    utils/                                analyzer, link checks, storage, router, auth validation, tests
    auth/                                 AuthProvider (session state) + sign-in screens
    lib/                                  Supabase client + account history
  supabase/schema.sql                     tables + Row Level Security (run in Supabase SQL Editor)
  .env.example                            placeholder env values (copy to .env.local)
    styles/                               tokens, base, layout, components, pages
```

---

## 7. Privacy and scope

- **Guests:** history is stored in **this browser's localStorage only** – not encrypted, not synced. Summaries only by default; full message text only if you turn it on.
- **Signed-in users:** history summaries (date, category, assessment, tactic names) are stored in Supabase, protected by Row Level Security so each person sees only their own. Message text, screenshots and links are never stored in an account.
- Passwords are handled by Supabase Auth; JaalBreak never stores them.
- Out of scope by design: voice honeypot / call interception, credential collection, biometric stress monitoring, automatic banking-app or UPI lockout, receipt-authenticity claims, live threat maps.
- JaalBreak never files complaints, contacts police, or recovers money.

Official resources (review before each demo):

- Chakshu (Sanchar Saathi): https://sancharsaathi.gov.in/sfc/ – report suspected fraud communication when no money is lost
- National Cyber Crime Helpline: **1930** – call promptly if money is lost
- National Cyber Crime Reporting Portal: https://cybercrime.gov.in

This is a hackathon prototype, not a production fraud-prevention service.

## 4. Keeping detection honest

- `src/utils/analyzer.test.js`, `authValidation.test.js`, `historyMapping.test.js` – the original unit tests (`npm test`).
- `src/utils/extra.test.js` – one example per rule, evasion variants (hidden characters, spacing, full-width, line breaks), negation edge cases, link brand look-alikes, storage, report and scenario checks, and a randomised robustness test.
- `src/utils/evalset.test.js` – a labelled set of scam and genuine messages. **Add the message that motivated any new rule here**; the test fails if a rule change misses a scam or raises a false alarm.

Run everything: `node --test src/utils/*.test.js`
