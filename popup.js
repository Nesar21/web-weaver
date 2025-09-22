// Initialize all DOM elements and caches
const elements = {
  extractBtn: document.getElementById('extractBtn'),
  resetBtn: document.getElementById('resetBtn'),
  exportCSV: document.getElementById('exportCSV'),
  exportJSON: document.getElementById('exportJSON'),
  copyBtn: document.getElementById('copyBtn'),
  searchBox: document.getElementById('searchBox'),
  status: document.getElementById('status'),
  output: document.getElementById('output')
};

// PERFORMANCE: Create UI containers with optimization
const containers = {
  progress: createProgressContainer(),
  tags: createTagContainer(),
  metrics: createMetricsContainer(),
  settings: createSettingsContainer() // NEW: User configurable limits
};

function createProgressContainer() {
  const container = document.createElement('div');
  container.id = 'progressContainer';
  container.style.display = 'none';
  container.innerHTML = `
    <div class="progress-bar-container">
      <div class="progress-bar" id="progressBar"></div>
    </div>
    <div class="progress-text" id="progressText">Initializing...</div>
    <div class="progress-cancel">
      <button id="cancelBtn" class="cancel-btn">Cancel</button>
    </div>
  `;
  elements.status.parentNode.insertBefore(container, elements.status);
  return container;
}

function createTagContainer() {
  const container = document.createElement('div');
  container.id = 'tagContainer';
  container.style.display = 'none';
  container.innerHTML = `
    <div class="tag-filters" role="tablist" aria-label="Content type filters">
      <button class="tag-filter active" data-tag="all" role="tab" aria-selected="true" tabindex="0">All</button>
      <button class="tag-filter" data-tag="news" role="tab" aria-selected="false" tabindex="-1">📰 News</button>
      <button class="tag-filter" data-tag="market" role="tab" aria-selected="false" tabindex="-1">📊 Market</button>
      <button class="tag-filter" data-tag="opinion" role="tab" aria-selected="false" tabindex="-1">💭 Opinion</button>
      <button class="tag-filter" data-tag="technical" role="tab" aria-selected="false" tabindex="-1">⚙️ Technical</button>
      <button class="tag-filter" data-tag="ads" role="tab" aria-selected="false" tabindex="-1">📢 Ads</button>
    </div>
  `;
  elements.output.parentNode.insertBefore(container, elements.output);
  return container;
}

function createMetricsContainer() {
  const container = document.createElement('div');
  container.id = 'metricsContainer';
  container.style.display = 'none';
  container.innerHTML = `
    <div class="metrics-grid">
      <div class="metric">
        <span class="metric-label">Extraction Time</span>
        <span class="metric-value" id="extractionTime">-</span>
      </div>
      <div class="metric">
        <span class="metric-label">DOM Elements</span>
        <span class="metric-value" id="domSize">-</span>
      </div>
      <div class="metric">
        <span class="metric-label">Data Size</span>
        <span class="metric-value" id="dataSize">-</span>
      </div>
      <div class="metric">
        <span class="metric-label">Memory Usage</span>
        <span class="metric-value" id="memoryUsage">-</span>
      </div>
      <div class="metric">
        <span class="metric-label">Cache Efficiency</span>
        <span class="metric-value" id="cacheEfficiency">-</span>
      </div>
      <div class="metric">
        <span class="metric-label">Dynamic Items</span>
        <span class="metric-value" id="dynamicItems">-</span>
      </div>
    </div>
  `;
  containers.tags.parentNode.insertBefore(container, containers.tags);
  return container;
}

// NEW: User configurable extraction settings
function createSettingsContainer() {
  const container = document.createElement('div');
  container.id = 'settingsContainer';
  container.style.display = 'none';
  container.innerHTML = `
    <div class="settings-panel">
      <h4>⚙️ Extraction Settings</h4>
      <div class="setting-row">
        <label for="maxTables">Max Tables:</label>
        <input type="range" id="maxTables" min="1" max="20" value="5">
        <span class="setting-value">5</span>
      </div>
      <div class="setting-row">
        <label for="maxTableRows">Max Table Rows:</label>
        <input type="range" id="maxTableRows" min="5" max="50" value="15">
        <span class="setting-value">15</span>
      </div>
      <div class="setting-row">
        <label for="maxLinks">Max Links:</label>
        <input type="range" id="maxLinks" min="5" max="50" value="15">
        <span class="setting-value">15</span>
      </div>
    </div>
  `;
  
  // Add settings toggle button
  const settingsBtn = document.createElement('button');
  settingsBtn.id = 'settingsBtn';
  settingsBtn.textContent = '⚙️';
  settingsBtn.className = 'settings-toggle';
  settingsBtn.title = 'Extraction Settings';
  
  elements.resetBtn.parentNode.insertBefore(settingsBtn, elements.resetBtn.nextSibling);
  elements.resetBtn.parentNode.insertBefore(container, settingsBtn.nextSibling);
  
  // Settings toggle functionality
  settingsBtn.addEventListener('click', () => {
    const isVisible = container.style.display !== 'none';
    container.style.display = isVisible ? 'none' : 'block';
    settingsBtn.textContent = isVisible ? '⚙️' : '❌';
  });
  
  // Settings change handlers
  container.querySelectorAll('input[type="range"]').forEach(slider => {
    const valueDisplay = slider.parentNode.querySelector('.setting-value');
    slider.addEventListener('input', () => {
      valueDisplay.textContent = slider.value;
      // Send settings to content script
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: (settings) => {
              if (window.extractionSettings) {
                Object.assign(window.extractionSettings, settings);
              }
            },
            args: [{
              maxTables: parseInt(document.getElementById('maxTables').value),
              maxTableRows: parseInt(document.getElementById('maxTableRows').value),
              maxLinks: parseInt(document.getElementById('maxLinks').value)
            }]
          });
        }
      });
    });
  });
  
  return container;
}

// State management
let state = {
  lastExtractedData: null,
  originalOutput: '',
  isExtracting: false,
  extractTimeout: null,
  currentTags: [],
  searchIndex: null, // For fuzzy search
  keyboardNavigation: {
    currentIndex: 0,
    items: []
  }
};

// ENHANCED: Smart tagging with context analysis and caching
const contentKeywords = {
  news: {
    keywords: ['breaking', 'news', 'report', 'update', 'story', 'headline', 'article', 'journalist', 'reporter', 'exclusive', 'coverage', 'press'],
    weight: 1.2
  },
  market: {
    keywords: ['price', 'stock', 'market', 'trading', 'finance', 'investment', 'portfolio', 'shares', 'currency', 'economic', 'earnings', 'profit'],
    weight: 1.1
  },
  opinion: {
    keywords: ['opinion', 'editorial', 'commentary', 'analysis', 'perspective', 'viewpoint', 'blog', 'columnist', 'think', 'believe', 'argue'],
    weight: 1.0
  },
  technical: {
    keywords: ['technology', 'software', 'hardware', 'code', 'programming', 'algorithm', 'data', 'system', 'technical', 'specs', 'API', 'development'],
    weight: 1.3
  },
  ads: {
    keywords: ['advertisement', 'sponsored', 'promotion', 'deal', 'offer', 'sale', 'discount', 'buy now', 'limited time', 'exclusive offer', 'shop'],
    weight: 0.8
  }
};

// PERFORMANCE: Cached and context-aware classification
function classifyContent(text, context = '') {
  if (!text) return 'other';
  
  const cacheKey = text.substring(0, 100) + context;
  if (tagCache.has(cacheKey)) {
    return tagCache.get(cacheKey);
  }
  
  const lowerText = (text + ' ' + context).toLowerCase();
  let scores = {};
  
  Object.entries(contentKeywords).forEach(([category, config]) => {
    scores[category] = config.keywords.reduce((score, keyword) => {
      const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
      return score + (matches * config.weight);
    }, 0);
  });
  
  const maxScore = Math.max(...Object.values(scores));
  const result = maxScore > 0 ? 
    Object.keys(scores).find(key => scores[key] === maxScore) || 'other' : 
    'other';
  
  tagCache.set(cacheKey, result);
  return result;
}

function applySmartTagging(data) {
  if (!data || !data.content) return data;
  
  // ENHANCED: Context-aware tagging with surrounding content
  if (data.content.headings) {
    data.content.headings = data.content.headings.map((heading, index) => {
      const context = data.content.headings[index + 1]?.text || 
                     data.content.headings[index - 1]?.text || '';
      
      return {
        ...heading,
        tag: classifyContent(heading.text, context),
        tagColor: getTagColor(classifyContent(heading.text, context)),
        confidence: calculateConfidence(heading.text, context)
      };
    });
  }
  
  if (data.content.links) {
    data.content.links = data.content.links.map(link => ({
      ...link,
      tag: classifyContent(link.text, link.url),
      tagColor: getTagColor(classifyContent(link.text, link.url))
    }));
  }
  
  // ENHANCED: Tag tables based on content
  if (data.data.tables) {
    data.data.tables = data.data.tables.map(table => ({
      ...table,
      tag: classifyContent(table.headers.join(' '), table.caption || ''),
      tagColor: getTagColor(classifyContent(table.headers.join(' '), table.caption || ''))
    }));
  }
  
  // Collect unique tags with counts
  const tagCounts = {};
  [
    ...(data.content.headings?.map(h => h.tag) || []),
    ...(data.content.links?.map(l => l.tag) || []),
    ...(data.data.tables?.map(t => t.tag) || [])
  ].forEach(tag => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
  
  state.currentTags = Object.keys(tagCounts);
  data.tagAnalysis = tagCounts;
  
  return data;
}

function calculateConfidence(text, context) {
  // Simple confidence scoring based on keyword density
  const totalWords = (text + ' ' + context).split(/\s+/).length;
  const matchedWords = Object.values(contentKeywords)
    .flatMap(config => config.keywords)
    .filter(keyword => text.toLowerCase().includes(keyword))
    .length;
  
  return Math.min(matchedWords / totalWords * 100, 100);
}

function getTagColor(tag) {
  const colors = {
    news: '#ff6b35',
    market: '#2ecc71', 
    opinion: '#9b59b6',
    technical: '#3498db',
    ads: '#e74c3c',
    other: '#95a5a6'
  };
  return colors[tag] || colors.other;
}

// ENHANCED: UI State management with accessibility
function setUiState(state, message) {
  const statusElement = elements.status;
  const progressElement = containers.progress;
  
  // Update ARIA attributes for accessibility
  statusElement.setAttribute('aria-live', 'polite');
  
  switch(state) {
    case 'loading':
      statusElement.style.display = 'none';
      progressElement.style.display = 'block';
      progressElement.setAttribute('aria-hidden', 'false');
      
      // Disable all controls during extraction
      Object.values(elements).forEach(el => {
        if (el && el.tagName === 'BUTTON') el.disabled = true;
        if (el && el.tagName === 'INPUT') el.disabled = true;
      });
      
      containers.metrics.style.display = 'none';
      containers.tags.style.display = 'none';
      state.isExtracting = true;
      break;
      
    case 'success':
      statusElement.className = 'status success';
      statusElement.textContent = message;
      statusElement.style.display = 'block';
      statusElement.setAttribute('aria-hidden', 'false');
      progressElement.style.display = 'none';
      progressElement.setAttribute('aria-hidden', 'true');
      
      // Enable controls
      Object.values(elements).forEach(el => {
        if (el && el.tagName === 'BUTTON') el.disabled = false;
        if (el && el.tagName === 'INPUT') el.disabled = false;
      });
      
      elements.extractBtn.textContent = 'Re-Extract Data';
      containers.metrics.style.display = 'block';
      containers.tags.style.display = 'block';
      state.isExtracting = false;
      break;
      
    case 'error':
      statusElement.className = 'status error';
      statusElement.textContent = message;
      statusElement.style.display = 'block';
      statusElement.setAttribute('aria-hidden', 'false');
      progressElement.style.display = 'none';
      
      // Enable basic controls
      elements.extractBtn.disabled = false;
      elements.resetBtn.disabled = state.lastExtractedData ? false : true;
      
      containers.metrics.style.display = 'none';
      containers.tags.style.display = 'none';
      state.isExtracting = false;
      break;
      
    default:
      statusElement.className = 'status';
      statusElement.textContent = message;
      statusElement.style.display = 'block';
      progressElement.style.display = 'none';
      
      elements.extractBtn.disabled = false;
      elements.extractBtn.textContent = 'Extract Page Data';
      elements.resetBtn.disabled = true;
      
      ['exportCSV', 'exportJSON', 'copyBtn'].forEach(btnName => {
        elements[btnName].disabled = true;
      });
      
      elements.searchBox.disabled = true;
      containers.metrics.style.display = 'none';
      containers.tags.style.display = 'none';
      state.isExtracting = false;
  }
}

// PERFORMANCE: Optimized progress updates
function updateProgress(progress, message) {
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  
  if (progressBar && progressText) {
    // Use requestAnimationFrame for smooth animations
    requestAnimationFrame(() => {
      progressBar.style.width = `${progress}%`;
      progressText.textContent = message;
      progressText.setAttribute('aria-valuenow', progress);
    });
  }
}

// ENHANCED: Performance metrics with additional insights
function updatePerformanceMetrics(data) {
  if (!data.performance) return;
  
  const metrics = {
    extractionTime: document.getElementById('extractionTime'),
    domSize: document.getElementById('domSize'),
    dataSize: document.getElementById('dataSize'),
    memoryUsage: document.getElementById('memoryUsage'),
    cacheEfficiency: document.getElementById('cacheEfficiency'),
    dynamicItems: document.getElementById('dynamicItems')
  };
  
  // Update metrics with error handling
  Object.entries(metrics).forEach(([key, element]) => {
    if (!element) return;
    
    try {
      switch(key) {
        case 'extractionTime':
          element.textContent = `${data.performance.extractionTime || 0}ms`;
          break;
        case 'domSize':
          element.textContent = formatNumber(data.performance.domSize || 0);
          break;
        case 'dataSize':
          element.textContent = formatBytes(JSON.stringify(data).length);
          break;
        case 'memoryUsage':
          element.textContent = data.performance.memoryUsed ? 
            formatBytes(data.performance.memoryUsed) : 'N/A';
          break;
        case 'cacheEfficiency':
          const cacheSize = data.performance.cacheSize || 0;
          const totalElements = data.performance.domSize || 1;
          element.textContent = `${Math.round(cacheSize / totalElements * 100)}%`;
          break;
        case 'dynamicItems':
          const dynamicCount = data.data?.dynamicContent?.length || 0;
          const loadedItems = data.data?.dynamicContent?.reduce((sum, item) => 
            sum + (item.newItems || 0), 0) || 0;
          element.textContent = dynamicCount > 0 ? `${loadedItems}/${dynamicCount}` : '0';
          break;
      }
    } catch (error) {
      element.textContent = 'Error';
      console.warn(`Metric ${key} update failed:`, error);
    }
  });
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// ACCESSIBILITY: Keyboard navigation for highlighted items
function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    if (!state.lastExtractedData) return;
    
    const items = document.querySelectorAll('.highlighted-item:not([style*="display: none"])');
    if (items.length === 0) return;
    
    let currentIndex = state.keyboardNavigation.currentIndex;
    
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        currentIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (items[currentIndex]) {
          items[currentIndex].click();
        }
        return;
      case 'Escape':
        e.preventDefault();
        items.forEach(item => item.classList.remove('keyboard-selected'));
        currentIndex = 0;
        return;
      default:
        return;
    }
    
    // Update visual selection
    items.forEach((item, index) => {
      if (index === currentIndex) {
        item.classList.add('keyboard-selected');
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        item.setAttribute('aria-selected', 'true');
      } else {
        item.classList.remove('keyboard-selected');
        item.setAttribute('aria-selected', 'false');
      }
    });
    
    state.keyboardNavigation.currentIndex = currentIndex;
  });
}

// ENHANCED: Fuzzy search implementation
function createSearchIndex(data) {
  const index = [];
  
  // Index headings
  if (data.content?.headings) {
    data.content.headings.forEach((heading, i) => {
      index.push({
        type: 'heading',
        index: i,
        text: heading.text,
        searchText: heading.text.toLowerCase(),
        element: null // Will be set after render
      });
    });
  }
  
  // Index links  
  if (data.content?.links) {
    data.content.links.forEach((link, i) => {
      index.push({
        type: 'link',
        index: i,
        text: link.text,
        searchText: (link.text + ' ' + link.url).toLowerCase(),
        element: null
      });
    });
  }
  
  // Index tables
  if (data.data?.tables) {
    data.data.tables.forEach((table, i) => {
      const searchText = (table.headers.join(' ') + ' ' + (table.caption || '')).toLowerCase();
      index.push({
        type: 'table',
        index: i,
        text: `Table: ${table.headers.join(', ')}`,
        searchText: searchText,
        element: null
      });
    });
  }
  
  return index;
}

function fuzzySearch(query, index) {
  if (!query) return index;
  
  const lowerQuery = query.toLowerCase();
  const results = [];
  
  index.forEach(item => {
    let score = 0;
    const text = item.searchText;
    
    // Exact match bonus
    if (text.includes(lowerQuery)) {
      score += 100;
    }
    
    // Word boundary matches
    const words = lowerQuery.split(' ');
    words.forEach(word => {
      if (word.length > 1) {
        const regex = new RegExp(`\\b${word}`, 'i');
        if (regex.test(text)) {
          score += 50;
        }
      }
    });
    
    // Character sequence matching
    let queryIndex = 0;
    for (let i = 0; i < text.length && queryIndex < lowerQuery.length; i++) {
      if (text[i] === lowerQuery[queryIndex]) {
        score += 1;
        queryIndex++;
      }
    }
    
    if (score > 0) {
      results.push({ ...item, score });
    }
  });
  
  return results.sort((a, b) => b.score - a.score);
}

// Main extraction handler with enhanced error handling
elements.extractBtn.addEventListener('click', async () => {
  if (state.isExtracting) return;
  
  if (state.extractTimeout) {
    clearTimeout(state.extractTimeout);
  }
  
  setUiState('loading', 'Extracting data...');
  updateProgress(0, 'Initializing extraction...');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: "extractData" });
    
    state.extractTimeout = setTimeout(() => {
      if (state.isExtracting) {
        setUiState('error', 'Extraction timeout - please try again or adjust settings');
        state.extractTimeout = null;
      }
    }, 20000); // Extended timeout for complex pages
    
  } catch (error) {
    console.error('Extraction initiation failed:', error);
    setUiState('error', `Failed to start extraction: ${error.message}`);
  }
  
  // Safety delay to prevent rapid-fire
  setTimeout(() => {
    if (!state.isExtracting && elements.extractBtn) {
      elements.extractBtn.disabled = false;
    }
  }, 1000);
});

// Enhanced reset with cleanup
elements.resetBtn.addEventListener('click', () => {
  // Clear all state
  Object.assign(state, {
    lastExtractedData: null,
    originalOutput: '',
    currentTags: [],
    searchIndex: null,
    keyboardNavigation: { currentIndex: 0, items: [] }
  });
  
  // Clear caches
  if (window.tagCache) tagCache.clear();
  
  // Reset UI elements
  elements.output.style.display = 'none';
  elements.searchBox.value = '';
  
  // Reset tag filters
  document.querySelectorAll('.tag-filter').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
    btn.setAttribute('tabindex', '-1');
  });
  const allFilter = document.querySelector('.tag-filter[data-tag="all"]');
  if (allFilter) {
    allFilter.classList.add('active');
    allFilter.setAttribute('aria-selected', 'true');
    allFilter.setAttribute('tabindex', '0');
  }
  
  // Clear timeouts
  if (state.extractTimeout) {
    clearTimeout(state.extractTimeout);
    state.extractTimeout = null;
  }
  
  setUiState('default', 'Ready to extract...');
});

// Message handler with enhanced error handling
chrome.runtime.onMessage.addListener((message) => {
  try {
    if (message.action === "progressUpdate") {
      updateProgress(message.progress, message.message);
      return;
    }
    
    if (message.action === "dataExtracted") {
      if (state.extractTimeout) {
        clearTimeout(state.extractTimeout);
        state.extractTimeout = null;
      }
      
      if (message.data.error) {
        console.error('Extraction error:', message.data);
        let errorMsg = `Extraction failed: ${message.data.error}`;
        
        // Provide helpful error messages
        if (message.data.error.includes('Cross-origin')) {
          errorMsg = 'Cannot extract from this page due to security restrictions';
        } else if (message.data.error.includes('timeout')) {
          errorMsg = 'Page took too long to respond - try adjusting settings';
        }
        
        setUiState('error', errorMsg);
        elements.output.style.display = 'none';
        
        // Show fallback data if available
        if (message.data.fallback) {
          const fallbackInfo = document.createElement('div');
          fallbackInfo.className = 'fallback-info';
          fallbackInfo.innerHTML = `
            <h4>⚠️ Limited Information Available</h4>
            <p>Title: ${message.data.fallback.title}</p>
            <p>Domain: ${message.data.fallback.domain}</p>
            <p>Basic counts: ${JSON.stringify(message.data.fallback.basicStructure, null, 2)}</p>
          `;
          elements.output.appendChild(fallbackInfo);
          elements.output.style.display = 'block';
        }
      } else {
        // Success path
        const taggedData = applySmartTagging(message.data);
        state.lastExtractedData = taggedData;
        state.originalOutput = JSON.stringify(taggedData, null, 2);
        state.searchIndex = createSearchIndex(taggedData);
        
        renderHighlightedOutput(taggedData);
        elements.output.style.display = 'block';
        
        updatePerformanceMetrics(taggedData);
        setUiState('success', 'Data extracted successfully!');
      }
    }
  } catch (error) {
    console.error('Message handler error:', error);
    setUiState('error', 'Failed to process extraction results');
  }
});

// ENHANCED: Highlight-in-preview with accessibility and performance
function renderHighlightedOutput(data) {
  let html = '<div class="highlighted-output" role="tabpanel">';
  let itemIndex = 0;
  
  // Render headings with enhanced accessibility
  if (data.content.headings && data.content.headings.length > 0) {
    html += '<div class="content-section"><h4>📝 Headings</h4>';
    data.content.headings.slice(0, 25).forEach((heading, index) => {
      const tagColor = heading.tagColor || '#95a5a6';
      const confidence = heading.confidence || 0;
      html += `
        <div class="highlighted-item" data-tag="${heading.tag}" data-type="heading" data-index="${index}"
             role="button" tabindex="-1" aria-describedby="heading-${index}-desc">
          <span class="tag-badge" style="background-color: ${tagColor}">${heading.tag}</span>
          <span class="content-text">H${heading.level}: ${heading.text}</span>
          <span class="confidence" title="Classification confidence">${Math.round(confidence)}%</span>
          <div id="heading-${index}-desc" class="sr-only">
            Heading level ${heading.level}, tagged as ${heading.tag}
          </div>
        </div>
      `;
      itemIndex++;
    });
    html += '</div>';
  }
  
  // Render links with external indicators
  if (data.content.links && data.content.links.length > 0) {
    html += '<div class="content-section"><h4>🔗 Links</h4>';
    data.content.links.slice(0, 15).forEach((link, index) => {
      const tagColor = link.tagColor || '#95a5a6';
      const externalIcon = link.external ? '🔗' : '📄';
      const truncatedUrl = link.url.length > 60 ? link.url.substring(0, 60) + '...' : link.url;
      
      html += `
        <div class="highlighted-item" data-tag="${link.tag}" data-type="link" data-index="${index}"
             role="button" tabindex="-1">
          <span class="tag-badge" style="background-color: ${tagColor}">${link.tag}</span>
          <span class="content-text">${link.text}</span>
          <span class="link-url">${externalIcon} ${truncatedUrl}</span>
        </div>
      `;
      itemIndex++;
    });
    html += '</div>';
  }
  
  // Render tables with enhanced info
  if (data.data.tables && data.data.tables.length > 0) {
    html += '<div class="content-section"><h4>📊 Tables</h4>';
    data.data.tables.forEach((table, index) => {
      const tagColor = table.tagColor || '#3498db';
      const nestedInfo = table.nestedTables.length > 0 ? 
        ` (${table.nestedTables.length} nested)` : '';
      
      html += `
        <div class="highlighted-item table-item" data-tag="${table.tag}" data-type="table" data-index="${index}"
             role="button" tabindex="-1">
          <div class="table-info">
            <strong>Table ${index + 1}</strong>
            <span class="table-stats">
              ${table.headers.length} cols, ${table.actualRows}/${table.totalRows} rows${nestedInfo}
            </span>
          </div>
          <div class="table-preview">
            ${table.caption ? `Caption: ${table.caption}<br>` : ''}
            Headers: ${table.headers.slice(0, 5).join(', ')}${table.headers.length > 5 ? '...' : ''}
          </div>
          ${table.error ? `<div class="error-info">⚠️ ${table.error}</div>` : ''}
        </div>
      `;
      itemIndex++;
    });
    html += '</div>';
  }
  
  // Render forms
  if (data.data.forms && data.data.forms.length > 0) {
    html += '<div class="content-section"><h4>📝 Forms</h4>';
    data.data.forms.forEach((form, index) => {
      html += `
        <div class="highlighted-item form-item" data-type="form" data-index="${index}"
             role="button" tabindex="-1">
          <div class="form-info">
            <strong>Form ${index + 1}</strong>
            <span class="form-stats">${form.inputs.length} inputs, ${form.method}</span>
          </div>
          <div class="form-preview">
            Action: ${form.action.length > 50 ? '...' + form.action.slice(-50) : form.action}
          </div>
          ${form.error ? `<div class="error-info">⚠️ ${form.error}</div>` : ''}
        </div>
      `;
      itemIndex++;
    });
    html += '</div>';
  }
  
  // Render dynamic content results
  if (data.data.dynamicContent && data.data.dynamicContent.length > 0) {
    html += '<div class="content-section"><h4>⚡ Dynamic Content</h4>';
    data.data.dynamicContent.forEach((item, index) => {
      let statusIcon = '❓';
      let statusText = 'Unknown';
      
      if (item.type === 'loadMore' && item.success) {
        statusIcon = '✅';
        statusText = `Loaded ${item.newItems} items`;
      } else if (item.type === 'loadMore') {
        statusIcon = '⏳';
        statusText = item.clickable ? 'Clickable' : 'Not clickable';
      } else if (item.type === 'scrollContainer') {
        statusIcon = '🔄';
        statusText = `${item.itemCount} items`;
      }
      
      html += `
        <div class="highlighted-item dynamic-item" data-type="dynamic" data-index="${index}">
          <span class="dynamic-status">${statusIcon}</span>
          <span class="content-text">${item.type}: ${item.text || item.containerClass || 'Container'}</span>
          <span class="dynamic-info">${statusText}</span>
        </div>
      `;
    });
    html += '</div>';
  }
  
  html += '</div>';
  elements.output.innerHTML = html;
  
  // Setup click handlers and accessibility
  setupItemInteractions();
}

function setupItemInteractions() {
  const items = document.querySelectorAll('.highlighted-item');
  
  items.forEach((item, index) => {
    // Set up keyboard navigation
    item.setAttribute('tabindex', index === 0 ? '0' : '-1');
    item.setAttribute('aria-selected', 'false');
    
    // Click handler for highlighting
    item.addEventListener('click', () => {
      items.forEach(el => {
        el.classList.remove('selected');
        el.setAttribute('aria-selected', 'false');
      });
      item.classList.add('selected');
      item.setAttribute('aria-selected', 'true');
      
      // Show item details in console for development
      console.log('Selected item:', {
        type: item.dataset.type,
        index: item.dataset.index,
        tag: item.dataset.tag
      });
    });
    
    // Keyboard interaction
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });
  
  state.keyboardNavigation.items = Array.from(items);
}

// ENHANCED: Search with fuzzy matching
elements.searchBox.addEventListener('input', debounce((e) => {
  if (!state.lastExtractedData || !state.searchIndex) return;
  
  const searchTerm = e.target.value.toLowerCase().trim();
  
  if (searchTerm === '') {
    // Show all items
    const items = document.querySelectorAll('.highlighted-item');
    items.forEach(item => {
      item.style.display = 'block';
      item.classList.remove('search-match');
    });
    return;
  }
  
  // Perform fuzzy search
  const results = fuzzySearch(searchTerm, state.searchIndex);
  const resultTypes = new Set(results.map(r => `${r.type}-${r.index}`));
  
  // Update item visibility
  const items = document.querySelectorAll('.highlighted-item');
  items.forEach(item => {
    const key = `${item.dataset.type}-${item.dataset.index}`;
    if (resultTypes.has(key)) {
      item.style.display = 'block';
      item.classList.add('search-match');
      
      // Highlight matching text
      highlightSearchTerm(item, searchTerm);
    } else {
      item.style.display = 'none';
      item.classList.remove('search-match');
    }
  });
}, 300));

function highlightSearchTerm(element, term) {
  const textElement = element.querySelector('.content-text');
  if (!textElement) return;
  
  const text = textElement.textContent;
  const regex = new RegExp(`(${term})`, 'gi');
  const highlightedText = text.replace(regex, '<mark>$1</mark>');
  textElement.innerHTML = highlightedText;
}

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Tag filter improvements with accessibility
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('tag-filter')) {
    const tag = e.target.dataset.tag;
    
    // Update ARIA attributes
    document.querySelectorAll('.tag-filter').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
      btn.setAttribute('tabindex', '-1');
    });
    
    e.target.classList.add('active');
    e.target.setAttribute('aria-selected', 'true');
    e.target.setAttribute('tabindex', '0');
    
    // Filter content with animation
    const items = document.querySelectorAll('.highlighted-item');
    items.forEach(item => {
      const shouldShow = tag === 'all' || item.dataset.tag === tag;
      item.style.transition = 'opacity 0.2s ease';
      
      if (shouldShow) {
        item.style.display = 'block';
        item.style.opacity = '1';
      } else {
        item.style.opacity = '0';
        setTimeout(() => {
          if (item.style.opacity === '0') {
            item.style.display = 'none';
          }
        }, 200);
      }
    });
  }
});

// Export functions (keeping existing implementations but with error handling)
function downloadAsCSV(data) {
  try {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: `webweaver_data_${Date.now()}.csv`
    }, (downloadId) => {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      if (chrome.runtime.lastError) {
        setUiState('error', 'CSV download failed: ' + chrome.runtime.lastError.message);
      } else {
        setUiState('success', 'CSV download started successfully!');
      }
    });
  } catch (error) {
    setUiState('error', 'Failed to generate CSV: ' + error.message);
  }
}

function downloadAsJSON(data) {
  try {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: `webweaver_data_${Date.now()}.json`
    }, (downloadId) => {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      if (chrome.runtime.lastError) {
        setUiState('error', 'JSON download failed: ' + chrome.runtime.lastError.message);
      } else {
        setUiState('success', 'JSON download started successfully!');
      }
    });
  } catch (error) {
    setUiState('error', 'Failed to generate JSON: ' + error.message);
  }
}

function copyToClipboard(data) {
  const jsonString = JSON.stringify(data, null, 2);
  navigator.clipboard.writeText(jsonString).then(() => {
    setUiState('success', 'Data copied to clipboard successfully!');
    
    setTimeout(() => {
      if (!state.isExtracting && state.lastExtractedData) {
        setUiState('success', 'Data extracted successfully!');
      }
    }, 2000);
  }).catch(err => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = jsonString;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      setUiState('success', 'Data copied to clipboard!');
    } catch (fallbackErr) {
      setUiState('error', 'Failed to copy to clipboard - please select and copy manually');
    }
    
    document.body.removeChild(textArea);
  });
}

// Enhanced CSV conversion with all data types
function convertToCSV(data) {
  const rows = [];
  
  // Headers
  rows.push(['Type', 'Content', 'Tag', 'Additional Info', 'URL/Action']);
  
  // Basic info
  rows.push(['Title', data.title || '', '', '', data.url || '']);
  rows.push(['Domain', data.domain || '', '', '', '']);
  
  // Headings
  if (data.content?.headings) {
    data.content.headings.forEach(h => {
      rows.push(['Heading', h.text, h.tag || '', `Level ${h.level}`, '']);
    });
  }
  
  // Links
  if (data.content?.links) {
    data.content.links.forEach(link => {
      rows.push(['Link', link.text, link.tag || '', link.external ? 'External' : 'Internal', link.url]);
    });
  }
  
  // Tables
  if (data.data?.tables) {
    data.data.tables.forEach((table, index) => {
      rows.push(['Table', `Table ${index + 1}`, table.tag || '', 
                `${table.headers.length} columns, ${table.actualRows} rows`, '']);
      rows.push(['Table Headers', table.headers.join(' | '), '', '', '']);
      
      // Sample rows
      table.rows.slice(0, 3).forEach((row, rowIndex) => {
        const rowData = Array.isArray(row) ? 
          row.map(cell => typeof cell === 'object' ? cell.text : cell).join(' | ') :
          row;
        rows.push(['Table Row', rowData, '', `Row ${rowIndex + 1}`, '']);
      });
    });
  }
  
  // Forms
  if (data.data?.forms) {
    data.data.forms.forEach((form, index) => {
      rows.push(['Form', `Form ${index + 1}`, '', `${form.inputs.length} inputs`, form.action]);
      
      form.inputs.forEach(input => {
        rows.push(['Form Input', input.label, '', `${input.type}${input.required ? ' (required)' : ''}`, '']);
      });
    });
  }
  
  // Dynamic content
  if (data.data?.dynamicContent) {
    data.data.dynamicContent.forEach(item => {
      rows.push(['Dynamic', item.text || item.type, '', 
                item.newItems ? `Loaded ${item.newItems} items` : item.type, '']);
    });
  }
  
  return rows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

// Event listeners for export buttons
elements.exportCSV.addEventListener('click', () => {
  if (state.lastExtractedData) {
    downloadAsCSV(state.lastExtractedData);
  }
});

elements.exportJSON.addEventListener('click', () => {
  if (state.lastExtractedData) {
    downloadAsJSON(state.lastExtractedData);
  }
});

elements.copyBtn.addEventListener('click', () => {
  if (state.lastExtractedData) {
    copyToClipboard(state.lastExtractedData);
  }
});

// Initialize keyboard navigation and accessibility
setupKeyboardNavigation();

// Initialize UI
setUiState('default', 'Ready to extract data...');

// Add cancel button functionality
document.addEventListener('click', (e) => {
  if (e.target.id === 'cancelBtn') {
    if (state.extractTimeout) {
      clearTimeout(state.extractTimeout);
      state.extractTimeout = null;
    }
    setUiState('default', 'Extraction cancelled');
  }
});

// Performance monitoring
if (performance.memory) {
  setInterval(() => {
    const memUsage = performance.memory.usedJSHeapSize;
    if (memUsage > 50 * 1024 * 1024) { // 50MB threshold
      console.warn('High memory usage detected:', formatBytes(memUsage));
    }
  }, 30000);
}
