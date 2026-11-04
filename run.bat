@echo off
title Dirt2Dollar Launcher
echo ============================================================
echo           Starting Dirt2Dollar Platform
echo ============================================================

cd /d "%~dp0"

:: 1. Start Backend in a new window
echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8001 ...
start "Dirt2Dollar - Backend (Port 8001)" cmd /k "cd /d "%~dp0" && call .venv\Scripts\activate.bat && python -m uvicorn src.main:app --host 127.0.0.1 --port 8001 --reload"

:: 2. Start Frontend in a new window
echo [2/2] Launching Vite Frontend on http://localhost:3000 ...
start "Dirt2Dollar - Frontend (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ============================================================
echo   Both services are starting in separate windows:
echo     - Web App:      http://localhost:3000
echo     - Backend API:  http://127.0.0.1:8001
echo     - API Docs:     http://127.0.0.1:8001/docs
echo.
echo   Press any key to close this launcher window.
echo ============================================================
pause
