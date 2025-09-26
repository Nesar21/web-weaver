// Day 7 CHAMPIONSHIP Cross-Vertical Validation System with Detailed Error Logging

console.log('🎯 Day 7 Cross-Vertical Validation Engine - Championship Grade with Surgical Error Analysis');

// Enhanced field weights for cross-vertical accuracy calculation
const FIELD_WEIGHTS = {
    // Universal core fields
    'title': 20,
    'author': 15,
    'publication_date': 15,
    'main_content_summary': 15,
    'category': 10,
    'description': 10,
    'links': 5,
    'images': 5,
    
    // E-commerce specific fields (high weight for commerce sites)
    'price': 20,
    'reviews_rating': 15,
    
    // Recipe specific fields (high weight for recipe sites)  
    'ingredients': 25,
    'instructions': 20
};

// Site-specific field expectations with detailed error logging
const SITE_FIELD_EXPECTATIONS = {
    'bloomberg.com': {
        required: ['title', 'author', 'publication_date', 'main_content_summary'],
        optional: ['category', 'description', 'links'],
        siteType: 'news'
    },
    'amazon.com': {
        required: ['title', 'price', 'main_content_summary'],
        optional: ['reviews_rating', 'category', 'description', 'images'],
        siteType: 'ecommerce'
    },
    'allrecipes.com': {
        required: ['title', 'ingredients', 'instructions'],
        optional: ['author', 'main_content_summary', 'category', 'description'],
        siteType: 'recipe'
    },
    'wikipedia.org': {
        required: ['title', 'main_content_summary'],
        optional: ['category', 'description', 'links', 'images'],
        siteType: 'educational'
    },
    'medium.com': {
        required: ['title', 'author', 'main_content_summary'],
        optional: ['publication_date', 'category', 'description'],
        siteType: 'blog'
    }
};

// Error categories for detailed logging
const ERROR_CATEGORIES = {
    EXTRACTION_FAILED: 'extraction_failed',
    INVALID_FORMAT: 'invalid_format', 
    PARTIAL_DATA: 'partial_data',
    MISSING_REQUIRED: 'missing_required',
    LOW_QUALITY: 'low_quality',
    NETWORK_ERROR: 'network_error',
    TIMEOUT_ERROR: 'timeout_error',
    CONTENT_SCRIPT_ERROR: 'content_script_error',
    AI_API_ERROR: 'ai_api_error',
    PARSING_ERROR: 'parsing_error'
};

// Enhanced field scoring with detailed error analysis
function calculateFieldScore(field, extracted, expected, domain, errorLog) {
    const errorContext = {
        field: field,
        domain: domain,
        timestamp: new Date().toISOString(),
        extractedValue: extracted,
        expectedValue: expected
    };
    
    try {
        if (!extracted || extracted === null || extracted === '' || 
            (Array.isArray(extracted) && extracted.length === 0)) {
            
            const error = {
                ...errorContext,
                errorCategory: ERROR_CATEGORIES.MISSING_REQUIRED,
                errorMessage: `Field '${field}' not found or empty`,
                severity: 'high',
                suggestions: [`Check DOM selectors for ${field}`, `Verify ${field} extraction logic`, `Add fallback patterns for ${field}`]
            };
            errorLog.push(error);
            
            return {
                score: 0,
                quality: 'missing',
                reason: `${field} not found`,
                errorCategory: ERROR_CATEGORIES.MISSING_REQUIRED
            };
        }
        
        // Field-specific validation logic with error tracking
        switch (field) {
            case 'title':
                if (typeof extracted !== 'string') {
                    const error = {
                        ...errorContext,
                        errorCategory: ERROR_CATEGORIES.INVALID_FORMAT,
                        errorMessage: `Title must be string, got ${typeof extracted}`,
                        severity: 'medium',
                        suggestions: ['Convert title to string', 'Check title extraction method']
                    };
                    errorLog.push(error);
                    return { score: 30, quality: 'poor', reason: 'Invalid title format' };
                }
                
                if (extracted.length < 5) {
                    const error = {
                        ...errorContext,
                        errorCategory: ERROR_CATEGORIES.LOW_QUALITY,
                        errorMessage: `Title too short: ${extracted.length} characters`,
                        severity: 'medium',
                        suggestions: ['Check for truncated titles', 'Expand title selector patterns']
                    };
                    errorLog.push(error);
                    return { score: 50, quality: 'partial', reason: 'Title too short' };
                }
                
                if (extracted.length > 200) {
                    const error = {
                        ...errorContext,
                        errorCategory: ERROR_CATEGORIES.LOW_QUALITY,
                        errorMessage: `Title too long: ${extracted.length} characters`,
                        severity: 'low',
                        suggestions: ['Trim title to main content', 'Remove site branding from title']
                    };
                    errorLog.push(error);
                    return { score: 80, quality: 'good', reason: 'Title too long but content present' };
                }
                
                return { score: 100, quality: 'excellent', reason: 'Good title extracted' };
                
            case 'price':
                if (typeof extracted !== 'string') {
                    const error = {
                        ...errorContext,
                        errorCategory: ERROR_CATEGORIES.INVALID_FORMAT,
                        errorMessage: `Price must be string, got ${typeof extracted}`,
                        severity: 'high',
                        suggestions: ['Convert price to string format', 'Check price extraction selectors']
                    };
                    errorLog.push(error);
                    return { score: 20, quality: 'poor', reason: 'Invalid price format' };
                }
                
                const pricePattern = /[\$\€\£\¥]?\d+[\.\,]?\d*/;
                if (!pricePattern.test(extracted)) {
                    const error = {
                        ...errorContext,
                        errorCategory: ERROR_CATEGORIES.INVALID_FORMAT,
                        errorMessage: `Price doesn't match expected format: ${extracted}`,
                        severity: 'high',
                        suggestions: ['Add currency symbol detection', 'Expand price pattern matching', 'Check for price ranges']
                    };
                    errorLog.push(error);
                    return { score: 30, quality: 'poor', reason: 'Invalid price format' };
                }
                
                return { score: 100, quality: 'excellent', reason: 'Valid price format' };
                
            case 'ingredients':
                if (!Array.isArray(extracted)) {
                    const error = {
                        ...errorContext,
                        errorCategory: ERROR_CATEGORIES.INVALID_FORMAT,
                        errorMessage: `Ingredients must be array, got ${typeof extracted}`,
                        severity: 'high',
                        suggestions: ['Parse ingredients into array format', 'Check ingredient list selectors']
                    };
                    errorLog.push(error);
                    return { score: 20, quality: 'poor', reason: 'Invalid ingredients format' };
                }
                
                if (extracted.length === 0) {
                    const error = {
                        ...errorContext,
                        errorCategory: ERROR_CATEGORIES.MISSING_REQUIRED,
                        errorMessage: 'Ingredients array is empty',
                        severity: 'high',
                        suggestions: ['Check ingredient list parsing', 'Add fallback ingredient selectors', 'Verify recipe page structure']
                    };
                    errorLog.push(error);
                    return { score: 0, quality: 'missing', reason: 'No ingredients found' };
                }
                
                if (extracted.length < 3) {
                    const error = {
                        ...errorContext,
                        errorCategory: ERROR_CATEGORIES.PARTIAL_DATA,
                        errorMessage: `Only ${extracted.length} ingredients found, recipe likely incomplete`,
                        severity: 'medium',
                        suggestions: ['Check for paginated ingredients', 'Expand ingredient selectors', 'Look for nested ingredient lists']
                    };
                    errorLog.push(error);
                    return { score: 60, quality: 'partial', reason: 'Few ingredients found' };
                }
                
                return { score: 100, quality: 'excellent', reason: 'Ingredients list found' };
                
            case 'instructions':
                if (!Array.isArray(extracted)) {
                    const error = {
                        ...errorContext,
                        errorCategory: ERROR_CATEGORIES.INVALID_FORMAT,
                        errorMessage: `Instructions must be array, got ${typeof extracted}`,
                        severity: 'high',
                        suggestions: ['Parse instructions into array format', 'Check instruction step selectors']
                    };
                    errorLog.push(error);
                    return { score: 20, quality: 'poor', reason: 'Invalid instructions format' };
                }
                
                if (extracted.length === 0) {
                    const error = {
                        ...errorContext,
                        errorCategory: ERROR_CATEGORIES.MISSING_REQUIRED,
                        errorMessage: 'Instructions array is empty',
                        severity: 'high',
                        suggestions: ['Check instruction parsing logic', 'Add fallback instruction selectors', 'Look for method/directions sections']
                    };
                    errorLog.push(error);
                    return { score: 0, quality: 'missing', reason: 'No instructions found' };
                }
                
                return { score: 100, quality: 'excellent', reason: 'Instructions found' };
                
            case 'author':
                if (typeof extracted !== 'string') {
                    const error = {
                        ...errorContext,
                        errorCategory: ERROR_CATEGORIES.INVALID_FORMAT,
                        errorMessage: `Author must be string, got ${typeof extracted}`,
                        severity: 'medium',
                        suggestions: ['Convert author to string', 'Check author extraction method']
                    };
                    errorLog.push(error);
                    return { score: 30, quality: 'poor', reason: 'Invalid author format' };
                }
                
                if (extracted.length < 2) {
                    const error = {
                        ...errorContext,
                        errorCategory: ERROR_CATEGORIES.LOW_QUALITY,
                        errorMessage: `Author name too short: ${extracted}`,
                        severity: 'medium',
                        suggestions: ['Check for truncated author names', 'Look for byline patterns', 'Add author meta tag extraction']
                    };
                    errorLog.push(error);
                    return { score: 30, quality: 'poor', reason: 'Author name too short' };
                }
                
                return { score: 100, quality: 'excellent', reason: 'Valid author name' };
                
            case 'publication_date':
                if (typeof extracted !== 'string') {
                    const error = {
                        ...errorContext,
                        errorCategory: ERROR_CATEGORIES.INVALID_FORMAT,
                        errorMessage: `Publication date must be string, got ${typeof extracted}`,
                        severity: 'medium',
                        suggestions: ['Convert date to string format', 'Check date extraction selectors']
                    };
                    errorLog.push(error);
                    return { score: 30, quality: 'poor', reason: 'Invalid date format' };
                }
                
                const hasYear = /\d{4}/.test(extracted);
                if (!hasYear) {
                    const error = {
                        ...errorContext,
                        errorCategory: ERROR_CATEGORIES.PARTIAL_DATA,
                        errorMessage: `Publication date missing year: ${extracted}`,
                        severity: 'medium',
                        suggestions: ['Add year inference logic', 'Look for complete date patterns', 'Check meta date fields']
                    };
                    errorLog.push(error);
                    return { score: 40, quality: 'partial', reason: 'Partial date information' };
                }
                
                return { score: 100, quality: 'excellent', reason: 'Valid date format' };
                
            case 'reviews_rating':
                if (typeof extracted !== 'string') {
                    const error = {
                        ...errorContext,
                        errorCategory: ERROR_CATEGORIES.INVALID_FORMAT,
                        errorMessage: `Reviews rating must be string, got ${typeof extracted}`,
                        severity: 'medium',
                        suggestions: ['Convert rating to string format', 'Check rating extraction method']
                    };
                    errorLog.push(error);
                    return { score: 30, quality: 'poor', reason: 'Invalid rating format' };
                }
                
                const ratingPattern = /\d+[\.\,]?\d*/;
                if (!ratingPattern.test(extracted)) {
                    const error = {
                        ...errorContext,
                        errorCategory: ERROR_CATEGORIES.INVALID_FORMAT,
                        errorMessage: `Rating doesn't contain numeric value: ${extracted}`,
                        severity: 'medium',
                        suggestions: ['Add numeric rating extraction', 'Look for star ratings', 'Check review score patterns']
                    };
                    errorLog.push(error);
                    return { score: 30, quality: 'poor', reason: 'Invalid rating format' };
                }
                
                return { score: 100, quality: 'excellent', reason: 'Valid rating format' };
                
            default:
                // Generic field validation
                if (typeof extracted === 'string' && extracted.length > 10) {
                    return { score: 100, quality: 'excellent', reason: 'Good content length' };
                } else if (typeof extracted === 'string' && extracted.length > 5) {
                    const error = {
                        ...errorContext,
                        errorCategory: ERROR_CATEGORIES.LOW_QUALITY,
                        errorMessage: `Field content too short: ${extracted.length} characters`,
                        severity: 'low',
                        suggestions: [`Expand ${field} extraction patterns`, `Look for alternative ${field} sources`]
                    };
                    errorLog.push(error);
                    return { score: 60, quality: 'partial', reason: 'Content found but could be better' };
                } else if (Array.isArray(extracted) && extracted.length > 0) {
                    return { score: 90, quality: 'good', reason: 'Array content found' };
                } else {
                    const error = {
                        ...errorContext,
                        errorCategory: ERROR_CATEGORIES.LOW_QUALITY,
                        errorMessage: `Field content insufficient: ${JSON.stringify(extracted)}`,
                        severity: 'medium',
                        suggestions: [`Improve ${field} extraction logic`, `Add fallback patterns for ${field}`]
                    };
                    errorLog.push(error);
                    return { score: 30, quality: 'poor', reason: 'Insufficient content' };
                }
        }
        
    } catch (error) {
        const criticalError = {
            ...errorContext,
            errorCategory: ERROR_CATEGORIES.EXTRACTION_FAILED,
            errorMessage: `Critical error in field scoring: ${error.message}`,
            severity: 'critical',
            suggestions: ['Check field scoring logic', 'Add error handling', 'Review validation code'],
            stackTrace: error.stack
        };
        errorLog.push(criticalError);
        
        return {
            score: 0,
            quality: 'error',
            reason: `Critical validation error: ${error.message}`,
            errorCategory: ERROR_CATEGORIES.EXTRACTION_FAILED
        };
    }
}

// Enhanced validation with comprehensive error logging
function validateExtraction(extractedData, expectedData, domain, extractionErrors = []) {
    console.log(`[Validation] Validating extraction for domain: ${domain}`);
    
    const errorLog = [...extractionErrors]; // Include errors from extraction process
    const siteConfig = SITE_FIELD_EXPECTATIONS[domain] || {
        required: ['title', 'main_content_summary'],
        optional: ['author', 'description', 'category'],
        siteType: 'generic'
    };
    
    const allFields = [...siteConfig.required, ...siteConfig.optional];
    let totalScore = 0;
    let maxPossibleScore = 0;
    const fieldEvaluations = [];
    
    // Validate each expected field
    for (const field of allFields) {
        try {
            const weight = FIELD_WEIGHTS[field] || 5;
            const isRequired = siteConfig.required.includes(field);
            
            const fieldResult = calculateFieldScore(
                field, 
                extractedData[field], 
                expectedData[field], 
                domain, 
                errorLog
            );
            
            // Apply penalty for missing required fields
            let adjustedScore = fieldResult.score;
            if (isRequired && fieldResult.score === 0) {
                adjustedScore = 0;
                const requiredFieldError = {
                    field: field,
                    domain: domain,
                    errorCategory: ERROR_CATEGORIES.MISSING_REQUIRED,
                    errorMessage: `Required field '${field}' is missing for ${siteConfig.siteType} site`,
                    severity: 'critical',
                    suggestions: [
                        `Add ${field} extraction for ${siteConfig.siteType} sites`,
                        `Check ${field} selectors for ${domain}`,
                        `Verify page structure for ${field} content`
                    ],
                    timestamp: new Date().toISOString()
                };
                errorLog.push(requiredFieldError);
            }
            
            totalScore += (adjustedScore * weight / 100);
            maxPossibleScore += weight;
            
            fieldEvaluations.push({
                field: field,
                score: adjustedScore,
                quality: fieldResult.quality,
                reason: fieldResult.reason,
                isRequired: isRequired,
                weight: weight,
                errorCategory: fieldResult.errorCategory || null
            });
            
        } catch (error) {
            const fieldError = {
                field: field,
                domain: domain,
                errorCategory: ERROR_CATEGORIES.EXTRACTION_FAILED,
                errorMessage: `Field evaluation failed: ${error.message}`,
                severity: 'critical',
                suggestions: ['Check field evaluation logic', 'Add error handling for field validation'],
                timestamp: new Date().toISOString(),
                stackTrace: error.stack
            };
            errorLog.push(fieldError);
            
            fieldEvaluations.push({
                field: field,
                score: 0,
                quality: 'error',
                reason: `Evaluation error: ${error.message}`,
                isRequired: siteConfig.required.includes(field),
                weight: FIELD_WEIGHTS[field] || 5,
                errorCategory: ERROR_CATEGORIES.EXTRACTION_FAILED
            });
        }
    }
    
    const overallScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
    
    // Categorize performance
    let performanceClass = 'needs-improvement';
    let performanceDescription = 'Needs Improvement';
    
    if (overallScore >= 90) {
        performanceClass = 'championship';
        performanceDescription = 'Championship Performance';
    } else if (overallScore >= 75) {
        performanceClass = 'excellent';
        performanceDescription = 'Excellent Performance';
    } else if (overallScore >= 60) {
        performanceClass = 'good';
        performanceDescription = 'Good Performance';
    } else if (overallScore >= 40) {
        performanceClass = 'fair';
        performanceDescription = 'Fair Performance';
    }
    
    return {
        overallScore: overallScore,
        performanceClass: performanceClass,
        performanceDescription: performanceDescription,
        fieldEvaluations: fieldEvaluations,
        fieldsEvaluated: allFields.length,
        fieldsSuccessful: fieldEvaluations.filter(f => f.score >= 70).length,
        fieldsPartial: fieldEvaluations.filter(f => f.score >= 30 && f.score < 70).length,
        fieldsMissing: fieldEvaluations.filter(f => f.score < 30).length,
        requiredFieldsMissing: fieldEvaluations.filter(f => f.isRequired && f.score < 30).length,
        siteType: siteConfig.siteType,
        domain: domain,
        errorLog: errorLog,
        errorSummary: {
            totalErrors: errorLog.length,
            criticalErrors: errorLog.filter(e => e.severity === 'critical').length,
            highErrors: errorLog.filter(e => e.severity === 'high').length,
            mediumErrors: errorLog.filter(e => e.severity === 'medium').length,
            lowErrors: errorLog.filter(e => e.severity === 'low').length,
            errorsByCategory: Object.fromEntries(
                Object.values(ERROR_CATEGORIES).map(cat => [
                    cat, 
                    errorLog.filter(e => e.errorCategory === cat).length
                ])
            )
        }
    };
}

// Export for use in background script and testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        validateExtraction, 
        FIELD_WEIGHTS, 
        SITE_FIELD_EXPECTATIONS,
        ERROR_CATEGORIES,
        calculateFieldScore
    };
}

console.log('[Validation] Day 7 Cross-Vertical Validation Engine loaded with surgical error logging');
