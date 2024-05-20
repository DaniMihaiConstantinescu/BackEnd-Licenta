@echo off
REM Save the current directory
set CURRENT_DIR=%cd%

REM Navigate to the rest_server folder and start nodemon in a new command prompt window
cd /d "%~dp0rest_server"
start cmd /k "npm run devStart"

REM Navigate back to the original directory
cd /d "%CURRENT_DIR%"

REM Navigate to the tcp_server folder and run node tcp_server.js
cd /d "%~dp0tcp_server"
node tcp_server.js

pause
