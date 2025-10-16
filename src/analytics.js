/**
 * Web Weaver Lightning - Analytics System
 * Version: 3.2.0 (Day 13 - DETECTION TIER TRACKING)
 * Author: FAANG-Level Developer Agent
 * 
 * 🆕 v3.2 ENHANCEMENTS:
 * - Detection tier tracking (DOM/Visual/AI)
 * - Tier usage percentages and performance metrics
 * - Infinite scroll tracking
 * - Item count statistics
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
      
      // Mode usage tracking
      modeUsage: {
        offline: 0,
        min: 0,
        balanced: 0,
        max: 0,
        auto: 0
      },
      
      // Confidence distribution
      confidenceDistribution: {
        excellent: 0,  // 90-100
        good: 0,       // 75-89
        caution: 0     // 0-74
      },
      
      // NEW: Detection tier tracking (Day 13)
      detectionTiers: {
        dom: 0,        // Pure DOM classification
        visual: 0,     // Visual pattern detection
        ai: 0,         // AI fallback
        uncertain: 0   // Could not classify
      },
      
      // NEW: Tier performance metrics
      tierPerformance: {
        dom: { totalConfidence: 0, count: 0, avgConfidence: 0 },
        visual: { totalConfidence: 0, count: 0, avgConfidence: 0 },
        ai: { totalConfidence: 0, count: 0, avgConfidence: 0 }
      },
      
      // NEW: Infinite scroll tracking
      infiniteScrollStats: {
        sitesDetected: 0,
        totalScrolls: 0,
        totalItemsExtracted: 0,
        avgItemsPerScroll: 0
      },
      
      apiCallsTotal: 0,
      avgConfidence: 0,
      avgDuration: 0,
      modeSwitches: [],
      errors: [],
      dailyStats: {},
      lastReset: Date.now()
    };
    
    console.log('[Analytics] Initializing v3.2 (detection tier tracking)...');
  }

  /**
   * Initialize from storage
   */
  async initialize() {
    try {
      const result = await chrome.storage.local.get(this.storageKey);
      const savedData = result[this.storageKey];
      
      if (savedData) {
        // Merge saved data with new structure (backwards compatible)
        this.data = { ...this.data, ...savedData };
        
        // Initialize new fields if missing
        if (!this.data.detectionTiers) {
          this.data.detectionTiers = { dom: 0, visual: 0, ai: 0, uncertain: 0 };
        }
        if (!this.data.tierPerformance) {
          this.data.tierPerformance = {
            dom: { totalConfidence: 0, count: 0, avgConfidence: 0 },
            visual: { totalConfidence: 0, count: 0, avgConfidence: 0 },
            ai: { totalConfidence: 0, count: 0, avgConfidence: 0 }
          };
        }
        if (!this.data.infiniteScrollStats) {
          this.data.infiniteScrollStats = {
            sitesDetected: 0,
            totalScrolls: 0,
            totalItemsExtracted: 0,
            avgItemsPerScroll: 0
          };
        }
        
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
   * 🆕 v3.2: Now tracks detection tier and infinite scroll
   */
  async trackExtraction(extractionData) {
    try {
      this.data.totalExtractions++;
      
      if (extractionData.success) {
        this.data.successfulExtractions++;
      } else {
        this.data.failedExtractions++;
      }
      
      // Track mode usage (updated for new modes)
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
      
      // NEW: Track detection tier
      const tier = extractionData.detectionTier || 'uncertain';
      if (this.data.detectionTiers[tier] !== undefined) {
        this.data.detectionTiers[tier]++;
        
        // Track tier performance
        if (tier !== 'uncertain' && this.data.tierPerformance[tier]) {
          this.data.tierPerformance[tier].count++;
          this.data.tierPerformance[tier].totalConfidence += confidence;
          this.data.tierPerformance[tier].avgConfidence = 
            Math.round(this.data.tierPerformance[tier].totalConfidence / 
                       this.data.tierPerformance[tier].count);
        }
      }
      
      // NEW: Track infinite scroll usage
      if (extractionData.infiniteScrollUsed && extractionData.scrollResult) {
        this.data.infiniteScrollStats.sitesDetected++;
        this.data.infiniteScrollStats.totalScrolls += extractionData.scrollResult.scrollCount || 0;
        this.data.infiniteScrollStats.totalItemsExtracted += extractionData.scrollResult.itemCount || 0;
        
        // Update average items per scroll
        if (this.data.infiniteScrollStats.totalScrolls > 0) {
          this.data.infiniteScrollStats.avgItemsPerScroll = 
            Math.round(this.data.infiniteScrollStats.totalItemsExtracted / 
                       this.data.infiniteScrollStats.totalScrolls);
        }
      }
      
      // Track API calls
      this.data.apiCallsTotal += (extractionData.apiCalls || 0);
      
      // Update averages
      this.updateAverages(extractionData);
      
      // Track daily stats
      this.trackDailyStats(extractionData);
      
      await this.save();
      
      console.log('[Analytics] Tracked extraction | Success:', extractionData.success,
        '| Mode:', mode, '| Confidence:', confidence + '%', '| Tier:', tier);
      
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
        tier: context.tier || 'unknown',
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
   * 🆕 v3.2: Updated for new modes and tier tracking
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
        modes: { offline: 0, min: 0, balanced: 0, max: 0, auto: 0 },
        tiers: { dom: 0, visual: 0, ai: 0, uncertain: 0 }
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
    
    // NEW: Track tier usage
    const tier = extractionData.detectionTier || 'uncertain';
    if (stats.tiers[tier] !== undefined) {
      stats.tiers[tier]++;
    }
  }

  /**
   * Get dashboard data for UI
   * 🆕 v3.2: Includes tier usage and infinite scroll stats
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
      
      // NEW: Detection tier statistics
      detectionTiers: this.data.detectionTiers,
      tierPerformance: this.data.tierPerformance,
      tierUsagePercentages: this.calculateTierPercentages(),
      
      // NEW: Infinite scroll statistics
      infiniteScroll: this.data.infiniteScrollStats,
      
      recentModeSwitches: this.data.modeSwitches.slice(-10).reverse(),
      recentErrors: this.data.errors.slice(-10).reverse(),
      dailyStats: this.getRecentDailyStats(7), // Last 7 days
      
      performance: {
        apiCallsTotal: this.data.apiCallsTotal,
        apiEfficiency: this.calculateAPIEfficiency()
      }
    };
  }

  /**
   * NEW: Calculate tier usage percentages
   */
  calculateTierPercentages() {
    const total = Object.values(this.data.detectionTiers).reduce((a, b) => a + b, 0);
    
    if (total === 0) {
      return { dom: 0, visual: 0, ai: 0, uncertain: 0 };
    }
    
    return {
      dom: Math.round((this.data.detectionTiers.dom / total) * 100),
      visual: Math.round((this.data.detectionTiers.visual / total) * 100),
      ai: Math.round((this.data.detectionTiers.ai / total) * 100),
      uncertain: Math.round((this.data.detectionTiers.uncertain / total) * 100)
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
        modes: { offline: 0, min: 0, balanced: 0, max: 0, auto: 0 },
        tiers: { dom: 0, visual: 0, ai: 0, uncertain: 0 }
      });
    }
    
    return stats;
  }

  /**
   * Calculate API efficiency score
   */
  calculateAPIEfficiency() {
    const offlineUsage = this.data.modeUsage.offline || 0;
    const minUsage = this.data.modeUsage.min || 0;
    const totalUsage = Object.values(this.data.modeUsage).reduce((a, b) => a + b, 0);
    
    if (totalUsage === 0) return 100;
    
    // Higher Offline/Min usage = higher efficiency
    const efficientUsage = offlineUsage + minUsage;
    const efficiencyRatio = efficientUsage / totalUsage;
    
    return Math.round(efficiencyRatio * 100);
  }

  /**
   * Clean old daily stats (keep last 30 days)
   */
  async cleanOldDailyStats() {
    const maxAge = CONFIG?.ANALYTICS?.reporting?.maxHistoryDays || 30;
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
        offline: 0,
        min: 0,
        balanced: 0,
        max: 0,
        auto: 0
      },
      confidenceDistribution: {
        excellent: 0,
        good: 0,
        caution: 0
      },
      detectionTiers: {
        dom: 0,
        visual: 0,
        ai: 0,
        uncertain: 0
      },
      tierPerformance: {
        dom: { totalConfidence: 0, count: 0, avgConfidence: 0 },
        visual: { totalConfidence: 0, count: 0, avgConfidence: 0 },
        ai: { totalConfidence: 0, count: 0, avgConfidence: 0 }
      },
      infiniteScrollStats: {
        sitesDetected: 0,
        totalScrolls: 0,
        totalItemsExtracted: 0,
        avgItemsPerScroll: 0
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

console.log('[Analytics] ✅ v3.2 loaded (detection tier tracking + infinite scroll stats)');
