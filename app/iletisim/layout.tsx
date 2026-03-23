import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim | Machine Gym Bolu",
  description: "Machine Gym ile iletişime geçin. Adres: Bolu Tabaklar Mah. Uygur Sok. No:3. Tel: 0374 270 14 55. WhatsApp ile anında yanıt.",
};

export default function IletisimLayout({ children }: { children: React.ReactNode }) {
  return children;
}
