/**
 * Web Weaver Lightning - Background Service Worker
 * Version: 2.0.0 (Day 11 Enhancement - FIXED V2)
 */

// ========================================
// LOAD V2.0 MODULES
// ========================================

try {
  // Chrome extension service workers need importScripts for modules
  if (typeof importScripts === 'function') {
    importScripts('src/config.js');
    importScripts('src/cache.js');
    importScripts('src/rateLimit.js');
    importScripts('src/smartAuto.js');
    importScripts('src/analytics.js');
    console.log('[Background] ✅ All v2.0 modules loaded via importScripts');
  } else {
    console.warn('[Background] importScripts not available, modules may not load');
  }
} catch (error) {
  console.error('[Background] Module loading error:', error);
  console.warn('[Background] Extension will run in legacy mode');
}

/**
 * Web Weaver Lightning - Background Service Worker
 * Version: 2.0.0 (Day 11 Enhancement)
 * Author: FAANG-Level Developer Agent
 * 
 * MAJOR CHANGES IN V2.0:
 * - Smart Auto Mode integration
 * - Self-learning cache system
 * - Rate limit protection with queue
 * - Analytics tracking
 * - Modular config-driven architecture
 * - Intelligent retry logic
 * 
 * PRESERVED FROM V1.0:
 * - All existing extraction logic
 * - Hybrid pipeline (now called "Balanced mode")
 * - DOM analysis engine
 * - JSON repair and validation
 * - Gemini API integration
 */

// ========================================
// CONFIG REFERENCE (NO REDECLARATION!)
// ========================================

// CONFIG is already loaded globally via importScripts('src/config.js')
// Just verify it's available
if (typeof CONFIG === 'undefined') {
  console.error('[Background] ❌ CONFIG not found! Module loading failed!');
}

// Initialize new systems
let smartCache, rateLimitManager, smartAutoMode, analytics;

// Initialize on startup
(async function initializeV2Systems() {
  console.log('[Background] Initializing Web Weaver Lightning v2.0...');
  
  try {
    // Initialize Smart Cache
    if (self.WEB_WEAVER_CACHE) {
      smartCache = self.WEB_WEAVER_CACHE;
      await smartCache.initialize();
      console.log('[Background] ✅ Smart Cache initialized');
    }
    
    // Initialize Rate Limit Manager
    if (self.WEB_WEAVER_RATE_LIMIT) {
      rateLimitManager = self.WEB_WEAVER_RATE_LIMIT;
      await rateLimitManager.initialize();
      console.log('[Background] ✅ Rate Limit Manager initialized');
    }
    
    // Initialize Smart Auto Mode
    if (self.WEB_WEAVER_SMART_AUTO && smartCache && rateLimitManager) {
      smartAutoMode = new self.WEB_WEAVER_SMART_AUTO(smartCache, rateLimitManager);
      console.log('[Background] ✅ Smart Auto Mode initialized');
    }
    
    // Initialize Analytics
    if (self.WEB_WEAVER_ANALYTICS) {
      analytics = self.WEB_WEAVER_ANALYTICS;
      await analytics.initialize();
      console.log('[Background] ✅ Analytics initialized');
    }
    
    console.log('[Background] 🚀 All v2.0 systems initialized successfully!');
    
  } catch (error) {
    console.error('[Background] Initialization error:', error);
    console.warn('[Background] Falling back to legacy mode...');
  }
})();

// State management (preserved from v1.0)
let apiKey = '';
let isExtracting = false;

// Load API key on startup
chrome.storage.local.get(['geminiApiKey'], (result) => {
  if (result.geminiApiKey) {
    apiKey = result.geminiApiKey;
    console.log('[Background] API key loaded');
  }
});

// ========================================
// MESSAGE HANDLER (ENHANCED)
// ========================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Background] Received message:', request.action);
  
  // Handle async responses
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
          // V2.0 ENHANCED EXTRACTION
          if (isExtracting) {
            sendResponse({ 
              success: false, 
              error: 'Extraction already in progress' 
            });
            return;
          }
          
          isExtracting = true;
          const result = await handleExtractionV2(request.mode, sender.tab?.id);
          isExtracting = false;
          sendResponse(result);
          break;
        
        case 'getQuotaStatus':
          // V2.0 QUOTA STATUS
          if (rateLimitManager) {
            const quotaStatus = rateLimitManager.getQuotaStatus();
            sendResponse({ success: true, data: quotaStatus });
          } else {
            sendResponse({ success: false, error: 'Rate limit manager not initialized' });
          }
          break;
        
        case 'getAnalytics':
          // V2.0 ANALYTICS DASHBOARD
          if (analytics) {
            const dashboardData = analytics.getDashboardData();
            sendResponse({ success: true, data: dashboardData });
          } else {
            sendResponse({ success: false, error: 'Analytics not initialized' });
          }
          break;
        
        case 'clearCache':
          // V2.0 CLEAR CACHE
          if (smartCache) {
            await smartCache.clear();
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false, error: 'Cache not initialized' });
          }
          break;
        
        case 'retryFromQueue':
          // V2.0 RETRY FROM RATE LIMIT QUEUE
          const retryResult = await handleExtractionV2(request.data.mode, request.data.tabId);
          sendResponse(retryResult);
          break;
        
        case 'extractFromQueue':
          // V2.0 EXTRACT FROM DEFERRED QUEUE
          const queueResult = await handleExtractionV2(request.data.mode, null, request.data.url);
          sendResponse(queueResult);
          break;
        
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('[Background] Message handler error:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  
  return true; // Keep channel open for async response
});

// ========================================
// V2.0 ENHANCED EXTRACTION HANDLER
// ========================================

async function handleExtractionV2(requestedMode = 'auto', tabId = null, url = null) {
  console.log('[Background] 🚀 Starting v2.0 extraction | Requested mode:', requestedMode);
  
  const startTime = Date.now();
  let chosenMode = requestedMode;
  let autoDecision = null;
  let upgraded = false;
  let downgraded = false;
  
  try {
    // Step 1: Check API key
    if (!apiKey) {
      throw new Error('API key not configured. Please add your Gemini API key in settings.');
    }
    
    // Step 2: Check rate limit / quota
    if (rateLimitManager) {
      const canProceed = rateLimitManager.canProceed();
      if (!canProceed) {
        const quotaStatus = rateLimitManager.getQuotaStatus();
        
        if (quotaStatus.status === 'critical') {
          // Offer to queue extraction
          return {
            success: false,
            error: 'Quota exhausted',
            quotaStatus,
            suggestQueue: true,
            message: `Daily quota limit reached (${quotaStatus.used}/${quotaStatus.total}). ` +
                    `Quota resets at ${new Date(quotaStatus.resetTime).toLocaleTimeString()}. ` +
                    `Would you like to queue this extraction?`
          };
        }
        
        throw new Error('Rate limit active. Please wait before retrying.');
      }
    }
    
    // Step 3: Get current tab (if not provided)
    if (!tabId) {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) {
        throw new Error('No active tab found');
      }
      tabId = tabs[0].id;
      url = url || tabs[0].url;
    }
    
    // Step 4: Get page content via content script
    const response = await chrome.tabs.sendMessage(tabId, { action: 'getPageData' });
    
    if (!response || !response.success || !response.data) {
      throw new Error('Failed to extract page content. Please refresh and try again.');
    }
    
    const pageData = response.data;
    
    console.log('[Background] Page data received | URL:', pageData.url);
    
    // Step 5: DOM Analysis (always run - used by Smart Auto)
    const domAnalysis = analyzeDOMStructure(pageData);
    console.log('[Background] DOM Analysis | Classification:', domAnalysis.classification, 
                '| Confidence:', domAnalysis.confidence + '%');
    
    // Step 6: Smart Auto Mode Decision (V2.0 FEATURE)
    if (requestedMode === 'auto' && smartAutoMode) {
      autoDecision = await smartAutoMode.decideMode(url, domAnalysis);
      chosenMode = autoDecision.mode;
      
      console.log('[Background] 🤖 Smart Auto Decision:', chosenMode);
      console.log('[Background] Reasoning:', autoDecision.reasoning);
      
      // Track mode decision in analytics
      if (analytics) {
        await analytics.trackModeSwitch('auto', chosenMode, autoDecision.reasoning);
      }
    }
    
    // Step 7: Route to appropriate extraction pipeline
    let extractionResult;
    
    if (chosenMode === 'eco') {
      extractionResult = await runEcoMode(pageData, domAnalysis, url);
    } else if (chosenMode === 'balanced') {
      extractionResult = await runBalancedMode(pageData, domAnalysis, url);
    } else {
      // Fallback to balanced
      extractionResult = await runBalancedMode(pageData, domAnalysis, url);
    }
    
    // Step 8: Check if extraction quality warrants upgrade
    if (chosenMode === 'eco' && extractionResult.confidence < 70 && requestedMode === 'auto') {
      console.log('[Background] ⬆️ Low confidence detected. Upgrading to Balanced mode...');
      
      if (smartAutoMode) {
        const upgradeDecision = await smartAutoMode.upgradeMode(url, 'eco', 
          `Low confidence (${extractionResult.confidence}%) from Eco extraction`);
        chosenMode = upgradeDecision.mode;
        upgraded = true;
      }
      
      // Retry with Balanced mode
      extractionResult = await runBalancedMode(pageData, domAnalysis, url);
      
      if (analytics) {
        await analytics.trackModeSwitch('eco', 'balanced', 'Low confidence upgrade');
      }
    }
    
    // Step 9: Track API usage
    const apiCallsUsed = extractionResult.apiCalls || 0;
    if (rateLimitManager) {
      await rateLimitManager.trackRequest(apiCallsUsed);
    }
    
    // Step 10: Update cache learning
    if (smartCache) {
      await smartCache.updateLearning(url, {
        success: true,
        confidence: extractionResult.confidence,
        mode: chosenMode,
        apiCalls: apiCallsUsed,
        duration: Date.now() - startTime
      });
    }
    
    // Step 11: Track analytics
    if (analytics) {
      await analytics.trackExtraction({
        mode: chosenMode,
        success: true,
        confidence: extractionResult.confidence,
        apiCalls: apiCallsUsed,
        duration: Date.now() - startTime,
        cached: extractionResult.cached || false,
        upgraded,
        downgraded
      });
    }
    
    // Step 12: Return success response
    const responseObj = {
      success: true,
      data: extractionResult.data,
      metadata: {
        mode: chosenMode,
        requestedMode,
        confidence: extractionResult.confidence,
        apiCalls: apiCallsUsed,
        duration: Date.now() - startTime,
        cached: extractionResult.cached || false,
        upgraded,
        downgraded,
        classification: domAnalysis.classification,
        autoDecision: autoDecision ? {
          reasoning: autoDecision.reasoning,
          confidence: (autoDecision.confidence * 100).toFixed(0) + '%'
        } : null
      }
    };
    
    console.log('[Background] ✅ Extraction complete | Mode:', chosenMode, 
                '| Confidence:', extractionResult.confidence + '%', 
                '| API calls:', apiCallsUsed);
    
    return responseObj;
    
  } catch (error) {
    console.error('[Background] ❌ Extraction failed:', error);
    
    // Handle 429 rate limit error
    if (error.message && error.message.includes('429')) {
      if (rateLimitManager) {
        const queueInfo = await rateLimitManager.handle429Error({
          mode: chosenMode,
          tabId,
          url,
          timestamp: Date.now()
        });
        
        return {
          success: false,
          error: 'Rate limit exceeded',
          rateLimitInfo: queueInfo,
          message: `Rate limit hit. Your request has been queued. ` +
                  `It will retry automatically in ${Math.round(queueInfo.backoffDelay / 1000)} seconds. ` +
                  `Queue position: ${queueInfo.queuePosition}`
        };
      }
    }
    
    // Track error in cache learning
    if (smartCache && url) {
      await smartCache.updateLearning(url, {
        success: false,
        confidence: 0,
        mode: chosenMode,
        apiCalls: 0,
        duration: Date.now() - startTime,
        error: error.message
      });
    }
    
    // Track error in analytics
    if (analytics) {
      await analytics.trackError(error.message, {
        mode: chosenMode,
        retryCount: 0
      });
      
      await analytics.trackExtraction({
        mode: chosenMode,
        success: false,
        confidence: 0,
        apiCalls: 0,
        duration: Date.now() - startTime,
        error: error.message
      });
    }
    
    return {
      success: false,
      error: error.message,
      metadata: {
        mode: chosenMode,
        duration: Date.now() - startTime
      }
    };
  }
}

// ========================================
// ECO MODE PIPELINE (V2.0 NEW)
// ========================================

async function runEcoMode(pageData, domAnalysis, url) {
  console.log('[Background] 🌿 Running ECO MODE pipeline...');
  
  const startTime = Date.now();
  let apiCalls = 0;
  let cached = false;
  
  // Check if we can use cached data
  if (smartCache) {
    const cacheEntry = await smartCache.get(url);
    const shouldUseCache = await smartCache.shouldUseCache(url, 'eco');
    
    if (cacheEntry && shouldUseCache && cacheEntry.promptTemplate) {
      console.log('[Background] Using cached prompt template (0 API calls)');
      cached = true;
      
      // Skip prompt generation, go straight to extraction
      const extractionResult = await extractWithAI(
        pageData.mainText,
        cacheEntry.promptTemplate,
        cacheEntry.classification
      );
      apiCalls = 1; // Only extraction call
      
      return {
        data: extractionResult,
        confidence: extractionResult.confidence_score || 80,
        apiCalls,
        cached: true,
        duration: Date.now() - startTime
      };
    }
  }
  
  // Standard Eco pipeline: DOM trust + single extraction
  const classification = domAnalysis.classification;
  
  // Generate prompt (API call #1)
  const customPrompt = await generateCustomPrompt(classification, domAnalysis);
  apiCalls++;
  
  // Extract with AI (API call #2)
  const extractionResult = await extractWithAI(pageData.mainText, customPrompt, classification);
  apiCalls++;
  
  // Cache the prompt template for future use
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
// BALANCED MODE PIPELINE (V2.0 ENHANCED)
// ========================================

async function runBalancedMode(pageData, domAnalysis, url) {
  console.log('[Background] ⚖️ Running BALANCED MODE pipeline...');
  
  const startTime = Date.now();
  let apiCalls = 0;
  let cached = false;
  
  // Check cache for type detection skip
  let classification = domAnalysis.classification;
  let shouldVerifyWithAI = domAnalysis.confidence < 80 || classification === 'UNCERTAIN';
  
  if (smartCache) {
    const cacheEntry = await smartCache.get(url);
    if (cacheEntry && cacheEntry.learningMetrics && cacheEntry.learningMetrics.reliabilityScore > 0.95) {
      // High reliability - skip AI verification
      classification = cacheEntry.classification;
      shouldVerifyWithAI = false;
      cached = true;
      console.log('[Background] Skipping AI verification (high cache reliability)');
    }
  }
  
  // Conditional AI verification (API call #1 - maybe)
  if (shouldVerifyWithAI) {
    console.log('[Background] DOM uncertain - verifying with AI...');
    const aiClassification = await classifyWithAI(pageData.mainText);
    classification = aiClassification.type || classification;
    apiCalls++;
  }
  
  // Generate custom prompt (API call #2 or #1)
  const customPrompt = await generateCustomPrompt(classification, domAnalysis);
  apiCalls++;
  
  // Extract with AI (API call #3 or #2)
  const extractionResult = await extractWithAI(pageData.mainText, customPrompt, classification);
  apiCalls++;
  
  // Update cache
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
// HELPER FUNCTIONS (PRESERVED FROM DAY 10)
// ========================================

/**
 * DOM Structure Analysis (Layer 1)
 * Preserved from existing codebase - Critical for Smart Auto decisions
 */
function analyzeDOMStructure(pageData) {
  console.log('[Background] Analyzing DOM structure...');
  
  const signals = pageData.classificationSignals || {};
  const domDetails = pageData.domDetails || {};
  
  let classification = 'SINGLE_ITEM';
  let confidence = 50;
  let certainty = 'low';
  let type = 'unknown';
  
  // Check for NONE classification (login, error pages)
  if (signals.isLoginPage || signals.isErrorPage) {
    return {
      classification: 'NONE',
      confidence: 100,
      certainty: 'high',
      type: 'none',
      indicators: { login: signals.isLoginPage, error: signals.isErrorPage }
    };
  }
  
  // MULTI_ITEM detection
  const repeatedBlockCount = domDetails.repeatedBlocksCount || 0;
  const productGridDetected = domDetails.productGridFound || false;
  const articleCount = signals.articleCount || 0;
  
  if (repeatedBlockCount > 5 || productGridDetected || articleCount > 3) {
    classification = 'MULTI_ITEM';
    confidence = 90 + Math.min(10, repeatedBlockCount);
    certainty = 'high';
    type = productGridDetected ? 'ecommerce-listing' : 'content-listing';
  }
  // SINGLE_ITEM detection
  else if (signals.h1Count === 1 && signals.wordCount > 100) {
    classification = 'SINGLE_ITEM';
    confidence = 95;
    certainty = 'high';
    
    // Determine type based on signals
    if (signals.priceIndicators) type = 'ecommerce-product';
    else if (signals.articleIndicators) type = 'article';
    else if (signals.recipeIndicators) type = 'recipe';
    else type = 'general-content';
  }
  // UNCERTAIN
  else {
    classification = 'UNCERTAIN';
    confidence = 50;
    certainty = 'low';
    type = 'unknown';
  }
  
  return {
    classification,
    confidence,
    certainty,
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

/**
 * AI Classification (Layer 2 Fallback)
 * ✅ FIXED: Uses CONFIG for model
 */
async function classifyWithAI(mainText, domAnalysis = null) {
  console.log('[Background] Running AI classification fallback...');
  
  try {
    if (!apiKey) {
      console.error('[Background] No API key for AI classification');
      return { type: 'SINGLE_ITEM', confidence: 0.5 };
    }
    
    const promptTemplate = `You are a page classifier. Analyze the content and determine if it contains ONE primary entity or MULTIPLE entities.

${domAnalysis ? `DOM Analysis Signals:
- Articles: ${domAnalysis.indicators.articles}
- H1 tags: ${domAnalysis.indicators.h1Count}
- Word count: ${domAnalysis.indicators.wordCount}
- Repeating patterns: ${domAnalysis.indicators.repeatedBlocks}

` : ''}Content sample (first 1500 chars):
${mainText.substring(0, 1500)}

Respond with ONLY a JSON object:
{
  "type": "SINGLE_ITEM" or "MULTI_ITEM",
  "confidence": 0.0-1.0
}

No markdown, no explanation.`;
    
    // ✅ FIXED: Use CONFIG instead of hardcoded URL
    const url = `${CONFIG.API_ENDPOINT}/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptTemplate }] }],
        generationConfig: {
          maxOutputTokens: 50,
          temperature: 0.1
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`AI Classification failed: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('No AI classification response');
    }
    
    const result = extractJsonObject(content);
    
    console.log('[Background] AI Classification:', result.type, 'confidence:', result.confidence);
    
    return result;
    
  } catch (error) {
    console.error('[Background] AI Classification error:', error);
    return { type: 'SINGLE_ITEM', confidence: 0.5 };
  }
}

/**
 * Generate Custom Prompt (Layer 3)
 * ✅ FIXED: Uses CONFIG for model
 */
async function generateCustomPrompt(classification, domAnalysis) {
  console.log('[Background] Generating custom extraction prompt...');
  
  try {
    if (!apiKey) {
      throw new Error('No API key configured');
    }
    
    const websiteType = domAnalysis.type || 'general-content';
    const isMultiItem = classification === 'MULTI_ITEM';
    
    const metaPrompt = `You are an expert prompt engineer. Create a data extraction prompt for a ${websiteType} ${isMultiItem ? 'listing page with MULTIPLE items' : 'detail page with ONE item'}.

The prompt should:
1. Extract ALL relevant fields for a ${websiteType} ${isMultiItem ? 'listing' : 'page'}
2. Return valid JSON ${isMultiItem ? 'array of objects' : 'object'}
3. Include TWO required fields for quality control:
   - confidence_score: Integer 0-100 based on strict rules:
     * 95-100: Perfect extraction - all fields complete
     * 85-94: Excellent - all core fields present
     * 75-84: Good - most fields complete
     * 60-74: Acceptable - core fields present
     * 40-59: Poor - partial extraction
     * 0-39: Failed - insufficient data
   - confidence_reasoning: Single sentence explaining the score
4. Handle missing data gracefully (use null for missing fields)
5. ${isMultiItem ? 'Extract TOP 10 items maximum from the listing' : 'Focus on accuracy over completeness'}

CRITICAL: The extraction prompt must instruct the AI to:
- Self-assess the quality of its extraction
- Be conservative with confidence scores
- Provide specific reasoning

Return ONLY the extraction prompt as plain text, no JSON wrapper.`;
    
    // ✅ FIXED: Use CONFIG instead of hardcoded URL
    const url = `${CONFIG.API_ENDPOINT}/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: metaPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 800
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Prompt generation failed: ${response.status}`);
    }
    
    const data = await response.json();
    const customPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!customPrompt) {
      throw new Error('Failed to generate custom prompt');
    }
    
    console.log('[Background] Custom prompt generated successfully');
    
    return customPrompt;
    
  } catch (error) {
    console.error('[Background] Prompt generation error:', error);
    throw error;
  }
}

/**
 * Extract with AI (Final Extraction)
 * ✅ FIXED: Uses CONFIG for model
 */
async function extractWithAI(mainText, customPrompt, classification, retries = 0) {
  console.log('[Background] Extracting data with AI... (Attempt', retries + 1, ')');
  
  try {
    if (!apiKey) {
      throw new Error('No API key configured');
    }
    
    const contentToExtract = mainText.substring(0, 5000); // Limit context
    
    const fullPrompt = `${customPrompt}

Content to extract from:
${contentToExtract}

Return ONLY valid JSON with confidence_score and confidence_reasoning fields, no markdown, no explanation.`;
    
    // ✅ FIXED: Use CONFIG instead of hardcoded URL
    const url = `${CONFIG.API_ENDPOINT}/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048
        }
      })
    });
    
    if (!response.ok) {
      // Check for 429 rate limit
      if (response.status === 429) {
        throw new Error('429: Rate limit exceeded');
      }
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('No extraction result from AI');
    }
    
    console.log('[Background] Raw AI response received');
    
    // Parse JSON
    const extracted = extractJsonObject(content);
    
    // Validate confidence fields
    if (!extracted.confidence_score) {
      console.warn('[Background] AI did not provide confidence_score, defaulting to 50');
      extracted.confidence_score = 50;
      extracted.confidence_reasoning = 'AI did not self-assess confidence';
    }
    
    console.log('[Background] AI extraction successful | Confidence:', extracted.confidence_score + '%');
    
    return extracted;
    
  } catch (error) {
    console.error('[Background] AI extraction error:', error);
    
    // Retry logic (only for non-429 errors)
    const maxRetries = 1;
    
    if (retries < maxRetries && !error.message.includes('429')) {
      console.log('[Background] Retrying extraction...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
      return extractWithAI(mainText, customPrompt, classification, retries + 1);
    }
    
    throw error;
  }
}

/**
 * JSON Extraction Helper (Preserved)
 * Multi-step JSON extraction with auto-repair
 */
function extractJsonObject(text) {
  console.log('[Background] Extracting JSON from AI response...');
  
  // Step 1: Extract JSON boundaries
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) {
    console.error('[Background] No JSON found in response');
    throw new Error('No JSON detected in AI response');
  }
  
  let jsonCandidate = match[0];
  
  // Step 2: Try direct parse
  try {
    const parsed = JSON.parse(jsonCandidate);
    console.log('[Background] Direct JSON parse successful');
    return parsed;
  } catch (directError) {
    console.warn('[Background] Direct parse failed, trying repairs...');
  }
  
  // Step 3: Remove trailing commas
  try {
    const withoutTrailingCommas = jsonCandidate.replace(/,(\s*[}\]])/g, '$1');
    const parsed = JSON.parse(withoutTrailingCommas);
    console.log('[Background] JSON parsed after removing trailing commas');
    return parsed;
  } catch (trailingError) {
    console.warn('[Background] Trailing comma fix failed');
  }
  
  // Step 4: Wrap multiple objects in array
  try {
    const trimmed = jsonCandidate.trim();
    if (trimmed.startsWith('{') && /\},\s*\{/.test(trimmed)) {
      console.log('[Background] Wrapping multiple objects in array...');
      const wrapped = '[' + trimmed + ']';
      const cleaned = wrapped.replace(/,(\s*[}\]])/g, '$1');
      const parsed = JSON.parse(cleaned);
      console.log('[Background] JSON parsed after wrapping');
      return parsed;
    }
  } catch (wrapError) {
    console.warn('[Background] Multi-object wrapping failed');
  }
  
  // Step 5: Final fallback
  console.error('[Background] All JSON repair attempts failed');
  console.error('[Background] Malformed JSON:', jsonCandidate.substring(0, 200));
  throw new Error(`Malformed JSON: ${jsonCandidate.substring(0, 200)}...`);
}

// ========================================
// SERVICE WORKER INITIALIZATION
// ========================================

console.log('[Background] 🚀 Web Weaver Lightning v2.0 loading...');
console.log('[Background] Using model:', CONFIG?.GEMINI_MODEL || 'CONFIG not loaded');
console.log('[Background] All systems initialized');
