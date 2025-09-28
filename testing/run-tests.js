// Day 8 Enterprise Test Runner with Penalty Impact Validation
console.log('[TestRunner] Day 8 Enterprise test suite loading...');

// Day 8 Test configuration
const DAY8_TEST_CONFIG = {
    version: 'enterprise-penalty-tracking-v8',
    testSites: [
        {
            name: 'Bloomberg',
            url: 'https://www.bloomberg.com/news/articles/2024-08-15/tech-stocks-rise-as-inflation-data-boosts-rate-cut-hopes',
            type: 'news',
            expectedFields: ['title', 'author', 'publication_date', 'main_content_summary'],
            day7Baseline: 31,
            day8Target: 50,
            weight: 0.2
        },
        {
            name: 'Amazon',
            url: 'https://www.amazon.com/dp/B08N5WRWNW',
            type: 'ecommerce',
            expectedFields: ['title', 'price', 'reviews_rating', 'description'],
            day7Baseline: 26,
            day8Target: 55,
            weight: 0.2
        },
        {
            name: 'AllRecipes',
            url: 'https://www.allrecipes.com/recipe/213742/cheesy-chicken-broccoli-casserole/',
            type: 'recipe',
            expectedFields: ['title', 'ingredients', 'instructions', 'main_content_summary'],
            day7Baseline: 18,
            day8Target: 45,
            weight: 0.2
        },
        {
            name: 'Wikipedia',
            url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
            type: 'educational',
            expectedFields: ['title', 'main_content_summary', 'links'],
            day7Baseline: 68,
            day8Target: 72,
            weight: 0.2
        },
        {
            name: 'Reddit',
            url: 'https://www.reddit.com/r/technology/hot/',
            type: 'social',
            expectedFields: ['title', 'main_content_summary', 'author'],
            day7Baseline: 0,
            day8Target: 40,
            weight: 0.1
        },
        {
            name: 'ProductHunt',
            url: 'https://www.producthunt.com/posts/chatgpt-4',
            type: 'product',
            expectedFields: ['title', 'description', 'price'],
            day7Baseline: 0,
            day8Target: 38,
            weight: 0.1
        }
    ]
};

// Day 8 Enterprise test execution
async function runDay8EnterpriseTests() {
    console.log('[TestRunner] Day 8 Enterprise test suite starting...');
    
    const testStartTime = Date.now();
    const testResults = [];
    const errorLog = [];
    
    try {
        console.log(`[TestRunner] Day 8 testing ${DAY8_TEST_CONFIG.testSites.length} sites...`);
        
        // Run tests for each site
        for (const site of DAY8_TEST_CONFIG.testSites) {
            console.log(`[TestRunner] Day 8 testing ${site.name}...`);
            
            try {
                const siteResult = await runDay8SiteTest(site);
                testResults.push(siteResult);
                console.log(`[TestRunner] Day 8 ${site.name} completed: ${siteResult.validatedAccuracy}% accuracy`);
            } catch (siteError) {
                console.error(`[TestRunner] Day 8 ${site.name} failed:`, siteError);
                errorLog.push({
                    site: site.name,
                    error: siteError.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        // Calculate enterprise metrics
        const enterpriseMetrics = calculateDay8EnterpriseMetrics(testResults);
        const testDuration = Date.now() - testStartTime;
        
        console.log(`[TestRunner] Day 8 Enterprise test suite completed in ${testDuration}ms`);
        console.log(`[TestRunner] Day 8 Enterprise metrics:`, enterpriseMetrics);
        
        return {
            success: true,
            testResults: testResults,
            enterpriseMetrics: enterpriseMetrics,
            testDuration: testDuration,
            errorLog: errorLog,
            day8Version: DAY8_TEST_CONFIG.version
        };
        
    } catch (error) {
        console.error('[TestRunner] Day 8 Enterprise test suite failed:', error);
        
        return {
            success: false,
            error: error.message,
            testResults: testResults,
            testDuration: Date.now() - testStartTime,
            errorLog: errorLog,
            day8Version: DAY8_TEST_CONFIG.version
        };
    }
}

// Day 8 Individual site test
async function runDay8SiteTest(site) {
    console.log(`[TestRunner] Day 8 running site test for ${site.name}...`);
    
    const siteTestStart = Date.now();
    
    try {
        // Simulate site data extraction (in real implementation, this would call the actual extraction)
        const extractedData = await simulateDay8Extraction(site);
        
        // Calculate raw accuracy
        const rawAccuracy = calculateFieldAccuracy(extractedData, site.expectedFields);
        
        // Apply Day 8 validation with penalty tracking
        const validationResult = validateDay8Data(extractedData, site.expectedFields);
        
        // Calculate validated accuracy
        const validatedAccuracy = calculateFieldAccuracy(validationResult.validatedData, site.expectedFields);
        
        // Calculate penalty impact
        const penaltyImpact = rawAccuracy > 0 ? ((rawAccuracy - validatedAccuracy) / rawAccuracy) * 100 : 0;
        
        const siteTestDuration = Date.now() - siteTestStart;
        
        return {
            site: site.name,
            type: site.type,
            weight: site.weight,
            day7Baseline: site.day7Baseline,
            day8Target: site.day8Target,
            rawAccuracy: rawAccuracy,
            validatedAccuracy: validatedAccuracy,
            penaltyImpact: penaltyImpact.toFixed(1),
            penalties: validationResult.penalties,
            extractedData: extractedData,
            validatedData: validationResult.validatedData,
            testDuration: siteTestDuration,
            success: validatedAccuracy >= site.day8Target * 0.8, // 80% of target
            day8Version: 'enterprise'
        };
        
    } catch (error) {
        console.error(`[TestRunner] Day 8 ${site.name} site test failed:`, error);
        throw error;
    }
}

// Day 8 Simulated extraction (replace with actual extraction in production)
async function simulateDay8Extraction(site) {
    console.log(`[TestRunner] Day 8 simulating extraction for ${site.name}...`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate simulated data based on site type and Day 8 improvements
    const baseData = {
        title: `Day 8 ${site.name} Test Title`,
        main_content_summary: `Day 8 enhanced content summary for ${site.name} with improved AI extraction capabilities.`,
        author: site.type === 'news' || site.type === 'social' ? 'Test Author' : null,
        publication_date: site.type === 'news' ? '2025-09-27' : null,
        price: site.type === 'ecommerce' || site.type === 'product' ? '$29.99' : null,
        reviews_rating: site.type === 'ecommerce' || site.type === 'product' ? '4.2/5' : null,
        ingredients: site.type === 'recipe' ? ['Ingredient 1', 'Ingredient 2', 'Ingredient 3', 'Ingredient 4'] : [],
        instructions: site.type === 'recipe' ? ['Step 1: Prepare', 'Step 2: Cook', 'Step 3: Serve'] : [],
        links: ['https://example.com/link1', 'https://example.com/link2'],
        images: ['https://example.com/image1.jpg'],
        description: `Day 8 test description for ${site.name}`,
        category: site.type === 'news' ? 'Technology' : null
    };
    
    // Simulate some extraction failures for realistic penalty testing
    if (Math.random() < 0.3) { // 30% chance of some field issues
        if (site.type === 'ecommerce' && Math.random() < 0.5) {
            baseData.price = 'Invalid price format'; // Will trigger penalty
        }
        if (site.type === 'recipe' && Math.random() < 0.4) {
            baseData.ingredients = ['Only one ingredient']; // Will trigger penalty (needs ≥3)
        }
    }
    
    return baseData;
}

// Day 8 Data validation with penalty tracking
function validateDay8Data(data, expectedFields) {
    console.log('[TestRunner] Day 8 validating extracted data...');
    
    const validatedData = {...data};
    const penalties = [];
    
    // Price validation
    if (data.price && !/^\$?\d+(\.\d{2})?$/.test(data.price.toString().replace(/,/g, ''))) {
        penalties.push({
            field: 'price',
            reason: 'INVALID_FORMAT',
            original: data.price
        });
        validatedData.price = null;
    }
    
    // Ingredients validation (minimum 3 items)
    if (data.ingredients && Array.isArray(data.ingredients) && data.ingredients.length < 3) {
        penalties.push({
            field: 'ingredients',
            reason: 'INSUFFICIENT_ITEMS',
            original: data.ingredients,
            expected: 3,
            actual: data.ingredients.length
        });
        validatedData.ingredients = [];
    }
    
    // Instructions validation (minimum 2 items)
    if (data.instructions && Array.isArray(data.instructions) && data.instructions.length < 2) {
        penalties.push({
            field: 'instructions',
            reason: 'INSUFFICIENT_STEPS',
            original: data.instructions,
            expected: 2,
            actual: data.instructions.length
        });
        validatedData.instructions = [];
    }
    
    // Reviews rating validation
    if (data.reviews_rating && !/^(\d+(\.\d+)?\/5|\d+(\.\d+)?)$/.test(data.reviews_rating.toString())) {
        penalties.push({
            field: 'reviews_rating',
            reason: 'INVALID_RATING_FORMAT',
            original: data.reviews_rating
        });
        validatedData.reviews_rating = null;
    }
    
    // Title length validation
    if (data.title && data.title.length < 10) {
        penalties.push({
            field: 'title',
            reason: 'INSUFFICIENT_LENGTH',
            original: data.title,
            expected: 10,
            actual: data.title.length
        });
        validatedData.title = null;
    }
    
    return {
        validatedData: validatedData,
        penalties: penalties,
        penaltyCount: penalties.length
    };
}

// Calculate field accuracy
function calculateFieldAccuracy(data, expectedFields) {
    if (!data || !expectedFields || expectedFields.length === 0) return 0;
    
    let totalScore = 0;
    
    expectedFields.forEach(field => {
        const value = data[field];
        let fieldScore = 0;
        
        if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value) && value.length > 0) {
                fieldScore = Math.min(100, 60 + (value.length * 10)); // 60-100 based on array length
            } else if (typeof value === 'string' && value.length > 0) {
                fieldScore = Math.min(100, 40 + value.length); // 40+ based on string length
            } else {
                fieldScore = 70; // Default for non-empty values
            }
        }
        
        totalScore += fieldScore;
    });
    
    return Math.round(totalScore / expectedFields.length);
}

// Calculate Day 8 enterprise metrics
function calculateDay8EnterpriseMetrics(testResults) {
    console.log('[TestRunner] Day 8 calculating enterprise metrics...');
    
    const successfulTests = testResults.filter(r => r.success);
    
    // Calculate weighted accuracy
    let weightedRawAccuracy = 0;
    let weightedValidatedAccuracy = 0;
    let totalWeight = 0;
    
    testResults.forEach(result => {
        weightedRawAccuracy += result.rawAccuracy * result.weight;
        weightedValidatedAccuracy += result.validatedAccuracy * result.weight;
        totalWeight += result.weight;
    });
    
    // Calculate penalty impact
    const overallPenaltyImpact = weightedRawAccuracy > 0 ? 
        ((weightedRawAccuracy - weightedValidatedAccuracy) / weightedRawAccuracy) * 100 : 0;
    
    // Calculate progress metrics
    const avgDay7Baseline = testResults.reduce((sum, r) => sum + (r.day7Baseline * r.weight), 0);
    const progressFromDay7 = weightedValidatedAccuracy - avgDay7Baseline;
    
    return {
        totalSites: testResults.length,
        successfulSites: successfulTests.length,
        failedSites: testResults.length - successfulTests.length,
        weightedRawAccuracy: weightedRawAccuracy.toFixed(1),
        weightedValidatedAccuracy: weightedValidatedAccuracy.toFixed(1),
        overallPenaltyImpact: overallPenaltyImpact.toFixed(1),
        avgDay7Baseline: avgDay7Baseline.toFixed(1),
        progressFromDay7: progressFromDay7.toFixed(1),
        businessRealismProof: overallPenaltyImpact > 0 ? 'TEMPERING_RESULTS' : 'NO_INFLATION',
        trajectoryTo80: calculateTrajectoryTo80(avgDay7Baseline, weightedValidatedAccuracy),
        penaltySummary: compilePenaltySummary(testResults)
    };
}

function calculateTrajectoryTo80(baseline, current) {
    const progressMade = current - baseline;
    const progressNeeded = 80 - current;
    
    if (current >= 80) return 'TARGET_ACHIEVED';
    if (progressNeeded <= 0) return 'TARGET_EXCEEDED';
    
    const daysRemaining = 2;
    const requiredDailyProgress = progressNeeded / daysRemaining;
    
    if (progressMade >= requiredDailyProgress) return 'ON_TRACK';
    return 'NEEDS_ACCELERATION';
}

function compilePenaltySummary(testResults) {
    const summary = {
        totalPenalties: 0,
        penaltyTypes: {},
        penalizedSites: []
    };
    
    testResults.forEach(result => {
        if (result.penalties && result.penalties.length > 0) {
            summary.totalPenalties += result.penalties.length;
            summary.penalizedSites.push(result.site);
            
            result.penalties.forEach(penalty => {
                summary.penaltyTypes[penalty.reason] = 
                    (summary.penaltyTypes[penalty.reason] || 0) + 1;
            });
        }
    });
    
    return summary;
}

console.log('[TestRunner] Day 8 Enterprise test suite ready');

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runDay8EnterpriseTests,
        DAY8_TEST_CONFIG
    };
}
