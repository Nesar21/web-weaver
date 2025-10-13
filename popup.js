/**
 * Web Weaver Lightning - Popup UI Controller
 * Version: 2.0.0 (Day 11 Enhancement)
 * Author: FAANG-Level Developer Agent
 * 
 * MAJOR CHANGES IN V2.0:
 * - Smart Auto Mode integration
 * - Real-time quota monitoring
 * - Confidence meter with tiers
 * - Auto decision reasoning display
 * - Today's analytics mini-dashboard
 * - Enhanced metadata display
 */

console.log('[Popup] Web Weaver Lightning v2.0 loading...');

// ========================================
// STATE MANAGEMENT
// ========================================

let currentMode = 'auto'; // Default to Smart Auto
let selectedMode = 'auto';
let isExtracting = false;
let lastExtractionData = null;

// ========================================
// DOM ELEMENTS
// ========================================

// API Key
const apiKeyInput = document.getElementById('apiKeyInput');
const saveKeyBtn = document.getElementById('saveKeyBtn');

// Mode Selector
const modeBtns = document.querySelectorAll('.mode-btn');

// Quota
const quotaSection = document.getElementById('quotaSection');
const quotaValue = document.getElementById('quotaValue');
const quotaBarFill = document.getElementById('quotaBarFill');
const quotaReset = document.getElementById('quotaReset');

// Extract Button
const extractBtn = document.getElementById('extractBtn');
const extractBtnText = document.getElementById('extractBtnText');

// Auto Decision
const autoDecision = document.getElementById('autoDecision');
const autoDecisionMode = document.getElementById('autoDecisionMode');
const autoDecisionReason = document.getElementById('autoDecisionReason');

// Results
const resultPlaceholder = document.getElementById('resultPlaceholder');
const resultContainer = document.getElementById('resultContainer');
const confidenceValue = document.getElementById('confidenceValue');
const confidenceBarFill = document.getElementById('confidenceBarFill');
const confidenceTier = document.getElementById('confidenceTier');
const confidenceTierIcon = document.getElementById('confidenceTierIcon');
const confidenceTierText = document.getElementById('confidenceTierText');

// Metadata
const metadataMode = document.getElementById('metadataMode');
const metadataApiCalls = document.getElementById('metadataApiCalls');
const metadataDuration = document.getElementById('metadataDuration');
const metadataClassification = document.getElementById('metadataClassification');
const resultData = document.getElementById('resultData');

// Action Buttons
const copyBtn = document.getElementById('copyBtn');
const downloadJsonBtn = document.getElementById('downloadJsonBtn');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');

// Analytics
const statsTotal = document.getElementById('statsTotal');
const statsEco = document.getElementById('statsEco');
const statsConfidence = document.getElementById('statsConfidence');
const statsSuccess = document.getElementById('statsSuccess');

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Popup] Initializing UI...');
  
  // Load saved API key
  await loadApiKey();
  
  // Load quota status
  await updateQuotaDisplay();
  
  // Load analytics
  await updateAnalytics();
  
  // Setup event listeners
  setupEventListeners();
  
  console.log('[Popup] UI initialized successfully');
});

// ========================================
// API KEY MANAGEMENT
// ========================================

async function loadApiKey() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getApiKey' });
    if (response && response.apiKey) {
      apiKeyInput.value = response.apiKey;
      apiKeyInput.type = 'password';
      console.log('[Popup] API key loaded');
    }
  } catch (error) {
    console.error('[Popup] Failed to load API key:', error);
  }
}

async function saveApiKey() {
  const apiKey = apiKeyInput.value.trim();
  
  if (!apiKey) {
    alert('Please enter an API key');
    return;
  }
  
  try {
    await chrome.runtime.sendMessage({ 
      action: 'saveApiKey', 
      apiKey 
    });
    
    apiKeyInput.type = 'password';
    saveKeyBtn.textContent = '✓ Saved';
    
    setTimeout(() => {
      saveKeyBtn.textContent = 'Save';
    }, 2000);
    
    console.log('[Popup] API key saved');
  } catch (error) {
    console.error('[Popup] Failed to save API key:', error);
    alert('Failed to save API key. Please try again.');
  }
}

// ========================================
// MODE SELECTION
// ========================================

function selectMode(mode) {
  console.log('[Popup] Mode selected:', mode);
  
  selectedMode = mode;
  
  // Update UI
  modeBtns.forEach(btn => {
    if (btn.dataset.mode === mode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Hide auto decision if not in auto mode
  if (mode !== 'auto') {
    autoDecision.classList.add('hidden');
  }
}

// ========================================
// QUOTA MANAGEMENT
// ========================================

async function updateQuotaDisplay() {
  try {
    const response = await chrome.runtime.sendMessage({ 
      action: 'getQuotaStatus' 
    });
    
    if (response && response.success && response.data) {
      const quota = response.data;
      
      // Update values
      quotaValue.textContent = `${quota.used || 0} / ${quota.total || 1500}`;
      const percent = quota.percent || ((quota.used || 0) / (quota.total || 1500));
      quotaBarFill.style.width = `${percent * 100}%`;
      
      // Update reset time
      if (quota.resetTime) {
        const resetDate = new Date(quota.resetTime);
        quotaReset.textContent = `Resets at ${resetDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`;
      }
      
      // Update status styling
      quotaSection.className = 'quota-section';
      
      if (quota.status === 'critical') {
        quotaSection.classList.add('critical');
      } else if (quota.status === 'warning') {
        quotaSection.classList.add('warning');
      }
      
      console.log('[Popup] Quota updated:', quota.used, '/', quota.total);
    }
  } catch (error) {
    console.error('[Popup] Failed to update quota:', error);
  }
}

// ========================================
// EXTRACTION
// ========================================

async function extractData() {
  if (isExtracting) {
    console.log('[Popup] Extraction already in progress');
    return;
  }
  
  isExtracting = true;
  
  // Update button state
  extractBtn.disabled = true;
  extractBtn.innerHTML = `
    <div class="spinner"></div>
    <span>Extracting...</span>
  `;
  
  console.log('[Popup] Starting extraction | Mode:', selectedMode);
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'extractData',
      mode: selectedMode
    });
    
    if (response && response.success) {
      console.log('[Popup] ✅ Extraction successful');
      
      // Store data
      lastExtractionData = response;
      
      // Display results
      displayResults(response);
      
      // Update quota
      await updateQuotaDisplay();
      
      // Update analytics
      await updateAnalytics();
      
    } else {
      console.error('[Popup] ❌ Extraction failed:', response.error);
      
      // Handle specific errors
      if (response.suggestQueue) {
        // Quota exhausted - offer queue option
        const shouldQueue = confirm(response.message + '\n\nAdd to queue?');
        if (shouldQueue) {
          // TODO: Implement queue functionality
          alert('Queue feature coming soon!');
        }
      } else if (response.rateLimitInfo) {
        // Rate limit hit - show queue info
        alert(response.message);
      } else {
        // Generic error
        alert(`Extraction failed: ${response.error || 'Unknown error'}`);
      }
    }
    
  } catch (error) {
    console.error('[Popup] ❌ Extraction failed:', error);
    alert(`Extraction failed: ${error.message}`);
  } finally {
    // Reset button state
    isExtracting = false;
    extractBtn.disabled = false;
    extractBtn.innerHTML = `
      <span>🚀</span>
      <span>Extract Data</span>
    `;
  }
}

// ========================================
// RESULTS DISPLAY
// ========================================

function displayResults(response) {
  const { data, metadata } = response;
  
  console.log('[Popup] Displaying results | Confidence:', metadata.confidence);
  
  // Show results container
  resultPlaceholder.classList.add('hidden');
  resultContainer.classList.remove('hidden');
  
  // Display Auto Decision (if applicable)
  if (metadata.autoDecision) {
    autoDecision.classList.remove('hidden');
    autoDecisionMode.textContent = metadata.mode.toUpperCase();
    autoDecisionReason.textContent = metadata.autoDecision.reasoning;
  }
  
  // Update confidence meter
  updateConfidenceMeter(metadata.confidence || 0);
  
  // Update metadata
  metadataMode.textContent = (metadata.mode || 'unknown').toUpperCase();
  metadataApiCalls.textContent = metadata.apiCalls || 0;
  metadataDuration.textContent = ((metadata.duration || 0) / 1000).toFixed(1) + 's';
  metadataClassification.textContent = formatClassification(metadata.classification);
  
  // Display mode badge styling
  if (metadata.upgraded) {
    metadataMode.textContent += ' ⬆️';
  } else if (metadata.downgraded) {
    metadataMode.textContent += ' ⬇️';
  }
  
  if (metadata.cached) {
    metadataMode.textContent += ' 💾';
  }
  
  // Display extracted data
  resultData.textContent = JSON.stringify(data, null, 2);
}

function updateConfidenceMeter(confidence) {
  confidenceValue.textContent = confidence + '%';
  confidenceBarFill.style.width = confidence + '%';
  
  // Determine tier and color
  let tier, color, icon, text;
  
  if (confidence >= 90) {
    tier = 'excellent';
    color = '#10b981'; // green
    icon = '🟢';
    text = 'Excellent';
  } else if (confidence >= 75) {
    tier = 'good';
    color = '#f59e0b'; // orange
    icon = '🟡';
    text = 'Good';
  } else {
    tier = 'caution';
    color = '#ef4444'; // red
    icon = '🔴';
    text = 'Caution';
  }
  
  confidenceBarFill.style.background = color;
  confidenceTier.className = `confidence-tier ${tier}`;
  confidenceTierIcon.textContent = icon;
  confidenceTierText.textContent = text;
  confidenceTier.classList.remove('hidden');
}

function formatClassification(classification) {
  if (!classification) return 'Unknown';
  
  const map = {
    'SINGLE_ITEM': '1 Item',
    'MULTI_ITEM': 'Multiple',
    'UNCERTAIN': 'Uncertain',
    'NONE': 'None'
  };
  
  return map[classification] || classification;
}

// ========================================
// ANALYTICS
// ========================================

async function updateAnalytics() {
  try {
    const response = await chrome.runtime.sendMessage({ 
      action: 'getAnalytics' 
    });
    
    // ✅ FIX: Add safety checks for undefined data
    if (response && response.success && response.data && response.data.today) {
      const analytics = response.data;
      const today = analytics.today;
      
      // Update stats with fallback values
      statsTotal.textContent = today.totalExtractions || 0;
      
      // Calculate Eco percentage
      const totalModeUsage = (today.modeUsage?.eco || 0) + 
                            (today.modeUsage?.balanced || 0) + 
                            (today.modeUsage?.auto || 0);
      const ecoPercent = totalModeUsage > 0 
        ? Math.round((today.modeUsage?.eco || 0) / totalModeUsage * 100)
        : 0;
      statsEco.textContent = ecoPercent + '%';
      
      // Avg confidence
      statsConfidence.textContent = Math.round(today.avgConfidence || 0) + '%';
      
      // Success rate
      const successRate = today.successRate || 0;
      statsSuccess.textContent = Math.round(successRate * 100) + '%';
      
      console.log('[Popup] Analytics updated');
    } else {
      console.warn('[Popup] Analytics data not available');
      // Set default values
      statsTotal.textContent = '0';
      statsEco.textContent = '0%';
      statsConfidence.textContent = '0%';
      statsSuccess.textContent = '0%';
    }
  } catch (error) {
    console.error('[Popup] Failed to update analytics:', error);
  }
}

// ========================================
// ACTION BUTTONS
// ========================================

function copyToClipboard() {
  if (!lastExtractionData) {
    alert('No data to copy');
    return;
  }
  
  const text = JSON.stringify(lastExtractionData.data, null, 2);
  
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.innerHTML = '<span>✓</span><span>Copied!</span>';
    setTimeout(() => {
      copyBtn.innerHTML = '<span>📋</span><span>Copy</span>';
    }, 2000);
  }).catch(err => {
    console.error('[Popup] Copy failed:', err);
    alert('Failed to copy to clipboard');
  });
}

function downloadJson() {
  if (!lastExtractionData) {
    alert('No data to download');
    return;
  }
  
  const dataStr = JSON.stringify(lastExtractionData.data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `web-weaver-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('[Popup] JSON downloaded');
}

function downloadCsv() {
  if (!lastExtractionData) {
    alert('No data to download');
    return;
  }
  
  const data = lastExtractionData.data;
  let csv = '';
  
  // Handle array of objects
  if (Array.isArray(data) && data.length > 0) {
    // Get headers
    const headers = Object.keys(data[0]);
    csv = headers.join(',') + '\n';
    
    // Add rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      });
      csv += values.join(',') + '\n';
    });
  }
  // Handle single object
  else if (typeof data === 'object') {
    csv = 'Field,Value\n';
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = '"' + value.replace(/"/g, '""') + '"';
      }
      csv += `${key},${value}\n`;
    });
  }
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `web-weaver-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('[Popup] CSV downloaded');
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  // API Key
  saveKeyBtn.addEventListener('click', saveApiKey);
  apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveApiKey();
  });
  
  // Mode Selection
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectMode(btn.dataset.mode);
    });
  });
  
  // Extract Button
  extractBtn.addEventListener('click', extractData);
  
  // Action Buttons
  copyBtn.addEventListener('click', copyToClipboard);
  downloadJsonBtn.addEventListener('click', downloadJson);
  downloadCsvBtn.addEventListener('click', downloadCsv);
  
  console.log('[Popup] Event listeners registered');
}

// ========================================
// AUTO-REFRESH QUOTA & ANALYTICS
// ========================================

// Refresh quota every 30 seconds
setInterval(() => {
  updateQuotaDisplay();
}, 30000);

// Refresh analytics every 60 seconds
setInterval(() => {
  updateAnalytics();
}, 60000);

console.log('[Popup] Auto-refresh timers started');
