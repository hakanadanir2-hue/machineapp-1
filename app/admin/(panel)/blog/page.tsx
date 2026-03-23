"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  cover_image_url: string | null;
  summary: string | null;
  content: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
  created_at: string;
}

const emptyPost: Omit<BlogPost, "id" | "created_at"> = {
  title: "",
  slug: "",
  category: "fitness",
  cover_image_url: "",
  summary: "",
  content: "",
  seo_title: "",
  seo_description: "",
  is_published: false,
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
  beslenme: "Beslenme",
  boks: "Boks",
  saglik: "Sağlık",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<Omit<BlogPost, "id" | "created_at">>(emptyPost);
  const [modalTab, setModalTab] = useState<"content" | "seo">("content");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPosts = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, slug, category, cover_image_url, summary, content, seo_title, seo_description, is_published, created_at")
      .order("created_at", { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filtered = categoryFilter === "all" ? posts : posts.filter((p) => p.category === categoryFilter);

  const openAdd = () => {
    setForm(emptyPost);
    setEditing(null);
    setModalTab("content");
    setModal("add");
  };

  const openEdit = (p: BlogPost) => {
    setEditing(p);
    setForm({
      title: p.title,
      slug: p.slug,
      category: p.category,
      cover_image_url: p.cover_image_url ?? "",
      summary: p.summary ?? "",
      content: p.content ?? "",
      seo_title: p.seo_title ?? "",
      seo_description: p.seo_description ?? "",
      is_published: p.is_published,
    });
    setModalTab("content");
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const payload = { ...form, slug: form.slug || slugify(form.title) };

    if (modal === "add") {
      await supabase.from("blog_posts").insert(payload);
    } else if (modal === "edit" && editing) {
      await supabase.from("blog_posts").update(payload).eq("id", editing.id);
    }

    setSaving(false);
    closeModal();
    showToast(modal === "add" ? "Blog yazısı eklendi" : "Blog yazısı güncellendi");
    fetchPosts();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const supabase = createClient();
    await supabase.from("blog_posts").delete().eq("id", deleteId);
    setDeleteId(null);
    showToast("Blog yazısı silindi");
    fetchPosts();
  };

  const setF = (key: keyof Omit<BlogPost, "id" | "created_at">, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleTitleChange = (title: string) => {
    setF("title", title);
    if (!editing) setF("slug", slugify(title));
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });

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
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: 0, marginBottom: 4 }}>Blog</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>Blog yazılarını yönetin</p>
        </div>
        <button
          onClick={openAdd}
          style={{ background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", color: "#fff", padding: "9px 18px", borderRadius: 9, cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
        >
          <Plus size={15} /> Yazı Ekle
        </button>
      </div>

      {/* Category Filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "fitness", "beslenme", "boks", "saglik"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            style={{
              padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)",
              background: categoryFilter === cat ? "#7A0D2A" : "rgba(255,255,255,0.04)",
              color: categoryFilter === cat ? "#fff" : "rgba(255,255,255,0.45)",
              cursor: "pointer", fontSize: 12.5, fontWeight: categoryFilter === cat ? 600 : 400,
            }}
          >
            {cat === "all" ? "Tümü" : categoryLabels[cat] ?? cat}
          </button>
        ))}
      </div>

      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Başlık", "Kategori", "Durum", "Tarih", "İşlem"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 28, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Yükleniyor...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 28, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Henüz yazı yok</td></tr>
            ) : (
              filtered.map((post) => (
                <tr key={post.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{post.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{post.slug}</div>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ background: "rgba(122,13,37,0.15)", color: "rgba(212,175,55,0.8)", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                      {categoryLabels[post.category] ?? post.category}
                    </span>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    {post.is_published ? (
                      <span style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Yayında</span>
                    ) : (
                      <span style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Taslak</span>
                    )}
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{formatDate(post.created_at)}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(post)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.5)", borderRadius: 6, padding: "5px 7px", cursor: "pointer" }}><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(post.id)} style={{ background: "rgba(248,113,113,0.1)", border: "none", color: "#f87171", borderRadius: 6, padding: "5px 7px", cursor: "pointer" }}><Trash2 size={13} /></button>
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
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, maxWidth: 620, width: "100%", marginTop: 24, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: 0 }}>
                {modal === "add" ? "Yazı Ekle" : "Yazı Düzenle"}
              </h2>
              <button onClick={closeModal} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 4 }}>
              {(["content", "seo"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setModalTab(t)}
                  style={{
                    flex: 1, padding: "7px 12px", borderRadius: 7, border: "none",
                    background: modalTab === t ? "#7A0D2A" : "transparent",
                    color: modalTab === t ? "#fff" : "rgba(255,255,255,0.4)",
                    cursor: "pointer", fontSize: 13, fontWeight: modalTab === t ? 600 : 400,
                  }}
                >
                  {t === "content" ? "İçerik" : "SEO"}
                </button>
              ))}
            </div>

            {modalTab === "content" && (
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Başlık *</label>
                  <input type="text" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} style={inputStyle} placeholder="Blog yazısı başlığı..." />
                </div>
                <div>
                  <label style={labelStyle}>Slug (URL)</label>
                  <input type="text" value={form.slug} onChange={(e) => setF("slug", e.target.value)} style={{ ...inputStyle, fontFamily: "monospace", fontSize: 12.5 }} placeholder="blog-yazi-slug" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Kategori</label>
                    <select value={form.category} onChange={(e) => setF("category", e.target.value)} style={inputStyle}>
                      <option value="fitness">Fitness</option>
                      <option value="beslenme">Beslenme</option>
                      <option value="boks">Boks</option>
                      <option value="saglik">Sağlık</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Kapak Görseli URL</label>
                    <input type="url" value={form.cover_image_url ?? ""} onChange={(e) => setF("cover_image_url", e.target.value)} style={inputStyle} placeholder="https://..." />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Özet</label>
                  <textarea value={form.summary ?? ""} onChange={(e) => setF("summary", e.target.value)} style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} placeholder="Kısa özet..." />
                </div>
                <div>
                  <label style={labelStyle}>İçerik</label>
                  <textarea value={form.content ?? ""} onChange={(e) => setF("content", e.target.value)} style={{ ...inputStyle, minHeight: 160, resize: "vertical" }} placeholder="Yazı içeriği..." />
                </div>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <Toggle value={form.is_published} onChange={(v) => setF("is_published", v)} />
                    <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)" }}>
                      {form.is_published ? "Yayında" : "Taslak"}
                    </span>
                  </label>
                </div>
              </div>
            )}

            {modalTab === "seo" && (
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <label style={labelStyle}>SEO Başlığı</label>
                  <input type="text" value={form.seo_title ?? ""} onChange={(e) => setF("seo_title", e.target.value)} style={inputStyle} placeholder="SEO için sayfa başlığı..." />
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
                    {(form.seo_title ?? "").length}/60 karakter önerilir
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>SEO Açıklaması</label>
                  <textarea value={form.seo_description ?? ""} onChange={(e) => setF("seo_description", e.target.value)} style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} placeholder="Arama motorlarında görünecek açıklama..." />
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
                    {(form.seo_description ?? "").length}/160 karakter önerilir
                  </div>
                </div>
              </div>
            )}

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
            <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>Yazıyı Sil</h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 24px" }}>Bu blog yazısını silmek istediğinize emin misiniz?</p>
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
