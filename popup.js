// Day 7 Championship Cross-Vertical Data Harvester Controller - SURGICAL ERROR ANALYSIS

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
    // API Configuration - FIXED with proper error handling
    if (elements.saveApiKey) {
        elements.saveApiKey.addEventListener('click', saveApiKeyFixed);
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

// Day 7 FIXED API Key management with proper async handling
async function saveApiKeyFixed() {
    console.log('[Popup] Day 7 API key save attempt...');
    
    const apiKey = elements.geminiApiKey?.value?.trim();
    
    if (!apiKey || apiKey.length === 0) {
        console.error('[Popup] Day 7 - Empty API key provided');
        showNotification('Please enter a valid API key', 'error');
        return;
    }
    
    if (apiKey.length < 20) {
        console.error('[Popup] Day 7 - API key too short');
        showNotification('API key appears to be too short. Please check your key.', 'error');
        return;
    }
    
    try {
        console.log(`[Popup] Day 7 - Attempting to save API key (length: ${apiKey.length})`);
        
        // Show loading state
        if (elements.saveApiKey) {
            elements.saveApiKey.disabled = true;
            elements.saveApiKey.textContent = 'Saving...';
        }
        
        const response = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('API key save timeout'));
            }, 10000);
            
            chrome.runtime.sendMessage({
                action: 'setApiKey',
                apiKey: apiKey
            }, (response) => {
                clearTimeout(timeout);
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
        
        console.log('[Popup] Day 7 API key save response:', response);
        
        if (response && response.success) {
            console.log('[Popup] Day 7 API key saved successfully');
            showNotification(`API key saved successfully! (Length: ${response.keyLength || apiKey.length})`, 'success');
            if (elements.geminiApiKey) elements.geminiApiKey.value = '';
            
            // Update API key status immediately
            setTimeout(loadApiKeyStatus, 500);
        } else {
            const errorMessage = response?.error || 'Failed to save API key';
            console.error('[Popup] Day 7 API key save failed:', errorMessage);
            throw new Error(errorMessage);
        }
        
    } catch (error) {
        console.error('[Popup] Day 7 API key save error:', error);
        showNotification(`Failed to save API key: ${error.message}`, 'error');
    } finally {
        // Reset button state
        if (elements.saveApiKey) {
            elements.saveApiKey.disabled = false;
            elements.saveApiKey.textContent = 'Save API Key';
        }
    }
}

// Day 7 Championship Feature: Cross-Vertical Data Harvester for SURGICAL ERROR ANALYSIS
async function runCrossVerticalTest() {
    console.log('[Popup] Day 7 Cross-Vertical Test: Starting SURGICAL data collection...');
    
    try {
        // Show loading state
        showLoadingState();
        updateProgress(0);
        
        // Send request to background script for Day 7 surgical testing
        const response = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Cross-vertical test timeout'));
            }, 45000);
            
            chrome.runtime.sendMessage({
                action: 'getIterationLog',
                timestamp: Date.now()
            }, (response) => {
                clearTimeout(timeout);
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
        
        if (response && response.success) {
            console.log('[Popup] Day 7 cross-vertical test completed successfully');
            
            // Store test results
            extractionState.testResults = response;
            
            // Update UI with results
            displayTestResults(response);
            
            // Copy CSV to clipboard
            await navigator.clipboard.writeText(response.csvData);
            
            // Update performance stats
            updatePerformanceStats(response);
            
            // Show success notification with Day 7 surgical focus
            const aiStatus = response.summary?.usingRealAI ? 'with AI' : 'basic mode';
            const accuracy = response.summary?.overallAIScore || 0;
            
            showNotification(`Day 7 surgical test complete ${aiStatus}! ${accuracy}% baseline captured. CSV copied to clipboard.`, 'success');
            
        } else {
            throw new Error(response?.error || 'Day 7 cross-vertical test failed');
        }
        
    } catch (error) {
        console.error('[Popup] Day 7 cross-vertical test error:', error);
        hideLoadingState();
        showNotification(`Day 7 test failed: ${error.message}`, 'error');
        
        // Log error for analysis
        extractionState.errorLog.push({
            type: 'DAY7_CROSS_VERTICAL_TEST_ERROR',
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
    if (elements.copyLogBtn) {
        elements.copyLogBtn.disabled = true;
        elements.copyLogBtn.textContent = 'Running Surgical Analysis...';
    }
    if (elements.testProgress) elements.testProgress.style.display = 'block';
    
    // Animate progress bar
    animateProgress();
}

// Hide loading state
function hideLoadingState() {
    if (elements.logLoading) elements.logLoading.classList.remove('show');
    if (elements.copyLogBtn) {
        elements.copyLogBtn.disabled = false;
        elements.copyLogBtn.textContent = '📋 Run Cross-Vertical Test';
    }
    if (elements.testProgress) elements.testProgress.style.display = 'none';
}

// Display cross-vertical test results with Day 7 surgical analysis focus
function displayTestResults(response) {
    hideLoadingState();
    updateProgress(100);
    
    if (elements.logResults) {
        elements.logResults.classList.add('show');
    }
    
    if (elements.testSummary && response.summary) {
        const summary = response.summary;
        const aiStatus = summary.usingRealAI ? '🤖 AI' : '⚙️ Basic';
        
        elements.testSummary.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${summary.sitesTestedCount}</div>
                    <div class="stat-label">Sites Tested</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number ${summary.overallAIScore >= 50 ? 'text-success' : summary.overallAIScore >= 25 ? 'text-warning' : 'text-error'}">${summary.overallAIScore}%</div>
                    <div class="stat-label">${aiStatus} Accuracy</div>
                </div>
            </div>
            <div class="site-results" style="margin-top: 12px;">
                <div class="site-status">
                    <span class="site-name">Cross-Vertical Average</span>
                    <span class="site-score ${getScoreClass(summary.overallAIScore)}">${summary.overallAIScore}%</span>
                </div>
                <div class="site-status">
                    <span class="site-name">Day 7 Surgical Analysis</span>
                    <span class="site-score score-good">📊 Complete</span>
                </div>
                <div class="site-status">
                    <span class="site-name">Day 8 Optimization Ready</span>
                    <span class="site-score score-excellent">✅ Data Captured</span>
                </div>
            </div>
        `;
    }
}

// Display single extraction results with Day 7 focus
function displayExtractionResults(data, mode, metadata) {
    if (elements.extractionResults) {
        elements.extractionResults.classList.add('show');
    }
    
    if (elements.resultsBadge) {
        const isAI = metadata?.realAI;
        const badgeClass = isAI ? 'badge-ai' : (mode === 'enhanced' ? 'badge-ai' : 'badge-basic');
        const icon = isAI ? '🤖' : (mode === 'enhanced' ? '🚀' : '⚡');
        const label = isAI ? 'AI Enhanced' : (mode === 'enhanced' ? 'Enhanced' : 'Basic');
        
        elements.resultsBadge.innerHTML = `${icon} ${label} Extraction Complete`;
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
        const isAI = metadata?.realAI;
        const duration = metadata?.extractionTime || data.extractionMetadata?.duration || 'N/A';
        const strategy = data.extractionMetadata?.strategy || metadata?.method || 'AUTO';
        
        elements.statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${fieldsExtracted}</div>
                <div class="stat-label">Fields Extracted</div>
            </div>
            <div class="stat-card">
                <div class="stat-number ${accuracy >= 50 ? 'text-success' : accuracy >= 25 ? 'text-warning' : 'text-error'}">${accuracy}%</div>
                <div class="stat-label">Accuracy</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${typeof duration === 'number' ? duration + 'ms' : duration}</div>
                <div class="stat-label">Duration</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${strategy}</div>
                <div class="stat-label">${isAI ? '🤖 AI' : 'Basic'}</div>
            </div>
        `;
    }
}

// Perform single page extraction with Day 7 focus
async function performExtraction(mode) {
    console.log(`[Popup] Day 7 performing ${mode} extraction...`);
    
    try {
        // Show loading state
        if (elements.extractionLoading) elements.extractionLoading.classList.add('show');
        if (elements.extractionResults) elements.extractionResults.classList.remove('show');
        if (elements.extractBtn) {
            elements.extractBtn.disabled = true;
            elements.extractBtn.textContent = 'Extracting...';
        }
        if (elements.enhancedBtn) {
            elements.enhancedBtn.disabled = true;
            elements.enhancedBtn.textContent = 'Processing...';
        }
        
        // Send extraction request
        const action = mode === 'enhanced' ? 'extractData' : 'extractPageData';
        
        const response = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Extraction timeout'));
            }, 20000);
            
            chrome.runtime.sendMessage({ action }, (response) => {
                clearTimeout(timeout);
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
        
        if (response && response.success) {
            console.log('[Popup] Day 7 extraction successful');
            
            // Store extraction data
            extractionState.currentData = response.data;
            
            // Display results
            displayExtractionResults(response.data, mode, response.metadata);
            
            // Update performance stats
            extractionState.performanceStats.totalExtractions++;
            updatePerformanceDisplay();
            
            const aiStatus = response.metadata?.realAI ? ' with AI' : '';
            showNotification(`Day 7 extraction completed successfully${aiStatus}!`, 'success');
            
        } else {
            throw new Error(response?.error || 'Day 7 extraction failed');
        }
        
    } catch (error) {
        console.error('[Popup] Day 7 extraction error:', error);
        showNotification(`Day 7 extraction failed: ${error.message}`, 'error');
        
        // Log error
        extractionState.errorLog.push({
            type: 'DAY7_SINGLE_EXTRACTION_ERROR',
            message: error.message,
            mode: mode,
            timestamp: new Date().toISOString()
        });
        
        displayErrorAnalysis();
        
    } finally {
        // Reset button states
        if (elements.extractionLoading) elements.extractionLoading.classList.remove('show');
        if (elements.extractBtn) {
            elements.extractBtn.disabled = false;
            elements.extractBtn.textContent = '🎯 Extract Current Page';
        }
        if (elements.enhancedBtn) {
            elements.enhancedBtn.disabled = false;
            elements.enhancedBtn.textContent = '🚀 Enhanced Extraction';
        }
    }
}

// Load API key status with Day 7 messaging
async function loadApiKeyStatus() {
    try {
        const response = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('API key status check timeout'));
            }, 5000);
            
            chrome.runtime.sendMessage({
                action: 'getApiKey'
            }, (response) => {
                clearTimeout(timeout);
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
        
        if (response && response.hasKey) {
            const keyInfo = response.keyLength ? ` (${response.keyLength} chars)` : '';
            showNotification(`Day 7 AI extraction enabled${keyInfo}`, 'success');
            console.log('[Popup] Day 7 AI extraction ready');
        } else {
            console.log('[Popup] Day 7 - No API key configured, basic extraction only');
        }
        
    } catch (error) {
        console.log('[Popup] Day 7 - Could not check API key status:', error.message);
    }
}

// Get CSS class for score styling (Day 7 baseline expectations)
function getScoreClass(score) {
    if (score >= 70) return 'score-excellent';
    if (score >= 50) return 'score-good';
    if (score >= 30) return 'score-fair';
    return 'score-poor';
}

// Animate progress bar during testing
function animateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 12;
        if (progress >= 95) {
            clearInterval(interval);
            progress = 95;
        }
        updateProgress(progress);
    }, 600);
    
    // Clear interval after 40 seconds (timeout)
    setTimeout(() => {
        clearInterval(interval);
        updateProgress(100);
    }, 40000);
}

// Update progress bar
function updateProgress(percentage) {
    if (elements.progressFill) {
        elements.progressFill.style.width = `${percentage}%`;
    }
}

// Export test results (keeping existing functionality)
async function exportTestResults(format) {
    if (!extractionState.testResults) {
        showNotification('No test results to export', 'error');
        return;
    }
    
    try {
        let data, filename, mimeType;
        
        if (format === 'csv') {
            data = extractionState.testResults.csvData;
            filename = `day7-surgical-results-${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv';
        } else {
            data = JSON.stringify(extractionState.testResults, null, 2);
            filename = `day7-surgical-results-${new Date().toISOString().split('T')[0]}.json`;
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
        
        showNotification(`Day 7 surgical data exported as ${format.toUpperCase()}`, 'success');
        
    } catch (error) {
        console.error('[Popup] Day 7 export error:', error);
        showNotification(`Day 7 export failed: ${error.message}`, 'error');
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
            data = convertToCSV(extractionState.currentData);
            filename = `day7-extraction-result-${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv';
        } else {
            data = JSON.stringify(extractionState.currentData, null, 2);
            filename = `day7-extraction-result-${new Date().toISOString().split('T')[0]}.json`;
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
        
        showNotification(`Day 7 data exported as ${format.toUpperCase()}`, 'success');
        
    } catch (error) {
        console.error('[Popup] Day 7 single export error:', error);
        showNotification(`Day 7 export failed: ${error.message}`, 'error');
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
        showNotification('Day 7 results copied to clipboard!', 'success');
        
    } catch (error) {
        console.error('[Popup] Day 7 copy error:', error);
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
    
    // Auto-hide after appropriate time based on type
    const hideDelay = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        if (elements.notification) {
            elements.notification.classList.remove('show');
        }
    }, hideDelay);
}

console.log('[Popup] Day 7 SURGICAL Data Harvester Controller ready - Surgical error analysis edition loaded');
