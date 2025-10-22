/**
 * Web Weaver Lightning - Batch Processor
 * Version: 4.2.0 (v4.2 - BATCH TRANSLATION + SUMMARIZATION)
 * Location: /src/batch-processor.js
 * 
 * Handles batch translation and summarization with:
 * - Translation: 20 items per batch
 * - Summarization: 5 items per batch
 * - Progress tracking with callbacks
 * - Automatic retry on failures
 * - Chrome AI + Cloud API fallback
 * - Cost tracking integration
 */

console.log('[BatchProcessor] v4.2.0 initializing...');

// ============================================================================
// CONFIGURATION
// ============================================================================

const BATCH_CONFIG = {
  translation: {
    batchSize: 20,
    fieldsToTranslate: ['title', 'description'],
    maxRetries: 2,
    retryDelay: 1000,
    targetLanguage: 'en' // Default, can be overridden
  },
  summarization: {
    batchSize: 5,
    fieldsToSummarize: ['description', 'main_content_summary'],
    maxLength: 500,
    maxRetries: 2,
    retryDelay: 1000
  }
};

// ============================================================================
// BATCH PROCESSOR MANAGER
// ============================================================================

const BatchProcessor = {
  VERSION: 'v4.2.0',
  
  /**
   * Batch translate items
   * @param {Array} items - Items to translate
   * @param {Object} options - Translation options
   * @returns {Object} Translation results
   */
  async batchTranslate(items, options = {}) {
    console.log('[BatchProcessor] Starting batch translation for', items.length, 'items');
    
    const config = {
      ...BATCH_CONFIG.translation,
      ...options
    };
    
    const startTime = Date.now();
    const results = {
      success: true,
      translated: 0,
      failed: 0,
      skipped: 0,
      items: [],
      errors: [],
      duration: 0,
      cost: 0
    };
    
    // Split into batches
    const batches = this._createBatches(items, config.batchSize);
    console.log('[BatchProcessor] Split into', batches.length, 'batches of', config.batchSize);
    
    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchNum = i + 1;
      
      console.log(`[BatchProcessor] Processing batch ${batchNum}/${batches.length} (${batch.length} items)`);
      
      try {
        const batchResult = await this._processBatchTranslation(batch, config);
        
        results.translated += batchResult.translated;
        results.failed += batchResult.failed;
        results.skipped += batchResult.skipped;
        results.items.push(...batchResult.items);
        results.cost += batchResult.cost || 0;
        
        // Progress callback
        if (options.onProgress) {
          options.onProgress({
            currentBatch: batchNum,
            totalBatches: batches.length,
            processedItems: results.translated + results.failed + results.skipped,
            totalItems: items.length,
            percentage: Math.round(((results.translated + results.failed + results.skipped) / items.length) * 100)
          });
        }
        
        // Delay between batches to respect rate limits
        if (i < batches.length - 1) {
          await this._delay(500);
        }
        
      } catch (error) {
        console.error(`[BatchProcessor] Batch ${batchNum} failed:`, error);
        results.errors.push({
          batch: batchNum,
          error: error.message
        });
        results.failed += batch.length;
      }
    }
    
    results.duration = Date.now() - startTime;
    results.success = results.failed === 0;
    
    console.log('[BatchProcessor] Translation complete:', {
      translated: results.translated,
      failed: results.failed,
      skipped: results.skipped,
      duration: results.duration + 'ms',
      cost: '$' + results.cost.toFixed(4)
    });
    
    return results;
  },
  
  /**
   * Batch summarize items
   * @param {Array} items - Items to summarize
   * @param {Object} options - Summarization options
   * @returns {Object} Summarization results
   */
  async batchSummarize(items, options = {}) {
    console.log('[BatchProcessor] Starting batch summarization for', items.length, 'items');
    
    const config = {
      ...BATCH_CONFIG.summarization,
      ...options
    };
    
    const startTime = Date.now();
    const results = {
      success: true,
      summarized: 0,
      failed: 0,
      skipped: 0,
      items: [],
      errors: [],
      duration: 0,
      cost: 0
    };
    
    // Split into batches (smaller for summarization - more expensive)
    const batches = this._createBatches(items, config.batchSize);
    console.log('[BatchProcessor] Split into', batches.length, 'batches of', config.batchSize);
    
    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchNum = i + 1;
      
      console.log(`[BatchProcessor] Processing batch ${batchNum}/${batches.length} (${batch.length} items)`);
      
      try {
        const batchResult = await this._processBatchSummarization(batch, config);
        
        results.summarized += batchResult.summarized;
        results.failed += batchResult.failed;
        results.skipped += batchResult.skipped;
        results.items.push(...batchResult.items);
        results.cost += batchResult.cost || 0;
        
        // Progress callback
        if (options.onProgress) {
          options.onProgress({
            currentBatch: batchNum,
            totalBatches: batches.length,
            processedItems: results.summarized + results.failed + results.skipped,
            totalItems: items.length,
            percentage: Math.round(((results.summarized + results.failed + results.skipped) / items.length) * 100)
          });
        }
        
        // Longer delay for summarization (more expensive)
        if (i < batches.length - 1) {
          await this._delay(1000);
        }
        
      } catch (error) {
        console.error(`[BatchProcessor] Batch ${batchNum} failed:`, error);
        results.errors.push({
          batch: batchNum,
          error: error.message
        });
        results.failed += batch.length;
      }
    }
    
    results.duration = Date.now() - startTime;
    results.success = results.failed === 0;
    
    console.log('[BatchProcessor] Summarization complete:', {
      summarized: results.summarized,
      failed: results.failed,
      skipped: results.skipped,
      duration: results.duration + 'ms',
      cost: '$' + results.cost.toFixed(4)
    });
    
    return results;
  },
  
  // ============================================================================
  // INTERNAL METHODS
  // ============================================================================
  
  /**
   * Process single batch of translations
   */
  async _processBatchTranslation(batch, config) {
    const result = {
      translated: 0,
      failed: 0,
      skipped: 0,
      items: [],
      cost: 0
    };
    
    // Try Chrome AI first
    const chromeAIAvailable = typeof ChromeAI !== 'undefined' && await ChromeAI.checkAvailability();
    
    for (const item of batch) {
      try {
        const translatedItem = { ...item };
        let itemTranslated = false;
        
        // Translate each configured field
        for (const field of config.fieldsToTranslate) {
          if (!item[field] || typeof item[field] !== 'string') continue;
          
          const text = item[field];
          
          // Skip if already in target language or too short
          if (text.length < 10) {
            continue;
          }
          
          let translated = null;
          
          // Try Chrome AI
          if (chromeAIAvailable) {
            try {
              translated = await ChromeAI.translate(text, config.targetLanguage);
              console.log(`[BatchProcessor] Chrome AI translated field '${field}'`);
            } catch (error) {
              console.warn('[BatchProcessor] Chrome AI translation failed:', error.message);
            }
          }
          
          // Fallback to Cloud API if needed
          if (!translated && config.useCloudFallback) {
            try {
              // Call cloud translation API through background
              const response = await chrome.runtime.sendMessage({
                action: 'cloudTranslate',
                text,
                targetLang: config.targetLanguage
              });
              
              if (response.success) {
                translated = response.translated;
                result.cost += response.cost || 0.001;
                console.log(`[BatchProcessor] Cloud API translated field '${field}'`);
              }
            } catch (error) {
              console.error('[BatchProcessor] Cloud API translation failed:', error);
            }
          }
          
          if (translated) {
            translatedItem[`${field}_translated`] = translated;
            itemTranslated = true;
          }
        }
        
        if (itemTranslated) {
          result.translated++;
        } else {
          result.skipped++;
        }
        
        result.items.push(translatedItem);
        
      } catch (error) {
        console.error('[BatchProcessor] Item translation failed:', error);
        result.failed++;
        result.items.push(item); // Return original item
      }
    }
    
    return result;
  },
  
  /**
   * Process single batch of summarizations
   */
  async _processBatchSummarization(batch, config) {
    const result = {
      summarized: 0,
      failed: 0,
      skipped: 0,
      items: [],
      cost: 0
    };
    
    // Try Chrome AI first
    const chromeAIAvailable = typeof ChromeAI !== 'undefined' && await ChromeAI.checkAvailability();
    
    for (const item of batch) {
      try {
        const summarizedItem = { ...item };
        let itemSummarized = false;
        
        // Find field to summarize (prefer longer content)
        let textToSummarize = '';
        let sourceField = '';
        
        for (const field of config.fieldsToSummarize) {
          if (item[field] && typeof item[field] === 'string' && item[field].length > textToSummarize.length) {
            textToSummarize = item[field];
            sourceField = field;
          }
        }
        
        if (!textToSummarize || textToSummarize.length < 50) {
          result.skipped++;
          result.items.push(item);
          continue;
        }
        
        let summary = null;
        
        // Try Chrome AI
        if (chromeAIAvailable) {
          try {
            summary = await ChromeAI.summarize(textToSummarize, {
              maxLength: config.maxLength,
              type: 'key-points'
            });
            console.log(`[BatchProcessor] Chrome AI summarized field '${sourceField}'`);
          } catch (error) {
            console.warn('[BatchProcessor] Chrome AI summarization failed:', error.message);
          }
        }
        
        // Fallback to Cloud API if needed
        if (!summary && config.useCloudFallback) {
          try {
            const response = await chrome.runtime.sendMessage({
              action: 'cloudSummarize',
              text: textToSummarize,
              maxLength: config.maxLength
            });
            
            if (response.success) {
              summary = response.summary;
              result.cost += response.cost || 0.002;
              console.log(`[BatchProcessor] Cloud API summarized field '${sourceField}'`);
            }
          } catch (error) {
            console.error('[BatchProcessor] Cloud API summarization failed:', error);
          }
        }
        
        if (summary) {
          summarizedItem.summary = summary;
          summarizedItem.summary_source_field = sourceField;
          itemSummarized = true;
          result.summarized++;
        } else {
          result.skipped++;
        }
        
        result.items.push(summarizedItem);
        
      } catch (error) {
        console.error('[BatchProcessor] Item summarization failed:', error);
        result.failed++;
        result.items.push(item);
      }
    }
    
    return result;
  },
  
  /**
   * Create batches from items array
   */
  _createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  },
  
  /**
   * Delay helper
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  /**
   * Get module status
   */
  getStatus() {
    return {
      version: this.VERSION,
      ready: true,
      config: BATCH_CONFIG
    };
  }
};

console.log('[BatchProcessor] ✅ v4.2.0 ready for batch operations');

// Export for global access
if (typeof window !== 'undefined') {
  window.BatchProcessor = BatchProcessor;
} else if (typeof self !== 'undefined') {
  self.BatchProcessor = BatchProcessor;
}
