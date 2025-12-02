// Content script - Injected into every page
let sidebar = null;
let isRecording = false;
let recordedActions = [];
let inspectMode = false;
let highlightedElement = null;

// Listen for messages from popup and background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch(request.action) {
    case 'openSidebar':
      openSidebar(request.tab);
      break;
    case 'startRecording':
      toggleRecording();
      break;
    case 'inspectElement':
      toggleInspectMode();
      break;
    case 'captureScreen':
      captureScreenshot();
      break;
  }
  return true;
});

// Create and inject sidebar
function openSidebar(activeTab = 'elementLocator') {
  if (sidebar) {
    sidebar.remove();
    sidebar = null;
    return;
  }

  // Create sidebar iframe
  sidebar = document.createElement('iframe');
  sidebar.id = 'testmaster-sidebar';
  sidebar.src = chrome.runtime.getURL('sidebar.html');
  sidebar.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 450px;
    height: 100%;
    border: none;
    z-index: 2147483647;
    box-shadow: -5px 0 25px rgba(0,0,0,0.3);
    background: white;
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(sidebar);

  // Send active tab info after iframe loads
  sidebar.onload = () => {
    sidebar.contentWindow.postMessage({ 
      action: 'init', 
      activeTab: activeTab,
      pageInfo: getPageInfo()
    }, '*');
  };
}

// Recording functionality
function toggleRecording() {
  isRecording = !isRecording;
  
  if (isRecording) {
    recordedActions = [];
    startRecording();
    showNotification('🔴 Recording started');
  } else {
    stopRecording();
    showNotification('⏹️ Recording stopped');
    // Send recorded actions to sidebar
    if (sidebar) {
      sidebar.contentWindow.postMessage({ 
        action: 'recordingComplete', 
        actions: recordedActions 
      }, '*');
    }
  }
  
  chrome.storage.local.set({ recordingState: isRecording ? 'recording' : 'stopped' });
}

function startRecording() {
  // Record clicks
  document.addEventListener('click', recordClick, true);
  // Record input changes
  document.addEventListener('input', recordInput, true);
  // Record navigation
  document.addEventListener('submit', recordSubmit, true);
  // Record keyboard
  document.addEventListener('keydown', recordKeyPress, true);
}

function stopRecording() {
  document.removeEventListener('click', recordClick, true);
  document.removeEventListener('input', recordInput, true);
  document.removeEventListener('submit', recordSubmit, true);
  document.removeEventListener('keydown', recordKeyPress, true);
}

function recordClick(e) {
  if (e.target.closest('#testmaster-sidebar')) return;
  
  recordedActions.push({
    type: 'click',
    timestamp: Date.now(),
    element: getElementInfo(e.target),
    coordinates: { x: e.clientX, y: e.clientY }
  });
}

function recordInput(e) {
  if (e.target.closest('#testmaster-sidebar')) return;
  
  recordedActions.push({
    type: 'input',
    timestamp: Date.now(),
    element: getElementInfo(e.target),
    value: e.target.value
  });
}

function recordSubmit(e) {
  if (e.target.closest('#testmaster-sidebar')) return;
  
  recordedActions.push({
    type: 'submit',
    timestamp: Date.now(),
    element: getElementInfo(e.target)
  });
}

function recordKeyPress(e) {
  if (e.target.closest('#testmaster-sidebar')) return;
  
  if (e.key === 'Enter' || e.key === 'Tab') {
    recordedActions.push({
      type: 'keypress',
      timestamp: Date.now(),
      key: e.key,
      element: getElementInfo(e.target)
    });
  }
}

// Element inspection mode
function toggleInspectMode() {
  inspectMode = !inspectMode;
  
  if (inspectMode) {
    document.addEventListener('mouseover', highlightElement, true);
    document.addEventListener('click', selectElement, true);
    document.body.style.cursor = 'crosshair';
    showNotification('🔍 Click any element to inspect');
  } else {
    document.removeEventListener('mouseover', highlightElement, true);
    document.removeEventListener('click', selectElement, true);
    document.body.style.cursor = 'default';
    removeHighlight();
  }
}

function highlightElement(e) {
  if (e.target.closest('#testmaster-sidebar')) return;
  
  removeHighlight();
  
  highlightedElement = document.createElement('div');
  const rect = e.target.getBoundingClientRect();
  highlightedElement.style.cssText = `
    position: fixed;
    top: ${rect.top}px;
    left: ${rect.left}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    border: 2px solid #f5576c;
    background: rgba(245, 87, 108, 0.1);
    pointer-events: none;
    z-index: 2147483646;
    box-shadow: 0 0 10px rgba(245, 87, 108, 0.5);
  `;
  document.body.appendChild(highlightedElement);
}

function removeHighlight() {
  if (highlightedElement) {
    highlightedElement.remove();
    highlightedElement = null;
  }
}

function selectElement(e) {
  e.preventDefault();
  e.stopPropagation();
  
  if (e.target.closest('#testmaster-sidebar')) return;
  
  // Turn off inspect mode first
  toggleInspectMode();
  
  const elementInfo = getElementInfo(e.target);
  
  console.log('Element selected:', elementInfo); // Debug log
  
  // Show notification first
  showNotification('✅ Element selected!');
  
  // Send message to sidebar
  const message = { 
    action: 'elementSelected', 
    element: elementInfo 
  };
  
  // Open sidebar with element info
  if (!sidebar) {
    openSidebar('elementLocator');
    // Wait for sidebar to load before sending message
    setTimeout(() => {
      if (sidebar && sidebar.contentWindow) {
        console.log('Sending message to new sidebar:', message); // Debug log
        sidebar.contentWindow.postMessage(message, '*');
      }
    }, 500);
  } else {
    // Sidebar already open, send message immediately
    if (sidebar.contentWindow) {
      console.log('Sending message to existing sidebar:', message); // Debug log
      sidebar.contentWindow.postMessage(message, '*');
    }
  }
}

// Get comprehensive element information
function getElementInfo(element) {
  const rect = element.getBoundingClientRect();
  
  // Get computed styles (convert to plain object for serialization)
  const styles = window.getComputedStyle(element);
  const computedStyles = {
    display: styles.display,
    visibility: styles.visibility,
    opacity: styles.opacity,
    position: styles.position,
    zIndex: styles.zIndex,
    color: styles.color,
    backgroundColor: styles.backgroundColor,
    fontSize: styles.fontSize,
    fontFamily: styles.fontFamily
  };
  
  // Helper function to safely get string values (handles SVG elements)
  const safeGetValue = (value) => {
    if (value === null || value === undefined) return '';
    // Handle SVGAnimatedString objects (common in SVG elements)
    if (typeof value === 'object' && value.baseVal !== undefined) {
      return value.baseVal;
    }
    // Handle SVGAnimatedLength objects
    if (typeof value === 'object' && value.baseVal && value.baseVal.value !== undefined) {
      return value.baseVal.value;
    }
    return String(value);
  };
  
  // Safely extract className (can be SVGAnimatedString in SVG elements)
  let className = '';
  if (element.className) {
    if (typeof element.className === 'string') {
      className = element.className;
    } else if (element.className.baseVal !== undefined) {
      className = element.className.baseVal; // SVG element
    } else {
      className = String(element.className);
    }
  }
  
  // Safely extract href (can be SVGAnimatedString in SVG elements)
  let href = '';
  if (element.href) {
    if (typeof element.href === 'string') {
      href = element.href;
    } else if (element.href.baseVal !== undefined) {
      href = element.href.baseVal; // SVG element
    } else {
      href = String(element.href);
    }
  }
  
  return {
    tagName: element.tagName.toLowerCase(),
    id: safeGetValue(element.id),
    className: className,
    name: safeGetValue(element.name),
    type: safeGetValue(element.type),
    value: safeGetValue(element.value),
    text: element.innerText?.substring(0, 100) || element.textContent?.substring(0, 100) || '',
    href: href,
    src: safeGetValue(element.src),
    alt: safeGetValue(element.alt),
    title: safeGetValue(element.title),
    placeholder: safeGetValue(element.placeholder),
    attributes: Array.from(element.attributes).map(attr => ({
      name: attr.name,
      value: safeGetValue(attr.value)
    })),
    cssSelector: generateCSSSelector(element),
    xpath: generateXPath(element),
    position: {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    },
    isVisible: isElementVisible(element),
    computedStyles: computedStyles,
    parentInfo: element.parentElement ? {
      tagName: element.parentElement.tagName.toLowerCase(),
      id: safeGetValue(element.parentElement.id),
      className: typeof element.parentElement.className === 'string' 
        ? element.parentElement.className 
        : (element.parentElement.className?.baseVal || '')
    } : null
  };
}

// Generate CSS Selector
function generateCSSSelector(element) {
  // Safely get ID (handle SVG elements)
  const safeId = element.id && typeof element.id === 'string' ? element.id : '';
  
  if (safeId) {
    return `#${safeId}`;
  }
  
  const path = [];
  let current = element;
  
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.nodeName.toLowerCase();
    
    const currentId = current.id && typeof current.id === 'string' ? current.id : '';
    
    if (currentId) {
      selector += `#${currentId}`;
      path.unshift(selector);
      break;
    } else {
      let sibling = current;
      let nth = 1;
      
      while (sibling.previousElementSibling) {
        sibling = sibling.previousElementSibling;
        if (sibling.nodeName.toLowerCase() === selector) nth++;
      }
      
      if (nth > 1) selector += `:nth-of-type(${nth})`;
      
      // Safely handle classList (can be different in SVG elements)
      try {
        if (current.classList && current.classList.length > 0) {
          const classes = Array.from(current.classList).filter(c => c && typeof c === 'string');
          if (classes.length > 0) {
            selector += '.' + classes.join('.');
          }
        }
      } catch (e) {
        // classList not available or error accessing it
      }
    }
    
    path.unshift(selector);
    current = current.parentElement;
    
    // Prevent infinite loops
    if (path.length > 10) break;
  }
  
  return path.join(' > ');
}

// Generate XPath
function generateXPath(element) {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }
  
  const paths = [];
  let current = element;
  
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let index = 0;
    let sibling = current.previousSibling;
    
    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === current.nodeName) {
        index++;
      }
      sibling = sibling.previousSibling;
    }
    
    const tagName = current.nodeName.toLowerCase();
    const pathIndex = index > 0 ? `[${index + 1}]` : '';
    paths.unshift(`${tagName}${pathIndex}`);
    
    current = current.parentElement;
  }
  
  return '/' + paths.join('/');
}

// Check if element is visible
function isElementVisible(element) {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0';
}

// Screenshot capture
function captureScreenshot() {
  chrome.runtime.sendMessage({ action: 'captureScreenshot' }, (response) => {
    if (response.screenshot) {
      // Send to sidebar
      if (sidebar) {
        sidebar.contentWindow.postMessage({ 
          action: 'screenshotCaptured', 
          screenshot: response.screenshot 
        }, '*');
      }
      showNotification('📸 Screenshot captured!');
    }
  });
}

// Get page information
function getPageInfo() {
  return {
    url: window.location.href,
    title: document.title,
    domain: window.location.hostname,
    forms: document.forms.length,
    links: document.links.length,
    images: document.images.length,
    scripts: document.scripts.length,
    inputs: document.querySelectorAll('input, textarea, select').length,
    buttons: document.querySelectorAll('button, [type="submit"]').length
  };
}

// Show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    z-index: 2147483647;
    font-family: 'Segoe UI', sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    animation: slideDown 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Listen for messages from sidebar
window.addEventListener('message', (event) => {
  if (event.data.action === 'closeSidebar') {
    if (sidebar) {
      sidebar.remove();
      sidebar = null;
    }
  }
  
  if (event.data.action === 'inspectElement') {
    toggleInspectMode();
  }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
