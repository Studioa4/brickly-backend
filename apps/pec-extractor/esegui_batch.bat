@echo off
cd /d %~dp0
echo [INFO] Avvio elaborazione batch fatture PEC...
call npm run batch
pause
