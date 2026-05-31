@echo off
title BillFlow ERP Local Server Launcher
SET "PATH=C:\Users\HP\.gemini\antigravity\scratch\node-portable\node-v22.11.0-win-x64;%PATH%"

echo =======================================================
echo BillFlow ERP - Local Launcher
echo =======================================================
echo.
echo Portable Node.js Path: Pre-configured
echo.

if not exist node_modules (
    echo [INFO] node_modules folder not found. Installing packages with peer legacy compatibility...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Installation failed. Verify your network or paths.
        pause
        exit /b %errorlevel%
    )
)

echo.
echo [INFO] Opening http://localhost:3000 in your browser...
start http://localhost:3000
echo [INFO] Starting Next.js Dev Server...
echo.
call npm run dev
pause
