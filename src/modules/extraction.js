// Day 8: Extraction Manager Module - Championship Enterprise Edition
// /src/modules/extraction.js

// ===== CACHED CONSTANTS FOR PERFORMANCE =====
const CONTENT_SCRIPT_FILES = ['content.js'];
const DEFAULT_DEPLOYMENT_TIMEOUT = 5000;
const DEFAULT_EXTRACTION_TIMEOUT = 12000;
const CONTENT_SCRIPT_INITIALIZATION_DELAY = 1000;

// Site-specific extraction timeouts (now configurable via AI_CONFIG)
const DEFAULT_SITE_TIMEOUTS = {
  'amazon': 15000,
  'bloomberg': 10000,
  'allrecipes': 8000,
  'wikipedia': 6000,
  'medium': 8000,
  'generic': 10000
};

// Performance monitoring cache with persistent storage capability
const EXTRACTION_PERFORMANCE_CACHE = new Map();

// Tab-specific retry tracking
const TAB_RETRY_TRACKING = new Map();

// Production logging control
let DEBUG_LOGGING_ENABLED = true; // Can be controlled via AI_CONFIG

const ExtractionManager = {
  VERSION: 'day8-extraction-v2.1', // Synced versioning strategy
  
  // ===== ENHANCED BASIC EXTRACTION HANDLER =====
  handleBasicExtraction(request, sender, sendResponse, AI_CONFIG) {
    const timestamp = new Date().toISOString();
    this.debugLog(`Basic extraction starting...`, { timestamp });
    
    chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
      if (!tabs[0]) {
        sendResponse({ success: false, error: 'No active tab found' });
        return;
      }

      const tab = tabs[0];
      const performanceMonitor = this.createExtractionMonitor('basic_extraction', tab.url);
      const siteType = this.determineSiteTypeWithCache(tab.url, AI_CONFIG.cache?.siteConfigs);
      
      // Initialize tab retry tracking
      this.initializeTabRetryTracking(tab.id);

      try {
        // Deploy content script with enhanced retry tracking
        await this.deployContentScriptWithRetry(tab.id, siteType, AI_CONFIG);
        await this.waitForContentScriptInitialization();

        // Use configurable timeouts from AI_CONFIG
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

          // Apply schema mapping if available
          extractionResult = await this.applySchemaMapping(extractionResult, siteType, AI_CONFIG);

          const performance = performanceMonitor.end();
          
          // Cache performance metrics with persistence
          await this.cachePerformanceMetricsWithPersistence(siteType, performance, AI_CONFIG);

          const tabRetryStats = this.getTabRetryStats(tab.id);
          
          sendResponse({
            success: true,
            data: extractionResult.data,
            metadata: {
              ...extractionResult.metadata,
              ...performance,
              url: tab.url,
              domain: new URL(tab.url).hostname,
              siteType: siteType,
              day8Version: AI_CONFIG.day8Version,
              extractionManager: this.VERSION,
              cached: this.wasCacheUsed(siteType, tab.url, AI_CONFIG.cache),
              modulesUsed: this.getLoadedModulesInfo(AI_CONFIG.utilityStatus),
              retryStats: tabRetryStats,
              performance: {
                configuredTimeout: extractionTimeout,
                actualDuration: performance.duration,
                timeoutSource: this.getTimeoutSource(AI_CONFIG)
              }
            }
          });

        } else {
          throw new Error('Failed to extract page data from content script');
        }

      } catch (error) {
        const performance = performanceMonitor.end();
        const tabRetryStats = this.getTabRetryStats(tab.id);
        
        console.error(`[${timestamp}] [ExtractionManager-v${this.VERSION}] Basic extraction error`, {
          error: error.message,
          siteType,
          duration: performance.duration,
          retryStats: tabRetryStats
        });
        
        sendResponse({
          success: false,
          error: error.message,
          extractionManager: this.VERSION,
          siteType,
          performance: performance,
          retryStats: tabRetryStats
        });
      } finally {
        // Clean up tab retry tracking
        this.cleanupTabRetryTracking(tab.id);
      }
    });
  },

  // ===== ENHANCED EXTRACTION HANDLER WITH COMPREHENSIVE TRACKING =====
  handleEnhancedExtraction(request, sender, sendResponse, AI_CONFIG) {
    const timestamp = new Date().toISOString();
    this.debugLog(`Enhanced extraction starting...`, { timestamp });
    
    chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
      if (!tabs[0]) {
        sendResponse({ success: false, error: 'No active tab found' });
        return;
      }

      const tab = tabs[0];
      const performanceMonitor = this.createExtractionMonitor('enhanced_extraction', tab.url);
      const siteType = this.determineSiteTypeWithCache(tab.url, AI_CONFIG.cache?.siteConfigs);
      
      // Initialize tab retry tracking
      this.initializeTabRetryTracking(tab.id);

      try {
        // Deploy content script with enhanced tracking
        await this.deployContentScriptWithRetry(tab.id, siteType, AI_CONFIG);
        await this.waitForContentScriptInitialization();

        // Use configurable timeouts
        const siteTimeouts = this.getConfigurableTimeouts(AI_CONFIG);
        const extractionTimeout = siteTimeouts[siteType] || siteTimeouts.generic;
        
        const response = await this.extractPageDataWithTimeout(tab.id, extractionTimeout);

        if (response?.success) {
          // Multi-phase extraction pipeline with comprehensive tracking
          let finalResult = await this.executeEnhancedExtractionPipeline(
            response.data,
            tab.url,
            siteType,
            AI_CONFIG
          );

          const performance = performanceMonitor.end();
          const tabRetryStats = this.getTabRetryStats(tab.id);

          // Persistent performance caching
          await this.cachePerformanceMetricsWithPersistence(siteType, performance, AI_CONFIG);

          sendResponse({
            success: true,
            data: finalResult.validatedData,
            metadata: {
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
              businessRealismProof: finalResult.businessRealismProof || ((finalResult.penalties?.length || 0) > 0),
              day8Version: AI_CONFIG.day8Version,
              extractionManager: this.VERSION,
              pipelineStages: finalResult.pipelineStages,
              modulesUsed: this.getLoadedModulesInfo(AI_CONFIG.utilityStatus),
              retryStats: tabRetryStats,
              performance: {
                configuredTimeout: extractionTimeout,
                actualDuration: performance.duration,
                stageBreakdown: finalResult.stageTimings,
                timeoutSource: this.getTimeoutSource(AI_CONFIG)
              }
            }
          });

        } else {
          throw new Error('Failed to extract page data from content script');
        }

      } catch (error) {
        const performance = performanceMonitor.end();
        const tabRetryStats = this.getTabRetryStats(tab.id);
        
        console.error(`[${new Date().toISOString()}] [ExtractionManager-v${this.VERSION}] Enhanced extraction error`, {
          error: error.message,
          siteType,
          duration: performance.duration,
          retryStats: tabRetryStats
        });
        
        sendResponse({
          success: false,
          error: error.message,
          extractionManager: this.VERSION,
          siteType,
          performance: performance,
          retryStats: tabRetryStats
        });
      } finally {
        // Clean up tab retry tracking
        this.cleanupTabRetryTracking(tab.id);
      }
    });
  },

  // ===== ENHANCED CONTENT SCRIPT DEPLOYMENT WITH CUMULATIVE RETRY TRACKING =====
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
          tabId,
          deploymentTimeout
        });
        
        // Track successful deployment
        this.updateTabRetryStats(tabId, 'deployment', attempt - 1, true);
        return;

      } catch (deploymentError) {
        // Track retry attempt
        this.updateTabRetryStats(tabId, 'deployment', attempt, false);
        
        console.warn(`[${timestamp}] [ExtractionManager-v${this.VERSION}] Content script deployment attempt ${attempt}/${maxRetries} failed`, {
          error: deploymentError.message,
          siteType,
          tabId,
          deploymentTimeout
        });

        if (attempt === maxRetries) {
          throw new Error(`Content script deployment failed after ${maxRetries} attempts: ${deploymentError.message}`);
        }

        // Brief delay before retry
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  },

  async waitForContentScriptInitialization() {
    const delay = AI_CONFIG?.extractionConfig?.initializationDelay || CONTENT_SCRIPT_INITIALIZATION_DELAY;
    await new Promise(resolve => setTimeout(resolve, delay));
  },

  // ===== ENHANCED PAGE DATA EXTRACTION WITH RETRY TRACKING =====
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
        this.debugLog(`Page data extracted successfully in ${timeout}ms timeout window`, {
          timeout,
          tabId
        });
        
        // Track successful extraction
        this.updateTabRetryStats(tabId, 'extraction', 0, true);
        return response;
      } else {
        throw new Error('Content script returned unsuccessful response');
      }

    } catch (extractionError) {
      // Track extraction failure
      this.updateTabRetryStats(tabId, 'extraction', 1, false);
      
      console.error(`[${timestamp}] [ExtractionManager-v${this.VERSION}] Page data extraction failed`, {
        error: extractionError.message,
        timeout,
        tabId
      });
      throw extractionError;
    }
  },

  // ===== CONFIGURABLE TIMEOUTS SYSTEM =====
  getConfigurableTimeouts(AI_CONFIG) {
    // Use AI_CONFIG timeouts if available, fallback to defaults
    return AI_CONFIG?.extractionConfig?.siteTimeouts || DEFAULT_SITE_TIMEOUTS;
  },

  getTimeoutSource(AI_CONFIG) {
    return AI_CONFIG?.extractionConfig?.siteTimeouts ? 'AI_CONFIG' : 'DEFAULT';
  },

  // ===== TAB RETRY TRACKING SYSTEM =====
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

  // ===== PERSISTENT PERFORMANCE CACHING =====
  async cachePerformanceMetricsWithPersistence(siteType, performance, AI_CONFIG) {
    const key = `perf_${siteType}`;
    const existing = EXTRACTION_PERFORMANCE_CACHE.get(key) || [];
    existing.push({
      ...performance,
      version: this.VERSION,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 20 measurements per site type (increased from 10)
    if (existing.length > 20) {
      existing.shift();
    }
    
    EXTRACTION_PERFORMANCE_CACHE.set(key, existing);

    // Persist to chrome.storage if enabled
    if (AI_CONFIG?.extractionConfig?.persistPerformanceMetrics) {
      try {
        const persistentData = {};
        persistentData[`extractionPerf_${siteType}`] = existing;
        
        if (typeof robustStorageOperation !== 'undefined') {
          await robustStorageOperation('set', persistentData);
        } else {
          // Fallback storage
          chrome.storage.local.set(persistentData);
        }
        
        this.debugLog(`Performance metrics persisted for ${siteType}`, {
          siteType,
          samplesStored: existing.length
        });
      } catch (storageError) {
        console.warn(`[ExtractionManager-v${this.VERSION}] Failed to persist performance metrics`, {
          error: storageError.message,
          siteType
        });
      }
    }
  },

  // ===== RESTORE PERSISTENT PERFORMANCE CACHE =====
  async restorePerformanceCacheFromStorage() {
    try {
      const keys = Object.values(DEFAULT_SITE_TIMEOUTS).map(key => `extractionPerf_${key}`);
      
      let storedData;
      if (typeof robustStorageOperation !== 'undefined') {
        storedData = await robustStorageOperation('get', null, keys);
      } else {
        // Fallback storage
        storedData = await new Promise(resolve => {
          chrome.storage.local.get(keys, resolve);
        });
      }

      let restoredCount = 0;
      Object.entries(storedData).forEach(([storageKey, metrics]) => {
        if (metrics && Array.isArray(metrics)) {
          const siteType = storageKey.replace('extractionPerf_', '');
          const cacheKey = `perf_${siteType}`;
          EXTRACTION_PERFORMANCE_CACHE.set(cacheKey, metrics);
          restoredCount += metrics.length;
        }
      });

      if (restoredCount > 0) {
        console.log(`[ExtractionManager-v${this.VERSION}] Restored ${restoredCount} performance metrics from storage`);
      }

    } catch (error) {
      this.debugLog('Could not restore performance cache from storage', {
        error: error.message
      });
    }
  },

  // ===== ENHANCED DEBUG LOGGING SYSTEM =====
  debugLog(message, metadata = {}) {
    if (DEBUG_LOGGING_ENABLED) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [ExtractionManager-v${this.VERSION}] ${message}`, metadata);
    }
  },

  setDebugLogging(enabled) {
    DEBUG_LOGGING_ENABLED = enabled;
    this.debugLog(`Debug logging ${enabled ? 'enabled' : 'disabled'}`);
  },

  // ===== BASIC EXTRACTION PROCESSING (Enhanced) =====
  async processBasicExtraction(pageData, url, siteType, AI_CONFIG) {
    let extractionResult;

    // Use modular DOM extractor with caching
    if (AI_CONFIG.utilityStatus?.extractor?.loaded && this.isModuleLoaded('DOMExtractor')) {
      const cacheKey = `${siteType}_${url}`;
      
      if (AI_CONFIG.cache?.schemaMappings?.has(cacheKey)) {
        this.debugLog(`Using cached extraction result for ${siteType}`, { siteType, url });
        extractionResult = AI_CONFIG.cache.schemaMappings.get(cacheKey);
      } else {
        extractionResult = DOMExtractor.extractFromPageData(pageData, siteType);
        if (AI_CONFIG.cache?.schemaMappings) {
          AI_CONFIG.cache.schemaMappings.set(cacheKey, extractionResult);
        }
        this.debugLog(`Using championship DOMExtractor with caching`, { siteType });
      }
    } else {
      extractionResult = this.executeBasicExtractionFallback(pageData, url);
      this.debugLog(`Using fallback basic extraction`, { siteType });
    }

    return extractionResult;
  },

  // ===== ENHANCED EXTRACTION PIPELINE WITH VERSION SYNC =====
  async executeEnhancedExtractionPipeline(pageData, url, siteType, AI_CONFIG) {
    const pipelineStart = Date.now();
    const stageTimings = {};
    const pipelineStages = [];

    // Phase 1: DOM Extraction
    const domStart = Date.now();
    let finalResult = await this.processBasicExtraction(pageData, url, siteType, AI_CONFIG);
    stageTimings.domExtraction = Date.now() - domStart;
    pipelineStages.push('DOM_EXTRACTION');

    // Phase 2: AI Enhancement (if available and synced with BackgroundUtils version)
    if (AI_CONFIG.apiKey && AI_CONFIG.utilityStatus?.aiExtractor?.loaded && this.isModuleLoaded('AIExtractorManager')) {
      const aiStart = Date.now();
      try {
        this.debugLog(`Enhancing with championship AI extractor for ${siteType}`, {
          siteType,
          utilsVersion: AI_CONFIG.utilityStatus?.utils?.version,
          extractorVersion: this.VERSION
        });
        
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
          this.debugLog(`AI enhancement successful`, { siteType });
        } else {
          pipelineStages.push('AI_ENHANCEMENT_FAILED');
        }

      } catch (aiError) {
        pipelineStages.push('AI_ENHANCEMENT_ERROR');
        console.warn(`[ExtractionManager-v${this.VERSION}] AI enhancement failed, using DOM result`, {
          error: aiError.message,
          siteType
        });
      }
      stageTimings.aiEnhancement = Date.now() - aiStart;
    }

    // Phase 3: Schema Mapping with Caching
    const schemaStart = Date.now();
    finalResult = await this.applySchemaMapping(finalResult, siteType, AI_CONFIG);
    stageTimings.schemaMapping = Date.now() - schemaStart;
    if (finalResult.schemaMapped) {
      pipelineStages.push('SCHEMA_MAPPING');
    }

    // Phase 4: Validation with Version Consistency Check
    const validationStart = Date.now();
    const validationResult = await this.executeValidation(finalResult.data, siteType, AI_CONFIG);
    stageTimings.validation = Date.now() - validationStart;
    pipelineStages.push('VALIDATION');

    // Calculate accuracies with version-consistent methods
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
        stagesCompleted: pipelineStages.length,
        versionSync: {
          extractorVersion: this.VERSION,
          utilsVersion: AI_CONFIG.utilityStatus?.utils?.version || 'unknown'
        }
      }
    };
  },

  // ===== REMAINING METHODS (Enhanced with debug logging and version consistency) =====
  async applySchemaMapping(extractionResult, siteType, AI_CONFIG) {
    if (AI_CONFIG.utilityStatus?.schemas?.loaded && this.isModuleLoaded('SchemaManager')) {
      const cacheKey = `schema_${siteType}`;
      let mappingResult;
      
      if (AI_CONFIG.cache?.schemaMappings?.has(cacheKey)) {
        const cachedMapping = AI_CONFIG.cache.schemaMappings.get(cacheKey);
        mappingResult = SchemaManager.mapDataToSchema(extractionResult.data, siteType, cachedMapping);
        this.debugLog(`Using cached schema mapping for ${siteType}`, { siteType });
      } else {
        mappingResult = SchemaManager.mapDataToSchema(extractionResult.data, siteType);
        if (AI_CONFIG.cache?.schemaMappings) {
          AI_CONFIG.cache.schemaMappings.set(cacheKey, mappingResult.schema);
        }
        this.debugLog(`Applied fresh schema mapping for ${siteType}`, { siteType });
      }
      
      extractionResult.data = mappingResult.mappedData;
      extractionResult.schemaMapped = true;
      extractionResult.mappingLog = mappingResult.mappingLog;
    }

    return extractionResult;
  },

  async executeValidation(data, siteType, AI_CONFIG) {
    if (typeof ValidationManager !== 'undefined') {
      this.debugLog(`Using ValidationManager for ${siteType}`, { siteType });
      return ValidationManager.executeUnifiedValidation(data, siteType, AI_CONFIG);
    } else {
      this.debugLog(`Using fallback validation for ${siteType}`, { siteType });
      return this.executeBasicValidationFallback(data);
    }
  },

  // ===== FALLBACK IMPLEMENTATIONS (Enhanced with debug logging) =====
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

    this.debugLog(`Fallback extraction completed`, {
      url,
      fieldCount: Object.keys(extractedData).length,
      duration: Date.now() - startTime
    });

    return {
      success: true,
      data: extractedData,
      metadata: {
        extractionTime: Date.now() - startTime,
        method: 'basic-fallback-modular',
        realAI: false,
        url: url,
        extractionManager: this.VERSION
      }
    };
  },

  executeBasicValidationFallback(data) {
    const penalties = [];
    const validatedData = {...data};

    // Enhanced validation with field score impact
    const validations = [
      {
        field: 'price',
        test: data => data.price && !this.validatePrice(data.price),
        reason: 'INVALID_FORMAT',
        scoreImpact: 15,
        severity: 'MEDIUM'
      },
      {
        field: 'ingredients',
        test: data => data.ingredients && Array.isArray(data.ingredients) && data.ingredients.length < 3,
        reason: 'INSUFFICIENT_ITEMS',
        scoreImpact: 20,
        severity: 'HIGH'
      },
      {
        field: 'instructions',
        test: data => data.instructions && Array.isArray(data.instructions) && data.instructions.length < 2,
        reason: 'INSUFFICIENT_STEPS',
        scoreImpact: 20,
        severity: 'HIGH'
      },
      {
        field: 'reviews_rating',
        test: data => data.reviews_rating && !this.validateRating(data.reviews_rating),
        reason: 'INVALID_RATING_FORMAT',
        scoreImpact: 10,
        severity: 'MEDIUM'
      }
    ];

    validations.forEach(validation => {
      if (validation.test(data)) {
        penalties.push({
          field: validation.field,
          reason: validation.reason,
          original: data[validation.field],
          scoreImpact: validation.scoreImpact,
          severity: validation.severity,
          timestamp: new Date().toISOString()
        });
        
        validatedData[validation.field] = Array.isArray(data[validation.field]) ? [] : null;
      }
    });

    const rawAccuracy = this.calculateAccuracy(data);
    const validatedAccuracy = this.calculateAccuracy(validatedData);
    const penaltyImpact = rawAccuracy > 0 ? ((rawAccuracy - validatedAccuracy) / rawAccuracy) * 100 : 0;

    this.debugLog(`Fallback validation completed`, {
      penalties: penalties.length,
      rawAccuracy: rawAccuracy.toFixed(1),
      validatedAccuracy: validatedAccuracy.toFixed(1)
    });

    return {
      validatedData: validatedData,
      penalties: penalties,
      penaltyImpact: this.normalizePercentage(penaltyImpact),
      businessRealismProof: penalties.length > 0
    };
  },

  // ===== UTILITY FUNCTIONS (Enhanced) =====
  determineSiteTypeWithCache(url, cache) {
    if (typeof BackgroundUtils !== 'undefined') {
      return BackgroundUtils.determineSiteTypeEnhanced(url, cache);
    }
    
    // Fallback site type determination
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
    if (typeof BackgroundUtils !== 'undefined') {
      return BackgroundUtils.calculateAccuracyEnhanced(data, false);
    }
    
    // Fallback accuracy calculation
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

  // ===== PERFORMANCE MONITORING (Enhanced) =====
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

  getPerformanceMetrics(siteType) {
    const key = `perf_${siteType}`;
    const metrics = EXTRACTION_PERFORMANCE_CACHE.get(key) || [];
    
    if (metrics.length === 0) return null;
    
    const durations = metrics.map(m => m.duration);
    return {
      siteType,
      samples: durations.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      lastMeasurement: metrics[metrics.length - 1].timestamp,
      version: this.VERSION
    };
  },

  // ===== HELPER FUNCTIONS (Enhanced) =====
  wasCacheUsed(siteType, url, cache) {
    if (!cache?.schemaMappings) return false;
    return cache.schemaMappings.has(`${siteType}_${url}`) || 
           cache.schemaMappings.has(`schema_${siteType}`);
  },

  getLoadedModulesInfo(utilityStatus) {
    return Object.fromEntries(
      Object.entries(utilityStatus || {})
        .filter(([_, status]) => status.loaded)
        .map(([key, status]) => [key, status.version])
    );
  },

  // ===== ENHANCED SYSTEM STATUS AND MANAGEMENT =====
  clearPerformanceCache() {
    EXTRACTION_PERFORMANCE_CACHE.clear();
    console.log(`[${new Date().toISOString()}] [ExtractionManager-v${this.VERSION}] Performance cache cleared`);
  },

  getSystemStatus() {
    return {
      version: this.VERSION,
      debugLogging: DEBUG_LOGGING_ENABLED,
      performanceCache: {
        entries: EXTRACTION_PERFORMANCE_CACHE.size,
        siteTypes: Array.from(EXTRACTION_PERFORMANCE_CACHE.keys()).map(key => key.replace('perf_', ''))
      },
      timeoutConfiguration: DEFAULT_SITE_TIMEOUTS,
      constants: {
        deploymentTimeout: DEFAULT_DEPLOYMENT_TIMEOUT,
        extractionTimeout: DEFAULT_EXTRACTION_TIMEOUT,
        initializationDelay: CONTENT_SCRIPT_INITIALIZATION_DELAY
      },
      activeTabTracking: {
        trackedTabs: TAB_RETRY_TRACKING.size,
        tabIds: Array.from(TAB_RETRY_TRACKING.keys())
      }
    };
  },

  // ===== INITIALIZATION AND CLEANUP =====
  async initialize(AI_CONFIG) {
    this.debugLog('Initializing ExtractionManager', {
      version: this.VERSION,
      debugLogging: DEBUG_LOGGING_ENABLED
    });

    // Set debug logging from config
    if (AI_CONFIG?.extractionConfig?.debugLogging !== undefined) {
      this.setDebugLogging(AI_CONFIG.extractionConfig.debugLogging);
    }

    // Restore performance cache from storage
    await this.restorePerformanceCacheFromStorage();

    this.debugLog('ExtractionManager initialization complete');
  }
};

// Initialize if in service worker context
if (typeof chrome !== 'undefined' && chrome.runtime) {
  // Auto-initialize when module loads
  setTimeout(() => {
    if (typeof AI_CONFIG !== 'undefined') {
      ExtractionManager.initialize(AI_CONFIG);
    }
  }, 1000);
}

console.log(`[ExtractionManager-v${ExtractionManager.VERSION}] Championship enterprise extraction module loaded with comprehensive tracking`);

// Export for global access
if (typeof window !== 'undefined') {
  window.ExtractionManager = ExtractionManager;
}
