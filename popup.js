/**
 * Web Weaver Lightning - Popup UI Controller
 * Version: 4.2.0 (v4.2 - VISUAL AI + MULTIMODAL + BATCH ENHANCEMENTS)
 * 
 * 🆕 v4.2 CHANGES:
 * - Template selector with auto-detection
 * - Post-processing checkboxes (deduplication, translation, summarization) - ALL OPTIONAL
 * - Result tabs (Data, Insights, Metadata)
 * - Insights generation UI with type selector
 * - Cost tracker display (estimates + actuals)
 * - Privacy badges based on provider
 * - Enhanced metadata display
 * 
 * ✅ PRESERVED FROM v4.1:
 * - TOS/Privacy acceptance flow
 * - AI Provider toggle (Chrome Built-in AI vs Cloud API)
 * - Real-time API key validation
 * - Proactive rate limit warnings
 * - Enhanced error display
 * - Deduplication tracking (NOW OPTIONAL)
 * - Chrome AI availability detection
 * - MULTI/SINGLE_ITEM extraction types
 * - All 5 extraction modes
 * - Category filtering
 * - Fallback banner with 24h cooldown
 * - Item count tracking
 */

console.log('[Popup] Loading Web Weaver Lightning v4.2.0...');

// ════════════════════════════════════════════════════════════════
// GLOBAL STATE - ENHANCED FROM v4.1 WITH v4.2 ADDITIONS
// ════════════════════════════════════════════════════════════════

let currentData = null;
let currentMode = 'auto';
let currentExtractionType = 'MULTI';
let currentAIProvider = 'CHROME_BUILTIN';
let currentCategory = 'all';
let currentTemplate = null; // 🆕 v4.2
let extractionInProgress = false;
let chromeAIAvailable = false;
let rateLimitWarningCount = 0;
let sessionItemCount = { new: 0, total: 0, duplicates: 0 };
let tosAccepted = false;

// 🆕 v4.2: Post-processing state (all optional, off by default)
let deduplicationEnabled = false;
let translationEnabled = false;
let summarizationEnabled = false;

// 🆕 v4.2: Result tabs state
let currentTab = 'data';
let currentInsightType = 'summary';
let generatedInsights = null;

// 🆕 v4.2: Cost tracking
let costEstimate = 0;
let dailyCost = 0;

const TOS_VERSION = '1.0.0';
const TOS_STORAGE_KEY = 'web_weaver_tos_accepted';

// Category definitions - PRESERVED FROM v4.1
const CATEGORIES = [
  { id: 'all', name: 'All Items', icon: '📦', description: 'Extract all items on the page' },
  { id: 'products', name: 'Products Only', icon: '🛍️', description: 'Extract only product listings' },
  { id: 'articles', name: 'Articles Only', icon: '📰', description: 'Extract only article/blog posts' },
  { id: 'videos', name: 'Videos Only', icon: '🎥', description: 'Extract only video listings' },
  { id: 'jobs', name: 'Job Listings', icon: '💼', description: 'Extract only job postings' },
  { id: 'events', name: 'Events', icon: '📅', description: 'Extract only event listings' }
];

// Error messages - PRESERVED FROM v4.1
const ERROR_MESSAGES = {
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
  }
};

// ════════════════════════════════════════════════════════════════
// INITIALIZATION - ENHANCED FROM v4.1 WITH v4.2 ADDITIONS
// ════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Popup] Initializing Web Weaver Lightning v4.2.0...');
  
  // Step 1: Check TOS acceptance (PRESERVED FROM v4.1)
  await checkTOSAcceptance();
  
  // Step 2: Check Chrome AI availability (PRESERVED FROM v4.1)
  await checkChromeAIAvailability();
  
  // Step 3: Load settings (ENHANCED FOR v4.2)
  await loadAIProvider();
  await loadApiKey();
  await loadCategory();
  await loadPostProcessingSettings(); // 🆕 v4.2
  await loadCostTracking(); // 🆕 v4.2
  
  // Step 4: Template auto-detection (🆕 v4.2)
  await detectAndApplyTemplate();
  
  // Step 5: Setup event listeners (ENHANCED FOR v4.2)
  setupEventListeners();
  
  // Step 6: Initialize UI components (ENHANCED FOR v4.2)
  initializeModeSelector();
  initializeExtractionTypeSelector();
  initializeAIProviderSelector();
  initializeCategorySelector();
  initializeTemplateSelector(); // 🆕 v4.2
  initializePostProcessingCheckboxes(); // 🆕 v4.2
  initializeResultTabs(); // 🆕 v4.2
  
  // Step 7: Update UI state (ENHANCED FOR v4.2)
  updatePrivacyBadges(); // 🆕 v4.2
  updateCostEstimate(); // 🆕 v4.2
  
  // Step 8: Check fallback banner (PRESERVED FROM v4.1)
  await checkAndShowFallbackBanner();
  
  // Step 9: Setup message listener (PRESERVED FROM v4.1)
  setupMessageListener();
  
  // Step 10: Load extraction history (PRESERVED FROM v4.1)
  await loadExtractionHistory();
  
  console.log('[Popup] ✅ Initialization complete');
  console.log('[Popup] AI Provider:', currentAIProvider);
  console.log('[Popup] Chrome AI Available:', chromeAIAvailable);
  console.log('[Popup] Category:', currentCategory);
  console.log('[Popup] Template:', currentTemplate?.name || 'None');
  console.log('[Popup] Deduplication:', deduplicationEnabled);
  console.log('[Popup] Translation:', translationEnabled);
  console.log('[Popup] Summarization:', summarizationEnabled);
});

// ════════════════════════════════════════════════════════════════
// TOS ACCEPTANCE - PRESERVED FROM v4.1
// ════════════════════════════════════════════════════════════════

async function checkTOSAcceptance() {
  const result = await chrome.storage.local.get([TOS_STORAGE_KEY]);
  const acceptance = result[TOS_STORAGE_KEY];
  
  if (acceptance && acceptance.version === TOS_VERSION && acceptance.accepted) {
    tosAccepted = true;
    console.log('[Popup] TOS already accepted');
    const modal = document.getElementById('tosModal');
    if (modal) modal.classList.remove('visible');
    return;
  }
  
  console.log('[Popup] Showing TOS acceptance modal');
  const modal = document.getElementById('tosModal');
  if (modal) modal.classList.add('visible');
  
  document.getElementById('acceptTos')?.addEventListener('click', async () => {
    await chrome.storage.local.set({
      [TOS_STORAGE_KEY]: {
        version: TOS_VERSION,
        accepted: true,
        timestamp: Date.now()
      }
    });
    tosAccepted = true;
    if (modal) modal.classList.remove('visible');
    console.log('[Popup] TOS accepted');
  });
  
  document.getElementById('declineTos')?.addEventListener('click', () => {
    window.close();
  });
}

// ════════════════════════════════════════════════════════════════
// CHROME AI AVAILABILITY - PRESERVED FROM v4.1
// ════════════════════════════════════════════════════════════════

async function checkChromeAIAvailability() {
  console.log('[Popup] Checking Chrome AI availability...');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'checkChromeAI' });
    
    if (response.success) {
      chromeAIAvailable = response.available;
      console.log('[Popup] Chrome AI available:', chromeAIAvailable);
      updateChromeAIStatusIndicator();
    }
  } catch (error) {
    console.error('[Popup] Error checking Chrome AI:', error);
    chromeAIAvailable = false;
  }
}

function updateChromeAIStatusIndicator() {
  const statusElement = document.getElementById('chromeAIStatusText');
  if (!statusElement) return;
  
  if (chromeAIAvailable) {
    statusElement.textContent = '✅ Available';
    statusElement.parentElement.classList.add('available');
    statusElement.parentElement.classList.remove('unavailable');
  } else {
    statusElement.textContent = '❌ Unavailable (Auto-fallback to Cloud API)';
    statusElement.parentElement.classList.add('unavailable');
    statusElement.parentElement.classList.remove('available');
  }
}

// ════════════════════════════════════════════════════════════════
// 🆕 v4.2: TEMPLATE DETECTION & MANAGEMENT
// ════════════════════════════════════════════════════════════════

async function detectAndApplyTemplate() {
  console.log('[Popup] Detecting template...');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'detectTemplate' });
    
    if (response.success && response.template) {
      currentTemplate = response.template;
      console.log('[Popup] Template detected:', currentTemplate.name);
      
      // Update template selector
      const templateSelect = document.getElementById('templateSelect');
      if (templateSelect) {
        templateSelect.value = currentTemplate.id;
      }
      
      // Show detection indicator if not custom
      if (currentTemplate.id !== 'custom') {
        const detectedIndicator = document.getElementById('templateDetected');
        if (detectedIndicator) {
          detectedIndicator.style.display = 'block';
          setTimeout(() => {
            detectedIndicator.style.display = 'none';
          }, 5000);
        }
      }
      
      // Apply template settings
      await applyTemplateSettings(currentTemplate);
    }
  } catch (error) {
    console.error('[Popup] Error detecting template:', error);
  }
}

async function applyTemplateSettings(template) {
  console.log('[Popup] Applying template settings:', template.name);
  
  if (template.settings.category) {
    currentCategory = template.settings.category;
    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect) categorySelect.value = currentCategory;
  }
  
  if (template.settings.mode) {
    currentMode = template.settings.mode;
    updateModeButtonStates();
  }
  
  if (template.settings.deduplication !== undefined) {
    deduplicationEnabled = template.settings.deduplication;
    const checkbox = document.getElementById('deduplicationCheckbox');
    if (checkbox) checkbox.checked = deduplicationEnabled;
  }
  
  if (template.settings.translation !== undefined) {
    translationEnabled = template.settings.translation;
    const checkbox = document.getElementById('translationCheckbox');
    if (checkbox) checkbox.checked = translationEnabled;
  }
  
  if (template.settings.summarization !== undefined) {
    summarizationEnabled = template.settings.summarization;
    const checkbox = document.getElementById('summarizationCheckbox');
    if (checkbox) checkbox.checked = summarizationEnabled;
  }
  
  // Update template info
  const templateInfo = document.getElementById('templateInfo');
  if (templateInfo) {
    templateInfo.textContent = template.description || 'Auto-configured settings';
  }
  
  // Update cost estimate
  updateCostEstimate();
}

function initializeTemplateSelector() {
  const templateSelect = document.getElementById('templateSelect');
  if (!templateSelect) return;
  
  templateSelect.addEventListener('change', async (e) => {
    const templateId = e.target.value;
    console.log('[Popup] Template manually changed to:', templateId);
    
    try {
      // Get template from TemplateManager
      if (typeof TemplateManager !== 'undefined') {
        currentTemplate = TemplateManager.getTemplateById(templateId);
        
        if (currentTemplate) {
          await applyTemplateSettings(currentTemplate);
          
          // Notify background
          await chrome.runtime.sendMessage({
            action: 'applyTemplate',
            template: currentTemplate
          });
        }
      }
    } catch (error) {
      console.error('[Popup] Error applying template:', error);
    }
  });
}

// ════════════════════════════════════════════════════════════════
// 🆕 v4.2: POST-PROCESSING SETTINGS (OPTIONAL CHECKBOXES)
// ════════════════════════════════════════════════════════════════

async function loadPostProcessingSettings() {
  console.log('[Popup] Loading post-processing settings...');
  
  try {
    // Load deduplication setting
    const dedupResponse = await chrome.runtime.sendMessage({ action: 'getDeduplication' });
    if (dedupResponse.success) {
      deduplicationEnabled = dedupResponse.enabled;
    }
    
    // Load translation setting
    const translateResponse = await chrome.runtime.sendMessage({ action: 'getTranslation' });
    if (translateResponse.success) {
      translationEnabled = translateResponse.enabled;
    }
    
    // Load summarization setting
    const summarizeResponse = await chrome.runtime.sendMessage({ action: 'getSummarization' });
    if (summarizeResponse.success) {
      summarizationEnabled = summarizeResponse.enabled;
    }
    
    console.log('[Popup] Post-processing settings loaded:', {
      deduplication: deduplicationEnabled,
      translation: translationEnabled,
      summarization: summarizationEnabled
    });
    
  } catch (error) {
    console.error('[Popup] Error loading post-processing settings:', error);
  }
}

function initializePostProcessingCheckboxes() {
  // Deduplication checkbox
  const dedupCheckbox = document.getElementById('deduplicationCheckbox');
  if (dedupCheckbox) {
    dedupCheckbox.checked = deduplicationEnabled;
    dedupCheckbox.addEventListener('change', async (e) => {
      deduplicationEnabled = e.target.checked;
      console.log('[Popup] Deduplication:', deduplicationEnabled);
      
      await chrome.runtime.sendMessage({
        action: 'setDeduplication',
        enabled: deduplicationEnabled
      });
      
      updateCostEstimate();
    });
  }
  
  // Translation checkbox
  const translateCheckbox = document.getElementById('translationCheckbox');
  if (translateCheckbox) {
    translateCheckbox.checked = translationEnabled;
    translateCheckbox.addEventListener('change', async (e) => {
      translationEnabled = e.target.checked;
      console.log('[Popup] Translation:', translationEnabled);
      
      await chrome.runtime.sendMessage({
        action: 'setTranslation',
        enabled: translationEnabled
      });
      
      updateCostEstimate();
    });
  }
  
  // Summarization checkbox
  const summarizeCheckbox = document.getElementById('summarizationCheckbox');
  if (summarizeCheckbox) {
    summarizeCheckbox.checked = summarizationEnabled;
    summarizeCheckbox.addEventListener('change', async (e) => {
      summarizationEnabled = e.target.checked;
      console.log('[Popup] Summarization:', summarizationEnabled);
      
      await chrome.runtime.sendMessage({
        action: 'setSummarization',
        enabled: summarizationEnabled
      });
      
      updateCostEstimate();
    });
  }
}

// ════════════════════════════════════════════════════════════════
// 🆕 v4.2: COST TRACKING
// ════════════════════════════════════════════════════════════════

async function loadCostTracking() {
  console.log('[Popup] Loading cost tracking...');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getCostTracker' });
    
    if (response.success && response.costTracker) {
      dailyCost = response.costTracker.dailyTotal || 0;
      updateCostDisplay();
    }
  } catch (error) {
    console.error('[Popup] Error loading cost tracking:', error);
  }
}

function updateCostEstimate() {
  // Calculate estimated cost based on enabled features
  let estimate = 0;
  const itemCount = currentData?.length || 10; // Estimate 10 items if no data yet
  
  if (currentAIProvider === 'CLOUD_API') {
    // Base extraction cost
    estimate += 0.01;
    
    // Translation cost (if enabled)
    if (translationEnabled) {
      const translationBatches = Math.ceil(itemCount / 20);
      estimate += translationBatches * 0.01;
    }
    
    // Summarization cost (if enabled)
    if (summarizationEnabled) {
      const summarizationBatches = Math.ceil(itemCount / 5);
      estimate += summarizationBatches * 0.02;
    }
  }
  
  costEstimate = estimate;
  updateCostDisplay();
}

function updateCostDisplay() {
  const costTracker = document.getElementById('costTracker');
  const estimatedCostElement = document.getElementById('estimatedCost');
  const dailyCostElement = document.getElementById('dailyCost');
  
  if (!costTracker) return;
  
  // Show cost tracker only if Cloud API is active
  if (currentAIProvider === 'CLOUD_API') {
    costTracker.classList.add('visible');
    
    if (estimatedCostElement) {
      estimatedCostElement.textContent = `$${costEstimate.toFixed(4)}`;
      if (costEstimate > 0.10) {
        estimatedCostElement.classList.add('high');
      } else {
        estimatedCostElement.classList.remove('high');
      }
    }
    
    if (dailyCostElement) {
      dailyCostElement.textContent = `$${dailyCost.toFixed(4)}`;
    }
  } else {
    costTracker.classList.remove('visible');
  }
}

// ════════════════════════════════════════════════════════════════
// 🆕 v4.2: PRIVACY BADGES
// ════════════════════════════════════════════════════════════════

function updatePrivacyBadges() {
  const onDeviceBadge = document.getElementById('onDeviceBadge');
  const cloudBadge = document.getElementById('cloudBadge');
  const zeroCostBadge = document.getElementById('zeroCostBadge');
  
  if (currentAIProvider === 'CHROME_BUILTIN' && chromeAIAvailable) {
    if (onDeviceBadge) onDeviceBadge.style.display = 'inline-flex';
    if (cloudBadge) cloudBadge.style.display = 'none';
    if (zeroCostBadge) zeroCostBadge.style.display = 'inline-flex';
  } else {
    if (onDeviceBadge) onDeviceBadge.style.display = 'none';
    if (cloudBadge) cloudBadge.style.display = 'inline-flex';
    if (zeroCostBadge) zeroCostBadge.style.display = 'none';
  }
}

// ════════════════════════════════════════════════════════════════
// EVENT LISTENERS - ENHANCED FROM v4.1 WITH v4.2 ADDITIONS
// ════════════════════════════════════════════════════════════════

function setupEventListeners() {
  console.log('[Popup] Setting up event listeners...');
  
  // Extract button - PRESERVED FROM v4.1
  document.getElementById('extractBtn')?.addEventListener('click', handleExtraction);
  
  // AI Provider buttons - PRESERVED FROM v4.1
  document.getElementById('chromeAIBtn')?.addEventListener('click', () => setAIProvider('CHROME_BUILTIN'));
  document.getElementById('cloudAPIBtn')?.addEventListener('click', () => setAIProvider('CLOUD_API'));
  
  // API Key - PRESERVED FROM v4.1
  document.getElementById('saveApiKeyBtn')?.addEventListener('click', handleSaveApiKey);
  document.getElementById('apiKeyInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSaveApiKey();
  });
  
  // Extraction type buttons - PRESERVED FROM v4.1
  document.getElementById('multiItemBtn')?.addEventListener('click', () => setExtractionType('MULTI'));
  document.getElementById('singleItemBtn')?.addEventListener('click', () => setExtractionType('SINGLE_ITEM'));
  
  // Category selector - PRESERVED FROM v4.1
  document.getElementById('categorySelect')?.addEventListener('change', handleCategoryChange);
  
  // Mode buttons - PRESERVED FROM v4.1
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentMode = btn.dataset.mode;
      updateModeButtonStates();
      updateCostEstimate(); // 🆕 v4.2
    });
  });
  
  // Result actions - PRESERVED FROM v4.1
  document.getElementById('copyBtn')?.addEventListener('click', handleCopyResult);
  document.getElementById('downloadBtn')?.addEventListener('click', handleDownloadResult);
  document.getElementById('csvBtn')?.addEventListener('click', handleConvertToCSV);
  
  // 🆕 v4.2: Result tabs
  document.querySelectorAll('.result-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });
  
  // 🆕 v4.2: Insights generation
  document.getElementById('generateInsightsBtn')?.addEventListener('click', handleGenerateInsights);
  
  document.querySelectorAll('.insight-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentInsightType = btn.dataset.insight;
      document.querySelectorAll('.insight-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  // Fallback banner - PRESERVED FROM v4.1
  document.getElementById('dismissFallbackBtn')?.addEventListener('click', handleDismissFallbackBanner);
  document.getElementById('fallbackActionBtn')?.addEventListener('click', () => {
    window.open('https://www.google.com/chrome/dev/', '_blank');
  });
}

// ════════════════════════════════════════════════════════════════
// 🆕 v4.2: TAB MANAGEMENT
// ════════════════════════════════════════════════════════════════

function switchTab(tabName) {
  console.log('[Popup] Switching to tab:', tabName);
  
  currentTab = tabName;
  
  // Update tab buttons
  document.querySelectorAll('.result-tab').forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  const activeContent = document.getElementById(`${tabName}Tab`);
  if (activeContent) {
    activeContent.classList.add('active');
  }
}

// ════════════════════════════════════════════════════════════════
// EXTRACTION HANDLER - ENHANCED FROM v4.1 WITH v4.2 METADATA
// ════════════════════════════════════════════════════════════════

async function handleExtraction() {
  if (!tosAccepted) {
    console.warn('[Popup] TOS not accepted');
    return;
  }
  
  if (extractionInProgress) {
    console.warn('[Popup] Extraction already in progress');
    return;
  }
  
  console.log('[Popup] Starting extraction...', {
    mode: currentMode,
    extractionType: currentExtractionType,
    provider: currentAIProvider,
    category: currentCategory,
    deduplication: deduplicationEnabled,
    translation: translationEnabled,
    summarization: summarizationEnabled
  });
  
  extractionInProgress = true;
  updateExtractButton(true);
  
  try {
    // ✅ FIX 1: Get current tab info
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });
    
    if (!tab) {
      throw new Error('No active tab found');
    }
    
    // ✅ FIX 2: Send message WITH url and tabId
    const response = await chrome.runtime.sendMessage({
      action: 'extractData',
      mode: currentMode,
      extractionType: currentExtractionType,
      aiProvider: currentAIProvider,
      category: currentCategory,
      url: tab.url,          // ✅ ADDED
      tabId: tab.id          // ✅ ADDED
    });
    
    if (response.success) {
      currentData = response.data;
      
      // Update item count
      sessionItemCount.total = response.data.length;
      sessionItemCount.new = response.metadata?.deduplication?.unique || response.data.length;
      
      // Display results
      displayResults(response);
      
      // Update metadata tab
      updateMetadataTab(response.metadata);
      
      // Reload cost tracking
      await loadCostTracking();
      
      console.log('[Popup] ✅ Extraction complete:', {
        itemCount: response.data.length,
        duration: response.metadata?.duration,
        provider: response.metadata?.aiProvider
      });
      
    } else {
      throw new Error(response.error || 'Extraction failed');
    }
    
  } catch (error) {
    console.error('[Popup] Extraction error:', error);
    displayError(error);
  } finally {
    extractionInProgress = false;
    updateExtractButton(false);
  }
}

function updateExtractButton(loading) {
  const btn = document.getElementById('extractBtn');
  if (!btn) return;
  
  if (loading) {
    btn.classList.add('loading');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div><span>Extracting...</span>';
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
    btn.innerHTML = '<span>🚀 Extract Data</span>';
  }
}

// ════════════════════════════════════════════════════════════════
// RESULTS DISPLAY - ENHANCED FROM v4.1 WITH v4.2 TABS
// ════════════════════════════════════════════════════════════════

function displayResults(response) {
  console.log('[Popup] Displaying results...');
  
  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) resultsSection.classList.add('visible');
  
  // Update data tab
  displayDataTab(response.data);
  
  // Update item count badge
  const dataCountBadge = document.getElementById('dataCountBadge');
  if (dataCountBadge) dataCountBadge.textContent = response.data.length;
  
  // Clear insights (user needs to generate new ones)
  clearInsightsTab();
  
  // Switch to data tab
  switchTab('data');
}

function displayDataTab(data) {
  const itemCountElement = document.getElementById('itemCount');
  const jsonOutput = document.getElementById('jsonOutput');
  
  if (itemCountElement) {
    const newCount = sessionItemCount.new;
    const totalCount = sessionItemCount.total;
    
    if (deduplicationEnabled && newCount < totalCount) {
      itemCountElement.textContent = `${newCount} new (${totalCount} total)`;
    } else {
      itemCountElement.textContent = `${totalCount} items`;
    }
  }
  
  if (jsonOutput) {
    jsonOutput.textContent = JSON.stringify(data, null, 2);
  }
}

function updateMetadataTab(metadata) {
  if (!metadata) return;
  
  console.log('[Popup] Updating metadata tab...');
  
  // Duration
  const metaDuration = document.getElementById('metaDuration');
  if (metaDuration) {
    metaDuration.textContent = metadata.duration ? `${(metadata.duration / 1000).toFixed(2)}s` : '-';
  }
  
  // Mode
  const metaMode = document.getElementById('metaMode');
  if (metaMode) {
    metaMode.textContent = metadata.mode || '-';
  }
  
  // Provider
  const metaProvider = document.getElementById('metaProvider');
  if (metaProvider) {
    metaProvider.textContent = metadata.aiProvider || '-';
  }
  
  // Category
  const metaCategory = document.getElementById('metaCategory');
  if (metaCategory) {
    metaCategory.textContent = metadata.category || '-';
  }
  
  // Translation
  const metaTranslation = document.getElementById('metaTranslation');
  if (metaTranslation) {
    if (metadata.translation) {
      metaTranslation.textContent = `✅ ${metadata.translation.translated || 0} items`;
    } else {
      metaTranslation.textContent = translationEnabled ? 'Enabled' : 'Disabled';
    }
  }
  
  // Summarization
  const metaSummarization = document.getElementById('metaSummarization');
  if (metaSummarization) {
    if (metadata.summarization) {
      metaSummarization.textContent = `✅ ${metadata.summarization.summarized || 0} items`;
    } else {
      metaSummarization.textContent = summarizationEnabled ? 'Enabled' : 'Disabled';
    }
  }
  
  // Deduplication
  const metaDeduplication = document.getElementById('metaDeduplication');
  if (metaDeduplication) {
    if (metadata.deduplication) {
      metaDeduplication.textContent = `✅ ${metadata.deduplication.duplicates || 0} duplicates removed`;
    } else {
      metaDeduplication.textContent = deduplicationEnabled ? 'Enabled' : 'Disabled';
    }
  }
  
  // Cost
  const metaCost = document.getElementById('metaCost');
  if (metaCost) {
    const cost = metadata.estimatedCost || 0;
    metaCost.textContent = cost > 0 ? `$${cost.toFixed(4)}` : '$0.00 (Chrome AI)';
  }
}

// ════════════════════════════════════════════════════════════════
// 🆕 v4.2: INSIGHTS GENERATION
// ════════════════════════════════════════════════════════════════

async function handleGenerateInsights() {
  if (!currentData || currentData.length === 0) {
    console.warn('[Popup] No data to analyze');
    showNotification('No data available. Extract data first.', 'warning');
    return;
  }
  
  console.log('[Popup] Generating insights:', currentInsightType);
  
  const insightsOutput = document.getElementById('insightsOutput');
  const generateBtn = document.getElementById('generateInsightsBtn');
  
  if (!insightsOutput || !generateBtn) return;
  
  // Show loading state
  insightsOutput.classList.add('loading');
  insightsOutput.classList.remove('empty');
  insightsOutput.innerHTML = '<div class="spinner"></div> Generating insights...';
  
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<div class="spinner"></div><span>Generating...</span>';
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'generateInsights',
      items: currentData,
      insightType: currentInsightType
    });
    
    if (response.success) {
      generatedInsights = response.insights;
      
      // Display insights
      insightsOutput.classList.remove('loading');
      insightsOutput.innerHTML = formatInsights(response.insights);
      
      console.log('[Popup] ✅ Insights generated');
      
    } else {
      throw new Error(response.error || 'Failed to generate insights');
    }
    
  } catch (error) {
    console.error('[Popup] Insights generation error:', error);
    insightsOutput.classList.remove('loading');
    insightsOutput.classList.add('empty');
    insightsOutput.innerHTML = `
      <div style="color: #DC2626;">
        ❌ Failed to generate insights<br>
        <small>${error.message}</small>
      </div>
    `;
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<span>💡 Generate Insights</span>';
  }
}

function formatInsights(insights) {
  if (!insights) return '';
  
  // Convert markdown-style formatting to HTML
  let formatted = insights
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  // Wrap in paragraph if not already wrapped
  if (!formatted.startsWith('<p>')) {
    formatted = '<p>' + formatted + '</p>';
  }
  
  return formatted;
}

function clearInsightsTab() {
  const insightsOutput = document.getElementById('insightsOutput');
  if (insightsOutput) {
    insightsOutput.classList.remove('loading');
    insightsOutput.classList.add('empty');
    insightsOutput.innerHTML = 'Click "Generate Insights" to analyze extracted data';
  }
  generatedInsights = null;
}

// ════════════════════════════════════════════════════════════════
// RESULT ACTIONS - PRESERVED FROM v4.1
// ════════════════════════════════════════════════════════════════

async function handleCopyResult() {
  if (!currentData) {
    showNotification('No data to copy', 'warning');
    return;
  }
  
  try {
    const json = JSON.stringify(currentData, null, 2);
    await navigator.clipboard.writeText(json);
    showNotification('✅ Copied to clipboard', 'success');
    console.log('[Popup] Data copied to clipboard');
  } catch (error) {
    console.error('[Popup] Copy error:', error);
    showNotification('❌ Failed to copy', 'error');
  }
}

async function handleDownloadResult() {
  if (!currentData) {
    showNotification('No data to download', 'warning');
    return;
  }
  
  try {
    const json = JSON.stringify(currentData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `web-weaver-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('✅ Downloaded', 'success');
    console.log('[Popup] Data downloaded');
  } catch (error) {
    console.error('[Popup] Download error:', error);
    showNotification('❌ Download failed', 'error');
  }
}

async function handleConvertToCSV() {
  if (!currentData) {
    showNotification('No data to convert', 'warning');
    return;
  }
  
  console.log('[Popup] Converting to CSV...');
  showNotification('🔄 Converting to CSV...', 'info');
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'convertToCSV',
      data: currentData,
      aiProvider: currentAIProvider
    });
    
    if (response.success) {
      const blob = new Blob([response.csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `web-weaver-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('✅ CSV downloaded', 'success');
      console.log('[Popup] CSV downloaded');
    } else {
      throw new Error(response.error || 'CSV conversion failed');
    }
  } catch (error) {
    console.error('[Popup] CSV conversion error:', error);
    showNotification('❌ CSV conversion failed', 'error');
  }
}

// ════════════════════════════════════════════════════════════════
// ERROR DISPLAY - PRESERVED FROM v4.1
// ════════════════════════════════════════════════════════════════

function displayError(error) {
  console.error('[Popup] Displaying error:', error);
  
  const errorMessage = error.message || String(error);
  const errorConfig = ERROR_MESSAGES[errorMessage] || ERROR_MESSAGES[Object.keys(ERROR_MESSAGES).find(key => errorMessage.includes(key))];
  
  if (errorConfig) {
    showStructuredError(errorConfig);
  } else {
    showNotification(`❌ ${errorMessage}`, 'error');
  }
}

function showStructuredError(errorConfig) {
  const resultsSection = document.getElementById('resultsSection');
  const jsonOutput = document.getElementById('jsonOutput');
  
  if (!resultsSection || !jsonOutput) return;
  
  resultsSection.classList.add('visible');
  
  let html = `
    <div style="padding: 20px; background: ${errorConfig.severity === 'error' ? '#FEE2E2' : '#FEF3C7'}; border-radius: 8px;">
      <div style="font-size: 16px; font-weight: 700; color: ${errorConfig.severity === 'error' ? '#DC2626' : '#92400E'}; margin-bottom: 12px;">
        ${errorConfig.title}
      </div>
      <div style="font-size: 13px; color: #374151; margin-bottom: 16px; line-height: 1.6;">
        ${errorConfig.message}
      </div>
      <div style="font-size: 13px; color: #4B5563; margin-bottom: 8px; font-weight: 600;">
        Recovery Steps:
      </div>
      <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 13px; line-height: 1.8;">
  `;
  
  errorConfig.suggestions.forEach(suggestion => {
    html += `<li>${suggestion}</li>`;
  });
  
  html += `
      </ul>
    </div>
  `;
  
  jsonOutput.innerHTML = html;
  
  // Auto-recovery action
  if (errorConfig.recoveryAction === 'switch_to_chrome_ai' && currentAIProvider !== 'CHROME_BUILTIN') {
    setTimeout(() => {
      console.log('[Popup] Auto-switching to Chrome AI...');
      setAIProvider('CHROME_BUILTIN');
    }, 3000);
  }
}

// ════════════════════════════════════════════════════════════════
// UI HELPERS - PRESERVED FROM v4.1
// ════════════════════════════════════════════════════════════════

function showNotification(message, type = 'info') {
  console.log(`[Popup] Notification [${type}]:`, message);
  
  // Create toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#667eea'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

function initializeModeSelector() {
  updateModeButtonStates();
}

function updateModeButtonStates() {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    if (btn.dataset.mode === currentMode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function initializeExtractionTypeSelector() {
  updateExtractionTypeButtonStates();
  updateExtractionTypeDescription();
}

function updateExtractionTypeButtonStates() {
  document.querySelectorAll('.extraction-type-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  if (currentExtractionType === 'MULTI') {
    document.getElementById('multiItemBtn')?.classList.add('active');
  } else {
    document.getElementById('singleItemBtn')?.classList.add('active');
  }
}

function setExtractionType(type) {
  currentExtractionType = type;
  updateExtractionTypeButtonStates();
  updateExtractionTypeDescription();
  updateCostEstimate();
}

function updateExtractionTypeDescription() {
  const desc = document.getElementById('extractionTypeDesc');
  if (!desc) return;
  
  if (currentExtractionType === 'MULTI') {
    desc.innerHTML = '<strong>MULTI Mode:</strong> Extract all items from current page (product listings, search results, feeds).';
  } else {
    desc.innerHTML = '<strong>SINGLE Mode:</strong> Extract one item using screenshot + Vision API (product details, full articles).';
  }
}

function initializeAIProviderSelector() {
  updateAIProviderButtonStates();
  updateAPIKeyVisibility();
}

function updateAIProviderButtonStates() {
  document.querySelectorAll('.provider-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  if (currentAIProvider === 'CHROME_BUILTIN') {
    document.getElementById('chromeAIBtn')?.classList.add('active');
  } else {
    document.getElementById('cloudAPIBtn')?.classList.add('active');
  }
}

async function setAIProvider(provider) {
  console.log('[Popup] Setting AI provider to:', provider);
  
  currentAIProvider = provider;
  
  await chrome.runtime.sendMessage({
    action: 'setAIProvider',
    provider
  });
  
  updateAIProviderButtonStates();
  updateAPIKeyVisibility();
  updatePrivacyBadges();
  updateCostEstimate();
}

function updateAPIKeyVisibility() {
  const apiKeySection = document.getElementById('apiKeySection');
  if (!apiKeySection) return;
  
  if (currentAIProvider === 'CLOUD_API') {
    apiKeySection.style.display = 'block';
  } else {
    apiKeySection.style.display = 'none';
  }
}

function initializeCategorySelector() {
  const categorySelect = document.getElementById('categorySelect');
  if (categorySelect) {
    categorySelect.value = currentCategory;
  }
}

async function handleCategoryChange(e) {
  currentCategory = e.target.value;
  console.log('[Popup] Category changed to:', currentCategory);
  
  await chrome.runtime.sendMessage({
    action: 'setCategory',
    category: currentCategory
  });
}

// 🆕 v4.2: Initialize result tabs
function initializeResultTabs() {
  switchTab('data');
}

// ════════════════════════════════════════════════════════════════
// SETTINGS MANAGEMENT - PRESERVED FROM v4.1
// ════════════════════════════════════════════════════════════════

async function loadAIProvider() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getAIProvider' });
    if (response.success) {
      currentAIProvider = response.provider;
      console.log('[Popup] AI provider loaded:', currentAIProvider);
    }
  } catch (error) {
    console.error('[Popup] Error loading AI provider:', error);
  }
}

async function loadApiKey() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getApiKey' });
    if (response.success && response.apiKey) {
      document.getElementById('apiKeyInput').value = response.apiKey;
      await validateApiKey(response.apiKey);
      console.log('[Popup] API key loaded');
    }
  } catch (error) {
    console.error('[Popup] Error loading API key:', error);
  }
}

async function loadCategory() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getCategory' });
    if (response.success) {
      currentCategory = response.category;
      console.log('[Popup] Category loaded:', currentCategory);
    }
  } catch (error) {
    console.error('[Popup] Error loading category:', error);
  }
}

async function handleSaveApiKey() {
  const input = document.getElementById('apiKeyInput');
  const apiKey = input?.value?.trim();
  
  if (!apiKey) {
    showNotification('❌ Please enter an API key', 'error');
    return;
  }
  
  console.log('[Popup] Saving API key...');
  showNotification('🔄 Validating API key...', 'info');
  
  try {
    await chrome.runtime.sendMessage({
      action: 'saveApiKey',
      apiKey
    });
    
    await validateApiKey(apiKey);
    
  } catch (error) {
    console.error('[Popup] Error saving API key:', error);
    showNotification('❌ Failed to save API key', 'error');
  }
}

async function validateApiKey(apiKey) {
  const statusElement = document.getElementById('apiStatus');
  const statusText = document.getElementById('apiStatusText');
  
  if (!statusElement || !statusText) return;
  
  statusElement.style.display = 'flex';
  statusText.textContent = 'Validating...';
  statusElement.classList.remove('valid', 'invalid');
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'validateApiKey',
      apiKey
    });
    
    if (response.valid) {
      statusText.textContent = `✅ Valid (${response.modelCount || 0} models)`;
      statusElement.classList.add('valid');
      showNotification('✅ API key valid', 'success');
    } else {
      statusText.textContent = '❌ Invalid key';
      statusElement.classList.add('invalid');
      showNotification('❌ API key invalid', 'error');
    }
  } catch (error) {
    console.error('[Popup] API key validation error:', error);
    statusText.textContent = '❌ Validation failed';
    statusElement.classList.add('invalid');
  }
}

// ════════════════════════════════════════════════════════════════
// FALLBACK BANNER - PRESERVED FROM v4.1
// ════════════════════════════════════════════════════════════════

async function checkAndShowFallbackBanner() {
  console.log('[Popup] Checking fallback banner...');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'checkFallbackBanner' });
    
    if (response.success && response.shouldShow) {
      // Check if we're in fallback situation
      if (!chromeAIAvailable && currentAIProvider === 'CHROME_BUILTIN') {
        showFallbackBanner('chromeAIUnavailable');
      }
    }
  } catch (error) {
    console.error('[Popup] Error checking fallback banner:', error);
  }
}

function showFallbackBanner(type) {
  const banner = document.getElementById('fallbackBanner');
  const title = document.getElementById('fallbackBannerTitle');
  const message = document.getElementById('fallbackBannerMessage');
  const actionBtn = document.getElementById('fallbackActionBtn');
  
  if (!banner) return;
  
  if (type === 'chromeAIUnavailable') {
    if (title) title.textContent = 'Chrome Built-in AI Unavailable';
    if (message) {
      message.textContent = 'Falling back to Cloud API (slower). Get Chrome Dev 128+ for 10× faster extraction.';
    }
    if (actionBtn) actionBtn.textContent = 'Download Chrome Dev';
  } else if (type === 'rateLimitFallback') {
    if (title) title.textContent = 'Rate Limit Hit - Auto-Switched';
    if (message) {
      message.textContent = 'Cloud API rate limit reached. Automatically switched to Chrome AI for unlimited requests.';
    }
    if (actionBtn) actionBtn.textContent = 'Got it';
  }
  
  banner.classList.add('visible');
  console.log('[Popup] Fallback banner shown:', type);
}

async function handleDismissFallbackBanner() {
  const banner = document.getElementById('fallbackBanner');
  if (banner) banner.classList.remove('visible');
  
  try {
    await chrome.runtime.sendMessage({ action: 'dismissFallbackBanner' });
    console.log('[Popup] Fallback banner dismissed');
  } catch (error) {
    console.error('[Popup] Error dismissing fallback banner:', error);
  }
}

// ════════════════════════════════════════════════════════════════
// MESSAGE LISTENER - PRESERVED FROM v4.1
// ════════════════════════════════════════════════════════════════

function setupMessageListener() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[Popup] Message received:', request.action);
    
    switch (request.action) {
      case 'showFallbackBanner':
        showFallbackBanner(request.bannerType);
        break;
      
      case 'scrollProgress':
        updateScrollProgress(request.scrollCount, request.itemCount);
        break;
      
      case 'budgetWarning':
        showBudgetWarning(request);
        break;
      
      case 'translationProgress':
        updateTranslationProgress(request.progress);
        break;
      
      case 'summarizationProgress':
        updateSummarizationProgress(request.progress);
        break;
      
      default:
        console.warn('[Popup] Unknown message action:', request.action);
    }
    
    sendResponse({ success: true });
    return true;
  });
}

function updateScrollProgress(scrollCount, itemCount) {
  console.log('[Popup] Scroll progress:', { scrollCount, itemCount });
  // Could display progress indicator in UI if needed
}

// 🆕 v4.2: Budget warning notification
function showBudgetWarning(data) {
  const percentage = (data.current / data.limit) * 100;
  showNotification(`⚠️ Budget Warning: ${percentage.toFixed(0)}% of ${data.type} limit used`, 'warning');
}

// 🆕 v4.2: Translation progress notification
function updateTranslationProgress(progress) {
  console.log('[Popup] Translation progress:', progress);
  // Could show progress bar in UI
}

// 🆕 v4.2: Summarization progress notification
function updateSummarizationProgress(progress) {
  console.log('[Popup] Summarization progress:', progress);
  // Could show progress bar in UI
}

// ════════════════════════════════════════════════════════════════
// EXTRACTION HISTORY - PRESERVED FROM v4.1
// ════════════════════════════════════════════════════════════════

async function loadExtractionHistory() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getExtractionHistory' });
    
    if (response.success && response.history) {
      console.log('[Popup] Extraction history loaded:', response.history.length, 'entries');
      // Could display history in UI if needed
    }
  } catch (error) {
    console.error('[Popup] Error loading extraction history:', error);
  }
}

// ════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS - PRESERVED FROM v4.1
// ════════════════════════════════════════════════════════════════

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  const seconds = (ms / 1000).toFixed(2);
  return `${seconds}s`;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function sanitizeHTML(html) {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

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

// ════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS - PRESERVED FROM v4.1
// ════════════════════════════════════════════════════════════════

document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter to extract
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (!extractionInProgress) {
      handleExtraction();
    }
  }
  
  // Ctrl/Cmd + C to copy (when results visible)
  if ((e.ctrlKey || e.metaKey) && e.key === 'c' && currentData) {
    const selection = window.getSelection();
    if (!selection.toString()) {
      e.preventDefault();
      handleCopyResult();
    }
  }
  
  // Ctrl/Cmd + S to download (when results visible)
  if ((e.ctrlKey || e.metaKey) && e.key === 's' && currentData) {
    e.preventDefault();
    handleDownloadResult();
  }
  
  // Escape to close modals
  if (e.key === 'Escape') {
    const modal = document.querySelector('.modal.visible');
    if (modal) {
      modal.classList.remove('visible');
    }
  }
  
  // 🆕 v4.2: Tab shortcuts
  if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '3' && currentData) {
    e.preventDefault();
    const tabs = ['data', 'insights', 'metadata'];
    const tabIndex = parseInt(e.key) - 1;
    if (tabs[tabIndex]) {
      switchTab(tabs[tabIndex]);
    }
  }
});

// ════════════════════════════════════════════════════════════════
// ANIMATIONS - PRESERVED FROM v4.1
// ════════════════════════════════════════════════════════════════

const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(style);

// ════════════════════════════════════════════════════════════════
// ERROR TRACKING - PRESERVED FROM v4.1
// ════════════════════════════════════════════════════════════════

window.addEventListener('error', (event) => {
  console.error('[Popup] Uncaught error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Popup] Unhandled promise rejection:', event.reason);
});

// ════════════════════════════════════════════════════════════════
// PERFORMANCE MONITORING - PRESERVED FROM v4.1
// ════════════════════════════════════════════════════════════════

const perfObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 100) {
      console.warn('[Popup] Slow operation:', entry.name, `${entry.duration.toFixed(2)}ms`);
    }
  }
});

try {
  perfObserver.observe({ entryTypes: ['measure'] });
} catch (e) {
  console.log('[Popup] Performance Observer not supported');
}

// ════════════════════════════════════════════════════════════════
// ACCESSIBILITY - PRESERVED FROM v4.1
// ════════════════════════════════════════════════════════════════

document.querySelectorAll('button, select, input').forEach(element => {
  if (!element.getAttribute('aria-label') && !element.getAttribute('title')) {
    const text = element.textContent?.trim() || element.placeholder || element.value;
    if (text) {
      element.setAttribute('aria-label', text);
    }
  }
});

// ════════════════════════════════════════════════════════════════
// CLEANUP - PRESERVED FROM v4.1
// ════════════════════════════════════════════════════════════════

window.addEventListener('beforeunload', () => {
  console.log('[Popup] Cleaning up before unload...');
  perfObserver.disconnect();
});

// ════════════════════════════════════════════════════════════════
// FINAL LOG - ENHANCED FOR v4.2
// ════════════════════════════════════════════════════════════════

console.log('[Popup] ✅ Web Weaver Lightning v4.2.0 popup script loaded');
console.log('[Popup] Features:', {
  chromeAI: chromeAIAvailable,
  templates: typeof TemplateManager !== 'undefined',
  insights: typeof InsightsGenerator !== 'undefined',
  deduplication: deduplicationEnabled,
  translation: translationEnabled,
  summarization: summarizationEnabled
});
console.log('[Popup] Ready for extraction 🚀');
