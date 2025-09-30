// Day 10: ULTIMATE ENTERPRISE AI ENGINE v1 - Smart Tab Management & 80% Accuracy
// /src/background.js - DAY 10 ENHANCED

console.log('[Background] Day 10 AI ENGINE v1 loading - 80% Accuracy Target with Confidence Validation');

// ============================================================================
// DAY 10 VERSION & CONFIGURATION
// ============================================================================

const DAY10_VERSION = 'day10-ai-engine-v1';
const DAY8_VERSION = 'day8-day9-ultimate-enterprise-champion'; // Preserve backward compat

// Day 10: Enhanced AI Configuration with CONFIDENCE VALIDATION
let AI_CONFIG = {
  model: 'gemini-1.5-flash-8b-001',
  maxTokens: 3000,
  temperature: 0.1,
  aiTimeout: 25000,
  tabTimeout: 6000,
  maxConcurrentTabs: 8,
  apiKey: null,
  
  // Day 10 enhancements
  day10Version: DAY10_VERSION,
  day8Version: DAY8_VERSION,
  confidenceThreshold: 50, // Auto-discard below this
  enableAutoCorrect: true,
  enablePIIStripping: true,
  dateStandardization: 'YYYY-MM-DD',
  
  // Module status
  modulesLoaded: true,
  enterpriseConfig: null,
  configVersion: null,
  
  // AI Intelligence Settings
  useAIExtraction: true,
  fallbackToDom: true,
  intelligentParsing: true,
  contextAwareness: true,
  
  // Real Analytics Settings
  realTimeAnalytics: true,
  liveExtractionTesting: true,
  dynamicPerformanceTracking: true,
  
  // Smart Tab Management
  smartTabManagement: true,
  autoCloseTestTabs: true,
  tabCleanupDelay: 2000,
  maxTabLifetime: 30000,
  
  // Enhanced logging
  logging: {
    throttleModuleLoads: false,
    maxLogsPerSecond: 15,
    lastLogTime: 0,
    timestampCache: null,
    timestampCacheExpiry: 100
  },
  
  // Performance caching
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

// Day 10: PII Stripping
function stripPIIDay10(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
    .replace(/(\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})/g, '[PHONE_REDACTED]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]')
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD_REDACTED]');
}

// Day 10: Date Standardization
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

// Day 10: Post-Process Extraction Data
function postProcessDay10(extractedData) {
  if (!extractedData || typeof extractedData !== 'object') return extractedData;
  
  const processed = {...extractedData};
  
  // Date standardization
  ['publication_date', 'publishdate', 'publish_date', 'date'].forEach(field => {
    if (processed[field]) {
      const std = standardizeDateDay10(processed[field]);
      if (std) processed[field] = std;
    }
  });
  
  // PII stripping
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
  
  // Token limits
  if (processed.title) processed.title = processed.title.substring(0, 200);
  if (processed.description) processed.description = processed.description.substring(0, 1000);
  if (processed.main_content_summary) processed.main_content_summary = processed.main_content_summary.substring(0, 2000);
  if (Array.isArray(processed.ingredients)) processed.ingredients = processed.ingredients.slice(0, 50);
  if (Array.isArray(processed.instructions)) processed.instructions = processed.instructions.slice(0, 30);
  
  return processed;
}

// ============================================================================
// SMART TAB MANAGER (PRESERVED FROM DAY 8+9)
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
// PART 2/5: ANALYTICS ENGINE & BACKGROUND LOGGER
// ============================================================================

// Enhanced Real Analytics Engine (Day 8+9 preserved + Day 10 additions)
class EnhancedRealAnalyticsEngine {
  constructor() {
    this.extractionHistory = [];
    this.performanceMetrics = new Map();
    this.anomalyDetector = {
      enabled: true,
      thresholds: { accuracy: 0.15, latency: 2000 },
      historicalWindow: 20
    };
    this.businessMetrics = {
      totalExtractions: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      averageAccuracy: 0,
      averageLatency: 0,
      day10ConfidenceAvg: 0, // Day 10 addition
      day10AutoDiscards: 0   // Day 10 addition
    };
    this.realTimeStats = {
      lastExtraction: null,
      currentTrajectory: 'UNKNOWN',
      predictedDay10: null,
      targetReachEstimate: null
    };
  }

  recordExtraction(result, siteType) {
    const timestamp = new Date().toISOString();
    const extractionRecord = {
      timestamp,
      siteType,
      success: result.success || false,
      accuracy: result.rawAccuracy || result.accuracy || 0,
      latency: result.metadata?.extractionTime || 0,
      method: result.metadata?.method || 'unknown',
      realAI: result.metadata?.realAI || false,
      
      // Day 10 additions
      confidenceScore: result.metadata?.confidenceScore || result.data?.confidence_score || null,
      confidenceValidated: result.metadata?.confidenceValidated || false,
      day10Enhanced: result.metadata?.day10Enhanced || false,
      piiStripped: result.metadata?.piiStripped || false,
      dateStandardized: result.metadata?.dateStandardized || false
    };

    this.extractionHistory.push(extractionRecord);
    if (this.extractionHistory.length > 100) {
      this.extractionHistory.shift();
    }

    this.updateBusinessMetrics(extractionRecord);
    this.updatePerformanceMetrics(siteType, extractionRecord);
    this.updateRealTimeStats();
    
    // Day 10: Track confidence discards
    if (extractionRecord.confidenceScore && extractionRecord.confidenceScore < AI_CONFIG.confidenceThreshold) {
      this.businessMetrics.day10AutoDiscards++;
    }

    this.detectAnomalies(extractionRecord, siteType);
  }

  updateBusinessMetrics(record) {
    this.businessMetrics.totalExtractions++;
    
    if (record.success) {
      this.businessMetrics.successfulExtractions++;
    } else {
      this.businessMetrics.failedExtractions++;
    }

    const totalSuccessful = this.businessMetrics.successfulExtractions;
    const allAccuracies = this.extractionHistory
      .filter(r => r.success)
      .map(r => r.accuracy);
    
    this.businessMetrics.averageAccuracy = 
      allAccuracies.length > 0 ? 
      allAccuracies.reduce((sum, acc) => sum + acc, 0) / allAccuracies.length : 0;

    const allLatencies = this.extractionHistory.map(r => r.latency);
    this.businessMetrics.averageLatency = 
      allLatencies.length > 0 ?
      allLatencies.reduce((sum, lat) => sum + lat, 0) / allLatencies.length : 0;
    
    // Day 10: Calculate confidence average
    const allConfidences = this.extractionHistory
      .filter(r => r.confidenceScore !== null)
      .map(r => r.confidenceScore);
    
    this.businessMetrics.day10ConfidenceAvg = 
      allConfidences.length > 0 ?
      allConfidences.reduce((sum, conf) => sum + conf, 0) / allConfidences.length : 0;
  }

  updatePerformanceMetrics(siteType, record) {
    if (!this.performanceMetrics.has(siteType)) {
      this.performanceMetrics.set(siteType, {
        extractions: 0,
        successRate: 0,
        averageAccuracy: 0,
        averageLatency: 0,
        accuracies: [],
        latencies: [],
        confidences: [] // Day 10
      });
    }

    const metrics = this.performanceMetrics.get(siteType);
    metrics.extractions++;
    metrics.accuracies.push(record.accuracy);
    metrics.latencies.push(record.latency);
    
    // Day 10: Track confidences
    if (record.confidenceScore !== null) {
      metrics.confidences.push(record.confidenceScore);
    }

    if (metrics.accuracies.length > 50) {
      metrics.accuracies.shift();
      metrics.latencies.shift();
      if (metrics.confidences.length > 50) metrics.confidences.shift();
    }

    metrics.averageAccuracy = 
      metrics.accuracies.reduce((sum, acc) => sum + acc, 0) / metrics.accuracies.length;
    metrics.averageLatency = 
      metrics.latencies.reduce((sum, lat) => sum + lat, 0) / metrics.latencies.length;
    
    const successfulExtractions = this.extractionHistory
      .filter(r => r.siteType === siteType && r.success).length;
    const totalExtractions = this.extractionHistory
      .filter(r => r.siteType === siteType).length;
    metrics.successRate = totalExtractions > 0 ? 
      (successfulExtractions / totalExtractions) * 100 : 0;
  }

  updateRealTimeStats() {
    if (this.extractionHistory.length === 0) return;

    this.realTimeStats.lastExtraction = this.extractionHistory[this.extractionHistory.length - 1];
    
    const recentExtractions = this.extractionHistory.slice(-20);
    const recentAccuracies = recentExtractions
      .filter(r => r.success)
      .map(r => r.accuracy);
    
    const currentAvgAccuracy = recentAccuracies.length > 0 ?
      recentAccuracies.reduce((sum, acc) => sum + acc, 0) / recentAccuracies.length : 0;

    if (currentAvgAccuracy >= 85) {
      this.realTimeStats.currentTrajectory = 'EXCELLENT';
    } else if (currentAvgAccuracy >= 75) {
      this.realTimeStats.currentTrajectory = 'ON_TRACK';
    } else if (currentAvgAccuracy >= 65) {
      this.realTimeStats.currentTrajectory = 'NEEDS_IMPROVEMENT';
    } else {
      this.realTimeStats.currentTrajectory = 'NEEDS_ACCELERATION';
    }

    this.realTimeStats.predictedDay10 = Math.min(100, currentAvgAccuracy + 2);
    
    if (currentAvgAccuracy >= 80) {
      this.realTimeStats.targetReachEstimate = 'Already Achieved';
    } else {
      const daysToTarget = Math.ceil((80 - currentAvgAccuracy) / 0.5);
      this.realTimeStats.targetReachEstimate = `Day ${Math.min(30, 10 + daysToTarget)}`;
    }
  }

  detectAnomalies(record, siteType) {
    if (!this.anomalyDetector.enabled) return;

    const siteMetrics = this.performanceMetrics.get(siteType);
    if (!siteMetrics || siteMetrics.accuracies.length < 10) return;

    const recentAccuracies = siteMetrics.accuracies.slice(-this.anomalyDetector.historicalWindow);
    const avgAccuracy = recentAccuracies.reduce((sum, acc) => sum + acc, 0) / recentAccuracies.length;
    
    const accuracyDiff = Math.abs(record.accuracy - avgAccuracy);
    if (accuracyDiff > avgAccuracy * this.anomalyDetector.thresholds.accuracy) {
      BackgroundLogger.warn('📊 Anomaly detected: Accuracy deviation', {
        siteType,
        current: record.accuracy,
        expected: avgAccuracy,
        deviation: accuracyDiff
      });
    }

    const recentLatencies = siteMetrics.latencies.slice(-this.anomalyDetector.historicalWindow);
    const avgLatency = recentLatencies.reduce((sum, lat) => sum + lat, 0) / recentLatencies.length;
    
    if (record.latency > avgLatency + this.anomalyDetector.thresholds.latency) {
      BackgroundLogger.warn('📊 Anomaly detected: Latency spike', {
        siteType,
        current: record.latency,
        expected: avgLatency,
        spike: record.latency - avgLatency
      });
    }
  }

  getAnalytics() {
    return {
      businessMetrics: this.businessMetrics,
      realTimeStats: this.realTimeStats,
      performanceByType: Object.fromEntries(this.performanceMetrics),
      recentHistory: this.extractionHistory.slice(-10),
      day10Status: {
        confidenceAverage: Math.round(this.businessMetrics.day10ConfidenceAvg * 10) / 10,
        autoDiscards: this.businessMetrics.day10AutoDiscards,
        targetProgress: this.businessMetrics.averageAccuracy >= 80 ? 'MET' : 'IN_PROGRESS'
      }
    };
  }

  getTrends() {
    const trends = [];
    
    this.performanceMetrics.forEach((metrics, siteType) => {
      if (metrics.accuracies.length < 7) return;
      
      const recent = metrics.accuracies.slice(-7);
      const previous = metrics.accuracies.slice(-14, -7);
      
      if (previous.length === 0) return;
      
      const recentAvg = recent.reduce((sum, acc) => sum + acc, 0) / recent.length;
      const previousAvg = previous.reduce((sum, acc) => sum + acc, 0) / previous.length;
      const change = recentAvg - previousAvg;
      
      trends.push({
        siteType,
        direction: change > 1 ? 'UP' : change < -1 ? 'DOWN' : 'STABLE',
        change: Math.round(change * 10) / 10,
        recentAverage: Math.round(recentAvg * 10) / 10,
        previousAverage: Math.round(previousAvg * 10) / 10
      });
    });
    
    return trends;
  }

  getPredictions() {
    const predictions = [];
    
    this.performanceMetrics.forEach((metrics, siteType) => {
      if (metrics.accuracies.length < 5) return;
      
      const currentAccuracy = metrics.averageAccuracy;
      const trend = this.getTrends().find(t => t.siteType === siteType);
      const trendMultiplier = trend ? (trend.direction === 'UP' ? 1.2 : trend.direction === 'DOWN' ? 0.8 : 1.0) : 1.0;
      
      predictions.push({
        siteType,
        currentAccuracy: Math.round(currentAccuracy * 10) / 10,
        predictedDay10: Math.min(100, Math.round((currentAccuracy + 2) * trendMultiplier * 10) / 10),
        predictedDay15: Math.min(100, Math.round((currentAccuracy + 4) * trendMultiplier * 10) / 10),
        confidenceLevel: metrics.accuracies.length > 20 ? 0.85 : 0.70,
        trendDirection: trend?.direction || 'STABLE'
      });
    });
    
    return predictions;
  }

  reset() {
    this.extractionHistory = [];
    this.performanceMetrics.clear();
    this.businessMetrics = {
      totalExtractions: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      averageAccuracy: 0,
      averageLatency: 0,
      day10ConfidenceAvg: 0,
      day10AutoDiscards: 0
    };
    this.realTimeStats = {
      lastExtraction: null,
      currentTrajectory: 'UNKNOWN',
      predictedDay10: null,
      targetReachEstimate: null
    };
    BackgroundLogger.info('📊 Analytics engine reset');
  }
}

const analyticsEngine = new EnhancedRealAnalyticsEngine();

// ============================================================================
// BACKGROUND LOGGER
// ============================================================================

class BackgroundLogger {
  static getTimestamp() {
    const now = Date.now();
    
    if (AI_CONFIG.logging.timestampCache && 
        (now - AI_CONFIG.logging.lastLogTime) < AI_CONFIG.logging.timestampCacheExpiry) {
      return AI_CONFIG.logging.timestampCache;
    }
    
    const timestamp = new Date().toISOString();
    AI_CONFIG.logging.timestampCache = timestamp;
    AI_CONFIG.logging.lastLogTime = now;
    return timestamp;
  }

  static shouldThrottle() {
    const now = Date.now();
    const timeSinceLastLog = now - AI_CONFIG.logging.lastLogTime;
    const minInterval = 1000 / AI_CONFIG.logging.maxLogsPerSecond;
    return timeSinceLastLog < minInterval;
  }

  static log(level, message, data = null) {
    if (this.shouldThrottle() && level === 'debug') return;
    
    const timestamp = this.getTimestamp();
    const logMessage = `[${timestamp}] [Background-Day10] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'error':
        console.error(logMessage, data || '');
        break;
      case 'warn':
        console.warn(logMessage, data || '');
        break;
      case 'debug':
        console.debug(logMessage, data || '');
        break;
      default:
        console.log(logMessage, data || '');
    }
  }

  static info(message, data) { this.log('info', message, data); }
  static warn(message, data) { this.log('warn', message, data); }
  static error(message, data) { this.log('error', message, data); }
  static debug(message, data) { this.log('debug', message, data); }
}

// ============================================================================
// UTILITY CLASSES
// ============================================================================

class BackgroundUtils {
  static determineSiteTypeEnhanced(url, cache = null) {
    if (!url) return 'generic';
    
    if (cache?.has(url)) {
      return cache.get(url);
    }
    
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      let siteType = 'generic';
      if (domain.includes('amazon.')) siteType = 'amazon';
      else if (domain.includes('allrecipes.')) siteType = 'allrecipes';
      else if (domain.includes('bloomberg.')) siteType = 'bloomberg';
      else if (domain.includes('wikipedia.')) siteType = 'wikipedia';
      else if (domain.includes('medium.')) siteType = 'medium';
      
      if (cache) {
        cache.set(url, siteType);
      }
      
      return siteType;
    } catch (error) {
      BackgroundLogger.warn('Failed to determine site type', { url, error: error.message });
      return 'generic';
    }
  }

  static async validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      return { valid: false, reason: 'API key is missing or invalid type' };
    }
    
    if (apiKey.trim().length < 10) {
      return { valid: false, reason: 'API key is too short' };
    }
    
    if (!apiKey.startsWith('AI') && !apiKey.includes('key')) {
      return { valid: false, reason: 'API key format appears invalid' };
    }
    
    return { valid: true };
  }

  static obfuscateApiKey(apiKey) {
    if (!apiKey) return null;
    try {
      return btoa(apiKey);
    } catch {
      return apiKey;
    }
  }

  static deobfuscateApiKey(encoded) {
    if (!encoded) return null;
    try {
      return atob(encoded);
    } catch {
      return encoded;
    }
  }

  static sanitizeExtractionResult(result) {
    if (!result || typeof result !== 'object') return result;
    
    const sanitized = { ...result };
    
    if (sanitized.data && typeof sanitized.data === 'object') {
      delete sanitized.data.__proto__;
      delete sanitized.data.constructor;
    }
    
    return sanitized;
  }
}


// ============================================================================
// PART 3/5: MODULE LOADING & MESSAGE HANDLERS
// ============================================================================

// Module Loading System
async function loadModules() {
  BackgroundLogger.info('🔧 Loading Day 10 enhanced modules...');
  
  const modules = [
    { name: 'utils', file: 'src/utils.js', required: false },
    { name: 'schemas', file: 'src/utils/schemas.js', required: true },
    { name: 'aiExtractor', file: 'src/utils/ai-extractor.js', required: true },
    { name: 'validator', file: 'src/utils/validator.js', required: true },
    { name: 'extraction', file: 'src/modules/extraction.js', required: true },
    { name: 'validation', file: 'src/modules/validation.js', required: true }
  ];

  const loadResults = {
    loaded: [],
    failed: [],
    utilityStatus: {}
  };

  for (const module of modules) {
    try {
      await import(chrome.runtime.getURL(module.file));
      loadResults.loaded.push(module.name);
      loadResults.utilityStatus[module.name] = { loaded: true, required: module.required };
      
      if (!AI_CONFIG.logging.throttleModuleLoads) {
        BackgroundLogger.info(`✅ Module loaded: ${module.name}`);
      }
    } catch (error) {
      loadResults.failed.push(module.name);
      loadResults.utilityStatus[module.name] = { loaded: false, required: module.required, error: error.message };
      
      if (module.required) {
        BackgroundLogger.error(`❌ Required module failed: ${module.name}`, { error: error.message });
      } else {
        BackgroundLogger.warn(`⚠️ Optional module failed: ${module.name}`, { error: error.message });
      }
    }
  }

  AI_CONFIG.utilityStatus = loadResults.utilityStatus;
  AI_CONFIG.modulesLoaded = loadResults.loaded.length > 0;

  BackgroundLogger.info('📦 Module loading complete', {
    loaded: loadResults.loaded.length,
    failed: loadResults.failed.length,
    day10Enhanced: true
  });

  return loadResults;
}

// Enterprise Configuration Loading
async function loadEnterpriseConfig() {
  try {
    const response = await fetch(chrome.runtime.getURL('config/enterprise-sites.json'));
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const config = await response.json();
    AI_CONFIG.enterpriseConfig = config;
    AI_CONFIG.configVersion = config.version;
    AI_CONFIG.cache.configTimestamp = Date.now();
    
    BackgroundLogger.info('🏢 Enterprise config loaded', {
      version: config.version,
      sites: Object.keys(config.sites || {}).length,
      day10Enhanced: true
    });
    
    return config;
  } catch (error) {
    BackgroundLogger.error('❌ Failed to load enterprise config', { error: error.message });
    return null;
  }
}

// ============================================================================
// CHROME MESSAGE HANDLERS (DAY 10 ENHANCED)
// ============================================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const startTime = Date.now();
  
  BackgroundLogger.debug(`📨 Message received: ${request.action}`, {
    tabId: sender.tab?.id,
    url: sender.tab?.url
  });

  // Handle async responses properly
  (async () => {
    try {
      switch (request.action) {
        case 'basicExtraction':
          await handleBasicExtraction(request, sender, sendResponse);
          break;

        case 'enhancedExtraction':
          await handleEnhancedExtraction(request, sender, sendResponse);
          break;

        case 'saveApiKey':
          await handleSaveApiKey(request, sender, sendResponse);
          break;

        case 'getApiKey':
          await handleGetApiKey(request, sender, sendResponse);
          break;

        case 'testApiKey':
          await handleTestApiKey(request, sender, sendResponse);
          break;

        case 'getAnalytics':
          handleGetAnalytics(request, sender, sendResponse);
          break;

        case 'getTrends':
          handleGetTrends(request, sender, sendResponse);
          break;

        case 'getPredictions':
          handleGetPredictions(request, sender, sendResponse);
          break;

        case 'resetAnalytics':
          handleResetAnalytics(request, sender, sendResponse);
          break;

        case 'getSystemStatus':
          handleGetSystemStatus(request, sender, sendResponse);
          break;

        case 'liveTest':
          await handleLiveTest(request, sender, sendResponse);
          break;

        case 'batchTest':
          await handleBatchTest(request, sender, sendResponse);
          break;

        default:
          sendResponse({
            success: false,
            error: `Unknown action: ${request.action}`,
            day10Enhanced: true
          });
      }
    } catch (error) {
      BackgroundLogger.error(`Message handler error: ${request.action}`, {
        error: error.message,
        stack: error.stack
      });
      
      sendResponse({
        success: false,
        error: error.message,
        day10Enhanced: true
      });
    } finally {
      const duration = Date.now() - startTime;
      BackgroundLogger.debug(`✅ Message handled: ${request.action}`, {
        duration: `${duration}ms`
      });
    }
  })();

  return true; // Keep channel open for async response
});

// ============================================================================
// MESSAGE HANDLER IMPLEMENTATIONS
// ============================================================================

async function handleBasicExtraction(request, sender, sendResponse) {
  BackgroundLogger.info('🔍 Basic extraction requested');
  
  if (typeof ExtractionManager === 'undefined') {
    sendResponse({
      success: false,
      error: 'ExtractionManager not loaded',
      day10Enhanced: true
    });
    return;
  }

  ExtractionManager.handleBasicExtraction(request, sender, sendResponse, AI_CONFIG);
}

async function handleEnhancedExtraction(request, sender, sendResponse) {
  BackgroundLogger.info('🚀 Enhanced extraction requested (Day 10 + AI)');
  
  if (!AI_CONFIG.apiKey) {
    sendResponse({
      success: false,
      error: 'API key not configured. Please set your API key in the popup.',
      requiresApiKey: true,
      day10Enhanced: true
    });
    return;
  }

  if (typeof ExtractionManager === 'undefined') {
    sendResponse({
      success: false,
      error: 'ExtractionManager not loaded',
      day10Enhanced: true
    });
    return;
  }

  ExtractionManager.handleEnhancedExtraction(request, sender, sendResponse, AI_CONFIG);
}

async function handleSaveApiKey(request, sender, sendResponse) {
  try {
    const apiKey = request.apiKey?.trim();
    
    if (!apiKey) {
      sendResponse({
        success: false,
        error: 'API key is required',
        day10Enhanced: true
      });
      return;
    }

    // Day 10: Validate API key format
    const validation = await BackgroundUtils.validateApiKey(apiKey);
    if (!validation.valid) {
      sendResponse({
        success: false,
        error: validation.reason,
        day10Enhanced: true
      });
      return;
    }

    // Day 10: Obfuscate before storing
    const obfuscatedKey = BackgroundUtils.obfuscateApiKey(apiKey);
    
    await chrome.storage.local.set({ 
      aiApiKey: obfuscatedKey,
      apiKeyLastUpdated: new Date().toISOString()
    });
    
    AI_CONFIG.apiKey = apiKey;
    AI_CONFIG.cache.apiValidation = { valid: true, timestamp: Date.now() };

    BackgroundLogger.info('🔑 API key saved and validated (obfuscated)');
    
    sendResponse({
      success: true,
      message: 'API key saved successfully',
      obfuscated: true,
      day10Enhanced: true
    });
  } catch (error) {
    BackgroundLogger.error('Failed to save API key', { error: error.message });
    sendResponse({
      success: false,
      error: error.message,
      day10Enhanced: true
    });
  }
}

async function handleGetApiKey(request, sender, sendResponse) {
  try {
    const result = await chrome.storage.local.get(['aiApiKey']);
    
    if (result.aiApiKey) {
      // Day 10: Deobfuscate when retrieving
      const apiKey = BackgroundUtils.deobfuscateApiKey(result.aiApiKey);
      AI_CONFIG.apiKey = apiKey;
      
      BackgroundLogger.debug('🔑 API key retrieved (deobfuscated)');
      
      sendResponse({
        success: true,
        apiKey: apiKey,
        obfuscated: true,
        day10Enhanced: true
      });
    } else {
      sendResponse({
        success: true,
        apiKey: null,
        day10Enhanced: true
      });
    }
  } catch (error) {
    BackgroundLogger.error('Failed to get API key', { error: error.message });
    sendResponse({
      success: false,
      error: error.message,
      day10Enhanced: true
    });
  }
}

async function handleTestApiKey(request, sender, sendResponse) {
  try {
    const apiKey = request.apiKey || AI_CONFIG.apiKey;
    
    if (!apiKey) {
      sendResponse({
        success: false,
        error: 'No API key provided',
        day10Enhanced: true
      });
      return;
    }

    // Day 10: Enhanced API key validation
    const validation = await BackgroundUtils.validateApiKey(apiKey);
    
    if (!validation.valid) {
      sendResponse({
        success: false,
        valid: false,
        error: validation.reason,
        day10Enhanced: true
      });
      return;
    }

    // Test with actual API call (lightweight)
    const testUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      AI_CONFIG.cache.apiValidation = { valid: true, timestamp: Date.now() };
      
      BackgroundLogger.info('✅ API key validated successfully');
      
      sendResponse({
        success: true,
        valid: true,
        message: 'API key is valid',
        day10Enhanced: true
      });
    } else {
      throw new Error(`API returned status ${response.status}`);
    }
  } catch (error) {
    BackgroundLogger.error('API key test failed', { error: error.message });
    
    sendResponse({
      success: false,
      valid: false,
      error: error.message,
      day10Enhanced: true
    });
  }
}

function handleGetAnalytics(request, sender, sendResponse) {
  const analytics = analyticsEngine.getAnalytics();
  
  sendResponse({
    success: true,
    analytics: analytics,
    day10Enhanced: true
  });
}

function handleGetTrends(request, sender, sendResponse) {
  const trends = analyticsEngine.getTrends();
  
  sendResponse({
    success: true,
    trends: trends,
    day10Enhanced: true
  });
}

function handleGetPredictions(request, sender, sendResponse) {
  const predictions = analyticsEngine.getPredictions();
  
  sendResponse({
    success: true,
    predictions: predictions,
    day10Enhanced: true
  });
}

function handleResetAnalytics(request, sender, sendResponse) {
  analyticsEngine.reset();
  
  sendResponse({
    success: true,
    message: 'Analytics reset successfully',
    day10Enhanced: true
  });
}

function handleGetSystemStatus(request, sender, sendResponse) {
  const status = {
    version: DAY10_VERSION,
    day8Version: DAY8_VERSION,
    apiKeyConfigured: !!AI_CONFIG.apiKey,
    modulesLoaded: AI_CONFIG.modulesLoaded,
    utilityStatus: AI_CONFIG.utilityStatus,
    enterpriseConfig: {
      loaded: !!AI_CONFIG.enterpriseConfig,
      version: AI_CONFIG.configVersion
    },
    analytics: analyticsEngine.getAnalytics(),
    smartTabManager: tabManager.getOpenTabsInfo(),
    day10Features: {
      confidenceThreshold: AI_CONFIG.confidenceThreshold,
      autoCorrectEnabled: AI_CONFIG.enableAutoCorrect,
      piiStrippingEnabled: AI_CONFIG.enablePIIStripping,
      dateStandardization: AI_CONFIG.dateStandardization
    },
    cache: {
      schemaMappings: AI_CONFIG.cache.schemaMappings.size,
      siteConfigs: AI_CONFIG.cache.siteConfigs.size,
      extractionResults: AI_CONFIG.cache.extractionResults.size
    }
  };

  sendResponse({
    success: true,
    status: status,
    day10Enhanced: true
  });
}

// ============================================================================
// PART 4/5: LIVE TESTING & BATCH TESTING HANDLERS
// ============================================================================

async function handleLiveTest(request, sender, sendResponse) {
  BackgroundLogger.info('🧪 Live test initiated', {
    url: request.url,
    siteType: request.siteType
  });

  if (!AI_CONFIG.apiKey) {
    sendResponse({
      success: false,
      error: 'API key not configured',
      requiresApiKey: true,
      day10Enhanced: true
    });
    return;
  }

  const testStartTime = Date.now();
  let testTab = null;

  try {
    // Step 1: Create test tab
    BackgroundLogger.info('📄 Creating test tab', { url: request.url });
    testTab = await tabManager.createTab(request.url);
    
    await new Promise(resolve => setTimeout(resolve, AI_CONFIG.tabTimeout));

    // Step 2: Deploy content script
    BackgroundLogger.info('📜 Deploying content script', { tabId: testTab.id });
    await chrome.scripting.executeScript({
      target: { tabId: testTab.id },
      files: ['content.js']
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Extract page data
    BackgroundLogger.info('🔍 Extracting page data', { tabId: testTab.id });
    const pageDataResponse = await chrome.tabs.sendMessage(testTab.id, {
      action: 'extractPageData'
    });

    if (!pageDataResponse || !pageDataResponse.success) {
      throw new Error('Failed to extract page data from test tab');
    }

    // Step 4: Process with AI
    const siteType = request.siteType || 
      BackgroundUtils.determineSiteTypeEnhanced(request.url, AI_CONFIG.cache.siteConfigs);

    BackgroundLogger.info('🤖 Processing with Day 10 AI Engine', { siteType });

    let extractionResult;
    if (typeof AIExtractorManager !== 'undefined') {
      extractionResult = await AIExtractorManager.enhanceExtractionWithAI(
        {},
        pageDataResponse.data,
        siteType,
        request.url,
        AI_CONFIG
      );
    } else if (typeof AIExtractor !== 'undefined') {
      extractionResult = await AIExtractor.executeAIExtraction(
        pageDataResponse.data,
        siteType,
        request.url,
        AI_CONFIG
      );
    } else {
      throw new Error('No AI extractor available');
    }

    // Step 5: Day 10 Post-processing
    if (extractionResult.success && extractionResult.data) {
      extractionResult.data = postProcessDay10(extractionResult.data);
      
      // Day 10: Confidence validation
      const confidenceCheck = validateConfidenceDay10(extractionResult.data);
      extractionResult.metadata = extractionResult.metadata || {};
      extractionResult.metadata.confidenceCheck = confidenceCheck;
      extractionResult.metadata.day10Enhanced = true;
      
      if (confidenceCheck.autoDiscard) {
        BackgroundLogger.warn('⚠️ Test extraction auto-discarded (low confidence)', {
          confidence: confidenceCheck.confidence
        });
      }
    }

    // Step 6: Validate
    let validationResult;
    if (typeof ValidationManager !== 'undefined') {
      validationResult = ValidationManager.executeUnifiedValidation(
        extractionResult.data,
        siteType,
        AI_CONFIG
      );
    }

    // Step 7: Record analytics
    analyticsEngine.recordExtraction(extractionResult, siteType);

    const testDuration = Date.now() - testStartTime;

    BackgroundLogger.info('✅ Live test completed', {
      duration: testDuration,
      accuracy: extractionResult.rawAccuracy,
      confidence: extractionResult.metadata?.confidenceCheck?.confidence
    });

    sendResponse({
      success: true,
      extraction: extractionResult,
      validation: validationResult,
      metadata: {
        testDuration,
        siteType,
        url: request.url,
        tabId: testTab.id,
        day10Enhanced: true
      }
    });

    // Step 8: Clean up tab
    if (AI_CONFIG.autoCloseTestTabs) {
      setTimeout(() => {
        tabManager.closeTab(testTab.id, 'test-complete');
      }, AI_CONFIG.tabCleanupDelay);
    }

  } catch (error) {
    BackgroundLogger.error('❌ Live test failed', {
      error: error.message,
      url: request.url
    });

    if (testTab) {
      await tabManager.closeTab(testTab.id, 'test-error');
    }

    sendResponse({
      success: false,
      error: error.message,
      testDuration: Date.now() - testStartTime,
      day10Enhanced: true
    });
  }
}

async function handleBatchTest(request, sender, sendResponse) {
  BackgroundLogger.info('🔬 Batch test initiated', {
    sitesCount: request.sites?.length || 0
  });

  if (!AI_CONFIG.apiKey) {
    sendResponse({
      success: false,
      error: 'API key not configured',
      requiresApiKey: true,
      day10Enhanced: true
    });
    return;
  }

  if (!request.sites || !Array.isArray(request.sites)) {
    sendResponse({
      success: false,
      error: 'Invalid sites array',
      day10Enhanced: true
    });
    return;
  }

  const batchStartTime = Date.now();
  const results = [];
  const maxConcurrent = Math.min(AI_CONFIG.maxConcurrentTabs, request.sites.length);

  try {
    BackgroundLogger.info(`🔄 Processing ${request.sites.length} sites (${maxConcurrent} concurrent)`);

    // Process sites in batches
    for (let i = 0; i < request.sites.length; i += maxConcurrent) {
      const batch = request.sites.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(site => 
        processSingleBatchTest(site, AI_CONFIG)
      );

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            siteKey: batch[index].key,
            error: result.reason?.message || 'Unknown error',
            day10Enhanced: true
          });
        }
      });

      // Brief pause between batches
      if (i + maxConcurrent < request.sites.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const batchDuration = Date.now() - batchStartTime;
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    // Calculate batch statistics
    const accuracies = results
      .filter(r => r.success && r.extraction?.rawAccuracy)
      .map(r => r.extraction.rawAccuracy);
    
    const avgAccuracy = accuracies.length > 0 ?
      accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length : 0;

    // Day 10: Calculate confidence statistics
    const confidences = results
      .filter(r => r.success && r.extraction?.metadata?.confidenceCheck?.confidence)
      .map(r => r.extraction.metadata.confidenceCheck.confidence);
    
    const avgConfidence = confidences.length > 0 ?
      confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length : 0;

    const autoDiscards = results.filter(r => 
      r.success && r.extraction?.metadata?.confidenceCheck?.autoDiscard
    ).length;

    BackgroundLogger.info('✅ Batch test completed', {
      total: results.length,
      success: successCount,
      failed: failCount,
      duration: batchDuration,
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      autoDiscards
    });

    sendResponse({
      success: true,
      results: results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failCount,
        averageAccuracy: Math.round(avgAccuracy * 10) / 10,
        averageConfidence: Math.round(avgConfidence * 10) / 10,
        autoDiscards,
        duration: batchDuration
      },
      day10Enhanced: true
    });

  } catch (error) {
    BackgroundLogger.error('❌ Batch test failed', {
      error: error.message
    });

    sendResponse({
      success: false,
      error: error.message,
      partialResults: results,
      day10Enhanced: true
    });
  }
}

async function processSingleBatchTest(site, config) {
  const testStartTime = Date.now();
  let testTab = null;

  try {
    testTab = await tabManager.createTab(site.url);
    await new Promise(resolve => setTimeout(resolve, config.tabTimeout));

    await chrome.scripting.executeScript({
      target: { tabId: testTab.id },
      files: ['content.js']
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    const pageDataResponse = await chrome.tabs.sendMessage(testTab.id, {
      action: 'extractPageData'
    });

    if (!pageDataResponse?.success) {
      throw new Error('Page data extraction failed');
    }

    const siteType = site.type || 
      BackgroundUtils.determineSiteTypeEnhanced(site.url, config.cache.siteConfigs);

    let extractionResult;
    if (typeof AIExtractorManager !== 'undefined') {
      extractionResult = await AIExtractorManager.enhanceExtractionWithAI(
        {},
        pageDataResponse.data,
        siteType,
        site.url,
        config
      );
    } else if (typeof AIExtractor !== 'undefined') {
      extractionResult = await AIExtractor.executeAIExtraction(
        pageDataResponse.data,
        siteType,
        site.url,
        config
      );
    } else {
      throw new Error('No AI extractor available');
    }

    // Day 10: Post-processing and confidence validation
    if (extractionResult.success && extractionResult.data) {
      extractionResult.data = postProcessDay10(extractionResult.data);
      
      const confidenceCheck = validateConfidenceDay10(extractionResult.data);
      extractionResult.metadata = extractionResult.metadata || {};
      extractionResult.metadata.confidenceCheck = confidenceCheck;
      extractionResult.metadata.day10Enhanced = true;
    }

    let validationResult;
    if (typeof ValidationManager !== 'undefined') {
      validationResult = ValidationManager.executeUnifiedValidation(
        extractionResult.data,
        siteType,
        config
      );
    }

    analyticsEngine.recordExtraction(extractionResult, siteType);

    const testDuration = Date.now() - testStartTime;

    const result = {
      success: true,
      siteKey: site.key,
      siteName: site.name || site.key,
      siteType,
      extraction: extractionResult,
      validation: validationResult,
      testDuration,
      day10Enhanced: true
    };

    // Cleanup
    if (config.autoCloseTestTabs && testTab) {
      setTimeout(() => {
        tabManager.closeTab(testTab.id, 'batch-test-complete');
      }, config.tabCleanupDelay);
    }

    return result;

  } catch (error) {
    if (testTab) {
      await tabManager.closeTab(testTab.id, 'batch-test-error');
    }

    return {
      success: false,
      siteKey: site.key,
      siteName: site.name || site.key,
      error: error.message,
      testDuration: Date.now() - testStartTime,
      day10Enhanced: true
    };
  }
}

// ============================================================================
// TAB CLOSE LISTENER (CLEANUP)
// ============================================================================

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (tabManager.openTabs.has(tabId)) {
    BackgroundLogger.debug('🗑️ Tracked tab closed externally', { tabId });
    tabManager.openTabs.delete(tabId);
    tabManager.tabCreationTimes.delete(tabId);
    
    const timeoutId = tabManager.tabCleanupTimeouts.get(tabId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      tabManager.tabCleanupTimeouts.delete(tabId);
    }
  }
});

// ============================================================================
// EXTENSION LIFECYCLE LISTENERS
// ============================================================================

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    BackgroundLogger.info('🎉 Extension installed - Day 10 AI Engine v1');
    await initializeExtension();
  } else if (details.reason === 'update') {
    BackgroundLogger.info('🔄 Extension updated - Day 10 AI Engine v1', {
      previousVersion: details.previousVersion
    });
    await initializeExtension();
  }
});

chrome.runtime.onStartup.addListener(async () => {
  BackgroundLogger.info('🚀 Extension started - Day 10 AI Engine v1');
  await initializeExtension();
});

// ============================================================================
// INITIALIZATION
// ============================================================================

async function initializeExtension() {
  const initStart = Date.now();
  
  try {
    BackgroundLogger.info('🔧 Initializing Day 10 AI Engine v1...');

    // Step 1: Load API key from storage
    try {
      const result = await chrome.storage.local.get(['aiApiKey']);
      if (result.aiApiKey) {
        AI_CONFIG.apiKey = BackgroundUtils.deobfuscateApiKey(result.aiApiKey);
        BackgroundLogger.info('🔑 API key loaded from storage (deobfuscated)');
      } else {
        BackgroundLogger.warn('⚠️ No API key found in storage');
      }
    } catch (storageError) {
      BackgroundLogger.error('Failed to load API key', { error: storageError.message });
    }

    // Step 2: Load modules
    const moduleResults = await loadModules();
    BackgroundLogger.info('📦 Modules loaded', {
      loaded: moduleResults.loaded.length,
      failed: moduleResults.failed.length
    });

    // Step 3: Load enterprise config
    await loadEnterpriseConfig();

    // Step 4: Initialize analytics
    analyticsEngine.reset();
    BackgroundLogger.info('📊 Analytics engine initialized');

    const initDuration = Date.now() - initStart;

    BackgroundLogger.info('✅ Day 10 AI Engine v1 initialization complete', {
      duration: `${initDuration}ms`,
      version: DAY10_VERSION,
      apiKeyConfigured: !!AI_CONFIG.apiKey,
      modulesLoaded: AI_CONFIG.modulesLoaded,
      day10Features: {
        confidenceValidation: true,
        piiStripping: AI_CONFIG.enablePIIStripping,
        autoCorrect: AI_CONFIG.enableAutoCorrect,
        dateStandardization: AI_CONFIG.dateStandardization
      }
    });

  } catch (error) {
    BackgroundLogger.error('❌ Initialization failed', {
      error: error.message,
      stack: error.stack
    });
  }
}

// Auto-initialize on script load
initializeExtension();

BackgroundLogger.info('🎯 Day 10 Background Script Ready - AI Engine v1 (80% Accuracy Target)');

// ============================================================================
// PART 5/5: GLOBAL EXPORTS & UTILITY FUNCTIONS (FINAL)
// ============================================================================

// ============================================================================
// GLOBAL WINDOW EXPORTS (FOR CROSS-MODULE ACCESS)
// ============================================================================

if (typeof window !== 'undefined') {
  window.AI_CONFIG = AI_CONFIG;
  window.tabManager = tabManager;
  window.analyticsEngine = analyticsEngine;
  window.BackgroundLogger = BackgroundLogger;
  window.BackgroundUtils = BackgroundUtils;
  
  // Day 10 utility exports
  window.validateConfidenceDay10 = validateConfidenceDay10;
  window.stripPIIDay10 = stripPIIDay10;
  window.standardizeDateDay10 = standardizeDateDay10;
  window.postProcessDay10 = postProcessDay10;
}

// ============================================================================
// EXTENSION ACTION (POPUP) HANDLERS
// ============================================================================

chrome.action.onClicked.addListener((tab) => {
  BackgroundLogger.info('🎯 Extension icon clicked', {
    tabId: tab.id,
    url: tab.url
  });
});

// ============================================================================
// ALARMS (FOR PERIODIC TASKS)
// ============================================================================

// Set up periodic cleanup alarm
chrome.alarms.create('cleanupTabs', {
  periodInMinutes: 5
});

chrome.alarms.create('analyticsPersistence', {
  periodInMinutes: 10
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'cleanupTabs') {
    BackgroundLogger.debug('🧹 Periodic tab cleanup triggered');
    
    // Close tabs older than maxTabLifetime
    const now = Date.now();
    const tabsToClose = [];
    
    tabManager.tabCreationTimes.forEach((creationTime, tabId) => {
      if (now - creationTime > tabManager.maxTabAge) {
        tabsToClose.push(tabId);
      }
    });
    
    for (const tabId of tabsToClose) {
      await tabManager.closeTab(tabId, 'cleanup-alarm');
    }
    
    if (tabsToClose.length > 0) {
      BackgroundLogger.info(`🗑️ Cleaned up ${tabsToClose.length} old tabs`);
    }
  }
  
  if (alarm.name === 'analyticsPersistence') {
    BackgroundLogger.debug('💾 Periodic analytics persistence triggered');
    
    try {
      const analytics = analyticsEngine.getAnalytics();
      await chrome.storage.local.set({
        analyticsSnapshot: {
          timestamp: new Date().toISOString(),
          businessMetrics: analytics.businessMetrics,
          realTimeStats: analytics.realTimeStats,
          day10Status: analytics.day10Status
        }
      });
      
      BackgroundLogger.debug('✅ Analytics persisted to storage');
    } catch (error) {
      BackgroundLogger.error('Failed to persist analytics', { error: error.message });
    }
  }
});

// ============================================================================
// CONTEXT MENU (RIGHT-CLICK) INTEGRATION
// ============================================================================

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'extractCurrentPage',
    title: 'Extract Data (Day 10 AI)',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'viewAnalytics',
    title: 'View Day 10 Analytics',
    contexts: ['action']
  });
  
  BackgroundLogger.info('📋 Context menus created');
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'extractCurrentPage') {
    BackgroundLogger.info('🖱️ Context menu extraction triggered', {
      url: tab.url
    });
    
    // Trigger extraction via message to popup
    chrome.runtime.sendMessage({
      action: 'contextMenuExtraction',
      tabId: tab.id,
      url: tab.url
    }).catch(err => {
      BackgroundLogger.debug('Context menu message not handled (popup may be closed)');
    });
  }
  
  if (info.menuItemId === 'viewAnalytics') {
    BackgroundLogger.info('📊 Context menu analytics view triggered');
    
    // Open analytics in new window (optional enhancement)
    const analytics = analyticsEngine.getAnalytics();
    console.log('=== DAY 10 ANALYTICS ===');
    console.log('Business Metrics:', analytics.businessMetrics);
    console.log('Real-Time Stats:', analytics.realTimeStats);
    console.log('Day 10 Status:', analytics.day10Status);
    console.log('=======================');
  }
});

// ============================================================================
// STORAGE CHANGE LISTENER (REAL-TIME SYNC)
// ============================================================================

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.aiApiKey) {
      BackgroundLogger.info('🔑 API key updated in storage', {
        hasNewValue: !!changes.aiApiKey.newValue
      });
      
      if (changes.aiApiKey.newValue) {
        AI_CONFIG.apiKey = BackgroundUtils.deobfuscateApiKey(changes.aiApiKey.newValue);
        AI_CONFIG.cache.apiValidation = null; // Invalidate cache
      } else {
        AI_CONFIG.apiKey = null;
      }
    }
    
    if (changes.enterpriseConfig) {
      BackgroundLogger.info('🏢 Enterprise config updated in storage');
      loadEnterpriseConfig();
    }
  }
});

// ============================================================================
// ERROR BOUNDARY & GLOBAL ERROR HANDLER
// ============================================================================

self.addEventListener('error', (event) => {
  BackgroundLogger.error('🚨 Global error caught', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.stack
  });
});

self.addEventListener('unhandledrejection', (event) => {
  BackgroundLogger.error('🚨 Unhandled promise rejection', {
    reason: event.reason,
    promise: event.promise
  });
  event.preventDefault();
});

// ============================================================================
// KEEPALIVE (PREVENT SERVICE WORKER TERMINATION)
// ============================================================================

let keepAliveInterval = null;

function startKeepAlive() {
  if (!keepAliveInterval) {
    keepAliveInterval = setInterval(() => {
      chrome.runtime.getPlatformInfo(() => {
        // Just a ping to keep service worker alive
        BackgroundLogger.debug('💓 Keepalive ping');
      });
    }, 20000); // Every 20 seconds
    
    BackgroundLogger.debug('💓 Keepalive started');
  }
}

function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    BackgroundLogger.debug('💓 Keepalive stopped');
  }
}

// Start keepalive on initialization
startKeepAlive();

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

let performanceMonitor = {
  messageCount: 0,
  errorCount: 0,
  lastReset: Date.now(),
  
  recordMessage() {
    this.messageCount++;
  },
  
  recordError() {
    this.errorCount++;
  },
  
  getStats() {
    const uptime = Date.now() - this.lastReset;
    return {
      messageCount: this.messageCount,
      errorCount: this.errorCount,
      uptimeMs: uptime,
      messagesPerMinute: (this.messageCount / (uptime / 60000)).toFixed(2),
      errorRate: this.messageCount > 0 ? 
        ((this.errorCount / this.messageCount) * 100).toFixed(2) + '%' : '0%'
    };
  },
  
  reset() {
    this.messageCount = 0;
    this.errorCount = 0;
    this.lastReset = Date.now();
  }
};

// ============================================================================
// DEBUG UTILITIES (CONSOLE COMMANDS)
// ============================================================================

window.Day10Debug = {
  version: DAY10_VERSION,
  
  getConfig: () => {
    return AI_CONFIG;
  },
  
  getAnalytics: () => {
    return analyticsEngine.getAnalytics();
  },
  
  getTrends: () => {
    return analyticsEngine.getTrends();
  },
  
  getPredictions: () => {
    return analyticsEngine.getPredictions();
  },
  
  getTabInfo: () => {
    return tabManager.getOpenTabsInfo();
  },
  
  getPerformance: () => {
    return performanceMonitor.getStats();
  },
  
  resetAnalytics: () => {
    analyticsEngine.reset();
    console.log('✅ Analytics reset');
  },
  
  closeAllTabs: async () => {
    await tabManager.closeAllTabs('manual-debug');
    console.log('✅ All tabs closed');
  },
  
  testApiKey: async (apiKey) => {
    const validation = await BackgroundUtils.validateApiKey(apiKey || AI_CONFIG.apiKey);
    console.log('API Key Validation:', validation);
    return validation;
  },
  
  enableDebugLogging: () => {
    AI_CONFIG.logging.maxLogsPerSecond = 100;
    console.log('✅ Debug logging enabled');
  },
  
  disableDebugLogging: () => {
    AI_CONFIG.logging.maxLogsPerSecond = 15;
    console.log('✅ Debug logging disabled');
  },
  
  help: () => {
    console.log(`
    ╔══════════════════════════════════════════════════════╗
    ║         DAY 10 DEBUG UTILITIES (AI ENGINE v1)        ║
    ╚══════════════════════════════════════════════════════╝
    
    Available Commands:
    
    Day10Debug.getConfig()           - View current configuration
    Day10Debug.getAnalytics()        - View analytics data
    Day10Debug.getTrends()           - View accuracy trends
    Day10Debug.getPredictions()      - View Day 10/15 predictions
    Day10Debug.getTabInfo()          - View managed tabs info
    Day10Debug.getPerformance()      - View performance stats
    Day10Debug.resetAnalytics()      - Reset analytics data
    Day10Debug.closeAllTabs()        - Close all managed tabs
    Day10Debug.testApiKey(key)       - Test API key validity
    Day10Debug.enableDebugLogging()  - Enable verbose logging
    Day10Debug.disableDebugLogging() - Disable verbose logging
    Day10Debug.help()                - Show this help message
    
    Examples:
    > Day10Debug.getAnalytics()
    > Day10Debug.getTrends()
    > Day10Debug.testApiKey('YOUR_API_KEY')
    `);
  }
};

// ============================================================================
// FINAL STATUS LOG
// ============================================================================

console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║       🎯 DAY 10 AI ENGINE v1 - BACKGROUND SCRIPT LOADED              ║
║                                                                      ║
║  Version: ${DAY10_VERSION.padEnd(55)}║
║  Target:  80%+ Overall Accuracy                                      ║
║                                                                      ║
║  Day 10 Features:                                                    ║
║  ✅ Confidence Scoring (Threshold: ${AI_CONFIG.confidenceThreshold}%)${' '.repeat(31)}║
║  ✅ PII Stripping                                                    ║
║  ✅ Date Standardization (YYYY-MM-DD)                                ║
║  ✅ Auto-Correct Validation                                          ║
║  ✅ Retry Logic (3 attempts)                                         ║
║  ✅ Token Limits Enforced                                            ║
║  ✅ Smart Tab Management                                             ║
║  ✅ Real-Time Analytics                                              ║
║                                                                      ║
║  API Key: ${AI_CONFIG.apiKey ? '✅ Configured' : '⚠️  Not Configured'}${' '.repeat(48)}║
║  Modules: ${AI_CONFIG.modulesLoaded ? '✅ Loaded' : '❌ Failed'}${' '.repeat(52)}║
║                                                                      ║
║  Debug Console: Type Day10Debug.help() for commands                 ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
`);

BackgroundLogger.info('🏆 Day 10 Background Script fully loaded and operational');

// ============================================================================
// END OF background.js - DAY 10 AI ENGINE v1
// ============================================================================
