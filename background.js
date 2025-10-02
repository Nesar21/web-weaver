// Day 10: ULTIMATE ENTERPRISE AI ENGINE v1 - Proxy Architecture with Smart Tab Management
// /background.js - DAY 10 ENHANCED (Service Worker Compatible) - Gemini 2.0 Proxy Fix

console.log('[Background] Day 10 AI ENGINE v1 loading - Secure Proxy Architecture with 80% Accuracy Target');

const DAY10_VERSION = 'day10-ai-engine-v1-proxy-secure';
const DAY8_VERSION = 'day8-day9-ultimate-enterprise-champion';

let isInitialized = false;

let AI_CONFIG = {
  model: 'gemini-2.0-flash-lite',
  maxTokens: 3000,
  temperature: 0.1,
  aiTimeout: 30000,
  tabTimeout: 6000,
  maxConcurrentTabs: 8,
  day10Version: DAY10_VERSION,
  day8Version: DAY8_VERSION,
  confidenceThreshold: 50,
  enableAutoCorrect: true,
  enablePIIStripping: true,
  dateStandardization: 'YYYY-MM-DD',
  modulesLoaded: false,
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
  proxyEndpoint: 'https://web-weaver-proxy.vercel.app/api/gemini-proxy',
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
    configTimestamp: null,
    configExpiry: 3600000,
    persistenceQueue: new Set(),
    extractionResults: new Map(),
    tabRegistry: new Map()
  }
};

const BackgroundLogger = (() => {
  let lastLogTime = 0;
  let timestampCache = null;
  const timestampCacheExpiry = AI_CONFIG.logging.timestampCacheExpiry;

  function getTimestamp() {
    const now = Date.now();
    if (timestampCache && now - lastLogTime < timestampCacheExpiry) return timestampCache;
    timestampCache = new Date().toISOString();
    lastLogTime = now;
    return timestampCache;
  }

  function shouldLog(level) {
    if (AI_CONFIG.logging.throttleModuleLoads && level === 'MODULE_LOAD') return false;
    return Date.now() - lastLogTime > 1000 / AI_CONFIG.logging.maxLogsPerSecond;
  }

  function log(type, msg, data) {
    if (!shouldLog(type)) return;
    const ts = getTimestamp();
    const fmt = `[${ts}] [Background-Day10] [${type}] ${msg}`;
    if (data) {
      if (type === 'ERROR') console.error(fmt, data);
      else if (type === 'WARN') console.warn(fmt, data);
      else console.log(fmt, data);
    } else {
      console.log(fmt);
    }
  }

  return {
    info: (msg, data) => log('INFO', msg, data),
    success: (msg, data) => log('SUCCESS', msg, data),
    warn: (msg, data) => log('WARN', msg, data),
    error: (msg, data) => log('ERROR', msg, data),
    debug: (msg, data) => log('DEBUG', msg, data)
  };
})();

function standardizeDateDay10(dateString) {
  if (!dateString || typeof dateString !== 'string') return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
}

function stripPIIDay10(text) {
  if (!text || typeof text !== 'string') return text;
  text = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]');
  text = text.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]');
  text = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]');
  text = text.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD_REDACTED]');
  return text;
}

function postProcessDay10(data) {
  if (!data || typeof data !== 'object') return data;
  BackgroundLogger.debug('[AI] Day 10 post-processing...');
  let processed = Object.assign({}, data);

  if (processed.publication_date) {
    processed.publication_date = standardizeDateDay10(processed.publication_date);
  }

  if (AI_CONFIG.enablePIIStripping) {
    for (const key in processed) {
      if (typeof processed[key] === 'string') {
        processed[key] = stripPIIDay10(processed[key]);
      }
    }
  }

  if (processed.title) processed.title = processed.title.substring(0, 200);
  if (processed.description) processed.description = processed.description.substring(0, 1000);
  if (processed.main_content_summary) processed.main_content_summary = processed.main_content_summary.substring(0, 2000);
  if (Array.isArray(processed.ingredients)) processed.ingredients = processed.ingredients.slice(0, 50);
  if (Array.isArray(processed.instructions)) processed.instructions = processed.instructions.slice(0, 30);

  return processed;
}

function validateConfidenceDay10(extractedData) {
  const confidence = extractedData && extractedData.confidence_score;
  if (!confidence || typeof confidence !== 'number') {
    return { valid: true, confidence: 50, warning: 'NO_CONFIDENCE_SCORE' };
  }
  if (confidence < AI_CONFIG.confidenceThreshold) {
    return { valid: false, confidence: confidence, reason: 'CONFIDENCE_TOO_LOW', autoDiscard: true };
  }
  return { valid: true, confidence: confidence };
}

async function callGeminiAPIDay10(prompt, options) {
  if (!options) options = {};
  const PROXY_ENDPOINT = AI_CONFIG.proxyEndpoint;
  const extensionId = chrome.runtime.id || 'temp-dev-mode-bypass';

  BackgroundLogger.info('Day 10 Proxy Architecture Enabled');
  BackgroundLogger.info(`Endpoint: ${PROXY_ENDPOINT}`);
  BackgroundLogger.info(`Extension ID: ${extensionId}`);

  const startTime = Date.now();

  try {
    const response = await fetch(PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-chrome-extension-id': extensionId
      },
      body: JSON.stringify({
        prompt: prompt,
        temperature: options.temperature || AI_CONFIG.temperature || 0.1,
        maxTokens: options.maxTokens || AI_CONFIG.maxTokens || 3000
      }),
      signal: AbortSignal.timeout(AI_CONFIG.aiTimeout || 30000)
    });

    const responseTime = Date.now() - startTime;
    BackgroundLogger.info(`[AI] Proxy response time: ${responseTime}ms`);

    const data = await response.json();

    if (!response.ok) {
      BackgroundLogger.error('[AI] Proxy error response', data);
      throw new Error(data.message || data.error || `HTTP ${response.status}`);
    }

    if (!data.success) {
      BackgroundLogger.error('[AI] Invalid proxy response', data);
      throw new Error('Unexpected proxy response format');
    }

    const candidates = data.data && data.data.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No response from AI model');
    }

    const content = candidates[0].content.parts[0].text;
    if (!content) {
      throw new Error('Invalid AI response structure');
    }

    BackgroundLogger.success('[AI] Extraction successful via proxy');
    BackgroundLogger.info(`[AI] Response length: ${content.length} characters`);

    let parsedData;
    try {
      let cleanContent = content;
      const codeBlockMarker = '```' + 'json';
      const codeBlockEnd = '```';
      if (cleanContent.indexOf(codeBlockMarker) !== -1) {
        cleanContent = cleanContent.split(codeBlockMarker).join('');
      }
      if (cleanContent.indexOf(codeBlockEnd) !== -1) {
        cleanContent = cleanContent.split(codeBlockEnd).join('');
      }
      cleanContent = cleanContent.trim();
      parsedData = JSON.parse(cleanContent);
    } catch (parseError) {
      BackgroundLogger.error('[AI] JSON parse error', parseError);
      throw new Error('AI returned non-JSON response');
    }

    const confidence = parsedData.confidence_score;
    if (typeof confidence === 'number') {
      BackgroundLogger.info(`[AI] Confidence score: ${confidence}%`);
      if (confidence < 50) {
        BackgroundLogger.warn('[AI] Low confidence extraction');
        throw new Error('AI confidence too low - extraction unreliable');
      }
    } else {
      BackgroundLogger.warn('[AI] No confidence score in response');
    }

    const processedData = postProcessDay10(parsedData);
    BackgroundLogger.success('[AI] Post-processing complete');

    return {
      success: true,
      data: processedData,
      metadata: {
        responseTime: responseTime,
        model: (data.metadata && data.metadata.model) || 'gemini-2.0-flash-lite',
        timestamp: (data.metadata && data.metadata.timestamp) || new Date().toISOString(),
        confidence: confidence || 50,
        proxyVersion: (data.metadata && data.metadata.version) || 'unknown',
        day10Enhanced: true
      }
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    BackgroundLogger.error(`[AI] Proxy call failed: ${error.message}`);
    BackgroundLogger.error(`[AI] Time elapsed: ${responseTime}ms`);
    if (error.name === 'AbortError') {
      throw new Error('AI request timeout - try again');
    }
    if (error.message.indexOf('Failed to fetch') !== -1) {
      throw new Error('Network error - check proxy endpoint');
    }
    throw new Error(`AI extraction failed: ${error.message}`);
  }
}

class SmartTabManager {
  constructor() {
    this.openTabs = new Set();
    this.tabCreationTimes = new Map();
    this.tabCleanupTimeouts = new Map();
    this.maxTabAge = AI_CONFIG.maxTabLifetime;
  }

  async createTab(url, options) {
    if (!options) options = {};
    try {
      BackgroundLogger.info('Creating smart-managed tab', { url });
      const tab = await chrome.tabs.create(Object.assign({ url, active: false }, options));
      this.openTabs.add(tab.id);
      this.tabCreationTimes.set(tab.id, Date.now());
      if (AI_CONFIG.autoCloseTestTabs) {
        const timeoutId = setTimeout(() => this.closeTab(tab.id, 'timeout'), this.maxTabAge);
        this.tabCleanupTimeouts.set(tab.id, timeoutId);
      }
      BackgroundLogger.info('Tab created and registered', { tabId: tab.id, totalOpenTabs: this.openTabs.size });
      return tab;
    } catch (error) {
      BackgroundLogger.error('Failed to create smart-managed tab', { error: error.message, url });
      throw error;
    }
  }

  async closeTab(tabId, reason) {
    if (!reason) reason = 'manual';
    try {
      if (!this.openTabs.has(tabId)) {
        BackgroundLogger.warn('Attempted to close unregistered tab', { tabId });
        return;
      }
      BackgroundLogger.info('Closing smart-managed tab', {
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
        BackgroundLogger.warn('Tab already closed or inaccessible', { tabId, error: tabError.message });
      }
      this.openTabs.delete(tabId);
      this.tabCreationTimes.delete(tabId);
      BackgroundLogger.info('Tab closed and unregistered', { tabId, remainingTabs: this.openTabs.size });
    } catch (error) {
      BackgroundLogger.error('Failed to close smart-managed tab', { error: error.message, tabId });
    }
  }

  async closeAllTabs(reason) {
    if (!reason) reason = 'cleanup';
    BackgroundLogger.info('Closing all smart-managed tabs', { count: this.openTabs.size, reason });
    const tabIds = Array.from(this.openTabs);
    for (const tabId of tabIds) {
      await this.closeTab(tabId, reason);
      await new Promise(r => setTimeout(r, 100));
    }
    BackgroundLogger.info('All smart-managed tabs closed');
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
}

const tabManager = new SmartTabManager();

const BackgroundUtils = {
  async loadConfig() {
    try {
      BackgroundLogger.info('Loading enterprise configuration');
      const response = await fetch(chrome.runtime.getURL('config/enterprise-sites.json'));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const config = await response.json();
      AI_CONFIG.enterpriseConfig = config;
      AI_CONFIG.configVersion = config.version || 'unknown';
      AI_CONFIG.cache.configTimestamp = Date.now();
      BackgroundLogger.success('Enterprise config loaded', {
        version: AI_CONFIG.configVersion,
        sitesCount: (config.sites && config.sites.length) || 0
      });
      return config;
    } catch (error) {
      BackgroundLogger.error('Failed to load config', { error: error.message });
      return null;
    }
  },

  async getSystemStatus() {
    return {
      version: DAY10_VERSION,
      modulesLoaded: AI_CONFIG.modulesLoaded,
      enterpriseConfig: {
        loaded: !!AI_CONFIG.enterpriseConfig,
        version: AI_CONFIG.configVersion
      },
      day10Features: {
        confidenceThreshold: AI_CONFIG.confidenceThreshold,
        proxyEnabled: true,
        proxyEndpoint: AI_CONFIG.proxyEndpoint
      },
      initialized: isInitialized
    };
  }
};

class AnalyticsEngine {
  constructor() {
    this.metrics = {
      totalExtractions: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      autoDiscards: 0,
      averageConfidence: 0,
      averageAccuracy: 0,
      performanceByType: {},
      day10Extractions: 0
    };
  }

  recordExtraction(result) {
    this.metrics.totalExtractions++;
    this.metrics.day10Extractions++;
    if (result.success) {
      this.metrics.successfulExtractions++;
      const confidence = (result.metadata && result.metadata.confidence) || 50;
      this.metrics.averageConfidence =
        (this.metrics.averageConfidence * (this.metrics.successfulExtractions - 1) + confidence) /
        this.metrics.successfulExtractions;
    } else {
      this.metrics.failedExtractions++;
      if (result.reason === 'LOW_CONFIDENCE') {
        this.metrics.autoDiscards++;
      }
    }
    BackgroundLogger.debug('Day 10 analytics updated', {
      totalExtractions: this.metrics.totalExtractions,
      successRate: `${(this.metrics.successfulExtractions / this.metrics.totalExtractions * 100).toFixed(1)}%`,
      avgConfidence: `${this.metrics.averageConfidence.toFixed(1)}%`
    });
  }

  getAnalytics() {
    return {
      businessMetrics: {
        totalExtractions: this.metrics.totalExtractions,
        successfulExtractions: this.metrics.successfulExtractions,
        failedExtractions: this.metrics.failedExtractions,
        successRate: this.metrics.totalExtractions > 0
          ? (this.metrics.successfulExtractions / this.metrics.totalExtractions * 100)
          : 0,
        averageConfidence: this.metrics.averageConfidence
      },
      day10Status: {
        confidenceAverage: this.metrics.averageConfidence,
        autoDiscards: this.metrics.autoDiscards,
        totalExtractions: this.metrics.day10Extractions
      }
    };
  }

  reset() {
    this.metrics = {
      totalExtractions: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      autoDiscards: 0,
      averageConfidence: 0,
      averageAccuracy: 0,
      performanceByType: {},
      day10Extractions: 0
    };
    BackgroundLogger.info('Day 10 analytics reset');
  }
}

const analyticsEngine = new AnalyticsEngine();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      BackgroundLogger.info('Message received', { action: request.action, tabId: sender.tab && sender.tab.id });

      switch (request.action) {
        case 'getSystemStatus':
          try {
            if (!isInitialized) {
              sendResponse({
                success: true,
                status: {
                  systemReady: false,
                  apiKeyConfigured: false,
                  enterpriseConfigLoaded: false,
                  day10Enhanced: false,
                  proxyEnabled: true,
                  initializing: true
                }
              });
              return;
            }
            const status = await BackgroundUtils.getSystemStatus();
            sendResponse({
              success: true,
              status: {
                systemReady: true,
                apiKeyConfigured: true,
                enterpriseConfigLoaded: status.enterpriseConfig.loaded,
                day10Enhanced: true,
                proxyEnabled: true,
                version: status.version,
                enterpriseConfig: status.enterpriseConfig,
                day10Features: status.day10Features
              }
            });
          } catch (error) {
            BackgroundLogger.error('Error in getSystemStatus handler', { error: error.message });
            sendResponse({
              success: false,
              error: error.message || 'Failed to get system status'
            });
          }
          break;

        case 'getAnalytics':
          sendResponse({ success: true, analytics: analyticsEngine.getAnalytics() });
          break;

        case 'cleanupTabs':
          await tabManager.closeAllTabs('user_request');
          sendResponse({ success: true, message: 'All managed tabs closed' });
          break;

        default:
          BackgroundLogger.warn('Unknown action', { action: request.action });
          sendResponse({ success: false, error: 'Unknown action' });
          break;
      }
    } catch (error) {
      BackgroundLogger.error('Message handler error', {
        action: request.action,
        error: error.message
      });
      sendResponse({
        success: false,
        error: error.message || 'Unknown error'
      });
    }
  })();
  return true;
});

(async () => {
  try {
    BackgroundLogger.info('Initializing Day 10 AI ENGINE v1', {
      version: DAY10_VERSION,
      model: AI_CONFIG.model,
      proxyEndpoint: AI_CONFIG.proxyEndpoint
    });
    await BackgroundUtils.loadConfig();
    AI_CONFIG.modulesLoaded = true;
    isInitialized = true;
    BackgroundLogger.success('Day 10 AI Engine v1 initialization complete');
    BackgroundLogger.info('Proxy-based security enabled - API key secured in backend');
  } catch (error) {
    BackgroundLogger.error('Initialization failed', { error: error.message });
  }
})();

BackgroundLogger.info('Day 10 background.js module loaded', {
  version: DAY10_VERSION,
  model: AI_CONFIG.model,
  securityMode: 'PROXY_ENABLED'
});
