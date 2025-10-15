// ═════════════════════════════════════════════════════════════════
// DAY 10 UNIVERSAL CLASSIFIER - WORKS ON ANY SITE
// DOM Heuristics (Fast) → Pattern Recognition (Smart) → AI Fallback
// Handles: E-commerce, Social Media, Blogs, News, Any Website
// ═════════════════════════════════════════════════════════════════

console.log('[Classifier] 🎯 Universal Classifier v3.1 loading...');

/**
 * LAYER 1: UNIVERSAL DOM-BASED CLASSIFIER
 * Fast, free, local structural analysis
 * Works on ANY website - not limited to specific sites
 * Returns: SINGLE_ITEM | MULTI_ITEM | UNCERTAIN
 */
function classifyPageLayout() {
  console.log('[Classifier] 🛂 LAYER 1: Universal Classification starting...');
  const startTime = performance.now();

  try {
    const signals = {
      // Core HTML structure
      articleCount: document.querySelectorAll('article').length,
      h1Count: document.querySelectorAll('h1').length,
      h2Count: document.querySelectorAll('h2').length,
      mainCount: document.querySelectorAll('main').length,
      sectionCount: document.querySelectorAll('section').length,
      
      // Content metrics
      wordCount: 0,
      linkDensity: 0,
      
      // Pattern detection
      repeatingPatterns: 0,
      repeatingGroups: [],
      
      // Context indicators
      hasHomepageIndicators: false,
      hasLoginIndicators: false,
      hasSocialFeedIndicators: false,
      hasSearchResultIndicators: false,
      
      // URL analysis
      urlPath: window.location.pathname,
      urlParams: new URLSearchParams(window.location.search)
    };

    // ══════════════════════════════════════════════════════════════
    // CONTENT ANALYSIS
    // ══════════════════════════════════════════════════════════════
    
    const bodyText = document.body?.textContent?.trim() || '';
    signals.wordCount = bodyText.split(/\s+/).length;
    
    const linkCount = document.querySelectorAll('a').length;
    signals.linkDensity = signals.wordCount > 0 ? linkCount / signals.wordCount : 0;

    // ══════════════════════════════════════════════════════════════
    // UNIVERSAL PATTERN DETECTION
    // ══════════════════════════════════════════════════════════════
    
    const repeatingSelectors = [
      // E-commerce patterns
      '.product-card', '.product-item', '.product', '[data-product]',
      '[data-component="product-card"]', '[data-testid="product-tile"]',
      '[class*="product"]', '[id*="product"]',
      
      // Blog/Article patterns
      '.post-card', '.post-item', '.post-preview', '.article-preview',
      '.article-item', '.article-card', '[data-post]', '[data-article]',
      '[class*="post-card"]', '[class*="article"]',
      
      // Social Media patterns (LinkedIn, Twitter, Facebook, Instagram)
      '.feed-shared-update-v2', '[data-testid="tweet"]', '[data-testid="post"]',
      '[role="article"]', '.post', '.feed-item', '.update', '.stream-item',
      '[data-post-id]', '[class*="feed-update"]', '[class*="post-container"]',
      '.timeline-item', '[class*="story"]', '[class*="status-update"]',
      
      // Search result patterns
      '.search-result', '.result-item', '.listing-item', '.listing',
      '[data-search-result]', '[class*="search-result"]',
      
      // Generic listing patterns
      '.grid-item', '.list-item', '.card', '.tile', '.entry',
      '[class*="item-card"]', '[class*="list-item"]', '[class*="grid-item"]',
      
      // News/Magazine patterns
      '.story-card', '.headline', '.news-item', '[data-story]',
      '.media-card', '[class*="story"]',
      
      // Flexible semantic patterns
      '[itemtype*="Product"]', '[itemtype*="Article"]',
      '[itemtype*="BlogPosting"]', '[itemtype*="NewsArticle"]'
    ];

    // Count repeating patterns and track which ones
    for (const selector of repeatingSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        const count = elements.length;
        
        if (count >= 2) { // Lower threshold for any pattern
          signals.repeatingGroups.push({ selector, count });
          signals.repeatingPatterns = Math.max(signals.repeatingPatterns, count);
        }
      } catch (e) {
        // Skip invalid selectors
        continue;
      }
    }

    // Advanced pattern: Check for repeated sibling structures
    const checkRepeatedSiblings = () => {
      const potentialContainers = document.querySelectorAll('main, [role="main"], .container, #content, .content');
      
      for (const container of potentialContainers) {
        const children = Array.from(container.children);
        if (children.length < 2) continue;
        
        // Look for repeated class patterns
        const classCounts = {};
        children.forEach(child => {
          const classList = Array.from(child.classList).join(' ');
          if (classList) {
            classCounts[classList] = (classCounts[classList] || 0) + 1;
          }
        });
        
        // Check if we have repeated structures
        for (const [className, count] of Object.entries(classCounts)) {
          if (count >= 3) { // At least 3 repeated siblings
            signals.repeatingGroups.push({ 
              selector: `Repeated siblings: .${className.split(' ')[0]}`, 
              count 
            });
            signals.repeatingPatterns = Math.max(signals.repeatingPatterns, count);
          }
        }
      }
    };
    
    checkRepeatedSiblings();

    // ══════════════════════════════════════════════════════════════
    // URL-BASED CONTEXT DETECTION
    // ══════════════════════════════════════════════════════════════
    
    const urlPath = signals.urlPath.toLowerCase();
    const urlFull = window.location.href.toLowerCase();
    
    // Homepage detection
    signals.hasHomepageIndicators = 
      urlPath === '/' || 
      urlPath === '/index' ||
      urlPath === '/index.html' ||
      urlPath === '/home' ||
      urlPath.endsWith('/') && urlPath.split('/').length <= 2 ||
      document.body.className.toLowerCase().includes('home') ||
      document.title.toLowerCase().includes('home');

    // Social feed detection
    signals.hasSocialFeedIndicators = 
      urlPath.includes('/feed') ||
      urlPath.includes('/timeline') ||
      urlPath.includes('/activity') ||
      urlPath.includes('/updates') ||
      urlFull.includes('/feed/') ||
      document.querySelector('[data-pagelet*="Feed"]') !== null ||
      document.querySelector('[aria-label*="Feed"]') !== null;

    // Search results detection
    signals.hasSearchResultIndicators = 
      urlPath.includes('/search') ||
      urlPath.includes('/results') ||
      signals.urlParams.has('q') ||
      signals.urlParams.has('query') ||
      signals.urlParams.has('search') ||
      signals.urlParams.has('s') ||
      document.querySelector('[role="search"]') !== null;

    // Login/Error detection
    const title = document.title.toLowerCase();
    const bodyClass = document.body.className.toLowerCase();
    signals.hasLoginIndicators = 
      title.includes('login') || 
      title.includes('sign in') ||
      title.includes('error') || 
      title.includes('404') ||
      title.includes('403') ||
      title.includes('access denied') ||
      bodyClass.includes('error') ||
      bodyClass.includes('login') ||
      signals.wordCount < 50;

    // ══════════════════════════════════════════════════════════════
    // INTELLIGENT CLASSIFICATION LOGIC
    // Priority: Context > Patterns > Structure > Content
    // ══════════════════════════════════════════════════════════════

    let classification = 'UNCERTAIN';
    let confidence = 50;
    let reasoning = '';

    // ═══ PRIORITY 1: NONE Detection (garbage/empty pages) ═══
    if (signals.hasLoginIndicators) {
      classification = 'NONE';
      confidence = 100;
      reasoning = 'Login/error page or insufficient content';
    }

    // ═══ PRIORITY 2: MULTI_ITEM Detection (Context-driven) ═══
    
    // Social feeds (high confidence)
    else if (signals.hasSocialFeedIndicators && signals.repeatingPatterns >= 2) {
      classification = 'MULTI_ITEM';
      confidence = 98;
      reasoning = `Social feed detected (${signals.repeatingPatterns} posts)`;
    }
    // Search results (high confidence)
    else if (signals.hasSearchResultIndicators && signals.repeatingPatterns >= 2) {
      classification = 'MULTI_ITEM';
      confidence = 98;
      reasoning = `Search results detected (${signals.repeatingPatterns} results)`;
    }
    // Homepage with clear patterns
    else if (signals.hasHomepageIndicators && signals.repeatingPatterns >= 3) {
      classification = 'MULTI_ITEM';
      confidence = 95;
      reasoning = `Homepage with ${signals.repeatingPatterns} items`;
    }
    // Strong repeating patterns (universal detection)
    else if (signals.repeatingPatterns >= 5) {
      classification = 'MULTI_ITEM';
      confidence = 95;
      const topPattern = signals.repeatingGroups.sort((a, b) => b.count - a.count)[0];
      reasoning = `Strong pattern detected: ${topPattern.selector} (${topPattern.count} items)`;
    }
    // Multiple articles (traditional blogs)
    else if (signals.articleCount >= 4) {
      classification = 'MULTI_ITEM';
      confidence = 95;
      reasoning = `Multiple articles detected (${signals.articleCount})`;
    }
    // Moderate patterns on homepage
    else if (signals.hasHomepageIndicators && signals.articleCount >= 2) {
      classification = 'MULTI_ITEM';
      confidence = 90;
      reasoning = 'Homepage with multiple content items';
    }
    // Weaker but clear patterns
    else if (signals.repeatingPatterns >= 3) {
      classification = 'MULTI_ITEM';
      confidence = 85;
      const topPattern = signals.repeatingGroups.sort((a, b) => b.count - a.count)[0];
      reasoning = `Repeating pattern: ${topPattern.selector} (${topPattern.count} items)`;
    }
    // Multiple H2s as section indicators (list pages)
    else if (signals.h2Count >= 5 && signals.wordCount > 1000) {
      classification = 'MULTI_ITEM';
      confidence = 80;
      reasoning = `Multiple sections detected (${signals.h2Count} H2 headings)`;
    }

    // ═══ PRIORITY 3: SINGLE_ITEM Detection ═══
    
    // Classic single article (strong confidence)
    else if (signals.articleCount === 1 && signals.h1Count === 1 && signals.wordCount > 500) {
      classification = 'SINGLE_ITEM';
      confidence = 100;
      reasoning = 'Single article with substantial content';
    }
    // Single main content area
    else if (signals.mainCount === 1 && signals.h1Count === 1 && signals.wordCount > 300) {
      classification = 'SINGLE_ITEM';
      confidence = 95;
      reasoning = 'Single main content area with one H1';
    }
    // Single content without semantic tags
    else if (signals.h1Count === 1 && signals.wordCount > 400 && signals.repeatingPatterns === 0) {
      classification = 'SINGLE_ITEM';
      confidence = 90;
      reasoning = 'Single H1 with substantial content, no repeating patterns';
    }
    // Product/detail page indicators
    else if (signals.h1Count === 1 && signals.wordCount > 200 && signals.linkDensity < 0.1) {
      classification = 'SINGLE_ITEM';
      confidence = 85;
      reasoning = 'Low link density suggests single focused content';
    }

    // ═══ PRIORITY 4: UNCERTAIN (needs AI analysis) ═══
    
    // Mixed signals
    else if (signals.articleCount > 0 && signals.repeatingPatterns > 0 && signals.repeatingPatterns < 3) {
      classification = 'UNCERTAIN';
      confidence = 60;
      reasoning = 'Mixed signals: has articles AND weak patterns';
    }
    // Multiple H1s (ambiguous)
    else if (signals.h1Count > 1 && signals.h1Count <= 4) {
      classification = 'UNCERTAIN';
      confidence = 55;
      reasoning = `Multiple H1s (${signals.h1Count}) - could be sections or items`;
    }
    // Default uncertain
    else {
      classification = 'UNCERTAIN';
      confidence = 50;
      reasoning = 'Unclear structure, needs semantic AI analysis';
    }

    const duration = performance.now() - startTime;

    const result = {
      classification,
      confidence,
      signals,
      reasoning,
      method: 'universal-dom-heuristic',
      duration: Math.round(duration),
      detectedPatterns: signals.repeatingGroups.slice(0, 3) // Top 3 patterns
    };

    console.log(`[Classifier] ✅ Classification: ${classification} (${confidence}% confident) in ${duration.toFixed(2)}ms`);
    console.log(`[Classifier] 📊 Signals:`, {
      articles: signals.articleCount,
      h1s: signals.h1Count,
      patterns: signals.repeatingPatterns,
      words: signals.wordCount,
      context: {
        homepage: signals.hasHomepageIndicators,
        social: signals.hasSocialFeedIndicators,
        search: signals.hasSearchResultIndicators
      }
    });
    console.log(`[Classifier] 💭 Reasoning: ${reasoning}`);
    
    if (signals.repeatingGroups.length > 0) {
      console.log(`[Classifier] 🎯 Top patterns:`, signals.repeatingGroups.slice(0, 3));
    }

    return result;

  } catch (error) {
    console.error('[Classifier] ❌ Classification failed:', error);
    return {
      classification: 'UNCERTAIN',
      confidence: 50,
      signals: {},
      reasoning: `Error: ${error.message}`,
      method: 'universal-dom-heuristic',
      duration: 0
    };
  }
}

// Export for use in content.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { classifyPageLayout };
}
