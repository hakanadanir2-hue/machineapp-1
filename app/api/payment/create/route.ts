import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateOrderId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const sc = await createClient();
  const { data: { user } } = await sc.auth.getUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  try {
    const body = await request.json();
    const { type, amount, email, full_name } = body;

    const merchantId = process.env.PAYTR_MERCHANT_ID;
    const merchantKey = process.env.PAYTR_MERCHANT_KEY;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

    if (!merchantId || !merchantKey || !merchantSalt) {
      return NextResponse.json({ error: "PayTR credentials eksik" }, { status: 500 });
    }

    const { generatePayTRToken } = await import("@/lib/paytr/hash");
    const merchantOid = generateOrderId();
    const userIp = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const iframeToken = generatePayTRToken({
      merchantId,
      merchantKey,
      merchantSalt,
      merchantOid,
      email,
      paymentAmount: amount,
      userIp,
      userName: full_name,
      userAddress: "Türkiye",
      userPhone: "",
      merchantOkUrl: `${baseUrl}/odeme/basarili?order=${merchantOid}`,
      merchantFailUrl: `${baseUrl}/odeme/hata?order=${merchantOid}`,
      testMode: "1",
      currency: "TL",
      basketItems: [
        { name: type === "program" ? "Machine Gym Kişisel Program" : "Machine Gym Üyelik", price: amount, count: 1, category: "fitness" },
      ],
    });

    return NextResponse.json({ iframeToken, merchantOid, success: true });
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json({ error: "Ödeme başlatılamadı." }, { status: 500 });
  }
}
