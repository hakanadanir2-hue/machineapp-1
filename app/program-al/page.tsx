"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle, Brain, Dumbbell, Apple, FileText, Flame, Activity, ChevronRight, ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { FitnessProgramData } from "@/types";

const schema = z.object({
  full_name:          z.string().min(2, "Ad soyad gerekli"),
  email:              z.string().email("Geçerli e-posta girin"),
  gender:             z.enum(["male", "female"]),
  age:                z.coerce.number().min(15, "En az 15").max(80, "En fazla 80"),
  weight:             z.coerce.number().min(40, "En az 40 kg").max(200, "En fazla 200 kg"),
  height:             z.coerce.number().min(140, "En az 140 cm").max(220, "En fazla 220 cm"),
  goal:               z.enum(["weight_loss", "muscle_gain", "maintenance", "boxing", "toning", "health"]),
  activity_level:     z.enum(["sedentary", "light", "moderate", "active", "extra_active"]),
  level:              z.enum(["beginner", "intermediate", "advanced"]),
  weekly_days:        z.coerce.number().min(1).max(7),
  equipment:          z.enum(["gym", "home_basic", "home_none", "outdoor"]),
  diet_preference:    z.enum(["standard", "vegetarian", "vegan", "high_protein", "low_carb"]),
  injury_notes:       z.string().optional(),
  extra_notes:        z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const LS_KEY = "machine_program_draft";

const STEPS = [
  { label: "Kişisel", sub: "Kimsin?" },
  { label: "Ölçüler", sub: "Fiziksel veri" },
  { label: "Hedef",   sub: "Ne istiyorsun?" },
  { label: "Program", sub: "Hazır!" },
];

const GOAL_OPTIONS = [
  { value: "weight_loss",  label: "Kilo Verme",        emoji: "🔥" },
  { value: "muscle_gain",  label: "Kas Kazanma",        emoji: "💪" },
  { value: "toning",       label: "Sıkılaşma",          emoji: "⚡" },
  { value: "maintenance",  label: "Form Koruma",         emoji: "⚖️" },
  { value: "boxing",       label: "Boks Performansı",   emoji: "🥊" },
  { value: "health",       label: "Genel Sağlık",        emoji: "❤️" },
];

const ACTIVITY_OPTIONS = [
  { value: "sedentary",    label: "Sedanter",     sub: "Masa başı, hareket yok" },
  { value: "light",        label: "Hafif Aktif",  sub: "Haftada 1–3 gün" },
  { value: "moderate",     label: "Orta Aktif",   sub: "Haftada 3–5 gün" },
  { value: "active",       label: "Çok Aktif",    sub: "Haftada 6–7 gün" },
  { value: "extra_active", label: "Ekstra Aktif", sub: "Günde 2× antrenman" },
];

const LEVEL_OPTIONS = [
  { value: "beginner",     label: "Başlangıç", sub: "0–6 ay" },
  { value: "intermediate", label: "Orta",      sub: "6 ay–2 yıl" },
  { value: "advanced",     label: "İleri",     sub: "2+ yıl" },
];

const EQUIPMENT_OPTIONS = [
  { value: "gym",        label: "Spor Salonu",      sub: "Tüm ekipman mevcut" },
  { value: "home_basic", label: "Evde Temel",        sub: "Dambıl / bant" },
  { value: "home_none",  label: "Evde Ekipmansız",   sub: "Sadece vücut ağırlığı" },
  { value: "outdoor",    label: "Dışarıda",           sub: "Park, koşu, egzersiz" },
];

const DIET_OPTIONS = [
  { value: "standard",     label: "Standart",       sub: "Her şey dahil" },
  { value: "high_protein", label: "Yüksek Protein", sub: "Kas odaklı" },
  { value: "low_carb",     label: "Az Karbonhidrat", sub: "Keto benzeri" },
  { value: "vegetarian",   label: "Vejetaryen",      sub: "Et yok" },
  { value: "vegan",        label: "Vegan",            sub: "Hayvansal yok" },
];

const inp: React.CSSProperties = {
  width: "100%", padding: "0.875rem 1rem",
  background: "#111", border: "1px solid #2A2A2A",
  borderRadius: 12, color: "#fff", fontSize: "0.9375rem",
  outline: "none", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  display: "block", color: "rgba(255,255,255,0.65)",
  fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem",
};
const errStyle: React.CSSProperties = { color: "#f87171", fontSize: "0.75rem", marginTop: "0.375rem" };

function RadioCard({ checked, onClick, children }: { checked: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "0.75rem 1rem", borderRadius: 12, cursor: "pointer",
        border: `1px solid ${checked ? "rgba(212,175,55,0.5)" : "#2A2A2A"}`,
        background: checked ? "rgba(106,13,37,0.25)" : "transparent",
        transition: "all 0.15s",
      }}
    >
      {children}
    </div>
  );
}

export default function ProgramAlPage() {
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<FitnessProgramData | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const {
    register, handleSubmit, trigger, setValue, getValues, control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      gender: "male", goal: "weight_loss", activity_level: "moderate",
      level: "beginner", weekly_days: 3, equipment: "gym",
      diet_preference: "standard",
    },
  });

  // useWatch: sadece seçim kartları için gerekli alanlar — input yazımını etkilemez
  const gender         = useWatch({ control, name: "gender" });
  const goal           = useWatch({ control, name: "goal" });
  const activity_level = useWatch({ control, name: "activity_level" });
  const level          = useWatch({ control, name: "level" });
  const weekly_days    = useWatch({ control, name: "weekly_days" });
  const equipment      = useWatch({ control, name: "equipment" });
  const diet_preference = useWatch({ control, name: "diet_preference" });

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const vals = JSON.parse(saved) as Partial<FormData>;
        (Object.keys(vals) as (keyof FormData)[]).forEach(k => {
          if (vals[k] !== undefined) setValue(k, vals[k] as never);
        });
      }
    } catch { /* ignore */ }
  }, [setValue]);

  // Debounced localStorage save — sadece step geçişlerinde kaydet
  const saveDraft = useCallback(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(getValues())); } catch { /* ignore */ }
  }, [getValues]);

  const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
    0: ["full_name", "email", "gender"],
    1: ["age", "weight", "height"],
    2: ["goal", "activity_level", "level", "weekly_days", "equipment", "diet_preference"],
  };

  const handleNext = async () => {
    if (step < 3) {
      const fields = STEP_FIELDS[step] ?? [];
      const ok = fields.length > 0 ? await trigger(fields) : true;
      if (!ok) return;
    }
    saveDraft();
    if (step < 2) { setStep(s => s + 1); return; }
    if (step === 2) {
      setLoading(true); setGenError(null);
      try {
        const res  = await fetch("/api/programs/generate", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(getValues()),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Program oluşturulamadı");
        setPreview(data.program);
        setStep(3);
        localStorage.removeItem(LS_KEY);
      } catch (e) {
        setGenError(e instanceof Error ? e.message : "Bir hata oluştu. Lütfen tekrar deneyin.");
      }
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    const vals = getValues();
    try {
      const res  = await fetch("/api/payment/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "program", amount: 199, email: vals.email, full_name: vals.full_name }),
      });
      const data = await res.json();
      if (data.iframeToken) window.location.href = `https://www.paytr.com/odeme/guvenli/${data.iframeToken}`;
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0B0B0B" }}>

        {/* Hero */}
        <div style={{ paddingTop: 96, paddingBottom: "2.5rem", background: "linear-gradient(to bottom,#111,#0B0B0B)", borderBottom: "1px solid rgba(106,13,37,0.15)" }}>
          <div className="page-container" style={{ textAlign: "center" }}>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>ACSM · NASM · NSCA Bilimsel Altyapı</p>
            <h1 style={{ fontSize: "clamp(1.875rem,5vw,3rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)", marginBottom: "0.875rem" }}>
              Beslenme &amp; Fitness Programı
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", maxWidth: "34rem", marginInline: "auto", lineHeight: 1.7 }}>
              Kişisel ölçülerinize ve hedefinize göre hazırlanmış 8 haftalık antrenman + beslenme planı — sadece ₺199
            </p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="page-container" style={{ paddingTop: "2rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", justifyContent: "center", marginBottom: "2.5rem" }}>
            {[
              { icon: Dumbbell, text: "8 Haftalık Antrenman" },
              { icon: Apple,    text: "Kişisel Beslenme Planı" },
              { icon: Flame,    text: "Kalori & Makro Hesabı" },
              { icon: Activity, text: "BMR & TDEE Analizi" },
              { icon: FileText, text: "PDF Teslim" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1rem", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 30 }}>
                <Icon style={{ width: 15, height: 15, color: "#D4AF37" }} />
                <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.8125rem" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="page-container" style={{ paddingBottom: "5rem" }}>
          <div style={{ maxWidth: 620, marginInline: "auto" }}>

            {/* Step indicator */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1.75rem" }}>
              {STEPS.map((s, i) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ flexShrink: 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "0.8125rem", fontWeight: 700, transition: "all 0.25s",
                      background: i < step ? "#4ade80" : i === step ? "#6A0D25" : "#1A1A1A",
                      border: i === step ? "1px solid rgba(212,175,55,0.5)" : "1px solid transparent",
                      color: i < step ? "#000" : i === step ? "#D4AF37" : "rgba(255,255,255,0.3)",
                    }}>
                      {i < step ? "✓" : i + 1}
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, margin: "0 0.375rem", background: i < step ? "rgba(74,222,128,0.4)" : "#2A2A2A", transition: "background 0.25s" }} />
                  )}
                </div>
              ))}
            </div>

            {/* Card */}
            <div style={{ background: "#1A1A1A", borderRadius: 20, border: "1px solid #2A2A2A", padding: "clamp(1.25rem,4vw,2rem)" }}>

              {/* Step 0: Personal */}
              {step === 0 && (
                <div>
                  <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", fontFamily: "var(--font-heading)", marginBottom: "1.5rem" }}>Kişisel Bilgiler</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div>
                      <label style={lbl}>Ad Soyad *</label>
                      <input {...register("full_name")} placeholder="Adın Soyadın" style={inp} />
                      {errors.full_name && <p style={errStyle}>{errors.full_name.message}</p>}
                    </div>
                    <div>
                      <label style={lbl}>E-posta *</label>
                      <input {...register("email")} type="email" placeholder="ornek@mail.com" style={inp} />
                      {errors.email && <p style={errStyle}>{errors.email.message}</p>}
                    </div>
                    <div>
                      <label style={lbl}>Cinsiyet *</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        {[{ v: "male", l: "Erkek" }, { v: "female", l: "Kadın" }].map(opt => (
                          <RadioCard key={opt.v} checked={gender === opt.v} onClick={() => setValue("gender", opt.v as "male" | "female")}>
                            <p style={{ textAlign: "center", fontWeight: 600, fontSize: "0.9375rem", color: gender === opt.v ? "#D4AF37" : "rgba(255,255,255,0.6)" }}>{opt.l}</p>
                          </RadioCard>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Measurements */}
              {step === 1 && (
                <div>
                  <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", fontFamily: "var(--font-heading)", marginBottom: "1.5rem" }}>Fiziksel Ölçüler</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {([
                      { name: "age",    label: "Yaş",  unit: "yaş", placeholder: "25" },
                      { name: "weight", label: "Kilo", unit: "kg",  placeholder: "75" },
                      { name: "height", label: "Boy",  unit: "cm",  placeholder: "175" },
                    ] as const).map(field => (
                      <div key={field.name}>
                        <label style={lbl}>{field.label} *</label>
                        <div style={{ position: "relative" }}>
                          <input {...register(field.name)} type="number" placeholder={field.placeholder} style={{ ...inp, paddingRight: "3.5rem" }} />
                          <span style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", fontSize: "0.875rem", pointerEvents: "none" }}>{field.unit}</span>
                        </div>
                        {errors[field.name] && <p style={errStyle}>{errors[field.name]?.message}</p>}
                      </div>
                    ))}
                    <div>
                      <label style={lbl}>Sakatlık / Sağlık Notu</label>
                      <textarea {...register("injury_notes")} rows={2} placeholder="Bel fıtığı, diz sorunu, omuz ağrısı vb. (boş bırakabilirsiniz)" style={{ ...inp, resize: "vertical" }} />
                    </div>
                    <div>
                      <label style={lbl}>Ek Notunuz</label>
                      <textarea {...register("extra_notes")} rows={2} placeholder="Eğitmen veya programa özel eklemek istediğiniz her şey" style={{ ...inp, resize: "vertical" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Goal & Preferences */}
              {step === 2 && (
                <div>
                  <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", fontFamily: "var(--font-heading)", marginBottom: "1.5rem" }}>Hedef &amp; Tercihler</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    <div>
                      <label style={lbl}>Hedefiniz *</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
                        {GOAL_OPTIONS.map(opt => (
                          <RadioCard key={opt.value} checked={goal === opt.value} onClick={() => setValue("goal", opt.value as FormData["goal"])}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ fontSize: "1.125rem" }}>{opt.emoji}</span>
                              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: goal === opt.value ? "#D4AF37" : "rgba(255,255,255,0.65)" }}>{opt.label}</span>
                            </div>
                          </RadioCard>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={lbl}>Aktivite Seviyesi *</label>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {ACTIVITY_OPTIONS.map(opt => (
                          <RadioCard key={opt.value} checked={activity_level === opt.value} onClick={() => setValue("activity_level", opt.value as FormData["activity_level"])}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: activity_level === opt.value ? "#D4AF37" : "rgba(255,255,255,0.7)" }}>{opt.label}</span>
                              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>{opt.sub}</span>
                            </div>
                          </RadioCard>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={lbl}>Antrenman Deneyimi *</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.625rem" }}>
                        {LEVEL_OPTIONS.map(opt => (
                          <RadioCard key={opt.value} checked={level === opt.value} onClick={() => setValue("level", opt.value as FormData["level"])}>
                            <div style={{ textAlign: "center" }}>
                              <p style={{ fontSize: "0.875rem", fontWeight: 600, color: level === opt.value ? "#D4AF37" : "rgba(255,255,255,0.65)" }}>{opt.label}</p>
                              <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{opt.sub}</p>
                            </div>
                          </RadioCard>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={lbl}>Haftada Kaç Gün Antrenman?</label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {[1, 2, 3, 4, 5, 6, 7].map(d => (
                          <button key={d} type="button" onClick={() => setValue("weekly_days", d)}
                            style={{ flex: 1, padding: "0.625rem 0", borderRadius: 10, fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", border: `1px solid ${weekly_days === d ? "rgba(212,175,55,0.5)" : "#2A2A2A"}`, background: weekly_days === d ? "rgba(106,13,37,0.25)" : "#111", color: weekly_days === d ? "#D4AF37" : "rgba(255,255,255,0.45)" }}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={lbl}>Ekipman Durumu</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
                        {EQUIPMENT_OPTIONS.map(opt => (
                          <RadioCard key={opt.value} checked={equipment === opt.value} onClick={() => setValue("equipment", opt.value as FormData["equipment"])}>
                            <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: equipment === opt.value ? "#D4AF37" : "rgba(255,255,255,0.7)" }}>{opt.label}</p>
                            <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{opt.sub}</p>
                          </RadioCard>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={lbl}>Beslenme Tercihi</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
                        {DIET_OPTIONS.map(opt => (
                          <RadioCard key={opt.value} checked={diet_preference === opt.value} onClick={() => setValue("diet_preference", opt.value as FormData["diet_preference"])}>
                            <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: diet_preference === opt.value ? "#D4AF37" : "rgba(255,255,255,0.7)" }}>{opt.label}</p>
                            <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{opt.sub}</p>
                          </RadioCard>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Error */}
              {genError && (
                <div style={{ margin: "1rem 0", padding: "12px 16px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 10, color: "#f87171", fontSize: 14 }}>
                  {genError}
                </div>
              )}

              {/* Step 3: Preview & Payment */}
              {step === 3 && preview && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
                    <CheckCircle style={{ width: 24, height: 24, color: "#4ade80", flexShrink: 0 }} />
                    <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", fontFamily: "var(--font-heading)" }}>Programın Hazırlandı!</h2>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
                    {[
                      { icon: Brain,    label: "BMR",           value: `${preview.bmr} kcal` },
                      { icon: Activity, label: "TDEE",          value: `${preview.tdee} kcal` },
                      { icon: Flame,    label: "Hedef Kalori",  value: `${preview.targetCalories} kcal` },
                      { icon: Apple,    label: "Günlük Protein", value: `${preview.nutrition.protein}g` },
                    ].map(item => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} style={{ background: "#111", borderRadius: 12, padding: "1rem", border: "1px solid #2A2A2A" }}>
                          <Icon style={{ width: 18, height: 18, color: "#D4AF37", marginBottom: "0.5rem" }} />
                          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>{item.label}</p>
                          <p style={{ color: "#fff", fontWeight: 700, fontSize: "1.0625rem", marginTop: "0.25rem", fontFamily: "var(--font-heading)" }}>{item.value}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ background: "rgba(106,13,37,0.15)", borderRadius: 14, padding: "1.125rem", border: "1px solid rgba(106,13,37,0.3)", marginBottom: "1.5rem" }}>
                    <p style={{ color: "#D4AF37", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.625rem" }}>Programın İçeriği:</p>
                    <ul style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                      {["8 Haftalık Antrenman Programı", "Kişisel Beslenme Planı (5 öğün)", "Kalori ve Makro Hedefleri", "PDF Formatında Anında Teslim", "ACSM/NASM/NSCA Bilimsel Altyapı"].map(item => (
                        <li key={item} style={{ display: "flex", gap: "0.5rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)" }}>
                          <span style={{ color: "#4ade80", flexShrink: 0 }}>✓</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem", background: "#111", borderRadius: 14, border: "1px solid rgba(212,175,55,0.2)" }}>
                    <div>
                      <p style={{ color: "#fff", fontWeight: 800, fontSize: "1.75rem", fontFamily: "var(--font-heading)" }}>₺199</p>
                      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginTop: "0.25rem" }}>Tek seferlik — Anında teslim</p>
                    </div>
                    <button onClick={handlePayment} disabled={loading}
                      style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 1.5rem", background: "#D4AF37", color: "#000", fontWeight: 800, fontSize: "0.9375rem", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, border: "none" }}>
                      {loading && <Loader2 style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }} />}
                      Satın Al &amp; İndir
                    </button>
                  </div>
                </div>
              )}

              {/* Nav buttons */}
              {step < 3 && (
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
                  {step > 0 && (
                    <button type="button" onClick={() => setStep(s => s - 1)}
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "0.875rem 1.25rem", background: "#111", color: "rgba(255,255,255,0.6)", borderRadius: 12, border: "1px solid #2A2A2A", cursor: "pointer", fontSize: "0.9375rem" }}>
                      <ChevronLeft style={{ width: 16, height: 16 }} /> Geri
                    </button>
                  )}
                  <button type="button" onClick={handleNext} disabled={loading}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.875rem", background: "#6A0D25", color: "#fff", fontWeight: 700, fontSize: "0.9375rem", borderRadius: 12, border: "1px solid rgba(212,175,55,0.3)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                    {loading && <Loader2 style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }} />}
                    {step === 2 ? "Programı Oluştur" : <><span>Devam Et</span><ChevronRight style={{ width: 16, height: 16 }} /></>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
