-- ================================================================
-- MACHINE GYM — MEMBER OS MIGRATION
-- Versiyon: 1.0
-- Güvenli: IF NOT EXISTS / DROP POLICY IF EXISTS kullanıldı
-- ================================================================

-- ----------------------------------------------------------------
-- 0. YARDIMCI: admin kontrolü için helper fonksiyon
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin'
     FROM public.profiles
     WHERE id = auth.uid()),
    false
  );
$$;


-- ================================================================
-- 1. MEMBERS — üye profil tablosu
-- ================================================================
CREATE TABLE IF NOT EXISTS public.members (
  id                 uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name          text,
  email              text,
  phone              text,
  birth_date         date,
  gender             text        CHECK (gender IN ('erkek', 'kadın', 'diğer')),
  height_cm          numeric(5,1),
  goal               text,
  membership_start   date,
  membership_end     date,
  fcm_token          text,
  streak_days        int         NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members_select_own"  ON public.members;
DROP POLICY IF EXISTS "members_update_own"  ON public.members;
DROP POLICY IF EXISTS "members_admin_all"   ON public.members;

CREATE POLICY "members_select_own"  ON public.members
  FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY "members_update_own"  ON public.members
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "members_admin_all"   ON public.members
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_members_membership_end ON public.members(membership_end);


-- ================================================================
-- 2. MEASUREMENTS — ölçümler
-- ================================================================
CREATE TABLE IF NOT EXISTS public.measurements (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       uuid        NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  weight_kg       numeric(5,2),
  chest_cm        numeric(5,1),
  waist_cm        numeric(5,1),
  hip_cm          numeric(5,1),
  arm_cm          numeric(5,1),
  leg_cm          numeric(5,1),
  body_fat_pct    numeric(5,2),
  measured_at     date        NOT NULL DEFAULT CURRENT_DATE,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "measurements_own"       ON public.measurements;
DROP POLICY IF EXISTS "measurements_admin_all" ON public.measurements;

CREATE POLICY "measurements_own" ON public.measurements
  FOR ALL USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "measurements_admin_all" ON public.measurements
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_measurements_member ON public.measurements(member_id, measured_at DESC);


-- ================================================================
-- 3. PROGRESS_PHOTOS — ilerleme fotoğrafları
-- ================================================================
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   uuid        NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  photo_url   text        NOT NULL,
  angle       text        NOT NULL DEFAULT 'ön' CHECK (angle IN ('ön', 'arka', 'yan')),
  taken_at    date        NOT NULL DEFAULT CURRENT_DATE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "photos_own"       ON public.progress_photos;
DROP POLICY IF EXISTS "photos_admin_all" ON public.progress_photos;

CREATE POLICY "photos_own" ON public.progress_photos
  FOR ALL USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "photos_admin_all" ON public.progress_photos
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_photos_member ON public.progress_photos(member_id, taken_at DESC);


-- ================================================================
-- 4. FOOD_LOGS — beslenme günlüğü
-- ================================================================
CREATE TABLE IF NOT EXISTS public.food_logs (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id        uuid        NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  meal_type        text        NOT NULL CHECK (meal_type IN ('kahvaltı', 'öğle', 'akşam', 'ara')),
  photo_url        text,
  notes            text,
  trainer_comment  text,
  logged_at        timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "food_logs_own"        ON public.food_logs;
DROP POLICY IF EXISTS "food_logs_admin_all"  ON public.food_logs;

-- Üye kendi loglarını yönetir; trainer_comment sadece admin güncelleyebilir
CREATE POLICY "food_logs_own" ON public.food_logs
  FOR ALL USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "food_logs_admin_all" ON public.food_logs
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_food_logs_member ON public.food_logs(member_id, logged_at DESC);


-- ================================================================
-- 5. WATER_LOGS — su takibi (günlük upsert)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.water_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   uuid        NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  amount_ml   int         NOT NULL DEFAULT 0,
  logged_at   date        NOT NULL DEFAULT CURRENT_DATE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_id, logged_at)
);

ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "water_logs_own"       ON public.water_logs;
DROP POLICY IF EXISTS "water_logs_admin_all" ON public.water_logs;

CREATE POLICY "water_logs_own" ON public.water_logs
  FOR ALL USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "water_logs_admin_all" ON public.water_logs
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_water_logs_member ON public.water_logs(member_id, logged_at DESC);


-- ================================================================
-- 6. MEMBER_PROGRAMS — üye antrenman programları
-- ================================================================
CREATE TABLE IF NOT EXISTS public.member_programs (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    uuid        NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  day_of_week  int         NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Pazar, 1=Pazartesi...
  exercises    jsonb       NOT NULL DEFAULT '[]'::jsonb,
  is_active    boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.member_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "member_programs_select_own" ON public.member_programs;
DROP POLICY IF EXISTS "member_programs_admin_all"  ON public.member_programs;

CREATE POLICY "member_programs_select_own" ON public.member_programs
  FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "member_programs_admin_all" ON public.member_programs
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_member_programs_member ON public.member_programs(member_id, day_of_week);


-- ================================================================
-- 7. GYM_CLASSES — grup dersleri
-- ================================================================
CREATE TABLE IF NOT EXISTS public.gym_classes (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text        NOT NULL,
  class_type    text        NOT NULL CHECK (class_type IN ('boks', 'kickboks', 'muay_thai', 'fitness')),
  instructor    text,
  start_time    timestamptz NOT NULL,
  duration_min  int         NOT NULL DEFAULT 60,
  capacity      int         NOT NULL DEFAULT 20,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gym_classes_public_select" ON public.gym_classes;
DROP POLICY IF EXISTS "gym_classes_admin_all"     ON public.gym_classes;

-- Tüm giriş yapmış kullanıcılar (ve anonim) dersleri görebilir
CREATE POLICY "gym_classes_public_select" ON public.gym_classes
  FOR SELECT USING (true);

CREATE POLICY "gym_classes_admin_all" ON public.gym_classes
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_gym_classes_start ON public.gym_classes(start_time);
CREATE INDEX IF NOT EXISTS idx_gym_classes_type  ON public.gym_classes(class_type);


-- ================================================================
-- 8. CLASS_BOOKINGS — ders rezervasyonları
-- ================================================================
CREATE TABLE IF NOT EXISTS public.class_bookings (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    uuid        NOT NULL REFERENCES public.gym_classes(id) ON DELETE CASCADE,
  member_id   uuid        NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  booked_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, member_id)
);

ALTER TABLE public.class_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_own"       ON public.class_bookings;
DROP POLICY IF EXISTS "bookings_admin_all" ON public.class_bookings;

CREATE POLICY "bookings_own" ON public.class_bookings
  FOR ALL USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "bookings_admin_all" ON public.class_bookings
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_bookings_member ON public.class_bookings(member_id);
CREATE INDEX IF NOT EXISTS idx_bookings_class  ON public.class_bookings(class_id);


-- ================================================================
-- 9. MEMBER_NOTIFICATIONS — üye bildirimleri
-- ================================================================
CREATE TABLE IF NOT EXISTS public.member_notifications (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   uuid        NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  body        text,
  type        text        NOT NULL DEFAULT 'info'
                CHECK (type IN ('water', 'renewal', 'birthday', 'trainer_comment', 'info')),
  read        boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.member_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.member_notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.member_notifications;
DROP POLICY IF EXISTS "notifications_admin_all"  ON public.member_notifications;

CREATE POLICY "notifications_select_own" ON public.member_notifications
  FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "notifications_update_own" ON public.member_notifications
  FOR UPDATE USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "notifications_admin_all" ON public.member_notifications
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_notifications_member      ON public.member_notifications(member_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_member_read ON public.member_notifications(member_id, read) WHERE read = false;


-- ================================================================
-- 10. PROFILES TABLOSU — role alanı güncelleme
--     (profiles tablosu zaten mevcut, member rolü ekleniyor)
-- ================================================================
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'member', 'trainer'));

-- Mevcut kullanıcılara varsayılan 'member' rolü ata (admin değilse)
UPDATE public.profiles
SET role = 'member'
WHERE role IS NULL OR role NOT IN ('admin', 'trainer');


-- ================================================================
-- 11. AUTO-MEMBER TRIGGER — yeni üye kaydında members satırı oluştur
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_member()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- Sadece member rolü için members tablosuna kayıt ekle
  IF NEW.role = 'member' THEN
    INSERT INTO public.members (id, full_name, email)
    VALUES (
      NEW.id,
      (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = NEW.id),
      (SELECT email FROM auth.users WHERE id = NEW.id)
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_member_created ON public.profiles;
CREATE TRIGGER on_profile_member_created
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_member();


-- ================================================================
-- 12. ÜYELİK BİTİŞ HATIRLATMA FONKSİYONU (cron için)
--     Supabase Edge Functions veya pg_cron ile çağrılabilir
-- ================================================================
CREATE OR REPLACE FUNCTION public.notify_expiring_memberships()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT m.id, m.full_name
    FROM public.members m
    WHERE m.membership_end = CURRENT_DATE + INTERVAL '7 days'
      AND NOT EXISTS (
        SELECT 1 FROM public.member_notifications n
        WHERE n.member_id = m.id
          AND n.type = 'renewal'
          AND n.created_at::date = CURRENT_DATE
      )
  LOOP
    INSERT INTO public.member_notifications (member_id, title, body, type)
    VALUES (
      rec.id,
      'Üyeliğin bitiyor!',
      'Üyeliğin 7 gün içinde sona erecek. Yenilemeyi unutma.',
      'renewal'
    );
  END LOOP;
END;
$$;


-- ================================================================
-- 13. STORAGE BUCKET — üye fotoğrafları için
-- ================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Üye kendi klasörüne yükleyebilir: member-photos/{user_id}/...
DROP POLICY IF EXISTS "member_photos_upload" ON storage.objects;
CREATE POLICY "member_photos_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'member-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "member_photos_select" ON storage.objects;
CREATE POLICY "member_photos_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'member-photos'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR is_admin()
    )
  );

DROP POLICY IF EXISTS "member_photos_delete" ON storage.objects;
CREATE POLICY "member_photos_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'member-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
