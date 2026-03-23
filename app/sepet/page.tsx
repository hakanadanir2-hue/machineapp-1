"use client";
import { useCart } from "@/lib/cartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, ArrowLeft } from "lucide-react";

export default function SepetPage() {
  const { items, totalItems, totalPrice, remove, updateQty, clear } = useCart();

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0B0B0B", paddingTop: "96px", paddingBottom: "5rem" }}>
        <div className="page-container" style={{ maxWidth: 900 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: "clamp(1.5rem,4vw,2.25rem)", fontWeight: 900, color: "#fff", fontFamily: "var(--font-heading)", marginBottom: 6 }}>Sepetim</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>{totalItems} ürün</p>
          </div>

          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", background: "#141414", borderRadius: 20, border: "1px solid rgba(255,255,255,.06)" }}>
              <ShoppingCart size={48} color="rgba(255,255,255,.1)" style={{ margin: "0 auto 16px" }} />
              <p style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,.3)", marginBottom: 20 }}>Sepetiniz boş</p>
              <Link href="/magaza" style={{ padding: "10px 24px", background: "#6A0D25", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }} className="cart-grid">
              <style>{`@media(min-width:768px){ .cart-grid{ grid-template-columns: 1fr 340px !important; } }`}</style>

              {/* Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {items.map((item) => (
                  <div key={`${item.id}_${item.variant}`} style={{ display: "flex", gap: 14, background: "#141414", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "16px" }}>
                    <div style={{ width: 80, height: 80, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#1a1a1a" }}>
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} width={80} height={80} style={{ width: "100%", height: "100%", objectFit: "cover" }} unoptimized />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ShoppingCart size={24} color="rgba(255,255,255,.1)" />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 3 }}>{item.name}</div>
                      {item.variant && <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginBottom: 6 }}>{item.variant}</div>}
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#D4AF37" }}>
                        {(item.discounted_price ?? item.price).toFixed(2)} ₺
                        {item.discounted_price != null && <span style={{ marginLeft: 8, fontSize: 12, color: "rgba(255,255,255,.25)", textDecoration: "line-through", fontWeight: 400 }}>{item.price.toFixed(2)} ₺</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
                      <button onClick={() => remove(item.id, item.variant)} style={{ background: "rgba(248,113,113,.1)", border: "none", color: "#f87171", padding: "6px", borderRadius: 8, cursor: "pointer", display: "flex" }}>
                        <Trash2 size={14} />
                      </button>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={() => updateQty(item.id, item.variant, item.quantity - 1)} style={{ background: "rgba(255,255,255,.1)", border: "none", color: "#fff", width: 26, height: 26, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={12} /></button>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.variant, item.quantity + 1)} style={{ background: "rgba(255,255,255,.1)", border: "none", color: "#fff", width: 26, height: 26, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={clear} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "rgba(255,255,255,.3)", fontSize: 12, cursor: "pointer", padding: "4px 0" }}>
                  Sepeti Temizle
                </button>
              </div>

              {/* Summary */}
              <div>
                <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 20, position: "sticky", top: 90 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 16 }}>Sipariş Özeti</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                    {items.map((item) => (
                      <div key={`${item.id}_${item.variant}`} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <span style={{ color: "rgba(255,255,255,.5)" }}>{item.name} ×{item.quantity}</span>
                        <span style={{ color: "#fff", fontWeight: 600 }}>{((item.discounted_price ?? item.price) * item.quantity).toFixed(2)} ₺</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: 14, marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "rgba(255,255,255,.6)", fontSize: 14 }}>Toplam</span>
                      <span style={{ color: "#D4AF37", fontWeight: 900, fontSize: 20 }}>{totalPrice.toFixed(2)} ₺</span>
                    </div>
                  </div>
                  <Link href="/odeme" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", background: "#6A0D25", color: "#fff", borderRadius: 12, fontWeight: 800, fontSize: 14, textDecoration: "none", border: "1px solid rgba(212,175,55,.2)" }}>
                    Ödemeye Geç <ArrowRight size={16} />
                  </Link>
                  <Link href="/magaza" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10, color: "rgba(255,255,255,.35)", fontSize: 13, textDecoration: "none" }}>
                    <ArrowLeft size={13} /> Alışverişe Devam
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}
