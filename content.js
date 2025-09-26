// Day 7 Championship Cross-Vertical DOM Extraction Engine - Real Testing Focus

// Prevent multiple initialization with unique Day 7 identifier
if (window.webWeaverDay7ContentLoaded) {
    console.log('[Content] Day 7 script already loaded, skipping initialization');
} else {
    window.webWeaverDay7ContentLoaded = true;
    console.log('[Content] Day 7 Championship Cross-Vertical DOM extraction - Real testing focus');

// Day 7 Enhanced extraction strategies optimized for real site testing
const DAY7_EXTRACTION_STRATEGIES = {
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

// Day 7 Enhanced cross-vertical content extraction for real site testing
function startDay7CrossVerticalExtraction() {
    const startTime = Date.now();
    console.log('[Content] Starting Day 7 REAL SITE extraction - surgical baseline...');
    
    const extractionErrors = [];
    const extractionResults = {
        domain: window.location.hostname,
        url: window.location.href,
        extractedAt: new Date().toISOString(),
        strategy: null,
        errors: extractionErrors,
        day7Target: 'Real site testing baseline'
    };

    try {
        // Detect site type for Day 7 real testing
        const siteType = detectSiteTypeDay7(window.location.hostname, extractionErrors);
        extractionResults.strategy = siteType;
        console.log(`[Content] Day 7 detected site type: ${siteType}`);

        // Extract content using Day 7 strategies
        const contentData = extractContentByDay7Strategy(siteType, extractionErrors);
        const metadata = extractDay7Metadata(siteType, extractionErrors);

        const duration = Date.now() - startTime;
        console.log(`[Content] Day 7 extraction completed in ${duration}ms for ${siteType}`);

        return {
            success: true,
            data: {
                ...contentData,
                extractionMetadata: {
                    ...metadata,
                    extractionTime: duration,
                    strategy: siteType,
                    day7Version: 'real-site-testing'
                }
            },
            metadata: {
                extractionTime: duration,
                strategy: siteType,
                errorsCount: extractionErrors.length,
                day7Version: 'surgical-baseline',
                siteType: siteType
            }
        };
    } catch (error) {
        console.error('[Content] Day 7 extraction error:', error);
        extractionErrors.push({
            type: 'DAY7_EXTRACTION_ERROR',
            message: error.message,
            timestamp: new Date().toISOString()
        });

        return {
            success: false,
            error: error.message,
            data: {},
            metadata: {
                extractionTime: Date.now() - startTime,
                errorsCount: extractionErrors.length,
                errors: extractionErrors,
                day7Version: 'surgical-baseline-failed'
            }
        };
    }
}

// Day 7 Enhanced site type detection for real testing
function detectSiteTypeDay7(hostname, errorLog) {
    try {
        const url = window.location.href.toLowerCase();
        const hostname_lower = hostname.toLowerCase();
        
        // Day 7 specific site detection for our test sites
        if (hostname_lower.includes('bloomberg.com') || hostname_lower.includes('reuters.com') || hostname_lower.includes('cnn.com')) {
            return 'NEWS';
        }
        if (hostname_lower.includes('amazon.com') || hostname_lower.includes('ebay.com') || url.includes('/dp/') || url.includes('/product/')) {
            return 'ECOMMERCE';
        }
        if (hostname_lower.includes('allrecipes.com') || hostname_lower.includes('recipe') || url.includes('/recipe/')) {
            return 'RECIPE';
        }
        if (hostname_lower.includes('wikipedia.org') || hostname_lower.includes('wiki')) {
            return 'EDUCATIONAL';
        }
        if (hostname_lower.includes('medium.com') || hostname_lower.includes('blog') || url.includes('/article/')) {
            return 'BLOG';
        }

        // Day 7 fallback detection based on page content
        const title = document.title.toLowerCase();
        const bodyText = document.body.textContent.toLowerCase();

        if (bodyText.includes('ingredients') && bodyText.includes('instructions')) return 'RECIPE';
        if (bodyText.includes('price') && (bodyText.includes('buy') || bodyText.includes('cart'))) return 'ECOMMERCE';
        if (title.includes('news') || bodyText.includes('published') || bodyText.includes('reporter')) return 'NEWS';
        if (bodyText.includes('posted by') || bodyText.includes('author')) return 'BLOG';

        return 'GENERAL';
    } catch (error) {
        console.warn('[Content] Day 7 site type detection error:', error);
        errorLog.push({
            type: 'SITE_TYPE_DETECTION_ERROR',
            message: error.message,
            timestamp: new Date().toISOString()
        });
        return 'GENERAL';
    }
}

// Day 7 Enhanced content extraction by strategy
function extractContentByDay7Strategy(siteType, errorLog) {
    console.log(`[Content] Day 7 extracting content for ${siteType}...`);
    
    const strategy = DAY7_EXTRACTION_STRATEGIES[siteType] || DAY7_EXTRACTION_STRATEGIES.GENERAL || {};
    const extractedContent = {};

    try {
        // Day 7 Enhanced extraction for each field type
        if (strategy.title) {
            extractedContent.title = extractDay7Field(strategy.title, 'text', errorLog) || document.title || null;
        }

        if (strategy.author) {
            extractedContent.author = extractDay7Field(strategy.author, 'text', errorLog);
        }

        if (strategy.date) {
            extractedContent.publication_date = extractDay7Field(strategy.date, 'datetime', errorLog);
        }

        if (strategy.content) {
            extractedContent.main_content_summary = extractDay7Field(strategy.content, 'text', errorLog);
        }

        if (strategy.price) {
            extractedContent.price = extractDay7Field(strategy.price, 'text', errorLog);
        }

        if (strategy.rating) {
            extractedContent.reviews_rating = extractDay7Field(strategy.rating, 'text', errorLog);
        }

        if (strategy.ingredients) {
            extractedContent.ingredients = extractDay7Field(strategy.ingredients, 'list', errorLog);
        }

        if (strategy.instructions) {
            extractedContent.instructions = extractDay7Field(strategy.instructions, 'list', errorLog);
        }

        if (strategy.description) {
            extractedContent.description = extractDay7Field(strategy.description, 'text', errorLog);
        }

        // Day 7 Universal extractions for all sites
        extractedContent.links = extractDay7RelevantLinks(errorLog);
        extractedContent.images = extractDay7Images(errorLog);
        
        // Day 7 Enhanced category detection
        extractedContent.category = detectDay7Category(siteType, extractedContent, errorLog);

        console.log(`[Content] Day 7 ${siteType} extraction completed with ${Object.keys(extractedContent).length} fields`);
        return extractedContent;
    } catch (error) {
        console.error(`[Content] Day 7 ${siteType} extraction failed:`, error);
        errorLog.push({
            type: 'DAY7_CONTENT_EXTRACTION_ERROR',
            siteType: siteType,
            message: error.message,
            timestamp: new Date().toISOString()
        });
        return extractedContent;
    }
}

// Day 7 Enhanced field extraction
function extractDay7Field(selectors, type, errorLog) {
    try {
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                switch (type) {
                    case 'text':
                        const text = element.textContent?.trim();
                        if (text && text.length > 0) return text;
                        break;
                    case 'datetime':
                        const datetime = element.getAttribute('datetime') || element.textContent?.trim();
                        if (datetime && datetime.length > 0) return datetime;
                        break;
                    case 'list':
                        const items = document.querySelectorAll(selector);
                        const list = Array.from(items).map(item => item.textContent?.trim()).filter(Boolean);
                        if (list.length > 0) return list;
                        break;
                }
            }
        }
        return null;
    } catch (error) {
        console.warn(`[Content] Day 7 field extraction error for ${selectors[0]}:`, error);
        return null;
    }
}

// Day 7 Enhanced metadata extraction
function extractDay7Metadata(siteType, errorLog) {
    try {
        const metadata = {
            title: document.title || null,
            description: null,
            keywords: null,
            author: null,
            publishDate: null,
            url: window.location.href,
            domain: window.location.hostname,
            siteType: siteType,
            day7Version: 'real-site-metadata'
        };

        // Extract meta tags for Day 7 accuracy
        const metaTags = document.querySelectorAll('meta');
        metaTags.forEach(meta => {
            const name = meta.getAttribute('name') || meta.getAttribute('property');
            const content = meta.getAttribute('content');
            
            if (name && content) {
                switch (name.toLowerCase()) {
                    case 'description':
                    case 'og:description':
                        metadata.description = content;
                        break;
                    case 'keywords':
                        metadata.keywords = content;
                        break;
                    case 'author':
                    case 'article:author':
                        metadata.author = content;
                        break;
                    case 'article:published_time':
                    case 'datePublished':
                        metadata.publishDate = content;
                        break;
                }
            }
        });

        return metadata;
    } catch (error) {
        console.error('[Content] Day 7 metadata extraction error:', error);
        errorLog.push({
            type: 'DAY7_METADATA_ERROR',
            message: error.message,
            timestamp: new Date().toISOString()
        });
        return {
            siteType: siteType,
            day7Version: 'metadata-failed'
        };
    }
}

// Day 7 Enhanced category detection
function detectDay7Category(siteType, content, errorLog) {
    try {
        // Day 7 site-specific category logic
        switch (siteType) {
            case 'NEWS':
                if (content.title) {
                    const title = content.title.toLowerCase();
                    if (title.includes('tech') || title.includes('technology')) return 'Technology';
                    if (title.includes('business') || title.includes('market')) return 'Business';
                    if (title.includes('politics')) return 'Politics';
                    if (title.includes('sports')) return 'Sports';
                }
                return 'News';
            case 'ECOMMERCE':
                return 'Product';
            case 'RECIPE':
                return 'Recipe';
            case 'EDUCATIONAL':
                return 'Educational';
            case 'BLOG':
                return 'Blog';
            default:
                return 'General';
        }
    } catch (error) {
        console.warn('[Content] Day 7 category detection error:', error);
        return 'Unknown';
    }
}

// Day 7 Enhanced image extraction
function extractDay7Images(errorLog) {
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
        console.error('[Content] Day 7 image extraction error:', error);
        return [];
    }
}

// Day 7 Enhanced links extraction
function extractDay7RelevantLinks(errorLog) {
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
        console.error('[Content] Day 7 link extraction error:', error);
        return [];
    }
}

// Day 7 Enhanced message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[Content] Day 7 message received:', request.action);
    
    try {
        if (request.action === "extractPageData") {
            console.log('[Content] Day 7 real site extraction request received');
            const result = startDay7CrossVerticalExtraction();
            sendResponse(result);
            return true;
        }
    } catch (error) {
        console.error('[Content] Day 7 message listener error:', error);
        sendResponse({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
            day7Version: 'surgical-baseline'
        });
    }
    
    return false;
});

console.log('[Content] Day 7 SURGICAL Cross-Vertical Content Script loaded - Real site testing baseline');

}
