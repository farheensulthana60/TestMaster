# 🚀 Quick Setup Guide

## Installation Steps (5 Minutes)

### Step 1: Create Extension Icons

Since we need icons for Chrome, let's create simple ones:

#### Option A: Use Online Tool (Easiest)
1. Go to https://www.favicon-generator.org/
2. Type "TM" or "TestMaster" 
3. Click "Create Favicon"
4. Download the generated icons
5. Rename and copy to `icons/` folder:
   - `favicon-16x16.png` → `icon16.png`
   - `favicon-32x32.png` → `icon48.png`
   - `android-icon-144x144.png` → `icon128.png`

#### Option B: Use PowerShell Script (Quick)
Run this PowerShell script to create basic colored icons:

```powershell
# Navigate to the extension directory
cd C:\TestMaster-AI-Extension\icons

# Create a simple HTML file to generate canvas-based icons
@'
<!DOCTYPE html>
<html>
<body>
<canvas id="canvas16" width="16" height="16"></canvas>
<canvas id="canvas48" width="48" height="48"></canvas>
<canvas id="canvas128" width="128" height="128"></canvas>
<script>
function createIcon(size, canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // White "TM" text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TM', size/2, size/2);
    
    // Download
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `icon${size}.png`;
        a.click();
    });
}
createIcon(16, 'canvas16');
createIcon(48, 'canvas48');
createIcon(128, 'canvas128');
</script>
</body>
</html>
'@ | Out-File -FilePath "generate_icons.html"

# Open in browser
Start-Process "generate_icons.html"
```

Then click the download buttons in the browser to save icons to the `icons/` folder.

#### Option C: Use Any Image (Simplest)
1. Find any PNG image (company logo, test icon, etc.)
2. Resize to 16x16, 48x48, and 128x128 pixels
3. Name them `icon16.png`, `icon48.png`, `icon128.png`
4. Copy to the `icons/` folder

### Step 2: Load Extension in Chrome

1. **Open Chrome Extensions Page**:
   ```
   chrome://extensions/
   ```
   Or: Click ⋮ (menu) → More tools → Extensions

2. **Enable Developer Mode**:
   - Toggle the switch in the top-right corner

3. **Load Unpacked Extension**:
   - Click "Load unpacked" button
   - Navigate to `C:\TestMaster-AI-Extension`
   - Click "Select Folder"

4. **Verify Installation**:
   - You should see "TestMaster AI" in your extensions list
   - Status should show as "Enabled"

5. **Pin to Toolbar**:
   - Click the puzzle icon 🧩 in Chrome toolbar
   - Find "TestMaster AI"
   - Click the pin 📌 icon

### Step 3: Test the Extension

1. **Navigate to any website** (e.g., https://www.google.com)

2. **Click the TestMaster AI icon** in your toolbar

3. **Try Quick Actions**:
   - Click "🔍 Inspect" - then click any element on the page
   - Click "🚀 Open Full Testing Dashboard"
   - Explore all the tabs!

---

## 🎓 First-Time Usage Tutorial

### Tutorial 1: Inspect an Element (1 minute)

1. Go to https://www.google.com
2. Click TestMaster AI icon
3. Click "Inspect Element on Page"
4. Hover over the Google search box
5. Click it
6. See all selectors and properties!
7. Click any selector to copy it

### Tutorial 2: Record a Test (2 minutes)

1. Click TestMaster AI icon
2. Click "Start Recording" (red button)
3. Perform actions on the webpage:
   - Type in search box
   - Click a button
   - Navigate to another page
4. Click "Stop Recording"
5. See all recorded actions
6. Go to "Script Generator" tab
7. Click "Convert Last Recording"
8. Get your test script!

### Tutorial 3: Generate Test Data (1 minute)

1. Open TestMaster AI
2. Go to "Test Data" tab
3. Select "User Data"
4. Enter "10" for number of records
5. Choose "JSON" format
6. Click "Generate Test Data"
7. Copy the generated data!

### Tutorial 4: Test an API (2 minutes)

1. Go to "API Testing" tab
2. Enter URL: `https://jsonplaceholder.typicode.com/posts/1`
3. Keep method as "GET"
4. Click "Send Request"
5. See the response!
6. Click "Generate API Test Script" for code

### Tutorial 5: Ask AI Assistant (1 minute)

1. Go to "AI Assistant" tab
2. Type: "How do I write a Selenium test?"
3. Click "Send" or press Ctrl+Enter
4. Get instant help!

---

## ⚙️ Optional: Configure AI (FREE)

### Option 1: Ollama (Local AI - Best for Privacy)

1. **Download Ollama**:
   - Visit: https://ollama.ai/download
   - Or use winget: `winget install Ollama.Ollama`

2. **Install a Model**:
   ```powershell
   ollama pull llama2
   ```
   Or for better coding help:
   ```powershell
   ollama pull codellama
   ```

3. **Start Ollama**:
   ```powershell
   ollama serve
   ```

4. **Configure Extension**:
   - Open TestMaster AI
   - Go to "AI Assistant" tab
   - Select "Ollama (Local - Free)"
   - Save configuration

5. **Test It**:
   - Ask: "Write a Selenium test for login"
   - Get AI-generated code!

### Option 2: Groq API (Cloud - Fast & Free)

1. **Sign Up**:
   - Visit: https://console.groq.com
   - Create free account

2. **Get API Key**:
   - Go to API Keys section
   - Click "Create API Key"
   - Copy the key

3. **Configure Extension**:
   - Open TestMaster AI
   - Go to "AI Assistant" tab
   - Select "Groq (Cloud - Free API)"
   - Paste your API key
   - Save configuration

4. **Start Using**:
   - Ask questions
   - Generate code
   - Get instant responses!

---

## 🐛 Troubleshooting

### Extension Won't Load
- **Check manifest.json**: Make sure it's valid JSON
- **Check icons**: Ensure icon files exist in `icons/` folder
- **Check console**: Open Chrome DevTools for error messages

### Icons Not Showing
- **Solution 1**: Use any PNG images as placeholders
- **Solution 2**: Remove icon references from manifest.json temporarily
- **Solution 3**: Download icons from favicon generator

### Content Script Not Injecting
- **Reload extension**: Toggle off/on in chrome://extensions
- **Reload page**: Refresh the webpage you're testing
- **Check permissions**: Ensure "Access your data on all sites" is enabled

### AI Not Responding
- **Rule-based responses work**: By default, uses pre-programmed responses
- **For real AI**: Configure Ollama or Groq as described above
- **Check API key**: Verify it's correct and has credits

### Recording Not Working
- **Click Start Recording**: Make sure recording is active
- **Interact with page**: Perform some actions
- **Stop Recording**: Click stop before viewing results
- **Check console**: Look for JavaScript errors

---

## 📊 Testing Your Installation

Run this checklist to verify everything works:

- [ ] Extension loads without errors
- [ ] Icon appears in toolbar
- [ ] Popup opens when clicking icon
- [ ] Sidebar opens on webpage
- [ ] All tabs are visible
- [ ] Element inspector works
- [ ] Recording captures actions
- [ ] Script generator produces code
- [ ] Test data generator works
- [ ] API tester sends requests
- [ ] Bug reporter creates reports
- [ ] AI assistant responds

If all checkboxes pass: **✅ Installation Successful!**

---

## 🎯 Next Steps

1. **Bookmark Common Sites**: Add testing websites to bookmarks
2. **Create Shortcuts**: Set up keyboard shortcuts in Chrome
3. **Explore Features**: Try each tab to see what it can do
4. **Read Docs**: Check README.md for detailed feature descriptions
5. **Customize**: Modify code to fit your workflow
6. **Share**: Tell your team about TestMaster AI!

---

## 💡 Pro Tips

1. **Use Keyboard Shortcuts**: Faster than clicking
   - Set them up in: `chrome://extensions/shortcuts`

2. **Context Menu**: Right-click on page for quick access
   - Inspect element
   - Start recording
   - Generate script

3. **Save Recordings**: Keep frequently used test flows
   - Export as test scripts
   - Use as templates

4. **Test Data Templates**: Save common data schemas
   - Create presets for your application
   - Generate consistent test data

5. **Bug Report Templates**: Create templates
   - Save time on repetitive reporting
   - Ensure consistency

---

## 🔄 Updating the Extension

When new features are added:

1. **Pull latest code**:
   ```powershell
   cd C:\TestMaster-AI-Extension
   git pull origin main
   ```

2. **Reload extension**:
   - Go to chrome://extensions/
   - Click the refresh icon ↻ on TestMaster AI card

3. **Test new features**:
   - Check README for what's new
   - Try the updated functionality

---

## 🆘 Getting Help

### Documentation
- **README.md**: Full feature documentation
- **Code Comments**: Inline explanations
- **Examples**: Check sidebar.js for usage examples

### Community
- **GitHub Issues**: Report bugs, request features
- **Stack Overflow**: Tag questions with "testmaster-ai"
- **GitHub Discussions**: Ask questions, share tips

### Self-Help
- **Chrome DevTools**: F12 to inspect extension
- **Extension Console**: Check for errors
- **Network Tab**: Monitor API calls

---

## ✅ Quick Validation

Test everything is working with this 2-minute test:

```
1. Open Google.com
2. Click TestMaster icon → ✅ Popup opens
3. Click "Inspect Element" → ✅ Can select elements
4. Click element on page → ✅ Shows in sidebar
5. View selectors → ✅ Multiple options shown
6. Copy a selector → ✅ Copies to clipboard
7. Start recording → ✅ Recording indicator appears
8. Type in search box → ✅ Action captured
9. Stop recording → ✅ Shows recorded actions
10. Go to Script Generator → ✅ Can convert recording

Result: If all ✅, you're ready to go!
```

---

## 🎉 Congratulations!

You're now ready to use TestMaster AI for all your testing needs!

**Happy Testing!** 🚀

---

*Need help? Open an issue on GitHub or check the README.md*
