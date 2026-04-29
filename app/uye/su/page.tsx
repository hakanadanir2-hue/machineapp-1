"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Droplets, Plus, Minus } from "lucide-react";

const QUICK_AMOUNTS = [150, 200, 250, 330, 500];
const DAILY_GOAL_ML = 2500;

export default function SuPage() {
  const supabase = createClient();
  const [amount, setAmount]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [memberId, setMemberId] = useState("");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setMemberId(session.user.id);
      const { data } = await supabase
        .from("water_logs")
        .select("amount_ml")
        .eq("member_id", session.user.id)
        .eq("logged_at", today)
        .maybeSingle();
      setAmount(data?.amount_ml ?? 0);
      setLoading(false);
    }
    load();
  }, [supabase, today]);

  async function addWater(ml: number) {
    const newAmount = Math.max(0, amount + ml);
    setSaving(true);
    const { error } = await supabase
      .from("water_logs")
      .upsert({ member_id: memberId, logged_at: today, amount_ml: newAmount }, { onConflict: "member_id,logged_at" });
    if (!error) setAmount(newAmount);
    setSaving(false);
  }

  const pct = Math.min(100, Math.round((amount / DAILY_GOAL_ML) * 100));
  const glasses = Math.round(amount / 200); // 200ml = 1 bardak yaklaşık

  if (loading) return <div style={{ color: "rgba(255,255,255,.3)", padding: 40 }}>Yükleniyor...</div>;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Su Takibi</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>
          {new Date(today).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Büyük gösterge */}
      <div style={{
        background: "#141414", border: "1px solid rgba(96,165,250,.2)",
        borderRadius: 20, padding: 28, marginBottom: 24, textAlign: "center",
      }}>
        <div style={{
          width: 120, height: 120, borderRadius: "50%", margin: "0 auto 16px",
          background: `conic-gradient(#60a5fa ${pct * 3.6}deg, rgba(255,255,255,.06) 0deg)`,
          display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        }}>
          <div style={{
            width: 96, height: 96, borderRadius: "50%", background: "#141414",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <Droplets size={22} color="#60a5fa" />
            <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginTop: 4 }}>%{pct}</span>
          </div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#60a5fa", marginBottom: 4 }}>
          {amount} <span style={{ fontSize: 14, color: "rgba(255,255,255,.4)", fontWeight: 400 }}>ml</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>
          Hedef: {DAILY_GOAL_ML} ml &nbsp;·&nbsp; ~{glasses} bardak
        </div>

        {pct >= 100 && (
          <div style={{ marginTop: 12, padding: "8px 16px", background: "rgba(96,165,250,.1)", border: "1px solid rgba(96,165,250,.3)", borderRadius: 8, fontSize: 13, color: "#60a5fa", fontWeight: 600 }}>
            Günlük hedefe ulaştın!
          </div>
        )}
      </div>

      {/* Hızlı ekle */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 10 }}>Hızlı Ekle</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {QUICK_AMOUNTS.map((ml) => (
            <button
              key={ml}
              onClick={() => addWater(ml)}
              disabled={saving}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "9px 14px",
                background: "rgba(96,165,250,.08)", border: "1px solid rgba(96,165,250,.2)",
                borderRadius: 10, color: "#60a5fa", fontWeight: 700, fontSize: 13, cursor: "pointer",
                opacity: saving ? 0.5 : 1,
              }}
            >
              <Plus size={13} />
              {ml} ml
            </button>
          ))}
        </div>
      </div>

      {/* Manuel ekle/çıkar */}
      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 20 }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 12 }}>Manuel Ayarla</p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
          <button
            onClick={() => addWater(-100)}
            disabled={saving || amount === 0}
            style={{
              width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "rgba(255,255,255,.5)",
            }}
          >
            <Minus size={18} />
          </button>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,.5)", fontWeight: 600 }}>100 ml</div>
          <button
            onClick={() => addWater(100)}
            disabled={saving}
            style={{
              width: 44, height: 44, borderRadius: "50%", background: "#60a5fa",
              border: "none", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#0B0B0B",
            }}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
