@echo off
REM Bam dup file nay de mo web hoc tieng Trung.
cd /d "%~dp0"
echo Dang khoi dong web hoc tieng Trung...

docker info >nul 2>&1
if errorlevel 1 (
  echo.
  echo Docker Desktop chua chay. Hay mo Docker Desktop, doi bieu tuong ca voi chuyen xanh roi chay lai file nay.
  pause
  exit /b 1
)

docker compose up -d
if errorlevel 1 (
  echo Khoi dong that bai. Xem loi o tren.
  pause
  exit /b 1
)

echo Dang cho may chu san sang...
for /l %%i in (1,1,90) do (
  curl -s -o nul http://localhost:8000/api/health && goto ready
  timeout /t 2 /nobreak >nul
)
echo May chu chua tra loi, van mo trang web...

:ready
REM Moi ngay tu sao luu du lieu mot lan (thu muc backups).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\backup.ps1" -IfOlderThanHours 20
start "" http://localhost:5173
