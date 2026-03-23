-- faqs tablosu (SSS)
CREATE TABLE IF NOT EXISTS faqs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question    text NOT NULL,
  answer      text NOT NULL,
  category    text DEFAULT 'genel',
  order_index integer DEFAULT 0,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_faqs" ON faqs;
CREATE POLICY "public_read_faqs" ON faqs FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "admin_all_faqs" ON faqs;
CREATE POLICY "admin_all_faqs" ON faqs FOR ALL USING (true) WITH CHECK (true);

-- Başlangıç verileri
INSERT INTO faqs (question, answer, category, order_index) VALUES
('Üyelik nasıl başlatabilirim?', 'Salonumuza gelip üyelik formunu doldurabilir ya da web sitemiz üzerinden randevu alıp yerinde başlatabilirsiniz.', 'uyelik', 0),
('Deneme antrenmanı ücretsiz mi?', 'Evet, ilk antrenmanınız tamamen ücretsizdir. Randevu formumuzu doldurmanız yeterli.', 'uyelik', 1),
('Seans dondurma yapabilir miyim?', 'Evet, belgelenmiş sağlık veya seyahat mazereti ile seanslarınızı dondurabilirsiniz. Lütfen resepsiyonumuzu arayın.', 'uyelik', 2),
('Personal trainer ile antrenman nasıl oluyor?', 'Antrenörünüz önce fiziksel değerlendirmenizi yapar, ardından hedeflerinize özel program hazırlar ve her seansta yanınızda olur.', 'egitim', 3),
('Hangi saatlerde açıksınız?', 'Hafta içi 06:00-23:00, hafta sonu 08:00-22:00 saatleri arasında hizmet veriyoruz.', 'genel', 4),
('Soyunma odası ve duş var mı?', 'Evet, erkek ve bayan soyunma odaları ile duş imkânı mevcuttur.', 'genel', 5),
('Boks veya kickboks için ön bilgi gerekli mi?', 'Hayır, sıfır deneyimle başlayabilirsiniz. Eğitmenlerimiz temel tekniklerden başlayarak ilerletecektir.', 'egitim', 6),
('Ödeme seçenekleri neler?', 'Nakit, kredi kartı ve havale/EFT ile ödeme yapabilirsiniz. Taksitli ödeme seçeneklerimiz de mevcuttur.', 'uyelik', 7)
ON CONFLICT DO NOTHING;
