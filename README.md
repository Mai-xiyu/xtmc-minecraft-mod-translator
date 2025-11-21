# XTMC Translate - Minecraft Mod 翻译工具

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.13-green)
![Vue](https://img.shields.io/badge/vue-3.5-brightgreen)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen)
[![Docker Hub](https://img.shields.io/docker/pulls/maixiyu/xtmc-translate)](https://hub.docker.com/r/maixiyu/xtmc-translate)

**专业的 Minecraft 模组翻译工具，支持语言文件和字节码翻译**

Created by **Mai_xiyu** and **Gemini3**

[English](README.md) | [Docker 部署](DOCKER.md)

</div>

---

## 🌟 功能特性

### 📝 语言文件翻译
- ✅ 支持 `.json` 和 `.lang` 格式
- ✅ 支持 JAR 文件自动提取和选择
- ✅ 智能批量处理（基于 Token 限制）
- ✅ 自动 JAR 重打包

### 🔧 字节码翻译
- ✅ 直接翻译 JAR 字节码中的字符串
- ✅ Java Class 文件解析
- ✅ 批量 AI 翻译（50 字符串/批）
- ✅ 智能过滤技术字符串
- ✅ 翻译后人工审查机制

### 🤖 多种 AI 模型
- **DeepSeek** - 高性价比，适合中文翻译
- **OpenAI (GPT-4o-mini)** - 高质量通用翻译
- **Claude (Haiku)** - 理解上下文，适合复杂翻译
- **Gemini (Flash 1.5)** - 快速翻译，支持长文本

### 🌍 完整国际化
- 支持 6 种语言: English, 简体中文, Deutsch, Español, Русский, Português

---

## 📦 快速开始

### 🐳 Docker 部署 (推荐)

**最简单的方式,一键启动:**

```bash
docker run -d \
  --name xtmc-translate \
  -p 8000:8000 \
  -p 8080:8080 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/outputs:/app/outputs \
  maixiyu/xtmc-translate:latest
```

访问: http://localhost:8080

详细 Docker 部署说明见 [DOCKER.md](DOCKER.md)

### 📜 脚本启动

```bash
./start.sh
```

服务将在以下地址启动：
- 前端: http://localhost:8080
- 后端: http://localhost:8000

### 停止服务

```bash
./stop.sh
```

### ⚙️ 端口配置

如需修改端口，编辑以下文件：

1. **后端端口** - `backend/main.py` 最后一行:
   ```python
   uvicorn.run(app, host="0.0.0.0", port=8000)
   ```

2. **前端端口** - `start.sh` 第 38 行:
   ```bash
   nohup python3 -m http.server 8080 > ../frontend.log 2>&1 &
   ```
   同时需要修改 `start.sh` 第 25 行的 pkill 命令端口号

3. **前端 API 地址** - `frontend/config.js`:
   ```javascript
   export const API_BASE = 'http://localhost:8000';
   ```

修改后重启服务生效。

---

## 📖 使用指南

### 语言文件翻译

1. 上传 `.json` / `.lang` / `.jar` 文件
2. 如果是 JAR，选择要翻译的语言文件
3. 选择目标语言和 AI 模型
4. 输入 API Key
5. 开始翻译
6. 下载结果或打包为 ZIP

### 字节码翻译

1. 上传 `.jar` 文件
2. 选择目标语言和 AI 模型
3. 输入 API Key
4. 开始处理（自动翻译所有字符串）
5. 翻译完成后，在审查界面选择要应用的翻译
6. 应用翻译并下载新的 JAR 文件

**注意**: 字节码翻译会先翻译所有字符串，然后让您审查和选择要保留的翻译结果，避免误翻译技术字符串。

---

## 🔑 API Key 获取

- **DeepSeek**: https://platform.deepseek.com
- **OpenAI**: https://platform.openai.com
- **Claude**: https://console.anthropic.com
- **Gemini**: https://makersuite.google.com/app/apikey

---

## 🛠️ 技术栈

### 前端
- Vue.js 3 + Vue Router 4
- i18next (国际化)
- Tailwind CSS
- JSZip + FileSaver.js

### 后端
- Python 3.13 + FastAPI
- httpx (异步 HTTP 客户端)
- ai_translator.py (支持 4 种 AI 模型)

---

## ⚠️ 免责声明

1. **API Key 安全** - 不存储、不记录，仅用于当前翻译会话
2. **翻译质量** - AI 翻译结果建议人工审查
3. **字节码风险** - 修改字节码有风险，使用前务必备份原文件
4. **版权尊重** - 仅用于个人学习和研究，请尊重模组作者版权
5. **服务条款** - 使用时请遵守各 AI 提供商的服务条款

---

## 📚 详细文档

- [字节码翻译指南](BYTECODE_TRANSLATION_GUIDE.md)
- [JAR 支持说明](JAR_SUPPORT.md)
- [功能实现报告](IMPLEMENTATION_COMPLETE.md)

## 💖 赞助支持

如果这个项目对您有帮助，欢迎赞助！

- **微信支付** / **支付宝** - 见应用内赞助页面
- **爱发电** - https://afdian.com/a/xiyu114514

## 🎮 加入我们

**XTMC 服务器**: www.xtmc.xyz

---

<div align="center">

**Made with ❤️ by Mai_xiyu & Gemini3**

</div>

