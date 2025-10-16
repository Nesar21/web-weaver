// ═════════════════════════════════════════════════════════════════
// DAY 14+ UNIVERSAL CLASSIFIER - OPTION C: COMPLETE 3-TIER FALLBACK
// DOM Heuristics (Fast) → Visual Pattern → AI Semantic Analysis
// Handles: E-commerce, Social Media, Blogs, News, ANY Website
// 
// 🆕 TIER 3 AI CLASSIFICATION ADDED:
// - Semantic understanding with Gemini AI
// - Triggered when DOM/Visual uncertain
// - Solves Medium article false-positive issue
// - Universal, no hardcoding required
// ═════════════════════════════════════════════════════════════════


console.log('[Classifier] 🎯 Universal Classifier v3.3 (TIER 3 AI) loading...');


// ═════════════════════════════════════════════════════════════════
// SIGNATURE CACHE (5-second reuse for performance)
// ═════════════════════════════════════════════════════════════════
const SIGNATURE_CACHE = new WeakMap();
const SIGNATURE_CACHE_TIMESTAMP = new WeakMap();


/**
 * LAYER 1: UNIVERSAL DOM-BASED CLASSIFIER
 * Fast, free, local structural analysis
 * Works on ANY website - not limited to specific sites
 * Returns: SINGLE_ITEM | MULTI_ITEM | UNCERTAIN
 * 
 * 🆕 OPTION C: Includes uncertainty detection
 * 🆕 v3.3: Lower confidence for ambiguous cases (triggers AI)
 */
function classifyPageLayout() {
  console.log('[Classifier] LAYER 1: Universal Classification starting...');
  
  const startTime = performance.now();
  
  try {
    // Core HTML structure signals
    const signals = {
      // Article indicators
      articleCount: document.querySelectorAll('article').length,
      h1Count: document.querySelectorAll('h1').length,
      h2Count: document.querySelectorAll('h2').length,
      mainCount: document.querySelectorAll('main').length,
      sectionCount: document.querySelectorAll('section').length,
      
      // Content containers
      divCount: document.querySelectorAll('div').length,
      listItemCount: document.querySelectorAll('li').length,
      
      // Semantic structure
      navCount: document.querySelectorAll('nav').length,
      asideCount: document.querySelectorAll('aside').length,
      footerCount: document.querySelectorAll('footer').length,
      headerCount: document.querySelectorAll('header').length
    };
    
    // Calculate repeated block patterns
    signals.repeatedBlocksCount = detectRepeatedBlocks();
    
    console.log('[Classifier] DOM Signals:', {
      articles: signals.articleCount,
      repeatedBlocks: signals.repeatedBlocksCount,
      h2s: signals.h2Count,
      listItems: signals.listItemCount
    });
    
    // ═════════════════════════════════════════════════════════════════
    // CLASSIFICATION LOGIC
    // ═════════════════════════════════════════════════════════════════
    
    let classification = 'UNCERTAIN';
    let confidence = 50;
    let reasoning = '';
    
    // RULE 1: Single article page (blog post, news article)
    if (signals.articleCount === 1 && signals.h1Count === 1) {
      classification = 'SINGLE_ITEM';
      confidence = 85;
      reasoning = 'Single article with one H1';
    }
    
    // RULE 2: Multiple articles (article list, blog index)
    else if (signals.articleCount >= 3) {
      classification = 'MULTI_ITEM';
      confidence = 90;
      reasoning = `${signals.articleCount} article elements detected`;
    }
    
    // 🆕 RULE 2b: Medium-like structure (1 article + sidebar)
    // Lower confidence to trigger AI verification
    else if (signals.articleCount >= 1 && signals.repeatedBlocksCount > 5) {
      classification = 'MULTI_ITEM';
      confidence = 70; // 🔻 Lowered from 85 - triggers AI
      reasoning = 'Article + repeated blocks detected (ambiguous structure)';
    }
    
    // RULE 3: Repeated structural blocks (product cards, post cards)
    else if (signals.repeatedBlocksCount >= 5) {
      classification = 'MULTI_ITEM';
      confidence = 80;
      reasoning = `${signals.repeatedBlocksCount} repeated content blocks`;
    }
    
    // RULE 4: Long list (categories, products, search results)
    else if (signals.listItemCount > 20) {
      classification = 'MULTI_ITEM';
      confidence = 75;
      reasoning = `${signals.listItemCount} list items suggest collection`;
    }
    
    // RULE 5: Many H2s (sections in article OR multiple items)
    else if (signals.h2Count >= 8) {
      // Ambiguous - could be long article OR item list
      if (signals.mainCount === 1 && signals.articleCount <= 1) {
        classification = 'SINGLE_ITEM';
        confidence = 70;
        reasoning = 'Long article with many sections';
      } else {
        classification = 'MULTI_ITEM';
        confidence = 70;
        reasoning = 'Multiple content sections detected';
      }
    }
    
    // RULE 6: Single main with minimal structure
    else if (signals.mainCount === 1 && signals.sectionCount <= 3) {
      classification = 'SINGLE_ITEM';
      confidence = 65;
      reasoning = 'Single main element with simple structure';
    }
    
    // RULE 7: Fallback - analyze overall complexity
    else {
      if (signals.divCount > 100) {
        classification = 'MULTI_ITEM';
        confidence = 60;
        reasoning = 'Complex structure suggests multiple items';
      } else {
        classification = 'SINGLE_ITEM';
        confidence = 55;
        reasoning = 'Simple structure suggests single item';
      }
    }
    
    // ═════════════════════════════════════════════════════════════════
    // 🆕 OPTION C: UNCERTAINTY DETECTION
    // ═════════════════════════════════════════════════════════════════
    
    let uncertaintyScore = 0;
    const uncertaintyReasons = [];
    
    // Check for contradictory signals
    if (signals.articleCount > 0 && signals.repeatedBlocksCount > 5) {
      uncertaintyScore += 20;
      uncertaintyReasons.push('Articles present but also many repeated blocks');
    }
    
    if (signals.listItemCount > 20 && signals.mainCount === 1) {
      uncertaintyScore += 30;
      uncertaintyReasons.push('Many list items in single main container (complex feed structure)');
    }
    
    if (signals.h2Count > 10 && signals.repeatedBlocksCount > 8) {
      uncertaintyScore += 25;
      uncertaintyReasons.push('Many H2 headings + repeating content (ambiguous structure)');
    }
    
    // If div count is very high but no clear patterns
    if (signals.divCount > 200 && signals.repeatedBlocksCount < 3) {
      uncertaintyScore += 20;
      uncertaintyReasons.push('Very complex DOM but no clear repeated patterns');
    }
    
    // 🆕 Medium-specific ambiguity detection
    if (signals.articleCount === 1 && signals.asideCount > 2 && signals.sectionCount > 5) {
      uncertaintyScore += 25;
      uncertaintyReasons.push('Single article with complex sidebar structure (Medium-like)');
    }
    
    // Check if confidence is already low
    if (confidence < 75) {
      uncertaintyScore += 15;
      uncertaintyReasons.push('Low initial classification confidence');
    }
    
    // ═════════════════════════════════════════════════════════════════
    // 🆕 v3.3: TRIGGER AI IF CONFIDENCE < 80% OR HIGH UNCERTAINTY
    // ═════════════════════════════════════════════════════════════════
    
    const aiTriggerThreshold = CONFIG?.AI_CLASSIFICATION?.triggerThreshold || 80;
    const uncertaintyThreshold = CONFIG?.UNCERTAINTY_DETECTION?.uncertaintyThreshold || 40;
    
    const shouldTriggerAI = (
      confidence < aiTriggerThreshold || 
      uncertaintyScore > uncertaintyThreshold
    );
    
    if (shouldTriggerAI) {
      console.log('[Classifier] ⚠️ AI VERIFICATION NEEDED');
      console.log('[Classifier] Confidence:', confidence, '/ Threshold:', aiTriggerThreshold);
      console.log('[Classifier] Uncertainty Score:', uncertaintyScore, '/ Threshold:', uncertaintyThreshold);
      
      const duration = performance.now() - startTime;
      
      return {
        classification: 'UNCERTAIN',
        confidence: Math.max(30, confidence - uncertaintyScore),
        tier: 'dom',
        reasoning: `DOM classification uncertain: ${uncertaintyReasons.join('; ')}`,
        tryAI: true, // 🆕 FLAG TO TRIGGER AI TIER
        uncertaintyScore,
        uncertaintyReasons,
        duration: Math.round(duration),
        domDetails: {
          ...signals,
          uncertaintyAnalysis: {
            score: uncertaintyScore,
            threshold: uncertaintyThreshold,
            triggered: true
          }
        }
      };
    }
    
    // ═════════════════════════════════════════════════════════════════
    // RETURN CONFIDENT RESULT
    // ═══════════════════════════════════════════════════════════════════
    
    const duration = performance.now() - startTime;
    
    console.log('[Classifier] ✅ DOM Classification:', classification);
    console.log('[Classifier] Confidence:', confidence + '%');
    console.log('[Classifier] Duration:', Math.round(duration) + 'ms');
    
    return {
      classification,
      confidence,
      tier: 'dom',
      reasoning,
      duration: Math.round(duration),
      domDetails: {
        ...signals,
        uncertaintyAnalysis: {
          score: uncertaintyScore,
          threshold: uncertaintyThreshold,
          triggered: false
        }
      }
    };
    
  } catch (error) {
    console.error('[Classifier] DOM classification error:', error);
    
    return {
      classification: 'UNCERTAIN',
      confidence: 30,
      tier: 'dom',
      reasoning: 'DOM classification failed: ' + error.message,
      tryAI: true, // Try AI tier on error
      error: error.message
    };
  }
}


/**
 * Detect repeated block patterns in the DOM
 * Looks for similar elements with similar structure
 */
function detectRepeatedBlocks() {
  try {
    const candidates = [
      ...document.querySelectorAll('div[class*="card"]'),
      ...document.querySelectorAll('div[class*="item"]'),
      ...document.querySelectorAll('div[class*="product"]'),
      ...document.querySelectorAll('div[class*="post"]'),
      ...document.querySelectorAll('div[class*="article"]'),
      ...document.querySelectorAll('div[class*="entry"]'),
      ...document.querySelectorAll('[data-testid*="card"]'),
      ...document.querySelectorAll('[data-testid*="item"]')
    ];
    
    // Deduplicate
    const uniqueCandidates = [...new Set(candidates)];
    
    // Filter elements with similar structure
    const groups = new Map();
    
    for (const el of uniqueCandidates) {
      const signature = `${el.tagName}-${el.children.length}-${el.className.split(' ').slice(0, 2).join(' ')}`;
      
      if (!groups.has(signature)) {
        groups.set(signature, []);
      }
      groups.get(signature).push(el);
    }
    
    // Find largest group
    let maxGroupSize = 0;
    for (const group of groups.values()) {
      if (group.length > maxGroupSize) {
        maxGroupSize = group.length;
      }
    }
    
    return maxGroupSize;
    
  } catch (error) {
    console.warn('[Classifier] Error detecting repeated blocks:', error);
    return 0;
  }
}


// ═════════════════════════════════════════════════════════════════
// LAYER 2: VISUAL PATTERN DETECTION (TIER 2)
// Smart similarity-based detection for JS-heavy sites
// Uses visual layout patterns to detect repeated items
// ═════════════════════════════════════════════════════════════════


/**
 * Detect page type using visual similarity patterns
 * Wrapped with timeout protection
 */
async function detectByVisualPatternsWithTimeout(timeoutMs = 2000) {
  console.log('[Classifier] LAYER 2: Visual Pattern Detection starting...');
  console.log('[Classifier] Timeout:', timeoutMs + 'ms');
  
  const startTime = performance.now();
  
  return new Promise((resolve) => {
    // Set timeout
    const timeoutId = setTimeout(() => {
      console.warn('[Classifier] ⏱️ Visual detection timeout reached');
      resolve({
        classification: 'UNCERTAIN',
        confidence: 40,
        tier: 'visual',
        reasoning: 'Visual detection timed out',
        timeout: true,
        duration: timeoutMs
      });
    }, timeoutMs);
    
    // Try visual detection
    try {
      const result = detectByVisualPatterns();
      clearTimeout(timeoutId);
      
      const duration = performance.now() - startTime;
      result.duration = Math.round(duration);
      
      console.log('[Classifier] ✅ Visual detection complete:', result.classification);
      console.log('[Classifier] Confidence:', result.confidence + '%');
      console.log('[Classifier] Duration:', Math.round(duration) + 'ms');
      
      resolve(result);
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[Classifier] Visual detection error:', error);
      
      resolve({
        classification: 'UNCERTAIN',
        confidence: 30,
        tier: 'visual',
        reasoning: 'Visual detection failed: ' + error.message,
        error: error.message,
        duration: Math.round(performance.now() - startTime)
      });
    }
  });
}


/**
 * Core visual pattern detection logic
 * Analyzes visual layout and structure
 */
function detectByVisualPatterns() {
  const config = CONFIG?.VISUAL_DETECTION || {};
  const sizeThreshold = config.sizeThreshold || 0.20;
  const positionThreshold = config.positionThreshold || 50;
  const minItems = config.minItems || 5;
  const maxCandidates = config.maxCandidates || 200;
  
  // Get all visible elements
  let candidates = Array.from(document.querySelectorAll('div, article, section, li'));
  
  // Filter visible elements with minimum size
  candidates = candidates.filter(el => {
    const rect = getElementBounds(el);
    const area = rect.width * rect.height;
    return area > (config.minElementArea || 200) && 
           rect.width < window.innerWidth * (config.maxFullWidthRatio || 0.90);
  });
  
  console.log('[Classifier] Visual candidates:', candidates.length);
  
  // Limit candidates if too many
  if (candidates.length > maxCandidates) {
    const samplingRate = config.samplingRate || 3;
    candidates = candidates.filter((_, i) => i % samplingRate === 0);
    console.log('[Classifier] Sampled to:', candidates.length, 'elements');
  }
  
  // Group by visual similarity
  const groups = [];
  
  for (const el of candidates) {
    const signature = getElementVisualSignature(el);
    if (!signature) continue;
    
    let addedToGroup = false;
    
    for (const group of groups) {
      if (areVisuallySimilar(signature, group.signature, sizeThreshold, positionThreshold)) {
        group.elements.push(el);
        addedToGroup = true;
        break;
      }
    }
    
    if (!addedToGroup) {
      groups.push({
        signature,
        elements: [el]
      });
    }
  }
  
  // Find largest group
  const largestGroup = groups.reduce((max, group) => 
    group.elements.length > (max?.elements?.length || 0) ? group : max,
    null
  );
  
  console.log('[Classifier] Largest visual group:', largestGroup?.elements?.length || 0, 'elements');
  
  if (largestGroup && largestGroup.elements.length >= minItems) {
    return {
      classification: 'MULTI_ITEM',
      confidence: Math.min(90, 60 + (largestGroup.elements.length * 2)),
      tier: 'visual',
      reasoning: `${largestGroup.elements.length} visually similar elements detected`,
      visualGroups: groups.length,
      largestGroupSize: largestGroup.elements.length
    };
  } else {
    return {
      classification: 'SINGLE_ITEM',
      confidence: 70,
      tier: 'visual',
      reasoning: 'No significant visual pattern groups found',
      visualGroups: groups.length,
      largestGroupSize: largestGroup?.elements?.length || 0
    };
  }
}


/**
 * Get cached or calculate element bounds
 */
function getElementBounds(el) {
  // Check cache
  if (SIGNATURE_CACHE.has(el)) {
    const timestamp = SIGNATURE_CACHE_TIMESTAMP.get(el);
    if (Date.now() - timestamp < 5000) {
      return SIGNATURE_CACHE.get(el);
    }
  }
  
  // Calculate
  const rect = el.getBoundingClientRect();
  const bounds = {
    width: rect.width,
    height: rect.height,
    x: rect.x,
    y: rect.y
  };
  
  // Cache
  SIGNATURE_CACHE.set(el, bounds);
  SIGNATURE_CACHE_TIMESTAMP.set(el, Date.now());
  
  return bounds;
}


/**
 * Get visual signature for an element
 */
function getElementVisualSignature(el) {
  try {
    const rect = getElementBounds(el);
    
    // Skip if not visible or too small
    if (rect.width < 50 || rect.height < 50) {
      return null;
    }
    
    // Create signature
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      childCount: el.children.length,
      textLength: el.textContent?.trim().length || 0,
      hasImage: el.querySelector('img') !== null,
      hasLink: el.querySelector('a') !== null,
      className: el.className
    };
    
  } catch (error) {
    return null;
  }
}


/**
 * Check if two signatures are visually similar
 */
function areVisuallySimilar(sig1, sig2, sizeThreshold, positionThreshold) {
  if (!sig1 || !sig2) return false;
  
  // Check size similarity (within threshold percentage)
  const widthDiff = Math.abs(sig1.width - sig2.width) / Math.max(sig1.width, sig2.width);
  const heightDiff = Math.abs(sig1.height - sig2.height) / Math.max(sig1.height, sig2.height);
  
  if (widthDiff > sizeThreshold || heightDiff > sizeThreshold) {
    return false;
  }
  
  // Check position similarity (x-axis mainly - for vertical lists)
  const xDiff = Math.abs(sig1.x - sig2.x);
  if (xDiff > positionThreshold) {
    return false;
  }
  
  // Check structural similarity
  const structureScore = calculateStructureSimilarity(sig1, sig2);
  const minStructureWeight = CONFIG?.VISUAL_DETECTION?.structureWeight || 0.50;
  
  return structureScore >= minStructureWeight;
}


/**
 * Calculate structural similarity between two elements
 */
function calculateStructureSimilarity(sig1, sig2) {
  const weights = CONFIG?.VISUAL_DETECTION?.structureWeights || {
    childCount: 0.40,
    textLength: 0.30,
    hasImage: 0.15,
    hasLink: 0.15
  };
  
  let score = 0;
  
  // Child count similarity
  if (sig1.childCount === sig2.childCount) {
    score += weights.childCount;
  } else if (Math.abs(sig1.childCount - sig2.childCount) <= 2) {
    score += weights.childCount * 0.5;
  }
  
  // Text length similarity (within 50%)
  const textDiff = Math.abs(sig1.textLength - sig2.textLength);
  const avgText = (sig1.textLength + sig2.textLength) / 2;
  if (avgText > 0 && textDiff / avgText < 0.5) {
    score += weights.textLength;
  }
  
  // Image presence
  if (sig1.hasImage === sig2.hasImage) {
    score += weights.hasImage;
  }
  
  // Link presence
  if (sig1.hasLink === sig2.hasLink) {
    score += weights.hasLink;
  }
  
  return score;
}


// ═════════════════════════════════════════════════════════════════
// 🆕 LAYER 3: AI SEMANTIC CLASSIFICATION (TIER 3)
// Gemini-powered semantic understanding
// Triggered when DOM/Visual uncertain
// Solves complex cases like Medium articles with sidebars
// ═════════════════════════════════════════════════════════════════


/**
 * TIER 3: AI-BASED SEMANTIC CLASSIFICATION
 * Uses Gemini to understand page semantics
 * Distinguishes main content from sidebar/navigation
 * 
 * @returns {Promise<Object>} Classification result
 */
async function classifyWithAI() {
  console.log('[Classifier] 🤖 TIER 3: AI Classification starting...');
  
  const startTime = performance.now();
  const config = CONFIG?.AI_CLASSIFICATION || {};
  const timeout = config.timeout || 5000;
  
  return new Promise(async (resolve) => {
    // Set timeout
    const timeoutId = setTimeout(() => {
      console.warn('[Classifier] ⏱️ AI classification timeout');
      resolve({
        classification: 'UNCERTAIN',
        confidence: 40,
        tier: 'ai',
        reasoning: 'AI classification timed out',
        timeout: true,
        duration: timeout
      });
    }, timeout);
    
    try {
      // ═════════════════════════════════════════════════════════════
      // EXTRACT PAGE CONTENT FOR AI ANALYSIS
      // ═════════════════════════════════════════════════════════════
      
      // Get main content area
      const mainContent = document.querySelector('main, article, [role="main"]');
      const contentText = (mainContent || document.body).innerText.substring(0, 2000);
      
      // Get headings
      const h1s = Array.from(document.querySelectorAll('h1'))
        .map(h => h.textContent.trim())
        .slice(0, 5);
      
      const h2s = Array.from(document.querySelectorAll('h2'))
        .map(h => h.textContent.trim())
        .slice(0, 10);
      
      // Get page title
      const pageTitle = document.title;
      
      // Get URL
      const pageURL = window.location.href;
      
      console.log('[Classifier] Extracted content for AI:', {
        contentLength: contentText.length,
        h1Count: h1s.length,
        h2Count: h2s.length
      });
      
      // ═════════════════════════════════════════════════════════════
      // BUILD AI PROMPT
      // ═════════════════════════════════════════════════════════════
      
      const prompt = `Analyze this webpage and classify it as either a single article/page OR a collection of multiple items.

**IGNORE sidebars, navigation, and recommendations.** Focus only on the MAIN CONTENT AREA.

PAGE TITLE: ${pageTitle}

URL: ${pageURL}

H1 HEADINGS (${h1s.length}):
${h1s.join('\n')}

H2 HEADINGS (first 10):
${h2s.slice(0, 10).join('\n')}

MAIN CONTENT PREVIEW (first 2000 chars):
${contentText}

TASK: Classify the MAIN CONTENT (ignore sidebars):
- SINGLE_ITEM: One article, blog post, product page, landing page, or document
- MULTI_ITEM: Feed, search results, product listings, news aggregator, or directory

Respond ONLY with JSON:
{
  "classification": "SINGLE_ITEM" or "MULTI_ITEM",
  "confidence": 0-100,
  "reasoning": "brief explanation focusing on main content, not sidebar"
}`;

      console.log('[Classifier] Calling Gemini API...');
      
      // ═════════════════════════════════════════════════════════════
      // CALL GEMINI API
      // ═════════════════════════════════════════════════════════════
      
      // Get API key from storage
      const result = await chrome.storage.local.get(['geminiApiKey']);
      const apiKey = result.geminiApiKey;
      
      if (!apiKey) {
        throw new Error('API key not configured');
      }
      
      const apiEndpoint = CONFIG?.API_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models';
      const model = CONFIG?.GEMINI_LITE_MODEL || 'gemini-2.0-flash-lite';
      
      const response = await fetch(
        `${apiEndpoint}/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 256
            }
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log('[Classifier] Gemini API response received');
      
      // ═════════════════════════════════════════════════════════════
      // PARSE AI RESPONSE
      // ═════════════════════════════════════════════════════════════
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('No text in AI response');
      }
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      
      const aiResult = JSON.parse(jsonMatch[0]);
      
      console.log('[Classifier] 🤖 AI Result:', aiResult.classification);
      console.log('[Classifier] 🤖 AI Confidence:', aiResult.confidence + '%');
      console.log('[Classifier] 🤖 AI Reasoning:', aiResult.reasoning);
      
      clearTimeout(timeoutId);
      
      const duration = performance.now() - startTime;
      
      resolve({
        classification: aiResult.classification,
        confidence: aiResult.confidence,
        tier: 'ai',
        reasoning: aiResult.reasoning,
        duration: Math.round(duration),
        fallbackChain: ['dom-uncertain', 'ai-success']
      });
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[Classifier] ❌ AI classification failed:', error);
      
      const duration = performance.now() - startTime;
      
      resolve({
        classification: 'UNCERTAIN',
        confidence: 30,
        tier: 'ai-error',
        reasoning: `AI classification failed: ${error.message}`,
        error: error.message,
        duration: Math.round(duration)
      });
    }
  });
}


// ═════════════════════════════════════════════════════════════════
// 🆕 v3.3: UNIVERSAL CLASSIFICATION ORCHESTRATOR WITH AI
// Coordinates DOM → Visual → AI fallback chain
// ═════════════════════════════════════════════════════════════════


/**
 * Main classification entry point with 3-tier fallback chain
 * This is the function called from content.js
 */
async function classifyPageWithFallback() {
  console.log('[Classifier] ═══════════════════════════════════════════════');
  console.log('[Classifier] v3.3: Universal Classification Starting');
  console.log('[Classifier] ═══════════════════════════════════════════════');
  
  const startTime = performance.now();
  
  try {
    // ═════════════════════════════════════════════════════════════════
    // TIER 1: DOM CLASSIFICATION (Fast, always try first)
    // ═════════════════════════════════════════════════════════════════
    
    console.log('[Classifier] 🔍 TIER 1: DOM Analysis...');
    const domResult = classifyPageLayout();
    
    console.log('[Classifier] DOM Result:', domResult.classification);
    console.log('[Classifier] DOM Confidence:', domResult.confidence + '%');
    
    // ═════════════════════════════════════════════════════════════════
    // 🆕 v3.3: CHECK IF AI TIER NEEDED
    // ═════════════════════════════════════════════════════════════════
    
    if (domResult.tryAI || domResult.classification === 'UNCERTAIN') {
      console.log('[Classifier] ⚠️ DOM uncertain, triggering AI verification');
      console.log('[Classifier] 🔍 TIER 3: AI Semantic Analysis...');
      
      // Try AI classification
      const aiResult = await classifyWithAI();
      
      console.log('[Classifier] AI Result:', aiResult.classification);
      console.log('[Classifier] AI Confidence:', aiResult.confidence + '%');
      
      // If AI succeeded with good confidence, use it
      const minAIConfidence = CONFIG?.AI_CLASSIFICATION?.minConfidence || 75;
      
      if (aiResult.classification !== 'UNCERTAIN' && 
          aiResult.confidence >= minAIConfidence &&
          !aiResult.timeout) {
        
        console.log('[Classifier] ✅ AI tier successful, using AI result');
        
        const totalDuration = performance.now() - startTime;
        
        return {
          ...aiResult,
          totalDuration: Math.round(totalDuration),
          fallbackChain: ['dom-uncertain', 'ai-success'],
          domResult: {
            classification: domResult.classification,
            confidence: domResult.confidence,
            uncertaintyScore: domResult.uncertaintyScore
          }
        };
      } else {
        console.log('[Classifier] ⚠️ AI tier also uncertain, trying visual...');
        
        // Fallback to visual tier
        const visualTimeout = CONFIG?.TIMEOUTS?.visualDetection || 2000;
        const visualResult = await detectByVisualPatternsWithTimeout(visualTimeout);
        
        console.log('[Classifier] Visual Result:', visualResult.classification);
        console.log('[Classifier] Visual Confidence:', visualResult.confidence + '%');
        
        const minVisualConfidence = CONFIG?.VISUAL_DETECTION?.minPatternConfidence || 75;
        
        if (visualResult.classification !== 'UNCERTAIN' && 
            visualResult.confidence >= minVisualConfidence &&
            !visualResult.timeout) {
          
          console.log('[Classifier] ✅ Visual tier successful, using visual result');
          
          const totalDuration = performance.now() - startTime;
          
          return {
            ...visualResult,
            totalDuration: Math.round(totalDuration),
            fallbackChain: ['dom-uncertain', 'ai-uncertain', 'visual-success'],
            domResult: {
              classification: domResult.classification,
              confidence: domResult.confidence
            },
            aiResult: {
              classification: aiResult.classification,
              confidence: aiResult.confidence
            }
          };
        }
      }
    }
    
    // ═════════════════════════════════════════════════════════════════
    // FINAL FALLBACK - DEFAULT TO MULTI_ITEM IF ALL TIERS UNCERTAIN
    // ═════════════════════════════════════════════════════════════════
    
    if (domResult.classification === 'UNCERTAIN') {
      console.log('[Classifier] 🤔 All tiers uncertain');
      console.log('[Classifier] 🎯 Defaulting to MULTI_ITEM for AI extraction');
      
      const fallbackConfig = CONFIG?.UNCERTAINTY_DETECTION;
      const shouldFallbackToMulti = fallbackConfig?.fallbackToMultiItem !== false;
      const fallbackConfidence = fallbackConfig?.fallbackConfidence || 60;
      
      if (shouldFallbackToMulti) {
        const totalDuration = performance.now() - startTime;
        
        return {
          classification: 'MULTI_ITEM',
          confidence: fallbackConfidence,
          tier: 'fallback',
          reasoning: 'Uncertain structure detected - defaulting to MULTI_ITEM for AI extraction',
          totalDuration: Math.round(totalDuration),
          fallbackChain: ['dom-uncertain', 'ai-uncertain', 'visual-uncertain', 'fallback-multi']
        };
      }
    }
    
    // ═════════════════════════════════════════════════════════════════
    // RETURN DOM RESULT (Confident classification)
    // ═════════════════════════════════════════════════════════════════
    
    console.log('[Classifier] ✅ DOM tier confident, using DOM result');
    
    const totalDuration = performance.now() - startTime;
    
    return {
      ...domResult,
      totalDuration: Math.round(totalDuration),
      fallbackChain: ['dom-success']
    };
    
  } catch (error) {
    console.error('[Classifier] ❌ Classification error:', error);
    
    // Emergency fallback
    return {
      classification: 'MULTI_ITEM',
      confidence: 50,
      tier: 'error-fallback',
      reasoning: 'Classification failed - defaulting to MULTI_ITEM: ' + error.message,
      error: error.message,
      totalDuration: Math.round(performance.now() - startTime),
      fallbackChain: ['error']
    };
  } finally {
    const totalDuration = performance.now() - startTime;
    console.log('[Classifier] ═══════════════════════════════════════════════');
    console.log('[Classifier] Classification Complete in', Math.round(totalDuration) + 'ms');
    console.log('[Classifier] ═══════════════════════════════════════════════');
  }
}


// ═════════════════════════════════════════════════════════════════
// BACKWARD COMPATIBILITY WRAPPER
// Keep existing function name for content.js compatibility
// ═════════════════════════════════════════════════════════════════


/**
 * Main classification function (called from content.js)
 * This is the public API that content.js expects
 */
async function classifyPage() {
  return await classifyPageWithFallback();
}


// ═════════════════════════════════════════════════════════════════
// EXPORTS & INITIALIZATION
// ═════════════════════════════════════════════════════════════════


// Make functions available globally
self.classifyPage = classifyPage;
self.classifyPageLayout = classifyPageLayout;
self.detectByVisualPatterns = detectByVisualPatterns;
self.detectByVisualPatternsWithTimeout = detectByVisualPatternsWithTimeout;
self.classifyPageWithFallback = classifyPageWithFallback;
self.classifyWithAI = classifyWithAI; // 🆕 Export AI function


console.log('[Classifier] ═══════════════════════════════════════════════');
console.log('[Classifier] ✅ Universal Classifier v3.3 (TIER 3 AI) Loaded');
console.log('[Classifier] ═══════════════════════════════════════════════');
console.log('[Classifier] TIER 1: DOM Heuristics (Fast & Free)');
console.log('[Classifier] TIER 2: Visual Patterns (2000ms timeout)');
console.log('[Classifier] TIER 3: AI Semantic Analysis (5000ms timeout)');
console.log('[Classifier] AI Trigger: Confidence < 80% or Uncertainty > 40');
console.log('[Classifier] Solves: Medium article false-positive issue');
console.log('[Classifier] Works on: ANY WEBSITE (Universal)');
console.log('[Classifier] ═══════════════════════════════════════════════');
