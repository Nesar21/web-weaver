// Day 8+9: ULTIMATE ENTERPRISE CHAMPION CONTENT SCRIPT
// /src/content.js - BLOOMBERG EXTRACTION CHAMPION EDITION

console.log('[Content] Day 8+9 BLOOMBERG EXTRACTION CHAMPION content script loading');

// ===== CONTENT SCRIPT CONFIGURATION =====
const CONTENT_CONFIG = {
  version: 'day8-day9-ultimate-enterprise-champion-bloomberg-fix',
  enableEnhancedExtraction: true,
  enableStructuredDataExtraction: true,
  enablePerformanceMonitoring: true,
  enableBloombergOptimization: true
};

// ===== ENHANCED LOGGER =====
const ContentLogger = {
  info: (msg, data = {}) => console.log(`[Content] ℹ️ ${msg}`, data),
  warn: (msg, data = {}) => console.warn(`[Content] ⚠️ ${msg}`, data),
  error: (msg, data = {}) => console.error(`[Content] ❌ ${msg}`, data),
  success: (msg, data = {}) => console.log(`[Content] ✅ ${msg}`, data)
};

// ===== ENHANCED PAGE DATA EXTRACTOR =====
class EnhancedPageExtractor {
  constructor() {
    this.extractionId = `content_extract_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.startTime = performance.now();
  }

  extractComprehensivePageData() {
    try {
      ContentLogger.info('🔍 Starting comprehensive page extraction', { 
        extractionId: this.extractionId 
      });

      const pageData = {
        // Basic page info
        title: document.title || '',
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

        // BLOOMBERG-SPECIFIC DIRECT FIELDS - MAJOR ADDITION
        ...this.extractDirectPageFields()
      };

      const duration = performance.now() - this.startTime;
      ContentLogger.success('Comprehensive extraction completed', {
        extractionId: this.extractionId,
        duration: Math.round(duration) + 'ms',
        fieldsExtracted: Object.keys(pageData).length
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

  // ===== NEW: DIRECT PAGE FIELDS EXTRACTION FOR BLOOMBERG =====
  extractDirectPageFields() {
    const hostname = window.location.hostname.toLowerCase();
    const directFields = {};

    try {
      // Add standard fields that Bloomberg validation expects
      if (hostname.includes('bloomberg.')) {
        ContentLogger.info('🔍 Extracting Bloomberg-specific direct fields');
        
        // Extract description from meta tags
        const metaDesc = document.querySelector('meta[name="description"], meta[property="description"]');
        if (metaDesc) {
          directFields.description = metaDesc.content || '';
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
          directFields.description = metaDesc.content || '';
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
            directFields.category = element.textContent?.trim() || element.content || '';
            break;
          }
        }

        // Extract main content summary
        directFields.maincontentsummary = this.extractMainContentSummary();
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
        const text = element.textContent?.trim() || element.content || '';
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
        const text = element.textContent?.trim() || element.content || '';
        if (text && text.length > 20) {
          return text.substring(0, 500); // Limit to 500 chars
        }
      }
    }

    // Fallback: extract from first paragraph
    const firstParagraph = document.querySelector('p, .article-content p, .story-body p');
    if (firstParagraph) {
      const text = firstParagraph.textContent?.trim();
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
                        element.textContent?.trim();
        if (dateTime) {
          return dateTime;
        }
      }
    }

    // Look for time patterns in text
    const timePattern = /\d{1,2}:\d{2}/;
    const bodyText = document.body.textContent || '';
    const timeMatch = bodyText.match(timePattern);
    if (timeMatch) {
      return timeMatch[0];
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
        const text = element.textContent?.trim() || element.content || '';
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
        const text = element.textContent?.trim() || element.content || '';
        if (text && text.length > 30) {
          return text.substring(0, 400);
        }
      }
    }

    return '';
  }

  extractContent() {
    const content = {
      headings: [],
      paragraphs: [],
      links: [],
      images: [],
      lists: [],
      tables: [],
      forms: []
    };

    try {
      // Enhanced headings extraction
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      content.headings = Array.from(headings)
        .map(h => ({
          tag: h.tagName.toLowerCase(),
          text: h.textContent?.trim(),
          level: parseInt(h.tagName.charAt(1)),
          id: h.id || null,
          className: h.className || null,
          position: this.getElementPosition(h)
        }))
        .filter(h => h.text && h.text.length > 0)
        .slice(0, 20);

      // Enhanced paragraphs extraction
      const paragraphs = document.querySelectorAll('p, .content p, .article-content p, .post-content p');
      content.paragraphs = Array.from(paragraphs)
        .map(p => ({
          text: p.textContent?.trim(),
          wordCount: this.countWords(p.textContent),
          position: this.getElementPosition(p)
        }))
        .filter(p => p.text && p.text.length > 25)
        .slice(0, 15);

      // Enhanced links extraction
      const links = document.querySelectorAll('a[href]');
      content.links = Array.from(links)
        .map(a => ({
          text: a.textContent?.trim(),
          href: a.href,
          internal: a.href.includes(window.location.hostname),
          title: a.title || null,
          target: a.target || null,
          rel: a.rel || null
        }))
        .filter(l => l.text && l.href && l.text.length > 2)
        .slice(0, 20);

      // Enhanced images extraction
      const images = document.querySelectorAll('img[src], picture img, figure img');
      content.images = Array.from(images)
        .map(img => ({
          src: img.src,
          alt: img.alt,
          width: img.width || img.naturalWidth || 0,
          height: img.height || img.naturalHeight || 0,
          title: img.title || null,
          loading: img.loading || null,
          className: img.className || null
        }))
        .filter(img => img.src && !img.src.includes('data:image') && !img.src.includes('svg'))
        .slice(0, 12);

      // Enhanced lists extraction
      const lists = document.querySelectorAll('ul, ol');
      content.lists = Array.from(lists)
        .map(list => ({
          type: list.tagName.toLowerCase(),
          items: Array.from(list.querySelectorAll('li')).map(li => li.textContent?.trim()).filter(Boolean).slice(0, 15),
          nested: list.querySelectorAll('ul, ol').length > 0
        }))
        .filter(list => list.items.length > 0)
        .slice(0, 8);

      // Enhanced tables extraction
      const tables = document.querySelectorAll('table');
      content.tables = Array.from(tables)
        .map(table => ({
          headers: Array.from(table.querySelectorAll('th')).map(th => th.textContent?.trim()).filter(Boolean),
          rows: Array.from(table.querySelectorAll('tr')).slice(1, 8).map(tr => 
            Array.from(tr.querySelectorAll('td')).map(td => td.textContent?.trim()).filter(Boolean)
          ).filter(row => row.length > 0),
          caption: table.caption?.textContent?.trim() || null
        }))
        .filter(table => table.headers.length > 0 || table.rows.length > 0)
        .slice(0, 5);

      // Forms extraction
      const forms = document.querySelectorAll('form');
      content.forms = Array.from(forms)
        .map(form => ({
          action: form.action || null,
          method: form.method || 'get',
          fieldCount: form.querySelectorAll('input, select, textarea').length,
          hasFileUpload: form.querySelector('input[type="file"]') !== null
        }))
        .slice(0, 3);

    } catch (error) {
      ContentLogger.warn('Content extraction error', { error: error.message });
    }

    return content;
  }

  extractMetadata() {
    const meta = {};

    try {
      // Standard meta tags
      const metaTags = {
        description: 'meta[name="description"], meta[property="description"]',
        keywords: 'meta[name="keywords"]',
        author: 'meta[name="author"], meta[property="author"]',
        viewport: 'meta[name="viewport"]',
        robots: 'meta[name="robots"]',
        generator: 'meta[name="generator"]'
      };

      Object.entries(metaTags).forEach(([key, selector]) => {
        const element = document.querySelector(selector);
        meta[key] = element?.content || null;
      });

      // Open Graph data
      meta.openGraph = {};
      document.querySelectorAll('meta[property^="og:"]').forEach(el => {
        const property = el.getAttribute('property').replace('og:', '');
        meta.openGraph[property] = el.getAttribute('content');
      });

      // Twitter Card data
      meta.twitterCard = {};
      document.querySelectorAll('meta[name^="twitter:"]').forEach(el => {
        const name = el.getAttribute('name').replace('twitter:', '');
        meta.twitterCard[name] = el.getAttribute('content');
      });

      // Link tags
      const canonical = document.querySelector('link[rel="canonical"]');
      meta.canonical = canonical?.href || null;

      const alternate = document.querySelectorAll('link[rel="alternate"]');
      meta.alternates = Array.from(alternate).map(link => ({
        href: link.href,
        type: link.type,
        hreflang: link.hreflang
      }));

    } catch (error) {
      ContentLogger.warn('Metadata extraction error', { error: error.message });
    }

    return meta;
  }

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
      ]),
      availability: this.getTextContent([
        '#availability span', '.a-size-mini', 
        '[data-feature-name="availability"] span'
      ]),
      brand: this.getTextContent([
        '#bylineInfo', '.a-brand', 
        '[data-feature-name="bylineInfo"]'
      ]),
      category: this.getTextContent([
        '#wayfinding-breadcrumbs_feature_div a', 
        '.a-breadcrumb .a-list-item a'
      ])
    };
  }

  // ===== ENHANCED BLOOMBERG DATA EXTRACTION =====
  extractBloombergDataAdvanced() {
    const bloombergData = {
      author: this.extractBloombergAuthor(),
      publishDate: this.extractBloombergPublishDate(),
      category: this.extractBloombergCategory(),
      summary: this.extractBloombergSummary(),
      
      // Additional Bloomberg-specific fields
      headline: document.title || '',
      body: this.extractBloombergBody(),
      tags: this.extractBloombergTags(),
      region: this.extractBloombergRegion()
    };

    ContentLogger.success('Advanced Bloomberg data extracted', {
      fieldsFound: Object.keys(bloombergData).filter(k => bloombergData[k]).length,
      hasAuthor: !!bloombergData.author,
      hasCategory: !!bloombergData.category,
      hasSummary: !!bloombergData.summary
    });

    return bloombergData;
  }

  extractBloombergBody() {
    const bodySelectors = [
      '.article-body',
      '.story-body', 
      '.content-body',
      '.post-content',
      'main p',
      '.article-content'
    ];

    for (const selector of bodySelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim();
        if (text && text.length > 100) {
          return text.substring(0, 1000);
        }
      }
    }

    // Fallback: get all paragraphs
    const paragraphs = document.querySelectorAll('p');
    if (paragraphs.length > 0) {
      const allText = Array.from(paragraphs)
        .map(p => p.textContent?.trim())
        .filter(text => text && text.length > 20)
        .join(' ')
        .substring(0, 800);
      
      if (allText.length > 50) {
        return allText;
      }
    }

    return '';
  }

  extractBloombergTags() {
    const tagSelectors = [
      '.tags a',
      '.article-tags a',
      '.post-tags a',
      'meta[name="keywords"]'
    ];

    const tags = [];
    
    for (const selector of tagSelectors) {
      if (selector.includes('meta')) {
        const element = document.querySelector(selector);
        if (element && element.content) {
          return element.content.split(',').map(tag => tag.trim()).slice(0, 5);
        }
      } else {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          return Array.from(elements)
            .map(el => el.textContent?.trim())
            .filter(tag => tag && tag.length > 0)
            .slice(0, 5);
        }
      }
    }

    return tags;
  }

  extractBloombergRegion() {
    // Extract region from URL or content
    const urlParts = window.location.pathname.split('/').filter(Boolean);
    
    if (urlParts.includes('asia')) return 'Asia';
    if (urlParts.includes('europe')) return 'Europe';
    if (urlParts.includes('americas')) return 'Americas';
    
    // Check page title or content
    const title = document.title.toLowerCase();
    if (title.includes('asia')) return 'Asia';
    if (title.includes('europe')) return 'Europe';
    if (title.includes('americas')) return 'Americas';
    
    return 'Global';
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
      difficulty: this.getTextContent([
        '.recipe-summary__difficulty', 
        '[data-testid="recipe-difficulty"]'
      ]),
      rating: this.getTextContent([
        '.recipe-rating', '.rating-stars', 
        '[data-testid="recipe-rating"]'
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
    const categories = Array.from(
      document.querySelectorAll('#mw-normal-catlinks ul li a, .mw-category a')
    ).map(a => a.textContent?.trim()).slice(0, 10);

    return {
      lastModified: this.getTextContent([
        '#footer-info-lastmod', '.lastmod'
      ]),
      categories: categories,
      coordinates: this.getTextContent([
        '.geo', '.coordinates'
      ]),
      infobox: this.extractInfoboxData()
    };
  }

  extractInfoboxData() {
    const infobox = document.querySelector('.infobox, .infobox-data');
    if (!infobox) return {};

    const data = {};
    const rows = infobox.querySelectorAll('tr');

    rows.forEach(row => {
      const header = row.querySelector('th, .infobox-label');
      const value = row.querySelector('td, .infobox-data');

      if (header && value) {
        const key = header.textContent?.trim().toLowerCase().replace(/\s+/g, '_');
        const val = value.textContent?.trim();
        if (key && val && key.length < 50) {
          data[key] = val.substring(0, 200);
        }
      }
    });

    return data;
  }

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

      // Microdata extraction
      const microdataItems = document.querySelectorAll('[itemscope]');
      if (microdataItems.length > 0) {
        structuredData.microdata = Array.from(microdataItems).slice(0, 5).map(item => ({
          itemtype: item.getAttribute('itemtype'),
          itemprops: Array.from(item.querySelectorAll('[itemprop]')).slice(0, 10).map(prop => ({
            property: prop.getAttribute('itemprop'),
            content: prop.textContent?.trim() || prop.getAttribute('content')
          }))
        }));
      }

      // RDFa basic extraction
      const rdfaElements = document.querySelectorAll('[property], [typeof]');
      if (rdfaElements.length > 0) {
        structuredData.rdfa = Array.from(rdfaElements).slice(0, 10).map(el => ({
          property: el.getAttribute('property'),
          typeof: el.getAttribute('typeof'),
          content: el.textContent?.trim() || el.getAttribute('content')
        }));
      }

    } catch (error) {
      ContentLogger.warn('Structured data extraction error', { error: error.message });
    }

    return structuredData;
  }

  calculatePageStats() {
    try {
      return {
        textLength: document.body?.textContent?.length || 0,
        wordCount: this.countWords(document.body?.textContent || ''),
        linkCount: document.querySelectorAll('a[href]').length,
        imageCount: document.querySelectorAll('img[src]').length,
        headingCount: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
        paragraphCount: document.querySelectorAll('p').length,
        listCount: document.querySelectorAll('ul, ol').length,
        tableCount: document.querySelectorAll('table').length,
        formCount: document.querySelectorAll('form').length,
        videoCount: document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length,
        scriptCount: document.querySelectorAll('script').length,
        styleCount: document.querySelectorAll('style, link[rel="stylesheet"]').length
      };
    } catch (error) {
      ContentLogger.warn('Stats calculation error', { error: error.message });
      return {};
    }
  }

  getPerformanceData() {
    try {
      const perfData = {
        loadTime: performance.now() - this.startTime,
        domContentLoaded: document.readyState === 'complete',
        extractionTime: performance.now() - this.startTime
      };

      // Navigation timing if available
      if (performance.navigation) {
        perfData.navigationType = performance.navigation.type;
        perfData.redirectCount = performance.navigation.redirectCount;
      }

      // Timing data if available
      if (performance.timing) {
        const timing = performance.timing;
        perfData.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
        perfData.domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
        perfData.connectTime = timing.connectEnd - timing.connectStart;
      }

      return perfData;
    } catch (error) {
      ContentLogger.warn('Performance data extraction error', { error: error.message });
      return { loadTime: performance.now() - this.startTime };
    }
  }

  extractPageContext() {
    try {
      return {
        language: document.documentElement.lang || null,
        charset: document.characterSet || null,
        readyState: document.readyState,
        referrer: document.referrer || null,
        lastModified: document.lastModified || null,
        hasJavaScript: true, // Obviously true since this is running
        hasCSS: document.querySelectorAll('style, link[rel="stylesheet"]').length > 0,
        deviceType: this.detectDeviceType(),
        scrollDepth: this.calculateScrollDepth()
      };
    } catch (error) {
      ContentLogger.warn('Page context extraction error', { error: error.message });
      return {};
    }
  }

  // ===== UTILITY METHODS =====

  getTextContent(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent?.trim()) {
        return element.textContent.trim();
      }
    }
    return null;
  }

  extractListData(selectors) {
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        return Array.from(elements)
          .map(el => el.textContent?.trim())
          .filter(text => text && text.length > 3)
          .slice(0, 20);
      }
    }
    return [];
  }

  getElementPosition(element) {
    try {
      const rect = element.getBoundingClientRect();
      return {
        top: Math.round(rect.top + window.scrollY),
        left: Math.round(rect.left + window.scrollX),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    } catch (error) {
      return null;
    }
  }

  countWords(text) {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  detectDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipod/.test(userAgent)) return 'mobile';
    if (/tablet|ipad/.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  calculateScrollDepth() {
    try {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      return Math.round((scrollTop + windowHeight) / documentHeight * 100);
    } catch (error) {
      return 0;
    }
  }
}

// ===== MESSAGE LISTENER =====
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
          extractedAt: new Date().toISOString()
        });
        break;

      case 'ping':
        sendResponse({
          success: true,
          message: 'Day 8+9 BLOOMBERG EXTRACTION CHAMPION content script active',
          version: CONTENT_CONFIG.version,
          url: window.location.href,
          title: document.title
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

// ===== CONTENT SCRIPT INITIALIZATION =====
(() => {
  ContentLogger.success('🏆 Day 8+9 BLOOMBERG EXTRACTION CHAMPION content script initialized', {
    version: CONTENT_CONFIG.version,
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString(),
    bloombergOptimized: CONTENT_CONFIG.enableBloombergOptimization
  });
})();
