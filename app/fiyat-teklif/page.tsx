import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import LeadForm from "@/components/forms/LeadForm";
import type { Metadata } from "next";
import { Tag, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Fiyat Teklifi Talebi — Machine Gym Bolu",
  description: "Machine Gym üyelik ve hizmet paketleri için özel fiyat teklifi alın. Bolu fitness ve boks salonu.",
};

const packages = [
  { name: "Fitness Üyelik", items: ["1 Ay", "3 Ay", "6 Ay", "Yıllık"] },
  { name: "Personal Trainer", items: ["10 Seans", "15 Seans", "20 Seans", "Aylık Program"] },
  { name: "Boks / Kickboks", items: ["8 Seans", "12 Seans", "Aylık Program"] },
  { name: "Muay Thai", items: ["Başlangıç Paketi", "Devam Paketi", "Aylık Program"] },
];

export default function FiyatTeklifPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section style={{ paddingTop: "7rem", paddingBottom: "3.5rem", background: "linear-gradient(180deg,#0D0D0D,#111)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="page-container" style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, background: "rgba(106,13,37,0.2)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Tag size={22} style={{ color: "#D4AF37" }} />
            </div>
            <h1 style={{ color: "#fff", fontSize: "clamp(26px,4.5vw,42px)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 14 }}>
              Özel Fiyat Teklifi Alın
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, lineHeight: 1.7 }}>
              İhtiyacınıza uygun paketi belirleyelim ve size özel bir teklif hazırlayalım.
            </p>
          </div>
        </section>

        {/* Paket Özeti */}
        <section style={{ padding: "3rem 0", background: "#0B0B0B" }}>
          <div className="page-container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12, maxWidth: 900, margin: "0 auto" }}>
              {packages.map(pkg => (
                <div key={pkg.name} style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "1.25rem" }}>
                  <p style={{ color: "#D4AF37", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{pkg.name}</p>
                  {pkg.items.map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                      <CheckCircle2 size={13} style={{ color: "rgba(74,222,128,0.7)", flexShrink: 0 }} />
                      <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>{item}</span>
                    </div>
                  ))}
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
                type="quote"
                title="Teklif Formu"
                subtitle="Formu doldurun, size en uygun paketi ve fiyatı sunalım."
                submitLabel="Fiyat Teklifi İste"
                successTitle="Talebiniz Alındı!"
                successMsg="Size özel teklifi en kısa sürede WhatsApp veya telefon ile ileteceğiz."
                fields={[
                  { key: "name", leadKey: "name", label: "Ad Soyad", placeholder: "Adınız", required: true, half: true },
                  { key: "phone", leadKey: "phone", label: "Telefon", type: "tel", placeholder: "05xx xxx xx xx", required: true, half: true },
                  { key: "email", leadKey: "email", label: "E-posta", type: "email", placeholder: "email@örnek.com" },
                  { key: "quote_package", leadKey: "quote_package", label: "İlgilendiğiniz Paket", type: "select", required: true, options: ["Fitness Üyelik — 1 Ay", "Fitness Üyelik — 3 Ay", "Fitness Üyelik — 6 Ay", "Personal Trainer — 10 Seans", "Personal Trainer — 15 Seans", "Personal Trainer — 20 Seans", "Boks — 8 Seans", "Boks — 12 Seans", "Kickboks Paketi", "Muay Thai Paketi", "Kombine Paket", "Henüz Karar Vermedim"] },
                  { key: "quote_budget", leadKey: "quote_budget", label: "Bütçe Aralığı (İsteğe Bağlı)", type: "select", options: ["1.000 – 2.000 TL", "2.000 – 4.000 TL", "4.000 – 7.000 TL", "7.000 TL üzeri", "Belirtmek İstemiyorum"] },
                  { key: "message", leadKey: "message", label: "Eklemek İstedikleriniz", type: "textarea", placeholder: "Ek taleplerinizi veya sorularınızı yazın..." },
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
