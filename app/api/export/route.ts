import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table") || "users";
  const allowed = ["users", "contact_requests", "appointments", "products", "orders", "leads"];

  if (!allowed.includes(table)) {
    return NextResponse.json({ error: "Geçersiz tablo" }, { status: 400 });
  }

  const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!data || data.length === 0) {
    return new NextResponse("Veri bulunamadı", { status: 404 });
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return "";
        const str = typeof val === "object" ? JSON.stringify(val) : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(",")
    ),
  ];

  const csv = csvRows.join("\n");
  const filename = `${table}-${new Date().toISOString().substring(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
