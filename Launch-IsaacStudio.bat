@echo off
title The Binding of Isaac Character Studio
echo =======================================================
echo   THE BINDING OF ISAAC: CUSTOM CHARACTER STUDIO
echo =======================================================
echo Starting Isaac Studio server and opening web interface...
cd /d "%~dp0"
start http://localhost:3001
node server/index.js
pause
