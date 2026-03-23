"use client";
import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, CheckCircle, Home, Info, Phone, AlignLeft, Search, Image } from "lucide-react";
import { useRef } from "react";

const IS: React.CSSProperties = {
  background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9,
  color: "#fff", padding: "9px 12px", fontSize: 13.5, outline: "none", width: "100%", boxSizing: "border-box",
};
const TS: React.CSSProperties = { ...IS, minHeight: 80, resize: "vertical" };

function Field({ label, value, onChange, multiline = false, rows = 3, placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; rows?: number; placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: "0.02em" }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder} style={TS} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={IS} />}
    </div>
  );
}

function Section({ title, children, onSave, saving, saved }: {
  title: string; children: React.ReactNode; onSave: () => void; saving: boolean; saved: boolean;
}) {
  return (
    <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>{title}</h2>
        <button onClick={onSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: saved ? "rgba(74,222,128,0.15)" : "#7A0D2A", border: saved ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(212,175,55,0.3)", borderRadius: 9, color: saved ? "#4ade80" : "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          {saved ? <><CheckCircle style={{ width: 14, height: 14 }} /> Kaydedildi</> : <><Save style={{ width: 14, height: 14 }} /> Kaydet</>}
        </button>
      </div>
      {children}
    </div>
  );
}

const TABS = [
  { id: "hero", label: "Ana Sayfa", icon: Home },
  { id: "about", label: "Hakkımızda", icon: Info },
  { id: "contact", label: "İletişim", icon: Phone },
  { id: "footer", label: "Footer", icon: AlignLeft },
  { id: "media", label: "Görseller", icon: Image },
  { id: "seo", label: "SEO", icon: Search },
];

export default function ContentPage() {
  const [tab, setTab] = useState("hero");
  const [vals, setVals] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string; url: string}[]>([]);
  const [copied, setCopied] = useState<string|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("site_settings").select("key,value").then(({ data }) => {
      if (data) setVals(Object.fromEntries(data.map((r: any) => [r.key, r.value || ""])));
    });
    loadMedia();
  }, []);

  const loadMedia = async () => {
    const { data } = await supabase.storage.from("gallery").list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
    if (data) {
      setUploadedFiles(data.filter(f => f.name !== ".emptyFolderPlaceholder").map(f => ({
        name: f.name,
        url: supabase.storage.from("gallery").getPublicUrl(f.name).data.publicUrl,
      })));
    }
  };

  const uploadFile = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      await supabase.storage.from("gallery").upload(name, file, { upsert: false });
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    loadMedia();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteFile = async (name: string) => {
    if (!confirm(`"${name}" silinsin mi?`)) return;
    await supabase.storage.from("gallery").remove([name]);
    loadMedia();
  };

  const set = (key: string, value: string) => setVals(v => ({ ...v, [key]: value }));
  const g = (key: string) => vals[key] || "";

  const saveSection = async (sectionId: string, keys: string[]) => {
    setSaving(s => ({ ...s, [sectionId]: true }));
    for (const key of keys) {
      await supabase.from("site_settings").upsert({ key, value: g(key) }, { onConflict: "key" });
    }
    setSaving(s => ({ ...s, [sectionId]: false }));
    setSaved(s => ({ ...s, [sectionId]: true }));
    setTimeout(() => setSaved(s => ({ ...s, [sectionId]: false })), 2500);
  };

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 6px" }}>Site İçeriği</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>Web sitesindeki tüm metinleri buradan düzenleyin</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px", background: tab === t.id ? "#7A0D2A" : "transparent", border: tab === t.id ? "1px solid rgba(212,175,55,0.25)" : "1px solid transparent", borderRadius: 9, color: tab === t.id ? "#fff" : "rgba(255,255,255,0.4)", fontSize: 12.5, fontWeight: tab === t.id ? 600 : 400, cursor: "pointer" }}>
            <t.icon style={{ width: 13, height: 13 }} /> {t.label}
          </button>
        ))}
      </div>

      {/* Hero */}
      {tab === "hero" && (
        <Section title="Ana Sayfa — Hero Alanı" onSave={() => saveSection("hero", ["hero_title","hero_subtitle","hero_btn1","hero_btn2"])} saving={saving.hero} saved={saved.hero}>
          <Field label="Ana Başlık" value={g("hero_title")} onChange={v => set("hero_title", v)} placeholder="Makine Gibi Çalış. Sonuç Kaçınılmaz." />
          <Field label="Alt Başlık" value={g("hero_subtitle")} onChange={v => set("hero_subtitle", v)} placeholder="Bolu'nun en disiplinli fitness & boks salonu" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Buton 1 Metni" value={g("hero_btn1")} onChange={v => set("hero_btn1", v)} placeholder="Deneme Antrenmanı Al" />
            <Field label="Buton 2 Metni" value={g("hero_btn2")} onChange={v => set("hero_btn2", v)} placeholder="WhatsApp ile Yaz" />
          </div>
        </Section>
      )}

      {/* About */}
      {tab === "about" && (
        <Section title="Hakkımızda Sayfası" onSave={() => saveSection("about", ["about_description","about_members","about_years","about_trainers","about_area"])} saving={saving.about} saved={saved.about}>
          <Field label="Açıklama Metni" value={g("about_description")} onChange={v => set("about_description", v)} multiline rows={4} placeholder="Machine Gym hakkında açıklama..." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            <Field label="Aktif Üye" value={g("about_members")} onChange={v => set("about_members", v)} placeholder="500+" />
            <Field label="Yıl" value={g("about_years")} onChange={v => set("about_years", v)} placeholder="5+" />
            <Field label="Eğitmen" value={g("about_trainers")} onChange={v => set("about_trainers", v)} placeholder="8" />
            <Field label="Alan (m²)" value={g("about_area")} onChange={v => set("about_area", v)} placeholder="600" />
          </div>
        </Section>
      )}

      {/* Contact */}
      {tab === "contact" && (
        <Section title="İletişim Bilgileri" onSave={() => saveSection("contact", ["contact_address","contact_phone","contact_whatsapp","contact_email","working_weekday","working_saturday","working_sunday","social_instagram","social_facebook","social_youtube"])} saving={saving.contact} saved={saved.contact}>
          <Field label="Adres" value={g("contact_address")} onChange={v => set("contact_address", v)} placeholder="Tabaklar Mahallesi / Uygur Sokak NO:3, Bolu" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Telefon" value={g("contact_phone")} onChange={v => set("contact_phone", v)} placeholder="03742701455" />
            <Field label="WhatsApp (başında 9)" value={g("contact_whatsapp")} onChange={v => set("contact_whatsapp", v)} placeholder="903742701455" />
          </div>
          <Field label="E-posta" value={g("contact_email")} onChange={v => set("contact_email", v)} placeholder="info@machinegym.com" />
          <div style={{ marginBottom: 8 }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", margin: "8px 0" }}>ÇALIŞMA SAATLERİ</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Field label="Hafta İçi" value={g("working_weekday")} onChange={v => set("working_weekday", v)} placeholder="08:00 - 01:00" />
            <Field label="Cumartesi" value={g("working_saturday")} onChange={v => set("working_saturday", v)} placeholder="10:00 - 01:00" />
            <Field label="Pazar" value={g("working_sunday")} onChange={v => set("working_sunday", v)} placeholder="12:00 - 20:00" />
          </div>
          <div style={{ marginBottom: 8, marginTop: 4 }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", margin: "8px 0" }}>SOSYAL MEDYA</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Instagram URL" value={g("social_instagram")} onChange={v => set("social_instagram", v)} placeholder="https://instagram.com/gymachinebolu" />
            <Field label="Facebook URL" value={g("social_facebook")} onChange={v => set("social_facebook", v)} placeholder="https://facebook.com/MACHINEGYM" />
          </div>
          <Field label="YouTube URL" value={g("social_youtube")} onChange={v => set("social_youtube", v)} placeholder="https://youtube.com/@machinegym" />
        </Section>
      )}

      {/* Footer */}
      {tab === "footer" && (
        <Section title="Footer" onSave={() => saveSection("footer", ["footer_text","footer_copyright","site_name","site_url","logo_url"])} saving={saving.footer} saved={saved.footer}>
          <Field label="Site Adı" value={g("site_name")} onChange={v => set("site_name", v)} placeholder="Machine Gym" />
          <Field label="Site URL" value={g("site_url")} onChange={v => set("site_url", v)} placeholder="https://machinegym.com.tr" />
          <Field label="Footer Açıklama Metni" value={g("footer_text")} onChange={v => set("footer_text", v)} multiline rows={3} placeholder="Bolu'nun premium fitness & boks merkezi..." />
          <Field label="Telif Hakkı Metni" value={g("footer_copyright")} onChange={v => set("footer_copyright", v)} placeholder="© 2024 Machine Gym. Tüm hakları saklıdır." />
          <Field label="Logo URL" value={g("logo_url")} onChange={v => set("logo_url", v)} placeholder="https://... (boş bırakılırsa metin logo kullanılır)" />
        </Section>
      )}

      {/* Media */}
      {tab === "media" && (
        <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>Görseller & Logo</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={e => uploadFile(e.target.files)} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {uploading ? "Yükleniyor..." : "Görsel Yükle"}
              </button>
            </div>
          </div>
          <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); uploadFile(e.dataTransfer.files); }} onClick={() => fileRef.current?.click()} style={{ border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 12, padding: "24px", textAlign: "center", marginBottom: 20, cursor: "pointer" }}>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, margin: 0 }}>Görselleri sürükleyin veya tıklayın · Logo, hero, hizmet görselleri için</p>
          </div>
          {uploadedFiles.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.2)", textAlign: "center", padding: "24px 0", fontSize: 13 }}>Henüz görsel yüklenmedi</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
              {uploadedFiles.map(f => (
                <div key={f.name} style={{ background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt={f.name} style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} />
                  <div style={{ padding: "8px 10px", display: "flex", gap: 4 }}>
                    <button onClick={() => copyUrl(f.url)} style={{ flex: 1, padding: "5px 0", background: copied === f.url ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, cursor: "pointer", color: copied === f.url ? "#4ade80" : "rgba(255,255,255,0.4)", fontSize: 11 }}>
                      {copied === f.url ? "✓ Kopyalandı" : "URL Kopyala"}
                    </button>
                    <button onClick={() => deleteFile(f.name)} style={{ width: 28, height: 28, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 6, cursor: "pointer", color: "#f87171", fontSize: 14 }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 16, lineHeight: 1.6 }}>
            URL kopyaladıktan sonra <strong style={{ color: "rgba(255,255,255,0.4)" }}>Ana Sayfa → Logo URL</strong> veya hizmet görsel alanlarına yapıştırın.
          </p>
        </div>
      )}

      {/* SEO */}
      {tab === "seo" && (
        <Section title="SEO — Varsayılan Ayarlar" onSave={() => saveSection("seo", ["default_meta_title","default_meta_description","seo_og_image","google_analytics_id","google_search_console"])} saving={saving.seo} saved={saved.seo}>
          <Field label="Varsayılan Meta Title" value={g("default_meta_title")} onChange={v => set("default_meta_title", v)} placeholder="Machine Gym | Bolu'nun Premium Fitness & Boks Salonu" />
          <Field label="Varsayılan Meta Description" value={g("default_meta_description")} onChange={v => set("default_meta_description", v)} multiline rows={3} placeholder="Bolu'nun en disiplinli fitness & boks salonu..." />
          <Field label="Open Graph Görsel URL (1200×630)" value={g("seo_og_image")} onChange={v => set("seo_og_image", v)} placeholder="https://..." />
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0 16px" }} />
          <Field label="Google Analytics ID" value={g("google_analytics_id")} onChange={v => set("google_analytics_id", v)} placeholder="G-XXXXXXXXXX" />
          <Field label="Google Search Console Doğrulama Kodu" value={g("google_search_console")} onChange={v => set("google_search_console", v)} placeholder="google-site-verification=..." />
        </Section>
      )}
    </div>
  );
}
