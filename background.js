/**
 * Web Weaver Lightning - Background Service Worker
 * Version: 3.5.0 (Day 13 - HYBRID AI INTEGRATION)
 * 
 * 🆕 v3.5 ENHANCEMENTS (DAY 13 - HYBRID AI):
 * - Chrome Built-in AI Summarizer API integration
 * - Chrome Built-in AI Translator API integration
 * - Hybrid postprocessing (Chrome → Gemini Cloud fallback)
 * - Source tracking (_source metadata fields)
 * - Statistics tracking (Chrome vs Cloud usage)
 * 
 * ✅ PRESERVED FROM v3.4:
 * - MULTI/SINGLE_ITEM extraction types
 * - Screenshot capture + Vision API
 * - Natural pagination guidance
 * - prompt_v11_screenshot.txt integration
 * 
 * ✅ PRESERVED FROM v3.2:
 * - Infinite scroll integration (manual trigger)
 * - Visual detection tier tracking
 * - Mode-specific scroll configurations
 * 
 * ✅ PRESERVED FROM v3.1:
 * - Multi-item extraction for ANY website
 * - Universal AI confidence prompt (v10)
 * - Visual confidence tiers (HIGH/GOOD/MEDIUM/LOW)
 * - Domain-specific learning and adjustment
 */

console.log('[Background] 🚀 Web Weaver Lightning v3.5 initializing (HYBRID AI)...');

// ========================================
// GLOBAL STATE
// ========================================
let apiKey = '';
let extractionHistory = [];
let domainConfidenceCache = new Map();
const MAX_HISTORY = 50;

// ========================================
// CONFIG LOADING
// ========================================
const CONFIG = {
  VERSION: '3.5.0-day13-hybrid',
  API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models',
  GEMINI_MODEL: 'gemini-2.0-flash-lite',
  GEMINI_VISION_MODEL: 'gemini-2.0-flash-exp',
  MODES: {
    offline: { id: 'offline', apiCalls: 0, scrolls: 0 },
    min: { id: 'min', apiCalls: 2, scrolls: 2 },
    balanced: { id: 'balanced', apiCalls: 3, scrolls: 3 },
    max: { id: 'max', apiCalls: 4, scrolls: 10 },
    auto: { id: 'auto', apiCalls: 'variable', scrolls: 'adaptive' }
  }
};

// ========================================
// INITIALIZATION
// ========================================
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[Background] Extension installed/updated');
  
  const result = await chrome.storage.local.get([
    'apiKey', 
    'extractionHistory', 
    'domainConfidenceCache',
    'hybridAIStats'
  ]);
  
  if (result.apiKey) {
    apiKey = result.apiKey;
    console.log('[Background] API key loaded from storage');
  }
  
  if (result.extractionHistory) {
    extractionHistory = result.extractionHistory;
    console.log('[Background] Extraction history loaded:', extractionHistory.length, 'entries');
  }
  
  if (result.domainConfidenceCache) {
    domainConfidenceCache = new Map(Object.entries(result.domainConfidenceCache));
    console.log('[Background] Domain confidence cache loaded:', domainConfidenceCache.size, 'domains');
  }
  
  console.log('[Background] ✅ Initialization complete (HYBRID AI ready)');
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('[Background] Service worker started');
  
  const result = await chrome.storage.local.get([
    'apiKey', 
    'extractionHistory', 
    'domainConfidenceCache'
  ]);
  
  if (result.apiKey) apiKey = result.apiKey;
  if (result.extractionHistory) extractionHistory = result.extractionHistory;
  if (result.domainConfidenceCache) {
    domainConfidenceCache = new Map(Object.entries(result.domainConfidenceCache));
  }
  
  console.log('[Background] ✅ Startup complete (HYBRID AI ready)');
});

// ========================================
// MESSAGE LISTENER (ENHANCED FOR HYBRID AI)
// ========================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Background] Message received:', request.action);
  
  (async () => {
    try {
      switch (request.action) {
        case 'saveApiKey':
          await handleSaveApiKey(request.apiKey);
          sendResponse({ success: true });
          break;
        
        case 'getApiKey':
          sendResponse({ success: true, apiKey });
          break;
        
        // 🆕 HYBRID AI: Enhanced extraction with hybrid options
        case 'extractData':
          const result = await handleExtraction(
            request.mode, 
            request.extractionType,
            request.hybridOptions // { summarize: bool, translate: bool, targetLanguage: string }
          );
          sendResponse(result);
          break;
        
        case 'captureScreenshot':
          const screenshotResult = await captureVisibleTab();
          sendResponse(screenshotResult);
          break;
        
        case 'scrollProgress':
          chrome.runtime.sendMessage({
            action: 'scrollProgress',
            scrollCount: request.scrollCount,
            itemCount: request.itemCount
          }).catch(() => {});
          sendResponse({ success: true });
          break;
        
        case 'clearCache':
          await chrome.storage.local.remove([
            'domainConfidenceCache', 
            'extractionHistory',
            'hybridAIStats'
          ]);
          domainConfidenceCache.clear();
          extractionHistory = [];
          console.log('[Background] Cache cleared (including hybrid stats)');
          sendResponse({ success: true });
          break;
        
        case 'getExtractionHistory':
          sendResponse({ success: true, history: extractionHistory });
          break;
        
        // 🆕 HYBRID AI: Get hybrid statistics
        case 'getHybridStats':
          const stats = await getHybridStats();
          sendResponse({ success: true, stats });
          break;
        
        case 'convertToCSV':
          const csvResult = await convertComplexJSONToCSV(request.data, request.apiKey);
          sendResponse(csvResult);
          break;
        
        default:
          console.warn('[Background] Unknown action:', request.action);
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('[Background] Message handler error:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  
  return true;
});

// ========================================
// API KEY MANAGEMENT
// ========================================
async function handleSaveApiKey(key) {
  apiKey = key;
  await chrome.storage.local.set({ apiKey: key });
  console.log('[Background] API key saved');
}

// ========================================
// SCREENSHOT CAPTURE
// ========================================
async function captureVisibleTab() {
  console.log('[Background] 📸 Capturing visible tab screenshot...');
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) throw new Error('No active tab found');
    
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'png'
    });
    
    console.log('[Background] ✅ Screenshot captured successfully');
    
    return {
      success: true,
      dataUrl
    };
  } catch (error) {
    console.error('[Background] ❌ Screenshot capture failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ========================================
// MAIN EXTRACTION HANDLER (ENHANCED FOR HYBRID AI)
// ========================================
async function handleExtraction(mode = 'auto', extractionType = 'MULTI', hybridOptions = {}) {
  console.log('[Background] ═══════════════════════════════════════════════');
  console.log('[Background] EXTRACTION STARTED (HYBRID AI)');
  console.log('[Background] Mode:', mode, '| Type:', extractionType);
  console.log('[Background] Hybrid Options:', hybridOptions);
  console.log('[Background] ═══════════════════════════════════════════════');
  
  const startTime = Date.now();
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) throw new Error('No active tab found');
    
    const url = tab.url;
    const domain = new URL(url).hostname;
    
    console.log('[Background] Target:', domain);
    
    // Route based on extraction type
    if (extractionType === 'SINGLE_ITEM') {
      console.log('[Background] 📄 SINGLE_ITEM extraction - using screenshot + Vision API');
      return await handleSingleItemExtraction(tab, url, domain, mode, startTime, hybridOptions);
    } else {
      console.log('[Background] 📦 MULTI extraction - using DOM + AI');
      return await handleMultiItemExtraction(tab, url, domain, mode, startTime, hybridOptions);
    }
    
  } catch (error) {
    console.error('[Background] ❌ Extraction error:', error);
    return {
      success: false,
      error: error.message,
      errorDetails: error.stack
    };
  }
}

// ========================================
// SINGLE_ITEM EXTRACTION (WITH HYBRID AI)
// ========================================
async function handleSingleItemExtraction(tab, url, domain, mode, startTime, hybridOptions) {
  console.log('[Background] 📸 Starting SINGLE_ITEM extraction with Vision API...');
  
  try {
    // Capture screenshot
    const screenshotResult = await captureVisibleTab();
    if (!screenshotResult.success) {
      throw new Error('Screenshot capture failed: ' + screenshotResult.error);
    }
    
    const screenshot = screenshotResult.dataUrl;
    console.log('[Background] ✅ Screenshot captured');
    
    // Extract with Vision API
    let visionResult = await extractWithVisionAPI(screenshot, domain);
    
    // 🆕 HYBRID AI: Postprocessing with Chrome Built-in AI
    if (hybridOptions.summarize || hybridOptions.translate) {
      console.log('[Background] 🔄 Applying hybrid AI postprocessing...');
      visionResult = await hybridPostprocess(visionResult, hybridOptions);
    }
    
    const duration = Date.now() - startTime;
    const confidence = visionResult.confidence_score || 75;
    const confidenceTier = calculateConfidenceTier(confidence);
    
    // Build metadata
    const metadata = {
      url,
      domain,
      mode,
      extractionType: 'SINGLE_ITEM',
      classification: 'SINGLE_ITEM',
      confidence,
      confidenceTier,
      apiCalls: 1,
      aiUsed: true,
      duration,
      cached: false,
      visionUsed: true,
      screenshotUsed: true,
      naturalPagination: false,
      paginationHint: 'SINGLE_ITEM mode captures one viewport at a time',
      hybridAI: {
        summarizeEnabled: hybridOptions.summarize || false,
        translateEnabled: hybridOptions.translate || false,
        targetLanguage: hybridOptions.targetLanguage || null
      }
    };
    
    // Add to history
    addToHistory({
      timestamp: new Date().toISOString(),
      domain,
      mode,
      confidence,
      tier: confidenceTier,
      classification: 'SINGLE_ITEM'
    });
    
    console.log('[Background] ═══════════════════════════════════════════════');
    console.log('[Background] SINGLE_ITEM EXTRACTION COMPLETE');
    console.log('[Background] Confidence:', confidence + '% (' + confidenceTier + ')');
    console.log('[Background] Duration:', duration + 'ms');
    console.log('[Background] ═══════════════════════════════════════════════');
    
    return {
      success: true,
      data: visionResult,
      metadata
    };
    
  } catch (error) {
    console.error('[Background] ❌ SINGLE_ITEM extraction error:', error);
    throw error;
  }
}

// ========================================
// VISION API EXTRACTION
// ========================================
async function extractWithVisionAPI(screenshotDataUrl, domain) {
  console.log('[Background] 🤖 Extracting data from screenshot with Vision API...');
  
  try {
    const prompt = buildVisionPrompt(domain);
    const base64Image = screenshotDataUrl.split(',')[1];
    
    const response = await fetch(
      `${CONFIG.API_ENDPOINT}/${CONFIG.GEMINI_VISION_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: 'image/png',
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            candidateCount: 1,
            maxOutputTokens: 4096
          }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Vision API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!aiText) throw new Error('Empty Vision API response');
    
    const extracted = extractJsonObject(aiText, 'SINGLE_ITEM');
    const flattened = flattenNestedConfidence(extracted);
    
    console.log('[Background] ✅ Vision API extraction successful');
    return flattened;
    
  } catch (error) {
    console.error('[Background] ❌ Vision API extraction failed:', error);
    throw error;
  }
}

function buildVisionPrompt(domain) {
  return `
You are a web data extraction AI analyzing a screenshot of a webpage.

Extract ALL visible structured data from this screenshot into a JSON object.

CRITICAL REQUIREMENTS:
1. Return a single JSON object (NOT an array)
2. Include "confidence_score" field (0-100)
3. Extract ALL visible fields from the main content area
4. Ignore navigation bars, sidebars, ads, and footers
5. Use descriptive snake_case field names
6. NO explanations, NO markdown, ONLY valid JSON

COMMON FIELD TYPES:
- Articles: title, author, publication_date, summary, category
- Products: product_name, price, description, rating, availability
- Profiles: name, title, company, location, bio
- Posts: author, content, timestamp, likes, comments

CONFIDENCE SCORING:
- 90-100: Clear, readable text extracted accurately
- 70-89: Mostly readable, minor OCR issues
- 50-69: Partially readable or ambiguous content
- 0-49: Difficult to read or uncertain

EXAMPLE OUTPUT:
{
  "title": "Article Title Visible in Screenshot",
  "author": "John Doe",
  "publication_date": "Oct 16, 2025",
  "summary": "First paragraph visible...",
  "confidence_score": 95,
  "confidence_reasoning": "All text clearly visible and readable"
}

EXTRACT NOW - RETURN ONLY THE JSON OBJECT:
`.trim();
}

// ========================================
// MULTI-ITEM EXTRACTION (WITH HYBRID AI)
// ========================================
async function handleMultiItemExtraction(tab, url, domain, mode, startTime, hybridOptions) {
  console.log('[Background] 📦 Starting MULTI extraction with DOM + AI...');
  
  try {
    // Deploy content script
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      console.log('[Background] ✅ Content script deployed');
    } catch (deployError) {
      console.warn('[Background] Content script may already be injected:', deployError.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Extract page data
    console.log('[Background] 📄 Extracting DOM data');
    
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'extractPageData'
    });
    
    if (!response?.success) {
      throw new Error('Content script extraction failed');
    }
    
    const pageData = response.data;
    
    console.log('[Background] ✅ Page data extracted');
    console.log('[Background] Classification:', pageData.pageLayout);
    console.log('[Background] Confidence:', pageData.classificationConfidence + '%');
    
    // Determine if AI is needed
    const needsAI = mode !== 'offline' && 
      (pageData.classificationConfidence < 80 || mode === 'max' || mode === 'balanced');
    
    let extractedData;
    let aiUsed = false;
    let apiCalls = 0;
    let confidence = pageData.classificationConfidence;
    let confidenceTier = 'MEDIUM';
    
    if (needsAI && apiKey) {
      console.log('[Background] 🤖 AI extraction required');
      
      const prompt = buildUniversalPromptV10(
        pageData.pageLayout, 
        pageData.domDetails.repeatedBlocksCount || 0
      );
      
      const aiResult = await extractWithAI(pageData.mainText, prompt, pageData.pageLayout);
      
      extractedData = aiResult;
      aiUsed = true;
      apiCalls = Array.isArray(aiResult) ? aiResult.length : 1;
      
      if (Array.isArray(aiResult)) {
        const scores = aiResult.map(item => item.confidence_score || 50);
        confidence = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      } else {
        confidence = aiResult.confidence_score || 50;
      }
      
      console.log('[Background] ✅ AI extraction complete | Confidence:', confidence + '%');
      
      // 🆕 HYBRID AI: Postprocessing with Chrome Built-in AI
      if (hybridOptions.summarize || hybridOptions.translate) {
        console.log('[Background] 🔄 Applying hybrid AI postprocessing...');
        extractedData = await hybridPostprocess(extractedData, hybridOptions);
      }
      
    } else {
      console.log('[Background] 📦 DOM-only extraction');
      
      extractedData = {
        title: pageData.title,
        description: pageData.metaDescription,
        url: pageData.url,
        mainContent: pageData.mainText.substring(0, 1000),
        links: pageData.links.slice(0, 10),
        images: pageData.images.slice(0, 5),
        confidence_score: confidence,
        confidence_reasoning: 'DOM extraction only - no AI analysis'
      };
      apiCalls = 0;
    }
    
    confidenceTier = calculateConfidenceTier(confidence);
    updateDomainConfidence(domain, confidence, pageData.pageLayout);
    
    const duration = Date.now() - startTime;
    const metadata = {
      url,
      domain,
      mode,
      extractionType: 'MULTI',
      classification: pageData.pageLayout,
      confidence,
      confidenceTier,
      apiCalls,
      aiUsed,
      duration,
      cached: false,
      domConfidence: pageData.classificationConfidence,
      domainAdjustment: getDomainAdjustment(domain),
      naturalPagination: true,
      paginationHint: 'Scroll or click "Next Page" to load more items, then extract again',
      detectionTier: pageData.tier || 'dom',
      visualDetectionUsed: pageData.tier === 'visual',
      hybridAI: {
        summarizeEnabled: hybridOptions.summarize || false,
        translateEnabled: hybridOptions.translate || false,
        targetLanguage: hybridOptions.targetLanguage || null
      }
    };
    
    addToHistory({
      timestamp: new Date().toISOString(),
      domain,
      mode,
      confidence,
      tier: confidenceTier,
      classification: pageData.pageLayout
    });
    
    console.log('[Background] ═══════════════════════════════════════════════');
    console.log('[Background] MULTI EXTRACTION COMPLETE');
    console.log('[Background] Confidence:', confidence + '% (' + confidenceTier + ')');
    console.log('[Background] Duration:', duration + 'ms');
    console.log('[Background] API Calls:', apiCalls);
    console.log('[Background] ═══════════════════════════════════════════════');
    
    return {
      success: true,
      data: extractedData,
      metadata
    };
    
  } catch (error) {
    console.error('[Background] ❌ MULTI extraction error:', error);
    throw error;
  }
}

// ========================================
// 🆕 HYBRID AI POSTPROCESSING (INLINE)
// ========================================
async function hybridPostprocess(extractedData, options = {}) {
  const startTime = Date.now();
  
  console.log('[Background] 🎯 HYBRID POSTPROCESSING STARTED');
  console.log('[Background] Options:', {
    summarize: options.summarize,
    translate: options.translate,
    targetLanguage: options.targetLanguage,
  });
  
  // Handle both single item and multi-item data
  const isArray = Array.isArray(extractedData);
  const items = isArray ? extractedData : [extractedData];
  
  const processedItems = [];
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const enhancedItem = { ...item };
    
    console.log(`[Background] Processing item ${i + 1}/${items.length}...`);
    
    // SUMMARIZATION
    if (options.summarize) {
      console.log('[Background] Summarization requested');
      
      const fieldsToSummarize = [];
      
      for (const [key, value] of Object.entries(item)) {
        if (typeof value === 'string' && value.length > 200) {
          if (!key.endsWith('_summary') && !key.endsWith('_translated')) {
            fieldsToSummarize.push({ key, value });
          }
        }
      }
      
      console.log(`[Background] Found ${fieldsToSummarize.length} fields to summarize`);
      
      for (const field of fieldsToSummarize) {
        const summaryResult = await hybridSummarize(field.value, {
          type: 'key-points',
          format: 'markdown',
          length: 'medium',
        });
        
        if (summaryResult.success) {
          enhancedItem[`${field.key}_summary`] = summaryResult.summary;
          enhancedItem[`${field.key}_summary_source`] = summaryResult.source;
          console.log(`[Background] ✅ Summarized '${field.key}' using ${summaryResult.source}`);
          
          await updateHybridStats('summarize', summaryResult.source);
        } else {
          console.log(`[Background] ⚠️ Failed to summarize '${field.key}': ${summaryResult.error || summaryResult.reason}`);
        }
      }
    }
    
    // TRANSLATION
    if (options.translate && options.targetLanguage) {
      console.log(`[Background] Translation requested (target: ${options.targetLanguage})`);
      
      const fieldsToTranslate = [];
      
      for (const [key, value] of Object.entries(item)) {
        if (typeof value === 'string' && value.length > 0) {
          if (!key.endsWith('_translated') && 
              !key.endsWith('_source') && 
              !key.includes('url') && 
              !key.includes('link') &&
              !key.includes('id')) {
            fieldsToTranslate.push({ key, value });
          }
        }
      }
      
      console.log(`[Background] Found ${fieldsToTranslate.length} fields to translate`);
      
      for (const field of fieldsToTranslate) {
        const translationResult = await hybridTranslate(field.value, {
          sourceLanguage: 'en',
          targetLanguage: options.targetLanguage,
        });
        
        if (translationResult.success) {
          enhancedItem[`${field.key}_${options.targetLanguage}`] = translationResult.translatedText;
          enhancedItem[`${field.key}_${options.targetLanguage}_source`] = translationResult.source;
          console.log(`[Background] ✅ Translated '${field.key}' using ${translationResult.source}`);
          
          await updateHybridStats('translate', translationResult.source);
        } else {
          console.log(`[Background] ⚠️ Failed to translate '${field.key}': ${translationResult.error || translationResult.reason}`);
        }
      }
    }
    
    processedItems.push(enhancedItem);
  }
  
  const result = isArray ? processedItems : processedItems[0];
  
  console.log('[Background] ✅ Hybrid postprocessing complete in', Date.now() - startTime, 'ms');
  
  return result;
}

// ========================================
// 🆕 HYBRID SUMMARIZATION (TRY CHROME → FALLBACK CLOUD)
// ========================================
async function hybridSummarize(text, options = {}) {
  const startTime = Date.now();
  
  console.log('[Background] Starting hybrid summarization...');
  
  if (!text || typeof text !== 'string' || text.length < 100) {
    console.log('[Background] Text too short for summarization, skipping');
    return {
      success: false,
      summary: text,
      reason: 'TEXT_TOO_SHORT',
      duration: Date.now() - startTime,
      source: 'none',
    };
  }
  
  try {
    // STEP 1: Try Chrome Built-in Summarizer API
    if ('Summarizer' in self) {
      console.log('[Background] Attempting Chrome Built-in Summarizer...');
      
      const summarizerAvailability = await Summarizer.availability();
      
      if (summarizerAvailability === 'readily' || summarizerAvailability === 'available') {
        const summarizer = await Summarizer.create({
          type: options.type || 'key-points',
          format: options.format || 'markdown',
          length: options.length || 'medium',
          sharedContext: options.context || '',
        });
        
        const summary = await summarizer.summarize(text);
        
        console.log('[Background] ✅ Chrome Built-in Summarizer succeeded in', Date.now() - startTime, 'ms');
        
        return {
          success: true,
          summary: summary,
          originalLength: text.length,
          summaryLength: summary.length,
          compressionRatio: (summary.length / text.length * 100).toFixed(1) + '%',
          duration: Date.now() - startTime,
          source: 'chrome_builtin',
          method: 'on-device',
        };
      } else {
        console.log(`[Background] Chrome Summarizer status: ${summarizerAvailability} (not available)`);
      }
    } else {
      console.log('[Background] Chrome Summarizer API not found in browser');
    }
    
  } catch (error) {
    console.log('[Background] Chrome Built-in Summarizer failed:', error.message);
  }
  
  // STEP 2: Fallback to Gemini Cloud API
  console.log('[Background] Falling back to Gemini Cloud API for summarization');
  return await summarizeWithGeminiCloud(text, options);
}

// ========================================
// 🆕 GEMINI CLOUD SUMMARIZATION FALLBACK
// ========================================
async function summarizeWithGeminiCloud(text, options = {}) {
  const startTime = Date.now();
  
  try {
    console.log('[Background] Using Gemini Cloud API for summarization (fallback)');
    
    const prompt = `Summarize the following text in 2-3 concise key points using markdown formatting:

${text}

Provide ONLY the summary, no explanations.`;

    const response = await fetch(
      `${CONFIG.API_ENDPOINT}/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const summary = data.candidates[0].content.parts[0].text.trim();

    console.log('[Background] ✅ Gemini Cloud summarization complete in', Date.now() - startTime, 'ms');

    return {
      success: true,
      summary: summary,
      originalLength: text.length,
      summaryLength: summary.length,
      compressionRatio: (summary.length / text.length * 100).toFixed(1) + '%',
      duration: Date.now() - startTime,
      source: 'gemini_cloud_fallback',
    };

  } catch (error) {
    console.error('[Background] ❌ Gemini Cloud summarization failed:', error.message);
    
    return {
      success: false,
      summary: null,
      error: error.message,
      duration: Date.now() - startTime,
      source: 'gemini_cloud_error',
    };
  }
}

// ========================================
// 🆕 HYBRID TRANSLATION (TRY CHROME → FALLBACK CLOUD)
// ========================================
async function hybridTranslate(text, options = {}) {
  const startTime = Date.now();
  
  console.log('[Background] Starting hybrid translation...');
  
  if (!text || typeof text !== 'string') {
    return {
      success: false,
      translatedText: null,
      error: 'Invalid text input',
      duration: Date.now() - startTime,
      source: 'none',
    };
  }
  
  const sourceLanguage = options.sourceLanguage || 'en';
  const targetLanguage = options.targetLanguage;
  
  if (!targetLanguage) {
    return {
      success: false,
      translatedText: null,
      error: 'Target language required',
      duration: Date.now() - startTime,
      source: 'none',
    };
  }
  
  if (sourceLanguage === targetLanguage) {
    return {
      success: false,
      translatedText: text,
      reason: 'SAME_LANGUAGE',
      duration: Date.now() - startTime,
      source: 'none',
    };
  }
  
  try {
    // STEP 1: Try Chrome Built-in Translator API
    if ('Translator' in self) {
      console.log(`[Background] Attempting Chrome Built-in Translator (${sourceLanguage} → ${targetLanguage})...`);
      
      const translatorAvailability = await Translator.availability({
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
      });
      
      if (translatorAvailability === 'readily' || translatorAvailability === 'available') {
        const translator = await Translator.create({
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLanguage,
        });
        
        const translatedText = await translator.translate(text);
        
        console.log('[Background] ✅ Chrome Built-in Translator succeeded in', Date.now() - startTime, 'ms');
        
        return {
          success: true,
          translatedText: translatedText,
          originalText: text,
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLanguage,
          originalLength: text.length,
          translatedLength: translatedText.length,
          duration: Date.now() - startTime,
          source: 'chrome_builtin',
          method: 'on-device',
        };
      } else {
        console.log(`[Background] Chrome Translator status: ${translatorAvailability} (not available)`);
      }
    } else {
      console.log('[Background] Chrome Translator API not found in browser');
    }
    
  } catch (error) {
    console.log('[Background] Chrome Built-in Translator failed:', error.message);
  }
  
  // STEP 2: Fallback to Gemini Cloud API
  console.log('[Background] Falling back to Gemini Cloud API for translation');
  return await translateWithGeminiCloud(text, options);
}

// ========================================
// 🆕 GEMINI CLOUD TRANSLATION FALLBACK
// ========================================
async function translateWithGeminiCloud(text, options = {}) {
  const startTime = Date.now();
  
  try {
    const targetLanguage = options.targetLanguage || 'es';
    const languageNames = {
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ja: 'Japanese',
      zh: 'Chinese',
      ar: 'Arabic',
      hi: 'Hindi',
    };
    
    const targetLanguageName = languageNames[targetLanguage] || targetLanguage;
    
    console.log(`[Background] Using Gemini Cloud API for translation to ${targetLanguageName} (fallback)`);
    
    const prompt = `Translate the following text to ${targetLanguageName}. Provide ONLY the translation, no explanations:

${text}`;

    const response = await fetch(
      `${CONFIG.API_ENDPOINT}/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2000,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.candidates[0].content.parts[0].text.trim();

    console.log('[Background] ✅ Gemini Cloud translation complete in', Date.now() - startTime, 'ms');

    return {
      success: true,
      translatedText: translatedText,
      originalText: text,
      sourceLanguage: 'en',
      targetLanguage: targetLanguage,
      originalLength: text.length,
      translatedLength: translatedText.length,
      duration: Date.now() - startTime,
      source: 'gemini_cloud_fallback',
    };

  } catch (error) {
    console.error('[Background] ❌ Gemini Cloud translation failed:', error.message);
    
    return {
      success: false,
      translatedText: null,
      error: error.message,
      duration: Date.now() - startTime,
      source: 'gemini_cloud_error',
    };
  }
}

// ========================================
// 🆕 HYBRID AI STATISTICS
// ========================================
async function getHybridStats() {
  try {
    const stats = await chrome.storage.local.get('hybridAIStats');
    
    return stats.hybridAIStats || {
      totalSummarizations: 0,
      totalTranslations: 0,
      chromeBuiltinUsage: {
        summarizations: 0,
        translations: 0,
      },
      geminiCloudUsage: {
        summarizations: 0,
        translations: 0,
      },
      lastUsed: null,
    };
  } catch (error) {
    console.error('[Background] Error getting hybrid stats:', error);
    return null;
  }
}

async function updateHybridStats(operation, source) {
  try {
    const stats = await getHybridStats();
    
    if (operation === 'summarize') {
      stats.totalSummarizations++;
      if (source === 'chrome_builtin') {
        stats.chromeBuiltinUsage.summarizations++;
      } else if (source === 'gemini_cloud_fallback') {
        stats.geminiCloudUsage.summarizations++;
      }
    } else if (operation === 'translate') {
      stats.totalTranslations++;
      if (source === 'chrome_builtin') {
        stats.chromeBuiltinUsage.translations++;
      } else if (source === 'gemini_cloud_fallback') {
        stats.geminiCloudUsage.translations++;
      }
    }
    
    stats.lastUsed = Date.now();
    
    await chrome.storage.local.set({ hybridAIStats: stats });
    
  } catch (error) {
    console.error('[Background] Error updating hybrid stats:', error);
  }
}

// ========================================
// CONFIDENCE TIER CALCULATION (PRESERVED)
// ========================================
function calculateConfidenceTier(confidence) {
  if (confidence >= 90) return 'HIGH';
  if (confidence >= 75) return 'GOOD';
  if (confidence >= 60) return 'MEDIUM';
  return 'LOW';
}

// ========================================
// DOMAIN CONFIDENCE TRACKING (PRESERVED)
// ========================================
function updateDomainConfidence(domain, confidence, classification) {
  if (!domainConfidenceCache.has(domain)) {
    domainConfidenceCache.set(domain, {
      domain,
      totalExtractions: 0,
      avgConfidence: 0,
      classifications: {}
    });
  }
  
  const stats = domainConfidenceCache.get(domain);
  stats.totalExtractions++;
  
  stats.avgConfidence = 
    ((stats.avgConfidence * (stats.totalExtractions - 1)) + confidence) / stats.totalExtractions;
  
  if (!stats.classifications[classification]) {
    stats.classifications[classification] = 0;
  }
  stats.classifications[classification]++;
  
  chrome.storage.local.set({
    domainConfidenceCache: Object.fromEntries(domainConfidenceCache)
  });
  
  console.log('[Background] Domain confidence updated:', domain, '| Avg:', Math.round(stats.avgConfidence) + '%');
}

function getDomainAdjustment(domain) {
  if (!domainConfidenceCache.has(domain)) return 0;
  
  const stats = domainConfidenceCache.get(domain);
  const baselineConfidence = 70;
  
  return Math.round(stats.avgConfidence - baselineConfidence);
}

// ========================================
// EXTRACTION HISTORY (PRESERVED)
// ========================================
function addToHistory(entry) {
  extractionHistory.unshift(entry);
  
  if (extractionHistory.length > MAX_HISTORY) {
    extractionHistory = extractionHistory.slice(0, MAX_HISTORY);
  }
  
  chrome.storage.local.set({ extractionHistory });
}

// ========================================
// UNIVERSAL PROMPT V10 (PRESERVED)
// ========================================
function buildUniversalPromptV10(pageType, itemCount) {
  console.log('[Background] Building Universal Prompt V10 | Type:', pageType, '| Items:', itemCount);
  
  if (pageType === 'MULTI_ITEM') {
    return `
You are a universal web data extraction AI. Extract ALL items from this page into a JSON array.

CRITICAL REQUIREMENTS:
1. Return a JSON array of objects, one object per item
2. Each object must have a "confidence_score" field (0-100)
3. Extract ${Math.min(itemCount, 50)} items (or all if fewer)
4. Use consistent field names across all items
5. NO explanations, NO markdown, ONLY valid JSON array

FIELD NAMING RULES:
- Use snake_case (e.g., "product_title", "article_title")
- Be consistent: if first item has "title", all must have "title"
- Extract ALL available fields, but keep names consistent

CONFIDENCE SCORING:
- 90-100: Extracted from semantic HTML or visible text
- 70-89: Inferred from patterns or context
- 50-69: Extracted but uncertain
- 0-49: Guess or placeholder

EXAMPLE OUTPUT:
[
  {
    "title": "Product Name",
    "price": "$29.99",
    "image": "https://...",
    "confidence_score": 95,
    "confidence_reasoning": "Extracted from semantic HTML tags"
  },
  {
    "title": "Another Product",
    "price": "$19.99",
    "image": "https://...",
    "confidence_score": 92,
    "confidence_reasoning": "Clear product card structure"
  }
]

EXTRACT NOW - RETURN ONLY THE JSON ARRAY:
`.trim();
  } else {
    return `
You are a universal web data extraction AI. Extract structured data from this page into a JSON object.

CRITICAL REQUIREMENTS:
1. Return a single JSON object (NOT an array)
2. Must include a "confidence_score" field (0-100)
3. Extract ALL relevant fields you can find
4. Use descriptive snake_case field names
5. NO explanations, NO markdown, ONLY valid JSON object

FIELD NAMING GUIDELINES:
- Article: title, author, publication_date, main_content, category
- Product: product_title, price, description, images, rating
- Recipe: recipe_name, ingredients, instructions, prep_time, servings
- Generic: title, description, main_content, images, links

CONFIDENCE SCORING:
- 90-100: Extracted from semantic HTML or clear visible text
- 70-89: Inferred from patterns or context
- 50-69: Extracted but uncertain structure
- 0-49: Guessed or placeholder

EXAMPLE OUTPUT:
{
  "title": "Article Title Here",
  "author": "John Doe",
  "publication_date": "2025-10-15",
  "main_content": "Article text...",
  "confidence_score": 95,
  "confidence_reasoning": "Extracted from article tag with clear metadata"
}

EXTRACT NOW - RETURN ONLY THE JSON OBJECT:
`.trim();
  }
}

// ========================================
// AI EXTRACTION WITH RETRY LOGIC (PRESERVED)
// ========================================
async function extractWithAI(content, prompt, pageType, maxRetries = 2) {
  console.log('[Background] AI extraction starting | Retries:', maxRetries);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        `${CONFIG.API_ENDPOINT}/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt + '\n\nPAGE CONTENT:\n' + content.substring(0, 30000)
              }]
            }],
            generationConfig: {
              temperature: 0.1,
              candidateCount: 1,
              maxOutputTokens: 8192
            }
          })
        }
      );
      
      if (!response.ok) {
        if (response.status === 429) {
          console.warn('[Background] ⚠️ Rate limit hit (429), retrying...');
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          continue;
        }
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!aiText) throw new Error('Empty AI response');
      
      const extracted = extractJsonObject(aiText, pageType);
      const flattened = flattenNestedConfidence(extracted);
      
      console.log('[Background] ✅ AI extraction successful');
      return flattened;
      
    } catch (error) {
      console.error(`[Background] AI extraction attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw new Error('AI extraction failed after all retries');
}

// ========================================
// JSON EXTRACTION AND REPAIR (PRESERVED)
// ========================================
function extractJsonObject(text, pageType) {
  console.log('[Background] Extracting JSON from AI response...');
  
  text = text.replace(/``````\s*/g, '');
  
  let jsonMatch;
  
  if (pageType === 'MULTI_ITEM') {
    jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
  } else {
    jsonMatch = text.match(/\{\s*"[\s\S]*\}/);
  }
  
  if (!jsonMatch) {
    console.warn('[Background] ⚠️ No JSON found in AI response, trying full text parse');
    jsonMatch = [text];
  }
  
  const jsonText = jsonMatch[0];
  
  try {
    return JSON.parse(jsonText);
  } catch (parseError) {
    console.warn('[Background] ⚠️ JSON parse failed, attempting repair...');
    
    const repaired = repairJSON(jsonText);
    
    try {
      return JSON.parse(repaired);
    } catch (repairError) {
      console.error('[Background] ❌ JSON repair failed:', repairError.message);
      throw new Error('Could not parse AI response as valid JSON');
    }
  }
}

function repairJSON(text) {
  text = text.replace(/,(\s*[}\]])/g, '$1');
  text = text.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
  text = text.replace(/'/g, '"');
  
  return text;
}

// ========================================
// NESTED CONFIDENCE FLATTENING (PRESERVED)
// ========================================
function flattenNestedConfidence(data) {
  console.log('[Background] 🔧 Flattening nested confidence...');
  
  if (Array.isArray(data)) {
    return data.map(item => flattenNestedConfidenceItem(item));
  }
  
  return flattenNestedConfidenceItem(data);
}

function flattenNestedConfidenceItem(item) {
  if (!item || typeof item !== 'object') return item;
  
  const flattened = { ...item };
  
  const nestedPaths = [
    'confidence.score',
    'confidence.value',
    'metadata.confidence',
    'extraction.confidence',
    'data.confidence_score'
  ];
  
  for (const path of nestedPaths) {
    const value = getNestedValue(item, path);
    if (value !== undefined && typeof value === 'number') {
      flattened.confidence_score = value;
      console.log(`[Background] 🔧 Extracted nested confidence from ${path}: ${value}`);
      break;
    }
  }
  
  if (!flattened.confidence_score || typeof flattened.confidence_score !== 'number') {
    for (const [key, value] of Object.entries(flattened)) {
      if (key.toLowerCase().includes('confidence') && typeof value === 'number') {
        flattened.confidence_score = value;
        console.log(`[Background] 🔧 Found confidence in field ${key}: ${value}`);
        break;
      }
    }
  }
  
  if (!flattened.confidence_score || typeof flattened.confidence_score !== 'number') {
    flattened.confidence_score = 50;
    console.log('[Background] 🔧 No confidence found, defaulting to 50');
  }
  
  return flattened;
}

function getNestedValue(obj, path) {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  
  return current;
}

// ========================================
// CSV CONVERSION WITH AI (PRESERVED)
// ========================================
async function convertComplexJSONToCSV(data, apiKey) {
  console.log('[Background] Converting complex JSON to CSV with AI...');
  
  try {
    const prompt = `
Convert this JSON data to CSV format. Rules:
1. Flatten nested objects using dot notation (e.g., "address.city")
2. Convert arrays to semicolon-separated strings
3. Preserve all data, just flatten structure
4. Return ONLY the CSV text, no explanations
5. Include header row with column names

JSON DATA:
${JSON.stringify(data, null, 2)}

OUTPUT CSV:
`.trim();
    
    const response = await fetch(
      `${CONFIG.API_ENDPOINT}/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096
          }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    const csvText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!csvText) throw new Error('Empty CSV response');
    
    const cleanCsv = csvText.replace(/``````\s*/g, '').trim();
    
    return {
      success: true,
      csv: cleanCsv
    };
    
  } catch (error) {
    console.error('[Background] CSV conversion error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ========================================
// SERVICE WORKER STATUS
// ========================================
console.log('[Background] ═══════════════════════════════════════════════');
console.log('[Background] 🚀 WEB WEAVER LIGHTNING v3.5.0 (HYBRID AI)');
console.log('[Background] ═══════════════════════════════════════════════');
console.log('[Background] ✅ Service worker ready');
console.log('[Background] 🆕 DAY 13: HYBRID AI (Chrome + Cloud)');
console.log('[Background] 🆕 Chrome Built-in Summarizer API integrated');
console.log('[Background] 🆕 Chrome Built-in Translator API integrated');
console.log('[Background] 🆕 Graceful fallback to Gemini Cloud API');
console.log('[Background] 🆕 Source tracking (_source metadata)');
console.log('[Background] ✅ PRESERVED: All Day 15 features (MULTI/SINGLE_ITEM)');
console.log('[Background] ✅ PRESERVED: All fixes (#1-#5)');
console.log('[Background] ═══════════════════════════════════════════════');

// ========================================
// GLOBAL ERROR HANDLER
// ========================================
self.addEventListener('error', (event) => {
  console.error('[Background] ❌ Unhandled error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[Background] ❌ Unhandled promise rejection:', event.reason);
});

// ========================================
// KEEP ALIVE
// ========================================
const KEEP_ALIVE_INTERVAL = 20000;

setInterval(() => {
  console.log('[Background] 💓 Keep-alive ping');
}, KEEP_ALIVE_INTERVAL);

// ========================================
// END OF BACKGROUND.JS (HYBRID AI v3.5.0)
// ========================================
