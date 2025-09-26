// Day 7 Championship Cross-Vertical DOM Extraction Engine - OPERATION SURGICAL DATA++

// Prevent multiple initialization with unique Day 7 identifier
if (window.webWeaverDay7SurgicalLoaded) {
    console.log('[Content] Day 7 SURGICAL script already loaded, skipping initialization');
} else {
    window.webWeaverDay7SurgicalLoaded = true;
    console.log('[Content] Day 7 OPERATION SURGICAL DATA++ DOM extraction - Cross-domain precision targeting');

// Day 7 Enhanced extraction strategies optimized for cross-vertical mastery
const DAY7_SURGICAL_STRATEGIES = {
    NEWS: {
        title: ['h1', '.headline', '[data-module="ArticleHeader"] h1', '.article-title', 'h1.title', '.story-headline', '.entry-title', '.post-title'],
        author: ['.author', '.byline', '[rel="author"]', '.article-author', '.writer-name', '.byline-name', '.author-name', '.by-author', '.article-byline'],
        date: ['time', '[datetime]', '.publish-date', '.article-date', '.timestamp', '.date-published', '.story-timestamp', '.published-date', '.date'],
        content: ['[data-module="ArticleBody"]', '.article-body', '.story-body', '.content', 'main', '.story-content', '.article-content', '.entry-content', '.post-content'],
        category: ['.category', '.section', '.tag', '.article-section', '.story-section', '[data-module="ArticleHeader"] .category']
    },
    ECOMMERCE: {
        title: ['#productTitle', 'h1', '.product-title', '[data-testid="product-title"]', '.pdp-product-name', '.product-name', '.item-title'],
        price: ['.a-price-whole', '.price', '[data-testid="price"]', '.current-price', '.sale-price', '.price-current', '.a-price .a-offscreen', '.price-now', '.product-price'],
        rating: ['.a-icon-alt', '.rating', '.stars', '[data-testid="rating"]', '.review-rating', '.a-star-mini', '.review-item .a-icon-alt', '.stars-rating', '.product-rating'],
        images: ['.image-wrapper img', '.product-image', '[data-testid="product-image"]', '.gallery-image', '#main-image', '.a-dynamic-image', '.product-photo img'],
        description: ['.feature-bullets', '.product-description', '.product-details', '#feature-bullets', '.a-unordered-list', '.product-summary', '.item-description']
    },
    RECIPE: {
        title: ['h1', '.recipe-title', '[data-testid="recipe-title"]', '.entry-title', '.recipe-header h1', '.recipe-name'],
        ingredients: ['.recipe-ingredients li', '.ingredients li', '[data-testid="ingredient"]', '.ingredient-list li', '.recipe-ingredient', '.ingredients-item', '.recipe-ingredients .ingredient'],
        instructions: ['.recipe-instructions li', '.instructions li', '[data-testid="instruction"]', '.method li', '.recipe-instruction', '.directions li', '.recipe-instructions .instruction'],
        author: ['.recipe-author', '.author', '.chef-name', '[rel="author"]', '.recipe-by', '.author-name', '.recipe-credit'],
        servings: ['.recipe-yield', '.servings', '[data-testid="servings"]', '.recipe-servings', '.yield', '.recipe-nutrition-yield']
    },
    EDUCATIONAL: {
        title: ['h1.firstHeading', 'h1', '.page-title', '.article-title', '.mw-page-title-main', '.entry-title'],
        content: ['.mw-parser-output', '.article-content', 'main', '.content', '.mw-content-text', '.page-content'],
        links: ['#bodyContent a[href^="/wiki/"]', '.article-content a', 'main a', '.mw-parser-output a[href^="/wiki/"]', '.content a'],
        images: ['.infobox img', '.thumbimage', '.article-content img', '.mw-file-element', '.content img'],
        category: ['.catlinks', '.categories', '.article-categories', '.page-categories']
    },
    BLOG: {
        title: ['h1', '.post-title', '.entry-title', 'h1.title', '.article-title', '.story-title', '.blog-title'],
        author: ['.author', '.post-author', '[rel="author"]', '.writer', '.byline', '.author-name', '.post-by'],
        date: ['.post-date', 'time', '[datetime]', '.published', '.date', '.timestamp', '.post-published'],
        content: ['.post-content', '.entry-content', 'article', 'main', '.story-content', '.article-body', '.blog-content']
    },
    WILDCARD: {
        title: ['h1', '.title', '.main-title', '.page-title', '.header-title', '.product-title', '.article-title'],
        description: ['.description', '.summary', '.intro', '.excerpt', '.lead', '.tagline', '.subtitle'],
        content: ['main', '.main-content', '.content', '.body', 'article', '.page-content'],
        category: ['.category', '.tag', '.section', '.type', '.breadcrumb', '.navigation']
    }
};

// Day 7 Enhanced cross-vertical content extraction for OPERATION SURGICAL DATA++
function startDay7SurgicalExtraction() {
    const startTime = Date.now();
    console.log('[Content] Starting Day 7 SURGICAL extraction - Operation cross-domain infiltration...');
    
    const extractionErrors = [];
    const extractionResults = {
        domain: window.location.hostname,
        url: window.location.href,
        extractedAt: new Date().toISOString(),
        strategy: null,
        errors: extractionErrors,
        day7Target: 'OPERATION SURGICAL DATA++ baseline'
    };

    try {
        // Detect enemy domain type for Day 7 surgical targeting
        const domainType = detectDay7DomainType(window.location.hostname, extractionErrors);
        extractionResults.strategy = domainType;
        console.log(`[Content] Day 7 infiltrated domain type: ${domainType}`);

        // Execute surgical content extraction using Day 7 strategies
        const contentData = extractContentByDay7SurgicalStrategy(domainType, extractionErrors);
        const metadata = extractDay7SurgicalMetadata(domainType, extractionErrors);

        const duration = Date.now() - startTime;
        console.log(`[Content] Day 7 SURGICAL extraction completed in ${duration}ms for ${domainType} domain`);

        return {
            success: true,
            data: {
                ...contentData,
                extractionMetadata: {
                    ...metadata,
                    extractionTime: duration,
                    strategy: domainType,
                    day7Version: 'surgical-cross-domain',
                    operationName: 'SURGICAL DATA++'
                }
            },
            metadata: {
                extractionTime: duration,
                strategy: domainType,
                errorsCount: extractionErrors.length,
                day7Version: 'surgical-baseline',
                domainType: domainType,
                realDomainTested: true
            }
        };
    } catch (error) {
        console.error('[Content] Day 7 SURGICAL extraction error:', error);
        extractionErrors.push({
            type: 'DAY7_SURGICAL_EXTRACTION_ERROR',
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

// Day 7 Enhanced domain type detection for surgical cross-vertical targeting
function detectDay7DomainType(hostname, errorLog) {
    try {
        const url = window.location.href.toLowerCase();
        const hostname_lower = hostname.toLowerCase();
        const title = document.title.toLowerCase();
        const bodyText = document.body ? document.body.textContent.toLowerCase() : '';
        
        // Day 7 SURGICAL domain detection for OPERATION SURGICAL DATA++ test sites
        if (hostname_lower.includes('bloomberg.com') || hostname_lower.includes('reuters.com') || hostname_lower.includes('cnn.com') || 
            hostname_lower.includes('bbc.com') || hostname_lower.includes('wsj.com')) {
            return 'NEWS';
        }
        
        if (hostname_lower.includes('amazon.com') || hostname_lower.includes('ebay.com') || url.includes('/dp/') || 
            url.includes('/product/') || bodyText.includes('add to cart')) {
            return 'ECOMMERCE';
        }
        
        if (hostname_lower.includes('allrecipes.com') || hostname_lower.includes('food.com') || url.includes('/recipe/') || 
            (bodyText.includes('ingredients') && bodyText.includes('instructions'))) {
            return 'RECIPE';
        }
        
        if (hostname_lower.includes('wikipedia.org') || hostname_lower.includes('wiki')) {
            return 'EDUCATIONAL';
        }
        
        if (hostname_lower.includes('medium.com') || hostname_lower.includes('blog') || url.includes('/article/') ||
            title.includes('blog') || bodyText.includes('posted by')) {
            return 'BLOG';
        }

        // Day 7 WILDCARD detection for ProductHunt and unknown domains
        if (hostname_lower.includes('producthunt.com') || hostname_lower.includes('hackernews') || 
            hostname_lower.includes('reddit.com')) {
            return 'WILDCARD';
        }

        // Day 7 Enhanced fallback detection based on page content analysis
        if (bodyText.includes('ingredients') && bodyText.includes('directions')) return 'RECIPE';
        if (bodyText.includes('price') && (bodyText.includes('buy now') || bodyText.includes('add to cart'))) return 'ECOMMERCE';
        if (title.includes('news') || bodyText.includes('breaking news') || bodyText.includes('reporter')) return 'NEWS';
        if (bodyText.includes('posted by') || bodyText.includes('author:') || url.includes('blog')) return 'BLOG';
        if (bodyText.includes('encyclopedia') || title.includes('wikipedia')) return 'EDUCATIONAL';

        return 'WILDCARD';
    } catch (error) {
        console.warn('[Content] Day 7 domain type detection error:', error);
        errorLog.push({
            type: 'DOMAIN_TYPE_DETECTION_ERROR',
            message: error.message,
            timestamp: new Date().toISOString()
        });
        return 'WILDCARD';
    }
}

// Day 7 Enhanced content extraction by surgical strategy
function extractContentByDay7SurgicalStrategy(domainType, errorLog) {
    console.log(`[Content] Day 7 SURGICAL extracting content for ${domainType} domain...`);
    
    const strategy = DAY7_SURGICAL_STRATEGIES[domainType] || DAY7_SURGICAL_STRATEGIES.WILDCARD;
    const extractedContent = {};

    try {
        // Day 7 SURGICAL extraction for each field type with enhanced precision
        if (strategy.title) {
            extractedContent.title = extractDay7SurgicalField(strategy.title, 'text', errorLog) || document.title || null;
        }

        if (strategy.author) {
            extractedContent.author = extractDay7SurgicalField(strategy.author, 'text', errorLog);
        }

        if (strategy.date) {
            extractedContent.publication_date = extractDay7SurgicalField(strategy.date, 'datetime', errorLog);
        }

        if (strategy.content) {
            extractedContent.main_content_summary = extractDay7SurgicalField(strategy.content, 'text', errorLog);
        }

        if (strategy.price) {
            extractedContent.price = extractDay7SurgicalField(strategy.price, 'text', errorLog);
        }

        if (strategy.rating) {
            extractedContent.reviews_rating = extractDay7SurgicalField(strategy.rating, 'text', errorLog);
        }

        if (strategy.ingredients) {
            extractedContent.ingredients = extractDay7SurgicalField(strategy.ingredients, 'list', errorLog);
        }

        if (strategy.instructions) {
            extractedContent.instructions = extractDay7SurgicalField(strategy.instructions, 'list', errorLog);
        }

        if (strategy.description) {
            extractedContent.description = extractDay7SurgicalField(strategy.description, 'text', errorLog);
        }

        if (strategy.category) {
            extractedContent.category = extractDay7SurgicalField(strategy.category, 'text', errorLog);
        }

        // Day 7 SURGICAL universal extractions for all domain types
        extractedContent.links = extractDay7SurgicalLinks(errorLog);
        extractedContent.images = extractDay7SurgicalImages(errorLog);
        
        // Day 7 Enhanced category detection if not already extracted
        if (!extractedContent.category) {
            extractedContent.category = detectDay7SurgicalCategory(domainType, extractedContent, errorLog);
        }

        console.log(`[Content] Day 7 SURGICAL ${domainType} extraction completed with ${Object.keys(extractedContent).filter(k => extractedContent[k]).length} fields extracted`);
        return extractedContent;
    } catch (error) {
        console.error(`[Content] Day 7 SURGICAL ${domainType} extraction failed:`, error);
        errorLog.push({
            type: 'DAY7_SURGICAL_CONTENT_EXTRACTION_ERROR',
            domainType: domainType,
            message: error.message,
            timestamp: new Date().toISOString()
        });
        return extractedContent;
    }
}

// Day 7 SURGICAL field extraction with enhanced precision
function extractDay7SurgicalField(selectors, type, errorLog) {
    try {
        for (const selector of selectors) {
            try {
                const elements = document.querySelectorAll(selector);
                
                for (const element of elements) {
                    if (element) {
                        switch (type) {
                            case 'text':
                                const text = element.textContent?.trim();
                                if (text && text.length > 0 && !text.toLowerCase().includes('loading') && 
                                    !text.toLowerCase().includes('advertisement')) {
                                    return text;
                                }
                                break;
                            case 'datetime':
                                let datetime = element.getAttribute('datetime') || element.getAttribute('data-time') || 
                                             element.getAttribute('data-date') || element.textContent?.trim();
                                if (datetime && datetime.length > 0) return datetime;
                                break;
                            case 'list':
                                const listItems = document.querySelectorAll(selector);
                                const list = Array.from(listItems)
                                    .map(item => item.textContent?.trim())
                                    .filter(text => text && text.length > 0 && !text.toLowerCase().includes('advertisement'));
                                if (list.length > 0) return list;
                                break;
                        }
                    }
                }
            } catch (selectorError) {
                console.warn(`[Content] Day 7 SURGICAL selector ${selector} failed:`, selectorError);
                continue; // Try next selector
            }
        }
        return null;
    } catch (error) {
        console.warn(`[Content] Day 7 SURGICAL field extraction error for ${selectors[0]}:`, error);
        return null;
    }
}

// Day 7 SURGICAL metadata extraction with cross-domain intelligence
function extractDay7SurgicalMetadata(domainType, errorLog) {
    try {
        const metadata = {
            title: document.title || null,
            description: null,
            keywords: null,
            author: null,
            publishDate: null,
            url: window.location.href,
            domain: window.location.hostname,
            domainType: domainType,
            operationName: 'SURGICAL DATA++',
            day7Version: 'surgical-cross-domain-metadata'
        };

        // Extract meta tags for Day 7 surgical precision
        const metaTags = document.querySelectorAll('meta');
        metaTags.forEach(meta => {
            const name = meta.getAttribute('name') || meta.getAttribute('property');
            const content = meta.getAttribute('content');
            
            if (name && content) {
                switch (name.toLowerCase()) {
                    case 'description':
                    case 'og:description':
                    case 'twitter:description':
                        if (!metadata.description) metadata.description = content;
                        break;
                    case 'keywords':
                    case 'news_keywords':
                        metadata.keywords = content;
                        break;
                    case 'author':
                    case 'article:author':
                    case 'twitter:creator':
                        if (!metadata.author) metadata.author = content;
                        break;
                    case 'article:published_time':
                    case 'datePublished':
                    case 'date':
                        if (!metadata.publishDate) metadata.publishDate = content;
                        break;
                }
            }
        });

        // Day 7 Enhanced structured data extraction
        try {
            const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
            jsonLdScripts.forEach(script => {
                try {
                    const data = JSON.parse(script.textContent);
                    if (data.author && !metadata.author) {
                        metadata.author = typeof data.author === 'object' ? data.author.name : data.author;
                    }
                    if (data.datePublished && !metadata.publishDate) {
                        metadata.publishDate = data.datePublished;
                    }
                    if (data.description && !metadata.description) {
                        metadata.description = data.description;
                    }
                } catch (jsonError) {
                    // Skip invalid JSON-LD
                }
            });
        } catch (structuredDataError) {
            console.warn('[Content] Day 7 structured data extraction warning:', structuredDataError);
        }

        return metadata;
    } catch (error) {
        console.error('[Content] Day 7 SURGICAL metadata extraction error:', error);
        errorLog.push({
            type: 'DAY7_SURGICAL_METADATA_ERROR',
            message: error.message,
            timestamp: new Date().toISOString()
        });
        return {
            domainType: domainType,
            operationName: 'SURGICAL DATA++',
            day7Version: 'metadata-extraction-failed'
        };
    }
}

// Day 7 SURGICAL category detection with cross-domain intelligence
function detectDay7SurgicalCategory(domainType, content, errorLog) {
    try {
        // Day 7 domain-specific category logic with surgical precision
        switch (domainType) {
            case 'NEWS':
                if (content.title) {
                    const title = content.title.toLowerCase();
                    if (title.includes('tech') || title.includes('technology') || title.includes('ai')) return 'Technology';
                    if (title.includes('business') || title.includes('market') || title.includes('stock')) return 'Business';
                    if (title.includes('politics') || title.includes('election') || title.includes('government')) return 'Politics';
                    if (title.includes('sports') || title.includes('nfl') || title.includes('nba')) return 'Sports';
                    if (title.includes('health') || title.includes('medical') || title.includes('covid')) return 'Health';
                }
                return 'News';
            case 'ECOMMERCE':
                if (content.title) {
                    const title = content.title.toLowerCase();
                    if (title.includes('book') || title.includes('kindle')) return 'Books';
                    if (title.includes('phone') || title.includes('laptop') || title.includes('computer')) return 'Electronics';
                    if (title.includes('shirt') || title.includes('dress') || title.includes('shoes')) return 'Clothing';
                    if (title.includes('home') || title.includes('kitchen') || title.includes('furniture')) return 'Home & Garden';
                }
                return 'Product';
            case 'RECIPE':
                if (content.title) {
                    const title = content.title.toLowerCase();
                    if (title.includes('dessert') || title.includes('cake') || title.includes('cookie')) return 'Desserts';
                    if (title.includes('chicken') || title.includes('beef') || title.includes('pork')) return 'Main Dishes';
                    if (title.includes('salad') || title.includes('appetizer') || title.includes('snack')) return 'Appetizers';
                    if (title.includes('breakfast') || title.includes('brunch')) return 'Breakfast';
                }
                return 'Recipe';
            case 'EDUCATIONAL':
                return 'Educational';
            case 'BLOG':
                if (content.title) {
                    const title = content.title.toLowerCase();
                    if (title.includes('tutorial') || title.includes('how to') || title.includes('guide')) return 'Tutorial';
                    if (title.includes('review') || title.includes('analysis')) return 'Review';
                    if (title.includes('news') || title.includes('update')) return 'News';
                }
                return 'Blog';
            case 'WILDCARD':
                if (content.title) {
                    const title = content.title.toLowerCase();
                    if (title.includes('app') || title.includes('software') || title.includes('tool')) return 'Software';
                    if (title.includes('startup') || title.includes('company') || title.includes('business')) return 'Business';
                    if (title.includes('design') || title.includes('ui') || title.includes('ux')) return 'Design';
                }
                return 'General';
            default:
                return 'Unknown';
        }
    } catch (error) {
        console.warn('[Content] Day 7 SURGICAL category detection error:', error);
        return 'Unknown';
    }
}

// Day 7 SURGICAL image extraction with enhanced filtering
function extractDay7SurgicalImages(errorLog) {
    try {
        const images = [];
        const imageSelectors = [
            'img[src]:not([src*="icon"]):not([src*="logo"]):not([src*="pixel"]):not([src*="tracking"])',
            '.product-image img',
            '.article-image img',
            '.content img',
            '.recipe-image img',
            'main img',
            'article img'
        ];

        const imageElements = document.querySelectorAll(imageSelectors.join(', '));
        Array.from(imageElements).forEach(img => {
            const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
            if (src && src.startsWith('http') && src.length > 10) {
                // Day 7 SURGICAL filtering - exclude ads, tracking pixels, icons
                if (!src.includes('doubleclick') && !src.includes('googleadservices') && 
                    !src.includes('facebook.com/tr') && !src.includes('1x1') &&
                    img.width > 50 && img.height > 50) {
                    if (!images.includes(src) && images.length < 10) {
                        images.push(src);
                    }
                }
            }
        });

        return images;
    } catch (error) {
        console.error('[Content] Day 7 SURGICAL image extraction error:', error);
        return [];
    }
}

// Day 7 SURGICAL links extraction with enhanced relevance filtering
function extractDay7SurgicalLinks(errorLog) {
    try {
        const links = [];
        const linkElements = document.querySelectorAll('a[href]:not([href*="javascript"]):not([href^="#"]):not([href*="mailto"]):not([href*="tel"])');

        Array.from(linkElements).forEach(link => {
            const href = link.href;
            const text = link.textContent?.trim();
            if (href && text && text.length > 3 && href.length > 10) {
                // Day 7 SURGICAL filtering - exclude ads, social media, tracking
                if (!href.includes('facebook.com') && !href.includes('twitter.com') && 
                    !href.includes('instagram.com') && !href.includes('linkedin.com') &&
                    !href.includes('doubleclick') && !href.includes('googleadservices') &&
                    !text.toLowerCase().includes('advertisement') &&
                    text.length < 100) {
                    if (!links.includes(href) && links.length < 15) {
                        links.push(href);
                    }
                }
            }
        });

        return links;
    } catch (error) {
        console.error('[Content] Day 7 SURGICAL link extraction error:', error);
        return [];
    }
}

// Day 7 Enhanced message listener for OPERATION SURGICAL DATA++
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[Content] Day 7 SURGICAL message received:', request.action);
    
    try {
        if (request.action === "extractPageData") {
            console.log('[Content] Day 7 SURGICAL extraction request received - deploying cross-domain infiltration...');
            const result = startDay7SurgicalExtraction();
            sendResponse(result);
            return true;
        }
    } catch (error) {
        console.error('[Content] Day 7 SURGICAL message listener error:', error);
        sendResponse({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
            day7Version: 'surgical-baseline',
            operationName: 'SURGICAL DATA++'
        });
    }
    
    return false;
});

console.log('[Content] Day 7 OPERATION SURGICAL DATA++ Content Script loaded - Cross-domain infiltration ready');

}
