import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const sc = await createServerClient();
  const { data: { user } } = await sc.auth.getUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  try {
    const body = await req.json();
    const { order_id, amount, user_email, user_name, user_phone, user_address, cart_items, user_ip } = body;

    // Ayarları DB'den al
    const { data: settings } = await supabase
      .from("site_settings")
      .select("key,value")
      .in("key", ["paytr_merchant_id", "paytr_merchant_key", "paytr_merchant_salt", "paytr_test_mode", "site_url"]);

    const cfg: Record<string, string> = {};
    (settings || []).forEach((s: { key: string; value: string }) => { cfg[s.key] = s.value; });

    const merchant_id = cfg.paytr_merchant_id;
    const merchant_key = cfg.paytr_merchant_key;
    const merchant_salt = cfg.paytr_merchant_salt;
    const test_mode = cfg.paytr_test_mode === "true" ? "1" : "0";
    const site_url = cfg.site_url || process.env.NEXT_PUBLIC_SITE_URL || "";

    if (!merchant_id || !merchant_key || !merchant_salt) {
      return NextResponse.json({ error: "PayTR ayarları eksik. Lütfen Admin > Ayarlar > PayTR bölümünü doldurun." }, { status: 400 });
    }

    const merchant_ok_url = `${site_url}/odeme/basarili`;
    const merchant_fail_url = `${site_url}/odeme/basarisiz`;
    const timeout_limit = "30";
    const currency = "TL";
    const no_installment = "0";
    const max_installment = "0";
    const lang = "tr";

    const user_basket = Buffer.from(JSON.stringify(cart_items)).toString("base64");
    const payment_amount = Math.round(amount * 100).toString();

    const hash_str = `${merchant_id}${user_ip}${order_id}${user_email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}${merchant_salt}`;
    const paytr_token = crypto.createHmac("sha256", merchant_key).update(hash_str).digest("base64");

    const formData = new URLSearchParams({
      merchant_id, user_ip, merchant_oid: order_id,
      email: user_email, payment_amount,
      paytr_token, user_basket,
      debug_on: cfg.paytr_debug_mode === "true" ? "1" : "0",
      no_installment, max_installment, user_name,
      user_address, user_phone, merchant_ok_url, merchant_fail_url,
      timeout_limit, currency, test_mode, lang,
    });

    const paytrRes = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const result = await paytrRes.json();

    if (result.status !== "success") {
      return NextResponse.json({ error: result.reason || "PayTR token alınamadı" }, { status: 400 });
    }

    return NextResponse.json({ token: result.token });
  } catch (err) {
    console.error("PayTR token error:", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
