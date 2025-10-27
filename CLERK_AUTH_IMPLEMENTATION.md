# Clerk Authentication Implementation

## Overview

The application now uses **real Clerk authentication** in both development and production environments. Mock authentication has been removed.

## What Changed

### Backend (API)

**File**: `apps/api/src/infrastructure/middlewares/auth.middleware.ts`

The `requireAuth` middleware now:
1. ✅ Extracts JWT token from `Authorization: Bearer <token>` header
2. ✅ Verifies the session token with Clerk
3. ✅ Fetches user details from Clerk
4. ✅ Sets `req.auth.userId` and `req.auth.email`
5. ✅ Extracts `tenantId` from Clerk's `publicMetadata`

### Frontend (Dashboard)

**File**: `apps/dashboard/src/lib/api.ts`

Added an Axios interceptor that:
1. ✅ Automatically gets the Clerk session token
2. ✅ Adds it to every API request as `Authorization: Bearer <token>`
3. ✅ Handles token refresh automatically

## Required Environment Variables

### API (.env)

```bash
CLERK_SECRET_KEY=sk_test_...  # Get from Clerk Dashboard
```

### Dashboard (.env)

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...  # Get from Clerk Dashboard
```

## How It Works

### 1. User Signs In (Dashboard)

```typescript
// ClerkProvider in main.tsx handles sign-in UI
<ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
  <App />
</ClerkProvider>
```

### 2. API Requests Include Token

```typescript
// Axios interceptor automatically adds token
const token = await window.__clerk.session.getToken();
config.headers.Authorization = `Bearer ${token}`;
```

### 3. API Verifies Token

```typescript
// requireAuth middleware verifies with Clerk
const session = await clerkClient.sessions.verifySession(token, token);
const user = await clerkClient.users.getUser(session.userId);

req.auth = {
  userId: session.userId,
  email: user.emailAddresses[0]?.emailAddress
};
```

### 4. Tenant ID from Metadata

Clerk stores the `tenantId` in the user's `publicMetadata`:

```typescript
const tenantId = user.publicMetadata?.tenantId as string;
req.tenantId = tenantId;
```

## Setting Up Tenant ID in Clerk

When a user signs up or is invited, you need to set their `tenantId` in Clerk's metadata:

```typescript
// Example: Update user metadata via Clerk API
await clerkClient.users.updateUser(userId, {
  publicMetadata: {
    tenantId: "a1088200-e822-4a1d-b796-ff6abf742155"
  }
});
```

## Benefits of Real Authentication

1. **Security**: Real JWT verification, not mock data
2. **Multi-tenant**: Each user has their own `tenantId` from Clerk
3. **Consistent**: Same auth flow in dev and production
4. **Automatic**: Token refresh handled by Clerk
5. **User Management**: Leverage Clerk's dashboard for user management

## Testing

### 1. Sign In to Dashboard

```bash
cd apps/dashboard
pnpm dev
# Navigate to http://localhost:5173
# Sign in with Clerk
```

### 2. Check API Logs

```bash
docker-compose logs api -f
# Should see: "User authenticated successfully"
```

### 3. Upload an Image

- Go to Menu Management
- Create/Edit a category
- Upload an icon image
- Should work without 401 errors

## Troubleshooting

### 401 Unauthorized

**Problem**: API returns 401 even when signed in

**Solutions**:
1. Check `CLERK_SECRET_KEY` is set in API's `.env`
2. Check `VITE_CLERK_PUBLISHABLE_KEY` is set in dashboard's `.env`
3. Ensure you're signed in to the dashboard
4. Check browser console for token errors
5. Restart API: `docker-compose restart api`

### No tenantId

**Problem**: `req.tenantId` is undefined

**Solution**: Set the `tenantId` in Clerk's user metadata:

```typescript
// In Clerk Dashboard or via API
user.publicMetadata = {
  tenantId: "your-tenant-id"
}
```

### Token Expired

**Problem**: Token expired errors

**Solution**: Clerk automatically refreshes tokens. If issues persist:
1. Sign out and sign back in
2. Clear browser cache
3. Check Clerk Dashboard for session settings

## Migration from Mock Auth

### What Was Removed

```typescript
// OLD (Mock auth)
req.auth = {
  userId: "dab16db9-8805-4027-be8b-e0cf2e444422",
  email: "hello@inkwavebrand.ing"
};
req.tenantId = "a1088200-e822-4a1d-b796-ff6abf742155";
```

### What Was Added

```typescript
// NEW (Real Clerk auth)
const session = await clerkClient.sessions.verifySession(token, token);
const user = await clerkClient.users.getUser(session.userId);
req.auth = {
  userId: session.userId,
  email: user.emailAddresses[0]?.emailAddress
};
req.tenantId = user.publicMetadata?.tenantId;
```

## Next Steps

1. **Set Up Clerk Account**: Create a Clerk application at https://clerk.com
2. **Get API Keys**: Copy `CLERK_SECRET_KEY` and `VITE_CLERK_PUBLISHABLE_KEY`
3. **Update .env Files**: Add keys to both API and dashboard `.env` files
4. **Configure Metadata**: Set `tenantId` in user's `publicMetadata` for each user
5. **Test**: Sign in and verify API requests work correctly

## Customer App

The customer app (`apps/customer`) does **NOT** require authentication - it's for anonymous customers scanning QR codes to view menus and place orders.

