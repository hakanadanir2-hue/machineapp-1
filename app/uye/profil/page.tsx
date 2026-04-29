"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, User } from "lucide-react";

interface MemberProfile {
  full_name: string;
  phone: string;
  birth_date: string;
  gender: string;
  height_cm: string;
  goal: string;
  membership_start: string;
  membership_end: string;
  email: string;
}

const GOALS = [
  "Kilo vermek",
  "Kas kazanmak",
  "Vücut geliştirme",
  "Kondisyon artırmak",
  "Genel sağlık",
  "Sporcu performansı",
];

export default function ProfilPage() {
  const supabase = createClient();
  const [form, setForm]       = useState<Partial<MemberProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [memberId, setMemberId] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setMemberId(session.user.id);
      const { data } = await supabase
        .from("members")
        .select("full_name, phone, birth_date, gender, height_cm, goal, membership_start, membership_end, email")
        .eq("id", session.user.id)
        .single();
      if (data) setForm(data as Partial<MemberProfile>);
      else setForm({ email: session.user.email ?? "" });
      setLoading(false);
    }
    load();
  }, [supabase]);

  function update(key: keyof MemberProfile, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const payload: Record<string, unknown> = { ...form };
    // Sayısal alanlar
    if (form.height_cm) payload.height_cm = parseFloat(form.height_cm);

    await supabase.from("members").upsert({ id: memberId, ...payload });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const inputStyle = {
    width: "100%", padding: "10px 14px", background: "#1A1A1A",
    border: "1px solid rgba(255,255,255,.1)", borderRadius: 10,
    color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" as const,
  };

  const labelStyle = { fontSize: 12, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 5 };

  if (loading) return <div style={{ color: "rgba(255,255,255,.3)", padding: 40 }}>Yükleniyor...</div>;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      {/* Avatar */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28, gap: 12 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#C9A84C", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <User size={32} color="#0B0B0B" />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{form.full_name || "Profilim"}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>{form.email}</div>
        </div>
      </div>

      {/* Üyelik durumu */}
      {(form.membership_start || form.membership_end) && (
        <div style={{ background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 24, display: "flex", gap: 24 }}>
          {form.membership_start && (
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>Başlangıç</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                {new Date(form.membership_start).toLocaleDateString("tr-TR")}
              </div>
            </div>
          )}
          {form.membership_end && (
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>Bitiş</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#C9A84C" }}>
                {new Date(form.membership_end).toLocaleDateString("tr-TR")}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Kişisel Bilgiler</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Ad Soyad</label>
            <input style={inputStyle} value={form.full_name ?? ""} onChange={(e) => update("full_name", e.target.value)} placeholder="Ad Soyad" />
          </div>

          <div>
            <label style={labelStyle}>Telefon</label>
            <input style={inputStyle} value={form.phone ?? ""} onChange={(e) => update("phone", e.target.value)} placeholder="+90 5xx" />
          </div>

          <div>
            <label style={labelStyle}>Doğum Tarihi</label>
            <input type="date" style={inputStyle} value={form.birth_date ?? ""} onChange={(e) => update("birth_date", e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Cinsiyet</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.gender ?? ""} onChange={(e) => update("gender", e.target.value)}>
              <option value="">Seçiniz</option>
              <option value="erkek">Erkek</option>
              <option value="kadın">Kadın</option>
              <option value="diğer">Diğer</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Boy (cm)</label>
            <input type="number" style={inputStyle} value={form.height_cm ?? ""} onChange={(e) => update("height_cm", e.target.value)} placeholder="175" />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Hedef</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.goal ?? ""} onChange={(e) => update("goal", e.target.value)}>
              <option value="">Hedef seçiniz</option>
              {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "11px 24px", background: saved ? "#4ade80" : "#C9A84C",
            color: "#0B0B0B", border: "none", borderRadius: 10,
            fontWeight: 700, fontSize: 14, cursor: "pointer",
            opacity: saving ? 0.7 : 1, transition: "background .3s",
          }}
        >
          <Save size={15} />
          {saving ? "Kaydediliyor..." : saved ? "Kaydedildi!" : "Değişiklikleri Kaydet"}
        </button>
      </div>
    </div>
  );
}
