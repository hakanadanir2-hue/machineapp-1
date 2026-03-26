-- ============================================================
-- AI Images V2 Migration
-- Safe / idempotent — no DROP TABLE, no data loss
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. exercises: add approved_image_url (permanent approved slot)
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS approved_image_url   TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS approved_version_id  UUID;   -- FK to image_versions after table exists
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS draft_image_url      TEXT;   -- pending draft
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS prompt_confidence    INTEGER DEFAULT 0;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS validation_score     INTEGER;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS validation_notes     TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS generation_prompt    TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS image_instruction_override TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS preferred_view       TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS target_angle         TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS unilateral_or_bilateral TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS equipment_override   TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS approved_at          TIMESTAMPTZ;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS rejected_at          TIMESTAMPTZ;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS updated_at           TIMESTAMPTZ DEFAULT now();

-- 2. image_versions: full audit trail of every generation attempt
CREATE TABLE IF NOT EXISTS image_versions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id        UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  storage_path       TEXT,
  image_url          TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','approved','rejected','auto_rejected','failed')),
  prompt             TEXT,
  prompt_confidence  INTEGER DEFAULT 0,
  validation_score   INTEGER,
  validation_notes   TEXT,
  rejection_reason   TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_image_versions_exercise_id ON image_versions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_image_versions_status      ON image_versions(status);

-- 3. Migrate existing draft data into image_versions (best-effort, skip if already done)
INSERT INTO image_versions (exercise_id, image_url, status, prompt, prompt_confidence)
SELECT
  id,
  draft_image_url,
  CASE
    WHEN image_status = 'approved'          THEN 'approved'
    WHEN image_status = 'generated_pending' THEN 'pending'
    WHEN image_status = 'rejected'          THEN 'rejected'
    ELSE 'pending'
  END,
  generation_prompt,
  COALESCE(prompt_confidence, 0)
FROM exercises
WHERE draft_image_url IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM image_versions iv
    WHERE iv.exercise_id = exercises.id
      AND iv.image_url   = exercises.draft_image_url
  );

-- 4. Migrate custom_image_url → approved_image_url for approved exercises
UPDATE exercises
SET approved_image_url = custom_image_url
WHERE image_status = 'approved'
  AND custom_image_url IS NOT NULL
  AND approved_image_url IS NULL;

-- 5. Backfill approved_version_id FK (add FK constraint if image_versions rows match)
UPDATE exercises e
SET approved_version_id = iv.id
FROM image_versions iv
WHERE iv.exercise_id = e.id
  AND iv.status      = 'approved'
  AND e.approved_version_id IS NULL
LIMIT 1;  -- Postgres doesn't support LIMIT in UPDATE with FROM; handled per-row via subquery

-- Re-do with subquery approach
UPDATE exercises
SET approved_version_id = (
  SELECT id FROM image_versions
  WHERE exercise_id = exercises.id
    AND status = 'approved'
  ORDER BY created_at DESC
  LIMIT 1
)
WHERE image_status = 'approved'
  AND approved_version_id IS NULL;

-- 6. RLS for image_versions (same pattern as exercises)
ALTER TABLE image_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_all_image_versions" ON image_versions;
CREATE POLICY "service_all_image_versions" ON image_versions
  FOR ALL USING (true) WITH CHECK (true);

-- 7. Final check
SELECT
  COUNT(*)                                                           AS total_exercises,
  COUNT(*) FILTER (WHERE image_status = 'approved')                 AS approved,
  COUNT(*) FILTER (WHERE image_status = 'generated_pending')        AS pending,
  COUNT(*) FILTER (WHERE image_status = 'wger_image')               AS wger_image,
  COUNT(*) FILTER (WHERE image_status IS NULL OR image_status = 'missing') AS missing,
  COUNT(*) FILTER (WHERE approved_image_url IS NOT NULL)            AS has_approved_url
FROM exercises;

SELECT COUNT(*) AS image_versions_total FROM image_versions;
