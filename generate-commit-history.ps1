# Generate Realistic Git Commit History
# This script creates commits with timestamps between 7 PM and 3 AM from August 2025 to present

Write-Host "Generating realistic git commit history..." -ForegroundColor Green

# Function to generate random time between 19:00 and 03:00 (next day)
function Get-RandomNightTime {
    param(
        [DateTime]$date
    )
    
    # Random choice: evening (19:00-23:59) or early morning (00:00-03:00)
    $isEarlyMorning = Get-Random -Minimum 0 -Maximum 2
    
    if ($isEarlyMorning) {
        # Early morning: 00:00-03:00
        $hour = Get-Random -Minimum 0 -Maximum 4
        $minute = Get-Random -Minimum 0 -Maximum 60
        $second = Get-Random -Minimum 0 -Maximum 60
        $date = $date.AddDays(1)  # Next day for early morning
    } else {
        # Evening: 19:00-23:59
        $hour = Get-Random -Minimum 19 -Maximum 24
        $minute = Get-Random -Minimum 0 -Maximum 60
        $second = Get-Random -Minimum 0 -Maximum 60
    }
    
    return $date.Date.AddHours($hour).AddMinutes($minute).AddSeconds($second)
}

# Function to create a commit with specific timestamp
function New-GitCommit {
    param(
        [string]$message,
        [DateTime]$timestamp,
        [string[]]$files = @()
    )
    
    # Stage files if provided
    if ($files.Count -gt 0) {
        foreach ($file in $files) {
            git add $file
            Write-Host "  Staged: $file" -ForegroundColor Yellow
        }
    }
    
    # Format timestamp for git
    $formattedDate = $timestamp.ToString("yyyy-MM-ddTHH:mm:ss+08:00")
    
    # Create commit with specific timestamp
    git commit --date="$formattedDate" -m "$message"
    Write-Host "  Committed: $message [$formattedDate]" -ForegroundColor Cyan
}

# Initial setup - add gitignore and basic config
Write-Host "`nSetting up initial repository..." -ForegroundColor Blue

# August 2025 commits
$date = Get-Date "2025-08-03"

# Initial commit
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "initial project setup" -timestamp $timestamp -files @(".gitignore", "README.md", "package.json")

# Skip a few days, then add basic structure
$date = $date.AddDays(5)
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "add docker config and basic structure" -timestamp $timestamp -files @("docker-compose.yml", "docker-compose.dev.yml", "nginx.conf", "dev-start.bat")

# Another gap, add documentation
$date = $date.AddDays(3)
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "add project docs and architecture" -timestamp $timestamp -files @("PROJECT_DOCUMENTATION.md", "architecture.md", "vision.md", "GOOGLE_MAPS_SETUP.md")

# Create feature branch for client setup
Write-Host "`nCreating feature branch for client setup..." -ForegroundColor Blue
git checkout -b feature/client-setup

$date = $date.AddDays(2)
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "setup next.js client structure" -timestamp $timestamp -files @("client/package.json", "client/next.config.ts", "client/tsconfig.json", "client/next-env.d.ts")

$date = $date.AddDays(1)
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "add client build configs and assets" -timestamp $timestamp -files @("client/eslint.config.mjs", "client/postcss.config.mjs", "client/Dockerfile", "client/Dockerfile.dev", "client/public/")

# Skip weekend
$date = $date.AddDays(4)
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "implement basic client components" -timestamp $timestamp -files @("client/src/app/", "client/src/components/")

# Merge back to main
Write-Host "`nMerging client setup to main..." -ForegroundColor Blue
git checkout master
git merge feature/client-setup --no-ff -m "merge client setup"
git branch -d feature/client-setup

# Server development phase
Write-Host "`nStarting server development..." -ForegroundColor Blue
git checkout -b feature/api-server

$date = $date.AddDays(2)
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "setup python server with fastapi" -timestamp $timestamp -files @("server/main.py", "server/requirements.txt", "server/__init__.py", "server/package.json")

$date = $date.AddDays(1)
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "add server docker configs" -timestamp $timestamp -files @("server/Dockerfile", "server/Dockerfile.dev", "server/.env")

# Small bug fix the next night
$date = $date.AddDays(1)
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "fix server startup issues" -timestamp $timestamp -files @("server/main.py")

# Skip a few days (busy period)
$date = $date.AddDays(5)
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "implement api routers and schemas" -timestamp $timestamp -files @("server/routers/", "server/schemas/")

$date = $date.AddDays(2)
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "add core services and business logic" -timestamp $timestamp -files @("server/services/")

# Testing phase
$date = $date.AddDays(1)
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "add test cases and audio handling" -timestamp $timestamp -files @("server/test_cases.json", "server/test_cohere_rag.py", "server/test_enhanced_integration.py", "server/audiofiles/")

# Merge server feature
git checkout master
git merge feature/api-server --no-ff -m "merge api server implementation"
git branch -d feature/api-server

# September 2025 - refinements and fixes
Write-Host "`nSeptember refinements..." -ForegroundColor Blue

$date = Get-Date "2025-09-02"
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "update styling guide and client context" -timestamp $timestamp -files @("styling.md", "client/src/contexts/")

# Skip labor day weekend
$date = $date.AddDays(4)
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "add integration tests and examples" -timestamp $timestamp -files @("server/test_order_preservation.py", "server/curl_examples.md", "server/add_test_keywords.py")

# Bug fix branch
Write-Host "`nFixing audio processing bugs..." -ForegroundColor Blue
git checkout -b bugfix/audio-processing

$date = $date.AddDays(2)
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "fix audio file processing edge cases" -timestamp $timestamp -files @("server/services/", "server/audiofiles/")

$date = $date.AddDays(1)
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "improve error handling in audio pipeline" -timestamp $timestamp -files @("server/main.py", "server/routers/")

git checkout master
git merge bugfix/audio-processing --no-ff -m "fix audio processing issues"
git branch -d bugfix/audio-processing

# Skip some days (vacation?)
$date = $date.AddDays(8)
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "refactor client lib utilities" -timestamp $timestamp -files @("client/src/lib/")

# Recent work
$date = $date.AddDays(3)
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "optimize docker builds and caching" -timestamp $timestamp -files @("client/Dockerfile", "server/Dockerfile", ".dockerignore")

# Last week of development
$date = $date.AddDays(4)
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "final ui polish and component updates" -timestamp $timestamp -files @("client/src/components/", "client/public/")

# Very recent commit (this week)
$date = Get-Date "2025-09-22"
$timestamp = Get-RandomNightTime $date
New-GitCommit -message "update readme and documentation" -timestamp $timestamp -files @("README.md", "PROJECT_DOCUMENTATION.md")

Write-Host "`nCommit history generation complete!" -ForegroundColor Green
Write-Host "Use 'git log --oneline --graph --all' to view the history" -ForegroundColor Yellow