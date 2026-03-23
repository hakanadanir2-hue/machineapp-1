import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() {
  return buildMetadata({ settingsKey: "seo_hizmetler", defaultTitle: "Hizmetler — Machine Gym | Bolu", defaultDesc: "Machine Gym hizmetleri: Fitness üyelik, personal trainer, boks, kickboks ve muay thai.", path: "/hizmetler" });
}

interface Service {
  id: string;
  title: string;
  short_description: string | null;
  long_description: string | null;
  features: string[] | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  order_index: number;
}

const FALLBACK: Service[] = [
  { id: "1", title: "Fitness Üyelik", short_description: "Modern ekipmanlar, klimatize ortam, sınırsız antrenman.", long_description: "Dünya markası cardio ve strength ekipmanları, günlük bakım ve temiz ortamda hedeflerinize ulaşın.", features: ["Sınırsız Makine Kullanımı", "Soyunma Odası & Duş", "Sauna Erişimi", "Ücretsiz Program Danışması"], image_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=80", cta_text: "Randevu Al", cta_link: "/randevu", order_index: 0 },
  { id: "2", title: "Personal Trainer", short_description: "Bire bir uzman eğitmen desteği ve kişisel program.", long_description: "Sertifikalı kişisel antrenörlerimiz hedeflerinize göre özel program tasarlar.", features: ["Kişisel Program Tasarımı", "Teknik Düzeltme", "Beslenme Önerileri", "Haftalık Takip"], image_url: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=900&q=80", cta_text: "Randevu Al", cta_link: "/randevu", order_index: 1 },
  { id: "3", title: "Boks Özel Ders", short_description: "Teknik, kondisyon ve öz güven.", long_description: "Profesyonel boks eğitmenleriyle bire bir veya grup derslerinde teknik kazanın.", features: ["Ayak İşi & Duruş", "Kombinasyon Çalışmaları", "Torba & Pad Antrenmanı", "Kondisyon"], image_url: "https://images.unsplash.com/photo-1549476464-37392f717541?w=900&q=80", cta_text: "Randevu Al", cta_link: "/randevu", order_index: 2 },
];

export default async function HizmetlerPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  const services: Service[] = (data && data.length > 0) ? data : FALLBACK;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0B0B0B" }}>

        <div style={{ paddingTop: "96px", paddingBottom: "3.5rem", background: "linear-gradient(to bottom, #111111, #0B0B0B)", borderBottom: "1px solid rgba(106,13,37,0.15)" }}>
          <div className="page-container" style={{ textAlign: "center" }}>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Branşlarımız</p>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)", marginBottom: "1rem" }}>Hizmetler</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", maxWidth: "32rem", marginInline: "auto", lineHeight: 1.7 }}>
              Her seviye ve hedefe uygun branşlarda profesyonel eğitim alın. İlk ders ücretsiz.
            </p>
          </div>
        </div>

        <div className="page-container" style={{ paddingTop: "3.5rem", paddingBottom: "5rem" }}>
          {services.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "3rem" }}>Hizmetler yakında eklenecek.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {services.map((s, i) => {
                const features: string[] = Array.isArray(s.features) ? s.features : [];
                return (
                  <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1fr", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "20px", overflow: "hidden" }} className={`service-card-${i}`}>
                    <style>{`
                      @media (min-width: 1024px) {
                        .service-card-${i} { grid-template-columns: ${i % 2 === 0 ? "2fr 3fr" : "3fr 2fr"} !important; }
                        .service-img-${i} { order: ${i % 2 === 0 ? "0" : "1"} !important; height: auto !important; min-height: 320px; }
                        .service-content-${i} { order: ${i % 2 === 0 ? "1" : "0"} !important; }
                      }
                    `}</style>

                    <div className={`service-img-${i}`} style={{ height: "220px", overflow: "hidden", position: "relative" }}>
                      {s.image_url ? (
                        <img src={s.image_url} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "rgba(106,13,37,0.15)" }} />
                      )}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(26,26,26,0.3), transparent)" }} />
                    </div>

                    <div className={`service-content-${i}`} style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", fontFamily: "var(--font-heading)", marginBottom: "0.4rem" }}>{s.title}</h2>
                      {s.short_description && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>{s.short_description}</p>}
                      {s.long_description && <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>{s.long_description}</p>}

                      {features.length > 0 && (
                        <ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1rem", marginBottom: "1.5rem" }}>
                          {features.map((f) => (
                            <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                              <CheckCircle2 style={{ width: "15px", height: "15px", color: "#D4AF37", flexShrink: 0, marginTop: "2px" }} />
                              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8125rem", lineHeight: 1.4 }}>{f}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div>
                        <Link href={s.cta_link || "/randevu"} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", background: "#6A0D25", color: "#fff", fontSize: "0.875rem", fontWeight: 700, borderRadius: "12px", border: "1px solid rgba(212,175,55,0.3)", textDecoration: "none" }}>
                          {s.cta_text || "Randevu Al"} <ArrowRight style={{ width: "16px", height: "16px" }} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: "4rem", background: "rgba(106,13,37,0.08)", border: "1px solid rgba(106,13,37,0.2)", borderRadius: "20px", padding: "2.5rem", textAlign: "center" }}>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Karar Veremedin mi?</p>
            <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "1.5rem", fontFamily: "var(--font-heading)", marginBottom: "0.75rem" }}>Ücretsiz Danışma Alın</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "1.75rem", maxWidth: "28rem", marginInline: "auto" }}>Hangi branşın size uygun olduğunu bulmak için eğitmenlerimizle ücretsiz görüşme yapın.</p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/randevu" style={{ padding: "0.75rem 1.75rem", background: "#6A0D25", color: "#fff", fontWeight: 700, fontSize: "0.875rem", borderRadius: "12px", border: "1px solid rgba(212,175,55,0.3)", textDecoration: "none" }}>Randevu Al</Link>
              <Link href="/iletisim" style={{ padding: "0.75rem 1.75rem", background: "#1A1A1A", color: "rgba(255,255,255,0.7)", fontWeight: 500, fontSize: "0.875rem", borderRadius: "12px", border: "1px solid #2A2A2A", textDecoration: "none" }}>Bize Ulaşın</Link>
            </div>
          </div>
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}
