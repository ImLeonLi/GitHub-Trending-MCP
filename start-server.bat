@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     GitHub Trending Extractor - Launcher               ║
echo ╚════════════════════════════════════════════════════════╝
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] First run, installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)

:: Check if compiled
if not exist "dist\index.js" (
    echo [INFO] First run, building project...
    call npm run build
    if errorlevel 1 (
        echo [ERROR] Build failed
        pause
        exit /b 1
    )
)

echo [INFO] Starting Web test server...
echo [INFO] Please wait...
echo.

:: Start server
npm run server

:: If server exits abnormally, pause to show error
if errorlevel 1 (
    echo.
    echo [ERROR] Server exited abnormally
    pause
)
