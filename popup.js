/**
 * Web Weaver Lightning - Popup UI Controller
 * Version: 4.0.0 (Day 21 - CHROME AI + SECURITY + TOS)
 * 
 * 🆕 v4.0 CHANGES (DAY 21):
 * - TOS/Privacy acceptance flow (blocks until accepted)
 * - AI Provider toggle (Chrome Built-in AI vs Cloud API)
 * - Real-time API key validation with status indicators
 * - Proactive rate limit warnings (25 RPM, 900K RPD thresholds)
 * - Enhanced error display with structured recovery steps
 * - Deduplication tracking and display
 * - Conditional UI sections (API key only for Cloud API)
 * - Chrome AI availability detection with fallback
 * 
 * ✅ PRESERVED FROM v3.4.1:
 * - MULTI/SINGLE_ITEM extraction types
 * - Unlimited API usage philosophy (no hard limits)
 * - Natural pagination guidance
 * - Graceful degradation error messages
 * - All 5 extraction modes (offline, min, balanced, max, auto)
 */

// ========================================
// GLOBAL STATE
// ========================================
let currentData = null;
let currentMode = 'auto';
let currentExtractionType = 'MULTI';
let currentAIProvider = 'CHROME_BUILTIN'; // 🆕 Day 21
let extractionInProgress = false;
let chromeAIAvailable = false; // 🆕 Day 21
let rateLimitWarningCount = 0; // 🆕 Day 21: Track consecutive rate limit warnings

// 🆕 DAY 21: TOS acceptance tracking
let tosAccepted = false;
const TOS_VERSION = '1.0.0';
const TOS_STORAGE_KEY = 'web_weaver_tos_accepted';

// ========================================
// 🆕 DAY 21: ERROR MESSAGES (ENHANCED)
// ========================================
const ERROR_MESSAGES = {
  // Detection failures
  'No repeated patterns found': {
    title: 'No Repeating Patterns Detected',
    message: 'The page structure doesn\'t show clear repeating elements.',
    suggestions: [
      'Try <strong>Max Mode</strong> for AI-powered deep analysis',
      'Refresh the page and try again',
      'Try <strong>SINGLE_ITEM mode</strong> if viewing one article',
      'Switch to <strong>Chrome AI</strong> for faster processing'
    ],
    severity: 'info',
    recoveryAction: 'switch_mode'
  },
  
  'Visual detection timeout': {
    title: 'Visual Analysis Timed Out',
    message: 'The page has complex layout that exceeded analysis time limit.',
    suggestions: [
      'Switch to <strong>Max Mode</strong> for AI fallback',
      'Try <strong>Offline Mode</strong> for basic DOM extraction',
      'Wait a moment and try again',
      'Consider using <strong>Chrome AI</strong> for local processing'
    ],
    severity: 'warning',
    recoveryAction: 'retry'
  },
  
  'Site uses heavy JS rendering': {
    title: 'Dynamic Content Detected',
    message: 'This site loads content dynamically with JavaScript.',
    suggestions: [
      'Wait 2-3 seconds after page load before extracting',
      'Scroll down first to load more content',
      'Use <strong>Max Mode</strong> for better handling',
      '<strong>Chrome AI</strong> processes faster for dynamic sites'
    ],
    severity: 'warning',
    recoveryAction: 'wait_and_retry'
  },
  
  // 🆕 DAY 21: Enhanced API error handling
  'API error: 429': {
    title: '⚠️ API Rate Limit Exceeded',
    message: 'Google Gemini API rate limit reached. This is a Google-imposed limit (15 RPM or 1M TPD).',
    suggestions: [
      '<strong>✅ Switch to Chrome AI</strong> (zero cost, no limits)',
      'Wait 60-120 seconds for rate limit reset',
      'Switch to <strong>Offline Mode</strong> (no API calls)',
      'Check quota at <a href="https://aistudio.google.com" target="_blank">Google AI Studio</a>'
    ],
    severity: 'error',
    recoveryAction: 'switch_to_chrome_ai'
  },
  
  'API error: 403': {
    title: '🔒 API Key Invalid or Expired',
    message: 'Your Gemini API key is invalid, expired, or lacks permissions.',
    suggestions: [
      '<strong>✅ Switch to Chrome AI</strong> (no key required)',
      'Generate new key at <a href="https://aistudio.google.com" target="_blank">Google AI Studio</a>',
      'Update key in Settings → API Configuration',
      'Verify key permissions (Gemini API enabled)'
    ],
    severity: 'error',
    recoveryAction: 'switch_to_chrome_ai'
  },
  
  'API error: 500': {
    title: '🔧 Gemini API Server Error',
    message: 'Google AI services are experiencing issues.',
    suggestions: [
      '<strong>✅ Switch to Chrome AI</strong> (unaffected by API issues)',
      'Wait 5-10 minutes and retry',
      'Check <a href="https://status.cloud.google.com" target="_blank">Google Cloud Status</a>',
      'Retry extraction after services recover'
    ],
    severity: 'error',
    recoveryAction: 'switch_to_chrome_ai'
  },
  
  'API error: network': {
    title: '🌐 Network Connection Error',
    message: 'No internet connection or request timeout.',
    suggestions: [
      '<strong>✅ Switch to Chrome AI</strong> (works offline)',
      'Check WiFi/Ethernet connection',
      'Disable VPN if active',
      'Try again after connection restored'
    ],
    severity: 'error',
    recoveryAction: 'switch_to_chrome_ai'
  },
  
  // Content script failures
  'Content script deployment failed': {
    title: 'Extension Load Error',
    message: 'Could not inject content analyzer into page.',
    suggestions: [
      'Refresh the page (F5 or Cmd+R)',
      'Close and reopen the extension popup',
      'Some pages (chrome://, file://) are restricted'
    ],
    severity: 'error',
    recoveryAction: 'refresh_page'
  },
  
  'No active tab found': {
    title: 'No Active Page',
    message: 'Cannot detect the current page.',
    suggestions: [
      'Make sure you have a valid webpage open',
      'Click on the page before opening extension',
      'Some pages cannot be extracted (chrome://, about:)'
    ],
    severity: 'error',
    recoveryAction: 'none'
  },
  
  // Confidence failures
  'Extraction confidence too low': {
    title: 'Low Confidence Result',
    message: 'The extraction result had very low reliability score.',
    suggestions: [
      'Try <strong>Max Mode</strong> for better accuracy',
      'Refresh and try again',
      'Page structure may be too complex',
      '<strong>Chrome AI</strong> might perform better on this site'
    ],
    severity: 'warning',
    recoveryAction: 'switch_mode'
  },
  
  // 🆕 DAY 21: Chrome AI specific errors
  'Chrome AI unavailable': {
    title: 'Chrome AI Not Available',
    message: 'Chrome Built-in AI requires Chrome 128+ Dev/Canary with AI features enabled.',
    suggestions: [
      '<strong>Automatic fallback to Cloud API</strong> activated',
      'Download Chrome Dev/Canary from <a href="https://www.google.com/chrome/dev/" target="_blank">chrome.dev</a>',
      'Enable AI features in chrome://flags',
      'Continue using Cloud API for now'
    ],
    severity: 'info',
    recoveryAction: 'fallback_to_cloud'
  },
  
  // Screenshot-specific errors (PRESERVED)
  'SINGLE_ITEM mode requires AI': {
    title: 'AI Required for Screenshot Extraction',
    message: 'SINGLE_ITEM mode uses Vision API which requires AI.',
    suggestions: [
      'Add your Gemini API key (Cloud API)',
      'Switch to <strong>Min/Balanced/Max mode</strong>',
      'Use <strong>MULTI mode</strong> for DOM-based extraction',
      '<strong>Note:</strong> Chrome AI doesn\'t support vision yet'
    ],
    severity: 'warning',
    recoveryAction: 'switch_extraction_type'
  },
  
  'Screenshot capture failed': {
    title: 'Screenshot Failed',
    message: 'Unable to capture the visible viewport.',
    suggestions: [
      'Refresh the page and try again',
      'Switch to <strong>MULTI mode</strong> for DOM extraction',
      'Try <strong>Offline mode</strong> as fallback'
    ],
    severity: 'error',
    recoveryAction: 'switch_extraction_type'
  }
};

// ========================================
// 🆕 DAY 21: INITIALIZATION (ENHANCED)
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Popup] Initializing Web Weaver Lightning v4.0...');
  
  // 🆕 Step 1: Check TOS acceptance (blocks until accepted)
  await checkTOSAcceptance();
  
  // 🆕 Step 2: Check Chrome AI availability
  await checkChromeAIAvailability();
  
  // Step 3: Load settings and initialize UI
  await loadAIProvider();
  await loadApiKey();
  setupEventListeners();
  await loadExtractionHistory();
  initializeModeSelector();
  initializeExtractionTypeSelector();
  initializeAIProviderSelector(); // 🆕
  
  console.log('[Popup] Initialization complete');
  console.log('[Popup] AI Provider:', currentAIProvider);
  console.log('[Popup] Chrome AI Available:', chromeAIAvailable);
});

// ========================================
// 🆕 DAY 21: TOS ACCEPTANCE FLOW
// ========================================
async function checkTOSAcceptance() {
  try {
    const result = await chrome.storage.local.get(TOS_STORAGE_KEY);
    const tosData = result[TOS_STORAGE_KEY];
    
    if (tosData && tosData.version === TOS_VERSION && tosData.accepted) {
      tosAccepted = true;
      console.log('[Popup] TOS already accepted (v' + TOS_VERSION + ')');
      return;
    }
    
    // TOS not accepted - show modal and block
    console.log('[Popup] TOS not accepted - showing modal');
    await showTOSModal();
    
  } catch (error) {
    console.error('[Popup] Error checking TOS:', error);
    // Fail open - allow usage if storage error
    tosAccepted = true;
  }
}

function showTOSModal() {
  return new Promise((resolve) => {
    const modal = document.getElementById('tosModalOverlay');
    const acceptBtn = document.getElementById('tosAcceptBtn');
    const declineBtn = document.getElementById('tosDeclineBtn');
    
    modal.classList.add('active');
    
    acceptBtn.onclick = async () => {
      try {
        await chrome.storage.local.set({
          [TOS_STORAGE_KEY]: {
            accepted: true,
            version: TOS_VERSION,
            timestamp: Date.now()
          }
        });
        
        tosAccepted = true;
        modal.classList.remove('active');
        console.log('[Popup] TOS accepted');
        resolve();
        
      } catch (error) {
        console.error('[Popup] Error saving TOS acceptance:', error);
        showError('Failed to save TOS acceptance. Please try again.');
      }
    };
    
    declineBtn.onclick = () => {
      // User declined - close popup
      window.close();
    };
  });
}

// ========================================
// 🆕 DAY 21: CHROME AI AVAILABILITY CHECK
// ========================================
async function checkChromeAIAvailability() {
  try {
    // Check if window.ai API exists (Chrome 128+)
    const response = await chrome.runtime.sendMessage({ 
      action: 'checkChromeAI' 
    });
    
    chromeAIAvailable = response.available || false;
    
    if (chromeAIAvailable) {
      console.log('[Popup] ✅ Chrome Built-in AI is available');
    } else {
      console.log('[Popup] ⚠️ Chrome AI unavailable - will fallback to Cloud API');
      
      // Update UI to show Chrome AI unavailable
      const chromeAIOption = document.getElementById('aiProviderChrome');
      if (chromeAIOption) {
        const desc = chromeAIOption.querySelector('.ai-provider-desc');
        if (desc) {
          desc.textContent = 'Unavailable (requires Chrome 128+)';
          desc.style.color = '#EF4444';
        }
      }
      
      // Auto-select Cloud API if Chrome AI selected but unavailable
      if (currentAIProvider === 'CHROME_BUILTIN') {
        console.log('[Popup] Auto-switching to Cloud API (Chrome AI unavailable)');
        currentAIProvider = 'CLOUD_API';
        await saveAIProvider('CLOUD_API');
      }
    }
    
  } catch (error) {
    console.error('[Popup] Error checking Chrome AI:', error);
    chromeAIAvailable = false;
  }
}

// ========================================
// 🆕 DAY 21: AI PROVIDER MANAGEMENT
// ========================================
async function loadAIProvider() {
  try {
    const result = await chrome.storage.local.get('ai_provider');
    currentAIProvider = result.ai_provider || 'CHROME_BUILTIN';
    console.log('[Popup] Loaded AI provider:', currentAIProvider);
  } catch (error) {
    console.error('[Popup] Error loading AI provider:', error);
    currentAIProvider = 'CHROME_BUILTIN';
  }
}

async function saveAIProvider(provider) {
  try {
    await chrome.storage.local.set({ ai_provider: provider });
    currentAIProvider = provider;
    
    // Notify background script of provider change
    await chrome.runtime.sendMessage({
      action: 'setAIProvider',
      provider: provider
    });
    
    console.log('[Popup] AI provider saved:', provider);
  } catch (error) {
    console.error('[Popup] Error saving AI provider:', error);
  }
}

function initializeAIProviderSelector() {
  // Set initial state
  const chromeRadio = document.querySelector('input[name="aiProvider"][value="CHROME_BUILTIN"]');
  const cloudRadio = document.querySelector('input[name="aiProvider"][value="CLOUD_API"]');
  
  if (currentAIProvider === 'CHROME_BUILTIN' && chromeAIAvailable) {
    if (chromeRadio) chromeRadio.checked = true;
    document.getElementById('aiProviderChrome')?.classList.add('active');
    document.getElementById('aiProviderCloud')?.classList.remove('active');
  } else {
    if (cloudRadio) cloudRadio.checked = true;
    document.getElementById('aiProviderCloud')?.classList.add('active');
    document.getElementById('aiProviderChrome')?.classList.remove('active');
    currentAIProvider = 'CLOUD_API';
  }
  
  updateAIProviderUI();
  
  // Add change listeners
  document.querySelectorAll('input[name="aiProvider"]').forEach(radio => {
    radio.addEventListener('change', async (e) => {
      const newProvider = e.target.value;
      
      // Check if Chrome AI selected but unavailable
      if (newProvider === 'CHROME_BUILTIN' && !chromeAIAvailable) {
        showWarning('Chrome AI unavailable. Using Cloud API.');
        // Revert to Cloud API
        if (cloudRadio) cloudRadio.checked = true;
        document.getElementById('aiProviderCloud')?.classList.add('active');
        document.getElementById('aiProviderChrome')?.classList.remove('active');
        return;
      }
      
      await saveAIProvider(newProvider);
      updateAIProviderUI();
      showSuccess(`Switched to ${newProvider === 'CHROME_BUILTIN' ? 'Chrome AI' : 'Cloud API'}`);
    });
  });
}

function updateAIProviderUI() {
  // Update active visual state
  document.querySelectorAll('.ai-provider-option').forEach(option => {
    option.classList.remove('active');
  });
  
  if (currentAIProvider === 'CHROME_BUILTIN') {
    document.getElementById('aiProviderChrome')?.classList.add('active');
  } else {
    document.getElementById('aiProviderCloud')?.classList.add('active');
  }
  
  // Update info text
  const infoEl = document.getElementById('aiProviderInfo');
  if (infoEl) {
    if (currentAIProvider === 'CHROME_BUILTIN') {
      infoEl.innerHTML = `
        <span>💡</span>
        <span><strong>Chrome AI:</strong> Fast and private with local processing. No API key needed. Fallback to Cloud API if unavailable.</span>
      `;
      infoEl.classList.remove('ai-provider-unavailable');
    } else {
      infoEl.innerHTML = `
        <span>☁️</span>
        <span><strong>Cloud API:</strong> Advanced features with vision support. Requires API key. Data sent to Google for processing.</span>
      `;
      infoEl.classList.remove('ai-provider-unavailable');
    }
  }
  
  // Toggle API key section visibility
  const apiKeySection = document.getElementById('apiKeySection');
  if (apiKeySection) {
    if (currentAIProvider === 'CLOUD_API') {
      apiKeySection.style.display = 'block';
    } else {
      apiKeySection.style.display = 'none';
    }
  }
  
  console.log('[Popup] AI provider UI updated:', currentAIProvider);
}

// ========================================
// EVENT LISTENERS (ENHANCED)
// ========================================
function setupEventListeners() {
  const saveApiKeyBtn = document.getElementById('saveApiKey');
  if (saveApiKeyBtn) {
    saveApiKeyBtn.addEventListener('click', saveApiKey);
  }
  
  // 🆕 Real-time API key validation
  const apiKeyInput = document.getElementById('apiKey');
  if (apiKeyInput) {
    let validationTimeout;
    apiKeyInput.addEventListener('input', (e) => {
      clearTimeout(validationTimeout);
      validationTimeout = setTimeout(() => {
        validateApiKeyRealtime(e.target.value);
      }, 500);
    });
  }
  
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
// 🆕 DAY 21: API KEY VALIDATION
// ========================================
async function validateApiKeyRealtime(apiKey) {
  const statusEl = document.getElementById('apiKeyStatus');
  const inputEl = document.getElementById('apiKey');
  
  if (!apiKey || apiKey.length < 10) {
    if (statusEl) statusEl.style.display = 'none';
    if (inputEl) inputEl.classList.remove('error', 'success');
    return;
  }
  
  // Basic format check
  if (!apiKey.startsWith('AIza')) {
    if (statusEl) {
      statusEl.className = 'api-key-status invalid';
      statusEl.textContent = 'Invalid format';
      statusEl.style.display = 'block';
    }
    if (inputEl) {
      inputEl.classList.add('error');
      inputEl.classList.remove('success');
    }
    return;
  }
  
  // Show checking status
  if (statusEl) {
    statusEl.className = 'api-key-status checking';
    statusEl.textContent = 'Validating...';
    statusEl.style.display = 'block';
  }
  
  try {
    // Attempt to validate with Gemini API
    const response = await chrome.runtime.sendMessage({
      action: 'validateApiKey',
      apiKey: apiKey
    });
    
    if (response.valid) {
      if (statusEl) {
        statusEl.className = 'api-key-status valid';
        statusEl.textContent = '✓ Valid';
      }
      if (inputEl) {
        inputEl.classList.add('success');
        inputEl.classList.remove('error');
      }
    } else {
      if (statusEl) {
        statusEl.className = 'api-key-status invalid';
        statusEl.textContent = '✗ Invalid';
      }
      if (inputEl) {
        inputEl.classList.add('error');
        inputEl.classList.remove('success');
      }
    }
    
  } catch (error) {
    console.error('[Popup] Validation error:', error);
    if (statusEl) statusEl.style.display = 'none';
  }
}

// ========================================
// 🆕 DAY 21: RATE LIMIT WARNING SYSTEM
// ========================================
function showRateLimitWarning(type, details = {}) {
  const warningEl = document.getElementById('rateLimitWarning');
  const titleEl = document.getElementById('rateLimitWarningTitle');
  const messageEl = document.getElementById('rateLimitWarningMessage');
  
  if (!warningEl || !titleEl || !messageEl) return;
  
  rateLimitWarningCount++;
  
  if (type === 'RPM') {
    titleEl.textContent = '⚠️ High Request Rate Detected';
    messageEl.textContent = `You're approaching rate limits (${details.rpm || 25} requests/min). Slow down to avoid 429 errors.`;
  } else if (type === 'RPD') {
    titleEl.textContent = '⚠️ Approaching Daily Token Limit';
    messageEl.textContent = `You've used ~${details.tokensUsed || '900K'} tokens today (limit: 1M TPD). Switch to Chrome AI or reduce usage.`;
  } else if (type === '429') {
    titleEl.textContent = '🚨 Multiple Rate Limit Errors';
    messageEl.textContent = 'You have hit rate limits multiple times. Automatic fallback to Chrome AI recommended.';
    
    // Auto-switch after 3 consecutive 429s
    if (rateLimitWarningCount >= 3 && chromeAIAvailable) {
      setTimeout(async () => {
        showInfo('Auto-switching to Chrome AI to avoid rate limits...');
        const cloudRadio = document.querySelector('input[name="aiProvider"][value="CHROME_BUILTIN"]');
        if (cloudRadio) {
          cloudRadio.checked = true;
          await saveAIProvider('CHROME_BUILTIN');
          updateAIProviderUI();
        }
      }, 2000);
    }
  }
  
  warningEl.classList.add('active');
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    warningEl.classList.remove('active');
  }, 10000);
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
    document.getElementById('extractionTypeMulti')?.classList.add('active');
  } else {
    document.getElementById('extractionTypeSingle')?.classList.add('active');
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
        <span><strong>SINGLE_ITEM Mode:</strong> Captures a screenshot of your visible viewport and uses AI Vision to extract the main article or product. Requires Cloud API (Chrome AI doesn't support vision yet).</span>
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
      // Silently validate on load
      validateApiKeyRealtime(response.apiKey);
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
    // Validate before saving
    const validationResponse = await chrome.runtime.sendMessage({
      action: 'validateApiKey',
      apiKey: apiKey
    });
    
    if (!validationResponse.valid) {
      showError('API key validation failed. Please check your key.');
      return;
    }
    
    await chrome.runtime.sendMessage({ action: 'saveApiKey', apiKey });
    showSuccess('API key saved and validated successfully');
    
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
// EXTRACTION HANDLER (ENHANCED)
// ========================================
async function handleExtract() {
  if (extractionInProgress) {
    showError('Extraction already in progress. Please wait.');
    return;
  }
  
  // Check TOS acceptance
  if (!tosAccepted) {
    showError('Please accept Terms of Service first');
    await showTOSModal();
    return;
  }
  
  // SINGLE_ITEM mode requirements
  if (currentExtractionType === 'SINGLE_ITEM') {
    if (currentMode === 'offline') {
      showError('SINGLE_ITEM mode requires AI (Min/Balanced/Max). Switch modes or use MULTI extraction.');
      return;
    }
    
    // SINGLE_ITEM requires Cloud API (vision support)
    if (currentAIProvider === 'CHROME_BUILTIN') {
      showWarning('SINGLE_ITEM mode requires Cloud API (vision support). Auto-switching...');
      const cloudRadio = document.querySelector('input[name="aiProvider"][value="CLOUD_API"]');
      if (cloudRadio) {
        cloudRadio.checked = true;
        await saveAIProvider('CLOUD_API');
        updateAIProviderUI();
      }
    }
  }
  
  // Check API key for Cloud API modes (except offline)
  if (currentMode !== 'offline' && currentAIProvider === 'CLOUD_API') {
    const apiKey = document.getElementById('apiKey').value.trim();
    if (!apiKey) {
      showError('Please add your Gemini API key first (or switch to Chrome AI)');
      return;
    }
  }
  
  extractionInProgress = true;
  
  const extractBtn = document.getElementById('extractBtn');
  extractBtn.disabled = true;
  extractBtn.textContent = '⏳ Extracting...';
  
  document.getElementById('resultsSection').style.display = 'none';
  document.getElementById('errorSection').style.display = 'none';
  
  // Hide rate limit warning during extraction
  const warningEl = document.getElementById('rateLimitWarning');
  if (warningEl) warningEl.classList.remove('active');
  
  try {
    console.log('[Popup] Starting extraction | Mode:', currentMode, '| Type:', currentExtractionType, '| AI:', currentAIProvider);
    const startTime = Date.now();
    
    const response = await chrome.runtime.sendMessage({
      action: 'extractData',
      mode: currentMode,
      extractionType: currentExtractionType,
      aiProvider: currentAIProvider // 🆕 Send AI provider
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (response.success) {
      currentData = response.data;
      displayResults(response, duration);
      showSuccess(`Extraction complete in ${duration}s`);
      
      // Reset rate limit warning counter on success
      if (rateLimitWarningCount > 0) {
        rateLimitWarningCount = Math.max(0, rateLimitWarningCount - 1);
      }
      
      await loadExtractionHistory();
      
    } else {
      // Check for rate limit errors
      if (response.error && response.error.includes('429')) {
        showRateLimitWarning('429');
      }
      
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
// 🆕 DAY 21: ENHANCED ERROR DISPLAY
// ========================================
function displayGracefulError(errorMessage, response = {}) {
  console.log('[Popup] Enhanced error handling:', errorMessage);
  
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
        'Refresh the page and try again',
        'Try <strong>Max Mode</strong> for AI-powered extraction',
        'Use <strong>Offline Mode</strong> for basic extraction',
        'Switch to <strong>Chrome AI</strong> if using Cloud API'
      ],
      severity: 'error',
      recoveryAction: 'none'
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
  const errorSection = document.getElementById('errorSection');
  errorSection.style.display = 'block';
  
  const titleEl = document.getElementById('errorTitle');
  const messageEl = document.getElementById('errorMessage');
  const recoveryEl = document.getElementById('errorRecoverySteps');
  const recoveryList = document.getElementById('errorRecoveryList');
  
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
  
  if (titleEl) {
    titleEl.textContent = errorInfo.title;
    titleEl.style.color = color;
  }
  
  if (messageEl) {
    messageEl.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px;">
        <span style="font-size: 20px;">${icon}</span>
        <div>
          <div style="font-size: 14px; color: #4B5563; margin-bottom: 8px;">${errorInfo.message}</div>
          ${contextMessage ? `<div style="font-size: 12px; color: #6B7280; padding: 6px 10px; background: rgba(0,0,0,0.05); border-radius: 4px;">${contextMessage}</div>` : ''}
        </div>
      </div>
    `;
  }
  
  if (recoveryEl && recoveryList && errorInfo.suggestions) {
    recoveryEl.style.display = 'block';
    recoveryList.innerHTML = errorInfo.suggestions.map(s => `<li>${s}</li>`).join('');
  }
  
  errorSection.scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// RESULTS DISPLAY (ENHANCED FOR DAY 21)
// ========================================
function displayResults(response, duration) {
  const { data, metadata } = response;
  
  document.getElementById('resultsSection').style.display = 'block';
  document.getElementById('errorSection').style.display = 'none';
  
  displayConfidenceTier(metadata.confidence, metadata.confidenceTier);
  
  // 🆕 Display AI Provider used
  const aiProviderUsedEl = document.getElementById('aiProviderUsed');
  if (aiProviderUsedEl) {
    const providerIcon = metadata.aiProvider === 'CHROME_BUILTIN' ? '🔵' : '☁️';
    const providerLabel = metadata.aiProvider === 'CHROME_BUILTIN' ? 'Chrome AI' : 'Cloud API';
    aiProviderUsedEl.textContent = `${providerIcon} ${providerLabel}`;
  }
  
  document.getElementById('modeUsed').textContent = 
    metadata.mode.toUpperCase() + (metadata.cached ? ' 💾' : '');
  
  // Display extraction type
  const extractionTypeEl = document.getElementById('extractionTypeUsed');
  if (extractionTypeEl) {
    const typeIcon = metadata.extractionType === 'SINGLE_ITEM' ? '📄' : '📦';
    const typeLabel = metadata.extractionType === 'SINGLE_ITEM' ? 'Article' : 'All Items';
    extractionTypeEl.textContent = `${typeIcon} ${typeLabel}`;
  }
  
  document.getElementById('duration').textContent = duration + 's';
  document.getElementById('classification').textContent = metadata.classification || 'Unknown';
  
  // 🆕 Display deduplication stats
  const duplicatesEl = document.getElementById('duplicatesRemoved');
  if (duplicatesEl) {
    const duplicates = metadata.duplicatesRemoved || 0;
    duplicatesEl.textContent = duplicates;
    if (duplicates > 0) {
      duplicatesEl.parentElement.style.background = 'rgba(16, 185, 129, 0.1)';
    }
  }
  
  // Show pagination hint for MULTI mode
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
// NOTIFICATION HELPERS (PRESERVED)
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
      if (!apiKey && currentAIProvider === 'CLOUD_API') {
        showError('API key required for AI CSV conversion (or switch to Chrome AI)');
        return;
      }
      
      const response = await chrome.runtime.sendMessage({
        action: 'convertToCSV',
        data: currentData,
        aiProvider: currentAIProvider
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
    
    // 🆕 Show AI provider icon
    const aiIcon = entry.aiProvider === 'CHROME_BUILTIN' ? '🔵' : '☁️';
    
    html += `
      <div style="padding: 8px; background: rgba(0,0,0,0.03); border-radius: 6px; margin-bottom: 6px; font-size: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-weight: 500; max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${entry.domain}</span>
          <span style="color: ${config.color};">${config.icon} ${entry.confidence}%</span>
        </div>
        <div style="color: #666; font-size: 11px;">
          ${aiIcon} ${entry.mode.toUpperCase()} • ${new Date(entry.timestamp).toLocaleTimeString()}
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

console.log('[Popup] Web Weaver Lightning v4.0 popup controller loaded (Chrome AI + Security)');
