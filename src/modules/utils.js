// Day 10: Background Utilities Module - v4.2.0 (Batch Processing + Cost Tracking)
// /src/modules/utils.js
// 🆕 v4.2: Added batch helpers, cost calculation, template utilities

// ============================================================================
// v4.2.0 CONSTANTS
// ============================================================================

const DAY10_ACCURACY_TARGET = 80;
const DAY10_CONFIDENCE_TARGET = 75;
const DAY10_MIN_CONFIDENCE = 50;

// 🆕 v4.2: Cost constants (Gemini Flash pricing)
const COST_PER_1K_INPUT_TOKENS = 0.00015;  // $0.15 per 1M tokens
const COST_PER_1K_OUTPUT_TOKENS = 0.0006;   // $0.60 per 1M tokens
const AVG_TOKENS_PER_ITEM = 150;
const AVG_OUTPUT_TOKENS = 50;

// Day 10: PII Detection Patterns
const PII_PATTERNS = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  PHONE: /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
  CREDIT_CARD: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  ADDRESS: /\d+\s+[a-zA-Z0-9\s,]+(?:street|st|avenue|ave|road|rd|highway|hwy|square|sq|trail|trl|drive|dr|court|ct|parkway|pkwy|circle|cir|boulevard|blvd)\b/gi
};

// Day 10: Date Format Patterns
const DATE_FORMAT_PATTERNS = [
  { regex: /^(\d{4})-(\d{2})-(\d{2})$/, name: 'ISO8601' },
  { regex: /^(\d{2})\/(\d{2})\/(\d{4})$/, name: 'US' },
  { regex: /^(\d{2})-(\d{2})-(\d{4})$/, name: 'EU' },
  { regex: /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/, name: 'LONG' }
];

// ===== PERFORMANCE OPTIMIZATIONS - CACHED CONSTANTS =====

const STANDARD_FIELDS = [
  'title', 'author', 'publication_date', 'main_content_summary',
  'category', 'description', 'links', 'images', 'price',
  'ingredients', 'instructions', 'reviews_rating',
  'title_translated', 'description_translated', 'summary' // 🆕 v4.2
];

const VALIDATION_FIELDS = [
  'title', 'author', 'publication_date', 'main_content_summary',
  'category', 'description'
];

// Performance optimized domain type mapping
const DOMAIN_TYPE_MAP = [
  { pattern: /amazon\./, type: 'amazon' },
  { pattern: /(allrecipes\.|food\.com|recipe)/, type: 'allrecipes' },
  { pattern: /bloomberg/, type: 'bloomberg' },
  { pattern: /wikipedia\./, type: 'wikipedia' },
  { pattern: /(medium\.|substack\.)/, type: 'medium' },
  { pattern: /reddit\./, type: 'reddit' },
  { pattern: /producthunt\./, type: 'producthunt' },
  { pattern: /github\./, type: 'github' },
  { pattern: /stackoverflow\./, type: 'stackoverflow' },
  { pattern: /linkedin\./, type: 'linkedin' }
];

// API key validation patterns (cached)
const API_KEY_PATTERNS = [
  { regex: /^AIza[0-9A-Za-z_-]{35}$/, type: 'Google API Standard' },
  { regex: /^[A-Za-z0-9_-]{30,}$/, type: 'Generic Long Format' },
  { regex: /^sk-[A-Za-z0-9]{20,}$/, type: 'OpenAI Style' }
];

// Regex patterns cached for performance
const PRICE_REGEX = /^\$?\d+(\.\d{1,2})?$/;
const RATING_REGEX = /^(\d+(\.\d+)?\/5|\d+(\.\d+)?)$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// API Key validation cache (5 minute TTL)
const API_KEY_CACHE = new Map();

// ===== MAIN MODULE =====

const BackgroundUtils = {
  VERSION: 'v4.2.0-batch-utils', // 🆕 v4.2 version
  
  // ============================================================================
  // DAY 10 CONFIDENCE SCORE UTILITIES
  // ============================================================================
  
  validateConfidenceScore(confidence) {
    return typeof confidence === 'number' && confidence >= 0 && confidence <= 100;
  },
  
  isConfidenceAcceptable(confidence, threshold = DAY10_MIN_CONFIDENCE) {
    if (!this.validateConfidenceScore(confidence)) return false;
    return confidence >= threshold;
  },
  
  getConfidenceTier(confidence) {
    if (!this.validateConfidenceScore(confidence)) return 'INVALID';
    if (confidence >= 86) return 'VERY_HIGH';
    if (confidence >= 71) return 'HIGH';
    if (confidence >= 50) return 'MEDIUM';
    return 'LOW';
  },
  
  calculateConfidenceFromFields(data, requiredFields = []) {
    if (!data || typeof data !== 'object') return 0;
    
    let score = 50; // Base score
    
    // Required fields bonus
    const hasAllRequired = requiredFields.every(field => {
      const value = data[field];
      return value !== null && value !== undefined && value !== '';
    });
    
    if (hasAllRequired) score += 20;
    
    // Field count bonus
    const filledFields = STANDARD_FIELDS.filter(field => {
      const value = data[field];
      if (value === null || value === undefined || value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }).length;
    
    score += Math.min(30, filledFields * 2);
    
    return Math.min(100, Math.max(0, Math.round(score)));
  },
  
  // ============================================================================
  // 🆕 v4.2: BATCH COST CALCULATION
  // ============================================================================
  
  /**
   * Calculate estimated cost for batch operations
   * @param {number} itemCount - Number of items
   * @param {string} operation - 'extraction', 'translation', 'summarization', 'insights'
   * @returns {object} Cost breakdown
   */
  calculateBatchCost(itemCount, operation = 'extraction') {
    const costs = {
      extraction: { inputTokensPerItem: 150, outputTokensPerItem: 50 },
      translation: { inputTokensPerItem: 100, outputTokensPerItem: 100 },
      summarization: { inputTokensPerItem: 200, outputTokensPerItem: 80 },
      insights: { inputTokensPerItem: 300, outputTokensPerItem: 150 }
    };
    
    const config = costs[operation] || costs.extraction;
    
    const totalInputTokens = itemCount * config.inputTokensPerItem;
    const totalOutputTokens = itemCount * config.outputTokensPerItem;
    
    const inputCost = (totalInputTokens / 1000) * COST_PER_1K_INPUT_TOKENS;
    const outputCost = (totalOutputTokens / 1000) * COST_PER_1K_OUTPUT_TOKENS;
    const totalCost = inputCost + outputCost;
    
    return {
      operation,
      itemCount,
      totalInputTokens,
      totalOutputTokens,
      inputCost,
      outputCost,
      totalCost,
      costPerItem: totalCost / itemCount
    };
  },
  
  /**
   * Calculate total cost for multiple operations
   */
  calculateCompositeCost(itemCount, operations = []) {
    let totalCost = 0;
    const breakdown = {};
    
    operations.forEach(op => {
      const cost = this.calculateBatchCost(itemCount, op);
      breakdown[op] = cost.totalCost;
      totalCost += cost.totalCost;
    });
    
    return {
      itemCount,
      operations,
      breakdown,
      totalCost,
      costPerItem: totalCost / itemCount
    };
  },
  
  /**
   * Format cost for display
   */
  formatCost(cost) {
    if (cost < 0.001) return '$0.00';
    if (cost < 0.01) return `$${cost.toFixed(4)}`;
    if (cost < 1) return `$${cost.toFixed(3)}`;
    return `$${cost.toFixed(2)}`;
  },
  
  // ============================================================================
  // 🆕 v4.2: TEMPLATE UTILITIES
  // ============================================================================
  
  /**
   * Match template by domain
   */
  matchTemplateByDomain(domain, templates) {
    if (!domain || !templates) return null;
    
    const normalizedDomain = domain.toLowerCase();
    
    for (const template of templates) {
      if (template.domains && Array.isArray(template.domains)) {
        const matched = template.domains.some(d => 
          normalizedDomain.includes(d.toLowerCase())
        );
        if (matched) return template;
      }
    }
    
    return null;
  },
  
  /**
   * Apply template settings to config
   */
  applyTemplateToConfig(template, currentConfig) {
    if (!template || !template.settings) return currentConfig;
    
    return {
      ...currentConfig,
      mode: template.settings.mode || currentConfig.mode,
      category: template.settings.category || currentConfig.category,
      deduplication: template.settings.deduplication ?? currentConfig.deduplication,
      translation: template.settings.translation ?? currentConfig.translation,
      summarization: template.settings.summarization ?? currentConfig.summarization
    };
  },
  
  // ============================================================================
  // 🆕 v4.2: CHANGE DETECTION UTILITIES
  // ============================================================================
  
  /**
   * Detect changes between two item versions
   */
  detectChanges(previousItem, currentItem) {
    if (!previousItem || !currentItem) return null;
    
    const changes = {};
    const fields = Object.keys(currentItem);
    
    fields.forEach(field => {
      if (field.startsWith('_')) return; // Skip meta fields
      
      const oldValue = previousItem[field];
      const newValue = currentItem[field];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[field] = {
          old: oldValue,
          new: newValue,
          changed: true
        };
      }
    });
    
    return Object.keys(changes).length > 0 ? changes : null;
  },
  
  /**
   * Mark item with change status
   */
  markItemChanges(previousItem, currentItem) {
    const changes = this.detectChanges(previousItem, currentItem);
    
    if (!changes) {
      return {
        ...currentItem,
        _change_status: 'unchanged'
      };
    }
    
    return {
      ...currentItem,
      _change_status: 'modified',
      _previous_values: Object.keys(changes).reduce((acc, field) => {
        acc[field] = changes[field].old;
        return acc;
      }, {})
    };
  },
  
  // ============================================================================
  // 🆕 v4.2: BATCH PROCESSING HELPERS
  // ============================================================================
  
  /**
   * Split array into batches
   */
  createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  },
  
  /**
   * Calculate batch progress
   */
  calculateBatchProgress(currentBatch, totalBatches, itemsInBatch, totalItems) {
    const processedItems = (currentBatch - 1) * itemsInBatch + itemsInBatch;
    const percentage = Math.min(100, Math.round((processedItems / totalItems) * 100));
    
    return {
      currentBatch,
      totalBatches,
      processedItems: Math.min(processedItems, totalItems),
      totalItems,
      percentage,
      remaining: totalItems - processedItems
    };
  },
  
  // ============================================================================
  // DAY 10 PII DETECTION & STRIPPING (PRESERVED)
  // ============================================================================
  
  detectPII(text) {
    if (!text || typeof text !== 'string') return [];
    
    const detected = [];
    Object.entries(PII_PATTERNS).forEach(([type, pattern]) => {
      const matches = text.match(pattern);
      if (matches) {
        detected.push({
          type,
          count: matches.length,
          samples: matches.slice(0, 2)
        });
      }
    });
    
    return detected;
  },
  
  stripPII(text) {
    if (!text || typeof text !== 'string') return text;
    
    let cleaned = text;
    cleaned = cleaned.replace(PII_PATTERNS.EMAIL, '[EMAIL_REDACTED]');
    cleaned = cleaned.replace(PII_PATTERNS.PHONE, '[PHONE_REDACTED]');
    cleaned = cleaned.replace(PII_PATTERNS.SSN, '[SSN_REDACTED]');
    cleaned = cleaned.replace(PII_PATTERNS.CREDIT_CARD, '[CARD_REDACTED]');
    cleaned = cleaned.replace(PII_PATTERNS.ADDRESS, '[ADDRESS_REDACTED]');
    
    return cleaned;
  },
  
  hasPII(text) {
    return this.detectPII(text).length > 0;
  },
  
  stripPIIFromObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const cleaned = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (typeof value === 'string') {
        cleaned[key] = this.stripPII(value);
      } else if (Array.isArray(value)) {
        cleaned[key] = value.map(item =>
          typeof item === 'string' ? this.stripPII(item) : item
        );
      } else {
        cleaned[key] = value;
      }
    });
    
    return cleaned;
  },
  
  // ============================================================================
  // DAY 10 DATE STANDARDIZATION (PRESERVED)
  // ============================================================================
  
  standardizeDate(dateString) {
    if (!dateString || typeof dateString !== 'string') return null;
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.warn(`[Day10-Utils] Date standardization failed: ${dateString}`);
      return null;
    }
  },
  
  validateDateFormat(dateString) {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  },
  
  detectDateFormat(dateString) {
    if (!dateString) return 'UNKNOWN';
    
    for (const pattern of DATE_FORMAT_PATTERNS) {
      if (pattern.regex.test(dateString)) {
        return pattern.name;
      }
    }
    
    return 'UNKNOWN';
  },
  
  standardizeDatesInObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const standardized = { ...obj };
    const dateFields = ['publication_date', 'date', 'publishDate', 'createdAt'];
    
    dateFields.forEach(field => {
      if (standardized[field] && typeof standardized[field] === 'string') {
        const standardDate = this.standardizeDate(standardized[field]);
        if (standardDate) {
          standardized[field] = standardDate;
        }
      }
    });
    
    return standardized;
  },
  
  // ============================================================================
  // DAY 10 ENHANCED VALIDATION HELPERS (PRESERVED)
  // ============================================================================
  
  validatePrice(price) {
    if (!price) return false;
    return PRICE_REGEX.test(price.toString().replace(/,/g, ''));
  },
  
  validateRating(rating) {
    if (!rating) return false;
    return RATING_REGEX.test(rating.toString());
  },
  
  validateEmail(email) {
    if (!email) return false;
    return EMAIL_REGEX.test(email);
  },
  
  validateUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  // ===== ENHANCED UTILITY FUNCTIONS (PRESERVED) =====
  
  normalizePercentage(value) {
    return Math.max(0, Math.min(100, Math.round(value || 0)));
  },
  
  safeParseJSON(text) {
    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : null;
    }
  },
  
  seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  },
  
  isModuleLoaded(moduleName) {
    return typeof window[moduleName] !== 'undefined';
  },
  
  // ===== ENHANCED STRING UTILITIES (PRESERVED) =====
  
  sanitizeString(str) {
    if (!str || typeof str !== 'string') return '';
    return str.normalize('NFKC').trim().replace(/\s+/g, ' ').replace(/[<>]/g, '');
  },
  
  truncateText(text, maxLength = 500) {
    if (!text || typeof text !== 'string') return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  },
  
  extractDomain(url) {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return 'unknown';
    }
  },
  
  // ===== PERFORMANCE OPTIMIZED ACCURACY CALCULATIONS (PRESERVED) =====
  
  calculateAccuracyEnhanced(data, useValidator = true) {
    if (useValidator && typeof ValidatorManager !== 'undefined') {
      return ValidatorManager.calculateAccuracy(data);
    }
    
    if (!data || typeof data !== 'object') return 0;
    
    let filledFields = 0;
    let weightedScore = 0;
    
    STANDARD_FIELDS.forEach(field => {
      const value = data[field];
      let fieldScore = 0;
      
      if (value !== null && value !== '' && value !== undefined) {
        if (Array.isArray(value) && value.length > 0) {
          fieldScore = Math.min(1, value.length / 3);
        } else if (typeof value === 'string' && value.trim().length > 0) {
          fieldScore = Math.min(1.0, value.length / 50);
        } else {
          fieldScore = 1;
        }
        
        weightedScore += fieldScore;
        if (fieldScore > 0) filledFields++;
      }
    });
    
    return this.normalizePercentage((weightedScore / STANDARD_FIELDS.length) * 100);
  },
  
  // ============================================================================
  // DAY 10 ENHANCED TRAJECTORY ANALYSIS (PRESERVED)
  // ============================================================================
  
  calculateTrajectory(currentAccuracy, confidenceScore) {
    const accuracyMeetsTarget = currentAccuracy >= DAY10_ACCURACY_TARGET;
    const confidenceMeetsTarget = confidenceScore >= DAY10_CONFIDENCE_TARGET;
    
    if (accuracyMeetsTarget && confidenceMeetsTarget) {
      return 'EXCELLENT';
    } else if (currentAccuracy >= 70 && confidenceScore >= 65) {
      return 'ON_TRACK';
    } else if (currentAccuracy >= 60 && confidenceScore >= 55) {
      return 'NEEDS_IMPROVEMENT';
    } else {
      return 'CRITICAL';
    }
  },
  
  calculateTrajectoryTo80(currentAccuracy, confidenceScore = 50) {
    return this.calculateTrajectory(currentAccuracy, confidenceScore);
  },
  
  getQualityLabel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'partial';
    if (score >= 20) return 'poor';
    return 'failed';
  },
  
  getProgressIndicator(current, target = DAY10_ACCURACY_TARGET) {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return '🎯 COMPLETE';
    if (percentage >= 80) return '🔥 EXCELLENT';
    if (percentage >= 60) return '✅ GOOD';
    if (percentage >= 40) return '⚡ FAIR';
    if (percentage >= 20) return '⚠️ POOR';
    return '🚨 CRITICAL';
  },
  
  // ===== REMAINING PRESERVED METHODS... =====
  
  determineSiteTypeEnhanced(url, cache) {
    if (!url) return 'generic';
    
    const domain = this.extractDomain(url);
    const cacheKey = `siteType_${domain}`;
    
    if (cache && cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    
    let siteType = 'generic';
    for (const mapping of DOMAIN_TYPE_MAP) {
      if (mapping.pattern.test(domain)) {
        siteType = mapping.type;
        break;
      }
    }
    
    if (cache) {
      cache.set(cacheKey, siteType);
    }
    
    return siteType;
  },
  
  // ============================================================================
  // v4.2 SYSTEM STATUS
  // ============================================================================
  
  getV42Status() {
    return {
      version: this.VERSION,
      v42Enhanced: true,
      features: {
        batchCostCalculation: true,
        templateUtilities: true,
        changeDetection: true,
        batchHelpers: true,
        day10Features: true
      }
    };
  }
};

console.log(`[BackgroundUtils-v${BackgroundUtils.VERSION}] v4.2.0 batch utilities loaded with cost calculation and template helpers`);

// Export for global access
if (typeof window !== 'undefined') {
  window.BackgroundUtils = BackgroundUtils;
}
