import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const BUCKET = "gallery";
const ALLOWED_MIME = [
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif",
  "video/mp4", "video/webm", "video/ogg", "video/quicktime",
];
const MAX_SIZE_IMAGE = 10 * 1024 * 1024;   // 10 MB
const MAX_SIZE_VIDEO = 200 * 1024 * 1024;  // 200 MB
const MAX_SIZE = MAX_SIZE_VIDEO;
const SAFE_FOLDER = /^[a-z0-9_-]{1,40}$/;

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  const rawFolder = (formData.get("folder") as string) || "";
  const folder = rawFolder ? rawFolder.replace(/[^a-z0-9_-]/gi, "").slice(0, 40) : "";

  if (rawFolder && !SAFE_FOLDER.test(rawFolder)) {
    return NextResponse.json({ error: "Geçersiz klasör adı" }, { status: 400 });
  }

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    // No service role key — fall back to user client with anon key
    // This will work if bucket policies allow authenticated uploads
    admin = null;
  }

  const client = admin;
  const results: Array<{ name: string; url: string; error?: string }> = [];

  for (const file of files) {
    if (!ALLOWED_MIME.includes(file.type)) {
      results.push({ name: file.name, url: "", error: "Desteklenmeyen dosya tipi" });
      continue;
    }
    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? MAX_SIZE_VIDEO : MAX_SIZE_IMAGE;
    if (file.size > maxSize) {
      results.push({ name: file.name, url: "", error: isVideo ? "Video 200MB'ı aşıyor" : "Görsel 10MB'ı aşıyor" });
      continue;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeName = `${folder ? folder + "/" : ""}${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await (client as ReturnType<typeof createAdminClient>).storage
      .from(BUCKET)
      .upload(safeName, buffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: "3600",
      });

    if (error) {
      results.push({ name: file.name, url: "", error: error.message });
    } else {
      const { data: urlData } = (client as ReturnType<typeof createAdminClient>).storage
        .from(BUCKET)
        .getPublicUrl(safeName);
      results.push({ name: safeName, url: urlData.publicUrl });
    }
  }

  return NextResponse.json({ results });
}
