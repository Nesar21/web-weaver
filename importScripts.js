/**
 * Web Weaver Lightning - Module Loader
 * Version: 4.2.0 (v4.2 - Batch Processing + Cost Tracking + Deduplication)
 * 
 * CRITICAL: This file loads all modules in correct dependency order
 * Must be loaded BEFORE background.js in manifest.json
 * 
 * 🆕 v4.2 ADDITIONS:
 * - Template Manager (template-manager.js)
 * - Insights Generator (insights-generator.js)
 * - Batch Processor (batch-processor.js) - NEW
 * - Cost Tracker (cost-tracker.js) - NEW
 * - Deduplication Manager (deduplication-manager.js) - NEW
 */

console.log('[ImportScripts] 🚀 Loading Web Weaver Lightning v4.2 modules...');

try {
  // ========================================
  // CORE MODULES (Load first)
  // ========================================
  importScripts('src/config.js');
  console.log('[ImportScripts] ✅ Config loaded');
  
  importScripts('src/cache.js');
  console.log('[ImportScripts] ✅ Cache loaded');
  
  importScripts('src/rateLimit.js');
  console.log('[ImportScripts] ✅ Rate Limit Manager loaded');
  
  importScripts('src/analytics.js');
  console.log('[ImportScripts] ✅ Analytics loaded');
  
  importScripts('src/jsonRepair.js');
  console.log('[ImportScripts] ✅ JSON Repair loaded');
  
  // ========================================
  // CLASSIFIER & AI (Load after config)
  // ========================================
  importScripts('src/classifier.js');
  console.log('[ImportScripts] ✅ Classifier loaded');
  
  importScripts('src/smartAuto.js');
  console.log('[ImportScripts] ✅ Smart Auto Mode loaded');
  
  // ========================================
  // MODULE UTILITIES
  // ========================================
  importScripts('src/modules/utils.js');
  console.log('[ImportScripts] ✅ Module Utils loaded');
  
  importScripts('src/modules/validation.js');
  console.log('[ImportScripts] ✅ Module Validation loaded');
  
  importScripts('src/modules/extraction.js');
  console.log('[ImportScripts] ✅ Module Extraction loaded');
  
  importScripts('src/modules/simulation.js');
  console.log('[ImportScripts] ✅ Module Simulation loaded');
  
  // ========================================
  // AI UTILITIES
  // ========================================
  importScripts('src/utils/schemas.js');
  console.log('[ImportScripts] ✅ AI Schemas loaded');
  
  importScripts('src/utils/validator.js');
  console.log('[ImportScripts] ✅ AI Validator loaded');
  
  importScripts('src/utils/ai-extractor.js');
  console.log('[ImportScripts] ✅ AI Extractor loaded');
  
  importScripts('src/utils/chrome-ai.js');
  console.log('[ImportScripts] ✅ Chrome Built-in AI Wrapper loaded');
  
  // ========================================
  // 🆕 v4.2: NEW MODULES (Load after AI utilities)
  // ========================================
  importScripts('src/template-manager.js');
  console.log('[ImportScripts] ✅ Template Manager loaded');
  
  importScripts('src/insights-generator.js');
  console.log('[ImportScripts] ✅ Insights Generator loaded');
  
  importScripts('src/batch-processor.js');
  console.log('[ImportScripts] ✅ Batch Processor loaded');
  
  importScripts('src/cost-tracker.js');
  console.log('[ImportScripts] ✅ Cost Tracker loaded');
  
  importScripts('src/deduplication-manager.js');
  console.log('[ImportScripts] ✅ Deduplication Manager loaded');
  
  console.log('[ImportScripts] ═══════════════════════════════════════════════');
  console.log('[ImportScripts] ✅ ALL 20 MODULES LOADED SUCCESSFULLY!');
  console.log('[ImportScripts] 📦 v4.2.0 - Batch Processing Edition');
  console.log('[ImportScripts] ═══════════════════════════════════════════════');
  
} catch (error) {
  console.error('[ImportScripts] ❌ CRITICAL ERROR loading modules:', error);
  console.error('[ImportScripts] Extension will not function properly!');
  console.error('[ImportScripts] Failed module:', error.message);
}
