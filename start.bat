@echo off
REM XTMC Translate Windows 启动脚本

REM 检查 Python 虚拟环境
if not exist "backend\venv" (
    echo 创建 Python 虚拟环境...
    python -m venv backend\venv
    echo 安装依赖...
    backend\venv\Scripts\pip install -r backend\requirements.txt
)

REM 安装依赖
backend\venv\Scripts\pip install -q -r backend\requirements.txt

REM 停止旧进程
for /f "tokens=2 delims= " %%a in ('tasklist ^| findstr /i "python.exe"') do (
    taskkill /F /PID %%a >nul 2>nul
)

REM 启动后端
start "XTMC Backend" backend\venv\Scripts\python backend\main.py
REM 启动前端
cd frontend
start "XTMC Frontend" python -m http.server 8080 --bind 0.0.0.0
cd ..

REM 显示状态
echo ==========================================
echo   XTMC Translate - Minecraft Mod Translator
echo ==========================================
echo.
echo 本地访问: http://localhost:8080
echo 后端 API: http://localhost:8000
echo.
echo 停止服务: start.bat
