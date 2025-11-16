@echo off
echo ========================================
echo Setting Up Development User
echo ========================================
echo.
echo This script will create the mock development user in the database.
echo This is required for testing with the mock-token-for-development.
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Check if database container is running
docker ps --filter "name=dnd-database" --filter "status=running" | findstr dnd-database >nul
if errorlevel 1 (
    echo ERROR: Database container is not running!
    echo Please start the application with: docker-compose up -d database
    pause
    exit /b 1
)

echo Creating development user in database...
docker exec -it dnd-database psql -U postgres -d dnd_campaign_db -c "INSERT INTO users (id, email, username, display_name, password_hash, created_at, updated_at) VALUES ('00000000-0000-0000-0000-000000000001', 'dev@example.com', 'developer', 'Development User', 'mock-password-hash', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;"

if errorlevel 1 (
    echo ERROR: Failed to create development user
    pause
    exit /b 1
)

echo.
echo SUCCESS: Development user created!
echo.
echo User Details:
echo   ID: 00000000-0000-0000-0000-000000000001
echo   Email: dev@example.com
echo   Username: developer
echo   Token: mock-token-for-development
echo.
echo You can now use the mock token for API testing.
echo.
pause









