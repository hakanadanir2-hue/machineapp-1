import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beslenme & Fitness Programı Al | Machine Gym",
  description: "Bilimsel temelli kişisel fitness ve beslenme programı. ACSM, NASM ve NSCA prensiplerine dayalı otomatik program oluşturma. Hemen başla.",
};

export default function ProgramAlLayout({ children }: { children: React.ReactNode }) {
  return children;
}
