/**
 * Web Weaver Lightning - Background Service Worker
 * Version: 3.0.0 (Day 12 - ALL FIXES APPLIED)
 * 
 * ✅ FIX #1: Confidence calculation uses AI average for multi-item
 * ✅ FIX #2: Medium single-article detection (in content.js)
 * ✅ FIX #3: SmartAuto crash fix (in smartAuto.js)
 * ✅ FIX #4: Nested confidence JSON flattening (3-layer defense)
 * 
 * MAJOR CHANGES FROM V2.0:
 * - 5 extraction modes: offline, min, balanced, max, auto
 * - Removed daily quota tracking (429 handling only)
 * - Enhanced error handling (all errors in extension)
 * - AI-powered CSV export for complex data
 */

// ========================================
// LOAD V3.0 MODULES
// ========================================

try {
  if (typeof importScripts === 'function') {
    importScripts('src/config.js');
    importScripts('src/cache.js');
    importScripts('src/smartAuto.js');
    importScripts('src/analytics.js');
    console.log('[Background] ✅ All v3.0 modules loaded');
  } else {
    console.warn('[Background] importScripts not available');
  }
} catch (error) {
  console.error('[Background] Module loading error:', error);
}

// Verify CONFIG loaded
if (typeof CONFIG === 'undefined') {
  console.error('[Background] ❌ CONFIG not found!');
}

// Initialize systems
let smartCache, smartAutoMode, analytics;
let apiKey = '';
let isExtracting = false;
let extractionHistory = [];

// Initialize on startup
(async function initializeV3Systems() {
  console.log('[Background] 🚀 Initializing Web Weaver Lightning v3.0...');
  
  try {
    if (self.WEB_WEAVER_CACHE) {
      smartCache = self.WEB_WEAVER_CACHE;
      await smartCache.initialize();
      console.log('[Background] ✅ Smart Cache initialized');
    }
    
    if (self.WEB_WEAVER_SMART_AUTO && smartCache) {
      smartAutoMode = new self.WEB_WEAVER_SMART_AUTO(smartCache, null);
      console.log('[Background] ✅ Smart Auto Mode initialized');
    }
    
    if (self.WEB_WEAVER_ANALYTICS) {
      analytics = self.WEB_WEAVER_ANALYTICS;
      await analytics.initialize();
      console.log('[Background] ✅ Analytics initialized');
    }
    
    const historyData = await chrome.storage.local.get(['extractionHistory']);
    if (historyData.extractionHistory) {
      extractionHistory = historyData.extractionHistory.slice(-50);
    }
    
    console.log('[Background] 🎉 All v3.0 systems initialized!');
  } catch (error) {
    console.error('[Background] Initialization error:', error);
  }
})();

// Load API key on startup
chrome.storage.local.get(['geminiApiKey'], (result) => {
  if (result.geminiApiKey) {
    apiKey = result.geminiApiKey;
    console.log('[Background] API key loaded');
  }
});

// ========================================
// MESSAGE HANDLER (V3.0 ENHANCED)
// ========================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Background] Received message:', request.action);
  
  (async () => {
    try {
      switch (request.action) {
        case 'saveApiKey':
          apiKey = request.apiKey;
          await chrome.storage.local.set({ geminiApiKey: request.apiKey });
          sendResponse({ success: true });
          break;
        
        case 'getApiKey':
          sendResponse({ apiKey });
          break;
        
        case 'extractData':
          if (isExtracting) {
            sendResponse({ success: false, error: 'Extraction already in progress. Please wait.' });
            return;
          }
          isExtracting = true;
          const result = await handleExtractionV3(request.mode, sender.tab?.id);
          isExtracting = false;
          sendResponse(result);
          break;
        
        case 'getExtractionHistory':
          sendResponse({ success: true, history: extractionHistory.slice(-20).reverse() });
          break;
        
        case 'getAnalytics':
          if (analytics) {
            const dashboardData = analytics.getDashboardData();
            sendResponse({ success: true, data: dashboardData });
          } else {
            sendResponse({ success: false, error: 'Analytics not initialized' });
          }
          break;
        
        case 'clearCache':
          if (smartCache) {
            await smartCache.clear();
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false, error: 'Cache not initialized' });
          }
          break;
        
        case 'convertToCSV':
          const csvResult = await convertComplexJSONToCSV(request.data, request.apiKey || apiKey);
          sendResponse(csvResult);
          break;
        
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('[Background] Message handler error:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  
  return true;
});

// ========================================
// V3.0 ENHANCED EXTRACTION HANDLER
// ========================================

async function handleExtractionV3(requestedMode = 'auto', tabId = null, url = null) {
  console.log('[Background] 🚀 Starting v3.0 extraction | Mode:', requestedMode);
  
  const startTime = Date.now();
  let chosenMode = requestedMode;
  let autoDecision = null;
  
  try {
    // Step 1: Get current tab
    if (!tabId) {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) {
        throw new Error('No active tab found. Please refresh the page and try again.');
      }
      tabId = tabs[0].id;
      url = url || tabs[0].url;
    }
    
    // Step 2: Get page content
    const response = await chrome.tabs.sendMessage(tabId, { action: 'getPageData' });
    
    if (!response || !response.success || !response.data) {
      throw new Error('Failed to extract page content. Please refresh the page and try again.');
    }
    
    const pageData = response.data;
    console.log('[Background] Page data received | URL:', pageData.url);
    
    // Step 3: DOM Analysis
    const domAnalysis = analyzeDOMStructure(pageData);
    console.log('[Background] DOM Analysis | Type:', domAnalysis.classification, '| Confidence:', domAnalysis.confidence + '%');
    
    // Step 4: Smart Auto Mode Decision
    if (requestedMode === 'auto' && smartAutoMode) {
      autoDecision = await smartAutoMode.decideMode(url, domAnalysis);
      chosenMode = autoDecision.mode;
      console.log('[Background] 🤖 Smart Auto chose:', chosenMode);
      console.log('[Background] Reasoning:', autoDecision.reasoning);
      if (analytics) {
        await analytics.trackModeSwitch('auto', chosenMode, autoDecision.reasoning);
      }
    }
    
    // Step 5: Route to appropriate pipeline
    let extractionResult;
    switch (chosenMode) {
      case 'offline':
        extractionResult = await runOfflineMode(pageData, domAnalysis, url);
        break;
      case 'min':
        extractionResult = await runMinMode(pageData, domAnalysis, url);
        break;
      case 'balanced':
        extractionResult = await runBalancedMode(pageData, domAnalysis, url);
        break;
      case 'max':
        extractionResult = await runMaxMode(pageData, domAnalysis, url);
        break;
      default:
        extractionResult = await runBalancedMode(pageData, domAnalysis, url);
    }
    
    // Step 6: Update cache learning
    if (smartCache && chosenMode !== 'offline') {
      await smartCache.updateLearning(url, {
        success: true,
        confidence: extractionResult.confidence,
        mode: chosenMode,
        apiCalls: extractionResult.apiCalls || 0,
        duration: Date.now() - startTime
      });
    }
    
    // Step 7: Track analytics
    if (analytics) {
      await analytics.trackExtraction({
        mode: chosenMode,
        success: true,
        confidence: extractionResult.confidence,
        apiCalls: extractionResult.apiCalls || 0,
        duration: Date.now() - startTime,
        cached: extractionResult.cached || false
      });
    }
    
    // ========================================
    // 🔧 FIX #1: CALCULATE FINAL CONFIDENCE
    // ========================================
    
    let finalConfidence = extractionResult.confidence;
    
    // For AI modes with array results, use AVERAGE of AI confidences
    if (chosenMode !== 'offline' && Array.isArray(extractionResult.data) && extractionResult.data.length > 0) {
      const confidences = extractionResult.data
        .map(item => item.confidence_score || 0)
        .filter(score => score > 0);
      
      if (confidences.length > 0) {
        finalConfidence = Math.round(
          confidences.reduce((sum, score) => sum + score, 0) / confidences.length
        );
        console.log('[Background] ✅ FIX #1: Calculated average confidence from', confidences.length, 'items:', finalConfidence + '%');
      }
    } else if (extractionResult.data && extractionResult.data.confidence_score) {
      finalConfidence = extractionResult.data.confidence_score;
      console.log('[Background] ✅ FIX #1: Using single item confidence:', finalConfidence + '%');
    }
    
    // Step 8: Add to history
    const historyEntry = {
      timestamp: Date.now(),
      mode: chosenMode,
      confidence: finalConfidence,  // ✅ NOW CORRECT!
      success: true,
      url: url,
      itemCount: Array.isArray(extractionResult.data) ? extractionResult.data.length : 1
    };
    
    extractionHistory.push(historyEntry);
    if (extractionHistory.length > 50) {
      extractionHistory = extractionHistory.slice(-50);
    }
    await chrome.storage.local.set({ extractionHistory });
    
    // Step 9: Return response
    const responseObj = {
      success: true,
      data: extractionResult.data,
      metadata: {
        mode: chosenMode,
        requestedMode,
        confidence: finalConfidence,  // ✅ FIX #1 APPLIED!
        apiCalls: extractionResult.apiCalls || 0,
        duration: Date.now() - startTime,
        cached: extractionResult.cached || false,
        classification: domAnalysis.classification,
        autoDecision: autoDecision ? {
          reasoning: autoDecision.reasoning,
          confidence: (autoDecision.confidence * 100).toFixed(0) + '%'
        } : null
      }
    };
    
    console.log('[Background] ✅ Extraction complete | Final Confidence:', finalConfidence + '%');
    return responseObj;
    
  } catch (error) {
    console.error('[Background] ❌ Extraction failed:', error);
    
    if (error.message && error.message.includes('429')) {
      return {
        success: false,
        error: 'API Quota Exhausted',
        errorDetails: CONFIG.RATE_LIMIT.userFriendlyMessage,
        metadata: { mode: chosenMode, duration: Date.now() - startTime }
      };
    }
    
    if (analytics) {
      await analytics.trackError(error.message, { mode: chosenMode });
    }
    
    return {
      success: false,
      error: error.message,
      metadata: { mode: chosenMode, duration: Date.now() - startTime }
    };
  }
}

// ========================================
// OFFLINE MODE PIPELINE
// ========================================

async function runOfflineMode(pageData, domAnalysis, url) {
  console.log('[Background] 🟢 Running OFFLINE MODE (DOM only)...');
  const startTime = Date.now();
  const domData = extractDOMData(pageData, domAnalysis);
  return {
    data: domData,
    confidence: domAnalysis.confidence,
    apiCalls: 0,
    cached: false,
    duration: Date.now() - startTime
  };
}

// ========================================
// MIN MODE PIPELINE
// ========================================

async function runMinMode(pageData, domAnalysis, url) {
  console.log('[Background] 🌿 Running MIN MODE pipeline...');
  const startTime = Date.now();
  let apiCalls = 0;
  let cached = false;
  
  if (!apiKey) {
    throw new Error('API key required for Min mode. Please add your Gemini API key in settings.');
  }
  
  if (smartCache) {
    const cacheEntry = await smartCache.get(url);
    const shouldUseCache = await smartCache.shouldUseCache(url, 'min');
    
    if (cacheEntry && shouldUseCache && cacheEntry.promptTemplate) {
      console.log('[Background] Using cached prompt (saves 1 API call)');
      const extractionResult = await extractWithAI(pageData.mainText, cacheEntry.promptTemplate, cacheEntry.classification);
      return {
        data: extractionResult,
        confidence: extractionResult.confidence_score || 75,
        apiCalls: 1,
        cached: true,
        duration: Date.now() - startTime
      };
    }
  }
  
  const classification = domAnalysis.classification;
  const customPrompt = await generateCustomPrompt(classification, domAnalysis);
  apiCalls++;
  
  const extractionResult = await extractWithAI(pageData.mainText, customPrompt, classification);
  apiCalls++;
  
  if (smartCache) {
    await smartCache.set(url, {
      websiteType: domAnalysis.type,
      classification,
      promptTemplate: customPrompt
    });
  }
  
  return {
    data: extractionResult,
    confidence: extractionResult.confidence_score || 75,
    apiCalls,
    cached,
    duration: Date.now() - startTime
  };
}

// ========================================
// BALANCED MODE PIPELINE
// ========================================

async function runBalancedMode(pageData, domAnalysis, url) {
  console.log('[Background] ⚖️ Running BALANCED MODE pipeline...');
  const startTime = Date.now();
  let apiCalls = 0;
  let cached = false;
  
  if (!apiKey) {
    throw new Error('API key required for Balanced mode. Please add your Gemini API key in settings.');
  }
  
  let classification = domAnalysis.classification;
  let shouldVerifyWithAI = domAnalysis.confidence < 80 || classification === 'UNCERTAIN';
  
  if (smartCache) {
    const cacheEntry = await smartCache.get(url);
    if (cacheEntry && cacheEntry.learningMetrics && cacheEntry.learningMetrics.reliabilityScore > 0.95) {
      classification = cacheEntry.classification;
      shouldVerifyWithAI = false;
      cached = true;
      console.log('[Background] High cache reliability - skipping AI verification');
    }
  }
  
  if (shouldVerifyWithAI) {
    console.log('[Background] DOM uncertain - verifying with AI...');
    const aiClassification = await classifyWithAI(pageData.mainText);
    classification = aiClassification.type || classification;
    apiCalls++;
  }
  
  const customPrompt = await generateCustomPrompt(classification, domAnalysis);
  apiCalls++;
  
  const extractionResult = await extractWithAI(pageData.mainText, customPrompt, classification);
  apiCalls++;
  
  if (smartCache) {
    await smartCache.set(url, {
      websiteType: domAnalysis.type,
      classification,
      promptTemplate: customPrompt
    });
  }
  
  return {
    data: extractionResult,
    confidence: extractionResult.confidence_score || 85,
    apiCalls,
    cached,
    duration: Date.now() - startTime
  };
}

// ========================================
// MAX MODE PIPELINE
// ========================================

async function runMaxMode(pageData, domAnalysis, url) {
  console.log('[Background] 🚀 Running MAX MODE pipeline (triple verification)...');
  const startTime = Date.now();
  let apiCalls = 0;
  
  if (!apiKey) {
    throw new Error('API key required for Max mode. Please add your Gemini API key in settings.');
  }
  
  console.log('[Background] Step 1: AI Type Detection');
  const aiClassification = await classifyWithAI(pageData.mainText, domAnalysis);
  const classification = aiClassification.type || domAnalysis.classification;
  apiCalls++;
  
  console.log('[Background] Step 2: Generate Custom Prompt');
  const customPrompt = await generateCustomPrompt(classification, domAnalysis);
  apiCalls++;
  
  console.log('[Background] Step 3: Primary Extraction');
  const extraction1 = await extractWithAI(pageData.mainText, customPrompt, classification);
  apiCalls++;
  
  console.log('[Background] Step 4: Secondary Extraction (verification)');
  const extraction2 = await extractWithAI(pageData.mainText, customPrompt, classification);
  apiCalls++;
  
  const confidence1 = extraction1.confidence_score || 0;
  const confidence2 = extraction2.confidence_score || 0;
  const bestExtraction = confidence1 >= confidence2 ? extraction1 : extraction2;
  const avgConfidence = Math.round((confidence1 + confidence2) / 2);
  
  console.log('[Background] Extraction 1 confidence:', confidence1);
  console.log('[Background] Extraction 2 confidence:', confidence2);
  
  return {
    data: bestExtraction,
    confidence: Math.max(avgConfidence, bestExtraction.confidence_score || 95),
    apiCalls,
    cached: false,
    duration: Date.now() - startTime
  };
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function analyzeDOMStructure(pageData) {
  console.log('[Background] Analyzing DOM structure...');
  
  const signals = pageData.classificationSignals || {};
  const domDetails = pageData.domDetails || {};
  
  let classification = 'SINGLE_ITEM';
  let confidence = 50;
  let type = 'unknown';
  
  if (signals.isLoginPage || signals.isErrorPage) {
    return {
      classification: 'NONE',
      confidence: 100,
      type: 'none',
      indicators: { login: signals.isLoginPage, error: signals.isErrorPage }
    };
  }
  
  const repeatedBlockCount = domDetails.repeatedBlocksCount || 0;
  const productGridDetected = domDetails.productGridFound || false;
  const articleCount = signals.articleCount || 0;
  
  if (repeatedBlockCount > 5 || productGridDetected || articleCount > 3) {
    classification = 'MULTI_ITEM';
    confidence = 90 + Math.min(10, repeatedBlockCount);
    type = productGridDetected ? 'ecommerce-listing' : 'content-listing';
  } else if (signals.h1Count === 1 && signals.wordCount > 100) {
    classification = 'SINGLE_ITEM';
    confidence = 95;
    if (signals.priceIndicators) type = 'ecommerce-product';
    else if (signals.articleIndicators) type = 'article';
    else if (signals.recipeIndicators) type = 'recipe';
    else type = 'general-content';
  } else {
    classification = 'UNCERTAIN';
    confidence = 50;
    type = 'unknown';
  }
  
  return {
    classification,
    confidence,
    type,
    indicators: {
      repeatedBlocks: repeatedBlockCount,
      productGrid: productGridDetected,
      articles: articleCount,
      h1Count: signals.h1Count,
      wordCount: signals.wordCount
    }
  };
}

function extractDOMData(pageData, domAnalysis) {
  return {
    title: pageData.title || null,
    url: pageData.url || null,
    description: pageData.metaDescription || null,
    text_preview: pageData.mainText ? pageData.mainText.substring(0, 500) : null,
    classification: domAnalysis.classification,
    confidence_score: domAnalysis.confidence,
    confidence_reasoning: 'DOM extraction only - no AI verification',
    extracted_by: 'offline_mode'
  };
}

async function classifyWithAI(mainText, domAnalysis = null) {
  console.log('[Background] AI Classification...');
  
  try {
    if (!apiKey) {
      return { type: 'SINGLE_ITEM', confidence: 0.5 };
    }
    
    const promptTemplate = `You are a page classifier. Determine if this contains ONE entity or MULTIPLE entities.

${domAnalysis ? `DOM signals: ${JSON.stringify(domAnalysis.indicators)}

` : ''}Content (first 1500 chars):
${mainText.substring(0, 1500)}

Return ONLY JSON:
{
  "type": "SINGLE_ITEM" or "MULTI_ITEM",
  "confidence": 0.0-1.0
}`;
    
    const url = `${CONFIG.API_ENDPOINT}/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptTemplate }] }],
        generationConfig: { maxOutputTokens: 50, temperature: 0.1 }
      })
    });
    
    if (!response.ok) {
      if (response.status === 429) throw new Error('429: Rate limit exceeded');
      throw new Error(`AI Classification failed: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error('No AI classification response');
    
    const result = extractJsonObject(content);
    console.log('[Background] AI classified as:', result.type);
    return result;
    
  } catch (error) {
    console.error('[Background] AI Classification error:', error);
    return { type: 'SINGLE_ITEM', confidence: 0.5 };
  }
}

// ========================================
// 🔧 FIX #4A: ENHANCED PROMPT GENERATION
// ========================================

async function generateCustomPrompt(classification, domAnalysis) {
  console.log('[Background] Generating custom prompt...');
  
  try {
    if (!apiKey) throw new Error('No API key');
    
    const websiteType = domAnalysis.type || 'general-content';
    const isMultiItem = classification === 'MULTI_ITEM';
    
    // 🔧 FIX #4A: Enhanced meta-prompt with explicit anti-nesting instructions
    const metaPrompt = `Create extraction prompt for ${websiteType} ${isMultiItem ? 'listing (MULTIPLE items)' : 'page (ONE item)'}.

Requirements:
1. Extract ALL relevant fields
2. Return ${isMultiItem ? 'JSON array of objects' : 'JSON object'}
3. Include ONE global confidence_score (0-100) field at the root level
4. Include ONE global confidence_reasoning field at the root level
5. Use null for missing data
6. ${isMultiItem ? 'Extract TOP 10 items max' : 'Focus on completeness'}

CRITICAL FORMAT RULES:
- DO NOT nest objects with "value", "confidence_score" properties
- DO NOT add confidence scores to individual fields
- Each field should be a SIMPLE value (string, number, null, array)
- ONLY add confidence_score and confidence_reasoning at the ROOT level

WRONG FORMAT (nested - DO NOT USE):
{
  "title": {
    "value": "Example",
    "confidence_score": 95
  }
}

CORRECT FORMAT (flat - USE THIS):
{
  "title": "Example",
  "author": "John Doe",
  "confidence_score": 95,
  "confidence_reasoning": "All fields extracted successfully"
}

Return ONLY the prompt text, no JSON wrapper.`;
    
    const url = `${CONFIG.API_ENDPOINT}/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: metaPrompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
      })
    });
    
    if (!response.ok) {
      if (response.status === 429) throw new Error('429: Rate limit exceeded');
      throw new Error(`Prompt generation failed: ${response.status}`);
    }
    
    const data = await response.json();
    const customPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!customPrompt) throw new Error('Failed to generate prompt');
    
    console.log('[Background] ✅ FIX #4A: Custom prompt generated with anti-nesting rules');
    return customPrompt;
    
  } catch (error) {
    console.error('[Background] Prompt generation error:', error);
    throw error;
  }
}

async function extractWithAI(mainText, customPrompt, classification, retries = 0) {
  console.log('[Background] Extracting with AI... (Attempt', retries + 1, ')');
  
  try {
    if (!apiKey) throw new Error('No API key');
    
    const contentToExtract = mainText.substring(0, 5000);
    
    const fullPrompt = `${customPrompt}

Content:
${contentToExtract}

Return ONLY valid JSON with confidence_score and confidence_reasoning, no markdown.`;
    
    const url = `${CONFIG.API_ENDPOINT}/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
      })
    });
    
    if (!response.ok) {
      if (response.status === 429) throw new Error('429: Rate limit exceeded');
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error('No extraction result');
    
    const extracted = extractJsonObject(content);
    
    if (!extracted.confidence_score) {
      extracted.confidence_score = 50;
      extracted.confidence_reasoning = 'AI did not provide confidence score';
    }
    
    console.log('[Background] Extraction successful | Confidence:', extracted.confidence_score + '%');
    return extracted;
    
  } catch (error) {
    console.error('[Background] AI extraction error:', error);
    const maxRetries = 1;
    if (retries < maxRetries && !error.message.includes('429')) {
      console.log('[Background] Retrying...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return extractWithAI(mainText, customPrompt, classification, retries + 1);
    }
    throw error;
  }
}

// ========================================
// 🔧 FIX #4B: JSON EXTRACTION WITH FLATTENING
// ========================================

function extractJsonObject(text) {
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON detected in AI response');
  
  let jsonCandidate = match[0];
  
  try {
    let parsed = JSON.parse(jsonCandidate);
    // 🔧 FIX #4B: Flatten nested confidence structures
    parsed = flattenNestedConfidence(parsed);
    return parsed;
  } catch (directError) {
    try {
      const cleaned = jsonCandidate.replace(/,(\s*[}\]])/g, '$1');
      let parsed = JSON.parse(cleaned);
      // 🔧 FIX #4B: Flatten nested confidence structures
      parsed = flattenNestedConfidence(parsed);
      return parsed;
    } catch (cleanError) {
      throw new Error(`Malformed JSON: ${jsonCandidate.substring(0, 200)}...`);
    }
  }
}

/**
 * 🔧 FIX #4B: Flatten nested confidence structures
 * Detects and flattens patterns like:
 * { "title": { "value": "...", "confidence_score": 95 } }
 */
function flattenNestedConfidence(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Handle arrays (multi-item extractions)
  if (Array.isArray(obj)) {
    return obj.map(item => flattenNestedConfidence(item));
  }
  
  // Flatten object
  const flattened = {};
  let globalConfidence = null;
  let globalReasoning = null;
  
  for (const [key, value] of Object.entries(obj)) {
    // Check if this is a nested confidence structure
    if (value && typeof value === 'object' && !Array.isArray(value) && 
        'value' in value && key !== 'confidence_score' && key !== 'confidence_reasoning') {
      
      console.log('[Background] 🔧 FIX #4B: Flattening nested field:', key);
      flattened[key] = value.value;
      
      if (value.confidence_score && (!globalConfidence || value.confidence_score > globalConfidence)) {
        globalConfidence = value.confidence_score;
      }
      if (value.confidence_reasoning && !globalReasoning) {
        globalReasoning = value.confidence_reasoning;
      }
    } else {
      flattened[key] = value;
      if (key === 'confidence_score') globalConfidence = value;
      if (key === 'confidence_reasoning') globalReasoning = value;
    }
  }
  
  // Add global confidence if found
  if (globalConfidence && !flattened.confidence_score) {
    flattened.confidence_score = globalConfidence;
  }
  if (globalReasoning && !flattened.confidence_reasoning) {
    flattened.confidence_reasoning = globalReasoning;
  }
  
  // Default confidence if none found
  if (!flattened.confidence_score) {
    flattened.confidence_score = 75;
    flattened.confidence_reasoning = 'AI did not provide confidence score';
  }
  
  return flattened;
}

// ========================================
// AI-POWERED CSV CONVERTER
// ========================================

async function convertComplexJSONToCSV(jsonData, key) {
  console.log('[Background] Converting complex JSON to CSV with AI...');
  
  try {
    if (!key) throw new Error('API key required for AI CSV conversion');
    
    const prompt = `Convert this JSON data to CSV format. Flatten all nested objects and arrays intelligently.

Rules:
1. Each row should be a complete record
2. Nested objects: use dot notation (e.g., "address.city")
3. Arrays: join with semicolons (e.g., "tag1;tag2;tag3")
4. Return ONLY the CSV text, no explanation

JSON data:
${JSON.stringify(jsonData, null, 2)}

Return CSV with headers:`;
    
    const url = `${CONFIG.API_ENDPOINT}/${CONFIG.GEMINI_MODEL}:generateContent?key=${key}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
      })
    });
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API quota exhausted. Cannot convert to CSV at this time.');
      }
      throw new Error(`CSV conversion failed: ${response.status}`);
    }
    
    const data = await response.json();
    let csvText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!csvText) throw new Error('No CSV generated');
    
    csvText = csvText.replace(/``````\n?/g, '').trim();
    console.log('[Background] AI CSV conversion successful');
    return { success: true, csv: csvText };
    
  } catch (error) {
    console.error('[Background] CSV conversion error:', error);
    return { success: false, error: error.message };
  }
}

// ========================================
// SERVICE WORKER INITIALIZATION
// ========================================

console.log('[Background] 🚀 Web Weaver Lightning v3.0 loaded');
console.log('[Background] Using model:', CONFIG?.GEMINI_MODEL || 'CONFIG not loaded');
console.log('[Background] Available modes:', Object.keys(CONFIG?.MODES || {}));
console.log('[Background] Quota tracking: DISABLED (429 handling only)');
console.log('[Background] ✅ ALL FIXES APPLIED:');
console.log('[Background]   - FIX #1: Confidence calculation (AI average for multi-item)');
console.log('[Background]   - FIX #2: Medium single-article detection (content.js)');
console.log('[Background]   - FIX #3: SmartAuto crash fix (smartAuto.js)');
console.log('[Background]   - FIX #4: Nested confidence JSON flattening (3-layer defense)');
