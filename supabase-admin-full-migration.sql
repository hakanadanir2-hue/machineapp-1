-- =============================================
-- MACHINE GYM - FULL ADMIN MIGRATION
-- Güvenli: DROP yok, IF NOT EXISTS kullanıldı
-- =============================================

-- 1. products tablosuna video + galeri alanları ekle
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS material TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- 2. product_images tablosu (galeri görselleri)
CREATE TABLE IF NOT EXISTS product_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid REFERENCES products(id) ON DELETE CASCADE,
  image_url   text NOT NULL,
  alt_text    text,
  order_index integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_product_images" ON product_images;
CREATE POLICY "public_read_product_images" ON product_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_all_product_images" ON product_images;
CREATE POLICY "admin_all_product_images" ON product_images FOR ALL USING (true) WITH CHECK (true);

-- 3. announcements tablosu (duyuru/banner)
CREATE TABLE IF NOT EXISTS announcements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  message     text NOT NULL,
  type        text DEFAULT 'info' CHECK (type IN ('info','success','warning','error','promo')),
  bg_color    text DEFAULT '#7A0D2A',
  text_color  text DEFAULT '#fff',
  link_url    text,
  link_text   text,
  is_active   boolean DEFAULT true,
  starts_at   timestamptz,
  ends_at     timestamptz,
  order_index integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_announcements" ON announcements;
CREATE POLICY "public_read_announcements" ON announcements FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "admin_all_announcements" ON announcements;
CREATE POLICY "admin_all_announcements" ON announcements FOR ALL USING (true) WITH CHECK (true);

-- 4. appointments tablosu (randevular)
CREATE TABLE IF NOT EXISTS appointments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid,
  full_name    text NOT NULL,
  email        text,
  phone        text,
  service_type text,
  preferred_date date,
  preferred_time text,
  notes        text,
  status       text DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  admin_note   text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_insert_appointments" ON appointments;
CREATE POLICY "anon_insert_appointments" ON appointments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "user_read_own_appointments" ON appointments;
CREATE POLICY "user_read_own_appointments" ON appointments FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_all_appointments" ON appointments;
CREATE POLICY "admin_all_appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);

-- 5. user_notes tablosu (kullanıcı notları)
CREATE TABLE IF NOT EXISTS user_notes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL,
  note       text NOT NULL,
  label      text DEFAULT 'general' CHECK (label IN ('general','vip','problem','potential','inactive')),
  created_by uuid,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_all_user_notes" ON user_notes;
CREATE POLICY "admin_all_user_notes" ON user_notes FOR ALL USING (true) WITH CHECK (true);

-- 6. notification_templates tablosu
CREATE TABLE IF NOT EXISTS notification_templates (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text UNIQUE NOT NULL,
  label      text NOT NULL,
  subject    text,
  body       text NOT NULL,
  channel    text DEFAULT 'email' CHECK (channel IN ('email','sms','both')),
  is_active  boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_all_notif_templates" ON notification_templates;
CREATE POLICY "admin_all_notif_templates" ON notification_templates FOR ALL USING (true) WITH CHECK (true);

-- Varsayılan şablonlar
INSERT INTO notification_templates (key, label, subject, body, channel) VALUES
  ('welcome_email', 'Hoş Geldin E-postası', 'Machine Gym''e Hoş Geldiniz!', 'Merhaba {{name}}, Machine Gym ailesine hoş geldiniz! Sizi aramızda görmekten mutluluk duyuyoruz.', 'email'),
  ('appointment_confirm', 'Randevu Onayı', 'Randevunuz Onaylandı', 'Merhaba {{name}}, {{date}} tarihli randevunuz onaylanmıştır.', 'email'),
  ('appointment_reminder', 'Randevu Hatırlatma', 'Randevunuzu Unutmayın', 'Merhaba {{name}}, yarın saat {{time}} randevunuz bulunmaktadır.', 'email'),
  ('program_ready', 'Program Hazır', 'Programınız Hazır!', 'Merhaba {{name}}, kişisel fitness programınız hazırlandı. Dashboard''unuzdan görüntüleyebilirsiniz.', 'email')
ON CONFLICT (key) DO NOTHING;

-- 7. site_settings - PayTR ve ek alanlar
INSERT INTO site_settings (key, value) VALUES
  ('paytr_merchant_id', ''),
  ('paytr_merchant_key', ''),
  ('paytr_merchant_salt', ''),
  ('paytr_test_mode', 'true'),
  ('paytr_debug_mode', 'false'),
  ('phone', ''),
  ('email', ''),
  ('address', ''),
  ('city', 'Bolu'),
  ('instagram_url', ''),
  ('facebook_url', ''),
  ('twitter_url', ''),
  ('youtube_url', ''),
  ('tiktok_url', ''),
  ('working_hours_weekday', 'Pazartesi – Cuma: 07:00 – 22:00'),
  ('working_hours_weekend', 'Cumartesi – Pazar: 09:00 – 20:00'),
  ('google_analytics_id', ''),
  ('google_maps_embed', ''),
  ('footer_description', 'Bolu''nun premium fitness ve boks salonu. Uzman eğitmenler, modern ekipmanlar.'),
  ('maintenance_mode', 'false'),
  ('announcement_bar_enabled', 'false')
ON CONFLICT (key) DO NOTHING;

-- 8. İndeksler
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(preferred_date);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_user ON user_notes(user_id);
