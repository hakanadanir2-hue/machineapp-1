import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const BUCKET = "gallery";

type AdminClient = ReturnType<typeof createAdminClient>;

async function ensureBucket(admin: AdminClient): Promise<void> {
  const { data: buckets } = await admin.storage.listBuckets();
  const exists = buckets?.some(b => b.id === BUCKET);
  const config = {
    public: true,
    fileSizeLimit: 524288000, // 500MB — effectively unlimited
  };
  if (!exists) {
    const { error } = await admin.storage.createBucket(BUCKET, config);
    if (error && !error.message.includes("already")) {
      throw new Error(`Bucket oluşturulamadı: ${error.message}`);
    }
  } else {
    await admin.storage.updateBucket(BUCKET, config).catch(() => null);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  const rawFolder = (formData.get("folder") as string | null) ?? "";
  const folder = rawFolder.replace(/[^a-z0-9_-]/gi, "").slice(0, 40);

  if (!files.length) {
    return NextResponse.json({ error: "Dosya seçilmedi" }, { status: 400 });
  }

  let admin: AdminClient;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json(
      { error: `Sunucu hatası: ${e instanceof Error ? e.message : "SUPABASE_SERVICE_ROLE_KEY eksik"}` },
      { status: 503 }
    );
  }

  try {
    await ensureBucket(admin);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Bucket hazırlanamadı" },
      { status: 500 }
    );
  }

  const results: { name: string; url: string; error?: string }[] = [];

  for (const file of files) {
    const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();
    const path = `${folder ? folder + "/" : ""}${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type || "application/octet-stream", upsert: false, cacheControl: "3600" });

    if (upErr) {
      if (upErr.message.includes("Bucket not found") || upErr.message.includes("bucket")) {
        await ensureBucket(admin).catch(() => null);
        const { error: retryErr } = await admin.storage
          .from(BUCKET)
          .upload(path, buffer, { contentType: file.type || "application/octet-stream", upsert: true, cacheControl: "3600" });
        if (retryErr) { results.push({ name: file.name, url: "", error: retryErr.message }); continue; }
      } else {
        results.push({ name: file.name, url: "", error: upErr.message });
        continue;
      }
    }

    const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path);
    results.push({ name: path, url: publicUrl });
  }

  return NextResponse.json({ results });
}
