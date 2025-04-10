@echo off
title Discord Soundboard Downloader
color 0A
setlocal enabledelayedexpansion

echo =======================================================
echo Discord Soundboard Downloader - Dependency Check
echo Created: xGronox
echo =======================================================
echo.

:: Check for Node.js installation
echo Checking for Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed on your computer.
    echo.
    echo Please install Node.js by going to:
    echo https://nodejs.org/en/download/
    echo.
    echo After installing Node.js, run this script again.
    echo.
    pause
    exit /b 1
)

:: Get Node.js version
for /f "tokens=1,2,3 delims=." %%a in ('node --version') do (
    set NODE_MAJOR=%%a
    set NODE_MINOR=%%b
    set NODE_MINOR=!NODE_MINOR:~0,2!
)
set NODE_MAJOR=%NODE_MAJOR:~1%

echo Node.js installed: version %NODE_MAJOR%.%NODE_MINOR%.x
echo.

:: Check Node.js version
if %NODE_MAJOR% LSS 14 (
    echo [WARNING] It is recommended to use Node.js version 14 or higher.
    echo Your version: %NODE_MAJOR%.%NODE_MINOR%.x
    echo.
    set /p CONTINUE="Do you want to continue with the older version? (y/n): "
    if /i "!CONTINUE!" NEQ "y" (
        echo.
        echo Please update Node.js at:
        echo https://nodejs.org/en/download/
        echo.
        pause
        exit /b 1
    )
)

:: Check for npm
echo Checking for npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed or not found in PATH.
    echo.
    echo Please reinstall Node.js including npm.
    pause
    exit /b 1
)
echo npm found.
echo.

:: Install dependencies (regardless of node_modules folder)
echo Installing dependencies...
echo This may take a few moments...
echo.

:: Try to install dependencies with --save flag
call npm install discord.js-selfbot-v13@latest axios --save

:: Check if installation was successful
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to install dependencies. Trying alternative method...
    echo.
    
    :: Create or update package.json if it doesn't exist
    if not exist package.json (
        echo Creating package.json...
        echo {"name":"discord-soundboard-downloader","dependencies":{}} > package.json
    )
    
    :: Try another installation approach
    call npm install discord.js-selfbot-v13@latest --save
    
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Still unable to install discord.js-selfbot-v13.
        echo.
        echo Please try manually running:
        echo npm init -y
        echo npm install discord.js-selfbot-v13@latest axios --save
        echo.
        pause
        exit /b 1
    )
    
    call npm install axios --save
    
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [WARNING] axios installation may have failed, but we'll try to continue.
        echo.
    )
)

:: Verify modules were actually installed
echo.
echo Verifying installed modules...
if not exist "node_modules\discord.js-selfbot-v13" (
    echo.
    echo [ERROR] Module verification failed. discord.js-selfbot-v13 is not installed correctly.
    echo.
    echo Please try manually running:
    echo npm cache clean --force
    echo npm install discord.js-selfbot-v13@latest axios --force
    echo.
    pause
    exit /b 1
)

echo All dependencies successfully installed.
echo.

:: Check for script file
echo Checking for script file...
if not exist discord-soundboard-downloader.js (
    echo [ERROR] File discord-soundboard-downloader.js not found!
    echo.
    echo Please make sure this file is in the same folder as start.bat.
    echo.
    pause
    exit /b 1
)
echo Script file found.
echo.

:: Check settings
echo Checking settings...
findstr /c:"const TOKEN = 'token'" discord-soundboard-downloader.js >nul
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] It seems you haven't changed the Discord token in the script file.
    echo.
    echo Please open the discord-soundboard-downloader.js file
    echo and replace 'token' and 'server-id' with your values.
    echo.
    set /p CONTINUE="Do you want to continue without changing settings? (y/n): "
    if /i "!CONTINUE!" NEQ "y" (
        notepad discord-soundboard-downloader.js
        echo.
        echo Run the script again after changing settings.
        pause
        exit /b 0
    )
)

:: Create sounds folder
if not exist discord_sounds mkdir discord_sounds

echo =======================================================
echo       Starting Discord Soundboard Downloader
echo =======================================================
echo.
echo Launching script...
echo.

:: Run the script
node discord-soundboard-downloader.js

echo.
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Script exited with an error.
    echo Check if your token and server ID are correct.
) else (
    echo Script completed.
)

echo.
echo Done! Press any key to exit.
pause > nul
exit /b 0