-- membership_orders tablosu (yoksa oluştur, varsa sütunları ekle)

CREATE TABLE IF NOT EXISTS membership_orders (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id    text UNIQUE NOT NULL,
  plan_adi    text,
  kategori    text DEFAULT 'fitness',
  amount      numeric,
  full_name   text,
  email       text,
  phone       text,
  status      text DEFAULT 'pending',
  paid_at     timestamptz,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Eksik sütunları güvenli ekle
ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS paid_at    timestamptz;
ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS kategori   text DEFAULT 'fitness';

-- RLS: sadece service role yazabilsin, admin okuyabilsin
ALTER TABLE membership_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all" ON membership_orders;
CREATE POLICY "admin_all" ON membership_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
