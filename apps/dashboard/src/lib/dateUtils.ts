/**
 * Date utility functions for KDS date filtering
 */

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Get start and end of today
 */
export function getToday(): DateRange {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { from, to };
}

/**
 * Get start and end of yesterday
 */
export function getYesterday(): DateRange {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const from = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
  const to = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
  return { from, to };
}

/**
 * Get date range for past week (7 days ago to now)
 */
export function getPastWeek(): DateRange {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  
  const from = new Date();
  from.setDate(from.getDate() - 7);
  from.setHours(0, 0, 0, 0);
  
  return { from, to };
}

/**
 * Get date range for past month (30 days ago to now)
 */
export function getPastMonth(): DateRange {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  
  const from = new Date();
  from.setDate(from.getDate() - 30);
  from.setHours(0, 0, 0, 0);
  
  return { from, to };
}

/**
 * Get date range for past year (365 days ago to now)
 */
export function getPastYear(): DateRange {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  
  const from = new Date();
  from.setDate(from.getDate() - 365);
  from.setHours(0, 0, 0, 0);
  
  return { from, to };
}

/**
 * Format date for API (ISO string)
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString();
}

/**
 * Format date for display (e.g., "Jan 15, 2025")
 */
export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format date range for display
 */
export function formatDateRangeDisplay(from: Date, to: Date): string {
  const today = getToday();
  const isToday = from.toDateString() === today.from.toDateString() && 
                  to.toDateString() === today.to.toDateString();
  
  if (isToday) {
    return 'Today';
  }
  
  return `${formatDateDisplay(from)} - ${formatDateDisplay(to)}`;
}

/**
 * Check if a date range represents today
 */
export function isToday(from: Date, to: Date): boolean {
  const today = getToday();
  return from.toDateString() === today.from.toDateString() && 
         to.toDateString() === today.to.toDateString();
}

