import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cartContext";
import AnnouncementBar from "@/components/AnnouncementBar";

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
    "machine gym",
    "bolu fitness",
    "bolu spor salonu",
    "boks dersi bolu",
    "personal trainer bolu",
    "kickboks muay thai",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://machinegym.com.tr",
    siteName: "Machine Gym",
    title: "Machine Gym | Bolu'nun Premium Fitness & Boks Salonu",
    description: "Bolu'nun en disiplinli fitness & boks salonu.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Machine Gym | Bolu",
    description: "Bolu'nun en disiplinli fitness & boks salonu.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-screen bg-dark text-white antialiased">
        <CartProvider>
          <AnnouncementBar />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
