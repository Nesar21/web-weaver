// background.js - SURGICAL FIX
chrome.runtime.onInstalled.addListener(() => {
  console.log("Web Weaver installed successfully");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractData") {
    // Async work happening - must return true
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["content.js"]
        })
        .then(() => {
          // THE FIX: Fulfill the promise
          sendResponse({ status: "injection_successful" });
        })
        .catch(err => {
          console.error("Injection failed:", err);
          sendResponse({ error: err.message });
        });
      } else {
        sendResponse({ error: "No active tab found" });
      }
    });
    
    // Signal async response coming
    return true;
  }
  
  if (request.action === "dataExtracted") {
    // Forward to popup (no async work - no return true needed)
    chrome.runtime.sendMessage(request).catch(err => {
      console.error("Forward failed:", err);
    });
  }
  
  // Default: no async response for other messages
});
