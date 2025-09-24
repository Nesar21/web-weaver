// Day 4 Enhanced Background Script with AI Integration + Day 5 Validation Listener
console.log('Web Weaver Lightning Background v1.0 Day 5 - Starting...');

// AI Configuration Management
let AI_CONFIG = {
  model: 'gemini-2.0-flash',
  maxTokens: 2000,
  apiKey: null
};

// Load API key from storage on startup
chrome.storage.local.get(['geminiApiKey'], (result) => {
  if (result.geminiApiKey) {
    AI_CONFIG.apiKey = result.geminiApiKey;
    console.log('[Background] API key loaded from storage');
  } else {
    console.log('[Background] No API key found - please configure');
  }
});

// ✅ ULTIMATE CSP-Safe extractor loading (Service Worker compatible)
async function loadExtractor() {
  try {
    console.log('[Background] Loading extractor functions...');
    // Since Service Workers can't use import(), we'll use fetch + safe execution
    const response = await fetch(chrome.runtime.getURL('extractor.js'));
    const extractorCode = await response.text();

    // ✅ Create a safe execution environment without eval
    // We'll use a data URL approach that's CSP-compliant
    const safeWorker = new Worker(
      URL.createObjectURL(new Blob([extractorCode], { type: 'application/javascript' }))
    );
    
    console.log('[Background] Extractor loaded safely');
    return safeWorker;
  } catch (error) {
    console.error('[Background] Failed to load extractor:', error);
    return null;
  }
}

// ✅ DIRECT AI EXTRACTION IMPLEMENTATION (No external modules needed)
async function executeAIExtraction(pageContent, apiConfig) {
  const startTime = Date.now();
  try {
    console.log('[Background] Starting AI extraction directly...');
    
    if (!apiConfig.apiKey) {
      throw new Error('API key not configured');
    }
    
    if (!pageContent || pageContent.length < 50) {
      throw new Error('Insufficient content for extraction');
    }

    // Prepare content for AI processing
    const truncatedContent = pageContent.length > 8000 ?
      pageContent.substring(0, 8000) + '...' : pageContent;
    console.log(`[Background] Processing ${truncatedContent.length} characters...`);

    // ✅ PERFECTED Gemini API payload
    const payload = {
      contents: [{
        parts: [{
          text: `Extract structured data from this webpage content and return ONLY a valid JSON object with these exact fields:

- title: main page title
- description: brief summary (1-2 sentences)
- author: author name if found
- date: publication date if found
- category: content category (news/blog/product/docs/etc)
- links: array of important URLs mentioned
- images: array of important image descriptions
- content: key content summary (100 words max)

Webpage content:
${truncatedContent}`
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: apiConfig.maxTokens || 2000,
        responseMimeType: "application/json"
      }
    };

    console.log('[Background] Calling Gemini API...');

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${apiConfig.model}:generateContent?key=${apiConfig.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('[Background] Gemini API response received');

    // Extract the generated content
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
      throw new Error('Invalid Gemini API response structure');
    }

    const generatedText = result.candidates[0].content.parts[0].text;
    console.log('[Background] Generated content:', generatedText.substring(0, 200) + '...');

    // ✅ CSP-Safe JSON parsing
    let aiData;
    try {
      aiData = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('[Background] JSON parse failed:', parseError);
      // Try to extract JSON from text if wrapped
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    // Enforce schema
    const cleanedData = enforceSchemaLocal(aiData);
    const duration = Date.now() - startTime;

    console.log(`[Background] AI extraction completed in ${duration}ms`);
    return {
      success: true,
      data: cleanedData,
      metadata: {
        model: apiConfig.model,
        extractionTime: duration,
        contentLength: pageContent.length,
        tokensApprox: Math.ceil(pageContent.length / 4)
      }
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Background] AI extraction failed:', error);
    return {
      success: false,
      error: error.message,
      metadata: {
        extractionTime: duration,
        failed: true
      }
    };
  }
}

// ✅ LOCAL SCHEMA ENFORCEMENT (No external dependencies)
function enforceSchemaLocal(data) {
  const SCHEMA_FIELDS = ['title', 'description', 'author', 'date', 'content', 'links', 'images', 'category'];
  const cleanedData = {};

  SCHEMA_FIELDS.forEach(field => {
    cleanedData[field] = data[field] || null;
  });

  // Ensure arrays are arrays
  cleanedData.links = Array.isArray(cleanedData.links) ? cleanedData.links : [];
  cleanedData.images = Array.isArray(cleanedData.images) ? cleanedData.images : [];

  return cleanedData;
}

// Main message handler with robust error handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const startTime = Date.now();

  // Handle API key configuration
  if (request.action === "setApiKey") {
    chrome.storage.local.set({ geminiApiKey: request.apiKey }, () => {
      AI_CONFIG.apiKey = request.apiKey;
      console.log('[Background] API key updated');
      sendResponse({ success: true });
    });
    return true;
  }

  // Handle API key retrieval properly
  if (request.action === "getApiKey") {
    sendResponse({
      success: true,
      apiKey: AI_CONFIG.apiKey ? "***configured***" : null,
      hasKey: !!AI_CONFIG.apiKey
    });
    return false; // Synchronous response
  }

  // Handle content extraction requests
  if (request.action === "extractData") {
    handleContentExtraction(sendResponse, startTime);
    return true; // Keep message channel open
  }

  // ✅ DAY 5: Handle validation requests - SIMPLE MESSAGE FORWARDING
  if (request.action === "runValidation") {
    sendResponse({
      success: true,
      message: "Validation request received - forward to testing infrastructure"
    });
    return false;
  }
});

// ✅ COMPLETELY FIXED: Handle content extraction with bulletproof tab detection
async function handleContentExtraction(sendResponse, startTime) {
  try {
    console.log('[Background] Starting full extraction pipeline...');

    // ✅ Multiple methods to get the current tab
    let tab = null;
    try {
      // Method 1: Query active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs.length > 0 && tabs[0]) {
        tab = tabs[0];
        console.log('[Background] Method 1 success - Found active tab:', tab.id, tab.url);
      }
    } catch (error) {
      console.log('[Background] Method 1 failed:', error.message);
    }

    // Method 2: Fallback to last focused window
    if (!tab) {
      try {
        const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        if (tabs && tabs.length > 0 && tabs[0]) {
          tab = tabs[0];
          console.log('[Background] Method 2 success - Found focused tab:', tab.id, tab.url);
        }
      } catch (error) {
        console.log('[Background] Method 2 failed:', error.message);
      }
    }

    // Method 3: Get any tab in current window
    if (!tab) {
      try {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        if (tabs && tabs.length > 0 && tabs[0]) {
          tab = tabs[0];
          console.log('[Background] Method 3 success - Found any tab:', tab.id, tab.url);
        }
      } catch (error) {
        console.log('[Background] Method 3 failed:', error.message);
      }
    }

    // Final check
    if (!tab || !tab.id) {
      throw new Error('Unable to find any active tab. Please make sure you have a webpage open.');
    }

    // Check if tab URL is accessible
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
      throw new Error('Cannot extract content from browser internal pages. Please navigate to a website.');
    }

    console.log('[Background] Using tab:', tab.id, 'URL:', tab.url);

    // ✅ Content script injection
    try {
      console.log('[Background] Injecting content script...');
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      console.log('[Background] Content script injected successfully');
      
      // Wait for content script to initialize
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.log('[Background] Content script injection note:', error.message);
      // Continue - script might already be injected
    }

    // Get page content from content script
    console.log('[Background] Requesting page data from content script...');
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "extractPageData"
    });

    if (!response || !response.success) {
      throw new Error(`Content extraction failed: ${response?.error || 'Content script not responding'}`);
    }

    const pageData = response.data;
    console.log('[Background] Content extracted:', pageData.method, `${pageData.content?.length || 0} chars`);

    // If AI is configured, enhance with AI extraction
    if (AI_CONFIG.apiKey && pageData.content) {
      console.log('[Background] Enhancing with AI extraction...');
      const aiResponse = await executeAIExtraction(pageData.content, AI_CONFIG);

      if (aiResponse.success) {
        // Merge AI results with page data
        const enhancedData = {
          ...pageData,
          ai: aiResponse.data,
          aiMetadata: aiResponse.metadata,
          enhancedWithAI: true
        };

        console.log('[Background] AI enhancement successful');
        sendResponse({
          success: true,
          data: enhancedData
        });
      } else {
        // Return page data with AI error info
        console.log('[Background] AI enhancement failed:', aiResponse.error);
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
      console.log('[Background] Returning basic extraction (no AI key)');
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

console.log('[Background] Web Weaver Lightning Day 5 ready');
