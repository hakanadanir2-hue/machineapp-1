import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// GET — program detayı (weeks + days + exercises + nutrition)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: program } = await admin
    .from("programs")
    .select("*")
    .eq("id", id).single();

  if (!program) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const { data: profile } = await admin
    .from("user_profiles")
    .select("*")
    .eq("id", program.profile_id).single();

  const { data: weeks } = await admin
    .from("program_weeks")
    .select("*")
    .eq("program_id", id)
    .order("week_number");

  const { data: days } = await admin
    .from("program_days")
    .select("*")
    .eq("program_id", id)
    .order("week_number").order("day_number");

  const { data: exercises } = await admin
    .from("program_exercises")
    .select("*")
    .in("program_day_id", (days ?? []).map((d) => d.id))
    .order("order_index");

  const { data: nutrition } = await admin
    .from("nutrition_plans")
    .select("*")
    .eq("program_id", id).single();

  // Build nested structure
  const daysWithExercises = (days ?? []).map((day) => ({
    ...day,
    exercises: (exercises ?? []).filter((e) => e.program_day_id === day.id),
  }));

  const weeksWithDays = (weeks ?? []).map((week) => ({
    ...week,
    days: daysWithExercises.filter((d) => d.week_number === week.week_number),
  }));

  return NextResponse.json({ program, profile, weeks: weeksWithDays, nutrition });
}

// PATCH — approve / reject
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { action, admin_notes, rejection_reason } = await req.json().catch(() => ({})) as {
    action?: string;
    admin_notes?: string;
    rejection_reason?: string;
  };

  if (!["approve", "reject"].includes(action ?? "")) {
    return NextResponse.json({ error: "action: approve veya reject olmalı" }, { status: 400 });
  }

  const admin = createAdminClient();
  const now   = new Date().toISOString();

  const update =
    action === "approve"
      ? { status: "approved", approved_at: now, admin_notes: admin_notes ?? null, updated_at: now }
      : { status: "rejected", rejected_at: now, rejection_reason: rejection_reason ?? null, admin_notes: admin_notes ?? null, updated_at: now };

  const { data, error } = await admin
    .from("programs")
    .update(update)
    .eq("id", id)
    .select("id, status, title, approved_at, rejected_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, program: data });
}
