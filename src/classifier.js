// ═════════════════════════════════════════════════════════════════
// DAY 10 HYBRID CLASSIFIER - 3-LAYER ARCHITECTURE
// DOM Heuristics (Fast) → AI Fallback (Smart) → Prompt Router
// ═════════════════════════════════════════════════════════════════

console.log('[Classifier] 🎯 Day 10 Hybrid Classifier loading...');

/**
 * LAYER 1: DOM-BASED CLASSIFIER
 * Fast, free, local structural analysis
 * Returns: SINGLE_ITEM | MULTI_ITEM | UNCERTAIN
 */
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

    // Calculate word count
    const bodyText = document.body?.textContent?.trim() || '';
    signals.wordCount = bodyText.split(/\s+/).length;

    // Check for repeating patterns
    const repeatingSelectors = [
      '.product-card',
      '.product-item',
      '.post-card',
      '.post-preview',
      '.listing-item',
      '.search-result',
      '.grid-item',
      '[data-component="product-card"]',
      '[data-testid="product-tile"]'
    ];

    for (const selector of repeatingSelectors) {
      const count = document.querySelectorAll(selector).length;
      if (count > 5) {
        signals.repeatingPatterns = Math.max(signals.repeatingPatterns, count);
      }
    }

    // Check for homepage indicators
    const bodyClass = document.body.className.toLowerCase();
    signals.hasHomepageIndicators = 
      bodyClass.includes('homepage') || 
      bodyClass.includes('home-page') ||
      bodyClass.includes('index') ||
      window.location.pathname === '/' ||
      window.location.pathname === '/index.html';

    // Check for login/error indicators
    const title = document.title.toLowerCase();
    signals.hasLoginIndicators = 
      title.includes('login') || 
      title.includes('sign in') ||
      title.includes('error') || 
      title.includes('404') ||
      title.includes('access denied') ||
      signals.wordCount < 50;

    // ═══════════════════════════════════════════════════════════════
    // CLASSIFICATION LOGIC WITH CONFIDENCE SCORING
    // ═══════════════════════════════════════════════════════════════

    let classification = 'UNCERTAIN';
    let confidence = 50;
    let reasoning = '';

    // NONE Detection (garbage/empty pages)
    if (signals.hasLoginIndicators) {
      classification = 'NONE';
      confidence = 100;
      reasoning = 'Login/error page or too few words';
    }
    // MULTI_ITEM Detection (listings/homepages)
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
    // SINGLE_ITEM Detection (articles/products)
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
      classification = 'SINGLE_ITEM';
      confidence = 85;
      reasoning = 'Single H1 with substantial content (no article tag)';
    }
    // UNCERTAIN (ambiguous cases - needs AI fallback)
    else if (signals.articleCount > 0 && signals.repeatingPatterns > 0) {
      classification = 'UNCERTAIN';
      confidence = 60;
      reasoning = 'Mixed signals: has articles AND repeating patterns';
    }
    else if (signals.h1Count > 1 && signals.h1Count <= 3) {
      classification = 'UNCERTAIN';
      confidence = 55;
      reasoning = 'Multiple H1s detected (could be sections or multiple items)';
    }
    else {
      classification = 'UNCERTAIN';
      confidence = 50;
      reasoning = 'Unclear structure, needs semantic analysis';
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

    console.log(`[Classifier] ✅ DOM Classification: ${classification} (${confidence}% confident) in ${duration.toFixed(2)}ms`);
    console.log(`[Classifier] 📊 Signals:`, signals);
    console.log(`[Classifier] 💭 Reasoning: ${reasoning}`);

    return result;

  } catch (error) {
    console.error('[Classifier] ❌ DOM Classification failed:', error);
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

// Export for use in content.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { classifyPageLayout };
}
