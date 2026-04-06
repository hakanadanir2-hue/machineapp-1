import { NextRequest, NextResponse } from "next/server";
import { getResend, FROM_EMAIL } from "@/lib/resend";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { email: string; fullName: string } | null;
  if (!body?.email) return NextResponse.json({ error: "E-posta zorunludur" }, { status: 400 });

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: body.email,
      subject: "Machine Gym'e Hoş Geldiniz! 💪",
      html: `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F4F4;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:#7A0D2A;padding:36px 40px;text-align:center">
      <h1 style="color:#fff;font-size:26px;margin:0;letter-spacing:2px">MACHINE GYM</h1>
      <p style="color:rgba(255,255,255,0.65);font-size:13px;margin:8px 0 0">Bolu'nun Premium Fitness Salonu</p>
    </div>
    <div style="padding:40px">
      <h2 style="color:#1A1A1A;font-size:22px;margin:0 0 8px">Hoş Geldiniz${body.fullName ? `, ${body.fullName.split(" ")[0]}` : ""}! 🎉</h2>
      <p style="color:#4A4A4A;font-size:15px;line-height:1.7;margin:0 0 24px">
        Üyeliğiniz başarıyla oluşturuldu. Machine Gym ailesine katıldığınız için teşekkür ederiz.
      </p>
      <div style="display:grid;gap:12px;margin-bottom:28px">
        <div style="background:#F9F9F9;border-left:4px solid #7A0D2A;border-radius:6px;padding:14px 18px">
          <strong style="color:#7A0D2A;font-size:13px">💪 Kişisel Fitness Programı</strong>
          <p style="color:#4A4A4A;font-size:13px;margin:4px 0 0;line-height:1.6">885 egzersizlik kütüphanemizden size özel hazırlanmış antrenman planı.</p>
        </div>
        <div style="background:#F9F9F9;border-left:4px solid #D4AF37;border-radius:6px;padding:14px 18px">
          <strong style="color:#7A6000;font-size:13px">🥗 Kişisel Beslenme Programı</strong>
          <p style="color:#4A4A4A;font-size:13px;margin:4px 0 0;line-height:1.6">Makrolarınıza ve hedefinize göre özel yemek planı.</p>
        </div>
      </div>
      <div style="text-align:center;margin-bottom:32px">
        <a href="https://machinegym.com.tr/dashboard" style="display:inline-block;background:#7A0D2A;color:#fff;text-decoration:none;padding:16px 40px;border-radius:10px;font-size:15px;font-weight:bold;letter-spacing:0.5px">Panelime Git →</a>
      </div>
      <div style="background:#FFF9E6;border-radius:8px;padding:16px 20px;margin-bottom:24px">
        <p style="color:#7A6000;font-size:13px;margin:0;line-height:1.7">
          📞 Sorularınız için: <strong>+90 374 270 14 55</strong><br>
          📍 Tabaklar Mah. Uygur Sk. No:3, Bolu Merkez<br>
          📸 Instagram: <a href="https://instagram.com/gymachinebolu" style="color:#7A0D2A">@gymachinebolu</a>
        </p>
      </div>
    </div>
    <div style="background:#1A1A1A;padding:18px 40px;text-align:center">
      <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0">© Machine Gym · machinegym.com.tr</p>
    </div>
  </div>
</body>
</html>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Welcome email error:", err);
    return NextResponse.json({ error: "Mail gönderilemedi" }, { status: 500 });
  }
}
