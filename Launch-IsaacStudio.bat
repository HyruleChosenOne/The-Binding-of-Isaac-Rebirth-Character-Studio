@echo off
setlocal enabledelayedexpansion
title The Binding of Isaac Rebirth: Character Studio
cd /d "%~dp0"

echo =======================================================
echo   THE BINDING OF ISAAC REBIRTH: CHARACTER STUDIO
echo =======================================================
echo.

:: 1. Locate Node.js executable (bundled portable runtime first, then system PATH)
set "NODE_BIN="
if exist "%~dp0runtime\node.exe" (
    set "NODE_BIN=%~dp0runtime\node.exe"
) else if exist "%~dp0node.exe" (
    set "NODE_BIN=%~dp0node.exe"
) else (
    where node >nul 2>nul
    if !errorlevel! equ 0 (
        set "NODE_BIN=node"
    )
)

if "%NODE_BIN%"=="" (
    echo [ERROR] Node.js runtime was not found on this system!
    echo Please install Node.js from https://nodejs.org or place node.exe in the runtime\ folder.
    echo.
    pause
    exit /b 1
)

echo Starting Isaac Character Studio...
echo Server running at http://localhost:3001
echo When you close the browser tab, this window and the server will close automatically.
echo.

"%NODE_BIN%" server/index.js

exit /b 0
