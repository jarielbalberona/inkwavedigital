# Authentication & Authorization

## Overview
The application uses Clerk for authentication in both the dashboard and API. Customer-facing endpoints remain public while management operations require authentication.

## System Architecture

### Authentication Flow
```
1. User signs in via Clerk (Dashboard)
2. Clerk provides JWT session token
3. Frontend intercepts all API requests and adds Bearer token
4. Backend verifies JWT with Clerk
5. Backend extracts user info and tenantId from Clerk metadata
```

### Endpoint Security

#### 🔒 Protected (Requires Auth)
- **Menu Management**: Create, update, delete categories/items
- **Venue Management**: All CRUD operations
- **Order Management**: Status updates (KDS)
- **Image Management**: Upload, list, delete
- **Admin Operations**: All `/api/v1/admin/*` endpoints
- **Tables**: All table management operations

#### 🌐 Public (No Auth)
- **Customer Menu**: View menus, categories, items
- **Venue Info**: Get venue details
- **Orders**: Create orders (customer placing orders)
- **Auth Check**: Check super admin, get tenant ID, user role

## Setup

### Environment Variables

**API** (`.env`):
```bash
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...  # For webhook signature verification
```

**Dashboard** (`.env`):
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Middleware Implementation

**File**: `apps/api/src/infrastructure/middlewares/auth.middleware.ts`

The `requireAuth` middleware:
1. Extracts JWT from `Authorization: Bearer <token>` header
2. Verifies session token with Clerk
3. Fetches user details
4. Extracts `tenantId` from publicMetadata
5. Sets `req.auth.userId` and `req.auth.email`

### Frontend Auto-Auth

**File**: `apps/dashboard/src/lib/api.ts`

Axios interceptor automatically:
1. Gets Clerk session token
2. Adds to every request as Bearer token
3. Handles token refresh

## Clerk Webhooks

### Purpose
Automatically populate `tenantId` and `role` in Clerk's publicMetadata when users accept invitations.

### Implementation

**Endpoint**: `POST /api/v1/webhooks/clerk`

**Events Handled**:
- `user.created` - New user signed up
- `user.updated` - User profile updated

**Process**:
1. Verify webhook signature using Svix
2. Find user in database by email
3. If found, update Clerk publicMetadata with:
   - `tenantId`
   - `role`
4. This allows automatic tenant access on first sign-in

### Setup
1. Create webhook endpoint in Clerk Dashboard
2. Subscribe to `user.created` and `user.updated` events
3. Copy webhook secret to `CLERK_WEBHOOK_SECRET` env var
4. For local dev, use ngrok to expose localhost

## Multi-Tenant Isolation

### How It Works
- Each user has a `tenantId` in Clerk's publicMetadata
- Backend extracts tenantId from JWT
- All queries are automatically scoped to user's tenant
- Prevents cross-tenant data access

### Setting Tenant ID
**Option 1 - Webhook (Automatic)**:
- User accepts invitation
- Webhook updates Clerk metadata
- User gains immediate access

**Option 2 - Manual (Dashboard)**:
1. Go to Clerk Dashboard → Users
2. Edit user → Public Metadata
3. Add:
```json
{
  "tenantId": "uuid-here",
  "role": "owner"
}
```

## Role-Based Access

### Roles
- **Super Admin**: Can manage all tenants (system-wide access)
- **Owner**: Full access to their tenant's data
- **Manager**: Access to assigned venues
- **Staff**: Limited access to assigned venues

### Checking Roles

**API**:
```typescript
// Check super admin
GET /api/v1/auth/check-super-admin?email=user@example.com

// Get user role and assigned venues
GET /api/v1/auth/user-role?email=user@example.com
```

**Dashboard**:
```typescript
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { useUserRole } from '@/hooks/useUserRole';

const { isSuperAdmin } = useSuperAdmin();
const { role, assignedVenueIds } = useUserRole();
```

## Troubleshooting

### Dashboard Shows "401 Unauthorized"
1. Check browser console for Clerk status
2. Verify you're signed in
3. Check `tenantId` is in Clerk metadata
4. Hard refresh browser (Cmd+Shift+R)

### Webhook Not Working
1. Verify `CLERK_WEBHOOK_SECRET` is set
2. Check webhook logs in Clerk Dashboard
3. For local dev, ensure ngrok is running
4. Verify webhook signature is being validated

### Customer App Broken
Should NOT happen - customer endpoints are public. If issues:
- Check `POST /api/v1/orders` is NOT protected
- Verify menu endpoints are public
- Check CORS settings

## Security Notes
- ✅ JWT tokens verified on every protected request
- ✅ Multi-tenant isolation via tenantId
- ✅ Customer operations remain public
- ✅ Webhook signatures verified
- ✅ No mock data in production

