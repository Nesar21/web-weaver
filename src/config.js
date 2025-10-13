/**
 * Web Weaver Lightning - Modular Configuration System
 * Version: 2.0.0
 * Author: FAANG-Level Developer Agent
 * 
 * CRITICAL: This config system enables:
 * - Easy mode parameter tuning
 * - Smart Auto Mode decision-making
 * - A/B testing capabilities
 * - Future extensibility
 */

const CONFIG = {
  // System-wide constants
  VERSION: '2.0.0-day11',
  API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models',
  GEMINI_MODEL: 'gemini-2.0-flash-lite',
  GEMINI_LITE_MODEL: 'gemini-2.0-flash-lite',
  
  // API Quota Management
  QUOTA: {
    DAILY_LIMIT: 1500,
    WARNING_THRESHOLD: 0.80,  // 80% - Show warning
    CRITICAL_THRESHOLD: 0.90, // 90% - Suggest Eco
    FORCE_ECO_THRESHOLD: 0.95, // 95% - Force Eco
    BLOCK_THRESHOLD: 0.99,    // 99% - Block new extractions
    RESET_TIME_UTC: '00:00',  // Midnight Pacific = 12:30 PM IST
    RESET_TIME_IST: '12:30'
  },
  
  // Extraction Mode Configurations
  MODES: {
    // ECO MODE: Maximum API efficiency
    eco: {
      id: 'eco',
      name: 'Eco Mode',
      description: 'Fast & efficient extraction',
      icon: '🌿',
      
      // Pipeline Configuration
      pipeline: {
        useDOMAnalysis: true,
        skipAIVerificationThreshold: 90, // Skip AI if DOM confidence > 90%
        alwaysVerifyAI: false,
        dualExtraction: false
      },
      
      // API Call Strategy
      apiStrategy: {
        maxAPICalls: 2,
        targetAPICalls: 1.4,  // With caching
        skipPromptGeneration: false, // Only skip if cached
        skipTypeDetection: true     // Trust DOM completely
      },
      
      // Retry Logic
      retry: {
        maxRetries: 0,  // Fail fast
        retryOnNetworkError: false,
        retryOn429: false,
        retryOn500: false,
        exponentialBackoff: false
      },
      
      // Caching Strategy
      cache: {
        useCache: true,
        trustCacheThreshold: 0.85,  // 85% reliability = trust cache
        cachePromptTemplates: true,
        cacheTypeDetection: true
      },
      
      // Performance Targets
      performance: {
        targetSpeed: 3,        // 3 seconds average
        targetConfidence: 80,  // 80% minimum
        acceptableRange: [75, 85]
      },
      
      // Best Use Cases
      useCases: [
        'High-volume scraping',
        'Known reliable domains',
        'Non-critical data',
        'Testing environments',
        'Quota conservation'
      ]
    },
    
    // BALANCED MODE: Smart verification when needed
    balanced: {
      id: 'balanced',
      name: 'Balanced Mode',
      description: 'Smart extraction with verification',
      icon: '⚖️',
      
      // Pipeline Configuration
      pipeline: {
        useDOMAnalysis: true,
        skipAIVerificationThreshold: 80, // Skip AI if DOM confidence > 80%
        alwaysVerifyAI: false,           // Conditional verification
        dualExtraction: false
      },
      
      // API Call Strategy
      apiStrategy: {
        maxAPICalls: 3,
        targetAPICalls: 2.4,  // Average with smart skipping
        skipPromptGeneration: false,
        skipTypeDetection: false  // Verify when uncertain
      },
      
      // Retry Logic
      retry: {
        maxRetries: 1,
        retryOnNetworkError: true,
        retryOn429: false,  // Handled by backoff system
        retryOn500: true,
        exponentialBackoff: true,
        backoffDelays: [2000, 4000]  // 2s, 4s
      },
      
      // Caching Strategy
      cache: {
        useCache: true,
        trustCacheThreshold: 0.95,  // Higher threshold than Eco
        cachePromptTemplates: true,
        cacheTypeDetection: true
      },
      
      // Performance Targets
      performance: {
        targetSpeed: 5,        // 5 seconds average
        targetConfidence: 85,  // 85% target
        acceptableRange: [80, 88]
      },
      
      // Best Use Cases
      useCases: [
        'General web scraping',
        'Production applications',
        'Mixed page types',
        'First-time domains',
        'Critical but not mission-critical'
      ]
    },
    
    // SMART AUTO MODE: Intelligent mode selection
    auto: {
      id: 'auto',
      name: 'Smart Auto Mode',
      description: 'Automatically chooses best mode',
      icon: '🤖',
      
      // Decision Algorithm Weights
      decisionWeights: {
        cacheReliability: 0.35,    // 35% weight
        quotaRemaining: 0.25,      // 25% weight
        domConfidence: 0.20,       // 20% weight
        domainHistory: 0.15,       // 15% weight
        pageComplexity: 0.05       // 5% weight
      },
      
      // Decision Thresholds
      thresholds: {
        forceEco: {
          quotaRemaining: 0.30,          // < 30% quota
          cacheReliability: 0.90,        // > 90% reliability
          domConfidence: 85              // > 85% confidence
        },
        preferEco: {
          quotaRemaining: 0.50,          // < 50% quota
          cacheReliability: 0.85,        // > 85% reliability
          domConfidence: 80              // > 80% confidence
        },
        preferBalanced: {
          domConfidence: 70,             // < 70% confidence
          newDomain: true,               // First encounter
          previousFailures: 2            // 2+ recent failures
        }
      },
      
      // Mode Switching Rules
      switching: {
        allowMidSession: true,
        upgradeOnLowConfidence: true,
        upgradeThreshold: 70,          // < 70% triggers upgrade
        downgradeOnQuota: true,
        downgradeThreshold: 0.95       // > 95% quota triggers downgrade
      }
    }
  },
  
  // 429 Rate Limit Protection
  RATE_LIMIT: {
    enabled: true,
    exponentialBackoff: true,
    backoffSchedule: [1000, 2000, 4000, 8000, 16000], // 1s, 2s, 4s, 8s, 16s
    jitterPercent: 0.20,  // ±20% random jitter
    maxRetries: 5,
    queueEnabled: true,
    queueMaxSize: 10
  },
  
  // Domain Cache Configuration
  CACHE: {
    enabled: true,
    maxDomains: 100,
    ttl: 3600000,  // 1 hour in ms
    evictionPolicy: 'LRU',  // Least Recently Used
    
    // Learning System
    learning: {
      enabled: true,
      minExtractionsForLearning: 5,   // Need 5+ extractions to learn
      confidenceWindowSize: 20,        // Track last 20 extractions
      reliabilityDecayFactor: 0.95,   // Recent failures weighted more
      temporalPatternsEnabled: true,
      temporalWindowHours: 24
    },
    
    // Reliability Scoring
    reliability: {
      minScore: 0.0,
      maxScore: 1.0,
      thresholds: {
        excellent: 0.90,   // > 0.90 = Highly reliable
        good: 0.80,        // 0.80-0.90 = Reliable
        moderate: 0.70,    // 0.70-0.80 = Moderate
        poor: 0.60,        // 0.60-0.70 = Poor
        unreliable: 0.60   // < 0.60 = Unreliable
      }
    }
  },
  
  // Confidence Visualization
  CONFIDENCE_DISPLAY: {
    enabled: true,
    tiers: {
      excellent: {
        threshold: 90,
        color: '#10B981',  // Green
        icon: '🟢',
        label: 'Excellent',
        description: 'Verified AI Consensus',
        trustLevel: 'Trust this data fully'
      },
      good: {
        threshold: 75,
        color: '#F59E0B',  // Yellow
        icon: '🟡',
        label: 'Good',
        description: 'Verified Structure',
        trustLevel: 'Spot-check important fields'
      },
      caution: {
        threshold: 0,
        color: '#F97316',  // Orange
        icon: '🟠',
        label: 'Caution',
        description: 'Manual Review Recommended',
        trustLevel: 'Verify all data manually'
      }
    },
    showBreakdown: true,
    showPerFieldConfidence: false,  // Advanced feature
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
      trackQuotaUsage: true,
      trackDomainPerformance: true,
      trackErrors: true
    },
    
    reporting: {
      aggregationInterval: 86400000,  // 24 hours
      maxHistoryDays: 30
    }
  },
  
  // UI/UX Settings
  UX: {
    animations: {
      enabled: true,
      transitionDuration: 200,  // ms
      successAnimation: true,
      loadingStates: true
    },
    
    tooltips: {
      enabled: true,
      showModeHints: true,
      showQuotaWarnings: true,
      showConfidenceExplanations: true
    },
    
    notifications: {
      enabled: true,
      quotaWarnings: true,
      queueComplete: true,
      modeSwitch: true,
      confidenceAlerts: true
    }
  },
  
  // Deferred Queue System
  QUEUE: {
    enabled: true,
    maxQueueSize: 50,
    autoProcessOnReset: true,
    notifyOnComplete: true,
    
    processing: {
      sequentialProcessing: true,
      delayBetweenItems: 1000,  // 1 second delay
      stopOnFailure: false,
      retryFailures: true
    },
    
    scheduling: {
      allowCustomSchedule: true,
      defaultSchedule: 'quota_reset',  // Options: quota_reset, custom, manual
      offPeakHours: [0, 1, 2, 3, 4, 5, 6]  // 12am-6am
    }
  },
  
  // Timeouts
  TIMEOUTS: {
    default: 30000,       // 30 seconds
    eco: 20000,          // 20 seconds (faster timeout)
    balanced: 30000,     // 30 seconds
    domAnalysis: 5000,   // 5 seconds
    aiRequest: 25000     // 25 seconds
  }
};

// Freeze config to prevent accidental mutations
Object.freeze(CONFIG);
Object.freeze(CONFIG.MODES);
Object.freeze(CONFIG.QUOTA);
Object.freeze(CONFIG.CACHE);

// ========================================
// EXPORT TO GLOBAL SCOPE (NO const!)
// ========================================
self.CONFIG = CONFIG;
self.WEB_WEAVER_CONFIG = CONFIG;

// Log configuration on load (development only)
console.log('[Config] Web Weaver Lightning v2.0 Configuration Loaded');
console.log('[Config] Eco Mode Target API Calls:', CONFIG.MODES.eco.apiStrategy.targetAPICalls);
console.log('[Config] Balanced Mode Target API Calls:', CONFIG.MODES.balanced.apiStrategy.targetAPICalls);
console.log('[Config] Daily Quota Limit:', CONFIG.QUOTA.DAILY_LIMIT);
console.log('[Config] Cache Enabled:', CONFIG.CACHE.enabled);
console.log('[Config] Learning System Enabled:', CONFIG.CACHE.learning.enabled);
console.log('[Config] 🚀 SWITCHED TO gemini-2.0-flash-lite (30 RPM, 200 RPD)');
