import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST() {
  let admin;
  try { admin = createAdminClient(); } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "KEY eksik" }, { status: 503 });
  }

  const results: string[] = [];

  // Create both buckets with NO restrictions
  for (const bucket of ["gallery", "products"]) {
    const { data: buckets } = await admin.storage.listBuckets();
    const exists = buckets?.some(b => b.id === bucket);
    if (!exists) {
      const { error } = await admin.storage.createBucket(bucket, { public: true });
      results.push(error ? `${bucket}: HATA - ${error.message}` : `${bucket}: oluşturuldu`);
    } else {
      results.push(`${bucket}: zaten var`);
    }
  }

  return NextResponse.json({ ok: true, results });
}
