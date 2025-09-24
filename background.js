// Day 4 Enhanced Background Script with AI Integration + Day 5 REAL Validation
console.log('Web Weaver Lightning Background v1.0 Day 5 - Starting...');

// AI Configuration Management
let AI_CONFIG = {
  model: 'gemini-2.0-flash',
  maxTokens: 2000,
  apiKey: null
};

// Load API key from storage on startup
chrome.storage.local.get(['geminiApiKey'], (result) => {
  if (result.geminiApiKey) {
    AI_CONFIG.apiKey = result.geminiApiKey;
    console.log('[Background] API key loaded from storage');
  } else {
    console.log('[Background] No API key found - please configure');
  }
});

// ✅ DIRECT AI EXTRACTION IMPLEMENTATION (No external modules needed)
async function executeAIExtraction(pageContent, apiConfig) {
  const startTime = Date.now();
  try {
    console.log('[Background] Starting REAL AI extraction...');
    
    if (!apiConfig.apiKey) {
      throw new Error('API key not configured');
    }
    
    if (!pageContent || pageContent.length < 50) {
      throw new Error('Insufficient content for extraction');
    }

    // Prepare content for AI processing
    const truncatedContent = pageContent.length > 8000 ?
      pageContent.substring(0, 8000) + '...' : pageContent;
    console.log(`[Background] Processing ${truncatedContent.length} characters with REAL AI...`);

    // ✅ PERFECTED Gemini API payload
    const payload = {
      contents: [{
        parts: [{
          text: `Extract structured data from this webpage content and return ONLY a valid JSON object with these exact fields:

- title: main page title
- description: brief summary (1-2 sentences)
- author: author name if found
- date: publication date if found
- category: content category (news/blog/product/docs/etc)
- links: array of important URLs mentioned
- images: array of important image descriptions
- content: key content summary (100 words max)

Webpage content:
${truncatedContent}`
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: apiConfig.maxTokens || 2000,
        responseMimeType: "application/json"
      }
    };

    console.log('[Background] Calling REAL Gemini API...');

    // Call REAL Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${apiConfig.model}:generateContent?key=${apiConfig.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('[Background] REAL AI response received');

    // Extract the generated content
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
      throw new Error('Invalid Gemini API response structure');
    }

    const generatedText = result.candidates[0].content.parts[0].text;
    console.log('[Background] Generated content:', generatedText.substring(0, 200) + '...');

    // ✅ CSP-Safe JSON parsing
    let aiData;
    try {
      aiData = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('[Background] JSON parse failed:', parseError);
      // Try to extract JSON from text if wrapped
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    // Enforce schema
    const cleanedData = enforceSchemaLocal(aiData);
    const duration = Date.now() - startTime;

    console.log(`[Background] REAL AI extraction completed in ${duration}ms`);
    return {
      success: true,
      data: cleanedData,
      metadata: {
        model: apiConfig.model,
        extractionTime: duration,
        contentLength: pageContent.length,
        tokensApprox: Math.ceil(pageContent.length / 4),
        realAI: true
      }
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Background] REAL AI extraction failed:', error);
    return {
      success: false,
      error: error.message,
      metadata: {
        extractionTime: duration,
        failed: true,
        realAI: true
      }
    };
  }
}

// ✅ LOCAL SCHEMA ENFORCEMENT (No external dependencies)
function enforceSchemaLocal(data) {
  const SCHEMA_FIELDS = ['title', 'description', 'author', 'date', 'content', 'links', 'images', 'category'];
  const cleanedData = {};

  SCHEMA_FIELDS.forEach(field => {
    cleanedData[field] = data[field] || null;
  });

  // Ensure arrays are arrays
  cleanedData.links = Array.isArray(cleanedData.links) ? cleanedData.links : [];
  cleanedData.images = Array.isArray(cleanedData.images) ? cleanedData.images : [];

  return cleanedData;
}

// ✅ DAY 5: REAL VALIDATION SUITE IMPLEMENTATION
async function runRealValidationSuite() {
  const suiteStartTime = Date.now();
  console.log('[Background] Starting REAL AI validation suite - NO SIMULATION');
  
  if (!AI_CONFIG.apiKey) {
    throw new Error('Gemini API key required for REAL AI validation');
  }

  // Ground truth data for validation
  const groundTruthSites = [
    {
      name: "Bloomberg Business News",
      content: "Fed Signals Rate Cuts Ahead as Inflation Cools. Federal Reserve Chair Jerome Powell hinted at potential rate cuts in upcoming meetings as core inflation metrics show sustained cooling trends across major economic sectors.",
      groundTruth: {
        title: "Fed Signals Rate Cuts Ahead as Inflation Cools",
        description: "Federal Reserve officials indicate potential interest rate reductions following latest inflation data showing cooling price pressures.",
        author: "Sarah Chen",
        date: "2024-09-24",
        category: "news",
        content: "Federal Reserve Chair Jerome Powell hinted at potential rate cuts in upcoming meetings as core inflation metrics show sustained cooling trends across major economic sectors.",
        links: ["https://www.federalreserve.gov", "https://www.bls.gov/cpi"],
        images: ["Federal Reserve building exterior", "Interest rate chart"]
      }
    },
    {
      name: "Wikipedia Article", 
      content: "Artificial Intelligence is intelligence demonstrated by machines, in contrast to natural intelligence displayed by animals including humans. AI leverages computational systems to perform tasks that typically require human intelligence.",
      groundTruth: {
        title: "Artificial Intelligence",
        description: "AI is intelligence demonstrated by machines, in contrast to natural intelligence displayed by animals including humans.",
        author: "Wikipedia Contributors",
        date: "2024-09-20",
        category: "documentation",
        content: "Artificial intelligence leverages computational systems to perform tasks that typically require human intelligence, including visual perception, speech recognition, and decision-making.",
        links: ["https://en.wikipedia.org/wiki/Machine_learning", "https://en.wikipedia.org/wiki/Neural_network"],
        images: ["AI neural network diagram", "Robot illustration"]
      }
    },
    {
      name: "Medium Blog Post",
      content: "Building Scalable Web Extensions in 2024: A Comprehensive Guide. Modern web extensions require careful architecture planning, especially when integrating AI services like Gemini while maintaining CSP compliance.",
      groundTruth: {
        title: "Building Scalable Web Extensions in 2024",
        description: "A comprehensive guide to modern web extension development with Manifest V3 and AI integration best practices.",
        author: "Alex Rodriguez",
        date: "2024-09-15",
        category: "blog",
        content: "Modern web extensions require careful architecture planning, especially when integrating AI services like Gemini while maintaining CSP compliance and performance optimization.",
        links: ["https://developer.chrome.com/docs/extensions", "https://developer.mozilla.org/docs/Mozilla/Add-ons"],
        images: ["Extension architecture diagram", "Chrome Web Store screenshot"]
      }
    }
  ];

  const results = [];
  let totalScore = 0;

  // Test each site with REAL AI engine
  for (const site of groundTruthSites) {
    console.log(`[Validation] Testing ${site.name} with REAL Gemini AI...`);
    
    try {
      // ✅ CALL REAL AI ENGINE - NO SIMULATION
      const aiResult = await executeAIExtraction(site.content, AI_CONFIG);
      
      if (!aiResult.success) {
        results.push({
          site: site.name,
          success: false,
          error: aiResult.error,
          score: 0,
          passed: false
        });
        continue;
      }

      // Calculate accuracy using real validation engine
      const accuracy = calculateAccuracy(aiResult.data, site.groundTruth);
      totalScore += accuracy.totalScore;

      results.push({
        site: site.name,
        success: true,
        score: accuracy.totalScore,
        passed: accuracy.totalScore >= 60,
        fieldScores: accuracy.fieldScores,
        details: accuracy.details,
        aiMetadata: aiResult.metadata,
        validationMetadata: accuracy.metadata
      });

      console.log(`[Validation] ${site.name}: ${accuracy.totalScore.toFixed(1)}% accuracy (REAL AI tested)`);

    } catch (error) {
      console.error(`[Validation] Error testing ${site.name}:`, error);
      results.push({
        site: site.name,
        success: false,
        error: error.message,
        score: 0,
        passed: false
      });
    }
  }

  const averageScore = results.length > 0 ? totalScore / results.length : 0;
  const suiteDuration = Date.now() - suiteStartTime;

  const validationResults = {
    overallScore: Math.round(averageScore * 100) / 100,
    sitesCount: groundTruthSites.length,
    passedCount: results.filter(r => r.success && r.score >= 60).length,
    failedCount: results.filter(r => !r.success || r.score < 60).length,
    results: results,
    timestamp: new Date().toISOString(),
    passed: averageScore >= 60,
    suiteDuration: suiteDuration,
    realAITested: true,
    methodology: "Professional field-weighted scoring with REAL Gemini 2.0 Flash"
  };

  console.log(`[Validation] REAL AI Suite Complete: ${validationResults.overallScore}% accuracy`);
  return validationResults;
}

// ✅ REAL ACCURACY CALCULATION
function calculateAccuracy(aiResult, groundTruth) {
  const FIELD_WEIGHTS = {
    title: 25, description: 20, content: 15,
    author: 10, date: 10, category: 10,
    links: 5, images: 5
  };

  const SCHEMA_FIELDS = Object.keys(FIELD_WEIGHTS);
  const startTime = Date.now();
  const scores = {};
  let totalScore = 0;
  let details = [];

  SCHEMA_FIELDS.forEach(field => {
    const aiValue = aiResult[field];
    const truthValue = groundTruth[field];
    const weight = FIELD_WEIGHTS[field];

    let fieldScore = 0;
    let status = 'missing';
    let comment = '';

    if (aiValue && truthValue) {
      if (Array.isArray(aiValue) && Array.isArray(truthValue)) {
        const overlap = aiValue.filter(item => 
          truthValue.some(truth => 
            String(item).toLowerCase().includes(String(truth).toLowerCase()) ||
            String(truth).toLowerCase().includes(String(item).toLowerCase())
          )
        ).length;
        fieldScore = Math.min(100, (overlap / Math.max(truthValue.length, 1)) * 100);
        status = fieldScore >= 70 ? 'good' : fieldScore >= 40 ? 'partial' : 'poor';
        comment = `${overlap}/${truthValue.length} items matched`;
      } else {
        const similarity = calculateStringSimilarity(String(aiValue), String(truthValue));
        fieldScore = similarity * 100;
        status = fieldScore >= 80 ? 'excellent' : fieldScore >= 60 ? 'good' : fieldScore >= 30 ? 'partial' : 'poor';
        comment = `${fieldScore.toFixed(1)}% similarity`;
      }
    } else if (aiValue && !truthValue) {
      fieldScore = 30;
      status = 'extra';
      comment = 'AI found data not in ground truth';
    } else if (!aiValue && truthValue) {
      fieldScore = 0;
      status = 'missed';
      comment = 'AI missed required field';
    }

    const weightedScore = (fieldScore / 100) * weight;
    totalScore += weightedScore;

    scores[field] = {
      raw: fieldScore,
      weighted: weightedScore,
      weight: weight,
      status: status,
      comment: comment,
      passed: fieldScore >= 60
    };

    details.push(`${field}: ${fieldScore.toFixed(1)}% (${status}) ${fieldScore >= 60 ? '✅' : '❌'} - ${comment}`);
  });

  return {
    totalScore: Math.round(totalScore * 100) / 100,
    fieldScores: scores,
    details: details,
    metadata: {
      validationTime: Date.now() - startTime,
      passThreshold: 60,
      fieldsPassedCount: Object.values(scores).filter(s => s.passed).length,
      fieldsTotalCount: SCHEMA_FIELDS.length
    }
  };
}

function calculateStringSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1;

  const semanticMatches = [
    ['article', 'news', 'story', 'post'],
    ['blog', 'article', 'post'],
    ['product', 'item', 'listing'],
    ['documentation', 'docs', 'guide', 'manual']
  ];

  for (const group of semanticMatches) {
    if (group.some(word => s1.includes(word)) && group.some(word => s2.includes(word))) {
      return 0.8;
    }
  }

  const matrix = Array(s2.length + 1).fill().map(() => Array(s1.length + 1).fill(0));
  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }

  const maxLength = Math.max(s1.length, s2.length);
  return maxLength === 0 ? 1 : (maxLength - matrix[s2.length][s1.length]) / maxLength;
}

// Main message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const startTime = Date.now();

  if (request.action === "setApiKey") {
    chrome.storage.local.set({ geminiApiKey: request.apiKey }, () => {
      AI_CONFIG.apiKey = request.apiKey;
      console.log('[Background] API key updated');
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === "getApiKey") {
    sendResponse({
      success: true,
      apiKey: AI_CONFIG.apiKey ? "***configured***" : null,
      hasKey: !!AI_CONFIG.apiKey
    });
    return false;
  }

  if (request.action === "extractData") {
    handleContentExtraction(sendResponse, startTime);
    return true;
  }

  if (request.action === "runValidation") {
    handleRealValidationSuite(sendResponse, startTime);
    return true;
  }
});

async function handleRealValidationSuite(sendResponse, startTime) {
  try {
    console.log('[Background] Starting DAY 5 REAL AI validation suite...');

    if (!AI_CONFIG.apiKey) {
      throw new Error('Gemini API key required for REAL AI validation. Please configure your API key.');
    }

    const results = await runRealValidationSuite();
    
    console.log(`[Background] REAL AI Validation complete: ${results.overallScore}% accuracy`);
    sendResponse({ 
      success: true, 
      results: results,
      message: `Day 5 REAL AI validation completed: ${results.overallScore}% accuracy`,
      realAITested: true
    });

  } catch (error) {
    console.error('[Background] REAL AI Validation failed:', error);
    sendResponse({ 
      success: false, 
      error: error.message,
      realAITested: true
    });
  }
}

async function handleContentExtraction(sendResponse, startTime) {
  try {
    console.log('[Background] Starting full extraction pipeline...');

    let tab = null;
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs.length > 0 && tabs[0]) {
        tab = tabs[0];
        console.log('[Background] Found active tab:', tab.id, tab.url);
      }
    } catch (error) {
      console.log('[Background] Tab query failed:', error.message);
    }

    if (!tab || !tab.id) {
      throw new Error('Unable to find any active tab. Please make sure you have a webpage open.');
    }

    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      throw new Error('Cannot extract content from browser internal pages. Please navigate to a website.');
    }

    console.log('[Background] Using tab:', tab.id, 'URL:', tab.url);

    try {
      console.log('[Background] Injecting content script...');
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      console.log('[Background] Content script injected successfully');
      
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.log('[Background] Content script injection note:', error.message);
    }

    console.log('[Background] Requesting page data from content script...');
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "extractPageData"
    });

    if (!response || !response.success) {
      throw new Error(`Content extraction failed: ${response?.error || 'Content script not responding'}`);
    }

    const pageData = response.data;
    console.log('[Background] Content extracted:', pageData.method, `${pageData.content?.length || 0} chars`);

    if (AI_CONFIG.apiKey && pageData.content) {
      console.log('[Background] Enhancing with REAL AI extraction...');
      const aiResponse = await executeAIExtraction(pageData.content, AI_CONFIG);

      if (aiResponse.success) {
        const enhancedData = {
          ...pageData,
          ai: aiResponse.data,
          aiMetadata: aiResponse.metadata,
          enhancedWithAI: true
        };

        console.log('[Background] REAL AI enhancement successful');
        sendResponse({
          success: true,
          data: enhancedData
        });
      } else {
        console.log('[Background] AI enhancement failed:', aiResponse.error);
        sendResponse({
          success: true,
          data: {
            ...pageData,
            aiError: aiResponse.error,
            enhancedWithAI: false
          }
        });
      }
    } else {
      console.log('[Background] Returning basic extraction (no AI key)');
      sendResponse({
        success: true,
        data: {
          ...pageData,
          enhancedWithAI: false,
          aiError: AI_CONFIG.apiKey ? null : 'API key not configured'
        }
      });
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Background] Full extraction failed:', error);
    sendResponse({
      success: false,
      error: error.message,
      metadata: {
        extractionTime: duration,
        failed: true
      }
    });
  }
}

console.log('[Background] Web Weaver Lightning Day 5 REAL AI ready');
