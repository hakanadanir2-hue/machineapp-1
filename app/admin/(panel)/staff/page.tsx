"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X, Users } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  cert: string | null;
  exp_years: number | null;
  image_url: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

const emptyStaff: Omit<StaffMember, "id" | "created_at"> = {
  name: "",
  role: "",
  cert: "",
  exp_years: null,
  image_url: "",
  order_index: 0,
  is_active: true,
};

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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 500,
  color: "rgba(255,255,255,0.5)",
  marginBottom: 6,
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form, setForm] = useState<Omit<StaffMember, "id" | "created_at">>(emptyStaff);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [tableError, setTableError] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStaff = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("staff")
      .select("id,name,role,cert,exp_years,image_url,order_index,is_active,created_at")
      .order("order_index");
    if (error && error.code === "42P01") {
      setTableError(true);
    } else {
      setStaff(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openAdd = () => {
    setForm({ ...emptyStaff, order_index: staff.length });
    setEditing(null);
    setModal("add");
  };

  const openEdit = (m: StaffMember) => {
    setEditing(m);
    setForm({
      name: m.name,
      role: m.role,
      cert: m.cert ?? "",
      exp_years: m.exp_years,
      image_url: m.image_url ?? "",
      order_index: m.order_index,
      is_active: m.is_active,
    });
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.role.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      cert: form.cert?.trim() || null,
      exp_years: form.exp_years ? Number(form.exp_years) : null,
      image_url: form.image_url?.trim() || null,
      order_index: Number(form.order_index) || 0,
      is_active: form.is_active,
    };

    if (modal === "add") {
      await supabase.from("staff").insert(payload);
    } else if (modal === "edit" && editing) {
      await supabase.from("staff").update(payload).eq("id", editing.id);
    }

    setSaving(false);
    closeModal();
    showToast(modal === "add" ? "Eğitmen eklendi" : "Eğitmen güncellendi");
    fetchStaff();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const supabase = createClient();
    await supabase.from("staff").delete().eq("id", deleteId);
    setDeleteId(null);
    showToast("Eğitmen silindi");
    fetchStaff();
  };

  const setF = (key: keyof Omit<StaffMember, "id" | "created_at">, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <div
      onClick={() => onChange(!value)}
      style={{ width: 40, height: 22, borderRadius: 11, background: value ? "#7A0D2A" : "rgba(255,255,255,0.1)", position: "relative", cursor: "pointer", transition: "background 0.15s", border: value ? "1px solid rgba(212,175,55,0.3)" : "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}
    >
      <div style={{ position: "absolute", top: 2, left: value ? 19 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.15s" }} />
    </div>
  );

  if (tableError) {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", marginBottom: 8 }}>Eğitmenler</h1>
        <div style={{ background: "#141414", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 16, padding: 28 }}>
          <p style={{ color: "#f87171", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>staff tablosu bulunamadı</p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.7, marginBottom: 18 }}>
            Aşağıdaki SQL sorgusunu Supabase SQL Editor&apos;de çalıştırın:
          </p>
          <pre style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "16px 18px", color: "#D4AF37", fontSize: 12.5, overflowX: "auto", lineHeight: 1.7 }}>
{`CREATE TABLE IF NOT EXISTS staff (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  cert text,
  exp_years integer,
  image_url text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read staff" ON staff FOR SELECT USING (true);
CREATE POLICY "Admin write staff" ON staff FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));`}
          </pre>
          <button onClick={fetchStaff} style={{ marginTop: 12, padding: "8px 18px", background: "#7A0D2A", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#141414", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", padding: "10px 18px", borderRadius: 10, fontSize: 13, zIndex: 999 }}>
          {toast}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: 0, marginBottom: 4 }}>Eğitmenler</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>Hakkımızda sayfasında görünen eğitmen kadrosu</p>
        </div>
        <button
          onClick={openAdd}
          style={{ background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", color: "#fff", padding: "9px 18px", borderRadius: 9, cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
        >
          <Plus size={15} /> Eğitmen Ekle
        </button>
      </div>

      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Eğitmen", "Unvan", "Sertifika", "Deneyim", "Sıra", "Durum", "İşlem"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 28, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Yükleniyor...</td></tr>
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div style={{ padding: "3rem", textAlign: "center" }}>
                    <Users style={{ width: 40, height: 40, color: "rgba(255,255,255,0.1)", margin: "0 auto 12px" }} />
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, marginBottom: 4 }}>Henüz eğitmen eklenmemiş</p>
                    <p style={{ color: "rgba(255,255,255,0.18)", fontSize: 12 }}>Hakkımızda sayfasında eğitmen kartları görünmez.</p>
                  </div>
                </td>
              </tr>
            ) : (
              staff.map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#222", border: "1px solid #2A2A2A", overflow: "hidden", flexShrink: 0 }}>
                        {m.image_url ? (
                          <img src={m.image_url} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Users size={16} color="rgba(255,255,255,0.2)" />
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{m.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 12.5, color: "#D4AF37" }}>{m.role}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{m.cert || "—"}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{m.exp_years ? `${m.exp_years} yıl` : "—"}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{m.order_index}</td>
                  <td style={{ padding: "11px 14px" }}>
                    {m.is_active ? (
                      <span style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Aktif</span>
                    ) : (
                      <span style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Gizli</span>
                    )}
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(m)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.5)", borderRadius: 6, padding: "5px 7px", cursor: "pointer" }}><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(m.id)} style={{ background: "rgba(248,113,113,0.1)", border: "none", color: "#f87171", borderRadius: 6, padding: "5px 7px", cursor: "pointer" }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, maxWidth: 540, width: "100%", marginTop: 24, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: 0 }}>
                {modal === "add" ? "Eğitmen Ekle" : "Eğitmen Düzenle"}
              </h2>
              <button onClick={closeModal} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Ad Soyad *</label>
                  <input type="text" value={form.name} onChange={(e) => setF("name", e.target.value)} style={inputStyle} placeholder="Ahmet Yılmaz" />
                </div>
                <div>
                  <label style={labelStyle}>Unvan / Branş *</label>
                  <input type="text" value={form.role} onChange={(e) => setF("role", e.target.value)} style={inputStyle} placeholder="Fitness Eğitmeni" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Sertifika</label>
                  <input type="text" value={form.cert ?? ""} onChange={(e) => setF("cert", e.target.value)} style={inputStyle} placeholder="ACSM · NASM" />
                </div>
                <div>
                  <label style={labelStyle}>Deneyim (yıl)</label>
                  <input type="number" value={form.exp_years ?? ""} onChange={(e) => setF("exp_years", e.target.value ? Number(e.target.value) : null)} style={inputStyle} placeholder="8" min="0" max="50" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Fotoğraf URL</label>
                <input type="url" value={form.image_url ?? ""} onChange={(e) => setF("image_url", e.target.value)} style={inputStyle} placeholder="https://..." />
                {form.image_url && (
                  <div style={{ marginTop: 8, width: 64, height: 64, borderRadius: 10, overflow: "hidden", border: "1px solid #2A2A2A" }}>
                    <img src={form.image_url} alt="Önizleme" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Sıra No (küçük = önce)</label>
                <input type="number" value={form.order_index} onChange={(e) => setF("order_index", Number(e.target.value))} style={inputStyle} min="0" />
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <Toggle value={form.is_active} onChange={(v) => setF("is_active", v)} />
                  <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)" }}>
                    {form.is_active ? "Hakkımızda sayfasında görünür" : "Gizli (sayfada gösterilmez)"}
                  </span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
              <button onClick={closeModal} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", padding: "8px 16px", borderRadius: 9, cursor: "pointer", fontSize: 13 }}>İptal</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.role.trim()} style={{ background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", color: "#fff", padding: "8px 16px", borderRadius: 9, cursor: saving ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 13, opacity: (!form.name.trim() || !form.role.trim()) ? 0.5 : 1 }}>
                {saving ? "Kaydediliyor..." : modal === "add" ? "Ekle" : "Güncelle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, maxWidth: 360, width: "100%", padding: 28, textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={20} color="#f87171" />
            </div>
            <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>Eğitmeni Sil</h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 24px" }}>Bu eğitmeni silmek istediğinize emin misiniz?</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setDeleteId(null)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", padding: "8px 20px", borderRadius: 9, cursor: "pointer", fontSize: 13 }}>İptal</button>
              <button onClick={handleDelete} style={{ background: "rgba(220,38,38,0.8)", border: "none", color: "#fff", padding: "8px 20px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
