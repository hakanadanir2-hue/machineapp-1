import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Hero from "@/components/sections/Hero";
import HomeStats from "@/components/sections/HomeStats";
import HomeServices from "@/components/sections/HomeServices";
import HomeWhyUs from "@/components/sections/HomeWhyUs";
import HomePricingPreview from "@/components/sections/HomePricingPreview";
import HomeFAQ from "@/components/sections/HomeFAQ";
import HomeFinalCTA from "@/components/sections/HomeFinalCTA";
import { getSettings, s } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: s(settings, "default_meta_title", "Machine Gym – Bolu'nun Premium Fitness & Boks Merkezi"),
    description: s(settings, "default_meta_description", "Bolu İzzet Baysal Caddesi'ndeki Machine Gym ile hedeflerine ulaş. Fitness, personal trainer, boks, kickboks ve muay thai."),
    openGraph: {
      title: s(settings, "default_meta_title", "Machine Gym – Makine Gibi Çalış. Sonuç Kaçınılmaz."),
      description: s(settings, "default_meta_description", "Bolu'nun en premium fitness ve boks merkezi."),
      url: "https://machinegym.com.tr",
      siteName: "Machine Gym",
      locale: "tr_TR",
      type: "website",
    },
  };
}

export default async function Home() {
  const [settings, supabase] = await Promise.all([getSettings(), createClient()]);
  const [{ data: heroMedia }, { data: heroSetting }] = await Promise.all([
    supabase.from("hero_media").select("id,type,url,order_index").eq("is_active", true).order("order_index"),
    supabase.from("site_settings").select("value").eq("key", "hero_slideshow_interval").single(),
  ]);
  return (
    <>
      <Navbar />
      <main>
        <Hero
          title={s(settings, "hero_title")}
          subtitle={s(settings, "hero_subtitle")}
          btn1={s(settings, "hero_btn1")}
          btn2={s(settings, "hero_btn2")}
          bgImage={s(settings, "hero_bg_image")}
          whatsapp={s(settings, "contact_whatsapp")}
          initialMedia={(heroMedia ?? []) as { id: string; type: "photo" | "youtube"; url: string; order_index: number }[]}
          initialInterval={parseInt(heroSetting?.value ?? "3000") || 3000}
        />
        <HomeStats />
        <HomeServices />
        <HomeWhyUs />
        <HomePricingPreview />
        <HomeFAQ />
        <HomeFinalCTA />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
