@echo off
echo Starting Avalon Healthcare Doctor Website...
start http://localhost:8080/
powershell -ExecutionPolicy Bypass -File .\server.ps1
pause
