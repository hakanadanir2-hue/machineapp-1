import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ContactClient from "./ContactClient";
import { getSettings, s } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata({ settingsKey: "seo_iletisim", defaultTitle: "İletişim — Machine Gym | Bolu", defaultDesc: "Machine Gym iletişim bilgileri. Bolu Tabaklar Mah. Uygur Sokak NO:3. Tel: 0374 270 14 55", path: "/iletisim" });
}

export default async function IletisimPage() {
  const settings = await getSettings();

  const info = {
    address: s(settings, "contact_address", "Tabaklar Mah. / Uygur Sokak NO:3, Bolu Merkez"),
    phone: s(settings, "contact_phone", "0374 270 14 55"),
    email: s(settings, "contact_email", "info@machinegym.com.tr"),
    whatsapp: s(settings, "contact_whatsapp", "903742701455"),
    weekday: s(settings, "working_weekday", "08:00 – 01:00"),
    saturday: s(settings, "working_saturday", "10:00 – 01:00"),
    sunday: s(settings, "working_sunday", "12:00 – 20:00"),
    instagram: s(settings, "social_instagram", "https://instagram.com/gymachinebolu"),
    facebook: s(settings, "social_facebook", "https://facebook.com/machinegym"),
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0B0B0B" }}>
        <div style={{ paddingTop: "96px", paddingBottom: "3.5rem", background: "linear-gradient(to bottom, #111111, #0B0B0B)", borderBottom: "1px solid rgba(106,13,37,0.15)" }}>
          <div className="page-container" style={{ textAlign: "center" }}>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Bize Ulaşın</p>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)", marginBottom: "1rem" }}>İletişim</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", maxWidth: "32rem", marginInline: "auto", lineHeight: 1.7 }}>
              Sorularınız için bize yazın veya arayın. Deneme antrenmanı için randevu alın.
            </p>
          </div>
        </div>
        <ContactClient info={info} />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
