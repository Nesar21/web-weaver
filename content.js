// ═════════════════════════════════════════════════════════════════
// CONTENT SCRIPT - VERSION 3.1.0 UNIVERSAL MULTI-ITEM EXTRACTION
// FIX #2: Medium Single-Article Detection
// FIX #3: Universal Multi-Item Extraction for ANY Site
// ═════════════════════════════════════════════════════════════════

console.log('[Content] 🚀 Content script v3.1 with Universal Multi-Item Extraction loading...');

// ═══════════════════════════════════════════════════════════════
// 🔧 UNIVERSAL CLASSIFIER WITH MAIN CONTENT DETECTION
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
      hasLoginIndicators: false,
      hasSocialFeedIndicators: false
    };

    const bodyText = document.body?.textContent?.trim() || '';
    signals.wordCount = bodyText.split(/\s+/).length;

    // ========================================
    // 🔧 FIX #2: DETECT MAIN CONTENT AREA FIRST
    // This runs BEFORE repeated block detection to prioritize main content
    // ========================================
    
    const mainContent = document.querySelector('article, main, [role="main"], [data-testid="storyContent"], [data-testid="article-body"]');
    const sidebar = document.querySelector('aside, [class*="sidebar"], [class*="recommend"], [data-testid="aside"]');
    
    if (mainContent) {
      const mainH1s = mainContent.querySelectorAll('h1');
      const mainWordCount = (mainContent.textContent || '').trim().split(/\s+/).length;
      
      if (mainH1s.length === 1 && mainWordCount > 300) {
        console.log('[Content] ✅ FIX #2: Detected SINGLE article in main content area');
        console.log('[Content] Main content word count:', mainWordCount);
        console.log('[Content] Ignoring sidebar recommendations');
        
        if (sidebar) {
          const sidebarBlocks = sidebar.querySelectorAll('[class*="card"], [class*="item"], article');
          console.log('[Content] Found', sidebarBlocks.length, 'blocks in sidebar (ignored)');
        }
        
        const duration = performance.now() - startTime;
        
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
          detectedBlocksCount: 0,
          detectedElements: []
        };
      }
    }

    // ========================================
    // 🔧 FIX #3: UNIVERSAL MULTI-ITEM DETECTION
    // Detects ANY listing page on ANY website
    // ========================================
    
    // Social feed detection
    const urlPath = window.location.pathname.toLowerCase();
    signals.hasSocialFeedIndicators = 
      urlPath.includes('/feed') ||
      urlPath.includes('/timeline') ||
      urlPath.includes('/activity') ||
      document.querySelector('[data-pagelet*="Feed"]') !== null;

    // Universal repeating pattern selectors
    const repeatingSelectors = [
      // Social Media (LinkedIn, Twitter, Facebook, Instagram)
      '.feed-shared-update-v2', '[data-testid="tweet"]', '[data-testid="post"]',
      '[role="article"]', '.post', '.feed-item', '.update', '.stream-item',
      '[data-post-id]', '[class*="feed-update"]', '[class*="post-container"]',
      
      // E-commerce (Amazon, eBay, Walmart, etc.)
      '.product-card', '.product-item', '.s-result-item', '[data-asin]',
      '[data-component-type="s-search-result"]', '.product', '[data-product-id]',
      
      // Blog/News
      '.post-card', '.post-preview', '.article-preview', '.article-item',
      'article', '.story-card', '.news-item',
      
      // Generic patterns
      '.grid-item', '.list-item', '.card', '.tile', '.listing-item',
      '.search-result', '[class*="item-card"]', '[class*="list-item"]'
    ];

    // Detect repeating patterns
    let maxRepeatingBlocks = 0;
    const detectedBlocks = [];
    let matchedSelector = null;

    for (const selector of repeatingSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        const count = elements.length;
        
        // Lower threshold for social feeds, higher for others
        const threshold = signals.hasSocialFeedIndicators ? 2 : 3;
        
        if (count >= threshold) {
          const validElements = Array.from(elements).filter(el => {
            const text = el.innerText || '';
            return text.length > 50; // Must have meaningful content
          });
          
          if (validElements.length >= threshold) {
            signals.repeatingPatterns = Math.max(signals.repeatingPatterns, validElements.length);
            maxRepeatingBlocks = Math.max(maxRepeatingBlocks, validElements.length);
            
            if (validElements.length > detectedBlocks.length) {
              detectedBlocks.length = 0; // Clear previous
              validElements.forEach(el => detectedBlocks.push(el));
              matchedSelector = selector;
            }
            
            console.log(`[Classifier] 🔍 Found ${validElements.length} valid items: ${selector}`);
          }
        }
      } catch (e) {
        continue;
      }
    }

    // Check for homepage
    const bodyClass = document.body.className.toLowerCase();
    signals.hasHomepageIndicators =
      bodyClass.includes('homepage') || bodyClass.includes('home-page') ||
      bodyClass.includes('index') || urlPath === '/' || urlPath === '/index.html';

    // Check for login/error
    const title = document.title.toLowerCase();
    signals.hasLoginIndicators =
      title.includes('login') || title.includes('sign in') ||
      title.includes('error') || title.includes('404') ||
      title.includes('access denied') || signals.wordCount < 50;

    // ========================================
    // CLASSIFICATION LOGIC WITH PRIORITIES
    // ========================================

    let classification = 'UNCERTAIN';
    let confidence = 50;
    let reasoning = '';

    // NONE Detection
    if (signals.hasLoginIndicators) {
      classification = 'NONE';
      confidence = 100;
      reasoning = 'Login/error page or insufficient content';
    }
    // Social Feed Detection (HIGH PRIORITY)
    else if (signals.hasSocialFeedIndicators && maxRepeatingBlocks >= 2) {
      classification = 'MULTI_ITEM';
      confidence = 98;
      reasoning = `Social feed detected (${maxRepeatingBlocks} posts using ${matchedSelector})`;
    }
    // Strong Product Grid
    else if (maxRepeatingBlocks >= 10) {
      classification = 'MULTI_ITEM';
      confidence = 98;
      reasoning = `Product grid detected (${maxRepeatingBlocks} items using ${matchedSelector})`;
    }
    // Clear Multi-Item Patterns
    else if (maxRepeatingBlocks >= 5) {
      classification = 'MULTI_ITEM';
      confidence = 95;
      reasoning = `Repeating pattern detected (${maxRepeatingBlocks} items using ${matchedSelector})`;
    }
    // Multiple Articles
    else if (signals.articleCount > 3) {
      classification = 'MULTI_ITEM';
      confidence = 95;
      reasoning = `Multiple articles detected (${signals.articleCount})`;
    }
    // Homepage with Multiple Items
    else if (signals.hasHomepageIndicators && signals.articleCount >= 2) {
      classification = 'MULTI_ITEM';
      confidence = 90;
      reasoning = 'Homepage with multiple content items';
    }
    // Weaker Multi-Item Signals
    else if (maxRepeatingBlocks >= 3) {
      classification = 'MULTI_ITEM';
      confidence = 85;
      reasoning = `Moderate pattern detected (${maxRepeatingBlocks} items using ${matchedSelector})`;
    }
    // Single Article (Strong)
    else if (signals.articleCount === 1 && signals.h1Count === 1 && signals.wordCount > 500) {
      classification = 'SINGLE_ITEM';
      confidence = 100;
      reasoning = 'Single article with substantial content';
    }
    // Single Main Content
    else if (signals.mainCount === 1 && signals.h1Count === 1 && signals.wordCount > 300) {
      classification = 'SINGLE_ITEM';
      confidence = 95;
      reasoning = 'Single main content area with one H1';
    }
    // Single H1 with Content
    else if (signals.h1Count === 1 && signals.wordCount > 400 && maxRepeatingBlocks === 0) {
      classification = 'SINGLE_ITEM';
      confidence = 90;
      reasoning = 'Single H1 with substantial content, no repeating patterns';
    }
    // Uncertain Cases
    else if (signals.articleCount > 0 && maxRepeatingBlocks > 0 && maxRepeatingBlocks < 3) {
      classification = 'UNCERTAIN';
      confidence = 60;
      reasoning = 'Mixed signals: articles AND weak patterns';
    }
    else if (signals.h1Count > 1 && signals.h1Count <= 4) {
      classification = 'UNCERTAIN';
      confidence = 55;
      reasoning = `Multiple H1s (${signals.h1Count}) - could be sections or items`;
    }
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
      detectedBlocksCount: maxRepeatingBlocks,
      detectedElements: detectedBlocks,
      matchedSelector: matchedSelector
    };

    console.log(`[Classifier] ✅ DOM: ${classification} (${confidence}%) in ${duration.toFixed(2)}ms`);
    console.log(`[Classifier] 💭 ${reasoning}`);
    
    if (maxRepeatingBlocks > 0) {
      console.log(`[Classifier] 🔢 Detected ${maxRepeatingBlocks} repeated blocks using: ${matchedSelector}`);
    }

    return result;
  } catch (error) {
    console.error('[Classifier] ❌ Error:', error);
    return {
      classification: 'UNCERTAIN',
      confidence: 50,
      signals: {},
      reasoning: `Error: ${error.message}`,
      method: 'universal-dom-heuristic',
      duration: 0,
      detectedBlocksCount: 0,
      detectedElements: [],
      matchedSelector: null
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// 🔧 FIX #3: EXTRACT MULTIPLE ITEMS FUNCTION
// Extracts individual items from MULTI_ITEM pages
// ═══════════════════════════════════════════════════════════════

function extractMultipleItems(classification) {
  console.log('[Content] 🔄 Extracting multiple items...');
  
  if (classification.classification !== 'MULTI_ITEM') {
    console.log('[Content] ⚠️ Not a MULTI_ITEM page, skipping');
    return null;
  }
  
  // Use detected elements from classification
  const elements = classification.detectedElements || [];
  
  if (elements.length < 2) {
    console.log('[Content] ⚠️ No detected elements found, fallback to manual search');
    
    // Fallback: Try to find items manually
    const fallbackSelectors = [
      '.feed-shared-update-v2', '[data-testid="tweet"]', '[role="article"]',
      '.product-card', '.s-result-item', '[data-asin]',
      'article', '.post-card', '.grid-item'
    ];
    
    for (const selector of fallbackSelectors) {
      const items = document.querySelectorAll(selector);
      if (items.length >= 2) {
        items.forEach(el => elements.push(el));
        break;
      }
    }
  }
  
  if (elements.length < 2) {
    console.log('[Content] ❌ Could not find multiple items');
    return null;
  }
  
  const extractedItems = [];
  const maxItems = 10; // Limit to prevent performance issues
  
  for (let i = 0; i < Math.min(elements.length, maxItems); i++) {
    const el = elements[i];
    
    try {
      const text = el.innerText?.trim() || '';
      const html = el.outerHTML;
      
      if (text.length > 50) { // Valid item
        extractedItems.push({
          index: i + 1,
          text: text.substring(0, 2000), // Limit size
          html: html.substring(0, 5000),  // Limit size
          selector: classification.matchedSelector || 'unknown'
        });
      }
    } catch (e) {
      console.warn(`[Content] ⚠️ Failed to extract item ${i}:`, e.message);
      continue;
    }
  }
  
  console.log(`[Content] ✅ Extracted ${extractedItems.length} items successfully`);
  return extractedItems.length >= 2 ? extractedItems : null;
}

// ═══════════════════════════════════════════════════════════════
// EXTRACTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function extractPageData() {
  try {
    console.log('[Content] Extracting page data...');

    // Run classification
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

      // Classification data
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
        sidebarIgnored: classification.signals.sidebarIgnored || false,
        matchedSelector: classification.matchedSelector || null
      }
    };

    // 🔧 FIX #3: Extract individual items for MULTI_ITEM pages
    if (classification.classification === 'MULTI_ITEM') {
      const items = extractMultipleItems(classification);
      if (items && items.length >= 2) {
        pageData.extractedItems = items;
        pageData.itemCount = items.length;
        console.log(`[Content] ✅ Added ${items.length} extracted items to page data`);
      } else {
        console.log('[Content] ⚠️ MULTI_ITEM page but could not extract individual items');
      }
    }

    console.log('[Content] ✅ Page data extracted with v3.1 enhancements');
    console.log(`[Content] 📊 Page classified as: ${classification.classification}`);
    console.log(`[Content] 🔢 Repeated blocks: ${classification.detectedBlocksCount}`);
    
    if (pageData.extractedItems) {
      console.log(`[Content] 📦 Extracted ${pageData.itemCount} individual items`);
    }

    return pageData;
  } catch (error) {
    console.error('[Content] ❌ Extraction failed:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE LISTENER
// ═══════════════════════════════════════════════════════════════

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Content] Message received:', request.action);

  try {
    if (request.action === 'extractPageData' || request.action === 'getPageData') {
      const data = extractPageData();
      sendResponse({ success: true, data });
    }

    else if (request.action === 'extractWithHybrid') {
      console.log('[Content] 🔥 Hybrid extraction requested');
      const data = extractPageData();
      sendResponse({ success: true, data });
    }

    else if (request.action === 'extractProductBlocks') {
      // Legacy compatibility - extract detectedElements
      const classification = classifyPageLayout();
      const items = extractMultipleItems(classification);
      const blocksText = items ? items.map(item => ({ text: item.text })) : [];
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

  return true; // Keep message channel open
});

// ═══════════════════════════════════════════════════════════════
// LEGACY COMPATIBILITY
// ═══════════════════════════════════════════════════════════════

function detectRepeatedProductBlocks() {
  console.log('[Content] 🔄 detectRepeatedProductBlocks (legacy) called');
  const classification = classifyPageLayout();
  return classification.detectedElements || [];
}

console.log('[Content] ✅ Content script v3.1 ready!');
console.log('[Content] 🔧 FIX #2: Enhanced Medium single-article detection enabled');
console.log('[Content] 🔧 FIX #3: Universal Multi-Item Extraction enabled');
