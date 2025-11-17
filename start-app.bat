@echo off
echo Starting D&D Campaign Management System...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Docker Desktop is not running!
    echo.
    echo Please do the following:
    echo 1. Start Docker Desktop from your Start menu
    echo 2. Wait for the whale icon to appear in your system tray
    echo 3. Wait for "Docker Desktop is running" message
    echo 4. Run this script again
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Docker is running. Starting application...

REM Start the application
docker-compose up -d

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start application
    echo Check the error messages above
    pause
    exit /b 1
)

echo.
echo SUCCESS: Application started!
echo.
echo Access Points:
echo   Frontend: http://localhost:3000
echo   API: http://localhost:3001
echo   Database: localhost:5432
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo.
pause
