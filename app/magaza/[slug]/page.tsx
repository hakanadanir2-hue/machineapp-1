import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Check, MessageCircle, Tag, Package } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("name,short_description,seo_title,seo_description,cover_image_url")
    .eq("slug", slug)
    .single();
  if (!data) return { title: "Ürün Bulunamadı — Machine Gym" };
  return {
    title: data.seo_title || `${data.name} — Machine Gym Mağaza`,
    description: data.seo_description || data.short_description || "",
    openGraph: { images: data.cover_image_url ? [data.cover_image_url] : [] },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const hasDiscount = product.discounted_price && product.discounted_price < product.price;
  const pct = hasDiscount ? Math.round((1 - product.discounted_price / product.price) * 100) : 0;
  const sizes = product.sizes ? product.sizes.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
  const colors = product.colors ? product.colors.split(",").map((c: string) => c.trim()).filter(Boolean) : [];

  const wa = `https://wa.me/903742701455?text=${encodeURIComponent(`Merhaba, "${product.name}" ürünü hakkında bilgi almak istiyorum.`)}`;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0B0B0B" }}>
        <div style={{ paddingTop: "96px" }}>
          <div className="page-container" style={{ paddingTop: "2rem", paddingBottom: "5rem" }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "2rem" }}>
              <Link href="/magaza" style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none" }}>
                <ArrowLeft style={{ width: 14, height: 14 }} /> Mağaza
              </Link>
              <span style={{ color: "rgba(255,255,255,0.15)" }}>/</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{product.category}</span>
              <span style={{ color: "rgba(255,255,255,0.15)" }}>/</span>
              <span style={{ color: "#fff", fontSize: 13 }}>{product.name}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }} className="product-grid">
              <style>{`@media(max-width:768px){.product-grid{grid-template-columns:1fr !important;}}`}</style>

              {/* Image */}
              <div>
                <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden", position: "relative", paddingBottom: "100%" }}>
                  {product.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.cover_image_url} alt={product.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ShoppingBag style={{ width: 48, height: 48, color: "rgba(255,255,255,0.08)" }} />
                    </div>
                  )}
                  {hasDiscount && (
                    <div style={{ position: "absolute", top: 16, left: 16 }}>
                      <span style={{ background: "#D4AF37", color: "#000", fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 8 }}>-%{pct} İndirim</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "0.875rem" }}>
                  <span style={{ background: "rgba(106,13,37,0.2)", border: "1px solid rgba(106,13,37,0.3)", color: "#D4AF37", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 6, display: "flex", alignItems: "center", gap: 4 }}>
                    <Tag style={{ width: 10, height: 10 }} /> {product.category}
                  </span>
                  {product.is_new && <span style={{ background: "#6A0D25", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 6 }}>Yeni</span>}
                  {product.is_featured && <span style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.25)", color: "#D4AF37", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 6 }}>Öne Çıkan</span>}
                </div>

                <h1 style={{ color: "#fff", fontSize: "clamp(1.5rem,4vw,2rem)", fontWeight: 800, fontFamily: "var(--font-heading)", marginBottom: "0.75rem", lineHeight: 1.2 }}>{product.name}</h1>

                {product.sku && (
                  <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginBottom: "1rem" }}>SKU: {product.sku}</p>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
                  {hasDiscount ? (
                    <>
                      <span style={{ color: "#D4AF37", fontWeight: 800, fontSize: "1.875rem" }}>₺{Number(product.discounted_price).toLocaleString("tr-TR")}</span>
                      <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400, fontSize: "1.25rem", textDecoration: "line-through" }}>₺{Number(product.price).toLocaleString("tr-TR")}</span>
                    </>
                  ) : (
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.875rem" }}>₺{Number(product.price).toLocaleString("tr-TR")}</span>
                  )}
                </div>

                {product.short_description && (
                  <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>{product.short_description}</p>
                )}

                {/* Sizes */}
                {sizes.length > 0 && (
                  <div style={{ marginBottom: "1.25rem" }}>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Beden</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {sizes.map((sz: string) => (
                        <span key={sz} style={{ padding: "6px 14px", background: "#141414", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600 }}>{sz}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {colors.length > 0 && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Renk</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {colors.map((c: string) => (
                        <span key={c} style={{ padding: "6px 14px", background: "#141414", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontSize: 13 }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.75rem", padding: "10px 14px", background: product.stock > 0 ? "rgba(74,222,128,0.06)" : "rgba(248,113,113,0.06)", border: `1px solid ${product.stock > 0 ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)"}`, borderRadius: 10 }}>
                  <Package style={{ width: 15, height: 15, color: product.stock > 0 ? "#4ade80" : "#f87171" }} />
                  {product.stock > 0 ? (
                    <span style={{ color: "#4ade80", fontSize: 13, fontWeight: 600 }}>Stokta var — {product.stock} adet</span>
                  ) : (
                    <span style={{ color: "#f87171", fontSize: 13, fontWeight: 600 }}>Stok tükendi</span>
                  )}
                </div>

                {/* CTA */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <a href={wa} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", background: "#6A0D25", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
                    <MessageCircle style={{ width: 18, height: 18, color: "#4ade80" }} />
                    WhatsApp ile Sipariş Ver
                  </a>
                  <Link href="/iletisim" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "rgba(255,255,255,0.6)", fontSize: 14, textDecoration: "none" }}>
                    Bize Sor
                  </Link>
                </div>

                {/* Features */}
                {product.long_description && (
                  <div style={{ marginTop: "2rem", padding: "1.25rem", background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
                    <p style={{ color: "#D4AF37", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.75rem" }}>Ürün Detayları</p>
                    <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{product.long_description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Guarantees */}
            <div style={{ marginTop: "3rem", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
              {[
                { icon: Check, text: "Orijinal Machine Gym Ürünü" },
                { icon: MessageCircle, text: "WhatsApp Sipariş Desteği" },
                { icon: Package, text: "Hızlı Teslimat" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
                  <div style={{ width: 32, height: 32, background: "rgba(106,13,37,0.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: 15, height: 15, color: "#D4AF37" }} />
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
