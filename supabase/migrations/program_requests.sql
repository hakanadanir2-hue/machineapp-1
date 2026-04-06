-- program_requests tablosu
-- Supabase SQL Editor'da çalıştırın

CREATE TABLE IF NOT EXISTS public.program_requests (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name        text NOT NULL,
  email            text NOT NULL,
  phone            text,
  -- Kişisel bilgiler
  age              int,
  gender           text,
  height_cm        numeric,
  weight_kg        numeric,
  goal             text,
  fitness_level    text,
  days_per_week    int,
  session_duration int,
  -- Sağlık bilgileri
  health_issues    text,
  injuries         text,
  diet_preference  text,
  extra_notes      text,
  -- Ödeme
  paytr_order_id   text UNIQUE,
  amount           numeric DEFAULT 499,
  payment_status   text DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed')),
  paid_at          timestamptz,
  -- Admin işlemi
  status           text DEFAULT 'waiting' CHECK (status IN ('waiting','in_progress','sent')),
  program_type     text DEFAULT 'fitness' CHECK (program_type IN ('fitness','beslenme','combo')),
  admin_program    text,
  sent_at          timestamptz,
  created_at       timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.program_requests ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi taleplerini görebilir
CREATE POLICY "user_own_requests" ON public.program_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcı talep oluşturabilir
CREATE POLICY "user_insert_requests" ON public.program_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin tümünü görebilir ve güncelleyebilir (service role ile)
-- Service role RLS'yi bypass eder, ayrı policy gerekmez.

-- Index
CREATE INDEX IF NOT EXISTS idx_program_requests_user_id ON public.program_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_program_requests_payment_status ON public.program_requests(payment_status);
CREATE INDEX IF NOT EXISTS idx_program_requests_status ON public.program_requests(status);
CREATE INDEX IF NOT EXISTS idx_program_requests_paytr_order_id ON public.program_requests(paytr_order_id);
