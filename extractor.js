// Day 4 AI Extraction Engine - FREE Gemini 2.0 Flash
const SCHEMA_FIELDS = ['title', 'description', 'author', 'date', 'content', 'links', 'images', 'category'];

// Schema enforcement - ensures consistent JSON structure
function enforceSchema(data) {
  const cleanedData = {};
  
  SCHEMA_FIELDS.forEach(field => {
    cleanedData[field] = data[field] || null;
  });
  
  // Ensure arrays are arrays
  cleanedData.links = Array.isArray(cleanedData.links) ? cleanedData.links : [];
  cleanedData.images = Array.isArray(cleanedData.images) ? cleanedData.images : [];
  
  return cleanedData;
}

// Main AI extraction function with Google Gemini 2.0 Flash (100% FREE)
async function extractWithAI(pageContent, apiConfig) {
  const startTime = Date.now();
  
  try {
    console.log('[Extractor] Starting FREE Gemini 2.0 Flash extraction...');
    
    if (!apiConfig.apiKey) {
      throw new Error('API key not configured');
    }
    
    if (!pageContent || pageContent.length < 50) {
      throw new Error('Insufficient content for extraction');
    }
    
    // Truncate content to avoid limits
    const truncatedContent = pageContent.slice(0, 8000);
    
    const prompt = `Extract structured information from this webpage content and return ONLY valid JSON with these exact fields:
    
Required fields: title, description, author, date, content, links, images, category

Category must be one of: news, market, opinion, technical, ads, other

Content: ${truncatedContent}

Return only the JSON object, no explanation or additional text.`;

    // Google Gemini 2.0 Flash API call (100% FREE with generous limits)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiConfig.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000,
          thinkingConfig: {
            thinkingBudget: 0  // Disable thinking for faster/cheaper responses
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API request failed: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    
    if (!responseData.candidates || !responseData.candidates[0] || !responseData.candidates[0].content) {
      throw new Error('Invalid Gemini API response structure');
    }

    const content = responseData.candidates[0].content.parts[0].text.trim();
    
    // Remove markdown code blocks if present
    const cleanContent = content.replace(/``````/g, '').trim();
    
    let extractedData;
    try {
      extractedData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('[Extractor] JSON parse failed:', parseError);
      throw new Error(`Invalid JSON from AI: ${parseError.message}`);
    }

    // Enforce schema
    const validatedData = enforceSchema(extractedData);
    
    const duration = Date.now() - startTime;
    
    console.log('[Extractor] Gemini 2.0 Flash Success:', {
      duration: `${duration}ms`,
      model: 'gemini-2.0-flash',
      fieldsExtracted: Object.keys(validatedData).filter(k => validatedData[k] !== null).length
    });

    return {
      success: true,
      data: validatedData,
      metadata: {
        extractionTime: duration,
        model: 'gemini-2.0-flash',
        free: true
      }
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error('[Extractor] Gemini Failed:', {
      error: error.message,
      duration: `${duration}ms`,
      contentLength: pageContent?.length || 0
    });

    return {
      success: false,
      error: error.message,
      metadata: {
        extractionTime: duration,
        failed: true
      }
    };
  }
}

// Export for background.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { extractWithAI, enforceSchema };
}
