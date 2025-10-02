// Day 10: AI-Extractor Utility - AI Engine v1 (80% Accuracy Milestone) - GEMINI 2.0 FIX
// /src/utils/ai-extractor.js - DAY 10 ENHANCED

console.log('[AI-Extractor] Day 10 AI ENGINE v1 loading - 80% Accuracy Target with Gemini 2.0...');

// ============================================================================
// DAY 10 CONFIGURATION - AI ENGINE v1 - GEMINI 2.0 MODEL
// ============================================================================

const DAY10_CONFIG = {
  version: 'day10-ai-engine-v1-gemini-2.0-fix',
  model: 'gemini-2.0-flash-lite',
  apiVersion: 'v1',
  maxRetries: 3,
  confidenceThreshold: 50,
  retryBackoffMs: 1000,
  maxBackoffMs: 5000,
  enablePIIStripping: true,
  dateFormatStandard: 'YYYY-MM-DD',
  tokenLimits: {
    title: 200,
    description: 1000,
    main_content_summary: 2000,
    ingredientsMax: 50,
    instructionsMax: 30
  }
};

// ============================================================================
// DAY 10 UTILITY FUNCTIONS
// ============================================================================

// Day 10: PII Stripping
function stripPIIDay10(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
    .replace(/(\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})/g, '[PHONE_REDACTED]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]')
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD_REDACTED]');
}

// Day 10: Date Standardization
function standardizeDateDay10(dateString) {
  if (!dateString || typeof dateString !== 'string') return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    return null;
  }
}

// Day 10: Token Limit Enforcement
function enforceTokenLimitsDay10(text, maxLength) {
  if (!text || typeof text !== 'string') return text;
  return text.substring(0, maxLength);
}

// Day 10: Confidence Validation
function validateConfidenceDay10(extractedData) {
  const confidence = extractedData?.confidence_score;
  if (!confidence || typeof confidence !== 'number') {
    console.warn('[AI-Extractor] No confidence score found, defaulting to 50');
    return {
      valid: true,
      confidence: 50,
      warning: 'NO_CONFIDENCE_SCORE'
    };
  }

  if (confidence < DAY10_CONFIG.confidenceThreshold) {
    console.warn('[AI-Extractor] Low confidence extraction', { confidence });
    return {
      valid: false,
      confidence: confidence,
      reason: 'CONFIDENCE_TOO_LOW',
      autoDiscard: true
    };
  }

  return {
    valid: true,
    confidence: confidence
  };
}

// Day 10: Post-Processing Pipeline
function postProcessDay10(extractedData) {
  if (!extractedData || typeof extractedData !== 'object') {
    return extractedData;
  }

  const processed = { ...extractedData };

  // Date standardization
  const dateFields = ['publication_date', 'publishdate', 'publish_date', 'date'];
  dateFields.forEach(field => {
    if (processed[field]) {
      const standardized = standardizeDateDay10(processed[field]);
      if (standardized) {
        processed[field] = standardized;
      }
    }
  });

  // PII stripping
  if (DAY10_CONFIG.enablePIIStripping) {
    Object.keys(processed).forEach(key => {
      const value = processed[key];
      if (typeof value === 'string') {
        processed[key] = stripPIIDay10(value);
      } else if (Array.isArray(value)) {
        processed[key] = value.map(item =>
          typeof item === 'string' ? stripPIIDay10(item) : item
        );
      }
    });
  }

  // Token limits enforcement
  if (processed.title) {
    processed.title = enforceTokenLimitsDay10(processed.title, DAY10_CONFIG.tokenLimits.title);
  }
  if (processed.description) {
    processed.description = enforceTokenLimitsDay10(processed.description, DAY10_CONFIG.tokenLimits.description);
  }
  if (processed.main_content_summary) {
    processed.main_content_summary = enforceTokenLimitsDay10(
      processed.main_content_summary,
      DAY10_CONFIG.tokenLimits.main_content_summary
    );
  }
  if (Array.isArray(processed.ingredients)) {
    processed.ingredients = processed.ingredients.slice(0, DAY10_CONFIG.tokenLimits.ingredientsMax);
  }
  if (Array.isArray(processed.instructions)) {
    processed.instructions = processed.instructions.slice(0, DAY10_CONFIG.tokenLimits.instructionsMax);
  }

  return processed;
}

// ============================================================================
// DAY 10: GEMINI 2.0 API EXTRACTOR WITH RETRY LOGIC
// ============================================================================

async function extractWithGeminiDay10(prompt, apiKey, options = {}) {
  const {
    retryCount = 0,
    maxRetries = DAY10_CONFIG.maxRetries,
    timeout = 30000
  } = options;

  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${DAY10_CONFIG.model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 3000,
      topP: 0.95,
      topK: 40
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
    ]
  };

  console.log(`[AI-Extractor] Calling Gemini 2.0 API (attempt ${retryCount + 1}/${maxRetries})`, {
    model: DAY10_CONFIG.model,
    apiVersion: DAY10_CONFIG.apiVersion,
    promptLength: prompt.length
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI-Extractor] Gemini API HTTP error', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        model: DAY10_CONFIG.model,
        apiVersion: DAY10_CONFIG.apiVersion
      });

      // Retry logic with exponential backoff
      if (retryCount < maxRetries - 1) {
        const backoffDelay = Math.min(
          DAY10_CONFIG.retryBackoffMs * Math.pow(2, retryCount),
          DAY10_CONFIG.maxBackoffMs
        );
        console.warn(`[AI-Extractor] Retrying in ${backoffDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return extractWithGeminiDay10(prompt, apiKey, {
          ...options,
          retryCount: retryCount + 1
        });
      }

      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('[AI-Extractor] Invalid Gemini API response structure', { data });
      throw new Error('Invalid API response structure');
    }

    const textContent = data.candidates[0].content.parts[0].text;
    console.log('[AI-Extractor] Gemini 2.0 API response received', {
      responseLength: textContent.length,
      model: DAY10_CONFIG.model
    });

    // Extract JSON from response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[AI-Extractor] No JSON found in API response', {
        textContent: textContent.substring(0, 500)
      });
      throw new Error('No JSON in API response');
    }

    const extractedData = JSON.parse(jsonMatch[0]);

    // Day 10: Confidence validation
    const confidenceCheck = validateConfidenceDay10(extractedData);
    if (!confidenceCheck.valid) {
      console.warn('[AI-Extractor] Low confidence extraction discarded', {
        confidence: confidenceCheck.confidence,
        reason: confidenceCheck.reason
      });
      throw new Error(`Low confidence extraction: ${confidenceCheck.confidence}`);
    }

    // Day 10: Post-processing
    const processedData = postProcessDay10(extractedData);

    console.log('[AI-Extractor] ✅ Day 10 extraction successful', {
      confidence: confidenceCheck.confidence,
      fieldsCount: Object.keys(processedData).length,
      model: DAY10_CONFIG.model
    });

    return {
      success: true,
      data: processedData,
      metadata: {
        day10Version: DAY10_CONFIG.version,
        confidence: confidenceCheck.confidence,
        model: DAY10_CONFIG.model,
        apiVersion: DAY10_CONFIG.apiVersion,
        retryCount: retryCount,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('[AI-Extractor] Gemini API timeout', { timeout });
      if (retryCount < maxRetries - 1) {
        const backoffDelay = Math.min(
          DAY10_CONFIG.retryBackoffMs * Math.pow(2, retryCount),
          DAY10_CONFIG.maxBackoffMs
        );
        console.warn(`[AI-Extractor] Retrying after timeout in ${backoffDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return extractWithGeminiDay10(prompt, apiKey, {
          ...options,
          retryCount: retryCount + 1
        });
      }
      throw new Error('API timeout after retries');
    }

    console.error('[AI-Extractor] Extraction failed', {
      error: error.message,
      retryCount: retryCount,
      model: DAY10_CONFIG.model
    });
    throw error;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof window !== 'undefined') {
  window.AIExtractor = {
    extractWithGeminiDay10,
    stripPIIDay10,
    standardizeDateDay10,
    validateConfidenceDay10,
    postProcessDay10,
    DAY10_CONFIG
  };
}

console.log('[AI-Extractor] ✅ Day 10 AI-Extractor loaded', {
  version: DAY10_CONFIG.version,
  model: DAY10_CONFIG.model,
  apiVersion: DAY10_CONFIG.apiVersion,
  confidenceThreshold: DAY10_CONFIG.confidenceThreshold
});
