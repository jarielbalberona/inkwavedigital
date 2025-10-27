# Tenant and Super Admin Management Implementation

## 🎯 Overview

This document outlines the production-grade implementation of tenant and super admin management for Ink Wave.

## 📦 What Was Implemented

### 1. Database Schema

#### Super Admins Table
```sql
CREATE TABLE "super_admins" (
  id UUID PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'super_admin',
  permissions JSONB DEFAULT '{}',
  added_by UUID REFERENCES super_admins(id),
  status TEXT DEFAULT 'active',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Audit Logs Table
```sql
CREATE TABLE "audit_logs" (
  id UUID PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. API Implementation

#### Middleware (`apps/api/src/infrastructure/middlewares/auth.middleware.ts`)
- `requireAuth` - Verifies Clerk authentication
- `requireSuperAdmin` - Checks if user is super admin (uses env variable check for now)

#### Use Cases
- `CreateTenantUseCase` - Creates tenants with optional initial venue

#### Controllers
- `AdminController` - Handles tenant CRUD operations
  - `POST /api/v1/admin/tenants` - Create tenant
  - `GET /api/v1/admin/tenants` - List all tenants
  - `GET /api/v1/admin/tenants/:id` - Get tenant by ID
  - `DELETE /api/v1/admin/tenants/:id` - Delete tenant

#### Repositories
- `ITenantRepository` - Interface for tenant operations
- `DrizzleTenantRepository` - Implementation using Drizzle ORM
- `Tenant` Entity - Domain entity with validation

### 3. Dashboard Implementation

#### New Admin Feature
- **TenantManagementPage** - Main page for managing tenants
- **TenantForm** - Form for creating/editing tenants
  - Tenant name and slug
  - Optional initial venue creation
  - Venue configuration (name, slug, address, timezone)

#### API Integration
- `tenantsApi` - API client for tenant operations
- TypeScript types for type safety

### 4. Navigation
Added "Tenants" menu item to dashboard navigation with BuildingOfficeIcon.

## 🔒 Security Considerations

### Current Implementation (Mock)
The current implementation uses environment variables for super admin check:

```typescript
const isSuperAdmin = email && superAdminEmails.includes(email);
```

### Production Requirements

1. **Clerk Integration**: Implement proper Clerk JWT verification
2. **Database Check**: Query `super_admins` table instead of env variables
3. **Role-Based Access**: Implement permission system
4. **Audit Logging**: Log all admin actions to `audit_logs` table

## 📝 Setup Instructions

### 1. Run Migration
```bash
cd packages/db
pnpm drizzle:migrate
```

### 2. Set Environment Variables

#### In Root `.env` file
Create a `.env` file in the project root with:
```bash
# Super admin emails (for development)
SUPER_ADMIN_EMAIL_1=admin@inkwave.com
SUPER_ADMIN_EMAIL_2=your-email@example.com

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inkwave

# For production, implement proper Clerk verification
```

#### In Dashboard
No additional env variables needed for tenant management.

### 3. Seed Super Admins (Manual)
Since we don't have Clerk integration yet, manually insert super admins:

```sql
INSERT INTO super_admins (clerk_user_id, email, role, status, permissions)
VALUES 
  ('clerk_user_id_here', 'admin@inkwave.com', 'super_admin', 'active', '{}'),
  ('clerk_user_id_here_2', 'admin2@inkwave.com', 'super_admin', 'active', '{}');
```

**How to get clerk_user_id:**
1. Create user in Clerk Dashboard
2. Copy the user ID from Clerk
3. Insert into database

### 4. Testing

#### API Endpoints
```bash
# Create tenant (requires super admin auth)
curl -X POST http://localhost:3000/api/v1/admin/tenants \
  -H "Authorization: Bearer dev_your_user_id" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Cafe",
    "slug": "test-cafe",
    "initialVenue": {
      "name": "Main Branch",
      "slug": "main-branch",
      "timezone": "Asia/Manila"
    }
  }'

# Get all tenants
curl http://localhost:3000/api/v1/admin/tenants

# Get tenant by ID
curl http://localhost:3000/api/v1/admin/tenants/{id}

# Delete tenant
curl -X DELETE http://localhost:3000/api/v1/admin/tenants/{id}
```

#### Dashboard
1. Navigate to dashboard
2. Click "Tenants" in navigation
3. Click "Add Tenant" button
4. Fill in tenant details
5. Optionally add initial venue
6. Submit form

## 🚀 Production Checklist

### Before Production Deployment

- [ ] Implement proper Clerk JWT verification
- [ ] Replace mock auth middleware with database checks
- [ ] Add rate limiting to admin endpoints
- [ ] Implement audit logging for all admin actions
- [ ] Add input validation and sanitization
- [ ] Add CSRF protection
- [ ] Set up proper CORS for production domains
- [ ] Add monitoring and alerting
- [ ] Implement proper error handling
- [ ] Add comprehensive logging

### Database Migrations
- [ ] Run migrations in production database
- [ ] Seed initial super admin users
- [ ] Verify database indexes are created
- [ ] Set up database backups

### Testing
- [ ] Unit tests for use cases
- [ ] Integration tests for API endpoints
- [ ] E2E tests for dashboard UI
- [ ] Security testing
- [ ] Load testing

## 📊 Architecture

```
┌─────────────────┐
│   Dashboard     │
│   (React)       │
└────────┬────────┘
         │
         │ HTTP
         ▼
┌─────────────────┐
│   API Server    │
│   (Express)     │
└────────┬────────┘
         │
         │ SQL
         ▼
┌─────────────────┐
│   PostgreSQL    │
│                 │
│  - tenants      │
│  - super_admins │
│  - audit_logs   │
└─────────────────┘
```

## 🔄 Next Steps

1. **Clerk Integration**
   - Install `@clerk/clerk-sdk-node`
   - Implement token verification
   - Update middleware

2. **Permission System**
   - Define permission constants
   - Check permissions in use cases
   - Add permission management UI

3. **User Invitation**
   - Implement user invitation flow
   - Clerk invitation API integration
   - Email notifications

4. **Audit Logging**
   - Log all admin actions
   - Add audit log viewer in dashboard
   - Export audit logs

5. **Multi-tenant Isolation**
   - Ensure data isolation
   - Add tenant context to all queries
   - Implement tenant-scoped features

## 📚 File Structure

```
apps/api/src/
├── application/use-cases/admin/
│   └── CreateTenantUseCase.ts
├── domain/
│   ├── entities/
│   │   └── Tenant.ts
│   └── repositories/
│       └── ITenantRepository.ts
├── infrastructure/
│   ├── middlewares/
│   │   └── auth.middleware.ts
│   ├── persistence/
│   │   └── DrizzleTenantRepository.ts
│   └── http/routes/
│       └── admin.routes.ts
└── interfaces/controllers/
    └── admin.controller.ts

apps/dashboard/src/features/admin/
├── api/
│   └── tenantsApi.ts
├── components/
│   ├── TenantManagementPage.tsx
│   └── TenantForm.tsx
└── types/
    └── admin.types.ts

packages/db/src/schema/
├── superAdmins.ts
└── auditLogs.ts
```

## 🔗 Related Documentation

- [Architecture](./docs/architecture.md)
- [Implementation Plan](./docs/implementation-plan.md)
- [Getting Started](./GETTING_STARTED.md)

