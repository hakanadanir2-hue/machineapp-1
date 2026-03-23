export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { BookOpen, ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata({ settingsKey: "seo_blog", defaultTitle: "Blog — Machine Gym | Fitness & Boks Yazıları", defaultDesc: "Fitness, boks, beslenme ve sağlıklı yaşam üzerine uzman içerikler. Machine Gym Bolu.", path: "/blog" });
}

const PLACEHOLDER_POSTS = [
  {
    id: "1",
    slug: "#",
    title: "Yağ Yakarken Kas Kaybetmemek: Bilimsel Rehber",
    excerpt: "Kalori açığında antrenman yaparken kas kitlesini korumanın en etkili yolları. ACSM protokolleri ve pratik öneriler.",
    cover_image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
    tags: ["Fitness", "Beslenme"],
    published_at: "2025-03-01T09:00:00Z",
  },
  {
    id: "2",
    slug: "#",
    title: "Boks Antrenmanının 7 Hayat Değiştiren Faydası",
    excerpt: "Fiziksel kondisyonun ötesinde: özgüven, stres yönetimi ve zihinsel odak. Boks sporu hem bedeni hem zihni dönüştürür.",
    cover_image: "https://images.unsplash.com/photo-1549476464-37392f717541?w=600&q=80",
    tags: ["Boks", "Motivasyon"],
    published_at: "2025-02-15T09:00:00Z",
  },
  {
    id: "3",
    slug: "#",
    title: "Kas Kazanımı için Protein: Doğru Miktar ve Zamanlama",
    excerpt: "Günde kaç gram protein almanız gerekiyor? Antrenman sonrası pencere gerçek mi? Araştırmalara dayalı net cevaplar.",
    cover_image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
    tags: ["Beslenme", "Kas Kazanımı"],
    published_at: "2025-02-01T09:00:00Z",
  },
  {
    id: "4",
    slug: "#",
    title: "Progressif Overload: İlerlemenin Tek Sırrı",
    excerpt: "Neden bazı insanlar yıllarca antrenman yapıp değişmez? Progressif overload prensibini doğru uygulamanın yolu.",
    cover_image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
    tags: ["Antrenman", "Fitness"],
    published_at: "2025-01-20T09:00:00Z",
  },
  {
    id: "5",
    slug: "#",
    title: "Supplementsiz Doğal Gelişim Mümkün mü?",
    excerpt: "Kreatin, protein tozu, BCAA gerçekten gerekli mi? Supplement endüstrisinin söylemedikleri ve bilimsel gerçekler.",
    cover_image: "https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?w=600&q=80",
    tags: ["Supplement", "Beslenme"],
    published_at: "2025-01-10T09:00:00Z",
  },
  {
    id: "6",
    slug: "#",
    title: "Muay Thai Başlangıç Rehberi: İlk 3 Ay",
    excerpt: "Muay Thai'ye başlamak isteyenler için temel teknikler, antrenman sıklığı ve ilk dönemde yapılan en yaygın hatalar.",
    cover_image: "https://images.unsplash.com/photo-1604480132736-44c188fe4d20?w=600&q=80",
    tags: ["Muay Thai", "Başlangıç"],
    published_at: "2024-12-28T09:00:00Z",
  },
];

const ALL_TAGS = ["Tümü", "Fitness", "Boks", "Muay Thai", "Beslenme", "Antrenman", "Motivasyon"];

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: postsFromDb } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image, tags, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  const posts = postsFromDb && postsFromDb.length > 0 ? postsFromDb : PLACEHOLDER_POSTS;
  const isPlaceholder = !postsFromDb || postsFromDb.length === 0;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0B0B0B" }}>

        {/* Page Hero */}
        <div style={{ paddingTop: "96px", paddingBottom: "3.5rem", background: "linear-gradient(to bottom, #111111, #0B0B0B)", borderBottom: "1px solid rgba(106,13,37,0.15)" }}>
          <div className="page-container" style={{ textAlign: "center" }}>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Bilgi Merkezi</p>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)", marginBottom: "1rem" }}>Blog</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", maxWidth: "32rem", marginInline: "auto", lineHeight: 1.7 }}>
              Fitness, boks, beslenme ve sağlıklı yaşam üzerine uzman içerikler.
            </p>
          </div>
        </div>

        <div className="page-container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>

          {isPlaceholder && (
            <div style={{ marginBottom: "2rem", padding: "0.875rem 1.25rem", background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <BookOpen style={{ width: "16px", height: "16px", color: "#D4AF37", flexShrink: 0 }} />
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem" }}>Örnek içerikler gösteriliyor. Admin panelinden gerçek yazılar ekleyebilirsiniz.</p>
            </div>
          )}

          {/* Tag Filter - decorative (server-side all shown) */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
            {ALL_TAGS.map(tag => (
              <span
                key={tag}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: "9999px",
                  fontSize: "0.8125rem",
                  fontWeight: tag === "Tümü" ? 700 : 500,
                  background: tag === "Tümü" ? "#6A0D25" : "transparent",
                  color: tag === "Tümü" ? "#fff" : "rgba(255,255,255,0.5)",
                  border: `1px solid ${tag === "Tümü" ? "rgba(212,175,55,0.35)" : "#2A2A2A"}`,
                  cursor: "default",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Posts Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {posts.map((post) => (
              <Link
                key={post.id}
                href={post.slug === "#" ? "/blog" : `/blog/${post.slug}`}
                style={{ textDecoration: "none", display: "flex", flexDirection: "column", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "20px", overflow: "hidden", transition: "border-color 0.2s" }}
                className="blog-card"
              >
                <style>{`.blog-card:hover { border-color: rgba(106,13,37,0.5) !important; }`}</style>

                {/* Cover */}
                <div style={{ position: "relative", height: "200px", overflow: "hidden", flexShrink: 0 }}>
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                      className="blog-img"
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BookOpen style={{ width: "2.5rem", height: "2.5rem", color: "#3A3A3A" }} />
                    </div>
                  )}
                  <style>{`.blog-card:hover .blog-img { transform: scale(1.04); }`}</style>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,26,26,0.7), transparent 60%)" }} />
                  {/* Tags overlay */}
                  {post.tags && post.tags.length > 0 && (
                    <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                      {(post.tags as string[]).slice(0, 2).map((tag: string) => (
                        <span key={tag} style={{ padding: "0.2rem 0.625rem", background: "rgba(106,13,37,0.85)", color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, borderRadius: "9999px", backdropFilter: "blur(4px)" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Content */}
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
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}
