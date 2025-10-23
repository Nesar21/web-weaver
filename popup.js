/**
 * Web Weaver Lightning - Popup UI Controller
 * Version: 4.2.0 (v4.2 - VISUAL AI + MULTIMODAL + BATCH ENHANCEMENTS)
 * 
 * 🆕 v4.2 CHANGES:
 * - Template selector with auto-detection
 * - Post-processing checkboxes (deduplication, translation, summarization) - ALL OPTIONAL
 * - Result tabs: Data, Insights, Metadata
 * - Insights generation UI with type selector
 * - Cost tracker display: REMOVED (API billing handled externally)
 * - Privacy badges based on provider
 * - Enhanced metadata display
 * 
 * ✅ PRESERVED FROM v4.1:
 * - TOS/Privacy acceptance flow
 * - AI Provider toggle (Chrome Built-in AI vs Cloud API)
 * - Real-time API key validation
 * - Proactive rate limit warnings
 * - Enhanced error display
 * - Chrome AI availability detection
 * - MULTI/SINGLE ITEM extraction types
 * - All 5 extraction modes
 * - Category filtering
 * - Fallback banner with 24h cooldown
 * - Item count tracking
 */

console.log('[Popup] Loading Web Weaver Lightning v4.2.0...');

// ============================================================================
// GLOBAL STATE - ENHANCED FROM v4.1 WITH v4.2 ADDITIONS
// ============================================================================

let currentData = null;
let currentMode = 'auto';
let currentExtractionType = 'MULTI';
let currentCategory = 'all';
let currentProvider = 'cloud'; // 'chrome' or 'cloud'
let chromeAIAvailable = {
  translator: false,
  summarizer: false,
  writer: false,
  languageDetector: false,
  rewriter: false
};
let extractionInProgress = false;
let lastExtractionTime = null;
let currentTemplate = null; // v4.2: Current applied template

// Deduplication, Translation, Summarization state (v4.2 - OPTIONAL)
let deduplicationEnabled = false;
let translationEnabled = false;
let summarizationEnabled = false;

// Performance tracking
let performanceMetrics = {
  extractionStartTime: 0,
  extractionEndTime: 0,
  totalExtractions: 0,
  successfulExtractions: 0,
  failedExtractions: 0
};

console.log('[Popup] State initialized');

// ============================================================================
// FUNCTION 1 of 63: CHECK TOS ACCEPTANCE
// ============================================================================

/**
 * Check if user has accepted Terms of Service
 * Redirects to TOS page if not accepted
 */
async function checkTOSAcceptance() {
  console.log('[Popup] Checking TOS acceptance...');
  
  try {
    const { tosAccepted } = await chrome.storage.local.get('tosAccepted');
    
    if (!tosAccepted) {
      console.log('[Popup] TOS not accepted, redirecting...');
      window.location.href = 'tos.html';
      return false;
    }
    
    console.log('[Popup] ✅ TOS accepted');
    return true;
  } catch (error) {
    console.error('[Popup] TOS check error:', error);
    return false;
  }
}

// ============================================================================
// FUNCTION 2 of 63: INITIALIZE AI PROVIDER SELECTOR
// ============================================================================

/**
 * Initialize AI provider toggle buttons (Chrome AI / Cloud API)
 * Sets up event listeners and loads saved preference
 */
function initializeAIProviderSelector() {
  console.log('[Popup] Initializing AI provider selector...');
  
  const chromeAIBtn = document.getElementById('provider-chrome');
  const cloudAPIBtn = document.getElementById('provider-cloud');
  
  if (!chromeAIBtn || !cloudAPIBtn) {
    console.warn('[Popup] AI provider buttons not found');
    return;
  }
  
  // Load saved provider
  loadAIProvider();
  
  // Set up event listeners
  chromeAIBtn.addEventListener('click', () => {
    setAIProvider('chrome');
  });
  
  cloudAPIBtn.addEventListener('click', () => {
    setAIProvider('cloud');
  });
  
  console.log('[Popup] ✅ AI provider selector initialized');
}

// ============================================================================
// FUNCTION 3 of 63: LOAD AI PROVIDER
// ============================================================================

/**
 * Load saved AI provider preference from storage
 * Sets current provider and updates UI
 */
async function loadAIProvider() {
  console.log('[Popup] Loading AI provider...');
  
  try {
    const { aiProvider } = await chrome.storage.local.get('aiProvider');
    currentProvider = aiProvider || 'cloud';
    
    console.log('[Popup] AI provider loaded:', currentProvider);
    updateAIProviderButtonStates();
    updatePrivacyBadges();
  } catch (error) {
    console.error('[Popup] Load AI provider error:', error);
    currentProvider = 'cloud';
  }
}

// ============================================================================
// FUNCTION 4 of 63: SET AI PROVIDER
// ============================================================================

/**
 * Set active AI provider and save to storage
 * Updates UI and privacy badges
 * 
 * @param {string} provider - 'chrome' or 'cloud'
 */
async function setAIProvider(provider) {
  console.log('[Popup] Setting AI provider:', provider);
  
  try {
    currentProvider = provider;
    await chrome.storage.local.set({ aiProvider: provider });
    
    updateAIProviderButtonStates();
    updatePrivacyBadges();
    updateAPIKeyVisibility();
    
    console.log('[Popup] ✅ AI provider set to:', provider);
  } catch (error) {
    console.error('[Popup] Set AI provider error:', error);
  }
}

// ============================================================================
// FUNCTION 5 of 63: UPDATE AI PROVIDER BUTTON STATES
// ============================================================================

/**
 * Update visual state of AI provider toggle buttons
 * Highlights active provider
 */
function updateAIProviderButtonStates() {
  const chromeAIBtn = document.getElementById('provider-chrome');
  const cloudAPIBtn = document.getElementById('provider-cloud');
  
  if (!chromeAIBtn || !cloudAPIBtn) return;
  
  // Remove active class from both
  chromeAIBtn.classList.remove('active');
  cloudAPIBtn.classList.remove('active');
  
  // Add active class to current provider
  if (currentProvider === 'chrome') {
    chromeAIBtn.classList.add('active');
  } else {
    cloudAPIBtn.classList.add('active');
  }
}

// ============================================================================
// FUNCTION 6 of 63: CHECK CHROME AI AVAILABILITY
// ============================================================================

/**
 * Check availability of Chrome Built-in AI APIs
 * Tests all 5 APIs and updates status indicator
 */
async function checkChromeAIAvailability() {
  console.log('[Popup] Checking Chrome AI availability...');
  
  try {
    const response = await chrome.runtime.sendMessage({ 
      action: 'checkChromeAI' 
    });
    
    if (response && response.availability) {
      chromeAIAvailable = response.availability;
      console.log('[Popup] Chrome AI availability:', chromeAIAvailable);
      updateChromeAIStatusIndicator();
    }
  } catch (error) {
    console.error('[Popup] Chrome AI check error:', error);
    chromeAIAvailable = {
      translator: false,
      summarizer: false,
      writer: false,
      languageDetector: false,
      rewriter: false
    };
  }
}

// ============================================================================
// FUNCTION 7 of 63: UPDATE CHROME AI STATUS INDICATOR
// ============================================================================

/**
 * Update Chrome AI status indicator in UI
 * Shows how many APIs are available (e.g., "3/5 available")
 */
function updateChromeAIStatusIndicator() {
  const indicator = document.getElementById('chrome-ai-status');
  if (!indicator) return;
  
  const availableCount = Object.values(chromeAIAvailable).filter(Boolean).length;
  const totalCount = Object.keys(chromeAIAvailable).length;
  
  if (availableCount === 0) {
    indicator.textContent = 'Not available';
    indicator.className = 'status-indicator status-error';
  } else if (availableCount === totalCount) {
    indicator.textContent = 'All APIs available';
    indicator.className = 'status-indicator status-success';
  } else {
    indicator.textContent = `${availableCount}/${totalCount} APIs available`;
    indicator.className = 'status-indicator status-warning';
  }
}

// ============================================================================
// FUNCTION 8 of 63: UPDATE PRIVACY BADGES
// ============================================================================

/**
 * Update privacy badges based on selected AI provider
 * Shows "100% On-Device" for Chrome AI, "Cloud Processing" for Cloud API
 */
function updatePrivacyBadges() {
  const onDeviceBadge = document.getElementById('privacy-on-device');
  const cloudBadge = document.getElementById('privacy-cloud');
  
  if (!onDeviceBadge || !cloudBadge) return;
  
  if (currentProvider === 'chrome') {
    onDeviceBadge.style.display = 'inline-flex';
    cloudBadge.style.display = 'none';
  } else {
    onDeviceBadge.style.display = 'none';
    cloudBadge.style.display = 'inline-flex';
  }
}

// ============================================================================
// FUNCTION 9 of 63: UPDATE API KEY VISIBILITY
// ============================================================================

/**
 * Show/hide API key input based on provider
 * Chrome AI doesn't need API key, Cloud API requires it
 */
function updateAPIKeyVisibility() {
  const apiKeySection = document.getElementById('api-key-section');
  if (!apiKeySection) return;
  
  if (currentProvider === 'cloud') {
    apiKeySection.style.display = 'block';
  } else {
    apiKeySection.style.display = 'none';
  }
}

// ============================================================================
// FUNCTION 10 of 63: INITIALIZE EXTRACTION TYPE SELECTOR
// ============================================================================

/**
 * Initialize extraction type toggle (MULTI / SINGLE)
 * Sets up event listeners and loads saved preference
 */
function initializeExtractionTypeSelector() {
  console.log('[Popup] Initializing extraction type selector...');
  
  const multiBtn = document.getElementById('type-multi');
  const singleBtn = document.getElementById('type-single');
  
  if (!multiBtn || !singleBtn) {
    console.warn('[Popup] Extraction type buttons not found');
    return;
  }
  
  // Set up event listeners
  multiBtn.addEventListener('click', () => {
    setExtractionType('MULTI');
  });
  
  singleBtn.addEventListener('click', () => {
    setExtractionType('SINGLE');
  });
  
  console.log('[Popup] ✅ Extraction type selector initialized');
}
// ============================================================================
// FUNCTION 11 of 63: SET EXTRACTION TYPE
// ============================================================================

/**
 * Set extraction type (MULTI or SINGLE) and save to storage
 * Updates UI and description text
 * 
 * @param {string} type - 'MULTI' or 'SINGLE'
 */
async function setExtractionType(type) {
  console.log('[Popup] Setting extraction type:', type);
  
  try {
    currentExtractionType = type;
    await chrome.storage.local.set({ extractionType: type });
    
    updateExtractionTypeButtonStates();
    updateExtractionTypeDescription();
    
    console.log('[Popup] ✅ Extraction type set to:', type);
  } catch (error) {
    console.error('[Popup] Set extraction type error:', error);
  }
}

// ============================================================================
// FUNCTION 12 of 63: UPDATE EXTRACTION TYPE BUTTON STATES
// ============================================================================

/**
 * Update visual state of extraction type buttons
 * Highlights active type (MULTI/SINGLE)
 */
function updateExtractionTypeButtonStates() {
  const multiBtn = document.getElementById('type-multi');
  const singleBtn = document.getElementById('type-single');
  
  if (!multiBtn || !singleBtn) return;
  
  // Remove active class from both
  multiBtn.classList.remove('active');
  singleBtn.classList.remove('active');
  
  // Add active class to current type
  if (currentExtractionType === 'MULTI') {
    multiBtn.classList.add('active');
  } else {
    singleBtn.classList.add('active');
  }
}

// ============================================================================
// FUNCTION 13 of 63: UPDATE EXTRACTION TYPE DESCRIPTION
// ============================================================================

/**
 * Update description text below extraction type buttons
 * Explains what MULTI vs SINGLE extraction does
 */
function updateExtractionTypeDescription() {
  const description = document.getElementById('extraction-type-description');
  if (!description) return;
  
  if (currentExtractionType === 'MULTI') {
    description.textContent = 'Extract multiple items from lists, feeds, and search results';
  } else {
    description.textContent = 'Extract a single main item (article, product, profile, etc.)';
  }
}

// ============================================================================
// FUNCTION 14 of 63: INITIALIZE MODE SELECTOR
// ============================================================================

/**
 * Initialize extraction mode buttons (5 modes)
 * Sets up event listeners and loads saved preference
 */
function initializeModeSelector() {
  console.log('[Popup] Initializing mode selector...');
  
  const modes = ['auto', 'fast', 'balanced', 'deep', 'comprehensive'];
  
  modes.forEach(mode => {
    const btn = document.getElementById(`mode-${mode}`);
    if (btn) {
      btn.addEventListener('click', async () => {
        currentMode = mode;
        await chrome.storage.local.set({ mode });
        updateModeButtonStates();
        console.log('[Popup] Mode set to:', mode);
      });
    }
  });
  
  // Load saved mode
  chrome.storage.local.get('mode').then(({ mode }) => {
    currentMode = mode || 'auto';
    updateModeButtonStates();
  });
  
  console.log('[Popup] ✅ Mode selector initialized');
}

// ============================================================================
// FUNCTION 15 of 63: UPDATE MODE BUTTON STATES
// ============================================================================

/**
 * Update visual state of mode selector buttons
 * Highlights active mode (auto/fast/balanced/deep/comprehensive)
 */
function updateModeButtonStates() {
  const modes = ['auto', 'fast', 'balanced', 'deep', 'comprehensive'];
  
  modes.forEach(mode => {
    const btn = document.getElementById(`mode-${mode}`);
    if (btn) {
      btn.classList.remove('active');
      if (mode === currentMode) {
        btn.classList.add('active');
      }
    }
  });
}

// ============================================================================
// FUNCTION 16 of 63: INITIALIZE CATEGORY SELECTOR
// ============================================================================

/**
 * Initialize category dropdown
 * Sets up event listener and loads saved preference
 */
function initializeCategorySelector() {
  console.log('[Popup] Initializing category selector...');
  
  const categorySelect = document.getElementById('category');
  
  if (!categorySelect) {
    console.warn('[Popup] Category selector not found');
    return;
  }
  
  // Load saved category
  loadCategory();
  
  // Set up event listener
  categorySelect.addEventListener('change', handleCategoryChange);
  
  console.log('[Popup] ✅ Category selector initialized');
}

// ============================================================================
// FUNCTION 17 of 63: LOAD CATEGORY
// ============================================================================

/**
 * Load saved category from storage
 * Sets dropdown value to saved category
 */
async function loadCategory() {
  console.log('[Popup] Loading category...');
  
  try {
    const { category } = await chrome.storage.local.get('category');
    currentCategory = category || 'all';
    
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
      categorySelect.value = currentCategory;
    }
    
    console.log('[Popup] Category loaded:', currentCategory);
  } catch (error) {
    console.error('[Popup] Load category error:', error);
    currentCategory = 'all';
  }
}

// ============================================================================
// FUNCTION 18 of 63: HANDLE CATEGORY CHANGE
// ============================================================================

/**
 * Handle category dropdown change event
 * Saves new category to storage
 */
async function handleCategoryChange(event) {
  console.log('[Popup] Category changed');
  
  try {
    const category = event.target.value;
    currentCategory = category;
    
    await chrome.storage.local.set({ category });
    
    console.log('[Popup] ✅ Category saved:', category);
  } catch (error) {
    console.error('[Popup] Category change error:', error);
  }
}

// ============================================================================
// FUNCTION 19 of 63: INITIALIZE TEMPLATE SELECTOR (v4.2)
// ============================================================================

/**
 * Initialize template selector dropdown
 * Auto-detects template for current domain and loads saved templates
 */
async function initializeTemplateSelector() {
  console.log('[Popup] Initializing template selector...');
  
  const templateSelect = document.getElementById('template-selector');
  const detectBtn = document.getElementById('detect-template-btn');
  
  if (!templateSelect) {
    console.warn('[Popup] Template selector not found');
    return;
  }
  
  // Set up template change listener
  templateSelect.addEventListener('change', async (e) => {
    const templateId = e.target.value;
    
    if (templateId === 'none') {
      currentTemplate = null;
      console.log('[Popup] Template cleared');
      return;
    }
    
    // Apply template
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'applyTemplate',
        templateId
      });
      
      if (response.success) {
        currentTemplate = response.template;
        applyTemplateSettings(response.template);
        showNotification('Template applied successfully', 'success');
      }
    } catch (error) {
      console.error('[Popup] Template apply error:', error);
      showNotification('Failed to apply template', 'error');
    }
  });
  
  // Set up detect button
  if (detectBtn) {
    detectBtn.addEventListener('click', detectAndApplyTemplate);
  }
  
  console.log('[Popup] ✅ Template selector initialized');
}

// ============================================================================
// FUNCTION 20 of 63: DETECT AND APPLY TEMPLATE (v4.2)
// ============================================================================

/**
 * Detect template for current tab domain
 * Auto-applies if template found
 */
async function detectAndApplyTemplate() {
  console.log('[Popup] Detecting template...');
  
  try {
    // Get current tab URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url) {
      showNotification('Could not detect current page', 'error');
      return;
    }
    
    const url = new URL(tab.url);
    const domain = url.hostname;
    
    console.log('[Popup] Detecting template for domain:', domain);
    
    // Request template detection from background
    const response = await chrome.runtime.sendMessage({
      action: 'detectTemplate',
      domain,
      url: tab.url
    });
    
    if (response.success && response.template) {
      currentTemplate = response.template;
      
      // Update template selector
      const templateSelect = document.getElementById('template-selector');
      if (templateSelect && response.template.id) {
        templateSelect.value = response.template.id;
      }
      
      // Apply template settings
      applyTemplateSettings(response.template);
      
      showNotification(`Template detected: ${response.template.name || 'Custom'}`, 'success');
      console.log('[Popup] ✅ Template detected and applied:', response.template);
    } else {
      showNotification('No template found for this site', 'info');
      console.log('[Popup] No template detected for domain');
    }
  } catch (error) {
    console.error('[Popup] Template detection error:', error);
    showNotification('Template detection failed', 'error');
  }
}
// ============================================================================
// FUNCTION 21 of 63: APPLY TEMPLATE SETTINGS (v4.2)
// ============================================================================

/**
 * Apply template settings to UI controls
 * Updates mode, category, extraction type, and post-processing checkboxes
 * 
 * @param {Object} template - Template object with settings
 */
function applyTemplateSettings(template) {
  console.log('[Popup] Applying template settings:', template);
  
  if (!template) return;
  
  try {
    // Apply mode
    if (template.mode) {
      currentMode = template.mode;
      updateModeButtonStates();
    }
    
    // Apply category
    if (template.category) {
      currentCategory = template.category;
      const categorySelect = document.getElementById('category');
      if (categorySelect) {
        categorySelect.value = template.category;
      }
    }
    
    // Apply extraction type
    if (template.extractionType) {
      currentExtractionType = template.extractionType;
      updateExtractionTypeButtonStates();
      updateExtractionTypeDescription();
    }
    
    // Apply post-processing settings (v4.2 - OPTIONAL)
    if (template.deduplication !== undefined) {
      deduplicationEnabled = template.deduplication;
      const checkbox = document.getElementById('enable-deduplication');
      if (checkbox) checkbox.checked = deduplicationEnabled;
    }
    
    if (template.translation !== undefined) {
      translationEnabled = template.translation;
      const checkbox = document.getElementById('enable-translation');
      if (checkbox) checkbox.checked = translationEnabled;
    }
    
    if (template.summarization !== undefined) {
      summarizationEnabled = template.summarization;
      const checkbox = document.getElementById('enable-summarization');
      if (checkbox) checkbox.checked = summarizationEnabled;
    }
    
    console.log('[Popup] ✅ Template settings applied');
  } catch (error) {
    console.error('[Popup] Apply template settings error:', error);
  }
}

// ============================================================================
// FUNCTION 22 of 63: INITIALIZE POST-PROCESSING CHECKBOXES (v4.2)
// ============================================================================

/**
 * Initialize post-processing checkboxes (deduplication, translation, summarization)
 * All are OPTIONAL - user can enable/disable as needed
 */
function initializePostProcessingCheckboxes() {
  console.log('[Popup] Initializing post-processing checkboxes...');
  
  // Deduplication checkbox
  const dedupCheckbox = document.getElementById('enable-deduplication');
  if (dedupCheckbox) {
    dedupCheckbox.addEventListener('change', async (e) => {
      deduplicationEnabled = e.target.checked;
      await chrome.storage.local.set({ deduplication: deduplicationEnabled });
      console.log('[Popup] Deduplication:', deduplicationEnabled);
    });
  }
  
  // Translation checkbox
  const translationCheckbox = document.getElementById('enable-translation');
  if (translationCheckbox) {
    translationCheckbox.addEventListener('change', async (e) => {
      translationEnabled = e.target.checked;
      await chrome.storage.local.set({ translation: translationEnabled });
      console.log('[Popup] Translation:', translationEnabled);
      
      // Show/hide translation options
      const translationOptions = document.getElementById('translation-options');
      if (translationOptions) {
        translationOptions.style.display = translationEnabled ? 'block' : 'none';
      }
    });
  }
  
  // Summarization checkbox
  const summarizationCheckbox = document.getElementById('enable-summarization');
  if (summarizationCheckbox) {
    summarizationCheckbox.addEventListener('change', async (e) => {
      summarizationEnabled = e.target.checked;
      await chrome.storage.local.set({ summarization: summarizationEnabled });
      console.log('[Popup] Summarization:', summarizationEnabled);
    });
  }
  
  console.log('[Popup] ✅ Post-processing checkboxes initialized');
}

// ============================================================================
// FUNCTION 23 of 63: LOAD POST-PROCESSING SETTINGS (v4.2)
// ============================================================================

/**
 * Load post-processing settings from storage
 * Restores deduplication, translation, and summarization states
 */
async function loadPostProcessingSettings() {
  console.log('[Popup] Loading post-processing settings...');
  
  try {
    const settings = await chrome.storage.local.get([
      'deduplication',
      'translation',
      'summarization'
    ]);
    
    // Load deduplication
    deduplicationEnabled = settings.deduplication || false;
    const dedupCheckbox = document.getElementById('enable-deduplication');
    if (dedupCheckbox) dedupCheckbox.checked = deduplicationEnabled;
    
    // Load translation
    translationEnabled = settings.translation || false;
    const translationCheckbox = document.getElementById('enable-translation');
    if (translationCheckbox) translationCheckbox.checked = translationEnabled;
    
    // Show/hide translation options
    const translationOptions = document.getElementById('translation-options');
    if (translationOptions) {
      translationOptions.style.display = translationEnabled ? 'block' : 'none';
    }
    
    // Load summarization
    summarizationEnabled = settings.summarization || false;
    const summarizationCheckbox = document.getElementById('enable-summarization');
    if (summarizationCheckbox) summarizationCheckbox.checked = summarizationEnabled;
    
    console.log('[Popup] Post-processing loaded:', {
      deduplication: deduplicationEnabled,
      translation: translationEnabled,
      summarization: summarizationEnabled
    });
  } catch (error) {
    console.error('[Popup] Load post-processing error:', error);
  }
}

// ============================================================================
// FUNCTION 24 of 63: LOAD API KEY
// ============================================================================

/**
 * Load saved Gemini API key from storage
 * Displays masked key in input field
 */
async function loadApiKey() {
  console.log('[Popup] Loading API key...');
  
  try {
    const { geminiApiKey } = await chrome.storage.local.get('geminiApiKey');
    
    if (geminiApiKey) {
      const apiKeyInput = document.getElementById('api-key');
      if (apiKeyInput) {
        // Display first 10 chars + masked rest
        const maskedKey = geminiApiKey.substring(0, 10) + '•'.repeat(Math.max(0, geminiApiKey.length - 10));
        apiKeyInput.value = maskedKey;
        apiKeyInput.dataset.fullKey = geminiApiKey; // Store full key in data attribute
      }
      console.log('[Popup] ✅ API key loaded (masked)');
    } else {
      console.log('[Popup] No API key found');
    }
  } catch (error) {
    console.error('[Popup] Load API key error:', error);
  }
}

// ============================================================================
// FUNCTION 25 of 63: HANDLE SAVE API KEY
// ============================================================================

/**
 * Handle API key save button click
 * Validates and saves API key to storage
 */
async function handleSaveApiKey() {
  console.log('[Popup] Saving API key...');
  
  const apiKeyInput = document.getElementById('api-key');
  const saveBtn = document.getElementById('save-api-key-btn');
  const statusDiv = document.getElementById('api-key-status');
  
  if (!apiKeyInput || !saveBtn) {
    console.error('[Popup] API key elements not found');
    return;
  }
  
  const apiKey = apiKeyInput.value.trim();
  
  if (!apiKey) {
    showNotification('Please enter an API key', 'error');
    return;
  }
  
  // Check if it's the masked key (don't save masked key)
  if (apiKey.includes('•')) {
    showNotification('API key already saved', 'info');
    return;
  }
  
  // Show loading state
  saveBtn.disabled = true;
  saveBtn.textContent = 'Validating...';
  
  try {
    // Validate API key with background
    const response = await chrome.runtime.sendMessage({
      action: 'saveApiKey',
      apiKey
    });
    
    if (response.success) {
      // Mask the key in input
      const maskedKey = apiKey.substring(0, 10) + '•'.repeat(Math.max(0, apiKey.length - 10));
      apiKeyInput.value = maskedKey;
      apiKeyInput.dataset.fullKey = apiKey;
      
      if (statusDiv) {
        statusDiv.textContent = '✅ Valid';
        statusDiv.className = 'status-success';
      }
      
      showNotification('API key saved and validated', 'success');
      console.log('[Popup] ✅ API key saved');
    } else {
      if (statusDiv) {
        statusDiv.textContent = '❌ Invalid';
        statusDiv.className = 'status-error';
      }
      
      showNotification('Invalid API key: ' + (response.error || 'Unknown error'), 'error');
      console.error('[Popup] API key validation failed:', response.error);
    }
  } catch (error) {
    console.error('[Popup] Save API key error:', error);
    
    if (statusDiv) {
      statusDiv.textContent = '❌ Error';
      statusDiv.className = 'status-error';
    }
    
    showNotification('Failed to save API key', 'error');
  } finally {
    // Restore button state
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}

// ============================================================================
// FUNCTION 26 of 63: VALIDATE API KEY
// ============================================================================

/**
 * Validate API key format (client-side basic check)
 * Checks for minimum length and valid characters
 * 
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if valid format
 */
function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // Basic format check
  const trimmedKey = apiKey.trim();
  
  // Gemini API keys are typically 39 characters
  if (trimmedKey.length < 30) {
    return false;
  }
  
  // Should contain only alphanumeric and dashes/underscores
  const validPattern = /^[A-Za-z0-9_-]+$/;
  if (!validPattern.test(trimmedKey)) {
    return false;
  }
  
  return true;
}

// ============================================================================
// FUNCTION 27 of 63: LOAD COST TRACKING (v4.2 - DISABLED)
// ============================================================================

/**
 * Load cost tracking data (DISABLED in v4.2)
 * Function preserved for backward compatibility but does nothing
 * Cost tracking removed - API billing handled externally
 */
async function loadCostTracking() {
  console.log('[Popup] Cost tracking disabled in v4.2');
  // NO-OP: Cost tracking removed, API billing handled externally
  // Function preserved for backward compatibility
}

// ============================================================================
// FUNCTION 28 of 63: INITIALIZE RESULT TABS (v4.2)
// ============================================================================

/**
 * Initialize result tabs (Data, Insights, Metadata)
 * Sets up tab switching functionality
 */
function initializeResultTabs() {
  console.log('[Popup] Initializing result tabs...');
  
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      switchTab(tabName);
    });
  });
  
  console.log('[Popup] ✅ Result tabs initialized');
}

// ============================================================================
// FUNCTION 29 of 63: SWITCH TAB (v4.2)
// ============================================================================

/**
 * Switch active result tab
 * Shows selected tab content and hides others
 * 
 * @param {string} tabName - Tab to switch to ('data', 'insights', 'metadata')
 */
function switchTab(tabName) {
  console.log('[Popup] Switching to tab:', tabName);
  
  // Update tab buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    }
  });
  
  // Update tab content
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => {
    content.classList.remove('active');
    if (content.id === `${tabName}-tab`) {
      content.classList.add('active');
    }
  });
}

// ============================================================================
// FUNCTION 30 of 63: HANDLE EXTRACTION
// ============================================================================

/**
 * Main extraction handler - triggers extraction on current tab
 * Sends message to background script and displays results
 */
async function handleExtraction() {
  console.log('[Popup] Starting extraction...');
  
  if (extractionInProgress) {
    showNotification('Extraction already in progress', 'warning');
    return;
  }
  
  const extractBtn = document.getElementById('extract-btn');
  const resultsDiv = document.getElementById('results');
  const loadingDiv = document.getElementById('loading');
  
  try {
    // Mark extraction as in progress
    extractionInProgress = true;
    performanceMetrics.extractionStartTime = Date.now();
    
    // Update UI
    if (extractBtn) {
      extractBtn.disabled = true;
      extractBtn.textContent = 'Extracting...';
    }
    
    if (loadingDiv) loadingDiv.style.display = 'block';
    if (resultsDiv) resultsDiv.style.display = 'none';
    
    // Get translation target if enabled
    let translationTarget = null;
    if (translationEnabled) {
      const langSelect = document.getElementById('translation-language');
      translationTarget = langSelect ? langSelect.value : 'en';
    }
    
    // Send extraction request to background
    const response = await chrome.runtime.sendMessage({
      action: 'extractData',
      mode: currentMode,
      category: currentCategory,
      extractionType: currentExtractionType,
      provider: currentProvider,
      deduplication: deduplicationEnabled,
      translation: translationEnabled,
      translationTarget,
      summarization: summarizationEnabled
    });
    
    // Update metrics
    performanceMetrics.extractionEndTime = Date.now();
    performanceMetrics.totalExtractions++;
    lastExtractionTime = Date.now();
    
    if (response.success) {
      performanceMetrics.successfulExtractions++;
      currentData = response.data;
      
      displayResults(response);
      showNotification('Extraction complete!', 'success');
      
      console.log('[Popup] ✅ Extraction successful');
    } else {
      performanceMetrics.failedExtractions++;
      displayError(response.error || 'Extraction failed');
      
      console.error('[Popup] Extraction failed:', response.error);
    }
    
  } catch (error) {
    performanceMetrics.failedExtractions++;
    console.error('[Popup] Extraction error:', error);
    displayError(error.message || 'Unknown error');
  } finally {
    // Reset UI
    extractionInProgress = false;
    
    if (extractBtn) {
      extractBtn.disabled = false;
      extractBtn.textContent = 'Extract';
    }
    
    if (loadingDiv) loadingDiv.style.display = 'none';
  }
}
// ============================================================================
// FUNCTION 31 of 63: DISPLAY RESULTS (v4.2 - CostTracker removed)
// ============================================================================

/**
 * Display extraction results in UI
 * Shows Data, Insights, and Metadata tabs
 * 
 * @param {Object} response - Extraction response from background
 */
function displayResults(response) {
  console.log('[Popup] Displaying results...');
  
  const resultsDiv = document.getElementById('results');
  const dataTab = document.getElementById('data-tab');
  
  if (!resultsDiv || !dataTab) {
    console.error('[Popup] Results elements not found');
    return;
  }
  
  try {
    // Show results section
    resultsDiv.style.display = 'block';
    
    // Display data in Data tab
    displayDataTab(response.data);
    
    // Display metadata in Metadata tab
    updateMetadataTab(response.metadata);
    
    // Switch to Data tab by default
    switchTab('data');
    
    // Clear insights tab (user can generate insights manually)
    clearInsightsTab();
    
    console.log('[Popup] ✅ Results displayed');
  } catch (error) {
    console.error('[Popup] Display results error:', error);
    displayError('Failed to display results');
  }
}

// ============================================================================
// FUNCTION 32 of 63: DISPLAY DATA TAB
// ============================================================================

/**
 * Display extracted data in Data tab
 * Formats JSON data in readable format
 * 
 * @param {Object|Array} data - Extracted data
 */
function displayDataTab(data) {
  console.log('[Popup] Displaying data tab...');
  
  const dataTab = document.getElementById('data-tab');
  if (!dataTab) return;
  
  try {
    // Format data as pretty JSON
    const formattedData = JSON.stringify(data, null, 2);
    
    // Create pre element for JSON display
    const pre = document.createElement('pre');
    pre.className = 'json-display';
    pre.textContent = formattedData;
    
    // Clear and update tab
    dataTab.innerHTML = '';
    dataTab.appendChild(pre);
    
    // Add action buttons
    const actions = document.createElement('div');
    actions.className = 'result-actions';
    actions.innerHTML = `
      <button id="copy-result-btn" class="btn btn-secondary">
        <span class="icon">📋</span> Copy JSON
      </button>
      <button id="download-result-btn" class="btn btn-secondary">
        <span class="icon">💾</span> Download JSON
      </button>
      <button id="convert-csv-btn" class="btn btn-secondary">
        <span class="icon">📊</span> Convert to CSV
      </button>
    `;
    dataTab.appendChild(actions);
    
    // Set up action button handlers
    document.getElementById('copy-result-btn')?.addEventListener('click', handleCopyResult);
    document.getElementById('download-result-btn')?.addEventListener('click', handleDownloadResult);
    document.getElementById('convert-csv-btn')?.addEventListener('click', handleConvertToCSV);
    
    console.log('[Popup] ✅ Data tab displayed');
  } catch (error) {
    console.error('[Popup] Display data tab error:', error);
    dataTab.innerHTML = '<p class="error">Failed to display data</p>';
  }
}

// ============================================================================
// FUNCTION 33 of 63: DISPLAY ERROR
// ============================================================================

/**
 * Display error message in results area
 * Shows user-friendly error with retry button
 * 
 * @param {string} errorMessage - Error message to display
 */
function displayError(errorMessage) {
  console.log('[Popup] Displaying error:', errorMessage);
  
  const resultsDiv = document.getElementById('results');
  const dataTab = document.getElementById('data-tab');
  
  if (!resultsDiv || !dataTab) return;
  
  // Show results section
  resultsDiv.style.display = 'block';
  
  // Display error in data tab
  dataTab.innerHTML = `
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>Extraction Failed</h3>
      <p class="error-message">${sanitizeHTML(errorMessage)}</p>
      <button id="retry-extraction-btn" class="btn btn-primary">
        <span class="icon">🔄</span> Retry
      </button>
    </div>
  `;
  
  // Set up retry button
  document.getElementById('retry-extraction-btn')?.addEventListener('click', handleExtraction);
  
  // Switch to data tab to show error
  switchTab('data');
}

// ============================================================================
// FUNCTION 34 of 63: UPDATE METADATA TAB (v4.2)
// ============================================================================

/**
 * Update Metadata tab with extraction details
 * Shows duration, item count, classification, etc.
 * 
 * @param {Object} metadata - Extraction metadata
 */
function updateMetadataTab(metadata) {
  console.log('[Popup] Updating metadata tab...');
  
  const metadataTab = document.getElementById('metadata-tab');
  if (!metadataTab || !metadata) return;
  
  try {
    const duration = metadata.duration || 0;
    const itemCount = Array.isArray(metadata.data) ? metadata.data.length : 1;
    
    metadataTab.innerHTML = `
      <div class="metadata-grid">
        <div class="metadata-item">
          <span class="label">Extraction ID:</span>
          <span class="value">${metadata.extractionId || 'N/A'}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Duration:</span>
          <span class="value">${formatDuration(duration)}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Items Extracted:</span>
          <span class="value">${itemCount}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Classification:</span>
          <span class="value">${metadata.classification?.type || 'Unknown'}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Confidence:</span>
          <span class="value">${Math.round((metadata.classification?.confidence || 0) * 100)}%</span>
        </div>
        <div class="metadata-item">
          <span class="label">Provider:</span>
          <span class="value">${currentProvider === 'chrome' ? 'Chrome AI' : 'Cloud API'}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Mode:</span>
          <span class="value">${currentMode}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Category:</span>
          <span class="value">${currentCategory}</span>
        </div>
        ${metadata.deduplication ? `
        <div class="metadata-item">
          <span class="label">Deduplication:</span>
          <span class="value">${metadata.deduplication.unique}/${metadata.deduplication.total} unique</span>
        </div>
        ` : ''}
        ${metadata.translation ? `
        <div class="metadata-item">
          <span class="label">Translation:</span>
          <span class="value">${metadata.translation.translated} items translated</span>
        </div>
        ` : ''}
        ${metadata.summarization ? `
        <div class="metadata-item">
          <span class="label">Summarization:</span>
          <span class="value">${metadata.summarization.summarized} items summarized</span>
        </div>
        ` : ''}
        <div class="metadata-item">
          <span class="label">Timestamp:</span>
          <span class="value">${new Date(metadata.timestamp || Date.now()).toLocaleString()}</span>
        </div>
      </div>
    `;
    
    console.log('[Popup] ✅ Metadata tab updated');
  } catch (error) {
    console.error('[Popup] Update metadata error:', error);
    metadataTab.innerHTML = '<p class="error">Failed to load metadata</p>';
  }
}

// ============================================================================
// FUNCTION 35 of 63: CLEAR INSIGHTS TAB (v4.2)
// ============================================================================

/**
 * Clear Insights tab and show generate button
 * User can manually trigger insights generation
 */
function clearInsightsTab() {
  const insightsTab = document.getElementById('insights-tab');
  if (!insightsTab) return;
  
  insightsTab.innerHTML = `
    <div class="insights-placeholder">
      <div class="placeholder-icon">💡</div>
      <h3>Generate Insights</h3>
      <p>Generate AI-powered insights from your extracted data</p>
      <div class="insights-options">
        <label for="insight-type">Insight Type:</label>
        <select id="insight-type" class="form-control">
          <option value="summary">Summary</option>
          <option value="comparison">Comparison</option>
          <option value="recommendations">Recommendations</option>
          <option value="trends">Trends</option>
          <option value="statistics">Statistics</option>
        </select>
      </div>
      <button id="generate-insights-btn" class="btn btn-primary">
        <span class="icon">✨</span> Generate Insights
      </button>
    </div>
  `;
  
  // Set up generate button
  document.getElementById('generate-insights-btn')?.addEventListener('click', handleGenerateInsights);
}

// ============================================================================
// FUNCTION 36 of 63: HANDLE GENERATE INSIGHTS (v4.2)
// ============================================================================

/**
 * Handle insights generation button click
 * Sends data to background for AI analysis
 */
async function handleGenerateInsights() {
  console.log('[Popup] Generating insights...');
  
  if (!currentData) {
    showNotification('No data available for insights', 'warning');
    return;
  }
  
  const insightType = document.getElementById('insight-type')?.value || 'summary';
  const generateBtn = document.getElementById('generate-insights-btn');
  const insightsTab = document.getElementById('insights-tab');
  
  if (!insightsTab) return;
  
  try {
    // Show loading state
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.textContent = 'Generating...';
    }
    
    // Request insights from background
    const response = await chrome.runtime.sendMessage({
      action: 'generateInsights',
      data: currentData,
      insightType
    });
    
    if (response.success) {
      // Display insights
      insightsTab.innerHTML = formatInsights(response.insights, insightType);
      showNotification('Insights generated!', 'success');
      
      console.log('[Popup] ✅ Insights generated');
    } else {
      throw new Error(response.error || 'Insights generation failed');
    }
  } catch (error) {
    console.error('[Popup] Insights generation error:', error);
    insightsTab.innerHTML = `
      <div class="error-container">
        <p class="error">Failed to generate insights: ${error.message}</p>
        <button onclick="clearInsightsTab()" class="btn btn-secondary">Try Again</button>
      </div>
    `;
  }
}

// ============================================================================
// FUNCTION 37 of 63: FORMAT INSIGHTS (v4.2)
// ============================================================================

/**
 * Format insights data for display
 * Converts insights object to HTML
 * 
 * @param {Object} insights - Insights data
 * @param {string} type - Insights type
 * @returns {string} Formatted HTML
 */
function formatInsights(insights, type) {
  if (!insights) return '<p>No insights available</p>';
  
  let html = `<div class="insights-content">`;
  html += `<h3>📊 ${type.charAt(0).toUpperCase() + type.slice(1)} Insights</h3>`;
  
  // Format based on type
  if (typeof insights === 'string') {
    html += `<p>${sanitizeHTML(insights)}</p>`;
  } else if (typeof insights === 'object') {
    html += '<div class="insights-list">';
    for (const [key, value] of Object.entries(insights)) {
      html += `
        <div class="insight-item">
          <strong>${key}:</strong>
          <span>${sanitizeHTML(String(value))}</span>
        </div>
      `;
    }
    html += '</div>';
  }
  
  html += '</div>';
  return html;
}

// ============================================================================
// FUNCTION 38 of 63: HANDLE COPY RESULT
// ============================================================================

/**
 * Copy extracted data to clipboard as JSON
 */
async function handleCopyResult() {
  console.log('[Popup] Copying result...');
  
  if (!currentData) {
    showNotification('No data to copy', 'warning');
    return;
  }
  
  try {
    const jsonString = JSON.stringify(currentData, null, 2);
    await navigator.clipboard.writeText(jsonString);
    
    showNotification('Copied to clipboard!', 'success');
    console.log('[Popup] ✅ Result copied');
  } catch (error) {
    console.error('[Popup] Copy error:', error);
    showNotification('Failed to copy', 'error');
  }
}

// ============================================================================
// FUNCTION 39 of 63: HANDLE DOWNLOAD RESULT
// ============================================================================

/**
 * Download extracted data as JSON file
 */
function handleDownloadResult() {
  console.log('[Popup] Downloading result...');
  
  if (!currentData) {
    showNotification('No data to download', 'warning');
    return;
  }
  
  try {
    const jsonString = JSON.stringify(currentData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `web-weaver-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Download started!', 'success');
    console.log('[Popup] ✅ Result downloaded');
  } catch (error) {
    console.error('[Popup] Download error:', error);
    showNotification('Failed to download', 'error');
  }
}

// ============================================================================
// FUNCTION 40 of 63: HANDLE CONVERT TO CSV
// ============================================================================

/**
 * Convert extracted data to CSV and download
 * Sends data to background for conversion
 */
async function handleConvertToCSV() {
  console.log('[Popup] Converting to CSV...');
  
  if (!currentData) {
    showNotification('No data to convert', 'warning');
    return;
  }
  
  try {
    // Request CSV conversion from background
    const response = await chrome.runtime.sendMessage({
      action: 'convertToCSV',
      data: currentData
    });
    
    if (response.success && response.csv) {
      // Download CSV
      const blob = new Blob([response.csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `web-weaver-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('CSV downloaded!', 'success');
      console.log('[Popup] ✅ CSV conversion complete');
    } else {
      throw new Error(response.error || 'CSV conversion failed');
    }
  } catch (error) {
    console.error('[Popup] CSV conversion error:', error);
    showNotification('Failed to convert to CSV', 'error');
  }
}
// ============================================================================
// FUNCTION 41 of 63: SHOW NOTIFICATION
// ============================================================================

/**
 * Show toast notification to user
 * Auto-dismisses after 3 seconds
 * 
 * @param {string} message - Notification message
 * @param {string} type - Type: 'success', 'error', 'warning', 'info'
 */
function showNotification(message, type = 'info') {
  console.log(`[Popup] Notification (${type}):`, message);
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  // Add icon based on type
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  notification.innerHTML = `
    <span class="notification-icon">${icons[type] || icons.info}</span>
    <span class="notification-message">${sanitizeHTML(message)}</span>
  `;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Show with animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// ============================================================================
// FUNCTION 42 of 63: SHOW STRUCTURED ERROR
// ============================================================================

/**
 * Show structured error with details
 * Used for detailed error reporting
 * 
 * @param {Object} errorData - Error details object
 */
function showStructuredError(errorData) {
  console.log('[Popup] Structured error:', errorData);
  
  const { title, message, details, code } = errorData;
  
  const errorHtml = `
    <div class="structured-error">
      <h3>${sanitizeHTML(title || 'Error')}</h3>
      <p class="error-message">${sanitizeHTML(message || 'An error occurred')}</p>
      ${code ? `<p class="error-code">Error Code: ${sanitizeHTML(code)}</p>` : ''}
      ${details ? `<pre class="error-details">${sanitizeHTML(details)}</pre>` : ''}
    </div>
  `;
  
  const dataTab = document.getElementById('data-tab');
  if (dataTab) {
    dataTab.innerHTML = errorHtml;
  }
}

// ============================================================================
// FUNCTION 43 of 63: UPDATE COST DISPLAY (v4.2 - DISABLED)
// ============================================================================

/**
 * Update cost display (DISABLED in v4.2)
 * Function preserved for backward compatibility but does nothing
 * Cost tracking removed - API billing handled externally
 */
function updateCostDisplay() {
  console.log('[Popup] Cost display disabled in v4.2');
  // NO-OP: Cost tracking removed, API billing handled externally
  // Function preserved for backward compatibility
}

// ============================================================================
// FUNCTION 44 of 63: UPDATE COST ESTIMATE (v4.2 - DISABLED)
// ============================================================================

/**
 * Update cost estimate (DISABLED in v4.2)
 * Function preserved for backward compatibility but does nothing
 * Cost tracking removed - API billing handled externally
 */
function updateCostEstimate() {
  console.log('[Popup] Cost estimate disabled in v4.2');
  // NO-OP: Cost tracking removed, API billing handled externally
  // Function preserved for backward compatibility
}

// ============================================================================
// FUNCTION 45 of 63: SHOW BUDGET WARNING (v4.2 - DISABLED)
// ============================================================================

/**
 * Show budget warning (DISABLED in v4.2)
 * Function preserved for backward compatibility but does nothing
 * Cost tracking removed - API billing handled externally
 */
function showBudgetWarning(percentage, spent, limit) {
  console.log('[Popup] Budget warning disabled in v4.2');
  // NO-OP: Cost tracking removed, API billing handled externally
  // Function preserved for backward compatibility
}

// ============================================================================
// FUNCTION 46 of 63: UPDATE EXTRACT BUTTON
// ============================================================================

/**
 * Update extract button state based on configuration
 * Enables/disables button and updates text
 */
function updateExtractButton() {
  const extractBtn = document.getElementById('extract-btn');
  if (!extractBtn) return;
  
  // Check if API key is configured (for Cloud API)
  if (currentProvider === 'cloud') {
    chrome.storage.local.get('geminiApiKey').then(({ geminiApiKey }) => {
      if (!geminiApiKey) {
        extractBtn.disabled = true;
        extractBtn.title = 'Please configure API key first';
      } else {
        extractBtn.disabled = extractionInProgress;
        extractBtn.title = extractionInProgress ? 'Extraction in progress...' : 'Start extraction';
      }
    });
  } else {
    // Chrome AI doesn't need API key
    extractBtn.disabled = extractionInProgress;
    extractBtn.title = extractionInProgress ? 'Extraction in progress...' : 'Start extraction';
  }
}

// ============================================================================
// FUNCTION 47 of 63: UPDATE TRANSLATION PROGRESS (v4.2)
// ============================================================================

/**
 * Update translation progress indicator
 * Shows progress during batch translation
 * 
 * @param {number} current - Current item index
 * @param {number} total - Total items
 */
function updateTranslationProgress(current, total) {
  const progressBar = document.getElementById('translation-progress');
  const progressText = document.getElementById('translation-progress-text');
  
  if (progressBar && progressText) {
    const percentage = Math.round((current / total) * 100);
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${current}/${total} items translated`;
  }
}

// ============================================================================
// FUNCTION 48 of 63: UPDATE SUMMARIZATION PROGRESS (v4.2)
// ============================================================================

/**
 * Update summarization progress indicator
 * Shows progress during batch summarization
 * 
 * @param {number} current - Current item index
 * @param {number} total - Total items
 */
function updateSummarizationProgress(current, total) {
  const progressBar = document.getElementById('summarization-progress');
  const progressText = document.getElementById('summarization-progress-text');
  
  if (progressBar && progressText) {
    const percentage = Math.round((current / total) * 100);
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${current}/${total} items summarized`;
  }
}

// ============================================================================
// FUNCTION 49 of 63: UPDATE SCROLL PROGRESS
// ============================================================================

/**
 * Update scroll progress indicator in results
 * Shows how far user has scrolled through results
 */
function updateScrollProgress() {
  const resultsDiv = document.getElementById('results');
  const progressBar = document.getElementById('scroll-progress');
  
  if (!resultsDiv || !progressBar) return;
  
  const scrollTop = resultsDiv.scrollTop;
  const scrollHeight = resultsDiv.scrollHeight - resultsDiv.clientHeight;
  const percentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  
  progressBar.style.width = `${percentage}%`;
}

// ============================================================================
// FUNCTION 50 of 63: LOAD EXTRACTION HISTORY (v4.2)
// ============================================================================

/**
 * Load extraction history from storage
 * Displays recent extractions in UI
 */
async function loadExtractionHistory() {
  console.log('[Popup] Loading extraction history...');
  
  try {
    const { extractionHistory } = await chrome.storage.local.get('extractionHistory');
    
    if (!extractionHistory || !Array.isArray(extractionHistory) || extractionHistory.length === 0) {
      console.log('[Popup] No extraction history found');
      return;
    }
    
    const historyDiv = document.getElementById('extraction-history');
    if (!historyDiv) return;
    
    // Display most recent 5 extractions
    const recentExtractions = extractionHistory.slice(-5).reverse();
    
    historyDiv.innerHTML = '<h4>Recent Extractions</h4>';
    
    recentExtractions.forEach((extraction, index) => {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <div class="history-header">
          <span class="history-timestamp">${new Date(extraction.timestamp).toLocaleString()}</span>
          <span class="history-items">${extraction.itemCount || 0} items</span>
        </div>
        <div class="history-details">
          <span class="history-mode">${extraction.mode || 'auto'}</span>
          <span class="history-type">${extraction.extractionType || 'MULTI'}</span>
          <span class="history-duration">${formatDuration(extraction.duration || 0)}</span>
        </div>
      `;
      
      // Add click handler to load historical extraction
      item.addEventListener('click', () => {
        if (extraction.data) {
          currentData = extraction.data;
          displayResults({ data: extraction.data, metadata: extraction });
          showNotification('Historical extraction loaded', 'info');
        }
      });
      
      historyDiv.appendChild(item);
    });
    
    console.log('[Popup] ✅ Extraction history loaded:', recentExtractions.length);
  } catch (error) {
    console.error('[Popup] Load extraction history error:', error);
  }
}
// ============================================================================
// FUNCTION 51 of 63: CHECK AND SHOW FALLBACK BANNER
// ============================================================================

/**
 * Check if fallback banner should be shown
 * Shows banner if Chrome AI is unavailable and last shown was >24h ago
 */
async function checkAndShowFallbackBanner() {
  console.log('[Popup] Checking fallback banner...');
  
  try {
    // Check Chrome AI availability
    const availableCount = Object.values(chromeAIAvailable).filter(Boolean).length;
    
    // If Chrome AI is fully available, don't show banner
    if (availableCount === Object.keys(chromeAIAvailable).length) {
      console.log('[Popup] Chrome AI fully available, no banner needed');
      return;
    }
    
    // Check when banner was last dismissed
    const { fallbackBannerDismissed } = await chrome.storage.local.get('fallbackBannerDismissed');
    
    if (fallbackBannerDismissed) {
      const hoursSinceDismissed = (Date.now() - fallbackBannerDismissed) / (1000 * 60 * 60);
      
      if (hoursSinceDismissed < 24) {
        console.log('[Popup] Fallback banner dismissed recently, not showing');
        return;
      }
    }
    
    // Show fallback banner
    showFallbackBanner(availableCount);
    
  } catch (error) {
    console.error('[Popup] Check fallback banner error:', error);
  }
}

// ============================================================================
// FUNCTION 52 of 63: SHOW FALLBACK BANNER
// ============================================================================

/**
 * Show fallback banner informing user about Chrome AI status
 * Provides option to use Cloud API as fallback
 * 
 * @param {number} availableCount - Number of available Chrome AI APIs
 */
function showFallbackBanner(availableCount) {
  console.log('[Popup] Showing fallback banner');
  
  const bannerDiv = document.getElementById('fallback-banner');
  if (!bannerDiv) return;
  
  const totalAPIs = Object.keys(chromeAIAvailable).length;
  
  bannerDiv.innerHTML = `
    <div class="banner-content">
      <span class="banner-icon">ℹ️</span>
      <div class="banner-text">
        <strong>Limited Chrome AI Availability</strong>
        <p>Only ${availableCount}/${totalAPIs} Chrome AI APIs are available. Consider using Cloud API for full functionality.</p>
      </div>
      <button id="dismiss-fallback-btn" class="btn-close" title="Dismiss for 24 hours">×</button>
    </div>
  `;
  
  bannerDiv.style.display = 'block';
  
  // Set up dismiss button
  document.getElementById('dismiss-fallback-btn')?.addEventListener('click', handleDismissFallbackBanner);
}

// ============================================================================
// FUNCTION 53 of 63: HANDLE DISMISS FALLBACK BANNER
// ============================================================================

/**
 * Handle fallback banner dismiss
 * Saves dismiss timestamp to prevent re-showing for 24 hours
 */
async function handleDismissFallbackBanner() {
  console.log('[Popup] Dismissing fallback banner');
  
  try {
    await chrome.storage.local.set({
      fallbackBannerDismissed: Date.now()
    });
    
    const bannerDiv = document.getElementById('fallback-banner');
    if (bannerDiv) {
      bannerDiv.style.display = 'none';
    }
    
    console.log('[Popup] ✅ Fallback banner dismissed');
  } catch (error) {
    console.error('[Popup] Dismiss fallback banner error:', error);
  }
}

// ============================================================================
// FUNCTION 54 of 63: SETUP EVENT LISTENERS
// ============================================================================

/**
 * Set up all event listeners for UI elements
 * Called once during initialization
 */
function setupEventListeners() {
  console.log('[Popup] Setting up event listeners...');
  
  // Extract button
  const extractBtn = document.getElementById('extract-btn');
  if (extractBtn) {
    extractBtn.addEventListener('click', handleExtraction);
  }
  
  // Save API key button
  const saveApiKeyBtn = document.getElementById('save-api-key-btn');
  if (saveApiKeyBtn) {
    saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
  }
  
  // Detect template button (already set up in initializeTemplateSelector)
  
  // Results scroll progress
  const resultsDiv = document.getElementById('results');
  if (resultsDiv) {
    resultsDiv.addEventListener('scroll', updateScrollProgress);
  }
  
  // Category selector (already set up in initializeCategorySelector)
  
  // Window beforeunload - warn if extraction in progress
  window.addEventListener('beforeunload', (e) => {
    if (extractionInProgress) {
      e.preventDefault();
      e.returnValue = 'Extraction in progress. Are you sure you want to leave?';
      return e.returnValue;
    }
  });
  
  console.log('[Popup] ✅ Event listeners set up');
}

// ============================================================================
// FUNCTION 55 of 63: SETUP MESSAGE LISTENER
// ============================================================================

/**
 * Set up message listener for background script communications
 * Handles progress updates and status messages
 */
function setupMessageListener() {
  console.log('[Popup] Setting up message listener...');
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Popup] Message received:', message);
    
    switch (message.action) {
      case 'translationProgress':
        updateTranslationProgress(message.current, message.total);
        break;
      
      case 'summarizationProgress':
        updateSummarizationProgress(message.current, message.total);
        break;
      
      case 'extractionProgress':
        showNotification(`Extraction: ${message.status}`, 'info');
        break;
      
      case 'extractionComplete':
        showNotification('Extraction complete!', 'success');
        break;
      
      case 'extractionError':
        showNotification(`Error: ${message.error}`, 'error');
        break;
      
      default:
        console.log('[Popup] Unknown message action:', message.action);
    }
    
    sendResponse({ received: true });
  });
  
  console.log('[Popup] ✅ Message listener set up');
}

// ============================================================================
// FUNCTION 56 of 63: SANITIZE HTML
// ============================================================================

/**
 * Sanitize HTML string to prevent XSS
 * Escapes HTML special characters
 * 
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeHTML(str) {
  if (!str) return '';
  
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================================
// FUNCTION 57 of 63: FORMAT DURATION
// ============================================================================

/**
 * Format duration in milliseconds to human-readable string
 * 
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration (e.g., "2.5s", "1m 30s")
 */
function formatDuration(ms) {
  if (!ms || ms < 0) return '0s';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else if (seconds > 0) {
    return `${seconds}s`;
  } else {
    return `${ms}ms`;
  }
}

// ============================================================================
// FUNCTION 58 of 63: FORMAT BYTES
// ============================================================================

/**
 * Format bytes to human-readable file size
 * 
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size (e.g., "1.5 KB", "2.3 MB")
 */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

// ============================================================================
// FUNCTION 59 of 63: DEBOUNCE
// ============================================================================

/**
 * Debounce function to limit rate of function calls
 * Used for input handlers and scroll events
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
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

// ============================================================================
// FUNCTION 60 of 63: PERFORMANCE OBSERVER (Optional)
// ============================================================================

/**
 * Set up performance observer for monitoring
 * Tracks extraction performance and resource usage
 */
function setupPerformanceObserver() {
  if (typeof PerformanceObserver === 'undefined') {
    console.warn('[Popup] PerformanceObserver not available');
    return;
  }
  
  try {
    const perfObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('[Popup] Performance:', {
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime
        });
      }
    });
    
    perfObserver.observe({ entryTypes: ['measure', 'navigation'] });
    
    console.log('[Popup] ✅ Performance observer set up');
  } catch (error) {
    console.warn('[Popup] Performance observer setup failed:', error);
  }
}
// ============================================================================
// FUNCTION 61 of 63: ERROR CONFIG (Global Error Handler)
// ============================================================================

/**
 * Global error configuration and handler
 * Catches unhandled errors and displays them gracefully
 */
window.addEventListener('error', (event) => {
  console.error('[Popup] Global error:', event.error);
  
  // Display error to user
  showNotification('An unexpected error occurred', 'error');
  
  // Log error details
  const errorConfig = {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.stack || event.error
  };
  
  console.error('[Popup] Error details:', errorConfig);
  
  // Prevent default error handling
  event.preventDefault();
});

// ============================================================================
// FUNCTION 62 of 63: UNHANDLED REJECTION HANDLER
// ============================================================================

/**
 * Handle unhandled promise rejections
 * Catches async errors that weren't caught elsewhere
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Popup] Unhandled rejection:', event.reason);
  
  // Display error to user
  showNotification('An async operation failed', 'error');
  
  // Log rejection details
  console.error('[Popup] Rejection reason:', event.reason);
  
  // Prevent default handling
  event.preventDefault();
});

// ============================================================================
// FUNCTION 63 of 63: KEYBOARD SHORTCUTS
// ============================================================================

/**
 * Set up keyboard shortcuts for quick actions
 * Ctrl/Cmd + Enter: Start extraction
 * Ctrl/Cmd + C: Copy results
 * Ctrl/Cmd + S: Save/download results
 */
document.addEventListener('keydown', (event) => {
  // Check for Ctrl/Cmd modifier
  const isModifierPressed = event.ctrlKey || event.metaKey;
  
  if (!isModifierPressed) return;
  
  switch (event.key.toLowerCase()) {
    case 'enter':
      // Ctrl/Cmd + Enter: Start extraction
      if (!extractionInProgress) {
        event.preventDefault();
        handleExtraction();
        console.log('[Popup] Keyboard shortcut: Extract');
      }
      break;
    
    case 'c':
      // Ctrl/Cmd + C: Copy results (if results exist)
      if (currentData && !event.shiftKey) {
        event.preventDefault();
        handleCopyResult();
        console.log('[Popup] Keyboard shortcut: Copy');
      }
      break;
    
    case 's':
      // Ctrl/Cmd + S: Download results (if results exist)
      if (currentData) {
        event.preventDefault();
        handleDownloadResult();
        console.log('[Popup] Keyboard shortcut: Download');
      }
      break;
    
    default:
      // No action for other keys
      break;
  }
});

// ============================================================================
// DOMCONTENTLOADED - MAIN INITIALIZATION
// ============================================================================

/**
 * Main initialization when DOM is ready
 * Sets up all UI components and loads saved state
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Popup] DOM Content Loaded - Initializing...');
  
  try {
    // Check TOS acceptance first
    const tosAccepted = await checkTOSAcceptance();
    if (!tosAccepted) {
      console.log('[Popup] TOS not accepted, redirecting to TOS page');
      return;
    }
    
    // Initialize all UI components
    console.log('[Popup] Initializing UI components...');
    
    // AI Provider selector
    initializeAIProviderSelector();
    
    // Extraction type selector
    initializeExtractionTypeSelector();
    
    // Mode selector
    initializeModeSelector();
    
    // Category selector
    initializeCategorySelector();
    
    // Template selector (v4.2)
    initializeTemplateSelector();
    
    // Post-processing checkboxes (v4.2)
    initializePostProcessingCheckboxes();
    
    // Result tabs (v4.2)
    initializeResultTabs();
    
    // Event listeners
    setupEventListeners();
    
    // Message listener
    setupMessageListener();
    
    // Load saved settings
    console.log('[Popup] Loading saved settings...');
    
    await loadAIProvider();
    await loadApiKey();
    await loadCategory();
    await loadPostProcessingSettings();
    
    // Check Chrome AI availability
    await checkChromeAIAvailability();
    
    // Update UI states
    updateAPIKeyVisibility();
    updatePrivacyBadges();
    updateExtractButton();
    
    // Check and show fallback banner if needed
    await checkAndShowFallbackBanner();
    
    // Load extraction history (optional)
    loadExtractionHistory();
    
    // Set up performance observer (optional)
    setupPerformanceObserver();
    
    console.log('[Popup] ✅ Initialization complete - Web Weaver Lightning v4.2.0 ready!');
    
  } catch (error) {
    console.error('[Popup] ❌ Initialization error:', error);
    showNotification('Failed to initialize popup', 'error');
  }
});

// ============================================================================
// CONSOLE BANNER
// ============================================================================

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║          🕸️  WEB WEAVER LIGHTNING v4.2.0 🕸️                ║
║                                                              ║
║  Intelligent Web Data Extraction with AI                    ║
║  • Chrome Built-in AI + Cloud API Support                   ║
║  • Template-Based Extraction                                ║
║  • Batch Translation & Summarization                        ║
║  • AI-Powered Insights Generation                           ║
║  • Cost Tracking: REMOVED (v4.2)                            ║
║                                                              ║
║  Status: Ready ✅                                            ║
║  Functions: 63/63 Loaded                                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

// ============================================================================
// EXPORT FOR TESTING (if running in Node.js environment)
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Initialization functions
    checkTOSAcceptance,
    initializeAIProviderSelector,
    initializeExtractionTypeSelector,
    initializeModeSelector,
    initializeCategorySelector,
    initializeTemplateSelector,
    initializePostProcessingCheckboxes,
    initializeResultTabs,
    
    // Provider functions
    loadAIProvider,
    setAIProvider,
    updateAIProviderButtonStates,
    checkChromeAIAvailability,
    updateChromeAIStatusIndicator,
    
    // UI update functions
    updatePrivacyBadges,
    updateAPIKeyVisibility,
    updateExtractionTypeButtonStates,
    updateExtractionTypeDescription,
    updateModeButtonStates,
    updateExtractButton,
    
    // Template functions
    detectAndApplyTemplate,
    applyTemplateSettings,
    
    // Post-processing functions
    loadPostProcessingSettings,
    updateTranslationProgress,
    updateSummarizationProgress,
    
    // Category functions
    loadCategory,
    handleCategoryChange,
    
    // API key functions
    loadApiKey,
    handleSaveApiKey,
    validateApiKey,
    
    // Extraction functions
    handleExtraction,
    
    // Display functions
    displayResults,
    displayDataTab,
    displayError,
    updateMetadataTab,
    clearInsightsTab,
    handleGenerateInsights,
    formatInsights,
    
    // Action handlers
    handleCopyResult,
    handleDownloadResult,
    handleConvertToCSV,
    
    // Notification functions
    showNotification,
    showStructuredError,
    
    // Cost tracking (disabled)
    loadCostTracking,
    updateCostDisplay,
    updateCostEstimate,
    showBudgetWarning,
    
    // Progress functions
    updateScrollProgress,
    loadExtractionHistory,
    
    // Fallback banner functions
    checkAndShowFallbackBanner,
    showFallbackBanner,
    handleDismissFallbackBanner,
    
    // Event setup
    setupEventListeners,
    setupMessageListener,
    
    // Utility functions
    sanitizeHTML,
    formatDuration,
    formatBytes,
    debounce,
    setupPerformanceObserver,
    
    // Tab switching
    switchTab
  };
}
