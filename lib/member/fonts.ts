/**
 * Üye panel font yükleyici.
 * app/uye/layout.tsx içinde bu dosyadan className'leri al ve
 * wrapper div'e ekle: className={`${bebasNeue.variable} ${dmSans.variable}`}
 *
 * Böylece --font-bebas-neue ve --font-dm-sans CSS değişkenleri
 * üye paneli kapsamında kullanılabilir hale gelir.
 */
import { Bebas_Neue, DM_Sans } from "next/font/google";

export const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  display: "swap",
});

export const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});
