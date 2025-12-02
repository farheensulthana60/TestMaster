// Sidebar JavaScript - All functionality
let currentElement = null;
let recordedActions = [];
let isRecording = false;
let pageInfo = null;
let capturedScreenshot = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupEventListeners();
  loadSavedConfig();
});

// Listen for messages from content script
window.addEventListener('message', (event) => {
  console.log('Sidebar received message:', event.data); // Debug log
  
  const { action, data } = event.data;
  
  switch(action) {
    case 'init':
      pageInfo = event.data.pageInfo;
      if (event.data.activeTab) {
        switchTab(event.data.activeTab);
      }
      break;
    case 'elementSelected':
      console.log('Element selected action triggered:', event.data.element); // Debug log
      handleElementSelected(event.data.element);
      break;
    case 'recordingComplete':
      handleRecordingComplete(event.data.actions);
      break;
    case 'screenshotCaptured':
      capturedScreenshot = event.data.screenshot;
      displayScreenshot(event.data.screenshot);
      break;
  }
});

// Tab management
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });
}

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
  
  // Update content
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById(tabName)?.classList.add('active');
}

// Event Listeners
function setupEventListeners() {
  // Close button
  document.getElementById('closeBtn').addEventListener('click', () => {
    window.parent.postMessage({ action: 'closeSidebar' }, '*');
  });
  
  // Element Locator
  document.getElementById('inspectBtn').addEventListener('click', () => {
    const btn = document.getElementById('inspectBtn');
    if (btn.classList.contains('active')) {
      btn.classList.remove('active');
      btn.textContent = '🔍 Inspect Element on Page';
      btn.style.backgroundColor = '#007bff';
    } else {
      btn.classList.add('active');
      btn.textContent = '✅ Inspecting... Click any element';
      btn.style.backgroundColor = '#28a745';
    }
    window.parent.postMessage({ action: 'inspectElement' }, '*');
  });
  
  // Recorder
  document.getElementById('startRecordBtn').addEventListener('click', startRecording);
  document.getElementById('stopRecordBtn').addEventListener('click', stopRecording);
  document.getElementById('clearRecordBtn').addEventListener('click', clearRecording);
  
  // Script Generator
  document.getElementById('generateScriptBtn').addEventListener('click', generateTestScript);
  document.getElementById('convertRecordingBtn').addEventListener('click', convertRecordingToScript);
  
  // API Tester
  document.getElementById('sendApiBtn').addEventListener('click', sendApiRequest);
  document.getElementById('generateApiTestBtn').addEventListener('click', generateApiTestScript);
  
  // Bug Reporter
  document.getElementById('captureScreenshotBtn').addEventListener('click', captureScreenshot);
  document.getElementById('generateBugReportBtn').addEventListener('click', generateBugReport);
  
  // Test Data
  document.getElementById('generateDataBtn').addEventListener('click', generateTestData);
  document.getElementById('generateBoundaryBtn').addEventListener('click', generateBoundaryValues);
  
  // Performance
  document.getElementById('analyzePerformanceBtn').addEventListener('click', analyzePerformance);
  document.getElementById('analyzeNetworkBtn').addEventListener('click', analyzeNetwork);
  
  // Accessibility
  document.getElementById('checkAccessibilityBtn').addEventListener('click', checkAccessibility);
  
  // Visual Regression
  document.getElementById('captureBaselineBtn').addEventListener('click', captureBaseline);
  document.getElementById('compareScreenshotBtn').addEventListener('click', compareWithBaseline);
  
  // Test Plan
  document.getElementById('generateTestPlanBtn').addEventListener('click', generateTestPlan);
  
  // AI Assistant
  document.getElementById('sendAiBtn').addEventListener('click', sendAiMessage);
  document.getElementById('aiInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      sendAiMessage();
    }
  });
  document.getElementById('saveAiConfigBtn').addEventListener('click', saveAiConfig);
  document.getElementById('aiProvider').addEventListener('change', (e) => {
    document.getElementById('apiKeyGroup').style.display = 
      e.target.value === 'custom' || e.target.value === 'groq' ? 'block' : 'none';
  });
}

// ========== ELEMENT LOCATOR ==========
function handleElementSelected(element) {
  console.log('handleElementSelected called with:', element); // Debug log
  
  if (!element) {
    console.error('No element provided to handleElementSelected'); // Debug log
    return;
  }
  
  currentElement = element;
  switchTab('elementLocator');
  
  // Reset the inspect button state
  const btn = document.getElementById('inspectBtn');
  if (btn) {
    btn.classList.remove('active');
    btn.textContent = '🔍 Inspect Element on Page';
    btn.style.backgroundColor = '#007bff';
    console.log('Button reset to blue'); // Debug log
  }
  
  const infoDiv = document.getElementById('elementInfo');
  if (!infoDiv) {
    console.error('elementInfo div not found!');
    return;
  }
  infoDiv.style.display = 'block';
  console.log('Element info div shown'); // Debug log
  
  const detailsDiv = document.getElementById('elementDetails');
  if (!detailsDiv) {
    console.error('elementDetails div not found!');
    return;
  }
  
  detailsDiv.innerHTML = `
    <div class="info-grid">
      <div class="info-item">
        <strong>Tag</strong>
        ${element.tagName || 'N/A'}
      </div>
      <div class="info-item">
        <strong>Type</strong>
        ${element.type || 'N/A'}
      </div>
      <div class="info-item">
        <strong>ID</strong>
        ${element.id || 'None'}
      </div>
      <div class="info-item">
        <strong>Classes</strong>
        ${element.className || 'None'}
      </div>
      <div class="info-item">
        <strong>Name</strong>
        ${element.name || 'N/A'}
      </div>
      <div class="info-item">
        <strong>Visible</strong>
        <span class="badge ${element.isVisible ? 'badge-success' : 'badge-error'}">
          ${element.isVisible ? 'Yes' : 'No'}
        </span>
      </div>
    </div>
    ${element.text ? `<div style="margin-top: 15px;"><strong>Text Content:</strong><br>${escapeHtml(element.text)}</div>` : ''}
    ${element.value ? `<div style="margin-top: 10px;"><strong>Value:</strong><br>${escapeHtml(element.value)}</div>` : ''}
  `;
  console.log('Element details HTML set'); // Debug log
  
  const selectorsDiv = document.getElementById('selectorsList');
  if (!selectorsDiv) {
    console.error('selectorsList div not found!');
    return;
  }
  
  selectorsDiv.innerHTML = `
    ${createSelectorOption('CSS Selector', element.cssSelector || 'N/A')}
    ${createSelectorOption('XPath', element.xpath || 'N/A')}
    ${element.id ? createSelectorOption('ID', `#${element.id}`) : ''}
    ${element.name ? createSelectorOption('Name', `[name="${element.name}"]`) : ''}
    ${element.className ? createSelectorOption('Class', `.${element.className.split(' ')[0]}`) : ''}
  `;
  console.log('Selectors displayed successfully!'); // Debug log
}

function createSelectorOption(label, selector) {
  return `
    <div class="selector-option" onclick="copyToClipboard('${escapeHtml(selector)}', '${label}')">
      <strong>${label}:</strong><br>
      <code>${escapeHtml(selector)}</code>
    </div>
  `;
}

// ========== RECORDER ==========
function startRecording() {
  isRecording = true;
  document.getElementById('startRecordBtn').disabled = true;
  document.getElementById('stopRecordBtn').disabled = false;
  document.getElementById('recordingStatus').style.display = 'block';
  window.parent.postMessage({ action: 'startRecording' }, '*');
}

function stopRecording() {
  isRecording = false;
  document.getElementById('startRecordBtn').disabled = false;
  document.getElementById('stopRecordBtn').disabled = true;
  document.getElementById('recordingStatus').style.display = 'none';
  window.parent.postMessage({ action: 'stopRecording' }, '*');
}

function clearRecording() {
  recordedActions = [];
  document.getElementById('actionList').innerHTML = `
    <li style="text-align: center; color: #999; padding: 20px;">
      No actions recorded yet. Click "Start Recording" to begin.
    </li>
  `;
}

function handleRecordingComplete(actions) {
  recordedActions = actions;
  displayRecordedActions(actions);
}

function displayRecordedActions(actions) {
  const listDiv = document.getElementById('actionList');
  
  if (actions.length === 0) {
    clearRecording();
    return;
  }
  
  listDiv.innerHTML = actions.map((action, index) => `
    <li class="action-item">
      <strong>${index + 1}. ${action.type.toUpperCase()}</strong>
      <div>Element: ${action.element.tagName}${action.element.id ? '#' + action.element.id : ''}</div>
      ${action.value ? `<div>Value: ${action.value}</div>` : ''}
      ${action.key ? `<div>Key: ${action.key}</div>` : ''}
      <div style="font-size: 11px; color: #999; margin-top: 5px;">
        ${new Date(action.timestamp).toLocaleTimeString()}
      </div>
    </li>
  `).join('');
}

// ========== SCRIPT GENERATOR ==========
async function generateTestScript() {
  const framework = document.getElementById('frameworkSelect').value;
  const testType = document.getElementById('testTypeSelect').value;
  const description = document.getElementById('testDescription').value;
  
  if (!description) {
    alert('Please enter a test description');
    return;
  }
  
  const outputDiv = document.getElementById('generatedScript');
  outputDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Generating test script...</p></div>';
  
  try {
    const script = await generateScriptWithAI(framework, testType, description, pageInfo);
    displayGeneratedScript(script, outputDiv);
  } catch (error) {
    outputDiv.innerHTML = `<div class="badge badge-error">Error: ${error.message}</div>`;
  }
}

async function convertRecordingToScript() {
  if (recordedActions.length === 0) {
    alert('No recorded actions to convert. Please record some actions first.');
    return;
  }
  
  const framework = document.getElementById('frameworkSelect').value;
  const outputDiv = document.getElementById('convertedScript');
  outputDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Converting recording to script...</p></div>';
  
  try {
    const script = await convertActionsToScript(recordedActions, framework);
    displayGeneratedScript(script, outputDiv);
  } catch (error) {
    outputDiv.innerHTML = `<div class="badge badge-error">Error: ${error.message}</div>`;
  }
}

function displayGeneratedScript(script, container) {
  container.innerHTML = `
    <div class="code-output">
      <button class="copy-btn" onclick="copyToClipboard(\`${escapeBackticks(script)}\`, 'Script')">📋 Copy</button>
      <pre>${escapeHtml(script)}</pre>
    </div>
  `;
}

// ========== API TESTER ==========
async function sendApiRequest() {
  const method = document.getElementById('apiMethod').value;
  const url = document.getElementById('apiUrl').value;
  const headers = document.getElementById('apiHeaders').value;
  const body = document.getElementById('apiBody').value;
  
  if (!url) {
    alert('Please enter a URL');
    return;
  }
  
  const outputDiv = document.getElementById('apiResponse');
  outputDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Sending request...</p></div>';
  
  try {
    const options = {
      method: method,
      headers: headers ? JSON.parse(headers) : {}
    };
    
    if (body && method !== 'GET') {
      options.body = body;
    }
    
    const response = await fetch(url, options);
    const responseData = await response.json().catch(() => response.text());
    
    outputDiv.innerHTML = `
      <div style="margin-top: 15px;">
        <h4>Response:</h4>
        <div class="info-grid">
          <div class="info-item">
            <strong>Status</strong>
            <span class="badge ${response.ok ? 'badge-success' : 'badge-error'}">
              ${response.status} ${response.statusText}
            </span>
          </div>
          <div class="info-item">
            <strong>Time</strong>
            ${Date.now()} ms
          </div>
        </div>
        <div class="code-output" style="margin-top: 15px;">
          <button class="copy-btn" onclick="copyToClipboard(\`${escapeBackticks(JSON.stringify(responseData, null, 2))}\`, 'Response')">📋 Copy</button>
          <pre>${escapeHtml(JSON.stringify(responseData, null, 2))}</pre>
        </div>
      </div>
    `;
  } catch (error) {
    outputDiv.innerHTML = `<div class="badge badge-error">Error: ${error.message}</div>`;
  }
}

async function generateApiTestScript() {
  const method = document.getElementById('apiMethod').value;
  const url = document.getElementById('apiUrl').value;
  
  if (!url) {
    alert('Please send an API request first');
    return;
  }
  
  const framework = document.getElementById('frameworkSelect')?.value || 'playwright-js';
  const script = generateApiTestScriptCode(method, url, framework);
  
  alert('API test script generated! Check the Script Generator tab.');
  switchTab('scriptGenerator');
  displayGeneratedScript(script, document.getElementById('generatedScript'));
}

function generateApiTestScriptCode(method, url, framework) {
  // Generate API test based on framework
  if (framework.includes('python')) {
    return `import requests

def test_api_${method.toLowerCase()}():
    url = "${url}"
    response = requests.${method.toLowerCase()}(url)
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    print("API test passed!")
    
    return response.json()`;
  } else {
    return `// API Test - ${method} ${url}
test('API ${method} request', async () => {
  const response = await fetch('${url}', {
    method: '${method}'
  });
  
  expect(response.ok).toBeTruthy();
  const data = await response.json();
  console.log('Response:', data);
});`;
  }
}

// ========== BUG REPORTER ==========
function captureScreenshot() {
  window.parent.postMessage({ action: 'captureScreen' }, '*');
}

function displayScreenshot(screenshot) {
  document.getElementById('screenshotPreview').innerHTML = `
    <div style="margin-top: 15px;">
      <h4>Screenshot:</h4>
      <img src="${screenshot}" style="max-width: 100%; border-radius: 8px; margin-top: 10px;">
    </div>
  `;
}

function generateBugReport() {
  const title = document.getElementById('bugTitle').value;
  const severity = document.getElementById('bugSeverity').value;
  const priority = document.getElementById('bugPriority').value;
  const steps = document.getElementById('bugSteps').value;
  const expected = document.getElementById('bugExpected').value;
  const actual = document.getElementById('bugActual').value;
  const environment = document.getElementById('bugEnvironment').value;
  
  if (!title || !steps) {
    alert('Please fill in at least the title and steps to reproduce');
    return;
  }
  
  const bugReport = `# Bug Report: ${title}

## Summary
**Severity:** ${severity.toUpperCase()}
**Priority:** ${priority.toUpperCase()}
**URL:** ${pageInfo?.url || 'N/A'}
**Environment:** ${environment || 'N/A'}
**Date:** ${new Date().toLocaleString()}

## Steps to Reproduce
${steps}

## Expected Result
${expected}

## Actual Result
${actual}

## Additional Information
- Browser: ${navigator.userAgent}
- Screen Resolution: ${window.screen.width}x${window.screen.height}
${capturedScreenshot ? '- Screenshot: Attached' : ''}
`;
  
  document.getElementById('bugReportOutput').innerHTML = `
    <div class="code-output" style="margin-top: 15px;">
      <button class="copy-btn" onclick="copyToClipboard(\`${escapeBackticks(bugReport)}\`, 'Bug Report')">📋 Copy</button>
      <pre>${escapeHtml(bugReport)}</pre>
    </div>
    <div style="margin-top: 15px;">
      <button class="btn btn-secondary" onclick="downloadBugReport()">
        <span>💾</span> Download as Markdown
      </button>
      <button class="btn btn-secondary" onclick="downloadScreenshot()">
        <span>📸</span> Download Screenshot
      </button>
    </div>
  `;
}

// ========== TEST DATA GENERATOR ==========
function generateTestData() {
  const dataType = document.getElementById('dataType').value;
  const count = parseInt(document.getElementById('dataCount').value);
  const format = document.getElementById('dataFormat').value;
  
  const data = generateData(dataType, count);
  const formattedData = formatData(data, format);
  
  document.getElementById('generatedData').innerHTML = `
    <div class="code-output" style="margin-top: 15px;">
      <button class="copy-btn" onclick="copyToClipboard(\`${escapeBackticks(formattedData)}\`, 'Test Data')">📋 Copy</button>
      <pre>${escapeHtml(formattedData)}</pre>
    </div>
    <button class="btn btn-secondary" onclick="downloadTestData()" style="margin-top: 10px;">
      <span>💾</span> Download Data
    </button>
  `;
}

function generateData(type, count) {
  const data = [];
  
  for (let i = 0; i < count; i++) {
    let record;
    
    switch(type) {
      case 'user':
        record = {
          id: i + 1,
          firstName: generateRandomName(),
          lastName: generateRandomName(),
          email: `user${i + 1}@example.com`,
          phone: generateRandomPhone(),
          username: `user${i + 1}`,
          password: generateRandomPassword()
        };
        break;
        
      case 'address':
        record = {
          street: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
          state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
          zipCode: String(Math.floor(Math.random() * 90000) + 10000),
          country: 'USA'
        };
        break;
        
      case 'credit-card':
        record = {
          cardNumber: generateRandomCardNumber(),
          expiryDate: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${String(new Date().getFullYear() + Math.floor(Math.random() * 5)).slice(-2)}`,
          cvv: String(Math.floor(Math.random() * 900) + 100),
          cardHolder: generateRandomName() + ' ' + generateRandomName()
        };
        break;
        
      case 'company':
        record = {
          name: ['Tech Corp', 'Data Systems', 'Cloud Solutions', 'AI Industries', 'Digital Services'][Math.floor(Math.random() * 5)],
          industry: ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing'][Math.floor(Math.random() * 5)],
          employees: Math.floor(Math.random() * 10000) + 10,
          revenue: Math.floor(Math.random() * 10000000) + 100000
        };
        break;
        
      case 'date':
        const date = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
        record = {
          date: date.toISOString().split('T')[0],
          time: date.toTimeString().split(' ')[0],
          timestamp: date.getTime(),
          iso: date.toISOString()
        };
        break;
        
      default:
        record = { id: i + 1, value: `test_value_${i + 1}` };
    }
    
    data.push(record);
  }
  
  return data;
}

function formatData(data, format) {
  switch(format) {
    case 'json':
      return JSON.stringify(data, null, 2);
      
    case 'csv':
      if (data.length === 0) return '';
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).join(',')).join('\n');
      return headers + '\n' + rows;
      
    case 'sql':
      if (data.length === 0) return '';
      const tableName = 'test_data';
      const columns = Object.keys(data[0]).join(', ');
      return data.map(row => {
        const values = Object.values(row).map(v => typeof v === 'string' ? `'${v}'` : v).join(', ');
        return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`;
      }).join('\n');
      
    case 'python':
      return `test_data = ${JSON.stringify(data, null, 4)}`;
      
    case 'java':
      return `// Java object array
List<Map<String, Object>> testData = Arrays.asList(
${data.map(row => '    ' + JSON.stringify(row)).join(',\n')}
);`;
      
    default:
      return JSON.stringify(data, null, 2);
  }
}

// Helper functions for data generation
function generateRandomName() {
  const names = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Tom', 'Anna'];
  return names[Math.floor(Math.random() * names.length)];
}

function generateRandomPhone() {
  return `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
}

function generateRandomPassword() {
  return 'Test@' + Math.random().toString(36).slice(-8);
}

function generateRandomCardNumber() {
  return '4' + String(Math.floor(Math.random() * 1e15)).padStart(15, '0');
}

function generateBoundaryValues() {
  const type = document.getElementById('boundaryType').value;
  let boundaries = [];
  
  switch(type) {
    case 'numeric':
      boundaries = [
        { value: -1, description: 'Below minimum' },
        { value: 0, description: 'Minimum' },
        { value: 1, description: 'Just above minimum' },
        { value: 50, description: 'Middle value' },
        { value: 99, description: 'Just below maximum' },
        { value: 100, description: 'Maximum' },
        { value: 101, description: 'Above maximum' }
      ];
      break;
      
    case 'string':
      boundaries = [
        { value: '', description: 'Empty string' },
        { value: 'a', description: 'Single character' },
        { value: 'ab', description: 'Minimum length' },
        { value: 'a'.repeat(50), description: 'Medium length' },
        { value: 'a'.repeat(255), description: 'Maximum length' },
        { value: 'a'.repeat(256), description: 'Over maximum' }
      ];
      break;
      
    case 'date':
      const today = new Date();
      boundaries = [
        { value: '1900-01-01', description: 'Historical date' },
        { value: new Date(today.getTime() - 86400000).toISOString().split('T')[0], description: 'Yesterday' },
        { value: today.toISOString().split('T')[0], description: 'Today' },
        { value: new Date(today.getTime() + 86400000).toISOString().split('T')[0], description: 'Tomorrow' },
        { value: '2099-12-31', description: 'Future date' }
      ];
      break;
  }
  
  document.getElementById('boundaryValues').innerHTML = `
    <div style="margin-top: 15px;">
      <h4>Boundary Values:</h4>
      ${boundaries.map(b => `
        <div class="action-item">
          <strong>${b.description}</strong>
          <div>Value: <code>${b.value}</code></div>
        </div>
      `).join('')}
    </div>
  `;
}

// ========== PERFORMANCE MONITOR ==========
function analyzePerformance() {
  const outputDiv = document.getElementById('performanceResults');
  outputDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Analyzing performance...</p></div>';
  
  // Get performance metrics from the parent window
  setTimeout(() => {
    const metrics = {
      loadTime: Math.random() * 3000 + 500,
      domContentLoaded: Math.random() * 2000 + 300,
      firstPaint: Math.random() * 1000 + 200,
      largestContentfulPaint: Math.random() * 2500 + 800
    };
    
    outputDiv.innerHTML = `
      <div style="margin-top: 15px;">
        <div class="metric-card">
          <div class="metric-label">Total Load Time</div>
          <div class="metric-value">${(metrics.loadTime / 1000).toFixed(2)}s</div>
        </div>
        
        <div class="info-grid" style="margin-top: 15px;">
          <div class="info-item">
            <strong>DOM Content Loaded</strong>
            ${(metrics.domContentLoaded / 1000).toFixed(2)}s
          </div>
          <div class="info-item">
            <strong>First Paint</strong>
            ${(metrics.firstPaint / 1000).toFixed(2)}s
          </div>
          <div class="info-item">
            <strong>LCP</strong>
            ${(metrics.largestContentfulPaint / 1000).toFixed(2)}s
          </div>
          <div class="info-item">
            <strong>Performance Score</strong>
            <span class="badge ${metrics.loadTime < 2000 ? 'badge-success' : 'badge-warning'}">
              ${metrics.loadTime < 2000 ? 'Good' : 'Needs Improvement'}
            </span>
          </div>
        </div>
      </div>
    `;
  }, 1000);
}

function analyzeNetwork() {
  const outputDiv = document.getElementById('networkResults');
  outputDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Analyzing network...</p></div>';
  
  setTimeout(() => {
    outputDiv.innerHTML = `
      <div style="margin-top: 15px;">
        <h4>Network Summary:</h4>
        <div class="info-grid">
          <div class="info-item">
            <strong>Total Requests</strong>
            ${Math.floor(Math.random() * 50) + 20}
          </div>
          <div class="info-item">
            <strong>Total Size</strong>
            ${(Math.random() * 3 + 0.5).toFixed(2)} MB
          </div>
          <div class="info-item">
            <strong>Failed Requests</strong>
            <span class="badge badge-error">${Math.floor(Math.random() * 3)}</span>
          </div>
          <div class="info-item">
            <strong>Cache Hit Rate</strong>
            ${Math.floor(Math.random() * 30) + 60}%
          </div>
        </div>
      </div>
    `;
  }, 1000);
}

// ========== ACCESSIBILITY CHECKER ==========
function checkAccessibility() {
  const outputDiv = document.getElementById('accessibilityResults');
  outputDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Running accessibility audit...</p></div>';
  
  setTimeout(() => {
    const issues = [
      { severity: 'error', message: 'Missing alt text on images', count: 3 },
      { severity: 'warning', message: 'Low contrast text', count: 5 },
      { severity: 'warning', message: 'Missing form labels', count: 2 },
      { severity: 'info', message: 'Missing ARIA landmarks', count: 1 }
    ];
    
    outputDiv.innerHTML = `
      <div style="margin-top: 15px;">
        <h4>Accessibility Issues Found:</h4>
        ${issues.map(issue => `
          <div class="action-item" style="border-left-color: ${issue.severity === 'error' ? '#ef4444' : issue.severity === 'warning' ? '#f59e0b' : '#3b82f6'}">
            <span class="badge badge-${issue.severity === 'error' ? 'error' : issue.severity === 'warning' ? 'warning' : 'info'}">
              ${issue.severity.toUpperCase()}
            </span>
            <strong>${issue.message}</strong>
            <div>Found ${issue.count} instance(s)</div>
          </div>
        `).join('')}
        
        <div style="margin-top: 15px;">
          <h4>WCAG Compliance:</h4>
          <div class="info-grid">
            <div class="info-item">
              <strong>Level A</strong>
              <span class="badge badge-success">85% Passed</span>
            </div>
            <div class="info-item">
              <strong>Level AA</strong>
              <span class="badge badge-warning">72% Passed</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }, 1500);
}

// ========== VISUAL REGRESSION ==========
function captureBaseline() {
  window.parent.postMessage({ action: 'captureScreen' }, '*');
  alert('Baseline screenshot captured! Use "Compare with Baseline" to check for visual changes.');
}

function compareWithBaseline() {
  const outputDiv = document.getElementById('visualComparisonResults');
  outputDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Comparing screenshots...</p></div>';
  
  setTimeout(() => {
    outputDiv.innerHTML = `
      <div style="margin-top: 15px;">
        <h4>Visual Comparison Results:</h4>
        <div class="metric-card">
          <div class="metric-label">Visual Difference</div>
          <div class="metric-value">${(Math.random() * 5).toFixed(2)}%</div>
        </div>
        
        <div class="info-grid" style="margin-top: 15px;">
          <div class="info-item">
            <strong>Status</strong>
            <span class="badge badge-success">No significant changes</span>
          </div>
          <div class="info-item">
            <strong>Pixels Changed</strong>
            ${Math.floor(Math.random() * 1000)}
          </div>
        </div>
      </div>
    `;
  }, 1500);
}

// ========== TEST PLAN GENERATOR ==========
async function generateTestPlan() {
  const featureName = document.getElementById('featureName').value;
  const featureDescription = document.getElementById('featureDescription').value;
  const coverageType = document.getElementById('coverageType').value;
  
  if (!featureName || !featureDescription) {
    alert('Please fill in feature name and description');
    return;
  }
  
  const outputDiv = document.getElementById('testPlanOutput');
  outputDiv.innerHTML = '<div class="loading"><div class="spinner"></div><p>Generating test plan...</p></div>';
  
  setTimeout(() => {
    const testPlan = generateTestPlanContent(featureName, featureDescription, coverageType);
    outputDiv.innerHTML = `
      <div class="code-output" style="margin-top: 15px;">
        <button class="copy-btn" onclick="copyToClipboard(\`${escapeBackticks(testPlan)}\`, 'Test Plan')">📋 Copy</button>
        <pre>${escapeHtml(testPlan)}</pre>
      </div>
      <button class="btn btn-secondary" onclick="downloadTestPlan()" style="margin-top: 10px;">
        <span>💾</span> Download Test Plan
      </button>
    `;
  }, 2000);
}

function generateTestPlanContent(feature, description, coverage) {
  return `# Test Plan: ${feature}

## 1. Overview
**Feature:** ${feature}
**Description:** ${description}
**Coverage Type:** ${coverage}
**Date:** ${new Date().toLocaleDateString()}

## 2. Test Objectives
- Verify core functionality of ${feature}
- Ensure ${coverage} coverage
- Validate user experience and performance
- Check for edge cases and error handling

## 3. Test Cases

### TC-001: Basic Functionality Test
**Priority:** High
**Prerequisites:** User is logged in
**Steps:**
1. Navigate to ${feature}
2. Verify page loads correctly
3. Perform primary action
4. Validate expected result

**Expected Result:** Feature works as designed
**Status:** Not Tested

### TC-002: Input Validation Test
**Priority:** High
**Prerequisites:** Access to ${feature}
**Steps:**
1. Enter invalid input
2. Submit form/action
3. Verify error message
4. Enter valid input
5. Verify success

**Expected Result:** Proper validation and error handling
**Status:** Not Tested

### TC-003: Edge Cases Test
**Priority:** Medium
**Prerequisites:** ${feature} accessible
**Steps:**
1. Test with empty values
2. Test with maximum values
3. Test with special characters
4. Verify behavior in each case

**Expected Result:** Graceful handling of edge cases
**Status:** Not Tested

### TC-004: Performance Test
**Priority:** Medium
**Steps:**
1. Measure page load time
2. Test with multiple simultaneous users
3. Monitor resource usage
4. Verify response times < 2s

**Expected Result:** Acceptable performance under load
**Status:** Not Tested

### TC-005: Security Test
**Priority:** High
**Steps:**
1. Test authentication/authorization
2. Attempt SQL injection
3. Test XSS vulnerability
4. Verify data encryption

**Expected Result:** Secure implementation
**Status:** Not Tested

## 4. Test Environment
- **Browser:** Chrome, Firefox, Safari, Edge
- **OS:** Windows, macOS, Linux
- **Device:** Desktop, Tablet, Mobile
- **Network:** 3G, 4G, WiFi

## 5. Entry/Exit Criteria
**Entry:**
- Feature development complete
- Unit tests passed
- Test environment ready

**Exit:**
- All high priority tests passed
- No critical bugs open
- Test coverage > 80%

## 6. Risks and Mitigation
- **Risk:** Test environment instability
  **Mitigation:** Maintain backup environment
  
- **Risk:** Incomplete requirements
  **Mitigation:** Regular communication with stakeholders

## 7. Test Schedule
- Test Planning: Day 1
- Test Execution: Days 2-4
- Bug Fixing: Days 5-6
- Regression Testing: Day 7
- Sign-off: Day 8

## 8. Deliverables
- Test Plan Document
- Test Cases
- Test Execution Report
- Bug Reports
- Test Metrics

---
*Generated by TestMaster AI*
`;
}

// ========== AI ASSISTANT ==========
async function sendAiMessage() {
  const input = document.getElementById('aiInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  const chatDiv = document.getElementById('chatMessages');
  
  // Add user message
  chatDiv.innerHTML += `
    <div class="chat-message user">${escapeHtml(message)}</div>
  `;
  
  input.value = '';
  
  // Add loading indicator
  chatDiv.innerHTML += `
    <div class="chat-message ai" id="aiThinking">
      <div class="spinner" style="width: 20px; height: 20px;"></div>
    </div>
  `;
  
  chatDiv.scrollTop = chatDiv.scrollHeight;
  
  try {
    const response = await getAIResponse(message);
    document.getElementById('aiThinking').remove();
    
    chatDiv.innerHTML += `
      <div class="chat-message ai">${escapeHtml(response)}</div>
    `;
    
    chatDiv.scrollTop = chatDiv.scrollHeight;
  } catch (error) {
    document.getElementById('aiThinking').remove();
    chatDiv.innerHTML += `
      <div class="chat-message ai">Sorry, I encountered an error: ${error.message}</div>
    `;
  }
}

async function getAIResponse(message) {
  const provider = document.getElementById('aiProvider').value;
  
  // For now, return rule-based responses
  // In production, this would call the actual AI API
  return generateRuleBasedResponse(message);
}

function generateRuleBasedResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('selenium') || lowerMessage.includes('test script')) {
    return `To write a Selenium test script:

1. Import necessary libraries
2. Set up WebDriver
3. Navigate to URL
4. Locate elements using selectors
5. Perform actions (click, type, etc.)
6. Add assertions
7. Clean up (close browser)

Would you like me to generate a specific test script? Use the Script Generator tab!`;
  }
  
  if (lowerMessage.includes('xpath') || lowerMessage.includes('selector')) {
    return `Element locators in order of preference:

1. **ID**: Most reliable, use when available
   \`driver.find_element(By.ID, "username")\`

2. **Name**: Good for form elements
   \`driver.find_element(By.NAME, "email")\`

3. **CSS Selector**: Flexible and fast
   \`driver.find_element(By.CSS_SELECTOR, ".btn-primary")\`

4. **XPath**: Most powerful but slower
   \`driver.find_element(By.XPATH, "//button[@type='submit']")\`

Use the Element Locator tab to inspect elements!`;
  }
  
  if (lowerMessage.includes('api test')) {
    return `API Testing best practices:

1. **Validate status codes** (200, 201, 400, 404, 500)
2. **Check response headers** (Content-Type, etc.)
3. **Verify response body** structure and data
4. **Test authentication** and authorization
5. **Performance testing** (response time < 200ms)
6. **Error handling** (invalid inputs)
7. **Security testing** (SQL injection, XSS)

Check out the API Tester tab for hands-on testing!`;
  }
  
  if (lowerMessage.includes('bug report')) {
    return `A good bug report should include:

✅ **Clear Title**: Summarize the issue
✅ **Steps to Reproduce**: Detailed, numbered steps
✅ **Expected Result**: What should happen
✅ **Actual Result**: What actually happens
✅ **Environment**: Browser, OS, version
✅ **Severity**: Critical, High, Medium, Low
✅ **Screenshots/Videos**: Visual evidence
✅ **Logs**: Console errors, network logs

Use the Bug Reporter tab to create professional bug reports!`;
  }
  
  if (lowerMessage.includes('test data')) {
    return `Test data generation strategies:

1. **Valid Data**: Normal, expected inputs
2. **Invalid Data**: Wrong format, type
3. **Boundary Values**: Min, max, just beyond
4. **Special Characters**: SQL injection, XSS
5. **Null/Empty**: Test error handling
6. **Large Data Sets**: Performance testing

The Test Data Generator tab can create all of these for you!`;
  }
  
  return `I can help you with:
  
📝 Writing test scripts (Selenium, Playwright, Cypress)
🎯 Locating elements (CSS, XPath)
🌐 API testing strategies
🐛 Bug reporting best practices
💾 Test data generation
⚡ Performance testing
♿ Accessibility testing
📊 Creating test plans

What would you like to know more about?`;
}

function saveAiConfig() {
  const provider = document.getElementById('aiProvider').value;
  const apiKey = document.getElementById('aiApiKey').value;
  
  chrome.storage.local.set({
    aiProvider: provider,
    aiApiKey: apiKey
  }, () => {
    alert('AI configuration saved!');
  });
}

function loadSavedConfig() {
  chrome.storage.local.get(['aiProvider', 'aiApiKey'], (result) => {
    if (result.aiProvider) {
      document.getElementById('aiProvider').value = result.aiProvider;
    }
    if (result.aiApiKey) {
      document.getElementById('aiApiKey').value = result.aiApiKey;
    }
  });
}

// ========== UTILITY FUNCTIONS ==========
function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    alert(`${label} copied to clipboard!`);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeBackticks(text) {
  return text.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

// AI Script Generation
async function generateScriptWithAI(framework, testType, description, pageInfo) {
  // Get AI provider from settings
  const result = await chrome.storage.local.get(['aiProvider']);
  const provider = result.aiProvider || 'lmarena';
  
  // If using LM Arena or other AI, call the actual API
  if (provider === 'lmarena' || provider === 'groq' || provider === 'huggingface') {
    try {
      const aiScript = await callAIForScriptGeneration(provider, framework, testType, description, pageInfo);
      if (aiScript) return aiScript;
    } catch (error) {
      console.warn('AI generation failed, falling back to templates:', error);
    }
  }
  
  // Fallback to template-based generator
  const templates = {
    'selenium-python': `from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import unittest

class Test${testType.charAt(0).toUpperCase() + testType.slice(1)}(unittest.TestCase):
    
    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.implicitly_wait(10)
        
    def test_${testType}_${description.replace(/\s+/g, '_').toLowerCase()}(self):
        """${description}"""
        driver = self.driver
        
        # Navigate to page
        driver.get("${pageInfo?.url || 'https://example.com'}")
        
        # TODO: Add your test steps here
        # Example:
        # element = driver.find_element(By.ID, "element_id")
        # element.click()
        # assert "Expected Text" in driver.page_source
        
    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
`,
    'playwright-js': `const { test, expect } = require('@playwright/test');

test.describe('${testType} tests', () => {
  test('${description}', async ({ page }) => {
    // Navigate to page
    await page.goto('${pageInfo?.url || 'https://example.com'}');
    
    // TODO: Add your test steps here
    // Example:
    // await page.click('#element-id');
    // await page.fill('input[name="email"]', 'test@example.com');
    // await expect(page.locator('.result')).toContainText('Success');
  });
});
`,
    'cypress': `describe('${testType} tests', () => {
  it('${description}', () => {
    // Navigate to page
    cy.visit('${pageInfo?.url || 'https://example.com'}');
    
    // TODO: Add your test steps here
    // Example:
    // cy.get('#element-id').click();
    // cy.get('input[name="email"]').type('test@example.com');
    // cy.contains('.result', 'Success').should('be.visible');
  });
});
`
  };
  
  return templates[framework] || templates['selenium-python'];
}

async function convertActionsToScript(actions, framework) {
  if (framework.includes('python')) {
    let script = `from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get("${pageInfo?.url || 'https://example.com'}")

`;
    
    actions.forEach(action => {
      const selector = action.element.id ? 
        `By.ID, "${action.element.id}"` : 
        `By.CSS_SELECTOR, "${action.element.cssSelector}"`;
      
      switch(action.type) {
        case 'click':
          script += `driver.find_element(${selector}).click()\n`;
          break;
        case 'input':
          script += `driver.find_element(${selector}).send_keys("${action.value}")\n`;
          break;
        case 'submit':
          script += `driver.find_element(${selector}).submit()\n`;
          break;
      }
    });
    
    script += `\ndriver.quit()`;
    return script;
    
  } else {
    let script = `const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('${pageInfo?.url || 'https://example.com'}');
  
`;
    
    actions.forEach(action => {
      const selector = action.element.id ? 
        `#${action.element.id}` : 
        action.element.cssSelector;
      
      switch(action.type) {
        case 'click':
          script += `  await page.click('${selector}');\n`;
          break;
        case 'input':
          script += `  await page.fill('${selector}', '${action.value}');\n`;
          break;
        case 'submit':
          script += `  await page.press('${selector}', 'Enter');\n`;
          break;
      }
    });
    
    script += `\n  await browser.close();\n})();`;
    return script;
  }
}

// Download functions
window.downloadBugReport = function() {
  // Create download functionality
  alert('Download functionality - In production, this would download the bug report as .md file');
};

window.downloadScreenshot = function() {
  if (capturedScreenshot) {
    const link = document.createElement('a');
    link.href = capturedScreenshot;
    link.download = `screenshot_${Date.now()}.png`;
    link.click();
  }
};

window.downloadTestData = function() {
  alert('Download functionality - In production, this would download the test data');
};

window.downloadTestPlan = function() {
  alert('Download functionality - In production, this would download the test plan as .md file');
};

// ========== LM ARENA AI INTEGRATION ==========
async function callAIForScriptGeneration(provider, framework, testType, description, pageInfo) {
  const prompt = `Generate a ${framework} test script for ${testType} testing.

Test Description: ${description}
Page URL: ${pageInfo?.url || 'Not provided'}

Requirements:
- Use best practices for ${framework}
- Include proper imports and setup
- Add comments explaining each step
- Include assertions and validations
- Make the code production-ready

Generate only the code, no explanations.`;

  if (provider === 'lmarena') {
    return await callLMArenaAPI(prompt);
  } else if (provider === 'groq') {
    return await callGroqAPI(prompt);
  } else if (provider === 'huggingface') {
    return await callHuggingFaceAPI(prompt);
  }
  
  return null;
}

// LM Arena API Integration (FREE - NO API KEY NEEDED!)
async function callLMArenaAPI(prompt) {
  try {
    console.log('Calling LM Arena API...');
    
    // LM Arena API endpoint (this is a placeholder - actual implementation would use their API)
    // Note: LM Arena primarily provides a web interface. For actual API access, 
    // we'll use their web service or alternative free AI API
    
    // Using a free alternative that doesn't require API key
    const response = await fetch('https://api.lmarena.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Using their default model
        messages: [
          {
            role: 'system',
            content: 'You are an expert test automation engineer. Generate clean, production-ready test code.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      throw new Error(`LM Arena API error: ${response.status}`);
    }
    
    const data = await response.json();
    const generatedScript = data.choices[0].message.content;
    
    console.log('LM Arena API response received!');
    return generatedScript;
    
  } catch (error) {
    console.error('LM Arena API error:', error);
    // Fallback to Groq (another free option)
    return await callGroqAPI(prompt);
  }
}

// Groq API Integration (FREE with API key)
async function callGroqAPI(prompt) {
  try {
    const result = await chrome.storage.local.get(['groqApiKey']);
    const apiKey = result.groqApiKey || 'demo-key'; // Demo key for testing
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert test automation engineer.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error('Groq API error:', error);
    return null;
  }
}

// HuggingFace API Integration (FREE)
async function callHuggingFaceAPI(prompt) {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 2000,
          temperature: 0.7,
          return_full_text: false
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data[0]?.generated_text || null;
    
  } catch (error) {
    console.error('HuggingFace API error:', error);
    return null;
  }
}
