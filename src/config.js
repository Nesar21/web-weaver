/**
 * Web Weaver Lightning - Configuration System
 * Version: 4.1.0 (Day 21.2 - CHROME BUILT-IN AI FULL INTEGRATION)
 * 
 * 🆕 v4.1 CHANGES (DAY 21.2 - CHROME AI FULL INTEGRATION):
 * - Added FALLBACK_BANNER: 24h localStorage cooldown for fallback notifications
 * - Added CATEGORY_FILTERING: Prompt enhancement for category-specific extraction
 * - Added URL_EXTRACTION: Ensure URL field in all schemas
 * - Added ITEM_COUNT_DISPLAY: UI tweak to show item count prominently
 * - Enhanced Chrome AI wrapper integration
 * 
 * ✅ PRESERVED FROM v4.0:
 * - AI_PROVIDER: Toggle between Chrome Built-in AI and Cloud API
 * - SECURITY: API key validation, expiration warnings, runtime-only keys
 * - PRIVACY: TOS acceptance, privacy warnings, opt-in telemetry
 * - RATE_LIMIT_WARNINGS: Soft warnings at 25 RPM and 900K RPD
 * - DEDUPLICATION: State management for pagination workflows
 * - MULTI_SECTION_EXTRACTION: Enhanced DOM pattern detection
 * - EXTRACTION_TYPES: MULTI (all items) and SINGLE_ITEM (screenshot)
 * - All 5 modes (offline, min, balanced, max, auto)
 * 
 * PHILOSOPHY:
 * - Privacy-first: User API keys only, runtime storage, no hardcoded keys
 * - Flexible: Chrome AI (fast/free) OR Cloud API (advanced features)
 * - Transparent: Clear warnings before quota/rate limits hit
 * - Secure: Dynamic permissions, scoped access, no key leakage
 */

const CONFIG = {
  VERSION: '4.1.0-day21.2-chrome-ai-full-integration',

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
  // 🆕 v4.1: FALLBACK BANNER (24h Cooldown)
  // ════════════════════════════════════════════════════════════════
  FALLBACK_BANNER: {
    enabled: true,
    storageKey: 'web_weaver_fallback_banner_state',
    cooldownPeriod: 86400000, // 24 hours in milliseconds
    
    messages: {
      chromeAIUnavailable: {
        title: '⚠️ Chrome Built-in AI Unavailable',
        message: 'Falling back to Cloud API (slower). Get Chrome Dev 128+ for 10× faster extraction.',
        action: 'Download Chrome Dev',
        actionUrl: 'https://www.google.com/chrome/dev/',
        dismissText: 'Got it (hide for 24h)',
        icon: '🔵→☁️',
        severity: 'info'
      },
      
      cloudAPIFallback: {
        title: '✅ Using Cloud API',
        message: 'Chrome AI not available. Extraction will be slower but more accurate.',
        dismissText: 'OK',
        icon: '☁️',
        severity: 'info'
      },
      
      rateLimitFallback: {
        title: '🚨 Rate Limit Hit',
        message: 'Switched to Chrome AI to avoid further rate limiting.',
        dismissText: 'OK',
        icon: '⚠️→🔵',
        severity: 'warning'
      }
    },
    
    // Don't show again logic
    suppressSettings: {
      respectDismissal: true,
      resetOnProviderChange: true, // Reset cooldown if user manually switches provider
      showOncePerSession: false, // Can show multiple times per session if cooldown expired
      maxDismissals: 3 // After 3 dismissals, stop showing forever
    },
    
    // UI positioning
    ui: {
      position: 'top', // 'top' | 'bottom'
      autoDismissAfter: 0, // 0 = manual dismiss only
      showCloseButton: true,
      animateIn: true
    }
  },

  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.1: CATEGORY FILTERING (Prompt Enhancement)
  // ════════════════════════════════════════════════════════════════
  CATEGORY_FILTERING: {
    enabled: true,
    
    // Supported categories
    categories: [
      {
        id: 'all',
        name: 'All Items',
        description: 'Extract all items on the page',
        promptModifier: '',
        icon: '📦'
      },
      {
        id: 'products',
        name: 'Products Only',
        description: 'Extract only product listings',
        promptModifier: 'Focus ONLY on product listings. Ignore articles, reviews, or sidebar content.',
        icon: '🛍️'
      },
      {
        id: 'articles',
        name: 'Articles Only',
        description: 'Extract only article/blog posts',
        promptModifier: 'Focus ONLY on article or blog post listings. Ignore products, ads, or navigation.',
        icon: '📰'
      },
      {
        id: 'videos',
        name: 'Videos Only',
        description: 'Extract only video listings',
        promptModifier: 'Focus ONLY on video listings. Ignore text articles, products, or images.',
        icon: '🎥'
      },
      {
        id: 'jobs',
        name: 'Job Listings',
        description: 'Extract only job postings',
        promptModifier: 'Focus ONLY on job listings. Ignore company info, articles, or ads.',
        icon: '💼'
      },
      {
        id: 'events',
        name: 'Events',
        description: 'Extract only event listings',
        promptModifier: 'Focus ONLY on event listings. Ignore articles, ads, or sidebar content.',
        icon: '📅'
      }
    ],
    
    defaultCategory: 'all',
    storageKey: 'web_weaver_selected_category',
    
    // UI settings
    ui: {
      showInPopup: true,
      position: 'afterExtractionType', // Where to show in popup UI
      showIcon: true,
      showDescription: true
    },
    
    // Prompt injection
    promptIntegration: {
      injectAt: 'beginning', // 'beginning' | 'end' | 'both'
      prefix: '\n\n🎯 CATEGORY FILTER: ',
      suffix: '\n\nStrict filtering is enforced. Return ONLY items matching the category.\n'
    }
  },

  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.1: URL EXTRACTION (Ensure URL Field)
  // ════════════════════════════════════════════════════════════════
  URL_EXTRACTION: {
    enabled: true,
    
    // Ensure URL field is always present
    enforceURLField: true,
    urlFieldName: 'url',
    
    // URL extraction strategies
    strategies: [
      {
        priority: 1,
        method: 'HREF_ATTRIBUTE',
        selector: 'a[href]',
        description: 'Extract href from parent/child anchor tags'
      },
      {
        priority: 2,
        method: 'DATA_ATTRIBUTE',
        selector: '[data-url], [data-href], [data-link]',
        description: 'Extract from data attributes'
      },
      {
        priority: 3,
        method: 'CURRENT_URL',
        description: 'Use current page URL if no item-specific URL found'
      }
    ],
    
    // URL validation
    validation: {
      ensureAbsolute: true, // Convert relative URLs to absolute
      validateFormat: true, // Check URL format validity
      allowFragments: true, // Allow #hash URLs
      allowQueryParams: true // Allow ?query URLs
    },
    
    // Fallback behavior
    fallback: {
      useCurrentURL: true,
      markAsFallback: true, // Add flag: "url_is_fallback": true
      logMissingURLs: true
    },
    
    // Prompt enhancement
    promptAddition: `\n\n**CRITICAL: URL Field Required**\nFor each item, you MUST include a "url" field containing:\n- The item's direct link (from <a> tag href attribute)\n- If no specific URL exists, use the current page URL\n- Ensure URLs are absolute (include http:// or https://)\n\nExample:\n{\n  "title": "Sample Product",\n  "url": "https://example.com/product/123"\n}\n`
  },

  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.1: ITEM COUNT DISPLAY (UI Enhancement)
  // ════════════════════════════════════════════════════════════════
  ITEM_COUNT_DISPLAY: {
    enabled: true,
    
    // Display settings
    display: {
      showInPopup: true,
      showInNotification: true,
      showInExportFilename: true,
      position: 'header', // 'header' | 'footer' | 'inline'
      prominent: true, // Use larger font/bold
      animated: true // Animate count updates
    },
    
    // Count formatting
    formatting: {
      template: '📊 {count} {label}',
      labels: {
        singular: 'item extracted',
        plural: 'items extracted',
        zero: 'No items found'
      },
      showNewVsTotal: true, // "12 new (18 total)"
      templateWithNew: '📊 {new} new ({total} total)',
      highlightNew: true,
      newItemColor: '#10B981',
      totalItemColor: '#6B7280'
    },
    
    // Real-time updates
    realtime: {
      updateOnExtraction: true,
      updateOnDeduplication: true,
      showLoadingState: true,
      loadingText: 'Counting items...'
    },
    
    // Breakdown display
    breakdown: {
      enabled: true,
      showByCategory: true, // If category filtering enabled
      showBySection: true, // If multi-section detection enabled
      template: '{category}: {count} items'
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
  // 🆕 v4.0: RATE LIMIT WARNINGS (Soft Warnings, Not Hard Blocks)
  // ════════════════════════════════════════════════════════════════
  RATE_LIMIT_WARNINGS: {
    enabled: true,
    
    // Gemini API Rate Limits (as of 2024)
    limits: {
      requestsPerMinute: 15,
      requestsPerDay: 1500,
      tokensPerDay: 1000000
    },

    // Soft warning thresholds (never block, just warn)
    thresholds: {
      rpm: {
        warning: 10, // Warn at 10 RPM (67% of limit)
        critical: 13 // Critical warning at 13 RPM (87% of limit)
      },
      rpd: {
        warning: 900000, // Warn at 900K tokens/day (90% of limit)
        critical: 950000 // Critical at 950K (95% of limit)
      }
    },

    // Warning messages
    messages: {
      rpmWarning: {
        title: '⚠️ High API Usage Detected',
        message: 'You\'ve made {current} API calls in the last minute (limit: {limit} RPM). Consider switching to Chrome Built-in AI (zero cost, no limits).',
        actions: [
          { label: 'Switch to Chrome AI', action: 'switchToChromeAI' },
          { label: 'Slow Down', action: 'dismiss' }
        ]
      },
      rpdWarning: {
        title: '⚠️ Daily Token Limit Approaching',
        message: 'You\'ve used ~{percentage}% of your daily token quota. Remaining: ~{remaining} tokens.',
        actions: [
          { label: 'Switch to Chrome AI', action: 'switchToChromeAI' },
          { label: 'Continue Carefully', action: 'dismiss' }
        ]
      }
    },

    // Behavior
    behavior: {
      showWarningOnce: false, // Can show multiple times
      autoSwitchToChromeAI: false, // Never auto-switch, always prompt
      trackUsageInStorage: true,
      resetCounterDaily: true,
      resetCounterOnKeyChange: true
    }
  },

  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.0: DEDUPLICATION (Pagination Workflow)
  // ════════════════════════════════════════════════════════════════
  DEDUPLICATION: {
    enabled: true,
    storageKey: 'web_weaver_dedup_cache',

    // Deduplication strategy
    strategy: {
      method: 'HASH', // 'HASH' | 'TITLE' | 'URL' | 'COMPOSITE'
      hashFields: ['title', 'url'], // Fields to hash for uniqueness
      caseSensitive: false,
      trimWhitespace: true,
      ignoreEmptyFields: true
    },

    // Session management
    session: {
      persistAcrossPages: true, // Track across pagination
      resetOnNewDomain: true,
      resetOnManualClear: true,
      maxSessionDuration: 3600000, // 1 hour
      autoResetOnTimeout: true
    },

    // Cache settings
    cache: {
      maxItems: 10000, // Max unique items to track
      pruneOldest: true, // Remove oldest when limit hit
      compressionEnabled: true
    },

    // UI feedback
    ui: {
      showDuplicateCount: true,
      showNewVsTotal: true, // "12 new (18 total)"
      highlightNewItems: true,
      markDuplicates: false // Don't show duplicates in export
    }
  },

  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.0: MULTI-SECTION EXTRACTION (Enhanced DOM Detection)
  // ════════════════════════════════════════════════════════════════
  MULTI_SECTION_EXTRACTION: {
    enabled: true,

    // Section detection heuristics
    detection: {
      minSectionsToTrigger: 2,
      sectionIndicators: [
        'section', 'article', 'aside', 'main', 
        '[role="region"]', '[role="article"]',
        '.section', '.category', '.group'
      ],
      minItemsPerSection: 3,
      maxSections: 5
    },

    // Section labeling
    labeling: {
      autoLabel: true,
      labelStrategies: [
        'HEADING', // Use nearest <h1>-<h6>
        'ARIA_LABEL', // Use aria-label attribute
        'CLASS_NAME', // Derive from class
        'POSITION' // "Section 1", "Section 2"
      ],
      defaultPrefix: 'Section'
    },

    // Output formatting
    output: {
      groupBySections: true, // { "section1": [...], "section2": [...] }
      includeMetadata: true, // section name, item count
      flattenOnExport: false // Keep sections separate in JSON
    }
  },

  // ════════════════════════════════════════════════════════════════
  // EXTRACTION TYPES (MULTI vs SINGLE_ITEM)
  // ════════════════════════════════════════════════════════════════
  EXTRACTION_TYPES: {
    MULTI: {
      id: 'MULTI',
      name: 'Multiple Items',
      description: 'Extract all items on the current page view',
      icon: '📦',
      useCases: [
        'Product listings (Amazon, eBay)',
        'Search results (Google, Bing)',
        'Article feeds (Medium, Reddit)',
        'Social media posts (Twitter, LinkedIn)',
        'Job boards (Indeed, LinkedIn Jobs)',
        'Event listings (Eventbrite, Meetup)'
      ],
      behavior: {
        captureScreenshot: false,
        useVisionAPI: false,
        paginationAware: true,
        deduplicationEnabled: true,
        batchProcessing: true
      },
      prompt: 'Extract ALL items visible on the page. Return a JSON array.'
    },

    SINGLE_ITEM: {
      id: 'SINGLE_ITEM',
      name: 'Single Item (Screenshot)',
      description: 'Extract one item using screenshot + Vision API',
      icon: '📸',
      useCases: [
        'Product detail pages (full specs, reviews)',
        'Article pages (full text, images)',
        'Profile pages (bio, stats)',
        'Complex layouts (charts, tables)',
        'Dynamic content (JavaScript-rendered)'
      ],
      behavior: {
        captureScreenshot: true,
        useVisionAPI: true,
        paginationAware: false,
        deduplicationEnabled: false,
        batchProcessing: false
      },
      prompt: 'Extract the main item from this screenshot. Return a single JSON object.'
    }
  },

  // Default extraction type
  DEFAULT_EXTRACTION_TYPE: 'MULTI',

  // ════════════════════════════════════════════════════════════════
  // EXTRACTION MODES (5 Modes)
  // ════════════════════════════════════════════════════════════════
  MODES: {
    offline: {
      name: 'Offline',
      description: 'No AI, pure DOM parsing (instant, no API)',
      requiresAPI: false,
      speed: 'instant',
      accuracy: 'low',
      cost: 'free',
      icon: '⚡',
      tooltip: 'Fastest mode. No AI, uses HTML structure only.'
    },
    min: {
      name: 'Minimal',
      description: 'Light AI assist (1 API call, ~200 tokens)',
      requiresAPI: true,
      speed: 'fast',
      accuracy: 'medium',
      cost: 'very low',
      icon: '🔵',
      tooltip: 'Quick AI validation. Good for simple pages.'
    },
    balanced: {
      name: 'Balanced',
      description: 'Moderate AI depth (1-2 calls, ~500 tokens)',
      requiresAPI: true,
      speed: 'moderate',
      accuracy: 'high',
      cost: 'low',
      icon: '⚖️',
      tooltip: 'Best balance of speed and accuracy.'
    },
    max: {
      name: 'Maximum',
      description: 'Deep AI analysis (2-3 calls, ~1000 tokens)',
      requiresAPI: true,
      speed: 'slow',
      accuracy: 'highest',
      cost: 'moderate',
      icon: '🎯',
      tooltip: 'Most accurate. Use for complex/critical extractions.'
    },
    auto: {
      name: 'Smart Auto',
      description: 'AI chooses best mode based on page complexity',
      requiresAPI: true,
      speed: 'adaptive',
      accuracy: 'adaptive',
      cost: 'optimized',
      icon: '🤖',
      tooltip: 'Automatic mode selection. Recommended for most users.'
    }
  },

  DEFAULT_MODE: 'auto',

  // ════════════════════════════════════════════════════════════════
  // API CONFIGURATION (Cloud API)
  // ════════════════════════════════════════════════════════════════
  API: {
    BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
    MODEL: 'gemini-2.0-flash-lite',
    VISION_MODEL: 'gemini-2.0-flash-lite',
    
    ENDPOINTS: {
      TEXT: '/gemini-2.0-flash-lite:generateContent',
      VISION: '/gemini-2.0-flash-lite:generateContent',
      MODELS: '?key='
    },

    REQUEST_CONFIG: {
      temperature: 0.1,
      topK: 3,
      topP: 0.95,
      maxOutputTokens: 8192,
      timeout: 30000, // 30s timeout
      retries: 2,
      retryDelay: 1000
    },

    RATE_LIMITS: {
      requestsPerMinute: 15,
      requestsPerDay: 1500,
      tokensPerMinute: 32000,
      tokensPerDay: 1000000
    },

    ERROR_CODES: {
      400: 'Invalid request format',
      401: 'Invalid API key',
      403: 'API key lacks required permissions',
      404: 'Model not found',
      429: 'Rate limit exceeded',
      500: 'Internal server error',
      503: 'Service temporarily unavailable'
    }
  },

  // ════════════════════════════════════════════════════════════════
  // CLASSIFICATION (3-Tier System)
  // ════════════════════════════════════════════════════════════════
  CLASSIFICATION: {
    enabled: true,
    tiers: ['DOM', 'VISUAL', 'AI'],
    
    confidence_thresholds: {
      DOM: 0.7,
      VISUAL: 0.6,
      AI: 0.5
    },

    strategies: {
      DOM: {
        patterns: [
          { type: 'product', selectors: ['.product', '[data-product]', '.item-card'] },
          { type: 'article', selectors: ['article', '.post', '.story'] },
          { type: 'search', selectors: ['.search-result', '.result-item'] }
        ]
      },
      VISUAL: {
        enabled: true,
        indicators: ['images', 'prices', 'ratings', 'buttons']
      },
      AI: {
        enabled: true,
        fallbackOnly: false
      }
    }
  },

  // ════════════════════════════════════════════════════════════════
  // PROMPT CONFIGURATION
  // ════════════════════════════════════════════════════════════════
  PROMPTS: {
    version: 'v10',
    promptFile: 'prompts/prompt_v10_universal.txt',
    fallbackFile: 'prompts/prompt_v8_fallback.txt',
    screenshotFile: 'prompts/prompt_v11_screenshot.txt',
    
    // Dynamic prompt modifications
    modifications: {
      injectCategory: true, // Add category filter from CATEGORY_FILTERING
      injectURLRequirement: true, // Add URL requirement from URL_EXTRACTION
      injectPageContext: true, // Add page URL, title, domain
      injectExtractionType: true // Add MULTI/SINGLE_ITEM context
    }
  },

  // ════════════════════════════════════════════════════════════════
  // CACHE CONFIGURATION
  // ════════════════════════════════════════════════════════════════
  CACHE: {
    enabled: true,
    ttl: 3600000, // 1 hour
    maxSize: 100, // Max cached extractions
    storageKey: 'web_weaver_cache',
    
    strategy: {
      keyGeneration: 'URL_HASH', // Hash URL + mode + extraction type
      invalidateOnModeChange: true,
      invalidateOnProviderChange: true,
      compressionEnabled: true
    }
  },

  // ════════════════════════════════════════════════════════════════
  // SCREENSHOT CONFIGURATION
  // ════════════════════════════════════════════════════════════════
  SCREENSHOT: {
    enabled: true,
    format: 'png',
    quality: 80,
    maxWidth: 1280,
    maxHeight: 10000,
    captureViewport: false, // Capture visible area only
    captureFullPage: false, // Don't capture beyond viewport
    
    vision: {
      enabled: true,
      useWhenDOMFails: true,
      maxImageSize: 4194304, // 4MB
      compressionQuality: 0.8
    }
  },

  // ════════════════════════════════════════════════════════════════
  // ANALYTICS & TELEMETRY
  // ════════════════════════════════════════════════════════════════
  ANALYTICS: {
    enabled: true,
    optInRequired: true, // User must opt-in
    storageKey: 'web_weaver_analytics',
    
    trackEvents: [
      'extraction_started',
      'extraction_success',
      'extraction_failed',
      'mode_changed',
      'provider_switched',
      'api_error',
      'fallback_triggered'
    ],
    
    metrics: {
      successRate: true,
      averageLatency: true,
      confidenceScores: true,
      errorTypes: true,
      modeUsage: true,
      providerUsage: true
    },
    
    privacy: {
      anonymized: true,
      noPersonalData: true,
      localStorageOnly: true,
      exportable: true
    }
  },

  // ════════════════════════════════════════════════════════════════
  // ERROR HANDLING
  // ════════════════════════════════════════════════════════════════
  ERROR_HANDLING: {
    retryAttempts: 2,
    retryDelay: 1000,
    exponentialBackoff: true,
    
    fallbackChain: [
      'RETRY_SAME_PROVIDER',
      'SWITCH_TO_FALLBACK_PROVIDER',
      'USE_CACHE',
      'DEGRADE_TO_OFFLINE_MODE'
    ],
    
    userNotification: {
      showOnError: true,
      showRecoverySteps: true,
      allowManualRetry: true,
      showFallbackSuggestions: true
    }
  },

  // ════════════════════════════════════════════════════════════════
  // UI CONFIGURATION
  // ════════════════════════════════════════════════════════════════
  UI: {
    theme: 'auto', // 'light' | 'dark' | 'auto'
    animations: true,
    compactMode: false,
    
    popup: {
      width: 400,
      minHeight: 500,
      maxHeight: 700
    },
    
    notifications: {
      position: 'top-right',
      duration: 5000,
      autoClose: true
    },
    
    resultDisplay: {
      defaultView: 'json', // 'json' | 'table' | 'cards'
      prettyPrint: true,
      showMetadata: true,
      highlightNew: true
    }
  },

  // ════════════════════════════════════════════════════════════════
  // EXPORT CONFIGURATION
  // ════════════════════════════════════════════════════════════════
  EXPORT: {
    formats: ['json', 'csv', 'xlsx'],
    defaultFormat: 'json',
    
    filename: {
      template: 'web-weaver_{domain}_{timestamp}_{count}items',
      includeTimestamp: true,
      includeDomain: true,
      includeCount: true
    },
    
    json: {
      prettyPrint: true,
      indent: 2,
      includeMetadata: true
    },
    
    csv: {
      delimiter: ',',
      includeHeaders: true,
      flattenNested: true,
      escapeQuotes: true
    }
  },

  // ════════════════════════════════════════════════════════════════
  // DEBUG & DEVELOPMENT
  // ════════════════════════════════════════════════════════════════
  DEBUG: {
    enabled: false, // Set to true for development
    verboseLogging: false,
    logAPIRequests: false,
    logAPIResponses: false,
    showTimings: false,
    
    devTools: {
      exposeGlobals: false, // Expose CONFIG, CHROME_AI to window
      allowManualOverrides: false
    }
  },

  // ════════════════════════════════════════════════════════════════
  // FEATURE FLAGS (Experimental Features)
  // ════════════════════════════════════════════════════════════════
  FEATURE_FLAGS: {
    chromeAI: true, // Enable Chrome Built-in AI
    categoryFiltering: true, // Enable category filtering
    urlExtraction: true, // Enforce URL field
    itemCountDisplay: true, // Show item count prominently
    multiSectionExtraction: true,
    deduplication: true,
    fallbackBanner: true, // 24h cooldown banner
    smartAutoMode: true,
    screenshotExtraction: true,
    visionAPI: true,
    caching: true,
    analytics: true
  }
};

// ════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════

CONFIG.getMode = function(modeId) {
  return this.MODES[modeId] || this.MODES[this.DEFAULT_MODE];
};

CONFIG.getExtractionType = function(typeId) {
  return this.EXTRACTION_TYPES[typeId] || this.EXTRACTION_TYPES[this.DEFAULT_EXTRACTION_TYPE];
};

CONFIG.getProvider = function(providerId) {
  return this.AI_PROVIDER.providers[providerId] || this.AI_PROVIDER.providers[this.AI_PROVIDER.default];
};

CONFIG.getCategory = function(categoryId) {
  return this.CATEGORY_FILTERING.categories.find(c => c.id === categoryId) || 
         this.CATEGORY_FILTERING.categories.find(c => c.id === this.CATEGORY_FILTERING.defaultCategory);
};

CONFIG.shouldShowFallbackBanner = async function() {
  if (!this.FEATURE_FLAGS.fallbackBanner) return false;
  
  const state = await chrome.storage.local.get(this.FALLBACK_BANNER.storageKey);
  const bannerState = state[this.FALLBACK_BANNER.storageKey];
  
  if (!bannerState) return true; // First time
  
  const now = Date.now();
  const cooldownExpired = (now - bannerState.lastDismissed) > this.FALLBACK_BANNER.cooldownPeriod;
  const underDismissalLimit = bannerState.dismissCount < this.FALLBACK_BANNER.suppressSettings.maxDismissals;
  
  return cooldownExpired && underDismissalLimit;
};

CONFIG.dismissFallbackBanner = async function() {
  const state = await chrome.storage.local.get(this.FALLBACK_BANNER.storageKey);
  const bannerState = state[this.FALLBACK_BANNER.storageKey] || { dismissCount: 0 };
  
  bannerState.lastDismissed = Date.now();
  bannerState.dismissCount += 1;
  
  await chrome.storage.local.set({
    [this.FALLBACK_BANNER.storageKey]: bannerState
  });
};

// ════════════════════════════════════════════════════════════════
// EXPORT CONFIG
// ════════════════════════════════════════════════════════════════

if (typeof self !== 'undefined') {
  self.CONFIG = CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

console.log(`[Config] ✅ Web Weaver Lightning v${CONFIG.VERSION} configuration loaded`);
console.log('[Config] 🔵 Chrome Built-in AI integration enabled');
console.log('[Config] ☁️ Cloud API fallback available');
console.log('[Config] 🎯 Category filtering enabled');
console.log('[Config] 🔗 URL extraction enforced');
console.log('[Config] 📊 Item count display enabled');
console.log('[Config] 🔔 Fallback banner with 24h cooldown enabled');
