// ============================================================================
// jsonRepair.js - REFACTORED (Day 10 Priority 5)
// ============================================================================
// Production-grade JSON repair and normalization utilities
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
 * Example: product_price, productPrice, Product_Price → price
 */
function normalizeFieldNames(obj, fieldMappings = {}) {
  const normalized = {};
  
  // Default mappings for common variations
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
    // Skip null values if option enabled
    if (removeNull && value === null) continue;
    
    // Skip empty strings if option enabled
    if (removeEmptyStrings && value === '') continue;
    
    // Trim strings if option enabled
    if (trimStrings && typeof value === 'string') {
      cleaned[key] = value.trim();
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
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
 * Use this as single entry point for post-processing
 */
function processExtractedData(data, schemaType = 'ecommerce', options = {}) {
  console.log(`[jsonRepair] Processing ${schemaType} data...`);
  
  const schema = SCHEMAS[schemaType] || SCHEMAS.ecommerce;
  
  // Step 1: Normalize field names
  let processed = normalizeFieldNames(data, options.fieldMappings);
  
  // Step 2: Clean data (remove nulls, trim, etc.)
  processed = cleanExtractedData(processed, options.cleanOptions);
  
  // Step 3: Validate against schema
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

// For Chrome extension (no module system)
if (typeof window !== 'undefined') {
  window.jsonRepairUtils = {
    validateJSON,
    normalizeFieldNames,
    cleanExtractedData,
    processExtractedData,
    SCHEMAS
  };
}

// For Node.js / module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateJSON,
    normalizeFieldNames,
    cleanExtractedData,
    processExtractedData,
    SCHEMAS
  };
}

console.log('[jsonRepair] ✅ Utility loaded (Refactored - Day 10)');
