# Multi-stage build for XTMC Translate

# Stage 1: Frontend build (optional, since we use pre-built files)
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./

# Stage 2: Final image
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy application files
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY start.sh stop.sh ./
COPY README.md ./

# Create necessary directories
RUN mkdir -p uploads outputs && \
    chmod +x start.sh stop.sh

# Expose ports
EXPOSE 8000 8080

# Environment variables
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000').read()" || exit 1

# Start command
CMD ["bash", "-c", "python backend/main.py & cd frontend && python -m http.server 8080 --bind 0.0.0.0"]
