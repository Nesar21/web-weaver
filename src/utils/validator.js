// Day 10: Validator Utility - AI Engine v1 Enhanced (80% Accuracy Milestone)
// /src/utils/validator.js - DAY 10 ENHANCED

console.log('[Validator] Day 10 AI ENGINE v1 loading - Auto-Correct + Confidence Validation...');

// ============================================================================
// DAY 10 ENHANCEMENTS - AUTO-CORRECT & CONFIDENCE VALIDATION
// ============================================================================

const DAY10_VERSION = 'day10-ai-engine-v1-validator';

// Day 10: Date Standardization Utility
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

// Day 10: Auto-Correct Field Values (Soft Failure Recovery)
function autoCorrectFieldDay10(fieldName, value, fieldConfig) {
  if (fieldName === 'publication_date' || fieldName === 'publishdate' || fieldName === 'publish_date') {
    const std = standardizeDateDay10(value);
    if (std) return { corrected: true, value: std, reason: 'DATE_STANDARDIZED' };
  }
  
  if (fieldName === 'price' && typeof value === 'string') {
    const cleaned = value.replace(/,/g, '').trim();
    if (/^\$?\d+(\.\d{1,2})?$/.test(cleaned)) {
      return { corrected: true, value: cleaned, reason: 'PRICE_CLEANED' };
    }
  }
  
  if ((fieldName === 'rating' || fieldName === 'reviews_rating') && typeof value === 'string') {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (/^(\d+(\.\d+)?\s*\/\s*5|\d+(\.\d+)?)$/.test(normalized)) {
      return { corrected: true, value: normalized, reason: 'RATING_NORMALIZED' };
    }
  }
  
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed !== value && trimmed.length > 0) {
      return { corrected: true, value: trimmed, reason: 'STRING_TRIMMED' };
    }
  }
  
  if (Array.isArray(value)) {
    const cleaned = value.filter(item => item && typeof item === 'string' && item.trim().length > 0);
    if (cleaned.length !== value.length && cleaned.length > 0) {
      return { corrected: true, value: cleaned, reason: 'ARRAY_CLEANED' };
    }
  }
  
  return { corrected: false, value };
}

// Day 10: Confidence-Based Validation
function validateWithConfidenceDay10(extractedData, validationResult, config) {
  const confidence = extractedData?.confidence_score;
  
  if (!confidence || typeof confidence !== 'number') {
    validationResult.metadata.confidenceWarning = 'NO_CONFIDENCE_SCORE';
    return validationResult;
  }
  
  if (confidence < (config.confidenceThreshold || 50)) {
    validationResult.success = false;
    validationResult.metadata.confidenceDiscard = true;
    validationResult.metadata.confidenceScore = confidence;
    validationResult.penalties.push({
      field: 'confidence_score',
      reason: 'AUTO_DISCARD_LOW_CONFIDENCE',
      severity: 'CRITICAL',
      original: confidence,
      expected: `Minimum ${config.confidenceThreshold || 50}`,
      penaltyWeight: 1.0,
      siteType: validationResult.metadata.siteType,
      timestamp: new Date().toISOString()
    });
  } else {
    validationResult.metadata.confidenceScore = confidence;
    validationResult.metadata.confidenceValidated = true;
  }
  
  return validationResult;
}

// ============================================================================
// DAY 8 CONFIG & HELPERS
// ============================================================================

const DAY8_VERSION = 'day8-modular-enterprise';

const DEFAULT_VALIDATION_CONFIG = {
  version: 'enterprise-penalty-tracking-v8',
  logLevel: 'info',
  confidenceThreshold: 50,
  enableAutoCorrect: true,
  penaltyThresholds: {
    title: { required: true, minLength: 10, penaltyWeight: 0.25, accuracyWeight: 2.0, description: 'Title must be at least 10 characters', severity: 'HIGH' },
    main_content_summary: { required: true, minLength: 50, penaltyWeight: 0.15, accuracyWeight: 2.0, description: 'Content summary must be at least 50 characters', severity: 'HIGH' },
    price: { required: false, regex: /^\$?\d+(\.\d{1,2})?$/, penaltyWeight: 0.2, accuracyWeight: 1.0, description: 'Must match currency format ($XX or $XX.XX)', severity: 'MEDIUM' },
    rating: { required: false, regex: /^(\d+(\.\d+)?\s*\/\s*5|\d+(\.\d+)?)$/, penaltyWeight: 0.1, accuracyWeight: 1.0, description: 'Must match X/5 or X.X rating format (flexible spacing)', severity: 'MEDIUM' },
    reviews_rating: { required: false, aliasOf: 'rating', penaltyWeight: 0.1, accuracyWeight: 1.0, description: 'Must match X/5 or X.X rating format (flexible spacing)', severity: 'MEDIUM' },
    ingredients: { required: false, minItems: 3, penaltyWeight: 0.15, accuracyWeight: 1.0, description: 'Recipe must have minimum 3 ingredients', severity: 'MEDIUM' },
    instructions: { required: false, minItems: 2, penaltyWeight: 0.15, accuracyWeight: 1.0, description: 'Recipe must have minimum 2 instruction steps', severity: 'MEDIUM' },
    author: { required: false, minLength: 2, penaltyWeight: 0.05, accuracyWeight: 1.0, description: 'Author must be at least 2 characters', severity: 'LOW' },
    description: { required: false, minLength: 20, penaltyWeight: 0.08, accuracyWeight: 1.0, description: 'Description must be at least 20 characters', severity: 'LOW' },
    category: { required: false, minLength: 2, penaltyWeight: 0.05, accuracyWeight: 1.0, description: 'Category must be at least 2 characters', severity: 'LOW' }
  },
  businessWeights: { amazon: 0.3, bloomberg: 0.25, allrecipes: 0.2, wikipedia: 0.15, medium: 0.07, generic: 0.03 },
  sanityGuardrails: {
    enabled: true,
    rules: {
      price: { pattern: /^\$?\d+(\.\d{1,2})?$/, description: 'Price must match currency format' },
      ingredients: { minItems: 3, itemMinLength: 2, description: 'Ingredients must have 3+ meaningful items' },
      instructions: { minItems: 2, itemMinLength: 5, description: 'Instructions must have 2+ meaningful steps' },
      title: { minLength: 10, maxLength: 200, description: 'Title must be 10-200 characters' },
      main_content_summary: { minLength: 50, maxLength: 1000, description: 'Summary must be 50-1000 characters' }
    }
  }
};

function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  return result;
}

function enterpriseLogger(level, message, data = null, config = DEFAULT_VALIDATION_CONFIG) {
  const levels = { debug: 0, info: 1, warn: 2, error: 3, silent: 999 };
  const currentLogLevel = levels[config.logLevel] || levels.info;
  if (levels[level] >= currentLogLevel) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [Validator] ${message}`;
    switch (level) {
      case 'error': console.error(logMessage, data || ''); break;
      case 'warn': console.warn(logMessage, data || ''); break;
      case 'debug': console.debug(logMessage, data || ''); break;
      default: console.log(logMessage, data || '');
    }
  }
}

// ============================================================================
// VALIDATOR MANAGER - ALL METHODS INSIDE
// ============================================================================

const ValidatorManager = {
  applyValidationPenalties(extractedData, siteType = 'generic', customConfig = {}) {
    const startTime = Date.now();
    const config = deepMerge(DEFAULT_VALIDATION_CONFIG, customConfig);
    enterpriseLogger('info', `Starting Day 10 validation for ${siteType}`, null, config);
    
    const validationResult = {
      success: false,
      validatedData: { ...extractedData },
      penalties: [],
      penaltyScore: 0,
      normalizedPenaltyScore: 0,
      businessRealismProof: false,
      sanityGuardrails: [],
      weakFields: [],
      autoCorrections: [],
      metadata: {
        totalFields: Object.keys(extractedData).length,
        validFields: 0,
        penalizedFields: 0,
        requiredFieldsPassed: 0,
        requiredFieldsTotal: 0,
        penaltyTypes: {},
        fieldPenaltyTypes: {},
        rawAccuracy: 0,
        validatedAccuracy: 0,
        weightedRawAccuracy: 0,
        weightedValidatedAccuracy: 0,
        sanityRawAccuracy: 0,
        sanityValidatedAccuracy: 0,
        penaltyImpact: 0,
        maxPossiblePenalty: 0,
        sanityFailures: 0,
        validationTime: 0,
        siteType: siteType,
        day8Version: DAY8_VERSION,
        day10Enhanced: true,
        autoCorrected: 0
      }
    };
    
    if (config.enableAutoCorrect) {
      Object.entries(extractedData).forEach(([field, value]) => {
        const fieldConfig = config.penaltyThresholds[field];
        if (fieldConfig) {
          const correction = autoCorrectFieldDay10(field, value, fieldConfig);
          if (correction.corrected) {
            validationResult.validatedData[field] = correction.value;
            validationResult.autoCorrections.push({ field, original: value, corrected: correction.value, reason: correction.reason });
            validationResult.metadata.autoCorrected++;
            enterpriseLogger('debug', `Day 10 auto-corrected ${field}: ${correction.reason}`, null, config);
          }
        }
      });
    }
    
    validationResult.metadata.maxPossiblePenalty = Object.values(config.penaltyThresholds).reduce((sum, fc) => sum + (fc.penaltyWeight || 0), 0);
    validationResult.metadata.rawAccuracy = this.calculateAccuracy(validationResult.validatedData);
    validationResult.metadata.weightedRawAccuracy = this.calculateWeightedAccuracy(validationResult.validatedData, config.penaltyThresholds);
    
    const sanityResult = this.applySanityGuardrails(validationResult.validatedData, config.sanityGuardrails);
    validationResult.sanityGuardrails = sanityResult.failures;
    validationResult.metadata.sanityFailures = sanityResult.failures.length;
    validationResult.metadata.sanityRawAccuracy = sanityResult.accuracy;
    
    sanityResult.failures.forEach(failure => {
      validationResult.validatedData[failure.field] = Array.isArray(validationResult.validatedData[failure.field]) ? [] : null;
    });
    
    validationResult.metadata.requiredFieldsTotal = Object.values(config.penaltyThresholds).filter(fc => fc.required).length;
    
    Object.entries(config.penaltyThresholds).forEach(([field, fieldConfig]) => {
      if (!validationResult.validatedData.hasOwnProperty(field)) return;
      
      try {
        const value = validationResult.validatedData[field];
        const penalty = this.validateField(field, value, fieldConfig, siteType);
        
        if (penalty) {
          validationResult.penalties.push(penalty);
          validationResult.penaltyScore += fieldConfig.penaltyWeight;
          validationResult.metadata.penalizedFields++;
          validationResult.weakFields.push(field);
          validationResult.validatedData[field] = Array.isArray(validationResult.validatedData[field]) ? [] : null;
          validationResult.metadata.penaltyTypes[penalty.reason] = (validationResult.metadata.penaltyTypes[penalty.reason] || 0) + 1;
          validationResult.metadata.fieldPenaltyTypes[`${field}:${penalty.reason}`] = (validationResult.metadata.fieldPenaltyTypes[`${field}:${penalty.reason}`] || 0) + 1;
        } else {
          validationResult.metadata.validFields++;
          if (fieldConfig.required) validationResult.metadata.requiredFieldsPassed++;
        }
      } catch (validationError) {
        enterpriseLogger('error', `Validation rule error for field ${field}:`, validationError.message, config);
        const errorPenalty = { field, reason: 'VALIDATION_RULE_ERROR', original: validationResult.validatedData[field], expected: fieldConfig.description, error: validationError.message, penaltyWeight: fieldConfig.penaltyWeight, severity: 'HIGH', siteType, timestamp: new Date().toISOString() };
        validationResult.penalties.push(errorPenalty);
        validationResult.penaltyScore += fieldConfig.penaltyWeight;
        validationResult.metadata.penalizedFields++;
        validationResult.weakFields.push(field);
      }
    });
    
    validationResult.metadata.validatedAccuracy = this.calculateAccuracy(validationResult.validatedData);
    validationResult.metadata.weightedValidatedAccuracy = this.calculateWeightedAccuracy(validationResult.validatedData, config.penaltyThresholds);
    validationResult.metadata.sanityValidatedAccuracy = this.applySanityGuardrails(validationResult.validatedData, config.sanityGuardrails).accuracy;
    validationResult.normalizedPenaltyScore = validationResult.metadata.maxPossiblePenalty > 0 ? validationResult.penaltyScore / validationResult.metadata.maxPossiblePenalty : 0;
    validationResult.metadata.penaltyImpact = validationResult.metadata.weightedRawAccuracy > 0 ? ((validationResult.metadata.weightedRawAccuracy - validationResult.metadata.weightedValidatedAccuracy) / validationResult.metadata.weightedRawAccuracy) * 100 : 0;
    validationResult.businessRealismProof = validationResult.metadata.penaltyImpact > 0;
    
    const confidenceValidated = validateWithConfidenceDay10(extractedData, validationResult, config);
    Object.assign(validationResult, confidenceValidated);
    
    validationResult.success = validationResult.metadata.requiredFieldsPassed === validationResult.metadata.requiredFieldsTotal && validationResult.metadata.validFields > 0 && !validationResult.metadata.confidenceDiscard;
    validationResult.metadata.validationTime = Date.now() - startTime;
    this.logValidationResult(validationResult, config);
    
    return validationResult;
  },

    applySanityGuardrails(data, guardrailConfig) {
    if (!guardrailConfig.enabled) return { failures: [], accuracy: this.calculateAccuracy(data) };
    
    const failures = [];
    let validFields = 0;
    let totalFields = 0;
    
    Object.entries(guardrailConfig.rules).forEach(([field, rule]) => {
      if (!data.hasOwnProperty(field)) return;
      totalFields++;
      const value = data[field];
      let fieldValid = true;
      
      try {
        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
          failures.push({ type: 'SANITY_PATTERN_FAILURE', field, value, rule: rule.description, pattern: rule.pattern.toString() });
          fieldValid = false;
        }
        
        if (typeof value === 'string') {
          if (rule.minLength && value.length < rule.minLength) {
            failures.push({ type: 'SANITY_MIN_LENGTH_FAILURE', field, value, rule: rule.description, actual: value.length, minimum: rule.minLength });
            fieldValid = false;
          }
          if (rule.maxLength && value.length > rule.maxLength) {
            failures.push({ type: 'SANITY_MAX_LENGTH_FAILURE', field, value, rule: rule.description, actual: value.length, maximum: rule.maxLength });
            fieldValid = false;
          }
        }
        
        if (Array.isArray(value)) {
          if (rule.minItems && value.length < rule.minItems) {
            failures.push({ type: 'SANITY_MIN_ITEMS_FAILURE', field, value, rule: rule.description, actual: value.length, minimum: rule.minItems });
            fieldValid = false;
          }
          if (rule.itemMinLength && typeof rule.itemMinLength === 'number') {
            const invalidItems = value.filter(item => !item || typeof item !== 'string' || item.trim().length < rule.itemMinLength);
            if (invalidItems.length > 0) {
              failures.push({ type: 'SANITY_ITEM_QUALITY_FAILURE', field, value, rule: rule.description, invalidItems: invalidItems.length, minimumItemLength: rule.itemMinLength });
              fieldValid = false;
            }
          }
        }
        
        if (fieldValid) validFields++;
      } catch (guardrailError) {
        enterpriseLogger('warn', `Sanity guardrail error for field ${field}:`, guardrailError.message);
        failures.push({ type: 'SANITY_RULE_ERROR', field, value, rule: rule.description, error: guardrailError.message });
      }
    });
    
    return { failures, accuracy: totalFields > 0 ? Math.round((validFields / totalFields) * 100) : 100 };
  },

  validateField(fieldName, value, config, siteType) {
    if (config.aliasOf) {
      const aliasConfig = DEFAULT_VALIDATION_CONFIG.penaltyThresholds[config.aliasOf];
      if (aliasConfig) return this.validateField(fieldName, value, aliasConfig, siteType);
    }
    
    if (config.required && (!value || (typeof value === 'string' && value.trim().length === 0))) {
      return { field: fieldName, reason: 'REQUIRED_FIELD_MISSING', original: value, expected: config.description, penaltyWeight: config.penaltyWeight, severity: config.severity || 'HIGH', siteType, timestamp: new Date().toISOString() };
    }
    
    if (!value || (typeof value === 'string' && value.trim().length === 0)) return null;
    
    if (config.minLength && typeof value === 'string' && value.trim().length < config.minLength) {
      return { field: fieldName, reason: 'INSUFFICIENT_LENGTH', original: value, expected: config.description, actual: value.trim().length, minimum: config.minLength, penaltyWeight: config.penaltyWeight, severity: config.severity || 'MEDIUM', siteType, timestamp: new Date().toISOString() };
    }
    
    if (config.regex && typeof value === 'string') {
      try {
        if (!config.regex.test(value.trim())) {
          return { field: fieldName, reason: 'INVALID_FORMAT', original: value, expected: config.description, pattern: config.regex.toString(), penaltyWeight: config.penaltyWeight, severity: config.severity || 'MEDIUM', siteType, timestamp: new Date().toISOString() };
        }
      } catch (regexError) {
        enterpriseLogger('error', `Regex validation error for field ${fieldName}:`, regexError.message);
        return { field: fieldName, reason: 'REGEX_VALIDATION_ERROR', original: value, expected: config.description, error: regexError.message, penaltyWeight: config.penaltyWeight, severity: 'HIGH', siteType, timestamp: new Date().toISOString() };
      }
    }
    
    if (config.minItems && Array.isArray(value)) {
      const validItems = value.filter(item => item && typeof item === 'string' && item.trim().length > 0);
      if (validItems.length < config.minItems) {
        return { field: fieldName, reason: 'INSUFFICIENT_ITEMS', original: value, expected: config.description, actual: validItems.length, minimum: config.minItems, penaltyWeight: config.penaltyWeight, severity: config.severity || 'MEDIUM', siteType, timestamp: new Date().toISOString() };
      }
    }
    
    return null;
  },

  calculateAccuracy(data) {
    const totalFields = Object.keys(data).length;
    if (totalFields === 0) return 0;
    let populatedFields = 0;
    Object.entries(data).forEach(([field, value]) => { if (this.isFieldPopulated(value)) populatedFields++; });
    return Math.round((populatedFields / totalFields) * 100);
  },

  calculateWeightedAccuracy(data, penaltyThresholds) {
    let totalWeight = 0;
    let weightedPopulated = 0;
    Object.entries(data).forEach(([field, value]) => {
      const fieldConfig = penaltyThresholds[field];
      if (fieldConfig) {
        const weight = fieldConfig.accuracyWeight || 1.0;
        totalWeight += weight;
        if (this.isFieldPopulated(value)) weightedPopulated += weight;
      }
    });
    return totalWeight > 0 ? Math.round((weightedPopulated / totalWeight) * 100) : 0;
  },

  isFieldPopulated(value) {
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value)) return value.length > 0 && value.some(item => item && item.trim && item.trim() !== '');
    if (typeof value === 'string') return value.trim().length > 0 && !['n/a', 'null', 'undefined', 'unknown', 'not found'].includes(value.toLowerCase());
    return true;
  },

  logValidationResult(validationResult, config) {
    const meta = validationResult.metadata;
    enterpriseLogger('info',
      `Day 10 validation: ${meta.siteType} | Success: ${validationResult.success} | ` +
      `Auto-corrected: ${meta.autoCorrected || 0} | Raw: ${meta.rawAccuracy.toFixed(1)}% | ` +
      `Validated: ${meta.validatedAccuracy.toFixed(1)}% | Confidence: ${meta.confidenceScore || 'N/A'} | ` +
      `Penalties: ${validationResult.penalties.length} | Impact: ${meta.penaltyImpact.toFixed(1)}%`,
      null, config
    );
  },

  calculateBusinessWeightedAccuracy(siteResults, customWeights = {}) {
    const weights = { ...DEFAULT_VALIDATION_CONFIG.businessWeights, ...customWeights };
    let weightedRawScore = 0, weightedValidatedScore = 0, totalWeight = 0, totalPenalties = 0;
    
    siteResults.forEach(site => {
      const weight = weights[site.siteType] || weights.generic || 0.03;
      if (weight > 0 && site.rawAccuracy !== undefined && site.validatedAccuracy !== undefined) {
        const rawAcc = site.weightedRawAccuracy !== undefined ? site.weightedRawAccuracy : site.rawAccuracy;
        const validatedAcc = site.weightedValidatedAccuracy !== undefined ? site.weightedValidatedAccuracy : site.validatedAccuracy;
        weightedRawScore += rawAcc * weight;
        weightedValidatedScore += validatedAcc * weight;
        totalWeight += weight;
        totalPenalties += site.penaltyCount || 0;
      }
    });
    
    const rawBusinessAccuracy = totalWeight > 0 ? (weightedRawScore / totalWeight) : 0;
    const validatedBusinessAccuracy = totalWeight > 0 ? (weightedValidatedScore / totalWeight) : 0;
    const overallPenaltyImpact = rawBusinessAccuracy > 0 ? ((rawBusinessAccuracy - validatedBusinessAccuracy) / rawBusinessAccuracy) * 100 : 0;
    
    return { rawBusinessAccuracy, validatedBusinessAccuracy, overallPenaltyImpact, totalWeight, totalPenalties, coreAccuracy: this.calculateCoreAccuracy(siteResults), wildcardAccuracy: this.calculateWildcardAccuracy(siteResults), businessRealismProof: overallPenaltyImpact > 0 ? 'TEMPERING_RESULTS' : 'NO_INFLATION', day10Enhanced: true };
  },

  calculateCoreAccuracy(siteResults) {
    const coreSites = siteResults.filter(s => ['amazon', 'allrecipes', 'bloomberg', 'wikipedia'].includes(s.siteType));
    if (coreSites.length === 0) return 0;
    return coreSites.reduce((sum, site) => sum + (site.weightedValidatedAccuracy !== undefined ? site.weightedValidatedAccuracy : site.validatedAccuracy || 0), 0) / coreSites.length;
  },

  calculateWildcardAccuracy(siteResults) {
    const wildcardSites = siteResults.filter(s => ['medium', 'generic'].includes(s.siteType));
    if (wildcardSites.length === 0) return 0;
    return wildcardSites.reduce((sum, site) => sum + (site.weightedValidatedAccuracy !== undefined ? site.weightedValidatedAccuracy : site.validatedAccuracy || 0), 0) / wildcardSites.length;
  },

  analyzePenaltyImpact(rawAccuracy, validatedAccuracy) {
    const penaltyImpact = rawAccuracy > 0 ? ((rawAccuracy - validatedAccuracy) / rawAccuracy) * 100 : 0;
    let interpretation = 'NO_PENALTY', businessValue = 'UNKNOWN', recommendation = 'MAINTAIN_CURRENT';
    
    if (penaltyImpact > 20) { interpretation = 'EXCESSIVE_TEMPERING'; businessValue = 'TOO_STRICT_STANDARDS'; recommendation = 'RELAX_VALIDATION_SLIGHTLY'; }
    else if (penaltyImpact > 15) { interpretation = 'HIGH_TEMPERING'; businessValue = 'EXCELLENT_STANDARDS'; recommendation = 'MAINTAIN_CURRENT_VALIDATION'; }
    else if (penaltyImpact > 8) { interpretation = 'OPTIMAL_TEMPERING'; businessValue = 'GOOD_STANDARDS'; recommendation = 'CONTINUE_CURRENT_APPROACH'; }
    else if (penaltyImpact > 3) { interpretation = 'LIGHT_TEMPERING'; businessValue = 'BASIC_STANDARDS'; recommendation = 'CONSIDER_STRICTER_VALIDATION'; }
    else if (penaltyImpact > 0) { interpretation = 'MINIMAL_TEMPERING'; businessValue = 'WEAK_STANDARDS'; recommendation = 'STRENGTHEN_VALIDATION'; }
    else { interpretation = 'NO_PENALTY'; businessValue = 'POSSIBLE_INFLATION'; recommendation = 'REVIEW_VALIDATION_LOGIC'; }
    
    return { penaltyImpactPercent: penaltyImpact.toFixed(1), interpretation, businessValue, recommendation, businessRealismProof: penaltyImpact > 0 ? 'TEMPERING_RESULTS' : 'NO_INFLATION', qualityAssurance: penaltyImpact >= 8 && penaltyImpact <= 15 ? 'OPTIMAL_RANGE' : 'SUBOPTIMAL_RANGE' };
  },

  analyzeTrajectory(previousAccuracy, currentAccuracy, targetAccuracy = 80, daysRemaining = 2) {
    const progressMade = currentAccuracy - previousAccuracy;
    const progressNeeded = Math.max(0, targetAccuracy - currentAccuracy);
    let trajectory = 'UNKNOWN', recommendation = 'CONTINUE_CURRENT_APPROACH', urgency = 'NORMAL';
    
    if (currentAccuracy >= targetAccuracy) { trajectory = 'TARGET_ACHIEVED'; recommendation = 'MAINTAIN_QUALITY_STANDARDS'; urgency = 'LOW'; }
    else if (daysRemaining <= 0) { trajectory = 'TARGET_MISSED'; recommendation = 'EXTEND_TIMELINE_OR_LOWER_TARGET'; urgency = 'HIGH'; }
    else {
      const requiredDailyProgress = progressNeeded / daysRemaining;
      if (progressMade >= requiredDailyProgress * 1.5) { trajectory = 'AHEAD_OF_SCHEDULE'; recommendation = 'ON_TRACK_CONTINUE'; urgency = 'LOW'; }
      else if (progressMade >= requiredDailyProgress) { trajectory = 'ON_TRACK'; recommendation = 'MAINTAIN_CURRENT_PACE'; urgency = 'NORMAL'; }
      else if (progressMade >= requiredDailyProgress * 0.7) { trajectory = 'NEEDS_SLIGHT_ACCELERATION'; recommendation = 'INCREASE_AI_OPTIMIZATION'; urgency = 'MEDIUM'; }
      else { trajectory = 'NEEDS_SIGNIFICANT_ACCELERATION'; recommendation = 'MAJOR_IMPROVEMENTS_REQUIRED'; urgency = 'HIGH'; }
    }
    
    return { trajectory, recommendation, urgency, progressMade: progressMade.toFixed(1), progressNeeded: progressNeeded.toFixed(1), requiredDailyProgress: Math.max(0, progressNeeded / daysRemaining).toFixed(1), currentProgressRate: progressMade.toFixed(1), projectedFinalAccuracy: Math.min(100, currentAccuracy + (progressMade * daysRemaining)).toFixed(1), onTrack: progressMade >= (progressNeeded / daysRemaining) * 0.8 };
  },

  compilePenaltyBreakdown(validationResults) {
    const breakdown = {}, fieldBreakdown = {};
    
    validationResults.forEach(result => {
      if (result.penalties) {
        result.penalties.forEach(penalty => {
          if (!breakdown[penalty.reason]) breakdown[penalty.reason] = { count: 0, fields: [], totalWeight: 0, severities: [], siteTypes: [] };
          breakdown[penalty.reason].count++;
          breakdown[penalty.reason].totalWeight += penalty.penaltyWeight || 0;
          if (!breakdown[penalty.reason].fields.includes(penalty.field)) breakdown[penalty.reason].fields.push(penalty.field);
          if (penalty.severity && !breakdown[penalty.reason].severities.includes(penalty.severity)) breakdown[penalty.reason].severities.push(penalty.severity);
          if (penalty.siteType && !breakdown[penalty.reason].siteTypes.includes(penalty.siteType)) breakdown[penalty.reason].siteTypes.push(penalty.siteType);
          
          if (!fieldBreakdown[penalty.field]) fieldBreakdown[penalty.field] = { totalPenalties: 0, reasons: {}, siteTypes: [], totalWeight: 0 };
          fieldBreakdown[penalty.field].totalPenalties++;
          fieldBreakdown[penalty.field].totalWeight += penalty.penaltyWeight || 0;
          fieldBreakdown[penalty.field].reasons[penalty.reason] = (fieldBreakdown[penalty.field].reasons[penalty.reason] || 0) + 1;
          if (!fieldBreakdown[penalty.field].siteTypes.includes(penalty.siteType)) fieldBreakdown[penalty.field].siteTypes.push(penalty.siteType);
        });
      }
    });
    
    return { breakdown, fieldBreakdown };
  },

  generateValidationReport(validationResults, previousAccuracy = 0, logLevel = 'summary') {
    const businessMetrics = this.calculateBusinessWeightedAccuracy(validationResults);
    const penaltyAnalysis = this.analyzePenaltyImpact(businessMetrics.rawBusinessAccuracy, businessMetrics.validatedBusinessAccuracy);
    const trajectoryAnalysis = this.analyzeTrajectory(previousAccuracy, businessMetrics.validatedBusinessAccuracy);
    const penaltyBreakdowns = this.compilePenaltyBreakdown(validationResults);
    
    const allWeakFields = validationResults.reduce((acc, result) => { if (result.weakFields) result.weakFields.forEach(field => { if (!acc.includes(field)) acc.push(field); }); return acc; }, []);
    
    const report = {
      day10Version: DAY10_VERSION,
      timestamp: new Date().toISOString(),
      executiveSummary: { previousAccuracy: previousAccuracy.toFixed(1) + '%', currentRawAccuracy: businessMetrics.rawBusinessAccuracy.toFixed(1) + '%', currentValidatedAccuracy: businessMetrics.validatedBusinessAccuracy.toFixed(1) + '%', penaltyImpact: penaltyAnalysis.penaltyImpactPercent + '%', progressMade: (businessMetrics.validatedBusinessAccuracy - previousAccuracy).toFixed(1) + '%', trajectory: trajectoryAnalysis.trajectory, businessRealismProof: penaltyAnalysis.businessRealismProof, weakFields: allWeakFields },
      validationSummary: { totalSites: validationResults.length, validSites: validationResults.filter(r => r.success).length, totalPenalties: businessMetrics.totalPenalties, avgPenaltyImpact: penaltyAnalysis.penaltyImpactPercent + '%', qualityAssurance: penaltyAnalysis.qualityAssurance, sanityFailures: validationResults.reduce((sum, r) => sum + (r.metadata?.sanityFailures || 0), 0), autoCorrected: validationResults.reduce((sum, r) => sum + (r.metadata?.autoCorrected || 0), 0) },
      businessMetrics, penaltyAnalysis, trajectoryAnalysis,
      penaltyBreakdown: penaltyBreakdowns.breakdown,
      fieldBreakdown: penaltyBreakdowns.fieldBreakdown,
      sitePerformance: validationResults.map(result => ({ site: result.siteName || result.siteType || 'Unknown', siteType: result.siteType || 'generic', rawAccuracy: result.rawAccuracy || 0, validatedAccuracy: result.validatedAccuracy || 0, weightedRawAccuracy: result.weightedRawAccuracy || result.rawAccuracy || 0, weightedValidatedAccuracy: result.weightedValidatedAccuracy || result.validatedAccuracy || 0, confidenceScore: result.metadata?.confidenceScore || 'N/A', autoCorrected: result.metadata?.autoCorrected || 0, sanityFailures: result.metadata?.sanityFailures || 0, weakFields: result.weakFields || [], penalties: result.penalties || [] })),
      recommendations: this.generateRecommendations(penaltyAnalysis, trajectoryAnalysis),
      validationResults: logLevel === 'detailed' ? validationResults : undefined
    };
    
    if (logLevel !== 'silent') {
      enterpriseLogger('info', `Day 10 validation report: ${report.executiveSummary.currentValidatedAccuracy} accuracy, ${report.validationSummary.totalPenalties} penalties, ${report.validationSummary.autoCorrected} auto-corrected, ${report.executiveSummary.trajectory}`);
    }
    
    return report;
  },

  generateRecommendations(penaltyAnalysis, trajectoryAnalysis) {
    const recommendations = [];
    
    if (penaltyAnalysis.qualityAssurance === 'OPTIMAL_RANGE') recommendations.push({ type: 'VALIDATION', priority: 'LOW', message: 'Penalty impact is in optimal range (8-15%). Maintain current validation standards.' });
    else if (parseFloat(penaltyAnalysis.penaltyImpactPercent) < 5) recommendations.push({ type: 'VALIDATION', priority: 'MEDIUM', message: 'Low penalty impact suggests validation may be too lenient. Consider stricter standards.' });
    else if (parseFloat(penaltyAnalysis.penaltyImpactPercent) > 20) recommendations.push({ type: 'VALIDATION', priority: 'HIGH', message: 'High penalty impact suggests validation may be too strict. Review penalty thresholds.' });
    
    recommendations.push({ type: 'TRAJECTORY', priority: trajectoryAnalysis.urgency, message: `${trajectoryAnalysis.recommendation} - Currently ${trajectoryAnalysis.trajectory.replace(/_/g, ' ').toLowerCase()}.` });
    
    if (trajectoryAnalysis.onTrack) recommendations.push({ type: 'BUSINESS', priority: 'LOW', message: 'On track to reach target accuracy. Continue current approach.' });
    else recommendations.push({ type: 'BUSINESS', priority: 'HIGH', message: 'Behind trajectory for target accuracy. Consider AI optimization and validation review.' });
    
    return recommendations;
  }
};

console.log('[Validator] Day 10 AI ENGINE v1 ready - Auto-correct + Confidence validation enabled');

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValidatorManager;
} else if (typeof window !== 'undefined') {
  window.ValidatorManager = ValidatorManager;
}
