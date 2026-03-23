"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Faq { id: string; question: string; answer: string; category: string; }

export default function SssClient({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<string | null>(null);

  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <main style={{ minHeight: "100vh", background: "#0B0B0B" }}>
      <div style={{ paddingTop: "96px", paddingBottom: "3.5rem", background: "linear-gradient(to bottom, #111, #0B0B0B)", borderBottom: "1px solid rgba(106,13,37,0.15)" }}>
        <div className="page-container" style={{ textAlign: "center" }}>
          <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Yardım</p>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)", marginBottom: "1rem" }}>Sık Sorulan Sorular</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", maxWidth: "32rem", marginInline: "auto", lineHeight: 1.7 }}>
            Aradığınız cevabı bulamazsanız bize ulaşın.
          </p>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: "3.5rem", paddingBottom: "5rem", maxWidth: 780 }}>
        {categories.map((cat) => {
          const items = faqs.filter((f) => f.category === cat);
          return (
            <div key={cat} style={{ marginBottom: "2.5rem" }}>
              <h2 style={{ color: "#D4AF37", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>{cat}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((faq) => (
                  <div key={faq.id} style={{ background: "#141414", border: `1px solid ${open === faq.id ? "rgba(106,13,37,0.4)" : "#2A2A2A"}`, borderRadius: 14, overflow: "hidden", transition: "border-color .2s" }}>
                    <button onClick={() => setOpen(open === faq.id ? null : faq.id)} style={{ width: "100%", background: "none", border: "none", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 12 }}>
                      <span style={{ color: "#fff", fontWeight: 600, fontSize: 14, textAlign: "left", lineHeight: 1.4 }}>{faq.question}</span>
                      {open === faq.id ? <ChevronUp size={16} color="rgba(255,255,255,.4)" style={{ flexShrink: 0 }} /> : <ChevronDown size={16} color="rgba(255,255,255,.4)" style={{ flexShrink: 0 }} />}
                    </button>
                    {open === faq.id && (
                      <div style={{ padding: "0 1.25rem 1rem", color: "rgba(255,255,255,.55)", fontSize: 14, lineHeight: 1.7, borderTop: "1px solid rgba(255,255,255,.05)" }}>
                        <p style={{ margin: "0.75rem 0 0" }}>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: "3rem", background: "rgba(106,13,37,0.08)", border: "1px solid rgba(106,13,37,0.2)", borderRadius: 18, padding: "2.5rem", textAlign: "center" }}>
          <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", fontFamily: "var(--font-heading)", marginBottom: "0.5rem" }}>Başka sorunuz mu var?</h3>
          <p style={{ color: "rgba(255,255,255,.45)", fontSize: 14, marginBottom: "1.5rem" }}>Bize ulaşın, en kısa sürede yanıtlayalım.</p>
          <Link href="/iletisim" style={{ display: "inline-block", padding: "0.75rem 2rem", background: "#6A0D25", color: "#fff", fontWeight: 700, fontSize: 14, borderRadius: 12, border: "1px solid rgba(212,175,55,.3)", textDecoration: "none" }}>
            İletişime Geç
          </Link>
        </div>
      </div>
    </main>
  );
}
