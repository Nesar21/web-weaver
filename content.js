// Prevent multiple injections with reset capability
if (window.webWeaverInjected && !window.webWeaverAllowReinject) {
  console.log("Web Weaver already injected, skipping...");
} else {
  window.webWeaverInjected = true;
  window.webWeaverAllowReinject = false;
  
  console.log("Web Weaver injected:", window.location.href);

  function extractHeadings() {
    return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(h => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent.trim()
      }))
      .filter(h => h.text.length > 0);
  }

  function extractLinks(limit = 10) {
    return Array.from(document.querySelectorAll('a[href]'))
      .slice(0, limit)
      .map(a => ({
        text: a.textContent.trim(),
        url: a.href,
        external: !a.href.startsWith(window.location.origin)
      }))
      .filter(link => link.text.length > 0);
  }

  function extractImages(limit = 5) {
    return Array.from(document.querySelectorAll('img[src]'))
      .slice(0, limit)
      .map(img => ({
        alt: img.alt || '',
        src: img.src,
        width: img.naturalWidth || 0,
        height: img.naturalHeight || 0
      }));
  }

  function extractTables(limit = 3) {
    return Array.from(document.querySelectorAll('table'))
      .slice(0, limit)
      .map(table => {
        const headers = Array.from(table.querySelectorAll('th'))
          .map(th => th.textContent.trim())
          .filter(text => text.length > 0);
        
        const rows = Array.from(table.querySelectorAll('tr'))
          .slice(headers.length > 0 ? 1 : 0, 4) // Skip header row, get first 3 data rows
          .map(row => 
            Array.from(row.querySelectorAll('td'))
              .map(td => td.textContent.trim())
          )
          .filter(row => row.length > 0);
        
        return {
          headers: headers.length > 0 ? headers : ['N/A'],
          rows: rows.length > 0 ? rows : [['No data found']],
          totalRows: table.querySelectorAll('tr').length
        };
      });
  }

  function extractForms(limit = 3) {
    return Array.from(document.querySelectorAll('form'))
      .slice(0, limit)
      .map(form => {
        const inputs = Array.from(form.querySelectorAll('input, select, textarea'))
          .map(input => {
            const label = form.querySelector(`label[for="${input.id}"]`) || 
                         input.closest('label') || 
                         input.previousElementSibling;
            
            return {
              type: input.type || input.tagName.toLowerCase(),
              name: input.name || 'unnamed',
              label: label ? label.textContent.trim() : 'N/A',
              required: input.required || false
            };
          });
        
        return {
          action: form.action || 'N/A',
          method: form.method || 'GET',
          inputs: inputs.length > 0 ? inputs : [{ type: 'none', name: 'N/A', label: 'No inputs found' }]
        };
      });
  }

  function extractMetadata() {
    const meta = {};
    
    // Essential meta tags
    const title = document.querySelector('meta[name="title"]') || document.querySelector('meta[property="og:title"]');
    const description = document.querySelector('meta[name="description"]') || document.querySelector('meta[property="og:description"]');
    const keywords = document.querySelector('meta[name="keywords"]');
    const canonical = document.querySelector('link[rel="canonical"]');
    
    if (title) meta.title = title.content;
    if (description) meta.description = description.content;
    if (keywords) meta.keywords = keywords.content;
    if (canonical) meta.canonical = canonical.href;
    
    // Additional meta tags
    document.querySelectorAll('meta').forEach(tag => {
      const name = tag.getAttribute('name') || tag.getAttribute('property');
      const content = tag.getAttribute('content');
      if (name && content && !meta[name]) {
        meta[name] = content;
      }
    });
    
    return Object.keys(meta).length > 0 ? meta : { message: 'No metadata found' };
  }

  function extractPageData() {
    try {
      const baseData = {
        title: document.title || "No title",
        url: window.location.href,
        domain: window.location.hostname,
        timestamp: new Date().toISOString()
      };

      const enhancedData = {
        content: {
          snippet: document.body?.innerText?.slice(0, 300) || "No content found",
          headings: extractHeadings(),
          links: extractLinks(10),
          images: extractImages(5)
        },
        structure: {
          tables: document.querySelectorAll('table').length,
          forms: document.querySelectorAll('form').length,
          lists: document.querySelectorAll('ul, ol').length,
          paragraphs: document.querySelectorAll('p').length
        },
        data: {
          tables: extractTables(3),
          forms: extractForms(3)
        },
        metadata: extractMetadata()
      };

      return { ...baseData, ...enhancedData };
    } catch (error) {
      console.error("Extraction failed:", error);
      return { error: error.message, url: window.location.href };
    }
  }

  // Run extraction
  const pageData = extractPageData();
  console.log("Enhanced page data:", JSON.stringify(pageData, null, 2));

  chrome.runtime.sendMessage({ 
    action: "dataExtracted", 
    data: pageData 
  }).catch(err => {
    console.error("Background communication failed:", err);
  });
}
