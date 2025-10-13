/**
 * Web Weaver Lightning - Module Loader
 * Version: 2.0.0
 * 
 * CRITICAL: This file loads all V2.0 modules in the correct dependency order
 * Must be loaded BEFORE background.js in manifest.json
 */

console.log('[ImportScripts] Loading Web Weaver Lightning v2.0 modules...');

// Load modules in dependency order
importScripts('src/config.js');
console.log('[ImportScripts] ✅ Config loaded');

importScripts('src/cache.js');
console.log('[ImportScripts] ✅ Cache loaded');

importScripts('src/rateLimit.js');
console.log('[ImportScripts] ✅ Rate Limit Manager loaded');

importScripts('src/smartAuto.js');
console.log('[ImportScripts] ✅ Smart Auto Mode loaded');

importScripts('src/analytics.js');
console.log('[ImportScripts] ✅ Analytics loaded');

console.log('[ImportScripts] 🚀 All v2.0 modules loaded successfully!');
