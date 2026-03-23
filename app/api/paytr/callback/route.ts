import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const merchant_oid = body.get("merchant_oid") as string;
    const status = body.get("status") as string;
    const total_amount = body.get("total_amount") as string;
    const hash = body.get("hash") as string;

    // Merchant salt ile doğrula
    const { data: settings } = await supabase
      .from("site_settings")
      .select("key,value")
      .in("key", ["paytr_merchant_key", "paytr_merchant_salt"]);

    const cfg: Record<string, string> = {};
    (settings || []).forEach((s: { key: string; value: string }) => { cfg[s.key] = s.value; });

    const hash_str = `${merchant_oid}${cfg.paytr_merchant_salt}${status}${total_amount}`;
    const expected_hash = crypto.createHmac("sha256", cfg.paytr_merchant_key).update(hash_str).digest("base64");

    if (hash !== expected_hash) {
      return new NextResponse("PAYTR_INVALID", { status: 400 });
    }

    // Sipariş güncelle
    if (status === "success") {
      await supabase.from("orders").update({ status: "paid", paid_at: new Date().toISOString() }).eq("paytr_order_id", merchant_oid);
    } else {
      await supabase.from("orders").update({ status: "failed" }).eq("paytr_order_id", merchant_oid);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("PayTR callback error:", err);
    return new NextResponse("ERROR", { status: 500 });
  }
}
