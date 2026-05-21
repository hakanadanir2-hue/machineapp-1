import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { buildMetadata, breadcrumbSchema, faqSchema, BASE_URL } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import SssClient from "./SssClient";

export async function generateMetadata() {
  return buildMetadata({
    settingsKey: "seo_sss",
    defaultTitle: "Sık Sorulan Sorular — Machine Gym | Bolu Spor Salonu",
    defaultDesc: "Machine Gym hakkında sık sorulan sorular: üyelik nasıl yapılır, saatler, fiyatlar, personal trainer, boks dersleri ve daha fazlası.",
    path: "/sss",
    keywords: ["machine gym sss", "bolu spor salonu sorular", "fitness üyelik bolu", "boks dersi bolu fiyat"],
  });
}

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
}

const FALLBACK: Faq[] = [
  { id: "1", question: "Machine Gym'e nasıl üye olabilirim?", answer: "Tesisimize gelerek personelimizle görüşebilir ya da web sitemiz üzerinden kayıt formumuzu doldurabilirsiniz. Üyelik işleminiz birkaç dakika içinde tamamlanır.", category: "Üyelik", order_index: 0 },
  { id: "2", question: "Deneme antrenmanı ücretsiz mi?", answer: "Evet, Machine Gym'de ilk antrenmanınız tamamen ücretsizdir. Randevu formumuzu doldurmanız yeterli. Salonu görün, eğitmenlerimizle tanışın, sonra karar verin.", category: "Üyelik", order_index: 1 },
  { id: "3", question: "Bolu'da en iyi spor salonu hangisi?", answer: "Machine Gym, Bolu'nun merkezinde 600 m² modern tesisi, uzman eğitmen kadrosu ve 5 farklı branşıyla (fitness, personal training, boks, kickboks, muay thai) öne çıkan premium spor merkezidir.", category: "Genel", order_index: 2 },
  { id: "4", question: "Çalışma saatleriniz nedir?", answer: "Pazartesi–Cuma 08:00–23:00, Cumartesi 10:00–23:00, Pazar 12:00–20:00 saatleri arasında hizmet veriyoruz.", category: "Genel", order_index: 3 },
  { id: "5", question: "Personal trainer ücreti ne kadar?", answer: "Kişisel antrenman paketlerimiz hedef ve süreye göre değişmektedir. Güncel fiyatlar için /fiyatlar sayfamızı ziyaret edebilir veya WhatsApp hattımızdan bilgi alabilirsiniz.", category: "Fiyat", order_index: 4 },
  { id: "6", question: "Boks derslerine başlamak için ön koşul var mı?", answer: "Hayır, boks derslerimiz her seviyeye uygundur. Daha önce hiç dövüş sporları yapmamış olsanız bile başlayabilirsiniz. Eğitmenlerimiz sıfırdan başlayanlara özel programlar uygulamaktadır.", category: "Hizmet", order_index: 5 },
];

export default async function SssPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select("id, question, answer, category, order_index")
    .eq("is_active", true)
    .order("order_index");

  const faqs: Faq[] = (data && data.length > 0) ? data : FALLBACK;

  // JSON-LD schemas
  const faqJsonLd = faqSchema(faqs.map((f) => ({ question: f.question, answer: f.answer })));
  const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Ana Sayfa", url: BASE_URL },
    { name: "Sık Sorulan Sorular", url: `${BASE_URL}/sss` },
  ]);

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* SSR-visible FAQ content for AI crawlers */}
      <noscript>
        <div style={{ display: "none" }}>
          <h1>Machine Gym Bolu — Sık Sorulan Sorular</h1>
          {faqs.map((f) => (
            <div key={f.id}>
              <h2>{f.question}</h2>
              <p>{f.answer}</p>
            </div>
          ))}
        </div>
      </noscript>
      <SssClient faqs={faqs} />
      <WhatsAppButton />
      <Footer />
    </>
  );
}
