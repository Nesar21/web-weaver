console.log("Web Weaver injected:", window.location.href);

function extractPageData() {
  try {
    return {
      title: document.title || "No title",
      url: window.location.href,
      snippet: document.body?.innerText?.slice(0, 300) || "No content found",
      timestamp: new Date().toISOString(),
      domain: window.location.hostname
    };
  } catch (error) {
    console.error("Extraction failed:", error);
    return { error: error.message, url: window.location.href };
  }
}

const pageData = extractPageData();
console.log("Page JSON baseline:", JSON.stringify(pageData, null, 2));

// Send data back to background
chrome.runtime.sendMessage({ 
  action: "dataExtracted", 
  data: pageData 
}).catch(err => {
  console.error("Background communication failed:", err);
});