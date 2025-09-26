// Day 6 FINAL POLISH Popup Script - Championship Edition

console.log('Day 6 FINAL POLISH Popup Script loaded - Championship ready');

// DOM Elements
let elements = {};

// State Management
let currentResults = null;
let currentValidation = null;
let apiKeyConfigured = false;

// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Popup] Day 6 FINAL POLISH initializing...');
    initializeElements();
    checkApiStatus();
    setupEventListeners();
    console.log('[Popup] Day 6 FINAL POLISH ready');
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

// Perform extraction with animations
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

// Perform real validation with championship scoring
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

// Display extraction results with enhanced UI and animations
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

    // Display field grid with enhanced visuals
    displayFieldGrid(aiData);

    // Display comparison if both AI and basic are available
    if (data.ai && data.enhancedBasic) {
        displayComparison(data.ai, data.enhancedBasic);
    }

    // Show results with slide-in animation
    elements.results.style.transform = 'translateY(20px)';
    elements.results.style.opacity = '0';
    elements.results.classList.add('show');
    
    // Trigger animation
    requestAnimationFrame(() => {
        elements.results.style.transition = 'all 0.3s ease-out';
        elements.results.style.transform = 'translateY(0)';
        elements.results.style.opacity = '1';
    });
}

// Display validation results with championship visual indicators
function displayValidationResults(results) {
    const score = Math.round(results.overallScore || 0);
    const isChampionship = score >= 75;
    const isTarget = score >= 60;
    
    // Championship score visual enhancement
    elements.scoreMain.textContent = score + '%';
    
    // Add championship trophy for high scores
    if (isChampionship) {
        elements.scoreMain.innerHTML = `🏆 ${score}%`;
        elements.scoreMain.style.color = '#FFD700'; // Gold color
        elements.validationScore.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
    } else if (isTarget) {
        elements.scoreMain.style.color = '#28a745'; // Green color
        elements.validationScore.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    } else {
        elements.scoreMain.style.color = '#dc3545'; // Red color
        elements.validationScore.style.background = 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)';
    }

    // Update target indicator
    elements.scoreTarget.textContent = isChampionship ? 'Championship: ≥75% 🏆' : 
                                      isTarget ? 'Target: ≥60% ✅' : 'Target: ≥60% ❌';

    // Update other metrics
    elements.testsRun.textContent = results.sitesCount || 0;
    elements.successRate.textContent = Math.round((results.passedCount / results.sitesCount) * 100) + '%';
    elements.avgResponse.textContent = Math.round(results.avgResponseTime || 0) + 'ms';
    elements.validationMethod.textContent = results.methodology || 'Real AI';

    // Show results with fade-in animation
    elements.validationResults.style.opacity = '0';
    elements.validationResults.classList.add('show');
    
    // Trigger animation
    requestAnimationFrame(() => {
        elements.validationResults.style.transition = 'opacity 0.4s ease-in';
        elements.validationResults.style.opacity = '1';
    });
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
            <div class="field-indicator ${hasValue ? 'success' : 'empty'}">
                ${hasValue ? '✓' : '○'}
            </div>
            <div class="field-preview">${hasValue ? String(value).substring(0, 50) + (String(value).length > 50 ? '...' : '') : 'Not found'}</div>
        `;

        elements.fieldGrid.appendChild(fieldElement);
    });
}

// Display AI vs Basic comparison with enhanced styling
function displayComparison(aiData, basicData) {
    const fields = ['title', 'author', 'publication_date', 'description', 'main_content_summary', 'category'];
    
    let aiHTML = '<div class="comparison-header ai-header">🤖 Enhanced AI</div>';
    let basicHTML = '<div class="comparison-header basic-header">⚡ Enhanced Basic</div>';

    fields.forEach(field => {
        const aiValue = aiData[field] || 'Not found';
        const basicValue = basicData[field] || 'Not found';
        const aiHasValue = aiData[field] !== null && aiData[field] !== undefined && aiData[field] !== '';
        const basicHasValue = basicData[field] !== null && basicData[field] !== undefined && basicData[field] !== '';

        aiHTML += `
            <div class="comparison-field ${aiHasValue ? 'has-value' : 'no-value'}">
                <strong>${field.replace(/_/g, ' ').toUpperCase()}</strong>
                <div class="field-value">${typeof aiValue === 'string' ? aiValue.substring(0, 100) + (aiValue.length > 100 ? '...' : '') : JSON.stringify(aiValue).substring(0, 100)}</div>
            </div>
        `;

        basicHTML += `
            <div class="comparison-field ${basicHasValue ? 'has-value' : 'no-value'}">
                <strong>${field.replace(/_/g, ' ').toUpperCase()}</strong>
                <div class="field-value">${typeof basicValue === 'string' ? basicValue.substring(0, 100) + (basicValue.length > 100 ? '...' : '') : JSON.stringify(basicValue).substring(0, 100)}</div>
            </div>
        `;
    });

    elements.aiComparison.innerHTML = aiHTML;
    elements.basicComparison.innerHTML = basicHTML;

    // Apply distinct background colors for better readability
    elements.aiComparison.style.backgroundColor = 'rgba(0, 123, 255, 0.05)';
    elements.basicComparison.style.backgroundColor = 'rgba(40, 167, 69, 0.05)';
}

// Toggle comparison view
function toggleComparison() {
    const isVisible = elements.comparisonContent.style.display !== 'none';
    elements.comparisonContent.style.display = isVisible ? 'none' : 'block';
    elements.comparisonToggle.innerHTML = isVisible ? 
        '🔍 View AI vs Basic Comparison <span>Click to expand</span>' : 
        '🔍 Hide AI vs Basic Comparison <span>Click to collapse</span>';
}

// Export data functionality
function exportData(format) {
    if (!currentResults) {
        showNotification('No extraction results to export', 'error');
        return;
    }

    const data = currentResults.ai || currentResults.enhancedBasic || {};
    
    if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadFile(blob, 'extraction-results.json');
    } else if (format === 'csv') {
        const csv = convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        downloadFile(blob, 'extraction-results.csv');
    }
}

// Export validation results
function exportValidation(format) {
    if (!currentValidation) {
        showNotification('No validation results to export', 'error');
        return;
    }
    
    if (format === 'json') {
        const blob = new Blob([JSON.stringify(currentValidation, null, 2)], { type: 'application/json' });
        downloadFile(blob, 'validation-results.json');
    } else if (format === 'csv') {
        const csv = convertValidationToCSV(currentValidation);
        const blob = new Blob([csv], { type: 'text/csv' });
        downloadFile(blob, 'validation-results.csv');
    }
}

// Convert object to CSV
function convertToCSV(obj) {
    const headers = Object.keys(obj);
    const values = Object.values(obj).map(value => 
        typeof value === 'object' ? JSON.stringify(value) : String(value)
    );
    
    return headers.join(',') + '\n' + values.join(',');
}

// Convert validation results to CSV
function convertValidationToCSV(validation) {
    let csv = 'Site,Field,Score,Status,Weight\n';
    
    validation.results.forEach(siteResult => {
        Object.keys(siteResult.fieldScores || {}).forEach(field => {
            const fieldScore = siteResult.fieldScores[field];
            csv += `"${siteResult.site}","${field}",${fieldScore.raw || 0},"${fieldScore.status || 'unknown'}",${fieldScore.weight || 0}\n`;
        });
    });
    
    return csv;
}

// Download file helper
function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification(`Downloaded ${filename}`, 'success');
}

// Copy results to clipboard
function copyResults() {
    if (!currentResults) {
        showNotification('No results to copy', 'error');
        return;
    }

    const data = JSON.stringify(currentResults.ai || currentResults.enhancedBasic || {}, null, 2);
    navigator.clipboard.writeText(data).then(() => {
        showNotification('Results copied to clipboard', 'success');
    }).catch(() => {
        showNotification('Failed to copy results', 'error');
    });
}

// Copy validation results to clipboard
function copyValidationResults() {
    if (!currentValidation) {
        showNotification('No validation results to copy', 'error');
        return;
    }

    const data = JSON.stringify(currentValidation, null, 2);
    navigator.clipboard.writeText(data).then(() => {
        showNotification('Validation results copied to clipboard', 'success');
    }).catch(() => {
        showNotification('Failed to copy validation results', 'error');
    });
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show with animation
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Send message helper
function sendMessage(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(response);
            }
        });
    });
}

console.log('📋 Day 6 FINAL POLISH Popup Script ready - Championship grade UI');
