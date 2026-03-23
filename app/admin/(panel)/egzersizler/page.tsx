"use client";
import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, Pencil, Trash2, X, Search, Dumbbell,
  CheckCircle2, XCircle, ShieldCheck, Image as ImageIcon,
  ChevronDown, ChevronUp, Filter, Eye, EyeOff,
  Sparkles, RotateCcw, ThumbsUp, ThumbsDown, Loader2,
} from "lucide-react";

// ── Muscle group Turkish mapping ──────────────────────────────────────────────
const MUSCLE_MAP: Record<string, string> = {
  // wger English muscle names
  "anterior deltoid":          "Ön Omuz",
  "biceps brachii":            "Biceps",
  "brachialis":                "Ön Kol",
  "brachioradialis":           "Ön Kol",
  "gastrocnemius":             "Baldır",
  "gluteus maximus":           "Kalça",
  "hamstrings":                "Arka Bacak",
  "iliopsoas":                 "Kalça Fleksör",
  "infraspinatus":             "Arka Omuz",
  "latissimus dorsi":          "Sırt (Lat)",
  "obliquus externus abdominis": "Yan Karın",
  "pectoralis major":          "Göğüs",
  "quadriceps femoris":        "Ön Bacak",
  "rectus abdominis":          "Karın",
  "serratus anterior":         "Yan Göğüs",
  "soleus":                    "Baldır",
  "trapezius":                 "Trapez",
  "triceps brachii":           "Triceps",
  "teres major":               "Arka Omuz",
  "upper trapezius":           "Üst Sırt",
  // category names from wger
  "abs":                       "Karın",
  "back":                      "Sırt",
  "biceps":                    "Biceps",
  "calves":                    "Baldır",
  "cardio":                    "Kardiyo",
  "chest":                     "Göğüs",
  "forearms":                  "Ön Kol",
  "glutes":                    "Kalça",
  "hip flexors":               "Kalça",
  "legs":                      "Bacak",
  "quadriceps":                "Ön Bacak",
  "shoulders":                 "Omuz",
  "triceps":                   "Triceps",
  "upper arms":                "Kol",
  "upper legs":                "Üst Bacak",
  "lower back":                "Bel",
  "core":                      "Karın",
};

const EQUIPMENT_MAP: Record<string, string> = {
  "none (bodyweight exercise)": "Vücut Ağırlığı",
  "bodyweight":                 "Vücut Ağırlığı",
  "body weight":                "Vücut Ağırlığı",
  "barbell":                    "Halter",
  "dumbbell":                   "Dumbbell",
  "dumbbells":                  "Dumbbell",
  "kettlebell":                 "Kettlebell",
  "cable":                      "Kablo Makine",
  "machine":                    "Makine",
  "bands":                      "Direnç Bandı",
  "resistance band":            "Direnç Bandı",
  "pull-up bar":                "Barfiks Barı",
  "ez-bar":                     "EZ Bar",
  "gym mat":                    "Minder",
  "bench":                      "Bench",
  "foam roll":                  "Foam Roller",
  "incline bench":              "Eğik Bench",
  "decline bench":              "Düşük Bench",
  "swiss ball":                 "Pilates Topu",
  "bosu ball":                  "Bosu Topu",
  "trx":                        "TRX",
  "medicine ball":              "Medisin Topu",
  "box":                        "Step/Box",
  "plate":                      "Plaka",
  "chin-up bar":                "Barfiks Barı",
  "dip station":                "Dip Barı",
  "suspension trainer":         "Askı Sistemi",
};

// ── Helper functions ──────────────────────────────────────────────────────────

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/(?:^|\s|-)\S/g, (c) => c.toUpperCase()).trim();
}

/** Translate a raw muscle/category string to Turkish */
function muscleToTR(raw: string): string {
  const key = raw.trim().toLowerCase();
  return MUSCLE_MAP[key] ?? toTitleCase(raw.trim());
}

/** Resolve display name: DB override → auto title-case */
function resolveDisplayName(ex: { name: string; display_name?: string | null }): string {
  if (ex.display_name?.trim()) return ex.display_name.trim();
  if (!ex.name?.trim()) return "—";
  return toTitleCase(ex.name.trim());
}

/**
 * Resolve muscle group label:
 * 1. DB display_muscle_group (admin override)
 * 2. muscles field — first entry, translated
 * 3. category — translated
 * 4. "Genel" (never empty)
 */
function resolveMuscleGroup(ex: {
  muscles?: string | null;
  category?: string | null;
  display_muscle_group?: string | null;
}): string {
  if (ex.display_muscle_group?.trim()) return muscleToTR(ex.display_muscle_group.trim());
  const m = ex.muscles?.trim() ?? "";
  const c = ex.category?.trim() ?? "";
  if (m) {
    const first = m.split(",")[0].trim();
    return muscleToTR(first);
  }
  if (c) return muscleToTR(c);
  return "Genel";
}

/** Resolve all muscle groups as array (for expanded detail) */
function resolveMuscleList(muscles: string | null | undefined): string[] {
  if (!muscles?.trim()) return [];
  return [...new Set(
    muscles.split(",").map((p) => muscleToTR(p.trim())).filter(Boolean)
  )];
}

/** Normalize equipment string — never returns empty */
function resolveEquipment(equipment: unknown): string {
  if (!equipment || typeof equipment !== "string" || !equipment.trim()) return "Ekipmansız";
  const parts = equipment.split(",").map((p) => {
    const key = p.trim().toLowerCase();
    return EQUIPMENT_MAP[key] ?? toTitleCase(p.trim());
  });
  const unique = [...new Set(parts)].filter(Boolean);
  return unique.length ? unique.join(", ") : "Ekipmansız";
}

function safeStr(val: unknown, fallback = "—"): string {
  if (val === null || val === undefined || val === "") return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    const o = val as Record<string, unknown>;
    return String(o.name ?? o.title ?? fallback);
  }
  return String(val);
}

function uniqueSorted(arr: (string | null | undefined)[]): string[] {
  return [...new Set(arr.filter(Boolean) as string[])].sort();
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface ImageVersion {
  id: string;
  image_url: string;
  status: string;
  validation_score: number | null;
  validation_notes: string | null;
  prompt_confidence: number | null;
  created_at: string;
}

interface Exercise {
  id: string;
  name: string;
  display_name: string | null;
  display_muscle_group: string | null;
  category: string | null;
  muscles: string | null;
  equipment: string | null;
  difficulty: string | null;
  description: string | null;
  instructions: string | null;
  image_url: string | null;
  video_url: string | null;
  source: string | null;
  source_license: string | null;
  attribution_required: boolean;
  is_active: boolean;
  is_verified: boolean;
  wger_id: number | null;
  custom_image_url: string | null;
  image_source: string | null;
  image_status: string | null;
  created_at: string;
  updated_at?: string | null;
}

type FormData = {
  name: string;
  display_name: string;
  display_muscle_group: string;
  category: string;
  muscles: string;
  equipment: string;
  difficulty: string;
  description: string;
  instructions: string;
  image_url: string;
  video_url: string;
  source: string;
  source_license: string;
  attribution_required: boolean;
  is_active: boolean;
  is_verified: boolean;
};

const EMPTY_FORM: FormData = {
  name: "", display_name: "", display_muscle_group: "",
  category: "", muscles: "", equipment: "",
  difficulty: "beginner", description: "", instructions: "",
  image_url: "", video_url: "", source: "manual",
  source_license: "", attribution_required: false,
  is_active: true, is_verified: false,
};

// ── Styles ────────────────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 9, color: "#fff", padding: "9px 12px",
  fontSize: 13.5, outline: "none", width: "100%", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: "rgba(255,255,255,0.35)", marginBottom: 5,
  textTransform: "uppercase", letterSpacing: "0.06em",
};
const lblGold: React.CSSProperties = { ...lbl, color: "rgba(212,175,55,0.6)" };

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: 38, height: 20, borderRadius: 10, position: "relative",
      cursor: "pointer", transition: "background 0.15s", flexShrink: 0,
      background: value ? "#7A0D2A" : "rgba(255,255,255,0.1)",
      border: value ? "1px solid rgba(212,175,55,0.3)" : "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{
        position: "absolute", top: 2, left: value ? 17 : 2,
        width: 14, height: 14, borderRadius: "50%",
        background: "#fff", transition: "left 0.15s",
      }} />
    </div>
  );
}

function Avatar({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  const [imgErr, setImgErr] = useState(false);
  const initials = name.split(" ").slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase();

  if (imageUrl && !imgErr) {
    return (
      <img src={imageUrl} alt={name}
        style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0, background: "#0F0F0F" }}
        onError={() => setImgErr(true)} />
    );
  }
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
      background: "linear-gradient(135deg,rgba(122,13,42,0.5) 0%,rgba(212,175,55,0.12) 100%)",
      border: "1px solid rgba(255,255,255,0.07)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {initials
        ? <span style={{ color: "rgba(212,175,55,0.7)", fontSize: 11, fontWeight: 800 }}>{initials}</span>
        : <ImageIcon size={13} style={{ color: "rgba(255,255,255,0.15)" }} />
      }
    </div>
  );
}

// ── Difficulty badge config ───────────────────────────────────────────────────
const DIFF_CFG: Record<string, { bg: string; color: string; label: string }> = {
  beginner:     { bg: "rgba(74,222,128,0.08)",  color: "#4ade80", label: "Başlangıç" },
  intermediate: { bg: "rgba(251,191,36,0.08)",  color: "#fbbf24", label: "Orta" },
  advanced:     { bg: "rgba(248,113,113,0.08)", color: "#f87171", label: "İleri" },
};

// ── Muscle group color map (for badge backgrounds) ────────────────────────────
const MUSCLE_COLOR: Record<string, string> = {
  "Göğüs":      "#ef4444",
  "Sırt":       "#3b82f6",
  "Omuz":       "#8b5cf6",
  "Ön Omuz":    "#8b5cf6",
  "Arka Omuz":  "#7c3aed",
  "Biceps":     "#ec4899",
  "Triceps":    "#f97316",
  "Karın":      "#14b8a6",
  "Yan Karın":  "#0d9488",
  "Bacak":      "#84cc16",
  "Ön Bacak":   "#65a30d",
  "Arka Bacak": "#4d7c0f",
  "Baldır":     "#a3e635",
  "Kalça":      "#facc15",
  "Trapez":     "#60a5fa",
  "Sırt (Lat)": "#2563eb",
  "Ön Kol":     "#fb923c",
  "Kardiyo":    "#f43f5e",
};
function muscleColor(group: string): string {
  return MUSCLE_COLOR[group] ?? "#D4AF37";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function EgzersizlerPage() {
  const [exercises, setExercises]   = useState<Exercise[]>([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState<"add" | "edit" | null>(null);
  const [editing, setEditing]       = useState<Exercise | null>(null);
  const [form, setForm]             = useState<FormData>(EMPTY_FORM);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [formTab, setFormTab]       = useState<"basic" | "override" | "media">("basic");



  // filters
  const [search,          setSearch]          = useState("");
  const [filterMuscle,    setFilterMuscle]    = useState("all");
  const [filterCat,       setFilterCat]       = useState("all");
  const [filterEquip,     setFilterEquip]     = useState("all");
  const [filterActive,    setFilterActive]    = useState("all");
  const [filterVerified,  setFilterVerified]  = useState("all");
  const [filterImage,     setFilterImage]     = useState("all");
  const [filterImgStatus, setFilterImgStatus] = useState("all"); // kept for TS safety, unused in UI

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await createClient()
      .from("exercises").select("*").order("name");
    if (error) showToast(error.message, false);
    setExercises((data ?? []) as Exercise[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);


  // ── Derived filter options ──────────────────────────────────────────────
  const muscleOptions = uniqueSorted(exercises.map((e) => resolveMuscleGroup(e)));
  const catOptions    = uniqueSorted(exercises.map((e) => safeStr(e.category, "")).filter((c) => c !== "—"));
  const equipOptions  = uniqueSorted(
    exercises.flatMap((e) =>
      resolveEquipment(e.equipment).split(", ")
    ).filter((v) => v !== "Ekipmansız")
  );


  // ── Filtered list ───────────────────────────────────────────────────────
  const filtered = exercises.filter((e) => {
    const dName = resolveDisplayName(e).toLowerCase();
    const rawName = safeStr(e.name).toLowerCase();
    if (search && !dName.includes(search.toLowerCase()) && !rawName.includes(search.toLowerCase())) return false;
    if (filterMuscle !== "all" && resolveMuscleGroup(e) !== filterMuscle) return false;
    if (filterCat !== "all" && safeStr(e.category) !== filterCat) return false;
    if (filterEquip !== "all") {
      const parts = resolveEquipment(e.equipment).split(", ");
      if (!parts.includes(filterEquip)) return false;
    }
    if (filterActive   !== "all" && String(e.is_active)   !== filterActive)   return false;
    if (filterVerified !== "all" && String(e.is_verified) !== filterVerified) return false;
    if (filterImage === "has"  && !e.image_url && !e.custom_image_url) return false;
    if (filterImage === "none" && (e.image_url || e.custom_image_url))  return false;
    return true;
  });

  const hasFilters = filterMuscle !== "all" || filterCat !== "all" || filterEquip !== "all" ||
    filterActive !== "all" || filterVerified !== "all" || filterImage !== "all";

  // ── Form helpers ────────────────────────────────────────────────────────
  const setF = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => {
    setForm(EMPTY_FORM); setEditing(null); setFormTab("basic"); setModal("add");
  };
  const openEdit = (e: Exercise) => {
    setEditing(e);
    setForm({
      name:                 safeStr(e.name, ""),
      display_name:         e.display_name ?? "",
      display_muscle_group: e.display_muscle_group ?? "",
      category:             safeStr(e.category, ""),
      muscles:              safeStr(e.muscles, ""),
      equipment:            safeStr(e.equipment, ""),
      difficulty:           safeStr(e.difficulty, "beginner"),
      description:          safeStr(e.description, ""),
      instructions:         safeStr(e.instructions, ""),
      image_url:            e.image_url ?? "",
      video_url:            e.video_url ?? "",
      source:               safeStr(e.source, "manual"),
      source_license:       safeStr(e.source_license, ""),
      attribution_required: e.attribution_required ?? false,
      is_active:            e.is_active ?? true,
      is_verified:          e.is_verified ?? false,
    });
    setFormTab("basic");
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      display_name:         form.display_name.trim() || null,
      display_muscle_group: form.display_muscle_group.trim() || null,
      category:             form.category || null,
      muscles:              form.muscles  || null,
      equipment:            form.equipment || null,
      difficulty:           form.difficulty || null,
      description:          form.description || null,
      instructions:         form.instructions || null,
      image_url:            form.image_url || null,
      video_url:            form.video_url || null,
      source:               form.source || "manual",
      source_license:       form.source_license || null,
      attribution_required: form.attribution_required,
      is_active:            form.is_active,
      is_verified:          form.is_verified,
    };
    const sb = createClient();
    const { error } = modal === "add"
      ? await sb.from("exercises").insert(payload)
      : await sb.from("exercises").update(payload).eq("id", editing!.id);
    setSaving(false);
    if (error) { showToast(error.message, false); return; }
    setModal(null);
    showToast(modal === "add" ? "Egzersiz eklendi" : "Güncellendi");
    load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await createClient().from("exercises").delete().eq("id", deleteId);
    if (error) { showToast(error.message, false); return; }
    setDeleteId(null);
    showToast("Silindi");
    load();
  };

  const quickToggle = async (id: string, field: "is_active" | "is_verified", cur: boolean) => {
    await createClient().from("exercises").update({ [field]: !cur }).eq("id", id);
    setExercises((prev) => prev.map((e) => e.id === id ? { ...e, [field]: !cur } : e));
  };

  // ── Stats ───────────────────────────────────────────────────────────────
  const activeCount    = exercises.filter((e) => e.is_active).length;
  const verifiedCount  = exercises.filter((e) => e.is_verified).length;
  const withImgCount  = exercises.filter((e) => e.image_url || e.custom_image_url).length;
  const missingImgCount = exercises.length - withImgCount;

  return (
    <div style={{ maxWidth: 1300 }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .ex-row:hover{background:rgba(255,255,255,0.018)!important}
        .tab-btn{background:none;border:none;cursor:pointer;padding:7px 14px;border-radius:8px;font-size:13px;font-weight:600;transition:all .15s;}
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999,
          background:"#141414", padding:"10px 18px", borderRadius:10, fontSize:13,
          boxShadow:"0 4px 20px rgba(0,0,0,.5)",
          border:`1px solid ${toast.ok ? "rgba(74,222,128,.3)" : "rgba(248,113,113,.3)"}`,
          color: toast.ok ? "#4ade80" : "#f87171",
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22, flexWrap:"wrap", gap:10 }}>
        <div>
          <h1 style={{ color:"#fff", fontWeight:800, fontSize:26, letterSpacing:"-0.02em", margin:"0 0 4px" }}>
            Egzersiz Kütüphanesi
          </h1>
          <p style={{ color:"rgba(255,255,255,.3)", fontSize:13, margin:0 }}>
          {exercises.length} toplam · {activeCount} aktif · {withImgCount} görselli · {missingImgCount} görselsiz · {verifiedCount} onaylı
          </p>
        </div>
        <button onClick={openAdd} style={{ background:"#7A0D2A", border:"1px solid rgba(212,175,55,.3)", color:"#fff", padding:"9px 18px", borderRadius:9, cursor:"pointer", fontWeight:600, fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
          <Plus size={14}/> Egzersiz Ekle
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
        {[
          { label:"Toplam",      value: exercises.length, color:"#fff" },
          { label:"Aktif",       value: activeCount,      color:"#4ade80" },
          { label:"Doğrulandı",  value: verifiedCount,    color:"#a78bfa" },
          { label:"Görselli",    value: withImgCount,     color:"#60a5fa" },
          { label:"Görselsiz",   value: missingImgCount,  color:"#f87171" },
        ].map((s) => (
          <div key={s.label} style={{ background:"#141414", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, padding:"14px 18px" }}>
            <div style={{ fontSize:24, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.3)", marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div style={{ background:"#141414", border:"1px solid rgba(255,255,255,.07)", borderRadius:14, padding:"12px 14px", marginBottom:12 }}>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ position:"relative", flex:1 }}>
            <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,.3)", pointerEvents:"none" }}/>
            <input type="text" placeholder="Egzersiz ara..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inp, paddingLeft:32 }}/>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} style={{
            display:"flex", alignItems:"center", gap:6, padding:"9px 14px",
            background: showFilters ? "rgba(212,175,55,.1)" : "#0F0F0F",
            border:`1px solid ${showFilters ? "rgba(212,175,55,.3)" : "rgba(255,255,255,.1)"}`,
            borderRadius:9, color: showFilters ? "#D4AF37" : "rgba(255,255,255,.4)",
            cursor:"pointer", fontSize:13, fontWeight:600, whiteSpace:"nowrap",
          }}>
            <Filter size={13}/>
            Filtreler
            {hasFilters && <span style={{ background:"#7A0D2A", color:"#fff", borderRadius:"50%", width:16, height:16, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800 }}>!</span>}
            {showFilters ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
          </button>
          {hasFilters && (
            <button onClick={() => { setFilterMuscle("all"); setFilterCat("all"); setFilterEquip("all"); setFilterActive("all"); setFilterVerified("all"); setFilterImage("all"); }}
              style={{ padding:"7px 12px", background:"rgba(248,113,113,.08)", border:"1px solid rgba(248,113,113,.2)", borderRadius:8, color:"#f87171", cursor:"pointer", fontSize:12 }}>
              Temizle
            </button>
          )}
        </div>

        {showFilters && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:8, marginTop:12 }}>
            {([
              { label:"Kas Grubu",   value:filterMuscle,    set:setFilterMuscle,    opts:[["all","Tümü"],...muscleOptions.map((m) => [m,m])] },
              { label:"Kategori",    value:filterCat,       set:setFilterCat,       opts:[["all","Tümü"],...catOptions.map((c) => [c,toTitleCase(c)])] },
              { label:"Ekipman",     value:filterEquip,     set:setFilterEquip,     opts:[["all","Tümü"],...equipOptions.map((e) => [e,e])] },
              { label:"Durum",       value:filterActive,    set:setFilterActive,    opts:[["all","Tümü"],["true","Aktif"],["false","Pasif"]] },
              { label:"Onay",        value:filterVerified,  set:setFilterVerified,  opts:[["all","Tümü"],["true","Onaylı"],["false","Bekliyor"]] },
              { label:"Görsel",      value:filterImage,     set:setFilterImage,     opts:[["all","Tümü"],["has","Görselli"],["none","Görselsiz"]] },
            ] as const).map((f) => (
              <div key={f.label}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,.3)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{f.label}</div>
                <select value={f.value} onChange={(e) => (f.set as (v: string) => void)(e.target.value)}
                  style={{ ...inp, padding:"7px 10px", fontSize:12, cursor:"pointer" }}>
                  {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {(search || hasFilters) && (
        <p style={{ color:"rgba(255,255,255,.3)", fontSize:12, margin:"0 0 10px" }}>
          {filtered.length} / {exercises.length} egzersiz
        </p>
      )}

      {/* Table */}
      <div style={{ background:"#141414", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"rgba(0,0,0,.35)", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
              {["Egzersiz","Kas Grubu","Ekipman","Kategori","Görsel","Aktif","Onaylı",""].map((h) => (
                <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:10, color:"rgba(255,255,255,.3)", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({length:8}).map((_,i) => (
                <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                  {Array.from({length:8}).map((_,j) => (
                    <td key={j} style={{ padding:"12px 14px" }}>
                      <div style={{ height:13, borderRadius:6, background:"rgba(255,255,255,.05)", width:j===0?"70%":"55%", animation:"pulse 1.5s ease-in-out infinite" }}/>
                    </td>
                  ))}
                </tr>
              ))
              : filtered.length === 0
              ? (
                <tr><td colSpan={8} style={{ padding:"56px 0", textAlign:"center" }}>
                  <Dumbbell size={30} style={{ color:"rgba(255,255,255,.08)", display:"block", margin:"0 auto 12px" }}/>
                  <p style={{ color:"rgba(255,255,255,.2)", fontSize:14, margin:0 }}>
                    {search || hasFilters ? "Filtreye uyan egzersiz bulunamadı" : "Henüz egzersiz yok"}
                  </p>
                </td></tr>
              )
              : filtered.map((ex) => {
                const dName  = resolveDisplayName(ex);
                const muscle = resolveMuscleGroup(ex);
                const equip  = resolveEquipment(ex.equipment);
                const mColor = muscleColor(muscle);
                const diff   = safeStr(ex.difficulty,"");
                const badge  = DIFF_CFG[diff];
                const isExp  = expandedId === ex.id;

                return (
                  <React.Fragment key={ex.id}>
                    <tr className="ex-row" style={{ borderBottom:"1px solid rgba(255,255,255,.04)", transition:"background .1s" }}>

                      {/* Name */}
                      <td style={{ padding:"10px 14px", maxWidth:280 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <Avatar name={dName} imageUrl={ex.image_url}/>
                          <div>
                            <div style={{ fontSize:13, fontWeight:600, color:"#fff", lineHeight:1.3 }}>{dName}</div>
                            {ex.display_name && ex.display_name !== ex.name && (
                              <div style={{ fontSize:10, color:"rgba(255,255,255,.2)" }}>{toTitleCase(ex.name)}</div>
                            )}
                            {ex.wger_id && (
                              <div style={{ fontSize:9, color:"rgba(96,165,250,.3)", fontFamily:"monospace" }}>wger#{ex.wger_id}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Muscle group */}
                      <td style={{ padding:"10px 14px" }}>
                        <span style={{ fontSize:12, fontWeight:700, color:mColor }}>{muscle}</span>
                      </td>

                      {/* Equipment */}
                      <td style={{ padding:"10px 14px" }}>
                        <span style={{ fontSize:12, color: equip==="Ekipmansız" ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.6)" }}>
                          {equip}
                        </span>
                      </td>

                      {/* Category / Difficulty */}
                      <td style={{ padding:"10px 14px" }}>
                        {badge
                          ? <span style={{ background:badge.bg, color:badge.color, padding:"2px 8px", borderRadius:6, fontSize:11, fontWeight:600 }}>{badge.label}</span>
                          : <span style={{ background:"rgba(122,13,42,.1)", color:"rgba(212,175,55,.6)", padding:"2px 8px", borderRadius:6, fontSize:11, fontWeight:600 }}>
                              {toTitleCase(safeStr(ex.category,"Genel"))}
                            </span>
                        }
                      </td>

                      {/* Image */}
                      <td style={{ padding:"10px 14px" }}>
                        {(() => {
                          const st = ex.image_status;
                          if (st === "approved")
                            return <span style={{ fontSize:10, background:"rgba(74,222,128,.1)", color:"#4ade80", padding:"2px 7px", borderRadius:6, fontWeight:700 }}>AI ✓</span>;
                          if (st === "generated_pending")
                            return <span style={{ fontSize:10, background:"rgba(250,204,21,.1)", color:"#facc15", padding:"2px 7px", borderRadius:6, fontWeight:700 }}>Onay Bekl.</span>;
                          if (st === "wger_image" || ex.image_url)
                            return <span style={{ fontSize:10, background:"rgba(167,139,250,.1)", color:"#a78bfa", padding:"2px 7px", borderRadius:6, fontWeight:700 }}>Wger</span>;
                          if (st === "failed")
                            return <span style={{ fontSize:10, background:"rgba(248,113,113,.08)", color:"#f87171", padding:"2px 7px", borderRadius:6, fontWeight:700 }}>Hata</span>;
                          if (st === "rejected")
                            return <span style={{ fontSize:10, background:"rgba(248,113,113,.06)", color:"rgba(248,113,113,.5)", padding:"2px 7px", borderRadius:6, fontWeight:700 }}>Reddedildi</span>;
                          return <span style={{ fontSize:10, color:"rgba(255,255,255,.15)" }}>—</span>;
                        })()}
                      </td>

                      {/* Active toggle */}
                      <td style={{ padding:"10px 14px" }}>
                        <button onClick={() => quickToggle(ex.id,"is_active",ex.is_active)}
                          title={ex.is_active?"Pasif yap":"Aktif yap"}
                          style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}>
                          {ex.is_active
                            ? <CheckCircle2 size={18} style={{ color:"#4ade80" }}/>
                            : <XCircle size={18} style={{ color:"rgba(255,255,255,.15)" }}/>}
                        </button>
                      </td>

                      {/* Verified toggle */}
                      <td style={{ padding:"10px 14px" }}>
                        <button onClick={() => quickToggle(ex.id,"is_verified",ex.is_verified)}
                          title={ex.is_verified?"Onayı kaldır":"Onayla"}
                          style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}>
                          <ShieldCheck size={18} style={{ color: ex.is_verified ? "#D4AF37" : "rgba(255,255,255,.12)" }}/>
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding:"10px 14px" }}>
                        <div style={{ display:"flex", gap:4 }}>
                          <button onClick={() => setExpandedId(isExp ? null : ex.id)}
                            style={{ background:"rgba(255,255,255,.05)", border:"none", color:"rgba(255,255,255,.35)", borderRadius:6, padding:"5px 7px", cursor:"pointer" }}>
                            {isExp ? <EyeOff size={13}/> : <Eye size={13}/>}
                          </button>
                          <button onClick={() => openEdit(ex)}
                            style={{ background:"rgba(255,255,255,.05)", border:"none", color:"rgba(255,255,255,.5)", borderRadius:6, padding:"5px 7px", cursor:"pointer" }}>
                            <Pencil size={13}/>
                          </button>
                          <button onClick={() => setDeleteId(ex.id)}
                            style={{ background:"rgba(248,113,113,.08)", border:"none", color:"#f87171", borderRadius:6, padding:"5px 7px", cursor:"pointer" }}>
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded detail */}
                    {isExp && (
                      <tr style={{ borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                        <td colSpan={8} style={{ padding:"0 14px 16px 60px", background:"rgba(0,0,0,.2)" }}>
                          <div style={{ display:"grid", gridTemplateColumns: ex.image_url ? "120px 1fr" : "1fr", gap:16, paddingTop:12 }}>
                            {ex.image_url && (
                              <img src={ex.image_url} alt={dName}
                                style={{ width:120, height:90, objectFit:"cover", borderRadius:10, border:"1px solid rgba(255,255,255,.07)" }}/>
                            )}
                            <div>
                              {ex.description && (
                                <p style={{ color:"rgba(255,255,255,.45)", fontSize:12.5, margin:"0 0 10px", lineHeight:1.7 }}>
                                  {ex.description.slice(0,280)}{ex.description.length>280?"…":""}
                                </p>
                              )}
                              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                                {resolveMuscleList(ex.muscles).map((m) => (
                                  <span key={m} style={{ fontSize:11, color:`${muscleColor(m)}cc`, background:`${muscleColor(m)}14`, padding:"3px 9px", borderRadius:6, fontWeight:600 }}>
                                    💪 {m}
                                  </span>
                                ))}
                                {ex.source_license && (
                                  <span style={{ fontSize:11, color:"rgba(255,255,255,.2)", background:"rgba(255,255,255,.04)", padding:"3px 9px", borderRadius:6 }}>
                                    © {ex.source_license}
                                  </span>
                                )}
                                {ex.video_url && (
                                  <a href={ex.video_url} target="_blank" rel="noreferrer"
                                    style={{ fontSize:11, color:"rgba(248,113,113,.6)", background:"rgba(248,113,113,.06)", padding:"3px 9px", borderRadius:6, textDecoration:"none" }}>
                                    ▶ Video
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            }
          </tbody>
        </table>
      </div>

      {/* ── Add / Edit Modal ────────────────────────────────────────────────── */}
      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.92)", zIndex:200, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"20px 16px", overflowY:"auto" }}>
          <div style={{ background:"#141414", border:"1px solid rgba(255,255,255,.1)", borderRadius:20, maxWidth:660, width:"100%", marginTop:20, marginBottom:20, padding:"24px 26px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <h2 style={{ color:"#fff", fontSize:17, fontWeight:700, margin:0 }}>
                {modal==="add" ? "Egzersiz Ekle" : "Egzersiz Düzenle"}
              </h2>
              <button onClick={() => setModal(null)} style={{ background:"transparent", border:"none", color:"rgba(255,255,255,.4)", cursor:"pointer" }}>
                <X size={18}/>
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", gap:4, marginBottom:18, background:"#0F0F0F", borderRadius:10, padding:4 }}>
              {([
                { key:"basic",    label:"Temel" },
                { key:"override", label:"Görüntü Adı ★" },
                { key:"media",    label:"Medya" },
              ] as const).map((t) => (
                <button key={t.key} className="tab-btn" onClick={() => setFormTab(t.key)}
                  style={{ flex:1,
                    background: formTab===t.key ? "#1E1E1E" : "none",
                    border: formTab===t.key ? "1px solid rgba(255,255,255,.08)" : "1px solid transparent",
                    color: formTab===t.key ? "#fff" : "rgba(255,255,255,.3)",
                  }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab: Basic */}
            {formTab==="basic" && (
              <div style={{ display:"grid", gap:14 }}>
                <div>
                  <label style={lbl}>Egzersiz Adı *</label>
                  <input value={form.name} onChange={(e) => setF("name",e.target.value)} style={inp} placeholder="ör. Bench Press"/>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label style={lbl}>Kaslar</label>
                    <input value={form.muscles} onChange={(e) => setF("muscles",e.target.value)} style={inp} placeholder="ör. Chest, Triceps"/>
                    {form.muscles && (
                      <p style={{ color:"rgba(212,175,55,.5)", fontSize:11, margin:"4px 0 0" }}>
                        → {resolveMuscleList(form.muscles).join(" · ") || "—"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label style={lbl}>Kategori</label>
                    <input value={form.category} onChange={(e) => setF("category",e.target.value)} style={inp} placeholder="ör. Chest"/>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label style={lbl}>Ekipman</label>
                    <input value={form.equipment} onChange={(e) => setF("equipment",e.target.value)} style={inp} placeholder="ör. Barbell"/>
                    {form.equipment && (
                      <p style={{ color:"rgba(255,255,255,.3)", fontSize:11, margin:"4px 0 0" }}>
                        → {resolveEquipment(form.equipment)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label style={lbl}>Zorluk</label>
                    <select value={form.difficulty} onChange={(e) => setF("difficulty",e.target.value)} style={{ ...inp, cursor:"pointer" }}>
                      <option value="beginner">Başlangıç</option>
                      <option value="intermediate">Orta</option>
                      <option value="advanced">İleri</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={lbl}>Açıklama</label>
                  <textarea value={form.description} onChange={(e) => setF("description",e.target.value)}
                    style={{ ...inp, minHeight:80, resize:"vertical" }} placeholder="Kısa açıklama..."/>
                </div>
                <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
                  {(["is_active","is_verified"] as const).map((key) => (
                    <label key={key} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
                      <Toggle value={form[key]} onChange={(v) => setF(key,v)}/>
                      <span style={{ fontSize:13, color:"rgba(255,255,255,.5)" }}>
                        {key==="is_active" ? (form.is_active?"Aktif":"Pasif") : (form.is_verified?"Onaylı":"Onay Bekliyor")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Override */}
            {formTab==="override" && (
              <div style={{ display:"grid", gap:16 }}>
                <div style={{ padding:"10px 14px", background:"rgba(212,175,55,.05)", border:"1px solid rgba(212,175,55,.15)", borderRadius:10 }}>
                  <p style={{ color:"rgba(212,175,55,.7)", fontSize:12, margin:0, lineHeight:1.6 }}>
                    Wger isimleri bazen teknik görünür. Burada <strong>görüntü ismi</strong> ve <strong>Türkçe kas grubu</strong> girebilirsin. Boş bırakırsan sistem otomatik çevirir.
                  </p>
                </div>
                <div>
                  <label style={lblGold}>Görüntü Adı (display_name)</label>
                  <input value={form.display_name} onChange={(e) => setF("display_name",e.target.value)} style={inp}
                    placeholder={`Boş = "${form.name ? toTitleCase(form.name) : "otomatik"}"`}/>
                </div>
                <div>
                  <label style={lblGold}>Kas Grubu Adı (display_muscle_group)</label>
                  <input value={form.display_muscle_group} onChange={(e) => setF("display_muscle_group",e.target.value)} style={inp}
                    placeholder={`Boş = "${form.muscles?.split(",")[0]?.trim() ? muscleToTR(form.muscles.split(",")[0].trim()) : "Genel"}"`}/>
                </div>
                <div>
                  <label style={lbl}>Talimatlar</label>
                  <textarea value={form.instructions} onChange={(e) => setF("instructions",e.target.value)}
                    style={{ ...inp, minHeight:100, resize:"vertical" }} placeholder="Adım adım hareket açıklaması..."/>
                </div>
              </div>
            )}

            {/* Tab: Media */}
            {formTab==="media" && (
              <div style={{ display:"grid", gap:14 }}>
                <div>
                  <label style={lbl}>Görsel URL</label>
                  <input type="url" value={form.image_url} onChange={(e) => setF("image_url",e.target.value)} style={inp} placeholder="https://..."/>
                  {form.image_url && (
                    <img src={form.image_url} alt="önizleme"
                      style={{ marginTop:8, height:80, borderRadius:8, border:"1px solid rgba(255,255,255,.08)", objectFit:"cover", display:"block" }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display="none"; }}/>
                  )}
                </div>
                <div>
                  <label style={lbl}>Video URL</label>
                  <input type="url" value={form.video_url} onChange={(e) => setF("video_url",e.target.value)} style={inp} placeholder="https://youtube.com/..."/>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label style={lbl}>Kaynak</label>
                    <select value={form.source} onChange={(e) => setF("source",e.target.value)} style={{ ...inp, cursor:"pointer" }}>
                      <option value="manual">Manuel</option>
                      <option value="wger">wger</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Lisans</label>
                    <input value={form.source_license} onChange={(e) => setF("source_license",e.target.value)} style={inp} placeholder="CC-BY-SA 4.0"/>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:22 }}>
              <button onClick={() => setModal(null)} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", color:"rgba(255,255,255,.5)", padding:"8px 16px", borderRadius:9, cursor:"pointer", fontSize:13 }}>İptal</button>
              <button onClick={handleSave} disabled={saving||!form.name.trim()}
                style={{ background: saving ? "#555" : "#7A0D2A", border:"1px solid rgba(212,175,55,.3)", color:"#fff", padding:"8px 22px", borderRadius:9, cursor: saving?"not-allowed":"pointer", fontWeight:600, fontSize:13 }}>
                {saving ? "Kaydediliyor..." : modal==="add" ? "Ekle" : "Güncelle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.92)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"#141414", border:"1px solid rgba(255,255,255,.1)", borderRadius:20, maxWidth:360, width:"100%", padding:28, textAlign:"center" }}>
            <Trash2 size={24} style={{ color:"#f87171", margin:"0 auto 14px" }}/>
            <h3 style={{ color:"#fff", fontSize:16, fontWeight:700, margin:"0 0 8px" }}>Egzersizi Sil?</h3>
            <p style={{ color:"rgba(255,255,255,.3)", fontSize:13, margin:"0 0 22px" }}>Bu işlem geri alınamaz.</p>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => setDeleteId(null)} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", color:"rgba(255,255,255,.5)", padding:"8px 20px", borderRadius:9, cursor:"pointer", fontSize:13 }}>İptal</button>
              <button onClick={handleDelete} style={{ background:"rgba(220,38,38,.85)", border:"none", color:"#fff", padding:"8px 20px", borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:600 }}>Sil</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
