// Day 7 Championship Cross-Vertical Data Harvester Engine - REAL TESTING ONLY

console.log('[Background] Day 7 SURGICAL Data Harvester Engine - Real cross-vertical testing FIXED');

// Day 7 AI Configuration
let AI_CONFIG = {
    model: 'gemini-1.5-flash-latest',
    maxTokens: 3000,
    temperature: 0.1,
    apiKey: null
};

// Load API key from storage on startup
chrome.storage.local.get(['geminiApiKey'], (result) => {
    if (result.geminiApiKey) {
        AI_CONFIG.apiKey = result.geminiApiKey;
        console.log('[Background] Day 7 AI key loaded and ready');
    } else {
        console.log('[Background] Day 7 - No API key found, basic extraction only');
    }
});

// Day 7 Enhanced message listener - REAL TESTING ONLY
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(`[Background] Day 7 request received: ${request.action}`);
    
    try {
        switch (request.action) {
            case 'extractPageData':
                handleDay7BasicExtraction(request, sender, sendResponse);
                return true;
                
            case 'extractData':
                handleDay7EnhancedExtraction(request, sender, sendResponse);
                return true;
                
            case 'getIterationLog':
                // 🎯 CRITICAL FIX: Only call REAL testing function
                handleDay7RealCrossVerticalTest(request, sendResponse);
                return true;
                
            case 'setApiKey':
                handleDay7ApiKeySet(request, sendResponse);
                return true;
                
            case 'getApiKey':
                sendResponse({
                    hasKey: !!AI_CONFIG.apiKey,
                    day7Version: true,
                    keyLength: AI_CONFIG.apiKey ? AI_CONFIG.apiKey.length : 0
                });
                return false;
                
            default:
                console.warn(`[Background] Day 7 unknown action: ${request.action}`);
                sendResponse({ success: false, error: 'Unknown action', day7Version: true });
                return false;
        }
    } catch (error) {
        console.error(`[Background] Day 7 critical error handling ${request.action}:`, error);
        sendResponse({
            success: false,
            error: error.message,
            errorType: 'DAY7_CRITICAL_MESSAGE_HANDLER_ERROR',
            timestamp: new Date().toISOString()
        });
        return false;
    }
});

// Day 7 API key handling
function handleDay7ApiKeySet(request, sendResponse) {
    console.log('[Background] Day 7 API key set request received');
    
    if (!request.apiKey || request.apiKey.trim().length === 0) {
        console.error('[Background] Day 7 - No API key provided');
        sendResponse({ success: false, error: 'No API key provided for Day 7', day7Version: true });
        return;
    }

    const apiKey = request.apiKey.trim();
    console.log(`[Background] Day 7 - Saving API key (length: ${apiKey.length})`);
    
    AI_CONFIG.apiKey = apiKey;
    
    chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
        if (chrome.runtime.lastError) {
            console.error('[Background] Day 7 storage error:', chrome.runtime.lastError);
            sendResponse({
                success: false,
                error: `Storage error: ${chrome.runtime.lastError.message}`,
                day7Version: true
            });
        } else {
            console.log('[Background] Day 7 API key saved successfully to storage');
            sendResponse({
                success: true,
                day7Version: true,
                message: 'API key saved successfully',
                keyLength: apiKey.length
            });
        }
    });
}

// Day 7 Enhanced basic extraction
async function handleDay7BasicExtraction(request, sender, sendResponse) {
    try {
        console.log('[Background] Starting Day 7 basic extraction...');
        
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tabs || !tabs[0]) {
            throw new Error('No active tab found');
        }

        const tabId = tabs[0].id;
        console.log(`[Background] Day 7 found active tab: ${tabId}`);

        // Ensure Day 7 content script is injected
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            });
            console.log('[Background] Day 7 content script injected successfully');
        } catch (injectionError) {
            console.warn('[Background] Day 7 content script injection warning:', injectionError.message);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await chrome.tabs.sendMessage(tabId, {
            action: "extractPageData"
        });

        if (response && response.success) {
            console.log('[Background] Day 7 basic extraction successful');
            sendResponse(response);
        } else {
            console.warn('[Background] Day 7 basic extraction returned unsuccessful response');
            sendResponse(response || {
                success: false,
                error: 'No response from Day 7 content script',
                day7Version: true
            });
        }
    } catch (error) {
        console.error('[Background] Day 7 basic extraction error:', error);
        sendResponse({
            success: false,
            error: error.message,
            errorType: 'DAY7_BASIC_EXTRACTION_ERROR',
            timestamp: new Date().toISOString()
        });
    }
}

// Day 7 Enhanced extraction with AI
async function handleDay7EnhancedExtraction(request, sender, sendResponse) {
    try {
        console.log('[Background] Starting Day 7 enhanced extraction...');
        
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tabs || !tabs[0]) {
            throw new Error('No active tab found');
        }

        const tabId = tabs[0].id;
        
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            });
            console.log('[Background] Day 7 content script injected for enhanced extraction');
        } catch (injectionError) {
            console.warn('[Background] Day 7 content script injection warning:', injectionError.message);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        const pageDataResponse = await chrome.tabs.sendMessage(tabId, {
            action: "extractPageData"
        });

        if (!pageDataResponse || !pageDataResponse.success) {
            throw new Error('Failed to get Day 7 page data from content script');
        }

        console.log('[Background] Day 7 page data received, processing with AI...');

        // Day 7 Enhanced Basic extraction
        const basicResult = executeDay7BasicExtraction(pageDataResponse.data);

        // Day 7 Enhanced AI extraction if API key is available
        if (AI_CONFIG.apiKey && AI_CONFIG.apiKey.length > 0) {
            try {
                console.log('[Background] Running Day 7 AI extraction with valid API key...');
                const aiResult = await executeDay7AIExtraction(pageDataResponse.data, AI_CONFIG);
                
                if (aiResult && aiResult.success) {
                    console.log('[Background] Day 7 AI extraction successful');
                    sendResponse(aiResult);
                    return;
                } else {
                    console.warn('[Background] Day 7 AI extraction returned unsuccessful, using basic');
                }
            } catch (aiError) {
                console.warn('[Background] Day 7 AI extraction failed:', aiError.message);
            }
        } else {
            console.log('[Background] Day 7 no valid API key, using enhanced basic extraction');
        }

        sendResponse(basicResult);
    } catch (error) {
        console.error('[Background] Day 7 enhanced extraction error:', error);
        sendResponse({
            success: false,
            error: error.message,
            errorType: 'DAY7_ENHANCED_EXTRACTION_ERROR',
            timestamp: new Date().toISOString()
        });
    }
}

// 🎯 **DAY 7 REAL CROSS-VERTICAL TEST - FIXED VERSION**
async function handleDay7RealCrossVerticalTest(request, sendResponse) {
    console.log('[Background] Day 7 REAL Cross-Vertical Test: Starting surgical validation across real sites...');
    
    const testStartTime = Date.now();
    const errorLog = [];
    
    try {
        // Day 7 REAL test sites with actual URLs - NO SIMULATION
        const testSites = [
            {
                name: 'Bloomberg',
                url: 'https://www.bloomberg.com/news/articles/2024-08-15/tech-stocks-rise-as-inflation-data-boosts-rate-cut-hopes',
                fields: ['title', 'author', 'publication_date', 'main_content_summary', 'category'],
                timeout: 15000
            },
            {
                name: 'Amazon', 
                url: 'https://www.amazon.com/dp/B08N5WRWNW',
                fields: ['title', 'price', 'reviews_rating', 'description', 'images'],
                timeout: 20000
            },
            {
                name: 'AllRecipes',
                url: 'https://www.allrecipes.com/recipe/213742/cheesy-chicken-broccoli-casserole/',
                fields: ['title', 'ingredients', 'instructions', 'main_content_summary'],
                timeout: 15000
            },
            {
                name: 'Wikipedia',
                url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
                fields: ['title', 'main_content_summary', 'links', 'category'],
                timeout: 12000
            },
            {
                name: 'Medium',
                url: 'https://medium.com/javascript-scene/master-the-javascript-interview-what-s-the-difference-between-class-prototypal-inheritance-e4cd0a7562e9',
                fields: ['title', 'author', 'publication_date', 'main_content_summary'],
                timeout: 15000
            }
        ];

        const testResults = [];

        // Day 7 Enhanced CSV headers with real testing data
        const csvHeaders = 'Site,Field,PromptVersion,BasicAccuracy,AIAccuracy,NullReturned,Timestamp,FieldScore,Quality,ErrorType,Day7Target,UsingRealAI,RealSiteTested\n';
        let csvData = csvHeaders;
        const timestamp = new Date().toISOString();

        console.log(`[Background] Day 7 REAL testing: Will test ${testSites.length} actual sites...`);

        // 🎯 REAL CROSS-VERTICAL TESTING - Test each actual site
        for (const site of testSites) {
            console.log(`[Background] Day 7 REAL testing: Starting ${site.name} at ${site.url}...`);
            
            let siteResult = null;
            let testTab = null;
            
            try {
                // Create new tab for this site
                testTab = await chrome.tabs.create({
                    url: site.url,
                    active: false
                });
                console.log(`[Background] Day 7 created tab ${testTab.id} for ${site.name}`);

                // Wait for page load with timeout
                await new Promise((resolve, reject) => {
                    let loadTimeout;
                    let isResolved = false;

                    const onUpdated = (tabId, changeInfo, tab) => {
                        if (tabId === testTab.id && changeInfo.status === 'complete' && !isResolved) {
                            isResolved = true;
                            chrome.tabs.onUpdated.removeListener(onUpdated);
                            if (loadTimeout) clearTimeout(loadTimeout);
                            resolve();
                        }
                    };

                    chrome.tabs.onUpdated.addListener(onUpdated);

                    // Set timeout for page load
                    loadTimeout = setTimeout(() => {
                        if (!isResolved) {
                            isResolved = true;
                            chrome.tabs.onUpdated.removeListener(onUpdated);
                            console.warn(`[Background] Day 7 ${site.name} load timeout, proceeding anyway...`);
                            resolve(); // Don't reject, just proceed
                        }
                    }, site.timeout);
                });

                console.log(`[Background] Day 7 ${site.name} loaded, injecting content script...`);

                // Inject content script
                await chrome.scripting.executeScript({
                    target: { tabId: testTab.id },
                    files: ['content.js']
                });

                // Wait for script initialization
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Extract data from the real site
                const extractionResponse = await chrome.tabs.sendMessage(testTab.id, {
                    action: "extractPageData"
                });

                if (extractionResponse && extractionResponse.success) {
                    console.log(`[Background] Day 7 ${site.name} extraction successful`);

                    // Run Day 7 Basic extraction
                    const basicResult = executeDay7BasicExtraction(extractionResponse.data);

                    // Run Day 7 AI extraction if API key available
                    let aiResult = basicResult;
                    let usingRealAI = false;
                    
                    if (AI_CONFIG.apiKey && AI_CONFIG.apiKey.length > 0 && extractionResponse.data.main_content_summary) {
                        try {
                            console.log(`[Background] Day 7 ${site.name} - attempting AI extraction...`);
                            const aiResponse = await executeDay7AIExtraction(extractionResponse.data, AI_CONFIG);
                            
                            if (aiResponse && aiResponse.success) {
                                aiResult = aiResponse;
                                usingRealAI = aiResponse.metadata?.realAI || false;
                                console.log(`[Background] Day 7 ${site.name} AI extraction: ${usingRealAI ? 'SUCCESS' : 'FALLBACK'}`);
                            }
                        } catch (aiError) {
                            console.warn(`[Background] Day 7 ${site.name} AI extraction failed:`, aiError);
                        }
                    }

                    // Calculate scores for this real site
                    let siteBasicScore = 0;
                    let siteAIScore = 0;
                    
                    for (const field of site.fields) {
                        const basicValue = basicResult.data[field];
                        const aiValue = aiResult.data[field];

                        // Day 7 field scoring
                        const basicScore = calculateDay7FieldScore(basicValue, field);
                        const aiScore = calculateDay7FieldScore(aiValue, field);
                        
                        siteBasicScore += basicScore;
                        siteAIScore += aiScore;

                        // Add to Day 7 CSV with REAL site data
                        csvData += `${site.name},${field},day7-surgical,${basicScore},${aiScore},${!aiValue},"${timestamp}",${aiScore},${getDay7QualityLabel(aiScore)},${!aiValue ? 'MISSING_FIELD' : 'SUCCESS'},surgical-baseline,${usingRealAI},TRUE\n`;
                    }

                    const avgBasicScore = Math.round(siteBasicScore / site.fields.length);
                    const avgAIScore = Math.round(siteAIScore / site.fields.length);

                    siteResult = {
                        site: site.name,
                        url: site.url,
                        basicScore: avgBasicScore,
                        aiScore: avgAIScore,
                        fieldsExtracted: site.fields.filter(f => aiResult.data[f]).length,
                        totalFields: site.fields.length,
                        usingRealAI: usingRealAI,
                        realSiteTested: true
                    };

                    testResults.push(siteResult);
                    console.log(`[Background] Day 7 ${site.name} REAL TEST COMPLETE - Basic: ${avgBasicScore}%, AI: ${avgAIScore}%`);
                } else {
                    throw new Error(`Failed to extract data from real ${site.name} site`);
                }
            } catch (siteError) {
                console.error(`[Background] Day 7 ${site.name} test failed:`, siteError);
                
                // Add error entry to CSV
                for (const field of site.fields) {
                    csvData += `${site.name},${field},day7-surgical,0,0,TRUE,"${timestamp}",0,poor,SITE_TEST_FAILED,surgical-baseline,FALSE,FALSE\n`;
                }

                // Add failed site to results  
                testResults.push({
                    site: site.name,
                    url: site.url,
                    basicScore: 0,
                    aiScore: 0,
                    fieldsExtracted: 0,
                    totalFields: site.fields.length,
                    usingRealAI: false,
                    realSiteTested: false,
                    error: siteError.message
                });

                errorLog.push({
                    type: 'DAY7_REAL_SITE_TEST_ERROR',
                    site: site.name,
                    url: site.url,
                    message: siteError.message,
                    timestamp: new Date().toISOString()
                });
            } finally {
                // Always clean up the test tab
                if (testTab && testTab.id) {
                    try {
                        await chrome.tabs.remove(testTab.id);
                        console.log(`[Background] Day 7 cleaned up tab ${testTab.id} for ${site.name}`);
                    } catch (cleanupError) {
                        console.warn(`[Background] Day 7 cleanup warning for ${site.name}:`, cleanupError);
                    }
                }
            }
        }

        // Calculate Day 7 overall scores from REAL tests  
        const successfulTests = testResults.filter(r => r.realSiteTested);
        const overallBasicScore = successfulTests.length > 0 ? 
            Math.round(successfulTests.reduce((sum, r) => sum + r.basicScore, 0) / successfulTests.length) : 0;
        const overallAIScore = successfulTests.length > 0 ?
            Math.round(successfulTests.reduce((sum, r) => sum + r.aiScore, 0) / successfulTests.length) : 0;

        // Add Day 7 REAL testing summary row
        const usingRealAI = successfulTests.some(r => r.usingRealAI);
        csvData += `OVERALL,summary,day7-surgical,${overallBasicScore},${overallAIScore},false,"${timestamp}",${overallAIScore},${getDay7QualityLabel(overallAIScore)},${successfulTests.length === testSites.length ? 'ALL_SITES_TESTED' : 'PARTIAL_TESTING'},surgical-baseline,${usingRealAI},TRUE\n`;

        console.log(`[Background] Day 7 REAL CROSS-VERTICAL TEST COMPLETE - Overall AI: ${overallAIScore}% from ${successfulTests.length}/${testSites.length} real sites`);

        sendResponse({
            success: true,
            csvData: csvData,
            timestamp: timestamp,
            summary: {
                sitesTestedCount: testSites.length,
                sitesSuccessful: successfulTests.length,
                sitesFailed: testSites.length - successfulTests.length,
                overallBasicScore,
                overallAIScore,
                testDuration: Date.now() - testStartTime,
                errorLog: errorLog,
                siteResults: testResults,
                usingRealAI: usingRealAI,
                day7Version: 'surgical-real-testing',
                realCrossVerticalTest: true,
                apiKeyConfigured: !!(AI_CONFIG.apiKey && AI_CONFIG.apiKey.length > 0)
            }
        });
    } catch (error) {
        const criticalError = {
            type: 'DAY7_REAL_CROSS_VERTICAL_TEST_CRITICAL_ERROR',
            message: `Day 7 real cross-vertical test failed: ${error.message}`,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            testDuration: Date.now() - testStartTime
        };
        errorLog.push(criticalError);
        
        console.error('[Background] Day 7 real cross-vertical test critical error:', error);
        
        sendResponse({
            success: false,
            error: error.message,
            errorLog: errorLog,
            testDuration: Date.now() - testStartTime,
            day7Version: 'surgical-real-testing'
        });
    }
}

// Day 7 Enhanced AI Extraction with CORRECT API endpoint
async function executeDay7AIExtraction(pageData, apiConfig) {
    const startTime = Date.now();
    
    try {
        console.log('[Background] Running Day 7 AI extraction - targeting surgical accuracy...');
        
        if (!apiConfig.apiKey || apiConfig.apiKey.length === 0) {
            throw new Error('Day 7 Gemini API key required for AI extraction');
        }

        const content = pageData.main_content_summary || pageData.content || JSON.stringify(pageData).substring(0, 2000);
        
        const basicInfo = {
            title: pageData.title || '',
            domain: pageData.domain || '',
            url: pageData.url || '',
            strategy: pageData.extractionMetadata?.strategy || 'AUTO'
        };

        // Day 7 Surgical prompt for accurate extraction
        const day7Prompt = `You are a Day 7 surgical data extraction specialist optimizing cross-vertical content extraction. Extract structured data from this web content with high precision.

DAY 7 SURGICAL EXTRACTION SCHEMA:
{
    "title": "string",
    "author": "string",
    "publication_date": "string", 
    "main_content_summary": "string",
    "category": "string",
    "links": ["string"],
    "images": ["string"],
    "description": "string",
    "price": "string",
    "ingredients": ["string"],
    "instructions": ["string"],
    "reviews_rating": "string"
}

DAY 7 SURGICAL RULES FOR PRECISION EXTRACTION:
1. Extract information when 60%+ confident for all fields
2. Use contextual clues, meta tags, and structured data aggressively
3. Return meaningful data or null - no empty strings or placeholder values
4. For arrays (ingredients, instructions, links, images) - include all relevant items found
5. Prioritize accuracy over coverage - better precise data than inaccurate guesses
6. For missing data, look in page title, meta description, and surrounding context
7. Focus on surgical precision for Day 7 baseline establishment

SITE TYPE: ${basicInfo.strategy}
DOMAIN: ${basicInfo.domain}
URL: ${basicInfo.url}
PAGE TITLE: ${basicInfo.title}

CONTENT FOR ANALYSIS:
${content}

Return ONLY valid JSON with the exact schema above. Focus on surgical precision for Day 7 baseline data collection.`;

        const payload = {
            contents: [{
                parts: [{ text: day7Prompt }]
            }],
            generationConfig: {
                temperature: apiConfig.temperature,
                maxOutputTokens: apiConfig.maxTokens,
                responseMimeType: "application/json"
            }
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        console.log(`[Background] Day 7 making API request to: https://generativelanguage.googleapis.com/v1beta/models/${apiConfig.model}:generateContent`);
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${apiConfig.model}:generateContent?key=${apiConfig.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Day7-WebWeaver-Surgical/1.0'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log(`[Background] Day 7 API response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Background] Day 7 API response error:', response.status, errorText);
            throw new Error(`Day 7 Gemini API error: ${response.status} - ${errorText.substring(0, 200)}`);
        }

        const result = await response.json();
        
        if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
            console.error('[Background] Day 7 invalid API response structure:', result);
            throw new Error('Day 7 invalid API response structure');
        }

        const generatedText = result.candidates[0].content.parts[0].text;
        console.log('[Background] Day 7 API response received, parsing JSON...');

        // Parse and validate JSON response with Day 7 precision
        let aiData;
        try {
            aiData = JSON.parse(generatedText);
            if (Array.isArray(aiData)) {
                aiData = aiData[0] || {};
            }
        } catch (parseError) {
            console.warn('[Background] Day 7 JSON parse failed, attempting extraction...');
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    aiData = JSON.parse(jsonMatch[0]);
                } catch (secondParseError) {
                    console.error('[Background] Day 7 second JSON parse also failed');
                    throw new Error('Day 7 failed to parse AI response as JSON');
                }
            } else {
                throw new Error('Day 7 no valid JSON found in AI response');
            }
        }

        // Day 7 Enhanced field validation and completion
        const requiredFields = ['title', 'author', 'publication_date', 'main_content_summary', 'category', 'description', 'links', 'images', 'price', 'ingredients', 'instructions', 'reviews_rating'];
        
        requiredFields.forEach(field => {
            if (!(field in aiData)) {
                aiData[field] = ['links', 'images', 'ingredients', 'instructions'].includes(field) ? [] : null;
            }
            
            // Clean empty strings to null
            if (aiData[field] === '' || aiData[field] === 'null' || aiData[field] === 'N/A' || aiData[field] === 'undefined') {
                aiData[field] = ['links', 'images', 'ingredients', 'instructions'].includes(field) ? [] : null;
            }
        });

        const duration = Date.now() - startTime;
        console.log(`[Background] Day 7 AI extraction completed successfully in ${duration}ms`);

        return {
            success: true,
            data: aiData,
            metadata: {
                model: apiConfig.model,
                extractionTime: duration,
                realAI: true,
                day7Version: 'surgical-precision',
                promptVersion: 'day7-surgical',
                apiKeyLength: apiConfig.apiKey.length
            }
        };
    } catch (error) {
        console.error('[Background] Day 7 AI extraction failed:', error);
        
        // Return Day 7 basic extraction as fallback
        const basicFallback = executeDay7BasicExtraction(pageData);
        
        return {
            success: true,
            data: basicFallback.data,
            metadata: {
                extractionTime: Date.now() - startTime,
                failed: true,
                fallbackUsed: true,
                realAI: false,
                error: error.message,
                day7Version: 'surgical-basic-fallback'
            }
        };
    }
}

// Day 7 Enhanced Basic Extraction
function executeDay7BasicExtraction(pageData) {
    const startTime = Date.now();
    
    try {
        console.log('[Background] Running Day 7 enhanced basic extraction...');
        
        const extractedData = {
            title: pageData.title || null,
            author: pageData.author || null,
            publication_date: pageData.publication_date || null,
            main_content_summary: pageData.main_content_summary || null,
            category: pageData.category || null,
            description: pageData.description || null,
            links: pageData.links || [],
            images: pageData.images || [],
            price: pageData.price || null,
            ingredients: pageData.ingredients || [],
            instructions: pageData.instructions || [],
            reviews_rating: pageData.reviews_rating || null
        };

        console.log('[Background] Day 7 basic extraction completed successfully');
        
        return {
            success: true,
            data: extractedData,
            metadata: {
                extractionTime: Date.now() - startTime,
                method: 'day7-enhanced-basic',
                realAI: false,
                day7Version: 'surgical'
            }
        };
    } catch (error) {
        console.error('[Background] Day 7 basic extraction failed:', error);
        
        return {
            success: false,
            error: error.message,
            data: {},
            metadata: {
                extractionTime: Date.now() - startTime,
                method: 'day7-enhanced-basic',
                realAI: false,
                failed: true,
                day7Version: 'surgical'
            }
        };
    }
}

// Day 7 Enhanced field scoring
function calculateDay7FieldScore(value, fieldType) {
    if (!value || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        return 0;
    }

    // Day 7 field-specific scoring for surgical analysis
    switch (fieldType) {
        case 'title':
            if (typeof value === 'string' && value.length > 15 && !value.toLowerCase().includes('untitled')) return 85;
            if (typeof value === 'string' && value.length > 8) return 70;
            if (typeof value === 'string' && value.length > 3) return 50;
            return 30;
            
        case 'price':
            if (typeof value === 'string' && /[\$\€\£]\d+[\.,]?\d*/.test(value)) return 100;
            if (typeof value === 'string' && /\d+[\.,]?\d*[\$\€\£]/.test(value)) return 90;
            if (typeof value === 'string' && /\d+/.test(value)) return 60;
            return 20;
            
        case 'ingredients':
        case 'instructions':
            if (Array.isArray(value) && value.length > 5) return 100;
            if (Array.isArray(value) && value.length > 3) return 85;
            if (Array.isArray(value) && value.length > 1) return 70;
            if (Array.isArray(value) && value.length > 0) return 50;
            return 10;
            
        case 'author':
            if (typeof value === 'string' && value.length > 8 && !value.toLowerCase().includes('unknown')) return 90;
            if (typeof value === 'string' && value.length > 4) return 70;
            if (typeof value === 'string' && value.length > 1) return 40;
            return 20;
            
        case 'publication_date':
            if (typeof value === 'string' && /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/.test(value)) return 90;
            if (typeof value === 'string' && /\d{4}/.test(value)) return 80;
            if (typeof value === 'string' && /\d+/.test(value)) return 60;
            return 30;
            
        case 'main_content_summary':
            if (typeof value === 'string' && value.length > 200) return 90;
            if (typeof value === 'string' && value.length > 100) return 80;
            if (typeof value === 'string' && value.length > 50) return 70;
            if (typeof value === 'string' && value.length > 20) return 50;
            return 20;
            
        case 'links':
        case 'images':
            if (Array.isArray(value) && value.length > 5) return 100;
            if (Array.isArray(value) && value.length > 2) return 80;
            if (Array.isArray(value) && value.length > 0) return 60;
            return 20;
            
        case 'category':
        case 'description':
            if (typeof value === 'string' && value.length > 30) return 85;
            if (typeof value === 'string' && value.length > 15) return 70;
            if (typeof value === 'string' && value.length > 5) return 50;
            return 30;
            
        default:
            if (typeof value === 'string' && value.length > 30) return 85;
            if (typeof value === 'string' && value.length > 15) return 70;
            if (typeof value === 'string' && value.length > 8) return 60;
            if (typeof value === 'string' && value.length > 3) return 40;
            return 30;
    }
}

// Day 7 quality label for surgical analysis
function getDay7QualityLabel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'partial';
    if (score >= 20) return 'poor';
    return 'failed';
}

console.log('[Background] Day 7 SURGICAL Cross-Vertical Data Harvester Engine ready - REAL cross-vertical testing ONLY');
