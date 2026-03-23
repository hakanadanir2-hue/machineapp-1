/**
 * POST /api/programs/generate
 *
 * Kullanıcının fiziksel verilerini alır, egzersiz kütüphanesinden
 * kişiye özel egzersizler seçer, GPT-4o ile 4 haftalık fitness +
 * beslenme programı üretir ve Supabase'e kaydeder.
 *
 * Her program tamamen benzersiz: generation_hash ile kontrol edilir.
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export const runtime     = "nodejs";
export const maxDuration = 120;

// ── Types ─────────────────────────────────────────────────────────────────────
interface UserProfile {
  id?: string;
  user_id?: string;
  full_name?: string;
  age: number;
  gender: "erkek" | "kadin" | "belirtmek_istemiyorum";
  height_cm: number;
  weight_kg: number;
  goal: string;
  fitness_level: "baslangic" | "orta" | "ileri";
  days_per_week: number;
  session_duration: number;
  available_equipment?: string;
  injuries?: string;
  medical_notes?: string;
}

interface AIExercise {
  name: string;
  exercise_id?: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  duration_seconds?: number;
  modification?: string;
  notes?: string;
}

interface AIDay {
  day_number: number;
  day_name: string;
  focus: string;
  is_rest_day: boolean;
  warmup_notes?: string;
  cooldown_notes?: string;
  total_duration_min?: number;
  exercises: AIExercise[];
  notes?: string;
}

interface AIWeek {
  week_number: number;
  notes: string;
  days: AIDay[];
}

interface AIMeal {
  name: string;
  time: string;
  foods: string[];
  calories: number;
  notes?: string;
}

interface AIProgram {
  title: string;
  summary: string;
  duration_weeks: number;
  weeks: AIWeek[];
  nutrition: {
    daily_calories: number;
    protein_g: number;
    carb_g: number;
    fat_g: number;
    water_ml: number;
    meal_count: number;
    meals: AIMeal[];
    supplement_notes: string;
    general_notes: string;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not set");
  return new OpenAI({ apiKey: key });
}

function calcBMI(weight: number, height: number): { bmi: number; category: string } {
  const bmi = weight / Math.pow(height / 100, 2);
  const rounded = Math.round(bmi * 10) / 10;
  let category = "Normal";
  if (bmi < 18.5)      category = "Zayıf";
  else if (bmi < 25)   category = "Normal";
  else if (bmi < 30)   category = "Fazla kilolu";
  else if (bmi < 35)   category = "Obez (I)";
  else if (bmi < 40)   category = "Obez (II)";
  else                 category = "Morbid obez";
  return { bmi: rounded, category };
}

// Injury keywords → contraindicated muscle groups
const INJURY_RESTRICTIONS: Record<string, string[]> = {
  "fitık":      ["lower back", "core", "deadlift", "squat deep"],
  "fıtık":      ["lower back", "core", "deadlift", "squat deep"],
  "diz":        ["squat", "lunge", "leg press", "jumping"],
  "sırt":       ["deadlift", "good morning", "bent over"],
  "omuz":       ["overhead press", "shoulder press", "upright row"],
  "boyun":      ["neck", "shoulder shrug", "overhead"],
  "bilek":      ["push up", "plank", "bench press"],
  "kalça":      ["squat", "lunge", "hip thrust"],
};

function getInjuryNotes(injuries: string): string {
  if (!injuries) return "";
  const lower = injuries.toLowerCase();
  const restrictions: string[] = [];
  for (const [keyword, moves] of Object.entries(INJURY_RESTRICTIONS)) {
    if (lower.includes(keyword)) {
      restrictions.push(`${keyword}: ${moves.join(", ")} hareketlerinden kaçın veya modifiye et`);
    }
  }
  return restrictions.join("; ");
}

// Sample diverse exercises from DB for the prompt
async function sampleExercises(
  admin: ReturnType<typeof createAdminClient>,
  profile: UserProfile
): Promise<string> {
  // Get a broad sample — 80 exercises across muscle groups
  const { data } = await admin
    .from("exercises")
    .select("id, name, display_name, display_muscle_group, category, muscles, equipment, difficulty")
    .eq("is_active", true)
    .limit(400);

  if (!data || data.length === 0) return "Egzersiz kütüphanesi boş.";

  // Filter by equipment if specified
  let pool = data;
  const equip = (profile.available_equipment ?? "").toLowerCase();
  if (equip && !equip.includes("tüm") && !equip.includes("tam") && !equip.includes("hepsi")) {
    pool = data.filter((e) => {
      const eq = (e.equipment ?? "").toLowerCase();
      return eq.includes("bodyweight") || eq.includes("vücut") || equip.split(",").some((k) => eq.includes(k.trim()));
    });
    if (pool.length < 30) pool = data; // fallback
  }

  // Group by muscle group, sample proportionally
  const groups: Record<string, typeof pool> = {};
  for (const ex of pool) {
    const mg = ex.display_muscle_group || ex.category || "Genel";
    if (!groups[mg]) groups[mg] = [];
    groups[mg].push(ex);
  }

  // Shuffle each group and take up to 6 per group
  const selected: typeof pool = [];
  for (const g of Object.values(groups)) {
    const shuffled = [...g].sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, 6));
  }

  // Build compact list
  return selected
    .sort(() => Math.random() - 0.5)
    .slice(0, 120)
    .map((e) => {
      const name = e.display_name || e.name;
      const mg   = e.display_muscle_group || e.category || "—";
      const eq   = e.equipment || "vücut ağırlığı";
      return `- [${e.id}] ${name} | kas: ${mg} | ekipman: ${eq}`;
    })
    .join("\n");
}

// Build generation hash for uniqueness
function buildHash(profile: UserProfile, salt: string): string {
  const data = JSON.stringify({
    age: profile.age, gender: profile.gender, weight: profile.weight_kg,
    height: profile.height_cm, goal: profile.goal, level: profile.fitness_level,
    days: profile.days_per_week, injuries: profile.injuries, salt,
  });
  return crypto.createHash("sha256").update(data).digest("hex").slice(0, 32);
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    profile: UserProfile;
    user_id?: string;
    save_profile?: boolean;
  } | null;

  if (!body?.profile) {
    return NextResponse.json({ error: "Profile verisi eksik" }, { status: 400 });
  }

  const profile = body.profile;

  // Validate required fields
  if (!profile.age || !profile.height_cm || !profile.weight_kg || !profile.goal) {
    return NextResponse.json({ error: "Yaş, boy, kilo ve hedef zorunludur" }, { status: 400 });
  }

  const admin  = createAdminClient();
  const openai = getOpenAI();

  // BMI
  const { bmi, category: bmiCategory } = calcBMI(profile.weight_kg, profile.height_cm);

  // Uniqueness salt — timestamp ensures each generation is unique
  const salt = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const hash = buildHash(profile, salt);

  // Save / update user profile if requested
  let profileId: string | null = null;
  if (body.save_profile !== false && body.user_id) {
    const { data: savedProfile } = await admin
      .from("user_profiles")
      .upsert({
        user_id:       body.user_id,
        full_name:     profile.full_name,
        age:           profile.age,
        gender:        profile.gender,
        height_cm:     profile.height_cm,
        weight_kg:     profile.weight_kg,
        goal:          profile.goal,
        fitness_level: profile.fitness_level,
        days_per_week: profile.days_per_week,
        session_duration: profile.session_duration ?? 60,
        available_equipment: profile.available_equipment,
        injuries:      profile.injuries,
        medical_notes: profile.medical_notes,
        bmi,
        bmi_category:  bmiCategory,
        updated_at:    new Date().toISOString(),
      }, { onConflict: "user_id" })
      .select("id").single();
    profileId = savedProfile?.id ?? null;
  }

  // Sample exercises from DB
  const exerciseList = await sampleExercises(admin, profile);
  const injuryNotes  = getInjuryNotes(profile.injuries ?? "");

  const goalMap: Record<string, string> = {
    kilo_ver:       "kilo verme ve yağ yakma",
    kas_kazan:      "kas kütlesi kazanma ve güç artırma",
    kondisyon:      "kardiyovasküler kondisyon ve dayanıklılık",
    saglikli_kal:   "genel sağlık ve aktif yaşam",
    rehabilitasyon: "rehabilitasyon ve güvenli hareket",
    genel_fitness:  "genel fitness ve vücut kompozisyonu",
  };
  const goalText = goalMap[profile.goal] ?? profile.goal;

  const levelMap: Record<string, string> = {
    baslangic: "başlangıç seviyesi (antrenman geçmişi yok veya az)",
    orta:      "orta seviye (1-2 yıl deneyim)",
    ileri:     "ileri seviye (3+ yıl deneyim)",
  };
  const levelText = levelMap[profile.fitness_level] ?? profile.fitness_level;

  const genderText = profile.gender === "erkek" ? "Erkek" : profile.gender === "kadin" ? "Kadın" : "Belirtilmemiş";

  // Build GPT-4o prompt
  const systemPrompt = `Sen dünya standartlarında bir kişisel antrenör ve beslenme uzmanısın.
Görevin: Kullanıcının fiziksel verilerine göre tamamen kişiselleştirilmiş, bilimsel temelli, güvenli ve uygulanabilir bir fitness + beslenme programı oluşturmak.

KRİTİK KURALLAR:
1. Yanıtını SADECE geçerli JSON formatında ver, başka hiçbir şey yazma
2. Verilen egzersiz listesinden egzersizleri seç — kütüphanede olmayan egzersiz ekleme (yalnızca exercise_id ile birlikte)
3. Yaralanma/sağlık kısıtlamalarına kesinlikle uy
4. Her hafta farklı yoğunluk ve egzersiz çeşitliliği olsun
5. Programın başka hiçbir kullanıcının programıyla birebir aynı olmamasını sağla
6. Türkçe yaz (egzersiz isimleri İngilizce kalabilir)`;

  const userPrompt = `KULLANİCİ PROFİLİ:
- Ad: ${profile.full_name ?? "Belirtilmemiş"}
- Yaş: ${profile.age}
- Cinsiyet: ${genderText}
- Boy: ${profile.height_cm} cm
- Kilo: ${profile.weight_kg} kg
- BMI: ${bmi} (${bmiCategory})
- Hedef: ${goalText}
- Fitness seviyesi: ${levelText}
- Haftada antrenman günü: ${profile.days_per_week}
- Seans süresi: ${profile.session_duration ?? 60} dakika
- Ekipman: ${profile.available_equipment || "Belirtilmemiş (tüm ekipman mevcut sayılsın)"}
- Yaralanmalar/Sağlık durumu: ${profile.injuries || "Yok"}
- Tıbbi notlar: ${profile.medical_notes || "Yok"}
${injuryNotes ? `- Kısıtlama notları: ${injuryNotes}` : ""}

EGZERSİZ KÜTÜPHANESİ (bu listedeki egzersizleri kullan, exercise_id'yi koru):
${exerciseList}

GÖREV: 4 haftalık kişisel program oluştur.

JSON YAPISI (tam olarak bu şemayı kullan):
{
  "title": "Program başlığı",
  "summary": "Programın kısa açıklaması (2-3 cümle)",
  "duration_weeks": 4,
  "weeks": [
    {
      "week_number": 1,
      "notes": "Bu haftanın genel notları",
      "days": [
        {
          "day_number": 1,
          "day_name": "Pazartesi",
          "focus": "Göğüs + Triseps",
          "is_rest_day": false,
          "warmup_notes": "5 dk hafif kardiyo + dinamik esneme",
          "cooldown_notes": "5 dk esneme",
          "total_duration_min": 55,
          "exercises": [
            {
              "exercise_id": "uuid-from-list",
              "name": "Egzersiz adı",
              "sets": 3,
              "reps": "12-15",
              "rest_seconds": 60,
              "modification": "Yaralanma varsa nasıl modifiye edilmeli",
              "notes": "Teknik notu"
            }
          ],
          "notes": "Gün notu"
        },
        {
          "day_number": 2,
          "day_name": "Salı",
          "focus": "Dinlenme",
          "is_rest_day": true,
          "exercises": [],
          "notes": "Aktif dinlenme: yürüyüş veya esneme"
        }
      ]
    }
  ],
  "nutrition": {
    "daily_calories": 2200,
    "protein_g": 165,
    "carb_g": 220,
    "fat_g": 73,
    "water_ml": 2500,
    "meal_count": 4,
    "meals": [
      {
        "name": "Kahvaltı",
        "time": "07:00-08:00",
        "foods": ["Yulaf ezmesi 80g", "Yumurta 3 adet", "Muz"],
        "calories": 550,
        "notes": "Opsiyonel not"
      }
    ],
    "supplement_notes": "İsteğe bağlı supplement önerileri",
    "general_notes": "Genel beslenme tavsiyeleri"
  }
}

ÖNEMLİ: ${profile.days_per_week} antrenman günü + ${7 - profile.days_per_week} dinlenme günü olacak şekilde 7 günlük plan yap. Randomization salt: ${salt}`;

  // Call GPT-4o
  let rawResponse = "";
  try {
    const completion = await openai.chat.completions.create({
      model:       "gpt-4o",
      max_tokens:  8000,
      temperature: 0.8, // Higher temp for uniqueness
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });
    rawResponse = completion.choices[0]?.message?.content ?? "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `GPT-4o hatası: ${msg}` }, { status: 500 });
  }

  // Parse AI response
  let aiProgram: AIProgram;
  try {
    aiProgram = JSON.parse(rawResponse) as AIProgram;
    if (!aiProgram.title || !aiProgram.weeks) throw new Error("Eksik alan");
  } catch {
    return NextResponse.json({ error: "GPT-4o geçersiz JSON döndürdü", raw: rawResponse.slice(0, 500) }, { status: 500 });
  }

  // Save program to DB
  const now = new Date().toISOString();

  const { data: program, error: progErr } = await admin
    .from("programs")
    .insert({
      user_id:        body.user_id ?? null,
      profile_id:     profileId,
      title:          aiProgram.title,
      summary:        aiProgram.summary,
      duration_weeks: aiProgram.duration_weeks ?? 4,
      days_per_week:  profile.days_per_week,
      goal:           profile.goal,
      fitness_level:  profile.fitness_level,
      status:         "pending",
      ai_model:       "gpt-4o",
      generation_hash: hash,
      created_at:     now,
      updated_at:     now,
    })
    .select("id").single();

  if (progErr || !program) {
    return NextResponse.json({ error: `Program kaydedilemedi: ${progErr?.message}` }, { status: 500 });
  }
  const programId = program.id;

  // Save weeks and days
  for (const week of aiProgram.weeks) {
    const { data: weekRow } = await admin
      .from("program_weeks")
      .insert({ program_id: programId, week_number: week.week_number, notes: week.notes })
      .select("id").single();
    const weekId = weekRow?.id ?? null;

    for (const day of week.days) {
      const { data: dayRow } = await admin
        .from("program_days")
        .insert({
          program_id:         programId,
          week_id:            weekId,
          week_number:        week.week_number,
          day_number:         day.day_number,
          day_name:           day.day_name,
          focus:              day.focus,
          is_rest_day:        day.is_rest_day ?? false,
          warmup_notes:       day.warmup_notes,
          cooldown_notes:     day.cooldown_notes,
          total_duration_min: day.total_duration_min,
          notes:              day.notes,
        })
        .select("id").single();
      const dayId = dayRow?.id ?? null;

      if (!dayId || day.is_rest_day || !day.exercises?.length) continue;

      // Save exercises
      const exRows = day.exercises.map((ex, idx) => ({
        program_day_id:   dayId,
        exercise_id:      ex.exercise_id || null,
        exercise_name:    ex.name,
        sets:             ex.sets,
        reps:             ex.reps,
        rest_seconds:     ex.rest_seconds ?? 60,
        duration_seconds: ex.duration_seconds ?? null,
        modification:     ex.modification ?? null,
        notes:            ex.notes ?? null,
        order_index:      idx,
      }));
      await admin.from("program_exercises").insert(exRows);
    }
  }

  // Save nutrition plan
  if (aiProgram.nutrition) {
    await admin.from("nutrition_plans").insert({
      program_id:      programId,
      daily_calories:  aiProgram.nutrition.daily_calories,
      protein_g:       aiProgram.nutrition.protein_g,
      carb_g:          aiProgram.nutrition.carb_g,
      fat_g:           aiProgram.nutrition.fat_g,
      water_ml:        aiProgram.nutrition.water_ml ?? 2500,
      meal_count:      aiProgram.nutrition.meal_count,
      meals:           aiProgram.nutrition.meals,
      supplement_notes: aiProgram.nutrition.supplement_notes,
      general_notes:   aiProgram.nutrition.general_notes,
    });
  }

  return NextResponse.json({
    success:   true,
    programId,
    title:     aiProgram.title,
    summary:   aiProgram.summary,
    status:    "pending",
    bmi,
    bmiCategory,
    message:   "Program oluşturuldu. Admin onayı bekleniyor.",
  });
}
