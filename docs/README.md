# ⚡ Web Weaver Lightning

**Version 3.4.0 - Multi/Single Item Edition**

Turn any webpage into structured data (JSON/CSV) with AI-powered extraction. Extract LinkedIn posts, Medium articles, Amazon products, and more—all with a single click.

---

## 🎯 What Does It Do?

Web Weaver Lightning is a Chrome extension that extracts content from websites and converts it to clean, structured data.

**Two Extraction Modes:**
- **📦 Extract All Items** - Get everything loaded on the page (feeds, product lists, search results)
- **📄 Extract Main Article** - Capture just the main content (articles, product details, single posts)

**Works On:**
- LinkedIn (posts, profiles, jobs)
- Medium (articles, stories)
- Amazon (products, reviews)
- News sites (articles, headlines)
- Blogs, Wikipedia, and almost any website

***

## ✨ Key Features

### Two Extraction Types
- **Extract All Items** - Grabs all visible content on the page
- **Extract Main Article** - Focuses on the primary content only

### Five Accuracy Modes
- **Offline** - Fast, DOM-only extraction (no API calls)
- **Min** - Quick with minimal AI (~75% accuracy)
- **Balanced** - Best cost/accuracy ratio (~85% accuracy) ⭐ Recommended
- **Max** - Maximum accuracy (~95% accuracy)
- **Smart Auto** - AI picks the best mode automatically

### Data Export
- Copy to clipboard (one click)
- Download as JSON
- Download as CSV

### Extraction History
- View your last 20 extractions
- See confidence scores
- Track what mode was used

***

## 🚀 Quick Start

### 1. Install Extension

**Download Method:**
1. Download the extension folder
2. Open Chrome and go to `chrome://extensions/`
3. Turn on "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the extension folder

### 2. Get API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

### 3. Configure Extension

1. Click the Web Weaver icon in Chrome toolbar
2. Paste your API key in the text field
3. Click "Save"
4. You're ready to extract!

***

## 📖 How To Use

### Extract LinkedIn Feed

**Scenario:** You want to save your LinkedIn feed posts

1. Open LinkedIn feed (`linkedin.com/feed/`)
2. Scroll to load posts (5-10 visible)
3. Click Web Weaver icon
4. Select **"📦 Extract All Items"**
5. Choose mode: **Balanced** (recommended)
6. Click **"Extract Data"**
7. Wait 3-5 seconds
8. Copy JSON or download CSV

**Result:** You get all visible posts with:
- Author name and title
- Post text (full content)
- Likes, comments, reposts
- Timestamp
- Hashtags

***

### Extract Medium Article

**Scenario:** You want the full text of a Medium article

1. Open Medium article
2. Scroll to article beginning
3. Click Web Weaver icon
4. Select **"📄 Extract Main Article"**
5. Choose mode: **Balanced**
6. Click **"Extract Data"**
7. Wait 2-4 seconds

**Result:** You get just the article with:
- Title and subtitle
- Author information
- Full article text
- Publication date
- Read time
- Tags

**No recommendations or sidebar content!**

***

### Extract Amazon Products

**Scenario:** You're comparing laptops on Amazon

#### For Product List:
1. Search "laptop" on Amazon
2. Click Web Weaver icon
3. Select **"📦 Extract All Items"**
4. Choose mode: **Min** (faster for lists)
5. Click **"Extract Data"**

**Result:** All visible products with prices, ratings, titles

#### For Single Product:
1. Open specific product page
2. Click Web Weaver icon
3. Select **"📄 Extract Main Article"**
4. Choose mode: **Balanced**
5. Click **"Extract Data"**

**Result:** Just that product's details (no "also bought" items)

***

## 🎨 Understanding Extraction Types

### 📦 Extract All Items

**Use When:**
- Browsing feeds (LinkedIn, Twitter)
- Viewing search results (Amazon, Google)
- Looking at product lists
- Scanning news headlines
- Reviewing job postings

**How It Works:**
- Analyzes the entire page
- Finds repeated patterns
- Extracts all matching items
- Returns an array of items

**Pagination Tip:**
Want more items? Scroll down or click "Next Page" to load more, then click "Extract Again"

**Example Output:**
```json
[
  { "title": "Post 1", "author": "John", "likes": "42" },
  { "title": "Post 2", "author": "Jane", "likes": "108" },
  { "title": "Post 3", "author": "Bob", "likes": "73" }
]
```

***

### 📄 Extract Main Article

**Use When:**
- Reading a single article
- Viewing one product
- Looking at a specific post
- Want to avoid recommendations/ads

**How It Works:**
- Captures viewport screenshot
- AI analyzes visible content
- Extracts only main content
- Ignores sidebars and recommendations

**Example Output:**
```json
{
  "title": "How to Build Chrome Extensions",
  "author": "Jane Developer",
  "content": "[Full 2000+ word article text here...]",
  "date": "2025-10-16",
  "read_time": "8 min"
}
```

***

## ⚙️ Choosing The Right Mode

### When To Use Each Mode

**🟢 Offline Mode**
- ✅ Quick scans
- ✅ High volume extraction (100+ items)
- ✅ Well-structured sites
- ❌ Don't use for complex layouts
- **Speed:** <1 second, **Accuracy:** ~60%

**🌿 Min Mode**
- ✅ Casual browsing
- ✅ Simple sites (Wikipedia, Amazon)
- ✅ When speed matters
- ❌ Don't use for messy layouts
- **Speed:** 2-3 seconds, **Accuracy:** ~75%

**⚖️ Balanced Mode** ⭐ Recommended
- ✅ General-purpose extraction
- ✅ Most websites
- ✅ Best cost/accuracy ratio
- ✅ Safe default choice
- **Speed:** 3-5 seconds, **Accuracy:** ~85%

**🚀 Max Mode**
- ✅ Research and analysis
- ✅ When accuracy is critical
- ✅ Complex, multi-section pages
- ❌ Don't use for quick scans
- **Speed:** 5-8 seconds, **Accuracy:** ~95%

**🤖 Smart Auto Mode**
- ✅ First-time site visits
- ✅ Mixed browsing sessions
- ✅ When unsure of complexity
- ✅ Automated workflows
- **Speed:** Variable, **Accuracy:** Optimized

***

## 📊 Understanding Results

### Confidence Score

Every extraction gets a confidence score (0-100%):

- **🟢 High (80-100%)** - Excellent quality, trust the data
- **🔵 Good (60-79%)** - Acceptable, minor issues possible
- **🟡 Medium (40-59%)** - Review carefully
- **🔴 Low (<40%)** - Poor quality, try different mode

### Extraction Metadata

Each extraction shows:
- **Mode Used** - Which mode processed the extraction
- **Extraction Type** - All Items or Main Article
- **Duration** - Time taken
- **Classification** - MULTI_ITEM or SINGLE_ITEM
- **API Calls** - Number of AI calls made (for tracking quota)

***

## 🔧 Troubleshooting

### "API Key Missing" Error

**Problem:** Extension can't find your Gemini API key

**Solution:**
1. Click extension icon
2. Paste your API key
3. Click "Save"
4. Try extraction again

***

### Low Confidence Scores (<60%)

**Problem:** Extraction quality is poor

**Solutions:**
1. Try **Max Mode** (higher accuracy)
2. Switch to **"Extract Main Article"** (screenshot-based)
3. Check if page loaded completely
4. Scroll to content you want

***

### "Too Many Requests (429)" Error

**Problem:** Hit Gemini API rate limit

**Solutions:**
1. Wait 60 seconds
2. Use **Offline** or **Min** mode (fewer API calls)
3. Check API quota at [Google AI Studio](https://aistudio.google.com/app/quotas)

***

### Extraction Taking Too Long

**Problem:** Extraction stuck or slow

**Solutions:**
1. Use faster mode (**Min** instead of **Max**)
2. Reduce complexity (use "Main Article" mode)
3. Check internet connection
4. Reload page and try again

***

### Missing Data Fields

**Problem:** Some fields are null or missing

**Why:** Content might not be visible or page structure changed

**Solutions:**
1. Scroll to make content visible
2. Try **"Extract Main Article"** mode
3. Use **Max Mode** for better accuracy
4. Wait for page to fully load

***

## 💡 Pro Tips

### Tip 1: Natural Pagination
Don't force-load everything! Extract what's loaded, scroll for more, extract again.

**Example (LinkedIn Feed):**
```
1. Page loads → 5 posts visible
2. Extract → Get 5 posts
3. Scroll down → 5 more load
4. Extract again → Get next 5
5. Repeat as needed
```

### Tip 2: Choose Right Type
- **Feed/List** → Extract All Items
- **Single Item** → Extract Main Article
- **Not Sure** → Try Extract All Items first

### Tip 3: Mode Selection
- **Speed priority** → Min or Offline
- **Accuracy priority** → Max
- **Balanced need** → Balanced or Smart Auto
- **First time on site** → Smart Auto

### Tip 4: Export Strategy
- **Quick review** → Copy to clipboard
- **Data analysis** → Download CSV
- **Keep full data** → Download JSON

***

## 📁 What Gets Extracted?

### LinkedIn Posts
- Author (name, title, company)
- Post text (full content)
- Engagement (likes, comments, reposts)
- Timestamp
- Hashtags
- Media indicators

### Medium Articles
- Title and subtitle
- Author information
- Full article text
- Publication date
- Read time
- Tags/topics
- Publication name

### Amazon Products
- Product title
- Price (current, original)
- Rating (stars, review count)
- Availability
- Specifications
- Bullet points
- ASIN

### News Articles
- Headline
- Author
- Publication date
- Full article text
- Categories/tags
- Source

***

## 🛠️ Technical Details

### How It Works

**Multi-Item Extraction:**
1. Analyzes page DOM structure
2. Identifies repeated patterns
3. Extracts data from each instance
4. AI verifies and enhances data
5. Returns structured JSON array

**Single-Item Extraction:**
1. Captures viewport screenshot
2. Sends to Gemini Vision AI
3. AI reads visual content
4. Extracts text and metadata
5. Returns single JSON object

### AI Classification

Extension automatically detects if page has:
- **MULTI_ITEM** - Feed, list, grid, search results
- **SINGLE_ITEM** - Article, product page, profile

Uses 3-tier system:
1. **DOM Analysis** - Fast pattern detection (50-100ms)
2. **Visual Pattern** - Layout recognition (500ms-2s)
3. **AI Semantic** - Deep understanding (3-5s)

### Data Privacy

- API key stored locally (chrome.storage.local)
- No data sent to third-party servers (except Gemini API)
- Extraction history stored locally
- No tracking or analytics collection

***

## ⚠️ Limitations

### API Quota
- Free tier: 60 requests/minute
- Paid tier: Higher limits available
- Check usage at [Google AI Studio](https://aistudio.google.com/app/quotas)

### Site Compatibility
- Works on 95%+ of websites
- Dynamic JavaScript sites supported
- Some sites may block extraction (rare)

### Accuracy
- Offline: ~60% (DOM-only)
- Min: ~75%
- Balanced: ~85%
- Max: ~95%
- Perfect 100% not guaranteed

### Performance
- Extraction time: 2-40 seconds (depends on mode and page complexity)
- Large pages (100+ items) may be slow
- Network speed affects duration

***

## 📞 Support & Feedback

### Questions or Issues?

**Report Bugs:**
- Open issue on GitHub
- Include: Site URL, mode used, error message

**Feature Requests:**
- Suggest improvements
- Describe use case

**Contact:**
- Email: nesaramingad821@gmail.com
- GitHub: [Nesar21/web-weaver](https://github.com/Nesar21/web-weaver)

***

## 📝 Version History

### v3.4.0 (October 16, 2025) - Current
- Added two extraction types (All Items / Main Article)
- Improved UI with radio button selection
- Added pagination guidance tips
- Enhanced result display with extraction type badge

### v3.3.0 (October 15, 2025)
- Added 3-tier AI classification system
- Improved Medium article accuracy (+12%)
- Universal site support (no hardcoding)

### v3.2.0 (October 14, 2025)
- Universal classification (works on any site)
- Domain learning (+8% adjustment)
- Better error handling

### v3.0.0 (October 10, 2025)
- Introduced 5 extraction modes
- Smart Auto mode
- Extraction history
- Mode configuration

***

## 📜 License

MIT License - Free to use, modify, and distribute

***

## 🙏 Credits

- **AI Engine:** Google Gemini API
- **Developer:** Nesar Amingad (CSE Undergrad, 4th Year)
- **Contact:** nesaramingad821@gmail.com
- **Version:** 3.4.0
- **Date:** October 16, 2025

***

**Built with 💪 by Nesar**  
**Extract smarter, not harder! ⚡**
