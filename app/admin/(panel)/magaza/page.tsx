"use client";
import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Search, Package, ShoppingCart, Tag, BarChart2, Upload, X, Youtube, Images } from "lucide-react";

const IS: React.CSSProperties = { background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "#fff", padding: "9px 12px", fontSize: 13.5, outline: "none", width: "100%", boxSizing: "border-box" };
const TS: React.CSSProperties = { ...IS, minHeight: 80, resize: "vertical" };
const LBL: React.CSSProperties = { display: "block", color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600, marginBottom: 6 };

const CATS = ["Tümü", "Boks Eldiveni", "Tişört", "Mont", "Hoodie", "Şort", "Bandaj", "Çanta", "Aksesuar"];

interface Product {
  id: string; name: string; slug: string; sku: string; category: string;
  short_description: string; long_description: string; price: number;
  discounted_price: number | null; stock: number; sizes: string; colors: string;
  cover_image_url: string; video_url: string; youtube_url: string;
  gallery_urls: string[]; weight: string; dimensions: string; material: string; tags: string;
  is_featured: boolean; is_new: boolean; is_active: boolean;
  seo_title: string; seo_description: string; order_index: number; created_at: string;
}

const EMPTY: Omit<Product, "id" | "created_at"> = {
  name: "", slug: "", sku: "", category: "Tişört", short_description: "", long_description: "",
  price: 0, discounted_price: null, stock: 0, sizes: "", colors: "",
  cover_image_url: "", video_url: "", youtube_url: "", gallery_urls: [],
  weight: "", dimensions: "", material: "", tags: "",
  is_featured: false, is_new: false, is_active: true,
  seo_title: "", seo_description: "", order_index: 0,
};

function slugify(t: string) {
  return t.toLowerCase().replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}

type ModalTab = "genel" | "medya" | "detay" | "seo";

export default function MagazaPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Tümü");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Product, "id" | "created_at">>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [mTab, setMTab] = useState<ModalTab>("genel");
  const [imgUploading, setImgUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("order_index").order("created_at", { ascending: false });
    setProducts((data || []).map((p: Record<string,unknown>) => ({ ...p, gallery_urls: Array.isArray(p.gallery_urls) ? p.gallery_urls : [] })) as Product[]);
    setLoading(false);
  };

  const setF = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => { setEditId(null); setForm({ ...EMPTY }); setMTab("genel"); setModal("add"); };
  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({ name: p.name, slug: p.slug, sku: p.sku || "", category: p.category, short_description: p.short_description || "", long_description: p.long_description || "", price: p.price, discounted_price: p.discounted_price, stock: p.stock, sizes: p.sizes || "", colors: p.colors || "", cover_image_url: p.cover_image_url || "", video_url: p.video_url || "", youtube_url: p.youtube_url || "", gallery_urls: Array.isArray(p.gallery_urls) ? p.gallery_urls : [], weight: p.weight || "", dimensions: p.dimensions || "", material: p.material || "", tags: p.tags || "", is_featured: p.is_featured, is_new: p.is_new, is_active: p.is_active, seo_title: p.seo_title || "", seo_description: p.seo_description || "", order_index: p.order_index || 0 });
    setMTab("genel"); setModal("edit");
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = { ...form, slug: form.slug || slugify(form.name), gallery_urls: JSON.stringify(form.gallery_urls) };
    if (editId) await supabase.from("products").update(payload).eq("id", editId);
    else await supabase.from("products").insert(payload);
    setSaving(false); setModal(null); load();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await supabase.from("products").delete().eq("id", deleteId);
    setDeleteId(null); load();
  };

  const uploadCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImgUploading(true);
    const ext = file.name.split(".").pop();
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
    if (error) { alert(`Yükleme hatası: ${error.message}\n\nSupabase Dashboard > Storage > "product-images" bucket oluşturulmuş olmalı (public).`); setImgUploading(false); if (imgRef.current) imgRef.current.value = ""; return; }
    const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
    setF("cover_image_url", publicUrl);
    setImgUploading(false);
    if (imgRef.current) imgRef.current.value = "";
  };

  const uploadGalleryImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files || files.length === 0) return;
    setGalleryUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `products/gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
      if (!error) { const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path); newUrls.push(publicUrl); }
    }
    setF("gallery_urls", [...(form.gallery_urls || []), ...newUrls]);
    setGalleryUploading(false);
    if (galleryRef.current) galleryRef.current.value = "";
  };

  const removeGalleryImg = (idx: number) => setF("gallery_urls", (form.gallery_urls || []).filter((_: string, i: number) => i !== idx));

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.name.toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q)) && (catFilter === "Tümü" || p.category === catFilter);
  });

  const stats = [
    { label: "Toplam", value: products.length, icon: Package, color: "#D4AF37" },
    { label: "Aktif", value: products.filter(p => p.is_active).length, icon: ShoppingCart, color: "#4ade80" },
    { label: "Öne Çıkan", value: products.filter(p => p.is_featured).length, icon: Tag, color: "#f59e0b" },
    { label: "Stoksuz", value: products.filter(p => p.stock === 0).length, icon: BarChart2, color: "#f87171" },
  ];

  const MTABS: { id: ModalTab; label: string }[] = [{ id: "genel", label: "Genel" }, { id: "medya", label: "Medya" }, { id: "detay", label: "Fiyat & Detay" }, { id: "seo", label: "SEO" }];

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 6px" }}>Mağaza</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>Ürün ekle, düzenle ve stok yönet</p>
        </div>
        <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Plus size={14} /> Yeni Ürün
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, background: `${s.color}18`, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><s.icon style={{ width: 16, height: 16, color: s.color }} /></div>
            <div><p style={{ color: "#fff", fontWeight: 800, fontSize: 22, margin: 0 }}>{s.value}</p><p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: 0 }}>{s.label}</p></div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "rgba(255,255,255,0.25)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ürün ara..." style={{ width: 200, padding: "7px 12px 7px 28px", background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }} />
        </div>
        {CATS.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{ padding: "6px 10px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", background: catFilter === c ? "#7A0D2A" : "#1A1A1A", border: `1px solid ${catFilter === c ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.08)"}`, color: catFilter === c ? "#fff" : "rgba(255,255,255,0.4)" }}>{c}</button>
        ))}
      </div>

      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        {loading ? <p style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Yükleniyor...</p>
          : filtered.length === 0 ? <p style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Ürün bulunamadı</p>
          : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.3)" }}>
                    {["Ürün","Kategori","Fiyat","Stok","Medya","Durum","İşlemler"].map(h => (
                      <th key={h} style={{ textAlign: "left", color: "rgba(255,255,255,0.3)", fontWeight: 600, fontSize: 11, padding: "10px 14px", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {p.cover_image_url ? <img src={p.cover_image_url} alt={p.name} style={{ width: 36, height: 36, borderRadius: 7, objectFit: "cover", flexShrink: 0 }} /> : <div style={{ width: 36, height: 36, background: "#0F0F0F", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Package style={{ width: 16, height: 16, color: "rgba(255,255,255,0.15)" }} /></div>}
                          <div><p style={{ color: "#fff", fontWeight: 600, fontSize: 13, margin: 0 }}>{p.name}</p><p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: 0 }}>{p.sku || "—"}</p></div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}><span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{p.category}</span></td>
                      <td style={{ padding: "12px 14px" }}>
                        <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, margin: 0 }}>{p.price.toLocaleString("tr-TR")} ₺</p>
                        {p.discounted_price && <p style={{ color: "#4ade80", fontSize: 11, margin: 0 }}>{p.discounted_price.toLocaleString("tr-TR")} ₺</p>}
                      </td>
                      <td style={{ padding: "12px 14px" }}><span style={{ color: p.stock === 0 ? "#f87171" : p.stock < 5 ? "#facc15" : "#4ade80", fontWeight: 700, fontSize: 13 }}>{p.stock}</span></td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {p.cover_image_url && <span title="Kapak" style={{ padding: "2px 6px", borderRadius: 4, fontSize: 10, background: "rgba(96,165,250,0.1)", color: "#60a5fa" }}>Kapak</span>}
                          {(p.gallery_urls?.length > 0) && <span title="Galeri" style={{ padding: "2px 6px", borderRadius: 4, fontSize: 10, background: "rgba(212,175,55,0.1)", color: "#D4AF37" }}>{p.gallery_urls.length} Galeri</span>}
                          {(p.youtube_url || p.video_url) && <span title="Video" style={{ padding: "2px 6px", borderRadius: 4, fontSize: 10, background: "rgba(248,113,113,0.1)", color: "#f87171" }}>Video</span>}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          <span style={{ padding: "2px 7px", borderRadius: 5, fontSize: 10, fontWeight: 700, background: p.is_active ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.06)", color: p.is_active ? "#4ade80" : "rgba(255,255,255,0.3)" }}>{p.is_active ? "Aktif" : "Pasif"}</span>
                          {p.is_featured && <span style={{ padding: "2px 7px", borderRadius: 5, fontSize: 10, fontWeight: 700, background: "rgba(212,175,55,0.12)", color: "#D4AF37" }}>Öne Çıkan</span>}
                          {p.is_new && <span style={{ padding: "2px 7px", borderRadius: 5, fontSize: 10, fontWeight: 700, background: "rgba(96,165,250,0.12)", color: "#60a5fa" }}>Yeni</span>}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => openEdit(p)} style={{ width: 28, height: 28, background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 7, cursor: "pointer", color: "#D4AF37", fontSize: 13 }}>✏</button>
                          <button onClick={() => setDeleteId(p.id)} style={{ width: 28, height: 28, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 7, cursor: "pointer", color: "#f87171", fontSize: 13 }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, width: "100%", maxWidth: 640, marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: 0 }}>{modal === "add" ? "Yeni Ürün" : "Ürünü Düzenle"}</h2>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 22 }}>×</button>
            </div>
            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {MTABS.map(t => (
                <button key={t.id} onClick={() => setMTab(t.id)} style={{ flex: 1, padding: "10px", background: "none", border: "none", borderBottom: `2px solid ${mTab === t.id ? "#D4AF37" : "transparent"}`, color: mTab === t.id ? "#fff" : "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: mTab === t.id ? 600 : 400, cursor: "pointer" }}>{t.label}</button>
              ))}
            </div>
            <div style={{ padding: 24 }}>
              {mTab === "genel" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div><label style={LBL}>Ürün Adı *</label><input value={form.name} onChange={e => { setF("name", e.target.value); setF("slug", slugify(e.target.value)); }} style={IS} placeholder="Örn: Machine Gym Boks Eldiveni" /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><label style={LBL}>SKU</label><input value={form.sku} onChange={e => setF("sku", e.target.value)} style={IS} placeholder="MG-001" /></div>
                    <div><label style={LBL}>Kategori</label><select value={form.category} onChange={e => setF("category", e.target.value)} style={IS}>{CATS.filter(c => c !== "Tümü").map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  </div>
                  <div><label style={LBL}>Kısa Açıklama</label><input value={form.short_description} onChange={e => setF("short_description", e.target.value)} style={IS} placeholder="Ürün listesinde görünür" /></div>
                  <div><label style={LBL}>Uzun Açıklama</label><textarea value={form.long_description} onChange={e => setF("long_description", e.target.value)} rows={3} style={TS} placeholder="Ürün detay sayfasında görünür" /></div>
                  <div><label style={LBL}>Etiketler (virgülle)</label><input value={form.tags} onChange={e => setF("tags", e.target.value)} style={IS} placeholder="boks, spor, eldiven" /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><label style={LBL}>Bedenler (virgülle)</label><input value={form.sizes} onChange={e => setF("sizes", e.target.value)} style={IS} placeholder="XS, S, M, L, XL" /></div>
                    <div><label style={LBL}>Renkler (virgülle)</label><input value={form.colors} onChange={e => setF("colors", e.target.value)} style={IS} placeholder="Siyah, Kırmızı" /></div>
                  </div>
                  <div style={{ display: "flex", gap: 20 }}>
                    {[{ k: "is_active" as const, l: "Aktif" }, { k: "is_featured" as const, l: "Öne Çıkan" }, { k: "is_new" as const, l: "Yeni Ürün" }].map(({ k, l }) => (
                      <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input type="checkbox" checked={!!form[k]} onChange={e => setF(k, e.target.checked)} style={{ width: 15, height: 15, accentColor: "#D4AF37" }} />
                        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{l}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {mTab === "medya" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {/* Kapak Görseli */}
                  <div>
                    <label style={LBL}>Kapak Görseli</label>
                    <input ref={imgRef} type="file" accept="image/*" onChange={uploadCoverImage} style={{ display: "none" }} />
                    {form.cover_image_url ? (
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <img src={form.cover_image_url} alt="cover" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }} />
                        <div style={{ flex: 1, minWidth: 0 }}><input value={form.cover_image_url} onChange={e => setF("cover_image_url", e.target.value)} style={{ ...IS, fontSize: 11 }} placeholder="https://..." /></div>
                        <button type="button" onClick={() => setF("cover_image_url", "")} style={{ background: "rgba(248,113,113,0.1)", border: "none", borderRadius: 7, color: "#f87171", cursor: "pointer", padding: "6px 8px" }}><X size={14} /></button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <button type="button" onClick={() => imgRef.current?.click()} disabled={imgUploading} style={{ width: "100%", padding: "22px 16px", background: "rgba(212,175,55,0.05)", border: "2px dashed rgba(212,175,55,0.2)", borderRadius: 10, color: "#D4AF37", cursor: "pointer", textAlign: "center" }}>
                          <Upload size={18} style={{ margin: "0 auto 6px", display: "block" }} />
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{imgUploading ? "Yükleniyor..." : "Kapak Görseli Yükle"}</div>
                          <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>JPG, PNG, WebP</div>
                        </button>
                        <input value={form.cover_image_url} onChange={e => setF("cover_image_url", e.target.value)} style={IS} placeholder="veya URL gir..." />
                      </div>
                    )}
                  </div>

                  {/* Galeri */}
                  <div>
                    <label style={LBL}><Images size={12} style={{ display: "inline", marginRight: 4 }} />Galeri Görselleri ({(form.gallery_urls || []).length})</label>
                    <input ref={galleryRef} type="file" accept="image/*" multiple onChange={uploadGalleryImages} style={{ display: "none" }} />
                    {(form.gallery_urls || []).length > 0 && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                        {(form.gallery_urls || []).map((url, idx) => (
                          <div key={idx} style={{ position: "relative" }}>
                            <img src={url} alt={`gallery-${idx}`} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 7, border: "1px solid rgba(255,255,255,0.1)" }} />
                            <button type="button" onClick={() => removeGalleryImg(idx)} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#ef4444", border: "none", color: "#fff", cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button type="button" onClick={() => galleryRef.current?.click()} disabled={galleryUploading} style={{ padding: "8px 16px", background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.15)", borderRadius: 8, color: "#60a5fa", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      <Upload size={12} />{galleryUploading ? "Yükleniyor..." : "Galeri Görseli Ekle"}
                    </button>
                  </div>

                  {/* Video */}
                  <div>
                    <label style={LBL}><Youtube size={12} style={{ display: "inline", marginRight: 4, color: "#f87171" }} />YouTube Video URL</label>
                    <input value={form.youtube_url} onChange={e => setF("youtube_url", e.target.value)} style={IS} placeholder="https://www.youtube.com/watch?v=..." />
                    <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 4 }}>YouTube veya Vimeo linki. Ürün detay sayfasında oynatılır.</p>
                  </div>
                </div>
              )}

              {mTab === "detay" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><label style={LBL}>Fiyat (₺) *</label><input type="number" value={form.price} onChange={e => setF("price", Number(e.target.value))} style={IS} /></div>
                    <div><label style={LBL}>İndirimli Fiyat (₺)</label><input type="number" value={form.discounted_price ?? ""} onChange={e => setF("discounted_price", e.target.value ? Number(e.target.value) : null)} style={IS} placeholder="Boş bırakılırsa indirim yok" /></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><label style={LBL}>Stok</label><input type="number" value={form.stock} onChange={e => setF("stock", Number(e.target.value))} style={IS} /></div>
                    <div><label style={LBL}>Sıralama</label><input type="number" value={form.order_index} onChange={e => setF("order_index", Number(e.target.value))} style={IS} /></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <div><label style={LBL}>Ağırlık</label><input value={form.weight} onChange={e => setF("weight", e.target.value)} style={IS} placeholder="500g" /></div>
                    <div><label style={LBL}>Boyutlar</label><input value={form.dimensions} onChange={e => setF("dimensions", e.target.value)} style={IS} placeholder="30x20x10 cm" /></div>
                    <div><label style={LBL}>Malzeme</label><input value={form.material} onChange={e => setF("material", e.target.value)} style={IS} placeholder="Deri, Naylon..." /></div>
                  </div>
                </div>
              )}

              {mTab === "seo" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div><label style={LBL}>SEO Title</label><input value={form.seo_title} onChange={e => setF("seo_title", e.target.value)} style={IS} placeholder="Ürün başlığı ile aynı olabilir" /></div>
                  <div><label style={LBL}>SEO Description</label><textarea value={form.seo_description} onChange={e => setF("seo_description", e.target.value)} rows={3} style={TS} placeholder="Kısa açıklama ile aynı olabilir" /></div>
                  <div><label style={LBL}>URL Slug</label><input value={form.slug} onChange={e => setF("slug", e.target.value)} style={IS} placeholder="otomatik oluşturulur" /></div>
                </div>
              )}

              <button onClick={save} disabled={saving || !form.name.trim()} style={{ marginTop: 20, width: "100%", padding: "11px", background: saving ? "#333" : "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {saving ? "Kaydediliyor..." : modal === "add" ? "Ürün Ekle" : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 28, maxWidth: 380, width: "90%" }}>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Ürünü Sil</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>Bu ürün kalıcı olarak silinecek.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: "9px", background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "rgba(255,255,255,0.6)", cursor: "pointer", fontWeight: 600 }}>İptal</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: "9px", background: "#ef4444", border: "none", borderRadius: 9, color: "#fff", cursor: "pointer", fontWeight: 600 }}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
