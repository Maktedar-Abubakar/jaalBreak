import { analyzeMessage } from './engine.js';

const HEADINGS = {
  high: 'Likely a scam — stop here.',
  medium: 'Warning signs found — check before you do anything.',
  low: 'No known scam pattern found — that does not make it safe.',
};
const textEl = document.getElementById('text');
const out = document.getElementById('out');
if (new URLSearchParams(location.search).get('from')) document.body.classList.add('tab');

function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  Object.assign(e, attrs);
  for (const k of kids) e.append(k);
  return e;
}

function show(text) {
  out.replaceChildren();
  if (!text.trim()) return;
  const r = analyzeMessage(text);
  const box = el('div', { className: `verdict ${r.band.key}` });
  box.append(el('strong', { textContent: HEADINGS[r.band.key] }), el('span', { className: 'muted', textContent: `${r.category.label} · ${r.band.label}` }));
  if (r.signals.length) {
    const ul = el('ul');
    for (const s of r.signals.slice(0, 6)) ul.append(el('li', {}, el('q', { textContent: s.quote }), ` — ${s.tacticLabel}`));
    box.append(ul);
  }
  box.append(el('p', { textContent: r.advice.headline }));
  out.append(box);
}

document.getElementById('go').addEventListener('click', () => show(textEl.value));
chrome.storage.session.get('pendingText').then(({ pendingText }) => {
  if (pendingText) {
    textEl.value = pendingText;
    chrome.storage.session.remove('pendingText');
    show(pendingText);
  }
});
