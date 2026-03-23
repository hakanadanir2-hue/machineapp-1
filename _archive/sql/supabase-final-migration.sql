-- ============================================================
-- Machine Gym — Final Migration
-- Çalıştır: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE DEFAULT ('MG-' || to_char(now(), 'YYYYMMDD') || '-' || floor(random()*9000+1000)::text),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  items JSONB DEFAULT '[]',
  total_amount NUMERIC(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  order_status TEXT DEFAULT 'new' CHECK (order_status IN ('new','processing','shipped','delivered','cancelled')),
  shipping_address JSONB DEFAULT '{}',
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. GALLERY BUCKET POLICIES (via SQL)
DO $$
BEGIN
  -- Public read for gallery bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'gallery_public_read'
  ) THEN
    CREATE POLICY "gallery_public_read" ON storage.objects
      FOR SELECT USING (bucket_id = 'gallery');
  END IF;

  -- Authenticated insert
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'gallery_auth_insert'
  ) THEN
    CREATE POLICY "gallery_auth_insert" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');
  END IF;

  -- Authenticated delete
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'gallery_auth_delete'
  ) THEN
    CREATE POLICY "gallery_auth_delete" ON storage.objects
      FOR DELETE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- 3. RLS for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='orders_select_admin') THEN
    CREATE POLICY "orders_select_admin" ON orders FOR SELECT 
      USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='orders_insert_anon') THEN
    CREATE POLICY "orders_insert_anon" ON orders FOR INSERT 
      WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='orders_update_admin') THEN
    CREATE POLICY "orders_update_admin" ON orders FOR UPDATE 
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 4. RLS for products (if not already set)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products' AND policyname='products_public_read') THEN
    CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products' AND policyname='products_auth_write') THEN
    CREATE POLICY "products_auth_write" ON products FOR ALL 
      USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- 5. SEO settings defaults (if site_settings table exists and missing SEO keys)
INSERT INTO site_settings (key, value) VALUES
  ('seo_home_title', 'Machine Gym Bolu | Fitness & Boks Salonu'),
  ('seo_home_desc', 'Bolu''nun en premium fitness ve boks salonu. Personal trainer, kickboks, muay thai ve fitness programları.'),
  ('seo_og_image', ''),
  ('seo_blog_title', 'Blog | Machine Gym Bolu'),
  ('seo_blog_desc', 'Fitness, boks, beslenme ve spor hakkında uzman içerikler.'),
  ('seo_services_title', 'Hizmetlerimiz | Machine Gym Bolu'),
  ('seo_pricing_title', 'Fiyatlar & Üyelik Paketleri | Machine Gym'),
  ('seo_shop_title', 'Mağaza | Machine Gym — Boks & Fitness Ekipmanları'),
  ('seo_contact_title', 'İletişim | Machine Gym Bolu'),
  ('seo_about_title', 'Hakkımızda | Machine Gym Bolu')
ON CONFLICT (key) DO NOTHING;

-- 6. Sample products (demo ürünler)
INSERT INTO products (name, slug, sku, category, short_description, price, stock, is_featured, is_new, is_active, order_index) VALUES
  ('Machine Gym Boks Eldiveni', 'machine-gym-boks-eldiveni', 'MG-ELD-001', 'Boks Eldiveni', 'Premium deri boks eldiveni, 12oz', 850, 15, true, true, true, 1),
  ('Machine Gym Tişört', 'machine-gym-tisort', 'MG-TST-001', 'Tişört', 'Nefes alabilir spor tişört', 350, 30, true, false, true, 2),
  ('Machine Gym Hoodie', 'machine-gym-hoodie', 'MG-HOD-001', 'Hoodie', 'Ağır kumaş premium hoodie', 650, 20, true, true, true, 3),
  ('Boks Bandajı', 'boks-bandaji', 'MG-BAN-001', 'Bandaj', '4.5m elastik boks bandajı', 120, 50, false, false, true, 4),
  ('Machine Gym Şort', 'machine-gym-sort', 'MG-SRT-001', 'Şort', 'Rahat kesim antrenman şortu', 280, 25, false, true, true, 5)
ON CONFLICT (slug) DO NOTHING;

SELECT 'Migration tamamlandı' as result;
