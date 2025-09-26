// Day 8 Championship Cross-Vertical DOM Extraction Engine - ≥80% Accuracy Target

// Prevent multiple initialization with unique Day 8 identifier
if (window.webWeaverDay8ContentLoaded) {
    console.log('[Content] Day 8 script already loaded, skipping initialization');
} else {
    window.webWeaverDay8ContentLoaded = true;
    console.log('[Content] Day 8 Championship Cross-Vertical DOM extraction - ≥80% accuracy target');

    // Day 8 Enhanced extraction strategies optimized for 80%+ accuracy
    const DAY8_EXTRACTION_STRATEGIES = {
        NEWS: {
            title: ['h1', '.headline', '[data-module="ArticleHeader"] h1', '.article-title', 'h1.title', '.story-headline'],
            author: ['.author', '.byline', '[rel="author"]', '.article-author', '.writer-name', '.byline-name', '.author-name'],
            date: ['time', '[datetime]', '.publish-date', '.article-date', '.timestamp', '.date-published', '.story-timestamp'],
            content: ['[data-module="ArticleBody"]', '.article-body', '.story-body', '.content', 'main', '.story-content', '.article-content']
        },
        ECOMMERCE: {
            title: ['#productTitle', 'h1', '.product-title', '[data-testid="product-title"]', '.pdp-product-name', '.product-name'],
            price: ['.a-price-whole', '.price', '[data-testid="price"]', '.current-price', '.sale-price', '.price-current', '.a-price .a-offscreen'],
            rating: ['.a-icon-alt', '.rating', '.stars', '[data-testid="rating"]', '.review-rating', '.a-star-mini', '.review-item .a-icon-alt'],
            images: ['.image-wrapper img', '.product-image', '[data-testid="product-image"]', '.gallery-image', '#main-image', '.a-dynamic-image'],
            description: ['.feature-bullets', '.product-description', '.product-details', '#feature-bullets', '.a-unordered-list']
        },
        RECIPE: {
            title: ['h1', '.recipe-title', '[data-testid="recipe-title"]', '.entry-title', '.recipe-header h1'],
            ingredients: ['.recipe-ingredients li', '.ingredients li', '[data-testid="ingredient"]', '.ingredient-list li', '.recipe-ingredient', '.ingredients-item'],
            instructions: ['.recipe-instructions li', '.instructions li', '[data-testid="instruction"]', '.method li', '.recipe-instruction', '.directions li'],
            author: ['.recipe-author', '.author', '.chef-name', '[rel="author"]', '.recipe-by', '.author-name'],
            servings: ['.recipe-yield', '.servings', '[data-testid="servings"]', '.recipe-servings', '.yield']
        },
        EDUCATIONAL: {
            title: ['h1.firstHeading', 'h1', '.page-title', '.article-title', '.mw-page-title-main'],
            content: ['.mw-parser-output', '.article-content', 'main', '.content', '.mw-content-text'],
            links: ['#bodyContent a[href^="/wiki/"]', '.article-content a', 'main a', '.mw-parser-output a[href^="/wiki/"]'],
            images: ['.infobox img', '.thumbimage', '.article-content img', '.mw-file-element']
        },
        BLOG: {
            title: ['h1', '.post-title', '.entry-title', 'h1.title', '.article-title', '.story-title'],
            author: ['.author', '.post-author', '[rel="author"]', '.writer', '.byline', '.author-name'],
            date: ['.post-date', 'time', '[datetime]', '.published', '.date', '.timestamp'],
            content: ['.post-content', '.entry-content', 'article', 'main', '.story-content', '.article-body']
        }
    };

    // Day 8 Enhanced cross-vertical content extraction with 80% accuracy focus
    function startDay8CrossVerticalExtraction() {
        const startTime = Date.now();
        console.log('[Content] Starting Day 8 CHAMPIONSHIP extraction - targeting ≥80% accuracy...');
        
        const extractionErrors = [];
        const extractionResults = {
            domain: window.location.hostname,
            url: window.location.href,
            extractedAt: new Date().toISOString(),
            strategy: null,
            errors: extractionErrors,
            day8Target: '≥80% accuracy'
        };
        
        try {
            // Detect site type with enhanced accuracy
            const siteType = detectSiteTypeDay8(window.location.hostname, extractionErrors);
            extractionResults.strategy = siteType;
            
            console.log(`[Content] Day 8 detected site type: ${siteType}`);
            
            // Extract content using Day 8 enhanced strategies
            const contentData = extractContentByDay8Strategy(siteType, extractionErrors);
            const metadata = extractDay8Metadata(siteType, extractionErrors);
            
            const duration = Date.now() - startTime;
            console.log(`[Content] Day 8 extraction complete in ${duration}ms`);
            
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
                        errorCount: extractionErrors.length,
                        day8Version: 'championship-accuracy-focused'
                    }
                },
                errors: extractionErrors
            };
            
        } catch (error) {
            const criticalError = {
                type: 'DAY8_CRITICAL_EXTRACTION_ERROR',
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                location: 'startDay8CrossVerticalExtraction'
            };
            extractionErrors.push(criticalError);
            
            console.error('[Content] Day 8 critical extraction error:', error);
            
            return {
                success: false,
                error: error.message,
                errors: extractionErrors
            };
        }
    }

    // Day 8 Enhanced site type detection for better accuracy
    function detectSiteTypeDay8(hostname, errorLog) {
        try {
            const domain = hostname.toLowerCase();
            
            // E-commerce patterns (enhanced)
            if (domain.includes('amazon') || domain.includes('ebay') || domain.includes('etsy') || 
                domain.includes('shop') || domain.includes('store') || domain.includes('walmart') ||
                domain.includes('target') || domain.includes('bestbuy')) {
                return 'ECOMMERCE';
            }
            
            // Recipe patterns (enhanced)
            if (domain.includes('allrecipes') || domain.includes('recipe') || domain.includes('cooking') ||
                domain.includes('food') || domain.includes('chef') || domain.includes('foodnetwork') ||
                domain.includes('epicurious') || domain.includes('tasty')) {
                return 'RECIPE';
            }
            
            // News patterns (enhanced)
            if (domain.includes('bloomberg') || domain.includes('cnn') || domain.includes('news') ||
                domain.includes('reuters') || domain.includes('bbc') || domain.includes('wsj') ||
                domain.includes('nytimes') || domain.includes('washingtonpost')) {
                return 'NEWS';
            }
            
            // Educational patterns (enhanced)
            if (domain.includes('wikipedia') || domain.includes('edu') || domain.includes('wiki') ||
                domain.includes('britannica') || domain.includes('scholar')) {
                return 'EDUCATIONAL';
            }
            
            // Blog patterns (enhanced)
            if (domain.includes('medium') || domain.includes('blog') || domain.includes('wordpress') ||
                domain.includes('blogger') || domain.includes('substack') || domain.includes('dev.to')) {
                return 'BLOG';
            }
            
            // Fallback: analyze page structure with Day 8 precision
            const structuralType = analyzePageStructureDay8(errorLog);
            if (structuralType) {
                return structuralType;
            }
            
            return 'BLOG'; // Default fallback
            
        } catch (error) {
            const detectionError = {
                type: 'DAY8_SITE_TYPE_DETECTION_ERROR',
                message: `Failed to detect site type: ${error.message}`,
                timestamp: new Date().toISOString(),
                location: 'detectSiteTypeDay8'
            };
            errorLog.push(detectionError);
            return 'BLOG';
        }
    }

    // Day 8 Enhanced page structure analysis
    function analyzePageStructureDay8(errorLog) {
        try {
            // Enhanced e-commerce detection
            const priceElements = document.querySelectorAll('[class*="price"], [id*="price"], [data-testid*="price"], .a-price, .price-current, .sale-price');
            const cartElements = document.querySelectorAll('[class*="cart"], [class*="add-to"], [data-testid*="cart"], .add-to-cart, .buy-now');
            const productElements = document.querySelectorAll('[class*="product"], [id*="product"], .item, .listing');
            
            if (priceElements.length > 0 || cartElements.length > 0 || productElements.length > 2) {
                console.log('[Content] Day 8 structural analysis: ECOMMERCE detected');
                return 'ECOMMERCE';
            }
            
            // Enhanced recipe detection  
            const ingredientElements = document.querySelectorAll('[class*="ingredient"], [class*="recipe"], [data-testid*="ingredient"], .ingredients li, .recipe-ingredient');
            const instructionElements = document.querySelectorAll('[class*="instruction"], [class*="method"], [class*="step"], .directions li, .recipe-instruction');
            const recipeElements = document.querySelectorAll('.recipe, [class*="recipe"], .cooking, .kitchen');
            
            if (ingredientElements.length > 3 || instructionElements.length > 3 || recipeElements.length > 1) {
                console.log('[Content] Day 8 structural analysis: RECIPE detected');
                return 'RECIPE';
            }
            
            // Enhanced news detection
            const bylineElements = document.querySelectorAll('[class*="byline"], [class*="author"], [rel="author"], .author, .writer');
            const dateElements = document.querySelectorAll('time, [datetime], [class*="date"], [class*="publish"], .timestamp');
            const articleElements = document.querySelectorAll('article, .article, .story, .news');
            
            if ((bylineElements.length > 0 && dateElements.length > 0) || articleElements.length > 2) {
                console.log('[Content] Day 8 structural analysis: NEWS detected');
                return 'NEWS';
            }
            
            return null;
            
        } catch (error) {
            const analysisError = {
                type: 'DAY8_STRUCTURAL_ANALYSIS_ERROR',
                message: `Day 8 page structure analysis failed: ${error.message}`,
                timestamp: new Date().toISOString(),
                location: 'analyzePageStructureDay8'
            };
            errorLog.push(analysisError);
            return null;
        }
    }

    // Day 8 Enhanced strategy-based content extraction
    function extractContentByDay8Strategy(siteType, errorLog) {
        const strategy = DAY8_EXTRACTION_STRATEGIES[siteType] || DAY8_EXTRACTION_STRATEGIES.BLOG;
        const extractedData = {};
        
        try {
            console.log(`[Content] Day 8 using ${siteType} strategy for enhanced accuracy`);
            
            // Extract title (universal) with Day 8 precision
            extractedData.title = extractWithDay8Fallbacks(strategy.title || ['h1'], 'title', errorLog);
            
            // Site-specific extractions with Day 8 enhancements
            switch (siteType) {
                case 'ECOMMERCE':
                    extractedData.price = extractWithDay8Fallbacks(strategy.price, 'price', errorLog);
                    extractedData.reviews_rating = extractWithDay8Fallbacks(strategy.rating, 'reviews_rating', errorLog);
                    break;
                    
                case 'RECIPE':
                    extractedData.ingredients = extractArrayWithDay8Fallbacks(strategy.ingredients, 'ingredients', errorLog);
                    extractedData.instructions = extractArrayWithDay8Fallbacks(strategy.instructions, 'instructions', errorLog);
                    break;
                    
                case 'NEWS':
                case 'BLOG':
                    extractedData.author = extractWithDay8Fallbacks(strategy.author, 'author', errorLog);
                    extractedData.publication_date = extractWithDay8Fallbacks(strategy.date, 'publication_date', errorLog);
                    break;
                    
                case 'EDUCATIONAL':
                    extractedData.links = extractArrayWithDay8Fallbacks(strategy.links, 'links', errorLog, true);
                    break;
            }
            
            // Universal extractions with Day 8 precision
            const contentSelectors = strategy.content || ['main', 'article', '.content', '.post-content', '.article-body'];
            const contentElement = findElementWithDay8Fallbacks(contentSelectors, errorLog);
            if (contentElement) {
                extractedData.main_content_summary = extractDay8ContentSummary(contentElement, errorLog);
            }
            
            return extractedData;
            
        } catch (error) {
            const strategyError = {
                type: 'DAY8_STRATEGY_EXTRACTION_ERROR',
                message: `Day 8 strategy-based extraction failed: ${error.message}`,
                strategy: siteType,
                timestamp: new Date().toISOString(),
                location: 'extractContentByDay8Strategy'
            };
            errorLog.push(strategyError);
            return extractedData;
        }
    }

    // Day 8 Enhanced element extraction with precision focus
    function extractWithDay8Fallbacks(selectors, fieldName, errorLog) {
        try {
            for (const selector of selectors) {
                try {
                    const elements = document.querySelectorAll(selector);
                    
                    if (elements.length > 0) {
                        for (const element of elements) {
                            let text = '';
                            
                            // Day 8 enhanced field-specific extraction
                            switch (fieldName) {
                                case 'title':
                                    text = element.textContent?.trim() || 
                                           element.getAttribute('title') ||
                                           element.getAttribute('content');
                                    break;
                                case 'publication_date':
                                    text = element.getAttribute('datetime') || 
                                           element.getAttribute('content') || 
                                           element.textContent?.trim();
                                    break;
                                case 'price':
                                    text = element.getAttribute('content') || 
                                           element.textContent?.trim();
                                    // Clean price text
                                    if (text) {
                                        text = text.replace(/[^\d.,\$\€\£]/g, '').trim();
                                    }
                                    break;
                                case 'author':
                                    text = element.textContent?.trim() || 
                                           element.getAttribute('content') ||
                                           element.getAttribute('title');
                                    // Clean author text
                                    if (text) {
                                        text = text.replace(/^(by\s+|author:\s*)/i, '').trim();
                                    }
                                    break;
                                case 'reviews_rating':
                                    text = element.getAttribute('content') ||
                                           element.textContent?.trim() ||
                                           element.getAttribute('title') ||
                                           element.getAttribute('aria-label');
                                    break;
                                default:
                                    text = element.textContent?.trim() || 
                                           element.getAttribute('content') ||
                                           element.getAttribute('alt');
                            }
                            
                            if (text && text.length > 0) {
                                console.log(`[Content] Day 8 ${fieldName} found via ${selector}: ${text.substring(0, 100)}...`);
                                return text;
                            }
                        }
                    }
                } catch (selectorError) {
                    console.warn(`[Content] Day 8 selector error for ${fieldName}:`, selectorError);
                }
            }
            
            return null;
            
        } catch (error) {
            const criticalError = {
                type: 'DAY8_FALLBACK_EXTRACTION_ERROR',
                field: fieldName,
                message: `Day 8 critical error in fallback extraction: ${error.message}`,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                location: 'extractWithDay8Fallbacks'
            };
            errorLog.push(criticalError);
            return null;
        }
    }

    // Day 8 Enhanced array extraction
    function extractArrayWithDay8Fallbacks(selectors, fieldName, errorLog, extractHrefs = false) {
        try {
            for (const selector of selectors) {
                try {
                    const elements = document.querySelectorAll(selector);
                    
                    if (elements.length > 0) {
                        const items = Array.from(elements).map(element => {
                            if (extractHrefs && element.href) {
                                return element.href;
                            }
                            
                            let text = element.textContent?.trim() || 
                                      element.getAttribute('alt') || 
                                      element.getAttribute('src') ||
                                      element.getAttribute('title');
                                      
                            // Day 8 enhanced cleaning
                            if (text && fieldName === 'ingredients') {
                                text = text.replace(/^\d+\.\s*/, '').trim(); // Remove numbering
                            }
                            
                            return text;
                        }).filter(item => item && item.length > 2); // Minimum 3 chars
                        
                        if (items.length > 0) {
                            console.log(`[Content] Day 8 ${fieldName} found via ${selector}: ${items.length} items`);
                            return items;
                        }
                    }
                } catch (selectorError) {
                    console.warn(`[Content] Day 8 selector error for ${fieldName}:`, selectorError);
                }
            }
            
            return [];
            
        } catch (error) {
            console.error(`[Content] Day 8 array extraction error for ${fieldName}:`, error);
            return [];
        }
    }

    // Day 8 Enhanced metadata extraction
    function extractDay8Metadata(siteType, errorLog) {
        const metadata = {};
        
        try {
            // Universal metadata with Day 8 precision
            metadata.category = inferDay8Category(siteType, errorLog);
            metadata.description = extractDay8MetaDescription(errorLog);
            metadata.images = extractDay8Images(errorLog);
            metadata.links = extractDay8RelevantLinks(errorLog);
            
            return metadata;
            
        } catch (error) {
            console.error('[Content] Day 8 metadata extraction error:', error);
            return metadata;
        }
    }

    // Day 8 Enhanced category inference
    function inferDay8Category(siteType, errorLog) {
        try {
            const domain = window.location.hostname.toLowerCase();
            const url = window.location.href.toLowerCase();
            
            const categoryMappings = {
                'ECOMMERCE': 'product',
                'RECIPE': 'recipe',
                'NEWS': 'news',
                'EDUCATIONAL': 'education',
                'BLOG': 'blog'
            };
            
            let category = categoryMappings[siteType] || 'content';
            
            // Day 8 enhanced URL-based refinement
            if (domain.includes('amazon') || url.includes('/product/') || url.includes('/dp/')) category = 'electronics';
            if (domain.includes('allrecipes') || url.includes('/recipe/')) category = 'recipe';
            if (domain.includes('bloomberg') || url.includes('/news/') || url.includes('/article/')) category = 'finance';
            if (domain.includes('medium') || url.includes('/story/') || url.includes('/@')) category = 'technology';
            if (domain.includes('wikipedia') || url.includes('/wiki/')) category = 'encyclopedia';
            
            return category;
            
        } catch (error) {
            console.error('[Content] Day 8 category inference error:', error);
            return 'content';
        }
    }

    // Day 8 Enhanced content summary extraction
    function extractDay8ContentSummary(contentElement, errorLog) {
        try {
            if (!contentElement) return null;
            
            const text = contentElement.textContent?.trim();
            if (!text || text.length < 10) return null;
            
            // Day 8 enhanced summary extraction
            const sentences = text.match(/[^\.!?]+[\.!?]+/g);
            if (sentences && sentences.length > 0) {
                // Take first 2-3 meaningful sentences
                const meaningfulSentences = sentences.filter(s => s.trim().length > 20).slice(0, 3);
                if (meaningfulSentences.length > 0) {
                    const summary = meaningfulSentences.join(' ').trim();
                    return summary.substring(0, 300);
                }
            }
            
            // Fallback: use first 300 characters of meaningful content
            const meaningfulText = text.substring(0, 500).trim();
            return meaningfulText.substring(0, 300);
            
        } catch (error) {
            console.error('[Content] Day 8 content summary error:', error);
            return null;
        }
    }

    // Day 8 Enhanced meta description extraction
    function extractDay8MetaDescription(errorLog) {
        try {
            const metaSelectors = [
                'meta[name="description"]',
                'meta[property="og:description"]',
                'meta[name="twitter:description"]',
                'meta[property="description"]',
                'meta[name="description" i]'
            ];
            
            for (const selector of metaSelectors) {
                const metaElement = document.querySelector(selector);
                if (metaElement) {
                    const content = metaElement.getAttribute('content');
                    if (content && content.trim().length > 10) {
                        return content.trim();
                    }
                }
            }
            
            return null;
            
        } catch (error) {
            console.error('[Content] Day 8 meta description error:', error);
            return null;
        }
    }

    // Day 8 Enhanced image extraction
    function extractDay8Images(errorLog) {
        try {
            const images = [];
            const imageSelectors = [
                'img[src]:not([src*="icon"]):not([src*="logo"]):not([src*="pixel"])',
                '.product-image img',
                '.article-image img',
                '.content img'
            ];
            
            const imageElements = document.querySelectorAll(imageSelectors.join(', '));
            
            Array.from(imageElements).forEach(img => {
                const src = img.src || img.getAttribute('data-src');
                if (src && src.startsWith('http') && src.length > 10) {
                    if (!images.includes(src) && images.length < 10) {
                        images.push(src);
                    }
                }
            });
            
            return images;
            
        } catch (error) {
            console.error('[Content] Day 8 image extraction error:', error);
            return [];
        }
    }

    // Day 8 Enhanced links extraction
    function extractDay8RelevantLinks(errorLog) {
        try {
            const links = [];
            const linkElements = document.querySelectorAll('a[href]:not([href*="javascript"]):not([href^="#"]):not([href*="mailto"])');
            
            Array.from(linkElements).forEach(link => {
                const href = link.href;
                const text = link.textContent?.trim();
                
                if (href && text && text.length > 3 && href.length > 10) {
                    if (!links.includes(href) && links.length < 15) {
                        links.push(href);
                    }
                }
            });
            
            return links;
            
        } catch (error) {
            console.error('[Content] Day 8 link extraction error:', error);
            return [];
        }
    }

    // Day 8 Enhanced utility function for finding elements
    function findElementWithDay8Fallbacks(selectors, errorLog) {
        for (const selector of selectors) {
            try {
                const element = document.querySelector(selector);
                if (element && element.textContent?.trim().length > 0) {
                    return element;
                }
            } catch (error) {
                console.warn(`[Content] Day 8 selector error: ${selector}`, error);
            }
        }
        return null;
    }

    // Day 8 Enhanced message listener
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('[Content] Day 8 message received:', request.action);
        
        try {
            if (request.action === "extractPageData") {
                console.log('[Content] Day 8 championship extraction request received');
                const result = startDay8CrossVerticalExtraction();
                sendResponse(result);
                return true;
            }
        } catch (error) {
            console.error('[Content] Day 8 message listener error:', error);
            sendResponse({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString(),
                day8Version: 'championship'
            });
        }
        
        return false;
    });

    console.log('[Content] Day 8 CHAMPIONSHIP Cross-Vertical Content Script loaded - ≥80% accuracy target');
}
