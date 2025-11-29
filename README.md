# XTMC Translate - Minecraft Mod Translation Tool


<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.13-green)
![Vue](https://img.shields.io/badge/vue-3.5-brightgreen)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen)
[![Docker Hub](https://img.shields.io/docker/pulls/maixiyu/xtmc-translate)](https://hub.docker.com/r/maixiyu/xtmc-translate)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-trans.xtmc.xyz-00f3ff)](https://trans.xtmc.xyz)
[![GitHub Stars](https://img.shields.io/github/stars/Mai-xiyu/xtmc-minecraft-mod-translator?logo=github&color=yellow)](https://github.com/Mai-xiyu/xtmc-minecraft-mod-translator)
[![GitHub Forks](https://img.shields.io/github/forks/Mai-xiyu/xtmc-minecraft-mod-translator?logo=github&color=blue)](https://github.com/Mai-xiyu/xtmc-minecraft-mod-translator/fork)

**A professional Minecraft mod translation tool that supports language file and bytecode translation**

Created by **Mai_xiyu** and **Gemini3**


[中文](README_CN.md) | [Docker Deployment](DOCKER.md)
</div>

---

## 🌟 Features

### 📝 Language File Translation

- ✅ Supports `.json` and `.lang` formats
- ✅ Supports automatic extraction and selection inside JAR files
- ✅ Smart batch processing (Token-aware)
- ✅ Automatic JAR repackaging

### 🔧 Bytecode Translation

- ✅ Directly translate strings inside JAR bytecode
- ✅ Java Class file parsing
- ✅ Batch AI translation (50 strings/batch)
- ✅ Smart filtering for technical strings
- ✅ Post-translation human review interface

### 🤖 Multiple AI Models

- **DeepSeek** – cost-effective, good for Chinese translation
- **OpenAI (GPT-4o-mini)** – high-quality general translation
- **Claude (Haiku)** – great contextual understanding
- **Gemini (Flash 1.5)** – fast translation, handles long text well

### 🌍 Full Internationalization

- Supports 6 languages: English, Simplified Chinese, German, Spanish, Russian, Portuguese

---

## 📦 Quick Start

### 🐳 Docker Deployment (Recommended)

**Easiest one-command setup:**

```bash
docker run -d \
  --name xtmc-translate \
  -p 8000:8000 \
  -p 8080:8080 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/outputs:/app/outputs \
  maixiyu/xtmc-translate:latest
```

Access: [http://localhost:8080](http://localhost:8080)

See detailed instructions in [DOCKER.md](DOCKER.md)

### 📜 Start via Script

```bash
./start.sh
```

Services will start at:

- Frontend: [http://localhost:8080](http://localhost:8080)
- Backend: [http://localhost:8000](http://localhost:8000)

### Stop Services

```bash
./stop.sh
```

### ⚙️ Port Configuration

To modify ports, edit the following files:

1. **Backend port** – last line of `backend/main.py`:

   ```python
   uvicorn.run(app, host="0.0.0.0", port=8000)
   ```

2. **Frontend port** – line 38 in `start.sh`:

   ```bash
   nohup python3 -m http.server 8080 > ../frontend.log 2>&1 &
   ```

   Also update the pkill port on line 25.

3. **Frontend API address** – `frontend/config.js`:

   ```javascript
   export const API_BASE = 'http://localhost:8000';
   ```

Restart services for changes to take effect.

---

## 📖 User Guide

### Language File Translation

1. Upload `.json`, `.lang`, or `.jar`
2. If using a JAR, select which language file to translate
3. Choose target language and AI model
4. Enter API Key
5. Start translation
6. Download results or export as ZIP

### Bytecode Translation

1. Upload `.jar`
2. Choose target language and AI model
3. Enter API Key
4. Start processing (all strings automatically extracted and translated)
5. Review results in the audit UI
6. Apply translations and download the modified JAR file

**Note:** Bytecode translation translates all strings first, then lets you manually choose which translations to keep to avoid incorrect translation of technical strings.

---

## 🔑 Getting API Keys

- **DeepSeek**: [https://platform.deepseek.com](https://platform.deepseek.com)
- **OpenAI**: [https://platform.openai.com](https://platform.openai.com)
- **Claude**: [https://console.anthropic.com](https://console.anthropic.com)
- **Gemini**: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

---

## 🛠️ Tech Stack

### Frontend

- Vue.js 3 + Vue Router 4
- i18next (i18n)
- Tailwind CSS
- JSZip + FileSaver.js

### Backend

- Python 3.13 + FastAPI
- httpx (async HTTP client)
- ai\_translator.py (supports 4 AI providers)

---

## ⚠️ Disclaimer

1. **API Key Safety** – not stored or logged; used only for the current session
2. **Translation Quality** – AI translations should be reviewed manually
3. **Bytecode Risks** – modifying bytecode can break mods; backup original files
4. **Copyright** – only for personal learning/testing; respect mod authors
5. **Service Terms** – follow the rules of the AI provider you use

---

## 💖 Support the Project

If the project helps you, consider supporting us!

- **WeChat Pay** / **Alipay** – see in-app donation page
- **Afdian** – [https://afdian.com/a/xiyu114514](https://afdian.com/a/xiyu114514)

---

## 🎮 Join Us

**XTMC Server**: [www.xtmc.xyz](http://www.xtmc.xyz)

---

<div align="center">

**Made with ❤️ by Mai_xiyu & Gemini3**

</div>

