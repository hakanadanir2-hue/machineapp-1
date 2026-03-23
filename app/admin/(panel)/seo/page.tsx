"use client";
import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Search, Globe, FileText, Image, CheckCircle, AlertCircle } from "lucide-react";

interface SeoEntry {
  key: string;
  label: string;
  page: string;
}

const SEO_PAGES: SeoEntry[] = [
  { key: "seo_home", label: "Ana Sayfa", page: "/" },
  { key: "seo_hizmetler", label: "Hizmetler", page: "/hizmetler" },
  { key: "seo_fiyatlar", label: "Fiyatlar", page: "/fiyatlar" },
  { key: "seo_magaza", label: "Mağaza", page: "/magaza" },
  { key: "seo_blog", label: "Blog", page: "/blog" },
  { key: "seo_hakkimizda", label: "Hakkımızda", page: "/hakkimizda" },
  { key: "seo_iletisim", label: "İletişim", page: "/iletisim" },
  { key: "seo_bki", label: "BMI Hesaplama", page: "/bki" },
  { key: "seo_programal", label: "Program Al", page: "/program-al" },
];

const inputStyle: React.CSSProperties = {
  background: "#0F0F0F",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#fff",
  padding: "9px 12px",
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11.5,
  fontWeight: 600,
  color: "rgba(255,255,255,0.4)",
  marginBottom: 5,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

type Settings = Record<string, string>;

export default function SeoPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState("seo_home");
  const [search, setSearch] = useState("");
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("key,value");
    const map: Settings = {};
    (data ?? []).forEach((r: { key: string; value: string }) => { map[r.key] = r.value; });
    setSettings(map);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const save = async (keyPrefix: string) => {
    setSaving(keyPrefix);
    const pairs = [
      { key: `${keyPrefix}_title`, value: settings[`${keyPrefix}_title`] ?? "" },
      { key: `${keyPrefix}_desc`, value: settings[`${keyPrefix}_desc`] ?? "" },
      { key: `${keyPrefix}_og_title`, value: settings[`${keyPrefix}_og_title`] ?? "" },
      { key: `${keyPrefix}_og_desc`, value: settings[`${keyPrefix}_og_desc`] ?? "" },
      { key: `${keyPrefix}_og_image`, value: settings[`${keyPrefix}_og_image`] ?? "" },
      { key: `${keyPrefix}_noindex`, value: settings[`${keyPrefix}_noindex`] ?? "false" },
    ];
    const { error } = await supabase.from("site_settings").upsert(pairs.map(p => ({ key: p.key, value: p.value })), { onConflict: "key" });
    setSaving(null);
    setToast({ msg: error ? "Hata: " + error.message : "SEO ayarları kaydedildi", ok: !error });
    setTimeout(() => setToast(null), 3000);
  };

  const set = (k: string, v: string) => setSettings(prev => ({ ...prev, [k]: v }));
  const v = (k: string) => settings[k] ?? "";

  const titleLength = (prefix: string) => v(`${prefix}_title`).length;
  const descLength = (prefix: string) => v(`${prefix}_desc`).length;

  const filteredPages = SEO_PAGES.filter(p =>
    !search || p.label.toLowerCase().includes(search.toLowerCase()) || p.page.toLowerCase().includes(search.toLowerCase())
  );
  const activeEntry = SEO_PAGES.find(p => p.key === activeTab) ?? SEO_PAGES[0];

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 5px" }}>SEO Yönetimi</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>Sayfa başlıkları, meta açıklamalar ve Open Graph ayarları</p>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", background: toast.ok ? "#14532d" : "#7f1d1d", border: `1px solid ${toast.ok ? "#16a34a" : "#dc2626"}`, borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600 }}>
          {toast.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>
        {/* Sidebar nav */}
        <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 12, height: "fit-content" }}>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <Search style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: "rgba(255,255,255,0.2)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Sayfa ara..." style={{ ...inputStyle, padding: "7px 10px 7px 28px", fontSize: 12 }} />
          </div>
          {filteredPages.map(p => {
            const hasTitle = !!v(`${p.key}_title`);
            return (
              <button
                key={p.key}
                onClick={() => setActiveTab(p.key)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "9px 11px", borderRadius: 8, cursor: "pointer", marginBottom: 3, textAlign: "left",
                  background: activeTab === p.key ? "rgba(212,175,55,0.1)" : "transparent",
                  border: `1px solid ${activeTab === p.key ? "rgba(212,175,55,0.25)" : "transparent"}`,
                }}
              >
                <div>
                  <p style={{ color: activeTab === p.key ? "#D4AF37" : "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: activeTab === p.key ? 700 : 500, margin: 0 }}>{p.label}</p>
                  <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, margin: 0 }}>{p.page}</p>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: hasTitle ? "#4ade80" : "rgba(255,255,255,0.1)", flexShrink: 0 }} />
              </button>
            );
          })}
        </div>

        {/* Editor */}
        <div>
          {/* Preview */}
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Google Önizlemesi</p>
            <div style={{ background: "#fff", borderRadius: 10, padding: "14px 18px" }}>
              <p style={{ color: "#1a0dab", fontSize: 18, fontWeight: 500, margin: "0 0 2px", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {v(`${activeTab}_title`) || `Machine Gym — ${activeEntry.label}`}
              </p>
              <p style={{ color: "#006621", fontSize: 13, margin: "0 0 4px" }}>machinegym.biz{activeEntry.page}</p>
              <p style={{ color: "#545454", fontSize: 14, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {v(`${activeTab}_desc`) || "Machine Gym Bolu — Premium fitness ve boks salonu."}
              </p>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              <span style={{ fontSize: 11, color: titleLength(activeTab) < 30 ? "#f87171" : titleLength(activeTab) > 60 ? "#fb923c" : "#4ade80" }}>
                Başlık: {titleLength(activeTab)}/60 karakter
              </span>
              <span style={{ fontSize: 11, color: descLength(activeTab) < 100 ? "#f87171" : descLength(activeTab) > 160 ? "#fb923c" : "#4ade80" }}>
                Açıklama: {descLength(activeTab)}/160 karakter
              </span>
            </div>
          </div>

          {/* Form */}
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <FileText size={16} style={{ color: "#D4AF37" }} />
              <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: 0 }}>{activeEntry.label} — Meta</h2>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Sayfa Başlığı (Title Tag)</label>
              <input
                style={inputStyle}
                value={v(`${activeTab}_title`)}
                onChange={e => set(`${activeTab}_title`, e.target.value)}
                placeholder={`Machine Gym — ${activeEntry.label} | Bolu`}
                maxLength={70}
              />
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, margin: "5px 0 0" }}>Önerilen: 50–60 karakter. Tarayıcı sekmesi ve Google sonuçlarında görünür.</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Meta Açıklama (Description)</label>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                value={v(`${activeTab}_desc`)}
                onChange={e => set(`${activeTab}_desc`, e.target.value)}
                placeholder="Bu sayfanın kısa açıklaması. Google arama sonuçlarında görünür."
                maxLength={180}
              />
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, margin: "5px 0 0" }}>Önerilen: 120–160 karakter.</p>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={v(`${activeTab}_noindex`) === "true"}
                  onChange={e => set(`${activeTab}_noindex`, e.target.checked ? "true" : "false")}
                  style={{ accentColor: "#7A0D2A" }}
                />
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Arama motorlarından gizle (noindex)</span>
              </label>
            </div>
          </div>

          {/* OG */}
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Globe size={16} style={{ color: "#D4AF37" }} />
              <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: 0 }}>Open Graph (Sosyal Medya Paylaşımı)</h2>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>OG Başlık</label>
              <input
                style={inputStyle}
                value={v(`${activeTab}_og_title`)}
                onChange={e => set(`${activeTab}_og_title`, e.target.value)}
                placeholder="Sosyal medyada paylaşıldığında görünecek başlık"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>OG Açıklama</label>
              <textarea
                style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
                value={v(`${activeTab}_og_desc`)}
                onChange={e => set(`${activeTab}_og_desc`, e.target.value)}
                placeholder="Sosyal medyada paylaşıldığında görünecek açıklama"
              />
            </div>

            <div style={{ marginBottom: 4 }}>
              <label style={labelStyle}>OG Görsel URL</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={v(`${activeTab}_og_image`)}
                  onChange={e => set(`${activeTab}_og_image`, e.target.value)}
                  placeholder="https://... (1200x630px önerilir)"
                />
                {v(`${activeTab}_og_image`) && (
                  <button
                    onClick={() => window.open(v(`${activeTab}_og_image`), "_blank")}
                    style={{ padding: "9px 14px", background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center" }}
                  >
                    <Image size={14} />
                  </button>
                )}
              </div>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, margin: "5px 0 0" }}>Tavsiye edilen boyut: 1200 × 630 piksel</p>
            </div>

            {/* OG Preview card */}
            {(v(`${activeTab}_og_title`) || v(`${activeTab}_og_image`)) && (
              <div style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden", marginTop: 14, maxWidth: 480 }}>
                {v(`${activeTab}_og_image`) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v(`${activeTab}_og_image`)} alt="OG" style={{ width: "100%", height: 120, objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
                <div style={{ padding: "10px 14px" }}>
                  <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, margin: "0 0 2px", textTransform: "uppercase" }}>machinegym.biz</p>
                  <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: "0 0 3px" }}>{v(`${activeTab}_og_title`) || v(`${activeTab}_title`) || "Machine Gym"}</p>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: 0 }}>{v(`${activeTab}_og_desc`) || v(`${activeTab}_desc`) || ""}</p>
                </div>
              </div>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={() => save(activeTab)}
            disabled={!!saving}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "12px 28px",
              background: saving ? "#333" : "#7A0D2A",
              border: "1px solid rgba(212,175,55,0.3)", borderRadius: 10,
              color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            <Save size={15} />
            {saving ? "Kaydediliyor..." : `${activeEntry.label} SEO Ayarlarını Kaydet`}
          </button>
        </div>
      </div>

      {/* Info box */}
      <div style={{ background: "#141414", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 14, padding: 20, marginTop: 20 }}>
        <p style={{ color: "#D4AF37", fontWeight: 700, fontSize: 13, margin: "0 0 10px" }}>Nasıl Çalışır?</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10 }}>
          {[
            { icon: <FileText size={14} />, title: "Meta Title & Description", desc: "Buraya yazdıkların Google arama sonuçlarında görünür." },
            { icon: <Globe size={14} />, title: "Open Graph", desc: "WhatsApp, Twitter, Facebook paylaşımlarında görünecek içeriktir." },
            { icon: <Search size={14} />, title: "Yeşil / Sarı / Kırmızı", desc: "Karakter sayacı rengi ideal aralıkta yeşil gösterir." },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 10 }}>
              <div style={{ flexShrink: 0, color: "#D4AF37", marginTop: 2 }}>{item.icon}</div>
              <div>
                <p style={{ color: "#fff", fontWeight: 600, fontSize: 12, margin: "0 0 2px" }}>{item.title}</p>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
