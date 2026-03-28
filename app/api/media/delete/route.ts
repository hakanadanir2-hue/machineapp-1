import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { path } = await req.json();
  if (!path) return NextResponse.json({ error: "No path" }, { status: 400 });

  let admin;
  try { admin = createAdminClient(); } catch { admin = null; }
  const client = admin;

  const { error } = await (client as ReturnType<typeof createAdminClient>).storage
    .from("gallery")
    .remove([path]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
