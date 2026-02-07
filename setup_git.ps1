# Git Setup Script for Agri-OS
Write-Host "Setting up Git repository..."

# Create README if not exists
if (-not (Test-Path README.md)) {
    "# Cgrow" | Out-File -FilePath README.md -Encoding utf8
}

# Initialize Git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit of Agri-OS V1"

# Rename branch
git branch -M main

# Configure Remote (Remove if exists to ensure correct URL)
try {
    git remote remove origin 2>$null
} catch {}
git remote add origin https://github.com/chetna-ctrl/Cgrow.git

Write-Host "Repository setup complete. Attempting push..."
# Push (This might prompt for credentials in a popup)
git push -u origin main
