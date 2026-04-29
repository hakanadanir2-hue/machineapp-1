import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  }

  const body = await req.json();
  const { subscription } = body as { subscription: PushSubscription };

  if (!subscription?.endpoint) {
    return NextResponse.json({ error: "Geçersiz subscription" }, { status: 400 });
  }

  const admin = createAdminClient();

  // push_subscriptions tablosuna kaydet veya güncelle
  const { error } = await admin.from("push_subscriptions").upsert(
    {
      member_id:   user.id,
      endpoint:    subscription.endpoint,
      p256dh:      (subscription as unknown as { keys: { p256dh: string; auth: string } }).keys?.p256dh ?? "",
      auth:        (subscription as unknown as { keys: { p256dh: string; auth: string } }).keys?.auth ?? "",
      updated_at:  new Date().toISOString(),
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    console.error("[push/subscribe]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  }

  const body = await req.json();
  const { endpoint } = body as { endpoint: string };

  const admin = createAdminClient();
  await admin.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("member_id", user.id);

  return NextResponse.json({ ok: true });
}
