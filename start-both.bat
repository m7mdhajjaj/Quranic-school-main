@echo off
echo ========================================
echo    Quranic School Application Launcher
echo ========================================
echo.

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed

echo.
echo [2/3] Starting Backend Server...
cd /d "%~dp0Backend"
echo Current directory: %CD%
echo Running: npm start

start "Backend Server - Port 5005" cmd /k "npm start"

echo.
echo [3/3] Waiting for backend to initialize...
echo Please wait 10 seconds for backend to start properly...
timeout /t 10 /nobreak > nul

echo.
echo [4/3] Starting Frontend Development Server...
cd /d "%~dp0Frontend"
echo Current directory: %CD%
echo Running: npm run dev

start "Frontend Server - Port 5173" cmd /k "npm run dev"

echo.
echo ========================================
echo    Servers Status
echo ========================================
echo ✓ Backend Server: http://localhost:5005
echo ✓ Frontend Server: http://localhost:5173
echo.
echo Wait for both servers to fully start, then open:
echo http://localhost:5173 in your browser
echo.
echo Press any key to exit this launcher...
pause >nul