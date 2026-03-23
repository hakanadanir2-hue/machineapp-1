import { getSettings, s } from "@/lib/settings";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://machinegym.biz";

interface SeoPageConfig {
  settingsKey: string;
  defaultTitle: string;
  defaultDesc: string;
  path: string;
}

export async function buildMetadata(config: SeoPageConfig): Promise<Metadata> {
  const settings = await getSettings();
  const prefix = config.settingsKey;

  const title = s(settings, `${prefix}_title`, config.defaultTitle);
  const desc = s(settings, `${prefix}_desc`, config.defaultDesc);
  const ogTitle = s(settings, `${prefix}_og_title`, title);
  const ogDesc = s(settings, `${prefix}_og_desc`, desc);
  const ogImage = s(settings, `${prefix}_og_image`, s(settings, "seo_og_image", `${BASE_URL}/og-default.jpg`));
  const noindex = s(settings, `${prefix}_noindex`, "false") === "true";

  return {
    title,
    description: desc,
    robots: noindex ? "noindex,nofollow" : "index,follow",
    alternates: { canonical: `${BASE_URL}${config.path}` },
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      url: `${BASE_URL}${config.path}`,
      siteName: "Machine Gym",
      locale: "tr_TR",
      type: "website",
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDesc,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}
