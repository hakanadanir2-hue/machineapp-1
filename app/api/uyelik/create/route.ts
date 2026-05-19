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

    const merchantOid   = generateOrderId();
    const baseUrl       = process.env.NEXT_PUBLIC_SITE_URL || "https://www.machinegym.biz";
    const testMode      = process.env.PAYTR_TEST_MODE === "1" ? "1" : "0";
    const noInstallment = "0";
    const maxInstallment= "0";
    const currency      = "TL";
    const debugOn       = "1";
    const lang          = "tr";

    // Vercel'den gelen gerçek IP
    const fwdIp = request.headers.get("x-forwarded-for") || "";
    const userIp = fwdIp.split(",")[0].trim() || "1.2.3.4";

    // Ödeme tutarı (PayTR: kuruş cinsinden, integer * 100)
    const paymentAmount = Math.round(Number(amount) * 100).toString();

    // Sepet — her öğe [ad, fiyat_kuruş, adet] şeklinde string[]
    const basketJson = JSON.stringify([
      ["Machine Gym Uyelik", paymentAmount, "1"],
    ]);
    const userBasket = Buffer.from(basketJson).toString("base64");

    const okUrl   = `${baseUrl}/odeme/basarili?order=${merchantOid}&plan=${encodeURIComponent(plan_adi)}`;
    const failUrl = `${baseUrl}/odeme/hata?order=${merchantOid}`;

    // PayTR hash: PHP eşdeğeri
    // hash_str = merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
    // paytr_token = base64(hmac_sha256(hash_str + merchant_salt, merchant_key, raw=true))
    const hashStr = merchantId + userIp + merchantOid + email +
      paymentAmount + userBasket + noInstallment + maxInstallment + currency + testMode;

    const paytrToken = crypto
      .createHmac("sha256", merchantKey)
      .update(hashStr + merchantSalt)
      .digest("base64");

    // PayTR API isteği
    const formData = new URLSearchParams();
    formData.append("merchant_id",      merchantId);
    formData.append("user_ip",          userIp);
    formData.append("merchant_oid",     merchantOid);
    formData.append("email",            email);
    formData.append("payment_amount",   paymentAmount);
    formData.append("paytr_token",      paytrToken);
    formData.append("user_basket",      userBasket);
    formData.append("debug_on",         debugOn);
    formData.append("no_installment",   noInstallment);
    formData.append("max_installment",  maxInstallment);
    formData.append("user_name",        full_name);
    formData.append("user_address",     "Türkiye");
    formData.append("user_phone",       phone);
    formData.append("merchant_ok_url",  okUrl);
    formData.append("merchant_fail_url",failUrl);
    formData.append("test_mode",        testMode);
    formData.append("currency",         currency);
    formData.append("lang",             lang);

    const paytrRes  = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    formData.toString(),
    });

    const paytrData = await paytrRes.json() as { status: string; token?: string; reason?: string };

    if (paytrData.status !== "success" || !paytrData.token) {
      console.error("PayTR hata:", JSON.stringify(paytrData));
      return NextResponse.json(
        { error: `Ödeme başlatılamadı: ${paytrData.reason || "Bilinmeyen hata"}` },
        { status: 500 }
      );
    }

    // Supabase sipariş kaydı (tablo yoksa geç)
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const sc = await createClient();
      await sc.from("membership_orders").insert({
        order_id: merchantOid, plan_adi,
        kategori: kategori || "fitness",
        amount, full_name, email, phone, status: "pending",
      });
    } catch { /* tablo yoksa sessiz geç */ }

    return NextResponse.json({ iframeToken: paytrData.token, merchantOid, success: true });

  } catch (err) {
    console.error("uyelik/create error:", err);
    return NextResponse.json({ error: "Sunucu hatası. Lütfen tekrar deneyin." }, { status: 500 });
  }
}
