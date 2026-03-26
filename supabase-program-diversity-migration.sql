-- ============================================================
-- Machine Gym — Program Diversity & Feedback Migration
-- Guvenli / idempotent
-- Supabase SQL Editor de calistir
-- ============================================================

-- 1. user_program_history: son programlarda kullanilan egzersizleri sakla
CREATE TABLE IF NOT EXISTS user_program_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id        UUID REFERENCES programs(id) ON DELETE CASCADE,
  goal              TEXT,
  days_per_week     INTEGER,
  split_type        TEXT,
  exercise_names    JSONB,  -- ["Bench Press", "Squat", ...]
  exercise_patterns JSONB,  -- ["chest_press", "squat_pattern", ...]
  program_hash      TEXT,   -- sha256 of exercise list for quick dedup
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_program_history_user_id   ON user_program_history(user_id);
CREATE INDEX IF NOT EXISTS idx_program_history_created   ON user_program_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_program_history_goal      ON user_program_history(user_id, goal);

-- 2. exercise_feedback: kullanicinin egzersizle ilgili geri bildirimleri
CREATE TABLE IF NOT EXISTS exercise_feedback (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id       UUID REFERENCES programs(id) ON DELETE CASCADE,
  exercise_name    TEXT NOT NULL,
  feedback_type    TEXT NOT NULL CHECK (feedback_type IN (
    'pain',       -- Agri yapti
    'too_hard',   -- Cok zor
    'too_easy',   -- Cok kolay
    'dislike',    -- Sevmedim
    'positive'    -- Cok iyi
  )),
  pain_level       INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  note             TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exercise_feedback_user     ON exercise_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_feedback_program  ON exercise_feedback(program_id);
CREATE INDEX IF NOT EXISTS idx_exercise_feedback_name     ON exercise_feedback(exercise_name);

-- 3. exercises tablosuna hareket tag kolonlari ekle (var olabilir, IF NOT EXISTS kullan)
DO 7850
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='movement_pattern') THEN
    ALTER TABLE exercises ADD COLUMN movement_pattern TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='overhead_flag') THEN
    ALTER TABLE exercises ADD COLUMN overhead_flag BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='spinal_flexion_flag') THEN
    ALTER TABLE exercises ADD COLUMN spinal_flexion_flag BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='spinal_shear_flag') THEN
    ALTER TABLE exercises ADD COLUMN spinal_shear_flag BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='deep_knee_flexion_flag') THEN
    ALTER TABLE exercises ADD COLUMN deep_knee_flexion_flag BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='impact_flag') THEN
    ALTER TABLE exercises ADD COLUMN impact_flag BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='wrist_extension_flag') THEN
    ALTER TABLE exercises ADD COLUMN wrist_extension_flag BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='unilateral_flag') THEN
    ALTER TABLE exercises ADD COLUMN unilateral_flag BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='exercise_tags') THEN
    ALTER TABLE exercises ADD COLUMN exercise_tags TEXT[] DEFAULT '{}';
  END IF;
END 7850;

-- 4. RLS
ALTER TABLE user_program_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_feedback     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_program_history" ON user_program_history;
DROP POLICY IF EXISTS "service_exercise_feedback" ON exercise_feedback;
CREATE POLICY "service_program_history"  ON user_program_history  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_exercise_feedback" ON exercise_feedback      FOR ALL USING (true) WITH CHECK (true);

-- 5. Dogrulama
SELECT 'user_program_history' AS tablo, COUNT(*) FROM user_program_history
UNION ALL
SELECT 'exercise_feedback',    COUNT(*) FROM exercise_feedback;
