#!/bin/bash
echo "Testing Nginx proxy configuration..."
echo ""
echo "1. Testing frontend root:"
curl -I http://localhost:8080/
echo ""
echo "2. Testing API proxy:"
curl -v http://localhost:8080/api/
