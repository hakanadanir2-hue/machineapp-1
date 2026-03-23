-- ============================================================
-- Machine Gym — Kişisel Program Sistemi Migration
-- Güvenli / idempotent — DROP TABLE yok
-- Supabase SQL Editor'de çalıştır
-- ============================================================

-- 1. user_profiles: kullanıcı fiziksel verileri
CREATE TABLE IF NOT EXISTS user_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         TEXT,
  age               INTEGER,
  gender            TEXT CHECK (gender IN ('erkek','kadin','belirtmek_istemiyorum')),
  height_cm         INTEGER,
  weight_kg         NUMERIC(5,1),
  goal              TEXT CHECK (goal IN ('kilo_ver','kas_kazan','kondisyon','saglikli_kal','rehabilitasyon','genel_fitness')),
  fitness_level     TEXT CHECK (fitness_level IN ('baslangic','orta','ileri')),
  days_per_week     INTEGER DEFAULT 3 CHECK (days_per_week BETWEEN 1 AND 7),
  session_duration  INTEGER DEFAULT 60,
  available_equipment TEXT,
  injuries          TEXT,
  medical_notes     TEXT,
  bmi               NUMERIC(4,1),
  bmi_category      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- 2. programs: GPT-4o ile üretilen programlar
CREATE TABLE IF NOT EXISTS programs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  profile_id        UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  summary           TEXT,
  duration_weeks    INTEGER DEFAULT 4,
  days_per_week     INTEGER DEFAULT 3,
  goal              TEXT,
  fitness_level     TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected','active','completed')),
  admin_notes       TEXT,
  rejection_reason  TEXT,
  approved_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at       TIMESTAMPTZ,
  rejected_at       TIMESTAMPTZ,
  ai_model          TEXT DEFAULT 'gpt-4o',
  generation_hash   TEXT UNIQUE, -- uniqueness guarantee
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_programs_user_id  ON programs(user_id);
CREATE INDEX IF NOT EXISTS idx_programs_status   ON programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_profile  ON programs(profile_id);

-- 3. program_weeks: hafta bazlı yapı
CREATE TABLE IF NOT EXISTS program_weeks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_program_weeks_program_id ON program_weeks(program_id);

-- 4. program_days: günlük antrenman planı
CREATE TABLE IF NOT EXISTS program_days (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id   UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  week_id      UUID REFERENCES program_weeks(id) ON DELETE CASCADE,
  week_number  INTEGER NOT NULL DEFAULT 1,
  day_number   INTEGER NOT NULL,
  day_name     TEXT,
  focus        TEXT,
  warmup_notes TEXT,
  cooldown_notes TEXT,
  total_duration_min INTEGER,
  is_rest_day  BOOLEAN DEFAULT false,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_program_days_program_id ON program_days(program_id);

-- 5. program_exercises: gün içindeki egzersizler
CREATE TABLE IF NOT EXISTS program_exercises (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_day_id   UUID NOT NULL REFERENCES program_days(id) ON DELETE CASCADE,
  exercise_id      UUID REFERENCES exercises(id) ON DELETE SET NULL,
  exercise_name    TEXT NOT NULL,
  sets             INTEGER,
  reps             TEXT,
  rest_seconds     INTEGER DEFAULT 60,
  duration_seconds INTEGER,
  tempo            TEXT,
  modification     TEXT,
  notes            TEXT,
  order_index      INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_program_exercises_day_id ON program_exercises(program_day_id);

-- 6. nutrition_plans: programa bağlı beslenme planı
CREATE TABLE IF NOT EXISTS nutrition_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id      UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  daily_calories  INTEGER,
  protein_g       INTEGER,
  carb_g          INTEGER,
  fat_g           INTEGER,
  water_ml        INTEGER DEFAULT 2500,
  meal_count      INTEGER DEFAULT 3,
  meals           JSONB,
  supplement_notes TEXT,
  general_notes   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nutrition_plans_program_id ON nutrition_plans(program_id);

-- 7. RLS
ALTER TABLE user_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_weeks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_days     ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plans  ENABLE ROW LEVEL SECURITY;

-- Service role: tam erişim
DROP POLICY IF EXISTS "service_user_profiles"    ON user_profiles;
DROP POLICY IF EXISTS "service_programs"          ON programs;
DROP POLICY IF EXISTS "service_program_weeks"     ON program_weeks;
DROP POLICY IF EXISTS "service_program_days"      ON program_days;
DROP POLICY IF EXISTS "service_program_exercises" ON program_exercises;
DROP POLICY IF EXISTS "service_nutrition_plans"   ON nutrition_plans;

CREATE POLICY "service_user_profiles"    ON user_profiles    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_programs"          ON programs          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_program_weeks"     ON program_weeks     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_program_days"      ON program_days      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_program_exercises" ON program_exercises FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_nutrition_plans"   ON nutrition_plans   FOR ALL USING (true) WITH CHECK (true);

-- 8. Doğrulama
SELECT 'user_profiles'    AS tablo, COUNT(*) FROM user_profiles
UNION ALL
SELECT 'programs',          COUNT(*) FROM programs
UNION ALL
SELECT 'program_weeks',     COUNT(*) FROM program_weeks
UNION ALL
SELECT 'program_days',      COUNT(*) FROM program_days
UNION ALL
SELECT 'program_exercises',  COUNT(*) FROM program_exercises
UNION ALL
SELECT 'nutrition_plans',   COUNT(*) FROM nutrition_plans;
