"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Dumbbell, Salad, Zap, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const IS: React.CSSProperties = { background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9, color: "#fff", padding: "10px 13px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" };
const TS: React.CSSProperties = { ...IS, minHeight: 90, resize: "vertical" };
const LBL: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" };

const GOALS = ["Kilo vermek", "Kas kütlesi kazanmak", "Forma girmek", "Genel sağlık & kondisyon", "Güç artırmak", "Yarışmaya hazırlanmak"];
const LEVELS = ["Yeni başlayan (0-6 ay)", "Orta seviye (6 ay-2 yıl)", "İleri seviye (2+ yıl)"];
const DIET_PREFS = ["Standart (her şey)", "Vejetaryen", "Vegan", "Glutensiz", "Laktozsuz", "Düşük karbonhidrat"];
const INJURY_AREAS = ["Omuz", "Bel / Sırt", "Diz", "Kalça", "Boyun", "Dirsek / Bilek", "Karın / Kasık", "Ayak bileği"];

const TYPE_INFO: Record<string, { label: string; price: number; color: string; icon: React.ReactNode }> = {
  fitness:  { label: "Fitness Programı", price: 499, color: "#7A0D2A", icon: <Dumbbell size={18} color="#fff" /> },
  beslenme: { label: "Beslenme Programı", price: 499, color: "#1A6A2A", icon: <Salad size={18} color="#fff" /> },
  combo:    { label: "Fitness + Beslenme", price: 799, color: "#D4AF37", icon: <Zap size={18} color="#1A1A1A" /> },
};

interface FormData {
  full_name: string; email: string; phone: string;
  age: string; gender: string; height_cm: string; weight_kg: string;
  goal: string; fitness_level: string; days_per_week: string; session_duration: string;
  health_issues: string; injuries: string[]; diet_preference: string; extra_notes: string;
}

const INIT: FormData = {
  full_name: "", email: "", phone: "",
  age: "", gender: "", height_cm: "", weight_kg: "",
  goal: "", fitness_level: "", days_per_week: "4", session_duration: "60",
  health_issues: "", injuries: [], diet_preference: "Standart (her şey)", extra_notes: "",
};

function ProgramAlContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const programType = searchParams.get("tip") || "fitness";
  const typeInfo = TYPE_INFO[programType] || TYPE_INFO.fitness;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INIT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [iframeToken, setIframeToken] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push(`/giris?redirect=/program-al?tip=${programType}`); return; }
      setForm(f => ({
        ...f,
        email: session.user.email || "",
        full_name: session.user.user_metadata?.full_name || "",
      }));
      setAuthChecked(true);
    });
  }, [supabase, router, programType]);

  const set = (k: keyof FormData, v: string | string[]) => setForm(f => ({ ...f, [k]: v }));

  const toggleInjury = (area: string) => {
    set("injuries", form.injuries.includes(area)
      ? form.injuries.filter(i => i !== area)
      : [...form.injuries, area]);
  };

  const validateStep1 = () => {
    if (!form.full_name.trim()) return "Ad soyad zorunludur";
    if (!form.email.trim() || !form.email.includes("@")) return "Geçerli e-posta girin";
    if (!form.phone.trim() || form.phone.length < 10) return "Geçerli telefon girin";
    if (!form.age || +form.age < 14 || +form.age > 90) return "Geçerli yaş girin (14-90)";
    if (!form.gender) return "Cinsiyet seçin";
    if (!form.height_cm || +form.height_cm < 100 || +form.height_cm > 250) return "Geçerli boy girin";
    if (!form.weight_kg || +form.weight_kg < 30 || +form.weight_kg > 300) return "Geçerli kilo girin";
    if (!form.goal) return "Hedef seçin";
    if (!form.fitness_level) return "Fitness seviyesi seçin";
    return "";
  };

  const handleNext = () => {
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    setError("");
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      let userIp = "1.1.1.1";
      try { const r = await fetch("https://api.ipify.org?format=json"); const d = await r.json(); userIp = d.ip; } catch {}

      const res = await fetch("/api/program-requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age: +form.age, height_cm: +form.height_cm, weight_kg: +form.weight_kg,
          days_per_week: +form.days_per_week, session_duration: +form.session_duration,
          injuries: form.injuries.join(", "),
          program_type: programType,
          user_ip: userIp,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Hata oluştu"); setLoading(false); return; }
      setIframeToken(data.token);
      setStep(3);
    } catch {
      setError("Sunucu bağlantı hatası. Tekrar deneyin.");
    }
    setLoading(false);
  };

  if (!authChecked) {
    return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.3)" }}><Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} /></div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0B0B0B", padding: "100px 16px 60px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Başlık */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: typeInfo.color, borderRadius: 12, padding: "10px 20px", marginBottom: 16 }}>
            {typeInfo.icon}
            <span style={{ fontWeight: 800, color: typeInfo.color === "#D4AF37" ? "#1A1A1A" : "#fff", fontSize: 15 }}>{typeInfo.label}</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: "0 0 8px", lineHeight: 1.2 }}>Kişisel Programınızı Oluşturun</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)", margin: 0 }}>
            Formunuzu doldurun → Ödeme yapın → PDF programınız e-postanıza gelsin
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, background: step >= s ? "#7A0D2A" : "rgba(255,255,255,.08)", color: step >= s ? "#fff" : "rgba(255,255,255,.3)", border: step === s ? "2px solid #D4AF37" : "2px solid transparent", transition: "all .2s" }}>{s}</div>
              {s < 3 && <div style={{ width: 40, height: 2, background: step > s ? "#7A0D2A" : "rgba(255,255,255,.08)" }} />}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 32, fontSize: 11, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {["Kişisel Bilgiler", "Sağlık & Detaylar", "Ödeme"].map((l, i) => (
            <span key={l} style={{ color: step === i + 1 ? "#D4AF37" : undefined }}>{l}</span>
          ))}
        </div>

        {/* Hata */}
        {error && (
          <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8, color: "#f87171", fontSize: 13 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,.07)", borderRadius: 20, padding: "28px 28px" }}>

          {/* STEP 1 — KİŞİSEL BİLGİLER */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <h2 style={{ color: "#fff", fontSize: 16, fontWeight: 800, margin: "0 0 4px" }}>Kişisel Bilgiler</h2>

              <div>
                <label style={LBL}>Ad Soyad *</label>
                <input value={form.full_name} onChange={e => set("full_name", e.target.value)} style={IS} placeholder="Adınız Soyadınız" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LBL}>E-posta *</label>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)} style={IS} placeholder="ornek@mail.com" />
                </div>
                <div>
                  <label style={LBL}>Telefon *</label>
                  <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} style={IS} placeholder="05XX XXX XX XX" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LBL}>Yaş *</label>
                  <input type="number" value={form.age} onChange={e => set("age", e.target.value)} style={IS} placeholder="28" min={14} max={90} />
                </div>
                <div>
                  <label style={LBL}>Cinsiyet *</label>
                  <select value={form.gender} onChange={e => set("gender", e.target.value)} style={IS}>
                    <option value="">Seçin</option>
                    <option value="erkek">Erkek</option>
                    <option value="kadin">Kadın</option>
                  </select>
                </div>
                <div>
                  <label style={LBL}>Boy (cm) *</label>
                  <input type="number" value={form.height_cm} onChange={e => set("height_cm", e.target.value)} style={IS} placeholder="175" />
                </div>
                <div>
                  <label style={LBL}>Kilo (kg) *</label>
                  <input type="number" value={form.weight_kg} onChange={e => set("weight_kg", e.target.value)} style={IS} placeholder="75" />
                </div>
              </div>
              <div>
                <label style={LBL}>Hedefiniz *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {GOALS.map(g => (
                    <button key={g} type="button" onClick={() => set("goal", g)} style={{ padding: "10px 12px", background: form.goal === g ? "rgba(122,13,42,0.3)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.goal === g ? "#7A0D2A" : "rgba(255,255,255,0.08)"}`, borderRadius: 9, color: form.goal === g ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", textAlign: "left" }}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={LBL}>Fitness Seviyeniz *</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {LEVELS.map(l => (
                    <button key={l} type="button" onClick={() => set("fitness_level", l)} style={{ padding: "10px 14px", background: form.fitness_level === l ? "rgba(122,13,42,0.3)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.fitness_level === l ? "#7A0D2A" : "rgba(255,255,255,0.08)"}`, borderRadius: 9, color: form.fitness_level === l ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", textAlign: "left" }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LBL}>Haftalık Antrenman Günü</label>
                  <select value={form.days_per_week} onChange={e => set("days_per_week", e.target.value)} style={IS}>
                    {[2,3,4,5,6].map(d => <option key={d} value={d}>{d} gün / hafta</option>)}
                  </select>
                </div>
                <div>
                  <label style={LBL}>Seans Süresi</label>
                  <select value={form.session_duration} onChange={e => set("session_duration", e.target.value)} style={IS}>
                    {[30,45,60,75,90,120].map(d => <option key={d} value={d}>{d} dakika</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — SAĞLIK & DETAYLAR */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <h2 style={{ color: "#fff", fontSize: 16, fontWeight: 800, margin: "0 0 4px" }}>Sağlık & Detaylar</h2>
              <div style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.6 }}>
                Bu bilgiler programınızı kişiselleştirmek ve güvenliğiniz için kullanılır. Tıbbi tavsiye niteliği taşımaz.
              </div>

              <div>
                <label style={LBL}>Sağlık Sorunları / Kullandığınız İlaçlar</label>
                <textarea value={form.health_issues} onChange={e => set("health_issues", e.target.value)} style={TS} placeholder="Örnek: Tip 2 diyabetim var, tansiyon ilacı kullanıyorum, bel fıtığı ameliyatı geçirdim, diz protezim var..." />
                <p style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 4 }}>Ne kadar detay verirseniz programınız o kadar güvenli ve uygun olur.</p>
              </div>

              <div>
                <label style={LBL}>Sakatlık / Ağrı Bölgeleri</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                  {INJURY_AREAS.map(a => (
                    <button key={a} type="button" onClick={() => toggleInjury(a)} style={{ padding: "9px 12px", background: form.injuries.includes(a) ? "rgba(248,113,113,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.injuries.includes(a) ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 9, color: form.injuries.includes(a) ? "#f87171" : "rgba(255,255,255,0.45)", fontSize: 13, cursor: "pointer", textAlign: "left" }}>
                      {form.injuries.includes(a) ? "✓ " : ""}{a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={LBL}>Beslenme Tercihi</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {DIET_PREFS.map(d => (
                    <button key={d} type="button" onClick={() => set("diet_preference", d)} style={{ padding: "10px 12px", background: form.diet_preference === d ? "rgba(26,106,42,0.25)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.diet_preference === d ? "rgba(26,106,42,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: 9, color: form.diet_preference === d ? "#4ade80" : "rgba(255,255,255,0.45)", fontSize: 13, cursor: "pointer", textAlign: "left" }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={LBL}>Ek Notlar (İstekler, Beklentiler...)</label>
                <textarea value={form.extra_notes} onChange={e => set("extra_notes", e.target.value)} style={TS} placeholder="Özellikle çalışmak istediğiniz bölgeler, daha önce yaptığınız programlar, beklentileriniz..." />
              </div>
            </div>
          )}

          {/* STEP 3 — ÖDEME */}
          {step === 3 && (
            <div>
              {iframeToken ? (
                <div>
                  <h2 style={{ color: "#fff", fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Güvenli Ödeme</h2>
                  <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12.5, color: "rgba(255,255,255,.45)" }}>
                    ✅ Formunuz kaydedildi. Ödemeniz onaylandıktan sonra uzmanımız programınızı hazırlayacak.
                  </div>
                  <div style={{ background: "#0F0F0F", borderRadius: 12, overflow: "hidden" }}>
                    <iframe
                      src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
                      id="paytriframe"
                      style={{ width: "100%", height: 500, border: "none" }}
                      allowFullScreen
                    />
                  </div>
                  <script dangerouslySetInnerHTML={{ __html: `window.addEventListener('message',function(e){if(e.data.message==='failed')location.href='/program-al?odeme=basarisiz&tip=${programType}';if(e.data.message==='success')location.href='/dashboard?odeme=basarili';});` }} />
                </div>
              ) : (
                <div>
                  <h2 style={{ color: "#fff", fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Özet & Ödeme</h2>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ color: "rgba(255,255,255,.5)", fontSize: 13 }}>Seçilen Program</span>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{typeInfo.label}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ color: "rgba(255,255,255,.5)", fontSize: 13 }}>Kişi</span>
                      <span style={{ color: "#fff", fontSize: 13 }}>{form.full_name}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ color: "rgba(255,255,255,.5)", fontSize: 13 }}>E-posta</span>
                      <span style={{ color: "#fff", fontSize: 13 }}>{form.email}</span>
                    </div>
                    <div style={{ height: 1, background: "rgba(255,255,255,.06)", margin: "12px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "rgba(255,255,255,.5)", fontSize: 13 }}>Toplam</span>
                      <span style={{ color: "#fff", fontWeight: 900, fontSize: 22 }}>₺{typeInfo.price}</span>
                    </div>
                  </div>
                  <div style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.6, marginBottom: 20 }}>
                    📧 Ödeme onaylandıktan sonra uzmanımız programınızı hazırlayıp <strong style={{ color: "#D4AF37" }}>{form.email}</strong> adresine PDF olarak gönderecek.
                  </div>
                  <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "15px", background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", color: "#fff", fontSize: 15, fontWeight: 800, borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    {loading ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> İşleniyor...</> : `Ödemeye Geç — ₺${typeInfo.price}`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Butonlar */}
          {step < 3 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
              {step > 1 ? (
                <button onClick={() => { setError(""); setStep(s => s - 1); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,.6)", padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontSize: 13 }}>
                  <ChevronLeft size={16} /> Geri
                </button>
              ) : <div />}
              <button onClick={handleNext} style={{ display: "flex", alignItems: "center", gap: 6, background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", color: "#fff", padding: "10px 22px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                {step === 2 ? "Özete Git" : "Devam Et"} <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ProgramAlPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.3)" }}>Yükleniyor...</div>}>
      <ProgramAlContent />
    </Suspense>
  );
}
