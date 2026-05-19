"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const INP: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "#111",
  border: "1px solid #2A2A2A",
  borderRadius: 10,
  color: "#fff",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const LBL: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "rgba(255,255,255,0.45)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

function SatinAlContent() {
  const params = useSearchParams();
  const planAdi  = params.get("plan") ?? "Fitness Üyeliği";
  const fiyat    = parseInt(params.get("fiyat") ?? "2000");
  const kategori = params.get("kategori") ?? "fitness";

  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [iframeToken, setIframeToken] = useState("");

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
    if (!form.email.includes("@")) { setError("Geçerli bir e-posta girin."); return; }
    if (form.phone.replace(/\D/g, "").length < 10) { setError("Geçerli bir telefon numarası girin."); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/uyelik/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_adi:  planAdi,
          kategori,
          amount:    fiyat,
          full_name: form.full_name,
          email:     form.email,
          phone:     form.phone,
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
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    }
    setLoading(false);
  };

  const kategoriRenk = {
    fitness: "#6A0D25",
    pt:      "#1A4A6A",
    boks:    "#1A3A1A",
  }[kategori] ?? "#6A0D25";

  return (
    <main style={{ minHeight: "100vh", background: "#0B0B0B", paddingTop: 96, paddingBottom: 80 }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 16px" }}>

        {/* Geri */}
        <Link href="/fiyatlar" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none", marginBottom: 24 }}>
          <ArrowLeft size={14} /> Fiyatlara Dön
        </Link>

        {/* Başlık */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-block", background: kategoriRenk, borderRadius: 12, padding: "8px 20px", marginBottom: 16 }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{planAdi}</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: "0 0 6px" }}>Güvenli Satın Al</h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <ShieldCheck size={14} color="#4ade80" />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>256-bit SSL ile güvenli ödeme — PayTR</span>
          </div>
        </div>

        {iframeToken ? (
          /* PayTR iframe */
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden", padding: 8 }}>
            <div style={{ background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 10, padding: "10px 14px", margin: "0 0 12px", fontSize: 13, color: "rgba(255,255,255,.5)" }}>
              ✅ Bilgileriniz alındı. Ödemenizi tamamlayın.
            </div>
            <iframe
              src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
              style={{ width: "100%", height: 560, border: "none", borderRadius: 12 }}
              allowFullScreen
            />
          </div>
        ) : (
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "28px 24px" }}>

            {/* Plan özeti */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Paket</span>
                <span style={{ color: "#fff", fontWeight: 700 }}>{planAdi}</span>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Toplam</span>
                <span style={{ color: "#D4AF37", fontWeight: 900, fontSize: 22 }}>₺{fiyat.toLocaleString("tr-TR")}</span>
              </div>
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: 0 }}>İletişim Bilgileri</h3>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 10 }}>
                  <AlertCircle size={14} color="#f87171" />
                  <span style={{ color: "#f87171", fontSize: 13 }}>{error}</span>
                </div>
              )}

              <div>
                <label style={LBL}>Ad Soyad</label>
                <input style={INP} placeholder="Adınız Soyadınız" value={form.full_name} onChange={e => set("full_name", e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LBL}>E-posta</label>
                  <input type="email" style={INP} placeholder="ornek@mail.com" value={form.email} onChange={e => set("email", e.target.value)} />
                </div>
                <div>
                  <label style={LBL}>Telefon</label>
                  <input type="tel" style={INP} placeholder="05XX XXX XX XX" value={form.phone} onChange={e => set("phone", e.target.value)} />
                </div>
              </div>

              <div style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                📧 Ödeme onaylandıktan sonra üyeliğiniz aktif edilecek ve <strong style={{ color: "#D4AF37" }}>{form.email || "e-posta adresinize"}</strong> bilgi gönderilecektir.
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ width: "100%", padding: "14px", background: "#6A0D25", border: "1px solid rgba(212,175,55,0.3)", color: "#fff", fontWeight: 800, fontSize: 15, borderRadius: 12, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {loading ? <><Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />İşleniyor...</> : `Ödemeye Geç — ₺${fiyat.toLocaleString("tr-TR")}`}
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

export default function UyelikSatinAlPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.3)" }}><Loader2 size={28} /></div>}>
        <SatinAlContent />
      </Suspense>
      <Footer />
    </>
  );
}
