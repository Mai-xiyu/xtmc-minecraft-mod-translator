#!/bin/bash

# XTMC Translate 停止脚本

echo "停止 XTMC Translate 服务..."

# 停止后端
echo "停止后端服务..."
pkill -f "python.*backend/main.py"

# 停止前端
echo "停止前端服务..."
pkill -f "python.*http.server 8080"

sleep 1

echo "所有服务已停止"
