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

- **Node.js** >= 20.0.0
- **pnpm** >= 8.0.0
- **Docker Desktop** (for local PostgreSQL)
- **Clerk account** (for authentication - get free account at [clerk.com](https://clerk.com))
- **Cloudflare R2** (optional for image uploads)
- **Sentry account** (optional for error tracking)
- **Slack workspace** (optional for notifications)

### Step-by-Step Installation

#### 1. Install Dependencies
```bash
pnpm install
```

#### 2. Start PostgreSQL Database
```bash
docker compose up -d
```
This starts PostgreSQL on port 5432.

#### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Environment
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inkwave

# Clerk Authentication (required - get from https://dashboard.clerk.com)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Cloudflare R2 (optional for local dev)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=inkwave-images
R2_PUBLIC_URL=https://pub-....r2.dev

# WebSocket
VITE_WS_URL=ws://localhost:3000

# Sentry (optional for local dev)
SENTRY_DSN=https://...@sentry.io/...
VITE_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=development

# Slack (optional for local dev)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_ALERTS_ENABLED=false

# Super Admin (use your Clerk account email)
SUPER_ADMIN_EMAIL_1=your-email@example.com
```

> **Note**: Vite requires `VITE_` prefix for environment variables to be exposed to the frontend.

#### 4. Setup Database

Generate and run migrations:
```bash
pnpm --filter @inkwave/db drizzle:generate
pnpm --filter @inkwave/db drizzle:migrate
```

Seed with demo data (optional):
```bash
pnpm --filter @inkwave/db seed
```

#### 5. Start Development Servers

Open 3 terminal windows:

**Terminal 1 - API:**
```bash
pnpm dev:api
```

**Terminal 2 - Customer App:**
```bash
pnpm dev:customer
```

**Terminal 3 - Dashboard:**
```bash
pnpm dev:dashboard
```

Access:
- **API**: http://localhost:3000
- **Customer App**: http://localhost:5173
- **Dashboard**: http://localhost:5174

#### 6. Verify Setup & Test

1. **Check API health:**
   ```bash
   curl http://localhost:3000/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

2. **Sign in to Dashboard** (http://localhost:5174)
   - Sign in with your Clerk account
   - If your email matches `SUPER_ADMIN_EMAIL_1`, you'll see tenant management
   - Otherwise, you'll see your tenant's dashboard

3. **Test the Complete Flow:**
   - In dashboard, create a venue and menu items
   - Go to Tables tab and create a table
   - Download the QR code
   - Scan QR code with your phone (or copy/paste URL to browser)
   - Browse the menu and add items to cart
   - Place an order
   - See the order appear in KDS in real-time! ✨

### Alternative: Docker Compose

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Rebuild after code changes
docker compose up -d --build
```

## 📦 Package Management (Docker)

When using Docker Compose, packages must be installed inside the containers:

```bash
# Customer app
docker compose exec customer pnpm -F customer add <package>

# Dashboard app
docker compose exec dashboard pnpm -F dashboard add <package>

# API
docker compose exec api pnpm -F api add <package>
```

The `entrypoint.sh` automatically detects `pnpm-lock.yaml` changes and reinstalls dependencies. No manual rebuild or restart needed.

**Example:**
```bash
# Install sonner for customer app
docker compose exec customer pnpm -F customer add sonner

# The container automatically picks up the change
# Start using the package in your code immediately
```

## 🔧 Environment Variables

See the Quick Start section above for the complete `.env` configuration. All environment variables are documented inline with descriptions.

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

Comprehensive documentation is organized in the [`docs/`](docs/) folder:

### Quick Links
- **[Documentation Index](docs/README.md)** - Complete navigation guide
- **[Current System Status](docs/CURRENT_STATE.md)** - What's working and what needs attention
- **[Roadmap](docs/ROADMAP.md)** - Planned features and priorities

### Feature Documentation
- **[Authentication](docs/features/authentication.md)** - Clerk auth, webhooks, roles
- **[Menu Management](docs/features/menu-management.md)** - Menus, categories, items, options
- **[Tables & QR Codes](docs/features/table-qr-management.md)** - Table management and QR generation
- **[Orders & KDS](docs/features/orders-kds.md)** - Order lifecycle and Kitchen Display
- **[Tenant Settings](docs/features/tenant-settings.md)** - Branding and theming
- **[Monitoring](docs/features/monitoring-operations.md)** - WebSocket monitoring and Slack alerts

### Deployment Guides
- **[General Deployment](docs/deployment/deployment.md)** - Deployment overview
- **[Docker Setup](docs/deployment/docker.md)** - Docker configuration
- **[Render Deployment](docs/deployment/render.md)** - Render.com guide

> **Tip**: All documentation is AI-friendly with comprehensive context in each file.

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

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps

# View PostgreSQL logs
docker logs inkwave-postgres

# Restart database
docker compose down && docker compose up -d
```

### Port Already in Use
- **API (3000)**: Change `PORT` in `.env`
- **Customer (5173)**: Change port in `apps/customer/vite.config.ts`
- **Dashboard (5174)**: Change port in `apps/dashboard/vite.config.ts`

### API Won't Start
- Verify `.env` file exists with correct `DATABASE_URL`
- Ensure PostgreSQL is running
- Check migrations ran successfully
- View logs: `docker-compose logs api`

### Clerk Authentication Issues
- Verify `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are correct
- Ensure webhook secret (`CLERK_WEBHOOK_SECRET`) matches Clerk dashboard
- Check your email is set as `SUPER_ADMIN_EMAIL_1`
- Clear browser cache and hard refresh

### WebSocket Not Connecting
- Verify `VITE_WS_URL` in `.env` (default: `ws://localhost:3000`)
- Ensure API is running
- Check browser console for WebSocket errors
- Try refreshing the page

### Orders Not Appearing in Real-Time
- Check WebSocket connection status in browser console
- Verify venue ID matches between customer app and dashboard
- Refresh both customer app and dashboard
- Check API logs for WebSocket errors

### Images Not Uploading
- Verify Cloudflare R2 credentials in `.env`
- Check R2 bucket exists and is accessible
- View API logs for upload errors
- For local dev, R2 is optional (will show errors but won't break)

### pnpm Install Issues
```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Docker Build Fails
```bash
# Clear cache and rebuild
docker-compose build --no-cache
docker-compose down -v
docker-compose up -d
```

### Still Having Issues?
1. Check [docs/features/](docs/features/) for feature-specific troubleshooting
2. Review [docs/CURRENT_STATE.md](docs/CURRENT_STATE.md) for known issues
3. Check API health: `curl http://localhost:3000/health`
4. View detailed health: `curl http://localhost:3000/health/detailed`

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
