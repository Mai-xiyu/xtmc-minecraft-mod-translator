@echo off
REM XTMC Translate Windows 停止脚本

echo 停止 XTMC Translate 服务...
REM 停止后端服务
for /f "tokens=2 delims= " %%a in ('tasklist ^| findstr /i "python.exe"') do (
    taskkill /F /PID %%a >nul 2>nul
)
REM 停止前端服务
for /f "tokens=2 delims= " %%a in ('tasklist ^| findstr /i "http.server"') do (
    taskkill /F /PID %%a >nul 2>nul
)
echo 所有服务已停止
