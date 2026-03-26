-- =========================================================
-- Machine Gym — Egzersiz Display Alanları Migration
-- Güvenli / idempotent — mevcut veri korunur
-- Supabase SQL Editor → New Query → Run
-- =========================================================

-- 1. display_name: yönetici override ismi (boşsa name kullanılır)
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS display_name         TEXT;

-- 2. display_muscle_group: yönetici override kas grubu (boşsa muscles/category kullanılır)
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS display_muscle_group TEXT;

-- 3. Mevcut test/çöp kayıtları soft-delete (is_active = false)
UPDATE exercises
SET is_active = false
WHERE source = 'manual'
  AND LOWER(name) SIMILAR TO '%(test|dummy|deneme|delete me|__test__)%';

-- 4. Index
CREATE INDEX IF NOT EXISTS exercises_display_name_idx ON exercises(display_name)
  WHERE display_name IS NOT NULL;

SELECT 'Display kolonları eklendi ✓' AS result;
