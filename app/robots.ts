import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://machinegym.biz";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/api/", "/uye/", "/odeme/", "/sepet/", "/kayit/", "/giris/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/hizmetler", "/fiyatlar", "/hakkimizda", "/iletisim", "/sss", "/blog/", "/randevu", "/program-al", "/bki"],
        disallow: ["/admin/", "/dashboard/", "/api/", "/uye/", "/odeme/"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/hizmetler", "/fiyatlar", "/hakkimizda", "/iletisim", "/sss", "/blog/", "/randevu", "/program-al", "/bki"],
        disallow: ["/admin/", "/dashboard/", "/api/", "/uye/", "/odeme/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/hizmetler", "/fiyatlar", "/hakkimizda", "/iletisim", "/sss", "/blog/", "/randevu", "/program-al", "/bki"],
        disallow: ["/admin/", "/dashboard/", "/api/", "/uye/", "/odeme/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/hizmetler", "/fiyatlar", "/hakkimizda", "/iletisim", "/sss", "/blog/", "/randevu", "/program-al", "/bki"],
        disallow: ["/admin/", "/dashboard/", "/api/", "/uye/", "/odeme/"],
      },
      {
        userAgent: "Claude-Web",
        allow: ["/", "/hizmetler", "/fiyatlar", "/hakkimizda", "/iletisim", "/sss", "/blog/", "/randevu", "/program-al", "/bki"],
        disallow: ["/admin/", "/dashboard/", "/api/", "/uye/", "/odeme/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
