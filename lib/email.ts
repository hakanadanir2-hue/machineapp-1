import nodemailer from "nodemailer";

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export interface ProgramEmailData {
  to: string;
  fullName: string;
  programTitle: string;
  programSummary: string;
  programId: string;
  bmi?: number;
  bmiCategory?: string;
}

export async function sendProgramEmail(data: ProgramEmailData): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://machinegym.biz";
  const fromName = "Machine Gym";
  const fromUser = process.env.GMAIL_USER!;

  await transporter.sendMail({
    from: `"${fromName}" <${fromUser}>`,
    to: data.to,
    subject: `Kişisel Programın Hazır: ${data.programTitle}`,
    html: `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#1a1a1a;border-radius:12px;overflow:hidden;">

    <div style="background:linear-gradient(135deg,#6A0D25,#8B1A35);padding:40px 32px;text-align:center;">
      <h1 style="margin:0;color:#D4AF37;font-size:28px;font-weight:800;letter-spacing:2px;">MACHINE GYM</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Kişisel Programın Hazırlandı</p>
    </div>

    <div style="padding:32px;">
      <p style="color:rgba(255,255,255,0.85);font-size:16px;margin:0 0 16px;">
        Merhaba <strong style="color:#D4AF37;">${data.fullName}</strong>,
      </p>
      <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;margin:0 0 24px;">
        Kişisel fitness ve beslenme programın oluşturuldu.
        Admin onayından geçtikten sonra hesabına eklenecek ve detaylı program sana iletilecek.
      </p>

      <div style="background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:24px;margin-bottom:24px;">
        <h2 style="color:#D4AF37;font-size:18px;margin:0 0 12px;">${data.programTitle}</h2>
        <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;margin:0 0 16px;">${data.programSummary}</p>
        ${data.bmi ? `
        <table style="border-collapse:collapse;">
          <tr>
            <td style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:10px 20px;text-align:center;margin-right:12px;">
              <p style="margin:0;color:#D4AF37;font-size:20px;font-weight:700;">${data.bmi}</p>
              <p style="margin:2px 0 0;color:rgba(255,255,255,0.4);font-size:11px;">BMI</p>
            </td>
            <td style="width:12px;"></td>
            <td style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:10px 20px;text-align:center;">
              <p style="margin:0;color:#D4AF37;font-size:14px;font-weight:700;">${data.bmiCategory}</p>
              <p style="margin:2px 0 0;color:rgba(255,255,255,0.4);font-size:11px;">Kategori</p>
            </td>
          </tr>
        </table>` : ""}
      </div>

      <div style="background:#1a2a1a;border:1px solid #2a3a2a;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;color:#4ade80;font-size:13px;">
          ⏳ Programın admin tarafından inceleniyor. Onaylandığında hesabına eklenecek.
        </p>
      </div>

      <div style="text-align:center;margin-bottom:24px;">
        <a href="${siteUrl}/dashboard/programlarim"
           style="display:inline-block;background:#6A0D25;color:#D4AF37;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">
          Programlarımı Görüntüle
        </a>
      </div>

      <p style="color:rgba(255,255,255,0.35);font-size:12px;text-align:center;margin:0;">
        Sorularınız için:
        <a href="https://wa.me/903742701455" style="color:#D4AF37;text-decoration:none;">WhatsApp'tan yazın</a>
      </p>
    </div>

    <div style="background:#111;padding:16px 32px;text-align:center;border-top:1px solid #222;">
      <p style="margin:0;color:rgba(255,255,255,0.2);font-size:11px;">© ${new Date().getFullYear()} Machine Gym — Bolu</p>
    </div>
  </div>
</body>
</html>`,
  });
}
