# Docker Setup Guide

## Quick Start

### 1. Build and Start All Services

```bash
make build
make up
```

Or using docker-compose directly:

```bash
docker-compose build
docker-compose up -d
```

### 2. Run Migrations

```bash
make migrate
```

Or:

```bash
docker-compose exec api pnpm --filter @inkwave/db drizzle:migrate
```

### 3. Seed Database

```bash
make seed
```

Or:

```bash
docker-compose exec api pnpm --filter @inkwave/db seed
```

### 4. Access Services

- **API**: http://localhost:3000
- **Customer PWA**: http://localhost:5173
- **Dashboard**: http://localhost:5174
- **PostgreSQL**: localhost:5432

## Useful Commands

### View Logs

```bash
# All services
make logs

# Specific service
make logs-api
make logs-pwa
make logs-dashboard

# Or with docker-compose
docker-compose logs -f api
```

### Restart Services

```bash
make restart

# Or specific service
docker-compose restart api
```

### Stop Services

```bash
make down
```

### Clean Everything

```bash
make clean  # Removes containers, volumes, and images
```

### Access Containers

```bash
# API shell
make shell-api

# Database shell
make shell-db

# Or with docker-compose
docker-compose exec api sh
docker-compose exec postgres psql -U postgres -d inkwave
```

### Check Status

```bash
make ps

# Or
docker-compose ps
```

## Development Workflow

### Hot Reload

All services support hot reload out of the box:

- **API**: Changes in `apps/api/src` are automatically reloaded by `tsx watch`
- **Customer PWA**: Changes in `apps/customer-pwa/src` trigger Vite HMR
- **Dashboard**: Changes in `apps/dashboard/src` trigger Vite HMR

### Debugging

1. **View logs**:
   ```bash
   make logs-api
   ```

2. **Check health**:
   ```bash
   curl http://localhost:3000/health
   ```

3. **Database queries**:
   ```bash
   make shell-db
   # Then run SQL queries
   SELECT * FROM tenants;
   ```

## Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Customer PWA   │      │   Dashboard     │      │      API        │
│  (Vite)         │      │   (Vite)        │      │   (Express)     │
│  Port: 5173     │      │   Port: 5174    │      │   Port: 3000    │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         │                        │                        │
         └────────────────────────┴───────────────────────┤
                                                           │
                                                  ┌────────▼────────┐
                                                  │   PostgreSQL    │
                                                  │   Port: 5432    │
                                                  └─────────────────┘
```

## Environment Variables

Create `.env` file in the root (optional, defaults are provided):

```bash
# Clerk (for dashboard authentication)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx

# Custom database settings (optional)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/inkwave
```

## Troubleshooting

### Port Already in Use

If you get port conflicts:

1. Stop services using those ports
2. Or change ports in `docker-compose.yml`

### Containers Not Starting

```bash
# Check logs
docker-compose logs

# Rebuild from scratch
make clean
make build
make up
```

### Database Connection Issues

```bash
# Check if postgres is healthy
docker-compose ps

# Restart postgres
docker-compose restart postgres

# Check postgres logs
docker-compose logs postgres
```

### Module Resolution Issues

If you see TypeScript/module errors:

```bash
# Rebuild containers
make rebuild
```

## Production Build

To build for production:

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Run production
docker-compose -f docker-compose.prod.yml up -d
```

## Performance Tips

1. **Use Docker Desktop with** VirtioFS (macOS) or WSL2 (Windows) for better filesystem performance
2. **Increase Docker memory** allocation to at least 4GB
3. **Use volumes** for node_modules (already configured)
4. **Prune unused resources** regularly:
   ```bash
   docker system prune -a
   ```

## Next Steps

After setup:

1. ✅ All services are running
2. ✅ Database is migrated and seeded
3. 🔄 Start building features!

Check the [Implementation Plan](./docs/implementation-plan.md) for the development roadmap.

