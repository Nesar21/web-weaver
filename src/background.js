// Day 8: Ultimate Final Background Engine - Zero Compromise Championship Edition
// /background.js

console.log('[Background] Day 8 ULTIMATE FINAL system loading - Zero compromise championship architecture');

// ===== CORE CONFIGURATION =====
const DAY8_VERSION = 'day8-ultimate-final-enterprise';

// Enhanced AI Configuration - All magic numbers parameterized
let AI_CONFIG = {
  model: 'gemini-1.5-flash-8b-001',
  maxTokens: 3000,
  temperature: 0.1,
  aiTimeout: 25000,
  tabTimeout: 6000,
  maxConcurrentTabs: 8,
  apiKey: null,
  day8Version: DAY8_VERSION,
  modulesLoaded: false,
  
  // FINAL: Strict Critical Module Enforcement
  criticalModules: ['utils', 'extraction'], // Must have ALL these to function
  
  // Configurable boosts for sensitivity testing
  boosts: {
    moduleBoost: 8,
    aiBoost: 12,
    schemaBoost: 5,
    validatorBoost: 3
  },
  
  // FINAL: Enhanced logging configuration with single timestamp optimization
  logging: {
    throttleModuleLoads: true,
    maxLogsPerSecond: 10,
    lastLogTime: 0,
    timestampCache: null,
    timestampCacheExpiry: 100 // 100ms cache for high-frequency operations
  },
  
  // Module status with STRICT VERSION enforcement
  utilityStatus: {
    extractor: { loaded: false, version: null, retries: 0 },
    aiExtractor: { loaded: false, version: null, retries: 0 },
    validator: { loaded: false, version: null, retries: 0 },
    schemas: { loaded: false, version: null, retries: 0 }
  },
  
  // FINAL: Performance caching with immediate persistence
  cache: {
    schemaMappings: new Map(),
    siteConfigs: new Map(),
    apiValidation: null,
    configTimestamp: null,
    configExpiry: 3600000, // 1 hour
    persistenceQueue: new Set() // Track pending persistence operations
  },
  
  // External module support with VERSION enforcement
  externalModules: {
    utils: { loaded: false, version: null },
    extraction: { loaded: false, version: null },
    validation: { loaded: false, version: null },
    simulation: { loaded: false, version: null }
  }
};

// Day 7 Baseline for trajectory analysis
const DAY7_BASELINE = {
  bloomberg: 31,
  amazon: 26,
  allrecipes: 18,
  wikipedia: 68,
  weightedAverage: 28.8,
  timestamp: '2025-09-26'
};

// ===== IMMEDIATE CACHE PERSISTENCE SYSTEM (FINAL Enhancement) =====
async function persistCacheImmediately(key, data, retryCount = 0) {
  const maxRetries = 3;
  
  try {
    await new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: data }, () => {
        if (chrome.runtime.lastError) {
          BackgroundLogger.error(`Cache persistence failed for ${key}`, { 
            error: chrome.runtime.lastError.message,
            retry: retryCount
          });
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
    
    AI_CONFIG.cache.persistenceQueue.delete(key);
    BackgroundLogger.throttledInfo(`Cache persisted immediately: ${key}`);
    
  } catch (error) {
    if (retryCount < maxRetries) {
      BackgroundLogger.warn(`Retrying cache persistence for ${key}, attempt ${retryCount + 1}`);
      setTimeout(() => persistCacheImmediately(key, data, retryCount + 1), 1000);
    } else {
      BackgroundLogger.error(`Failed to persist cache after ${maxRetries} attempts: ${key}`);
    }
  }
}

// Enhanced cache update with immediate persistence
function updateCacheWithPersistence(cacheType, key, value) {
  AI_CONFIG.cache[cacheType].set(key, value);
  
  // Queue for immediate persistence
  const persistenceKey = `${cacheType}Cache`;
  if (!AI_CONFIG.cache.persistenceQueue.has(persistenceKey)) {
    AI_CONFIG.cache.persistenceQueue.add(persistenceKey);
    
    // Convert Map to array and persist immediately
    const dataArray = Array.from(AI_CONFIG.cache[cacheType].entries());
    persistCacheImmediately(persistenceKey, dataArray);
  }
}

// ===== ENHANCED SCRIPT LOADER WITH RACE CONDITION PREVENTION (FINAL) =====
async function loadScriptWithRetries(file, globalVar, maxRetries = 3) {
  const existingScript = document.querySelector(`script[src*="${file}"]`);
  if (existingScript) {
    // Script already exists, check if global variable is available
    if (typeof window[globalVar] !== 'undefined') {
      BackgroundLogger.throttledInfo(`Script already loaded: ${file}`);
      return true;
    } else {
      BackgroundLogger.throttledWarn(`Script exists but global ${globalVar} not found, removing and retrying...`);
      existingScript.remove();
      
      // FINAL: Optional delay to prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL(file);
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${file}`));
        document.head.appendChild(script);
      });
      
      // Verify global variable is available
      if (typeof window[globalVar] !== 'undefined') {
        BackgroundLogger.throttledInfo(`Successfully loaded: ${file}`);
        return true;
      } else {
        throw new Error(`Global ${globalVar} not found after loading ${file}`);
      }
      
    } catch (e) {
      BackgroundLogger.throttledWarn(`Retry ${attempt + 1}/${maxRetries} for ${file}`, { error: e.message });
      if (attempt === maxRetries - 1) {
        BackgroundLogger.error(`Failed final attempt: ${file}`, { error: e.message });
        return false;
      }
      
      // Small delay between retries
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  return false;
}

// ===== FINAL: STRICT CRITICAL MODULE ENFORCEMENT =====
async function loadModularSystem() {
  if (AI_CONFIG.modulesLoaded) {
    BackgroundLogger.throttledInfo('Modules already loaded');
    return true;
  }

  BackgroundLogger.throttledInfo('Loading championship-grade FINAL modular system...');

  try {
    // Load external modules first (utils, extraction, validation, simulation)
    const externalModules = [
      { file: 'src/modules/utils.js', key: 'utils', globalVar: 'BackgroundUtils' },
      { file: 'src/modules/extraction.js', key: 'extraction', globalVar: 'ExtractionManager' },
      { file: 'src/modules/validation.js', key: 'validation', globalVar: 'ValidationManager' },
      { file: 'src/modules/simulation.js', key: 'simulation', globalVar: 'SimulationManager' }
    ];

    // Load external modules in parallel using unified loader
    const externalPromises = externalModules.map(async (module) => {
      const success = await loadScriptWithRetries(module.file, module.globalVar);
      AI_CONFIG.externalModules[module.key].loaded = success;
      
      if (success) {
        // FINAL: Strict VERSION requirement - no fallbacks
        const moduleVersion = window[module.globalVar]?.VERSION;
        if (!moduleVersion) {
          BackgroundLogger.error(`Module ${module.key} loaded but missing VERSION property`, {
            file: module.file,
            globalVar: module.globalVar
          });
          AI_CONFIG.externalModules[module.key].loaded = false;
          return false;
        }
        AI_CONFIG.externalModules[module.key].version = moduleVersion;
        BackgroundLogger.throttledInfo(`Module ${module.key} loaded with VERSION ${moduleVersion}`);
      }
      
      return success;
    });

    const externalResults = await Promise.allSettled(externalPromises);

    // Load utility modules using unified loader
    await loadUtilityModules();

    // Load external configurations with caching
    await loadExternalConfigsWithCaching();

    // FINAL: STRICT Critical module validation - ALL must be loaded
    const criticalModulesLoaded = AI_CONFIG.criticalModules.every(moduleName => 
      AI_CONFIG.externalModules[moduleName]?.loaded === true
    );

    // FINAL: modulesLoaded ONLY true if ALL critical modules loaded
    AI_CONFIG.modulesLoaded = criticalModulesLoaded;

    if (criticalModulesLoaded) {
      BackgroundLogger.info('✅ ALL CRITICAL modules loaded successfully', {
        criticalModules: AI_CONFIG.criticalModules,
        versions: Object.fromEntries(
          AI_CONFIG.criticalModules.map(name => [
            name, 
            AI_CONFIG.externalModules[name]?.version || 'UNKNOWN'
          ])
        )
      });
    } else {
      const failedCritical = AI_CONFIG.criticalModules.filter(moduleName => 
        !AI_CONFIG.externalModules[moduleName]?.loaded
      );
      
      BackgroundLogger.error('❌ CRITICAL MODULES FAILED TO LOAD', {
        failedModules: failedCritical,
        systemWillNotStart: true
      });
      
      throw new Error(`Critical modules failed: ${failedCritical.join(', ')}`);
    }

    return AI_CONFIG.modulesLoaded;

  } catch (error) {
    BackgroundLogger.error('💥 CRITICAL: Modular system initialization failed', { 
      error: error.message,
      criticalModulesRequired: AI_CONFIG.criticalModules
    });
    return false;
  }
}

// ===== UTILITY MODULE LOADER WITH STRICT VERSION ENFORCEMENT =====
async function loadUtilityModules() {
  const utilityConfigs = [
    { file: 'src/utils/extractor.js', globalVar: 'DOMExtractor', key: 'extractor' },
    { file: 'src/utils/ai-extractor.js', globalVar: 'AIExtractorManager', key: 'aiExtractor' },
    { file: 'src/utils/validator.js', globalVar: 'ValidatorManager', key: 'validator' },
    { file: 'src/utils/schemas.js', globalVar: 'SchemaManager', key: 'schemas' }
  ];

  const loadPromises = utilityConfigs.map(async (config) => {
    const success = await loadScriptWithRetries(config.file, config.globalVar);
    AI_CONFIG.utilityStatus[config.key].loaded = success;
    
    if (success) {
      // FINAL: Strict VERSION requirement
      const version = window[config.globalVar]?.VERSION;
      if (!version) {
        BackgroundLogger.warn(`Utility ${config.key} missing VERSION property`, {
          file: config.file
        });
        // For utilities, we allow fallback to maintain compatibility
        AI_CONFIG.utilityStatus[config.key].version = 'LEGACY';
      } else {
        AI_CONFIG.utilityStatus[config.key].version = version;
      }
    }
    
    return success;
  });

  await Promise.allSettled(loadPromises);
}

// ===== ROBUST CHROME.STORAGE ERROR HANDLING (FINAL Enhancement) =====
async function robustStorageOperation(operation, data = null, key = null) {
  return new Promise((resolve, reject) => {
    const callback = (result) => {
      if (chrome.runtime.lastError) {
        BackgroundLogger.error(`Storage operation failed: ${operation}`, {
          error: chrome.runtime.lastError.message,
          key: key,
          operation: operation
        });
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    };

    switch (operation) {
      case 'get':
        chrome.storage.local.get(key, callback);
        break;
      case 'set':
        chrome.storage.local.set(data, callback);
        break;
      case 'remove':
        chrome.storage.local.remove(key, callback);
        break;
      case 'clear':
        chrome.storage.local.clear(callback);
        break;
      default:
        reject(new Error(`Unknown storage operation: ${operation}`));
    }
  });
}

// ===== EXTERNAL CONFIGURATION LOADER WITH ROBUST ERROR HANDLING =====
async function loadExternalConfigsWithCaching() {
  try {
    const now = Date.now();
    
    // Check if we have valid cached config
    if (AI_CONFIG.cache.configTimestamp && 
        (now - AI_CONFIG.cache.configTimestamp) < AI_CONFIG.cache.configExpiry &&
        AI_CONFIG.cache.siteConfigs.has('enterprise')) {
      BackgroundLogger.throttledInfo('Using cached external configuration');
      return;
    }

    // Load from chrome.storage.local with robust error handling
    try {
      const storedConfig = await robustStorageOperation('get', null, ['enterpriseConfig', 'configTimestamp']);
      
      if (storedConfig.enterpriseConfig && storedConfig.configTimestamp &&
          (now - storedConfig.configTimestamp) < AI_CONFIG.cache.configExpiry) {
        AI_CONFIG.cache.siteConfigs.set('enterprise', storedConfig.enterpriseConfig);
        AI_CONFIG.cache.configTimestamp = storedConfig.configTimestamp;
        BackgroundLogger.throttledInfo('Loaded external configuration from persistent cache');
        return;
      }
    } catch (storageError) {
      BackgroundLogger.warn('Failed to load config from storage, fetching fresh', {
        error: storageError.message
      });
    }

    // Fetch fresh configuration
    const configResponse = await fetch(chrome.runtime.getURL('config/enterprise-sites.json'));
    if (configResponse.ok) {
      const externalSites = await configResponse.json();
      AI_CONFIG.cache.siteConfigs.set('enterprise', externalSites);
      AI_CONFIG.cache.configTimestamp = now;
      
      // Store in persistent cache with robust error handling
      try {
        await robustStorageOperation('set', {
          enterpriseConfig: externalSites,
          configTimestamp: now
        });
        BackgroundLogger.throttledInfo('Loaded and persisted fresh external enterprise site configuration');
      } catch (persistError) {
        BackgroundLogger.warn('Config loaded but persistence failed', {
          error: persistError.message
        });
      }
    }
  } catch (error) {
    BackgroundLogger.debug('Using default enterprise site configuration', { error: error.message });
  }
}

// ===== FINAL: OPTIMIZED LOGGING SYSTEM WITH TIMESTAMP CACHING =====
const BackgroundLogger = {
  _getOptimizedTimestamp() {
    const now = Date.now();
    
    // Use cached timestamp if within expiry window
    if (AI_CONFIG.logging.timestampCache && 
        (now - AI_CONFIG.logging.timestampCache.time) < AI_CONFIG.logging.timestampCacheExpiry) {
      return AI_CONFIG.logging.timestampCache.iso;
    }
    
    // Generate new timestamp and cache it
    const timestamp = new Date(now).toISOString();
    AI_CONFIG.logging.timestampCache = {
      time: now,
      iso: timestamp
    };
    
    return timestamp;
  },

  _shouldLog(level = 'info') {
    if (!AI_CONFIG.logging.throttleModuleLoads) return true;
    
    const now = Date.now();
    const timeSinceLastLog = now - AI_CONFIG.logging.lastLogTime;
    const minInterval = 1000 / AI_CONFIG.logging.maxLogsPerSecond;
    
    if (timeSinceLastLog >= minInterval) {
      AI_CONFIG.logging.lastLogTime = now;
      return true;
    }
    return false;
  },

  info: (msg, meta = {}) => {
    const timestamp = BackgroundLogger._getOptimizedTimestamp();
    console.log(`[${timestamp}] [Background] ${msg}`, meta);
  },
  
  throttledInfo: (msg, meta = {}) => {
    if (BackgroundLogger._shouldLog('info')) {
      BackgroundLogger.info(msg, meta);
    }
  },
  
  warn: (msg, meta = {}) => {
    const timestamp = BackgroundLogger._getOptimizedTimestamp();
    console.warn(`[${timestamp}] [Background] ${msg}`, meta);
  },
  
  throttledWarn: (msg, meta = {}) => {
    if (BackgroundLogger._shouldLog('warn')) {
      BackgroundLogger.warn(msg, meta);
    }
  },
  
  error: (msg, meta = {}) => {
    const timestamp = BackgroundLogger._getOptimizedTimestamp();
    console.error(`[${timestamp}] [Background] ${msg}`, meta);
  },
  
  debug: (msg, meta = {}) => {
    const timestamp = BackgroundLogger._getOptimizedTimestamp();
    console.debug(`[${timestamp}] [Background] ${msg}`, meta);
  }
};

// ===== FINAL: ENHANCED INITIALIZATION WITH COMPREHENSIVE ERROR HANDLING =====
(async () => {
  try {
    // Robust storage operation for API key retrieval
    const result = await robustStorageOperation('get', null, ['geminiApiKey']);

    if (result.geminiApiKey) {
      AI_CONFIG.apiKey = result.geminiApiKey;
      // FINAL: Complete security - no key exposure in logs
      BackgroundLogger.info('API key loaded - Enterprise ready', {
        keyLength: result.geminiApiKey.length,
        hasKey: true
      });
      
      // Asynchronous API key validation
      if (AI_CONFIG.externalModules.utils.loaded && typeof BackgroundUtils !== 'undefined') {
        BackgroundUtils.validateApiKeyAsync(result.geminiApiKey);
      }
    } else {
      BackgroundLogger.info('No API key found, basic extraction only');
    }

    // Initialize modular system
    const systemLoaded = await loadModularSystem();
    
    if (!systemLoaded) {
      const errorMessage = 'CRITICAL: Modular system failed to initialize - all critical modules must load';
      BackgroundLogger.error(errorMessage);
      
      // FINAL: Always throw for any critical module failure
      throw new Error(errorMessage);
    }
    
    BackgroundLogger.info('🚀 System initialization completed successfully');
    
  } catch (initError) {
    BackgroundLogger.error('💥 System initialization FAILED', { 
      error: initError.message,
      stack: initError.stack,
      criticalModules: AI_CONFIG.criticalModules,
      moduleStatus: AI_CONFIG.externalModules
    });
    
    // FINAL: Always re-throw initialization errors
    throw initError;
  }
})().catch(error => {
  // Final error boundary
  console.error('🔥 FATAL: Background script initialization failed completely', {
    error: error.message,
    timestamp: new Date().toISOString()
  });
});

// ===== ENHANCED API KEY VALIDATION (FINAL - flexible regex) =====
function validateApiKeyFormat(apiKey) {
  // More flexible API key validation
  const patterns = [
    /^AIza[0-9A-Za-z_-]{35}$/, // Standard Google API key format
    /^[A-Za-z0-9_-]{30,}$/ // Generic long API key format
  ];
  
  return patterns.some(pattern => pattern.test(apiKey));
}

// ===== FINAL: ENHANCED MESSAGE LISTENER WITH COMPLETE CONSISTENCY =====
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  BackgroundLogger.throttledInfo(`ULTIMATE request: ${request.action}`, {
    sender: sender.tab?.url,
    hasApiKey: !!AI_CONFIG.apiKey,
    modulesLoaded: AI_CONFIG.modulesLoaded
  });
  
  try {
    switch (request.action) {
      case 'extractPageData':
        handleBasicExtraction(request, sender, sendResponse);
        return true; // Async handler - keep channel open

      case 'extractData':
        handleEnhancedExtraction(request, sender, sendResponse);
        return true; // Async handler - keep channel open

      case 'runStressTest':
        handleEnterpriseSimulation(request, sendResponse);
        return true; // Async handler - keep channel open

      case 'runRealStressTest':
        handleRealStressTest(request, sendResponse);
        return true; // Async handler - keep channel open

      case 'setApiKey':
        handleApiKeySet(request, sendResponse);
        return true; // Async handler - keep channel open

      case 'getApiKey':
        sendResponse({
          hasKey: !!AI_CONFIG.apiKey,
          day8Version: true,
          keyLength: AI_CONFIG.apiKey ? AI_CONFIG.apiKey.length : 0,
          enterpriseReady: true,
          realTestingReady: true,
          modulesLoaded: AI_CONFIG.modulesLoaded,
          criticalModulesLoaded: AI_CONFIG.criticalModules.every(moduleName => 
            AI_CONFIG.externalModules[moduleName]?.loaded === true
          ),
          externalModules: AI_CONFIG.externalModules,
          utilityStatus: AI_CONFIG.utilityStatus,
          version: DAY8_VERSION
        });
        return false; // Synchronous response

      case 'getSystemStatus':
        sendResponse({
          modulesLoaded: AI_CONFIG.modulesLoaded,
          criticalModulesLoaded: AI_CONFIG.criticalModules.every(moduleName => 
            AI_CONFIG.externalModules[moduleName]?.loaded === true
          ),
          externalModules: AI_CONFIG.externalModules,
          utilityStatus: AI_CONFIG.utilityStatus,
          day8Version: DAY8_VERSION,
          cache: {
            schemaMappings: AI_CONFIG.cache.schemaMappings.size,
            siteConfigs: AI_CONFIG.cache.siteConfigs.size,
            configAge: AI_CONFIG.cache.configTimestamp ? 
              Date.now() - AI_CONFIG.cache.configTimestamp : null,
            pendingPersistence: AI_CONFIG.cache.persistenceQueue.size
          }
        });
        return false; // Synchronous response

      case 'clearCache':
        // Enhanced cache clearing with robust storage operations
        (async () => {
          try {
            AI_CONFIG.cache.schemaMappings.clear();
            AI_CONFIG.cache.siteConfigs.clear();
            AI_CONFIG.cache.apiValidation = null;
            AI_CONFIG.cache.configTimestamp = null;
            AI_CONFIG.cache.persistenceQueue.clear();
            
            // Clear persistent cache with robust error handling
            await robustStorageOperation('remove', null, ['enterpriseConfig', 'configTimestamp', 'schemaMappingsCache']);
            
            sendResponse({ 
              success: true, 
              message: 'All caches cleared (memory + persistent) with robust error handling' 
            });
          } catch (error) {
            sendResponse({ 
              success: false, 
              error: error.message,
              message: 'Cache clearing failed'
            });
          }
        })();
        return true; // Async handler - keep channel open

      case 'reloadModules':
        // FINAL: Enhanced module reloading with critical module failure detection
        (async () => {
          try {
            BackgroundLogger.info('🔄 Starting module reload...');
            AI_CONFIG.modulesLoaded = false;
            
            // Clear module status
            Object.keys(AI_CONFIG.externalModules).forEach(key => {
              AI_CONFIG.externalModules[key].loaded = false;
              AI_CONFIG.externalModules[key].version = null;
            });
            
            const reloaded = await loadModularSystem();
            
            if (!reloaded) {
              const failedCritical = AI_CONFIG.criticalModules.filter(moduleName => 
                !AI_CONFIG.externalModules[moduleName]?.loaded
              );
              
              throw new Error(`Critical module reload failed: ${failedCritical.join(', ')}`);
            }
            
            sendResponse({ 
              success: true, 
              message: 'All critical modules reloaded successfully',
              criticalModulesStatus: AI_CONFIG.criticalModules.map(name => ({
                module: name,
                loaded: AI_CONFIG.externalModules[name]?.loaded || false,
                version: AI_CONFIG.externalModules[name]?.version || 'UNKNOWN'
              }))
            });
          } catch (error) {
            BackgroundLogger.error('❌ Module reload failed', { error: error.message });
            sendResponse({ 
              success: false, 
              error: error.message,
              criticalFailure: true
            });
          }
        })();
        return true; // Async handler - keep channel open

      default:
        BackgroundLogger.warn(`Unknown action: ${request.action}`);
        sendResponse({ 
          success: false, 
          error: 'Unknown action', 
          day8Version: DAY8_VERSION 
        });
        return false; // Synchronous response
    }

  } catch (error) {
    BackgroundLogger.error(`Critical error handling ${request.action}`, {
      error: error.message,
      stack: error.stack
    });
    
    sendResponse({
      success: false,
      error: error.message,
      errorType: 'DAY8_CRITICAL_MESSAGE_HANDLER_ERROR',
      timestamp: new Date().toISOString(),
      version: DAY8_VERSION
    });
    return false; // Error response is synchronous
  }
});

// ===== HANDLER FUNCTIONS WITH ENHANCED CRITICAL MODULE STATUS REPORTING =====
function handleBasicExtraction(request, sender, sendResponse) {
  if (AI_CONFIG.externalModules.extraction.loaded && typeof ExtractionManager !== 'undefined') {
    ExtractionManager.handleBasicExtraction(request, sender, sendResponse, AI_CONFIG);
  } else {
    BackgroundLogger.warn('ExtractionManager not loaded - CRITICAL MODULE FAILURE');
    sendResponse({ 
      success: false, 
      error: 'Extraction modules not available - CRITICAL SYSTEM FAILURE',
      fallbackAvailable: false,
      criticalModulesStatus: AI_CONFIG.criticalModules.map(name => ({
        module: name,
        loaded: AI_CONFIG.externalModules[name]?.loaded || false,
        version: AI_CONFIG.externalModules[name]?.version || 'MISSING',
        isCritical: true
      })),
      systemStatus: 'DEGRADED'
    });
  }
}

function handleEnhancedExtraction(request, sender, sendResponse) {
  if (AI_CONFIG.externalModules.extraction.loaded && typeof ExtractionManager !== 'undefined') {
    ExtractionManager.handleEnhancedExtraction(request, sender, sendResponse, AI_CONFIG);
  } else {
    BackgroundLogger.warn('ExtractionManager not loaded - CRITICAL MODULE FAILURE');
    sendResponse({ 
      success: false, 
      error: 'Enhanced extraction modules not available - CRITICAL SYSTEM FAILURE',
      fallbackAvailable: false,
      criticalModulesStatus: AI_CONFIG.criticalModules.map(name => ({
        module: name,
        loaded: AI_CONFIG.externalModules[name]?.loaded || false,
        version: AI_CONFIG.externalModules[name]?.version || 'MISSING',
        isCritical: true
      })),
      systemStatus: 'DEGRADED'
    });
  }
}

function handleEnterpriseSimulation(request, sendResponse) {
  if (AI_CONFIG.externalModules.simulation.loaded && typeof SimulationManager !== 'undefined') {
    SimulationManager.handleEnterpriseSimulation(request, sendResponse, AI_CONFIG, DAY7_BASELINE);
  } else {
    BackgroundLogger.warn('SimulationManager not loaded');
    sendResponse({ 
      success: false, 
      error: 'Simulation modules not available',
      fallbackAvailable: false,
      moduleType: 'OPTIONAL'
    });
  }
}

function handleRealStressTest(request, sendResponse) {
  if (AI_CONFIG.externalModules.simulation.loaded && typeof SimulationManager !== 'undefined') {
    SimulationManager.handleRealStressTest(request, sendResponse, AI_CONFIG);
  } else {
    BackgroundLogger.warn('SimulationManager not loaded');
    sendResponse({ 
      success: false, 
      error: 'Real testing modules not available',
      fallbackAvailable: false,
      moduleType: 'OPTIONAL'
    });
  }
}

function handleApiKeySet(request, sendResponse) {
  if (AI_CONFIG.externalModules.utils.loaded && typeof BackgroundUtils !== 'undefined') {
    BackgroundUtils.handleApiKeySet(request, sendResponse, AI_CONFIG, DAY8_VERSION);
  } else {
    // Enhanced fallback API key handling with robust storage
    (async () => {
      try {
        if (!request.apiKey || request.apiKey.trim().length === 0) {
          sendResponse({ success: false, error: 'Please provide a valid API key' });
          return;
        }

        const apiKey = request.apiKey.trim();
        
        // Enhanced API key validation
        if (!validateApiKeyFormat(apiKey)) {
          sendResponse({ 
            success: false, 
            error: 'Invalid API key format. Please provide a valid API key.' 
          });
          return;
        }

        AI_CONFIG.apiKey = apiKey;
        
        // Use robust storage operation
        await robustStorageOperation('set', { geminiApiKey: apiKey });
        
        BackgroundLogger.info('API key configured (fallback method with robust storage)');
        sendResponse({
          success: true,
          message: 'Day 8 ULTIMATE FINAL API key configured - Robust fallback mode',
          day8Version: DAY8_VERSION,
          fallbackMode: true,
          robustStorage: true
        });
        
      } catch (error) {
        BackgroundLogger.error('API key configuration failed', { error: error.message });
        sendResponse({ 
          success: false, 
          error: error.message,
          fallbackMode: true
        });
      }
    })();
  }
}

// ===== FINAL: ENHANCED PERSISTENT CACHE SYSTEM =====
(async () => {
  try {
    // Restore schema mappings from persistent cache with robust error handling
    const storedCache = await robustStorageOperation('get', null, ['schemaMappingsCache']);
    
    if (storedCache.schemaMappingsCache) {
      // Convert stored array back to Map
      const restoredMappings = new Map(storedCache.schemaMappingsCache);
      AI_CONFIG.cache.schemaMappings = restoredMappings;
      BackgroundLogger.throttledInfo(`✅ Restored ${restoredMappings.size} schema mappings from persistent cache`);
    }
  } catch (error) {
    BackgroundLogger.debug('Could not restore persistent cache', { error: error.message });
  }
})();

// FINAL: Enhanced cache monitoring and persistence
let cacheMonitorInterval = setInterval(() => {
  // Monitor cache size and persist if needed
  if (AI_CONFIG.cache.schemaMappings.size > 0) {
    const mappingsArray = Array.from(AI_CONFIG.cache.schemaMappings.entries());
    
    // Use immediate persistence for critical data
    if (!AI_CONFIG.cache.persistenceQueue.has('schemaMappingsCache')) {
      updateCacheWithPersistence('schemaMappings', 'periodic', Date.now());
    }
  }
  
  // Log cache statistics every 5 minutes
  const cacheStats = {
    schemaMappings: AI_CONFIG.cache.schemaMappings.size,
    siteConfigs: AI_CONFIG.cache.siteConfigs.size,
    pendingPersistence: AI_CONFIG.cache.persistenceQueue.size,
    configAge: AI_CONFIG.cache.configTimestamp ? Date.now() - AI_CONFIG.cache.configTimestamp : null
  };
  
  BackgroundLogger.throttledInfo('Cache status', cacheStats);
  
}, 300000); // Every 5 minutes

BackgroundLogger.info(`🏆 Day 8 ULTIMATE FINAL MODULAR system initialized | Version: ${DAY8_VERSION} | Zero Compromise Championship Edition Ready`);
