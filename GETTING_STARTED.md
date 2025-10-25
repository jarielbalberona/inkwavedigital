# Getting Started with Ink Wave Digital

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** >= 20.0.0
- **pnpm** >= 8.0.0
- **Docker Desktop** (for local PostgreSQL)

## Installation Steps

### 1. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for all apps and packages in the monorepo.

### 2. Start Local Database

```bash
docker compose up -d
```

This starts a PostgreSQL container on port 5432.

### 3. Configure Environment Variables

Create `.env` files from the examples:

```bash
# API
cp apps/api/.env.example apps/api/.env

# Customer PWA
cp apps/customer-pwa/.env.example apps/customer-pwa/.env

# Dashboard
cp apps/dashboard/.env.example apps/dashboard/.env
```

### 4. Setup Database

Generate and run migrations:

```bash
pnpm --filter @inkwave/db drizzle:generate
pnpm --filter @inkwave/db drizzle:migrate
```

Seed with demo data:

```bash
pnpm --filter @inkwave/db seed
```

This creates:
- 1 demo tenant ("Demo Café")
- 1 demo venue ("Demo Café Branch 1")
- 5 demo tables

### 5. Start Development Servers

Open 3 terminal windows/tabs:

**Terminal 1 - API:**
```bash
pnpm dev:api
```
API will run on http://localhost:3000

**Terminal 2 - Customer PWA:**
```bash
pnpm dev:pwa
```
PWA will run on http://localhost:5173

**Terminal 3 - Dashboard:**
```bash
pnpm dev:dashboard
```
Dashboard will run on http://localhost:5174

### 6. Verify Setup

1. Open http://localhost:5173 (Customer PWA)
   - You should see "API is OK" with a green checkmark
   
2. Open http://localhost:5174 (Dashboard)
   - You should see "API is OK" with a green checkmark
   - Clerk sign-in will show (needs configuration)

## Troubleshooting

### Database Connection Issues

If migrations fail:
```bash
# Check if Postgres is running
docker ps

# View logs
docker logs inkwave-postgres

# Restart database
docker compose down
docker compose up -d
```

### Port Conflicts

If ports are already in use:
- API (3000): Change `PORT` in `apps/api/.env`
- PWA (5173): Change in `apps/customer-pwa/vite.config.ts`
- Dashboard (5174): Change in `apps/dashboard/vite.config.ts`

### pnpm Issues

Clear cache and reinstall:
```bash
pnpm store prune
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

## Useful Commands

### Development
```bash
pnpm dev:api          # Start API only
pnpm dev:pwa          # Start PWA only
pnpm dev:dashboard    # Start dashboard only
```

### Database
```bash
pnpm --filter @inkwave/db drizzle:studio    # Open Drizzle Studio
pnpm --filter @inkwave/db drizzle:generate  # Generate migrations
pnpm --filter @inkwave/db drizzle:migrate   # Run migrations
pnpm --filter @inkwave/db seed              # Seed database
```

### Code Quality
```bash
pnpm typecheck        # Check TypeScript across all packages
pnpm lint             # Lint all packages
pnpm format           # Format code with Prettier
```

### Build
```bash
pnpm build            # Build all apps for production
```

## Next Steps

Once the skeleton is verified working:

1. **Phase 1**: Build domain layer and use cases
2. **Phase 2**: Implement ordering flow
3. **Phase 3**: Add real-time features (WebSocket)
4. **Phase 4**: Integrate Cloudflare R2 for images
5. **Phase 5**: Deploy to Render

## Project Structure

```
inkwavedigital/
├── apps/
│   ├── api/              # Express API with Clean Architecture
│   ├── customer-pwa/     # Customer-facing PWA (Vite + React)
│   └── dashboard/        # Merchant dashboard (Vite + React + Clerk)
├── packages/
│   ├── db/               # Database schema and migrations
│   ├── types/            # Shared TypeScript types
│   ├── ui/               # Shared UI components
│   └── utils/            # Shared utilities
├── docs/                 # Documentation
└── docker-compose.yml    # Local development database
```

## Need Help?

- Check `docs/implementation-plan.md` for the complete plan
- Review `README.md` for architecture overview
- Check API health: `curl http://localhost:3000/health`

## Clean Architecture

The API follows Clean Architecture (DDD + DI):

- **Domain**: Pure business logic (entities, value objects)
- **Application**: Use cases orchestrating domain logic
- **Infrastructure**: External services (database, storage, etc.)
- **Interfaces**: HTTP controllers and middleware

Dependencies flow inward: Infrastructure depends on Application, which depends on Domain.

## What's Working Now

✅ Monorepo with pnpm workspaces  
✅ All 4 apps scaffold created  
✅ TypeScript, ESLint, Prettier configured  
✅ Database schema defined  
✅ API with Clean Architecture structure  
✅ Customer PWA calling API  
✅ Dashboard with Clerk auth calling API  
✅ Docker Compose for local development  

## What's Next

🚧 Domain layer implementation  
🚧 Use cases implementation  
🚧 Repository implementations  
🚧 Menu and ordering endpoints  
🚧 Real-time WebSocket connections  
🚧 PWA features (manifest, service worker)  
🚧 Image upload with Cloudflare R2  
🚧 Deployment to Render  

