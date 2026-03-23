"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Save, CheckCircle2 } from "lucide-react";

interface Profile {
  full_name: string;
  phone: string;
  age: string;
  gender: string;
  height_cm: string;
  weight_kg: string;
  injuries: string;
  available_equipment: string;
  fitness_goal: string;
  fitness_level: string;
}

const EMPTY: Profile = { full_name: "", phone: "", age: "", gender: "", height_cm: "", weight_kg: "", injuries: "", available_equipment: "", fitness_goal: "", fitness_level: "" };

export default function ProfilPage() {
  const supabase = createClient();
  const router   = useRouter();
  const [form, setForm]     = useState<Profile>(EMPTY);
  const [loading, setLoad]  = useState(true);
  const [saving, setSave]   = useState(false);
  const [success, setSucc]  = useState(false);
  const [error, setError]   = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/giris"); return; }
      setUserId(session.user.id);

      const { data } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).single();
      if (data) {
        setForm({
          full_name:           data.full_name ?? "",
          phone:               data.phone ?? "",
          age:                 data.age ?? "",
          gender:              data.gender ?? "",
          height_cm:           data.height_cm ?? "",
          weight_kg:           data.weight_kg ?? "",
          injuries:            data.injuries ?? "",
          available_equipment: data.available_equipment ?? "",
          fitness_goal:        data.fitness_goal ?? "",
          fitness_level:       data.fitness_level ?? "",
        });
      } else {
        const meta = session.user.user_metadata;
        setForm((p) => ({ ...p, full_name: meta?.full_name ?? "" }));
      }
      setLoad(false);
    }
    load();
  }, [supabase, router]);

  async function save() {
    setSave(true); setError("");
    const bmi = form.height_cm && form.weight_kg
      ? parseFloat((Number(form.weight_kg) / Math.pow(Number(form.height_cm) / 100, 2)).toFixed(1))
      : null;
    const bmi_category = bmi
      ? bmi < 18.5 ? "Zayıf" : bmi < 25 ? "Normal" : bmi < 30 ? "Fazla Kilolu" : "Obez"
      : null;

    const payload = {
      id:                  userId,
      full_name:           form.full_name || null,
      phone:               form.phone || null,
      age:                 form.age ? Number(form.age) : null,
      gender:              form.gender || null,
      height_cm:           form.height_cm ? Number(form.height_cm) : null,
      weight_kg:           form.weight_kg ? Number(form.weight_kg) : null,
      injuries:            form.injuries || null,
      available_equipment: form.available_equipment || null,
      fitness_goal:        form.fitness_goal || null,
      fitness_level:       form.fitness_level || null,
      bmi,
      bmi_category,
      updated_at:          new Date().toISOString(),
    };

    const { error: e } = await supabase.from("user_profiles").upsert(payload, { onConflict: "id" });
    if (e) setError(e.message);
    else setSucc(true);
    setSave(false);
    setTimeout(() => setSucc(false), 3000);
  }

  const inp: React.CSSProperties = { background: "#0F0F0F", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, color: "#fff", padding: "10px 14px", fontSize: 14, width: "100%", boxSizing: "border-box" };
  const sel: React.CSSProperties = { ...inp, appearance: "none" };
  const set = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  if (loading) return <div style={{ color: "rgba(255,255,255,.3)", padding: 40, textAlign: "center" }}>Yükleniyor...</div>;

  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          <User size={20} /> Profilim
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)" }}>Bilgileriniz AI program oluşturmada kullanılır</p>
      </div>

      {success && (
        <div style={{ marginBottom: 16, background: "rgba(74,222,128,.08)", border: "1px solid rgba(74,222,128,.2)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, color: "#4ade80", fontSize: 13 }}>
          <CheckCircle2 size={15} /> Profil kaydedildi
        </div>
      )}
      {error && (
        <div style={{ marginBottom: 16, background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.2)", borderRadius: 10, padding: "10px 14px", color: "#f87171", fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Kişisel */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Kişisel Bilgiler</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 5 }}>Ad Soyad</label>
              <input value={form.full_name} onChange={set("full_name")} style={inp} placeholder="Ad Soyad" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 5 }}>Telefon</label>
              <input value={form.phone} onChange={set("phone")} style={inp} placeholder="05xx xxx xx xx" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 5 }}>Yaş</label>
              <input type="number" value={form.age} onChange={set("age")} style={inp} placeholder="Yaş" min="10" max="100" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 5 }}>Cinsiyet</label>
              <select value={form.gender} onChange={set("gender")} style={sel}>
                <option value="">Seçin</option>
                <option value="erkek">Erkek</option>
                <option value="kadin">Kadın</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fiziksel */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Fiziksel Ölçüler</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 5 }}>Boy (cm)</label>
              <input type="number" value={form.height_cm} onChange={set("height_cm")} style={inp} placeholder="175" min="100" max="250" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 5 }}>Kilo (kg)</label>
              <input type="number" value={form.weight_kg} onChange={set("weight_kg")} style={inp} placeholder="75" min="30" max="300" />
            </div>
          </div>
          {form.height_cm && form.weight_kg && (
            <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,.4)", padding: "8px 12px", background: "rgba(255,255,255,.03)", borderRadius: 8 }}>
              BMI: <strong style={{ color: "#fff" }}>{(Number(form.weight_kg) / Math.pow(Number(form.height_cm) / 100, 2)).toFixed(1)}</strong>
            </div>
          )}
        </div>

        {/* Fitness */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Fitness Bilgileri</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 5 }}>Hedef</label>
                <select value={form.fitness_goal} onChange={set("fitness_goal")} style={sel}>
                  <option value="">Seçin</option>
                  <option value="kilo_ver">Kilo Verme</option>
                  <option value="kas_kazan">Kas Kazanma</option>
                  <option value="kondisyon">Kondisyon</option>
                  <option value="saglikli_kal">Sağlıklı Kalma</option>
                  <option value="rehabilitasyon">Rehabilitasyon</option>
                  <option value="genel_fitness">Genel Fitness</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 5 }}>Seviye</label>
                <select value={form.fitness_level} onChange={set("fitness_level")} style={sel}>
                  <option value="">Seçin</option>
                  <option value="beginner">Başlangıç</option>
                  <option value="intermediate">Orta</option>
                  <option value="advanced">İleri</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 5 }}>Yaralanma / Kısıtlama</label>
              <input value={form.injuries} onChange={set("injuries")} style={inp} placeholder="Örn: Bel fıtığı, diz ağrısı (yoksa boş bırakın)" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 5 }}>Kullanılabilir Ekipman</label>
              <input value={form.available_equipment} onChange={set("available_equipment")} style={inp} placeholder="Örn: Dumbbell, bant, barbell veya tam donanımlı salon" />
            </div>
          </div>
        </div>

        <button onClick={save} disabled={saving} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#7A0D2A", border: "none", color: "#fff", padding: "13px", borderRadius: 12, cursor: "pointer", fontWeight: 800, fontSize: 14, opacity: saving ? 0.6 : 1 }}>
          <Save size={16} /> {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </div>
  );
}
