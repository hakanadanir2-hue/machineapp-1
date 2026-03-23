"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, Brain, Dumbbell, Apple, FileText, Flame, Activity } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { FitnessProgramData } from "@/types";

const schema = z.object({
  full_name: z.string().min(2, "Ad soyad gerekli"),
  email: z.string().email("Geçerli e-posta girin"),
  gender: z.enum(["male", "female"]),
  age: z.coerce.number().min(15, "En az 15 olmalı").max(80, "En fazla 80 olmalı"),
  weight: z.coerce.number().min(40, "En az 40 kg").max(200, "En fazla 200 kg"),
  height: z.coerce.number().min(140, "En az 140 cm").max(220, "En fazla 220 cm"),
  goal: z.enum(["weight_loss", "muscle_gain", "maintenance", "boxing"]),
  activity_level: z.enum(["sedentary", "light", "moderate", "active", "extra_active"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
});

type FormData = z.infer<typeof schema>;

const STEPS = ["Kişisel Bilgiler", "Ölçüler", "Hedef & Seviye", "Programın Hazır"];

const GOAL_OPTIONS = [
  { value: "weight_loss", label: "Kilo Verme", emoji: "🔥" },
  { value: "muscle_gain", label: "Kas Kazanma", emoji: "💪" },
  { value: "maintenance", label: "Form Koruma", emoji: "⚖️" },
  { value: "boxing", label: "Boks Performansı", emoji: "🥊" },
];

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedanter", sub: "Masa başı, hareket yok" },
  { value: "light", label: "Hafif Aktif", sub: "Haftada 1–3 gün" },
  { value: "moderate", label: "Orta Aktif", sub: "Haftada 3–5 gün" },
  { value: "active", label: "Çok Aktif", sub: "Haftada 6–7 gün" },
  { value: "extra_active", label: "Ekstra Aktif", sub: "Günde 2x antrenman" },
];

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Başlangıç", sub: "0–6 ay" },
  { value: "intermediate", label: "Orta", sub: "6 ay–2 yıl" },
  { value: "advanced", label: "İleri", sub: "2+ yıl" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.875rem 1rem",
  background: "#111111",
  border: "1px solid #2A2A2A",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "0.9375rem",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "rgba(255,255,255,0.65)",
  fontSize: "0.875rem",
  fontWeight: 500,
  marginBottom: "0.5rem",
};

export default function ProgramAlPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<FitnessProgramData | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as Resolver<FormData, any>,
    defaultValues: { gender: "male", goal: "weight_loss", activity_level: "moderate", level: "beginner" },
  });

  const watched = watch();

  const validateStep = async () => {
    const map: Record<number, (keyof FormData)[]> = {
      0: ["full_name", "email", "gender"],
      1: ["age", "weight", "height"],
      2: ["goal", "activity_level", "level"],
    };
    return trigger(map[step] || []);
  };

  const handleNext = async () => {
    if (step < 2) {
      const ok = await validateStep();
      if (ok) setStep(s => s + 1);
    } else if (step === 2) {
      setLoading(true);
      setGenError(null);
      try {
        const res = await fetch("/api/programs/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(watched),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Program oluşturulamadı");
        setPreview(data.program);
        setStep(3);
      } catch (e) {
        setGenError(e instanceof Error ? e.message : "Bir hata oluştu. Lütfen tekrar deneyin.");
      }
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "program", amount: 199, email: watched.email, full_name: watched.full_name }),
      });
      const data = await res.json();
      if (data.iframeToken) {
        window.location.href = `https://www.paytr.com/odeme/guvenli/${data.iframeToken}`;
      }
    } catch {
      // handle error
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0B0B0B" }}>

        {/* Page Hero */}
        <div style={{ paddingTop: "96px", paddingBottom: "3.5rem", background: "linear-gradient(to bottom, #111111, #0B0B0B)", borderBottom: "1px solid rgba(106,13,37,0.15)" }}>
          <div className="page-container" style={{ textAlign: "center" }}>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>ACSM · NASM · NSCA Bilimsel Altyapı</p>
            <h1 style={{ fontSize: "clamp(1.875rem, 5vw, 3rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)", marginBottom: "0.875rem" }}>
              Beslenme ve Fitness Programı
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", maxWidth: "34rem", marginInline: "auto", lineHeight: 1.7 }}>
              Kişisel ölçülerinize ve hedefinize göre hazırlanmış 8 haftalık antrenman + beslenme planı — sadece ₺199
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="page-container" style={{ paddingTop: "2.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.875rem", marginBottom: "3rem" }}>
            {[
              { icon: Dumbbell, text: "8 Haftalık Antrenman Programı" },
              { icon: Apple, text: "Kişisel Beslenme Planı" },
              { icon: Flame, text: "Kalori & Makro Hesabı" },
              { icon: Activity, text: "BMR & TDEE Analizi" },
              { icon: FileText, text: "PDF Formatında Teslim" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.875rem 1rem", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "12px" }}>
                <Icon style={{ width: "18px", height: "18px", color: "#D4AF37", flexShrink: 0 }} />
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8125rem", lineHeight: 1.4 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="page-container" style={{ paddingBottom: "5rem" }}>
          <div style={{ maxWidth: "600px", marginInline: "auto" }}>

            {/* Progress Bar */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    transition: "all 0.3s",
                    background: i <= step ? "#6A0D25" : "#1A1A1A",
                    border: i <= step ? "1px solid rgba(212,175,55,0.5)" : "1px solid #2A2A2A",
                    color: i <= step ? "#D4AF37" : "rgba(255,255,255,0.3)",
                  }}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: "2px", margin: "0 0.375rem", background: i < step ? "rgba(212,175,55,0.4)" : "#2A2A2A", transition: "background 0.3s" }} />
                  )}
                </div>
              ))}
            </div>

            {/* Card */}
            <div style={{ background: "#1A1A1A", borderRadius: "20px", border: "1px solid #2A2A2A", padding: "2rem" }}>
              <AnimatePresence mode="wait">

                {/* Step 0: Personal Info */}
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", fontFamily: "var(--font-heading)", marginBottom: "1.75rem" }}>Kişisel Bilgiler</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      <div>
                        <label style={labelStyle}>Ad Soyad</label>
                        <input {...register("full_name")} placeholder="Adın Soyadın" style={inputStyle} />
                        {errors.full_name && <p style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "0.375rem" }}>{errors.full_name.message}</p>}
                      </div>
                      <div>
                        <label style={labelStyle}>E-posta</label>
                        <input {...register("email")} type="email" placeholder="ornek@mail.com" style={inputStyle} />
                        {errors.email && <p style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "0.375rem" }}>{errors.email.message}</p>}
                      </div>
                      <div>
                        <label style={labelStyle}>Cinsiyet</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                          {[{ v: "male", l: "Erkek" }, { v: "female", l: "Kadın" }].map(opt => (
                            <label key={opt.v} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0.875rem", borderRadius: "12px", border: `1px solid ${watched.gender === opt.v ? "rgba(212,175,55,0.5)" : "#2A2A2A"}`, background: watched.gender === opt.v ? "rgba(106,13,37,0.2)" : "transparent", color: watched.gender === opt.v ? "#D4AF37" : "rgba(255,255,255,0.5)", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", transition: "all 0.2s" }}>
                              <input {...register("gender")} type="radio" value={opt.v} style={{ display: "none" }} />
                              {opt.l}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 1: Measurements */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", fontFamily: "var(--font-heading)", marginBottom: "1.75rem" }}>Ölçüleriniz</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      {[
                        { name: "age" as const, label: "Yaş", unit: "yaş", placeholder: "25" },
                        { name: "weight" as const, label: "Kilo", unit: "kg", placeholder: "75" },
                        { name: "height" as const, label: "Boy", unit: "cm", placeholder: "175" },
                      ].map(field => (
                        <div key={field.name}>
                          <label style={labelStyle}>{field.label}</label>
                          <div style={{ position: "relative" }}>
                            <input {...register(field.name)} type="number" placeholder={field.placeholder} style={{ ...inputStyle, paddingRight: "3.5rem" }} />
                            <span style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", fontSize: "0.875rem" }}>{field.unit}</span>
                          </div>
                          {errors[field.name] && <p style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "0.375rem" }}>{errors[field.name]?.message}</p>}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Goal & Level */}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", fontFamily: "var(--font-heading)", marginBottom: "1.75rem" }}>Hedef & Seviye</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                      <div>
                        <label style={labelStyle}>Hedefin ne?</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                          {GOAL_OPTIONS.map(opt => (
                            <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem", borderRadius: "12px", border: `1px solid ${watched.goal === opt.value ? "rgba(212,175,55,0.5)" : "#2A2A2A"}`, background: watched.goal === opt.value ? "rgba(106,13,37,0.2)" : "transparent", cursor: "pointer", transition: "all 0.2s" }}>
                              <input {...register("goal")} type="radio" value={opt.value} style={{ display: "none" }} />
                              <span style={{ fontSize: "1.125rem" }}>{opt.emoji}</span>
                              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: watched.goal === opt.value ? "#D4AF37" : "rgba(255,255,255,0.6)" }}>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Aktivite seviyesi</label>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {ACTIVITY_OPTIONS.map(opt => (
                            <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.875rem 1rem", borderRadius: "12px", border: `1px solid ${watched.activity_level === opt.value ? "rgba(212,175,55,0.5)" : "#2A2A2A"}`, background: watched.activity_level === opt.value ? "rgba(106,13,37,0.2)" : "transparent", cursor: "pointer", transition: "all 0.2s" }}>
                              <input {...register("activity_level")} type="radio" value={opt.value} style={{ display: "none" }} />
                              <div>
                                <p style={{ fontSize: "0.875rem", fontWeight: 600, color: watched.activity_level === opt.value ? "#D4AF37" : "rgba(255,255,255,0.7)" }}>{opt.label}</p>
                                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>{opt.sub}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Antrenman seviyesi</label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
                          {LEVEL_OPTIONS.map(opt => (
                            <label key={opt.value} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.875rem 0.5rem", borderRadius: "12px", border: `1px solid ${watched.level === opt.value ? "rgba(212,175,55,0.5)" : "#2A2A2A"}`, background: watched.level === opt.value ? "rgba(106,13,37,0.2)" : "transparent", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
                              <input {...register("level")} type="radio" value={opt.value} style={{ display: "none" }} />
                              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: watched.level === opt.value ? "#D4AF37" : "rgba(255,255,255,0.6)" }}>{opt.label}</span>
                              <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.3)", marginTop: "0.25rem" }}>{opt.sub}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Hata Mesajı */}
                {genError && (
                  <div style={{ margin: "1rem 0", padding: "12px 16px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 10, color: "#f87171", fontSize: 14 }}>
                    {genError}
                  </div>
                )}

                {/* Step 3: Preview & Payment */}
                {step === 3 && preview && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
                      <CheckCircle style={{ width: "24px", height: "24px", color: "#4ade80", flexShrink: 0 }} />
                      <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", fontFamily: "var(--font-heading)" }}>Programın Hazırlandı!</h2>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
                      {[
                        { icon: Brain, label: "BMR", value: `${preview.bmr} kcal` },
                        { icon: Activity, label: "TDEE", value: `${preview.tdee} kcal` },
                        { icon: Flame, label: "Hedef Kalori", value: `${preview.targetCalories} kcal` },
                        { icon: Apple, label: "Günlük Protein", value: `${preview.nutrition.protein}g` },
                      ].map(item => {
                        const Icon = item.icon;
                        return (
                          <div key={item.label} style={{ background: "#111111", borderRadius: "12px", padding: "1rem", border: "1px solid #2A2A2A" }}>
                            <Icon style={{ width: "18px", height: "18px", color: "#D4AF37", marginBottom: "0.5rem" }} />
                            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>{item.label}</p>
                            <p style={{ color: "#fff", fontWeight: 700, fontSize: "1.0625rem", marginTop: "0.25rem", fontFamily: "var(--font-heading)" }}>{item.value}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ background: "rgba(106,13,37,0.15)", borderRadius: "14px", padding: "1.125rem", border: "1px solid rgba(106,13,37,0.3)", marginBottom: "1.5rem" }}>
                      <p style={{ color: "#D4AF37", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.625rem" }}>Programın İçeriği:</p>
                      <ul style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                        {[
                          "8 Haftalık Antrenman Programı (haftada 3–5 gün)",
                          "Kişisel Beslenme Planı (5 öğün)",
                          "Kalori ve Makro Hedefleri",
                          "PDF Formatında Anında Teslim",
                          "ACSM/NASM/NSCA Bilimsel Altyapı",
                        ].map(item => (
                          <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)" }}>
                            <span style={{ color: "#4ade80", flexShrink: 0 }}>✓</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem", background: "#111111", borderRadius: "14px", border: "1px solid rgba(212,175,55,0.2)" }}>
                      <div>
                        <p style={{ color: "#fff", fontWeight: 800, fontSize: "1.75rem", fontFamily: "var(--font-heading)" }}>₺199</p>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginTop: "0.25rem" }}>Tek seferlik — Anında teslim</p>
                      </div>
                      <button
                        onClick={handlePayment}
                        disabled={loading}
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 1.5rem", background: "#D4AF37", color: "#0B0B0B", fontWeight: 800, fontSize: "0.9375rem", borderRadius: "12px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, border: "none" }}
                      >
                        {loading && <Loader2 style={{ width: "16px", height: "16px", animation: "spin 0.8s linear infinite" }} />}
                        Satın Al & İndir
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              {step < 3 && (
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
                  {step > 0 && (
                    <button
                      onClick={() => setStep(s => s - 1)}
                      style={{ padding: "0.875rem 1.25rem", background: "#111111", color: "rgba(255,255,255,0.6)", borderRadius: "12px", border: "1px solid #2A2A2A", cursor: "pointer", fontSize: "0.9375rem" }}
                    >
                      Geri
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={loading}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.875rem", background: "#6A0D25", color: "#fff", fontWeight: 700, fontSize: "0.9375rem", borderRadius: "12px", border: "1px solid rgba(212,175,55,0.3)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
                  >
                    {loading && <Loader2 style={{ width: "16px", height: "16px", animation: "spin 0.8s linear infinite" }} />}
                    {step === 2 ? "Programı Oluştur" : "Devam Et"}
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
