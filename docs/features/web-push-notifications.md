# Web Push Notifications

## Overview

Implemented reliable Web Push Notifications that work even when the browser is in the background or the phone is locked. This provides a much better notification experience than simple browser notifications or Web Audio API sounds.

## Features

### ✅ Lock Screen Notifications
- Notifications appear on locked phones (iOS 16.4+, Android)
- Works when browser is in background
- Works when phone screen is off
- Persistent until user interacts with them

### 🔔 Rich Notifications
- Custom titles and messages per order status
- Emoji indicators for visual clarity
- Click to open app and navigate to order
- Automatic retry for failed sends
- Automatic cleanup of expired subscriptions

### 📱 Cross-Platform Support
- **Android Chrome**: Full support
- **iOS Safari 16.4+**: Full support (requires add to home screen for best results)
- **Desktop**: All major browsers
- **Graceful fallback**: Falls back to browser notifications if push not supported

## Architecture

### Backend (API)

```
apps/api/src/
├── domain/
│   ├── entities/
│   │   └── PushSubscription.ts          # Push subscription entity
│   └── repositories/
│       └── PushSubscriptionRepository.ts # Repository interface
├── infrastructure/
│   ├── persistence/
│   │   └── DrizzlePushSubscriptionRepository.ts  # Database implementation
│   └── push/
│       └── PushNotificationService.ts    # Web push service
├── application/use-cases/
│   ├── SubscribeToPushNotificationsUseCase.ts
│   ├── UnsubscribeFromPushNotificationsUseCase.ts
│   ├── CreateOrderUseCase.ts            # Sends push to venue staff
│   └── UpdateOrderStatusUseCase.ts      # Sends push to customers
└── interfaces/
    └── push.controller.ts                # Push API endpoints
```

### Frontend (Customer & Dashboard)

```
apps/customer/ or apps/dashboard/
├── public/
│   └── sw.js                            # Service Worker
└── src/
    └── lib/
        └── notifications.ts              # NotificationManager with push support
```

### Database

```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY,
  device_id TEXT,              -- For customer app
  venue_id UUID,               -- Scope for notifications
  user_id UUID,                -- For dashboard staff
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_used_at TIMESTAMP
);
```

## Setup

### 1. Generate VAPID Keys

```bash
cd apps/api
npx web-push generate-vapid-keys
```

### 2. Configure Environment Variables

Add to `.env`:

```bash
# Web Push Notifications
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:support@inkwave.digital
```

### 3. Run Database Migration

```bash
cd packages/db
# Run migration 0008_add_push_subscriptions.sql
```

### 4. Install Dependencies

```bash
cd apps/api
pnpm install  # Installs web-push@^3.6.7

# Build db package to include new schema
cd ../../packages/db
pnpm run build
```

## Usage

### Customer App - Automatic Subscription

The customer app automatically subscribes to push notifications when the user first visits:

```typescript
// apps/customer/src/features/menu/components/MenuPage.tsx

useEffect(() => {
  if (deviceId && venueId) {
    // Automatically requests permissions and subscribes
    notificationManager.requestPermissions(deviceId, venueId);
  }
}, [deviceId, venueId]);
```

### Dashboard App - User-Based Subscription

For the dashboard, you'll want to subscribe based on the logged-in user and their venues:

```typescript
// Example integration (to be implemented)
useEffect(() => {
  if (userId && venueId) {
    notificationManager.requestPermissions(userId, venueId);
  }
}, [userId, venueId]);
```

### Notification Flow

#### New Order Created → Notify Venue Staff

```typescript
// apps/api/src/application/use-cases/CreateOrderUseCase.ts

await this.pushService.sendToVenue(venueId, {
  title: '🔔 New Order!',
  body: `Order #${orderNumber} from ${tableInfo}`,
  requireInteraction: true,  // Requires user interaction
  data: {
    orderId: order.id,
    venueId: venueId,
    url: `/orders/${order.id}`,
  },
});
```

#### Order Status Updated → Notify Customer

```typescript
// apps/api/src/application/use-cases/UpdateOrderStatusUseCase.ts

if (order.deviceId) {
  await this.pushService.sendToDevice(order.deviceId, {
    title: `${statusEmoji} ${statusMessage}`,
    body: `Order #${orderNumber} - ${statusDescription}`,
    requireInteraction: status === 'READY',  // Only for READY status
    data: {
      orderId: order.id,
      status: status,
      url: `/orders/${order.id}`,
    },
  });
}
```

## API Endpoints

### GET `/api/v1/push/vapid-public-key`

Get the VAPID public key for client subscription.

**Response:**
```json
{
  "publicKey": "BNg..."
}
```

### POST `/api/v1/push/subscribe`

Subscribe to push notifications.

**Request:**
```json
{
  "deviceId": "abc123",       // For customer app
  "venueId": "venue-uuid",     // Optional
  "userId": "user-uuid",       // For dashboard app
  "subscription": {
    "endpoint": "https://...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "userAgent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "success": true,
  "subscriptionId": "uuid"
}
```

### POST `/api/v1/push/unsubscribe`

Unsubscribe from push notifications.

**Request:**
```json
{
  "endpoint": "https://..."
}
```

**Response:**
```json
{
  "success": true
}
```

## Notification Manager API

### Customer App

```typescript
import { notificationManager } from '@/lib/notifications';

// Request all permissions (browser + audio + push)
await notificationManager.requestPermissions(deviceId, venueId);

// Check if push is supported
if (notificationManager.isPushSupported()) {
  console.log('Push notifications supported!');
}

// Subscribe to push
await notificationManager.subscribeToPush(deviceId, venueId);

// Unsubscribe from push
await notificationManager.unsubscribeFromPush();

// Enable/disable push
notificationManager.setPushEnabled(true);

// Check push state
const isEnabled = notificationManager.isPushEnabled();

// Still play sound/vibration for in-app notifications
await notificationManager.notify('order-ready');
```

## Service Worker

The service worker handles push events and displays notifications:

```javascript
// apps/customer/public/sw.js

self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    requireInteraction: data.requireInteraction,
    data: data.data,
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Open or focus the app
  const urlToOpen = event.notification.data?.url || '/';
  clients.openWindow(urlToOpen);
});
```

## Order Status Notifications

### Customer Receives

| Status | Emoji | Title | Description | Duration | Interaction Required |
|--------|-------|-------|-------------|----------|---------------------|
| NEW | 📝 | Order Received | Your order has been received | 8s | No |
| PREPARING | 👨‍🍳 | Order Being Prepared | Your order is being prepared | 8s | No |
| READY | 🍽️ | Order Ready! | Your order is ready for pickup! | 15s | **Yes** |
| SERVED | ✅ | Order Served | Enjoy your meal! | 8s | No |

### Venue Staff Receives

| Event | Emoji | Title | Description | Interaction Required |
|-------|-------|-------|-------------|---------------------|
| New Order | 🔔 | New Order! | Order #XXX from Table Y - N items | **Yes** |

## Testing

### Test Push Notifications Locally

1. **Start the API with VAPID keys configured**
```bash
cd apps/api
VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... pnpm run dev
```

2. **Open customer app and grant permissions**
- Visit the customer app
- Click "Allow" when prompted for notifications
- Check console for "Push subscription successful"

3. **Create an order**
- Add items to cart and place order
- Customer should receive push notification for each status change

4. **Check on locked phone**
- Lock your phone
- Change order status in dashboard
- Notification should appear on lock screen

### Test on Mobile

1. **iOS Safari (16.4+)**
   - Add to home screen for best results
   - Grant notification permissions
   - Lock phone and test

2. **Android Chrome**
   - Visit site normally
   - Grant notification permissions
   - Lock phone and test

## Troubleshooting

### Push Notifications Not Working

1. **Check VAPID keys are configured**
```bash
echo $VAPID_PUBLIC_KEY
echo $VAPID_PRIVATE_KEY
```

2. **Check service worker registration**
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
});
```

3. **Check push subscription**
```javascript
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    console.log('Push Subscription:', sub);
  });
});
```

4. **Check browser console for errors**
- Look for service worker errors
- Look for push subscription errors
- Check network tab for API calls

### Notifications Not Appearing on Lock Screen

- **iOS**: Must add to home screen (PWA mode)
- **Android**: Works in normal browser mode
- **Desktop**: Not applicable

### Subscription Failing

- Check VAPID keys match between server and client
- Ensure HTTPS (required for service workers except localhost)
- Check notification permission is granted
- Verify endpoint URL is correct

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge | iOS Safari | Android Chrome |
|---------|--------|---------|--------|------|------------|----------------|
| Service Workers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Push API | ✅ | ✅ | ✅ (16.4+) | ✅ | ✅ (16.4+) | ✅ |
| Lock Screen | ✅ | ✅ | ⚠️ PWA Only | ✅ | ⚠️ PWA Only | ✅ |
| Background | ✅ | ✅ | ⚠️ Limited | ✅ | ⚠️ Limited | ✅ |

✅ Full support | ⚠️ Partial support | ❌ No support

## Security

- All push subscriptions use VAPID (Voluntary Application Server Identification)
- Endpoints are unique per device/user
- Subscriptions automatically expire if unused
- Failed deliveries automatically clean up invalid subscriptions
- HTTPS required in production

## Performance

- Subscriptions stored in database with indexes
- Expired subscriptions automatically removed (410 Gone)
- Batch sending supported for multiple recipients
- Failed sends logged but don't block execution

## Future Enhancements

- [ ] Action buttons in notifications ("View Order", "Dismiss")
- [ ] Notification grouping for multiple orders
- [ ] Silent notifications for background data sync
- [ ] Notification scheduling
- [ ] A/B testing different notification styles
- [ ] Analytics for notification engagement
- [ ] User preference UI for notification settings

## References

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [Push API Specification](https://w3c.github.io/push-api/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web-push npm package](https://github.com/web-push-libs/web-push)

