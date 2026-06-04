"use client";
import React, { useEffect, useState, useId, useCallback, DragEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Search, Package, Upload, X, Loader2, GripVertical } from "lucide-react";

// ─── Styles ──────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = { background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "#fff", padding: "9px 12px", fontSize: 13.5, outline: "none", width: "100%", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "block", color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600, marginBottom: 6 };

const CATS = ["Tümü", "Boks Eldiveni", "Tişört", "Mont", "Hoodie", "Şort", "Bandaj", "Çanta", "Aksesuar"];

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── Upload Function ─────────────────────────────────────────────────────────
async function uploadToServer(files: File[]): Promise<{ url: string; error?: string }[]> {
  const fd = new FormData();
  files.forEach(f => fd.append("files", f));
  fd.append("folder", "products");
  const res = await fetch("/api/media/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const text = await res.text();
    try { const j = JSON.parse(text); throw new Error(j.error || `HTTP ${res.status}`); } catch (e) { if (e instanceof Error && e.message !== text) throw e; throw new Error(text.slice(0, 100) || `HTTP ${res.status}`); }
  }
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.results ?? [];
}

// ─── FileDropZone ────────────────────────────────────────────────────────────
function FileDropZone({ onFiles, multiple = false, uploading, label, sub, color = "#D4AF37" }: {
  onFiles: (f: File[]) => void; multiple?: boolean; uploading?: boolean; label: string; sub?: string; color?: string;
}) {
  const inputId = useId();
  const [over, setOver] = useState(false);

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setOver(false);
    if (uploading) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(multiple ? files : [files[0]]);
  }, [onFiles, multiple, uploading]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); e.stopPropagation(); setOver(true); }}
      onDragLeave={e => { e.preventDefault(); setOver(false); }}
      onDrop={onDrop}
      style={{ position: "relative" }}
    >
      <input id={inputId} type="file" multiple={multiple} disabled={uploading}
        onChange={e => { const f = Array.from(e.target.files ?? []); if (f.length) onFiles(multiple ? f : [f[0]]); e.target.value = ""; }}
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, top: 0, left: 0, pointerEvents: "none" }}
      />
      <label htmlFor={inputId} style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "28px 16px", borderRadius: 12, cursor: uploading ? "wait" : "pointer",
        border: `2px dashed ${over ? color : "rgba(255,255,255,0.12)"}`,
        background: over ? `${color}08` : "transparent", transition: "all 0.15s",
      }}>
        {uploading ? (
          <Loader2 size={22} style={{ color, animation: "spin 1s linear infinite" }} />
        ) : (
          <>
            <Upload size={22} style={{ color, marginBottom: 8 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color }}>{label}</span>
            {sub && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{sub}</span>}
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", marginTop: 6 }}>Sürükle & bırak veya tıkla{multiple ? " (toplu seçim)" : ""}</span>
          </>
        )}
      </label>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function MagazaPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Tümü");
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"genel"|"medya"|"detay"|"seo">("genel");
  const [coverUp, setCoverUp] = useState(false);
  const [galUp, setGalUp] = useState(false);
  const [vidUp, setVidUp] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("order_index").order("created_at", { ascending: false });
    setProducts((data || []).map((p: Record<string, unknown>) => {
      let g: string[] = [];
      if (Array.isArray(p.gallery_urls)) g = p.gallery_urls as string[];
      else if (typeof p.gallery_urls === "string") { try { const x = JSON.parse(p.gallery_urls as string); if (Array.isArray(x)) g = x; } catch {} }
      return { ...p, gallery_urls: g } as Product;
    }));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setF = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => { setEditId(null); setForm({ ...EMPTY }); setTab("genel"); setModal(true); };
  const openEdit = (p: Product) => {
    setEditId(p.id);
    let g: string[] = [];
    if (Array.isArray(p.gallery_urls)) g = p.gallery_urls;
    else if (typeof p.gallery_urls === "string") { try { const x = JSON.parse(p.gallery_urls as string); if (Array.isArray(x)) g = x; } catch {} }
    const { id, created_at, ...rest } = p;
    setForm({ ...rest, gallery_urls: g });
    setTab("genel"); setModal(true);
  };

  const save = async () => {
    if (!form.name.trim()) return alert("Ürün adı gerekli");
    setSaving(true);
    const payload = { ...form, slug: form.slug || slugify(form.name) };
    const { error } = editId
      ? await supabase.from("products").update(payload).eq("id", editId)
      : await supabase.from("products").insert(payload);
    if (error) alert("Kayıt hatası: " + error.message);
    setSaving(false); setModal(false); load();
  };

  const del = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  // Upload handlers
  const uploadCover = async (files: File[]) => {
    setCoverUp(true);
    try {
      const res = await uploadToServer([files[0]]);
      if (res[0]?.url) setF("cover_image_url", res[0].url);
      else throw new Error(res[0]?.error || "Başarısız");
    } catch (e) { alert("Kapak yükleme hatası: " + (e instanceof Error ? e.message : e)); }
    setCoverUp(false);
  };

  const uploadGallery = async (files: File[]) => {
    setGalUp(true);
    try {
      const res = await uploadToServer(files);
      const urls = res.filter(r => r.url && !r.error).map(r => r.url);
      const errs = res.filter(r => r.error).map(r => r.error);
      if (urls.length) setForm(f => ({ ...f, gallery_urls: [...f.gallery_urls, ...urls] }));
      if (errs.length && !urls.length) throw new Error(errs[0] || "Başarısız");
    } catch (e) { alert("Galeri yükleme hatası: " + (e instanceof Error ? e.message : e)); }
    setGalUp(false);
  };

  const uploadVideo = async (files: File[]) => {
    setVidUp(true);
    try {
      const res = await uploadToServer([files[0]]);
      if (res[0]?.url) setF("video_url", res[0].url);
      else throw new Error(res[0]?.error || "Başarısız");
    } catch (e) { alert("Video yükleme hatası: " + (e instanceof Error ? e.message : e)); }
    setVidUp(false);
  };

  const reorderGallery = (from: number, to: number) => {
    setForm(f => { const a = [...f.gallery_urls]; const [i] = a.splice(from, 1); a.splice(to, 0, i); return { ...f, gallery_urls: a }; });
  };

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.name.toLowerCase().includes(q) || (p.sku||"").toLowerCase().includes(q)) && (catFilter === "Tümü" || p.category === catFilter);
  });

  return (
    <div style={{ maxWidth: 1100 }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 24, margin: 0 }}>Mağaza</h1>
        <button onClick={openNew} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}><Plus size={14}/> Yeni Ürün</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, color: "rgba(255,255,255,0.25)" }}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ara..." style={{ width: 180, padding: "7px 12px 7px 28px", ...inputStyle }} />
        </div>
        {CATS.map(c => <button key={c} onClick={() => setCatFilter(c)} style={{ padding: "6px 10px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", background: catFilter===c?"#7A0D2A":"#1A1A1A", border: `1px solid ${catFilter===c?"rgba(212,175,55,0.3)":"rgba(255,255,255,0.08)"}`, color: catFilter===c?"#fff":"rgba(255,255,255,0.4)" }}>{c}</button>)}
      </div>

      {/* Table */}
      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
        {loading ? <p style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.3)" }}>Yükleniyor...</p>
        : filtered.length === 0 ? <p style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.3)" }}>Ürün yok</p>
        : <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Ürün","Kategori","Fiyat","Stok","Durum",""].map(h=><th key={h} style={{ textAlign:"left", color:"rgba(255,255,255,0.3)", fontSize:11, fontWeight:600, padding:"10px 12px" }}>{h}</th>)}
            </tr></thead>
            <tbody>{filtered.map(p=>(
              <tr key={p.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding:"10px 12px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    {p.cover_image_url ? <img src={p.cover_image_url} alt="" style={{ width:36, height:36, borderRadius:7, objectFit:"cover" }}/> : <div style={{ width:36, height:36, background:"#0F0F0F", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center" }}><Package size={14} style={{ color:"rgba(255,255,255,0.15)" }}/></div>}
                    <div><p style={{ color:"#fff", fontWeight:600, fontSize:13, margin:0 }}>{p.name}</p><p style={{ color:"rgba(255,255,255,0.3)", fontSize:11, margin:0 }}>{p.sku||""}</p></div>
                  </div>
                </td>
                <td style={{ padding:"10px 12px", color:"rgba(255,255,255,0.5)", fontSize:12 }}>{p.category}</td>
                <td style={{ padding:"10px 12px", color:"#fff", fontWeight:700, fontSize:13 }}>{p.price}₺</td>
                <td style={{ padding:"10px 12px" }}><span style={{ color:p.stock===0?"#f87171":"#4ade80", fontWeight:700, fontSize:13 }}>{p.stock}</span></td>
                <td style={{ padding:"10px 12px" }}><span style={{ padding:"2px 7px", borderRadius:5, fontSize:10, fontWeight:700, background:p.is_active?"rgba(74,222,128,0.12)":"rgba(255,255,255,0.06)", color:p.is_active?"#4ade80":"rgba(255,255,255,0.3)" }}>{p.is_active?"Aktif":"Pasif"}</span></td>
                <td style={{ padding:"10px 12px" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={()=>openEdit(p)} style={{ padding:"4px 8px", background:"rgba(212,175,55,0.08)", border:"1px solid rgba(212,175,55,0.2)", borderRadius:6, color:"#D4AF37", cursor:"pointer", fontSize:12 }}>Düzenle</button>
                    <button onClick={()=>del(p.id)} style={{ padding:"4px 8px", background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:6, color:"#f87171", cursor:"pointer", fontSize:12 }}>Sil</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>}
      </div>

      {/* ═══ MODAL ═══ */}
      {modal && (
        <div onClick={()=>setModal(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:999, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"24px 16px", overflowY:"auto" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#141414", border:"1px solid rgba(255,255,255,0.1)", borderRadius:18, width:"100%", maxWidth:640, marginTop:20, marginBottom:40 }}>
            {/* Modal Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 24px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
              <h2 style={{ color:"#fff", fontWeight:700, fontSize:16, margin:0 }}>{editId ? "Ürünü Düzenle" : "Yeni Ürün"}</h2>
              <button onClick={()=>setModal(false)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:20, padding:4 }}>×</button>
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
              {(["genel","medya","detay","seo"] as const).map(t=>(
                <button key={t} onClick={()=>setTab(t)} style={{ flex:1, padding:"10px", background:"none", border:"none", borderBottom:`2px solid ${tab===t?"#D4AF37":"transparent"}`, color:tab===t?"#fff":"rgba(255,255,255,0.35)", fontSize:13, fontWeight:tab===t?600:400, cursor:"pointer", textTransform:"capitalize" }}>{t}</button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding:24 }}>

              {tab === "genel" && (
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div><label style={labelStyle}>Ürün Adı *</label><input value={form.name} onChange={e=>{setF("name",e.target.value); if(!editId) setF("slug",slugify(e.target.value));}} style={inputStyle}/></div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div><label style={labelStyle}>SKU</label><input value={form.sku} onChange={e=>setF("sku",e.target.value)} style={inputStyle}/></div>
                    <div><label style={labelStyle}>Kategori</label><select value={form.category} onChange={e=>setF("category",e.target.value)} style={inputStyle}>{CATS.filter(c=>c!=="Tümü").map(c=><option key={c}>{c}</option>)}</select></div>
                  </div>
                  <div><label style={labelStyle}>Kısa Açıklama</label><input value={form.short_description} onChange={e=>setF("short_description",e.target.value)} style={inputStyle}/></div>
                  <div><label style={labelStyle}>Uzun Açıklama</label><textarea value={form.long_description} onChange={e=>setF("long_description",e.target.value)} rows={3} style={{ ...inputStyle, minHeight:80, resize:"vertical" }}/></div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div><label style={labelStyle}>Bedenler</label><input value={form.sizes} onChange={e=>setF("sizes",e.target.value)} style={inputStyle} placeholder="S, M, L, XL"/></div>
                    <div><label style={labelStyle}>Renkler</label><input value={form.colors} onChange={e=>setF("colors",e.target.value)} style={inputStyle} placeholder="Siyah, Kırmızı"/></div>
                  </div>
                  <div><label style={labelStyle}>Etiketler</label><input value={form.tags} onChange={e=>setF("tags",e.target.value)} style={inputStyle} placeholder="boks, spor"/></div>
                  <div style={{ display:"flex", gap:20 }}>
                    {([["is_active","Aktif"],["is_featured","Öne Çıkan"],["is_new","Yeni"]] as const).map(([k,l])=>(
                      <label key={k} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                        <input type="checkbox" checked={!!form[k]} onChange={e=>setF(k,e.target.checked)} style={{ accentColor:"#D4AF37" }}/>
                        <span style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>{l}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {tab === "medya" && (
                <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                  {/* Kapak */}
                  <div>
                    <label style={labelStyle}>Kapak Görseli</label>
                    {form.cover_image_url ? (
                      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                        <img src={form.cover_image_url} alt="" style={{ width:64, height:64, objectFit:"cover", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)" }}/>
                        <input value={form.cover_image_url} onChange={e=>setF("cover_image_url",e.target.value)} style={{ ...inputStyle, flex:1, fontSize:11 }}/>
                        <button onClick={()=>setF("cover_image_url","")} style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer" }}><X size={16}/></button>
                      </div>
                    ) : (
                      <>
                        <FileDropZone onFiles={uploadCover} uploading={coverUp} label="Kapak Görseli Yükle" sub="Tüm formatlar desteklenir"/>
                        <input value={form.cover_image_url} onChange={e=>setF("cover_image_url",e.target.value)} style={{ ...inputStyle, marginTop:8 }} placeholder="veya URL yapıştır..."/>
                      </>
                    )}
                  </div>

                  {/* Galeri */}
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <label style={{ ...labelStyle, margin:0 }}>Galeri ({form.gallery_urls.length})</label>
                      {form.gallery_urls.length > 0 && <button onClick={()=>setF("gallery_urls",[])} style={{ fontSize:11, color:"#f87171", background:"none", border:"none", cursor:"pointer" }}>Tümünü Sil</button>}
                    </div>
                    {form.gallery_urls.length > 0 && (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>
                        {form.gallery_urls.map((url,i)=>(
                          <div key={url+i} draggable
                            onDragStart={e=>e.dataTransfer.setData("idx",String(i))}
                            onDragOver={e=>e.preventDefault()}
                            onDrop={e=>{e.preventDefault();const from=Number(e.dataTransfer.getData("idx"));if(from!==i)reorderGallery(from,i);}}
                            style={{ position:"relative", cursor:"grab" }}>
                            <img src={url} alt="" style={{ width:64, height:64, objectFit:"cover", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)" }}/>
                            <button onClick={()=>setForm(f=>({...f,gallery_urls:f.gallery_urls.filter((_,j)=>j!==i)}))} style={{ position:"absolute", top:-5, right:-5, width:16, height:16, borderRadius:"50%", background:"#ef4444", border:"none", color:"#fff", fontSize:9, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                            <span style={{ position:"absolute", bottom:2, right:2, fontSize:9, background:"rgba(0,0,0,0.6)", color:"#fff", borderRadius:3, padding:"0 3px" }}>{i+1}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <FileDropZone onFiles={uploadGallery} multiple uploading={galUp} label="Galeri Görselleri Ekle" sub="Toplu seçim desteklenir" color="#60a5fa"/>
                  </div>

                  {/* Video */}
                  <div>
                    <label style={labelStyle}>Video</label>
                    {form.video_url ? (
                      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                        <video src={form.video_url} style={{ width:80, height:50, objectFit:"cover", borderRadius:6, background:"#000" }}/>
                        <input value={form.video_url} onChange={e=>setF("video_url",e.target.value)} style={{ ...inputStyle, flex:1, fontSize:11 }}/>
                        <button onClick={()=>setF("video_url","")} style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer" }}><X size={16}/></button>
                      </div>
                    ) : (
                      <>
                        <FileDropZone onFiles={uploadVideo} uploading={vidUp} label="Video Yükle" sub="MP4, WebM, MOV" color="#f87171"/>
                        <input value={form.video_url} onChange={e=>setF("video_url",e.target.value)} style={{ ...inputStyle, marginTop:8 }} placeholder="veya video URL..."/>
                      </>
                    )}
                  </div>

                  {/* YouTube */}
                  <div>
                    <label style={labelStyle}>YouTube URL</label>
                    <input value={form.youtube_url} onChange={e=>setF("youtube_url",e.target.value)} style={inputStyle} placeholder="https://youtube.com/watch?v=..."/>
                  </div>
                </div>
              )}

              {tab === "detay" && (
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div><label style={labelStyle}>Fiyat (₺) *</label><input type="number" value={form.price} onChange={e=>setF("price",Number(e.target.value))} style={inputStyle}/></div>
                    <div><label style={labelStyle}>İndirimli (₺)</label><input type="number" value={form.discounted_price??""} onChange={e=>setF("discounted_price",e.target.value?Number(e.target.value):null)} style={inputStyle} placeholder="Boş = yok"/></div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div><label style={labelStyle}>Stok</label><input type="number" value={form.stock} onChange={e=>setF("stock",Number(e.target.value))} style={inputStyle}/></div>
                    <div><label style={labelStyle}>Sıralama</label><input type="number" value={form.order_index} onChange={e=>setF("order_index",Number(e.target.value))} style={inputStyle}/></div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                    <div><label style={labelStyle}>Ağırlık</label><input value={form.weight} onChange={e=>setF("weight",e.target.value)} style={inputStyle}/></div>
                    <div><label style={labelStyle}>Boyutlar</label><input value={form.dimensions} onChange={e=>setF("dimensions",e.target.value)} style={inputStyle}/></div>
                    <div><label style={labelStyle}>Malzeme</label><input value={form.material} onChange={e=>setF("material",e.target.value)} style={inputStyle}/></div>
                  </div>
                </div>
              )}

              {tab === "seo" && (
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div><label style={labelStyle}>SEO Title</label><input value={form.seo_title} onChange={e=>setF("seo_title",e.target.value)} style={inputStyle} placeholder={form.name}/></div>
                  <div><label style={labelStyle}>SEO Description</label><textarea value={form.seo_description} onChange={e=>setF("seo_description",e.target.value)} rows={3} style={{ ...inputStyle, minHeight:70, resize:"vertical" }} placeholder={form.short_description}/></div>
                  <div><label style={labelStyle}>Slug</label><input value={form.slug} onChange={e=>setF("slug",e.target.value)} style={inputStyle}/></div>
                </div>
              )}

              {/* Save */}
              <button onClick={save} disabled={saving} style={{ marginTop:20, width:"100%", padding:"11px", background:saving?"#333":"#7A0D2A", border:"1px solid rgba(212,175,55,0.3)", borderRadius:10, color:"#fff", fontSize:14, fontWeight:700, cursor:saving?"wait":"pointer" }}>
                {saving ? "Kaydediliyor..." : editId ? "Kaydet" : "Ürün Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
