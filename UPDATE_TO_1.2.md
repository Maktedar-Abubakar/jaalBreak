# Updating your project to JaalBreak 1.2 — step by step (Windows)

Use **CMD** (not PowerShell). Type each command exactly, one at a time. After each one, check you see the expected result before moving on. If anything shows red errors, copy everything from the first red line down and send it to Claude.

| Status | Step |
|---|---|
| NOT STARTED | 1. Copy the new files in |
| NOT STARTED | 2. Install the two new libraries |
| NOT STARTED | 3. Run the tests |
| NOT STARTED | 4. Try it on your laptop |
| NOT STARTED | 5. Create the community table in Supabase |
| NOT STARTED | 6. Push to GitHub (Vercel deploys by itself) |
| NOT STARTED | 7. (Optional) Rename the Vercel project |
| NOT STARTED | 8. (Optional) Install the browser extension |

## 1. Copy the new files in
1. Unzip `jaalbreak-v1.2.0.zip`.
2. Open the unzipped folder, select **everything inside it** (Ctrl+A), copy (Ctrl+C).
3. Open your project folder (the one with `package.json`, `src`, `.env.local`), paste (Ctrl+V) and choose **Replace the files in the destination**.

Your `.env.local`, `.git` and `node_modules` are not in the zip, so they are kept.

## 2. Install the two new libraries
```cmd
cd /d "C:\path\to\your\project"
```
(Replace the path. Tip: type `cd /d ` then drag the project folder into the window.)
```cmd
npm install
```
Expected: ends with something like `added 3 packages`. Warnings are fine.

## 3. Run the tests
```cmd
npm test
```
Expected near the end: `# pass 322` and `# fail 0`.

## 4. Try it on your laptop
```cmd
npm run dev
```
Your browser opens the app. Check quickly:
- Message Analysis → sample **"Instagram: fake copyright appeal"** → Analyze → big red **"Likely a scam — stop here."**
- Click **हिन्दी** then **Read aloud** — it speaks.
- **QR code** tab and **Offer letter / PDF** tab open without errors.
Stop it with **Ctrl+C** in CMD, then:
```cmd
npm run build
```
Expected: ends with `✓ built in …`. If it fails, send Claude the red text.

## 5. Create the community table in Supabase (for "Share anonymously" and Scam Trends)
1. Supabase dashboard → your project → **SQL Editor** → **New query**.
2. Open `supabase/community.sql` from your project in Notepad, copy all of it, paste it into the editor.
3. Click **Run**. Expected: `Success. No rows returned`.
Without this step everything else works; the community parts just say "needs the online database".

## 6. Push to GitHub
```cmd
git add -A
```
```cmd
git commit -m "JaalBreak 1.2: new detection rules, Kannada, QR/UPI/PDF/call checks, report pack, trends, PWA, API, extension"
```
```cmd
git push
```
Expected: ends with `main -> main`. Vercel builds automatically in 1–2 minutes (Vercel dashboard → Deployments shows **Ready**).

Then open `https://YOUR-SITE.vercel.app/api/check` — expected: a short JSON message with `"name":"JaalBreak check API"`.

## 7. (Optional) Rename the Vercel project to jaalbreak
Vercel → project → **Settings → General → Project Name** → `jaalbreak` → Save. Your web address may change to `jaalbreak.vercel.app` (if that name is free).
**If the address changes, update Supabase too**, or email login links break: Supabase → **Authentication → URL Configuration** → set **Site URL** to the new address and add `https://NEW-ADDRESS/**` under **Redirect URLs**.

## 8. (Optional) Browser extension
Chrome → `chrome://extensions` → turn on **Developer mode** → **Load unpacked** → choose the `extension` folder inside your project. Select text on any page → right-click → **Check with JaalBreak**.

## Before the demo
- Ask your Kannada-speaking teammate to check `KANNADA_REVIEW.md`.
- Phone: open the site in Chrome → menu → **Add to Home screen** (it then works offline).
- The Android app was **not** changed in this update.
