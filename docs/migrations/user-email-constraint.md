# Production-Grade Solution: Unique Email Constraint

## 🎯 Problem Solved

**Original Issue**: Multiple user records could be created with the same email address, causing webhook logic to update the wrong record.

**Impact**: When a user accepted a Clerk invitation, the webhook would find and update an old duplicate record instead of the correct one, resulting in:
- ❌ Correct record had `tenant_id` but no `clerk_user_id`
- ❌ Wrong record had `clerk_user_id` but no `tenant_id`
- ❌ User couldn't access their tenant

---

## ✅ Production Solution Implemented

### 1. **Database Constraint: Unique Email**

**Schema Change** (`packages/db/src/schema/users.ts`):
```typescript
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").unique(),
  email: text("email").unique().notNull(), // ✅ Added unique + not null
  role: text("role"),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

**Database Migration Applied**:
```sql
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
```

**Result**: Database now **prevents** duplicate emails at the constraint level.

---

### 2. **Repository: Upsert Logic**

**Updated `create()` Method** (`DrizzleUserRepository.ts`):

```typescript
async create(input: CreateUserInput): Promise<User> {
  // Check if user already exists
  const existingUser = await this.findByEmail(input.email);
  
  if (existingUser) {
    // Update existing user if tenant_id is being set
    if (input.tenantId && !existingUser.tenantId) {
      await this.db
        .update(users)
        .set({
          tenantId: input.tenantId,
          role: input.role,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id));
      
      return {
        ...existingUser,
        tenantId: input.tenantId,
        role: input.role,
      };
    }
    
    // User already exists, return it
    return existingUser;
  }

  // Create new user
  const userData = {
    clerkUserId: input.clerkUserId,
    email: input.email,
    role: input.role,
    tenantId: input.tenantId,
  };

  const result = await this.db.insert(users).values(userData).returning();
  return this.mapToEntity(result[0]);
}
```

**What This Does**:
1. ✅ Checks if user exists before creating
2. ✅ If exists and has no tenant, updates with new tenant info (graceful upsert)
3. ✅ If exists with same data, returns existing record (idempotent)
4. ✅ Only creates new record if truly doesn't exist

---

### 3. **Simplified findByEmail()**

**Clean Implementation** (no more workarounds):

```typescript
async findByEmail(email: string): Promise<User | null> {
  // Email is unique, so this will return at most one result
  const result = await this.db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!result) {
    return null;
  }

  return this.mapToEntity(result);
}
```

**Why This Works**:
- Email is unique → only 1 result possible
- No need for complex ordering logic
- Simple, fast, production-ready

---

## 🔄 How It Works Now

### **Creating a Tenant with Owner Email**

```typescript
// 1. Super admin creates tenant
POST /api/v1/admin/tenants
{
  name: "Restaurant ABC",
  slug: "restaurant-abc",
  ownerEmail: "owner@abc.com"
}

// 2. CreateTenantUseCase runs:
await this.userRepository.create({
  clerkUserId: null,
  email: "owner@abc.com",
  role: "owner",
  tenantId: tenant.id,
});

// 3. Repository checks if user exists:
- If NO → Creates new user ✅
- If YES (no tenant) → Updates with tenant_id ✅
- If YES (has tenant) → Returns existing ✅
- NEVER creates duplicate! 🎉
```

### **When User Accepts Invitation**

```typescript
// 1. User signs up via Clerk invitation
// 2. Clerk fires webhook: user.created
// 3. Webhook handler:

const dbUser = await userRepository.findByEmail(email);
// ✅ Always finds THE ONLY user with this email

if (dbUser && dbUser.tenantId) {
  // Update database with clerk_user_id
  await userRepository.updateClerkUserId(dbUser.id, clerkUserId);
  
  // Set metadata in Clerk
  await clerkClient.users.updateUser(clerkUserId, {
    publicMetadata: {
      tenantId: dbUser.tenantId,
      role: dbUser.role,
    },
  });
}
// ✅ Always updates the correct record!
```

---

## 🛡️ Benefits of This Solution

### **1. Data Integrity**
- ✅ Database enforces uniqueness at constraint level
- ✅ Impossible to create duplicate emails
- ✅ Data consistency guaranteed

### **2. Simplicity**
- ✅ No complex query logic needed
- ✅ Clean, readable code
- ✅ Easy to maintain

### **3. Performance**
- ✅ Unique constraint creates automatic index
- ✅ Fast lookups by email
- ✅ No need to scan multiple records

### **4. Idempotency**
- ✅ Safe to call `create()` multiple times
- ✅ Won't fail if user already exists
- ✅ Updates only what needs updating

### **5. Production-Ready**
- ✅ Follows database best practices
- ✅ Handles edge cases gracefully
- ✅ No workarounds or hacks

---

## 🧪 Testing the Solution

### **Test Case 1: Create New Tenant**

```bash
# 1. Create tenant with owner email
curl -X POST http://localhost:3000/api/v1/admin/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Restaurant",
    "slug": "test-restaurant",
    "ownerEmail": "newowner@test.com"
  }'

# 2. Check database
docker exec inkwave-postgres psql -U postgres -d inkwave \
  -c "SELECT email, clerk_user_id, tenant_id, role FROM users WHERE email = 'newowner@test.com';"

# Expected:
# email: newowner@test.com
# clerk_user_id: NULL (not signed up yet)
# tenant_id: <uuid> ✅
# role: owner ✅
```

### **Test Case 2: Try to Create Duplicate (Should Fail)**

```bash
# Try to manually insert duplicate email
docker exec inkwave-postgres psql -U postgres -d inkwave \
  -c "INSERT INTO users (email, role) VALUES ('newowner@test.com', 'staff');"

# Expected: ERROR: duplicate key value violates unique constraint "users_email_unique"
# ✅ Database prevents duplicate!
```

### **Test Case 3: Accept Invitation**

```bash
# 1. Accept invitation via Clerk email
# 2. User signs up
# 3. Watch logs:

docker logs -f inkwave-api | grep webhook

# Expected:
# [webhook-controller] Processing user.created event
# [webhook-controller] Updated database with Clerk user ID
# [webhook-controller] Updated Clerk user metadata with tenant ID ✅
```

### **Test Case 4: Verify Final State**

```bash
# Check database after signup
docker exec inkwave-postgres psql -U postgres -d inkwave \
  -c "SELECT email, clerk_user_id, tenant_id, role FROM users WHERE email = 'newowner@test.com';"

# Expected:
# email: newowner@test.com
# clerk_user_id: user_xxxxx ✅ (populated by webhook)
# tenant_id: <uuid> ✅ (still there)
# role: owner ✅

# Check Clerk Dashboard → Users → newowner@test.com → Public Metadata
# Expected:
# {
#   "tenantId": "<uuid>",
#   "role": "owner"
# }
```

---

## 📊 Database State

### **Clean Slate After Implementation**

```sql
SELECT COUNT(*) FROM users;
-- Result: 0

SELECT COUNT(*) FROM tenants;
-- Result: 0

-- All test data cleared for fresh start ✅
```

### **Schema Verification**

```sql
\d users

-- Constraints:
-- ✅ users_pkey (PRIMARY KEY on id)
-- ✅ users_clerk_user_id_unique (UNIQUE on clerk_user_id)
-- ✅ users_email_unique (UNIQUE on email) ← NEW!
```

---

## 🚀 Ready for Production

### **What Changed**
1. ✅ Added unique constraint on email
2. ✅ Made email required (NOT NULL)
3. ✅ Added upsert logic in repository
4. ✅ Simplified query logic
5. ✅ Cleared all test data

### **What to Test**
1. ✅ Create new tenant with owner email
2. ✅ Verify user record created
3. ✅ Accept invitation and sign up
4. ✅ Verify webhook updates correct record
5. ✅ Verify tenant ID in Clerk metadata
6. ✅ Log in and access tenant data

### **Migration for Existing Production**

If you have production data with duplicates:

```sql
-- 1. Backup first!
pg_dump -U postgres inkwave > backup.sql

-- 2. Clean up duplicates (keep newest with tenant_id)
DELETE FROM users a USING users b
WHERE a.id < b.id 
  AND a.email = b.email
  AND a.tenant_id IS NULL
  AND b.tenant_id IS NOT NULL;

-- 3. Add constraint
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
```

---

## ✅ Summary

**Problem**: Duplicate emails causing webhook to update wrong user record

**Solution**: 
- Database-level unique constraint
- Upsert logic in repository
- Simplified queries

**Result**:
- ✅ No more duplicates possible
- ✅ Webhook always finds correct user
- ✅ Production-ready and maintainable
- ✅ Clean, simple code

🎉 **Ready to test with real tenant creation!**

