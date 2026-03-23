"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Eye, ChevronDown, ChevronUp, Dumbbell, Apple, Plus } from "lucide-react";

interface Program {
  id: string;
  title: string;
  summary: string | null;
  goal: string | null;
  fitness_level: string | null;
  days_per_week: number | null;
  duration_weeks: number | null;
  status: string;
  admin_notes: string | null;
  rejection_reason: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
}

interface ProgramDetail {
  program: Program;
  weeks: WeekDetail[];
  nutrition: NutritionPlan | null;
}

interface WeekDetail {
  id: string;
  week_number: number;
  notes: string | null;
  days: DayDetail[];
}

interface DayDetail {
  id: string;
  day_number: number;
  day_name: string | null;
  focus: string | null;
  is_rest_day: boolean;
  warmup_notes: string | null;
  cooldown_notes: string | null;
  total_duration_min: number | null;
  notes: string | null;
  exercises: ExerciseRow[];
}

interface ExerciseRow {
  id: string;
  exercise_name: string;
  sets: number | null;
  reps: string | null;
  rest_seconds: number | null;
  modification: string | null;
  notes: string | null;
  order_index: number;
}

interface NutritionPlan {
  daily_calories: number | null;
  protein_g: number | null;
  carb_g: number | null;
  fat_g: number | null;
  water_ml: number | null;
  meal_count: number | null;
  meals: { name: string; time: string; foods: string[]; calories: number; notes?: string }[] | null;
  supplement_notes: string | null;
  general_notes: string | null;
}

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Onay Bekliyor", color: "#facc15", bg: "rgba(250,204,21,.1)" },
  approved:  { label: "Onaylandı",     color: "#4ade80", bg: "rgba(74,222,128,.1)" },
  rejected:  { label: "Reddedildi",    color: "#f87171", bg: "rgba(248,113,113,.1)" },
  active:    { label: "Aktif",         color: "#60a5fa", bg: "rgba(96,165,250,.1)" },
  completed: { label: "Tamamlandı",    color: "#a78bfa", bg: "rgba(167,139,250,.1)" },
};

const GOALS: Record<string, string> = {
  kilo_ver: "Kilo Verme", kas_kazan: "Kas Kazanma", kondisyon: "Kondisyon",
  saglikli_kal: "Sağlıklı Kalma", rehabilitasyon: "Rehabilitasyon", genel_fitness: "Genel Fitness",
};

export default function ProgramlarimPage() {
  const supabase = createClient();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading]   = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail]     = useState<ProgramDetail | null>(null);
  const [detailLoading, setDL]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }

    const { data } = await supabase
      .from("programs")
      .select("id,title,summary,goal,fitness_level,days_per_week,duration_weeks,status,admin_notes,rejection_reason,approved_at,rejected_at,created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    setPrograms((data ?? []) as Program[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function openDetail(id: string) {
    setDetailId(id);
    setDetail(null);
    setDL(true);
    const res = await fetch(`/api/programs/${id}`);
    const d   = await res.json() as ProgramDetail;
    setDetail(d);
    setDL(false);
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Programlarım</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)" }}>AI tarafından sana özel hazırlanan programlar</p>
        </div>
        <Link href="/program-basvuru" style={{ textDecoration: "none" }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#7A0D2A", border: "none", color: "#fff", padding: "9px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            <Plus size={14} /> Yeni Program
          </button>
        </Link>
      </div>

      {loading ? (
        <div style={{ color: "rgba(255,255,255,.3)", padding: 40, textAlign: "center" }}>Yükleniyor...</div>
      ) : programs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#111", borderRadius: 16, border: "1px solid rgba(255,255,255,.06)" }}>
          <Dumbbell size={40} color="rgba(255,255,255,.1)" style={{ margin: "0 auto 16px" }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,.4)", marginBottom: 8 }}>Henüz programın yok</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.2)", marginBottom: 20 }}>Fiziksel verilerini girerek AI kişisel programını oluştursun</div>
          <Link href="/program-basvuru" style={{ textDecoration: "none" }}>
            <button style={{ background: "#7A0D2A", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
              Program Al
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {programs.map((p) => {
            const st = STATUS[p.status] ?? STATUS.pending;
            return (
              <div key={p.id} style={{ background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ background: st.bg, color: st.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>{st.label}</span>
                      {p.goal && <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)", background: "rgba(255,255,255,.05)", padding: "2px 8px", borderRadius: 6 }}>{GOALS[p.goal] ?? p.goal}</span>}
                      {p.fitness_level && <span style={{ fontSize: 10, color: "rgba(255,255,255,.25)", background: "rgba(255,255,255,.04)", padding: "2px 8px", borderRadius: 6 }}>{p.fitness_level}</span>}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 4 }}>{p.title}</div>
                    {p.summary && <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.5, marginBottom: 6 }}>{p.summary}</div>}

                    {/* Status-specific messages */}
                    {p.status === "pending" && (
                      <div style={{ fontSize: 11, color: "#facc15", background: "rgba(250,204,21,.06)", border: "1px solid rgba(250,204,21,.1)", borderRadius: 7, padding: "5px 10px", display: "inline-block" }}>
                        Uzman incelemesi bekleniyor
                      </div>
                    )}
                    {p.status === "approved" && (
                      <div style={{ fontSize: 11, color: "#4ade80", background: "rgba(74,222,128,.06)", border: "1px solid rgba(74,222,128,.15)", borderRadius: 7, padding: "5px 10px", display: "inline-block" }}>
                        ✓ Onaylandı — {new Date(p.approved_at!).toLocaleDateString("tr-TR")}
                      </div>
                    )}
                    {p.status === "rejected" && (
                      <div style={{ fontSize: 11, color: "#f87171", background: "rgba(248,113,113,.06)", border: "1px solid rgba(248,113,113,.15)", borderRadius: 7, padding: "5px 10px", display: "inline-block" }}>
                        {p.rejection_reason ? `Red: ${p.rejection_reason}` : "Reddedildi"}
                      </div>
                    )}

                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.2)", marginTop: 8 }}>
                      {new Date(p.created_at).toLocaleDateString("tr-TR")} · {p.days_per_week} gün/hafta · {p.duration_weeks} hafta
                    </div>
                  </div>

                  {(p.status === "approved" || p.status === "active") && (
                    <button onClick={() => openDetail(p.id)} style={{
                      display: "flex", alignItems: "center", gap: 5, background: "rgba(74,222,128,.1)",
                      border: "1px solid rgba(74,222,128,.2)", color: "#4ade80",
                      padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
                    }}>
                      <Eye size={13} /> Programı Gör
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {detailId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.95)", zIndex: 200, overflowY: "auto", padding: "20px 16px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDetailId(null); }}>
          <div style={{ maxWidth: 720, margin: "0 auto", background: "#111", border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>Program Detayı</div>
              <button onClick={() => setDetailId(null)} style={{ background: "rgba(255,255,255,.06)", border: "none", color: "rgba(255,255,255,.4)", padding: "6px 10px", borderRadius: 8, cursor: "pointer" }}>✕</button>
            </div>

            {detailLoading ? (
              <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,.3)" }}>Yükleniyor...</div>
            ) : detail ? (
              <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", marginBottom: 6 }}>{detail.program.title}</div>
                  <p style={{ color: "rgba(255,255,255,.45)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{detail.program.summary}</p>
                </div>

                {detail.weeks.length > 0 && <WeekView weeks={detail.weeks} />}
                {detail.nutrition && <NutritionView nutrition={detail.nutrition} />}

                {detail.program.admin_notes && (
                  <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "rgba(255,255,255,.5)" }}>
                    <span style={{ fontWeight: 700, color: "rgba(255,255,255,.4)" }}>Uzman Notu: </span>
                    {detail.program.admin_notes}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function WeekView({ weeks }: { weeks: WeekDetail[] }) {
  const [openWeek, setOpenWeek] = useState<number>(1);
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <Dumbbell size={11} /> Program ({weeks.length} Hafta)
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {weeks.map((week) => (
          <div key={week.id} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, overflow: "hidden" }}>
            <button onClick={() => setOpenWeek(openWeek === week.week_number ? 0 : week.week_number)}
              style={{ width: "100%", background: "none", border: "none", color: "#fff", padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>Hafta {week.week_number}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {week.notes && <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{week.notes.slice(0, 40)}</span>}
                {openWeek === week.week_number ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>
            {openWeek === week.week_number && (
              <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                {week.days.map((day) => (
                  <div key={day.id} style={{ background: day.is_rest_day ? "rgba(255,255,255,.02)" : "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: day.is_rest_day ? 0 : 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: day.is_rest_day ? "rgba(255,255,255,.3)" : "#fff" }}>
                        {day.day_name} — {day.focus}
                      </span>
                      {day.is_rest_day && <span style={{ fontSize: 10, color: "rgba(255,255,255,.2)", background: "rgba(255,255,255,.05)", padding: "1px 7px", borderRadius: 5 }}>Dinlenme</span>}
                      {day.total_duration_min && !day.is_rest_day && <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>{day.total_duration_min} dk</span>}
                    </div>
                    {!day.is_rest_day && day.exercises.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {day.warmup_notes && <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginBottom: 4 }}>🔥 {day.warmup_notes}</div>}
                        {day.exercises.map((ex, i) => (
                          <div key={ex.id} style={{ display: "flex", gap: 8, alignItems: "center", background: "rgba(0,0,0,.2)", borderRadius: 6, padding: "6px 8px" }}>
                            <span style={{ fontSize: 10, color: "rgba(255,255,255,.2)", width: 16, textAlign: "center" }}>{i + 1}</span>
                            <span style={{ fontSize: 12, color: "#fff", flex: 1, fontWeight: 500 }}>{ex.exercise_name}</span>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,.5)", whiteSpace: "nowrap" }}>{ex.sets}×{ex.reps}</span>
                            {ex.rest_seconds && <span style={{ fontSize: 10, color: "rgba(255,255,255,.25)" }}>{ex.rest_seconds}s</span>}
                            {ex.modification && (
                              <span style={{ fontSize: 10, color: "#facc15", background: "rgba(250,204,21,.07)", padding: "1px 6px", borderRadius: 4 }} title={ex.modification}>mod</span>
                            )}
                          </div>
                        ))}
                        {day.cooldown_notes && <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 4 }}>🧘 {day.cooldown_notes}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function NutritionView({ nutrition }: { nutrition: NutritionPlan }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <Apple size={11} /> Beslenme Planı
      </div>
      <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Kalori",  value: `${nutrition.daily_calories ?? "—"} kcal`, color: "#facc15" },
            { label: "Protein", value: `${nutrition.protein_g ?? "—"} g`,         color: "#4ade80" },
            { label: "Karb",    value: `${nutrition.carb_g ?? "—"} g`,            color: "#60a5fa" },
            { label: "Yağ",     value: `${nutrition.fat_g ?? "—"} g`,             color: "#fb923c" },
          ].map((m) => (
            <div key={m.label} style={{ textAlign: "center", background: "rgba(0,0,0,.2)", borderRadius: 8, padding: "10px 6px" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>
        {nutrition.meals && nutrition.meals.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {nutrition.meals.map((meal, i) => (
              <div key={i} style={{ background: "rgba(0,0,0,.15)", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 12, color: "#fff" }}>{meal.name}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{meal.time} · {meal.calories} kcal</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", lineHeight: 1.5 }}>{meal.foods?.join(", ")}</div>
              </div>
            ))}
          </div>
        )}
        {nutrition.water_ml && (
          <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,.35)" }}>
            💧 Günlük su: {nutrition.water_ml} ml
          </div>
        )}
        {nutrition.general_notes && (
          <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.6, borderTop: "1px solid rgba(255,255,255,.05)", paddingTop: 10 }}>
            {nutrition.general_notes}
          </div>
        )}
      </div>
    </div>
  );
}
