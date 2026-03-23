"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { Plus, Trash2, Youtube, Image as ImageIcon, GripVertical, Eye, EyeOff, Upload, X } from "lucide-react";

interface HeroItem {
  id: string;
  type: "photo" | "youtube";
  url: string;
  label: string | null;
  order_index: number;
  is_active: boolean;
}

function youtubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

export default function AdminHeroPage() {
  const sb = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems]     = useState<HeroItem[]>([]);
  const [loading, setLoad]    = useState(true);
  const [uploading, setUpl]   = useState(false);
  const [ytUrl, setYtUrl]     = useState("");
  const [ytLabel, setYtLabel] = useState("");
  const [toast, setToast]     = useState<string | null>(null);
  const [interval, setInterval_] = useState("3000");
  const [preview, setPreview] = useState<string | null>(null);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3200); };

  const load = useCallback(async () => {
    setLoad(true);
    const [{ data: media }, { data: settings }] = await Promise.all([
      sb.from("hero_media").select("*").order("order_index"),
      sb.from("site_settings").select("value").eq("key", "hero_slideshow_interval").single(),
    ]);
    setItems((media ?? []) as HeroItem[]);
    if (settings?.value) setInterval_(settings.value);
    setLoad(false);
  }, [sb]);

  useEffect(() => { load(); }, [load]);

  async function saveInterval(val: string) {
    setInterval_(val);
    await sb.from("site_settings").upsert({ key: "hero_slideshow_interval", value: val }, { onConflict: "key" });
    showToast("Interval kaydedildi ✓");
  }

  async function addYoutube() {
    if (!ytUrl.trim()) return;
    const vid = youtubeId(ytUrl);
    if (!vid) { showToast("Geçersiz YouTube URL"); return; }
    const embedUrl = `https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}&controls=0&showinfo=0&rel=0&playsinline=1&enablejsapi=1`;
    await sb.from("hero_media").insert({ type: "youtube", url: embedUrl, label: ytLabel || `YouTube Video`, order_index: items.length });
    setYtUrl(""); setYtLabel("");
    showToast("YouTube eklendi ✓");
    load();
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUpl(true);
    for (const file of Array.from(files)) {
      const ext  = file.name.split(".").pop();
      const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await sb.storage.from("hero-media").upload(path, file, { upsert: false });
      if (upErr) { showToast(`Upload hatası: ${upErr.message}`); continue; }
      const { data: { publicUrl } } = sb.storage.from("hero-media").getPublicUrl(path);
      await sb.from("hero_media").insert({ type: "photo", url: publicUrl, label: file.name, order_index: items.length });
    }
    setUpl(false);
    if (fileRef.current) fileRef.current.value = "";
    showToast("Fotoğraf(lar) yüklendi ✓");
    load();
  }

  async function toggle(item: HeroItem) {
    await sb.from("hero_media").update({ is_active: !item.is_active }).eq("id", item.id);
    load();
  }

  async function del(item: HeroItem) {
    if (item.type === "photo") {
      try {
        const path = item.url.split("/hero-media/")[1];
        if (path) await sb.storage.from("hero-media").remove([path]);
      } catch { /* ignore storage errors */ }
    }
    await sb.from("hero_media").delete().eq("id", item.id);
    showToast("Silindi");
    load();
  }

  async function moveUp(item: HeroItem) {
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx <= 0) return;
    const above = items[idx - 1];
    await Promise.all([
      sb.from("hero_media").update({ order_index: above.order_index }).eq("id", item.id),
      sb.from("hero_media").update({ order_index: item.order_index }).eq("id", above.id),
    ]);
    load();
  }

  async function moveDown(item: HeroItem) {
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= items.length - 1) return;
    const below = items[idx + 1];
    await Promise.all([
      sb.from("hero_media").update({ order_index: below.order_index }).eq("id", item.id),
      sb.from("hero_media").update({ order_index: item.order_index }).eq("id", below.id),
    ]);
    load();
  }

  const inp: React.CSSProperties = { background: "#0F0F0F", border: "1px solid rgba(255,255,255,.1)", borderRadius: 9, color: "#fff", padding: "9px 13px", fontSize: 13, width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ padding: 24, background: "#0A0A0A", minHeight: "100vh", color: "#fff" }}>
      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, background: "#1a1a1a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "12px 18px", fontSize: 13, fontWeight: 600, maxWidth: 320 }}>{toast}</div>}

      {/* Preview modal */}
      {preview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.95)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setPreview(null)}>
          <button onClick={() => setPreview(null)} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,.1)", border: "none", color: "#fff", padding: "8px", borderRadius: 8, cursor: "pointer" }}><X size={20} /></button>
          {preview.includes("youtube.com/embed") ? (
            <iframe src={preview} style={{ width: "80vw", height: "45vw", border: "none", borderRadius: 12 }} allow="autoplay; encrypted-media" />
          ) : (
            <img src={preview} alt="preview" style={{ maxWidth: "85vw", maxHeight: "85vh", borderRadius: 12, objectFit: "contain" }} />
          )}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>Ana Sayfa Hero Medya</h1>
        <p style={{ color: "rgba(255,255,255,.35)", fontSize: 12 }}>YouTube video + fotoğraf slideshow yönetimi</p>
      </div>

      {/* Slideshow interval */}
      <div style={{ background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "16px 18px", marginBottom: 18 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Fotoğraf Geçiş Süresi</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[["2000","2 sn"],["3000","3 sn"],["4000","4 sn"],["5000","5 sn"]].map(([v,l]) => (
            <button key={v} onClick={() => saveInterval(v)} style={{ padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12,
              background: interval === v ? "#7A0D2A" : "rgba(255,255,255,.07)", color: interval === v ? "#fff" : "rgba(255,255,255,.4)" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }} className="hero-add-grid">
        <style>{`@media(max-width:640px){.hero-add-grid{grid-template-columns:1fr!important}}`}</style>

        {/* YouTube ekle */}
        <div style={{ background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Youtube size={16} color="#f87171" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>YouTube Video Ekle</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} style={inp} placeholder="https://www.youtube.com/watch?v=..." />
            <input value={ytLabel} onChange={(e) => setYtLabel(e.target.value)} style={inp} placeholder="Etiket (opsiyonel)" />
            <button onClick={addYoutube} style={{ background: "rgba(248,113,113,.15)", border: "1px solid rgba(248,113,113,.2)", color: "#f87171", padding: "9px", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
              Ekle
            </button>
          </div>
        </div>

        {/* Fotoğraf yükle */}
        <div style={{ background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <ImageIcon size={16} color="#60a5fa" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Fotoğraf Yükle</span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={uploadPhoto} style={{ display: "none" }} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ width: "100%", background: uploading ? "rgba(255,255,255,.04)" : "rgba(96,165,250,.1)", border: `2px dashed ${uploading ? "rgba(255,255,255,.1)" : "rgba(96,165,250,.25)"}`, color: uploading ? "rgba(255,255,255,.3)" : "#60a5fa", padding: "28px 16px", borderRadius: 10, cursor: uploading ? "default" : "pointer", textAlign: "center" }}>
            <Upload size={20} style={{ margin: "0 auto 6px" }} />
            <div style={{ fontSize: 13, fontWeight: 700 }}>{uploading ? "Yükleniyor..." : "Tıkla veya çoklu seç"}</div>
            <div style={{ fontSize: 11, opacity: 0.6, marginTop: 3 }}>JPG, PNG, WebP</div>
          </button>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 8 }}>
            ⚠ Supabase Storage&apos;da <strong>hero-media</strong> bucket oluşturulmuş olmalı (public)
          </p>
        </div>
      </div>

      {/* Liste */}
      <div style={{ background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Medya ({items.length})</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.25)" }}>İlk sıra önce oynar</span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,.25)", fontSize: 13 }}>Yükleniyor...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,.2)", fontSize: 13 }}>Henüz medya eklenmedi</div>
        ) : (
          <div>
            {items.map((item, idx) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: idx < items.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none", opacity: item.is_active ? 1 : 0.4 }}>
                {/* Drag handle / order */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <button onClick={() => moveUp(item)} disabled={idx === 0} style={{ background: "none", border: "none", color: "rgba(255,255,255,.25)", cursor: idx === 0 ? "default" : "pointer", padding: "2px 4px", fontSize: 10 }}>▲</button>
                  <button onClick={() => moveDown(item)} disabled={idx === items.length - 1} style={{ background: "none", border: "none", color: "rgba(255,255,255,.25)", cursor: idx === items.length - 1 ? "default" : "pointer", padding: "2px 4px", fontSize: 10 }}>▼</button>
                </div>

                {/* Thumbnail */}
                <div style={{ width: 56, height: 40, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {item.type === "youtube" ? (
                    <div style={{ width: "100%", height: "100%", background: "rgba(248,113,113,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Youtube size={20} color="#f87171" />
                    </div>
                  ) : (
                    <img src={item.url} alt={item.label ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label || item.url.slice(0, 40) + "…"}</div>
                  <div style={{ fontSize: 11, color: item.type === "youtube" ? "#f87171" : "#60a5fa", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>{item.type === "youtube" ? "YouTube" : "Fotoğraf"}</div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setPreview(item.url)} style={{ padding: "5px 8px", borderRadius: 7, border: "none", cursor: "pointer", background: "rgba(255,255,255,.07)", color: "rgba(255,255,255,.5)" }} title="Önizle">
                    <Eye size={13} />
                  </button>
                  <button onClick={() => toggle(item)} style={{ padding: "5px 10px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: item.is_active ? "rgba(74,222,128,.1)" : "rgba(255,255,255,.06)", color: item.is_active ? "#4ade80" : "rgba(255,255,255,.3)" }}>
                    {item.is_active ? "Aktif" : "Pasif"}
                  </button>
                  <button onClick={() => del(item)} style={{ padding: "5px 8px", borderRadius: 7, border: "none", cursor: "pointer", background: "rgba(248,113,113,.1)", color: "#f87171" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, background: "rgba(96,165,250,.05)", border: "1px solid rgba(96,165,250,.1)", borderRadius: 12, padding: "12px 16px", fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.7 }}>
        <strong style={{ color: "#60a5fa" }}>Oynatma mantığı:</strong><br />
        • YouTube videosu varsa arka planda sessiz döner (masaüstü)<br />
        • Fotoğraflar her {parseInt(interval) / 1000} saniyede bir geçiş yapar (tüm cihazlar)<br />
        • Mobilde YouTube yerine fotoğraf slideshow otomatik devreye girer<br />
        • Video yüklenemezse fotoğraf slideshow fallback olarak çalışır
      </div>
    </div>
  );
}
