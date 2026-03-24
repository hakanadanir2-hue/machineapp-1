"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Clock, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cartContext";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discounted_price: number | null;
  category: string | null;
  stock: number | null;
  is_featured: boolean | null;
  image_url: string | null;
}

export default function MagazaClient({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [cat, setCat]       = useState("Tümü");
  const { add }             = useCart();

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category ?? "Diğer"));
    return ["Tümü", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const matchCat  = cat === "Tümü" || (p.category ?? "Diğer") === cat;
      const matchSrch = !q || p.name.toLowerCase().includes(q);
      return matchCat && matchSrch;
    });
  }, [products, search, cat]);

  return (
    <main style={{ minHeight: "100vh", background: "#0B0B0B", paddingTop: 96, paddingBottom: "4rem" }}>
      {/* Header */}
      <div style={{ paddingBottom: "2.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="page-container">
          <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.625rem" }}>Mağaza</p>
          <h1 style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)", marginBottom: "0.75rem" }}>
            Ürünler
          </h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9375rem" }}>
            Supplement, ekipman ve spor aksesuarları
          </p>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: "2rem" }}>
        {/* No products yet — professional coming soon state */}
        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(106,13,37,0.1)", border: "1px solid rgba(106,13,37,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <Clock style={{ width: 36, height: 36, color: "rgba(212,175,55,0.5)" }} />
            </div>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.625rem" }}>Yakında</p>
            <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(1.25rem,3vw,1.75rem)", fontFamily: "var(--font-heading)", marginBottom: "0.875rem" }}>
              Mağazamız Hazırlanıyor
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9375rem", maxWidth: "28rem", marginInline: "auto", lineHeight: 1.7, marginBottom: "2rem" }}>
              Supplement, spor ekipmanı ve aksesuar ürünlerimiz çok yakında satışa sunulacak. Sipariş ve bilgi için WhatsApp üzerinden ulaşabilirsiniz.
            </p>
            <a
              href="https://wa.me/903742701455?text=Merhaba, mağaza ürünleri hakkında bilgi almak istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 2rem", background: "#6A0D25", color: "#fff", fontWeight: 700, fontSize: "0.9375rem", borderRadius: 12, border: "1px solid rgba(212,175,55,0.3)", textDecoration: "none" }}
            >
              <MessageCircle style={{ width: 18, height: 18 }} />
              WhatsApp ile Sipariş Ver
            </a>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem", alignItems: "center" }}>
              <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
                <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ürün ara…"
                  style={{ width: "100%", padding: "0.625rem 1rem 0.625rem 2.25rem", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 10, color: "#fff", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    style={{ padding: "0.5rem 1rem", borderRadius: 30, fontSize: "0.8125rem", fontWeight: cat === c ? 700 : 500, background: cat === c ? "#6A0D25" : "transparent", color: cat === c ? "#fff" : "rgba(255,255,255,0.45)", border: `1px solid ${cat === c ? "rgba(212,175,55,0.3)" : "#2A2A2A"}`, cursor: "pointer" }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid or no-match state */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "5rem 0" }}>
                <ShoppingBag style={{ width: 48, height: 48, color: "rgba(255,255,255,0.12)", margin: "0 auto 1rem" }} />
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.9375rem" }}>Ürün bulunamadı</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "1.25rem" }}>
                {filtered.map((p) => {
                  const hasDiscount = p.discounted_price != null && p.discounted_price < p.price;
                  const displayPrice = hasDiscount ? p.discounted_price! : p.price;
                  const inStock = p.stock == null || p.stock > 0;
                  return (
                    <div key={p.id} style={{ background: "#141414", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                      <Link href={`/magaza/${p.slug}`} style={{ display: "block", textDecoration: "none" }}>
                        <div style={{ aspectRatio: "4/3", background: "#1A1A1A", position: "relative", overflow: "hidden" }}>
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <ShoppingBag style={{ width: 40, height: 40, color: "rgba(255,255,255,0.1)" }} />
                            </div>
                          )}
                          {p.is_featured && (
                            <span style={{ position: "absolute", top: 10, left: 10, padding: "3px 10px", background: "#D4AF37", color: "#000", fontSize: "0.6875rem", fontWeight: 700, borderRadius: 30 }}>ÖNE ÇIKAN</span>
                          )}
                          {hasDiscount && (
                            <span style={{ position: "absolute", top: 10, right: 10, padding: "3px 10px", background: "#6A0D25", color: "#fff", fontSize: "0.6875rem", fontWeight: 700, borderRadius: 30 }}>
                              -{Math.round((1 - p.discounted_price! / p.price) * 100)}%
                            </span>
                          )}
                        </div>
                        <div style={{ padding: "1rem 1rem 0" }}>
                          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.6875rem", marginBottom: "0.375rem" }}>{p.category ?? "Ürün"}</p>
                          <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.9375rem", lineHeight: 1.4 }}>{p.name}</p>
                        </div>
                      </Link>
                      <div style={{ padding: "0.75rem 1rem 1rem", marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                        <div>
                          <span style={{ color: "#D4AF37", fontWeight: 800, fontSize: "1.125rem", fontFamily: "var(--font-heading)" }}>{displayPrice.toFixed(2)} ₺</span>
                          {hasDiscount && (
                            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", textDecoration: "line-through", marginLeft: "0.375rem" }}>{p.price.toFixed(2)} ₺</span>
                          )}
                        </div>
                        <button
                          disabled={!inStock}
                          onClick={() => add({ id: p.id, name: p.name, price: p.price, discounted_price: p.discounted_price, image_url: p.image_url, variant: undefined })}
                          style={{ padding: "0.5rem 0.875rem", background: inStock ? "#6A0D25" : "#2A2A2A", color: inStock ? "#fff" : "rgba(255,255,255,0.3)", borderRadius: 10, border: "none", fontWeight: 700, fontSize: "0.75rem", cursor: inStock ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}
                        >
                          {inStock ? "Sepete Ekle" : "Stok Yok"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
