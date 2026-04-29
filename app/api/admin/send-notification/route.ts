import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = await req.json() as {
    member_id?: string;   // tek üye — ya member_id ya send_all
    send_all?: boolean;   // tüm aktif üyelere
    type?: string;
    title: string;
    message?: string;
    url?: string;
  };

  const { member_id, send_all, title, message, url } = body;

  if (!title) {
    return NextResponse.json({ error: "title zorunlu" }, { status: 400 });
  }
  if (!member_id && !send_all) {
    return NextResponse.json({ error: "member_id veya send_all gerekli" }, { status: 400 });
  }

  const admin = createAdminClient();

  let memberIds: string[] = [];

  if (send_all) {
    const { data } = await admin
      .from("members")
      .select("id")
      .eq("is_active", true);
    memberIds = (data ?? []).map((m: { id: string }) => m.id);
  } else if (member_id) {
    memberIds = [member_id];
  }

  if (memberIds.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, note: "Hedef üye bulunamadı" });
  }

  // 1. member_notifications toplu ekleme
  const notifications = memberIds.map((mid) => ({
    member_id: mid,
    type:      body.type ?? "info",
    title,
    body:      message ?? "",
    read:      false,
  }));
  await admin.from("member_notifications").insert(notifications);

  // 2. Push gönderimi için Edge Function'a çağrı (tüm üyeler için tekil)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let pushSent = 0;

  if (supabaseUrl && serviceKey) {
    const pushJobs = memberIds.map((mid) =>
      fetch(`${supabaseUrl}/functions/v1/send-notifications`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          task:      "manual",
          member_id: mid,
          title,
          message:   message ?? "",
          url,
        }),
      }).then(() => { pushSent++; }).catch((e) => console.error("[admin push]", e))
    );
    await Promise.allSettled(pushJobs);
  }

  return NextResponse.json({ ok: true, sent: memberIds.length, push_sent: pushSent });
}
