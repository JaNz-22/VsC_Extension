@echo off
setlocal enabledelayedexpansion

REM License: MIT — see LICENSE in project root
REM Copyright (c) 2025 yi-ye-zhi-qiu
REM SPDX-License-Identifier: MIT

echo.
echo 🚀 Aiutante AI Code Assistant - Startup Script
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js v14 or higher.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✓ Node.js and npm found
echo.

REM Install extension dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing extension dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install extension dependencies
        pause
        exit /b 1
    )
)

REM Compile extension
echo 🔨 Compiling extension...
call npm run compile
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to compile extension
    pause
    exit /b 1
)

REM Run tests
echo 🧪 Running tests...
call npm test
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Some tests failed (this might be okay)
)

echo.
echo ✓ Extension setup complete!
echo.

REM Check if web-dashboard exists
if exist "web-dashboard" (
    echo 📦 Setting up web dashboard...
    
    cd web-dashboard
    
    REM Install web dashboard dependencies if needed
    if not exist "node_modules" (
        echo 📦 Installing dashboard dependencies...
        call npm install
        if %ERRORLEVEL% NEQ 0 (
            echo ❌ Failed to install dashboard dependencies
            pause
            exit /b 1
        )
    )
    
    REM Create data directory if needed
    if not exist "data" (
        mkdir data
    )
    
    REM Create .env if it doesn't exist
    if not exist ".env" (
        (
            echo PORT=5000
            echo NODE_ENV=development
        ) > .env
        echo ✓ Created .env file
    )
    
    echo ✓ Dashboard setup complete!
    echo.
    
    REM Ask user if they want to start the dashboard
    set /p START_DASHBOARD="Do you want to start the web dashboard server? (y/n) "
    if /i "!START_DASHBOARD!"=="y" (
        echo 🌐 Starting web dashboard on http://localhost:5000
        call npm start
    )
    
    cd ..
) else (
    echo ⚠️  Web dashboard not found
)

echo.
echo ================================================
echo ✓ Setup Complete!
echo.
echo Next steps:
echo 1. Open VS Code
echo 2. Install the extension from: out/extension.js
echo 3. Press Ctrl+Shift+P and search for "Login to AI Service"
echo 4. Enter your email and OpenAI API key
echo 5. Start using AI features!
echo.
echo Documentation: See SETUP.md for detailed instructions
echo ================================================
echo.
pause
