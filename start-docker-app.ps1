# D&D Campaign Management System - PowerShell Startup Script

Write-Host "Starting D&D Campaign Management System..." -ForegroundColor Green

# Function to check if Docker is running
function Test-DockerRunning {
    try {
        $null = docker info 2>$null
        return $true
    }
    catch {
        return $false
    }
}

# Function to start Docker Desktop
function Start-DockerDesktop {
    Write-Host "Starting Docker Desktop..." -ForegroundColor Yellow
    
    # Try to start Docker Desktop
    try {
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction Stop
        Write-Host "Docker Desktop is starting..." -ForegroundColor Yellow
        Write-Host "Please wait for Docker Desktop to fully initialize..." -ForegroundColor Yellow
        Write-Host "Look for the whale icon in your system tray." -ForegroundColor Yellow
    }
    catch {
        Write-Host "Could not start Docker Desktop automatically." -ForegroundColor Red
        Write-Host "Please start Docker Desktop manually from the Start menu." -ForegroundColor Red
    }
}

# Function to wait for Docker to be ready
function Wait-ForDocker {
    Write-Host "Waiting for Docker to be ready..." -ForegroundColor Yellow
    $timeout = 120 # 2 minutes
    $elapsed = 0
    
    while ($elapsed -lt $timeout) {
        if (Test-DockerRunning) {
            Write-Host "Docker is ready!" -ForegroundColor Green
            return $true
        }
        
        Start-Sleep -Seconds 5
        $elapsed += 5
        Write-Host "Still waiting... ($elapsed/$timeout seconds)" -ForegroundColor Yellow
    }
    
    Write-Host "Timeout waiting for Docker to start." -ForegroundColor Red
    return $false
}

# Function to start the application
function Start-Application {
    param([string]$Mode = "prod")
    
    Write-Host "Starting application in $Mode mode..." -ForegroundColor Green
    
    if ($Mode -eq "dev") {
        docker-compose -f docker-compose.dev.yml up -d
    } else {
        docker-compose up -d
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Application started successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Access Points:" -ForegroundColor Cyan
        Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
        Write-Host "  API: http://localhost:3001" -ForegroundColor White
        Write-Host "  Database: localhost:5432" -ForegroundColor White
        Write-Host ""
        Write-Host "Health Checks:" -ForegroundColor Cyan
        Write-Host "  Frontend: http://localhost:3000/health" -ForegroundColor White
        Write-Host "  API: http://localhost:3001/health" -ForegroundColor White
        Write-Host ""
        Write-Host "To view logs: docker-compose logs -f" -ForegroundColor Yellow
        Write-Host "To stop: docker-compose down" -ForegroundColor Yellow
    } else {
        Write-Host "Failed to start application. Check the logs above." -ForegroundColor Red
    }
}

# Main script logic
Write-Host "Checking Docker status..." -ForegroundColor Yellow

if (-not (Test-DockerRunning)) {
    Write-Host "Docker is not running. Attempting to start Docker Desktop..." -ForegroundColor Yellow
    Start-DockerDesktop
    
    if (-not (Wait-ForDocker)) {
        Write-Host ""
        Write-Host "Docker Desktop failed to start automatically." -ForegroundColor Red
        Write-Host "Please:" -ForegroundColor Red
        Write-Host "1. Start Docker Desktop manually from the Start menu" -ForegroundColor Red
        Write-Host "2. Wait for it to fully initialize (whale icon in system tray)" -ForegroundColor Red
        Write-Host "3. Run this script again" -ForegroundColor Red
        exit 1
    }
}

# Start the application
$mode = if ($args[0]) { $args[0] } else { "prod" }
Start-Application -Mode $mode
