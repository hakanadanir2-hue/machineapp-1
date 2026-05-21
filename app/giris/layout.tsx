import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş Yap — Machine Gym",
  description: "Machine Gym üye panelinize giriş yapın.",
  robots: "noindex,nofollow",
};

export default function GirisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
