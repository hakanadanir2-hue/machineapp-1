import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateOrderId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan_adi, kategori, amount, full_name, email, phone } = body;

    if (!plan_adi || !amount || !full_name || !email || !phone) {
      return NextResponse.json({ error: "Tüm alanlar zorunludur." }, { status: 400 });
    }

    const merchantId   = process.env.PAYTR_MERCHANT_ID;
    const merchantKey  = process.env.PAYTR_MERCHANT_KEY;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

    if (!merchantId || !merchantKey || !merchantSalt) {
      return NextResponse.json({ error: "Ödeme sistemi yapılandırılmamış." }, { status: 500 });
    }

    const { generatePayTRToken } = await import("@/lib/paytr/hash");
    const merchantOid = generateOrderId();
    const userIp = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Supabase'e lead kaydı oluştur (auth gerekmez)
    try {
      const sc = await createClient();
      await sc.from("membership_orders").insert({
        order_id:  merchantOid,
        plan_adi,
        kategori:  kategori || "fitness",
        amount,
        full_name,
        email,
        phone,
        status:    "pending",
      });
    } catch { /* tablo yoksa sessizce geç */ }

    const iframeToken = generatePayTRToken({
      merchantId,
      merchantKey,
      merchantSalt,
      merchantOid,
      email,
      paymentAmount: amount,
      userIp,
      userName:      full_name,
      userAddress:   "Türkiye",
      userPhone:     phone,
      merchantOkUrl:   `${baseUrl}/odeme/basarili?order=${merchantOid}&plan=${encodeURIComponent(plan_adi)}`,
      merchantFailUrl: `${baseUrl}/odeme/hata?order=${merchantOid}`,
      testMode: process.env.PAYTR_TEST_MODE === "1" ? "1" : "0",
      currency: "TL",
      basketItems: [
        { name: `Machine Gym — ${plan_adi}`, price: amount, count: 1, category: kategori || "fitness" },
      ],
    });

    return NextResponse.json({ iframeToken, merchantOid, success: true });
  } catch (error) {
    console.error("Uyelik create error:", error);
    return NextResponse.json({ error: "Ödeme başlatılamadı." }, { status: 500 });
  }
}
