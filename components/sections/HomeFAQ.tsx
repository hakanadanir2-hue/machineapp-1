"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  { q: "Deneme antrenmanı ücretsiz mi?", a: "Evet, ilk deneme antrenmanınız tamamen ücretsizdir. Randevu alarak salonu ziyaret edebilir, eğitmenlerimizle tanışabilir ve karar verebilirsiniz." },
  { q: "Hangi yaş aralığı için uygundur?", a: "16 yaşından itibaren tüm yaş gruplarına hizmet veriyoruz. 16-18 yaş arası üyelerimiz için veli onayı gerekmektedir." },
  { q: "Kontratsız üyelik mevcut mu?", a: "Evet, aylık üyelik seçeneğimizde herhangi bir sözleşme taahhüdü bulunmamaktadır." },
  { q: "Personal trainer ücretleri nedir?", a: "PT seanslarımız için detaylı fiyat bilgisini Fiyatlar sayfamızda veya WhatsApp hattımızdan öğrenebilirsiniz." },
  { q: "Salonun giriş saatleri nedir?", a: "Pazartesi–Cumartesi 08:00–22:00, Pazar 09:00–18:00 saatleri arasında hizmet veriyoruz." },
  { q: "Soyunma odası ve duş var mı?", a: "Evet, erkek ve kadın için ayrı soyunma odaları, duşlar ve emanet dolaplarımız mevcuttur." },
];

export default function HomeFAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section style={{ padding: "5rem 0", background: "#0B0B0B" }}>
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p style={{ color: "#D4AF37", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Sık Sorulan</p>
          <h2 style={{ fontSize: "clamp(1.875rem,4vw,3rem)", fontWeight: 700, color: "#fff", fontFamily: "var(--font-heading)" }}>Sorular</h2>
        </motion.div>
        <div style={{ maxWidth: "48rem", marginInline: "auto" }}>
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "0.75rem", overflow: "hidden", marginBottom: "0.5rem" }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", textAlign: "left", gap: "1rem", cursor: "pointer", background: "none", border: "none" }}>
                <span style={{ color: "#fff", fontWeight: 500, fontSize: "0.9375rem" }}>{faq.q}</span>
                <div style={{ flexShrink: 0, color: "#D4AF37" }}>
                  {open === i ? <Minus style={{ width: "1rem", height: "1rem" }} /> : <Plus style={{ width: "1rem", height: "1rem" }} />}
                </div>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                    <p style={{ padding: "0 1.25rem 1rem", color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", lineHeight: 1.65, borderTop: "1px solid #2A2A2A", paddingTop: "0.75rem" }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
