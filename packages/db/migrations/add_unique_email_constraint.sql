-- Add unique constraint on email column
-- First, clean up any duplicate emails (keep the one with tenant_id)
DELETE FROM users a USING users b
WHERE a.id < b.id 
  AND a.email = b.email
  AND (a.tenant_id IS NULL OR a.clerk_user_id IS NOT NULL)
  AND b.tenant_id IS NOT NULL
  AND b.clerk_user_id IS NULL;

-- Now add the unique constraint
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id) WHERE clerk_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id) WHERE tenant_id IS NOT NULL;
