// ═══════════════════════════════════════════════════════════════
// WEB WEAVER CONTENT SCRIPT - v3.4.0 (Day 15 - MULTI/SINGLE_ITEM)
// Injected into every page for DOM analysis and extraction
// 🆕 DAY 15: Added captureScreenshot message handler
// ✅ PRESERVED: External classifier, infinite scroll detection
// ═══════════════════════════════════════════════════════════════

console.log('[Content] 🚀 Web Weaver Content Script v3.4.0 initializing...');

// ═══════════════════════════════════════════════════════════════
// INFINITE SCROLL DETECTION (PRESERVED FROM DAY 14)
// Handles Instagram, TikTok, Reddit, and other infinite feeds
// ═══════════════════════════════════════════════════════════════

/**
 * Detect the item selector for the current page
 * Returns the CSS selector that matches individual items
 */
function detectItemSelector() {
  console.log('[Scroll] 🔍 Auto-detecting item selector...');
  
  // Try common patterns in order of specificity
  const selectorCandidates = [
    // Social Media
    '.feed-shared-update-v2',           // LinkedIn
    '[data-testid="tweet"]',            // Twitter/X
    '[data-testid="post"]',             // Generic social
    '[role="article"]',                 // Semantic posts
    '.timeline-item',                   // Generic timelines
    
    // Instagram/TikTok
    'article',                          // Instagram posts
    '[class*="DivItemContainerV2"]',    // TikTok
    '[class*="video-card"]',            // Video feeds
    
    // Reddit
    '[data-testid="post-container"]',   // Reddit
    '.Post',                            // Reddit (old)
    
    // E-commerce
    '.s-result-item',                   // Amazon
    '.product-card',                    // Generic products
    '[data-asin]',                      // Amazon ASIN
    
    // Generic
    '.post', '.item', '.card', '.entry'
  ];
  
  for (const selector of selectorCandidates) {
    try {
      const elements = document.querySelectorAll(selector);
      if (elements.length >= 2) {
        console.log(`[Scroll] ✅ Detected item selector: ${selector} (${elements.length} items)`);
        return selector;
      }
    } catch (e) {
      continue;
    }
  }
  
  // Fallback: use most common repeated element
  console.log('[Scroll] ⚠️ No standard selector found, using fallback');
  return 'article, .post, .item, [role="article"]';
}

/**
 * Scroll until no new items appear (MutationObserver-based)
 * @param {Object} options - Configuration options
 * @param {number} options.maxScrolls - Maximum scroll attempts (default: 10)
 * @param {number} options.scrollDelay - Delay between scrolls in ms (default: 1000)
 * @param {string} options.itemSelector - CSS selector for items (auto-detected if not provided)
 * @param {Function} options.onProgress - Progress callback (scrollCount, itemCount)
 * @returns {Promise<Object>} - { itemCount, scrollCount, items }
 */
async function scrollUntilNoNewItems(options = {}) {
  console.log('[Scroll] 🌊 Starting infinite scroll detection...');
  
  const config = {
    maxScrolls: options.maxScrolls || 10,
    scrollDelay: options.scrollDelay || 1000,
    itemSelector: options.itemSelector || detectItemSelector(),
    onProgress: options.onProgress || (() => {}),
    noChangeThreshold: 2  // Stop if no new items for 2 consecutive scrolls
  };
  
  let prevCount = 0;
  let scrollCount = 0;
  let noChangeCount = 0;
  let scrolledToBottom = false;
  
  console.log(`[Scroll] 📋 Configuration:`, config);
  
  // Helper: Get current item count
  const getItemCount = () => {
    try {
      return document.querySelectorAll(config.itemSelector).length;
    } catch (e) {
      console.warn('[Scroll] ⚠️ Invalid selector:', e.message);
      return 0;
    }
  };
  
  // Helper: Check if scrolled to bottom
  const isAtBottom = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    return (scrollY + windowHeight >= documentHeight - 100); // 100px threshold
  };
  
  // Helper: Scroll one viewport down
  const scrollDown = () => {
    const scrollHeight = window.innerHeight * 0.8; // Scroll 80% of viewport
    window.scrollBy({
      top: scrollHeight,
      behavior: 'smooth'
    });
  };
  
  // Helper: Wait for new content (MutationObserver)
  const waitForNewContent = (timeoutMs = 3000) => {
    return new Promise((resolve) => {
      const startCount = getItemCount();
      let resolved = false;
      
      // Timeout fallback
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          observer.disconnect();
          resolve({ newItems: false, count: getItemCount() });
        }
      }, timeoutMs);
      
      // MutationObserver to detect DOM changes
      const observer = new MutationObserver((mutations) => {
        const currentCount = getItemCount();
        
        // New items detected
        if (currentCount > startCount && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          observer.disconnect();
          console.log(`[Scroll] ✅ New items loaded: ${startCount} → ${currentCount}`);
          resolve({ newItems: true, count: currentCount });
        }
      });
      
      // Observe the entire document body for changes
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  };
  
  // Initial count
  prevCount = getItemCount();
  console.log(`[Scroll] 📊 Initial item count: ${prevCount}`);
  
  // Main scroll loop
  while (scrollCount < config.maxScrolls) {
    // Scroll down
    scrollDown();
    scrollCount++;
    
    console.log(`[Scroll] 📜 Scroll ${scrollCount}/${config.maxScrolls}...`);
    
    // Wait for new content to load
    const result = await waitForNewContent(config.scrollDelay);
    const currentCount = result.count;
    
    // Report progress
    config.onProgress(scrollCount, currentCount);
    
    // Check if we've reached the bottom
    scrolledToBottom = isAtBottom();
    
    // Check if new items appeared
    if (currentCount === prevCount) {
      noChangeCount++;
      console.log(`[Scroll] ⚠️ No new items detected (${noChangeCount}/${config.noChangeThreshold})`);
      
      // Stop if no changes for multiple scrolls
      if (noChangeCount >= config.noChangeThreshold) {
        console.log('[Scroll] 🛑 No new items for multiple scrolls, stopping');
        break;
      }
      
      // Stop if at bottom
      if (scrolledToBottom) {
        console.log('[Scroll] 🛑 Reached bottom of page, stopping');
        break;
      }
    } else {
      noChangeCount = 0; // Reset counter
      console.log(`[Scroll] 📈 Items increased: ${prevCount} → ${currentCount} (+${currentCount - prevCount})`);
    }
    
    prevCount = currentCount;
    
    // Small delay between scrolls
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Final item collection
  const items = Array.from(document.querySelectorAll(config.itemSelector));
  
  console.log(`[Scroll] ✅ Scroll complete:`, {
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

/**
 * Check if current site is an infinite scroll site
 * Returns true for Instagram, TikTok, Reddit, Twitter, etc.
 */
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
// EXTERNAL CLASSIFIER (PRESERVED FROM DAY 14)
// src/classifier.js is loaded via manifest.json before this script
// ═══════════════════════════════════════════════════════════════

/**
 * Call the external classifier from src/classifier.js
 * This function is a wrapper that ensures compatibility
 */
async function runClassification() {
  console.log('[Content] 🎯 Calling external classifier (src/classifier.js)...');
  
  try {
    // Check if classifyPage exists (loaded from src/classifier.js)
    if (typeof self.classifyPage !== 'function') {
      console.error('[Content] ❌ classifyPage not found! Is src/classifier.js loaded?');
      
      // Fallback to basic detection
      return {
        classification: 'UNCERTAIN',
        confidence: 50,
        tier: 'fallback',
        reasoning: 'External classifier not loaded',
        signals: {},
        fallbackChain: ['error']
      };
    }
    
    // Call external classifier (may be async)
    const result = await self.classifyPage();
    
    console.log('[Content] ✅ External classifier result:', result);
    console.log(`[Content] 📊 Classification: ${result.classification} (${result.confidence}%)`);
    console.log(`[Content] 🎯 Tier: ${result.tier}`);
    
    return result;
    
  } catch (error) {
    console.error('[Content] ❌ Classification error:', error);
    
    // Fallback result
    return {
      classification: 'UNCERTAIN',
      confidence: 50,
      tier: 'error',
      reasoning: `Error: ${error.message}`,
      signals: {},
      fallbackChain: ['error']
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// MULTI-ITEM EXTRACTION (PRESERVED FROM DAY 14)
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

      if (text.length > 50) {
        // Valid item
        extractedItems.push({
          index: i + 1,
          text: text.substring(0, 2000), // Limit size
          html: html.substring(0, 5000), // Limit size
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
// PAGE DATA EXTRACTION (PRESERVED FROM DAY 14)
// Main entry point for page data extraction
// ═══════════════════════════════════════════════════════════════

async function extractPageData() {
  try {
    console.log('[Content] Extracting page data with external classifier...');

    // Call external classifier
    const classification = await runClassification();

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

      // Classification data (from external classifier)
      pageLayout: classification.classification,
      classificationConfidence: classification.confidence,
      classificationTier: classification.tier,
      classificationSignals: classification.signals || {},
      classificationReasoning: classification.reasoning,
      classificationDuration: classification.duration || 0,
      fallbackChain: classification.fallbackChain || [],

      // DOM details
      domDetails: {
        repeatedBlocksCount: classification.detectedBlocksCount || 0,
        productGridFound: (classification.detectedBlocksCount || 0) > 3,
        mainContentDetected: classification.signals?.mainContentDetected || false,
        sidebarIgnored: classification.signals?.sidebarIgnored || false,
        matchedSelector: classification.matchedSelector || null
      },
      
      // Infinite scroll metadata
      isInfiniteScrollSite: isInfiniteScrollSite()
    };

    // Extract individual items for MULTI_ITEM pages
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

    console.log('[Content] ✅ Page data extracted with v3.4.0');
    console.log(`[Content] 📊 Page classified as: ${classification.classification}`);
    console.log(`[Content] 🎯 Classification tier: ${classification.tier}`);
    console.log(`[Content] 🔢 Confidence: ${classification.confidence}%`);
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
// 🆕 DAY 15: SCREENSHOT CAPTURE
// Captures visible viewport as base64 data URL
// ═══════════════════════════════════════════════════════════════

/**
 * Capture the visible viewport as a screenshot
 * Note: This requires chrome.tabs.captureVisibleTab which runs in background
 * This function just sends the request to background script
 */
async function captureScreenshot() {
  console.log('[Content] 📸 Screenshot capture requested');
  
  try {
    // Send message to background script to capture screenshot
    // (chrome.tabs.captureVisibleTab only works in background/service worker)
    const response = await chrome.runtime.sendMessage({ 
      action: 'captureScreenshot' 
    });
    
    if (response.success) {
      console.log('[Content] ✅ Screenshot captured successfully');
      return response.dataUrl;
    } else {
      throw new Error(response.error || 'Screenshot capture failed');
    }
  } catch (error) {
    console.error('[Content] ❌ Screenshot capture error:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE LISTENER (ENHANCED FOR DAY 15)
// Handles messages from background script and popup
// ═══════════════════════════════════════════════════════════════

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Content] Message received:', request.action);

  try {
    if (request.action === 'extractPageData' || request.action === 'getPageData') {
      // Use async extraction with external classifier
      extractPageData().then(data => {
        sendResponse({ success: true, data });
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true; // Keep channel open for async
    } 
    
    else if (request.action === 'extractWithHybrid') {
      console.log('[Content] 🔥 Hybrid extraction requested');
      extractPageData().then(data => {
        sendResponse({ success: true, data });
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true; // Keep channel open for async
    } 
    
    else if (request.action === 'extractProductBlocks') {
      // Legacy compatibility - extract detectedElements
      runClassification().then(classification => {
        const items = extractMultipleItems(classification);
        const blocksText = items ? items.map(item => ({ text: item.text })) : [];
        sendResponse(blocksText);
      }).catch(error => {
        sendResponse([]);
      });
      return true; // Keep channel open for async
    }
    
    // 🆕 DAY 15: Screenshot capture handler
    else if (request.action === 'captureScreenshot') {
      console.log('[Content] 📸 Capture screenshot message received');
      
      // Forward to background script (it will handle chrome.tabs.captureVisibleTab)
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
      
      return true; // Keep channel open for async
    }
    
    // Infinite scroll handlers (preserved)
    else if (request.action === 'scrollAndExtract') {
      console.log('[Content] 🌊 Scroll and extract requested');
      
      const options = {
        maxScrolls: request.maxScrolls || 10,
        scrollDelay: request.scrollDelay || 1000,
        itemSelector: request.itemSelector,
        onProgress: (scrollCount, itemCount) => {
          // Send progress updates back
          chrome.runtime.sendMessage({
            action: 'scrollProgress',
            scrollCount,
            itemCount
          }).catch(() => {}); // Ignore if popup is closed
        }
      };
      
      // Run scroll detection (async)
      scrollUntilNoNewItems(options).then(result => {
        console.log('[Content] ✅ Scroll complete, extracting data...');
        return extractPageData().then(data => {
          sendResponse({ 
            success: true, 
            data,
            scrollResult: result
          });
        });
      }).catch(error => {
        console.error('[Content] ❌ Scroll failed:', error);
        sendResponse({ 
          success: false, 
          error: error.message 
        });
      });
      
      return true; // Keep channel open for async response
    }
    
    else if (request.action === 'checkInfiniteScroll') {
      const isInfinite = isInfiniteScrollSite();
      sendResponse({ 
        success: true, 
        isInfiniteScroll: isInfinite 
      });
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
// LEGACY COMPATIBILITY (PRESERVED FROM DAY 14)
// ═══════════════════════════════════════════════════════════════

async function detectRepeatedProductBlocks() {
  console.log('[Content] 🔄 detectRepeatedProductBlocks (legacy) called');
  const classification = await runClassification();
  return classification.detectedElements || [];
}

console.log('[Content] ✅ Content script v3.4.0 ready!');
console.log('[Content] 🎯 Using external classifier from src/classifier.js');
console.log('[Content] 🌊 Infinite scroll detection enabled');
console.log('[Content] 📸 Screenshot capture support added');
