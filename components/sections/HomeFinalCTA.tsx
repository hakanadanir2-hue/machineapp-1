"use client";
import Link from "next/link";
import { MessageCircle, ArrowRight, Phone } from "lucide-react";

export default function HomeFinalCTA() {
  const wa = `https://wa.me/903742701455?text=${encodeURIComponent("Merhaba, deneme antrenmanı hakkında bilgi almak istiyorum.")}`;

  return (
    <section style={{ padding: "5rem 0", background: "#0B0B0B" }}>
      <div className="page-container">
        <div style={{ background: "linear-gradient(135deg, #6A0D25 0%, #4A0819 100%)", borderRadius: "24px", padding: "clamp(2rem, 5vw, 3.5rem)", border: "1px solid rgba(212,175,55,0.25)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "200px", height: "200px", background: "rgba(212,175,55,0.05)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: "-40px", left: "-40px", width: "150px", height: "150px", background: "rgba(255,255,255,0.03)", borderRadius: "50%" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1rem" }}>Başlamak İçin Bir Adım</p>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)", marginBottom: "1rem", lineHeight: 1.1 }}>
              İlk Antrenman<br /><span style={{ color: "#D4AF37" }}>Tamamen Ücretsiz</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9375rem", marginBottom: "2rem", maxWidth: "32rem", marginInline: "auto", lineHeight: 1.7 }}>
              Hiçbir ön ödeme yok. Gel, gör, hisset. Seni tanıyalım ve hedeflerine uygun programı birlikte belirleyelim.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/randevu" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 1.75rem", background: "#D4AF37", color: "#0B0B0B", fontWeight: 800, fontSize: "0.9375rem", borderRadius: "12px", textDecoration: "none" }}>
                Randevu Al <ArrowRight style={{ width: "16px", height: "16px" }} />
              </Link>
              <a href={wa} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 1.75rem", background: "rgba(255,255,255,0.1)", color: "#fff", fontWeight: 600, fontSize: "0.9375rem", borderRadius: "12px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
                <MessageCircle style={{ width: "18px", height: "18px", color: "#4ade80" }} />
                WhatsApp
              </a>
              <a href="tel:+903742701455" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 1.75rem", background: "rgba(255,255,255,0.1)", color: "#fff", fontWeight: 600, fontSize: "0.9375rem", borderRadius: "12px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
                <Phone style={{ width: "16px", height: "16px" }} />
                0374 270 14 55
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
