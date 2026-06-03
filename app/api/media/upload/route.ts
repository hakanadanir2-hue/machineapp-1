import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const BUCKET = "gallery";
const ALLOWED_MIME = [
  "image/jpeg","image/png","image/webp","image/gif","image/svg+xml","image/avif",
  "video/mp4","video/webm","video/ogg","video/quicktime",
];
const MAX_SIZE_IMAGE = 10 * 1024 * 1024;
const MAX_SIZE_VIDEO = 200 * 1024 * 1024;

type AdminClient = ReturnType<typeof createAdminClient>;

async function ensureBucket(admin: AdminClient): Promise<void> {
  const { data: buckets } = await admin.storage.listBuckets();
  const exists = buckets?.some(b => b.id === BUCKET);
  const config = {
    public: true,
    fileSizeLimit: MAX_SIZE_VIDEO,
    allowedMimeTypes: ALLOWED_MIME,
  };
  if (!exists) {
    const { error } = await admin.storage.createBucket(BUCKET, config);
    // If "already exists" race condition, ignore
    if (error && !error.message.includes("already")) {
      throw new Error(`Bucket oluşturulamadı: ${error.message}`);
    }
  } else {
    // Best-effort update — ignore errors (bucket works regardless)
    await admin.storage.updateBucket(BUCKET, config).catch(() => null);
  }
}

export async function POST(req: NextRequest) {
  // 1. Auth check
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  // 2. Parse form
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  const rawFolder = (formData.get("folder") as string | null) ?? "";
  const folder = rawFolder.replace(/[^a-z0-9_-]/gi, "").slice(0, 40);

  if (!files.length) {
    return NextResponse.json({ error: "Dosya seçilmedi" }, { status: 400 });
  }

  // 3. Admin client
  let admin: AdminClient;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json(
      { error: `Sunucu yapılandırma hatası: ${e instanceof Error ? e.message : "SUPABASE_SERVICE_ROLE_KEY eksik"}` },
      { status: 503 }
    );
  }

  // 4. Ensure bucket exists (create if needed)
  try {
    await ensureBucket(admin);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Bucket hazırlanamadı" },
      { status: 500 }
    );
  }

  // 5. Upload files
  const results: { name: string; url: string; error?: string }[] = [];

  for (const file of files) {
    if (!ALLOWED_MIME.includes(file.type)) {
      results.push({ name: file.name, url: "", error: `Desteklenmeyen tip: ${file.type}` });
      continue;
    }
    const isVideo = file.type.startsWith("video/");
    if (file.size > (isVideo ? MAX_SIZE_VIDEO : MAX_SIZE_IMAGE)) {
      results.push({ name: file.name, url: "", error: isVideo ? "Video 200MB sınırını aşıyor" : "Görsel 10MB sınırını aşıyor" });
      continue;
    }

    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const path = `${folder ? folder + "/" : ""}${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false, cacheControl: "3600" });

    if (upErr) {
      // If bucket somehow disappeared, try re-creating once
      if (upErr.message.includes("Bucket not found") || upErr.message.includes("bucket")) {
        await ensureBucket(admin).catch(() => null);
        const { error: retryErr } = await admin.storage
          .from(BUCKET)
          .upload(path, buffer, { contentType: file.type, upsert: true, cacheControl: "3600" });
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
