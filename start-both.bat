@echo off
echo ================================================
echo    Starting Quranic School Application
echo ================================================
echo.

echo Starting Backend Server...
echo Current directory for backend: %~dp0Backend
echo Backend will run on port 5005...
echo.

echo Starting Frontend Development Server...
echo Current directory for frontend: %~dp0Frontend
echo Frontend will run on port 5173...
echo.

echo ================================================
echo Both servers are starting...
echo ================================================
echo.

REM Start backend in a new window
start "Backend Server" cmd /c "cd /d "%~dp0Backend" && npm start"

REM Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
start "Frontend Server" cmd /c "cd /d "%~dp0Frontend" && npm run dev"

echo.
echo ================================================
echo Both servers have been started!
echo ================================================
echo Backend: http://localhost:5005
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul