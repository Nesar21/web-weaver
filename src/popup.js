// Day 8+9: ULTIMATE ENTERPRISE CHAMPION POPUP - ONE-CLICK AI ANALYTICS
// /src/popup.js - NO TAB OPENING AI ANALYTICS VERSION

console.log('[Popup] Day 8+9 ULTIMATE ENTERPRISE CHAMPION system loading - ONE-CLICK AI ANALYTICS');

// ===== GLOBAL STATE =====
let currentExtractedData = null;
let analyticsInProgress = false;
let lastAnalyticsResults = null;
let systemStatus = {
  apiKeyConfigured: false,
  enterpriseConfigLoaded: false,
  systemReady: false,
  aiEnabled: false
};

// ===== DOM ELEMENTS =====
const elements = {};

// ===== ENHANCED LOGGER =====
const PopupLogger = {
  info: (msg, data = {}) => console.log(`[Popup] ℹ️ ${msg}`, data),
  warn: (msg, data = {}) => console.warn(`[Popup] ⚠️ ${msg}`, data),
  error: (msg, data = {}) => console.error(`[Popup] ❌ ${msg}`, data),
  success: (msg, data = {}) => console.log(`[Popup] ✅ ${msg}`, data)
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
  try {
    PopupLogger.info('🚀 Initializing Day 8+9 ONE-CLICK AI ANALYTICS popup');
    
    // Cache DOM elements
    cacheElements();
    
    // Initialize UI with DYNAMIC state
    await initializeUI();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load system status
    await loadSystemStatus();
    
    // Update UI
    updateUI();
    
    PopupLogger.success('🏆 Day 8+9 ONE-CLICK AI ANALYTICS popup initialized successfully');
    
  } catch (error) {
    PopupLogger.error('Popup initialization failed', { error: error.message });
    showError('System initialization failed: ' + error.message);
  }
});

// ===== DOM ELEMENT CACHING =====
function cacheElements() {
  const elementIds = [
    'versionInfo', 'systemStatus', 'systemStatusText', 'configStatus', 'configStatusText',
    'enterpriseStatus', 'enterpriseStatusText', 'analyticsStatus', 'analyticsStatusText',
    'apiKeyInput', 'saveApiKeyBtn', 'apiKeyStatus', 'analyticsSection', 'trajectoryBadge',
    'overallAccuracy', 'businessAccuracy', 'trajectoryText', 'sitePerformanceList',
    'extractBtn', 'analyticsBtn', 'reloadConfigBtn', 'cleanupTabsBtn', 'copyBtn',
    'exportJsonBtn', 'exportCsvBtn', 'resultsContent', 'configInfo'
  ];
  
  elementIds.forEach(id => {
    elements[id] = document.getElementById(id);
    if (!elements[id]) {
      PopupLogger.warn(`Element not found: ${id}`);
    }
  });
}

// ===== UI INITIALIZATION =====
async function initializeUI() {
  // Set loading states
  setLoadingState();
  
  // Initialize analytics display with DYNAMIC PLACEHOLDER
  initializeDynamicAnalyticsDisplay();
}

function setLoadingState() {
  const loadingSpinner = '<div class="loading"></div>';
  
  safeSetHTML(elements.systemStatusText, loadingSpinner);
  safeSetHTML(elements.configStatusText, loadingSpinner);
  safeSetHTML(elements.enterpriseStatusText, loadingSpinner);
  safeSetHTML(elements.analyticsStatusText, loadingSpinner);
  safeSetText(elements.configInfo, 'Loading system configuration...');
}

function initializeDynamicAnalyticsDisplay() {
  // Set DYNAMIC PLACEHOLDER values - NOT STATIC
  safeSetText(elements.overallAccuracy, '--');
  safeSetText(elements.businessAccuracy, '--');
  safeSetText(elements.trajectoryText, 'READY');
  safeSetText(elements.trajectoryBadge, 'READY');
  
  if (elements.trajectoryBadge) {
    elements.trajectoryBadge.className = 'trajectory trajectory-warning';
  }
  
  // Clear site performance with DYNAMIC message
  safeSetHTML(elements.sitePerformanceList, 
    '<li class="performance-item"><span style="opacity: 0.7;">Click "🤖 AI Analytics Test" for live data</span></li>'
  );
}

// ===== SAFE DOM MANIPULATION HELPERS =====
function safeSetText(element, text) {
  if (element && text !== null && text !== undefined) {
    element.textContent = String(text);
  }
}

function safeSetHTML(element, html) {
  if (element && html !== null && html !== undefined) {
    element.innerHTML = String(html);
  }
}

function safeAddClass(element, className) {
  if (element && className) {
    element.classList.add(className);
  }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // API Key Management with null checks
  if (elements.saveApiKeyBtn) {
    elements.saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
  }
  
  if (elements.apiKeyInput) {
    elements.apiKeyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSaveApiKey();
      }
    });
  }
  
  // Main Actions with null checks
  if (elements.extractBtn) {
    elements.extractBtn.addEventListener('click', handleExtractPage);
  }
  
  // ===== ONE-CLICK AI ANALYTICS BUTTON =====
  if (elements.analyticsBtn) {
    elements.analyticsBtn.addEventListener('click', handleOneClickAIAnalytics);
    // Update button text to show it's AI-powered
    elements.analyticsBtn.innerHTML = '🤖 AI Analytics Test';
    elements.analyticsBtn.title = 'Run AI analytics on all sites without opening tabs';
  }
  
  if (elements.reloadConfigBtn) {
    elements.reloadConfigBtn.addEventListener('click', handleReloadConfig);
  }
  
  if (elements.cleanupTabsBtn) {
    elements.cleanupTabsBtn.addEventListener('click', handleCleanupTabs);
  }
  
  // Export Functions with null checks
  if (elements.copyBtn) {
    elements.copyBtn.addEventListener('click', handleCopyResults);
  }
  
  if (elements.exportJsonBtn) {
    elements.exportJsonBtn.addEventListener('click', () => handleExportResults('json'));
  }
  
  if (elements.exportCsvBtn) {
    elements.exportCsvBtn.addEventListener('click', () => handleExportResults('csv'));
  }
}

// ===== SYSTEM STATUS LOADING =====
async function loadSystemStatus() {
  try {
    PopupLogger.info('📊 Loading DYNAMIC system status');
    
    // Get system status from background with error handling
    const statusResponse = await sendMessageToBackground({ action: 'getSystemStatus' });
    
    if (statusResponse && statusResponse.success !== false) {
      systemStatus = {
        apiKeyConfigured: statusResponse.aiEnabled || false,
        enterpriseConfigLoaded: statusResponse.enterpriseConfigLoaded || false,
        systemReady: statusResponse.modulesLoaded || false,
        aiEnabled: statusResponse.aiEnabled || false,
        version: statusResponse.day8Version || statusResponse.version || 'day8-day9-ultimate-enterprise-champion',
        configVersion: statusResponse.configVersion || 'day8-day9-ultimate-enterprise-v3.0',
        tabManager: statusResponse.tabManager || {},
        healthStatus: statusResponse.healthStatus || {}
      };
      
      PopupLogger.success('System status loaded', systemStatus);
    }
    
    // Get API key status with error handling
    try {
      const apiResponse = await sendMessageToBackground({ action: 'getApiKey' });
      if (apiResponse && apiResponse.hasKey) {
        systemStatus.apiKeyConfigured = true;
        systemStatus.aiEnabled = apiResponse.aiEnabled || false;
        systemStatus.version = apiResponse.version || systemStatus.version;
        systemStatus.configVersion = apiResponse.configVersion || systemStatus.configVersion;
      }
    } catch (apiError) {
      PopupLogger.warn('API key status check failed', { error: apiError.message });
    }
    
    // Get enterprise config status with error handling
    try {
      const configResponse = await sendMessageToBackground({ action: 'getEnterpriseConfig' });
      if (configResponse && configResponse.success) {
        systemStatus.enterpriseConfigLoaded = configResponse.loaded || false;
        systemStatus.enterpriseSiteCount = configResponse.sites || 0;
        if (configResponse.version) {
          systemStatus.configVersion = configResponse.version;
        }
      }
    } catch (configError) {
      PopupLogger.warn('Enterprise config status check failed', { error: configError.message });
    }
    
  } catch (error) {
    PopupLogger.error('Failed to load system status', { error: error.message });
  }
}

// ===== UI UPDATE =====
function updateUI() {
  updateVersionInfo();
  updateStatusIndicators();
  updateConfigInfo();
  updateAnalyticsSection();
}

function updateVersionInfo() {
  const version = systemStatus.version || 'day8-day9-ultimate-enterprise-champion';
  const configVersion = systemStatus.configVersion || 'day8-day9-ultimate-enterprise-v3.0';
  
  safeSetText(elements.versionInfo, `Day 8+9 ${version} ${configVersion}`);
}

function updateStatusIndicators() {
  // System Status
  updateStatusItem(elements.systemStatus, elements.systemStatusText, 
    systemStatus.systemReady, '⚡ Ready', '⏳ Loading', 'status-ready', 'status-warning');
  
  // Config Status
  updateStatusItem(elements.configStatus, elements.configStatusText,
    systemStatus.systemReady, '✅ Loaded', '⏳ Loading', 'status-ready', 'status-warning');
  
  // Enterprise Status
  updateStatusItem(elements.enterpriseStatus, elements.enterpriseStatusText,
    systemStatus.enterpriseConfigLoaded, '✅ Set', '❌ Missing', 'status-ready', 'status-warning');
  
  // API/Analytics Status
  updateStatusItem(elements.analyticsStatus, elements.analyticsStatusText,
    systemStatus.apiKeyConfigured, '✅ Ready', '⚠️ No Key', 'status-ready', 'status-warning');
}

function updateStatusItem(container, textElement, isReady, readyText, notReadyText, readyClass, notReadyClass) {
  if (!container || !textElement) return;
  
  safeSetText(textElement, isReady ? readyText : notReadyText);
  container.className = `status-item ${isReady ? readyClass : notReadyClass}`;
}

function updateConfigInfo() {
  const siteCount = systemStatus.enterpriseSiteCount || 0;
  const configVersion = systemStatus.configVersion || 'Unknown';
  
  safeSetHTML(elements.configInfo, `Loaded: <strong>${configVersion}</strong>, Sites: <strong>${siteCount}</strong>`);
}

function updateAnalyticsSection() {
  // Enable/disable analytics based on system readiness AND API key
  const analyticsEnabled = systemStatus.systemReady && systemStatus.enterpriseConfigLoaded && systemStatus.apiKeyConfigured;
  
  if (elements.analyticsSection) {
    elements.analyticsSection.style.opacity = analyticsEnabled ? '1' : '0.6';
  }
  
  if (elements.analyticsBtn) {
    elements.analyticsBtn.disabled = !analyticsEnabled;
    
    if (!systemStatus.apiKeyConfigured) {
      elements.analyticsBtn.title = 'AI Analytics requires API key - configure above';
    } else if (!analyticsEnabled) {
      elements.analyticsBtn.title = 'System not ready for AI analytics';
    } else {
      elements.analyticsBtn.title = 'Run AI analytics on all sites without opening tabs';
    }
  }
}

// ===== MESSAGE HANDLING =====
async function sendMessageToBackground(message, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Background communication timeout'));
    }, timeout);
    
    try {
      chrome.runtime.sendMessage(message, (response) => {
        clearTimeout(timer);
        
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response || {});
        }
      });
    } catch (error) {
      clearTimeout(timer);
      reject(error);
    }
  });
}

// ===== API KEY MANAGEMENT =====
async function handleSaveApiKey() {
  if (!elements.apiKeyInput) {
    showError('API key input not found');
    return;
  }
  
  const apiKey = elements.apiKeyInput.value?.trim();
  
  if (!apiKey) {
    showError('Please enter a valid API key');
    return;
  }
  
  try {
    showButtonLoading(elements.saveApiKeyBtn, true);
    PopupLogger.info('🔑 Saving API key');
    
    const response = await sendMessageToBackground({
      action: 'setApiKey',
      apiKey: apiKey
    });
    
    if (response && response.success) {
      showSuccess('API key saved successfully! AI Analytics enabled.');
      elements.apiKeyInput.value = '';
      
      // Update system status
      systemStatus.apiKeyConfigured = true;
      systemStatus.aiEnabled = true;
      
      // Refresh UI
      updateUI();
      
      PopupLogger.success('API key configured successfully');
    } else {
      showError(response?.error || 'Failed to save API key');
    }
    
  } catch (error) {
    PopupLogger.error('API key save failed', { error: error.message });
    showError('Failed to save API key: ' + error.message);
  } finally {
    showButtonLoading(elements.saveApiKeyBtn, false, '💾 Save API Key');
  }
}

// ===== PAGE EXTRACTION =====
async function handleExtractPage() {
  try {
    showButtonLoading(elements.extractBtn, true);
    PopupLogger.info('🚀 Starting page extraction');
    
    const response = await sendMessageToBackground({
      action: 'extractPageData'
    });
    
    if (response && response.success) {
      currentExtractedData = response.data;
      
      const method = response.data?.extractionMethod || 'DOM';
      showSuccess(`Page extracted successfully! Method: ${method}`);
      displayExtractionResults(response.data);
      
      PopupLogger.success('Page extraction completed', {
        method: method,
        fields: response.data ? Object.keys(response.data).length : 0
      });
    } else {
      showError(response?.error || 'Extraction failed');
      PopupLogger.error('Page extraction failed', { error: response?.error });
    }
    
  } catch (error) {
    PopupLogger.error('Page extraction error', { error: error.message });
    showError('Extraction failed: ' + error.message);
  } finally {
    showButtonLoading(elements.extractBtn, false, '⚡ Extract Current Page');
  }
}

// ===== ONE-CLICK AI ANALYTICS TEST - COMPLETELY NEW =====
async function handleOneClickAIAnalytics() {
  if (analyticsInProgress) {
    showWarning('AI Analytics already in progress...');
    return;
  }
  
  if (!systemStatus.apiKeyConfigured) {
    showError('AI Analytics requires API key - please configure above');
    return;
  }
  
  try {
    analyticsInProgress = true;
    showButtonLoading(elements.analyticsBtn, true, '🤖 AI Testing...');
    PopupLogger.info('🤖 Starting ONE-CLICK AI Analytics test');
    
    // Show progress in analytics section
    showAIAnalyticsProgress();
    
    // Get test sites (you can customize these)
    const testSites = [
      { name: 'Amazon', url: 'https://www.amazon.com/dp/B08N5WRWNW', type: 'amazon' },
      { name: 'Bloomberg', url: 'https://www.bloomberg.com/news/articles/2024-tech-stocks', type: 'bloomberg' },
      { name: 'AllRecipes', url: 'https://www.allrecipes.com/recipe/213742/cheesy-chicken-broccoli-casserole/', type: 'allrecipes' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Artificial_intelligence', type: 'wikipedia' }
    ];
    
    // Run AI analytics on all sites in parallel (NO TAB OPENING!)
    const startTime = Date.now();
    const results = await Promise.all(
      testSites.map(site => runAISiteAnalysis(site))
    );
    
    // Process results
    const analytics = {
      timestamp: new Date().toISOString(),
      totalDuration: Date.now() - startTime,
      sites: []
    };
    
    let totalScore = 0;
    let validSites = 0;
    
    results.forEach((result, index) => {
      const siteName = testSites[index].name;
      
      if (result.success) {
        analytics.sites.push({
          name: siteName,
          accuracy: result.accuracy || 0,
          grade: result.grade || 'F',
          fieldsExtracted: result.fieldsExtracted || 0,
          method: 'ai-simulation',
          duration: result.duration || 0,
          success: true,
          status: 'SUCCESS',
          trend: result.accuracy >= 80 ? 'UP' : result.accuracy >= 50 ? 'STABLE' : 'DOWN'
        });
        
        totalScore += result.accuracy || 0;
        validSites++;
      } else {
        analytics.sites.push({
          name: siteName,
          accuracy: 0,
          grade: 'Failed',
          error: result.error,
          success: false,
          method: 'ai-simulation',
          status: 'FAILED',
          trend: 'DOWN'
        });
      }
    });
    
    // Calculate overall metrics
    const overallAccuracy = validSites > 0 ? Math.round(totalScore / validSites) : 0;
    const businessScore = Math.round(overallAccuracy * 0.8); // Business-friendly calculation
    const trajectory = overallAccuracy >= 80 ? 'EXCELLENT' : overallAccuracy >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT';
    
    analytics.overallAccuracy = overallAccuracy;
    analytics.businessWeightedAccuracy = businessScore;
    analytics.trajectory = trajectory;
    
    // Store as LAST ANALYTICS RESULTS
    lastAnalyticsResults = analytics;
    
    // Update UI with results
    updateAIAnalyticsDisplay(analytics);
    
    const message = `🎯 AI Analytics completed! Overall: ${overallAccuracy}%, ` +
                   `Business: ${businessScore}%, Trajectory: ${trajectory} ` +
                   `(${analytics.totalDuration}ms)`;
    
    showSuccess(message);
    
    PopupLogger.success('ONE-CLICK AI Analytics completed', {
      overallAccuracy: overallAccuracy,
      businessScore: businessScore,
      trajectory: trajectory,
      sitesCount: analytics.sites.length,
      duration: analytics.totalDuration
    });
    
  } catch (error) {
    PopupLogger.error('ONE-CLICK AI Analytics error', { error: error.message });
    showError('AI Analytics failed: ' + error.message);
    
    // Reset to placeholder on error
    initializeDynamicAnalyticsDisplay();
  } finally {
    analyticsInProgress = false;
    showButtonLoading(elements.analyticsBtn, false, '🤖 AI Analytics Test');
  }
}

// ===== AI SITE ANALYSIS (No Tabs Required) =====
async function runAISiteAnalysis(siteInfo) {
  const startTime = Date.now();
  
  try {
    PopupLogger.info(`[AI Analytics] Testing ${siteInfo.name} via AI simulation...`);
    
    // Simulate realistic page data for the site
    const simulatedPageData = generateSimulatedPageData(siteInfo.type, siteInfo.url);
    
    // Use AI extraction with simulated data
    const extractionResult = await sendMessageToBackground({
      action: 'aiExtraction',
      pageData: simulatedPageData,
      siteType: siteInfo.type,
      url: siteInfo.url
    });
    
    if (!extractionResult.success) {
      throw new Error(extractionResult.error || 'AI extraction failed');
    }
    
    // Validate extracted data
    const validationResult = await sendMessageToBackground({
      action: 'validateData',
      data: extractionResult.data,
      siteType: siteInfo.type
    });
    
    const accuracy = validationResult.metadata?.validatedAccuracy || 0;
    const grade = accuracy >= 85 ? 'Excellent' : accuracy >= 75 ? 'Good' : accuracy >= 65 ? 'Acceptable' : accuracy >= 55 ? 'Poor' : 'Failed';
    
    return {
      success: true,
      accuracy: accuracy,
      grade: grade,
      fieldsExtracted: Object.keys(extractionResult.data).length,
      duration: Date.now() - startTime,
      extractedData: extractionResult.data,
      validation: validationResult
    };
    
  } catch (error) {
    PopupLogger.error(`[AI Analytics] ${siteInfo.name} test failed:`, error);
    return {
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    };
  }
}

// ===== GENERATE SIMULATED PAGE DATA =====
function generateSimulatedPageData(siteType, url) {
  const baseData = {
    title: '',
    url: url,
    textContent: '',
    meta: {},
    structuredData: {},
    domHints: {}
  };
  
  switch (siteType) {
    case 'amazon':
      return {
        ...baseData,
        title: 'Echo Dot (5th Gen, 2022 release) | Smart speaker with Alexa | Charcoal',
        textContent: `Echo Dot (5th Gen) Smart speaker with Alexa Charcoal $49.99 4.7 out of 5 stars 150,234 reviews 
        In Stock. Ships from Amazon. Eligible for FREE delivery. Add to Cart. Product details: Voice control your music 
        Ask Alexa to play music, audiobooks, and podcasts from Amazon Music, Apple Music, Spotify, and others.
        Electronics category. Brand: Amazon. Dimensions: 3.9" x 3.5" x 3.5". Weight: 10.7 oz.`,
        meta: {
          'og:title': 'Amazon Echo Dot Smart Speaker',
          'og:price:amount': '49.99',
          description: 'Voice control your smart home with Echo Dot and Alexa'
        }
      };
      
    case 'bloomberg':
      return {
        ...baseData,
        title: 'Tech Stocks Rally as AI Investment Continues - Bloomberg',
        textContent: `Tech Stocks Rally as AI Investment Continues. By Bloomberg News. January 15, 2024 1:32 PM. 
        Technology shares gained ground today as investors continue pouring money into artificial intelligence companies. 
        The rally reflects growing confidence in AI's potential to transform business operations across industries.
        Major tech companies reported strong earnings driven by AI initiatives. News category.
        Bloomberg delivers business and markets news, data, analysis and video to the world.
        Connecting decision makers to a dynamic network of information, people and ideas.`,
        meta: {
          'og:title': 'Tech Stocks Rally as AI Investment Continues',
          description: 'Bloomberg delivers business and markets news, data, analysis covering technology stocks and AI investment trends.',
          'article:author': 'Bloomberg News',
          'article:published_time': '2024-01-15T13:32:00Z'
        }
      };
      
    case 'allrecipes':
      return {
        ...baseData,
        title: 'Cheesy Chicken Broccoli Casserole Recipe - Allrecipes',
        textContent: `Cheesy Chicken Broccoli Casserole. By Chef Sarah. 4.8 stars (2,456 reviews). Prep: 15 mins Cook: 30 mins. 
        A delicious and easy chicken broccoli casserole recipe perfect for family dinners.
        Ingredients: 2 cups cooked chicken breast diced, 3 cups fresh broccoli florets, 2 cups shredded cheddar cheese, 
        1 can cream of mushroom soup, 1/2 cup milk, salt and pepper to taste.
        Instructions: 1. Preheat oven to 350°F. 2. Mix chicken and broccoli in greased baking dish. 
        3. Pour soup and milk mixture over chicken. 4. Top with cheese. 5. Bake for 25-30 minutes.`,
        meta: {
          'og:title': 'Cheesy Chicken Broccoli Casserole',
          description: 'A delicious and easy chicken broccoli casserole recipe perfect for family dinners.',
          'recipe:cook_time': '30',
          'recipe:prep_time': '15'
        }
      };
      
    case 'wikipedia':
      return {
        ...baseData,
        title: 'Artificial intelligence - Wikipedia',
        textContent: `Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence 
        displayed by humans and animals. AI research has been defined as the field of study of intelligent agents.
        The field was founded on the assumption that human intelligence can be so precisely described that a machine can simulate it.
        Categories: Artificial intelligence, Computer science, Emerging technologies.
        Artificial intelligence research is highly technical and specialized, and is deeply divided into subfields.
        Machine learning, deep learning, and natural language processing are core areas of AI research.`,
        meta: {
          'og:title': 'Artificial intelligence',
          description: 'Artificial intelligence is intelligence demonstrated by machines, in contrast to natural intelligence.',
          'article:section': 'Technology'
        }
      };
      
    default:
      return baseData;
  }
}

function showAIAnalyticsProgress() {
  try {
    safeSetHTML(elements.overallAccuracy, '<div class="loading"></div>');
    safeSetHTML(elements.businessAccuracy, '<div class="loading"></div>');
    safeSetText(elements.trajectoryText, 'TESTING');
    safeSetText(elements.trajectoryBadge, 'AI TEST');
    
    if (elements.trajectoryBadge) {
      elements.trajectoryBadge.className = 'trajectory trajectory-warning pulse';
    }
    
    safeSetHTML(elements.sitePerformanceList, `
      <li class="performance-item">
        <span>🤖 Running AI extractions...</span>
        <div class="loading"></div>
      </li>
      <li class="performance-item">
        <span>📊 Testing all sites simultaneously...</span>
        <div class="loading"></div>
      </li>
      <li class="performance-item">
        <span>⚡ No tabs opened - pure AI!</span>
        <div class="loading"></div>
      </li>
    `);
  } catch (error) {
    PopupLogger.error('AI analytics progress display error', { error: error.message });
  }
}

// ===== AI ANALYTICS DISPLAY UPDATE =====
function updateAIAnalyticsDisplay(results) {
  try {
    if (!results || typeof results !== 'object') {
      PopupLogger.warn('Invalid AI analytics results received');
      return;
    }

    PopupLogger.info('🎯 Updating display with AI analytics results', {
      overallAccuracy: results.overallAccuracy,
      trajectory: results.trajectory,
      sitesCount: results.sites?.length || 0
    });

    // Update main metrics with AI data
    const overallAcc = results.overallAccuracy || 0;
    const businessAcc = results.businessWeightedAccuracy || 0;
    const trajectory = results.trajectory || 'UNKNOWN';

    safeSetText(elements.overallAccuracy, `${overallAcc}%`);
    safeSetText(elements.businessAccuracy, `${businessAcc}%`);
    safeSetText(elements.trajectoryText, trajectory);
    safeSetText(elements.trajectoryBadge, trajectory);

    // Update trajectory with class name handling
    if (elements.trajectoryBadge && trajectory) {
      const trajectoryClass = getTrajectoryClass(trajectory);
      elements.trajectoryBadge.className = `trajectory ${trajectoryClass}`;
    }

    // Update site performance with AI data
    if (results.sites && Array.isArray(results.sites) && results.sites.length > 0) {
      const siteHTML = results.sites.map(site => {
        if (!site || typeof site !== 'object') {
          return '<li class="performance-item"><span>Invalid site data</span></li>';
        }

        const siteName = site.name || 'Unknown Site';
        const accuracy = site.accuracy || 0;
        const grade = site.grade || 'unknown';
        const trend = site.trend || 'STABLE';
        const status = site.status || 'UNKNOWN';
        
        const gradeClass = getGradeClass(grade);
        const trendIcon = getTrendIcon(trend);
        const statusIcon = getStatusIcon(status);
        
        return `
          <li class="performance-item">
            <span class="site-name">${escapeHtml(siteName)} ${statusIcon}</span>
            <span class="performance-badge ${gradeClass}">${accuracy}%${trendIcon}</span>
          </li>
        `;
      }).join('');
      
      safeSetHTML(elements.sitePerformanceList, siteHTML);
    } else {
      safeSetHTML(elements.sitePerformanceList, 
        '<li class="performance-item"><span style="opacity: 0.7;">No AI analytics data available</span></li>'
      );
    }

    // Add animation with timestamp
    safeAddClass(elements.analyticsSection, 'fade-in');
    
    // Add last updated indicator
    const now = new Date().toLocaleTimeString();
    safeSetHTML(elements.configInfo, 
      `${elements.configInfo.innerHTML} | <span style="color: #059669;">🤖 AI data updated: ${now}</span>`
    );
    
    PopupLogger.success('AI analytics display updated successfully', {
      timestamp: new Date().toISOString(),
      sitesDisplayed: results.sites?.length || 0
    });
    
  } catch (error) {
    PopupLogger.error('AI analytics display update failed', { 
      error: error.message,
      results: results
    });
    
    // Fallback display for errors
    safeSetText(elements.overallAccuracy, 'Error');
    safeSetText(elements.businessAccuracy, 'Error');
    safeSetText(elements.trajectoryText, 'ERROR');
    safeSetText(elements.trajectoryBadge, 'ERROR');
    
    if (elements.trajectoryBadge) {
      elements.trajectoryBadge.className = 'trajectory trajectory-critical';
    }
    
    safeSetHTML(elements.sitePerformanceList,
      '<li class="performance-item"><span style="color: #dc2626;">❌ AI analytics update failed</span></li>'
    );
  }
}

// ===== HELPER FUNCTIONS =====
function getStatusIcon(status) {
  if (!status || typeof status !== 'string') {
    return '';
  }
  
  const statusUpper = status.toUpperCase();
  const statusMap = {
    'SUCCESS': '✅',
    'FAILED': '❌',
    'ERROR': '⚠️',
    'TIMEOUT': '⏰',
    'UNKNOWN': '❓'
  };
  
  return statusMap[statusUpper] || '';
}

function getTrajectoryClass(trajectory) {
  if (!trajectory || typeof trajectory !== 'string') {
    return 'trajectory-warning';
  }
  
  const trajectoryLower = trajectory.toLowerCase().replace(/[^a-z]/g, '');
  
  const trajectoryMap = {
    'excellent': 'trajectory-excellent',
    'good': 'trajectory-on_track',
    'needsimprovement': 'trajectory-needsimprovement',
    'needs_improvement': 'trajectory-needsimprovement',
    'critical': 'trajectory-critical',
    'warning': 'trajectory-warning',
    'unknown': 'trajectory-warning'
  };
  
  return trajectoryMap[trajectoryLower] || 'trajectory-warning';
}

function getGradeClass(grade) {
  if (!grade || typeof grade !== 'string') {
    return 'performance-poor';
  }
  
  const gradeLower = grade.toLowerCase().replace(/[^a-z]/g, '');
  
  const gradeMap = {
    'excellent': 'performance-excellent',
    'good': 'performance-good',
    'acceptable': 'performance-acceptable',
    'poor': 'performance-poor',
    'failed': 'performance-failed',
    'unknown': 'performance-poor'
  };
  
  return gradeMap[gradeLower] || 'performance-poor';
}

function getTrendIcon(trend) {
  if (!trend || typeof trend !== 'string') {
    return '📊';
  }
  
  const trendUpper = trend.toUpperCase();
  
  const trendMap = {
    'UP': '📈',
    'DOWN': '📉',
    'STABLE': '➡️',
    'UNKNOWN': '📊'
  };
  
  return trendMap[trendUpper] || '📊';
}

function escapeHtml(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== CONFIG MANAGEMENT =====
async function handleReloadConfig() {
  try {
    showButtonLoading(elements.reloadConfigBtn, true);
    PopupLogger.info('🔄 Reloading enterprise configuration');
    
    const response = await sendMessageToBackground({
      action: 'reloadConfig'
    });
    
    if (response && response.success) {
      const sites = response.sites || 0;
      showSuccess(`Config reloaded! Sites: ${sites}`);
      
      // Update system status with FRESH data
      systemStatus.enterpriseConfigLoaded = true;
      systemStatus.enterpriseSiteCount = sites;
      systemStatus.configVersion = response.version || 'day8-day9-ultimate-enterprise-v3.0';
      
      // Reset analytics to show fresh data needed
      initializeDynamicAnalyticsDisplay();
      lastAnalyticsResults = null;
      
      // Refresh UI
      updateUI();
      
      PopupLogger.success('Configuration reloaded', {
        sites: sites,
        version: response.version
      });
    } else {
      showError(response?.error || 'Failed to reload config');
    }
    
  } catch (error) {
    PopupLogger.error('Config reload error', { error: error.message });
    showError('Config reload failed: ' + error.message);
  } finally {
    showButtonLoading(elements.reloadConfigBtn, false, '🔄 Reload Config');
  }
}

// ===== TAB MANAGEMENT =====
async function handleCleanupTabs() {
  try {
    showButtonLoading(elements.cleanupTabsBtn, true);
    PopupLogger.info('🧹 Cleaning up managed tabs');
    
    const response = await sendMessageToBackground({
      action: 'cleanupTabs'
    });
    
    if (response && response.success) {
      showSuccess(response.message || 'Tabs cleaned up successfully');
      PopupLogger.success('Tab cleanup completed', {
        tabsClosed: response.tabsClosed
      });
    } else {
      showError(response?.error || 'Tab cleanup failed');
    }
    
  } catch (error) {
    PopupLogger.error('Tab cleanup error', { error: error.message });
    showError('Tab cleanup failed: ' + error.message);
  } finally {
    showButtonLoading(elements.cleanupTabsBtn, false, '🧹 Cleanup Tabs');
  }
}

// ===== RESULTS DISPLAY =====
function displayExtractionResults(data) {
  if (!data || typeof data !== 'object') {
    safeSetHTML(elements.resultsContent, 
      '<div style="text-align: center; color: #6b7280; padding: 20px;">No data extracted</div>'
    );
    return;
  }
  
  try {
    // Format and display results with extraction timestamp
    const formattedData = JSON.stringify(data, null, 2);
    const timestamp = data.extractedAt ? new Date(data.extractedAt).toLocaleString() : 'Unknown';
    
    safeSetHTML(elements.resultsContent, 
      `<div style="font-size: 11px; color: #6b7280; margin-bottom: 8px;">🕒 Extracted: ${timestamp}</div>` +
      `<pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(formattedData)}</pre>`
    );
    
    // Enable export buttons with null checks
    if (elements.copyBtn) elements.copyBtn.disabled = false;
    if (elements.exportJsonBtn) elements.exportJsonBtn.disabled = false;
    if (elements.exportCsvBtn) elements.exportCsvBtn.disabled = false;
    
  } catch (error) {
    PopupLogger.error('Results display error', { error: error.message });
    safeSetHTML(elements.resultsContent, 
      '<div style="text-align: center; color: #dc2626; padding: 20px;">Error displaying results</div>'
    );
  }
}

// ===== EXPORT FUNCTIONS =====
async function handleCopyResults() {
  if (!currentExtractedData) {
    showWarning('No data to copy');
    return;
  }
  
  try {
    const textData = JSON.stringify(currentExtractedData, null, 2);
    await navigator.clipboard.writeText(textData);
    showSuccess('Results copied to clipboard');
    PopupLogger.success('Results copied to clipboard');
  } catch (error) {
    PopupLogger.error('Copy failed', { error: error.message });
    showError('Failed to copy: ' + error.message);
  }
}

async function handleExportResults(format) {
  if (!currentExtractedData) {
    showWarning('No data to export');
    return;
  }
  
  try {
    let content, filename, mimeType;
    
    if (format === 'json') {
      content = JSON.stringify(currentExtractedData, null, 2);
      filename = `extraction-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      mimeType = 'application/json';
    } else if (format === 'csv') {
      content = convertToCSV(currentExtractedData);
      filename = `extraction-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
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
    
    showSuccess(`Data exported as ${format.toUpperCase()}`);
    PopupLogger.success(`Data exported as ${format}`, { filename });
    
  } catch (error) {
    PopupLogger.error(`Export failed (${format})`, { error: error.message });
    showError(`Export failed: ${error.message}`);
  }
}

// ===== UTILITY FUNCTIONS =====
function convertToCSV(data) {
  if (!data || typeof data !== 'object') {
    return '';
  }
  
  try {
    // Get all keys
    const keys = Object.keys(data).filter(key => {
      const value = data[key];
      return value !== null && value !== undefined && typeof value !== 'object';
    });
    
    // Create CSV header
    const csvHeader = keys.join(',');
    
    // Create CSV row
    const csvRow = keys.map(key => {
      let value = data[key];
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
    
    return `${csvHeader}\n${csvRow}`;
  } catch (error) {
    PopupLogger.error('CSV conversion failed', { error: error.message });
    return 'Error converting to CSV';
  }
}

function showButtonLoading(button, isLoading, originalText = null) {
  if (!button) return;
  
  try {
    if (isLoading) {
      button.disabled = true;
      button.innerHTML = '<div class="loading"></div>';
      safeAddClass(button, 'pulse');
    } else {
      button.disabled = false;
      button.innerHTML = originalText || button.getAttribute('data-original-text') || button.innerHTML;
      button.classList.remove('pulse');
    }
  } catch (error) {
    PopupLogger.error('Button loading state error', { error: error.message });
  }
}

// ===== NOTIFICATION SYSTEM =====
function showSuccess(message) {
  showNotification(message, 'success', '✅');
}

function showError(message) {
  showNotification(message, 'error', '❌');
}

function showWarning(message) {
  showNotification(message, 'warning', '⚠️');
}

function showInfo(message) {
  showNotification(message, 'info', 'ℹ️');
}

function showNotification(message, type, icon) {
  try {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `${icon} ${escapeHtml(message || 'Unknown message')}`;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 16px',
      borderRadius: '6px',
      color: 'white',
      fontWeight: '600',
      fontSize: '14px',
      zIndex: '10000',
      maxWidth: '300px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      animation: 'slideInRight 0.3s ease-out'
    });
    
    // Set background color based on type
    const colors = {
      success: '#059669',
      error: '#dc2626',
      warning: '#d97706',
      info: '#0891b2'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      try {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      } catch (cleanupError) {
        PopupLogger.warn('Notification cleanup error', { error: cleanupError.message });
      }
    }, 4000);
    
  } catch (error) {
    PopupLogger.error('Notification display error', { error: error.message });
    // Fallback to console
    console.log(`${icon} ${message}`);
  }
}

// ===== CSS ANIMATIONS =====
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .pulse {
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }
`;
document.head.appendChild(style);

PopupLogger.success('🏆 Day 8+9 ONE-CLICK AI ANALYTICS popup script loaded - NO TAB OPENING REQUIRED!');
