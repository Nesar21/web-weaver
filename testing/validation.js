// Day 8: Validation Manager Module - Championship AI-Powered Enterprise Edition
// /src/modules/validation.js

// ===== CACHED VALIDATION CONSTANTS FOR PERFORMANCE =====
const STANDARD_VALIDATION_FIELDS = [
  'title', 'author', 'publication_date', 'main_content_summary', 
  'category', 'description'
];

const ARRAY_VALIDATION_FIELDS = [
  'ingredients', 'instructions', 'links', 'images'
];

const FORMAT_VALIDATION_FIELDS = [
  'price', 'reviews_rating', 'publication_date'
];

// Enhanced cached regex patterns with image URL validation
const VALIDATION_PATTERNS = {
  price: /^\$?\d+(\.\d{1,2})?$/,
  rating: /^(\d+(\.\d+)?\/5|\d+(\.\d+)?)$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  imageUrl: /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i,
  ingredient: /^[a-zA-Z0-9\s\-,()\.\/]+$/,
  currency: /^\$?[\d,]+\.?\d{0,2}$/
};

// Enhanced site-specific validation rules with customizable thresholds
let SITE_VALIDATION_RULES = {
  'amazon': {
    required: ['title', 'price', 'description'],
    critical: ['price', 'reviews_rating'],
    arrayMinimums: { images: 1 },
    customThresholds: { price: { min: 0, max: 10000 }, rating: { min: 1, max: 5 } },
    penaltyWeights: { CRITICAL: 35, HIGH: 25, MEDIUM: 15, LOW: 10, WARNING: 5 }
  },
  'allrecipes': {
    required: ['title', 'ingredients', 'instructions'],
    critical: ['ingredients', 'instructions'],
    arrayMinimums: { ingredients: 3, instructions: 2 },
    customThresholds: { ingredients: { min: 2, max: 50 }, instructions: { min: 2, max: 30 } },
    penaltyWeights: { CRITICAL: 30, HIGH: 20, MEDIUM: 15, LOW: 10, WARNING: 5 }
  },
  'bloomberg': {
    required: ['title', 'author', 'publication_date', 'main_content_summary'],
    critical: ['author', 'publication_date'],
    arrayMinimums: {},
    customThresholds: { content_length: { min: 100, max: 5000 } },
    penaltyWeights: { CRITICAL: 40, HIGH: 25, MEDIUM: 15, LOW: 8, WARNING: 3 }
  },
  'wikipedia': {
    required: ['title', 'main_content_summary'],
    critical: ['main_content_summary'],
    arrayMinimums: { links: 2 },
    customThresholds: { links: { min: 1, max: 100 } },
    penaltyWeights: { CRITICAL: 30, HIGH: 20, MEDIUM: 15, LOW: 10, WARNING: 5 }
  },
  'medium': {
    required: ['title', 'author', 'main_content_summary'],
    critical: ['author'],
    arrayMinimums: {},
    customThresholds: { content_length: { min: 200, max: 10000 } },
    penaltyWeights: { CRITICAL: 30, HIGH: 20, MEDIUM: 15, LOW: 10, WARNING: 5 }
  },
  'generic': {
    required: ['title'],
    critical: [],
    arrayMinimums: {},
    customThresholds: {},
    penaltyWeights: { CRITICAL: 30, HIGH: 20, MEDIUM: 15, LOW: 10, WARNING: 5 }
  }
};

// Default penalty severity weights (fallback)
const DEFAULT_PENALTY_SEVERITY_WEIGHTS = {
  'CRITICAL': 30,
  'HIGH': 20,
  'MEDIUM': 15,
  'LOW': 10,
  'WARNING': 5
};

// Performance analytics cache with AI anomaly detection
const VALIDATION_ANALYTICS_CACHE = new Map();

// External validation plugins registry
const VALIDATION_PLUGINS = new Map();

// AI-driven anomaly detection cache
const ANOMALY_DETECTION_CACHE = new Map();

// Parallel validation worker pool
const VALIDATION_WORKER_POOL = [];

const ValidationManager = {
  VERSION: 'day8-validation-v3.0', // Major version for enterprise features
  
  // ===== PARALLEL/ASYNC VALIDATION FOR LARGE DATASETS =====
  async executeParallelValidation(datasets, siteType, AI_CONFIG) {
    if (!Array.isArray(datasets) || datasets.length <= 1) {
      return this.executeUnifiedValidation(datasets[0] || {}, siteType, AI_CONFIG);
    }

    this.debugLog(`Starting parallel validation for ${datasets.length} datasets`, {
      siteType,
      datasetCount: datasets.length
    });

    const chunkSize = Math.max(1, Math.floor(datasets.length / 4)); // 4 parallel workers
    const chunks = this.chunkArray(datasets, chunkSize);
    
    const validationPromises = chunks.map((chunk, index) => 
      this.validateChunkAsync(chunk, siteType, AI_CONFIG, index)
    );

    try {
      const results = await Promise.allSettled(validationPromises);
      
      // Aggregate results
      const aggregatedResult = this.aggregateParallelResults(results);
      
      this.debugLog(`Parallel validation completed`, {
        totalDatasets: datasets.length,
        chunks: chunks.length,
        successfulChunks: results.filter(r => r.status === 'fulfilled').length
      });

      return aggregatedResult;

    } catch (error) {
      this.debugLog(`Parallel validation error`, { error: error.message });
      throw error;
    }
  },

  async validateChunkAsync(chunk, siteType, AI_CONFIG, workerIndex) {
    const chunkResults = [];
    
    for (const data of chunk) {
      try {
        const result = this.executeUnifiedValidation(data, siteType, AI_CONFIG);
        chunkResults.push({ success: true, result });
      } catch (error) {
        chunkResults.push({ success: false, error: error.message, data });
      }
    }
    
    return { workerIndex, results: chunkResults };
  },

  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  },

  aggregateParallelResults(results) {
    const allResults = [];
    const errors = [];
    let totalDuration = 0;

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        result.value.results.forEach(r => {
          if (r.success) {
            allResults.push(r.result);
          } else {
            errors.push(r.error);
          }
        });
      } else {
        errors.push(result.reason);
      }
    });

    return {
      validatedResults: allResults,
      errors: errors,
      parallelProcessing: true,
      workersUsed: results.length,
      metadata: {
        totalResults: allResults.length,
        totalErrors: errors.length,
        parallelEfficiency: allResults.length / (allResults.length + errors.length)
      }
    };
  },

  // ===== CUSTOMIZABLE THRESHOLDS PER SITE =====
  updateSiteValidationRules(siteType, customRules) {
    if (SITE_VALIDATION_RULES[siteType]) {
      SITE_VALIDATION_RULES[siteType] = {
        ...SITE_VALIDATION_RULES[siteType],
        ...customRules,
        lastUpdated: new Date().toISOString()
      };
      
      this.debugLog(`Updated validation rules for ${siteType}`, customRules);
      return true;
    }
    return false;
  },

  getSiteValidationRules(siteType) {
    return SITE_VALIDATION_RULES[siteType] || SITE_VALIDATION_RULES['generic'];
  },

  // ===== AI-DRIVEN ANOMALY DETECTION USING HISTORICAL CACHE =====
  detectAnomalies(siteType, currentMetrics) {
    const historicalData = VALIDATION_ANALYTICS_CACHE.get(siteType);
    if (!historicalData || historicalData.validations.length < 10) {
      return { anomalies: [], confidence: 'LOW', reason: 'INSUFFICIENT_HISTORICAL_DATA' };
    }

    const recent = historicalData.validations.slice(-20);
    const anomalies = [];

    // Penalty count anomaly detection
    const avgPenalties = recent.reduce((sum, v) => sum + v.penalties, 0) / recent.length;
    const stdDevPenalties = Math.sqrt(recent.reduce((sum, v) => sum + Math.pow(v.penalties - avgPenalties, 2), 0) / recent.length);
    
    if (Math.abs(currentMetrics.penalties - avgPenalties) > 2 * stdDevPenalties) {
      anomalies.push({
        type: 'PENALTY_COUNT_ANOMALY',
        expected: Math.round(avgPenalties),
        actual: currentMetrics.penalties,
        severity: Math.abs(currentMetrics.penalties - avgPenalties) > 3 * stdDevPenalties ? 'HIGH' : 'MEDIUM',
        confidence: this.calculateAnomalyConfidence(recent.length, stdDevPenalties)
      });
    }

    // Accuracy drop anomaly detection
    const avgAccuracy = recent.reduce((sum, v) => sum + v.accuracy, 0) / recent.length;
    const accuracyThreshold = avgAccuracy * 0.15; // 15% drop threshold
    
    if (avgAccuracy - currentMetrics.accuracy > accuracyThreshold) {
      anomalies.push({
        type: 'ACCURACY_DROP_ANOMALY',
        expected: Math.round(avgAccuracy),
        actual: Math.round(currentMetrics.accuracy),
        severity: 'HIGH',
        confidence: this.calculateAnomalyConfidence(recent.length, accuracyThreshold)
      });
    }

    // Cache anomaly results
    ANOMALY_DETECTION_CACHE.set(`${siteType}_${Date.now()}`, {
      anomalies,
      timestamp: new Date().toISOString(),
      historicalSampleSize: recent.length
    });

    return {
      anomalies,
      confidence: anomalies.length > 0 ? 'HIGH' : 'NORMAL',
      historicalSampleSize: recent.length,
      baselineMetrics: { avgPenalties: Math.round(avgPenalties), avgAccuracy: Math.round(avgAccuracy) }
    };
  },

  calculateAnomalyConfidence(sampleSize, deviation) {
    if (sampleSize > 30 && deviation > 1) return 'HIGH';
    if (sampleSize > 15 && deviation > 0.5) return 'MEDIUM';
    return 'LOW';
  },

  // ===== ENHANCED ARRAY ITEM VALIDATION =====
  validateArrayItem(fieldName, item, siteType = 'generic') {
    const siteRules = this.getSiteValidationRules(siteType);
    
    switch (fieldName) {
      case 'links':
        if (typeof item === 'string') {
          return VALIDATION_PATTERNS.url.test(item) && item.length > 10;
        }
        return false;
        
      case 'images':
        if (typeof item === 'string') {
          // Enhanced image URL verification
          const isValidUrl = VALIDATION_PATTERNS.url.test(item);
          const hasImageExtension = VALIDATION_PATTERNS.imageUrl.test(item);
          const hasMinLength = item.length > 10;
          
          return isValidUrl && (hasImageExtension || item.includes('image') || item.includes('img'));
        }
        return false;
        
      case 'ingredients':
        if (typeof item === 'string') {
          const trimmed = item.trim();
          // Enhanced ingredient format validation
          const hasValidFormat = VALIDATION_PATTERNS.ingredient.test(trimmed);
          const hasMinLength = trimmed.length >= 3;
          const notJustNumbers = !/^\d+$/.test(trimmed);
          
          return hasValidFormat && hasMinLength && notJustNumbers;
        }
        return false;
        
      case 'instructions':
        if (typeof item === 'string') {
          const trimmed = item.trim();
          return trimmed.length >= 10 && trimmed.split(' ').length >= 3;
        }
        return false;
        
      default:
        return typeof item === 'string' && item.trim().length > 0;
    }
  },

  // ===== VISUALIZATION/DASHBOARD INTEGRATION =====
  generateDashboardMetrics(timeRange = '24h') {
    const cutoffTime = this.getTimeRangeCutoff(timeRange);
    const dashboardData = {
      timestamp: new Date().toISOString(),
      timeRange,
      version: this.VERSION,
      siteMetrics: {},
      globalMetrics: {
        totalValidations: 0,
        totalAnomalies: 0,
        averageAccuracy: 0,
        topPenaltyReasons: {}
      }
    };

    VALIDATION_ANALYTICS_CACHE.forEach((analytics, siteType) => {
      const recentValidations = analytics.validations.filter(v => 
        new Date(v.timestamp) > cutoffTime
      );

      if (recentValidations.length > 0) {
        const siteMetric = {
          validationCount: recentValidations.length,
          averageAccuracy: recentValidations.reduce((sum, v) => sum + v.accuracy, 0) / recentValidations.length,
          averagePenalties: recentValidations.reduce((sum, v) => sum + v.penalties, 0) / recentValidations.length,
          trend: this.calculateTrend(recentValidations),
          qualityGrade: this.calculateQualityGrade(
            recentValidations.reduce((sum, v) => sum + v.accuracy, 0) / recentValidations.length,
            recentValidations.reduce((sum, v) => sum + v.penaltyImpact, 0) / recentValidations.length || 0
          )
        };

        dashboardData.siteMetrics[siteType] = siteMetric;
        dashboardData.globalMetrics.totalValidations += siteMetric.validationCount;
      }
    });

    // Calculate global averages
    const siteCount = Object.keys(dashboardData.siteMetrics).length;
    if (siteCount > 0) {
      dashboardData.globalMetrics.averageAccuracy = Object.values(dashboardData.siteMetrics)
        .reduce((sum, metrics) => sum + metrics.averageAccuracy, 0) / siteCount;
    }

    // Count anomalies in time range
    dashboardData.globalMetrics.totalAnomalies = Array.from(ANOMALY_DETECTION_CACHE.keys())
      .filter(key => {
        const timestamp = parseInt(key.split('_').pop());
        return timestamp > cutoffTime.getTime();
      }).length;

    return dashboardData;
  },

  getTimeRangeCutoff(timeRange) {
    const now = new Date();
    switch (timeRange) {
      case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
      case '6h': return new Date(now.getTime() - 6 * 60 * 60 * 1000);
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      default: return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  },

  calculateTrend(validations) {
    if (validations.length < 3) return 'INSUFFICIENT_DATA';
    
    const recent = validations.slice(-3);
    const older = validations.slice(-6, -3);
    
    if (older.length === 0) return 'INSUFFICIENT_DATA';
    
    const recentAvg = recent.reduce((sum, v) => sum + v.accuracy, 0) / recent.length;
    const olderAvg = older.reduce((sum, v) => sum + v.accuracy, 0) / older.length;
    
    const change = recentAvg - olderAvg;
    
    if (change > 5) return 'IMPROVING';
    if (change < -5) return 'DECLINING';
    return 'STABLE';
  },

  // ===== MODULAR PLUGIN SYSTEM =====
  registerValidationPlugin(name, plugin) {
    if (typeof plugin.validate !== 'function') {
      throw new Error('Validation plugin must have a validate method');
    }
    
    VALIDATION_PLUGINS.set(name, {
      ...plugin,
      registeredAt: new Date().toISOString(),
      version: plugin.version || '1.0.0'
    });
    
    this.debugLog(`Registered validation plugin: ${name}`, {
      version: plugin.version,
      methods: Object.keys(plugin)
    });
    
    return true;
  },

  unregisterValidationPlugin(name) {
    const removed = VALIDATION_PLUGINS.delete(name);
    if (removed) {
      this.debugLog(`Unregistered validation plugin: ${name}`);
    }
    return removed;
  },

  executePluginValidation(data, siteType, AI_CONFIG) {
    const pluginResults = [];
    
    VALIDATION_PLUGINS.forEach((plugin, name) => {
      try {
        const result = plugin.validate(data, siteType, AI_CONFIG);
        pluginResults.push({
          plugin: name,
          version: plugin.version,
          success: true,
          result
        });
      } catch (error) {
        pluginResults.push({
          plugin: name,
          version: plugin.version,
          success: false,
          error: error.message
        });
      }
    });
    
    return pluginResults;
  },

  // ===== IMPROVED TRAJECTORY/FORECASTING ANALYSIS =====
  generateValidationForecast(siteType, forecastDays = 7) {
    const analytics = VALIDATION_ANALYTICS_CACHE.get(siteType);
    if (!analytics || analytics.validations.length < 10) {
      return { forecast: [], confidence: 'LOW', reason: 'INSUFFICIENT_DATA' };
    }

    const recent = analytics.validations.slice(-30); // Use last 30 validations
    const forecast = [];
    
    // Simple linear regression for trend prediction
    const { slope, intercept } = this.calculateLinearRegression(
      recent.map((v, i) => i),
      recent.map(v => v.accuracy)
    );
    
    // Generate forecast points
    for (let day = 1; day <= forecastDays; day++) {
      const predictedAccuracy = Math.max(0, Math.min(100, 
        slope * (recent.length + day) + intercept
      ));
      
      forecast.push({
        day,
        predictedAccuracy: Math.round(predictedAccuracy * 100) / 100,
        confidence: this.calculateForecastConfidence(day, recent.length),
        trend: slope > 0.5 ? 'IMPROVING' : slope < -0.5 ? 'DECLINING' : 'STABLE'
      });
    }
    
    return {
      forecast,
      confidence: recent.length > 20 ? 'HIGH' : recent.length > 10 ? 'MEDIUM' : 'LOW',
      trendSlope: Math.round(slope * 1000) / 1000,
      baselineAccuracy: Math.round(intercept * 100) / 100,
      samplesUsed: recent.length
    };
  },

  calculateLinearRegression(xValues, yValues) {
    const n = xValues.length;
    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = yValues.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  },

  calculateForecastConfidence(dayOffset, sampleSize) {
    if (sampleSize < 10) return 'LOW';
    if (dayOffset > 7) return 'LOW';
    if (sampleSize > 20 && dayOffset <= 3) return 'HIGH';
    return 'MEDIUM';
  },

  // ===== UNIT TESTS / SCHEMA VALIDATION =====
  runValidationTests() {
    const testSuite = {
      timestamp: new Date().toISOString(),
      version: this.VERSION,
      tests: [],
      summary: { passed: 0, failed: 0, total: 0 }
    };

    // Test 1: Basic validation functionality
    testSuite.tests.push(this.testBasicValidation());
    
    // Test 2: Site-specific rules
    testSuite.tests.push(this.testSiteSpecificRules());
    
    // Test 3: Array validation
    testSuite.tests.push(this.testArrayValidation());
    
    // Test 4: Plugin system
    testSuite.tests.push(this.testPluginSystem());
    
    // Test 5: Anomaly detection
    testSuite.tests.push(this.testAnomalyDetection());

    // Calculate summary
    testSuite.tests.forEach(test => {
      testSuite.summary.total++;
      if (test.passed) {
        testSuite.summary.passed++;
      } else {
        testSuite.summary.failed++;
      }
    });

    testSuite.summary.passRate = (testSuite.summary.passed / testSuite.summary.total) * 100;

    this.debugLog('Validation test suite completed', testSuite.summary);
    
    return testSuite;
  },

  testBasicValidation() {
    try {
      const testData = { title: 'Test Title', author: 'Test Author' };
      const result = this.executeUnifiedValidation(testData, 'generic', {});
      
      return {
        name: 'Basic Validation',
        passed: result && result.validatedData && result.penalties !== undefined,
        details: 'Tests basic validation pipeline functionality'
      };
    } catch (error) {
      return {
        name: 'Basic Validation',
        passed: false,
        error: error.message
      };
    }
  },

  testSiteSpecificRules() {
    try {
      const testData = { title: 'Amazon Product' };
      const result = this.executeUnifiedValidation(testData, 'amazon', {});
      
      // Amazon requires price, so should have penalty
      const hasPricePenalty = result.penalties.some(p => p.field === 'price');
      
      return {
        name: 'Site-Specific Rules',
        passed: hasPricePenalty,
        details: 'Tests site-specific validation rules enforcement'
      };
    } catch (error) {
      return {
        name: 'Site-Specific Rules',
        passed: false,
        error: error.message
      };
    }
  },

  testArrayValidation() {
    try {
      const testData = { 
        ingredients: ['salt', 'pepper'], 
        links: ['invalid-link', 'https://example.com'] 
      };
      const result = this.executeUnifiedValidation(testData, 'allrecipes', {});
      
      // Should have penalty for insufficient ingredients and invalid link
      const hasIngredientPenalty = result.penalties.some(p => p.field === 'ingredients');
      
      return {
        name: 'Array Validation',
        passed: hasIngredientPenalty,
        details: 'Tests array field validation and item validation'
      };
    } catch (error) {
      return {
        name: 'Array Validation',
        passed: false,
        error: error.message
      };
    }
  },

  testPluginSystem() {
    try {
      // Register test plugin
      const testPlugin = {
        version: '1.0.0',
        validate: (data, siteType) => ({ customCheck: data.title ? 'PASS' : 'FAIL' })
      };
      
      this.registerValidationPlugin('testPlugin', testPlugin);
      const pluginCount = VALIDATION_PLUGINS.size;
      this.unregisterValidationPlugin('testPlugin');
      
      return {
        name: 'Plugin System',
        passed: pluginCount > 0,
        details: 'Tests plugin registration and execution system'
      };
    } catch (error) {
      return {
        name: 'Plugin System',
        passed: false,
        error: error.message
      };
    }
  },

  testAnomalyDetection() {
    try {
      // Simulate historical data
      const mockAnalytics = {
        validations: Array.from({ length: 15 }, (_, i) => ({
          timestamp: new Date(Date.now() - i * 60000).toISOString(),
          penalties: 2,
          accuracy: 85
        }))
      };
      
      VALIDATION_ANALYTICS_CACHE.set('testSite', mockAnalytics);
      
      // Test anomaly detection with outlier
      const result = this.detectAnomalies('testSite', { penalties: 10, accuracy: 50 });
      
      VALIDATION_ANALYTICS_CACHE.delete('testSite');
      
      return {
        name: 'Anomaly Detection',
        passed: result.anomalies.length > 0,
        details: 'Tests AI-driven anomaly detection system'
      };
    } catch (error) {
      return {
        name: 'Anomaly Detection',
        passed: false,
        error: error.message
      };
    }
  },

  // ===== UNIFIED VALIDATION SYSTEM (Enhanced) =====
  executeUnifiedValidation(data, siteType, AI_CONFIG) {
    const validationStart = Date.now();
    const timestamp = new Date().toISOString();
    
    this.debugLog(`Starting unified validation for ${siteType}`, {
      siteType,
      fieldsToValidate: Object.keys(data || {}).length
    });

    // Priority: ValidatorManager -> Site-specific -> Fallback validation
    let validationResult;
    
    if (AI_CONFIG?.utilityStatus?.validator?.loaded && this.isModuleLoaded('ValidatorManager')) {
      this.debugLog(`Using championship ValidatorManager for ${siteType}`);
      validationResult = ValidatorManager.applyValidationPenalties(data, siteType);
      validationResult.method = 'ValidatorManager';
    } else {
      this.debugLog(`Using enhanced fallback validation for ${siteType}`);
      validationResult = this.applyEnhancedValidationPenalties(data, siteType, AI_CONFIG);
      validationResult.method = 'enhanced-fallback';
    }

    // Execute plugin validations
    const pluginResults = this.executePluginValidation(data, siteType, AI_CONFIG);
    validationResult.pluginResults = pluginResults;

    // Detect anomalies
    const anomalyResult = this.detectAnomalies(siteType, {
      penalties: validationResult.penalties?.length || 0,
      accuracy: validationResult.metadata?.validatedAccuracy || 0
    });
    validationResult.anomalies = anomalyResult;

    // Add validation performance metrics
    const validationDuration = Date.now() - validationStart;
    validationResult.performance = {
      duration: validationDuration,
      timestamp,
      version: this.VERSION
    };

    // Cache analytics data
    this.cacheValidationAnalytics(siteType, validationResult);

    this.debugLog(`Unified validation completed for ${siteType}`, {
      duration: validationDuration,
      penalties: validationResult.penalties?.length || 0,
      anomalies: anomalyResult.anomalies?.length || 0,
      method: validationResult.method
    });

    return validationResult;
  },

  // ===== ENHANCED FALLBACK VALIDATION WITH CONFIGURABLE PENALTIES =====
  applyEnhancedValidationPenalties(data, siteType = 'generic', AI_CONFIG = {}) {
    const penalties = [];
    const validatedData = {...data};
    const siteRules = this.getSiteValidationRules(siteType);
    
    // Use site-specific penalty weights if available
    const penaltyWeights = siteRules.penaltyWeights || DEFAULT_PENALTY_SEVERITY_WEIGHTS;
    
    // Phase 1: Standard field validation
    this.validateStandardFields(data, validatedData, penalties, penaltyWeights);
    
    // Phase 2: Array field validation with enhanced item validation
    this.validateArrayFieldsEnhanced(data, validatedData, penalties, siteRules, penaltyWeights);
    
    // Phase 3: Format validation
    this.validateFormats(data, validatedData, penalties, penaltyWeights);
    
    // Phase 4: Site-specific required fields
    this.validateRequiredFields(data, validatedData, penalties, siteRules, penaltyWeights);
    
    // Phase 5: Critical field validation
    this.validateCriticalFields(data, validatedData, penalties, siteRules, penaltyWeights);
    
    // Phase 6: Custom threshold validation
    this.validateCustomThresholds(data, validatedData, penalties, siteRules, penaltyWeights);

    // Calculate impact metrics
    const impactMetrics = this.calculateValidationImpact(data, validatedData, penalties);

    return {
      validatedData: validatedData,
      penalties: penalties,
      penaltyImpact: impactMetrics.penaltyImpact,
      businessRealismProof: penalties.length > 0,
      siteType: siteType,
      validationRules: siteRules,
      penaltyWeights: penaltyWeights,
      metadata: {
        ...impactMetrics,
        totalPenalties: penalties.length,
        criticalPenalties: penalties.filter(p => p.severity === 'CRITICAL').length,
        highPenalties: penalties.filter(p => p.severity === 'HIGH').length,
        validationMethod: 'enhanced-fallback-v3',
        version: this.VERSION
      }
    };
  },

  // ===== ENHANCED VALIDATION PHASES =====
  validateStandardFields(data, validatedData, penalties, penaltyWeights) {
    STANDARD_VALIDATION_FIELDS.forEach(field => {
      const value = data[field];
      
      if (value === null || value === undefined || value === '') {
        penalties.push(this.createPenalty(field, 'MISSING_REQUIRED_FIELD', value, 'HIGH', {}, penaltyWeights));
        validatedData[field] = null;
      } else if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
          penalties.push(this.createPenalty(field, 'EMPTY_STRING', value, 'MEDIUM', {}, penaltyWeights));
          validatedData[field] = null;
        } else if (trimmed.length < 5) {
          penalties.push(this.createPenalty(field, 'INSUFFICIENT_LENGTH', value, 'MEDIUM', {}, penaltyWeights));
          validatedData[field] = null;
        } else if (trimmed.length < 10 && field === 'title') {
          penalties.push(this.createPenalty(field, 'SHORT_TITLE', value, 'LOW', {}, penaltyWeights));
        }
      }
    });
  },

  validateArrayFieldsEnhanced(data, validatedData, penalties, siteRules, penaltyWeights) {
    ARRAY_VALIDATION_FIELDS.forEach(field => {
      const value = data[field];
      const minRequired = siteRules.arrayMinimums?.[field] || 0;
      
      if (Array.isArray(value)) {
        if (value.length === 0 && minRequired > 0) {
          penalties.push(this.createPenalty(field, 'EMPTY_ARRAY', value, 'HIGH', {
            expected: minRequired,
            actual: 0
          }, penaltyWeights));
          validatedData[field] = [];
        } else if (value.length < minRequired) {
          penalties.push(this.createPenalty(field, 'INSUFFICIENT_ARRAY_ITEMS', value, 'HIGH', {
            expected: minRequired,
            actual: value.length
          }, penaltyWeights));
          validatedData[field] = [];
        } else {
          // Enhanced array item validation
          const validItems = [];
          const invalidItems = [];
          
          value.forEach((item, index) => {
            if (this.validateArrayItem(field, item, siteRules.siteType || 'generic')) {
              validItems.push(item);
            } else {
              invalidItems.push({ index, item });
            }
          });
          
          if (invalidItems.length > 0) {
            penalties.push(this.createPenalty(field, 'INVALID_ARRAY_ITEMS', value, 'MEDIUM', {
              validItems: validItems.length,
              invalidItems: invalidItems.length,
              invalidItemsDetails: invalidItems.slice(0, 3) // Limit details for performance
            }, penaltyWeights));
          }
          
          validatedData[field] = validItems;
        }
      } else if (value !== null && value !== undefined && minRequired > 0) {
        penalties.push(this.createPenalty(field, 'EXPECTED_ARRAY', value, 'HIGH', {}, penaltyWeights));
        validatedData[field] = [];
      }
    });
  },

  validateFormats(data, validatedData, penalties, penaltyWeights) {
    FORMAT_VALIDATION_FIELDS.forEach(field => {
      const value = data[field];
      
      if (value !== null && value !== undefined && value !== '') {
        let isValid = false;
        let severity = 'MEDIUM';
        
        switch (field) {
          case 'price':
            isValid = this.validatePrice(value);
            severity = 'HIGH'; // Price format is critical for commerce sites
            break;
          case 'reviews_rating':
            isValid = this.validateRating(value);
            break;
          case 'publication_date':
            isValid = this.validateDate(value);
            break;
        }
        
        if (!isValid) {
          penalties.push(this.createPenalty(field, 'INVALID_FORMAT', value, severity, {}, penaltyWeights));
          validatedData[field] = null;
        }
      }
    });
  },

  validateRequiredFields(data, validatedData, penalties, siteRules, penaltyWeights) {
    if (siteRules.required) {
      siteRules.required.forEach(field => {
        const value = data[field];
        if (value === null || value === undefined || value === '') {
          penalties.push(this.createPenalty(field, 'SITE_REQUIRED_FIELD_MISSING', value, 'HIGH', {
            siteType: siteRules.siteType
          }, penaltyWeights));
          validatedData[field] = null;
        }
      });
    }
  },

  validateCriticalFields(data, validatedData, penalties, siteRules, penaltyWeights) {
    if (siteRules.critical) {
      siteRules.critical.forEach(field => {
        const value = data[field];
        if (value === null || value === undefined || value === '' || 
            (Array.isArray(value) && value.length === 0)) {
          penalties.push(this.createPenalty(field, 'CRITICAL_FIELD_MISSING', value, 'CRITICAL', {
            siteType: siteRules.siteType
          }, penaltyWeights));
          validatedData[field] = Array.isArray(value) ? [] : null;
        }
      });
    }
  },

  validateCustomThresholds(data, validatedData, penalties, siteRules, penaltyWeights) {
    if (siteRules.customThresholds) {
      Object.entries(siteRules.customThresholds).forEach(([field, thresholds]) => {
        const value = data[field];
        
        if (value !== null && value !== undefined) {
          if (field === 'price' && typeof value === 'string') {
            const numericPrice = parseFloat(value.replace(/[^\d.]/g, ''));
            if (!isNaN(numericPrice)) {
              if (thresholds.min && numericPrice < thresholds.min) {
                penalties.push(this.createPenalty(field, 'BELOW_MINIMUM_THRESHOLD', value, 'MEDIUM', {
                  min: thresholds.min,
                  actual: numericPrice
                }, penaltyWeights));
              }
              if (thresholds.max && numericPrice > thresholds.max) {
                penalties.push(this.createPenalty(field, 'ABOVE_MAXIMUM_THRESHOLD', value, 'MEDIUM', {
                  max: thresholds.max,
                  actual: numericPrice
                }, penaltyWeights));
              }
            }
          }
          
          if (Array.isArray(value) && (field === 'ingredients' || field === 'instructions')) {
            if (thresholds.min && value.length < thresholds.min) {
              penalties.push(this.createPenalty(field, 'BELOW_MINIMUM_COUNT', value, 'HIGH', {
                min: thresholds.min,
                actual: value.length
              }, penaltyWeights));
            }
            if (thresholds.max && value.length > thresholds.max) {
              penalties.push(this.createPenalty(field, 'ABOVE_MAXIMUM_COUNT', value, 'LOW', {
                max: thresholds.max,
                actual: value.length
              }, penaltyWeights));
            }
          }
        }
      });
    }
  },

  // ===== ENHANCED PENALTY CREATION =====
  createPenalty(field, reason, originalValue, severity = 'MEDIUM', metadata = {}, penaltyWeights = DEFAULT_PENALTY_SEVERITY_WEIGHTS) {
    const penalty = {
      field,
      reason,
      originalValue: originalValue,
      severity,
      scoreImpact: penaltyWeights[severity] || DEFAULT_PENALTY_SEVERITY_WEIGHTS[severity] || 15,
      timestamp: new Date().toISOString(),
      validationVersion: this.VERSION,
      ...metadata
    };

    this.debugLog(`Created penalty for ${field}`, {
      field,
      reason,
      severity,
      scoreImpact: penalty.scoreImpact
    });

    return penalty;
  },

  // ===== REMAINING METHODS (Enhanced but keeping core logic) =====
  calculateValidationImpact(originalData, validatedData, penalties) {
    const rawAccuracy = this.calculateAccuracy(originalData);
    const validatedAccuracy = this.calculateAccuracy(validatedData);
    const penaltyImpact = rawAccuracy > 0 ? ((rawAccuracy - validatedAccuracy) / rawAccuracy) * 100 : 0;

    // Calculate weighted penalty impact
    const totalWeightedPenalties = penalties.reduce((sum, penalty) => sum + penalty.scoreImpact, 0);
    const averagePenaltyImpact = penalties.length > 0 ? totalWeightedPenalties / penalties.length : 0;

    // Severity distribution
    const severityDistribution = this.calculateSeverityDistribution(penalties);

    return {
      rawAccuracy: this.normalizePercentage(rawAccuracy),
      validatedAccuracy: this.normalizePercentage(validatedAccuracy),
      penaltyImpact: this.normalizePercentage(penaltyImpact),
      totalWeightedPenalties,
      averagePenaltyImpact,
      severityDistribution,
      qualityGrade: this.calculateQualityGrade(validatedAccuracy, penaltyImpact)
    };
  },

  calculateSeverityDistribution(penalties) {
    const distribution = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, WARNING: 0 };
    penalties.forEach(penalty => {
      distribution[penalty.severity] = (distribution[penalty.severity] || 0) + 1;
    });
    return distribution;
  },

  calculateQualityGrade(accuracy, penaltyImpact) {
    if (accuracy >= 90 && penaltyImpact <= 5) return 'A+';
    if (accuracy >= 85 && penaltyImpact <= 10) return 'A';
    if (accuracy >= 80 && penaltyImpact <= 15) return 'A-';
    if (accuracy >= 75 && penaltyImpact <= 20) return 'B+';
    if (accuracy >= 70 && penaltyImpact <= 25) return 'B';
    if (accuracy >= 65 && penaltyImpact <= 30) return 'B-';
    if (accuracy >= 60) return 'C+';
    if (accuracy >= 50) return 'C';
    if (accuracy >= 40) return 'C-';
    if (accuracy >= 30) return 'D';
    return 'F';
  },

  // ===== REMAINING UTILITY FUNCTIONS =====
  validatePrice(price) {
    if (!price) return false;
    return VALIDATION_PATTERNS.price.test(price.toString().replace(/,/g, ''));
  },

  validateRating(rating) {
    if (!rating) return false;
    return VALIDATION_PATTERNS.rating.test(rating.toString());
  },

  validateDate(date) {
    if (!date) return false;
    if (VALIDATION_PATTERNS.date.test(date)) return true;
    // Try parsing as Date
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  },

  validateEmail(email) {
    if (!email) return false;
    return VALIDATION_PATTERNS.email.test(email);
  },

  calculateAccuracy(data) {
    if (typeof BackgroundUtils !== 'undefined') {
      return BackgroundUtils.calculateAccuracyEnhanced(data, false);
    }
    
    // Fallback accuracy calculation
    if (!data || typeof data !== 'object') return 0;
    
    const fields = Object.keys(data);
    const filledFields = fields.filter(field => {
      const value = data[field];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== '' && value !== undefined;
    });
    
    return (filledFields.length / fields.length) * 100;
  },

  calculateTrajectoryAnalysis(previousAccuracy, currentAccuracy) {
    if (typeof BackgroundUtils !== 'undefined') {
      const trajectory = BackgroundUtils.calculateTrajectoryTo80(previousAccuracy, currentAccuracy);
      return {
        trajectory,
        progressMade: currentAccuracy - previousAccuracy,
        onTrack: trajectory === 'TARGET_ACHIEVED' || trajectory === 'ON_TRACK'
      };
    }

    // Fallback calculation
    const progressMade = currentAccuracy - previousAccuracy;
    return {
      trajectory: currentAccuracy >= 80 ? 'TARGET_ACHIEVED' : (progressMade > 0 ? 'ON_TRACK' : 'NEEDS_ACCELERATION'),
      progressMade: progressMade,
      onTrack: progressMade >= 0
    };
  },

  normalizePercentage(value) {
    return Math.max(0, Math.min(100, Math.round(value || 0)));
  },

  isModuleLoaded(moduleName) {
    return typeof window[moduleName] !== 'undefined';
  },

  // ===== ENHANCED ANALYTICS AND CACHING =====
  cacheValidationAnalytics(siteType, validationResult) {
    const analytics = VALIDATION_ANALYTICS_CACHE.get(siteType) || {
      validations: [],
      totalValidations: 0,
      averagePenalties: 0,
      commonPenaltyReasons: {}
    };

    analytics.validations.push({
      timestamp: new Date().toISOString(),
      penalties: validationResult.penalties?.length || 0,
      penaltyImpact: validationResult.penaltyImpact || 0,
      accuracy: validationResult.metadata?.validatedAccuracy || 0,
      anomaliesDetected: validationResult.anomalies?.anomalies?.length || 0
    });

    // Keep only last 100 validations per site type (increased from 50)
    if (analytics.validations.length > 100) {
      analytics.validations.shift();
    }

    analytics.totalValidations++;
    
    // Track common penalty reasons
    (validationResult.penalties || []).forEach(penalty => {
      analytics.commonPenaltyReasons[penalty.reason] = 
        (analytics.commonPenaltyReasons[penalty.reason] || 0) + 1;
    });

    VALIDATION_ANALYTICS_CACHE.set(siteType, analytics);
  },

  // ===== DEBUG AND SYSTEM MANAGEMENT =====
  debugLog(message, metadata = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [ValidationManager-v${this.VERSION}] ${message}`, metadata);
  },

  clearAnalyticsCache() {
    VALIDATION_ANALYTICS_CACHE.clear();
    ANOMALY_DETECTION_CACHE.clear();
    console.log(`[${new Date().toISOString()}] [ValidationManager-v${this.VERSION}] All analytics caches cleared`);
  },

  getSystemStatus() {
    return {
      version: this.VERSION,
      validationRules: Object.keys(SITE_VALIDATION_RULES),
      registeredPlugins: Array.from(VALIDATION_PLUGINS.keys()),
      analyticsCache: {
        siteTypes: VALIDATION_ANALYTICS_CACHE.size,
        totalAnalytics: Array.from(VALIDATION_ANALYTICS_CACHE.values())
          .reduce((sum, analytics) => sum + analytics.totalValidations, 0)
      },
      anomalyDetectionCache: ANOMALY_DETECTION_CACHE.size,
      defaultPenaltyWeights: DEFAULT_PENALTY_SEVERITY_WEIGHTS,
      validationPatterns: Object.keys(VALIDATION_PATTERNS),
      enterpriseFeatures: {
        parallelValidation: true,
        customThresholds: true,
        aiAnomalyDetection: true,
        pluginSystem: true,
        forecasting: true,
        dashboardIntegration: true,
        unitTesting: true
      }
    };
  }
};

console.log(`[ValidationManager-v${ValidationManager.VERSION}] Championship AI-powered enterprise validation module loaded with comprehensive analytics`);

// Export for global access
if (typeof window !== 'undefined') {
  window.ValidationManager = ValidationManager;
}
