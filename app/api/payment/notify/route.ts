import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyPayTRCallback } from "@/lib/paytr/hash";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const postData: Record<string, string> = {};
    formData.forEach((value, key) => {
      postData[key] = value.toString();
    });

    const merchantKey  = process.env.PAYTR_MERCHANT_KEY!;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT!;

    if (!verifyPayTRCallback(merchantKey, merchantSalt, postData)) {
      console.error("PayTR notify HASH_ERROR:", JSON.stringify(postData));
      return new NextResponse("HASH_ERROR", { status: 400 });
    }

    const { merchant_oid, status, total_amount } = postData;
    const isSuccess = status === "success";
    const supabase = await createClient();

    // membership_orders tablosunu güncelle
    const { error: moErr } = await supabase
      .from("membership_orders")
      .update({
        status:     isSuccess ? "success" : "failed",
        updated_at: new Date().toISOString(),
        paid_at:    isSuccess ? new Date().toISOString() : null,
      })
      .eq("order_id", merchant_oid);

    if (moErr) console.error("membership_orders update error:", moErr.message);

    // payments tablosu da varsa güncelle (geriye uyumluluk)
    await supabase
      .from("payments")
      .update({ status: isSuccess ? "success" : "failed" })
      .eq("paytr_order_id", merchant_oid);

    console.log(`PayTR notify: ${merchant_oid} → ${status} (${total_amount} kr)`);
    return new NextResponse("OK");

  } catch (error) {
    console.error("Payment notify error:", error);
    return new NextResponse("ERROR", { status: 500 });
  }
}
