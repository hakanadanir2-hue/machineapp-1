"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import {
  Loader2, ChevronRight, ChevronLeft, CheckCircle,
  Dumbbell, MessageCircle, AlertCircle, Lock, ShieldAlert,
} from "lucide-react";

type Gender    = "male" | "female";
type Goal      = "weight_loss"|"muscle_gain"|"toning"|"maintenance"|"boxing"|"health";
type Level     = "beginner"|"intermediate"|"advanced";
type Equip     = "gym"|"home_basic"|"home_none"|"outdoor";
type Diet      = "standard"|"high_protein"|"low_carb"|"vegetarian"|"vegan";
type FocusArea = "chest"|"back"|"shoulders"|"arms"|"legs"|"core"|"glutes"|"cardio";
type Split     = "auto"|"full_body"|"ppl"|"upper_lower"|"5_day";
type CardioP   = "none"|"light"|"moderate"|"intense";
type InjuryArea = "omuz"|"bel"|"boyun"|"diz"|"bilek"|"kalca"|"ayak_bilegi";
type InjuryType = "none"|"kronik"|"akut"|"iyilesme";

interface F {
  full_name: string; email: string; gender: Gender;
  age: string; weight: string; height: string;
  goal: Goal; level: Level;
  weekly_days: number; session_duration: number;
  equipment: Equip; split_preference: Split;
  cardio_preference: CardioP; diet_preference: Diet;
  focus_areas: FocusArea[];
  injury_areas: InjuryArea[]; injury_type: InjuryType;
  pain_level: number;
  has_diagnosis: boolean | null; has_doctor_restriction: boolean | null;
  banned_movements: string; medical_notes: string; extra_notes: string;
  rf_chest_pain: boolean; rf_fainting: boolean; rf_dizziness: boolean;
  rf_numbness: boolean; rf_bowel: boolean; rf_trauma: boolean;
  rf_post_surgery: boolean; rf_resting_pain: boolean;
}
interface ProgramResult {
  programId: string; title: string; summary: string;
  bmi: number; bmiCategory: string; message: string;
  calories?: number; protein?: number; carb?: number;
  fat?: number; water_ml?: number;
}

const INP: React.CSSProperties = {
  width: "100%", padding: "0.875rem 1rem", background: "#111",
  border: "1px solid #2A2A2A", borderRadius: 12, color: "#fff",
  fontSize: "0.9375rem", outline: "none", boxSizing: "border-box",
};
const LBL: React.CSSProperties = {
  display: "block", color: "rgba(255,255,255,0.6)",
  fontSize: "0.8125rem", fontWeight: 500, marginBottom: "0.4rem",
};
const ERR: React.CSSProperties = {
  color: "#f87171", fontSize: "0.75rem", marginTop: 4,
  display: "flex", alignItems: "center", gap: 4,
};

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: "0.625rem 0.875rem", borderRadius: 10, cursor: "pointer",
      border: `1px solid ${active ? "rgba(212,175,55,0.5)" : "#2A2A2A"}`,
      background: active ? "rgba(106,13,37,0.3)" : "#111",
      color: active ? "#D4AF37" : "rgba(255,255,255,0.55)",
      fontWeight: active ? 700 : 500, fontSize: "0.875rem",
      textAlign: "left", transition: "all 0.15s",
    }}>
      {children}
    </button>
  );
}

const GOALS = [
  { v: "weight_loss", l: "Kilo Verme" }, { v: "muscle_gain", l: "Kas Kazanma" },
  { v: "toning", l: "Sikılaşma" }, { v: "maintenance", l: "Form Koruma" },
  { v: "boxing", l: "Boks Performansi" }, { v: "health", l: "Genel Saglik" },
];
const LVLS = [
  { v: "beginner", l: "Başlangic" }, { v: "intermediate", l: "Orta Seviye" }, { v: "advanced", l: "Ileri Seviye" },
];
const EQUIPS = [
  { v: "gym", l: "Spor Salonu" }, { v: "home_basic", l: "Evde Temel Ekipman" },
  { v: "home_none", l: "Ekipmansiz / Vücut" }, { v: "outdoor", l: "Disarisida / Park" },
];
const SPLITS = [
  { v: "auto",        l: "Otomatik Seç",       s: "AI hedef+güne göre seçer" },
  { v: "full_body",   l: "Full Body",           s: "Her seans tüm vücut" },
  { v: "ppl",         l: "Push / Pull / Legs",  s: "3 günlük döngü" },
  { v: "upper_lower", l: "Üst / Alt Bölünme",   s: "Gün atlayarak" },
  { v: "5_day",       l: "5 Gün Split",         s: "Muscle group bazlı" },
];
const CARDIOS = [
  { v: "none",     l: "Kardiyo Yok" }, { v: "light",    l: "Hafif (10-15dk)" },
  { v: "moderate", l: "Orta (20-30dk)" }, { v: "intense",  l: "Yogun (30dk+)" },
];
const DIETS = [
  { v: "standard", l: "Standart" }, { v: "high_protein", l: "Yüksek Protein" },
  { v: "low_carb", l: "Az Karbonhidrat" }, { v: "vegetarian", l: "Vejetaryen" },
  { v: "vegan", l: "Vegan" },
];
const FOCUS_AREAS = [
  { v: "chest", l: "Göğüs" }, { v: "back", l: "Sirt" },
  { v: "shoulders", l: "Omuz" }, { v: "arms", l: "Kollar" },
  { v: "legs", l: "Bacaklar" }, { v: "glutes", l: "Kalça / Glutes" },
  { v: "core", l: "Core / Karin" }, { v: "cardio", l: "Kardiyo / Kondisyon" },
];
const INJURY_AREAS = [
  { v: "omuz", l: "Omuz" }, { v: "bel", l: "Bel / Omurga" },
  { v: "boyun", l: "Boyun" }, { v: "diz", l: "Diz" },
  { v: "bilek", l: "Bilek / Dirsek" }, { v: "kalca", l: "Kalça / Hamstring" },
  { v: "ayak_bilegi", l: "Ayak Bilegi" },
];
const INJURY_TYPES = [
  { v: "kronik", l: "Kronik (süregelen)" }, { v: "akut", l: "Akut (yeni / aktif)" },
  { v: "iyilesme", l: "Iyileşme Sürecinde" },
];

const RED_FLAGS = [
  { k: "rf_chest_pain",      l: "Egzersiz sırasında göğüs ağrısı yaşıyorum" },
  { k: "rf_fainting",        l: "Bayılma veya neredeyse bayılma öykünüz var" },
  { k: "rf_dizziness",       l: "Ciddi / ani baş dönmesi şikayetim var" },
  { k: "rf_numbness",        l: "İlerleyici uyuşma veya bacaklarda güç kaybı var" },
  { k: "rf_bowel",           l: "İdrar / bağırsak kontrolünde yeni bir değişiklik oldu" },
  { k: "rf_trauma",          l: "Son 4 haftada ciddi bir travma geçirdim" },
  { k: "rf_post_surgery",    l: "Ameliyat sonrasındayım ve doktor egzersiz onayı vermedim" },
  { k: "rf_resting_pain",    l: "İstirahatte bile yüksek ağrım (7+) devam ediyor" },
] as { k: keyof F; l: string }[];

const RF_MESSAGES: Record<string, string> = {
  rf_chest_pain:   "Egzersiz sırasında göğüs ağrısı yaşıyorsunuz. Bu, kardiyak bir soruna işaret edebilir. Lütfen bir kardiyoloji veya iç hastalıkları uzmanına başvurunuz.",
  rf_fainting:     "Bayılma veya senkop öykünüz var. Egzersize başlamadan önce nörolojik veya kardiyolojik değerlendirme gereklidir.",
  rf_dizziness:    "Ciddi baş dönmesi yaşıyorsunuz. Bir kulak-burun-boğaz veya nöroloji uzmanına başvurmanızı öneririz.",
  rf_numbness:     "İlerleyici uyuşma veya güç kaybı ciddi bir sinir sıkışmasına veya disk sorununa işaret edebilir. Nöroloji/ortopedi değerlendirmesi önerilir.",
  rf_bowel:        "İdrar veya bağırsak kontrolünde ani değişiklik, cauda equina sendromu dahil ciddi durumları işaret edebilir. Lütfen acilen bir uzmana başvurunuz.",
  rf_trauma:       "Yeni bir travma geçirdiniz. Görüntüleme yapılmadan ve hekim onayı alınmadan egzersize başlanmaması gerekir.",
  rf_post_surgery: "Ameliyat sonrası dönemdesiniz. Egzersize dönüş için mutlaka cerrahınızın veya fizyoterapistinizin yazılı onayını alın.",
  rf_resting_pain: "İstirahatte bile yüksek ağrı yaşıyorsunuz. Bu durum, aktif patolojiyi işaret edebilir. Lütfen önce bir ortopedi veya fiziksel tıp uzmanına başvurunuz.",
};

const INIT: F = {
  full_name: "", email: "", gender: "male",
  age: "", weight: "", height: "",
  goal: "weight_loss", level: "beginner",
  weekly_days: 3, session_duration: 60,
  equipment: "gym", split_preference: "auto",
  cardio_preference: "light", diet_preference: "standard",
  focus_areas: [],
  injury_areas: [], injury_type: "none",
  pain_level: 0,
  has_diagnosis: null, has_doctor_restriction: null,
  banned_movements: "", medical_notes: "", extra_notes: "",
  rf_chest_pain: false, rf_fainting: false, rf_dizziness: false,
  rf_numbness: false, rf_bowel: false, rf_trauma: false,
  rf_post_surgery: false, rf_resting_pain: false,
};

const goalMap: Record<Goal, string> = {
  weight_loss: "kilo_ver", muscle_gain: "kas_kazan", toning: "kondisyon",
  maintenance: "saglikli_kal", boxing: "genel_fitness", health: "saglikli_kal",
};
const levelMap: Record<Level, string> = {
  beginner: "baslangic", intermediate: "orta", advanced: "ileri",
};
const equipMap: Record<Equip, string> = {
  gym: "spor salonu, tüm ekipman", home_basic: "dumbbell, resistance band",
  home_none: "vücut agırligi", outdoor: "acik alan, vücut agırligi",
};
const splitMap: Record<Split, string> = {
  auto: "otomatik_sec", full_body: "full_body",
  ppl: "push_pull_legs", upper_lower: "ust_alt", "5_day": "5_gun_split",
};
const cardioMap: Record<CardioP, string> = {
  none: "kardiyo_yok", light: "hafif_kardiyo",
  moderate: "orta_kardiyo", intense: "yogun_kardiyo",
};

function buildProfile(form: F) {
  return {
    full_name:            form.full_name,
    age:                  Number(form.age),
    gender:               form.gender === "male" ? "erkek" : "kadin",
    height_cm:            Number(form.height),
    weight_kg:            Number(form.weight),
    goal:                 goalMap[form.goal],
    fitness_level:        levelMap[form.level],
    days_per_week:        form.weekly_days,
    session_duration:     form.session_duration,
    available_equipment:  equipMap[form.equipment],
    split_preference:     splitMap[form.split_preference],
    cardio_preference:    cardioMap[form.cardio_preference],
    diet_preference:      form.diet_preference,
    focus_areas:          form.focus_areas,
    injury_areas:         form.injury_areas,
    injury_type:          form.injury_type,
    pain_level:           form.pain_level,
    has_diagnosis:        form.has_diagnosis,
    has_doctor_restriction: form.has_doctor_restriction,
    injuries:             form.injury_areas.length > 0
                            ? form.injury_areas.join(", ")
                            : undefined,
    banned_movements:     form.banned_movements || undefined,
    medical_notes:        form.medical_notes || undefined,
    extra_notes:          form.extra_notes || undefined,
  };
}

function getRedFlagMessage(form: F): { key: string; msg: string } | null {
  for (const { k } of RED_FLAGS) {
    if (form[k] === true) return { key: k, msg: RF_MESSAGES[k] ?? "Güvenlik endişesi var." };
  }
  return null;
}

export default function ProgramAlPage() {
  const router   = useRouter();
  const supabase = createClient();
  const topRef   = useRef<HTMLDivElement>(null);
  const [authUser, setAuthUser] = useState<User | null | undefined>(undefined);
  const [step, setStep]         = useState(0);
  const [form, setForm]         = useState<F>(INIT);
  const [errs, setErrs]         = useState<Partial<Record<keyof F, string>>>({});
  const [loading, setLoading]   = useState(false);
  const [transitioning, setTrans] = useState(false);
  const [kvkk, setKvkk]         = useState(false);
  const [kvkkErr, setKvkkErr]   = useState("");
  const [result, setResult]     = useState<ProgramResult | null>(null);
  const [apiErr, setApiErr]     = useState("");
  const [redFlagInfo, setRedFlagInfo] = useState<{ key: string; msg: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthUser(data.session?.user ?? null);
      if (data.session?.user) {
        const u = data.session.user;
        setForm(f => ({
          ...f,
          email:     u.email ?? f.email,
          full_name: (u.user_metadata?.full_name as string) ?? f.full_name,
        }));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fset = <K extends keyof F>(k: K, v: F[K]) => setForm(f => ({ ...f, [k]: v }));

  function validate(): boolean {
    const e: Partial<Record<keyof F, string>> = {};
    if (step === 0) {
      if (!form.full_name.trim()) e.full_name = "Ad soyad zorunludur";
      if (!form.email.trim()) e.email = "E-posta zorunludur";
      else if (!form.email.includes("@") || !form.email.includes(".")) e.email = "Geçerli e-posta girin";
      const age = Number(form.age), w = Number(form.weight), h = Number(form.height);
      if (!form.age || isNaN(age) || age < 15 || age > 80) e.age = "15–80 arası yaş girin";
      if (!form.weight || isNaN(w) || w < 40 || w > 200) e.weight = "40–200 kg arası değer girin";
      if (!form.height || isNaN(h) || h < 140 || h > 220) e.height = "140–220 cm arası değer girin";
    }
    setErrs(e);
    if (Object.keys(e).length > 0) topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    return Object.keys(e).length === 0;
  }

  const next = async () => {
    if (!validate()) return;

    if (step < 2) {
      setTrans(true);
      setTimeout(() => {
        setStep(s => s + 1);
        setTrans(false);
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return;
    }

    if (!kvkk) {
      setKvkkErr("Devam etmek için KVKK metnini onaylamanız zorunludur");
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      return;
    }
    setKvkkErr("");

    const rfInfo = getRedFlagMessage(form);
    if (rfInfo) {
      setRedFlagInfo(rfInfo);
      setStep(99);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setLoading(true);
    setApiErr("");
    try {
      const profile = buildProfile(form);
      const r = await fetch("/api/programs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, email: form.email, user_id: authUser?.id ?? null }),
        signal: AbortSignal.timeout(90000),
      });
      const text = await r.text();
      if (!text) throw new Error("Sunucu yanıt vermedi. Lütfen tekrar deneyin.");
      let d: Record<string, unknown>;
      try { d = JSON.parse(text); } catch { throw new Error("Sunucu geçersiz yanıt döndürdü."); }
      if (!r.ok) throw new Error((d.error as string) || `Sunucu hatası (${r.status})`);
      setResult({
        programId: d.programId as string, title: d.title as string,
        summary: d.summary as string, bmi: d.bmi as number,
        bmiCategory: d.bmiCategory as string, message: d.message as string,
        calories: d.calories as number | undefined,
        protein:  d.protein  as number | undefined,
        carb:     d.carb     as number | undefined,
        fat:      d.fat      as number | undefined,
        water_ml: d.water_ml as number | undefined,
      });
      setStep(3);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      setApiErr(e instanceof Error ? e.message : "Bir hata oluştu.");
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    } finally {
      setLoading(false);
    }
  };

  const isBusy = loading || transitioning;
  const CARD: React.CSSProperties = {
    background: "#1A1A1A", borderRadius: 20,
    border: "1px solid #2A2A2A", padding: "clamp(1.25rem,4vw,2rem)",
  };
  const NBTN = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "0.875rem", borderRadius: 12, fontWeight: 700,
    fontSize: "0.9375rem", cursor: isBusy ? "not-allowed" : "pointer",
    opacity: isBusy ? 0.7 : 1,
    background: active ? "#6A0D25" : "#1A1A1A",
    color: active ? "#fff" : "rgba(255,255,255,0.5)",
    border: active ? "1px solid rgba(212,175,55,0.3)" : "1px solid #2A2A2A",
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "0.375rem", transition: "opacity 0.15s",
  });

  const wa = `https://wa.me/903742701455?text=${encodeURIComponent(`Merhaba, AI programım hazır. Adım: ${form.full_name}. Programı görmek istiyorum.`)}`;

  if (authUser === undefined) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "100vh", background: "#0B0B0B", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={32} style={{ color: "#D4AF37", animation: "spin 1s linear infinite" }} />
        </main>
        <Footer />
      </>
    );
  }

  if (authUser === null) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "100vh", background: "#0B0B0B", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
          <div style={{ maxWidth: 440, width: "100%", background: "#111", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, padding: "2.5rem 2rem", textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(106,13,37,.25)", border: "1px solid rgba(106,13,37,.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <Lock size={24} style={{ color: "#D4AF37" }} />
            </div>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#fff", marginBottom: "0.75rem" }}>Giriş Yapmanız Gerekiyor</h2>
            <p style={{ color: "rgba(255,255,255,.45)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "2rem" }}>
              Kişisel fitness ve beslenme programı oluşturmak için üye olmanız veya giriş yapmanız gerekiyor.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button onClick={() => router.push("/kayit?redirect=/program-al")}
                style={{ width: "100%", padding: "0.875rem", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#7A0D2A,#5A0920)", color: "#fff", fontWeight: 800, fontSize: "1rem", cursor: "pointer" }}>
                Üye Ol (Ücretsiz)
              </button>
              <button onClick={() => router.push("/giris?redirect=/program-al")}
                style={{ width: "100%", padding: "0.875rem", borderRadius: 12, border: "1px solid rgba(255,255,255,.12)", background: "transparent", color: "rgba(255,255,255,.7)", fontWeight: 700, fontSize: "0.9375rem", cursor: "pointer" }}>
                Zaten Üyeyim — Giriş Yap
              </button>
            </div>
            <p style={{ color: "rgba(255,255,255,.25)", fontSize: "0.8125rem", marginTop: "1.5rem", lineHeight: 1.5 }}>
              Üyelik tamamen ücretsizdir.
            </p>
          </div>
        </main>
        <Footer />
        <WhatsAppButton />
      </>
    );
  }

  const STEP_LABELS = ["Profil", "Program", "Sağlık", "Sonuç"];

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0B0B0B" }}>
        <div style={{ paddingTop: 96, paddingBottom: "2.5rem", borderBottom: "1px solid rgba(106,13,37,0.12)" }}>
          <div className="page-container" style={{ textAlign: "center" }}>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Kişisel Program</p>
            <h1 style={{ fontSize: "clamp(1.75rem,5vw,2.75rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)", marginBottom: "0.75rem" }}>Beslenme &amp; Fitness Programı</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9375rem", maxWidth: "34rem", marginInline: "auto" }}>Yapay zeka ile tamamen kişiye özel — ücretsiz</p>
          </div>
        </div>

        <div className="page-container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
          <div style={{ maxWidth: 600, marginInline: "auto" }}>
            <div ref={topRef} style={{ scrollMarginTop: 80 }} />

            {/* Step indicator */}
            {step !== 99 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.75rem" }}>
                {STEP_LABELS.map((label, i) => {
                  const displayStep = step === 99 ? 2 : Math.min(step, 3);
                  return (
                    <div key={label} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : "none" }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.75rem", fontWeight: 700,
                        background: i < displayStep ? "#4ade80" : i === displayStep ? "#6A0D25" : "#1A1A1A",
                        border: i === displayStep ? "1px solid rgba(212,175,55,0.5)" : "1px solid transparent",
                        color: i < displayStep ? "#000" : i === displayStep ? "#D4AF37" : "rgba(255,255,255,0.3)",
                        transition: "all 0.2s",
                      }}>
                        {i < displayStep ? "✓" : i + 1}
                      </div>
                      {i < 3 && (
                        <div style={{
                          flex: 1, height: 2, margin: "0 6px",
                          background: i < displayStep ? "rgba(74,222,128,0.4)" : "#2A2A2A",
                          transition: "background 0.3s",
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Step 0: Profil ── */}
            {step === 0 && (
              <div style={CARD}>
                <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.125rem", fontFamily: "var(--font-heading)", marginBottom: "1.5rem" }}>Kişisel Bilgiler &amp; Hedef</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
                  <div>
                    <label style={LBL}>Ad Soyad *</label>
                    <input value={form.full_name} onChange={e => fset("full_name", e.target.value)} placeholder="Adınız Soyadınız"
                      style={{ ...INP, border: errs.full_name ? "1px solid #f87171" : INP.border }} />
                    {errs.full_name && <p style={ERR}><AlertCircle size={12} />{errs.full_name}</p>}
                  </div>
                  <div>
                    <label style={LBL}>E-posta *</label>
                    <input value={form.email} onChange={e => fset("email", e.target.value)} type="email" placeholder="ornek@mail.com"
                      style={{ ...INP, border: errs.email ? "1px solid #f87171" : INP.border }} />
                    {errs.email && <p style={ERR}><AlertCircle size={12} />{errs.email}</p>}
                  </div>
                  <div>
                    <label style={LBL}>Cinsiyet</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
                      <Chip active={form.gender === "male"} onClick={() => fset("gender", "male")}>Erkek</Chip>
                      <Chip active={form.gender === "female"} onClick={() => fset("gender", "female")}>Kadın</Chip>
                    </div>
                  </div>
                  {([
                    { k: "age", l: "Yaş", u: "yaş", p: "25", min: 15, max: 80 },
                    { k: "weight", l: "Kilo", u: "kg", p: "75", min: 40, max: 200 },
                    { k: "height", l: "Boy", u: "cm", p: "175", min: 140, max: 220 },
                  ] as const).map(f => (
                    <div key={f.k}>
                      <label style={LBL}>{f.l} *</label>
                      <div style={{ position: "relative" }}>
                        <input type="number" value={form[f.k]} placeholder={f.p} min={f.min} max={f.max}
                          onChange={e => fset(f.k, e.target.value as never)}
                          style={{ ...INP, paddingRight: "3.5rem", border: errs[f.k] ? "1px solid #f87171" : INP.border }} />
                        <span style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", fontSize: "0.875rem", pointerEvents: "none" }}>{f.u}</span>
                      </div>
                      {errs[f.k] && <p style={ERR}><AlertCircle size={12} />{errs[f.k]}</p>}
                    </div>
                  ))}
                  <div>
                    <label style={LBL}>Hedefiniz</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                      {GOALS.map(o => <Chip key={o.v} active={form.goal === o.v} onClick={() => fset("goal", o.v as Goal)}>{o.l}</Chip>)}
                    </div>
                  </div>
                  <div>
                    <label style={LBL}>Antrenman Deneyimi</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.5rem" }}>
                      {LVLS.map(o => <Chip key={o.v} active={form.level === o.v} onClick={() => fset("level", o.v as Level)}>{o.l}</Chip>)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 1: Program ── */}
            {step === 1 && (
              <div style={CARD}>
                <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.125rem", fontFamily: "var(--font-heading)", marginBottom: "1.5rem" }}>Program Tercihleri</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div>
                    <label style={LBL}>Haftalık Antrenman Günü</label>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      {[1, 2, 3, 4, 5, 6, 7].map(d => (
                        <button key={d} type="button" onClick={() => fset("weekly_days", d)}
                          style={{ flex: 1, padding: "0.625rem 0", borderRadius: 10, cursor: "pointer", border: `1px solid ${form.weekly_days === d ? "rgba(212,175,55,0.5)" : "#2A2A2A"}`, background: form.weekly_days === d ? "rgba(106,13,37,0.3)" : "#111", color: form.weekly_days === d ? "#D4AF37" : "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: "0.875rem", transition: "all 0.15s" }}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={LBL}>Seans Süresi</label>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      {([30, 45, 60, 75, 90] as const).map(m => (
                        <button key={m} type="button" onClick={() => fset("session_duration", m)}
                          style={{ flex: 1, padding: "0.625rem 0", borderRadius: 10, cursor: "pointer", border: `1px solid ${form.session_duration === m ? "rgba(212,175,55,0.5)" : "#2A2A2A"}`, background: form.session_duration === m ? "rgba(106,13,37,0.3)" : "#111", color: form.session_duration === m ? "#D4AF37" : "rgba(255,255,255,0.4)", fontWeight: 600, fontSize: "0.8rem", transition: "all 0.15s" }}>
                          {m}dk
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={LBL}>Ekipman Durumu</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                      {EQUIPS.map(o => <Chip key={o.v} active={form.equipment === o.v} onClick={() => fset("equipment", o.v as Equip)}>{o.l}</Chip>)}
                    </div>
                  </div>
                  <div>
                    <label style={LBL}>Tercih Edilen Split <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400, fontSize: "0.75rem" }}>(AI&#39;nın nasıl böleceği)</span></label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {SPLITS.map(o => (
                        <Chip key={o.v} active={form.split_preference === o.v} onClick={() => fset("split_preference", o.v as Split)}>
                          <span style={{ fontWeight: 600 }}>{o.l}</span>
                          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", marginLeft: 8 }}>{o.s}</span>
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={LBL}>Kardiyo Tercihi</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                      {CARDIOS.map(o => <Chip key={o.v} active={form.cardio_preference === o.v} onClick={() => fset("cardio_preference", o.v as CardioP)}>{o.l}</Chip>)}
                    </div>
                  </div>
                  <div>
                    <label style={LBL}>Odaklanılacak Bölgeler <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400, fontSize: "0.75rem" }}>(isteğe bağlı)</span></label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                      {FOCUS_AREAS.map(o => {
                        const active = form.focus_areas.includes(o.v as FocusArea);
                        return (
                          <button key={o.v} type="button"
                            onClick={() => fset("focus_areas", active ? form.focus_areas.filter(x => x !== o.v) : [...form.focus_areas, o.v as FocusArea])}
                            style={{ padding: "0.6rem 0.75rem", borderRadius: 10, cursor: "pointer", border: `1px solid ${active ? "rgba(212,175,55,0.5)" : "#2A2A2A"}`, background: active ? "rgba(106,13,37,0.3)" : "#111", color: active ? "#D4AF37" : "rgba(255,255,255,0.55)", fontWeight: active ? 700 : 500, fontSize: "0.8125rem", textAlign: "left", transition: "all 0.15s" }}>
                            {active ? "✓ " : ""}{o.l}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label style={LBL}>Beslenme Tercihi</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                      {DIETS.map(o => <Chip key={o.v} active={form.diet_preference === o.v} onClick={() => fset("diet_preference", o.v as Diet)}>{o.l}</Chip>)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Sağlık ── */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* Injury areas */}
                <div style={CARD}>
                  <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.125rem", fontFamily: "var(--font-heading)", marginBottom: "0.5rem" }}>Ağrı / Sakatlık Bölgesi</h2>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8125rem", marginBottom: "1rem" }}>Yoksa hiçbirini seçmeden devam edebilirsiniz.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
                    {INJURY_AREAS.map(o => {
                      const active = form.injury_areas.includes(o.v as InjuryArea);
                      return (
                        <button key={o.v} type="button"
                          onClick={() => fset("injury_areas", active ? form.injury_areas.filter(x => x !== o.v) : [...form.injury_areas, o.v as InjuryArea])}
                          style={{ padding: "0.625rem 0.875rem", borderRadius: 10, cursor: "pointer", border: `1px solid ${active ? "rgba(250,204,21,0.5)" : "#2A2A2A"}`, background: active ? "rgba(120,60,0,0.25)" : "#111", color: active ? "#facc15" : "rgba(255,255,255,0.55)", fontWeight: active ? 700 : 500, fontSize: "0.875rem", textAlign: "left", transition: "all 0.15s" }}>
                          {active ? "⚠ " : ""}{o.l}
                        </button>
                      );
                    })}
                  </div>

                  {form.injury_areas.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.125rem" }}>
                      <div>
                        <label style={LBL}>Durum Tipi</label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.5rem" }}>
                          {INJURY_TYPES.map(o => <Chip key={o.v} active={form.injury_type === o.v} onClick={() => fset("injury_type", o.v as InjuryType)}>{o.l}</Chip>)}
                        </div>
                      </div>
                      <div>
                        <label style={LBL}>Ağrı Seviyesi: <strong style={{ color: form.pain_level >= 7 ? "#f87171" : form.pain_level >= 4 ? "#facc15" : "#4ade80" }}>{form.pain_level} / 10</strong></label>
                        <input type="range" min={0} max={10} step={1} value={form.pain_level}
                          onChange={e => fset("pain_level", Number(e.target.value))}
                          style={{ width: "100%", accentColor: form.pain_level >= 7 ? "#f87171" : form.pain_level >= 4 ? "#facc15" : "#4ade80", cursor: "pointer" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.25)", fontSize: "0.6875rem", marginTop: 4 }}>
                          <span>0 - Ağrı Yok</span><span>5 - Orta</span><span>10 - Çok Şiddetli</span>
                        </div>
                      </div>
                      <div>
                        <label style={LBL}>Kesin Tanı Var mı?</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                          <Chip active={form.has_diagnosis === true} onClick={() => fset("has_diagnosis", true)}>Evet (tanı var)</Chip>
                          <Chip active={form.has_diagnosis === false} onClick={() => fset("has_diagnosis", false)}>Hayır / Belirsiz</Chip>
                        </div>
                      </div>
                      <div>
                        <label style={LBL}>Doktor / Fizyoterapist Kısıtı Var mı?</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                          <Chip active={form.has_doctor_restriction === true} onClick={() => fset("has_doctor_restriction", true)}>Evet, kısıt var</Chip>
                          <Chip active={form.has_doctor_restriction === false} onClick={() => fset("has_doctor_restriction", false)}>Hayır</Chip>
                        </div>
                      </div>
                      <div>
                        <label style={LBL}>Kesinlikle Yapılmaması Gereken Hareketler</label>
                        <input value={form.banned_movements} onChange={e => fset("banned_movements", e.target.value)}
                          placeholder="örn: deadlift, squat, overhead press"
                          style={INP} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Medical notes */}
                <div style={CARD}>
                  <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.125rem", fontFamily: "var(--font-heading)", marginBottom: "1rem" }}>Sağlık Geçmişi</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label style={LBL}>İlaç / Kronik Hastalık / Tansiyon / Kalp / Diyabet</label>
                      <textarea value={form.medical_notes} onChange={e => fset("medical_notes", e.target.value)}
                        rows={2} placeholder="Düzenli ilaç kullanıyorsanız veya kronik hastalığınız varsa belirtin" style={{ ...INP, resize: "vertical" }} />
                    </div>
                    <div>
                      <label style={LBL}>Ek Not</label>
                      <textarea value={form.extra_notes} onChange={e => fset("extra_notes", e.target.value)}
                        rows={2} placeholder="Antrenörüne özel not (opsiyonel)" style={{ ...INP, resize: "vertical" }} />
                    </div>
                  </div>
                </div>

                {/* Red flags */}
                <div style={{ background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 20, padding: "clamp(1.25rem,4vw,1.75rem)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <ShieldAlert size={16} style={{ color: "#f87171", flexShrink: 0 }} />
                    <h3 style={{ color: "#f87171", fontWeight: 700, fontSize: "0.9375rem" }}>Güvenlik Soruları</h3>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", marginBottom: "1rem", lineHeight: 1.5 }}>
                    Aşağıdaki durumlardan herhangi biri varsa programı üretmek yerine uzman yönlendirmesi yapılır.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {RED_FLAGS.map(({ k, l }) => (
                      <label key={k} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", cursor: "pointer" }}>
                        <input type="checkbox" checked={form[k] as boolean} onChange={e => fset(k, e.target.checked as never)}
                          style={{ marginTop: 3, accentColor: "#f87171", width: 16, height: 16, flexShrink: 0, cursor: "pointer" }} />
                        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem", lineHeight: 1.5 }}>{l}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* KVKK */}
                <div style={{ background: kvkkErr ? "rgba(248,113,113,0.06)" : "rgba(212,175,55,0.06)", border: `1px solid ${kvkkErr ? "rgba(248,113,113,0.4)" : "rgba(212,175,55,0.15)"}`, borderRadius: 10, padding: "0.875rem", transition: "border-color 0.2s" }}>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={kvkk} onChange={e => { setKvkk(e.target.checked); if (e.target.checked) setKvkkErr(""); }}
                      style={{ marginTop: 3, accentColor: "#6A0D25", width: 16, height: 16, flexShrink: 0, cursor: "pointer" }} />
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", lineHeight: 1.6 }}>
                      Kişisel verilerimin (ad, e-posta, sağlık bilgileri) Machine Gym tarafından program oluşturma amacıyla işlenmesini onaylıyorum.{" "}
                      <a href="/kvkk" target="_blank" style={{ color: "#D4AF37", textDecoration: "underline" }}>KVKK Metni</a>
                    </span>
                  </label>
                  {kvkkErr && (
                    <p style={{ color: "#f87171", fontSize: "0.8125rem", marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                      <AlertCircle size={14} />{kvkkErr}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 99: Red Flag Screen ── */}
            {step === 99 && redFlagInfo && (
              <div style={{ background: "#1A0808", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 20, padding: "clamp(1.5rem,4vw,2.5rem)", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.35)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                  <ShieldAlert size={28} style={{ color: "#f87171" }} />
                </div>
                <h2 style={{ color: "#f87171", fontWeight: 800, fontSize: "1.25rem", marginBottom: "1rem" }}>Güvenlik Değerlendirmesi Gerekiyor</h2>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: "1.5rem", maxWidth: 480, marginInline: "auto" }}>
                  {redFlagInfo.msg}
                </p>
                <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 12, padding: "1rem", marginBottom: "1.5rem", textAlign: "left" }}>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem", lineHeight: 1.6 }}>
                    Bu sistem bir sağlık profesyonelinin yerini tutamaz. Bildirilen durum, tıbbi değerlendirme gerektiriyor. Uzman onayı sonrasında tekrar program oluşturabilirsiniz.
                  </p>
                </div>
                <button onClick={() => { setStep(2); setRedFlagInfo(null); topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 2rem", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: "0.9375rem" }}>
                  <ChevronLeft size={16} />Geri Dön
                </button>
              </div>
            )}

            {/* ── Step 3: Sonuç ── */}
            {step === 3 && result && (
              <div style={CARD}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  <CheckCircle style={{ width: 28, height: 28, color: "#4ade80", flexShrink: 0 }} />
                  <div>
                    <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.125rem", fontFamily: "var(--font-heading)", marginBottom: "0.2rem" }}>{result.title}</h2>
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8125rem" }}>Kişisel fitness ve beslenme programın hazır</p>
                  </div>
                </div>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>{result.summary}</p>

                {/* 4 kart: BMI + Kalori + Protein + Karb */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  <div style={{ background: "#111", borderRadius: 12, padding: "0.875rem", border: "1px solid #2A2A2A" }}>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6875rem", marginBottom: "0.375rem" }}>BMI</p>
                    <p style={{ color: "#D4AF37", fontWeight: 800, fontSize: "1.0625rem", fontFamily: "var(--font-heading)" }}>{result.bmi}</p>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.6875rem" }}>{result.bmiCategory}</p>
                  </div>
                  <div style={{ background: "#111", borderRadius: 12, padding: "0.875rem", border: "1px solid #2A2A2A" }}>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6875rem", marginBottom: "0.375rem" }}>Günlük Kalori</p>
                    <p style={{ color: "#facc15", fontWeight: 800, fontSize: "1.0625rem", fontFamily: "var(--font-heading)" }}>{result.calories ? `${result.calories.toLocaleString("tr-TR")} kcal` : "—"}</p>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.6875rem" }}>Kişisel TDEE hesabı</p>
                  </div>
                  <div style={{ background: "#111", borderRadius: 12, padding: "0.875rem", border: "1px solid #2A2A2A" }}>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6875rem", marginBottom: "0.375rem" }}>Protein</p>
                    <p style={{ color: "#4ade80", fontWeight: 800, fontSize: "1.0625rem", fontFamily: "var(--font-heading)" }}>{result.protein ? `${result.protein}g` : "—"}</p>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.6875rem" }}>Günlük hedef</p>
                  </div>
                  <div style={{ background: "#111", borderRadius: 12, padding: "0.875rem", border: "1px solid #2A2A2A" }}>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6875rem", marginBottom: "0.375rem" }}>Karbonhidrat</p>
                    <p style={{ color: "#60a5fa", fontWeight: 800, fontSize: "1.0625rem", fontFamily: "var(--font-heading)" }}>{result.carb ? `${result.carb}g` : "—"}</p>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.6875rem" }}>Yağ: {result.fat ? `${result.fat}g` : "—"} · Su: {result.water_ml ? `${(result.water_ml / 1000).toFixed(1)}L` : "—"}</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, padding: "1rem", background: "rgba(74,222,128,0.06)", borderRadius: 12, border: "1px solid rgba(74,222,128,0.15)", marginBottom: "1rem", alignItems: "flex-start" }}>
                  <Dumbbell style={{ width: 18, height: 18, color: "#4ade80", flexShrink: 0, marginTop: 2 }} />
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem", lineHeight: 1.6 }}>
                    Antrenman programın ve kişisel beslenme planın oluşturuldu. Admin onayından sonra e-posta veya WhatsApp ile sana iletilecek.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {authUser && (
                    <button
                      onClick={() => router.push("/dashboard/programlarim")}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", padding: "0.875rem", background: "rgba(96,165,250,0.15)", color: "#60a5fa", fontWeight: 700, fontSize: "0.9375rem", borderRadius: 12, border: "1px solid rgba(96,165,250,0.3)", cursor: "pointer", boxSizing: "border-box" }}>
                      Programlarımı Gör →
                    </button>
                  )}
                  <a href={wa} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", padding: "0.875rem", background: "#6A0D25", color: "#fff", fontWeight: 700, fontSize: "0.9375rem", borderRadius: 12, border: "1px solid rgba(212,175,55,0.3)", textDecoration: "none", boxSizing: "border-box" }}>
                    <MessageCircle style={{ width: 18, height: 18 }} />WhatsApp ile Takip Et
                  </a>
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {loading && (
              <div style={{ marginTop: "1rem", padding: "1rem", background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 12, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Loader2 style={{ width: 18, height: 18, color: "#D4AF37", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                <div>
                  <p style={{ color: "#D4AF37", fontWeight: 700, fontSize: "0.875rem" }}>AI programın oluşturuluyor...</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", marginTop: 2 }}>Sakatlık filtresi + kişiselleştirme — 30–60 saniye sürebilir</p>
                </div>
              </div>
            )}

            {/* API Error */}
            {apiErr && (
              <div style={{ marginTop: "1rem", padding: "0.875rem 1rem", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 10, display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                <AlertCircle style={{ width: 16, height: 16, color: "#f87171", flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ color: "#f87171", fontSize: "0.875rem", fontWeight: 600, marginBottom: 2 }}>Program oluşturulamadı</p>
                  <p style={{ color: "rgba(248,113,113,0.7)", fontSize: "0.8125rem" }}>{apiErr}</p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            {step < 3 && step !== 99 && (
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                {step > 0 && (
                  <button onClick={() => { setStep(s => s - 1); topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                    disabled={isBusy} style={NBTN(false)}>
                    <ChevronLeft style={{ width: 16, height: 16 }} />Geri
                  </button>
                )}
                <button onClick={next} disabled={isBusy} style={NBTN(true)}>
                  {(loading || transitioning) ? <Loader2 style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }} /> : null}
                  {loading ? "Oluşturuluyor..." : transitioning ? "..." : step === 2 ? "Programı Oluştur" : "Devam Et"}
                  {!isBusy && step < 2 && <ChevronRight style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
