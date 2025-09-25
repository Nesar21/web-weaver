// Day 6 REAL Validation Popup Script - Championship Edition
console.log('Day 6 REAL Validation Popup Script loaded - Championship ready');

// DOM Elements
let elements = {};

// State Management
let currentResults = null;
let currentValidation = null;
let apiKeyConfigured = false;

// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Popup] Day 6 REAL Validation initializing...');
    
    initializeElements();
    checkApiStatus();
    setupEventListeners();
    
    console.log('[Popup] Day 6 REAL Validation ready');
});

// Initialize DOM elements
function initializeElements() {
    elements = {
        // Status elements
        apiStatusDot: document.getElementById('apiStatusDot'),
        apiStatusText: document.getElementById('apiStatusText'),
        methodIndicator: document.getElementById('methodIndicator'),
        methodText: document.getElementById('methodText'),
        
        // Form elements
        apiKey: document.getElementById('apiKey'),
        saveApiKey: document.getElementById('saveApiKey'),
        
        // Action buttons
        extractBtn: document.getElementById('extractBtn'),
        validateBtn: document.getElementById('validateBtn'),
        
        // Loading indicators
        extractLoading: document.getElementById('extractLoading'),
        validateLoading: document.getElementById('validateLoading'),
        
        // Results containers
        results: document.getElementById('results'),
        validationResults: document.getElementById('validationResults'),
        
        // Result content
        extractionBadge: document.getElementById('extractionBadge'),
        badgeText: document.getElementById('badgeText'),
        fieldGrid: document.getElementById('fieldGrid'),
        
        // Metrics
        contentLength: document.getElementById('contentLength'),
        extractionTime: document.getElementById('extractionTime'),
        fieldsFound: document.getElementById('fieldsFound'),
        
        // Comparison
        comparisonToggle: document.getElementById('comparisonToggle'),
        comparisonContent: document.getElementById('comparisonContent'),
        aiComparison: document.getElementById('aiComparison'),
        basicComparison: document.getElementById('basicComparison'),
        
        // Validation results
        validationScore: document.getElementById('validationScore'),
        scoreMain: document.getElementById('scoreMain'),
        scoreTarget: document.getElementById('scoreTarget'),
        testsRun: document.getElementById('testsRun'),
        successRate: document.getElementById('successRate'),
        avgResponse: document.getElementById('avgResponse'),
        validationMethod: document.getElementById('validationMethod'),
        
        // Export buttons
        exportJson: document.getElementById('exportJson'),
        exportCsv: document.getElementById('exportCsv'),
        copyResults: document.getElementById('copyResults'),
        exportValidation: document.getElementById('exportValidation'),
        exportValidationCsv: document.getElementById('exportValidationCsv'),
        copyValidation: document.getElementById('copyValidation')
    };
}

// Setup event listeners
function setupEventListeners() {
    // API Configuration
    elements.saveApiKey.addEventListener('click', saveApiKey);
    
    // Actions
    elements.extractBtn.addEventListener('click', performExtraction);
    elements.validateBtn.addEventListener('click', performValidation);
    
    // Comparison toggle
    elements.comparisonToggle.addEventListener('click', toggleComparison);
    
    // Export actions
    elements.exportJson.addEventListener('click', () => exportData('json'));
    elements.exportCsv.addEventListener('click', () => exportData('csv'));
    elements.copyResults.addEventListener('click', copyResults);
    
    elements.exportValidation.addEventListener('click', () => exportValidation('json'));
    elements.exportValidationCsv.addEventListener('click', () => exportValidation('csv'));
    elements.copyValidation.addEventListener('click', copyValidationResults);
}

// Check API status
async function checkApiStatus() {
    try {
        const response = await sendMessage({ action: "getApiKey" });
        apiKeyConfigured = response.hasKey;
        
        updateApiStatus(apiKeyConfigured);
        updateMethodIndicator(apiKeyConfigured ? 'ai' : 'basic');
        
    } catch (error) {
        console.error('[Popup] API status check failed:', error);
        updateApiStatus(false);
    }
}

// Update API status display
function updateApiStatus(connected) {
    elements.apiStatusDot.classList.toggle('connected', connected);
    elements.apiStatusText.textContent = connected ? 'Enhanced AI Ready' : 'Configure API Key';
}

// Update method indicator
function updateMethodIndicator(method) {
    elements.methodIndicator.className = `method-indicator method-${method}`;
    elements.methodText.textContent = method === 'ai' ? 'Enhanced AI' : 'Enhanced Basic';
}

// Save API key
async function saveApiKey() {
    const apiKey = elements.apiKey.value.trim();
    
    if (!apiKey) {
        showNotification('Please enter an API key', 'error');
        return;
    }
    
    try {
        elements.saveApiKey.disabled = true;
        elements.saveApiKey.textContent = 'Saving...';
        
        const response = await sendMessage({ 
            action: "setApiKey", 
            apiKey: apiKey 
        });
        
        if (response.success) {
            apiKeyConfigured = true;
            updateApiStatus(true);
            updateMethodIndicator('ai');
            elements.apiKey.value = '';
            showNotification('Enhanced AI configured successfully!', 'success');
        } else {
            throw new Error(response.message || 'Configuration failed');
        }
        
    } catch (error) {
        console.error('[Popup] API key save failed:', error);
        showNotification('Configuration failed: ' + error.message, 'error');
    } finally {
        elements.saveApiKey.disabled = false;
        elements.saveApiKey.textContent = 'Save Configuration';
    }
}

// Perform extraction
async function performExtraction() {
    try {
        elements.extractBtn.disabled = true;
        elements.extractLoading.style.display = 'flex';
        elements.results.classList.remove('show');
        
        console.log('[Popup] Starting REAL extraction...');
        
        const response = await sendMessage({ action: "extractData" });
        
        if (response.success) {
            currentResults = response.data;
            displayExtractionResults(response.data);
            console.log('[Popup] REAL extraction completed');
        } else {
            throw new Error(response.error || 'Extraction failed');
        }
        
    } catch (error) {
        console.error('[Popup] Extraction failed:', error);
        showNotification('Extraction failed: ' + error.message, 'error');
    } finally {
        elements.extractBtn.disabled = false;
        elements.extractLoading.style.display = 'none';
    }
}

// Perform real validation
async function performValidation() {
    try {
        elements.validateBtn.disabled = true;
        elements.validateLoading.style.display = 'flex';
        elements.validationResults.classList.remove('show');
        
        console.log('[Popup] Starting REAL validation on current page...');
        
        const response = await sendMessage({ action: "runRealValidation" });
        
        if (response.success) {
            currentValidation = response.results;
            displayValidationResults(response.results);
            console.log('[Popup] REAL validation completed:', response.results);
        } else {
            throw new Error(response.error || 'Validation failed');
        }
        
    } catch (error) {
        console.error('[Popup] Validation failed:', error);
        showNotification('Validation failed: ' + error.message, 'error');
    } finally {
        elements.validateBtn.disabled = false;
        elements.validateLoading.style.display = 'none';
    }
}

// Display extraction results with enhanced UI
function displayExtractionResults(data) {
    // Update badge based on method
    const isAI = data.enhancedWithAI;
    elements.extractionBadge.className = `extraction-badge badge-${isAI ? 'ai' : 'basic'}`;
    elements.badgeText.textContent = isAI ? '🤖 Enhanced AI' : '⚡ Enhanced Basic';
    
    // Update metrics
    elements.contentLength.textContent = data.content?.length || 0;
    elements.extractionTime.textContent = data.extractionTime || '-';
    
    // Count fields with values
    const aiData = data.ai || {};
    const fieldsWithValues = Object.values(aiData).filter(value => 
        value !== null && value !== undefined && value !== '' && 
        !(Array.isArray(value) && value.length === 0)
    ).length;
    elements.fieldsFound.textContent = fieldsWithValues;
    
    // Display field grid
    displayFieldGrid(aiData);
    
    // Display comparison if both AI and basic are available
    if (data.ai && data.enhancedBasic) {
        displayComparison(data.ai, data.enhancedBasic);
    }
    
    // Show results
    elements.results.classList.add('show');
}

// Display field grid with visual indicators
function displayFieldGrid(data) {
    const fields = [
        { key: 'title', label: 'Title' },
        { key: 'author', label: 'Author' },
        { key: 'publication_date', label: 'Date' },
        { key: 'category', label: 'Category' },
        { key: 'description', label: 'Description' },
        { key: 'main_content_summary', label: 'Summary' }
    ];
    
    elements.fieldGrid.innerHTML = '';
    
    fields.forEach(field => {
        const value = data[field.key];
        const hasValue = value !== null && value !== undefined && value !== '' && 
                         !(Array.isArray(value) && value.length === 0);
        
        const fieldElement = document.createElement('div');
        fieldElement.className = `field-item ${hasValue ? 'has-value' : 'no-value'}`;
        
        fieldElement.innerHTML = `
            <div class="field-label">${field.label}</div>
            <div class="field-value ${hasValue ? '' : 'empty'}">
                ${hasValue ? truncateText(formatValue(value), 50) : 'Not found'}
            </div>
        `;
        
        elements.fieldGrid.appendChild(fieldElement);
    });
}

// Display AI vs Basic comparison
function displayComparison(aiData, basicData) {
    // AI Results
    elements.aiComparison.innerHTML = createComparisonContent(aiData);
    
    // Basic Results
    elements.basicComparison.innerHTML = createComparisonContent(basicData);
}

// Create comparison content
function createComparisonContent(data) {
    const fields = ['title', 'author', 'description', 'main_content_summary'];
    
    return fields.map(field => {
        const value = data[field];
        const hasValue = value !== null && value !== undefined && value !== '';
        
        return `
            <div style="margin-bottom: 8px; padding: 6px; background: ${hasValue ? 'rgba(22, 163, 74, 0.05)' : 'rgba(100, 116, 139, 0.05)'}; border-radius: 4px;">
                <div style="font-size: 9px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px;">
                    ${field.replace('_', ' ')}
                </div>
                <div style="font-size: 10px; color: ${hasValue ? 'var(--text)' : 'var(--text-muted)'};">
                    ${hasValue ? truncateText(formatValue(value), 40) : 'Not extracted'}
                </div>
            </div>
        `;
    }).join('');
}

// Display validation results with real metrics
function displayValidationResults(results) {
    // Calculate real performance metrics
    const realScore = calculateRealPerformance(results);
    
    // Update main score
    elements.scoreMain.textContent = `${realScore.overall}%`;
    elements.scoreTarget.textContent = `Real Performance on Current Page`;
    
    // Set score styling
    const scoreClass = realScore.overall >= 75 ? 'excellent' : 
                      realScore.overall >= 60 ? 'good' : 'poor';
    elements.validationScore.className = `validation-score ${scoreClass}`;
    
    // Update metrics
    elements.testsRun.textContent = results.testsPerformed || 1;
    elements.successRate.textContent = `${realScore.successRate}%`;
    elements.avgResponse.textContent = `${results.avgResponseTime || results.extractionTime || 0}ms`;
    elements.validationMethod.textContent = results.method || 'Real AI';
    
    // Show validation results
    elements.validationResults.classList.add('show');
}

// Calculate real performance metrics
function calculateRealPerformance(results) {
    const data = results.extractedData || results.data || results;
    const aiData = data.ai || {};
    
    // Count successful extractions
    const fields = ['title', 'author', 'publication_date', 'category', 'description', 'main_content_summary'];
    const successful = fields.filter(field => {
        const value = aiData[field];
        return value !== null && value !== undefined && value !== '' && 
               !(Array.isArray(value) && value.length === 0);
    }).length;
    
    const overall = Math.round((successful / fields.length) * 100);
    const successRate = Math.round((successful / fields.length) * 100);
    
    return {
        overall,
        successRate,
        fieldsFound: successful,
        totalFields: fields.length
    };
}

// Toggle comparison view
function toggleComparison() {
    const content = elements.comparisonContent;
    content.classList.toggle('show');
}

// Export functions
function exportData(format) {
    if (!currentResults) {
        showNotification('No data to export', 'error');
        return;
    }
    
    if (format === 'json') {
        downloadFile(JSON.stringify(currentResults, null, 2), 'extraction-results.json', 'application/json');
    } else if (format === 'csv') {
        const csv = convertToCSV(currentResults.ai || {});
        downloadFile(csv, 'extraction-results.csv', 'text/csv');
    }
}

function copyResults() {
    if (!currentResults) {
        showNotification('No data to copy', 'error');
        return;
    }
    
    const text = JSON.stringify(currentResults, null, 2);
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Results copied to clipboard!', 'success');
    });
}

function exportValidation(format) {
    if (!currentValidation) {
        showNotification('No validation data to export', 'error');
        return;
    }
    
    if (format === 'json') {
        downloadFile(JSON.stringify(currentValidation, null, 2), 'validation-results.json', 'application/json');
    } else if (format === 'csv') {
        const csv = convertValidationToCSV(currentValidation);
        downloadFile(csv, 'validation-results.csv', 'text/csv');
    }
}

function copyValidationResults() {
    if (!currentValidation) {
        showNotification('No validation data to copy', 'error');
        return;
    }
    
    const text = JSON.stringify(currentValidation, null, 2);
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Validation results copied to clipboard!', 'success');
    });
}

// Utility functions
function sendMessage(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, response => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(response);
            }
        });
    });
}

function showNotification(message, type) {
    // Simple notification system
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: ${type === 'success' ? 'var(--success)' : 'var(--error)'};
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function formatValue(value) {
    if (Array.isArray(value)) {
        return value.join(', ');
    }
    return String(value);
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function convertToCSV(data) {
    const headers = Object.keys(data);
    const values = headers.map(header => JSON.stringify(data[header] || ''));
    return headers.join(',') + '\n' + values.join(',');
}

function convertValidationToCSV(data) {
    return `Metric,Value\nOverall Score,${data.overallScore || 0}\nTests Run,${data.testsPerformed || 1}\nSuccess Rate,${data.successRate || 0}\nAvg Response Time,${data.avgResponseTime || 0}`;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

console.log('[Popup] Day 6 REAL Validation Popup Script ready - Championship grade');
