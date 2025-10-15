/**
 * Web Weaver Smart Cache System (v3.1 Enhanced)
 * 🆕 v3.1: Domain-level confidence tracking & historical learning
 * 
 * Features:
 * - Smart caching with TTL
 * - Learning metrics (success rate, reliability score)
 * - Mode-specific cache decisions
 * 🆕 Domain confidence tracking (#2)
 * 🆕 Historical performance analysis
 */

const WEB_WEAVER_CACHE = (function() {
  'use strict';

  const CACHE_KEY = 'webWeaverCache_v3';
  const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  const MAX_CACHE_SIZE = 1000;

  let cacheData = {};
  let isInitialized = false;

  // 🆕 v3.1: Domain-level tracking
  const DOMAIN_STATS_KEY = 'webWeaverDomainStats_v3';
  let domainStats = {};

  /**
   * Initialize cache from storage
   */
  async function initialize() {
    try {
      const result = await chrome.storage.local.get([CACHE_KEY, DOMAIN_STATS_KEY]);
      
      if (result[CACHE_KEY]) {
        cacheData = result[CACHE_KEY];
        cleanExpiredEntries();
        console.log('[Cache] Loaded', Object.keys(cacheData).length, 'entries');
      }

      // 🆕 v3.1: Load domain stats
      if (result[DOMAIN_STATS_KEY]) {
        domainStats = result[DOMAIN_STATS_KEY];
        console.log('[Cache] 🆕 Loaded domain stats for', Object.keys(domainStats).length, 'domains');
      }

      isInitialized = true;
      return true;
    } catch (error) {
      console.error('[Cache] Initialization error:', error);
      return false;
    }
  }

  /**
   * Get domain from URL
   */
  function extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return null;
    }
  }

  /**
   * 🆕 v3.1: Get domain-level statistics
   * Returns historical confidence data for a domain
   */
  async function getDomainStats(url) {
    const domain = extractDomain(url);
    if (!domain) return null;

    const stats = domainStats[domain];
    if (!stats) return null;

    // Calculate average confidence from history
    const confidenceHistory = stats.confidenceHistory || [];
    const avgConfidence = confidenceHistory.length > 0
      ? Math.round(confidenceHistory.reduce((sum, c) => sum + c, 0) / confidenceHistory.length)
      : 0;

    return {
      domain,
      avgConfidence,
      extractionCount: stats.extractionCount || 0,
      successRate: stats.successRate || 0,
      lastUpdated: stats.lastUpdated || null,
      reliabilityScore: calculateReliabilityScore(stats)
    };
  }

  /**
   * 🆕 v3.1: Calculate domain reliability score (0-1)
   */
  function calculateReliabilityScore(stats) {
    if (!stats || !stats.extractionCount) return 0;

    const count = stats.extractionCount;
    const successRate = stats.successRate || 0;
    const avgConfidence = stats.confidenceHistory?.length > 0
      ? stats.confidenceHistory.reduce((sum, c) => sum + c, 0) / stats.confidenceHistory.length
      : 0;

    // Factors:
    // 1. Success rate (40%)
    // 2. Average confidence (40%)
    // 3. Sample size confidence (20%)
    const sampleConfidence = Math.min(1, count / 10); // Max confidence at 10+ extractions

    const reliability = (
      (successRate * 0.4) +
      ((avgConfidence / 100) * 0.4) +
      (sampleConfidence * 0.2)
    );

    return Math.max(0, Math.min(1, reliability));
  }

  /**
   * 🆕 v3.1: Update domain-level learning metrics
   */
  async function updateDomainStats(url, extractionData) {
    const domain = extractDomain(url);
    if (!domain) return;

    if (!domainStats[domain]) {
      domainStats[domain] = {
        domain,
        extractionCount: 0,
        successCount: 0,
        successRate: 0,
        confidenceHistory: [],
        lastUpdated: null
      };
    }

    const stats = domainStats[domain];

    // Update counts
    stats.extractionCount++;
    if (extractionData.success) {
      stats.successCount++;
    }
    stats.successRate = stats.successCount / stats.extractionCount;

    // Update confidence history (keep last 20)
    if (extractionData.confidence) {
      stats.confidenceHistory.push(extractionData.confidence);
      if (stats.confidenceHistory.length > 20) {
        stats.confidenceHistory = stats.confidenceHistory.slice(-20);
      }
    }

    stats.lastUpdated = Date.now();

    // Save to storage
    try {
      await chrome.storage.local.set({ [DOMAIN_STATS_KEY]: domainStats });
      console.log('[Cache] 🆕 #2: Domain stats updated for', domain, '| Avg confidence:', Math.round(stats.confidenceHistory.reduce((s, c) => s + c, 0) / stats.confidenceHistory.length) + '%');
    } catch (error) {
      console.error('[Cache] Failed to save domain stats:', error);
    }
  }

  /**
   * Get cached entry for URL
   */
  async function get(url) {
    if (!isInitialized) {
      await initialize();
    }

    const entry = cacheData[url];
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      await remove(url);
      return null;
    }

    return entry;
  }

  /**
   * Set cache entry
   */
  async function set(url, data, ttl = DEFAULT_TTL_MS) {
    if (!isInitialized) {
      await initialize();
    }

    cacheData[url] = {
      ...data,
      url,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttl,
      learningMetrics: data.learningMetrics || {
        successCount: 0,
        totalCount: 0,
        reliabilityScore: 0
      }
    };

    await enforceMaxSize();
    await save();
  }

  /**
   * Update learning metrics for a URL
   */
  async function updateLearning(url, extractionData) {
    const entry = await get(url);
    if (!entry) return;

    const metrics = entry.learningMetrics || {
      successCount: 0,
      totalCount: 0,
      reliabilityScore: 0
    };

    metrics.totalCount++;
    if (extractionData.success) {
      metrics.successCount++;
    }

    const successRate = metrics.successCount / metrics.totalCount;
    const confidence = extractionData.confidence || 0;
    
    // Calculate reliability score (0-1)
    metrics.reliabilityScore = (successRate * 0.5) + ((confidence / 100) * 0.5);

    entry.learningMetrics = metrics;
    entry.lastUsed = Date.now();

    cacheData[url] = entry;
    await save();

    // 🆕 v3.1: Also update domain-level stats
    await updateDomainStats(url, extractionData);
  }

  /**
   * Decide if cache should be used based on mode
   */
  async function shouldUseCache(url, mode) {
    const entry = await get(url);
    if (!entry) return false;

    const metrics = entry.learningMetrics;
    if (!metrics) return true; // Use cache if no metrics yet

    switch (mode) {
      case 'offline':
        return true; // Always use cache in offline mode
      case 'min':
        return metrics.reliabilityScore > 0.7; // Use if reliable
      case 'balanced':
        return metrics.reliabilityScore > 0.85; // Use if highly reliable
      case 'max':
        return false; // Never use cache in max mode
      default:
        return metrics.reliabilityScore > 0.8;
    }
  }

  /**
   * Remove entry
   */
  async function remove(url) {
    delete cacheData[url];
    await save();
  }

  /**
   * Clear all cache
   */
  async function clear() {
    cacheData = {};
    domainStats = {}; // 🆕 v3.1: Also clear domain stats
    await chrome.storage.local.remove([CACHE_KEY, DOMAIN_STATS_KEY]);
    console.log('[Cache] Cleared all cache and domain stats');
  }

  /**
   * Clean expired entries
   */
  function cleanExpiredEntries() {
    const now = Date.now();
    let cleaned = 0;

    for (const url in cacheData) {
      if (cacheData[url].expiresAt < now) {
        delete cacheData[url];
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log('[Cache] Cleaned', cleaned, 'expired entries');
    }
  }

  /**
   * Enforce maximum cache size
   */
  async function enforceMaxSize() {
    const entries = Object.entries(cacheData);
    if (entries.length <= MAX_CACHE_SIZE) return;

    // Sort by last used (oldest first)
    entries.sort((a, b) => {
      const timeA = a[1].lastUsed || a[1].cachedAt;
      const timeB = b[1].lastUsed || b[1].cachedAt;
      return timeA - timeB;
    });

    // Remove oldest entries
    const toRemove = entries.length - MAX_CACHE_SIZE;
    for (let i = 0; i < toRemove; i++) {
      delete cacheData[entries[i][0]];
    }

    console.log('[Cache] Removed', toRemove, 'oldest entries to enforce max size');
  }

  /**
   * Save cache to storage
   */
  async function save() {
    try {
      await chrome.storage.local.set({ [CACHE_KEY]: cacheData });
    } catch (error) {
      console.error('[Cache] Save error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  function getStats() {
    const entries = Object.values(cacheData);
    const totalEntries = entries.length;
    const avgReliability = entries.length > 0
      ? entries.reduce((sum, e) => sum + (e.learningMetrics?.reliabilityScore || 0), 0) / entries.length
      : 0;

    // 🆕 v3.1: Domain stats
    const totalDomains = Object.keys(domainStats).length;
    const avgDomainConfidence = totalDomains > 0
      ? Object.values(domainStats).reduce((sum, d) => {
          const avgConf = d.confidenceHistory?.length > 0
            ? d.confidenceHistory.reduce((s, c) => s + c, 0) / d.confidenceHistory.length
            : 0;
          return sum + avgConf;
        }, 0) / totalDomains
      : 0;

    return {
      totalEntries,
      avgReliability: (avgReliability * 100).toFixed(1) + '%',
      oldestEntry: entries.length > 0
        ? new Date(Math.min(...entries.map(e => e.cachedAt))).toLocaleDateString()
        : 'N/A',
      newestEntry: entries.length > 0
        ? new Date(Math.max(...entries.map(e => e.cachedAt))).toLocaleDateString()
        : 'N/A',
      // 🆕 v3.1: Domain-level stats
      totalDomains,
      avgDomainConfidence: Math.round(avgDomainConfidence) + '%',
      topDomains: Object.values(domainStats)
        .sort((a, b) => b.extractionCount - a.extractionCount)
        .slice(0, 5)
        .map(d => ({
          domain: d.domain,
          count: d.extractionCount,
          avgConf: d.confidenceHistory?.length > 0
            ? Math.round(d.confidenceHistory.reduce((s, c) => s + c, 0) / d.confidenceHistory.length)
            : 0
        }))
    };
  }

  // Public API
  return {
    initialize,
    get,
    set,
    remove,
    clear,
    updateLearning,
    shouldUseCache,
    getStats,
    getDomainStats  // 🆕 v3.1: Export new method
  };
})();

// Export for use in background script
if (typeof self !== 'undefined') {
  self.WEB_WEAVER_CACHE = WEB_WEAVER_CACHE;
}
