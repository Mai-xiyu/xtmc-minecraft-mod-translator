#!/bin/bash
# Health check script for Docker container

set -e

echo "=== XTMC Translate Container Health Check ==="
echo ""

# Check if backend is responding
echo "1. Checking backend API..."
if curl -f -s http://127.0.0.1:8000/ > /dev/null 2>&1; then
    echo "   ✓ Backend API is responding"
else
    echo "   ✗ Backend API is not responding"
    exit 1
fi

# Check if nginx is running
echo "2. Checking Nginx..."
if curl -f -s http://127.0.0.1:8080/ > /dev/null 2>&1; then
    echo "   ✓ Nginx is serving frontend"
else
    echo "   ✗ Nginx is not responding"
    exit 1
fi

# Check API proxy
echo "3. Checking API proxy..."
if curl -f -s http://127.0.0.1:8080/api/ > /dev/null 2>&1; then
    echo "   ✓ API proxy is working"
else
    echo "   ✗ API proxy is not working"
    exit 1
fi

echo ""
echo "=== All checks passed! ==="
exit 0
