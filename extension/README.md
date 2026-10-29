# JaalBreak browser extension (Chrome / Edge)

Select text on any web page (WhatsApp Web, Gmail, Instagram in the browser…), right-click → **Check with JaalBreak**. Or click the JaalBreak icon and paste. It uses the same rules as the website and runs on your computer — nothing is sent anywhere.

## Install (no store needed)
1. Open `chrome://extensions` (Edge: `edge://extensions`).
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose this `extension` folder.

## After changing the rules
`engine.js` is a copy of the website's rules engine. Rebuild it from the project folder:
```
npx esbuild src/utils/analyzer.js --bundle --format=esm --outfile=extension/engine.js
```
