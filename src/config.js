/**
 * Web Weaver Lightning - Configuration System
 * Version: 4.0.0 (Day 21 - CHROME AI + CLOUD API TOGGLE + SECURITY)
 * 
 * 🆕 v4.0 CHANGES (DAY 21 SECURITY & AI PROVIDER TOGGLE):
 * - Added AI_PROVIDER: Toggle between Chrome Built-in AI and Cloud API
 * - Added SECURITY: API key validation, expiration warnings, runtime-only keys
 * - Added PRIVACY: TOS acceptance, privacy warnings, opt-in telemetry
 * - Added RATE_LIMIT_WARNINGS: Soft warnings at 25 RPM and 900K RPD
 * - Added DEDUPLICATION: State management for pagination workflows
 * - Added MULTI_SECTION_EXTRACTION: Enhanced DOM pattern detection
 * - ENHANCED: 429 fallback with Chrome AI suggestion
 * 
 * ✅ PRESERVED FROM v3.4:
 * - EXTRACTION_TYPES: MULTI (all items) and SINGLE_ITEM (screenshot)
 * - NO API usage tracking (unlimited extraction philosophy)
 * - Natural pagination (user controls page navigation)
 * - All 5 modes (offline, min, balanced, max, auto)
 * - 3-tier classification (DOM → Visual → AI)
 * 
 * PHILOSOPHY:
 * - Privacy-first: User API keys only, runtime storage, no hardcoded keys
 * - Flexible: Chrome AI (fast/free) OR Cloud API (advanced features)
 * - Transparent: Clear warnings before quota/rate limits hit
 * - Secure: Dynamic permissions, scoped access, no key leakage
 */

const CONFIG = {
  VERSION: '4.0.0-day21-chrome-ai-security',
  
  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.0: AI PROVIDER TOGGLE (Chrome Built-in vs Cloud API)
  // ════════════════════════════════════════════════════════════════
  AI_PROVIDER: {
    // Current provider (stored in chrome.storage.local)
    default: 'CHROME_BUILTIN', // 'CHROME_BUILTIN' or 'CLOUD_API'
    
    providers: {
      CHROME_BUILTIN: {
        id: 'CHROME_BUILTIN',
        name: 'Chrome Built-in AI',
        description: 'Fast, private, offline-capable AI (Gemini Nano)',
        icon: '🔵',
        advantages: [
          'Zero API cost',
          'Privacy-first (local processing)',
          'No rate limits',
          'Offline capable',
          'Instant response (<100ms)',
          'No internet required'
        ],
        limitations: [
          'Requires Chrome 128+ Canary/Dev',
          'Lower accuracy vs cloud models',
          'Limited context window (~2K tokens)',
          'No vision/image support yet',
          'Experimental API (may change)'
        ],
        availability: {
          checkMethod: 'window.ai?.languageModel?.capabilities',
          fallbackToCloud: true,
          userPromptOnUnavailable: true
        },
        performance: {
          avgLatency: 50, // ms
          maxContextTokens: 2048,
          temperatureSupport: true,
          streamingSupport: true
        }
      },
      
      CLOUD_API: {
        id: 'CLOUD_API',
        name: 'Cloud API (Gemini)',
        description: 'Advanced cloud AI with vision, high accuracy',
        icon: '☁️',
        advantages: [
          'Higher accuracy',
          'Larger context window (30K+ tokens)',
          'Vision API support (screenshot extraction)',
          'Multimodal capabilities',
          'Production-stable',
          'Works on any Chrome version'
        ],
        limitations: [
          'Requires API key',
          'Costs per API call (~$0.01/call)',
          'Rate limits (15 RPM, 1M RPD)',
          'Requires internet connection',
          'Privacy concerns (data sent to Google)',
          'Slower response (~500-2000ms)'
        ],
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
        model: 'gemini-2.0-flash-lite',
        visionModel: 'gemini-2.0-flash-lite',
        performance: {
          avgLatency: 800, // ms
          maxContextTokens: 32768,
          temperatureSupport: true,
          streamingSupport: false
        }
      }
    },
    
    // Fallback strategy when primary provider fails
    fallback: {
      enabled: true,
      strategy: 'AUTO_SWITCH', // 'AUTO_SWITCH' | 'PROMPT_USER' | 'FAIL_GRACEFULLY'
      chromeToCloud: true, // Fallback from Chrome AI → Cloud API
      cloudToChrome: false, // Don't fallback from Cloud → Chrome (quality degradation)
      notifyUser: true,
      rememberChoice: true // Remember fallback preference per session
    }
  },

  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.0: SECURITY & API KEY MANAGEMENT
  // ════════════════════════════════════════════════════════════════
  SECURITY: {
    // API Key Management
    apiKey: {
      storageLocation: 'chrome.storage.local', // NEVER in code
      encryptionEnabled: false, // Chrome handles encryption
      requireUserInput: true, // Must be entered by user at runtime
      validateOnEntry: true,
      validationEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models?key=',
      
      expirationWarning: {
        enabled: true,
        checkInterval: 86400000, // Check daily (24h)
        warnDaysBefore: 7, // Warn 7 days before expiration
        blockDaysBefore: 1 // Block usage 1 day before expiration
      },
      
      errorHandling: {
        invalidKeyMessage: '🔒 Invalid API key. Generate one at https://aistudio.google.com/',
        expiredKeyMessage: '⏰ API key expired. Please update it.',
        quotaExceededMessage: '⚠️ API quota exceeded. Wait 60s or switch to Chrome AI.',
        missingKeyMessage: '🔑 No API key found. Add one in Settings or use Chrome AI.'
      }
    },
    
    // Host Permissions (Dynamic, Scoped)
    permissions: {
      requestDynamically: true, // Request only when extraction starts
      scopeToActiveTab: true, // Only activeTab, not all_urls
      revokeOnDisable: false, // Keep permissions after extraction
      explainBeforeRequest: true,
      permissionMessage: 'Web Weaver needs permission to extract data from this page.'
    },
    
    // Build Security
    build: {
      preventKeyLeakage: true,
      noHardcodedKeys: true,
      gitignoreSecrets: true,
      buildTimeValidation: true,
      warningOnPush: 'ERROR: Never commit API keys! Use .env.local'
    }
  },

  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.0: PRIVACY & TERMS OF SERVICE
  // ════════════════════════════════════════════════════════════════
  PRIVACY: {
    // Terms of Service Acceptance
    tosAcceptance: {
      required: true,
      version: '1.0.0',
      storageKey: 'web_weaver_tos_accepted',
      showOnFirstUse: true,
      blockUntilAccepted: true,
      tosUrl: 'https://github.com/yourusername/web-weaver/blob/main/TERMS.md',
      
      warningMessage: {
        title: '⚠️ Privacy & Terms Notice',
        content: `Before using Web Weaver:

1. **Cloud API Mode:** When enabled, extracted data is sent to Google's Gemini API for processing. Review Google's privacy policy.

2. **Chrome AI Mode:** All processing happens locally. No data leaves your device.

3. **User Responsibility:** You are responsible for complying with website Terms of Service and applicable data protection laws (GDPR, CCPA, etc.).

4. **No Warranty:** This extension is provided "as-is" without guarantees of accuracy or reliability.

5. **API Keys:** You are responsible for securing your API keys. Never share them publicly.

Do you accept these terms?`,
        acceptButtonText: 'I Accept',
        declineButtonText: 'Decline (Extension Disabled)'
      }
    },
    
    // Privacy Settings
    dataCollection: {
      localOnlyDefault: true,
      allowAnonymousTelemetry: false, // Opt-in only
      telemetryStorageKey: 'web_weaver_telemetry_opt_in',
      telemetryMessage: 'Help improve Web Weaver by sharing anonymous usage data?',
      whatWeCollect: [
        'Extraction success/failure rates',
        'Mode usage statistics',
        'Average confidence scores',
        'Error types (no personal data)',
        'Performance metrics'
      ],
      whatWeNeverCollect: [
        'Extracted content',
        'Visited URLs',
        'API keys',
        'Personal information',
        'User identifiers'
      ]
    },
    
    // Data Retention
    dataRetention: {
      extractionHistory: {
        maxItems: 50,
        retentionDays: 7,
        autoDelete: true,
        userCanClear: true
      },
      errorLogs: {
        maxItems: 100,
        retentionDays: 3,
        autoDelete: true,
        userCanExport: true // For debugging/support
      }
    }
  },

  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.0: ENHANCED RATE LIMIT WARNINGS (Proactive)
  // ════════════════════════════════════════════════════════════════
  RATE_LIMIT: {
    enabled: true,
    trackQuota: false, // Still no quota tracking
    showUsageInUI: false, // Still no "99/100" displays
    
    // Proactive Warning Thresholds (BEFORE hitting limits)
    proactiveWarnings: {
      enabled: true,
      
      rpm: {
        threshold: 25, // Warn at 25 RPM (limit is ~15 RPM)
        message: '⚠️ High request rate detected. Slow down to avoid 429 errors.',
        action: 'Consider switching to Chrome AI or reducing extraction frequency.',
        cooldownSuggestion: 'Wait 60 seconds before next extraction.'
      },
      
      rpd: {
        threshold: 900000, // Warn at 900K tokens/day (limit is 1M TPD)
        message: '⚠️ Approaching daily token limit (900K/1M).',
        action: 'Switch to Chrome AI or wait until quota resets (midnight PST).',
        resetTime: 'Quota resets daily at 12:00 AM Pacific Time.'
      },
      
      consecutive429s: {
        threshold: 2, // Warn after 2 consecutive 429 errors
        message: '🚨 Multiple rate limit errors detected.',
        action: 'Automatic fallback to Chrome AI recommended.',
        autoSwitchAfter: 3 // Auto-switch after 3 consecutive 429s
      }
    },
    
    exponentialBackoff: true,
    backoffSchedule: [1000, 2000, 4000, 8000, 16000], // 1s → 16s
    jitterPercent: 0.20,
    maxRetries: 5,
    
    // Enhanced Error Messages (with Chrome AI fallback)
    errorMessages: {
      429: {
        title: '⚠️ API Rate Limit Exceeded',
        message: 'Google Gemini API rate limit reached. This is a Google-imposed limit.',
        action: 'Switch to Chrome AI (zero cost) or wait 60 seconds',
        recoverySteps: [
          '✅ Switch to Chrome AI (Settings → AI Provider → Chrome Built-in)',
          'Wait 60-120 seconds for rate limit reset',
          'Switch to Offline mode (no AI calls)',
          'Check quota at https://aistudio.google.com/'
        ],
        chromeAIFallback: true,
        autoSuggestChromeAI: true
      },
      403: {
        title: '🔒 API Key Invalid or Expired',
        message: 'Your Gemini API key is invalid, expired, or lacks permissions.',
        action: 'Update API key or switch to Chrome AI',
        recoverySteps: [
          '✅ Switch to Chrome AI (no key required)',
          'Generate new key at https://aistudio.google.com/',
          'Update key in Settings → API Configuration',
          'Verify key permissions (Gemini API enabled)'
        ]
      },
      500: {
        title: '🔧 Gemini API Server Error',
        message: 'Google AI services are experiencing issues.',
        action: 'Switch to Chrome AI or try again in 5 minutes',
        recoverySteps: [
          '✅ Switch to Chrome AI (unaffected by API issues)',
          'Wait 5-10 minutes',
          'Check status.cloud.google.com',
          'Retry extraction'
        ]
      },
      network: {
        title: '🌐 Network Connection Error',
        message: 'No internet connection or request timeout.',
        action: 'Check connection or switch to Chrome AI (offline-capable)',
        recoverySteps: [
          '✅ Switch to Chrome AI (works offline)',
          'Check WiFi/Ethernet connection',
          'Disable VPN if active',
          'Try again'
        ]
      }
    }
  },

  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.0: DEDUPLICATION & STATE MANAGEMENT
  // ════════════════════════════════════════════════════════════════
  DEDUPLICATION: {
    enabled: true,
    
    // Per-tab session state
    sessionManagement: {
      storageKey: 'web_weaver_session_state',
      trackPerTab: true,
      clearOnTabClose: true,
      maxSessionAge: 3600000, // 1 hour
      
      stateSchema: {
        tabId: 'number',
        url: 'string',
        domain: 'string',
        extractedItemKeys: 'array', // Unique keys of extracted items
        extractionCount: 'number',
        lastExtractionTime: 'number',
        totalItemsSeen: 'number'
      }
    },
    
    // Deduplication strategy
    strategy: {
      method: 'COMPOSITE_KEY', // 'COMPOSITE_KEY' | 'CONTENT_HASH' | 'URL_BASED'
      
      compositeKeyFields: [
        'title', // Primary key
        'url',   // Secondary key
        'id'     // Tertiary key (if present)
      ],
      
      matchThreshold: 0.85, // 85% similarity = duplicate
      caseSensitive: false,
      trimWhitespace: true,
      ignoreFields: ['timestamp', 'confidence', 'extractionId']
    },
    
    // User feedback
    ui: {
      showDuplicateCount: true,
      showNewItemCount: true,
      highlightNewItems: true,
      message: '✅ Extracted {new} new items ({duplicate} duplicates removed)'
    }
  },

  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.0: MULTI-SECTION EXTRACTION ENHANCEMENT
  // ════════════════════════════════════════════════════════════════
  MULTI_SECTION_EXTRACTION: {
    enabled: true,
    
    // Detect multiple item groups (not just largest)
    multiGroupDetection: {
      enabled: true,
      maxGroups: 5, // Detect up to 5 distinct item groups
      minItemsPerGroup: 3,
      minSimilarityWithinGroup: 0.75,
      maxSimilarityBetweenGroups: 0.40, // Groups must be <40% similar
      
      groupLabeling: {
        auto: true,
        labelBySection: true, // Use section headings as labels
        fallbackLabels: ['Main Content', 'Sidebar', 'Related', 'Featured', 'Recent']
      }
    },
    
    // AI prompt enhancement for sections
    sectionAwarePrompts: {
      enabled: true,
      instructAIToIdentifySections: true,
      nestedJSONOutput: true,
      
      promptAddition: `
IMPORTANT: If you detect MULTIPLE DISTINCT SECTIONS (e.g., "Featured Products" + "Recently Viewed"), structure your response as:

{
  "sections": [
    {
      "label": "Featured Products",
      "items": [/* array of items */]
    },
    {
      "label": "Recently Viewed",
      "items": [/* array of items */]
    }
  ]
}

If only ONE section, return flat array as before.`
    }
  },

  // ════════════════════════════════════════════════════════════════
  // PRESERVED: Original Configuration (v3.4)
  // ════════════════════════════════════════════════════════════════
  
  API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models',
  GEMINI_MODEL: 'gemini-2.0-flash-lite',
  GEMINI_LITE_MODEL: 'gemini-2.0-flash-lite',

  // 🆕 v3.4: EXTRACTION TYPES (MULTI vs SINGLE_ITEM)
  EXTRACTION_TYPES: {
    MULTI: {
      id: 'MULTI',
      name: 'Extract All Items',
      description: 'Extracts all items currently loaded on the page',
      icon: '📦',
      method: 'DOM_ANALYSIS',
      itemLimit: Infinity,
      naturalPagination: true,
      helpText: 'Extracts all items currently loaded. Scroll or click "Next Page" to load more, then click "Extract Again".',
      supportsAIProvider: {
        CHROME_BUILTIN: true,
        CLOUD_API: true
      }
    },
    
    SINGLE_ITEM: {
      id: 'SINGLE_ITEM',
      name: 'Extract Visible Article',
      description: 'Captures screenshot and extracts the main visible article/item',
      icon: '📄',
      method: 'SCREENSHOT_VISION',
      itemLimit: 1,
      naturalPagination: false,
      helpText: 'Takes a screenshot and extracts the main article/item visible on your screen (ignores sidebars).',
      supportsAIProvider: {
        CHROME_BUILTIN: false, // Chrome AI doesn't support vision yet
        CLOUD_API: true
      },
      fallbackProvider: 'CLOUD_API',
      fallbackMessage: 'Screenshot extraction requires Cloud API (vision support)'
    }
  },

  // Extraction Mode Configurations (PRESERVED FROM v3.4)
  MODES: {
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
      ],
      supportsAIProvider: {
        CHROME_BUILTIN: false,
        CLOUD_API: false
      }
    },

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
      ],
      supportsAIProvider: {
        CHROME_BUILTIN: true,
        CLOUD_API: true
      }
    },

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
      ],
      supportsAIProvider: {
        CHROME_BUILTIN: true,
        CLOUD_API: true
      }
    },

    max: {
      id: 'max',
      name: 'Max Mode',
      description: 'Maximum accuracy with triple verification',
      icon: '🚀',
      pipeline: {
        useDOMAnalysis: true,
        skipAIVerificationThreshold: 0,
        alwaysVerifyAI: true,
        dualExtraction: true,
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
        useCache: false,
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
      ],
      supportsAIProvider: {
        CHROME_BUILTIN: true,
        CLOUD_API: true
      }
    },

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
      },
      supportsAIProvider: {
        CHROME_BUILTIN: true,
        CLOUD_API: true
      }
    }
  },

  // Domain Cache Configuration (PRESERVED)
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

  // AI CLASSIFICATION CONFIGURATION (PRESERVED)
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

  // VISUAL PATTERN DETECTION (PRESERVED)
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

  // UNCERTAINTY DETECTION CONFIG (PRESERVED)
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

  // Confidence Visualization (PRESERVED)
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

  // Analytics & Telemetry (PRESERVED + Privacy enhancements)
  ANALYTICS: {
    enabled: true,
    anonymous: true,
    collectLocalOnly: true,
    trackAPIUsage: false,
    requireUserConsent: true, // 🆕 Opt-in only
    metrics: {
      trackModeUsage: true,
      trackConfidenceDistribution: true,
      trackAPICalls: false,
      trackDomainPerformance: true,
      trackErrors: true,
      trackVisualDetection: true,
      trackUncertaintyFallbacks: true,
      trackAIClassification: true,
      trackExtractionTypes: true,
      trackAIProviderUsage: true, // 🆕 Track Chrome AI vs Cloud API
      trackDeduplication: true // 🆕 Track duplicate removal stats
    },
    reporting: {
      aggregationInterval: 86400000,
      maxHistoryDays: 7
    }
  },

  // UI/UX Settings (PRESERVED)
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
      showExtractionTypeHints: true,
      showAIProviderInfo: true // 🆕 Show Chrome AI vs Cloud info
    },
    notifications: {
      enabled: true,
      showInExtension: true,
      modeSwitch: true,
      confidenceAlerts: true,
      paginationHints: true,
      aiProviderSwitch: true, // 🆕 Notify on AI provider switch
      rateLimitWarnings: true // 🆕 Show proactive warnings
    }
  },

  // Timeouts (PRESERVED)
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
    screenshotCapture: 3000,
    visionAPIRequest: 8000,
    chromeAIRequest: 5000 // 🆕 Chrome AI timeout
  },

  // CSV Export Configuration (PRESERVED)
  CSV_EXPORT: {
    useAIForComplexData: true,
    complexityThreshold: 3,
    maxManualDepth: 2
  },

  // SCREENSHOT EXTRACTION (PRESERVED)
  SCREENSHOT_EXTRACTION: {
    enabled: true,
    format: 'png',
    quality: 0.92,
    captureFullPage: false,
    maxImageSize: 5 * 1024 * 1024,
    visionAPIModel: 'gemini-2.0-flash-lite',
    temperature: 0.1,
    maxOutputTokens: 512,
    requiresCloudAPI: true, // 🆕 Requires Cloud API (vision support)
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
  },

  // 🆕 v4.0: ERROR REPORTING & DIAGNOSTICS
  ERROR_REPORTING: {
    enabled: true,
    collectLocal: true,
    userCanExport: true,
    optInRemoteReporting: false, // Privacy-first
    
    captureDetails: {
      errorType: true,
      errorMessage: true,
      stackTrace: true,
      timestamp: true,
      url: false, // Privacy: don't log URLs
      extractedData: false, // Privacy: don't log data
      systemInfo: {
        chromeVersion: true,
        extensionVersion: true,
        aiProvider: true,
        mode: true
      }
    },
    
    maxLogs: 100,
    retentionDays: 3,
    exportFormat: 'json'
  }
};

// Freeze config (prevent modifications)
Object.freeze(CONFIG);
Object.freeze(CONFIG.AI_PROVIDER);
Object.freeze(CONFIG.SECURITY);
Object.freeze(CONFIG.PRIVACY);
Object.freeze(CONFIG.DEDUPLICATION);
Object.freeze(CONFIG.MULTI_SECTION_EXTRACTION);
Object.freeze(CONFIG.EXTRACTION_TYPES);
Object.freeze(CONFIG.MODES);
Object.freeze(CONFIG.RATE_LIMIT);
Object.freeze(CONFIG.CACHE);
Object.freeze(CONFIG.AI_CLASSIFICATION);
Object.freeze(CONFIG.VISUAL_DETECTION);
Object.freeze(CONFIG.UNCERTAINTY_DETECTION);
Object.freeze(CONFIG.SCREENSHOT_EXTRACTION);
Object.freeze(CONFIG.ERROR_REPORTING);

// Export to global scope
self.CONFIG = CONFIG;
self.WEB_WEAVER_CONFIG = CONFIG;

console.log('[Config] ═══════════════════════════════════════════════');
console.log('[Config] Web Weaver Lightning v4.0 (Day 21) Loaded');
console.log('[Config] ═══════════════════════════════════════════════');
console.log('[Config] 🆕 AI PROVIDER TOGGLE: Chrome Built-in + Cloud API');
console.log('[Config] 🆕 SECURITY: Runtime API keys, validation, expiration warnings');
console.log('[Config] 🆕 PRIVACY: TOS acceptance, opt-in telemetry, local-first');
console.log('[Config] 🆕 RATE WARNINGS: Proactive alerts at 25 RPM, 900K RPD');
console.log('[Config] 🆕 DEDUPLICATION: Session state, composite keys, pagination');
console.log('[Config] 🆕 MULTI-SECTION: Detect 5+ groups, nested JSON output');
console.log('[Config] ═══════════════════════════════════════════════');
console.log('[Config] 5 Modes Available:', Object.keys(CONFIG.MODES));
console.log('[Config] 2 Extraction Types: MULTI, SINGLE_ITEM');
console.log('[Config] 2 AI Providers: Chrome Built-in, Cloud API');
console.log('[Config] ═══════════════════════════════════════════════');
console.log('[Config] ✅ Chrome AI: Fast, free, private, offline');
console.log('[Config] ✅ Cloud API: Advanced, vision, high accuracy');
console.log('[Config] ✅ Auto-fallback: Chrome AI → Cloud API on failure');
console.log('[Config] ✅ Security: No hardcoded keys, runtime-only');
console.log('[Config] ✅ Privacy: TOS required, telemetry opt-in');
console.log('[Config] ═══════════════════════════════════════════════');
