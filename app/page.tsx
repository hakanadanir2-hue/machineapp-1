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
import { breadcrumbSchema, faqSchema, BASE_URL } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = s(settings, "default_meta_title", "Machine Gym – Bolu'nun Premium Fitness & Boks Merkezi");
  const description = s(settings, "default_meta_description", "Bolu merkezde Machine Gym: fitness, personal trainer, boks, kickboks ve muay thai. 600 m² modern tesis. İlk antrenman ücretsiz.");
  return {
    title,
    description,
    keywords: ["machine gym", "bolu spor salonu", "bolu fitness", "bolu boks", "bolu personal trainer", "bolu kickboks", "bolu muay thai", "machine gym bolu"],
    alternates: { canonical: BASE_URL },
    openGraph: {
      title: s(settings, "default_meta_title", "Machine Gym – Makine Gibi Çalış. Sonuç Kaçınılmaz."),
      description,
      url: BASE_URL,
      siteName: "Machine Gym",
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const HOME_FAQ = [
  { question: "Machine Gym Bolu'da nerede?", answer: "Machine Gym, Bolu Merkez Tabaklar Mahallesi Uygur Sokak No:3 adresinde yer almaktadır." },
  { question: "Machine Gym'in çalışma saatleri nedir?", answer: "Pazartesi–Cuma 08:00–23:00, Cumartesi 10:00–23:00, Pazar 12:00–20:00 saatleri arasında hizmet vermektedir." },
  { question: "Machine Gym'de hangi branşlar var?", answer: "Fitness üyeliği, personal training, boks özel dersi, kickboks ve muay thai branşlarında profesyonel eğitim sunulmaktadır." },
  { question: "İlk antrenman ücretsiz mi?", answer: "Evet, Machine Gym'de ilk deneme antrenmanı tamamen ücretsizdir. Randevu alarak ziyaret edebilirsiniz." },
  { question: "Machine Gym telefon numarası nedir?", answer: "Machine Gym'e +90 374 270 14 55 numaralı telefondan ulaşabilirsiniz." },
];

export default async function Home() {
  const [settings, supabase] = await Promise.all([getSettings(), createClient()]);
  const [{ data: heroMedia }, { data: heroSetting }] = await Promise.all([
    supabase.from("hero_media").select("id,type,url,order_index").eq("is_active", true).order("order_index"),
    supabase.from("site_settings").select("value").eq("key", "hero_slideshow_interval").single(),
  ]);

  const faqJsonLd = faqSchema(HOME_FAQ);
  const breadcrumbJsonLd = breadcrumbSchema([{ name: "Ana Sayfa", url: BASE_URL }]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
        <HomeStats
          members={s(settings, "about_members", "500+")}
          years={s(settings, "about_years", "10+")}
          trainers={s(settings, "about_trainers", "3")}
        />
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
