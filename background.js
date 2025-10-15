/**
 * Web Weaver Lightning - Background Service Worker
 * Version: 3.1.0 (UNIVERSAL MULTI-ITEM EXTRACTION)
 * 
 * ✅ ALL V3.0 FIXES PRESERVED + 🆕 MULTI-ITEM EXTRACTION
 * - FIX #1: Confidence calculation (AI average for multi-item)
 * - FIX #2: Medium single-article detection (content.js)
 * - FIX #3: SmartAuto crash fix (smartAuto.js)
 * - FIX #4: Nested confidence JSON flattening (3-layer defense)
 * - 🆕 FIX #5: Universal Multi-Item Extraction (ANY SITE!)
 * - 🆕 #5: Universal AI confidence prompt (v10) - NO HARDCODED SCHEMAS
 * - #4: Visual confidence feedback system (color-coded badges)
 * - #2: Historical learning with domain reliability tracking
 */

// ========================================
// LOAD V3.1 MODULES
// ========================================

try {
  if (typeof importScripts === 'function') {
    importScripts('src/config.js');
    importScripts('src/cache.js');
    importScripts('src/smartAuto.js');
    importScripts('src/analytics.js');
    console.log('[Background] ✅ All v3.1 modules loaded');
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
  console.log('[Background] 🚀 Initializing Web Weaver Lightning v3.1...');
  
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
    
    console.log('[Background] 🎉 All v3.1 systems initialized!');
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
// MESSAGE HANDLER (V3.1 ENHANCED)
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
// V3.1 ENHANCED EXTRACTION HANDLER
// ========================================

async function handleExtractionV3(requestedMode = 'auto', tabId = null, url = null) {
  console.log('[Background] 🚀 Starting v3.1 extraction | Mode:', requestedMode);
  
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
    
    // Step 2: Get page content (🆕 NOW WITH extractedItems!)
    const response = await chrome.tabs.sendMessage(tabId, { action: 'getPageData' });
    
    if (!response || !response.success || !response.data) {
      throw new Error('Failed to extract page content. Please refresh the page and try again.');
    }
    
    const pageData = response.data;
    console.log('[Background] Page data received | URL:', pageData.url);
    
    // 🆕 FIX #5: Check if multi-item with extracted items
    if (pageData.extractedItems && pageData.extractedItems.length >= 2) {
      console.log(`[Background] 🆕 FIX #5: Detected ${pageData.extractedItems.length} individual items from content.js`);
    }
    
    // Step 3: DOM Analysis
    const domAnalysis = analyzeDOMStructure(pageData);
    console.log('[Background] DOM Analysis | Type:', domAnalysis.classification, '| Confidence:', domAnalysis.confidence + '%');
    
    // #2: Check historical domain performance
    let domainAdjustment = 0;
    if (smartCache) {
      const domainStats = await smartCache.getDomainStats(url);
      if (domainStats && domainStats.avgConfidence) {
        console.log('[Background] #2: Domain history | Avg confidence:', domainStats.avgConfidence + '%');
        if (domainStats.avgConfidence > 85 && domainStats.extractionCount > 5) {
          domainAdjustment = +5;
          console.log('[Background] #2: High-reliability domain → +5% confidence boost');
        } else if (domainStats.avgConfidence < 60 && domainStats.extractionCount > 3) {
          domainAdjustment = -5;
          console.log('[Background] #2: Low-reliability domain → -5% confidence penalty');
        }
      }
    }
    
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
    
    // #2: Apply domain-based adjustment
    if (domainAdjustment !== 0) {
      const before = finalConfidence;
      finalConfidence = Math.max(0, Math.min(100, finalConfidence + domainAdjustment));
      console.log('[Background] #2: Domain adjustment applied:', before, '→', finalConfidence);
    }
    
    // #4: Calculate visual confidence tier
    const confidenceTier = getConfidenceTier(finalConfidence);
    console.log('[Background] #4: Confidence tier:', confidenceTier.label, confidenceTier.icon);
    
    // #2: Update cache with confidence tracking
    if (smartCache && chosenMode !== 'offline') {
      await smartCache.updateLearning(url, {
        success: true,
        confidence: finalConfidence,
        mode: chosenMode,
        apiCalls: extractionResult.apiCalls || 0,
        duration: Date.now() - startTime
      });
      console.log('[Background] #2: Domain learning updated');
    }
    
    // Step 7: Track analytics
    if (analytics) {
      await analytics.trackExtraction({
        mode: chosenMode,
        success: true,
        confidence: finalConfidence,
        apiCalls: extractionResult.apiCalls || 0,
        duration: Date.now() - startTime,
        cached: extractionResult.cached || false
      });
    }
    
    // Step 8: Add to history
    const historyEntry = {
      timestamp: Date.now(),
      mode: chosenMode,
      confidence: finalConfidence,
      confidenceTier: confidenceTier.label,
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
        confidence: finalConfidence,
        confidenceTier,
        apiCalls: extractionResult.apiCalls || 0,
        duration: Date.now() - startTime,
        cached: extractionResult.cached || false,
        classification: domAnalysis.classification,
        domainAdjustment,
        autoDecision: autoDecision ? {
          reasoning: autoDecision.reasoning,
          confidence: (autoDecision.confidence * 100).toFixed(0) + '%'
        } : null
      }
    };
    
    console.log('[Background] ✅ Extraction complete | Final Confidence:', finalConfidence + '%', confidenceTier.icon);
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
// #4: CONFIDENCE TIER CALCULATOR
// ========================================

function getConfidenceTier(score) {
  if (score >= 90) {
    return {
      level: 'high',
      label: 'High',
      icon: '🔵',
      color: '#0066FF',
      description: 'Excellent extraction quality'
    };
  }
  if (score >= 80) {
    return {
      level: 'good',
      label: 'Good',
      icon: '🟢',
      color: '#00CC66',
      description: 'Strong extraction quality'
    };
  }
  if (score >= 65) {
    return {
      level: 'medium',
      label: 'Medium',
      icon: '🟡',
      color: '#FFAA00',
      description: 'Acceptable extraction quality'
    };
  }
  return {
    level: 'low',
    label: 'Low',
    icon: '🔴',
    color: '#FF3333',
    description: 'Poor extraction quality - verify data'
  };
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
// 🆕 FIX #5: MIN MODE WITH MULTI-ITEM SUPPORT
// ========================================

async function runMinMode(pageData, domAnalysis, url) {
  console.log('[Background] 🌿 Running MIN MODE pipeline...');
  const startTime = Date.now();
  let apiCalls = 0;
  let cached = false;
  
  if (!apiKey) {
    throw new Error('API key required for Min mode. Please add your Gemini API key in settings.');
  }
  
  const classification = domAnalysis.classification;
  
  // 🆕 FIX #5: Handle MULTI_ITEM extraction
  if (classification === 'MULTI_ITEM' && pageData.extractedItems && pageData.extractedItems.length >= 2) {
    console.log(`[Background] 🆕 FIX #5: MULTI_ITEM detected with ${pageData.extractedItems.length} items - extracting each individually`);
    
    const allResults = [];
    const maxItems = Math.min(pageData.extractedItems.length, 10); // Limit to 10
    
    // Generate universal prompt once
    const customPrompt = await generateUniversalPromptV10('SINGLE_ITEM', domAnalysis);
    apiCalls++;
    
    // Extract each item
    for (let i = 0; i < maxItems; i++) {
      const item = pageData.extractedItems[i];
      console.log(`[Background] Extracting item ${i + 1}/${maxItems}...`);
      
      try {
        const extractionResult = await extractWithAI(item.text, customPrompt, 'SINGLE_ITEM');
        apiCalls++;
        
        allResults.push({
          ...extractionResult,
          itemIndex: item.index,
          selector: item.selector
        });
      } catch (error) {
        console.warn(`[Background] Failed to extract item ${i + 1}:`, error.message);
        continue;
      }
    }
    
    console.log(`[Background] ✅ Successfully extracted ${allResults.length} items`);
    
    return {
      data: allResults,
      confidence: allResults.length > 0 
        ? Math.round(allResults.reduce((sum, r) => sum + (r.confidence_score || 75), 0) / allResults.length)
        : 50,
      apiCalls,
      cached: false,
      duration: Date.now() - startTime
    };
  }
  
  // SINGLE_ITEM logic (existing code)
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
  
  const customPrompt = await generateUniversalPromptV10(classification, domAnalysis);
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
// 🆕 FIX #5: BALANCED MODE WITH MULTI-ITEM SUPPORT
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
  
  // 🆕 FIX #5: Handle MULTI_ITEM extraction
  if (classification === 'MULTI_ITEM' && pageData.extractedItems && pageData.extractedItems.length >= 2) {
    console.log(`[Background] 🆕 FIX #5: MULTI_ITEM with ${pageData.extractedItems.length} items`);
    
    const allResults = [];
    const maxItems = Math.min(pageData.extractedItems.length, 10);
    
    const customPrompt = await generateUniversalPromptV10('SINGLE_ITEM', domAnalysis);
    apiCalls++;
    
    for (let i = 0; i < maxItems; i++) {
      const item = pageData.extractedItems[i];
      try {
        const extractionResult = await extractWithAI(item.text, customPrompt, 'SINGLE_ITEM');
        apiCalls++;
        allResults.push({ ...extractionResult, itemIndex: item.index });
      } catch (error) {
        console.warn(`[Background] Item ${i + 1} extraction failed:`, error.message);
        continue;
      }
    }
    
    return {
      data: allResults,
      confidence: allResults.length > 0 
        ? Math.round(allResults.reduce((sum, r) => sum + (r.confidence_score || 85), 0) / allResults.length)
        : 50,
      apiCalls,
      cached,
      duration: Date.now() - startTime
    };
  }
  
  // SINGLE_ITEM logic
  const customPrompt = await generateUniversalPromptV10(classification, domAnalysis);
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
// 🆕 FIX #5: MAX MODE WITH MULTI-ITEM SUPPORT
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
  
  // 🆕 FIX #5: Handle MULTI_ITEM extraction
  if (classification === 'MULTI_ITEM' && pageData.extractedItems && pageData.extractedItems.length >= 2) {
    console.log(`[Background] 🆕 FIX #5: MAX MODE MULTI_ITEM with ${pageData.extractedItems.length} items`);
    
    const allResults = [];
    const maxItems = Math.min(pageData.extractedItems.length, 10);
    
    console.log('[Background] Step 2: Generate Universal Prompt v10');
    const customPrompt = await generateUniversalPromptV10('SINGLE_ITEM', domAnalysis);
    apiCalls++;
    
    console.log('[Background] Step 3: Extract each item with verification');
    for (let i = 0; i < maxItems; i++) {
      const item = pageData.extractedItems[i];
      
      try {
        // Primary extraction
        const extraction1 = await extractWithAI(item.text, customPrompt, 'SINGLE_ITEM');
        apiCalls++;
        
        // Verification extraction
        const extraction2 = await extractWithAI(item.text, customPrompt, 'SINGLE_ITEM');
        apiCalls++;
        
        // Use best result
        const confidence1 = extraction1.confidence_score || 0;
        const confidence2 = extraction2.confidence_score || 0;
        const bestExtraction = confidence1 >= confidence2 ? extraction1 : extraction2;
        
        allResults.push({
          ...bestExtraction,
          itemIndex: item.index,
          verificationScore: Math.round((confidence1 + confidence2) / 2)
        });
      } catch (error) {
        console.warn(`[Background] Item ${i + 1} extraction failed:`, error.message);
        continue;
      }
    }
    
    return {
      data: allResults,
      confidence: allResults.length > 0 
        ? Math.round(allResults.reduce((sum, r) => sum + (r.confidence_score || 95), 0) / allResults.length)
        : 50,
      apiCalls,
      cached: false,
      duration: Date.now() - startTime
    };
  }
  
  // SINGLE_ITEM logic (existing code)
  console.log('[Background] Step 2: Generate Universal Prompt v10');
  const customPrompt = await generateUniversalPromptV10(classification, domAnalysis);
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
// #5: UNIVERSAL PROMPT GENERATOR V10
// ========================================

async function generateUniversalPromptV10(classification, domAnalysis) {
  console.log('[Background] #5: Generating universal prompt v10...');
  
  const websiteType = domAnalysis.type || 'unknown';
  const isMultiItem = classification === 'MULTI_ITEM';
  
  // #5: Universal prompt template (NO SITE-SPECIFIC LOGIC)
  const universalPrompt = `You are a universal web data extraction AI. Extract structured data from the HTML content provided.

=== PAGE TYPE ===
Content classification: ${classification}
Website category: ${websiteType}
Extraction mode: ${isMultiItem ? 'MULTIPLE items' : 'SINGLE item'}

=== EXTRACTION INSTRUCTIONS ===

1. ANALYZE the content and identify ALL relevant data fields
2. EXTRACT using the most reliable method available per field
3. ASSESS your confidence per field based on extraction method
4. PROVIDE detailed reasoning for your overall confidence score

=== CONFIDENCE SCORING (0-100) ===

Calculate confidence based on 4 factors:

**EXTRACTION METHOD (40 points max):**
- Rate each field 0-10 based on method:
  * Structured data (JSON-LD, Schema.org, microdata): 10pts
  * Semantic HTML (<article>, <time>, <price>, <h1>): 8pts
  * CSS selectors with clear naming (class="product-title"): 6pts
  * Text pattern matching (regex, parsing): 4pts
  * Contextual inference (guessing from nearby text): 2pts
  * Assumed/placeholder: 0pts
- Average across all extracted fields = 40% weight

**DATA COMPLETENESS (30 points max):**
- % of relevant fields found and extracted cleanly
- Values complete (not truncated with "..." or "Loading...")
- Missing optional fields: minor penalty
- Missing critical fields: major penalty
- Weight: 30% of total score

**DATA QUALITY (20 points max):**
- Values realistic? (price > 0, valid dates, working URLs)
- Text coherent? (not garbled, not error messages)
- Formats valid? (URLs, numbers, dates match expected patterns)
- No contradictions between fields?
- Weight: 20% of total score

**CONTEXTUAL APPROPRIATENESS (10 points max):**
- Data makes sense for this page type?
- Field relationships logical? (sale_price < original_price)
- Supporting evidence exists in DOM structure?
- Weight: 10% of total score

=== OUTPUT FORMAT ===

Return ONLY valid JSON ${isMultiItem ? 'array of objects' : 'object'}. Each item MUST include:

{
  "field_name": "extracted value or null",
  "another_field": "value",
  "confidence_score": 85,
  "confidence_reasoning": "<100 words max explaining: which fields are most/least confident, extraction methods used, any issues encountered, why this score>"
}

${isMultiItem ? 'Extract TOP 10 items maximum.' : ''}

=== REASONING REQUIREMENTS ===

Your reasoning MUST:
- Be concise (<100 words)
- Mention specific fields and their confidence levels
- State extraction methods used per field
- Explain any uncertainties or missing data
- Justify the final score honestly

BANNED phrases (too generic):
- "good extraction"
- "high quality"
- "successful extraction"
- "data extracted successfully"

REQUIRED specifics:
- "Title from semantic <h1> (9/10)"
- "Price missing from DOM (0/10)"
- "Category inferred from breadcrumb (6/10)"

=== CRITICAL FORMAT RULES ===

- DO NOT nest objects with "value", "confidence_score" properties per field
- DO NOT add confidence scores to individual fields
- Each field should be a SIMPLE value (string, number, null, array)
- ONLY add confidence_score and confidence_reasoning at the ROOT level
- VARY confidence scores per item - NEVER return same score for all items
- BE HONEST about low confidence extractions

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
  "confidence_score": 92,
  "confidence_reasoning": "Title from <h1> (10/10). Author from meta tag (9/10). All critical fields present."
}

=== IMPORTANT RULES ===

1. NO explanatory text outside JSON
2. NO markdown code blocks
3. ONLY return the JSON ${isMultiItem ? 'array' : 'object'}
4. NULL for missing fields (not "N/A" or "")
5. VARY confidence scores per item quality
6. NEVER return same score for all items
7. BE HONEST about low confidence extractions

Now extract data from the provided HTML content:`;
  
  console.log('[Background] #5: Universal prompt v10 generated (NO schemas!)');
  return universalPrompt;
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
    parsed = flattenNestedConfidence(parsed);
    return parsed;
  } catch (directError) {
    try {
      const cleaned = jsonCandidate.replace(/,(\s*[}\]])/g, '$1');
      let parsed = JSON.parse(cleaned);
      parsed = flattenNestedConfidence(parsed);
      return parsed;
    } catch (cleanError) {
      throw new Error(`Malformed JSON: ${jsonCandidate.substring(0, 200)}...`);
    }
  }
}

function flattenNestedConfidence(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => flattenNestedConfidence(item));
  }
  
  const flattened = {};
  let globalConfidence = null;
  let globalReasoning = null;
  
  for (const [key, value] of Object.entries(obj)) {
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
  
  if (globalConfidence && !flattened.confidence_score) {
    flattened.confidence_score = globalConfidence;
  }
  if (globalReasoning && !flattened.confidence_reasoning) {
    flattened.confidence_reasoning = globalReasoning;
  }
  
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

console.log('[Background] 🚀 Web Weaver Lightning v3.1 loaded');
console.log('[Background] Using model:', CONFIG?.GEMINI_MODEL || 'CONFIG not loaded');
console.log('[Background] Available modes:', Object.keys(CONFIG?.MODES || {}));
console.log('[Background] Quota tracking: DISABLED (429 handling only)');
console.log('[Background] ✅ ALL V3.0 FIXES PRESERVED + 🆕 MULTI-ITEM EXTRACTION:');
console.log('[Background]   - FIX #1: Confidence calculation (AI average for multi-item)');
console.log('[Background]   - FIX #2: Medium single-article detection (content.js)');
console.log('[Background]   - FIX #3: SmartAuto crash fix (smartAuto.js)');
console.log('[Background]   - FIX #4: Nested confidence JSON flattening (3-layer defense)');
console.log('[Background]   - 🆕 FIX #5: Universal Multi-Item Extraction (ANY SITE!)');
console.log('[Background]   - #5: Universal AI confidence prompt (v10) - NO SCHEMAS');
console.log('[Background]   - #4: Visual confidence feedback (color-coded tiers)');
console.log('[Background]   - #2: Historical learning with domain confidence tracking');
