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

interface DayRow { day_name: string; focus: string; is_rest_day: boolean; total_duration_min?: number; warmup_notes?: string; cooldown_notes?: string; exercises: ExRow[]; }
interface ExRow  { exercise_name: string; sets: number; reps: string; rest_seconds?: number; notes?: string; }
interface MealRow { name: string; time: string; foods: string[]; calories: number; }
interface NutritionRow { daily_calories: number; protein_g: number; carb_g: number; fat_g: number; water_ml?: number; meals?: MealRow[]; general_notes?: string; }
interface WeekRow { week_number: number; notes?: string; days: DayRow[]; }

export interface ApprovedProgramEmailData {
  to: string;
  fullName: string;
  programTitle: string;
  programSummary: string;
  programId: string;
  weeks: WeekRow[];
  nutrition: NutritionRow | null;
  admin_notes?: string | null;
}

function renderExercises(exercises: ExRow[]): string {
  if (!exercises.length) return "";
  return `<table style="width:100%;border-collapse:collapse;margin-top:8px;">
    <tr style="background:rgba(106,13,37,0.08);">
      <th style="padding:6px 10px;text-align:left;font-size:11px;color:#888;font-weight:600;border-bottom:1px solid #eee;">#</th>
      <th style="padding:6px 10px;text-align:left;font-size:11px;color:#888;font-weight:600;border-bottom:1px solid #eee;">Egzersiz</th>
      <th style="padding:6px 10px;text-align:center;font-size:11px;color:#888;font-weight:600;border-bottom:1px solid #eee;">Set×Tekrar</th>
      <th style="padding:6px 10px;text-align:center;font-size:11px;color:#888;font-weight:600;border-bottom:1px solid #eee;">Dinlenme</th>
    </tr>
    ${exercises.map((ex, i) => `
    <tr style="border-bottom:1px solid #f5f5f5;">
      <td style="padding:7px 10px;font-size:12px;color:#aaa;">${i + 1}</td>
      <td style="padding:7px 10px;font-size:13px;color:#222;font-weight:500;">${ex.exercise_name}${ex.notes ? `<br><span style="font-size:11px;color:#aaa;font-weight:400;">${ex.notes}</span>` : ""}</td>
      <td style="padding:7px 10px;font-size:13px;color:#6A0D25;font-weight:700;text-align:center;">${ex.sets}×${ex.reps}</td>
      <td style="padding:7px 10px;font-size:12px;color:#888;text-align:center;">${ex.rest_seconds ?? 60}s</td>
    </tr>`).join("")}
  </table>`;
}

function renderWeeks(weeks: WeekRow[]): string {
  return weeks.map(week => {
    const trainingDays = week.days.filter(d => !d.is_rest_day);
    const restDays     = week.days.filter(d => d.is_rest_day);
    return `
    <div style="margin-bottom:24px;">
      <div style="background:#6A0D25;padding:10px 16px;border-radius:8px 8px 0 0;">
        <h3 style="margin:0;color:#D4AF37;font-size:14px;font-weight:800;">Hafta ${week.week_number}</h3>
        ${week.notes ? `<p style="margin:4px 0 0;color:rgba(255,255,255,.7);font-size:12px;">${week.notes}</p>` : ""}
      </div>
      ${trainingDays.map(day => `
      <div style="border:1px solid #eee;border-top:none;padding:14px 16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div>
            <span style="font-size:13px;font-weight:700;color:#222;">${day.day_name}</span>
            <span style="margin-left:8px;font-size:12px;color:#6A0D25;font-weight:600;">${day.focus}</span>
          </div>
          ${day.total_duration_min ? `<span style="font-size:11px;color:#aaa;">⏱ ${day.total_duration_min}dk</span>` : ""}
        </div>
        ${day.warmup_notes ? `<p style="margin:0 0 6px;font-size:11px;color:#888;">🔥 Isınma: ${day.warmup_notes}</p>` : ""}
        ${renderExercises(day.exercises)}
        ${day.cooldown_notes ? `<p style="margin:8px 0 0;font-size:11px;color:#888;">🧘 Soğuma: ${day.cooldown_notes}</p>` : ""}
      </div>`).join("")}
      ${restDays.length ? `<div style="border:1px solid #eee;border-top:none;padding:10px 16px;background:#fafafa;">
        <span style="font-size:12px;color:#aaa;">Dinlenme günleri: ${restDays.map(d => d.day_name).join(", ")}</span>
      </div>` : ""}
    </div>`;
  }).join("");
}

function renderNutrition(n: NutritionRow): string {
  return `
  <div style="margin-bottom:24px;">
    <h3 style="font-size:15px;font-weight:800;color:#6A0D25;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #f0e8d0;">🥗 Beslenme Planı</h3>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;">
      ${[
        ["Kalori", `${n.daily_calories} kcal`, "#6A0D25"],
        ["Protein", `${n.protein_g}g`, "#059669"],
        ["Karbonhidrat", `${n.carb_g}g`, "#d97706"],
        ["Yağ", `${n.fat_g}g`, "#7c3aed"],
      ].map(([l, v, c]) => `
      <div style="background:#f9f9f9;border-radius:8px;padding:10px;text-align:center;">
        <div style="font-size:16px;font-weight:800;color:${c};">${v}</div>
        <div style="font-size:10px;color:#888;margin-top:2px;">${l}</div>
      </div>`).join("")}
    </div>
    ${n.water_ml ? `<p style="font-size:12px;color:#888;margin:0 0 12px;">💧 Günlük su: ${(n.water_ml / 1000).toFixed(1)}L</p>` : ""}
    ${n.meals?.length ? `
    <table style="width:100%;border-collapse:collapse;">
      <tr style="background:#f5f5f5;">
        <th style="padding:8px 10px;text-align:left;font-size:11px;color:#888;border-bottom:1px solid #eee;">Öğün</th>
        <th style="padding:8px 10px;text-align:left;font-size:11px;color:#888;border-bottom:1px solid #eee;">Saat</th>
        <th style="padding:8px 10px;text-align:left;font-size:11px;color:#888;border-bottom:1px solid #eee;">İçerik</th>
        <th style="padding:8px 10px;text-align:right;font-size:11px;color:#888;border-bottom:1px solid #eee;">Kalori</th>
      </tr>
      ${n.meals.map(m => `
      <tr style="border-bottom:1px solid #f0f0f0;">
        <td style="padding:8px 10px;font-size:13px;font-weight:600;color:#222;">${m.name}</td>
        <td style="padding:8px 10px;font-size:12px;color:#888;">${m.time}</td>
        <td style="padding:8px 10px;font-size:12px;color:#555;">${Array.isArray(m.foods) ? m.foods.join(", ") : m.foods}</td>
        <td style="padding:8px 10px;font-size:12px;color:#6A0D25;font-weight:600;text-align:right;">${m.calories} kcal</td>
      </tr>`).join("")}
    </table>` : ""}
    ${n.general_notes ? `<p style="margin:12px 0 0;font-size:12px;color:#666;line-height:1.6;padding:10px;background:#fffbf0;border-radius:6px;border-left:3px solid #D4AF37;">${n.general_notes}</p>` : ""}
  </div>`;
}

export async function sendApprovedProgramEmail(data: ApprovedProgramEmailData): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL || "https://machinegym.biz";
  const fromUser = process.env.GMAIL_USER!;

  await transporter.sendMail({
    from:    `"Machine Gym" <${fromUser}>`,
    to:      data.to,
    subject: `✅ Kişisel Programın Hazır: ${data.programTitle}`,
    html: `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:620px;margin:24px auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

    <div style="background:linear-gradient(135deg,#6A0D25 0%,#8B1A35 100%);padding:32px;">
      <h1 style="margin:0 0 4px;color:#D4AF37;font-size:24px;font-weight:800;letter-spacing:1px;">MACHINE GYM</h1>
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;">Bolu'nun Premium Fitness & Boks Salonu</p>
    </div>

    <div style="padding:28px 32px 0;">
      <p style="font-size:15px;color:#333;margin:0 0 6px;">Merhaba <strong>${data.fullName}</strong>,</p>
      <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 20px;">
        Kişisel antrenman ve beslenme programın hazırlandı ve uzman ekibimiz tarafından onaylandı. Aşağıda tüm detayları bulabilirsin.
      </p>

      <div style="background:linear-gradient(135deg,#6A0D25,#8B1A35);border-radius:12px;padding:20px;margin-bottom:28px;">
        <h2 style="margin:0 0 8px;color:#D4AF37;font-size:18px;font-weight:800;">${data.programTitle}</h2>
        <p style="margin:0;color:rgba(255,255,255,0.85);font-size:13px;line-height:1.6;">${data.programSummary}</p>
      </div>

      ${data.admin_notes ? `<div style="margin-bottom:20px;padding:12px 16px;background:#fffbf0;border-left:4px solid #D4AF37;border-radius:0 8px 8px 0;">
        <p style="margin:0;font-size:13px;color:#555;"><strong style="color:#6A0D25;">Antrenör Notu:</strong> ${data.admin_notes}</p>
      </div>` : ""}

      <h3 style="font-size:15px;font-weight:800;color:#6A0D25;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #f0e8d0;">🏋️ Antrenman Programı</h3>
      ${renderWeeks(data.weeks)}

      ${data.nutrition ? renderNutrition(data.nutrition) : ""}

      <div style="text-align:center;margin:28px 0;">
        <a href="${siteUrl}/dashboard/programlarim"
           style="display:inline-block;background:#6A0D25;color:#D4AF37;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:800;font-size:15px;letter-spacing:0.5px;">
          Programını Görüntüle
        </a>
      </div>

      <div style="padding:16px;background:#f9f9f9;border-radius:10px;margin-bottom:20px;">
        <p style="margin:0;font-size:12px;color:#888;line-height:1.6;">
          Programla ilgili sorularınız için:<br/>
          📱 <strong>WhatsApp:</strong> +90 374 270 14 55<br/>
          📍 <strong>Adres:</strong> Tabaklar Mah. Uygur Sk. No:3, Bolu Merkez
        </p>
      </div>
    </div>

    <div style="background:#f9f9f9;padding:16px 32px;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;color:#aaa;font-size:11px;">© ${new Date().getFullYear()} Machine Gym — Bolu | machinegym.biz</p>
    </div>
  </div>
</body>
</html>`,
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

export interface AppointmentEmailData {
  fullName: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
}

export async function sendAppointmentNotification(data: AppointmentEmailData): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER!;
  const fromUser   = process.env.GMAIL_USER!;

  await transporter.sendMail({
    from:    `"Machine Gym" <${fromUser}>`,
    to:      adminEmail,
    subject: `📅 Yeni Randevu: ${data.fullName} — ${data.date} ${data.time}`,
    html: `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#6A0D25,#8B1A35);padding:28px 32px;">
      <h1 style="margin:0;color:#D4AF37;font-size:22px;font-weight:800;letter-spacing:1px;">MACHINE GYM</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Yeni Randevu Bildirimi</p>
    </div>
    <div style="padding:28px 32px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:13px;width:140px;">Ad Soyad</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#111;font-size:14px;font-weight:600;">${data.fullName}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:13px;">Telefon</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#111;font-size:14px;">${data.phone}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:13px;">E-posta</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#111;font-size:14px;">${data.email}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:13px;">Hizmet</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#6A0D25;font-size:14px;font-weight:700;">${data.service}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:13px;">Tarih</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#111;font-size:15px;font-weight:700;">${data.date}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:13px;">Saat</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#111;font-size:15px;font-weight:700;">${data.time}</td>
        </tr>
        ${data.notes ? `
        <tr>
          <td style="padding:10px 0;color:#888;font-size:13px;vertical-align:top;">Not</td>
          <td style="padding:10px 0;color:#555;font-size:13px;">${data.notes}</td>
        </tr>` : ""}
      </table>

      <div style="margin-top:24px;padding:14px 18px;background:#fff8f0;border-left:4px solid #D4AF37;border-radius:0 8px 8px 0;">
        <p style="margin:0;color:#6A0D25;font-size:13px;font-weight:600;">
          Bu randevu machinegym.biz üzerinden alındı. Admin panelinden onaylayabilirsiniz.
        </p>
      </div>

      <div style="margin-top:20px;text-align:center;">
        <a href="https://machinegym.biz/admin/randevular"
           style="display:inline-block;background:#6A0D25;color:#D4AF37;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">
          Admin Paneline Git
        </a>
      </div>
    </div>
    <div style="background:#f9f9f9;padding:14px 32px;text-align:center;border-top:1px solid #eee;">
      <p style="margin:0;color:#aaa;font-size:11px;">© ${new Date().getFullYear()} Machine Gym — Bolu</p>
    </div>
  </div>
</body>
</html>`,
  });
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
