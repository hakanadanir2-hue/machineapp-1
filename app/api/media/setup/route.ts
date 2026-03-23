import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(_req: NextRequest) {
  const userClient = await createClient();
  const { data: { session } } = await userClient.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let admin;
  try {
    admin = createAdminClient();
  } catch (e: unknown) {
    return NextResponse.json({
      error: "Service role key gerekli",
      hint: "Supabase Dashboard → Settings → API → service_role key'i .env.local dosyasına SUPABASE_SERVICE_ROLE_KEY olarak ekleyin",
      details: e instanceof Error ? e.message : String(e),
    }, { status: 503 });
  }

  // Create gallery bucket if not exists
  const { data: buckets } = await admin.storage.listBuckets();
  const exists = buckets?.some(b => b.id === "gallery");

  if (!exists) {
    const { error } = await admin.storage.createBucket("gallery", {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"],
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Upsert RLS policies via SQL (best effort)
  try {
    await admin.rpc("exec_sql", {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'gallery_public_read' AND tablename = 'objects') THEN
            CREATE POLICY "gallery_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'gallery_auth_insert' AND tablename = 'objects') THEN
            CREATE POLICY "gallery_auth_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'gallery_auth_delete' AND tablename = 'objects') THEN
            CREATE POLICY "gallery_auth_delete" ON storage.objects FOR DELETE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');
          END IF;
        END $$;
      `,
    });
  } catch {
    // exec_sql might not exist — skip, policies can be set manually
  }

  return NextResponse.json({ ok: true, message: exists ? "Bucket zaten mevcut" : "Bucket oluşturuldu" });
}
