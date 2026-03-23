-- ============================================================
-- Machine Gym — Exercises + Program Templates Migration
-- Supabase Dashboard → SQL Editor → New Query → Çalıştır
-- ============================================================

-- 1. EXERCISES TABLE
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  primary_muscle TEXT NOT NULL DEFAULT '',
  secondary_muscles TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'strength',
  equipment TEXT NOT NULL DEFAULT 'barbell',
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner','intermediate','advanced')),
  description TEXT DEFAULT '',
  instructions TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  source TEXT DEFAULT 'manual',
  source_url TEXT DEFAULT '',
  source_license TEXT DEFAULT '',
  attribution_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  home_or_gym TEXT DEFAULT 'gym' CHECK (home_or_gym IN ('home','gym','both')),
  goal_tags TEXT[] DEFAULT '{}',
  contraindications TEXT DEFAULT '',
  coaching_notes TEXT DEFAULT '',
  default_sets INTEGER DEFAULT 3,
  default_reps TEXT DEFAULT '10-12',
  rest_seconds INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PROGRAM TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS program_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  goal TEXT NOT NULL DEFAULT 'general' CHECK (goal IN ('fat_loss','muscle_gain','strength','endurance','general')),
  level TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner','intermediate','advanced')),
  days_per_week INTEGER NOT NULL DEFAULT 3 CHECK (days_per_week BETWEEN 1 AND 7),
  duration_weeks INTEGER DEFAULT 8,
  equipment_needed TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PROGRAM TEMPLATE EXERCISES (junction)
CREATE TABLE IF NOT EXISTS program_template_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES program_templates(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  sets INTEGER DEFAULT 3,
  reps TEXT DEFAULT '10-12',
  rest_seconds INTEGER DEFAULT 60,
  notes TEXT DEFAULT ''
);

-- 4. ORDERS TABLE (if not exists)
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

-- 5. ADD ROLE COLUMN TO PROFILES (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='profiles' AND column_name='role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('super_admin','admin','editor','support','user'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='profiles' AND column_name='is_active'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='profiles' AND column_name='admin_note'
  ) THEN
    ALTER TABLE profiles ADD COLUMN admin_note TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='profiles' AND column_name='membership_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN membership_type TEXT DEFAULT 'free';
  END IF;
END $$;

-- 6. RLS POLICIES
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- exercises: public read, auth write
CREATE POLICY IF NOT EXISTS "exercises_public_read" ON exercises FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "exercises_auth_write" ON exercises FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- program_templates: public read, auth write
CREATE POLICY IF NOT EXISTS "program_templates_public_read" ON program_templates FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "program_templates_auth_write" ON program_templates FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- program_template_exercises: auth only
CREATE POLICY IF NOT EXISTS "pte_auth" ON program_template_exercises FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- orders: public insert, auth select/update
CREATE POLICY IF NOT EXISTS "orders_public_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "orders_auth_select" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "orders_auth_update" ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- 7. STORAGE POLICIES (gallery bucket)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='gallery_public_read') THEN
    CREATE POLICY "gallery_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='gallery_auth_insert') THEN
    CREATE POLICY "gallery_auth_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='gallery_auth_delete') THEN
    CREATE POLICY "gallery_auth_delete" ON storage.objects FOR DELETE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- 8. SAMPLE EXERCISES
INSERT INTO exercises (exercise_name, slug, primary_muscle, secondary_muscles, category, equipment, difficulty, description, instructions, default_sets, default_reps, rest_seconds, is_active, is_verified, home_or_gym, goal_tags, source) VALUES
('Barbell Bench Press', 'barbell-bench-press', 'Pectoralis Major', ARRAY['Triceps','Anterior Deltoid'], 'strength', 'barbell', 'beginner', 'Göğüs geliştirme için temel bileşik egzersiz.', '1. Düz banka üzerine sırt üstü yat. 2. Omuz genişliğinden biraz daha geniş tutuş. 3. Çubuğu göğse indirerek kontrollü kaldır.', 4, '8-10', 90, true, true, 'gym', ARRAY['muscle_gain','strength'], 'manual'),
('Squat', 'squat', 'Quadriceps', ARRAY['Hamstrings','Glutes','Core'], 'strength', 'barbell', 'intermediate', 'Bacak ve kalça kaslarını geliştiren temel egzersiz.', '1. Ayaklar omuz genişliğinde. 2. Sırtı dik tut. 3. Diz 90° açı gelinceye kadar in. 4. Topuklardan iteek kalk.', 4, '6-8', 120, true, true, 'gym', ARRAY['muscle_gain','strength'], 'manual'),
('Deadlift', 'deadlift', 'Posterior Chain', ARRAY['Hamstrings','Glutes','Traps','Core'], 'strength', 'barbell', 'intermediate', 'Tüm vücut posterior zincirini çalıştıran egzersiz.', '1. Ayaklar kalça genişliğinde. 2. Sırtı düz tut. 3. Yere paralel kollarla çubuğu kavra. 4. Kalça ve dizleri aynı anda it.', 3, '5', 180, true, true, 'gym', ARRAY['strength'], 'manual'),
('Pull-up', 'pull-up', 'Latissimus Dorsi', ARRAY['Biceps','Rear Deltoid'], 'strength', 'bodyweight', 'intermediate', 'Sırt genişliğini artıran üst vücut egzersizi.', '1. Barı omuz genişliğinde kavra. 2. Kürek kemiklerini çekerek kendini yukarı çek. 3. Çene barın üzerine gelecek şekilde kalk.', 3, '6-10', 90, true, true, 'both', ARRAY['muscle_gain'], 'manual'),
('Jab-Cross', 'jab-cross', 'Shoulders', ARRAY['Chest','Core','Triceps'], 'cardio', 'bodyweight', 'beginner', 'Boks kondisyon ve koordinasyon egzersizi.', '1. Boks duruşunda dur. 2. Jab: ön elle hızlı düz vuruş. 3. Cross: arka elle dönerek güçlü vuruş. 4. Kombinasyonu tekrarla.', 4, '30 sn', 30, true, true, 'both', ARRAY['fat_loss','endurance'], 'manual'),
('Plank', 'plank', 'Core', ARRAY['Shoulders','Glutes'], 'strength', 'bodyweight', 'beginner', 'Karın ve gövde stabilizasyonu egzersizi.', '1. Dirsek planku pozisyonu. 2. Vücudu düz tut. 3. Süre boyunca nefes al.', 3, '45 sn', 60, true, true, 'both', ARRAY['fat_loss','general'], 'manual'),
('Dumbbell Curl', 'dumbbell-curl', 'Biceps Brachii', ARRAY['Brachialis'], 'strength', 'dumbbell', 'beginner', 'Biseps geliştirme egzersizi.', '1. Dumbbelleri omuz genişliğinde tut. 2. Dirsekleri sabit tut. 3. Kontrollü kıvır ve indir.', 3, '12-15', 60, true, true, 'gym', ARRAY['muscle_gain'], 'manual'),
('Box Jump', 'box-jump', 'Quadriceps', ARRAY['Glutes','Calves','Core'], 'cardio', 'bodyweight', 'intermediate', 'Patlayıcı güç ve kondisyon egzersizi.', '1. Kutu önünde ayakta dur. 2. Squat pozisyonuna inerek patlayıcı biçimde zıpla. 3. Yumuşak in.', 3, '8', 90, true, true, 'gym', ARRAY['fat_loss','strength','endurance'], 'manual')
ON CONFLICT (slug) DO NOTHING;

-- 9. SAMPLE PROGRAM TEMPLATES
INSERT INTO program_templates (name, slug, goal, level, days_per_week, duration_weeks, equipment_needed, description, is_active) VALUES
('Yağ Yakımı Başlangıç', 'yag-yakimi-baslangic', 'fat_loss', 'beginner', 3, 8, ARRAY['bodyweight'], '3 günlük vücut ağırlığı ağırlıklı yağ yakımı programı.', true),
('Kas Kazanım Orta', 'kas-kazanim-orta', 'muscle_gain', 'intermediate', 4, 12, ARRAY['barbell','dumbbell'], '4 günlük split kas kazanım programı.', true),
('Boks Kondisyon', 'boks-kondisyon', 'endurance', 'beginner', 3, 6, ARRAY['bodyweight'], 'Boks odaklı kardio ve kondisyon programı.', true)
ON CONFLICT (slug) DO NOTHING;

SELECT 'Migration tamamlandı — ' || now()::text as result;
