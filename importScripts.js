/**
 * Web Weaver Lightning - Module Loader
 * Version: 4.1.0 (Day 21.2 - Chrome Built-in AI Integration)
 * 
 * CRITICAL: This file loads all modules in correct dependency order
 * Must be loaded BEFORE background.js in manifest.json
 * 
 * 🆕 v4.1 ADDITIONS:
 * - Chrome Built-in AI Wrapper (chrome-ai.js)
 */

console.log('[ImportScripts] 🚀 Loading Web Weaver Lightning v4.1 modules...');

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
  
  // 🆕 NEW: Chrome Built-in AI Wrapper
  importScripts('src/utils/chrome-ai.js');
  console.log('[ImportScripts] ✅ Chrome Built-in AI Wrapper loaded');
  
  console.log('[ImportScripts] ═══════════════════════════════════════════════');
  console.log('[ImportScripts] ✅ ALL 15 MODULES LOADED SUCCESSFULLY!');
  console.log('[ImportScripts] ═══════════════════════════════════════════════');
  
} catch (error) {
  console.error('[ImportScripts] ❌ CRITICAL ERROR loading modules:', error);
  console.error('[ImportScripts] Extension will not function properly!');
}
