"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const GOALS = [
  { value: "kilo_ver",       label: "Kilo Vermek",        icon: "🔥", desc: "Yağ yakma ve kilo kontrolü" },
  { value: "kas_kazan",      label: "Kas Kazanmak",       icon: "💪", desc: "Kas kütlesi ve güç artırma" },
  { value: "kondisyon",      label: "Kondisyon",          icon: "🏃", desc: "Kardiyovasküler dayanıklılık" },
  { value: "saglikli_kal",   label: "Sağlıklı Kalmak",   icon: "❤️", desc: "Genel sağlık ve aktif yaşam" },
  { value: "rehabilitasyon", label: "Rehabilitasyon",     icon: "🩺", desc: "Güvenli hareket ve iyileşme" },
  { value: "genel_fitness",  label: "Genel Fitness",      icon: "⚡", desc: "Vücut kompozisyonu geliştirme" },
];

const LEVELS = [
  { value: "baslangic", label: "Başlangıç",   desc: "Antrenman geçmişim yok veya çok az" },
  { value: "orta",      label: "Orta",        desc: "1-2 yıl düzenli antrenman" },
  { value: "ileri",     label: "İleri",       desc: "3+ yıl deneyim" },
];

const EQUIPMENT = [
  "Tüm ekipman mevcut (gym)",
  "Dumbbell",
  "Barbell",
  "Resistance band",
  "Kettlebell",
  "TRX / Suspension",
  "Sadece vücut ağırlığı",
];

function BMIDisplay({ weight, height }: { weight: number; height: number }) {
  if (!weight || !height) return null;
  const bmi = weight / Math.pow(height / 100, 2);
  const rounded = Math.round(bmi * 10) / 10;
  let label = "Normal"; let color = "#4ade80";
  if (bmi < 18.5)     { label = "Zayıf";          color = "#60a5fa"; }
  else if (bmi < 25)  { label = "Normal";          color = "#4ade80"; }
  else if (bmi < 30)  { label = "Fazla kilolu";    color = "#facc15"; }
  else if (bmi < 35)  { label = "Obez I";          color = "#fb923c"; }
  else                { label = "Obez II+";        color = "#f87171"; }
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:10, padding:"8px 14px", marginTop:6 }}>
      <span style={{ fontSize:13, color:"rgba(255,255,255,.4)" }}>BMI:</span>
      <span style={{ fontSize:16, fontWeight:800, color }}>{rounded}</span>
      <span style={{ fontSize:12, color, fontWeight:600 }}>{label}</span>
    </div>
  );
}

export default function ProgramBasvuruPage() {
  const router = useRouter();
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<{ programId: string; title: string; summary: string } | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name:           "",
    age:                 "",
    gender:              "erkek",
    height_cm:           "",
    weight_kg:           "",
    goal:                "",
    fitness_level:       "",
    days_per_week:       "3",
    session_duration:    "60",
    available_equipment: "Tüm ekipman mevcut (gym)",
    injuries:            "",
    medical_notes:       "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/programs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            full_name:           form.full_name,
            age:                 parseInt(form.age),
            gender:              form.gender,
            height_cm:           parseInt(form.height_cm),
            weight_kg:           parseFloat(form.weight_kg),
            goal:                form.goal,
            fitness_level:       form.fitness_level,
            days_per_week:       parseInt(form.days_per_week),
            session_duration:    parseInt(form.session_duration),
            available_equipment: form.available_equipment,
            injuries:            form.injuries,
            medical_notes:       form.medical_notes,
          },
          save_profile: true,
        }),
      });
      const data = await res.json() as { success?: boolean; programId?: string; title?: string; summary?: string; error?: string };
      if (!res.ok || !data.success) throw new Error(data.error ?? "Bir hata oluştu");
      setResult({ programId: data.programId!, title: data.title!, summary: data.summary! });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Beklenmedik hata");
    }
    setLoading(false);
  }

  const canNext1 = form.full_name && form.age && form.gender && form.height_cm && form.weight_kg;
  const canNext2 = form.goal && form.fitness_level;
  const canSubmit = canNext1 && canNext2;

  const inputStyle: React.CSSProperties = {
    background: "#0F0F0F",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 10,
    color: "#fff",
    padding: "11px 14px",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,.4)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 6,
    display: "block",
  };

  if (result) {
    return (
      <div style={{ minHeight:"100vh", background:"#0A0A0A", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ maxWidth:520, width:"100%", textAlign:"center" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
          <h1 style={{ color:"#fff", fontSize:24, fontWeight:800, marginBottom:12 }}>Programın Oluşturuldu!</h1>
          <p style={{ color:"rgba(255,255,255,.5)", fontSize:15, lineHeight:1.7, marginBottom:8 }}>
            <strong style={{ color:"#D4AF37" }}>{result.title}</strong>
          </p>
          <p style={{ color:"rgba(255,255,255,.4)", fontSize:13, lineHeight:1.7, marginBottom:24 }}>{result.summary}</p>
          <div style={{ background:"rgba(212,175,55,.08)", border:"1px solid rgba(212,175,55,.2)", borderRadius:12, padding:"16px 20px", marginBottom:24 }}>
            <p style={{ color:"rgba(212,175,55,.9)", fontSize:13, margin:0, lineHeight:1.6 }}>
              Programın admin incelemesine gönderildi. Onaylandıktan sonra panelinde görünecek. Genellikle 24 saat içinde sonuçlanır.
            </p>
          </div>
          <button onClick={() => router.push("/")}
            style={{ background:"#7A0D2A", border:"none", color:"#fff", padding:"12px 28px", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer" }}>
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0A0A0A", padding:"40px 16px" }}>
      <div style={{ maxWidth:600, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"rgba(212,175,55,.7)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>
            Kişisel Program
          </div>
          <h1 style={{ color:"#fff", fontSize:28, fontWeight:900, margin:0, marginBottom:8 }}>
            Sana Özel Program Al
          </h1>
          <p style={{ color:"rgba(255,255,255,.4)", fontSize:14, margin:0, lineHeight:1.6 }}>
            Bilgilerini gir, yapay zeka sana özel benzersiz bir fitness ve beslenme programı oluştursun.
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:32 }}>
          {[1,2,3].map((s) => (
            <div key={s} style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{
                width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                fontWeight:800, fontSize:13,
                background: step >= s ? "#7A0D2A" : "rgba(255,255,255,.07)",
                color: step >= s ? "#fff" : "rgba(255,255,255,.3)",
                border: step === s ? "2px solid rgba(212,175,55,.5)" : "2px solid transparent",
              }}>{s}</div>
              {s < 3 && <div style={{ width:40, height:2, background: step > s ? "#7A0D2A" : "rgba(255,255,255,.07)", borderRadius:1 }} />}
            </div>
          ))}
        </div>

        <div style={{ background:"#111", border:"1px solid rgba(255,255,255,.08)", borderRadius:20, padding:"28px 28px" }}>

          {/* STEP 1: Fiziksel veriler */}
          {step === 1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <h2 style={{ color:"#fff", fontSize:17, fontWeight:800, margin:0 }}>Fiziksel Bilgiler</h2>

              <div>
                <label style={labelStyle}>Adınız (opsiyonel)</label>
                <input style={inputStyle} placeholder="Adınız" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div>
                  <label style={labelStyle}>Yaş *</label>
                  <input style={inputStyle} type="number" placeholder="örn: 28" min={10} max={80} value={form.age} onChange={(e) => set("age", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Cinsiyet *</label>
                  <select style={inputStyle} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                    <option value="erkek">Erkek</option>
                    <option value="kadin">Kadın</option>
                    <option value="belirtmek_istemiyorum">Belirtmek istemiyorum</option>
                  </select>
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div>
                  <label style={labelStyle}>Boy (cm) *</label>
                  <input style={inputStyle} type="number" placeholder="örn: 175" min={100} max={230} value={form.height_cm} onChange={(e) => set("height_cm", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Kilo (kg) *</label>
                  <input style={inputStyle} type="number" placeholder="örn: 75" min={30} max={300} step={0.5} value={form.weight_kg} onChange={(e) => set("weight_kg", e.target.value)} />
                </div>
              </div>

              {form.height_cm && form.weight_kg && (
                <BMIDisplay weight={parseFloat(form.weight_kg)} height={parseFloat(form.height_cm)} />
              )}

              <button onClick={() => setStep(2)} disabled={!canNext1}
                style={{ background: canNext1 ? "#7A0D2A" : "#222", border:"none", color: canNext1 ? "#fff" : "rgba(255,255,255,.2)", padding:"13px", borderRadius:12, fontSize:14, fontWeight:700, cursor: canNext1 ? "pointer" : "not-allowed", marginTop:4 }}>
                Devam →
              </button>
            </div>
          )}

          {/* STEP 2: Hedef ve seviye */}
          {step === 2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <h2 style={{ color:"#fff", fontSize:17, fontWeight:800, margin:0 }}>Hedef ve Seviye</h2>

              <div>
                <label style={labelStyle}>Hedefiniz *</label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {GOALS.map((g) => (
                    <button key={g.value} onClick={() => set("goal", g.value)}
                      style={{ background: form.goal === g.value ? "rgba(122,13,42,.3)" : "rgba(255,255,255,.03)", border:`1px solid ${form.goal === g.value ? "rgba(212,175,55,.4)" : "rgba(255,255,255,.08)"}`, borderRadius:12, padding:"12px 14px", cursor:"pointer", textAlign:"left" }}>
                      <div style={{ fontSize:20, marginBottom:4 }}>{g.icon}</div>
                      <div style={{ color:"#fff", fontWeight:700, fontSize:13 }}>{g.label}</div>
                      <div style={{ color:"rgba(255,255,255,.35)", fontSize:11, marginTop:2 }}>{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Fitness Seviyeniz *</label>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {LEVELS.map((l) => (
                    <button key={l.value} onClick={() => set("fitness_level", l.value)}
                      style={{ background: form.fitness_level === l.value ? "rgba(122,13,42,.3)" : "rgba(255,255,255,.03)", border:`1px solid ${form.fitness_level === l.value ? "rgba(212,175,55,.4)" : "rgba(255,255,255,.08)"}`, borderRadius:10, padding:"12px 14px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${form.fitness_level === l.value ? "#D4AF37" : "rgba(255,255,255,.2)"}`, background: form.fitness_level === l.value ? "#D4AF37" : "transparent", flexShrink:0 }} />
                      <div>
                        <div style={{ color:"#fff", fontWeight:700, fontSize:13 }}>{l.label}</div>
                        <div style={{ color:"rgba(255,255,255,.35)", fontSize:11 }}>{l.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setStep(1)} style={{ background:"rgba(255,255,255,.06)", border:"none", color:"rgba(255,255,255,.5)", padding:"13px 20px", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer" }}>
                  ← Geri
                </button>
                <button onClick={() => setStep(3)} disabled={!canNext2}
                  style={{ flex:1, background: canNext2 ? "#7A0D2A" : "#222", border:"none", color: canNext2 ? "#fff" : "rgba(255,255,255,.2)", padding:"13px", borderRadius:12, fontSize:14, fontWeight:700, cursor: canNext2 ? "pointer" : "not-allowed" }}>
                  Devam →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Antrenman detayları */}
          {step === 3 && (
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <h2 style={{ color:"#fff", fontSize:17, fontWeight:800, margin:0 }}>Antrenman Detayları</h2>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div>
                  <label style={labelStyle}>Haftada Kaç Gün?</label>
                  <select style={inputStyle} value={form.days_per_week} onChange={(e) => set("days_per_week", e.target.value)}>
                    {[2,3,4,5,6].map((d) => <option key={d} value={d}>{d} gün</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Seans Süresi</label>
                  <select style={inputStyle} value={form.session_duration} onChange={(e) => set("session_duration", e.target.value)}>
                    <option value="30">30 dakika</option>
                    <option value="45">45 dakika</option>
                    <option value="60">60 dakika</option>
                    <option value="75">75 dakika</option>
                    <option value="90">90 dakika</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Mevcut Ekipman</label>
                <select style={inputStyle} value={form.available_equipment} onChange={(e) => set("available_equipment", e.target.value)}>
                  {EQUIPMENT.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Yaralanma / Sağlık Durumu</label>
                <textarea
                  placeholder="Bel fıtığı, diz ağrısı, omuz rahatsızlığı vb. — boş bırakabilirsiniz"
                  value={form.injuries}
                  onChange={(e) => set("injuries", e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize:"vertical" }}
                />
              </div>

              <div>
                <label style={labelStyle}>Ek Notlar (opsiyonel)</label>
                <textarea
                  placeholder="Doktor kısıtlaması, tercih etmediğiniz egzersizler vb."
                  value={form.medical_notes}
                  onChange={(e) => set("medical_notes", e.target.value)}
                  rows={2}
                  style={{ ...inputStyle, resize:"vertical" }}
                />
              </div>

              {error && (
                <div style={{ background:"rgba(248,113,113,.08)", border:"1px solid rgba(248,113,113,.2)", borderRadius:10, padding:"12px 14px", color:"#f87171", fontSize:13 }}>
                  {error}
                </div>
              )}

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setStep(2)} style={{ background:"rgba(255,255,255,.06)", border:"none", color:"rgba(255,255,255,.5)", padding:"13px 20px", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer" }}>
                  ← Geri
                </button>
                <button onClick={handleSubmit} disabled={!canSubmit || loading}
                  style={{ flex:1, background: canSubmit && !loading ? "#7A0D2A" : "#222", border:"none", color: canSubmit && !loading ? "#fff" : "rgba(255,255,255,.2)", padding:"13px", borderRadius:12, fontSize:14, fontWeight:800, cursor: canSubmit && !loading ? "pointer" : "not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  {loading ? (
                    <>
                      <span style={{ display:"inline-block", width:16, height:16, border:"2px solid rgba(255,255,255,.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                      Program Oluşturuluyor... (~30 sn)
                    </>
                  ) : "🚀 Kişisel Programı Oluştur"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign:"center", color:"rgba(255,255,255,.2)", fontSize:12, marginTop:20, lineHeight:1.6 }}>
          Programın yapay zeka tarafından oluşturulur ve antrenörümüz tarafından incelendikten sonra sana teslim edilir.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
