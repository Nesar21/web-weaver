// Day 10: ULTIMATE ENTERPRISE AI ENGINE v1 CONTENT SCRIPT
// /src/content.js - DAY 10 ENHANCED WITH CONFIDENCE & DATA QUALITY

console.log('[Content] Day 10 AI ENGINE v1 loading - Enhanced Data Extraction with Quality Scoring');

// ============================================================================
// DAY 10 CONTENT SCRIPT CONFIGURATION
// ============================================================================

const CONTENT_CONFIG = {
  version: 'day10-ai-engine-v1-content',
  day8Version: 'day8-day9-ultimate-enterprise-champion-bloomberg-fix', // Preserve backward compat
  enableEnhancedExtraction: true,
  enableStructuredDataExtraction: true,
  enablePerformanceMonitoring: true,
  enableBloombergOptimization: true,
  
  // Day 10 additions
  enableQualityScoring: true,
  enableDataCleaning: true,
  enablePIIDetection: true,
  minTextLength: 10,
  maxFieldLength: 2000
};

// ============================================================================
// ENHANCED LOGGER
// ============================================================================

const ContentLogger = {
  info: (msg, data = {}) => console.log(`[Content-Day10] ℹ️ ${msg}`, data),
  warn: (msg, data = {}) => console.warn(`[Content-Day10] ⚠️ ${msg}`, data),
  error: (msg, data = {}) => console.error(`[Content-Day10] ❌ ${msg}`, data),
  success: (msg, data = {}) => console.log(`[Content-Day10] ✅ ${msg}`, data)
};

// ============================================================================
// DAY 10: DATA QUALITY UTILITIES
// ============================================================================

const DataQuality = {
  // Clean text by removing extra whitespace and normalizing
  cleanText(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .substring(0, CONTENT_CONFIG.maxFieldLength);
  },
  
  // Check if text contains potential PII
  hasPII(text) {
    if (!text || typeof text !== 'string') return false;
    const piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{16}\b/, // Credit card
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // Email
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/ // Phone
    ];
    return piiPatterns.some(pattern => pattern.test(text));
  },
  
  // Calculate text quality score (0-100)
  calculateQualityScore(text) {
    if (!text || typeof text !== 'string') return 0;
    
    let score = 50; // Base score
    
    // Length check
    if (text.length >= CONTENT_CONFIG.minTextLength) score += 10;
    if (text.length >= 50) score += 10;
    if (text.length >= 100) score += 10;
    
    // No PII detected
    if (!this.hasPII(text)) score += 10;
    
    // Has proper capitalization
    if (/^[A-Z]/.test(text)) score += 5;
    
    // Has proper punctuation
    if (/[.!?]$/.test(text)) score += 5;
    
    return Math.min(100, score);
  },
  
  // Clean array data
  cleanArray(arr) {
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(item => item && typeof item === 'string' && item.trim().length > 0)
      .map(item => this.cleanText(item))
      .slice(0, 50); // Limit array size
  }
};

// ============================================================================
// ENHANCED PAGE DATA EXTRACTOR (DAY 10)
// ============================================================================

class EnhancedPageExtractor {
  constructor() {
    this.extractionId = `content_extract_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.startTime = performance.now();
  }

  extractComprehensivePageData() {
    try {
      ContentLogger.info('🔍 Starting Day 10 comprehensive page extraction', {
        extractionId: this.extractionId
      });

      const pageData = {
        // Basic page info
        title: DataQuality.cleanText(document.title || ''),
        url: window.location.href,
        domain: window.location.hostname,
        extractedAt: new Date().toISOString(),
        
        // Enhanced content extraction
        content: this.extractContent(),
        
        // Enhanced metadata
        meta: this.extractMetadata(),
        
        // Site-specific data
        siteSpecific: this.extractSiteSpecificData(),
        
        // Structured data
        structuredData: this.extractStructuredData(),
        
        // Page statistics
        stats: this.calculatePageStats(),
        
        // Performance data
        performance: this.getPerformanceData(),
        
        // Page context
        context: this.extractPageContext(),
        
        // Direct page fields (Bloomberg + others)
        ...this.extractDirectPageFields(),
        
        // Day 10: Data quality metrics
        dataQuality: this.calculateDataQuality()
      };

      const duration = performance.now() - this.startTime;

      ContentLogger.success('Day 10 extraction completed', {
        extractionId: this.extractionId,
        duration: Math.round(duration) + 'ms',
        fieldsExtracted: Object.keys(pageData).length,
        qualityScore: pageData.dataQuality?.overallScore || 0
      });

      return pageData;

    } catch (error) {
      ContentLogger.error('Comprehensive extraction failed', {
        error: error.message,
        extractionId: this.extractionId
      });
      return { error: error.message };
    }
  }

  // ===== DAY 10: DATA QUALITY CALCULATION =====
  calculateDataQuality() {
    const quality = {
      overallScore: 0,
      titleQuality: 0,
      contentQuality: 0,
      metadataQuality: 0,
      hasPII: false,
      issues: []
    };

    try {
      // Title quality
      const title = document.title || '';
      quality.titleQuality = DataQuality.calculateQualityScore(title);
      if (!title) quality.issues.push('MISSING_TITLE');

      // Content quality (based on paragraphs)
      const paragraphs = document.querySelectorAll('p');
      if (paragraphs.length > 0) {
        const avgParagraphQuality = Array.from(paragraphs)
          .slice(0, 5)
          .reduce((sum, p) => sum + DataQuality.calculateQualityScore(p.textContent), 0) / Math.min(5, paragraphs.length);
        quality.contentQuality = avgParagraphQuality;
      } else {
        quality.issues.push('MISSING_CONTENT');
      }

      // Metadata quality
      const metaDesc = document.querySelector('meta[name="description"]');
      quality.metadataQuality = metaDesc ? DataQuality.calculateQualityScore(metaDesc.content) : 0;
      if (!metaDesc) quality.issues.push('MISSING_DESCRIPTION');

      // PII detection
      const bodyText = document.body.textContent || '';
      quality.hasPII = DataQuality.hasPII(bodyText.substring(0, 5000));
      if (quality.hasPII) quality.issues.push('PII_DETECTED');

      // Calculate overall score
      quality.overallScore = Math.round(
        (quality.titleQuality * 0.3 + quality.contentQuality * 0.5 + quality.metadataQuality * 0.2)
      );

    } catch (error) {
      ContentLogger.warn('Quality calculation error', { error: error.message });
    }

    return quality;
  }

  // ===== DIRECT PAGE FIELDS EXTRACTION (BLOOMBERG + OTHERS) =====
  extractDirectPageFields() {
    const hostname = window.location.hostname.toLowerCase();
    const directFields = {};

    try {
      // Add standard fields that validation expects
      if (hostname.includes('bloomberg.')) {
        ContentLogger.info('🔍 Extracting Bloomberg-specific direct fields');

        // Extract description from meta tags
        const metaDesc = document.querySelector('meta[name="description"], meta[property="description"]');
        if (metaDesc) {
          directFields.description = DataQuality.cleanText(metaDesc.content || '');
        }

        // Extract category from various sources
        directFields.category = this.extractBloombergCategory();

        // Extract summary from page content
        directFields.summary = this.extractBloombergSummary();

        // Extract publishdate from various sources
        directFields.publishdate = this.extractBloombergPublishDate();

        // Extract author if available
        directFields.author = this.extractBloombergAuthor();

        ContentLogger.success('Bloomberg direct fields extracted', {
          fieldsFound: Object.keys(directFields).filter(k => directFields[k]).length
        });

      } else {
        // For other sites, extract common fields
        const metaDesc = document.querySelector('meta[name="description"], meta[property="description"]');
        if (metaDesc) {
          directFields.description = DataQuality.cleanText(metaDesc.content || '');
        }

        // Extract category from various sources
        const categorySelectors = [
          'meta[property="article:section"]',
          'meta[name="category"]',
          '.category',
          '.section',
          '.breadcrumb a:last-child'
        ];

        for (const selector of categorySelectors) {
          const element = document.querySelector(selector);
          if (element) {
            directFields.category = DataQuality.cleanText(element.textContent || element.content || '');
            break;
          }
        }

        // Extract main content summary
        directFields.main_content_summary = this.extractMainContentSummary();
      }

    } catch (error) {
      ContentLogger.warn('Direct fields extraction error', { error: error.message });
    }

    return directFields;
  }

  // ===== BLOOMBERG-SPECIFIC EXTRACTION METHODS =====
  extractBloombergCategory() {
    const categorySelectors = [
      'meta[property="article:section"]',
      'meta[name="category"]',
      '.category',
      '.section-name',
      '.kicker',
      '.eyebrow',
      '.breadcrumb a:last-child',
      '[data-module="ArticleHeader"] .eyebrow',
      '.article-header .category'
    ];

    for (const selector of categorySelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = DataQuality.cleanText(element.textContent || element.content || '');
        if (text && text.length > 0) {
          return text;
        }
      }
    }

    // Fallback to URL-based category detection
    const urlParts = window.location.pathname.split('/').filter(Boolean);
    if (urlParts.length > 0) {
      const possibleCategory = urlParts[0];
      if (['news', 'markets', 'technology', 'politics', 'business', 'asia'].includes(possibleCategory)) {
        return possibleCategory.charAt(0).toUpperCase() + possibleCategory.slice(1);
      }
    }

    return 'News'; // Default fallback for Bloomberg
  }

  extractBloombergSummary() {
    const summarySelectors = [
      'meta[name="description"]',
      'meta[property="og:description"]',
      '.summary',
      '.deck',
      '.article-summary',
      '.lead-paragraph',
      '.story-summary',
      '.article-intro'
    ];

    for (const selector of summarySelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = DataQuality.cleanText(element.textContent || element.content || '');
        if (text && text.length > 20) {
          return text.substring(0, 500);
        }
      }
    }

    // Fallback: extract from first paragraph
    const firstParagraph = document.querySelector('p, .article-content p, .story-body p');
    if (firstParagraph) {
      const text = DataQuality.cleanText(firstParagraph.textContent || '');
      if (text && text.length > 50) {
        return text.substring(0, 300);
      }
    }

    return '';
  }

  extractBloombergPublishDate() {
    const dateSelectors = [
      'time[datetime]',
      'meta[property="article:published_time"]',
      'meta[name="publish-date"]',
      '.timestamp',
      '.publish-date',
      '.article-timestamp',
      '[data-module="BylineAndTimestamp"] time',
      '.byline time'
    ];

    for (const selector of dateSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const dateTime = element.getAttribute('datetime') ||
                         element.getAttribute('content') ||
                         DataQuality.cleanText(element.textContent || '');
        if (dateTime) {
          return dateTime;
        }
      }
    }

    return '';
  }

  extractBloombergAuthor() {
    const authorSelectors = [
      'meta[name="author"]',
      'meta[property="article:author"]',
      '.byline',
      '.author',
      '.author-name',
      '[data-module="BylineAndTimestamp"] .author',
      '.article-byline',
      '.story-byline'
    ];

    for (const selector of authorSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = DataQuality.cleanText(element.textContent || element.content || '');
        if (text && text.length > 0 && text.length < 100) {
          // Clean up author text (remove "By " prefix)
          return text.replace(/^By\s+/i, '').trim();
        }
      }
    }

    return '';
  }

  extractMainContentSummary() {
    // Extract main content summary for non-Bloomberg sites
    const summarySelectors = [
      'meta[name="description"]',
      'meta[property="og:description"]',
      '.summary',
      '.excerpt',
      '.intro',
      'p:first-of-type'
    ];

    for (const selector of summarySelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = DataQuality.cleanText(element.textContent || element.content || '');
        if (text && text.length > 30) {
          return text.substring(0, 400);
        }
      }
    }

    return '';
  }

  // ===== CONTENT EXTRACTION =====
  extractContent() {
    const content = {
      headings: [],
      paragraphs: [],
      links: [],
      images: [],
      lists: [],
      tables: []
    };

    try {
      // Enhanced headings extraction
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      content.headings = Array.from(headings)
        .map(h => ({
          tag: h.tagName.toLowerCase(),
          text: DataQuality.cleanText(h.textContent || ''),
          level: parseInt(h.tagName.charAt(1))
        }))
        .filter(h => h.text && h.text.length > 0)
        .slice(0, 20);

      // Enhanced paragraphs extraction
      const paragraphs = document.querySelectorAll('p, .content p, .article-content p, .post-content p');
      content.paragraphs = Array.from(paragraphs)
        .map(p => ({
          text: DataQuality.cleanText(p.textContent || ''),
          wordCount: this.countWords(p.textContent)
        }))
        .filter(p => p.text && p.text.length > 25)
        .slice(0, 15);

      // Enhanced links extraction
      const links = document.querySelectorAll('a[href]');
      content.links = Array.from(links)
        .map(a => ({
          text: DataQuality.cleanText(a.textContent || ''),
          href: a.href,
          internal: a.href.includes(window.location.hostname)
        }))
        .filter(l => l.text && l.href && l.text.length > 2)
        .slice(0, 20);

      // Enhanced images extraction
      const images = document.querySelectorAll('img[src], picture img, figure img');
      content.images = Array.from(images)
        .map(img => ({
          src: img.src,
          alt: DataQuality.cleanText(img.alt || ''),
          width: img.width || img.naturalWidth || 0,
          height: img.height || img.naturalHeight || 0
        }))
        .filter(img => img.src && !img.src.includes('data:image') && !img.src.includes('svg'))
        .slice(0, 12);

      // Enhanced lists extraction
      const lists = document.querySelectorAll('ul, ol');
      content.lists = Array.from(lists)
        .map(list => ({
          type: list.tagName.toLowerCase(),
          items: DataQuality.cleanArray(
            Array.from(list.querySelectorAll('li')).map(li => li.textContent)
          )
        }))
        .filter(list => list.items.length > 0)
        .slice(0, 8);

      // Enhanced tables extraction
      const tables = document.querySelectorAll('table');
      content.tables = Array.from(tables)
        .map(table => ({
          headers: DataQuality.cleanArray(
            Array.from(table.querySelectorAll('th')).map(th => th.textContent)
          ),
          rows: Array.from(table.querySelectorAll('tr')).slice(1, 8).map(tr =>
            DataQuality.cleanArray(
              Array.from(tr.querySelectorAll('td')).map(td => td.textContent)
            )
          ).filter(row => row.length > 0)
        }))
        .filter(table => table.headers.length > 0 || table.rows.length > 0)
        .slice(0, 5);

    } catch (error) {
      ContentLogger.warn('Content extraction error', { error: error.message });
    }

    return content;
  }

  // ===== METADATA EXTRACTION =====
  extractMetadata() {
    const meta = {};

    try {
      // Standard meta tags
      const metaTags = {
        description: 'meta[name="description"], meta[property="description"]',
        keywords: 'meta[name="keywords"]',
        author: 'meta[name="author"], meta[property="author"]',
        viewport: 'meta[name="viewport"]',
        robots: 'meta[name="robots"]'
      };

      Object.entries(metaTags).forEach(([key, selector]) => {
        const element = document.querySelector(selector);
        meta[key] = element ? DataQuality.cleanText(element.content || '') : null;
      });

      // Open Graph data
      meta.openGraph = {};
      document.querySelectorAll('meta[property^="og:"]').forEach(el => {
        const property = el.getAttribute('property').replace('og:', '');
        meta.openGraph[property] = DataQuality.cleanText(el.getAttribute('content') || '');
      });

      // Twitter Card data
      meta.twitterCard = {};
      document.querySelectorAll('meta[name^="twitter:"]').forEach(el => {
        const name = el.getAttribute('name').replace('twitter:', '');
        meta.twitterCard[name] = DataQuality.cleanText(el.getAttribute('content') || '');
      });

      // Link tags
      const canonical = document.querySelector('link[rel="canonical"]');
      meta.canonical = canonical?.href || null;

    } catch (error) {
      ContentLogger.warn('Metadata extraction error', { error: error.message });
    }

    return meta;
  }

  // ===== SITE-SPECIFIC DATA EXTRACTION =====
  extractSiteSpecificData() {
    const hostname = window.location.hostname.toLowerCase();
    const siteData = {};

    try {
      if (hostname.includes('amazon.')) {
        siteData.amazon = this.extractAmazonData();
      } else if (hostname.includes('bloomberg.')) {
        siteData.bloomberg = this.extractBloombergDataAdvanced();
      } else if (hostname.includes('allrecipes.')) {
        siteData.allrecipes = this.extractRecipeData();
      } else if (hostname.includes('wikipedia.org')) {
        siteData.wikipedia = this.extractWikipediaData();
      }

    } catch (error) {
      ContentLogger.warn('Site-specific extraction error', { error: error.message });
    }

    return siteData;
  }

  extractAmazonData() {
    return {
      price: this.getTextContent([
        '.a-price-whole', '.a-offscreen', '.a-price .a-offscreen',
        '[data-testid="price"]', '.a-price-symbol'
      ]),
      rating: this.getTextContent([
        '.a-icon-alt', '[data-hook="rating-out-of-text"]',
        '.a-star-medium .a-star'
      ]),
      reviews: this.getTextContent([
        '#acrCustomerReviewText', '.a-size-base',
        '[data-hook="total-review-count"]'
      ])
    };
  }

  extractBloombergDataAdvanced() {
    return {
      author: this.extractBloombergAuthor(),
      publishDate: this.extractBloombergPublishDate(),
      category: this.extractBloombergCategory(),
      summary: this.extractBloombergSummary(),
      headline: DataQuality.cleanText(document.title || '')
    };
  }

  extractRecipeData() {
    return {
      cookTime: this.getTextContent([
        '.recipe-summary__item-data', '.total-time',
        '[data-testid="recipe-cook-time"]'
      ]),
      servings: this.getTextContent([
        '.recipe-adjust-servings__size-quantity',
        '[data-testid="recipe-servings"]'
      ]),
      ingredients: this.extractListData([
        '.recipe-ingredient', '.ingredients li',
        '[data-testid="recipe-ingredient"]'
      ]),
      instructions: this.extractListData([
        '.recipe-instruction', '.instructions li',
        '[data-testid="recipe-instruction"]'
      ])
    };
  }

  extractWikipediaData() {
    const categories = DataQuality.cleanArray(
      Array.from(document.querySelectorAll('#mw-normal-catlinks ul li a, .mw-category a'))
        .map(a => a.textContent)
    );

    return {
      categories: categories.slice(0, 10),
      lastModified: this.getTextContent(['#footer-info-lastmod', '.lastmod'])
    };
  }

  // ===== STRUCTURED DATA EXTRACTION =====
  extractStructuredData() {
    const structuredData = {};

    try {
      // JSON-LD extraction
      const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
      if (jsonLdScripts.length > 0) {
        const jsonLdData = [];
        jsonLdScripts.forEach(script => {
          try {
            const data = JSON.parse(script.textContent);
            jsonLdData.push(data);
          } catch (e) {
            ContentLogger.warn('JSON-LD parsing error', { error: e.message });
          }
        });
        structuredData.jsonLd = jsonLdData.slice(0, 3);
      }

    } catch (error) {
      ContentLogger.warn('Structured data extraction error', { error: error.message });
    }

    return structuredData;
  }

  // ===== PAGE STATISTICS =====
  calculatePageStats() {
    try {
      return {
        textLength: document.body?.textContent?.length || 0,
        wordCount: this.countWords(document.body?.textContent || ''),
        linkCount: document.querySelectorAll('a[href]').length,
        imageCount: document.querySelectorAll('img[src]').length,
        headingCount: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
        paragraphCount: document.querySelectorAll('p').length
      };
    } catch (error) {
      ContentLogger.warn('Stats calculation error', { error: error.message });
      return {};
    }
  }

  // ===== PERFORMANCE DATA =====
  getPerformanceData() {
    try {
      return {
        loadTime: performance.now() - this.startTime,
        domContentLoaded: document.readyState === 'complete',
        extractionTime: performance.now() - this.startTime
      };
    } catch (error) {
      return { loadTime: performance.now() - this.startTime };
    }
  }

  // ===== PAGE CONTEXT =====
  extractPageContext() {
    try {
      return {
        language: document.documentElement.lang || null,
        charset: document.characterSet || null,
        readyState: document.readyState,
        referrer: document.referrer || null,
        hasJavaScript: true,
        hasCSS: document.querySelectorAll('style, link[rel="stylesheet"]').length > 0
      };
    } catch (error) {
      return {};
    }
  }

  // ===== UTILITY METHODS =====
  getTextContent(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent?.trim()) {
        return DataQuality.cleanText(element.textContent);
      }
    }
    return null;
  }

  extractListData(selectors) {
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        return DataQuality.cleanArray(
          Array.from(elements).map(el => el.textContent)
        );
      }
    }
    return [];
  }

  countWords(text) {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
}

// ============================================================================
// MESSAGE LISTENER (DAY 10 ENHANCED)
// ============================================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  ContentLogger.info(`📨 Message received: ${request.action}`);

  try {
    switch (request.action) {
      case 'extractPageData':
      case 'getPageData':
        const extractor = new EnhancedPageExtractor();
        const pageData = extractor.extractComprehensivePageData();

        sendResponse({
          success: !pageData.error,
          data: pageData,
          version: CONTENT_CONFIG.version,
          extractedAt: new Date().toISOString(),
          day10Enhanced: true
        });
        break;

      case 'ping':
        sendResponse({
          success: true,
          message: 'Day 10 AI ENGINE v1 content script active',
          version: CONTENT_CONFIG.version,
          url: window.location.href,
          title: document.title,
          day10Enhanced: true
        });
        break;

      default:
        sendResponse({
          success: false,
          error: 'Unknown action: ' + request.action,
          version: CONTENT_CONFIG.version
        });
    }

  } catch (error) {
    ContentLogger.error('Message handling error', { error: error.message });
    sendResponse({
      success: false,
      error: error.message,
      version: CONTENT_CONFIG.version
    });
  }

  return true; // Keep message channel open for async response
});

// ============================================================================
// CONTENT SCRIPT INITIALIZATION
// ============================================================================

(() => {
  ContentLogger.success('🏆 Day 10 AI ENGINE v1 content script initialized', {
    version: CONTENT_CONFIG.version,
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString(),
    day10Features: {
      qualityScoring: CONTENT_CONFIG.enableQualityScoring,
      dataCleaning: CONTENT_CONFIG.enableDataCleaning,
      piiDetection: CONTENT_CONFIG.enablePIIDetection
    }
  });

  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║       🎯 DAY 10 AI ENGINE v1 - CONTENT SCRIPT LOADED                 ║
║                                                                      ║
║  Version: ${CONTENT_CONFIG.version.padEnd(55)}║
║  Target:  High-Quality Data Extraction                               ║
║                                                                      ║
║  Day 10 Features:                                                    ║
║  ✅ Data Quality Scoring                                             ║
║  ✅ PII Detection                                                    ║
║  ✅ Text Cleaning & Normalization                                    ║
║  ✅ Bloomberg Optimization                                           ║
║  ✅ Enhanced Field Extraction                                        ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
  `);
})();

// ============================================================================
// END OF content.js - DAY 10 AI ENGINE v1
// ============================================================================
