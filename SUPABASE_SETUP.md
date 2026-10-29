# JaalBreak — Accounts, Guest Mode & Supabase Setup

This is the source of truth for JaalBreak's login system. Read it top to bottom the first time.

**Status when this file was written**

| Item | Status |
|---|---|
| App code (login, signup, guest mode, reset password, account history) | DONE |
| `.env.local` with your project URL + publishable key | DONE (project `fitnzynaqjyybdrndike`) |
| Database tables + security rules in Supabase | **NOT STARTED — you run `supabase/schema.sql` (Step 2)** |
| Supabase Auth settings (redirect URLs, password length) | **NOT STARTED — Step 3** |
| `npm install` for the new Supabase package | **NOT STARTED — Step 4** |
| Vercel environment variables | **NOT STARTED — Step 6** |

Until Step 2–4 are done, **Supabase is not connected**. The app still runs in guest mode.

---

## How it works (plain English)

- **Signed out** → you see the sign-in screen. It has **Sign in**, **Create account**, **Forgot password?** and **Continue as Guest**.
- **Guest** → every feature works. History is kept only in this browser (localStorage), exactly like before. No account is created in Supabase. A "Guest Mode" pill sits at the top of every page.
- **Signed in** → every feature works. The top bar says "Hello, <first name>". History is saved in Supabase so it follows you to other devices.
- **Account history stores summaries only**: date, category, assessment, number of checks, tactic names, input type, language, rules version. **Never** the message text, evidence quotes, screenshots, links, Aadhaar, bank or card details.
- Guest history and account history are **separate**. Signing in never uploads guest history. If there are guest records in the browser, the History page offers **"Copy them to my account…"**, which needs a second click to confirm.
- Passwords are handled entirely by Supabase Auth. JaalBreak never stores or sees them after you press the button.
- Security: every database table has **Row Level Security**. Even if someone edits the code in their browser, they can only ever read or change their own rows. Guests (signed-out visitors) cannot touch the tables at all.

---

## Step 1 — Check your Supabase keys (2 minutes)

1. Open https://supabase.com/dashboard and open project **fitnzynaqjyybdrndike**.
2. Left sidebar → **Project Settings** (gear icon) → **API Keys**.
3. Under **Publishable key**, check it matches the value in `.env.local`:
   `sb_publishable_xxMTW_Bo4dPPfjYPGBJZWw_zGfee7iY`
4. The project URL is `https://fitnzynaqjyybdrndike.supabase.co` (Project Settings → **Data API**).

⚠️ **Never** copy the **secret** key (`sb_secret_...`) or the old **service_role** key into this project. Anything starting with `VITE_` is visible to every visitor.

---

## Step 2 — Create the tables and security rules (3 minutes)

1. In the Supabase dashboard, left sidebar → **SQL Editor** → **+ New query**.
2. Open the file `supabase/schema.sql` from this project in VS Code. Select all (`Ctrl + A`), copy (`Ctrl + C`).
3. Paste into the SQL Editor and click **Run** (bottom right).
4. Expected result: **"Success. No rows returned"**. You may see notices like `policy ... does not exist, skipping` — those are normal on the first run.
5. Check it worked: left sidebar → **Table Editor**. You should see `profiles` and `scan_history`, each with a label saying RLS is **enabled**.

It is safe to run the script again later — it won't delete data.

---

## Step 3 — Auth settings in Supabase (5 minutes)

### 3a. Redirect URLs (so email links come back to your app)

Left sidebar → **Authentication** → **URL Configuration**.

- **Site URL**: your live Vercel address, e.g. `https://jaalbreak.vercel.app` (use `http://localhost:5173` until you deploy).
- **Redirect URLs** → **Add URL**, add each of these (replace the Vercel name with yours):
  ```
  http://localhost:5173/**
  http://localhost:4173/**
  https://jaalbreak.vercel.app/**
  ```
  If you use Vercel preview deployments, also add `https://*-<your-vercel-username>.vercel.app/**`.

### 3b. Password rules

**Authentication** → **Sign In / Providers** → **Email**:

- Make sure **Email** provider is **enabled**.
- **Minimum password length**: set to **8** (the app already requires 8+ with a letter and a number; this makes the server enforce it too).
- **Confirm email**:
  - **ON** (recommended): after signup, people get a verification email and must click it before signing in. The app shows a "Check your email" screen with a **Resend** button.
  - **OFF**: people are signed in immediately after signup.
- Click **Save**.

### 3c. Email sending (important for testing)

Supabase's built-in email sender is for testing only: it has a very low hourly limit and may only deliver to email addresses of your Supabase team members. If verification or reset emails don't arrive for other addresses, set up custom SMTP: **Authentication** → **Emails** → **SMTP Settings** (any provider such as Resend, Brevo or SendGrid works).

---

## Step 4 — Install and run locally (Windows PowerShell)

One command at a time. Open PowerShell in the project folder (the one with `package.json`).

```powershell
npm install
```
Expected: ends with something like `added 3 packages` (it installs `@supabase/supabase-js`). Warnings are fine; red `ERR!` lines are not.

```powershell
npm test
```
Expected: ends with `# pass 27` and `# fail 0`.

```powershell
npm run dev
```
Expected: `Local: http://localhost:5173/`. The browser opens on the JaalBreak sign-in screen.

`.env.local` is already in the project folder with your URL and key. If you ever change it, stop the server (`Ctrl + C`) and run `npm run dev` again — Vite only reads it at start-up.

If `.env.local` is missing or empty, the sign-in screen shows **"Accounts aren't set up in this version of JaalBreak yet"** and only **Continue as Guest** works. That is expected.

---

## Step 5 — Push to GitHub safely

`.gitignore` already blocks `.env`, `.env.local` and other env files. Before your first push, check:

```powershell
git status
```
`.env.local` must **not** appear in the list. `.env.example` (placeholders only) is fine to commit.

---

## Step 6 — Deploy on Vercel

1. https://vercel.com → **Add New…** → **Project** → import your GitHub repo.
2. Framework preset: **Vite** (detected automatically). Build command `npm run build`, output folder `dist`. No other settings needed — JaalBreak uses `#/` URLs, so no rewrites are required.
3. Before clicking Deploy, open **Environment Variables** and add both (tick Production **and** Preview):
   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://fitnzynaqjyybdrndike.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | your `sb_publishable_...` key |
4. **Deploy**.
5. Copy your live URL (e.g. `https://jaalbreak.vercel.app`) and go back to **Step 3a** — set it as **Site URL** and add it to **Redirect URLs**.

If you add or change an environment variable later, you must **redeploy** (Vercel → Deployments → ⋯ → Redeploy). Vite bakes the values in at build time.

---

## Manual testing checklist

Do this once on `localhost` and once on the live Vercel URL. Tick each one.

**Guest mode**
- [ ] Fresh browser (or incognito) → sign-in screen appears.
- [ ] **Continue as Guest** → app opens, "Guest Mode" pill at the top.
- [ ] Analyse a message → it appears in Analysis History.
- [ ] Refresh the page → still in guest mode, history still there.
- [ ] Message Analysis, Manipulation X-Ray, Scam Journey Simulator, screenshot OCR, Report & Next Steps all work.

**Sign up**
- [ ] Guest top bar → **Create account**. Submit empty → four red field errors.
- [ ] Password `abc` → "Password needs…" message. Mismatched confirm → "Passwords do not match."
- [ ] Valid details → "Check your email" (if Confirm email is ON).
- [ ] Click the email link **in the same browser** → app opens signed in, "Hello, <first name>".
- [ ] Sign up again with the same email → "An account with this email already exists…"

**Sign in / out**
- [ ] Wrong password → "That email and password don't match an account."
- [ ] Correct password → "Hello, <first name>".
- [ ] Analyse a message → it appears in history with a cloud icon in the top bar ("History saved to your account").
- [ ] Supabase → Table Editor → `scan_history`: the row has category, risk level and tactic names — **no message text**.
- [ ] Refresh → still signed in, history still there.
- [ ] **Sign out** → back to the sign-in screen. Sign in again → same history.
- [ ] Guest history from earlier is **not** in the account. History page offers "Copy them to my account…"; copying needs a second confirmation.

**Password reset**
- [ ] Sign-in screen → **Forgot password?** → enter email → "If an account exists… a reset link is on its way."
- [ ] Open the link in the same browser → "Choose a new password" → save → "Your password has been updated."
- [ ] Sign out → sign in with the new password.

**Separation & security**
- [ ] Create a second account in another browser. Its history is empty and it never sees the first account's records.
- [ ] Turn off Wi-Fi and try to sign in → "We couldn't reach the account service…" and **Continue as Guest** still works.

---

## Files added or changed

| File | What it does |
|---|---|
| `src/lib/supabaseClient.js` | **New.** Creates the one Supabase client from the two env variables. If they're missing, accounts are disabled and guest mode still works. |
| `src/lib/cloudHistory.js` | **New.** Load / save / delete / clear / import account history in the `scan_history` table. |
| `src/auth/AuthProvider.jsx` | **New.** Keeps track of who is using the app (loading / signed out / guest / signed in), restores the session on refresh, handles email-link returns, expired sessions, sign-in, sign-up, sign-out, reset password. |
| `src/auth/AuthScreen.jsx` | **New.** The two-column sign-in screen: Sign in, Create account, Forgot password, Choose new password, Check your email, Continue as Guest. |
| `src/auth/AuthFields.jsx` | **New.** Accessible text field, password field (show/hide + live requirement ticks), submit button with spinner, alert box. |
| `src/components/AccountBar.jsx` | **New.** Top bar: "Guest Mode" + Sign in / Create account, or "Hello, name" + Sign out + history status. |
| `src/utils/authValidation.js` | **New.** Email/password/name checks, friendly error messages (raw server errors are never shown), email-link parsing. |
| `src/utils/historyMapping.js` | **New.** Converts history records to database rows. Only summary fields are copied, so message text can't leak into the database. |
| `src/utils/authValidation.test.js`, `src/utils/historyMapping.test.js` | **New.** 12 tests for validation, error messages, access states, history separation and the no-message-text rule. |
| `src/styles/auth.css` | **New.** Styles for the sign-in screens and top bar, using the existing design tokens. |
| `supabase/schema.sql` | **New.** Tables, foreign keys, index, RLS policies, profile-creation trigger. |
| `.env.example` | **New.** Placeholder values only. |
| `.env.local` | **New.** Your real URL + publishable key. Ignored by Git. |
| `SUPABASE_SETUP.md` | **New.** This file. |
| `src/App.jsx` | Shows the sign-in screen / loading screen when needed; keeps guest history (localStorage) and account history (Supabase) separate; adds the top bar. All existing pages unchanged in behaviour. |
| `src/main.jsx` | Wraps the app in `AuthProvider`; loads `auth.css`. |
| `src/utils/useHashRoute.js` | Adds `#/login`, `#/signup`, `#/forgot`. |
| `src/pages/HistoryPage.jsx` | Wording for guest vs account; loading/offline states; "Copy guest records to my account" with confirmation. |
| `src/pages/PrivacyPage.jsx` | Explains where data is stored for guest vs account; "Delete data in this browser" when signed in. |
| `src/pages/OverviewPage.jsx`, `src/pages/AnalyzePage.jsx` | Small wording fixes so privacy statements stay true for signed-in users. |
| `src/components/Icons.js` | Adds the new icons used above. |
| `package.json` | Adds `@supabase/supabase-js`; `npm test` now runs all three test files. |
| `.gitignore` | Ignores all `.env*` files except `.env.example`, and `.vercel`. |

---

## Troubleshooting

| You see | Do this |
|---|---|
| "Accounts aren't set up in this version…" | `.env.local` missing/empty locally, or the env vars aren't set in Vercel (then redeploy). |
| "That link must be opened in the same browser…" | Email links use a secure one-time code tied to the browser that asked for it. Open the link in that browser. For sign-up links, the email is usually verified anyway — just sign in. |
| "That email link has expired or was already used." | Request a new one (Resend verification / Forgot password). |
| Email never arrives | Check spam. Then see Step 3c (built-in sender limits → set up SMTP). |
| Clicking the email link opens `localhost` on the live site | Step 3a: the **Site URL** is still localhost, or your Vercel URL isn't in **Redirect URLs**. |
| "Couldn't load your history" | Network issue, or Step 2 (SQL) wasn't run. |
| "This check wasn't saved to your history" | The analysis still worked; saving failed (offline or tables missing). |
