# ⚡ Web Weaver Lightning

**Version 4.0.0 - Chrome AI + Security Edition**

Turn any webpage into structured data (JSON/CSV) with AI-powered extraction. Extract LinkedIn posts, Medium articles, Amazon products, and more—with privacy-first Chrome AI or advanced Cloud API.

---

## 🎯 What Does It Do?

Web Weaver Lightning is a Chrome extension that extracts content from websites and converts it to clean, structured data.

**Two AI Options:**
- **🔵 Chrome Built-in AI** - Fast, private, zero-cost (local processing)
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

### 🆕 Chrome Built-in AI (Day 21)
- **Zero Cost** - No API key required, completely free
- **Privacy-First** - All processing happens locally on your device
- **Offline Capable** - Works without internet (after initial page load)
- **Lightning Fast** - <100ms response time vs 500-2000ms cloud
- **No Rate Limits** - Extract as much as you want
- **Fallback Support** - Auto-switches to Cloud API if unavailable

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

### Data Export
- Copy to clipboard (one click)
- Download as JSON
- Download as CSV

### Extraction History
- View your last 50 extractions
- See confidence scores
- Track AI provider used (Chrome AI or Cloud API)
- View duplicates removed count

---

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
3. Select extraction type (All Items or Main Article)
4. Pick mode (Balanced recommended)
5. Click "Extract Data"

---
## 📖 How To Use

### Extract LinkedIn Feed

**Scenario:** You want to save your LinkedIn feed posts

1. Open LinkedIn feed (`linkedin.com/feed/`)
2. Scroll to load posts (5–10 visible)
3. Click Web Weaver icon
4. **AI Provider:** Chrome AI (fastest) or Cloud API
5. **Type:** **📦 Extract All Items**
6. **Mode:** Balanced
7. Click **"Extract Data"**
8. Wait 2–3 seconds (Chrome AI) or 4–6 seconds (Cloud)
9. Copy JSON or download CSV

**Want More Posts?**
- Scroll down to load next batch
- Click "Extract Again"
- Only new posts will be added (deduplication active)
- Duplicates removed count shown in results

**Result:** All visible posts with:
- Author name and title
- Post text (full content)
- Likes, comments, reposts
- Timestamp
- Hashtags

---

### Extract Medium Article

**Scenario:** You want the full text of a Medium article

1. Open Medium article
2. Scroll to article beginning
3. Click Web Weaver icon
4. **AI Provider:** Cloud API (required for screenshot mode)
5. **Type:** **📄 Extract Main Article**
6. **Mode:** Balanced
7. Click **"Extract Data"**
8. Wait 3–5 seconds

**Result:** Just the article with:
- Title and subtitle
- Author information
- Full article text
- Publication date
- Read time
- Tags

---

### Extract Amazon Products

**Scenario:** You're comparing laptops on Amazon

#### For Product List:
1. Search "laptop" on Amazon
2. Click Web Weaver icon
3. **AI Provider:** Chrome AI (faster for lists)
4. **Type:** **📦 Extract All Items**
5. **Mode:** Min
6. Click **"Extract Data"**

**Result:** All visible products with prices, ratings, titles

#### For Single Product:
1. Open specific product page
2. Click Web Weaver icon
3. **AI Provider:** Cloud API (for screenshot)
4. **Type:** **📄 Extract Main Article**
5. **Mode:** Balanced
6. Click **"Extract Data"**

**Result:** Just that product's details (no "also bought" items)

---

## 🎨 Understanding AI Providers

### 🔵 Chrome Built-in AI

**Best For:**
- ✅ Privacy-sensitive data  
- ✅ High-volume extraction (100+ pages)  
- ✅ Offline work (after page loads)  
- ✅ Zero cost operations  
- ✅ Fast batch processing  

**Limitations:**
- ❌ Requires Chrome 128+ (Dev/Canary)  
- ❌ No vision/screenshot support yet  
- ❌ Smaller context window (~2K tokens)  
- ❌ Lower accuracy vs Cloud API (~80% vs 95%)  

**When To Use:**
- Extracting feeds (LinkedIn, Twitter)
- Quick scans of simple pages
- Privacy-critical data
- High-frequency extraction

---

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
   - Don’t scrape copyrighted/personal data without permission

3. **No Warranty**
   - Extension provided “as-is”  
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

---

### Rate Limit Warnings

**Proactive Alerts:**
- **25 RPM Warning** – “High request rate detected. Slow down to avoid 429 errors.”
- **900K TPD Warning** – “Approaching daily token limit (900K/1M). Switch to Chrome AI.”
- **3× 429 Errors** – “Multiple rate limit errors. Auto-switching to Chrome AI.”

**When You See These:**
1. Wait 60–120 seconds  
2. Switch to Chrome AI (zero limits)  
3. Use Offline or Min mode (fewer calls)  
4. Check quota at Google AI Studio  

---

## ⚙️ Choosing The Right Mode

### When To Use Each Mode

**🟢 Offline Mode**
- ✅ Quick scans  
- ✅ High volume extraction (100+ items)  
- ✅ Well-structured sites  
- ❌ Don’t use for complex layouts  
- **Speed:** <1 second, **Accuracy:** ~60%  
- **AI Provider:** None (DOM only)

**🌿 Min Mode**
- ✅ Casual browsing  
- ✅ Simple sites (Wikipedia, Amazon)  
- ✅ When speed matters  
- ❌ Don’t use for messy layouts  
- **Speed:** 2–3 seconds, **Accuracy:** ~75%  
- **AI Provider:** Chrome AI or Cloud API

**⚖️ Balanced Mode** ⭐ Recommended
- ✅ General-purpose extraction  
- ✅ Most websites  
- ✅ Best cost/accuracy ratio  
- ✅ Safe default choice  
- **Speed:** 3–5 seconds, **Accuracy:** ~85%  
- **AI Provider:** Chrome AI or Cloud API

**🚀 Max Mode**
- ✅ Research and analysis  
- ✅ When accuracy is critical  
- ✅ Complex, multi-section pages  
- ❌ Don’t use for quick scans  
- **Speed:** 5–8 seconds, **Accuracy:** ~95%  
- **AI Provider:** Chrome AI or Cloud API

**🤖 Smart Auto Mode**
- ✅ First-time site visits  
- ✅ Mixed browsing sessions  
- ✅ When unsure of complexity  
- ✅ Automated workflows  
- **Speed:** Variable, **Accuracy:** Optimized  
- **AI Provider:** Chrome AI or Cloud API

---

## 📊 Understanding Results

### Confidence Score

Every extraction gets a confidence score (0–100%):

- **🟢 High (90–100%)** – Excellent quality, trust the data fully  
- **🔵 Good (75–89%)** – Very good, minor verification suggested  
- **🟡 Medium (60–74%)** – Acceptable, review carefully  
- **🟠 Low (40–59%)** – Poor quality, verify all data  
- **🔴 Very Low (<40%)** – Unreliable, try different mode

### Extraction Metadata

Each extraction shows:
- **AI Provider** – Chrome AI (🔵) or Cloud API (☁️)
- **Confidence** – Score with visual tier indicator
- **Mode Used** – Which mode processed the extraction
- **Extraction Type** – All Items or Main Article
- **Duration** – Time taken (seconds)
- **Duplicates Removed** – Count of duplicate items filtered
- **Classification** – MULTI_ITEM or SINGLE_ITEM
### Deduplication Info

**Example:**
Extracted 8 new items (3 duplicates removed)

Means:
- 11 items found on page
- 3 were already extracted before
- 8 new items added to results

**Reset Deduplication:**
- Close and reopen tab
- Clear cache (🗑️ button in extension)
- Session auto-clears after 1 hour

---

## 🔧 Troubleshooting

### "API Key Missing" Error

**Problem:** Extension can't find your Gemini API key  
**Solution:**
1. Switch to Chrome AI (no key needed)  
2. OR add Cloud API key:
   - Click extension icon  
   - Paste your API key  
   - Click "Save"  
   - Validation status shows ✓ Valid

---

### "Chrome AI Unavailable" Notice

**Problem:** Chrome Built-in AI not detected  
**Why:** Requires Chrome 128+ with AI features enabled  

**Solutions:**
1. **Auto-fallback active** – Extension uses Cloud API automatically  
2. **Upgrade Chrome:**
   - Download Chrome Dev/Canary: [chrome.dev](https://www.google.com/chrome/dev/)  
   - Check version: `chrome://version`  
   - Must be 128 or higher  
3. **Enable flags** (if using Chrome 128+):  
   - Go to `chrome://flags`  
   - Search "AI"  
   - Enable relevant flags  
   - Restart Chrome  

---

### Low Confidence Scores (<60%)

**Problem:** Extraction quality is poor  
**Solutions:**
1. Switch to **Cloud API** (higher accuracy)  
2. Try **Max Mode** (triple verification)  
3. Use **"Extract Main Article"** (screenshot-based)  
4. Check if page loaded completely  
5. Scroll to content you want  
6. Try different extraction type  

---

### "Rate Limit Exceeded (429)" Error

**Problem:** Hit Gemini API rate limit (15 RPM or 1M TPD)  
**Solutions (Automatic):**
- ⚡ **Auto-fallback** – After 3 consecutive 429s, switches to Chrome AI  
- 📊 **Proactive Warning** – Alerts at 25 RPM before hitting limit  

**Solutions (Manual):**
1. ✅ Switch to Chrome AI (no limits, zero cost)  
2. Wait 60–120 seconds for reset  
3. Use **Offline** or **Min** mode  
4. Check API quota: [Google AI Studio](https://aistudio.google.com/app/quotas)  
5. Upgrade to paid tier  

---

### Extraction Taking Too Long

**Problem:** Extraction stuck or slow  
**Solutions:**
1. Switch to Chrome AI (10× faster)  
2. Use faster mode (**Min**)  
3. Use **"Extract All Items"** (DOM-based)  
4. Check internet connection  
5. Reload page and try again  

---

### Missing Data Fields

**Problem:** Some fields missing  
**Why:** Content not visible or layout changed  
**Solutions:**
1. Scroll to make content visible  
2. Try **Main Article** mode  
3. Use **Max Mode**  
4. Wait for page to fully load  
5. Switch to **Cloud API**

---

### Duplicate Items in Results

**Problem:** Same items appear multiple times  
**Why:** Deduplication not working or session cleared  
**Solutions:**
1. Check "Duplicates Removed" count  
2. Don’t clear cache between runs  
3. Keep same tab open  
4. Manually deduplicate in CSV/JSON if needed  

---

## 💡 Pro Tips

### Tip 1: Choose Right AI Provider
| Priority | Use |
|-----------|-----|
| ⚡ Speed | Chrome AI |
| 🎯 Accuracy | Cloud API |
| 🔒 Privacy | Chrome AI |
| 💰 Cost | Chrome AI (free) |
| 🖼️ Screenshot Mode | Cloud API |

### Tip 2: Natural Pagination
Extract batch → Scroll → Extract again → Dedup handles duplicates automatically.

### Tip 3: Rate Limit Management
- Watch warnings  
- Switch to Chrome AI early  
- Use **Min** mode for bulk  
- Monitor quotas  
- Auto-fallback handles 429s  

### Tip 4: Privacy Best Practices
- Use Chrome AI for sensitive data  
- Cloud API for high-accuracy research  
- Respect site TOS  
- Clear history often  

### Tip 5: Export Strategy
- Copy → quick use  
- CSV → data analysis  
- JSON → raw storage  
- Clear cache after export  

---

## 📁 What Gets Extracted?

### LinkedIn Posts
- Author (name, title, company)
- Post text (full)
- Engagement stats
- Timestamp
- Hashtags
- Media indicators

### Medium Articles
- Title, subtitle
- Author
- Full text
- Publication date
- Read time
- Tags/topics
- Publication name

### Amazon Products
- Title, price
- Rating
- Availability
- Specs
- Bullet points
- ASIN

### News Articles
- Headline
- Author
- Date
- Full text
- Categories
- Source

---

## 🛠️ Technical Details

### How It Works

**Chrome AI Mode:**
1. Sends DOM content to local model  
2. Processes on-device  
3. No latency  
4. JSON in <100ms  
5. No data leaves your computer  

**Cloud API Mode:**
1. Sends content to Gemini API  
2. Processes in cloud  
3. Returns high-accuracy JSON  
4. Network latency: 500–2000ms  

**Multi-Item Extraction:**
- Detects repeated DOM patterns  
- Extracts structured data  
- Filters duplicates  
- Returns JSON array  

**Single-Item Extraction:**
- Captures screenshot  
- Sends to Gemini Vision AI  
- Extracts text + metadata  
- Returns JSON object  

---

### Deduplication Algorithm

**Composite Key:**
`key = title.toLowerCase() + "|" + url.toLowerCase() + "|" + id.toLowerCase()`

**Matching Logic:**
- Exact match → duplicate removed  
- 85%+ similarity → possible duplicate (kept)  
- <85% → unique  

**Session Management:**
- Per-tab Map<tabId, Set<keys>>  
- Auto-clears after 1 hour  
- Persists across extractions  

---

### Data Privacy

**Chrome AI Mode:**
- ✅ All local  
- ✅ Offline capable  
- ✅ No network requests  

**Cloud API Mode:**
- ⚠️ Data sent to Gemini  
- ⚠️ Subject to Google privacy policy  
- ✅ Key stored locally  

**Both:**
- ✅ Local-only history  
- ✅ No telemetry or tracking  
- ✅ Open source & auditable  

---

## ⚠️ Limitations

**Chrome AI:**
- Chrome 128+ only  
- No screenshot support  
- Smaller context window (2K tokens)  
- ~80% accuracy  

**Cloud API:**
- 15 RPM, 1M TPD limits  
- ~$0.01/extraction  
- Needs API key + internet  

**General:**
- Works on 95%+ sites  
- JS-heavy pages may need scroll  
- Some protected sites blocked  
- Accuracy depends on layout  

---

## 🔐 Security Considerations

### Never Ship API Keys
Use `.gitignore`:
.env
.env.local
*.key
secrets/

**Runtime check:**
```js
if (apiKey && apiKey.includes('AIza')) {
  throw new Error('API KEY DETECTED! Remove before commit!');
}
```

**Scoped Permissions**
activeTab only by default  
Requests site access dynamically  
User approves per-site  

**API Key Expiration**
Daily validation  
Warn 7 days before expiry  
Block 1 day before  
Renewal link provided  

📞 **Support & Feedback**

**Report Bugs:**  
github.com/Nesar21/web-weaver  
Include site URL, AI provider, mode, error, screenshot  

**Security Issues:**  
Email: nesaramingad821@gmail.com  

**Developer:**  
Nesar Amingad (CSE, 4th Year, JSSSTU)  
GitHub: Nesar21/web-weaver  
LinkedIn: Nesar Amingad  

📝 **Version History**

v4.0.0 (Oct 21, 2025)  
🆕 Chrome AI mode  
🆕 Dual AI provider toggle  
🆕 Security hardening & TOS acceptance  
🆕 Rate limit warnings  
🆕 Auto-fallback  
🆕 Deduplication  
🆕 Enhanced error recovery  
🆕 Privacy controls  

v3.4.0 (Oct 16, 2025)  
Two extraction types  
Better UI  
Pagination tips  
Extraction badges  

v3.3.0 (Oct 15, 2025)  
3-tier classification  
+12% Medium accuracy  
Universal site support  

v3.2.0 (Oct 14, 2025)  
Domain learning  
Error handling  

v3.0.0 (Oct 10, 2025)  
5 modes  
Smart Auto  
Extraction history  

📜 **License**  
MIT License – Free to use, modify, and distribute  

**Permissions:**  
✅ Commercial use  
✅ Modification  
✅ Distribution  
✅ Private use  

**Conditions:**  
📄 Include license notice  
⚠️ No warranty  

🙏 **Credits**  
AI Engine: Google Gemini API + Chrome AI  
Developer: Nesar Amingad  
Institution: JSS Science and Tech University  
Contact: nesaramingad821@gmail.com  
Version: 4.0.0  
Date: Oct 21, 2025  

**Special Thanks:**  
Google AI Studio  
Chrome Team  
Open Source Community  

🚧 **Roadmap**

v4.1 (Coming Soon):  
Multi-language  
Batch extraction  
Templates  
Advanced filters  

v5.0 (Future):  
Firefox support  
Cross-browser architecture  
Mobile companion  
Team collaboration  

**Built with 💪 by Nesar**  
**Extract smarter, not harder! ⚡**