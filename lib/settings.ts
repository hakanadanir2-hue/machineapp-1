import { createBrowserClient } from "@supabase/ssr";

export type SiteSettings = Record<string, string>;

export async function getSettings(): Promise<SiteSettings> {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase.from("site_settings").select("key,value");
    if (!data) return {};
    return Object.fromEntries(
      data.map((r: { key: string; value: string }) => [r.key, r.value ?? ""])
    );
  } catch {
    return {};
  }
}

export function s(settings: SiteSettings, key: string, fallback = ""): string {
  return settings[key] || fallback;
}
