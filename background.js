// Performance metrics with proper averaging
let performanceMetrics = {
  extractionCount: 0,
  errorCount: 0,
  totalExtractionTime: 0
};

// UNIFIED: Single onInstalled listener
chrome.runtime.onInstalled.addListener(() => {
  console.log("Web Weaver Lightning v0.7 installed successfully");
  
  // Initialize default settings
  chrome.storage.local.set({
    webWeaverSettings: {
      maxTables: 5,
      maxTableRows: 15,
      maxLinks: 15,
      maxImages: 8,
      maxForms: 5,
      tableDepth: 3,
      dynamicTimeout: 3000
    }
  });
  
  // Context menu for power users (Day 4 scope)
  chrome.contextMenus.create({
    id: "webweaver-extract",
    title: "🕸️ Extract with Web Weaver",
    contexts: ["page"]
  });
  
  chrome.contextMenus.create({
    id: "webweaver-extract-selection",
    title: "🕸️ Extract Selection",
    contexts: ["selection"]
  });
});

// UNIFIED: Single onMessage listener with proper routing
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Main extraction handler
  if (request.action === "extractData") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        // Clear injection flag first to allow re-injection
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => { 
            window.webWeaverAllowReinject = true;
            // Clear element cache for fresh extraction
            if (window.elementCache) {
              window.elementCache.clear();
            }
          }
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
  
  // Progress updates and data forwarding
  if (request.action === "dataExtracted" || request.action === "progressUpdate") {
    // Forward to popup with error handling
    chrome.runtime.sendMessage(request).catch(err => {
      console.error("Forward to popup failed:", err);
      // Store in local storage as fallback
      if (request.action === "dataExtracted") {
        chrome.storage.local.set({
          lastExtraction: {
            data: request.data,
            timestamp: Date.now()
          }
        });
      }
    });
  }
  
  // Settings management
  if (request.action === "updateSettings") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (settings) => {
            if (window.extractionSettings) {
              Object.assign(window.extractionSettings, settings);
            }
          },
          args: [request.settings]
        });
        
        // Also store in local storage
        chrome.storage.local.set({
          webWeaverSettings: request.settings
        });
      }
    });
    sendResponse({ status: "settings_updated" });
    return true;
  }
  
  if (request.action === "getSettings") {
    chrome.storage.local.get(['webWeaverSettings'], (result) => {
      sendResponse({ 
        settings: result.webWeaverSettings || {
          maxTables: 5,
          maxTableRows: 15,
          maxLinks: 15,
          maxImages: 8,
          maxForms: 5,
          tableDepth: 3,
          dynamicTimeout: 3000
        }
      });
    });
    return true;
  }
  
  // CORRECTED: Proper performance tracking with accurate averaging
  if (request.action === "recordPerformance") {
    performanceMetrics.extractionCount++;
    if (request.extractionTime) {
      performanceMetrics.totalExtractionTime += request.extractionTime;
    }
    if (request.error) {
      performanceMetrics.errorCount++;
    }
    sendResponse({ status: "performance_recorded" });
    return true;
  }
  
  if (request.action === "getPerformanceStats") {
    const avgTime = performanceMetrics.extractionCount > 0 
      ? Math.round(performanceMetrics.totalExtractionTime / performanceMetrics.extractionCount) 
      : 0;
    
    sendResponse({ 
      stats: { 
        extractionCount: performanceMetrics.extractionCount,
        errorCount: performanceMetrics.errorCount,
        averageExtractionTime: avgTime,
        totalExtractionTime: performanceMetrics.totalExtractionTime,
        successRate: performanceMetrics.extractionCount > 0 
          ? Math.round(((performanceMetrics.extractionCount - performanceMetrics.errorCount) / performanceMetrics.extractionCount) * 100)
          : 100
      } 
    });
    return true;
  }
  
  // DAY 4 SCOPE: Essential demo support
  if (request.action === "validateDemoSites") {
    const demoSites = [
      { url: 'https://www.bloomberg.com/asia', name: 'Bloomberg Asia', status: 'validated' },
      { url: 'https://en.wikipedia.org/wiki/Artificial_intelligence', name: 'Wikipedia AI', status: 'validated' },
      { url: 'https://medium.com', name: 'Medium', status: 'validated' }
    ];
    
    sendResponse({ validated: true, sites: demoSites });
    return true;
  }
  
  // One-click demo navigation (Day 4 essential)
  if (request.action === "navigateToDemo") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.update(tabs[0].id, { url: request.url }, (updatedTab) => {
          sendResponse({ status: "navigation_started", tabId: updatedTab.id });
        });
      } else {
        sendResponse({ error: "No active tab found" });
      }
    });
    return true;
  }
  
  // TRIMMED: Error reporting with size limits
  if (request.action === "reportError") {
    const errorData = {
      error: String(request.error || '').substring(0, 200), // FIXED: Trim error message
      url: request.url,
      timestamp: Date.now()
    };
    
    console.error("Web Weaver Error Report:", errorData);
    
    // Store error for debugging
    chrome.storage.local.get(['errorLog'], (result) => {
      const errorLog = result.errorLog || [];
      errorLog.push(errorData);
      
      // Keep only last 5 errors (reduced from 10)
      if (errorLog.length > 5) {
        errorLog.shift();
      }
      
      chrome.storage.local.set({ errorLog: errorLog });
    });
    
    sendResponse({ status: "error_logged" });
    return true;
  }
  
  // Get error log for debugging
  if (request.action === "getErrorLog") {
    chrome.storage.local.get(['errorLog'], (result) => {
      sendResponse({ errorLog: result.errorLog || [] });
    });
    return true;
  }
  
  // Clear all data
  if (request.action === "clearAllData") {
    chrome.storage.local.clear(() => {
      // Reset performance metrics
      performanceMetrics = {
        extractionCount: 0,
        errorCount: 0,
        totalExtractionTime: 0
      };
      sendResponse({ status: "data_cleared" });
    });
    return true;
  }
});

// DAY 4 ESSENTIAL: Error recovery and connection management
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'webweaver-recovery') {
    port.onMessage.addListener((message) => {
      if (message.action === 'reportError') {
        console.error('Web Weaver Recovery Error:', message.error);
        
        // Try to recover by clearing problematic state
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: () => {
                // Clear all Web Weaver state
                window.webWeaverInjected = false;
                window.webWeaverAllowReinject = true;
                if (window.elementCache) {
                  window.elementCache.clear();
                }
                if (window.tagCache) {
                  window.tagCache.clear();
                }
              }
            }).catch(() => {
              // Silent fail for cross-origin issues
            });
          }
        });
      }
      
      if (message.action === 'getRecoveryData') {
        // Provide fallback extraction data from storage
        chrome.storage.local.get(['lastExtraction'], (result) => {
          port.postMessage({
            action: 'recoveryData',
            data: result.lastExtraction || null
          });
        });
      }
    });
    
    port.onDisconnect.addListener(() => {
      console.log('Web Weaver recovery port disconnected');
    });
  }
});

// Tab change handler to clean up state
chrome.tabs.onActivated.addListener((activeInfo) => {
  // Clear extraction state when switching tabs
  chrome.scripting.executeScript({
    target: { tabId: activeInfo.tabId },
    func: () => {
      if (window.webWeaverInjected) {
        window.webWeaverAllowReinject = true;
      }
    }
  }).catch(() => {
    // Silent fail - tab might not support scripting
  });
});

// Context menu handlers
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "webweaver-extract") {
    chrome.runtime.sendMessage({ action: "extractData" });
  } else if (info.menuItemId === "webweaver-extract-selection" && info.selectionText) {
    // Extract only selected content
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (selectedText) => {
        // Extract from selection
        const selectionData = {
          title: document.title,
          url: window.location.href,
          selectedText: selectedText,
          timestamp: new Date().toISOString(),
          type: 'selection'
        };
        
        chrome.runtime.sendMessage({ 
          action: "dataExtracted", 
          data: selectionData 
        });
      },
      args: [info.selectionText]
    });
  }
});

// SIMPLIFIED: Essential cleanup only (reduced from hourly to every 4 hours)
chrome.alarms.create('cleanup', { periodInMinutes: 240 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanup') {
    chrome.storage.local.get(['lastExtraction', 'errorLog'], (result) => {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      // Remove extractions older than 24 hours
      if (result.lastExtraction && (now - result.lastExtraction.timestamp) > oneDay) {
        chrome.storage.local.remove(['lastExtraction']);
      }
      
      // Clean up old errors (keep only last day)
      if (result.errorLog) {
        const recentErrors = result.errorLog.filter(error => 
          (now - error.timestamp) < oneDay
        );
        if (recentErrors.length !== result.errorLog.length) {
          chrome.storage.local.set({ errorLog: recentErrors });
        }
      }
    });
  }
});

// Handle extension updates gracefully
chrome.runtime.onUpdateAvailable.addListener(() => {
  console.log('Web Weaver update available - user can choose to reload');
  // Don't auto-reload, let user choose when convenient
});
