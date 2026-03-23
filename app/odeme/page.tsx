"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/cartContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Loader2, ShieldCheck, ArrowLeft, AlertCircle } from "lucide-react";

interface PaymentFormData {
  full_name: string;
  email: string;
  phone: string;
}

export default function OdemePage() {
  const { items, totalPrice, clear } = useCart();
  const router = useRouter();
  const [form, setForm] = useState<PaymentFormData>({ full_name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [iframeToken, setIframeToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (items.length === 0) router.replace("/magaza");
  }, [items, router]);

  const handleStartPayment = async () => {
    if (!form.full_name || !form.email || !form.phone) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "magaza",
          amount: Math.round(totalPrice),
          email: form.email,
          full_name: form.full_name,
          phone: form.phone,
          items: items.map((i) => ({ name: i.name, price: i.discounted_price ?? i.price, count: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.iframeToken) {
        setError(data.error || "Ödeme başlatılamadı. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }
      setIframeToken(data.iframeToken);
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
    setLoading(false);
  };

  if (items.length === 0) {
    return null;
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.875rem 1rem",
    background: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "0.9375rem",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0B0B0B", paddingTop: "96px", paddingBottom: "5rem" }}>
        <div className="page-container" style={{ maxWidth: 900 }}>
          <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/sepet" style={{ color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 6, fontSize: 14, textDecoration: "none" }}>
              <ArrowLeft size={14} /> Sepete Dön
            </Link>
          </div>

          <h1 style={{ fontSize: "clamp(1.5rem,4vw,2rem)", fontWeight: 900, color: "#fff", fontFamily: "var(--font-heading)", marginBottom: 8 }}>
            Ödeme
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
            <ShieldCheck size={14} color="#4ade80" />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>256-bit SSL ile güvenli ödeme</span>
          </div>

          {iframeToken ? (
            <div style={{ background: "#141414", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", padding: 8 }}>
              <iframe
                src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
                id="paytriframe"
                style={{ width: "100%", height: 600, border: "none", borderRadius: 12 }}
                allowFullScreen
              />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }} className="odeme-grid">
              <style>{`@media(min-width:768px){ .odeme-grid{ grid-template-columns: 1fr 340px !important; } }`}</style>

              {/* Billing info form */}
              <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Fatura Bilgileri</h2>
                {error && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 10 }}>
                    <AlertCircle size={14} color="#f87171" />
                    <span style={{ color: "#f87171", fontSize: 13 }}>{error}</span>
                  </div>
                )}
                <div>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 6 }}>Ad Soyad</label>
                  <input
                    style={inputStyle}
                    placeholder="Adınız ve soyadınız"
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 6 }}>E-posta</label>
                  <input
                    style={inputStyle}
                    type="email"
                    placeholder="ornek@mail.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 6 }}>Telefon</label>
                  <input
                    style={inputStyle}
                    type="tel"
                    placeholder="05xx xxx xx xx"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>

              {/* Order summary */}
              <div>
                <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 20, position: "sticky", top: 90 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 14 }}>Sipariş Özeti</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                    {items.map((item) => (
                      <div key={`${item.id}_${item.variant}`} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>{item.name} ×{item.quantity}</span>
                        <span style={{ color: "#fff", fontWeight: 600 }}>
                          {((item.discounted_price ?? item.price) * item.quantity).toFixed(2)} ₺
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 12, marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Toplam</span>
                      <span style={{ color: "#D4AF37", fontWeight: 900, fontSize: 20 }}>{totalPrice.toFixed(2)} ₺</span>
                    </div>
                  </div>
                  <button
                    onClick={handleStartPayment}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "13px",
                      background: "#6A0D25",
                      color: "#fff",
                      borderRadius: 12,
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.7 : 1,
                      border: "1px solid rgba(212,175,55,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {loading && <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />}
                    Ödemeye Geç
                  </button>
                  <p style={{ marginTop: 10, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                    PayTR güvenli ödeme altyapısı
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
