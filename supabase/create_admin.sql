-- BajuNow: Create First Admin User
-- Run this script after signing up your first user

-- Step 1: Check all users
SELECT u.id, u.email, u.created_at, p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Step 2: Make a user admin (replace email address)
UPDATE profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'  -- CHANGE THIS
);

-- Step 3: Verify the change
SELECT u.id, u.email, p.role, p.updated_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE p.role = 'admin';

-- Step 4: Create profiles for any users missing them
INSERT INTO profiles (id, role, created_at, updated_at)
SELECT id, 'user', NOW(), NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Useful queries for user management:

-- Get all users with their roles
-- SELECT u.email, p.role, u.created_at 
-- FROM auth.users u 
-- JOIN profiles p ON u.id = p.id 
-- ORDER BY u.created_at DESC;

-- Count users by role
-- SELECT role, COUNT(*) as count 
-- FROM profiles 
-- GROUP BY role;

-- Change user back to regular user
-- UPDATE profiles SET role = 'user' WHERE id = 'USER_UUID_HERE';
