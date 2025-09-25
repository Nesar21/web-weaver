// Day 6.5 Enhanced Popup Script - Championship UI
console.log('Web Weaver Lightning Popup v6.5 - ENHANCED Championship Ready');

// UI State Management
class EnhancedUIState {
  constructor() {
    this.isExtracting = false;
    this.isValidating = false;
    this.currentData = null;
    this.validationResults = null;
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
      this.apiKeyConfigured = response && response.hasKey;
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
    
    // ✅ DAY 6.5: ENHANCED AI Validation
    const validateBtn = document.getElementById('validateBtn');
    if (validateBtn) {
      validateBtn.addEventListener('click', () => this.handleValidation());
    }
    
    // API key configuration
    const saveApiBtn = document.getElementById('saveApiBtn');
    const apiKeyInput = document.getElementById('apiKeyInput');
    
    if (saveApiBtn && apiKeyInput) {
      saveApiBtn.addEventListener('click', () => this.saveApiKey());
      apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.saveApiKey();
      });
    }
    
    // Export buttons
    const exportJsonBtn = document.getElementById('exportJson');
    const exportCsvBtn = document.getElementById('exportCsv');
    const copyBtn = document.getElementById('copyResults');
    
    if (exportJsonBtn) exportJsonBtn.addEventListener('click', () => this.exportResults('json'));
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', () => this.exportResults('csv'));
    if (copyBtn) copyBtn.addEventListener('click', () => this.copyResults());
  }
  
  updateUI() {
    // Update API status
    const apiStatus = document.getElementById('apiStatus');
    if (apiStatus) {
      if (this.apiKeyConfigured) {
        apiStatus.innerHTML = '✅ Enhanced AI Ready';
        apiStatus.className = 'status-success';
      } else {
        apiStatus.innerHTML = '❌ Configure API Key';
        apiStatus.className = 'status-error';
      }
    }
    
    // Update extraction button
    const extractBtn = document.getElementById('extractBtn');
    if (extractBtn) {
      extractBtn.disabled = this.isExtracting;
      extractBtn.textContent = this.isExtracting ? 'Extracting...' : '🎯 Extract with Enhanced AI';
    }
    
    // Update validation button  
    const validateBtn = document.getElementById('validateBtn');
    if (validateBtn) {
      validateBtn.disabled = this.isValidating || !this.apiKeyConfigured;
      validateBtn.textContent = this.isValidating ? 'Testing...' : '🏆 Run Day 6.5 Validation';
    }
  }
  
  async saveApiKey() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      this.showStatus('Please enter your Gemini API key', 'error');
      return;
    }
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: "setApiKey",
        apiKey: apiKey
      });
      
      if (response && response.success) {
        this.apiKeyConfigured = true;
        apiKeyInput.value = '';
        this.showStatus('✅ Enhanced AI key configured!', 'success');
        this.updateUI();
      } else {
        this.showStatus('Failed to save API key', 'error');
      }
    } catch (error) {
      console.error('[Popup] API key save error:', error);
      this.showStatus('Error saving API key', 'error');
    }
  }
  
  async handleExtraction() {
    if (this.isExtracting) return;
    
    this.isExtracting = true;
    this.updateUI();
    this.showStatus('🎯 Starting Enhanced AI extraction...', 'info');
    
    try {
      const response = await chrome.runtime.sendMessage({ action: "extractData" });
      
      if (response && response.success) {
        this.currentData = response.data;
        this.displayExtractionResults(response.data);
        
        if (response.data.enhancedWithAI) {
          this.showStatus('✅ Enhanced AI extraction complete!', 'success');
        } else {
          this.showStatus('⚠️ Basic extraction only (configure API key for AI)', 'warning');
        }
      } else {
        this.showStatus(`❌ Extraction failed: ${response?.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('[Popup] Extraction error:', error);
      this.showStatus('❌ Extraction failed', 'error');
    } finally {
      this.isExtracting = false;
      this.updateUI();
    }
  }
  
  async handleValidation() {
    if (this.isValidating || !this.apiKeyConfigured) return;
    
    this.isValidating = true;
    this.updateUI();
    this.showStatus('🧪 Running Day 6.5 Enhanced validation...', 'info');
    
    try {
      const response = await chrome.runtime.sendMessage({ action: "runValidation" });
      
      if (response && response.success) {
        this.validationResults = response.results;
        this.displayValidationResults(response.results);
        
        const score = response.results.overallScore;
        if (score >= 70) {
          this.showStatus(`🏆 CHAMPIONSHIP! ${score}% accuracy achieved!`, 'success');
        } else if (score >= 60) {
          this.showStatus(`✅ Target met: ${score}% accuracy`, 'success');
        } else {
          this.showStatus(`⚠️ Need improvement: ${score}% accuracy`, 'warning');
        }
      } else {
        this.showStatus(`❌ Validation failed: ${response?.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('[Popup] Validation error:', error);
      this.showStatus('❌ Validation failed', 'error');
    } finally {
      this.isValidating = false;
      this.updateUI();
    }
  }
  
  displayExtractionResults(data) {
    const resultsDiv = document.getElementById('extractionResults');
    if (!resultsDiv) return;
    
    const ai = data.ai || {};
    const isEnhanced = data.enhancedWithAI;
    
    let html = `
      <div class="result-card">
        <h3>🎯 Day 6.5 Enhanced Extraction Results</h3>
        <div class="result-grid">
          <div class="result-item">
            <label>Title:</label>
            <span>${ai.title || data.title || 'Not extracted'}</span>
          </div>
          <div class="result-item">
            <label>Author:</label>
            <span>${ai.author || data.metadata?.author || 'Not found'}</span>
          </div>
          <div class="result-item">
            <label>Date:</label>
            <span>${ai.publication_date || data.metadata?.publication_date || 'Not found'}</span>
          </div>
          <div class="result-item">
            <label>Category:</label>
            <span>${ai.category || 'Not classified'}</span>
          </div>
          <div class="result-item">
            <label>Description:</label>
            <span>${ai.description || 'Not generated'}</span>
          </div>
          <div class="result-item">
            <label>Summary:</label>
            <span>${ai.main_content_summary || 'Not generated'}</span>
          </div>
          <div class="result-item">
            <label>Content:</label>
            <span>${data.content?.length || 0} characters extracted</span>
          </div>
          <div class="result-item">
            <label>Method:</label>
            <span>${data.method || 'Unknown'}</span>
          </div>
        </div>
        <div class="enhancement-status ${isEnhanced ? 'enhanced' : 'basic'}">
          ${isEnhanced ? '✅ Enhanced with Day 6.5 AI' : '⚠️ Basic extraction only'}
        </div>
      </div>
    `;
    
    resultsDiv.innerHTML = html;
  }
  
  displayValidationResults(results) {
    const resultsDiv = document.getElementById('validationResults');
    if (!resultsDiv) return;
    
    const passed = results.overallScore >= 60;
    const championship = results.overallScore >= 70;
    
    let html = `
      <div class="validation-card">
        <h3>🏆 Day 6.5 Enhanced Validation Results</h3>
        <div class="score-display ${championship ? 'championship' : passed ? 'passed' : 'failed'}">
          <div class="main-score">${results.overallScore}%</div>
          <div class="score-label">Overall Accuracy</div>
        </div>
        
        <div class="validation-summary">
          <div class="summary-item">
            <span class="label">Target:</span>
            <span class="value">≥60% ${passed ? '✅' : '❌'}</span>
          </div>
          <div class="summary-item">
            <span class="label">Championship:</span>
            <span class="value">≥70% ${championship ? '🏆' : '⏳'}</span>
          </div>
          <div class="summary-item">
            <span class="label">Sites Tested:</span>
            <span class="value">${results.sitesCount}</span>
          </div>
          <div class="summary-item">
            <span class="label">Passed:</span>
            <span class="value">${results.passedCount}</span>
          </div>
          <div class="summary-item">
            <span class="label">Duration:</span>
            <span class="value">${results.suiteDuration}ms</span>
          </div>
        </div>
        
        <div class="site-results">
          <h4>Site Breakdown:</h4>
          ${results.results.map(site => `
            <div class="site-result ${site.passed ? 'passed' : 'failed'}">
              <div class="site-name">${site.site}</div>
              <div class="site-score">${site.score?.toFixed(1) || 0}%</div>
              <div class="site-status">${site.passed ? '✅' : '❌'}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="methodology">
          <small>Method: ${results.methodology}</small>
        </div>
      </div>
    `;
    
    resultsDiv.innerHTML = html;
  }
  
  exportResults(format) {
    const data = this.validationResults || this.currentData;
    if (!data) {
      this.showStatus('No data to export', 'warning');
      return;
    }
    
    let content, filename, mimeType;
    
    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = `web-weaver-results-${Date.now()}.json`;
      mimeType = 'application/json';
    } else if (format === 'csv') {
      content = this.convertToCSV(data);
      filename = `web-weaver-results-${Date.now()}.csv`;
      mimeType = 'text/csv';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    this.showStatus(`✅ Exported as ${filename}`, 'success');
  }
  
  copyResults() {
    const data = this.validationResults || this.currentData;
    if (!data) {
      this.showStatus('No data to copy', 'warning');
      return;
    }
    
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      this.showStatus('📋 Data copied to clipboard!', 'success');
    }).catch(() => {
      this.showStatus('Failed to copy data', 'error');
    });
  }
  
  convertToCSV(data) {
    if (data.results) {
      // Validation results
      const headers = ['Site', 'Score', 'Passed', 'Method'];
      const rows = data.results.map(r => [
        r.site,
        r.score?.toFixed(1) || '0',
        r.passed ? 'Yes' : 'No',
        data.methodology
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } else {
      // Extraction results
      const ai = data.ai || {};
      const headers = ['Field', 'Value'];
      const rows = [
        ['Title', ai.title || data.title || ''],
        ['Author', ai.author || data.metadata?.author || ''],
        ['Date', ai.publication_date || data.metadata?.publication_date || ''],
        ['Category', ai.category || ''],
        ['Description', ai.description || ''],
        ['Content Length', data.content?.length || 0],
        ['Method', data.method || '']
      ];
      
      return [headers, ...rows].map(row => `"${row[0]}","${row[1]}"`).join('\n');
    }
  }
  
  showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('statusMessage');
    if (statusDiv) {
      statusDiv.textContent = message;
      statusDiv.className = `status status-${type}`;
      
      // Auto-hide after 5 seconds for non-error messages
      if (type !== 'error') {
        setTimeout(() => {
          statusDiv.textContent = '';
          statusDiv.className = 'status';
        }, 5000);
      }
    }
    
    console.log(`[Popup] ${message}`);
  }
}

// Initialize Enhanced UI
document.addEventListener('DOMContentLoaded', () => {
  window.enhancedUI = new EnhancedUIState();
});

console.log('Day 6.5 Enhanced Popup Script loaded - Championship ready');
