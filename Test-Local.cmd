@echo off
pushd "%~dp0bot-starter"
call npm.cmd run test:local -- %*
set "local_test_exit=%errorlevel%"
popd
if not "%local_test_exit%"=="0" pause
exit /b %local_test_exit%
