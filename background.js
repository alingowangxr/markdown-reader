chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  await chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ["overlay.css"]
  });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: [
      "libs/jszip.min.js",
      "libs/Readability.js",
      "libs/turndown.js",
      "libs/marked.umd.min.js",
      "libs/purify.min.js",
      "content.js"
    ]
  });
});