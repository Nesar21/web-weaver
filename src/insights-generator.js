/**
 * Web Weaver Lightning - AI Insights Generator
 * Version: 4.2.0 (v4.2 - NEW FILE)
 * 
 * 🆕 v4.2: AI Insights Generation
 * - Generate insights from extracted data using AI
 * - Multiple insight types: summary, comparison, recommendations, anomalies, trends
 * - Chrome AI LanguageModel support (fast, free)
 * - Cloud API fallback (Gemini)
 * - Insight caching and history
 * 
 * INSIGHT TYPES:
 * - Summary: Overview of key patterns and trends
 * - Comparison: Compare items (similarities, differences, best value)
 * - Recommendations: Actionable recommendations for user
 * - Anomalies: Detect unusual items in dataset
 * - Trends: Identify pricing/rating/feature trends
 * - Statistics: Basic statistical analysis
 */

console.log('[InsightsGenerator] Loading AI Insights Generator v4.2.0...');

const InsightsGenerator = {
  VERSION: '4.2.0',
  CACHE_KEY: 'web_weaver_insights_cache',
  HISTORY_KEY: 'web_weaver_insights_history',
  MAX_CACHE_SIZE: 20,
  MAX_HISTORY: 50,
  MAX_ITEMS_TO_ANALYZE: 50, // Limit items to prevent overwhelming AI
  CACHE_TTL: 3600000, // 1 hour
  
  // ════════════════════════════════════════════════════════════════
  // INSIGHT TYPE DEFINITIONS
  // ════════════════════════════════════════════════════════════════
  
  insightTypes: {
    summary: {
      id: 'summary',
      name: 'Data Summary',
      description: 'Overview of key patterns, trends, and insights',
      icon: '📊',
      promptTemplate: `Analyze these {count} extracted items and provide a brief summary of key patterns, trends, or insights in 2-3 sentences.

Items:
{items}

Provide a concise analysis focusing on:
- Overall patterns or common themes
- Notable trends (prices, ratings, categories)
- Key takeaways for the user

Summary:`,
      outputFormat: 'text',
      estimatedTime: 3000 // ms
    },
    
    comparison: {
      id: 'comparison',
      name: 'Item Comparison',
      description: 'Compare items: similarities, differences, best value',
      icon: '⚖️',
      promptTemplate: `Compare these {count} items. Highlight similarities, differences, best value, and any outliers in 3-4 sentences.

Items:
{items}

Provide comparison insights focusing on:
- Similarities and differences
- Best value for money (if prices available)
- Outliers or exceptional items
- Which items stand out and why

Comparison:`,
      outputFormat: 'text',
      estimatedTime: 4000
    },
    
    recommendations: {
      id: 'recommendations',
      name: 'Recommendations',
      description: '3 actionable recommendations based on data',
      icon: '💡',
      promptTemplate: `Based on these {count} items, provide exactly 3 actionable recommendations for the user.

Items:
{items}

Format your response as:
1. [First recommendation]
2. [Second recommendation]
3. [Third recommendation]

Each recommendation should be specific, actionable, and based on the data.

Recommendations:`,
      outputFormat: 'list',
      estimatedTime: 4000
    },
    
    anomalies: {
      id: 'anomalies',
      name: 'Anomaly Detection',
      description: 'Find unusual items in the dataset',
      icon: '🔍',
      promptTemplate: `Identify any unusual or anomalous items in this dataset of {count} items. Explain why they stand out (2-3 items max).

Items:
{items}

Look for anomalies in:
- Unusually high or low prices
- Outlier ratings
- Unexpected features or attributes
- Items that don't fit the pattern

Explain each anomaly clearly.

Anomalies:`,
      outputFormat: 'text',
      estimatedTime: 4000
    },
    
    trends: {
      id: 'trends',
      name: 'Trend Analysis',
      description: 'Identify pricing, rating, and feature trends',
      icon: '📈',
      promptTemplate: `Analyze trends in this dataset of {count} items. Identify patterns in prices, ratings, features, or categories.

Items:
{items}

Identify trends in:
- Price ranges and distribution
- Rating patterns
- Popular features or categories
- Temporal patterns (if dates available)

Provide 2-3 key trend observations.

Trends:`,
      outputFormat: 'text',
      estimatedTime: 4000
    },
    
    statistics: {
      id: 'statistics',
      name: 'Statistical Analysis',
      description: 'Basic statistics: average, min, max, distribution',
      icon: '📉',
      promptTemplate: `Provide basic statistical analysis of these {count} items. Focus on quantifiable metrics.

Items:
{items}

Calculate and report (if data available):
- Average price, min/max price
- Average rating, min/max rating
- Distribution across categories
- Most common attributes

Present statistics in a clear, concise format.

Statistics:`,
      outputFormat: 'text',
      estimatedTime: 3000
    }
  },
  
  // ════════════════════════════════════════════════════════════════
  // MAIN INSIGHT GENERATION
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Generate insights from extracted items
   * @param {Array} items - Extracted items
   * @param {String} insightType - Type of insight to generate
   * @param {Object} options - Generation options
   * @returns {Object} { success, insights, metadata }
   */
  async generateInsights(items, insightType = 'summary', options = {}) {
    console.log('[InsightsGenerator] Generating insights:', { itemCount: items.length, insightType });
    
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('No items provided for insights generation');
      }
      
      if (!this.insightTypes[insightType]) {
        throw new Error(`Unknown insight type: ${insightType}`);
      }
      
      // Check cache
      if (!options.skipCache) {
        const cachedInsight = this.getCachedInsight(items, insightType);
        if (cachedInsight) {
          console.log('[InsightsGenerator] ✅ Using cached insight');
          return {
            success: true,
            insights: cachedInsight.insights,
            metadata: {
              ...cachedInsight.metadata,
              cached: true
            }
          };
        }
      }
      
      // Limit items to analyze
      const itemsToAnalyze = items.slice(0, this.MAX_ITEMS_TO_ANALYZE);
      
      if (itemsToAnalyze.length < items.length) {
        console.log(`[InsightsGenerator] Limited analysis to ${this.MAX_ITEMS_TO_ANALYZE} items (original: ${items.length})`);
      }
      
      // Prepare items data (keep only relevant fields)
      const preparedItems = this.prepareItemsForAnalysis(itemsToAnalyze);
      
      // Build prompt
      const prompt = this.buildPrompt(insightType, preparedItems, itemsToAnalyze.length);
      
      // Generate insights via Chrome AI or Cloud API
      const result = await this.callAI(prompt, insightType, options);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate insights');
      }
      
      const duration = Date.now() - startTime;
      
      const response = {
        success: true,
        insights: result.insights,
        metadata: {
          insightType,
          itemCount: items.length,
          analyzedCount: itemsToAnalyze.length,
          duration,
          provider: result.provider,
          timestamp: new Date().toISOString(),
          cached: false
        }
      };
      
      // Cache result
      this.cacheInsight(items, insightType, response);
      
      // Add to history
      this.addToHistory({
        insightType,
        itemCount: items.length,
        duration,
        timestamp: Date.now()
      });
      
      console.log('[InsightsGenerator] ✅ Insights generated:', { duration, provider: result.provider });
      
      return response;
      
    } catch (error) {
      console.error('[InsightsGenerator] Error generating insights:', error);
      
      return {
        success: false,
        error: error.message,
        metadata: {
          insightType,
          itemCount: items?.length || 0,
          duration: Date.now() - startTime
        }
      };
    }
  },
  
  /**
   * Generate multiple insights at once
   */
  async generateMultipleInsights(items, insightTypes = ['summary', 'recommendations']) {
    console.log('[InsightsGenerator] Generating multiple insights:', insightTypes);
    
    const results = {};
    
    for (const type of insightTypes) {
      try {
        const result = await this.generateInsights(items, type);
        results[type] = result;
      } catch (error) {
        console.error(`[InsightsGenerator] Failed to generate ${type}:`, error);
        results[type] = {
          success: false,
          error: error.message
        };
      }
    }
    
    return results;
  },
  
  // ════════════════════════════════════════════════════════════════
  // DATA PREPARATION
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Prepare items for AI analysis (keep only relevant fields)
   */
  prepareItemsForAnalysis(items) {
    return items.map(item => {
      const prepared = {};
      
      // Essential fields
      const essentialFields = [
        'title', 'price', 'rating', 'reviews', 'description',
        'category', 'brand', 'features', 'availability',
        'date', 'author', 'views', 'likes', 'comments'
      ];
      
      for (const field of essentialFields) {
        if (item[field] !== undefined && item[field] !== null && item[field] !== '') {
          prepared[field] = item[field];
        }
      }
      
      // Limit description length
      if (prepared.description && prepared.description.length > 200) {
        prepared.description = prepared.description.substring(0, 200) + '...';
      }
      
      // Limit features array
      if (Array.isArray(prepared.features) && prepared.features.length > 5) {
        prepared.features = prepared.features.slice(0, 5);
      }
      
      return prepared;
    });
  },
  
  /**
   * Build AI prompt from template
   */
  buildPrompt(insightType, preparedItems, itemCount) {
    const insightConfig = this.insightTypes[insightType];
    
    if (!insightConfig) {
      throw new Error(`Unknown insight type: ${insightType}`);
    }
    
    // Convert items to JSON string
    const itemsJson = JSON.stringify(preparedItems, null, 2);
    
    // Replace template placeholders
    const prompt = insightConfig.promptTemplate
      .replace('{count}', itemCount)
      .replace('{items}', itemsJson);
    
    return prompt;
  },
  
  // ════════════════════════════════════════════════════════════════
  // AI CALLING (Chrome AI + Cloud API)
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Call AI (Chrome AI or Cloud API)
   */
  async callAI(prompt, insightType, options = {}) {
    console.log('[InsightsGenerator] Calling AI for insights...');
    
    try {
      // Try Chrome AI first (if available and not disabled)
      if (!options.forceCloudAPI && typeof CHROME_AI !== 'undefined') {
        console.log('[InsightsGenerator] Attempting Chrome AI...');
        
        const chromeAIResult = await CHROME_AI.prompt(prompt, {
          temperature: 0.7, // Higher temperature for creative insights
          topK: 5,
          systemPrompt: 'You are a data analyst providing clear, actionable insights from extracted web data. Be concise and specific.'
        });
        
        if (chromeAIResult.success) {
          console.log('[InsightsGenerator] ✅ Chrome AI insights generated');
          return {
            success: true,
            insights: chromeAIResult.response,
            provider: 'CHROME_BUILTIN'
          };
        } else {
          console.log('[InsightsGenerator] Chrome AI failed, falling back to Cloud API');
        }
      }
      
      // Fallback to Cloud API
      console.log('[InsightsGenerator] Using Cloud API...');
      
      const cloudResult = await this.callCloudAPI(prompt);
      
      if (cloudResult.success) {
        console.log('[InsightsGenerator] ✅ Cloud API insights generated');
        return {
          success: true,
          insights: cloudResult.data,
          provider: 'CLOUD_API'
        };
      } else {
        throw new Error(cloudResult.error || 'Cloud API failed');
      }
      
    } catch (error) {
      console.error('[InsightsGenerator] AI call error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Call Cloud API (Gemini)
   */
  async callCloudAPI(prompt) {
    try {
      // Get API key from background
      const response = await chrome.runtime.sendMessage({
        action: 'getApiKey'
      });
      
      if (!response.success || !response.apiKey) {
        throw new Error('API key not configured');
      }
      
      const apiKey = response.apiKey;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;
      
      const requestBody = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 5,
          topP: 0.9,
          maxOutputTokens: 1024
        }
      };
      
      const apiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!apiResponse.ok) {
        throw new Error(`HTTP ${apiResponse.status}: ${await apiResponse.text()}`);
      }
      
      const data = await apiResponse.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('No response text from API');
      }
      
      return {
        success: true,
        data: text.trim()
      };
      
    } catch (error) {
      console.error('[InsightsGenerator] Cloud API error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // ════════════════════════════════════════════════════════════════
  // CACHING
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Generate cache key from items and insight type
   */
  generateCacheKey(items, insightType) {
    // Hash items data for cache key
    const itemsHash = items.map(item => `${item.title}|${item.price}|${item.rating}`).join('::');
    const hash = this.simpleHash(itemsHash);
    return `${insightType}_${hash}_${items.length}`;
  },
  
  /**
   * Simple hash function
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  },
  
  /**
   * Get cached insight
   */
  getCachedInsight(items, insightType) {
    try {
      const cache = JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}');
      const cacheKey = this.generateCacheKey(items, insightType);
      const cached = cache[cacheKey];
      
      if (!cached) {
        return null;
      }
      
      // Check if cache expired
      const age = Date.now() - cached.timestamp;
      if (age > this.CACHE_TTL) {
        console.log('[InsightsGenerator] Cache expired');
        delete cache[cacheKey];
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
        return null;
      }
      
      return cached;
      
    } catch (error) {
      console.error('[InsightsGenerator] Cache read error:', error);
      return null;
    }
  },
  
  /**
   * Cache insight result
   */
  cacheInsight(items, insightType, result) {
    try {
      let cache = JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}');
      const cacheKey = this.generateCacheKey(items, insightType);
      
      cache[cacheKey] = {
        ...result,
        timestamp: Date.now()
      };
      
      // Prune old cache entries
      const cacheKeys = Object.keys(cache);
      if (cacheKeys.length > this.MAX_CACHE_SIZE) {
        // Sort by timestamp and keep newest
        const sorted = cacheKeys
          .map(key => ({ key, timestamp: cache[key].timestamp }))
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, this.MAX_CACHE_SIZE);
        
        const newCache = {};
        sorted.forEach(({ key }) => {
          newCache[key] = cache[key];
        });
        cache = newCache;
      }
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
      
    } catch (error) {
      console.error('[InsightsGenerator] Cache write error:', error);
    }
  },
  
  /**
   * Clear insights cache
   */
  clearCache() {
    localStorage.removeItem(this.CACHE_KEY);
    console.log('[InsightsGenerator] Cache cleared');
  },
  
  // ════════════════════════════════════════════════════════════════
  // HISTORY
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Add insight to history
   */
  addToHistory(entry) {
    try {
      let history = JSON.parse(localStorage.getItem(this.HISTORY_KEY) || '[]');
      
      history.unshift(entry);
      
      // Keep only last MAX_HISTORY entries
      if (history.length > this.MAX_HISTORY) {
        history = history.slice(0, this.MAX_HISTORY);
      }
      
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
      
    } catch (error) {
      console.error('[InsightsGenerator] History write error:', error);
    }
  },
  
  /**
   * Get insights history
   */
  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.HISTORY_KEY) || '[]');
    } catch (error) {
      console.error('[InsightsGenerator] History read error:', error);
      return [];
    }
  },
  
  /**
   * Clear insights history
   */
  clearHistory() {
    localStorage.removeItem(this.HISTORY_KEY);
    console.log('[InsightsGenerator] History cleared');
  },
  
  // ════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Get insight type info
   */
  getInsightTypeInfo(insightType) {
    return this.insightTypes[insightType] || null;
  },
  
  /**
   * Get all available insight types
   */
  getAllInsightTypes() {
    return Object.values(this.insightTypes);
  },
  
  /**
   * Get statistics from insights history
   */
  getHistoryStats() {
    const history = this.getHistory();
    
    const stats = {
      totalInsights: history.length,
      byType: {},
      averageDuration: 0,
      mostUsedType: null
    };
    
    history.forEach(entry => {
      // Count by type
      stats.byType[entry.insightType] = (stats.byType[entry.insightType] || 0) + 1;
      
      // Sum durations
      if (entry.duration) {
        stats.averageDuration += entry.duration;
      }
    });
    
    // Calculate average duration
    if (history.length > 0) {
      stats.averageDuration = Math.round(stats.averageDuration / history.length);
    }
    
    // Find most used type
    if (Object.keys(stats.byType).length > 0) {
      stats.mostUsedType = Object.entries(stats.byType)
        .sort((a, b) => b[1] - a[1])[0][0];
    }
    
    return stats;
  }
};

// Export to global scope
if (typeof self !== 'undefined') {
  self.InsightsGenerator = InsightsGenerator;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = InsightsGenerator;
}

console.log('[InsightsGenerator] ✅ AI Insights Generator v4.2.0 loaded');
console.log('[InsightsGenerator] Available insight types:', Object.keys(InsightsGenerator.insightTypes).length);
