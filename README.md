# Web Weaver
   A Chrome extension that transforms any webpage into a structured JSON API.

   ## Setup
   1. Clone repo
   2. Run `npm install`
   3. Load unpacked in Chrome (enable Developer Mode)
   
   ## Architecture
   - `popup.html`: User interface
   - `background.js`: Service worker, manages injection
   - `content.js`: DOM extraction logic