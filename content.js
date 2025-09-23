// Day 4 Enhanced Content Script with Semantic DOM Capture
if (window.webWeaverInjected && !window.webWeaverAllowReinject) {
  console.log("Web Weaver already injected, skipping...");
} else {
  window.webWeaverInjected = true;
  window.webWeaverAllowReinject = false;
  
  console.log("Web Weaver Lightning v1.0 Day 4 injected:", window.location.href);

  // Semantic content extraction - Day 4 Critical Fix
  function extractSemanticContent() {
    let content = '';
    let method = 'unknown';
    
    try {
      // Priority 1: Try <main> tag
      const mainElement = document.querySelector('main');
      if (mainElement && mainElement.innerText.trim().length > 200) {
        content = mainElement.innerText.trim();
        method = 'main-tag';
      }
      
      // Priority 2: Try <article> tag
      if (!content) {
        const articleElement = document.querySelector('article');
        if (articleElement && articleElement.innerText.trim().length > 200) {
          content = articleElement.innerText.trim();
          method = 'article-tag';
        }
      }
      
      // Priority 3: Content-specific selectors
      if (!content) {
        const contentSelectors = [
          '.content',
          '.post-content',
          '.article-content',
          '.entry-content',
          '.main-content',
          '[role="main"]'
        ];
        
        for (const selector of contentSelectors) {
          const element = document.querySelector(selector);
          if (element && element.innerText.trim().length > 200) {
            content = element.innerText.trim();
            method = `selector-${selector}`;
            break;
          }
        }
      }
      
      // Priority 4: Simple Readability algorithm
      if (!content) {
        const paragraphs = Array.from(document.querySelectorAll('p'));
        const contentParagraphs = paragraphs.filter(p => 
          p.innerText.trim().length > 50 && 
          !p.closest('nav, header, footer, sidebar, .sidebar, .nav')
        );
        
        if (contentParagraphs.length > 0) {
          content = contentParagraphs.map(p => p.innerText.trim()).join(' ');
          method = 'readability-p';
        }
      }
      
      // Priority 5: Fallback to body
      if (!content) {
        content = document.body.innerText.trim();
        method = 'body-fallback';
      }
      
      // Limit content length for API efficiency
      if (content.length > 8000) {
        content = content.slice(0, 8000) + '...';
      }
      
      console.log(`[Content] Extracted ${content.length} chars using method: ${method}`);
      
      return {
        content: content,
        method: method,
        title: document.title || 'No title',
        url: window.location.href,
        domain: window.location.hostname
      };
      
    } catch (error) {
      console.error('[Content] Extraction failed:', error);
      
      return {
        content: document.body.innerText.trim().slice(0, 8000),
        method: 'error-fallback',
        title: document.title || 'No title', 
        url: window.location.href,
        domain: window.location.hostname,
        error: error.message
      };
    }
  }

  // Enhanced page data extraction with semantic content
  async function extractPageData() {
    const startTime = Date.now();
    
    try {
      console.log('[Content] Starting semantic extraction...');
      
      const semanticData = extractSemanticContent();
      
      const enhancedData = {
        ...semanticData,
        timestamp: new Date().toISOString(),
        extractionTime: Date.now() - startTime,
        userAgent: navigator.userAgent.substring(0, 100) + '...',
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        structure: {
          hasMain: !!document.querySelector('main'),
          hasArticle: !!document.querySelector('article'),
          paragraphs: document.querySelectorAll('p').length,
          headings: document.querySelectorAll('h1,h2,h3,h4,h5,h6').length,
          links: document.querySelectorAll('a').length,
          images: document.querySelectorAll('img').length
        }
      };

      console.log('[Content] Semantic extraction complete:', {
        method: semanticData.method,
        contentLength: semanticData.content.length,
        duration: `${enhancedData.extractionTime}ms`
      });

      return enhancedData;
      
    } catch (error) {
      console.error('[Content] Page extraction failed:', error);
      
      return {
        error: error.message,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        extractionTime: Date.now() - startTime
      };
    }
  }

  // Message handler for extraction requests
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractPageData") {
      extractPageData().then(data => {
        sendResponse({ success: true, data: data });
      }).catch(error => {
        console.error('[Content] Message handler error:', error);
        sendResponse({ 
          success: false, 
          error: error.message,
          url: window.location.href
        });
      });
      return true; // Keep message channel open for async response
    }
  });

  console.log('[Content] Web Weaver Day 4 ready for semantic extraction');
}
