# Database Setup - Quick Start Guide

## Step 1: Run the Migration

In your Supabase Dashboard:

1. Go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase/migrations/001_create_profiles_rbac.sql`
4. Click **Run** or press `Ctrl+Enter`

## Step 2: Verify Table Creation

Run this query to verify the `profiles` table was created:

```sql
SELECT * FROM profiles;
```

## Step 3: Create Your First Admin User

### Option A: Via SQL Editor

After signing up a user, run:

```sql
-- Replace 'your-email@example.com' with your email
UPDATE profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
);
```

### Option B: Via Table Editor

1. Go to **Table Editor** in Supabase Dashboard
2. Select the `profiles` table
3. Find your user row
4. Click on the `role` cell
5. Change from `user` to `admin`
6. Press Enter to save

## Step 4: Test the Setup

1. **Test User Flow:**
   - Sign up a new account
   - Login → should redirect to `/user`
   - Try accessing `/admin` → should redirect back to `/user`

2. **Test Admin Flow:**
   - Login with your admin account
   - Should redirect to `/admin`
   - Try accessing `/user` → should redirect back to `/admin`

## Troubleshooting

### Profile not created automatically

Check if the trigger is active:

```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

If missing, re-run the migration script.

### Check existing profiles

```sql
SELECT p.id, u.email, p.role, p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.id;
```

### Manually create profile for existing user

If you have users without profiles:

```sql
-- Create profile for existing users
INSERT INTO profiles (id, role, created_at, updated_at)
SELECT id, 'user', NOW(), NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```

## RLS Policies Explained

The migration creates these Row Level Security policies:

1. **Users can read own profile** - Users see their own data
2. **Users can update own profile** - Users can update their data (but not their role)
3. **Admins can read all profiles** - Admins see all user profiles
4. **Admins can update all profiles** - Admins can update any profile including roles

## Next Steps

After database setup:
1. Sign up your first user
2. Make them admin using Step 3
3. Login and test both user and admin dashboards
4. Set up product tables for inventory
5. Set up orders table for transactions

## Support

If you encounter issues:
- Check Supabase logs in Dashboard
- Verify RLS is enabled on profiles table
- Ensure triggers are active
- Check that auth.users table is accessible
