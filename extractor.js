// Day 4 AI Extraction Engine - Battle-tested with error handling
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

// Main AI extraction function with robust error handling
async function extractWithAI(pageContent, apiConfig) {
  const startTime = Date.now();
  
  try {
    console.log('[Extractor] Starting AI extraction...');
    
    if (!apiConfig.apiKey) {
      throw new Error('API key not configured');
    }
    
    if (!pageContent || pageContent.length < 50) {
      throw new Error('Insufficient content for extraction');
    }
    
    // Truncate content to avoid token limits
    const truncatedContent = pageContent.slice(0, 8000);
    
    const prompt = `Extract structured information from this webpage content and return ONLY valid JSON with these exact fields:
    
Required fields: title, description, author, date, content, links, images, category

Category must be one of: news, market, opinion, technical, ads, other

Content: ${truncatedContent}

Return only the JSON object, no explanation or additional text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: apiConfig.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a precise web content extractor. Return only valid JSON with the requested fields.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: apiConfig.maxTokens || 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    
    if (!responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
      throw new Error('Invalid API response structure');
    }

    const content = responseData.choices[0].message.content.trim();
    
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
    
    console.log('[Extractor] Success:', {
      duration: `${duration}ms`,
      tokensUsed: responseData.usage?.total_tokens || 'unknown',
      fieldsExtracted: Object.keys(validatedData).filter(k => validatedData[k] !== null).length
    });

    return {
      success: true,
      data: validatedData,
      metadata: {
        extractionTime: duration,
        tokensUsed: responseData.usage?.total_tokens || 0,
        model: apiConfig.model || 'gpt-4o-mini'
      }
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error('[Extractor] Failed:', {
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
