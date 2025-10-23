console.log('[AI-Extractor] Day 10 AI ENGINE v1 loading - 80% Accuracy Target with Gemini 2.0...');

// ============================================================================
// DAY 10 CONFIGURATION - AI ENGINE v1 - GEMINI 2.0 MODEL
// ============================================================================

const DAY10_CONFIG = {
  version: 'day10-ai-engine-v1-gemini-2.0-fix-v4.2.3',
  model: 'gemini-2.0-flash-exp',
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

function stripPIIDay10(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
    .replace(/(\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})/g, '[PHONE_REDACTED]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]')
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD_REDACTED]');
}

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

function enforceTokenLimitsDay10(text, maxLength) {
  if (!text || typeof text !== 'string') return text;
  return text.substring(0, maxLength);
}

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

function postProcessDay10(extractedData) {
  if (!extractedData || typeof extractedData !== 'object') {
    return extractedData;
  }

  const processed = { ...extractedData };

  const dateFields = ['publication_date', 'publishdate', 'publish_date', 'date'];
  dateFields.forEach(field => {
    if (processed[field]) {
      const standardized = standardizeDateDay10(processed[field]);
      if (standardized) {
        processed[field] = standardized;
      }
    }
  });

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

function extractJsonObject(text) {
  try {
    return JSON.parse(text);
  } catch {
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      let jsonString = arrayMatch[0];
      jsonString = jsonString.replace(/,(\s*])/, '$1');
      try {
        return JSON.parse(jsonString);
      } catch (err) {
        console.error('Malformed JSON array:', jsonString);
        throw err;
      }
    }

    const objectMatches = text.match(/\{[\s\S]*?\}(?=(,|\s|$))/g);
    if (objectMatches && objectMatches.length > 1) {
      let combined = `[${objectMatches.join(',')}]`;
      combined = combined.replace(/,(\s*])/, '$1');
      try {
        return JSON.parse(combined);
      } catch (err) {
        console.error('Malformed combined JSON objects:', combined);
        throw err;
      }
    }

    const singleMatch = text.match(/\{[\s\S]*?\}/);
    if (singleMatch) {
      try {
        return JSON.parse(singleMatch[0]);
      } catch (err) {
        console.error('Malformed single JSON object:', singleMatch[0]);
        throw err;
      }
    }

    console.error('No valid JSON found in AI response:', text);
    throw new Error('No JSON detected');
  }
}

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

    const extractedData = extractJsonObject(textContent);

    const confidenceCheck = validateConfidenceDay10(extractedData);
    if (!confidenceCheck.valid) {
      console.warn('[AI-Extractor] Low confidence extraction discarded', {
        confidence: confidenceCheck.confidence,
        reason: confidenceCheck.reason
      });
      throw new Error(`Low confidence extraction: ${confidenceCheck.confidence}`);
    }

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
// EXPORTS - v4.2.3 FIX: DUAL BROWSER + SERVICE WORKER SUPPORT
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
  console.log('[AI-Extractor] ✅ Browser export created (window.AIExtractor)');
}

if (typeof self !== 'undefined' && typeof importScripts === 'function') {
  self.AIExtractor = {
    extractWithGeminiDay10,
    stripPIIDay10,
    standardizeDateDay10,
    validateConfidenceDay10,
    postProcessDay10,
    DAY10_CONFIG
  };
  console.log('[AI-Extractor] ✅ Service Worker export created (self.AIExtractor)');
}

console.log('[AI-Extractor] ✅ Day 10 AI-Extractor loaded', {
  version: DAY10_CONFIG.version,
  model: DAY10_CONFIG.model,
  apiVersion: DAY10_CONFIG.apiVersion,
  confidenceThreshold: DAY10_CONFIG.confidenceThreshold,
  serviceWorkerSupport: typeof importScripts === 'function',
  browserSupport: typeof window !== 'undefined'
});
