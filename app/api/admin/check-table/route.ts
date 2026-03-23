import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table");
  if (!table) return NextResponse.json({ error: "table required" }, { status: 400 });

  try {
    const admin = createAdminClient();
    const { count, error } = await admin
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error) {
      return NextResponse.json({ exists: false, count: 0, error: error.message });
    }
    return NextResponse.json({ exists: true, count: count ?? 0 });
  } catch {
    return NextResponse.json({ exists: false, count: 0 });
  }
}
