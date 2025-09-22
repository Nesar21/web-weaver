const extractBtn = document.getElementById('extractBtn');
const resetBtn = document.getElementById('resetBtn');
const exportCSV = document.getElementById('exportCSV');
const exportJSON = document.getElementById('exportJSON');
const copyBtn = document.getElementById('copyBtn');
const searchBox = document.getElementById('searchBox');
const status = document.getElementById('status');
const output = document.getElementById('output');

let lastExtractedData = null;
let originalOutput = '';
let isExtracting = false;
let extractTimeout = null;

// UI State Management
function setUiState(state, message) {
  const statusElement = status;
  statusElement.className = `status ${state}`;
  
  switch(state) {
    case 'loading':
      statusElement.innerHTML = `<span class="spinner"></span>${message}`;
      extractBtn.disabled = true;
      resetBtn.disabled = true;
      exportCSV.disabled = true;
      exportJSON.disabled = true;
      copyBtn.disabled = true;
      searchBox.disabled = true;
      isExtracting = true;
      break;
      
    case 'success':
      statusElement.textContent = message;
      extractBtn.disabled = false;
      extractBtn.textContent = 'Re-Extract Data';
      resetBtn.disabled = false;
      exportCSV.disabled = false;
      exportJSON.disabled = false;
      copyBtn.disabled = false;
      searchBox.disabled = false;
      isExtracting = false;
      break;
      
    case 'error':
      statusElement.textContent = message;
      extractBtn.disabled = false;
      resetBtn.disabled = lastExtractedData ? false : true;
      exportCSV.disabled = true;
      exportJSON.disabled = true;
      copyBtn.disabled = true;
      searchBox.disabled = true;
      isExtracting = false;
      break;
      
    default:
      statusElement.textContent = message;
      extractBtn.disabled = false;
      extractBtn.textContent = 'Extract Page Data';
      resetBtn.disabled = true;
      exportCSV.disabled = true;
      exportJSON.disabled = true;
      copyBtn.disabled = true;
      searchBox.disabled = true;
      isExtracting = false;
  }
}

// Event Listeners
extractBtn.addEventListener('click', () => {
  if (isExtracting) return;
  
  // Clear any existing timeout
  if (extractTimeout) {
    clearTimeout(extractTimeout);
  }
  
  setUiState('loading', 'Extracting data...');
  chrome.runtime.sendMessage({ action: "extractData" });
  
  // Set timeout handler
  extractTimeout = setTimeout(() => {
    if (isExtracting) {
      setUiState('error', 'Extraction timeout - try again');
      extractTimeout = null;
    }
  }, 10000);
});

resetBtn.addEventListener('click', () => {
  lastExtractedData = null;
  originalOutput = '';
  output.style.display = 'none';
  searchBox.value = '';
  
  // Clear any pending timeout
  if (extractTimeout) {
    clearTimeout(extractTimeout);
    extractTimeout = null;
  }
  
  setUiState('default', 'Ready to extract...');
});

// Message Handler
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "dataExtracted") {
    // Clear timeout since we got a response
    if (extractTimeout) {
      clearTimeout(extractTimeout);
      extractTimeout = null;
    }
    
    if (message.data.error) {
      setUiState('error', `Error: ${message.data.error}`);
      output.style.display = 'none';
      lastExtractedData = null;
      originalOutput = '';
    } else {
      lastExtractedData = message.data;
      originalOutput = JSON.stringify(message.data, null, 2);
      output.textContent = originalOutput;
      output.style.display = 'block';
      setUiState('success', 'Data extracted successfully!');
    }
  }
});

// Export Functions
function convertToCSV(data) {
  const rows = [];
  
  rows.push(['Field', 'Value']);
  rows.push(['Title', data.title || '']);
  rows.push(['URL', data.url || '']);
  rows.push(['Domain', data.domain || '']);
  
  if (data.content && data.content.headings && Array.isArray(data.content.headings)) {
    rows.push(['', '']);
    rows.push(['Headings', '']);
    data.content.headings.forEach(h => {
      rows.push([`H${h.level}`, h.text]);
    });
  }
  
  if (data.content && data.content.links && Array.isArray(data.content.links)) {
    rows.push(['', '']);
    rows.push(['Links', '']);
    data.content.links.forEach(link => {
      rows.push([link.text, link.url]);
    });
  }
  
  if (data.data && data.data.tables && Array.isArray(data.data.tables)) {
    rows.push(['', '']);
    rows.push(['Tables', '']);
    data.data.tables.forEach((table, index) => {
      rows.push([`Table ${index + 1} Headers`, table.headers.join(' | ')]);
      table.rows.forEach((row, rowIndex) => {
        rows.push([`Table ${index + 1} Row ${rowIndex + 1}`, row.join(' | ')]);
      });
    });
  }
  
  return rows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

function downloadAsCSV(data) {
  try {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: `webpage_data_${Date.now()}.csv`
    }, (downloadId) => {
      // Clean up the object URL after download starts
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      if (chrome.runtime.lastError) {
        setUiState('error', 'CSV download failed');
        console.error('Download error:', chrome.runtime.lastError);
      } else {
        setUiState('success', 'CSV download started!');
      }
    });
  } catch (error) {
    setUiState('error', 'Failed to generate CSV');
    console.error('CSV generation error:', error);
  }
}

function downloadAsJSON(data) {
  try {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: `webpage_data_${Date.now()}.json`
    }, (downloadId) => {
      // Clean up the object URL after download starts
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      if (chrome.runtime.lastError) {
        setUiState('error', 'JSON download failed');
        console.error('Download error:', chrome.runtime.lastError);
      } else {
        setUiState('success', 'JSON download started!');
      }
    });
  } catch (error) {
    setUiState('error', 'Failed to generate JSON');
    console.error('JSON generation error:', error);
  }
}

function copyToClipboard(data) {
  const jsonString = JSON.stringify(data, null, 2);
  navigator.clipboard.writeText(jsonString).then(() => {
    const currentState = isExtracting ? 'loading' : 'success';
    const currentMessage = status.textContent;
    
    setUiState('success', 'Copied to clipboard!');
    
    // Restore previous state after 2 seconds
    setTimeout(() => {
      if (!isExtracting && lastExtractedData) {
        setUiState('success', 'Data extracted successfully!');
      }
    }, 2000);
  }).catch(err => {
    setUiState('error', 'Failed to copy to clipboard');
    console.error('Copy failed:', err);
  });
}

function filterData(data, searchTerm) {
  if (!data || typeof data !== 'object') return {};
  
  const filtered = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (typeof value === 'string' && value.toLowerCase().includes(searchTerm)) {
      filtered[key] = value;
    } else if (Array.isArray(value)) {
      const filteredArray = value.filter(item => {
        if (typeof item === 'string') {
          return item.toLowerCase().includes(searchTerm);
        } else if (typeof item === 'object' && item !== null) {
          return Object.keys(filterData(item, searchTerm)).length > 0;
        }
        return false;
      });
      
      if (filteredArray.length > 0) {
        filtered[key] = filteredArray;
      }
    } else if (typeof value === 'object' && value !== null) {
      const nestedFiltered = filterData(value, searchTerm);
      if (Object.keys(nestedFiltered).length > 0) {
        filtered[key] = nestedFiltered;
      }
    }
  });
  
  return filtered;
}

// Export Event Listeners
exportCSV.addEventListener('click', () => {
  if (lastExtractedData) {
    downloadAsCSV(lastExtractedData);
  }
});

exportJSON.addEventListener('click', () => {
  if (lastExtractedData) {
    downloadAsJSON(lastExtractedData);
  }
});

copyBtn.addEventListener('click', () => {
  if (lastExtractedData) {
    copyToClipboard(lastExtractedData);
  }
});

// Search Functionality
searchBox.addEventListener('input', (e) => {
  if (!lastExtractedData) return;
  
  const searchTerm = e.target.value.toLowerCase().trim();
  
  if (searchTerm === '') {
    output.textContent = originalOutput;
    return;
  }
  
  try {
    const filteredData = filterData(lastExtractedData, searchTerm);
    output.textContent = Object.keys(filteredData).length > 0 
      ? JSON.stringify(filteredData, null, 2)
      : 'No matches found';
  } catch (error) {
    console.error('Search error:', error);
    output.textContent = originalOutput;
  }
});

// Add cURL export function (optional stretch goal)
function copyAsCurl(data) {
  const curlCommand = `curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(data).replace(/'/g, "\\'")}' \\
  https://api.example.com/analyze`;
  
  navigator.clipboard.writeText(curlCommand).then(() => {
    setUiState('success', 'cURL command copied to clipboard!');
    
    // Restore previous state after 2 seconds
    setTimeout(() => {
      if (!isExtracting && lastExtractedData) {
        setUiState('success', 'Data extracted successfully!');
      }
    }, 2000);
  }).catch(err => {
    setUiState('error', 'Failed to copy cURL command');
    console.error('Copy failed:', err);
  });
}

// Initialize UI state
setUiState('default', 'Ready to extract...');
