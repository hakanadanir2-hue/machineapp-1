"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Eye, EyeOff, Phone, Mail, MapPin, Clock, Share2, CreditCard, Globe, Bell, Wrench } from "lucide-react";

const IS: React.CSSProperties = { background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "#fff", padding: "9px 12px", fontSize: 13.5, outline: "none", width: "100%", boxSizing: "border-box" };
const TS: React.CSSProperties = { ...IS, minHeight: 80, resize: "vertical" };
const LBL: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 6 };
const CARD: React.CSSProperties = { background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24, marginBottom: 16 };

type Settings = Record<string, string>;

type TabId = "genel" | "iletisim" | "sosyal" | "paytr" | "seo" | "bildirim" | "sistem" | "hesap";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "genel", label: "Genel", icon: <Globe size={14} /> },
  { id: "iletisim", label: "İletişim", icon: <Phone size={14} /> },
  { id: "sosyal", label: "Sosyal & Saatler", icon: <Share2 size={14} /> },
  { id: "paytr", label: "PayTR Ödeme", icon: <CreditCard size={14} /> },
  { id: "seo", label: "SEO", icon: <Globe size={14} /> },
  { id: "bildirim", label: "Bildirimler", icon: <Bell size={14} /> },
  { id: "sistem", label: "Sistem", icon: <Wrench size={14} /> },
  { id: "hesap", label: "Admin Hesabı", icon: <Eye size={14} /> },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toastErr, setToastErr] = useState(false);
  const [tab, setTab] = useState<TabId>("genel");
  const [showKey, setShowKey] = useState(false);
  const [showSalt, setShowSalt] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdErr, setPwdErr] = useState<string | null>(null);
  const [pwdSaving, setPwdSaving] = useState(false);

  const sb = createClient();

  const showToast = (m: string, err = false) => { setToast(m); setToastErr(err); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    sb.from("site_settings").select("key,value").then(({ data }) => {
      if (data) { const m: Settings = {}; data.forEach((r: {key:string;value:string}) => { m[r.key] = r.value; }); setSettings(m); }
      setLoading(false);
    });
  }, []);

  const get = (k: string) => settings[k] ?? "";
  const set = (k: string, v: string) => setSettings(s => ({ ...s, [k]: v }));

  const save = async (sectionKey: string, keys: string[]) => {
    setSaving(sectionKey);
    for (const k of keys) await sb.from("site_settings").upsert({ key: k, value: settings[k] ?? "" }, { onConflict: "key" });
    setSaving(null);
    showToast("Kaydedildi ✓");
  };

  const Btn = ({ sk, keys }: { sk: string; keys: string[] }) => (
    <button onClick={() => save(sk, keys)} disabled={saving === sk} style={{ background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", color: "#fff", padding: "9px 20px", borderRadius: 9, cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 7 }}>
      <Save size={14} />{saving === sk ? "Kaydediliyor..." : "Kaydet"}
    </button>
  );

  const Row2 = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>
  );

  const Field = ({ label, k, type = "text", placeholder = "" }: { label: string; k: string; type?: string; placeholder?: string }) => (
    <div><label style={LBL}>{label}</label><input type={type} value={get(k)} onChange={e => set(k, e.target.value)} style={IS} placeholder={placeholder} /></div>
  );

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault(); setPwdErr(null);
    if (newPwd !== confirmPwd) { setPwdErr("Şifreler eşleşmiyor."); return; }
    if (newPwd.length < 6) { setPwdErr("En az 6 karakter olmalı."); return; }
    setPwdSaving(true);
    const { data: { user } } = await sb.auth.getUser();
    if (!user?.email) { setPwdErr("Oturum bulunamadı."); setPwdSaving(false); return; }
    const { error: se } = await sb.auth.signInWithPassword({ email: user.email, password: currentPwd });
    if (se) { setPwdErr("Mevcut şifre yanlış."); setPwdSaving(false); return; }
    const { error } = await sb.auth.updateUser({ password: newPwd });
    setPwdSaving(false);
    if (error) setPwdErr("Hata: " + error.message);
    else { setCurrentPwd(""); setNewPwd(""); setConfirmPwd(""); showToast("Şifre güncellendi ✓"); }
  };

  return (
    <div style={{ maxWidth: 820 }}>
      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: "#141414", border: `1px solid ${toastErr ? "rgba(248,113,113,0.3)" : "rgba(74,222,128,0.3)"}`, color: toastErr ? "#f87171" : "#4ade80", padding: "10px 18px", borderRadius: 10, fontSize: 13, zIndex: 999 }}>{toast}</div>}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Ayarlar</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>Tüm sistem ve site ayarları</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, background: tab === t.id ? "#7A0D2A" : "rgba(255,255,255,0.06)", color: tab === t.id ? "#fff" : "rgba(255,255,255,0.4)" }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {loading ? <div style={{ ...CARD, textAlign: "center", color: "rgba(255,255,255,0.25)", padding: 32 }}>Yükleniyor...</div> : (
        <>
          {/* GENEL */}
          {tab === "genel" && (
            <div style={CARD}>
              <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 18px" }}>Genel Site Ayarları</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Row2>
                  <Field label="Site Adı" k="site_name" placeholder="Machine Gym" />
                  <Field label="Site URL" k="site_url" type="url" placeholder="https://machinegym.com" />
                </Row2>
                <Row2>
                  <Field label="Logo URL" k="logo_url" type="url" placeholder="https://..." />
                  <Field label="Favicon URL" k="favicon_url" type="url" placeholder="https://.../favicon.ico" />
                </Row2>
                <Row2>
                  <Field label="WhatsApp Numarası" k="whatsapp_number" placeholder="905xx xxxxxxx" />
                  <Field label="Şehir" k="city" placeholder="Bolu" />
                </Row2>
                <div>
                  <label style={LBL}>Footer Açıklaması</label>
                  <textarea value={get("footer_description")} onChange={e => set("footer_description", e.target.value)} style={TS} placeholder="Kısa tanıtım metni..." />
                </div>
              </div>
              <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
                <Btn sk="genel" keys={["site_name","site_url","logo_url","favicon_url","whatsapp_number","city","footer_description"]} />
              </div>
            </div>
          )}

          {/* İLETİŞİM */}
          {tab === "iletisim" && (
            <div style={CARD}>
              <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}><Phone size={16} color="#D4AF37" /> İletişim Bilgileri</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Row2>
                  <Field label="Telefon" k="phone" placeholder="+90 374 xxx xx xx" />
                  <Field label="E-posta" k="email" type="email" placeholder="info@machinegym.com" />
                </Row2>
                <div><label style={LBL}>Adres</label><textarea value={get("address")} onChange={e => set("address", e.target.value)} style={{ ...TS, minHeight: 60 }} placeholder="Tam adres..." /></div>
                <Row2>
                  <div>
                    <label style={LBL}><Clock size={12} style={{ display: "inline", marginRight: 4 }} />Hafta İçi Çalışma Saatleri</label>
                    <input value={get("working_hours_weekday")} onChange={e => set("working_hours_weekday", e.target.value)} style={IS} placeholder="Pazartesi–Cuma: 07:00–22:00" />
                  </div>
                  <div>
                    <label style={LBL}><Clock size={12} style={{ display: "inline", marginRight: 4 }} />Hafta Sonu Çalışma Saatleri</label>
                    <input value={get("working_hours_weekend")} onChange={e => set("working_hours_weekend", e.target.value)} style={IS} placeholder="Cmt–Paz: 09:00–20:00" />
                  </div>
                </Row2>
                <div>
                  <label style={LBL}><MapPin size={12} style={{ display: "inline", marginRight: 4 }} />Google Maps Embed URL</label>
                  <input value={get("google_maps_embed")} onChange={e => set("google_maps_embed", e.target.value)} style={IS} placeholder="https://www.google.com/maps/embed?..." />
                  <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 4 }}>Google Maps → Paylaş → Haritayı göm → Iframe src kısmını yapıştır</p>
                </div>
              </div>
              <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
                <Btn sk="iletisim" keys={["phone","email","address","working_hours_weekday","working_hours_weekend","google_maps_embed"]} />
              </div>
            </div>
          )}

          {/* SOSYAL */}
          {tab === "sosyal" && (
            <div style={CARD}>
              <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}><Share2 size={16} color="#D4AF37" /> Sosyal Medya</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Row2>
                  <Field label="Instagram" k="instagram_url" type="url" placeholder="https://instagram.com/..." />
                  <Field label="Facebook" k="facebook_url" type="url" placeholder="https://facebook.com/..." />
                </Row2>
                <Row2>
                  <Field label="YouTube" k="youtube_url" type="url" placeholder="https://youtube.com/@..." />
                  <Field label="TikTok" k="tiktok_url" type="url" placeholder="https://tiktok.com/@..." />
                </Row2>
                <Row2>
                  <Field label="Twitter / X" k="twitter_url" type="url" placeholder="https://x.com/..." />
                  <div />
                </Row2>
              </div>
              <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
                <Btn sk="sosyal" keys={["instagram_url","facebook_url","youtube_url","tiktok_url","twitter_url"]} />
              </div>
            </div>
          )}

          {/* PAYTR */}
          {tab === "paytr" && (
            <div style={CARD}>
              <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}><CreditCard size={16} color="#D4AF37" /> PayTR Ödeme Sistemi</h2>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: 20 }}>paytr.com üyeliğinden alınan API bilgileri</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Field label="Merchant ID" k="paytr_merchant_id" placeholder="123456" />
                <div>
                  <label style={LBL}>Merchant Key</label>
                  <div style={{ position: "relative" }}>
                    <input type={showKey ? "text" : "password"} value={get("paytr_merchant_key")} onChange={e => set("paytr_merchant_key", e.target.value)} style={{ ...IS, paddingRight: 40 }} placeholder="••••••••••••" />
                    <button type="button" onClick={() => setShowKey(s => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>{showKey ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                  </div>
                </div>
                <div>
                  <label style={LBL}>Merchant Salt</label>
                  <div style={{ position: "relative" }}>
                    <input type={showSalt ? "text" : "password"} value={get("paytr_merchant_salt")} onChange={e => set("paytr_merchant_salt", e.target.value)} style={{ ...IS, paddingRight: 40 }} placeholder="••••••••••••" />
                    <button type="button" onClick={() => setShowSalt(s => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>{showSalt ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                  </div>
                </div>
                <Row2>
                  <div>
                    <label style={LBL}>Mod</label>
                    <select value={get("paytr_test_mode")} onChange={e => set("paytr_test_mode", e.target.value)} style={IS}>
                      <option value="true">Test Modu</option>
                      <option value="false">Canlı Mod</option>
                    </select>
                  </div>
                  <div>
                    <label style={LBL}>Debug Modu</label>
                    <select value={get("paytr_debug_mode")} onChange={e => set("paytr_debug_mode", e.target.value)} style={IS}>
                      <option value="false">Kapalı</option>
                      <option value="true">Açık</option>
                    </select>
                  </div>
                </Row2>
                <div style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
                  <strong style={{ color: "#D4AF37" }}>Callback URL:</strong> <code style={{ color: "rgba(255,255,255,0.6)" }}>{get("site_url") || "https://siteniz.com"}/api/paytr/callback</code><br />
                  Bu URL&apos;yi PayTR merchant panelinize &quot;Bildirim URL&quot; olarak ekleyin.
                </div>
              </div>
              <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
                <Btn sk="paytr" keys={["paytr_merchant_id","paytr_merchant_key","paytr_merchant_salt","paytr_test_mode","paytr_debug_mode"]} />
              </div>
            </div>
          )}

          {/* SEO */}
          {tab === "seo" && (
            <div style={CARD}>
              <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 18px" }}>SEO Varsayılanları</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={LBL}>Varsayılan Meta Başlığı</label>
                  <input value={get("default_meta_title")} onChange={e => set("default_meta_title", e.target.value)} style={IS} placeholder="Machine Gym – Bolu'nun Premium Fitness Salonu" />
                  <p style={{ fontSize: 11, color: get("default_meta_title").length > 60 ? "#f87171" : "rgba(255,255,255,0.2)", marginTop: 4 }}>{get("default_meta_title").length}/60</p>
                </div>
                <div>
                  <label style={LBL}>Varsayılan Meta Açıklaması</label>
                  <textarea value={get("default_meta_description")} onChange={e => set("default_meta_description", e.target.value)} style={{ ...TS, minHeight: 80 }} placeholder="Kısa site açıklaması..." />
                  <p style={{ fontSize: 11, color: get("default_meta_description").length > 160 ? "#f87171" : "rgba(255,255,255,0.2)", marginTop: 4 }}>{get("default_meta_description").length}/160</p>
                </div>
                <Row2>
                  <Field label="Google Analytics 4 ID" k="google_analytics_id" placeholder="G-XXXXXXXXXX" />
                  <Field label="Google Ads (AW-) ID" k="google_ads_id" placeholder="AW-XXXXXXXXXX" />
                </Row2>
                <Field label="Google Tag Manager ID" k="gtm_id" placeholder="GTM-XXXXXXX" />
                <div style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
                  <strong style={{ color: "#D4AF37" }}>GA4</strong> → Google Analytics paneli &nbsp;|&nbsp; <strong style={{ color: "#D4AF37" }}>AW-</strong> → Google Ads → Araçlar → Dönüşümler &nbsp;|&nbsp; <strong style={{ color: "#D4AF37" }}>GTM</strong> → tagmanager.google.com
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                  Sayfa bazlı detaylı SEO için: <strong style={{ color: "#D4AF37" }}>İçerik → SEO Yönetimi</strong>
                </div>
              </div>
              <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
                <Btn sk="seo" keys={["default_meta_title","default_meta_description","google_analytics_id","google_ads_id","gtm_id"]} />
              </div>
            </div>
          )}

          {/* BİLDİRİM */}
          {tab === "bildirim" && <NotificationTemplatesTab />}

          {/* SİSTEM */}
          {tab === "sistem" && (
            <div style={CARD}>
              <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}><Wrench size={16} color="#D4AF37" /> Sistem Ayarları</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={LBL}>Bakım Modu</label>
                  <select value={get("maintenance_mode")} onChange={e => set("maintenance_mode", e.target.value)} style={IS}>
                    <option value="false">Kapalı – Site erişilebilir</option>
                    <option value="true">Açık – Sadece admin giriş yapabilir</option>
                  </select>
                </div>
                <div>
                  <label style={LBL}>Duyuru Bandı</label>
                  <select value={get("announcement_bar_enabled")} onChange={e => set("announcement_bar_enabled", e.target.value)} style={IS}>
                    <option value="false">Kapalı</option>
                    <option value="true">Açık – Aktif duyuru göster</option>
                  </select>
                  <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 4 }}>Duyuruları &quot;Duyurular&quot; sayfasından yönetin</p>
                </div>
              </div>
              <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
                <Btn sk="sistem" keys={["maintenance_mode","announcement_bar_enabled"]} />
              </div>
            </div>
          )}

          {/* HESAP */}
          {tab === "hesap" && (
            <div style={CARD}>
              <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 18px" }}>Admin Şifre Değiştir</h2>
              <form onSubmit={handleChangePwd}>
                {pwdErr && <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 9, padding: "9px 12px", fontSize: 13, color: "#f87171", marginBottom: 14 }}>{pwdErr}</div>}
                <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={LBL}>Mevcut Şifre</label>
                    <div style={{ position: "relative" }}>
                      <input type={showPwd ? "text" : "password"} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} required style={{ ...IS, paddingRight: 38 }} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>{showPwd ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                    </div>
                  </div>
                  <div><label style={LBL}>Yeni Şifre</label><input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required style={IS} placeholder="En az 6 karakter" /></div>
                  <div><label style={LBL}>Yeni Şifre Tekrar</label><input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required style={IS} placeholder="••••••••" /></div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" disabled={pwdSaving} style={{ background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", color: "#fff", padding: "9px 20px", borderRadius: 9, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>{pwdSaving ? "Güncelleniyor..." : "Şifreyi Güncelle"}</button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NotificationTemplatesTab() {
  const sb = createClient();
  const [templates, setTemplates] = useState<Array<{id:string;key:string;label:string;subject:string;body:string;channel:string;is_active:boolean}>>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    sb.from("notification_templates").select("*").order("label").then(({ data }) => { setTemplates(data || []); setLoading(false); });
  }, []);

  const update = (id: string, field: string, val: string | boolean) => setTemplates(ts => ts.map(t => t.id === id ? { ...t, [field]: val } : t));

  const saveTemplate = async (id: string) => {
    setSaving(true);
    const t = templates.find(x => x.id === id);
    if (t) await sb.from("notification_templates").update({ subject: t.subject, body: t.body, channel: t.channel, is_active: t.is_active }).eq("id", id);
    setSaving(false); setEditing(null);
    setToast("Şablon kaydedildi ✓"); setTimeout(() => setToast(null), 2500);
  };

  const IS2: React.CSSProperties = { background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", padding: "8px 11px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ ...CARD, position: "relative" }}>
      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: "#141414", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", padding: "10px 18px", borderRadius: 10, fontSize: 13, zIndex: 999 }}>{toast}</div>}
      <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 6px" }}>Bildirim Şablonları</h2>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: 20 }}>E-posta / SMS içeriklerini buradan düzenleyin. {"{{name}}"}, {"{{date}}"} gibi değişkenler desteklenir.</p>
      {loading ? <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Yükleniyor...</p> : templates.map(t => (
        <div key={t.id} style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: editing === t.id ? 14 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{t.label}</span>
              <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700, background: t.is_active ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.06)", color: t.is_active ? "#4ade80" : "rgba(255,255,255,0.3)" }}>{t.is_active ? "Aktif" : "Pasif"}</span>
              <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 10, background: "rgba(96,165,250,0.1)", color: "#60a5fa" }}>{t.channel}</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {editing === t.id ? (
                <>
                  <button onClick={() => saveTemplate(t.id)} disabled={saving} style={{ padding: "5px 12px", background: "#7A0D2A", border: "none", borderRadius: 7, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{saving ? "..." : "Kaydet"}</button>
                  <button onClick={() => setEditing(null)} style={{ padding: "5px 12px", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 7, color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer" }}>İptal</button>
                </>
              ) : (
                <button onClick={() => setEditing(t.id)} style={{ padding: "5px 12px", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 7, color: "#D4AF37", fontSize: 12, cursor: "pointer" }}>Düzenle</button>
              )}
            </div>
          </div>
          {editing === t.id && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={LBL}>Kanal</label><select value={t.channel} onChange={e => update(t.id, "channel", e.target.value)} style={IS2}><option value="email">E-posta</option><option value="sms">SMS</option><option value="both">Her İkisi</option></select></div>
                <div style={{ display: "flex", alignItems: "flex-end" }}><label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}><input type="checkbox" checked={t.is_active} onChange={e => update(t.id, "is_active", e.target.checked)} style={{ accentColor: "#D4AF37" }} /><span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Aktif</span></label></div>
              </div>
              <div><label style={LBL}>Konu (Subject)</label><input value={t.subject || ""} onChange={e => update(t.id, "subject", e.target.value)} style={IS2} /></div>
              <div><label style={LBL}>İçerik</label><textarea value={t.body} onChange={e => update(t.id, "body", e.target.value)} style={{ ...IS2, minHeight: 80, resize: "vertical" }} /></div>
            </div>
          )}
          {editing !== t.id && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 8, margin: "8px 0 0" }}>{t.body.substring(0, 100)}{t.body.length > 100 ? "..." : ""}</p>}
        </div>
      ))}
    </div>
  );
}
