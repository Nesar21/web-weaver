// ═════════════════════════════════════════════════════════════════
// CONTENT SCRIPT - ENHANCED WITH DAY 12 FIX #2
// Version: 3.0.0 (FIX #2: Medium Single-Article Detection)
// ═════════════════════════════════════════════════════════════════

console.log('[Content] 🚀 Content script v3.0 with FIX #2 loading...');

// ═══════════════════════════════════════════════════════════════
// 🔧 FIX #2: ENHANCED CLASSIFIER WITH MAIN CONTENT DETECTION
// Prioritizes main <article> content over sidebar noise
// ═══════════════════════════════════════════════════════════════

function classifyPageLayout() {
  console.log('[Classifier] 🛂 LAYER 1: DOM Classification starting...');
  const startTime = performance.now();

  try {
    const signals = {
      articleCount: document.querySelectorAll('article').length,
      h1Count: document.querySelectorAll('h1').length,
      mainCount: document.querySelectorAll('main').length,
      wordCount: 0,
      repeatingPatterns: 0,
      hasHomepageIndicators: false,
      hasLoginIndicators: false
    };

    const bodyText = document.body?.textContent?.trim() || '';
    signals.wordCount = bodyText.split(/\s+/).length;

    // ========================================
    // 🔧 FIX #2: DETECT MAIN CONTENT AREA FIRST (NEW!)
    // This runs BEFORE repeated block detection to prioritize main content
    // ========================================
    
    // Check for main content container (article, main, [role="main"])
    const mainContent = document.querySelector('article, main, [role="main"], [data-testid="storyContent"], [data-testid="article-body"]');
    const sidebar = document.querySelector('aside, [class*="sidebar"], [class*="recommend"], [data-testid="aside"]');
    
    // If we have a clear main article with ONE H1, prioritize that
    if (mainContent) {
      const mainH1s = mainContent.querySelectorAll('h1');
      const mainWordCount = (mainContent.textContent || '').trim().split(/\s+/).length;
      
      if (mainH1s.length === 1 && mainWordCount > 300) {
        console.log('[Content] ✅ FIX #2: Detected SINGLE article in main content area');
        console.log('[Content] Main content word count:', mainWordCount);
        console.log('[Content] Ignoring sidebar recommendations');
        
        // Log sidebar blocks if present (for debugging)
        if (sidebar) {
          const sidebarBlocks = sidebar.querySelectorAll('[class*="card"], [class*="item"], article');
          console.log('[Content] Found', sidebarBlocks.length, 'blocks in sidebar (ignored)');
        }
        
        const duration = performance.now() - startTime;
        
        // Return early with SINGLE_ITEM classification
        return {
          classification: 'SINGLE_ITEM',
          confidence: 95,
          signals: {
            ...signals,
            mainContentDetected: true,
            sidebarIgnored: sidebar ? true : false,
            mainContentWordCount: mainWordCount
          },
          reasoning: 'Main article content detected (1 H1, 300+ words) - sidebar ignored',
          method: 'dom-heuristic-enhanced',
          duration: Math.round(duration),
          detectedBlocksCount: 0,  // Sidebar blocks don't count
          detectedElements: []
        };
      }
    }

    // ========================================
    // ORIGINAL LOGIC: Repeated Block Detection
    // (Only runs if main content check didn't trigger)
    // ========================================
    
    // Amazon-specific selectors + generic selectors
    const repeatingSelectors = [
      // Generic selectors
      '.product-card', '.product-item', '.post-card', '.post-preview',
      '.listing-item', '.search-result', '.grid-item',
      '[data-component="product-card"]', '[data-testid="product-tile"]',
      
      // Amazon-specific selectors
      'div.s-main-slot div.s-result-item',
      'div[data-component-type="s-search-result"]',
      'div.sg-col-inner',
      '.s-result-item',
      'div[data-asin]',
      
      // eBay, Walmart, Target patterns
      '.s-item', '.product-tile', '[data-product-id]'
    ];

    // Inline repeated block detection
    let maxRepeatingBlocks = 0;
    const detectedBlocks = [];

    for (const selector of repeatingSelectors) {
      const elements = document.querySelectorAll(selector);
      const count = elements.length;
      
      if (count > 5) {
        signals.repeatingPatterns = Math.max(signals.repeatingPatterns, count);
        maxRepeatingBlocks = Math.max(maxRepeatingBlocks, count);
        
        // Store actual elements for later extraction
        elements.forEach(el => {
          if (el.innerText && el.innerText.length > 50) {
            detectedBlocks.push(el);
          }
        });
        
        console.log(`[Classifier] 🔍 Found ${count} items matching: ${selector}`);
      }
    }

    const bodyClass = document.body.className.toLowerCase();
    signals.hasHomepageIndicators =
      bodyClass.includes('homepage') || bodyClass.includes('home-page') ||
      bodyClass.includes('index') || window.location.pathname === '/' ||
      window.location.pathname === '/index.html';

    const title = document.title.toLowerCase();
    signals.hasLoginIndicators =
      title.includes('login') || title.includes('sign in') ||
      title.includes('error') || title.includes('404') ||
      title.includes('access denied') || signals.wordCount < 50;

    let classification = 'UNCERTAIN';
    let confidence = 50;
    let reasoning = '';

    // Classification logic
    if (signals.hasLoginIndicators) {
      classification = 'NONE';
      confidence = 100;
      reasoning = 'Login/error page or too few words';
    } 
    else if (maxRepeatingBlocks > 10) {
      classification = 'MULTI_ITEM';
      confidence = 98;
      reasoning = `Product grid detected (${maxRepeatingBlocks} items found)`;
    }
    else if (signals.articleCount > 3) {
      classification = 'MULTI_ITEM';
      confidence = 95;
      reasoning = `Multiple articles detected (${signals.articleCount})`;
    } 
    else if (signals.repeatingPatterns > 5) {
      classification = 'MULTI_ITEM';
      confidence = 95;
      reasoning = `Repeating patterns detected (${signals.repeatingPatterns} items)`;
    } 
    else if (signals.hasHomepageIndicators && signals.articleCount > 1) {
      classification = 'MULTI_ITEM';
      confidence = 90;
      reasoning = 'Homepage with multiple articles';
    } 
    else if (signals.articleCount === 1 && signals.h1Count === 1 && signals.wordCount > 500) {
      classification = 'SINGLE_ITEM';
      confidence = 100;
      reasoning = 'Single article with one H1, substantial content';
    } 
    else if (signals.mainCount === 1 && signals.h1Count === 1 && signals.wordCount > 300) {
      classification = 'SINGLE_ITEM';
      confidence = 95;
      reasoning = 'Single main content area with one H1';
    } 
    else if (signals.articleCount === 0 && signals.h1Count === 1 && signals.wordCount > 200) {
      if (maxRepeatingBlocks > 3) {
        classification = 'UNCERTAIN';
        confidence = 60;
        reasoning = `Single H1 but ${maxRepeatingBlocks} repeating blocks found - needs AI verification`;
      } else {
        classification = 'SINGLE_ITEM';
        confidence = 85;
        reasoning = 'Single H1 with substantial content';
      }
    } 
    else if (signals.articleCount > 0 && signals.repeatingPatterns > 0) {
      classification = 'UNCERTAIN';
      confidence = 60;
      reasoning = 'Mixed signals: articles AND repeating patterns';
    } 
    else if (signals.h1Count > 1 && signals.h1Count <= 3) {
      classification = 'UNCERTAIN';
      confidence = 55;
      reasoning = 'Multiple H1s (sections or multiple items?)';
    }

    const duration = performance.now() - startTime;
    const result = {
      classification,
      confidence,
      signals,
      reasoning,
      method: 'dom-heuristic',
      duration: Math.round(duration),
      detectedBlocksCount: maxRepeatingBlocks,
      detectedElements: detectedBlocks
    };

    console.log(`[Classifier] ✅ DOM: ${classification} (${confidence}%) in ${duration.toFixed(2)}ms`);
    console.log(`[Classifier] 💭 ${reasoning}`);
    
    if (maxRepeatingBlocks > 0) {
      console.log(`[Classifier] 🔢 Detected ${maxRepeatingBlocks} repeated blocks`);
    }

    return result;
  } catch (error) {
    console.error('[Classifier] ❌ Error:', error);
    return {
      classification: 'UNCERTAIN',
      confidence: 50,
      signals: {},
      reasoning: `Error: ${error.message}`,
      method: 'dom-heuristic',
      duration: 0,
      detectedBlocksCount: 0,
      detectedElements: []
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// EXTRACTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function extractPageData() {
  try {
    console.log('[Content] Extracting page data...');

    // Run classification with FIX #2
    const classification = classifyPageLayout();

    const pageData = {
      url: window.location.href,
      domain: window.location.hostname,
      title: document.title,
      mainText: document.body.innerText.substring(0, 5000),
      metaDescription: document.querySelector('meta[name="description"]')?.content || '',
      headings: Array.from(document.querySelectorAll('h1, h2, h3'))
        .map(h => h.textContent.trim())
        .filter(Boolean)
        .slice(0, 20),
      links: Array.from(document.querySelectorAll('a'))
        .map(a => ({ text: a.textContent.trim(), href: a.href }))
        .filter(l => l.text && l.href)
        .slice(0, 50),
      images: Array.from(document.querySelectorAll('img'))
        .map(img => ({ src: img.src, alt: img.alt }))
        .slice(0, 20),
      meta: {
        description: document.querySelector('meta[name="description"]')?.content || '',
        keywords: document.querySelector('meta[name="keywords"]')?.content || '',
        author: document.querySelector('meta[name="author"]')?.content || ''
      },

      // Classification data (includes FIX #2 enhancements)
      pageLayout: classification.classification,
      classificationConfidence: classification.confidence,
      classificationSignals: classification.signals,
      classificationReasoning: classification.reasoning,
      classificationDuration: classification.duration,
      
      // DOM details
      domDetails: {
        repeatedBlocksCount: classification.detectedBlocksCount,
        productGridFound: classification.detectedBlocksCount > 3,
        mainContentDetected: classification.signals.mainContentDetected || false,
        sidebarIgnored: classification.signals.sidebarIgnored || false
      }
    };

    console.log('[Content] ✅ Page data extracted with FIX #2 classification');
    console.log(`[Content] 📊 Page classified as: ${classification.classification}`);
    console.log(`[Content] 🔢 Repeated blocks: ${classification.detectedBlocksCount}`);
    
    if (classification.signals.mainContentDetected) {
      console.log('[Content] 🎯 FIX #2: Main content prioritized over sidebar');
    }

    return pageData;
  } catch (error) {
    console.error('[Content] ❌ Extraction failed:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE LISTENER (HANDLES BOTH STANDARD AND HYBRID)
// ═══════════════════════════════════════════════════════════════

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Content] Message received:', request.action);

  try {
    if (request.action === 'extractPageData') {
      // Standard extraction
      const data = extractPageData();
      sendResponse({ success: true, data });
    }

    else if (request.action === 'getPageData') {
      // v3.0 compatibility (same as extractPageData)
      console.log('[Content] getPageData requested');
      const data = extractPageData();
      sendResponse({ success: true, data });
    }

    else if (request.action === 'extractWithHybrid') {
      // Hybrid extraction
      console.log('[Content] 🔥 Hybrid extraction requested');
      const data = extractPageData();
      sendResponse({ success: true, data });
    }

    else if (request.action === 'extractProductBlocks') {
      // Extract product blocks text for AI layer fallback
      const productBlocks = detectRepeatedProductBlocks();
      const blocksText = productBlocks.map(block => ({
        text: block.innerText.trim().substring(0, 1000)
      }));
      sendResponse(blocksText);
    }

    else {
      console.warn('[Content] ⚠️ Unknown action:', request.action);
      sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('[Content] ❌ Message handler error:', error);
    sendResponse({ success: false, error: error.message });
  }

  return true; // Keep message channel open for async response
});

// ═══════════════════════════════════════════════════════════════
// HEURISTIC TO DETECT REPEATED BLOCKS (E.G. PRODUCTS)
// Returns array of DOM elements detected as product blocks
// ═══════════════════════════════════════════════════════════════

function detectRepeatedProductBlocks() {
  const candidates = [];
  const potentialProductSelectors = [
    // Amazon selectors (highest priority)
    'div.s-main-slot div.s-result-item',
    'div[data-component-type="s-search-result"]',
    'div[data-asin]',
    '.s-result-item',
    
    // Generic e-commerce
    '.product',
    '.product-item',
    '.grid-item',
    '.carousel-item',
    '.product-card',
    '.item',
  ];

  potentialProductSelectors.forEach(selector => {
    const elems = [...document.querySelectorAll(selector)];
    elems.forEach(el => {
      if (el.innerText && el.innerText.length > 50) {
        candidates.push(el);
      }
    });
  });

  console.log(`[Content] 🔍 detectRepeatedProductBlocks found ${candidates.length} candidates`);
  return candidates;
}

console.log('[Content] ✅ Content script v3.0 with FIX #2 ready!');
console.log('[Content] 🔧 FIX #2: Enhanced Medium single-article detection enabled');
