@echo off
REM D&D Campaign Management System - Pre-Deployment Preparation Script (Windows)
REM This script generates secure passwords and secrets for deployment

echo === D&D Campaign Management System - Deployment Preparation ===
echo.

REM Check if OpenSSL is available
where openssl >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: openssl is not installed
    echo Please install OpenSSL or use Git Bash / WSL
    exit /b 1
)

echo Generating secure passwords and secrets...
echo.

REM Generate passwords using OpenSSL
for /f "delims=" %%i in ('openssl rand -base64 24') do set DB_PASSWORD=%%i
for /f "delims=" %%i in ('openssl rand -base64 48') do set JWT_SECRET=%%i
for /f "delims=" %%i in ('openssl rand -base64 24') do set GRAFANA_PASSWORD=%%i

REM Get timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "Min=%dt:~10,2%"
set "SS=%dt:~12,2%"
set TIMESTAMP=%YYYY%-%MM%-%DD% %HH%:%Min%:%SS%

REM Create secrets file
set SECRETS_FILE=deployment-secrets.txt

(
echo # D&D Campaign Management System - Deployment Secrets
echo # Generated: %TIMESTAMP%
echo # 
echo # ⚠️  IMPORTANT: Keep this file secure and delete after deployment!
echo # ⚠️  DO NOT commit this file to git!
echo # ⚠️  Store these secrets in a password manager after deployment
echo.
echo # ============================================
echo # DATABASE CONFIGURATION
echo # ============================================
echo Database Password: %DB_PASSWORD%
echo.
echo # ============================================
echo # API CONFIGURATION
echo # ============================================
echo JWT Secret: %JWT_SECRET%
echo.
echo # ============================================
echo # MONITORING CONFIGURATION
echo # ============================================
echo Grafana Admin Password: %GRAFANA_PASSWORD%
echo.
echo # ============================================
echo # DEPLOYMENT INSTRUCTIONS
echo # ============================================
echo 1. Copy these values to your docker-compose.yml:
echo    - POSTGRES_PASSWORD: %DB_PASSWORD%
echo    - JWT_SECRET: %JWT_SECRET%
echo    - GF_SECURITY_ADMIN_PASSWORD: %GRAFANA_PASSWORD%
echo.
echo 2. Copy these values to your docker.env file:
echo    - DB_PASSWORD=%DB_PASSWORD%
echo    - JWT_SECRET=%JWT_SECRET%
echo.
echo 3. After deployment:
echo    - Delete this file: del %SECRETS_FILE%
echo    - Store secrets in a secure password manager
echo    - Never commit secrets to git
) > %SECRETS_FILE%

echo ✓ Secrets generated successfully!
echo.
echo === Generated Secrets (SAVE THESE SECURELY) ===
echo.
echo Database Password:
echo %DB_PASSWORD%
echo.
echo JWT Secret:
echo %JWT_SECRET%
echo.
echo Grafana Admin Password:
echo %GRAFANA_PASSWORD%
echo.
echo Secrets saved to: %SECRETS_FILE%
echo.

REM Create docker.env template if it doesn't exist
if not exist docker.env (
    echo Creating docker.env template...
    
    if exist docker.env.example (
        copy docker.env.example docker.env >nul
        echo ✓ Created docker.env from docker.env.example
        echo   Please edit docker.env and add the generated secrets
    ) else (
        (
        echo # D&D Campaign Management System - Environment Variables
        echo # Generated: %TIMESTAMP%
        echo.
        echo # Database Configuration
        echo DB_HOST=database
        echo DB_PORT=5432
        echo DB_NAME=dnd_campaign_db
        echo DB_USER=postgres
        echo DB_PASSWORD=%DB_PASSWORD%
        echo.
        echo # API Configuration
        echo NODE_ENV=production
        echo JWT_SECRET=%JWT_SECRET%
        echo FRONTEND_URL=https://yourdomain.com
        echo ALLOW_DEV_TOKEN=false
        echo.
        echo # Frontend Configuration
        echo REACT_APP_API_URL=https://yourdomain.com/api
        ) > docker.env
        echo ✓ Created docker.env template
        echo   Please update FRONTEND_URL and REACT_APP_API_URL with your domain
    )
    echo.
)

echo ⚠️  IMPORTANT SECURITY REMINDERS:
echo.
echo   1. Review %SECRETS_FILE%
echo   2. Copy values to your configuration files (docker-compose.yml, docker.env)
echo   3. Update FRONTEND_URL and REACT_APP_API_URL with your actual domain
echo   4. Delete %SECRETS_FILE% after deployment
echo   5. Store secrets in a secure password manager
echo   6. Never commit secrets to git (check .gitignore)
echo   7. Set ALLOW_DEV_TOKEN=false in production
echo.
echo ✓ Preparation complete!
echo.
echo Next steps:
echo   1. Review and update docker.env with your domain
echo   2. Update docker-compose.yml with generated secrets
echo   3. Proceed with deployment: docker-compose up -d
echo.

pause

