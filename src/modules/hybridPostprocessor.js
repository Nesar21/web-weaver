// ═══════════════════════════════════════════════════════════════
// HYBRID AI POSTPROCESSOR (DAY 13 - PRIZE-WINNING ARCHITECTURE)
// Routes AI tasks between Chrome Built-in APIs and Gemini Cloud API
// Implements graceful degradation and intelligent fallback
// ═══════════════════════════════════════════════════════════════

console.log('[HybridAI] 🚀 Hybrid AI Postprocessor v1.0 initializing...');

// ═══════════════════════════════════════════════════════════════
// GEMINI CLOUD API FALLBACK FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Summarize text using Gemini Cloud API (fallback)
 * @param {string} text - Text to summarize
 * @param {Object} options - Summarization options
 * @returns {Promise<Object>} Summary result
 */
async function summarizeWithGeminiCloud(text, options = {}) {
  const startTime = Date.now();
  
  try {
    console.log('[HybridAI] Using Gemini Cloud API for summarization (fallback)');
    
    // Get API key from storage
    const { geminiApiKey } = await chrome.storage.local.get('geminiApiKey');
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    // Build summarization prompt
    const prompt = `Summarize the following text in 2-3 concise key points using markdown formatting:

${text}

Provide ONLY the summary, no explanations.`;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const summary = data.candidates[0].content.parts[0].text.trim();

    console.log('[HybridAI] ✅ Gemini Cloud summarization complete in', Date.now() - startTime, 'ms');

    return {
      success: true,
      summary: summary,
      originalLength: text.length,
      summaryLength: summary.length,
      compressionRatio: (summary.length / text.length * 100).toFixed(1) + '%',
      duration: Date.now() - startTime,
      source: 'gemini_cloud_fallback',
    };

  } catch (error) {
    console.error('[HybridAI] ❌ Gemini Cloud summarization failed:', error.message);
    
    return {
      success: false,
      summary: null,
      error: error.message,
      duration: Date.now() - startTime,
      source: 'gemini_cloud_error',
    };
  }
}

/**
 * Translate text using Gemini Cloud API (fallback)
 * @param {string} text - Text to translate
 * @param {Object} options - Translation options
 * @returns {Promise<Object>} Translation result
 */
async function translateWithGeminiCloud(text, options = {}) {
  const startTime = Date.now();
  
  try {
    const targetLanguage = options.targetLanguage || 'es';
    const languageNames = {
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ja: 'Japanese',
      zh: 'Chinese',
      ar: 'Arabic',
      hi: 'Hindi',
    };
    
    const targetLanguageName = languageNames[targetLanguage] || targetLanguage;
    
    console.log(`[HybridAI] Using Gemini Cloud API for translation to ${targetLanguageName} (fallback)`);
    
    // Get API key from storage
    const { geminiApiKey } = await chrome.storage.local.get('geminiApiKey');
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    // Build translation prompt
    const prompt = `Translate the following text to ${targetLanguageName}. Provide ONLY the translation, no explanations:

${text}`;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2000,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.candidates[0].content.parts[0].text.trim();

    console.log('[HybridAI] ✅ Gemini Cloud translation complete in', Date.now() - startTime, 'ms');

    return {
      success: true,
      translatedText: translatedText,
      originalText: text,
      sourceLanguage: 'en',
      targetLanguage: targetLanguage,
      originalLength: text.length,
      translatedLength: translatedText.length,
      duration: Date.now() - startTime,
      source: 'gemini_cloud_fallback',
    };

  } catch (error) {
    console.error('[HybridAI] ❌ Gemini Cloud translation failed:', error.message);
    
    return {
      success: false,
      translatedText: null,
      error: error.message,
      duration: Date.now() - startTime,
      source: 'gemini_cloud_error',
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// HYBRID SUMMARIZATION (Chrome Built-in → Cloud Fallback)
// ═══════════════════════════════════════════════════════════════

/**
 * Hybrid summarization: Try Chrome Built-in first, fall back to Gemini Cloud
 * @param {string} text - Text to summarize
 * @param {Object} options - Summarization options
 * @returns {Promise<Object>} Summary result
 */
async function hybridSummarize(text, options = {}) {
  const startTime = Date.now();
  
  console.log('[HybridAI] Starting hybrid summarization...');
  
  // Validate input
  if (!text || typeof text !== 'string' || text.length < 100) {
    console.log('[HybridAI] Text too short for summarization, skipping');
    return {
      success: false,
      summary: text,
      reason: 'TEXT_TOO_SHORT',
      duration: Date.now() - startTime,
      source: 'none',
    };
  }
  
  try {
    // STEP 1: Try Chrome Built-in Summarizer API
    if ('Summarizer' in self) {
      console.log('[HybridAI] Attempting Chrome Built-in Summarizer...');
      
      const summarizerAvailability = await Summarizer.availability();
      
      if (summarizerAvailability === 'readily' || summarizerAvailability === 'available') {
        const summarizer = await Summarizer.create({
          type: options.type || 'key-points',
          format: options.format || 'markdown',
          length: options.length || 'medium',
          sharedContext: options.context || '',
        });
        
        const summary = await summarizer.summarize(text);
        
        console.log('[HybridAI] ✅ Chrome Built-in Summarizer succeeded in', Date.now() - startTime, 'ms');
        
        return {
          success: true,
          summary: summary,
          originalLength: text.length,
          summaryLength: summary.length,
          compressionRatio: (summary.length / text.length * 100).toFixed(1) + '%',
          duration: Date.now() - startTime,
          source: 'chrome_builtin',
          method: 'on-device',
        };
      } else {
        console.log(`[HybridAI] Chrome Summarizer status: ${summarizerAvailability} (not available)`);
      }
    } else {
      console.log('[HybridAI] Chrome Summarizer API not found in browser');
    }
    
  } catch (error) {
    console.log('[HybridAI] Chrome Built-in Summarizer failed:', error.message);
  }
  
  // STEP 2: Fallback to Gemini Cloud API
  console.log('[HybridAI] Falling back to Gemini Cloud API for summarization');
  return await summarizeWithGeminiCloud(text, options);
}

// ═══════════════════════════════════════════════════════════════
// HYBRID TRANSLATION (Chrome Built-in → Cloud Fallback)
// ═══════════════════════════════════════════════════════════════

/**
 * Hybrid translation: Try Chrome Built-in first, fall back to Gemini Cloud
 * @param {string} text - Text to translate
 * @param {Object} options - Translation options
 * @returns {Promise<Object>} Translation result
 */
async function hybridTranslate(text, options = {}) {
  const startTime = Date.now();
  
  console.log('[HybridAI] Starting hybrid translation...');
  
  // Validate input
  if (!text || typeof text !== 'string') {
    return {
      success: false,
      translatedText: null,
      error: 'Invalid text input',
      duration: Date.now() - startTime,
      source: 'none',
    };
  }
  
  const sourceLanguage = options.sourceLanguage || 'en';
  const targetLanguage = options.targetLanguage;
  
  if (!targetLanguage) {
    return {
      success: false,
      translatedText: null,
      error: 'Target language required',
      duration: Date.now() - startTime,
      source: 'none',
    };
  }
  
  // Skip if source = target
  if (sourceLanguage === targetLanguage) {
    return {
      success: false,
      translatedText: text,
      reason: 'SAME_LANGUAGE',
      duration: Date.now() - startTime,
      source: 'none',
    };
  }
  
  try {
    // STEP 1: Try Chrome Built-in Translator API
    if ('Translator' in self) {
      console.log(`[HybridAI] Attempting Chrome Built-in Translator (${sourceLanguage} → ${targetLanguage})...`);
      
      const translatorAvailability = await Translator.availability({
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
      });
      
      if (translatorAvailability === 'readily' || translatorAvailability === 'available') {
        const translator = await Translator.create({
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLanguage,
        });
        
        const translatedText = await translator.translate(text);
        
        console.log('[HybridAI] ✅ Chrome Built-in Translator succeeded in', Date.now() - startTime, 'ms');
        
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
          method: 'on-device',
        };
      } else {
        console.log(`[HybridAI] Chrome Translator status: ${translatorAvailability} (not available)`);
      }
    } else {
      console.log('[HybridAI] Chrome Translator API not found in browser');
    }
    
  } catch (error) {
    console.log('[HybridAI] Chrome Built-in Translator failed:', error.message);
  }
  
  // STEP 2: Fallback to Gemini Cloud API
  console.log('[HybridAI] Falling back to Gemini Cloud API for translation');
  return await translateWithGeminiCloud(text, options);
}

// ═══════════════════════════════════════════════════════════════
// HYBRID POSTPROCESSING PIPELINE
// ═══════════════════════════════════════════════════════════════

/**
 * Process extracted data with hybrid AI (Summarize + Translate)
 * @param {Object|Array} extractedData - Data from Gemini extraction
 * @param {Object} options - Postprocessing options
 * @returns {Promise<Object|Array>} Enhanced data
 */
async function hybridPostprocess(extractedData, options = {}) {
  const startTime = Date.now();
  
  console.log('[HybridAI] 🎯 Starting hybrid postprocessing pipeline...');
  console.log('[HybridAI] Options:', {
    summarize: options.summarize,
    translate: options.translate,
    targetLanguage: options.targetLanguage,
  });
  
  // Handle both single item and multi-item data
  const isArray = Array.isArray(extractedData);
  const items = isArray ? extractedData : [extractedData];
  
  const processedItems = [];
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const enhancedItem = { ...item };
    
    console.log(`[HybridAI] Processing item ${i + 1}/${items.length}...`);
    
    // ═══════════════════════════════════════════════════════════════
    // SUMMARIZATION
    // ═══════════════════════════════════════════════════════════════
    
    if (options.summarize) {
      console.log('[HybridAI] Summarization requested');
      
      // Find long text fields to summarize
      const fieldsToSummarize = [];
      
      for (const [key, value] of Object.entries(item)) {
        if (typeof value === 'string' && value.length > 200) {
          // Skip already summarized fields
          if (!key.endsWith('_summary') && !key.endsWith('_translated')) {
            fieldsToSummarize.push({ key, value });
          }
        }
      }
      
      console.log(`[HybridAI] Found ${fieldsToSummarize.length} fields to summarize`);
      
      for (const field of fieldsToSummarize) {
        const summaryResult = await hybridSummarize(field.value, {
          type: 'key-points',
          format: 'markdown',
          length: 'medium',
        });
        
        if (summaryResult.success) {
          enhancedItem[`${field.key}_summary`] = summaryResult.summary;
          enhancedItem[`${field.key}_summary_source`] = summaryResult.source;
          console.log(`[HybridAI] ✅ Summarized '${field.key}' using ${summaryResult.source}`);
        } else {
          console.log(`[HybridAI] ⚠️ Failed to summarize '${field.key}': ${summaryResult.error || summaryResult.reason}`);
        }
      }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // TRANSLATION
    // ═══════════════════════════════════════════════════════════════
    
    if (options.translate && options.targetLanguage) {
      console.log(`[HybridAI] Translation requested (target: ${options.targetLanguage})`);
      
      // Find text fields to translate
      const fieldsToTranslate = [];
      
      for (const [key, value] of Object.entries(item)) {
        if (typeof value === 'string' && value.length > 0) {
          // Skip already translated fields and metadata
          if (!key.endsWith('_translated') && 
              !key.endsWith('_source') && 
              !key.includes('url') && 
              !key.includes('link') &&
              !key.includes('id')) {
            fieldsToTranslate.push({ key, value });
          }
        }
      }
      
      console.log(`[HybridAI] Found ${fieldsToTranslate.length} fields to translate`);
      
      for (const field of fieldsToTranslate) {
        const translationResult = await hybridTranslate(field.value, {
          sourceLanguage: 'en',
          targetLanguage: options.targetLanguage,
        });
        
        if (translationResult.success) {
          enhancedItem[`${field.key}_${options.targetLanguage}`] = translationResult.translatedText;
          enhancedItem[`${field.key}_${options.targetLanguage}_source`] = translationResult.source;
          console.log(`[HybridAI] ✅ Translated '${field.key}' using ${translationResult.source}`);
        } else {
          console.log(`[HybridAI] ⚠️ Failed to translate '${field.key}': ${translationResult.error || translationResult.reason}`);
        }
      }
    }
    
    processedItems.push(enhancedItem);
  }
  
  // Add metadata about hybrid processing
  const result = isArray ? processedItems : processedItems[0];
  
  console.log('[HybridAI] ✅ Hybrid postprocessing complete in', Date.now() - startTime, 'ms');
  
  return result;
}

// ═══════════════════════════════════════════════════════════════
// STATISTICS & REPORTING
// ═══════════════════════════════════════════════════════════════

/**
 * Get hybrid AI usage statistics
 * @returns {Promise<Object>} Usage statistics
 */
async function getHybridStats() {
  try {
    const stats = await chrome.storage.local.get('hybridAIStats');
    
    return stats.hybridAIStats || {
      totalSummarizations: 0,
      totalTranslations: 0,
      chromeBuiltinUsage: {
        summarizations: 0,
        translations: 0,
      },
      geminiCloudUsage: {
        summarizations: 0,
        translations: 0,
      },
      lastUsed: null,
    };
  } catch (error) {
    console.error('[HybridAI] Error getting stats:', error);
    return null;
  }
}

/**
 * Update hybrid AI usage statistics
 * @param {string} operation - Operation type ('summarize' or 'translate')
 * @param {string} source - Source ('chrome_builtin' or 'gemini_cloud_fallback')
 */
async function updateHybridStats(operation, source) {
  try {
    const stats = await getHybridStats();
    
    if (operation === 'summarize') {
      stats.totalSummarizations++;
      if (source === 'chrome_builtin') {
        stats.chromeBuiltinUsage.summarizations++;
      } else if (source === 'gemini_cloud_fallback') {
        stats.geminiCloudUsage.summarizations++;
      }
    } else if (operation === 'translate') {
      stats.totalTranslations++;
      if (source === 'chrome_builtin') {
        stats.chromeBuiltinUsage.translations++;
      } else if (source === 'gemini_cloud_fallback') {
        stats.geminiCloudUsage.translations++;
      }
    }
    
    stats.lastUsed = Date.now();
    
    await chrome.storage.local.set({ hybridAIStats: stats });
    
  } catch (error) {
    console.error('[HybridAI] Error updating stats:', error);
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    hybridPostprocess,
    hybridSummarize,
    hybridTranslate,
    getHybridStats,
    updateHybridStats,
  };
}
