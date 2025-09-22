// DAY 4 CORE: Prevent multiple injections with reset capability - OPTIMIZED EDITION
if (window.webWeaverInjected && !window.webWeaverAllowReinject) {
  console.log("Web Weaver already injected, skipping...");
} else {
  window.webWeaverInjected = true;
  window.webWeaverAllowReinject = false;
  
  console.log("Web Weaver Lightning v0.7 injected:", window.location.href);

  // DAY 4 CORE: Performance caching and settings
  const elementCache = new Map();
  const tagCache = new Map();
  let extractionSettings = {
    maxTables: 5,
    maxTableRows: 15,
    maxLinks: 15,
    maxImages: 8,
    maxForms: 5,
    tableDepth: 3,
    dynamicTimeout: 3000 // FIXED: Will be properly used
  };

  // ENHANCED: Dynamic progress tracking with content-aware phases
  let extractionProgress = 0;
  let totalPhases = 6; // Base phases: headings, links, images, metadata, tables/forms, dynamic
  let completedPhases = 0;
  
  // FIXED: Centralized error logging
  function logError(context, error) {
    console.warn(`Web Weaver ${context}:`, error);
    
    // Send error to background for tracking
    chrome.runtime.sendMessage({ 
      action: "reportError", 
      error: error.message || error,
      context: context,
      url: window.location.href 
    }).catch(() => {
      // Only log to console if message sending fails
      console.error(`Failed to report error from ${context}:`, error);
    });
  }
  
  function updateProgress(phase, message) {
    completedPhases++;
    extractionProgress = Math.round((completedPhases / totalPhases) * 100);
    
    chrome.runtime.sendMessage({ 
      action: "progressUpdate", 
      progress: extractionProgress,
      message: message,
      phase: completedPhases,
      totalPhases: totalPhases
    }).catch(err => logError('progress-update', err));
  }

  // DAY 4 CORE: Optimized element queries with caching
  function getCachedElements(selector, useCache = true) {
    if (useCache && elementCache.has(selector)) {
      return elementCache.get(selector);
    }
    
    try {
      const elements = Array.from(document.querySelectorAll(selector));
      if (useCache && elements.length > 0) {
        elementCache.set(selector, elements);
      }
      return elements;
    } catch (error) {
      logError('element-query', `Failed to query ${selector}: ${error.message}`);
      return [];
    }
  }

  // DAY 4 CORE: Content extraction functions with enhanced error handling
  function extractHeadings() {
    updateProgress(1, "Extracting headings...");
    
    try {
      const headings = getCachedElements('h1, h2, h3, h4, h5, h6');
      
      return headings.map(h => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent.trim(),
        id: h.id || null,
        classes: h.className || ''
      }))
      .filter(h => h.text.length > 0)
      .slice(0, 50); // Performance limit
    } catch (error) {
      logError('heading-extraction', error);
      return [];
    }
  }

  function extractLinks(limit = extractionSettings.maxLinks) {
    updateProgress(2, "Extracting links...");
    
    try {
      const links = getCachedElements('a[href]');
      
      return links
        .filter(a => a.href && a.textContent.trim().length > 0)
        .slice(0, limit)
        .map(a => ({
          text: a.textContent.trim(),
          url: a.href,
          external: !a.href.startsWith(window.location.origin),
          title: a.title || '',
          target: a.target || ''
        }));
    } catch (error) {
      logError('link-extraction', error);
      return [];
    }
  }

  function extractImages(limit = extractionSettings.maxImages) {
    updateProgress(3, "Extracting images...");
    
    try {
      const images = getCachedElements('img[src]');
      
      return images
        .slice(0, limit)
        .map(img => ({
          alt: img.alt || '',
          src: img.src,
          width: img.naturalWidth || img.width || 0,
          height: img.naturalHeight || img.height || 0,
          loading: img.loading || 'eager',
          classes: img.className || ''
        }));
    } catch (error) {
      logError('image-extraction', error);
      return [];
    }
  }

  // DAY 4 CORE: Optimized lazy table extraction with performance controls
  function extractTables(limit = extractionSettings.maxTables, maxDepth = extractionSettings.tableDepth) {
    try {
      const tables = getCachedElements('table');
      
      return tables
        .slice(0, limit)
        .map((table, tableIndex) => {
          try {
            // Extract headers efficiently
            const headerElements = table.querySelectorAll('thead th, tr:first-child th, tr:first-child td');
            const headers = Array.from(headerElements)
              .map(th => th.textContent.trim())
              .filter(text => text.length > 0)
              .slice(0, 10); // Limit headers for performance

            // LAZY: Extract only first N rows for performance
            const bodyRows = table.querySelectorAll('tbody tr, tr:not(:first-child)');
            const maxRows = Math.min(bodyRows.length, extractionSettings.maxTableRows);
            const rows = [];
            
            for (let i = 0; i < maxRows; i++) {
              const row = bodyRows[i];
              if (!row) break;
              
              const cells = Array.from(row.querySelectorAll('td, th'))
                .map(cell => {
                  // PERFORMANCE: Only extract essential cell info
                  const cellText = cell.textContent.trim();
                  const cellData = {
                    text: cellText.length > 200 ? cellText.substring(0, 200) + '...' : cellText,
                    colspan: cell.colSpan > 1 ? cell.colSpan : undefined,
                    rowspan: cell.rowSpan > 1 ? cell.rowSpan : undefined
                  };
                  
                  // Check for nested tables (limited depth)
                  if (maxDepth > 0 && cell.querySelector('table')) {
                    cellData.hasNestedTable = true;
                  }
                  
                  return cellData;
                })
                .slice(0, 12); // Limit columns for performance
              
              if (cells.length > 0) {
                rows.push(cells);
              }
            }

            // Extract limited nested tables
            const nestedTables = maxDepth > 0 ? 
              Array.from(table.querySelectorAll('table table'))
                .slice(0, 2)
                .map(nestedTable => ({
                  headers: Array.from(nestedTable.querySelectorAll('th'))
                    .map(th => th.textContent.trim())
                    .slice(0, 5),
                  rowCount: nestedTable.querySelectorAll('tr').length,
                  depth: maxDepth - 1
                })) : [];

            return {
              headers: headers.length > 0 ? headers : ['Column 1'],
              rows: rows.length > 0 ? rows : [],
              totalRows: table.querySelectorAll('tr').length,
              actualRows: rows.length,
              nestedTables: nestedTables,
              caption: table.querySelector('caption')?.textContent?.trim() || null,
              classes: table.className || ''
            };
          } catch (error) {
            logError('table-parsing', `Table ${tableIndex} extraction failed: ${error.message}`);
            return {
              headers: ['Error'],
              rows: [['Table extraction failed']],
              error: error.message
            };
          }
        })
        .filter(table => table.rows.length > 0);
    } catch (error) {
      logError('table-extraction', error);
      return [];
    }
  }

  // DAY 4 CORE: Enhanced form extraction with better field detection
  function extractForms(limit = extractionSettings.maxForms) {
    try {
      const forms = getCachedElements('form');
      
      return forms
        .slice(0, limit)
        .map((form, formIndex) => {
          try {
            const inputs = Array.from(form.querySelectorAll('input, select, textarea'))
              .map(input => {
                // ENHANCED: Better label detection
                let label = null;
                
                // Try multiple label detection methods
                if (input.id) {
                  label = form.querySelector(`label[for="${input.id}"]`);
                }
                if (!label) {
                  label = input.closest('label');
                }
                if (!label) {
                  label = input.previousElementSibling?.tagName === 'LABEL' ? input.previousElementSibling : null;
                }
                if (!label) {
                  // Look for nearby text nodes or spans
                  const parent = input.parentElement;
                  const textContent = parent?.textContent?.replace(input.value || '', '').trim();
                  if (textContent && textContent.length > 0 && textContent.length < 50) {
                    label = { textContent: textContent };
                  }
                }

                const inputData = {
                  type: input.type || input.tagName.toLowerCase(),
                  name: input.name || `unnamed_${input.type}`,
                  label: label ? label.textContent.trim() : input.placeholder || 'No label',
                  required: input.required,
                  placeholder: input.placeholder || '',
                  value: input.value || '',
                  disabled: input.disabled,
                  classes: input.className || ''
                };

                // ENHANCED: Extract select options
                if (input.tagName === 'SELECT') {
                  inputData.options = Array.from(input.options)
                    .map(opt => ({
                      text: opt.text,
                      value: opt.value,
                      selected: opt.selected
                    }))
                    .slice(0, 20); // Limit options for performance
                }

                return inputData;
              })
              .slice(0, 25); // Limit inputs for performance

            return {
              action: form.action || window.location.href,
              method: form.method || 'GET',
              inputs: inputs.length > 0 ? inputs : [],
              fieldsets: form.querySelectorAll('fieldset').length,
              submitButtons: form.querySelectorAll('input[type="submit"], button[type="submit"]').length,
              classes: form.className || ''
            };
          } catch (error) {
            logError('form-parsing', `Form ${formIndex} extraction failed: ${error.message}`);
            return {
              action: 'Error',
              method: 'GET',
              inputs: [],
              error: error.message
            };
          }
        })
        .filter(form => form.inputs.length > 0);
    } catch (error) {
      logError('form-extraction', error);
      return [];
    }
  }

  // DAY 4 CORE: Cached metadata extraction with performance optimization
  function extractMetadata() {
    updateProgress(4, "Extracting metadata...");
    
    if (elementCache.has('metadata')) {
      return elementCache.get('metadata');
    }
    
    try {
      const meta = {};
      
      // Essential meta tags
      const metaSelectors = {
        title: 'meta[name="title"], meta[property="og:title"]',
        description: 'meta[name="description"], meta[property="og:description"]',
        keywords: 'meta[name="keywords"]',
        canonical: 'link[rel="canonical"]',
        author: 'meta[name="author"]',
        robots: 'meta[name="robots"]',
        viewport: 'meta[name="viewport"]'
      };
      
      Object.entries(metaSelectors).forEach(([key, selector]) => {
        try {
          const element = document.querySelector(selector);
          if (element) {
            meta[key] = element.content || element.href;
          }
        } catch (error) {
          logError('metadata-query', `Failed to query ${selector}: ${error.message}`);
        }
      });

      // Additional meta tags (limited for performance)
      const allMeta = document.querySelectorAll('meta');
      let metaCount = 0;
      allMeta.forEach(tag => {
        if (metaCount >= 20) return; // Performance limit
        
        try {
          const name = tag.getAttribute('name') || tag.getAttribute('property');
          const content = tag.getAttribute('content');
          if (name && content && !meta[name] && content.length < 300) {
            meta[name] = content;
            metaCount++;
          }
        } catch (error) {
          logError('metadata-parsing', error);
        }
      });
      
      const result = Object.keys(meta).length > 0 ? meta : { message: 'No metadata found' };
      elementCache.set('metadata', result);
      return result;
    } catch (error) {
      logError('metadata-extraction', error);
      return { message: 'Metadata extraction failed' };
    }
  }

  // FUTURE ENHANCEMENT: Dynamic content with configurable timeout
  async function extractDynamicContent() {
    updateProgress(5, "Detecting dynamic content...");
    
    const dynamicElements = [];
    
    try {
      // ENHANCED: Look for "Load More" buttons and try to click them
      const loadMoreButtons = Array.from(document.querySelectorAll('button, a, span'))
        .filter(el => {
          const text = el.textContent.toLowerCase();
          return /load\s+more|show\s+more|view\s+more|see\s+more|read\s+more/i.test(text) ||
                 /more\s+results|more\s+items|expand/i.test(text);
        })
        .slice(0, 3);

      for (const button of loadMoreButtons) {
        const beforeCount = document.querySelectorAll('article, .item, .post, .result').length;
        
        dynamicElements.push({
          type: 'loadMore',
          text: button.textContent.trim(),
          clickable: !button.disabled && button.offsetParent !== null, // Visible check
          beforeCount: beforeCount
        });

        // FIXED: Use configurable dynamic timeout
        if (!button.disabled && button.offsetParent !== null) {
          try {
            button.click();
            // FIXED: Wait using extractionSettings.dynamicTimeout
            await new Promise(resolve => setTimeout(resolve, Math.min(extractionSettings.dynamicTimeout, 5000)));
            
            const afterCount = document.querySelectorAll('article, .item, .post, .result').length;
            const lastElement = dynamicElements[dynamicElements.length - 1];
            lastElement.afterCount = afterCount;
            lastElement.newItems = afterCount - beforeCount;
            
            if (afterCount > beforeCount) {
              lastElement.success = true;
            }
          } catch (error) {
            logError('click-simulation', error);
            dynamicElements[dynamicElements.length - 1].clickError = error.message;
          }
        }
      }

      // Detect infinite scroll containers
      const scrollContainers = Array.from(document.querySelectorAll('[class*="scroll"], [class*="infinite"], [class*="lazy"], [class*="virtual"]'))
        .filter(container => container.children.length > 5) // Must have substantial content
        .slice(0, 2);

      scrollContainers.forEach(container => {
        dynamicElements.push({
          type: 'scrollContainer',
          itemCount: container.children.length,
          hasMoreIndicator: container.querySelector('[class*="loading"], [class*="spinner"], [class*="more"]') ? true : false,
          containerClass: container.className
        });
      });

      // Detect AJAX/fetch indicators
      const ajaxIndicators = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="progress"]');
      if (ajaxIndicators.length > 0) {
        dynamicElements.push({
          type: 'ajaxIndicators',
          count: ajaxIndicators.length,
          visible: Array.from(ajaxIndicators).some(el => el.offsetParent !== null)
        });
      }

    } catch (error) {
      logError('dynamic-content-detection', error);
      dynamicElements.push({
        type: 'error',
        message: error.message
      });
    }

    return dynamicElements;
  }

  // FIXED: Modern performance API with fallback
  function getPerformanceMetrics() {
    const metrics = {
      domSize: document.querySelectorAll('*').length,
      pageSize: document.body ? document.body.innerHTML.length : 0,
      cacheSize: elementCache.size
    };

    // FIXED: Use modern PerformanceNavigationTiming API
    try {
      if ('getEntriesByType' in performance) {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          metrics.loadTime = Math.round(navigation.loadEventEnd - navigation.loadEventStart);
          metrics.domContentLoaded = Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart);
          metrics.firstByte = Math.round(navigation.responseStart - navigation.fetchStart);
        }
      } else if (performance.timing) {
        // Fallback to deprecated API
        metrics.loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      }
    } catch (error) {
      logError('performance-timing', error);
      metrics.loadTime = null;
    }

    // FIXED: Feature-detect performance.memory (Chrome only)
    if ('memory' in performance) {
      try {
        metrics.memoryUsed = performance.memory.usedJSHeapSize;
        metrics.memoryLimit = performance.memory.jsHeapSizeLimit;
      } catch (error) {
        logError('memory-detection', error);
      }
    }

    return metrics;
  }

  // DAY 4 CORE: Main extraction with performance monitoring and content-aware phases
  async function extractPageData() {
    try {
      // Performance measurement start
      performance.mark('extraction-start');
      
      const baseData = {
        title: document.title || "No title",
        url: window.location.href,
        domain: window.location.hostname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent.substring(0, 100) + '...', // Truncate for performance
        settings: extractionSettings
      };

      // FIXED: Dynamic phase calculation based on available content
      const tableElements = getCachedElements('table', false);
      const formElements = getCachedElements('form', false);
      
      // Adjust total phases based on available content
      totalPhases = 4; // Base: headings, links, images, metadata
      if (tableElements.length > 0 || formElements.length > 0) totalPhases++;
      if (document.querySelectorAll('button, a, span').length > 0) totalPhases++; // Dynamic content phase
      
      // DAY 4 CORE: Parallel extraction for better performance
      const [headings, links, images] = await Promise.all([
        Promise.resolve(extractHeadings()),
        Promise.resolve(extractLinks()),
        Promise.resolve(extractImages())
      ]);

      const enhancedData = {
        content: {
          snippet: document.body?.innerText?.slice(0, 400) || "No content found",
          headings: headings,
          links: links,
          images: images
        },
        structure: {
          tables: tableElements.length,
          forms: formElements.length,
          lists: getCachedElements('ul, ol').length,
          paragraphs: getCachedElements('p').length,
          iframes: getCachedElements('iframe').length,
          videos: getCachedElements('video').length,
          scripts: getCachedElements('script').length
        },
        data: {
          tables: [],
          forms: [],
          dynamicContent: []
        },
        metadata: extractMetadata(),
        performance: getPerformanceMetrics()
      };

      // LAZY: Only extract tables/forms if they exist
      if (tableElements.length > 0 || formElements.length > 0) {
        updateProgress(5, "Extracting structured data...");
        
        if (tableElements.length > 0) {
          enhancedData.data.tables = extractTables();
        }
        if (formElements.length > 0) {
          enhancedData.data.forms = extractForms();
        }
      }

      // FUTURE ENHANCEMENT: Dynamic content detection
      if (totalPhases > 5) {
        enhancedData.data.dynamicContent = await extractDynamicContent();
      }

      // Performance measurement end
      performance.mark('extraction-end');
      performance.measure('extraction-duration', 'extraction-start', 'extraction-end');
      
      const extractionTime = performance.getEntriesByName('extraction-duration')[0]?.duration || 0;
      enhancedData.performance.extractionTime = Math.round(extractionTime);

      updateProgress(totalPhases, "Extraction complete!");
      
      // Send performance data to background for tracking
      chrome.runtime.sendMessage({
        action: "recordPerformance",
        extractionTime: enhancedData.performance.extractionTime,
        domSize: enhancedData.performance.domSize,
        success: true
      }).catch(err => logError('performance-recording', err));
      
      return { ...baseData, ...enhancedData };
    } catch (error) {
      logError('main-extraction', error);
      
      // Send error performance data
      chrome.runtime.sendMessage({
        action: "recordPerformance",
        error: error.message,
        success: false
      }).catch(() => {}); // Silent fail for error reporting
      
      return { 
        error: error.message,
        stack: error.stack?.substring(0, 500), // Limited stack trace
        url: window.location.href,
        timestamp: new Date().toISOString()
      };
    }
  }

  // DAY 4 CORE: Cross-origin safety with enhanced fallback
  async function safeExtractPageData() {
    try {
      return await extractPageData();
    } catch (error) {
      if (error.name === 'SecurityError') {
        logError('cross-origin-security', error);
        
        return {
          error: 'Cross-origin access blocked',
          url: window.location.href,
          timestamp: new Date().toISOString(),
          fallback: {
            title: document.title,
            domain: window.location.hostname,
            basicStructure: {
              links: document.querySelectorAll('a').length,
              images: document.querySelectorAll('img').length,
              headings: document.querySelectorAll('h1,h2,h3,h4,h5,h6').length,
              tables: document.querySelectorAll('table').length,
              forms: document.querySelectorAll('form').length
            }
          }
        };
      }
      throw error;
    }
  }

  // DAY 4 CORE: Execute extraction with enhanced error handling
  safeExtractPageData().then(pageData => {
    console.log("Lightning-optimized page data:", pageData);
    
    chrome.runtime.sendMessage({ 
      action: "dataExtracted", 
      data: pageData 
    }).catch(err => {
      logError('background-communication', err);
      
      // Try recovery port as fallback
      try {
        const port = chrome.runtime.connect({ name: 'webweaver-recovery' });
        port.postMessage({
          action: 'emergencyData',
          data: pageData,
          error: err.message
        });
      } catch (recoveryError) {
        logError('recovery-communication', recoveryError);
      }
    });
  }).catch(err => {
    logError('safe-extraction', err);
    
    chrome.runtime.sendMessage({ 
      action: "dataExtracted", 
      data: { 
        error: err.message, 
        url: window.location.href,
        timestamp: new Date().toISOString(),
        type: 'extraction_failure'
      } 
    }).catch(() => {
      // Final fallback - just log to console
      console.error("Web Weaver: Complete communication failure", err);
    });
  });
}
