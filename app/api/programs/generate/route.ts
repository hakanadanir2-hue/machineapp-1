import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime     = "nodejs";
export const maxDuration = 60;

interface UserProfile {
  full_name?: string;
  email?: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  goal: string;
  fitness_level: string;
  days_per_week: number;
  session_duration?: number;
  available_equipment?: string;
  diet_preference?: string;
  injuries?: string;
  medical_notes?: string;
}

interface AIExercise { name: string; sets: number; reps: string; rest_seconds: number; notes?: string; }
interface AIDay { day_number: number; day_name: string; focus: string; is_rest_day: boolean; exercises: AIExercise[]; warmup_notes?: string; cooldown_notes?: string; total_duration_min?: number; notes?: string; }
interface AIMeal { name: string; time: string; foods: string[]; calories: number; }
interface AIProgram {
  title: string;
  summary: string;
  weeks: [{ week_number: 1; notes: string; days: AIDay[] }];
  nutrition: { daily_calories: number; protein_g: number; carb_g: number; fat_g: number; water_ml: number; meal_count: number; meals: AIMeal[]; general_notes: string; };
}

function calcBMI(w: number, h: number) {
  const bmi = Math.round((w / Math.pow(h / 100, 2)) * 10) / 10;
  const cat  = bmi < 18.5 ? "Zayıf" : bmi < 25 ? "Normal" : bmi < 30 ? "Fazla kilolu" : "Obez";
  return { bmi, category: cat };
}

const INJURY_MAP: Record<string, string> = {
  "fıtık": "bel ve ağır squat/deadlift yok",
  "fitık": "bel ve ağır squat/deadlift yok",
  "diz":   "squat/lunge/jumping yok",
  "sırt":  "deadlift/good morning yok",
  "omuz":  "overhead press/upright row yok",
  "bilek": "pushup/plank modifiye et",
};

function injuryNote(injuries?: string) {
  if (!injuries) return "";
  const lower = injuries.toLowerCase();
  return Object.entries(INJURY_MAP).filter(([k]) => lower.includes(k)).map(([, v]) => v).join("; ");
}

async function callOpenAI(apiKey: string, systemMsg: string, userMsg: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method:  "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model:           "gpt-4o-mini",
      max_tokens:      3500,
      temperature:     0.7,
      messages:        [{ role: "system", content: systemMsg }, { role: "user", content: userMsg }],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    throw new Error(`OpenAI API hatası (${res.status}): ${txt.slice(0, 120)}`);
  }
  const json = await res.json() as { choices: { message: { content: string } }[] };
  return json.choices?.[0]?.message?.content ?? "";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { profile: UserProfile; user_id?: string; email?: string } | null;
  if (!body?.profile) return NextResponse.json({ error: "Profile verisi eksik" }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY ayarlı değil" }, { status: 500 });

  const p = body.profile;
  if (!p.age || !p.height_cm || !p.weight_kg || !p.goal)
    return NextResponse.json({ error: "Yaş, boy, kilo ve hedef zorunludur" }, { status: 400 });

  const { bmi, category: bmiCategory } = calcBMI(p.weight_kg, p.height_cm);
  const injNote = injuryNote(p.injuries);

  const systemPrompt = `Sen deneyimli bir kişisel antrenör ve spor beslenme uzmanısın. 
Kullanıcının verdiği fiziksel ölçüler, hedef, seviye ve kısıtlamalara göre GERÇEK ve UYGULANABİLİR antrenman + beslenme programı hazırlarsın.
KURALLAR:
- Her antrenman günü MUTLAKA 5-7 egzersiz içersin (ısınma hariç)
- Egzersizler Türkçe isimle yazılsın
- Gerçekçi set/tekrar/dinlenme süreleri kullan
- Beslenme planı kişinin kalorisine göre hesaplanmış olsun
- SADECE geçerli JSON döndür, başka hiçbir şey yazma`;

  const userPrompt = `Kullanıcı Profili:
- Cinsiyet: ${p.gender === "erkek" ? "Erkek" : "Kadın"}
- Yaş: ${p.age} | Boy: ${p.height_cm}cm | Kilo: ${p.weight_kg}kg | BMI: ${bmi} (${bmiCategory})
- Hedef: ${p.goal}
- Fitness Seviyesi: ${p.fitness_level}
- Haftada ${p.days_per_week} gün antrenman, günlük ${p.session_duration ?? 60} dakika
- Ekipman: ${p.available_equipment || "tam donanımlı spor salonu"}
- Beslenme tercihi: ${p.diet_preference || "standart"}
${p.injuries ? `- Sakatlık/Sağlık: ${p.injuries}` : ""}
${injNote ? `- KISITLAMALAR (bunlara KESİNLİKLE uy): ${injNote}` : ""}

GÖREV: 1 tam haftalık kişisel program oluştur.
- ${p.days_per_week} antrenman günü, ${7 - p.days_per_week} dinlenme günü
- Her antrenman gününde 5-7 egzersiz (ısınma hariç)
- Her egzersiz için: Türkçe isim, set sayısı, tekrar aralığı, dinlenme süresi, kısa form notu
- Antrenman günleri kas gruplarına göre dengeli dağıtılsın

JSON ÇIKTI FORMATI (bu yapıyı TAM olarak kullan, eksik bırakma):
{
  "title": "Kişiselleştirilmiş [hedef] Programı",
  "summary": "Bu programın amacını ve yapısını açıklayan 2-3 cümle.",
  "weeks": [{
    "week_number": 1,
    "notes": "Bu hafta için genel notlar",
    "days": [
      {
        "day_number": 1,
        "day_name": "Pazartesi",
        "focus": "Göğüs + Triseps",
        "is_rest_day": false,
        "warmup_notes": "5-10 dk hafif kardiyo, eklem hareketleri",
        "cooldown_notes": "5-10 dk esneme, nefes egzersizleri",
        "total_duration_min": 60,
        "notes": "Bu günün özel notu",
        "exercises": [
          {"name": "Baribell Bench Press (Düz Baskı)", "sets": 4, "reps": "8-10", "rest_seconds": 90, "notes": "Kürek kemiklerini bir araya getir"},
          {"name": "İnkline Dumbbell Press (Eğimli Dumbbell Baskı)", "sets": 3, "reps": "10-12", "rest_seconds": 75, "notes": "30-45 derece eğim"},
          {"name": "Kablo Göğüs Flye (Çapraz Kablo)", "sets": 3, "reps": "12-15", "rest_seconds": 60, "notes": "Tam aralıkta hareket et"},
          {"name": "Triceps Rope Pushdown (Halat Triceps)", "sets": 3, "reps": "12-15", "rest_seconds": 60, "notes": "Dirsekleri sabit tut"},
          {"name": "Triceps Skull Crusher (Kafatası Kıran)", "sets": 3, "reps": "10-12", "rest_seconds": 60, "notes": "Kontrollü hareket"},
          {"name": "Dips (Paralel Bar)", "sets": 3, "reps": "8-12", "rest_seconds": 75, "notes": "Öne doğru hafif eğil"}
        ]
      },
      {
        "day_number": 2,
        "day_name": "Salı",
        "focus": "Dinlenme",
        "is_rest_day": true,
        "warmup_notes": null,
        "cooldown_notes": null,
        "total_duration_min": null,
        "notes": "Aktif dinlenme: yürüyüş veya hafif esneme",
        "exercises": []
      }
    ]
  }],
  "nutrition": {
    "daily_calories": 2400,
    "protein_g": 180,
    "carb_g": 240,
    "fat_g": 80,
    "water_ml": 3000,
    "meal_count": 5,
    "meals": [
      {"name": "Kahvaltı", "time": "07:30", "foods": ["Yulaf ezmesi 80g", "Yumurta 3 adet", "Muz 1 adet", "Süt 200ml"], "calories": 620},
      {"name": "Ara Öğün 1", "time": "10:30", "foods": ["Lor peyniri 150g", "Elma 1 adet"], "calories": 280},
      {"name": "Öğle", "time": "13:00", "foods": ["Tavuk göğsü 200g (ızgara)", "Bulgur pilavı 150g", "Salata"], "calories": 680},
      {"name": "Antrenman Sonrası", "time": "17:00", "foods": ["Whey protein 1 ölçek", "Muz 1 adet", "Süt 200ml"], "calories": 350},
      {"name": "Akşam", "time": "20:00", "foods": ["Somon 180g", "Haşlanmış sebze 200g", "Zeytinyağı 1 yemek kaşığı"], "calories": 480}
    ],
    "general_notes": "Kişinin hedefine ve kalorisine göre özelleştirilmiş notlar buraya"
  }
}

Tüm ${p.days_per_week} antrenman gününü doldur. Hiçbir antrenman günü 5'ten az egzersiz içermesin.`;
  // ── OpenAI call ──────────────────────────────────────────────────────────
  let raw = "";
  try {
    raw = await callOpenAI(apiKey, systemPrompt, userPrompt);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "OpenAI hatası" }, { status: 500 });
  }

  if (!raw) return NextResponse.json({ error: "AI boş yanıt döndürdü. Tekrar deneyin." }, { status: 500 });

  let prog: AIProgram;
  try {
    prog = JSON.parse(raw) as AIProgram;
    if (!prog.title || !prog.weeks?.[0]?.days) throw new Error("Geçersiz yapı");
  } catch {
    return NextResponse.json({ error: "AI geçersiz yanıt döndürdü. Tekrar deneyin." }, { status: 500 });
  }

  // ── DB saves (batched — 4 queries instead of 14+) ───────────────────────
  const admin = createAdminClient();
  const now   = new Date().toISOString();
  const week  = prog.weeks[0];

  const { data: saved, error: progErr } = await admin.from("programs").insert({
    user_id: body.user_id ?? null, title: prog.title, summary: prog.summary,
    duration_weeks: 4, days_per_week: p.days_per_week, goal: p.goal,
    fitness_level: p.fitness_level, status: "pending", ai_model: "gpt-4o-mini",
    created_at: now, updated_at: now,
  }).select("id").single();

  if (progErr || !saved)
    return NextResponse.json({ error: `Program kaydedilemedi: ${progErr?.message}` }, { status: 500 });

  const programId = saved.id as string;

  const { data: weekRow } = await admin.from("program_weeks")
    .insert({ program_id: programId, week_number: 1, notes: week.notes ?? "" })
    .select("id").single();
  const weekId = weekRow?.id as string | null ?? null;

  // Batch insert all 7 days at once
  const { data: dayRows } = await admin.from("program_days")
    .insert(week.days.map(d => ({
      program_id: programId, week_id: weekId, week_number: 1,
      day_number: d.day_number, day_name: d.day_name, focus: d.focus,
      is_rest_day: d.is_rest_day ?? false,
      warmup_notes: d.warmup_notes ?? null, cooldown_notes: d.cooldown_notes ?? null,
      total_duration_min: d.total_duration_min ?? null, notes: d.notes ?? null,
    })))
    .select("id, day_number");

  const dayIdMap = new Map<number, string>((dayRows ?? []).map(r => [r.day_number as number, r.id as string]));

  // Batch insert ALL exercises at once
  const allExercises = week.days.flatMap(d => {
    if (d.is_rest_day || !d.exercises?.length) return [];
    const dayId = dayIdMap.get(d.day_number);
    if (!dayId) return [];
    return d.exercises.map((ex, i) => ({
      program_day_id: dayId, exercise_name: ex.name, sets: ex.sets,
      reps: ex.reps, rest_seconds: ex.rest_seconds ?? 60,
      notes: ex.notes ?? null, order_index: i,
    }));
  });
  if (allExercises.length > 0) await admin.from("program_exercises").insert(allExercises);

  if (prog.nutrition) {
    await admin.from("nutrition_plans").insert({
      program_id: programId, daily_calories: prog.nutrition.daily_calories,
      protein_g: prog.nutrition.protein_g, carb_g: prog.nutrition.carb_g,
      fat_g: prog.nutrition.fat_g, water_ml: prog.nutrition.water_ml ?? 2500,
      meal_count: prog.nutrition.meal_count, meals: prog.nutrition.meals,
      general_notes: prog.nutrition.general_notes,
    });
  }

  return NextResponse.json({
    success: true, programId, title: prog.title, summary: prog.summary,
    status: "pending", bmi, bmiCategory,
    message: "Programın hazırlandı! Admin onayı sonrası sana iletilecek.",
  });
}
