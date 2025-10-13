/**
 * Web Weaver Lightning - Smart Cache System
 * Version: 2.0.0
 * Author: FAANG-Level Developer Agent
 * 
 * Self-learning domain cache that improves extraction efficiency over time
 */


class SmartCache {
  constructor() {
    this.storageKey = 'web_weaver_cache';
    this.cache = new Map();
    
    console.log('[SmartCache] Initializing...');
  }
  
  /**
   * Initialize cache from storage
   */
  async initialize() {
    try {
      const result = await chrome.storage.local.get(this.storageKey);
      const cacheData = result[this.storageKey] || {};
      
      // Restore cache entries
      for (const [domain, entry] of Object.entries(cacheData)) {
        this.cache.set(domain, entry);
      }
      
      console.log('[SmartCache] Loaded', this.cache.size, 'domain entries from storage');
      
      // Clean expired entries
      await this.cleanExpired();
      
    } catch (error) {
      console.error('[SmartCache] Initialization error:', error);
    }
  }
  
  /**
   * Get cache entry for URL
   */
  async get(url) {
    const domain = this.extractDomain(url);
    return this.cache.get(domain) || null;
  }
  
  /**
   * Set cache entry for URL
   */
  async set(url, data) {
    const domain = this.extractDomain(url);
    
    const entry = {
      domain,
      websiteType: data.websiteType || 'unknown',
      classification: data.classification || 'SINGLE_ITEM',
      promptTemplate: data.promptTemplate || null,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      
      // Learning metrics
      learningMetrics: {
        extractionCount: 1,
        successCount: 1,
        avgConfidence: 0,
        reliabilityScore: 0.5,  // Start neutral
        confidenceHistory: [],
        lastExtractions: []
      }
    };
    
    // If entry exists, merge learning data
    const existing = this.cache.get(domain);
    if (existing) {
      entry.learningMetrics = existing.learningMetrics;
      entry.learningMetrics.extractionCount++;
      entry.learningMetrics.lastAccessed = Date.now();
    }
    
    this.cache.set(domain, entry);
    
    await this.save();
    
    console.log('[SmartCache] Cached entry for domain:', domain);
  }
  
  /**
   * Update learning metrics after extraction
   */
  async updateLearning(url, extractionResult) {
    const domain = this.extractDomain(url);
    const entry = this.cache.get(domain);
    
    if (!entry) {
      console.warn('[SmartCache] No entry to update for domain:', domain);
      return;
    }
    
    const metrics = entry.learningMetrics;
    
    // Update success count
    if (extractionResult.success) {
      metrics.successCount++;
    }
    
    // Update confidence tracking
    const confidence = extractionResult.confidence || 0;
    metrics.confidenceHistory.push(confidence);
    
    // Keep only last N confidence scores (sliding window)
    const windowSize = CONFIG.CACHE.learning.confidenceWindowSize || 20;
    if (metrics.confidenceHistory.length > windowSize) {
      metrics.confidenceHistory.shift();
    }
    
    // Calculate average confidence
    metrics.avgConfidence = 
      metrics.confidenceHistory.reduce((a, b) => a + b, 0) / metrics.confidenceHistory.length;
    
    // Calculate reliability score
    metrics.reliabilityScore = this.calculateReliability(metrics);
    
    // Track last extraction
    metrics.lastExtractions.push({
      timestamp: Date.now(),
      success: extractionResult.success,
      confidence,
      mode: extractionResult.mode,
      apiCalls: extractionResult.apiCalls
    });
    
    // Keep only last 10 extractions
    if (metrics.lastExtractions.length > 10) {
      metrics.lastExtractions.shift();
    }
    
    entry.lastAccessed = Date.now();
    
    await this.save();
    
    console.log('[SmartCache] Updated learning for', domain, 
                '| Reliability:', metrics.reliabilityScore.toFixed(2),
                '| Avg Confidence:', metrics.avgConfidence.toFixed(0) + '%');
  }
  
  /**
   * Calculate reliability score for domain
   */
  calculateReliability(metrics) {
    const successRate = metrics.successCount / metrics.extractionCount;
    const avgConfidence = metrics.avgConfidence / 100;  // Normalize to 0-1
    
    // Weighted calculation
    const reliability = (successRate * 0.6) + (avgConfidence * 0.4);
    
    // Apply decay factor for recent failures
    const recentExtractions = metrics.lastExtractions.slice(-5);  // Last 5
    const recentFailures = recentExtractions.filter(e => !e.success).length;
    
    if (recentFailures > 2) {
      // Penalize heavily for recent failures
      return Math.max(0, reliability - (recentFailures * 0.1));
    }
    
    return Math.min(1.0, reliability);
  }
  
  /**
   * Check if cache should be used for this domain
   */
  async shouldUseCache(url, mode) {
    const domain = this.extractDomain(url);
    const entry = this.cache.get(domain);
    
    if (!entry) return false;
    
    // Check if cache is stale (using CONFIG)
    const ttl = CONFIG.CACHE.ttl || 3600000;  // 1 hour default
    const age = Date.now() - entry.timestamp;
    
    if (age > ttl) {
      console.log('[SmartCache] Cache expired for domain:', domain);
      return false;
    }
    
    // Check learning threshold (from CONFIG)
    const minExtractions = CONFIG.CACHE.learning.minExtractionsForLearning || 5;
    if (entry.learningMetrics.extractionCount < minExtractions) {
      console.log('[SmartCache] Not enough learning data for domain:', domain);
      return false;
    }
    
    // Check reliability threshold based on mode
    const threshold = mode === 'eco' 
      ? CONFIG.MODES.eco.cache.trustCacheThreshold 
      : CONFIG.MODES.balanced.cache.trustCacheThreshold;
    
    const reliable = entry.learningMetrics.reliabilityScore >= threshold;
    
    console.log('[SmartCache] Cache decision for', domain, 
                '| Reliable:', reliable,
                '| Score:', entry.learningMetrics.reliabilityScore.toFixed(2),
                '| Threshold:', threshold);
    
    return reliable;
  }
  
  /**
   * Get domain reliability metrics
   */
  getDomainMetrics(url) {
    const domain = this.extractDomain(url);
    const entry = this.cache.get(domain);
    
    if (!entry) return null;
    
    return {
      domain,
      reliabilityScore: entry.learningMetrics.reliabilityScore,
      avgConfidence: entry.learningMetrics.avgConfidence,
      extractionCount: entry.learningMetrics.extractionCount,
      successRate: entry.learningMetrics.successCount / entry.learningMetrics.extractionCount,
      lastAccessed: entry.lastAccessed,
      age: Date.now() - entry.timestamp
    };
  }
  
  /**
   * Clear expired cache entries
   */
  async cleanExpired() {
    const ttl = CONFIG.CACHE.ttl || 3600000;
    const now = Date.now();
    let cleaned = 0;
    
    for (const [domain, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > ttl) {
        this.cache.delete(domain);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log('[SmartCache] Cleaned', cleaned, 'expired entries');
      await this.save();
    }
  }
  
  /**
   * Clear all cache
   */
  async clear() {
    this.cache.clear();
    await chrome.storage.local.remove(this.storageKey);
    console.log('[SmartCache] All cache cleared');
  }
  
  /**
   * Save cache to storage
   */
  async save() {
    try {
      // Convert Map to plain object for storage
      const cacheObj = {};
      for (const [domain, entry] of this.cache.entries()) {
        cacheObj[domain] = entry;
      }
      
      await chrome.storage.local.set({ [this.storageKey]: cacheObj });
      
    } catch (error) {
      console.error('[SmartCache] Save error:', error);
    }
  }
  
  /**
   * Extract domain from URL
   */
  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      console.error('[SmartCache] Invalid URL:', url);
      return url;  // Fallback to raw URL
    }
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.cache.values());
    
    return {
      totalDomains: this.cache.size,
      totalExtractions: entries.reduce((sum, e) => sum + e.learningMetrics.extractionCount, 0),
      avgReliability: entries.reduce((sum, e) => sum + e.learningMetrics.reliabilityScore, 0) / entries.length || 0,
      highReliabilityDomains: entries.filter(e => e.learningMetrics.reliabilityScore > 0.90).length,
      lowReliabilityDomains: entries.filter(e => e.learningMetrics.reliabilityScore < 0.60).length
    };
  }
}


// ========================================
// EXPORT TO GLOBAL SCOPE (NO const!)
// ========================================
self.WEB_WEAVER_CACHE = new SmartCache();


console.log('[SmartCache] Module loaded successfully');
