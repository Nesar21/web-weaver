/**
 * Web Weaver Lightning - Popup UI Controller
 * Version: 3.1.0 (Day 13 - VISUAL CONFIDENCE FEEDBACK)
 * 
 * 🆕 v3.1 ENHANCEMENTS:
 * - #4: Color-coded confidence tiers (High/Good/Medium/Low)
 * - #4: Visual feedback with tier icons
 * - #2: Domain adjustment display
 */


// ========================================
// GLOBAL STATE
// ========================================


let currentData = null;
let currentMode = 'auto';
let extractionInProgress = false;


// ========================================
// INITIALIZATION
// ========================================


document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Popup] Initializing Web Weaver Lightning v3.1...');
  
  // Load API key
  await loadApiKey();
  
  // Setup event listeners
  setupEventListeners();
  
  // Load extraction history
  await loadExtractionHistory();
  
  // Initialize mode selector
  initializeModeSelector();
  
  console.log('[Popup] Initialization complete');
});


// ========================================
// EVENT LISTENERS
// ========================================


function setupEventListeners() {
  // API Key save
  document.getElementById('saveApiKey').addEventListener('click', saveApiKey);
  
  // Mode selection
  document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentMode = e.target.value;
      updateModeUI();
    });
  });
  
  // Extract button
  document.getElementById('extractBtn').addEventListener('click', handleExtract);
  
  // Export buttons
  document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
  document.getElementById('downloadJsonBtn').addEventListener('click', downloadJSON);
  document.getElementById('downloadCsvBtn').addEventListener('click', downloadCSV);
  
  // Clear cache
  const clearCacheBtn = document.getElementById('clearCacheBtn');
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', clearCache);
  }
}


// ========================================
// API KEY MANAGEMENT
// ========================================


async function loadApiKey() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getApiKey' });
    if (response && response.apiKey) {
      document.getElementById('apiKey').value = response.apiKey;
      showSuccess('API key loaded');
    }
  } catch (error) {
    console.error('[Popup] Error loading API key:', error);
  }
}


async function saveApiKey() {
  const apiKey = document.getElementById('apiKey').value.trim();
  
  if (!apiKey) {
    showError('Please enter an API key');
    return;
  }
  
  if (!apiKey.startsWith('AIza')) {
    showError('Invalid API key format. Gemini keys start with "AIza"');
    return;
  }
  
  try {
    await chrome.runtime.sendMessage({ 
      action: 'saveApiKey', 
      apiKey 
    });
    
    showSuccess('API key saved successfully');
  } catch (error) {
    console.error('[Popup] Error saving API key:', error);
    showError('Failed to save API key');
  }
}


// ========================================
// MODE SELECTOR UI
// ========================================


function initializeModeSelector() {
  // Set default mode
  document.getElementById('mode-auto').checked = true;
  currentMode = 'auto';
  updateModeUI();
}


function updateModeUI() {
  // Update mode descriptions
  const modeDescriptions = {
    offline: {
      icon: '🟢',
      title: 'Offline Mode',
      desc: 'DOM extraction only - No AI calls',
      apiCalls: '0 API calls',
      speed: 'Instant',
      accuracy: '~60%'
    },
    min: {
      icon: '🌿',
      title: 'Min Mode',
      desc: 'Fast extraction with minimal AI',
      apiCalls: '~1.4 API calls',
      speed: 'Very Fast',
      accuracy: '~75%'
    },
    balanced: {
      icon: '⚖️',
      title: 'Balanced Mode',
      desc: 'Smart extraction with verification',
      apiCalls: '~2.4 API calls',
      speed: 'Fast',
      accuracy: '~85%'
    },
    max: {
      icon: '🚀',
      title: 'Max Mode',
      desc: 'Maximum accuracy with triple verification',
      apiCalls: '~3.8 API calls',
      speed: 'Thorough',
      accuracy: '~95%'
    },
    auto: {
      icon: '🤖',
      title: 'Smart Auto',
      desc: 'AI chooses best mode automatically',
      apiCalls: 'Variable',
      speed: 'Adaptive',
      accuracy: 'Optimized'
    }
  };
  
  const modeInfo = modeDescriptions[currentMode];
  
  // Update selected mode display (you can add a visual indicator here)
  console.log('[Popup] Mode selected:', currentMode);
}


// ========================================
// EXTRACTION HANDLER
// ========================================


async function handleExtract() {
  if (extractionInProgress) {
    showError('Extraction already in progress. Please wait.');
    return;
  }
  
  // Check API key (except for offline mode)
  if (currentMode !== 'offline') {
    const apiKey = document.getElementById('apiKey').value.trim();
    if (!apiKey) {
      showError('Please add your Gemini API key first');
      return;
    }
  }
  
  extractionInProgress = true;
  
  // Update UI
  const extractBtn = document.getElementById('extractBtn');
  extractBtn.disabled = true;
  extractBtn.textContent = '⏳ Extracting...';
  
  // Hide previous results
  document.getElementById('resultsSection').style.display = 'none';
  document.getElementById('errorSection').style.display = 'none';
  
  try {
    console.log('[Popup] Starting extraction | Mode:', currentMode);
    
    const startTime = Date.now();
    
    const response = await chrome.runtime.sendMessage({
      action: 'extractData',
      mode: currentMode
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (response.success) {
      currentData = response.data;
      displayResults(response);
      showSuccess(`Extraction complete in ${duration}s`);
      
      // Update history
      await loadExtractionHistory();
      
    } else {
      // Display error in extension (not browser popup)
      displayError(response.error, response.errorDetails);
    }
    
  } catch (error) {
    console.error('[Popup] Extraction error:', error);
    displayError('Extraction failed', error.message);
  } finally {
    extractionInProgress = false;
    extractBtn.disabled = false;
    extractBtn.textContent = '🚀 Extract Data';
  }
}


// ========================================
// 🆕 #4: ENHANCED RESULTS DISPLAY
// ========================================


function displayResults(response) {
  const { data, metadata } = response;
  
  // Show results section
  document.getElementById('resultsSection').style.display = 'block';
  document.getElementById('errorSection').style.display = 'none';
  
  // 🆕 #4: Display enhanced confidence with tier
  displayConfidenceTier(metadata.confidence, metadata.confidenceTier);
  
  // Display metadata
  document.getElementById('modeUsed').textContent = metadata.mode.toUpperCase() + (metadata.cached ? ' 💾' : '');
  document.getElementById('apiCalls').textContent = metadata.apiCalls || 0;
  document.getElementById('duration').textContent = metadata.duration + 'ms';
  document.getElementById('classification').textContent = metadata.classification || 'Unknown';
  
  // 🆕 #2: Display domain adjustment if present
  if (metadata.domainAdjustment && metadata.domainAdjustment !== 0) {
    const domainAdjustEl = document.getElementById('domainAdjustment');
    if (domainAdjustEl) {
      domainAdjustEl.style.display = 'block';
      const sign = metadata.domainAdjustment > 0 ? '+' : '';
      const color = metadata.domainAdjustment > 0 ? '#10B981' : '#EF4444';
      domainAdjustEl.innerHTML = `
        <div class="domain-adjustment" style="color: ${color}">
          <strong>📊 Domain Adjustment:</strong> ${sign}${metadata.domainAdjustment}%
          <br><small>Based on historical performance for this domain</small>
        </div>
      `;
    }
  }
  
  // Display Smart Auto decision if applicable
  if (metadata.autoDecision) {
    const autoDecisionEl = document.getElementById('autoDecision');
    if (autoDecisionEl) {
      autoDecisionEl.style.display = 'block';
      autoDecisionEl.innerHTML = `
        <div class="auto-decision">
          <strong>🤖 Smart Auto Decision:</strong> ${metadata.mode.toUpperCase()}<br>
          <small>${metadata.autoDecision.reasoning}</small>
        </div>
      `;
    }
  }
  
  // Display extracted data
  const dataPreview = document.getElementById('dataPreview');
  dataPreview.textContent = JSON.stringify(data, null, 2);
  
  // Highlight JSON syntax
  highlightJSON(dataPreview);
}


// ========================================
// 🆕 #4: ENHANCED CONFIDENCE DISPLAY
// ========================================


/**
 * 🆕 v3.1: Display confidence with visual tier feedback
 */
function displayConfidenceTier(confidence, confidenceTier) {
  const scoreEl = document.getElementById('confidenceScore');
  const badgeEl = document.getElementById('confidenceBadge');
  const tierDescEl = document.getElementById('confidenceTierDesc');
  
  scoreEl.textContent = confidence + '%';
  
  // Use tier from background.js if available
  if (confidenceTier) {
    // Use server-provided tier
    badgeEl.innerHTML = `${confidenceTier.icon} ${confidenceTier.label}`;
    badgeEl.style.backgroundColor = confidenceTier.color;
    badgeEl.style.color = '#ffffff';
    badgeEl.style.padding = '4px 12px';
    badgeEl.style.borderRadius = '12px';
    badgeEl.style.fontSize = '13px';
    badgeEl.style.fontWeight = 'bold';
    
    scoreEl.style.color = confidenceTier.color;
    
    if (tierDescEl) {
      tierDescEl.textContent = confidenceTier.description;
      tierDescEl.style.color = '#6B7280';
      tierDescEl.style.fontSize = '12px';
    }
  } else {
    // Fallback: Calculate tier client-side
    let tier, color, icon, label, description;
    
    if (confidence >= 90) {
      tier = 'high';
      color = '#0066FF';
      icon = '🔵';
      label = 'High';
      description = 'Excellent extraction quality';
    } else if (confidence >= 80) {
      tier = 'good';
      color = '#00CC66';
      icon = '🟢';
      label = 'Good';
      description = 'Strong extraction quality';
    } else if (confidence >= 65) {
      tier = 'medium';
      color = '#FFAA00';
      icon = '🟡';
      label = 'Medium';
      description = 'Acceptable extraction quality';
    } else {
      tier = 'low';
      color = '#FF3333';
      icon = '🔴';
      label = 'Low';
      description = 'Poor extraction quality - verify data';
    }
    
    badgeEl.innerHTML = `${icon} ${label}`;
    badgeEl.style.backgroundColor = color;
    badgeEl.style.color = '#ffffff';
    badgeEl.style.padding = '4px 12px';
    badgeEl.style.borderRadius = '12px';
    badgeEl.style.fontSize = '13px';
    badgeEl.style.fontWeight = 'bold';
    
    scoreEl.style.color = color;
    
    if (tierDescEl) {
      tierDescEl.textContent = description;
      tierDescEl.style.color = '#6B7280';
      tierDescEl.style.fontSize = '12px';
    }
  }
  
  console.log('[Popup] 🆕 #4: Confidence tier displayed:', confidence + '%', confidenceTier?.label || 'calculated');
}


function displayError(error, details = null) {
  // Show error section IN EXTENSION (not browser alert)
  document.getElementById('resultsSection').style.display = 'none';
  document.getElementById('errorSection').style.display = 'block';
  
  const errorEl = document.getElementById('errorMessage');
  
  if (details) {
    errorEl.innerHTML = `
      <strong>${error}</strong><br><br>
      <p>${details}</p>
    `;
  } else {
    errorEl.textContent = error;
  }
  
  // Scroll to error
  errorEl.scrollIntoView({ behavior: 'smooth' });
}


// ========================================
// EXPORT FUNCTIONS
// ========================================


function copyToClipboard() {
  if (!currentData) {
    showError('No data to copy');
    return;
  }
  
  const jsonString = JSON.stringify(currentData, null, 2);
  
  navigator.clipboard.writeText(jsonString).then(() => {
    showSuccess('Copied to clipboard');
  }).catch(err => {
    showError('Failed to copy: ' + err.message);
  });
}


function downloadJSON() {
  if (!currentData) {
    showError('No data to download');
    return;
  }
  
  const jsonString = JSON.stringify(currentData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `web-weaver-${Date.now()}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  showSuccess('JSON downloaded');
}


async function downloadCSV() {
  if (!currentData) {
    showError('No data to download');
    return;
  }
  
  try {
    // Check if data is complex (nested objects/arrays)
    const isComplex = isComplexJSON(currentData);
    
    if (isComplex) {
      // Use AI for complex data
      showInfo('Converting complex data to CSV with AI...');
      
      const apiKey = document.getElementById('apiKey').value.trim();
      if (!apiKey) {
        showError('API key required for AI CSV conversion');
        return;
      }
      
      const response = await chrome.runtime.sendMessage({
        action: 'convertToCSV',
        data: currentData,
        apiKey
      });
      
      if (response.success) {
        downloadCSVFile(response.csv);
        showSuccess('CSV downloaded (AI-powered)');
      } else {
        throw new Error(response.error);
      }
      
    } else {
      // Simple manual conversion
      const csv = convertToCSVManual(currentData);
      downloadCSVFile(csv);
      showSuccess('CSV downloaded');
    }
    
  } catch (error) {
    console.error('[Popup] CSV conversion error:', error);
    showError('CSV conversion failed: ' + error.message);
  }
}


function isComplexJSON(data) {
  // Check if JSON has nested objects or arrays beyond depth 2
  const checkDepth = (obj, depth = 0) => {
    if (depth > 2) return true;
    
    if (Array.isArray(obj)) {
      return obj.some(item => checkDepth(item, depth + 1));
    }
    
    if (obj !== null && typeof obj === 'object') {
      return Object.values(obj).some(value => checkDepth(value, depth + 1));
    }
    
    return false;
  };
  
  return checkDepth(data);
}


function convertToCSVManual(data) {
  const items = Array.isArray(data) ? data : [data];
  
  if (items.length === 0) return '';
  
  // Get all keys
  const keys = Object.keys(items[0]);
  
  // CSV header
  let csv = keys.join(',') + '\n';
  
  // CSV rows
  items.forEach(item => {
    const row = keys.map(key => {
      let value = item[key];
      
      // Handle null/undefined
      if (value === null || value === undefined) return '';
      
      // Handle arrays
      if (Array.isArray(value)) {
        value = value.join(';');
      }
      
      // Handle objects
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      // Escape quotes and wrap in quotes
      value = String(value).replace(/"/g, '""');
      return `"${value}"`;
    });
    
    csv += row.join(',') + '\n';
  });
  
  return csv;
}


function downloadCSVFile(csvText) {
  const blob = new Blob([csvText], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `web-weaver-${Date.now()}.csv`;
  a.click();
  
  URL.revokeObjectURL(url);
}


// ========================================
// 🆕 #4: ENHANCED EXTRACTION HISTORY
// ========================================


async function loadExtractionHistory() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getExtractionHistory'
    });
    
    if (response.success && response.history) {
      displayExtractionHistory(response.history);
    }
  } catch (error) {
    console.error('[Popup] Error loading history:', error);
  }
}


/**
 * 🆕 v3.1: Enhanced history display with confidence tiers
 */
function displayExtractionHistory(history) {
  const historyContainer = document.getElementById('extractionHistory');
  
  if (!historyContainer) return;
  
  if (history.length === 0) {
    historyContainer.innerHTML = '<p class="no-history">No extractions yet</p>';
    return;
  }
  
  // Show last 10
  const recent = history.slice(0, 10);
  
  let html = '<h3>Recent Extractions</h3>';
  html += '<div class="history-list">';
  
  recent.forEach(entry => {
    const time = new Date(entry.timestamp).toLocaleTimeString();
    
    // 🆕 #4: Use tier-based coloring
    let tierIcon, tierColor;
    if (entry.confidenceTier) {
      // v3.1: Use stored tier
      tierIcon = getTierIcon(entry.confidenceTier);
      tierColor = getTierColor(entry.confidenceTier);
    } else {
      // Fallback: Calculate from score
      if (entry.confidence >= 90) {
        tierIcon = '🔵';
        tierColor = '#0066FF';
      } else if (entry.confidence >= 80) {
        tierIcon = '🟢';
        tierColor = '#00CC66';
      } else if (entry.confidence >= 65) {
        tierIcon = '🟡';
        tierColor = '#FFAA00';
      } else {
        tierIcon = '🔴';
        tierColor = '#FF3333';
      }
    }
    
    html += `
      <div class="history-item">
        <div class="history-time">${time}</div>
        <div class="history-mode">${entry.mode}</div>
        <div class="history-conf" style="color: ${tierColor}">${tierIcon} ${entry.confidence}%</div>
        <div class="history-items">${entry.itemCount} item(s)</div>
      </div>
    `;
  });
  
  html += '</div>';
  
  // Calculate stats
  const totalExtractions = history.length;
  const avgConfidence = Math.round(
    history.reduce((sum, e) => sum + e.confidence, 0) / totalExtractions
  );
  const successRate = Math.round(
    (history.filter(e => e.success).length / totalExtractions) * 100
  );
  
  html += `
    <div class="history-stats">
      <div><strong>Total:</strong> ${totalExtractions}</div>
      <div><strong>Avg Confidence:</strong> ${avgConfidence}%</div>
      <div><strong>Success Rate:</strong> ${successRate}%</div>
    </div>
  `;
  
  historyContainer.innerHTML = html;
}


/**
 * 🆕 v3.1: Helper to get tier icon from label
 */
function getTierIcon(tierLabel) {
  const icons = {
    'High': '🔵',
    'Good': '🟢',
    'Medium': '🟡',
    'Low': '🔴'
  };
  return icons[tierLabel] || '⚪';
}


/**
 * 🆕 v3.1: Helper to get tier color from label
 */
function getTierColor(tierLabel) {
  const colors = {
    'High': '#0066FF',
    'Good': '#00CC66',
    'Medium': '#FFAA00',
    'Low': '#FF3333'
  };
  return colors[tierLabel] || '#6B7280';
}


// ========================================
// UTILITY FUNCTIONS
// ========================================


function showSuccess(message) {
  showNotification(message, 'success');
}


function showError(message) {
  showNotification(message, 'error');
}


function showInfo(message) {
  showNotification(message, 'info');
}


function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}


function highlightJSON(element) {
  // Simple JSON syntax highlighting
  let html = element.textContent;
  
  // Highlight strings
  html = html.replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:');
  html = html.replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>');
  
  // Highlight numbers
  html = html.replace(/: (\d+)/g, ': <span class="json-number">$1</span>');
  
  // Highlight booleans
  html = html.replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>');
  
  // Highlight null
  html = html.replace(/: null/g, ': <span class="json-null">null</span>');
  
  element.innerHTML = html;
}


async function clearCache() {
  try {
    await chrome.runtime.sendMessage({ action: 'clearCache' });
    showSuccess('Cache cleared successfully');
  } catch (error) {
    showError('Failed to clear cache');
  }
}


// ========================================
// 🆕 #4: ENHANCED CSS FOR CONFIDENCE TIERS
// ========================================


// Add this CSS to your popup.html <style> section
const notificationStyles = `
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.3s ease;
  z-index: 10000;
  max-width: 300px;
}

.notification.show {
  opacity: 1;
  transform: translateY(0);
}

.notification-success {
  background: #10B981;
  color: white;
}

.notification-error {
  background: #EF4444;
  color: white;
}

.notification-info {
  background: #3B82F6;
  color: white;
}

/* 🆕 #4: Confidence tier styling */
#confidenceBadge {
  display: inline-block;
  font-weight: bold;
  transition: all 0.3s ease;
}

#confidenceTierDesc {
  margin-top: 4px;
  font-style: italic;
}

/* 🆕 #2: Domain adjustment styling */
.domain-adjustment {
  background: #f3f4f6;
  padding: 10px;
  border-radius: 6px;
  margin: 10px 0;
  font-size: 13px;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
  margin: 10px 0;
}

.history-item {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr 1fr;
  gap: 10px;
  padding: 8px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 12px;
}

.history-stats {
  display: flex;
  justify-content: space-around;
  padding: 10px;
  background: #f9fafb;
  border-radius: 8px;
  margin-top: 10px;
  font-size: 12px;
}

.auto-decision {
  background: #f3f4f6;
  padding: 10px;
  border-radius: 6px;
  margin: 10px 0;
  font-size: 13px;
}

.json-key { color: #8B5CF6; }
.json-string { color: #10B981; }
.json-number { color: #3B82F6; }
.json-boolean { color: #F59E0B; }
.json-null { color: #6B7280; }
`;


console.log('[Popup] 🚀 Web Weaver Lightning v3.1 UI loaded');
console.log('[Popup] 🆕 v3.1: Visual confidence feedback enabled');
console.log('[Popup] 🆕 v3.1: Domain adjustment display enabled');
