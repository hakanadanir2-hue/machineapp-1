"use client";
import { motion } from "framer-motion";

interface HomeStatsProps {
  members?: string;
  years?: string;
  trainers?: string;
}

export default function HomeStats({ members = "500+", years = "10+", trainers = "3" }: HomeStatsProps) {
  const stats = [
    { value: members, label: "Aktif Üye" },
    { value: "5", label: "Branş" },
    { value: years, label: "Yıl Deneyim" },
    { value: trainers, label: "Uzman Eğitmen" },
  ];

  return (
    <section
      style={{
        background: "rgba(106,13,37,0.07)",
        borderTop: "1px solid rgba(106,13,37,0.18)",
        borderBottom: "1px solid rgba(106,13,37,0.18)",
        padding: "2.5rem 0",
      }}
    >
      <div className="page-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1rem",
          }}
          className="stats-grid"
        >
          <style>{`
            @media (min-width: 640px) {
              .stats-grid {
                grid-template-columns: repeat(4, 1fr) !important;
              }
            }
          `}</style>
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{ textAlign: "center", padding: "0.5rem" }}
            >
              <p
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                  fontWeight: 800,
                  color: "#D4AF37",
                  fontFamily: "var(--font-heading)",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.8125rem",
                  marginTop: "0.375rem",
                }}
              >
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
