chrome.runtime.onInstalled.addListener(() => {
  console.log("Web Weaver installed successfully");
});

// Handle popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractData") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["content.js"]
      }).catch(err => {
        console.error("Injection failed:", err);
        sendResponse({ error: err.message });
      });
    });
  }
  return true; // Keep message channel open
});