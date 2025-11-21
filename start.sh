#!/bin/bash

# XTMC Translate 启动脚本

echo "=========================================="
echo "  XTMC Translate - Minecraft Mod Translator"
echo "=========================================="
echo ""

# 检查虚拟环境
if [ ! -d "backend/venv" ]; then
    echo "创建 Python 虚拟环境..."
    python3 -m venv backend/venv
    echo "安装依赖..."
    backend/venv/bin/pip install -r backend/requirements.txt
fi

# 检查依赖
echo "检查依赖..."
backend/venv/bin/pip install -q -r backend/requirements.txt

# 停止旧进程
echo "停止旧进程..."
pkill -f "python.*backend/main.py" 2>/dev/null
pkill -f "python.*http.server 8080" 2>/dev/null
sleep 1

# 启动后端
echo "启动后端服务 (端口 8000)..."
nohup backend/venv/bin/python backend/main.py > backend.log 2>&1 &
BACKEND_PID=$!
echo "后端 PID: $BACKEND_PID"

# 等待后端启动
sleep 2

# 启动前端
echo "启动前端服务 (端口 8080)..."
cd frontend
nohup python3 -m http.server 8080 --bind 0.0.0.0 > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "前端 PID: $FRONTEND_PID"

# 显示状态
sleep 1
echo ""
echo "=========================================="
echo "  服务已启动!"
echo "=========================================="
echo ""
echo "本地访问: http://localhost:8080"
echo "局域网访问: http://$(hostname -I | awk '{print $1}'):8080"
echo "后端 API: http://localhost:8000"
echo ""
echo "后端日志: tail -f backend.log"
echo "前端日志: tail -f frontend.log"
echo ""
echo "停止服务: ./stop.sh"
echo "=========================================="
