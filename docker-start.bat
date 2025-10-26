@echo off
setlocal enabledelayedexpansion

REM D&D Campaign Management System - Docker Startup Script for Windows

echo Starting D&D Campaign Management System with Docker...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running. Please start Docker Desktop and try again.
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: docker-compose is not installed. Please install Docker Compose.
    exit /b 1
)

REM Function to display usage
:show_usage
echo Usage: %0 [OPTIONS]
echo.
echo Options:
echo   dev     Start in development mode (database + API only)
echo   prod    Start in production mode (all services)
echo   stop    Stop all services
echo   logs    Show logs
echo   clean   Clean up containers and volumes
echo   help    Show this help message
echo.
echo Examples:
echo   %0 prod    # Start production environment
echo   %0 dev     # Start development environment
echo   %0 stop    # Stop all services
echo   %0 logs    # Show logs
goto :eof

REM Function to start production environment
:start_production
echo Starting production environment...
docker-compose up -d

echo.
echo Services started successfully!
echo.
echo Frontend: http://localhost:3000
echo API: http://localhost:3001
echo Database: localhost:5432
echo.
echo Health checks:
echo    Frontend: http://localhost:3000/health
echo    API: http://localhost:3001/health
echo.
echo To view logs: %0 logs
echo To stop: %0 stop
goto :eof

REM Function to start development environment
:start_development
echo Starting development environment...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo Development services started!
echo.
echo Database: localhost:5432
echo API: http://localhost:3001
echo.
echo To start the frontend locally:
echo    npm install
echo    npm start
echo.
echo To view logs: %0 logs
echo To stop: %0 stop
goto :eof

REM Function to stop services
:stop_services
echo Stopping all services...
docker-compose down
docker-compose -f docker-compose.dev.yml down
echo All services stopped.
goto :eof

REM Function to show logs
:show_logs
echo Showing logs (Press Ctrl+C to exit)...
docker-compose logs -f
goto :eof

REM Function to clean up
:clean_up
echo Cleaning up containers and volumes...
set /p confirm="WARNING: This will delete all data. Are you sure? (y/N): "
if /i "%confirm%"=="y" (
    docker-compose down -v --remove-orphans
    docker-compose -f docker-compose.dev.yml down -v --remove-orphans
    docker system prune -f
    echo Cleanup completed.
) else (
    echo Cleanup cancelled.
)
goto :eof

REM Main script logic
if "%1"=="dev" goto start_development
if "%1"=="prod" goto start_production
if "%1"=="stop" goto stop_services
if "%1"=="logs" goto show_logs
if "%1"=="clean" goto clean_up
if "%1"=="help" goto show_usage
if "%1"=="-h" goto show_usage
if "%1"=="--help" goto show_usage
if "%1"=="" goto start_production

echo ERROR: Unknown option: %1
echo.
call :show_usage
exit /b 1