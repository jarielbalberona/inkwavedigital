import { del } from 'idb-keyval';

export const clearPersistedCache = async (appKey: string) => {
  try {
    await del(appKey);
    console.log('Persisted cache cleared successfully');
  } catch (error) {
    console.error('Failed to clear persisted cache:', error);
  }
};

// Usage:
// import { clearPersistedCache } from './lib/clearCache';
// clearPersistedCache('inkwave-customer-cache');

