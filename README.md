# Web Weaver v0.2
A Chrome extension that transforms any webpage into a structured JSON API with enhanced data extraction.

## Features
- **Enhanced Data Extraction**: Extracts headings, links, images, metadata, and page structure
- **Export Functionality**: Download data as CSV or JSON files
- **Search & Filter**: Real-time search within extracted data
- **Professional UI**: Clean, responsive interface with loading states

## Setup
1. Clone repo
2. Load unpacked extension in Chrome (enable Developer Mode)
3. Test on any webpage

## API Verification Results
- Chrome AI Available: NO
- Implementation: Enhanced data extraction (Phase 2B)
- Features: All extraction and export features functional

## Architecture
- `popup.html`: User interface with export and search functionality
- `background.js`: Service worker, manages injection
- `content.js`: Enhanced DOM extraction logic
- `popup.js`: UI state management and export handling

## Usage
1. Click "Extract Page Data" to analyze current webpage
2. Use "Export CSV/JSON" to download structured data
3. Search extracted data using the search box
4. View detailed JSON output in the popup

## Known Limitations
- Requires active tab permissions
- Limited to 10 links and 5 images per extraction
- Search works on string fields only