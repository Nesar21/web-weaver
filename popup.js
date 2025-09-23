// Day 4 Enhanced Popup Script with Loading States & Error Handling
console.log('Web Weaver Lightning Popup v1.0 Day 4 - Initializing...');

// UI State Management
class UIState {
  constructor() {
    this.isExtracting = false;
    this.currentData = null;
    this.apiKeyConfigured = false;
    this.init();
  }
  
  async init() {
    await this.checkApiKey();
    this.bindEvents();
    this.updateUI();
  }
  
  async checkApiKey() {
    try {
      const response = await chrome.runtime.sendMessage({ action: "getApiKey" });
      this.apiKeyConfigured = response.hasKey;
      console.log('[Popup] API key status:', this.apiKeyConfigured ? 'configured' : 'missing');
    } catch (error) {
      console.error('[Popup] Failed to check API key:', error);
      this.apiKeyConfigured = false;
    }
  }
  
  bindEvents() {
    // Main extraction button
    const extractBtn = document.getElementById('extractBtn');
    if (extractBtn) {
      extractBtn.addEventListener('click', () => this.handleExtraction());
    }
    
    // API key configuration
    const configBtn = document.getElementById('configBtn');
    if (configBtn) {
      configBtn.addEventListener('click', () => this.showApiKeyConfig());
    }
    
    // Save API key
    const saveKeyBtn = document.getElementById('saveApiKey');
    if (saveKeyBtn) {
      saveKeyBtn.addEventListener('click', () => this.saveApiKey());
    }
    
    // Export buttons
    const exportJsonBtn = document.getElementById('exportJSON');
    const exportCsvBtn = document.getElementById('exportCSV');
    const copyBtn = document.getElementById('copyBtn');
    
    if (exportJsonBtn) exportJsonBtn.addEventListener('click', () => this.exportData('json'));
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', () => this.exportData('csv'));
    if (copyBtn) copyBtn.addEventListener('click', () => this.copyData());
  }
  
  updateUI() {
    const extractBtn = document.getElementById('extractBtn');
    const status = document.getElementById('status');
    const loading = document.getElementById('loading');
    const configSection = document.getElementById('configSection');
    
    if (extractBtn) {
      extractBtn.disabled = this.isExtracting;
      extractBtn.textContent = this.isExtracting ? 'Extracting...' : 
        (this.apiKeyConfigured ? 'Extract with AI' : 'Extract Basic');
    }
    
    if (loading) {
      loading.style.display = this.isExtracting ? 'block' : 'none';
    }
    
    if (status && !this.isExtracting) {
      if (this.apiKeyConfigured) {
        status.textContent = '🚀 Ready: Click "Extract with AI" to start!';
        status.className = 'status default';
      } else {
        status.textContent = '⚠️ Configure Gemini API key for AI extraction';
        status.className = 'status warning';
      }
    }
    
    if (configSection) {
      configSection.style.display = this.apiKeyConfigured ? 'none' : 'block';
    }
    
    // Update export buttons
    this.updateExportButtons();
  }
  
  updateExportButtons() {
    const exportJsonBtn = document.getElementById('exportJSON');
    const exportCsvBtn = document.getElementById('exportCSV');
    const copyBtn = document.getElementById('copyBtn');
    
    const hasData = !!this.currentData;
    
    if (exportJsonBtn) exportJsonBtn.disabled = !hasData || this.isExtracting;
    if (exportCsvBtn) exportCsvBtn.disabled = !hasData || this.isExtracting;
    if (copyBtn) copyBtn.disabled = !hasData || this.isExtracting;
  }
  
  showApiKeyConfig() {
    const configSection = document.getElementById('configSection');
    if (configSection) {
      configSection.style.display = configSection.style.display === 'none' ? 'block' : 'none';
    }
  }
  
  async saveApiKey() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const error = document.getElementById('error');
    
    if (!apiKeyInput || !apiKeyInput.value.trim()) {
      this.showError('Please enter a valid Gemini API key');
      return;
    }
    
    const apiKey = apiKeyInput.value.trim();
    
    // ✅ FIXED: Basic validation for Gemini API key
    if (!apiKey.startsWith('AIza')) {
      this.showError('Gemini API keys should start with "AIza"');
      return;
    }
    
    if (apiKey.length < 20) {
      this.showError('Invalid Gemini API key format. Key appears too short.');
      return;
    }
    
    try {
      this.showStatus('Saving Gemini API key...', 'loading');
      
      const response = await chrome.runtime.sendMessage({
        action: "setApiKey",
        apiKey: apiKey
      });
      
      if (response.success) {
        this.apiKeyConfigured = true;
        this.showStatus('Gemini API key saved successfully!', 'success');
        
        // Clear input and hide config
        apiKeyInput.value = '';
        setTimeout(() => {
          const configSection = document.getElementById('configSection');
          if (configSection) configSection.style.display = 'none';
          this.updateUI();
        }, 1000);
      } else {
        this.showError('Failed to save API key');
      }
    } catch (error) {
      console.error('[Popup] API key save error:', error);
      this.showError('Failed to save API key: ' + error.message);
    }
  }
  
  async handleExtraction() {
    if (this.isExtracting) return;
    
    this.isExtracting = true;
    this.updateUI();
    this.showStatus('Starting AI extraction...', 'loading');
    
    try {
      console.log('[Popup] Starting extraction...');
      
      const response = await chrome.runtime.sendMessage({
        action: "extractData"
      });
      
      if (response.success) {
        this.currentData = response.data;
        this.displayResults(response.data);
        
        const aiStatus = response.data.enhancedWithAI ? 
          '🎉 AI-enhanced extraction complete!' : 
          'Basic extraction complete (configure Gemini API key for AI features)';
          
        this.showStatus(aiStatus, 'success');
        
        console.log('[Popup] Extraction successful:', {
          enhanced: response.data.enhancedWithAI,
          method: response.data.method,
          contentLength: response.data.content?.length || 0
        });
      } else {
        this.showError('Extraction failed: ' + (response.error || 'Unknown error'));
        console.error('[Popup] Extraction failed:', response.error);
      }
    } catch (error) {
      console.error('[Popup] Extraction error:', error);
      this.showError('Extraction failed: ' + error.message);
    } finally {
      this.isExtracting = false;
      this.updateUI();
    }
  }
  
  displayResults(data) {
    const output = document.getElementById('output');
    if (!output) return;
    
    let html = '<div class="results-container">';
    
    // Basic page info
    html += '<div class="result-section">';
    html += '<h3>📄 Page Information</h3>';
    html += `<div class="info-item"><strong>Title:</strong> ${data.title || 'N/A'}</div>`;
    html += `<div class="info-item"><strong>URL:</strong> ${data.url || 'N/A'}</div>`;
    html += `<div class="info-item"><strong>Method:</strong> ${data.method || 'N/A'}</div>`;
    html += `<div class="info-item"><strong>Content Length:</strong> ${data.content?.length || 0} chars</div>`;
    html += '</div>';
    
    // AI-enhanced results
    if (data.ai && data.enhancedWithAI) {
      html += '<div class="result-section ai-results">';
      html += '<h3>🤖 AI-Enhanced Results (FREE Gemini 2.0 Flash)</h3>';
      
      Object.entries(data.ai).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          let displayValue = value;
          
          if (Array.isArray(value)) {
            displayValue = value.length > 0 ? value.join(', ') : 'None found';
          } else if (typeof value === 'string' && value.length > 100) {
            displayValue = value.substring(0, 100) + '...';
          }
          
          html += `<div class="ai-item">`;
          html += `<strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> `;
          html += `<span>${displayValue}</span>`;
          html += `</div>`;
        }
      });
      html += '</div>';
    }
    
    // Error info
    if (data.aiError) {
      html += '<div class="result-section error-section">';
      html += '<h3>⚠️ AI Processing</h3>';
      html += `<div class="error-info">AI enhancement failed: ${data.aiError}</div>`;
      html += '<div style="margin-top: 8px; font-size: 11px;">Configure your FREE Gemini API key to enable AI features.</div>';
      html += '</div>';
    }
    
    html += '</div>';
    
    output.innerHTML = html;
    output.style.display = 'block';
  }
  
  showStatus(message, type = 'default') {
    const status = document.getElementById('status');
    const loading = document.getElementById('loading');
    
    if (status) {
      status.textContent = message;
      status.className = `status ${type}`;
    }
    
    if (loading) {
      loading.style.display = type === 'loading' ? 'block' : 'none';
    }
  }
  
  showError(message) {
    const error = document.getElementById('error');
    
    console.error('[Popup] Error:', message);
    
    if (error) {
      error.textContent = message;
      error.style.display = 'block';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        error.style.display = 'none';
      }, 5000);
    }
  }
  
  async exportData(format) {
    if (!this.currentData) return;
    
    try {
      let content, filename, mimeType;
      
      if (format === 'json') {
        content = JSON.stringify(this.currentData, null, 2);
        filename = `webweaver_${Date.now()}.json`;
        mimeType = 'application/json';
      } else if (format === 'csv') {
        content = this.convertToCSV(this.currentData);
        filename = `webweaver_${Date.now()}.csv`;
        mimeType = 'text/csv';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      await chrome.downloads.download({
        url: url,
        filename: filename
      });
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.showStatus(`${format.toUpperCase()} export started!`, 'success');
      
    } catch (error) {
      console.error('[Popup] Export error:', error);
      this.showError('Export failed: ' + error.message);
    }
  }
  
  convertToCSV(data) {
    const rows = [];
    rows.push(['Field', 'Value', 'Source']);
    
    // Basic data
    rows.push(['Title', data.title || '', 'Page']);
    rows.push(['URL', data.url || '', 'Page']);
    rows.push(['Domain', data.domain || '', 'Page']);
    rows.push(['Method', data.method || '', 'Extraction']);
    
    // AI data
    if (data.ai) {
      Object.entries(data.ai).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          let csvValue = Array.isArray(value) ? value.join('; ') : String(value);
          csvValue = csvValue.replace(/"/g, '""'); // Escape quotes
          rows.push([key, `"${csvValue}"`, 'Gemini AI']);
        }
      });
    }
    
    return rows.map(row => row.join(',')).join('\n');
  }
  
  async copyData() {
    if (!this.currentData) return;
    
    try {
      const jsonString = JSON.stringify(this.currentData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      this.showStatus('Data copied to clipboard!', 'success');
    } catch (error) {
      console.error('[Popup] Copy error:', error);
      this.showError('Copy failed: ' + error.message);
    }
  }
}

// Initialize UI when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new UIState());
} else {
  new UIState();
}
