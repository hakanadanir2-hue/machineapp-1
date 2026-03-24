"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X, GripVertical } from "lucide-react";

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_active: boolean;
}

const EMPTY: Omit<Faq, "id"> = { question: "", answer: "", category: "genel", order_index: 0, is_active: true };
const CATS = ["genel", "uyelik", "egitim", "odeme", "tesis"];

export default function AdminSssPage() {
  const sb = useMemo(() => createClient(), []);
  const [faqs, setFaqs]     = useState<Faq[]>([]);
  const [loading, setLoad]  = useState(true);
  const [modal, setModal]   = useState(false);
  const [editing, setEdit]  = useState<Faq | null>(null);
  const [form, setForm]     = useState<Omit<Faq, "id">>(EMPTY);
  const [saving, setSave]   = useState(false);
  const [delId, setDelId]   = useState<string | null>(null);
  const [toast, setToast]   = useState<string | null>(null);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoad(true);
    const { data } = await sb.from("faqs").select("*").order("order_index");
    setFaqs((data ?? []) as Faq[]);
    setLoad(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() { setEdit(null); setForm(EMPTY); setModal(true); }
  function openEdit(f: Faq) { setEdit(f); setForm({ question: f.question, answer: f.answer, category: f.category, order_index: f.order_index, is_active: f.is_active }); setModal(true); }

  async function save() {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSave(true);
    if (editing) {
      await sb.from("faqs").update({ ...form, updated_at: new Date().toISOString() }).eq("id", editing.id);
    } else {
      await sb.from("faqs").insert({ ...form, order_index: faqs.length });
    }
    setSave(false);
    setModal(false);
    showToast(editing ? "Güncellendi ✓" : "Eklendi ✓");
    load();
  }

  async function del() {
    if (!delId) return;
    await sb.from("faqs").delete().eq("id", delId);
    setDelId(null);
    showToast("Silindi");
    load();
  }

  async function toggle(f: Faq) {
    await sb.from("faqs").update({ is_active: !f.is_active }).eq("id", f.id);
    load();
  }

  const inp: React.CSSProperties = { background: "#0F0F0F", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, color: "#fff", padding: "9px 12px", fontSize: 13, width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ padding: 24, background: "#0A0A0A", minHeight: "100vh", color: "#fff" }}>
      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, background: "#1a1a1a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "12px 18px", fontSize: 13, fontWeight: 600 }}>{toast}</div>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 3 }}>Sık Sorulan Sorular</h1>
          <p style={{ color: "rgba(255,255,255,.3)", fontSize: 12 }}>Site SSS sayfasına yansır</p>
        </div>
        <button onClick={openNew} style={{ display: "flex", alignItems: "center", gap: 6, background: "#7A0D2A", border: "none", color: "#fff", padding: "9px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
          <Plus size={15} /> Yeni Soru
        </button>
      </div>

      {loading ? (
        <div style={{ color: "rgba(255,255,255,.3)", padding: 40, textAlign: "center" }}>Yükleniyor...</div>
      ) : faqs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 20px", background: "#111", borderRadius: 14, border: "1px solid rgba(255,255,255,.05)", color: "rgba(255,255,255,.2)" }}>
          Henüz soru yok. &quot;Yeni Soru&quot; butonuyla ekleyin.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {faqs.map((f) => (
            <div key={f.id} style={{ background: "#111", border: `1px solid ${f.is_active ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.03)"}`, borderRadius: 12, padding: "14px 16px", opacity: f.is_active ? 1 : 0.45 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <GripVertical size={14} color="rgba(255,255,255,.2)" style={{ marginTop: 3, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: "rgba(212,175,55,.1)", color: "#D4AF37", textTransform: "uppercase" }}>{f.category}</span>
                    {!f.is_active && <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)", background: "rgba(255,255,255,.05)", padding: "2px 8px", borderRadius: 5 }}>Pasif</span>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", marginBottom: 4 }}>{f.question}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.5 }}>{f.answer.slice(0, 120)}{f.answer.length > 120 ? "…" : ""}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => toggle(f)} style={{ padding: "5px 10px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: f.is_active ? "rgba(74,222,128,.1)" : "rgba(255,255,255,.07)", color: f.is_active ? "#4ade80" : "rgba(255,255,255,.3)" }}>
                    {f.is_active ? "Aktif" : "Pasif"}
                  </button>
                  <button onClick={() => openEdit(f)} style={{ padding: "5px 10px", borderRadius: 7, border: "none", cursor: "pointer", background: "rgba(255,255,255,.07)", color: "rgba(255,255,255,.6)" }}><Pencil size={13} /></button>
                  <button onClick={() => setDelId(f.id)} style={{ padding: "5px 10px", borderRadius: 7, border: "none", cursor: "pointer", background: "rgba(248,113,113,.1)", color: "#f87171" }}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.9)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }}>
          <div style={{ background: "#111", border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: 24, width: "100%", maxWidth: 540 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <span style={{ fontWeight: 800, fontSize: 15 }}>{editing ? "Soruyu Düzenle" : "Yeni Soru"}</span>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 5 }}>Kategori</label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} style={{ ...inp }}>
                  {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 5 }}>Soru *</label>
                <input value={form.question} onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))} style={inp} placeholder="Soru metni..." />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 5 }}>Cevap *</label>
                <textarea value={form.answer} onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))} rows={4} style={{ ...inp, resize: "vertical" }} placeholder="Cevap metni..." />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 5 }}>Sıra</label>
                  <input type="number" value={form.order_index} onChange={(e) => setForm((p) => ({ ...p, order_index: Number(e.target.value) }))} style={inp} />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 10 }}>
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} />
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>Aktif</span>
                  </label>
                </div>
              </div>
              <button onClick={save} disabled={saving || !form.question.trim() || !form.answer.trim()} style={{ background: "#7A0D2A", border: "none", color: "#fff", padding: "11px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, marginTop: 4, opacity: saving ? 0.6 : 1 }}>
                {saving ? "Kaydediliyor..." : editing ? "Güncelle" : "Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.9)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#111", border: "1px solid rgba(248,113,113,.2)", borderRadius: 16, padding: 24, maxWidth: 360, width: "100%", textAlign: "center" }}>
            <p style={{ fontWeight: 700, marginBottom: 8 }}>Soruyu sil?</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 20 }}>Bu işlem geri alınamaz.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDelId(null)} style={{ flex: 1, padding: 10, background: "rgba(255,255,255,.07)", border: "none", borderRadius: 9, color: "rgba(255,255,255,.6)", cursor: "pointer", fontWeight: 600 }}>İptal</button>
              <button onClick={del} style={{ flex: 1, padding: 10, background: "rgba(248,113,113,.15)", border: "1px solid rgba(248,113,113,.2)", borderRadius: 9, color: "#f87171", cursor: "pointer", fontWeight: 700 }}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
