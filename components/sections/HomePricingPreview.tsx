"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight, Star } from "lucide-react";

const plans = [
  { name: "Aylık", price: "2.000", period: "/ ay", features: ["Sınırsız Fitness", "Soyunma Odası", "Sauna"], highlight: false },
  { name: "3 Aylık", price: "4.200", period: "/ 3 ay", features: ["Sınırsız Fitness", "Soyunma Odası", "Sauna", "1 Ücretsiz PT"], highlight: true, badge: "En Popüler" },
  { name: "6 Aylık", price: "7.000", period: "/ 6 ay", features: ["Sınırsız Fitness", "Soyunma Odası", "Sauna", "2 Ücretsiz PT", "Program Analizi"], highlight: false },
];

export default function HomePricingPreview() {
  return (
    <section style={{ padding: "5rem 0", background: "#0B0B0B" }}>
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Şeffaf Fiyatlandırma</p>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)" }}>Fitness Üyelik Paketleri</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "0.875rem", fontSize: "0.9375rem" }}>Gizli ücret yok. İlk antrenman ücretsiz.</p>
        </motion.div>

        <div style={{ display: "grid", gap: "1.25rem" }} className="pricing-grid">
          <style>{`
            .pricing-grid { grid-template-columns: 1fr; }
            @media (min-width: 640px) { .pricing-grid { grid-template-columns: repeat(3, 1fr); } }
          `}</style>
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{
                position: "relative",
                borderRadius: "16px",
                padding: "1.75rem",
                display: "flex",
                flexDirection: "column",
                background: plan.highlight ? "#6A0D25" : "#1A1A1A",
                border: plan.highlight ? "1px solid rgba(212,175,55,0.4)" : "1px solid #2A2A2A",
                marginTop: plan.highlight ? "0" : "0",
              }}
            >
              {plan.badge && (
                <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.2rem 0.875rem", background: "#D4AF37", color: "#0B0B0B", fontSize: "0.6875rem", fontWeight: 700, borderRadius: "9999px", whiteSpace: "nowrap" }}>
                    <Star style={{ width: "10px", height: "10px" }} /> {plan.badge}
                  </span>
                </div>
              )}
              <p style={{ color: plan.highlight ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "0.375rem" }}>{plan.name}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)" }}>₺{plan.price}</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>{plan.period}</span>
              </div>
              <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1, marginBottom: "1.25rem" }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Check style={{ width: "15px", height: "15px", color: "#D4AF37", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.875rem", color: plan.highlight ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.6)" }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/fiyatlar"
                style={{ display: "block", textAlign: "center", padding: "0.75rem", borderRadius: "12px", fontSize: "0.875rem", fontWeight: 700, textDecoration: "none", background: plan.highlight ? "#D4AF37" : "#2A2A2A", color: plan.highlight ? "#0B0B0B" : "#fff", border: plan.highlight ? "none" : "1px solid #3A3A3A" }}
              >
                Üye Ol
              </Link>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link href="/fiyatlar" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#D4AF37", fontSize: "0.9375rem", fontWeight: 600, textDecoration: "none" }}>
            Tüm fiyatları gör <ArrowRight style={{ width: "16px", height: "16px" }} />
          </Link>
        </div>
      </div>
    </section>
  );
}
