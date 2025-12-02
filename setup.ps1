# TestMaster AI - Quick Start PowerShell Script
# This script helps you set up the extension quickly

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   TestMaster AI - Quick Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
$currentDir = Get-Location
if (-not (Test-Path "manifest.json")) {
    Write-Host "❌ Error: manifest.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the TestMaster-AI-Extension directory" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example:" -ForegroundColor Yellow
    Write-Host "  cd C:\TestMaster-AI-Extension" -ForegroundColor Gray
    Write-Host "  .\setup.ps1" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Found extension files" -ForegroundColor Green
Write-Host ""

# Step 1: Check for icons
Write-Host "Step 1: Checking for icons..." -ForegroundColor Yellow

$iconsExist = $true
$iconSizes = @(16, 48, 128)

foreach ($size in $iconSizes) {
    $iconPath = "icons\icon$size.png"
    if (-not (Test-Path $iconPath)) {
        $iconsExist = $false
        Write-Host "  ❌ Missing: $iconPath" -ForegroundColor Red
    } else {
        Write-Host "  ✅ Found: $iconPath" -ForegroundColor Green
    }
}

if (-not $iconsExist) {
    Write-Host ""
    Write-Host "📸 Icons are missing! Let's create them..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opening icon generator in your browser..." -ForegroundColor Cyan
    Write-Host "Please download all three icons and save them to the icons/ folder" -ForegroundColor Cyan
    
    # Open the icon generator HTML
    Start-Process "generate_icons.html"
    
    Write-Host ""
    Write-Host "After downloading icons, press any key to continue..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Check again
    $iconsExist = $true
    foreach ($size in $iconSizes) {
        $iconPath = "icons\icon$size.png"
        if (-not (Test-Path $iconPath)) {
            $iconsExist = $false
        }
    }
    
    if (-not $iconsExist) {
        Write-Host ""
        Write-Host "⚠️  Icons still missing, but that's OK!" -ForegroundColor Yellow
        Write-Host "You can add them later and reload the extension" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Step 2: Loading Extension in Chrome" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Please follow these steps:" -ForegroundColor White
Write-Host ""
Write-Host "1. Open Chrome and navigate to:" -ForegroundColor Cyan
Write-Host "   chrome://extensions/" -ForegroundColor White
Write-Host ""
Write-Host "2. Enable 'Developer mode' (toggle in top-right)" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Click 'Load unpacked' button" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Select this folder:" -ForegroundColor Cyan
Write-Host "   $currentDir" -ForegroundColor White
Write-Host ""
Write-Host "5. Pin the extension to your toolbar" -ForegroundColor Cyan
Write-Host ""

# Try to open Chrome extensions page
Write-Host "Would you like me to open Chrome extensions page now? (Y/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq 'Y' -or $response -eq 'y') {
    Start-Process "chrome://extensions/"
    Write-Host "✅ Opening Chrome extensions page..." -ForegroundColor Green
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Step 3: Test the Extension" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "After loading the extension, test it:" -ForegroundColor White
Write-Host ""
Write-Host "1. Navigate to any website (e.g., google.com)" -ForegroundColor Cyan
Write-Host "2. Click the TestMaster AI icon in toolbar" -ForegroundColor Cyan
Write-Host "3. Click 'Open Full Testing Dashboard'" -ForegroundColor Cyan
Write-Host "4. Explore all the features!" -ForegroundColor Cyan
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Optional: Configure AI (100% Free)" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "For AI-powered features, you have free options:" -ForegroundColor White
Write-Host ""
Write-Host "Option 1: Ollama (Local, Private)" -ForegroundColor Cyan
Write-Host "  1. Install: winget install Ollama.Ollama" -ForegroundColor Gray
Write-Host "  2. Run: ollama pull llama2" -ForegroundColor Gray
Write-Host "  3. Configure in extension" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 2: Groq (Cloud, Fast)" -ForegroundColor Cyan
Write-Host "  1. Sign up at: https://console.groq.com" -ForegroundColor Gray
Write-Host "  2. Get free API key" -ForegroundColor Gray
Write-Host "  3. Configure in extension" -ForegroundColor Gray
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "📚 Documentation" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  README.md       - Complete feature documentation" -ForegroundColor White
Write-Host "  SETUP_GUIDE.md  - Detailed setup instructions" -ForegroundColor White
Write-Host ""

Write-Host "=========================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 You're ready to start testing!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Need help? Check the documentation or open an issue on GitHub" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy Testing! 🎉" -ForegroundColor Cyan
Write-Host ""
