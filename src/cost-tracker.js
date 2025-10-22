/**
 * Web Weaver Lightning - Cost Tracker
 * Version: 4.2.0 (v4.2 - COST TRACKING + BUDGET MANAGEMENT)
 * Location: /src/cost-tracker.js
 * 
 * Tracks API costs in real-time with:
 * - Per-operation cost tracking
 * - Daily/monthly aggregation
 * - Budget warnings at 75%, 90%, 100%
 * - Cost history and analytics
 * - Provider comparison (Chrome AI vs Cloud)
 */

console.log('[CostTracker] v4.2.0 initializing...');

// ============================================================================
// COST CONFIGURATION (Gemini Flash 1.5 pricing)
// ============================================================================

const PRICING = {
  // Input tokens (per 1K tokens)
  inputTokens: 0.00015,  // $0.15 per 1M tokens
  
  // Output tokens (per 1K tokens)
  outputTokens: 0.0006,   // $0.60 per 1M tokens
  
  // Average token counts
  avgTokensPerItem: 150,
  avgOutputTokens: 50,
  
  // Operation-specific estimates
  operations: {
    extraction: { input: 150, output: 50, perItem: true },
    translation: { input: 100, output: 100, perItem: true },
    summarization: { input: 200, output: 80, perItem: true },
    insights: { input: 300, output: 150, perBatch: true }
  }
};

const DEFAULT_BUDGETS = {
  daily: 1.00,    // $1 per day
  monthly: 20.00  // $20 per month
};

const WARNING_THRESHOLDS = [75, 90, 100]; // Percentage thresholds

// ============================================================================
// COST TRACKER MANAGER
// ============================================================================

const CostTracker = {
  VERSION: 'v4.2.0',
  
  // In-memory state
  currentSession: {
    sessionId: null,
    startTime: null,
    operations: [],
    totalCost: 0
  },
  
  /**
   * Initialize cost tracker
   */
  async initialize() {
    console.log('[CostTracker] Initializing...');
    
    this.currentSession.sessionId = this._generateSessionId();
    this.currentSession.startTime = Date.now();
    
    // Load saved data
    await this._loadData();
    
    // Reset daily totals if new day
    await this._checkAndResetDaily();
    
    console.log('[CostTracker] ✅ Initialized');
  },
  
  /**
   * Track a cost event
   * @param {Object} event - Cost event details
   */
  async trackCost(event) {
    const {
      operation,      // 'extraction', 'translation', 'summarization', 'insights'
      itemCount = 1,
      inputTokens = 0,
      outputTokens = 0,
      provider = 'CLOUD_API', // 'CHROME_BUILTIN' or 'CLOUD_API'
      metadata = {}
    } = event;
    
    // Chrome AI = $0 cost
    if (provider === 'CHROME_BUILTIN') {
      console.log(`[CostTracker] ${operation}: $0.00 (Chrome AI)`);
      return {
        cost: 0,
        provider: 'CHROME_BUILTIN',
        message: 'Chrome AI - Zero cost'
      };
    }
    
    // Calculate cost
    const inputCost = (inputTokens / 1000) * PRICING.inputTokens;
    const outputCost = (outputTokens / 1000) * PRICING.outputTokens;
    const totalCost = inputCost + outputCost;
    
    // Create cost record
    const record = {
      timestamp: Date.now(),
      operation,
      itemCount,
      inputTokens,
      outputTokens,
      inputCost,
      outputCost,
      totalCost,
      provider,
      metadata
    };
    
    // Add to session
    this.currentSession.operations.push(record);
    this.currentSession.totalCost += totalCost;
    
    // Update persistent storage
    await this._updateStorage(record);
    
    // Check for budget warnings
    await this._checkBudgetWarnings();
    
    console.log(`[CostTracker] ${operation}: $${totalCost.toFixed(4)} (${itemCount} items)`);
    
    return {
      cost: totalCost,
      provider: 'CLOUD_API',
      dailyTotal: await this.getDailyTotal(),
      monthlyTotal: await this.getMonthlyTotal()
    };
  },
  
  /**
   * Estimate cost for operation
   * @param {string} operation - Operation type
   * @param {number} itemCount - Number of items
   * @returns {number} Estimated cost
   */
  estimateCost(operation, itemCount) {
    const config = PRICING.operations[operation];
    if (!config) return 0;
    
    const inputTokens = config.input * itemCount;
    const outputTokens = config.output * itemCount;
    
    const inputCost = (inputTokens / 1000) * PRICING.inputTokens;
    const outputCost = (outputTokens / 1000) * PRICING.outputTokens;
    
    return inputCost + outputCost;
  },
  
  /**
   * Get daily total cost
   */
  async getDailyTotal() {
    const data = await this._loadData();
    return data.dailyTotal || 0;
  },
  
  /**
   * Get monthly total cost
   */
  async getMonthlyTotal() {
    const data = await this._loadData();
    return data.monthlyTotal || 0;
  },
  
  /**
   * Get cost breakdown
   */
  async getCostBreakdown() {
    const data = await this._loadData();
    
    return {
      daily: {
        total: data.dailyTotal || 0,
        budget: data.budgets?.daily || DEFAULT_BUDGETS.daily,
        percentage: ((data.dailyTotal || 0) / (data.budgets?.daily || DEFAULT_BUDGETS.daily)) * 100,
        operations: data.dailyOperations || {}
      },
      monthly: {
        total: data.monthlyTotal || 0,
        budget: data.budgets?.monthly || DEFAULT_BUDGETS.monthly,
        percentage: ((data.monthlyTotal || 0) / (data.budgets?.monthly || DEFAULT_BUDGETS.monthly)) * 100,
        operations: data.monthlyOperations || {}
      },
      session: {
        total: this.currentSession.totalCost,
        operations: this.currentSession.operations.length,
        duration: Date.now() - this.currentSession.startTime
      }
    };
  },
  
  /**
   * Set budget limits
   */
  async setBudgets(daily, monthly) {
    const data = await this._loadData();
    data.budgets = {
      daily: daily || DEFAULT_BUDGETS.daily,
      monthly: monthly || DEFAULT_BUDGETS.monthly
    };
    await this._saveData(data);
    console.log('[CostTracker] Budgets updated:', data.budgets);
  },
  
  /**
   * Get cost history
   */
  async getCostHistory(days = 7) {
    const data = await this._loadData();
    const history = data.history || [];
    
    // Filter last N days
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return history.filter(entry => entry.date >= cutoff);
  },
  
  /**
   * Reset tracking (for testing)
   */
  async reset() {
    await chrome.storage.local.remove('costTrackerData');
    this.currentSession = {
      sessionId: this._generateSessionId(),
      startTime: Date.now(),
      operations: [],
      totalCost: 0
    };
    console.log('[CostTracker] ✅ Reset complete');
  },
  
  // ============================================================================
  // INTERNAL METHODS
  // ============================================================================
  
  /**
   * Load data from storage
   */
  async _loadData() {
    try {
      const result = await chrome.storage.local.get('costTrackerData');
      return result.costTrackerData || {
        dailyTotal: 0,
        monthlyTotal: 0,
        dailyOperations: {},
        monthlyOperations: {},
        lastResetDate: this._getTodayDate(),
        lastResetMonth: this._getMonthKey(),
        budgets: DEFAULT_BUDGETS,
        history: [],
        warnings: {
          daily: [],
          monthly: []
        }
      };
    } catch (error) {
      console.error('[CostTracker] Load error:', error);
      return {};
    }
  },
  
  /**
   * Save data to storage
   */
  async _saveData(data) {
    try {
      await chrome.storage.local.set({ costTrackerData: data });
    } catch (error) {
      console.error('[CostTracker] Save error:', error);
    }
  },
  
  /**
   * Update storage with new cost record
   */
  async _updateStorage(record) {
    const data = await this._loadData();
    
    // Update daily total
    data.dailyTotal = (data.dailyTotal || 0) + record.totalCost;
    
    // Update monthly total
    data.monthlyTotal = (data.monthlyTotal || 0) + record.totalCost;
    
    // Update operation breakdowns
    data.dailyOperations = data.dailyOperations || {};
    data.dailyOperations[record.operation] = (data.dailyOperations[record.operation] || 0) + record.totalCost;
    
    data.monthlyOperations = data.monthlyOperations || {};
    data.monthlyOperations[record.operation] = (data.monthlyOperations[record.operation] || 0) + record.totalCost;
    
    // Update history
    data.history = data.history || [];
    data.history.push({
      date: Date.now(),
      ...record
    });
    
    // Keep only last 30 days of history
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
    data.history = data.history.filter(entry => entry.date >= cutoff);
    
    await this._saveData(data);
  },
  
  /**
   * Check and reset daily totals if new day
   */
  async _checkAndResetDaily() {
    const data = await this._loadData();
    const today = this._getTodayDate();
    const currentMonth = this._getMonthKey();
    
    // Reset daily if new day
    if (data.lastResetDate !== today) {
      console.log('[CostTracker] New day detected, resetting daily totals');
      data.dailyTotal = 0;
      data.dailyOperations = {};
      data.lastResetDate = today;
      data.warnings.daily = [];
    }
    
    // Reset monthly if new month
    if (data.lastResetMonth !== currentMonth) {
      console.log('[CostTracker] New month detected, resetting monthly totals');
      data.monthlyTotal = 0;
      data.monthlyOperations = {};
      data.lastResetMonth = currentMonth;
      data.warnings.monthly = [];
    }
    
    await this._saveData(data);
  },
  
  /**
   * Check for budget warnings
   */
  async _checkBudgetWarnings() {
    const data = await this._loadData();
    const budgets = data.budgets || DEFAULT_BUDGETS;
    
    // Check daily budget
    const dailyPercentage = (data.dailyTotal / budgets.daily) * 100;
    await this._checkThresholdWarning('daily', dailyPercentage, data);
    
    // Check monthly budget
    const monthlyPercentage = (data.monthlyTotal / budgets.monthly) * 100;
    await this._checkThresholdWarning('monthly', monthlyPercentage, data);
    
    await this._saveData(data);
  },
  
  /**
   * Check threshold warning
   */
  async _checkThresholdWarning(period, percentage, data) {
    const warnings = data.warnings[period] || [];
    
    for (const threshold of WARNING_THRESHOLDS) {
      // Check if we crossed this threshold and haven't warned yet
      if (percentage >= threshold && !warnings.includes(threshold)) {
        warnings.push(threshold);
        
        // Send warning to popup
        try {
          await chrome.runtime.sendMessage({
            action: 'budgetWarning',
            period,
            threshold,
            percentage,
            current: period === 'daily' ? data.dailyTotal : data.monthlyTotal,
            limit: data.budgets[period]
          });
        } catch (error) {
          // Popup might not be open
        }
        
        console.warn(`[CostTracker] ⚠️ ${period} budget ${threshold}% reached`);
      }
    }
    
    data.warnings[period] = warnings;
  },
  
  /**
   * Helper: Get today's date string
   */
  _getTodayDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  },
  
  /**
   * Helper: Get current month key
   */
  _getMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  },
  
  /**
   * Helper: Generate session ID
   */
  _generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  /**
   * Get module status
   */
  getStatus() {
    return {
      version: this.VERSION,
      ready: true,
      sessionId: this.currentSession.sessionId,
      sessionCost: this.currentSession.totalCost,
      sessionDuration: Date.now() - this.currentSession.startTime
    };
  }
};

// Auto-initialize
CostTracker.initialize();

console.log('[CostTracker] ✅ v4.2.0 ready for cost tracking');

// Export for global access
if (typeof window !== 'undefined') {
  window.CostTracker = CostTracker;
} else if (typeof self !== 'undefined') {
  self.CostTracker = CostTracker;
}
