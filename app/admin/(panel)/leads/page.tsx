"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Lead, LeadType, LeadStatus } from "@/types/leads";
import { LEAD_TYPE_LABELS, LEAD_STATUS_CONFIG, LEAD_TYPE_COLORS } from "@/types/leads";
import {
  Search, Filter, ChevronDown, MessageSquare, Calendar, User,
  Phone, Mail, StickyNote, CheckCircle, Clock, X, RefreshCw,
  Trash2, Eye, Check, FileText, Tag, Dumbbell, Star
} from "lucide-react";

const inputBase: React.CSSProperties = {
  background: "#0F0F0F",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#fff",
  padding: "8px 12px",
  fontSize: 13,
  outline: "none",
};

const TYPES: Array<{ value: LeadType | "all"; label: string }> = [
  { value: "all", label: "Tüm Türler" },
  { value: "contact", label: "İletişim" },
  { value: "trial", label: "Deneme Antrenmanı" },
  { value: "quote", label: "Fiyat Teklifi" },
  { value: "program", label: "Program Başvurusu" },
  { value: "appointment", label: "Randevu" },
];

const STATUSES: Array<{ value: LeadStatus | "all"; label: string }> = [
  { value: "all", label: "Tüm Durumlar" },
  { value: "new", label: "Yeni" },
  { value: "read", label: "Okundu" },
  { value: "in_progress", label: "İşlemde" },
  { value: "done", label: "Tamamlandı" },
  { value: "cancelled", label: "İptal" },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  contact: <MessageSquare size={14} />,
  trial: <Star size={14} />,
  quote: <Tag size={14} />,
  program: <Dumbbell size={14} />,
  appointment: <Calendar size={14} />,
};

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, color, background: bg, border: `1px solid ${color}25`, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function LeadDetailModal({ lead, onClose, onSave }: { lead: Lead; onClose: () => void; onSave: (id: string, status: LeadStatus, note: string) => Promise<void> }) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [note, setNote] = useState(lead.admin_note ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(lead.id, status, note);
    setSaving(false);
    onClose();
  };

  const sConf = LEAD_STATUS_CONFIG[lead.status];
  const tConf = LEAD_TYPE_COLORS[lead.type];

  const field = (label: string, value: string | number | null | undefined) =>
    value ? (
      <div style={{ marginBottom: 10 }}>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>{label}</p>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, margin: 0 }}>{value}</p>
      </div>
    ) : null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}
      onClick={onClose}>
      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, width: "100%", maxWidth: 640, padding: 0, overflow: "hidden" }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ background: tConf.bg, color: tConf.color, width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {TYPE_ICONS[lead.type]}
            </span>
            <div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>{lead.name}</p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: 0 }}>{LEAD_TYPE_LABELS[lead.type]} · {new Date(lead.created_at).toLocaleString("tr-TR")}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: "20px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
          {/* Left col */}
          <div>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>İletişim</p>
            {field("Telefon", lead.phone)}
            {field("E-posta", lead.email)}
            {field("Mesaj", lead.message)}
            {lead.type === "trial" && <>
              {field("İlgilenilen Hizmet", lead.trial_service)}
              {field("Hedef", lead.trial_goal)}
              {field("Seviye", lead.trial_level)}
            </>}
            {lead.type === "quote" && <>
              {field("Paket", lead.quote_package)}
              {field("Bütçe", lead.quote_budget)}
            </>}
            {lead.type === "program" && <>
              {field("Hedef", lead.prog_goal)}
              {field("Seviye", lead.prog_level)}
              {field("Haftalık Gün", lead.prog_days)}
              {field("Kilo / Boy", lead.prog_weight && lead.prog_height ? `${lead.prog_weight} kg / ${lead.prog_height} cm` : null)}
              {field("Yaş", lead.prog_age)}
              {field("Sakatlık", lead.prog_injuries)}
            </>}
            {lead.type === "appointment" && <>
              {field("Tarih", lead.appt_date)}
              {field("Saat", lead.appt_time)}
              {field("Hizmet", lead.appt_service)}
              {field("Notlar", lead.appt_notes)}
            </>}
          </div>

          {/* Right col */}
          <div>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Yönetim</p>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Durum</label>
              <select value={status} onChange={e => setStatus(e.target.value as LeadStatus)}
                style={{ ...inputBase, width: "100%", fontSize: 13 }}>
                {STATUSES.filter(s => s.value !== "all").map(s => (
                  <option key={s.value} value={s.value} style={{ background: "#1A1A1A" }}>{s.label}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Admin Notu</label>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="İç not ekle (müşteriye gösterilmez)"
                style={{ ...inputBase, width: "100%", minHeight: 100, resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href={`tel:${lead.phone}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "rgba(255,255,255,0.5)", fontSize: 12, textDecoration: "none" }}>
                <Phone size={12} /> Ara
              </a>
              {lead.phone && (
                <a href={`https://wa.me/90${lead.phone.replace(/\D/g, "").slice(-10)}`} target="_blank" rel="noopener noreferrer"
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.2)", borderRadius: 9, color: "#25d366", fontSize: 12, textDecoration: "none" }}>
                  <MessageSquare size={12} /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 22px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "9px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13 }}>İptal</button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: "9px 22px", background: saving ? "#333" : "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 9, color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700 }}>
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<LeadType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const PAGE_SIZE = 20;
  const supabase = createClient();
  const searchRef = useRef<ReturnType<typeof globalThis.setTimeout> | undefined>(undefined);

  const load = useCallback(async () => {
    setLoading(true);

    let q = supabase.from("leads").select("*", { count: "exact" });
    if (typeFilter !== "all") q = q.eq("type", typeFilter);
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    if (search.trim()) q = q.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    if (dateFrom) q = q.gte("created_at", dateFrom);
    if (dateTo) q = q.lte("created_at", dateTo + "T23:59:59");
    q = q.order("created_at", { ascending: false }).range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    const { data, count, error } = await q;
    if (!error) {
      setLeads(data as Lead[]);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [supabase, typeFilter, statusFilter, search, dateFrom, dateTo, page]);

  useEffect(() => {
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => { setPage(0); load(); }, 300);
    return () => clearTimeout(searchRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter, statusFilter, dateFrom, dateTo]);

  useEffect(() => { load(); }, [page, load]);

  const markRead = async (id: string) => {
    await supabase.from("leads").update({ is_read: true, status: "read" }).eq("id", id).eq("status", "new");
    load();
  };

  const updateLead = async (id: string, status: LeadStatus, note: string) => {
    await supabase.from("leads").update({ status, admin_note: note, is_read: true }).eq("id", id);
    load();
  };

  const deleteLead = async (id: string) => {
    setDeleting(id);
    await supabase.from("leads").delete().eq("id", id);
    setDeleting(null);
    load();
  };

  const newCount = leads.filter(l => l.status === "new" && !l.is_read).length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const statsAll = {
    total: total,
    new: leads.filter(l => l.status === "new").length,
    inProgress: leads.filter(l => l.status === "in_progress").length,
    done: leads.filter(l => l.status === "done").length,
  };

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Başvuru & Talep Yönetimi</h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>İletişim, deneme, teklif, program ve randevu başvuruları</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {newCount > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 9, color: "#f87171", fontSize: 13, fontWeight: 700 }}>
              {newCount} okunmamış
            </span>
          )}
          <button onClick={() => load()} style={{ width: 36, height: 36, background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RefreshCw style={{ width: 14, height: 14, color: "rgba(255,255,255,0.4)" }} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Toplam", value: total, color: "#fff" },
          { label: "Yeni", value: statsAll.new, color: "#f87171" },
          { label: "İşlemde", value: statsAll.inProgress, color: "#60a5fa" },
          { label: "Tamamlandı", value: statsAll.done, color: "#4ade80" },
        ].map(s => (
          <div key={s.label} style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: s.color, fontWeight: 800, fontSize: 20 }}>{s.value}</span>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto auto", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "rgba(255,255,255,0.2)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="İsim, telefon, e-posta ara..."
              style={{ ...inputBase, paddingLeft: 32, width: "100%", boxSizing: "border-box" }} />
          </div>
          {/* Type */}
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as LeadType | "all")}
            style={{ ...inputBase, minWidth: 155 }}>
            {TYPES.map(t => <option key={t.value} value={t.value} style={{ background: "#1A1A1A" }}>{t.label}</option>)}
          </select>
          {/* Status */}
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as LeadStatus | "all")}
            style={{ ...inputBase, minWidth: 135 }}>
            {STATUSES.map(s => <option key={s.value} value={s.value} style={{ background: "#1A1A1A" }}>{s.label}</option>)}
          </select>
          {/* Date from */}
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ ...inputBase, colorScheme: "dark" }} />
          {/* Date to */}
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{ ...inputBase, colorScheme: "dark" }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Yükleniyor...</p>
          </div>
        ) : leads.length === 0 ? (
          <div style={{ padding: "3.5rem", textAlign: "center" }}>
            <MessageSquare style={{ width: 36, height: 36, color: "rgba(255,255,255,0.08)", margin: "0 auto 12px" }} />
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 14 }}>Başvuru bulunamadı</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["", "Ad", "Tür", "Durum", "Telefon", "Tarih", ""].map((h, i) => (
                  <th key={i} style={{ padding: "11px 14px", textAlign: "left", color: "rgba(255,255,255,0.25)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => {
                const sConf = LEAD_STATUS_CONFIG[lead.status];
                const tConf = LEAD_TYPE_COLORS[lead.type];
                const isNew = lead.status === "new" && !lead.is_read;
                return (
                  <tr key={lead.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: isNew ? "rgba(248,113,113,0.03)" : "transparent", cursor: "pointer" }}
                    onClick={() => { setSelected(lead); if (isNew) markRead(lead.id); }}>
                    {/* Unread dot */}
                    <td style={{ padding: "12px 8px 12px 14px", width: 10 }}>
                      {isNew && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171" }} />}
                    </td>
                    {/* Name */}
                    <td style={{ padding: "12px 14px" }}>
                      <p style={{ color: "#fff", fontWeight: isNew ? 700 : 500, fontSize: 13, margin: "0 0 2px" }}>{lead.name}</p>
                      {lead.email && <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, margin: 0 }}>{lead.email}</p>}
                    </td>
                    {/* Type */}
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, color: tConf.color, background: tConf.bg }}>
                        {TYPE_ICONS[lead.type]} {LEAD_TYPE_LABELS[lead.type]}
                      </span>
                    </td>
                    {/* Status */}
                    <td style={{ padding: "12px 14px" }}>
                      <Badge label={sConf.label} color={sConf.color} bg={sConf.bg} />
                    </td>
                    {/* Phone */}
                    <td style={{ padding: "12px 14px" }}>
                      {lead.phone ? (
                        <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()}
                          style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                          <Phone size={11} /> {lead.phone}
                        </a>
                      ) : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>—</span>}
                    </td>
                    {/* Date */}
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
                        {new Date(lead.created_at).toLocaleDateString("tr-TR")}
                      </span>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button onClick={() => setSelected(lead)} title="Detay"
                          style={{ width: 28, height: 28, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Eye style={{ width: 12, height: 12, color: "rgba(255,255,255,0.4)" }} />
                        </button>
                        <button onClick={() => { if (confirm("Başvuruyu silmek istediğinize emin misiniz?")) deleteLead(lead.id); }} title="Sil"
                          disabled={deleting === lead.id}
                          style={{ width: 28, height: 28, background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.12)", borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Trash2 style={{ width: 12, height: 12, color: "#f87171" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{ padding: "7px 16px", background: "#141414", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: page === 0 ? "rgba(255,255,255,0.2)" : "#fff", cursor: page === 0 ? "not-allowed" : "pointer", fontSize: 13 }}>
            ← Önceki
          </button>
          <span style={{ padding: "7px 14px", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>{page + 1} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            style={{ padding: "7px 16px", background: "#141414", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: page >= totalPages - 1 ? "rgba(255,255,255,0.2)" : "#fff", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer", fontSize: 13 }}>
            Sonraki →
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <LeadDetailModal
          lead={selected}
          onClose={() => setSelected(null)}
          onSave={updateLead}
        />
      )}
    </div>
  );
}
