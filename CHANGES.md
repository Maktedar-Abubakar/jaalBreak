# Changes in version 1.2.0 — JaalBreak (29 Oct 2026)

ScamShield is now **JaalBreak** (जाल / ಜಾಲ = trap or net; "break the trap"). Measured results: see `ACCURACY.md`.

| Area | Change | Files |
|---|---|---|
| Name & look | Renamed everywhere in the website; new logo (a net with one strand broken), favicon and app icons. Browser storage keys are unchanged, so guest history is kept. | `Logo.jsx`, `index.html`, `public/` |
| Detection (29 new rules; 86 in total with Kannada) | Real-world wording, incl. broken English and junk characters: `THR-04`, `PRT-02`, `CALL-01`, reward points `RWD-03`, prizes `RWD-04`, refunds `REF-01`, fake loans `LOAN-01`, electricity `UTL-01`/`UTL-02`, digital arrest `AUTH-01`/`AUTH-HG`/`THR-HG2`, e-challan `CHL-01`, app files `APK-01`, task scams `TSK-01`/`TSK-02`, `CHN-02` (wa.me / t.me links), stock tips `INV-01`, advance-fee `ADV-01`, "unusual activity" `ACC-01`, **Instagram / social account takeover** `ATO-01`…`ATO-05`, UPI IDs `UPI-01`, offer letters `JOB-01`/`JOB-02`, invoice bank-change `BEC-01`. | `src/data/rules.js` |
| Kannada (beta) | 10 Kannada + 4 Kanglish rules, Kannada detection, Kannada "don't share" negation. Telugu not included. Phrases to check: `KANNADA_REVIEW.md`. | `rules.js`, `analyzer.js` |
| New categories | Social media account takeover, Fake traffic e-challan, Fake loan / money credit — each with advice. New tactics: Account takeover trick, Install an app from a link. | `rules.js`, `advice.js`, `tactics.js` |
| Links | Typo look-alikes (`hdfcbnak`, `lnstagram`, `faceb00k`), tunnel links (ngrok…), free website builders used with a brand name; official `.bank.in` and `hdfcbank.net` domains added. | `src/utils/linkCheck.js` |
| Plain verdict | Big verdict card on every result with Read aloud (English / हिन्दी / ಕನ್ನಡ), Ask family on WhatsApp, Report this scam. | `PlainVerdict.jsx`, `plainLanguage.js`, `speech.js` |
| What happens next | The rest of the scam step by step, "Looks like a known scam" match, link to practise it. | `WhatHappensNext.jsx`, `scamLibrary.js` |
| One-tap report pack | Pre-filled complaint + 1930 / Chakshu / cybercrime.gov.in (+ instagram.com/hacked). | `ReportPack.jsx` |
| Simple view | Bigger text, plain verdict first, details one tap away (sidebar toggle). | `Sidebar.jsx`, `ResultSummary.jsx` |
| Smart box | Auto-detects link / UPI ID / email; "Add a screenshot, QR or PDF" button; new tabs: QR code, Offer letter / PDF, Describe a call. Extra checks panel for every link, UPI ID, QR payment and email sender. | `AnalyzePage.jsx`, `ExtraChecks.jsx`, `CallDescribe.jsx`, `upiCheck.js`, `emailCheck.js`, `inputDetect.js`, `fileReaders.js` |
| Scam Library | New page: 13 scam types with steps, red flags, example, what to do. | `LibraryPage.jsx` |
| Community | "Share anonymously" (type, risk, tactics, language, channel only) + Trending on Overview + new Scam Trends page with your own 30-day dashboard. Needs `supabase/community.sql`. | `community.js`, `ShareCommunity.jsx`, `TrendingPanel.jsx`, `TrendsPage.jsx` |
| History export | Export CSV (Excel-safe) and Save as PDF. | `historyExport.js`, `HistoryPage.jsx` |
| Offline / install | Installable (PWA) and works offline after the first visit (OCR still needs internet the first time). | `public/manifest.webmanifest`, `public/sw.js`, `main.jsx`, `vercel.json` |
| API | `POST /api/check` for other apps — same verdict, nothing stored. | `api/check.js` |
| Browser extension | Chrome/Edge: right-click → Check with JaalBreak. Runs locally. | `extension/` |
| Fixes | History page no longer scrolls sideways on phones. | `pages.css` |
| Verdict colours | Traffic-light colours everywhere a risk level is shown: **red** = likely scam, **yellow** = warning signs, **green** = no known scam pattern (verdict heading, risk meter, history pills, highlights, extra checks, extension). Layout unchanged. | `tokens.css`, `components.css`, `pages.css`, `extension/check.html` |
| Tests | 322 tests (was 259). Benchmark: `node tools/benchmark/score.mjs`. | `src/utils/*.test.js`, `tools/benchmark/` |
| New dependencies | `jsqr` 1.4.0 (QR decoding), `pdfjs-dist` 6.4.299 (PDF text; opened with `isEvalSupported: false`; worker served from our own site). Both load only when used. pdf.js 3.x was dropped because its optional `canvas` → `tar` chain fails `npm audit`. | `package.json`, `vite.config.js` |

**Android app:** not updated in this release (on hold). Its rules are still v1.1.1; regenerate `RuleData.java` with `tools/gen_rules.mjs` when work resumes.

---

# Changes in rules version 1.1.0

Fixes for the 19 errors found in the test report, plus extra protection layers.

| Area | Change | Files |
|---|---|---|
| Normalisation | Rules run on a cleaned "match view" (NFKC, zero-width characters removed, single line breaks become spaces). Matches are mapped back so quotes stay verbatim. Fixes E01, E03, E04. | `src/utils/analyzer.js` |
| Look-alike keywords | OTP and CVV match "O T P", "0TP", "C V V". Fixes E05, E06. | `src/data/rules.js` |
| Negation | Clause-aware: negator must be in the same clause (breaks at . ! ? ; line break, "but", "however"...), cannot be followed by "and/then/just/worry/hesitate...", and is also checked inside Hindi and Hinglish matches. Fixes E02, E10, E11. | `src/utils/analyzer.js` |
| Scoring | Explained bonuses (repeat, combo, hidden characters) exposed as `result.scoreAdjustments`. Fixes E07, E08. | `src/utils/analyzer.js` |
| Rules | New: `CRD-02` (forward the code), `CRD-03` (passive card details), `PAY-03` (gift cards), `OFR-02` (guaranteed returns / doubler, split from OFR-01), `FEE-03` (bare fee mention, weak), `EXT-01` (blackmail) and a `blackmail` category with advice. `FEE-01` now needs a demand verb or a stated amount. Fixes E09, E12 to E16. | `src/data/rules.js`, `tactics.js`, `advice.js` |
| Hidden characters | Zero-width or full-width characters add +2 and show a warning. | `analyzer.js` |
| Links | Brand look-alike check (e.g. `hdfcbank-kyc.com`, `paytm.com.evil.xyz`); punycode prefix no longer counted as hyphens. | `src/utils/linkCheck.js` |
| Language | Hinglish is detected. | `analyzer.js` |
| Auth | Stricter email check, non-Latin letters allowed in passwords. Fixes E17 to E19. | `src/utils/authValidation.js` |
| Tests | 251 tests (was 27): per-rule examples, evasion variants, negation table, randomised robustness test, and a labelled scam/genuine set (`evalset.test.js`). `npm test` now runs all. | `src/utils/*.test.js` |
| Transparency | Privacy page and README describe the new normalisation honestly. | `PrivacyPage.jsx`, `README.md` |
| Hardening | Security headers and a report-only Content-Security-Policy (check the browser console, then switch to enforcing). | `vercel.json` |

Behaviour changes to be aware of
- `a@b.c.d` is no longer a valid email (one-letter ending).
- A bare "processing fee" or "registration fee" is now weak (low) on its own; paying it, or a stated amount, is strong.
- "Guaranteed returns" moved from `OFR-01` to `OFR-02` (stronger).

# Changes in rules version 1.1.1 (22 Oct 2026)

Fixes from `TEST_REPORT_2026-10-22.md`.

| # | Change | Files |
|---|---|---|
| 1 | Signup trigger `handle_new_user` restored to the fixed version (no `NULLIF`). The old version crashed signup on the live project on 21 Oct. The live database already has the fix, so **nothing needs to be run in Supabase**. | `supabase/schema.sql` |
| 2 | Server-side errors (status 500+, `unexpected_failure`, "Database error…") now say "The account service hit a problem on its side…" instead of blaming the user's internet. | `src/utils/authValidation.js` + tests |
| 3 | `npm test` lists the 5 test files explicitly, so it works on Windows with any Node version (the `*.test.js` pattern needs Node 21+). | `package.json` |
| 4 | `OFR-02` now catches "guaranteed 3x returns", "assured 12% returns" and "3x returns"; `CHN-01` catches "join our Telegram/WhatsApp group/channel". | `src/data/rules.js` |
| 5 | New category **Electricity / utility disconnection** (`utility_bill`) with its own advice. New rule `THR-03`; electricity/power/connection wording removed from `THR-01` (bank/KYC). | `rules.js`, `advice.js` |
| 6 | Content-Security-Policy allows Google Fonts, so fonts keep working if the policy is switched from report-only to enforcing. | `vercel.json` |
| — | 8 new regression tests (259 total, all pass). Rules version 1.1.0 → 1.1.1. | `src/utils/*.test.js`, `analyzer.js` |

Not changed: simulator choice order (risky first, safe last) — a design decision for you.
