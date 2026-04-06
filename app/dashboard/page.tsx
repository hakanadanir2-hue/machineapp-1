"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Dumbbell, Salad, Zap, Building2, ClipboardList, CheckCircle } from "lucide-react";

const CARDS = [
  {
    tip: "fitness",
    iconBg: "#7A0D2A",
    icon: <Dumbbell size={26} color="#fff" />,
    title: "Fitness Programı",
    badge: "En Çok Tercih Edilen",
    desc: "885 egzersizlik kütüphanemizden uzmanımız tarafından size özel hazırlanan haftalık antrenman planı. Ağırlık, kardiyo, dinlenme dengesi tamamen hedefinize göre kurgulanır.",
    oldPrice: "₺799",
    price: "₺499",
    cta: "Fitness Programı Al →",
    borderColor: "rgba(122,13,42,0.45)",
    bg: "rgba(122,13,42,0.08)",
  },
  {
    tip: "beslenme",
    iconBg: "#1A6A2A",
    icon: <Salad size={26} color="#fff" />,
    title: "Beslenme Programı",
    badge: null,
    desc: "Vücut ölçülerinize göre hesaplanan günlük kalori ve makro hedefleri, haftalık öğün planı. Diyetisyen kalitesinde, sporcu perspektifiyle hazırlanır.",
    oldPrice: "₺799",
    price: "₺499",
    cta: "Beslenme Programı Al →",
    borderColor: "rgba(26,106,42,0.35)",
    bg: "rgba(26,106,42,0.06)",
  },
  {
    tip: "combo",
    iconBg: "#D4AF37",
    icon: <Zap size={26} color="#1A1A1A" />,
    title: "Fitness + Beslenme",
    badge: "🔥 Çift Program",
    desc: "Antrenman ve beslenme planını birlikte alın — ikisi birbirini tamamlar, sonuçlar katlanır. En hızlı ilerleme için en akıllı seçim.",
    oldPrice: "₺1.299",
    price: "₺799",
    cta: "Combo Paket Al →",
    borderColor: "rgba(212,175,55,0.45)",
    bg: "rgba(212,175,55,0.06)",
  },
];

function DashboardContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, active: 0 });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("odeme") === "basarili") setShowSuccess(true);

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUserName(session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "");
      const { data } = await supabase.from("programs").select("status").eq("user_id", session.user.id);
      if (data) {
        setStats({
          total:    data.length,
          pending:  data.filter((p) => p.status === "pending").length,
          approved: data.filter((p) => p.status === "approved").length,
          active:   data.filter((p) => p.status === "active").length,
        });
      }
      setLoading(false);
    }
    load();
  }, [supabase, searchParams]);

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      {showSuccess && (
        <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <CheckCircle size={20} color="#4ade80" />
          <div>
            <div style={{ fontWeight: 700, color: "#4ade80", fontSize: 14 }}>Ödemeniz alındı! 🎉</div>
            <div style={{ color: "rgba(255,255,255,.4)", fontSize: 12, marginTop: 2 }}>Programınız uzmanımız tarafından hazırlanıp e-posta ile PDF olarak gönderilecek.</div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
          Merhaba{userName ? `, ${userName.split(" ")[0]}` : ""} 👋
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>Kişisel fitness paneline hoş geldin</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 32 }}>
        {[
          { label: "Toplam Program", value: loading ? "—" : stats.total,    color: "#fff" },
          { label: "Onay Bekliyor",  value: loading ? "—" : stats.pending,  color: "#facc15" },
          { label: "Onaylandı",      value: loading ? "—" : stats.approved, color: "#4ade80" },
          { label: "Aktif Program",  value: loading ? "—" : stats.active,   color: "#60a5fa" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#141414", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Kişisel Program Al</h2>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)", margin: 0 }}>Uzmanımız tarafından hazırlanan program e-postayla PDF olarak gönderilir.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
        {CARDS.map((c) => (
          <Link key={c.tip} href={`/program-al?tip=${c.tip}`} style={{ textDecoration: "none" }}>
            <div style={{ background: c.bg, border: `1px solid ${c.borderColor}`, borderRadius: 16, padding: "20px 22px", display: "flex", alignItems: "flex-start", gap: 18, cursor: "pointer" }}>
              <div style={{ width: 52, height: 52, background: c.iconBg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {c.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>{c.title}</span>
                  {c.badge && <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(212,175,55,0.15)", color: "#D4AF37", padding: "2px 8px", borderRadius: 5 }}>{c.badge}</span>}
                </div>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.45)", lineHeight: 1.65, margin: "0 0 14px" }}>{c.desc}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,.25)", textDecoration: "line-through" }}>{c.oldPrice}</span>
                    <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{c.price}</span>
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: c.iconBg === "#D4AF37" ? "#1A1A1A" : "#fff", background: c.iconBg, padding: "8px 18px", borderRadius: 9 }}>{c.cta}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Link href="/fiyatlar" style={{ textDecoration: "none" }}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ width: 40, height: 40, background: "rgba(96,165,250,.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={20} color="#60a5fa" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 3 }}>Salon Üyeliği Al</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", lineHeight: 1.5 }}>Aylık ve dönemsel üyelik paketlerini incele</div>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/programlarim" style={{ textDecoration: "none" }}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ width: 40, height: 40, background: "rgba(212,175,55,.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ClipboardList size={20} color="#D4AF37" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 3 }}>Programlarım</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", lineHeight: 1.5 }}>Oluşturulan ve aktif programlarını görüntüle</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ color: "rgba(255,255,255,.35)", padding: 40 }}>Yükleniyor...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
