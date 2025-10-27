# Order List Cleanup Strategy

## Overview
This document explains how and when orders are shown/hidden in the customer's order tracking list.

## Current Implementation

### What Shows in Order List ✅

Orders are displayed if they meet **ALL** these criteria:

1. **Status Filter**: Order status is `NEW`, `PREPARING`, or `READY`
   - ❌ Hidden: `COMPLETED`, `CANCELLED`

2. **Time Filter**: Order was created **today** (after midnight)
   - ❌ Hidden: Orders from previous days

3. **Device Filter**: Order was placed from the same device
   - Uses `deviceId` stored in localStorage
   - ❌ Hidden: Orders from different devices

4. **Venue Filter**: Order is from the current venue (optional)
   - ❌ Hidden: Orders from other venues

### Automatic Cleanup Scenarios

#### ✅ Scenario 1: Order Completed
**When**: Kitchen marks order as `COMPLETED` in KDS
**Result**: Order disappears from list within 5 seconds
**Reason**: Status filter excludes completed orders

#### ✅ Scenario 2: Next Day
**When**: Customer returns the next day
**Result**: Yesterday's orders don't show
**Reason**: Time filter only shows orders from today (after midnight)

#### ✅ Scenario 3: Different Device
**When**: Customer uses a different phone/browser
**Result**: Previous device's orders don't show
**Reason**: Different `deviceId` in localStorage

#### ✅ Scenario 4: Different Venue
**When**: Customer scans QR code at a different venue
**Result**: Previous venue's orders don't show
**Reason**: Venue filter excludes other venues

#### ✅ Scenario 5: Order Cancelled
**When**: Staff cancels order in KDS
**Result**: Order disappears from list within 5 seconds
**Reason**: Status filter excludes cancelled orders

### Manual Cleanup Options

#### Option 1: Clear Session (Currently Available)
**How**: Customer clicks logout/clear session
**Result**: 
- Venue, table, and pax info cleared
- `deviceId` **preserved** (orders still visible)
- Use case: Customer wants to start fresh at same venue

#### Option 2: Reset Device ID (New Feature)
**How**: Call `resetDeviceId()` from session store
**Result**:
- New `deviceId` generated
- All previous orders hidden
- Fresh start with no order history
- Use case: Customer wants complete reset

## Technical Implementation

### Backend Filter (GetDeviceOrdersUseCase)

```typescript
async execute(input: GetDeviceOrdersInput) {
  const orders = await this.orderRepository.findByDeviceId(
    input.deviceId,
    input.venueId
  );

  // Get start of today (midnight)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Filter to only active orders from today
  const activeOrders = orders.filter((order) => {
    const isActive = !["COMPLETED", "CANCELLED"].includes(order.status.toString());
    const isToday = order.createdAt >= startOfToday;
    return isActive && isToday;
  });

  return activeOrders;
}
```

### Frontend Session Store

```typescript
interface SessionStore {
  deviceId: string;              // Unique device identifier
  sessionStartedAt: string;      // When session started
  resetDeviceId: () => void;     // Generate new deviceId
}
```

## Order Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                     Order Lifecycle                          │
└─────────────────────────────────────────────────────────────┘

1. Order Placed (NEW)
   ↓
   ✅ Shows in order list
   ↓
2. Kitchen Preparing (PREPARING)
   ↓
   ✅ Shows in order list
   ↓
3. Order Ready (READY)
   ↓
   ✅ Shows in order list
   ↓
4. Order Completed (COMPLETED)
   ↓
   ❌ Hidden from order list (within 5 seconds)
   ↓
5. Next Day (Midnight)
   ↓
   ❌ Hidden from order list (time filter)
```

## Data Retention

### In Database
- **All orders preserved permanently**
- No automatic deletion
- Available for analytics, history, reports

### In Customer View
- **Only today's active orders shown**
- Completed orders hidden immediately
- Old orders hidden after midnight

## Edge Cases

### Case 1: Long Restaurant Hours (Past Midnight)
**Scenario**: Restaurant open 10 AM - 2 AM next day
**Issue**: Orders placed at 1 AM will be hidden at 2 AM (midnight cutoff)
**Solution**: Consider using session-based filtering instead of calendar day

**Potential Fix** (if needed):
```typescript
// Option A: Use 24-hour rolling window
const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
const isRecent = order.createdAt >= last24Hours;

// Option B: Use session start time
const isInSession = order.createdAt >= sessionStartedAt;
```

### Case 2: Multiple Orders Same Session
**Scenario**: Customer places 3 orders in one sitting
**Result**: All 3 orders show in list
**Behavior**: Correct - customer should see all their active orders

### Case 3: Shared Device
**Scenario**: Multiple customers use same tablet at table
**Result**: All customers see all orders from that device
**Behavior**: Acceptable - table-based ordering

### Case 4: Customer Leaves Before Completion
**Scenario**: Customer places order and leaves
**Result**: Order still shows until completed or next day
**Behavior**: Acceptable - they can check status later

## Recommendations

### Current Implementation: ✅ Good for Most Use Cases
- **Daily cleanup** prevents old orders from cluttering the list
- **Status-based filtering** removes completed orders immediately
- **Device-based tracking** provides privacy between customers

### Optional Enhancements (Future)

#### 1. Session-Based Cleanup
**When to use**: Restaurants with late-night hours
**Implementation**: Filter by `sessionStartedAt` instead of calendar day
```typescript
const isInSession = order.createdAt >= new Date(sessionStartedAt);
```

#### 2. Time-Based Auto-Cleanup
**When to use**: High-volume restaurants
**Implementation**: Hide orders older than X hours
```typescript
const maxAge = 4 * 60 * 60 * 1000; // 4 hours
const isRecent = order.createdAt >= new Date(Date.now() - maxAge);
```

#### 3. Manual "Clear Order History" Button
**When to use**: Customer wants fresh start
**Implementation**: Add button to reset `deviceId`
```typescript
<button onClick={() => resetDeviceId()}>
  Clear Order History
</button>
```

#### 4. Order Completion Notification
**When to use**: Improve customer experience
**Implementation**: Show toast when order is completed
```typescript
if (prevStatus === 'READY' && newStatus === 'COMPLETED') {
  toast.success('Your order is complete! Thank you!');
}
```

## Testing Scenarios

### Test 1: Same Day Orders
1. Place order at 10 AM → ✅ Shows
2. Complete order at 10:30 AM → ❌ Hidden
3. Place new order at 2 PM → ✅ Shows
4. Check at 11 PM → ✅ Still shows (same day)

### Test 2: Multi-Day Orders
1. Place order at 11 PM → ✅ Shows
2. Check at 12:01 AM (next day) → ❌ Hidden
3. Place new order at 12:05 AM → ✅ Shows

### Test 3: Multiple Devices
1. Device A places order → ✅ Shows on Device A
2. Device B checks orders → ❌ Not visible on Device B
3. Device A checks orders → ✅ Still shows on Device A

### Test 4: Status Changes
1. Order status: NEW → ✅ Shows
2. Order status: PREPARING → ✅ Shows
3. Order status: READY → ✅ Shows
4. Order status: COMPLETED → ❌ Hidden within 5 seconds

## Configuration Options

### Current Settings
```typescript
// Time filter: Today only (midnight cutoff)
const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

// Status filter: Active orders only
const activeStatuses = ['NEW', 'PREPARING', 'READY'];

// Polling interval: 5 seconds
const refetchInterval = 5000;
```

### Customizable Settings (Future)
```typescript
// Could be moved to environment variables or venue settings
ORDER_HISTORY_HOURS=24        // Show orders from last 24 hours
ORDER_CLEANUP_MODE=session    // 'daily' | 'session' | 'hours'
ORDER_POLLING_INTERVAL=5000   // Milliseconds
```

## Summary

### ✅ Orders Are Hidden When:
1. Status changes to `COMPLETED` or `CANCELLED`
2. Order is from a previous day (before midnight)
3. Order is from a different device
4. Order is from a different venue

### ✅ Orders Persist When:
1. Status is `NEW`, `PREPARING`, or `READY`
2. Order was placed today (after midnight)
3. Same device is used
4. Same venue context

### 🎯 Best Practice:
Current implementation works well for typical restaurant scenarios where:
- Customers dine and leave same day
- Each device/table is independent
- Orders are completed within a few hours

For edge cases (24-hour operations, shared devices), consider the optional enhancements listed above.

