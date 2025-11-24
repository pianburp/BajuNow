-- Sample data for BajuNow E-commerce (Streamlined)

-- Get category IDs
DO $$
DECLARE
  casual_category_id UUID;
  formal_category_id UUID;
  polo_category_id UUID;
  graphic_category_id UUID;
  product_1_id UUID;
  product_2_id UUID;
  product_3_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO casual_category_id FROM categories WHERE slug = 'casual';
  SELECT id INTO formal_category_id FROM categories WHERE slug = 'formal';
  SELECT id INTO polo_category_id FROM categories WHERE slug = 'polo';
  SELECT id INTO graphic_category_id FROM categories WHERE slug = 'graphic-tee';

  -- Insert sample products
  INSERT INTO products (id, name, description, sku, base_price, category_id, is_active, featured) VALUES 
  (uuid_generate_v4(), 'Premium Cotton T-Shirt', 'High-quality 100% cotton t-shirt with a comfortable fit. Perfect for casual wear with excellent breathability and durability.', 'SHIRT-001', 29.99, casual_category_id, true, true),
  (uuid_generate_v4(), 'Casual Polo Shirt', 'Classic polo shirt made from premium cotton blend. Features a traditional collar and three-button placket for a smart casual look.', 'POLO-001', 39.99, polo_category_id, true, true),
  (uuid_generate_v4(), 'Graphic Tee - Vintage Style', 'Trendy graphic t-shirt with vintage-inspired designs. Made from soft cotton for ultimate comfort and style.', 'GRAPHIC-001', 24.99, graphic_category_id, true, false)
  RETURNING id;

  -- Get product IDs
  SELECT id INTO product_1_id FROM products WHERE sku = 'SHIRT-001';
  SELECT id INTO product_2_id FROM products WHERE sku = 'POLO-001';
  SELECT id INTO product_3_id FROM products WHERE sku = 'GRAPHIC-001';

  -- Insert product variants for Premium Cotton T-Shirt
  INSERT INTO product_variants (product_id, sku, size, color, color_hex, price, stock_quantity) VALUES 
  (product_1_id, 'SHIRT-001-S-WHITE', 'S', 'White', '#FFFFFF', 29.99, 50),
  (product_1_id, 'SHIRT-001-M-WHITE', 'M', 'White', '#FFFFFF', 29.99, 45),
  (product_1_id, 'SHIRT-001-L-WHITE', 'L', 'White', '#FFFFFF', 29.99, 40),
  (product_1_id, 'SHIRT-001-XL-WHITE', 'XL', 'White', '#FFFFFF', 29.99, 35),
  (product_1_id, 'SHIRT-001-S-BLACK', 'S', 'Black', '#000000', 29.99, 30),
  (product_1_id, 'SHIRT-001-M-BLACK', 'M', 'Black', '#000000', 29.99, 45),
  (product_1_id, 'SHIRT-001-L-BLACK', 'L', 'Black', '#000000', 29.99, 40),
  (product_1_id, 'SHIRT-001-XL-BLACK', 'XL', 'Black', '#000000', 29.99, 25),
  (product_1_id, 'SHIRT-001-S-NAVY', 'S', 'Navy', '#1e3a8a', 29.99, 35),
  (product_1_id, 'SHIRT-001-M-NAVY', 'M', 'Navy', '#1e3a8a', 29.99, 42),
  (product_1_id, 'SHIRT-001-L-NAVY', 'L', 'Navy', '#1e3a8a', 29.99, 38),
  (product_1_id, 'SHIRT-001-XL-NAVY', 'XL', 'Navy', '#1e3a8a', 29.99, 30);

  -- Insert product variants for Casual Polo Shirt
  INSERT INTO product_variants (product_id, sku, size, color, color_hex, price, stock_quantity) VALUES 
  (product_2_id, 'POLO-001-S-WHITE', 'S', 'White', '#FFFFFF', 39.99, 25),
  (product_2_id, 'POLO-001-M-WHITE', 'M', 'White', '#FFFFFF', 39.99, 30),
  (product_2_id, 'POLO-001-L-WHITE', 'L', 'White', '#FFFFFF', 39.99, 28),
  (product_2_id, 'POLO-001-XL-WHITE', 'XL', 'White', '#FFFFFF', 39.99, 20),
  (product_2_id, 'POLO-001-S-NAVY', 'S', 'Navy', '#1e3a8a', 39.99, 22),
  (product_2_id, 'POLO-001-M-NAVY', 'M', 'Navy', '#1e3a8a', 39.99, 35),
  (product_2_id, 'POLO-001-L-NAVY', 'L', 'Navy', '#1e3a8a', 39.99, 30),
  (product_2_id, 'POLO-001-XL-NAVY', 'XL', 'Navy', '#1e3a8a', 39.99, 18);

  -- Insert product variants for Graphic Tee
  INSERT INTO product_variants (product_id, sku, size, color, color_hex, price, stock_quantity) VALUES 
  (product_3_id, 'GRAPHIC-001-S-BLACK', 'S', 'Black', '#000000', 24.99, 40),
  (product_3_id, 'GRAPHIC-001-M-BLACK', 'M', 'Black', '#000000', 24.99, 55),
  (product_3_id, 'GRAPHIC-001-L-BLACK', 'L', 'Black', '#000000', 24.99, 50),
  (product_3_id, 'GRAPHIC-001-XL-BLACK', 'XL', 'Black', '#000000', 24.99, 35),
  (product_3_id, 'GRAPHIC-001-S-WHITE', 'S', 'White', '#FFFFFF', 24.99, 30),
  (product_3_id, 'GRAPHIC-001-M-WHITE', 'M', 'White', '#FFFFFF', 24.99, 45),
  (product_3_id, 'GRAPHIC-001-L-WHITE', 'L', 'White', '#FFFFFF', 24.99, 40);

END $$;