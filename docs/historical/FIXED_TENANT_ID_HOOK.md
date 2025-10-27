# Fixed Tenant ID Hook

## Issue
The `useTenantId` hook was not correctly extracting the tenant ID from the API response.

## Root Cause
The `api.get` method returns `response.data` (the axios response data), so when we get the result from the API, it's already the full response object `{ success: true, data: { tenantId: "..." } }`.

## Solution
Updated the hook to correctly access `result.data.tenantId`:

```typescript
const result = await api.get<{ success: boolean; data: { tenantId: string | null } }>(
  `/api/v1/auth/tenant-id?email=${encodeURIComponent(email || "")}`
);

// result = { success: true, data: { tenantId: "..." } }
return result?.data?.tenantId ?? null;
```

## Testing
1. Open browser console
2. Check the console logs for "API result:" to see the response structure
3. The tenant ID should now be extracted correctly

