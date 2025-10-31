#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/packages/db
pnpm run migrate:prod

echo "Starting API server..."
cd /app/apps/api
exec node dist/server.js

