// Day 10: Validation Manager Module - AI Engine v1 Enhanced (80% Accuracy Milestone)
// /src/modules/validation.js - DAY 10 ENHANCED WITH CONFIDENCE VALIDATION

// ============================================================================
// DAY 10 ENHANCEMENTS - CONFIDENCE-BASED VALIDATION
// ============================================================================

const DAY10_VERSION = 'day10-ai-engine-v1-validation';

// Day 10: Confidence-Based Validation Function
function validateWithConfidenceDay10(extractedData, validationResult) {
  const confidence = extractedData?.confidence_score;
  
  if (!confidence || typeof confidence !== 'number') {
    validationResult.metadata = validationResult.metadata || {};
    validationResult.metadata.confidenceWarning = 'NO_CONFIDENCE_SCORE';
    validationResult.metadata.confidenceScore = 50; // Default medium
    return validationResult;
  }
  
  // Auto-discard if confidence < 50
  if (confidence < 50) {
    validationResult.success = false;
    validationResult.metadata = validationResult.metadata || {};
    validationResult.metadata.confidenceDiscard = true;
    validationResult.metadata.confidenceScore = confidence;
    validationResult.penalties = validationResult.penalties || [];
    validationResult.penalties.push({
      field: 'confidence_score',
      type: 'AUTO_DISCARD_LOW_CONFIDENCE',
      severity: 'CRITICAL',
      impact: 100,
      original: confidence,
      expected: 'Minimum 50',
      message: `Confidence too low: ${confidence}% < 50%`,
      timestamp: new Date().toISOString()
    });
    validationResult.totalPenalty = (validationResult.totalPenalty || 0) + 100;
  } else {
    validationResult.metadata = validationResult.metadata || {};
    validationResult.metadata.confidenceScore = confidence;
    validationResult.metadata.confidenceValidated = true;
  }
  
  return validationResult;
}

// ============================================================================
// EXISTING DAY 8 CODE PRESERVED BELOW (WITH DAY 10 INTEGRATION)
// ============================================================================

const STANDARD_VALIDATION_FIELDS = [
  'title', 'author', 'publishdate', 'description', 'summary', 'category',
  'main_content_summary'
];

const ARRAY_VALIDATION_FIELDS = [
  'ingredients', 'instructions', 'links', 'images'
];

const FORMAT_VALIDATION_FIELDS = [
  'price', 'reviews_rating', 'publishdate'
];

const VALIDATION_PATTERNS = {
  price: /^\$?\d+(\.\d{1,2})?$/,
  rating: /^(\d+(\.\d+)?\/5|\d+(\.\d+)?)$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  flexibleDate: /\d+/,
  imageUrl: /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i,
  ingredient: /^[a-zA-Z0-9\s\-,()\.\/]+$/,
  currency: /^\$?[\d,]+\.?\d{0,2}$/
};

let SITE_VALIDATION_RULES = {
  'amazon': {
    required: ['title', 'price', 'description'],
    critical: ['price', 'reviews_rating'],
    arrayMinimums: { images: 1 },
    customThresholds: { price: { min: 0, max: 10000 }, rating: { min: 1, max: 5 } },
    penaltyWeights: { CRITICAL: 35, HIGH: 25, MEDIUM: 15, LOW: 10, WARNING: 5 }
  },
  'allrecipes': {
    required: ['title', 'ingredients', 'instructions'],
    critical: ['ingredients', 'instructions'],
    arrayMinimums: { ingredients: 3, instructions: 2 },
    customThresholds: { ingredients: { min: 2, max: 50 }, instructions: { min: 2, max: 30 } },
    penaltyWeights: { CRITICAL: 30, HIGH: 20, MEDIUM: 15, LOW: 10, WARNING: 5 }
  },
  'bloomberg': {
    required: ['title', 'description'],
    critical: ['title'],
    optional: ['author', 'publishdate', 'category', 'summary'],
    arrayMinimums: {},
    customThresholds: {
      title: { min: 5, max: 200 },
      description: { min: 10, max: 1000 },
      summary: { min: 20, max: 2000 },
      category: { min: 2, max: 50 },
      author: { min: 2, max: 100 },
      publishdate: { pattern: 'flexible' }
    },
    penaltyWeights: {
      CRITICAL: 25,
      HIGH: 15,
      MEDIUM: 10,
      LOW: 5,
      WARNING: 2
    },
    fieldMappings: {
      'title': 'title',
      'description': 'description',
      'category': 'category',
      'summary': 'summary',
      'publishdate': 'publishdate',
      'author': 'author'
    }
  },
  'wikipedia': {
    required: ['title', 'main_content_summary'],
    critical: ['main_content_summary'],
    arrayMinimums: { links: 2 },
    customThresholds: { links: { min: 1, max: 100 } },
    penaltyWeights: { CRITICAL: 30, HIGH: 20, MEDIUM: 15, LOW: 10, WARNING: 5 }
  },
  'medium': {
    required: ['title', 'author', 'main_content_summary'],
    critical: ['author'],
    arrayMinimums: {},
    customThresholds: { content_length: { min: 200, max: 10000 } },
    penaltyWeights: { CRITICAL: 30, HIGH: 20, MEDIUM: 15, LOW: 10, WARNING: 5 }
  },
  'generic': {
    required: ['title'],
    critical: [],
    arrayMinimums: {},
    customThresholds: {},
    penaltyWeights: { CRITICAL: 30, HIGH: 20, MEDIUM: 15, LOW: 10, WARNING: 5 }
  }
};

const DEFAULT_PENALTY_SEVERITY_WEIGHTS = {
  'CRITICAL': 30,
  'HIGH': 20,
  'MEDIUM': 15,
  'LOW': 10,
  'WARNING': 5
};

const VALIDATION_ANALYTICS_CACHE = new Map();
const VALIDATION_PLUGINS = new Map();
const ANOMALY_DETECTION_CACHE = new Map();
const VALIDATION_WORKER_POOL = [];

const ValidationManager = {
  VERSION: 'day10-validation-v4.0', // Day 10 version bump

  // ===== UNIFIED VALIDATION WITH DAY 10 CONFIDENCE CHECK =====
  executeUnifiedValidation(data, siteType, AI_CONFIG) {
    const validationStart = Date.now();
    const timestamp = new Date().toISOString();
    
    this.debugLog(`[Day10] Starting unified validation for ${siteType}`, {
      siteType,
      fieldsToValidate: Object.keys(data || {}).length
    });
    
    let validationResult;
    
    if (AI_CONFIG?.utilityStatus?.validator?.loaded && this.isModuleLoaded('ValidatorManager')) {
      this.debugLog(`[Day10] Using championship ValidatorManager for ${siteType}`);
      validationResult = ValidatorManager.applyValidationPenalties(data, siteType);
      validationResult.method = 'ValidatorManager';
    } else {
      this.debugLog(`[Day10] Using enhanced fallback validation for ${siteType}`);
      validationResult = this.applyEnhancedValidationPenalties(data, siteType, AI_CONFIG);
      validationResult.method = 'enhanced-fallback';
    }
    
    // ===== DAY 10: CONFIDENCE VALIDATION =====
    validationResult = validateWithConfidenceDay10(data, validationResult);
    this.debugLog(`[Day10] Confidence validation completed`, {
      confidence: validationResult.metadata?.confidenceScore,
      discarded: validationResult.metadata?.confidenceDiscard
    });
    
    const pluginResults = this.executePluginValidation(data, siteType, AI_CONFIG);
    validationResult.pluginResults = pluginResults;
    
    const anomalyResult = this.detectAnomalies(siteType, {
      penalties: validationResult.penalties?.length || 0,
      accuracy: validationResult.metadata?.validatedAccuracy || 0
    });
    validationResult.anomalies = anomalyResult;
    
    const validationDuration = Date.now() - validationStart;
    validationResult.performance = {
      duration: validationDuration,
      timestamp,
      version: this.VERSION,
      day10Enhanced: true
    };
    
    this.cacheValidationAnalytics(siteType, validationResult);
    
    this.debugLog(`[Day10] Unified validation completed for ${siteType}`, {
      duration: validationDuration,
      penalties: validationResult.penalties?.length || 0,
      confidence: validationResult.metadata?.confidenceScore,
      method: validationResult.method
    });
    
    return validationResult;
  },

  // ALL OTHER METHODS FROM YOUR ORIGINAL FILE (UNCHANGED)
  // Copy everything below from your existing validation.js:
  
  async executeParallelValidation(datasets, siteType, AI_CONFIG) {
    if (!Array.isArray(datasets) || datasets.length <= 1) {
      return this.executeUnifiedValidation(datasets[0] || {}, siteType, AI_CONFIG);
    }
    
    this.debugLog(`Starting parallel validation for ${datasets.length} datasets`, {
      siteType,
      datasetCount: datasets.length
    });
    
    const chunkSize = Math.max(1, Math.floor(datasets.length / 4));
    const chunks = this.chunkArray(datasets, chunkSize);
    const validationPromises = chunks.map((chunk, index) =>
      this.validateChunkAsync(chunk, siteType, AI_CONFIG, index)
    );
    
    try {
      const results = await Promise.allSettled(validationPromises);
      const aggregatedResult = this.aggregateParallelResults(results);
      
      this.debugLog(`Parallel validation completed`, {
        totalDatasets: datasets.length,
        chunks: chunks.length,
        successfulChunks: results.filter(r => r.status === 'fulfilled').length
      });
      
      return aggregatedResult;
    } catch (error) {
      this.debugLog(`Parallel validation error`, { error: error.message });
      throw error;
    }
  },

  async validateChunkAsync(chunk, siteType, AI_CONFIG, workerIndex) {
    const chunkResults = [];
    for (const data of chunk) {
      try {
        const result = this.executeUnifiedValidation(data, siteType, AI_CONFIG);
        chunkResults.push({ success: true, result });
      } catch (error) {
        chunkResults.push({ success: false, error: error.message, data });
      }
    }
    return { workerIndex, results: chunkResults };
  },

  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  },

  aggregateParallelResults(results) {
    const allResults = [];
    const errors = [];
    
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        result.value.results.forEach(r => {
          if (r.success) {
            allResults.push(r.result);
          } else {
            errors.push(r.error);
          }
        });
      } else {
        errors.push(result.reason);
      }
    });
    
    return {
      validatedResults: allResults,
      errors: errors,
      parallelProcessing: true,
      workersUsed: results.length,
      metadata: {
        totalResults: allResults.length,
        totalErrors: errors.length,
        parallelEfficiency: allResults.length / (allResults.length + errors.length)
      }
    };
  },

  updateSiteValidationRules(siteType, customRules) {
    if (SITE_VALIDATION_RULES[siteType]) {
      SITE_VALIDATION_RULES[siteType] = {
        ...SITE_VALIDATION_RULES[siteType],
        ...customRules,
        lastUpdated: new Date().toISOString()
      };
      this.debugLog(`Updated validation rules for ${siteType}`, customRules);
      return true;
    }
    return false;
  },

  getSiteValidationRules(siteType) {
    return SITE_VALIDATION_RULES[siteType] || SITE_VALIDATION_RULES['generic'];
  },

  detectAnomalies(siteType, currentMetrics) {
    const historicalData = VALIDATION_ANALYTICS_CACHE.get(siteType);
    if (!historicalData || historicalData.validations.length < 10) {
      return { anomalies: [], confidence: 'LOW', reason: 'INSUFFICIENT_HISTORICAL_DATA' };
    }
    
    const recent = historicalData.validations.slice(-20);
    const anomalies = [];
    
    const avgPenalties = recent.reduce((sum, v) => sum + v.penalties, 0) / recent.length;
    const stdDevPenalties = Math.sqrt(recent.reduce((sum, v) => sum + Math.pow(v.penalties - avgPenalties, 2), 0) / recent.length);
    
    if (Math.abs(currentMetrics.penalties - avgPenalties) > 2 * stdDevPenalties) {
      anomalies.push({
        type: 'PENALTY_COUNT_ANOMALY',
        expected: Math.round(avgPenalties),
        actual: currentMetrics.penalties,
        severity: Math.abs(currentMetrics.penalties - avgPenalties) > 3 * stdDevPenalties ? 'HIGH' : 'MEDIUM',
        confidence: this.calculateAnomalyConfidence(recent.length, stdDevPenalties)
      });
    }
    
    const avgAccuracy = recent.reduce((sum, v) => sum + v.accuracy, 0) / recent.length;
    const accuracyThreshold = avgAccuracy * 0.15;
    
    if (avgAccuracy - currentMetrics.accuracy > accuracyThreshold) {
      anomalies.push({
        type: 'ACCURACY_DROP_ANOMALY',
        expected: Math.round(avgAccuracy),
        actual: Math.round(currentMetrics.accuracy),
        severity: 'HIGH',
        confidence: this.calculateAnomalyConfidence(recent.length, accuracyThreshold)
      });
    }
    
    ANOMALY_DETECTION_CACHE.set(`${siteType}_${Date.now()}`, {
      anomalies,
      timestamp: new Date().toISOString(),
      historicalSampleSize: recent.length
    });
    
    return {
      anomalies,
      confidence: anomalies.length > 0 ? 'HIGH' : 'NORMAL',
      historicalSampleSize: recent.length,
      baselineMetrics: { avgPenalties: Math.round(avgPenalties), avgAccuracy: Math.round(avgAccuracy) }
    };
  },

  calculateAnomalyConfidence(sampleSize, deviation) {
    if (sampleSize > 30 && deviation > 1) return 'HIGH';
    if (sampleSize > 15 && deviation > 0.5) return 'MEDIUM';
    return 'LOW';
  },

  validateArrayItem(fieldName, item, siteType = 'generic') {
    switch (fieldName) {
      case 'links':
        return typeof item === 'string' && VALIDATION_PATTERNS.url.test(item) && item.length > 10;
      case 'images':
        if (typeof item === 'string') {
          const isValidUrl = VALIDATION_PATTERNS.url.test(item);
          const hasImageExtension = VALIDATION_PATTERNS.imageUrl.test(item);
          const hasMinLength = item.length > 10;
          return isValidUrl && (hasImageExtension || item.includes('image') || item.includes('img'));
        }
        return false;
      case 'ingredients':
        if (typeof item === 'string') {
          const trimmed = item.trim();
          const hasValidFormat = VALIDATION_PATTERNS.ingredient.test(trimmed);
          const hasMinLength = trimmed.length >= 3;
          const notJustNumbers = !/^\d+$/.test(trimmed);
          return hasValidFormat && hasMinLength && notJustNumbers;
        }
        return false;
      case 'instructions':
        return typeof item === 'string' && item.trim().length >= 10 && item.trim().split(' ').length >= 3;
      default:
        return typeof item === 'string' && item.trim().length > 0;
    }
  },

  applyEnhancedValidationPenalties(data, siteType = 'generic', AI_CONFIG) {
    const siteRules = this.getSiteValidationRules(siteType);
    
    if (siteType === 'bloomberg') {
      return this.applyBloombergSpecificValidation(data, siteRules);
    }
    
    return this.applyStandardValidation(data, siteType, siteRules, AI_CONFIG);
  },

  applyBloombergSpecificValidation(data, siteRules) {
    const penalties = [];
    let totalPenalty = 0;
    let fieldsPassed = 0;
    let totalFields = 4;
    
    const requiredFields = ['title', 'description'];
    requiredFields.forEach(field => {
      const value = data[field];
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        penalties.push({
          field,
          type: 'REQUIRED_FIELD_MISSING',
          severity: field === 'title' ? 'CRITICAL' : 'HIGH',
          impact: field === 'title' ? 25 : 15,
          message: `Required Bloomberg field '${field}' is missing`
        });
        totalPenalty += (field === 'title' ? 25 : 15);
      } else {
        const minLength = field === 'title' ? 5 : 10;
        if (typeof value === 'string' && value.trim().length < minLength) {
          penalties.push({
            field,
            type: 'FIELD_TOO_SHORT',
            severity: 'MEDIUM',
            impact: 10,
            message: `Bloomberg field '${field}' is too short`
          });
          totalPenalty += 10;
        } else {
          fieldsPassed++;
        }
      }
    });
    
    const bonusFields = ['category', 'summary', 'publishdate', 'author'];
    bonusFields.forEach(field => {
      const value = data[field];
      if (value && typeof value === 'string' && value.trim().length > 0) {
        fieldsPassed++;
        if (field === 'publishdate' && !/\d+/.test(value)) {
          penalties.push({
            field,
            type: 'INVALID_FORMAT',
            severity: 'LOW',
            impact: 5,
            message: `Bloomberg publishdate should contain digits`
          });
          totalPenalty += 5;
        }
      }
    });
    
    totalFields = requiredFields.length + bonusFields.length;
    const rawAccuracy = Math.max(0, 100 - totalPenalty);
    const fieldCompleteness = (fieldsPassed / totalFields) * 100;
    const finalAccuracy = Math.round((rawAccuracy * 0.6) + (fieldCompleteness * 0.4));
    
    return {
      penalties,
      totalPenalty,
      fieldsPassed,
      totalFields,
      siteType: 'bloomberg',
      metadata: {
        validatedAccuracy: finalAccuracy,
        fieldCompleteness: Math.round(fieldCompleteness),
        penaltyImpact: totalPenalty,
        bloombergOptimized: true,
        day10Enhanced: true
      },
      version: this.VERSION,
      timestamp: new Date().toISOString()
    };
  },

  applyStandardValidation(data, siteType, siteRules, AI_CONFIG) {
    const penalties = [];
    let totalPenalty = 0;
    let fieldsPassed = 0;
    let totalFields = 0;
    
    siteRules.required.forEach(field => {
      totalFields++;
      const value = data[field];
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        const severity = siteRules.critical.includes(field) ? 'CRITICAL' : 'HIGH';
        const impact = siteRules.penaltyWeights[severity] || 20;
        penalties.push({
          field,
          type: 'REQUIRED_FIELD_MISSING',
          severity,
          impact,
          message: `Required field '${field}' is missing`
        });
        totalPenalty += impact;
      } else {
        fieldsPassed++;
        const fieldPenalties = this.validateFieldContent(field, value, siteType, siteRules);
        penalties.push(...fieldPenalties);
        totalPenalty += fieldPenalties.reduce((sum, p) => sum + p.impact, 0);
      }
    });
    
    const rawAccuracy = Math.max(0, 100 - totalPenalty);
    const fieldCompleteness = totalFields > 0 ? (fieldsPassed / totalFields) * 100 : 0;
    const finalAccuracy = Math.round((rawAccuracy * 0.7) + (fieldCompleteness * 0.3));
    
    return {
      penalties,
      totalPenalty,
      fieldsPassed,
      totalFields,
      siteType,
      metadata: {
        validatedAccuracy: finalAccuracy,
        fieldCompleteness: Math.round(fieldCompleteness),
        penaltyImpact: totalPenalty,
        day10Enhanced: true
      },
      version: this.VERSION,
      timestamp: new Date().toISOString()
    };
  },

  validateFieldContent(field, value, siteType, siteRules) {
    const penalties = [];
    const thresholds = siteRules.customThresholds?.[field];
    
    if (thresholds && typeof value === 'string') {
      if (thresholds.min && value.length < thresholds.min) {
        penalties.push({
          field,
          type: 'FIELD_TOO_SHORT',
          severity: 'MEDIUM',
          impact: 10,
          message: `Field '${field}' is too short`
        });
      }
      
      if (thresholds.max && value.length > thresholds.max) {
        penalties.push({
          field,
          type: 'FIELD_TOO_LONG',
          severity: 'LOW',
          impact: 5,
          message: `Field '${field}' is too long`
        });
      }
    }
    
    if (FORMAT_VALIDATION_FIELDS.includes(field)) {
      const formatPenalty = this.validateFieldFormat(field, value, siteType);
      if (formatPenalty) {
        penalties.push(formatPenalty);
      }
    }
    
    if (Array.isArray(value)) {
      const arrayPenalties = this.validateArrayField(field, value, siteType, siteRules);
      penalties.push(...arrayPenalties);
    }
    
    return penalties;
  },

  validateFieldFormat(field, value, siteType) {
    switch (field) {
      case 'price':
        if (!VALIDATION_PATTERNS.price.test(value)) {
          return {
            field,
            type: 'INVALID_FORMAT',
            severity: 'HIGH',
            impact: 15,
            message: 'Price format is invalid'
          };
        }
        break;
      case 'publishdate':
        const pattern = siteType === 'bloomberg' ?
          VALIDATION_PATTERNS.flexibleDate : VALIDATION_PATTERNS.date;
        if (!pattern.test(value)) {
          return {
            field,
            type: 'INVALID_FORMAT',
            severity: siteType === 'bloomberg' ? 'LOW' : 'MEDIUM',
            impact: siteType === 'bloomberg' ? 5 : 10,
            message: 'Date format is invalid'
          };
        }
        break;
      case 'reviews_rating':
        if (!VALIDATION_PATTERNS.rating.test(value)) {
          return {
            field,
            type: 'INVALID_FORMAT',
            severity: 'MEDIUM',
            impact: 10,
            message: 'Rating format is invalid'
          };
        }
        break;
    }
    return null;
  },

  validateArrayField(field, value, siteType, siteRules) {
    const penalties = [];
    const minItems = siteRules.arrayMinimums?.[field];
    
    if (minItems && value.length < minItems) {
      penalties.push({
        field,
        type: 'INSUFFICIENT_ARRAY_ITEMS',
        severity: 'HIGH',
        impact: 15,
        message: `Field '${field}' needs at least ${minItems} items`
      });
    }
    
    let validItems = 0;
    value.forEach(item => {
      if (this.validateArrayItem(field, item, siteType)) {
        validItems++;
      }
    });
    
    const validItemsRatio = value.length > 0 ? validItems / value.length : 0;
    if (validItemsRatio < 0.7) {
      penalties.push({
        field,
        type: 'POOR_ARRAY_QUALITY',
        severity: 'MEDIUM',
        impact: 10,
        message: `Field '${field}' has too many invalid items`
      });
    }
    
    return penalties;
  },

  registerValidationPlugin(name, plugin) {
    if (typeof plugin.validate !== 'function') {
      throw new Error('Validation plugin must have a validate method');
    }
    
    VALIDATION_PLUGINS.set(name, {
      ...plugin,
      registeredAt: new Date().toISOString(),
      version: plugin.version || '1.0.0'
    });
    
    this.debugLog(`Registered validation plugin: ${name}`, {
      version: plugin.version,
      methods: Object.keys(plugin)
    });
    
    return true;
  },

  unregisterValidationPlugin(name) {
    const removed = VALIDATION_PLUGINS.delete(name);
    if (removed) {
      this.debugLog(`Unregister validation plugin: ${name}`);
    }
    return removed;
  },

  executePluginValidation(data, siteType, AI_CONFIG) {
    const pluginResults = [];
    VALIDATION_PLUGINS.forEach((plugin, name) => {
      try {
        const result = plugin.validate(data, siteType, AI_CONFIG);
        pluginResults.push({
          plugin: name,
          version: plugin.version,
          success: true,
          result
        });
      } catch (error) {
        pluginResults.push({
          plugin: name,
          version: plugin.version,
          success: false,
          error: error.message
        });
      }
    });
    return pluginResults;
  },

  cacheValidationAnalytics(siteType, validationResult) {
    if (!VALIDATION_ANALYTICS_CACHE.has(siteType)) {
      VALIDATION_ANALYTICS_CACHE.set(siteType, { validations: [] });
    }
    
    const analytics = VALIDATION_ANALYTICS_CACHE.get(siteType);
    analytics.validations.push({
      timestamp: validationResult.timestamp || new Date().toISOString(),
      penalties: validationResult.penalties?.length || 0,
      accuracy: validationResult.metadata?.validatedAccuracy || 0,
      penaltyImpact: validationResult.totalPenalty || 0,
      fieldsPassed: validationResult.fieldsPassed || 0,
      totalFields: validationResult.totalFields || 0
    });
    
    if (analytics.validations.length > 100) {
      analytics.validations = analytics.validations.slice(-100);
    }
  },

  isModuleLoaded(moduleName) {
    try {
      return typeof window !== 'undefined' && window[moduleName] !== undefined;
    } catch (error) {
      return false;
    }
  },

  debugLog(message, data = {}) {
    if (typeof console !== 'undefined') {
      console.log(`[ValidationManager] ${message}`, data);
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValidationManager;
} else if (typeof window !== 'undefined') {
  window.ValidationManager = ValidationManager;
}

console.log(`[ValidationManager] Day 10 AI ENGINE v1 validation system loaded - Confidence validation enabled`);
