"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Dumbbell, User, Target, Zap, Shield, ArrowRight } from "lucide-react";

const services = [
  { icon: Dumbbell, title: "Fitness Üyelik", desc: "Modern ekipmanlar ve klimatize ortamda kişiye özel antrenman.", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80" },
  { icon: User, title: "Personal Trainer", desc: "Sertifikalı kişisel antrenörlerimizle bire bir program.", img: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=600&q=80" },
  { icon: Target, title: "Boks Özel Ders", desc: "Profesyonel boks teknikleri, kondisyon ve defans.", img: "https://images.unsplash.com/photo-1549476464-37392f717541?w=600&q=80" },
  { icon: Zap, title: "Kickboks", desc: "Tam vücut egzersizi ve öz savunma becerisi.", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80" },
  { icon: Shield, title: "Muay Thai", desc: "Tayland boks sanatı: disiplin, güç ve esneklik.", img: "https://images.unsplash.com/photo-1604480132736-44c188fe4d20?w=600&q=80" },
];

export default function HomeServices() {
  return (
    <section style={{ padding: "5rem 0", background: "#0B0B0B" }}>
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: "3rem" }}
        >
          <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Ne Sunuyoruz</p>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)" }}>Hizmetlerimiz</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "0.875rem", fontSize: "0.9375rem", maxWidth: "30rem", marginInline: "auto", lineHeight: 1.65 }}>Her seviye ve hedefe uygun profesyonel branşlar.</p>
        </motion.div>

        <div
          style={{ display: "grid", gap: "1.25rem" }}
          className="services-grid"
        >
          <style>{`
            .services-grid {
              grid-template-columns: 1fr;
            }
            @media (min-width: 640px) {
              .services-grid { grid-template-columns: repeat(2, 1fr); }
            }
            @media (min-width: 1024px) {
              .services-grid { grid-template-columns: repeat(3, 1fr); }
            }
          `}</style>
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{
                  background: "#1A1A1A",
                  border: "1px solid #2A2A2A",
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Image */}
                <div style={{ position: "relative", paddingBottom: "56.25%", overflow: "hidden", flexShrink: 0 }}>
                  <img
                    src={s.img}
                    alt={s.title}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,26,26,0.8), transparent)" }} />
                  <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", width: "36px", height: "36px", background: "#6A0D25", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon style={{ width: "18px", height: "18px", color: "#D4AF37" }} />
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem", fontFamily: "var(--font-heading)" }}>{s.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem", lineHeight: 1.6, flex: 1 }}>{s.desc}</p>
                  <Link
                    href="/randevu"
                    style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#D4AF37", fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none" }}
                  >
                    Randevu Al <ArrowRight style={{ width: "14px", height: "14px" }} />
                  </Link>
                </div>
              </motion.div>
            );
          })}

          {/* CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ background: "rgba(106,13,37,0.12)", border: "1px solid rgba(106,13,37,0.3)", borderRadius: "16px", padding: "1.75rem", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "200px" }}
          >
            <div>
              <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Ücretsiz Danışma</p>
              <h3 style={{ color: "#fff", fontSize: "1.125rem", fontWeight: 800, marginBottom: "0.5rem", fontFamily: "var(--font-heading)" }}>Hangi branş sana uygun?</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem", lineHeight: 1.6 }}>Uzmanlarımızla ücretsiz danışma seansı al, hedefine en uygun programı bul.</p>
            </div>
            <Link
              href="/hizmetler"
              style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.75rem", background: "#6A0D25", color: "#fff", fontSize: "0.875rem", fontWeight: 700, borderRadius: "12px", border: "1px solid rgba(212,175,55,0.3)", textDecoration: "none" }}
            >
              Tüm Hizmetleri Gör <ArrowRight style={{ width: "16px", height: "16px" }} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
