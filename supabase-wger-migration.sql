-- =====================================================================
-- Machine Gym — Egzersiz Tablosu Tam Migration (GÜVENLİ / IDEMPOTENT)
-- DROP TABLE YOK — Mevcut veri korunur
-- Supabase Dashboard → SQL Editor → New Query → Run
-- =====================================================================

-- 1. Mevcut exercises tablosunu genişlet
--    (id, name, description, difficulty, created_at zaten var)

ALTER TABLE exercises ADD COLUMN IF NOT EXISTS wger_id              INTEGER;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS category             TEXT    NOT NULL DEFAULT '';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS muscles              TEXT    NOT NULL DEFAULT '';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS equipment            TEXT    NOT NULL DEFAULT '';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS primary_muscle       TEXT    NOT NULL DEFAULT '';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS slug                 TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS instructions         TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS image_url            TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS video_url            TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS language             INTEGER NOT NULL DEFAULT 2;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS is_active            BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS is_verified          BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS source               TEXT    NOT NULL DEFAULT 'manual';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS source_url           TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS source_license       TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS attribution_required BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS home_or_gym          TEXT    NOT NULL DEFAULT 'both';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS goal_tags            TEXT    NOT NULL DEFAULT '';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS contraindications    TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS coaching_notes       TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS default_sets         INTEGER;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS default_reps         TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS rest_seconds         INTEGER;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS updated_at           TIMESTAMPTZ NOT NULL DEFAULT now();

-- 2. wger_id unique index (safe — IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'exercises' AND indexname = 'exercises_wger_id_unique'
  ) THEN
    CREATE UNIQUE INDEX exercises_wger_id_unique ON exercises(wger_id)
      WHERE wger_id IS NOT NULL;
  END IF;
END $$;

-- 3. Test / dummy kayıtları temizle (sadece açıkça test olanlar)
DELETE FROM exercises
WHERE source = 'manual'
  AND LOWER(name) IN ('__test__', 'test', 'dummy', 'deneme', 'test exercise');

-- 4. exercise_images tablosu
CREATE TABLE IF NOT EXISTS exercise_images (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id      UUID        NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  wger_exercise_id INTEGER,
  image_url        TEXT        NOT NULL,
  is_main          BOOLEAN     NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. wger_import_logs tablosu
CREATE TABLE IF NOT EXISTS wger_import_logs (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  triggered_by    TEXT        NOT NULL DEFAULT 'admin',
  status          TEXT        NOT NULL DEFAULT 'running'
                    CHECK (status IN ('running','completed','failed','timeout')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at     TIMESTAMPTZ,
  total_fetched   INTEGER     NOT NULL DEFAULT 0,
  total_inserted  INTEGER     NOT NULL DEFAULT 0,
  total_updated   INTEGER     NOT NULL DEFAULT 0,
  total_skipped   INTEGER     NOT NULL DEFAULT 0,
  total_errors    INTEGER     NOT NULL DEFAULT 0,
  error_messages  JSONB       NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Indexler
CREATE INDEX IF NOT EXISTS exercises_is_active_idx   ON exercises(is_active);
CREATE INDEX IF NOT EXISTS exercises_category_idx    ON exercises(category);
CREATE INDEX IF NOT EXISTS exercises_source_idx      ON exercises(source);
CREATE INDEX IF NOT EXISTS ex_images_ex_id_idx       ON exercise_images(exercise_id);

-- 7. RLS
ALTER TABLE exercise_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE wger_import_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exercise_images' AND policyname='ex_images_public_read') THEN
    CREATE POLICY "ex_images_public_read" ON exercise_images FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exercise_images' AND policyname='ex_images_auth_write') THEN
    CREATE POLICY "ex_images_auth_write" ON exercise_images FOR ALL
      USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='wger_import_logs' AND policyname='import_logs_auth') THEN
    CREATE POLICY "import_logs_auth" ON wger_import_logs FOR ALL
      USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- 8. Stuck running jobs'ları timeout olarak işaretle
UPDATE wger_import_logs
SET status = 'timeout', finished_at = now()
WHERE status = 'running'
  AND started_at < now() - INTERVAL '30 minutes';

SELECT 'Migration tamamlandı ✓' AS result;
