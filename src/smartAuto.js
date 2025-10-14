/**
 * Web Weaver Lightning - Smart Auto Mode
 * Version: 3.0.0 (FIX #3: Removed rateLimit dependency)
 * Author: FAANG-Level Developer Agent
 * 
 * Intelligent mode selection based on multiple factors:
 * - Cache reliability
 * - DOM confidence
 * - Domain history
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
    
    console.log('[SmartAutoMode] ✅ Initialized v3.0 (quota tracking disabled)');
    console.log('[SmartAutoMode] Decision weights:', this.weights);
  }
  
  /**
   * Main decision function - decides between modes
   * 🔧 FIX #3: Updated to not use quota checks
   */
  async decideMode(url, domAnalysis) {
    console.log('[SmartAutoMode] 🤖 Making mode decision for:', url);
    
    // Step 1: Gather all decision factors (without quota)
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
   * Gather all decision factors
   * 🔧 FIX #3: Removed quota-related factors
   */
  async gatherFactors(url, domAnalysis) {
    const factors = {};
    
    // Factor 1: Cache Reliability
    const domainMetrics = this.cache.getDomainMetrics(url);
    factors.cacheReliability = domainMetrics ? domainMetrics.reliabilityScore : 0;
    factors.hasCacheData = !!domainMetrics;
    factors.cacheAge = domainMetrics ? domainMetrics.age : null;
    
    // 🔧 FIX #3: REMOVED quota factors
    // No longer checking quotaStatus, quotaRemaining, etc.
    
    // Factor 2: DOM Confidence
    factors.domConfidence = domAnalysis.confidence || 50;
    factors.domClassification = domAnalysis.classification;
    factors.domCertainty = domAnalysis.certainty;
    
    // Factor 3: Domain History
    factors.extractionCount = domainMetrics ? domainMetrics.extractionCount : 0;
    factors.isNewDomain = !domainMetrics || domainMetrics.extractionCount < 3;
    factors.avgConfidence = domainMetrics ? domainMetrics.avgConfidence : 0;
    
    // Factor 4: Page Complexity
    factors.pageComplexity = this.assessPageComplexity(domAnalysis);
    
    return factors;
  }
  
  /**
   * Check for hard force conditions
   * 🔧 FIX #3: Removed quota-based force conditions
   */
  checkForceConditions(factors) {
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
    
    // 🔧 FIX #3: REMOVED quota-based force conditions
    // No longer forcing modes based on quota status
    
    return null;  // No force conditions
  }
  
  /**
   * Calculate weighted decision score
   * Score: 0 = Max mode, 1 = Min mode
   * 🔧 FIX #3: Removed quota weighting
   */
  calculateScore(factors) {
    let score = 0;
    
    // Factor 1: Cache Reliability (40% weight - increased from 35%)
    // Higher reliability = More Min mode
    score += factors.cacheReliability * 0.40;
    
    // 🔧 FIX #3: REMOVED quota weighting (was 25%)
    // Quota is now handled by 429 errors, not proactive decision-making
    
    // Factor 2: DOM Confidence (35% weight - increased from 20%)
    // Higher confidence = More Min mode
    const domScore = factors.domConfidence / 100;  // Normalize to 0-1
    score += domScore * 0.35;
    
    // Factor 3: Domain History (20% weight - increased from 15%)
    // More history = More Min mode
    const historyScore = Math.min(1.0, factors.extractionCount / 10);  // Cap at 10 extractions
    score += historyScore * 0.20;
    
    // Factor 4: Page Complexity (5% weight - same)
    // Lower complexity = More Min mode
    const complexityScore = 1 - factors.pageComplexity;  // Invert
    score += complexityScore * 0.05;
    
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
   * Generate human-readable reasoning
   * 🔧 FIX #3: Updated to not mention quota
   */
  generateReasoning(factors, mode, score) {
    const reasons = [];
    
    // 🔧 FIX #3: REMOVED quota reasoning
    // No longer mentioning quota status in reasoning
    
    // Cache reliability reasoning
    if (factors.cacheReliability > 0.85) {
      reasons.push('high cache reliability');
    } else if (factors.cacheReliability < 0.5) {
      reasons.push('low cache reliability');
    }
    
    // DOM confidence reasoning
    if (factors.domConfidence >= 85) {
      reasons.push('high DOM confidence');
    } else if (factors.domConfidence < 70) {
      reasons.push('uncertain DOM analysis');
    }
    
    // Domain history reasoning
    if (factors.isNewDomain) {
      reasons.push('new domain');
    } else if (factors.extractionCount > 10) {
      reasons.push('established domain history');
    }
    
    // Page complexity reasoning
    if (factors.pageComplexity > 0.7) {
      reasons.push('complex page structure');
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

console.log('[SmartAutoMode] ✅ Module v3.0 loaded (FIX #3: quota tracking removed)');
