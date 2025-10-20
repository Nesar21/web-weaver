/**
 * Web Weaver Lightning - Popup UI Controller
 * Version: 3.5.0 (Day 13 - HYBRID AI UI CONTROLS)
 * 
 * 🆕 v3.5 ENHANCEMENTS (DAY 13 - HYBRID AI):
 * - Summarize checkbox (enable/disable content summarization)
 * - Translate language dropdown (select target language)
 * - Hybrid options sent to background.js
 * - AI source display in results (_source metadata)
 * - Hybrid AI statistics display
 * 
 * ✅ PRESERVED FROM v3.4.1:
 * - Unlimited API usage (no daily limits)
 * - MULTI/SINGLE_ITEM extraction types
 * - Natural pagination guidance
 * - Graceful degradation error messages
 * 
 * ✅ PRESERVED FROM v3.3:
 * - Graceful error display with recovery steps
 * - Detection tier failure context
 * - User-actionable error suggestions
 */

// ========================================
// GLOBAL STATE
// ========================================
let currentData = null;
let currentMode = 'auto';
let currentExtractionType = 'MULTI';
let extractionInProgress = false;

// 🆕 DAY 13: Hybrid AI options
let hybridOptions = {
  summarize: false,
  translate: false,
  targetLanguage: null
};

// ========================================
// ERROR MESSAGES (PRESERVED)
// ========================================
const ERROR_MESSAGES = {
  'No repeated patterns found': {
    title: 'No Repeating Patterns Detected',
    message: 'The page structure doesn\'t show clear repeating elements.',
    suggestions: [
      '🚀 Try <strong>Max Mode</strong> for AI-powered deep analysis',
      '🔄 Refresh the page and try again',
      '📄 Try <strong>SINGLE_ITEM mode</strong> if viewing one article'
    ],
    severity: 'info'
  },
  
  'Visual detection timeout': {
    title: 'Visual Analysis Timed Out',
    message: 'The page has complex layout that exceeded analysis time limit.',
    suggestions: [
      '🤖 Switch to <strong>Max Mode</strong> for AI fallback',
      '🟢 Try <strong>Offline Mode</strong> for basic DOM extraction',
      '⏳ Wait a moment and try again'
    ],
    severity: 'warning'
  },
  
  'Site uses heavy JS rendering': {
    title: 'Dynamic Content Detected',
    message: 'This site loads content dynamically with JavaScript.',
    suggestions: [
      '⏱️ Wait 2-3 seconds after page load before extracting',
      '🔄 Scroll down first to load more content',
      '🚀 Use <strong>Max Mode</strong> for better handling'
    ],
    severity: 'warning'
  },
  
  'API error: 429': {
    title: 'Rate Limit Exceeded',
    message: 'Gemini API rate limit reached. Too many requests.',
    suggestions: [
      '⏳ Wait 60 seconds before trying again',
      '🟢 Switch to <strong>Offline Mode</strong> (no API calls)',
      '🌿 Use <strong>Min Mode</strong> to reduce API usage'
    ],
    severity: 'error'
  },
  
  'API error: 403': {
    title: 'API Authentication Failed',
    message: 'Your API key may be invalid or expired.',
    suggestions: [
      '🔑 Check your API key in settings',
      '🔄 Generate a new key at <a href="https://ai.google.dev" target="_blank">ai.google.dev</a>',
      '💾 Save the new key and try again'
    ],
    severity: 'error'
  },
  
  'API error: 400': {
    title: 'Invalid Request',
    message: 'The extraction request was malformed.',
    suggestions: [
      '🔄 Refresh the page and try again',
      '🟢 Try <strong>Offline Mode</strong> as fallback',
      '📝 Report this issue if it persists'
    ],
    severity: 'error'
  },
  
  'Content script deployment failed': {
    title: 'Extension Load Error',
    message: 'Could not inject content analyzer into page.',
    suggestions: [
      '🔄 Refresh the page (F5)',
      '🔄 Close and reopen the extension popup',
      '❌ Some pages (chrome://, file://) are restricted'
    ],
    severity: 'error'
  },
  
  'No active tab found': {
    title: 'No Active Page',
    message: 'Cannot detect the current page.',
    suggestions: [
      '📑 Make sure you have a valid webpage open',
      '🔄 Click on the page before opening extension',
      '❌ Some pages cannot be extracted (chrome://, about:)'
    ],
    severity: 'error'
  },
  
  'Extraction confidence too low': {
    title: 'Low Confidence Result',
    message: 'The extraction result had very low reliability score.',
    suggestions: [
      '🚀 Try <strong>Max Mode</strong> for better accuracy',
      '🔄 Refresh and try again',
      '📝 Page structure may be too complex'
    ],
    severity: 'warning'
  },
  
  'SINGLE_ITEM mode requires AI': {
    title: 'AI Required for Screenshot Extraction',
    message: 'SINGLE_ITEM mode uses Vision API which requires AI.',
    suggestions: [
      '🔑 Add your Gemini API key',
      '🌿 Switch to <strong>Min/Balanced/Max mode</strong>',
      '📦 Use <strong>MULTI mode</strong> for DOM-based extraction'
    ],
    severity: 'warning'
  },
  
  'Screenshot capture failed': {
    title: 'Screenshot Failed',
    message: 'Unable to capture the visible viewport.',
    suggestions: [
      '🔄 Refresh the page and try again',
      '📦 Switch to <strong>MULTI mode</strong> for DOM extraction',
      '🟢 Try <strong>Offline mode</strong> as fallback'
    ],
    severity: 'error'
  }
};

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Popup] Initializing Web Weaver Lightning v3.5.0 (HYBRID AI)...');
  
  await loadApiKey();
  setupEventListeners();
  await loadExtractionHistory();
  initializeModeSelector();
  initializeExtractionTypeSelector();
  initializeHybridControls(); // 🆕 DAY 13: Initialize hybrid AI controls
  await loadHybridStats(); // 🆕 DAY 13: Load hybrid statistics
  
  console.log('[Popup] Initialization complete (HYBRID AI READY)');
});

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
  document.getElementById('saveApiKey').addEventListener('click', saveApiKey);
  
  // Mode selection
  document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentMode = e.target.value;
      updateModeUI();
    });
  });
  
  // Extraction type selection
  document.querySelectorAll('input[name="extractionType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentExtractionType = e.target.value;
      updateExtractionTypeUI();
    });
  });
  
  // 🆕 DAY 13: Hybrid AI controls
  const summarizeCheckbox = document.getElementById('enableSummarize');
  if (summarizeCheckbox) {
    summarizeCheckbox.addEventListener('change', (e) => {
      hybridOptions.summarize = e.target.checked;
      console.log('[Popup] Summarize enabled:', hybridOptions.summarize);
    });
  }
  
  const translateCheckbox = document.getElementById('enableTranslate');
  if (translateCheckbox) {
    translateCheckbox.addEventListener('change', (e) => {
      hybridOptions.translate = e.target.checked;
      const langDropdown = document.getElementById('targetLanguage');
      if (langDropdown) {
        langDropdown.disabled = !e.target.checked;
        if (e.target.checked) {
          hybridOptions.targetLanguage = langDropdown.value || 'es';
        } else {
          hybridOptions.targetLanguage = null;
        }
      }
      console.log('[Popup] Translate enabled:', hybridOptions.translate, '| Language:', hybridOptions.targetLanguage);
    });
  }
  
  const languageDropdown = document.getElementById('targetLanguage');
  if (languageDropdown) {
    languageDropdown.addEventListener('change', (e) => {
      hybridOptions.targetLanguage = e.target.value;
      console.log('[Popup] Target language changed:', hybridOptions.targetLanguage);
    });
  }
  
  document.getElementById('extractBtn').addEventListener('click', handleExtract);
  document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
  document.getElementById('downloadJsonBtn').addEventListener('click', downloadJSON);
  document.getElementById('downloadCsvBtn').addEventListener('click', downloadCSV);
  
  const clearCacheBtn = document.getElementById('clearCacheBtn');
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', clearCache);
  }
}

// ========================================
// 🆕 DAY 13: HYBRID AI CONTROLS INITIALIZATION
// ========================================
function initializeHybridControls() {
  // Set default values
  const summarizeCheckbox = document.getElementById('enableSummarize');
  if (summarizeCheckbox) {
    summarizeCheckbox.checked = false;
    hybridOptions.summarize = false;
  }
  
  const translateCheckbox = document.getElementById('enableTranslate');
  if (translateCheckbox) {
    translateCheckbox.checked = false;
    hybridOptions.translate = false;
  }
  
  const languageDropdown = document.getElementById('targetLanguage');
  if (languageDropdown) {
    languageDropdown.disabled = true;
    languageDropdown.value = 'es'; // Default to Spanish
  }
  
  console.log('[Popup] Hybrid controls initialized');
}

// ========================================
// 🆕 DAY 13: LOAD HYBRID AI STATISTICS
// ========================================
async function loadHybridStats() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getHybridStats' });
    if (response.success && response.stats) {
      displayHybridStats(response.stats);
    }
  } catch (error) {
    console.error('[Popup] Error loading hybrid stats:', error);
  }
}

function displayHybridStats(stats) {
  const statsContainer = document.getElementById('hybridStatsContainer');
  if (!statsContainer) return;
  
  if (stats.totalSummarizations === 0 && stats.totalTranslations === 0) {
    statsContainer.innerHTML = '<div style="text-align: center; padding: 12px; color: #666; font-size: 12px;">No hybrid AI usage yet</div>';
    return;
  }
  
  const chromePercent = stats.totalSummarizations + stats.totalTranslations > 0
    ? Math.round(
        ((stats.chromeBuiltinUsage.summarizations + stats.chromeBuiltinUsage.translations) /
          (stats.totalSummarizations + stats.totalTranslations)) * 100
      )
    : 0;
  
  const cloudPercent = 100 - chromePercent;
  
  statsContainer.innerHTML = `
    <div style="font-size: 12px; padding: 12px; background: rgba(0,0,0,0.03); border-radius: 8px;">
      <div style="font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        <span>🤖</span>
        <span>Hybrid AI Usage</span>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
        <div>
          <div style="color: #666;">📝 Summarizations</div>
          <div style="font-weight: 600;">${stats.totalSummarizations}</div>
        </div>
        <div>
          <div style="color: #666;">🌐 Translations</div>
          <div style="font-weight: 600;">${stats.totalTranslations}</div>
        </div>
      </div>
      
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px;">
          <span style="color: #10B981;">🟢 Chrome Built-in</span>
          <span style="font-weight: 600;">${chromePercent}%</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span style="color: #3B82F6;">☁️ Cloud Fallback</span>
          <span style="font-weight: 600;">${cloudPercent}%</span>
        </div>
      </div>
    </div>
  `;
}

// ========================================
// EXTRACTION TYPE SELECTOR (PRESERVED)
// ========================================
function initializeExtractionTypeSelector() {
  const multiRadio = document.querySelector('input[name="extractionType"][value="MULTI"]');
  if (multiRadio) {
    multiRadio.checked = true;
  }
  
  currentExtractionType = 'MULTI';
  updateExtractionTypeUI();
  
  console.log('[Popup] Extraction type initialized:', currentExtractionType);
}

function updateExtractionTypeUI() {
  document.querySelectorAll('.extraction-type-option').forEach(option => {
    option.classList.remove('active');
  });
  
  if (currentExtractionType === 'MULTI') {
    document.getElementById('extractionTypeMulti').classList.add('active');
  } else {
    document.getElementById('extractionTypeSingle').classList.add('active');
  }
  
  const hintEl = document.getElementById('extractionTypeHint');
  if (hintEl) {
    if (currentExtractionType === 'MULTI') {
      hintEl.innerHTML = `
        <span>💡</span>
        <span><strong>MULTI Mode:</strong> Extracts all items currently visible on the page. To get more items, scroll down or click "Next Page" to load more, then click "Extract Again".</span>
      `;
    } else {
      hintEl.innerHTML = `
        <span>📄</span>
        <span><strong>SINGLE_ITEM Mode:</strong> Captures a screenshot of your visible viewport and uses AI Vision to extract the main article or product. Requires API key and AI mode (Min/Balanced/Max).</span>
      `;
    }
  }
  
  console.log('[Popup] Extraction type updated:', currentExtractionType);
}

// ========================================
// API KEY MANAGEMENT (PRESERVED)
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
    await chrome.runtime.sendMessage({ action: 'saveApiKey', apiKey });
    showSuccess('API key saved successfully');
  } catch (error) {
    console.error('[Popup] Error saving API key:', error);
    showError('Failed to save API key');
  }
}

// ========================================
// MODE SELECTOR UI (PRESERVED)
// ========================================
function initializeModeSelector() {
  document.getElementById('mode-auto').checked = true;
  currentMode = 'auto';
  updateModeUI();
}

function updateModeUI() {
  document.querySelectorAll('.mode-option').forEach(option => {
    option.classList.remove('active');
  });
  
  const selectedOption = document.querySelector(`input[name="mode"][value="${currentMode}"]`);
  if (selectedOption) {
    selectedOption.closest('.mode-option').classList.add('active');
  }
  
  console.log('[Popup] Mode selected:', currentMode);
}

// ========================================
// EXTRACTION HANDLER (ENHANCED WITH HYBRID OPTIONS)
// ========================================
async function handleExtract() {
  if (extractionInProgress) {
    showError('Extraction already in progress. Please wait.');
    return;
  }
  
  if (currentExtractionType === 'SINGLE_ITEM' && currentMode === 'offline') {
    showError('SINGLE_ITEM mode requires AI (Min/Balanced/Max). Switch modes or use MULTI extraction.');
    return;
  }
  
  if (currentMode !== 'offline') {
    const apiKey = document.getElementById('apiKey').value.trim();
    if (!apiKey) {
      showError('Please add your Gemini API key first');
      return;
    }
  }
  
  extractionInProgress = true;
  
  const extractBtn = document.getElementById('extractBtn');
  extractBtn.disabled = true;
  extractBtn.textContent = '⏳ Extracting...';
  
  document.getElementById('resultsSection').style.display = 'none';
  document.getElementById('errorSection').style.display = 'none';
  
  try {
    console.log('[Popup] Starting extraction | Mode:', currentMode, '| Type:', currentExtractionType, '| Hybrid:', hybridOptions);
    const startTime = Date.now();
    
    // 🆕 DAY 13: Send hybrid options to background
    const response = await chrome.runtime.sendMessage({
      action: 'extractData',
      mode: currentMode,
      extractionType: currentExtractionType,
      hybridOptions: hybridOptions // 🆕 New parameter
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (response.success) {
      currentData = response.data;
      displayResults(response);
      showSuccess(`Extraction complete in ${duration}s`);
      
      await loadExtractionHistory();
      await loadHybridStats(); // 🆕 DAY 13: Refresh hybrid stats
      
    } else {
      displayGracefulError(response.error, response);
    }
    
  } catch (error) {
    console.error('[Popup] Extraction error:', error);
    displayGracefulError(error.message, { metadata: { detectionTier: 'unknown' } });
  } finally {
    extractionInProgress = false;
    extractBtn.disabled = false;
    extractBtn.textContent = '🚀 Extract Data';
  }
}

// ========================================
// GRACEFUL ERROR DISPLAY (PRESERVED)
// ========================================
function displayGracefulError(errorMessage, response = {}) {
  console.log('[Popup] Graceful error handling:', errorMessage);
  
  let errorInfo = null;
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.includes(key)) {
      errorInfo = value;
      break;
    }
  }
  
  if (!errorInfo) {
    errorInfo = {
      title: 'Extraction Failed',
      message: errorMessage,
      suggestions: [
        '🔄 Refresh the page and try again',
        '🚀 Try <strong>Max Mode</strong> for AI-powered extraction',
        '🟢 Use <strong>Offline Mode</strong> for basic extraction'
      ],
      severity: 'error'
    };
  }
  
  const tier = response.metadata?.detectionTier || 'unknown';
  const tierLabels = {
    dom: 'DOM Classification',
    visual: 'Visual Pattern Detection',
    ai: 'AI Analysis',
    uncertain: 'Detection'
  };
  
  const contextMessage = tier !== 'unknown' 
    ? `Failed at: <strong>${tierLabels[tier] || 'Detection'}</strong> stage` 
    : '';
  
  document.getElementById('resultsSection').style.display = 'none';
  document.getElementById('errorSection').style.display = 'block';
  
  const errorEl = document.getElementById('errorMessage');
  
  const severityColors = {
    info: '#3B82F6',
    warning: '#F59E0B',
    error: '#EF4444'
  };
  
  const severityIcons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌'
  };
  
  const color = severityColors[errorInfo.severity] || severityColors.error;
  const icon = severityIcons[errorInfo.severity] || severityIcons.error;
  
  errorEl.innerHTML = `
    <div style="padding: 16px; background: ${color}15; border-left: 4px solid ${color}; border-radius: 8px;">
      <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: ${color}; display: flex; align-items: center; gap: 8px;">
        <span>${icon}</span>
        <span>${errorInfo.title}</span>
      </div>
      
      <div style="font-size: 14px; color: #4B5563; margin-bottom: 12px; line-height: 1.5;">
        ${errorInfo.message}
      </div>
      
      ${contextMessage ? `
        <div style="font-size: 12px; color: #6B7280; margin-bottom: 12px; padding: 6px 10px; background: rgba(0,0,0,0.05); border-radius: 4px;">
          ${contextMessage}
        </div>
      ` : ''}
      
      <div style="font-size: 13px; color: #374151; margin-top: 12px;">
        <div style="font-weight: 600; margin-bottom: 6px;">💡 Try these solutions:</div>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
          ${errorInfo.suggestions.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
  
  errorEl.scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// RESULTS DISPLAY (ENHANCED FOR HYBRID AI)
// ========================================
function displayResults(response) {
  const { data, metadata } = response;
  
  document.getElementById('resultsSection').style.display = 'block';
  document.getElementById('errorSection').style.display = 'none';
  
  displayConfidenceTier(metadata.confidence, metadata.confidenceTier);
  
  document.getElementById('modeUsed').textContent = 
    metadata.mode.toUpperCase() + (metadata.cached ? ' 💾' : '');
  
  const extractionTypeEl = document.getElementById('extractionTypeUsed');
  if (extractionTypeEl) {
    const typeIcon = metadata.extractionType === 'SINGLE_ITEM' ? '📄' : '📦';
    const typeLabel = metadata.extractionType === 'SINGLE_ITEM' ? 'Article' : 'All Items';
    extractionTypeEl.textContent = `${typeIcon} ${typeLabel}`;
  }
  
  document.getElementById('duration').textContent = metadata.duration + 'ms';
  document.getElementById('classification').textContent = metadata.classification || 'Unknown';
  
  // 🆕 DAY 13: Display hybrid AI status
  if (metadata.hybridAI) {
    const hybridStatusEl = document.getElementById('hybridAIStatus');
    if (hybridStatusEl) {
      const features = [];
      if (metadata.hybridAI.summarizeEnabled) features.push('📝 Summarize');
      if (metadata.hybridAI.translateEnabled) features.push(`🌐 Translate (${metadata.hybridAI.targetLanguage || 'N/A'})`);
      
      if (features.length > 0) {
        hybridStatusEl.style.display = 'block';
        const valueEl = hybridStatusEl.querySelector('.metadata-value');
        if (valueEl) {
          valueEl.textContent = features.join(' + ');
        }
      } else {
        hybridStatusEl.style.display = 'none';
      }
    }
  }
  
  if (metadata.extractionType === 'MULTI' && metadata.naturalPagination) {
    const paginationHintEl = document.getElementById('paginationHint');
    if (paginationHintEl) {
      paginationHintEl.style.display = 'block';
      const valueEl = paginationHintEl.querySelector('.metadata-value');
      if (valueEl) {
        valueEl.textContent = metadata.paginationHint || 'Scroll or click "Next Page" to load more, then extract again';
      }
    }
  }
  
  if (metadata.domainAdjustment && metadata.domainAdjustment !== 0) {
    const domainAdjustEl = document.getElementById('domainAdjustment');
    if (domainAdjustEl) {
      domainAdjustEl.style.display = 'block';
      const sign = metadata.domainAdjustment > 0 ? '+' : '';
      const color = metadata.domainAdjustment > 0 ? '#10B981' : '#EF4444';
      domainAdjustEl.innerHTML = `
        <span style="font-weight: 500;">Domain Adjustment:</span> 
        <span style="color: ${color}; font-weight: 600;">${sign}${metadata.domainAdjustment}%</span>
      `;
    }
  }
  
  const outputEl = document.getElementById('jsonOutput');
  outputEl.textContent = JSON.stringify(data, null, 2);
  
  highlightJSON(outputEl);
}

function displayConfidenceTier(confidence, tier) {
  const confidenceEl = document.getElementById('confidence');
  
  const tierConfig = {
    HIGH: { color: '#10B981', icon: '🟢', label: 'High', bgColor: 'rgba(16, 185, 129, 0.1)' },
    GOOD: { color: '#3B82F6', icon: '🔵', label: 'Good', bgColor: 'rgba(59, 130, 246, 0.1)' },
    MEDIUM: { color: '#F59E0B', icon: '🟡', label: 'Medium', bgColor: 'rgba(245, 158, 11, 0.1)' },
    LOW: { color: '#EF4444', icon: '🔴', label: 'Low', bgColor: 'rgba(239, 68, 68, 0.1)' }
  };
  
  const config = tierConfig[tier] || tierConfig.MEDIUM;
  
  confidenceEl.innerHTML = `
    <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: ${config.bgColor}; border-radius: 12px;">
      <span style="font-size: 14px;">${config.icon}</span>
      <span style="font-weight: 600; color: ${config.color};">${confidence}%</span>
      <span style="font-size: 11px; color: ${config.color}; opacity: 0.8;">${config.label}</span>
    </div>
  `;
}

// ========================================
// NOTIFICATION HELPERS (PRESERVED - IDENTICAL)
// ========================================
function showSuccess(message) {
  showNotification(message, 'success');
}

function showError(message) {
  showNotification(message, 'error');
}

function showWarning(message) {
  showNotification(message, 'warning');
}

function showInfo(message) {
  showNotification(message, 'info');
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    padding: 12px 16px;
    background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6'};
    color: white;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
}

// ========================================
// EXPORT FUNCTIONS (PRESERVED - IDENTICAL)
// [All export functions remain exactly the same as your existing code]
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
    const isComplex = isComplexJSON(currentData);
    
    if (isComplex) {
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
  
  const keys = Object.keys(items[0]);
  let csv = keys.join(',') + '\n';
  
  items.forEach(item => {
    const row = keys.map(key => {
      let value = item[key];
      
      if (value === null || value === undefined) return '';
      
      if (Array.isArray(value)) {
        value = value.join(';');
      }
      
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
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

async function clearCache() {
  try {
    await chrome.runtime.sendMessage({ action: 'clearCache' });
    showSuccess('Cache cleared successfully');
    await loadHybridStats(); // 🆕 Refresh stats after clearing
  } catch (error) {
    console.error('[Popup] Error clearing cache:', error);
    showError('Failed to clear cache');
  }
}

async function loadExtractionHistory() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getExtractionHistory' });
    if (response.success && response.history) {
      displayExtractionHistory(response.history);
    }
  } catch (error) {
    console.error('[Popup] Error loading history:', error);
  }
}

function displayExtractionHistory(history) {
  const historyContainer = document.getElementById('extractionHistory');
  if (!historyContainer) return;
  
  if (history.length === 0) {
    historyContainer.innerHTML = '<div style="text-align: center; padding: 16px; color: #666;">No extractions yet</div>';
    return;
  }
  
  const recent = history.slice(0, 10);
  let html = '<div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Recent Extractions</div>';
  
  recent.forEach(entry => {
    const tierConfig = {
      HIGH: { color: '#10B981', icon: '🟢' },
      GOOD: { color: '#3B82F6', icon: '🔵' },
      MEDIUM: { color: '#F59E0B', icon: '🟡' },
      LOW: { color: '#EF4444', icon: '🔴' }
    };
    
    const config = tierConfig[entry.tier] || tierConfig.MEDIUM;
    
    html += `
      <div style="padding: 8px; background: rgba(0,0,0,0.03); border-radius: 6px; margin-bottom: 6px; font-size: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-weight: 500; max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${entry.domain}</span>
          <span style="color: ${config.color};">${config.icon} ${entry.confidence}%</span>
        </div>
        <div style="color: #666; font-size: 11px;">
          ${entry.mode.toUpperCase()} • ${new Date(entry.timestamp).toLocaleTimeString()}
        </div>
      </div>
    `;
  });
  
  historyContainer.innerHTML = html;
}

function highlightJSON(element) {
  const json = element.textContent;
  
  const highlighted = json
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
  
  element.innerHTML = highlighted;
}

console.log('[Popup] Web Weaver Lightning v3.5.0 popup controller loaded (HYBRID AI CONTROLS)');
