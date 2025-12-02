// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('TestMaster AI Extension installed');
  
  // Create context menu
  chrome.contextMenus.create({
    id: 'testmaster-inspect',
    title: 'Inspect with TestMaster AI',
    contexts: ['all']
  });
  
  chrome.contextMenus.create({
    id: 'testmaster-record',
    title: 'Start Recording Test',
    contexts: ['all']
  });
  
  chrome.contextMenus.create({
    id: 'testmaster-generate',
    title: 'Generate Test Script',
    contexts: ['all']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch(info.menuItemId) {
    case 'testmaster-inspect':
      chrome.tabs.sendMessage(tab.id, { action: 'inspectElement' });
      break;
    case 'testmaster-record':
      chrome.tabs.sendMessage(tab.id, { action: 'startRecording' });
      break;
    case 'testmaster-generate':
      chrome.tabs.sendMessage(tab.id, { action: 'openSidebar', tab: 'scriptGenerator' });
      break;
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureScreenshot') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (screenshot) => {
      sendResponse({ screenshot: screenshot });
    });
    return true;
  }
});

// Listen for keyboard shortcuts (if commands are defined in manifest)
if (chrome.commands && chrome.commands.onCommand) {
  chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        switch(command) {
          case 'toggle-sidebar':
            chrome.tabs.sendMessage(tabs[0].id, { action: 'openSidebar' });
            break;
          case 'start-recording':
            chrome.tabs.sendMessage(tabs[0].id, { action: 'startRecording' });
            break;
          case 'inspect-element':
            chrome.tabs.sendMessage(tabs[0].id, { action: 'inspectElement' });
            break;
        }
      }
    });
  });
}
