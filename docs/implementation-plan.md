# Ink Wave Digital - Implementation Plan

## Overview

Build a multi-tenant QR-based ordering platform for cafés: **Scan → Menu → Order → KDS → Notifications**. Deploy on Render with managed Postgres and Cloudflare R2 for images. Built with Clean Architecture (DDD + DI) using Express.js API and Vite + React frontends.

## Architecture Summary

### Stack

**Backend**
- Express.js with Clean Architecture (DDD + DI using tsyringe)
- Drizzle ORM + PostgreSQL
- WebSocket (ws library) for real-time updates
- Cloudflare R2 SDK for image storage
- Web Push API (VAPID)
- JWT/JWS (jose) for QR security
- Zod validation

**Frontends**
- Vite + React 18 + TypeScript
- TanStack Query with IndexedDB persistence (offline API cache)
- TanStack Router for routing
- Tailwind v4 + shadcn/ui
- Zustand (state management - cart, orders, session)
- Clerk React SDK (dashboard/admin)
- PWA (customer app only)

### Deployment (Render)

- `inkwave-api` → api.inkwave.app (Express API)
- `inkwave-customer-pwa` → m.inkwave.app (Vite PWA)
- `inkwave-dashboard` → dash.inkwave.app (Vite SPA - merchant + admin)
- `inkwave-postgres` (managed database)

### Monorepo Structure (pnpm workspaces)

```
inkwavedigital/
├── apps/
│   ├── api/                        # Express.js API
│   │   ├── src/
│   │   │   ├── domain/             # Entities, Value Objects, Repo interfaces
│   │   │   │   ├── entities/       # Order, MenuItem, Venue, etc.
│   │   │   │   ├── value-objects/  # Money, OrderStatus, etc.
│   │   │   │   └── repositories/   # IOrderRepository, IMenuRepository
│   │   │   ├── application/        # Use Cases
│   │   │   │   └── use-cases/      # CreateOrder, UpdateOrderStatus, etc.
│   │   │   ├── infrastructure/     # Real-world implementations
│   │   │   │   ├── persistence/    # Drizzle repo implementations
│   │   │   │   ├── storage/        # R2StorageService
│   │   │   │   ├── http/           # Express server setup
│   │   │   │   └── websocket/      # WebSocket manager
│   │   │   ├── interfaces/         # HTTP layer
│   │   │   │   ├── controllers/    # OrderController, MenuController
│   │   │   │   └── middlewares/    # Auth, validation, error handling
│   │   │   ├── shared/             # Common utilities
│   │   │   │   ├── errors/         # Domain errors
│   │   │   │   └── utils/          # Logger, validators
│   │   │   └── container/          # DI container (tsyringe)
│   │   └── server.ts
│   ├── customer-pwa/               # Vite + React PWA
│   │   ├── src/
│   │   │   ├── features/           # QR scan, menu, cart, orders
│   │   │   ├── components/         # UI components
│   │   │   ├── hooks/              # Custom hooks (useCart, useOrders)
│   │   │   ├── lib/                # API client, utils
│   │   │   └── routes/             # TanStack Router setup
│   │   ├── public/
│   │   │   ├── manifest.json       # PWA manifest
│   │   │   └── sw.js               # Service worker
│   │   └── vite.config.ts
│   └── dashboard/                  # Vite + React (merchant + admin)
│       ├── src/
│       │   ├── features/
│       │   │   ├── kds/            # Kitchen Display System
│       │   │   ├── menu/           # Menu management
│       │   │   ├── tables/         # Table management
│       │   │   ├── admin/          # Tenant/QR generation (admin only)
│       │   │   └── analytics/      # Basic analytics
│       │   ├── components/
│       │   ├── hooks/
│       │   └── lib/
│       └── vite.config.ts
├── packages/
│   ├── db/                         # Drizzle schema + migrations
│   │   ├── schema/                 # Table definitions
│   │   ├── migrations/             # SQL migrations
│   │   └── seed.ts                 # Seed data
│   ├── ui/                         # shadcn components (shared)
│   ├── types/                      # Shared Zod schemas + TS types
│   └── utils/                      # Shared utilities
├── docker-compose.yml              # Local Postgres + Redis (optional)
├── render.yaml                     # Render Blueprint
└── pnpm-workspace.yaml
```

## Current Implementation Status

### ✅ Phase 0: Skeleton Setup (COMPLETE)

1. ✅ Monorepo configuration (pnpm workspaces)
2. ✅ TypeScript, ESLint, Prettier setup
3. ✅ Docker Compose for local Postgres
4. ✅ Packages created:
   - `@inkwave/db` - Complete Drizzle schema (all tables including Phase 2)
   - `@inkwave/types` - Shared Zod schemas
   - `@inkwave/ui` - Base UI utilities
   - `@inkwave/utils` - Logger utilities
5. ✅ Express API skeleton with Clean Architecture structure
   - Health check endpoint (`/health`)
   - DI container setup with tsyringe
   - CORS and security middleware
6. ✅ Customer PWA skeleton
   - Vite + React setup
   - TanStack Query configured
   - API client calling health endpoint
7. ✅ Dashboard skeleton
   - Vite + React setup
   - Clerk authentication integrated
   - TanStack Query configured
   - API client calling health endpoint
8. ✅ End-to-end connectivity verified

**Test Results:**
- ✅ API responds to health checks
- ✅ Customer PWA successfully calls API
- ✅ Dashboard successfully calls API
- ✅ Clerk authentication flow working

### 🚧 Next: Phase 1 - Database & Domain Foundation

**Remaining Tasks:**
1. Run database migrations
2. Build domain layer (entities, value objects, repository interfaces)
3. Build application layer (use cases)
4. Build infrastructure (Drizzle repository implementations)
5. Complete DI container registrations

### 📋 Future Phases

**Phase 2: Core Features - Ordering Flow**
- API endpoints for orders, menu, QR validation
- Customer PWA ordering features
- Dashboard KDS view
- WebSocket real-time updates
- Web Push notifications

**Phase 3: Admin & Media**
- Admin features
- Cloudflare R2 integration
- Image uploads
- PWA features

**Phase 4: Polish & Deployment**
- Analytics
- Render deployment
- Phase 2 stubs (points, Wi-Fi)
- Documentation

## Core Data Model

**Multi-tenant structure:**
- `tenants` (id, name, slug, settings_json)
- `venues` (id, tenant_id, name, address, timezone)
- `tables` (id, venue_id, label, qr_code, is_active)
- `menus` (id, venue_id, name, is_active)
- `menu_categories` (id, menu_id, name, sort_index)
- `menu_items` (id, category_id, name, description, price, image_url, is_available)
- `item_options` (id, item_id, name, type [select/multi], required)
- `item_option_values` (id, option_id, label, price_delta)
- `orders` (id, venue_id, table_id, status, total, device_id, created_at)
- `order_items` (id, order_id, item_id, quantity, unit_price, notes, options_json)
- `order_events` (id, order_id, event_type, created_at, created_by)
- `users` (id, clerk_user_id, email, role, tenant_id)
- `device_tokens` (id, user_id, device_id, push_endpoint, keys_json)

**Phase 2 tables (created, not yet used):**
- `merchant_points` (user_id, venue_id, balance, updated_at)
- `point_transactions` (user_id, venue_id, delta, reason, order_id, created_at)
- `point_rules` (venue_id, earn_per_peso, redeem_rate, min_redeem)
- `wifi_tokens` (venue_id, table_id, token, status, expires_at, mac_address)
- `wifi_sessions` (venue_id, mac_address, started_at, ends_at, token_id)

## Development Workflow

### Local Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start database
docker compose up -d

# 3. Setup environment files
cp apps/api/.env.example apps/api/.env
cp apps/customer-pwa/.env.example apps/customer-pwa/.env
cp apps/dashboard/.env.example apps/dashboard/.env

# 4. Run migrations
pnpm --filter @inkwave/db drizzle:generate
pnpm --filter @inkwave/db drizzle:migrate

# 5. Seed database
pnpm --filter @inkwave/db seed

# 6. Start all services
pnpm dev:api      # Terminal 1
pnpm dev:pwa      # Terminal 2
pnpm dev:dashboard # Terminal 3
```

### Access Points
- API: http://localhost:3000
- Customer PWA: http://localhost:5173
- Dashboard: http://localhost:5174

## API Architecture (DDD + DI Pattern)

### Domain Layer (`src/domain/`)
Pure business logic, no framework dependencies.

**Entities:**
- `Order` (aggregate root: items, status transitions, validation)
- `MenuItem` (pricing, availability)
- `Venue` (multi-tenant scope)

**Value Objects:**
- `Money` (amount, currency)
- `OrderStatus` (NEW, PREPARING, READY, SERVED, CANCELLED)

**Repository Interfaces:**
- `IOrderRepository`
- `IMenuRepository`
- `IVenueRepository`

### Application Layer (`src/application/`)
Use cases orchestrate domain logic.

**Use Cases:**
- `CreateOrderUseCase`
- `UpdateOrderStatusUseCase`
- `GetMenuUseCase`
- `UpdateMenuItemUseCase`

### Infrastructure Layer (`src/infrastructure/`)
Real-world implementations.

**Persistence:**
- `DrizzleOrderRepository implements IOrderRepository`
- Database connection, migrations

**Storage:**
- `R2StorageService` (upload, signed URLs)

**WebSocket:**
- `WebSocketManager` (order updates, status changes)

### Interface Layer (`src/interfaces/`)
HTTP controllers and middleware.

**Controllers:**
- `OrderController` (create, update, list)
- `MenuController` (CRUD)
- `QRController` (validate, create session)

**Middlewares:**
- `validateJWS` (QR signature)
- `authenticate` (Clerk JWT)
- `validateRequest` (Zod)
- `errorHandler`

### Dependency Injection (`src/container/`)
tsyringe configuration.

```typescript
// Register services
container.register<IOrderRepository>("IOrderRepository", {
  useClass: DrizzleOrderRepository
});

container.register<CreateOrderUseCase>("CreateOrderUseCase", {
  useClass: CreateOrderUseCase
});
```

## State Management Strategy

### Customer PWA (Zustand Stores)
- `useCartStore` - Shopping cart state (items, quantities, options)
- `useOrderStore` - Active order tracking
- `useSessionStore` - Venue/table context from QR

### Dashboard (Zustand Stores)
- `useKDSStore` - Order queue for KDS view
- `useVenueStore` - Current venue context

### React Query Configuration
```typescript
{
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,         // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
}
```

IndexedDB persistence will be added via `@tanstack/query-persist-client-core` and `@tanstack/query-sync-storage-persister`.

## Security Checklist

✅ QR signatures (JWS) prevent table spoofing  
✅ Zod validation on all API inputs  
✅ Clerk JWT validation for authenticated routes  
✅ CORS restricted to known origins  
✅ Rate limiting (express-rate-limit)  
✅ Helmet.js security headers  
✅ Database prepared statements (Drizzle)  
✅ R2 signed URLs (time-limited uploads)  
✅ Environment variables (no secrets in code)  
✅ HTTPS only (enforced by Render)  

## MVP Acceptance Criteria

✅ Customer scans QR → venue/table loaded correctly  
✅ Menu displays with categories, images, prices  
✅ Add items with options → cart → submit order  
✅ Order appears instantly in KDS (WebSocket)  
✅ Merchant updates status → customer receives push  
✅ Menu changes reflect immediately  
✅ Multi-tenant isolation (merchants see only their data)  
✅ Admin can generate QR codes + download  
✅ Responsive on mobile  
✅ PWA installable on mobile devices  

## Next Steps

1. ✅ **Skeleton Complete** - All apps communicate successfully
2. 🔄 **Run Migrations** - Execute `pnpm --filter @inkwave/db drizzle:migrate`
3. 📝 **Domain Layer** - Implement entities and value objects
4. 🔨 **Use Cases** - Build application logic
5. 💾 **Repositories** - Implement data access
6. 🚀 **Features** - Start building core ordering flow

---

**Last Updated:** Initial skeleton implementation complete
**Status:** ✅ Ready for Phase 1 development

