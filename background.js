console.log('[WebWeaver-BG] Service worker loading...');

// ============================================================================
// CONFIGURATION (Day 10)
// ============================================================================

const CONFIG = {
  version: '1.0.0-day10-complete', // ✅ Updated version
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
// ✅ PRIORITY 3A: Enhanced analytics structure
const analyticsData = {
  totalExtractions: 0,
  basicExtractions: 0,
  aiExtractions: 0,
  hybridExtractions: 0, // DAY 10
  allExtractions: 0, // ✅ NEW: Track all AI attempts regardless of confidence
  successfulAI: 0,
  failedAI: 0,
  totalConfidence: 0, // ✅ MODIFIED: Now includes ALL confidence scores
  confidenceDistribution: { // ✅ NEW: Track confidence buckets
    '0-20': 0,
    '20-40': 0,
    '40-60': 0,
    '60-80': 0,
    '80-100': 0
  },
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
// PRIORITY 1: ROBUST JSON EXTRACTION WITH MULTI-OBJECT WRAPPING
// ============================================================================

// ✅ Helper to remove trailing commas (common AI mistake)
function removeTrailingCommas(str) {
  return str.replace(/,(\s*[}\]])/g, '$1');
}

// ✅ ENHANCED: Detect and wrap multiple objects separated by commas (handles whitespace)
function wrapMultipleObjects(str) {
  const trimmed = str.trim();
  
  // Enhanced Pattern: Matches '},\s*{' with flexible whitespace (spaces, tabs, newlines)
  // Handles: "{ obj1 }, { obj2 }" or "{ obj1 },\n{ obj2 }" or "{ obj1 },  { obj2 }"
  if (trimmed.startsWith('{') && /\},\s*\{/.test(trimmed)) {
    console.log('[WebWeaver-BG] 🔧 Detected multiple objects with whitespace, wrapping in array...');
    return '[' + trimmed + ']';
  }
  
  // Skip wrapping if already an array
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    console.log('[WebWeaver-BG] ℹ️ Already wrapped in array brackets');
    return str;
  }
  
  return str;
}


// ✅ PRIORITY 1: Multi-step JSON extraction with auto-repair
function extractJsonObject(text) {
  console.log('[WebWeaver-BG] 🔍 Extracting JSON from AI response...');
  
  // Step 1: Extract JSON boundaries
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    console.error('[WebWeaver-BG] ❌ No JSON found in AI response:', text.substring(0, 200));
    throw new Error('No JSON detected in AI response');
  }

  let jsonCandidate = match[0];
  console.log('[WebWeaver-BG] 📋 Raw JSON candidate (first 200 chars):', jsonCandidate.substring(0, 200));

  // Step 2: Try direct parse first (happy path)
  try {
    const parsed = JSON.parse(jsonCandidate);
    console.log('[WebWeaver-BG] ✅ Direct JSON parse successful');
    return parsed;
  } catch (directError) {
    console.warn('[WebWeaver-BG] ⚠️ Direct parse failed:', directError.message);
  }

  // Step 3: Auto-repair - Remove trailing commas
  try {
    const withoutTrailingCommas = removeTrailingCommas(jsonCandidate);
    const parsed = JSON.parse(withoutTrailingCommas);
    console.log('[WebWeaver-BG] ✅ JSON parsed after removing trailing commas');
    return parsed;
  } catch (trailingCommaError) {
    console.warn('[WebWeaver-BG] ⚠️ Trailing comma fix failed:', trailingCommaError.message);
  }

  // Step 4: Multi-object wrapping - Detect `{ obj1 }, { obj2 }` pattern
  try {
    const wrapped = wrapMultipleObjects(jsonCandidate);
    const withoutTrailingCommas = removeTrailingCommas(wrapped);
    const parsed = JSON.parse(withoutTrailingCommas);
    console.log('[WebWeaver-BG] ✅ JSON parsed after multi-object wrapping');
    return parsed;
  } catch (wrapError) {
    console.warn('[WebWeaver-BG] ⚠️ Multi-object wrapping failed:', wrapError.message);
  }

  // Step 5: Extended boundary extraction (catch nested objects)
  try {
    const extendedMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (extendedMatch) {
      const cleaned = removeTrailingCommas(extendedMatch[0]);
      const parsed = JSON.parse(cleaned);
      console.log('[WebWeaver-BG] ✅ JSON parsed with extended boundary extraction');
      return parsed;
    }
  } catch (extendedError) {
    console.warn('[WebWeaver-BG] ⚠️ Extended extraction failed:', extendedError.message);
  }

  // Step 6: Final fallback - Log full error details
  console.error('[WebWeaver-BG] ❌ All JSON repair attempts failed');
  console.error('[WebWeaver-BG] 📄 Malformed JSON:', jsonCandidate);
  throw new Error(`Malformed JSON: ${jsonCandidate.substring(0, 200)}...`);
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

  // Use robust extraction
  return extractJsonObject(content);
}

// ============================================================================
// PRIORITY 4: ENHANCED DYNAMIC PROMPT WITH SELF-SCORING
// ============================================================================

async function generateCustomPrompt(websiteType, basicData) {
  const apiKey = await getApiKey();
  
  // ✅ PRIORITY 4: Enhanced meta-prompt with confidence scoring rules
  const metaPrompt = `You are an expert prompt engineer. Create a data extraction prompt for a ${websiteType} website.

The prompt should:
1. Extract ALL relevant fields for a ${websiteType} website
2. Return valid JSON with field names as keys
3. Include TWO required fields for quality control:
   - confidence_score: Integer 0-100 based on these strict rules:
     * 95-100: Perfect extraction - all required fields complete with verified data quality
     * 85-94: Excellent - all core fields present, minor optional fields missing
     * 75-84: Good - most core fields complete, some quality concerns or missing secondaries
     * 60-74: Acceptable - core fields present but significant gaps or uncertain data
     * 40-59: Poor - partial extraction with major missing data or low reliability
     * 0-39: Failed - insufficient data extracted or unreliable content
   - confidence_reasoning: Single sentence explaining why this score was assigned
4. Handle missing data gracefully (use null for missing fields)
5. For ${websiteType} sites, prioritize accuracy over completeness

Website context:
- URL: ${basicData.url}
- Title: ${basicData.title}
- Domain: ${new URL(basicData.url).hostname}

CRITICAL: The extraction prompt you generate must instruct the AI to:
- Self-assess the quality of its own extraction
- Be conservative with confidence scores (prefer underestimating)
- Provide specific reasoning for the confidence_score

Return ONLY the extraction prompt as plain text, no JSON wrapper.`;

  const url = `${CONFIG.apiEndpoint}/${CONFIG.geminiModel}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: metaPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 600 // ✅ Increased for detailed scoring rules
      }
    })
  });

  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

  const data = await response.json();
  const customPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!customPrompt) throw new Error('Failed to generate custom prompt');

  console.log('[WebWeaver-BG] 📝 Generated prompt with self-scoring instructions');
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

Return ONLY valid JSON with confidence_score and confidence_reasoning fields, no markdown, no explanation.`;

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
    const extracted = extractJsonObject(content);
    
    // ✅ PRIORITY 4: Validate confidence fields
    if (!extracted.confidence_score) {
      console.warn('[WebWeaver-BG] ⚠️ AI did not provide confidence_score, defaulting to 50');
      extracted.confidence_score = 50;
      extracted.confidence_reasoning = 'AI did not self-assess confidence';
    }
    
    return extracted;
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
// PRIORITY 3A: Helper to track confidence distribution
// ============================================================================

function trackConfidenceDistribution(confidence) {
  if (confidence >= 0 && confidence < 20) {
    analyticsData.confidenceDistribution['0-20']++;
  } else if (confidence >= 20 && confidence < 40) {
    analyticsData.confidenceDistribution['20-40']++;
  } else if (confidence >= 40 && confidence < 60) {
    analyticsData.confidenceDistribution['40-60']++;
  } else if (confidence >= 60 && confidence < 80) {
    analyticsData.confidenceDistribution['60-80']++;
  } else if (confidence >= 80 && confidence <= 100) {
    analyticsData.confidenceDistribution['80-100']++;
  }
}

// ============================================================================
// PRIORITY 5: PRODUCTION-GRADE DATA NORMALIZATION
// Future-proof field normalization for numeric data quality
// ============================================================================

/**
 * Normalize a single numeric field (string → number)
 * Handles: currency symbols, commas, K/M/B suffixes, percentages
 * 
 * Examples:
 * - "₹1,000" → 1000
 * - "4.5K" → 4500
 * - "2.3M" → 2300000
 * - "$5.99" → 5.99
 * - "85%" → 85
 * - "invalid" → null
 */
function normalizeNumericField(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value; // Already clean
  if (typeof value !== 'string') return null;

  // Step 1: Remove currency symbols and whitespace
  let cleaned = value.replace(/[₹$€£¥,\s]/g, '');

  // Step 2: Handle percentage (strip % and return as number)
  if (cleaned.includes('%')) {
    cleaned = cleaned.replace('%', '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  // Step 3: Handle K/M/B/T suffixes (case-insensitive)
  const suffixMatch = cleaned.match(/^(\d+(?:\.\d+)?)(K|M|B|T)$/i);
  if (suffixMatch) {
    const base = parseFloat(suffixMatch[1]);
    const suffix = suffixMatch[2].toUpperCase();
    
    const multipliers = {
      'K': 1000,
      'M': 1000000,
      'B': 1000000000,
      'T': 1000000000000
    };
    
    return base * multipliers[suffix];
  }

  // Step 4: Direct numeric conversion
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Enhanced post-processing of AI extraction results
 * Applies normalization, validation, and cleanup
 */
function postProcessExtraction(aiData) {
  console.log('[WebWeaver-BG] 🔧 Post-processing extraction data...');
  
  // ✅ PRIORITY 5: Define fields that should be normalized
  const numericFields = {
    // E-commerce fields
    'price': 'currency',
    'original_price': 'currency',
    'discount_percentage': 'percentage',
    'rating': 'number',
    'average_rating': 'number',
    'number_of_reviews': 'abbreviation',
    'number_of_ratings': 'abbreviation',
    'stock_quantity': 'number',
    
    // Social media / engagement fields
    'followers': 'abbreviation',
    'likes': 'abbreviation',
    'views': 'abbreviation',
    'shares': 'abbreviation',
    
    // Recipe fields
    'prep_time': 'number',
    'cook_time': 'number',
    'servings': 'number',
    'calories': 'number',
    
    // Article fields
    'read_time': 'number',
    'word_count': 'abbreviation'
  };

  let normalizedCount = 0;
  
  // Normalize top-level fields
  for (const [field, type] of Object.entries(numericFields)) {
    if (aiData.hasOwnProperty(field)) {
      const originalValue = aiData[field];
      const normalizedValue = normalizeNumericField(originalValue);
      
      if (normalizedValue !== null && originalValue !== normalizedValue) {
        aiData[field] = normalizedValue;
        normalizedCount++;
        console.log(`[WebWeaver-BG] 📊 Normalized: ${field} | "${originalValue}" → ${normalizedValue}`);
      }
    }
  }

  // Handle array of products (multi-item extraction)
  if (Array.isArray(aiData)) {
    aiData = aiData.map(item => {
      for (const [field, type] of Object.entries(numericFields)) {
        if (item.hasOwnProperty(field)) {
          const originalValue = item[field];
          const normalizedValue = normalizeNumericField(originalValue);
          
          if (normalizedValue !== null && originalValue !== normalizedValue) {
            item[field] = normalizedValue;
            normalizedCount++;
          }
        }
      }
      return item;
    });
  }

  if (normalizedCount > 0) {
    console.log(`[WebWeaver-BG] ✅ Post-processing complete: ${normalizedCount} fields normalized`);
  } else {
    console.log('[WebWeaver-BG] ℹ️ Post-processing complete: No normalization needed');
  }

  return aiData;
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

    // ✅ PRIORITY 5: Apply post-processing normalization
    const cleanedData = postProcessExtraction(aiData);

    const confidence = cleanedData.confidence_score || 50;
    const finalData = {
      ...basicData,
      ...cleanedData,
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

    // ✅ PRIORITY 3A: Track ALL confidence scores regardless of threshold
    analyticsData.allExtractions++;
    analyticsData.totalConfidence += confidence;
    trackConfidenceDistribution(confidence);

    if (confidence >= CONFIG.confidenceThreshold) {
      analyticsData.successfulAI++;
      updateSiteStats(domain, true, confidence, 'ai');
      console.log(`[WebWeaver-BG] ✅ HIGH CONFIDENCE: ${confidence}%`);
      if (cleanedData.confidence_reasoning) {
        console.log(`[WebWeaver-BG] 💭 Reasoning: ${cleanedData.confidence_reasoning}`);
      }
    } else {
      analyticsData.failedAI++;
      updateSiteStats(domain, false, confidence, 'ai');
      console.log(`[WebWeaver-BG] ⚠️ LOW CONFIDENCE: ${confidence}%`);
      if (cleanedData.confidence_reasoning) {
        console.log(`[WebWeaver-BG] 💭 Reasoning: ${cleanedData.confidence_reasoning}`);
      }
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

    // Handle NONE classification
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

    // Layer 2: AI Fallback if uncertain
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

    // Layer 3: Prompt routing and extraction
    const promptVersion = getPromptForClassification(finalClassification);
    console.log(`[Background] 🤖 LAYER 3: Extracting with prompt ${promptVersion}...`);

    let candidateBlocks = [];
    if (finalClassification === 'MULTI_ITEM') {
      candidateBlocks = await chrome.tabs.sendMessage(tabId, { action: 'extractProductBlocks' });
    }

    const customPrompt = await generateCustomPrompt(finalClassification, pageData);
    const aiData = await extractWithAI(customPrompt, pageData, candidateBlocks);
    
    // ✅ PRIORITY 5: Apply post-processing normalization
    const cleanedData = postProcessExtraction(aiData);

    // ✅ ENHANCED: Extract confidence score from hybrid multi-object responses
    let confidence;
    let confidenceReasoning;

    if (cleanedData.confidence_score) {
      // Single object extraction
      confidence = cleanedData.confidence_score;
      confidenceReasoning = cleanedData.confidence_reasoning || 'Standard extraction';
    } else if (Array.isArray(cleanedData) && cleanedData.length > 0) {
      // Array extraction - use first item's confidence (all items have same score)
      confidence = cleanedData[0].confidence_score || 50;
      confidenceReasoning = cleanedData[0].confidence_reasoning || 'Multi-item extraction';
    } else if (typeof cleanedData === 'object' && cleanedData['0']) {
      // Object with numeric keys (your current hybrid structure)
      confidence = cleanedData['0'].confidence_score || 50;
      confidenceReasoning = cleanedData['0'].confidence_reasoning || 'Hybrid multi-item extraction';
    } else {
      // Fallback
      confidence = 50;
      confidenceReasoning = 'No confidence data available';
    }

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
      },
      confidence_score: confidence, // ✅ Ensure top-level confidence exists
      confidence_reasoning: confidenceReasoning
    };


    // ✅ PRIORITY 3A: Track ALL confidence scores regardless of threshold
    analyticsData.allExtractions++;
    analyticsData.totalConfidence += confidence; // ✅ FIXED: Use extracted confidence
    trackConfidenceDistribution(confidence);

    if (confidence >= CONFIG.confidenceThreshold) {
      analyticsData.successfulAI++;
      updateSiteStats(pageData.domain, true, confidence, 'hybrid');
      console.log(`[Background] ✅ HIGH CONFIDENCE: ${confidence}%`);
      console.log(`[Background] 💭 Reasoning: ${confidenceReasoning}`);
    } else {
      analyticsData.failedAI++;
      updateSiteStats(pageData.domain, false, confidence, 'hybrid');
      console.log(`[Background] ⚠️ LOW CONFIDENCE: ${confidence}%`);
      console.log(`[Background] 💭 Reasoning: ${confidenceReasoning}`);
    }


    console.log('[Background] ✅ Hybrid Pipeline complete!');
    console.log('[Background] 📊 Pipeline metrics:', resultData._hybrid);

    return { success: true, data: resultData };
  } catch (error) {
    console.error('[Background] ❌ Hybrid pipeline failed:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// PRIORITY 3A: ENHANCED ANALYTICS (Track ALL Confidence Scores)
// ============================================================================

function updateSiteStats(domain, success, confidence, method) {
  if (!analyticsData.perSite[domain]) {
    analyticsData.perSite[domain] = {
      total: 0,
      successful: 0,
      failed: 0,
      totalConfidence: 0, // ✅ NEW: Track all confidence for true average
      avgConfidence: 0,
      method: method
    };
  }

  const site = analyticsData.perSite[domain];
  site.total++;
  
  // ✅ PRIORITY 3A: Always track confidence, not just for successful extractions
  site.totalConfidence += confidence;
  
  if (success) {
    site.successful++;
  } else {
    site.failed++;
  }
  
  // Calculate true average (includes all attempts)
  site.avgConfidence = site.total > 0 ? site.totalConfidence / site.total : 0;
}

function getAnalytics() {
  // ✅ PRIORITY 3A: Calculate true average from ALL extractions
  const avgConfidence = analyticsData.allExtractions > 0
    ? analyticsData.totalConfidence / analyticsData.allExtractions
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
      allExtractions: analyticsData.allExtractions, // ✅ NEW: Total AI attempts
      avgConfidence: Math.round(avgConfidence), // ✅ FIXED: True average
      successRate: Math.round(successRate),
      passedThreshold: analyticsData.successfulAI,
      failedThreshold: analyticsData.failedAI,
      confidenceDistribution: analyticsData.confidenceDistribution // ✅ NEW: Show distribution
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
║   🎯 WEB WEAVER LIGHTNING - READY              ║
║   Version: ${CONFIG.version.padEnd(30)}║
║   Target: ${CONFIG.confidenceThreshold}% Confidence${' '.padEnd(28)}║
║   AI Status: ${aiEnabled ? 'ENABLED ✓' : 'DISABLED ✗'.padEnd(30)}║
║   Day 10: Hybrid Classifier ✅${' '.padEnd(21)}║
║   Upgrades: ALL PRIORITIES (1-5) ✅${' '.padEnd(13)}║
╚════════════════════════════════════════════════╝
  `);
})();

console.log('[Background] ✅ Background script with Hybrid Classifier ready!');
