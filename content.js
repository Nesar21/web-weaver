// ═════════════════════════════════════════════════════════════════
// CONTENT SCRIPT - ENHANCED WITH DAY 10 HYBRID CLASSIFIER
// ═════════════════════════════════════════════════════════════════

console.log('[Content] 🚀 Content script with Day 10 Hybrid Classifier loading...');

// ═══════════════════════════════════════════════════════════════
// DAY 10: INLINE CLASSIFIER (embedded to avoid CSP issues)
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

    const repeatingSelectors = [
      '.product-card', '.product-item', '.post-card', '.post-preview',
      '.listing-item', '.search-result', '.grid-item',
      '[data-component="product-card"]', '[data-testid="product-tile"]'
    ];

    for (const selector of repeatingSelectors) {
      const count = document.querySelectorAll(selector).length;
      if (count > 5) {
        signals.repeatingPatterns = Math.max(signals.repeatingPatterns, count);
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

    if (signals.hasLoginIndicators) {
      classification = 'NONE';
      confidence = 100;
      reasoning = 'Login/error page or too few words';
    } else if (signals.articleCount > 3) {
      classification = 'MULTI_ITEM';
      confidence = 95;
      reasoning = `Multiple articles detected (${signals.articleCount})`;
    } else if (signals.repeatingPatterns > 5) {
      classification = 'MULTI_ITEM';
      confidence = 95;
      reasoning = `Repeating patterns detected (${signals.repeatingPatterns} items)`;
    } else if (signals.hasHomepageIndicators && signals.articleCount > 1) {
      classification = 'MULTI_ITEM';
      confidence = 90;
      reasoning = 'Homepage with multiple articles';
    } else if (signals.articleCount === 1 && signals.h1Count === 1 && signals.wordCount > 500) {
      classification = 'SINGLE_ITEM';
      confidence = 100;
      reasoning = 'Single article with one H1, substantial content';
    } else if (signals.mainCount === 1 && signals.h1Count === 1 && signals.wordCount > 300) {
      classification = 'SINGLE_ITEM';
      confidence = 95;
      reasoning = 'Single main content area with one H1';
    } else if (signals.articleCount === 0 && signals.h1Count === 1 && signals.wordCount > 200) {
      classification = 'SINGLE_ITEM';
      confidence = 85;
      reasoning = 'Single H1 with substantial content';
    } else if (signals.articleCount > 0 && signals.repeatingPatterns > 0) {
      classification = 'UNCERTAIN';
      confidence = 60;
      reasoning = 'Mixed signals: articles AND repeating patterns';
    } else if (signals.h1Count > 1 && signals.h1Count <= 3) {
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
      duration: Math.round(duration)
    };

    console.log(`[Classifier] ✅ DOM: ${classification} (${confidence}%) in ${duration.toFixed(2)}ms`);
    console.log(`[Classifier] 💭 ${reasoning}`);

    return result;

  } catch (error) {
    console.error('[Classifier] ❌ Error:', error);
    return {
      classification: 'UNCERTAIN',
      confidence: 50,
      signals: {},
      reasoning: `Error: ${error.message}`,
      method: 'dom-heuristic',
      duration: 0
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// EXTRACTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function extractPageData() {
  try {
    console.log('[Content] Extracting page data...');

    // DAY 10: Add classification to extracted data
    const classification = classifyPageLayout();

    const pageData = {
      url: window.location.href,
      domain: window.location.hostname,
      title: document.title,
      mainText: document.body.innerText.substring(0, 5000),
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
      // DAY 10: Add classification data
      pageLayout: classification.classification,
      classificationConfidence: classification.confidence,
      classificationSignals: classification.signals,
      classificationReasoning: classification.reasoning,
      classificationDuration: classification.duration
    };

    console.log('[Content] ✅ Page data extracted with classification');
    console.log(`[Content] 📊 Page classified as: ${classification.classification}`);
    
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
    else if (request.action === 'extractWithHybrid') {
      // DAY 10: Hybrid extraction
      console.log('[Content] 🔥 Hybrid extraction requested');
      
      const data = extractPageData();
      
      // Note: The actual hybrid pipeline (Layer 2 & 3) happens in background.js
      // Content script just provides the classified data
      
      sendResponse({ success: true, data });
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

console.log('[Content] ✅ Content script with Hybrid Classifier ready!');
