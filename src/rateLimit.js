/**
 * Web Weaver Lightning - Rate Limit Manager
 * Version: 2.0.0
 * Author: FAANG-Level Developer Agent
 * 
 * Handles 429 rate limit errors with exponential backoff and request queuing
 */


class RateLimitManager {
  constructor() {
    this.storageKey = 'web_weaver_quota';
    this.queueKey = 'web_weaver_queue';
    
    // Quota tracking
    this.dailyUsed = 0;
    this.dailyLimit = CONFIG.QUOTA.DAILY_LIMIT || 1500;
    this.lastResetDate = null;
    
    // Rate limit state
    this.isRateLimited = false;
    this.retryAfter = null;
    this.retryQueue = [];
    
    // Exponential backoff state
    this.currentBackoffIndex = 0;
    this.backoffSchedule = CONFIG.RATE_LIMIT.backoffSchedule || [1000, 2000, 4000, 8000, 16000];
    
    console.log('[RateLimitManager] Initializing...');
  }
  
  /**
   * Initialize from storage
   */
  async initialize() {
    try {
      // Load quota usage
      const quotaResult = await chrome.storage.local.get(this.storageKey);
      const quotaData = quotaResult[this.storageKey] || {};
      
      this.dailyUsed = quotaData.dailyUsed || 0;
      this.lastResetDate = quotaData.lastResetDate || this.getTodayDate();
      
      // Check if quota should reset
      await this.checkQuotaReset();
      
      // Load retry queue
      const queueResult = await chrome.storage.local.get(this.queueKey);
      this.retryQueue = queueResult[this.queueKey] || [];
      
      console.log('[RateLimitManager] Initialized | Used:', this.dailyUsed, '/', this.dailyLimit);
      
    } catch (error) {
      console.error('[RateLimitManager] Initialization error:', error);
    }
  }
  
  /**
   * Check if quota should reset (daily)
   */
  async checkQuotaReset() {
    const today = this.getTodayDate();
    
    if (this.lastResetDate !== today) {
      console.log('[RateLimitManager] 🔄 Daily quota reset!');
      
      this.dailyUsed = 0;
      this.lastResetDate = today;
      this.isRateLimited = false;
      this.currentBackoffIndex = 0;
      
      await this.save();
    }
  }
  
  /**
   * Track API request usage
   */
  async trackRequest(apiCalls = 1) {
    await this.checkQuotaReset();
    
    this.dailyUsed += apiCalls;
    
    await this.save();
    
    const percentage = (this.dailyUsed / this.dailyLimit) * 100;
    
    console.log('[RateLimitManager] Quota used:', this.dailyUsed, '/', this.dailyLimit, 
                `(${percentage.toFixed(1)}%)`);
    
    // Check thresholds
    if (percentage >= CONFIG.QUOTA.BLOCK_THRESHOLD * 100) {
      console.warn('[RateLimitManager] ⛔ Quota BLOCKED threshold reached!');
    } else if (percentage >= CONFIG.QUOTA.FORCE_ECO_THRESHOLD * 100) {
      console.warn('[RateLimitManager] ⚠️ Force ECO threshold reached!');
    } else if (percentage >= CONFIG.QUOTA.WARNING_THRESHOLD * 100) {
      console.warn('[RateLimitManager] ⚠️ Warning threshold reached!');
    }
  }
  
  /**
   * Check if extraction can proceed
   */
  canProceed() {
    const percentage = (this.dailyUsed / this.dailyLimit);
    
    // Block if over 99% quota
    if (percentage >= CONFIG.QUOTA.BLOCK_THRESHOLD) {
      console.warn('[RateLimitManager] ⛔ Quota exhausted! Blocking extraction.');
      return false;
    }
    
    // Block if actively rate limited
    if (this.isRateLimited && this.retryAfter && Date.now() < this.retryAfter) {
      console.warn('[RateLimitManager] ⛔ Rate limited! Retry after:', new Date(this.retryAfter));
      return false;
    }
    
    // Clear rate limit if expired
    if (this.isRateLimited && this.retryAfter && Date.now() >= this.retryAfter) {
      console.log('[RateLimitManager] ✅ Rate limit expired, clearing...');
      this.isRateLimited = false;
      this.retryAfter = null;
      this.currentBackoffIndex = 0;
    }
    
    return true;
  }
  
  /**
   * Handle 429 rate limit error
   */
  async handle429Error(requestData) {
    console.error('[RateLimitManager] 🚨 429 Rate Limit Hit!');
    
    this.isRateLimited = true;
    
    // Calculate backoff delay with jitter
    const baseDelay = this.backoffSchedule[this.currentBackoffIndex] || 
                      this.backoffSchedule[this.backoffSchedule.length - 1];
    
    const jitter = CONFIG.RATE_LIMIT.jitterPercent || 0.2;
    const jitterMs = baseDelay * jitter * (Math.random() * 2 - 1);  // ±20%
    const delay = Math.round(baseDelay + jitterMs);
    
    this.retryAfter = Date.now() + delay;
    
    // Increment backoff index (with cap)
    this.currentBackoffIndex = Math.min(
      this.currentBackoffIndex + 1,
      this.backoffSchedule.length - 1
    );
    
    console.log('[RateLimitManager] Backoff delay:', delay + 'ms', 
                '| Retry after:', new Date(this.retryAfter).toLocaleTimeString());
    
    // Add to retry queue if enabled
    if (CONFIG.RATE_LIMIT.queueEnabled) {
      const queueEntry = {
        ...requestData,
        retryAfter: this.retryAfter,
        backoffDelay: delay,
        queuedAt: Date.now()
      };
      
      this.retryQueue.push(queueEntry);
      
      // Cap queue size
      const maxSize = CONFIG.RATE_LIMIT.queueMaxSize || 10;
      if (this.retryQueue.length > maxSize) {
        this.retryQueue.shift();  // Remove oldest
        console.warn('[RateLimitManager] Queue full, removed oldest entry');
      }
      
      await this.saveQueue();
      
      console.log('[RateLimitManager] Added to retry queue | Position:', this.retryQueue.length);
      
      // Schedule automatic retry
      this.scheduleRetry(queueEntry);
      
      return {
        success: false,
        rateLimited: true,
        backoffDelay: delay,
        retryAfter: this.retryAfter,
        queuePosition: this.retryQueue.length
      };
    }
    
    return {
      success: false,
      rateLimited: true,
      backoffDelay: delay,
      retryAfter: this.retryAfter
    };
  }
  
  /**
   * Schedule automatic retry
   */
  scheduleRetry(queueEntry) {
    const delay = queueEntry.retryAfter - Date.now();
    
    if (delay <= 0) {
      console.log('[RateLimitManager] Executing immediate retry...');
      this.executeRetry(queueEntry);
      return;
    }
    
    console.log('[RateLimitManager] ⏰ Scheduled retry in', Math.round(delay / 1000), 'seconds');
    
    setTimeout(async () => {
      await this.executeRetry(queueEntry);
    }, delay);
  }
  
  /**
   * Execute queued retry
   */
  async executeRetry(queueEntry) {
    console.log('[RateLimitManager] 🔄 Executing queued retry...');
    
    // Remove from queue
    this.retryQueue = this.retryQueue.filter(e => e.queuedAt !== queueEntry.queuedAt);
    await this.saveQueue();
    
    // Send message to background to retry
    try {
      await chrome.runtime.sendMessage({
        action: 'retryFromQueue',
        data: queueEntry
      });
    } catch (error) {
      console.error('[RateLimitManager] Retry execution error:', error);
    }
  }
  
  /**
   * Get quota status for UI
   */
  getQuotaStatus() {
    const percentage = (this.dailyUsed / this.dailyLimit);
    
    let status = 'healthy';
    if (percentage >= CONFIG.QUOTA.BLOCK_THRESHOLD) {
      status = 'critical';
    } else if (percentage >= CONFIG.QUOTA.FORCE_ECO_THRESHOLD) {
      status = 'force_eco';
    } else if (percentage >= CONFIG.QUOTA.CRITICAL_THRESHOLD) {
      status = 'high';
    } else if (percentage >= CONFIG.QUOTA.WARNING_THRESHOLD) {
      status = 'warning';
    }
    
    return {
      status,
      used: this.dailyUsed,
      total: this.dailyLimit,
      percentage: Math.round(percentage * 100),
      remaining: this.dailyLimit - this.dailyUsed,
      resetTime: this.getNextResetTime(),
      isRateLimited: this.isRateLimited,
      retryAfter: this.retryAfter,
      queueSize: this.retryQueue.length
    };
  }
  
  /**
   * Get next reset time (midnight Pacific = 12:30 PM IST)
   */
  getNextResetTime() {
    const now = new Date();
    const today = new Date(now);
    
    // Set to 12:30 PM IST today
    today.setHours(12, 30, 0, 0);
    
    // If already past 12:30 PM today, set to tomorrow
    if (now >= today) {
      today.setDate(today.getDate() + 1);
    }
    
    return today.getTime();
  }
  
  /**
   * Get today's date string (YYYY-MM-DD)
   */
  getTodayDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
  
  /**
   * Save quota data to storage
   */
  async save() {
    try {
      await chrome.storage.local.set({
        [this.storageKey]: {
          dailyUsed: this.dailyUsed,
          dailyLimit: this.dailyLimit,
          lastResetDate: this.lastResetDate
        }
      });
    } catch (error) {
      console.error('[RateLimitManager] Save error:', error);
    }
  }
  
  /**
   * Save queue to storage
   */
  async saveQueue() {
    try {
      await chrome.storage.local.set({
        [this.queueKey]: this.retryQueue
      });
    } catch (error) {
      console.error('[RateLimitManager] Queue save error:', error);
    }
  }
  
  /**
   * Clear all data (reset)
   */
  async clear() {
    this.dailyUsed = 0;
    this.lastResetDate = this.getTodayDate();
    this.isRateLimited = false;
    this.retryAfter = null;
    this.retryQueue = [];
    this.currentBackoffIndex = 0;
    
    await this.save();
    await this.saveQueue();
    
    console.log('[RateLimitManager] All data cleared');
  }
}


// ========================================
// EXPORT TO GLOBAL SCOPE (NO const!)
// ========================================
self.WEB_WEAVER_RATE_LIMIT = new RateLimitManager();


console.log('[RateLimitManager] Module loaded successfully');
