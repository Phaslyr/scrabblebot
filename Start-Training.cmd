@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-Bot.ps1" -Train %*
if errorlevel 1 pause
