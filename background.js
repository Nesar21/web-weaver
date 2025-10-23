/**
 * Web Weaver Lightning - Background Service Worker
 * Version: 4.2.0 (v4.2 - MODULAR ARCHITECTURE)
 * 
 * 🆕 v4.2 MODULAR ENHANCEMENTS:
 * - BATCH PROCESSING: Uses BatchProcessor module for translation/summarization
 * - COST TRACKING: REMOVED (API billing handled externally per user request)
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

console.log('[Background] State initialized');

// ============================================================================
// FUNCTION 1 of 30: INITIALIZATION
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
      DeduplicationManager: typeof DeduplicationManager !== 'undefined',
      TemplateManager: typeof TemplateManager !== 'undefined',
      InsightsGenerator: typeof InsightsGenerator !== 'undefined',
      WebContentClassifier: typeof WebContentClassifier !== 'undefined',
      AIExtractor: typeof AIExtractor !== 'undefined',
      ChromeAI: typeof ChromeAI !== 'undefined'
    };

    console.log('[Background] Module availability:', modulesLoaded);

    // Verify critical modules (warnings only, no fatal errors)
    if (!modulesLoaded.BatchProcessor) {
      console.warn('[Background] ⚠️ BatchProcessor module NOT found');
    }
    if (!modulesLoaded.DeduplicationManager) {
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
// FUNCTION 2 of 30: CHROME AI AVAILABILITY CHECK
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
// FUNCTION 3 of 30: MESSAGE HANDLER & ROUTING
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

    // Batch operations (v4.2 MODULAR - CostTracker removed)
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
// FUNCTION 4 of 30: BATCH TRANSLATION (CostTracker removed)
// ============================================================================

/**
 * Handle batch translation using BatchProcessor module
 * Translates multiple items with progress tracking
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

    // Check if BatchProcessor is available
    if (typeof BatchProcessor === 'undefined') {
      throw new Error('BatchProcessor module not available');
    }

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

    // Calculate statistics
    const stats = {
      total: result.results.length,
      successful: result.results.filter(r => r.success).length,
      failed: result.results.filter(r => !r.success).length,
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

    return {
      success: false,
      error: error.message,
      stats: {
        total: message.items?.length || 0,
        successful: 0,
        failed: message.items?.length || 0,
        duration: Date.now() - startTime
      }
    };
  }
}

// ============================================================================
// FUNCTION 5 of 30: BATCH SUMMARIZATION (CostTracker removed)
// ============================================================================

/**
 * Handle batch summarization using BatchProcessor module
 * Summarizes multiple items with progress tracking
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

    // Check if BatchProcessor is available
    if (typeof BatchProcessor === 'undefined') {
      throw new Error('BatchProcessor module not available');
    }

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

    // Calculate statistics
    const stats = {
      total: result.results.length,
      successful: result.results.filter(r => r.success).length,
      failed: result.results.filter(r => !r.success).length,
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

    return {
      success: false,
      error: error.message,
      stats: {
        total: message.items?.length || 0,
        successful: 0,
        failed: message.items?.length || 0,
        duration: Date.now() - startTime
      }
    };
  }
}
// ============================================================================
// FUNCTION 6 of 30: LANGUAGE DETECTION
// ============================================================================

/**
 * Detect language of provided text
 * Uses Chrome Language Detector API with Cloud API fallback
 * 
 * @param {Object} message - Message containing text to analyze
 * @returns {Object} Detected language with confidence score
 */
async function handleLanguageDetection(message) {
  console.log('[Background] 🔍 Language detection request');
  
  try {
    const { text } = message;

    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text: must be non-empty string');
    }

    // Truncate text for detection (first 1000 chars sufficient)
    const truncatedText = text.substring(0, 1000);

    // Try Chrome Built-in Language Detector first
    if (chromeAIAvailable.languageDetector) {
      try {
        console.log('[Background] Using Chrome Language Detector API');
        
        const detector = await self.translation.createDetector();
        const results = await detector.detect(truncatedText);
        
        if (results && results.length > 0) {
          const topResult = results[0];
          
          console.log('[Background] ✅ Language detected (Chrome):', topResult.detectedLanguage);
          
          return {
            success: true,
            language: topResult.detectedLanguage,
            confidence: topResult.confidence || 0.9,
            method: 'chrome_builtin',
            alternatives: results.slice(1, 3)
          };
        }
      } catch (chromeError) {
        console.warn('[Background] Chrome Language Detector failed, falling back to Cloud API:', chromeError.message);
      }
    }

    // Fallback to Cloud API (Gemini)
    if (BACKGROUND_STATE.apiKeyConfigured) {
      console.log('[Background] Using Cloud API for language detection');
      
      const { geminiApiKey } = await chrome.storage.local.get('geminiApiKey');
      
      const prompt = `Detect the language of this text and respond with ONLY the ISO 639-1 language code (e.g., 'en', 'es', 'fr', 'de'):\n\n${truncatedText}`;
      
      const result = await callGeminiAPI(prompt, geminiApiKey, {
        temperature: 0.1,
        maxOutputTokens: 10
      });

      const detectedLanguage = result.text.trim().toLowerCase().substring(0, 2);
      
      console.log('[Background] ✅ Language detected (Cloud):', detectedLanguage);
      
      return {
        success: true,
        language: detectedLanguage,
        confidence: 0.85,
        method: 'cloud_api'
      };
    }

    throw new Error('No language detection method available');

  } catch (error) {
    console.error('[Background] ❌ Language detection error:', error);
    
    return {
      success: false,
      error: error.message,
      language: 'unknown',
      confidence: 0
    };
  }
}

// ============================================================================
// FUNCTION 7 of 30: TRANSLATION
// ============================================================================

/**
 * Translate text to target language
 * Uses Chrome Translator API with Cloud API fallback
 * 
 * @param {Object} message - Message containing text and target language
 * @returns {Object} Translated text with metadata
 */
async function handleTranslation(message) {
  console.log('[Background] 🌐 Translation request');
  
  try {
    const {
      text,
      targetLanguage,
      sourceLanguage = 'auto'
    } = message;

    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text: must be non-empty string');
    }

    if (!targetLanguage) {
      throw new Error('Target language is required');
    }

    console.log(`[Background] Translating to ${targetLanguage} (source: ${sourceLanguage})`);

    // Try Chrome Built-in Translator first
    if (chromeAIAvailable.translator) {
      try {
        console.log('[Background] Using Chrome Translator API');
        
        const translatorOptions = { targetLanguage };
        
        // Add source language if not auto-detect
        if (sourceLanguage !== 'auto') {
          translatorOptions.sourceLanguage = sourceLanguage;
        }
        
        const translator = await self.translation.createTranslator(translatorOptions);
        const translatedText = await translator.translate(text);
        
        console.log('[Background] ✅ Translation complete (Chrome)');
        
        return {
          success: true,
          translatedText,
          sourceLanguage: sourceLanguage !== 'auto' ? sourceLanguage : 'detected',
          targetLanguage,
          method: 'chrome_builtin'
        };
      } catch (chromeError) {
        console.warn('[Background] Chrome Translator failed, falling back to Cloud API:', chromeError.message);
      }
    }

    // Fallback to Cloud API (Gemini)
    if (BACKGROUND_STATE.apiKeyConfigured) {
      console.log('[Background] Using Cloud API for translation');
      
      const { geminiApiKey } = await chrome.storage.local.get('geminiApiKey');
      
      const prompt = `Translate the following text to ${targetLanguage}. Return ONLY the translated text without any explanations or additional content:\n\n${text}`;
      
      const result = await callGeminiAPI(prompt, geminiApiKey, {
        temperature: 0.3,
        maxOutputTokens: Math.min(text.length * 2, 2048)
      });

      const translatedText = result.text.trim();
      
      console.log('[Background] ✅ Translation complete (Cloud)');
      
      return {
        success: true,
        translatedText,
        sourceLanguage: sourceLanguage !== 'auto' ? sourceLanguage : 'detected',
        targetLanguage,
        method: 'cloud_api'
      };
    }

    throw new Error('No translation method available');

  } catch (error) {
    console.error('[Background] ❌ Translation error:', error);
    
    return {
      success: false,
      error: error.message,
      translatedText: message.text
    };
  }
}

// ============================================================================
// FUNCTION 8 of 30: SUMMARIZATION
// ============================================================================

/**
 * Summarize text
 * Uses Chrome Summarizer API with Cloud API fallback
 * 
 * @param {Object} message - Message containing text and summarization options
 * @returns {Object} Summary text with metadata
 */
async function handleSummarization(message) {
  console.log('[Background] 📝 Summarization request');
  
  try {
    const {
      text,
      type = 'tl;dr',
      length = 'medium',
      format = 'plain-text'
    } = message;

    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text: must be non-empty string');
    }

    console.log(`[Background] Summarizing text (type: ${type}, length: ${length})`);

    // Try Chrome Built-in Summarizer first
    if (chromeAIAvailable.summarizer) {
      try {
        console.log('[Background] Using Chrome Summarizer API');
        
        const summarizer = await self.ai.summarizer.create({
          type,
          length,
          format
        });
        
        const summary = await summarizer.summarize(text);
        
        console.log('[Background] ✅ Summarization complete (Chrome)');
        
        return {
          success: true,
          summary,
          type,
          length,
          method: 'chrome_builtin',
          originalLength: text.length,
          summaryLength: summary.length
        };
      } catch (chromeError) {
        console.warn('[Background] Chrome Summarizer failed, falling back to Cloud API:', chromeError.message);
      }
    }

    // Fallback to Cloud API (Gemini)
    if (BACKGROUND_STATE.apiKeyConfigured) {
      console.log('[Background] Using Cloud API for summarization');
      
      const { geminiApiKey } = await chrome.storage.local.get('geminiApiKey');
      
      // Map length to word count
      const lengthMap = {
        short: 50,
        medium: 100,
        long: 200
      };
      const maxWords = lengthMap[length] || 100;
      
      const prompt = `Summarize the following text in ${maxWords} words or less. Use a ${type} style. Return ONLY the summary:\n\n${text}`;
      
      const result = await callGeminiAPI(prompt, geminiApiKey, {
        temperature: 0.5,
        maxOutputTokens: maxWords * 2
      });

      const summary = result.text.trim();
      
      console.log('[Background] ✅ Summarization complete (Cloud)');
      
      return {
        success: true,
        summary,
        type,
        length,
        method: 'cloud_api',
        originalLength: text.length,
        summaryLength: summary.length
      };
    }

    throw new Error('No summarization method available');

  } catch (error) {
    console.error('[Background] ❌ Summarization error:', error);
    
    return {
      success: false,
      error: error.message,
      summary: message.text.substring(0, 200) + '...'
    };
  }
}

// ============================================================================
// FUNCTION 9 of 30: INSIGHTS GENERATION (CostTracker removed)
// ============================================================================

/**
 * Generate insights from extracted data
 * Uses InsightsGenerator module for analysis
 * 
 * @param {Object} message - Message containing data and insight type
 * @returns {Object} Generated insights with metadata
 */
async function handleInsightsGeneration(message) {
  console.log('[Background] 💡 Insights generation request (MODULAR)');
  const startTime = Date.now();

  try {
    const {
      data,
      insightType = 'summary',
      options = {}
    } = message;

    if (!data) {
      throw new Error('Data is required for insights generation');
    }

    console.log(`[Background] Generating insights (type: ${insightType})`);

    // Check if InsightsGenerator is available
    if (typeof InsightsGenerator === 'undefined') {
      throw new Error('InsightsGenerator module not available');
    }

    let insights;

    // Route to appropriate insights generator
    switch (insightType) {
      case 'summary':
        insights = await InsightsGenerator.generateSummary(data, options);
        break;
      
      case 'comparison':
        insights = await InsightsGenerator.generateComparison(data, options);
        break;
      
      case 'recommendations':
        insights = await InsightsGenerator.generateRecommendations(data, options);
        break;
      
      case 'trends':
        insights = await InsightsGenerator.generateTrends(data, options);
        break;
      
      case 'statistics':
        insights = await InsightsGenerator.generateStatistics(data, options);
        break;
      
      default:
        throw new Error(`Unknown insight type: ${insightType}`);
    }

    const duration = Date.now() - startTime;
    console.log(`[Background] ✅ Insights generated in ${duration}ms`);

    return {
      success: true,
      insights,
      insightType,
      metadata: {
        duration,
        dataSize: Array.isArray(data) ? data.length : 1,
        generatedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('[Background] ❌ Insights generation error:', error);

    return {
      success: false,
      error: error.message,
      insights: null
    };
  }
}

// ============================================================================
// FUNCTION 10 of 30: SAVE API KEY
// ============================================================================

/**
 * Save and validate Gemini API key
 * Stores key in Chrome local storage after validation
 * 
 * @param {Object} message - Message containing API key
 * @returns {Object} Save result with validation status
 */
async function handleSaveApiKey(message) {
  console.log('[Background] 🔑 Save API key request');
  
  try {
    const { apiKey } = message;

    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Invalid API key: must be non-empty string');
    }

    // Trim and validate format
    const trimmedKey = apiKey.trim();
    
    if (trimmedKey.length < 30) {
      throw new Error('API key appears to be invalid (too short)');
    }

    // Test API key with simple request
    console.log('[Background] Validating API key...');
    
    const testPrompt = 'Respond with "OK"';
    
    try {
      await callGeminiAPI(testPrompt, trimmedKey, {
        temperature: 0,
        maxOutputTokens: 5
      });
      
      console.log('[Background] ✅ API key validated successfully');
    } catch (validationError) {
      console.error('[Background] API key validation failed:', validationError);
      throw new Error('API key validation failed: ' + validationError.message);
    }

    // Save to storage
    await chrome.storage.local.set({ geminiApiKey: trimmedKey });
    BACKGROUND_STATE.apiKeyConfigured = true;

    console.log('[Background] ✅ API key saved');

    return {
      success: true,
      message: 'API key saved and validated successfully',
      keyConfigured: true
    };

  } catch (error) {
    console.error('[Background] ❌ Save API key error:', error);
    
    return {
      success: false,
      error: error.message,
      keyConfigured: false
    };
  }
}
// ============================================================================
// FUNCTION 11 of 30: TEMPLATE DETECTION
// ============================================================================

/**
 * Detect extraction template for current website
 * Uses TemplateManager module to identify suitable templates
 * 
 * @param {Object} message - Message containing URL and domain
 * @returns {Object} Detected template or null
 */
async function detectTemplate(message) {
  console.log('[Background] 🔍 Template detection request');
  
  try {
    const { url, domain } = message;

    if (!url && !domain) {
      console.log('[Background] No URL/domain provided for template detection');
      return {
        success: true,
        template: null,
        message: 'No URL provided'
      };
    }

    // Check if TemplateManager is available
    if (typeof TemplateManager === 'undefined') {
      console.warn('[Background] TemplateManager module not available');
      return {
        success: true,
        template: null,
        message: 'TemplateManager not available'
      };
    }

    // Extract domain from URL if needed
    let targetDomain = domain;
    if (!targetDomain && url) {
      try {
        const urlObj = new URL(url);
        targetDomain = urlObj.hostname;
      } catch (err) {
        console.warn('[Background] Invalid URL for template detection:', url);
        return {
          success: true,
          template: null,
          message: 'Invalid URL'
        };
      }
    }

    console.log(`[Background] Detecting template for domain: ${targetDomain}`);

    // Use TemplateManager to detect template
    const template = await TemplateManager.detectTemplate(targetDomain);

    if (template) {
      console.log('[Background] ✅ Template detected:', template.name || template.id);
      return {
        success: true,
        template,
        detected: true
      };
    } else {
      console.log('[Background] No template detected for domain');
      return {
        success: true,
        template: null,
        detected: false
      };
    }

  } catch (error) {
    console.error('[Background] ❌ Template detection error:', error);
    
    return {
      success: false,
      error: error.message,
      template: null
    };
  }
}

// ============================================================================
// FUNCTION 12 of 30: APPLY TEMPLATE (NULL-CHECK ADDED)
// ============================================================================

/**
 * Apply extraction template settings
 * Configures extraction parameters based on template
 * 
 * @param {Object} message - Message containing template or templateId
 * @returns {Object} Application result with applied settings
 */
async function applyTemplate(message) {
  console.log('[Background] 📋 Apply template request');
  
  try {
    const { template, templateId } = message;

    // ✅ NULL-CHECK ADDED: Validate template or templateId exists
    if (!template && !templateId) {
      console.log('[Background] ⚠️ No template or templateId provided, skipping application');
      return {
        success: true,
        applied: false,
        message: 'No template to apply'
      };
    }

    // Check if TemplateManager is available
    if (typeof TemplateManager === 'undefined') {
      console.warn('[Background] TemplateManager module not available');
      return {
        success: false,
        error: 'TemplateManager not available',
        applied: false
      };
    }

    let templateData;

    // Get template by ID or use provided template
    if (templateId) {
      console.log(`[Background] Loading template by ID: ${templateId}`);
      templateData = await TemplateManager.getTemplate(templateId);
      
      if (!templateData) {
        throw new Error(`Template not found: ${templateId}`);
      }
    } else {
      templateData = template;
    }

    console.log('[Background] Applying template settings:', templateData.name || 'Custom');

    // Apply template settings to storage
    const settings = {
      category: templateData.category || 'all',
      mode: templateData.mode || 'balanced',
      extractionType: templateData.extractionType || 'MULTI',
      deduplication: templateData.deduplication || false,
      translation: templateData.translation || false,
      summarization: templateData.summarization || false
    };

    await chrome.storage.local.set(settings);

    console.log('[Background] ✅ Template applied successfully');

    return {
      success: true,
      applied: true,
      template: templateData,
      settings
    };

  } catch (error) {
    console.error('[Background] ❌ Apply template error:', error);
    
    return {
      success: false,
      error: error.message,
      applied: false
    };
  }
}

// ============================================================================
// FUNCTION 13 of 30: MAIN EXTRACTION HANDLER (CostTracker removed)
// ============================================================================

/**
 * Main extraction handler - coordinates entire extraction workflow
 * Handles classification, extraction, deduplication, and post-processing
 * 
 * @param {Object} message - Message containing extraction parameters
 * @param {Object} sender - Message sender information
 * @returns {Object} Extraction results with metadata
 */
async function handleExtraction(message, sender) {
  const extractionId = `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[Background] 🚀 Starting extraction [${extractionId}]`);
  
  const startTime = Date.now();
  BACKGROUND_STATE.metrics.totalExtractions++;
  BACKGROUND_STATE.currentExtractions.add(extractionId);

  try {
    // Extract parameters from message
    const {
      mode = 'balanced',
      category = 'all',
      extractionType = 'MULTI',
      deduplication = false,
      translation = false,
      summarization = false,
      translationTarget,
      provider = 'cloud'
    } = message;

    const tabId = sender.tab?.id;
    if (!tabId) {
      throw new Error('No tab ID found - extraction must be initiated from a tab');
    }

    console.log(`[Background] [${extractionId}] Extraction config:`, {
      mode,
      category,
      extractionType,
      deduplication,
      translation,
      summarization
    });

    // Fetch page content using content script
    console.log(`[Background] [${extractionId}] Fetching page content from tab ${tabId}`);
    
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        return {
          html: document.documentElement.outerHTML,
          text: document.body.innerText,
          url: window.location.href,
          title: document.title,
          meta: {
            description: document.querySelector('meta[name="description"]')?.content || '',
            keywords: document.querySelector('meta[name="keywords"]')?.content || ''
          }
        };
      }
    });

    const pageContent = result.result;
    console.log(`[Background] [${extractionId}] Content fetched: ${pageContent.html.length} chars`);

    // Classify content using WebContentClassifier
    let classification = {
      type: extractionType,
      confidence: 0.8,
      method: 'manual'
    };

    if (typeof WebContentClassifier !== 'undefined' && typeof WebContentClassifier.classifyPage === 'function') {
      try {
        console.log(`[Background] [${extractionId}] Classifying content...`);
        
        const [classifyResult] = await chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            if (typeof WebContentClassifier !== 'undefined') {
              return WebContentClassifier.classifyPage();
            }
            return null;
          }
        });

        if (classifyResult.result) {
          classification = classifyResult.result;
          console.log(`[Background] [${extractionId}] Classification:`, classification);
        }
      } catch (classifyError) {
        console.warn(`[Background] [${extractionId}] Classification failed:`, classifyError.message);
      }
    }

    // Route to appropriate extraction handler
    let extractionResult;
    
    if (classification.type === 'MULTI_ITEM' || extractionType === 'MULTI') {
      extractionResult = await handleMultiItemExtraction({
        ...message,
        pageContent,
        classification,
        extractionId
      }, sender);
    } else {
      extractionResult = await handleSingleItemExtraction({
        ...message,
        pageContent,
        classification,
        extractionId
      }, sender);
    }

    if (!extractionResult.success) {
      throw new Error(extractionResult.error || 'Extraction failed');
    }

    let finalData = extractionResult.data;
    const metadata = extractionResult.metadata || {};

    // Post-processing: Deduplication
    if (deduplication && typeof DeduplicationManager !== 'undefined') {
      console.log(`[Background] [${extractionId}] Applying deduplication...`);
      
      try {
        const domain = new URL(pageContent.url).hostname;
        const dedupResult = await DeduplicationManager.deduplicateItems(
          Array.isArray(finalData) ? finalData : [finalData],
          domain
        );
        
        finalData = dedupResult.items;
        metadata.deduplication = {
          total: dedupResult.total,
          unique: dedupResult.unique,
          duplicates: dedupResult.duplicates
        };
        
        console.log(`[Background] [${extractionId}] Deduplication: ${dedupResult.unique}/${dedupResult.total} unique`);
      } catch (dedupError) {
        console.error(`[Background] [${extractionId}] Deduplication error:`, dedupError);
      }
    }

    // Post-processing: Translation
    if (translation && translationTarget && typeof BatchProcessor !== 'undefined') {
      console.log(`[Background] [${extractionId}] Applying translation to ${translationTarget}...`);
      
      try {
        const translationResult = await handleBatchTranslation({
          items: Array.isArray(finalData) ? finalData : [finalData],
          targetLanguage: translationTarget
        });
        
        if (translationResult.success) {
          finalData = translationResult.items;
          metadata.translation = translationResult.stats;
        }
      } catch (translationError) {
        console.error(`[Background] [${extractionId}] Translation error:`, translationError);
      }
    }

    // Post-processing: Summarization
    if (summarization && typeof BatchProcessor !== 'undefined') {
      console.log(`[Background] [${extractionId}] Applying summarization...`);
      
      try {
        const summarizationResult = await handleBatchSummarization({
          items: Array.isArray(finalData) ? finalData : [finalData]
        });
        
        if (summarizationResult.success) {
          finalData = summarizationResult.items;
          metadata.summarization = summarizationResult.stats;
        }
      } catch (summarizationError) {
        console.error(`[Background] [${extractionId}] Summarization error:`, summarizationError);
      }
    }

    // Calculate metrics
    const duration = Date.now() - startTime;
    BACKGROUND_STATE.metrics.successfulExtractions++;
    BACKGROUND_STATE.metrics.avgResponseTime = 
      (BACKGROUND_STATE.metrics.avgResponseTime * (BACKGROUND_STATE.metrics.successfulExtractions - 1) + duration) / 
      BACKGROUND_STATE.metrics.successfulExtractions;

    console.log(`[Background] [${extractionId}] ✅ Extraction complete in ${duration}ms`);

    // Store extraction in history
    BACKGROUND_STATE.lastExtraction = {
      extractionId,
      timestamp: new Date().toISOString(),
      duration,
      itemCount: Array.isArray(finalData) ? finalData.length : 1
    };

    return {
      success: true,
      data: finalData,
      metadata: {
        ...metadata,
        extractionId,
        duration,
        classification,
        timestamp: new Date().toISOString(),
        url: pageContent.url,
        title: pageContent.title
      }
    };

  } catch (error) {
    console.error(`[Background] [${extractionId}] ❌ Extraction error:`, error);
    
    BACKGROUND_STATE.metrics.failedExtractions++;
    BACKGROUND_STATE.lastError = error.message;

    return {
      success: false,
      error: error.message,
      extractionId,
      duration: Date.now() - startTime
    };
  } finally {
    BACKGROUND_STATE.currentExtractions.delete(extractionId);
  }
}

// ============================================================================
// FUNCTION 14 of 30: SINGLE ITEM EXTRACTION
// ============================================================================

/**
 * Extract single main item from page (article, product, etc.)
 * Uses AIExtractor module for intelligent extraction
 * 
 * @param {Object} message - Message containing extraction parameters
 * @param {Object} sender - Message sender information
 * @returns {Object} Extracted single item with metadata
 */
async function handleSingleItemExtraction(message, sender) {
  const { extractionId, pageContent, mode, category, provider } = message;
  
  console.log(`[Background] [${extractionId}] Single-item extraction`);

  try {
    // Check if AIExtractor is available
    if (typeof AIExtractor === 'undefined') {
      throw new Error('AIExtractor module not available');
    }

    // Get API key
    const { geminiApiKey } = await chrome.storage.local.get('geminiApiKey');
    if (!geminiApiKey && provider === 'cloud') {
      throw new Error('API key not configured');
    }

    // Use AIExtractor for extraction
    console.log(`[Background] [${extractionId}] Using AIExtractor (${provider})`);
    
    const extractionResult = await AIExtractor.extractWithGeminiDay10(
      pageContent.html,
      pageContent.text,
      {
        url: pageContent.url,
        title: pageContent.title,
        mode,
        category,
        extractionType: 'SINGLE',
        apiKey: geminiApiKey
      }
    );

    if (!extractionResult.success) {
      throw new Error(extractionResult.error || 'AI extraction failed');
    }

    console.log(`[Background] [${extractionId}] ✅ Single-item extracted`);

    return {
      success: true,
      data: extractionResult.data,
      metadata: {
        extractionType: 'SINGLE',
        confidence: extractionResult.confidence || 0.8,
        source: 'AIExtractor'
      }
    };

  } catch (error) {
    console.error(`[Background] [${extractionId}] Single-item extraction error:`, error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// FUNCTION 15 of 30: MULTI ITEM EXTRACTION
// ============================================================================

/**
 * Extract multiple items from page (product list, feed, search results)
 * Uses AIExtractor module for batch extraction
 * 
 * @param {Object} message - Message containing extraction parameters
 * @param {Object} sender - Message sender information
 * @returns {Object} Extracted items array with metadata
 */
async function handleMultiItemExtraction(message, sender) {
  const { extractionId, pageContent, mode, category, provider } = message;
  
  console.log(`[Background] [${extractionId}] Multi-item extraction`);

  try {
    // Check if AIExtractor is available
    if (typeof AIExtractor === 'undefined') {
      throw new Error('AIExtractor module not available');
    }

    // Get API key
    const { geminiApiKey } = await chrome.storage.local.get('geminiApiKey');
    if (!geminiApiKey && provider === 'cloud') {
      throw new Error('API key not configured');
    }

    // Use AIExtractor for extraction
    console.log(`[Background] [${extractionId}] Using AIExtractor (${provider})`);
    
    const extractionResult = await AIExtractor.extractWithGeminiDay10(
      pageContent.html,
      pageContent.text,
      {
        url: pageContent.url,
        title: pageContent.title,
        mode,
        category,
        extractionType: 'MULTI',
        apiKey: geminiApiKey
      }
    );

    if (!extractionResult.success) {
      throw new Error(extractionResult.error || 'AI extraction failed');
    }

    const items = Array.isArray(extractionResult.data) ? extractionResult.data : [extractionResult.data];
    
    console.log(`[Background] [${extractionId}] ✅ ${items.length} items extracted`);

    return {
      success: true,
      data: items,
      metadata: {
        extractionType: 'MULTI',
        itemCount: items.length,
        confidence: extractionResult.confidence || 0.8,
        source: 'AIExtractor'
      }
    };

  } catch (error) {
    console.error(`[Background] [${extractionId}] Multi-item extraction error:`, error);
    
    return {
      success: false,
      error: error.message
    };
  }
}
// ============================================================================
// FUNCTION 16 of 30: CALL GEMINI API (CostTracker removed)
// ============================================================================

/**
 * Make API call to Google Gemini
 * Handles request/response, error handling, and timeouts
 * 
 * @param {string} prompt - Prompt text to send to API
 * @param {string} apiKey - Gemini API key
 * @param {Object} options - Optional configuration (temperature, maxTokens, timeout)
 * @returns {Object} API response with generated text
 */
async function callGeminiAPI(prompt, apiKey, options = {}) {
  console.log('[Background] 🤖 Calling Gemini API...');
  
  try {
    const {
      model = 'gemini-2.0-flash-exp',
      temperature = 0.7,
      maxOutputTokens = 8192,
      timeout = 30000
    } = options;

    if (!apiKey) {
      throw new Error('API key is required');
    }

    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Valid prompt is required');
    }

    // Construct API URL
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Build request body
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature,
        maxOutputTokens,
        topP: 0.95,
        topK: 40
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE'
        }
      ]
    };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Make API request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Check response status
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API error ${response.status}: ${errorData}`);
      }

      // Parse response
      const data = await response.json();

      // Validate response structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid API response structure');
      }

      const generatedText = data.candidates[0].content.parts[0].text;

      console.log('[Background] ✅ Gemini API call successful');

      return {
        success: true,
        text: generatedText,
        usage: data.usageMetadata || {},
        model
      };

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error(`API request timeout after ${timeout}ms`);
      }
      
      throw fetchError;
    }

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
// FUNCTION 17 of 30: CLASSIFY CONTENT
// ============================================================================

/**
 * Classify page content to determine extraction strategy
 * Uses WebContentClassifier module with fallback heuristics
 * 
 * @param {string} html - Page HTML content
 * @param {string} text - Page text content
 * @param {string} url - Page URL
 * @returns {Object} Classification result with type and confidence
 */
async function classifyContent(html, text, url) {
  console.log('[Background] 🔍 Classifying content...');
  
  try {
    // Try WebContentClassifier if available
    if (typeof WebContentClassifier !== 'undefined' && 
        typeof WebContentClassifier.classifyPage === 'function') {
      
      try {
        const classification = WebContentClassifier.classifyPage();
        console.log('[Background] ✅ Classification (WebContentClassifier):', classification);
        return classification;
      } catch (classifierError) {
        console.warn('[Background] WebContentClassifier failed:', classifierError.message);
      }
    }

    // Fallback: Simple heuristic classification
    console.log('[Background] Using fallback heuristic classification');
    
    const domain = new URL(url).hostname.toLowerCase();
    
    // Check for known patterns
    const multiItemIndicators = [
      html.match(/<article/gi)?.length > 1,
      html.match(/class="[^"]*item[^"]*"/gi)?.length > 3,
      html.match(/class="[^"]*product[^"]*"/gi)?.length > 3,
      html.match(/class="[^"]*post[^"]*"/gi)?.length > 3,
      html.match(/<li/gi)?.length > 10
    ].filter(Boolean).length;

    const isMultiItem = multiItemIndicators >= 2;

    // Determine page type
    let pageType = 'generic';
    if (domain.includes('amazon') || domain.includes('shop') || domain.includes('store')) {
      pageType = 'ecommerce';
    } else if (domain.includes('linkedin') || domain.includes('twitter') || domain.includes('facebook')) {
      pageType = 'social';
    } else if (domain.includes('medium') || domain.includes('blog') || domain.includes('article')) {
      pageType = 'article';
    } else if (domain.includes('youtube') || domain.includes('video')) {
      pageType = 'video';
    }

    const classification = {
      type: isMultiItem ? 'MULTI_ITEM' : 'SINGLE_ITEM',
      confidence: 0.6,
      method: 'heuristic_fallback',
      pageType,
      indicators: {
        multiItem: isMultiItem,
        articleCount: html.match(/<article/gi)?.length || 0,
        listItemCount: html.match(/<li/gi)?.length || 0
      }
    };

    console.log('[Background] ✅ Classification (fallback):', classification);
    return classification;

  } catch (error) {
    console.error('[Background] ❌ Classification error:', error);
    
    // Return safe default
    return {
      type: 'SINGLE_ITEM',
      confidence: 0.5,
      method: 'error_fallback',
      error: error.message
    };
  }
}

// ============================================================================
// FUNCTION 18 of 30: DETECT PAGE TYPE
// ============================================================================

/**
 * Detect the type of page (product, article, social, etc.)
 * Uses domain and content analysis
 * 
 * @param {string} url - Page URL
 * @param {string} html - Page HTML content
 * @param {string} text - Page text content
 * @returns {string} Detected page type
 */
function detectPageType(url, html, text) {
  console.log('[Background] 🔍 Detecting page type...');
  
  try {
    const domain = new URL(url).hostname.toLowerCase();
    const htmlLower = html.toLowerCase();
    const textLower = text.toLowerCase();

    // E-commerce sites
    if (domain.includes('amazon') || 
        domain.includes('ebay') || 
        domain.includes('etsy') || 
        domain.includes('walmart') ||
        domain.includes('shop') ||
        domain.includes('store')) {
      return 'ecommerce';
    }

    // Social media
    if (domain.includes('linkedin') || 
        domain.includes('twitter') || 
        domain.includes('facebook') ||
        domain.includes('instagram') ||
        domain.includes('reddit')) {
      return 'social';
    }

    // News/Blog/Articles
    if (domain.includes('medium') || 
        domain.includes('blog') || 
        domain.includes('news') ||
        domain.includes('article') ||
        htmlLower.includes('<article') ||
        textLower.includes('published') ||
        textLower.includes('author:')) {
      return 'article';
    }

    // Job listings
    if (domain.includes('indeed') || 
        domain.includes('linkedin.com/jobs') ||
        domain.includes('glassdoor') ||
        textLower.includes('job description') ||
        textLower.includes('apply now')) {
      return 'job';
    }

    // Video
    if (domain.includes('youtube') || 
        domain.includes('vimeo') ||
        domain.includes('dailymotion') ||
        htmlLower.includes('<video')) {
      return 'video';
    }

    // Recipe sites
    if (domain.includes('recipe') || 
        domain.includes('food') ||
        textLower.includes('ingredients:') ||
        textLower.includes('instructions:')) {
      return 'recipe';
    }

    // GitHub
    if (domain.includes('github')) {
      return 'repository';
    }

    // Generic content detection
    if (htmlLower.includes('price') || 
        htmlLower.includes('add to cart') ||
        htmlLower.includes('buy now')) {
      return 'ecommerce';
    }

    // Default
    return 'generic';

  } catch (error) {
    console.warn('[Background] Page type detection error:', error);
    return 'generic';
  }
}

// ============================================================================
// FUNCTION 19 of 30: DETECT CHANGES
// ============================================================================

/**
 * Detect changes between current and previous extraction
 * Useful for pagination and dynamic content tracking
 * 
 * @param {Array} currentData - Current extraction data
 * @param {Array} previousData - Previous extraction data
 * @returns {Object} Change detection results with new/removed items
 */
async function detectChanges(currentData, previousData) {
  console.log('[Background] 🔄 Detecting changes...');
  
  try {
    // Validate inputs
    if (!currentData || !Array.isArray(currentData)) {
      console.log('[Background] No current data for change detection');
      return {
        hasChanges: false,
        newItems: currentData || [],
        removedItems: [],
        modifiedItems: [],
        unchangedItems: []
      };
    }

    if (!previousData || !Array.isArray(previousData) || previousData.length === 0) {
      console.log('[Background] No previous data, all items are new');
      return {
        hasChanges: true,
        newItems: currentData,
        removedItems: [],
        modifiedItems: [],
        unchangedItems: []
      };
    }

    // Build identifier sets for comparison
    const previousIds = new Set(previousData.map(item => {
      return item.url || item.id || item.title || JSON.stringify(item);
    }));

    const currentIds = new Set(currentData.map(item => {
      return item.url || item.id || item.title || JSON.stringify(item);
    }));

    // Find new items
    const newItems = currentData.filter(item => {
      const id = item.url || item.id || item.title || JSON.stringify(item);
      return !previousIds.has(id);
    });

    // Find removed items
    const removedItems = previousData.filter(item => {
      const id = item.url || item.id || item.title || JSON.stringify(item);
      return !currentIds.has(id);
    });

    // Find unchanged items
    const unchangedItems = currentData.filter(item => {
      const id = item.url || item.id || item.title || JSON.stringify(item);
      return previousIds.has(id);
    });

    const hasChanges = newItems.length > 0 || removedItems.length > 0;

    console.log(`[Background] Change detection: ${newItems.length} new, ${removedItems.length} removed, ${unchangedItems.length} unchanged`);

    return {
      hasChanges,
      newItems,
      removedItems,
      modifiedItems: [], // Not implemented in basic version
      unchangedItems
    };

  } catch (error) {
    console.error('[Background] ❌ Change detection error:', error);
    
    return {
      hasChanges: false,
      newItems: currentData || [],
      removedItems: [],
      modifiedItems: [],
      unchangedItems: [],
      error: error.message
    };
  }
}

// ============================================================================
// FUNCTION 20 of 30: CAPTURE VISIBLE TAB
// ============================================================================

/**
 * Capture screenshot of visible tab area
 * Used for visual AI processing and debugging
 * 
 * @returns {Object} Screenshot data URL in PNG format
 */
async function captureVisibleTab() {
  console.log('[Background] 📸 Capturing visible tab screenshot...');
  
  try {
    // Get active tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!activeTab) {
      throw new Error('No active tab found');
    }

    // Capture visible area
    const dataUrl = await chrome.tabs.captureVisibleTab(activeTab.windowId, {
      format: 'png',
      quality: 90
    });

    console.log('[Background] ✅ Screenshot captured');

    return {
      success: true,
      dataUrl,
      timestamp: new Date().toISOString(),
      tabId: activeTab.id
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
// FUNCTION 21 of 30: ESCAPE CSV
// ============================================================================

/**
 * Escape special characters for CSV format
 * Handles commas, quotes, and newlines
 * 
 * @param {*} value - Value to escape
 * @returns {string} CSV-safe escaped string
 */
function escapeCSV(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  const str = String(value);
  
  // Check if escaping is needed
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    // Escape quotes by doubling them and wrap in quotes
    return '"' + str.replace(/"/g, '""') + '"';
  }
  
  return str;
}

// ============================================================================
// FUNCTION 22 of 30: FLATTEN OBJECT
// ============================================================================

/**
 * Flatten nested object into single-level object
 * Used for CSV conversion of complex JSON structures
 * 
 * @param {Object} obj - Object to flatten
 * @param {string} prefix - Prefix for nested keys
 * @returns {Object} Flattened object
 */
function flattenObject(obj, prefix = '') {
  const flattened = {};
  
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value === null || value === undefined) {
      flattened[newKey] = '';
    } else if (Array.isArray(value)) {
      // Convert arrays to semicolon-separated strings
      flattened[newKey] = value
        .map(item => {
          if (typeof item === 'object' && item !== null) {
            return JSON.stringify(item);
          }
          return String(item);
        })
        .join('; ');
    } else if (typeof value === 'object') {
      // Recursively flatten nested objects
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  }
  
  return flattened;
}

// ============================================================================
// FUNCTION 23 of 30: CONVERT COMPLEX JSON TO CSV
// ============================================================================

/**
 * Convert JSON data to CSV format
 * Handles arrays of objects and nested structures
 * 
 * @param {Array|Object} data - JSON data to convert
 * @returns {Object} CSV string and conversion status
 */
function convertComplexJSONToCSV(data) {
  console.log('[Background] 📄 Converting JSON to CSV...');
  
  try {
    // Handle empty data
    if (!data) {
      throw new Error('No data provided for CSV conversion');
    }
    
    // Ensure data is an array
    const items = Array.isArray(data) ? data : [data];
    
    if (items.length === 0) {
      throw new Error('Empty data array');
    }
    
    // Flatten all items
    const flattenedItems = items.map(item => flattenObject(item));
    
    // Get all unique keys across all items
    const allKeys = new Set();
    flattenedItems.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });
    
    const sortedKeys = Array.from(allKeys).sort();
    
    // Build CSV header
    const header = sortedKeys.map(key => escapeCSV(key)).join(',');
    
    // Build CSV rows
    const rows = flattenedItems.map(item => {
      return sortedKeys.map(key => {
        const value = item[key];
        return escapeCSV(value);
      }).join(',');
    });
    
    // Combine header and rows
    const csv = [header, ...rows].join('\n');
    
    console.log(`[Background] ✅ CSV conversion complete: ${items.length} rows, ${sortedKeys.length} columns`);
    
    return {
      success: true,
      csv,
      stats: {
        rows: items.length,
        columns: sortedKeys.length,
        size: csv.length
      }
    };
    
  } catch (error) {
    console.error('[Background] ❌ CSV conversion error:', error);
    
    return {
      success: false,
      error: error.message,
      csv: null
    };
  }
}

// ============================================================================
// FUNCTION 24 of 30: VALIDATE API KEY
// ============================================================================

/**
 * Validate Gemini API key by making test request
 * Ensures key is valid and has required permissions
 * 
 * @param {string} apiKey - API key to validate
 * @returns {Object} Validation result with status
 */
async function validateApiKey(apiKey) {
  console.log('[Background] 🔑 Validating API key...');
  
  try {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Invalid API key format');
    }
    
    const trimmedKey = apiKey.trim();
    
    // Basic format check
    if (trimmedKey.length < 30) {
      throw new Error('API key appears to be too short');
    }
    
    // Test with simple API call
    const testPrompt = 'Respond with exactly "OK"';
    
    const result = await callGeminiAPI(testPrompt, trimmedKey, {
      temperature: 0,
      maxOutputTokens: 10,
      timeout: 10000
    });
    
    if (!result.success) {
      throw new Error(result.error || 'API key validation failed');
    }
    
    console.log('[Background] ✅ API key validated successfully');
    
    return {
      success: true,
      valid: true,
      message: 'API key is valid and working'
    };
    
  } catch (error) {
    console.error('[Background] ❌ API key validation error:', error);
    
    return {
      success: false,
      valid: false,
      error: error.message
    };
  }
}

// ============================================================================
// FUNCTION 25 of 30: PERFORM AI EXTRACTION
// ============================================================================

/**
 * Core AI extraction logic using external modules
 * Routes to appropriate extraction method (Chrome AI or Cloud API)
 * 
 * @param {Object} options - Extraction options and content
 * @returns {Object} Extraction result with data and metadata
 */
async function performAIExtraction(options) {
  console.log('[Background] 🤖 Performing AI extraction...');
  
  try {
    const {
      html,
      text,
      url,
      title,
      mode = 'balanced',
      category = 'all',
      extractionType = 'MULTI',
      provider = 'cloud',
      apiKey
    } = options;

    // Validate required fields
    if (!html && !text) {
      throw new Error('Either HTML or text content is required');
    }

    if (!url) {
      throw new Error('URL is required for extraction');
    }

    console.log(`[Background] Extraction config: ${extractionType}, ${mode}, ${category}, ${provider}`);

    // For Chrome Built-in AI (limited functionality)
    if (provider === 'chrome') {
      console.warn('[Background] Chrome AI extraction not fully implemented, falling back to Cloud API');
    }

    // Use Cloud API with AIExtractor module
    if (!apiKey) {
      throw new Error('API key is required for Cloud API extraction');
    }

    // Check if AIExtractor module is available
    if (typeof AIExtractor === 'undefined' || typeof AIExtractor.extractWithGeminiDay10 !== 'function') {
      throw new Error('AIExtractor module not available');
    }

    // Call AIExtractor
    console.log('[Background] Using AIExtractor module...');
    
    const extractionResult = await AIExtractor.extractWithGeminiDay10(
      html,
      text,
      {
        url,
        title,
        mode,
        category,
        extractionType,
        apiKey
      }
    );

    if (!extractionResult.success) {
      throw new Error(extractionResult.error || 'AI extraction failed');
    }

    console.log('[Background] ✅ AI extraction successful');

    return {
      success: true,
      data: extractionResult.data,
      metadata: {
        extractionType,
        mode,
        category,
        provider: 'cloud',
        confidence: extractionResult.confidence || 0.8,
        model: extractionResult.model || 'gemini-2.0-flash-exp',
        itemCount: Array.isArray(extractionResult.data) ? extractionResult.data.length : 1
      }
    };

  } catch (error) {
    console.error('[Background] ❌ AI extraction error:', error);
    
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}
// ============================================================================
// ARROW FUNCTIONS 26-30: UTILITY HELPERS
// ============================================================================

/**
 * FUNCTION 26 of 30: Generate error data object
 * Helper for consistent error responses in extractions
 */
const errorData = (message, extractionId = null) => ({
  success: false,
  error: message,
  extractionId,
  timestamp: new Date().toISOString(),
  data: null
});

/**
 * FUNCTION 27 of 30: Flatten nested arrays
 * Helper for data transformation in CSV conversion
 */
const flatItems = (arr) => {
  if (!Array.isArray(arr)) return [arr];
  return arr.flat(Infinity).filter(item => item !== null && item !== undefined);
};

/**
 * FUNCTION 28 of 30: Get new items from comparison
 * Helper for change detection and deduplication
 */
const newItems = (current, previous) => {
  if (!previous || !Array.isArray(previous)) return current;
  if (!current || !Array.isArray(current)) return [];
  
  const previousIds = new Set(previous.map(item => 
    item.url || item.id || item.title || JSON.stringify(item)
  ));
  
  return current.filter(item => {
    const id = item.url || item.id || item.title || JSON.stringify(item);
    return !previousIds.has(id);
  });
};

/**
 * FUNCTION 29 of 30: Extract IDs from items
 * Helper for tracking and deduplication
 */
const previousIds = (items) => {
  if (!items || !Array.isArray(items)) return new Set();
  
  return new Set(items.map(item => 
    item.url || item.id || item.title || JSON.stringify(item)
  ));
};

/**
 * FUNCTION 30 of 30: Generate CSV row
 * Helper for CSV generation from object
 */
const row = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return '';
  if (!keys || !Array.isArray(keys)) return '';
  
  return keys.map(key => {
    const value = obj[key];
    return escapeCSV(value);
  }).join(',');
};

// ============================================================================
// SERVICE WORKER LIFECYCLE EVENTS
// ============================================================================

/**
 * Handle extension installation and updates
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Background] 🔧 Extension installed/updated');
  
  const { reason, previousVersion } = details;
  
  if (reason === 'install') {
    console.log('[Background] First-time installation');
    
    // Set default settings
    chrome.storage.local.set({
      mode: 'balanced',
      category: 'all',
      extractionType: 'MULTI',
      deduplication: false,
      translation: false,
      summarization: false,
      version: '4.2.0'
    });
    
    // Open welcome page (optional)
    // chrome.tabs.create({ url: 'welcome.html' });
    
  } else if (reason === 'update') {
    console.log(`[Background] Updated from v${previousVersion} to v4.2.0`);
    
    // Handle migration if needed
    if (previousVersion && previousVersion.startsWith('4.1')) {
      console.log('[Background] Migrating from v4.1 to v4.2...');
      // Migration logic here if needed
    }
  } else if (reason === 'chrome_update') {
    console.log('[Background] Chrome browser updated');
  }
});

/**
 * Handle service worker startup
 */
chrome.runtime.onStartup.addListener(() => {
  console.log('[Background] 🚀 Service worker started (browser startup)');
  
  // Re-initialize on browser startup
  initializeBackground();
});

/**
 * Handle service worker suspend (before unload)
 */
self.addEventListener('beforeunload', () => {
  console.log('[Background] 💤 Service worker suspending...');
  
  // Cleanup any active extractions
  BACKGROUND_STATE.currentExtractions.clear();
});

/**
 * Handle extension uninstall (cleanup)
 */
chrome.runtime.setUninstallURL('https://forms.gle/feedback', () => {
  console.log('[Background] 👋 Uninstall URL set for feedback');
});

// ============================================================================
// TAB EVENT HANDLERS (Optional: for future features)
// ============================================================================

/**
 * Track tab updates for potential auto-extraction features
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only log for complete page loads
  if (changeInfo.status === 'complete' && tab.url) {
    console.log(`[Background] Tab ${tabId} updated: ${tab.url}`);
    
    // Future: Could trigger auto-extraction or template detection here
    // if (autoExtractionEnabled) {
    //   detectTemplate({ url: tab.url, domain: new URL(tab.url).hostname });
    // }
  }
});

/**
 * Track tab activation for context awareness
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log(`[Background] Tab ${activeInfo.tabId} activated`);
  
  // Store active tab for quick access
  BACKGROUND_STATE.activeTabId = activeInfo.tabId;
});

// ============================================================================
// STORAGE CHANGE LISTENER (Optional: for settings sync)
// ============================================================================

/**
 * Listen for storage changes to update state
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    console.log('[Background] Storage changed:', Object.keys(changes));
    
    // Update API key state if changed
    if (changes.geminiApiKey) {
      BACKGROUND_STATE.apiKeyConfigured = !!changes.geminiApiKey.newValue;
      console.log('[Background] API key configuration changed:', BACKGROUND_STATE.apiKeyConfigured);
    }
  }
});

// ============================================================================
// ALARM HANDLERS (Optional: for scheduled tasks)
// ============================================================================

/**
 * Create periodic cleanup alarm
 */
chrome.alarms.create('cleanup', {
  periodInMinutes: 60 // Run every hour
});

/**
 * Handle alarm events
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanup') {
    console.log('[Background] 🧹 Running periodic cleanup...');
    
    // Cleanup old extraction history
    if (BACKGROUND_STATE.extractionHistory.length > 100) {
      BACKGROUND_STATE.extractionHistory = BACKGROUND_STATE.extractionHistory.slice(-50);
      console.log('[Background] Extraction history trimmed to last 50 entries');
    }
    
    // Cleanup session state
    BACKGROUND_STATE.sessionState.clear();
    
    console.log('[Background] ✅ Cleanup complete');
  }
});

// ============================================================================
// CONTEXT MENU (Optional: for right-click extraction)
// ============================================================================

/**
 * Create context menu items (optional feature)
 */
chrome.runtime.onInstalled.addListener(() => {
  // Uncomment to enable context menu extraction
  /*
  chrome.contextMenus.create({
    id: 'extract-selection',
    title: 'Extract with Web Weaver',
    contexts: ['selection', 'page']
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'extract-selection') {
      console.log('[Background] Context menu extraction triggered');
      // Trigger extraction on current tab
      handleExtraction({ extractionType: 'SINGLE' }, { tab });
    }
  });
  */
});

// ============================================================================
// KEEP-ALIVE MECHANISM (Service Worker Persistence)
// ============================================================================

/**
 * Keep service worker alive by maintaining connection
 * Chrome service workers auto-sleep after 30 seconds of inactivity
 */
let keepAliveInterval;

function startKeepAlive() {
  // Ping every 25 seconds to prevent sleep
  keepAliveInterval = setInterval(() => {
    chrome.runtime.getPlatformInfo(() => {
      // Simple operation to keep worker alive
      if (chrome.runtime.lastError) {
        console.warn('[Background] Keep-alive ping failed');
      }
    });
  }, 25000);
}

// Start keep-alive on initialization
startKeepAlive();

// ============================================================================
// FINAL LOGGING & STATUS
// ============================================================================

console.log('[Background] ✅ All handlers registered and ready');
console.log('[Background] 🎯 Web Weaver Lightning v4.2.0 MODULAR fully loaded');
console.log('[Background] 📊 Total functions: 30');
console.log('[Background] 🚀 Status:', {
  initialized: BACKGROUND_STATE.initialized,
  apiKeyConfigured: BACKGROUND_STATE.apiKeyConfigured,
  chromeAIAvailable,
  version: '4.2.0'
});

// ============================================================================
// EXPORT FOR TESTING (if running in Node.js environment)
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Core functions
    initializeBackground,
    checkChromeAIAvailability,
    handleMessage,
    handleExtraction,
    handleSingleItemExtraction,
    handleMultiItemExtraction,
    
    // Batch operations
    handleBatchTranslation,
    handleBatchSummarization,
    
    // AI operations
    handleLanguageDetection,
    handleTranslation,
    handleSummarization,
    handleInsightsGeneration,
    
    // Template operations
    detectTemplate,
    applyTemplate,
    
    // API operations
    handleSaveApiKey,
    validateApiKey,
    callGeminiAPI,
    performAIExtraction,
    
    // Classification & detection
    classifyContent,
    detectPageType,
    detectChanges,
    captureVisibleTab,
    
    // Utilities
    escapeCSV,
    flattenObject,
    convertComplexJSONToCSV,
    
    // Arrow function helpers
    errorData,
    flatItems,
    newItems,
    previousIds,
    row
  };
}
