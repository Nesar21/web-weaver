/**
 * Web Weaver Lightning - Chrome Built-in AI Wrapper
 * Version: 4.1.0 (Day 21.2 - Chrome AI Integration)
 * 
 * Unified wrapper for Chrome's 4 Built-in AI APIs:
 * 1. Translator API (translation)
 * 2. LanguageDetector API (language detection)
 * 3. Summarizer API (summarization)
 * 4. LanguageModel API (Prompt API for extraction)
 * 
 * FEATURES:
 * - Availability checks with graceful fallbacks
 * - Session management (reuse sessions for performance)
 * - Error handling with auto-fallback signals
 * - Model download progress tracking
 */

const CHROME_AI = {
  VERSION: '4.1.0',
  
  // Session cache (reuse across multiple calls)
  sessions: {
    translator: null,
    detector: null,
    summarizer: null,
    languageModel: null
  },
  
  // Availability status cache
  availability: {
    translator: null,
    detector: null,
    summarizer: null,
    languageModel: null,
    lastCheck: 0
  },
  
  CACHE_TTL: 300000, // 5 minutes
  
  // ═══════════════════════════════════════════════════════════════
  // AVAILABILITY CHECKS
  // ═══════════════════════════════════════════════════════════════
  
  async checkAvailability() {
    const now = Date.now();
    if (this.availability.lastCheck && (now - this.availability.lastCheck) < this.CACHE_TTL) {
      console.log('[ChromeAI] Using cached availability status');
      return this.availability;
    }
    
    console.log('[ChromeAI] Checking API availability...');
    
    try {
      // Check Translator
      if ('translation' in self && 'createTranslator' in self.translation) {
        const translatorStatus = await self.translation.canTranslate({
          sourceLanguage: 'en',
          targetLanguage: 'es'
        });
        this.availability.translator = translatorStatus === 'readily' || translatorStatus === 'after-download';
      } else {
        this.availability.translator = false;
      }
      
      // Check LanguageDetector
      if ('translation' in self && 'createDetector' in self.translation) {
        const detectorStatus = await self.translation.canDetect();
        this.availability.detector = detectorStatus === 'readily' || detectorStatus === 'after-download';
      } else {
        this.availability.detector = false;
      }
      
      // Check Summarizer
      if ('ai' in self && 'summarizer' in self.ai) {
        const summarizerStatus = await self.ai.summarizer.capabilities();
        this.availability.summarizer = summarizerStatus.available === 'readily' || summarizerStatus.available === 'after-download';
      } else {
        this.availability.summarizer = false;
      }
      
      // Check LanguageModel (Prompt API)
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
      // Default all to false
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
  // 1. TRANSLATOR API
  // ═══════════════════════════════════════════════════════════════
  
  async translate(text, targetLanguage = 'en', sourceLanguage = 'auto') {
    console.log(`[ChromeAI] Translating to ${targetLanguage}...`);
    
    try {
      const availability = await this.checkAvailability();
      if (!availability.translator) {
        throw new Error('CHROME_AI_UNAVAILABLE: Translator API not supported');
      }
      
      // Detect source language if auto
      if (sourceLanguage === 'auto') {
        sourceLanguage = await this.detectLanguage(text);
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
  
  // ═══════════════════════════════════════════════════════════════
  // 2. LANGUAGE DETECTOR API
  // ═══════════════════════════════════════════════════════════════
  
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
      const topResult = results[0];
      
      console.log(`[ChromeAI] ✅ Detected: ${topResult.detectedLanguage} (${(topResult.confidence * 100).toFixed(1)}%)`);
      
      return topResult.detectedLanguage;
      
    } catch (error) {
      console.error('[ChromeAI] Language detection error:', error);
      return 'en'; // Default fallback
    }
  },
  
  // ═══════════════════════════════════════════════════════════════
  // 3. SUMMARIZER API
  // ═══════════════════════════════════════════════════════════════
  
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
  
  // ═══════════════════════════════════════════════════════════════
  // 4. LANGUAGE MODEL API (Prompt API for Extraction)
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
  // SESSION MANAGEMENT
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
  }
};

// Export to global scope
self.CHROME_AI = CHROME_AI;

console.log('[ChromeAI] ✅ Chrome Built-in AI Wrapper loaded');
