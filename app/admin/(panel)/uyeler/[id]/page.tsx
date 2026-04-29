"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft, User, Activity, Utensils, Droplets, Dumbbell,
  Camera, Bell, Save, CheckCircle, XCircle, MessageCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Member {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  height_cm: number | null;
  goal: string | null;
  membership_start: string | null;
  membership_end: string | null;
  streak_days: number;
  created_at: string;
}
interface Measurement {
  id: string;
  weight_kg: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  arm_cm: number | null;
  leg_cm: number | null;
  body_fat_pct: number | null;
  measured_at: string;
}
interface FoodLog {
  id: string;
  meal_type: string;
  notes: string | null;
  trainer_comment: string | null;
  logged_at: string;
}
interface WaterLog {
  id: string;
  amount_ml: number;
  logged_at: string;
}
interface ProgressPhoto {
  id: string;
  photo_url: string;
  angle: string;
  taken_at: string;
}
interface MemberProgram {
  id: string;
  day_of_week: number;
  exercises: unknown[];
  is_active: boolean;
}

const DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

const inputStyle: React.CSSProperties = {
  background: "#0F0F0F",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 9,
  color: "#fff",
  padding: "9px 12px",
  fontSize: 13.5,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const cardStyle: React.CSSProperties = {
  background: "#141414",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  padding: "20px 22px",
  marginBottom: 16,
};

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: "7px 16px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  border: active ? "1px solid rgba(212,175,55,0.4)" : "1px solid rgba(255,255,255,0.07)",
  background: active ? "rgba(212,175,55,0.1)" : "rgba(255,255,255,0.03)",
  color: active ? "#D4AF37" : "rgba(255,255,255,0.4)",
  transition: "all 0.15s",
});

function getMembershipStatus(end: string | null) {
  if (!end) return { label: "Tanımsız", color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.06)" };
  const diff = Math.floor((new Date(end).getTime() - Date.now()) / 86400000);
  if (diff < 0) return { label: "Süresi Doldu", color: "#f87171", bg: "rgba(248,113,113,0.15)" };
  if (diff <= 7) return { label: `${diff} gün kaldı`, color: "#f59e0b", bg: "rgba(245,158,11,0.15)" };
  return { label: "Aktif", color: "#4ade80", bg: "rgba(74,222,128,0.15)" };
}

// ─── Mini Chart (inline SVG) ─────────────────────────────────────────────────
function MiniChart({ data, color = "#D4AF37" }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const h = 56, w = 260;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      <polyline fill="none" stroke={color} strokeWidth={2} points={pts} strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return <circle key={i} cx={x} cy={y} r={3} fill={color} />;
      })}
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState("profil");
  const [member, setMember] = useState<Member | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [programs, setPrograms] = useState<MemberProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  // Profil düzenleme
  const [editMember, setEditMember] = useState<Partial<Member>>({});
  const [saving, setSaving] = useState(false);
  // Trainer yorum
  const [commentLogId, setCommentLogId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [savingComment, setSavingComment] = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    if (!id) return;
    const supabase = createClient();
    async function load() {
      const [
        { data: m },
        { data: meas },
        { data: food },
        { data: water },
        { data: pics },
        { data: progs },
      ] = await Promise.all([
        supabase.from("members").select("*").eq("id", id).single(),
        supabase.from("measurements").select("*").eq("member_id", id).order("measured_at", { ascending: false }).limit(20),
        supabase.from("food_logs").select("id, meal_type, notes, trainer_comment, logged_at").eq("member_id", id).order("logged_at", { ascending: false }).limit(30),
        supabase.from("water_logs").select("*").eq("member_id", id).order("logged_at", { ascending: false }).limit(14),
        supabase.from("progress_photos").select("*").eq("member_id", id).order("taken_at", { ascending: false }).limit(20),
        supabase.from("member_programs").select("*").eq("member_id", id).order("day_of_week"),
      ]);
      setMember(m as Member);
      setEditMember(m as Member);
      setMeasurements((meas as Measurement[]) ?? []);
      setFoodLogs((food as FoodLog[]) ?? []);
      setWaterLogs((water as WaterLog[]) ?? []);
      setPhotos((pics as ProgressPhoto[]) ?? []);
      setPrograms((progs as MemberProgram[]) ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  const saveMember = async () => {
    if (!id) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("members").update({
      full_name: editMember.full_name,
      phone: editMember.phone,
      birth_date: editMember.birth_date,
      gender: editMember.gender,
      height_cm: editMember.height_cm,
      goal: editMember.goal,
      membership_start: editMember.membership_start,
      membership_end: editMember.membership_end,
      streak_days: editMember.streak_days,
    }).eq("id", id);
    setSaving(false);
    if (!error) {
      setMember((prev) => ({ ...prev!, ...editMember }));
      showToast("Üye bilgileri güncellendi");
    } else {
      showToast("Hata: " + error.message, false);
    }
  };

  const saveComment = async (logId: string) => {
    setSavingComment(true);
    const supabase = createClient();
    const { error } = await supabase.from("food_logs").update({ trainer_comment: commentText }).eq("id", logId);
    setSavingComment(false);
    if (!error) {
      setFoodLogs((prev) => prev.map((l) => l.id === logId ? { ...l, trainer_comment: commentText } : l));
      setCommentLogId(null);
      setCommentText("");
      showToast("Yorum eklendi");
    } else {
      showToast("Hata: " + error.message, false);
    }
  };

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" }) : "–";

  if (loading) {
    return (
      <div style={{ color: "rgba(255,255,255,0.3)", padding: 60, textAlign: "center", fontSize: 14 }}>
        Yükleniyor...
      </div>
    );
  }
  if (!member) {
    return (
      <div style={{ color: "#f87171", padding: 60, textAlign: "center", fontSize: 14 }}>
        Üye bulunamadı.
      </div>
    );
  }

  const status = getMembershipStatus(member.membership_end);
  const weightData = [...measurements].reverse().map((m) => m.weight_kg ?? 0).filter(Boolean);

  return (
    <div style={{ maxWidth: 960 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#141414", border: `1px solid ${toast.ok ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`, color: toast.ok ? "#4ade80" : "#f87171", padding: "10px 18px", borderRadius: 10, fontSize: 13, zIndex: 999 }}>
          {toast.msg}
        </div>
      )}

      {/* Başlık */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, padding: "7px 10px", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 22, margin: 0, marginBottom: 2 }}>
            {member.full_name || "İsimsiz Üye"}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{member.email}</span>
            <span style={{ background: status.bg, color: status.color, padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 }}>
              {status.label}
            </span>
            {member.streak_days > 0 && (
              <span style={{ fontSize: 11, color: "#f59e0b" }}>🔥 {member.streak_days} gün streak</span>
            )}
          </div>
        </div>
      </div>

      {/* Sekmeler */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { key: "profil", label: "Profil", icon: <User size={14} /> },
          { key: "olcumler", label: "Ölçümler", icon: <Activity size={14} /> },
          { key: "beslenme", label: "Beslenme", icon: <Utensils size={14} /> },
          { key: "su", label: "Su Takibi", icon: <Droplets size={14} /> },
          { key: "program", label: "Program", icon: <Dumbbell size={14} /> },
          { key: "fotograflar", label: "Fotoğraflar", icon: <Camera size={14} /> },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={tabStyle(tab === t.key)}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>{t.icon}{t.label}</span>
          </button>
        ))}
      </div>

      {/* ─── PROFİL ─── */}
      {tab === "profil" && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}>
            <User size={16} color="#D4AF37" /> Profil Bilgileri
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            {[
              { label: "Ad Soyad", key: "full_name", type: "text" },
              { label: "Telefon", key: "phone", type: "text" },
              { label: "Doğum Tarihi", key: "birth_date", type: "date" },
              { label: "Boy (cm)", key: "height_cm", type: "number" },
              { label: "Üyelik Başlangıcı", key: "membership_start", type: "date" },
              { label: "Üyelik Bitişi", key: "membership_end", type: "date" },
              { label: "Streak", key: "streak_days", type: "number" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginBottom: 5 }}>{label}</label>
                <input
                  type={type}
                  value={(editMember[key as keyof Member] ?? "") as string}
                  onChange={(e) => setEditMember((prev) => ({ ...prev, [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value }))}
                  style={inputStyle}
                />
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginBottom: 5 }}>Cinsiyet</label>
              <select value={editMember.gender ?? ""} onChange={(e) => setEditMember((prev) => ({ ...prev, gender: e.target.value }))} style={inputStyle}>
                <option value="">Seçiniz</option>
                <option value="erkek">Erkek</option>
                <option value="kadın">Kadın</option>
                <option value="diğer">Diğer</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginBottom: 5 }}>Hedef</label>
            <textarea
              value={editMember.goal ?? ""}
              onChange={(e) => setEditMember((prev) => ({ ...prev, goal: e.target.value }))}
              rows={2}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              placeholder="Üyenin hedefi..."
            />
          </div>
          <button onClick={saveMember} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 20px", background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", color: "#fff", borderRadius: 9, cursor: saving ? "default" : "pointer", fontWeight: 600, fontSize: 13 }}>
            <Save size={14} />{saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </div>
      )}

      {/* ─── ÖLÇÜMLER ─── */}
      {tab === "olcumler" && (
        <div>
          <div style={cardStyle}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={16} color="#D4AF37" /> Kilo Trendi
            </h2>
            {weightData.length >= 2 ? (
              <div>
                <MiniChart data={weightData} />
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>Son {weightData.length} ölçüm</p>
              </div>
            ) : (
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Yeterli veri yok</p>
            )}
          </div>
          <div style={cardStyle}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 14px" }}>Ölçüm Geçmişi</h2>
            {measurements.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Henüz ölçüm yok</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["Tarih", "Kilo", "Göğüs", "Bel", "Kalça", "Kol", "Bacak", "Yağ %"].map((h) => (
                      <th key={h} style={{ padding: "7px 10px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m) => (
                    <tr key={m.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "9px 10px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{fmt(m.measured_at)}</td>
                      {[m.weight_kg, m.chest_cm, m.waist_cm, m.hip_cm, m.arm_cm, m.leg_cm, m.body_fat_pct].map((v, i) => (
                        <td key={i} style={{ padding: "9px 10px", fontSize: 13, color: v != null ? "#fff" : "rgba(255,255,255,0.2)" }}>
                          {v != null ? v : "–"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ─── BESLENME ─── */}
      {tab === "beslenme" && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <Utensils size={16} color="#D4AF37" /> Yemek Logları
          </h2>
          {foodLogs.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Yemek kaydı yok</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {foodLogs.map((log) => (
                <div key={log.id} style={{ background: "#1A1A1A", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#D4AF37", textTransform: "capitalize" }}>{log.meal_type}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>
                        {new Date(log.logged_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <button
                      onClick={() => { setCommentLogId(log.id); setCommentText(log.trainer_comment ?? ""); }}
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 6, color: "#D4AF37", fontSize: 11, cursor: "pointer" }}
                    >
                      <MessageCircle size={11} />
                      {log.trainer_comment ? "Yorumu Düzenle" : "Yorum Ekle"}
                    </button>
                  </div>
                  {log.notes && <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", margin: "6px 0 0", lineHeight: 1.5 }}>{log.notes}</p>}
                  {log.trainer_comment && (
                    <div style={{ marginTop: 8, background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8, padding: "8px 12px" }}>
                      <p style={{ fontSize: 12, color: "#D4AF37", margin: 0, lineHeight: 1.5 }}>
                        <strong>Trainer:</strong> {log.trainer_comment}
                      </p>
                    </div>
                  )}
                  {/* Yorum formu */}
                  {commentLogId === log.id && (
                    <div style={{ marginTop: 10 }}>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={2}
                        placeholder="Trainer yorumu..."
                        style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit", fontSize: 13 }}
                      />
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button onClick={() => saveComment(log.id)} disabled={savingComment} style={{ padding: "7px 14px", background: "#7A0D2A", border: "none", color: "#fff", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                          {savingComment ? "Kaydediliyor..." : "Kaydet"}
                        </button>
                        <button onClick={() => setCommentLogId(null)} style={{ padding: "7px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)", borderRadius: 7, cursor: "pointer", fontSize: 12 }}>
                          İptal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── SU TAKİBİ ─── */}
      {tab === "su" && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <Droplets size={16} color="#60a5fa" /> Su Takip Geçmişi (Son 14 Gün)
          </h2>
          {waterLogs.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Su kaydı yok</p>
          ) : (
            <div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {waterLogs.map((w) => {
                  const pct = Math.min((w.amount_ml / 2500) * 100, 100);
                  return (
                    <div key={w.id} style={{ width: 72, textAlign: "center" }}>
                      <div style={{ height: 60, background: "rgba(255,255,255,0.04)", borderRadius: 8, position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${pct}%`, background: pct >= 80 ? "rgba(74,222,128,0.25)" : "rgba(96,165,250,0.25)", transition: "height 0.3s" }} />
                        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>
                          {w.amount_ml >= 1000 ? `${(w.amount_ml / 1000).toFixed(1)}L` : `${w.amount_ml}ml`}
                        </span>
                      </div>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "4px 0 0" }}>
                        {new Date(w.logged_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ background: "#1A1A1A", borderRadius: 10, padding: "10px 16px", flex: 1 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Günlük Ortalama</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#60a5fa" }}>
                    {Math.round(waterLogs.reduce((a, w) => a + w.amount_ml, 0) / waterLogs.length)} ml
                  </div>
                </div>
                <div style={{ background: "#1A1A1A", borderRadius: 10, padding: "10px 16px", flex: 1 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Hedef Ulaşım (%80)</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#4ade80" }}>
                    {waterLogs.filter((w) => w.amount_ml >= 2000).length} / {waterLogs.length} gün
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── PROGRAM ─── */}
      {tab === "program" && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <Dumbbell size={16} color="#D4AF37" /> Aktif Program
          </h2>
          {programs.filter((p) => p.is_active).length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Aktif program yok</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {programs.filter((p) => p.is_active).map((prog) => (
                <div key={prog.id} style={{ background: "#1A1A1A", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#D4AF37" }}>{DAYS[prog.day_of_week]}</span>
                    <span style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80", padding: "1px 7px", borderRadius: 5, fontSize: 10, fontWeight: 600 }}>Aktif</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {Array.isArray(prog.exercises) && prog.exercises.map((ex: unknown, i: number) => {
                      const e = ex as { name?: string; sets?: number; reps?: number };
                      return (
                        <span key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: 6 }}>
                          {e.name ?? "Egzersiz"}{e.sets ? ` ${e.sets}x${e.reps}` : ""}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── FOTOĞRAFLAR ─── */}
      {tab === "fotograflar" && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <Camera size={16} color="#D4AF37" /> İlerleme Fotoğrafları
          </h2>
          {photos.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Henüz fotoğraf yüklenmemiş</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
              {photos.map((p) => (
                <div key={p.id} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <img src={p.photo_url} alt={p.angle} style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
                  <div style={{ padding: "6px 8px", background: "#1A1A1A" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "capitalize" }}>{p.angle}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{fmt(p.taken_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
