/**
 * Web Weaver Lightning - Deduplication Manager
 * Version: 4.2.0 (v4.2 - CROSS-PAGINATION DEDUPLICATION)
 * Location: /src/deduplication-manager.js
 * 
 * Handles deduplication with:
 * - Content fingerprinting (hash-based)
 * - Cross-session deduplication
 * - URL + title matching
 * - Similarity detection
 * - Automatic cleanup (7-day retention)
 */

console.log('[DeduplicationManager] v4.2.0 initializing...');

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEDUP_CONFIG = {
  // How long to keep fingerprints (7 days)
  retentionDays: 7,
  
  // Similarity threshold (0-1, 0.85 = 85% similar)
  similarityThreshold: 0.85,
  
  // Fields to use for fingerprinting
  fingerprintFields: ['title', 'url', 'description'],
  
  // Max fingerprints to store per domain
  maxFingerprintsPerDomain: 1000
};

// ============================================================================
// DEDUPLICATION MANAGER
// ============================================================================

const DeduplicationManager = {
  VERSION: 'v4.2.0',
  
  // In-memory cache
  fingerprintCache: new Map(),
  
  /**
   * Initialize deduplication manager
   */
  async initialize() {
    console.log('[DeduplicationManager] Initializing...');
    
    // Load existing fingerprints
    await this._loadFingerprints();
    
    // Clean up old fingerprints
    await this._cleanupOldFingerprints();
    
    console.log('[DeduplicationManager] ✅ Initialized with', this.fingerprintCache.size, 'cached fingerprints');
  },
  
  /**
   * Check and deduplicate items
   * @param {Array} items - Items to check
   * @param {string} domain - Domain for scoping
   * @returns {Object} Deduplication results
   */
  async deduplicateItems(items, domain = 'default') {
    console.log('[DeduplicationManager] Checking', items.length, 'items for duplicates');
    
    const startTime = Date.now();
    const results = {
      total: items.length,
      unique: 0,
      duplicates: 0,
      items: [],
      duplicateDetails: []
    };
    
    // Ensure fingerprints loaded for this domain
    if (!this.fingerprintCache.has(domain)) {
      this.fingerprintCache.set(domain, new Map());
    }
    
    const domainFingerprints = this.fingerprintCache.get(domain);
    
    for (const item of items) {
      // Generate fingerprint
      const fingerprint = this._generateFingerprint(item);
      
      // Check if duplicate
      const existingItem = domainFingerprints.get(fingerprint);
      
      if (existingItem) {
        // Duplicate found
        results.duplicates++;
        results.duplicateDetails.push({
          fingerprint,
          item: item.title || item.url,
          firstSeen: existingItem.timestamp,
          reason: 'exact_match'
        });
        console.log('[DeduplicationManager] Duplicate:', item.title || item.url);
        
      } else {
        // Check for similar items (fuzzy matching)
        const similar = await this._findSimilarItem(item, domainFingerprints);
        
        if (similar) {
          results.duplicates++;
          results.duplicateDetails.push({
            fingerprint,
            item: item.title || item.url,
            firstSeen: similar.timestamp,
            reason: 'similarity_match',
            similarity: similar.score
          });
          console.log('[DeduplicationManager] Similar item:', item.title, `(${(similar.score * 100).toFixed(0)}% match)`);
          
        } else {
          // Unique item
          results.unique++;
          results.items.push(item);
          
          // Store fingerprint
          domainFingerprints.set(fingerprint, {
            timestamp: Date.now(),
            item: {
              title: item.title,
              url: item.url
            }
          });
        }
      }
    }
    
    // Save updated fingerprints
    await this._saveFingerprints();
    
    results.duration = Date.now() - startTime;
    
    console.log('[DeduplicationManager] Deduplication complete:', {
      unique: results.unique,
      duplicates: results.duplicates,
      duration: results.duration + 'ms'
    });
    
    return results;
  },
  
  /**
   * Clear all fingerprints
   */
  async clearAll() {
    console.log('[DeduplicationManager] Clearing all fingerprints...');
    this.fingerprintCache.clear();
    await chrome.storage.local.remove('deduplicationFingerprints');
    console.log('[DeduplicationManager] ✅ All fingerprints cleared');
  },
  
  /**
   * Clear fingerprints for specific domain
   */
  async clearDomain(domain) {
    console.log('[DeduplicationManager] Clearing fingerprints for:', domain);
    this.fingerprintCache.delete(domain);
    await this._saveFingerprints();
  },
  
  /**
   * Get statistics
   */
  async getStats() {
    let totalFingerprints = 0;
    const domainStats = {};
    
    for (const [domain, fingerprints] of this.fingerprintCache.entries()) {
      totalFingerprints += fingerprints.size;
      domainStats[domain] = {
        count: fingerprints.size,
        oldest: this._getOldestTimestamp(fingerprints),
        newest: this._getNewestTimestamp(fingerprints)
      };
    }
    
    return {
      totalFingerprints,
      domainCount: this.fingerprintCache.size,
      domains: domainStats,
      retentionDays: DEDUP_CONFIG.retentionDays
    };
  },
  
  // ============================================================================
  // INTERNAL METHODS
  // ============================================================================
  
  /**
   * Generate fingerprint for item
   */
  _generateFingerprint(item) {
    // Collect values from fingerprint fields
    const values = DEDUP_CONFIG.fingerprintFields
      .map(field => this._normalizeValue(item[field]))
      .filter(Boolean);
    
    // Create hash
    const combined = values.join('|');
    return this._simpleHash(combined);
  },
  
  /**
   * Normalize value for fingerprinting
   */
  _normalizeValue(value) {
    if (!value) return '';
    
    const str = String(value).toLowerCase();
    
    // Remove common noise
    return str
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();
  },
  
  /**
   * Simple hash function
   */
  _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  },
  
  /**
   * Find similar item using fuzzy matching
   */
  async _findSimilarItem(item, fingerprints) {
    const itemTitle = this._normalizeValue(item.title);
    const itemUrl = this._normalizeValue(item.url);
    
    if (!itemTitle && !itemUrl) return null;
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [fingerprint, stored] of fingerprints.entries()) {
      const storedTitle = this._normalizeValue(stored.item.title);
      const storedUrl = this._normalizeValue(stored.item.url);
      
      // Calculate similarity
      let score = 0;
      
      if (itemTitle && storedTitle) {
        const titleSimilarity = this._calculateSimilarity(itemTitle, storedTitle);
        score = Math.max(score, titleSimilarity);
      }
      
      if (itemUrl && storedUrl) {
        const urlSimilarity = this._calculateSimilarity(itemUrl, storedUrl);
        score = Math.max(score, urlSimilarity);
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { ...stored, score };
      }
    }
    
    // Return match if above threshold
    if (bestScore >= DEDUP_CONFIG.similarityThreshold) {
      return bestMatch;
    }
    
    return null;
  },
  
  /**
   * Calculate similarity between two strings (Jaccard similarity)
   */
  _calculateSimilarity(str1, str2) {
    // Simple token-based similarity
    const tokens1 = new Set(str1.split(/\s+/));
    const tokens2 = new Set(str2.split(/\s+/));
    
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  },
  
  /**
   * Load fingerprints from storage
   */
  async _loadFingerprints() {
    try {
      const result = await chrome.storage.local.get('deduplicationFingerprints');
      const data = result.deduplicationFingerprints;
      
      if (data) {
        // Restore Map structure
        for (const [domain, fingerprints] of Object.entries(data)) {
          const fingerprintMap = new Map(Object.entries(fingerprints));
          this.fingerprintCache.set(domain, fingerprintMap);
        }
        
        console.log('[DeduplicationManager] Loaded fingerprints for', this.fingerprintCache.size, 'domains');
      }
    } catch (error) {
      console.error('[DeduplicationManager] Load error:', error);
    }
  },
  
  /**
   * Save fingerprints to storage
   */
  async _saveFingerprints() {
    try {
      // Convert Maps to objects for storage
      const data = {};
      
      for (const [domain, fingerprints] of this.fingerprintCache.entries()) {
        data[domain] = Object.fromEntries(fingerprints);
      }
      
      await chrome.storage.local.set({ deduplicationFingerprints: data });
    } catch (error) {
      console.error('[DeduplicationManager] Save error:', error);
    }
  },
  
  /**
   * Clean up old fingerprints
   */
  async _cleanupOldFingerprints() {
    const cutoff = Date.now() - (DEDUP_CONFIG.retentionDays * 24 * 60 * 60 * 1000);
    let cleaned = 0;
    
    for (const [domain, fingerprints] of this.fingerprintCache.entries()) {
      const originalSize = fingerprints.size;
      
      // Remove old fingerprints
      for (const [fingerprint, data] of fingerprints.entries()) {
        if (data.timestamp < cutoff) {
          fingerprints.delete(fingerprint);
          cleaned++;
        }
      }
      
      // Remove domain if empty
      if (fingerprints.size === 0) {
        this.fingerprintCache.delete(domain);
      }
      
      // Limit per domain
      if (fingerprints.size > DEDUP_CONFIG.maxFingerprintsPerDomain) {
        const excess = fingerprints.size - DEDUP_CONFIG.maxFingerprintsPerDomain;
        const sorted = [...fingerprints.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        for (let i = 0; i < excess; i++) {
          fingerprints.delete(sorted[i][0]);
          cleaned++;
        }
      }
    }
    
    if (cleaned > 0) {
      console.log('[DeduplicationManager] Cleaned up', cleaned, 'old fingerprints');
      await this._saveFingerprints();
    }
  },
  
  /**
   * Get oldest timestamp in fingerprints
   */
  _getOldestTimestamp(fingerprints) {
    let oldest = Date.now();
    for (const data of fingerprints.values()) {
      if (data.timestamp < oldest) oldest = data.timestamp;
    }
    return oldest;
  },
  
  /**
   * Get newest timestamp in fingerprints
   */
  _getNewestTimestamp(fingerprints) {
    let newest = 0;
    for (const data of fingerprints.values()) {
      if (data.timestamp > newest) newest = data.timestamp;
    }
    return newest;
  },
  
  /**
   * Get module status
   */
  getStatus() {
    return {
      version: this.VERSION,
      ready: true,
      totalFingerprints: Array.from(this.fingerprintCache.values()).reduce((sum, fp) => sum + fp.size, 0),
      domains: this.fingerprintCache.size,
      config: DEDUP_CONFIG
    };
  }
};

// Auto-initialize
DeduplicationManager.initialize();

console.log('[DeduplicationManager] ✅ v4.2.0 ready for deduplication');

// Export for global access
if (typeof window !== 'undefined') {
  window.DeduplicationManager = DeduplicationManager;
} else if (typeof self !== 'undefined') {
  self.DeduplicationManager = DeduplicationManager;
}
