import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const BUCKET = "products";

type Admin = ReturnType<typeof createAdminClient>;

async function getOrCreateBucket(admin: Admin): Promise<void> {
  const { data: buckets } = await admin.storage.listBuckets();
  const exists = buckets?.some(b => b.id === BUCKET);
  if (exists) return;
  // Create with NO restrictions — no fileSizeLimit, no allowedMimeTypes
  const { error } = await admin.storage.createBucket(BUCKET, { public: true });
  if (error && !error.message.includes("already")) {
    throw new Error(error.message);
  }
}

export async function POST(req: NextRequest) {
  // 1. Auth
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  // 2. Parse form data
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (e) {
    return NextResponse.json({ error: `Body parse hatası: ${e instanceof Error ? e.message : String(e)}` }, { status: 400 });
  }

  const files = formData.getAll("files") as File[];
  const rawFolder = (formData.get("folder") as string | null) ?? "";
  const folder = rawFolder.replace(/[^a-z0-9_-]/gi, "").slice(0, 40);

  if (!files.length) {
    return NextResponse.json({ error: "Dosya seçilmedi" }, { status: 400 });
  }

  // 3. Admin client
  let admin: Admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json({ error: `Config hatası: ${e instanceof Error ? e.message : "SERVICE_ROLE_KEY eksik"}` }, { status: 503 });
  }

  // 4. Ensure bucket
  try {
    await getOrCreateBucket(admin);
  } catch (e) {
    return NextResponse.json({ error: `Bucket hatası: ${e instanceof Error ? e.message : String(e)}` }, { status: 500 });
  }

  // 5. Upload each file
  const results: { name: string; url: string; error?: string }[] = [];

  for (const file of files) {
    const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();
    const ts = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const path = folder ? `${folder}/${ts}_${rand}.${ext}` : `${ts}_${rand}.${ext}`;

    let buffer: Buffer;
    try {
      buffer = Buffer.from(await file.arrayBuffer());
    } catch {
      results.push({ name: file.name, url: "", error: "Dosya okunamadı" });
      continue;
    }

    // Always use application/octet-stream to avoid ANY mime type rejection
    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: "application/octet-stream",
        upsert: true,
      });

    if (upErr) {
      results.push({ name: file.name, url: "", error: upErr.message });
      continue;
    }

    const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
    results.push({ name: file.name, url: data.publicUrl });
  }

  return NextResponse.json({ results });
}
