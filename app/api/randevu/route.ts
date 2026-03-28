import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAppointmentNotification } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimit(ip, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Çok fazla istek. 1 saat sonra tekrar dene." }, { status: 429 });
  }

  const body = await req.json().catch(() => null) as {
    full_name: string;
    email: string;
    phone: string;
    service: string;
    serviceLabel: string;
    date: string;
    time: string;
    notes?: string;
  } | null;

  if (!body?.full_name || !body?.email || !body?.phone || !body?.service || !body?.date || !body?.time)
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });

  const admin = createAdminClient();

  const { error: leadErr } = await admin.from("leads").insert({
    type:          "appointment",
    status:        "new",
    is_read:       false,
    name:          body.full_name,
    email:         body.email,
    phone:         body.phone,
    appt_date:     body.date,
    appt_time:     body.time,
    appt_service:  body.service,
    appt_notes:    body.notes || null,
    message:       `Randevu: ${body.serviceLabel} — ${body.date} ${body.time}`,
  });

  if (leadErr) {
    console.error("Randevu kaydedilemedi:", leadErr.message);
    return NextResponse.json({ error: "Randevu kaydedilemedi" }, { status: 500 });
  }

  const formattedDate = (() => {
    try {
      return format(new Date(body.date), "d MMMM yyyy", { locale: tr });
    } catch {
      return body.date;
    }
  })();

  sendAppointmentNotification({
    fullName: body.full_name,
    email:    body.email,
    phone:    body.phone,
    service:  body.serviceLabel,
    date:     formattedDate,
    time:     body.time,
    notes:    body.notes,
  }).catch(err => console.error("E-posta gönderilemedi:", err));

  return NextResponse.json({ success: true });
}
