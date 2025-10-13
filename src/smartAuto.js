/**
 * Web Weaver Lightning - Smart Auto Mode
 * Version: 2.0.0
 * Author: FAANG-Level Developer Agent
 * 
 * Intelligent mode selection based on multiple factors:
 * - Cache reliability
 * - Quota remaining
 * - DOM confidence
 * - Domain history
 * - Page complexity
 */


class SmartAutoMode {
  constructor(smartCache, rateLimitManager) {
    this.cache = smartCache;
    this.rateLimit = rateLimitManager;
    
    // Decision weights from CONFIG
    this.weights = CONFIG.MODES.auto.decisionWeights;
    this.thresholds = CONFIG.MODES.auto.thresholds;
    
    console.log('[SmartAutoMode] Initialized with weights:', this.weights);
  }
  
  /**
   * Main decision function - decides Eco vs Balanced
   */
  async decideMode(url, domAnalysis) {
    console.log('[SmartAutoMode] 🤖 Making mode decision for:', url);
    
    // Step 1: Gather all decision factors
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
    const mode = score >= 0.6 ? 'eco' : 'balanced';
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
   */
  async gatherFactors(url, domAnalysis) {
    const factors = {};
    
    // Factor 1: Cache Reliability
    const domainMetrics = this.cache.getDomainMetrics(url);
    factors.cacheReliability = domainMetrics ? domainMetrics.reliabilityScore : 0;
    factors.hasCacheData = !!domainMetrics;
    factors.cacheAge = domainMetrics ? domainMetrics.age : null;
    
    // Factor 2: Quota Remaining
    const quotaStatus = this.rateLimit.getQuotaStatus();
    factors.quotaRemaining = quotaStatus.remaining / quotaStatus.total;
    factors.quotaPercentage = quotaStatus.percentage;
    factors.quotaStatus = quotaStatus.status;
    
    // Factor 3: DOM Confidence
    factors.domConfidence = domAnalysis.confidence || 50;
    factors.domClassification = domAnalysis.classification;
    factors.domCertainty = domAnalysis.certainty;
    
    // Factor 4: Domain History
    factors.extractionCount = domainMetrics ? domainMetrics.extractionCount : 0;
    factors.isNewDomain = !domainMetrics || domainMetrics.extractionCount < 3;
    factors.avgConfidence = domainMetrics ? domainMetrics.avgConfidence : 0;
    
    // Factor 5: Page Complexity
    factors.pageComplexity = this.assessPageComplexity(domAnalysis);
    
    return factors;
  }
  
  /**
   * Check for hard force conditions
   */
  checkForceConditions(factors) {
    // FORCE ECO conditions
    const forceEcoThresholds = this.thresholds.forceEco;
    
    if (factors.quotaRemaining < forceEcoThresholds.quotaRemaining &&
        factors.cacheReliability > forceEcoThresholds.cacheReliability &&
        factors.domConfidence >= forceEcoThresholds.domConfidence) {
      
      return {
        mode: 'eco',
        confidence: 0.95,
        reasoning: 'Forced Eco Mode: Low quota + high cache reliability + high DOM confidence',
        forced: true
      };
    }
    
    // FORCE BALANCED conditions (critical uncertainty)
    if (factors.isNewDomain && factors.domConfidence < 70) {
      return {
        mode: 'balanced',
        confidence: 0.90,
        reasoning: 'Forced Balanced Mode: New domain with uncertain DOM analysis',
        forced: true
      };
    }
    
    // QUOTA CRITICAL - Force Eco regardless
    if (factors.quotaStatus === 'force_eco' || factors.quotaStatus === 'critical') {
      return {
        mode: 'eco',
        confidence: 0.99,
        reasoning: 'Forced Eco Mode: Quota critical threshold reached',
        forced: true
      };
    }
    
    return null;  // No force conditions
  }
  
  /**
   * Calculate weighted decision score
   * Score: 0 = Balanced, 1 = Eco
   */
  calculateScore(factors) {
    let score = 0;
    
    // Factor 1: Cache Reliability (35% weight)
    // Higher reliability = More Eco
    score += factors.cacheReliability * this.weights.cacheReliability;
    
    // Factor 2: Quota Remaining (25% weight)
    // Lower quota = More Eco
    const quotaScore = 1 - factors.quotaRemaining;  // Invert (low quota = high score)
    score += quotaScore * this.weights.quotaRemaining;
    
    // Factor 3: DOM Confidence (20% weight)
    // Higher confidence = More Eco
    const domScore = factors.domConfidence / 100;  // Normalize to 0-1
    score += domScore * this.weights.domConfidence;
    
    // Factor 4: Domain History (15% weight)
    // More history = More Eco
    const historyScore = Math.min(1.0, factors.extractionCount / 10);  // Cap at 10 extractions
    score += historyScore * this.weights.domainHistory;
    
    // Factor 5: Page Complexity (5% weight)
    // Lower complexity = More Eco
    const complexityScore = 1 - factors.pageComplexity;  // Invert
    score += complexityScore * this.weights.pageComplexity;
    
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
   */
  generateReasoning(factors, mode, score) {
    const reasons = [];
    
    // Primary reason (highest weighted factor)
    if (factors.quotaStatus === 'force_eco' || factors.quotaStatus === 'critical') {
      reasons.push('quota critical');
    } else if (factors.quotaRemaining < 0.3) {
      reasons.push('low quota remaining');
    }
    
    if (factors.cacheReliability > 0.85) {
      reasons.push('high cache reliability');
    } else if (factors.cacheReliability < 0.5) {
      reasons.push('low cache reliability');
    }
    
    if (factors.domConfidence >= 85) {
      reasons.push('high DOM confidence');
    } else if (factors.domConfidence < 70) {
      reasons.push('uncertain DOM analysis');
    }
    
    if (factors.isNewDomain) {
      reasons.push('new domain');
    } else if (factors.extractionCount > 10) {
      reasons.push('established domain history');
    }
    
    if (factors.pageComplexity > 0.7) {
      reasons.push('complex page structure');
    }
    
    // Build final reasoning string
    const prefix = mode === 'eco' ? 'Eco Mode selected:' : 'Balanced Mode selected:';
    
    if (reasons.length === 0) {
      return `${prefix} neutral factors (score: ${score.toFixed(2)})`;
    }
    
    return `${prefix} ${reasons.join(', ')}`;
  }
  
  /**
   * Mid-extraction upgrade decision (if extraction quality is poor)
   */
  async upgradeMode(url, currentMode, reason) {
    console.log('[SmartAutoMode] ⬆️ Upgrade requested | Current:', currentMode, '| Reason:', reason);
    
    if (currentMode === 'balanced') {
      console.log('[SmartAutoMode] Already at maximum mode (Balanced)');
      return {
        mode: 'balanced',
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
    
    // Upgrade to Balanced
    console.log('[SmartAutoMode] ✅ Upgrading to Balanced mode');
    
    return {
      mode: 'balanced',
      upgraded: true,
      reasoning: `Upgraded due to: ${reason}`
    };
  }
  
  /**
   * Mid-extraction downgrade decision (if quota is critical)
   */
  async downgradeMode(url, currentMode, reason) {
    console.log('[SmartAutoMode] ⬇️ Downgrade requested | Current:', currentMode, '| Reason:', reason);
    
    if (currentMode === 'eco') {
      console.log('[SmartAutoMode] Already at minimum mode (Eco)');
      return {
        mode: 'eco',
        downgraded: false,
        reasoning: 'Already at minimum API usage'
      };
    }
    
    // Check if downgrade is allowed
    const switching = CONFIG.MODES.auto.switching;
    
    if (!switching.downgradeOnQuota) {
      console.log('[SmartAutoMode] Downgrades disabled in config');
      return {
        mode: currentMode,
        downgraded: false,
        reasoning: 'Mode downgrades disabled'
      };
    }
    
    // Downgrade to Eco
    console.log('[SmartAutoMode] ✅ Downgrading to Eco mode');
    
    return {
      mode: 'eco',
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


console.log('[SmartAutoMode] Module loaded successfully');
