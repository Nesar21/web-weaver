// Day 10: Background Utilities Module - AI Engine v1 Enhanced (80% Accuracy Milestone)
// /src/modules/utils.js

// ============================================================================
// DAY 10 CONSTANTS - 80% ACCURACY MILESTONE
// ============================================================================

const DAY10_ACCURACY_TARGET = 80;
const DAY10_CONFIDENCE_TARGET = 75;
const DAY10_MIN_CONFIDENCE = 50;

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
  'ingredients', 'instructions', 'reviews_rating'
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
  VERSION: 'day10-utils-v3.0', // Day 10 version
  
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
  // DAY 10 PII DETECTION & STRIPPING
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
          samples: matches.slice(0, 2) // First 2 samples only
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
  // DAY 10 DATE STANDARDIZATION (ISO 8601)
  // ============================================================================
  
  standardizeDate(dateString) {
    if (!dateString || typeof dateString !== 'string') return null;
    
    // Already ISO 8601?
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    
    // Try parsing
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      // Return YYYY-MM-DD format
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
  // DAY 10 ENHANCED VALIDATION HELPERS
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

  // ===== ENHANCED UTILITY FUNCTIONS =====
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

  // ===== ENHANCED STRING UTILITIES WITH UNICODE NORMALIZATION =====
  sanitizeString(str) {
    if (!str || typeof str !== 'string') return '';
    // Unicode normalization to avoid hidden whitespace issues
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

  // ===== PERFORMANCE OPTIMIZED ACCURACY CALCULATIONS =====
  calculateAccuracyEnhanced(data, useValidator = true) {
    // Try ValidatorManager first if available
    if (useValidator && typeof ValidatorManager !== 'undefined') {
      return ValidatorManager.calculateAccuracy(data);
    }
    
    // Enhanced fallback calculation with cached STANDARD_FIELDS
    if (!data || typeof data !== 'object') return 0;
    
    let filledFields = 0;
    let weightedScore = 0;
    
    STANDARD_FIELDS.forEach(field => {
      const value = data[field];
      let fieldScore = 0;
      
      if (value !== null && value !== '' && value !== undefined) {
        if (Array.isArray(value) && value.length > 0) {
          fieldScore = Math.min(1, value.length / 3); // Arrays get partial credit
        } else if (typeof value === 'string' && value.trim().length > 0) {
          // PERFORMANCE: Cap string length scoring at 1.0 to avoid over-weighting
          fieldScore = Math.min(1.0, value.length / 50);
        } else {
          fieldScore = 1; // Other non-empty values get full credit
        }
      }
      
      weightedScore += fieldScore;
      if (fieldScore > 0) filledFields++;
    });
    
    return this.normalizePercentage((weightedScore / STANDARD_FIELDS.length) * 100);
  },

  // ============================================================================
  // DAY 10 ENHANCED TRAJECTORY ANALYSIS
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
    // Day 10 version: considers both accuracy and confidence
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

  // ===== PERFORMANCE OPTIMIZED SITE TYPE DETECTION =====
  determineSiteTypeEnhanced(url, cache) {
    if (!url) return 'generic';
    
    const domain = this.extractDomain(url);
    
    // Check cache first
    const cacheKey = `siteType_${domain}`;
    if (cache && cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    
    // PERFORMANCE: Use optimized pattern matching instead of if-else chain
    let siteType = 'generic';
    for (const mapping of DOMAIN_TYPE_MAP) {
      if (mapping.pattern.test(domain)) {
        siteType = mapping.type;
        break;
      }
    }
    
    // Cache the result
    if (cache) {
      cache.set(cacheKey, siteType);
    }
    
    return siteType;
  },

  // ===== ENHANCED BUSINESS METRICS WITH CACHED FIELDS =====
  calculateBusinessMetrics(results, useValidator = true) {
    // Try ValidatorManager first if available
    if (useValidator && typeof ValidatorManager !== 'undefined') {
      return ValidatorManager.calculateBusinessWeightedAccuracy(results);
    }
    
    // Enhanced fallback calculation
    let totalWeightedRaw = 0, totalWeightedValidated = 0, totalWeight = 0, totalPenalties = 0;
    let successfulResults = 0;
    
    results.forEach(result => {
      if (result.success !== false && result.weight) {
        const rawAccuracy = this.normalizePercentage(result.rawAccuracy || 0);
        const validatedAccuracy = this.normalizePercentage(result.validatedAccuracy || 0);
        
        totalWeightedRaw += rawAccuracy * result.weight;
        totalWeightedValidated += validatedAccuracy * result.weight;
        totalWeight += result.weight;
        totalPenalties += (result.penalties || []).length;
        successfulResults++;
      }
    });

    const rawBusinessAccuracy = totalWeight > 0 ? (totalWeightedRaw / totalWeight) : 0;
    const validatedBusinessAccuracy = totalWeight > 0 ? (totalWeightedValidated / totalWeight) : 0;
    const overallPenaltyImpact = rawBusinessAccuracy > 0 ? 
      ((rawBusinessAccuracy - validatedBusinessAccuracy) / rawBusinessAccuracy) * 100 : 0;

    return {
      rawBusinessAccuracy: this.normalizePercentage(rawBusinessAccuracy),
      validatedBusinessAccuracy: this.normalizePercentage(validatedBusinessAccuracy),
      overallPenaltyImpact: this.normalizePercentage(overallPenaltyImpact),
      totalPenalties: totalPenalties,
      successfulResults: successfulResults,
      totalResults: results.length,
      successRate: results.length > 0 ? (successfulResults / results.length) * 100 : 0,
      averagePenaltiesPerSite: successfulResults > 0 ? (totalPenalties / successfulResults) : 0,
      businessRealismProof: overallPenaltyImpact > 0 ? 'TEMPERING_RESULTS' : 'NO_INFLATION'
    };
  },

  // ===== CACHED API KEY VALIDATION =====
  async validateApiKeyCached(apiKey) {
    const cached = API_KEY_CACHE.get(apiKey);
    const now = Date.now();
    
    // Return cached result if valid and within 5 minutes
    if (cached && now - cached.timestamp < 5 * 60 * 1000) {
      console.log(`[${new Date().toISOString()}] [Day10Utils-v${this.VERSION}] Using cached API validation`);
      return cached.result;
    }
    
    const result = await this.validateApiKeyAsync(apiKey);
    API_KEY_CACHE.set(apiKey, { result, timestamp: now });
    return result;
  },

  // ===== ENHANCED API KEY MANAGEMENT WITH CACHING =====
  async validateApiKeyAsync(apiKey) {
    try {
      const testPayload = {
        contents: [{ parts: [{ text: 'test validation' }] }],
        generationConfig: { maxOutputTokens: 10 }
      };

      const requestStart = Date.now();
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testPayload)
        }
      );

      const timestamp = new Date().toISOString();
      const responseTime = Date.now() - requestStart;
      const result = {
        timestamp,
        keyLength: apiKey.length,
        keyPreview: apiKey.slice(0, 4) + '****' + apiKey.slice(-4),
        responseTime
      };

      if (response.ok) {
        const data = await response.json();
        console.log(`[${timestamp}] [Day10Utils-v${this.VERSION}] API key validated successfully in ${responseTime}ms`);
        return { 
          ...result, 
          valid: true, 
          model: 'gemini-1.5-flash',
          day10Enhanced: true
        };
      } else {
        console.warn(`[${timestamp}] [Day10Utils-v${this.VERSION}] API key validation failed`, { 
          status: response.status,
          statusText: response.statusText
        });
        return { 
          ...result, 
          valid: false, 
          status: response.status,
          statusText: response.statusText
        };
      }
    } catch (error) {
      const timestamp = new Date().toISOString();
      console.warn(`[${timestamp}] [Day10Utils-v${this.VERSION}] API key validation error`, { error: error.message });
      return { 
        valid: false, 
        error: error.message, 
        timestamp,
        keyLength: apiKey.length,
        keyPreview: apiKey.slice(0, 4) + '****' + apiKey.slice(-4)
      };
    }
  },

  handleApiKeySet(request, sendResponse, AI_CONFIG, DAY10_VERSION) {
    (async () => {
      try {
        if (!request.apiKey || request.apiKey.trim().length === 0) {
          sendResponse({ success: false, error: 'Please provide a valid API key' });
          return;
        }

        const apiKey = request.apiKey.trim();
        
        // Enhanced API key validation with multiple patterns
        const validationResult = this.validateApiKeyFormat(apiKey);
        if (!validationResult.valid) {
          sendResponse({ 
            success: false, 
            error: validationResult.error || 'Invalid API key format. Please provide a valid API key.',
            details: validationResult
          });
          return;
        }

        AI_CONFIG.apiKey = apiKey;
        
        // Use robust storage operation if available
        try {
          if (typeof robustStorageOperation !== 'undefined') {
            await robustStorageOperation('set', { geminiApiKey: apiKey });
          } else {
            // Fallback storage
            await new Promise((resolve, reject) => {
              chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
                chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve();
              });
            });
          }
        } catch (storageError) {
          throw new Error(`Storage failed: ${storageError.message}`);
        }
        
        const timestamp = new Date().toISOString();
        const maskedKey = apiKey.slice(0, 4) + '****' + apiKey.slice(-4);
        console.log(`[${timestamp}] [Day10Utils-v${this.VERSION}] API key configured successfully with enhanced validation`);
        
        // Use cached validation to avoid repeated API calls
        const validation = await this.validateApiKeyCached(apiKey);
        if (AI_CONFIG.cache) {
          AI_CONFIG.cache.apiValidation = validation;
        }
        
        sendResponse({
          success: true,
          message: 'Day 10 AI Engine v1 API key configured with confidence validation',
          day10Version: DAY10_VERSION,
          validation: validation,
          keyPreview: maskedKey,
          enterpriseReady: true,
          day10Enhanced: true,
          features: {
            confidenceScoring: true,
            piiStripping: true,
            dateStandardization: true,
            accuracyTarget: DAY10_ACCURACY_TARGET
          }
        });
        
      } catch (error) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [Day10Utils-v${this.VERSION}] API key configuration failed`, { error: error.message });
        sendResponse({ 
          success: false, 
          error: error.message,
          timestamp,
          day10Enhanced: true
        });
      }
    })();
  },

  // PERFORMANCE: Enhanced API key format validation with cached patterns
  validateApiKeyFormat(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      return { valid: false, error: 'API key must be a non-empty string' };
    }

    const trimmed = apiKey.trim();
    if (trimmed.length < 20) {
      return { valid: false, error: 'API key too short (minimum 20 characters)' };
    }

    // Use pre-cached patterns for performance
    for (const pattern of API_KEY_PATTERNS) {
      if (pattern.regex.test(trimmed)) {
        return { 
          valid: true, 
          format: pattern.type,
          length: trimmed.length
        };
      }
    }
    
    return { 
      valid: false, 
      error: 'API key format not recognized. Supported formats: Google API, Generic Long, OpenAI Style',
      length: trimmed.length
    };
  },

  // ===== ENHANCED DATA GENERATION HELPERS WITH VERSIONING =====
  generateCSVHeader() {
    return 'Site,Field,PromptVersion,BasicAccuracy,AIAccuracy,ValidatedAccuracy,PenaltyApplied,NullReturned,Timestamp,FieldScore,Quality,ErrorType,Day10Target,UsingRealAI,SimulationMode,PenaltyReason,Weight,ModulesUsed,ConfidenceScore,PIIDetected,DateStandardized,OptimizedVersion,Duration\n';
  },

  generateRealCSVHeader() {
    return 'Site,URL,Field,RawValue,ValidatedValue,PenaltyApplied,PenaltyReason,RawAccuracy,ValidatedAccuracy,PenaltyImpact,Timestamp,UsingRealAI,RealTesting,ModulesUsed,ConfidenceScore,PIIStripped,DateFormat,OptimizedVersion,ExtractionTime\n';
  },

  createModulesUsedString(utilityStatus) {
    return Object.entries(utilityStatus || {})
      .filter(([key, status]) => status.loaded)
      .map(([key, status]) => `${key}:${status.version}`)
      .join('|') || 'fallback';
  },

  // ===== PERFORMANCE MONITORING =====
  createPerformanceMonitor(name) {
    const startTime = Date.now();
    return {
      name,
      startTime,
      end: () => ({
        name,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      })
    };
  },

  // ===== ENHANCED DATA VALIDATION WITH FIELD SCORE MAPPING =====
  validateExtractedData(data) {
    const issues = [];
    const fieldScoreMapping = {};

    if (!data || typeof data !== 'object') {
      issues.push({ field: 'root', issue: 'Data is not an object' });
      return { valid: false, issues, fieldScoreMapping };
    }

    // Use cached VALIDATION_FIELDS for performance
    VALIDATION_FIELDS.forEach(field => {
      const value = data[field];
      let fieldScore = 100;
      
      if (value === null || value === undefined || value === '') {
        issues.push({ field, issue: 'Missing or empty' });
        fieldScore = 0;
      } else if (typeof value === 'string' && value.trim().length === 0) {
        issues.push({ field, issue: 'Empty string' });
        fieldScore = 10;
      } else if (typeof value === 'string' && value.trim().length < 10) {
        fieldScore = 50; // Partial score for short strings
      }
      
      fieldScoreMapping[field] = fieldScore;
    });

    // Validate arrays
    if (data.links && Array.isArray(data.links)) {
      let linkScore = 100;
      data.links.forEach((link, index) => {
        if (!this.validateUrl(link)) {
          issues.push({ field: `links[${index}]`, issue: 'Invalid URL format' });
          linkScore -= 20;
        }
      });
      fieldScoreMapping['links'] = Math.max(0, linkScore);
    }

    // Validate specific formats
    if (data.price) {
      if (!this.validatePrice(data.price)) {
        issues.push({ field: 'price', issue: 'Invalid price format' });
        fieldScoreMapping['price'] = 0;
      } else {
        fieldScoreMapping['price'] = 100;
      }
    }

    if (data.reviews_rating) {
      if (!this.validateRating(data.reviews_rating)) {
        issues.push({ field: 'reviews_rating', issue: 'Invalid rating format' });
        fieldScoreMapping['reviews_rating'] = 0;
      } else {
        fieldScoreMapping['reviews_rating'] = 100;
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      fieldScoreMapping, // For analytics dashboards
      score: Math.max(0, 100 - (issues.length * 10)),
      averageFieldScore: Object.values(fieldScoreMapping).reduce((a, b) => a + b, 0) / Object.keys(fieldScoreMapping).length
    };
  },

  // ===== CACHE MANAGEMENT =====
  clearApiKeyCache() {
    API_KEY_CACHE.clear();
    console.log(`[${new Date().toISOString()}] [Day10Utils-v${this.VERSION}] API key cache cleared`);
  },

  getApiKeyCacheStats() {
    return {
      size: API_KEY_CACHE.size,
      keys: Array.from(API_KEY_CACHE.keys()).map(key => 
        key.slice(0, 4) + '****' + key.slice(-4)
      )
    };
  },
  
  // ============================================================================
  // DAY 10 SYSTEM STATUS
  // ============================================================================
  
  getDay10Status() {
    return {
      version: this.VERSION,
      day10Enhanced: true,
      accuracyTarget: DAY10_ACCURACY_TARGET,
      confidenceTarget: DAY10_CONFIDENCE_TARGET,
      minConfidence: DAY10_MIN_CONFIDENCE,
      features: {
        confidenceScoring: true,
        piiDetection: true,
        piiStripping: true,
        dateStandardization: true,
        trajectoryAnalysis: true,
        apiKeyValidation: true,
        performanceMonitoring: true
      },
      cacheStats: this.getApiKeyCacheStats()
    };
  }
};

console.log(`[Day10Utils-v${BackgroundUtils.VERSION}] AI Engine v1 utilities loaded with confidence scoring, PII stripping, and date standardization`);

// Export for global access
if (typeof window !== 'undefined') {
  window.BackgroundUtils = BackgroundUtils;
}
