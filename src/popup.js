// Day 7 Championship Cross-Vertical Data Harvester Controller with Surgical Error Analysis

console.log('[Popup] Day 7 SURGICAL Data Harvester Controller - Championship ready');

// Global state management
let extractionState = {
    currentData: null,
    testResults: null,
    performanceStats: {
        totalExtractions: 0,
        averageAccuracy: 0,
        lastTestTimestamp: null
    },
    errorLog: []
};

// DOM elements cache
const elements = {};

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Popup] Day 7 Data Harvester initializing...');
    initializeElements();
    loadStoredData();
    setupEventListeners();
    loadApiKeyStatus();
});

// Cache DOM elements for performance
function initializeElements() {
    // API Configuration
    elements.geminiApiKey = document.getElementById('geminiApiKey');
    elements.saveApiKey = document.getElementById('saveApiKey');
    
    // Main extraction
    elements.extractBtn = document.getElementById('extractBtn');
    elements.enhancedBtn = document.getElementById('enhancedBtn');
    elements.extractionLoading = document.getElementById('extractionLoading');
    elements.extractionResults = document.getElementById('extractionResults');
    elements.statsGrid = document.getElementById('statsGrid');
    elements.resultsBadge = document.getElementById('resultsBadge');
    
    // Day 7 Data Harvester
    elements.copyLogBtn = document.getElementById('copyLogBtn');
    elements.logLoading = document.getElementById('logLoading');
    elements.logResults = document.getElementById('logResults');
    elements.testProgress = document.getElementById('testProgress');
    elements.progressFill = document.getElementById('progressFill');
    elements.testSummary = document.getElementById('testSummary');
    
    // Export functionality
    elements.exportCsvBtn = document.getElementById('exportCsvBtn');
    elements.exportJsonBtn = document.getElementById('exportJsonBtn');
    elements.exportJsonSingleBtn = document.getElementById('exportJsonSingleBtn');
    elements.exportCsvSingleBtn = document.getElementById('exportCsvSingleBtn');
    elements.copyResultsBtn = document.getElementById('copyResultsBtn');
    
    // Error analysis
    elements.errorAnalysisSection = document.getElementById('errorAnalysisSection');
    elements.errorSummary = document.getElementById('errorSummary');
    elements.errorList = document.getElementById('errorList');
    
    // Performance monitoring
    elements.totalExtractions = document.getElementById('totalExtractions');
    elements.averageAccuracy = document.getElementById('averageAccuracy');
    
    // Notification
    elements.notification = document.getElementById('notification');
}

// Setup all event listeners
function setupEventListeners() {
    // API Configuration
    if (elements.saveApiKey) {
        elements.saveApiKey.addEventListener('click', saveApiKey);
    }
    
    // Main extraction
    if (elements.extractBtn) {
        elements.extractBtn.addEventListener('click', () => performExtraction('basic'));
    }
    if (elements.enhancedBtn) {
        elements.enhancedBtn.addEventListener('click', () => performExtraction('enhanced'));
    }
    
    // Day 7 Data Harvester - The Championship Feature
    if (elements.copyLogBtn) {
        elements.copyLogBtn.addEventListener('click', runCrossVerticalTest);
    }
    
    // Export functionality
    if (elements.exportCsvBtn) {
        elements.exportCsvBtn.addEventListener('click', () => exportTestResults('csv'));
    }
    if (elements.exportJsonBtn) {
        elements.exportJsonBtn.addEventListener('click', () => exportTestResults('json'));
    }
    if (elements.exportJsonSingleBtn) {
        elements.exportJsonSingleBtn.addEventListener('click', () => exportSingleResult('json'));
    }
    if (elements.exportCsvSingleBtn) {
        elements.exportCsvSingleBtn.addEventListener('click', () => exportSingleResult('csv'));
    }
    if (elements.copyResultsBtn) {
        elements.copyResultsBtn.addEventListener('click', copyResultsToClipboard);
    }
}

// Day 7 Championship Feature: Cross-Vertical Data Harvester
async function runCrossVerticalTest() {
    console.log('[Popup] Day 7 Cross-Vertical Test: Starting championship validation...');
    
    try {
        // Show loading state
        showLoadingState();
        updateProgress(0);
        
        // Send request to background script for real cross-vertical testing
        const response = await chrome.runtime.sendMessage({
            action: 'getIterationLog',
            timestamp: Date.now()
        });
        
        if (response && response.success) {
            console.log('[Popup] Cross-vertical test completed successfully');
            
            // Store test results
            extractionState.testResults = response;
            
            // Update UI with results
            displayTestResults(response);
            
            // Copy CSV to clipboard
            await navigator.clipboard.writeText(response.csvData);
            
            // Update performance stats
            updatePerformanceStats(response);
            
            // Show success notification
            showNotification('Cross-vertical test completed! CSV data copied to clipboard.', 'success');
            
        } else {
            throw new Error(response?.error || 'Cross-vertical test failed');
        }
        
    } catch (error) {
        console.error('[Popup] Cross-vertical test error:', error);
        hideLoadingState();
        showNotification(`Test failed: ${error.message}`, 'error');
        
        // Log error for analysis
        extractionState.errorLog.push({
            type: 'CROSS_VERTICAL_TEST_ERROR',
            message: error.message,
            timestamp: new Date().toISOString()
        });
        
        displayErrorAnalysis();
    }
}

// Show loading state for cross-vertical test
function showLoadingState() {
    if (elements.logLoading) elements.logLoading.classList.add('show');
    if (elements.logResults) elements.logResults.classList.remove('show');
    if (elements.copyLogBtn) elements.copyLogBtn.disabled = true;
    if (elements.testProgress) elements.testProgress.style.display = 'block';
    
    // Animate progress bar
    animateProgress();
}

// Hide loading state
function hideLoadingState() {
    if (elements.logLoading) elements.logLoading.classList.remove('show');
    if (elements.copyLogBtn) elements.copyLogBtn.disabled = false;
    if (elements.testProgress) elements.testProgress.style.display = 'none';
}

// Animate progress bar during testing
function animateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 95) {
            clearInterval(interval);
            progress = 95;
        }
        updateProgress(progress);
    }, 500);
    
    // Clear interval after 30 seconds (timeout)
    setTimeout(() => {
        clearInterval(interval);
        updateProgress(100);
    }, 30000);
}

// Update progress bar
function updateProgress(percentage) {
    if (elements.progressFill) {
        elements.progressFill.style.width = `${percentage}%`;
    }
}

// Display cross-vertical test results
function displayTestResults(response) {
    hideLoadingState();
    updateProgress(100);
    
    if (elements.logResults) {
        elements.logResults.classList.add('show');
    }
    
    if (elements.testSummary && response.summary) {
        const summary = response.summary;
        elements.testSummary.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${summary.sitesTestedCount}</div>
                    <div class="stat-label">Sites Tested</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number ${summary.overallAIScore >= 70 ? 'text-success' : 'text-warning'}">${summary.overallAIScore}%</div>
                    <div class="stat-label">AI Accuracy</div>
                </div>
            </div>
            <div class="site-results" style="margin-top: 12px;">
                <div class="site-status">
                    <span class="site-name">Cross-Vertical Average</span>
                    <span class="site-score ${getScoreClass(summary.overallAIScore)}">${summary.overallAIScore}%</span>
                </div>
                <div class="site-status">
                    <span class="site-name">Target Achievement</span>
                    <span class="site-score ${summary.targetAchieved ? 'score-excellent' : 'score-fair'}">
                        ${summary.targetAchieved ? '✅ Achieved' : '📈 In Progress'}
                    </span>
                </div>
            </div>
        `;
    }
}

// Get CSS class for score styling
function getScoreClass(score) {
    if (score >= 90) return 'score-excellent';
    if (score >= 75) return 'score-good';
    if (score >= 60) return 'score-fair';
    return 'score-poor';
}

// Perform single page extraction
async function performExtraction(mode) {
    console.log(`[Popup] Performing ${mode} extraction...`);
    
    try {
        // Show loading state
        if (elements.extractionLoading) elements.extractionLoading.classList.add('show');
        if (elements.extractionResults) elements.extractionResults.classList.remove('show');
        if (elements.extractBtn) elements.extractBtn.disabled = true;
        if (elements.enhancedBtn) elements.enhancedBtn.disabled = true;
        
        // Send extraction request
        const action = mode === 'enhanced' ? 'extractData' : 'extractPageData';
        const response = await chrome.runtime.sendMessage({ action });
        
        if (response && response.success) {
            console.log('[Popup] Extraction successful');
            
            // Store extraction data
            extractionState.currentData = response.data;
            
            // Display results
            displayExtractionResults(response.data, mode);
            
            // Update performance stats
            extractionState.performanceStats.totalExtractions++;
            updatePerformanceDisplay();
            
            showNotification('Extraction completed successfully!', 'success');
            
        } else {
            throw new Error(response?.error || 'Extraction failed');
        }
        
    } catch (error) {
        console.error('[Popup] Extraction error:', error);
        showNotification(`Extraction failed: ${error.message}`, 'error');
        
        // Log error
        extractionState.errorLog.push({
            type: 'SINGLE_EXTRACTION_ERROR',
            message: error.message,
            mode: mode,
            timestamp: new Date().toISOString()
        });
        
        displayErrorAnalysis();
        
    } finally {
        // Hide loading state
        if (elements.extractionLoading) elements.extractionLoading.classList.remove('show');
        if (elements.extractBtn) elements.extractBtn.disabled = false;
        if (elements.enhancedBtn) elements.enhancedBtn.disabled = false;
    }
}

// Display single extraction results
function displayExtractionResults(data, mode) {
    if (elements.extractionResults) {
        elements.extractionResults.classList.add('show');
    }
    
    if (elements.resultsBadge) {
        const badgeClass = mode === 'enhanced' ? 'badge-ai' : 'badge-basic';
        elements.resultsBadge.innerHTML = `${mode === 'enhanced' ? '🚀' : '⚡'} ${mode.charAt(0).toUpperCase() + mode.slice(1)} Extraction Complete`;
        elements.resultsBadge.parentElement.className = `badge ${badgeClass}`;
    }
    
    if (elements.statsGrid && data) {
        let fieldsExtracted = 0;
        let totalFields = 0;
        
        // Count extracted fields
        const fields = ['title', 'author', 'publication_date', 'main_content_summary', 'category', 'description', 'price', 'ingredients', 'instructions', 'reviews_rating'];
        
        fields.forEach(field => {
            totalFields++;
            if (data[field] && data[field] !== null && data[field] !== '') {
                if (Array.isArray(data[field])) {
                    if (data[field].length > 0) fieldsExtracted++;
                } else {
                    fieldsExtracted++;
                }
            }
        });
        
        const accuracy = Math.round((fieldsExtracted / totalFields) * 100);
        
        elements.statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${fieldsExtracted}</div>
                <div class="stat-label">Fields Extracted</div>
            </div>
            <div class="stat-card">
                <div class="stat-number ${accuracy >= 70 ? 'text-success' : 'text-warning'}">${accuracy}%</div>
                <div class="stat-label">Accuracy</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.extractionMetadata?.duration || 'N/A'}</div>
                <div class="stat-label">Duration</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.extractionMetadata?.strategy || 'AUTO'}</div>
                <div class="stat-label">Strategy</div>
            </div>
        `;
    }
}

// API Key management
async function saveApiKey() {
    const apiKey = elements.geminiApiKey?.value?.trim();
    
    if (!apiKey) {
        showNotification('Please enter a valid API key', 'error');
        return;
    }
    
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'setApiKey',
            apiKey: apiKey
        });
        
        if (response && response.success) {
            showNotification('API key saved successfully!', 'success');
            if (elements.geminiApiKey) elements.geminiApiKey.value = '';
        } else {
            throw new Error('Failed to save API key');
        }
        
    } catch (error) {
        console.error('[Popup] API key save error:', error);
        showNotification('Failed to save API key', 'error');
    }
}

// Load API key status
async function loadApiKeyStatus() {
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'getApiKey'
        });
        
        if (response && response.hasKey) {
            showNotification('AI extraction enabled', 'success');
        }
        
    } catch (error) {
        console.log('[Popup] Could not check API key status');
    }
}

// Export test results
async function exportTestResults(format) {
    if (!extractionState.testResults) {
        showNotification('No test results to export', 'error');
        return;
    }
    
    try {
        let data, filename, mimeType;
        
        if (format === 'csv') {
            data = extractionState.testResults.csvData;
            filename = `day7-cross-vertical-results-${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv';
        } else {
            data = JSON.stringify(extractionState.testResults, null, 2);
            filename = `day7-cross-vertical-results-${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
        }
        
        // Create download
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        showNotification(`Results exported as ${format.toUpperCase()}`, 'success');
        
    } catch (error) {
        console.error('[Popup] Export error:', error);
        showNotification(`Export failed: ${error.message}`, 'error');
    }
}

// Export single extraction result
async function exportSingleResult(format) {
    if (!extractionState.currentData) {
        showNotification('No extraction data to export', 'error');
        return;
    }
    
    try {
        let data, filename, mimeType;
        
        if (format === 'csv') {
            // Convert to CSV format
            data = convertToCSV(extractionState.currentData);
            filename = `extraction-result-${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv';
        } else {
            data = JSON.stringify(extractionState.currentData, null, 2);
            filename = `extraction-result-${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
        }
        
        // Create download
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        showNotification(`Data exported as ${format.toUpperCase()}`, 'success');
        
    } catch (error) {
        console.error('[Popup] Single export error:', error);
        showNotification(`Export failed: ${error.message}`, 'error');
    }
}

// Copy results to clipboard
async function copyResultsToClipboard() {
    if (!extractionState.currentData) {
        showNotification('No data to copy', 'error');
        return;
    }
    
    try {
        const dataString = JSON.stringify(extractionState.currentData, null, 2);
        await navigator.clipboard.writeText(dataString);
        showNotification('Results copied to clipboard!', 'success');
        
    } catch (error) {
        console.error('[Popup] Copy error:', error);
        showNotification('Failed to copy to clipboard', 'error');
    }
}

// Convert object to CSV format
function convertToCSV(data) {
    const headers = Object.keys(data);
    const values = headers.map(header => {
        const value = data[header];
        if (Array.isArray(value)) {
            return `"${value.join('; ')}"`;
        } else if (value === null || value === undefined) {
            return '';
        } else {
            return `"${String(value).replace(/"/g, '""')}"`;
        }
    });
    
    return headers.join(',') + '\n' + values.join(',');
}

// Display error analysis
function displayErrorAnalysis() {
    if (extractionState.errorLog.length === 0) {
        if (elements.errorAnalysisSection) {
            elements.errorAnalysisSection.style.display = 'none';
        }
        return;
    }
    
    if (elements.errorAnalysisSection) {
        elements.errorAnalysisSection.style.display = 'block';
    }
    
    if (elements.errorList) {
        const errorHTML = extractionState.errorLog.slice(-5).map(error => `
            <div style="margin-bottom: 8px; padding: 6px; background: #fff; border-radius: 4px; border-left: 3px solid #ef4444;">
                <div style="font-weight: 600; font-size: 10px;">${error.type}</div>
                <div style="font-size: 10px; margin-top: 2px;">${error.message}</div>
                <div style="font-size: 9px; color: #6b7280; margin-top: 2px;">${new Date(error.timestamp).toLocaleTimeString()}</div>
            </div>
        `).join('');
        
        elements.errorList.innerHTML = errorHTML;
    }
}

// Update performance statistics
function updatePerformanceStats(testResults) {
    if (testResults && testResults.summary) {
        extractionState.performanceStats.lastTestTimestamp = Date.now();
        
        // Update average accuracy (simple moving average)
        const newAccuracy = testResults.summary.overallAIScore;
        const currentAvg = extractionState.performanceStats.averageAccuracy;
        const totalTests = extractionState.performanceStats.totalExtractions + 1;
        
        extractionState.performanceStats.averageAccuracy = Math.round(
            ((currentAvg * (totalTests - 1)) + newAccuracy) / totalTests
        );
    }
    
    updatePerformanceDisplay();
    savePerformanceStats();
}

// Update performance display
function updatePerformanceDisplay() {
    if (elements.totalExtractions) {
        elements.totalExtractions.textContent = extractionState.performanceStats.totalExtractions;
    }
    
    if (elements.averageAccuracy) {
        elements.averageAccuracy.textContent = `${extractionState.performanceStats.averageAccuracy}%`;
    }
}

// Save performance stats to storage
function savePerformanceStats() {
    chrome.storage.local.set({
        performanceStats: extractionState.performanceStats,
        errorLog: extractionState.errorLog
    });
}

// Load stored performance data
function loadStoredData() {
    chrome.storage.local.get(['performanceStats', 'errorLog'], (result) => {
        if (result.performanceStats) {
            extractionState.performanceStats = { ...extractionState.performanceStats, ...result.performanceStats };
        }
        if (result.errorLog) {
            extractionState.errorLog = result.errorLog;
        }
        
        updatePerformanceDisplay();
        displayErrorAnalysis();
    });
}

// Show notification
function showNotification(message, type = 'success') {
    if (!elements.notification) return;
    
    elements.notification.textContent = message;
    elements.notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 3000);
}

// Utility functions
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
}

console.log('[Popup] Day 7 SURGICAL Data Harvester Controller ready - Championship edition loaded');
