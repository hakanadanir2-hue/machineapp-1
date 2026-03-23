export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://machinegym.com.tr";
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, published_at")
    .eq("published", true);

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/hizmetler`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/fiyatlar`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/program-al`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/randevu`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/iletisim`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
  ];

  const blogPages: MetadataRoute.Sitemap = posts?.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.published_at ? new Date(post.published_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  })) || [];

  return [...staticPages, ...blogPages];
}
