"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Copy, Check, ExternalLink, RefreshCw, Loader2 } from "lucide-react";

const SUPABASE_PROJECT = "nyobwxhyoxtbtmkmrwyc";
const SQL_EDITOR_URL = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT}/sql/new`;

const ORDERS_SQL = `-- Machine Gym — Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE DEFAULT ('MG-' || to_char(now(), 'YYYYMMDD') || '-' || floor(random()*9000+1000)::text),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  items JSONB DEFAULT '[]',
  total_amount NUMERIC(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  order_status TEXT DEFAULT 'new' CHECK (order_status IN ('new','processing','shipped','delivered','cancelled')),
  shipping_address JSONB DEFAULT '{}',
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "orders_public_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "orders_auth_select" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "orders_auth_update" ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- Storage policies for gallery bucket
CREATE POLICY IF NOT EXISTS "gallery_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY IF NOT EXISTS "gallery_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "gallery_auth_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');

SELECT 'Kurulum tamamlandı!' as result;`;

interface TableStatus {
  name: string;
  label: string;
  status: "ok" | "missing" | "loading";
  count?: number;
}

export default function SetupPage() {
  const [tables, setTables] = useState<TableStatus[]>([
    { name: "profiles", label: "Kullanıcı Profilleri", status: "loading" },
    { name: "blog_posts", label: "Blog Yazıları", status: "loading" },
    { name: "services", label: "Hizmetler", status: "loading" },
    { name: "pricing_plans", label: "Fiyat Paketleri", status: "loading" },
    { name: "products", label: "Ürünler", status: "loading" },
    { name: "orders", label: "Siparişler", status: "loading" },
    { name: "leads", label: "Başvuru & Talepler", status: "loading" },
    { name: "site_settings", label: "Site Ayarları", status: "loading" },
    { name: "exercises", label: "Egzersiz Kütüphanesi", status: "loading" },
    { name: "program_templates", label: "Program Şablonları", status: "loading" },
    { name: "program_template_exercises", label: "Program Egzersizleri", status: "loading" },
  ]);
  const [copiedSql, setCopiedSql] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkTables = async () => {
    setChecking(true);
    const res = await fetch("/api/admin/migrate");
    const json = await res.json();
    
    const updated = await Promise.all(
      tables.map(async (t) => {
        const r = await fetch(`/api/admin/check-table?table=${t.name}`);
        const j = await r.json();
        return { ...t, status: j.exists ? "ok" : "missing", count: j.count } as TableStatus;
      })
    );
    setTables(updated);
    setChecking(false);
    return json;
  };

  useEffect(() => { checkTables(); }, []); // eslint-disable-line

  const copySql = () => {
    navigator.clipboard.writeText(ORDERS_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const missingTables = tables.filter(t => t.status === "missing");
  const okTables = tables.filter(t => t.status === "ok");

  const cardStyle: React.CSSProperties = {
    background: "#141414",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: "20px 22px",
    marginBottom: 16,
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          Sistem Kurulumu
        </h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>
          Veritabanı tablolarını ve storage yapılandırmasını kontrol et
        </p>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Hazır Tablo", value: okTables.length, color: "#4ade80", bg: "rgba(74,222,128,0.07)" },
          { label: "Eksik Tablo", value: missingTables.length, color: missingTables.length > 0 ? "#f87171" : "#4ade80", bg: missingTables.length > 0 ? "rgba(248,113,113,0.07)" : "rgba(74,222,128,0.07)" },
          { label: "Toplam", value: tables.length, color: "rgba(255,255,255,0.6)", bg: "rgba(255,255,255,0.04)" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ color: s.color, fontWeight: 800, fontSize: 28 }}>{s.value}</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table Status */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: 0 }}>Tablo Durumu</h2>
          <button onClick={checkTables} disabled={checking}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, color: "rgba(255,255,255,0.5)", cursor: checking ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600 }}>
            {checking ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={13} />}
            Kontrol Et
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {tables.map(t => (
            <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#0F0F0F", border: `1px solid ${t.status === "ok" ? "rgba(74,222,128,0.12)" : t.status === "missing" ? "rgba(248,113,113,0.12)" : "rgba(255,255,255,0.05)"}`, borderRadius: 10 }}>
              {t.status === "loading" ? (
                <Loader2 size={14} style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0, animation: "spin 1s linear infinite" }} />
              ) : t.status === "ok" ? (
                <CheckCircle size={14} style={{ color: "#4ade80", flexShrink: 0 }} />
              ) : (
                <AlertCircle size={14} style={{ color: "#f87171", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "#fff", fontSize: 12, fontWeight: 600, margin: 0 }}>{t.label}</p>
                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, margin: "1px 0 0" }}>
                  {t.status === "ok" ? `✓ Hazır${t.count !== undefined ? ` · ${t.count} kayıt` : ""}` : t.status === "missing" ? "Tablo eksik" : "Kontrol ediliyor..."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Required */}
      {missingTables.length > 0 && (
        <div style={{ ...cardStyle, border: "1px solid rgba(248,113,113,0.2)" }}>
          <h2 style={{ color: "#f87171", fontWeight: 700, fontSize: 15, margin: "0 0 10px" }}>
            ⚠ Eksik Tablolar Tespit Edildi
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 16 }}>
            Aşağıdaki SQL'i Supabase SQL Editor'da çalıştırarak eksik tabloları oluşturun:
          </p>

          {/* Steps */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px" }}>
              <p style={{ color: "#D4AF37", fontSize: 11, fontWeight: 700, margin: "0 0 5px" }}>ADIM 1</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0 }}>SQL&apos;i kopyala</p>
              <button onClick={copySql}
                style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: copiedSql ? "rgba(74,222,128,0.1)" : "#1A1A1A", border: `1px solid ${copiedSql ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, color: copiedSql ? "#4ade80" : "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                {copiedSql ? <Check size={12} /> : <Copy size={12} />}
                {copiedSql ? "Kopyalandı!" : "SQL Kopyala"}
              </button>
            </div>
            <div style={{ flex: 1, background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px" }}>
              <p style={{ color: "#D4AF37", fontSize: 11, fontWeight: 700, margin: "0 0 5px" }}>ADIM 2</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0 }}>Supabase SQL Editor&apos;ı aç</p>
              <a href={SQL_EDITOR_URL} target="_blank" rel="noopener noreferrer"
                style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                <ExternalLink size={12} /> SQL Editor Aç
              </a>
            </div>
            <div style={{ flex: 1, background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px" }}>
              <p style={{ color: "#D4AF37", fontSize: 11, fontWeight: 700, margin: "0 0 5px" }}>ADIM 3</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0 }}>Yapıştır ve Çalıştır → Geri dön ve kontrol et</p>
            </div>
          </div>

          {/* SQL Preview */}
          <pre style={{ background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "monospace", overflow: "auto", maxHeight: 200, margin: 0, lineHeight: 1.6 }}>
            {ORDERS_SQL}
          </pre>
        </div>
      )}

      {missingTables.length === 0 && tables.every(t => t.status === "ok") && (
        <div style={{ ...cardStyle, border: "1px solid rgba(74,222,128,0.2)", background: "rgba(74,222,128,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CheckCircle size={22} style={{ color: "#4ade80" }} />
            <div>
              <p style={{ color: "#4ade80", fontWeight: 700, fontSize: 15, margin: 0 }}>Sistem Hazır!</p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: "3px 0 0" }}>Tüm tablolar mevcut ve çalışıyor.</p>
            </div>
          </div>
        </div>
      )}

      {/* Storage Status */}
      <div style={cardStyle}>
        <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: "0 0 14px" }}>Storage Durumu</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { name: "gallery", label: "Medya Kütüphanesi", desc: "Görsel yükleme için" },
          ].map(b => (
            <div key={b.name} style={{ flex: 1, minWidth: 200, padding: "12px 16px", background: "#0F0F0F", border: "1px solid rgba(74,222,128,0.12)", borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <CheckCircle size={14} style={{ color: "#4ade80" }} />
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{b.label}</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, margin: 0 }}>{b.desc} · Public bucket</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
