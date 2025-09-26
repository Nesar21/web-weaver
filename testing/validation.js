// Day 7 Championship Cross-Vertical Validation Engine - OPERATION SURGICAL DATA++

console.log('[Validation] Day 7 SURGICAL Validation Engine - Cross-vertical precision testing');

// Day 7 Enhanced validation schema supporting all cross-vertical fields
const DAY7_VALIDATION_SCHEMA = {
    // Universal fields
    title: { type: 'string', required: true, minLength: 3, maxLength: 200 },
    author: { type: 'string', required: false, minLength: 2, maxLength: 100 },
    publication_date: { type: 'string', required: false, minLength: 4, maxLength: 50 },
    main_content_summary: { type: 'string', required: false, minLength: 10, maxLength: 2000 },
    category: { type: 'string', required: false, minLength: 2, maxLength: 50 },
    description: { type: 'string', required: false, minLength: 5, maxLength: 1000 },
    
    // Array fields
    links: { type: 'array', required: false, maxItems: 20, itemType: 'string' },
    images: { type: 'array', required: false, maxItems: 15, itemType: 'string' },
    ingredients: { type: 'array', required: false, maxItems: 50, itemType: 'string' },
    instructions: { type: 'array', required: false, maxItems: 30, itemType: 'string' },
    
    // Specialized fields
    price: { type: 'string', required: false, pattern: /[\$\€\£¥]?\d+[\.,]?\d*/ },
    reviews_rating: { type: 'string', required: false, minLength: 1, maxLength: 20 }
};

// Day 7 SURGICAL validation function with cross-vertical support
function validateDay7SurgicalExtraction(extractedData, domainType = 'GENERAL') {
    const validationResults = {
        isValid: true,
        score: 0,
        maxScore: 0,
        errors: [],
        warnings: [],
        fieldResults: {},
        domainType: domainType,
        day7Version: 'surgical-validation'
    };

    try {
        console.log(`[Validation] Day 7 SURGICAL validation starting for ${domainType} domain...`);

        // Validate each field in the Day 7 schema
        for (const [fieldName, fieldSchema] of Object.entries(DAY7_VALIDATION_SCHEMA)) {
            const fieldValue = extractedData[fieldName];
            const fieldResult = validateDay7Field(fieldName, fieldValue, fieldSchema, domainType);
            
            validationResults.fieldResults[fieldName] = fieldResult;
            validationResults.maxScore += fieldResult.maxScore;
            validationResults.score += fieldResult.score;

            if (fieldResult.errors.length > 0) {
                validationResults.errors.push(...fieldResult.errors);
            }
            if (fieldResult.warnings.length > 0) {
                validationResults.warnings.push(...fieldResult.warnings);
            }
        }

        // Calculate Day 7 SURGICAL validation score
        validationResults.percentage = validationResults.maxScore > 0 ? 
            Math.round((validationResults.score / validationResults.maxScore) * 100) : 0;

        // Determine overall validation status
        validationResults.isValid = validationResults.errors.length === 0;
        
        // Day 7 domain-specific validation adjustments
        const domainAdjustment = calculateDay7DomainAdjustment(extractedData, domainType);
        validationResults.domainAdjustedScore = Math.min(100, validationResults.percentage + domainAdjustment);

        console.log(`[Validation] Day 7 SURGICAL validation completed: ${validationResults.percentage}% (adjusted: ${validationResults.domainAdjustedScore}%) for ${domainType}`);

        return validationResults;
    } catch (error) {
        console.error('[Validation] Day 7 SURGICAL validation error:', error);
        validationResults.isValid = false;
        validationResults.errors.push({
            type: 'VALIDATION_SYSTEM_ERROR',
            message: error.message,
            timestamp: new Date().toISOString()
        });
        return validationResults;
    }
}

// Day 7 Enhanced field validation with surgical precision
function validateDay7Field(fieldName, fieldValue, fieldSchema, domainType) {
    const result = {
        field: fieldName,
        isValid: true,
        score: 0,
        maxScore: 10, // Base score for each field
        errors: [],
        warnings: [],
        domainRelevance: calculateDay7FieldRelevance(fieldName, domainType)
    };

    try {
        // Adjust max score based on domain relevance
        result.maxScore = result.maxScore * result.domainRelevance;

        // Handle null/undefined values
        if (fieldValue === null || fieldValue === undefined) {
            if (fieldSchema.required) {
                result.errors.push({
                    type: 'REQUIRED_FIELD_MISSING',
                    field: fieldName,
                    message: `Required field '${fieldName}' is missing`
                });
                result.isValid = false;
            }
            return result;
        }

        // Type validation
        if (fieldSchema.type === 'array') {
            if (!Array.isArray(fieldValue)) {
                result.errors.push({
                    type: 'INVALID_TYPE',
                    field: fieldName,
                    message: `Field '${fieldName}' should be an array`
                });
                result.isValid = false;
                return result;
            }
            
            // Array-specific validations
            if (fieldSchema.maxItems && fieldValue.length > fieldSchema.maxItems) {
                result.warnings.push({
                    type: 'ARRAY_TOO_LONG',
                    field: fieldName,
                    message: `Array '${fieldName}' has ${fieldValue.length} items, maximum is ${fieldSchema.maxItems}`
                });
            }

            // Score based on array quality
            if (fieldValue.length > 0) {
                result.score = Math.min(result.maxScore, fieldValue.length * 2);
            }

        } else if (fieldSchema.type === 'string') {
            if (typeof fieldValue !== 'string') {
                result.errors.push({
                    type: 'INVALID_TYPE',
                    field: fieldName,
                    message: `Field '${fieldName}' should be a string`
                });
                result.isValid = false;
                return result;
            }

            // String length validations
            if (fieldSchema.minLength && fieldValue.length < fieldSchema.minLength) {
                result.errors.push({
                    type: 'STRING_TOO_SHORT',
                    field: fieldName,
                    message: `String '${fieldName}' is too short (${fieldValue.length} < ${fieldSchema.minLength})`
                });
                result.isValid = false;
            }

            if (fieldSchema.maxLength && fieldValue.length > fieldSchema.maxLength) {
                result.warnings.push({
                    type: 'STRING_TOO_LONG',
                    field: fieldName,
                    message: `String '${fieldName}' is too long (${fieldValue.length} > ${fieldSchema.maxLength})`
                });
            }

            // Pattern validation for specialized fields
            if (fieldSchema.pattern && !fieldSchema.pattern.test(fieldValue)) {
                result.warnings.push({
                    type: 'PATTERN_MISMATCH',
                    field: fieldName,
                    message: `Field '${fieldName}' doesn't match expected pattern`
                });
            }

            // Score based on string quality
            result.score = calculateDay7StringScore(fieldValue, fieldSchema, fieldName);
        }

        return result;
    } catch (error) {
        console.error(`[Validation] Day 7 field validation error for ${fieldName}:`, error);
        result.errors.push({
            type: 'FIELD_VALIDATION_ERROR',
            field: fieldName,
            message: error.message
        });
        result.isValid = false;
        return result;
    }
}

// Day 7 Calculate field relevance based on domain type
function calculateDay7FieldRelevance(fieldName, domainType) {
    const relevanceMap = {
        NEWS: {
            title: 1.5, author: 1.3, publication_date: 1.3, main_content_summary: 1.4, category: 1.2,
            price: 0.1, ingredients: 0.1, instructions: 0.1, reviews_rating: 0.2,
            links: 1.0, images: 0.8, description: 1.0
        },
        ECOMMERCE: {
            title: 1.4, price: 1.5, reviews_rating: 1.3, description: 1.3, images: 1.2,
            author: 0.3, publication_date: 0.2, ingredients: 0.1, instructions: 0.1,
            main_content_summary: 1.0, category: 1.1, links: 0.8
        },
        RECIPE: {
            title: 1.4, ingredients: 1.5, instructions: 1.5, main_content_summary: 1.2, author: 1.1,
            price: 0.2, reviews_rating: 0.8, publication_date: 0.5,
            description: 1.0, category: 1.0, links: 0.7, images: 1.1
        },
        EDUCATIONAL: {
            title: 1.5, main_content_summary: 1.4, links: 1.3, category: 1.2, images: 1.0,
            author: 0.8, publication_date: 0.6, price: 0.1, ingredients: 0.1, instructions: 0.1,
            reviews_rating: 0.1, description: 1.1
        },
        BLOG: {
            title: 1.5, author: 1.4, publication_date: 1.3, main_content_summary: 1.4, category: 1.1,
            price: 0.2, ingredients: 0.3, instructions: 0.3, reviews_rating: 0.4,
            description: 1.0, links: 1.0, images: 0.9
        },
        WILDCARD: {
            title: 1.3, description: 1.2, main_content_summary: 1.2, category: 1.1,
            author: 1.0, publication_date: 0.8, price: 0.8, reviews_rating: 0.8,
            ingredients: 0.6, instructions: 0.6, links: 1.0, images: 1.0
        }
    };

    return relevanceMap[domainType]?.[fieldName] || 1.0;
}

// Day 7 Calculate string score based on content quality
function calculateDay7StringScore(value, schema, fieldName) {
    let score = 0;
    const maxScore = 10;

    // Base score for having content
    score += 3;

    // Length-based scoring
    if (value.length >= (schema.minLength || 0)) {
        score += 2;
    }
    
    if (value.length >= ((schema.minLength || 0) * 2)) {
        score += 2;
    }

    // Field-specific quality checks
    switch (fieldName) {
        case 'title':
            if (value.length > 15 && !value.toLowerCase().includes('untitled')) score += 2;
            if (!value.toLowerCase().includes('loading') && !value.toLowerCase().includes('error')) score += 1;
            break;
        case 'author':
            if (value.length > 3 && !value.toLowerCase().includes('unknown')) score += 2;
            if (value.includes(' ') || value.includes('.')) score += 1; // Looks like a real name
            break;
        case 'price':
            if (/[\$\€\£]\d+[\.,]?\d*/.test(value)) score += 3;
            break;
        case 'publication_date':
            if (/\d{4}/.test(value)) score += 2; // Contains year
            if (/\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/.test(value)) score += 1; // Full date format
            break;
        case 'main_content_summary':
            if (value.length > 100) score += 1;
            if (value.length > 200) score += 1;
            break;
    }

    return Math.min(maxScore, score);
}

// Day 7 Calculate domain-specific adjustment
function calculateDay7DomainAdjustment(extractedData, domainType) {
    let adjustment = 0;

    switch (domainType) {
        case 'NEWS':
            if (extractedData.author && extractedData.publication_date && extractedData.main_content_summary) {
                adjustment += 5; // Bonus for complete news article
            }
            break;
        case 'ECOMMERCE':
            if (extractedData.price && extractedData.description) {
                adjustment += 5; // Bonus for product with price and description
            }
            if (extractedData.reviews_rating) {
                adjustment += 3; // Bonus for having reviews
            }
            break;
        case 'RECIPE':
            if (extractedData.ingredients && extractedData.instructions && 
                Array.isArray(extractedData.ingredients) && extractedData.ingredients.length > 3 &&
                Array.isArray(extractedData.instructions) && extractedData.instructions.length > 2) {
                adjustment += 8; // Bonus for complete recipe
            }
            break;
        case 'EDUCATIONAL':
            if (extractedData.links && Array.isArray(extractedData.links) && extractedData.links.length > 5) {
                adjustment += 4; // Bonus for rich linking (educational content)
            }
            break;
        case 'BLOG':
            if (extractedData.author && extractedData.publication_date) {
                adjustment += 4; // Bonus for attributed blog post
            }
            break;
    }

    return adjustment;
}

// Day 7 SURGICAL comparison validation (for stress testing)
function compareDay7SurgicalResults(basicResult, aiResult, domainType = 'GENERAL') {
    const comparison = {
        basicValidation: validateDay7SurgicalExtraction(basicResult, domainType),
        aiValidation: validateDay7SurgicalExtraction(aiResult, domainType),
        improvement: 0,
        regressions: [],
        improvements: [],
        day7Version: 'surgical-comparison'
    };

    // Calculate improvement
    comparison.improvement = comparison.aiValidation.domainAdjustedScore - comparison.basicValidation.domainAdjustedScore;

    // Identify field-level changes
    for (const fieldName of Object.keys(DAY7_VALIDATION_SCHEMA)) {
        const basicField = comparison.basicValidation.fieldResults[fieldName];
        const aiField = comparison.aiValidation.fieldResults[fieldName];

        if (basicField && aiField) {
            const fieldImprovement = aiField.score - basicField.score;
            if (fieldImprovement > 1) {
                comparison.improvements.push({
                    field: fieldName,
                    improvement: fieldImprovement,
                    basicScore: basicField.score,
                    aiScore: aiField.score
                });
            } else if (fieldImprovement < -1) {
                comparison.regressions.push({
                    field: fieldName,
                    regression: Math.abs(fieldImprovement),
                    basicScore: basicField.score,
                    aiScore: aiField.score
                });
            }
        }
    }

    return comparison;
}

// Export Day 7 SURGICAL validation functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateDay7SurgicalExtraction,
        compareDay7SurgicalResults,
        DAY7_VALIDATION_SCHEMA
    };
}

console.log('[Validation] Day 7 OPERATION SURGICAL DATA++ Validation Engine loaded - Cross-vertical precision ready');
