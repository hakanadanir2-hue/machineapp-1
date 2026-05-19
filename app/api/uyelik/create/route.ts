import { NextRequest, NextResponse } from "next/server";
import { generateOrderId } from "@/lib/utils";
import crypto from "crypto";

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

    const merchantOid = generateOrderId();
    const userIp      = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "1.2.3.4";
    const baseUrl     = process.env.NEXT_PUBLIC_SITE_URL || "https://www.machinegym.biz";
    const testMode    = process.env.PAYTR_TEST_MODE === "1" ? "1" : "0";
    const paymentAmount = Math.round(amount * 100); // kuruş cinsinden

    const userBasket = Buffer.from(
      JSON.stringify([[`Machine Gym — ${plan_adi}`, String(paymentAmount), "1"]])
    ).toString("base64");

    const noInstallment = "0";
    const maxInstallment = "0";
    const currency = "TL";

    // PayTR hash hesapla
    const hashStr = merchantId + userIp + merchantOid + email +
      String(paymentAmount) + userBasket + noInstallment + maxInstallment + currency + testMode;

    const paytrToken = crypto
      .createHmac("sha256", merchantKey)
      .update(hashStr + merchantSalt)
      .digest("base64");

    // PayTR API'den gerçek iframe token al
    const params = new URLSearchParams({
      merchant_id:      merchantId,
      user_ip:          userIp,
      merchant_oid:     merchantOid,
      email,
      payment_amount:   String(paymentAmount),
      paytr_token:      paytrToken,
      user_basket:      userBasket,
      debug_on:         "1",
      no_installment:   noInstallment,
      max_installment:  maxInstallment,
      user_name:        full_name,
      user_address:     "Türkiye",
      user_phone:       phone,
      merchant_ok_url:  `${baseUrl}/odeme/basarili?order=${merchantOid}&plan=${encodeURIComponent(plan_adi)}`,
      merchant_fail_url:`${baseUrl}/odeme/hata?order=${merchantOid}`,
      test_mode:        testMode,
      currency,
      lang:             "tr",
    });

    const paytrRes = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const paytrData = await paytrRes.json() as { status: string; token?: string; reason?: string };

    if (paytrData.status !== "success" || !paytrData.token) {
      console.error("PayTR hata:", paytrData);
      return NextResponse.json(
        { error: `Ödeme başlatılamadı: ${paytrData.reason || "Bilinmeyen hata"}` },
        { status: 500 }
      );
    }

    // Supabase'e sipariş kaydı (tablo yoksa sessizce geç)
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const sc = await createClient();
      await sc.from("membership_orders").insert({
        order_id: merchantOid, plan_adi,
        kategori: kategori || "fitness",
        amount, full_name, email, phone, status: "pending",
      });
    } catch { /* tablo yoksa geç */ }

    return NextResponse.json({ iframeToken: paytrData.token, merchantOid, success: true });

  } catch (error) {
    console.error("Uyelik create error:", error);
    return NextResponse.json({ error: "Sunucu hatası. Lütfen tekrar deneyin." }, { status: 500 });
  }
}
