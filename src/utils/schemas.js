// Day 10: Schema Utility - AI Engine v1 Enhanced (80% Accuracy Milestone)
// /src/utils/schemas.js - DAY 10 ENHANCED

console.log('[Schemas] Day 10 AI ENGINE v1 loading - Enhanced Type System...');

// ============================================================================
// DAY 10 ENHANCEMENTS - TYPE SYSTEM & DATE STANDARDIZATION
// ============================================================================

const DAY10_VERSION = 'day10-ai-engine-v1-schemas';

// Day 10: Date Format Converter (YYYY-MM-DD)
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

// Day 10: Enhanced Field Type Definitions
const DAY10_FIELD_TYPES = {
  bloomberg: {
    title: { type: 'string', nullable: false, minLength: 5, maxLength: 200 },
    author: { type: 'string', nullable: true, minLength: 2, maxLength: 100 },
    publication_date: { type: 'string', nullable: true, pattern: /^\d{4}-\d{2}-\d{2}$/ },
    main_content_summary: { type: 'string', nullable: true, minLength: 20, maxLength: 2000 },
    category: { type: 'string', nullable: true, minLength: 2, maxLength: 50 },
    description: { type: 'string', nullable: false, minLength: 10, maxLength: 1000 },
    links: { type: 'array', nullable: true, minItems: 0, maxItems: 100 },
    images: { type: 'array', nullable: true, minItems: 0, maxItems: 50 },
    confidence_score: { type: 'number', nullable: false, min: 0, max: 100 }
  },
  amazon: {
    title: { type: 'string', nullable: false, minLength: 5, maxLength: 200 },
    price: { type: 'string', nullable: false, pattern: /^\$?\d+(\.\d{1,2})?$/ },
    description: { type: 'string', nullable: false, minLength: 10, maxLength: 1000 },
    reviews_rating: { type: 'string', nullable: true, pattern: /^\d+(\.\d+)?(\/5)?$/ },
    images: { type: 'array', nullable: true, minItems: 1, maxItems: 50 },
    category: { type: 'string', nullable: true, minLength: 2, maxLength: 100 },
    confidence_score: { type: 'number', nullable: false, min: 0, max: 100 }
  },
  allrecipes: {
    title: { type: 'string', nullable: false, minLength: 5, maxLength: 200 },
    ingredients: { type: 'array', nullable: false, minItems: 3, maxItems: 50 },
    instructions: { type: 'array', nullable: false, minItems: 2, maxItems: 30 },
    author: { type: 'string', nullable: true, minLength: 2, maxLength: 100 },
    reviews_rating: { type: 'string', nullable: true, pattern: /^\d+(\.\d+)?(\/5)?$/ },
    description: { type: 'string', nullable: true, minLength: 10, maxLength: 1000 },
    confidence_score: { type: 'number', nullable: false, min: 0, max: 100 }
  },
  wikipedia: {
    title: { type: 'string', nullable: false, minLength: 2, maxLength: 200 },
    main_content_summary: { type: 'string', nullable: false, minLength: 100, maxLength: 5000 },
    category: { type: 'string', nullable: true, minLength: 2, maxLength: 100 },
    links: { type: 'array', nullable: true, minItems: 2, maxItems: 100 },
    images: { type: 'array', nullable: true, minItems: 0, maxItems: 50 },
    confidence_score: { type: 'number', nullable: false, min: 0, max: 100 }
  },
  medium: {
    title: { type: 'string', nullable: false, minLength: 5, maxLength: 200 },
    author: { type: 'string', nullable: false, minLength: 2, maxLength: 100 },
    publication_date: { type: 'string', nullable: true, pattern: /^\d{4}-\d{2}-\d{2}$/ },
    main_content_summary: { type: 'string', nullable: true, minLength: 50, maxLength: 5000 },
    description: { type: 'string', nullable: true, minLength: 10, maxLength: 1000 },
    category: { type: 'string', nullable: true, minLength: 2, maxLength: 100 },
    confidence_score: { type: 'number', nullable: false, min: 0, max: 100 }
  }
};

// ============================================================================
// EXISTING DAY 8 SCHEMA DEFINITIONS
// ============================================================================

const DAY8_VERSION = 'day8-modular-enterprise-v2';

const STANDARD_SCHEMA = {
  title: 'string',
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
    required: ['title', 'price', 'description'],
    optional: ['reviews_rating', 'images', 'category'],
    nullableFields: ['author', 'publication_date', 'ingredients', 'instructions'],
    arrayFields: ['images', 'links'],
    formatValidation: {
      price: /^\$?\d+(\.\d{1,2})?$/,
      reviews_rating: /^(\d+(\.\d+)?\/5|\d+(\.\d+)?)$/
    }
  },
  allrecipes: {
    required: ['title', 'ingredients', 'instructions'],
    optional: ['author', 'reviews_rating', 'description'],
    nullableFields: ['publication_date', 'price'],
    arrayFields: ['ingredients', 'instructions', 'images'],
    arrayMinimums: { ingredients: 3, instructions: 2 }
  },
  bloomberg: {
    required: ['title', 'description'],
    optional: ['author', 'publication_date', 'category', 'main_content_summary'],
    nullableFields: ['price', 'ingredients', 'instructions', 'reviews_rating'],
    arrayFields: ['links', 'images'],
    formatValidation: {
      publication_date: /\d+/
    }
  },
  wikipedia: {
    required: ['title', 'main_content_summary'],
    optional: ['category', 'links', 'images'],
    nullableFields: ['author', 'publication_date', 'price', 'ingredients', 'instructions', 'reviews_rating'],
    arrayFields: ['links', 'images'],
    arrayMinimums: { links: 2 }
  },
  medium: {
    required: ['title', 'author', 'main_content_summary'],
    optional: ['publication_date', 'description', 'category'],
    nullableFields: ['price', 'ingredients', 'instructions', 'reviews_rating'],
    arrayFields: ['links', 'images']
  },
  generic: {
    required: ['title'],
    optional: ['description', 'author', 'category'],
    nullableFields: ['publication_date', 'price', 'ingredients', 'instructions', 'reviews_rating'],
    arrayFields: ['links', 'images']
  }
};

const BLOOMBERG_FIELD_MAPPINGS = {
  headline: 'title',
  byline: 'author',
  publishedAt: 'publication_date',
  body: 'main_content_summary',
  summary: 'description',
  topic: 'category'
};

function schemaLogger(level, message, data = {}) {
  if (typeof console !== 'undefined') {
    console[level](`[SchemaManager] ${message}`, data);
  }
}

// ============================================================================
// MAIN SCHEMA MANAGER
// ============================================================================

const SchemaManager = {
  VERSION: DAY10_VERSION,
  
  getStandardSchema() {
    return { ...STANDARD_SCHEMA };
  },
  
  getSiteSchema(siteType) {
    return SITE_SPECIFIC_SCHEMAS[siteType] || SITE_SPECIFIC_SCHEMAS.generic;
  },
  
  validateSchema(data, siteType = 'generic') {
    const schema = this.getSiteSchema(siteType);
    const violations = [];
    
    schema.required.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        violations.push({
          field,
          type: 'REQUIRED_FIELD_MISSING',
          severity: 'HIGH',
          message: `Required field '${field}' is missing or empty`
        });
      }
    });
    
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
    
    if (schema.formatValidation) {
      Object.keys(schema.formatValidation).forEach(field => {
        if (data[field] && !schema.formatValidation[field].test(data[field])) {
          violations.push({
            field,
            type: 'INVALID_FORMAT',
            severity: 'MEDIUM',
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
        schemaLogger('debug', `Mapped Bloomberg field: ${oldField} → ${BLOOMBERG_FIELD_MAPPINGS[oldField]}`);
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
  
  // ===== DAY 10 METHODS ADDED HERE =====
  
  getFieldTypeDefinition(fieldName, siteType = 'generic') {
    const siteTypes = DAY10_FIELD_TYPES[siteType];
    if (siteTypes && siteTypes[fieldName]) {
      return siteTypes[fieldName];
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
          violations.push({ field: fieldName, type: 'MIN_LENGTH', severity: 'MEDIUM', message: `Too short` });
        }
        if (typeDef.maxLength && value.length > typeDef.maxLength) {
          violations.push({ field: fieldName, type: 'MAX_LENGTH', severity: 'MEDIUM', message: `Too long` });
        }
        if (typeDef.pattern && !typeDef.pattern.test(value)) {
          violations.push({ field: fieldName, type: 'PATTERN_MISMATCH', severity: 'HIGH', message: `Pattern mismatch` });
        }
      }
      
      if (typeDef.type === 'array' && Array.isArray(value)) {
        if (typeDef.minItems && value.length < typeDef.minItems) {
          violations.push({ field: fieldName, type: 'MIN_ITEMS', severity: 'HIGH', message: `Too few items` });
        }
        if (typeDef.maxItems && value.length > typeDef.maxItems) {
          violations.push({ field: fieldName, type: 'MAX_ITEMS', severity: 'MEDIUM', message: `Too many items` });
        }
      }
      
      if (typeDef.type === 'number' && typeof value === 'number') {
        if (typeDef.min !== undefined && value < typeDef.min) {
          violations.push({ field: fieldName, type: 'MIN_VALUE', severity: 'HIGH', message: `Too low` });
        }
        if (typeDef.max !== undefined && value > typeDef.max) {
          violations.push({ field: fieldName, type: 'MAX_VALUE', severity: 'HIGH', message: `Too high` });
        }
      }
    }
    
    return violations;
  },
  
  standardizeDatesInData(data, siteType = 'generic') {
    const dateFields = ['publication_date', 'publishdate', 'publish_date', 'date', 'created'];
    const standardized = {...data};
    
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
  
  getDay10Status() {
    return {
      version: this.VERSION,
      day10Enhanced: true,
      features: {
        typeSystem: true,
        dateStandardization: true,
        confidenceScoring: true,
        bloombergMapping: true,
        schemaValidation: true
      },
      supportedSites: Object.keys(DAY10_FIELD_TYPES)
    };
  }
};

console.log(`[SchemaManager] Day 10 AI ENGINE v1 schema system loaded - Version: ${SchemaManager.VERSION}`);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SchemaManager;
} else if (typeof window !== 'undefined') {
  window.SchemaManager = SchemaManager;
}

