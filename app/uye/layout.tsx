/**
 * Üye bölümü Server Layout wrapper — fontları yükler ve CSS değişkenlerini atar.
 * İçerideki client layout (UyeShell) auth ve navigation mantığını yönetir.
 */
import { Bebas_Neue, DM_Sans } from "next/font/google";
import UyeShell from "./UyeShell";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export default function UyeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <UyeShell>{children}</UyeShell>
    </div>
  );
}
