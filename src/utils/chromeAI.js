// ═══════════════════════════════════════════════════════════════
// CHROME BUILT-IN AI WRAPPER (DAY 13 - HYBRID AI INTEGRATION)
// Provides unified interface for Summarizer API + Translator API
// Graceful degradation when APIs unavailable
// ═══════════════════════════════════════════════════════════════

console.log('[ChromeAI] 🤖 Chrome Built-in AI Wrapper v1.0 initializing...');

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const CHROME_AI_CONFIG = {
  summarizer: {
    defaultType: 'key-points',
    defaultFormat: 'markdown',
    defaultLength: 'medium',
    fallbackEnabled: true,
    minTextLength: 200, // Don't summarize short texts
  },
  translator: {
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ar', 'hi'],
    defaultSource: 'en',
    fallbackEnabled: true,
  },
  cache: {
    ttl: 300000, // 5 minutes
    maxEntries: 50,
  },
};

// ═══════════════════════════════════════════════════════════════
// CAPABILITY DETECTION
// ═══════════════════════════════════════════════════════════════

/**
 * Check if Chrome Built-in AI APIs are available
 * @returns {Promise<Object>} Availability status for each API
 */
async function checkChromeAIAvailability() {
  const status = {
    summarizer: false,
    translator: false,
    timestamp: Date.now(),
  };

  try {
    // Check Summarizer API
    if ('Summarizer' in self) {
      const summarizerAvailability = await Summarizer.availability();
      status.summarizer = summarizerAvailability === 'available' || summarizerAvailability === 'readily';
      console.log('[ChromeAI] Summarizer API status:', summarizerAvailability);
    } else {
      console.warn('[ChromeAI] ⚠️ Summarizer API not found in browser');
    }

    // Check Translator API
    if ('Translator' in self) {
      const translatorAvailability = await Translator.availability({
        sourceLanguage: 'en',
        targetLanguage: 'es',
      });
      status.translator = translatorAvailability === 'available' || translatorAvailability === 'readily';
      console.log('[ChromeAI] Translator API status:', translatorAvailability);
    } else {
      console.warn('[ChromeAI] ⚠️ Translator API not found in browser');
    }
  } catch (error) {
    console.error('[ChromeAI] ❌ Error checking API availability:', error);
  }

  return status;
}

// ═══════════════════════════════════════════════════════════════
// SUMMARIZER API WRAPPER
// ═══════════════════════════════════════════════════════════════

/**
 * Summarize text using Chrome's built-in Summarizer API
 * @param {string} text - Text to summarize
 * @param {Object} options - Summarization options
 * @returns {Promise<Object>} Summary result
 */
async function summarizeText(text, options = {}) {
  const startTime = Date.now();
  
  try {
    // Validate input
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input for summarization');
    }

    // Skip summarization for short texts
    if (text.length < CHROME_AI_CONFIG.summarizer.minTextLength) {
      console.log('[ChromeAI] Text too short for summarization, returning original');
      return {
        success: false,
        summary: text,
        originalLength: text.length,
        reason: 'TEXT_TOO_SHORT',
        duration: Date.now() - startTime,
        source: 'none',
      };
    }

    // Check API availability
    if (!('Summarizer' in self)) {
      throw new Error('Summarizer API not available in browser');
    }

    const summarizerAvailability = await Summarizer.availability();
    if (summarizerAvailability !== 'readily' && summarizerAvailability !== 'available') {
      throw new Error(`Summarizer API status: ${summarizerAvailability}`);
    }

    // Create summarizer with options
    const summarizerOptions = {
      type: options.type || CHROME_AI_CONFIG.summarizer.defaultType,
      format: options.format || CHROME_AI_CONFIG.summarizer.defaultFormat,
      length: options.length || CHROME_AI_CONFIG.summarizer.defaultLength,
      sharedContext: options.context || '',
    };

    console.log('[ChromeAI] Creating summarizer with options:', summarizerOptions);
    const summarizer = await Summarizer.create(summarizerOptions);

    // Generate summary
    const summary = await summarizer.summarize(text, {
      context: options.additionalContext || '',
    });

    console.log('[ChromeAI] ✅ Summarization complete in', Date.now() - startTime, 'ms');

    return {
      success: true,
      summary: summary,
      originalLength: text.length,
      summaryLength: summary.length,
      compressionRatio: (summary.length / text.length * 100).toFixed(1) + '%',
      duration: Date.now() - startTime,
      type: summarizerOptions.type,
      format: summarizerOptions.format,
      length: summarizerOptions.length,
      source: 'chrome_builtin',
    };

  } catch (error) {
    console.error('[ChromeAI] ❌ Summarization failed:', error.message);
    
    // Return failure status for graceful degradation
    return {
      success: false,
      summary: null,
      originalLength: text.length,
      error: error.message,
      fallback: true,
      duration: Date.now() - startTime,
      source: 'chrome_unavailable',
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// TRANSLATOR API WRAPPER
// ═══════════════════════════════════════════════════════════════

/**
 * Translate text using Chrome's built-in Translator API
 * @param {string} text - Text to translate
 * @param {Object} options - Translation options
 * @returns {Promise<Object>} Translation result
 */
async function translateText(text, options = {}) {
  const startTime = Date.now();
  
  try {
    // Validate input
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input for translation');
    }

    const sourceLanguage = options.sourceLanguage || CHROME_AI_CONFIG.translator.defaultSource;
    const targetLanguage = options.targetLanguage;

    if (!targetLanguage) {
      throw new Error('Target language is required for translation');
    }

    // Skip translation if source = target
    if (sourceLanguage === targetLanguage) {
      console.log('[ChromeAI] Source and target languages identical, skipping translation');
      return {
        success: false,
        translatedText: text,
        reason: 'SAME_LANGUAGE',
        duration: Date.now() - startTime,
        source: 'none',
      };
    }

    // Check API availability
    if (!('Translator' in self)) {
      throw new Error('Translator API not available in browser');
    }

    const translatorAvailability = await Translator.availability({
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
    });

    if (translatorAvailability !== 'readily' && translatorAvailability !== 'available') {
      throw new Error(`Translation unavailable for ${sourceLanguage} → ${targetLanguage} (status: ${translatorAvailability})`);
    }

    // Create translator
    console.log(`[ChromeAI] Creating translator: ${sourceLanguage} → ${targetLanguage}`);
    const translator = await Translator.create({
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
    });

    // Translate text
    const translatedText = await translator.translate(text);

    console.log('[ChromeAI] ✅ Translation complete in', Date.now() - startTime, 'ms');

    return {
      success: true,
      translatedText: translatedText,
      originalText: text,
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      originalLength: text.length,
      translatedLength: translatedText.length,
      duration: Date.now() - startTime,
      source: 'chrome_builtin',
    };

  } catch (error) {
    console.error('[ChromeAI] ❌ Translation failed:', error.message);
    
    // Return failure status for graceful degradation
    return {
      success: false,
      translatedText: null,
      error: error.message,
      fallback: true,
      duration: Date.now() - startTime,
      source: 'chrome_unavailable',
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// BATCH PROCESSING (For Multi-Item Extractions)
// ═══════════════════════════════════════════════════════════════

/**
 * Summarize multiple texts in batch
 * @param {Array<string>} texts - Array of texts to summarize
 * @param {Object} options - Summarization options
 * @returns {Promise<Array>} Array of summary results
 */
async function summarizeBatch(texts, options = {}) {
  console.log(`[ChromeAI] Batch summarizing ${texts.length} items...`);
  
  const results = [];
  
  for (let i = 0; i < texts.length; i++) {
    try {
      const result = await summarizeText(texts[i], options);
      results.push(result);
      
      // Rate limiting: Small delay between requests
      if (i < texts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`[ChromeAI] Batch summarization failed for item ${i}:`, error);
      results.push({
        success: false,
        summary: texts[i],
        error: error.message,
        source: 'error',
      });
    }
  }
  
  return results;
}

/**
 * Translate multiple texts in batch
 * @param {Array<string>} texts - Array of texts to translate
 * @param {Object} options - Translation options
 * @returns {Promise<Array>} Array of translation results
 */
async function translateBatch(texts, options = {}) {
  console.log(`[ChromeAI] Batch translating ${texts.length} items...`);
  
  const results = [];
  
  for (let i = 0; i < texts.length; i++) {
    try {
      const result = await translateText(texts[i], options);
      results.push(result);
      
      // Rate limiting: Small delay between requests
      if (i < texts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`[ChromeAI] Batch translation failed for item ${i}:`, error);
      results.push({
        success: false,
        translatedText: texts[i],
        error: error.message,
        source: 'error',
      });
    }
  }
  
  return results;
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkChromeAIAvailability,
    summarizeText,
    translateText,
    summarizeBatch,
    translateBatch,
    CHROME_AI_CONFIG,
  };
}
