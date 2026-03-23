"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X, Star } from "lucide-react";

interface PricingPlan {
  id: string;
  name: string;
  category: string;
  price: number;
  discounted_price: number | null;
  description: string | null;
  features: string[] | null;
  is_popular: boolean;
  is_active: boolean;
  order_index: number;
}

const emptyPlan: Omit<PricingPlan, "id"> = {
  name: "",
  category: "fitness",
  price: 0,
  discounted_price: null,
  description: "",
  features: [],
  is_popular: false,
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

const categoryLabels: Record<string, string> = {
  fitness: "Fitness",
  pt: "Personal Trainer",
  boks: "Boks",
  kampanya: "Kampanya",
};

export default function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<PricingPlan | null>(null);
  const [form, setForm] = useState<Omit<PricingPlan, "id">>(emptyPlan);
  const [featuresText, setFeaturesText] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPlans = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("pricing_plans").select("*").order("order_index", { ascending: true });
    setPlans(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const filtered = categoryFilter === "all" ? plans : plans.filter((p) => p.category === categoryFilter);

  const openAdd = () => {
    setForm(emptyPlan);
    setFeaturesText("");
    setEditing(null);
    setModal("add");
  };

  const openEdit = (p: PricingPlan) => {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category,
      price: p.price,
      discounted_price: p.discounted_price,
      description: p.description ?? "",
      features: p.features ?? [],
      is_popular: p.is_popular,
      is_active: p.is_active,
      order_index: p.order_index,
    });
    setFeaturesText((p.features ?? []).join("\n"));
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
      await supabase.from("pricing_plans").insert(payload);
    } else if (modal === "edit" && editing) {
      await supabase.from("pricing_plans").update(payload).eq("id", editing.id);
    }

    setSaving(false);
    closeModal();
    showToast(modal === "add" ? "Plan eklendi" : "Plan güncellendi");
    fetchPlans();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const supabase = createClient();
    await supabase.from("pricing_plans").delete().eq("id", deleteId);
    setDeleteId(null);
    showToast("Plan silindi");
    fetchPlans();
  };

  const setF = (key: keyof Omit<PricingPlan, "id">, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <div
      onClick={() => onChange(!value)}
      style={{ width: 40, height: 22, borderRadius: 11, background: value ? "#7A0D2A" : "rgba(255,255,255,0.1)", position: "relative", cursor: "pointer", transition: "background 0.15s", border: value ? "1px solid rgba(212,175,55,0.3)" : "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}
    >
      <div style={{ position: "absolute", top: 2, left: value ? 19 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.15s" }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 1100 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#141414", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", padding: "10px 18px", borderRadius: 10, fontSize: 13, zIndex: 999 }}>
          {toast}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: 0, marginBottom: 4 }}>Fiyat Planları</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>Üyelik ve hizmet fiyatlarını yönetin</p>
        </div>
        <button
          onClick={openAdd}
          style={{ background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", color: "#fff", padding: "9px 18px", borderRadius: 9, cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
        >
          <Plus size={15} /> Plan Ekle
        </button>
      </div>

      {/* Category Filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "fitness", "pt", "boks", "kampanya"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.07)",
              background: categoryFilter === cat ? "#7A0D2A" : "rgba(255,255,255,0.04)",
              color: categoryFilter === cat ? "#fff" : "rgba(255,255,255,0.45)",
              cursor: "pointer",
              fontSize: 12.5,
              fontWeight: categoryFilter === cat ? 600 : 400,
            }}
          >
            {cat === "all" ? "Tümü" : categoryLabels[cat]}
          </button>
        ))}
      </div>

      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Plan Adı", "Kategori", "Fiyat", "İndirimli", "Popüler", "Durum", "İşlem"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 28, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Yükleniyor...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 28, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Plan bulunamadı</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: "#fff" }}>{p.name}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ background: "rgba(122,13,37,0.15)", color: "rgba(212,175,55,0.8)", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                      {categoryLabels[p.category] ?? p.category}
                    </span>
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "#D4AF37", fontWeight: 700 }}>{p.price} ₺</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: p.discounted_price ? "#4ade80" : "rgba(255,255,255,0.2)" }}>
                    {p.discounted_price ? `${p.discounted_price} ₺` : "–"}
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    {p.is_popular && <Star size={14} color="#D4AF37" fill="#D4AF37" />}
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ background: p.is_active ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)", color: p.is_active ? "#4ade80" : "#f87171", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                      {p.is_active ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(p)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.5)", borderRadius: 6, padding: "5px 7px", cursor: "pointer" }}><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(p.id)} style={{ background: "rgba(248,113,113,0.1)", border: "none", color: "#f87171", borderRadius: 6, padding: "5px 7px", cursor: "pointer" }}><Trash2 size={13} /></button>
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
                {modal === "add" ? "Plan Ekle" : "Plan Düzenle"}
              </h2>
              <button onClick={closeModal} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Plan Adı *</label>
                  <input type="text" value={form.name} onChange={(e) => setF("name", e.target.value)} style={inputStyle} placeholder="Aylık Fitness" />
                </div>
                <div>
                  <label style={labelStyle}>Kategori</label>
                  <select value={form.category} onChange={(e) => setF("category", e.target.value)} style={inputStyle}>
                    <option value="fitness">Fitness</option>
                    <option value="pt">Personal Trainer</option>
                    <option value="boks">Boks</option>
                    <option value="kampanya">Kampanya</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Fiyat (₺)</label>
                  <input type="number" value={form.price} onChange={(e) => setF("price", parseFloat(e.target.value) || 0)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>İndirimli Fiyat (₺)</label>
                  <input type="number" value={form.discounted_price ?? ""} onChange={(e) => setF("discounted_price", e.target.value ? parseFloat(e.target.value) : null)} style={inputStyle} placeholder="Boş bırakın = indirim yok" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Açıklama</label>
                <textarea value={form.description ?? ""} onChange={(e) => setF("description", e.target.value)} style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} placeholder="Plan açıklaması..." />
              </div>
              <div>
                <label style={labelStyle}>Özellikler (her satıra bir özellik)</label>
                <textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} style={{ ...inputStyle, minHeight: 80, resize: "vertical", fontFamily: "monospace", fontSize: 12.5 }} placeholder="Sınırsız ders&#10;Havuz erişimi&#10;Kişisel dolap" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "center" }}>
                <div>
                  <label style={labelStyle}>Sıra</label>
                  <input type="number" value={form.order_index} onChange={(e) => setF("order_index", parseInt(e.target.value) || 0)} style={{ ...inputStyle, width: 80 }} />
                </div>
                <div style={{ display: "flex", gap: 20, alignItems: "center", paddingTop: 20 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <Toggle value={form.is_popular} onChange={(v) => setF("is_popular", v)} />
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Popüler</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <Toggle value={form.is_active} onChange={(v) => setF("is_active", v)} />
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Aktif</span>
                  </label>
                </div>
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
            <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>Planı Sil</h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 24px" }}>Bu fiyat planını silmek istediğinize emin misiniz?</p>
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
