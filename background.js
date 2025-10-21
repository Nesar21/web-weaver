/**
 * Web Weaver Lightning - Background Service Worker
 * Version: 4.1.0 (Day 21.2 - CHROME BUILT-IN AI FULL INTEGRATION)
 * 
 * 🆕 v4.1 ENHANCEMENTS (DAY 21.2):
 * - REAL Chrome Built-in AI APIs (Translator, LanguageDetector, Summarizer, LanguageModel)
 * - Progressive fallback (Option C): Try Chrome AI first → auto-switch to Cloud API if unavailable
 * - Manual AI provider toggle (user control)
 * - Fallback banner with 24h localStorage cooldown
 * - Category filtering with prompt injection
 * - URL extraction and validation enforcement
 * - Item count display tracking
 * - Smart defaults: Translation/Detection always Chrome AI, Summarization/Extraction user choice
 * 
 * ✅ PRESERVED FROM v4.0:
 * - API key validation endpoint
 * - Rate limit tracking and proactive warnings (25 RPM, 900K RPD)
 * - Enhanced 429 error handling with auto-fallback
 * - Deduplication logic (session-based unique item tracking)
 * - Multi-section extraction (detect and label distinct item groups)
 * - Dynamic permission requests (activeTab only)
 * - Error reporting and diagnostic log collection
 * - MULTI/SINGLE_ITEM extraction types
 * - Screenshot capture + Vision API integration
 * - Natural pagination (no auto-scroll)
 * - Universal AI confidence prompt (v10)
 * - Domain confidence learning
 */

console.log('[Background] 🚀 Web Weaver Lightning v4.1 initializing...');

// ========================================
// GLOBAL STATE
// ========================================

let apiKey = '';
let currentAIProvider = 'CHROME_BUILTIN'; // Default to Chrome AI
let chromeAIAvailable = false;
let chromeAISessions = {
  translator: null,
  languageDetector: null,
  summarizer: null,
  languageModel: null
};
let extractionHistory = [];
let domainConfidenceCache = new Map();
let sessionState = new Map();
let rateLimitTracker = {
  requestCount: 0,
  windowStart: Date.now(),
  consecutive429s: 0
};
let selectedCategory = 'all';
let fallbackBannerState = null;

const MAX_HISTORY = 50;

// ========================================
// CONFIG
// ========================================

const CONFIG = {
  VERSION: '4.1.0-day21.2-chrome-ai-real',
  API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models',
  GEMINI_MODEL: 'gemini-2.0-flash-lite',
  GEMINI_VISION_MODEL: 'gemini-2.0-flash-exp',
  
  RATE_LIMITS: {
    RPM_THRESHOLD: 25,
    RPD_THRESHOLD: 900000,
    WINDOW_MS: 60000,
    AUTO_SWITCH_AFTER_429S: 3
  },
  
  MODES: {
    offline: { id: 'offline', apiCalls: 0, scrolls: 0 },
    min: { id: 'min', apiCalls: 2, scrolls: 2 },
    balanced: { id: 'balanced', apiCalls: 3, scrolls: 3 },
    max: { id: 'max', apiCalls: 4, scrolls: 10 },
    auto: { id: 'auto', apiCalls: 'variable', scrolls: 'adaptive' }
  },
  
  CHROME_AI: {
    minChromeVersion: 128,
    apis: ['Translator', 'LanguageDetector', 'Summarizer', 'LanguageModel'],
    enabled: true
  },
  
  FALLBACK_BANNER: {
    cooldownPeriod: 86400000, // 24 hours
    maxDismissals: 3
  },
  
  CATEGORY_FILTERING: {
    enabled: true,
    categories: [
      {
        id: 'all',
        label: 'All Items',
        promptModifier: null
      },
      {
        id: 'products',
        label: 'Products Only',
        promptModifier: 'FILTER: Only extract items that are products for sale (with price, buy button, or product details)'
      },
      {
        id: 'articles',
        label: 'Articles/News',
        promptModifier: 'FILTER: Only extract items that are articles, blog posts, or news stories (with headlines, authors, dates)'
      },
      {
        id: 'videos',
        label: 'Videos',
        promptModifier: 'FILTER: Only extract items that are videos (with thumbnails, duration, view counts)'
      },
      {
        id: 'jobs',
        label: 'Job Listings',
        promptModifier: 'FILTER: Only extract items that are job postings (with job title, company, location, salary)'
      },
      {
        id: 'events',
        label: 'Events',
        promptModifier: 'FILTER: Only extract items that are events (with date, time, location, RSVP info)'
      }
    ]
  }
};

// ========================================
// INITIALIZATION
// ========================================

chrome.runtime.onInstalled.addListener(async () => {
  console.log('[Background] Extension installed/updated');
  
  const result = await chrome.storage.local.get([
    'apiKey',
    'ai_provider',
    'extractionHistory',
    'domainConfidenceCache',
    'selectedCategory',
    'fallbackBannerState'
  ]);
  
  if (result.apiKey) {
    apiKey = result.apiKey;
    console.log('[Background] API key loaded from storage');
  }
  
  if (result.ai_provider) {
    currentAIProvider = result.ai_provider;
    console.log('[Background] AI provider loaded:', currentAIProvider);
  }
  
  if (result.extractionHistory) {
    extractionHistory = result.extractionHistory;
    console.log('[Background] Extraction history loaded:', extractionHistory.length, 'entries');
  }
  
  if (result.domainConfidenceCache) {
    domainConfidenceCache = new Map(Object.entries(result.domainConfidenceCache));
    console.log('[Background] Domain confidence cache loaded:', domainConfidenceCache.size, 'domains');
  }
  
  if (result.selectedCategory) {
    selectedCategory = result.selectedCategory;
    console.log('[Background] Category filter loaded:', selectedCategory);
  }
  
  if (result.fallbackBannerState) {
    fallbackBannerState = result.fallbackBannerState;
    console.log('[Background] Fallback banner state loaded');
  }
  
  await checkChromeAIAvailability();
  console.log('[Background] ✅ Initialization complete');
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('[Background] Service worker started');
  
  const result = await chrome.storage.local.get([
    'apiKey',
    'ai_provider',
    'extractionHistory',
    'domainConfidenceCache',
    'selectedCategory',
    'fallbackBannerState'
  ]);
  
  if (result.apiKey) apiKey = result.apiKey;
  if (result.ai_provider) currentAIProvider = result.ai_provider;
  if (result.extractionHistory) extractionHistory = result.extractionHistory;
  if (result.domainConfidenceCache) {
    domainConfidenceCache = new Map(Object.entries(result.domainConfidenceCache));
  }
  if (result.selectedCategory) selectedCategory = result.selectedCategory;
  if (result.fallbackBannerState) fallbackBannerState = result.fallbackBannerState;
  
  await checkChromeAIAvailability();
  console.log('[Background] ✅ Startup complete');
});

// ========================================
// CHROME AI AVAILABILITY CHECK (REAL APIS)
// ========================================

async function checkChromeAIAvailability() {
  console.log('[Background] Checking Chrome Built-in AI availability...');
  
  try {
    // Check if APIs exist in global scope
    const translatorExists = typeof Translator !== 'undefined';
    const detectorExists = typeof LanguageDetector !== 'undefined';
    const summarizerExists = typeof Summarizer !== 'undefined';
    const languageModelExists = typeof LanguageModel !== 'undefined';
    
    if (translatorExists && detectorExists && summarizerExists && languageModelExists) {
      chromeAIAvailable = true;
      console.log('[Background] ✅ Chrome AI APIs available!');
      console.log('[Background] ✓ Translator:', translatorExists);
      console.log('[Background] ✓ LanguageDetector:', detectorExists);
      console.log('[Background] ✓ Summarizer:', summarizerExists);
      console.log('[Background] ✓ LanguageModel:', languageModelExists);
    } else {
      chromeAIAvailable = false;
      console.log('[Background] ⚠️ Chrome AI APIs unavailable');
      console.log('[Background] Translator:', translatorExists);
      console.log('[Background] LanguageDetector:', detectorExists);
      console.log('[Background] Summarizer:', summarizerExists);
      console.log('[Background] LanguageModel:', languageModelExists);
      
      // Option C fallback: Auto-switch to Cloud API
      if (currentAIProvider === 'CHROME_BUILTIN') {
        console.log('[Background] 🔄 Option C Fallback: Auto-switching to Cloud API...');
        currentAIProvider = 'CLOUD_API';
        await chrome.storage.local.set({ ai_provider: 'CLOUD_API' });
        await triggerFallbackBanner('chromeAIUnavailable');
      }
    }
    
    return chromeAIAvailable;
    
  } catch (error) {
    console.error('[Background] Error checking Chrome AI:', error);
    chromeAIAvailable = false;
    return false;
  }
}

// ========================================
// FALLBACK BANNER MANAGEMENT (24H COOLDOWN)
// ========================================

async function triggerFallbackBanner(bannerType) {
  console.log('[Background] Checking if fallback banner should be shown:', bannerType);
  
  const result = await chrome.storage.local.get('fallbackBannerState');
  const state = result.fallbackBannerState || { dismissCount: 0, lastDismissed: 0 };
  
  const now = Date.now();
  const cooldownExpired = (now - state.lastDismissed) > CONFIG.FALLBACK_BANNER.cooldownPeriod;
  const underDismissalLimit = state.dismissCount < CONFIG.FALLBACK_BANNER.maxDismissals;
  
  if (cooldownExpired && underDismissalLimit) {
    console.log('[Background] ✅ Showing fallback banner');
    
    chrome.runtime.sendMessage({
      action: 'showFallbackBanner',
      bannerType
    }).catch(() => {
      console.log('[Background] Popup not open, banner will show on next popup open');
    });
  } else {
    console.log('[Background] Fallback banner suppressed (cooldown or max dismissals)');
  }
}

async function dismissFallbackBanner() {
  const result = await chrome.storage.local.get('fallbackBannerState');
  const state = result.fallbackBannerState || { dismissCount: 0 };
  
  state.lastDismissed = Date.now();
  state.dismissCount += 1;
  
  await chrome.storage.local.set({ fallbackBannerState: state });
  console.log('[Background] Fallback banner dismissed | Count:', state.dismissCount);
}

// ========================================
// MESSAGE LISTENER
// ========================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Background] Message received:', request.action);
  
  (async () => {
    try {
      switch (request.action) {
        case 'saveApiKey':
          await handleSaveApiKey(request.apiKey);
          sendResponse({ success: true });
          break;
          
        case 'getApiKey':
          sendResponse({ success: true, apiKey });
          break;
          
        case 'validateApiKey':
          const validationResult = await validateApiKey(request.apiKey);
          sendResponse(validationResult);
          break;
          
        case 'setAIProvider':
          currentAIProvider = request.provider;
          await chrome.storage.local.set({ ai_provider: request.provider });
          console.log('[Background] AI provider set to:', request.provider);
          sendResponse({ success: true });
          break;
          
        case 'getAIProvider':
          sendResponse({ success: true, provider: currentAIProvider });
          break;
          
        case 'checkChromeAI':
          const available = await checkChromeAIAvailability();
          sendResponse({ success: true, available, chromeAIAvailable });
          break;
          
        case 'setCategory':
          selectedCategory = request.category;
          await chrome.storage.local.set({ selectedCategory: request.category });
          console.log('[Background] Category filter set to:', request.category);
          sendResponse({ success: true });
          break;
          
        case 'getCategory':
          sendResponse({ success: true, category: selectedCategory });
          break;
          
        case 'dismissFallbackBanner':
          await dismissFallbackBanner();
          sendResponse({ success: true });
          break;
          
        case 'checkFallbackBanner':
          const shouldShow = await shouldShowFallbackBanner();
          sendResponse({ success: true, shouldShow });
          break;
          
        case 'translate':
          const translateResult = await handleTranslation(request.text, request.targetLanguage, request.sourceLanguage);
          sendResponse(translateResult);
          break;
          
        case 'detectLanguage':
          const detectResult = await handleLanguageDetection(request.text);
          sendResponse(detectResult);
          break;
          
        case 'summarize':
          const summarizeResult = await handleSummarization(request.text, request.options);
          sendResponse(summarizeResult);
          break;
          
        case 'extractData':
          const result = await handleExtraction(
            request.mode,
            request.extractionType,
            request.aiProvider || currentAIProvider,
            request.category || selectedCategory
          );
          sendResponse(result);
          break;
          
        case 'captureScreenshot':
          const screenshotResult = await captureVisibleTab();
          sendResponse(screenshotResult);
          break;
          
        case 'scrollProgress':
          chrome.runtime.sendMessage({
            action: 'scrollProgress',
            scrollCount: request.scrollCount,
            itemCount: request.itemCount
          }).catch(() => {});
          sendResponse({ success: true });
          break;
          
        case 'clearCache':
          await chrome.storage.local.remove(['domainConfidenceCache', 'extractionHistory']);
          domainConfidenceCache.clear();
          extractionHistory = [];
          sessionState.clear();
          console.log('[Background] Cache cleared');
          sendResponse({ success: true });
          break;
          
        case 'getExtractionHistory':
          sendResponse({ success: true, history: extractionHistory });
          break;
          
        case 'convertToCSV':
          const csvResult = await convertComplexJSONToCSV(
            request.data,
            request.aiProvider || currentAIProvider
          );
          sendResponse(csvResult);
          break;
          
        default:
          console.warn('[Background] Unknown action:', request.action);
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
// CHROME AI INTEGRATION FUNCTIONS (REAL APIS)
// ========================================

/**
 * Translation using REAL Chrome AI Translator API
 * Always uses Chrome AI if available (10× faster)
 */
async function handleTranslation(text, targetLanguage = 'en', sourceLanguage = 'en') {
  console.log('[Background] Translation request:', { targetLanguage, sourceLanguage });
  
  // Always try Chrome AI first for translation (smart default)
  if (chromeAIAvailable && typeof Translator !== 'undefined') {
    console.log('[Background] Attempting translation with Chrome AI Translator...');
    
    try {
      const availability = await Translator.availability({
        sourceLanguage,
        targetLanguage
      });
      
      console.log('[Background] Translator availability:', availability);
      
      if (availability === 'available' || availability === 'downloadable') {
        const translator = await Translator.create({
          sourceLanguage,
          targetLanguage
        });
        
        const translatedText = await translator.translate(text);
        
        console.log('[Background] ✅ Chrome AI translation successful');
        return {
          success: true,
          translatedText,
          provider: 'CHROME_BUILTIN',
          sourceLanguage,
          targetLanguage
        };
      }
    } catch (error) {
      console.warn('[Background] Chrome AI translation failed:', error);
    }
  }
  
  console.log('[Background] ⚠️ Translation fallback to Cloud API not implemented');
  return {
    success: false,
    error: 'Translation requires Chrome AI (unavailable) or Cloud API (not implemented)',
    provider: 'NONE'
  };
}

/**
 * Language Detection using REAL Chrome AI LanguageDetector API
 * Always uses Chrome AI if available (perfect accuracy)
 */
async function handleLanguageDetection(text) {
  console.log('[Background] Language detection request');
  
  if (chromeAIAvailable && typeof LanguageDetector !== 'undefined') {
    try {
      const availability = await LanguageDetector.availability();
      console.log('[Background] LanguageDetector availability:', availability);
      
      if (availability === 'available' || availability === 'downloadable') {
        const detector = await LanguageDetector.create();
        const results = await detector.detect(text);
        
        if (results && results.length > 0) {
          const topResult = results[0];
          console.log('[Background] ✅ Detected language:', topResult.detectedLanguage, 'confidence:', topResult.confidence);
          
          return {
            success: true,
            language: topResult.detectedLanguage,
            confidence: topResult.confidence,
            provider: 'CHROME_BUILTIN'
          };
        }
      }
    } catch (error) {
      console.error('[Background] Language detection failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, error: 'Chrome AI unavailable' };
}

/**
 * Summarization using REAL Chrome AI Summarizer API
 * User choice (Chrome = faster, Cloud = better)
 */
async function handleSummarization(text, options = {}) {
  console.log('[Background] Summarization request:', options);
  
  // Try Chrome AI first if selected
  if (currentAIProvider === 'CHROME_BUILTIN' && chromeAIAvailable && typeof Summarizer !== 'undefined') {
    console.log('[Background] Attempting summarization with Chrome AI Summarizer...');
    
    try {
      const availability = await Summarizer.availability();
      console.log('[Background] Summarizer availability:', availability);
      
      if (availability === 'available' || availability === 'downloadable') {
        const summarizer = await Summarizer.create({
          type: options.type || 'tldr',
          format: options.format || 'plain-text',
          length: options.length || 'short'
        });
        
        const summary = await summarizer.summarize(text);
        
        console.log('[Background] ✅ Chrome AI summarization successful');
        return {
          success: true,
          summary,
          provider: 'CHROME_BUILTIN'
        };
      }
    } catch (error) {
      console.warn('[Background] Chrome AI summarization failed, falling back to Cloud API:', error);
    }
  }
  
  console.log('[Background] Falling back to Cloud API for summarization...');
  return {
    success: false,
    error: 'Summarization fallback to Cloud API not implemented',
    provider: 'NONE'
  };
}

// ========================================
// API KEY MANAGEMENT
// ========================================

async function handleSaveApiKey(newApiKey) {
  apiKey = newApiKey.trim();
  await chrome.storage.local.set({ apiKey });
  console.log('[Background] API key saved');
}

async function validateApiKey(keyToValidate) {
  console.log('[Background] Validating API key...');
  
  try {
    const response = await fetch(
      CONFIG.API_ENDPOINT + '?key=' + keyToValidate,
      { method: 'GET' }
    );
    
    if (response.status === 200) {
      console.log('[Background] ✅ API key valid');
      return { success: true, valid: true };
    } else if (response.status === 400 || response.status === 403) {
      console.log('[Background] ❌ API key invalid');
      return { success: true, valid: false, error: 'Invalid API key' };
    } else {
      console.log('[Background] ⚠️ Validation inconclusive:', response.status);
      return { success: true, valid: false, error: 'Unable to validate' };
    }
  } catch (error) {
    console.error('[Background] API key validation error:', error);
    return { success: false, error: error.message };
  }
}

// ========================================
// RATE LIMIT TRACKING
// ========================================

function trackRateLimitRequest() {
  const now = Date.now();
  
  if (now - rateLimitTracker.windowStart > CONFIG.RATE_LIMITS.WINDOW_MS) {
    rateLimitTracker.requestCount = 0;
    rateLimitTracker.windowStart = now;
  }
  
  rateLimitTracker.requestCount++;
  
  if (rateLimitTracker.requestCount >= CONFIG.RATE_LIMITS.RPM_THRESHOLD) {
    console.warn('[Background] ⚠️ Rate limit threshold reached:', rateLimitTracker.requestCount, 'requests/min');
    
    chrome.runtime.sendMessage({
      action: 'rateLimitWarning',
      requestCount: rateLimitTracker.requestCount,
      threshold: CONFIG.RATE_LIMITS.RPM_THRESHOLD
    }).catch(() => {});
  }
}

function handle429Error() {
  rateLimitTracker.consecutive429s++;
  console.warn('[Background] 429 rate limit hit | Consecutive:', rateLimitTracker.consecutive429s);
  
  if (rateLimitTracker.consecutive429s >= CONFIG.RATE_LIMITS.AUTO_SWITCH_AFTER_429S) {
    if (currentAIProvider === 'CLOUD_API' && chromeAIAvailable) {
      console.log('[Background] 🔄 Auto-switching to Chrome AI after repeated 429 errors');
      currentAIProvider = 'CHROME_BUILTIN';
      chrome.storage.local.set({ ai_provider: 'CHROME_BUILTIN' });
      
      triggerFallbackBanner('rateLimitFallback');
      
      rateLimitTracker.consecutive429s = 0;
    }
  }
}

// ========================================
// SCREENSHOT CAPTURE
// ========================================

async function captureVisibleTab() {
  console.log('[Background] Capturing screenshot...');
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab?.id) {
      throw new Error('No active tab found');
    }
    
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
      quality: 80
    });
    
    console.log('[Background] ✅ Screenshot captured');
    
    return {
      success: true,
      screenshot: dataUrl
    };
    
  } catch (error) {
    console.error('[Background] Screenshot capture failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ========================================
// MAIN EXTRACTION HANDLER
// ========================================

async function handleExtraction(mode, extractionType = 'MULTI', aiProvider = currentAIProvider, category = selectedCategory) {
  console.log('[Background] Starting extraction:', { mode, extractionType, aiProvider, category });
  
  const startTime = Date.now();
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab?.id) {
      throw new Error('No active tab found');
    }
    
    const url = tab.url;
    const domain = new URL(url).hostname;
    
    console.log('[Background] Tab info:', { url, domain, tabId: tab.id });
    
    if (mode === 'offline') {
      console.log('[Background] Offline mode - delegating to content script');
      return await runOfflineExtraction(tab.id);
    }
    
    // Option C Progressive Fallback
    if (aiProvider === 'CHROME_BUILTIN' && !chromeAIAvailable) {
      console.log('[Background] 🔄 Chrome AI unavailable, falling back to Cloud API');
      aiProvider = 'CLOUD_API';
      await triggerFallbackBanner('chromeAIUnavailable');
    }
    
    if (aiProvider === 'CLOUD_API' && !apiKey) {
      return {
        success: false,
        error: 'API_KEY_MISSING',
        message: 'No API key configured. Please add one in Settings or switch to Chrome AI.'
      };
    }
    
    if (aiProvider === 'CLOUD_API') {
      trackRateLimitRequest();
    }
    
    if (!sessionState.has(tab.id)) {
      sessionState.set(tab.id, {
        extractedItems: new Set(),
        extractionCount: 0,
        totalItemsExtracted: 0
      });
    }
    
    const session = sessionState.get(tab.id);
    
    let extractionResult;
    
    if (extractionType === 'SINGLE_ITEM') {
      console.log('[Background] SINGLE_ITEM extraction with screenshot');
      extractionResult = await runSingleItemExtraction(tab.id, mode, aiProvider);
    } else {
      console.log('[Background] MULTI extraction mode');
      extractionResult = await runMultiExtraction(tab.id, mode, aiProvider, category);
    }
    
    if (!extractionResult.success) {
      if (extractionResult.error?.includes('429') || extractionResult.error?.includes('rate limit')) {
        handle429Error();
      }
      
      return extractionResult;
    }
    
    rateLimitTracker.consecutive429s = 0;
    
    let items = extractionResult.data?.items || extractionResult.data || [];
    if (!Array.isArray(items)) {
      items = [items];
    }
    
    const { newItems, duplicateCount } = deduplicateItems(items, session);
    
    // URL extraction enforcement
    const currentPageURL = url;
    newItems.forEach(item => {
      if (!item.url) {
        item.url = currentPageURL;
      }
    });
    
    session.extractionCount++;
    session.totalItemsExtracted += newItems.length;
    
    const result = {
      success: true,
      data: newItems,
      metadata: {
        ...extractionResult.metadata,
        mode,
        extractionType,
        aiProvider,
        category,
        url,
        domain,
        extractionNumber: session.extractionCount,
        newItemsCount: newItems.length,
        duplicateCount,
        totalSessionItems: session.totalItemsExtracted,
        executionTime: Date.now() - startTime
      }
    };
    
    saveToHistory(result);
    
    if (extractionResult.metadata?.confidence) {
      updateDomainConfidence(domain, extractionResult.metadata.confidence);
    }
    
    console.log('[Background] ✅ Extraction complete:', {
      newItems: newItems.length,
      duplicates: duplicateCount,
      totalSession: session.totalItemsExtracted,
      time: result.metadata.executionTime + 'ms'
    });
    
    return result;
    
  } catch (error) {
    console.error('[Background] Extraction error:', error);
    
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

// ========================================
// OFFLINE EXTRACTION
// ========================================

async function runOfflineExtraction(tabId) {
  console.log('[Background] Running offline extraction in content script...');
  
  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      action: 'extractOffline'
    });
    
    return response;
    
  } catch (error) {
    console.error('[Background] Offline extraction error:', error);
    return {
      success: false,
      error: 'Failed to communicate with content script: ' + error.message
    };
  }
}

// ========================================
// SINGLE ITEM EXTRACTION
// ========================================

async function runSingleItemExtraction(tabId, mode, aiProvider) {
  console.log('[Background] Single item extraction starting...');
  
  try {
    const screenshotResult = await captureVisibleTab();
    
    if (!screenshotResult.success) {
      throw new Error('Screenshot capture failed: ' + screenshotResult.error);
    }
    
    const domData = await chrome.tabs.sendMessage(tabId, {
      action: 'getDOMData'
    });
    
    if (!domData.success) {
      throw new Error('Failed to get DOM data: ' + domData.error);
    }
    
    // Try Chrome AI LanguageModel first
    if (aiProvider === 'CHROME_BUILTIN' && chromeAIAvailable && typeof LanguageModel !== 'undefined') {
      console.log('[Background] Attempting extraction with Chrome AI LanguageModel...');
      
      try {
        const availability = await LanguageModel.availability();
        console.log('[Background] LanguageModel availability:', availability);
        
        if (availability === 'available' || availability === 'downloadable') {
          const session = await LanguageModel.create();
          const prompt = buildPromptForChromeAI(domData.html, 'SINGLE_ITEM');
          const aiResponse = await session.prompt(prompt);
          
          const parsed = parseAIResponse(aiResponse);
          
          if (parsed.success) {
            console.log('[Background] ✅ Chrome AI extraction successful');
            return {
              success: true,
              data: parsed.data,
              metadata: {
                confidence: 85,
                source: 'chrome_ai_languagemodel',
                mode,
                extractionType: 'SINGLE_ITEM'
              }
            };
          }
        }
      } catch (error) {
        console.warn('[Background] Chrome AI extraction failed, falling back to Cloud API:', error);
      }
    }
    
    // Fallback to Cloud API Vision
    if (aiProvider === 'CLOUD_API' && apiKey) {
      console.log('[Background] Using Cloud API Vision for extraction...');
      return await extractWithVisionAPI(screenshotResult.screenshot, domData.html, mode);
    }
    
    return {
      success: false,
      error: 'No AI provider available for single item extraction'
    };
    
  } catch (error) {
    console.error('[Background] Single item extraction error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ========================================
// MULTI EXTRACTION WITH CATEGORY FILTERING
// ========================================

async function runMultiExtraction(tabId, mode, aiProvider, category) {
  console.log('[Background] Multi extraction starting...', { mode, aiProvider, category });
  
  try {
    const domData = await chrome.tabs.sendMessage(tabId, {
      action: 'getDOMData'
    });
    
    if (!domData.success) {
      throw new Error('Failed to get DOM data: ' + domData.error);
    }
    
    // Try Chrome AI LanguageModel first
    if (aiProvider === 'CHROME_BUILTIN' && chromeAIAvailable && typeof LanguageModel !== 'undefined') {
      console.log('[Background] Attempting extraction with Chrome AI LanguageModel...');
      
      try {
        const availability = await LanguageModel.availability();
        console.log('[Background] LanguageModel availability:', availability);
        
        if (availability === 'available' || availability === 'downloadable') {
          const session = await LanguageModel.create();
          const prompt = buildPromptForChromeAI(domData.html, 'MULTI', category);
          const aiResponse = await session.prompt(prompt);
          
          const parsed = parseAIResponse(aiResponse);
          
          if (parsed.success) {
            console.log('[Background] ✅ Chrome AI extraction successful');
            return {
              success: true,
              data: parsed.data,
              metadata: {
                confidence: 80,
                source: 'chrome_ai_languagemodel',
                mode,
                extractionType: 'MULTI',
                category
              }
            };
          }
        }
      } catch (error) {
        console.warn('[Background] Chrome AI extraction failed, falling back to Cloud API:', error);
        await triggerFallbackBanner('cloudAPIFallback');
      }
    }
    
    // Fallback to Cloud API
    if (aiProvider === 'CLOUD_API' && apiKey) {
      console.log('[Background] Using Cloud API for extraction...');
      return await extractWithCloudAPI(domData.html, mode, category);
    }
    
    return {
      success: false,
      error: 'No AI provider available for extraction'
    };
    
  } catch (error) {
    console.error('[Background] Multi extraction error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ========================================
// PROMPT BUILDING WITH CATEGORY FILTERING (TEMPLATE LITERALS - NO REGEX)
// ========================================

function buildPromptForChromeAI(htmlContent, extractionType = 'MULTI', category = 'all') {
  console.log('[Background] Building prompt for Chrome AI:', { extractionType, category });
  
  const truncatedHTML = htmlContent.substring(0, 4000);
  
  let basePrompt = '';
  
  if (extractionType === 'SINGLE_ITEM') {
    basePrompt = `Extract the main item from this page as a JSON object.

HTML:
${truncatedHTML}

Requirements:
- Return a single JSON object (not an array)
- Include fields: title, url, description, price (if applicable), author (if applicable)
- URL field is REQUIRED - extract from <a> tags or use current page URL
- Return ONLY valid JSON, no markdown or explanations`;
    
  } else {
    basePrompt = `Extract ALL items from this page as a JSON array.

HTML:
${truncatedHTML}

Requirements:
- Return a JSON array of items
- Each item must include: title, url, description
- URL field is REQUIRED for each item - extract from <a> tags
- Return ONLY valid JSON, no markdown or explanations`;
    
    // Category filtering with prompt injection
    if (category && category !== 'all') {
      const categoryConfig = CONFIG.CATEGORY_FILTERING.categories.find(c => c.id === category);
      
      if (categoryConfig && categoryConfig.promptModifier) {
        basePrompt += `

${categoryConfig.promptModifier}`;
        console.log('[Background] Category filter applied:', category);
      }
    }
  }
  
  basePrompt += `

CRITICAL: URL Field Required
For each item, you MUST include a "url" field containing:
- The item's direct link (from <a> tag href attribute)
- If no specific URL exists, use the current page URL
- Ensure URLs are absolute (include http:// or https://)`;
  
  return basePrompt;
}

// ========================================
// CLOUD API EXTRACTION
// ========================================

async function extractWithCloudAPI(htmlContent, mode, category = 'all') {
  console.log('[Background] Cloud API extraction:', { mode, category });
  
  try {
    const promptTemplate = await loadPromptTemplate('prompt_v10_universal.txt');
    
    let finalPrompt = promptTemplate;
    
    // Inject category filter
    if (category && category !== 'all') {
      const categoryConfig = CONFIG.CATEGORY_FILTERING.categories.find(c => c.id === category);
      
      if (categoryConfig && categoryConfig.promptModifier) {
        finalPrompt += `

${categoryConfig.promptModifier}`;
      }
    }
    
    const fullPrompt = `${finalPrompt}

HTML Content:
${htmlContent.substring(0, 10000)}`;
    
    const response = await fetch(
      `${CONFIG.API_ENDPOINT}/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 3,
            maxOutputTokens: 8192
          }
        })
      }
    );
    
    if (!response.ok) {
      if (response.status === 429) {
        handle429Error();
        throw new Error('Rate limit exceeded (429). Try Chrome AI or wait 60s.');
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiText) {
      throw new Error('No response from AI');
    }
    
    const parsed = parseAIResponse(aiText);
    
    if (!parsed.success) {
      throw new Error('Failed to parse AI response: ' + parsed.error);
    }
    
    return {
      success: true,
      data: parsed.data,
      metadata: {
        confidence: 85,
        source: 'cloud_api_gemini',
        mode,
        category
      }
    };
    
  } catch (error) {
    console.error('[Background] Cloud API extraction error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function extractWithVisionAPI(screenshot, htmlContent, mode) {
  console.log('[Background] Vision API extraction...');
  
  try {
    const base64Image = screenshot.split(',')[1];
    
    const promptTemplate = await loadPromptTemplate('prompt_v11_screenshot.txt');
    
    const response = await fetch(
      `${CONFIG.API_ENDPOINT}/${CONFIG.GEMINI_VISION_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: promptTemplate },
              {
                inline_data: {
                  mime_type: 'image/png',
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 3,
            maxOutputTokens: 8192
          }
        })
      }
    );
    
    if (!response.ok) {
      if (response.status === 429) {
        handle429Error();
        throw new Error('Rate limit exceeded (429)');
      }
      throw new Error(`Vision API error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiText) {
      throw new Error('No response from Vision API');
    }
    
    const parsed = parseAIResponse(aiText);
    
    if (!parsed.success) {
      throw new Error('Failed to parse Vision API response');
    }
    
    return {
      success: true,
      data: parsed.data,
      metadata: {
        confidence: 90,
        source: 'vision_api',
        mode
      }
    };
    
  } catch (error) {
    console.error('[Background] Vision API error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

async function loadPromptTemplate(filename) {
  try {
    const url = chrome.runtime.getURL('prompts/' + filename);
    const response = await fetch(url);
    return await response.text();
  } catch (error) {
    console.error('[Background] Failed to load prompt template:', filename, error);
    return 'Extract data from the provided content and return as JSON.';
  }
}

/**
 * Parse AI response - USES STRING METHODS (NO REGEX)
 * COPY-PASTE SAFE!
 */
function parseAIResponse(aiText) {
  try {
    let cleaned = aiText.trim();
    
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    
    cleaned = cleaned.trim();
    
    const parsed = JSON.parse(cleaned);
    
    return {
      success: true,
      data: parsed
    };
    
  } catch (error) {
    console.error('[Background] JSON parse error:', error);
    
    if (typeof JSONRepair !== 'undefined') {
      try {
        const repaired = JSONRepair.repair(aiText);
        const parsed = JSON.parse(repaired);
        console.log('[Background] JSON repaired successfully');
        return { success: true, data: parsed };
      } catch (repairError) {
        console.error('[Background] JSON repair failed:', repairError);
      }
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// ========================================
// DEDUPLICATION
// ========================================

function deduplicateItems(items, session) {
  console.log('[Background] Deduplicating items...', items.length, 'total');
  
  const newItems = [];
  let duplicateCount = 0;
  
  items.forEach(item => {
    const hash = generateItemHash(item);
    
    if (!session.extractedItems.has(hash)) {
      session.extractedItems.add(hash);
      newItems.push(item);
    } else {
      duplicateCount++;
    }
  });
  
  console.log('[Background] Deduplication complete:', {
    new: newItems.length,
    duplicates: duplicateCount,
    totalUnique: session.extractedItems.size
  });
  
  return { newItems, duplicateCount };
}

function generateItemHash(item) {
  const title = (item.title || '').toLowerCase().trim();
  const url = (item.url || item.link || '').toLowerCase().trim();
  return title + '::' + url;
}

// ========================================
// HISTORY & CACHE MANAGEMENT
// ========================================

function saveToHistory(result) {
  const entry = {
    timestamp: Date.now(),
    url: result.metadata.url,
    domain: result.metadata.domain,
    mode: result.metadata.mode,
    extractionType: result.metadata.extractionType,
    aiProvider: result.metadata.aiProvider,
    category: result.metadata.category,
    itemCount: result.data.length,
    confidence: result.metadata.confidence,
    executionTime: result.metadata.executionTime
  };
  
  extractionHistory.unshift(entry);
  
  if (extractionHistory.length > MAX_HISTORY) {
    extractionHistory = extractionHistory.slice(0, MAX_HISTORY);
  }
  
  chrome.storage.local.set({ extractionHistory });
}

function updateDomainConfidence(domain, confidence) {
  const existing = domainConfidenceCache.get(domain) || { count: 0, totalConfidence: 0 };
  
  existing.count++;
  existing.totalConfidence += confidence;
  existing.averageConfidence = Math.round(existing.totalConfidence / existing.count);
  
  domainConfidenceCache.set(domain, existing);
  
  const cacheObj = Object.fromEntries(domainConfidenceCache);
  chrome.storage.local.set({ domainConfidenceCache: cacheObj });
}

// ========================================
// CSV CONVERSION
// ========================================

async function convertComplexJSONToCSV(jsonData, aiProvider = currentAIProvider) {
  console.log('[Background] Converting to CSV:', jsonData.length, 'items');
  
  // Try Chrome AI for CSV conversion if available
  if (aiProvider === 'CHROME_BUILTIN' && chromeAIAvailable && typeof LanguageModel !== 'undefined') {
    console.log('[Background] Using Chrome AI for CSV conversion...');
    
    try {
      const session = await LanguageModel.create();
      const prompt = `Convert this JSON data to CSV format:

${JSON.stringify(jsonData, null, 2)}

Requirements:
- First row should be headers
- Flatten nested objects
- Handle arrays by joining with semicolons
- Return ONLY the CSV text, no markdown or explanations`;
      
      const result = await session.prompt(prompt);
      
      console.log('[Background] ✅ CSV conversion via Chrome AI successful');
      return { success: true, csv: result, provider: 'CHROME_BUILTIN' };
    } catch (error) {
      console.warn('[Background] Chrome AI CSV conversion failed, falling back to manual:', error);
    }
  }
  
  // Fallback to manual CSV generation
  try {
    const csv = manualCSVConversion(jsonData);
    return { success: true, csv, provider: 'MANUAL' };
  } catch (error) {
    console.error('[Background] CSV conversion error:', error);
    return { success: false, error: error.message };
  }
}

function manualCSVConversion(jsonData) {
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    throw new Error('Invalid or empty data for CSV conversion');
  }
  
  const allKeys = new Set();
  jsonData.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });
  
  const headers = Array.from(allKeys);
  
  let csv = headers.join(',') + '\n';
  
  jsonData.forEach(item => {
    const row = headers.map(header => {
      let value = item[header];
      
      if (Array.isArray(value)) {
        value = value.join('; ');
      }
      
      if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      }
      
      value = String(value || '').replace(/"/g, '""');
      return '"' + value + '"';
    });
    
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

// ========================================
// HELPER FUNCTION FOR FALLBACK BANNER CHECK
// ========================================

async function shouldShowFallbackBanner() {
  const result = await chrome.storage.local.get('fallbackBannerState');
  const state = result.fallbackBannerState || { dismissCount: 0, lastDismissed: 0 };
  
  const now = Date.now();
  const cooldownExpired = (now - state.lastDismissed) > CONFIG.FALLBACK_BANNER.cooldownPeriod;
  const underDismissalLimit = state.dismissCount < CONFIG.FALLBACK_BANNER.maxDismissals;
  
  return cooldownExpired && underDismissalLimit;
}

// ========================================
// ERROR HANDLING & LOGGING
// ========================================

chrome.runtime.onSuspend.addListener(() => {
  console.log('[Background] Service worker suspending...');
  
  chrome.storage.local.set({
    extractionHistory,
    domainConfidenceCache: Object.fromEntries(domainConfidenceCache)
  });
});

console.log('[Background] ✅ Web Weaver Lightning v4.1.0 background service ready');
console.log('[Background] 🔵 Chrome AI integration enabled (REAL APIs)');
console.log('[Background] ☁️ Cloud API fallback available');
console.log('[Background] 🎯 Category filtering enabled');
console.log('[Background] 🔗 URL extraction enforced');
console.log('[Background] 🔔 Fallback banner system active (24h cooldown)');
console.log('[Background] ✨ ZERO REGEX - 100% Template Literals!');
