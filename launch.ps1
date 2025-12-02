# TestMaster AI - Quick Launch Script
# This script helps you package and launch the extension

Write-Host "🚀 TestMaster AI - Quick Launch Helper" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Set the extension directory
$extensionDir = "C:\TestMaster-AI-Extension"

# Function to check if Chrome is installed
function Test-ChromeInstalled {
    $chromePaths = @(
        "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
        "${env:LOCALAPPDATA}\Google\Chrome\Application\chrome.exe"
    )
    
    foreach ($path in $chromePaths) {
        if (Test-Path $path) {
            return $path
        }
    }
    return $null
}

# Check if extension directory exists
if (-not (Test-Path $extensionDir)) {
    Write-Host "❌ Error: Extension directory not found at $extensionDir" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Extension directory found" -ForegroundColor Green

# Check if Chrome is installed
$chromePath = Test-ChromeInstalled
if ($null -eq $chromePath) {
    Write-Host "⚠️  Warning: Google Chrome not found" -ForegroundColor Yellow
    Write-Host "   Please install Chrome from: https://www.google.com/chrome/" -ForegroundColor Yellow
} else {
    Write-Host "✅ Chrome found at: $chromePath" -ForegroundColor Green
}

# Check if icons exist
$iconDir = Join-Path $extensionDir "icons"
$requiredIcons = @("icon16.png", "icon48.png", "icon128.png")
$missingIcons = @()

foreach ($icon in $requiredIcons) {
    $iconPath = Join-Path $iconDir $icon
    if (-not (Test-Path $iconPath)) {
        $missingIcons += $icon
    }
}

if ($missingIcons.Count -eq 0) {
    Write-Host "✅ All icons found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: Missing icons: $($missingIcons -join ', ')" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Available Actions:" -ForegroundColor Cyan
Write-Host "1. Open Chrome Extensions Page" -ForegroundColor White
Write-Host "2. Open Extension Folder" -ForegroundColor White
Write-Host "3. Create ZIP Package for Distribution" -ForegroundColor White
Write-Host "4. View Quick Start Guide" -ForegroundColor White
Write-Host "5. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "📂 Opening Chrome Extensions Page..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Enable 'Developer mode' (toggle in top-right)" -ForegroundColor White
        Write-Host "2. Click 'Load unpacked'" -ForegroundColor White
        Write-Host "3. Select folder: $extensionDir" -ForegroundColor White
        Write-Host "4. Click 'Select Folder'" -ForegroundColor White
        Write-Host ""
        Start-Sleep -Seconds 2
        
        if ($chromePath) {
            Start-Process $chromePath "chrome://extensions/"
        } else {
            Write-Host "Please open Chrome manually and navigate to: chrome://extensions/" -ForegroundColor Yellow
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "📂 Opening Extension Folder..." -ForegroundColor Green
        Start-Process explorer $extensionDir
    }
    
    "3" {
        Write-Host ""
        Write-Host "📦 Creating ZIP Package..." -ForegroundColor Green
        
        $zipPath = Join-Path (Split-Path $extensionDir) "testmaster-ai-v1.0.0.zip"
        
        # Remove old ZIP if exists
        if (Test-Path $zipPath) {
            Remove-Item $zipPath -Force
        }
        
        # Create ZIP
        try {
            Compress-Archive -Path "$extensionDir\*" -DestinationPath $zipPath -Force
            Write-Host "✅ ZIP created successfully!" -ForegroundColor Green
            Write-Host "   Location: $zipPath" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "You can now:" -ForegroundColor Yellow
            Write-Host "- Upload to Chrome Web Store" -ForegroundColor White
            Write-Host "- Share with others" -ForegroundColor White
            Write-Host "- Upload to GitHub" -ForegroundColor White
            Write-Host ""
            
            # Ask if user wants to open the folder
            $openFolder = Read-Host "Open folder containing ZIP? (Y/N)"
            if ($openFolder -eq "Y" -or $openFolder -eq "y") {
                Start-Process explorer (Split-Path $zipPath)
            }
        } catch {
            Write-Host "❌ Error creating ZIP: $_" -ForegroundColor Red
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "📖 Quick Start Guide" -ForegroundColor Cyan
        Write-Host "===================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "STEP 1: Load Extension in Chrome" -ForegroundColor Yellow
        Write-Host "  1. Open Chrome and go to: chrome://extensions/" -ForegroundColor White
        Write-Host "  2. Enable 'Developer mode' (toggle in top-right)" -ForegroundColor White
        Write-Host "  3. Click 'Load unpacked'" -ForegroundColor White
        Write-Host "  4. Select folder: $extensionDir" -ForegroundColor White
        Write-Host "  5. Click 'Select Folder'" -ForegroundColor White
        Write-Host ""
        Write-Host "STEP 2: Pin to Toolbar" -ForegroundColor Yellow
        Write-Host "  1. Click puzzle icon 🧩 in Chrome toolbar" -ForegroundColor White
        Write-Host "  2. Find 'TestMaster AI'" -ForegroundColor White
        Write-Host "  3. Click pin icon 📌" -ForegroundColor White
        Write-Host ""
        Write-Host "STEP 3: Test It!" -ForegroundColor Yellow
        Write-Host "  1. Open any website (e.g., google.com)" -ForegroundColor White
        Write-Host "  2. Click TestMaster AI icon in toolbar" -ForegroundColor White
        Write-Host "  3. Try 'Inspect' or 'Open Full Testing Dashboard'" -ForegroundColor White
        Write-Host ""
        Write-Host "For detailed guide, see: LAUNCH_GUIDE.md" -ForegroundColor Cyan
        Write-Host ""
    }
    
    "5" {
        Write-Host ""
        Write-Host "👋 Goodbye!" -ForegroundColor Cyan
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Done! Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
