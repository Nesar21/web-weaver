// ============================================================================
// Day 21.2 Schema Utility - AI Engine v1 Enhanced + URL Field Enforcement
// src/utils/schemas.js - DAY 21.2 ENHANCED
// ============================================================================

console.log('[Schemas] Day 21.2 AI ENGINE v1 loading - Enhanced Type System + URL Enforcement...');

// ============================================================================
// DAY 21.2 ENHANCEMENTS - URL FIELD ENFORCEMENT
// ============================================================================

const DAY21_VERSION = 'day21.2-chrome-ai-url-enforcement';

// Day 10 Date Format Converter (YYYY-MM-DD) - PRESERVED
function convertToStandardDateDay10(dateString) {
  if (!dateString || typeof dateString !== 'string') return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    return null;
  }
}

// 🆕 DAY 21.2: URL Validation Pattern
const URL_VALIDATION_PATTERN = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// ============================================================================
// DAY 21.2: Enhanced Field Type Definitions (with URL field)
// ============================================================================

const DAY10_FIELD_TYPES = {
  bloomberg: {
    title: { type: 'string', nullable: false, minLength: 5, maxLength: 200 },
    url: { type: 'string', nullable: false, pattern: URL_VALIDATION_PATTERN }, // 🆕 ADDED
    author: { type: 'string', nullable: true, minLength: 2, maxLength: 100 },
    publication_date: { type: 'string', nullable: true, pattern: /^\d{4}-\d{2}-\d{2}$/ },
    main_content_summary: { type: 'string', nullable: true, minLength: 20, maxLength: 2000 },
    category: { type: 'string', nullable: true, minLength: 2, maxLength: 50 },
    description: { type: 'string', nullable: false, minLength: 10, maxLength: 1000 },
    links: { type: 'array', nullable: true, minItems: 0, maxItems: 100 },
    images: { type: 'array', nullable: true, minItems: 0, maxItems: 50 },
    confidence_score: { type: 'number', nullable: false, min: 0, max: 100 },
    
    // ✅ CRITICAL FIX: Bloomberg market data fields as STRINGS
    market_data: { 
      type: 'array', 
      nullable: true,
      items: {
        index_name: { type: 'string', nullable: false },
        index_value: { type: 'string', nullable: false },
        index_change: { type: 'string', nullable: true },
        index_change_percentage: { type: 'string', nullable: true }
      }
    },
    tickers_mentioned: { type: 'array', nullable: true, minItems: 0, maxItems: 50 },
    stock_tickers_mentioned: { type: 'array', nullable: true, minItems: 0, maxItems: 50 }
  },
  
  amazon: {
    title: { type: 'string', nullable: false, minLength: 5, maxLength: 200 },
    url: { type: 'string', nullable: false, pattern: URL_VALIDATION_PATTERN }, // 🆕 ADDED
    price: { type: 'string', nullable: false, pattern: /^\$?\d+(\.\d{1,2})?$/ },
    description: { type: 'string', nullable: false, minLength: 10, maxLength: 1000 },
    reviews_rating: { type: 'string', nullable: true, pattern: /^\d(\.\d)?\/5$/ },
    images: { type: 'array', nullable: true, minItems: 1, maxItems: 50 },
    category: { type: 'string', nullable: true, minLength: 2, maxLength: 100 },
    confidence_score: { type: 'number', nullable: false, min: 0, max: 100 }
  },
  
  allrecipes: {
    title: { type: 'string', nullable: false, minLength: 5, maxLength: 200 },
    url: { type: 'string', nullable: false, pattern: URL_VALIDATION_PATTERN }, // 🆕 ADDED
    ingredients: { type: 'array', nullable: false, minItems: 3, maxItems: 50 },
    instructions: { type: 'array', nullable: false, minItems: 2, maxItems: 30 },
    author: { type: 'string', nullable: true, minLength: 2, maxLength: 100 },
    reviews_rating: { type: 'string', nullable: true, pattern: /^\d(\.\d)?\/5$/ },
    description: { type: 'string', nullable: true, minLength: 10, maxLength: 1000 },
    confidence_score: { type: 'number', nullable: false, min: 0, max: 100 }
  },
  
  wikipedia: {
    title: { type: 'string', nullable: false, minLength: 2, maxLength: 200 },
    url: { type: 'string', nullable: false, pattern: URL_VALIDATION_PATTERN }, // 🆕 ADDED
    main_content_summary: { type: 'string', nullable: false, minLength: 100, maxLength: 5000 },
    category: { type: 'string', nullable: true, minLength: 2, maxLength: 100 },
    links: { type: 'array', nullable: true, minItems: 2, maxItems: 100 },
    images: { type: 'array', nullable: true, minItems: 0, maxItems: 50 },
    confidence_score: { type: 'number', nullable: false, min: 0, max: 100 }
  },
  
  medium: {
    title: { type: 'string', nullable: false, minLength: 5, maxLength: 200 },
    url: { type: 'string', nullable: false, pattern: URL_VALIDATION_PATTERN }, // 🆕 ADDED
    author: { type: 'string', nullable: false, minLength: 2, maxLength: 100 },
    publication_date: { type: 'string', nullable: true, pattern: /^\d{4}-\d{2}-\d{2}$/ },
    main_content_summary: { type: 'string', nullable: true, minLength: 50, maxLength: 5000 },
    description: { type: 'string', nullable: true, minLength: 10, maxLength: 1000 },
    category: { type: 'string', nullable: true, minLength: 2, maxLength: 100 },
    confidence_score: { type: 'number', nullable: false, min: 0, max: 100 }
  },
  
  // 🆕 Generic/Universal schema (used when site type unknown)
  generic: {
    title: { type: 'string', nullable: false, minLength: 2, maxLength: 200 },
    url: { type: 'string', nullable: false, pattern: URL_VALIDATION_PATTERN }, // 🆕 ADDED
    description: { type: 'string', nullable: true, minLength: 10, maxLength: 2000 },
    author: { type: 'string', nullable: true, minLength: 2, maxLength: 100 },
    category: { type: 'string', nullable: true, minLength: 2, maxLength: 100 },
    images: { type: 'array', nullable: true, minItems: 0, maxItems: 50 },
    links: { type: 'array', nullable: true, minItems: 0, maxItems: 100 },
    confidence_score: { type: 'number', nullable: false, min: 0, max: 100 }
  }
};

// ============================================================================
// EXISTING DAY 8 SCHEMA DEFINITIONS - ENHANCED WITH URL
// ============================================================================

const DAY8_VERSION = 'day8-modular-enterprise-v2';

const STANDARD_SCHEMA = {
  title: 'string',
  url: 'string', // 🆕 ADDED - Required for all schemas
  author: 'string',
  publication_date: 'string',
  main_content_summary: 'string',
  category: 'string',
  description: 'string',
  links: 'array',
  images: 'array',
  price: 'string',
  ingredients: 'array',
  instructions: 'array',
  reviews_rating: 'string',
  confidence_score: 'number'
};

const SITE_SPECIFIC_SCHEMAS = {
  amazon: {
    required: ['title', 'url', 'price', 'description'], // 🆕 url added
    optional: ['reviews_rating', 'images', 'category', 'author'],
    nullableFields: ['publication_date', 'ingredients', 'instructions'],
    arrayFields: ['images', 'links'],
    formatValidation: {
      price: /^\$?\d+(\.\d{1,2})?$/,
      reviews_rating: /^\d(\.\d)?\/5$/,
      url: URL_VALIDATION_PATTERN // 🆕 ADDED
    }
  },
  
  allrecipes: {
    required: ['title', 'url', 'ingredients', 'instructions'], // 🆕 url added
    optional: ['author', 'reviews_rating', 'description'],
    nullableFields: ['publication_date', 'price'],
    arrayFields: ['ingredients', 'instructions', 'images'],
    arrayMinimums: {
      ingredients: 3,
      instructions: 2
    },
    formatValidation: {
      url: URL_VALIDATION_PATTERN // 🆕 ADDED
    }
  },
  
  bloomberg: {
    required: ['title', 'url', 'description'], // 🆕 url added
    optional: ['author', 'publication_date', 'category', 'main_content_summary'],
    nullableFields: ['price', 'ingredients', 'instructions', 'reviews_rating'],
    arrayFields: ['links', 'images'],
    formatValidation: {
      publication_date: /^\d{4}-\d{2}-\d{2}$/,
      url: URL_VALIDATION_PATTERN // 🆕 ADDED
    }
  },
  
  wikipedia: {
    required: ['title', 'url', 'main_content_summary'], // 🆕 url added
    optional: ['category', 'links', 'images'],
    nullableFields: ['author', 'publication_date', 'price', 'ingredients', 'instructions', 'reviews_rating'],
    arrayFields: ['links', 'images'],
    arrayMinimums: {
      links: 2
    },
    formatValidation: {
      url: URL_VALIDATION_PATTERN // 🆕 ADDED
    }
  },
  
  medium: {
    required: ['title', 'url', 'author', 'main_content_summary'], // 🆕 url added
    optional: ['publication_date', 'description', 'category'],
    nullableFields: ['price', 'ingredients', 'instructions', 'reviews_rating'],
    arrayFields: ['links', 'images'],
    formatValidation: {
      url: URL_VALIDATION_PATTERN // 🆕 ADDED
    }
  },
  
  generic: {
    required: ['title', 'url'], // 🆕 url added (CRITICAL: All schemas MUST have URL)
    optional: ['description', 'author', 'category'],
    nullableFields: ['publication_date', 'price', 'ingredients', 'instructions', 'reviews_rating'],
    arrayFields: ['links', 'images'],
    formatValidation: {
      url: URL_VALIDATION_PATTERN // 🆕 ADDED
    }
  }
};

const BLOOMBERG_FIELD_MAPPINGS = {
  headline: 'title',
  byline: 'author',
  publishedAt: 'publication_date',
  body: 'main_content_summary',
  summary: 'description',
  topic: 'category',
  link: 'url', // 🆕 ADDED
  href: 'url' // 🆕 ADDED
};

function schemaLogger(level, message, data) {
  if (typeof console !== 'undefined') {
    console[level](`[Schemas] ${message}`, data || '');
  }
}

// ============================================================================
// MAIN SCHEMA MANAGER
// ============================================================================

const SchemaManager = {
  VERSION: DAY21_VERSION,
  
  getStandardSchema() {
    return { ...STANDARD_SCHEMA };
  },
  
  getSiteSchema(siteType) {
    return SITE_SPECIFIC_SCHEMAS[siteType] || SITE_SPECIFIC_SCHEMAS.generic;
  },
  
  validateSchema(data, siteType = 'generic') {
    const schema = this.getSiteSchema(siteType);
    const violations = [];
    
    // Check required fields
    schema.required.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        violations.push({
          field,
          type: 'REQUIRED_FIELD_MISSING',
          severity: 'HIGH',
          message: `Required field '${field}' is missing or empty`
        });
      }
    });
    
    // Validate array types
    if (schema.arrayFields) {
      schema.arrayFields.forEach(field => {
        if (data[field] && !Array.isArray(data[field])) {
          violations.push({
            field,
            type: 'INVALID_TYPE',
            severity: 'HIGH',
            message: `Field '${field}' should be array`
          });
        }
      });
    }
    
    // Validate formats
    if (schema.formatValidation) {
      Object.keys(schema.formatValidation).forEach(field => {
        if (data[field] && !schema.formatValidation[field].test(data[field])) {
          violations.push({
            field,
            type: 'INVALID_FORMAT',
            severity: field === 'url' ? 'HIGH' : 'MEDIUM', // 🆕 URL format errors are HIGH severity
            message: `Field '${field}' has invalid format`
          });
        }
      });
    }
    
    return {
      valid: violations.length === 0,
      violations,
      schemaCompliance: Math.max(0, 100 - (violations.length * 10))
    };
  },
  
  normalizeFieldNames(data, siteType = 'generic') {
    if (siteType === 'bloomberg') {
      return this.applyBloombergMapping(data);
    }
    return data;
  },
  
  applyBloombergMapping(data) {
    const normalized = { ...data };
    Object.keys(BLOOMBERG_FIELD_MAPPINGS).forEach(oldField => {
      if (data[oldField] && !normalized[BLOOMBERG_FIELD_MAPPINGS[oldField]]) {
        normalized[BLOOMBERG_FIELD_MAPPINGS[oldField]] = data[oldField];
        schemaLogger('debug', `Mapped Bloomberg field ${oldField} → ${BLOOMBERG_FIELD_MAPPINGS[oldField]}`);
      }
    });
    return normalized;
  },
  
  fillDefaultValues(data, siteType = 'generic') {
    const filled = { ...data };
    const schema = this.getSiteSchema(siteType);
    
    Object.keys(STANDARD_SCHEMA).forEach(field => {
      if (filled[field] === undefined || filled[field] === null) {
        if (STANDARD_SCHEMA[field] === 'array') {
          filled[field] = [];
        } else if (STANDARD_SCHEMA[field] === 'string') {
          filled[field] = schema.nullableFields?.includes(field) ? null : '';
        } else if (STANDARD_SCHEMA[field] === 'number') {
          filled[field] = 0;
        }
      }
    });
    
    return filled;
  },
  
  calculateFieldCompleteness(data, siteType = 'generic') {
    const schema = this.getSiteSchema(siteType);
    
    const totalRequired = schema.required.length;
    const filledRequired = schema.required.filter(f => {
      const val = data[f];
      return val !== null && val !== undefined && val !== '' && (!Array.isArray(val) || val.length > 0);
    }).length;
    
    const totalOptional = schema.optional?.length || 0;
    const filledOptional = (schema.optional || []).filter(f => {
      const val = data[f];
      return val !== null && val !== undefined && val !== '' && (!Array.isArray(val) || val.length > 0);
    }).length;
    
    return {
      requiredCompleteness: totalRequired > 0 ? (filledRequired / totalRequired) * 100 : 100,
      optionalCompleteness: totalOptional > 0 ? (filledOptional / totalOptional) * 100 : 0,
      overallCompleteness: Math.round(((filledRequired + filledOptional) / (totalRequired + totalOptional)) * 100)
    };
  },
  
  // ============================================================================
  // DAY 10 METHODS - PRESERVED
  // ============================================================================
  
  getFieldTypeDefinition(fieldName, siteType = 'generic') {
    const siteTypes = DAY10_FIELD_TYPES[siteType];
    if (siteTypes && siteTypes[fieldName]) {
      return siteTypes[fieldName];
    }
    // 🆕 Default URL field definition if not found
    if (fieldName === 'url') {
      return { type: 'string', nullable: false, pattern: URL_VALIDATION_PATTERN };
    }
    return { type: 'string', nullable: true };
  },
  
  validateFieldType(fieldName, value, siteType = 'generic') {
    const typeDef = this.getFieldTypeDefinition(fieldName, siteType);
    const violations = [];
    
    if (!typeDef.nullable && (value === null || value === undefined)) {
      violations.push({
        field: fieldName,
        type: 'NULL_VIOLATION',
        severity: 'HIGH',
        message: `Field '${fieldName}' cannot be null`
      });
    }
    
    if (value !== null && value !== undefined) {
      if (typeDef.type === 'string' && typeof value !== 'string') {
        violations.push({
          field: fieldName,
          type: 'TYPE_MISMATCH',
          severity: 'HIGH',
          message: `Field '${fieldName}' must be string, got ${typeof value}`
        });
      }
      
      if (typeDef.type === 'number' && typeof value !== 'number') {
        violations.push({
          field: fieldName,
          type: 'TYPE_MISMATCH',
          severity: 'HIGH',
          message: `Field '${fieldName}' must be number, got ${typeof value}`
        });
      }
      
      if (typeDef.type === 'array' && !Array.isArray(value)) {
        violations.push({
          field: fieldName,
          type: 'TYPE_MISMATCH',
          severity: 'HIGH',
          message: `Field '${fieldName}' must be array, got ${typeof value}`
        });
      }
      
      if (typeDef.type === 'string' && typeof value === 'string') {
        if (typeDef.minLength && value.length < typeDef.minLength) {
          violations.push({
            field: fieldName,
            type: 'MIN_LENGTH',
            severity: 'MEDIUM',
            message: `Too short`
          });
        }
        if (typeDef.maxLength && value.length > typeDef.maxLength) {
          violations.push({
            field: fieldName,
            type: 'MAX_LENGTH',
            severity: 'MEDIUM',
            message: `Too long`
          });
        }
        if (typeDef.pattern && !typeDef.pattern.test(value)) {
          violations.push({
            field: fieldName,
            type: 'PATTERN_MISMATCH',
            severity: fieldName === 'url' ? 'HIGH' : 'HIGH', // 🆕 URL pattern mismatch is HIGH
            message: fieldName === 'url' ? `Invalid URL format` : `Pattern mismatch`
          });
        }
      }
      
      if (typeDef.type === 'array' && Array.isArray(value)) {
        if (typeDef.minItems && value.length < typeDef.minItems) {
          violations.push({
            field: fieldName,
            type: 'MIN_ITEMS',
            severity: 'HIGH',
            message: `Too few items`
          });
        }
        if (typeDef.maxItems && value.length > typeDef.maxItems) {
          violations.push({
            field: fieldName,
            type: 'MAX_ITEMS',
            severity: 'MEDIUM',
            message: `Too many items`
          });
        }
      }
      
      if (typeDef.type === 'number' && typeof value === 'number') {
        if (typeDef.min !== undefined && value < typeDef.min) {
          violations.push({
            field: fieldName,
            type: 'MIN_VALUE',
            severity: 'HIGH',
            message: `Too low`
          });
        }
        if (typeDef.max !== undefined && value > typeDef.max) {
          violations.push({
            field: fieldName,
            type: 'MAX_VALUE',
            severity: 'HIGH',
            message: `Too high`
          });
        }
      }
    }
    
    return violations;
  },
  
  standardizeDatesInData(data, siteType = 'generic') {
    const dateFields = ['publication_date', 'publish_date', 'publishDate', 'date', 'created'];
    const standardized = { ...data };
    
    dateFields.forEach(field => {
      if (standardized[field]) {
        const std = convertToStandardDateDay10(standardized[field]);
        if (std) {
          standardized[field] = std;
          schemaLogger('debug', `Standardized date field '${field}': ${data[field]} → ${std}`);
        }
      }
    });
    
    return standardized;
  },
  
  // 🆕 DAY 21.2: URL Extraction & Validation
  extractAndValidateURL(data, currentPageURL) {
    let url = data.url || data.link || data.href || data.productUrl || data.itemUrl;
    
    // If no URL found, try to extract from links array
    if (!url && Array.isArray(data.links) && data.links.length > 0) {
      url = data.links[0];
    }
    
    // Fallback to current page URL
    if (!url) {
      url = currentPageURL;
      data.url_is_fallback = true;
      schemaLogger('warn', 'No item-specific URL found, using page URL as fallback');
    }
    
    // Convert relative URLs to absolute
    if (url && !url.startsWith('http')) {
      try {
        const baseURL = new URL(currentPageURL);
        url = new URL(url, baseURL.origin).href;
        schemaLogger('debug', `Converted relative URL to absolute: ${url}`);
      } catch (error) {
        schemaLogger('error', 'Failed to convert relative URL', error);
      }
    }
    
    // Validate URL format
    if (url && !URL_VALIDATION_PATTERN.test(url)) {
      schemaLogger('warn', `Invalid URL format: ${url}`);
      data.url_validation_failed = true;
    }
    
    data.url = url;
    return data;
  },
  
  getDay10Status() {
    return {
      version: this.VERSION,
      day10Enhanced: true,
      day21Enhanced: true, // 🆕 ADDED
      features: {
        typeSystem: true,
        dateStandardization: true,
        confidenceScoring: true,
        bloombergMapping: true,
        schemaValidation: true,
        urlEnforcement: true, // 🆕 ADDED
        urlExtraction: true, // 🆕 ADDED
        urlValidation: true // 🆕 ADDED
      },
      supportedSites: Object.keys(DAY10_FIELD_TYPES)
    };
  }
};

console.log('[SchemaManager] Day 21.2 AI ENGINE v1 schema system loaded - Version:', SchemaManager.VERSION);
console.log('[SchemaManager] 🔗 URL field enforcement enabled for all schemas');

// ============================================================================
// EXPORT
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SchemaManager;
} else if (typeof window !== 'undefined') {
  window.SchemaManager = SchemaManager;
}
