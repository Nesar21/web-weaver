// Day 6 FIXED Background Script - Championship Edition
console.log('Day 6 FIXED Background Script - Championship ready');

// Enhanced AI Configuration
let AI_CONFIG = {
  model: 'gemini-2.0-flash',
  maxTokens: 2500,
  temperature: 0.2,
  apiKey: null
};

// Load API key from storage
chrome.storage.local.get(['geminiApiKey'], (result) => {
  if (result.geminiApiKey) {
    AI_CONFIG.apiKey = result.geminiApiKey;
    console.log('[Background] Enhanced AI key loaded');
  }
});

// REAL VALIDATION SYSTEM - Fixed AI response handling
async function runRealValidation(tabId) {
  const startTime = Date.now();
  console.log('[Background] Starting REAL validation on current page...');
  
  try {
    // Get the current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || !tabs[0]) {
      throw new Error('No active tab found');
    }
    
    const tab = tabs[0];
    const url = tab.url;
    const domain = new URL(url).hostname;
    
    console.log(`[Background] REAL validation on: ${domain}`);
    
    // Inject content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Extract real data from current page
    const extractionResponse = await chrome.tabs.sendMessage(tab.id, {
      action: "extractPageData"
    });
    
    if (!extractionResponse || !extractionResponse.success) {
      throw new Error('Failed to extract data from current page');
    }
    
    const pageData = extractionResponse.data;
    
    // Run both Enhanced Basic and AI (if available)
    console.log('[Background] Running Enhanced Basic extraction...');
    const basicResult = executeEnhancedBasicExtraction(pageData);
    
    let aiResult = null;
    let aiTime = 0;
    let usingRealAI = false;
    
    if (AI_CONFIG.apiKey && pageData.content) {
      console.log('[Background] Running Enhanced AI extraction...');
      const aiStartTime = Date.now();
      try {
        const aiResponse = await executeEnhancedAIExtraction(pageData, AI_CONFIG);
        
        // FIXED: Handle array response from AI
        let aiData = aiResponse.data;
        if (Array.isArray(aiData) && aiData.length > 0) {
          console.log('[Background] AI returned array, extracting first object');
          aiData = aiData[0];
        }
        
        aiResult = aiData;
        aiTime = Date.now() - aiStartTime;
        usingRealAI = aiResponse.metadata.realAI;
        console.log(`[Background] AI extraction completed in ${aiTime}ms`);
      } catch (error) {
        console.warn('[Background] AI extraction failed, using Basic:', error);
        aiResult = basicResult.data;
        usingRealAI = false;
      }
    } else {
      aiResult = basicResult.data;
      usingRealAI = false;
    }
    
    // Calculate REAL performance metrics with fixed AI data
    const realMetrics = calculateRealValidationMetrics({
      url,
      domain,
      contentLength: pageData.content?.length || 0,
      extractionTime: Date.now() - startTime,
      aiTime,
      basicData: basicResult.data,
      aiData: aiResult,  // Now guaranteed to be an object
      hasApiKey: !!AI_CONFIG.apiKey,
      usingRealAI,
      pageStructure: pageData.structure
    });
    
    console.log('[Background] REAL validation completed:', realMetrics);
    
    return {
      success: true,
      results: {
        ...realMetrics,
        extractedData: {
          ai: aiResult,
          enhancedBasic: basicResult.data,
          enhancedWithAI: usingRealAI
        },
        pageInfo: {
          url,
          domain,
          title: pageData.title,
          contentLength: pageData.content?.length || 0
        },
        timestamp: new Date().toISOString(),
        realValidation: true,
        methodology: "Real-time extraction and validation on current page"
      }
    };
    
  } catch (error) {
    console.error('[Background] REAL validation failed:', error);
    return {
      success: false,
      error: error.message,
      realValidation: true
    };
  }
}

// FIXED: Calculate REAL validation metrics with proper object handling
function calculateRealValidationMetrics(data) {
  const { aiData, basicData, contentLength, extractionTime, aiTime, hasApiKey, usingRealAI, pageStructure, domain } = data;
  
  // Core fields to evaluate
  const coreFields = ['title', 'author', 'publication_date', 'category', 'description', 'main_content_summary'];
  
  // FIXED: Ensure aiData is an object, not array
  let processedAiData = aiData;
  if (Array.isArray(aiData)) {
    console.warn('[Background] AI data was array, taking first element');
    processedAiData = aiData.length > 0 ? aiData[0] : {};
  } else if (!aiData || typeof aiData !== 'object') {
    console.warn('[Background] AI data invalid, using empty object');
    processedAiData = {};
  }
  
  // Evaluate AI data quality
  const aiScore = evaluateExtractionQuality(processedAiData, coreFields, domain);
  
  // Evaluate Basic data quality
  const basicScore = evaluateExtractionQuality(basicData, coreFields, domain);
  
  // Use the better of AI or Basic for overall score
  const primaryScore = usingRealAI && aiScore.score > basicScore.score ? aiScore : basicScore;
  const overallScore = Math.round(primaryScore.score);
  
  // Performance classification
  let performanceClass = 'poor';
  let performanceDescription = 'Needs Improvement';
  
  if (overallScore >= 75) {
    performanceClass = 'championship';
    performanceDescription = 'Championship Performance';
  } else if (overallScore >= 60) {
    performanceClass = 'good';
    performanceDescription = 'Target Achievement';
  }
  
  // Success rate calculation
  const successRate = Math.round((primaryScore.successfulFields / coreFields.length) * 100);
  
  return {
    overallScore,
    successRate,
    performanceClass,
    performanceDescription,
    
    // Detailed metrics
    fieldsEvaluated: coreFields.length,
    fieldsSuccessful: primaryScore.successfulFields,
    fieldsPartial: primaryScore.partialFields,
    fieldsMissing: primaryScore.missingFields,
    
    // Performance metrics
    extractionTime,
    aiTime: aiTime || 0,
    contentLength,
    hasApiKey,
    usingRealAI,
    
    // Comparison
    aiPerformance: aiScore,
    basicPerformance: basicScore,
    
    // Page context
    pageStructure,
    domain,
    
    // Validation metadata
    testsPerformed: 1,
    avgResponseTime: extractionTime,
    method: usingRealAI ? 'Enhanced AI' : 'Enhanced Basic',
    timestamp: Date.now()
  };
}

// FIXED: Evaluate extraction quality with better null handling
function evaluateExtractionQuality(data, fields, domain) {
  if (!data || typeof data !== 'object') {
    console.warn('[Background] Invalid data for evaluation:', typeof data);
    return {
      score: 0,
      successfulFields: 0,
      partialFields: 0,
      missingFields: fields.length,
      fieldEvaluations: fields.map(field => ({
        field,
        score: 0,
        quality: 'missing',
        reason: 'No data object provided'
      }))
    };
  }
  
  let successfulFields = 0;
  let partialFields = 0;
  let totalQualityScore = 0;
  
  const fieldEvaluations = [];
  
  fields.forEach(field => {
    const value = data[field];
    const evaluation = evaluateFieldQuality(field, value, domain);
    
    fieldEvaluations.push({
      field,
      score: evaluation.score,
      quality: evaluation.quality,
      reason: evaluation.reason
    });
    
    totalQualityScore += evaluation.score;
    
    if (evaluation.score >= 80) {
      successfulFields++;
    } else if (evaluation.score >= 40) {
      partialFields++;
    }
  });
  
  const averageScore = totalQualityScore / fields.length;
  
  return {
    score: averageScore,
    successfulFields,
    partialFields,
    missingFields: fields.length - successfulFields - partialFields,
    fieldEvaluations
  };
}

// Enhanced field quality evaluation with better scoring
function evaluateFieldQuality(field, value, domain) {
  // Check for null/undefined/empty
  if (value === null || value === undefined || value === '') {
    return { score: 0, quality: 'missing', reason: 'No value extracted' };
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { score: 0, quality: 'missing', reason: 'Empty array' };
    }
    // For arrays, evaluate the first element or join them
    const arrayValue = field === 'links' || field === 'images' ? 
      value.join(', ') : String(value[0]);
    return evaluateFieldQuality(field, arrayValue, domain);
  }
  
  const valueStr = String(value).trim();
  if (valueStr.length === 0) {
    return { score: 0, quality: 'missing', reason: 'Empty string' };
  }
  
  // Field-specific quality checks
  switch (field) {
    case 'title':
      if (valueStr.length < 3) return { score: 20, quality: 'poor', reason: 'Too short' };
      if (valueStr.length > 200) return { score: 60, quality: 'partial', reason: 'Overly long' };
      if (valueStr.toLowerCase().includes('untitled')) return { score: 30, quality: 'poor', reason: 'Generic title' };
      return { score: 100, quality: 'excellent', reason: 'Good title extracted' };
      
    case 'author':
      if (valueStr.length < 2) return { score: 10, quality: 'poor', reason: 'Too short for author' };
      if (valueStr.length > 100) return { score: 50, quality: 'partial', reason: 'Overly long for author' };
      if (/^[A-Za-z\s\.,\-]+$/.test(valueStr)) {
        return { score: 100, quality: 'excellent', reason: 'Valid author name' };
      }
      return { score: 70, quality: 'good', reason: 'Author-like content' };
      
    case 'publication_date':
      if (valueStr.match(/\d{4}-\d{2}-\d{2}/)) return { score: 100, quality: 'excellent', reason: 'ISO date format' };
      if (valueStr.match(/\d{4}/)) return { score: 80, quality: 'good', reason: 'Contains year' };
      return { score: 50, quality: 'partial', reason: 'Date-like content' };
      
    case 'category':
      if (valueStr.length < 2) return { score: 20, quality: 'poor', reason: 'Too short' };
      const validCategories = ['news', 'blog', 'wiki', 'tech', 'business', 'documentation', 'education'];
      if (validCategories.includes(valueStr.toLowerCase())) {
        return { score: 100, quality: 'excellent', reason: 'Valid category' };
      }
      return { score: 70, quality: 'good', reason: 'Category-like content' };
      
    case 'description':
    case 'main_content_summary':
      if (valueStr.length < 10) return { score: 30, quality: 'poor', reason: 'Too short' };
      if (valueStr.length > 500) return { score: 70, quality: 'good', reason: 'Very long content' };
      if (valueStr.length >= 30) return { score: 100, quality: 'excellent', reason: 'Good summary length' };
      return { score: 60, quality: 'partial', reason: 'Short but present' };
      
    default:
      return { score: 80, quality: 'good', reason: 'Value present' };
  }
}

// Enhanced Basic Extraction - Same as before but better error handling
function executeEnhancedBasicExtraction(pageData) {
  console.log('[Background] Enhanced Basic extraction for validation...');
  
  try {
    const content = pageData.content || '';
    const title = pageData.title || '';
    const domain = pageData.domain || '';
    
    const enhancedBasic = {
      title: extractEnhancedTitle(title, content, domain),
      author: extractEnhancedAuthor(content, pageData.metadata),
      publication_date: extractEnhancedDate(content, pageData.metadata),
      main_content_summary: extractEnhancedSummary(content, title, domain),
      category: extractEnhancedCategory(domain, content, title),
      description: extractEnhancedDescription(content, title, domain),
      links: extractEnhancedLinks(pageData.metadata?.links, content, pageData.url),
      images: extractEnhancedImages(pageData.metadata?.images, content)
    };
    
    return {
      success: true,
      data: enhancedBasic,
      metadata: {
        method: 'enhanced-basic-validation',
        extractionTime: Date.now(),
        contentLength: content.length
      }
    };
    
  } catch (error) {
    console.error('[Background] Enhanced Basic extraction failed:', error);
    return {
      success: false,
      data: {
        title: null,
        author: null,
        publication_date: null,
        main_content_summary: null,
        category: null,
        description: null,
        links: [],
        images: []
      },
      error: error.message
    };
  }
}

// FIXED: Enhanced AI Extraction with proper response format enforcement
async function executeEnhancedAIExtraction(pageData, apiConfig) {
  const startTime = Date.now();
  
  try {
    console.log('[Background] Enhanced AI extraction for validation...');
    
    if (!apiConfig.apiKey) {
      throw new Error('Gemini API key required for AI extraction');
    }
    
    const content = pageData.content;
    const metadata = pageData.metadata || {};
    const basicInfo = {
      title: pageData.title || '',
      domain: pageData.domain || '',
      url: pageData.url || ''
    };
    
    // FIXED: Enhanced prompt with stricter format requirements
    const enhancedPrompt = `You are an expert content analyzer. Extract structured data from this web content with maximum accuracy.

CRITICAL RULES:
1. Return a SINGLE JSON OBJECT (not an array)
2. Extract meaningful information from the provided content
3. For homepage/aggregated content, focus on the FIRST substantial article or main content
4. If no relevant content exists for a field, return null
5. NEVER return an array - always return a single object

REQUIRED JSON FORMAT (return exactly this structure):
{
  "title": "string or null",
  "author": "string or null", 
  "publication_date": "string or null",
  "main_content_summary": "string or null",
  "category": "string or null",
  "description": "string or null",
  "links": ["array of strings"],
  "images": ["array of strings"]
}

CONTENT FOR ANALYSIS:
Domain: ${basicInfo.domain}
URL: ${basicInfo.url}
Title: ${basicInfo.title}

MAIN CONTENT:
${content}

Return ONLY the JSON object with the exact schema above. DO NOT wrap in an array.`;

    const enhancedPayload = {
      contents: [{
        parts: [{ text: enhancedPrompt }]
      }],
      generationConfig: {
        temperature: apiConfig.temperature || 0.2,
        maxOutputTokens: apiConfig.maxTokens || 2500,
        responseMimeType: "application/json"
      }
    };
    
    console.log('[Background] Calling Gemini API for validation...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${apiConfig.model}:generateContent?key=${apiConfig.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enhancedPayload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
      throw new Error('Invalid Gemini API response structure');
    }
    
    const generatedText = result.candidates[0].content.parts[0].text;
    console.log('[Background] AI response received for validation');
    
    // FIXED: Parse and validate JSON response format
    let aiData;
    try {
      const parsed = JSON.parse(generatedText);
      
      // FIXED: Handle array responses
      if (Array.isArray(parsed)) {
        console.warn('[Background] AI returned array, extracting first object');
        aiData = parsed.length > 0 ? parsed[0] : {};
      } else {
        aiData = parsed;
      }
    } catch (parseError) {
      console.warn('[Background] JSON parse failed, attempting recovery...');
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        aiData = Array.isArray(parsed) ? (parsed[0] || {}) : parsed;
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }
    
    // FIXED: Ensure aiData has all required fields
    const requiredFields = ['title', 'author', 'publication_date', 'main_content_summary', 'category', 'description', 'links', 'images'];
    requiredFields.forEach(field => {
      if (!(field in aiData)) {
        aiData[field] = field === 'links' || field === 'images' ? [] : null;
      }
    });
    
    const duration = Date.now() - startTime;
    console.log(`[Background] AI extraction completed in ${duration}ms`);
    
    return {
      success: true,
      data: aiData,
      metadata: {
        model: apiConfig.model,
        extractionTime: duration,
        contentLength: content.length,
        realAI: true,
        promptVersion: 'validation-v1-fixed'
      }
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Background] AI extraction failed:', error);
    
    // Return basic extraction as fallback
    const basicFallback = executeEnhancedBasicExtraction(pageData);
    return {
      success: true,
      data: basicFallback.data,
      metadata: {
        extractionTime: duration,
        failed: true,
        fallbackUsed: true,
        realAI: false,
        error: error.message
      }
    };
  }
}

// Enhanced extraction utility functions (same as before)
function extractEnhancedTitle(pageTitle, content, domain) {
  if (pageTitle && pageTitle.length > 5 && !pageTitle.toLowerCase().includes('untitled')) {
    let cleanTitle = pageTitle
      .replace(/\s*[-|]\s*.+$/, '')
      .replace(/^\s*(.+?)\s*[-|]\s*$/, '$1')
      .trim();
    
    if (cleanTitle.length > 10) {
      return cleanTitle;
    }
  }
  
  if (content.length > 100) {
    const headlinePatterns = [
      /^(.{20,100}?)[\r\n]/m,
      /(?:headline|title|heading):\s*(.{10,100})/i,
      /^([A-Z].{15,80}[.!?])(?:\s|\n)/m
    ];
    
    for (const pattern of headlinePatterns) {
      const match = content.match(pattern);
      if (match && match[1] && match[1].trim().length > 10) {
        return match[1].trim();
      }
    }
  }
  
  if (pageTitle) return pageTitle;
  if (domain.includes('wikipedia')) return 'Wikipedia Article';
  if (domain.includes('medium')) return 'Medium Article';
  if (domain.includes('blog')) return 'Blog Post';
  
  return null;
}

function extractEnhancedAuthor(content, metadata) {
  if (metadata?.author && typeof metadata.author === 'string' && metadata.author.length > 1) {
    return metadata.author;
  }
  
  if (!content || content.length < 50) return null;
  
  const authorPatterns = [
    /(?:By|Author|Written by|From)\s+([A-Z][a-z]+ [A-Z][a-z]+)/i,
    /Author:\s*([A-Z][a-z]+ [A-Z]?\.?\s*[A-Z][a-z]+)/i,
    /By\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i,
    /^([A-Z][a-z]+ [A-Z][a-z]+)\s*[-–—]\s/m,
    /Written by\s+([A-Z][a-z]+ [A-Z]\.?\s*[A-Z][a-z]+)/i
  ];
  
  for (const pattern of authorPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const author = match[1].trim();
      if (author.length >= 4 && author.length <= 50 && /^[A-Za-z\s\.]+$/.test(author)) {
        return author;
      }
    }
  }
  
  return null;
}

function extractEnhancedDate(content, metadata) {
  if (metadata?.publication_date) {
    return metadata.publication_date;
  }
  
  if (!content || content.length < 50) return null;
  
  const datePatterns = [
    /Published:?\s*([A-Za-z]+ \d{1,2},?\s*\d{4})/i,
    /Date:?\s*([A-Za-z]+ \d{1,2},?\s*\d{4})/i,
    /(\d{4}-\d{2}-\d{2})/,
    /([A-Za-z]+ \d{1,2},\s*\d{4})/,
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
    /(\d{1,2}-\d{1,2}-\d{4})/
  ];
  
  for (const pattern of datePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const dateStr = match[1].trim();
      try {
        const date = new Date(dateStr);
        if (date && date.getFullYear() > 2000 && date.getFullYear() <= 2025) {
          return date.toISOString().split('T')[0];
        }
      } catch (e) {
        // Invalid date, continue
      }
    }
  }
  
  return null;
}

function extractEnhancedSummary(content, title, domain) {
  if (!content || content.length < 100) return null;
  
  let cleanContent = content
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const skipPatterns = [
    /^(Skip to|Navigation|Menu|Home|About|Contact)/i,
    /^(Copyright|Terms|Privacy|Cookie)/i,
    /^(Follow us|Subscribe|Sign up)/i
  ];
  
  const sentences = cleanContent.split(/[.!?]+/).filter(sentence => {
    const s = sentence.trim();
    if (s.length < 20) return false;
    return !skipPatterns.some(pattern => pattern.test(s));
  });
  
  if (sentences.length === 0) return null;
  
  let summary = sentences.slice(0, 3).join('. ').trim();
  
  if (summary.length > 200) {
    summary = summary.substring(0, 200);
    const lastSpace = summary.lastIndexOf(' ');
    if (lastSpace > 150) {
      summary = summary.substring(0, lastSpace);
    }
    summary += '...';
  }
  
  return summary.length > 30 ? summary : null;
}

function extractEnhancedCategory(domain, content, title) {
  if (domain.includes('bloomberg') || domain.includes('reuters') || domain.includes('cnn') || domain.includes('news')) {
    return 'news';
  }
  if (domain.includes('medium') || domain.includes('blog')) {
    return 'blog';
  }
  if (domain.includes('wiki')) {
    return 'wiki';
  }
  if (domain.includes('github') || domain.includes('stackoverflow')) {
    return 'tech';
  }
  
  if (content && title) {
    const combinedText = (title + ' ' + content.substring(0, 500)).toLowerCase();
    
    if (/\b(technology|software|programming|development|tech|ai|machine learning)\b/.test(combinedText)) {
      return 'tech';
    }
    if (/\b(business|finance|market|economy|trading|investment)\b/.test(combinedText)) {
      return 'business';
    }
    if (/\b(tutorial|guide|how to|step by step|learn)\b/.test(combinedText)) {
      return 'education';
    }
    if (/\b(research|study|analysis|academic|paper)\b/.test(combinedText)) {
      return 'research';
    }
  }
  
  return 'documentation';
}

function extractEnhancedDescription(content, title, domain) {
  if (!content || content.length < 50) return null;
  
  const descPatterns = [
    /description[:\-]\s*(.{20,150})/i,
    /summary[:\-]\s*(.{20,150})/i,
    /abstract[:\-]\s*(.{20,150})/i
  ];
  
  for (const pattern of descPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      let desc = match[1].trim();
      if (desc.length > 30 && desc.length < 200) {
        return desc;
      }
    }
  }
  
  const cleanContent = content.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  const firstSentence = cleanContent.split(/[.!?]/)[0]?.trim();
  
  if (firstSentence && firstSentence.length >= 20 && firstSentence.length <= 150) {
    if (!/^(Skip to|Welcome to|This is|The following)/i.test(firstSentence)) {
      return firstSentence + '.';
    }
  }
  
  if (title) {
    const categoryMap = {
      'news': 'News article',
      'blog': 'Blog post',
      'wiki': 'Wikipedia article',
      'tech': 'Technical article',
      'business': 'Business article'
    };
    
    const category = extractEnhancedCategory(domain, content, title);
    const prefix = categoryMap[category] || 'Article';
    return `${prefix} about ${title.toLowerCase()}`;
  }
  
  return null;
}

function extractEnhancedLinks(metadataLinks, content, baseUrl) {
  const links = [];
  
  if (metadataLinks && Array.isArray(metadataLinks) && metadataLinks.length > 0) {
    return metadataLinks.slice(0, 3).filter(link => 
      typeof link === 'string' && 
      link.startsWith('http') && 
      !link.includes('facebook') && 
      !link.includes('twitter') &&
      !link.includes('advertisement')
    );
  }
  
  if (!content) return [];
  
  const linkPattern = /https?:\/\/[^\s<>"]+/g;
  const foundLinks = content.match(linkPattern) || [];
  
  return foundLinks
    .filter(link => 
      !link.includes('facebook') && 
      !link.includes('twitter') && 
      !link.includes('advertisement')
    )
    .slice(0, 3);
}

function extractEnhancedImages(metadataImages, content) {
  if (metadataImages && Array.isArray(metadataImages) && metadataImages.length > 0) {
    return metadataImages.slice(0, 2).filter(img => 
      typeof img === 'string' && 
      img.length > 5 &&
      !img.includes('logo') &&
      !img.includes('advertisement')
    );
  }
  
  return [];
}

// FIXED: Message handlers with better error handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const startTime = Date.now();
  
  if (request.action === "setApiKey") {
    chrome.storage.local.set({ geminiApiKey: request.apiKey }, () => {
      AI_CONFIG.apiKey = request.apiKey;
      console.log('[Background] Enhanced AI key updated');
      sendResponse({ success: true, message: 'Enhanced AI key configured' });
    });
    return true;
  }
  
  if (request.action === "getApiKey") {
    sendResponse({
      success: true,
      apiKey: AI_CONFIG.apiKey ? "***CONFIGURED***" : null,
      hasKey: !!AI_CONFIG.apiKey
    });
    return false;
  }
  
  if (request.action === "extractData") {
    handleEnhancedExtraction(sendResponse, startTime);
    return true;
  }
  
  if (request.action === "runRealValidation") {
    handleRealValidation(sendResponse, startTime);
    return true;
  }
});

// FIXED: Enhanced extraction handler with proper AI response handling
async function handleEnhancedExtraction(sendResponse, startTime) {
  try {
    console.log('[Background] Starting Day 6 enhanced extraction...');
    
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || !tabs[0]) {
      throw new Error('No active tab found');
    }
    
    const tab = tabs[0];
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      throw new Error('Cannot extract from browser internal pages');
    }
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "extractPageData"
    });
    
    if (!response || !response.success) {
      throw new Error(`Content extraction failed: ${response?.error || 'Content script not responding'}`);
    }
    
    const pageData = response.data;
    console.log('[Background] Content extracted:', {
      method: pageData.method,
      contentLength: pageData.content?.length || 0,
      hasMetadata: !!pageData.metadata
    });
    
    // Run Enhanced Basic
    const basicResult = executeEnhancedBasicExtraction(pageData);
    
    // Apply AI enhancement if API key available
    if (AI_CONFIG.apiKey && pageData.content) {
      console.log('[Background] Applying Enhanced AI...');
      
      const aiResponse = await executeEnhancedAIExtraction(pageData, AI_CONFIG);
      
      // FIXED: Handle AI response properly
      let aiData = aiResponse.data;
      if (Array.isArray(aiData) && aiData.length > 0) {
        console.log('[Background] AI returned array, extracting first object');
        aiData = aiData[0];
      }
      
      const enhancedData = {
        ...pageData,
        ai: aiData,
        aiMetadata: aiResponse.metadata,
        enhancedWithAI: aiResponse.metadata.realAI,
        enhancedBasic: basicResult.data,
        method: 'enhanced-ai-v6-fixed'
      };
      
      sendResponse({ success: true, data: enhancedData });
      
    } else {
      // Return Enhanced Basic
      sendResponse({
        success: true,
        data: {
          ...pageData,
          ai: basicResult.data,
          enhancedWithAI: false,
          enhancedBasic: basicResult.data,
          method: 'enhanced-basic-v6',
          aiError: AI_CONFIG.apiKey ? null : 'API key not configured'
        }
      });
    }
    
  } catch (error) {
    console.error('[Background] Enhanced extraction failed:', error);
    sendResponse({
      success: false,
      error: error.message,
      metadata: {
        extractionTime: Date.now() - startTime,
        failed: true
      }
    });
  }
}

// Real validation handler - same as before
async function handleRealValidation(sendResponse, startTime) {
  try {
    console.log('[Background] Starting REAL validation...');
    
    const validationResults = await runRealValidation();
    
    if (validationResults.success) {
      console.log('[Background] REAL validation completed successfully');
      sendResponse(validationResults);
    } else {
      throw new Error(validationResults.error);
    }
    
  } catch (error) {
    console.error('[Background] REAL validation failed:', error);
    sendResponse({
      success: false,
      error: error.message,
      realValidation: true
    });
  }
}

console.log('[Background] Day 6 FIXED Background Script ready - Championship grade');
