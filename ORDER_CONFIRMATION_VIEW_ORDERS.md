# Order Confirmation - View Orders Button

## Summary
Added a "View Orders" button to the order confirmation dialog that allows customers to immediately view their order status after placing an order.

## Changes Made

### 1. Updated `OrderConfirmation` Component
**File**: `apps/customer/src/features/order/components/OrderConfirmation.tsx`

#### Added Props:
- `onViewOrders: () => void` - Callback to open the order status drawer

#### UI Changes:
- Added new **"View Orders"** button (green) as the primary action
- Kept **"Place New Order"** button (blue) as secondary action
- Button order:
  1. **View Orders** (green, primary)
  2. **Place New Order** (blue, secondary)

### 2. Updated `MenuPage` Component
**File**: `apps/customer/src/features/menu/components/MenuPage.tsx`

#### Added Handler:
```typescript
const handleViewOrders = () => {
  setOrderConfirmation(null);  // Close confirmation dialog
  setIsOrderStatusOpen(true);   // Open order status drawer
};
```

#### Updated OrderConfirmation Call:
```typescript
<OrderConfirmation
  order={orderConfirmation}
  onBackToMenu={handleBackToMenu}
  onViewOrders={handleViewOrders}  // NEW
/>
```

## User Flow

### Before:
1. Customer places order
2. Order confirmation dialog appears
3. Customer clicks "Place New Order"
4. Returns to menu
5. Customer must click order status button to view orders

### After:
1. Customer places order
2. Order confirmation dialog appears with **two options**:
   - **"View Orders"** (green) - Opens order status drawer immediately
   - **"Place New Order"** (blue) - Returns to menu
3. Customer can immediately track their order status

## Benefits

1. **Immediate Feedback**: Customer can instantly see their order in the tracking system
2. **Better UX**: Reduces steps to view order status
3. **Confirmation**: Provides visual confirmation that order is in the system
4. **Flexibility**: Still allows customers to place another order if desired

## Visual Design

### Order Confirmation Dialog:
```
┌─────────────────────────────────┐
│     ✓ Order Confirmed!          │
│                                 │
│  Order ID: abc12345...          │
│  Total: ₱250.00                 │
│  Status: NEW                    │
│                                 │
│  ┌──────────────────────────┐  │
│  │    View Orders (Green)   │  │ ← NEW (Primary)
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │  Place New Order (Blue)  │  │ ← Secondary
│  └──────────────────────────┘  │
│                                 │
│  Your order has been placed     │
│  successfully...                │
└─────────────────────────────────┘
```

## Testing Checklist

- [ ] Place an order
- [ ] Verify "View Orders" button appears in confirmation dialog
- [ ] Click "View Orders" button
- [ ] Verify order status drawer opens
- [ ] Verify the order just placed is visible in the drawer
- [ ] Close drawer and place another order
- [ ] Click "Place New Order" button
- [ ] Verify it returns to menu as before
- [ ] Test on mobile devices for responsive design

## Technical Details

### Button Styling:
- **View Orders**: `bg-green-600 hover:bg-green-700` (green, indicates success/confirmation)
- **Place New Order**: `bg-blue-600 hover:bg-blue-700` (blue, indicates action)

### State Management:
- Closes confirmation dialog before opening order status drawer
- Uses existing `isOrderStatusOpen` state
- Maintains order data in query cache for immediate display

## Files Modified

- ✅ `apps/customer/src/features/order/components/OrderConfirmation.tsx`
- ✅ `apps/customer/src/features/menu/components/MenuPage.tsx`

## No Breaking Changes

- All existing functionality preserved
- Backward compatible with current flow
- No API changes required
- No database changes required

## Future Enhancements

1. **Auto-open**: Automatically open order status drawer after X seconds
2. **Animation**: Smooth transition from confirmation to order status
3. **Sound**: Play confirmation sound when order is placed
4. **Haptic Feedback**: Vibrate on mobile devices for tactile confirmation

