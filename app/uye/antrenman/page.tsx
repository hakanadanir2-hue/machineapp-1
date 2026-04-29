"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Dumbbell, ChevronDown, ChevronUp } from "lucide-react";

const DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

interface Exercise {
  name: string;
  sets?: number;
  reps?: number | string;
  weight_kg?: number;
  rest_sec?: number;
  notes?: string;
}

interface Program {
  id: string;
  day_of_week: number;
  exercises: Exercise[];
  is_active: boolean;
}

export default function AntrenmanPage() {
  const supabase = createClient();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading]   = useState(true);
  const [openDay, setOpenDay]   = useState<number | null>(new Date().getDay());

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from("member_programs")
        .select("*")
        .eq("member_id", session.user.id)
        .eq("is_active", true)
        .order("day_of_week");
      setPrograms((data as Program[]) ?? []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const today = new Date().getDay();

  if (loading) return <div style={{ color: "rgba(255,255,255,.3)", padding: 40 }}>Yükleniyor...</div>;

  if (programs.length === 0) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", padding: "60px 0" }}>
        <Dumbbell size={48} color="rgba(255,255,255,.15)" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Henüz program atanmadı</h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>Antrenmanın eğitmenin tarafından hazırlanacak.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Antrenman Programım</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>Haftalık antrenman planın</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {programs.map((prog) => {
          const isToday   = prog.day_of_week === today;
          const isOpen    = openDay === prog.day_of_week;
          const exercises = prog.exercises as Exercise[];

          return (
            <div key={prog.id} style={{
              background: isToday ? "rgba(201,168,76,.06)" : "#141414",
              border: `1px solid ${isToday ? "rgba(201,168,76,.3)" : "rgba(255,255,255,.07)"}`,
              borderRadius: 14, overflow: "hidden",
            }}>
              {/* Gün başlığı */}
              <button
                onClick={() => setOpenDay(isOpen ? null : prog.day_of_week)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", padding: "14px 18px",
                  background: "none", border: "none", cursor: "pointer", gap: 12,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: isToday ? "#C9A84C" : "rgba(255,255,255,.07)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Dumbbell size={16} color={isToday ? "#0B0B0B" : "rgba(255,255,255,.4)"} />
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isToday ? "#C9A84C" : "#fff" }}>
                    {DAYS[prog.day_of_week]}
                    {isToday && <span style={{ marginLeft: 8, fontSize: 10, background: "#C9A84C", color: "#0B0B0B", padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>BUGÜN</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>
                    {exercises.length} egzersiz
                  </div>
                </div>
                {isOpen ? <ChevronUp size={16} color="rgba(255,255,255,.35)" /> : <ChevronDown size={16} color="rgba(255,255,255,.35)" />}
              </button>

              {/* Egzersiz listesi */}
              {isOpen && (
                <div style={{ padding: "0 18px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {exercises.map((ex, i) => (
                    <div key={i} style={{
                      background: "rgba(255,255,255,.04)", borderRadius: 10, padding: "12px 14px",
                      display: "flex", alignItems: "flex-start", gap: 12,
                    }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(201,168,76,.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#C9A84C" }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{ex.name}</div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          {ex.sets && <Chip label={`${ex.sets} set`} />}
                          {ex.reps && <Chip label={`${ex.reps} tekrar`} />}
                          {ex.weight_kg && <Chip label={`${ex.weight_kg} kg`} color="#C9A84C" />}
                          {ex.rest_sec && <Chip label={`${ex.rest_sec}s dinlenme`} />}
                        </div>
                        {ex.notes && <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 6 }}>{ex.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Chip({ label, color = "rgba(255,255,255,.5)" }: { label: string; color?: string }) {
  return (
    <span style={{ fontSize: 11, color, background: "rgba(255,255,255,.06)", padding: "2px 8px", borderRadius: 5 }}>
      {label}
    </span>
  );
}
