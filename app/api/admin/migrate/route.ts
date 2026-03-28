import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const admin = createAdminClient();

    const results: string[] = [];

    // 1. Create orders table
    const { error: e1 } = await admin.from("orders").select("id").limit(1);
    if (e1?.code === "42P01") {
      results.push("orders tablosu oluşturulacak — SQL Editor'da çalıştırın");
    } else {
      results.push("orders: " + (e1 ? e1.message : "OK"));
    }

    // 2. Check products
    const { data: prods, error: e2 } = await admin.from("products").select("id").limit(1);
    results.push("products: " + (e2 ? e2.message : `OK (${prods?.length ?? 0} rows)`));

    // 3. Insert sample products if empty
    const { count } = await admin.from("products").select("*", { count: "exact", head: true });
    if ((count ?? 0) === 0) {
      const { error: eInsert } = await admin.from("products").insert([
        { name: "Machine Gym Boks Eldiveni", slug: "machine-gym-boks-eldiveni", sku: "MG-ELD-001", category: "Boks Eldiveni", short_description: "Premium deri boks eldiveni 12oz", price: 850, stock: 15, is_featured: true, is_new: true, is_active: true, order_index: 1 },
        { name: "Machine Gym Tişört", slug: "machine-gym-tisort", sku: "MG-TST-001", category: "Tişört", short_description: "Nefes alabilir spor tişört", price: 350, stock: 30, is_featured: true, is_new: false, is_active: true, order_index: 2 },
        { name: "Machine Gym Hoodie", slug: "machine-gym-hoodie", sku: "MG-HOD-001", category: "Hoodie", short_description: "Ağır kumaş premium hoodie", price: 650, stock: 20, is_featured: true, is_new: true, is_active: true, order_index: 3 },
        { name: "Boks Bandajı", slug: "boks-bandaji", sku: "MG-BAN-001", category: "Bandaj", short_description: "4.5m elastik boks bandajı", price: 120, stock: 50, is_featured: false, is_new: false, is_active: true, order_index: 4 },
        { name: "Machine Gym Şort", slug: "machine-gym-sort", sku: "MG-SRT-001", category: "Şort", short_description: "Rahat kesim antrenman şortu", price: 280, stock: 25, is_featured: false, is_new: true, is_active: true, order_index: 5 },
      ]);
      results.push("products insert: " + (eInsert ? eInsert.message : "5 örnek ürün eklendi"));
    } else {
      results.push(`products zaten dolu: ${count} ürün`);
    }

    // 4. SEO settings defaults
    const seoDefaults = [
      { key: "seo_home_title", value: "Machine Gym Bolu | Fitness & Boks Salonu" },
      { key: "seo_home_desc", value: "Bolu'nun en premium fitness ve boks salonu." },
      { key: "seo_og_image", value: "" },
      { key: "seo_blog_title", value: "Blog | Machine Gym Bolu" },
      { key: "seo_services_title", value: "Hizmetlerimiz | Machine Gym Bolu" },
      { key: "seo_pricing_title", value: "Fiyatlar & Üyelik Paketleri | Machine Gym" },
      { key: "seo_shop_title", value: "Mağaza | Machine Gym — Boks & Fitness Ekipmanları" },
      { key: "seo_contact_title", value: "İletişim | Machine Gym Bolu" },
      { key: "seo_about_title", value: "Hakkımızda | Machine Gym Bolu" },
    ];
    for (const s of seoDefaults) {
      await admin.from("site_settings").upsert(s, { onConflict: "key", ignoreDuplicates: true });
    }
    results.push("seo_settings: defaults upserted");

    // 5. Gallery bucket public policy check
    const { data: buckets } = await admin.storage.listBuckets();
    const gallery = buckets?.find(b => b.id === "gallery");
    results.push("gallery bucket: " + (gallery ? `public=${gallery.public}` : "YOK — oluşturulacak"));

    if (!gallery) {
      const { error: be } = await admin.storage.createBucket("gallery", {
        public: true,
        fileSizeLimit: 10485760,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"],
      });
      results.push("gallery create: " + (be ? be.message : "oluşturuldu"));
    }

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
