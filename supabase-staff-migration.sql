-- Staff / Trainers table migration
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS staff (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  cert text,
  exp_years integer,
  image_url text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Public can read active staff
CREATE POLICY IF NOT EXISTS "Public read staff"
  ON staff FOR SELECT
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY IF NOT EXISTS "Admin write staff"
  ON staff FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
