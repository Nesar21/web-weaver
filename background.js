// Day 4 Enhanced Background Script with AI Integration
console.log('Web Weaver Lightning Background v1.0 Day 4 - Starting...');

// AI Configuration Management
let AI_CONFIG = {
  model: 'gpt-4o-mini',
  maxTokens: 2000,
  apiKey: null
};

// Load API key from storage on startup
chrome.storage.local.get(['openaiApiKey'], (result) => {
  if (result.openaiApiKey) {
    AI_CONFIG.apiKey = result.openaiApiKey;
    console.log('[Background] API key loaded from storage');
  } else {
    console.log('[Background] No API key found - please configure');
  }
});

// Load extractor module
async function loadExtractor() {
  try {
    const response = await fetch(chrome.runtime.getURL('extractor.js'));
    const extractorCode = await response.text();
    
    // Create a function scope and execute the extractor code
    const extractorModule = new Function('module', 'exports', extractorCode + '; return { extractWithAI, enforceSchema };');
    const moduleObj = { exports: {} };
    
    return extractorModule(moduleObj, moduleObj.exports);
  } catch (error) {
    console.error('[Background] Failed to load extractor:', error);
    throw error;
  }
}

// Performance tracking
const performanceMetrics = {
  totalExtractions: 0,
  successfulExtractions: 0,
  failedExtractions: 0,
  totalTokensUsed: 0,
  averageTime: 0
};

// Update performance metrics
function updateMetrics(success, duration, tokensUsed = 0) {
  performanceMetrics.totalExtractions++;
  
  if (success) {
    performanceMetrics.successfulExtractions++;
    performanceMetrics.totalTokensUsed += tokensUsed;
  } else {
    performanceMetrics.failedExtractions++;
  }
  
  // Calculate running average
  performanceMetrics.averageTime = 
    (performanceMetrics.averageTime * (performanceMetrics.totalExtractions - 1) + duration) / 
    performanceMetrics.totalExtractions;
  
  console.log('[Background] Updated metrics:', performanceMetrics);
}

// Main message handler with robust error handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const startTime = Date.now();
  
  // Handle API key configuration
  if (request.action === "setApiKey") {
    chrome.storage.local.set({ openaiApiKey: request.apiKey }, () => {
      AI_CONFIG.apiKey = request.apiKey;
      console.log('[Background] API key updated');
      sendResponse({ success: true });
    });
    return true;
  }
  
  // Handle API key retrieval
  if (request.action === "getApiKey") {
    sendResponse({ 
      success: true, 
      apiKey: AI_CONFIG.apiKey ? "***configured***" : null,
      hasKey: !!AI_CONFIG.apiKey
    });
    return false;
  }
  
  // Handle AI extraction requests
  if (request.action === "extractWithAI") {
    handleAIExtraction(request, sender, sendResponse, startTime);
    return true; // Keep message channel open
  }
  
  // Handle content extraction requests (triggers content script)
  if (request.action === "extractData") {
    handleContentExtraction(sender, sendResponse, startTime);
    return true; // Keep message channel open
  }
  
  // Handle performance metrics requests
  if (request.action === "getMetrics") {
    sendResponse({ 
      success: true, 
      metrics: performanceMetrics 
    });
    return false;
  }
});

// Handle AI extraction with full error handling
async function handleAIExtraction(request, sender, sendResponse, startTime) {
  try {
    console.log('[Background] Starting AI extraction...');
    
    if (!AI_CONFIG.apiKey) {
      throw new Error('API key not configured. Please set your OpenAI API key.');
    }
    
    if (!request.pageContent) {
      throw new Error('No page content provided for extraction');
    }
    
    // Load extractor module
    const { extractWithAI } = await loadExtractor();
    
    // Perform AI extraction
    const result = await extractWithAI(request.pageContent, AI_CONFIG);
    
    const duration = Date.now() - startTime;
    
    if (result.success) {
      updateMetrics(true, duration, result.metadata?.tokensUsed || 0);
      
      console.log('[Background] AI extraction successful:', {
        duration: `${duration}ms`,
        tokensUsed: result.metadata?.tokensUsed || 0,
        fieldsExtracted: Object.keys(result.data).filter(k => result.data[k] !== null).length
      });
      
      sendResponse({
        success: true,
        data: result.data,
        metadata: {
          ...result.metadata,
          totalDuration: duration
        }
      });
    } else {
      updateMetrics(false, duration);
      
      console.error('[Background] AI extraction failed:', result.error);
      
      sendResponse({
        success: false,
        error: result.error,
        metadata: {
          extractionTime: duration,
          failed: true
        }
      });
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    updateMetrics(false, duration);
    
    console.error('[Background] AI extraction error:', error);
    
    sendResponse({
      success: false,
      error: error.message,
      metadata: {
        extractionTime: duration,
        failed: true
      }
    });
  }
}

// Handle content extraction (triggers content script then AI)
async function handleContentExtraction(sender, sendResponse, startTime) {
  try {
    console.log('[Background] Starting full extraction pipeline...');
    
    // Get page content from content script
    const response = await chrome.tabs.sendMessage(sender.tab.id, {
      action: "extractPageData"
    });
    
    if (!response.success) {
      throw new Error(`Content extraction failed: ${response.error}`);
    }
    
    const pageData = response.data;
    
    // If AI is configured, enhance with AI extraction
    if (AI_CONFIG.apiKey && pageData.content) {
      console.log('[Background] Enhancing with AI extraction...');
      
      const aiResponse = await handleAIExtractionInternal(pageData.content, startTime);
      
      if (aiResponse.success) {
        // Merge AI results with page data
        const enhancedData = {
          ...pageData,
          ai: aiResponse.data,
          aiMetadata: aiResponse.metadata,
          enhancedWithAI: true
        };
        
        sendResponse({
          success: true,
          data: enhancedData
        });
      } else {
        // Return page data with AI error info
        sendResponse({
          success: true,
          data: {
            ...pageData,
            aiError: aiResponse.error,
            enhancedWithAI: false
          }
        });
      }
    } else {
      // Return basic page data without AI enhancement
      sendResponse({
        success: true,
        data: {
          ...pageData,
          enhancedWithAI: false,
          aiError: AI_CONFIG.apiKey ? null : 'API key not configured'
        }
      });
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error('[Background] Full extraction failed:', error);
    
    sendResponse({
      success: false,
      error: error.message,
      metadata: {
        extractionTime: duration,
        failed: true
      }
    });
  }
}

// Internal AI extraction helper
async function handleAIExtractionInternal(pageContent, startTime) {
  try {
    const { extractWithAI } = await loadExtractor();
    return await extractWithAI(pageContent, AI_CONFIG);
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Extension lifecycle
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Background] Web Weaver Lightning installed:', details.reason);
  
  // Set default settings
  chrome.storage.local.get(['openaiApiKey'], (result) => {
    if (!result.openaiApiKey) {
      console.log('[Background] First install - API key setup required');
    }
  });
});

console.log('[Background] Web Weaver Lightning Day 4 ready');
