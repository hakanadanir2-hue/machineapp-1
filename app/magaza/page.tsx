import { createClient } from "@/lib/supabase/server";
import MagazaClient from "./MagazaClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const revalidate = 60;

export default async function MagazaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id,name,slug,price,discounted_price,category,stock,is_featured,is_active,images")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  const products = (data ?? []).map((p) => ({
    ...p,
    image_url: Array.isArray(p.images) && p.images.length > 0 ? String(p.images[0]) : null,
  }));

  return (
    <>
      <Navbar />
      <MagazaClient products={products} />
      <WhatsAppButton />
      <Footer />
    </>
  );
}
