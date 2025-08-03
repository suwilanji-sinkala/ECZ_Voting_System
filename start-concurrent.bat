@echo off
echo 🚀 Starting Development Environment with Concurrently
echo ====================================================

echo.
echo 📋 Available options:
echo    1. Full development (Ganache + Deploy + Next.js)
echo    2. Simple concurrent (Ganache + Next.js)
echo    3. Exit
echo.

set /p choice="Choose an option (1-3): "

if "%choice%"=="1" (
    echo.
    echo 🚀 Starting full development environment...
    npm run dev:full
) else if "%choice%"=="2" (
    echo.
    echo 🚀 Starting simple concurrent setup...
    npm run dev:concurrent
) else if "%choice%"=="3" (
    echo.
    echo 👋 Goodbye!
    exit /b 0
) else (
    echo.
    echo ❌ Invalid option. Please choose 1, 2, or 3.
    pause
    exit /b 1
)

echo.
echo 🛑 Press any key to exit...
pause > nul 