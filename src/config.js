/**
 * Web Weaver Lightning - Configuration System
 * Version: 4.2.0 (v4.2 - VISUAL AI + MULTIMODAL + BATCH ENHANCEMENTS)
 * 
 * 🆕 v4.2 CHANGES (FULL v4.2 IMPLEMENTATION):
 * - TRANSLATION: Batch translation with Chrome AI Translator + Cloud API fallback
 * - SUMMARIZATION: Batch summarization with Chrome AI Summarizer + Cloud API fallback
 * - LANGUAGE_DETECTOR: Auto-detect page language with Chrome AI LanguageDetector
 * - DEDUPLICATION: Now OPTIONAL (checkbox in UI, off by default)
 * - TEMPLATES: Extraction templates for common sites (Amazon, LinkedIn, Medium, etc.)
 * - INSIGHTS: AI-powered insights generation from extracted data
 * - COST_TRACKER: Real-time API cost calculation and display
 * - SMART_DEFAULTS: Context-aware mode/category selection
 * - ACCESSIBILITY: Alt-text generation for images
 * - MULTIMODAL: Image analysis and audio transcription
 * - PRIVACY_BADGES: Visual privacy indicators in UI
 * - CHANGE_DETECTION: Track changes across pagination/re-extraction
 * - VISUAL_AI_REBRAND: Rebrand to "Visual AI" for marketing impact
 * 
 * ✅ PRESERVED FROM v4.1:
 * - AI_PROVIDER: Chrome Built-in AI vs Cloud API toggle
 * - FALLBACK_BANNER: 24h cooldown notifications
 * - CATEGORY_FILTERING: 6 predefined categories
 * - URL_EXTRACTION: Enforced URL field in all schemas
 * - ITEM_COUNT_DISPLAY: Prominent item count with new vs total
 * - SECURITY: API key validation, runtime-only storage
 * - PRIVACY: TOS acceptance, opt-in telemetry
 * - RATE_LIMIT_WARNINGS: Soft warnings at 25 RPM / 900K RPD
 * - MULTI_SECTION_EXTRACTION: Detect and label distinct sections
 * - EXTRACTION_TYPES: MULTI and SINGLE_ITEM modes
 * - All 5 extraction modes (offline, min, balanced, max, auto)
 * 
 * PHILOSOPHY:
 * - Privacy-first: Local processing, user API keys only
 * - Flexible: Chrome AI (fast/free) OR Cloud API (advanced)
 * - Transparent: Clear warnings, cost tracking, change detection
 * - Accessible: Alt-text, audio transcription, multimodal support
 * - User-centric: Templates, smart defaults, insights
 */


const CONFIG = {
  VERSION: '4.2.0-visual-ai-multimodal-batch',


  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.2: VISUAL AI REBRAND
  // ════════════════════════════════════════════════════════════════
  BRANDING: {
    enabled: true,
    productName: 'Web Weaver Lightning',
    tagline: 'Privacy-First Visual AI Extraction',
    marketingPositioning: {
      primary: 'Visual AI',
      secondary: 'Multimodal Web Intelligence',
      keywords: [
        'Visual AI',
        'Privacy-First',
        'Multimodal',
        'Accessibility',
        'On-Device AI',
        'Zero-Cost Extraction'
      ]
    },
    
    // UI elements
    ui: {
      showVisualAIBadge: true,
      showPrivacyBadge: true,
      badgePosition: 'header', // 'header' | 'footer'
      animateBadges: true
    }
  },


  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.2: TRANSLATION (Batch Processing)
  // ════════════════════════════════════════════════════════════════
  TRANSLATION: {
    enabled: true,
    optional: true, // User checkbox (off by default)
    storageKey: 'web_weaver_translation_enabled',
    
    // Chrome AI Translator
    chromeAI: {
      enabled: true,
      priority: 1, // Try Chrome AI first
      api: 'translation.Translator',
      availability: {
        checkMethod: 'translation?.Translator?.capabilities',
        fallbackToCloud: true
      },
      
      // Batch processing
      batch: {
        enabled: true,
        maxItemsPerBatch: 20, // Translate 20 items at once
        batchFields: ['title', 'description'], // Fields to translate
        parallelBatches: false, // Sequential for stability
        retryFailedItems: true
      },
      
      // Performance
      performance: {
        avgLatency: 50, // ms per item
        maxConcurrentTranslations: 5,
        cacheTranslations: true,
        cacheTTL: 3600000 // 1 hour
      }
    },
    
    // Cloud API Fallback
    cloudAPI: {
      enabled: true,
      priority: 2,
      model: 'gemini-2.0-flash-lite',
      endpoint: '/gemini-2.0-flash-lite:generateContent',
      
      // Batch processing
      batch: {
        enabled: true,
        maxItemsPerBatch: 10, // Smaller batches for API quota
        batchFields: ['title', 'description'],
        groupByLanguage: true, // Separate batches per target language
        costPerBatch: 0.01 // Estimated cost per batch
      },
      
      // Prompt template
      promptTemplate: `Translate the following items to {targetLanguage}. Return ONLY a JSON array with the same structure, adding "_translated" suffix to translated fields.

Input: {items}

Output format:
[
  {
    "title": "original",
    "title_translated": "translated",
    "description": "original",
    "description_translated": "translated"
  }
]`
    },
    
    // Language detection
    languageDetection: {
      autoDetect: true,
      useLanguageDetector: true, // Chrome AI LanguageDetector
      fallbackToNavigatorLanguage: true,
      storageKey: 'web_weaver_detected_language'
    },
    
    // Target languages
    targetLanguages: {
      default: 'auto', // Auto-detect from browser
      supported: [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'es', name: 'Spanish', flag: '🇪🇸' },
        { code: 'fr', name: 'French', flag: '🇫🇷' },
        { code: 'de', name: 'German', flag: '🇩🇪' },
        { code: 'it', name: 'Italian', flag: '🇮🇹' },
        { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
        { code: 'ru', name: 'Russian', flag: '🇷🇺' },
        { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
        { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
        { code: 'ko', name: 'Korean', flag: '🇰🇷' },
        { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
        { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
      ]
    },
    
    // UI settings
    ui: {
      showCheckbox: true,
      defaultEnabled: false,
      showLanguageSelector: true,
      showProgressBar: true,
      progressTemplate: 'Translating... {current}/{total}',
      showCostEstimate: true
    },
    
    // Output
    output: {
      addTranslatedFields: true, // Add "title_translated", "description_translated"
      keepOriginal: true, // Keep original fields
      addLanguageMetadata: true, // Add "source_language", "target_language"
      flagInFilename: true // Add language code to export filename
    }
  },


  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.2: SUMMARIZATION (Batch Processing)
  // ════════════════════════════════════════════════════════════════
  SUMMARIZATION: {
    enabled: true,
    optional: true, // User checkbox (off by default)
    storageKey: 'web_weaver_summarization_enabled',
    
    // Chrome AI Summarizer
    chromeAI: {
      enabled: true,
      priority: 1,
      api: 'ai.Summarizer',
      availability: {
        checkMethod: 'ai?.Summarizer?.capabilities',
        fallbackToCloud: true
      },
      
      // Batch processing
      batch: {
        enabled: true,
        maxItemsPerBatch: 5, // Group 5 items per batch
        groupLongTexts: true, // Group items with >500 chars
        skipShortTexts: true, // Skip items <100 chars
        retryFailedItems: true
      },
      
      // Summarization options
      options: {
        type: 'tl;dr', // 'tl;dr' | 'key-points' | 'teaser' | 'headline'
        format: 'plain-text', // 'plain-text' | 'markdown'
        length: 'short', // 'short' | 'medium' | 'long'
        sharedContext: '', // Optional context for all summaries
        temperature: 0.3,
        topK: 3
      },
      
      // Performance
      performance: {
        avgLatency: 100, // ms per item
        maxConcurrentSummarizations: 3,
        cacheSummaries: true,
        cacheTTL: 3600000 // 1 hour
      }
    },
    
    // Cloud API Fallback
    cloudAPI: {
      enabled: true,
      priority: 2,
      model: 'gemini-2.0-flash-lite',
      endpoint: '/gemini-2.0-flash-lite:generateContent',
      
      // Batch processing
      batch: {
        enabled: true,
        maxItemsPerBatch: 5,
        costPerBatch: 0.02 // Estimated cost
      },
      
      // Prompt template
      promptTemplate: `Summarize each item below in 1-2 concise sentences. Return ONLY a JSON array with summaries.

Items: {items}

Output format:
[
  {
    "title": "original title",
    "summary": "concise 1-2 sentence summary"
  }
]`
    },
    
    // Target fields
    targetFields: {
      primary: 'description', // Main field to summarize
      fallback: ['main_content', 'content', 'text'], // Try these if description missing
      outputField: 'summary' // Add "summary" field to output
    },
    
    // UI settings
    ui: {
      showCheckbox: true,
      defaultEnabled: false,
      showProgressBar: true,
      progressTemplate: 'Summarizing... {current}/{total}',
      showCostEstimate: true
    },
    
    // Output
    output: {
      addSummaryField: true,
      keepOriginal: true,
      maxSummaryLength: 200, // chars
      addMetadata: true // Add "summarization_method", "summary_length"
    }
  },


  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.2: LANGUAGE DETECTOR (Chrome AI)
  // ════════════════════════════════════════════════════════════════
  LANGUAGE_DETECTOR: {
    enabled: true,
    
    // Chrome AI LanguageDetector
    chromeAI: {
      enabled: true,
      api: 'translation.LanguageDetector',
      availability: {
        checkMethod: 'translation?.LanguageDetector?.capabilities',
        fallbackToNavigator: true
      },
      
      // Detection options
      options: {
        autoDetect: true, // Auto-detect on page load
        detectOnExtraction: true, // Detect during extraction
        cacheDetection: true,
        cacheTTL: 3600000 // 1 hour per page
      },
      
      // Performance
      performance: {
        avgLatency: 10, // ms
        minConfidence: 0.7, // Minimum confidence to trust detection
        fallbackToNavigator: true // Use navigator.language if low confidence
      }
    },
    
    // UI display
    ui: {
      showLanguageFlag: true,
      showLanguageName: true,
      showConfidence: false, // Only show in debug mode
      position: 'header', // 'header' | 'footer' | 'inline'
      flagTemplate: '{flag} {name}'
    },
    
    // Auto-translation trigger
    autoTranslation: {
      enabled: true,
      translateIfDifferent: true, // Auto-translate if page language ≠ user language
      promptUser: true, // Ask before auto-translating
      rememberChoice: true
    },
    
    // Storage
    storageKey: 'web_weaver_language_detections',
    perPageCache: true
  },


  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.2: DEDUPLICATION (NOW OPTIONAL)
  // ════════════════════════════════════════════════════════════════
  DEDUPLICATION: {
    enabled: true,
    optional: true, // 🆕 NOW OPTIONAL (user checkbox)
    defaultEnabled: false, // 🆕 OFF BY DEFAULT
    storageKey: 'web_weaver_deduplication_enabled',
    cacheKey: 'web_weaver_dedup_cache',


    // Deduplication strategy (PRESERVED FROM v4.1)
    strategy: {
      method: 'HASH', // 'HASH' | 'TITLE' | 'URL' | 'COMPOSITE'
      hashFields: ['title', 'url'],
      caseSensitive: false,
      trimWhitespace: true,
      ignoreEmptyFields: true
    },


    // Session management (PRESERVED FROM v4.1)
    session: {
      persistAcrossPages: true,
      resetOnNewDomain: true,
      resetOnManualClear: true,
      maxSessionDuration: 3600000, // 1 hour
      autoResetOnTimeout: true
    },


    // Cache settings (PRESERVED FROM v4.1)
    cache: {
      maxItems: 10000,
      pruneOldest: true,
      compressionEnabled: true
    },


    // UI feedback (ENHANCED FOR v4.2)
    ui: {
      showCheckbox: true, // 🆕 Show checkbox in UI
      defaultChecked: false, // 🆕 Unchecked by default
      showDuplicateCount: true,
      showNewVsTotal: true, // "12 new (18 total)"
      highlightNewItems: true,
      markDuplicates: false,
      tooltipText: 'Skip duplicate items across pagination' // 🆕 Tooltip
    }
  },


  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.2: EXTRACTION TEMPLATES (Quick Presets)
  // ════════════════════════════════════════════════════════════════
  TEMPLATES: {
    enabled: true,
    storageKey: 'web_weaver_templates',
    
    // Built-in templates
    builtIn: [
      {
        id: 'amazon_products',
        name: 'Amazon Products',
        description: 'Extract product listings from Amazon',
        icon: '🛒',
        domains: ['amazon.com', 'amazon.co.uk', 'amazon.de'],
        settings: {
          category: 'products',
          mode: 'balanced',
          extractionType: 'MULTI',
          translation: false,
          summarization: false,
          deduplication: true
        },
        schema: 'product'
      },
      {
        id: 'linkedin_posts',
        name: 'LinkedIn Posts',
        description: 'Extract posts from LinkedIn feed',
        icon: '💼',
        domains: ['linkedin.com'],
        settings: {
          category: 'articles',
          mode: 'min',
          extractionType: 'MULTI',
          translation: true,
          summarization: true,
          deduplication: true
        },
        schema: 'article'
      },
      {
        id: 'medium_articles',
        name: 'Medium Articles',
        description: 'Extract article listings from Medium',
        icon: '📰',
        domains: ['medium.com'],
        settings: {
          category: 'articles',
          mode: 'balanced',
          extractionType: 'MULTI',
          translation: true,
          summarization: true,
          deduplication: false
        },
        schema: 'article'
      },
      {
        id: 'youtube_videos',
        name: 'YouTube Videos',
        description: 'Extract video listings from YouTube',
        icon: '🎥',
        domains: ['youtube.com'],
        settings: {
          category: 'videos',
          mode: 'balanced',
          extractionType: 'MULTI',
          translation: false,
          summarization: false,
          deduplication: true
        },
        schema: 'video'
      },
      {
        id: 'indeed_jobs',
        name: 'Indeed Jobs',
        description: 'Extract job listings from Indeed',
        icon: '💼',
        domains: ['indeed.com'],
        settings: {
          category: 'jobs',
          mode: 'balanced',
          extractionType: 'MULTI',
          translation: false,
          summarization: true,
          deduplication: true
        },
        schema: 'job'
      },
      {
        id: 'custom',
        name: 'Custom',
        description: 'Manual configuration',
        icon: '🔧',
        domains: [],
        settings: {
          category: 'all',
          mode: 'auto',
          extractionType: 'MULTI',
          translation: false,
          summarization: false,
          deduplication: false
        },
        schema: 'universal'
      }
    ],
    
    // User custom templates
    userTemplates: {
      enabled: true,
      maxCustomTemplates: 20,
      storageKey: 'web_weaver_user_templates',
      allowImportExport: true
    },
    
    // Auto-detection
    autoDetection: {
      enabled: true,
      detectByDomain: true,
      detectByPageStructure: false, // Future enhancement
      promptUserOnDetection: true,
      rememberChoice: true
    },
    
    // UI
    ui: {
      showTemplateSelector: true,
      position: 'top', // 'top' | 'bottom'
      showIcon: true,
      showDescription: true,
      allowQuickSwitch: true
    }
  },


  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.2: AI INSIGHTS GENERATION
  // ════════════════════════════════════════════════════════════════
  INSIGHTS: {
    enabled: true,
    optional: true, // Generate after extraction (user can view)
    storageKey: 'web_weaver_insights',
    
    // Chrome AI LanguageModel
    chromeAI: {
      enabled: true,
      priority: 1,
      api: 'ai.languageModel',
      
      // Insight types
      types: [
        {
          id: 'summary',
          name: 'Data Summary',
          description: 'Overview of extracted items',
          prompt: 'Analyze these {count} items and provide a brief summary of key patterns, trends, or insights.'
        },
        {
          id: 'comparison',
          name: 'Comparison',
          description: 'Compare items (prices, features, etc.)',
          prompt: 'Compare these {count} items. Highlight similarities, differences, best value, and outliers.'
        },
        {
          id: 'recommendations',
          name: 'Recommendations',
          description: 'AI-powered recommendations',
          prompt: 'Based on these {count} items, provide 3 actionable recommendations for the user.'
        },
        {
          id: 'anomalies',
          name: 'Anomaly Detection',
          description: 'Find unusual items',
          prompt: 'Identify any unusual or anomalous items in this dataset of {count} items. Explain why they stand out.'
        }
      ],
      
      // Generation settings
      generation: {
        autoGenerate: false, // Only generate on user request
        maxInputItems: 50, // Don't overwhelm the model
        maxOutputTokens: 500,
        temperature: 0.7,
        topK: 5
      }
    },
    
    // Cloud API Fallback
    cloudAPI: {
      enabled: true,
      priority: 2,
      model: 'gemini-2.0-flash-lite',
      costPerInsight: 0.01
    },
    
    // UI
    ui: {
      showInsightsTab: true, // New tab in results UI
      showInExport: false, // Don't include in CSV/JSON export
      allowRegenerate: true,
      showLoadingState: true
    }
  },


  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.2: COST TRACKER (Real-Time API Cost Calculation)
  // ════════════════════════════════════════════════════════════════
  COST_TRACKER: {
    enabled: true,
    storageKey: 'web_weaver_cost_tracking',
    
    // Pricing (Gemini API as of 2024)
    pricing: {
      extraction: {
        perCall: 0.01,
        perToken: 0.000001 // $0.001 per 1K tokens
      },
      translation: {
        perBatch: 0.01,
        perItem: 0.0005
      },
      summarization: {
        perBatch: 0.02,
        perItem: 0.004
      },
      vision: {
        perCall: 0.05,
        perImage: 0.01
      }
    },
    
    // Tracking
    tracking: {
      trackPerExtraction: true,
      trackDaily: true,
      trackMonthly: true,
      resetDaily: true,
      resetMonthly: true
    },
    
    // UI display
    ui: {
      showInPopup: true,
      showInResults: true,
      position: 'footer', // 'header' | 'footer' | 'inline'
      format: 'This extraction: ~${cost} | Today: ${dailyTotal}',
      showBreakdown: true, // Show extraction vs translation vs summarization costs
      highlightHighCost: true, // Warn if extraction >$0.10
      costThreshold: 0.10
    },
    
    // Budget warnings
    budgetWarnings: {
      enabled: true,
      dailyBudget: 1.00, // $1/day default
      monthlyBudget: 15.00, // $15/month default
      warnAt: 0.8, // Warn at 80% of budget
      blockAt: 1.0, // Block at 100% (optional, off by default)
      userConfigurable: true
    }
  },


  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.2: SMART DEFAULTS (Context-Aware Settings)
  // ════════════════════════════════════════════════════════════════
  SMART_DEFAULTS: {
    enabled: true,
    
    // Auto-detect page type and set defaults
    pageTypeDetection: {
      enabled: true,
      strategies: [
        {
          type: 'e-commerce',
          indicators: ['price', 'add to cart', 'product', 'buy now'],
          defaults: {
            category: 'products',
            mode: 'balanced',
            translation: false,
            summarization: false,
            deduplication: true
          }
        },
        {
          type: 'news',
          indicators: ['article', 'published', 'author', 'news'],
          defaults: {
            category: 'articles',
            mode: 'min',
            translation: true,
            summarization: true,
            deduplication: false
          }
        },
        {
          type: 'social',
          indicators: ['post', 'like', 'share', 'comment', 'follow'],
          defaults: {
            category: 'all',
            mode: 'balanced',
            translation: false,
            summarization: true,
            deduplication: true
          }
        },
        {
          type: 'jobs',
          indicators: ['job', 'apply', 'salary', 'position', 'career'],
          defaults: {
            category: 'jobs',
            mode: 'balanced',
            translation: false,
            summarization: true,
            deduplication: true
          }
        }
      ]
    },
    
    // User preferences learning (future)
    userPreferences: {
      enabled: false, // Future v4.3 feature
      learnFromHistory: false,
      adaptOverTime: false
    }
  },


  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.2: ACCESSIBILITY (Alt-Text Generation)
  // ════════════════════════════════════════════════════════════════
  ACCESSIBILITY: {
    enabled: true,
    optional: true, // User checkbox
    storageKey: 'web_weaver_accessibility_enabled',
    
    // Alt-text generation
    altText: {
      enabled: true,
      generateForImages: true,
      useVisionAPI: true, // Gemini Vision for image description
      fallbackToFilename: true,
      
      // Chrome AI (future - when Vision API available)
      chromeAI: {
        enabled: false, // Not available yet in Chrome AI
        futureSupport: true
      },
      
      // Cloud API
      cloudAPI: {
        enabled: true,
        model: 'gemini-2.0-flash-lite',
        promptTemplate: 'Describe this image in 10-15 words for screen reader accessibility.',
        maxLength: 150,
        costPerImage: 0.01
      },
      
      // Output
      output: {
        addAltTextField: true,
        fieldName: 'image_alt_text',
        addToExport: true
      }
    },
    
    // UI
    ui: {
      showCheckbox: true,
      defaultEnabled: false,
      showProgressBar: true,
      showCostEstimate: true
    }
  },


  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.2: MULTIMODAL (Image Analysis + Audio Transcription)
  // ════════════════════════════════════════════════════════════════
  MULTIMODAL: {
    enabled: true,
    
    // Image analysis
    imageAnalysis: {
      enabled: true,
      optional: true,
      storageKey: 'web_weaver_image_analysis_enabled',
      
      // Use cases
      useCases: [
        'Extract text from images (OCR)',
        'Describe product images',
        'Identify charts/graphs',
        'Detect logos/brands'
      ],
      
      // Cloud API (Gemini Vision)
      cloudAPI: {
        enabled: true,
        model: 'gemini-2.0-flash-lite',
        maxImagesPerExtraction: 10,
        costPerImage: 0.01,
        
        // Analysis types
        analysisTypes: {
          ocr: true, // Extract text from images
          description: true, // Describe image content
          objects: false, // Detect objects (future)
          faces: false // Detect faces (privacy concern - off)
        }
      },
      
      // Output
      output: {
        addImageAnalysisField: true,
        fieldName: 'image_analysis',
        includeInExport: true
      }
    },
    
    // Audio transcription
    audioTranscription: {
      enabled: true,
      optional: true,
      storageKey: 'web_weaver_audio_transcription_enabled',
      
      // Use cases
      useCases: [
        'Transcribe podcast episodes',
        'Extract audio from video pages',
        'Transcribe voice notes'
      ],
      
      // Cloud API (future - Gemini doesn't support audio yet)
      cloudAPI: {
        enabled: false,
        futureSupport: true,
        model: 'gemini-2.0-flash-lite',
        maxDurationSeconds: 300, // 5 min max
        costPerMinute: 0.05
      },
      
      // Output
      output: {
        addTranscriptField: true,
        fieldName: 'audio_transcript',
        includeInExport: true
      }
    }
  },


  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.2: PRIVACY BADGES (Visual Privacy Indicators)
  // ════════════════════════════════════════════════════════════════
  PRIVACY_BADGES: {
    enabled: true,
    
    // Badge types
    badges: {
      onDevice: {
        enabled: true,
        text: '🔵 On-Device AI',
        description: 'All processing happens locally. No data leaves your device.',
        showWhen: 'CHROME_BUILTIN',
        color: '#3B82F6',
        position: 'header'
      },
      
      cloudProcessing: {
        enabled: true,
        text: '☁️ Cloud Processing',
        description: 'Data sent to Google Gemini API for processing.',
        showWhen: 'CLOUD_API',
        color: '#F59E0B',
        position: 'header'
      },
      
      zeroCost: {
        enabled: true,
        text: '💰 $0 Cost',
        description: 'Using Chrome AI - no API costs.',
        showWhen: 'CHROME_BUILTIN',
        color: '#10B981',
        position: 'footer'
      },
      
      privacyFirst: {
        enabled: true,
        text: '🔒 Privacy-First',
        description: 'Your API key is stored locally. We never see it.',
        showWhen: 'ALWAYS',
        color: '#6B7280',
        position: 'footer'
      }
    },
    
    // UI
    ui: {
      showInPopup: true,
      animated: true,
      allowDismiss: false, // Always visible
      tooltipOnHover: true
    }
  },


  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.2: CHANGE DETECTION (Track Changes Across Re-Extractions)
  // ════════════════════════════════════════════════════════════════
  CHANGE_DETECTION: {
    enabled: true,
    optional: true,
    storageKey: 'web_weaver_change_detection',
    
    // Detection strategy
    strategy: {
      compareWith: 'PREVIOUS_EXTRACTION', // Compare with last extraction from same URL
      trackFields: ['title', 'price', 'description', 'availability'],
      sensitivity: 'MEDIUM', // 'LOW' | 'MEDIUM' | 'HIGH'
      ignoreWhitespace: true,
      ignoreCaseChanges: true
    },
    
    // Change types
    changeTypes: {
      added: { label: '🆕 New', color: '#10B981' },
      removed: { label: '❌ Removed', color: '#EF4444' },
      modified: { label: '✏️ Changed', color: '#F59E0B' },
      unchanged: { label: '✅ Unchanged', color: '#6B7280' }
    },
    
    // Storage
    history: {
      maxExtractions: 10, // Keep last 10 extractions per URL
      retentionDays: 7,
      compressionEnabled: true
    },
    
    // UI
    ui: {
      showChangeSummary: true,
      summaryTemplate: '{added} new, {removed} removed, {modified} changed',
      highlightChanges: true,
      showChangeHistory: false, // Future feature
      allowDiffView: false // Future feature
    },
    
    // Output
    output: {
      addChangeMetadata: true,
      fieldName: 'change_status', // 'added' | 'removed' | 'modified' | 'unchanged'
      includeInExport: true
    }
  },


  // ════════════════════════════════════════════════════════════════
  // v4.0: AI PROVIDER TOGGLE (PRESERVED FROM v4.1)
  // ════════════════════════════════════════════════════════════════
  AI_PROVIDER: {
    default: 'CHROME_BUILTIN',
    
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
          avgLatency: 50,
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
          avgLatency: 800,
          maxContextTokens: 32768,
          temperatureSupport: true,
          streamingSupport: false
        }
      }
    },


    fallback: {
      enabled: true,
      strategy: 'AUTO_SWITCH',
      chromeToCloud: true,
      cloudToChrome: false,
      notifyUser: true,
      rememberChoice: true
    }
  },


  // ════════════════════════════════════════════════════════════════
  // v4.1: FALLBACK BANNER (PRESERVED)
  // ════════════════════════════════════════════════════════════════
  FALLBACK_BANNER: {
    enabled: true,
    storageKey: 'web_weaver_fallback_banner_state',
    cooldownPeriod: 86400000,
    
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
    
    suppressSettings: {
      respectDismissal: true,
      resetOnProviderChange: true,
      showOncePerSession: false,
      maxDismissals: 3
    },
    
    ui: {
      position: 'top',
      autoDismissAfter: 0,
      showCloseButton: true,
      animateIn: true
    }
  },


  // ════════════════════════════════════════════════════════════════
  // v4.1: CATEGORY FILTERING (PRESERVED)
  // ════════════════════════════════════════════════════════════════
  CATEGORY_FILTERING: {
    enabled: true,
    
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
    
    ui: {
      showInPopup: true,
      position: 'afterExtractionType',
      showIcon: true,
      showDescription: true
    },
    
    promptIntegration: {
      injectAt: 'beginning',
      prefix: '\n\n🎯 CATEGORY FILTER: ',
      suffix: '\n\nStrict filtering is enforced. Return ONLY items matching the category.\n'
    }
  },


  // ════════════════════════════════════════════════════════════════
  // v4.1: URL EXTRACTION (PRESERVED)
  // ════════════════════════════════════════════════════════════════
  URL_EXTRACTION: {
    enabled: true,
    enforceURLField: true,
    urlFieldName: 'url',
    
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
    
    validation: {
      ensureAbsolute: true,
      validateFormat: true,
      allowFragments: true,
      allowQueryParams: true
    },
    
    fallback: {
      useCurrentURL: true,
      markAsFallback: true,
      logMissingURLs: true
    },
    
    promptAddition: `\n\n**CRITICAL: URL Field Required**\nFor each item, you MUST include a "url" field containing:\n- The item's direct link (from <a> tag href attribute)\n- If no specific URL exists, use the current page URL\n- Ensure URLs are absolute (include http:// or https://)\n\nExample:\n{\n  "title": "Sample Product",\n  "url": "https://example.com/product/123"\n}\n`
  },


  // ════════════════════════════════════════════════════════════════
  // v4.1: ITEM COUNT DISPLAY (PRESERVED)
  // ════════════════════════════════════════════════════════════════
  ITEM_COUNT_DISPLAY: {
    enabled: true,
    
    display: {
      showInPopup: true,
      showInNotification: true,
      showInExportFilename: true,
      position: 'header',
      prominent: true,
      animated: true
    },
    
    formatting: {
      template: '📊 {count} {label}',
      labels: {
        singular: 'item extracted',
        plural: 'items extracted',
        zero: 'No items found'
      },
      showNewVsTotal: true,
      templateWithNew: '📊 {new} new ({total} total)',
      highlightNew: true,
      newItemColor: '#10B981',
      totalItemColor: '#6B7280'
    },
    
    realtime: {
      updateOnExtraction: true,
      updateOnDeduplication: true,
      showLoadingState: true,
      loadingText: 'Counting items...'
    },
    
    breakdown: {
      enabled: true,
      showByCategory: true,
      showBySection: true,
      template: '{category}: {count} items'
    }
  },


  // ════════════════════════════════════════════════════════════════
  // v4.0: SECURITY (PRESERVED)
  // ════════════════════════════════════════════════════════════════
  SECURITY: {
    apiKey: {
      storageLocation: 'chrome.storage.local',
      encryptionEnabled: false,
      requireUserInput: true,
      validateOnEntry: true,
      validationEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models?key=',
      expirationWarning: {
        enabled: true,
        checkInterval: 86400000,
        warnDaysBefore: 7,
        blockDaysBefore: 1
      },
      errorHandling: {
        invalidKeyMessage: '🔒 Invalid API key. Generate one at https://aistudio.google.com/',
        expiredKeyMessage: '⏰ API key expired. Please update it.',
        quotaExceededMessage: '⚠️ API quota exceeded. Wait 60s or switch to Chrome AI.',
        missingKeyMessage: '🔑 No API key found. Add one in Settings or use Chrome AI.'
      }
    },


    permissions: {
      requestDynamically: true,
      scopeToActiveTab: true,
      revokeOnDisable: false,
      explainBeforeRequest: true,
      permissionMessage: 'Web Weaver needs permission to extract data from this page.'
    },


    build: {
      preventKeyLeakage: true,
      noHardcodedKeys: true,
      gitignoreSecrets: true,
      buildTimeValidation: true,
      warningOnPush: 'ERROR: Never commit API keys! Use .env.local'
    }
  },


  // ════════════════════════════════════════════════════════════════
  // v4.0: PRIVACY (PRESERVED)
  // ════════════════════════════════════════════════════════════════
  PRIVACY: {
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


    dataCollection: {
      localOnlyDefault: true,
      allowAnonymousTelemetry: false,
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
        userCanExport: true
      }
    }
  },


  // ════════════════════════════════════════════════════════════════
  // v4.0: RATE LIMIT WARNINGS (PRESERVED)
  // ════════════════════════════════════════════════════════════════
  RATE_LIMIT_WARNINGS: {
    enabled: true,
    
    limits: {
      requestsPerMinute: 15,
      requestsPerDay: 1500,
      tokensPerDay: 1000000
    },


    thresholds: {
      rpm: {
        warning: 10,
        critical: 13
      },
      rpd: {
        warning: 900000,
        critical: 950000
      }
    },


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


    behavior: {
      showWarningOnce: false,
      autoSwitchToChromeAI: false,
      trackUsageInStorage: true,
      resetCounterDaily: true,
      resetCounterOnKeyChange: true
    }
  },


  // ════════════════════════════════════════════════════════════════
  // v4.0: MULTI-SECTION EXTRACTION (PRESERVED)
  // ════════════════════════════════════════════════════════════════
  MULTI_SECTION_EXTRACTION: {
    enabled: true,


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


    labeling: {
      autoLabel: true,
      labelStrategies: [
        'HEADING',
        'ARIA_LABEL',
        'CLASS_NAME',
        'POSITION'
      ],
      defaultPrefix: 'Section'
    },


    output: {
      groupBySections: true,
      includeMetadata: true,
      flattenOnExport: false
    }
  },


  // ════════════════════════════════════════════════════════════════
  // EXTRACTION TYPES (PRESERVED)
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


  DEFAULT_EXTRACTION_TYPE: 'MULTI',


  // ════════════════════════════════════════════════════════════════
  // EXTRACTION MODES (PRESERVED)
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
  // API CONFIGURATION (PRESERVED)
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
      timeout: 30000,
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
  // CLASSIFICATION (PRESERVED)
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
  // PROMPT CONFIGURATION (PRESERVED)
  // ════════════════════════════════════════════════════════════════
  PROMPTS: {
    version: 'v10',
    promptFile: 'prompts/prompt_v10_universal.txt',
    fallbackFile: 'prompts/prompt_v8_fallback.txt',
    screenshotFile: 'prompts/prompt_v11_screenshot.txt',
    
    modifications: {
      injectCategory: true,
      injectURLRequirement: true,
      injectPageContext: true,
      injectExtractionType: true
    }
  },


  // ════════════════════════════════════════════════════════════════
  // CACHE CONFIGURATION (PRESERVED)
  // ════════════════════════════════════════════════════════════════
  CACHE: {
    enabled: true,
    ttl: 3600000,
    maxSize: 100,
    storageKey: 'web_weaver_cache',
    
    strategy: {
      keyGeneration: 'URL_HASH',
      invalidateOnModeChange: true,
      invalidateOnProviderChange: true,
      compressionEnabled: true
    }
  },


  // ════════════════════════════════════════════════════════════════
  // SCREENSHOT CONFIGURATION (PRESERVED)
  // ════════════════════════════════════════════════════════════════
  SCREENSHOT: {
    enabled: true,
    format: 'png',
    quality: 80,
    maxWidth: 1280,
    maxHeight: 10000,
    captureViewport: false,
    captureFullPage: false,
    
    vision: {
      enabled: true,
      useWhenDOMFails: true,
      maxImageSize: 4194304,
      compressionQuality: 0.8
    }
  },


  // ════════════════════════════════════════════════════════════════
  // ANALYTICS (PRESERVED)
  // ════════════════════════════════════════════════════════════════
  ANALYTICS: {
    enabled: true,
    optInRequired: true,
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
  // ERROR HANDLING (PRESERVED)
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
  // UI CONFIGURATION (PRESERVED)
  // ════════════════════════════════════════════════════════════════
  UI: {
    theme: 'auto',
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
      defaultView: 'json',
      prettyPrint: true,
      showMetadata: true,
      highlightNew: true
    }
  },


  // ════════════════════════════════════════════════════════════════
  // EXPORT CONFIGURATION (PRESERVED)
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
  // DEBUG & DEVELOPMENT (PRESERVED)
  // ════════════════════════════════════════════════════════════════
  DEBUG: {
    enabled: false,
    verboseLogging: false,
    logAPIRequests: false,
    logAPIResponses: false,
    showTimings: false,
    
    devTools: {
      exposeGlobals: false,
      allowManualOverrides: false
    }
  },


  // ════════════════════════════════════════════════════════════════
  // 🆕 v4.2: FEATURE FLAGS (ENHANCED)
  // ════════════════════════════════════════════════════════════════
  FEATURE_FLAGS: {
    // v4.1 features (preserved)
    chromeAI: true,
    categoryFiltering: true,
    urlExtraction: true,
    itemCountDisplay: true,
    multiSectionExtraction: true,
    deduplication: true, // Now optional
    fallbackBanner: true,
    smartAutoMode: true,
    screenshotExtraction: true,
    visionAPI: true,
    caching: true,
    analytics: true,
    
    // 🆕 v4.2 features
    translation: true,
    summarization: true,
    languageDetector: true,
    templates: true,
    insights: true,
    costTracker: true,
    smartDefaults: true,
    accessibility: true,
    multimodal: true,
    privacyBadges: true,
    changeDetection: true,
    visualAIRebrand: true
  }
};


// ════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS (PRESERVED + ENHANCED)
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


// 🆕 v4.2: Get template by ID
CONFIG.getTemplate = function(templateId) {
  return this.TEMPLATES.builtIn.find(t => t.id === templateId);
};


// 🆕 v4.2: Get template by domain
CONFIG.getTemplateByDomain = function(domain) {
  return this.TEMPLATES.builtIn.find(t => 
    t.domains.some(d => domain.includes(d))
  );
};


CONFIG.shouldShowFallbackBanner = async function() {
  if (!this.FEATURE_FLAGS.fallbackBanner) return false;
  
  const state = await chrome.storage.local.get(this.FALLBACK_BANNER.storageKey);
  const bannerState = state[this.FALLBACK_BANNER.storageKey];
  
  if (!bannerState) return true;
  
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


// 🆕 v4.2: Calculate extraction cost
CONFIG.calculateExtractionCost = function(options = {}) {
  let cost = 0;
  
  // Base extraction cost
  if (options.provider === 'CLOUD_API') {
    cost += this.COST_TRACKER.pricing.extraction.perCall;
  }
  
  // Translation cost
  if (options.translation && options.itemCount) {
    const translationBatches = Math.ceil(options.itemCount / this.TRANSLATION.cloudAPI.batch.maxItemsPerBatch);
    cost += translationBatches * this.TRANSLATION.cloudAPI.batch.costPerBatch;
  }
  
  // Summarization cost
  if (options.summarization && options.itemCount) {
    const summarizationBatches = Math.ceil(options.itemCount / this.SUMMARIZATION.cloudAPI.batch.maxItemsPerBatch);
    cost += summarizationBatches * this.SUMMARIZATION.cloudAPI.batch.costPerBatch;
  }
  
  // Vision API cost
  if (options.vision && options.imageCount) {
    cost += options.imageCount * this.COST_TRACKER.pricing.vision.perImage;
  }
  
  return cost.toFixed(4);
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
console.log('[Config] 🌐 Translation (batch) enabled');
console.log('[Config] 📝 Summarization (batch) enabled');
console.log('[Config] 🗣️ Language Detector enabled');
console.log('[Config] 📋 Extraction Templates enabled');
console.log('[Config] 💡 AI Insights enabled');
console.log('[Config] 💰 Cost Tracker enabled');
console.log('[Config] 🎯 Smart Defaults enabled');
console.log('[Config] ♿ Accessibility (alt-text) enabled');
console.log('[Config] 🎨 Multimodal (image/audio) enabled');
console.log('[Config] 🔒 Privacy Badges enabled');
console.log('[Config] 🔄 Change Detection enabled');
console.log('[Config] 🚀 Visual AI rebrand enabled');
