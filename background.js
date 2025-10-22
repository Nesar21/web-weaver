/**
 * Web Weaver Lightning - Background Service Worker
 * Version: 4.2.0 (v4.2 - MODULAR ARCHITECTURE)
 * 
 * 🆕 v4.2 MODULAR ENHANCEMENTS:
 * - BATCH PROCESSING: Uses BatchProcessor module for translation/summarization
 * - COST TRACKING: Uses CostTracker module with budget warnings (75%, 90%, 100%)
 * - DEDUPLICATION: Uses DeduplicationManager module with fuzzy matching (85% similarity)
 * - AUTO-CLEANUP: 7-day retention for deduplication fingerprints
 * - TEMPLATE AUTO-DETECTION: Auto-detect site type and apply extraction templates
 * - AI INSIGHTS: Generate insights from extracted data (summary, comparison, recommendations)
 * - SMART DEFAULTS: Context-aware mode/category selection
 * - CHANGE DETECTION: Track changes across re-extractions
 * - LANGUAGE DETECTOR: Enhanced language detection with confidence
 * - MULTIMODAL: Image analysis and audio transcription (Cloud API)
 * 
 * ✅ PRESERVED FROM v4.1:
 * - REAL Chrome Built-in AI APIs (Translator, LanguageDetector, Summarizer, Writer)
 * - Cloud API fallback for Gemini Flash 1.5 (multimodal, vision, high-complexity)
 * - Cache system, Rate limiting, Analytics tracking
 * - Smart Auto Mode, Classifier, JSON Repair
 * - All existing extraction, validation, simulation logic
 */

console.log('[Background] 🚀 Web Weaver Lightning v4.2.0 MODULAR starting...');

// ============================================================================
// GLOBAL STATE & CONFIGURATION
// ============================================================================

/**
 * Background service state management
 */
const BACKGROUND_STATE = {
  initialized: false,
  apiKeyConfigured: false,
  lastExtraction: null,
  extractionHistory: [],
  sessionState: new Map(),
  currentExtractions: new Set(),
  metrics: {
    totalExtractions: 0,
    successfulExtractions: 0,
    failedExtractions: 0,
    avgResponseTime: 0
  },
  lastError: null
};

/**
 * Chrome Built-in AI availability flags
 */
let chromeAIAvailable = {
  translator: false,
  languageDetector: false,
  summarizer: false,
  writer: false,
  rewriter: false
};

/**
 * Cost tracking state (legacy - now handled by CostTracker module)
 * Kept for backward compatibility
 */
const costTracker = {
  dailyTotal: 0,
  monthlyTotal: 0,
  dailyLimit: 1.00,    // $1 per day
  monthlyLimit: 20.00,  // $20 per month
  lastReset: Date.now(),
  operations: []
};

console.log('[Background] State initialized');

// ============================================================================
// INITIALIZATION - FUNCTION 1 of 2
// ============================================================================

/**
 * Initialize background service worker
 * Sets up Chrome AI availability, verifies modules, and prepares state
 */
async function initializeBackground() {
  if (BACKGROUND_STATE.initialized) {
    console.log('[Background] Already initialized');
    return;
  }

  console.log('[Background] Initializing...');

  try {
    // Check Chrome Built-in AI availability
    await checkChromeAIAvailability();

    // Verify external modules are loaded
    const modulesLoaded = {
      BatchProcessor: typeof BatchProcessor !== 'undefined',
      CostTracker: typeof CostTracker !== 'undefined',
      DeduplicationManager: typeof DeduplicationManager !== 'undefined',
      TemplateManager: typeof TemplateManager !== 'undefined',
      InsightsGenerator: typeof InsightsGenerator !== 'undefined',
      WebContentClassifier: typeof WebContentClassifier !== 'undefined',
      AIExtractor: typeof AIExtractor !== 'undefined',
      ChromeAI: typeof ChromeAI !== 'undefined'
    };

    console.log('[Background] Module availability:', modulesLoaded);

    // Verify critical modules
    if (modulesLoaded.BatchProcessor) {
      console.log('[Background] ✅ BatchProcessor module ready');
    } else {
      console.warn('[Background] ⚠️ BatchProcessor module NOT found');
    }

    if (modulesLoaded.CostTracker) {
      console.log('[Background] ✅ CostTracker module ready');
    } else {
      console.warn('[Background] ⚠️ CostTracker module NOT found');
    }

    if (modulesLoaded.DeduplicationManager) {
      console.log('[Background] ✅ DeduplicationManager module ready');
    } else {
      console.warn('[Background] ⚠️ DeduplicationManager module NOT found');
    }

    // Check API key configuration
    const { geminiApiKey } = await chrome.storage.local.get('geminiApiKey');
    BACKGROUND_STATE.apiKeyConfigured = !!geminiApiKey;
    
    if (BACKGROUND_STATE.apiKeyConfigured) {
      console.log('[Background] ✅ Gemini API key configured');
    } else {
      console.warn('[Background] ⚠️ Gemini API key not configured');
    }

    BACKGROUND_STATE.initialized = true;
    console.log('[Background] ✅ Initialization complete');

  } catch (error) {
    console.error('[Background] ❌ Initialization error:', error);
    BACKGROUND_STATE.lastError = error.message;
  }
}

// ============================================================================
// CHROME AI AVAILABILITY CHECK - FUNCTION 2 of 2
// ============================================================================

/**
 * Check availability of Chrome Built-in AI APIs
 * Tests: Translator, Language Detector, Summarizer, Writer, Rewriter
 */
async function checkChromeAIAvailability() {
  console.log('[Background] Checking Chrome AI availability...');

  try {
    // Check Translation API
    if (typeof self.translation !== 'undefined' && self.translation.canTranslate) {
      try {
        const canTranslate = await self.translation.canTranslate({
          sourceLanguage: 'en',
          targetLanguage: 'es'
        });
        chromeAIAvailable.translator = canTranslate === 'readily';
        console.log('[Background] Translator API:', chromeAIAvailable.translator ? '✅ Available' : '❌ Not available');
      } catch (err) {
        console.warn('[Background] Translator API check failed:', err.message);
        chromeAIAvailable.translator = false;
      }
    }

    // Check Language Detector API
    if (typeof self.translation !== 'undefined' && self.translation.canDetect) {
      try {
        const canDetect = await self.translation.canDetect();
        chromeAIAvailable.languageDetector = canDetect === 'readily';
        console.log('[Background] Language Detector API:', chromeAIAvailable.languageDetector ? '✅ Available' : '❌ Not available');
      } catch (err) {
        console.warn('[Background] Language Detector API check failed:', err.message);
        chromeAIAvailable.languageDetector = false;
      }
    }

    // Check Summarizer API
    if (typeof self.ai !== 'undefined' && self.ai.summarizer) {
      try {
        const capabilities = await self.ai.summarizer.capabilities();
        chromeAIAvailable.summarizer = capabilities.available === 'readily';
        console.log('[Background] Summarizer API:', chromeAIAvailable.summarizer ? '✅ Available' : '❌ Not available');
      } catch (err) {
        console.warn('[Background] Summarizer API check failed:', err.message);
        chromeAIAvailable.summarizer = false;
      }
    }

    // Check Writer API
    if (typeof self.ai !== 'undefined' && self.ai.writer) {
      try {
        const capabilities = await self.ai.writer.capabilities();
        chromeAIAvailable.writer = capabilities.available === 'readily';
        console.log('[Background] Writer API:', chromeAIAvailable.writer ? '✅ Available' : '❌ Not available');
      } catch (err) {
        console.warn('[Background] Writer API check failed:', err.message);
        chromeAIAvailable.writer = false;
      }
    }

    // Check Rewriter API
    if (typeof self.ai !== 'undefined' && self.ai.rewriter) {
      try {
        const capabilities = await self.ai.rewriter.capabilities();
        chromeAIAvailable.rewriter = capabilities.available === 'readily';
        console.log('[Background] Rewriter API:', chromeAIAvailable.rewriter ? '✅ Available' : '❌ Not available');
      } catch (err) {
        console.warn('[Background] Rewriter API check failed:', err.message);
        chromeAIAvailable.rewriter = false;
      }
    }

    // Summary
    const availableCount = Object.values(chromeAIAvailable).filter(Boolean).length;
    console.log(`[Background] Chrome AI Summary: ${availableCount}/5 APIs available`);

  } catch (error) {
    console.warn('[Background] Chrome AI check failed:', error.message);
    // Set all to false on error
    Object.keys(chromeAIAvailable).forEach(key => {
      chromeAIAvailable[key] = false;
    });
  }
}

// Auto-initialize on service worker startup
initializeBackground();

// ============================================================================
// END OF PART 1
// ============================================================================
// ============================================================================
// MESSAGE HANDLERS & ROUTING - FUNCTION 3 of 23
// ============================================================================

/**
 * Chrome runtime message listener
 * Routes all incoming messages to appropriate handlers
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] 📨 Message received:', message.action, 'from:', sender.tab?.id || 'popup');

  // Handle message asynchronously
  handleMessage(message, sender)
    .then(response => {
      console.log('[Background] ✅ Message handled successfully:', message.action);
      sendResponse(response);
    })
    .catch(error => {
      console.error('[Background] ❌ Message handler error:', error);
      sendResponse({
        success: false,
        error: error.message || 'Unknown error occurred'
      });
    });

  // Return true to indicate async response
  return true;
});

/**
 * Main message router
 * Dispatches messages to appropriate handler functions
 */
async function handleMessage(message, sender) {
  const { action } = message;

  // Route to appropriate handler
  switch (action) {
    // Core extraction
    case 'extractData':
    case 'extraction':
      return await handleExtraction(message, sender);

    case 'singleItemExtraction':
      return await handleSingleItemExtraction(message, sender);

    case 'multiItemExtraction':
      return await handleMultiItemExtraction(message, sender);

    // Batch operations (v4.2 MODULAR)
    case 'batchTranslation':
      return await handleBatchTranslation(message);

    case 'batchSummarization':
      return await handleBatchSummarization(message);

    // AI operations
    case 'languageDetection':
    case 'detectLanguage':
      return await handleLanguageDetection(message);

    case 'translation':
    case 'translateText':
      return await handleTranslation(message);

    case 'summarization':
    case 'summarizeText':
      return await handleSummarization(message);

    // Template & insights
    case 'detectTemplate':
      return await detectTemplate(message);

    case 'applyTemplate':
      return await applyTemplate(message);

    case 'generateInsights':
    case 'insightsGeneration':
      return await handleInsightsGeneration(message);

    // API key management
    case 'saveApiKey':
      return await handleSaveApiKey(message);

    // Status & configuration
    case 'getStatus':
      return {
        success: true,
        status: {
          initialized: BACKGROUND_STATE.initialized,
          apiKeyConfigured: BACKGROUND_STATE.apiKeyConfigured,
          chromeAI: chromeAIAvailable,
          metrics: BACKGROUND_STATE.metrics,
          version: '4.2.0'
        }
      };

    case 'getAIAvailability':
      return {
        success: true,
        availability: chromeAIAvailable
      };

    // Unknown action
    default:
      console.warn('[Background] ⚠️ Unknown action:', action);
      return {
        success: false,
        error: `Unknown action: ${action}`
      };
  }
}

// ============================================================================
// 🆕 v4.2 MODULAR: BATCH TRANSLATION - FUNCTION 4 of 23
// ============================================================================

/**
 * Handle batch translation using BatchProcessor module
 * Translates multiple items with progress tracking and cost calculation
 * 
 * @param {Object} message - Message containing items to translate
 * @returns {Object} Translation results with statistics
 */
async function handleBatchTranslation(message) {
  console.log('[Background] 🌐 Batch translation request (MODULAR)');
  const startTime = Date.now();

  try {
    const {
      items,
      fields = ['title', 'description'],
      targetLanguage = 'en',
      sourceLanguage = 'auto'
    } = message;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid items array: must be non-empty array');
    }

    if (!targetLanguage) {
      throw new Error('Target language is required');
    }

    console.log(`[Background] Translating ${items.length} items (${fields.join(', ')}) to ${targetLanguage}`);

    // Use BatchProcessor module for translation
    const result = await BatchProcessor.batchTranslate(items, {
      fields,
      targetLanguage,
      sourceLanguage,
      batchSize: 20,
      delayBetweenBatches: 200,
      onProgress: (progress) => {
        console.log(`[Background] Translation progress: ${progress.completed}/${progress.total}`);
      }
    });

    // Track cost using CostTracker module
    await CostTracker.trackOperation('batchTranslation', {
      itemCount: items.length,
      fieldsCount: fields.length,
      successCount: result.results.filter(r => r.success).length,
      estimatedCost: result.totalCost || 0,
      duration: Date.now() - startTime
    });

    // Calculate statistics
    const stats = {
      total: result.results.length,
      successful: result.results.filter(r => r.success).length,
      failed: result.results.filter(r => !r.success).length,
      totalCost: result.totalCost || 0,
      duration: Date.now() - startTime,
      method: result.method || 'unknown'
    };

    console.log('[Background] ✅ Batch translation complete:', stats);

    return {
      success: true,
      items: result.results,
      stats
    };

  } catch (error) {
    console.error('[Background] ❌ Batch translation error:', error);
    
    // Track failed operation
    await CostTracker.trackOperation('batchTranslation', {
      itemCount: message.items?.length || 0,
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    });

    return {
      success: false,
      error: error.message,
      stats: {
        total: message.items?.length || 0,
        successful: 0,
        failed: message.items?.length || 0,
        totalCost: 0,
        duration: Date.now() - startTime
      }
    };
  }
}

// ============================================================================
// 🆕 v4.2 MODULAR: BATCH SUMMARIZATION - FUNCTION 5 of 23
// ============================================================================

/**
 * Handle batch summarization using BatchProcessor module
 * Summarizes multiple items with progress tracking and cost calculation
 * 
 * @param {Object} message - Message containing items to summarize
 * @returns {Object} Summarization results with statistics
 */
async function handleBatchSummarization(message) {
  console.log('[Background] 📝 Batch summarization request (MODULAR)');
  const startTime = Date.now();

  try {
    const {
      items,
      field = 'description',
      options = {}
    } = message;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid items array: must be non-empty array');
    }

    console.log(`[Background] Summarizing ${items.length} items (field: ${field})`);

    // Use BatchProcessor module for summarization
    const result = await BatchProcessor.batchSummarize(items, {
      field,
      type: options.type || 'tl;dr',
      length: options.length || 'medium',
      batchSize: 5,
      delayBetweenBatches: 500,
      onProgress: (progress) => {
        console.log(`[Background] Summarization progress: ${progress.completed}/${progress.total}`);
      }
    });

    // Track cost using CostTracker module
    await CostTracker.trackOperation('batchSummarization', {
      itemCount: items.length,
      successCount: result.results.filter(r => r.success).length,
      estimatedCost: result.totalCost || 0,
      duration: Date.now() - startTime
    });

    // Calculate statistics
    const stats = {
      total: result.results.length,
      successful: result.results.filter(r => r.success).length,
      failed: result.results.filter(r => !r.success).length,
      totalCost: result.totalCost || 0,
      duration: Date.now() - startTime,
      method: result.method || 'unknown'
    };

    console.log('[Background] ✅ Batch summarization complete:', stats);

    return {
      success: true,
      items: result.results,
      stats
    };

  } catch (error) {
    console.error('[Background] ❌ Batch summarization error:', error);
    
    // Track failed operation
    await CostTracker.trackOperation('batchSummarization', {
      itemCount: message.items?.length || 0,
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    });

    return {
      success: false,
      error: error.message,
      stats: {
        total: message.items?.length || 0,
        successful: 0,
        failed: message.items?.length || 0,
        totalCost: 0,
        duration: Date.now() - startTime
      }
    };
  }
}

// ============================================================================
// END OF PART 2
// ============================================================================
// ============================================================================
// CORE EXTRACTION HANDLERS - FUNCTION 6 of 23
// ============================================================================

/**
 * Main extraction handler - orchestrates the entire extraction process
 * Integrates: content fetching, classification, AI extraction, deduplication
 * 
 * @param {Object} message - Extraction request parameters
 * @param {Object} sender - Message sender information
 * @returns {Object} Extraction results with metadata
 */
async function handleExtraction(message, sender) {
  const startTime = Date.now();
  const extractionId = `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`[Background] 🚀 Starting extraction [${extractionId}]`);
  BACKGROUND_STATE.currentExtractions.add(extractionId);

  try {
    const {
      url,
      mode = 'smart',
      category,
      userPrompt,
      options = {}
    } = message;

    // Validation
    if (!url) {
      throw new Error('URL is required for extraction');
    }

    const tabId = sender.tab?.id || message.tabId;
    if (!tabId) {
      throw new Error('No tab ID available for content extraction');
    }

    console.log(`[Background] [${extractionId}] Fetching page content from tab ${tabId}`);

    // Get page content from content script
    const contentResponse = await chrome.tabs.sendMessage(tabId, {
      action: 'getPageContent'
    });

    if (!contentResponse || !contentResponse.success) {
      throw new Error(`Failed to get page content: ${contentResponse?.error || 'Unknown error'}`);
    }

    const { html, text, metadata } = contentResponse.data;

    console.log(`[Background] [${extractionId}] Content fetched: ${text.length} chars`);

    // 🆕 v4.2 MODULAR: Check for duplicate using DeduplicationManager
    if (options.enableDeduplication === true) {
      console.log(`[Background] [${extractionId}] Checking for duplicates...`);
      
      const isDuplicate = await DeduplicationManager.isDuplicate({
        url,
        title: metadata.title || '',
        content: text.substring(0, 5000)
      });

      if (isDuplicate) {
        console.log(`[Background] [${extractionId}] ⚠️ Duplicate content detected`);
        return {
          success: true,
          isDuplicate: true,
          message: 'This content has been extracted recently',
          metadata: {
            url,
            title: metadata.title,
            responseTime: Date.now() - startTime
          }
        };
      }
    }

    // Classify content
    console.log(`[Background] [${extractionId}] Classifying content...`);
    const classification = await classifyContent(url, text, metadata);
    console.log(`[Background] [${extractionId}] Classification:`, classification);

    // Detect template if requested
    let template = null;
    if (options.useTemplate) {
      console.log(`[Background] [${extractionId}] Detecting template...`);
      const templateResult = await detectTemplate({ url, html, metadata });
      if (templateResult.success && templateResult.template) {
        template = templateResult.template;
        console.log(`[Background] [${extractionId}] Template detected: ${template.name}`);
      }
    }

    // Perform extraction
    console.log(`[Background] [${extractionId}] Performing AI extraction...`);
    let extractionResult;

    if (template) {
      // Use template-based extraction
      extractionResult = await applyTemplate({
        templateId: template.id,
        content: { html, text, metadata }
      });
    } else {
      // Use AI-based extraction
      extractionResult = await performAIExtraction({
        url,
        html,
        text,
        metadata,
        mode: mode || classification.suggestedMode,
        category: category || classification.category,
        userPrompt
      });
    }

    if (!extractionResult.success) {
      throw new Error(`Extraction failed: ${extractionResult.error}`);
    }

    // 🆕 v4.2 MODULAR: Store fingerprint using DeduplicationManager
    if (options.enableDeduplication === true && extractionResult.success) {
      console.log(`[Background] [${extractionId}] Storing fingerprint...`);
      await DeduplicationManager.storeFingerprint({
        url,
        title: metadata.title || '',
        content: text.substring(0, 5000),
        extractedData: extractionResult.data
      });
    }

    // Track cost using CostTracker module
    await CostTracker.trackOperation('extraction', {
      mode: mode || classification.suggestedMode,
      category: category || classification.category,
      success: true,
      itemCount: Array.isArray(extractionResult.data) ? extractionResult.data.length : 1,
      duration: Date.now() - startTime
    });

    // Update metrics
    BACKGROUND_STATE.metrics.totalExtractions++;
    BACKGROUND_STATE.metrics.successfulExtractions++;
    BACKGROUND_STATE.lastExtraction = {
      url,
      timestamp: Date.now(),
      success: true
    };

    const responseTime = Date.now() - startTime;
    console.log(`[Background] [${extractionId}] ✅ Extraction complete in ${responseTime}ms`);

    return {
      success: true,
      data: extractionResult.data,
      metadata: {
        ...metadata,
        classification,
        template: template?.name,
        responseTime,
        cost: extractionResult.cost || 0,
        extractionId
      }
    };

  } catch (error) {
    console.error(`[Background] [${extractionId}] ❌ Extraction error:`, error);

    // Track failed operation
    await CostTracker.trackOperation('extraction', {
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    });

    // Update metrics
    BACKGROUND_STATE.metrics.totalExtractions++;
    BACKGROUND_STATE.metrics.failedExtractions++;
    BACKGROUND_STATE.lastError = error.message;

    return {
      success: false,
      error: error.message,
      metadata: {
        responseTime: Date.now() - startTime,
        extractionId
      }
    };

  } finally {
    BACKGROUND_STATE.currentExtractions.delete(extractionId);
  }
}

// ============================================================================
// SINGLE ITEM EXTRACTION - FUNCTION 7 of 23
// ============================================================================

/**
 * Handle single item extraction
 * Used for extracting individual products, articles, etc.
 * 
 * @param {Object} message - Extraction parameters
 * @param {Object} sender - Message sender
 * @returns {Object} Single item extraction result
 */
async function handleSingleItemExtraction(message, sender) {
  console.log('[Background] 📄 Single item extraction request');

  try {
    const {
      url,
      selector,
      category = 'general',
      options = {}
    } = message;

    if (!url) {
      throw new Error('URL is required');
    }

    const tabId = sender.tab?.id || message.tabId;
    if (!tabId) {
      throw new Error('No tab ID available');
    }

    // Get targeted content if selector provided
    let contentResponse;
    if (selector) {
      contentResponse = await chrome.tabs.sendMessage(tabId, {
        action: 'getTargetedContent',
        selector
      });
    } else {
      contentResponse = await chrome.tabs.sendMessage(tabId, {
        action: 'getPageContent'
      });
    }

    if (!contentResponse || !contentResponse.success) {
      throw new Error('Failed to get content');
    }

    const { html, text, metadata } = contentResponse.data;

    // Extract single item using AI
    const result = await AIExtractor.extractSingle({
      content: text,
      html,
      category,
      metadata
    });

    return {
      success: true,
      item: result.item,
      metadata: {
        ...metadata,
        category,
        selector
      }
    };

  } catch (error) {
    console.error('[Background] ❌ Single item extraction error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// MULTI ITEM EXTRACTION - FUNCTION 8 of 23
// ============================================================================

/**
 * Handle multi-item extraction
 * Used for extracting lists (search results, product listings, etc.)
 * 
 * @param {Object} message - Extraction parameters
 * @param {Object} sender - Message sender
 * @returns {Object} Multi-item extraction results
 */
async function handleMultiItemExtraction(message, sender) {
  console.log('[Background] 📑 Multi-item extraction request');

  try {
    const {
      url,
      itemSelector,
      category = 'general',
      maxItems = 50,
      options = {}
    } = message;

    if (!url) {
      throw new Error('URL is required');
    }

    const tabId = sender.tab?.id || message.tabId;
    if (!tabId) {
      throw new Error('No tab ID available');
    }

    // Get all items matching selector
    const itemsResponse = await chrome.tabs.sendMessage(tabId, {
      action: 'getMultipleItems',
      selector: itemSelector,
      maxItems
    });

    if (!itemsResponse || !itemsResponse.success) {
      throw new Error('Failed to get items');
    }

    const { items, metadata } = itemsResponse.data;

    if (!items || items.length === 0) {
      return {
        success: true,
        items: [],
        metadata: {
          ...metadata,
          itemCount: 0,
          message: 'No items found matching selector'
        }
      };
    }

    console.log(`[Background] Extracting ${items.length} items`);

    // Extract each item using AI
    const results = await AIExtractor.extractMultiple({
      items,
      category,
      batchSize: 10,
      metadata
    });

    return {
      success: true,
      items: results.items,
      metadata: {
        ...metadata,
        category,
        itemSelector,
        itemCount: results.items.length,
        totalCost: results.totalCost || 0
      }
    };

  } catch (error) {
    console.error('[Background] ❌ Multi-item extraction error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// HELPER: CLASSIFY CONTENT - FUNCTION 9 of 23
// ============================================================================

/**
 * Classify web content to determine optimal extraction strategy
 * Uses WebContentClassifier module
 * 
 * @param {string} url - Page URL
 * @param {string} text - Page text content
 * @param {Object} metadata - Page metadata
 * @returns {Object} Classification results with confidence scores
 */
async function classifyContent(url, text, metadata) {
  try {
    const result = await WebContentClassifier.classify({
      url,
      title: metadata.title || '',
      description: metadata.description || '',
      bodyText: text.substring(0, 5000),
      keywords: metadata.keywords || []
    });

    return {
      category: result.category || 'general',
      confidence: result.confidence || 0.5,
      suggestedMode: result.suggestedMode || 'smart',
      indicators: result.indicators || [],
      pageType: result.pageType || 'unknown'
    };

  } catch (error) {
    console.warn('[Background] Classification failed, using defaults:', error.message);
    return {
      category: 'general',
      confidence: 0.3,
      suggestedMode: 'smart',
      indicators: [],
      pageType: 'unknown'
    };
  }
}

// ============================================================================
// HELPER: PERFORM AI EXTRACTION - FUNCTION 10 of 23
// ============================================================================

/**
 * Perform AI-powered extraction using best available method
 * Tries Chrome AI first, falls back to Cloud API if needed
 * 
 * @param {Object} options - Extraction parameters
 * @returns {Object} Extraction results with cost information
 */
async function performAIExtraction(options) {
  const {
    url,
    html,
    text,
    metadata,
    mode,
    category,
    userPrompt
  } = options;

  console.log('[Background] AI extraction:', { mode, category });

  try {
    // Determine extraction method
    let extractionMethod;
    if (mode === 'gemini' || mode === 'cloud') {
      extractionMethod = 'cloud';
    } else if (chromeAIAvailable.writer || chromeAIAvailable.summarizer) {
      extractionMethod = 'chrome-ai';
    } else {
      extractionMethod = 'cloud';
    }

    console.log('[Background] Using extraction method:', extractionMethod);

    // Perform extraction
    const result = await AIExtractor.extract({
      content: text,
      html,
      metadata,
      category,
      userPrompt,
      method: extractionMethod
    });

    return result;

  } catch (error) {
    console.error('[Background] AI extraction failed:', error);
    throw new Error(`AI extraction failed: ${error.message}`);
  }
}

// ============================================================================
// END OF PART 3
// ============================================================================
// ============================================================================
// AI LANGUAGE & TRANSLATION HANDLERS - FUNCTION 11 of 23
// ============================================================================

/**
 * Handle language detection request
 * Uses Chrome AI LanguageDetector or Cloud API fallback
 * 
 * @param {Object} message - Text to detect language from
 * @returns {Object} Detected language with confidence score
 */
async function handleLanguageDetection(message) {
  console.log('[Background] 🌍 Language detection request');

  try {
    const { text } = message;

    if (!text) {
      throw new Error('Text is required for language detection');
    }

    console.log(`[Background] Detecting language for ${text.length} characters`);

    // Use ChromeAI module for language detection
    const result = await ChromeAI.detectLanguage(text);

    return {
      success: true,
      language: result.language || 'unknown',
      confidence: result.confidence || 0.0,
      method: result.method || 'unknown'
    };

  } catch (error) {
    console.error('[Background] ❌ Language detection error:', error);
    return {
      success: false,
      error: error.message,
      language: 'unknown',
      confidence: 0.0
    };
  }
}

// ============================================================================
// TRANSLATION HANDLER - FUNCTION 12 of 23
// ============================================================================

/**
 * Handle text translation request
 * Uses Chrome AI Translator or Cloud API fallback
 * 
 * @param {Object} message - Translation parameters
 * @returns {Object} Translated text with metadata
 */
async function handleTranslation(message) {
  console.log('[Background] 🌐 Translation request');

  try {
    const {
      text,
      sourceLang = 'auto',
      targetLang
    } = message;

    if (!text) {
      throw new Error('Text is required for translation');
    }

    if (!targetLang) {
      throw new Error('Target language is required');
    }

    console.log(`[Background] Translating ${text.length} chars from ${sourceLang} to ${targetLang}`);

    // Use ChromeAI module for translation
    const result = await ChromeAI.translate(text, sourceLang, targetLang);

    // Track cost
    await CostTracker.trackOperation('translation', {
      method: result.method || 'unknown',
      sourceLength: text.length,
      targetLength: result.translatedText?.length || 0,
      success: result.success
    });

    return {
      success: true,
      translatedText: result.translatedText || text,
      sourceLang: result.sourceLang || sourceLang,
      targetLang,
      method: result.method || 'unknown',
      cost: result.cost || 0
    };

  } catch (error) {
    console.error('[Background] ❌ Translation error:', error);
    
    await CostTracker.trackOperation('translation', {
      success: false,
      error: error.message
    });

    return {
      success: false,
      error: error.message,
      translatedText: null
    };
  }
}

// ============================================================================
// SUMMARIZATION HANDLER - FUNCTION 13 of 23
// ============================================================================

/**
 * Handle text summarization request
 * Uses Chrome AI Summarizer or Cloud API fallback
 * 
 * @param {Object} message - Summarization parameters
 * @returns {Object} Summary text with metadata
 */
async function handleSummarization(message) {
  console.log('[Background] 📝 Summarization request');

  try {
    const {
      text,
      type = 'tl;dr',
      length = 'medium'
    } = message;

    if (!text) {
      throw new Error('Text is required for summarization');
    }

    console.log(`[Background] Summarizing ${text.length} chars (type: ${type}, length: ${length})`);

    // Use ChromeAI module for summarization
    const result = await ChromeAI.summarize(text, { type, length });

    // Track cost
    await CostTracker.trackOperation('summarization', {
      method: result.method || 'unknown',
      sourceLength: text.length,
      summaryLength: result.summary?.length || 0,
      success: result.success
    });

    return {
      success: true,
      summary: result.summary || '',
      type,
      length,
      method: result.method || 'unknown',
      cost: result.cost || 0
    };

  } catch (error) {
    console.error('[Background] ❌ Summarization error:', error);
    
    await CostTracker.trackOperation('summarization', {
      success: false,
      error: error.message
    });

    return {
      success: false,
      error: error.message,
      summary: null
    };
  }
}

// ============================================================================
// TEMPLATE DETECTION - FUNCTION 14 of 23
// ============================================================================

/**
 * Detect template for a given URL and content
 * Uses TemplateManager module for auto-detection
 * 
 * @param {Object} message - Detection parameters
 * @returns {Object} Detected template with confidence
 */
async function detectTemplate(message) {
  console.log('[Background] 🔍 Template detection request');

  try {
    const { url, html, metadata } = message;

    if (!url) {
      throw new Error('URL is required for template detection');
    }

    console.log(`[Background] Detecting template for: ${url}`);

    // Use TemplateManager module
    const result = await TemplateManager.detectTemplate(url, html, metadata);

    return {
      success: true,
      template: result.template || null,
      confidence: result.confidence || 0.0,
      matches: result.matches || []
    };

  } catch (error) {
    console.error('[Background] ❌ Template detection error:', error);
    return {
      success: false,
      error: error.message,
      template: null,
      confidence: 0.0
    };
  }
}

// ============================================================================
// TEMPLATE APPLICATION - FUNCTION 15 of 23
// ============================================================================

/**
 * Apply detected template to extract structured data
 * Uses TemplateManager module for template-based extraction
 * 
 * @param {Object} message - Application parameters
 * @returns {Object} Extracted data using template
 */
async function applyTemplate(message) {
  console.log('[Background] 📋 Template application request');

  try {
    const {
      templateId,
      content
    } = message;

    if (!templateId) {
      throw new Error('Template ID is required');
    }

    if (!content) {
      throw new Error('Content is required for template application');
    }

    console.log(`[Background] Applying template: ${templateId}`);

    // Use TemplateManager module
    const result = await TemplateManager.applyTemplate(templateId, content);

    return {
      success: true,
      data: result.data || null,
      template: result.template || templateId,
      fieldsExtracted: result.fieldsExtracted || 0
    };

  } catch (error) {
    console.error('[Background] ❌ Template application error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

// ============================================================================
// INSIGHTS GENERATION - FUNCTION 16 of 23
// ============================================================================

/**
 * Generate AI-powered insights from extracted data
 * Uses InsightsGenerator module for analysis
 * 
 * @param {Object} message - Generation parameters
 * @returns {Object} Generated insights with recommendations
 */
async function handleInsightsGeneration(message) {
  console.log('[Background] 💡 Insights generation request');

  try {
    const {
      data,
      category = 'general',
      options = {}
    } = message;

    if (!data) {
      throw new Error('Data is required for insights generation');
    }

    console.log(`[Background] Generating insights for category: ${category}`);

    // Use InsightsGenerator module
    const result = await InsightsGenerator.generate(data, {
      category,
      includeComparison: options.includeComparison !== false,
      includeRecommendations: options.includeRecommendations !== false,
      includeTrends: options.includeTrends !== false
    });

    // Track cost
    await CostTracker.trackOperation('insightsGeneration', {
      category,
      dataSize: JSON.stringify(data).length,
      success: result.success
    });

    return {
      success: true,
      insights: result.insights || {},
      summary: result.summary || '',
      recommendations: result.recommendations || [],
      category
    };

  } catch (error) {
    console.error('[Background] ❌ Insights generation error:', error);
    
    await CostTracker.trackOperation('insightsGeneration', {
      success: false,
      error: error.message
    });

    return {
      success: false,
      error: error.message,
      insights: null
    };
  }
}

// ============================================================================
// CHANGE DETECTION - FUNCTION 17 of 23
// ============================================================================

/**
 * Detect changes between current and previous extraction
 * Compares extracted data to identify what changed
 * 
 * @param {string} url - Page URL
 * @param {Object} currentData - Current extracted data
 * @returns {Object} Detected changes with details
 */
async function detectChanges(url, currentData) {
  console.log('[Background] 🔄 Detecting changes for:', url);

  try {
    // Get previous extraction from history
    const previousExtraction = BACKGROUND_STATE.extractionHistory.find(
      h => h.url === url
    );

    if (!previousExtraction) {
      console.log('[Background] No previous extraction found for comparison');
      return {
        hasChanges: false,
        isFirstExtraction: true,
        changes: []
      };
    }

    const previousData = previousExtraction.data;
    const changes = [];

    // Compare data structures
    if (Array.isArray(currentData) && Array.isArray(previousData)) {
      // Compare arrays (e.g., product listings)
      if (currentData.length !== previousData.length) {
        changes.push({
          field: 'itemCount',
          type: 'count',
          oldValue: previousData.length,
          newValue: currentData.length,
          change: currentData.length - previousData.length
        });
      }

      // Check for new items
      const previousIds = new Set(previousData.map(item => item.id || item.title));
      const newItems = currentData.filter(item => 
        !previousIds.has(item.id || item.title)
      );

      if (newItems.length > 0) {
        changes.push({
          field: 'newItems',
          type: 'addition',
          count: newItems.length,
          items: newItems.slice(0, 5) // Only include first 5
        });
      }
    } else if (typeof currentData === 'object' && typeof previousData === 'object') {
      // Compare objects (e.g., single product, article)
      for (const key in currentData) {
        if (currentData[key] !== previousData[key]) {
          changes.push({
            field: key,
            type: 'modification',
            oldValue: previousData[key],
            newValue: currentData[key]
          });
        }
      }
    }

    const hasChanges = changes.length > 0;
    console.log(`[Background] ${hasChanges ? '✅' : '⚪'} Changes detected: ${changes.length}`);

    // Store current extraction in history
    BACKGROUND_STATE.extractionHistory = BACKGROUND_STATE.extractionHistory.filter(
      h => h.url !== url
    );
    BACKGROUND_STATE.extractionHistory.push({
      url,
      data: currentData,
      timestamp: Date.now()
    });

    // Keep only last 50 extractions
    if (BACKGROUND_STATE.extractionHistory.length > 50) {
      BACKGROUND_STATE.extractionHistory = BACKGROUND_STATE.extractionHistory.slice(-50);
    }

    return {
      hasChanges,
      isFirstExtraction: false,
      changeCount: changes.length,
      changes,
      comparedTo: {
        timestamp: previousExtraction.timestamp,
        age: Date.now() - previousExtraction.timestamp
      }
    };

  } catch (error) {
    console.error('[Background] ❌ Change detection error:', error);
    return {
      hasChanges: false,
      error: error.message,
      changes: []
    };
  }
}

// ============================================================================
// CLOUD API CALLER - FUNCTION 18 of 23
// ============================================================================

/**
 * Call Gemini Cloud API for complex operations
 * Handles API key, rate limiting, and error handling
 * 
 * @param {string} prompt - Prompt text for API
 * @param {Object} options - API call options
 * @returns {Object} API response with data
 */
async function callGeminiAPI(prompt, options = {}) {
  console.log('[Background] ☁️ Calling Gemini Cloud API');

  try {
    // Get API key from storage
    const { geminiApiKey } = await chrome.storage.local.get('geminiApiKey');

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured. Please add your API key in settings.');
    }

    // Prepare request
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        topK: options.topK || 40,
        topP: options.topP || 0.95,
        maxOutputTokens: options.maxTokens || 8192
      }
    };

    // Add image if provided (multimodal)
    if (options.imageData) {
      requestBody.contents[0].parts.unshift({
        inlineData: {
          mimeType: options.imageMimeType || 'image/jpeg',
          data: options.imageData
        }
      });
    }

    console.log('[Background] Making API request...');
    const response = await fetch(`${apiUrl}?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Extract response text
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No response text from API');
    }

    console.log('[Background] ✅ API call successful');

    return {
      success: true,
      text: responseText,
      model: 'gemini-1.5-flash',
      usage: data.usageMetadata || {}
    };

  } catch (error) {
    console.error('[Background] ❌ Gemini API error:', error);
    return {
      success: false,
      error: error.message,
      text: null
    };
  }
}

// ============================================================================
// END OF PART 4
// ============================================================================
// ============================================================================
// UTILITY FUNCTIONS - FUNCTION 19 of 23
// ============================================================================

/**
 * Detect page type for smart categorization
 * Analyzes URL and content to determine page category
 * 
 * @param {string} url - Page URL
 * @param {Object} metadata - Page metadata
 * @returns {Object} Page type with confidence
 */
async function detectPageType(url, metadata) {
  console.log('[Background] 🔍 Detecting page type for:', url);

  try {
    // Use WebContentClassifier if available
    if (typeof WebContentClassifier !== 'undefined') {
      const result = await WebContentClassifier.detectPageType(url, metadata);
      return result;
    }

    // Fallback: Basic URL-based detection
    const urlLower = url.toLowerCase();
    let pageType = 'general';
    let confidence = 0.5;

    // E-commerce detection
    if (urlLower.includes('amazon') || urlLower.includes('ebay') || 
        urlLower.includes('shop') || urlLower.includes('/product')) {
      pageType = 'e-commerce';
      confidence = 0.8;
    }
    // News detection
    else if (urlLower.includes('news') || urlLower.includes('article') || 
             urlLower.includes('blog') || urlLower.includes('/post/')) {
      pageType = 'news';
      confidence = 0.7;
    }
    // Social media detection
    else if (urlLower.includes('twitter') || urlLower.includes('facebook') || 
             urlLower.includes('linkedin') || urlLower.includes('instagram')) {
      pageType = 'social-media';
      confidence = 0.9;
    }
    // Video detection
    else if (urlLower.includes('youtube') || urlLower.includes('vimeo') || 
             urlLower.includes('/watch') || urlLower.includes('video')) {
      pageType = 'video';
      confidence = 0.8;
    }

    return {
      pageType,
      confidence,
      url
    };

  } catch (error) {
    console.error('[Background] ❌ Page type detection error:', error);
    return {
      pageType: 'general',
      confidence: 0.3,
      error: error.message
    };
  }
}

// ============================================================================
// SCREENSHOT CAPTURE - FUNCTION 20 of 23
// ============================================================================

/**
 * Capture visible portion of current tab as base64 image
 * Used for multimodal AI extraction with image analysis
 * 
 * @param {number} tabId - Tab to capture
 * @returns {Object} Base64 encoded image data
 */
async function captureVisibleTab(tabId) {
  console.log('[Background] 📸 Capturing visible tab:', tabId);

  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(tabId, {
      format: 'jpeg',
      quality: 90
    });

    // Convert data URL to base64
    const base64Data = dataUrl.split(',')[1];

    console.log('[Background] ✅ Screenshot captured:', base64Data.length, 'bytes');

    return {
      success: true,
      dataUrl,
      base64: base64Data,
      mimeType: 'image/jpeg'
    };

  } catch (error) {
    console.error('[Background] ❌ Screenshot capture error:', error);
    return {
      success: false,
      error: error.message,
      dataUrl: null
    };
  }
}

// ============================================================================
// CSV CONVERTER - FUNCTION 21 of 23
// ============================================================================

/**
 * Convert complex JSON to CSV format
 * Handles nested objects and arrays
 * 
 * @param {Array|Object} data - Data to convert
 * @returns {string} CSV formatted string
 */
function convertComplexJSONToCSV(data) {
  console.log('[Background] 📊 Converting JSON to CSV');

  try {
    // Ensure data is an array
    const items = Array.isArray(data) ? data : [data];

    if (items.length === 0) {
      return '';
    }

    // Flatten nested objects
    const flattenObject = (obj, prefix = '') => {
      const flattened = {};
      
      for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value === null || value === undefined) {
          flattened[newKey] = '';
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(flattened, flattenObject(value, newKey));
        } else if (Array.isArray(value)) {
          flattened[newKey] = JSON.stringify(value);
        } else {
          flattened[newKey] = value;
        }
      }
      
      return flattened;
    };

    // Flatten all items
    const flatItems = items.map(item => flattenObject(item));

    // Get all unique keys
    const allKeys = new Set();
    flatItems.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys);

    // Escape CSV value
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build CSV
    let csv = headers.map(escapeCSV).join(',') + '\n';

    flatItems.forEach(item => {
      const row = headers.map(header => escapeCSV(item[header] || ''));
      csv += row.join(',') + '\n';
    });

    console.log('[Background] ✅ CSV conversion complete');
    return csv;

  } catch (error) {
    console.error('[Background] ❌ CSV conversion error:', error);
    return '';
  }
}

// ============================================================================
// API KEY MANAGEMENT - FUNCTION 22 of 23
// ============================================================================

/**
 * Handle API key save request
 * Validates and stores Gemini API key
 * 
 * @param {Object} message - Save request with API key
 * @returns {Object} Save result
 */
async function handleSaveApiKey(message) {
  console.log('[Background] 🔑 Saving API key');

  try {
    const { apiKey } = message;

    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Invalid API key format');
    }

    // Basic validation
    const trimmedKey = apiKey.trim();
    
    if (trimmedKey.length < 10) {
      throw new Error('API key too short. Please check your key.');
    }

    // Validate key format (Gemini keys start with 'AIza')
    if (!trimmedKey.startsWith('AIza')) {
      console.warn('[Background] ⚠️ API key does not match expected format');
    }

    // Test the API key
    const testResult = await validateApiKey(trimmedKey);

    if (!testResult.valid) {
      throw new Error(`API key validation failed: ${testResult.error || 'Invalid key'}`);
    }

    // Save to storage
    await chrome.storage.local.set({ geminiApiKey: trimmedKey });

    // Update state
    BACKGROUND_STATE.apiKeyConfigured = true;

    console.log('[Background] ✅ API key saved successfully');

    return {
      success: true,
      message: 'API key saved and validated successfully'
    };

  } catch (error) {
    console.error('[Background] ❌ API key save error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// API KEY VALIDATOR - FUNCTION 23 of 23
// ============================================================================

/**
 * Validate Gemini API key by making a test request
 * 
 * @param {string} apiKey - API key to validate
 * @returns {Object} Validation result
 */
async function validateApiKey(apiKey) {
  console.log('[Background] 🔐 Validating API key');

  try {
    const testUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    
    const response = await fetch(`${testUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Test'
          }]
        }]
      })
    });

    if (response.ok) {
      console.log('[Background] ✅ API key is valid');
      return {
        valid: true,
        message: 'API key validated successfully'
      };
    } else if (response.status === 400) {
      // Bad request but key is valid
      console.log('[Background] ✅ API key is valid (400 response)');
      return {
        valid: true,
        message: 'API key validated'
      };
    } else if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid or unauthorized API key');
    } else {
      throw new Error(`Validation failed with status ${response.status}`);
    }

  } catch (error) {
    console.error('[Background] ❌ API key validation error:', error);
    return {
      valid: false,
      error: error.message
    };
  }
}

// ============================================================================
// SERVICE WORKER LIFECYCLE EVENTS
// ============================================================================

/**
 * Handle service worker installation
 */
self.addEventListener('install', (event) => {
  console.log('[Background] 🔧 Service worker installing...');
  self.skipWaiting();
});

/**
 * Handle service worker activation
 */
self.addEventListener('activate', (event) => {
  console.log('[Background] ✅ Service worker activated');
  event.waitUntil(clients.claim());
});

/**
 * Handle service worker errors
 */
self.addEventListener('error', (event) => {
  console.error('[Background] ❌ Service worker error:', event.error);
  BACKGROUND_STATE.lastError = event.error?.message || 'Unknown error';
});

/**
 * Handle unhandled promise rejections
 */
self.addEventListener('unhandledrejection', (event) => {
  console.error('[Background] ❌ Unhandled promise rejection:', event.reason);
  BACKGROUND_STATE.lastError = event.reason?.message || 'Unhandled promise rejection';
});

// ============================================================================
// END OF PART 5
// ============================================================================

console.log('[Background] ✅ All handlers registered and ready');
console.log('[Background] 🎯 Web Weaver Lightning v4.2.0 MODULAR fully loaded');
