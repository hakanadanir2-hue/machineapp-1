import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Bu route Supabase Webhook veya sunucu tarafından çağrılır.
// food_logs tablosunda trainer_comment güncellendiğinde tetiklenir.
export async function POST(req: NextRequest) {
  // Basit secret doğrulaması
  const authHeader = req.headers.get("authorization");
  const secret     = process.env.WEBHOOK_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();
  // Supabase DB webhook payload: { type, table, record, old_record }
  const record = body.record ?? body;

  const memberId = record.member_id ?? record.user_id;
  const comment  = record.trainer_comment;
  const logId    = record.id;

  if (!memberId || !comment) {
    return NextResponse.json({ error: "member_id veya trainer_comment eksik" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 1. member_notifications tablosuna kaydet
  await admin.from("member_notifications").insert({
    member_id: memberId,
    type:      "trainer_comment",
    title:     "Antrenörünüzden Yorum",
    body:      comment.length > 120 ? comment.slice(0, 117) + "..." : comment,
    read:      false,
    meta:      { log_id: logId },
  });

  // 2. Push gönder (Edge Function'a proxy)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceKey) {
    await fetch(`${supabaseUrl}/functions/v1/send-notifications`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        task:      "manual",
        member_id: memberId,
        title:     "Antrenörünüzden Yorum",
        message:   comment.length > 120 ? comment.slice(0, 117) + "..." : comment,
      }),
    }).catch((e) => console.error("[trainer_comment push]", e));
  }

  return NextResponse.json({ ok: true });
}
