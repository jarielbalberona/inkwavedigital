# Super Admin Setup Guide

## 🎯 Quick Setup

### Option 1: Direct Database Insert (Recommended for Testing)

Run this SQL command to add yourself as super admin:

```sql
INSERT INTO super_admins (clerk_user_id, email, role, status, permissions)
VALUES (
  'temp_user_id',
  'your_email@inkwave.com',  -- Replace with your actual email
  'super_admin',
  'active',
  '{}'::jsonb
);
```

**To run SQL:**
```bash
# Connect to your database
psql postgresql://postgres:postgres@localhost:5432/inkwave

# Then paste the INSERT command above
```

### Option 2: Using Docker (if using Docker for database)

```bash
docker exec -it inkwavedigital-db-1 psql -U postgres -d inkwave -c "INSERT INTO super_admins (clerk_user_id, email, role, status, permissions) VALUES ('temp_user_id', 'your_email@inkwave.com', 'super_admin', 'active', '{}'::jsonb);"
```

## 🔍 Verify Setup

Check if super admin was created:

```sql
SELECT id, email, role, status, created_at FROM super_admins;
```

Should return your email in the results.

## 📝 Next Steps

1. **Start the API**:
   ```bash
   cd apps/api && pnpm dev
   ```

2. **Start the Dashboard**:
   ```bash
   cd apps/dashboard && pnpm dev
   ```

3. **Sign in to Dashboard** with your email
   - You should see **"Super Admin Mode"** 
   - Only **Tenant Management** page is visible

## 🧪 Test the System

### Test Super Admin Access:
1. Sign in with super admin email
2. Navigate to Dashboard
3. Should see "Super Admin Mode" badge
4. Only "Tenant Management" page visible
5. Click on it, should see tenant list (empty at first)

### Test Regular User Access:
1. Sign in with different email (not in super_admins table)
2. Navigate to Dashboard
3. Should see KDS, Menu, QR Codes tabs
4. Should NOT see "Super Admin Mode" badge

## ➕ Add More Super Admins

```sql
INSERT INTO super_admins (clerk_user_id, email, role, status, permissions)
VALUES ('temp_id_2', 'admin2@inkwave.com', 'super_admin', 'active', '{}'::jsonb);
```

## 🗑️ Remove Super Admin

```sql
UPDATE super_admins SET status = 'suspended' WHERE email = 'email_to_remove@inkwave.com';
```

Or permanently delete:
```sql
DELETE FROM super_admins WHERE email = 'email_to_remove@inkwave.com';
```

## ⚠️ Important Notes

- Email is case-sensitive in queries
- Clerk user ID can be set to 'temp_user_id' for now
- Status must be 'active' to be recognized as super admin
- Make sure you're signing in with the same email you inserted

## 🔧 Troubleshooting

**Issue:** Dashboard shows KDS/Menu/QR instead of Tenant Management
- **Solution:** Verify your email is in super_admins table and status is 'active'

**Issue:** "Failed to check super admin status" error
- **Solution:** Make sure API is running and database is accessible

**Issue:** Database connection error
- **Solution:** Check DATABASE_URL in .env file

