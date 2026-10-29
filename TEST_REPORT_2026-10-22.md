# ScamShield — Test Report (22 Oct 2026)

Version tested: `scamShield-auth-improved.zip` (rules v1.1.0).

## How it was tested

| Layer | How | Result |
|---|---|---|
| Unit tests (`npm test`) | Node test runner, all 5 test files | **251 / 251 pass** |
| Every page in a real browser (Chromium) | Automated clicks and typing, guest mode | **49 / 49 pass** (after fixing 4 errors in the test script itself) |
| Login / accounts in a real browser | Automated, with a **stand-in** for Supabase | **37 / 37 pass** |
| Analyzer spot checks | 17 hand-written real-world messages | 3 misses (see below) |

**Not tested here:** the real Supabase project (the stand-in copies its behaviour; you already confirmed real signup/login works), real OCR text extraction (the OCR engine downloads from a CDN this test machine can't reach; the failure path + fallback were tested), and `vite build` (compiled with a different bundler instead; you ran `npm run build` successfully on your PC on 20 Oct).

## Feature results

| Feature | What was checked | Result |
|---|---|---|
| Overview | Example exhibit, sample history table, empty-input error, analyse → results page, "Analyse this example" | PASS |
| Message Analysis | All 5 samples (4 strong, genuine delivery = few signs), empty error, 5,000-char limit, Clear, Copy summary to clipboard | PASS |
| Manipulation X-Ray | Highlights shown, every highlight opens a "Verified quote" detail, keyboard (Enter) works | PASS |
| Scam Journey Simulator | All 4 scenarios × safest path and riskiest path → summary after 3 decisions; Restart; re-entering starts fresh | PASS |
| Report & Next Steps | 1930 + cybercrime.gov.in listed, "money lost = yes" shows Amount, blanks become `[not provided]`, download .txt | PASS |
| "I feel pressured" pause | Countdown runs, Escape closes | PASS |
| Analysis History (guest) | Records saved, risk filter, search "no match" message, view details, delete one | PASS |
| Privacy & Method | Rule catalogue, "Save history" OFF saves nothing, "Save full text" ON stores text + re-opens in X-Ray, Delete everything clears storage | PASS |
| Screenshot OCR | Sample screenshot loads, clear error when engine can't download, demo fallback fills the text box | PASS (real extraction not tested) |
| Mobile (390 px) | Drawer menu works, no sideways scrolling on any of the 7 pages, auth screen | PASS |
| Sign-in screens | Signup validation (4 errors, weak password, mismatch), check-email, duplicate email, unverified login + resend, wrong password, offline message, login greeting, keeps original page | PASS |
| Account history | Saved to account, **no message text in database row**, survives refresh, guest history kept separate, import only after confirm, delete | PASS |
| Session | Restore after refresh, logout, expired session notice, password reset (incl. same-password rejection), forgot password | PASS |
| Missing keys | Warning shown, forms disabled, guest mode still works | PASS |
| Console | No unexpected errors | PASS |

## Re-test after fixes (same day)

| Test run | Result |
|---|---|
| Unit tests | **259 / 259 pass** (8 new regression tests) |
| Every page in a browser | **51 / 51 pass** (incl. new electricity + investment checks) |
| Login / accounts in a browser | **37 / 37 pass** |
| `schema.sql` on Postgres 16 (run twice) | Runs cleanly; trigger saves trimmed names and blanks; RLS blocks cross-user and signed-out access |

Problems 1–6 below are **FIXED** in rules version 1.1.1 (see `CHANGES.md`). Problem 7 is left for you to decide.

## Problems found

| # | Severity | Problem | Fix |
|---|---|---|---|
| 1 | **HIGH** | `supabase/schema.sql` in this zip has the **old signup trigger** (`left(nullif(trim(...)))`) — the exact version that crashed signup on your Supabase project on 21 Oct. The live database is fine *right now*, but if this file is ever re-run, signup breaks again. | Replace the `handle_new_user` function in `schema.sql` with the fixed version (btrim/coalesce/substr). |
| 2 | MEDIUM | `src/utils/authValidation.js` lost the 21 Oct fix: a server-side error (e.g. "Database error saving new user") is again shown as "We couldn't reach the account service… check your internet" — misleading. | Re-add the `status >= 500 / unexpected_failure / database error` check **before** the network check. |
| 3 | MEDIUM | `"test": "node --test src/utils/*.test.js"` — on Windows CMD the `*` is only understood by **Node 21 or newer**. On Node 20 or older, `npm test` fails with "Could not find…". | Check `node -v`. If below 21, list the 5 files explicitly in package.json. |
| 4 | MEDIUM | Analyzer miss: "Invest 10k and get guaranteed **3x** returns in 7 days" → 0 checks ("guaranteed returns" only matches when the words are next to each other). "…get 3x returns… Join our Telegram group now" → 0 checks. | Widen OFR-02 to allow a word between "guaranteed" and "returns", and add "Nx returns". |
| 5 | LOW | Analyzer category: "Your electricity connection will be disconnected tonight… call…" → category **Bank / KYC suspension** (warning level is fine, label is wrong). | Add a utility-bill category or route THR-01 utility wording elsewhere. |
| 6 | LOW | `vercel.json` Content-Security-Policy (report-only) doesn't allow Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`). Harmless now; if switched to enforcing, fonts fall back to system fonts. | Add those two domains to `style-src` and `font-src` before enforcing. |
| 7 | LOW (design) | In all 4 simulator scenarios the riskiest choice is always option A and the safest is always the last option. Users can learn the pattern instead of the lesson. | Shuffle choice order per scenario. |
| 8 | INFO | `.env.local` is not in this zip (correct — keep your existing one). | — |
