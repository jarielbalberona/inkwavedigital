# API Endpoints Authentication Summary

## ✅ Changes Applied

Added Clerk authentication to management endpoints while keeping customer-facing endpoints public.

## Endpoint Security Map

### 🔒 PROTECTED Endpoints (Require Clerk Auth)

#### Menu Management
- `POST /api/v1/menu/:venueId/categories` - Create category
- `PATCH /api/v1/menu/categories/:categoryId` - Update category
- `DELETE /api/v1/menu/categories/:categoryId` - Delete category
- `POST /api/v1/menu/items` - Create menu item

#### Venue Management
- `GET /api/v1/venues` - List venues
- `POST /api/v1/venues` - Create venue
- `PUT /api/v1/venues/:venueId` - Update venue
- `DELETE /api/v1/venues/:venueId` - Delete venue
- `GET /api/v1/venues/:venueId/orders` - Get venue orders (KDS)

#### Order Management
- `PATCH /api/v1/orders/:id/status` - Update order status (KDS)

#### Image Management
- `POST /api/v1/images/upload` - Upload image
- `GET /api/v1/images` - List images
- `DELETE /api/v1/images/:id` - Delete image

#### Admin
- All `/api/v1/admin/*` endpoints

### 🌐 PUBLIC Endpoints (No Auth Required)

#### Menu (Customer Access)
- `GET /api/v1/menu/:venueId` - Get menu for venue
- `GET /api/v1/menu/:venueId/categories` - Get categories
- `GET /api/v1/menu/categories/:categoryId/items` - Get menu items

#### Venue Info (Customer Access)
- `GET /api/v1/venues/:venueId/info` - Get venue info
- `GET /api/v1/venues/:venueId/tables` - Get tables (for QR codes)

#### Orders (Customer Access)
- `POST /api/v1/orders` - Create order (customers placing orders)

#### Auth Endpoints
- `GET /api/v1/auth/check-super-admin` - Check super admin status
- `GET /api/v1/auth/tenant-id` - Get tenant ID
- `GET /api/v1/auth/user-role` - Get user role

## Why This Structure?

### Customer PWA Needs
Customers scanning QR codes need to:
- ✅ View menus and items
- ✅ See venue information
- ✅ Place orders
- ❌ Don't need authentication

### Dashboard/Staff Needs
Authenticated staff need to:
- ✅ Manage menus (create/edit/delete)
- ✅ Manage venues
- ✅ Update order status (KDS)
- ✅ Upload images
- ✅ Requires Clerk authentication

## Next Steps

### 1. Fix Dashboard Clerk Setup

The dashboard needs to be restarted to load the `.env` file:

```bash
# Stop current dashboard (Ctrl+C)
cd apps/dashboard
pnpm dev
```

### 2. Verify Clerk is Loading

Check browser console for:
```
CLERK_PUBLISHABLE_KEY pk_test_...
🔍 Clerk check: {clerkExists: true, sessionExists: true, url: '...'}
✅ Authorization header added
```

### 3. Sign In to Clerk

- Navigate to http://localhost:5173
- Sign in with your Clerk account
- Clerk will automatically send JWT tokens

### 4. Set Tenant ID in Clerk

Go to https://dashboard.clerk.com → Users → Your User → Edit "Public metadata":
```json
{
  "tenantId": "a1088200-e822-4a1d-b796-ff6abf742155"
}
```

### 5. Test Protected Endpoints

Once signed in:
- ✅ Menu management should work
- ✅ Venue management should work
- ✅ Image uploads should work
- ✅ KDS order updates should work

## Troubleshooting

### Dashboard Shows "clerkExists: false"

**Problem**: Clerk not loading even with correct key

**Solution**:
1. Created `apps/dashboard/.env` with `VITE_CLERK_PUBLISHABLE_KEY`
2. Restart dashboard: `cd apps/dashboard && pnpm dev`
3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

### Still Getting 401 Errors

**Check**:
1. Browser console shows `clerkExists: true`
2. You're signed in to Clerk
3. `tenantId` is set in Clerk user metadata
4. Authorization header is being sent

### Customer App Broken

**Should NOT happen** - all customer endpoints remain public:
- Menu viewing
- Order creation
- Venue info

If customers can't place orders, check that `POST /api/v1/orders` is NOT protected.

## Security Notes

- ✅ Management operations require authentication
- ✅ Customer operations remain public
- ✅ Multi-tenant isolation via `tenantId` in Clerk metadata
- ✅ JWT tokens verified on every protected request
- ✅ No mock data in production

