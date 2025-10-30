# Order Management & Kitchen Display System

## Overview
Complete order lifecycle management from customer placement through kitchen preparation to completion, with real-time WebSocket updates.

## Order Flow

### Customer Journey
```
1. Scan QR Code → 2. Browse Menu → 3. Add to Cart → 
4. Checkout → 5. Confirm Order → 6. Track Status
```

### Kitchen Journey
```
1. Receive Order (NEW) → 2. Start Preparing (PREPARING) → 
3. Mark Ready (READY) → 4. Serve (SERVED)
```

## Order Status States

### Status Transitions
```
NEW → PREPARING → READY → SERVED
```

### Status Definitions
- **NEW**: Order just placed, waiting for kitchen
- **PREPARING**: Kitchen is working on the order
- **READY**: Order ready for pickup/serving
- **SERVED**: Order delivered to customer

## Features Implemented

### Customer App
- ✅ Cart management with item options
- ✅ Real-time price calculation
- ✅ Order placement
- ✅ Order confirmation screen
- ✅ Order tracking (active orders for device)
- ✅ Order status updates via WebSocket
- ✅ Multiple orders per device support

### Kitchen Display System (KDS)
- ✅ Real-time order display
- ✅ Kanban-style columns by status
- ✅ Order cards with full details
- ✅ Status update controls
- ✅ WebSocket real-time updates
- ✅ Venue-scoped orders
- ✅ Order timing display
- ✅ Item quantities and options

### Order Tracking
- ✅ Device-based order tracking
- ✅ Active orders display
- ✅ Order status drawer in customer app
- ✅ Real-time status updates
- ✅ Order history per device

## Database Schema

### Orders Table
```typescript
{
  id: UUID
  venue_id: UUID
  table_id: UUID (nullable)
  device_id: string
  status: 'NEW' | 'PREPARING' | 'READY' | 'SERVED'
  items: JSONB  // Array of order items with options
  total_amount: numeric
  notes: text (nullable)
  customer_name: string (nullable)
  pax: integer (nullable)
  created_at: timestamp
  updated_at: timestamp
}
```

### Order Items Structure
```json
{
  "itemId": "uuid",
  "name": "Burger",
  "price": 10.00,
  "quantity": 2,
  "imageUrl": "https://...",
  "options": [
    {
      "optionId": "uuid",
      "name": "Size",
      "values": [
        {
          "valueId": "uuid",
          "name": "Large",
          "priceModifier": 2.00
        }
      ]
    }
  ]
}
```

## API Endpoints

### Orders
```
POST   /api/v1/orders                         # Create order (public)
PATCH  /api/v1/orders/:id/status              # Update status (auth)
GET    /api/v1/venues/:venueId/orders         # Get venue orders (auth)
GET    /api/v1/orders/device/:deviceId        # Get device orders (public)
```

## WebSocket Integration

### Real-Time Updates
**Purpose**: Instant order notifications without polling

**Implementation**:
- **Backend**: Socket.IO server
- **Frontend**: Socket.IO client
- **Events**: `order_created`, `order_status_changed`

### Connection Flow
```
1. Dashboard/Customer connects to WebSocket
2. Joins venue-specific room
3. Listens for order events
4. Updates UI in real-time
5. Disconnects on unmount
```

### Event Handling

**Dashboard KDS**:
```typescript
wsClient.connect(venueId);
wsClient.subscribe((message) => {
  if (message.type === 'order_created') {
    // Refresh orders list
    queryClient.invalidateQueries(['venue-orders']);
  }
  if (message.type === 'order_status_changed') {
    // Update specific order
    queryClient.invalidateQueries(['venue-orders']);
  }
});
```

**Customer App**:
```typescript
wsClient.connect(venueId);
wsClient.subscribe((message) => {
  if (message.type === 'order_status_changed') {
    // Refresh device orders
    queryClient.invalidateQueries(['device-orders', deviceId]);
  }
});
```

### Message Format
```json
{
  "type": "order_created" | "order_status_changed",
  "venueId": "uuid",
  "orderId": "uuid",
  "newStatus": "PREPARING",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Frontend Implementation

### KDS Page
**Location**: `apps/dashboard/src/features/kds/`

**Components**:
- `KDSPage.tsx` - Main KDS view with columns
- `OrderStatusColumn.tsx` - Column for each status
- `OrderCard.tsx` - Individual order display

**Features**:
- Drag-and-drop status updates (planned)
- Order timing since creation
- Item details with quantities
- Options display
- Customer notes
- Table information

### Customer Order Tracking
**Location**: `apps/customer/src/features/order/`

**Components**:
- `OrderConfirmation.tsx` - Post-order success screen
- `OrderStatusDrawer.tsx` - Active orders drawer
- Cart integration via `useCartStore`

**Features**:
- View all active orders for device
- Real-time status updates
- Order details display
- Reorder functionality (planned)

### Hooks
```typescript
// KDS
useOrdersQuery(venueId)              // Fetch venue orders
useUpdateOrderStatus()               // Update order status

// Customer
useDeviceOrdersQuery(deviceId)       // Fetch device orders
useCreateOrder()                     // Place new order
```

## Cart Management

### Cart Store
**Location**: `apps/customer/src/features/cart/hooks/stores/useCartStore.ts`

**State**:
```typescript
interface CartStore {
  items: CartItem[];
  addItem(item: MenuItem, selectedOptions: SelectedOption[]): void;
  removeItem(index: number): void;
  updateQuantity(index: number, quantity: number): void;
  clearCart(): void;
  getTotalPrice(): number;
  getTotalItems(): number;
}
```

### Cart Item Structure
```typescript
interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: SelectedOption[];
  subtotal: number;
}
```

### Price Calculation
- Base price from menu item
- Add option value price modifiers
- Multiply by quantity
- Sum all cart items for total

## Order Placement Process

### 1. Cart Review
- Customer reviews items
- Sees total price
- Can modify quantities or options

### 2. Checkout
- Optional: Enter customer name
- Optional: Add order notes
- Pax count from session

### 3. Submit Order
```typescript
const orderData = {
  venueId: string;
  tableId?: string;
  deviceId: string;
  items: CartItem[];
  totalAmount: number;
  customerName?: string;
  notes?: string;
  pax?: number;
};
```

### 4. Confirmation
- Show order number
- Display estimated time
- Show order status
- Clear cart

### 5. WebSocket Notification
- Broadcast to venue
- KDS receives new order
- Customer can track status

## KDS Workflow

### New Order Arrival
1. WebSocket broadcasts order
2. KDS receives notification
3. Order appears in NEW column
4. Sound/visual alert (planned)

### Status Updates
1. Staff clicks status button
2. Order moves to next column
3. WebSocket broadcasts update
4. Customer app updates status
5. Order card updates in KDS

### Order Management
- Filter by status
- Search by order number
- View order details
- Mark as completed
- Handle special requests

## Performance Monitoring

### WebSocket Health
**Location**: `apps/api/src/infrastructure/websocket/WebSocketMonitor.ts`

**Metrics Tracked**:
- Active connections
- Messages sent/received
- Connection errors
- Room subscriptions
- Latency

**Slack Notifications**:
- Connection spikes
- Error thresholds
- Server health alerts

### Monitoring Endpoints
```
GET /api/v1/monitoring/websocket/stats    # WebSocket statistics
GET /api/v1/monitoring/websocket/health   # Health check
```

## Order Analytics

### Metrics Available
- Orders per hour/day
- Average order value
- Popular items
- Order completion times
- Table utilization
- Peak hours
- Customer repeat rate (by device)

### Future Analytics
- Revenue reports
- Staff performance
- Kitchen efficiency
- Customer satisfaction
- Trend analysis

## Best Practices

### Order Handling
- Update status promptly
- Check order details carefully
- Communicate delays to customers
- Handle special requests
- Maintain order accuracy

### KDS Usage
- Keep screen visible to all kitchen staff
- Use large display for visibility
- Regular status updates
- Clean up completed orders
- Monitor timing

### Customer Communication
- Clear status messages
- Accurate time estimates
- Proactive delay notifications
- Easy way to modify orders (future)

## Troubleshooting

### Orders Not Appearing in KDS
- Check WebSocket connection status
- Verify venue ID matches
- Check order was created successfully
- Refresh page if needed

### Status Updates Not Working
- Verify authentication
- Check network connection
- Ensure order ID is correct
- Check WebSocket is connected

### WebSocket Disconnections
- Check server health
- Verify network stability
- Review connection limits
- Check Slack alerts

### Real-Time Updates Delayed
- Check WebSocket latency
- Verify server load
- Check client connection
- Review network conditions

## Future Enhancements

### Planned Features
- **Order Modifications**: Edit after placement
- **Split Orders**: Divide between customers
- **Order Scheduling**: Pre-orders for later
- **Printer Integration**: Auto-print to kitchen
- **Voice Alerts**: Audio notifications
- **Order Prioritization**: VIP/urgent orders
- **Batch Preparation**: Group similar items
- **Delivery Integration**: Third-party delivery
- **Customer Ratings**: Rate order experience
- **Loyalty Points**: Earn on each order

