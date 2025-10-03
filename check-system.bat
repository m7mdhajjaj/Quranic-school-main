@echo off
echo ========================================
echo    System Requirements Check
echo ========================================
echo.

echo [1/4] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is NOT installed
    echo Please install Node.js from https://nodejs.org/
    goto :end
) else (
    echo ✓ Node.js is installed
    node --version
)

echo.
echo [2/4] Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is NOT available
    goto :end
) else (
    echo ✓ npm is available
    npm --version
)

echo.
echo [3/4] Checking Backend dependencies...
cd /d "%~dp0Backend"
if not exist "node_modules" (
    echo ⚠️  Backend dependencies not installed
    echo Installing Backend dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install Backend dependencies
        goto :end
    )
) else (
    echo ✓ Backend dependencies are installed
)

echo.
echo [4/4] Checking Frontend dependencies...
cd /d "%~dp0Frontend"
if not exist "node_modules" (
    echo ⚠️  Frontend dependencies not installed
    echo Installing Frontend dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install Frontend dependencies
        goto :end
    )
) else (
    echo ✓ Frontend dependencies are installed
)

echo.
echo ========================================
echo ✓ All requirements satisfied!
echo You can now run the application using:
echo   - start-both.bat (recommended)
echo   - Or individual server scripts
echo ========================================

:end
echo.
pause