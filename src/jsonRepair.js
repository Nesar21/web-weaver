// ============================================================================
// jsonRepair.js - v3.0.0 (Day 12 - FIX #4C APPLIED)
// ============================================================================
// Production-grade JSON repair and normalization utilities
// FIX #4C: Advanced nested confidence structure flattening
// Duplicates removed - only unique functions remain
// Used as standalone utility or importable module
// ============================================================================

/**
 * Validate JSON against a schema
 * Returns {valid: boolean, errors: string[]}
 */
function validateJSON(obj, schema) {
  const errors = [];
  
  for (const [key, expectedType] of Object.entries(schema)) {
    if (!obj.hasOwnProperty(key)) {
      errors.push(`Missing required field: ${key}`);
      continue;
    }
    
    const actualType = typeof obj[key];
    
    if (expectedType === 'number' && actualType !== 'number' && obj[key] !== null) {
      errors.push(`Field "${key}" should be number, got ${actualType}`);
    } else if (expectedType === 'string' && actualType !== 'string' && obj[key] !== null) {
      errors.push(`Field "${key}" should be string, got ${actualType}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Normalize field names (convert snake_case variations)
 */
function normalizeFieldNames(obj, fieldMappings = {}) {
  const normalized = {};
  
  const defaultMappings = {
    'product_name': 'name',
    'product_price': 'price',
    'product_url': 'url',
    'product_image': 'image',
    'product_rating': 'rating',
    'number_of_reviews': 'reviews',
    'discount_percentage': 'discount',
    ...fieldMappings
  };
  
  for (const [key, value] of Object.entries(obj)) {
    const normalizedKey = defaultMappings[key] || key;
    normalized[normalizedKey] = value;
  }
  
  return normalized;
}

/**
 * Deep clean extracted data (remove nulls, empty strings, etc.)
 */
function cleanExtractedData(obj, options = {}) {
  const {
    removeNull = false,
    removeEmptyStrings = false,
    trimStrings = true
  } = options;
  
  const cleaned = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (removeNull && value === null) continue;
    if (removeEmptyStrings && value === '') continue;
    
    if (trimStrings && typeof value === 'string') {
      cleaned[key] = value.trim();
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

// ============================================================================
// FIX #4C: ADVANCED NESTED CONFIDENCE FLATTENING
// ============================================================================

/**
 * FIX #4C: Repair complex JSON with nested confidence structures
 */
function repairComplexJSON(jsonString) {
  console.log('[JSONRepair] FIX #4C: Attempting complex JSON repair...');
  
  try {
    let cleaned = jsonString.replace(/``````/g, '').replace(/,(\s*[}\]])/g, '$1').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    
    let parsed = JSON.parse(cleaned);
    
    if (typeof parsed === 'object' && parsed !== null) {
      parsed = flattenNestedStructure(parsed);
    }
    
    console.log('[JSONRepair] FIX #4C: Complex JSON repaired successfully');
    return parsed;
    
  } catch (error) {
    console.error('[JSONRepair] FIX #4C: Complex repair failed:', error.message);
    throw new Error('JSON repair failed after all attempts');
  }
}

/**
 * FIX #4C: Flatten nested confidence structures recursively
 */
function flattenNestedStructure(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => flattenNestedStructure(item));
  }
  
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const flattened = {};
  let maxConfidence = 0;
  let bestReasoning = null;
  
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && 'value' in value && key !== 'confidence_score' && key !== 'confidence_reasoning') {
      console.log('[JSONRepair] FIX #4C: Flattening nested field:', key);
      flattened[key] = value.value;
      if (value.confidence_score && value.confidence_score > maxConfidence) {
        maxConfidence = value.confidence_score;
        bestReasoning = value.confidence_reasoning || null;
      }
    } else if (Array.isArray(value)) {
      flattened[key] = value.map(item => flattenNestedStructure(item));
    } else if (key === 'confidence_score') {
      maxConfidence = Math.max(maxConfidence, value);
    } else if (key === 'confidence_reasoning' && !bestReasoning) {
      bestReasoning = value;
    } else {
      flattened[key] = value;
    }
  }
  
  if (maxConfidence > 0) {
    flattened.confidence_score = maxConfidence;
  }
  if (bestReasoning) {
    flattened.confidence_reasoning = bestReasoning;
  }
  if (!flattened.confidence_score) {
    flattened.confidence_score = 70;
    flattened.confidence_reasoning = 'Confidence not provided by AI';
  }
  
  return flattened;
}

/**
 * FIX #4C: Detect if JSON has nested confidence pattern
 */
function hasNestedConfidencePattern(obj) {
  if (!obj || typeof obj !== 'object') return false;
  
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && 'value' in value && key !== 'confidence_score' && key !== 'confidence_reasoning') {
      return true;
    }
  }
  
  return false;
}

/**
 * Example schemas for different content types
 */
const SCHEMAS = {
  ecommerce: {
    name: 'string',
    price: 'number',
    original_price: 'number',
    rating: 'number',
    reviews: 'number',
    url: 'string',
    image: 'string',
    availability: 'string',
    confidence_score: 'number'
  },
  
  article: {
    title: 'string',
    author: 'string',
    published_date: 'string',
    content: 'string',
    url: 'string',
    read_time: 'number',
    confidence_score: 'number'
  },
  
  recipe: {
    name: 'string',
    ingredients: 'string',
    instructions: 'string',
    prep_time: 'number',
    cook_time: 'number',
    servings: 'number',
    calories: 'number',
    confidence_score: 'number'
  }
};

/**
 * Main utility function: repair + validate + clean
 */
function processExtractedData(data, schemaType = 'ecommerce', options = {}) {
  console.log(`[jsonRepair] Processing ${schemaType} data...`);
  
  const schema = SCHEMAS[schemaType] || SCHEMAS.ecommerce;
  
  if (hasNestedConfidencePattern(data)) {
    console.log('[jsonRepair] FIX #4C: Nested confidence pattern detected - flattening...');
    data = flattenNestedStructure(data);
  }
  
  let processed = normalizeFieldNames(data, options.fieldMappings);
  processed = cleanExtractedData(processed, options.cleanOptions);
  
  const validation = validateJSON(processed, schema);
  
  if (!validation.valid) {
    console.warn('[jsonRepair] Validation warnings:', validation.errors);
  }
  
  console.log(`[jsonRepair] Processing complete. Valid: ${validation.valid}`);
  
  return {
    data: processed,
    validation: validation
  };
}

// ============================================================================
// EXPORT (for use in background.js or other modules)
// ============================================================================

if (typeof self !== 'undefined' && typeof self.WEB_WEAVER_JSON_REPAIR === 'undefined') {
  self.WEB_WEAVER_JSON_REPAIR = {
    validateJSON,
    normalizeFieldNames,
    cleanExtractedData,
    processExtractedData,
    repairComplexJSON,
    flattenNestedStructure,
    hasNestedConfidencePattern,
    SCHEMAS
  };
  console.log('[jsonRepair] Exported to self.WEB_WEAVER_JSON_REPAIR');
}

if (typeof window !== 'undefined' && typeof window.jsonRepairUtils === 'undefined') {
  window.jsonRepairUtils = {
    validateJSON,
    normalizeFieldNames,
    cleanExtractedData,
    processExtractedData,
    repairComplexJSON,
    flattenNestedStructure,
    hasNestedConfidencePattern,
    SCHEMAS
  };
  console.log('[jsonRepair] Exported to window.jsonRepairUtils');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateJSON,
    normalizeFieldNames,
    cleanExtractedData,
    processExtractedData,
    repairComplexJSON,
    flattenNestedStructure,
    hasNestedConfidencePattern,
    SCHEMAS
  };
  console.log('[jsonRepair] Exported to module.exports');
}

console.log('[jsonRepair] v3.0.0 loaded (FIX #4C: Nested confidence flattening)');
