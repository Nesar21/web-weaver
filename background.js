// Day 10: ULTIMATE ENTERPRISE AI ENGINE v1 - Smart Tab Management & 80% Accuracy
// /background.js - DAY 10 ENHANCED (Service Worker Compatible) - GEMINI 2.0 FIX

console.log('[Background] Day 10 AI ENGINE v1 loading - 80% Accuracy Target with Confidence Validation');

// ============================================================================
// DAY 10 VERSION & CONFIGURATION - GEMINI 2.0 MODEL FIX
// ============================================================================

const DAY10_VERSION = 'day10-ai-engine-v1-gemini-2.0-fix';
const DAY8_VERSION = 'day8-day9-ultimate-enterprise-champion';

let AI_CONFIG = {
  model: 'gemini-2.0-flash-lite', // ✅ CRITICAL FIX: Use Gemini 2.0 stable model
  maxTokens: 3000,
  temperature: 0.1,
  aiTimeout: 30000,
  tabTimeout: 6000,
  maxConcurrentTabs: 8,
  apiKey: null,
  day10Version: DAY10_VERSION,
  day8Version: DAY8_VERSION,
  confidenceThreshold: 50,
  enableAutoCorrect: true,
  enablePIIStripping: true,
  dateStandardization: 'YYYY-MM-DD',
  modulesLoaded: true,
  enterpriseConfig: null,
  configVersion: null,
  useAIExtraction: true,
  fallbackToDom: true,
  intelligentParsing: true,
  contextAwareness: true,
  realTimeAnalytics: true,
  liveExtractionTesting: true,
  dynamicPerformanceTracking: true,
  smartTabManagement: true,
  autoCloseTestTabs: true,
  tabCleanupDelay: 2000,
  maxTabLifetime: 30000,
  logging: {
    throttleModuleLoads: false,
    maxLogsPerSecond: 15,
    lastLogTime: 0,
    timestampCache: null,
    timestampCacheExpiry: 100
  },
  cache: {
    schemaMappings: new Map(),
    siteConfigs: new Map(),
    apiValidation: null,
    configTimestamp: null,
    configExpiry: 3600000,
    persistenceQueue: new Set(),
    extractionResults: new Map(),
    tabRegistry: new Map()
  }
};

// ============================================================================
// DAY 10: CONFIDENCE VALIDATION UTILITIES
// ============================================================================

function validateConfidenceDay10(extractedData) {
  const confidence = extractedData?.confidence_score;
  if (!confidence || typeof confidence !== 'number') {
    return {
      valid: true,
      confidence: 50,
      warning: 'NO_CONFIDENCE_SCORE'
    };
  }
  if (confidence < AI_CONFIG.confidenceThreshold) {
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

function stripPIIDay10(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
    .replace(/(\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})/g, '[PHONE_REDACTED]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]')
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD_REDACTED]');
}

function standardizeDateDay10(dateString) {
  if (!dateString || typeof dateString !== 'string') return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch { return null; }
}

function postProcessDay10(extractedData) {
  if (!extractedData || typeof extractedData !== 'object') return extractedData;
  const processed = {...extractedData};

  ['publication_date', 'publishdate', 'publish_date', 'date'].forEach(field => {
    if (processed[field]) {
      const std = standardizeDateDay10(processed[field]);
      if (std) processed[field] = std;
    }
  });

  if (AI_CONFIG.enablePIIStripping) {
    Object.keys(processed).forEach(key => {
      const value = processed[key];
      if (typeof value === 'string') {
        processed[key] = stripPIIDay10(value);
      } else if (Array.isArray(value)) {
        processed[key] = value.map(v => typeof v === 'string' ? stripPIIDay10(v) : v);
      }
    });
  }

  if (processed.title) processed.title = processed.title.substring(0, 200);
  if (processed.description) processed.description = processed.description.substring(0, 1000);
  if (processed.main_content_summary) processed.main_content_summary = processed.main_content_summary.substring(0, 2000);
  if (Array.isArray(processed.ingredients)) processed.ingredients = processed.ingredients.slice(0, 50);
  if (Array.isArray(processed.instructions)) processed.instructions = processed.instructions.slice(0, 30);

  return processed;
}

// ============================================================================
// SMART TAB MANAGER
// ============================================================================

class SmartTabManager {
  constructor() {
    this.openTabs = new Set();
    this.tabCreationTimes = new Map();
    this.tabCleanupTimeouts = new Map();
    this.maxTabAge = AI_CONFIG.maxTabLifetime;
  }

  async createTab(url, options = {}) {
    try {
      BackgroundLogger.info('📄 Creating smart-managed tab', { url });
      const tab = await chrome.tabs.create({
        url: url,
        active: false,
        ...options
      });
      this.openTabs.add(tab.id);
      this.tabCreationTimes.set(tab.id, Date.now());

      if (AI_CONFIG.autoCloseTestTabs) {
        const timeoutId = setTimeout(() => {
          this.closeTab(tab.id, 'timeout');
        }, this.maxTabAge);
        this.tabCleanupTimeouts.set(tab.id, timeoutId);
      }

      BackgroundLogger.info('✅ Tab created and registered', {
        tabId: tab.id,
        totalOpenTabs: this.openTabs.size
      });
      return tab;
    } catch (error) {
      BackgroundLogger.error('Failed to create smart-managed tab', {
        error: error.message,
        url
      });
      throw error;
    }
  }

  async closeTab(tabId, reason = 'manual') {
    try {
      if (!this.openTabs.has(tabId)) {
        BackgroundLogger.warn('Attempted to close unregistered tab', { tabId });
        return;
      }

      BackgroundLogger.info('🗑️ Closing smart-managed tab', {
        tabId,
        reason,
        ageMs: Date.now() - (this.tabCreationTimes.get(tabId) || Date.now())
      });

      const timeoutId = this.tabCleanupTimeouts.get(tabId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.tabCleanupTimeouts.delete(tabId);
      }

      try {
        await chrome.tabs.remove(tabId);
      } catch (tabError) {
        BackgroundLogger.warn('Tab already closed or inaccessible', {
          tabId,
          error: tabError.message
        });
      }

      this.openTabs.delete(tabId);
      this.tabCreationTimes.delete(tabId);

      BackgroundLogger.info('✅ Tab closed and unregistered', {
        tabId,
        remainingTabs: this.openTabs.size
      });
    } catch (error) {
      BackgroundLogger.error('Failed to close smart-managed tab', {
        error: error.message,
        tabId
      });
    }
  }

  async closeAllTabs(reason = 'cleanup') {
    BackgroundLogger.info('🧹 Closing all smart-managed tabs', {
      count: this.openTabs.size,
      reason
    });
    const tabIds = Array.from(this.openTabs);
    for (const tabId of tabIds) {
      await this.closeTab(tabId, reason);
      await this.delay(100);
    }
    BackgroundLogger.info('✅ All smart-managed tabs closed');
  }

  getOpenTabsInfo() {
    return {
      count: this.openTabs.size,
      tabs: Array.from(this.openTabs).map(tabId => ({
        tabId,
        age: Date.now() - (this.tabCreationTimes.get(tabId) || Date.now()),
        hasCleanupTimeout: this.tabCleanupTimeouts.has(tabId)
      }))
    };
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const tabManager = new SmartTabManager();

// ============================================================================
// ENHANCED LOGGER
// ============================================================================

const BackgroundLogger = {
  _getTimestamp() {
    const now = Date.now();
    if (AI_CONFIG.logging.timestampCache && (now - AI_CONFIG.logging.lastLogTime < AI_CONFIG.logging.timestampCacheExpiry)) {
      return AI_CONFIG.logging.timestampCache;
    }
    AI_CONFIG.logging.timestampCache = new Date().toISOString();
    AI_CONFIG.logging.lastLogTime = now;
    return AI_CONFIG.logging.timestampCache;
  },

  _shouldLog(level) {
    if (AI_CONFIG.logging.throttleModuleLoads && level === 'MODULE_LOAD') return false;
    const now = Date.now();
    const timeSinceLastLog = now - (AI_CONFIG.logging.lastLogTime || 0);
    if (timeSinceLastLog < (1000 / AI_CONFIG.logging.maxLogsPerSecond)) return false;
    return true;
  },

  info(message, data = null) {
    if (!this._shouldLog('INFO')) return;
    const timestamp = this._getTimestamp();
    const logMessage = `[${timestamp}] [Background-Day10] [INFO] ℹ️ ${message}`;
    if (data) console.log(logMessage, data);
    else console.log(logMessage);
  },

  success(message, data = null) {
    if (!this._shouldLog('SUCCESS')) return;
    const timestamp = this._getTimestamp();
    const logMessage = `[${timestamp}] [Background-Day10] [SUCCESS] ✅ ${message}`;
    if (data) console.log(logMessage, data);
    else console.log(logMessage);
  },

  warn(message, data = null) {
    const timestamp = this._getTimestamp();
    const logMessage = `[${timestamp}] [Background-Day10] [WARN] ⚠️ ${message}`;
    if (data) console.warn(logMessage, data);
    else console.warn(logMessage);
  },

  error(message, data = null) {
    const timestamp = this._getTimestamp();
    const logMessage = `[${timestamp}] [Background-Day10] [ERROR] ❌ ${message}`;
    if (data) console.error(logMessage, data);
    else console.error(logMessage);
  },

  debug(message, data = null) {
    if (!this._shouldLog('DEBUG')) return;
    const timestamp = this._getTimestamp();
    const logMessage = `[${timestamp}] [Background-Day10] [DEBUG] 🔍 ${message}`;
    if (data) console.log(logMessage, data);
    else console.log(logMessage);
  }
};

// ============================================================================
// BACKGROUND UTILITIES
// ============================================================================

const BackgroundUtils = {
  async loadConfig() {
    try {
      BackgroundLogger.info('📥 Loading enterprise configuration');
      const response = await fetch(chrome.runtime.getURL('config/enterprise-sites.json'));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const config = await response.json();
      AI_CONFIG.enterpriseConfig = config;
      AI_CONFIG.configVersion = config.version || 'unknown';
      AI_CONFIG.cache.configTimestamp = Date.now();
      BackgroundLogger.success('Enterprise config loaded', {
        version: AI_CONFIG.configVersion,
        sitesCount: config.sites?.length || 0
      });
      return config;
    } catch (error) {
      BackgroundLogger.error('Failed to load config', { error: error.message });
      return null;
    }
  },

  async saveApiKey(apiKey) {
    try {
      await chrome.storage.local.set({ geminiApiKey: apiKey });
      AI_CONFIG.apiKey = apiKey;
      AI_CONFIG.cache.apiValidation = { valid: true, timestamp: Date.now() };
      BackgroundLogger.success('✅ Day 10 API key saved successfully');
      return { success: true };
    } catch (error) {
      BackgroundLogger.error('Failed to save API key', { error: error.message });
      return { success: false, error: error.message };
    }
  },

  async getApiKey() {
    try {
      if (AI_CONFIG.apiKey) return AI_CONFIG.apiKey;
      const result = await chrome.storage.local.get(['geminiApiKey']);
      if (result.geminiApiKey) {
        AI_CONFIG.apiKey = result.geminiApiKey;
        return result.geminiApiKey;
      }
      return null;
    } catch (error) {
      BackgroundLogger.error('Failed to retrieve API key', { error: error.message });
      return null;
    }
  },

  async validateApiKey(apiKey) {
    try {
      // ✅ CRITICAL FIX: Updated to Gemini 2.0 model + v1 API
      const testUrl = `https://generativelanguage.googleapis.com/v1/models/${AI_CONFIG.model}:generateContent?key=${apiKey}`;
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'test' }] }] })
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};
// ============================================================================
// DAY 10: GEMINI 2.0 API CALL WITH CONFIDENCE VALIDATION
// ============================================================================

async function callGeminiAPIDay10(prompt, contextData = {}) {
  const apiKey = await BackgroundUtils.getApiKey();
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  // ✅ CRITICAL FIX: Use v1 API endpoint with Gemini 2.0 model
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${AI_CONFIG.model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: AI_CONFIG.temperature,
      maxOutputTokens: AI_CONFIG.maxTokens,
      topP: 0.95,
      topK: 40
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
    ]
  };

  BackgroundLogger.info('🤖 Calling Gemini 2.0 API', {
    model: AI_CONFIG.model,
    promptLength: prompt.length,
    maxTokens: AI_CONFIG.maxTokens,
    temperature: AI_CONFIG.temperature
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.aiTimeout);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      BackgroundLogger.error('❌ Gemini API HTTP error', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Gemini API HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      BackgroundLogger.error('❌ Invalid Gemini API response structure', { data });
      throw new Error('Invalid API response structure');
    }

    const textContent = data.candidates[0].content.parts[0].text;
    BackgroundLogger.success('✅ Gemini 2.0 API call successful', {
      responseLength: textContent.length,
      model: AI_CONFIG.model
    });

    // Parse JSON response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      BackgroundLogger.error('❌ No JSON found in API response', { textContent });
      throw new Error('No JSON in API response');
    }

    const extractedData = JSON.parse(jsonMatch[0]);

    // Day 10: Confidence validation
    const confidenceCheck = validateConfidenceDay10(extractedData);
    if (!confidenceCheck.valid) {
      BackgroundLogger.warn('⚠️ Low confidence extraction discarded', {
        confidence: confidenceCheck.confidence,
        reason: confidenceCheck.reason
      });
      throw new Error(`Low confidence: ${confidenceCheck.confidence}`);
    }

    // Day 10: Post-processing (PII stripping, date standardization, token limits)
    const processedData = postProcessDay10(extractedData);

    BackgroundLogger.success('✅ Day 10 extraction validated', {
      confidence: confidenceCheck.confidence,
      fieldsCount: Object.keys(processedData).length
    });

    return {
      success: true,
      data: processedData,
      metadata: {
        day10Version: DAY10_VERSION,
        confidence: confidenceCheck.confidence,
        model: AI_CONFIG.model,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      BackgroundLogger.error('❌ Gemini API timeout', {
        timeout: AI_CONFIG.aiTimeout
      });
      throw new Error('API timeout');
    }
    BackgroundLogger.error('❌ Gemini API call failed', {
      error: error.message,
      model: AI_CONFIG.model
    });
    throw error;
  }
}

// ============================================================================
// ANALYTICS ENGINE
// ============================================================================

class AnalyticsEngine {
  constructor() {
    this.metrics = {
      totalExtractions: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      averageConfidence: 0,
      extractionsByCategory: {},
      extractionsBySite: {},
      lastUpdated: null
    };
  }

  recordExtraction(site, category, success, confidence = null) {
    this.metrics.totalExtractions++;
    if (success) {
      this.metrics.successfulExtractions++;
      if (confidence !== null) {
        const currentAvg = this.metrics.averageConfidence;
        const count = this.metrics.successfulExtractions;
        this.metrics.averageConfidence = ((currentAvg * (count - 1)) + confidence) / count;
      }
    } else {
      this.metrics.failedExtractions++;
    }

    if (category) {
      this.metrics.extractionsByCategory[category] = (this.metrics.extractionsByCategory[category] || 0) + 1;
    }

    if (site) {
      this.metrics.extractionsBySite[site] = (this.metrics.extractionsBySite[site] || 0) + 1;
    }

    this.metrics.lastUpdated = new Date().toISOString();
  }

  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalExtractions > 0
        ? (this.metrics.successfulExtractions / this.metrics.totalExtractions * 100).toFixed(2)
        : 0
    };
  }

  reset() {
    this.metrics = {
      totalExtractions: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      averageConfidence: 0,
      extractionsByCategory: {},
      extractionsBySite: {},
      lastUpdated: null
    };
  }
}

const analyticsEngine = new AnalyticsEngine();

// ============================================================================
// MESSAGE HANDLERS
// ============================================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      BackgroundLogger.info('📨 Message received', {
        action: request.action,
        tabId: sender.tab?.id
      });

      switch (request.action) {
        case 'saveApiKey':
          const saveResult = await BackgroundUtils.saveApiKey(request.apiKey);
          sendResponse(saveResult);
          break;

        case 'getApiKey':
          const apiKey = await BackgroundUtils.getApiKey();
          sendResponse({ apiKey });
          break;

        case 'validateApiKey':
          const isValid = await BackgroundUtils.validateApiKey(request.apiKey);
          sendResponse({ valid: isValid });
          break;

        case 'getSystemStatus':
          const apiKeyExists = !!(await BackgroundUtils.getApiKey());
          const configLoaded = !!AI_CONFIG.enterpriseConfig;
          sendResponse({
            apiKeyConfigured: apiKeyExists,
            enterpriseConfigLoaded: configLoaded,
            systemReady: apiKeyExists && configLoaded,
            aiEnabled: AI_CONFIG.useAIExtraction,
            day10Enhanced: true,
            confidenceThreshold: AI_CONFIG.confidenceThreshold,
            model: AI_CONFIG.model,
            version: DAY10_VERSION
          });
          break;

        case 'extractData':
          try {
            BackgroundLogger.info('🔍 Starting Day 10 extraction', {
              url: request.url,
              category: request.category
            });

            const extractedData = await callGeminiAPIDay10(request.prompt, {
              url: request.url,
              category: request.category
            });

            analyticsEngine.recordExtraction(
              request.url,
              request.category,
              true,
              extractedData.data.confidence_score
            );

            sendResponse({
              success: true,
              data: extractedData.data,
              metadata: extractedData.metadata
            });
          } catch (error) {
            BackgroundLogger.error('❌ ❌ Extraction failed', {
              error: error.message,
              url: request.url
            });

            analyticsEngine.recordExtraction(
              request.url,
              request.category,
              false
            );

            sendResponse({
              success: false,
              error: error.message
            });
          }
          break;

        case 'getAnalytics':
          sendResponse({
            success: true,
            analytics: analyticsEngine.getMetrics()
          });
          break;

        case 'resetAnalytics':
          analyticsEngine.reset();
          sendResponse({ success: true });
          break;

        case 'getTabsInfo':
          sendResponse({
            success: true,
            tabs: tabManager.getOpenTabsInfo()
          });
          break;

        case 'closeAllTabs':
          await tabManager.closeAllTabs('user_request');
          sendResponse({ success: true });
          break;

        default:
          BackgroundLogger.warn('⚠️ Unknown action', { action: request.action });
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      BackgroundLogger.error('❌ Message handler error', {
        action: request.action,
        error: error.message
      });
      sendResponse({ success: false, error: error.message });
    }
  })();
  return true; // Keep channel open for async response
});

// ============================================================================
// INITIALIZATION
// ============================================================================

(async () => {
  try {
    BackgroundLogger.info('🚀 Initializing Day 10 AI ENGINE v1', {
      version: DAY10_VERSION,
      model: AI_CONFIG.model
    });

    await BackgroundUtils.loadConfig();
    const apiKey = await BackgroundUtils.getApiKey();

    if (apiKey) {
      BackgroundLogger.success('✅ API key loaded from storage');
    } else {
      BackgroundLogger.warn('⚠️ No API key found - user must configure');
    }

    BackgroundLogger.success('🎯 Day 10 AI ENGINE v1 ready', {
      version: DAY10_VERSION,
      model: AI_CONFIG.model,
      confidenceThreshold: AI_CONFIG.confidenceThreshold,
      apiKeyConfigured: !!apiKey,
      configLoaded: !!AI_CONFIG.enterpriseConfig
    });
  } catch (error) {
    BackgroundLogger.error('❌ Initialization failed', {
      error: error.message
    });
  }
})();

BackgroundLogger.info('📦 Day 10 background.js module loaded', {
  version: DAY10_VERSION,
  model: AI_CONFIG.model
});
