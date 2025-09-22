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

function extractMetadata() {
  const meta = {};
  
  document.querySelectorAll('meta').forEach(tag => {
    const name = tag.getAttribute('name') || tag.getAttribute('property');
    const content = tag.getAttribute('content');
    if (name && content) {
      meta[name] = content;
    }
  });
  
  return meta;
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
      metadata: extractMetadata()
    };

    return { ...baseData, ...enhancedData };
  } catch (error) {
    console.error("Extraction failed:", error);
    return { error: error.message, url: window.location.href };
  }
}

const pageData = extractPageData();
console.log("Enhanced page data:", JSON.stringify(pageData, null, 2));

chrome.runtime.sendMessage({ 
  action: "dataExtracted", 
  data: pageData 
}).catch(err => {
  console.error("Background communication failed:", err);
});