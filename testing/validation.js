// Day 5 Validation Engine - Professional Field-Weighted Accuracy Scoring
console.log('🎯 Day 5 Validation Engine v1.0 - Championship Grade');

// Field weights for accuracy calculation (total = 100%)
const FIELD_WEIGHTS = {
  title: 25,        // Most important - main identifier
  description: 20,  // Critical for content understanding  
  content: 15,      // Key content summary
  author: 10,       // Important for credibility
  date: 10,         // Important for recency
  category: 10,     // Content classification
  links: 5,         // Less critical but useful
  images: 5         // Least critical for accuracy
};

const SCHEMA_FIELDS = Object.keys(FIELD_WEIGHTS);

/**
 * Calculate field-by-field accuracy between AI extraction and ground truth
 * Returns detailed scoring breakdown for judge presentation
 */
function calculateAccuracy(aiResult, groundTruth) {
  const startTime = Date.now();
  console.log('[Validation] Calculating accuracy...');

  const scores = {};
  let totalScore = 0;
  let details = [];

  SCHEMA_FIELDS.forEach(field => {
    const aiValue = aiResult[field];
    const truthValue = groundTruth[field];
    const weight = FIELD_WEIGHTS[field];

    let fieldScore = 0;
    let status = 'missing';
    let comment = '';

    if (aiValue && truthValue) {
      // Both values exist - calculate similarity
      if (Array.isArray(aiValue) && Array.isArray(truthValue)) {
        // Array field (links, images)
        const overlap = aiValue.filter(item => 
          truthValue.some(truth => 
            String(item).toLowerCase().includes(String(truth).toLowerCase()) ||
            String(truth).toLowerCase().includes(String(item).toLowerCase())
          )
        ).length;
        fieldScore = Math.min(100, (overlap / Math.max(truthValue.length, 1)) * 100);
        status = fieldScore >= 70 ? 'good' : fieldScore >= 40 ? 'partial' : 'poor';
        comment = `${overlap}/${truthValue.length} items matched`;
      } else {
        // String field - semantic similarity
        const similarity = calculateStringSimilarity(String(aiValue), String(truthValue));
        fieldScore = similarity * 100;
        status = fieldScore >= 80 ? 'excellent' : fieldScore >= 60 ? 'good' : fieldScore >= 30 ? 'partial' : 'poor';
        comment = `${fieldScore.toFixed(1)}% similarity`;
      }
    } else if (aiValue && !truthValue) {
      // AI found something, truth is null - partial credit
      fieldScore = 30;
      status = 'extra';
      comment = 'AI found data not in ground truth';
    } else if (!aiValue && truthValue) {
      // AI missed required field
      fieldScore = 0;
      status = 'missed';
      comment = 'AI missed required field';
    }

    const weightedScore = (fieldScore / 100) * weight;
    totalScore += weightedScore;

    scores[field] = {
      raw: fieldScore,
      weighted: weightedScore,
      weight: weight,
      status: status,
      comment: comment,
      passed: fieldScore >= 60
    };

    details.push(`${field}: ${fieldScore.toFixed(1)}% (${status}) ${fieldScore >= 60 ? '✅' : '❌'} - ${comment}`);
  });

  const duration = Date.now() - startTime;

  return {
    totalScore: Math.round(totalScore * 100) / 100,
    fieldScores: scores,
    details: details,
    metadata: {
      validationTime: duration,
      passThreshold: 60,
      fieldsPassedCount: Object.values(scores).filter(s => s.passed).length,
      fieldsTotalCount: SCHEMA_FIELDS.length
    }
  };
}

/**
 * Calculate string similarity using Levenshtein distance + semantic matching
 */
function calculateStringSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;

  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;

  // Quick semantic check for common equivalences
  const semanticMatches = [
    ['article', 'news', 'story', 'post'],
    ['blog', 'article', 'post'],
    ['product', 'item', 'listing'],
    ['documentation', 'docs', 'guide', 'manual']
  ];

  for (const group of semanticMatches) {
    if (group.some(word => s1.includes(word)) && group.some(word => s2.includes(word))) {
      return 0.8; // High semantic similarity
    }
  }

  // Levenshtein distance calculation
  const matrix = Array(s2.length + 1).fill().map(() => Array(s1.length + 1).fill(0));

  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,      // insertion
        matrix[j - 1][i] + 1,      // deletion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }

  const maxLength = Math.max(s1.length, s2.length);
  return maxLength === 0 ? 1 : (maxLength - matrix[s2.length][s1.length]) / maxLength;
}
