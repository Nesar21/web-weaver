// Day 7 Championship Cross-Vertical Data Harvester Controller - OPERATION SURGICAL DATA++

console.log('[Popup] Day 7 OPERATION SURGICAL DATA++ Controller - Stress test enabled');

// Global state management
let extractionState = {
    currentData: null,
    testResults: null,
    stressResults: null,
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
    console.log('[Popup] Day 7 SURGICAL DATA++ initializing...');
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
    
    // Results display
    elements.resultsContainer = document.getElementById('resultsContainer');
    elements.jsonBtn = document.getElementById('jsonBtn');
    elements.csvBtn = document.getElementById('csvBtn');
    elements.copyBtn = document.getElementById('copyBtn');
    
    // Cross-vertical testing - UPDATED
    elements.copyLogBtn = document.getElementById('copyLogBtn');
    elements.stressTestBtn = document.getElementById('stressTestBtn');
    
    // Performance stats
    elements.totalExtractions = document.getElementById('totalExtractions');
    elements.averageAccuracy = document.getElementById('averageAccuracy');
    
    console.log('[Popup] Day 7 SURGICAL DATA++ DOM elements cached successfully');
}

// Setup event listeners
function setupEventListeners() {
    // API key management
    if (elements.saveApiKey) {
        elements.saveApiKey.addEventListener('click', handleSaveApiKey);
    }

    // Main extraction buttons
    if (elements.extractBtn) {
        elements.extractBtn.addEventListener('click', () => handleExtraction('basic'));
    }
    
    if (elements.enhancedBtn) {
        elements.enhancedBtn.addEventListener('click', () => handleExtraction('enhanced'));
    }

    // Export buttons
    if (elements.jsonBtn) {
        elements.jsonBtn.addEventListener('click', () => exportData('json'));
    }
    
    if (elements.csvBtn) {
        elements.csvBtn.addEventListener('click', () => exportData('csv'));
    }
    
    if (elements.copyBtn) {
        elements.copyBtn.addEventListener('click', () => exportData('copy'));
    }

    // Cross-vertical testing - Legacy support
    if (elements.copyLogBtn) {
        elements.copyLogBtn.addEventListener('click', handleLegacyCrossVerticalTest);
    }

    // 🎯 NEW: Operation Surgical Data++ stress test
    if (elements.stressTestBtn) {
        elements.stressTestBtn.addEventListener('click', handleStressTest);
    }

    console.log('[Popup] Day 7 SURGICAL DATA++ event listeners set up successfully');
}

// 🎯 NEW: Operation Surgical Data++ stress test handler
async function handleStressTest() {
    console.log('[Popup] Day 7 OPERATION SURGICAL DATA++ stress test starting...');
    
    try {
        // Update UI to show stress test in progress
        elements.stressTestBtn.disabled = true;
        elements.stressTestBtn.textContent = '🔄 Infiltrating Enemy Domains...';
        
        // Clear previous error logs
        extractionState.errorLog = [];
        updateErrorDisplay();
        
        console.log('[Popup] Launching OPERATION SURGICAL DATA++ to background...');
        
        // Launch stress test operation
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: 'runStressTest'
            }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
        
        console.log('[Popup] Day 7 OPERATION SURGICAL DATA++ response:', response);
        
        if (response && response.success) {
            // Store stress test results
            extractionState.stressResults = response;
            
            // Auto-save JSONL to clipboard for manual logging
            try {
                await copyToClipboardSafe(response.jsonlData);
                console.log('[Popup] JSONL iteration log copied to clipboard for manual save');
            } catch (clipboardError) {
                console.warn('[Popup] JSONL clipboard copy failed, showing modal:', clipboardError);
                showJSONLModal(response.jsonlData);
            }
            
            // Update UI with stress test success
            updateStressTestUI(response.summary);
            showSuccessMessage(`OPERATION SURGICAL DATA++ complete! Infiltrated ${response.summary.domainsInfiltrated}/${response.summary.sitesTestedCount} domains. Overall accuracy: ${response.summary.overallAIScore}%. JSONL log copied for manual save.`);
            
            console.log('[Popup] Day 7 OPERATION SURGICAL DATA++ completed successfully');
            
        } else {
            throw new Error(response?.error || 'OPERATION SURGICAL DATA++ failed - no response data');
        }
        
    } catch (error) {
        console.error('[Popup] Day 7 OPERATION SURGICAL DATA++ error:', error);
        
        // Add to error log with proper error message extraction
        const errorMessage = error.message || error.toString() || 'Unknown error occurred';
        extractionState.errorLog.push({
            type: 'DAY7_STRESS_TEST_ERROR',
            message: errorMessage,
            timestamp: new Date().toLocaleTimeString(),
            operation: 'SURGICAL DATA++',
            errorDetails: error
        });
        
        updateErrorDisplay();
        showErrorMessage(`OPERATION SURGICAL DATA++ failed: ${errorMessage}`);
        
    } finally {
        // Always reset button state
        elements.stressTestBtn.disabled = false;
        elements.stressTestBtn.textContent = '🚀 Run Stress Test';
    }
}

// Legacy support for existing cross-vertical test
async function handleLegacyCrossVerticalTest() {
    console.log('[Popup] Day 7 legacy cross-vertical test starting...');
    
    try {
        // Update UI to show test in progress
        elements.copyLogBtn.disabled = true;
        elements.copyLogBtn.textContent = '🔄 Testing 5 Sites...';
        
        // Clear previous error logs
        extractionState.errorLog = [];
        updateErrorDisplay();
        
        console.log('[Popup] Sending legacy cross-vertical test request to background...');
        
        // Send message to background script
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: 'getIterationLog'
            }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
        
        console.log('[Popup] Day 7 legacy cross-vertical test response:', response);
        
        if (response && response.success) {
            // Store results
            extractionState.testResults = response;
            
            // 🎯 CRITICAL FIX: Safe clipboard copy with proper error handling
            try {
                await copyToClipboardSafe(response.csvData);
                console.log('[Popup] CSV data copied to clipboard successfully');
            } catch (clipboardError) {
                console.warn('[Popup] Clipboard copy failed, data available in modal:', clipboardError);
                // Continue execution even if clipboard fails
            }
            
            // Update UI with success
            updateTestResultsUI(response.summary);
            showSuccessMessage(`Day 7 surgical test complete! ${response.summary.usingRealAI ? 'AI' : 'Basic'} mode. ${response.summary.overallAIScore}% baseline captured. CSV copied to clipboard.`);
            
            console.log('[Popup] Day 7 legacy cross-vertical test completed successfully');
            
        } else {
            throw new Error(response?.error || 'Cross-vertical test failed - no response data');
        }
        
    } catch (error) {
        console.error('[Popup] Day 7 legacy cross-vertical test error:', error);
        
        // Add to error log with proper error message extraction
        const errorMessage = error.message || error.toString() || 'Unknown error occurred';
        extractionState.errorLog.push({
            type: 'DAY7_LEGACY_CROSS_VERTICAL_TEST_ERROR',
            message: errorMessage,
            timestamp: new Date().toLocaleTimeString(),
            errorDetails: error
        });
        
        updateErrorDisplay();
        showErrorMessage(`Day 7 legacy test failed: ${errorMessage}`);
        
    } finally {
        // Always reset button state
        elements.copyLogBtn.disabled = false;
        elements.copyLogBtn.textContent = '📋 Copy Iteration Log';
    }
}

// 🎯 CRITICAL FIX: Enhanced safe clipboard copy function
async function copyToClipboardSafe(text) {
    console.log('[Popup] Attempting safe clipboard copy...');
    
    if (!text || typeof text !== 'string') {
        throw new Error('Invalid text data for clipboard');
    }
    
    try {
        // Method 1: Modern clipboard API with proper checks
        if (navigator.clipboard && window.isSecureContext) {
            console.log('[Popup] Trying modern clipboard API...');
            await navigator.clipboard.writeText(text);
            console.log('[Popup] Modern clipboard API succeeded');
            return;
        }
    } catch (clipboardError) {
        console.warn('[Popup] Modern clipboard API failed:', clipboardError.message);
    }
    
    try {
        // Method 2: Fallback to textarea method with better error handling
        console.log('[Popup] Trying fallback clipboard method...');
        
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.cssText = 'position: fixed; left: -999999px; top: -999999px; opacity: 0;';
        document.body.appendChild(textArea);
        
        // Focus and select with error handling
        try {
            textArea.focus();
            textArea.select();
            textArea.setSelectionRange(0, text.length);
        } catch (selectionError) {
            console.warn('[Popup] Text selection failed:', selectionError);
        }
        
        // Execute copy command
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            console.log('[Popup] Fallback clipboard method succeeded');
            return;
        } else {
            throw new Error('execCommand copy returned false');
        }
    } catch (fallbackError) {
        console.error('[Popup] Fallback clipboard failed:', fallbackError.message);
        
        // Method 3: Show data in a modal for manual copy (don't throw error)
        console.log('[Popup] Showing manual copy modal as final fallback');
        showDataModal(text);
        
        // Don't throw error - just warn user
        console.warn('[Popup] Automatic clipboard failed - manual copy modal displayed');
        return; // Success - user can manually copy
    }
}

// Enhanced JSONL modal for manual save
function showJSONLModal(jsonlData) {
    console.log('[Popup] Creating JSONL manual save modal...');
    
    try {
        // Remove any existing modals
        const existingModal = document.getElementById('jsonlModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'jsonlModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 90%;
            max-height: 90%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        const header = document.createElement('h3');
        header.textContent = 'OPERATION SURGICAL DATA++ - JSONL Log for Manual Save';
        header.style.cssText = 'margin: 0 0 15px 0; color: #333; font-size: 18px;';
        
        const instruction = document.createElement('p');
        instruction.textContent = 'Copy this JSONL data to testing/logs/iteration_log.jsonl:';
        instruction.style.cssText = 'margin: 0 0 15px 0; color: #666; font-size: 14px; font-weight: bold;';
        
        const textarea = document.createElement('textarea');
        textarea.value = jsonlData;
        textarea.style.cssText = `
            width: 600px; 
            height: 400px; 
            font-family: 'Courier New', monospace; 
            font-size: 11px;
            resize: none;
            border: 1px solid #ddd;
            padding: 10px;
            margin-bottom: 15px;
        `;
        
        // Auto-select text
        setTimeout(() => {
            try {
                textarea.select();
                textarea.setSelectionRange(0, jsonlData.length);
            } catch (selectError) {
                console.warn('[Popup] Auto-select failed:', selectError);
            }
        }, 100);
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: flex-end;';
        
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy JSONL';
        copyBtn.style.cssText = `
            padding: 8px 16px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        `;
        copyBtn.onclick = async () => {
            try {
                await navigator.clipboard.writeText(jsonlData);
                showSuccessMessage('JSONL data copied successfully!');
                modal.remove();
            } catch (retryError) {
                console.warn('[Popup] Retry copy failed:', retryError);
                textarea.select();
            }
        };
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.cssText = `
            padding: 8px 16px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        `;
        closeBtn.onclick = () => modal.remove();
        
        buttonContainer.appendChild(copyBtn);
        buttonContainer.appendChild(closeBtn);
        
        modalContent.appendChild(header);
        modalContent.appendChild(instruction);
        modalContent.appendChild(textarea);
        modalContent.appendChild(buttonContainer);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        console.log('[Popup] JSONL manual save modal created successfully');
        
    } catch (modalError) {
        console.error('[Popup] Failed to create JSONL modal:', modalError);
        // Final fallback - just log the data
        console.log('[Popup] MANUAL SAVE JSONL DATA:', jsonlData);
    }
}

// Enhanced data modal for manual copy
function showDataModal(data) {
    console.log('[Popup] Creating manual copy modal...');
    
    try {
        // Remove any existing modals
        const existingModal = document.getElementById('dataModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'dataModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 90%;
            max-height: 90%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        const header = document.createElement('h3');
        header.textContent = 'Day 7 Test Results - Manual Copy Required';
        header.style.cssText = 'margin: 0 0 15px 0; color: #333; font-size: 18px;';
        
        const instruction = document.createElement('p');
        instruction.textContent = 'Automatic clipboard copy failed. Please manually copy the data below:';
        instruction.style.cssText = 'margin: 0 0 15px 0; color: #666; font-size: 14px;';
        
        const textarea = document.createElement('textarea');
        textarea.value = data;
        textarea.style.cssText = `
            width: 500px; 
            height: 300px; 
            font-family: 'Courier New', monospace; 
            font-size: 12px;
            resize: none;
            border: 1px solid #ddd;
            padding: 10px;
            margin-bottom: 15px;
        `;
        
        // Auto-select text
        setTimeout(() => {
            try {
                textarea.select();
                textarea.setSelectionRange(0, data.length);
            } catch (selectError) {
                console.warn('[Popup] Auto-select failed:', selectError);
            }
        }, 100);
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: flex-end;';
        
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Try Copy Again';
        copyBtn.style.cssText = `
            padding: 8px 16px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        `;
        copyBtn.onclick = async () => {
            try {
                await navigator.clipboard.writeText(data);
                showSuccessMessage('Data copied successfully!');
                modal.remove();
            } catch (retryError) {
                console.warn('[Popup] Retry copy failed:', retryError);
                textarea.select();
            }
        };
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.cssText = `
            padding: 8px 16px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        `;
        closeBtn.onclick = () => modal.remove();
        
        buttonContainer.appendChild(copyBtn);
        buttonContainer.appendChild(closeBtn);
        
        modalContent.appendChild(header);
        modalContent.appendChild(instruction);
        modalContent.appendChild(textarea);
        modalContent.appendChild(buttonContainer);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        console.log('[Popup] Manual copy modal created successfully');
        
    } catch (modalError) {
        console.error('[Popup] Failed to create manual copy modal:', modalError);
        // Final fallback - just log the data
        console.log('[Popup] MANUAL COPY DATA:', data);
    }
}

// Update stress test results UI
function updateStressTestUI(summary) {
    if (!summary) return;
    
    try {
        // Update performance stats with stress test data
        if (elements.totalExtractions) {
            elements.totalExtractions.textContent = summary.domainsInfiltrated || 0;
        }
        
        if (elements.averageAccuracy) {
            elements.averageAccuracy.textContent = `${summary.overallAIScore || 0}%`;
        }
        
        // Update test status display
        const testStatusEl = document.getElementById('testStatus');
        if (testStatusEl) {
            testStatusEl.innerHTML = `
                <div class="stress-test-summary">
                    <div class="metric">
                        <span class="value">${summary.domainsInfiltrated || 0}/${summary.sitesTestedCount || 0}</span>
                        <span class="label">Domains Infiltrated</span>
                    </div>
                    <div class="metric">
                        <span class="value">${summary.overallAIScore || 0}%</span>
                        <span class="label">${summary.usingRealAI ? '🤖 AI' : '⚙️ Basic'} Accuracy</span>
                    </div>
                    <div class="status">
                        <span class="label">Operation</span>
                        <span class="value">${summary.operationName || 'SURGICAL DATA++'}</span>
                    </div>
                    <div class="status">
                        <span class="label">Status</span>
                        <span class="value">📊 Complete</span>
                    </div>
                    <div class="status">
                        <span class="label">Day 8 Ready</span>
                        <span class="value">✅ Baseline Established</span>
                    </div>
                    <div class="weak-fields">
                        <span class="label">Weak Fields Analysis:</span>
                        <span class="value">${Object.entries(summary.weakFieldAnalysis || {}).slice(0, 3).map(([field, count]) => `${field} (${count})`).join(', ')}</span>
                    </div>
                </div>
                <div class="export-options">
                    <button onclick="exportStressResults('jsonl')">📄 Export JSONL</button>
                    <button onclick="exportStressResults('csv')">📋 Export CSV</button>
                </div>
            `;
        }
        
        console.log('[Popup] Stress test results UI updated successfully');
        
    } catch (uiError) {
        console.error('[Popup] Failed to update stress test results UI:', uiError);
    }
}

// Update test results UI (legacy support)
function updateTestResultsUI(summary) {
    if (!summary) return;
    
    try {
        // Update performance stats
        if (elements.totalExtractions) {
            elements.totalExtractions.textContent = summary.sitesTestedCount || 0;
        }
        
        if (elements.averageAccuracy) {
            elements.averageAccuracy.textContent = `${summary.overallAIScore || 0}%`;
        }
        
        // Update test status display
        const testStatusEl = document.getElementById('testStatus');
        if (testStatusEl) {
            testStatusEl.innerHTML = `
                <div class="test-summary">
                    <div class="metric">
                        <span class="value">${summary.sitesTestedCount || 0}</span>
                        <span class="label">Sites Tested</span>
                    </div>
                    <div class="metric">
                        <span class="value">${summary.overallAIScore || 0}%</span>
                        <span class="label">${summary.usingRealAI ? '🤖 AI' : '⚙️ Basic'} Accuracy</span>
                    </div>
                    <div class="status">
                        <span class="label">Cross-Vertical Average</span>
                        <span class="value">${summary.overallAIScore || 0}%</span>
                    </div>
                    <div class="status">
                        <span class="label">Day 7 Surgical Analysis</span>
                        <span class="value">📊 Complete</span>
                    </div>
                    <div class="status">
                        <span class="label">Day 8 Optimization Ready</span>
                        <span class="value">✅ Data Captured</span>
                    </div>
                </div>
                <div class="export-options">
                    <button onclick="exportTestResults('csv')">📄 Export CSV</button>
                    <button onclick="exportTestResults('json')">📋 Export JSON</button>
                </div>
            `;
        }
        
        console.log('[Popup] Test results UI updated successfully');
        
    } catch (uiError) {
        console.error('[Popup] Failed to update test results UI:', uiError);
    }
}

// Error display update
function updateErrorDisplay() {
    try {
        const errorContainer = document.getElementById('errorContainer');
        if (!errorContainer) return;
        
        if (extractionState.errorLog.length === 0) {
            errorContainer.style.display = 'none';
            return;
        }
        
        const errorHtml = extractionState.errorLog.map(error => `
            <div class="error-item">
                <strong>${error.type}</strong>
                <p>${error.message}</p>
                <small>${error.timestamp}</small>
            </div>
        `).join('');
        
        errorContainer.innerHTML = `
            <div class="error-header">🔍 Error Analysis</div>
            <div class="error-list">
                <div class="error-summary">Extraction Errors Detected:</div>
                ${errorHtml}
            </div>
        `;
        
        errorContainer.style.display = 'block';
        
    } catch (displayError) {
        console.error('[Popup] Failed to update error display:', displayError);
    }
}

// API key management
async function handleSaveApiKey() {
    if (!elements.geminiApiKey) return;
    
    const apiKey = elements.geminiApiKey.value.trim();
    if (!apiKey) {
        showErrorMessage('Please enter a valid Gemini API key');
        return;
    }
    
    try {
        elements.saveApiKey.disabled = true;
        elements.saveApiKey.textContent = 'Saving...';
        
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: 'setApiKey',
                apiKey: apiKey
            }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
        
        if (response && response.success) {
            showSuccessMessage('API key saved successfully!');
            await loadApiKeyStatus();
        } else {
            throw new Error(response?.error || 'Failed to save API key');
        }
    } catch (error) {
        console.error('[Popup] API key save error:', error);
        showErrorMessage(`Failed to save API key: ${error.message}`);
    } finally {
        elements.saveApiKey.disabled = false;
        elements.saveApiKey.textContent = 'Save API Key';
    }
}

// Load API key status
async function loadApiKeyStatus() {
    try {
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: 'getApiKey' }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
        
        if (response && response.hasKey) {
            const keyDisplay = `${'*'.repeat(Math.max(0, response.keyLength - 8))}${response.keyLength > 8 ? '********' : ''}`;
            if (elements.geminiApiKey) {
                elements.geminiApiKey.placeholder = `API Key Set (${keyDisplay})`;
            }
        }
    } catch (error) {
        console.warn('[Popup] API key status check failed:', error);
    }
}

// Basic extraction handler
async function handleExtraction(type) {
    console.log(`[Popup] Starting Day 7 ${type} extraction...`);
    
    const button = type === 'basic' ? elements.extractBtn : elements.enhancedBtn;
    const originalText = button.textContent;
    
    try {
        // Update button state
        button.disabled = true;
        button.textContent = '⏳ Extracting...';
        
        // Clear previous results
        extractionState.currentData = null;
        
        // Send extraction request
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: type === 'basic' ? 'extractPageData' : 'extractData'
            }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
        
        console.log(`[Popup] Day 7 ${type} extraction response:`, response);
        
        if (response && response.success) {
            extractionState.currentData = response;
            displayExtractionResults(response, type);
            updatePerformanceStats();
            showSuccessMessage(`Day 7 ${type} extraction completed successfully!`);
        } else {
            throw new Error(response?.error || `${type} extraction failed`);
        }
        
    } catch (error) {
        console.error(`[Popup] Day 7 ${type} extraction error:`, error);
        showErrorMessage(`Day 7 ${type} extraction failed: ${error.message}`);
    } finally {
        // Reset button state
        button.disabled = false;
        button.textContent = originalText;
    }
}

// Display extraction results
function displayExtractionResults(data, type) {
    if (!elements.resultsContainer || !data) return;
    
    try {
        const fieldsExtracted = Object.keys(data.data || {}).filter(key => 
            data.data[key] && data.data[key] !== null && 
            (Array.isArray(data.data[key]) ? data.data[key].length > 0 : true)
        ).length;
        
        const totalFields = Object.keys(data.data || {}).length;
        const accuracy = totalFields > 0 ? Math.round((fieldsExtracted / totalFields) * 100) : 0;
        
        const extractionTime = data.metadata?.extractionTime || 0;
        const strategy = data.metadata?.strategy || 'AUTO';
        
        elements.resultsContainer.innerHTML = `
            <div class="extraction-summary">
                <div class="summary-card">
                    <div class="metric-large">
                        <span class="value">${fieldsExtracted}</span>
                        <span class="label">Fields Extracted</span>
                    </div>
                    <div class="metric-large">
                        <span class="value">${accuracy}%</span>
                        <span class="label">Accuracy</span>
                    </div>
                    <div class="metric-large">
                        <span class="value">${extractionTime}ms</span>
                        <span class="label">Duration</span>
                    </div>
                </div>
                <div class="extraction-details">
                    <span class="strategy">${strategy}</span>
                    <span class="method">${type === 'basic' ? 'Basic' : data.metadata?.realAI ? 'AI' : 'Basic'}</span>
                </div>
            </div>
        `;
        
        elements.resultsContainer.style.display = 'block';
        
    } catch (displayError) {
        console.error('[Popup] Failed to display extraction results:', displayError);
    }
}

// Performance stats update
function updatePerformanceStats() {
    try {
        extractionState.performanceStats.totalExtractions++;
        
        if (extractionState.currentData) {
            const fieldsExtracted = Object.keys(extractionState.currentData.data || {}).filter(key => 
                extractionState.currentData.data[key] && extractionState.currentData.data[key] !== null
            ).length;
            const totalFields = Object.keys(extractionState.currentData.data || {}).length;
            const accuracy = totalFields > 0 ? Math.round((fieldsExtracted / totalFields) * 100) : 0;
            
            // Simple running average
            const currentAvg = extractionState.performanceStats.averageAccuracy || 0;
            const count = extractionState.performanceStats.totalExtractions;
            extractionState.performanceStats.averageAccuracy = Math.round(
                (currentAvg * (count - 1) + accuracy) / count
            );
        }
        
        extractionState.performanceStats.lastTestTimestamp = new Date().toISOString();
        
        // Update UI
        if (elements.totalExtractions) {
            elements.totalExtractions.textContent = extractionState.performanceStats.totalExtractions;
        }
        if (elements.averageAccuracy) {
            elements.averageAccuracy.textContent = `${extractionState.performanceStats.averageAccuracy}%`;
        }
        
        // Save to storage
        saveStateToStorage();
        
    } catch (statsError) {
        console.error('[Popup] Failed to update performance stats:', statsError);
    }
}

// Data export
async function exportData(format) {
    if (!extractionState.currentData) {
        showErrorMessage('No data to export. Please run an extraction first.');
        return;
    }
    
    try {
        let exportText = '';
        
        switch (format) {
            case 'json':
                exportText = JSON.stringify(extractionState.currentData, null, 2);
                break;
            case 'csv':
                exportText = convertToCSV(extractionState.currentData.data);
                break;
            case 'copy':
                exportText = JSON.stringify(extractionState.currentData, null, 2);
                break;
        }
        
        if (format === 'copy') {
            await copyToClipboardSafe(exportText);
            showSuccessMessage('Data copied to clipboard!');
        } else {
            // For file downloads, show in modal
            showDataModal(exportText);
        }
        
    } catch (error) {
        console.error(`[Popup] ${format} export error:`, error);
        showErrorMessage(`${format.toUpperCase()} export failed: ${error.message}`);
    }
}

// CSV conversion utility
function convertToCSV(data) {
    if (!data || typeof data !== 'object') return '';
    
    try {
        const headers = Object.keys(data);
        const values = headers.map(key => {
            const value = data[key];
            if (Array.isArray(value)) {
                return `"${value.join('; ')}"`;
            }
            if (typeof value === 'string') {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
        });
        
        return `${headers.join(',')}\n${values.join(',')}`;
        
    } catch (csvError) {
        console.error('[Popup] CSV conversion error:', csvError);
        return '';
    }
}

// Storage management
function saveStateToStorage() {
    try {
        chrome.storage.local.set({
            extractionState: extractionState
        });
    } catch (error) {
        console.warn('[Popup] Failed to save state to storage:', error);
    }
}

function loadStoredData() {
    try {
        chrome.storage.local.get(['extractionState'], (result) => {
            if (chrome.runtime.lastError) {
                console.warn('[Popup] Storage access error:', chrome.runtime.lastError);
                return;
            }
            
            if (result.extractionState) {
                extractionState = { ...extractionState, ...result.extractionState };
                
                // Update UI with stored stats
                if (elements.totalExtractions) {
                    elements.totalExtractions.textContent = extractionState.performanceStats.totalExtractions || 0;
                }
                if (elements.averageAccuracy) {
                    elements.averageAccuracy.textContent = `${extractionState.performanceStats.averageAccuracy || 0}%`;
                }
            }
        });
    } catch (error) {
        console.warn('[Popup] Failed to load stored data:', error);
    }
}

// Message display utilities
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    try {
        // Create or update status message element
        let statusEl = document.getElementById('statusMessage');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'statusMessage';
            statusEl.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 10px 15px;
                border-radius: 4px;
                color: white;
                font-weight: bold;
                z-index: 1000;
                max-width: 300px;
                text-align: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
            `;
            document.body.appendChild(statusEl);
        }
        
        statusEl.textContent = message;
        statusEl.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
        statusEl.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (statusEl && statusEl.parentNode) {
                statusEl.style.display = 'none';
            }
        }, 5000);
        
    } catch (messageError) {
        console.error('[Popup] Failed to show message:', messageError);
        // Fallback to console
        console.log(`[Popup] ${type.toUpperCase()}: ${message}`);
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('[Popup] Global error:', event.error);
    extractionState.errorLog.push({
        type: 'GLOBAL_ERROR',
        message: event.error?.message || 'Unknown global error',
        timestamp: new Date().toLocaleTimeString()
    });
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('[Popup] Unhandled promise rejection:', event.reason);
    extractionState.errorLog.push({
        type: 'PROMISE_REJECTION',
        message: event.reason?.message || 'Unhandled promise rejection',
        timestamp: new Date().toLocaleTimeString()
    });
});

console.log('[Popup] Day 7 OPERATION SURGICAL DATA++ Controller loaded - Stress test ready');
