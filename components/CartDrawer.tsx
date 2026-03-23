"use client";
import { useCart } from "@/lib/cartContext";
import { X, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Props { open: boolean; onClose: () => void; }

export default function CartDrawer({ open, onClose }: Props) {
  const { items, totalItems, totalPrice, remove, updateQty } = useCart();

  if (!open) return null;

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 300 }} onClick={onClose} />
      <aside style={{
        position: "fixed", right: 0, top: 0, bottom: 0, width: "min(100vw, 420px)",
        background: "#111", borderLeft: "1px solid rgba(255,255,255,.08)", zIndex: 301,
        display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,.6)",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShoppingCart size={18} color="#D4AF37" />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>Sepet</span>
            {totalItems > 0 && (
              <span style={{ background: "#6A0D25", color: "#fff", fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 20 }}>{totalItems}</span>
            )}
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.07)", border: "none", color: "rgba(255,255,255,.5)", padding: "6px", borderRadius: 8, cursor: "pointer", display: "flex" }}>
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,.25)" }}>
              <ShoppingCart size={40} style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: 14 }}>Sepetiniz boş</p>
              <Link href="/magaza" onClick={onClose} style={{ display: "inline-block", marginTop: 14, padding: "8px 18px", background: "#6A0D25", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                Alışverişe Başla
              </Link>
            </div>
          ) : items.map((item) => (
            <div key={`${item.id}_${item.variant}`} style={{ display: "flex", gap: 12, background: "#1a1a1a", borderRadius: 12, padding: "12px", border: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ width: 64, height: 64, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#222" }}>
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} width={64} height={64} style={{ width: "100%", height: "100%", objectFit: "cover" }} unoptimized />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShoppingCart size={20} color="rgba(255,255,255,.15)" />
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                {item.variant && <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 5 }}>{item.variant}</div>}
                <div style={{ fontSize: 13, fontWeight: 700, color: "#D4AF37" }}>
                  {item.discounted_price != null ? (
                    <><span>{item.discounted_price.toFixed(2)} ₺</span><span style={{ marginLeft: 6, fontSize: 11, color: "rgba(255,255,255,.25)", textDecoration: "line-through" }}>{item.price.toFixed(2)} ₺</span></>
                  ) : (
                    <span>{item.price.toFixed(2)} ₺</span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
                <button onClick={() => remove(item.id, item.variant)} style={{ background: "rgba(248,113,113,.1)", border: "none", color: "#f87171", padding: "4px", borderRadius: 6, cursor: "pointer", display: "flex" }}>
                  <Trash2 size={13} />
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => updateQty(item.id, item.variant, item.quantity - 1)} style={{ background: "rgba(255,255,255,.08)", border: "none", color: "#fff", width: 22, height: 22, borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={11} /></button>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", minWidth: 16, textAlign: "center" }}>{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.variant, item.quantity + 1)} style={{ background: "rgba(255,255,255,.08)", border: "none", color: "#fff", width: 22, height: 22, borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={11} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ color: "rgba(255,255,255,.5)", fontSize: 13 }}>Toplam</span>
              <span style={{ color: "#fff", fontSize: 18, fontWeight: 900 }}>{totalPrice.toFixed(2)} ₺</span>
            </div>
            <Link href="/sepet" onClick={onClose} style={{ display: "block", textAlign: "center", padding: "13px", background: "#6A0D25", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: "none", border: "1px solid rgba(212,175,55,.2)" }}>
              Sepete Git
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
