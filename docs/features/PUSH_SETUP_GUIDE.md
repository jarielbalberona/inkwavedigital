# Web Push Notifications - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Generate VAPID Keys

```bash
cd apps/api
npx web-push generate-vapid-keys
```

You'll get output like:
```
=======================================
Public Key:
BNg7J9Oi...

Private Key:
VkXtHN2m...
=======================================
```

### Step 2: Add to Environment

Add these to your `.env` file in the root:

```bash
# Web Push Notifications
VAPID_PUBLIC_KEY=BNg7J9Oi...  # Paste your public key
VAPID_PRIVATE_KEY=VkXtHN2m... # Paste your private key
VAPID_SUBJECT=mailto:your-email@domain.com
```

### Step 3: Run Database Migration

```bash
# The migration file is already created at:
# packages/db/migrations/0008_add_push_subscriptions.sql

# Run it with your database tool or:
psql $DATABASE_URL -f packages/db/migrations/0008_add_push_subscriptions.sql
```

### Step 4: Install Dependencies

```bash
# Install web-push in API
cd apps/api
pnpm install

# Rebuild db package (includes new push_subscriptions schema)
cd ../../packages/db
pnpm run build
```

### Step 5: Restart Services

```bash
# From root directory
pnpm run dev

# Or restart individual services:
# - API: cd apps/api && pnpm run dev
# - Customer: cd apps/customer && pnpm run dev
# - Dashboard: cd apps/dashboard && pnpm run dev
```

## ✅ Test It Works

### Test 1: Check Service Worker Registration

1. Open customer app: `http://localhost:5173`
2. Open browser console
3. Look for: `[NotificationManager] Service worker registered`
4. Look for: `[NotificationManager] Push subscription successful`

### Test 2: Place an Order

1. Add items to cart in customer app
2. Complete checkout
3. **Customer receives**: "Order Received" notification
4. **Staff receives** (when dashboard is open): "New Order!" notification

### Test 3: Update Order Status

1. Open dashboard KDS page
2. Change order status to "PREPARING"
3. **Customer receives**: "Order Being Prepared" notification
4. Change to "READY"
5. **Customer receives**: "Order Ready!" notification (requires interaction)

### Test 4: Lock Screen (Mobile)

1. Open customer app on mobile
2. Allow notifications when prompted
3. Lock your phone
4. Have someone change the order status
5. **Notification appears on lock screen!** 🎉

## 🔍 Troubleshooting

### "Push subscription failed"

**Check VAPID keys:**
```bash
echo $VAPID_PUBLIC_KEY
echo $VAPID_PRIVATE_KEY
```

If empty, add them to `.env` and restart API.

### "Service worker registration failed"

**Check HTTPS:**
- Localhost: Should work fine
- Production: Must use HTTPS

**Check sw.js exists:**
```bash
ls apps/customer/public/sw.js
ls apps/dashboard/public/sw.js
```

### No notifications on lock screen

**iOS:**
- Must add app to home screen (Safari > Share > Add to Home Screen)
- Then open from home screen icon

**Android:**
- Should work in normal browser
- Ensure notification permissions granted

### API errors

**Check logs:**
```bash
# In API terminal, look for:
# [PushNotificationService] Initialized with VAPID keys
# [PushNotificationService] Sent notification to...
```

**Check database:**
```sql
SELECT * FROM push_subscriptions;
-- Should show subscriptions with endpoints
```

## 📱 Production Checklist

- [ ] VAPID keys generated and added to production environment
- [ ] Database migration applied
- [ ] VAPID_SUBJECT set to production mailto
- [ ] HTTPS enabled (required for service workers)
- [ ] Test on real mobile devices (iOS & Android)
- [ ] Test lock screen notifications
- [ ] Monitor failed push deliveries in logs
- [ ] Set up error alerts for push failures

## 🎯 What's Included

✅ **Backend:**
- Database schema for push subscriptions
- PushNotificationService with web-push
- Subscribe/unsubscribe API endpoints
- Automatic push on order create/update

✅ **Frontend (Customer):**
- Service worker for background notifications
- NotificationManager with push support
- Automatic subscription on first visit
- Lock screen notifications

✅ **Frontend (Dashboard):**
- Service worker for background notifications
- Ready for user/venue-based subscriptions
- New order notifications

✅ **Documentation:**
- Complete API reference
- Usage examples
- Troubleshooting guide
- Browser compatibility matrix

## 🔗 Next Steps

1. **Deploy to staging** and test on real devices
2. **Add dashboard user subscription** (similar to customer implementation)
3. **Monitor analytics** - track notification delivery success rate
4. **Consider adding** notification action buttons ("View Order")
5. **A/B test** different notification styles for engagement

## 📚 Full Documentation

See `/docs/features/web-push-notifications.md` for complete documentation including:
- Architecture overview
- API endpoints details
- Notification manager API
- Security considerations
- Performance optimization
- Future enhancements

---

**Need help?** Check the main documentation or logs for detailed error messages.

