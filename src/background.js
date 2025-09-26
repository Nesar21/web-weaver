// Day 7 Championship Cross-Vertical Data Harvester Engine - OPERATION SURGICAL DATA++

console.log('[Background] Day 7 SURGICAL Data++ Engine - Real cross-vertical stress testing');

// Day 7 AI Configuration - CRITICAL FIX: Correct model name
let AI_CONFIG = {
    model: 'gemini-1.5-flash', // 🎯 FIXED: Correct model
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

// Day 7 Enhanced message listener - REAL STRESS TESTING
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
                // Legacy support - redirect to stress test
                handleDay7StressTest(request, sendResponse);
                return true;
                
            case 'runStressTest':
                // 🎯 NEW: Operation Surgical Data++ stress test
                handleDay7StressTest(request, sendResponse);
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
                const aiResult = await executeDay7AIExtractionV4(pageDataResponse.data, AI_CONFIG);
                
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

// 🎯 **OPERATION SURGICAL DATA++ - REAL STRESS TEST**
async function handleDay7StressTest(request, sendResponse) {
    console.log('[Background] Day 7 OPERATION SURGICAL DATA++ - Starting real stress test across enemy terrain...');
    
    const testStartTime = Date.now();
    const errorLog = [];
    const jsonlEntries = [];
    
    try {
        // Day 7 STRESS TEST SITES - Real enemy terrain with wildcard
        const stressSites = [
            {
                name: 'Bloomberg',
                url: 'https://www.bloomberg.com/news/articles/2024-08-15/tech-stocks-rise-as-inflation-data-boosts-rate-cut-hopes',
                domain: 'bloomberg.com',
                type: 'news',
                fields: ['title', 'author', 'publication_date', 'main_content_summary', 'category'],
                timeout: 15000
            },
            {
                name: 'Amazon', 
                url: 'https://www.amazon.com/dp/B08N5WRWNW',
                domain: 'amazon.com',
                type: 'ecommerce',
                fields: ['title', 'price', 'reviews_rating', 'description', 'images'],
                timeout: 20000
            },
            {
                name: 'AllRecipes',
                url: 'https://www.allrecipes.com/recipe/213742/cheesy-chicken-broccoli-casserole/',
                domain: 'allrecipes.com',
                type: 'recipe',
                fields: ['title', 'ingredients', 'instructions', 'main_content_summary'],
                timeout: 15000
            },
            {
                name: 'ProductHunt',
                url: 'https://www.producthunt.com/posts/notion-2',
                domain: 'producthunt.com', 
                type: 'wildcard',
                fields: ['title', 'description', 'main_content_summary', 'category'],
                timeout: 15000
            }
        ];

        const stressResults = [];

        // Day 7 JSONL format initialization
        let csvData = 'Site,Field,PromptVersion,BasicAccuracy,AIAccuracy,NullReturned,Timestamp,FieldScore,Quality,ErrorType,Day7Target,UsingRealAI,RealSiteTested\n';
        const timestamp = new Date().toISOString();

        console.log(`[Background] Day 7 STRESS TEST: Will traverse ${stressSites.length} enemy domains...`);

        // 🎯 REAL CROSS-DOMAIN TRAVERSAL - No simulations, only truth
        for (const site of stressSites) {
            console.log(`[Background] Day 7 STRESS TEST: Infiltrating ${site.name} at ${site.domain}...`);
            
            let siteResult = null;
            let testTab = null;
            
            try {
                // Create new tab for enemy domain infiltration
                testTab = await chrome.tabs.create({
                    url: site.url,
                    active: false
                });
                console.log(`[Background] Day 7 created stealth tab ${testTab.id} for ${site.domain}`);

                // Wait for domain load with tactical timeout
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

                    // Set tactical timeout for domain load
                    loadTimeout = setTimeout(() => {
                        if (!isResolved) {
                            isResolved = true;
                            chrome.tabs.onUpdated.removeListener(onUpdated);
                            console.warn(`[Background] Day 7 ${site.domain} load timeout, proceeding with tactical extraction...`);
                            resolve(); // Continue mission
                        }
                    }, site.timeout);
                });

                console.log(`[Background] Day 7 ${site.domain} infiltrated, deploying extraction payload...`);

                // Deploy content script payload
                await chrome.scripting.executeScript({
                    target: { tabId: testTab.id },
                    files: ['content.js']
                });

                // Wait for payload initialization
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Execute data extraction from enemy domain
                const extractionResponse = await chrome.tabs.sendMessage(testTab.id, {
                    action: "extractPageData"
                });

                if (extractionResponse && extractionResponse.success) {
                    console.log(`[Background] Day 7 ${site.domain} extraction successful - data acquired`);

                    // Run Day 7 Basic extraction (tactical baseline)
                    const basicResult = executeDay7BasicExtraction(extractionResponse.data);

                    // Run Day 7 AI extraction with prompt_v4 (strategic enhancement)
                    let aiResult = basicResult;
                    let usingRealAI = false;
                    
                    if (AI_CONFIG.apiKey && AI_CONFIG.apiKey.length > 0 && extractionResponse.data.main_content_summary) {
                        try {
                            console.log(`[Background] Day 7 ${site.domain} - deploying AI enhancement with prompt_v4...`);
                            const aiResponse = await executeDay7AIExtractionV4(extractionResponse.data, AI_CONFIG);
                            
                            if (aiResponse && aiResponse.success) {
                                aiResult = aiResponse;
                                usingRealAI = aiResponse.metadata?.realAI || false;
                                console.log(`[Background] Day 7 ${site.domain} AI enhancement: ${usingRealAI ? 'STRATEGIC SUCCESS' : 'TACTICAL FALLBACK'}`);
                            }
                        } catch (aiError) {
                            console.warn(`[Background] Day 7 ${site.domain} AI enhancement failed:`, aiError);
                        }
                    }

                    // Calculate stress test scores for this domain
                    let siteBasicScore = 0;
                    let siteAIScore = 0;
                    const weakFields = [];
                    
                    for (const field of site.fields) {
                        const basicValue = basicResult.data[field];
                        const aiValue = aiResult.data[field];

                        // Day 7 field scoring with stress test precision
                        const basicScore = calculateDay7FieldScore(basicValue, field);
                        const aiScore = calculateDay7FieldScore(aiValue, field);
                        
                        siteBasicScore += basicScore;
                        siteAIScore += aiScore;

                        // Track weak fields for strategic analysis
                        if (aiScore < 60) {
                            weakFields.push(field);
                        }

                        // Add to Day 7 CSV with REAL domain data
                        csvData += `${site.name},${field},prompt_v4,${basicScore},${aiScore},${!aiValue},"${timestamp}",${aiScore},${getDay7QualityLabel(aiScore)},${!aiValue ? 'MISSING_FIELD' : 'SUCCESS'},stress-test-baseline,${usingRealAI},TRUE\n`;
                    }

                    const avgBasicScore = Math.round(siteBasicScore / site.fields.length);
                    const avgAIScore = Math.round(siteAIScore / site.fields.length);
                    const accuracy = avgAIScore / 100; // Convert to 0-1 scale for JSONL

                    // Create JSONL entry for this domain stress test
                    const jsonlEntry = {
                        timestamp: timestamp,
                        domain: site.domain,
                        site_name: site.name,
                        site_type: site.type,
                        accuracy: accuracy,
                        basic_accuracy: avgBasicScore / 100,
                        ai_accuracy: avgAIScore / 100,
                        weak_fields: weakFields,
                        fields_tested: site.fields.length,
                        fields_extracted: site.fields.filter(f => aiResult.data[f]).length,
                        using_real_ai: usingRealAI,
                        extraction_time: aiResult.metadata?.extractionTime || 0,
                        day7_version: 'surgical-stress-test'
                    };

                    jsonlEntries.push(jsonlEntry);

                    siteResult = {
                        site: site.name,
                        domain: site.domain,
                        url: site.url,
                        type: site.type,
                        basicScore: avgBasicScore,
                        aiScore: avgAIScore,
                        accuracy: accuracy,
                        weakFields: weakFields,
                        fieldsExtracted: site.fields.filter(f => aiResult.data[f]).length,
                        totalFields: site.fields.length,
                        usingRealAI: usingRealAI,
                        realSiteTested: true
                    };

                    stressResults.push(siteResult);
                    console.log(`[Background] Day 7 ${site.domain} STRESS TEST COMPLETE - Basic: ${avgBasicScore}%, AI: ${avgAIScore}%, Weak Fields: [${weakFields.join(', ')}]`);
                } else {
                    throw new Error(`Failed to extract data from enemy domain ${site.domain}`);
                }
            } catch (siteError) {
                console.error(`[Background] Day 7 ${site.domain} stress test failed:`, siteError);
                
                // Add error entries to CSV
                for (const field of site.fields) {
                    csvData += `${site.name},${field},prompt_v4,0,0,TRUE,"${timestamp}",0,failed,DOMAIN_INFILTRATION_FAILED,stress-test-baseline,FALSE,FALSE\n`;
                }

                // Add failed domain to JSONL
                const jsonlEntry = {
                    timestamp: timestamp,
                    domain: site.domain,
                    site_name: site.name,
                    site_type: site.type,
                    accuracy: 0,
                    basic_accuracy: 0,
                    ai_accuracy: 0,
                    weak_fields: site.fields,
                    fields_tested: site.fields.length,
                    fields_extracted: 0,
                    using_real_ai: false,
                    extraction_time: 0,
                    error: siteError.message,
                    day7_version: 'surgical-stress-test-failed'
                };

                jsonlEntries.push(jsonlEntry);

                // Add failed domain to results  
                stressResults.push({
                    site: site.name,
                    domain: site.domain,
                    url: site.url,
                    type: site.type,
                    basicScore: 0,
                    aiScore: 0,
                    accuracy: 0,
                    weakFields: site.fields,
                    fieldsExtracted: 0,
                    totalFields: site.fields.length,
                    usingRealAI: false,
                    realSiteTested: false,
                    error: siteError.message
                });

                errorLog.push({
                    type: 'DAY7_STRESS_TEST_DOMAIN_ERROR',
                    domain: site.domain,
                    site: site.name,
                    url: site.url,
                    message: siteError.message,
                    timestamp: new Date().toISOString()
                });
            } finally {
                // Always extract from enemy domain (stealth cleanup)
                if (testTab && testTab.id) {
                    try {
                        await chrome.tabs.remove(testTab.id);
                        console.log(`[Background] Day 7 extracted from ${site.domain} - stealth tab ${testTab.id} eliminated`);
                    } catch (cleanupError) {
                        console.warn(`[Background] Day 7 extraction warning from ${site.domain}:`, cleanupError);
                    }
                }
            }
        }

        // Calculate Day 7 STRESS TEST overall intelligence
        const successfulDomains = stressResults.filter(r => r.realSiteTested);
        const overallBasicScore = successfulDomains.length > 0 ? 
            Math.round(successfulDomains.reduce((sum, r) => sum + r.basicScore, 0) / successfulDomains.length) : 0;
        const overallAIScore = successfulDomains.length > 0 ?
            Math.round(successfulDomains.reduce((sum, r) => sum + r.aiScore, 0) / successfulDomains.length) : 0;

        // Identify most problematic domains and fields
        const allWeakFields = successfulDomains.flatMap(r => r.weakFields);
        const weakFieldAnalysis = allWeakFields.reduce((acc, field) => {
            acc[field] = (acc[field] || 0) + 1;
            return acc;
        }, {});

        // Add Day 7 STRESS TEST summary row to CSV
        const usingRealAI = successfulDomains.some(r => r.usingRealAI);
        csvData += `OVERALL,summary,prompt_v4,${overallBasicScore},${overallAIScore},false,"${timestamp}",${overallAIScore},${getDay7QualityLabel(overallAIScore)},${successfulDomains.length === stressSites.length ? 'ALL_DOMAINS_INFILTRATED' : 'PARTIAL_INFILTRATION'},stress-test-baseline,${usingRealAI},TRUE\n`;

        // Create JSONL string for auto-save
        const jsonlData = jsonlEntries.map(entry => JSON.stringify(entry)).join('\n');

        console.log(`[Background] Day 7 OPERATION SURGICAL DATA++ COMPLETE - Overall AI: ${overallAIScore}% from ${successfulDomains.length}/${stressSites.length} enemy domains`);
        console.log(`[Background] Day 7 Most problematic fields:`, Object.entries(weakFieldAnalysis).sort((a, b) => b[1] - a[1]).slice(0, 3));

        sendResponse({
            success: true,
            csvData: csvData,
            jsonlData: jsonlData,
            timestamp: timestamp,
            summary: {
                sitesTestedCount: stressSites.length,
                domainsInfiltrated: successfulDomains.length,
                domainsFailed: stressSites.length - successfulDomains.length,
                overallBasicScore,
                overallAIScore,
                testDuration: Date.now() - testStartTime,
                errorLog: errorLog,
                stressResults: stressResults,
                weakFieldAnalysis: weakFieldAnalysis,
                usingRealAI: usingRealAI,
                day7Version: 'surgical-stress-test',
                operationName: 'SURGICAL DATA++',
                realCrossDomainTest: true,
                apiKeyConfigured: !!(AI_CONFIG.apiKey && AI_CONFIG.apiKey.length > 0)
            }
        });
    } catch (error) {
        const criticalError = {
            type: 'DAY7_STRESS_TEST_CRITICAL_ERROR',
            message: `Day 7 OPERATION SURGICAL DATA++ failed: ${error.message}`,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            testDuration: Date.now() - testStartTime
        };
        errorLog.push(criticalError);
        
        console.error('[Background] Day 7 OPERATION SURGICAL DATA++ critical error:', error);
        
        sendResponse({
            success: false,
            error: error.message,
            errorLog: errorLog,
            testDuration: Date.now() - testStartTime,
            day7Version: 'surgical-stress-test-failed'
        });
    }
}

// 🎯 Day 7 Enhanced AI Extraction with PROMPT_V4
async function executeDay7AIExtractionV4(pageData, apiConfig) {
    const startTime = Date.now();
    
    try {
        console.log('[Background] Running Day 7 AI extraction with prompt_v4 - targeting championship accuracy...');
        
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

        // Day 7 Championship Prompt V4 for cross-vertical mastery
        const promptV4 = `You are a championship-grade data extraction specialist with SURGICAL PRECISION capabilities optimized for cross-vertical content analysis. Your mission is to extract structured data from webpage content with balanced accuracy and completeness across news, e-commerce, recipes, educational, and blog content.

ENHANCED EXTRACTION SCHEMA - CROSS-VERTICAL MASTERY:
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

BALANCED EXTRACTION RULES - DAY 7 OPTIMIZATION:
1. Extract information when 70%+ confident (balanced approach vs Day 6 conservatism)
2. Use contextual clues and surrounding elements to infer missing metadata
3. Return null only when genuinely no relevant information exists
4. Prioritize completeness with accuracy over extreme caution
5. For aggregated content pages (homepages), focus SURGICALLY on the MOST PROMINENT or FIRST article only
6. Cross-reference multiple page elements to validate extracted information
7. Adapt extraction strategy based on detected content type

SITE TYPE: ${basicInfo.strategy}
DOMAIN: ${basicInfo.domain}
URL: ${basicInfo.url}
PAGE TITLE: ${basicInfo.title}

CONTENT FOR ANALYSIS:
${content}

Return ONLY valid JSON with the exact schema above. Focus on championship accuracy with balanced completeness for Day 7 stress test baseline.`;

        const payload = {
            contents: [{
                parts: [{ text: promptV4 }]
            }],
            generationConfig: {
                temperature: apiConfig.temperature,
                maxOutputTokens: apiConfig.maxTokens,
                responseMimeType: "application/json"
            }
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        console.log(`[Background] Day 7 making API request with prompt_v4 to: https://generativelanguage.googleapis.com/v1beta/models/${apiConfig.model}:generateContent`);
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${apiConfig.model}:generateContent?key=${apiConfig.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Day7-WebWeaver-SurgicalV4/1.0'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log(`[Background] Day 7 prompt_v4 API response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Background] Day 7 prompt_v4 API response error:', response.status, errorText);
            throw new Error(`Day 7 Gemini API error: ${response.status} - ${errorText.substring(0, 200)}`);
        }

        const result = await response.json();
        
        if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
            console.error('[Background] Day 7 prompt_v4 invalid API response structure:', result);
            throw new Error('Day 7 invalid API response structure');
        }

        const generatedText = result.candidates[0].content.parts[0].text;
        console.log('[Background] Day 7 prompt_v4 API response received, parsing JSON...');

        // Parse and validate JSON response with Day 7 precision
        let aiData;
        try {
            aiData = JSON.parse(generatedText);
            if (Array.isArray(aiData)) {
                aiData = aiData[0] || {};
            }
        } catch (parseError) {
            console.warn('[Background] Day 7 prompt_v4 JSON parse failed, attempting extraction...');
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    aiData = JSON.parse(jsonMatch[0]);
                } catch (secondParseError) {
                    console.error('[Background] Day 7 prompt_v4 second JSON parse also failed');
                    throw new Error('Day 7 failed to parse AI response as JSON');
                }
            } else {
                throw new Error('Day 7 no valid JSON found in AI response');
            }
        }

        // Day 7 Enhanced field validation and completion with prompt_v4 schema
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
        console.log(`[Background] Day 7 prompt_v4 AI extraction completed successfully in ${duration}ms`);

        return {
            success: true,
            data: aiData,
            metadata: {
                model: apiConfig.model,
                extractionTime: duration,
                realAI: true,
                day7Version: 'surgical-precision-v4',
                promptVersion: 'prompt_v4',
                apiKeyLength: apiConfig.apiKey.length
            }
        };
    } catch (error) {
        console.error('[Background] Day 7 prompt_v4 AI extraction failed:', error);
        
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
                day7Version: 'surgical-basic-fallback-v4'
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

console.log('[Background] Day 7 OPERATION SURGICAL DATA++ Engine ready - Real cross-domain stress testing enabled');
