// Web Weaver Lightning - Content Script
// Days 1-3: DOM Capture + Main Content Extraction
// Runs on every page to extract structured data

console.log('[WebWeaver] Content script loaded');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  version: '1.0.0-day10',
  maxTextLength: 5000,
  maxArrayItems: 20,
  confidenceThreshold: 0.5
};

// ============================================================================
// UTILITIES - Data Cleaning (Day 8)
// ============================================================================

const DataCleaner = {
  cleanText(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .substring(0, CONFIG.maxTextLength);
  },
  
  cleanArray(arr) {
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(item => item && typeof item === 'string' && item.trim().length > 0)
      .map(item => this.cleanText(item))
      .slice(0, CONFIG.maxArrayItems);
  },
  
  normalizePrice(price) {
    if (!price) return null;
    // Strip currency symbols, keep numbers and decimal
    const cleaned = price.toString().replace(/[^0-9.,]/g, '');
    return cleaned || null;
  },
  
  normalizeDate(dateStr) {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch (e) {
      // Invalid date
    }
    return dateStr;
  }
};

// ============================================================================
// MAIN CONTENT DETECTOR (Day 3)
// ============================================================================

class MainContentDetector {
  detect() {
    // Priority order: article > main > .content > body
    const selectors = [
      'article',
      'main',
      '[role="main"]',
      '#main-content',
      '#content',
      '.content',
      '.main-content',
      '.article-content',
      'body'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`[WebWeaver] Main content found: ${selector}`);
        return element;
      }
    }
    
    return document.body;
  }
  
  extractText(element) {
    if (!element) return '';
    return DataCleaner.cleanText(element.innerText || element.textContent || '');
  }
}

// ============================================================================
// BASIC EXTRACTOR (Days 1-3) - No AI Required
// ============================================================================

class BasicExtractor {
  constructor() {
    this.detector = new MainContentDetector();
  }
  
  extract() {
    const mainContent = this.detector.detect();
    const domain = window.location.hostname;
    
    const data = {
      // Core fields
      url: window.location.href,
      domain: domain,
      title: DataCleaner.cleanText(document.title),
      
      // Main content
      mainText: this.detector.extractText(mainContent),
      
      // Metadata
      description: this.getMeta('description'),
      keywords: this.getMeta('keywords'),
      author: this.getMeta('author'),
      
      // Structure
      headings: this.extractHeadings(),
      links: this.extractLinks(),
      images: this.extractImages(),
      
      // Site-specific (basic heuristics)
      ...this.extractSiteSpecific(domain, mainContent),
      
      // Metadata
      _meta: {
        extractedAt: new Date().toISOString(),
        method: 'basic',
        version: CONFIG.version
      }
    };
    
    return data;
  }
  
  getMeta(name) {
    const selector = `meta[name="${name}"], meta[property="${name}"], meta[property="og:${name}"]`;
    const element = document.querySelector(selector);
    return element ? DataCleaner.cleanText(element.content) : null;
  }
  
  extractHeadings() {
    const headings = document.querySelectorAll('h1, h2, h3');
    return DataCleaner.cleanArray(
      Array.from(headings).map(h => h.textContent)
    );
  }
  
  extractLinks() {
    const links = document.querySelectorAll('a[href]');
    return Array.from(links)
      .filter(a => a.href && !a.href.startsWith('javascript:'))
      .map(a => ({
        text: DataCleaner.cleanText(a.textContent),
        href: a.href
      }))
      .slice(0, CONFIG.maxArrayItems);
  }
  
  extractImages() {
    const images = document.querySelectorAll('img[src]');
    return Array.from(images)
      .filter(img => img.src && !img.src.includes('data:image'))
      .map(img => ({
        src: img.src,
        alt: DataCleaner.cleanText(img.alt || '')
      }))
      .slice(0, 10);
  }
  
  // Site-specific basic extraction (Day 6)
  extractSiteSpecific(domain, mainContent) {
    if (domain.includes('amazon.')) {
      return this.extractAmazon();
    } else if (domain.includes('bloomberg.')) {
      return this.extractBloomberg();
    } else if (domain.includes('allrecipes.')) {
      return this.extractRecipe();
    } else if (domain.includes('wikipedia.')) {
      return this.extractWikipedia();
    }
    return {};
  }
  
  extractAmazon() {
    return {
      price: DataCleaner.normalizePrice(
        this.getTextContent(['.a-price-whole', '.a-offscreen', '#priceblock_ourprice'])
      ),
      rating: this.getTextContent(['.a-icon-alt', '[data-hook="rating-out-of-text"]']),
      reviews: this.getTextContent(['#acrCustomerReviewText'])
    };
  }
  
  extractBloomberg() {
    return {
      category: this.getTextContent(['meta[property="article:section"]', '.eyebrow']),
      publishDate: this.getAttr('time[datetime]', 'datetime') || 
                    this.getTextContent(['.timestamp', '.article-timestamp']),
      author: this.getTextContent(['.author', '.byline', 'meta[name="author"]'])
    };
  }
  
  extractRecipe() {
    return {
      cookTime: this.getTextContent(['.recipe-summary__item-data', '.total-time']),
      servings: this.getTextContent(['.recipe-adjust-servings__size-quantity']),
      ingredients: DataCleaner.cleanArray(
        Array.from(document.querySelectorAll('.recipe-ingredient, .ingredients li'))
          .map(el => el.textContent)
      ),
      instructions: DataCleaner.cleanArray(
        Array.from(document.querySelectorAll('.recipe-instruction, .instructions li'))
          .map(el => el.textContent)
      )
    };
  }
  
  extractWikipedia() {
    return {
      categories: DataCleaner.cleanArray(
        Array.from(document.querySelectorAll('#mw-normal-catlinks ul li a'))
          .map(a => a.textContent)
      ),
      lastModified: this.getTextContent(['#footer-info-lastmod'])
    };
  }
  
  getTextContent(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent || element.content || '';
        if (text.trim()) return DataCleaner.cleanText(text);
      }
    }
    return null;
  }
  
  getAttr(selector, attr) {
    const element = document.querySelector(selector);
    return element ? element.getAttribute(attr) : null;
  }
}

// ============================================================================
// MESSAGE LISTENER
// ============================================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[WebWeaver] Message received:', request.action);
  
  try {
    if (request.action === 'extractBasic') {
      const extractor = new BasicExtractor();
      const data = extractor.extract();
      sendResponse({ success: true, data });
    } else if (request.action === 'ping') {
      sendResponse({ success: true, message: 'Content script ready' });
    } else {
      sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('[WebWeaver] Error:', error);
    sendResponse({ success: false, error: error.message });
  }
  
  return true; // Keep channel open
});

// ============================================================================
// INITIALIZATION
// ============================================================================

console.log('[WebWeaver] ✅ Ready to extract data');
