-- ============================================================
-- Web Push Notification Altyapısı — SQL Migration
-- Supabase SQL Editor'da çalıştırın
-- ============================================================

-- 1. push_subscriptions tablosu (VAPID web push endpoint'leri)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    text NOT NULL UNIQUE,
  p256dh      text NOT NULL,
  auth        text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi subscription'larını görebilir / silebilir
CREATE POLICY "user_own_subscriptions_select" ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "user_own_subscriptions_delete" ON public.push_subscriptions
  FOR DELETE USING (auth.uid() = member_id);

-- Sadece service role insert/upsert yapabilir (API route üzerinden)
-- (service role RLS'yi bypass eder, ayrı policy gerekmez)

-- Index
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_member ON public.push_subscriptions(member_id);

-- ============================================================
-- 2. member_notifications tablosuna meta (JSONB) sütunu ekle
--    (zaten varsa atlar)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'member_notifications'
      AND column_name  = 'meta'
  ) THEN
    ALTER TABLE public.member_notifications ADD COLUMN meta jsonb;
  END IF;
END
$$;

-- ============================================================
-- 3. members tablosuna birth_date sütunu ekle (doğum günü için)
--    (zaten varsa atlar)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'members'
      AND column_name  = 'birth_date'
  ) THEN
    ALTER TABLE public.members ADD COLUMN birth_date date;
  END IF;
END
$$;

-- ============================================================
-- 4. pg_cron — Zamanlı bildirim görevleri
--    Supabase Dashboard → Extensions → pg_cron etkinleştirildikten sonra çalıştırın.
--    Edge Function URL ve Bearer token'ı kendi değerlerinizle değiştirin.
-- ============================================================

-- Su hatırlatma: sabah 10:00, öğlen 14:00, akşam 18:00 (UTC+3 = UTC 07:00, 11:00, 15:00)
/*
SELECT cron.schedule(
  'water-reminder-morning',
  '0 7 * * *',
  $$
    SELECT net.http_post(
      url     := 'https://nyobwxhyoxtbtmkmrwyc.supabase.co/functions/v1/send-notifications',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body    := '{"task":"water"}'::jsonb
    );
  $$
);

SELECT cron.schedule(
  'water-reminder-noon',
  '0 11 * * *',
  $$
    SELECT net.http_post(
      url     := 'https://nyobwxhyoxtbtmkmrwyc.supabase.co/functions/v1/send-notifications',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body    := '{"task":"water"}'::jsonb
    );
  $$
);

SELECT cron.schedule(
  'water-reminder-evening',
  '0 15 * * *',
  $$
    SELECT net.http_post(
      url     := 'https://nyobwxhyoxtbtmkmrwyc.supabase.co/functions/v1/send-notifications',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body    := '{"task":"water"}'::jsonb
    );
  $$
);

-- Üyelik yenileme: her gün sabah 09:00 (UTC 06:00)
SELECT cron.schedule(
  'renewal-reminder-daily',
  '0 6 * * *',
  $$
    SELECT net.http_post(
      url     := 'https://nyobwxhyoxtbtmkmrwyc.supabase.co/functions/v1/send-notifications',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body    := '{"task":"renewal"}'::jsonb
    );
  $$
);

-- Doğum günü: her gün sabah 08:00 (UTC 05:00)
SELECT cron.schedule(
  'birthday-daily',
  '0 5 * * *',
  $$
    SELECT net.http_post(
      url     := 'https://nyobwxhyoxtbtmkmrwyc.supabase.co/functions/v1/send-notifications',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body    := '{"task":"birthday"}'::jsonb
    );
  $$
);
*/

-- ============================================================
-- 5. food_logs tablosuna trainer_comment DB Webhook kurulumu
--    (Supabase Dashboard → Database → Webhooks'tan yapılandırın)
--    URL: https://YOUR_DOMAIN/api/push/trainer-comment
--    Events: UPDATE, INSERT
--    Headers: Authorization: Bearer YOUR_WEBHOOK_SECRET
-- ============================================================

COMMENT ON TABLE public.push_subscriptions IS 'Web Push (VAPID) subscription kayıtları';
