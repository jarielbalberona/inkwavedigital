# Environment Variables Setup

This project uses a **single root `.env` file** for all environment variables across all apps.

## 📁 File Location
```
/.env  ← All environment variables go here
```

## 🚀 How It Works

### 1. **Root `.env` File**
All apps read from the root `.env` file using dotenv.

### 2. **Apps Configuration**

#### API (`apps/api`)
- Uses `dotenv` in `apps/api/src/server.ts`
- Reads: `DATABASE_URL`, `PORT`, `SUPER_ADMIN_EMAIL_*`, etc.

#### Dashboard (`apps/dashboard`)
- Uses Vite env variables prefixed with `VITE_`
- Reads: `VITE_API_BASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`

#### Customer App (`apps/customer`)
- Uses Vite env variables prefixed with `VITE_`
- Reads: `VITE_API_BASE_URL`

#### Packages (e.g., `packages/db`)
- Uses `process.env.DATABASE_URL` directly
- Called from API app that already loaded `.env`

## 📝 Setup Instructions

### 1. Create `.env` file in project root
```bash
cp .env.example .env
```

### 2. Fill in your values
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inkwave

# Super Admin Emails
SUPER_ADMIN_EMAIL_1=admin@inkwave.com

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx

# Frontend URLs
VITE_API_BASE_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

### 3. Start the apps
```bash
# From root
pnpm dev

# Or individual apps
pnpm dev:api
pnpm dev:dashboard
pnpm dev:pwa
```

## 🔒 Security

- `.env` is in `.gitignore` (never commit!)
- Each environment should have its own `.env` file
- Use different values for dev/staging/production

## 📋 Environment Variables Reference

### Backend (API)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `PORT` | API server port | `3000` |
| `SUPER_ADMIN_EMAIL_1` | Primary super admin email | `admin@inkwave.com` |
| `SUPER_ADMIN_EMAIL_2` | Secondary super admin email | (optional) |
| `SUPER_ADMIN_EMAIL_3` | Tertiary super admin email | (optional) |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173,http://localhost:5174` |

### Frontend (Dashboard & Customer)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | API server URL | `http://localhost:3000` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | `pk_test_xxxxx` |

## ⚙️ How Vite Environment Variables Work

Vite only exposes variables prefixed with `VITE_` to the client. This is by design for security.

```bash
# ✅ Available in frontend
VITE_API_BASE_URL=http://localhost:3000

# ❌ NOT available in frontend (security)
DATABASE_URL=postgresql://...
SUPER_ADMIN_EMAIL_1=admin@...
```

## 🐳 Docker Environment

For Docker, environment variables can be set in:
- `docker-compose.yml`
- Container environment variables
- `.env` file (docker-compose reads this automatically)

## 🔧 Troubleshooting

### "Environment variable not found"
1. Check if variable exists in `.env`
2. Check if variable is prefixed with `VITE_` for frontend
3. Restart dev server after changing `.env`
4. Check `.env.example` for reference

### "Cannot connect to database"
1. Verify `DATABASE_URL` in `.env`
2. Ensure PostgreSQL is running
3. Check connection string format

### "Clerk authentication not working"
1. Verify `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
2. Use test keys for development
3. Ensure keys match between API and Dashboard

## 📚 Related Files
- `.env` - Your environment variables (gitignored)
- `.env.example` - Template for environment variables
- `apps/api/src/server.ts` - Loads dotenv
- `apps/dashboard/vite.config.ts` - Vite configuration
- `apps/customer/vite.config.ts` - Vite configuration

