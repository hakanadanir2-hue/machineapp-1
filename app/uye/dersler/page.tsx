"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CalendarDays, Users, Clock, CheckCircle } from "lucide-react";

const CLASS_TYPE_LABELS: Record<string, string> = {
  boks:      "Boks",
  kickboks:  "Kickboks",
  muay_thai: "Muay Thai",
  fitness:   "Fitness",
};

const CLASS_TYPE_COLORS: Record<string, string> = {
  boks:      "#ef4444",
  kickboks:  "#f97316",
  muay_thai: "#a78bfa",
  fitness:   "#C9A84C",
};

interface GymClass {
  id: string;
  title: string;
  class_type: string;
  instructor: string | null;
  start_time: string;
  duration_min: number;
  capacity: number;
  booked: boolean;
  booked_count?: number;
}

export default function DerslerPage() {
  const supabase = createClient();
  const [classes, setClasses]   = useState<GymClass[]>([]);
  const [loading, setLoading]   = useState(true);
  const [memberId, setMemberId] = useState("");
  const [booking, setBooking]   = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setMemberId(session.user.id);

      const [classesRes, bookingsRes] = await Promise.all([
        supabase
          .from("gym_classes")
          .select("*")
          .gte("start_time", new Date().toISOString())
          .order("start_time", { ascending: true })
          .limit(30),
        supabase
          .from("class_bookings")
          .select("class_id")
          .eq("member_id", session.user.id),
      ]);

      const bookedIds = new Set((bookingsRes.data ?? []).map((b) => b.class_id));
      const list: GymClass[] = (classesRes.data ?? []).map((c) => ({
        ...c,
        booked: bookedIds.has(c.id),
      }));
      setClasses(list);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function toggleBooking(cls: GymClass) {
    setBooking(cls.id);
    if (cls.booked) {
      // İptal et
      await supabase
        .from("class_bookings")
        .delete()
        .eq("class_id", cls.id)
        .eq("member_id", memberId);
    } else {
      // Rezervasyon yap
      await supabase
        .from("class_bookings")
        .insert({ class_id: cls.id, member_id: memberId });
    }
    setClasses((prev) => prev.map((c) => c.id === cls.id ? { ...c, booked: !c.booked } : c));
    setBooking(null);
  }

  if (loading) return <div style={{ color: "rgba(255,255,255,.3)", padding: 40 }}>Yükleniyor...</div>;

  // Günlere göre grupla
  const grouped = classes.reduce<Record<string, GymClass[]>>((acc, cls) => {
    const day = new Date(cls.start_time).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
    if (!acc[day]) acc[day] = [];
    acc[day].push(cls);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Grup Dersleri</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>Yaklaşan dersler ve rezervasyon</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <CalendarDays size={48} color="rgba(255,255,255,.15)" style={{ marginBottom: 16 }} />
          <p style={{ color: "rgba(255,255,255,.35)", fontSize: 14 }}>Yaklaşan ders bulunmuyor</p>
        </div>
      ) : (
        Object.entries(grouped).map(([day, dayClasses]) => (
          <div key={day} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              {day}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dayClasses.map((cls) => {
                const color = CLASS_TYPE_COLORS[cls.class_type] ?? "#C9A84C";
                const start = new Date(cls.start_time);
                const end   = new Date(start.getTime() + cls.duration_min * 60000);
                const timeStr = `${start.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;
                const isBusy = booking === cls.id;

                return (
                  <div key={cls.id} style={{
                    background: cls.booked ? `rgba(${hexToRgb(color)}, 0.06)` : "#141414",
                    border: `1px solid ${cls.booked ? color + "40" : "rgba(255,255,255,.07)"}`,
                    borderRadius: 14, padding: "16px 18px",
                    display: "flex", alignItems: "flex-start", gap: 14,
                  }}>
                    {/* Tip etiketi */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                      background: `rgba(${hexToRgb(color)}, 0.15)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 800, color, textAlign: "center", lineHeight: 1.2,
                    }}>
                      {CLASS_TYPE_LABELS[cls.class_type] ?? cls.class_type}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{cls.title}</div>
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={11} /> {timeStr} ({cls.duration_min} dk)
                        </span>
                        {cls.instructor && (
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Users size={11} /> {cls.instructor}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleBooking(cls)}
                      disabled={isBusy}
                      style={{
                        flexShrink: 0, padding: "7px 14px",
                        background: cls.booked ? "rgba(239,68,68,.1)" : color,
                        border: cls.booked ? "1px solid rgba(239,68,68,.3)" : "none",
                        borderRadius: 9, fontWeight: 700, fontSize: 12,
                        color: cls.booked ? "#f87171" : "#0B0B0B",
                        cursor: "pointer", opacity: isBusy ? 0.5 : 1,
                        display: "flex", alignItems: "center", gap: 5,
                      }}
                    >
                      {cls.booked && <CheckCircle size={12} />}
                      {cls.booked ? "İptal Et" : "Rezerve Et"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
