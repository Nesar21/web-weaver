// jsonRepair.js
// Automatically repairs common JSON malformations, wraps multiple objects in an array,
// and normalizes numeric fields for robustness.

// Utility to remove trailing commas before closing brackets
function removeTrailingCommas(str) {
  return str.replace(/,(\s*[}\]])/g, '$1');
}

// Detect multiple JSON objects concatenated without array brackets and wrap in array
function wrapMultipleObjects(str) {
  const trimmed = str.trim();
  // Check if multiple objects are separated by commas at top level
  if (trimmed.startsWith('{') && trimmed.includes('},{')) {
    // Wrap entire string in brackets
    return '[' + trimmed + ']';
  }
  return str;
}

// Attempt to auto-repair JSON string
function autoRepairJSON(str) {
  let repaired = str;
  // Remove trailing commas
  repaired = removeTrailingCommas(repaired);
  // Wrap multiple objects
  repaired = wrapMultipleObjects(repaired);
  return repaired;
}

// Normalize fields: convert string numerics to numbers
function normalizeFields(obj, schema) {
  for (const key in schema) {
    if (obj.hasOwnProperty(key)) {
      const type = schema[key];
      if (type === 'number') {
        // Convert string numerics, including "4K" or "1,000"
        if (typeof obj[key] === 'string') {
          // Remove commas
          let val = obj[key].replace(/,/g, '');
          // Handle 'K' suffix
          if (/^\d+K$/i.test(val)) {
            val = parseInt(val, 10) * 1000;
          } else {
            val = parseFloat(val);
          }
          obj[key] = isNaN(val) ? null : val;
        }
      }
    }
  }
  return obj;
}

// Main repair and parse function
function safeJsonParse(str, schema) {
  try {
    return JSON.parse(str);
  } catch (e) {
    // Attempt auto-repair
    const repairedStr = autoRepairJSON(str);
    try {
      const parsed = JSON.parse(repairedStr);
      // Normalize numeric fields post parsing
      if (Array.isArray(parsed)) {
        return parsed.map(item => normalizeFields(item, schema));
      } else {
        return normalizeFields(parsed, schema);
      }
    } catch (err) {
      // Log and return null for debugging
      console.error('JSON auto-repair failed:', err, 'Original:', str);
      return null;
    }
  }
}

// Example schema for product extraction
const productSchema = {
  product_name: 'string',
  product_url: 'string',
  product_image_url: 'string',
  product_price: 'string',
  product_original_price: 'string',
  product_discount_percentage: 'number',
  product_rating: 'number',
  product_number_of_reviews: 'number',
  product_brand: 'string',
  product_availability: 'string',
  product_description: 'string',
  currency: 'string',
  is_prime: 'string',
  confidence_score: 'number'
};

// Exported function to process raw extraction JSON string
function repairJsonString(rawJson, schema = productSchema) {
  return safeJsonParse(rawJson, schema);
}

// Usage example
// const cleanedData = repairJsonString(extractedRawJson);
