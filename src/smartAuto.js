/**
 * Web Weaver Lightning - Smart Auto Mode
 * Version: 3.1.0 (✅ CACHE v3.1 COMPATIBLE + FIX #3)
 * Author: FAANG-Level Developer Agent
 * 
 * 🆕 v3.1 ENHANCEMENTS:
 * - ✅ Compatible with cache.js v3.1 getDomainStats() API (#2)
 * - ✅ Domain historical learning integration
 * - ✅ Enhanced decision-making with domain reliability scores
 * 
 * Intelligent mode selection based on multiple factors:
 * - Cache reliability
 * - DOM confidence
 * 🆕 - Domain historical performance (avgConfidence, reliabilityScore)
 * - Page complexity
 * 
 * 🔧 FIX #3: Removed quota tracking (now uses 429 handling only)
 */


class SmartAutoMode {
  constructor(smartCache, rateLimitManager = null) {
    this.cache = smartCache;
    // 🔧 FIX #3: No longer using rateLimitManager
    // this.rateLimit = rateLimitManager;  // REMOVED!
    
    // Decision weights from CONFIG
    this.weights = CONFIG.MODES.auto.decisionWeights;
    this.thresholds = CONFIG.MODES.auto.thresholds;
    
    console.log('[SmartAutoMode] ✅ v3.1 Initialized (cache v3.1 compatible + no quota tracking)');
    console.log('[SmartAutoMode] Decision weights:', this.weights);
  }
  
  /**
   * Main decision function - decides between modes
   * 🔧 FIX #3: Updated to not use quota checks
   * 🆕 v3.1: Uses domain stats for better decisions
   */
  async decideMode(url, domAnalysis) {
    console.log('[SmartAutoMode] 🤖 Making mode decision for:', url);
    
    // Step 1: Gather all decision factors (with domain stats, without quota)
    const factors = await this.gatherFactors(url, domAnalysis);
    
    console.log('[SmartAutoMode] Decision factors:', factors);
    
    // Step 2: Apply hard rules (force conditions)
    const forceDecision = this.checkForceConditions(factors);
    if (forceDecision) {
      return forceDecision;
    }
    
    // Step 3: Calculate weighted score
    const score = this.calculateScore(factors);
    
    console.log('[SmartAutoMode] Calculated score:', score.toFixed(2));
    
    // Step 4: Make decision based on score
    // 🔧 FIX #3: Now decides between offline, min, balanced, max
    let mode;
    if (score >= 0.8) {
      mode = 'min';  // High confidence, use minimal AI
    } else if (score >= 0.5) {
      mode = 'balanced';  // Moderate confidence
    } else if (score >= 0.3) {
      mode = 'balanced';  // Low confidence still uses balanced
    } else {
      mode = 'max';  // Very uncertain, use maximum verification
    }
    
    const confidence = Math.abs(score - 0.5) * 2;  // 0.5 = uncertain, 0/1 = certain
    
    const reasoning = this.generateReasoning(factors, mode, score);
    
    console.log('[SmartAutoMode] Decision:', mode, '| Confidence:', (confidence * 100).toFixed(0) + '%');
    console.log('[SmartAutoMode] Reasoning:', reasoning);
    
    return {
      mode,
      confidence,
      reasoning,
      factors
    };
  }
  
  /**
   * 🆕 v3.1: Gather all decision factors (with domain stats from cache v3.1)
   * 🔧 FIX #3: Removed quota-related factors
   */
  async gatherFactors(url, domAnalysis) {
    const factors = {};
    
    // === CACHE RELIABILITY & DOMAIN HISTORY ===
    try {
      // 🆕 v3.1: Use getDomainStats() instead of getDomainMetrics()
      const domainStats = await this.cache.getDomainStats(url);
      
      if (domainStats) {
        // Domain stats from cache v3.1
        factors.cacheReliability = domainStats.reliabilityScore || 0;
        factors.hasCacheData = true;
        factors.extractionCount = domainStats.extractionCount || 0;
        factors.avgConfidence = domainStats.avgConfidence || 0;
        factors.domainSuccessRate = domainStats.successRate || 0;
        factors.isNewDomain = domainStats.extractionCount < 3;
        
        console.log('[SmartAutoMode] 🆕 #2: Domain stats loaded:', {
          avgConf: domainStats.avgConfidence + '%',
          count: domainStats.extractionCount,
          reliability: (domainStats.reliabilityScore * 100).toFixed(0) + '%'
        });
      } else {
        // No domain history
        factors.cacheReliability = 0;
        factors.hasCacheData = false;
        factors.extractionCount = 0;
        factors.avgConfidence = 0;
        factors.domainSuccessRate = 0;
        factors.isNewDomain = true;
        
        console.log('[SmartAutoMode] No domain history for:', url);
      }
    } catch (error) {
      console.warn('[SmartAutoMode] Failed to load domain stats:', error.message);
      // Fallback values
      factors.cacheReliability = 0;
      factors.hasCacheData = false;
      factors.extractionCount = 0;
      factors.avgConfidence = 0;
      factors.domainSuccessRate = 0;
      factors.isNewDomain = true;
    }
    
    // 🔧 FIX #3: REMOVED quota factors
    // No longer checking quotaStatus, quotaRemaining, etc.
    
    // === DOM CONFIDENCE ===
    factors.domConfidence = domAnalysis.confidence || 50;
    factors.domClassification = domAnalysis.classification;
    factors.domCertainty = domAnalysis.certainty;
    
    // === PAGE COMPLEXITY ===
    factors.pageComplexity = this.assessPageComplexity(domAnalysis);
    
    return factors;
  }
  
  /**
   * Check for hard force conditions
   * 🆕 v3.1: Enhanced with domain reliability checks
   * 🔧 FIX #3: Removed quota-based force conditions
   */
  checkForceConditions(factors) {
    // 🆕 v3.1: FORCE MIN MODE for high-reliability domains
    if (factors.cacheReliability > 0.9 && factors.extractionCount >= 5 && factors.avgConfidence >= 85) {
      return {
        mode: 'min',
        confidence: 0.95,
        reasoning: `Forced Min Mode: High-reliability domain (${factors.avgConfidence}% avg over ${factors.extractionCount} extractions)`,
        forced: true
      };
    }
    
    // FORCE MIN MODE conditions (high confidence)
    if (factors.cacheReliability > 0.9 && factors.domConfidence >= 90) {
      return {
        mode: 'min',
        confidence: 0.95,
        reasoning: 'Forced Min Mode: Very high cache reliability + very high DOM confidence',
        forced: true
      };
    }
    
    // FORCE MAX MODE conditions (critical uncertainty)
    if (factors.isNewDomain && factors.domConfidence < 60) {
      return {
        mode: 'max',
        confidence: 0.90,
        reasoning: 'Forced Max Mode: New domain with very uncertain DOM analysis',
        forced: true
      };
    }
    
    // 🆕 v3.1: FORCE MAX MODE for consistently low-performing domains
    if (factors.extractionCount >= 5 && factors.avgConfidence < 70 && factors.domainSuccessRate < 0.8) {
      return {
        mode: 'max',
        confidence: 0.92,
        reasoning: `Forced Max Mode: Domain has low historical performance (${factors.avgConfidence}% avg, ${(factors.domainSuccessRate * 100).toFixed(0)}% success)`,
        forced: true
      };
    }
    
    // 🔧 FIX #3: REMOVED quota-based force conditions
    // No longer forcing modes based on quota status
    
    return null;  // No force conditions
  }
  
  /**
   * 🆕 v3.1: Calculate weighted decision score (with domain history)
   * Score: 0 = Max mode, 1 = Min mode
   * 🔧 FIX #3: Removed quota weighting
   */
  calculateScore(factors) {
    let score = 0;
    
    // === Factor 1: Cache Reliability (35% weight) ===
    // Higher reliability = More Min mode
    score += factors.cacheReliability * 0.35;
    
    // 🔧 FIX #3: REMOVED quota weighting (was 25%)
    // Quota is now handled by 429 errors, not proactive decision-making
    
    // === Factor 2: DOM Confidence (30% weight) ===
    // Higher confidence = More Min mode
    const domScore = factors.domConfidence / 100;  // Normalize to 0-1
    score += domScore * 0.30;
    
    // === Factor 3: Domain History (25% weight) 🆕 v3.1 ENHANCED ===
    // More history + better performance = More Min mode
    let historyScore = 0;
    
    if (factors.extractionCount > 0) {
      // Base score from extraction count (max at 10 extractions)
      const countScore = Math.min(1.0, factors.extractionCount / 10);
      
      // Performance multiplier from avg confidence
      const perfMultiplier = factors.avgConfidence / 100;
      
      historyScore = countScore * perfMultiplier;
      
      console.log('[SmartAutoMode] 🆕 #2: History score:', historyScore.toFixed(2), 
                  '| Count:', factors.extractionCount, 
                  '| Avg:', factors.avgConfidence + '%');
    }
    
    score += historyScore * 0.25;
    
    // === Factor 4: Page Complexity (10% weight) ===
    // Lower complexity = More Min mode
    const complexityScore = 1 - factors.pageComplexity;  // Invert
    score += complexityScore * 0.10;
    
    return score;
  }
  
  /**
   * Assess page complexity (0 = simple, 1 = complex)
   */
  assessPageComplexity(domAnalysis) {
    let complexity = 0.5;  // Default neutral
    
    // MULTI_ITEM pages are more complex
    if (domAnalysis.classification === 'MULTI_ITEM') {
      complexity = 0.7;
    }
    
    // UNCERTAIN pages are more complex
    if (domAnalysis.classification === 'UNCERTAIN') {
      complexity = 0.8;
    }
    
    // High indicator counts = more complex
    if (domAnalysis.indicators) {
      const totalIndicators = 
        (domAnalysis.indicators.repeatedBlocks || 0) +
        (domAnalysis.indicators.articles || 0);
      
      if (totalIndicators > 10) {
        complexity = 0.9;
      } else if (totalIndicators > 5) {
        complexity = 0.7;
      }
    }
    
    return complexity;
  }
  
  /**
   * 🆕 v3.1: Generate human-readable reasoning (with domain context)
   * 🔧 FIX #3: Updated to not mention quota
   */
  generateReasoning(factors, mode, score) {
    const reasons = [];
    
    // 🔧 FIX #3: REMOVED quota reasoning
    // No longer mentioning quota status in reasoning
    
    // 🆕 v3.1: Domain history reasoning
    if (factors.hasCacheData && factors.extractionCount >= 3) {
      if (factors.avgConfidence >= 85 && factors.cacheReliability > 0.8) {
        reasons.push(`proven domain (${factors.avgConfidence}% avg, ${factors.extractionCount}x)`);
      } else if (factors.avgConfidence < 70) {
        reasons.push(`challenging domain (${factors.avgConfidence}% avg)`);
      }
    } else if (factors.isNewDomain) {
      reasons.push('new domain');
    }
    
    // Cache reliability reasoning
    if (factors.cacheReliability > 0.85) {
      reasons.push('high reliability');
    } else if (factors.cacheReliability < 0.5) {
      reasons.push('low reliability');
    }
    
    // DOM confidence reasoning
    if (factors.domConfidence >= 85) {
      reasons.push('strong DOM signals');
    } else if (factors.domConfidence < 70) {
      reasons.push('weak DOM signals');
    }
    
    // Page complexity reasoning
    if (factors.pageComplexity > 0.7) {
      reasons.push('complex structure');
    }
    
    // Build final reasoning string
    const modeNames = {
      'offline': 'Offline Mode',
      'min': 'Min Mode',
      'balanced': 'Balanced Mode',
      'max': 'Max Mode'
    };
    
    const prefix = `${modeNames[mode]} selected:`;
    
    if (reasons.length === 0) {
      return `${prefix} neutral factors (score: ${score.toFixed(2)})`;
    }
    
    return `${prefix} ${reasons.join(', ')}`;
  }
  
  /**
   * Mid-extraction upgrade decision (if extraction quality is poor)
   * 🔧 FIX #3: Updated mode progression
   */
  async upgradeMode(url, currentMode, reason) {
    console.log('[SmartAutoMode] ⬆️ Upgrade requested | Current:', currentMode, '| Reason:', reason);
    
    if (currentMode === 'max') {
      console.log('[SmartAutoMode] Already at maximum mode (Max)');
      return {
        mode: 'max',
        upgraded: false,
        reasoning: 'Already at maximum extraction quality'
      };
    }
    
    // Check if upgrade is allowed
    const switching = CONFIG.MODES.auto.switching;
    
    if (!switching.upgradeOnLowConfidence) {
      console.log('[SmartAutoMode] Upgrades disabled in config');
      return {
        mode: currentMode,
        upgraded: false,
        reasoning: 'Mode upgrades disabled'
      };
    }
    
    // Upgrade progression: offline → min → balanced → max
    const upgradePath = {
      'offline': 'min',
      'min': 'balanced',
      'balanced': 'max'
    };
    
    const newMode = upgradePath[currentMode];
    
    console.log('[SmartAutoMode] ✅ Upgrading to', newMode, 'mode');
    
    return {
      mode: newMode,
      upgraded: true,
      reasoning: `Upgraded due to: ${reason}`
    };
  }
  
  /**
   * Mid-extraction downgrade decision
   * 🔧 FIX #3: Downgrades now triggered by 429 errors, not quota checks
   */
  async downgradeMode(url, currentMode, reason) {
    console.log('[SmartAutoMode] ⬇️ Downgrade requested | Current:', currentMode, '| Reason:', reason);
    
    if (currentMode === 'offline') {
      console.log('[SmartAutoMode] Already at minimum mode (Offline)');
      return {
        mode: 'offline',
        downgraded: false,
        reasoning: 'Already at minimum API usage'
      };
    }
    
    // Downgrade progression: max → balanced → min → offline
    const downgradePath = {
      'max': 'balanced',
      'balanced': 'min',
      'min': 'offline'
    };
    
    const newMode = downgradePath[currentMode];
    
    console.log('[SmartAutoMode] ✅ Downgrading to', newMode, 'mode');
    
    return {
      mode: newMode,
      downgraded: true,
      reasoning: `Downgraded due to: ${reason}`
    };
  }
  
  /**
   * Get mode recommendation for UI
   */
  async getRecommendation(url, domAnalysis) {
    const decision = await this.decideMode(url, domAnalysis);
    
    return {
      recommendedMode: decision.mode,
      confidence: (decision.confidence * 100).toFixed(0) + '%',
      reasoning: decision.reasoning,
      allowOverride: true
    };
  }
}


// ========================================
// EXPORT TO GLOBAL SCOPE (CLASS ONLY!)
// ========================================
self.WEB_WEAVER_SMART_AUTO = SmartAutoMode;


console.log('[SmartAutoMode] ✅ v3.1 loaded (cache v3.1 compatible + FIX #3: quota tracking removed)');
