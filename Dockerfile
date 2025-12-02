# Multi-stage build for XTMC Translate

# Stage 1: Frontend build (optional, since we use pre-built files)
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./

# Stage 2: Final image with Nginx
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies including Nginx
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    nginx \
    curl \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy application files
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker-entrypoint.sh /usr/local/bin/
COPY start.sh stop.sh ./
COPY README.md ./

# Create necessary directories and set permissions
RUN mkdir -p uploads outputs /var/log/nginx /var/log/supervisor && \
    chmod +x start.sh stop.sh /usr/local/bin/docker-entrypoint.sh

# Expose only frontend port (Nginx will proxy to backend internally)
EXPOSE 8080

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV BACKEND_HOST=127.0.0.1
ENV BACKEND_PORT=8000
ENV FRONTEND_PORT=8080

# Health check on frontend port only
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start command: Use entrypoint script
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
