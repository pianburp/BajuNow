# BajuNow - RBAC Implementation Guide

## Overview
BajuNow is a shirt e-commerce application with Role-Based Access Control (RBAC) implementation. The application has two user roles:
- **User**: Can browse shirts, add to cart, and checkout
- **Admin**: Can manage products, orders, pricing, and store settings

## Architecture

### RBAC Components

1. **Middleware** (`middleware.ts`)
   - Protects routes based on user roles
   - Redirects unauthenticated users to login
   - Redirects authenticated users to their role-specific dashboards

2. **RBAC Utilities** (`lib/rbac.ts`)
   - `getUserRole()` - Get current user's role
   - `getUserProfile()` - Get current user's complete profile
   - `hasRole()` - Check if user has specific role
   - `isAdmin()` - Check if user is admin
   - `isUser()` - Check if user is regular user
   - `requireRole()` - Require specific role (throws error if not met)
   - `requireAdmin()` - Require admin role

3. **Database Schema** (`supabase/migrations/001_create_profiles_rbac.sql`)
   - `profiles` table with role column
   - Row Level Security (RLS) policies
   - Automatic profile creation on user signup
   - Timestamp tracking

## Routes

### User Routes (`/user`)
- `/user` - Browse shirts and featured products
- `/user/cart` - Shopping cart
- `/user/orders` - Order history

### Admin Routes (`/admin`)
- `/admin` - Dashboard with analytics
- `/admin/products` - Product management (add, edit, delete, pricing)
- `/admin/orders` - Order management
- `/admin/settings` - Store configuration

### Auth Routes (`/auth`)
- `/auth/login` - Login page
- `/auth/sign-up` - Sign up page
- `/auth/forgot-password` - Password recovery
- `/auth/update-password` - Update password

## Setup Instructions

### 1. Database Setup

Run the migration file in your Supabase SQL Editor:

```sql
-- Execute: supabase/migrations/001_create_profiles_rbac.sql
```

This will:
- Create the `profiles` table
- Set up RLS policies
- Create triggers for automatic profile creation
- Configure role-based permissions

### 2. Create Admin User

After signing up, manually set a user as admin in Supabase:

```sql
-- Update user role to admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'USER_UUID_HERE';
```

Or via Supabase Dashboard:
1. Go to Table Editor
2. Select `profiles` table
3. Find your user
4. Change `role` column to `admin`

### 3. Environment Variables

Ensure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

## Testing RBAC

### Test User Access
1. Sign up a new account (defaults to 'user' role)
2. Login - should redirect to `/user`
3. Try accessing `/admin` - should redirect back to `/user`

### Test Admin Access
1. Create user and set role to 'admin' in database
2. Login - should redirect to `/admin`
3. Try accessing `/user` - should redirect back to `/admin`

### Test Middleware Protection
- Try accessing `/user` or `/admin` without login - redirects to `/auth/login`
- Login form checks role and redirects accordingly
- Sign-up automatically creates profile with 'user' role

## Security Features

1. **Middleware Protection**: All protected routes require authentication
2. **Role-Based Redirects**: Users automatically redirected to their role-specific dashboard
3. **Row Level Security**: Supabase RLS policies enforce data access rules
4. **Server-Side Role Checks**: `requireAdmin()` function in admin pages
5. **Automatic Profile Creation**: Profiles created on signup via database trigger

## Customization

### Adding New Roles
1. Update `UserRole` type in `lib/rbac.ts`
2. Update database CHECK constraint in migration
3. Add new routes and middleware logic
4. Update RLS policies as needed

### Adding Protected Pages
1. Create page in appropriate role folder (`/user` or `/admin`)
2. Use `requireAdmin()` or check role at page level
3. Middleware automatically protects the route

## Database Schema

```sql
profiles (
  id UUID PRIMARY KEY (references auth.users),
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Next Steps

1. **Implement Product Database**: Create products table and connect to admin UI
2. **Add Cart Functionality**: Implement cart with Supabase
3. **Order Management**: Create orders table and checkout flow
4. **Payment Integration**: Add Stripe or other payment provider
5. **Image Upload**: Add product image management
6. **Search & Filter**: Implement product search and filtering
7. **Email Notifications**: Order confirmations and updates

## Troubleshooting

### User stuck on login page
- Check if profile exists in database
- Verify role is set correctly
- Check middleware logs

### Middleware not working
- Ensure `middleware.ts` is in root directory
- Check matcher configuration
- Verify Supabase credentials

### Profile not created on signup
- Check database trigger is active
- Verify RLS policies allow insertion
- Check sign-up form profile creation code

## Support

For issues or questions about RBAC implementation, check:
- Middleware configuration
- Supabase RLS policies
- Role assignment in database
