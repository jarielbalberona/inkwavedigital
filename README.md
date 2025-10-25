# Ink Wave Digital

Multi-tenant QR-based ordering platform for cafés built with Clean Architecture.

## 🏗️ Architecture

- **Backend**: Express.js API with DDD + DI (tsyringe)
- **Frontend**: Vite + React + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Storage**: Cloudflare R2
- **Auth**: Clerk
- **Deployment**: Render

## 📦 Monorepo Structure

```
inkwavedigital/
├── apps/
│   ├── api/              # Express API (Clean Architecture)
│   ├── customer-pwa/     # Customer-facing PWA
│   └── dashboard/        # Merchant/Admin dashboard
├── packages/
│   ├── db/               # Drizzle schema & migrations
│   ├── types/            # Shared TypeScript types
│   ├── ui/               # Shared UI components
│   └── utils/            # Shared utilities
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 8
- Docker (for local Postgres)

### Installation

```bash
# Install dependencies
pnpm install

# Start local database
docker compose up -d

# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/customer-pwa/.env.example apps/customer-pwa/.env
cp apps/dashboard/.env.example apps/dashboard/.env

# Generate and run migrations
pnpm --filter @inkwave/db drizzle:generate
pnpm --filter @inkwave/db drizzle:migrate

# Seed database with demo data
pnpm --filter @inkwave/db seed
```

### Development

Run all services in separate terminals:

```bash
# Terminal 1: API
pnpm dev:api

# Terminal 2: Customer PWA
pnpm dev:pwa

# Terminal 3: Dashboard
pnpm dev:dashboard
```

Access:
- **API**: http://localhost:3000
- **Customer PWA**: http://localhost:5173
- **Dashboard**: http://localhost:5174

### Testing the Setup

Once all services are running, both frontends should show a green "API is OK" status, confirming end-to-end connectivity.

## 📚 Documentation

See [docs/implementation-plan.md](docs/implementation-plan.md) for the complete implementation plan.

## 🗄️ Database

### Commands

```bash
# Generate migrations
pnpm --filter @inkwave/db drizzle:generate

# Run migrations
pnpm --filter @inkwave/db drizzle:migrate

# Open Drizzle Studio
pnpm --filter @inkwave/db drizzle:studio

# Seed database
pnpm --filter @inkwave/db seed
```

## 🔧 Tech Stack

### Backend
- Express.js
- TypeScript
- tsyringe (Dependency Injection)
- Drizzle ORM
- PostgreSQL
- Zod (validation)
- WebSocket (ws)

### Frontend
- React 18
- TypeScript
- Vite
- TanStack Query (with IndexedDB persistence)
- TanStack Router
- Zustand (state management)
- Tailwind CSS v4
- shadcn/ui
- Clerk (auth)

## 📋 Current Status

✅ **Phase 0: Skeleton Setup** (Complete)
- [x] Monorepo structure with pnpm workspaces
- [x] Shared packages (db, types, ui, utils)
- [x] Express API with Clean Architecture
- [x] Customer PWA with Vite + React
- [x] Dashboard with Vite + React + Clerk
- [x] Docker Compose for local Postgres
- [x] End-to-end connectivity test (API ↔ Frontends)

🚧 **Phase 1: Database & Domain Foundation** (Next)
- [ ] Complete domain layer
- [ ] Application use cases
- [ ] Repository implementations

## 🚢 Deployment

Deployment will be handled via Render Blueprint (`render.yaml`) with:
- Managed PostgreSQL
- API Web Service
- Static Sites for frontends

## 📝 License

Private - Ink Wave Digital

## 👥 Team

Ink Wave Digital Development Team

