const extractBtn = document.getElementById('extractBtn');
const status = document.getElementById('status');
const output = document.getElementById('output');

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
    } else {
      status.textContent = 'Data extracted successfully!';
      output.style.display = 'block';
      output.textContent = JSON.stringify(message.data, null, 2);
    }
  }
});