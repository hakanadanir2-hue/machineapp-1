-- Hero media tablosu (fotoğraflar + YouTube)
CREATE TABLE IF NOT EXISTS hero_media (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text NOT NULL CHECK (type IN ('photo', 'youtube')),
  url         text NOT NULL,
  label       text,
  order_index integer DEFAULT 0,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE hero_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_hero_media" ON hero_media;
CREATE POLICY "public_read_hero_media" ON hero_media FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "admin_all_hero_media" ON hero_media;
CREATE POLICY "admin_all_hero_media" ON hero_media FOR ALL USING (true) WITH CHECK (true);

-- Supabase Storage bucket (SQL ile oluşturulamıyor, admin panelden veya dashboard'dan eklenecek)
-- Bucket adı: hero-media (public)

-- site_settings'e hero_youtube_url ekle (varsa güncelle)
INSERT INTO site_settings (key, value) VALUES ('hero_slideshow_interval', '3000')
ON CONFLICT (key) DO NOTHING;
