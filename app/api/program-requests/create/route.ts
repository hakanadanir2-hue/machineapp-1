import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sc = await createServerClient();
  const { data: { user } } = await sc.auth.getUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });

  const {
    full_name, email, phone,
    age, gender, height_cm, weight_kg,
    goal, fitness_level, days_per_week, session_duration,
    health_issues, injuries, diet_preference, extra_notes,
    program_type = "fitness",
    user_ip,
  } = body;

  if (!full_name || !email) {
    return NextResponse.json({ error: "Ad soyad ve e-posta zorunludur" }, { status: 400 });
  }

  const admin = createAdminClient();

  // PayTR ayarlarını çek
  const { data: settings } = await admin
    .from("site_settings")
    .select("key,value")
    .in("key", ["paytr_merchant_id", "paytr_merchant_key", "paytr_merchant_salt", "paytr_test_mode", "site_url", "paytr_debug_mode"]);

  const cfg: Record<string, string> = {};
  (settings || []).forEach((s: { key: string; value: string }) => { cfg[s.key] = s.value; });

  const { paytr_merchant_id: merchantId, paytr_merchant_key: merchantKey, paytr_merchant_salt: merchantSalt } = cfg;
  if (!merchantId || !merchantKey || !merchantSalt) {
    return NextResponse.json({ error: "PayTR ayarları eksik. Admin > Ayarlar > PayTR bölümünü doldurun." }, { status: 500 });
  }

  const amount = program_type === "combo" ? 799 : 499;
  const orderId = `PR-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const siteUrl = cfg.site_url || process.env.NEXT_PUBLIC_SITE_URL || "https://machinegym.com.tr";

  // DB'ye kaydet
  const { data: reqRow, error: insertErr } = await admin.from("program_requests").insert({
    user_id:         user.id,
    full_name, email, phone,
    age, gender, height_cm, weight_kg,
    goal, fitness_level, days_per_week, session_duration,
    health_issues, injuries, diet_preference, extra_notes,
    program_type,
    paytr_order_id: orderId,
    amount,
    payment_status: "pending",
    status: "waiting",
  }).select("id").single();

  if (insertErr || !reqRow) {
    return NextResponse.json({ error: `Talep kaydedilemedi: ${insertErr?.message}` }, { status: 500 });
  }

  // PayTR token al
  const testMode = cfg.paytr_test_mode === "true" ? "1" : "0";
  const paymentAmount = Math.round(amount * 100).toString();
  const cartItems = [[`Machine Gym ${program_type === "combo" ? "Fitness+Beslenme" : program_type === "beslenme" ? "Beslenme" : "Fitness"} Programı`, "1", paymentAmount]];
  const userBasket = Buffer.from(JSON.stringify(cartItems)).toString("base64");
  const clientIp = user_ip || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "1.1.1.1";

  const hashStr = `${merchantId}${clientIp}${orderId}${email}${paymentAmount}${userBasket}0${0}TL${testMode}${merchantSalt}`;
  const paytrToken = crypto.createHmac("sha256", merchantKey).update(hashStr).digest("base64");

  const formData = new URLSearchParams({
    merchant_id: merchantId,
    user_ip: clientIp,
    merchant_oid: orderId,
    email,
    payment_amount: paymentAmount,
    paytr_token: paytrToken,
    user_basket: userBasket,
    debug_on: cfg.paytr_debug_mode === "true" ? "1" : "0",
    no_installment: "0",
    max_installment: "0",
    user_name: full_name,
    user_address: "Türkiye",
    user_phone: phone || "05000000000",
    merchant_ok_url: `${siteUrl}/dashboard?odeme=basarili`,
    merchant_fail_url: `${siteUrl}/program-al?odeme=basarisiz`,
    timeout_limit: "30",
    currency: "TL",
    test_mode: testMode,
    lang: "tr",
  });

  const paytrRes = await fetch("https://www.paytr.com/odeme/api/get-token", {
    method: "POST",
    body: formData,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const result = await paytrRes.json() as { status: string; token?: string; reason?: string };

  if (result.status !== "success") {
    await admin.from("program_requests").update({ payment_status: "failed" }).eq("id", reqRow.id);
    return NextResponse.json({ error: result.reason || "PayTR token alınamadı" }, { status: 400 });
  }

  return NextResponse.json({ token: result.token, requestId: reqRow.id, amount, orderId });
}
