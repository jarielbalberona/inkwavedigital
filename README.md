# Ink Wave Digital

Multi-tenant QR-based ordering platform for cafés with real-time updates, built with Clean Architecture.

## 🏗️ Architecture

- **Backend**: Express.js API with Clean Architecture (DDD + DI)
- **Frontend**: Vite + React + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Real-time**: WebSocket for live order updates
- **Storage**: Cloudflare R2
- **Auth**: Clerk
- **Monitoring**: Sentry + Slack notifications
- **Deployment**: Docker Compose + Render

## ✨ Key Features

### 🔄 Real-time Updates
- **WebSocket Integration**: Live order status updates across customer and dashboard apps
- **No Polling**: Efficient server-side push notifications
- **Automatic Reconnection**: Resilient connection handling

### 📊 Monitoring & Observability
- **Sentry Integration**: Full error tracking with stack traces, breadcrumbs, and session replay
- **Slack Notifications**: Real-time alerts for critical errors and operational events
- **Performance Monitoring**: API request timing, slow query detection, memory usage tracking
- **Health Checks**: Multiple endpoints for application status (`/health`, `/health/detailed`, `/health/ready`, `/health/live`)

### 🎯 Multi-tenancy
- **Tenant & Venue Management**: Full isolation between restaurants
- **Slug-based URLs**: SEO-friendly customer-facing URLs
- **Role-based Access**: Super Admin, Tenant Admin, Venue Manager, Venue Staff

### 🍽️ Ordering System
- **QR Code Ordering**: Contactless menu browsing and ordering
- **KDS (Kitchen Display System)**: Real-time order management for staff
- **Order Status Tracking**: Live updates for customers
- **Table Management**: Support for dine-in and takeaway orders

## 📦 Monorepo Structure

```
inkwavedigital/
├── apps/
│   ├── api/              # Express API (Clean Architecture + WebSocket)
│   ├── customer/         # Customer-facing PWA (QR ordering)
│   └── dashboard/        # Merchant/Admin dashboard (KDS + Management)
├── packages/
│   ├── db/               # Drizzle schema & migrations
│   ├── types/            # Shared TypeScript types
│   └── utils/            # Shared utilities (logger, Slack notifier)
└── docs/                 # Implementation guides & documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 8
- Docker & Docker Compose
- Sentry account (optional, for error tracking)
- Slack workspace (optional, for notifications)

### Installation

```bash
# Install dependencies
pnpm install

# Create root .env file (centralized configuration)
cp .env.example .env
# Edit .env with your credentials (see Environment Variables section)

# Start services with Docker Compose
docker-compose up -d

# OR run locally in development:

# Generate and run database migrations
pnpm --filter @inkwave/db drizzle:generate
pnpm --filter @inkwave/db drizzle:migrate

# Seed database with demo data
pnpm --filter @inkwave/db seed
```

### Development (Local)

Run all services in separate terminals:

```bash
# Terminal 1: API
cd apps/api && pnpm dev

# Terminal 2: Customer PWA
cd apps/customer && pnpm dev

# Terminal 3: Dashboard
cd apps/dashboard && pnpm dev
```

Access:
- **API**: http://localhost:3000
- **Customer PWA**: http://localhost:5173
- **Dashboard**: http://localhost:5174

### Development (Docker)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose build
docker-compose up -d
```

## 🔧 Environment Variables

Create a `.env` file in the project root:

```bash
# Environment
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inkwave

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Cloudflare R2 Storage
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=inkwave-images
R2_PUBLIC_URL=https://pub-....r2.dev

# WebSocket
VITE_WS_URL=ws://localhost:3000/ws

# Sentry Error Tracking
SENTRY_DSN=https://...@o....ingest.us.sentry.io/...          # Backend
VITE_SENTRY_DSN=https://...@o....ingest.us.sentry.io/...     # Frontend
SENTRY_ENVIRONMENT=development

# Slack Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...       # Error alerts
SLACK_ALERTS_ENABLED=true
SLACK_OPERATIONS_ENABLED=false                                # Optional: order notifications

# Performance
SLOW_REQUEST_THRESHOLD_MS=1000

# Super Admins
SUPER_ADMIN_EMAIL_1=admin@example.com
```

> **Note**: Vite requires `VITE_` prefix for environment variables to be exposed to the frontend.

## 🧪 Testing

### Backend API Tests

```bash
# Test Sentry error tracking
curl http://localhost:3000/api/v1/test/debug-sentry

# Health checks
curl http://localhost:3000/health
curl http://localhost:3000/health/detailed
curl http://localhost:3000/health/ready
curl http://localhost:3000/health/live
```

### Frontend Tests

1. Open Customer PWA: http://localhost:5173
2. Look for the red **"🔥 Test Sentry Error"** button (bottom-right, development only)
3. Click it to trigger a test error and verify Sentry capture

## 📊 Monitoring & Alerts

### Sentry Setup

1. Create projects in Sentry (separate for backend and frontend):
   - **Backend**: Node.js project
   - **Customer**: React project  
   - **Dashboard**: React project

2. Copy DSN values to `.env`:
   ```bash
   SENTRY_DSN=<backend-dsn>
   VITE_SENTRY_DSN=<frontend-dsn>
   ```

3. Sentry will automatically capture:
   - Unhandled exceptions
   - API errors with full context
   - Frontend errors with component stack
   - Performance metrics
   - Session replays (for frontend)

### Slack Notifications

1. Create a Slack App using the provided manifests:
   - **Error Alerts**: `slack-app-manifest.yaml` (technical notifications)
   - **Operations**: `slack-app-manifest-operations.yaml` (business notifications)

2. Enable Incoming Webhooks and copy webhook URLs to `.env`

3. Error notifications will automatically include:
   - Error message and stack trace
   - Environment and service info
   - Link to Sentry for full details
   - Throttling to prevent spam

See `SLACK_SETUP_GUIDE.md` and `SLACK_OPERATIONS_SETUP.md` for detailed instructions.

## 🗄️ Database

### Commands

```bash
# Generate migrations
pnpm --filter @inkwave/db drizzle:generate

# Run migrations
pnpm --filter @inkwave/db drizzle:migrate

# Open Drizzle Studio (GUI)
pnpm --filter @inkwave/db drizzle:studio

# Seed database
pnpm --filter @inkwave/db seed
```

### Schema

Key entities:
- **Tenants**: Top-level organizations (restaurants/brands)
- **Venues**: Physical locations
- **Menus**: Menu structure with categories and items
- **Orders**: Customer orders with status tracking
- **Tables**: Dine-in table management
- **QR Codes**: Links to specific venues

## 🔧 Tech Stack

### Backend
- Express.js + TypeScript
- tsyringe (Dependency Injection)
- Drizzle ORM + PostgreSQL
- WebSocket (ws) - Real-time updates
- Sentry - Error tracking
- Pino - Structured logging
- Zod - Runtime validation
- Sharp - Image processing
- Clerk - Webhook handling

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- TanStack Query (with IndexedDB persistence)
- React Router
- Tailwind CSS v4
- shadcn/ui components
- Clerk (authentication)
- Sentry (error tracking)
- WebSocket client (real-time)

### Infrastructure
- Docker + Docker Compose
- PostgreSQL
- Cloudflare R2 (S3-compatible storage)
- Slack webhooks
- Sentry (monitoring)

## 📋 Implementation Status

✅ **Core Infrastructure**
- [x] Monorepo with pnpm workspaces
- [x] Clean Architecture (API)
- [x] Docker Compose setup
- [x] Database schema & migrations
- [x] Multi-tenancy foundation
- [x] Image upload to R2

✅ **Authentication & Authorization**
- [x] Clerk integration
- [x] Role-based access control
- [x] Webhook signature verification
- [x] Super admin system

✅ **Ordering System**
- [x] QR code generation
- [x] Menu browsing (slug-based URLs)
- [x] Cart management
- [x] Order placement
- [x] Order status tracking
- [x] Kitchen Display System (KDS)

✅ **Real-time Features**
- [x] WebSocket server
- [x] Live order updates (customer)
- [x] Live order updates (dashboard)
- [x] Automatic reconnection

✅ **Monitoring & Observability**
- [x] Sentry error tracking (backend + frontend)
- [x] Slack error notifications
- [x] Performance monitoring
- [x] Health check endpoints
- [x] Structured logging

✅ **Admin Features**
- [x] Tenant management
- [x] Venue management
- [x] Menu management (CRUD)
- [x] Table management
- [x] Image library
- [x] QR code management

🚧 **In Progress**
- [ ] Payment processing
- [ ] Advanced reporting
- [ ] Customer accounts
- [ ] Order history

## 📚 Documentation

Detailed guides available:
- `WEBHOOK_IMPLEMENTATION_COMPLETE.md` - Clerk webhook setup
- `MONITORING_SETUP.md` - Sentry and Slack configuration
- `SLACK_SETUP_GUIDE.md` - Slack app creation
- `WEBSOCKET_MONITORING_IMPLEMENTATION.md` - Real-time features
- `MENU_IMPLEMENTATION_STATUS.md` - Menu system details
- `QR_CODE_SLUG_IMPLEMENTATION_COMPLETE.md` - URL structure

## 🚢 Deployment

### Docker Production

```bash
# Build production images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f api
```

### Render (Planned)

Deployment via Render Blueprint (`render.yaml`) with:
- Managed PostgreSQL
- API Web Service
- Static Sites for frontends

## 🛠️ Development Scripts

```bash
# Root scripts
pnpm dev:api        # Start API
pnpm dev:customer   # Start customer PWA
pnpm dev:dashboard  # Start dashboard

# Package-specific
pnpm --filter api build
pnpm --filter customer build
pnpm --filter dashboard build

# Database
pnpm --filter @inkwave/db drizzle:generate
pnpm --filter @inkwave/db drizzle:migrate
pnpm --filter @inkwave/db drizzle:studio
```

## 🐛 Troubleshooting

### API won't start
- Check `.env` file exists and has correct DATABASE_URL
- Ensure PostgreSQL is running: `docker-compose up -d postgres`
- Check logs: `docker-compose logs api`

### WebSocket not connecting
- Verify `VITE_WS_URL` in `.env`
- Check API is running on port 3000
- Look for WebSocket errors in browser console

### Sentry not capturing errors
- Verify DSN values in `.env` are correct
- Check API logs for "Sentry initialized" message
- Test with `/api/v1/test/debug-sentry` endpoint

### Docker build fails
- Clear cache: `docker-compose build --no-cache`
- Remove volumes: `docker-compose down -v`
- Check disk space

## 📝 License

Private - Ink Wave Digital

## 👥 Contributing

This is a private project for Ink Wave Digital. For team members:

1. Create feature branch from `main`
2. Follow existing code patterns and architecture
3. Update documentation for significant changes
4. Test locally before pushing
5. Create PR with clear description

## 🔗 Links

- **Sentry**: https://sentry.io
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Cloudflare R2**: https://dash.cloudflare.com

---

**Built with ❤️ by Ink Wave Digital**
