import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const [{ data: orders }, { data: payments }] = await Promise.all([
    sb.from("membership_orders").select("*").order("created_at", { ascending: false }).limit(20),
    sb.from("payments").select("*").order("created_at", { ascending: false }).limit(20),
  ]);

  return NextResponse.json({ orders: orders ?? [], payments: payments ?? [] });
}
