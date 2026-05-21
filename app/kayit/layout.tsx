import type { Metadata } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://machinegym.biz";

export const metadata: Metadata = {
  title: "Üye Ol — Machine Gym | Bolu Spor Salonu Kayıt",
  description: "Machine Gym Bolu'ya online üye olun. Fitness, personal trainer, boks ve kickboks programlarına erişin. Hızlı kayıt, anında başla.",
  alternates: { canonical: `${BASE}/kayit` },
  robots: "noindex,nofollow",
};

export default function KayitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
