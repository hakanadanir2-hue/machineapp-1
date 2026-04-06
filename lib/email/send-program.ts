import { getResend, FROM_EMAIL } from "@/lib/resend";
import { generateProgramPDF } from "@/lib/pdf/program-template";

interface SendProgramEmailParams {
  to: string;
  fullName: string;
  programType: string;
  programText: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  goal?: string;
  fitnessLevel?: string;
}

export async function sendProgramEmail(params: SendProgramEmailParams): Promise<void> {
  const sentAt = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });

  const pdfBuffer = await generateProgramPDF({
    fullName: params.fullName,
    email: params.to,
    programType: params.programType,
    programText: params.programText,
    age: params.age,
    gender: params.gender,
    height: params.height,
    weight: params.weight,
    goal: params.goal,
    fitnessLevel: params.fitnessLevel,
    sentAt,
  });

  const typeLabels: Record<string, string> = {
    fitness: "Fitness Programınız",
    beslenme: "Beslenme Programınız",
    combo: "Fitness + Beslenme Programınız",
  };
  const typeLabel = typeLabels[params.programType] || "Kişisel Programınız";

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Machine Gym — ${typeLabel} Hazır! 💪`,
    html: `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F4F4;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:#7A0D2A;padding:32px 40px;text-align:center">
      <h1 style="color:#fff;font-size:24px;margin:0;letter-spacing:1px">MACHINE GYM</h1>
      <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:6px 0 0">Bolu'nun Premium Fitness Salonu</p>
    </div>
    <div style="padding:40px">
      <h2 style="color:#1A1A1A;font-size:20px;margin:0 0 12px">Merhaba ${params.fullName}! 👋</h2>
      <p style="color:#4A4A4A;font-size:15px;line-height:1.7;margin:0 0 20px">
        <strong>${typeLabel}</strong> uzman ekibimiz tarafından hazırlandı ve ekte PDF olarak eklendi.
      </p>
      <div style="background:#FFF9E6;border-left:4px solid #D4AF37;border-radius:6px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0;color:#7A6000;font-size:14px;line-height:1.6">
          📋 Programınızı düzenli olarak uygulayın.<br>
          💧 Günlük su tüketiminize dikkat edin.<br>
          📞 Herhangi bir sorunda bize ulaşmaktan çekinmeyin.
        </p>
      </div>
      <div style="text-align:center;margin-bottom:28px">
        <a href="https://machinegym.com.tr/dashboard" style="display:inline-block;background:#7A0D2A;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:bold">Panelime Git →</a>
      </div>
      <hr style="border:none;border-top:1px solid #E0E0E0;margin:24px 0">
      <p style="color:#9A9A9A;font-size:12px;text-align:center;margin:0">
        Machine Gym · Tabaklar Mah. Uygur Sk. No:3, Bolu<br>
        Tel: +90 374 270 14 55 · <a href="https://instagram.com/gymachinebolu" style="color:#7A0D2A">@gymachinebolu</a>
      </p>
    </div>
  </div>
</body>
</html>`,
    attachments: [
      {
        filename: `machine-gym-${params.programType}-programi.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  if (error) throw new Error(`Mail gönderilemedi: ${JSON.stringify(error)}`);
}
