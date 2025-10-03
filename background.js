// Web Weaver Lightning - Background Service Worker
// Days 4-10: AI Integration, Validation, Analytics
// The intelligent core that processes extraction with Gemini AI

console.log('[WebWeaver-BG] Service worker loading...');

// ============================================================================
// CONFIGURATION (Day 10)
// ============================================================================

const CONFIG = {
  version: '1.0.0-day10',
  geminiModel: 'gemini-2.0-flash-exp',
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
  confidenceThreshold: 80, // Day 10: 80% accuracy target
  maxRetries: 2,
  timeout: 30000
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let isReady = false;
let aiEnabled = false; // Toggle for AI on/off

// Analytics Storage (Day 9-10)
const analytics = {
  totalExtractions: 0,
  basicExtractions: 0,
  aiExtractions: 0,
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
Description: ${basicData.description || 'None'}
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
  
  // Parse JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid JSON response');
  
  return JSON.parse(jsonMatch[0]);
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

async function extractWithAI(customPrompt, basicData) {
  const apiKey = await getApiKey();
  
  const fullPrompt = `${customPrompt}

Page data to extract from:
URL: ${basicData.url}
Title: ${basicData.title}
Description: ${basicData.description || 'None'}
Main content: ${basicData.mainText.substring(0, 3000)}
${basicData.price ? 'Price: ' + basicData.price : ''}
${basicData.author ? 'Author: ' + basicData.author : ''}

Return ONLY valid JSON, no markdown, no explanation.`;

  const url = `${CONFIG.apiEndpoint}/${CONFIG.geminiModel}:generateContent?key=${apiKey}`;
  
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
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) throw new Error('No extraction result');
  
  // Parse JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid JSON response');
  
  return JSON.parse(jsonMatch[0]);
}

// ============================================================================
// MAIN EXTRACTION ORCHESTRATOR (Day 10)
// ============================================================================

async function performExtraction(tabId, useAI) {
  console.log(`[WebWeaver-BG] 🎯 Starting extraction (AI: ${useAI ? 'ON' : 'OFF'})`);
  
  analytics.totalExtractions++;
  
  try {
    // Step 1: Get basic data from content script
    const basicResponse = await chrome.tabs.sendMessage(tabId, { 
      action: 'extractBasic' 
    });
    
    if (!basicResponse || !basicResponse.success) {
      throw new Error('Failed to extract basic data from page');
    }
    
    const basicData = basicResponse.data;
    const domain = basicData.domain;
    
    console.log(`[WebWeaver-BG] ✅ Basic data extracted from: ${domain}`);
    
    // If AI disabled, return basic data
    if (!useAI) {
      analytics.basicExtractions++;
      updateSiteStats(domain, true, 0, 'basic');
      
      return {
        success: true,
        data: {
          ...basicData,
          _meta: {
            ...basicData._meta,
            aiEnhanced: false
          }
        }
      };
    }
    
    // Step 2: AI Enhancement (3-step process)
    analytics.aiExtractions++;
    
    // 2a: Detect website type
    console.log('[WebWeaver-BG] 🔍 Detecting website type...');
    const typeDetection = await detectWebsiteType(basicData);
    console.log(`[WebWeaver-BG] ✅ Type detected: ${typeDetection.type} (${typeDetection.confidence})`);
    
    // 2b: Generate custom prompt
    console.log('[WebWeaver-BG] 📝 Generating custom extraction prompt...');
    const customPrompt = await generateCustomPrompt(typeDetection.type, basicData);
    console.log('[WebWeaver-BG] ✅ Custom prompt generated');
    
    // 2c: Extract with custom prompt
    console.log('[WebWeaver-BG] 🤖 Extracting with AI...');
    const aiData = await extractWithAI(customPrompt, basicData);
    console.log('[WebWeaver-BG] ✅ AI extraction complete');
    
    // Step 3: Merge and validate
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
    
    // Step 4: Update analytics (Day 10)
    if (confidence >= CONFIG.confidenceThreshold) {
      analytics.successfulAI++;
      analytics.totalConfidence += confidence;
      updateSiteStats(domain, true, confidence, 'ai');
      console.log(`[WebWeaver-BG] ✅ HIGH CONFIDENCE: ${confidence}%`);
    } else {
      analytics.failedAI++;
      updateSiteStats(domain, false, confidence, 'ai');
      console.log(`[WebWeaver-BG] ⚠️ LOW CONFIDENCE: ${confidence}%`);
    }
    
    return { success: true, data: finalData };
    
  } catch (error) {
    console.error('[WebWeaver-BG] ❌ Extraction failed:', error);
    analytics.failedAI++;
    return { success: false, error: error.message };
  }
}

// ============================================================================
// ANALYTICS (Day 9-10)
// ============================================================================

function updateSiteStats(domain, success, confidence, method) {
  if (!analytics.perSite[domain]) {
    analytics.perSite[domain] = {
      total: 0,
      successful: 0,
      failed: 0,
      avgConfidence: 0,
      method: method
    };
  }
  
  const site = analytics.perSite[domain];
  site.total++;
  
  if (success) {
    site.successful++;
    site.avgConfidence = ((site.avgConfidence * (site.successful - 1)) + confidence) / site.successful;
  } else {
    site.failed++;
  }
}

function getAnalytics() {
  const avgConfidence = analytics.successfulAI > 0 
    ? analytics.totalConfidence / analytics.successfulAI 
    : 0;
    
  const successRate = analytics.aiExtractions > 0
    ? (analytics.successfulAI / analytics.aiExtractions) * 100
    : 0;
  
  return {
    overall: {
      total: analytics.totalExtractions,
      basic: analytics.basicExtractions,
      ai: analytics.aiExtractions,
      avgConfidence: Math.round(avgConfidence),
      successRate: Math.round(successRate),
      passedThreshold: analytics.successfulAI,
      failedThreshold: analytics.failedAI
    },
    perSite: analytics.perSite,
    target: CONFIG.confidenceThreshold
  };
}

// ============================================================================
// MESSAGE HANDLER
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
          const useAI = request.useAI !== false; // Default true
          const result = await performExtraction(request.tabId, useAI);
          sendResponse(result);
          break;
        
        case 'getAnalytics':
          const analyticsData = getAnalytics();
          sendResponse({ success: true, data: analyticsData });
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
  
  return true; // Keep channel open
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
╚════════════════════════════════════════════════╝
  `);
})();

// ═════════════════════════════════════════════════════════════════
// DAY 10: HYBRID CLASSIFIER INTEGRATION - LAYER 2 & 3
// AI Fallback + Prompt Router
// ═════════════════════════════════════════════════════════════════

console.log('[Background] 🎯 Day 10 Hybrid Classifier enabled');

/**
 * LAYER 2: AI FALLBACK CLASSIFIER
 * Called only when DOM returns UNCERTAIN
 */
async function classifyWithAI(pageData) {
  console.log('[Background] 🤖 LAYER 2: AI Fallback Classification...');

  try {
    // Load fallback prompt
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

    // Get API key
    const { geminiApiKey } = await chrome.storage.local.get('geminiApiKey');
    
    if (!geminiApiKey) {
      console.error('[Background] ❌ No API key for fallback');
      return 'SINGLE_ITEM'; // Fail-safe default
    }

    // Call Gemini API with lightweight model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent?key=${geminiApiKey}`,
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

    // Validate response
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

/**
 * LAYER 3: PROMPT ROUTER
 * Routes to appropriate prompt based on classification
 */
function getPromptForClassification(classification) {
  if (classification === 'MULTI_ITEM') {
    console.log('[Background] 📋 Routing to MULTI_ITEM prompt (v8_multi)');
    return 'v8_multi';
  } else {
    console.log('[Background] 📄 Routing to SINGLE_ITEM prompt (v7)');
    return 'v7';
  }
}

/**
 * UPDATED: Hybrid extraction with 3-layer classification
 */
async function extractDataWithHybridClassifier(tabId) {
  console.log('[Background] 🚀 Starting Hybrid Extraction Pipeline...');
  const pipelineStart = Date.now();

  try {
    // Get page data (includes Layer 1: DOM classification)
    const response = await chrome.tabs.sendMessage(tabId, { action: 'extractPageData' });
    
    if (!response.success) {
      throw new Error('Failed to extract page data');
    }

    const pageData = response.data;
    let finalClassification = pageData.pageLayout;
    const domConfidence = pageData.classificationConfidence;

    console.log(`[Background] 📊 LAYER 1 Result: ${finalClassification} (${domConfidence}% confident)`);

    // Handle NONE classification (garbage pages)
    if (finalClassification === 'NONE') {
      console.log('[Background] 🚫 Page classified as NONE - skipping AI extraction');
      return {
        success: true,
        data: {
          ...pageData,
          message: 'Page classified as empty, login, or error page',
          confidence_score: 0,
          _hybrid: {
            layer1: 'NONE',
            layer2: 'skipped',
            layer3: 'skipped',
            totalTime: Date.now() - pipelineStart,
            costSaved: '100%'
          }
        }
      };
    }

    // Handle UNCERTAIN classification (needs AI fallback)
    if (finalClassification === 'UNCERTAIN' || domConfidence < 80) {
      console.log('[Background] ❓ UNCERTAIN detected - triggering AI Fallback...');
      const fallbackStart = Date.now();
      
      finalClassification = await classifyWithAI(pageData);
      
      const fallbackTime = Date.now() - fallbackStart;
      console.log(`[Background] ✅ LAYER 2 resolved to: ${finalClassification} in ${fallbackTime}ms`);
      
      pageData._fallbackUsed = true;
      pageData._fallbackTime = fallbackTime;
    }

    // LAYER 3: Route to appropriate prompt
    const promptVersion = getPromptForClassification(finalClassification);
    
    // Extract with appropriate prompt
    console.log(`[Background] 🤖 LAYER 3: Extracting with prompt ${promptVersion}...`);
    
    // Here you would call your existing AI extraction with the selected prompt
    // For now, return the classification data
    const result = {
      success: true,
      data: {
        ...pageData,
        _hybrid: {
          layer1Classification: pageData.pageLayout,
          layer1Confidence: domConfidence,
          layer2Used: pageData._fallbackUsed || false,
          layer2Time: pageData._fallbackTime || 0,
          layer3Prompt: promptVersion,
          finalClassification: finalClassification,
          totalPipelineTime: Date.now() - pipelineStart
        }
      }
    };

    console.log('[Background] ✅ Hybrid Pipeline complete!');
    console.log('[Background] 📊 Pipeline metrics:', result.data._hybrid);

    return result;

  } catch (error) {
    console.error('[Background] ❌ Hybrid pipeline failed:', error);
    return { success: false, error: error.message };
  }
}

// Add hybrid extraction to existing message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractWithHybrid') {
    extractDataWithHybridClassifier(sender.tab.id)
      .then(sendResponse)
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

console.log('[Background] ✅ Hybrid Classifier ready!');
