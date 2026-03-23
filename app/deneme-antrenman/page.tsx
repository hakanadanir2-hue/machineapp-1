import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import LeadForm from "@/components/forms/LeadForm";
import type { Metadata } from "next";
import { Dumbbell, Star, Users, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Ücretsiz Deneme Antrenmanı — Machine Gym Bolu",
  description: "Machine Gym'de ücretsiz deneme antrenmanı için başvurun. Fitness, boks, kickboks veya muay thai. Bolu'nun premium spor salonu.",
};

const perks = [
  { icon: <Star size={20} />, title: "Tamamen Ücretsiz", desc: "Hiçbir ücret ödemeden salonumuzu keşfedin" },
  { icon: <Users size={20} />, title: "Uzman Eşliğinde", desc: "Sertifikalı eğitmenimiz yanınızda olacak" },
  { icon: <Clock size={20} />, title: "Esnek Program", desc: "Size uygun gün ve saati seçin" },
  { icon: <Dumbbell size={20} />, title: "Her Seviyeye Uygun", desc: "Yeni başlayanlardan ileri seviyeye" },
];

export default function DenemeAntrenmanPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section style={{ paddingTop: "7rem", paddingBottom: "4rem", background: "linear-gradient(180deg,#0D0D0D 0%,#111 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="page-container" style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
            <span style={{ display: "inline-block", background: "rgba(106,13,37,0.2)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 99, padding: "6px 16px", color: "#D4AF37", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>
              Sınırlı Kontenjan
            </span>
            <h1 style={{ color: "#fff", fontSize: "clamp(28px,5vw,46px)", fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 16 }}>
              Ücretsiz Deneme Antrenmanı<br />
              <span style={{ color: "#D4AF37" }}>Kaybedecek Bir Şeyin Yok</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 17, lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
              Machine Gym'de bir gün geç, salonumuzu, ekipmanlarımızı ve eğitmenlerimizi tanı. Beğenirsen devam et, beğenmezsen hiçbir yükümlülük yok.
            </p>
          </div>
        </section>

        {/* Perks */}
        <section style={{ padding: "3.5rem 0", background: "#0B0B0B" }}>
          <div className="page-container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 14, maxWidth: 900, margin: "0 auto" }}>
              {perks.map((p, i) => (
                <div key={i} style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "1.5rem 1.25rem" }}>
                  <div style={{ width: 40, height: 40, background: "rgba(106,13,37,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#D4AF37", marginBottom: 12 }}>
                    {p.icon}
                  </div>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.title}</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form */}
        <section style={{ padding: "4rem 0 6rem", background: "#0F0F0F" }}>
          <div className="page-container" style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "2.5rem 2rem" }}>
              <LeadForm
                type="trial"
                title="Başvuruyu Tamamla"
                subtitle="Formu doldurun, 24 saat içinde arayalım ve programınızı belirleyelim."
                submitLabel="Deneme Antrenmanı Talep Et"
                successTitle="Başvurunuz Alındı!"
                successMsg="24 saat içinde sizinle iletişime geçeceğiz. WhatsApp üzerinden de ulaşabilirsiniz."
                fields={[
                  { key: "name", leadKey: "name", label: "Ad Soyad", placeholder: "Adınız ve soyadınız", required: true, half: true },
                  { key: "phone", leadKey: "phone", label: "Telefon", type: "tel", placeholder: "05xx xxx xx xx", required: true, half: true },
                  { key: "email", leadKey: "email", label: "E-posta", type: "email", placeholder: "email@örnek.com" },
                  { key: "trial_service", leadKey: "trial_service", label: "İlgilendiğiniz Hizmet", type: "select", options: ["Fitness Üyelik", "Personal Trainer", "Boks Özel Ders", "Kickboks", "Muay Thai", "Henüz Karar Vermedim"], required: true },
                  { key: "trial_goal", leadKey: "trial_goal", label: "Hedefiniz", type: "select", options: ["Yağ Yakmak / Zayıflamak", "Kas Kazanmak", "Kondisyon Geliştirmek", "Dövüş Sporu Öğrenmek", "Genel Sağlık ve Fitness", "Stres Atmak"] },
                  { key: "trial_level", leadKey: "trial_level", label: "Deneyim Seviyeniz", type: "select", options: ["Hiç Spor Yapmadım", "Arada Sırada Yapıyorum", "Düzenli Spor Yapıyorum", "İleri Seviye"] },
                  { key: "message", leadKey: "message", label: "Eklemek İstediğiniz Bir Şey Var mı?", type: "textarea", placeholder: "Sağlık durumunuz, beklentileriniz veya sormak istediğiniz herhangi bir şey..." },
                ]}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
