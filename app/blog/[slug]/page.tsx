export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { sanitizeHtml } from "@/lib/sanitize";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag, Clock } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title, seo_title, seo_description, excerpt, cover_image")
    .eq("slug", slug)
    .single();
  if (!data) return {};
  return {
    title: `${data.seo_title || data.title} — Machine Gym Blog`,
    description: data.seo_description || data.excerpt || "",
    openGraph: {
      title: data.seo_title || data.title,
      description: data.seo_description || data.excerpt || "",
      images: data.cover_image ? [data.cover_image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "100vh", background: "#0B0B0B", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <Clock style={{ width: 48, height: 48, color: "#D4AF37", marginBottom: "1.5rem", margin: "0 auto 1.5rem" }} />
            <p style={{ color: "#D4AF37", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Yakında</p>
            <h1 style={{ color: "#fff", fontSize: "1.75rem", fontWeight: 800, fontFamily: "var(--font-heading)", marginBottom: "1rem" }}>Bu Yazı Hazırlanıyor</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem", marginBottom: "2rem", maxWidth: "400px" }}>
              Bu içerik yakında yayında olacak. Blog yazılarımızı takip etmeye devam edin.
            </p>
            <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.75rem", background: "#6A0D25", color: "#fff", fontWeight: 700, fontSize: "0.9375rem", borderRadius: "12px", textDecoration: "none" }}>
              <ArrowLeft style={{ width: 16, height: 16 }} /> Blog&apos;a Dön
            </Link>
          </div>
        </main>
        <WhatsAppButton />
        <Footer />
      </>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image,
    datePublished: post.published_at,
    author: { "@type": "Organization", name: "Machine Gym" },
    publisher: { "@type": "Organization", name: "Machine Gym", url: "https://machinegym.com.tr" },
  };

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main style={{ minHeight: "100vh", background: "#0B0B0B" }}>

        {/* Cover */}
        {post.cover_image && (
          <div style={{ position: "relative", height: "400px", overflow: "hidden" }}>
            <img src={post.cover_image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(11,11,11,0.3), rgba(11,11,11,0.85))" }} />
            {/* Back link over image */}
            <div style={{ position: "absolute", top: "80px", left: 0, right: 0 }}>
              <div className="page-container">
                <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.7)", fontSize: "0.8125rem", textDecoration: "none", padding: "0.375rem 0.875rem", background: "rgba(0,0,0,0.4)", borderRadius: "8px", backdropFilter: "blur(8px)" }}>
                  <ArrowLeft style={{ width: "14px", height: "14px" }} /> Blog&apos;a Dön
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="page-container" style={{ paddingTop: post.cover_image ? "0" : "100px", paddingBottom: "5rem" }}>
          <article style={{ maxWidth: "720px", marginInline: "auto" }}>

            {/* Header */}
            <div style={{ paddingTop: "2.5rem", marginBottom: "2.5rem" }}>
              {!post.cover_image && (
                <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem", textDecoration: "none", marginBottom: "1.5rem" }}>
                  <ArrowLeft style={{ width: "14px", height: "14px" }} /> Blog&apos;a Dön
                </Link>
              )}

              {post.tags && post.tags.length > 0 && (
                <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                  {(post.tags as string[]).map((tag: string) => (
                    <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.75rem", background: "rgba(106,13,37,0.25)", color: "#D4AF37", fontSize: "0.75rem", fontWeight: 600, borderRadius: "9999px", border: "1px solid rgba(106,13,37,0.4)" }}>
                      <Tag style={{ width: "11px", height: "11px" }} /> {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)", lineHeight: 1.25, marginBottom: "1rem" }}>{post.title}</h1>

              {post.excerpt && (
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.0625rem", lineHeight: 1.65, borderLeft: "3px solid #6A0D25", paddingLeft: "1rem", marginBottom: "1rem" }}>{post.excerpt}</p>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.3)", fontSize: "0.8125rem" }}>
                <Calendar style={{ width: "14px", height: "14px" }} />
                <span>
                  {post.published_at ? new Date(post.published_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" }) : ""}
                </span>
                <span style={{ margin: "0 0.25rem" }}>·</span>
                <span>Machine Gym</span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: "#2A2A2A", marginBottom: "2.5rem" }} />

            {/* Content */}
            <div
              style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9375rem", lineHeight: 1.8 }}
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content || "") }}
            />

            <style>{`
              .blog-content h2 { color: #fff; font-size: 1.375rem; font-weight: 700; margin: 2rem 0 0.875rem; font-family: var(--font-heading); }
              .blog-content h3 { color: #fff; font-size: 1.125rem; font-weight: 700; margin: 1.5rem 0 0.75rem; }
              .blog-content p { margin-bottom: 1.25rem; }
              .blog-content strong { color: #D4AF37; }
              .blog-content a { color: #D4AF37; text-decoration: underline; }
              .blog-content ul, .blog-content ol { padding-left: 1.5rem; margin-bottom: 1.25rem; }
              .blog-content li { margin-bottom: 0.375rem; }
              .blog-content blockquote { border-left: 3px solid #6A0D25; padding-left: 1rem; color: rgba(255,255,255,0.6); font-style: italic; margin: 1.5rem 0; }
            `}</style>

            {/* Bottom CTA */}
            <div style={{ marginTop: "3.5rem", background: "rgba(106,13,37,0.08)", border: "1px solid rgba(106,13,37,0.2)", borderRadius: "20px", padding: "2rem", textAlign: "center" }}>
              <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.625rem" }}>Machine Gym&apos;de Antrenman Yap</p>
              <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", fontFamily: "var(--font-heading)", marginBottom: "0.625rem" }}>
                Okuduğunu Pratiğe Dönüştür
              </h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Uzman kadromuzla hedeflerine ulaşmaya bugün başla. İlk deneme ücretsiz.</p>
              <Link href="/randevu" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 2rem", background: "#6A0D25", color: "#fff", fontWeight: 700, fontSize: "0.9375rem", borderRadius: "12px", border: "1px solid rgba(212,175,55,0.3)", textDecoration: "none" }}>
                Deneme Antrenmanı Al
              </Link>
            </div>
          </article>
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}
