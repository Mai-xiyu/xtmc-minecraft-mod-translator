# XTMC Translate Docker 部署指南

## 快速开始

### 使用 Docker Hub 镜像

```bash
# 拉取镜像
docker pull yourusername/xtmc-translate:latest

# 运行容器
docker run -d \
  --name xtmc-translate \
  -p 8000:8000 \
  -p 8080:8080 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/outputs:/app/outputs \
  -v $(pwd)/stats.json:/app/stats.json \
  yourusername/xtmc-translate:latest

# 访问应用
# 前端: http://localhost:8080
# 后端: http://localhost:8000
```

### 使用 Docker Compose

```bash
# 克隆仓库
git clone https://github.com/Mai-xiyu/xtmc-minecraft-mod-translator.git
cd xtmc-minecraft-mod-translator

# 设置 Docker Hub 用户名
export DOCKER_USERNAME=yourusername

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 本地构建

```bash
# 构建镜像
docker build -t xtmc-translate .

# 运行
docker run -d -p 8000:8000 -p 8080:8080 xtmc-translate
```

## 环境要求

- Docker 20.10+
- Docker Compose 2.0+ (可选)

## 端口说明

- **8000**: 后端 API 服务
- **8080**: 前端 Web 界面

## 数据持久化

默认挂载以下目录:
- `/app/uploads` - 上传的文件
- `/app/outputs` - 翻译结果
- `/app/stats.json` - 使用统计

## 健康检查

容器内置健康检查,每 30 秒检查一次后端服务状态。

## 故障排除

### 查看容器日志
```bash
docker logs xtmc-translate
```

### 进入容器调试
```bash
docker exec -it xtmc-translate bash
```

### 重启容器
```bash
docker restart xtmc-translate
```

## 更新镜像

```bash
# 拉取最新镜像
docker pull yourusername/xtmc-translate:latest

# 停止并删除旧容器
docker stop xtmc-translate
docker rm xtmc-translate

# 使用新镜像启动
docker run -d --name xtmc-translate -p 8000:8000 -p 8080:8080 yourusername/xtmc-translate:latest
```
