# Next Steps: Tenant Owner & Staff Management

## 🎯 Current State
✅ Super admin can create tenants with basic info (name, slug, optional venue)  
❌ No way to invite tenant owners  
❌ No way for tenant owners to manage staff  
❌ No connection between users and tenants

## 📋 What Needs to be Implemented

### Phase 1: Tenant Owner Invitation (Priority: High)

**Option A: Store Clerk User ID in Users Table**
```sql
-- When creating a tenant, also create a user record
INSERT INTO users (clerk_user_id, email, role, tenant_id)
VALUES ('clerk_user_id', 'owner@tenant.com', 'owner', 'tenant_id');
```

**What This Means:**
- Tenant gets created with basic info
- Super admin provides tenant owner email
- Clerk user is created for that email (via Clerk dashboard or API)
- User record is created linking them to the tenant
- They can now log in and see their tenant's venues

**Implementation Steps:**
1. Update `TenantForm` to include "Owner Email" field
2. Update API to create user record when tenant is created
3. Save Clerk user ID when owner signs in for first time

### Phase 2: Tenant Owner Dashboard (Priority: High)

**What Tenant Owners Need to See:**
- **Venues Tab**: List of venues for their tenant (filtered by tenant_id)
- **Staff Management Tab**: Invite staff, assign to venues, manage roles
- **Settings Tab**: Update tenant info

**Implementation:**
1. Create `VenueManagementPage` (for tenant owners)
2. Create `StaffManagementPage` (invite staff via email)
3. Add tenant_id filtering to all venue queries
4. Update navigation based on user's role

### Phase 3: Staff Invitation (Priority: Medium)

**When Tenant Owner Invites Staff:**
1. Enter staff email
2. API creates invitation record (or sends Clerk invite)
3. Staff gets email invite
4. Staff signs in, gets assigned to tenant
5. Staff can access venues they're assigned to

**Database Schema Needed:**
```sql
-- Add to existing users table
tenant_id: uuid (already exists)

-- Maybe add for staff assignments
venue_staff:
  - id
  - venue_id
  - staff_user_id
  - role ('staff', 'manager')
```

## 🔧 Recommended Quick Implementation

### Quick Path: Add Owner Email to Tenant Creation

**Step 1: Update TenantForm**
```tsx
// Add field in TenantForm.tsx
<TextField
  label="Owner Email"
  value={formData.ownerEmail}
  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
  required
  helperText="Email of the person who will manage this tenant"
/>
```

**Step 2: Update API Endpoint**
```typescript
// In AdminController.createTenant()
// After creating tenant, create user record
if (input.ownerEmail) {
  await userRepository.create({
    email: input.ownerEmail,
    role: 'owner',
    tenantId: tenant.id,
  });
  
  // TODO: Send invitation email via Clerk
}
```

**Step 3: Manual Admin Steps**
Super admin manually:
1. Create tenant via dashboard
2. Go to Clerk Dashboard
3. Create user with owner email
4. Note the Clerk user ID
5. Update users table with that ID

### Better Path: Full Clerk Integration

**Step 1: Add Clerk User Invitation API**
```typescript
// apps/api/src/application/use-cases/InviteTenantOwnerUseCase.ts
async execute(tenantId: string, email: string) {
  // Create user record
  await userRepository.create({ email, role: 'owner', tenantId });
  
  // Send Clerk invitation
  await clerkClient.users.inviteUser({ emailAddress: [email] });
  
  // Link clerk_user_id when they first sign in
}
```

**Step 2: Add Staff Management**
```typescript
// Tenant owner can invite staff
POST /api/v1/tenants/:tenantId/staff/invite
{
  email: string,
  role: 'staff' | 'manager',
  venueId?: string
}
```

## 📊 User Roles & Access

### Super Admin (Inkwave Staff)
- Can create tenants
- Can access all tenants
- Full system access

### Tenant Owner
- Manages their tenant
- Creates venues
- Invites staff
- Views all venues for their tenant

### Venue Manager
- Manages specific venue
- Can invite staff to their venue
- Views orders for their venue
- KDS access for their venue

### Venue Staff
- Views orders for their venue
- KDS access for their venue
- Cannot invite staff

## 🎯 Priority Order for Implementation

1. **NOW**: Add owner email field to tenant creation
2. **NEXT**: Create user record when tenant is created
3. **THEN**: Add tenant filtering to venue queries
4. **THEN**: Create tenant owner dashboard (separate from super admin)
5. **THEN**: Add staff invitation functionality
6. **FINAL**: Add Clerk user creation/invitation API

## 💡 Recommendations

### For Development/Testing:
- Add owner email to tenant creation form
- Manually create users in Clerk when creating tenants
- Test tenant-scoped access

### For Production:
- Implement full Clerk invitation flow
- Add staff management UI
- Add permission system for different roles
- Add audit logging for all user actions

---

**Would you like me to implement the "Quick Path" (owner email field) now?**
This would allow:
1. Capture owner email during tenant creation
2. Save it for later use
3. Super admin can manually create Clerk user
4. Then link the Clerk user ID back to the database

