# Supabase Storage Integration Guide

## Quick Reference for Product Image Uploads

### Setup Storage Client

```typescript
// lib/supabase/storage.ts
import { createClient } from '@/lib/supabase/client'

export async function uploadProductImage(
  productId: string,
  file: File
): Promise<{ path: string; url: string } | null> {
  const supabase = createClient()
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${productId}/${fileName}`
  
  // Upload to storage
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) {
    console.error('Upload error:', error)
    return null
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)
  
  return { path: filePath, url: publicUrl }
}

export async function deleteProductImage(path: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from('product-images')
    .remove([path])
  
  if (error) {
    console.error('Delete error:', error)
    return false
  }
  
  return true
}

export function getImageUrl(path: string): string {
  const supabase = createClient()
  
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(path)
  
  return publicUrl
}
```

### Usage in Product Add/Edit Forms

```typescript
"use client"

import { useState } from 'react'
import { uploadProductImage, deleteProductImage } from '@/lib/supabase/storage'

export function ProductImageUpload({ productId }: { productId: string }) {
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imagePath, setImagePath] = useState<string | null>(null)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploading(true)

    // Upload image
    const result = await uploadProductImage(productId, file)
    
    if (result) {
      setImageUrl(result.url)
      setImagePath(result.path)
      
      // Save to database
      await saveImageToDatabase(productId, result.path)
    }

    setUploading(false)
  }

  const handleDelete = async () => {
    if (!imagePath) return
    
    const success = await deleteProductImage(imagePath)
    if (success) {
      setImageUrl(null)
      setImagePath(null)
      // Remove from database
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        disabled={uploading}
      />
      
      {uploading && <p>Uploading...</p>}
      
      {imageUrl && (
        <div>
          <img src={imageUrl} alt="Product" />
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}
    </div>
  )
}

async function saveImageToDatabase(productId: string, storagePath: string) {
  const supabase = createClient()
  
  await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      storage_path: storagePath,
      alt_text: 'Product image',
      is_primary: true
    })
}
```

### Display Images in Frontend

```typescript
import { getImageUrl } from '@/lib/supabase/storage'
import Image from 'next/image'

export function ProductCard({ product }) {
  const imageUrl = product.images[0] 
    ? getImageUrl(product.images[0].storage_path)
    : '/placeholder.jpg'

  return (
    <div>
      <Image 
        src={imageUrl} 
        alt={product.name}
        width={400}
        height={400}
      />
    </div>
  )
}
```

### Fetch Products with Images

```typescript
const { data: products } = await supabase
  .from('products')
  .select(`
    id,
    name,
    description,
    base_price,
    images:product_images(
      id,
      storage_path,
      alt_text,
      is_primary,
      sort_order
    )
  `)
  .eq('is_active', true)
  .order('sort_order', { foreignTable: 'product_images' })
```

## Storage Bucket Configuration

- **Bucket Name**: `product-images`
- **Access**: Public read, Admin write
- **Max Size**: 5MB per file
- **Allowed Types**: JPEG, PNG, WebP
- **Path Pattern**: `{product-id}/{timestamp-random}.{ext}`

## Security Notes

✅ RLS policies ensure only admins can upload/delete  
✅ File size validated client-side and server-side  
✅ Unique filenames prevent collisions  
✅ Public URLs for easy CDN integration  
✅ Product folder organization for clean structure