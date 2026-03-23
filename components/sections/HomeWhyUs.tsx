"use client";
import { motion } from "framer-motion";
import { Award, Brain, Users, Shield } from "lucide-react";

const reasons = [
  { icon: Award, title: "Sertifikalı Eğitmenler", desc: "ACSM, NASM ve NSCA sertifikalı uzman kadro ile güvenli ve etkili antrenman." },
  { icon: Brain, title: "Bilimsel Programlama", desc: "Antrenman programları spor bilimine dayalı, kişiye özel periodizasyon ile tasarlanır." },
  { icon: Users, title: "Topluluk Ruhu", desc: "Motivasyonu yüksek, pozitif bir ortamda hedeflerine daha hızlı ulaş." },
  { icon: Shield, title: "Premium Ekipman", desc: "Dünya markası ekipmanlar, günlük bakım ve hijyenik ortam garantisiyle." },
];

export default function HomeWhyUs() {
  return (
    <section style={{ padding: "5rem 0", background: "#111111" }}>
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: "3rem" }}
        >
          <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Neden Machine Gym?</p>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)" }}>Farkımız</h2>
        </motion.div>

        <div
          style={{ display: "grid", gap: "1.25rem" }}
          className="whyus-grid"
        >
          <style>{`
            .whyus-grid { grid-template-columns: 1fr; }
            @media (min-width: 640px) { .whyus-grid { grid-template-columns: repeat(2, 1fr); } }
            @media (min-width: 1024px) { .whyus-grid { grid-template-columns: repeat(4, 1fr); } }
          `}</style>
          {reasons.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "16px", padding: "1.75rem", textAlign: "center" }}
              >
                <div style={{ width: "52px", height: "52px", background: "rgba(106,13,37,0.2)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                  <Icon style={{ width: "24px", height: "24px", color: "#D4AF37" }} />
                </div>
                <h3 style={{ color: "#fff", fontWeight: 700, marginBottom: "0.625rem", fontSize: "0.9375rem", fontFamily: "var(--font-heading)" }}>{r.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem", lineHeight: 1.65 }}>{r.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
