chrome.runtime.onInstalled.addListener(() => {
  console.log("Web Weaver installed successfully");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractData") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        // Clear injection flag first to allow re-injection
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => { window.webWeaverAllowReinject = true; }
        }).then(() => {
          return chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["content.js"]
          });
        }).then(() => {
          sendResponse({ status: "injection_successful" });
        }).catch(err => {
          console.error("Injection failed:", err);
          sendResponse({ error: err.message });
        });
      } else {
        sendResponse({ error: "No active tab found" });
      }
    });
    return true;
  }
  
  if (request.action === "dataExtracted") {
    chrome.runtime.sendMessage(request).catch(err => {
      console.error("Forward failed:", err);
    });
  }
});
