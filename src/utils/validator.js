// Day 8: Validator Utility - Bulletproof Championship-Grade Enterprise Validation Engine
// /src/utils/validator.js

console.log('[Validator] Day 8 BULLETPROOF CHAMPIONSHIP-GRADE validation engine loading...');

// Day 8 Version Standard
const DAY8_VERSION = 'day8-modular-enterprise';

// Enhanced validation configuration with realistic business weights (moved before logger)
const DEFAULT_VALIDATION_CONFIG = {
  version: 'enterprise-penalty-tracking-v8',
  logLevel: 'info', // 'debug' | 'info' | 'warn' | 'error' | 'silent'
  
  penaltyThresholds: {
    // Critical business fields (required = higher weight in accuracy)
    title: {
      required: true,
      minLength: 10,
      penaltyWeight: 0.25,
      accuracyWeight: 2.0, // 2x weight for required fields
      description: 'Title must be at least 10 characters',
      severity: 'HIGH'
    },
    main_content_summary: {
      required: true,
      minLength: 50,
      penaltyWeight: 0.15,
      accuracyWeight: 2.0,
      description: 'Content summary must be at least 50 characters',
      severity: 'HIGH'
    },
    
    // Format validation fields (unified rating field, flexible regex)
    price: {
      required: false,
      regex: /^\$?\d+(\.\d{1,2})?$/,  // Flexible: allows $10 or $10.99
      penaltyWeight: 0.2,
      accuracyWeight: 1.0,
      description: 'Must match currency format ($XX or $XX.XX)',
      severity: 'MEDIUM'
    },
    rating: {
      required: false,
      regex: /^(\d+(\.\d+)?\s*\/\s*5|\d+(\.\d+)?)$/,  // Flexible: allows "5/5" or "5 / 5"
      penaltyWeight: 0.1,
      accuracyWeight: 1.0,
      description: 'Must match X/5 or X.X rating format (flexible spacing)',
      severity: 'MEDIUM'
    },
    // Alias for backward compatibility
    reviews_rating: {
      required: false,
      aliasOf: 'rating',  // Points to unified rating validation
      penaltyWeight: 0.1,
      accuracyWeight: 1.0,
      description: 'Must match X/5 or X.X rating format (flexible spacing)',
      severity: 'MEDIUM'
    },
    
    // Array validation fields
    ingredients: {
      required: false,
      minItems: 3,
      penaltyWeight: 0.15,
      accuracyWeight: 1.0,
      description: 'Recipe must have minimum 3 ingredients',
      severity: 'MEDIUM'
    },
    instructions: {
      required: false,
      minItems: 2,
      penaltyWeight: 0.15,
      accuracyWeight: 1.0,
      description: 'Recipe must have minimum 2 instruction steps',
      severity: 'MEDIUM'
    },
    
    // Optional content fields (standard weight)
    author: {
      required: false,
      minLength: 2,
      penaltyWeight: 0.05,
      accuracyWeight: 1.0,
      description: 'Author must be at least 2 characters',
      severity: 'LOW'
    },
    description: {
      required: false,
      minLength: 20,
      penaltyWeight: 0.08,
      accuracyWeight: 1.0,
      description: 'Description must be at least 20 characters',
      severity: 'LOW'
    },
    category: {
      required: false,
      minLength: 2,
      penaltyWeight: 0.05,
      accuracyWeight: 1.0,
      description: 'Category must be at least 2 characters',
      severity: 'LOW'
    }
  },
  
  // Realistic business weights with proper generic fallback
  businessWeights: {
    amazon: 0.3,      // Highest - Core ecommerce business impact
    bloomberg: 0.25,  // High - Financial news critical for business
    allrecipes: 0.2,  // Medium-High - Popular recipe platform
    wikipedia: 0.15,  // Medium - Educational reference
    medium: 0.07,     // Low - Wildcard content platform
    generic: 0.03     // Fallback for unknown site types
  },
  
  // Enhanced sanity guardrails with flexible regex patterns
  sanityGuardrails: {
    enabled: true,
    rules: {
      price: {
        pattern: /^\$?\d+(\.\d{1,2})?$/,  // Flexible price format
        description: 'Price must match currency format'
      },
      ingredients: {
        minItems: 3,
        itemMinLength: 2,
        description: 'Ingredients must have 3+ meaningful items'
      },
      instructions: {
        minItems: 2,
        itemMinLength: 5,
        description: 'Instructions must have 2+ meaningful steps'
      },
      title: {
        minLength: 10,
        maxLength: 200,
        description: 'Title must be 10-200 characters'
      },
      main_content_summary: {
        minLength: 50,
        maxLength: 1000,
        description: 'Summary must be 50-1000 characters'
      }
    }
  }
};

// Deep merge utility for nested configuration objects
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

// Central logger with enterprise-grade level filtering (fixed dependency issue)
function enterpriseLogger(level, message, data = null, config = DEFAULT_VALIDATION_CONFIG) {
  const levels = { debug: 0, info: 1, warn: 2, error: 3, silent: 999 };
  const currentLogLevel = levels[config.logLevel] || levels.info;
  
  if (levels[level] >= currentLogLevel) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [Validator] ${message}`;
    
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
}

// Validator Manager - Bulletproof championship-grade validation orchestrator
const ValidatorManager = {
  
  // Main validation method with comprehensive enterprise tracking
  applyValidationPenalties(extractedData, siteType = 'generic', customConfig = {}) {
    const startTime = Date.now();
    
    // Deep merge configuration to preserve nested objects
    const config = deepMerge(DEFAULT_VALIDATION_CONFIG, customConfig);
    
    enterpriseLogger('info', `Starting Day 8 enterprise validation for ${siteType}`, null, config);
    
    const validationResult = {
      success: false, // Will be determined by required field success
      validatedData: { ...extractedData },
      penalties: [],
      penaltyScore: 0,
      normalizedPenaltyScore: 0,
      businessRealismProof: false,
      sanityGuardrails: [],
      weakFields: [],
      metadata: {
        totalFields: Object.keys(extractedData).length,
        validFields: 0,
        penalizedFields: 0,
        requiredFieldsPassed: 0,
        requiredFieldsTotal: 0,
        penaltyTypes: {},
        fieldPenaltyTypes: {}, // Enhanced granular tracking: field:reason
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
        day8Version: DAY8_VERSION
      }
    };
    
    // Calculate maximum possible penalty for normalization
    validationResult.metadata.maxPossiblePenalty = Object.values(config.penaltyThresholds)
      .reduce((sum, fieldConfig) => sum + (fieldConfig.penaltyWeight || 0), 0);
    
    // Calculate raw accuracy (both standard and weighted)
    validationResult.metadata.rawAccuracy = this.calculateAccuracy(extractedData);
    validationResult.metadata.weightedRawAccuracy = this.calculateWeightedAccuracy(extractedData, config.penaltyThresholds);
    
    // Apply sanity guardrails first and nullify failed values
    const sanityResult = this.applySanityGuardrails(extractedData, config.sanityGuardrails);
    validationResult.sanityGuardrails = sanityResult.failures;
    validationResult.metadata.sanityFailures = sanityResult.failures.length;
    validationResult.metadata.sanityRawAccuracy = sanityResult.accuracy;
    
    // Apply sanity guardrail nullification to validated data
    sanityResult.failures.forEach(failure => {
      const field = failure.field;
      if (Array.isArray(extractedData[field])) {
        validationResult.validatedData[field] = [];
      } else {
        validationResult.validatedData[field] = null;
      }
    });
    
    // Count required fields
    validationResult.metadata.requiredFieldsTotal = Object.values(config.penaltyThresholds)
      .filter(fieldConfig => fieldConfig.required).length;
    
    // Validate each configured field with comprehensive error handling
    Object.entries(config.penaltyThresholds).forEach(([field, fieldConfig]) => {
      if (!extractedData.hasOwnProperty(field)) return;
      
      try {
        const value = extractedData[field];
        const penalty = this.validateField(field, value, fieldConfig, siteType);
        
        if (penalty) {
          validationResult.penalties.push(penalty);
          validationResult.penaltyScore += fieldConfig.penaltyWeight;
          validationResult.metadata.penalizedFields++;
          validationResult.weakFields.push(field);
          
          // Apply penalty - set to null/empty based on field type
          if (Array.isArray(extractedData[field])) {
            validationResult.validatedData[field] = [];
          } else {
            validationResult.validatedData[field] = null;
          }
          
          // Track penalty types (both simple and granular)
          const penaltyType = penalty.reason;
          validationResult.metadata.penaltyTypes[penaltyType] = 
            (validationResult.metadata.penaltyTypes[penaltyType] || 0) + 1;
          
          // Enhanced granular tracking: field:reason
          const fieldPenaltyKey = `${field}:${penaltyType}`;
          validationResult.metadata.fieldPenaltyTypes[fieldPenaltyKey] = 
            (validationResult.metadata.fieldPenaltyTypes[fieldPenaltyKey] || 0) + 1;
            
        } else {
          validationResult.metadata.validFields++;
          
          // Count successful required fields
          if (fieldConfig.required) {
            validationResult.metadata.requiredFieldsPassed++;
          }
        }
      } catch (validationError) {
        enterpriseLogger('error', `Validation rule error for field ${field}:`, validationError.message, config);
        
        // Treat validation rule errors as penalties to make validator unbreakable
        const errorPenalty = {
          field: field,
          reason: 'VALIDATION_RULE_ERROR',
          original: extractedData[field],
          expected: fieldConfig.description,
          error: validationError.message,
          penaltyWeight: fieldConfig.penaltyWeight,
          severity: 'HIGH',
          siteType: siteType,
          timestamp: new Date().toISOString()
        };
        
        validationResult.penalties.push(errorPenalty);
        validationResult.penaltyScore += fieldConfig.penaltyWeight;
        validationResult.metadata.penalizedFields++;
        validationResult.weakFields.push(field);
      }
    });
    
    // Calculate validated accuracy after penalties (both standard and weighted)
    validationResult.metadata.validatedAccuracy = this.calculateAccuracy(validationResult.validatedData);
    validationResult.metadata.weightedValidatedAccuracy = this.calculateWeightedAccuracy(
      validationResult.validatedData, 
      config.penaltyThresholds
    );
    
    // Calculate sanity-validated accuracy
    const sanityValidatedResult = this.applySanityGuardrails(validationResult.validatedData, config.sanityGuardrails);
    validationResult.metadata.sanityValidatedAccuracy = sanityValidatedResult.accuracy;
    
    // Calculate normalized penalty score (0-1 scale)
    validationResult.normalizedPenaltyScore = validationResult.metadata.maxPossiblePenalty > 0 ? 
      validationResult.penaltyScore / validationResult.metadata.maxPossiblePenalty : 0;
    
    // Calculate penalty impact percentage using weighted accuracy
    const rawAcc = validationResult.metadata.weightedRawAccuracy;
    const validatedAcc = validationResult.metadata.weightedValidatedAccuracy;
    validationResult.metadata.penaltyImpact = rawAcc > 0 ? ((rawAcc - validatedAcc) / rawAcc) * 100 : 0;
    
    // Business realism proof
    validationResult.businessRealismProof = validationResult.metadata.penaltyImpact > 0;
    
    // Enhanced success criteria: all required fields must pass
    validationResult.success = validationResult.metadata.requiredFieldsPassed === validationResult.metadata.requiredFieldsTotal && 
                              validationResult.metadata.validFields > 0;
    
    // Completion metadata
    validationResult.metadata.validationTime = Date.now() - startTime;
    
    // Enhanced logging with both raw and weighted accuracy
    this.logValidationResult(validationResult, config);
    
    return validationResult;
  },
  
  // Enhanced sanity guardrails with type safety and field nullification
  applySanityGuardrails(data, guardrailConfig) {
    if (!guardrailConfig.enabled) {
      return { failures: [], accuracy: this.calculateAccuracy(data) };
    }
    
    const failures = [];
    let validFields = 0;
    let totalFields = 0;
    
    Object.entries(guardrailConfig.rules).forEach(([field, rule]) => {
      if (!data.hasOwnProperty(field)) return;
      
      totalFields++;
      const value = data[field];
      let fieldValid = true;
      
      try {
        // Type-safe pattern validation for strings
        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
          failures.push({
            type: 'SANITY_PATTERN_FAILURE',
            field: field,
            value: value,
            rule: rule.description,
            pattern: rule.pattern.toString()
          });
          fieldValid = false;
        }
        
        // Type-safe length validation for strings
        if (typeof value === 'string') {
          if (rule.minLength && value.length < rule.minLength) {
            failures.push({
              type: 'SANITY_MIN_LENGTH_FAILURE',
              field: field,
              value: value,
              rule: rule.description,
              actual: value.length,
              minimum: rule.minLength
            });
            fieldValid = false;
          }
          
          if (rule.maxLength && value.length > rule.maxLength) {
            failures.push({
              type: 'SANITY_MAX_LENGTH_FAILURE',
              field: field,
              value: value,
              rule: rule.description,
              actual: value.length,
              maximum: rule.maxLength
            });
            fieldValid = false;
          }
        }
        
        // Type-safe array validation
        if (Array.isArray(value)) {
          if (rule.minItems && value.length < rule.minItems) {
            failures.push({
              type: 'SANITY_MIN_ITEMS_FAILURE',
              field: field,
              value: value,
              rule: rule.description,
              actual: value.length,
              minimum: rule.minItems
            });
            fieldValid = false;
          }
          
          // Type-safe item quality check
          if (rule.itemMinLength && typeof rule.itemMinLength === 'number') {
            const invalidItems = value.filter(item => 
              !item || typeof item !== 'string' || item.trim().length < rule.itemMinLength
            );
            
            if (invalidItems.length > 0) {
              failures.push({
                type: 'SANITY_ITEM_QUALITY_FAILURE',
                field: field,
                value: value,
                rule: rule.description,
                invalidItems: invalidItems.length,
                minimumItemLength: rule.itemMinLength
              });
              fieldValid = false;
            }
          }
        }
        
        // Handle unexpected data types gracefully
        if (typeof value !== 'string' && !Array.isArray(value) && value !== null && value !== undefined) {
          failures.push({
            type: 'SANITY_TYPE_ERROR',
            field: field,
            value: value,
            rule: rule.description,
            actualType: typeof value,
            expectedTypes: ['string', 'array']
          });
          fieldValid = false;
        }
        
        if (fieldValid) {
          validFields++;
        }
        
      } catch (guardrailError) {
        enterpriseLogger('warn', `Sanity guardrail error for field ${field}:`, guardrailError.message);
        failures.push({
          type: 'SANITY_RULE_ERROR',
          field: field,
          value: value,
          rule: rule.description,
          error: guardrailError.message
        });
      }
    });
    
    const accuracy = totalFields > 0 ? Math.round((validFields / totalFields) * 100) : 100;
    
    enterpriseLogger('debug', `Sanity guardrails: ${failures.length} failures, ${accuracy}% accuracy`);
    
    return { failures, accuracy };
  },
  
  // Enhanced logging with comprehensive accuracy tracking (reduced verbosity)
  logValidationResult(validationResult, config) {
    const meta = validationResult.metadata;
    
    const summaryStats = {
      siteType: meta.siteType,
      success: validationResult.success,
      penalties: validationResult.penalties.length,
      penaltyImpact: meta.penaltyImpact.toFixed(1) + '%',
      rawAccuracy: meta.rawAccuracy.toFixed(1) + '%',
      weightedRawAccuracy: meta.weightedRawAccuracy.toFixed(1) + '%',
      validatedAccuracy: meta.validatedAccuracy.toFixed(1) + '%',
      weightedValidatedAccuracy: meta.weightedValidatedAccuracy.toFixed(1) + '%',
      sanityAccuracy: meta.sanityValidatedAccuracy.toFixed(1) + '%',
      requiredFieldsPass: `${meta.requiredFieldsPassed}/${meta.requiredFieldsTotal}`,
      sanityFailures: meta.sanityFailures,
      weakFields: validationResult.weakFields
    };
    
    enterpriseLogger('info', 
      `Day 8 validation: ${summaryStats.siteType} | Success: ${summaryStats.success} | ` +
      `Raw: ${summaryStats.rawAccuracy} → Weighted: ${summaryStats.weightedRawAccuracy} | ` +
      `Validated: ${summaryStats.validatedAccuracy} → Weighted: ${summaryStats.weightedValidatedAccuracy} | ` +
      `Sanity: ${summaryStats.sanityAccuracy} | Penalties: ${summaryStats.penalties} | ` +
      `Impact: ${summaryStats.penaltyImpact} | Required: ${summaryStats.requiredFieldsPass} | ` +
      `Weak Fields: [${summaryStats.weakFields.join(', ')}]`,
      null, config
    );
    
    if (validationResult.sanityGuardrails.length > 0) {
      enterpriseLogger('warn', `Sanity guardrail failures detected:`, validationResult.sanityGuardrails, config);
    }
  },
  
  // Enhanced field validation with alias support and comprehensive error handling
  validateField(fieldName, value, config, siteType) {
    // Handle alias fields (e.g., reviews_rating → rating)
    if (config.aliasOf) {
      const aliasConfig = DEFAULT_VALIDATION_CONFIG.penaltyThresholds[config.aliasOf];
      if (aliasConfig) {
        return this.validateField(fieldName, value, aliasConfig, siteType);
      }
    }
    
    // Check required fields
    if (config.required && (!value || (typeof value === 'string' && value.trim().length === 0))) {
      return {
        field: fieldName,
        reason: 'REQUIRED_FIELD_MISSING',
        original: value,
        expected: config.description,
        penaltyWeight: config.penaltyWeight,
        severity: config.severity || 'HIGH',
        siteType: siteType,
        timestamp: new Date().toISOString()
      };
    }
    
    // Skip validation for null/empty optional fields
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      return null;
    }
    
    // String length validation
    if (config.minLength && typeof value === 'string' && value.trim().length < config.minLength) {
      return {
        field: fieldName,
        reason: 'INSUFFICIENT_LENGTH',
        original: value,
        expected: config.description,
        actual: value.trim().length,
        minimum: config.minLength,
        penaltyWeight: config.penaltyWeight,
        severity: config.severity || 'MEDIUM',
        siteType: siteType,
        timestamp: new Date().toISOString()
      };
    }
    
    // Enhanced regex validation with flexible patterns and error handling
    if (config.regex && typeof value === 'string') {
      try {
        if (!config.regex.test(value.trim())) {
          return {
            field: fieldName,
            reason: 'INVALID_FORMAT',
            original: value,
            expected: config.description,
            pattern: config.regex.toString(),
            penaltyWeight: config.penaltyWeight,
            severity: config.severity || 'MEDIUM',
            siteType: siteType,
            timestamp: new Date().toISOString()
          };
        }
      } catch (regexError) {
        enterpriseLogger('error', `Regex validation error for field ${fieldName}:`, regexError.message);
        return {
          field: fieldName,
          reason: 'REGEX_VALIDATION_ERROR',
          original: value,
          expected: config.description,
          error: regexError.message,
          penaltyWeight: config.penaltyWeight,
          severity: 'HIGH',
          siteType: siteType,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // Array minimum items validation (ingredients, instructions)
    if (config.minItems && Array.isArray(value)) {
      const validItems = value.filter(item => item && typeof item === 'string' && item.trim().length > 0);
      if (validItems.length < config.minItems) {
        return {
          field: fieldName,
          reason: 'INSUFFICIENT_ITEMS',
          original: value,
          expected: config.description,
          actual: validItems.length,
          minimum: config.minItems,
          penaltyWeight: config.penaltyWeight,
          severity: config.severity || 'MEDIUM',
          siteType: siteType,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    return null; // Field passed validation
  },
  
  // Standard accuracy calculation for extracted data
  calculateAccuracy(data) {
    const totalFields = Object.keys(data).length;
    if (totalFields === 0) return 0;
    
    let populatedFields = 0;
    
    Object.entries(data).forEach(([field, value]) => {
      if (this.isFieldPopulated(value)) {
        populatedFields++;
      }
    });
    
    return Math.round((populatedFields / totalFields) * 100);
  },
  
  // Weighted accuracy calculation (gives required fields higher importance)
  calculateWeightedAccuracy(data, penaltyThresholds) {
    let totalWeight = 0;
    let weightedPopulated = 0;
    
    Object.entries(data).forEach(([field, value]) => {
      const fieldConfig = penaltyThresholds[field];
      if (fieldConfig) {
        const weight = fieldConfig.accuracyWeight || 1.0;
        totalWeight += weight;
        
        if (this.isFieldPopulated(value)) {
          weightedPopulated += weight;
        }
      }
    });
    
    return totalWeight > 0 ? Math.round((weightedPopulated / totalWeight) * 100) : 0;
  },
  
  // Check if field is meaningfully populated
  isFieldPopulated(value) {
    if (value === null || value === undefined || value === '') {
      return false;
    }
    
    if (Array.isArray(value)) {
      return value.length > 0 && value.some(item => item && item.trim && item.trim() !== '');
    }
    
    if (typeof value === 'string') {
      return value.trim().length > 0 && 
             !['n/a', 'null', 'undefined', 'unknown', 'not found'].includes(value.toLowerCase());
    }
    
    return true;
  },
  
  // Business-weighted accuracy calculation with proper fallback handling
  calculateBusinessWeightedAccuracy(siteResults, customWeights = {}) {
    enterpriseLogger('info', 'Calculating business-weighted accuracy...');
    
    const weights = { ...DEFAULT_VALIDATION_CONFIG.businessWeights, ...customWeights };
    
    let weightedRawScore = 0;
    let weightedValidatedScore = 0;
    let totalWeight = 0;
    let totalPenalties = 0;
    
    siteResults.forEach(site => {
      // Proper fallback to generic weight instead of silent 0
      const weight = weights[site.siteType] || weights.generic || 0.03;
      if (weight > 0 && site.rawAccuracy !== undefined && site.validatedAccuracy !== undefined) {
        // Use weighted accuracy if available, fallback to standard accuracy
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
    const overallPenaltyImpact = rawBusinessAccuracy > 0 ?
      ((rawBusinessAccuracy - validatedBusinessAccuracy) / rawBusinessAccuracy) * 100 : 0;
    
    enterpriseLogger('info', 
      `Business-weighted accuracy: Raw ${rawBusinessAccuracy.toFixed(1)}%, ` +
      `Validated ${validatedBusinessAccuracy.toFixed(1)}%, ` +
      `Penalty Impact ${overallPenaltyImpact.toFixed(1)}%`
    );
    
    return {
      rawBusinessAccuracy: rawBusinessAccuracy,
      validatedBusinessAccuracy: validatedBusinessAccuracy,
      overallPenaltyImpact: overallPenaltyImpact,
      totalWeight: totalWeight,
      totalPenalties: totalPenalties,
      coreAccuracy: this.calculateCoreAccuracy(siteResults),
      wildcardAccuracy: this.calculateWildcardAccuracy(siteResults),
      businessRealismProof: overallPenaltyImpact > 0 ? 'TEMPERING_RESULTS' : 'NO_INFLATION',
      day8Version: DAY8_VERSION
    };
  },
  
  // Calculate core sites accuracy (Amazon, Bloomberg, AllRecipes, Wikipedia)
  calculateCoreAccuracy(siteResults) {
    const coreSites = siteResults.filter(s => ['amazon', 'allrecipes', 'bloomberg', 'wikipedia'].includes(s.siteType));
    if (coreSites.length === 0) return 0;
    
    const avgValidatedAccuracy = coreSites.reduce((sum, site) => {
      const accuracy = site.weightedValidatedAccuracy !== undefined ? site.weightedValidatedAccuracy : site.validatedAccuracy;
      return sum + (accuracy || 0);
    }, 0) / coreSites.length;
    
    return avgValidatedAccuracy;
  },
  
  // Calculate wildcard sites accuracy (Medium, Generic)
  calculateWildcardAccuracy(siteResults) {
    const wildcardSites = siteResults.filter(s => ['medium', 'generic'].includes(s.siteType));
    if (wildcardSites.length === 0) return 0;
    
    const avgValidatedAccuracy = wildcardSites.reduce((sum, site) => {
      const accuracy = site.weightedValidatedAccuracy !== undefined ? site.weightedValidatedAccuracy : site.validatedAccuracy;
      return sum + (accuracy || 0);
    }, 0) / wildcardSites.length;
    
    return avgValidatedAccuracy;
  },
  
  // Analyze penalty impact for business insights
  analyzePenaltyImpact(rawAccuracy, validatedAccuracy) {
    const penaltyImpact = rawAccuracy > 0 ? ((rawAccuracy - validatedAccuracy) / rawAccuracy) * 100 : 0;
    
    let interpretation = 'NO_PENALTY';
    let businessValue = 'UNKNOWN';
    let recommendation = 'MAINTAIN_CURRENT';
    
    if (penaltyImpact > 20) {
      interpretation = 'EXCESSIVE_TEMPERING';
      businessValue = 'TOO_STRICT_STANDARDS';
      recommendation = 'RELAX_VALIDATION_SLIGHTLY';
    } else if (penaltyImpact > 15) {
      interpretation = 'HIGH_TEMPERING';
      businessValue = 'EXCELLENT_STANDARDS';
      recommendation = 'MAINTAIN_CURRENT_VALIDATION';
    } else if (penaltyImpact > 8) {
      interpretation = 'OPTIMAL_TEMPERING';
      businessValue = 'GOOD_STANDARDS';
      recommendation = 'CONTINUE_CURRENT_APPROACH';
    } else if (penaltyImpact > 3) {
      interpretation = 'LIGHT_TEMPERING';
      businessValue = 'BASIC_STANDARDS';
      recommendation = 'CONSIDER_STRICTER_VALIDATION';
    } else if (penaltyImpact > 0) {
      interpretation = 'MINIMAL_TEMPERING';
      businessValue = 'WEAK_STANDARDS';
      recommendation = 'STRENGTHEN_VALIDATION';
    } else {
      interpretation = 'NO_PENALTY';
      businessValue = 'POSSIBLE_INFLATION';
      recommendation = 'REVIEW_VALIDATION_LOGIC';
    }
    
    return {
      penaltyImpactPercent: penaltyImpact.toFixed(1),
      interpretation: interpretation,
      businessValue: businessValue,
      recommendation: recommendation,
      businessRealismProof: penaltyImpact > 0 ? 'TEMPERING_RESULTS' : 'NO_INFLATION',
      qualityAssurance: penaltyImpact >= 8 && penaltyImpact <= 15 ? 'OPTIMAL_RANGE' : 'SUBOPTIMAL_RANGE'
    };
  },
  
  // Analyze trajectory toward target accuracy
  analyzeTrajectory(previousAccuracy, currentAccuracy, targetAccuracy = 80, daysRemaining = 2) {
    const progressMade = currentAccuracy - previousAccuracy;
    const progressNeeded = Math.max(0, targetAccuracy - currentAccuracy);
    
    let trajectory = 'UNKNOWN';
    let recommendation = 'CONTINUE_CURRENT_APPROACH';
    let urgency = 'NORMAL';
    
    if (currentAccuracy >= targetAccuracy) {
      trajectory = 'TARGET_ACHIEVED';
      recommendation = 'MAINTAIN_QUALITY_STANDARDS';
      urgency = 'LOW';
    } else if (daysRemaining <= 0) {
      trajectory = 'TARGET_MISSED';
      recommendation = 'EXTEND_TIMELINE_OR_LOWER_TARGET';
      urgency = 'HIGH';
    } else {
      const requiredDailyProgress = progressNeeded / daysRemaining;
      
      if (progressMade >= requiredDailyProgress * 1.5) {
        trajectory = 'AHEAD_OF_SCHEDULE';
        recommendation = 'ON_TRACK_CONTINUE';
        urgency = 'LOW';
      } else if (progressMade >= requiredDailyProgress) {
        trajectory = 'ON_TRACK';
        recommendation = 'MAINTAIN_CURRENT_PACE';
        urgency = 'NORMAL';
      } else if (progressMade >= requiredDailyProgress * 0.7) {
        trajectory = 'NEEDS_SLIGHT_ACCELERATION';
        recommendation = 'INCREASE_AI_OPTIMIZATION';
        urgency = 'MEDIUM';
      } else {
        trajectory = 'NEEDS_SIGNIFICANT_ACCELERATION';
        recommendation = 'MAJOR_IMPROVEMENTS_REQUIRED';
        urgency = 'HIGH';
      }
    }
    
    return {
      trajectory: trajectory,
      recommendation: recommendation,
      urgency: urgency,
      progressMade: progressMade.toFixed(1),
      progressNeeded: progressNeeded.toFixed(1),
      requiredDailyProgress: Math.max(0, progressNeeded / daysRemaining).toFixed(1),
      currentProgressRate: progressMade.toFixed(1),
      projectedFinalAccuracy: Math.min(100, currentAccuracy + (progressMade * daysRemaining)).toFixed(1),
      onTrack: progressMade >= (progressNeeded / daysRemaining) * 0.8
    };
  },
  
  // Enhanced penalty breakdown with field-level granularity (demoted to debug)
  compilePenaltyBreakdown(validationResults) {
    const breakdown = {};
    const fieldBreakdown = {};
    
    validationResults.forEach(result => {
      if (result.penalties) {
        result.penalties.forEach(penalty => {
          // Standard breakdown by reason
          if (!breakdown[penalty.reason]) {
            breakdown[penalty.reason] = {
              count: 0,
              fields: [],
              totalWeight: 0,
              severities: [],
              siteTypes: []
            };
          }
          
          breakdown[penalty.reason].count++;
          breakdown[penalty.reason].totalWeight += penalty.penaltyWeight || 0;
          
          if (!breakdown[penalty.reason].fields.includes(penalty.field)) {
            breakdown[penalty.reason].fields.push(penalty.field);
          }
          
          if (penalty.severity && !breakdown[penalty.reason].severities.includes(penalty.severity)) {
            breakdown[penalty.reason].severities.push(penalty.severity);
          }
          
          if (penalty.siteType && !breakdown[penalty.reason].siteTypes.includes(penalty.siteType)) {
            breakdown[penalty.reason].siteTypes.push(penalty.siteType);
          }
          
          // Enhanced field-level breakdown
          const fieldKey = penalty.field;
          if (!fieldBreakdown[fieldKey]) {
            fieldBreakdown[fieldKey] = {
              totalPenalties: 0,
              reasons: {},
              siteTypes: [],
              totalWeight: 0
            };
          }
          
          fieldBreakdown[fieldKey].totalPenalties++;
          fieldBreakdown[fieldKey].totalWeight += penalty.penaltyWeight || 0;
          fieldBreakdown[fieldKey].reasons[penalty.reason] = 
            (fieldBreakdown[fieldKey].reasons[penalty.reason] || 0) + 1;
          
          if (!fieldBreakdown[fieldKey].siteTypes.includes(penalty.siteType)) {
            fieldBreakdown[fieldKey].siteTypes.push(penalty.siteType);
          }
        });
      }
    });
    
    // Log breakdown at debug level to reduce verbosity
    enterpriseLogger('debug', 'Penalty breakdown compiled:', { breakdown, fieldBreakdown });
    
    return { breakdown, fieldBreakdown };
  },
  
  // Enhanced validation report with comprehensive analytics
  generateValidationReport(validationResults, previousAccuracy = 0, logLevel = 'summary') {
    const businessMetrics = this.calculateBusinessWeightedAccuracy(validationResults);
    const penaltyAnalysis = this.analyzePenaltyImpact(
      businessMetrics.rawBusinessAccuracy,
      businessMetrics.validatedBusinessAccuracy
    );
    const trajectoryAnalysis = this.analyzeTrajectory(
      previousAccuracy,
      businessMetrics.validatedBusinessAccuracy
    );
    const penaltyBreakdowns = this.compilePenaltyBreakdown(validationResults);
    
    // Collect weak fields across all validations
    const allWeakFields = validationResults.reduce((acc, result) => {
      if (result.weakFields) {
        result.weakFields.forEach(field => {
          if (!acc.includes(field)) acc.push(field);
        });
      }
      return acc;
    }, []);
    
    const report = {
      day8Version: DAY8_VERSION,
      timestamp: new Date().toISOString(),
      
      executiveSummary: {
        previousAccuracy: previousAccuracy.toFixed(1) + '%',
        currentRawAccuracy: businessMetrics.rawBusinessAccuracy.toFixed(1) + '%',
        currentValidatedAccuracy: businessMetrics.validatedBusinessAccuracy.toFixed(1) + '%',
        penaltyImpact: penaltyAnalysis.penaltyImpactPercent + '%',
        progressMade: (businessMetrics.validatedBusinessAccuracy - previousAccuracy).toFixed(1) + '%',
        trajectory: trajectoryAnalysis.trajectory,
        businessRealismProof: penaltyAnalysis.businessRealismProof,
        weakFields: allWeakFields
      },
      
      validationSummary: {
        totalSites: validationResults.length,
        validSites: validationResults.filter(r => r.success).length,
        totalPenalties: businessMetrics.totalPenalties,
        avgPenaltyImpact: penaltyAnalysis.penaltyImpactPercent + '%',
        qualityAssurance: penaltyAnalysis.qualityAssurance,
        sanityFailures: validationResults.reduce((sum, r) => sum + (r.metadata?.sanityFailures || 0), 0)
      },
      
      businessMetrics: businessMetrics,
      penaltyAnalysis: penaltyAnalysis,
      trajectoryAnalysis: trajectoryAnalysis,
      penaltyBreakdown: penaltyBreakdowns.breakdown,
      fieldBreakdown: penaltyBreakdowns.fieldBreakdown,
      
      sitePerformance: validationResults.map(result => ({
        site: result.siteName || result.siteType || 'Unknown',
        siteType: result.siteType || 'generic',
        rawAccuracy: result.rawAccuracy || 0,
        validatedAccuracy: result.validatedAccuracy || 0,
        weightedRawAccuracy: result.weightedRawAccuracy || result.rawAccuracy || 0,
        weightedValidatedAccuracy: result.weightedValidatedAccuracy || result.validatedAccuracy || 0,
        sanityRawAccuracy: result.metadata?.sanityRawAccuracy || 0,
        sanityValidatedAccuracy: result.metadata?.sanityValidatedAccuracy || 0,
        penaltyImpact: result.penaltyImpact || 0,
        normalizedPenaltyScore: result.normalizedPenaltyScore || 0,
        sanityFailures: result.metadata?.sanityFailures || 0,
        weakFields: result.weakFields || [],
        penalties: result.penalties || []
      })),
      
      recommendations: this.generateRecommendations(penaltyAnalysis, trajectoryAnalysis),
      validationResults: logLevel === 'detailed' ? validationResults : undefined
    };
    
    // Bulletproof summary logging
    const summaryStats = {
      accuracy: report.executiveSummary.currentValidatedAccuracy,
      penalties: report.validationSummary.totalPenalties,
      sanityFailures: report.validationSummary.sanityFailures,
      trajectory: report.executiveSummary.trajectory,
      businessRealism: report.executiveSummary.businessRealismProof,
      weakFields: allWeakFields.length
    };
    
    if (logLevel !== 'silent') {
      enterpriseLogger('info', 
        `Day 8 bulletproof validation report: ${summaryStats.accuracy} accuracy, ` +
        `${summaryStats.penalties} penalties, ${summaryStats.sanityFailures} sanity failures, ` +
        `${summaryStats.trajectory}, ${summaryStats.businessRealism}, ` +
        `${summaryStats.weakFields} weak field types`
      );
    }
    
    return report;
  },
  
  // Generate actionable recommendations
  generateRecommendations(penaltyAnalysis, trajectoryAnalysis) {
    const recommendations = [];
    
    // Penalty-based recommendations
    if (penaltyAnalysis.qualityAssurance === 'OPTIMAL_RANGE') {
      recommendations.push({
        type: 'VALIDATION',
        priority: 'LOW',
        message: 'Penalty impact is in optimal range (8-15%). Maintain current validation standards.'
      });
    } else if (parseFloat(penaltyAnalysis.penaltyImpactPercent) < 5) {
      recommendations.push({
        type: 'VALIDATION',
        priority: 'MEDIUM',
        message: 'Low penalty impact suggests validation may be too lenient. Consider stricter standards.'
      });
    } else if (parseFloat(penaltyAnalysis.penaltyImpactPercent) > 20) {
      recommendations.push({
        type: 'VALIDATION',
        priority: 'HIGH',
        message: 'High penalty impact suggests validation may be too strict. Review penalty thresholds.'
      });
    }
    
    // Trajectory-based recommendations
    recommendations.push({
      type: 'TRAJECTORY',
      priority: trajectoryAnalysis.urgency,
      message: `${trajectoryAnalysis.recommendation} - Currently ${trajectoryAnalysis.trajectory.replace(/_/g, ' ').toLowerCase()}.`
    });
    
    // Business-specific recommendations
    if (trajectoryAnalysis.onTrack) {
      recommendations.push({
        type: 'BUSINESS',
        priority: 'LOW',
        message: 'On track to reach target accuracy. Continue current approach.'
      });
    } else {
      recommendations.push({
        type: 'BUSINESS',
        priority: 'HIGH',
        message: 'Behind trajectory for target accuracy. Consider AI optimization and validation review.'
      });
    }
    
    return recommendations;
  }
  
};

console.log('[Validator] Day 8 BULLETPROOF CHAMPIONSHIP-GRADE validation engine ready - ' +
  'Fixed dependency ordering, unified rating validation, flexible regex patterns, ' +
  'type-safe guardrails, aligned sanity nullification, proper generic fallback, ' +
  'reduced log verbosity, comprehensive error handling');

// Export for use in background.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValidatorManager;
}
