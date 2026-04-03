@echo off
setlocal

cd /d "%~dp0"

if not exist node_modules (
  echo [AITester] Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo [AITester] npm install failed.
    pause
    exit /b 1
  )
)

echo [AITester] Starting Vite dev server...
call npm run dev
