"use client";
import React, { useState } from "react";
import { Download, FileText, Users, ShoppingBag, MessageSquare, Calendar, Package } from "lucide-react";

const EXPORTS = [
  { key: "users", label: "Kullanıcılar", icon: Users, desc: "Tüm kayıtlı kullanıcılar", color: "#60a5fa" },
  { key: "contact_requests", label: "İletişim Mesajları", icon: MessageSquare, desc: "Gelen iletişim talepleri", color: "#4ade80" },
  { key: "appointments", label: "Randevular", icon: Calendar, desc: "Tüm randevu talepleri", color: "#D4AF37" },
  { key: "products", label: "Ürünler", icon: ShoppingBag, desc: "Mağaza ürün listesi", color: "#f59e0b" },
  { key: "leads", label: "Başvurular", icon: FileText, desc: "Form başvuruları ve talepler", color: "#a78bfa" },
];

export default function ExportPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = async (table: string) => {
    setLoading(table);
    setError(null);
    try {
      const res = await fetch(`/api/export?table=${table}`);
      if (!res.ok) {
        const text = await res.text();
        setError(text || "Veri alınamadı");
        setLoading(null);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${table}-${new Date().toISOString().substring(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("İndirme başarısız");
    }
    setLoading(null);
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Veri Dışa Aktar</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>Tüm verilerinizi CSV formatında indirin</p>
      </div>

      {error && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#f87171", marginBottom: 16 }}>{error}</div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {EXPORTS.map(({ key, label, icon: Icon, desc, color }) => (
          <div key={key} style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 42, height: 42, background: `${color}18`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>{label}</p>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0 }}>{desc}</p>
              </div>
            </div>
            <button
              onClick={() => download(key)}
              disabled={loading === key}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", background: loading === key ? "#1A1A1A" : "#7A0D2A", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading === key ? "default" : "pointer" }}
            >
              <Download size={14} />
              {loading === key ? "İndiriliyor..." : "CSV İndir"}
            </button>
          </div>
        ))}
      </div>

      <div style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 12, padding: "14px 18px", marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>
        <strong style={{ color: "#D4AF37" }}>Not:</strong> İndirilen CSV dosyaları UTF-8 formatındadır. Excel&apos;de açmak için &quot;Veri → Dış Veri Al → CSV&quot; adımlarını kullanın. Şifreler ve hassas auth bilgileri export edilmez.
      </div>
    </div>
  );
}
