// Day 4 AI Extraction Engine - FREE Gemini 2.0 Flash (CSP-Safe ES Module)

const SCHEMA_FIELDS = ['title', 'description', 'author', 'date', 'content', 'links', 'images', 'category'];

// Schema enforcement - ensures consistent JSON structure
export function enforceSchema(data) {
  const cleanedData = {};
  
  SCHEMA_FIELDS.forEach(field => {
    cleanedData[field] = data[field] || null;
  });
  
  // Ensure arrays are arrays
  cleanedData.links = Array.isArray(cleanedData.links) ? cleanedData.links : [];
  cleanedData.images = Array.isArray(cleanedData.images) ? cleanedData.images : [];
  
  return cleanedData;
}

// ✅ THE FINAL, PERFECTED AI extraction function
export async function extractWithAI(pageContent, apiConfig) {
  const startTime = Date.now();
  
  try {
    console.log('[Extractor] Starting FREE Gemini 2.0 Flash extraction...');
    
    if (!apiConfig.apiKey) {
      throw new Error('API key not configured');
    }
    
    if (!pageContent || pageContent.length < 50) {
      throw new Error('Insufficient content for extraction');
    }
    
    // Prepare content for AI processing
    const truncatedContent = pageContent.length > 8000 ? 
      pageContent.substring(0, 8000) + '...' : pageContent;
    
    console.log(`[Extractor] Processing ${truncatedContent.length} characters...`);
    
    // ✅ PERFECTED Gemini API payload with forced JSON response
    const payload = {
      contents: [{
        parts: [{
          text: `Extract structured data from this webpage content and return ONLY a valid JSON object with these exact fields:
- title: main page title
- description: brief summary (1-2 sentences)  
- author: author name if found
- date: publication date if found
- category: content category (news/blog/product/docs/etc)
- links: array of important URLs mentioned
- images: array of important image descriptions
- content: key content summary (100 words max)

Webpage content:
${truncatedContent}`
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: apiConfig.maxTokens || 2000,
        responseMimeType: "application/json"
      }
    };
    
    console.log('[Extractor] Calling Gemini API...');
    
    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${apiConfig.model}:generateContent?key=${apiConfig.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('[Extractor] Gemini API response received');
    
    // Extract the generated content
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
      throw new Error('Invalid Gemini API response structure');
    }
    
    const generatedText = result.candidates[0].content.parts[0].text;
    console.log('[Extractor] Generated content:', generatedText.substring(0, 200) + '...');
    
    // ✅ CSP-Safe JSON parsing (no eval!)
    let aiData;
    try {
      aiData = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('[Extractor] JSON parse failed:', parseError);
      // Try to extract JSON from text if wrapped
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }
    
    // Enforce our schema
    const cleanedData = enforceSchema(aiData);
    
    const duration = Date.now() - startTime;
    console.log(`[Extractor] AI extraction completed in ${duration}ms`);
    
    return {
      success: true,
      data: cleanedData,
      metadata: {
        model: apiConfig.model,
        extractionTime: duration,
        contentLength: pageContent.length,
        tokensApprox: Math.ceil(pageContent.length / 4)
      }
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error('[Extractor] AI extraction failed:', error);
    
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
