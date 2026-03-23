"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface Service {
  id: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  features: string[] | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  is_active: boolean;
  order_index: number;
}

const emptyService: Omit<Service, "id"> = {
  name: "",
  short_description: "",
  long_description: "",
  features: [],
  image_url: "",
  cta_text: "",
  cta_link: "",
  is_active: true,
  order_index: 0,
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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<Omit<Service, "id">>(emptyService);
  const [featuresText, setFeaturesText] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchServices = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("services").select("*").order("order_index", { ascending: true });
    setServices(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAdd = () => {
    setForm(emptyService);
    setFeaturesText("");
    setEditing(null);
    setModal("add");
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      name: s.name,
      short_description: s.short_description ?? "",
      long_description: s.long_description ?? "",
      features: s.features ?? [],
      image_url: s.image_url ?? "",
      cta_text: s.cta_text ?? "",
      cta_link: s.cta_link ?? "",
      is_active: s.is_active,
      order_index: s.order_index,
    });
    setFeaturesText((s.features ?? []).join("\n"));
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const features = featuresText.split("\n").map((f) => f.trim()).filter(Boolean);
    const payload = { ...form, features };

    if (modal === "add") {
      await supabase.from("services").insert(payload);
    } else if (modal === "edit" && editing) {
      await supabase.from("services").update(payload).eq("id", editing.id);
    }

    setSaving(false);
    closeModal();
    showToast(modal === "add" ? "Hizmet eklendi" : "Hizmet güncellendi");
    fetchServices();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const supabase = createClient();
    await supabase.from("services").delete().eq("id", deleteId);
    setDeleteId(null);
    showToast("Hizmet silindi");
    fetchServices();
  };

  const setF = (key: keyof Omit<Service, "id">, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div style={{ maxWidth: 1100 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#141414", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", padding: "10px 18px", borderRadius: 10, fontSize: 13, zIndex: 999 }}>
          {toast}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: 0, marginBottom: 4 }}>Hizmetler</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>Gym hizmetlerini yönetin</p>
        </div>
        <button
          onClick={openAdd}
          style={{ background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", color: "#fff", padding: "9px 18px", borderRadius: 9, cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
        >
          <Plus size={15} /> Hizmet Ekle
        </button>
      </div>

      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Hizmet Adı", "Kısa Açıklama", "Sıra", "Durum", "İşlem"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 28, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Yükleniyor...</td></tr>
            ) : services.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 28, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Henüz hizmet eklenmemiş</td></tr>
            ) : (
              services.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: "#fff" }}>{s.name}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12.5, color: "rgba(255,255,255,0.5)", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.short_description || <span style={{ color: "rgba(255,255,255,0.2)" }}>–</span>}
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{s.order_index}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ background: s.is_active ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)", color: s.is_active ? "#4ade80" : "#f87171", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                      {s.is_active ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(s)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.5)", borderRadius: 6, padding: "5px 7px", cursor: "pointer" }} title="Düzenle"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(s.id)} style={{ background: "rgba(248,113,113,0.1)", border: "none", color: "#f87171", borderRadius: 6, padding: "5px 7px", cursor: "pointer" }} title="Sil"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, maxWidth: 560, width: "100%", marginTop: 24, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: 0 }}>
                {modal === "add" ? "Hizmet Ekle" : "Hizmet Düzenle"}
              </h2>
              <button onClick={closeModal} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={labelStyle}>Hizmet Adı *</label>
                <input type="text" value={form.name} onChange={(e) => setF("name", e.target.value)} style={inputStyle} placeholder="Fitness, Boks..." />
              </div>
              <div>
                <label style={labelStyle}>Kısa Açıklama</label>
                <textarea value={form.short_description ?? ""} onChange={(e) => setF("short_description", e.target.value)} style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} placeholder="Kısa açıklama..." />
              </div>
              <div>
                <label style={labelStyle}>Uzun Açıklama</label>
                <textarea value={form.long_description ?? ""} onChange={(e) => setF("long_description", e.target.value)} style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} placeholder="Detaylı açıklama..." />
              </div>
              <div>
                <label style={labelStyle}>Özellikler (her satıra bir özellik)</label>
                <textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} style={{ ...inputStyle, minHeight: 80, resize: "vertical", fontFamily: "monospace", fontSize: 12.5 }} placeholder="Kişisel antrenör&#10;Diyet planı&#10;24 saat erişim" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>CTA Buton Metni</label>
                  <input type="text" value={form.cta_text ?? ""} onChange={(e) => setF("cta_text", e.target.value)} style={inputStyle} placeholder="Daha Fazla Bilgi" />
                </div>
                <div>
                  <label style={labelStyle}>CTA Link</label>
                  <input type="text" value={form.cta_link ?? ""} onChange={(e) => setF("cta_link", e.target.value)} style={inputStyle} placeholder="/hizmetler/fitness" />
                </div>
                <div>
                  <label style={labelStyle}>Görsel URL</label>
                  <input type="url" value={form.image_url ?? ""} onChange={(e) => setF("image_url", e.target.value)} style={inputStyle} placeholder="https://..." />
                </div>
                <div>
                  <label style={labelStyle}>Sıra</label>
                  <input type="number" value={form.order_index} onChange={(e) => setF("order_index", parseInt(e.target.value) || 0)} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <div
                    onClick={() => setF("is_active", !form.is_active)}
                    style={{ width: 40, height: 22, borderRadius: 11, background: form.is_active ? "#7A0D2A" : "rgba(255,255,255,0.1)", position: "relative", cursor: "pointer", transition: "background 0.15s", border: form.is_active ? "1px solid rgba(212,175,55,0.3)" : "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <div style={{ position: "absolute", top: 2, left: form.is_active ? 19 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.15s" }} />
                  </div>
                  <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)" }}>Aktif</span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
              <button onClick={closeModal} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", padding: "8px 16px", borderRadius: 9, cursor: "pointer", fontSize: 13 }}>İptal</button>
              <button onClick={handleSave} disabled={saving} style={{ background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", color: "#fff", padding: "8px 16px", borderRadius: 9, cursor: saving ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 13 }}>
                {saving ? "Kaydediliyor..." : modal === "add" ? "Ekle" : "Güncelle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, maxWidth: 360, width: "100%", padding: 28, textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={20} color="#f87171" />
            </div>
            <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>Hizmeti Sil</h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 24px" }}>Bu hizmeti silmek istediğinize emin misiniz?</p>
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
