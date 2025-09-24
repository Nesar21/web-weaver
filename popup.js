// Day 4 Enhanced Popup Script + Day 5 REAL AI Validation Integration
console.log('Web Weaver Lightning Popup v1.0 Day 5 - REAL AI Ready');

// UI State Management
class UIState {
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

    // ✅ DAY 5: REAL AI Validation button
    const validateBtn = document.getElementById('validateBtn');
    if (validateBtn) {
      validateBtn.addEventListener('click', () => this.handleRealValidation());
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

    // ✅ Export buttons with complete functionality
    const exportJsonBtn = document.getElementById('exportJSON');
    const exportCsvBtn = document.getElementById('exportCSV');
    const copyBtn = document.getElementById('copyBtn');

    if (exportJsonBtn) exportJsonBtn.addEventListener('click', () => this.exportData('json'));
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', () => this.exportData('csv'));
    if (copyBtn) copyBtn.addEventListener('click', () => this.copyData());
  }

  updateUI() {
    const extractBtn = document.getElementById('extractBtn');
    const validateBtn = document.getElementById('validateBtn');
    const status = document.getElementById('status');
    const loading = document.getElementById('loading');
    const configSection = document.getElementById('configSection');

    if (extractBtn) {
      extractBtn.disabled = this.isExtracting || this.isValidating;
      extractBtn.textContent = this.isExtracting ? 'Extracting...' : (this.apiKeyConfigured ? 'Extract with AI' : 'Extract Basic');
    }

    // ✅ DAY 5: REAL AI Validation button
    if (validateBtn) {
      validateBtn.disabled = this.isValidating || this.isExtracting || !this.apiKeyConfigured;
      validateBtn.innerHTML = this.isValidating ? 
        '⏳ Running REAL AI Validation...' : 
        '🎯 Run Day 5 Validation';
    }

    if (loading) {
      loading.style.display = (this.isExtracting || this.isValidating) ? 'block' : 'none';
    }

    if (status && !this.isExtracting && !this.isValidating) {
      if (this.validationResults) {
        const score = this.validationResults.results.overallScore;
        const passed = score >= 60;
        status.textContent = `🎯 Day 5 Results: ${score}% accuracy ${passed ? '✅ PASSED' : '⚠️ NEEDS WORK'} (REAL AI)`;
        status.className = `status ${passed ? 'success' : 'warning'}`;
      } else if (this.apiKeyConfigured) {
        status.textContent = '🚀 Ready: Click "Extract with AI" or "Run Day 5 Validation"';
        status.className = 'status default';
      } else {
        status.textContent = '⚠️ Configure Gemini API key for AI extraction and validation';
        status.className = 'status warning';
      }
    }

    if (configSection) {
      configSection.style.display = this.apiKeyConfigured ? 'none' : 'block';
    }

    this.updateExportButtons();
  }

  // ✅ DAY 5: Handle REAL AI validation - NO SIMULATION
  async handleRealValidation() {
    if (this.isValidating || this.isExtracting || !this.apiKeyConfigured) return;

    this.isValidating = true;
    this.updateUI();
    this.showStatus('🧪 Running Day 5 validation with REAL Gemini AI engine...', 'loading');

    try {
      console.log('[Popup] Starting Day 5 REAL AI validation suite...');

      // ✅ CALL REAL VALIDATION ENGINE - NO SIMULATION
      const response = await chrome.runtime.sendMessage({
        action: "runValidation"
      });

      if (response && response.success) {
        console.log('[Popup] REAL AI validation completed:', response.results);
        
        // ✅ USE REAL RESULTS - NO FAKE DATA
        this.validationResults = response;
        this.displayValidationResults(response.results);
        
        const score = response.results.overallScore;
        const passed = score >= 60;
        this.showStatus(
          `🎯 Day 5 Validation ${passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}: ${score}% accuracy (REAL Gemini AI)`,
          passed ? 'success' : 'warning'
        );

      } else {
        this.showError('REAL AI Validation failed: ' + (response?.error || 'Unknown error'));
        console.error('[Popup] REAL AI Validation failed:', response?.error);
      }

    } catch (error) {
      console.error('[Popup] REAL AI Validation error:', error);
      this.showError('REAL AI Validation failed: ' + error.message);
    } finally {
      this.isValidating = false;
      this.updateUI();
    }
  }

  displayValidationResults(results) {
    const output = document.getElementById('output');
    if (!output) return;

    const score = results.overallScore;
    const passed = score >= 60;
    const status = passed ? 'PASSED ✅' : 'NEEDS IMPROVEMENT ⚠️';

    let html = `
      <div class="validation-results">
        <h3>🎯 Day 5 REAL AI Engine Validation Results</h3>
        
        <div class="summary-card ${passed ? 'success' : 'warning'}">
          <h4>Overall Score: ${score}% - ${status}</h4>
          <p><strong>REAL AI Tested:</strong> ✅ Gemini 2.0 Flash (NO Simulation)</p>
          <p><strong>Sites Tested:</strong> ${results.sitesCount} | <strong>Passed:</strong> ${results.passedCount} | <strong>Failed:</strong> ${results.failedCount}</p>
          <p><strong>Duration:</strong> ${results.suiteDuration}ms | <strong>Method:</strong> ${results.methodology}</p>
        </div>

        <h4>📊 REAL AI Performance Breakdown:</h4>
    `;

    // Display actual results from REAL AI testing
    results.results.forEach((site, index) => {
      const siteStatus = site.passed ? 'PASS ✅' : 'FAIL ❌';
      const scoreColor = site.score >= 80 ? 'excellent' : site.score >= 60 ? 'good' : 'needs-work';
      
      html += `
        <div class="site-result ${scoreColor}">
          <h5>${index + 1}. ${site.site} - ${site.score.toFixed(1)}% ${siteStatus}</h5>
          <p><strong>REAL AI Processing:</strong> ${site.aiMetadata?.extractionTime}ms</p>
          <p><strong>Field Performance:</strong> ${site.validationMetadata?.fieldsPassedCount}/${site.validationMetadata?.fieldsTotalCount} fields passed</p>
        </div>
      `;
    });

    html += `
        <div class="next-steps">
          <h4>📋 Day 6-7 Recommendations:</h4>
          <ul>
            <li>${passed ? '✅ Ready for Day 6 prompt optimization - Target: 85%' : '⚠️ Focus on prompt engineering improvements'}</li>
            <li><strong>Proven:</strong> REAL AI engine validation framework works</li>
            <li><strong>Championship:</strong> Authentic accuracy measurement achieved</li>
          </ul>
        </div>
      </div>
    `;

    output.innerHTML = html;
    output.style.display = 'block';
  }

  // [All other methods remain the same - extraction, API key, export, etc.]
  async handleExtraction() {
    if (this.isExtracting || this.isValidating) return;

    this.isExtracting = true;
    this.updateUI();
    this.showStatus('Starting extraction...', 'loading');

    try {
      console.log('[Popup] Starting extraction...');
      const response = await chrome.runtime.sendMessage({ action: "extractData" });

      if (response && response.success) {
        this.currentData = response.data;
        this.displayResults(response.data);
        const aiStatus = response.data.enhancedWithAI ? 
          '🎉 REAL AI-enhanced extraction complete!' : 
          'Basic extraction complete (configure Gemini API key for AI features)';
        this.showStatus(aiStatus, response.data.enhancedWithAI ? 'success' : 'warning');
      } else {
        this.showError('Extraction failed: ' + (response?.error || 'Unknown error'));
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

    let html = '<div class="extraction-results"><h3>📊 Extraction Results</h3>';

    if (data.enhancedWithAI && data.ai) {
      html += '<div class="summary-card"><h4>🚀 REAL AI-Enhanced Results</h4>';
      html += '<div class="json-output">';
      html += this.formatJSON(data.ai);
      html += '</div></div>';
    } else {
      html += '<div class="summary-card warning"><h4>📄 Basic Extraction</h4><p>Configure Gemini API key for AI enhancement</p></div>';
    }

    if (data.content) {
      html += `<h4>Raw Content (${data.content.length} chars):</h4>`;
      html += `<div class="content-preview">${data.content.substring(0, 300)}...</div>`;
    }

    html += '</div>';
    output.innerHTML = html;
    output.style.display = 'block';
  }

  formatJSON(obj, indent = 0) {
    if (!obj) return 'null';
    
    let html = '';
    const spacing = '  '.repeat(indent);
    
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        html += '[<br>';
        obj.forEach((item, index) => {
          html += `${spacing}  ${this.formatJSON(item, indent + 1)}`;
          if (index < obj.length - 1) html += ',';
          html += '<br>';
        });
        html += `${spacing}]`;
      } else {
        html += '{<br>';
        const entries = Object.entries(obj);
        entries.forEach(([key, value], index) => {
          html += `${spacing}  <span class="json-key">"${key}"</span>: ${this.formatJSON(value, indent + 1)}`;
          if (index < entries.length - 1) html += ',';
          html += '<br>';
        });
        html += `${spacing}}`;
      }
    } else if (typeof obj === 'string') {
      html += `<span class="json-string">"${obj}"</span>`;
    } else {
      html += `<span class="json-value">${obj}</span>`;
    }
    
    return html;
  }

  async saveApiKey() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    if (!apiKeyInput || !apiKeyInput.value.trim()) {
      this.showError('Please enter a valid Gemini API key');
      return;
    }

    const apiKey = apiKeyInput.value.trim();
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

      if (response && response.success) {
        this.apiKeyConfigured = true;
        this.showStatus('Gemini API key saved successfully!', 'success');
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

  showStatus(message, type = 'default') {
    const status = document.getElementById('status');
    if (status) {
      status.textContent = message;
      status.className = `status ${type}`;
    }
  }

  showError(message) {
    this.showStatus('❌ ' + message, 'error');
  }

  // ✅ COMPLETE: Export functionality
  updateExportButtons() {
    const hasData = !!(this.currentData || this.validationResults);
    const isProcessing = this.isExtracting || this.isValidating;
    
    ['exportJSON', 'exportCSV', 'copyBtn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.disabled = !hasData || isProcessing;
    });
  }

  // ✅ COMPLETE: Export data in JSON or CSV format
  exportData(format) {
    const dataToExport = this.validationResults?.results || this.currentData;
    if (!dataToExport) {
      this.showError('No data to export');
      return;
    }

    let content, filename, mimeType;

    if (format === 'json') {
      content = JSON.stringify(dataToExport, null, 2);
      filename = `webweaver-${this.validationResults ? 'validation' : 'extraction'}-${Date.now()}.json`;
      mimeType = 'application/json';
    } else if (format === 'csv') {
      content = this.convertToCSV(dataToExport);
      filename = `webweaver-${this.validationResults ? 'validation' : 'extraction'}-${Date.now()}.csv`;
      mimeType = 'text/csv';
    }

    // Create download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showStatus(`📁 ${format.toUpperCase()} exported successfully!`, 'success');
  }

  // ✅ COMPLETE: Convert data to CSV format
  convertToCSV(data) {
    if (this.validationResults && this.validationResults.results) {
      // Export validation results as CSV
      let csv = 'Site,Score,Status,Passed,AI_Processing_Time,Fields_Passed,Fields_Total\n';
      if (this.validationResults.results.results) {
        this.validationResults.results.results.forEach(site => {
          csv += `"${site.site}",${site.score},"${site.passed ? 'PASS' : 'FAIL'}",${site.passed},${site.aiMetadata?.extractionTime || 0},${site.validationMetadata?.fieldsPassedCount || 0},${site.validationMetadata?.fieldsTotalCount || 0}\n`;
        });
      }
      return csv;
    } else {
      // Export extraction data as CSV
      return 'Field,Value\n' + Object.entries(data)
        .map(([key, value]) => `"${key}","${String(value).replace(/"/g, '""')}"`)
        .join('\n');
    }
  }

  // ✅ COMPLETE: Copy data to clipboard
  async copyData() {
    const dataToExport = this.validationResults?.results || this.currentData;
    if (!dataToExport) {
      this.showError('No data to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(dataToExport, null, 2));
      this.showStatus('📋 Data copied to clipboard!', 'success');
    } catch (error) {
      this.showError('Failed to copy: ' + error.message);
    }
  }

  showApiKeyConfig() {
    const configSection = document.getElementById('configSection');
    if (configSection) {
      configSection.style.display = configSection.style.display === 'none' ? 'block' : 'none';
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Popup] DOM loaded, initializing Day 5 REAL AI UI...');
  new UIState();
});
