"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Star, MessageCircle } from "lucide-react";

const fitnessPacks = [
  {
    name: "Aylık",
    price: "2.000",
    period: "/ 1 ay",
    note: null,
    features: [
      "Sınırsız Fitness Erişimi",
      "Soyunma Odası & Duş",
      ,
      "Ücretsiz Program Danışması",
    ],
    popular: false,
  },
  {
    name: "3 Aylık",
    price: "4.200",
    period: "/ 3 ay",
    note: "Aylık yalnızca ₺1.400",
    features: [
      "Sınırsız Fitness Erişimi",
      "Soyunma Odası & Duş",
      ,
      "1 Ücretsiz PT Seansı",
      "Vücut Ölçüm Analizi",
    ],
    popular: true,
  },
  {
    name: "6 Aylık",
    price: "7.000",
    period: "/ 6 ay",
    note: "Aylık yalnızca ₺1.166",
    features: [
      "Sınırsız Fitness Erişimi",
      "Soyunma Odası & Duş",
      ,
      "2 Ücretsiz PT Seansı",
      "Vücut Ölçüm Analizi",
      "Beslenme Danışması",
    ],
    popular: false,
  },
];

const ptPacks = [
  { name: "10 Seans", price: "9.000", per: "Seans başı ₺900", popular: false },
  { name: "15 Seans", price: "12.000", per: "Seans başı ₺800 — En iyi değer", popular: true },
  { name: "20 Seans", price: "14.000", per: "Seans başı ₺700", popular: false },
];

const boksPacks = [
  { name: "8 Seans", price: "8.500", per: "Seans başı ₺1.063", popular: false },
  { name: "12 Seans", price: "9.500", per: "Seans başı ₺792 — En iyi değer", popular: true },
];

function SectionTitle({ label, title }: { label: string; title: string }) {
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: "3px", height: "24px", background: "#D4AF37", borderRadius: "9999px", flexShrink: 0 }} />
        <div>
          <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>{label}</p>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", fontFamily: "var(--font-heading)" }}>{title}</h2>
        </div>
      </div>
    </div>
  );
}

export interface PricingPlanData {
  id: string;
  name: string;
  category: string;
  price: number;
  discounted_price: number | null;
  description: string | null;
  features: string[] | null;
  is_popular: boolean;
  is_active: boolean;
  order_index: number;
}

interface PricingProps {
  plans?: PricingPlanData[];
  whatsapp?: string;
}

export default function Pricing({ plans, whatsapp = "903742701455" }: PricingProps) {
  const wa = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Merhaba, üyelik ve fiyatlar hakkında bilgi almak istiyorum.")}`;
  const waReceipt = (name: string, price: string) =>
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Merhaba, ${name} paketini (₺${price}) satın aldım. Ödeme dekontumu iletiyorum.`)}`;

  const activePlans = plans?.filter(p => p.is_active) ?? [];
  const dbFitness = activePlans.filter(p => p.category === "fitness");
  const dbPT = activePlans.filter(p => p.category === "pt");
  const dbBoks = activePlans.filter(p => p.category === "boks");
  const dbKampanya = activePlans.filter(p => p.category === "kampanya");

  const useFitness = dbFitness.length > 0 ? dbFitness.map(p => ({
    name: p.name, price: p.price.toLocaleString("tr-TR"), period: "",
    note: p.description,
    features: (p.features ?? []).filter(f => f && !/sauna/i.test(f)),
    popular: p.is_popular,
  })) : fitnessPacks;

  const usePT = dbPT.length > 0 ? dbPT.map(p => ({
    name: p.name, price: p.price.toLocaleString("tr-TR"), per: p.description ?? "", popular: p.is_popular,
  })) : ptPacks;

  const useBoks = dbBoks.length > 0 ? dbBoks.map(p => ({
    name: p.name, price: p.price.toLocaleString("tr-TR"), per: p.description ?? "", popular: p.is_popular,
  })) : boksPacks;

  const useCampaigns = dbKampanya;

  return (
    <div className="page-container" style={{ paddingTop: "1.5rem", paddingBottom: "5rem" }}>

      {/* Fitness Plans */}
      <section style={{ marginBottom: "3.5rem" }}>
        <SectionTitle label="Üyelik" title="Fitness Paketleri" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          {useFitness.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                borderRadius: "18px",
                padding: "1.75rem",
                background: plan.popular ? "#6A0D25" : "#1A1A1A",
                border: plan.popular ? "1px solid rgba(212,175,55,0.4)" : "1px solid #2A2A2A",
                marginTop: plan.popular ? "12px" : "0",
              }}
            >
              {plan.popular && (
                <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.875rem", background: "#D4AF37", color: "#0B0B0B", fontSize: "0.6875rem", fontWeight: 700, borderRadius: "9999px" }}>
                    <Star style={{ width: "10px", height: "10px" }} /> En Popüler
                  </span>
                </div>
              )}

              <p style={{ color: plan.popular ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "0.375rem" }}>{plan.name}</p>

              <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: plan.note ? "0.25rem" : "1.25rem" }}>
                <span style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)" }}>₺{plan.price}</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>{plan.period}</span>
              </div>

              {plan.note && (
                <p style={{ color: "#D4AF37", fontSize: "0.75rem", fontWeight: 600, marginBottom: "1.25rem" }}>{plan.note}</p>
              )}

              <ul style={{ display: "flex", flexDirection: "column", gap: "0.625rem", flex: 1, marginBottom: "1.5rem" }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                    <Check style={{ width: "15px", height: "15px", color: "#D4AF37", flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ fontSize: "0.875rem", color: plan.popular ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.6)" }}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/randevu"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "0.75rem",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  background: plan.popular ? "#D4AF37" : "#2A2A2A",
                  color: plan.popular ? "#0B0B0B" : "#fff",
                  border: plan.popular ? "none" : "1px solid #3A3A3A",
                  marginBottom: "0.5rem",
                }}
              >
                Üye Ol
              </Link>
              <a
                href={waReceipt(`${plan.name} Fitness`, plan.price)}
                target="_blank" rel="noopener noreferrer"
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0.375rem", padding:"0.5rem", borderRadius:"10px", fontSize:"0.75rem", fontWeight:600, textDecoration:"none", background:"rgba(37,211,102,0.1)", color:"#4ade80", border:"1px solid rgba(37,211,102,0.2)" }}
              >
                <MessageCircle style={{ width:"13px", height:"13px" }} />
                Ödeme Dekontu Gönder
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PT Packs */}
      <section style={{ marginBottom: "3.5rem" }}>
        <SectionTitle label="Birebir Antrenman" title="Personal Trainer Paketleri" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {usePT.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                borderRadius: "18px",
                padding: "1.75rem",
                background: p.popular ? "#6A0D25" : "#1A1A1A",
                border: p.popular ? "1px solid rgba(212,175,55,0.4)" : "1px solid #2A2A2A",
                marginTop: p.popular ? "12px" : "0",
              }}
            >
              {p.popular && (
                <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.875rem", background: "#D4AF37", color: "#0B0B0B", fontSize: "0.6875rem", fontWeight: 700, borderRadius: "9999px" }}>
                    <Star style={{ width: "10px", height: "10px" }} /> En Popüler
                  </span>
                </div>
              )}
              <p style={{ color: p.popular ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "0.375rem" }}>{p.name}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "0.375rem" }}>
                <span style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)" }}>₺{p.price}</span>
              </div>
              <p style={{ color: p.popular ? "#D4AF37" : "rgba(255,255,255,0.4)", fontSize: "0.8125rem", marginBottom: "1.5rem", flex: 1 }}>{p.per}</p>
              <Link
                href="/randevu"
                style={{ display: "block", textAlign: "center", padding: "0.75rem", borderRadius: "12px", fontSize: "0.875rem", fontWeight: 700, textDecoration: "none", background: p.popular ? "#D4AF37" : "#2A2A2A", color: p.popular ? "#0B0B0B" : "#fff", border: p.popular ? "none" : "1px solid #3A3A3A", marginBottom: "0.5rem" }}
              >
                Rezerve Et
              </Link>
              <a
                href={waReceipt(`PT ${p.name}`, p.price)}
                target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", padding: "0.5rem", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none", background: "rgba(37,211,102,0.1)", color: "#4ade80", border: "1px solid rgba(37,211,102,0.2)" }}
              >
                <MessageCircle style={{ width: "13px", height: "13px" }} />
                Ödeme Dekontu Gönder
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Boks Packs */}
      <section style={{ marginBottom: "3.5rem" }}>
        <SectionTitle label="Dövüş Sporları" title="Boks / Kickboks / Muay Thai" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {useBoks.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                borderRadius: "18px",
                padding: "1.75rem",
                background: p.popular ? "#6A0D25" : "#1A1A1A",
                border: p.popular ? "1px solid rgba(212,175,55,0.4)" : "1px solid #2A2A2A",
                marginTop: p.popular ? "12px" : "0",
              }}
            >
              {p.popular && (
                <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.875rem", background: "#D4AF37", color: "#0B0B0B", fontSize: "0.6875rem", fontWeight: 700, borderRadius: "9999px" }}>
                    <Star style={{ width: "10px", height: "10px" }} /> En Popüler
                  </span>
                </div>
              )}
              <p style={{ color: p.popular ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "0.375rem" }}>{p.name}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "0.375rem" }}>
                <span style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)" }}>₺{p.price}</span>
              </div>
              <p style={{ color: p.popular ? "#D4AF37" : "rgba(255,255,255,0.4)", fontSize: "0.8125rem", marginBottom: "1.5rem", flex: 1 }}>{p.per}</p>
              <Link
                href="/randevu"
                style={{ display: "block", textAlign: "center", padding: "0.75rem", borderRadius: "12px", fontSize: "0.875rem", fontWeight: 700, textDecoration: "none", background: p.popular ? "#D4AF37" : "#2A2A2A", color: p.popular ? "#0B0B0B" : "#fff", border: p.popular ? "none" : "1px solid #3A3A3A", marginBottom: "0.5rem" }}
              >
                Rezerve Et
              </Link>
              <a
                href={waReceipt(`Boks ${p.name}`, p.price)}
                target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", padding: "0.5rem", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none", background: "rgba(37,211,102,0.1)", color: "#4ade80", border: "1px solid rgba(37,211,102,0.2)" }}
              >
                <MessageCircle style={{ width: "13px", height: "13px" }} />
                Ödeme Dekontu Gönder
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Campaigns */}
      <section style={{ marginBottom: "3.5rem" }}>
        <SectionTitle label="Özel Teklifler" title="Kampanyalar" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          <div style={{ background: "#1A1A1A", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "18px", padding: "1.75rem" }}>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.625rem" }}>Kampanya</p>
            <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", fontFamily: "var(--font-heading)", marginBottom: "0.5rem" }}>4 Al 5 Öde</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "0.75rem" }}>
              4 aylık üyelik al, 5. ay <strong style={{ color: "#fff" }}>hediyemizden</strong> yararlansın — sadece <strong style={{ color: "#D4AF37", fontSize: "1.1em" }}>₺5.200</strong>!
            </p>
            <div style={{ marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "2rem", fontWeight: 800, color: "#D4AF37", fontFamily: "var(--font-heading)" }}>₺5.200</span>
            </div>
            <Link href="/randevu" style={{ display: "inline-block", padding: "0.75rem 1.5rem", background: "#6A0D25", color: "#fff", fontSize: "0.875rem", fontWeight: 700, borderRadius: "12px", border: "1px solid rgba(212,175,55,0.3)", textDecoration: "none" }}>
              Hemen Yararlan
            </Link>
          </div>

          <div style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "18px", padding: "1.75rem" }}>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.625rem" }}>Arkadaşını Getir</p>
            <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", fontFamily: "var(--font-heading)", marginBottom: "0.5rem" }}>+15 Gün Hediye</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "1.5rem" }}>
              Her getirdiğin arkadaş için üyeliğine otomatik <strong style={{ color: "#fff" }}>15 gün ücretsiz</strong> eklenir.
            </p>
            <Link href="/iletisim" style={{ display: "inline-block", padding: "0.75rem 1.5rem", background: "#2A2A2A", color: "#fff", fontSize: "0.875rem", fontWeight: 600, borderRadius: "12px", border: "1px solid #3A3A3A", textDecoration: "none" }}>
              Detaylı Bilgi Al
            </Link>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <div style={{ background: "rgba(106,13,37,0.08)", border: "1px solid rgba(106,13,37,0.2)", borderRadius: "18px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", textAlign: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9375rem" }}>Sorularınız mı var? Fiyatlar hakkında hemen bilgi alın.</p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <a href={wa} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", background: "#16a34a", color: "#fff", fontWeight: 700, fontSize: "0.875rem", borderRadius: "12px", textDecoration: "none" }}>
            <MessageCircle style={{ width: "16px", height: "16px" }} /> WhatsApp&apos;ta Sor
          </a>
          <Link href="/randevu" style={{ display: "inline-flex", alignItems: "center", padding: "0.75rem 1.5rem", background: "#6A0D25", color: "#fff", fontWeight: 700, fontSize: "0.875rem", borderRadius: "12px", border: "1px solid rgba(212,175,55,0.3)", textDecoration: "none" }}>
            Ücretsiz Deneme Al
          </Link>
        </div>
      </div>
    </div>
  );
}
