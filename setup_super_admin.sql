-- Setup script for initial super admin
-- Replace 'your_email@inkwave.com' with your actual email

-- Step 1: Add yourself as super admin
-- Note: For now, clerk_user_id is optional since we're using email-based check
INSERT INTO super_admins (clerk_user_id, email, role, status, permissions)
VALUES (
  'user_34cFGLqe6gI2nY7WMGuaeJoaA0B',  -- Replace with actual Clerk user ID when you have it
  'jarielbalb@gmail.com',  -- Replace with your email
  'super_admin',
  'active',
  '{}'::jsonb
) ON CONFLICT (clerk_user_id) DO NOTHING;

-- Step 2: Verify the super admin was created
SELECT id, email, role, status, created_at 
FROM super_admins 
WHERE email = 'jarielbalb@gmail.com';

-- To add more super admins:
-- INSERT INTO super_admins (clerk_user_id, email, role, status, permissions)
-- VALUES ('temp_user_id_2', 'admin2@inkwave.com', 'super_admin', 'active', '{}'::jsonb);

