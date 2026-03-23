import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const userClient = await createClient();
  const { data: { session } } = await userClient.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { path } = await req.json();
  if (!path) return NextResponse.json({ error: "No path" }, { status: 400 });

  let admin;
  try { admin = createAdminClient(); } catch { admin = null; }
  const client = admin ?? userClient;

  const { error } = await (client as ReturnType<typeof createAdminClient>).storage
    .from("gallery")
    .remove([path]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
