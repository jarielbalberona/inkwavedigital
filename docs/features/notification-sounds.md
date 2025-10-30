# Notification Sounds and Vibration

## Overview

Added audio notifications and vibration feedback for order updates in both the dashboard and customer applications to improve user awareness of important events.

## Features

### 1. Sound Notifications

Using the Web Audio API to generate pleasant notification sounds without requiring external audio files:

#### Dashboard Sounds
- **New Order**: Cheerful ascending chime (C5 → E5 → G5) to alert staff of incoming orders
- **Order Update**: Single pleasant tone for status changes
- **Error**: Lower tone for error notifications

#### Customer Sounds
- **Order Ready**: Happy ascending chime (G5 → B5 → D6) to notify customers their order is ready
- **Order Update**: Single pleasant tone for status changes
- **Error**: Lower tone for error notifications

### 2. Vibration Feedback

Using the Vibration API for haptic feedback on mobile devices:

#### Dashboard Vibration Patterns
- **New Order**: Strong pattern (200ms-pause-200ms-pause-200ms) to grab staff attention
- **Order Update**: Single medium vibration (200ms)
- **Error**: Long single vibration (400ms)

#### Customer Vibration Patterns
- **Order Ready**: Strong pattern (300ms-pause-300ms-pause-300ms-pause-300ms) for important notifications
- **Order Update**: Single medium vibration (200ms)
- **Error**: Long single vibration (400ms)

### 3. User Preferences

Notifications can be controlled by users:
- Sound notifications can be enabled/disabled
- Vibration can be enabled/disabled
- Preferences are saved to localStorage and persist across sessions
- Settings accessed via the `notificationManager` instance

### 4. Browser Compatibility

- **Web Audio API**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- **Vibration API**: Works on mobile devices (Android Chrome, iOS Safari 16.4+)
- **Graceful Degradation**: Falls back silently if APIs are not supported

## Implementation

### File Structure

```
apps/dashboard/src/lib/notifications.ts       # Dashboard notification utilities
apps/customer/src/lib/notifications.ts        # Customer notification utilities
```

### Dashboard Integration

**File**: `apps/dashboard/src/features/kds/components/KDSPage.tsx`

```typescript
import { notificationManager } from "../../../lib/notifications";

// Request permissions on mount
useEffect(() => {
  notificationManager.requestPermissions();
}, []);

// Play sound and vibrate for new orders
newOrders.forEach((order: Order) => {
  // ... show toast and browser notification ...
  
  // Play sound and vibrate
  notificationManager.notify('new-order');
});
```

### Customer Integration

**File**: `apps/customer/src/features/menu/components/MenuPage.tsx`

```typescript
import { notificationManager } from "@/lib/notifications";

// Request permissions on mount
useEffect(() => {
  notificationManager.requestPermissions();
}, []);

// Helper function to get status-specific messages
const getStatusNotification = (status: string) => {
  switch (status) {
    case 'NEW': return { emoji: '📝', title: 'Order Received', ... };
    case 'PREPARING': return { emoji: '👨‍🍳', title: 'Order Being Prepared', ... };
    case 'READY': return { emoji: '🍽️', title: 'Order Ready!', type: 'order-ready' };
    case 'SERVED': return { emoji: '✅', title: 'Order Served', ... };
  }
};

// Notify on every status change
if (previousStatus && previousStatus !== order.status) {
  const notification = getStatusNotification(order.status);
  
  // Show toast (success style for READY, info for others)
  const toastFn = order.status === 'READY' ? toast.success : toast.info;
  toastFn(notification.title, {
    description: `Order #${orderNumber} - ${notification.description}`,
    duration: order.status === 'READY' ? 15000 : 8000,
  });
  
  // Show browser notification
  new Notification(`${notification.emoji} ${notification.title}`, {
    body: `Order #${orderNumber}\n${notification.description}`,
    requireInteraction: order.status === 'READY', // Only for READY
  });
  
  // Play sound and vibrate
  notificationManager.notify(notification.type);
}
```

## API Reference

### NotificationManager Class

#### Methods

```typescript
// Request browser and audio permissions
await notificationManager.requestPermissions(): Promise<void>

// Trigger notification with sound and vibration
await notificationManager.notify(type: 'new-order' | 'order-ready' | 'order-update' | 'error'): Promise<void>

// Enable/disable sound
notificationManager.setSoundEnabled(enabled: boolean): void

// Enable/disable vibration
notificationManager.setVibrationEnabled(enabled: boolean): void

// Check if sound is enabled
notificationManager.isSoundEnabled(): boolean

// Check if vibration is enabled
notificationManager.isVibrationEnabled(): boolean
```

## User Experience

### Dashboard (Staff)
1. When a new order arrives:
   - Visual toast notification appears
   - Browser notification (if permission granted)
   - **Ascending chime plays** 🔊
   - **Phone vibrates in distinctive pattern** 📳
   - Notification persists until acknowledged

### Customer App
Customers receive notifications for **every order status change**:

1. **Order Received** (NEW):
   - 📝 Visual toast notification
   - Browser notification (if permission granted)
   - **Update sound plays** 🔊
   - **Single vibration** 📳

2. **Order Being Prepared** (PREPARING):
   - 👨‍🍳 Visual toast notification
   - Browser notification (if permission granted)
   - **Update sound plays** 🔊
   - **Single vibration** 📳

3. **Order Ready** (READY):
   - 🍽️ Visual toast notification (stays longer - 15s)
   - Browser notification requiring interaction
   - **Happy chime plays** 🔊
   - **Strong vibration pattern** 📳
   - Most prominent notification

4. **Order Served** (SERVED):
   - ✅ Visual toast notification
   - Browser notification (if permission granted)
   - **Update sound plays** 🔊
   - **Single vibration** 📳

## Audio Context Handling

The Web Audio API requires user interaction before playing sounds (browser autoplay policies). The implementation handles this by:

1. Initializing AudioContext on first user interaction
2. Resuming suspended AudioContext when needed
3. Requesting permissions via `requestPermissions()` method
4. Gracefully handling cases where audio cannot play

## Future Enhancements

- [ ] Settings UI to control sound/vibration preferences
- [ ] Volume control for notification sounds
- [ ] Custom sound selection
- [ ] Different sounds for high-priority orders
- [ ] Sound preview in settings

## Testing

To test the notifications:

1. **Dashboard**: Place an order from the customer app → Should hear chime + vibrate
2. **Customer**: Wait for order status to change to READY → Should hear chime + vibrate
3. **Settings**: Check localStorage for `notifications_sound_enabled` and `notifications_vibration_enabled`

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge | Mobile Safari | Mobile Chrome |
|---------|--------|---------|--------|------|---------------|---------------|
| Web Audio | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Vibration | ✅ | ✅ | ❌ | ✅ | ✅ (16.4+) | ✅ |
| Notifications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Notes

- Sound notifications work even when the device is on silent (Web Audio bypasses silent mode)
- Vibration respects device vibration settings
- Notifications respect browser permission settings
- All features degrade gracefully if APIs are not supported

