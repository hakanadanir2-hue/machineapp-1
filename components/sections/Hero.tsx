"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";

interface HeroMedia {
  id: string;
  type: "photo" | "youtube";
  url: string;
  order_index: number;
}

interface HeroProps {
  title?: string;
  subtitle?: string;
  btn1?: string;
  btn2?: string;
  bgImage?: string;
  whatsapp?: string;
  initialMedia?: HeroMedia[];
  initialInterval?: number;
}

export default function Hero({
  title = "Makine Gibi Çalış. Sonuç Kaçınılmaz.",
  subtitle = "Bilimsel antrenman programları, uzman eğitmenler ve premium ekipmanlarla hedeflerine ulaş.",
  btn1 = "Ücretsiz Deneme Antrenmanı",
  btn2 = "WhatsApp ile Yaz",
  bgImage = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80",
  whatsapp = "903742701455",
  initialMedia = [],
  initialInterval = 3000,
}: HeroProps) {
  const [mediaItems]    = useState<HeroMedia[]>(initialMedia);
  const [photoIndex, setPhotoIndex] = useState(0);
  const interval_       = initialInterval;
  const [videoReady, setVideoReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Slideshow timer for photos
  const photos = mediaItems.filter((m) => m.type === "photo");
  const youtube = mediaItems.find((m) => m.type === "youtube");
  const showYoutube = !!youtube; // mobil dahil her cihazda oynat

  useEffect(() => {
    if (photos.length <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setPhotoIndex((p) => (p + 1) % photos.length);
    }, interval_);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [photos.length, interval_]);

  const wa = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Merhaba, deneme antrenmanı hakkında bilgi almak istiyorum.")}`;
  const [line1, line2] = title.includes(".")
    ? [title.substring(0, title.indexOf(".") + 1), title.substring(title.indexOf(".") + 1).trim()]
    : [title, ""];

  // Current background photo
  const currentPhoto = photos.length > 0 ? photos[photoIndex] : null;
  const fallbackBg   = bgImage;

  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#0B0B0B" }}>

      {/* ── Photo slideshow layer ── */}
      <AnimatePresence mode="sync">
        {(currentPhoto || !showYoutube) && (
          <motion.div
            key={currentPhoto?.id ?? "fallback"}
            initial={{ opacity: 0 }}
            animate={{ opacity: showYoutube ? (videoReady ? 0 : 1) : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{
              position: "absolute", inset: 0,
              backgroundImage: `url('${currentPhoto?.url ?? fallbackBg}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              zIndex: 1,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── YouTube iframe layer (tüm cihazlar) ── */}
      {showYoutube && (
        <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden" }}>
          <iframe
            src={youtube!.url}
            allow="autoplay; muted; encrypted-media; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "177.78vh",
              height: "100vh",
              minWidth: "100%",
              minHeight: "56.25vw",
              border: "none",
              pointerEvents: "none",
            }}
            onLoad={() => setTimeout(() => setVideoReady(true), 2000)}
          />
        </div>
      )}

      {/* ── Dark overlay ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 3,
        background: "linear-gradient(to bottom, rgba(11,11,11,0.60) 0%, rgba(11,11,11,0.45) 50%, #0B0B0B 100%)",
      }} />

      {/* ── Photo dots (only when multiple photos) ── */}
      {photos.length > 1 && (
        <div style={{ position: "absolute", bottom: "6rem", left: "50%", transform: "translateX(-50%)", zIndex: 10, display: "flex", gap: 8 }}>
          {photos.map((_, i) => (
            <button key={i} onClick={() => setPhotoIndex(i)} style={{
              width: i === photoIndex ? 20 : 7, height: 7, borderRadius: 4,
              border: "none", cursor: "pointer", padding: 0,
              background: i === photoIndex ? "#D4AF37" : "rgba(255,255,255,0.3)",
              transition: "all 0.3s",
            }} />
          ))}
        </div>
      )}

      {/* ── Content ── */}
      <div className="page-container" style={{ position: "relative", zIndex: 10, textAlign: "center", paddingTop: "8rem", paddingBottom: "6rem" }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "1.25rem" }}
        >
          Bolu&apos;nun Premium Fitness &amp; Boks Salonu
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: "1.25rem", fontFamily: "var(--font-heading)" }}
        >
          {line2 ? <>{line1}<br /><span style={{ color: "#D4AF37" }}>{line2}</span></> : title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
          style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(0.9375rem, 2vw, 1.125rem)", marginBottom: "2.5rem", maxWidth: "38rem", marginInline: "auto", lineHeight: 1.7 }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", alignItems: "center" }}
        >
          <Link href="/deneme-antrenman" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 2rem", background: "#6A0D25", color: "#fff", fontWeight: 700, borderRadius: "12px", border: "1px solid rgba(212,175,55,0.35)", textDecoration: "none", fontSize: "0.9375rem" }}>
            {btn1} <ArrowRight style={{ width: "16px", height: "16px" }} />
          </Link>
          <a href={wa} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 2rem", background: "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 500, borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)", textDecoration: "none", fontSize: "0.9375rem" }}>
            <MessageCircle style={{ width: "18px", height: "18px", color: "#4ade80" }} />
            {btn2}
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} style={{ marginTop: "4rem", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "24px", height: "40px", border: "2px solid rgba(255,255,255,0.2)", borderRadius: "12px", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5px" }}>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: "4px", height: "8px", background: "#D4AF37", borderRadius: "2px" }} />
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "120px", background: "linear-gradient(to top, #0B0B0B, transparent)", pointerEvents: "none", zIndex: 4 }} />
    </section>
  );
}
