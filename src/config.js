/**
 * Web Weaver Lightning - Configuration System
 * Version: 3.0.0 (Day 12 - 5 Modes Edition)
 * 
 * MAJOR CHANGES:
 * - 5 extraction modes (offline, min, balanced, max, auto)
 * - Removed daily quota tracking
 * - Enhanced 429 error handling
 * - Better confidence scoring
 */

const CONFIG = {
  VERSION: '3.0.0-day12',
  API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models',
  GEMINI_MODEL: 'gemini-2.0-flash-lite',
  GEMINI_LITE_MODEL: 'gemini-2.0-flash-lite',
  
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
  
  // 429 Rate Limit Handling (NO QUOTA TRACKING)
  RATE_LIMIT: {
    enabled: true,
    exponentialBackoff: true,
    backoffSchedule: [1000, 2000, 4000, 8000, 16000],
    jitterPercent: 0.20,
    maxRetries: 5,
    userFriendlyMessage: 'You have exhausted your Gemini API quota. This is a limit set by Google. Please wait a few minutes and try again, or check your API usage at https://aistudio.google.com/'
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
  
  // Confidence Visualization
  CONFIDENCE_DISPLAY: {
    enabled: true,
    tiers: {
      excellent: {
        threshold: 90,
        color: '#10B981',
        icon: '🟢',
        label: 'Excellent',
        description: 'Verified AI Consensus',
        trustLevel: 'Trust this data fully'
      },
      good: {
        threshold: 75,
        color: '#F59E0B',
        icon: '🟡',
        label: 'Good',
        description: 'Verified Structure',
        trustLevel: 'Spot-check important fields'
      },
      caution: {
        threshold: 0,
        color: '#F97316',
        icon: '🟠',
        label: 'Caution',
        description: 'Manual Review Recommended',
        trustLevel: 'Verify all data manually'
      }
    },
    showBreakdown: true,
    showPerFieldConfidence: false,
    showHistoricalTrends: true
  },
  
  // Analytics & Telemetry
  ANALYTICS: {
    enabled: true,
    anonymous: true,
    collectLocalOnly: true,
    
    metrics: {
      trackModeUsage: true,
      trackConfidenceDistribution: true,
      trackAPICalls: true,
      trackDomainPerformance: true,
      trackErrors: true
    },
    
    reporting: {
      aggregationInterval: 86400000,
      maxHistoryDays: 7 // Only keep 1 week
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
      showConfidenceExplanations: true
    },
    
    notifications: {
      enabled: true,
      showInExtension: true, // Always show errors in extension, never browser alerts
      modeSwitch: true,
      confidenceAlerts: true
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
    aiRequest: 25000
  },
  
  // CSV Export Configuration
  CSV_EXPORT: {
    useAIForComplexData: true, // Use Gemini to flatten complex JSON
    complexityThreshold: 3, // If nested depth > 3, use AI
    maxManualDepth: 2 // Only manually flatten up to 2 levels
  }
};

// Freeze config
Object.freeze(CONFIG);
Object.freeze(CONFIG.MODES);
Object.freeze(CONFIG.CACHE);

// Export to global scope
self.CONFIG = CONFIG;
self.WEB_WEAVER_CONFIG = CONFIG;

console.log('[Config] Web Weaver Lightning v3.0 Configuration Loaded');
console.log('[Config] 5 Modes Available:', Object.keys(CONFIG.MODES));
console.log('[Config] Using model:', CONFIG.GEMINI_MODEL);
console.log('[Config] Quota tracking: DISABLED (429 handling only)');
