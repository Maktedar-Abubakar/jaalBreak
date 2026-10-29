// Right-click → "Check with JaalBreak". The selected text is kept in session
// storage (memory only) and the check page reads it. Nothing leaves the computer.
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'jaalbreak-check', title: 'Check with JaalBreak', contexts: ['selection', 'link'] });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  const text = info.selectionText || info.linkUrl || '';
  await chrome.storage.session.set({ pendingText: text.slice(0, 5000) });
  chrome.tabs.create({ url: chrome.runtime.getURL('check.html?from=menu') });
});
