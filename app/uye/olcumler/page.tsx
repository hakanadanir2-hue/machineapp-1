"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Activity } from "lucide-react";

interface Measurement {
  id: string;
  weight_kg: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  arm_cm: number | null;
  leg_cm: number | null;
  body_fat_pct: number | null;
  measured_at: string;
}

const FIELDS: { key: keyof Omit<Measurement, "id" | "measured_at">; label: string; unit: string }[] = [
  { key: "weight_kg",    label: "Kilo",          unit: "kg" },
  { key: "chest_cm",     label: "Göğüs",         unit: "cm" },
  { key: "waist_cm",     label: "Bel",            unit: "cm" },
  { key: "hip_cm",       label: "Kalça",          unit: "cm" },
  { key: "arm_cm",       label: "Kol",            unit: "cm" },
  { key: "leg_cm",       label: "Bacak",          unit: "cm" },
  { key: "body_fat_pct", label: "Yağ Oranı",     unit: "%" },
];

export default function OlcumlerPage() {
  const supabase = createClient();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState<Record<string, string>>({});
  const [memberId, setMemberId] = useState<string>("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setMemberId(session.user.id);
      const { data } = await supabase
        .from("measurements")
        .select("*")
        .eq("member_id", session.user.id)
        .order("measured_at", { ascending: false })
        .limit(20);
      setMeasurements((data as Measurement[]) ?? []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleSave() {
    setSaving(true);
    const payload: Record<string, number | string> = { member_id: memberId };
    FIELDS.forEach(({ key }) => {
      if (form[key]) payload[key] = parseFloat(form[key]);
    });
    if (form.measured_at) payload.measured_at = form.measured_at;

    const { data, error } = await supabase.from("measurements").insert(payload).select().single();
    if (!error && data) {
      setMeasurements((prev) => [data as Measurement, ...prev]);
      setShowForm(false);
      setForm({});
    }
    setSaving(false);
  }

  const latest = measurements[0];
  const prev   = measurements[1];

  function diff(key: keyof Omit<Measurement, "id" | "measured_at">) {
    if (!latest || !prev) return null;
    const a = latest[key] as number | null;
    const b = prev[key] as number | null;
    if (a == null || b == null) return null;
    return +(a - b).toFixed(2);
  }

  if (loading) return <div style={{ color: "rgba(255,255,255,.3)", padding: 40 }}>Yükleniyor...</div>;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* Başlık */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Ölçümlerim</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>Vücut ölçüm takibi</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "9px 16px",
          background: "#C9A84C", color: "#0B0B0B", border: "none",
          borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer",
        }}>
          <Plus size={15} />
          Ölçüm Ekle
        </button>
      </div>

      {/* Yeni ölçüm formu */}
      {showForm && (
        <div style={{ background: "#141414", border: "1px solid rgba(201,168,76,.25)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Yeni Ölçüm</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {FIELDS.map(({ key, label, unit }) => (
              <div key={key}>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 4 }}>
                  {label} ({unit})
                </label>
                <input
                  type="number" step="0.1"
                  value={form[key] ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder="—"
                  style={{
                    width: "100%", padding: "9px 12px", background: "#1A1A1A",
                    border: "1px solid rgba(255,255,255,.1)", borderRadius: 8,
                    color: "#fff", fontSize: 13, outline: "none",
                  }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 4 }}>Tarih</label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                value={form.measured_at ?? new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm((f) => ({ ...f, measured_at: e.target.value }))}
                style={{
                  width: "100%", padding: "9px 12px", background: "#1A1A1A",
                  border: "1px solid rgba(255,255,255,.1)", borderRadius: 8,
                  color: "#fff", fontSize: 13, outline: "none",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleSave} disabled={saving} style={{
              padding: "9px 20px", background: "#C9A84C", color: "#0B0B0B",
              border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
              opacity: saving ? 0.6 : 1,
            }}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button onClick={() => { setShowForm(false); setForm({}); }} style={{
              padding: "9px 20px", background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.5)",
              border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, fontSize: 13, cursor: "pointer",
            }}>
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Son ölçüm kartları */}
      {latest ? (
        <>
          <div style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>
              Son ölçüm: {new Date(latest.measured_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 24 }}>
            {FIELDS.map(({ key, label, unit }) => {
              const val = latest[key] as number | null;
              const d   = diff(key);
              if (val == null) return null;
              return (
                <div key={key} style={{ background: "#141414", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{val} <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,.3)" }}>{unit}</span></div>
                  {d !== null && (
                    <div style={{ fontSize: 11, color: d < 0 ? "#4ade80" : d > 0 ? "#f87171" : "rgba(255,255,255,.3)", marginTop: 4 }}>
                      {d > 0 ? "+" : ""}{d} {unit} (önceki)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Activity size={48} color="rgba(255,255,255,.15)" style={{ marginBottom: 16 }} />
          <p style={{ color: "rgba(255,255,255,.35)", fontSize: 14 }}>Henüz ölçüm kaydedilmedi</p>
        </div>
      )}

      {/* Ölçüm geçmişi */}
      {measurements.length > 1 && (
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 12 }}>Geçmiş Ölçümler</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {measurements.slice(1).map((m) => (
              <div key={m.id} style={{ background: "#141414", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>
                  {new Date(m.measured_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <div style={{ display: "flex", gap: 16 }}>
                  {m.weight_kg != null && <span style={{ fontSize: 13, color: "#fff" }}>{m.weight_kg} kg</span>}
                  {m.body_fat_pct != null && <span style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>%{m.body_fat_pct} yağ</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
