#!/bin/bash
# Docker entrypoint script to ensure proper startup

set -e

echo "=========================================="
echo "  XTMC Translate Docker Container"
echo "=========================================="
echo ""

# Create necessary directories
mkdir -p /app/uploads /app/outputs /var/log/nginx /var/log/supervisor

# Initialize stats file if not exists
if [ ! -f /app/stats.json ]; then
    echo '{"visits": 0, "usage": 0}' > /app/stats.json
fi

echo "Starting services with Supervisor..."
echo ""

# Start supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
