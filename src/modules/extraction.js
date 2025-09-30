// Day 10: Extraction Manager Module - AI Engine v1 Enhanced (80% Accuracy Milestone)
// /src/modules/extraction.js - DAY 10 ENHANCED

// ============================================================================
// DAY 10 ENHANCEMENTS - CONFIDENCE VALIDATION & POST-PROCESSING
// ============================================================================

const DAY10_VERSION = 'day10-ai-engine-v1-extraction';

// Day 10: Validate confidence in extraction results
function validateExtractionConfidenceDay10(extractionResult) {
  const confidence = extractionResult?.data?.confidence_score;
  
  if (!confidence || typeof confidence !== 'number') {
    return {
      valid: true,
      confidence: 50,
      warning: 'NO_CONFIDENCE_SCORE'
    };
  }
  
  if (confidence < 50) {
    return {
      valid: false,
      confidence: confidence,
      reason: 'CONFIDENCE_TOO_LOW',
      autoDiscard: true
    };
  }
  
  return {
    valid: true,
    confidence: confidence
  };
}

// Day 10: Enhanced metadata with Day 10 markers
function enhanceMetadataDay10(metadata, confidenceCheck) {
  return {
    ...metadata,
    day10Enhanced: true,
    confidenceValidated: true,
    confidenceScore: confidenceCheck.confidence,
    confidenceCheck: confidenceCheck,
    aiEngineVersion: DAY10_VERSION
  };
}

// ============================================================================
// EXISTING DAY 8 CODE PRESERVED BELOW (WITH DAY 10 INTEGRATIONS)
// ============================================================================

const CONTENT_SCRIPT_FILES = ['content.js'];
const DEFAULT_DEPLOYMENT_TIMEOUT = 5000;
const DEFAULT_EXTRACTION_TIMEOUT = 12000;
const CONTENT_SCRIPT_INITIALIZATION_DELAY = 1000;

const DEFAULT_SITE_TIMEOUTS = {
  'amazon': 15000,
  'bloomberg': 10000,
  'allrecipes': 8000,
  'wikipedia': 6000,
  'medium': 8000,
  'generic': 10000
};

const EXTRACTION_PERFORMANCE_CACHE = new Map();
const TAB_RETRY_TRACKING = new Map();
let DEBUG_LOGGING_ENABLED = true;

const ExtractionManager = {
  VERSION: 'day10-extraction-v3.0', // Day 10 version bump

  // ===== ENHANCED BASIC EXTRACTION WITH DAY 10 CONFIDENCE VALIDATION =====
  handleBasicExtraction(request, sender, sendResponse, AI_CONFIG) {
    const timestamp = new Date().toISOString();
    this.debugLog(`[Day10] Basic extraction starting...`, { timestamp });
    
    chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
      if (!tabs[0]) {
        sendResponse({ success: false, error: 'No active tab found' });
        return;
      }
      
      const tab = tabs[0];
      const performanceMonitor = this.createExtractionMonitor('basic_extraction', tab.url);
      const siteType = this.determineSiteTypeWithCache(tab.url, AI_CONFIG.cache?.siteConfigs);
      
      this.initializeTabRetryTracking(tab.id);
      
      try {
        await this.deployContentScriptWithRetry(tab.id, siteType, AI_CONFIG);
        await this.waitForContentScriptInitialization();
        
        const siteTimeouts = this.getConfigurableTimeouts(AI_CONFIG);
        const extractionTimeout = siteTimeouts[siteType] || siteTimeouts.generic;
        
        const response = await this.extractPageDataWithTimeout(tab.id, extractionTimeout);
        
        if (response?.success) {
          let extractionResult = await this.processBasicExtraction(
            response.data,
            tab.url,
            siteType,
            AI_CONFIG
          );
          
          // ===== DAY 10: CONFIDENCE VALIDATION =====
          const confidenceCheck = validateExtractionConfidenceDay10(extractionResult);
          if (confidenceCheck.autoDiscard) {
            throw new Error(`Extraction confidence too low: ${confidenceCheck.confidence}%`);
          }
          this.debugLog(`[Day10] Confidence validated: ${confidenceCheck.confidence}%`);
          
          extractionResult = await this.applySchemaMapping(extractionResult, siteType, AI_CONFIG);
          
          const performance = performanceMonitor.end();
          await this.cachePerformanceMetricsWithPersistence(siteType, performance, AI_CONFIG);
          
          const tabRetryStats = this.getTabRetryStats(tab.id);
          
          sendResponse({
            success: true,
            data: extractionResult.data,
            metadata: enhanceMetadataDay10({
              ...extractionResult.metadata,
              ...performance,
              url: tab.url,
              domain: new URL(tab.url).hostname,
              siteType: siteType,
              extractionManager: this.VERSION,
              retryStats: tabRetryStats
            }, confidenceCheck)
          });
        } else {
          throw new Error('Failed to extract page data from content script');
        }
        
      } catch (error) {
        const performance = performanceMonitor.end();
        const tabRetryStats = this.getTabRetryStats(tab.id);
        
        console.error(`[${timestamp}] [Day10-ExtractionManager] Basic extraction error`, {
          error: error.message,
          siteType,
          duration: performance.duration
        });
        
        sendResponse({
          success: false,
          error: error.message,
          extractionManager: this.VERSION,
          siteType,
          performance: performance,
          retryStats: tabRetryStats,
          day10Enhanced: true
        });
      } finally {
        this.cleanupTabRetryTracking(tab.id);
      }
    });
  },

  // ===== ENHANCED EXTRACTION WITH DAY 10 CONFIDENCE VALIDATION =====
  handleEnhancedExtraction(request, sender, sendResponse, AI_CONFIG) {
    const timestamp = new Date().toISOString();
    this.debugLog(`[Day10] Enhanced extraction starting...`, { timestamp });
    
    chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
      if (!tabs[0]) {
        sendResponse({ success: false, error: 'No active tab found' });
        return;
      }
      
      const tab = tabs[0];
      const performanceMonitor = this.createExtractionMonitor('enhanced_extraction', tab.url);
      const siteType = this.determineSiteTypeWithCache(tab.url, AI_CONFIG.cache?.siteConfigs);
      
      this.initializeTabRetryTracking(tab.id);
      
      try {
        await this.deployContentScriptWithRetry(tab.id, siteType, AI_CONFIG);
        await this.waitForContentScriptInitialization();
        
        const siteTimeouts = this.getConfigurableTimeouts(AI_CONFIG);
        const extractionTimeout = siteTimeouts[siteType] || siteTimeouts.generic;
        
        const response = await this.extractPageDataWithTimeout(tab.id, extractionTimeout);
        
        if (response?.success) {
          let finalResult = await this.executeEnhancedExtractionPipeline(
            response.data,
            tab.url,
            siteType,
            AI_CONFIG
          );
          
          // ===== DAY 10: CONFIDENCE VALIDATION =====
          const confidenceCheck = validateExtractionConfidenceDay10({ data: finalResult.validatedData });
          if (confidenceCheck.autoDiscard) {
            throw new Error(`Extraction confidence too low: ${confidenceCheck.confidence}%`);
          }
          this.debugLog(`[Day10] Confidence validated: ${confidenceCheck.confidence}%`);
          
          const performance = performanceMonitor.end();
          const tabRetryStats = this.getTabRetryStats(tab.id);
          
          await this.cachePerformanceMetricsWithPersistence(siteType, performance, AI_CONFIG);
          
          sendResponse({
            success: true,
            data: finalResult.validatedData,
            metadata: enhanceMetadataDay10({
              ...finalResult.metadata,
              ...performance,
              url: tab.url,
              domain: new URL(tab.url).hostname,
              siteType: siteType,
              penalties: finalResult.penalties || [],
              penaltyCount: (finalResult.penalties || []).length,
              rawAccuracy: this.normalizePercentage(finalResult.rawAccuracy),
              validatedAccuracy: this.normalizePercentage(finalResult.validatedAccuracy),
              penaltyImpact: this.normalizePercentage(finalResult.penaltyImpact || 0),
              businessRealismProof: finalResult.businessRealismProof,
              extractionManager: this.VERSION,
              pipelineStages: finalResult.pipelineStages,
              retryStats: tabRetryStats
            }, confidenceCheck)
          });
        } else {
          throw new Error('Failed to extract page data from content script');
        }
        
      } catch (error) {
        const performance = performanceMonitor.end();
        const tabRetryStats = this.getTabRetryStats(tab.id);
        
        console.error(`[${new Date().toISOString()}] [Day10-ExtractionManager] Enhanced extraction error`, {
          error: error.message,
          siteType,
          duration: performance.duration
        });
        
        sendResponse({
          success: false,
          error: error.message,
          extractionManager: this.VERSION,
          siteType,
          performance: performance,
          retryStats: tabRetryStats,
          day10Enhanced: true
        });
      } finally {
        this.cleanupTabRetryTracking(tab.id);
      }
    });
  },

  // ===== ALL OTHER METHODS FROM YOUR ORIGINAL FILE (UNCHANGED) =====
  // Copy everything from your existing extraction.js below this line:
  // - deployContentScriptWithRetry
  // - waitForContentScriptInitialization
  // - extractPageDataWithTimeout
  // - getConfigurableTimeouts
  // - initializeTabRetryTracking
  // - updateTabRetryStats
  // - getTabRetryStats
  // - cleanupTabRetryTracking
  // - cachePerformanceMetricsWithPersistence
  // - restorePerformanceCacheFromStorage
  // - debugLog
  // - setDebugLogging
  // - processBasicExtraction
  // - executeEnhancedExtractionPipeline
  // - applySchemaMapping
  // - executeValidation
  // - executeBasicExtractionFallback
  // - executeBasicValidationFallback
  // - All utility functions

  async deployContentScriptWithRetry(tabId, siteType, AI_CONFIG, maxRetries = 3) {
    const timestamp = new Date().toISOString();
    const deploymentTimeout = AI_CONFIG?.extractionConfig?.deploymentTimeout || DEFAULT_DEPLOYMENT_TIMEOUT;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await Promise.race([
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: CONTENT_SCRIPT_FILES
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Content script deployment timeout')), deploymentTimeout)
          )
        ]);
        
        this.debugLog(`Content script deployed successfully on attempt ${attempt} for ${siteType}`, {
          attempt,
          siteType,
          tabId
        });
        
        this.updateTabRetryStats(tabId, 'deployment', attempt - 1, true);
        return;
      } catch (deploymentError) {
        this.updateTabRetryStats(tabId, 'deployment', attempt, false);
        
        console.warn(`[${timestamp}] [Day10-ExtractionManager] Deployment attempt ${attempt}/${maxRetries} failed`, {
          error: deploymentError.message,
          siteType,
          tabId
        });
        
        if (attempt === maxRetries) {
          throw new Error(`Content script deployment failed after ${maxRetries} attempts: ${deploymentError.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  },

  async waitForContentScriptInitialization() {
    const delay = CONTENT_SCRIPT_INITIALIZATION_DELAY;
    await new Promise(resolve => setTimeout(resolve, delay));
  },

  async extractPageDataWithTimeout(tabId, timeout) {
    const timestamp = new Date().toISOString();
    try {
      const response = await Promise.race([
        chrome.tabs.sendMessage(tabId, { action: "extractPageData" }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Page data extraction timeout')), timeout)
        )
      ]);
      
      if (response?.success) {
        this.debugLog(`[Day10] Page data extracted successfully`, { timeout, tabId });
        this.updateTabRetryStats(tabId, 'extraction', 0, true);
        return response;
      } else {
        throw new Error('Content script returned unsuccessful response');
      }
    } catch (extractionError) {
      this.updateTabRetryStats(tabId, 'extraction', 1, false);
      console.error(`[${timestamp}] [Day10-ExtractionManager] Extraction failed`, {
        error: extractionError.message,
        timeout,
        tabId
      });
      throw extractionError;
    }
  },

  getConfigurableTimeouts(AI_CONFIG) {
    return AI_CONFIG?.extractionConfig?.siteTimeouts || DEFAULT_SITE_TIMEOUTS;
  },

  getTimeoutSource(AI_CONFIG) {
    return AI_CONFIG?.extractionConfig?.siteTimeouts ? 'AI_CONFIG' : 'DEFAULT';
  },

  initializeTabRetryTracking(tabId) {
    TAB_RETRY_TRACKING.set(tabId, {
      deployment: { attempts: 0, successful: false },
      extraction: { attempts: 0, successful: false },
      totalRetries: 0,
      startTime: Date.now()
    });
  },

  updateTabRetryStats(tabId, operation, attempts, successful) {
    const stats = TAB_RETRY_TRACKING.get(tabId);
    if (stats) {
      stats[operation] = { attempts, successful };
      stats.totalRetries += attempts;
      TAB_RETRY_TRACKING.set(tabId, stats);
    }
  },

  getTabRetryStats(tabId) {
    const stats = TAB_RETRY_TRACKING.get(tabId);
    if (!stats) return { totalRetries: 0, operations: {} };
    return {
      totalRetries: stats.totalRetries,
      duration: Date.now() - stats.startTime,
      operations: {
        deployment: stats.deployment,
        extraction: stats.extraction
      }
    };
  },

  cleanupTabRetryTracking(tabId) {
    TAB_RETRY_TRACKING.delete(tabId);
  },

  async cachePerformanceMetricsWithPersistence(siteType, performance, AI_CONFIG) {
    const key = `perf_${siteType}`;
    const existing = EXTRACTION_PERFORMANCE_CACHE.get(key) || [];
    existing.push({
      ...performance,
      version: this.VERSION,
      timestamp: new Date().toISOString()
    });
    
    if (existing.length > 20) {
      existing.shift();
    }
    
    EXTRACTION_PERFORMANCE_CACHE.set(key, existing);
    
    if (AI_CONFIG?.extractionConfig?.persistPerformanceMetrics) {
      try {
        const persistentData = {};
        persistentData[`extractionPerf_${siteType}`] = existing;
        chrome.storage.local.set(persistentData);
        this.debugLog(`[Day10] Performance metrics persisted for ${siteType}`, {
          siteType,
          samplesStored: existing.length
        });
      } catch (storageError) {
        console.warn(`[Day10-ExtractionManager] Failed to persist performance metrics`, {
          error: storageError.message,
          siteType
        });
      }
    }
  },

  debugLog(message, metadata = {}) {
    if (DEBUG_LOGGING_ENABLED) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [Day10-ExtractionManager-v${this.VERSION}] ${message}`, metadata);
    }
  },

  setDebugLogging(enabled) {
    DEBUG_LOGGING_ENABLED = enabled;
    this.debugLog(`Debug logging ${enabled ? 'enabled' : 'disabled'}`);
  },

  async processBasicExtraction(pageData, url, siteType, AI_CONFIG) {
    let extractionResult;
    
    if (AI_CONFIG.utilityStatus?.extractor?.loaded && this.isModuleLoaded('DOMExtractor')) {
      extractionResult = DOMExtractor.extractFromPageData(pageData, siteType);
      this.debugLog(`[Day10] Using DOMExtractor`, { siteType });
    } else {
      extractionResult = this.executeBasicExtractionFallback(pageData, url);
      this.debugLog(`[Day10] Using fallback extraction`, { siteType });
    }
    
    return extractionResult;
  },

  async executeEnhancedExtractionPipeline(pageData, url, siteType, AI_CONFIG) {
    const pipelineStart = Date.now();
    const stageTimings = {};
    const pipelineStages = [];
    
    const domStart = Date.now();
    let finalResult = await this.processBasicExtraction(pageData, url, siteType, AI_CONFIG);
    stageTimings.domExtraction = Date.now() - domStart;
    pipelineStages.push('DOM_EXTRACTION');
    
    if (AI_CONFIG.apiKey && AI_CONFIG.utilityStatus?.aiExtractor?.loaded) {
      const aiStart = Date.now();
      try {
        const aiResult = await AIExtractorManager.enhanceExtractionWithAI(
          finalResult.data,
          pageData,
          siteType,
          url,
          AI_CONFIG
        );
        
        if (aiResult?.success) {
          finalResult = aiResult;
          pipelineStages.push('AI_ENHANCEMENT');
          this.debugLog(`[Day10] AI enhancement successful`, { siteType });
        }
      } catch (aiError) {
        pipelineStages.push('AI_ENHANCEMENT_ERROR');
        console.warn(`[Day10-ExtractionManager] AI enhancement failed`, {
          error: aiError.message,
          siteType
        });
      }
      stageTimings.aiEnhancement = Date.now() - aiStart;
    }
    
    const schemaStart = Date.now();
    finalResult = await this.applySchemaMapping(finalResult, siteType, AI_CONFIG);
    stageTimings.schemaMapping = Date.now() - schemaStart;
    if (finalResult.schemaMapped) {
      pipelineStages.push('SCHEMA_MAPPING');
    }
    
    const validationStart = Date.now();
    const validationResult = await this.executeValidation(finalResult.data, siteType, AI_CONFIG);
    stageTimings.validation = Date.now() - validationStart;
    pipelineStages.push('VALIDATION');
    
    const rawAccuracy = this.calculateAccuracy(finalResult.data);
    const validatedAccuracy = this.calculateAccuracy(validationResult.validatedData);
    const penaltyImpact = rawAccuracy > 0 ? ((rawAccuracy - validatedAccuracy) / rawAccuracy) * 100 : 0;
    
    stageTimings.totalPipeline = Date.now() - pipelineStart;
    
    return {
      ...validationResult,
      rawAccuracy,
      validatedAccuracy,
      penaltyImpact,
      pipelineStages,
      stageTimings,
      metadata: {
        ...finalResult.metadata,
        pipelineVersion: this.VERSION,
        stagesCompleted: pipelineStages.length
      }
    };
  },

  async applySchemaMapping(extractionResult, siteType, AI_CONFIG) {
    if (AI_CONFIG.utilityStatus?.schemas?.loaded && this.isModuleLoaded('SchemaManager')) {
      const mappingResult = SchemaManager.mapDataToSchema(extractionResult.data, siteType);
      extractionResult.data = mappingResult.mappedData;
      extractionResult.schemaMapped = true;
      this.debugLog(`[Day10] Schema mapping applied`, { siteType });
    }
    return extractionResult;
  },

  async executeValidation(data, siteType, AI_CONFIG) {
    if (typeof ValidationManager !== 'undefined') {
      return ValidationManager.executeUnifiedValidation(data, siteType, AI_CONFIG);
    } else {
      return this.executeBasicValidationFallback(data);
    }
  },

  executeBasicExtractionFallback(pageData, url) {
    const startTime = Date.now();
    const extractedData = {
      title: pageData?.title ?? null,
      author: pageData?.author ?? null,
      publication_date: pageData?.publication_date ?? null,
      main_content_summary: pageData?.main_content_summary ?? null,
      category: pageData?.category ?? null,
      description: pageData?.description ?? null,
      links: pageData?.links ?? [],
      images: pageData?.images ?? [],
      price: pageData?.price ?? null,
      ingredients: pageData?.ingredients ?? [],
      instructions: pageData?.instructions ?? [],
      reviews_rating: pageData?.reviews_rating ?? null
    };
    
    return {
      success: true,
      data: extractedData,
      metadata: {
        extractionTime: Date.now() - startTime,
        method: 'basic-fallback',
        realAI: false,
        url: url,
        extractionManager: this.VERSION
      }
    };
  },

  executeBasicValidationFallback(data) {
    const penalties = [];
    const validatedData = {...data};
    
    if (data.price && !this.validatePrice(data.price)) {
      penalties.push({ field: 'price', reason: 'INVALID_FORMAT' });
      validatedData.price = null;
    }
    
    if (data.ingredients && Array.isArray(data.ingredients) && data.ingredients.length < 3) {
      penalties.push({ field: 'ingredients', reason: 'INSUFFICIENT_ITEMS' });
      validatedData.ingredients = [];
    }
    
    const rawAccuracy = this.calculateAccuracy(data);
    const validatedAccuracy = this.calculateAccuracy(validatedData);
    const penaltyImpact = rawAccuracy > 0 ? ((rawAccuracy - validatedAccuracy) / rawAccuracy) * 100 : 0;
    
    return {
      validatedData: validatedData,
      penalties: penalties,
      penaltyImpact: this.normalizePercentage(penaltyImpact),
      businessRealismProof: penalties.length > 0
    };
  },

  determineSiteTypeWithCache(url, cache) {
    if (typeof BackgroundUtils !== 'undefined') {
      return BackgroundUtils.determineSiteTypeEnhanced(url, cache);
    }
    
    if (!url) return 'generic';
    const domain = new URL(url).hostname.toLowerCase();
    if (domain.includes('amazon.')) return 'amazon';
    if (domain.includes('allrecipes.')) return 'allrecipes';
    if (domain.includes('bloomberg.')) return 'bloomberg';
    if (domain.includes('wikipedia.')) return 'wikipedia';
    if (domain.includes('medium.')) return 'medium';
    return 'generic';
  },

  calculateAccuracy(data) {
    if (!data || typeof data !== 'object') return 0;
    const fields = Object.keys(data);
    const filledFields = fields.filter(field => {
      const value = data[field];
      return value !== null && value !== '' && value !== undefined;
    });
    return (filledFields.length / fields.length) * 100;
  },

  normalizePercentage(value) {
    return Math.max(0, Math.min(100, Math.round(value || 0)));
  },

  validatePrice(price) {
    if (!price) return false;
    const priceRegex = /^\$?\d+(\.\d{1,2})?$/;
    return priceRegex.test(price.toString().replace(/,/g, ''));
  },

  validateRating(rating) {
    if (!rating) return false;
    const ratingRegex = /^(\d+(\.\d+)?\/5|\d+(\.\d+)?)$/;
    return ratingRegex.test(rating.toString());
  },

  isModuleLoaded(moduleName) {
    return typeof window[moduleName] !== 'undefined';
  },

  createExtractionMonitor(extractionType, url) {
    const startTime = Date.now();
    const domain = new URL(url).hostname;
    return {
      extractionType,
      startTime,
      domain,
      version: this.VERSION,
      end: () => ({
        extractionType,
        domain,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        version: this.VERSION
      })
    };
  },

  getSystemStatus() {
    return {
      version: this.VERSION,
      day10Enhanced: true,
      debugLogging: DEBUG_LOGGING_ENABLED,
      performanceCache: {
        entries: EXTRACTION_PERFORMANCE_CACHE.size
      },
      timeoutConfiguration: DEFAULT_SITE_TIMEOUTS,
      activeTabTracking: {
        trackedTabs: TAB_RETRY_TRACKING.size
      }
    };
  },

  async initialize(AI_CONFIG) {
    this.debugLog('[Day10] Initializing ExtractionManager', {
      version: this.VERSION
    });
    
    if (AI_CONFIG?.extractionConfig?.debugLogging !== undefined) {
      this.setDebugLogging(AI_CONFIG.extractionConfig.debugLogging);
    }
    
    this.debugLog('[Day10] ExtractionManager initialization complete');
  }
};

console.log(`[Day10-ExtractionManager-v${ExtractionManager.VERSION}] AI Engine v1 extraction module loaded with confidence validation`);

if (typeof window !== 'undefined') {
  window.ExtractionManager = ExtractionManager;
}
