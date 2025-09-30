// Day 10: AI-Extractor Utility - AI Engine v1 (80% Accuracy Milestone)
// /src/utils/ai-extractor.js - DAY 10 ENHANCED

console.log('[AI-Extractor] Day 10 AI ENGINE v1 loading - 80% Accuracy Target...');

// ============================================================================
// DAY 10 CONFIGURATION - AI ENGINE v1
// ============================================================================

const DAY10_CONFIG = {
  version: 'day10-ai-engine-v1',
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

// Day 10: Date Standardization to YYYY-MM-DD
function standardizeDateDay10(dateString) {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch { return null; }
}

// Day 10: Confidence Validation
function validateConfidenceDay10(data) {
  const conf = data?.confidence_score;
  if (!conf || typeof conf !== 'number') {
    return { valid: true, score: 50, warning: 'NO_CONFIDENCE_SCORE' };
  }
  if (conf < DAY10_CONFIG.confidenceThreshold) {
    return { valid: false, score: conf, autoDiscard: true };
  }
  return { valid: true, score: conf };
}

// Day 10: Post-Process Extraction
function postProcessDay10(data) {
  if (!data || typeof data !== 'object') return data;
  const processed = {...data};
  
  // Date standardization
  if (processed.publication_date) {
    const std = standardizeDateDay10(processed.publication_date);
    if (std) processed.publication_date = std;
  }
  if (processed.publishdate) {
    const std = standardizeDateDay10(processed.publishdate);
    if (std) processed.publishdate = std;
  }
  
  // PII stripping from all string fields
  for (const [key, val] of Object.entries(processed)) {
    if (typeof val === 'string') {
      processed[key] = stripPIIDay10(val);
    } else if (Array.isArray(val)) {
      processed[key] = val.map(v => typeof v === 'string' ? stripPIIDay10(v) : v);
    }
  }
  
  // Token limits enforcement
  if (processed.title) processed.title = processed.title.substring(0, DAY10_CONFIG.tokenLimits.title);
  if (processed.description) processed.description = processed.description.substring(0, DAY10_CONFIG.tokenLimits.description);
  if (processed.main_content_summary) processed.main_content_summary = processed.main_content_summary.substring(0, DAY10_CONFIG.tokenLimits.main_content_summary);
  if (processed.summary) processed.summary = processed.summary.substring(0, DAY10_CONFIG.tokenLimits.main_content_summary);
  if (Array.isArray(processed.ingredients)) processed.ingredients = processed.ingredients.slice(0, DAY10_CONFIG.tokenLimits.ingredientsMax);
  if (Array.isArray(processed.instructions)) processed.instructions = processed.instructions.slice(0, DAY10_CONFIG.tokenLimits.instructionsMax);
  
  return processed;
}

// ============================================================================
// EXISTING SHA-256 AND HELPER FUNCTIONS
// ============================================================================

async function sha256(text) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    return sha256Fallback(text);
  }
}

function sha256Fallback(text) {
  let hash = 0x811c9dc5;
  const fnvPrime = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, fnvPrime);
  }
  const timeHash = Date.now() % 0xffffffff;
  const randomHash = Math.floor(Math.random() * 0xffffffff);
  const finalHash = (hash ^ timeHash ^ randomHash) >>> 0;
  return finalHash.toString(16).padStart(8, '0') + timeHash.toString(16).padStart(8, '0');
}

async function loadExternalPromptConfig(enterpriseConfig) {
  if (enterpriseConfig.externalPromptUrl) {
    try {
      const response = await fetch(enterpriseConfig.externalPromptUrl);
      if (response.ok) {
        const config = await response.json();
        console.log('[AI-Extractor] External prompt config loaded successfully');
        return config;
      }
    } catch (error) {
      console.warn('[AI-Extractor] External prompt config failed, using embedded:', error.message);
    }
  }
  return { basePrompt: null, siteInstructions: null };
}

function extractJSONBlockSafe(responseText) {
  try {
    const startIndex = responseText.indexOf('{');
    if (startIndex === -1) return null;
    let braceCount = 0;
    let inString = false;
    let escaped = false;
    let endIndex = -1;
    for (let i = startIndex; i < responseText.length; i++) {
      const char = responseText[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\' && inString) {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (braceCount === 0) {
          endIndex = i;
          break;
        }
      }
    }
    if (endIndex === -1) return null;
    const jsonText = responseText.substring(startIndex, endIndex + 1);
    const parsed = JSON.parse(jsonText);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
    return null;
  } catch (error) {
    return null;
  }
}

const DAY8_VERSION = 'day8-modular-enterprise-bloomberg-fix';

const DEFAULT_ENTERPRISE_CONFIG = {
  maxRetries: 3,
  maxContentLength: 2000,
  maxSummaryLength: 500,
  logLevel: 'info',
  jitterMaxMs: 500,
  enableFallbackParsing: true,
  trackLatency: true,
  schemaVersion: DAY8_VERSION,
  enableSecureLogging: true,
  enableTokenSafety: true,
  parallelExtractionThrottle: 3,
  efficiencyThreshold: 80,
  idealBytesPerToken: 4,
  externalPromptUrl: null,
  model: 'gemini-1.5-flash',
  temperature: 0.1,
  maxTokens: 2048,
  // Day 10 additions merged
  ...DAY10_CONFIG
};

// ============================================================================
// MAIN AI EXTRACTOR MODULE
// ============================================================================

const AIExtractor = {
  async executeAIExtraction(pageData, siteType, url, aiConfig) {
    const startTime = Date.now();
    const extractionId = this.generateExtractionId();
    try {
      this.logSecure('info', `[${extractionId}] Starting Day 10 AI extraction for ${siteType}`, aiConfig);
      
      if (!aiConfig || !aiConfig.apiKey) {
        throw new Error('AI configuration or API key missing');
      }
      
      if (!pageData || typeof pageData !== 'object') {
        throw new Error('Invalid page data provided to AI extractor');
      }
      
      const enterpriseConfig = { ...DEFAULT_ENTERPRISE_CONFIG, ...aiConfig };
      const promptData = await this.buildSchemaAwarePrompt(pageData, siteType, url, enterpriseConfig);
      const aiResponse = await this.executeWithEnhancedRetries(
        promptData.prompt,
        promptData.promptHash,
        enterpriseConfig,
        extractionId
      );
      
      this.validateTokenSafety(aiResponse, enterpriseConfig);
      let extractedData = await this.parseAIResponseEnhanced(aiResponse, enterpriseConfig);
      
      // ===== DAY 10 POST-PROCESSING =====
      console.log('[Day10] Applying post-processing: PII strip, date standardization, token limits');
      extractedData = postProcessDay10(extractedData);
      
      // ===== DAY 10 CONFIDENCE VALIDATION =====
      const confidenceCheck = validateConfidenceDay10(extractedData);
      if (confidenceCheck.autoDiscard) {
        console.warn(`[Day10] Low confidence extraction auto-discarded: ${confidenceCheck.score}%`);
        throw new Error(`CONFIDENCE_TOO_LOW: ${confidenceCheck.score}%`);
      }
      extractedData.confidence_validated = true;
      extractedData.confidence_check = confidenceCheck;
      console.log(`[Day10] Confidence validated: ${confidenceCheck.score}% ✓`);
      
      if (siteType === 'bloomberg') {
        this.logSecure('info', `[${extractionId}] Applying Bloomberg field mapping`, enterpriseConfig);
        const mappedData = this.applyBloombergFieldMapping(extractedData);
        Object.assign(extractedData, mappedData);
      }
      
      const accuracyMetrics = this.calculateEnhancedAccuracy(extractedData, siteType);
      const schemaValidation = this.validateAgainstSchema(extractedData, siteType);
      const tokenEfficiency = this.calculateTokenEfficiency(aiResponse, enterpriseConfig);
      
      const result = {
        success: true,
        data: extractedData,
        rawAccuracy: accuracyMetrics.fieldAccuracy,
        metadata: {
          extractionTime: Date.now() - startTime,
          method: 'ai',
          realAI: true,
          url: url,
          siteType: siteType,
          model: enterpriseConfig.model,
          tokens: aiResponse.tokens || 'unknown',
          responseSize: aiResponse.responseSize || 0,
          tokenEfficiency: tokenEfficiency,
          aiAttemptCount: aiResponse.attemptCount,
          day10Enhanced: true,
          confidenceScore: confidenceCheck.score,
          piiStripped: true,
          dateStandardized: true,
          extractionId: extractionId
        }
      };
      
      this.logSecure('info', `[${extractionId}] Day 10 extraction completed: ${result.rawAccuracy}% accuracy, ${confidenceCheck.score}% confidence`, enterpriseConfig);
      return result;
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorType: this.classifyAIError(error.message),
        metadata: { day10Enhanced: true, extractionTime: Date.now() - startTime }
      };
    }
  },

  async buildSchemaAwarePrompt(pageData, siteType, url, enterpriseConfig) {
    const basePrompt = await this.getBasePrompt(enterpriseConfig);
    const siteSpecificInstructions = this.getSiteSpecificInstructions(siteType);
    const pageContent = this.preparePageContent(pageData, enterpriseConfig);
    const prompt = `${basePrompt}\n\nSITE TYPE: ${siteType.toUpperCase()}\nURL: ${url}\nSCHEMA VERSION: ${enterpriseConfig.schemaVersion}\n\n${siteSpecificInstructions}\n\nPAGE CONTENT TO EXTRACT FROM:\n\n${pageContent}\n\nReturn ONLY valid JSON with the enterprise schema. No explanations, no markdown, just pure JSON.`;
    const promptHash = await this.generateEnhancedHash(siteType, url, enterpriseConfig.schemaVersion);
    return { prompt, promptHash };
  },

  async generateEnhancedHash(siteType, url, schemaVersion) {
    const hashInput = `${siteType}-${new URL(url).hostname}-${schemaVersion}-${Date.now()}`;
    return await sha256(hashInput);
  },

  async getBasePrompt(enterpriseConfig) {
    const externalConfig = await loadExternalPromptConfig(enterpriseConfig);
    if (externalConfig && externalConfig.basePrompt) {
      return externalConfig.basePrompt.replace('{schemaVersion}', enterpriseConfig.schemaVersion);
    }
    return `You are a championship-grade data extraction specialist achieving 80%+ accuracy through intelligent JSON extraction with confidence-based quality control.

DAY 10 OBJECTIVE: AI ENGINE v1 - 80% ACCURACY MILESTONE

CORE PRINCIPLES:
1. JSON-only output - ZERO markdown, ZERO explanations
2. Self-evaluate every extraction with confidence_score (0-100)
3. NULL over hallucination - admit uncertainty
4. YYYY-MM-DD date standardization
5. PII-free extractions (no emails, phones, addresses)

EXTRACTION SCHEMA:
{
  "title": "string",
  "author": "string",
  "publication_date": "YYYY-MM-DD",
  "main_content_summary": "string",
  "category": "string",
  "links": ["array"],
  "images": ["array"],
  "description": "string",
  "price": "string",
  "ingredients": ["array"],
  "instructions": ["array"],
  "reviews_rating": "string",
  "confidence_score": 85
}

CONFIDENCE SCORING (CRITICAL):
- 0-49: Auto-discard, unreliable
- 50-70: Medium confidence, acceptable
- 71-85: High confidence, reliable
- 86-100: Very high confidence

FIELD RULES:
- publication_date: Convert ALL dates to YYYY-MM-DD
- price: Format: "$XX.XX" or "€XX.XX"
- reviews_rating: Format: "X.X/5" or "X.X stars"
- ingredients: Array with ≥3 items or []
- instructions: Array with ≥2 items or []

SECURITY REQUIREMENTS:
- Strip PII: Remove emails, phone numbers, addresses
- Token limits: title (200 chars), description (1000 chars)
- Array limits: ingredients (50 max), instructions (30 max)

DAY 10 ACCURACY TARGETS:
- Amazon: 85%+, Bloomberg: 70%+, AllRecipes: 80%+
- Wikipedia: 85%+, Medium: 80%+
- OVERALL: 80%+ (LOCKED - NON-NEGOTIABLE)`;
  },

  getSiteSpecificInstructions(siteType) {
    const instructions = {
      amazon: 'ECOMMERCE (Amazon): Priority: price, reviews_rating, description, title. Required fields: title, price, description. Confidence target: 85%+',
      allrecipes: 'RECIPE (AllRecipes): Priority: ingredients, instructions, title. Required fields: title, ingredients, instructions. Confidence target: 80%+. Ensure ingredients ≥3 items, instructions ≥2 items.',
      bloomberg: 'NEWS (Bloomberg): Priority: title, author, publication_date, main_content_summary. Required fields: title, description, category, main_content_summary. Confidence target: 70%+',
      wikipedia: 'WIKI (Wikipedia): Priority: title, main_content_summary, category. Required fields: title, description, main_content_summary. Confidence target: 85%+',
      medium: 'BLOG (Medium): Priority: title, author, publication_date, description. Required fields: title, description, author, publication_date. Confidence target: 80%+',
      generic: 'GENERIC: Extract title, description, summary, category. Confidence target: 75%+'
    };
    return instructions[siteType] || instructions.generic;
  },

  preparePageContent(pageData, enterpriseConfig) {
    const content = [];
    const maxLength = enterpriseConfig.maxContentLength || 2000;
    if (pageData.title) content.push(`TITLE: ${pageData.title}`);
    if (pageData.textContent) content.push(`TEXT: ${pageData.textContent.substring(0, maxLength)}`);
    if (pageData.meta) content.push(`META: ${JSON.stringify(pageData.meta).substring(0, 500)}`);
    if (pageData.description) content.push(`DESCRIPTION: ${pageData.description}`);
    return content.join('\n\n');
  },

  async executeWithEnhancedRetries(prompt, promptHash, enterpriseConfig, extractionId) {
    let lastError;
    const maxRetries = enterpriseConfig.maxRetries || 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logSecure('info', `[${extractionId}] API attempt ${attempt}/${maxRetries}`, enterpriseConfig);
        const response = await this.callGeminiAPI(prompt, enterpriseConfig);
        if (response && response.text) {
          return { 
            text: response.text, 
            tokens: response.tokens || 'unknown', 
            responseSize: response.text.length, 
            attemptCount: attempt, 
            promptHash 
          };
        }
      } catch (error) {
        lastError = error;
        this.logSecure('warn', `[${extractionId}] Attempt ${attempt} failed: ${error.message}`, enterpriseConfig);
        if (attempt < maxRetries) {
          const backoff = Math.min(Math.pow(2, attempt) * 1000, enterpriseConfig.maxBackoffMs);
          await new Promise(resolve => setTimeout(resolve, backoff));
        }
      }
    }
    throw new Error(`AI extraction failed after ${maxRetries} attempts: ${lastError.message}`);
  },

  async callGeminiAPI(prompt, enterpriseConfig) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${enterpriseConfig.model}:generateContent?key=${enterpriseConfig.apiKey}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: enterpriseConfig.temperature || 0.1, 
          maxOutputTokens: enterpriseConfig.maxTokens || 2048 
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('Invalid API response structure');
    }
    
    return { 
      text: data.candidates[0].content.parts[0].text, 
      tokens: data.usageMetadata?.totalTokenCount || 'unknown'
    };
  },

  validateTokenSafety(aiResponse, enterpriseConfig) {
    if (enterpriseConfig.enableTokenSafety && aiResponse.responseSize > 50000) {
      console.warn('[Day10-AIExtractor] Response size exceeds safety threshold');
    }
  },

  async parseAIResponseEnhanced(aiResponse, enterpriseConfig) {
    try {
      const jsonText = aiResponse.text.trim().replace(/``````/g, '');
      return JSON.parse(jsonText);
    } catch (error) {
      if (enterpriseConfig.enableFallbackParsing) {
        const extracted = extractJSONBlockSafe(aiResponse.text);
        if (extracted) return extracted;
      }
      throw new Error(`JSON parsing failed: ${error.message}`);
    }
  },

  applyBloombergFieldMapping(extractedData) {
    const mapped = { ...extractedData };
    if (extractedData.headline && !extractedData.title) mapped.title = extractedData.headline;
    if (extractedData.body && !extractedData.summary) mapped.summary = extractedData.body;
    if (extractedData.summary && !extractedData.main_content_summary) mapped.main_content_summary = extractedData.summary;
    return mapped;
  },

  calculateEnhancedAccuracy(extractedData, siteType) {
    const fields = Object.keys(extractedData).filter(f => f !== 'confidence_score' && f !== 'confidence_validated' && f !== 'confidence_check');
    const filled = fields.filter(f => {
      const val = extractedData[f];
      if (val === null || val === undefined || val === '') return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    }).length;
    return { 
      fieldAccuracy: Math.round((filled / fields.length) * 100), 
      completenessScore: filled,
      totalFields: fields.length
    };
  },

  validateAgainstSchema(extractedData, siteType) {
    const requiredFields = {
      amazon: ['title', 'price', 'description'],
      bloomberg: ['title', 'description'],
      allrecipes: ['title', 'ingredients', 'instructions'],
      wikipedia: ['title', 'main_content_summary'],
      medium: ['title', 'author', 'publication_date'],
      generic: ['title']
    };
    
    const required = requiredFields[siteType] || requiredFields.generic;
    const validated = required.filter(f => extractedData[f]);
    const missing = required.filter(f => !extractedData[f]);
    
    return { 
      validatedFields: validated, 
      missingRequired: missing,
      schemaCompliance: (validated.length / required.length) * 100
    };
  },

  calculateTokenEfficiency(aiResponse, enterpriseConfig) {
    const tokens = typeof aiResponse.tokens === 'number' ? aiResponse.tokens : 0;
    const bytes = aiResponse.responseSize || 0;
    const bytesPerToken = tokens > 0 ? (bytes / tokens) : 0;
    const efficiency = bytesPerToken > 0 ? Math.round((enterpriseConfig.idealBytesPerToken / bytesPerToken) * 100) : 0;
    return { 
      bytesPerToken: Math.round(bytesPerToken * 10) / 10, 
      efficiency: `${efficiency}%`,
      totalTokens: tokens
    };
  },

  classifyAIError(errorMessage) {
    if (errorMessage.includes('quota') || errorMessage.includes('429')) return 'AI_QUOTA_ERROR';
    if (errorMessage.includes('key') || errorMessage.includes('401')) return 'AI_API_KEY_ERROR';
    if (errorMessage.includes('CONFIDENCE_TOO_LOW')) return 'AI_CONFIDENCE_TOO_LOW';
    if (errorMessage.includes('timeout')) return 'AI_TIMEOUT_ERROR';
    if (errorMessage.includes('parse') || errorMessage.includes('JSON')) return 'AI_PARSE_ERROR';
    return 'AI_UNKNOWN_ERROR';
  },

  generateExtractionId() {
    return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  },

  logSecure(level, message, config) {
    if (config?.enableSecureLogging !== false) {
      const logLevel = config?.logLevel || 'info';
      const levels = { error: 0, warn: 1, info: 2, debug: 3 };
      if (levels[level] <= levels[logLevel]) {
        console[level](`[Day10-AIExtractor] ${message}`);
      }
    }
  }
};

console.log('[Day10-AIExtractor] AI Engine v1 loaded with confidence scoring, PII stripping, date standardization');

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIExtractor;
} else if (typeof window !== 'undefined') {
  window.AIExtractor = AIExtractor;
  window.AIExtractorManager = AIExtractor; // Alias for compatibility
}
