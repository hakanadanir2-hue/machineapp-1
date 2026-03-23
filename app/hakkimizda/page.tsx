import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getSettings, s } from "@/lib/settings";
import Link from "next/link";
import { Award, Target, Heart, ArrowRight, Users, Clock, Dumbbell, Star } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata({ settingsKey: "seo_hakkimizda", defaultTitle: "Hakkımızda — Machine Gym | Bolu Premium Spor Salonu", defaultDesc: "Machine Gym hakkında: Bolu'nun premium fitness & boks salonu. Misyonumuz, vizyonumuz ve değerlerimiz.", path: "/hakkimizda" });
}

const stats = [
  { value: "500+", label: "Aktif Üye", Icon: Users },
  { value: "10+", label: "Yıl Deneyim", Icon: Clock },
  { value: "5", label: "Branş", Icon: Dumbbell },
  { value: "3", label: "Uzman Eğitmen", Icon: Star },
];

const values = [
  {
    Icon: Award,
    title: "Mükemmeliyetçilik",
    desc: "Her antrenman, her program, her hizmette en yüksek standardı hedefliyoruz. Çünkü ortalamayla yetinmiyoruz.",
  },
  {
    Icon: Target,
    title: "Sonuç Odaklılık",
    desc: "Hedefin ne olursa olsun, ölçülebilir sonuçlar için bilimsel yaklaşım ve kişiselleştirilmiş programlar uyguluyoruz.",
  },
  {
    Icon: Heart,
    title: "Topluluk Ruhu",
    desc: "Birbirini motive eden, destekleyen ve birlikte büyüyen bir üye topluluğu oluşturuyoruz. Yalnız değilsin.",
  },
];

const trainers = [
  {
    name: "Ahmet Kaya",
    role: "Baş Fitness Eğitmeni",
    cert: "ACSM · NASM CPT",
    img: "https://images.unsplash.com/photo-1567013127542-490d757e51cd?w=400&q=80",
    exp: "8 yıl deneyim",
  },
  {
    name: "Murat Demir",
    role: "Boks & Kickboks Koçu",
    cert: "WBC Lisanslı",
    img: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&q=80",
    exp: "12 yıl deneyim",
  },
  {
    name: "Emre Yıldız",
    role: "Muay Thai Eğitmeni",
    cert: "IFMA Sertifikalı",
    img: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80",
    exp: "6 yıl deneyim",
  },
];

export default async function HakkimizdaPage() {
  const settings = await getSettings();

  const stats = [
    { value: s(settings, "about_members", "500+"), label: "Aktif Üye", Icon: Users },
    { value: s(settings, "about_years", "10+"), label: "Yıl Deneyim", Icon: Clock },
    { value: "5", label: "Branş", Icon: Dumbbell },
    { value: s(settings, "about_trainers", "3"), label: "Uzman Eğitmen", Icon: Star },
  ];
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0B0B0B" }}>
        <div style={{ paddingTop: "96px", paddingBottom: "3.5rem", background: "linear-gradient(to bottom, #111111, #0B0B0B)", borderBottom: "1px solid rgba(106,13,37,0.15)" }}>
          <div className="page-container" style={{ textAlign: "center" }}>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Biz Kimiz?</p>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)", marginBottom: "1rem" }}>Hakkımızda</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", maxWidth: "32rem", marginInline: "auto", lineHeight: 1.7 }}>
              Bolu'nun en disiplinli fitness ve dövüş sporları salonu. Bilimsel programlar, uzman kadro, premium ortam.
            </p>
          </div>
        </div>

        <div className="page-container" style={{ paddingTop: "3.5rem", paddingBottom: "5rem" }}>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "4rem" }}>
            {stats.map(({ value, label, Icon }) => (
              <div key={label} style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "16px", padding: "1.5rem", textAlign: "center" }}>
                <div style={{ width: "44px", height: "44px", background: "rgba(106,13,37,0.2)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem" }}>
                  <Icon style={{ width: "20px", height: "20px", color: "#D4AF37" }} />
                </div>
                <p style={{ fontSize: "2rem", fontWeight: 800, color: "#D4AF37", fontFamily: "var(--font-heading)", lineHeight: 1 }}>{value}</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8125rem", marginTop: "0.375rem" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Story */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3rem", marginBottom: "4rem", alignItems: "center" }} className="about-story">
            <style>{`
              @media (min-width: 768px) {
                .about-story { grid-template-columns: 1fr 1fr !important; }
              }
            `}</style>
            <div>
              <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Hikayemiz</p>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)", marginBottom: "1.25rem", lineHeight: 1.2 }}>
                Bolu&apos;nun En Disiplinli Salonu
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.75 }}>
                <p>Machine Gym, Bolu&apos;daki fitness ve dövüş sporları tutkunlarına dünya standartlarında hizmet sunma misyonuyla kuruldu.</p>
                <p>10 yılı aşkın deneyimimizle 500&apos;den fazla aktif üyemize fitness, personal training, boks, kickboks ve muay thai branşlarında profesyonel eğitim veriyoruz.</p>
                <p>ACSM, NASM ve NSCA sertifikalı eğitmenlerimizle bilimsel temelli programlar tasarlıyor, her üyemizin hedefine ulaşmasını öncelik olarak görüyoruz.</p>
              </div>
            </div>
            <div style={{ borderRadius: "20px", overflow: "hidden", height: "340px" }}>
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
                alt="Machine Gym Salon"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>

          {/* Values */}
          <div style={{ marginBottom: "4rem" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Değerlerimiz</p>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)" }}>İlkelerimiz</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
              {values.map(({ Icon, title, desc }) => (
                <div key={title} style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "20px", padding: "1.75rem" }}>
                  <div style={{ width: "48px", height: "48px", background: "rgba(106,13,37,0.2)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                    <Icon style={{ width: "24px", height: "24px", color: "#D4AF37" }} />
                  </div>
                  <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.0625rem", fontFamily: "var(--font-heading)", marginBottom: "0.625rem" }}>{title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", lineHeight: 1.7 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trainers */}
          <div style={{ marginBottom: "4rem" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Ekibimiz</p>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)" }}>Uzman Eğitmenlerimiz</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
              {trainers.map((t) => (
                <div key={t.name} style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "20px", overflow: "hidden" }}>
                  <div style={{ height: "200px", overflow: "hidden" }}>
                    <img src={t.img} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                  </div>
                  <div style={{ padding: "1.25rem" }}>
                    <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", fontFamily: "var(--font-heading)", marginBottom: "0.25rem" }}>{t.name}</h3>
                    <p style={{ color: "#D4AF37", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>{t.role}</p>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>{t.cert} · {t.exp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ background: "rgba(106,13,37,0.08)", border: "1px solid rgba(106,13,37,0.2)", borderRadius: "20px", padding: "3rem 2rem", textAlign: "center" }}>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Başlamak İçin</p>
            <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "1.75rem", fontFamily: "var(--font-heading)", marginBottom: "0.75rem" }}>Bize Katıl</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", marginBottom: "2rem", maxWidth: "28rem", marginInline: "auto", lineHeight: 1.7 }}>
              İlk deneme antrenmanı ücretsiz. Gel, tanış, ortamı gör — sonra karar ver.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/randevu" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 2rem", background: "#6A0D25", color: "#fff", fontWeight: 700, fontSize: "0.9375rem", borderRadius: "12px", border: "1px solid rgba(212,175,55,0.3)", textDecoration: "none" }}>
                Randevu Al <ArrowRight style={{ width: "18px", height: "18px" }} />
              </Link>
              <Link href="/iletisim" style={{ display: "inline-flex", alignItems: "center", padding: "0.875rem 2rem", background: "#1A1A1A", color: "rgba(255,255,255,0.7)", fontWeight: 500, fontSize: "0.9375rem", borderRadius: "12px", border: "1px solid #2A2A2A", textDecoration: "none" }}>
                İletişime Geç
              </Link>
            </div>
          </div>
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}
