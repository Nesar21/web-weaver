// Day 7 Championship Cross-Vertical DOM Extraction Engine with Enhanced Error Logging

console.log('[Content] Day 7 Cross-Vertical DOM extraction - Championship ready');

// Cross-vertical extraction strategies with error tracking
const EXTRACTION_STRATEGIES = {
    NEWS: {
        title: ['h1', '.headline', '[data-module="ArticleHeader"] h1', '.article-title', 'h1.title'],
        author: ['.author', '.byline', '[rel="author"]', '.article-author', '.writer-name'],
        date: ['time', '[datetime]', '.publish-date', '.article-date', '.timestamp'],
        content: ['[data-module="ArticleBody"]', '.article-body', '.story-body', '.content', 'main']
    },
    ECOMMERCE: {
        title: ['#productTitle', 'h1', '.product-title', '[data-testid="product-title"]', '.pdp-product-name'],
        price: ['.a-price-whole', '.price', '[data-testid="price"]', '.current-price', '.sale-price'],
        rating: ['.a-icon-alt', '.rating', '.stars', '[data-testid="rating"]', '.review-rating'],
        images: ['.image-wrapper img', '.product-image', '[data-testid="product-image"]', '.gallery-image'],
        description: ['.feature-bullets', '.product-description', '.product-details', '#feature-bullets']
    },
    RECIPE: {
        title: ['h1', '.recipe-title', '[data-testid="recipe-title"]', '.entry-title'],
        ingredients: ['.recipe-ingredients li', '.ingredients li', '[data-testid="ingredient"]', '.ingredient-list li'],
        instructions: ['.recipe-instructions li', '.instructions li', '[data-testid="instruction"]', '.method li'],
        author: ['.recipe-author', '.author', '.chef-name', '[rel="author"]'],
        servings: ['.recipe-yield', '.servings', '[data-testid="servings"]', '.recipe-servings']
    },
    EDUCATIONAL: {
        title: ['h1.firstHeading', 'h1', '.page-title', '.article-title'],
        content: ['.mw-parser-output', '.article-content', 'main', '.content'],
        links: ['#bodyContent a[href^="/wiki/"]', '.article-content a', 'main a'],
        images: ['.infobox img', '.thumbimage', '.article-content img']
    },
    BLOG: {
        title: ['h1', '.post-title', '.entry-title', 'h1.title'],
        author: ['.author', '.post-author', '[rel="author"]', '.writer'],
        date: ['.post-date', 'time', '[datetime]', '.published'],
        content: ['.post-content', '.entry-content', 'article', 'main']
    }
};

// Enhanced cross-vertical content extraction with detailed error logging
function startCrossVerticalExtraction() {
    const startTime = Date.now();
    console.log('[Content] Starting Day 7 CROSS-VERTICAL extraction...');
    
    const extractionErrors = [];
    const extractionResults = {
        domain: window.location.hostname,
        url: window.location.href,
        extractedAt: new Date().toISOString(),
        strategy: null,
        errors: extractionErrors
    };
    
    try {
        // Detect site type and select extraction strategy
        const siteType = detectSiteType(window.location.hostname, extractionErrors);
        extractionResults.strategy = siteType;
        
        console.log(`[Content] Detected site type: ${siteType}`);
        
        // Extract content using appropriate strategy
        const contentData = extractContentByStrategy(siteType, extractionErrors);
        const metadata = extractCrossVerticalMetadata(siteType, extractionErrors);
        
        const duration = Date.now() - startTime;
        console.log(`[Content] Day 7 cross-vertical extraction complete in ${duration}ms`);
        
        return {
            success: true,
            data: {
                ...contentData,
                ...metadata,
                extractionMetadata: {
                    duration: `${duration}ms`,
                    strategy: siteType,
                    domain: extractionResults.domain,
                    extractedAt: extractionResults.extractedAt,
                    errorCount: extractionErrors.length
                }
            },
            errors: extractionErrors
        };
        
    } catch (error) {
        const criticalError = {
            type: 'CRITICAL_EXTRACTION_ERROR',
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            location: 'startCrossVerticalExtraction'
        };
        extractionErrors.push(criticalError);
        
        console.error('[Content] Critical extraction error:', error);
        
        return {
            success: false,
            error: error.message,
            errors: extractionErrors
        };
    }
}

// Site type detection with error tracking
function detectSiteType(hostname, errorLog) {
    try {
        const domain = hostname.toLowerCase();
        
        // E-commerce patterns
        if (domain.includes('amazon') || domain.includes('ebay') || domain.includes('etsy') || 
            domain.includes('shop') || domain.includes('store')) {
            return 'ECOMMERCE';
        }
        
        // Recipe patterns
        if (domain.includes('allrecipes') || domain.includes('recipe') || domain.includes('cooking') ||
            domain.includes('food') || domain.includes('chef')) {
            return 'RECIPE';
        }
        
        // News patterns
        if (domain.includes('bloomberg') || domain.includes('cnn') || domain.includes('news') ||
            domain.includes('reuters') || domain.includes('bbc')) {
            return 'NEWS';
        }
        
        // Educational patterns
        if (domain.includes('wikipedia') || domain.includes('edu') || domain.includes('wiki')) {
            return 'EDUCATIONAL';
        }
        
        // Blog patterns
        if (domain.includes('medium') || domain.includes('blog') || domain.includes('wordpress')) {
            return 'BLOG';
        }
        
        // Fallback: analyze page structure
        const structuralType = analyzePageStructure(errorLog);
        if (structuralType) {
            return structuralType;
        }
        
        return 'BLOG'; // Default fallback
        
    } catch (error) {
        const detectionError = {
            type: 'SITE_TYPE_DETECTION_ERROR',
            message: `Failed to detect site type: ${error.message}`,
            timestamp: new Date().toISOString(),
            location: 'detectSiteType'
        };
        errorLog.push(detectionError);
        return 'BLOG'; // Safe fallback
    }
}

// Structural analysis for site type detection
function analyzePageStructure(errorLog) {
    try {
        // Check for e-commerce indicators
        const priceElements = document.querySelectorAll('[class*="price"], [id*="price"], [data-testid*="price"]');
        const cartElements = document.querySelectorAll('[class*="cart"], [class*="add-to"], [data-testid*="cart"]');
        if (priceElements.length > 0 || cartElements.length > 0) {
            return 'ECOMMERCE';
        }
        
        // Check for recipe indicators  
        const ingredientElements = document.querySelectorAll('[class*="ingredient"], [class*="recipe"], [data-testid*="ingredient"]');
        const instructionElements = document.querySelectorAll('[class*="instruction"], [class*="method"], [class*="step"]');
        if (ingredientElements.length > 2 || instructionElements.length > 2) {
            return 'RECIPE';
        }
        
        // Check for news indicators
        const bylineElements = document.querySelectorAll('[class*="byline"], [class*="author"], [rel="author"]');
        const dateElements = document.querySelectorAll('time, [datetime], [class*="date"], [class*="publish"]');
        if (bylineElements.length > 0 && dateElements.length > 0) {
            return 'NEWS';
        }
        
        return null;
        
    } catch (error) {
        const analysisError = {
            type: 'STRUCTURAL_ANALYSIS_ERROR',
            message: `Page structure analysis failed: ${error.message}`,
            timestamp: new Date().toISOString(),
            location: 'analyzePageStructure'
        };
        errorLog.push(analysisError);
        return null;
    }
}

// Strategy-based content extraction with comprehensive error logging
function extractContentByStrategy(siteType, errorLog) {
    const strategy = EXTRACTION_STRATEGIES[siteType] || EXTRACTION_STRATEGIES.BLOG;
    const extractedData = {};
    
    try {
        // Extract title (universal)
        extractedData.title = extractWithFallbacks(strategy.title || ['h1'], 'title', errorLog);
        
        // Site-specific extractions
        switch (siteType) {
            case 'ECOMMERCE':
                extractedData.price = extractWithFallbacks(strategy.price, 'price', errorLog);
                extractedData.reviews_rating = extractWithFallbacks(strategy.rating, 'reviews_rating', errorLog);
                break;
                
            case 'RECIPE':
                extractedData.ingredients = extractArrayWithFallbacks(strategy.ingredients, 'ingredients', errorLog);
                extractedData.instructions = extractArrayWithFallbacks(strategy.instructions, 'instructions', errorLog);
                break;
                
            case 'NEWS':
            case 'BLOG':
                extractedData.author = extractWithFallbacks(strategy.author, 'author', errorLog);
                extractedData.publication_date = extractWithFallbacks(strategy.date, 'publication_date', errorLog);
                break;
                
            case 'EDUCATIONAL':
                extractedData.links = extractArrayWithFallbacks(strategy.links, 'links', errorLog, true);
                break;
        }
        
        // Universal extractions
        const contentSelectors = strategy.content || ['main', 'article', '.content'];
        const contentElement = findElementWithFallbacks(contentSelectors, errorLog);
        if (contentElement) {
            extractedData.main_content_summary = extractContentSummary(contentElement, errorLog);
        }
        
        return extractedData;
        
    } catch (error) {
        const strategyError = {
            type: 'STRATEGY_EXTRACTION_ERROR',
            message: `Strategy-based extraction failed: ${error.message}`,
            strategy: siteType,
            timestamp: new Date().toISOString(),
            location: 'extractContentByStrategy'
        };
        errorLog.push(strategyError);
        return extractedData; // Return partial data
    }
}

// Enhanced element extraction with detailed error tracking
function extractWithFallbacks(selectors, fieldName, errorLog) {
    const attempts = [];
    
    try {
        for (const selector of selectors) {
            try {
                const elements = document.querySelectorAll(selector);
                attempts.push({
                    selector: selector,
                    elementsFound: elements.length,
                    success: elements.length > 0
                });
                
                if (elements.length > 0) {
                    const element = elements[0];
                    let text = '';
                    
                    // Special handling for different field types
                    switch (fieldName) {
                        case 'publication_date':
                            text = element.getAttribute('datetime') || 
                                   element.getAttribute('content') || 
                                   element.textContent?.trim();
                            break;
                        case 'price':
                            text = element.getAttribute('content') || 
                                   element.textContent?.trim();
                            break;
                        default:
                            text = element.textContent?.trim() || 
                                   element.getAttribute('content') ||
                                   element.getAttribute('alt');
                    }
                    
                    if (text && text.length > 0) {
                        console.log(`[Content] ${fieldName} found via ${selector}: ${text.substring(0, 100)}...`);
                        return text;
                    }
                }
            } catch (selectorError) {
                attempts.push({
                    selector: selector,
                    error: selectorError.message,
                    success: false
                });
            }
        }
        
        // Log extraction failure with detailed attempts
        const extractionError = {
            type: 'FIELD_EXTRACTION_FAILED',
            field: fieldName,
            message: `No valid content found for ${fieldName}`,
            attempts: attempts,
            timestamp: new Date().toISOString(),
            location: 'extractWithFallbacks'
        };
        errorLog.push(extractionError);
        
        return null;
        
    } catch (error) {
        const criticalError = {
            type: 'FALLBACK_EXTRACTION_ERROR',
            field: fieldName,
            message: `Critical error in fallback extraction: ${error.message}`,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            location: 'extractWithFallbacks'
        };
        errorLog.push(criticalError);
        return null;
    }
}

// Array extraction with comprehensive error logging
function extractArrayWithFallbacks(selectors, fieldName, errorLog, extractHrefs = false) {
    const attempts = [];
    
    try {
        for (const selector of selectors) {
            try {
                const elements = document.querySelectorAll(selector);
                attempts.push({
                    selector: selector,
                    elementsFound: elements.length,
                    success: elements.length > 0
                });
                
                if (elements.length > 0) {
                    const items = Array.from(elements).map(element => {
                        if (extractHrefs && element.href) {
                            return element.href;
                        }
                        return element.textContent?.trim() || 
                               element.getAttribute('alt') || 
                               element.getAttribute('src');
                    }).filter(item => item && item.length > 0);
                    
                    if (items.length > 0) {
                        console.log(`[Content] ${fieldName} found via ${selector}: ${items.length} items`);
                        return items;
                    }
                }
            } catch (selectorError) {
                attempts.push({
                    selector: selector,
                    error: selectorError.message,
                    success: false
                });
            }
        }
        
        // Log array extraction failure
        const arrayError = {
            type: 'ARRAY_EXTRACTION_FAILED',
            field: fieldName,
            message: `No valid array content found for ${fieldName}`,
            attempts: attempts,
            timestamp: new Date().toISOString(),
            location: 'extractArrayWithFallbacks'
        };
        errorLog.push(arrayError);
        
        return [];
        
    } catch (error) {
        const criticalError = {
            type: 'ARRAY_EXTRACTION_CRITICAL_ERROR',
            field: fieldName,
            message: `Critical error in array extraction: ${error.message}`,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            location: 'extractArrayWithFallbacks'
        };
        errorLog.push(criticalError);
        return [];
    }
}

// Enhanced metadata extraction with error tracking
function extractCrossVerticalMetadata(siteType, errorLog) {
    const metadata = {};
    
    try {
        // Universal metadata
        metadata.category = inferCategory(siteType, errorLog);
        metadata.description = extractMetaDescription(errorLog);
        metadata.images = extractImages(errorLog);
        metadata.links = extractRelevantLinks(errorLog);
        
        return metadata;
        
    } catch (error) {
        const metadataError = {
            type: 'METADATA_EXTRACTION_ERROR',
            message: `Metadata extraction failed: ${error.message}`,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            location: 'extractCrossVerticalMetadata'
        };
        errorLog.push(metadataError);
        return metadata;
    }
}

// Category inference with error handling
function inferCategory(siteType, errorLog) {
    try {
        const domain = window.location.hostname.toLowerCase();
        
        const categoryMappings = {
            'ECOMMERCE': 'product',
            'RECIPE': 'recipe',
            'NEWS': 'news',
            'EDUCATIONAL': 'education',
            'BLOG': 'blog'
        };
        
        let category = categoryMappings[siteType] || 'content';
        
        // Refine category based on URL or content
        if (domain.includes('amazon')) category = 'electronics';
        if (domain.includes('allrecipes')) category = 'recipe';
        if (domain.includes('bloomberg')) category = 'finance';
        if (domain.includes('medium')) category = 'technology';
        if (domain.includes('wikipedia')) category = 'encyclopedia';
        
        return category;
        
    } catch (error) {
        const categoryError = {
            type: 'CATEGORY_INFERENCE_ERROR',
            message: `Category inference failed: ${error.message}`,
            timestamp: new Date().toISOString(),
            location: 'inferCategory'
        };
        errorLog.push(categoryError);
        return 'content';
    }
}

// Enhanced content summary extraction
function extractContentSummary(contentElement, errorLog) {
    try {
        if (!contentElement) return null;
        
        const text = contentElement.textContent?.trim();
        if (!text) return null;
        
        // Extract first 2-3 sentences for summary
        const sentences = text.match(/[^\.!?]+[\.!?]+/g);
        if (sentences && sentences.length > 0) {
            const summary = sentences.slice(0, 3).join(' ').trim();
            return summary.substring(0, 300); // Limit to 300 characters
        }
        
        // Fallback: use first 300 characters
        return text.substring(0, 300);
        
    } catch (error) {
        const summaryError = {
            type: 'CONTENT_SUMMARY_ERROR',
            message: `Content summary extraction failed: ${error.message}`,
            timestamp: new Date().toISOString(),
            location: 'extractContentSummary'
        };
        errorLog.push(summaryError);
        return null;
    }
}

// Meta description extraction with error handling
function extractMetaDescription(errorLog) {
    try {
        const metaDesc = document.querySelector('meta[name="description"]') ||
                        document.querySelector('meta[property="og:description"]') ||
                        document.querySelector('meta[name="twitter:description"]');
        
        if (metaDesc) {
            const content = metaDesc.getAttribute('content');
            if (content && content.trim().length > 0) {
                return content.trim();
            }
        }
        
        return null;
        
    } catch (error) {
        const descError = {
            type: 'META_DESCRIPTION_ERROR',
            message: `Meta description extraction failed: ${error.message}`,
            timestamp: new Date().toISOString(),
            location: 'extractMetaDescription'
        };
        errorLog.push(descError);
        return null;
    }
}

// Image extraction with error handling
function extractImages(errorLog) {
    try {
        const images = [];
        const imageSelectors = ['img[src]:not([src*="icon"]):not([src*="logo"])'];
        
        const imageElements = document.querySelectorAll(imageSelectors.join(', '));
        
        Array.from(imageElements).slice(0, 5).forEach(img => {
            const src = img.src;
            const alt = img.alt;
            if (src && src.startsWith('http')) {
                images.push(src);
            }
        });
        
        return images;
        
    } catch (error) {
        const imageError = {
            type: 'IMAGE_EXTRACTION_ERROR',
            message: `Image extraction failed: ${error.message}`,
            timestamp: new Date().toISOString(),
            location: 'extractImages'
        };
        errorLog.push(imageError);
        return [];
    }
}

// Relevant links extraction with error handling
function extractRelevantLinks(errorLog) {
    try {
        const links = [];
        const linkElements = document.querySelectorAll('a[href]:not([href*="javascript"]):not([href^="#"])');
        
        Array.from(linkElements).slice(0, 10).forEach(link => {
            const href = link.href;
            const text = link.textContent?.trim();
            if (href && text && text.length > 5) {
                links.push(href);
            }
        });
        
        return links;
        
    } catch (error) {
        const linkError = {
            type: 'LINK_EXTRACTION_ERROR',
            message: `Link extraction failed: ${error.message}`,
            timestamp: new Date().toISOString(),
            location: 'extractRelevantLinks'
        };
        errorLog.push(linkError);
        return [];
    }
}

// Utility function for finding elements with fallbacks
function findElementWithFallbacks(selectors, errorLog) {
    for (const selector of selectors) {
        try {
            const element = document.querySelector(selector);
            if (element) {
                return element;
            }
        } catch (error) {
            const selectorError = {
                type: 'SELECTOR_ERROR',
                selector: selector,
                message: `Selector failed: ${error.message}`,
                timestamp: new Date().toISOString(),
                location: 'findElementWithFallbacks'
            };
            errorLog.push(selectorError);
        }
    }
    return null;
}

// Message listener for cross-vertical extraction
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractPageData") {
        console.log('[Content] Day 7 cross-vertical extraction request received');
        const result = startCrossVerticalExtraction();
        sendResponse(result);
        return true;
    }
});

console.log('[Content] Day 7 CROSS-VERTICAL Content Script loaded - Championship ready');
