import type { Metadata } from "next";
import { breadcrumbSchema, BASE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Online Fitness & Beslenme Programı Al — Machine Gym Bolu",
  description: "Machine Gym uzman eğitmenlerinden bilimsel temelli kişisel fitness ve beslenme programı alın. ACSM, NASM prensiplerine dayalı. Online teslim.",
  keywords: ["online fitness programı bolu", "kişisel antrenman programı", "online beslenme programı", "machine gym program"],
  alternates: { canonical: `${BASE_URL}/program-al` },
  openGraph: {
    title: "Online Fitness & Beslenme Programı — Machine Gym Bolu",
    description: "Bilimsel temelli kişisel fitness ve beslenme programı.",
    url: `${BASE_URL}/program-al`,
    siteName: "Machine Gym",
    locale: "tr_TR",
    type: "website",
  },
};

const breadcrumbJsonLd = breadcrumbSchema([
  { name: "Ana Sayfa", url: BASE_URL },
  { name: "Program Al", url: `${BASE_URL}/program-al` },
]);

export default function ProgramAlLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {children}
    </>
  );
}
