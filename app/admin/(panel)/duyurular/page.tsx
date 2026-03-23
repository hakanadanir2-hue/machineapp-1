"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Megaphone, Trash2, Eye, EyeOff, Edit3 } from "lucide-react";

const IS: React.CSSProperties = { background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "#fff", padding: "9px 12px", fontSize: 13.5, outline: "none", width: "100%", boxSizing: "border-box" };
const LBL: React.CSSProperties = { display: "block", color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600, marginBottom: 6 };

interface Announcement {
  id: string; title: string; message: string; type: string;
  bg_color: string; text_color: string; link_url: string; link_text: string;
  is_active: boolean; starts_at: string; ends_at: string; order_index: number; created_at: string;
}

const EMPTY = { title: "", message: "", type: "info", bg_color: "#7A0D2A", text_color: "#fff", link_url: "", link_text: "", is_active: true, starts_at: "", ends_at: "", order_index: 0 };

const TYPE_COLORS: Record<string, string> = { info: "#60a5fa", success: "#4ade80", warning: "#facc15", error: "#f87171", promo: "#D4AF37" };

export default function AnnouncementsPage() {
  const sb = createClient();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2800); };

  const load = async () => {
    setLoading(true);
    const { data } = await sb.from("announcements").select("*").order("order_index").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setF = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => { setEditId(null); setForm({ ...EMPTY }); setModal("add"); };
  const openEdit = (a: Announcement) => {
    setEditId(a.id);
    setForm({ title: a.title, message: a.message, type: a.type, bg_color: a.bg_color || "#7A0D2A", text_color: a.text_color || "#fff", link_url: a.link_url || "", link_text: a.link_text || "", is_active: a.is_active, starts_at: a.starts_at ? a.starts_at.substring(0,16) : "", ends_at: a.ends_at ? a.ends_at.substring(0,16) : "", order_index: a.order_index || 0 });
    setModal("edit");
  };

  const save = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    setSaving(true);
    const payload = { ...form, starts_at: form.starts_at || null, ends_at: form.ends_at || null };
    if (editId) await sb.from("announcements").update(payload).eq("id", editId);
    else await sb.from("announcements").insert(payload);
    setSaving(false); setModal(null); load(); showToast("Kaydedildi ✓");
  };

  const toggle = async (a: Announcement) => {
    await sb.from("announcements").update({ is_active: !a.is_active }).eq("id", a.id);
    load();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await sb.from("announcements").delete().eq("id", deleteId);
    setDeleteId(null); load(); showToast("Silindi");
  };

  return (
    <div style={{ maxWidth: 900 }}>
      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: "#141414", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", padding: "10px 18px", borderRadius: 10, fontSize: 13, zIndex: 999 }}>{toast}</div>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 6px" }}>Duyurular</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>Sitede üstte gösterilecek duyuru ve kampanya bandı</p>
        </div>
        <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Plus size={14} /> Yeni Duyuru
        </button>
      </div>

      <div style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
        Duyuru bandını aktif etmek için: <strong style={{ color: "#D4AF37" }}>Ayarlar → Sistem → Duyuru Bandı</strong> açık olmalı
      </div>

      {/* Liste */}
      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        {loading ? <p style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Yükleniyor...</p>
          : items.length === 0 ? <p style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.2)", fontSize: 13 }}>Henüz duyuru yok</p>
          : items.map((a, idx) => (
            <div key={a.id} style={{ padding: "14px 18px", borderBottom: idx < items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", opacity: a.is_active ? 1 : 0.5 }}>
              {/* Preview band */}
              <div style={{ background: a.bg_color, color: a.text_color, padding: "8px 14px", borderRadius: 8, fontSize: 13, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span><strong>{a.title}</strong> — {a.message}</span>
                {a.link_text && <span style={{ fontSize: 12, opacity: 0.8, textDecoration: "underline" }}>{a.link_text}</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700, background: `${TYPE_COLORS[a.type] ?? "#888"}22`, color: TYPE_COLORS[a.type] ?? "#888" }}>{a.type.toUpperCase()}</span>
                  {a.starts_at && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Başl: {new Date(a.starts_at).toLocaleDateString("tr-TR")}</span>}
                  {a.ends_at && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Bit: {new Date(a.ends_at).toLocaleDateString("tr-TR")}</span>}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => toggle(a)} style={{ padding: "5px 10px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: a.is_active ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.06)", color: a.is_active ? "#4ade80" : "rgba(255,255,255,0.3)" }}>
                    {a.is_active ? <><Eye size={11} style={{ display: "inline", marginRight: 4 }} />Aktif</> : <><EyeOff size={11} style={{ display: "inline", marginRight: 4 }} />Pasif</>}
                  </button>
                  <button onClick={() => openEdit(a)} style={{ padding: "5px 8px", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 7, color: "#D4AF37", cursor: "pointer" }}><Edit3 size={13} /></button>
                  <button onClick={() => setDeleteId(a.id)} style={{ padding: "5px 8px", background: "rgba(248,113,113,0.08)", border: "none", borderRadius: 7, color: "#f87171", cursor: "pointer" }}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, width: "100%", maxWidth: 560, marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: 0 }}>{modal === "add" ? "Yeni Duyuru" : "Duyuruyu Düzenle"}</h2>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 22 }}>×</button>
            </div>
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={LBL}>Başlık *</label><input value={form.title} onChange={e => setF("title", e.target.value)} style={IS} placeholder="Yaz kampanyası!" /></div>
              <div><label style={LBL}>Mesaj *</label><input value={form.message} onChange={e => setF("message", e.target.value)} style={IS} placeholder="Tüm üyeliklerde %20 indirim" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={LBL}>Tür</label><select value={form.type} onChange={e => setF("type", e.target.value)} style={IS}><option value="info">Bilgi</option><option value="success">Başarı</option><option value="warning">Uyarı</option><option value="promo">Kampanya</option><option value="error">Önemli</option></select></div>
                <div>
                  <label style={LBL}>Link Metni</label>
                  <input value={form.link_text} onChange={e => setF("link_text", e.target.value)} style={IS} placeholder="Hemen Al" />
                </div>
              </div>
              <div><label style={LBL}>Link URL</label><input value={form.link_url} onChange={e => setF("link_url", e.target.value)} style={IS} placeholder="/fiyatlar" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LBL}>Arka Plan Rengi</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={form.bg_color} onChange={e => setF("bg_color", e.target.value)} style={{ width: 40, height: 36, borderRadius: 7, border: "none", cursor: "pointer", background: "none" }} />
                    <input value={form.bg_color} onChange={e => setF("bg_color", e.target.value)} style={{ ...IS, flex: 1 }} placeholder="#7A0D2A" />
                  </div>
                </div>
                <div>
                  <label style={LBL}>Yazı Rengi</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={form.text_color} onChange={e => setF("text_color", e.target.value)} style={{ width: 40, height: 36, borderRadius: 7, border: "none", cursor: "pointer", background: "none" }} />
                    <input value={form.text_color} onChange={e => setF("text_color", e.target.value)} style={{ ...IS, flex: 1 }} placeholder="#ffffff" />
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={LBL}>Başlangıç Tarihi</label><input type="datetime-local" value={form.starts_at} onChange={e => setF("starts_at", e.target.value)} style={IS} /></div>
                <div><label style={LBL}>Bitiş Tarihi</label><input type="datetime-local" value={form.ends_at} onChange={e => setF("ends_at", e.target.value)} style={IS} /></div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setF("is_active", e.target.checked)} style={{ accentColor: "#D4AF37", width: 15, height: 15 }} />
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Hemen Aktif Et</span>
              </label>
              <div style={{ background: form.bg_color, color: form.text_color, padding: "10px 16px", borderRadius: 8, fontSize: 13 }}>
                <strong>{form.title || "Başlık"}</strong> — {form.message || "Mesaj"} {form.link_text && <span style={{ textDecoration: "underline", marginLeft: 8 }}>{form.link_text}</span>}
              </div>
              <button onClick={save} disabled={saving} style={{ width: "100%", padding: "11px", background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {saving ? "Kaydediliyor..." : modal === "add" ? "Duyuru Ekle" : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 28, maxWidth: 360, width: "90%" }}>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Duyuruyu Sil</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>Bu duyuru kalıcı olarak silinecek.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: "9px", background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "rgba(255,255,255,0.6)", cursor: "pointer", fontWeight: 600 }}>İptal</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: "9px", background: "#ef4444", border: "none", borderRadius: 9, color: "#fff", cursor: "pointer", fontWeight: 600 }}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
