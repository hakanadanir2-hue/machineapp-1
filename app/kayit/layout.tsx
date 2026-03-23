import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Üye Ol | Machine Gym Bolu",
  description: "Machine Gym'e üye olun. Fitness programları, boks dersleri ve kişisel antrenör hizmetlerine erişin.",
};

export default function KayitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
