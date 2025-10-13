// Web Weaver Lightning - Popup Controller
// Complete Days 1-10 implementation
// Handles UI, extraction, export, and analytics

console.log('[WebWeaver-Popup] Loading...');

// ============================================================================
// STATE
// ============================================================================

let currentData = null;
let aiEnabled = true;
let analyticsInterval = null;

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const elements = {
  apiSection: document.getElementById('apiSection'),
  apiKeyInput: document.getElementById('apiKeyInput'),
  saveKeyBtn: document.getElementById('saveKeyBtn'),
  aiToggle: document.getElementById('aiToggle'),
  extractBtn: document.getElementById('extractBtn'),
  status: document.getElementById('status'),
  results: document.getElementById('results'),
  copyBtn: document.getElementById('copyBtn'),
  jsonBtn: document.getElementById('jsonBtn'),
  csvBtn: document.getElementById('csvBtn'),
  analytics: document.getElementById('analytics'),
  totalExtractions: document.getElementById('totalExtractions'),
  aiExtractions: document.getElementById('aiExtractions'),
  avgConfidence: document.getElementById('avgConfidence'),
  successRate: document.getElementById('successRate'),
  targetStatus: document.getElementById('targetStatus')
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[WebWeaver-Popup] DOM loaded');
  
  await checkApiKey();
  await loadAiToggle();
  await loadAnalytics();
  setupEventListeners();
  setupHybridButton();
  startAnalyticsAutoRefresh();
  
  console.log('[WebWeaver-Popup] ✅ Ready');
});

function setupEventListeners() {
  elements.saveKeyBtn.addEventListener('click', handleSaveApiKey);
  elements.aiToggle.addEventListener('change', handleAiToggle);
  elements.extractBtn.addEventListener('click', handleExtract);
  elements.copyBtn.addEventListener('click', handleCopy);
  elements.jsonBtn.addEventListener('click', () => handleExport('json'));
  elements.csvBtn.addEventListener('click', () => handleExport('csv'));
}

function startAnalyticsAutoRefresh() {
  if (analyticsInterval) {
    clearInterval(analyticsInterval);
  }
  
  analyticsInterval = setInterval(async () => {
    if (aiEnabled) {
      await loadAnalytics(true);
    }
  }, 3000);
  
  console.log('[WebWeaver-Popup] 🔄 Analytics auto-refresh started (3s interval)');
}

window.addEventListener('beforeunload', () => {
  if (analyticsInterval) {
    clearInterval(analyticsInterval);
    console.log('[WebWeaver-Popup] 🛑 Analytics auto-refresh stopped');
  }
});

// ============================================================================
// API KEY MANAGEMENT
// ============================================================================

async function checkApiKey() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getApiKey' });
    if (response.success && response.hasKey) {
      elements.apiSection.classList.add('hidden');
      console.log('[WebWeaver-Popup] ✅ API key configured');
    } else {
      elements.apiSection.classList.remove('hidden');
      console.log('[WebWeaver-Popup] ⚠️ No API key found');
    }
  } catch (error) {
    console.error('[WebWeaver-Popup] ❌ Check API key failed:', error);
  }
}

async function handleSaveApiKey() {
  const apiKey = elements.apiKeyInput.value.trim();
  
  if (!apiKey) {
    showStatus('Please enter an API key', 'error');
    return;
  }

  showStatus('Saving API key...', 'loading');
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'saveApiKey',
      apiKey: apiKey
    });

    if (response.success) {
      showStatus('✅ API key saved successfully!', 'success');
      elements.apiKeyInput.value = '';
      setTimeout(() => {
        elements.apiSection.classList.add('hidden');
        hideStatus();
      }, 2000);
    } else {
      showStatus(`❌ ${response.error}`, 'error');
    }
  } catch (error) {
    showStatus('❌ Failed to save API key', 'error');
    console.error('[WebWeaver-Popup] ❌ Save error:', error);
  }
}

// ============================================================================
// AI TOGGLE
// ============================================================================

async function loadAiToggle() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getAiEnabled' });
    if (response.success) {
      aiEnabled = response.enabled;
      elements.aiToggle.checked = aiEnabled;
      updateAnalyticsVisibility();
    }
  } catch (error) {
    console.error('[WebWeaver-Popup] ❌ Load AI toggle failed:', error);
  }
}

async function handleAiToggle() {
  aiEnabled = elements.aiToggle.checked;
  
  try {
    await chrome.runtime.sendMessage({
      action: 'setAiEnabled',
      enabled: aiEnabled
    });
    
    updateAnalyticsVisibility();
    const mode = aiEnabled ? 'AI-Enhanced' : 'Basic';
    showStatus(`🔄 Switched to ${mode} mode`, 'success');
    setTimeout(hideStatus, 2000);
    console.log(`[WebWeaver-Popup] 🔄 AI ${aiEnabled ? 'ENABLED' : 'DISABLED'}`);
  } catch (error) {
    console.error('[WebWeaver-Popup] ❌ Toggle AI failed:', error);
  }
}

function updateAnalyticsVisibility() {
  elements.analytics.style.display = aiEnabled ? 'block' : 'none';
}

// ============================================================================
// EXTRACTION
// ============================================================================

async function handleExtract() {
  console.log('[WebWeaver-Popup] 🎯 Extract clicked');
  elements.extractBtn.disabled = true;
  
  const mode = aiEnabled ? 'AI-Enhanced' : 'Basic';
  showStatus(`⏳ Extracting data (${mode} mode)...`, 'loading');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.id) {
      throw new Error('No active tab found');
    }

    if (tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
      throw new Error('Cannot extract from Chrome internal pages. Please navigate to a real website.');
    }

    const startTime = Date.now();

    const response = await chrome.runtime.sendMessage({
      action: 'extract',
      tabId: tab.id,
      useAI: aiEnabled
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    if (response.success) {
      currentData = response.data;
      displayResults(response.data);

      const confidence = response.data._meta?.confidence || 0;
      const confidenceText = aiEnabled ? ` • ${confidence}% confidence` : '';
      showStatus(`✅ Extraction complete in ${duration}s${confidenceText}`, 'success');

      elements.copyBtn.disabled = false;
      elements.jsonBtn.disabled = false;
      elements.csvBtn.disabled = false;

      await loadAnalytics();
      console.log('[WebWeaver-Popup] 📊 Analytics refreshed after extraction');

      setTimeout(hideStatus, 3000);
    } else {
      throw new Error(response.error || 'Extraction failed');
    }
  } catch (error) {
    console.error('[WebWeaver-Popup] ❌ Extract error:', error);
    showStatus(`❌ ${error.message}`, 'error');
    elements.results.textContent = `Error: ${error.message}`;
  } finally {
    elements.extractBtn.disabled = false;
  }
}

function displayResults(data) {
  const displayData = { ...data };
  const meta = displayData._meta;
  delete displayData._meta;
  delete displayData._hybrid;

  let output = '';

  if (meta && meta.aiEnhanced) {
    output += `🤖 AI-Enhanced Extraction\n`;
    output += `Type: ${meta.websiteType || 'unknown'}\n`;
    output += `Confidence: ${meta.confidence}%\n`;
    
    if (data.confidence_reasoning) {
      output += `Reasoning: ${data.confidence_reasoning}\n`;
    }
    
    output += `Time: ${new Date(meta.extractedAt).toLocaleTimeString()}\n`;
    output += '\n' + '─'.repeat(50) + '\n\n';
  } else if (meta) {
    output += `📦 Basic Extraction\n`;
    output += `Time: ${new Date(meta.extractedAt).toLocaleTimeString()}\n`;
    output += '\n' + '─'.repeat(50) + '\n\n';
  }

  output += JSON.stringify(displayData, null, 2);
  elements.results.textContent = output;
}

// ============================================================================
// ANALYTICS
// ============================================================================

async function loadAnalytics(silent = false) {
  if (!aiEnabled) return;

  try {
    const response = await chrome.runtime.sendMessage({ action: 'getAnalytics' });
    
    if (response.success) {
      const analytics = response.data;
      
      elements.totalExtractions.textContent = analytics.overall.total;
      elements.aiExtractions.textContent = analytics.overall.ai;

      const avgConf = analytics.overall.avgConfidence;
      elements.avgConfidence.textContent = avgConf + '%';
      elements.avgConfidence.className = 'stat-value ' + getConfidenceClass(avgConf);

      const successRate = analytics.overall.successRate;
      elements.successRate.textContent = successRate + '%';
      elements.successRate.className = 'stat-value ' + getConfidenceClass(successRate);

      if (avgConf >= analytics.target) {
        elements.targetStatus.textContent = '✅ Target reached!';
        elements.targetStatus.className = 'stat-value good';
      } else {
        const remaining = Math.max(0, analytics.target - avgConf);
        elements.targetStatus.textContent = `${remaining}% to go`;
        elements.targetStatus.className = 'stat-value warning';
      }

      if (!silent) {
        console.log('[WebWeaver-Popup] 📊 Analytics loaded:', {
          total: analytics.overall.total,
          ai: analytics.overall.ai,
          avgConfidence: avgConf,
          successRate: successRate,
          distribution: analytics.overall.confidenceDistribution
        });
        
        if (analytics.overall.confidenceDistribution) {
          console.log('[WebWeaver-Popup] 📈 Confidence Distribution:', analytics.overall.confidenceDistribution);
        }
      }
    }
  } catch (error) {
    if (!silent) {
      console.error('[WebWeaver-Popup] ❌ Load analytics failed:', error);
    }
  }
}

function getConfidenceClass(value) {
  if (value >= 80) return 'good';
  if (value >= 60) return 'warning';
  return 'bad';
}

// ============================================================================
// EXPORT
// ============================================================================

async function handleCopy() {
  if (!currentData) return;

  try {
    const text = JSON.stringify(currentData, null, 2);
    await navigator.clipboard.writeText(text);
    showStatus('📋 Copied to clipboard!', 'success');
    setTimeout(hideStatus, 2000);
  } catch (error) {
    showStatus('❌ Copy failed', 'error');
    console.error('[WebWeaver-Popup] ❌ Copy error:', error);
  }
}

async function handleExport(format) {
  if (!currentData) return;

  try {
    let content, filename, mimeType;

    if (format === 'json') {
      content = JSON.stringify(currentData, null, 2);
      filename = `web-weaver-${Date.now()}.json`;
      mimeType = 'application/json';
    } else if (format === 'csv') {
      content = convertToFlatCSV(currentData);
      filename = `web-weaver-flat-${Date.now()}.csv`;
      mimeType = 'text/csv;charset=utf-8;';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    showStatus(`💾 Downloaded ${format.toUpperCase()}!`, 'success');
    setTimeout(hideStatus, 2000);
    console.log(`[WebWeaver-Popup] 💾 Exported as ${format}`);
  } catch (error) {
    showStatus(`❌ Export failed`, 'error');
    console.error('[WebWeaver-Popup] ❌ Export error:', error);
  }
}

// ============================================================================
// PRIORITY 6: UNIVERSAL HUMAN-READABLE FLAT CSV EXPORT
// ============================================================================

function convertToFlatCSV(data) {
  console.log('[Popup] 🔧 Flattening data for CSV...');
  
  const rows = [];
  const commonFields = {
    url: data.url,
    domain: data.domain,
    title: data.title,
    pageLayout: data.pageLayout,
    extractedAt: data._meta?.extractedAt || new Date().toISOString(),
    method: data._meta?.method || 'unknown',
    overall_confidence: data.confidence_score || data._meta?.confidence || 0
  };
  
  const itemKeys = Object.keys(data)
    .filter(k => !isNaN(k) && parseInt(k) < 100)
    .sort((a, b) => parseInt(a) - parseInt(b));
  
  if (itemKeys.length > 0) {
    console.log(`[Popup] 📦 Multi-item: ${itemKeys.length} items found`);
    
    itemKeys.forEach(key => {
      const item = data[key];
      rows.push({
        item_index: parseInt(key) + 1,
        ...flattenObject(item),
        ...commonFields
      });
    });
  } else {
    console.log('[Popup] 📄 Single-item extraction');
    
    const cleanData = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (key === '_meta' || key === '_hybrid') continue;
      
      // ✅ PRIORITY 6B: Skip empty/null fields for cleaner CSV
      if (value === null || value === undefined || value === '') continue;
      
      if (key === 'mainText' && typeof value === 'string' && value.length > 500) {
        cleanData[key] = value.substring(0, 500) + '...';
        continue;
      }
      
      if (typeof value !== 'object') {
        cleanData[key] = value;
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          continue; // ✅ Skip empty arrays
        } else if (typeof value[0] === 'object' && value[0] !== null) {
          console.log(`[Popup] ⏭️ Skipping complex array: ${key}`);
          continue;
        } else {
          cleanData[key] = value.join('; ');
        }
      } else {
        console.log(`[Popup] ⏭️ Skipping complex object: ${key}`);
        continue;
      }
    }
    
    rows.push({
      ...cleanData,
      ...commonFields
    });
  }
  
  return buildCSVFromRows(rows);
}

function flattenObject(obj, maxDepth = 1) {
  const flat = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      flat[key] = '';
    } else if (typeof value !== 'object') {
      flat[key] = value;
    } else if (Array.isArray(value)) {
      const simpleValues = value.filter(v => typeof v !== 'object' || v === null);
      flat[key] = simpleValues.join('; ');
    }
  }
  
  return flat;
}

function buildCSVFromRows(rows) {
  if (rows.length === 0) {
    console.error('[Popup] ❌ No rows to build CSV');
    return '';
  }
  
  const priorityColumns = [
    'item_index',
    'product_name', 'article_title', 'blog_title',
    'price', 'original_price', 'discount_percentage',
    'rating', 'number_of_reviews',
    'article_author', 'blog_author', 'author',
    'publication_date', 'article_date', 'blog_publication_date',
    'estimated_reading_time', 'number_of_comments', 'number_of_likes',
    'confidence_score', 'confidence_reasoning',
    'url', 'domain', 'pageLayout', 'method'
  ];
  
  const allKeys = new Set();
  rows.forEach(row => {
    Object.keys(row).forEach(key => {
      if (typeof row[key] !== 'object' || row[key] === null) {
        allKeys.add(key);
      }
    });
  });
  
  const headers = [
    ...priorityColumns.filter(col => allKeys.has(col)),
    ...Array.from(allKeys)
      .filter(col => !priorityColumns.includes(col))
      .sort()
  ];
  
  let csv = headers.join(',') + '\n';
  
  rows.forEach(row => {
    const values = headers.map(header => {
      let value = row[header];
      
      if (value === null || value === undefined) return '';
      
      value = String(value);
      
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        value = '"' + value.replace(/"/g, '""') + '"';
      }
      
      return value;
    });
    
    csv += values.join(',') + '\n';
  });
  
  console.log(`[Popup] ✅ Built CSV: ${rows.length} rows × ${headers.length} columns`);
  return csv;
}

// ============================================================================
// UI HELPERS
// ============================================================================

function showStatus(message, type) {
  elements.status.textContent = message;
  elements.status.className = `status ${type}`;
  elements.status.classList.remove('hidden');
}

function hideStatus() {
  elements.status.classList.add('hidden');
}

// ============================================================================
// DAY 10: HYBRID CLASSIFIER
// ============================================================================

async function extractWithHybridClassifier() {
  console.log('[Popup] 🎯 Starting Hybrid Extraction...');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const response = await chrome.runtime.sendMessage({
      action: 'extractWithHybrid',
      tabId: tab.id
    });

    if (response.success) {
      const hybrid = response.data._hybrid;
      console.log('[Popup] ✅ Hybrid extraction complete!');
      console.log('[Popup] 📊 Layer 1:', hybrid.layer1Classification, `(${hybrid.layer1Confidence}%)`);
      console.log('[Popup] 🤖 Layer 2:', hybrid.layer2Used ? 'Used' : 'Skipped');
      console.log('[Popup] 📋 Layer 3:', hybrid.layer3Prompt);
      console.log('[Popup] ⏱️ Total time:', hybrid.totalPipelineTime + 'ms');
      
      await loadAnalytics();
      
      return response.data;
    } else {
      throw new Error(response.error || 'Extraction failed');
    }
  } catch (error) {
    console.error('[Popup] ❌ Hybrid extraction failed:', error);
    throw error;
  }
}

function setupHybridButton() {
  const hybridBtn = document.getElementById('extractHybridBtn');
  const hybridInfo = document.getElementById('hybridInfo');

  if (hybridBtn) {
    console.log('[Popup] 🔥 Hybrid button found, attaching listener');
    
    hybridBtn.addEventListener('click', async () => {
      console.log('[Popup] 🔥 Hybrid Extract clicked');
      hybridBtn.disabled = true;
      showStatus('⏳ Hybrid classification in progress...', 'loading');

      try {
        const data = await extractWithHybridClassifier();

        if (data && data._hybrid) {
          hybridInfo.classList.remove('hidden');

          document.getElementById('layer1Result').textContent = 
            `${data._hybrid.layer1Classification} (${data._hybrid.layer1Confidence}%)`;
          
          document.getElementById('layer2Result').textContent = 
            data._hybrid.layer2Used ? `Used (${data._hybrid.layer2Time}ms)` : 'Skipped';
          
          document.getElementById('layer3Result').textContent = 
            data._hybrid.layer3Prompt;
          
          document.getElementById('totalTime').textContent = 
            `${data._hybrid.totalPipelineTime}ms`;

          currentData = data;
          displayResults(data);

          elements.copyBtn.disabled = false;
          elements.jsonBtn.disabled = false;
          elements.csvBtn.disabled = false;

          showStatus('✅ Hybrid extraction complete!', 'success');
        }
      } catch (error) {
        console.error('[Popup] ❌ Hybrid extraction error:', error);
        showStatus(`❌ ${error.message}`, 'error');
      } finally {
        hybridBtn.disabled = false;
      }
    });
  } else {
    console.warn('[Popup] ⚠️ Hybrid button not found in DOM');
  }
}

// ============================================================================
// READY
// ============================================================================

console.log('[WebWeaver-Popup] ✅ Script loaded');
