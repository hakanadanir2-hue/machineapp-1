import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cartContext";
import AnnouncementBar from "@/components/AnnouncementBar";
import { getSettings, s } from "@/lib/settings";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Machine Gym | Bolu'nun Premium Fitness & Boks Salonu",
    template: "%s | Machine Gym",
  },
  description:
    "Bolu'nun en disiplinli fitness & boks salonu. Kişisel antrenör, boks, kickboks, muay thai dersleri. Bilimsel programlarla hedeflerine ulaş.",
  keywords: [
    "machine gym", "bolu fitness", "bolu spor salonu",
    "boks dersi bolu", "personal trainer bolu", "kickboks muay thai",
  ],
  openGraph: {
    type: "website", locale: "tr_TR", url: "https://machinegym.com.tr",
    siteName: "Machine Gym",
    title: "Machine Gym | Bolu'nun Premium Fitness & Boks Salonu",
    description: "Bolu'nun en disiplinli fitness & boks salonu.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Machine Gym | Bolu",
    description: "Bolu'nun en disiplinli fitness & boks salonu.",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();

  const logoUrl    = s(settings, "logo_url", "");
  const faviconUrl = s(settings, "favicon_url", "/favicon.ico");
  const siteName   = s(settings, "site_name", "Machine Gym");
  const gaId       = s(settings, "google_analytics_id", "");
  const adsId      = s(settings, "google_ads_id", "");
  const gtmId      = s(settings, "gtm_id", "");

  const siteConfig = JSON.stringify({ logoUrl, siteName });

  const gtagIds = [gaId, adsId].filter(Boolean);
  const gtagConfigLines = gtagIds.map(id => `gtag('config','${id}');`).join("");
  const gtagScript = gtagIds.length > 0
    ? `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());${gtagConfigLines}`
    : "";
  const gtmScript = gtmId
    ? `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`
    : "";

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "SportsActivityLocation"],
    name: siteName,
    alternateName: "Machine Gym Bolu",
    description: "Bolu'nun en disiplinli fitness & boks salonu. Kişisel antrenör, boks, kickboks, muay thai dersleri. 600m² modern tesis.",
    url: s(settings, "site_url", "https://www.machinegym.biz"),
    telephone: s(settings, "contact_phone", "+90 374 270 14 55"),
    email: s(settings, "contact_email", "info@machinegym.biz"),
    address: {
      "@type": "PostalAddress",
      streetAddress: s(settings, "contact_address", "Tabaklar Mahallesi, Uygur Sokak No:3"),
      addressLocality: "Bolu Merkez",
      addressRegion: "Bolu",
      postalCode: "14300",
      addressCountry: "TR",
    },
    geo: { "@type": "GeoCoordinates", latitude: 40.7395, longitude: 31.6060 },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "08:00", closes: "23:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "10:00", closes: "23:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Sunday"], opens: "12:00", closes: "20:00" },
    ],
    sameAs: [
      s(settings, "social_instagram", "https://www.instagram.com/gymachinebolu"),
      s(settings, "social_facebook", "https://www.facebook.com/MACHINEGYM"),
    ].filter(Boolean),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Üyelik Paketleri",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Fitness Üyeliği" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Personal Training" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Boks Dersi" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Kickboks" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Muay Thai" } },
      ],
    },
  };

  return (
    <html lang="tr" className={`${inter.variable} ${montserrat.variable}`}>
      <head>
        {/* Favicon */}
        <link rel="icon" href={faviconUrl} />

        {/* Google Tag Manager */}
        {gtmId && (
          <script dangerouslySetInnerHTML={{ __html: gtmScript }} />
        )}

        {/* Google Analytics 4 + Google Ads */}
        {gtagIds.length > 0 && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gtagIds[0]}`} />
            <script dangerouslySetInnerHTML={{ __html: gtagScript }} />
          </>
        )}

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />

        {/* Site config for client components */}
        <script
          id="__site_config"
          type="application/json"
          dangerouslySetInnerHTML={{ __html: siteConfig }}
        />
      </head>
      <body className="min-h-screen bg-dark text-white antialiased">
        {/* GTM noscript fallback */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0" width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <CartProvider>
          <AnnouncementBar />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
