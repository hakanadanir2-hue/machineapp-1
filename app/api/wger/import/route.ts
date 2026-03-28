import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 300;

const WGER_BASE    = "https://wger.de/api/v2/exerciseinfo/";
const LANGUAGE_EN  = 2;
const MAX_PAGES    = 60;
const BATCH_SIZE   = 50; // rows per upsert call

// ── wger types ─────────────────────────────────────────────────────────────
interface WgerMuscle  { id: number; name: string; name_en: string; }
interface WgerEquip   { id: number; name: string; }
interface WgerTrans   { id: number; language: number; name: string; description: string; }
interface WgerImage   { id: number; image: string; is_main: boolean; }
interface WgerExercise {
  id: number;
  uuid: string;
  category: { id: number; name: string };
  muscles: WgerMuscle[];
  muscles_secondary: WgerMuscle[];
  equipment: WgerEquip[];
  license: { id: number; short_name: string };
  images: WgerImage[];
  translations: WgerTrans[];
}
interface WgerPage { count: number; next: string | null; results: WgerExercise[]; }

// ── helpers ────────────────────────────────────────────────────────────────
function stripHtml(h: string) {
  return h.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
function toAbsUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return path.startsWith("http") ? path : `https://wger.de${path}`;
}
function musclesToStr(p: WgerMuscle[], s: WgerMuscle[]) {
  const names = [...p, ...s].map((m) => (m.name_en?.trim() || m.name?.trim())).filter(Boolean);
  return [...new Set(names)].join(", ");
}
function equipToStr(eq: WgerEquip[]) {
  return [...new Set(eq.map((e) => e.name?.trim()).filter(Boolean))].join(", ");
}

async function fetchPage(offset: number, limit: number): Promise<WgerPage> {
  const url = `${WGER_BASE}?format=json&limit=${limit}&offset=${offset}`;
  console.log("Fetching:", url);
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  console.log("Status:", res.status);
  if (!res.ok) throw new Error(`wger HTTP ${res.status}`);
  return res.json() as Promise<WgerPage>;
}

// ── POST ───────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  console.log("IMPORT START");
  const { searchParams } = new URL(req.url);
  const rawLimit = searchParams.get("limit");
  const maxItems = rawLimit ? Math.max(1, parseInt(rawLimit, 10)) : 99999;
  const isTest   = !!rawLimit;
  const pageSize = Math.min(maxItems, 20);

  const logs: string[] = [];
  const push = (msg: string) => { console.log("[wger]", msg); logs.push(msg); };
  push(`mode=${isTest ? `TEST limit=${maxItems}` : "FULL"}`);

  // ── Simple running check ─────────────────────────────────────────────────
  const admin = createAdminClient();
  const { data: running } = await admin
    .from("job_state")
    .select("id")
    .eq("status", "running")
    .limit(1);
  if (running && running.length > 0) {
    return NextResponse.json({ success: false, error: "Başka bir job zaten çalışıyor.", logs: [] }, { status: 409 });
  }

  const { data: jobRow } = await admin
    .from("job_state")
    .insert({ type: "wger_import", status: "running", started_at: new Date().toISOString() })
    .select("id").single();
  const jobId: string | null = jobRow?.id ?? null;

  // Create log row
  const { data: logRow, error: logErr } = await admin
    .from("wger_import_logs")
    .insert({ status: "running", triggered_by: isTest ? "admin-test" : "admin" })
    .select("id").single();

  if (logErr || !logRow) {
    const msg = `wger_import_logs insert failed: ${logErr?.message}. Run supabase-wger-migration.sql first.`;
    console.error("IMPORT ERROR:", msg);
    if (jobId) await admin.from("job_state").update({ status: "failed", finished_at: new Date().toISOString() }).eq("id", jobId);
    return NextResponse.json({ success: false, error: msg, fetched: 0, inserted: 0, updated: 0, skipped: 0, errors: 1, logs: [msg] }, { status: 500 });
  }

  const logId: string = logRow.id;
  let fetched = 0, inserted = 0, updated = 0, skipped = 0, errors = 0, imagesProcessed = 0;
  const errorList: string[] = [];

  const saveLog = async (status: "completed" | "failed" | "timeout") => {
    await admin.from("wger_import_logs").update({
      status, finished_at: new Date().toISOString(),
      total_fetched: fetched, total_inserted: inserted,
      total_updated: updated, total_skipped: skipped,
      total_errors: errors, error_messages: errorList.slice(0, 20),
    }).eq("id", logId);
    if (jobId) await admin.from("job_state").update({ status: status === "completed" ? "completed" : "failed", finished_at: new Date().toISOString() }).eq("id", jobId);
  };

  try {
    // ── FETCH ALL PAGES ──────────────────────────────────────────────────
    const all: WgerExercise[] = [];
    const visitedOffsets = new Set<number>();
    let offset = 0, page = 0;

    while (all.length < maxItems && page < MAX_PAGES) {
      if (visitedOffsets.has(offset)) { push(`Loop guard offset=${offset}`); break; }
      visitedOffsets.add(offset);
      page++;

      let data: WgerPage;
      try { data = await fetchPage(offset, pageSize); }
      catch (fe) {
        const msg = `Fetch error page ${page}: ${fe instanceof Error ? fe.message : fe}`;
        console.error("IMPORT ERROR:", fe);
        push(msg); errorList.push(msg); errors++;
        break;
      }

      const got = data.results?.length ?? 0;
      console.log("Results length:", got);
      push(`Page ${page}: offset=${offset} got=${got} total=${data.count}`);

      if (got === 0) { push("Empty page — stopping"); break; }
      all.push(...data.results);
      if (!data.next) { push("next=null — done"); break; }
      if (all.length >= maxItems) { push(`maxItems=${maxItems} reached`); break; }
      offset += pageSize;
    }

    const items = all.slice(0, maxItems);
    fetched = items.length;
    push(`Fetched ${fetched}. Building payloads...`);

    // ── BUILD PAYLOADS ───────────────────────────────────────────────────
    // Only confirmed-existing columns:
    // wger_id, name, description, category, muscles, equipment,
    // difficulty, language, image_url, is_active, is_verified,
    // source, source_license, attribution_required, updated_at

    type ExPayload = {
      wger_id: number;
      name: string;
      description: string;
      category: string;
      muscles: string;
      equipment: string;
      difficulty: null;
      language: number;
      image_url: string | null;
      is_active: boolean;
      is_verified: boolean;
      source: string;
      source_license: string;
      attribution_required: boolean;
      updated_at: string;
    };

    const payloads: ExPayload[] = [];
    const imagesBatch: { wger_id: number; image_url: string; is_main: boolean }[] = [];

    for (const ex of items) {
      const enTrans = ex.translations?.find((t) => t.language === LANGUAGE_EN);
      if (!enTrans?.name?.trim()) { skipped++; continue; }

      const payload: ExPayload = {
        wger_id:              ex.id,
        name:                 enTrans.name.trim(),
        description:          stripHtml(enTrans.description || ""),
        category:             ex.category?.name ?? "",
        muscles:              musclesToStr(ex.muscles ?? [], ex.muscles_secondary ?? []),
        equipment:            equipToStr(ex.equipment ?? []),
        difficulty:           null,
        language:             LANGUAGE_EN,
        image_url:            toAbsUrl(ex.images?.find((img) => img.is_main)?.image ?? ex.images?.[0]?.image),
        is_active:            true,
        is_verified:          false,
        source:               "wger",
        source_license:       ex.license?.short_name || "CC-BY-SA 4.0",
        attribution_required: true,
        updated_at:           new Date().toISOString(),
      };

      payloads.push(payload);

      for (const img of (ex.images ?? [])) {
        const url = toAbsUrl(img.image);
        if (url) imagesBatch.push({ wger_id: ex.id, image_url: url, is_main: img.is_main });
      }
    }

    if (payloads.length === 0) {
      push("No valid payloads — all skipped");
      await saveLog("completed");
      return NextResponse.json({ success: true, fetched, inserted: 0, updated: 0, skipped, errors, images_processed: 0, logs });
    }

    if (payloads.length > 0) {
      console.log("PAYLOAD SAMPLE (first record):", JSON.stringify(payloads[0]));
    }

    push(`Upserting ${payloads.length} exercises in batches of ${BATCH_SIZE}...`);

    // ── BATCH UPSERT (ON CONFLICT wger_id) ──────────────────────────────
    for (let b = 0; b < payloads.length; b += BATCH_SIZE) {
      const batch = payloads.slice(b, b + BATCH_SIZE);
      const { error: upsErr } = await admin
        .from("exercises")
        .upsert(batch, { onConflict: "wger_id", ignoreDuplicates: false });

      if (upsErr) {
        const msg = `Batch ${Math.floor(b / BATCH_SIZE) + 1} upsert err: ${upsErr.message}`;
        console.error("IMPORT ERROR:", msg);
        push(msg); errorList.push(msg); errors += batch.length;
      } else {
        // We can't easily distinguish inserted vs updated from upsert,
        // so count by checking which wger_ids already existed before this run.
        // Simpler: treat all as "updated" on re-runs, "inserted" on first run.
        // We'll count them as updated for now; inserted will be correct on clean DB.
        updated += batch.length;
        push(`Batch ${Math.floor(b / BATCH_SIZE) + 1}/${Math.ceil(payloads.length / BATCH_SIZE)}: ✓ ${batch.length} upserted`);
      }
    }

    // ── IMAGES: fetch exercise UUIDs then batch insert ───────────────────
    if (imagesBatch.length > 0) {
      push(`Processing ${imagesBatch.length} images...`);

      // Get the UUID ids for exercises we just upserted
      const wgerIds = [...new Set(imagesBatch.map((r) => r.wger_id))];
      const { data: exRows } = await admin
        .from("exercises")
        .select("id, wger_id")
        .in("wger_id", wgerIds);

      const wgerToUuid = new Map((exRows ?? []).map((r) => [r.wger_id as number, r.id as string]));

      // Delete old images for these exercises
      const exerciseUuids = Array.from(wgerToUuid.values());
      if (exerciseUuids.length > 0) {
        await admin.from("exercise_images").delete().in("exercise_id", exerciseUuids);
      }

      // Insert new images in batches
      const imageRows = imagesBatch
        .map((img) => {
          const eid = wgerToUuid.get(img.wger_id);
          if (!eid) return null;
          return { exercise_id: eid, wger_exercise_id: img.wger_id, image_url: img.image_url, is_main: img.is_main };
        })
        .filter(Boolean) as { exercise_id: string; wger_exercise_id: number; image_url: string; is_main: boolean }[];

      for (let b = 0; b < imageRows.length; b += 100) {
        const { error: imgErr } = await admin.from("exercise_images").insert(imageRows.slice(b, b + 100));
        if (imgErr) {
          push(`Images batch err: ${imgErr.message}`);
          errorList.push(imgErr.message);
        } else {
          imagesProcessed += Math.min(100, imageRows.length - b);
        }
      }
    }

    // Adjust inserted vs updated: if errors reduced count, reflect that
    inserted = 0; // upsert doesn't distinguish; use updated for total
    // Re-assign: total successful = updated (includes both new + updated rows)
    // subtract error rows
    updated = payloads.length - errors;

    push(`DONE ✓ fetched=${fetched} upserted=${updated} skipped=${skipped} errors=${errors} images=${imagesProcessed}`);
    console.log("Updated:", updated);
    await saveLog("completed");

    return NextResponse.json({
      success: true,
      fetched,
      inserted,
      updated,
      skipped,
      errors,
      images_processed: imagesProcessed,
      logs,
    });

  } catch (err) {
    console.error("IMPORT ERROR:", err);
    const msg = err instanceof Error ? err.message : String(err);
    push(`CRITICAL ERROR: ${msg}`);
    errorList.push(msg); errors++;
    await saveLog("failed");
    return NextResponse.json({ success: false, error: msg, fetched, inserted, updated, skipped, errors, logs }, { status: 500 });
  }
}

// ── GET ────────────────────────────────────────────────────────────────────
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const admin = createAdminClient();
  const [logsRes, countRes] = await Promise.all([
    admin.from("wger_import_logs").select("*").order("started_at", { ascending: false }).limit(10),
    admin.from("exercises").select("*", { count: "exact", head: true }).eq("source", "wger"),
  ]);
  return NextResponse.json({ logs: logsRes.data ?? [], exercise_count: countRes.count ?? 0 });
}
