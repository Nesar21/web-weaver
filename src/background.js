// Day 8+9: ULTIMATE ENTERPRISE CHAMPION EDITION - Smart Tab Management & Advanced Analytics
// /src/background.js

console.log('[Background] Day 8+9 ULTIMATE ENTERPRISE CHAMPION system loading - Smart Tab Management & Advanced Analytics');

// ===== CORE CONFIGURATION =====
const DAY8_VERSION = 'day8-day9-ultimate-enterprise-champion';

// Enhanced AI Configuration with SMART TAB MANAGEMENT
let AI_CONFIG = {
  model: 'gemini-1.5-flash-8b-001',
  maxTokens: 3000,
  temperature: 0.1,
  aiTimeout: 25000,
  tabTimeout: 6000,
  maxConcurrentTabs: 8,
  apiKey: null,
  day8Version: DAY8_VERSION,
  modulesLoaded: true,
  
  // Enterprise config integration
  enterpriseConfig: null,
  configVersion: null,
  
  // AI Intelligence Settings
  useAIExtraction: true,
  fallbackToDom: true,
  intelligentParsing: true,
  contextAwareness: true,
  
  // Real Analytics Settings
  realTimeAnalytics: true,
  liveExtractionTesting: true,
  dynamicPerformanceTracking: true,
  
  // Smart Tab Management
  smartTabManagement: true,
  autoCloseTestTabs: true,
  tabCleanupDelay: 2000,
  maxTabLifetime: 30000,
  
  // Enhanced logging
  logging: {
    throttleModuleLoads: false,
    maxLogsPerSecond: 15,
    lastLogTime: 0,
    timestampCache: null,
    timestampCacheExpiry: 100
  },
  
  // Performance caching
  cache: {
    schemaMappings: new Map(),
    siteConfigs: new Map(),
    apiValidation: null,
    configTimestamp: null,
    configExpiry: 3600000,
    persistenceQueue: new Set(),
    extractionResults: new Map(),
    tabRegistry: new Map() // Track open tabs
  }
};

// ===== SMART TAB MANAGER =====
class SmartTabManager {
  constructor() {
    this.openTabs = new Set();
    this.tabCreationTimes = new Map();
    this.tabCleanupTimeouts = new Map();
    this.maxTabAge = AI_CONFIG.maxTabLifetime;
  }

  async createTab(url, options = {}) {
    try {
      BackgroundLogger.info('📄 Creating smart-managed tab', { url });
      
      const tab = await chrome.tabs.create({
        url: url,
        active: false,
        ...options
      });
      
      // Register tab
      this.openTabs.add(tab.id);
      this.tabCreationTimes.set(tab.id, Date.now());
      
      // Set auto-cleanup timeout
      if (AI_CONFIG.autoCloseTestTabs) {
        const timeoutId = setTimeout(() => {
          this.closeTab(tab.id, 'timeout');
        }, this.maxTabAge);
        
        this.tabCleanupTimeouts.set(tab.id, timeoutId);
      }
      
      BackgroundLogger.info('✅ Tab created and registered', { 
        tabId: tab.id, 
        totalOpenTabs: this.openTabs.size 
      });
      
      return tab;
      
    } catch (error) {
      BackgroundLogger.error('Failed to create smart-managed tab', { 
        error: error.message,
        url 
      });
      throw error;
    }
  }

  async closeTab(tabId, reason = 'manual') {
    try {
      if (!this.openTabs.has(tabId)) {
        BackgroundLogger.warn('Attempted to close unregistered tab', { tabId });
        return;
      }
      
      BackgroundLogger.info('🗑️ Closing smart-managed tab', { 
        tabId, 
        reason,
        ageMs: Date.now() - (this.tabCreationTimes.get(tabId) || Date.now())
      });
      
      // Clear timeout if exists
      const timeoutId = this.tabCleanupTimeouts.get(tabId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.tabCleanupTimeouts.delete(tabId);
      }
      
      // Close the tab
      try {
        await chrome.tabs.remove(tabId);
      } catch (tabError) {
        // Tab might already be closed
        BackgroundLogger.warn('Tab already closed or inaccessible', { 
          tabId, 
          error: tabError.message 
        });
      }
      
      // Clean up registry
      this.openTabs.delete(tabId);
      this.tabCreationTimes.delete(tabId);
      
      BackgroundLogger.info('✅ Tab closed and unregistered', { 
        tabId, 
        remainingTabs: this.openTabs.size 
      });
      
    } catch (error) {
      BackgroundLogger.error('Failed to close smart-managed tab', { 
        error: error.message,
        tabId 
      });
    }
  }

  async closeAllTabs(reason = 'cleanup') {
    BackgroundLogger.info('🧹 Closing all smart-managed tabs', { 
      count: this.openTabs.size,
      reason 
    });
    
    const tabIds = Array.from(this.openTabs);
    
    for (const tabId of tabIds) {
      await this.closeTab(tabId, reason);
      // Small delay between closures
      await this.delay(100);
    }
    
    BackgroundLogger.info('✅ All smart-managed tabs closed');
  }

  getOpenTabsInfo() {
    return {
      count: this.openTabs.size,
      tabs: Array.from(this.openTabs).map(tabId => ({
        tabId,
        age: Date.now() - (this.tabCreationTimes.get(tabId) || Date.now()),
        hasCleanupTimeout: this.tabCleanupTimeouts.has(tabId)
      }))
    };
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global tab manager instance
const tabManager = new SmartTabManager();

// ===== ENHANCED REAL ANALYTICS ENGINE =====
class EnhancedRealAnalyticsEngine {
  constructor(config) {
    this.config = config;
    this.extractionHistory = [];
    this.performanceMetrics = [];
    this.analyticsId = `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.tabManager = tabManager;
  }

  async runAdvancedAnalyticsTest() {
    let createdTabs = [];
    
    try {
      BackgroundLogger.info('🔍 Starting ADVANCED analytics test with smart tab management', {
        analyticsId: this.analyticsId,
        aiEnabled: !!this.config.apiKey
      });

      // Get test sites
      const testSites = this.getEnhancedTestSites();
      
      // Pre-analytics cleanup
      await this.tabManager.closeAllTabs('pre-analytics');
      
      // Run extractions with smart tab management
      const extractionResults = [];
      const performanceData = [];
      
      for (const testSite of testSites) {
        try {
          BackgroundLogger.info(`🧪 Testing site: ${testSite.name}`, { 
            url: testSite.testUrl,
            type: testSite.type 
          });
          
          const result = await this.runSmartExtraction(testSite);
          extractionResults.push(result);
          performanceData.push(result.performance);
          
          // Intelligent delay between extractions
          await this.intelligentDelay(testSite.type);
          
        } catch (error) {
          BackgroundLogger.warn('Test site extraction failed', { 
            site: testSite.name, 
            error: error.message 
          });
          
          // Add comprehensive failed result
          extractionResults.push({
            site: testSite.name,
            siteType: testSite.type,
            domain: testSite.domain,
            businessCritical: testSite.businessCritical,
            success: false,
            error: error.message,
            accuracy: 0,
            grade: 'Failed',
            trend: 'DOWN',
            performance: {
              duration: 0,
              startTime: Date.now(),
              endTime: Date.now(),
              extractionMethod: 'failed',
              aiEnabled: !!this.config.apiKey,
              errorType: this.categorizeError(error.message)
            },
            timestamp: new Date().toISOString(),
            analyticsId: this.analyticsId
          });
        }
      }

      // Post-analytics cleanup
      await this.tabManager.closeAllTabs('post-analytics');
      
      // Generate comprehensive analytics report
      const analyticsReport = await this.generateEnhancedAnalyticsReport(extractionResults, performanceData);
      
      // Store results for historical analysis
      this.storeAnalyticsResults(analyticsReport);
      
      BackgroundLogger.info('✅ Advanced analytics test completed', {
        analyticsId: this.analyticsId,
        totalTests: extractionResults.length,
        successfulTests: extractionResults.filter(r => r.success).length,
        tabsCreated: createdTabs.length,
        finalTabCount: this.tabManager.getOpenTabsInfo().count
      });

      return analyticsReport;

    } catch (error) {
      BackgroundLogger.error('Advanced analytics test failed', { 
        error: error.message,
        analyticsId: this.analyticsId
      });
      
      // Emergency cleanup
      await this.tabManager.closeAllTabs('emergency');
      
      throw error;
    }
  }

  getEnhancedTestSites() {
    // Enhanced test sites with better URLs and configurations
    if (this.config.enterpriseConfig?.sites) {
      return Object.entries(this.config.enterpriseConfig.sites).map(([domain, config]) => ({
        name: config.displayName,
        domain: domain,
        type: config.type,
        businessCritical: config.businessCritical,
        testUrl: this.getOptimizedTestUrl(config.type, domain),
        expectedElements: config.requiredFields || [],
        timeout: config.extractionTimeout || 10000
      }));
    }
    
    // Enhanced fallback test sites with better URLs
    return [
      {
        name: 'Amazon',
        domain: 'amazon.com',
        type: 'amazon',
        businessCritical: true,
        testUrl: 'https://www.amazon.com/dp/B08N5WRWNW',
        expectedElements: ['title', 'price', 'description', 'availability'],
        timeout: 15000
      },
      {
        name: 'Bloomberg',
        domain: 'bloomberg.com', 
        type: 'bloomberg',
        businessCritical: true,
        testUrl: 'https://www.bloomberg.com/news/articles/2024-01-15/tech-stocks-surge-ai-optimism',
        expectedElements: ['title', 'author', 'description', 'category'],
        timeout: 12000
      },
      {
        name: 'AllRecipes',
        domain: 'allrecipes.com',
        type: 'allrecipes', 
        businessCritical: false,
        testUrl: 'https://www.allrecipes.com/recipe/213742/cheesy-chicken-broccoli-casserole',
        expectedElements: ['title', 'ingredients', 'instructions', 'cooktime'],
        timeout: 10000
      },
      {
        name: 'Wikipedia',
        domain: 'en.wikipedia.org',
        type: 'wikipedia',
        businessCritical: false,
        testUrl: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
        expectedElements: ['title', 'description', 'maincontentsummary'],
        timeout: 8000
      }
    ];
  }

  getOptimizedTestUrl(type, domain) {
    const optimizedUrls = {
      amazon: `https://${domain}/dp/B08N5WRWNW`,
      bloomberg: `https://${domain}/news/articles/2024-01-15/tech-stocks-surge-ai-optimism`,
      allrecipes: `https://${domain}/recipe/213742/cheesy-chicken-broccoli-casserole`,
      wikipedia: `https://${domain}/wiki/Artificial_intelligence`,
      medium: `https://${domain}/@techwriter/the-future-of-ai-development-2024`,
      generic: `https://${domain}`
    };
    
    return optimizedUrls[type] || optimizedUrls.generic;
  }

  async runSmartExtraction(testSite) {
    const startTime = Date.now();
    let tab = null;
    
    try {
      BackgroundLogger.info('🚀 Starting smart extraction', { 
        site: testSite.name,
        url: testSite.testUrl 
      });
      
      // Create tab with smart management
      tab = await this.tabManager.createTab(testSite.testUrl, {
        active: false
      });
      
      // Wait for page to load with site-specific timeout
      await this.waitForTabLoad(tab.id, testSite.timeout);
      
      // Create enhanced extractor
      const extractor = new EnhancedIntelligentExtractor(this.config);
      
      // Run extraction with comprehensive error handling
      const extractionResult = await extractor.performIntelligentExtraction(tab.id, testSite.testUrl);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Calculate enhanced accuracy
      const accuracy = this.calculateEnhancedAccuracy(extractionResult, testSite);
      
      // Close tab immediately after extraction
      await this.tabManager.closeTab(tab.id, 'extraction-complete');
      tab = null; // Mark as handled
      
      const result = {
        site: testSite.name,
        siteType: testSite.type,
        domain: testSite.domain,
        businessCritical: testSite.businessCritical,
        success: !extractionResult.error,
        extractedData: extractionResult,
        accuracy: accuracy,
        grade: this.getPerformanceGrade(accuracy),
        trend: this.calculateTrend(testSite.name, accuracy),
        performance: {
          duration: duration,
          startTime: startTime,
          endTime: endTime,
          extractionMethod: extractionResult.extractionMethod || 'unknown',
          aiEnabled: !!this.config.apiKey,
          tabLoadTime: duration < testSite.timeout ? duration : testSite.timeout,
          siteComplexity: this.calculateSiteComplexity(extractionResult),
          dataQuality: this.assessDataQuality(extractionResult, testSite.expectedElements)
        },
        timestamp: new Date().toISOString(),
        analyticsId: this.analyticsId,
        
        // Enhanced metadata
        extractionMetadata: {
          expectedElements: testSite.expectedElements.length,
          extractedElements: this.countExtractedElements(extractionResult),
          completeness: this.calculateCompleteness(extractionResult, testSite.expectedElements),
          reliability: this.calculateReliability(extractionResult),
          smartTabManaged: true
        }
      };
      
      BackgroundLogger.info('✅ Smart extraction completed', {
        site: testSite.name,
        accuracy: accuracy,
        duration: duration,
        method: extractionResult.extractionMethod
      });
      
      return result;

    } catch (error) {
      // Ensure tab cleanup on error
      if (tab) {
        await this.tabManager.closeTab(tab.id, 'extraction-error');
      }
      
      throw new Error(`Smart extraction failed for ${testSite.name}: ${error.message}`);
    }
  }

  async waitForTabLoad(tabId, maxWait = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let checkCount = 0;
      
      const checkTab = () => {
        checkCount++;
        
        chrome.tabs.get(tabId, (tab) => {
          if (chrome.runtime.lastError) {
            reject(new Error(`Tab access error: ${chrome.runtime.lastError.message}`));
            return;
          }
          
          const elapsed = Date.now() - startTime;
          
          if (tab.status === 'complete') {
            BackgroundLogger.info('📄 Tab loaded successfully', {
              tabId,
              loadTime: elapsed,
              checks: checkCount
            });
            resolve();
            return;
          }
          
          if (elapsed > maxWait) {
            reject(new Error(`Tab load timeout after ${elapsed}ms`));
            return;
          }
          
          // Exponential backoff for checking
          const delay = Math.min(500 * Math.pow(1.2, checkCount), 2000);
          setTimeout(checkTab, delay);
        });
      };
      
      checkTab();
    });
  }

  calculateEnhancedAccuracy(extractionResult, testSite) {
    if (extractionResult.error) {
      return 0;
    }

    // Use enterprise score if available
    if (extractionResult.enterpriseScore) {
      return extractionResult.enterpriseScore.percentage;
    }

    // Enhanced calculation based on expected elements
    const expectedElements = testSite.expectedElements || [];
    const extractedData = extractionResult;
    
    let totalWeight = 0;
    let achievedWeight = 0;
    
    // Weighted scoring system
    const fieldWeights = {
      title: 3,
      description: 2,
      price: 3,
      author: 2,
      category: 1,
      ingredients: 3,
      instructions: 3,
      maincontentsummary: 2
    };
    
    expectedElements.forEach(field => {
      const weight = fieldWeights[field] || 1;
      totalWeight += weight;
      
      const value = extractedData[field];
      if (value && value !== null && value !== '' && value !== 'null') {
        // Quality-based scoring
        const quality = this.assessFieldQuality(field, value);
        achievedWeight += weight * quality;
      }
    });
    
    const baseAccuracy = totalWeight > 0 ? (achievedWeight / totalWeight) * 100 : 0;
    
    // Bonus for AI extraction
    const aiBonus = extractionResult.extractionMethod === 'ai' ? 5 : 0;
    
    // Penalty for errors or warnings
    const errorPenalty = extractionResult.warnings ? 5 : 0;
    
    return Math.round(Math.max(0, Math.min(100, baseAccuracy + aiBonus - errorPenalty)));
  }

  assessFieldQuality(fieldName, value) {
    if (!value || value === 'null' || value === '') {
      return 0;
    }
    
    // Field-specific quality assessment
    switch (fieldName) {
      case 'title':
        return value.length > 10 && value.length < 200 ? 1 : 0.7;
      case 'description':
        return value.length > 20 && value.length < 500 ? 1 : 0.8;
      case 'price':
        return /\$[\d,]+\.?\d*/.test(value) ? 1 : 0.6;
      case 'ingredients':
      case 'instructions':
        return Array.isArray(value) && value.length > 0 ? 1 : 0.7;
      default:
        return value.toString().trim().length > 3 ? 1 : 0.5;
    }
  }

  calculateSiteComplexity(extractionResult) {
    let complexity = 'LOW';
    
    const dataPoints = Object.keys(extractionResult).length;
    const hasStructuredData = extractionResult.structuredData && 
      Object.keys(extractionResult.structuredData).length > 0;
    
    if (dataPoints > 15 || hasStructuredData) {
      complexity = 'HIGH';
    } else if (dataPoints > 8) {
      complexity = 'MEDIUM';
    }
    
    return complexity;
  }

  assessDataQuality(extractionResult, expectedElements) {
    if (!expectedElements || expectedElements.length === 0) {
      return 'UNKNOWN';
    }
    
    const filledElements = expectedElements.filter(field => {
      const value = extractionResult[field];
      return value && value !== null && value !== '' && value !== 'null';
    });
    
    const qualityRatio = filledElements.length / expectedElements.length;
    
    if (qualityRatio >= 0.9) return 'EXCELLENT';
    if (qualityRatio >= 0.75) return 'GOOD';
    if (qualityRatio >= 0.5) return 'ACCEPTABLE';
    return 'POOR';
  }

  countExtractedElements(extractionResult) {
    return Object.keys(extractionResult).filter(key => {
      const value = extractionResult[key];
      return value && value !== null && value !== '' && value !== 'null';
    }).length;
  }

  calculateCompleteness(extractionResult, expectedElements) {
    if (!expectedElements || expectedElements.length === 0) {
      return 100;
    }
    
    const filledElements = expectedElements.filter(field => {
      const value = extractionResult[field];
      return value && value !== null && value !== '' && value !== 'null';
    });
    
    return Math.round((filledElements.length / expectedElements.length) * 100);
  }

  calculateReliability(extractionResult) {
    let reliabilityScore = 100;
    
    // Deduct for errors
    if (extractionResult.error) {
      reliabilityScore -= 50;
    }
    
    // Deduct for warnings
    if (extractionResult.warnings) {
      reliabilityScore -= 15;
    }
    
    // Bonus for AI extraction
    if (extractionResult.extractionMethod === 'ai') {
      reliabilityScore += 10;
    }
    
    // Bonus for structured data
    if (extractionResult.structuredData && Object.keys(extractionResult.structuredData).length > 0) {
      reliabilityScore += 5;
    }
    
    return Math.max(0, Math.min(100, reliabilityScore));
  }

  async intelligentDelay(siteType) {
    // Site-specific delays to avoid rate limiting
    const delays = {
      amazon: 1500,
      bloomberg: 1000,
      wikipedia: 500,
      allrecipes: 750,
      generic: 1000
    };
    
    const delay = delays[siteType] || delays.generic;
    await this.delay(delay);
  }

  categorizeError(errorMessage) {
    const errorLower = errorMessage.toLowerCase();
    
    if (errorLower.includes('timeout')) return 'TIMEOUT';
    if (errorLower.includes('network')) return 'NETWORK';
    if (errorLower.includes('tab')) return 'TAB_MANAGEMENT';
    if (errorLower.includes('permission')) return 'PERMISSION';
    if (errorLower.includes('parsing')) return 'PARSING';
    
    return 'UNKNOWN';
  }

  calculateTrend(siteName, currentAccuracy) {
    // Get historical data for this site
    const siteHistory = this.extractionHistory
      .filter(result => result.site === siteName)
      .slice(-5); // Last 5 results
    
    if (siteHistory.length < 2) {
      return 'STABLE';
    }
    
    const previousAccuracy = siteHistory[siteHistory.length - 1].accuracy;
    const difference = currentAccuracy - previousAccuracy;
    
    if (difference > 5) return 'UP';
    if (difference < -5) return 'DOWN';
    return 'STABLE';
  }

  getPerformanceGrade(accuracy) {
    if (accuracy >= 95) return 'Excellent';
    if (accuracy >= 85) return 'Good';
    if (accuracy >= 70) return 'Acceptable';
    if (accuracy >= 50) return 'Poor';
    return 'Failed';
  }

  async generateEnhancedAnalyticsReport(extractionResults, performanceData) {
    const successfulExtractions = extractionResults.filter(r => r.success);
    const businessCriticalResults = extractionResults.filter(r => r.businessCritical);
    const aiExtractions = extractionResults.filter(r => r.extractedData?.extractionMethod === 'ai');
    const domExtractions = extractionResults.filter(r => r.extractedData?.extractionMethod === 'intelligent-dom');
    
    // Calculate comprehensive metrics
    const overallAccuracy = successfulExtractions.length > 0 
      ? Math.round(successfulExtractions.reduce((sum, r) => sum + r.accuracy, 0) / successfulExtractions.length)
      : 0;
      
    const businessAccuracy = businessCriticalResults.length > 0
      ? Math.round(businessCriticalResults.reduce((sum, r) => sum + (r.success ? r.accuracy : 0), 0) / businessCriticalResults.length)
      : 0;
    
    const averageLatency = performanceData.length > 0
      ? Math.round(performanceData.reduce((sum, p) => sum + p.duration, 0) / performanceData.length)
      : 0;
    
    // AI vs DOM performance comparison
    const aiAvgAccuracy = aiExtractions.length > 0 
      ? aiExtractions.reduce((sum, r) => sum + r.accuracy, 0) / aiExtractions.length 
      : 0;
    const domAvgAccuracy = domExtractions.length > 0 
      ? domExtractions.reduce((sum, r) => sum + r.accuracy, 0) / domExtractions.length 
      : 0;
    
    const aiEnhancement = aiAvgAccuracy - domAvgAccuracy;
    
    // Determine trajectory
    let trajectory = 'UNKNOWN';
    if (overallAccuracy >= 90) trajectory = 'EXCELLENT';
    else if (overallAccuracy >= 80) trajectory = 'ON_TRACK';
    else if (overallAccuracy >= 70) trajectory = 'NEEDS_IMPROVEMENT';
    else trajectory = 'CRITICAL';
    
    // Generate predictions
    const predictions = this.generateSmartPredictions(overallAccuracy, trajectory, aiEnhancement);
    
    // Detect anomalies and issues
    const anomalies = this.detectPerformanceAnomalies(extractionResults);
    const issues = this.detectSystemIssues(extractionResults);
    
    // Generate intelligent recommendations
    const recommendations = this.generateIntelligentRecommendations(extractionResults, aiEnhancement);
    
    const report = {
      // Real-time metrics
      overallAccuracy: overallAccuracy,
      businessWeightedAccuracy: businessAccuracy,
      trajectory: trajectory,
      
      // AI Analysis
      aiEnhancement: Math.round(aiEnhancement * 10) / 10,
      aiExtractionsCount: aiExtractions.length,
      domExtractionsCount: domExtractions.length,
      aiEffectiveness: aiEnhancement > 0 ? 'POSITIVE' : aiEnhancement < -5 ? 'NEGATIVE' : 'NEUTRAL',
      
      // Performance metrics
      averageLatency: averageLatency,
      totalExtractions: extractionResults.length,
      successfulExtractions: successfulExtractions.length,
      failureRate: Math.round((1 - successfulExtractions.length / extractionResults.length) * 100),
      
      // Quality metrics
      averageCompleteness: this.calculateAverageCompleteness(extractionResults),
      averageReliability: this.calculateAverageReliability(extractionResults),
      dataQualityDistribution: this.calculateDataQualityDistribution(extractionResults),
      
      // Predictions
      prediction: predictions,
      
      // Site-specific results with enhanced data
      sites: extractionResults.map(result => ({
        name: result.site,
        accuracy: result.accuracy,
        grade: result.grade,
        trend: result.trend,
        aiEnhanced: result.extractedData?.extractionMethod === 'ai',
        businessCritical: result.businessCritical,
        latency: result.performance?.duration || 0,
        status: result.success ? 'SUCCESS' : 'FAILED',
        completeness: result.extractionMetadata?.completeness || 0,
        reliability: result.extractionMetadata?.reliability || 0,
        dataQuality: result.performance?.dataQuality || 'UNKNOWN',
        complexity: result.performance?.siteComplexity || 'UNKNOWN',
        errorType: result.performance?.errorType
      })),
      
      // Enhanced Analytics metadata
      analytics: {
        anomaliesDetected: anomalies.length,
        issuesDetected: issues.length,
        performanceCategory: this.getOverallPerformanceCategory(overallAccuracy, businessAccuracy),
        aiPowered: !!this.config.apiKey,
        extractionMethod: this.config.apiKey ? 'AI-Enhanced' : 'Intelligent DOM',
        configVersion: this.config.configVersion,
        realTimeAnalysis: true,
        liveExtractionTesting: true,
        smartTabManagement: true,
        tabsCreated: extractionResults.length,
        tabsCleanedUp: extractionResults.length,
        systemHealth: this.assessSystemHealth(extractionResults)
      },
      
      // Comprehensive Detailed Analysis
      detailedAnalysis: {
        anomalies: anomalies,
        issues: issues,
        performanceDistribution: this.calculatePerformanceDistribution(extractionResults),
        businessImpact: this.calculateBusinessImpact(businessCriticalResults),
        recommendations: recommendations,
        technicalInsights: this.generateTechnicalInsights(extractionResults),
        improvementOpportunities: this.identifyImprovementOpportunities(extractionResults),
        riskAssessment: this.performRiskAssessment(extractionResults)
      },
      
      // Executive Summary
      executiveSummary: {
        overallStatus: trajectory,
        keyFindings: this.generateKeyFindings(extractionResults, aiEnhancement),
        criticalIssues: issues.filter(i => i.severity === 'HIGH').length,
        actionableInsights: recommendations.filter(r => r.priority === 'HIGH').length,
        nextSteps: this.generateNextSteps(trajectory, recommendations)
      },
      
      // Metadata
      reportMetadata: {
        analyticsId: this.analyticsId,
        timestamp: new Date().toISOString(),
        reportType: 'ENHANCED_REAL_ANALYTICS_TEST',
        version: DAY8_VERSION,
        dataSource: 'LIVE_EXTRACTIONS',
        processingTime: Date.now() - this.startTime,
        confidence: this.calculateReportConfidence(extractionResults)
      }
    };
    
    return report;
  }

  generateSmartPredictions(currentAccuracy, trajectory, aiEnhancement) {
    const baseImprovement = trajectory === 'EXCELLENT' ? 1 : 
                           trajectory === 'ON_TRACK' ? 3 : 
                           trajectory === 'NEEDS_IMPROVEMENT' ? 5 : 8;
    
    const aiBonus = aiEnhancement > 0 ? Math.round(aiEnhancement / 2) : 0;
    const totalImprovement = baseImprovement + aiBonus;
    
    return {
      day10: Math.min(100, currentAccuracy + totalImprovement),
      day11: Math.min(100, currentAccuracy + totalImprovement * 1.4),
      day12: Math.min(100, currentAccuracy + totalImprovement * 1.8),
      targetReach: currentAccuracy >= 85 ? 'Target Already Achieved' : 
                   trajectory === 'CRITICAL' ? 'Immediate Action Required' : 
                   `Estimated Day ${Math.ceil((85 - currentAccuracy) / totalImprovement) + 8}`,
      confidence: trajectory === 'CRITICAL' ? 'LOW' : 
                 trajectory === 'EXCELLENT' ? 'HIGH' : 'MEDIUM'
    };
  }

  detectSystemIssues(extractionResults) {
    const issues = [];
    const failedExtractions = extractionResults.filter(r => !r.success);
    const slowExtractions = extractionResults.filter(r => r.performance?.duration > 15000);
    const lowQualityExtractions = extractionResults.filter(r => r.accuracy < 50);
    
    if (failedExtractions.length > extractionResults.length * 0.2) {
      issues.push({
        type: 'HIGH_FAILURE_RATE',
        severity: 'HIGH',
        description: `${failedExtractions.length} out of ${extractionResults.length} extractions failed`,
        affectedSites: failedExtractions.map(r => r.site),
        recommendation: 'Review error handling and site compatibility'
      });
    }
    
    if (slowExtractions.length > 0) {
      issues.push({
        type: 'PERFORMANCE_DEGRADATION',
        severity: 'MEDIUM',
        description: `${slowExtractions.length} extractions exceeded 15s threshold`,
        affectedSites: slowExtractions.map(r => r.site),
        recommendation: 'Optimize extraction timeouts and site selectors'
      });
    }
    
    if (lowQualityExtractions.length > extractionResults.length * 0.3) {
      issues.push({
        type: 'DATA_QUALITY_ISSUES',
        severity: 'MEDIUM',
        description: `${lowQualityExtractions.length} extractions have accuracy below 50%`,
        affectedSites: lowQualityExtractions.map(r => r.site),
        recommendation: 'Update extraction selectors and validation rules'
      });
    }
    
    return issues;
  }

  generateIntelligentRecommendations(extractionResults, aiEnhancement) {
    const recommendations = [];
    const failedExtractions = extractionResults.filter(r => !r.success);
    const poorPerformers = extractionResults.filter(r => r.success && r.accuracy < 70);
    const businessCriticalIssues = extractionResults.filter(r => r.businessCritical && (!r.success || r.accuracy < 80));
    
    if (failedExtractions.length > 0) {
      recommendations.push({
        type: 'RELIABILITY_IMPROVEMENT',
        priority: 'HIGH',
        title: 'Address Extraction Failures',
        description: `${failedExtractions.length} extractions failed completely`,
        sites: failedExtractions.map(r => r.site),
        actions: [
          'Review and update site selectors',
          'Implement better error handling',
          'Add retry mechanisms for failed extractions',
          'Consider alternative extraction strategies'
        ],
        estimatedImpact: 'High',
        implementationEffort: 'Medium'
      });
    }
    
    if (poorPerformers.length > 0) {
      recommendations.push({
        type: 'ACCURACY_ENHANCEMENT',
        priority: 'MEDIUM',
        title: 'Improve Low-Performing Sites',
        description: `${poorPerformers.length} sites have accuracy below 70%`,
        sites: poorPerformers.map(r => r.site),
        actions: [
          'Enable AI extraction for better accuracy',
          'Update field selectors and extraction rules',
          'Implement site-specific optimizations',
          'Add structured data parsing'
        ],
        estimatedImpact: 'Medium',
        implementationEffort: 'Medium'
      });
    }
    
    if (businessCriticalIssues.length > 0) {
      recommendations.push({
        type: 'BUSINESS_CRITICAL_ISSUES',
        priority: 'HIGH',
        title: 'Fix Business-Critical Site Issues',
        description: `${businessCriticalIssues.length} business-critical sites have issues`,
        sites: businessCriticalIssues.map(r => r.site),
        actions: [
          'Prioritize fixes for business-critical sites',
          'Implement monitoring and alerting',
          'Create fallback extraction methods',
          'Establish SLA monitoring'
        ],
        estimatedImpact: 'High',
        implementationEffort: 'High'
      });
    }
    
    if (aiEnhancement < 5 && this.config.apiKey) {
      recommendations.push({
        type: 'AI_OPTIMIZATION',
        priority: 'LOW',
        title: 'Optimize AI Extraction Performance',
        description: `AI enhancement is only ${Math.round(aiEnhancement)}%`,
        actions: [
          'Review and improve AI prompts',
          'Fine-tune extraction parameters',
          'Implement hybrid AI+DOM strategies',
          'Update AI model configuration'
        ],
        estimatedImpact: 'Medium',
        implementationEffort: 'Low'
      });
    }
    
    if (!this.config.apiKey) {
      recommendations.push({
        type: 'AI_ENABLEMENT',
        priority: 'HIGH',
        title: 'Enable AI-Powered Extraction',
        description: 'AI extraction is not configured, missing potential accuracy improvements',
        actions: [
          'Configure Gemini API key',
          'Enable AI extraction features',
          'Implement AI fallback strategies',
          'Monitor AI vs DOM performance'
        ],
        estimatedImpact: 'High',
        implementationEffort: 'Low'
      });
    }
    
    return recommendations;
  }

  // ... Additional helper methods for comprehensive analytics ...
  
  calculateAverageCompleteness(extractionResults) {
    const validResults = extractionResults.filter(r => r.extractionMetadata?.completeness !== undefined);
    if (validResults.length === 0) return 0;
    
    return Math.round(validResults.reduce((sum, r) => sum + r.extractionMetadata.completeness, 0) / validResults.length);
  }

  calculateAverageReliability(extractionResults) {
    const validResults = extractionResults.filter(r => r.extractionMetadata?.reliability !== undefined);
    if (validResults.length === 0) return 0;
    
    return Math.round(validResults.reduce((sum, r) => sum + r.extractionMetadata.reliability, 0) / validResults.length);
  }

  calculateDataQualityDistribution(extractionResults) {
    const distribution = { EXCELLENT: 0, GOOD: 0, ACCEPTABLE: 0, POOR: 0, UNKNOWN: 0 };
    
    extractionResults.forEach(result => {
      const quality = result.performance?.dataQuality || 'UNKNOWN';
      distribution[quality]++;
    });
    
    return distribution;
  }

  getOverallPerformanceCategory(overallAccuracy, businessAccuracy) {
    const avgScore = (overallAccuracy + businessAccuracy) / 2;
    
    if (avgScore >= 90) return 'Superior';
    if (avgScore >= 80) return 'Excellent'; 
    if (avgScore >= 70) return 'Good';
    if (avgScore >= 60) return 'Acceptable';
    return 'Needs Improvement';
  }

  calculatePerformanceDistribution(extractionResults) {
    const distribution = { Excellent: 0, Good: 0, Acceptable: 0, Poor: 0, Failed: 0 };
    
    extractionResults.forEach(result => {
      distribution[result.grade]++;
    });
    
    return distribution;
  }

  calculateBusinessImpact(businessCriticalResults) {
    const totalBusiness = businessCriticalResults.length;
    const successfulBusiness = businessCriticalResults.filter(r => r.success).length;
    
    return {
      totalBusinessCritical: totalBusiness,
      successfulBusinessCritical: successfulBusiness,
      businessSuccessRate: totalBusiness > 0 ? Math.round((successfulBusiness / totalBusiness) * 100) : 0,
      businessRisk: totalBusiness > 0 && successfulBusiness / totalBusiness < 0.8 ? 'HIGH' : 'LOW',
      avgBusinessAccuracy: businessCriticalResults.length > 0 ? 
        Math.round(businessCriticalResults.reduce((sum, r) => sum + (r.success ? r.accuracy : 0), 0) / businessCriticalResults.length) : 0
    };
  }

  generateTechnicalInsights(extractionResults) {
    const insights = [];
    const aiResults = extractionResults.filter(r => r.extractedData?.extractionMethod === 'ai');
    const domResults = extractionResults.filter(r => r.extractedData?.extractionMethod === 'intelligent-dom');
    
    if (aiResults.length > 0 && domResults.length > 0) {
      const aiAvgLatency = aiResults.reduce((sum, r) => sum + r.performance.duration, 0) / aiResults.length;
      const domAvgLatency = domResults.reduce((sum, r) => sum + r.performance.duration, 0) / domResults.length;
      
      insights.push({
        category: 'PERFORMANCE',
        finding: `AI extraction latency is ${Math.round(((aiAvgLatency - domAvgLatency) / domAvgLatency) * 100)}% ${aiAvgLatency > domAvgLatency ? 'higher' : 'lower'} than DOM extraction`,
        recommendation: aiAvgLatency > domAvgLatency * 1.5 ? 'Consider optimizing AI extraction timeout settings' : 'AI latency is acceptable'
      });
    }
    
    const complexSites = extractionResults.filter(r => r.performance?.siteComplexity === 'HIGH');
    if (complexSites.length > 0) {
      insights.push({
        category: 'COMPLEXITY',
        finding: `${complexSites.length} sites have high complexity requiring advanced extraction`,
        recommendation: 'Consider implementing specialized extractors for complex sites'
      });
    }
    
    return insights;
  }

  identifyImprovementOpportunities(extractionResults) {
    const opportunities = [];
    
    // Identify sites that could benefit from AI
    const domOnlyResults = extractionResults.filter(r => 
      r.extractedData?.extractionMethod === 'intelligent-dom' && 
      r.accuracy < 80 && 
      r.success
    );
    
    if (domOnlyResults.length > 0 && this.config.apiKey) {
      opportunities.push({
        type: 'AI_UPGRADE',
        description: `${domOnlyResults.length} sites could benefit from AI extraction`,
        potentialImprovement: '15-25% accuracy increase',
        sites: domOnlyResults.map(r => r.site)
      });
    }
    
    // Identify timeout optimization opportunities
    const fastSites = extractionResults.filter(r => r.performance?.duration < 3000);
    if (fastSites.length > 0) {
      opportunities.push({
        type: 'TIMEOUT_OPTIMIZATION',
        description: `${fastSites.length} sites load quickly and could use reduced timeouts`,
        potentialImprovement: 'Faster overall analytics runtime',
        sites: fastSites.map(r => r.site)
      });
    }
    
    return opportunities;
  }

  performRiskAssessment(extractionResults) {
    const risks = [];
    const totalSites = extractionResults.length;
    const businessCriticalSites = extractionResults.filter(r => r.businessCritical);
    const failedBusinessCritical = businessCriticalSites.filter(r => !r.success);
    
    if (failedBusinessCritical.length > 0) {
      risks.push({
        level: 'HIGH',
        category: 'BUSINESS_CONTINUITY',
        description: `${failedBusinessCritical.length} business-critical sites are failing`,
        impact: 'Direct business impact on critical operations',
        mitigation: 'Immediate attention required for business-critical sites'
      });
    }
    
    const lowReliabilitySites = extractionResults.filter(r => 
      r.extractionMetadata?.reliability && r.extractionMetadata.reliability < 60
    );
    
    if (lowReliabilitySites.length > totalSites * 0.3) {
      risks.push({
        level: 'MEDIUM',
        category: 'SYSTEM_RELIABILITY',
        description: `${lowReliabilitySites.length} sites have reliability issues`,
        impact: 'Potential for increased failure rates',
        mitigation: 'Review and strengthen extraction reliability measures'
      });
    }
    
    return risks;
  }

  assessSystemHealth(extractionResults) {
    const successRate = extractionResults.filter(r => r.success).length / extractionResults.length;
    const avgAccuracy = extractionResults.filter(r => r.success).reduce((sum, r) => sum + r.accuracy, 0) / extractionResults.filter(r => r.success).length;
    
    if (successRate >= 0.95 && avgAccuracy >= 85) return 'EXCELLENT';
    if (successRate >= 0.9 && avgAccuracy >= 75) return 'GOOD';
    if (successRate >= 0.8 && avgAccuracy >= 65) return 'ACCEPTABLE';
    return 'POOR';
  }

  generateKeyFindings(extractionResults, aiEnhancement) {
    const findings = [];
    const successRate = extractionResults.filter(r => r.success).length / extractionResults.length;
    
    findings.push(`System achieved ${Math.round(successRate * 100)}% success rate across all test sites`);
    
    if (aiEnhancement > 10) {
      findings.push(`AI extraction provides significant ${Math.round(aiEnhancement)}% accuracy improvement`);
    }
    
    const businessCriticalIssues = extractionResults.filter(r => r.businessCritical && !r.success);
    if (businessCriticalIssues.length > 0) {
      findings.push(`${businessCriticalIssues.length} business-critical sites require immediate attention`);
    }
    
    return findings;
  }

  generateNextSteps(trajectory, recommendations) {
    const highPriorityRecs = recommendations.filter(r => r.priority === 'HIGH');
    const nextSteps = [];
    
    if (trajectory === 'CRITICAL') {
      nextSteps.push('Address critical system failures immediately');
      nextSteps.push('Focus on business-critical site reliability');
    } else if (trajectory === 'EXCELLENT') {
      nextSteps.push('Maintain current performance levels');
      nextSteps.push('Focus on optimization and efficiency improvements');
    } else {
      nextSteps.push('Implement high-priority recommendations');
      nextSteps.push('Monitor progress toward excellence trajectory');
    }
    
    if (highPriorityRecs.length > 0) {
      nextSteps.push(`Execute ${highPriorityRecs.length} high-priority action items`);
    }
    
    return nextSteps;
  }

  calculateReportConfidence(extractionResults) {
    // Base confidence on sample size and success rate
    const sampleSize = extractionResults.length;
    const successRate = extractionResults.filter(r => r.success).length / sampleSize;
    
    if (sampleSize >= 4 && successRate >= 0.8) return 'HIGH';
    if (sampleSize >= 3 && successRate >= 0.6) return 'MEDIUM';
    return 'LOW';
  }

  detectPerformanceAnomalies(extractionResults) {
    const anomalies = [];
    const successfulResults = extractionResults.filter(r => r.success);
    
    if (successfulResults.length > 1) {
      const accuracies = successfulResults.map(r => r.accuracy);
      const mean = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
      const stdDev = Math.sqrt(accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / accuracies.length);
      
      successfulResults.forEach(result => {
        if (Math.abs(result.accuracy - mean) > 2 * stdDev) {
          anomalies.push({
            type: 'ACCURACY_ANOMALY',
            site: result.site,
            value: result.accuracy,
            expected: Math.round(mean),
            deviation: Math.round(Math.abs(result.accuracy - mean)),
            severity: Math.abs(result.accuracy - mean) > 3 * stdDev ? 'HIGH' : 'MEDIUM'
          });
        }
      });
    }
    
    return anomalies;
  }

  storeAnalyticsResults(report) {
    // Store in cache for historical analysis
    this.extractionHistory.push(...report.sites.map(site => ({
      site: site.name,
      accuracy: site.accuracy,
      timestamp: report.reportMetadata.timestamp,
      analyticsId: this.analyticsId
    })));
    
    // Keep only last 50 results
    if (this.extractionHistory.length > 50) {
      this.extractionHistory = this.extractionHistory.slice(-50);
    }
    
    // Store in persistent cache
    this.config.cache.extractionResults.set(this.analyticsId, report);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ===== ENHANCED INTELLIGENT EXTRACTOR =====
class EnhancedIntelligentExtractor {
  constructor(config) {
    this.config = config;
    this.extractionId = `extract_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  async performIntelligentExtraction(tabId, url) {
    try {
      BackgroundLogger.info('🤖 Starting enhanced AI extraction', {
        tabId,
        url,
        extractionId: this.extractionId
      });

      // Step 1: Get comprehensive page data with bulletproof extraction
      const pageData = await this.getBulletproofPageData(tabId);
      
      if (!pageData || pageData.error) {
        throw new Error('Failed to get page data: ' + (pageData?.error || 'Unknown error'));
      }

      // Step 2: Determine site type intelligently
      const siteType = this.determineSiteType(url, pageData);
      
      // Step 3: Use AI extraction if API key available
      if (this.config.apiKey && this.config.useAIExtraction) {
        return await this.performAIExtraction(pageData, siteType, url);
      } else {
        // Fallback to intelligent DOM extraction
        return await this.performIntelligentDOMExtraction(pageData, siteType, url);
      }

    } catch (error) {
      BackgroundLogger.error('Enhanced intelligent extraction failed', { 
        error: error.message,
        extractionId: this.extractionId
      });
      return { 
        error: 'Enhanced intelligent extraction failed: ' + error.message,
        extractionId: this.extractionId
      };
    }
  }

  async getBulletproofPageData(tabId) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: () => {
          // ENHANCED BULLETPROOF PAGE DATA EXTRACTION
          function extractSiteSpecificData() {
            const hostname = window.location.hostname.toLowerCase();
            const siteData = {};
            
            try {
              if (hostname.includes('amazon.')) {
                // Enhanced Amazon extraction
                siteData.price = document.querySelector('.a-price-whole, .a-offscreen, .a-price .a-offscreen, .a-price-symbol')?.textContent?.trim() || 
                               document.querySelector('[data-testid="price"]')?.textContent?.trim() || null;
                siteData.rating = document.querySelector('.a-icon-alt, [data-hook="rating-out-of-text"], .a-star-medium .a-star')?.textContent?.trim() || null;
                siteData.reviews = document.querySelector('#acrCustomerReviewText, .a-size-base, [data-hook="total-review-count"]')?.textContent?.trim() || null;
                siteData.availability = document.querySelector('#availability span, .a-size-mini, [data-feature-name="availability"] span')?.textContent?.trim() || null;
                siteData.brand = document.querySelector('#bylineInfo, .a-brand, [data-feature-name="bylineInfo"]')?.textContent?.trim() || null;
              } else if (hostname.includes('bloomberg.')) {
                // Enhanced Bloomberg extraction
                siteData.author = document.querySelector('[data-module="ArticleHeader"] .author, .byline, .author-name, [data-module="BylineAndTimestamp"]')?.textContent?.trim() || null;
                siteData.publishDate = document.querySelector('time, .timestamp, [data-module="BylineAndTimestamp"] time')?.textContent?.trim() || null;
                siteData.category = document.querySelector('.category, .kicker, .eyebrow, [data-module="ArticleHeader"] .eyebrow')?.textContent?.trim() || null;
                siteData.summary = document.querySelector('.summary, .deck, .article-summary')?.textContent?.trim() || null;
              } else if (hostname.includes('allrecipes.')) {
                // Enhanced AllRecipes extraction
                siteData.cookTime = document.querySelector('.recipe-summary__item-data, .total-time, [data-testid="recipe-cook-time"]')?.textContent?.trim() || null;
                siteData.servings = document.querySelector('.recipe-adjust-servings__size-quantity, [data-testid="recipe-servings"]')?.textContent?.trim() || null;
                siteData.difficulty = document.querySelector('.recipe-summary__difficulty, [data-testid="recipe-difficulty"]')?.textContent?.trim() || null;
                siteData.rating = document.querySelector('.recipe-rating, .rating-stars, [data-testid="recipe-rating"]')?.textContent?.trim() || null;
              } else if (hostname.includes('wikipedia.org')) {
                // Enhanced Wikipedia extraction
                siteData.lastModified = document.querySelector('#footer-info-lastmod, .lastmod')?.textContent?.trim() || null;
                siteData.categories = Array.from(document.querySelectorAll('#mw-normal-catlinks ul li a, .mw-category a')).map(a => a.textContent?.trim()).slice(0, 5);
                siteData.coordinates = document.querySelector('.geo, .coordinates')?.textContent?.trim() || null;
                siteData.infoboxData = this.extractInfoboxData();
              }
            } catch (e) {
              console.warn('Enhanced site-specific extraction error:', e);
            }
            
            return siteData;
          }
          
          function extractInfoboxData() {
            const infobox = document.querySelector('.infobox, .infobox-data');
            if (!infobox) return {};
            
            const data = {};
            const rows = infobox.querySelectorAll('tr');
            
            rows.forEach(row => {
              const header = row.querySelector('th, .infobox-label');
              const value = row.querySelector('td, .infobox-data');
              
              if (header && value) {
                const key = header.textContent?.trim().toLowerCase().replace(/\s+/g, '_');
                const val = value.textContent?.trim();
                if (key && val) {
                  data[key] = val;
                }
              }
            });
            
            return data;
          }
          
          function extractStructuredData() {
            const structuredData = {};
            
            try {
              // Enhanced JSON-LD extraction
              const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
              if (jsonLdScripts.length > 0) {
                const jsonLdData = [];
                jsonLdScripts.forEach(script => {
                  try {
                    const data = JSON.parse(script.textContent);
                    jsonLdData.push(data);
                  } catch (e) {
                    console.warn('JSON-LD parsing error:', e);
                  }
                });
                structuredData.jsonLd = jsonLdData.slice(0, 3);
              }
              
              // Enhanced Microdata extraction
              const microdataItems = document.querySelectorAll('[itemscope]');
              if (microdataItems.length > 0) {
                structuredData.microdata = Array.from(microdataItems).slice(0, 5).map(item => ({
                  itemtype: item.getAttribute('itemtype'),
                  itemprops: Array.from(item.querySelectorAll('[itemprop]')).slice(0, 8).map(prop => ({
                    property: prop.getAttribute('itemprop'),
                    content: prop.textContent?.trim() || prop.getAttribute('content')
                  }))
                }));
              }
              
              // Open Graph data
              structuredData.openGraph = {};
              document.querySelectorAll('meta[property^="og:"]').forEach(meta => {
                const property = meta.getAttribute('property').replace('og:', '');
                const content = meta.getAttribute('content');
                if (property && content) {
                  structuredData.openGraph[property] = content;
                }
              });
              
              // Twitter Card data
              structuredData.twitterCard = {};
              document.querySelectorAll('meta[name^="twitter:"]').forEach(meta => {
                const name = meta.getAttribute('name').replace('twitter:', '');
                const content = meta.getAttribute('content');
                if (name && content) {
                  structuredData.twitterCard[name] = content;
                }
              });
              
            } catch (e) {
              console.warn('Enhanced structured data extraction error:', e);
            }
            
            return structuredData;
          }
          
          // ENHANCED MAIN EXTRACTION LOGIC
          const data = {
            title: document.title || '',
            url: window.location.href,
            domain: window.location.hostname,
            extractedAt: new Date().toISOString(),
            
            // Enhanced content with error handling
            content: {
              headings: [],
              paragraphs: [],
              links: [],
              images: [],
              lists: [],
              tables: []
            },
            
            // Enhanced site-specific data
            siteSpecific: extractSiteSpecificData(),
            
            // Enhanced metadata
            meta: {
              description: null,
              keywords: null,
              author: null,
              ogTitle: null,
              ogDescription: null,
              ogImage: null,
              viewport: null,
              robots: null,
              canonical: null
            },
            
            // Enhanced structured data
            structuredData: extractStructuredData(),
            
            // Enhanced page statistics
            stats: {
              textLength: 0,
              linkCount: 0,
              imageCount: 0,
              headingCount: 0,
              paragraphCount: 0,
              listCount: 0,
              tableCount: 0,
              formCount: 0,
              videoCount: 0
            },
            
            // Page performance data
            performance: {
              loadTime: performance.now(),
              domContentLoaded: document.readyState === 'complete'
            }
          };

          // Enhanced content extraction with comprehensive error handling
          try {
            // Enhanced headings extraction
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            data.content.headings = Array.from(headings)
              .map(h => ({
                tag: h.tagName.toLowerCase(),
                text: h.textContent?.trim(),
                level: parseInt(h.tagName.charAt(1)),
                id: h.id || null,
                className: h.className || null
              }))
              .filter(h => h.text && h.text.length > 0)
              .slice(0, 15);
              
            data.stats.headingCount = headings.length;
          } catch (e) {
            console.warn('Enhanced headings extraction error:', e);
          }
          
          try {
            // Enhanced paragraphs extraction
            const paragraphs = document.querySelectorAll('p, .content p, .article-content p, .post-content p');
            data.content.paragraphs = Array.from(paragraphs)
              .map(p => p.textContent?.trim())
              .filter(text => text && text.length > 25)
              .slice(0, 12);
              
            data.stats.paragraphCount = paragraphs.length;
          } catch (e) {
            console.warn('Enhanced paragraphs extraction error:', e);
          }
          
          try {
            // Enhanced links extraction
            const links = document.querySelectorAll('a[href]');
            data.content.links = Array.from(links)
              .map(a => ({
                text: a.textContent?.trim(),
                href: a.href,
                internal: a.href.includes(window.location.hostname),
                title: a.title || null,
                target: a.target || null
              }))
              .filter(l => l.text && l.href && l.text.length > 2)
              .slice(0, 15);
              
            data.stats.linkCount = links.length;
          } catch (e) {
            console.warn('Enhanced links extraction error:', e);
          }
          
          try {
            // Enhanced images extraction
            const images = document.querySelectorAll('img[src], picture img, figure img');
            data.content.images = Array.from(images)
              .map(img => ({
                src: img.src,
                alt: img.alt,
                width: img.width || img.naturalWidth || 0,
                height: img.height || img.naturalHeight || 0,
                title: img.title || null,
                loading: img.loading || null
              }))
              .filter(img => img.src && !img.src.includes('data:image'))
              .slice(0, 10);
              
            data.stats.imageCount = images.length;
          } catch (e) {
            console.warn('Enhanced images extraction error:', e);
          }
          
          try {
            // Enhanced lists extraction
            const lists = document.querySelectorAll('ul, ol');
            data.content.lists = Array.from(lists)
              .map(list => ({
                type: list.tagName.toLowerCase(),
                items: Array.from(list.querySelectorAll('li')).map(li => li.textContent?.trim()).filter(Boolean).slice(0, 10)
              }))
              .filter(list => list.items.length > 0)
              .slice(0, 5);
              
            data.stats.listCount = lists.length;
          } catch (e) {
            console.warn('Enhanced lists extraction error:', e);
          }
          
          try {
            // Enhanced tables extraction
            const tables = document.querySelectorAll('table');
            data.content.tables = Array.from(tables)
              .map(table => ({
                headers: Array.from(table.querySelectorAll('th')).map(th => th.textContent?.trim()).filter(Boolean),
                rows: Array.from(table.querySelectorAll('tr')).slice(1, 6).map(tr => 
                  Array.from(tr.querySelectorAll('td')).map(td => td.textContent?.trim()).filter(Boolean)
                ).filter(row => row.length > 0)
              }))
              .filter(table => table.headers.length > 0 || table.rows.length > 0)
              .slice(0, 3);
              
            data.stats.tableCount = tables.length;
          } catch (e) {
            console.warn('Enhanced tables extraction error:', e);
          }
          
          try {
            // Enhanced metadata extraction
            data.meta.description = document.querySelector('meta[name="description"], meta[property="description"]')?.content;
            data.meta.keywords = document.querySelector('meta[name="keywords"]')?.content;
            data.meta.author = document.querySelector('meta[name="author"], meta[property="author"]')?.content;
            data.meta.ogTitle = document.querySelector('meta[property="og:title"]')?.content;
            data.meta.ogDescription = document.querySelector('meta[property="og:description"]')?.content;
            data.meta.ogImage = document.querySelector('meta[property="og:image"]')?.content;
            data.meta.viewport = document.querySelector('meta[name="viewport"]')?.content;
            data.meta.robots = document.querySelector('meta[name="robots"]')?.content;
            data.meta.canonical = document.querySelector('link[rel="canonical"]')?.href;
          } catch (e) {
            console.warn('Enhanced metadata extraction error:', e);
          }
          
          try {
            // Enhanced statistics calculation
            data.stats.textLength = document.body?.textContent?.length || 0;
            data.stats.formCount = document.querySelectorAll('form').length;
            data.stats.videoCount = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length;
          } catch (e) {
            console.warn('Enhanced statistics calculation error:', e);
          }

          return data;
        }
      });

      return results[0]?.result;
    } catch (error) {
      BackgroundLogger.error('Failed to get enhanced bulletproof page data', { error: error.message });
      return { error: error.message };
    }
  }

  determineSiteType(url, pageData) {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      // Enhanced domain-based detection
      if (domain.includes('amazon.')) return 'amazon';
      if (domain.includes('bloomberg.')) return 'bloomberg';
      if (domain.includes('allrecipes.')) return 'allrecipes';
      if (domain.includes('wikipedia.org')) return 'wikipedia';
      if (domain.includes('medium.')) return 'medium';
      
      // Enhanced content-based intelligent detection
      const title = pageData.title?.toLowerCase() || '';
      const text = pageData.content?.paragraphs?.join(' ').toLowerCase() || '';
      const structuredData = pageData.structuredData || {};
      
      // Check structured data for type hints
      if (structuredData.jsonLd) {
        for (const ld of structuredData.jsonLd) {
          if (ld['@type'] === 'Product' || ld['@type'] === 'Offer') return 'amazon';
          if (ld['@type'] === 'NewsArticle' || ld['@type'] === 'Article') return 'bloomberg';
          if (ld['@type'] === 'Recipe') return 'allrecipes';
        }
      }
      
      // Enhanced content-based detection
      if ((text.includes('price') && text.includes('buy')) || title.includes('product') || text.includes('add to cart')) {
        return 'amazon';
      }
      
      if ((text.includes('ingredients') && text.includes('instructions')) || title.includes('recipe') || text.includes('cooking time')) {
        return 'allrecipes';
      }
      
      if ((text.includes('published') && text.includes('author')) || title.includes('news') || text.includes('breaking')) {
        return 'bloomberg';
      }
      
      if ((text.includes('article') && text.includes('references')) || domain.includes('wiki') || text.includes('encyclopedia')) {
        return 'wikipedia';
      }
      
      return 'generic';
    } catch (error) {
      BackgroundLogger.warn('Enhanced site type determination failed, using generic', { error: error.message });
      return 'generic';
    }
  }

  async performAIExtraction(pageData, siteType, url) {
    try {
      BackgroundLogger.info('🧠 Using enhanced AI-powered extraction', {
        siteType,
        hasApiKey: !!this.config.apiKey,
        extractionId: this.extractionId
      });

      // Build enhanced AI prompt
      const prompt = this.buildEnhancedAIPrompt(pageData, siteType);
      
      // Call Gemini AI with retries
      const aiResponse = await this.callGeminiAIWithRetry(prompt);
      
      // Parse AI response
      const extractedData = this.parseAIResponse(aiResponse);
      
      // Enhanced data enrichment
      extractedData.title = extractedData.title || pageData.title;
      extractedData.url = pageData.url;
      extractedData.domain = pageData.domain;
      extractedData.extractedAt = pageData.extractedAt;
      extractedData.extractionMethod = 'ai';
      extractedData.aiModel = this.config.model;
      extractedData.siteType = siteType;
      extractedData.intelligenceLevel = 'advanced';
      extractedData.extractionId = this.extractionId;
      
      // Add structured data insights
      if (pageData.structuredData) {
        extractedData.structuredDataAvailable = Object.keys(pageData.structuredData).length > 0;
        extractedData.openGraphData = pageData.structuredData.openGraph;
      }
      
      // Apply enterprise scoring
      if (this.config.enterpriseConfig) {
        const siteConfig = this.config.enterpriseConfig.sites?.[pageData.domain];
        if (siteConfig) {
          extractedData.enterpriseScore = this.calculateEnterpriseScore(extractedData, siteConfig);
          extractedData.configVersion = this.config.configVersion;
        }
      }
      
      return extractedData;

    } catch (error) {
      BackgroundLogger.warn('Enhanced AI extraction failed, falling back to DOM', { 
        error: error.message,
        extractionId: this.extractionId
      });
      
      if (this.config.fallbackToDom) {
        return await this.performIntelligentDOMExtraction(pageData, siteType, url);
      } else {
        throw error;
      }
    }
  }

  buildEnhancedAIPrompt(pageData, siteType) {
    const siteInstructions = {
      amazon: `Extract comprehensive Amazon product data:
- title: Complete product name
- price: Current price with currency
- description: Product description/features
- category: Product category
- availability: Stock status
- rating: Customer rating (X.X format)
- reviews: Number of reviews
- brand: Product brand
- images: Product image URLs`,

      bloomberg: `Extract comprehensive Bloomberg news data:
- title: Complete article headline
- author: Article author name
- description: Article summary/description
- category: News section/category
- publishdate: Publication date
- summary: Article summary (first 200 chars)
- tags: Article tags/topics`,

      allrecipes: `Extract comprehensive recipe data:
- title: Recipe name
- description: Recipe description
- ingredients: Complete list of ingredients (as detailed array)
- instructions: Complete cooking steps (as detailed array)
- cooktime: Total cooking/preparation time
- servings: Number of servings
- difficulty: Recipe difficulty level
- rating: Recipe rating
- nutrition: Nutritional information if available`,

      wikipedia: `Extract comprehensive Wikipedia data:
- title: Article title
- description: Article description/summary
- maincontentsummary: Main article content (first 400 chars)
- category: Article category/subject
- infobox: Key facts from infobox
- references: Number of references/citations
- lastModified: Last modification date
- coordinates: Geographic coordinates if available`,

      generic: `Extract comprehensive webpage data:
- title: Page title
- description: Page description or summary
- author: Author if available
- category: Page category or topic
- maincontentsummary: Main content summary (first 300 chars)
- keywords: Key topics/keywords
- publishdate: Publication date if available`
    };

    const instruction = siteInstructions[siteType] || siteInstructions.generic;

    return `You are an advanced AI data extraction specialist. Extract comprehensive structured data from this webpage with maximum accuracy.

${instruction}

COMPREHENSIVE WEBPAGE DATA:
Title: ${pageData.title}
Domain: ${pageData.domain}
URL: ${pageData.url}

Meta Information:
- Description: ${pageData.meta?.description || 'N/A'}
- Keywords: ${pageData.meta?.keywords || 'N/A'}
- Author: ${pageData.meta?.author || 'N/A'}

Content Structure:
Headings (${pageData.content?.headings?.length || 0}):
${pageData.content?.headings?.map(h => `${h.tag.toUpperCase()}: ${h.text}`).join('\n').substring(0, 1200)}

Main Content:
${pageData.content?.paragraphs?.join('\n\n').substring(0, 2500)}

Site-Specific Data:
${JSON.stringify(pageData.siteSpecific, null, 2).substring(0, 1000)}

Structured Data Available:
${pageData.structuredData ? Object.keys(pageData.structuredData).join(', ') : 'None'}

Lists and Tables:
${pageData.content?.lists?.length || 0} lists, ${pageData.content?.tables?.length || 0} tables detected

CRITICAL INSTRUCTIONS:
1. Extract ALL requested fields with maximum precision
2. Use both visible content AND structured data
3. Ensure data accuracy and completeness
4. Return ONLY valid JSON - no explanations, no markdown formatting
5. Use "null" for unavailable fields, never leave empty strings
6. For arrays (ingredients/instructions), provide detailed items
7. For numeric values (ratings/prices), extract exact numbers

Return a comprehensive JSON object with all requested fields filled accurately.`;
  }

  async callGeminiAIWithRetry(prompt, maxRetries = 2) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        BackgroundLogger.info(`🤖 AI extraction attempt ${attempt}/${maxRetries}`, {
          extractionId: this.extractionId
        });
        
        const response = await this.callGeminiAI(prompt);
        return response;
        
      } catch (error) {
        lastError = error;
        BackgroundLogger.warn(`AI extraction attempt ${attempt} failed`, {
          error: error.message,
          extractionId: this.extractionId
        });
        
        if (attempt < maxRetries) {
          // Exponential backoff
          await this.delay(1000 * attempt);
        }
      }
    }
    
    throw lastError;
  }

  async callGeminiAI(prompt) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: this.config.temperature,
        topK: 1,
        topP: 1,
        maxOutputTokens: this.config.maxTokens
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content) {
      throw new Error('Invalid API response from Gemini');
    }

    return data.candidates[0].content.parts[0].text;
  }

  parseAIResponse(aiResponse) {
    try {
      // Enhanced response cleaning
      let jsonText = aiResponse.trim();
      
      // Remove various code block formats
      jsonText = jsonText.replace(/``````\n?/g, '');
      jsonText = jsonText.replace(/`{3}json\n?/g, '').replace(/`{3}\n?/g, '');
      
      // Remove any leading/trailing explanatory text
      const jsonStart = jsonText.indexOf('{');
      const jsonEnd = jsonText.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
      }
      
      // Fix common JSON issues
      jsonText = jsonText.replace(/,\s*}/g, '}'); // Remove trailing commas
      jsonText = jsonText.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
      
      const parsed = JSON.parse(jsonText);
      
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid AI response object');
      }
      
      // Enhanced validation
      const fieldCount = Object.keys(parsed).length;
      const validFields = Object.keys(parsed).filter(key => {
        const value = parsed[key];
        return value !== null && value !== '' && value !== 'null';
      }).length;
      
      BackgroundLogger.info('✅ Enhanced AI JSON parsed successfully', {
        totalFields: fieldCount,
        validFields: validFields,
        completeness: Math.round((validFields / fieldCount) * 100) + '%',
        extractionId: this.extractionId
      });
      
      return parsed;
      
    } catch (error) {
      BackgroundLogger.error('Enhanced AI response parsing failed', { 
        error: error.message,
        responsePreview: aiResponse.substring(0, 300),
        extractionId: this.extractionId
      });
      throw new Error(`Enhanced AI JSON parsing failed: ${error.message}`);
    }
  }

  async performIntelligentDOMExtraction(pageData, siteType, url) {
    BackgroundLogger.info('🔍 Using enhanced intelligent DOM extraction', {
      siteType,
      extractionId: this.extractionId
    });

    const extractedData = {
      title: pageData.title,
      url: pageData.url,
      domain: pageData.domain,
      extractedAt: pageData.extractedAt,
      extractionMethod: 'intelligent-dom',
      siteType: siteType,
      intelligenceLevel: 'enhanced',
      extractionId: this.extractionId
    };

    // Enhanced site-specific intelligent extraction
    switch (siteType) {
      case 'amazon':
        this.extractEnhancedAmazonData(extractedData, pageData);
        break;
      case 'bloomberg':
        this.extractEnhancedBloombergData(extractedData, pageData);
        break;
      case 'allrecipes':
        this.extractEnhancedRecipeData(extractedData, pageData);
        break;
      case 'wikipedia':
        this.extractEnhancedWikipediaData(extractedData, pageData);
        break;
      default:
        this.extractEnhancedGenericData(extractedData, pageData);
    }

    // Apply enterprise scoring
    if (this.config.enterpriseConfig) {
      const siteConfig = this.config.enterpriseConfig.sites?.[pageData.domain];
      if (siteConfig) {
        extractedData.enterpriseScore = this.calculateEnterpriseScore(extractedData, siteConfig);
        extractedData.configVersion = this.config.configVersion;
      }
    }

    return extractedData;
  }

  extractEnhancedAmazonData(extractedData, pageData) {
    extractedData.price = pageData.siteSpecific?.price || this.findInText(pageData, /\$[\d,]+\.?\d*/);
    extractedData.category = this.findInHeadings(pageData, /department|category/i) || 'Product';
    extractedData.description = pageData.meta?.description || this.getFirstParagraph(pageData);
    extractedData.availability = pageData.siteSpecific?.availability || 'Unknown';
    extractedData.rating = pageData.siteSpecific?.rating || this.findInText(pageData, /(\d\.?\d*) out of 5/);
    extractedData.reviews = pageData.siteSpecific?.reviews || this.findInText(pageData, /(\d+) ratings?/);
    extractedData.brand = pageData.siteSpecific?.brand;
    extractedData.images = pageData.content?.images?.map(img => img.src) || [];
  }

  extractEnhancedBloombergData(extractedData, pageData) {
    extractedData.author = pageData.siteSpecific?.author || pageData.meta?.author;
    extractedData.publishdate = pageData.siteSpecific?.publishDate || this.findInText(pageData, /\d{1,2}\/\d{1,2}\/\d{4}|\w+ \d{1,2}, \d{4}/);
    extractedData.description = pageData.meta?.description || this.getFirstParagraph(pageData);
    extractedData.category = pageData.siteSpecific?.category || 'News';
    extractedData.summary = pageData.siteSpecific?.summary || this.getFirstParagraph(pageData);
  }

  extractEnhancedRecipeData(extractedData, pageData) {
    extractedData.description = pageData.meta?.description || this.getFirstParagraph(pageData);
    extractedData.cooktime = pageData.siteSpecific?.cookTime || this.findInText(pageData, /(\d+ (?:minute|hour)s?)/);
    extractedData.servings = pageData.siteSpecific?.servings;
    extractedData.difficulty = pageData.siteSpecific?.difficulty;
    extractedData.rating = pageData.siteSpecific?.rating || this.findInText(pageData, /(\d\.?\d*) (?:star|rating)/);
    extractedData.ingredients = this.extractListItems(pageData, /ingredient/i);
    extractedData.instructions = this.extractListItems(pageData, /instruction|step/i);
  }

  extractEnhancedWikipediaData(extractedData, pageData) {
    extractedData.description = pageData.meta?.description || this.getFirstParagraph(pageData);
    extractedData.maincontentsummary = this.getFirstParagraph(pageData);
    extractedData.category = pageData.siteSpecific?.categories?.[0] || 'Encyclopedia';
    extractedData.infobox = pageData.siteSpecific?.infoboxData || {};
    extractedData.lastModified = pageData.siteSpecific?.lastModified;
    extractedData.coordinates = pageData.siteSpecific?.coordinates;
    extractedData.references = pageData.content?.links?.filter(link => 
      link.text?.toLowerCase().includes('reference') || 
      link.href?.includes('#cite')
    ).length || 0;
  }

  extractEnhancedGenericData(extractedData, pageData) {
    extractedData.description = pageData.meta?.description || this.getFirstParagraph(pageData);
    extractedData.author = pageData.meta?.author;
    extractedData.maincontentsummary = this.getFirstParagraph(pageData);
    extractedData.category = this.findInHeadings(pageData, /.*/);
    extractedData.keywords = pageData.meta?.keywords;
    extractedData.publishdate = this.findInText(pageData, /\d{4}-\d{2}-\d{2}|\w+ \d{1,2}, \d{4}/);
  }

  // Enhanced helper methods
  findInText(pageData, regex) {
    try {
      const allText = [
        pageData.title,
        ...(pageData.content?.paragraphs || []),
        ...(pageData.content?.headings?.map(h => h.text) || []),
        ...(pageData.content?.lists?.flatMap(list => list.items) || [])
      ].join(' ');
      
      const match = allText.match(regex);
      return match ? match[1] || match[0] : null;
    } catch (error) {
      return null;
    }
  }

  findInHeadings(pageData, regex) {
    try {
      const headings = pageData.content?.headings || [];
      const match = headings.find(h => regex.test(h.text));
      return match ? match.text : null;
    } catch (error) {
      return null;
    }
  }

  getFirstParagraph(pageData) {
    try {
      return pageData.content?.paragraphs?.[0]?.substring(0, 300) || '';
    } catch (error) {
      return '';
    }
  }

  extractListItems(pageData, regex) {
    try {
      // Try to extract from structured lists first
      const listItems = pageData.content?.lists?.flatMap(list => list.items) || [];
      const matchingItems = listItems.filter(item => regex.test(item));
      
      if (matchingItems.length > 0) {
        return matchingItems.slice(0, 10);
      }
      
      // Fallback to paragraphs
      const paragraphs = pageData.content?.paragraphs || [];
      return paragraphs.filter(p => regex.test(p)).slice(0, 5);
    } catch (error) {
      return [];
    }
  }

  calculateEnterpriseScore(data, siteConfig) {
    try {
      let score = 0;
      let maxScore = 0;
      const weights = siteConfig.fieldWeights || {};
      
      (siteConfig.requiredFields || []).forEach(field => {
        const weight = weights[field] || 1;
        maxScore += weight;
        
        const value = data[field];
        if (value && value !== null && value !== '' && value !== 'null') {
          // Quality-based scoring
          const quality = this.assessFieldQuality(field, value);
          score += weight * quality;
        }
      });
      
      return {
        score: score,
        maxScore: maxScore,
        percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
        grade: this.getPerformanceGrade(score / maxScore * 100)
      };
    } catch (error) {
      return {
        score: 0,
        maxScore: 1,
        percentage: 0,
        grade: 'Error'
      };
    }
  }

  assessFieldQuality(fieldName, value) {
    if (!value || value === 'null' || value === '') {
      return 0;
    }
    
    // Enhanced field-specific quality assessment
    switch (fieldName) {
      case 'title':
        return value.length > 10 && value.length < 300 ? 1 : 0.7;
      case 'description':
        return value.length > 30 && value.length < 1000 ? 1 : 0.8;
      case 'price':
        return /[\$€£¥][\d,]+\.?\d*/.test(value) ? 1 : 0.6;
      case 'ingredients':
      case 'instructions':
        return Array.isArray(value) && value.length > 2 ? 1 : 0.7;
      case 'author':
        return value.length > 3 && value.length < 100 ? 1 : 0.8;
      case 'rating':
        return /\d+\.?\d*/.test(value) ? 1 : 0.7;
      default:
        return value.toString().trim().length > 5 ? 1 : 0.6;
    }
  }

  getPerformanceGrade(percentage) {
    if (percentage >= 95) return 'Excellent';
    if (percentage >= 85) return 'Good';
    if (percentage >= 70) return 'Acceptable';
    return 'Poor';
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ===== ENTERPRISE CONFIG LOADER =====
async function loadEnterpriseConfig() {
  try {
    const response = await fetch(chrome.runtime.getURL('config/enterprise-sites.json'));
    if (response.ok) {
      const config = await response.json();
      AI_CONFIG.enterpriseConfig = config;
      AI_CONFIG.configVersion = config.version || 'day8-v1.0';
      BackgroundLogger.info('✅ Enterprise config loaded', {
        version: AI_CONFIG.configVersion,
        sites: Object.keys(config.sites || {}).length
      });
      return config;
    }
  } catch (error) {
    BackgroundLogger.warn('Failed to load enterprise config', { error: error.message });
  }
  return null;
}

// ===== LOGGING SYSTEM =====
const BackgroundLogger = {
  _getOptimizedTimestamp() {
    return new Date().toISOString();
  },

  _formatMetadata(meta) {
    if (!meta || Object.keys(meta).length === 0) return '';
    return ' ' + JSON.stringify(meta);
  },

  info: (msg, meta = {}) => {
    const timestamp = BackgroundLogger._getOptimizedTimestamp();
    const metaStr = BackgroundLogger._formatMetadata(meta);
    console.log(`[${timestamp}] [Background] ℹ️ ${msg}${metaStr}`);
  },
  
  warn: (msg, meta = {}) => {
    const timestamp = BackgroundLogger._getOptimizedTimestamp();
    const metaStr = BackgroundLogger._formatMetadata(meta);
    console.warn(`[${timestamp}] [Background] ⚠️ ${msg}${metaStr}`);
  },
  
  error: (msg, meta = {}) => {
    const timestamp = BackgroundLogger._getOptimizedTimestamp();
    const metaStr = BackgroundLogger._formatMetadata(meta);
    console.error(`[${timestamp}] [Background] ❌ ${msg}${metaStr}`);
  },

  success: (msg, meta = {}) => {
    const timestamp = BackgroundLogger._getOptimizedTimestamp();
    const metaStr = BackgroundLogger._formatMetadata(meta);
    console.log(`[${timestamp}] [Background] ✅ ${msg}${metaStr}`);
  },

  debug: (msg, meta = {}) => {
    const timestamp = BackgroundLogger._getOptimizedTimestamp();
    const metaStr = BackgroundLogger._formatMetadata(meta);
    console.debug(`[${timestamp}] [Background] 🔍 ${msg}${metaStr}`);
  }
};

// ===== STORAGE OPERATIONS =====
async function robustStorageOperation(operation, data = null, key = null) {
  return new Promise((resolve, reject) => {
    const callback = (result) => {
      if (chrome.runtime.lastError) {
        BackgroundLogger.error(`Storage operation failed: ${operation}`, {
          error: chrome.runtime.lastError.message
        });
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    };

    switch (operation) {
      case 'get': 
        chrome.storage.local.get(key, callback); 
        break;
      case 'set': 
        chrome.storage.local.set(data, callback); 
        break;
      case 'remove': 
        chrome.storage.local.remove(key, callback); 
        break;
      case 'clear':
        chrome.storage.local.clear(callback);
        break;
      default: 
        reject(new Error(`Unknown storage operation: ${operation}`));
    }
  });
}

// ===== API KEY VALIDATION =====
function validateApiKeyFormat(apiKey) {
  const patterns = [
    /^AIza[0-9A-Za-z_-]{35}$/,        // Standard Google API key format
    /^[A-Za-z0-9_-]{30,}$/,           // Generic long API key format
    /^sk-[A-Za-z0-9]{20,}$/           // OpenAI format (future compatibility)
  ];
  return patterns.some(pattern => pattern.test(apiKey));
}

// ===== GET CURRENT TAB =====
async function getCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  } catch (error) {
    BackgroundLogger.error('Failed to get current tab', { error: error.message });
    return null;
  }
}

// ===== MAIN EXTRACTION FUNCTION =====
async function performIntelligentExtraction(requestedTabId = null) {
  try {
    // Get active tab
    let targetTab = null;
    
    if (requestedTabId) {
      try {
        targetTab = await chrome.tabs.get(requestedTabId);
      } catch (error) {
        BackgroundLogger.warn('Provided tab ID invalid, getting active tab');
      }
    }
    
    if (!targetTab) {
      targetTab = await getCurrentTab();
    }
    
    if (!targetTab) {
      throw new Error('No active tab found');
    }
    
    // Create enhanced intelligent extractor
    const extractor = new EnhancedIntelligentExtractor(AI_CONFIG);
    
    // Perform intelligent extraction
    const extractedData = await extractor.performIntelligentExtraction(targetTab.id, targetTab.url);
    
    return extractedData;
    
  } catch (error) {
    BackgroundLogger.error('Main extraction function failed', { error: error.message });
    return { error: 'Extraction failed: ' + error.message };
  }
}

// ===== SYSTEM HEALTH MONITOR =====
class SystemHealthMonitor {
  constructor() {
    this.healthMetrics = {
      lastHeartbeat: Date.now(),
      extractionCount: 0,
      errorCount: 0,
      avgResponseTime: 0,
      memoryUsage: 0,
      tabCount: 0
    };
    
    // Start health monitoring
    this.startHealthMonitoring();
  }

  startHealthMonitoring() {
    // Update health metrics every 30 seconds
    setInterval(() => {
      this.updateHealthMetrics();
    }, 30000);
  }

  async updateHealthMetrics() {
    try {
      this.healthMetrics.lastHeartbeat = Date.now();
      this.healthMetrics.tabCount = tabManager.getOpenTabsInfo().count;
      
      // Estimate memory usage
      if (performance && performance.memory) {
        this.healthMetrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      }
      
      BackgroundLogger.debug('System health updated', this.healthMetrics);
      
    } catch (error) {
      BackgroundLogger.error('Health monitoring error', { error: error.message });
    }
  }

  recordExtraction(success, responseTime) {
    this.healthMetrics.extractionCount++;
    if (!success) {
      this.healthMetrics.errorCount++;
    }
    
    // Update average response time
    const currentAvg = this.healthMetrics.avgResponseTime || responseTime;
    this.healthMetrics.avgResponseTime = Math.round((currentAvg + responseTime) / 2);
  }

  getHealthStatus() {
    const errorRate = this.healthMetrics.extractionCount > 0 
      ? (this.healthMetrics.errorCount / this.healthMetrics.extractionCount) * 100 
      : 0;
    
    let status = 'HEALTHY';
    if (errorRate > 20) status = 'UNHEALTHY';
    else if (errorRate > 10) status = 'WARNING';
    
    return {
      status: status,
      metrics: this.healthMetrics,
      errorRate: Math.round(errorRate),
      uptime: Date.now() - (this.healthMetrics.lastHeartbeat - 30000),
      tabsManaged: this.healthMetrics.tabCount
    };
  }
}

// Initialize system health monitor
const healthMonitor = new SystemHealthMonitor();

// ===== SYSTEM INITIALIZATION =====
(async () => {
  try {
    BackgroundLogger.info('🚀 Initializing Day 8+9 ULTIMATE ENTERPRISE CHAMPION system');
    
    // Load enterprise configuration
    await loadEnterpriseConfig();
    
    // Load stored API key
    const result = await robustStorageOperation('get', null, ['geminiApiKey']);

    if (result.geminiApiKey) {
      AI_CONFIG.apiKey = result.geminiApiKey;
      BackgroundLogger.success('API key loaded - AI Intelligence ready');
    } else {
      BackgroundLogger.info('No API key found, DOM extraction only');
    }
    
    // Clean up any orphaned tabs on startup
    await tabManager.closeAllTabs('startup-cleanup');
    
    BackgroundLogger.success('🏆 Day 8+9 ULTIMATE ENTERPRISE CHAMPION EXTRACTION system initialized');
    
  } catch (initError) {
    BackgroundLogger.error('System initialization error', { error: initError.message });
  }
})();

// ===== ENHANCED MESSAGE LISTENER =====
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const startTime = Date.now();
  
  BackgroundLogger.info(`📨 Request received: ${request.action}`, {
    sender: sender.tab ? `Tab ${sender.tab.id}` : 'Extension'
  });
  
  switch (request.action) {
    case 'extractPageData':
    case 'extractData':
      (async () => {
        try {
          const extractedData = await performIntelligentExtraction();
          const responseTime = Date.now() - startTime;
          
          if (extractedData.error) {
            healthMonitor.recordExtraction(false, responseTime);
            sendResponse({
              success: false,
              error: extractedData.error,
              version: DAY8_VERSION,
              responseTime: responseTime
            });
            return;
          }
          
          healthMonitor.recordExtraction(true, responseTime);
          sendResponse({
            success: true,
            data: extractedData,
            day8Version: true,
            day9Analytics: true,
            intelligentExtraction: true,
            aiPowered: !!AI_CONFIG.apiKey,
            bulletproof: true,
            smartTabManagement: true,
            extractedAt: new Date().toISOString(),
            version: DAY8_VERSION,
            configVersion: AI_CONFIG.configVersion,
            responseTime: responseTime
          });
        } catch (error) {
          const responseTime = Date.now() - startTime;
          healthMonitor.recordExtraction(false, responseTime);
          sendResponse({
            success: false,
            error: error.message,
            version: DAY8_VERSION,
            responseTime: responseTime
          });
        }
      })();
      return true;

    case 'getEnterpriseConfig':
      sendResponse({
        success: true,
        config: AI_CONFIG.enterpriseConfig,
        version: AI_CONFIG.configVersion,
        loaded: !!AI_CONFIG.enterpriseConfig,
        sites: AI_CONFIG.enterpriseConfig ? Object.keys(AI_CONFIG.enterpriseConfig.sites).length : 0
      });
      return false;

    case 'reloadConfig':
      (async () => {
        try {
          await loadEnterpriseConfig();
          sendResponse({
            success: true,
            message: 'Enterprise configuration reloaded successfully',
            version: AI_CONFIG.configVersion,
            sites: AI_CONFIG.enterpriseConfig ? Object.keys(AI_CONFIG.enterpriseConfig.sites).length : 0
          });
        } catch (error) {
          sendResponse({ 
            success: false, 
            error: error.message 
          });
        }
      })();
      return true;

    case 'setApiKey':
      (async () => {
        try {
          if (!request.apiKey?.trim()) {
            sendResponse({ 
              success: false, 
              error: 'Please provide a valid API key' 
            });
            return;
          }

          const apiKey = request.apiKey.trim();
          
          if (!validateApiKeyFormat(apiKey)) {
            sendResponse({ 
              success: false, 
              error: 'Invalid API key format. Please provide a valid Gemini API key.' 
            });
            return;
          }

          AI_CONFIG.apiKey = apiKey;
          await robustStorageOperation('set', { geminiApiKey: apiKey });
          
          BackgroundLogger.success('API key configured - AI intelligence enabled');
          sendResponse({
            success: true,
            message: 'Day 8+9 AI Intelligence enabled successfully',
            aiEnabled: true,
            version: DAY8_VERSION
          });
        } catch (error) {
          sendResponse({ 
            success: false, 
            error: error.message 
          });
        }
      })();
      return true;

    case 'getApiKey':
      sendResponse({
        hasKey: !!AI_CONFIG.apiKey,
        day8Version: true,
        day9Analytics: true,
        intelligentExtraction: true,
        aiEnabled: !!AI_CONFIG.apiKey,
        bulletproof: true,
        smartTabManagement: true,
        keyLength: AI_CONFIG.apiKey ? AI_CONFIG.apiKey.length : 0,
        enterpriseReady: true,
        modulesLoaded: true,
        criticalModulesLoaded: true,
        configLoaded: !!AI_CONFIG.enterpriseConfig,
        version: DAY8_VERSION,
        configVersion: AI_CONFIG.configVersion
      });
      return false;

    case 'runStressTest':
    case 'runRealStressTest':
    case 'runAnalytics':
      (async () => {
        try {
          BackgroundLogger.info('🔬 Starting comprehensive analytics test');
          
          // Create enhanced analytics engine
          const analyticsEngine = new EnhancedRealAnalyticsEngine(AI_CONFIG);
          analyticsEngine.startTime = Date.now();
          
          // Run advanced analytics test with smart tab management
          const realAnalytics = await analyticsEngine.runAdvancedAnalyticsTest();
          
          const responseTime = Date.now() - startTime;
          
          sendResponse({
            success: true,
            message: 'Day 8+9 ULTIMATE analytics test completed with smart tab management',
            realAnalytics: true,
            liveExtractions: true,
            smartTabManagement: true,
            simulationResults: realAnalytics,
            version: DAY8_VERSION,
            responseTime: responseTime,
            tabsCreated: realAnalytics.analytics?.tabsCreated || 0,
            tabsCleaned: realAnalytics.analytics?.tabsCleanedUp || 0
          });
        } catch (error) {
          // Emergency cleanup
          await tabManager.closeAllTabs('emergency-analytics-error');
          
          const responseTime = Date.now() - startTime;
          sendResponse({
            success: false,
            error: error.message,
            version: DAY8_VERSION,
            responseTime: responseTime
          });
        }
      })();
      return true;

    case 'getSystemStatus':
      const tabInfo = tabManager.getOpenTabsInfo();
      const healthStatus = healthMonitor.getHealthStatus();
      
      sendResponse({
        modulesLoaded: true,
        criticalModulesLoaded: true,
        enterpriseConfigLoaded: !!AI_CONFIG.enterpriseConfig,
        analyticsReady: true,
        intelligentExtraction: true,
        aiEnabled: !!AI_CONFIG.apiKey,
        bulletproof: true,
        smartTabManagement: true,
        day8Version: DAY8_VERSION,
        day9Analytics: true,
        configVersion: AI_CONFIG.configVersion,
        version: DAY8_VERSION,
        
        // Enhanced system status
        tabManager: {
          openTabs: tabInfo.count,
          tabDetails: tabInfo.tabs
        },
        healthStatus: healthStatus,
        systemUptime: Date.now() - AI_CONFIG.cache.configTimestamp,
        memoryUsage: healthStatus.metrics.memoryUsage + 'MB'
      });
      return false;

    case 'cleanupTabs':
      (async () => {
        try {
          const tabInfo = tabManager.getOpenTabsInfo();
          await tabManager.closeAllTabs('manual-cleanup');
          
          sendResponse({
            success: true,
            message: `Successfully closed ${tabInfo.count} tabs`,
            tabsClosed: tabInfo.count,
            version: DAY8_VERSION
          });
        } catch (error) {
          sendResponse({
            success: false,
            error: error.message,
            version: DAY8_VERSION
          });
        }
      })();
      return true;

    case 'getHealthStatus':
      sendResponse({
        success: true,
        healthStatus: healthMonitor.getHealthStatus(),
        tabManager: tabManager.getOpenTabsInfo(),
        version: DAY8_VERSION
      });
      return false;

    case 'exportAnalyticsData':
      (async () => {
        try {
          const analyticsData = Array.from(AI_CONFIG.cache.extractionResults.entries()).map(([id, report]) => ({
            analyticsId: id,
            timestamp: report.reportMetadata?.timestamp,
            overallAccuracy: report.overallAccuracy,
            trajectory: report.trajectory,
            sites: report.sites,
            executiveSummary: report.executiveSummary
          }));
          
          sendResponse({
            success: true,
            data: analyticsData,
            count: analyticsData.length,
            exportedAt: new Date().toISOString(),
            version: DAY8_VERSION
          });
        } catch (error) {
          sendResponse({
            success: false,
            error: error.message,
            version: DAY8_VERSION
          });
        }
      })();
      return true;

    default:
      sendResponse({ 
        success: false, 
        error: 'Unknown action: ' + request.action, 
        version: DAY8_VERSION 
      });
      return false;
  }
});

// ===== CLEANUP ON EXTENSION UNLOAD =====
chrome.runtime.onSuspend.addListener(async () => {
  BackgroundLogger.info('🧹 Extension suspending - cleaning up resources');
  try {
    await tabManager.closeAllTabs('extension-suspend');
  } catch (error) {
    BackgroundLogger.error('Cleanup error during suspend', { error: error.message });
  }
});

// ===== PERIODIC CLEANUP =====
setInterval(async () => {
  try {
    const tabInfo = tabManager.getOpenTabsInfo();
    if (tabInfo.count > 0) {
      BackgroundLogger.debug('Periodic tab cleanup check', { 
        openTabs: tabInfo.count 
      });
      
      // Close tabs older than max lifetime
      const now = Date.now();
      const oldTabs = tabInfo.tabs.filter(tab => tab.age > AI_CONFIG.maxTabLifetime);
      
      for (const oldTab of oldTabs) {
        await tabManager.closeTab(oldTab.tabId, 'periodic-cleanup');
      }
    }
  } catch (error) {
    BackgroundLogger.error('Periodic cleanup error', { error: error.message });
  }
}, 60000); // Every minute

BackgroundLogger.success(`🏆 Day 8+9 ULTIMATE ENTERPRISE CHAMPION AI-POWERED EXTRACTION system initialized | Version: ${DAY8_VERSION} | Ready for ACTION!`);

