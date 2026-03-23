import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VKİ Hesaplama – Vücut Kitle İndeksi | Machine Gym",
  description: "Vücut kitle indeksinizi hesaplayın. Boy ve kilonuza göre BMI değerinizi öğrenin, ideal kilonuzu belirleyin. Bolu Machine Gym ücretsiz sağlık aracı.",
};

export default function BKILayout({ children }: { children: React.ReactNode }) {
  return children;
}
