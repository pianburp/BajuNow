# BajuNow Database Schema

This document describes the complete database schema for the BajuNow e-commerce application built with Supabase and PostgreSQL.

## Database Overview

The database supports a complete shirt e-commerce platform with features including:
- Product catalog with variants (sizes, colors)
- User authentication and role-based access
- Shopping cart and checkout
- Order management
- Coupon/discount system
- Inventory tracking
- Product reviews
- Wishlist functionality

## Tables

### Core Tables

#### `profiles`
User profile information extending Supabase Auth users.
- **Purpose**: Store user roles and additional profile data
- **Key Fields**: `id` (UUID, FK to auth.users), `role` (admin/user), `display_name`
- **Security**: Users can read/update own profile, admins can read all

#### `categories`
Product categories for organizing shirts.
- **Purpose**: Categorize products (Casual, Formal, Polo, etc.)
- **Key Fields**: `id`, `name`, `description`, `slug`
- **Security**: Public read access, admin write access

#### `brands`
Brand information for products.
- **Purpose**: Store brand details and metadata
- **Key Fields**: `id`, `name`, `description`, `logo_url`, `website_url`
- **Security**: Public read access, admin write access

#### `products`
Main product information.
- **Purpose**: Store core product details for shirts
- **Key Fields**: `id`, `name`, `description`, `sku`, `base_price`, `category_id`, `brand_id`
- **Security**: Public can read active products, admin manages all
- **Relationships**: 
  - Belongs to `categories` and `brands`
  - Has many `product_variants`, `product_images`, `product_reviews`

#### `product_variants`
Product variations by size and color.
- **Purpose**: Store specific combinations of size/color for each product
- **Key Fields**: `id`, `product_id`, `sku`, `size`, `color`, `color_hex`, `price`, `stock_quantity`
- **Security**: Public can read active variants of active products
- **Unique Constraint**: `(product_id, size, color)`

#### `product_images`
Product and variant images.
- **Purpose**: Store product photos for display
- **Key Fields**: `id`, `product_id`, `variant_id`, `image_url`, `alt_text`, `is_primary`
- **Security**: Public read access, admin write access

### E-commerce Tables

#### `coupons`
Discount coupons and promotions.
- **Purpose**: Manage discount codes and promotional offers
- **Key Fields**: `id`, `code`, `discount_type`, `discount_value`, `usage_limit`, `expires_at`
- **Discount Types**: `percentage`, `fixed`, `shipping`
- **Security**: Public can read active coupons, admin manages all

#### `cart_items`
User shopping cart items.
- **Purpose**: Store items users have added to their cart
- **Key Fields**: `id`, `user_id`, `variant_id`, `quantity`
- **Security**: Users can only access their own cart items
- **Unique Constraint**: `(user_id, variant_id)`

#### `orders`
Customer orders.
- **Purpose**: Store order header information
- **Key Fields**: `id`, `user_id`, `order_number`, `status`, `total_amount`, `payment_status`
- **Status Values**: `pending`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`
- **Security**: Users can access own orders, admin can access all
- **Auto-generated**: `order_number` (format: BN20231123XXXXX)

#### `order_items`
Items within each order.
- **Purpose**: Store individual line items for orders
- **Key Fields**: `id`, `order_id`, `variant_id`, `product_name`, `size`, `color`, `price`, `quantity`
- **Security**: Users can access items from their own orders
- **Snapshot Data**: Stores product info at time of purchase

#### `shipping_addresses`
Customer shipping addresses.
- **Purpose**: Store delivery addresses for orders
- **Key Fields**: `id`, `user_id`, `order_id`, `full_name`, `address_line_1`, `city`, `postal_code`
- **Security**: Users can access own addresses, admin can access all

### Additional Tables

#### `order_status_history`
Order status change tracking.
- **Purpose**: Audit trail of order status changes
- **Key Fields**: `id`, `order_id`, `status`, `notes`, `created_by`
- **Security**: Users can read own order history, admin can manage all

#### `wishlist_items`
User product wishlists.
- **Purpose**: Allow users to save products for later
- **Key Fields**: `id`, `user_id`, `product_id`
- **Security**: Users can only access their own wishlist

#### `product_reviews`
Customer product reviews.
- **Purpose**: Customer feedback and ratings
- **Key Fields**: `id`, `user_id`, `product_id`, `rating`, `title`, `comment`, `is_approved`
- **Security**: Public can read approved reviews, users manage own reviews
- **Constraints**: One review per user per product

#### `inventory_transactions`
Inventory movement tracking.
- **Purpose**: Audit trail of stock changes
- **Key Fields**: `id`, `variant_id`, `transaction_type`, `quantity_change`, `reference_id`
- **Transaction Types**: `sale`, `restock`, `adjustment`, `return`
- **Security**: Admin access only

## Key Features

### Automatic Triggers
- **Updated Timestamps**: Auto-update `updated_at` fields
- **Order Numbers**: Auto-generate unique order numbers
- **Inventory Updates**: Automatically reduce stock on orders

### Security (RLS)
- **Role-based Access**: Admin vs User permissions
- **Data Isolation**: Users can only access their own data
- **Public Content**: Product catalog publicly readable

### Functions
- `generate_order_number()`: Creates unique order identifiers
- `update_inventory_on_order()`: Manages stock levels
- `is_admin()`: Helper function for admin checks

### Indexes
Performance indexes on commonly queried fields:
- Product category and brand lookups
- User-specific data (cart, orders, wishlist)
- Order status filtering
- Product review queries

## Migration Files

1. **001_create_profiles_rbac.sql** - User profiles and roles
2. **002_create_ecommerce_schema.sql** - Main database schema
3. **003_create_rls_policies.sql** - Security policies
4. **004_insert_sample_data.sql** - Sample products and data

## Usage Examples

### Common Queries

```sql
-- Get all products with variants and stock
SELECT p.name, pv.size, pv.color, pv.price, pv.stock_quantity
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE p.is_active = true AND pv.is_active = true;

-- Get user's cart with product details
SELECT p.name, pv.size, pv.color, pv.price, ci.quantity,
       (pv.price * ci.quantity) as total
FROM cart_items ci
JOIN product_variants pv ON ci.variant_id = pv.id
JOIN products p ON pv.product_id = p.id
WHERE ci.user_id = $1;

-- Apply coupon discount
SELECT 
  CASE 
    WHEN c.discount_type = 'percentage' THEN subtotal * (c.discount_value / 100)
    WHEN c.discount_type = 'fixed' THEN c.discount_value
    ELSE 0
  END as discount_amount
FROM coupons c
WHERE c.code = $1 AND c.is_active = true;
```

### Sample Data

The migration includes sample data:
- 5 product categories
- 6 sample shirt products
- Multiple size/color variants
- 4 test coupon codes
- Sample product reviews

## Integration with Frontend

This schema supports the BajuNow Next.js application features:
- `/user/cart` - Cart management
- `/user/cart/payment` - Checkout and coupons
- `/user/orders` - Order history
- `/admin/products` - Product management
- `/admin/orders` - Order management

## Environment Setup

1. Run migrations in Supabase SQL Editor in order
2. Update environment variables in `.env.local`
3. Test with sample data provided
4. Configure storage policies for product images if needed

## Security Notes

- All tables have Row Level Security enabled
- Admin functions require proper role verification
- User data is isolated by user ID
- Public product data is read-only for non-admins
- Sensitive operations (inventory, orders) are audit-logged