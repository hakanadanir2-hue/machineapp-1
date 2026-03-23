-- Machine Gym Admin Panel - Eksik Tablolar Migration
-- Supabase SQL Editor'da çalıştırın

-- 0. site_settings tablosu (CMS + Ayarlar için kritik)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Public can read site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Admin can manage site settings" ON site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Varsayılan site ayarları
INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'Machine Gym'),
  ('site_description', 'Bolu''nun premium fitness & boks salonu'),
  ('site_url', 'https://machinegym.com.tr'),
  ('phone', '0374 270 14 55'),
  ('whatsapp_number', '903742701455'),
  ('email', 'info@machinegym.com.tr'),
  ('address', 'Tabaklar Mah. / Uygur Sokak NO:3, Bolu'),
  ('google_maps_url', 'https://maps.app.goo.gl/ggCzmj3idz2Vtovj8'),
  ('working_hours_weekday', '08:00 – 01:00'),
  ('working_hours_saturday', '10:00 – 01:00'),
  ('working_hours_sunday', '12:00 – 20:00'),
  ('instagram_url', 'https://instagram.com/gymachinebolu'),
  ('facebook_url', 'https://facebook.com/machinegym'),
  ('hero_title', 'Makine Gibi Çalış. Sonuç Kaçınılmaz.'),
  ('hero_subtitle', 'Bolu''nun en disiplinli fitness & boks salonu'),
  ('hero_btn1', 'Deneme Antrenmanı Al'),
  ('hero_btn1_link', '/randevu'),
  ('hero_btn2', 'WhatsApp ile Yaz'),
  ('stat_members', '500+'),
  ('stat_trainers', '8'),
  ('stat_sqm', '600'),
  ('stat_years', '5+')
ON CONFLICT (key) DO NOTHING;

-- 1. campaigns tablosu
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  badge_text TEXT DEFAULT 'Kampanya',
  original_price NUMERIC DEFAULT 0,
  campaign_price NUMERIC DEFAULT 0,
  discount_percent INTEGER DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  category TEXT DEFAULT 'fitness',
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  cta_text TEXT DEFAULT 'Kampanyadan Yararlan',
  cta_link TEXT DEFAULT '/randevu',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. products tablosu
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  sku TEXT,
  category TEXT DEFAULT 'tisort',
  short_description TEXT,
  long_description TEXT,
  price NUMERIC DEFAULT 0,
  discounted_price NUMERIC DEFAULT 0,
  stock INTEGER DEFAULT 0,
  sizes JSONB DEFAULT '[]',
  colors JSONB DEFAULT '[]',
  cover_image_url TEXT,
  gallery_images JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. orders tablosu
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  items JSONB DEFAULT '[]',
  subtotal NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'pending',
  shipping_status TEXT DEFAULT 'pending',
  shipping_address TEXT,
  notes TEXT,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. exercises tablosu
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_name TEXT NOT NULL,
  slug TEXT UNIQUE,
  primary_muscle TEXT DEFAULT 'genel',
  secondary_muscles JSONB DEFAULT '[]',
  category TEXT DEFAULT 'güç',
  equipment TEXT DEFAULT 'bodyweight',
  difficulty TEXT DEFAULT 'orta',
  description TEXT,
  instructions TEXT,
  image_url TEXT,
  video_url TEXT,
  source TEXT DEFAULT 'manual',
  source_url TEXT,
  source_license TEXT,
  attribution_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  home_or_gym TEXT DEFAULT 'gym',
  goal_tags JSONB DEFAULT '[]',
  default_sets INTEGER DEFAULT 3,
  default_reps INTEGER DEFAULT 10,
  rest_seconds INTEGER DEFAULT 90,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. seo_settings tablosu
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT UNIQUE NOT NULL,
  page_label TEXT,
  title TEXT,
  description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  canonical TEXT,
  noindex BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. services tablosu (eğer yoksa)
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'fitness',
  features JSONB DEFAULT '[]',
  cta_text TEXT DEFAULT 'Daha Fazla Bilgi',
  cta_link TEXT DEFAULT '/randevu',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. membership_plans tablosu (eğer yoksa)
CREATE TABLE IF NOT EXISTS membership_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'fitness',
  price NUMERIC DEFAULT 0,
  discounted_price NUMERIC DEFAULT 0,
  duration TEXT,
  description TEXT,
  features JSONB DEFAULT '[]',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  btn_text TEXT DEFAULT 'Hemen Kaydol',
  btn_link TEXT DEFAULT '/randevu',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. blog_posts tablosu (eğer yoksa)
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  category TEXT DEFAULT 'fitness',
  summary TEXT,
  content TEXT,
  cover_image_url TEXT,
  author TEXT DEFAULT 'Machine Gym',
  published_at DATE,
  is_published BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. appointments tablosu (eğer yoksa)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  date TEXT,
  time_slot TEXT,
  service TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. contact_requests tablosu (eğer yoksa)
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  phone TEXT,
  email TEXT,
  message TEXT,
  type TEXT,
  status TEXT DEFAULT 'new',
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Admin erişimi için)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY IF NOT EXISTS "Public can read active campaigns" ON campaigns FOR SELECT USING (is_active = true);
CREATE POLICY IF NOT EXISTS "Public can read active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY IF NOT EXISTS "Public can read active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY IF NOT EXISTS "Public can read active plans" ON membership_plans FOR SELECT USING (is_active = true);
CREATE POLICY IF NOT EXISTS "Public can read published blogs" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY IF NOT EXISTS "Public can read verified exercises" ON exercises FOR SELECT USING (is_active = true AND is_verified = true);
CREATE POLICY IF NOT EXISTS "Public can read seo settings" ON seo_settings FOR SELECT USING (true);

-- Admin full access policies (profiles.role = 'admin')
CREATE POLICY IF NOT EXISTS "Admin full access campaigns" ON campaigns FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY IF NOT EXISTS "Admin full access products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY IF NOT EXISTS "Admin full access orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY IF NOT EXISTS "Admin full access exercises" ON exercises FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY IF NOT EXISTS "Admin full access seo" ON seo_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY IF NOT EXISTS "Admin full access services" ON services FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY IF NOT EXISTS "Admin full access plans" ON membership_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY IF NOT EXISTS "Admin full access blog" ON blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
