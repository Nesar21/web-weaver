const extractBtn = document.getElementById('extractBtn');
const exportCSV = document.getElementById('exportCSV');
const exportJSON = document.getElementById('exportJSON');
const searchBox = document.getElementById('searchBox');
const status = document.getElementById('status');
const output = document.getElementById('output');

let lastExtractedData = null;
let originalOutput = '';

extractBtn.addEventListener('click', () => {
  extractBtn.disabled = true;
  status.textContent = 'Extracting data...';
  
  chrome.runtime.sendMessage({ action: "extractData" });
  
  setTimeout(() => {
    if (extractBtn.disabled) {
      extractBtn.disabled = false;
      status.textContent = 'Extraction timeout - try again';
    }
  }, 5000);
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "dataExtracted") {
    extractBtn.disabled = false;
    
    if (message.data.error) {
      status.textContent = 'Error: ' + message.data.error;
      output.style.display = 'none';
      lastExtractedData = null;
      originalOutput = '';
      exportCSV.disabled = true;
      exportJSON.disabled = true;
      searchBox.disabled = true;
    } else {
      status.textContent = 'Data extracted successfully!';
      output.style.display = 'block';
      output.textContent = JSON.stringify(message.data, null, 2);
      lastExtractedData = message.data;
      originalOutput = JSON.stringify(message.data, null, 2);
      exportCSV.disabled = false;
      exportJSON.disabled = false;
      searchBox.disabled = false;
    }
  }
});

function convertToCSV(data) {
  const rows = [];
  
  rows.push(['Field', 'Value']);
  rows.push(['Title', data.title || '']);
  rows.push(['URL', data.url || '']);
  rows.push(['Domain', data.domain || '']);
  
  if (data.content && data.content.headings) {
    rows.push(['', '']);
    rows.push(['Headings', '']);
    data.content.headings.forEach(h => {
      rows.push([`H${h.level}`, h.text]);
    });
  }
  
  if (data.content && data.content.links) {
    rows.push(['', '']);
    rows.push(['Links', '']);
    data.content.links.forEach(link => {
      rows.push([link.text, link.url]);
    });
  }
  
  return rows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

function downloadAsCSV(data) {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  chrome.downloads.download({
    url: url,
    filename: `webpage_data_${Date.now()}.csv`
  });
}

function downloadAsJSON(data) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  chrome.downloads.download({
    url: url,
    filename: `webpage_data_${Date.now()}.json`
  });
}

function filterData(data, searchTerm) {
  const filtered = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (typeof value === 'string' && value.toLowerCase().includes(searchTerm)) {
      filtered[key] = value;
    } else if (typeof value === 'object' && value !== null) {
      const nestedFiltered = filterData(value, searchTerm);
      if (Object.keys(nestedFiltered).length > 0) {
        filtered[key] = nestedFiltered;
      }
    }
  });
  
  return filtered;
}

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

searchBox.addEventListener('input', (e) => {
  if (!lastExtractedData) return;
  
  const searchTerm = e.target.value.toLowerCase();
  
  if (searchTerm === '') {
    output.textContent = originalOutput;
    return;
  }
  
  const filteredData = filterData(lastExtractedData, searchTerm);
  output.textContent = JSON.stringify(filteredData, null, 2);
});