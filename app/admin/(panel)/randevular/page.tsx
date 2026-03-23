"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, CheckCircle, XCircle, Clock, MessageSquare, Phone, Mail, Search, Filter } from "lucide-react";

interface Appointment {
  id: string; full_name: string; email: string; phone: string; service_type: string;
  preferred_date: string; preferred_time: string; notes: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  admin_note: string; created_at: string;
}

const STATUS_MAP = {
  pending: { label: "Bekliyor", color: "#facc15", bg: "rgba(250,204,21,0.1)" },
  confirmed: { label: "Onaylandı", color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  cancelled: { label: "İptal", color: "#f87171", bg: "rgba(248,113,113,0.1)" },
  completed: { label: "Tamamlandı", color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
};

const IS: React.CSSProperties = { background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "#fff", padding: "8px 12px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };

export default function RandevularPage() {
  const sb = createClient();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Appointment | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2800); };

  const load = async () => {
    setLoading(true);
    const { data } = await sb.from("appointments").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter(a => {
    const ms = statusFilter === "all" || a.status === statusFilter;
    const mq = !search || a.full_name.toLowerCase().includes(search.toLowerCase()) || (a.phone || "").includes(search) || (a.email || "").toLowerCase().includes(search.toLowerCase());
    return ms && mq;
  });

  const updateStatus = async (id: string, status: string) => {
    setSaving(true);
    await sb.from("appointments").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    setSaving(false); load(); showToast("Durum güncellendi ✓");
    if (detail?.id === id) setDetail(d => d ? { ...d, status: status as Appointment["status"] } : null);
  };

  const saveNote = async () => {
    if (!detail) return;
    setSaving(true);
    await sb.from("appointments").update({ admin_note: adminNote, updated_at: new Date().toISOString() }).eq("id", detail.id);
    setSaving(false); load(); showToast("Not kaydedildi ✓");
    setDetail(d => d ? { ...d, admin_note: adminNote } : null);
  };

  const openDetail = (a: Appointment) => { setDetail(a); setAdminNote(a.admin_note || ""); };

  const stats = [
    { label: "Toplam", value: items.length, color: "#D4AF37" },
    { label: "Bekleyen", value: items.filter(a => a.status === "pending").length, color: "#facc15" },
    { label: "Onaylı", value: items.filter(a => a.status === "confirmed").length, color: "#4ade80" },
    { label: "Tamamlanan", value: items.filter(a => a.status === "completed").length, color: "#60a5fa" },
  ];

  return (
    <div style={{ maxWidth: 1050 }}>
      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: "#141414", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", padding: "10px 18px", borderRadius: 10, fontSize: 13, zIndex: 999 }}>{toast}</div>}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Randevular</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>Randevu ve deneme antrenmanı taleplerini yönet</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" }}>
            <p style={{ color: "#fff", fontWeight: 800, fontSize: 22, margin: 0 }}>{s.value}</p>
            <p style={{ color: s.color, fontSize: 11, margin: 0, fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="İsim, telefon, e-posta..." style={{ ...IS, width: 220, paddingLeft: 28 }} />
        </div>
        {["all","pending","confirmed","cancelled","completed"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "7px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: statusFilter === s ? "#7A0D2A" : "rgba(255,255,255,0.06)", color: statusFilter === s ? "#fff" : "rgba(255,255,255,0.4)" }}>
            {s === "all" ? "Tümü" : STATUS_MAP[s as keyof typeof STATUS_MAP]?.label ?? s}
          </button>
        ))}
      </div>

      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        {loading ? <p style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Yükleniyor...</p>
          : filtered.length === 0 ? <p style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.2)", fontSize: 13 }}>Randevu bulunamadı</p>
          : filtered.map((a, idx) => {
            const st = STATUS_MAP[a.status];
            return (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", cursor: "pointer" }} onClick={() => openDetail(a)}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(212,175,55,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Calendar size={16} color="#D4AF37" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#fff", fontWeight: 600, fontSize: 13, margin: 0 }}>{a.full_name}</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: 0 }}>{a.service_type || "Genel"} {a.preferred_date ? `• ${new Date(a.preferred_date).toLocaleDateString("tr-TR")}` : ""} {a.preferred_time ? `${a.preferred_time}` : ""}</p>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {a.admin_note && <MessageSquare size={12} color="rgba(255,255,255,0.3)" />}
                  <span style={{ padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                </div>
              </div>
            );
          })}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }} onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, width: "100%", maxWidth: 540, marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: 0 }}>Randevu Detayı</h2>
              <button onClick={() => setDetail(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 22 }}>×</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div style={{ background: "#0F0F0F", borderRadius: 10, padding: "12px 14px" }}>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: "0 0 4px" }}>Ad Soyad</p>
                  <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: 0 }}>{detail.full_name}</p>
                </div>
                <div style={{ background: "#0F0F0F", borderRadius: 10, padding: "12px 14px" }}>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: "0 0 4px" }}>Hizmet</p>
                  <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: 0 }}>{detail.service_type || "—"}</p>
                </div>
                {detail.phone && <div style={{ background: "#0F0F0F", borderRadius: 10, padding: "12px 14px" }}>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: "0 0 4px" }}>Telefon</p>
                  <a href={`tel:${detail.phone}`} style={{ color: "#4ade80", fontSize: 14, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}><Phone size={12} />{detail.phone}</a>
                </div>}
                {detail.email && <div style={{ background: "#0F0F0F", borderRadius: 10, padding: "12px 14px" }}>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: "0 0 4px" }}>E-posta</p>
                  <a href={`mailto:${detail.email}`} style={{ color: "#60a5fa", fontSize: 14, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}><Mail size={12} />{detail.email}</a>
                </div>}
                {detail.preferred_date && <div style={{ background: "#0F0F0F", borderRadius: 10, padding: "12px 14px" }}>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: "0 0 4px" }}>Tarih</p>
                  <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: 0 }}>{new Date(detail.preferred_date).toLocaleDateString("tr-TR")} {detail.preferred_time || ""}</p>
                </div>}
                <div style={{ background: "#0F0F0F", borderRadius: 10, padding: "12px 14px" }}>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: "0 0 4px" }}>Başvuru Tarihi</p>
                  <p style={{ color: "#fff", fontSize: 14, margin: 0 }}>{new Date(detail.created_at).toLocaleDateString("tr-TR")}</p>
                </div>
              </div>
              {detail.notes && (
                <div style={{ background: "#0F0F0F", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: "0 0 4px" }}>Müşteri Notu</p>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: 0 }}>{detail.notes}</p>
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Admin Notu</label>
                <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={3} style={{ ...IS, resize: "vertical" }} placeholder="Dahili not ekle..." />
                <button onClick={saveNote} disabled={saving} style={{ marginTop: 8, padding: "7px 16px", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8, color: "#D4AF37", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Notu Kaydet</button>
              </div>
              <div>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 8 }}>Durum Değiştir:</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(["pending","confirmed","completed","cancelled"] as const).map(s => (
                    <button key={s} onClick={() => updateStatus(detail.id, s)} disabled={saving || detail.status === s} style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: detail.status === s ? "default" : "pointer", fontSize: 12, fontWeight: 700, background: detail.status === s ? STATUS_MAP[s].bg : "rgba(255,255,255,0.06)", color: detail.status === s ? STATUS_MAP[s].color : "rgba(255,255,255,0.4)", opacity: detail.status === s ? 1 : 0.7 }}>
                      {STATUS_MAP[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
