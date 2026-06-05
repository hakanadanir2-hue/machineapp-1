import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// DELETE: Hem profiles tablosundan hem de auth.users'tan tamamen sil
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  // Kendi hesabını silme koruması
  if (id === guard.userId) {
    return NextResponse.json({ error: "Kendi hesabınızı silemezsiniz" }, { status: 400 });
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Service role key eksik" }, { status: 503 });
  }

  // 1. Profiles silmeye gerek yok — auth.users silinince ON DELETE CASCADE çalışır.
  //    Yine de FK yoksa garanti olsun diye profiles'ı önce siliyoruz.
  await admin.from("profiles").delete().eq("id", id);

  // 2. Auth user sil
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
