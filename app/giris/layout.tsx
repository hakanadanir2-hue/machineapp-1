import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş Yap | Machine Gym",
  description: "Machine Gym üye panelinize giriş yapın. Programlarınıza, randevularınıza ve satın alma geçmişinize erişin.",
};

export default function GirisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
