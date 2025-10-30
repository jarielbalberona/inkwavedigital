#!/bin/bash

# Inkwave Digital - Development Restart Script

echo "🔄 Restarting Inkwave Digital development environment..."

# Kill any existing processes
echo "📛 Stopping existing processes..."
pkill -f "vite.*inkwavedigital" || true
pkill -f "nodemon.*inkwavedigital" || true

# Rebuild utils package
echo "🔨 Building utils package..."
cd packages/utils
pnpm build

# Start services in background with logs
echo "🚀 Starting services..."

# Start API
cd ../../apps/api
pnpm dev > ../../logs/api.log 2>&1 &
API_PID=$!
echo "   API started (PID: $API_PID) - logs: logs/api.log"

# Wait a bit for API to start
sleep 3

# Start Dashboard
cd ../dashboard
pnpm dev > ../../logs/dashboard.log 2>&1 &
DASHBOARD_PID=$!
echo "   Dashboard started (PID: $DASHBOARD_PID) - logs: logs/dashboard.log"

# Start Customer PWA
cd ../customer
pnpm dev > ../../logs/customer.log 2>&1 &
CUSTOMER_PID=$!
echo "   Customer PWA started (PID: $CUSTOMER_PID) - logs: logs/customer.log"

cd ../..

echo ""
echo "✅ All services started!"
echo ""
echo "📊 Access:"
echo "   API:       http://localhost:3000"
echo "   Dashboard: http://localhost:5174"
echo "   Customer:  http://localhost:5173"
echo ""
echo "📝 View logs:"
echo "   tail -f logs/api.log"
echo "   tail -f logs/dashboard.log"
echo "   tail -f logs/customer.log"
echo ""
echo "🛑 To stop all services:"
echo "   kill $API_PID $DASHBOARD_PID $CUSTOMER_PID"

