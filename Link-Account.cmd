@echo off
node "%~dp0bot-starter\scripts\link-account.mjs" %*
if errorlevel 1 pause
