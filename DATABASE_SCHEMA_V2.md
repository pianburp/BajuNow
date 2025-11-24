# BajuNow Database Schema V2 (Streamlined)

## Overview
Clean, production-ready schema for BajuNow e-commerce platform with Supabase Storage integration.

## What Changed from V1

### ✅ Removed (Over-engineered)
- ❌ `brands` table - Not needed for MVP
- ❌ `wishlist_items` - Can be added later
- ❌ `product_reviews` - Can be added later
- ❌ `order_status_history` - Over-engineering
- ❌ `shipping_addresses` separate table - Now stored as JSONB in orders
- ❌ `inventory_transactions` - Too complex for MVP

### ✅ Simplified
- **product_images**: Changed from `image_url` to `storage_path` for Supabase Storage
- **orders**: Embedded shipping address as JSONB instead of foreign key
- **order_items**: Removed foreign key to variant_id (denormalized for historical accuracy)
- **coupons**: Removed unused fields like `usage_limit`, `used_count`

### ✅ Added
- **Storage Bucket**: `product-images` bucket with proper RLS policies
- **File Upload**: Support for JPEG, PNG, WebP up to 5MB

## Core Tables

### 1. **categories**
```sql
- id (UUID)
- name (VARCHAR 100)
- description (TEXT)
- slug (VARCHAR 100)
- created_at (TIMESTAMP)
```

### 2. **products**
```sql
- id (UUID)
- name (VARCHAR 200)
- description (TEXT)
- sku (VARCHAR 100) UNIQUE
- base_price (DECIMAL 10,2)
- category_id (UUID) → categories
- is_active (BOOLEAN)
- featured (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

### 3. **product_variants**
```sql
- id (UUID)
- product_id (UUID) → products
- sku (VARCHAR 100) UNIQUE
- size (VARCHAR 10) -- S, M, L, XL, XXL
- color (VARCHAR 50)
- color_hex (VARCHAR 7)
- price (DECIMAL 10,2)
- stock_quantity (INTEGER)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
- UNIQUE(product_id, size, color)
```

### 4. **product_images**
```sql
- id (UUID)
- product_id (UUID) → products
- storage_path (TEXT) -- e.g., "product-images/abc-123/shirt-front.jpg"
- alt_text (VARCHAR 200)
- sort_order (INTEGER)
- is_primary (BOOLEAN)
- created_at (TIMESTAMP)
```

### 5. **coupons**
```sql
- id (UUID)
- code (VARCHAR 50) UNIQUE
- description (TEXT)
- discount_type (ENUM: percentage, fixed, shipping)
- discount_value (DECIMAL 10,2)
- minimum_order_amount (DECIMAL 10,2)
- is_active (BOOLEAN)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

### 6. **cart_items**
```sql
- id (UUID)
- user_id (UUID) → auth.users
- variant_id (UUID) → product_variants
- quantity (INTEGER)
- created_at, updated_at (TIMESTAMP)
- UNIQUE(user_id, variant_id)
```

### 7. **orders**
```sql
- id (UUID)
- user_id (UUID) → auth.users
- order_number (VARCHAR 50) UNIQUE -- Auto-generated: BN20241124XXXXX
- status (ENUM: pending, processing, shipped, delivered, cancelled)
- subtotal, tax_amount, shipping_amount, discount_amount, total_amount (DECIMAL 10,2)
- coupon_code (VARCHAR 50)
- payment_method (VARCHAR 50)
- payment_status (ENUM: pending, paid, failed)
- shipping_address (JSONB) -- { "name": "...", "address": "...", "city": "...", etc }
- created_at, updated_at (TIMESTAMP)
```

### 8. **order_items**
```sql
- id (UUID)
- order_id (UUID) → orders
- product_name (VARCHAR 200) -- Snapshot
- product_sku (VARCHAR 100) -- Snapshot
- size (VARCHAR 10)
- color (VARCHAR 50)
- price (DECIMAL 10,2) -- Snapshot
- quantity (INTEGER)
- total (DECIMAL 10,2)
- created_at (TIMESTAMP)
```

## Storage Bucket

### **product-images**
- **Access**: Public read, admin write
- **File Types**: JPEG, PNG, WebP
- **Size Limit**: 5MB per file
- **Path Structure**: `product-images/{product-id}/{filename}`

### Example Storage Paths
```
product-images/abc-123-def/shirt-front.jpg
product-images/abc-123-def/shirt-back.jpg
product-images/xyz-456-ghi/polo-white.webp
```

## Row Level Security (RLS)

### Public Access
- ✅ Read active products & variants
- ✅ Read product images
- ✅ Read active coupons
- ✅ View storage bucket images

### Authenticated Users
- ✅ Manage own cart
- ✅ View own orders
- ✅ Create orders

### Admins Only
- ✅ Manage all products, variants, images
- ✅ Manage categories & coupons
- ✅ Upload/delete product images
- ✅ View all orders
- ✅ Update order status

## Automatic Features

### Triggers
- **updated_at**: Auto-updates on products, variants, cart, orders
- **order_number**: Auto-generates format `BN{YYYYMMDD}{5-digit-random}`
- **inventory**: Auto-decrements stock when order is created

### Indexes
- Products: category, active status
- Variants: product_id
- Images: product_id
- Cart: user_id
- Orders: user_id, status

## Migration Files

1. **001_create_profiles_rbac.sql** - User profiles & roles (existing)
2. **002_create_ecommerce_schema_v2.sql** - Main schema (NEW)
3. **003_create_rls_policies_v2.sql** - Security policies (NEW)
4. **004_insert_sample_data_v2.sql** - Sample products (NEW)
5. **005_create_storage_bucket.sql** - Storage configuration (NEW)

## Setup Instructions

### 1. Run Migrations in Supabase SQL Editor
Execute in order:
```sql
-- Already exists
-- 001_create_profiles_rbac.sql

-- New streamlined schema
002_create_ecommerce_schema_v2.sql
003_create_rls_policies_v2.sql
004_insert_sample_data_v2.sql
005_create_storage_bucket.sql
```

### 2. Verify Storage Bucket
- Go to Supabase Dashboard → Storage
- Confirm `product-images` bucket exists
- Check it's marked as **Public**

### 3. Test Upload (Admin Only)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

// Upload image
const file = event.target.files[0]
const productId = 'abc-123-def'
const fileName = `${Date.now()}-${file.name}`
const filePath = `${productId}/${fileName}`

const { data, error } = await supabase.storage
  .from('product-images')
  .upload(filePath, file)

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('product-images')
  .getPublicUrl(filePath)

// Save to database
await supabase
  .from('product_images')
  .insert({
    product_id: productId,
    storage_path: filePath,
    alt_text: 'Product image',
    is_primary: true
  })
```

## Frontend Integration

### Fetch Products with Images
```typescript
const { data: products } = await supabase
  .from('products')
  .select(`
    *,
    category:categories(*),
    variants:product_variants(*),
    images:product_images(*)
  `)
  .eq('is_active', true)

// Get image URL
const imageUrl = supabase.storage
  .from('product-images')
  .getPublicUrl(product.images[0].storage_path)
  .data.publicUrl
```

### Add to Cart
```typescript
await supabase
  .from('cart_items')
  .upsert({
    user_id: userId,
    variant_id: variantId,
    quantity: 1
  })
```

### Create Order
```typescript
const { data: order } = await supabase
  .from('orders')
  .insert({
    user_id: userId,
    subtotal: 100.00,
    tax_amount: 8.00,
    shipping_amount: 9.99,
    total_amount: 117.99,
    shipping_address: {
      name: 'John Doe',
      address_line_1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'USA'
    }
  })
  .select()
  .single()

// Add order items
await supabase
  .from('order_items')
  .insert(
    cartItems.map(item => ({
      order_id: order.id,
      product_name: item.product.name,
      product_sku: item.variant.sku,
      size: item.variant.size,
      color: item.variant.color,
      price: item.variant.price,
      quantity: item.quantity,
      total: item.variant.price * item.quantity
    }))
  )
```

## Benefits of V2

✅ **Simpler**: 8 tables instead of 14  
✅ **Faster**: Fewer joins, better performance  
✅ **Storage-ready**: Native Supabase Storage integration  
✅ **Production-ready**: Only essential features  
✅ **Maintainable**: Clean schema, easy to understand  
✅ **Scalable**: Can add features later (reviews, wishlist, etc)  

## What to Add Later (if needed)

- Product reviews & ratings
- Wishlist functionality
- Detailed inventory tracking
- Order status history
- Multiple shipping addresses
- Brand management
- Advanced analytics