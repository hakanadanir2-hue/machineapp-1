"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Link from "next/link";
import { ShoppingBag, Search, SlidersHorizontal, Tag, Flame, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  { label: "Tümü", value: "" },
  { label: "Boks Eldiveni", value: "Boks Eldiveni" },
  { label: "Tişört", value: "Tişört" },
  { label: "Hoodie / Sweatshirt", value: "Hoodie" },
  { label: "Mont", value: "Mont" },
  { label: "Şort", value: "Şort" },
  { label: "Bandaj", value: "Bandaj" },
  { label: "Çanta", value: "Çanta" },
  { label: "Aksesuar", value: "Aksesuar" },
];

const SORT_OPTIONS = [
  { label: "Öne Çıkanlar", value: "featured" },
  { label: "En Yeniler", value: "newest" },
  { label: "Fiyat: Düşük → Yüksek", value: "price_asc" },
  { label: "Fiyat: Yüksek → Düşük", value: "price_desc" },
];

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  short_description: string;
  price: number;
  discounted_price: number | null;
  cover_image_url: string | null;
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
  stock: number;
  created_at: string;
}

function ProductCard({ p }: { p: Product }) {
  const hasDiscount = p.discounted_price && p.discounted_price < p.price;
  const pct = hasDiscount ? Math.round((1 - p.discounted_price! / p.price) * 100) : 0;
  return (
    <Link href={`/magaza/${p.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden", transition: "border-color 0.2s, transform 0.2s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,175,55,0.3)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
      >
        <div style={{ position: "relative", paddingBottom: "72%", background: "#0F0F0F" }}>
          {p.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.cover_image_url} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingBag style={{ width: 32, height: 32, color: "rgba(255,255,255,0.1)" }} />
            </div>
          )}
          <div style={{ position: "absolute", top: 8, left: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            {p.is_new && <span style={{ background: "#6A0D25", color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 5, textTransform: "uppercase" }}>Yeni</span>}
            {hasDiscount && <span style={{ background: "#D4AF37", color: "#000", fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 5 }}>-%{pct}</span>}
          </div>
          {p.is_featured && (
            <div style={{ position: "absolute", top: 8, right: 8 }}>
              <span style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37", fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 5, display: "flex", alignItems: "center", gap: 3 }}>
                <Star style={{ width: 8, height: 8 }} /> Öne Çıkan
              </span>
            </div>
          )}
          {p.stock === 0 && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700 }}>Stok Tükendi</span>
            </div>
          )}
        </div>
        <div style={{ padding: "14px 14px 16px" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{p.category}</p>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 4, lineHeight: 1.35 }}>{p.name}</p>
          {p.short_description && (
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 10, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>{p.short_description}</p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {hasDiscount ? (
              <>
                <span style={{ color: "#D4AF37", fontWeight: 800, fontSize: 16 }}>₺{p.discounted_price!.toLocaleString("tr-TR")}</span>
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, textDecoration: "line-through" }}>₺{p.price.toLocaleString("tr-TR")}</span>
              </>
            ) : (
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>₺{p.price.toLocaleString("tr-TR")}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function MagazaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("");
  const [sort, setSort] = useState("featured");
  const [search, setSearch] = useState("");
  const supabase = useMemo(() => createClient(), []);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("products")
      .select("id,name,slug,category,short_description,price,discounted_price,cover_image_url,is_featured,is_new,is_active,stock,created_at")
      .eq("is_active", true);
    if (cat) q = q.eq("category", cat);
    const { data } = await q;
    setProducts(data ?? []);
    setLoading(false);
  }, [supabase, cat]);

  useEffect(() => { load(); }, [load]);

  const filtered = products
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "featured") return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      return 0;
    });

  const featured = products.filter(p => p.is_featured).slice(0, 4);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0B0B0B" }}>
        <div style={{ paddingTop: "96px", paddingBottom: "3.5rem", background: "linear-gradient(to bottom,#111111,#0B0B0B)", borderBottom: "1px solid rgba(106,13,37,0.15)" }}>
          <div className="page-container" style={{ textAlign: "center" }}>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Machine Gym Store</p>
            <h1 style={{ fontSize: "clamp(2rem,5vw,3.25rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)", marginBottom: "1rem" }}>Mağaza</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", maxWidth: "28rem", marginInline: "auto", lineHeight: 1.7 }}>
              Machine Gym markasına özel ekipman, giyim ve aksesuarlar.
            </p>
          </div>
        </div>

        <div className="page-container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
          {featured.length > 0 && !cat && !search && (
            <div style={{ marginBottom: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem" }}>
                <Flame style={{ width: 18, height: 18, color: "#D4AF37" }} />
                <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "1.0625rem", margin: 0 }}>Öne Çıkan Ürünler</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
                {featured.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
              <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.05)", margin: "2.5rem 0" }} />
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: "1.25rem" }}>
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "rgba(255,255,255,0.25)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ürün ara..." style={{ width: 200, padding: "8px 12px 8px 30px", background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, color: "#fff", fontSize: 13, outline: "none" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <SlidersHorizontal style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }} />
              <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: "8px 10px", background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, color: "rgba(255,255,255,0.7)", fontSize: 12, outline: "none", cursor: "pointer" }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1.75rem" }}>
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => setCat(c.value)} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: cat === c.value ? 700 : 500, cursor: "pointer", background: cat === c.value ? "#6A0D25" : "#141414", border: `1px solid ${cat === c.value ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.08)"}`, color: cat === c.value ? "#fff" : "rgba(255,255,255,0.45)" }}>
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem" }}>
            <Tag style={{ width: 14, height: 14, color: "rgba(255,255,255,0.2)" }} />
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{loading ? "Yükleniyor..." : `${filtered.length} ürün`}</span>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ background: "#141414", borderRadius: 16, paddingBottom: "90%", animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 0" }}>
              <ShoppingBag style={{ width: 40, height: 40, color: "rgba(255,255,255,0.1)", margin: "0 auto 1rem" }} />
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 15 }}>Ürün bulunamadı</p>
              {(cat || search) && (
                <button onClick={() => { setCat(""); setSearch(""); }} style={{ marginTop: "1rem", padding: "8px 20px", background: "#6A0D25", border: "none", borderRadius: 9, color: "#fff", fontSize: 13, cursor: "pointer" }}>Filtreyi Temizle</button>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
              {filtered.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
