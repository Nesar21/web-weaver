console.log('[WebWeaver-BG] Service worker loading...');

// ============================================================================
// CONFIGURATION (Day 10)
// ============================================================================

const CONFIG = {
  version: '1.0.0-day10-enhanced',
  geminiModel: 'gemini-2.0-flash-exp',
  geminiLiteModel: 'gemini-2.0-flash-lite', // DAY 10: For AI fallback
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
  confidenceThreshold: 80, // Day 10: 80% accuracy target
  maxRetries: 3,
  timeout: 30000
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let isReady = false;
let aiEnabled = false; // Toggle for AI on/off

// Analytics Storage (Day 9-10)
const analyticsData = {
  totalExtractions: 0,
  basicExtractions: 0,
  aiExtractions: 0,
  hybridExtractions: 0, // DAY 10
  successfulAI: 0,
  failedAI: 0,
  totalConfidence: 0,
  perSite: {} // Track accuracy per domain
};

// ============================================================================
// API KEY MANAGEMENT
// ============================================================================

async function getApiKey() {
  try {
    const result = await chrome.storage.local.get(['geminiApiKey']);
    return result.geminiApiKey || null;
  } catch (error) {
    console.error('[WebWeaver-BG] ❌ Failed to load API key:', error);
    return null;
  }
}

async function saveApiKey(apiKey) {
  try {
    if (!apiKey || apiKey.length < 20 || !apiKey.startsWith('AIza')) {
      throw new Error('Invalid Gemini API key format');
    }
    await chrome.storage.local.set({ geminiApiKey: apiKey });
    console.log('[WebWeaver-BG] ✅ API key saved');
    return { success: true };
  } catch (error) {
    console.error('[WebWeaver-BG] ❌ Save failed:', error);
    return { success: false, error: error.message };
  }
}

async function getAiEnabled() {
  const result = await chrome.storage.local.get(['aiEnabled']);
  return result.aiEnabled !== false; // Default true
}

async function setAiEnabled(enabled) {
  await chrome.storage.local.set({ aiEnabled: enabled });
  aiEnabled = enabled;
  console.log(`[WebWeaver-BG] AI ${enabled ? 'ENABLED' : 'DISABLED'}`);
}

// ============================================================================
// ROBUST JSON EXTRACTION UTILITY TO AVOID 'Invalid JSON boundaries'
// ============================================================================

function extractJsonObject(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    console.error('No JSON found in AI response:', text);
    throw new Error('No JSON detected');
  }
  try {
    return JSON.parse(match[0]);
  } catch (error) {
    console.error('Malformed JSON:', match[0]);
    throw error;
  }
}

// ============================================================================
// WEBSITE TYPE DETECTION (Day 4-6: First AI Call)
// ============================================================================

async function detectWebsiteType(basicData) {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('No API key configured');

  const detectionPrompt = `You are a website classifier. Analyze this data and return ONLY a JSON object with this exact structure:
{
  "type": "ecommerce|news|recipe|wiki|blog|other",
  "confidence": 0.0-1.0
}

Website data:
URL: ${basicData.url}
Title: ${basicData.title}
Description: ${basicData.meta?.description || 'None'}
Sample text: ${basicData.mainText.substring(0, 500)}

Return ONLY the JSON object, no markdown, no explanation.`;

  const url = `${CONFIG.apiEndpoint}/${CONFIG.geminiModel}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: detectionPrompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 100
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) throw new Error('No response from Gemini');

  // Use robust extraction now
  return extractJsonObject(content);
}

// ============================================================================
// DYNAMIC PROMPT GENERATION (Day 6: Second AI Call)
// ============================================================================

async function generateCustomPrompt(websiteType, basicData) {
  const apiKey = await getApiKey();

  const metaPrompt = `You are an expert prompt engineer. Create a data extraction prompt for a ${websiteType} website.

The prompt should:
1. Extract ALL relevant fields for a ${websiteType} website
2. Return valid JSON with field names as keys
3. Include a confidence_score (0-100) field
4. Handle missing data gracefully (use null)

Website context:
- URL: ${basicData.url}
- Title: ${basicData.title}

Return ONLY the extraction prompt as plain text, no JSON wrapper.`;

  const url = `${CONFIG.apiEndpoint}/${CONFIG.geminiModel}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: metaPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500
      }
    })
  });

  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

  const data = await response.json();
  const customPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!customPrompt) throw new Error('Failed to generate custom prompt');

  return customPrompt;
}

// ============================================================================
// AI EXTRACTION (Day 7: Third AI Call with Custom Prompt)
// ============================================================================

async function extractWithAI(customPrompt, pageData, candidateBlocks = [], retries = 0) {
  const MAX_RETRIES = CONFIG.maxRetries;
  const apiKey = await getApiKey();
  let contentToExtract = '';

  if (candidateBlocks.length > 0) {
    contentToExtract = candidateBlocks.map(b => b.text).join('\n\n');
  } else {
    contentToExtract = pageData.mainText.substring(0, 3000);
  }

  const fullPrompt = `${customPrompt}

Page data to extract from:
URL: ${pageData.url}
Title: ${pageData.title}
Description: ${pageData.description || 'None'}
Content: ${contentToExtract}

Return ONLY valid JSON, no markdown, no explanation.`;

  const url = `${CONFIG.apiEndpoint}/${CONFIG.geminiModel}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('[WebWeaver-BG] Raw AI content:', content);

    if (!content) throw new Error('No extraction result');

    // Use robust extraction
    return extractJsonObject(content);

  } catch (err) {
    console.error('[WebWeaver-BG] Extraction error:', err.message);
    if (retries < MAX_RETRIES) {
      console.log(`[WebWeaver-BG] Retrying extraction (${retries + 1}/${MAX_RETRIES})...`);
      return extractWithAI(customPrompt, pageData, candidateBlocks, retries + 1);
    } else {
      throw err;
    }
  }
}

// ============================================================================
// DAY 10: HYBRID CLASSIFIER - LAYER 2 (AI FALLBACK)
// ============================================================================

async function classifyWithAI(pageData) {
  console.log('[Background] 🤖 LAYER 2: AI Fallback Classification...');

  try {
    const promptTemplate = `You are a page classifier. Analyze the page structure and determine if it contains ONE primary entity or MULTIPLE entities.

URL: ${pageData.url}
Title: ${pageData.title}

DOM Signals:
- Articles: ${pageData.classificationSignals.articleCount}
- H1 tags: ${pageData.classificationSignals.h1Count}
- Word count: ${pageData.classificationSignals.wordCount}
- Repeating patterns: ${pageData.classificationSignals.repeatingPatterns}

Content sample (first 300 words):
${pageData.mainText.substring(0, 1500)}

Respond with ONLY ONE WORD:
SINGLE_ITEM or MULTI_ITEM

No explanation. Just the classification.`;

    const apiKey = await getApiKey();

    if (!apiKey) {
      console.error('[Background] ❌ No API key for fallback');
      return 'SINGLE_ITEM'; // Fail-safe default
    }

    const response = await fetch(
      `${CONFIG.apiEndpoint}/${CONFIG.geminiLiteModel}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptTemplate }] }],
          generationConfig: {
            maxOutputTokens: 10,
            temperature: 0
          }
        })
      }
    );

    if (!response.ok) {
      console.error('[Background] ❌ AI fallback failed:', response.status);
      return 'SINGLE_ITEM';
    }

    const data = await response.json();
    const classification = data.candidates[0].content.parts[0].text.trim().toUpperCase();

    console.log(`[Background] ✅ AI Fallback: ${classification}`);

    if (classification.includes('SINGLE_ITEM')) {
      return 'SINGLE_ITEM';
    } else if (classification.includes('MULTI_ITEM')) {
      return 'MULTI_ITEM';
    } else {
      console.warn('[Background] ⚠️ Invalid AI response, defaulting to SINGLE_ITEM');
      return 'SINGLE_ITEM';
    }
  } catch (error) {
    console.error('[Background] ❌ AI Fallback error:', error);
    return 'SINGLE_ITEM'; // Fail-safe
  }
}

// ============================================================================
// DAY 10: HYBRID CLASSIFIER - LAYER 3 (PROMPT ROUTER)
// ============================================================================

function getPromptForClassification(classification) {
  if (classification === 'MULTI_ITEM') {
    console.log('[Background] 📋 Routing to MULTI_ITEM prompt (v8_multi)');
    return 'v8_multi';
  } else {
    console.log('[Background] 📄 Routing to SINGLE_ITEM prompt (v7)');
    return 'v7';
  }
}

// ============================================================================
// Enhanced Layer 1 heuristic for multi-item DOM detection
// ============================================================================

async function analyzeDomSignals(basicData) {
  const domDetails = basicData.domDetails || {};

  const repeatedBlockCount = domDetails.repeatedBlocksCount || 0;
  const productGridDetected = domDetails.productGridFound || false;

  let confidence = 0;
  let classification = 'NONE';

  if (repeatedBlockCount > 5 || productGridDetected) {
    classification = 'MULTI_ITEM';
    confidence = 90 + Math.min(10, repeatedBlockCount * 2);
  } else if (basicData.h1Count === 1 && basicData.wordCount > 100) {
    classification = 'SINGLE_ITEM';
    confidence = 95;
  } else {
    classification = 'UNCERTAIN';
    confidence = 50;
  }

  return { classification, confidence };
}

// ============================================================================
// MAIN EXTRACTION ORCHESTRATOR (Day 10 - Standard Mode)
// ============================================================================

async function performExtraction(tabId, useAI) {
  console.log(`[WebWeaver-BG] 🎯 Starting extraction (AI: ${useAI ? 'ON' : 'OFF'})`);

  analyticsData.totalExtractions++;

  try {
    const basicResponse = await chrome.tabs.sendMessage(tabId, { action: 'extractPageData' });

    if (!basicResponse || !basicResponse.success) {
      throw new Error('Failed to extract page data');
    }

    const basicData = basicResponse.data;
    const domain = basicData.domain;

    console.log(`[WebWeaver-BG] ✅ Page data extracted from: ${domain}`);

    if (!useAI) {
      analyticsData.basicExtractions++;
      updateSiteStats(domain, true, 0, 'basic');

      return {
        success: true,
        data: {
          ...basicData,
          _meta: {
            extractedAt: new Date().toISOString(),
            version: CONFIG.version,
            method: 'basic',
            aiEnhanced: false,
            url: basicData.url,
            domain: domain
          }
        }
      };
    }

    analyticsData.aiExtractions++;

    console.log('[WebWeaver-BG] 🔍 Detecting website type...');
    const typeDetection = await detectWebsiteType(basicData);
    console.log(`[WebWeaver-BG] ✅ Type detected: ${typeDetection.type} (${typeDetection.confidence})`);

    console.log('[WebWeaver-BG] 📝 Generating custom extraction prompt...');
    const customPrompt = await generateCustomPrompt(typeDetection.type, basicData);
    console.log('[WebWeaver-BG] ✅ Custom prompt generated');

    console.log('[WebWeaver-BG] 🤖 Extracting with AI...');
    const aiData = await extractWithAI(customPrompt, basicData);
    console.log('[WebWeaver-BG] ✅ AI extraction complete');

    const confidence = aiData.confidence_score || 50;

    const finalData = {
      ...basicData,
      ...aiData,
      _meta: {
        extractedAt: new Date().toISOString(),
        version: CONFIG.version,
        method: 'ai',
        aiEnhanced: true,
        websiteType: typeDetection.type,
        confidence: confidence,
        url: basicData.url,
        domain: domain
      }
    };

    if (confidence >= CONFIG.confidenceThreshold) {
      analyticsData.successfulAI++;
      analyticsData.totalConfidence += confidence;
      updateSiteStats(domain, true, confidence, 'ai');
      console.log(`[WebWeaver-BG] ✅ HIGH CONFIDENCE: ${confidence}%`);
    } else {
      analyticsData.failedAI++;
      updateSiteStats(domain, false, confidence, 'ai');
      console.log(`[WebWeaver-BG] ⚠️ LOW CONFIDENCE: ${confidence}%`);
    }

    return { success: true, data: finalData };

  } catch (error) {
    console.error('[WebWeaver-BG] ❌ Extraction failed:', error);
    analyticsData.failedAI++;
    return { success: false, error: error.message };
  }
}

// ============================================================================
// DAY 10: HYBRID EXTRACTION (3-LAYER PIPELINE)
// ============================================================================

async function extractDataWithHybridClassifier(tabId) {
  console.log('[Background] 🚀 Starting Hybrid Extraction Pipeline...');
  const pipelineStart = Date.now();

  analyticsData.totalExtractions++;
  analyticsData.hybridExtractions++;

  try {
    const response = await chrome.tabs.sendMessage(tabId, { action: 'extractWithHybrid' });

    if (!response.success) {
      throw new Error('Failed to extract page data');
    }

    const pageData = response.data;
    let finalClassification = pageData.pageLayout;
    const domConfidence = pageData.classificationConfidence;

    console.log(`[Background] 📊 LAYER 1 Result: ${finalClassification} (${domConfidence}% confident)`);

    if (finalClassification === 'NONE') {
      console.log('[Background] 🚫 Page classified as NONE - skipping AI extraction');
      return {
        success: true,
        data: {
          ...pageData,
          message: 'Page classified as empty, login, or error page',
          confidence_score: 0,
          _hybrid: {
            layer1Classification: 'NONE',
            layer1Confidence: domConfidence,
            layer2Used: false,
            layer2Time: 0,
            layer3Prompt: 'skipped',
            finalClassification: 'NONE',
            totalPipelineTime: Date.now() - pipelineStart
          }
        }
      };
    }

    let fallbackUsed = false;
    let fallbackTime = 0;

    if (finalClassification === 'UNCERTAIN' || domConfidence < 80) {
      console.log('[Background] ❓ UNCERTAIN detected - triggering AI Fallback...');
      const fallbackStart = Date.now();

      finalClassification = await classifyWithAI(pageData);

      fallbackTime = Date.now() - fallbackStart;
      fallbackUsed = true;

      console.log(`[Background] ✅ LAYER 2 resolved to: ${finalClassification} in ${fallbackTime}ms`);
    }

    const promptVersion = getPromptForClassification(finalClassification);

    console.log(`[Background] 🤖 LAYER 3: Extracting with prompt ${promptVersion}...`);

    let candidateBlocks = [];
    if (finalClassification === 'MULTI_ITEM') {
      candidateBlocks = await chrome.tabs.sendMessage(tabId, { action: 'extractProductBlocks' });
    }

    const customPrompt = await generateCustomPrompt(finalClassification, pageData);

    const aiData = await extractWithAI(customPrompt, pageData, candidateBlocks);

    const cleanedData = postProcessExtraction(aiData);

    const resultData = {
      ...pageData,
      ...cleanedData,
      _hybrid: {
        layer1Classification: finalClassification,
        layer1Confidence: domConfidence,
        layer2Used: fallbackUsed,
        layer2Time: fallbackTime,
        layer3Prompt: promptVersion,
        finalClassification: finalClassification,
        totalPipelineTime: Date.now() - pipelineStart
      }
    };

    if (aiData.confidence_score >= CONFIG.confidenceThreshold) {
      analyticsData.successfulAI++;
      analyticsData.totalConfidence += aiData.confidence_score;
      updateSiteStats(pageData.domain, true, aiData.confidence_score, 'hybrid');
      console.log(`[Background] ✅ HIGH CONFIDENCE: ${aiData.confidence_score}%`);
    } else {
      analyticsData.failedAI++;
      updateSiteStats(pageData.domain, false, aiData.confidence_score, 'hybrid');
      console.log(`[Background] ⚠️ LOW CONFIDENCE: ${aiData.confidence_score}%`);
    }

    analyticsData.hybridExtractions++;

    console.log('[Background] ✅ Hybrid Pipeline complete!');
    console.log('[Background] 📊 Pipeline metrics:', resultData._hybrid);

    return { success: true, data: resultData };

  } catch (error) {
    console.error('[Background] ❌ Hybrid pipeline failed:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// POST-PROCESSING OF AI EXTRACTION RESULTS
// ============================================================================

function postProcessExtraction(aiData) {
  // Placeholder for post-processing logic
  // Example: 
  // - Filter duplicate products based on product_name or id
  // - Validate price format with regex
  // - Verify image URLs start with https://
  // - Normalize fields and fill missing with null
  return aiData;
}

// ============================================================================
// ANALYTICS (Day 9-10)
// ============================================================================

function updateSiteStats(domain, success, confidence, method) {
  if (!analyticsData.perSite[domain]) {
    analyticsData.perSite[domain] = {
      total: 0,
      successful: 0,
      failed: 0,
      avgConfidence: 0,
      method: method
    };
  }

  const site = analyticsData.perSite[domain];
  site.total++;

  if (success) {
    site.successful++;
    site.avgConfidence = ((site.avgConfidence * (site.successful - 1)) + confidence) / site.successful;
  } else {
    site.failed++;
  }
}

function getAnalytics() {
  const avgConfidence = analyticsData.successfulAI > 0 
    ? analyticsData.totalConfidence / analyticsData.successfulAI 
    : 0;

  const successRate = analyticsData.aiExtractions > 0
    ? (analyticsData.successfulAI / analyticsData.aiExtractions) * 100
    : 0;

  return {
    overall: {
      total: analyticsData.totalExtractions,
      basic: analyticsData.basicExtractions,
      ai: analyticsData.aiExtractions,
      hybrid: analyticsData.hybridExtractions,
      avgConfidence: Math.round(avgConfidence),
      successRate: Math.round(successRate),
      passedThreshold: analyticsData.successfulAI,
      failedThreshold: analyticsData.failedAI
    },
    perSite: analyticsData.perSite,
    target: CONFIG.confidenceThreshold
  };
}

// ============================================================================
// UNIFIED MESSAGE HANDLER (DAY 10: Single listener for all actions)
// ============================================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[WebWeaver-BG] 📨 Message:', request.action);

  (async () => {
    try {
      switch (request.action) {
        case 'saveApiKey':
          const saveResult = await saveApiKey(request.apiKey);
          sendResponse(saveResult);
          break;

        case 'getApiKey':
          const apiKey = await getApiKey();
          sendResponse({ success: true, hasKey: !!apiKey });
          break;

        case 'setAiEnabled':
          await setAiEnabled(request.enabled);
          sendResponse({ success: true, enabled: request.enabled });
          break;

        case 'getAiEnabled':
          const enabled = await getAiEnabled();
          sendResponse({ success: true, enabled: enabled });
          break;

        case 'extract':
          const useAI = request.useAI !== false;
          const result = await performExtraction(request.tabId, useAI);
          sendResponse(result);
          break;

        case 'extractWithHybrid':
          const hybridResult = await extractDataWithHybridClassifier(request.tabId);
          sendResponse(hybridResult);
          break;

        case 'getAnalytics':
          const analyticsDataResult = getAnalytics();
          sendResponse({ success: true, data: analyticsDataResult });
          break;

        case 'ping':
          sendResponse({ success: true, ready: isReady });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('[WebWeaver-BG] ❌ Error:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();

  return true;
});

// ============================================================================
// INITIALIZATION
// ============================================================================

(async () => {
  console.log('[WebWeaver-BG] 🚀 Initializing...');

  aiEnabled = await getAiEnabled();
  isReady = true;

  console.log(`
╔════════════════════════════════════════════════╗
║  🎯 WEB WEAVER LIGHTNING - READY              ║
║  Version: ${CONFIG.version.padEnd(30)}║
║  Target: ${CONFIG.confidenceThreshold}% Confidence${' '.padEnd(28)}║
║  AI Status: ${aiEnabled ? 'ENABLED ✓' : 'DISABLED ✗'.padEnd(30)}║
║  Day 10: Hybrid Classifier ✅${' '.padEnd(21)}║
╚════════════════════════════════════════════════╝
  `);
})();

console.log('[Background] ✅ Background script with Hybrid Classifier ready!');

