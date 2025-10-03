@echo off
echo Starting Backend Server...
cd /d "%~dp0"
echo Current directory: %CD%
echo Running backend on port 5005...
npm start
pause