# API Response Extraction Fix - Summary

## What Was Wrong
All API calls were doing `response.data.data` when they should only do `response.data`.

## Why It Happened
The `api` utility in `apps/dashboard/src/lib/api.ts` already extracts `response.data` from axios responses. So when we get the result from `api.get`, it's already the response body `{ success: true, data: ... }`.

## What I Fixed

### 1. `apps/dashboard/src/hooks/useTenantId.ts`
```typescript
// Before:
return response.data.data.tenantId;  // ❌ undefined

// After:
return result?.data?.tenantId ?? null;  // ✅ Works
```

### 2. `apps/dashboard/src/features/venue-management/api/venuesApi.ts`
```typescript
// Before:
return response.data.data;  // ❌ undefined

// After:
return response.data;  // ✅ Works
```

## The Correct Pattern Going Forward

```typescript
// All API responses follow this pattern:
// HTTP: { status: 200, data: { success: true, data: { ... } } }
// api.get returns: { success: true, data: { ... } }
// So in code: response.data gives us { ... }

const result = await api.get<ApiResponse<Data>>(url);
// result = { success: true, data: Data }
// result.data = Data

return result.data;  // ✅ Always just .data, never .data.data
```

## Status
✅ Fixed - Should now work without further debugging

