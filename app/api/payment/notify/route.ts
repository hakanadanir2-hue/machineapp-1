import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyPayTRCallback } from "@/lib/paytr/hash";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const postData: Record<string, string> = {};
    formData.forEach((value, key) => {
      postData[key] = value.toString();
    });

    const merchantKey = process.env.PAYTR_MERCHANT_KEY!;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT!;

    if (!verifyPayTRCallback(merchantKey, merchantSalt, postData)) {
      return new NextResponse("HASH_ERROR", { status: 400 });
    }

    const { merchant_oid, status } = postData;
    const supabase = await createClient();

    await supabase.from("payments").update({
      status: status === "success" ? "success" : "failed",
    }).eq("paytr_order_id", merchant_oid);

    return new NextResponse("OK");
  } catch (error) {
    console.error("Payment notify error:", error);
    return new NextResponse("ERROR", { status: 500 });
  }
}
