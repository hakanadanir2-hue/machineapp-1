-- =====================================================================
-- Machine Gym — wger_uuid + variations kolonu ekleme (SAFE / IDEMPOTENT)
-- Mevcut veri korunur, DROP kullanılmaz
-- Supabase SQL Editor → New Query → Run
-- =====================================================================

-- 1. wger_uuid kolonu ekle (wger'ın global UUID'si)
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS wger_uuid TEXT;

-- 2. variations kolonu ekle (wger variation group id — integer)
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS variations INTEGER;

-- 3. wger_uuid için unique index
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'exercises' AND indexname = 'exercises_wger_uuid_unique'
  ) THEN
    CREATE UNIQUE INDEX exercises_wger_uuid_unique ON exercises(wger_uuid)
      WHERE wger_uuid IS NOT NULL;
  END IF;
END $$;

-- 4. wger_id unique index (varsa atla)
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

SELECT 'wger_uuid migration tamamlandı ✓' AS result;
