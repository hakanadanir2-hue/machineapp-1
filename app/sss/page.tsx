import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { buildMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import SssClient from "./SssClient";

export async function generateMetadata() {
  return buildMetadata({ settingsKey: "seo_sss", defaultTitle: "Sık Sorulan Sorular — Machine Gym", defaultDesc: "Machine Gym hakkında merak ettiğiniz her şey: üyelik, saatler, hizmetler ve daha fazlası.", path: "/sss" });
}

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
}

const FALLBACK: Faq[] = [
  { id: "1", question: "Machine Gym'e nasıl üye olabilirim?", answer: "Tesisimize gelerek personelimizle görüşebilir ya da web sitemiz üzerinden kayıt formumuzu doldurabilirsiniz.", category: "Üyelik", order_index: 0 },
  { id: "2", question: "Deneme antrenmanı ücretsiz mi?", answer: "Evet, ilk antrenmanınız tamamen ücretsizdir. Randevu formumuzu doldurmanız yeterli.", category: "Üyelik", order_index: 1 },
  { id: "3", question: "Hangi saatlerde açıksınız?", answer: "Hafta içi 06:00-23:00, hafta sonu 08:00-22:00 saatleri arasında hizmet veriyoruz.", category: "Genel", order_index: 2 },
];

export default async function SssPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select("id, question, answer, category, order_index")
    .eq("is_active", true)
    .order("order_index");

  const faqs: Faq[] = (data && data.length > 0) ? data : FALLBACK;

  return (
    <>
      <Navbar />
      <SssClient faqs={faqs} />
      <WhatsAppButton />
      <Footer />
    </>
  );
}
