"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Flame, Droplets, Dumbbell, Activity, CalendarDays, Bell, ChevronRight } from "lucide-react";

interface MemberSummary {
  full_name: string;
  streak_days: number;
  membership_end: string | null;
  goal: string | null;
}

interface DayStat {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
  href: string;
}

export default function UyeHomePage() {
  const supabase = createClient();
  const [member, setMember]     = useState<MemberSummary | null>(null);
  const [waterMl, setWaterMl]   = useState<number>(0);
  const [todayProgram, setTodayProgram] = useState<boolean>(false);
  const [nextClass, setNextClass] = useState<{ title: string; start_time: string } | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const uid = session.user.id;
      const today = new Date().toISOString().split("T")[0];
      const dayOfWeek = new Date().getDay(); // 0=Pazar

      const [memberRes, waterRes, programRes, classRes] = await Promise.all([
        supabase.from("members").select("full_name, streak_days, membership_end, goal").eq("id", uid).single(),
        supabase.from("water_logs").select("amount_ml").eq("member_id", uid).eq("logged_at", today).maybeSingle(),
        supabase.from("member_programs").select("id").eq("member_id", uid).eq("day_of_week", dayOfWeek).eq("is_active", true).maybeSingle(),
        supabase.from("gym_classes").select("title, start_time").gte("start_time", new Date().toISOString()).order("start_time", { ascending: true }).limit(1).maybeSingle(),
      ]);

      setMember(memberRes.data ?? null);
      setWaterMl(waterRes.data?.amount_ml ?? 0);
      setTodayProgram(!!programRes.data);
      setNextClass(classRes.data ?? null);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const waterGoal = 2500;
  const waterPct  = Math.min(100, Math.round((waterMl / waterGoal) * 100));

  const firstName = member?.full_name?.split(" ")[0] ?? "Üye";

  const stats: DayStat[] = [
    {
      label: "Bugünkü Su",
      value: `${(waterMl / 1000).toFixed(1)} L`,
      sub: `${waterPct}% hedef`,
      color: "#60a5fa",
      icon: <Droplets size={20} color="#60a5fa" />,
      href: "/uye/su",
    },
    {
      label: "Bugün Antrenman",
      value: todayProgram ? "Var" : "Yok",
      sub: todayProgram ? "Programa git" : "Dinlenme günü",
      color: todayProgram ? "#C9A84C" : "rgba(255,255,255,.3)",
      icon: <Dumbbell size={20} color={todayProgram ? "#C9A84C" : "rgba(255,255,255,.3)"} />,
      href: "/uye/antrenman",
    },
    {
      label: "Streak",
      value: `${member?.streak_days ?? 0} gün`,
      sub: "Üst üste antrenman",
      color: "#f97316",
      icon: <Flame size={20} color="#f97316" />,
      href: "/uye/antrenman",
    },
    {
      label: "Sonraki Ders",
      value: nextClass ? nextClass.title : "Yok",
      sub: nextClass ? new Date(nextClass.start_time).toLocaleDateString("tr-TR", { weekday: "short", hour: "2-digit", minute: "2-digit" }) : "Ders rezervasyonu yap",
      color: "#a78bfa",
      icon: <CalendarDays size={20} color="#a78bfa" />,
      href: "/uye/dersler",
    },
  ];

  const quickLinks = [
    { href: "/uye/olcumler",    label: "Ölçüm Ekle",      icon: <Activity size={18} color="#C9A84C" />,  bg: "rgba(201,168,76,.1)",  border: "rgba(201,168,76,.2)" },
    { href: "/uye/beslenme",    label: "Öğün Kaydet",      icon: <Dumbbell size={18} color="#4ade80" />,  bg: "rgba(74,222,128,.1)",  border: "rgba(74,222,128,.2)" },
    { href: "/uye/ilerleme",    label: "Fotoğraf Ekle",    icon: <Activity size={18} color="#60a5fa" />,  bg: "rgba(96,165,250,.1)",  border: "rgba(96,165,250,.2)" },
    { href: "/uye/bildirimler", label: "Bildirimler",      icon: <Bell size={18} color="#f97316" />,      bg: "rgba(249,115,22,.1)",  border: "rgba(249,115,22,.2)" },
  ];

  if (loading) {
    return <div style={{ color: "rgba(255,255,255,.3)", padding: 40 }}>Yükleniyor...</div>;
  }

  return (
    <div style={{ maxWidth: 840, margin: "0 auto" }}>
      {/* Karşılama */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 4, letterSpacing: "-0.01em" }}>
          Merhaba, {firstName}!
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>
          {member?.goal ? `Hedefiniz: ${member.goal}` : "Bugün ne yapacaksın?"}
        </p>
      </div>

      {/* Su ilerleme çubuğu */}
      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Droplets size={16} color="#60a5fa" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Günlük Su Hedefi</span>
          </div>
          <span style={{ fontSize: 13, color: "#60a5fa", fontWeight: 700 }}>{waterMl} / {waterGoal} ml</span>
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,.08)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${waterPct}%`, background: "#60a5fa", borderRadius: 99, transition: "width .4s" }} />
        </div>
        <div style={{ marginTop: 8, textAlign: "right" }}>
          <Link href="/uye/su" style={{ fontSize: 12, color: "rgba(255,255,255,.3)", textDecoration: "none" }}>
            Su ekle →
          </Link>
        </div>
      </div>

      {/* Stat kartları */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 24 }}>
        {stats.map((s) => (
          <Link key={s.href + s.label} href={s.href} style={{ textDecoration: "none" }}>
            <div style={{
              background: "#141414", border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 14, padding: "16px 18px",
              display: "flex", alignItems: "flex-start", gap: 14,
              transition: "border-color .15s",
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 2 }}>{s.sub}</div>}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Hızlı Aksiyonlar */}
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 12 }}>Hızlı Erişim</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
          {quickLinks.map((q) => (
            <Link key={q.href} href={q.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: q.bg, border: `1px solid ${q.border}`,
                borderRadius: 14, padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {q.icon}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", flex: 1 }}>{q.label}</span>
                <ChevronRight size={14} color="rgba(255,255,255,.3)" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
