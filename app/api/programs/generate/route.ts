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
  focus_areas?: string[];
}

interface AIExercise { name: string; exercise_id?: string; sets: number; reps: string; rest_seconds: number; notes?: string; }
interface AIDay { day_number: number; day_name: string; focus: string; is_rest_day: boolean; exercises: AIExercise[]; warmup_notes?: string; cooldown_notes?: string; total_duration_min?: number; notes?: string; }
interface AIMeal { name: string; time: string; foods: string[]; calories: number; }
interface AIProgram {
  title: string;
  summary: string;
  weeks: [{ week_number: 1; notes: string; days: AIDay[] }];
  nutrition: { daily_calories: number; protein_g: number; carb_g: number; fat_g: number; water_ml: number; meal_count: number; meals: AIMeal[]; general_notes: string; };
}

interface ExerciseRow {
  id: string;
  exercise_name: string;
  category: string;
  primary_muscle: string;
  equipment: string;
  difficulty: string;
  default_sets: number | null;
  default_reps: string | null;
  rest_seconds: number | null;
  coaching_notes: string | null;
  contraindications: string | null;
}

function calcBMI(w: number, h: number) {
  const bmi = Math.round((w / Math.pow(h / 100, 2)) * 10) / 10;
  const cat  = bmi < 18.5 ? "Zayıf" : bmi < 25 ? "Normal" : bmi < 30 ? "Fazla kilolu" : "Obez";
  return { bmi, category: cat };
}

// Stem-based matching for Turkish inflections (fıtık → fıtı, omuz → omuz)
const INJURY_MAP: Record<string, string> = {
  "fıtı":  "Deadlift, squat, good morning, bent over row, roman deadlift, back extension — KESİNLİKLE YASAK",
  "fiti":  "Deadlift, squat, good morning — KESİNLİKLE YASAK",
  "disk":  "Deadlift, squat, back extension, hyperextension — KESİNLİKLE YASAK",
  "diz":   "Squat, lunge, leg press, box jump, step up — KESİNLİKLE YASAK",
  "sırt":  "Deadlift, good morning, bent over row, roman deadlift — KESİNLİKLE YASAK",
  "back":  "Deadlift, good morning, back extension — KESİNLİKLE YASAK",
  "omuz":  "Overhead press, upright row, behind neck press, military press — KESİNLİKLE YASAK",
  "bilek": "Barbell curl, pushup, plank — değiştir ya da kaldır",
  "boyun": "Overhead press, shrug, neck extension — KESİNLİKLE YASAK",
  "kalça": "Deadlift, deep squat, Romanian deadlift, RDL — KESİNLİKLE YASAK",
};

function injuryNote(injuries?: string) {
  if (!injuries) return "";
  const lower = injuries.toLowerCase();
  return Object.entries(INJURY_MAP)
    .filter(([k]) => lower.includes(k))
    .map(([, v]) => v)
    .join("; ");
}

function mapDifficulty(level: string): string[] {
  const l = level.toLowerCase();
  if (l.includes("başlangıç") || l.includes("beginner"))        return ["beginner"];
  if (l.includes("orta") || l.includes("intermediate"))         return ["beginner", "intermediate"];
  if (l.includes("ileri") || l.includes("advanced"))            return ["intermediate", "advanced"];
  if (l.includes("elit") || l.includes("expert"))               return ["advanced"];
  return ["beginner", "intermediate"];
}

function formatExerciseList(exercises: ExerciseRow[]): string {
  return exercises
    .map(e =>
      `[${e.id}] ${e.exercise_name} | kas:${e.primary_muscle || e.category} | ekipman:${e.equipment || "serbest"} | sets:${e.default_sets ?? 3} | reps:${e.default_reps ?? "10-12"} | dinlenme:${e.rest_seconds ?? 60}sn${e.contraindications ? ` | KONTRENDIKE:${e.contraindications}` : ""}`
    )
    .join("\n");
}

// Stem-based regex filters — removes dangerous exercises from DB list for injured users
const INJURY_FILTERS: Record<string, RegExp> = {
  "fıtı":  /deadlift|squat|good.morning|roman|bent.over|back.extension|hyperextension|stiff.leg|rdl|romanian/i,
  "fiti":  /deadlift|squat|good.morning/i,
  "disk":  /deadlift|squat|back.extension|hyperextension|good.morning|roman/i,
  "diz":   /squat|lunge|leg.press|jump|step.up|box.jump|knee.extension|knee.flexion/i,
  "sırt":  /deadlift|good.morning|bent.over|roman|back.extension|hyperextension/i,
  "back":  /deadlift|good.morning|back.extension|hyperextension/i,
  "omuz":  /overhead|shoulder.press|upright.row|arnold|behind.neck|military.press/i,
  "bilek": /wrist|barbell.curl|pushup|push.up|plank/i,
  "boyun": /overhead|behind.neck|shrug|neck.extension/i,
  "kalça": /deadlift|deep.squat|romanian|rdl|hip.hinge/i,
};

function getInjuryRegexes(injuries?: string): RegExp[] {
  if (!injuries) return [];
  const lower = injuries.toLowerCase();
  return Object.entries(INJURY_FILTERS)
    .filter(([k]) => lower.includes(k))
    .map(([, r]) => r);
}

async function fetchExercisesForProfile(
  admin: ReturnType<typeof createAdminClient>,
  profile: UserProfile
): Promise<ExerciseRow[]> {
  const difficulties = mapDifficulty(profile.fitness_level ?? "orta");
  const isHome = /ev|home/i.test(profile.available_equipment ?? "");

  let query = admin
    .from("exercises")
    .select("id, exercise_name, category, primary_muscle, equipment, difficulty, default_sets, default_reps, rest_seconds, coaching_notes, contraindications")
    .eq("is_active", true)
    .in("difficulty", difficulties);

  if (isHome) query = query.in("home_or_gym", ["home", "both"]);

  const { data } = await query.limit(150);
  let rows = (data ?? []) as ExerciseRow[];

  const injuryFilters = getInjuryRegexes(profile.injuries);
  if (injuryFilters.length > 0) {
    rows = rows.filter(ex => {
      const nameAndNotes = `${ex.exercise_name} ${ex.contraindications ?? ""}`.toLowerCase();
      return !injuryFilters.some(re => re.test(nameAndNotes));
    });
  }

  const byCategory: Record<string, ExerciseRow[]> = {};
  for (const r of rows) {
    const cat = r.category ?? "other";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(r);
  }

  const balanced: ExerciseRow[] = [];
  const perCat = Math.max(8, Math.floor(100 / Math.max(Object.keys(byCategory).length, 1)));
  for (const cat of Object.keys(byCategory)) {
    balanced.push(...byCategory[cat].slice(0, perCat));
  }

  return balanced.slice(0, 110);
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
    throw new Error(`OpenAI API hatası (${res.status}): ${txt.slice(0, 200)}`);
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

  const admin = createAdminClient();
  const { bmi, category: bmiCategory } = calcBMI(p.weight_kg, p.height_cm);
  const injNote = injuryNote(p.injuries);

  const dbExercises = await fetchExercisesForProfile(admin, p);
  const exerciseList = dbExercises.length > 0
    ? formatExerciseList(dbExercises)
    : "DB'de egzersiz bulunamadı, genel bilginle oluştur";

  const hasDbExercises = dbExercises.length > 0;

  // Build explicit banned movement list from injury
  const injBan = injNote;

  // Age-based adjustments
  const ageNote = p.age >= 50
    ? "Kişi 50+ yaşında: eklem dostu egzersizler, daha uzun dinlenme süreleri, düşük ağırlık yüksek tekrar."
    : p.age <= 18
    ? "Kişi 18 yaş altı: olimpik hareketler ve maksimal yükten kaçın, teknik geliştirmeye odaklan."
    : "";

  // Gender-based notes
  const genderNote = p.gender === "kadin"
    ? "Kadın katılımcı: bacak/glute ağırlıklı programlama, göğüs bölgesi egzersizlerini dahil et."
    : "";

  // Focus areas
  const focusNote = p.focus_areas?.length
    ? `Odaklanılacak bölgeler: ${p.focus_areas.join(", ")}`
    : "";

  const systemPrompt = `Sen deneyimli bir kişisel antrenör ve spor beslenme uzmanısın.
Kullanıcının tüm özelliklerini (yaş, cinsiyet, hedef, seviye, sakatlık) dikkate alarak GERÇEK ve KİŞİYE ÖZEL program yazarsın.

EGZERSIZ KURALLARI:
${hasDbExercises ? `- SADECE aşağıdaki "Egzersiz Kütüphanesi"ndeki egzersizleri kullan. Listede olmayan egzersiz YAZMA.
- Her egzersiz için listedeki [ID] değerini "exercise_id" alanına yaz (UUID formatında)` : "- Uygun egzersizler seç"}
- Gerçekçi set/tekrar/dinlenme süreleri kullan
- Beslenme planı kişinin kalorisine göre hesaplanmış olsun
- SADECE geçerli JSON döndür

KAS GRUBU BAŞINA EGZERSİZ SAYISI (günlük split'e göre):
- Göğüs günü: göğüs 3-4 egzersiz + triseps 2-3 egzersiz = toplam 5-7
- Sırt günü: sırt 4-5 egzersiz + biseps 2-3 egzersiz = toplam 6-8
- Bacak günü: quadriseps 2-3 + hamstring 2-3 + glutes 1-2 + baldır 1 = toplam 6-9
- Omuz günü: omuz 3-4 egzersiz + kol (biseps+triseps) 3-4 = toplam 6-8
- Full body günü: her büyük kas grubundan 1-2 egzersiz = toplam 6-8
- Push/Pull/Legs bölünmesi de kullanılabilir

${injBan ? `⚠️ SAĞLIK KISITLAMALARI — KESİNLİKLE UYULMASI ZORUNLU:
${injBan}
Bu hareketleri HİÇBİR KOŞULDA programa YAZMA. Alternatif egzersiz seç.` : ""}`;

  const userPrompt = `Kullanıcı Profili:
- Cinsiyet: ${p.gender === "erkek" ? "Erkek" : "Kadın"} | Yaş: ${p.age} | Boy: ${p.height_cm}cm | Kilo: ${p.weight_kg}kg | BMI: ${bmi} (${bmiCategory})
- Hedef: ${p.goal} | Seviye: ${p.fitness_level} | ${p.days_per_week} gün/hafta | ${p.session_duration ?? 60}dk/seans
- Ekipman: ${p.available_equipment || "tam donanımlı spor salonu"} | Beslenme: ${p.diet_preference || "standart"}
${p.injuries ? `- Sakatlık/Sağlık Durumu: ${p.injuries}` : ""}${injBan ? `\n- ⛔ YASAK HAREKETLERİ KESİNLİKLE YAZMA: ${injBan}` : ""}
${ageNote ? `- ${ageNote}` : ""}${genderNote ? `\n- ${genderNote}` : ""}${focusNote ? `\n- ${focusNote}` : ""}
${p.medical_notes ? `- Ek not: ${p.medical_notes}` : ""}

${hasDbExercises ? `EGZERSİZ KÜTÜPHANESİ (yalnızca bunlardan seç, ${dbExercises.length} egzersiz):
${exerciseList}

` : ""}GÖREV: ${p.days_per_week} antrenman + ${7 - p.days_per_week} dinlenme günlü 1 haftalık kişisel program oluştur.
- Her antrenman günü farklı kas grubuna odaklan (split mantığı)
- Kas grubu başına doğru egzersiz sayısını uygula (yukarıdaki kurallara göre)
- ${p.days_per_week} günlük split: ${
    p.days_per_week <= 2 ? "Full body" :
    p.days_per_week === 3 ? "Push/Pull/Legs veya Full Body" :
    p.days_per_week === 4 ? "Üst/Alt bölünmesi veya Göğüs+Tris / Sırt+Bis / Bacak / Omuz+Kol" :
    "5 günlük split: Göğüs / Sırt / Bacak / Omuz / Kol+Core"
  }

JSON FORMATI:
{"title":"...","summary":"2-3 cümle","weeks":[{"week_number":1,"notes":"...","days":[{"day_number":1,"day_name":"Pazartesi","focus":"Göğüs+Triseps","is_rest_day":false,"warmup_notes":"5dk kardiyo","cooldown_notes":"5dk esneme","total_duration_min":${p.session_duration ?? 60},"notes":"...","exercises":[{"exercise_id":"UUID_BURAYA","name":"Bench Press","sets":4,"reps":"8-10","rest_seconds":90,"notes":"form notu"}]},{"day_number":2,"day_name":"Salı","focus":"Dinlenme","is_rest_day":true,"exercises":[],"warmup_notes":null,"cooldown_notes":null,"total_duration_min":null,"notes":"Aktif dinlenme"}]}],"nutrition":{"daily_calories":2200,"protein_g":165,"carb_g":220,"fat_g":73,"water_ml":2500,"meal_count":5,"meals":[{"name":"Kahvaltı","time":"07:30","foods":["Yulaf 80g","Yumurta 3"],"calories":550}],"general_notes":"..."}}

Tüm ${p.days_per_week} antrenman gününü doldur. Her günde doğru kas grubu sayısına uy.`;

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

  const now  = new Date().toISOString();
  const week = prog.weeks[0];

  const { data: saved, error: progErr } = await admin.from("programs").insert({
    user_id:         body.user_id ?? null,
    title:           "Fitness ve Beslenme Programı",
    summary:         prog.summary,
    duration_weeks:  1,
    days_per_week:   p.days_per_week,
    goal:            p.goal,
    fitness_level:   p.fitness_level,
    status:          "pending",
    ai_model:        "gpt-4o-mini",
    requester_email: body.email ?? p.email ?? null,
    requester_name:  p.full_name ?? null,
    created_at:      now,
    updated_at:      now,
  }).select("id").single();

  if (progErr || !saved)
    return NextResponse.json({ error: `Program kaydedilemedi: ${progErr?.message}` }, { status: 500 });

  const programId = saved.id as string;

  const { data: weekRow } = await admin.from("program_weeks")
    .insert({ program_id: programId, week_number: 1, notes: week.notes ?? "" })
    .select("id").single();
  const weekId = weekRow?.id as string | null ?? null;

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

  const allExercises = week.days.flatMap(d => {
    if (d.is_rest_day || !d.exercises?.length) return [];
    const dayId = dayIdMap.get(d.day_number);
    if (!dayId) return [];
    return d.exercises.map((ex, i) => ({
      program_day_id: dayId,
      exercise_name:  ex.name,
      sets:           ex.sets,
      reps:           ex.reps,
      rest_seconds:   ex.rest_seconds ?? 60,
      notes:          ex.notes ?? null,
      order_index:    i,
    }));
  });

  if (allExercises.length > 0) {
    const { error: exErr } = await admin.from("program_exercises").insert(allExercises);
    if (exErr) console.error("Egzersiz kayıt hatası:", exErr.message);
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
    success:         true,
    programId,
    title:           "Fitness ve Beslenme Programı",
    summary:         prog.summary,
    status:          "pending",
    bmi,
    bmiCategory,
    exercisesFromDb: hasDbExercises ? dbExercises.length : 0,
    message:         "Programın hazırlandı! Admin onayı sonrası sana iletilecek.",
  });
}
