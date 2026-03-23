-- =========================================================
-- Machine Gym — AI Görsel Üretim Migration
-- Güvenli / idempotent — DROP TABLE yok
-- Supabase SQL Editor → New Query → Run
-- =========================================================

-- 1. exercises tablosuna AI görsel alanları ekle
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS custom_image_url   TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS image_source       TEXT NOT NULL DEFAULT 'wger';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS image_status       TEXT NOT NULL DEFAULT 'missing';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS generation_prompt  TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS generation_notes   TEXT;

-- 2. Mevcut kayıtları güncelle: wger görseli varsa 'wger', yoksa 'missing'
UPDATE exercises
SET image_source = CASE WHEN image_url IS NOT NULL THEN 'wger' ELSE 'none' END,
    image_status = CASE WHEN image_url IS NOT NULL THEN 'wger' ELSE 'missing' END
WHERE image_source = 'wger';

-- 3. exercise_image_jobs tablosu
CREATE TABLE IF NOT EXISTS exercise_image_jobs (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id   UUID        NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  status        TEXT        NOT NULL DEFAULT 'queued'
                  CHECK (status IN ('queued','generating','generated','approved','rejected','failed')),
  prompt        TEXT,
  result_url    TEXT,
  attempt_count INTEGER     NOT NULL DEFAULT 0,
  last_error    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Indexler
CREATE INDEX IF NOT EXISTS ex_image_jobs_exercise_id_idx ON exercise_image_jobs(exercise_id);
CREATE INDEX IF NOT EXISTS ex_image_jobs_status_idx      ON exercise_image_jobs(status);
CREATE INDEX IF NOT EXISTS exercises_image_status_idx    ON exercises(image_status);

-- 5. RLS
ALTER TABLE exercise_image_jobs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exercise_image_jobs' AND policyname='image_jobs_auth') THEN
    CREATE POLICY "image_jobs_auth" ON exercise_image_jobs FOR ALL
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- 6. Supabase Storage bucket (manuel olarak da oluşturulabilir)
-- Dashboard → Storage → New Bucket → exercise-images-ai (public: true)

SELECT 'AI görsel migration tamamlandı ✓' AS result;
