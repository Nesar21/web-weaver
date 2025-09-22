# Web Weaver v0.3
A professional Chrome extension that transforms any webpage into a structured JSON API with enhanced data extraction and export capabilities.

## Features
- **Enhanced Data Extraction**: Extracts headings, links, images, tables, forms, and metadata
- **Table Parsing**: Captures table headers and first 3 rows of data
- **Form Analysis**: Identifies input types, labels, and form structure
- **Export Functionality**: Download data as CSV or JSON files
- **Copy to Clipboard**: One-click JSON copying with visual feedback
- **Real-time Search**: Filter extracted data instantly
- **Professional UI**: Clean interface with loading states and tooltips

## Tested Websites
✅ **News Sites**: Extracts article headlines, metadata, and content structure  
✅ **E-commerce**: Captures product tables, forms, and image data  
✅ **Documentation**: Parses technical content, code examples, and navigation

## Setup
1. Clone repository
2. Load unpacked extension in Chrome (enable Developer Mode)
3. Click extension icon on any webpage
4. Use Extract → Export → Copy workflow

## Usage
1. **Extract**: Click "Extract Page Data" to analyze current webpage
2. **Export**: Download structured data as CSV or JSON
3. **Copy**: Copy JSON data to clipboard for API integration
4. **Search**: Filter results using the search box
5. **Reset**: Clear data and start fresh

## Technical Implementation
- `popup.html`: Professional UI with tooltips and loading states
- `background.js`: Service worker managing content script injection
- `content.js`: Advanced DOM parsing with table/form extraction
- `popup.js`: State management and export handling

## API Structure
```json
{
  "title": "Page Title",
  "url": "https://example.com",
  "content": {
    "headings": [{"level": 1, "text": "Main Title"}],
    "links": [{"text": "Link Text", "url": "https://...", "external": false}],
    "images": [{"alt": "Alt text", "src": "https://...", "width": 1200}]
  },
  "data": {
    "tables": [{"headers": ["Col1", "Col2"], "rows": [["Data1", "Data2"]]}],
    "forms": [{"inputs": [{"type": "email", "label": "Email Address"}]}]
  },
  "metadata": {"description": "Page description", "keywords": "..."}
}