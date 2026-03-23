import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mağaza – Machine Gym Ürünleri",
  description: "Machine Gym markalı spor ürünleri. Boks eldiveni, tişört, hoodie, şort ve aksesuarlar. Kaliteli spor ekipmanları Bolu'dan.",
};

export default function MagazaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
