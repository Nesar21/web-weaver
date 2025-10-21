/**
 * Web Weaver Lightning - Popup UI Controller
 * Version: 4.1.0 (Day 21.2 - CHROME AI FULL INTEGRATION)
 * 
 * 🆕 v4.1 CHANGES (DAY 21.2):
 * - Category filtering UI with 6 predefined categories
 * - Fallback banner display (24h cooldown)
 * - Item count display with new vs total tracking
 * - Enhanced translation/summarization UI (future)
 * - URL extraction status indicators
 * 
 * ✅ PRESERVED FROM v4.0:
 * - TOS/Privacy acceptance flow (blocks until accepted)
 * - AI Provider toggle (Chrome Built-in AI vs Cloud API)
 * - Real-time API key validation with status indicators
 * - Proactive rate limit warnings (25 RPM, 900K RPD thresholds)
 * - Enhanced error display with structured recovery steps
 * - Deduplication tracking and display
 * - Conditional UI sections (API key only for Cloud API)
 * - Chrome AI availability detection with fallback
 * - MULTI/SINGLE_ITEM extraction types
 * - All 5 extraction modes (offline, min, balanced, max, auto)
 */

// ========================================
// GLOBAL STATE
// ========================================

let currentData = null;
let currentMode = 'auto';
let currentExtractionType = 'MULTI';
let currentAIProvider = 'CHROME_BUILTIN'; // 🆕 Day 21
let currentCategory = 'all'; // 🆕 Day 21.2
let extractionInProgress = false;
let chromeAIAvailable = false; // 🆕 Day 21
let rateLimitWarningCount = 0; // 🆕 Day 21: Track consecutive rate limit warnings
let sessionItemCount = { new: 0, total: 0, duplicates: 0 }; // 🆕 Day 21.2: Item count tracking

// 🆕 DAY 21: TOS acceptance tracking
let tosAccepted = false;
const TOS_VERSION = '1.0.0';
const TOS_STORAGE_KEY = 'web_weaver_tos_accepted';

// 🆕 DAY 21.2: Category definitions (mirroring config.js)
const CATEGORIES = [
  { id: 'all', name: 'All Items', icon: '📦', description: 'Extract all items on the page' },
  { id: 'products', name: 'Products Only', icon: '🛍️', description: 'Extract only product listings' },
  { id: 'articles', name: 'Articles Only', icon: '📰', description: 'Extract only article/blog posts' },
  { id: 'videos', name: 'Videos Only', icon: '🎥', description: 'Extract only video listings' },
  { id: 'jobs', name: 'Job Listings', icon: '💼', description: 'Extract only job postings' },
  { id: 'events', name: 'Events', icon: '📅', description: 'Extract only event listings' }
];

// ========================================
// 🆕 DAY 21: ERROR MESSAGES (ENHANCED) - PRESERVED FROM v4.0
// ========================================

const ERROR_MESSAGES = {
  // Detection failures
  'No repeated patterns found': {
    title: 'No Repeating Patterns Detected',
    message: 'The page structure doesn\'t show clear repeating elements.',
    suggestions: [
      'Try **Max Mode** for AI-powered deep analysis',
      'Refresh the page and try again',
      'Try **SINGLE_ITEM mode** if viewing one article',
      'Switch to **Chrome AI** for faster processing'
    ],
    severity: 'info',
    recoveryAction: 'switch_mode'
  },
  
  'Visual detection timeout': {
    title: 'Visual Analysis Timed Out',
    message: 'The page has complex layout that exceeded analysis time limit.',
    suggestions: [
      'Switch to **Max Mode** for AI fallback',
      'Try **Offline Mode** for basic DOM extraction',
      'Wait a moment and try again',
      'Consider using **Chrome AI** for local processing'
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
      'Use **Max Mode** for better handling',
      '**Chrome AI** processes faster for dynamic sites'
    ],
    severity: 'warning',
    recoveryAction: 'wait_and_retry'
  },
  
  // 🆕 DAY 21: Enhanced API error handling
  'API error: 429': {
    title: '⚠️ API Rate Limit Exceeded',
    message: 'Google Gemini API rate limit reached. This is a Google-imposed limit (15 RPM or 1M TPD).',
    suggestions: [
      '✅ **Switch to Chrome AI** (zero cost, no limits)',
      'Wait 60-120 seconds for rate limit reset',
      'Switch to **Offline Mode** (no API calls)',
      'Check quota at Google AI Studio'
    ],
    severity: 'error',
    recoveryAction: 'switch_to_chrome_ai'
  },
  
  'API error: 403': {
    title: '🔒 API Key Invalid or Expired',
    message: 'Your Gemini API key is invalid, expired, or lacks permissions.',
    suggestions: [
      '✅ **Switch to Chrome AI** (no key required)',
      'Generate new key at Google AI Studio',
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
      '✅ **Switch to Chrome AI** (unaffected by API issues)',
      'Wait 5-10 minutes and retry',
      'Check Google Cloud Status',
      'Retry extraction after services recover'
    ],
    severity: 'error',
    recoveryAction: 'switch_to_chrome_ai'
  },
  
  'API error: network': {
    title: '🌐 Network Connection Error',
    message: 'No internet connection or request timeout.',
    suggestions: [
      '✅ **Switch to Chrome AI** (works offline)',
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
      'Try **Max Mode** for better accuracy',
      'Refresh and try again',
      'Page structure may be too complex',
      '**Chrome AI** might perform better on this site'
    ],
    severity: 'warning',
    recoveryAction: 'switch_mode'
  },
  
  // 🆕 DAY 21: Chrome AI specific errors
  'Chrome AI unavailable': {
    title: 'Chrome AI Not Available',
    message: 'Chrome Built-in AI requires Chrome 128+ Dev/Canary with AI features enabled.',
    suggestions: [
      '**Automatic fallback to Cloud API** activated',
      'Download Chrome Dev/Canary from chrome.dev',
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
      'Switch to **Min/Balanced/Max mode**',
      'Use **MULTI mode** for DOM-based extraction',
      '**Note:** Chrome AI doesn\'t support vision yet'
    ],
    severity: 'warning',
    recoveryAction: 'switch_extraction_type'
  },
  
  'Screenshot capture failed': {
    title: 'Screenshot Failed',
    message: 'Unable to capture the visible viewport.',
    suggestions: [
      'Refresh the page and try again',
      'Switch to **MULTI mode** for DOM extraction',
      'Try **Offline mode** as fallback'
    ],
    severity: 'error',
    recoveryAction: 'switch_extraction_type'
  }
};

// ========================================
// 🆕 DAY 21.2: INITIALIZATION (ENHANCED)
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Popup] Initializing Web Weaver Lightning v4.1...');
  
  // 🆕 Step 1: Check TOS acceptance (blocks until accepted)
  await checkTOSAcceptance();
  
  // 🆕 Step 2: Check Chrome AI availability
  await checkChromeAIAvailability();
  
  // Step 3: Load settings and initialize UI
  await loadAIProvider();
  await loadApiKey();
  await loadCategory(); // 🆕 Day 21.2
  setupEventListeners();
  await loadExtractionHistory();
  initializeModeSelector();
  initializeExtractionTypeSelector();
  initializeAIProviderSelector(); // 🆕
  initializeCategorySelector(); // 🆕 Day 21.2
  
  // 🆕 Day 21.2: Check if fallback banner should be shown
  await checkAndShowFallbackBanner();
  
  // 🆕 Day 21.2: Setup message listener for fallback banner
  setupMessageListener();
  
  console.log('[Popup] Initialization complete');
  console.log('[Popup] AI Provider:', currentAIProvider);
  console.log('[Popup] Chrome AI Available:', chromeAIAvailable);
  console.log('[Popup] Category:', currentCategory);
});

// ========================================
// 🆕 DAY 21: TOS ACCEPTANCE CHECK (PRESERVED FROM v4.0)
// ========================================

async function checkTOSAcceptance() {
  const result = await chrome.storage.local.get([TOS_STORAGE_KEY]);
  const acceptance = result[TOS_STORAGE_KEY];
  
  if (acceptance && acceptance.version === TOS_VERSION && acceptance.accepted) {
    tosAccepted = true;
    console.log('[Popup] TOS already accepted');
    document.getElementById('tos-overlay').style.display = 'none';
    return;
  }
  
  // Show TOS overlay
  console.log('[Popup] Showing TOS acceptance overlay');
  document.getElementById('tos-overlay').style.display = 'flex';
  
  // Setup accept button
  document.getElementById('accept-tos-btn').addEventListener('click', async () => {
    await chrome.storage.local.set({
      [TOS_STORAGE_KEY]: {
        version: TOS_VERSION,
        accepted: true,
        timestamp: Date.now()
      }
    });
    
    tosAccepted = true;
    document.getElementById('tos-overlay').style.display = 'none';
    console.log('[Popup] TOS accepted');
  });
  
  // Setup decline button
  document.getElementById('decline-tos-btn').addEventListener('click', () => {
    window.close(); // Close popup if declined
  });
}

// ========================================
// 🆕 DAY 21: CHROME AI AVAILABILITY CHECK (PRESERVED)
// ========================================

async function checkChromeAIAvailability() {
  console.log('[Popup] Checking Chrome AI availability...');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'checkChromeAI' });
    
    if (response.success) {
      chromeAIAvailable = response.available;
      console.log('[Popup] Chrome AI available:', chromeAIAvailable);
      
      // Update UI indicators
      updateChromeAIStatusIndicator();
    }
  } catch (error) {
    console.error('[Popup] Error checking Chrome AI:', error);
    chromeAIAvailable = false;
  }
}

function updateChromeAIStatusIndicator() {
  const indicator = document.getElementById('chrome-ai-status');
  
  if (!indicator) return;
  
  if (chromeAIAvailable) {
    indicator.textContent = '✅ Available';
    indicator.className = 'status-indicator status-success';
  } else {
    indicator.textContent = '❌ Unavailable';
    indicator.className = 'status-indicator status-error';
  }
}

// ========================================
// 🆕 DAY 21.2: CATEGORY LOADING & INITIALIZATION
// ========================================

async function loadCategory() {
  console.log('[Popup] Loading category preference...');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getCategory' });
    
    if (response.success && response.category) {
      currentCategory = response.category;
      console.log('[Popup] Category loaded:', currentCategory);
    }
  } catch (error) {
    console.error('[Popup] Error loading category:', error);
    currentCategory = 'all';
  }
}

function initializeCategorySelector() {
  console.log('[Popup] Initializing category selector...');
  
  const categorySelect = document.getElementById('category-select');
  
  if (!categorySelect) {
    console.warn('[Popup] Category selector element not found');
    return;
  }
  
  // Populate options
  categorySelect.innerHTML = '';
  CATEGORIES.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = `${category.icon} ${category.name}`;
    option.title = category.description;
    
    if (category.id === currentCategory) {
      option.selected = true;
    }
    
    categorySelect.appendChild(option);
  });
  
  // Event listener
  categorySelect.addEventListener('change', async (e) => {
    currentCategory = e.target.value;
    console.log('[Popup] Category changed to:', currentCategory);
    
    // Save to background
    await chrome.runtime.sendMessage({
      action: 'setCategory',
      category: currentCategory
    });
    
    // Update category description
    updateCategoryDescription();
  });
  
  // Initial description update
  updateCategoryDescription();
}

function updateCategoryDescription() {
  const descElement = document.getElementById('category-description');
  
  if (!descElement) return;
  
  const category = CATEGORIES.find(c => c.id === currentCategory);
  
  if (category) {
    descElement.textContent = category.description;
    descElement.style.display = currentCategory === 'all' ? 'none' : 'block';
  }
}

// ========================================
// 🆕 DAY 21.2: FALLBACK BANNER MANAGEMENT
// ========================================

async function checkAndShowFallbackBanner() {
  console.log('[Popup] Checking fallback banner state...');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'checkFallbackBanner' });
    
    if (response.success && response.shouldShow) {
      // Banner will be shown via message listener when background triggers it
      console.log('[Popup] Fallback banner may be shown on next trigger');
    }
  } catch (error) {
    console.error('[Popup] Error checking fallback banner:', error);
  }
}

function showFallbackBanner(bannerType) {
  console.log('[Popup] Showing fallback banner:', bannerType);
  
  const banner = document.getElementById('fallback-banner');
  const bannerMessage = document.getElementById('fallback-banner-message');
  const bannerAction = document.getElementById('fallback-banner-action');
  
  if (!banner || !bannerMessage) {
    console.warn('[Popup] Fallback banner elements not found');
    return;
  }
  
  // Banner messages
  const messages = {
    chromeAIUnavailable: {
      message: '⚠️ Chrome Built-in AI unavailable. Falling back to Cloud API (slower). Get Chrome Dev 128+ for 10× faster extraction.',
      actionText: 'Download Chrome Dev',
      actionUrl: 'https://www.google.com/chrome/dev/'
    },
    cloudAPIFallback: {
      message: '✅ Using Cloud API. Chrome AI not available. Extraction will be slower but more accurate.',
      actionText: null,
      actionUrl: null
    },
    rateLimitFallback: {
      message: '🚨 Rate limit hit. Switched to Chrome AI to avoid further rate limiting.',
      actionText: null,
      actionUrl: null
    }
  };
  
  const config = messages[bannerType] || messages.chromeAIUnavailable;
  
  bannerMessage.textContent = config.message;
  
  if (config.actionText && config.actionUrl && bannerAction) {
    bannerAction.textContent = config.actionText;
    bannerAction.href = config.actionUrl;
    bannerAction.style.display = 'inline-block';
  } else if (bannerAction) {
    bannerAction.style.display = 'none';
  }
  
  banner.style.display = 'block';
  
  // Auto-hide after 10 seconds or on dismiss
  setTimeout(() => {
    banner.style.display = 'none';
  }, 10000);
}

function dismissFallbackBanner() {
  const banner = document.getElementById('fallback-banner');
  if (banner) {
    banner.style.display = 'none';
  }
  
  // Notify background to update dismiss count
  chrome.runtime.sendMessage({ action: 'dismissFallbackBanner' }).catch(() => {});
}

function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Popup] Message received:', message.action);
    
    switch (message.action) {
      case 'showFallbackBanner':
        showFallbackBanner(message.bannerType);
        break;
        
      case 'rateLimitWarning':
        showRateLimitWarning(message.requestCount, message.threshold);
        break;
        
      case 'scrollProgress':
        updateScrollProgress(message.scrollCount, message.itemCount);
        break;
        
      default:
        console.log('[Popup] Unknown message action:', message.action);
    }
    
    sendResponse({ success: true });
  });
}

// ========================================
// 🆕 DAY 21: AI PROVIDER MANAGEMENT (PRESERVED)
// ========================================

async function loadAIProvider() {
  console.log('[Popup] Loading AI provider preference...');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getAIProvider' });
    
    if (response.success && response.provider) {
      currentAIProvider = response.provider;
      console.log('[Popup] AI provider loaded:', currentAIProvider);
    }
  } catch (error) {
    console.error('[Popup] Error loading AI provider:', error);
    currentAIProvider = 'CHROME_BUILTIN';
  }
}

function initializeAIProviderSelector() {
  console.log('[Popup] Initializing AI provider selector...');
  
  const providerSelect = document.getElementById('ai-provider-select');
  
  if (!providerSelect) {
    console.warn('[Popup] AI provider selector not found');
    return;
  }
  
  // Set current value
  providerSelect.value = currentAIProvider;
  
  // Event listener
  providerSelect.addEventListener('change', async (e) => {
    const newProvider = e.target.value;
    console.log('[Popup] AI provider changing to:', newProvider);
    
    // Update state
    currentAIProvider = newProvider;
    
    // Save to background
    await chrome.runtime.sendMessage({
      action: 'setAIProvider',
      provider: newProvider
    });
    
    // Update UI
    updateAPIKeyVisibility();
    updateProviderDescription();
    
    console.log('[Popup] AI provider changed successfully');
  });
  
  // Initial UI updates
  updateAPIKeyVisibility();
  updateProviderDescription();
}

function updateAPIKeyVisibility() {
  const apiKeySection = document.getElementById('api-key-section');
  
  if (!apiKeySection) return;
  
  // Show API key section only for Cloud API
  if (currentAIProvider === 'CLOUD_API') {
    apiKeySection.style.display = 'block';
  } else {
    apiKeySection.style.display = 'none';
  }
}

function updateProviderDescription() {
  const descElement = document.getElementById('provider-description');
  
  if (!descElement) return;
  
  const descriptions = {
    CHROME_BUILTIN: '🔵 Chrome AI: Requires Chrome 128+. Fast and private with local processing. Fallback to Cloud API if unavailable.',
    CLOUD_API: '☁️ Cloud API: Advanced cloud AI with higher accuracy. Requires API key and internet connection.'
  };
  
  descElement.textContent = descriptions[currentAIProvider] || '';
}

// ========================================
// API KEY MANAGEMENT (PRESERVED FROM v4.0)
// ========================================

async function loadApiKey() {
  console.log('[Popup] Loading API key...');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getApiKey' });
    
    if (response.success && response.apiKey) {
      document.getElementById('api-key-input').value = response.apiKey;
      
      // Validate on load if Cloud API selected
      if (currentAIProvider === 'CLOUD_API') {
        await validateApiKey(response.apiKey);
      }
    }
  } catch (error) {
    console.error('[Popup] Error loading API key:', error);
  }
}

async function saveApiKey() {
  const input = document.getElementById('api-key-input');
  const apiKey = input.value.trim();
  
  console.log('[Popup] Saving API key...');
  
  if (!apiKey) {
    showError('API key cannot be empty');
    return;
  }
  
  // Show loading state
  const statusElement = document.getElementById('api-key-status');
  statusElement.textContent = '⏳ Validating...';
  statusElement.className = 'status-indicator status-warning';
  
  try {
    // Validate key
    const validation = await chrome.runtime.sendMessage({
      action: 'validateApiKey',
      apiKey
    });
    
    if (validation.success && validation.valid) {
      // Save key
      await chrome.runtime.sendMessage({
        action: 'saveApiKey',
        apiKey
      });
      
      statusElement.textContent = '✅ Valid';
      statusElement.className = 'status-indicator status-success';
      
      console.log('[Popup] API key saved and validated');
    } else {
      statusElement.textContent = '❌ Invalid';
      statusElement.className = 'status-indicator status-error';
      showError('Invalid API key. Generate one at Google AI Studio.');
    }
  } catch (error) {
    console.error('[Popup] API key save error:', error);
    statusElement.textContent = '⚠️ Error';
    statusElement.className = 'status-indicator status-error';
    showError('Failed to validate API key: ' + error.message);
  }
}

async function validateApiKey(apiKey) {
  if (!apiKey) return;
  
  const statusElement = document.getElementById('api-key-status');
  
  if (!statusElement) return;
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'validateApiKey',
      apiKey
    });
    
    if (response.success && response.valid) {
      statusElement.textContent = '✅ Valid';
      statusElement.className = 'status-indicator status-success';
    } else {
      statusElement.textContent = '❌ Invalid';
      statusElement.className = 'status-indicator status-error';
    }
  } catch (error) {
    console.error('[Popup] Validation error:', error);
    statusElement.textContent = '⚠️ Error';
    statusElement.className = 'status-indicator status-error';
  }
}

// ========================================
// MODE & EXTRACTION TYPE INITIALIZATION (PRESERVED)
// ========================================

function initializeModeSelector() {
  const modeButtons = document.querySelectorAll('.mode-btn');
  
  modeButtons.forEach(btn => {
    if (btn.dataset.mode === currentMode) {
      btn.classList.add('active');
    }
    
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      
      console.log('[Popup] Mode changed to:', currentMode);
    });
  });
}

function initializeExtractionTypeSelector() {
  const typeButtons = document.querySelectorAll('.extraction-type-btn');
  
  typeButtons.forEach(btn => {
    if (btn.dataset.type === currentExtractionType) {
      btn.classList.add('active');
    }
    
    btn.addEventListener('click', () => {
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentExtractionType = btn.dataset.type;
      
      console.log('[Popup] Extraction type changed to:', currentExtractionType);
      
      // Update UI based on extraction type
      updateExtractionTypeUI();
    });
  });
  
  updateExtractionTypeUI();
}

function updateExtractionTypeUI() {
  const typeDescription = document.getElementById('extraction-type-description');
  
  if (!typeDescription) return;
  
  const descriptions = {
    MULTI: '📦 MULTI Mode: Use for search results, product listings, article feeds. Scroll or click "Next Page" to load more, then click "Extract Again" to get more items.',
    SINGLE_ITEM: '📸 SINGLE Mode: Use for product detail pages, articles, profiles. Captures screenshot for AI analysis.'
  };
  
  typeDescription.textContent = descriptions[currentExtractionType] || '';
}

// ========================================
// EVENT LISTENERS SETUP
// ========================================

function setupEventListeners() {
  console.log('[Popup] Setting up event listeners...');
  
  // Extract button
  document.getElementById('extract-btn')?.addEventListener('click', extractData);
  
  // API key save button
  document.getElementById('save-api-key-btn')?.addEventListener('click', saveApiKey);
  
  // Export buttons
  document.getElementById('export-json-btn')?.addEventListener('click', () => exportData('json'));
  document.getElementById('export-csv-btn')?.addEventListener('click', () => exportData('csv'));
  document.getElementById('copy-btn')?.addEventListener('click', copyToClipboard);
  
  // Clear cache button
  document.getElementById('clear-cache-btn')?.addEventListener('click', clearCache);
  
  // 🆕 Day 21.2: Fallback banner dismiss button
  document.getElementById('fallback-banner-dismiss')?.addEventListener('click', dismissFallbackBanner);
}

// ========================================
// 🆕 DAY 21.2: MAIN EXTRACTION HANDLER (ENHANCED)
// ========================================

async function extractData() {
  if (extractionInProgress) {
    console.log('[Popup] Extraction already in progress');
    return;
  }
  
  if (!tosAccepted) {
    showError('Please accept Terms of Service first');
    return;
  }
  
  console.log('[Popup] Starting extraction...', {
    mode: currentMode,
    type: currentExtractionType,
    provider: currentAIProvider,
    category: currentCategory // 🆕 Day 21.2
  });
  
  extractionInProgress = true;
  
  // Update UI
  const extractBtn = document.getElementById('extract-btn');
  const resultSection = document.getElementById('result-section');
  const errorSection = document.getElementById('error-section');
  
  extractBtn.disabled = true;
  extractBtn.textContent = '⏳ Extracting...';
  
  resultSection.style.display = 'none';
  errorSection.style.display = 'none';
  
  // 🆕 Day 21.2: Show item count loading state
  updateItemCountDisplay(null, null, true);
  
  try {
    const startTime = Date.now();
    
    // Call background script
    const response = await chrome.runtime.sendMessage({
      action: 'extractData',
      mode: currentMode,
      extractionType: currentExtractionType,
      aiProvider: currentAIProvider,
      category: currentCategory // 🆕 Day 21.2
    });
    
    const duration = Date.now() - startTime;
    
    if (response.success) {
      console.log('[Popup] ✅ Extraction successful:', {
        items: response.data.length,
        time: duration + 'ms',
        metadata: response.metadata
      });
      
      currentData = response.data;
      
      // 🆕 Day 21.2: Update item count display
      updateItemCountDisplay(
        response.metadata.newItemsCount || response.data.length,
        response.metadata.totalSessionItems || response.data.length,
        false,
        response.metadata.duplicateCount || 0
      );
      
      displayResults(response);
      
    } else {
      console.error('[Popup] ❌ Extraction failed:', response.error);
      
      // Enhanced error handling
      displayError(response);
    }
    
  } catch (error) {
    console.error('[Popup] Exception during extraction:', error);
    
    displayError({
      success: false,
      error: error.message || 'Unknown error',
      message: 'An unexpected error occurred during extraction.'
    });
    
  } finally {
    extractionInProgress = false;
    extractBtn.disabled = false;
    extractBtn.textContent = '🔍 Extract Data';
  }
}

// ========================================
// 🆕 DAY 21.2: ITEM COUNT DISPLAY
// ========================================

function updateItemCountDisplay(newCount, totalCount, isLoading = false, duplicateCount = 0) {
  const countElement = document.getElementById('item-count-display');
  
  if (!countElement) return;
  
  if (isLoading) {
    countElement.innerHTML = '📊 <span class="item-count-loading">Counting items...</span>';
    countElement.style.display = 'block';
    return;
  }
  
  if (newCount === null || newCount === undefined) {
    countElement.style.display = 'none';
    return;
  }
  
  // Update session state
  sessionItemCount.new = newCount;
  sessionItemCount.total = totalCount || newCount;
  sessionItemCount.duplicates = duplicateCount || 0;
  
  // Format display
  let displayHTML = '📊 ';
  
  if (duplicateCount > 0) {
    displayHTML += `<span class="item-count-new" style="color: #10B981; font-weight: bold;">${newCount} new</span> `;
    displayHTML += `<span class="item-count-total">(${totalCount} total, ${duplicateCount} duplicates)</span>`;
  } else {
    displayHTML += `<span class="item-count-total" style="font-weight: bold;">${newCount} ${newCount === 1 ? 'item' : 'items'} extracted</span>`;
  }
  
  countElement.innerHTML = displayHTML;
  countElement.style.display = 'block';
  
  // Animate count update
  countElement.style.animation = 'none';
  setTimeout(() => {
    countElement.style.animation = 'fadeIn 0.3s ease-in';
  }, 10);
}

// ========================================
// RESULT DISPLAY (PRESERVED WITH ENHANCEMENTS)
// ========================================

function displayResults(response) {
  const resultSection = document.getElementById('result-section');
  const resultDisplay = document.getElementById('result-display');
  const metadataDisplay = document.getElementById('metadata-display');
  
  if (!resultSection || !resultDisplay) return;
  
  // Show result section
  resultSection.style.display = 'block';
  
  // Display JSON data
  const formattedJSON = JSON.stringify(response.data, null, 2);
  resultDisplay.textContent = formattedJSON;
  
  // Display metadata (enhanced with category)
  if (metadataDisplay && response.metadata) {
    const meta = response.metadata;
    
    let metadataHTML = `
      <div class="metadata-grid">
        <div class="metadata-item">
          <span class="metadata-label">Mode:</span>
          <span class="metadata-value">${meta.mode || 'N/A'}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Type:</span>
          <span class="metadata-value">${meta.extractionType || 'N/A'}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">AI Provider:</span>
          <span class="metadata-value">${formatAIProvider(meta.aiProvider)}</span>
        </div>
    `;
    
    // 🆕 Day 21.2: Show category if not 'all'
    if (meta.category && meta.category !== 'all') {
      const categoryObj = CATEGORIES.find(c => c.id === meta.category);
      metadataHTML += `
        <div class="metadata-item">
          <span class="metadata-label">Category:</span>
          <span class="metadata-value">${categoryObj ? categoryObj.icon + ' ' + categoryObj.name : meta.category}</span>
        </div>
      `;
    }
    
    metadataHTML += `
        <div class="metadata-item">
          <span class="metadata-label">Domain:</span>
          <span class="metadata-value">${meta.domain || 'N/A'}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Items:</span>
          <span class="metadata-value">${response.data.length}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Confidence:</span>
          <span class="metadata-value">${meta.confidence ? meta.confidence + '%' : 'N/A'}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Time:</span>
          <span class="metadata-value">${meta.executionTime ? meta.executionTime + 'ms' : 'N/A'}</span>
        </div>
      </div>
    `;
    
    metadataDisplay.innerHTML = metadataHTML;
  }
  
  console.log('[Popup] Results displayed');
}

function formatAIProvider(provider) {
  const providerNames = {
    CHROME_BUILTIN: '🔵 Chrome AI',
    CLOUD_API: '☁️ Cloud API',
    NONE: '⚠️ None'
  };
  
  return providerNames[provider] || provider;
}

// ========================================
// ERROR DISPLAY (ENHANCED FROM v4.0)
// ========================================

function displayError(response) {
  const errorSection = document.getElementById('error-section');
  const errorTitle = document.getElementById('error-title');
  const errorMessage = document.getElementById('error-message');
  const errorSuggestions = document.getElementById('error-suggestions');
  const errorActions = document.getElementById('error-actions');
  
  if (!errorSection) return;
  
  errorSection.style.display = 'block';
  
  // Find matching error config
  const errorKey = Object.keys(ERROR_MESSAGES).find(key => 
    response.error?.includes(key) || response.message?.includes(key)
  );
  
  const errorConfig = errorKey ? ERROR_MESSAGES[errorKey] : null;
  
  if (errorConfig) {
    // Use enhanced error message
    errorTitle.textContent = errorConfig.title;
    errorMessage.textContent = errorConfig.message;
    
    // Display suggestions
    if (errorSuggestions && errorConfig.suggestions) {
      errorSuggestions.innerHTML = '<strong>Try these solutions:</strong><ul>' +
        errorConfig.suggestions.map(s => `<li>${s}</li>`).join('') +
        '</ul>';
    }
    
    // Add recovery action buttons
    if (errorActions && errorConfig.recoveryAction) {
      errorActions.innerHTML = '';
      
      switch (errorConfig.recoveryAction) {
        case 'switch_to_chrome_ai':
          if (chromeAIAvailable && currentAIProvider !== 'CHROME_BUILTIN') {
            const switchBtn = document.createElement('button');
            switchBtn.className = 'action-btn';
            switchBtn.textContent = '🔵 Switch to Chrome AI';
            switchBtn.onclick = async () => {
              currentAIProvider = 'CHROME_BUILTIN';
              document.getElementById('ai-provider-select').value = 'CHROME_BUILTIN';
              await chrome.runtime.sendMessage({
                action: 'setAIProvider',
                provider: 'CHROME_BUILTIN'
              });
              updateAPIKeyVisibility();
              errorSection.style.display = 'none';
            };
            errorActions.appendChild(switchBtn);
          }
          break;
          
        case 'switch_mode':
          const maxModeBtn = document.createElement('button');
          maxModeBtn.className = 'action-btn';
          maxModeBtn.textContent = '🎯 Try Max Mode';
          maxModeBtn.onclick = () => {
            document.querySelector('[data-mode="max"]')?.click();
            errorSection.style.display = 'none';
          };
          errorActions.appendChild(maxModeBtn);
          break;
          
        case 'retry':
          const retryBtn = document.createElement('button');
          retryBtn.className = 'action-btn';
          retryBtn.textContent = '🔄 Retry Extraction';
          retryBtn.onclick = () => {
            errorSection.style.display = 'none';
            extractData();
          };
          errorActions.appendChild(retryBtn);
          break;
      }
    }
    
  } else {
    // Fallback generic error
    errorTitle.textContent = '❌ Extraction Failed';
    errorMessage.textContent = response.error || response.message || 'Unknown error occurred';
    
    if (errorSuggestions) {
      errorSuggestions.innerHTML = '<strong>Try:</strong><ul>' +
        '<li>Refresh the page and try again</li>' +
        '<li>Try a different extraction mode</li>' +
        '<li>Check browser console for details</li>' +
        '</ul>';
    }
  }
  
  console.log('[Popup] Error displayed:', response.error);
}

function showError(message) {
  displayError({
    success: false,
    error: message,
    message
  });
}

// ========================================
// 🆕 DAY 21: RATE LIMIT WARNING DISPLAY
// ========================================

function showRateLimitWarning(requestCount, threshold) {
  console.log('[Popup] Rate limit warning:', { requestCount, threshold });
  
  const warningBanner = document.getElementById('rate-limit-warning-banner');
  
  if (!warningBanner) return;
  
  const percentage = Math.round((requestCount / threshold) * 100);
  
  warningBanner.innerHTML = `
    ⚠️ High API Usage: ${requestCount}/${threshold} requests/min (${percentage}%)
    <a href="#" id="switch-to-chrome-ai-link" style="color: #60A5FA; margin-left: 10px;">Switch to Chrome AI (zero cost)</a>
  `;
  
  warningBanner.style.display = 'block';
  
  // Setup switch link
  document.getElementById('switch-to-chrome-ai-link')?.addEventListener('click', async (e) => {
    e.preventDefault();
    
    if (chromeAIAvailable) {
      currentAIProvider = 'CHROME_BUILTIN';
      document.getElementById('ai-provider-select').value = 'CHROME_BUILTIN';
      await chrome.runtime.sendMessage({
        action: 'setAIProvider',
        provider: 'CHROME_BUILTIN'
      });
      updateAPIKeyVisibility();
      warningBanner.style.display = 'none';
    }
  });
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    warningBanner.style.display = 'none';
  }, 10000);
}

// ========================================
// EXPORT FUNCTIONS (PRESERVED)
// ========================================

async function exportData(format) {
  if (!currentData || currentData.length === 0) {
    showError('No data to export');
    return;
  }
  
  console.log('[Popup] Exporting data as:', format);
  
  let blob;
  let filename;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const domain = new URL((await chrome.tabs.query({ active: true, currentWindow: true }))[0].url).hostname;
  
  // 🆕 Day 21.2: Include category in filename if not 'all'
  const categorySuffix = currentCategory !== 'all' ? `_${currentCategory}` : '';
  
  if (format === 'json') {
    const json = JSON.stringify(currentData, null, 2);
    blob = new Blob([json], { type: 'application/json' });
    filename = `web-weaver_${domain}${categorySuffix}_${timestamp}_${currentData.length}items.json`;
    
  } else if (format === 'csv') {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'convertToCSV',
        data: currentData,
        aiProvider: currentAIProvider
      });
      
      if (response.success) {
        blob = new Blob([response.csv], { type: 'text/csv' });
        filename = `web-weaver_${domain}${categorySuffix}_${timestamp}_${currentData.length}items.csv`;
      } else {
        throw new Error(response.error || 'CSV conversion failed');
      }
      
    } catch (error) {
      console.error('[Popup] CSV conversion error:', error);
      showError('Failed to convert to CSV: ' + error.message);
      return;
    }
  }
  
  // Trigger download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('[Popup] ✅ Export successful:', filename);
}

function copyToClipboard() {
  if (!currentData) {
    showError('No data to copy');
    return;
  }
  
  const json = JSON.stringify(currentData, null, 2);
  
  navigator.clipboard.writeText(json).then(() => {
    console.log('[Popup] ✅ Copied to clipboard');
    
    // Visual feedback
    const copyBtn = document.getElementById('copy-btn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✅ Copied!';
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
    
  }).catch(err => {
    console.error('[Popup] Copy failed:', err);
    showError('Failed to copy to clipboard');
  });
}

// ========================================
// CACHE & HISTORY (PRESERVED)
// ========================================

async function clearCache() {
  console.log('[Popup] Clearing cache...');
  
  try {
    await chrome.runtime.sendMessage({ action: 'clearCache' });
    
    // Clear UI state
    currentData = null;
    sessionItemCount = { new: 0, total: 0, duplicates: 0 };
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('error-section').style.display = 'none';
    document.getElementById('item-count-display').style.display = 'none';
    
    await loadExtractionHistory();
    
    console.log('[Popup] ✅ Cache cleared');
    
  } catch (error) {
    console.error('[Popup] Clear cache error:', error);
    showError('Failed to clear cache: ' + error.message);
  }
}

async function loadExtractionHistory() {
  console.log('[Popup] Loading extraction history...');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getExtractionHistory' });
    
    if (response.success && response.history) {
      displayHistory(response.history);
    }
  } catch (error) {
    console.error('[Popup] History load error:', error);
  }
}

function displayHistory(history) {
  const historyContainer = document.getElementById('history-container');
  
  if (!historyContainer) return;
  
  if (!history || history.length === 0) {
    historyContainer.innerHTML = '<p style="color: #6B7280;">No extraction history yet</p>';
    return;
  }
  
  historyContainer.innerHTML = history.slice(0, 5).map(entry => {
    const date = new Date(entry.timestamp).toLocaleString();
    const categoryDisplay = entry.category && entry.category !== 'all' ? ` | ${entry.category}` : '';
    
    return `
      <div class="history-entry">
        <div class="history-domain">${entry.domain}</div>
        <div class="history-meta">
          ${entry.itemCount} items | ${entry.mode}${categoryDisplay} | ${date}
        </div>
      </div>
    `;
  }).join('');
}

// ========================================
// SCROLL PROGRESS (PRESERVED)
// ========================================

function updateScrollProgress(scrollCount, itemCount) {
  console.log('[Popup] Scroll progress:', { scrollCount, itemCount });
  
  const progressElement = document.getElementById('scroll-progress');
  
  if (!progressElement) return;
  
  progressElement.textContent = `Scrolling... ${scrollCount} scrolls, ${itemCount} items found`;
  progressElement.style.display = 'block';
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

console.log('[Popup] ✅ Web Weaver Lightning v4.1.0 popup controller loaded');
console.log('[Popup] 🔵 Chrome AI integration enabled');
console.log('[Popup] 🎯 Category filtering enabled');
console.log('[Popup] 📊 Item count display enabled');
console.log('[Popup] 🔔 Fallback banner system active');
