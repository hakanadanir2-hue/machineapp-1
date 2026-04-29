"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Utensils, MessageCircle } from "lucide-react";

const MEAL_TYPES = ["kahvaltı", "öğle", "akşam", "ara"] as const;
type MealType = typeof MEAL_TYPES[number];

const MEAL_ICONS: Record<MealType, string> = {
  kahvaltı: "🥞",
  öğle:     "🥗",
  akşam:    "🍽️",
  ara:      "🍎",
};

interface FoodLog {
  id: string;
  meal_type: MealType;
  notes: string | null;
  trainer_comment: string | null;
  logged_at: string;
  photo_url: string | null;
}

export default function BeslenmePage() {
  const supabase = createClient();
  const [logs, setLogs]         = useState<FoodLog[]>([]);
  const [loading, setLoading]   = useState(true);
  const [memberId, setMemberId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState<{ meal_type: MealType; notes: string }>({ meal_type: "kahvaltı", notes: "" });

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setMemberId(session.user.id);
      const { data } = await supabase
        .from("food_logs")
        .select("id, meal_type, notes, trainer_comment, logged_at, photo_url")
        .eq("member_id", session.user.id)
        .order("logged_at", { ascending: false })
        .limit(30);
      setLogs((data as FoodLog[]) ?? []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleSave() {
    setSaving(true);
    const { data, error } = await supabase
      .from("food_logs")
      .insert({ member_id: memberId, meal_type: form.meal_type, notes: form.notes || null })
      .select()
      .single();
    if (!error && data) {
      setLogs((prev) => [data as FoodLog, ...prev]);
      setShowForm(false);
      setForm({ meal_type: "kahvaltı", notes: "" });
    }
    setSaving(false);
  }

  // Bugünün logları
  const today = new Date().toISOString().split("T")[0];
  const todayLogs = logs.filter((l) => l.logged_at.startsWith(today));
  const pastLogs  = logs.filter((l) => !l.logged_at.startsWith(today));

  if (loading) return <div style={{ color: "rgba(255,255,255,.3)", padding: 40 }}>Yükleniyor...</div>;

  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Beslenme Günlüğü</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>Öğünlerini takip et</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "9px 16px",
          background: "#C9A84C", color: "#0B0B0B", border: "none",
          borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer",
        }}>
          <Plus size={15} />
          Öğün Ekle
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: "#141414", border: "1px solid rgba(201,168,76,.25)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Yeni Öğün</h3>

          {/* Öğün tipi */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {MEAL_TYPES.map((mt) => (
              <button
                key={mt}
                onClick={() => setForm((f) => ({ ...f, meal_type: mt }))}
                style={{
                  padding: "8px 14px", borderRadius: 9, fontWeight: 600, fontSize: 12,
                  background: form.meal_type === mt ? "#C9A84C" : "rgba(255,255,255,.06)",
                  color: form.meal_type === mt ? "#0B0B0B" : "rgba(255,255,255,.5)",
                  border: form.meal_type === mt ? "none" : "1px solid rgba(255,255,255,.1)",
                  cursor: "pointer",
                }}
              >
                {MEAL_ICONS[mt]} {mt}
              </button>
            ))}
          </div>

          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Ne yedin? (isteğe bağlı)"
            rows={3}
            style={{
              width: "100%", padding: "10px 14px", background: "#1A1A1A",
              border: "1px solid rgba(255,255,255,.1)", borderRadius: 10,
              color: "#fff", fontSize: 13, outline: "none", resize: "vertical",
              boxSizing: "border-box",
            }}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={handleSave} disabled={saving} style={{
              padding: "9px 20px", background: "#C9A84C", color: "#0B0B0B",
              border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
              opacity: saving ? 0.6 : 1,
            }}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button onClick={() => setShowForm(false)} style={{
              padding: "9px 20px", background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.5)",
              border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, fontSize: 13, cursor: "pointer",
            }}>
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Bugünkü öğünler */}
      {todayLogs.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Bugün</h2>
          <LogList logs={todayLogs} />
        </div>
      )}

      {/* Geçmiş */}
      {pastLogs.length > 0 && (
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Geçmiş</h2>
          <LogList logs={pastLogs} />
        </div>
      )}

      {logs.length === 0 && !showForm && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Utensils size={48} color="rgba(255,255,255,.15)" style={{ marginBottom: 16 }} />
          <p style={{ color: "rgba(255,255,255,.35)", fontSize: 14 }}>Henüz öğün kaydı yok</p>
        </div>
      )}
    </div>
  );
}

function LogList({ logs }: { logs: FoodLog[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {logs.map((log) => (
        <div key={log.id} style={{ background: "#141414", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: log.notes || log.trainer_comment ? 8 : 0 }}>
            <span style={{ fontSize: 20 }}>{MEAL_ICONS[log.meal_type]}</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", textTransform: "capitalize" }}>{log.meal_type}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginLeft: 8 }}>
                {new Date(log.logged_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
          {log.notes && <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", margin: "0 0 8px", lineHeight: 1.5 }}>{log.notes}</p>}
          {log.trainer_comment && (
            <div style={{ background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 8, padding: "8px 12px", display: "flex", gap: 8, alignItems: "flex-start" }}>
              <MessageCircle size={13} color="#C9A84C" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: "#C9A84C", margin: 0, lineHeight: 1.5 }}>{log.trainer_comment}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
