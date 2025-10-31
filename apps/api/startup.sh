#!/bin/sh
set -e

echo "Starting API server..."
cd /app/apps/api
exec node dist/server.js

