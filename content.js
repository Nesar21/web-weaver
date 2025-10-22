// ═══════════════════════════════════════════════════════════════
// WEB WEAVER CONTENT SCRIPT - v4.2.0 (Smart Defaults + Visual AI)
// Injected into every page for DOM analysis and extraction
// 🆕 v4.2: Added page type detection for smart defaults
// ✅ PRESERVED: External classifier, infinite scroll, screenshot capture
// ═══════════════════════════════════════════════════════════════

console.log('[Content] 🚀 Web Weaver Content Script v4.2.0 initializing...');

// ═══════════════════════════════════════════════════════════════
// INFINITE SCROLL DETECTION (PRESERVED FROM DAY 14)
// Handles Instagram, TikTok, Reddit, and other infinite feeds
// ═══════════════════════════════════════════════════════════════

function detectItemSelector() {
  console.log('[Scroll] 🔍 Auto-detecting item selector...');
  
  const selectorCandidates = [
    '.feed-shared-update-v2',
    '[data-testid="tweet"]',
    '[data-testid="post"]',
    '[role="article"]',
    '.timeline-item',
    'article',
    '[class*="DivItemContainerV2"]',
    '[class*="video-card"]',
    '[data-testid="post-container"]',
    '.Post',
    '.s-result-item',
    '.product-card',
    '[data-asin]',
    '.post', '.item', '.card', '.entry'
  ];
  
  for (const selector of selectorCandidates) {
    try {
      const elements = document.querySelectorAll(selector);
      if (elements.length >= 2) {
        console.log('[Scroll] Found selector:', selector, elements.length, 'items');
        return selector;
      }
    } catch (e) {
      continue;
    }
  }
  
  console.log('[Scroll] No standard selector found, using fallback');
  return 'article, .post, .item, [role="article"]';
}

async function scrollUntilNoNewItems(options = {}) {
  console.log('[Scroll] Starting infinite scroll detection...');
  
  const config = {
    maxScrolls: options.maxScrolls || 10,
    scrollDelay: options.scrollDelay || 1000,
    itemSelector: options.itemSelector || detectItemSelector(),
    onProgress: options.onProgress || (() => {}),
    noChangeThreshold: 2
  };
  
  let prevCount = 0;
  let scrollCount = 0;
  let noChangeCount = 0;
  let scrolledToBottom = false;
  
  console.log('[Scroll] Configuration:', config);
  
  const getItemCount = () => {
    try {
      return document.querySelectorAll(config.itemSelector).length;
    } catch (e) {
      console.warn('[Scroll] Invalid selector:', e.message);
      return 0;
    }
  };
  
  const isAtBottom = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    return (scrollY + windowHeight >= documentHeight - 100);
  };
  
  const scrollDown = () => {
    const scrollHeight = window.innerHeight * 0.8;
    window.scrollBy({ top: scrollHeight, behavior: 'smooth' });
  };
  
  const waitForNewContent = (timeoutMs = 3000) => {
    return new Promise((resolve) => {
      const startCount = getItemCount();
      let resolved = false;
      
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          observer.disconnect();
          resolve({ newItems: false, count: getItemCount() });
        }
      }, timeoutMs);
      
      const observer = new MutationObserver((mutations) => {
        const currentCount = getItemCount();
        if (currentCount > startCount && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          observer.disconnect();
          console.log('[Scroll] New items loaded:', startCount, '→', currentCount);
          resolve({ newItems: true, count: currentCount });
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  };
  
  prevCount = getItemCount();
  console.log('[Scroll] Initial item count:', prevCount);
  
  while (scrollCount < config.maxScrolls) {
    scrollDown();
    scrollCount++;
    console.log('[Scroll] Scroll', scrollCount, '/', config.maxScrolls);
    
    const result = await waitForNewContent(config.scrollDelay);
    const currentCount = result.count;
    
    config.onProgress(scrollCount, currentCount);
    
    scrolledToBottom = isAtBottom();
    
    if (currentCount === prevCount) {
      noChangeCount++;
      console.log('[Scroll] No new items detected', noChangeCount, '/', config.noChangeThreshold);
      
      if (noChangeCount >= config.noChangeThreshold) {
        console.log('[Scroll] No new items for multiple scrolls, stopping');
        break;
      }
      
      if (scrolledToBottom) {
        console.log('[Scroll] Reached bottom of page, stopping');
        break;
      }
    } else {
      noChangeCount = 0;
      console.log('[Scroll] Items increased:', prevCount, '→', currentCount, '+', currentCount - prevCount);
    }
    
    prevCount = currentCount;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  const items = Array.from(document.querySelectorAll(config.itemSelector));
  
  console.log('[Scroll] Scroll complete:', {
    totalItems: items.length,
    scrollCount,
    reachedBottom: scrolledToBottom
  });
  
  return {
    itemCount: items.length,
    scrollCount,
    items,
    reachedBottom: scrolledToBottom,
    selector: config.itemSelector
  };
}

function isInfiniteScrollSite() {
  const url = window.location.href.toLowerCase();
  const infiniteScrollDomains = [
    'instagram.com',
    'tiktok.com',
    'reddit.com',
    'twitter.com',
    'x.com',
    'facebook.com',
    'linkedin.com/feed',
    'tumblr.com',
    'pinterest.com'
  ];
  
  return infiniteScrollDomains.some(domain => url.includes(domain));
}

// ═══════════════════════════════════════════════════════════════
// 🆕 v4.2: PAGE TYPE DETECTION FOR SMART DEFAULTS
// ═══════════════════════════════════════════════════════════════

function detectPageType() {
  console.log('[Content] 🎯 Detecting page type for smart defaults...');
  
  const html = document.documentElement.outerHTML.toLowerCase();
  const bodyText = document.body.innerText.toLowerCase();
  const url = window.location.href.toLowerCase();
  
  // E-commerce detection
  const ecommerceSignals = {
    priceElements: document.querySelectorAll('[class*="price"], [data-price]').length,
    cartButtons: bodyText.includes('add to cart') || bodyText.includes('buy now'),
    productGrids: document.querySelectorAll('[class*="product"], [data-product]').length,
    ratingStars: document.querySelectorAll('[class*="star"], [class*="rating"]').length
  };
  
  const ecommerceScore = 
    (ecommerceSignals.priceElements > 3 ? 3 : 0) +
    (ecommerceSignals.cartButtons ? 2 : 0) +
    (ecommerceSignals.productGrids > 3 ? 3 : 0) +
    (ecommerceSignals.ratingStars > 2 ? 2 : 0);
  
  if (ecommerceScore >= 5) {
    console.log('[Content] ✅ Page type: E-Commerce (score:', ecommerceScore, ')');
    return {
      type: 'e-commerce',
      confidence: Math.min(ecommerceScore * 10, 100),
      signals: ecommerceSignals,
      suggestedMode: 'balanced',
      suggestedCategory: 'products',
      deduplication: true,
      translation: false,
      summarization: false
    };
  }
  
  // News/Article detection
  const newsSignals = {
    articleElements: document.querySelectorAll('article, [role="article"]').length,
    authorMeta: document.querySelector('meta[name="author"]') !== null,
    publishDate: html.includes('published') || html.includes('publish date'),
    headlineElements: document.querySelectorAll('h1, h2').length,
    byline: bodyText.includes('by ') && (bodyText.includes('author') || bodyText.includes('journalist'))
  };
  
  const newsScore =
    (newsSignals.articleElements > 0 ? 3 : 0) +
    (newsSignals.authorMeta ? 2 : 0) +
    (newsSignals.publishDate ? 2 : 0) +
    (newsSignals.headlineElements > 2 ? 2 : 0) +
    (newsSignals.byline ? 1 : 0);
  
  if (newsScore >= 4) {
    console.log('[Content] ✅ Page type: News/Articles (score:', newsScore, ')');
    return {
      type: 'news',
      confidence: Math.min(newsScore * 10, 100),
      signals: newsSignals,
      suggestedMode: 'min',
      suggestedCategory: 'articles',
      deduplication: false,
      translation: true,
      summarization: true
    };
  }
  
  // Social Media detection
  const socialSignals = {
    postElements: document.querySelectorAll('[class*="post"], [data-testid*="post"]').length,
    likeButtons: bodyText.includes('like') && bodyText.includes('share'),
    commentSections: document.querySelectorAll('[class*="comment"]').length,
    feedStructure: document.querySelectorAll('[class*="feed"], [class*="timeline"]').length
  };
  
  const socialScore =
    (socialSignals.postElements > 3 ? 3 : 0) +
    (socialSignals.likeButtons ? 2 : 0) +
    (socialSignals.commentSections > 2 ? 2 : 0) +
    (socialSignals.feedStructure > 0 ? 3 : 0);
  
  if (socialScore >= 5) {
    console.log('[Content] ✅ Page type: Social Media (score:', socialScore, ')');
    return {
      type: 'social',
      confidence: Math.min(socialScore * 10, 100),
      signals: socialSignals,
      suggestedMode: 'balanced',
      suggestedCategory: 'all',
      deduplication: true,
      translation: false,
      summarization: true
    };
  }
  
  // Job Board detection
  const jobSignals = {
    jobElements: document.querySelectorAll('[class*="job"], [data-job]').length,
    applyButtons: bodyText.includes('apply') && (bodyText.includes('job') || bodyText.includes('position')),
    salaryMentions: bodyText.includes('salary') || bodyText.includes('compensation'),
    locationMentions: document.querySelectorAll('[class*="location"]').length
  };
  
  const jobScore =
    (jobSignals.jobElements > 3 ? 4 : 0) +
    (jobSignals.applyButtons ? 3 : 0) +
    (jobSignals.salaryMentions ? 2 : 0) +
    (jobSignals.locationMentions > 2 ? 1 : 0);
  
  if (jobScore >= 5) {
    console.log('[Content] ✅ Page type: Job Board (score:', jobScore, ')');
    return {
      type: 'jobs',
      confidence: Math.min(jobScore * 10, 100),
      signals: jobSignals,
      suggestedMode: 'balanced',
      suggestedCategory: 'jobs',
      deduplication: true,
      translation: false,
      summarization: true
    };
  }
  
  // Default: Unknown type
  console.log('[Content] ❓ Page type: Unknown/Generic');
  return {
    type: 'unknown',
    confidence: 50,
    signals: {},
    suggestedMode: 'auto',
    suggestedCategory: 'all',
    deduplication: false,
    translation: false,
    summarization: false
  };
}

// ═══════════════════════════════════════════════════════════════
// EXTERNAL CLASSIFIER (PRESERVED FROM DAY 14)
// ═══════════════════════════════════════════════════════════════

async function runClassification() {
  console.log('[Content] Calling external classifier...');
  
  try {
    if (typeof self.classifyPage !== 'function') {
      console.error('[Content] classifyPage not found!');
      return {
        classification: 'UNCERTAIN',
        confidence: 50,
        tier: 'fallback',
        reasoning: 'External classifier not loaded',
        signals: {},
        fallbackChain: ['error']
      };
    }
    
    const result = await self.classifyPage();
    console.log('[Content] External classifier result:', result);
    console.log('[Content] Classification:', result.classification, result.confidence + '%');
    console.log('[Content] Tier:', result.tier);
    
    return result;
  } catch (error) {
    console.error('[Content] Classification error:', error);
    return {
      classification: 'UNCERTAIN',
      confidence: 50,
      tier: 'error',
      reasoning: 'Error: ' + error.message,
      signals: {},
      fallbackChain: ['error']
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// MULTI-ITEM EXTRACTION (PRESERVED FROM DAY 14)
// ═══════════════════════════════════════════════════════════════

function extractMultipleItems(classification) {
  console.log('[Content] Extracting multiple items...');
  
  if (classification.classification !== 'MULTI_ITEM') {
    console.log('[Content] Not a MULTI_ITEM page, skipping');
    return null;
  }
  
  const elements = classification.detectedElements || [];
  
  if (elements.length < 2) {
    console.log('[Content] No detected elements found, fallback to manual search');
    
    const fallbackSelectors = [
      '.feed-shared-update-v2',
      '[data-testid="tweet"]',
      '[role="article"]',
      '.product-card',
      '.s-result-item',
      '[data-asin]',
      'article',
      '.post-card',
      '.grid-item'
    ];
    
    for (const selector of fallbackSelectors) {
      const items = document.querySelectorAll(selector);
      if (items.length >= 2) {
        items.forEach(el => elements.push(el));
        break;
      }
    }
    
    if (elements.length < 2) {
      console.log('[Content] Could not find multiple items');
      return null;
    }
  }
  
  const extractedItems = [];
  const maxItems = 10;
  
  for (let i = 0; i < Math.min(elements.length, maxItems); i++) {
    const el = elements[i];
    
    try {
      const text = el.innerText?.trim() || '';
      const html = el.outerHTML;
      
      if (text.length > 50) {
        extractedItems.push({
          index: i + 1,
          text: text.substring(0, 2000),
          html: html.substring(0, 5000),
          selector: classification.matchedSelector || 'unknown'
        });
      }
    } catch (e) {
      console.warn('[Content] Failed to extract item', i, ':', e.message);
      continue;
    }
  }
  
  console.log('[Content] Extracted', extractedItems.length, 'items successfully');
  return extractedItems.length >= 2 ? extractedItems : null;
}

// ═══════════════════════════════════════════════════════════════
// PAGE DATA EXTRACTION - ENHANCED WITH v4.2 PAGE TYPE
// ═══════════════════════════════════════════════════════════════

async function extractPageData() {
  try {
    console.log('[Content] Extracting page data with external classifier...');
    
    const classification = await runClassification();
    const pageType = detectPageType(); // 🆕 v4.2
    
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
      pageLayout: classification.classification,
      classificationConfidence: classification.confidence,
      classificationTier: classification.tier,
      classificationSignals: classification.signals || {},
      classificationReasoning: classification.reasoning,
      classificationDuration: classification.duration || 0,
      fallbackChain: classification.fallbackChain || [],
      domDetails: {
        repeatedBlocksCount: classification.detectedBlocksCount || 0,
        productGridFound: (classification.detectedBlocksCount || 0) > 3,
        mainContentDetected: classification.signals?.mainContentDetected || false,
        sidebarIgnored: classification.signals?.sidebarIgnored || false,
        matchedSelector: classification.matchedSelector || null
      },
      isInfiniteScrollSite: isInfiniteScrollSite(),
      
      // 🆕 v4.2: Page type detection for smart defaults
      pageType: pageType.type,
      pageTypeConfidence: pageType.confidence,
      pageTypeSignals: pageType.signals,
      smartDefaults: {
        suggestedMode: pageType.suggestedMode,
        suggestedCategory: pageType.suggestedCategory,
        deduplication: pageType.deduplication,
        translation: pageType.translation,
        summarization: pageType.summarization
      }
    };
    
    if (classification.classification === 'MULTI_ITEM') {
      const items = extractMultipleItems(classification);
      if (items && items.length >= 2) {
        pageData.extractedItems = items;
        pageData.itemCount = items.length;
        console.log('[Content] Added', items.length, 'extracted items to page data');
      } else {
        console.log('[Content] MULTI_ITEM page but could not extract individual items');
      }
    }
    
    console.log('[Content] Page data extracted with v4.2.0');
    console.log('[Content] Page classified as:', classification.classification);
    console.log('[Content] Classification tier:', classification.tier);
    console.log('[Content] Confidence:', classification.confidence + '%');
    console.log('[Content] 🎯 Page type detected:', pageType.type, `(${pageType.confidence}%)`);
    
    if (pageData.extractedItems) {
      console.log('[Content] Extracted', pageData.itemCount, 'individual items');
    }
    
    return pageData;
  } catch (error) {
    console.error('[Content] Extraction failed:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// SCREENSHOT CAPTURE (DAY 15)
// ═══════════════════════════════════════════════════════════════

async function captureScreenshot() {
  console.log('[Content] Screenshot capture requested');
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'captureScreenshot'
    });
    
    if (response.success) {
      console.log('[Content] Screenshot captured successfully');
      return response.dataUrl;
    } else {
      throw new Error(response.error || 'Screenshot capture failed');
    }
  } catch (error) {
    console.error('[Content] Screenshot capture error:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE LISTENER - ENHANCED WITH v4.2 HANDLERS
// ═══════════════════════════════════════════════════════════════

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Content] Message received:', request.action);
  
  try {
    if (request.action === 'extractPageData' || request.action === 'getPageData') {
      extractPageData().then(data => {
        sendResponse({ success: true, data });
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
    }
    
    else if (request.action === 'getDOMData') {
      console.log('[Content] getDOMData requested');
      extractPageData().then(data => {
        sendResponse({
          success: true,
          html: document.documentElement.outerHTML.substring(0, 50000),
          pageData: data
        });
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
    }
    
    // 🆕 v4.2: Page type detection
    else if (request.action === 'detectPageType') {
      const pageType = detectPageType();
      sendResponse({ success: true, pageType });
      return false;
    }
    
    else if (request.action === 'extractWithHybrid') {
      console.log('[Content] Hybrid extraction requested');
      extractPageData().then(data => {
        sendResponse({ success: true, data });
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
    }
    
    else if (request.action === 'extractProductBlocks') {
      runClassification().then(classification => {
        const items = extractMultipleItems(classification);
        const blocksText = items ? items.map(item => ({ text: item.text })) : [];
        sendResponse(blocksText);
      }).catch(error => {
        sendResponse([]);
      });
      return true;
    }
    
    else if (request.action === 'captureScreenshot') {
      console.log('[Content] Capture screenshot message received');
      chrome.runtime.sendMessage({
        action: 'captureScreenshot'
      }).then(response => {
        sendResponse(response);
      }).catch(error => {
        sendResponse({
          success: false,
          error: error.message
        });
      });
      return true;
    }
    
    else if (request.action === 'scrollAndExtract') {
      console.log('[Content] Scroll and extract requested');
      
      const options = {
        maxScrolls: request.maxScrolls || 10,
        scrollDelay: request.scrollDelay || 1000,
        itemSelector: request.itemSelector,
        onProgress: (scrollCount, itemCount) => {
          chrome.runtime.sendMessage({
            action: 'scrollProgress',
            scrollCount,
            itemCount
          }).catch(() => {});
        }
      };
      
      scrollUntilNoNewItems(options).then(result => {
        console.log('[Content] Scroll complete, extracting data...');
        return extractPageData();
      }).then(data => {
        sendResponse({
          success: true,
          data,
          scrollResult: result
        });
      }).catch(error => {
        console.error('[Content] Scroll failed:', error);
        sendResponse({
          success: false,
          error: error.message
        });
      });
      return true;
    }
    
    else if (request.action === 'checkInfiniteScroll') {
      const isInfinite = isInfiniteScrollSite();
      sendResponse({
        success: true,
        isInfiniteScroll: isInfinite
      });
    }
    
    else if (request.action === 'extractOffline') {
      console.log('[Content] Offline extraction requested');
      extractPageData().then(data => {
        sendResponse({ success: true, data });
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
    }
    
    else {
      console.warn('[Content] Unknown action:', request.action);
      sendResponse({ success: false, error: 'Unknown action' });
    }
    
  } catch (error) {
    console.error('[Content] Message handler error:', error);
    sendResponse({ success: false, error: error.message });
  }
  
  return true;
});

// ═══════════════════════════════════════════════════════════════
// LEGACY COMPATIBILITY (PRESERVED FROM DAY 14)
// ═══════════════════════════════════════════════════════════════

async function detectRepeatedProductBlocks() {
  console.log('[Content] detectRepeatedProductBlocks (legacy) called');
  const classification = await runClassification();
  return classification.detectedElements || [];
}

console.log('[Content] ✅ Content script v4.2.0 ready!');
console.log('[Content] 🎯 Using external classifier from src/classifier.js');
console.log('[Content] 🌊 Infinite scroll detection enabled');
console.log('[Content] 📸 Screenshot capture support added');
console.log('[Content] 🆕 Page type detection for smart defaults enabled');
