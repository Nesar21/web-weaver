/**
 * Web Weaver Lightning - Analytics System
 * Version: 2.0.0
 * Author: FAANG-Level Developer Agent
 * 
 * Local-only analytics tracking for performance insights
 */


class Analytics {
  constructor() {
    this.storageKey = 'web_weaver_analytics';
    this.data = {
      totalExtractions: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      
      modeUsage: {
        eco: 0,
        balanced: 0,
        auto: 0
      },
      
      confidenceDistribution: {
        excellent: 0,  // 90-100
        good: 0,       // 75-89
        caution: 0     // 0-74
      },
      
      apiCallsTotal: 0,
      avgConfidence: 0,
      avgDuration: 0,
      
      modeSwitches: [],
      errors: [],
      
      dailyStats: {},
      
      lastReset: Date.now()
    };
    
    console.log('[Analytics] Initializing...');
  }
  
  /**
   * Initialize from storage
   */
  async initialize() {
    try {
      const result = await chrome.storage.local.get(this.storageKey);
      const savedData = result[this.storageKey];
      
      if (savedData) {
        this.data = { ...this.data, ...savedData };
        console.log('[Analytics] Loaded existing data | Total extractions:', this.data.totalExtractions);
      }
      
      // Clean old daily stats (keep last 30 days)
      await this.cleanOldDailyStats();
      
    } catch (error) {
      console.error('[Analytics] Initialization error:', error);
    }
  }
  
  /**
   * Track extraction
   */
  async trackExtraction(extractionData) {
    try {
      this.data.totalExtractions++;
      
      if (extractionData.success) {
        this.data.successfulExtractions++;
      } else {
        this.data.failedExtractions++;
      }
      
      // Track mode usage
      const mode = extractionData.mode || 'balanced';
      this.data.modeUsage[mode] = (this.data.modeUsage[mode] || 0) + 1;
      
      // Track confidence distribution
      const confidence = extractionData.confidence || 0;
      if (confidence >= 90) {
        this.data.confidenceDistribution.excellent++;
      } else if (confidence >= 75) {
        this.data.confidenceDistribution.good++;
      } else {
        this.data.confidenceDistribution.caution++;
      }
      
      // Track API calls
      this.data.apiCallsTotal += (extractionData.apiCalls || 0);
      
      // Update averages
      this.updateAverages(extractionData);
      
      // Track daily stats
      this.trackDailyStats(extractionData);
      
      await this.save();
      
      console.log('[Analytics] Tracked extraction | Success:', extractionData.success, 
                  '| Mode:', mode, '| Confidence:', confidence + '%');
      
    } catch (error) {
      console.error('[Analytics] Track extraction error:', error);
    }
  }
  
  /**
   * Track mode switch
   */
  async trackModeSwitch(fromMode, toMode, reason) {
    try {
      const switchData = {
        timestamp: Date.now(),
        from: fromMode,
        to: toMode,
        reason
      };
      
      this.data.modeSwitches.push(switchData);
      
      // Keep only last 50 switches
      if (this.data.modeSwitches.length > 50) {
        this.data.modeSwitches.shift();
      }
      
      await this.save();
      
      console.log('[Analytics] Mode switch tracked:', fromMode, '→', toMode);
      
    } catch (error) {
      console.error('[Analytics] Track mode switch error:', error);
    }
  }
  
  /**
   * Track error
   */
  async trackError(errorMessage, context = {}) {
    try {
      const errorData = {
        timestamp: Date.now(),
        message: errorMessage,
        mode: context.mode || 'unknown',
        retryCount: context.retryCount || 0
      };
      
      this.data.errors.push(errorData);
      
      // Keep only last 100 errors
      if (this.data.errors.length > 100) {
        this.data.errors.shift();
      }
      
      await this.save();
      
      console.log('[Analytics] Error tracked:', errorMessage);
      
    } catch (error) {
      console.error('[Analytics] Track error error:', error);
    }
  }
  
  /**
   * Update running averages
   */
  updateAverages(extractionData) {
    const total = this.data.totalExtractions;
    
    // Update average confidence
    const confidence = extractionData.confidence || 0;
    this.data.avgConfidence = 
      ((this.data.avgConfidence * (total - 1)) + confidence) / total;
    
    // Update average duration
    const duration = extractionData.duration || 0;
    this.data.avgDuration = 
      ((this.data.avgDuration * (total - 1)) + duration) / total;
  }
  
  /**
   * Track daily statistics
   */
  trackDailyStats(extractionData) {
    const today = this.getTodayDate();
    
    if (!this.data.dailyStats[today]) {
      this.data.dailyStats[today] = {
        date: today,
        extractions: 0,
        successful: 0,
        failed: 0,
        apiCalls: 0,
        avgConfidence: 0,
        modes: { eco: 0, balanced: 0, auto: 0 }
      };
    }
    
    const stats = this.data.dailyStats[today];
    
    stats.extractions++;
    if (extractionData.success) {
      stats.successful++;
    } else {
      stats.failed++;
    }
    
    stats.apiCalls += (extractionData.apiCalls || 0);
    
    // Update daily average confidence
    const confidence = extractionData.confidence || 0;
    stats.avgConfidence = 
      ((stats.avgConfidence * (stats.extractions - 1)) + confidence) / stats.extractions;
    
    // Track mode usage
    const mode = extractionData.mode || 'balanced';
    stats.modes[mode] = (stats.modes[mode] || 0) + 1;
  }
  
  /**
   * Get dashboard data for UI
   */
  getDashboardData() {
    const successRate = this.data.totalExtractions > 0
      ? (this.data.successfulExtractions / this.data.totalExtractions) * 100
      : 0;
    
    const avgAPICallsPerExtraction = this.data.totalExtractions > 0
      ? this.data.apiCallsTotal / this.data.totalExtractions
      : 0;
    
    return {
      overview: {
        totalExtractions: this.data.totalExtractions,
        successRate: Math.round(successRate),
        avgConfidence: Math.round(this.data.avgConfidence),
        avgDuration: Math.round(this.data.avgDuration),
        avgAPICallsPerExtraction: avgAPICallsPerExtraction.toFixed(1)
      },
      
      modeUsage: this.data.modeUsage,
      confidenceDistribution: this.data.confidenceDistribution,
      
      recentModeSwitches: this.data.modeSwitches.slice(-10).reverse(),
      recentErrors: this.data.errors.slice(-10).reverse(),
      
      dailyStats: this.getRecentDailyStats(7),  // Last 7 days
      
      performance: {
        apiCallsTotal: this.data.apiCallsTotal,
        apiEfficiency: this.calculateAPIEfficiency()
      }
    };
  }
  
  /**
   * Get recent daily stats
   */
  getRecentDailyStats(days = 7) {
    const stats = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      stats.push(this.data.dailyStats[dateStr] || {
        date: dateStr,
        extractions: 0,
        successful: 0,
        failed: 0,
        apiCalls: 0,
        avgConfidence: 0,
        modes: { eco: 0, balanced: 0, auto: 0 }
      });
    }
    
    return stats;
  }
  
  /**
   * Calculate API efficiency score
   */
  calculateAPIEfficiency() {
    const ecoUsage = this.data.modeUsage.eco || 0;
    const balancedUsage = this.data.modeUsage.balanced || 0;
    const totalUsage = ecoUsage + balancedUsage;
    
    if (totalUsage === 0) return 100;
    
    // Higher Eco usage = higher efficiency
    const ecoRatio = ecoUsage / totalUsage;
    
    return Math.round(ecoRatio * 100);
  }
  
  /**
   * Clean old daily stats (keep last 30 days)
   */
  async cleanOldDailyStats() {
    const maxAge = CONFIG.ANALYTICS.reporting.maxHistoryDays || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAge);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];
    
    let cleaned = 0;
    
    for (const date in this.data.dailyStats) {
      if (date < cutoffStr) {
        delete this.data.dailyStats[date];
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log('[Analytics] Cleaned', cleaned, 'old daily stats');
      await this.save();
    }
  }
  
  /**
   * Reset all analytics
   */
  async reset() {
    this.data = {
      totalExtractions: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      
      modeUsage: {
        eco: 0,
        balanced: 0,
        auto: 0
      },
      
      confidenceDistribution: {
        excellent: 0,
        good: 0,
        caution: 0
      },
      
      apiCallsTotal: 0,
      avgConfidence: 0,
      avgDuration: 0,
      
      modeSwitches: [],
      errors: [],
      
      dailyStats: {},
      
      lastReset: Date.now()
    };
    
    await this.save();
    
    console.log('[Analytics] All data reset');
  }
  
  /**
   * Save to storage
   */
  async save() {
    try {
      await chrome.storage.local.set({
        [this.storageKey]: this.data
      });
    } catch (error) {
      console.error('[Analytics] Save error:', error);
    }
  }
  
  /**
   * Get today's date string (YYYY-MM-DD)
   */
  getTodayDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
}


// ========================================
// EXPORT TO GLOBAL SCOPE (NO const!)
// ========================================
self.WEB_WEAVER_ANALYTICS = new Analytics();


console.log('[Analytics] Module loaded successfully');
