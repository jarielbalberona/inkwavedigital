#!/bin/sh
set -eu

echo "============================================"
echo "🚀 Running pre-deploy tasks..."
echo "============================================"

# Run database migrations
echo ""
echo "📊 Running database migrations..."
node /app/packages/db/dist/migrate.js

echo ""
echo "============================================"
echo "✅ Pre-deploy tasks completed successfully!"
echo "============================================"

