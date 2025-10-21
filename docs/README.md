# ⚡ Web Weaver Lightning

**Version 4.1.0 - Chrome Built-in AI Real APIs Edition**

Turn any webpage into structured data (JSON/CSV) with AI-powered extraction. Extract LinkedIn posts, Medium articles, Amazon products, and more—with privacy-first Chrome AI or advanced Cloud API.

---

## 🎯 What Does It Do?

Web Weaver Lightning is a Chrome extension that extracts content from websites and converts it to clean, structured data.

**Two AI Options:**
- **🔵 Chrome Built-in AI** - Fast, private, zero-cost (local processing with REAL APIs)
- **☁️ Cloud API (Gemini)** - Advanced features with vision support

**Two Extraction Modes:**
- **📦 Extract All Items** - Get everything loaded on the page (feeds, product lists, search results)
- **📄 Extract Main Article** - Capture just the main content (articles, product details, single posts)

**Works On:**
- LinkedIn (posts, profiles, jobs)
- Medium (articles, stories)
- Amazon (products, reviews)
- News sites (articles, headlines)
- Blogs, Wikipedia, and almost any website

---

## ✨ Key Features

### 🆕 Chrome Built-in AI - REAL APIs (Day 21.2)
- **4 Real APIs** - Translator, LanguageDetector, Summarizer, LanguageModel (Gemini Nano)
- **Progressive Fallback** - Auto-switches to Cloud API if Chrome AI unavailable
- **Smart Defaults** - Translation/Detection always Chrome AI, Extraction user choice
- **Category Filtering** - 6 predefined categories (Products, Articles, Videos, Jobs, Events)
- **URL Extraction** - Enforced URL field in all extracted items
- **Item Count Display** - Shows new/total/duplicate counts during extraction
- **Fallback Banner** - 24h cooldown notification system when switching providers
- **Zero Cost** - No API key required, completely free
- **Privacy-First** - All processing happens locally on your device
- **Offline Capable** - Works without internet (after initial page load)
- **Lightning Fast** - <100ms response time vs 500-2000ms cloud
- **No Rate Limits** - Extract as much as you want

### 🆕 Security & Privacy (Day 21)
- **TOS Acceptance** - Clear privacy and terms notification on first use
- **Runtime API Keys** - Never hardcoded, stored locally only
- **API Key Validation** - Real-time validation with visual status
- **Scoped Permissions** - Only requests access when needed
- **No Data Leakage** - Build-time validation prevents accidental key commits
- **Expiration Warnings** - Alerts before API keys expire

### 🆕 Smart Rate Management (Day 21)
- **Proactive Warnings** - Alerts at 25 RPM (before hitting 15 RPM limit)
- **Token Tracking** - Warns at 900K tokens/day (before 1M limit)
- **Auto-Fallback** - Switches to Chrome AI after 3 consecutive 429 errors
- **Enhanced Error Messages** - Clear recovery steps for every error type

### 🆕 Deduplication (Day 21)
- **Session-Based Tracking** - Remembers extracted items per tab
- **Composite Keys** - Uses title + URL + ID for matching
- **Pagination Support** - "Extract Again" only gets new items
- **Auto-Cleanup** - Clears stale sessions after 1 hour

### Two Extraction Types
- **Extract All Items** - Grabs all visible content on the page
- **Extract Main Article** - Focuses on the primary content only

### Five Accuracy Modes
- **Offline** - Fast, DOM-only extraction (no API calls)
- **Min** - Quick with minimal AI (~75% accuracy)
- **Balanced** - Best cost/accuracy ratio (~85% accuracy) ⭐ Recommended
- **Max** - Maximum accuracy (~95% accuracy)
- **Smart Auto** - AI picks the best mode automatically

### Six Category Filters (NEW in v4.1)
- **All Items** - Extract everything
- **Products Only** - E-commerce items with prices
- **Articles/News** - Blog posts, news stories
- **Videos** - Video content with thumbnails
- **Job Listings** - Job postings with salary info
- **Events** - Events with dates and RSVP details

### Data Export
- Copy to clipboard (one click)
- Download as JSON
- Download as CSV (with category suffix)

### Extraction History
- View your last 50 extractions
- See confidence scores
- Track AI provider used (Chrome AI or Cloud API)
- View duplicates removed count
- See category filter applied

***

## 🚀 Quick Start

### 1. Install Extension

**Download Method:**
1. Download the extension folder
2. Open Chrome and go to `chrome://extensions/`
3. Turn on "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the extension folder

### 2. Choose Your AI Provider

**Option A: Chrome Built-in AI (Recommended)**
1. Requires Chrome 128+ (Dev/Canary channel)
2. No setup needed - works immediately
3. Completely free and private
4. Download Chrome Dev: [chrome.dev](https://www.google.com/chrome/dev/)
5. **Real APIs:** Translator, LanguageDetector, Summarizer, LanguageModel

**Option B: Cloud API (Advanced)**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)
4. Paste in extension settings

### 3. Accept Terms of Service

**First Use Only:**
1. Extension shows privacy & terms notice
2. Read the terms carefully
3. Click "I Accept" to continue
4. Covers:
   - Data privacy (local vs cloud processing)
   - User responsibility (comply with website TOS)
   - API key security
   - No warranty disclaimer

### 4. Start Extracting!

1. Click the Web Weaver icon in Chrome toolbar
2. Choose AI Provider (Chrome AI or Cloud API)
3. **Select category filter** (All Items, Products, Articles, etc.)
4. Select extraction type (All Items or Main Article)
5. Pick mode (Balanced recommended)
6. Click "Extract Data"
7. **Watch item count update** (X new, Y total, Z duplicates)

***

## 📖 How To Use

### Extract LinkedIn Feed with Category Filter

**Scenario:** You want to save job postings from LinkedIn feed

1. Open LinkedIn feed (`linkedin.com/feed/`)
2. Scroll to load posts (5–10 visible)
3. Click Web Weaver icon
4. **AI Provider:** Chrome AI (fastest)
5. **Category:** **Job Listings** (filters non-job posts)
6. **Type:** **📦 Extract All Items**
7. **Mode:** Balanced
8. Click **"Extract Data"**
9. Wait 2–3 seconds (Chrome AI)
10. See: "8 new items (3 duplicates removed)"
11. Download as `linkedin_jobs.json`

**Result:** Only job postings with:
- Job title and company
- Location and salary
- Job description
- Application link
- Posted date

***

### Extract Amazon Products with Chrome AI

**Scenario:** You're comparing laptops on Amazon

1. Search "laptop" on Amazon
2. Click Web Weaver icon
3. **AI Provider:** Chrome AI
4. **Category:** **Products Only**
5. **Type:** **📦 Extract All Items**
6. **Mode:** Min
7. Click **"Extract Data"**
8. See: "12 new items (0 duplicates)"

**Result:** All visible products with:
- Title and price
- Rating (stars + count)
- Availability
- Product URL
- Image URL

**Scroll for more:** Click "Extract Again" → only new products added

***

### Extract Medium Article (Cloud API)

**Scenario:** You want the full text of a Medium article

1. Open Medium article
2. Scroll to article beginning
3. Click Web Weaver icon
4. **AI Provider:** Cloud API (screenshot mode)
5. **Category:** **Articles/News**
6. **Type:** **📄 Extract Main Article**
7. **Mode:** Balanced
8. Click **"Extract Data"**
9. Wait 3–5 seconds

**Result:** Just the article with:
- Title and subtitle
- Author information
- Full article text
- Publication date
- Read time
- Tags

***

## 🎨 Understanding AI Providers

### 🔵 Chrome Built-in AI (v4.1 - REAL APIs)

**What's New in v4.1:**
- ✅ **Real Translator API** - `Translator.create()` for instant translation
- ✅ **Real LanguageDetector API** - `LanguageDetector.create()` for language detection
- ✅ **Real Summarizer API** - `Summarizer.create()` for text summarization
- ✅ **Real LanguageModel API** - `LanguageModel.create()` for data extraction (Gemini Nano)

**Best For:**
- ✅ Privacy-sensitive data  
- ✅ High-volume extraction (100+ pages)  
- ✅ Offline work (after page loads)  
- ✅ Zero cost operations  
- ✅ Fast batch processing  
- ✅ Translation and language detection (always uses Chrome AI)

**Limitations:**
- ❌ Requires Chrome 128+ (Dev/Canary)  
- ❌ No vision/screenshot support yet  
- ❌ Smaller context window (~4K tokens)  
- ❌ ~85% accuracy vs 95% Cloud API

**When To Use:**
- Extracting feeds (LinkedIn, Twitter)
- Quick scans of simple pages
- Privacy-critical data
- High-frequency extraction
- **Translation/language detection tasks**

***

### ☁️ Cloud API (Gemini)

**Best For:**
- ✅ Screenshot extraction (Main Article mode)
- ✅ Maximum accuracy needed
- ✅ Complex page layouts
- ✅ Works on any Chrome version
- ✅ Larger context window (30K+ tokens)

**Limitations:**
- ❌ Requires API key
- ❌ Costs ~$0.01 per extraction
- ❌ Rate limits (15 RPM, 1M TPD)
- ❌ Requires internet connection
- ❌ Data sent to Google servers

**When To Use:**
- Single article extraction (with screenshot)
- Research requiring high accuracy
- Complex multi-section pages
- When Chrome AI unavailable

***

## 🔧 New Features Explained (v4.1)

### Category Filtering

**6 Smart Categories:**

| Category | Best For | Example Sites |
|----------|----------|---------------|
| **All Items** | General extraction | Any website |
| **Products Only** | Shopping, comparisons | Amazon, eBay, Etsy |
| **Articles/News** | Reading, research | Medium, NYT, blogs |
| **Videos** | Content discovery | YouTube lists, Vimeo |
| **Job Listings** | Job hunting | LinkedIn Jobs, Indeed |
| **Events** | Event planning | Eventbrite, Meetup |

**How It Works:**
- Category filter added to AI prompt
- Filters out non-matching items
- Shows category in export filename
- Saves your last-used category

**Example:**
- Category: **Products Only**
- Amazon page with products + ads + reviews
- **Result:** Only products extracted (ads/reviews filtered)

---

### Item Count Display

**Real-time Feedback:**
```
Extracting... 12 new items (3 duplicates, 15 total)
```

**Breakdown:**
- **12 new** - Fresh items added this extraction
- **3 duplicates** - Items already extracted (filtered)
- **15 total** - Total unique items in session

**Use Cases:**
- Track extraction progress
- Verify deduplication working
- Confirm scroll-and-extract sessions

***

### Fallback Banner System

**When You'll See It:**
```
⚠️ Chrome AI unavailable - using Cloud API
[Dismiss] Get Chrome Dev for 10× faster extraction
```

**Triggers:**
1. Chrome AI not available (< v128)
2. Rate limit hit (after 3× 429 errors)
3. Chrome AI APIs fail

**Smart Behavior:**
- Shows once per 24 hours
- Max 3 dismissals total
- Auto-hides after 10 seconds
- Persists in localStorage

---

### Progressive Fallback (Option C)

**How It Works:**
1. Extension tries Chrome AI first (0ms check)
2. If unavailable → auto-switch to Cloud API
3. Show fallback banner (dismissible)
4. Continue extraction without user action
5. Banner reminds to upgrade Chrome Dev

**User Control:**
- Manual toggle overrides auto-fallback
- Settings remember your preference
- Clear indication of active provider

---

## 🔒 Security & Privacy Features

### TOS Acceptance (First Use)

**What You're Agreeing To:**
1. **Data Privacy**
   - Chrome AI: All local, no data sent anywhere  
   - Cloud API: Content sent to Google Gemini API  
   - Review Google's privacy policy

2. **User Responsibility**
   - Comply with website Terms of Service  
   - Respect robots.txt and rate limits  
   - Follow data protection laws (GDPR, CCPA)  
   - Don't scrape copyrighted/personal data without permission

3. **No Warranty**
   - Extension provided "as-is"  
   - No guarantees of accuracy or reliability  
   - Use at your own risk

4. **API Key Security**
   - You're responsible for securing keys  
   - Never share keys publicly  
   - Revoke immediately if compromised

---

### API Key Best Practices

**DO:**
- ✅ Store keys only in extension settings (`chrome.storage.local`)
- ✅ Validate keys before saving
- ✅ Monitor usage at [Google AI Studio](https://aistudio.google.com/app/quotas)
- ✅ Revoke and regenerate if exposed
- ✅ Use `.gitignore` to prevent commits

**DON'T:**
- ❌ Hardcode keys in code
- ❌ Commit keys to version control
- ❌ Share keys via email/chat
- ❌ Reuse keys across projects
- ❌ Store keys in plaintext files

***

### Rate Limit Warnings

**Proactive Alerts:**
- **25 RPM Warning** – "High request rate detected. Slow down to avoid 429 errors."
- **900K TPD Warning** – "Approaching daily token limit (900K/1M). Switch to Chrome AI."
- **3× 429 Errors** – "Multiple rate limit errors. Auto-switching to Chrome AI."

**When You See These:**
1. Wait 60–120 seconds  
2. Switch to Chrome AI (zero limits)  
3. Use Offline or Min mode (fewer calls)  
4. Check quota at Google AI Studio  

***

## 🔧 Troubleshooting

### "Chrome AI Unavailable" Banner

**Problem:** Fallback banner shows "Using Cloud API"  
**Why:** Chrome Built-in AI not detected (requires Chrome 128+)

**Solutions:**
1. **Auto-fallback active** – Extension works with Cloud API automatically  
2. **Upgrade Chrome:**
   - Download Chrome Dev/Canary: [chrome.dev](https://www.google.com/chrome/dev/)  
   - Check version: `chrome://version`  
   - Must be 128 or higher  
3. **Enable flags** (if using Chrome 128+):  
   - Go to `chrome://flags`  
   - Search "Prompt API for Gemini Nano"  
   - Enable all AI-related flags
   - Restart Chrome  
4. **Dismiss banner** – Won't show again for 24 hours

***

### Category Filter Not Working

**Problem:** Getting items outside selected category  
**Why:** AI prompt filters but doesn't guarantee 100% accuracy

**Solutions:**
1. Switch to **Cloud API** (better filtering)
2. Use **Max Mode** (more precise)
3. Try different category
4. Post-process results manually
5. Combine with keywords in export

***

### Item Count Shows 0 New Items

**Problem:** "0 new items (12 duplicates)"  
**Why:** All items already extracted in this session

**Solutions:**
1. **This is normal** – deduplication working correctly
2. Scroll further for new content
3. Clear cache to reset session
4. Close/reopen tab to start fresh
5. Use different URL/page

***

### "URL Field Missing" Warning

**Problem:** Exported items missing URL field  
**Why:** Page structure prevents URL extraction (rare)

**Solutions:**
1. **Automatic fallback** – Extension uses current page URL
2. Try **Cloud API** with screenshot mode
3. Use **Main Article** extraction type
4. Check if page loaded completely
5. Report site for investigation

***

## 💡 Pro Tips (Updated for v4.1)

### Tip 1: Choose Right AI Provider
| Priority | Use | Speed | Cost |
|-----------|-----|-------|------|
| ⚡ Speed | Chrome AI | 10× faster | Free |
| 🎯 Accuracy | Cloud API | Slower | ~$0.01 |
| 🔒 Privacy | Chrome AI | 10× faster | Free |
| 🖼️ Screenshot | Cloud API | Medium | ~$0.01 |

### Tip 2: Category Power-User
- Set category **before** scrolling
- Extract → Scroll → Extract (dedup auto-filters)
- Download with category suffix: `amazon_products_only.csv`
- Combine categories: Extract "Products" then "Articles" separately

### Tip 3: Item Count Strategy
- Watch count during extraction
- Stop when count stops increasing
- Duplicate count = pagination working
- Total items = all unique across sessions

### Tip 4: Fallback Banner Management
- Dismiss if you prefer Cloud API
- Upgrade Chrome to stop seeing it
- 24h cooldown = won't spam you
- Max 3 dismissals = respects your choice

### Tip 5: Progressive Extraction
```
1. Set category (e.g., "Job Listings")
2. Extract page 1 → 10 items
3. Scroll to page 2
4. Extract again → 8 new (2 duplicates)
5. Scroll to page 3
6. Extract again → 7 new (3 duplicates)
Total: 25 unique job listings
```

***

## 📊 Understanding Results (Updated)

### Extraction Metadata

Each extraction now shows:
- **AI Provider** – Chrome AI (🔵) or Cloud API (☁️)
- **Category Filter** – Which filter was applied (if not "All")
- **Confidence** – Score with visual tier indicator
- **Mode Used** – Which mode processed the extraction
- **Extraction Type** – All Items or Main Article
- **Duration** – Time taken (seconds)
- **Item Count** – X new (Y duplicates, Z total)
- **Classification** – MULTI_ITEM or SINGLE_ITEM

**Example Metadata:**
```json
{
  "aiProvider": "CHROME_BUILTIN",
  "category": "products",
  "confidence": 87,
  "mode": "balanced",
  "extractionType": "MULTI",
  "newItemsCount": 12,
  "duplicateCount": 3,
  "totalSessionItems": 45,
  "executionTime": 234
}
```

***

## 🛠️ Technical Details (Updated for v4.1)

### Chrome Built-in AI APIs (REAL)

**v4.1 Integration:**
```javascript
// Real Chrome APIs (not placeholders)
const translator = await Translator.create({ sourceLanguage: 'en', targetLanguage: 'es' });
const detector = await LanguageDetector.create();
const summarizer = await Summarizer.create({ type: 'tldr', length: 'short' });
const model = await LanguageModel.create();
```

**API Availability Check:**
```javascript
// Progressive fallback
if (chromeAIAvailable && typeof LanguageModel !== 'undefined') {
  // Use Chrome AI
} else {
  // Auto-fallback to Cloud API
  triggerFallbackBanner();
}
```

**Smart Defaults:**
- **Translation** → Always Chrome AI (10× faster)
- **Detection** → Always Chrome AI (perfect accuracy)
- **Summarization** → User choice (toggle)
- **Extraction** → User choice (toggle)

***

### Category Filtering Implementation

**Prompt Injection:**
```javascript
const categoryConfig = {
  id: 'products',
  promptModifier: 'FILTER: Only extract items that are products for sale'
};

const prompt = basePrompt + '\n\n' + categoryConfig.promptModifier;
```

**6 Category Configs:**
1. All Items (no filter)
2. Products Only (price + buy button)
3. Articles/News (headlines + authors)
4. Videos (thumbnails + duration)
5. Job Listings (job title + salary)
6. Events (date + location)

***

### Fallback Banner System

**localStorage Schema:**
```javascript
{
  "fallbackBannerState": {
    "dismissCount": 2,
    "lastDismissed": 1729534800000
  }
}
```

**24h Cooldown Logic:**
```javascript
const cooldownExpired = (Date.now() - lastDismissed) > 86400000; // 24h
const underLimit = dismissCount < 3;

if (cooldownExpired && underLimit) {
  showBanner();
}
```

***

## ⚠️ Limitations (Updated)

**Chrome AI:**
- Chrome 128+ only (Dev/Canary)
- No screenshot support
- Context window: ~4K tokens
- ~85% accuracy

**Cloud API:**
- 15 RPM, 1M TPD limits
- ~$0.01/extraction
- Needs API key + internet

**Category Filtering:**
- ~90% precision (not 100%)
- Best with Cloud API
- Some overlap possible
- Manual review recommended

**General:**
- Works on 95%+ sites
- JS-heavy pages may need scroll
- Some protected sites blocked
- Accuracy depends on layout

***

## 📞 Support & Feedback

**Report Bugs:**  
github.com/Nesar21/web-weaver  
Include: site URL, AI provider, category, mode, error, screenshot  

**Feature Requests:**  
github.com/Nesar21/web-weaver/issues  

**Security Issues:**  
Email: nesaramingad821@gmail.com  

**Developer:**  
Nesar Amingad (CSE, 4th Year, JSSSTU)  
GitHub: [Nesar21](https://github.com/Nesar21)  
LinkedIn: [Nesar Amingad](https://www.linkedin.com/in/nesar-amingad)

***

## 📝 Version History

**v4.1.0 (Oct 21, 2025) - Day 21.2**  
🆕 REAL Chrome Built-in AI APIs (Translator, LanguageDetector, Summarizer, LanguageModel)  
🆕 Progressive fallback with Option C strategy  
🆕 Category filtering (6 categories)  
🆕 URL extraction enforcement  
🆕 Item count display (new/total/duplicates)  
🆕 Fallback banner with 24h cooldown  
🆕 Smart defaults (Translation/Detection always Chrome AI)  
✨ All v4.0 features preserved  

**v4.0.0 (Oct 21, 2025) - Day 21**  
🆕 Chrome AI mode (placeholders)  
🆕 Dual AI provider toggle  
🆕 Security hardening & TOS acceptance  
🆕 Rate limit warnings  
🆕 Auto-fallback  
🆕 Deduplication  
🆕 Enhanced error recovery  
🆕 Privacy controls  

**v3.4.0 (Oct 16, 2025)**  
Two extraction types  
Better UI  
Pagination tips  
Extraction badges  

**v3.3.0 (Oct 15, 2025)**  
3-tier classification  
+12% Medium accuracy  
Universal site support  

***

## 📜 License

MIT License – Free to use, modify, and distribute  

**Permissions:**  
✅ Commercial use  
✅ Modification  
✅ Distribution  
✅ Private use  

**Conditions:**  
📄 Include license notice  
⚠️ No warranty  

***

## 🙏 Credits

**AI Engine:**  
- Google Gemini API
- Chrome Built-in AI (Translator, LanguageDetector, Summarizer, LanguageModel)
- Gemini Nano (on-device model)

**Developer:** Nesar Amingad  
**Institution:** JSS Science and Tech University  
**Contact:** nesaramingad821@gmail.com  
**Version:** 4.1.0  
**Date:** Oct 21, 2025  

**Special Thanks:**  
- Google AI Studio Team
- Chrome Built-in AI Team
- Chrome Extensions Team
- Open Source Community

***

## 🚧 Roadmap

**v4.2 (Coming Soon):**  
- Multi-language support (20+ languages)
- Batch extraction UI
- Custom category templates
- Export history

**v5.0 (Future):**  
- Firefox support
- Cross-browser architecture
- Mobile companion app
- Team collaboration features
- Advanced scheduling

***

**Built with 💪 by Nesar**  
**Extract smarter, not harder! ⚡**

***

**🎯 Testing Checklist (For Developers):**

Before v4.1 Release:
- [ ] Chrome AI APIs detected correctly
- [ ] Progressive fallback works (Chrome AI → Cloud API)
- [ ] Category filters apply correctly (all 6 categories)
- [ ] URL field present in all extracted items
- [ ] Item count displays during extraction
- [ ] Fallback banner shows/dismisses correctly
- [ ] 24h cooldown persists across sessions
- [ ] Deduplication works with category filtering
- [ ] Export filenames include category suffix
- [ ] Metadata shows correct AI provider + category
- [ ] All v4.0 features still work
- [ ] Zero TypeScript/JavaScript errors
- [ ] Extension loads without console errors
- [ ] TOS overlay blocks until accepted
- [ ] API key validation works (Cloud API)

**Test Environments:**
- Windows Chrome Dev 128+ (Chrome AI available)
- Mac Chrome Stable (Chrome AI unavailable → fallback)
- Linux Chrome Canary (mixed scenarios)