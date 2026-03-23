"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, Search } from "lucide-react";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  cover_image?: string;
  tags?: string[];
  published_at?: string;
}

const ALL_TAGS = ["Tümü", "Fitness", "Boks", "Muay Thai", "Beslenme", "Antrenman", "Motivasyon", "Kas Kazanımı", "Supplement", "Başlangıç"];

export default function BlogClient({ posts, isPlaceholder }: { posts: Post[]; isPlaceholder: boolean }) {
  const [activeTag, setActiveTag] = useState("Tümü");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return posts.filter(p => {
      const matchTag = activeTag === "Tümü" || (p.tags || []).includes(activeTag);
      const q = search.toLowerCase();
      const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.excerpt || "").toLowerCase().includes(q);
      return matchTag && matchSearch;
    });
  }, [posts, activeTag, search]);

  // Sadece mevcut postlarda olan tagleri göster
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach(p => (p.tags || []).forEach(t => tagSet.add(t)));
    return ALL_TAGS.filter(t => t === "Tümü" || tagSet.has(t));
  }, [posts]);

  return (
    <div className="page-container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
      {isPlaceholder && (
        <div style={{ marginBottom: "2rem", padding: "0.875rem 1.25rem", background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <BookOpen style={{ width: "16px", height: "16px", color: "#D4AF37", flexShrink: 0 }} />
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem", margin: 0 }}>Örnek içerikler gösteriliyor. Admin panelinden gerçek yazılar ekleyebilirsiniz.</p>
        </div>
      )}

      {/* Arama + Filtreler */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem" }}>
        <div style={{ position: "relative", maxWidth: 360 }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "rgba(255,255,255,0.25)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Blog yazısı ara..."
            style={{ width: "100%", padding: "9px 12px 9px 34px", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 10, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "9999px",
                fontSize: "0.8125rem",
                fontWeight: activeTag === tag ? 700 : 500,
                background: activeTag === tag ? "#6A0D25" : "transparent",
                color: activeTag === tag ? "#fff" : "rgba(255,255,255,0.5)",
                border: `1px solid ${activeTag === tag ? "rgba(212,175,55,0.35)" : "#2A2A2A"}`,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Sonuç sayısı */}
      {(activeTag !== "Tümü" || search) && (
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: "1.5rem" }}>
          {filtered.length} yazı bulundu
          {activeTag !== "Tümü" && <span> — <strong style={{ color: "#D4AF37" }}>{activeTag}</strong></span>}
        </p>
      )}

      {/* Posts Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "rgba(255,255,255,0.25)" }}>
          <BookOpen style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.3 }} />
          <p style={{ fontSize: 15 }}>Bu kategoride yazı bulunamadı</p>
          <button onClick={() => { setActiveTag("Tümü"); setSearch(""); }} style={{ marginTop: 12, padding: "7px 18px", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8, color: "#D4AF37", cursor: "pointer", fontSize: 13 }}>
            Tümünü Göster
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {filtered.map((post) => (
            <Link
              key={post.id}
              href={post.slug === "#" ? "/blog" : `/blog/${post.slug}`}
              style={{ textDecoration: "none", display: "flex", flexDirection: "column", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "20px", overflow: "hidden" }}
              className="blog-card"
            >
              <style>{`.blog-card:hover { border-color: rgba(106,13,37,0.5) !important; } .blog-card:hover .blog-img { transform: scale(1.04); }`}</style>
              <div style={{ position: "relative", height: "200px", overflow: "hidden", flexShrink: 0 }}>
                {post.cover_image ? (
                  <img src={post.cover_image} alt={post.title} className="blog-img" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BookOpen style={{ width: "2.5rem", height: "2.5rem", color: "#3A3A3A" }} />
                  </div>
                )}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,26,26,0.7), transparent 60%)" }} />
                {post.tags && post.tags.length > 0 && (
                  <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                    {(post.tags as string[]).slice(0, 2).map((tag: string) => (
                      <button
                        key={tag}
                        onClick={e => { e.preventDefault(); setActiveTag(tag); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        style={{ padding: "0.2rem 0.625rem", background: "rgba(106,13,37,0.85)", color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, borderRadius: "9999px", backdropFilter: "blur(4px)", border: "none", cursor: "pointer" }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", fontFamily: "var(--font-heading)", lineHeight: 1.4, marginBottom: "0.625rem" }}>
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem", lineHeight: 1.6, marginBottom: "1rem", flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
                    {post.excerpt}
                  </p>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid #2A2A2A" }}>
                  <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem" }}>
                    {post.published_at ? new Date(post.published_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" }) : ""}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#D4AF37", fontSize: "0.8125rem", fontWeight: 600 }}>
                    Oku <ArrowRight style={{ width: "14px", height: "14px" }} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
