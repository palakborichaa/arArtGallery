#!/bin/bash

# Production startup script for AR Module

echo "🎨 Starting AR Module Application..."

# Build the Docker image
echo "📦 Building Docker image..."
docker compose build

# Start the application
echo "🚀 Starting application..."
docker compose up -d

# Show status
echo "📊 Application Status:"
docker compose ps

echo ""
echo "✅ AR Module is now running!"
echo "🌐 Access your application at: http://localhost:7861"
echo ""
echo "📋 Useful commands:"
echo "  View logs:     docker compose logs -f"
echo "  Stop app:      docker compose down"
echo "  Restart:       docker compose restart"
echo "  Update app:    docker compose down && docker compose up -d --build"