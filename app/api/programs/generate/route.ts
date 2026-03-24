import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime     = "edge";
export const maxDuration = 25;

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
  const cat = bmi < 18.5 ? "Zayıf" : bmi < 25 ? "Normal" : bmi < 30 ? "Fazla kilolu" : "Obez";
  return { bmi, category: cat };
}

const INJURY_MAP: Record<string, string> = {
  "fıtık": "bel ve ağır squat/deadlift yok",
  "fitık": "bel ve ağır squat/deadlift yok",
  "diz":   "squat/lunge/jumping yok veya düşük ağırlık",
  "sırt":  "deadlift/good morning yok",
  "omuz":  "overhead press/upright row yok",
  "bilek": "pushup/plank modifiye et",
};

function injuryNote(injuries?: string) {
  if (!injuries) return "";
  const lower = injuries.toLowerCase();
  return Object.entries(INJURY_MAP)
    .filter(([k]) => lower.includes(k))
    .map(([, v]) => v)
    .join("; ");
}

async function makeHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

async function callOpenAI(apiKey: string, systemMsg: string, userMsg: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemMsg },
        { role: "user",   content: userMsg   },
      ],
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

  const admin  = createAdminClient();
  const { bmi, category: bmiCategory } = calcBMI(p.weight_kg, p.height_cm);
  const salt = Date.now().toString(36);
  const hash = await makeHash(`${p.age}${p.gender}${p.weight_kg}${p.height_cm}${p.goal}${p.fitness_level}${p.days_per_week}${salt}`);
  const injNote = injuryNote(p.injuries);

  const systemPrompt = `Kişisel antrenör ve beslenme uzmanısın. SADECE JSON döndür, başka hiçbir şey yazma.`;
  const userPrompt = `Kullanıcı: ${p.gender==="erkek"?"Erkek":"Kadın"}, ${p.age} yaş, ${p.height_cm}cm, ${p.weight_kg}kg, BMI:${bmi}
Hedef: ${p.goal} | Seviye: ${p.fitness_level} | Antrenman: haftada ${p.days_per_week} gün, ${p.session_duration??60}dk
Ekipman: ${p.available_equipment||"spor salonu"} | Beslenme: ${p.diet_preference||"standart"}
${p.injuries ? `Sakatlık: ${p.injuries}` : ""}${injNote ? ` → Kısıtlama: ${injNote}` : ""}

1 haftalık (7 gün) antrenman + beslenme planı oluştur. ${p.days_per_week} antrenman günü, ${7-p.days_per_week} dinlenme günü.
Salt: ${salt}

JSON şeması:
{"title":"...","summary":"2 cümle özet","weeks":[{"week_number":1,"notes":"...","days":[{"day_number":1,"day_name":"Pazartesi","focus":"Göğüs+Triseps","is_rest_day":false,"warmup_notes":"5dk","cooldown_notes":"5dk esneme","total_duration_min":55,"exercises":[{"name":"Bench Press","sets":3,"reps":"10-12","rest_seconds":60,"notes":""}],"notes":""},{"day_number":2,"day_name":"Salı","focus":"Dinlenme","is_rest_day":true,"exercises":[],"notes":"Aktif dinlenme"}]}],"nutrition":{"daily_calories":2200,"protein_g":165,"carb_g":220,"fat_g":73,"water_ml":2500,"meal_count":4,"meals":[{"name":"Kahvaltı","time":"07:00","foods":["Yulaf 80g","Yumurta 3"],"calories":550}],"general_notes":"..."}}`;

  let raw = "";
  try {
    raw = await callOpenAI(apiKey, systemPrompt, userPrompt);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (!raw) return NextResponse.json({ error: "AI boş yanıt döndürdü. Tekrar deneyin." }, { status: 500 });

  let prog: AIProgram;
  try {
    prog = JSON.parse(raw) as AIProgram;
    if (!prog.title || !prog.weeks?.[0]?.days) throw new Error("Geçersiz yapı");
  } catch {
    return NextResponse.json({ error: "AI geçersiz yanıt döndürdü. Tekrar deneyin." }, { status: 500 });
  }

  const now = new Date().toISOString();

  const { data: saved, error: saveErr } = await admin.from("programs").insert({
    user_id:         body.user_id ?? null,
    title:           prog.title,
    summary:         prog.summary,
    duration_weeks:  4,
    days_per_week:   p.days_per_week,
    goal:            p.goal,
    fitness_level:   p.fitness_level,
    status:          "pending",
    ai_model:        "gpt-4o-mini",
    generation_hash: hash,
    created_at:      now,
    updated_at:      now,
  }).select("id").single();

  if (saveErr || !saved)
    return NextResponse.json({ error: `Program kaydedilemedi: ${saveErr?.message}` }, { status: 500 });

  const programId = saved.id;
  const week = prog.weeks[0];

  const { data: weekRow } = await admin.from("program_weeks")
    .insert({ program_id: programId, week_number: 1, notes: week.notes ?? "" })
    .select("id").single();
  const weekId = weekRow?.id ?? null;

  for (const day of week.days) {
    const { data: dayRow } = await admin.from("program_days").insert({
      program_id: programId, week_id: weekId, week_number: 1,
      day_number: day.day_number, day_name: day.day_name, focus: day.focus,
      is_rest_day: day.is_rest_day ?? false,
      warmup_notes: day.warmup_notes ?? null,
      cooldown_notes: day.cooldown_notes ?? null,
      total_duration_min: day.total_duration_min ?? null,
      notes: day.notes ?? null,
    }).select("id").single();
    const dayId = dayRow?.id ?? null;

    if (!dayId || day.is_rest_day || !day.exercises?.length) continue;
    await admin.from("program_exercises").insert(
      day.exercises.map((ex, i) => ({
        program_day_id: dayId,
        exercise_name:  ex.name,
        sets:           ex.sets,
        reps:           ex.reps,
        rest_seconds:   ex.rest_seconds ?? 60,
        notes:          ex.notes ?? null,
        order_index:    i,
      }))
    );
  }

  if (prog.nutrition) {
    await admin.from("nutrition_plans").insert({
      program_id:     programId,
      daily_calories: prog.nutrition.daily_calories,
      protein_g:      prog.nutrition.protein_g,
      carb_g:         prog.nutrition.carb_g,
      fat_g:          prog.nutrition.fat_g,
      water_ml:       prog.nutrition.water_ml ?? 2500,
      meal_count:     prog.nutrition.meal_count,
      meals:          prog.nutrition.meals,
      general_notes:  prog.nutrition.general_notes,
    });
  }

  return NextResponse.json({
    success: true, programId,
    title: prog.title, summary: prog.summary,
    status: "pending", bmi, bmiCategory,
    message: "Programın hazırlandı! Admin onayı sonrası sana iletilecek.",
  });
}
