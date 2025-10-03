// Web Weaver Lightning - Popup Controller
// Complete Days 1-10 implementation
// Handles UI, extraction, export, and analytics

console.log('[WebWeaver-Popup] Loading...');

// ============================================================================
// STATE
// ============================================================================

let currentData = null;
let aiEnabled = true;

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const elements = {
  // API Section
  apiSection: document.getElementById('apiSection'),
  apiKeyInput: document.getElementById('apiKeyInput'),
  saveKeyBtn: document.getElementById('saveKeyBtn'),
  
  // AI Toggle
  aiToggle: document.getElementById('aiToggle'),
  
  // Extract
  extractBtn: document.getElementById('extractBtn'),
  
  // Status
  status: document.getElementById('status'),
  
  // Results
  results: document.getElementById('results'),
  
  // Export
  copyBtn: document.getElementById('copyBtn'),
  jsonBtn: document.getElementById('jsonBtn'),
  csvBtn: document.getElementById('csvBtn'),
  
  // Analytics
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
  setupHybridButton(); // NEW: Setup hybrid button
  
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
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.id) {
      throw new Error('No active tab found');
    }
    
    // Check if on valid page
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
      throw new Error('Cannot extract from Chrome internal pages. Please navigate to a real website.');
    }
    
    // Start timer
    const startTime = Date.now();
    
    // Send extraction request
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
      
      // Enable export buttons
      elements.copyBtn.disabled = false;
      elements.jsonBtn.disabled = false;
      elements.csvBtn.disabled = false;
      
      // Reload analytics if AI was used
      if (aiEnabled) {
        await loadAnalytics();
      }
      
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
  // Create clean display version (without _meta for readability)
  const displayData = { ...data };
  const meta = displayData._meta;
  delete displayData._meta;
  delete displayData._hybrid; // Don't show in standard view
  
  let output = '';
  
  // Show metadata header if AI was used
  if (meta && meta.aiEnhanced) {
    output += `🤖 AI-Enhanced Extraction\n`;
    output += `Type: ${meta.websiteType || 'unknown'}\n`;
    output += `Confidence: ${meta.confidence}%\n`;
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

async function loadAnalytics() {
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
      
      // Target status (Day 10: 80% goal)
      if (avgConf >= analytics.target) {
        elements.targetStatus.textContent = '✅ Target reached!';
        elements.targetStatus.className = 'stat-value good';
      } else {
        elements.targetStatus.textContent = `${analytics.target - avgConf}% to go`;
        elements.targetStatus.className = 'stat-value warning';
      }
      
      console.log('[WebWeaver-Popup] 📊 Analytics loaded:', analytics);
    }
  } catch (error) {
    console.error('[WebWeaver-Popup] ❌ Load analytics failed:', error);
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
      content = convertToCSV(currentData);
      filename = `web-weaver-${Date.now()}.csv`;
      mimeType = 'text/csv';
    }
    
    // Create download
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

function convertToCSV(data) {
  // Flatten data for CSV
  const flatData = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (key === '_meta' || key === '_hybrid') continue; // Skip metadata
    
    if (Array.isArray(value)) {
      flatData[key] = value.join('; ');
    } else if (typeof value === 'object' && value !== null) {
      flatData[key] = JSON.stringify(value);
    } else {
      flatData[key] = value;
    }
  }
  
  // Create CSV
  const headers = Object.keys(flatData).join(',');
  const values = Object.values(flatData).map(v => {
    if (v === null || v === undefined) return '';
    const str = String(v).replace(/"/g, '""');
    return `"${str}"`;
  }).join(',');
  
  return `${headers}\n${values}`;
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
    
    // Send hybrid extraction request to background
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
          // Show hybrid info panel
          hybridInfo.classList.remove('hidden');
          
          // Populate hybrid metrics
          document.getElementById('layer1Result').textContent = 
            `${data._hybrid.layer1Classification} (${data._hybrid.layer1Confidence}%)`;
          
          document.getElementById('layer2Result').textContent = 
            data._hybrid.layer2Used ? `Used (${data._hybrid.layer2Time}ms)` : 'Skipped';
          
          document.getElementById('layer3Result').textContent = 
            data._hybrid.layer3Prompt;
          
          document.getElementById('totalTime').textContent = 
            `${data._hybrid.totalPipelineTime}ms`;
          
          // Display full results
          currentData = data;
          displayResults(data);
          
          // Enable export buttons
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
