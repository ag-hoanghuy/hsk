@echo off
REM Tat web (du lieu van duoc giu lai).
cd /d "%~dp0"
docker compose stop
echo Da tat web hoc tieng Trung.
timeout /t 3 >nul
