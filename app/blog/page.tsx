export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { buildMetadata } from "@/lib/seo";
import BlogClient from "./BlogClient";

export async function generateMetadata() {
  return buildMetadata({ settingsKey: "seo_blog", defaultTitle: "Blog — Machine Gym | Fitness & Boks Yazıları", defaultDesc: "Fitness, boks, beslenme ve sağlıklı yaşam üzerine uzman içerikler. Machine Gym Bolu.", path: "/blog" });
}

const PLACEHOLDER_POSTS = [
  { id: "1", slug: "#", title: "Yağ Yakarken Kas Kaybetmemek: Bilimsel Rehber", excerpt: "Kalori açığında antrenman yaparken kas kitlesini korumanın en etkili yolları.", cover_image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80", tags: ["Fitness", "Beslenme"], published_at: "2025-03-01T09:00:00Z" },
  { id: "2", slug: "#", title: "Boks Antrenmanının 7 Hayat Değiştiren Faydası", excerpt: "Fiziksel kondisyonun ötesinde: özgüven, stres yönetimi ve zihinsel odak.", cover_image: "https://images.unsplash.com/photo-1549476464-37392f717541?w=600&q=80", tags: ["Boks", "Motivasyon"], published_at: "2025-02-15T09:00:00Z" },
  { id: "3", slug: "#", title: "Kas Kazanımı için Protein: Doğru Miktar ve Zamanlama", excerpt: "Günde kaç gram protein almanız gerekiyor? Araştırmalara dayalı net cevaplar.", cover_image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80", tags: ["Beslenme", "Kas Kazanımı"], published_at: "2025-02-01T09:00:00Z" },
  { id: "4", slug: "#", title: "Progressif Overload: İlerlemenin Tek Sırrı", excerpt: "Neden bazı insanlar yıllarca antrenman yapıp değişmez?", cover_image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80", tags: ["Antrenman", "Fitness"], published_at: "2025-01-20T09:00:00Z" },
  { id: "5", slug: "#", title: "Supplementsiz Doğal Gelişim Mümkün mü?", excerpt: "Kreatin, protein tozu, BCAA gerçekten gerekli mi?", cover_image: "https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?w=600&q=80", tags: ["Supplement", "Beslenme"], published_at: "2025-01-10T09:00:00Z" },
  { id: "6", slug: "#", title: "Muay Thai Başlangıç Rehberi: İlk 3 Ay", excerpt: "Muay Thai'ye başlamak isteyenler için temel teknikler ve öneriler.", cover_image: "https://images.unsplash.com/photo-1604480132736-44c188fe4d20?w=600&q=80", tags: ["Muay Thai", "Başlangıç"], published_at: "2024-12-28T09:00:00Z" },
];

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: postsFromDb } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image, tags, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  const posts = postsFromDb && postsFromDb.length > 0
    ? postsFromDb.map((p: Record<string, unknown>) => ({
        id: String(p.id ?? ""),
        slug: String(p.slug ?? ""),
        title: String(p.title ?? ""),
        excerpt: p.excerpt ? String(p.excerpt) : undefined,
        cover_image: p.cover_image ? String(p.cover_image) : undefined,
        published_at: p.published_at ? String(p.published_at) : undefined,
        tags: Array.isArray(p.tags)
          ? p.tags
          : typeof p.tags === "string" && p.tags
          ? p.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
          : [],
      }))
    : PLACEHOLDER_POSTS;
  const isPlaceholder = !postsFromDb || postsFromDb.length === 0;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0B0B0B" }}>
        <div style={{ paddingTop: "96px", paddingBottom: "3.5rem", background: "linear-gradient(to bottom, #111111, #0B0B0B)", borderBottom: "1px solid rgba(106,13,37,0.15)" }}>
          <div className="page-container" style={{ textAlign: "center" }}>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Bilgi Merkezi</p>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)", marginBottom: "1rem" }}>Blog</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", maxWidth: "32rem", marginInline: "auto", lineHeight: 1.7 }}>
              Fitness, boks, beslenme ve sağlıklı yaşam üzerine uzman içerikler.
            </p>
          </div>
        </div>
        <BlogClient posts={posts} isPlaceholder={isPlaceholder} />
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}
