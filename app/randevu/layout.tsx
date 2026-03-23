import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Randevu Al | Machine Gym Bolu",
  description: "Machine Gym'de deneme antrenmanı veya üyelik görüşmesi için randevu alın. Hafta içi 08:00–01:00, Cumartesi 10:00–01:00, Pazar 12:00–20:00.",
};

export default function RandevuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
