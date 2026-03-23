import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Pricing from "@/components/sections/Pricing";
import { createClient } from "@/lib/supabase/server";
import { getSettings, s } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata({ settingsKey: "seo_fiyatlar", defaultTitle: "Fiyatlar — Machine Gym | Bolu", defaultDesc: "Machine Gym fiyat listesi: Fitness üyelik, personal trainer, boks ve kickboks paketleri.", path: "/fiyatlar" });
}

export default async function FiyatlarPage() {
  const [settings, supabase] = await Promise.all([getSettings(), createClient()]);
  const { data: plans } = await supabase
    .from("pricing_plans")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  const whatsapp = s(settings, "contact_whatsapp", "903742701455");

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0B0B0B" }}>
        <div style={{ paddingTop: "96px", paddingBottom: "3.5rem", background: "linear-gradient(to bottom, #111111, #0B0B0B)", borderBottom: "1px solid rgba(106,13,37,0.15)" }}>
          <div className="page-container" style={{ textAlign: "center" }}>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Şeffaf Fiyatlandırma</p>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)", marginBottom: "1rem" }}>Fiyat Listesi</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", maxWidth: "32rem", marginInline: "auto", lineHeight: 1.7 }}>
              Gizli ücret yok. İlk antrenman ücretsiz. Tüm paketler aşağıda.
            </p>
          </div>
        </div>
        <div style={{ paddingTop: "3rem" }}>
          <Pricing plans={plans ?? undefined} whatsapp={whatsapp} />
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}
