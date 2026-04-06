import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { sendProgramEmail } from "@/lib/email/send-program";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const sc = await createServerClient();
  const { data: { user } } = await sc.auth.getUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const admin = createAdminClient();

  // Admin kontrolü
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const body = await req.json().catch(() => null) as { requestId: string; programText: string } | null;
  if (!body?.requestId || !body?.programText?.trim()) {
    return NextResponse.json({ error: "requestId ve programText zorunludur" }, { status: 400 });
  }

  // Talebi çek
  const { data: reqRow, error: fetchErr } = await admin
    .from("program_requests")
    .select("*")
    .eq("id", body.requestId)
    .single();

  if (fetchErr || !reqRow) {
    return NextResponse.json({ error: "Talep bulunamadı" }, { status: 404 });
  }

  if (reqRow.payment_status !== "paid") {
    return NextResponse.json({ error: "Ödeme henüz tamamlanmamış" }, { status: 400 });
  }

  // Admin programını kaydet
  await admin.from("program_requests").update({
    admin_program: body.programText,
    status: "in_progress",
  }).eq("id", body.requestId);

  // PDF oluştur + mail gönder
  try {
    await sendProgramEmail({
      to: reqRow.email,
      fullName: reqRow.full_name,
      programType: reqRow.program_type,
      programText: body.programText,
      age: reqRow.age ?? undefined,
      gender: reqRow.gender ?? undefined,
      height: reqRow.height_cm ?? undefined,
      weight: reqRow.weight_kg ?? undefined,
      goal: reqRow.goal ?? undefined,
      fitnessLevel: reqRow.fitness_level ?? undefined,
    });
  } catch (mailErr) {
    return NextResponse.json({ error: `PDF/mail hatası: ${mailErr instanceof Error ? mailErr.message : String(mailErr)}` }, { status: 500 });
  }

  // Durumu güncelle
  await admin.from("program_requests").update({
    status: "sent",
    sent_at: new Date().toISOString(),
  }).eq("id", body.requestId);

  return NextResponse.json({ success: true });
}
