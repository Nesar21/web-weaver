/**
 * Web Weaver Lightning - Configuration System
 * Version: 3.4.0 (Day 15+ - MULTI/SINGLE_ITEM Extraction Types Added)
 * 
 * 🆕 v3.4 CHANGES (NO LIMITS, NATURAL PAGINATION):
 * - Added EXTRACTION_TYPES: MULTI (all items) and SINGLE_ITEM (screenshot)
 * - REMOVED: API usage tracking (no "Today's Usage 99/100")
 * - REMOVED: Item limits (extract ALL loaded items)
 * - REMOVED: Auto-scroll logic (user controls pagination)
 * - ENHANCED: Better 429 error messages with recovery steps
 * - RETAINED: All 5 modes (offline, min, balanced, max, auto)
 * - RETAINED: 3-tier classification (DOM → Visual → AI)
 * 
 * PHILOSOPHY:
 * - Let the PAGE decide what's loaded, not us
 * - Extract ONLY what's currently visible/loaded in DOM
 * - User manually scrolls or clicks "Next Page"
 * - No forced scrolling or DOM manipulation
 */

const CONFIG = {
  VERSION: '3.4.0-day15-multi-single',
  API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models',
  GEMINI_MODEL: 'gemini-2.0-flash-lite',
  GEMINI_LITE_MODEL: 'gemini-2.0-flash-lite',

  // ════════════════════════════════════════════════════════════════
  // 🆕 v3.4: EXTRACTION TYPES (MULTI vs SINGLE_ITEM)
  // ════════════════════════════════════════════════════════════════
  EXTRACTION_TYPES: {
    MULTI: {
      id: 'MULTI',
      name: 'Extract All Items',
      description: 'Extracts all items currently loaded on the page',
      icon: '📦',
      method: 'DOM_ANALYSIS', // Use DOM + AI for items
      itemLimit: Infinity, // NO LIMITS - extract everything
      naturalPagination: true, // User controls pagination
      helpText: 'Extracts all items currently loaded. Scroll or click "Next Page" to load more, then click "Extract Again".'
    },
    
    SINGLE_ITEM: {
      id: 'SINGLE_ITEM',
      name: 'Extract Visible Article',
      description: 'Captures screenshot and extracts the main visible article/item',
      icon: '📄',
      method: 'SCREENSHOT_VISION', // Use Vision API
      itemLimit: 1, // Only one item
      naturalPagination: false, // Not applicable for single items
      helpText: 'Takes a screenshot and extracts the main article/item visible on your screen (ignores sidebars).'
    }
  },

  // Extraction Mode Configurations
  MODES: {
    // 🟢 OFFLINE MODE: No AI, DOM extraction only
    offline: {
      id: 'offline',
      name: 'Offline Mode',
      description: 'DOM extraction only - No AI calls',
      icon: '🟢',
      pipeline: {
        useDOMAnalysis: true,
        useAI: false,
        apiCalls: 0
      },
      performance: {
        targetSpeed: 1,
        targetConfidence: 60,
        acceptableRange: [40, 70]
      },
      useCases: [
        'No API key available',
        'Testing DOM extraction',
        'Rate limit exceeded',
        'Offline usage',
        'Privacy-focused extraction'
      ]
    },

    // 🌿 MIN MODE: Minimal AI usage (1-2 calls)
    min: {
      id: 'min',
      name: 'Min Mode',
      description: 'Fast extraction with minimal AI',
      icon: '🌿',
      pipeline: {
        useDOMAnalysis: true,
        skipAIVerificationThreshold: 90,
        alwaysVerifyAI: false,
        dualExtraction: false
      },
      apiStrategy: {
        maxAPICalls: 2,
        targetAPICalls: 1.4,
        skipPromptGeneration: false,
        skipTypeDetection: true
      },
      retry: {
        maxRetries: 0,
        retryOnNetworkError: false
      },
      cache: {
        useCache: true,
        trustCacheThreshold: 0.85,
        cachePromptTemplates: true,
        cacheTypeDetection: true
      },
      performance: {
        targetSpeed: 3,
        targetConfidence: 75,
        acceptableRange: [70, 80]
      },
      useCases: [
        'High-volume scraping',
        'Known reliable domains',
        'Quota conservation',
        'Testing environments'
      ]
    },

    // ⚖️ BALANCED MODE: Smart verification (2-3 calls)
    balanced: {
      id: 'balanced',
      name: 'Balanced Mode',
      description: 'Smart extraction with verification',
      icon: '⚖️',
      pipeline: {
        useDOMAnalysis: true,
        skipAIVerificationThreshold: 80,
        alwaysVerifyAI: false,
        dualExtraction: false
      },
      apiStrategy: {
        maxAPICalls: 3,
        targetAPICalls: 2.4,
        skipPromptGeneration: false,
        skipTypeDetection: false
      },
      retry: {
        maxRetries: 1,
        retryOnNetworkError: true,
        retryOn500: true,
        exponentialBackoff: true,
        backoffDelays: [2000, 4000]
      },
      cache: {
        useCache: true,
        trustCacheThreshold: 0.95,
        cachePromptTemplates: true,
        cacheTypeDetection: true
      },
      performance: {
        targetSpeed: 5,
        targetConfidence: 85,
        acceptableRange: [80, 90]
      },
      useCases: [
        'General web scraping',
        'Production applications',
        'Mixed page types',
        'First-time domains'
      ]
    },

    // 🚀 MAX MODE: Maximum accuracy (3-4 calls)
    max: {
      id: 'max',
      name: 'Max Mode',
      description: 'Maximum accuracy with triple verification',
      icon: '🚀',
      pipeline: {
        useDOMAnalysis: true,
        skipAIVerificationThreshold: 0, // Never skip
        alwaysVerifyAI: true,
        dualExtraction: true, // Extract twice and compare
        tripleVerification: true
      },
      apiStrategy: {
        maxAPICalls: 4,
        targetAPICalls: 3.8,
        skipPromptGeneration: false,
        skipTypeDetection: false,
        useMultiplePrompts: true
      },
      retry: {
        maxRetries: 2,
        retryOnNetworkError: true,
        retryOn500: true,
        exponentialBackoff: true,
        backoffDelays: [2000, 4000, 8000]
      },
      cache: {
        useCache: false, // Always fresh extraction
        trustCacheThreshold: 1.0,
        cachePromptTemplates: false,
        cacheTypeDetection: false
      },
      performance: {
        targetSpeed: 10,
        targetConfidence: 95,
        acceptableRange: [90, 100]
      },
      useCases: [
        'Critical data extraction',
        'Financial data',
        'Legal documents',
        'Medical information',
        'Production-critical scraping'
      ]
    },

    // 🤖 SMART AUTO MODE: Intelligent selection
    auto: {
      id: 'auto',
      name: 'Smart Auto',
      description: 'AI chooses best mode automatically',
      icon: '🤖',
      decisionWeights: {
        cacheReliability: 0.35,
        domConfidence: 0.30,
        domainHistory: 0.20,
        pageComplexity: 0.15
      },
      thresholds: {
        forceMin: {
          cacheReliability: 0.90,
          domConfidence: 85
        },
        preferMin: {
          cacheReliability: 0.85,
          domConfidence: 80
        },
        preferBalanced: {
          domConfidence: 70,
          newDomain: true
        },
        preferMax: {
          domConfidence: 50,
          previousFailures: 2
        }
      },
      switching: {
        allowMidSession: true,
        upgradeOnLowConfidence: true,
        upgradeThreshold: 70
      }
    }
  },

  // 429 Rate Limit Handling (NO QUOTA TRACKING, ONLY ERROR HANDLING)
  RATE_LIMIT: {
    enabled: true,
    trackQuota: false, // 🆕 DISABLED: No quota tracking
    showUsageInUI: false, // 🆕 DISABLED: No "Today's API Usage 99/100"
    
    exponentialBackoff: true,
    backoffSchedule: [1000, 2000, 4000, 8000, 16000], // 1s → 2s → 4s → 8s → 16s
    jitterPercent: 0.20, // 20% randomization
    maxRetries: 5,
    
    // User-friendly error messages
    errorMessages: {
      429: {
        title: '⚠️ API Rate Limit Exceeded',
        message: 'You have exhausted your Gemini API quota. This is a limit set by Google.',
        action: 'Wait 60 seconds and try again, or use Offline/Min mode (no API)',
        recoverySteps: [
          'Wait 1-2 minutes for quota to reset',
          'Switch to Offline mode (no API calls)',
          'Switch to Min mode (minimal API calls)',
          'Check your usage at https://aistudio.google.com/'
        ]
      },
      403: {
        title: '🔒 API Key Invalid',
        message: 'Your Gemini API key is invalid or expired.',
        action: 'Update your API key in extension settings',
        recoverySteps: [
          'Go to https://aistudio.google.com/',
          'Generate a new API key',
          'Update key in extension settings',
          'Try extraction again'
        ]
      },
      500: {
        title: '🔧 Gemini API Error',
        message: 'Gemini API is experiencing server issues.',
        action: 'Try again in a few minutes or use Offline mode',
        recoverySteps: [
          'Wait 2-3 minutes',
          'Check Google AI status page',
          'Switch to Offline mode temporarily',
          'Retry extraction'
        ]
      },
      network: {
        title: '🌐 Network Error',
        message: 'No internet connection or network timeout.',
        action: 'Check your internet connection',
        recoverySteps: [
          'Check WiFi/Ethernet connection',
          'Test internet connectivity',
          'Disable VPN if active',
          'Try again'
        ]
      }
    }
  },

  // Domain Cache Configuration
  CACHE: {
    enabled: true,
    maxDomains: 100,
    ttl: 3600000,
    evictionPolicy: 'LRU',
    learning: {
      enabled: true,
      minExtractionsForLearning: 5,
      confidenceWindowSize: 20,
      reliabilityDecayFactor: 0.95
    },
    reliability: {
      minScore: 0.0,
      maxScore: 1.0,
      thresholds: {
        excellent: 0.90,
        good: 0.80,
        moderate: 0.70,
        poor: 0.60
      }
    }
  },

  // AI CLASSIFICATION CONFIGURATION (TIER 3)
  AI_CLASSIFICATION: {
    enabled: true,
    triggerThreshold: 80,
    timeout: 5000,
    maxRetries: 1,
    minConfidence: 75,
    maxContentLength: 2000,
    maxHeadings: {
      h1: 5,
      h2: 10
    },
    temperature: 0.1,
    maxOutputTokens: 256,
    fallbackOnError: true,
    fallbackClassification: 'MULTI_ITEM',
    estimatedCostPerCall: 0.01,
    logPrompts: false,
    logResponses: false
  },

  // VISUAL PATTERN DETECTION (TIER 2)
  VISUAL_DETECTION: {
    enabled: true,
    sizeThreshold: 0.20,
    positionThreshold: 50,
    structureWeight: 0.50,
    minItems: 5,
    maxCandidates: 200,
    minElementArea: 200,
    maxFullWidthRatio: 0.90,
    timeout: 2000,
    minPatternConfidence: 75,
    enableSampling: true,
    samplingRate: 3,
    enableSignatureCache: true,
    signatureCacheTTL: 5000,
    structureWeights: {
      childCount: 0.40,
      textLength: 0.30,
      hasImage: 0.15,
      hasLink: 0.15
    },
    fallbackToAI: true,
    confidenceBoost: 5,
    logCandidates: false,
    logGroups: false,
    logSignatures: false
  },

  // UNCERTAINTY DETECTION CONFIG
  UNCERTAINTY_DETECTION: {
    enabled: true,
    thresholds: {
      contradictorySignals: 20,
      complexFeed: 30,
      manySections: 25,
      mediumLike: 25
    },
    uncertaintyThreshold: 40,
    fallbackToMultiItem: true,
    fallbackConfidence: 60
  },

  // Confidence Visualization
  CONFIDENCE_DISPLAY: {
    enabled: true,
    tiers: {
      excellent: {
        threshold: 90,
        color: '#10B981',
        icon: '🟢',
        label: 'High',
        description: 'Verified AI Consensus',
        trustLevel: 'Trust this data fully'
      },
      good: {
        threshold: 75,
        color: '#F59E0B',
        icon: '🔵',
        label: 'Good',
        description: 'Verified Structure',
        trustLevel: 'Spot-check important fields'
      },
      caution: {
        threshold: 0,
        color: '#F97316',
        icon: '🟠',
        label: 'Medium',
        description: 'Manual Review Recommended',
        trustLevel: 'Verify all data manually'
      }
    },
    showBreakdown: true,
    showPerFieldConfidence: false,
    showHistoricalTrends: true
  },

  // Analytics & Telemetry (LOCAL ONLY, NO API TRACKING)
  ANALYTICS: {
    enabled: true,
    anonymous: true,
    collectLocalOnly: true,
    trackAPIUsage: false, // 🆕 DISABLED: No API usage tracking
    metrics: {
      trackModeUsage: true,
      trackConfidenceDistribution: true,
      trackAPICalls: false, // 🆕 DISABLED
      trackDomainPerformance: true,
      trackErrors: true,
      trackVisualDetection: true,
      trackUncertaintyFallbacks: true,
      trackAIClassification: true,
      trackExtractionTypes: true // 🆕 Track MULTI vs SINGLE_ITEM usage
    },
    reporting: {
      aggregationInterval: 86400000,
      maxHistoryDays: 7
    }
  },

  // UI/UX Settings
  UX: {
    animations: {
      enabled: true,
      transitionDuration: 200,
      successAnimation: true,
      loadingStates: true
    },
    tooltips: {
      enabled: true,
      showModeHints: true,
      showConfidenceExplanations: true,
      showExtractionTypeHints: true // 🆕 Show MULTI vs SINGLE_ITEM hints
    },
    notifications: {
      enabled: true,
      showInExtension: true,
      modeSwitch: true,
      confidenceAlerts: true,
      paginationHints: true // 🆕 Show "Extract Again" hints
    }
  },

  // Timeouts
  TIMEOUTS: {
    default: 30000,
    offline: 5000,
    min: 20000,
    balanced: 30000,
    max: 45000,
    domAnalysis: 5000,
    aiRequest: 25000,
    visualDetection: 2000,
    aiClassification: 5000,
    screenshotCapture: 3000, // 🆕 For SINGLE_ITEM mode
    visionAPIRequest: 8000 // 🆕 For Vision API
  },

  // CSV Export Configuration
  CSV_EXPORT: {
    useAIForComplexData: true,
    complexityThreshold: 3,
    maxManualDepth: 2
  },

  // 🆕 v3.4: SCREENSHOT EXTRACTION (SINGLE_ITEM MODE)
  SCREENSHOT_EXTRACTION: {
    enabled: true,
    format: 'png',
    quality: 0.92,
    captureFullPage: false, // Only capture visible viewport
    maxImageSize: 5 * 1024 * 1024, // 5MB max
    visionAPIModel: 'gemini-2.0-flash-lite', // Use same model
    temperature: 0.1,
    maxOutputTokens: 512,
    promptTemplate: `You are analyzing a screenshot of a web page.
Extract the MAIN article or item visible in the center/top of the screen.

Return JSON with these fields:
- title (string): Main title/heading visible
- author (string): Author if visible
- date (string): Publication date if visible
- content (string): Main text content (first 500 words)
- description (string): Brief summary
- image (string): Main image URL if visible
- price (string): Price if this is a product
- rating (string): Rating if visible
- url (string): Current page URL
- type (string): article|product|post|video

Focus ONLY on the PRIMARY content visible on screen.
Ignore navigation, sidebars, ads, comments, recommendations.
If multiple items visible, extract the LARGEST/MAIN one.`
  }
};

// Freeze config (prevent modifications)
Object.freeze(CONFIG);
Object.freeze(CONFIG.EXTRACTION_TYPES);
Object.freeze(CONFIG.MODES);
Object.freeze(CONFIG.RATE_LIMIT);
Object.freeze(CONFIG.CACHE);
Object.freeze(CONFIG.AI_CLASSIFICATION);
Object.freeze(CONFIG.VISUAL_DETECTION);
Object.freeze(CONFIG.UNCERTAINTY_DETECTION);
Object.freeze(CONFIG.SCREENSHOT_EXTRACTION);

// Export to global scope
self.CONFIG = CONFIG;
self.WEB_WEAVER_CONFIG = CONFIG;

console.log('[Config] ═══════════════════════════════════════════════');
console.log('[Config] Web Weaver Lightning v3.4 (MULTI/SINGLE) Loaded');
console.log('[Config] ═══════════════════════════════════════════════');
console.log('[Config] 5 Modes Available:', Object.keys(CONFIG.MODES));
console.log('[Config] 2 Extraction Types: MULTI, SINGLE_ITEM');
console.log('[Config] Using model:', CONFIG.GEMINI_MODEL);
console.log('[Config] ═══════════════════════════════════════════════');
console.log('[Config] ❌ API Usage Tracking: DISABLED');
console.log('[Config] ❌ Item Limits: DISABLED (extract all)');
console.log('[Config] ❌ Auto-Scroll: DISABLED (user controls)');
console.log('[Config] ✅ 429 Error Handling: ENABLED');
console.log('[Config] ✅ Natural Pagination: User clicks "Extract Again"');
console.log('[Config] ═══════════════════════════════════════════════');
console.log('[Config] TIER 1: DOM Heuristics (Fast & Free)');
console.log('[Config] TIER 2: Visual Patterns (2000ms timeout)');
console.log('[Config] TIER 3: AI Semantic Analysis (5000ms timeout)');
console.log('[Config] ═══════════════════════════════════════════════');
console.log('[Config] MULTI Mode: Extract all loaded items (DOM + AI)');
console.log('[Config] SINGLE_ITEM Mode: Screenshot → Vision API');
console.log('[Config] Works on: ANY WEBSITE (Universal)');
console.log('[Config] ═══════════════════════════════════════════════');
