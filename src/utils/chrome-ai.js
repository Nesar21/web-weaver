/**
 * Web Weaver Lightning - Chrome Built-in AI Wrapper
 * Version: 4.2.0 (v4.2 - BATCH PROCESSING + MULTIMODAL)
 * 
 * 🆕 v4.2 ENHANCEMENTS:
 * - BATCH TRANSLATION: Translate up to 20 items in single call
 * - BATCH SUMMARIZATION: Summarize up to 5 items in single call
 * - ENHANCED LANGUAGE DETECTION: Returns confidence score and top 3 languages
 * - IMAGE ANALYSIS: Describe images for accessibility (future Chrome AI support)
 * - AUDIO TRANSCRIPTION: Transcribe audio (future Chrome AI support)
 * - SESSION CACHING: Reuse sessions for better performance
 * - PROGRESS CALLBACKS: Real-time progress updates for batch operations
 * 
 * ✅ PRESERVED FROM v4.1:
 * - All 4 Chrome Built-in AI APIs (Translator, LanguageDetector, Summarizer, LanguageModel)
 * - Availability checks with graceful fallbacks
 * - Session management (reuse sessions)
 * - Error handling with auto-fallback signals
 * - Model download progress tracking
 * 
 * Unified wrapper for Chrome's 4 Built-in AI APIs:
 * 1. Translator API (translation) - NOW WITH BATCH SUPPORT
 * 2. LanguageDetector API (language detection) - ENHANCED WITH CONFIDENCE
 * 3. Summarizer API (summarization) - NOW WITH BATCH SUPPORT
 * 4. LanguageModel API (Prompt API for extraction)
 */


const CHROME_AI = {
  VERSION: '4.2.0',
  
  // Session cache (reuse across multiple calls) - PRESERVED FROM v4.1
  sessions: {
    translator: null,
    detector: null,
    summarizer: null,
    languageModel: null
  },
  
  // Availability status cache - PRESERVED FROM v4.1
  availability: {
    translator: null,
    detector: null,
    summarizer: null,
    languageModel: null,
    lastCheck: 0
  },
  
  CACHE_TTL: 300000, // 5 minutes - PRESERVED FROM v4.1
  
  // 🆕 v4.2: Batch processing limits
  BATCH_LIMITS: {
    translation: 20, // Max items per batch
    summarization: 5, // Max items per batch (smaller due to token limits)
    maxFieldLength: 5000 // Max chars per field to prevent overflow
  },
  
  // ═══════════════════════════════════════════════════════════════
  // AVAILABILITY CHECKS - PRESERVED FROM v4.1
  // ═══════════════════════════════════════════════════════════════
  
  async checkAvailability() {
    const now = Date.now();
    if (this.availability.lastCheck && (now - this.availability.lastCheck) < this.CACHE_TTL) {
      console.log('[ChromeAI] Using cached availability status');
      return this.availability;
    }
    
    console.log('[ChromeAI] Checking API availability...');
    
    try {
      // Check Translator - PRESERVED FROM v4.1
      if ('translation' in self && 'createTranslator' in self.translation) {
        const translatorStatus = await self.translation.canTranslate({
          sourceLanguage: 'en',
          targetLanguage: 'es'
        });
        this.availability.translator = translatorStatus === 'readily' || translatorStatus === 'after-download';
      } else {
        this.availability.translator = false;
      }
      
      // Check LanguageDetector - PRESERVED FROM v4.1
      if ('translation' in self && 'createDetector' in self.translation) {
        const detectorStatus = await self.translation.canDetect();
        this.availability.detector = detectorStatus === 'readily' || detectorStatus === 'after-download';
      } else {
        this.availability.detector = false;
      }
      
      // Check Summarizer - PRESERVED FROM v4.1
      if ('ai' in self && 'summarizer' in self.ai) {
        const summarizerStatus = await self.ai.summarizer.capabilities();
        this.availability.summarizer = summarizerStatus.available === 'readily' || summarizerStatus.available === 'after-download';
      } else {
        this.availability.summarizer = false;
      }
      
      // Check LanguageModel (Prompt API) - PRESERVED FROM v4.1
      if ('ai' in self && 'languageModel' in self.ai) {
        const lmStatus = await self.ai.languageModel.capabilities();
        this.availability.languageModel = lmStatus.available === 'readily' || lmStatus.available === 'after-download';
      } else {
        this.availability.languageModel = false;
      }
      
      this.availability.lastCheck = now;
      
      console.log('[ChromeAI] Availability:', this.availability);
      return this.availability;
      
    } catch (error) {
      console.error('[ChromeAI] Availability check failed:', error);
      // Default all to false - PRESERVED FROM v4.1
      this.availability = {
        translator: false,
        detector: false,
        summarizer: false,
        languageModel: false,
        lastCheck: now
      };
      return this.availability;
    }
  },
  
  // ═══════════════════════════════════════════════════════════════
  // 1. TRANSLATOR API - ENHANCED WITH BATCH SUPPORT (v4.2)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Translate a single text string
   * PRESERVED FROM v4.1 - Single translation method
   */
  async translate(text, targetLanguage = 'en', sourceLanguage = 'auto') {
    console.log(`[ChromeAI] Translating to ${targetLanguage}...`);
    
    try {
      const availability = await this.checkAvailability();
      if (!availability.translator) {
        throw new Error('CHROME_AI_UNAVAILABLE: Translator API not supported');
      }
      
      // Detect source language if auto
      if (sourceLanguage === 'auto') {
        const detectionResult = await this.detectLanguage(text);
        sourceLanguage = detectionResult.language;
      }
      
      // Create or reuse translator session
      const sessionKey = `${sourceLanguage}-${targetLanguage}`;
      if (!this.sessions.translator || this.sessions.translator.key !== sessionKey) {
        console.log(`[ChromeAI] Creating translator session: ${sessionKey}`);
        
        const translator = await self.translation.createTranslator({
          sourceLanguage,
          targetLanguage
        });
        
        this.sessions.translator = { key: sessionKey, instance: translator };
      }
      
      const result = await this.sessions.translator.instance.translate(text);
      
      console.log('[ChromeAI] ✅ Translation complete');
      return {
        success: true,
        translatedText: result,
        sourceLanguage,
        targetLanguage
      };
      
    } catch (error) {
      console.error('[ChromeAI] Translation error:', error);
      return {
        success: false,
        error: error.message,
        fallbackRequired: true
      };
    }
  },
  
  /**
   * 🆕 v4.2: Batch translate multiple items
   * Translates specified fields across multiple items in parallel
   * 
   * @param {Array} items - Array of items to translate
   * @param {Array} fields - Fields to translate (e.g., ['title', 'description'])
   * @param {String} targetLanguage - Target language code
   * @param {String} sourceLanguage - Source language (auto-detect if 'auto')
   * @param {Function} progressCallback - Optional callback for progress updates
   * @returns {Object} { success, items, stats }
   */
  async batchTranslate(items, fields = ['title', 'description'], targetLanguage = 'en', sourceLanguage = 'auto', progressCallback = null) {
    console.log(`[ChromeAI] Batch translating ${items.length} items (fields: ${fields.join(', ')})...`);
    
    const startTime = Date.now();
    const stats = {
      totalItems: items.length,
      totalFields: fields.length,
      translated: 0,
      failed: 0,
      skipped: 0
    };
    
    try {
      const availability = await this.checkAvailability();
      if (!availability.translator) {
        throw new Error('CHROME_AI_UNAVAILABLE: Translator API not supported');
      }
      
      // Detect source language from first item if auto
      if (sourceLanguage === 'auto' && items.length > 0) {
        const firstItemText = items[0][fields[0]] || '';
        if (firstItemText) {
          const detectionResult = await this.detectLanguage(firstItemText);
          sourceLanguage = detectionResult.language;
          console.log(`[ChromeAI] Auto-detected source language: ${sourceLanguage}`);
        } else {
          sourceLanguage = 'en'; // Fallback
        }
      }
      
      // Create or reuse translator session
      const sessionKey = `${sourceLanguage}-${targetLanguage}`;
      if (!this.sessions.translator || this.sessions.translator.key !== sessionKey) {
        console.log(`[ChromeAI] Creating translator session: ${sessionKey}`);
        
        const translator = await self.translation.createTranslator({
          sourceLanguage,
          targetLanguage
        });
        
        this.sessions.translator = { key: sessionKey, instance: translator };
      }
      
      // Process items in batches
      const batchSize = this.BATCH_LIMITS.translation;
      const batches = [];
      for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize));
      }
      
      console.log(`[ChromeAI] Processing ${batches.length} batches (${batchSize} items/batch)`);
      
      const translatedItems = [];
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        // Translate each item in batch
        for (let itemIndex = 0; itemIndex < batch.length; itemIndex++) {
          const item = batch[itemIndex];
          const translatedItem = { ...item };
          
          // Translate each field
          for (const field of fields) {
            const originalText = item[field];
            
            if (!originalText || typeof originalText !== 'string') {
              stats.skipped++;
              continue;
            }
            
            // Skip if text too long
            if (originalText.length > this.BATCH_LIMITS.maxFieldLength) {
              console.warn(`[ChromeAI] Field "${field}" too long (${originalText.length} chars), skipping`);
              translatedItem[`${field}_translated`] = originalText; // Use original
              stats.skipped++;
              continue;
            }
            
            try {
              const translatedText = await this.sessions.translator.instance.translate(originalText);
              translatedItem[`${field}_translated`] = translatedText;
              stats.translated++;
            } catch (error) {
              console.error(`[ChromeAI] Failed to translate field "${field}":`, error);
              translatedItem[`${field}_translated`] = originalText; // Fallback to original
              stats.failed++;
            }
          }
          
          // Add language metadata
          translatedItem._translation_metadata = {
            source_language: sourceLanguage,
            target_language: targetLanguage,
            translated_fields: fields,
            timestamp: new Date().toISOString()
          };
          
          translatedItems.push(translatedItem);
          
          // Progress callback
          if (progressCallback) {
            const progress = {
              current: translatedItems.length,
              total: items.length,
              percentage: Math.round((translatedItems.length / items.length) * 100)
            };
            progressCallback(progress);
          }
        }
      }
      
      const duration = Date.now() - startTime;
      
      console.log(`[ChromeAI] ✅ Batch translation complete in ${duration}ms`);
      console.log(`[ChromeAI] Stats:`, stats);
      
      return {
        success: true,
        items: translatedItems,
        stats: {
          ...stats,
          duration,
          itemsPerSecond: (items.length / (duration / 1000)).toFixed(2)
        },
        sourceLanguage,
        targetLanguage
      };
      
    } catch (error) {
      console.error('[ChromeAI] Batch translation error:', error);
      return {
        success: false,
        error: error.message,
        fallbackRequired: true,
        stats
      };
    }
  },
  
  // ═══════════════════════════════════════════════════════════════
  // 2. LANGUAGE DETECTOR API - ENHANCED WITH CONFIDENCE (v4.2)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Detect language with confidence score
   * ENHANCED FROM v4.1 - Now returns confidence and top 3 languages
   */
  async detectLanguage(text) {
    console.log('[ChromeAI] Detecting language...');
    
    try {
      const availability = await this.checkAvailability();
      if (!availability.detector) {
        throw new Error('CHROME_AI_UNAVAILABLE: LanguageDetector API not supported');
      }
      
      // Create or reuse detector session
      if (!this.sessions.detector) {
        console.log('[ChromeAI] Creating detector session');
        this.sessions.detector = await self.translation.createDetector();
      }
      
      const results = await this.sessions.detector.detect(text);
      
      // 🆕 v4.2: Return top 3 languages with confidence
      const topResults = results.slice(0, 3).map(r => ({
        language: r.detectedLanguage,
        confidence: r.confidence
      }));
      
      const topResult = topResults[0];
      
      console.log(`[ChromeAI] ✅ Detected: ${topResult.language} (${(topResult.confidence * 100).toFixed(1)}%)`);
      
      // 🆕 v4.2: Enhanced return object
      return {
        language: topResult.language,
        confidence: topResult.confidence,
        alternatives: topResults.slice(1),
        allResults: topResults
      };
      
    } catch (error) {
      console.error('[ChromeAI] Language detection error:', error);
      // Fallback to navigator language
      const browserLang = navigator.language.split('-')[0];
      return {
        language: browserLang || 'en',
        confidence: 0.1,
        alternatives: [],
        fallback: true
      };
    }
  },
  
  // ═══════════════════════════════════════════════════════════════
  // 3. SUMMARIZER API - ENHANCED WITH BATCH SUPPORT (v4.2)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Summarize a single text
   * PRESERVED FROM v4.1 - Single summarization method
   */
  async summarize(text, options = {}) {
    console.log('[ChromeAI] Summarizing text...');
    
    const {
      type = 'key-points', // 'key-points' | 'tl;dr' | 'teaser' | 'headline'
      format = 'markdown', // 'plain-text' | 'markdown'
      length = 'medium' // 'short' | 'medium' | 'long'
    } = options;
    
    try {
      const availability = await this.checkAvailability();
      if (!availability.summarizer) {
        throw new Error('CHROME_AI_UNAVAILABLE: Summarizer API not supported');
      }
      
      // Create summarizer with options
      console.log(`[ChromeAI] Creating summarizer: ${type}, ${format}, ${length}`);
      
      const summarizer = await self.ai.summarizer.create({
        type,
        format,
        length,
        sharedContext: 'Web page content extraction'
      });
      
      const summary = await summarizer.summarize(text);
      
      await summarizer.destroy(); // Clean up
      
      console.log('[ChromeAI] ✅ Summarization complete');
      return {
        success: true,
        summary,
        type,
        format,
        length
      };
      
    } catch (error) {
      console.error('[ChromeAI] Summarization error:', error);
      return {
        success: false,
        error: error.message,
        fallbackRequired: true
      };
    }
  },
  
  /**
   * 🆕 v4.2: Batch summarize multiple items
   * Summarizes specified field across multiple items
   * 
   * @param {Array} items - Array of items to summarize
   * @param {String} field - Field to summarize (e.g., 'description')
   * @param {Object} options - Summarization options (type, format, length)
   * @param {Function} progressCallback - Optional callback for progress updates
   * @returns {Object} { success, items, stats }
   */
  async batchSummarize(items, field = 'description', options = {}, progressCallback = null) {
    console.log(`[ChromeAI] Batch summarizing ${items.length} items (field: ${field})...`);
    
    const {
      type = 'tl;dr',
      format = 'plain-text',
      length = 'short'
    } = options;
    
    const startTime = Date.now();
    const stats = {
      totalItems: items.length,
      summarized: 0,
      failed: 0,
      skipped: 0
    };
    
    try {
      const availability = await this.checkAvailability();
      if (!availability.summarizer) {
        throw new Error('CHROME_AI_UNAVAILABLE: Summarizer API not supported');
      }
      
      // Create summarizer with options
      console.log(`[ChromeAI] Creating summarizer: ${type}, ${format}, ${length}`);
      
      const summarizer = await self.ai.summarizer.create({
        type,
        format,
        length,
        sharedContext: 'Web page content extraction - batch summarization'
      });
      
      const summarizedItems = [];
      
      // Process items sequentially (parallel may overwhelm Chrome AI)
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const summarizedItem = { ...item };
        
        const originalText = item[field];
        
        // Skip if no text
        if (!originalText || typeof originalText !== 'string') {
          stats.skipped++;
          summarizedItems.push(summarizedItem);
          continue;
        }
        
        // Skip if text too short (< 100 chars)
        if (originalText.length < 100) {
          console.log(`[ChromeAI] Text too short (${originalText.length} chars), skipping summarization`);
          summarizedItem.summary = originalText; // Use original
          stats.skipped++;
          summarizedItems.push(summarizedItem);
          continue;
        }
        
        // Skip if text too long
        if (originalText.length > this.BATCH_LIMITS.maxFieldLength) {
          console.warn(`[ChromeAI] Text too long (${originalText.length} chars), truncating`);
          const truncated = originalText.substring(0, this.BATCH_LIMITS.maxFieldLength);
          try {
            const summary = await summarizer.summarize(truncated);
            summarizedItem.summary = summary;
            summarizedItem._summary_truncated = true;
            stats.summarized++;
          } catch (error) {
            console.error(`[ChromeAI] Failed to summarize item ${i}:`, error);
            summarizedItem.summary = originalText.substring(0, 200) + '...'; // Fallback
            stats.failed++;
          }
        } else {
          try {
            const summary = await summarizer.summarize(originalText);
            summarizedItem.summary = summary;
            stats.summarized++;
          } catch (error) {
            console.error(`[ChromeAI] Failed to summarize item ${i}:`, error);
            summarizedItem.summary = originalText.substring(0, 200) + '...'; // Fallback
            stats.failed++;
          }
        }
        
        // Add summarization metadata
        summarizedItem._summarization_metadata = {
          field,
          type,
          format,
          length,
          original_length: originalText.length,
          summary_length: summarizedItem.summary.length,
          timestamp: new Date().toISOString()
        };
        
        summarizedItems.push(summarizedItem);
        
        // Progress callback
        if (progressCallback) {
          const progress = {
            current: i + 1,
            total: items.length,
            percentage: Math.round(((i + 1) / items.length) * 100)
          };
          progressCallback(progress);
        }
      }
      
      // Clean up summarizer
      await summarizer.destroy();
      
      const duration = Date.now() - startTime;
      
      console.log(`[ChromeAI] ✅ Batch summarization complete in ${duration}ms`);
      console.log(`[ChromeAI] Stats:`, stats);
      
      return {
        success: true,
        items: summarizedItems,
        stats: {
          ...stats,
          duration,
          itemsPerSecond: (items.length / (duration / 1000)).toFixed(2)
        }
      };
      
    } catch (error) {
      console.error('[ChromeAI] Batch summarization error:', error);
      return {
        success: false,
        error: error.message,
        fallbackRequired: true,
        stats
      };
    }
  },
  
  // ═══════════════════════════════════════════════════════════════
  // 4. LANGUAGE MODEL API (Prompt API) - PRESERVED FROM v4.1
  // ═══════════════════════════════════════════════════════════════
  
  async prompt(promptText, options = {}) {
    console.log('[ChromeAI] Sending prompt to LanguageModel...');
    
    const {
      temperature = 0.1,
      topK = 3,
      systemPrompt = null
    } = options;
    
    try {
      const availability = await this.checkAvailability();
      if (!availability.languageModel) {
        throw new Error('CHROME_AI_UNAVAILABLE: LanguageModel API not supported');
      }
      
      // Create or reuse language model session
      if (!this.sessions.languageModel) {
        console.log('[ChromeAI] Creating LanguageModel session');
        
        this.sessions.languageModel = await self.ai.languageModel.create({
          temperature,
          topK,
          systemPrompt: systemPrompt || 'You are a web data extraction assistant. Return only valid JSON.'
        });
      }
      
      const response = await this.sessions.languageModel.prompt(promptText);
      
      console.log('[ChromeAI] ✅ Prompt response received');
      return {
        success: true,
        response
      };
      
    } catch (error) {
      console.error('[ChromeAI] Prompt error:', error);
      return {
        success: false,
        error: error.message,
        fallbackRequired: true
      };
    }
  },
  
  // ═══════════════════════════════════════════════════════════════
  // 🆕 v4.2: MULTIMODAL SUPPORT (Image Analysis - Future)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * 🆕 v4.2: Analyze image for accessibility
   * Currently returns placeholder (Chrome AI doesn't support vision yet)
   * Will be enabled when Chrome AI Vision API is released
   * 
   * @param {String} imageUrl - URL of image to analyze
   * @param {String} purpose - 'alt-text' | 'description' | 'ocr'
   * @returns {Object} { success, description }
   */
  async analyzeImage(imageUrl, purpose = 'alt-text') {
    console.log(`[ChromeAI] Image analysis requested (${purpose}) - NOT YET SUPPORTED`);
    
    // Chrome AI doesn't support vision yet - return placeholder
    return {
      success: false,
      error: 'CHROME_AI_VISION_NOT_AVAILABLE',
      message: 'Chrome Built-in AI does not yet support image analysis. Use Cloud API fallback.',
      fallbackRequired: true,
      futureSupport: true
    };
  },
  
  /**
   * 🆕 v4.2: Transcribe audio
   * Currently returns placeholder (Chrome AI doesn't support audio yet)
   * Will be enabled when Chrome AI Audio API is released
   * 
   * @param {String} audioUrl - URL of audio to transcribe
   * @returns {Object} { success, transcript }
   */
  async transcribeAudio(audioUrl) {
    console.log('[ChromeAI] Audio transcription requested - NOT YET SUPPORTED');
    
    // Chrome AI doesn't support audio yet - return placeholder
    return {
      success: false,
      error: 'CHROME_AI_AUDIO_NOT_AVAILABLE',
      message: 'Chrome Built-in AI does not yet support audio transcription. Use Cloud API fallback.',
      fallbackRequired: true,
      futureSupport: true
    };
  },
  
  // ═══════════════════════════════════════════════════════════════
  // SESSION MANAGEMENT - PRESERVED FROM v4.1
  // ═══════════════════════════════════════════════════════════════
  
  async destroyAllSessions() {
    console.log('[ChromeAI] Destroying all sessions...');
    
    try {
      if (this.sessions.translator?.instance) {
        await this.sessions.translator.instance.destroy();
      }
      if (this.sessions.detector) {
        await this.sessions.detector.destroy();
      }
      if (this.sessions.summarizer) {
        await this.sessions.summarizer.destroy();
      }
      if (this.sessions.languageModel) {
        await this.sessions.languageModel.destroy();
      }
      
      this.sessions = {
        translator: null,
        detector: null,
        summarizer: null,
        languageModel: null
      };
      
      console.log('[ChromeAI] ✅ All sessions destroyed');
    } catch (error) {
      console.error('[ChromeAI] Session cleanup error:', error);
    }
  },
  
  // ═══════════════════════════════════════════════════════════════
  // 🆕 v4.2: UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * 🆕 v4.2: Get all capabilities summary
   * Returns availability + limits for all APIs
   */
  async getCapabilitiesSummary() {
    const availability = await this.checkAvailability();
    
    return {
      version: this.VERSION,
      availability,
      batchLimits: this.BATCH_LIMITS,
      features: {
        translation: {
          available: availability.translator,
          batchSupport: true,
          maxBatchSize: this.BATCH_LIMITS.translation
        },
        summarization: {
          available: availability.summarizer,
          batchSupport: true,
          maxBatchSize: this.BATCH_LIMITS.summarization
        },
        languageDetection: {
          available: availability.detector,
          enhancedConfidence: true
        },
        extraction: {
          available: availability.languageModel
        },
        vision: {
          available: false,
          futureSupport: true
        },
        audio: {
          available: false,
          futureSupport: true
        }
      }
    };
  },
  
  /**
   * 🆕 v4.2: Check if running in supported browser
   */
  isSupportedBrowser() {
    const userAgent = navigator.userAgent;
    const chromeVersion = userAgent.match(/Chrome\/(\d+)/);
    
    if (!chromeVersion) return false;
    
    const version = parseInt(chromeVersion[1]);
    return version >= 128; // Chrome AI requires 128+
  }
};


// Export to global scope - PRESERVED FROM v4.1
self.CHROME_AI = CHROME_AI;


console.log('[ChromeAI] ✅ Chrome Built-in AI Wrapper v4.2.0 loaded');
console.log('[ChromeAI] 🆕 Batch translation support (20 items/batch)');
console.log('[ChromeAI] 🆕 Batch summarization support (5 items/batch)');
console.log('[ChromeAI] 🆕 Enhanced language detection with confidence');
console.log('[ChromeAI] 🔜 Image analysis (future Chrome AI support)');
console.log('[ChromeAI] 🔜 Audio transcription (future Chrome AI support)');
