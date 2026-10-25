@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-Bot.ps1" -BotName VictorMateo -Strategy victor %*
if errorlevel 1 pause
