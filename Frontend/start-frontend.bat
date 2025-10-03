@echo off
echo Starting Frontend Development Server...
cd /d "%~dp0"
echo Current directory: %CD%
echo Running frontend on port 5173...
npm run dev
pause