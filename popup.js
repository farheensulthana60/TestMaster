// Popup controller
document.addEventListener('DOMContentLoaded', function() {
  
  // Open main sidebar
  document.getElementById('openSidebar').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'openSidebar' });
    window.close();
  });

  // Quick Actions
  document.getElementById('startRecording').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'startRecording' });
    updateStatus('Recording started... 🔴');
  });

  document.getElementById('inspectElement').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'inspectElement' });
    updateStatus('Click any element to inspect 🔍');
    window.close();
  });

  document.getElementById('captureScreen').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'captureScreen' });
    updateStatus('Screenshot captured! 📸');
  });

  document.getElementById('generateData').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'openSidebar', tab: 'testData' });
    window.close();
  });

  // Feature buttons
  document.getElementById('elementLocator').addEventListener('click', openFeature('elementLocator'));
  document.getElementById('scriptGenerator').addEventListener('click', openFeature('scriptGenerator'));
  document.getElementById('apiTester').addEventListener('click', openFeature('apiTester'));
  document.getElementById('bugReporter').addEventListener('click', openFeature('bugReporter'));
  document.getElementById('testDataGen').addEventListener('click', openFeature('testData'));
  document.getElementById('performanceMonitor').addEventListener('click', openFeature('performance'));
  document.getElementById('accessibilityCheck').addEventListener('click', openFeature('accessibility'));
  document.getElementById('visualRegression').addEventListener('click', openFeature('visualRegression'));
  document.getElementById('testPlanGen').addEventListener('click', openFeature('testPlan'));
  document.getElementById('aiAssistant').addEventListener('click', openFeature('aiAssistant'));

  function openFeature(feature) {
    return async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(tab.id, { action: 'openSidebar', tab: feature });
      window.close();
    };
  }

  function updateStatus(message) {
    document.getElementById('status').textContent = message;
  }

  // Load saved settings
  chrome.storage.local.get(['recordingState'], (result) => {
    if (result.recordingState === 'recording') {
      document.getElementById('startRecording').innerHTML = '<span>⏹️ Stop</span>';
    }
  });
});
