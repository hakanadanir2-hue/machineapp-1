"use client";
import React, {
  useEffect, useState, useRef, useCallback, useMemo,
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Upload, Trash2, Copy, Check, Search, RefreshCw, Tag, Eye,
  ImageIcon, ExternalLink, AlertCircle, CheckCircle, Loader2,
  Grid3x3, List, FolderOpen, Link as LinkIcon, Settings, X,
  ZoomIn,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface MediaFile {
  id: string;          // storage path or URL
  name: string;        // display name
  url: string;
  size: number;
  mimeType?: string;
  source: "storage" | "external";
  usedIn: SiteArea[];
  createdAt?: string;
}

interface SiteArea {
  key: string;
  label: string;
  section: string;
  currentUrl: string;
}

// ─── Site Areas Configuration ────────────────────────────────────────────────
const SITE_SECTIONS: Record<string, { label: string; color: string; areas: Array<{ key: string; label: string }> }> = {
  "Genel": {
    label: "Genel",
    color: "#D4AF37",
    areas: [
      { key: "logo_url",      label: "Site Logosu" },
      { key: "favicon_url",   label: "Favicon" },
    ],
  },
  "Ana Sayfa": {
    label: "Ana Sayfa",
    color: "#60a5fa",
    areas: [
      { key: "hero_bg_image",    label: "Hero Arkaplanı" },
      { key: "hero_video_url",   label: "Hero Video" },
      { key: "stats_bg_image",   label: "İstatistik Arkaplanı" },
      { key: "cta_bg_image",     label: "CTA Arkaplanı" },
    ],
  },
  "Hizmetler": {
    label: "Hizmetler",
    color: "#34d399",
    areas: [
      { key: "service_fitness_image",   label: "Fitness Görseli" },
      { key: "service_pt_image",        label: "Personal Trainer" },
      { key: "service_boks_image",      label: "Boks Görseli" },
      { key: "service_kickboks_image",  label: "Kickboks Görseli" },
      { key: "service_muaythai_image",  label: "Muay Thai Görseli" },
    ],
  },
  "Hakkımızda": {
    label: "Hakkımızda",
    color: "#a78bfa",
    areas: [
      { key: "about_hero_image",    label: "Hero Görseli" },
      { key: "about_team_image",    label: "Ekip Fotoğrafı" },
      { key: "about_gym_image",     label: "Salon Fotoğrafı" },
    ],
  },
  "SEO & Sosyal": {
    label: "SEO & Sosyal",
    color: "#f97316",
    areas: [
      { key: "seo_og_image",        label: "Varsayılan OG Görseli" },
      { key: "seo_home_og_image",   label: "Ana Sayfa OG" },
      { key: "seo_blog_og_image",   label: "Blog OG" },
    ],
  },
};

// All area keys flattened
const ALL_AREA_KEYS: Record<string, { label: string; section: string }> = {};
Object.entries(SITE_SECTIONS).forEach(([sec, cfg]) => {
  cfg.areas.forEach(a => { ALL_AREA_KEYS[a.key] = { label: a.label, section: sec }; });
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (b: number) =>
  b >= 1_048_576 ? `${(b / 1_048_576).toFixed(1)} MB`
    : b > 0 ? `${Math.round(b / 1024)} KB` : "";

const shortUrl = (url: string, n = 42) => url.length > n ? url.slice(0, n) + "…" : url;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toast({ msg, ok, onClose }: { msg: string; ok: boolean; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 18px",
      background: ok ? "#14532d" : "#7f1d1d",
      border: `1px solid ${ok ? "#16a34a" : "#dc2626"}`,
      borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 600,
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      {ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {msg}
      <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", marginLeft: 4 }}>×</button>
    </div>
  );
}

function ImageThumb({ url, alt, style }: { url: string; alt?: string; style?: React.CSSProperties }) {
  const [err, setErr] = useState(false);
  return err
    ? <div style={{ ...style, background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ImageIcon size={18} style={{ color: "rgba(255,255,255,0.1)" }} />
      </div>
    : <img src={url} alt={alt ?? ""} style={{ ...style, objectFit: "cover" }} loading="lazy" onError={() => setErr(true)} />;
}

// Lightbox
function Lightbox({ file, onClose }: { file: MediaFile; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)", zIndex: 500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}>
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>
          <X size={14} style={{ display: "inline", marginRight: 6 }} />Kapat
        </button>
      </div>
      <img
        src={file.url} alt={file.name}
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain", borderRadius: 12, boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }}
        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <div onClick={e => e.stopPropagation()} style={{ marginTop: 16, background: "rgba(20,20,20,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 18px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", maxWidth: 700, width: "100%" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: "#fff", fontWeight: 600, fontSize: 13, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.url}</p>
        </div>
        {file.size > 0 && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{fmt(file.size)}</span>}
        <button onClick={() => navigator.clipboard.writeText(file.url)}
          style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 12 }}>
          <Copy size={12} /> URL Kopyala
        </button>
      </div>
    </div>
  );
}

// Area Assign Modal
function AssignModal({
  file, settings, onAssign, onClose,
}: {
  file: MediaFile;
  settings: Record<string, string>;
  onAssign: (key: string, url: string) => Promise<void>;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);

  const doAssign = async (key: string) => {
    setSaving(key);
    await onAssign(key, file.url);
    setSaving(null);
    setSaved(p => [...p, key]);
    setTimeout(() => setSaved(p => p.filter(k => k !== key)), 2500);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}
      onClick={onClose}>
      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, width: "100%", maxWidth: 500, overflow: "hidden" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>Site Alanına Ata</p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: "2px 0 0" }}>Görseli hangi alana atamak istiyorsun?</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 22 }}>×</button>
        </div>

        {/* Thumb preview */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <ImageThumb url={file.url} alt={file.name} style={{ width: "100%", height: 100, borderRadius: 10 }} />
        </div>

        {/* Section list */}
        <div style={{ padding: "14px 20px", maxHeight: 400, overflowY: "auto" }}>
          {Object.entries(SITE_SECTIONS).map(([secName, sec]) => (
            <div key={secName} style={{ marginBottom: 16 }}>
              <p style={{ color: sec.color, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 8px" }}>
                {sec.label}
              </p>
              {sec.areas.map(area => {
                const isCurrently = settings[area.key] === file.url;
                const isSaved = saved.includes(area.key);
                const isSaving = saving === area.key;
                return (
                  <button key={area.key} onClick={() => doAssign(area.key)} disabled={!!saving}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px", marginBottom: 5,
                      background: isCurrently ? "rgba(212,175,55,0.07)" : "#0F0F0F",
                      border: `1px solid ${isCurrently ? "rgba(212,175,55,0.22)" : "rgba(255,255,255,0.06)"}`,
                      borderRadius: 9, cursor: saving ? "not-allowed" : "pointer",
                    }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {settings[area.key] && settings[area.key] !== file.url && (
                        <ImageThumb url={settings[area.key]} alt="" style={{ width: 28, height: 22, borderRadius: 4, flexShrink: 0 }} />
                      )}
                      <span style={{ color: isCurrently ? "#D4AF37" : "rgba(255,255,255,0.6)", fontSize: 13 }}>{area.label}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isSaved ? "#4ade80" : isCurrently ? "#D4AF37" : "rgba(255,255,255,0.2)" }}>
                      {isSaving ? "…" : isSaved ? "✓ Atandı" : isCurrently ? "Mevcut" : "Ata →"}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MedyaPage() {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  // State
  const [storageFiles, setStorageFiles] = useState<MediaFile[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [lightbox, setLightbox] = useState<MediaFile | null>(null);
  const [assignTarget, setAssignTarget] = useState<MediaFile | null>(null);
  const [copied, setCopied] = useState<string>("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [setupStatus, setSetupStatus] = useState<"idle" | "running" | "ok" | "error">("idle");
  const [setupMsg, setSetupMsg] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MediaFile | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [urlInputKey, setUrlInputKey] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // ─── Data Loading ──────────────────────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("key,value");
    const map: Record<string, string> = {};
    (data ?? []).forEach((r: { key: string; value: string }) => { map[r.key] = r.value; });
    setSettings(map);
    return map;
  }, [supabase]);

  const loadStorage = useCallback(async () => {
    const { data, error } = await supabase.storage.from("gallery").list("", {
      limit: 500, sortBy: { column: "created_at", order: "desc" },
    });

    if (error) return [];

    const files: MediaFile[] = (data ?? [])
      .filter(f => f.name !== ".emptyFolderPlaceholder" && !f.name.endsWith("/"))
      .map(f => ({
        id: f.name,
        name: f.name,
        url: supabase.storage.from("gallery").getPublicUrl(f.name).data.publicUrl,
        size: f.metadata?.size ?? 0,
        mimeType: f.metadata?.mimetype,
        source: "storage" as const,
        usedIn: [],
        createdAt: f.created_at ?? undefined,
      }));

    return files;
  }, [supabase]);

  const load = useCallback(async () => {
    setLoading(true);
    const [sMap, storFiles] = await Promise.all([loadSettings(), loadStorage()]);

    // Build usedIn for each file
    const urlToAreas: Record<string, SiteArea[]> = {};
    Object.entries(ALL_AREA_KEYS).forEach(([key, meta]) => {
      const url = sMap[key];
      if (url && url.startsWith("http")) {
        if (!urlToAreas[url]) urlToAreas[url] = [];
        urlToAreas[url].push({ key, label: meta.label, section: meta.section, currentUrl: url });
      }
    });

    // Also add service images, blog covers, product images
    const [svcs, blogs, prods] = await Promise.all([
      supabase.from("services").select("id,title,image_url"),
      supabase.from("blog_posts").select("id,title,cover_image_url").limit(50),
      supabase.from("products").select("id,name,cover_image_url").limit(100),
    ]);

    (svcs.data ?? []).forEach((s: { id: string; title: string; image_url: string }) => {
      if (s.image_url?.startsWith("http")) {
        if (!urlToAreas[s.image_url]) urlToAreas[s.image_url] = [];
        urlToAreas[s.image_url].push({ key: `service_${s.id}`, label: s.title, section: "Hizmetler", currentUrl: s.image_url });
      }
    });
    (blogs.data ?? []).forEach((b: { id: string; title: string; cover_image_url: string }) => {
      if (b.cover_image_url?.startsWith("http")) {
        if (!urlToAreas[b.cover_image_url]) urlToAreas[b.cover_image_url] = [];
        urlToAreas[b.cover_image_url].push({ key: `blog_${b.id}`, label: b.title, section: "Blog", currentUrl: b.cover_image_url });
      }
    });
    (prods.data ?? []).forEach((p: { id: string; name: string; cover_image_url: string }) => {
      if (p.cover_image_url?.startsWith("http")) {
        if (!urlToAreas[p.cover_image_url]) urlToAreas[p.cover_image_url] = [];
        urlToAreas[p.cover_image_url].push({ key: `product_${p.id}`, label: p.name, section: "Mağaza", currentUrl: p.cover_image_url });
      }
    });

    // Attach usedIn to storage files
    const enriched = storFiles.map(f => ({ ...f, usedIn: urlToAreas[f.url] ?? [] }));

    // Add external URLs not in storage
    const storageUrls = new Set(enriched.map(f => f.url));
    const externalFiles: MediaFile[] = [];
    Object.entries(urlToAreas).forEach(([url, areas]) => {
      if (!storageUrls.has(url)) {
        externalFiles.push({
          id: url,
          name: areas[0]?.label ?? "Dış URL",
          url,
          size: 0,
          source: "external",
          usedIn: areas,
        });
      }
    });

    setStorageFiles([...enriched, ...externalFiles]);
    setLoading(false);
  }, [loadSettings, loadStorage, supabase]);

  useEffect(() => { load(); }, [load]);

  // ─── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setUploadProgress([]);

    const form = new FormData();
    Array.from(fileList).forEach(f => form.append("files", f));

    const res = await fetch("/api/media/upload", { method: "POST", body: form });
    const json = await res.json();

    const msgs: string[] = (json.results ?? []).map((r: { name: string; url: string; error?: string }) =>
      r.error ? `❌ ${r.name}: ${r.error}` : `✅ ${r.name.split("/").pop()}`
    );

    if (!res.ok || json.error) {
      const hint = json.hint ?? "";
      setToast({ msg: json.error + (hint ? " — " + hint : ""), ok: false });
    } else {
      setToast({ msg: `${msgs.filter(m => m.startsWith("✅")).length} görsel yüklendi`, ok: true });
    }

    setUploadProgress(msgs);
    setTimeout(() => setUploadProgress([]), 6000);
    setUploading(false);
    load();
  }, [load]);

  // ─── Bucket Setup ──────────────────────────────────────────────────────────
  const runSetup = async () => {
    setSetupStatus("running");
    const res = await fetch("/api/media/setup", { method: "POST" });
    const json = await res.json();
    if (json.ok) {
      setSetupStatus("ok");
      setSetupMsg(json.message ?? "Hazır");
      load();
    } else {
      setSetupStatus("error");
      setSetupMsg(json.error + (json.hint ? "\n" + json.hint : ""));
    }
  };

  // ─── Assign URL to setting ─────────────────────────────────────────────────
  const assignToSetting = useCallback(async (key: string, url: string) => {
    await supabase.from("site_settings").upsert({ key, value: url }, { onConflict: "key" });
    setSettings(p => ({ ...p, [key]: url }));
    setToast({ msg: `${ALL_AREA_KEYS[key]?.label ?? key} güncellendi`, ok: true });
    // Refresh usedIn
    load();
  }, [supabase, load]);

  // Assign external URL
  const assignExternalUrl = async () => {
    if (!urlInput.trim() || !urlInputKey) return;
    await assignToSetting(urlInputKey, urlInput.trim());
    setUrlInput("");
    setUrlInputKey("");
    setShowUrlInput(false);
  };

  // ─── Delete ────────────────────────────────────────────────────────────────
  const deleteFile = useCallback(async (file: MediaFile) => {
    setDeletingId(file.id);
    const res = await fetch("/api/media/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: file.id }),
    });
    if (res.ok) {
      setToast({ msg: "Görsel silindi", ok: true });
      load();
    } else {
      const j = await res.json();
      setToast({ msg: j.error ?? "Silinemedi", ok: false });
    }
    setDeletingId(null);
    setConfirmDelete(null);
  }, [load]);

  // ─── Copy URL ──────────────────────────────────────────────────────────────
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(""), 2500);
    setToast({ msg: "URL kopyalandı", ok: true });
  };

  // ─── Filtered Files ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = storageFiles;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.url.toLowerCase().includes(q) ||
        f.usedIn.some(u => u.label.toLowerCase().includes(q))
      );
    }
    if (activeSection !== "all") {
      if (activeSection === "unused") {
        list = list.filter(f => f.usedIn.length === 0 && f.source === "storage");
      } else if (activeSection === "external") {
        list = list.filter(f => f.source === "external");
      } else {
        list = list.filter(f => f.usedIn.some(u => u.section === activeSection));
      }
    }
    return list;
  }, [storageFiles, search, activeSection]);

  const stats = useMemo(() => ({
    total: storageFiles.length,
    storage: storageFiles.filter(f => f.source === "storage").length,
    external: storageFiles.filter(f => f.source === "external").length,
    used: storageFiles.filter(f => f.usedIn.length > 0).length,
    unused: storageFiles.filter(f => f.usedIn.length === 0 && f.source === "storage").length,
  }), [storageFiles]);

  const sectionCounts = useMemo(() => {
    const c: Record<string, number> = {};
    storageFiles.forEach(f => {
      const secs = new Set(f.usedIn.map(u => u.section));
      secs.forEach(s => { c[s] = (c[s] ?? 0) + 1; });
    });
    return c;
  }, [storageFiles]);

  // ─── Input styles ──────────────────────────────────────────────────────────
  const inp: React.CSSProperties = {
    background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, color: "#fff", padding: "8px 12px", fontSize: 13, outline: "none",
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1300 }}>
      {toast && <Toast msg={toast.msg} ok={toast.ok} onClose={() => setToast(null)} />}
      {lightbox && <Lightbox file={lightbox} onClose={() => setLightbox(null)} />}
      {assignTarget && (
        <AssignModal
          file={assignTarget}
          settings={settings}
          onAssign={assignToSetting}
          onClose={() => setAssignTarget(null)}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 5px" }}>Medya Kütüphanesi</h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>Görselleri yükle, yönet ve site alanlarına ata</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={runSetup} disabled={setupStatus === "running"}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: setupStatus === "ok" ? "rgba(74,222,128,0.1)" : "#1A1A1A", border: `1px solid ${setupStatus === "ok" ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.08)"}`, borderRadius: 9, color: setupStatus === "ok" ? "#4ade80" : "rgba(255,255,255,0.5)", cursor: setupStatus === "running" ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600 }}>
            {setupStatus === "running" ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Settings size={13} />}
            {setupStatus === "ok" ? "Storage Hazır" : "Storage Kur"}
          </button>
          <button onClick={() => load()}
            style={{ width: 36, height: 36, background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RefreshCw size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
          </button>
          <button onClick={() => setShowUrlInput(p => !p)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            <LinkIcon size={13} /> URL Ekle
          </button>
          <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={e => handleUpload(e.target.files)} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", background: uploading ? "#333" : "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 700, cursor: uploading ? "not-allowed" : "pointer" }}>
            {uploading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={14} />}
            {uploading ? "Yükleniyor..." : "Görsel Yükle"}
          </button>
        </div>
      </div>

      {/* Setup error */}
      {setupStatus === "error" && (
        <div style={{ background: "rgba(127,29,29,0.2)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
          <p style={{ color: "#f87171", fontWeight: 700, fontSize: 13, margin: "0 0 4px" }}>Storage kurulumu başarısız</p>
          <pre style={{ color: "rgba(248,113,113,0.8)", fontSize: 11, margin: 0, whiteSpace: "pre-wrap" }}>{setupMsg}</pre>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "10px 0 0" }}>
            Supabase Dashboard → Settings → API → <b>service_role</b> key'i kopyalayın ve .env.local dosyasına <code>SUPABASE_SERVICE_ROLE_KEY=...</code> olarak ekleyin, sonra sunucuyu yeniden başlatın.
          </p>
        </div>
      )}

      {/* URL Input panel */}
      {showUrlInput && (
        <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, margin: "0 0 12px" }}>Dış URL ile Görsel Ata</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "center" }}>
            <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://example.com/image.jpg"
              style={{ ...inp, width: "100%", boxSizing: "border-box" }} />
            <select value={urlInputKey} onChange={e => setUrlInputKey(e.target.value)} style={{ ...inp, minWidth: 200 }}>
              <option value="">Alan seç...</option>
              {Object.entries(SITE_SECTIONS).map(([sec, cfg]) =>
                cfg.areas.map(a => <option key={a.key} value={a.key} style={{ background: "#1A1A1A" }}>{sec} › {a.label}</option>)
              )}
            </select>
            <button onClick={assignExternalUrl} disabled={!urlInput.trim() || !urlInputKey}
              style={{ padding: "8px 18px", background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 9, color: "#fff", cursor: !urlInput.trim() || !urlInputKey ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700 }}>
              Ata
            </button>
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploadProgress.length > 0 && (
        <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "10px 16px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {uploadProgress.map((m, i) => (
            <span key={i} style={{ fontSize: 11, color: m.startsWith("✅") ? "#4ade80" : "#f87171" }}>{m}</span>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        style={{ border: "2px dashed rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px", textAlign: "center", marginBottom: 20, cursor: "pointer", transition: "border-color 0.2s" }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
      >
        <Upload size={18} style={{ color: "rgba(255,255,255,0.1)", margin: "0 auto 6px" }} />
        <p style={{ color: "rgba(255,255,255,0.16)", fontSize: 12, margin: 0 }}>
          Görsel sürükleyip bırak veya tıkla · PNG, JPG, WEBP, SVG, AVIF · Maks 10MB
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Toplam", value: stats.total, color: "#fff" },
          { label: "Storage", value: stats.storage, color: "#60a5fa" },
          { label: "Dış URL", value: stats.external, color: "rgba(255,255,255,0.3)" },
          { label: "Kullanımda", value: stats.used, color: "#4ade80" },
          { label: "Kullanılmayan", value: stats.unused, color: "#f87171" },
        ].map(s => (
          <div key={s.label} style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: s.color, fontWeight: 800, fontSize: 18 }}>{s.value}</span>
            <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 11 }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16 }}>
        {/* Sidebar — sections */}
        <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 12, height: "fit-content", position: "sticky", top: 80 }}>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 8px 4px" }}>Bölümler</p>
          {[
            { id: "all", label: "Tümü", count: stats.total },
            { id: "unused", label: "Kullanılmayan", count: stats.unused },
            { id: "external", label: "Dış URL", count: stats.external },
            ...Object.entries(SITE_SECTIONS).map(([id, cfg]) => ({
              id, label: cfg.label, count: sectionCounts[id] ?? 0, color: cfg.color,
            })),
            { id: "Blog", label: "Blog", count: sectionCounts["Blog"] ?? 0 },
            { id: "Mağaza", label: "Mağaza", count: sectionCounts["Mağaza"] ?? 0 },
            { id: "Hizmetler (DB)", label: "Hizmetler (DB)", count: sectionCounts["Hizmetler"] ?? 0 },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id)}
              style={{
                width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 10px", borderRadius: 8, marginBottom: 3, cursor: "pointer", textAlign: "left",
                background: activeSection === item.id ? "rgba(212,175,55,0.08)" : "transparent",
                border: `1px solid ${activeSection === item.id ? "rgba(212,175,55,0.2)" : "transparent"}`,
              }}>
              <span style={{ fontSize: 12, fontWeight: activeSection === item.id ? 700 : 500, color: activeSection === item.id ? "#D4AF37" : "rgba(255,255,255,0.5)" }}>
                {item.label}
              </span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", borderRadius: 99, padding: "1px 7px" }}>{item.count}</span>
            </button>
          ))}
        </div>

        {/* Main area */}
        <div>
          {/* Toolbar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "rgba(255,255,255,0.2)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Görsel ara..."
                style={{ ...inp, paddingLeft: 30, width: "100%", boxSizing: "border-box" }} />
            </div>
            <button onClick={() => setViewMode(v => v === "grid" ? "list" : "grid")}
              style={{ width: 36, height: 36, background: "#141414", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>
              {viewMode === "grid" ? <List size={15} /> : <Grid3x3 size={15} />}
            </button>
          </div>

          {/* Site Areas quick panel (when all) */}
          {activeSection === "all" && (
            <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 7 }}>
                <FolderOpen size={14} style={{ color: "#D4AF37" }} /> Site Alanları — Mevcut Görseller
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
                {Object.entries(SITE_SECTIONS).map(([secName, sec]) => (
                  <div key={secName}>
                    <p style={{ color: sec.color, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 6px" }}>{sec.label}</p>
                    {sec.areas.map(area => {
                      const url = settings[area.key];
                      return (
                        <div key={area.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 9, marginBottom: 4 }}>
                          <div style={{ width: 44, height: 32, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "#1A1A1A" }}>
                            {url ? <ImageThumb url={url} alt={area.label} style={{ width: "100%", height: "100%" }} /> : <ImageIcon size={12} style={{ color: "rgba(255,255,255,0.1)", margin: "10px auto", display: "block" }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: "#fff", fontSize: 11, fontWeight: 600, margin: "0 0 1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{area.label}</p>
                            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url ? shortUrl(url, 35) : "Atanmamış"}</p>
                          </div>
                          <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                            {url && (
                              <button onClick={() => { const fake: MediaFile = { id: url, name: area.label, url, size: 0, source: "external", usedIn: [] }; setLightbox(fake); }}
                                style={{ width: 24, height: 24, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ZoomIn size={10} style={{ color: "rgba(255,255,255,0.4)" }} />
                              </button>
                            )}
                            <button onClick={() => { setUrlInputKey(area.key); setShowUrlInput(true); setUrlInput(settings[area.key] ?? ""); }}
                              style={{ width: 24, height: 24, background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Tag size={10} style={{ color: "#D4AF37" }} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ background: "#141414", borderRadius: 12, height: 180, opacity: 0.5 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16 }}>
              <ImageIcon size={36} style={{ color: "rgba(255,255,255,0.08)", margin: "0 auto 12px" }} />
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 14, marginBottom: 6 }}>Görsel bulunamadı</p>
              <p style={{ color: "rgba(255,255,255,0.1)", fontSize: 12 }}>Görsel yükle veya URL ile ekle</p>
            </div>
          ) : viewMode === "grid" ? (
            // GRID VIEW
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
              {filtered.map(file => {
                const isUsed = file.usedIn.length > 0;
                return (
                  <div key={file.id} style={{ background: "#141414", border: `1px solid ${isUsed ? "rgba(212,175,55,0.14)" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, overflow: "hidden" }}>
                    {/* Thumb */}
                    <div style={{ position: "relative", paddingBottom: "65%", background: "#0F0F0F", cursor: "zoom-in" }}
                      onClick={() => setLightbox(file)}>
                      <ImageThumb url={file.url} alt={file.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
                      {file.source === "external" && (
                        <span style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.7)", color: "rgba(255,255,255,0.4)", fontSize: 8, padding: "2px 5px", borderRadius: 4, fontWeight: 600 }}>EXT</span>
                      )}
                      {isUsed && (
                        <span style={{ position: "absolute", bottom: 4, left: 4, background: "rgba(212,175,55,0.85)", color: "#000", fontSize: 8, fontWeight: 800, padding: "2px 6px", borderRadius: 3 }}>
                          {file.usedIn.length} ALAN
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: "7px 8px 0" }}>
                      <p style={{ color: "#fff", fontSize: 10, fontWeight: 600, margin: "0 0 1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                      {file.size > 0 && <p style={{ color: "rgba(255,255,255,0.18)", fontSize: 9, margin: "0 0 3px" }}>{fmt(file.size)}</p>}
                      {file.usedIn.slice(0, 2).map((u, i) => (
                        <p key={i} style={{ color: "#D4AF37", fontSize: 9, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>• {u.section} / {u.label}</p>
                      ))}
                    </div>

                    {/* Actions */}
                    <div style={{ padding: "6px 7px 8px", display: "flex", gap: 4 }}>
                      <button onClick={() => copyUrl(file.url)}
                        style={{ flex: 1, padding: "5px 0", background: copied === file.url ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${copied === file.url ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                        {copied === file.url ? <Check size={9} style={{ color: "#4ade80" }} /> : <Copy size={9} style={{ color: "rgba(255,255,255,0.22)" }} />}
                        <span style={{ fontSize: 8, color: copied === file.url ? "#4ade80" : "rgba(255,255,255,0.22)" }}>{copied === file.url ? "Kopyalandı" : "URL"}</span>
                      </button>
                      <button onClick={() => setAssignTarget(file)} title="Alana Ata"
                        style={{ width: 26, height: 26, background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Tag size={9} style={{ color: "#D4AF37" }} />
                      </button>
                      {file.source === "storage" ? (
                        <button onClick={() => setConfirmDelete(file)} title="Sil" disabled={deletingId === file.id}
                          style={{ width: 26, height: 26, background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.14)", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {deletingId === file.id ? <Loader2 size={9} style={{ color: "#f87171", animation: "spin 1s linear infinite" }} /> : <Trash2 size={9} style={{ color: "#f87171" }} />}
                        </button>
                      ) : (
                        <a href={file.url} target="_blank" rel="noopener noreferrer"
                          style={{ width: 26, height: 26, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ExternalLink size={9} style={{ color: "rgba(255,255,255,0.22)" }} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // LIST VIEW
            <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Görsel", "Dosya Adı", "Kullanım Alanı", "Boyut", "Kaynak", ""].map((h, i) => (
                      <th key={i} style={{ padding: "10px 14px", textAlign: "left", color: "rgba(255,255,255,0.22)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(file => (
                    <tr key={file.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ width: 54, height: 38, borderRadius: 7, overflow: "hidden", cursor: "zoom-in" }} onClick={() => setLightbox(file)}>
                          <ImageThumb url={file.url} alt={file.name} style={{ width: "100%", height: "100%" }} />
                        </div>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <p style={{ color: "#fff", fontSize: 12, fontWeight: 600, margin: "0 0 2px", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, margin: 0, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shortUrl(file.url, 30)}</p>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        {file.usedIn.slice(0, 2).map((u, i) => (
                          <span key={i} style={{ display: "inline-block", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 99, padding: "2px 8px", fontSize: 10, color: "#D4AF37", marginRight: 4, marginBottom: 2 }}>
                            {u.section} / {u.label}
                          </span>
                        ))}
                        {file.usedIn.length === 0 && <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.25)", fontSize: 11, whiteSpace: "nowrap" }}>{fmt(file.size) || "—"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ padding: "3px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600, color: file.source === "storage" ? "#60a5fa" : "rgba(255,255,255,0.3)", background: file.source === "storage" ? "rgba(96,165,250,0.1)" : "rgba(255,255,255,0.05)" }}>
                          {file.source === "storage" ? "Storage" : "Dış URL"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button onClick={() => copyUrl(file.url)} title="Kopyala"
                            style={{ width: 28, height: 28, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {copied === file.url ? <Check size={12} style={{ color: "#4ade80" }} /> : <Copy size={12} style={{ color: "rgba(255,255,255,0.3)" }} />}
                          </button>
                          <button onClick={() => setAssignTarget(file)} title="Alana Ata"
                            style={{ width: 28, height: 28, background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.14)", borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Tag size={12} style={{ color: "#D4AF37" }} />
                          </button>
                          {file.source === "storage" && (
                            <button onClick={() => setConfirmDelete(file)} title="Sil"
                              style={{ width: 28, height: 28, background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.12)", borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Trash2 size={12} style={{ color: "#f87171" }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setConfirmDelete(null)}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 26, maxWidth: 380, width: "90%" }}
            onClick={e => e.stopPropagation()}>
            <ImageThumb url={confirmDelete.url} alt={confirmDelete.name} style={{ width: "100%", height: 110, borderRadius: 10, marginBottom: 14 }} />
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: "0 0 6px" }}>Görseli Sil</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{confirmDelete.name}</p>
            {confirmDelete.usedIn.length > 0 && (
              <div style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 9, padding: "10px 13px", marginBottom: 14 }}>
                <p style={{ color: "#f87171", fontSize: 11, fontWeight: 700, margin: "0 0 5px" }}>⚠ Bu görsel kullanımda:</p>
                {confirmDelete.usedIn.map((u, i) => <p key={i} style={{ color: "#f87171", fontSize: 10, margin: 0 }}>• {u.section} / {u.label}</p>)}
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: 10, background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "rgba(255,255,255,0.5)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>İptal</button>
              <button onClick={() => deleteFile(confirmDelete)} style={{ flex: 1, padding: 10, background: "#ef4444", border: "none", borderRadius: 9, color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
