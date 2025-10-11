/**
 * aiConfidence.js
 * 
 * Get AI confidence score (0-100) for extracted JSON data.
 * Designed for use with OpenAI or similar AI backends.
 */

const fetch = require('node-fetch');
const crypto = require('crypto');

// In-memory cache to avoid redundant API calls
const confidenceCache = new Map();

/**
 * Hash the JSON object deterministically to create a cache key
 * @param {object} obj - JSON object
 * @returns {string} SHA256 hash string
 */
function hashJson(obj) {
  return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex');
}

/**
 * Default configurations
 */
const DEFAULTS = {
  model: 'gpt-4',
  timeout: 15000, // 15 seconds
  retries: 3,
  baseDelay: 500, // ms for retry exponential backoff
  maxDelay: 4000, // ms maximum delay for backoff
  verbose: false,
};

/**
 * Async delay helper
 * @param {number} ms 
 * @returns {Promise}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate extractedData to ensure it's JSON-serializable.
 * Avoid logging full object if it contains PII.
 * @param {object} data 
 * @returns {boolean}
 */
function validateExtractedData(data) {
  try {
    JSON.stringify(data);
    // Extend with PII checks if needed
    return true;
  } catch {
    return false;
  }
}

/**
 * Main exported function to get confidence score from AI backend
 * @param {object} extractedData - JSON object from extractor
 * @param {string} apiKey - AI API key
 * @param {object} options - Optional configs:
 *   - model: AI model to use
 *   - timeout: max milliseconds for API call
 *   - retries: retry attempts count
 *   - preProcessHook: function to transform JSON before evaluation
 *   - verbose: boolean for debugging logs
 * @returns {Promise<number>} Confidence score between 0 and 100
 */
async function getConfidenceScore(extractedData, apiKey, options = {}) {
  const config = { ...DEFAULTS, ...options };

  if (!validateExtractedData(extractedData)) {
    if (config.verbose) console.warn('Invalid extractedData, returning fallback 50');
    return 50;
  }

  const jsonHash = hashJson(extractedData);
  if (confidenceCache.has(jsonHash)) {
    if (config.verbose) console.log('Cache hit for confidence score');
    return confidenceCache.get(jsonHash);
  }

  let dataToEvaluate = extractedData;
  if (config.preProcessHook && typeof config.preProcessHook === 'function') {
    dataToEvaluate = config.preProcessHook(extractedData);
  }

  const jsonString = JSON.stringify(dataToEvaluate);

  // Compose prompt to ask AI for confidence score
  const prompt = `Rate the correctness of this JSON on a scale 0-100, only return a number: ${jsonString}`;

  const payload = {
    model: config.model,
    prompt: prompt,
    max_tokens: 10,
    temperature: 0,
    n: 1,
    stop: null,
  };

  let attempt = 0;

  while (attempt <= config.retries) {
    // Setup AbortController to handle timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API HTTP error: ${response.status}`);
      }

      const data = await response.json();

      // Extract text output and parse number
      const text = (data.choices && data.choices[0] && data.choices[0].text) || '';
      const score = parseFloat(text.trim());

      if (!isNaN(score) && score >= 0 && score <= 100) {
        confidenceCache.set(jsonHash, score);
        if (config.verbose) console.log(`Confidence score obtained: ${score}`);
        return score;
      } else {
        throw new Error('Invalid score returned from AI');
      }

    } catch (err) {
      if (config.verbose) console.warn(`Attempt ${attempt + 1} failed: ${err.message}`);

      if (attempt === config.retries) {
        if (config.verbose) console.warn('Max retries reached, returning fallback 50');
        return 50;
      }

      // Exponential backoff before next retry
      const backoffDelay = Math.min(config.baseDelay * Math.pow(2, attempt), config.maxDelay);
      await delay(backoffDelay);

      attempt++;
    }
  }

  // Fallback score if all attempts fail
  return 50;
}

module.exports = { getConfidenceScore };
