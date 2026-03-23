-- =====================================================
-- LEADS TABLE: Unified form submissions
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL CHECK (type IN ('contact','trial','quote','program','appointment')),
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','in_progress','done','cancelled')),

  -- Common fields
  name        TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  message     TEXT,
  admin_note  TEXT,

  -- Trial training specific
  trial_service   TEXT,
  trial_goal      TEXT,
  trial_level     TEXT,

  -- Quote specific
  quote_package   TEXT,
  quote_budget    TEXT,

  -- Program specific
  prog_goal       TEXT,
  prog_level      TEXT,
  prog_days       INTEGER,
  prog_weight     NUMERIC,
  prog_height     NUMERIC,
  prog_age        INTEGER,
  prog_injuries   TEXT,

  -- Appointment specific
  appt_date       DATE,
  appt_time       TEXT,
  appt_service    TEXT,
  appt_notes      TEXT,

  -- Meta
  source          TEXT DEFAULT 'website',
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (form submission)
DROP POLICY IF EXISTS "leads_public_insert" ON leads;
CREATE POLICY "leads_public_insert" ON leads
  FOR INSERT WITH CHECK (true);

-- Only authenticated users can read (admin)
DROP POLICY IF EXISTS "leads_auth_select" ON leads;
CREATE POLICY "leads_auth_select" ON leads
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can update
DROP POLICY IF EXISTS "leads_auth_update" ON leads;
CREATE POLICY "leads_auth_update" ON leads
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can delete
DROP POLICY IF EXISTS "leads_auth_delete" ON leads;
CREATE POLICY "leads_auth_delete" ON leads
  FOR DELETE USING (auth.role() = 'authenticated');

-- Index for performance
CREATE INDEX IF NOT EXISTS leads_type_idx    ON leads(type);
CREATE INDEX IF NOT EXISTS leads_status_idx  ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_read_idx    ON leads(is_read);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_leads_updated_at();
