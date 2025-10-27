# Root Cause: API Response Extraction

## The Problem
Every API call was showing empty data because we were double-extracting the response.

## Root Cause
The `api.get/post/put/delete` methods in `apps/dashboard/src/lib/api.ts` already extract `response.data` from axios:

```typescript
get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.get<T>(url, config);
  return response.data;  // ← Already extracting response.data
}
```

So when we use it in the code:
```typescript
const result = await api.get<ApiResponse<Data>>(url);
// result is already { success: true, data: Data }
// NOT { data: { success: true, data: Data } }
```

## The Mistake
I was doing:
```typescript
const response = await api.get<ApiResponse<Data>>(url);
return response.data.data;  // ❌ Wrong! Double extraction
```

When it should be:
```typescript
const response = await api.get<ApiResponse<Data>>(url);
return response.data;  // ✅ Correct! Single extraction
```

## Files Fixed
1. `apps/dashboard/src/hooks/useTenantId.ts` - Fixed tenant ID extraction
2. `apps/dashboard/src/features/venue-management/api/venuesApi.ts` - Fixed all venue API calls

## The Pattern
For ALL API responses:
```typescript
// HTTP Response from axios:
// { status: 200, data: { success: true, data: { ... } } }

// api.get returns:
// { success: true, data: { ... } }

// So in the code:
const result = await api.get<ApiResponse<Data>>(url);
// result = { success: true, data: Data }

// To get the actual data:
return result.data;  // Returns Data
```

This should now work correctly for all API calls.

