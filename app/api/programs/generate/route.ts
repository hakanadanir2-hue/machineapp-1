import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildInjuryContext, checkRedFlags, type RedFlagInput } from "@/lib/injury_rules";

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
  split_preference?: string;
  cardio_preference?: string;
  diet_preference?: string;
  focus_areas?: string[];
  injury_areas?: string[];
  injury_type?: string;
  pain_level?: number;
  has_diagnosis?: boolean | null;
  has_doctor_restriction?: boolean | null;
  injuries?: string;
  banned_movements?: string;
  medical_notes?: string;
  extra_notes?: string;
}

interface AIExercise {
  name: string; exercise_id?: string; sets: number; reps: string;
  rest_seconds: number; tempo?: string; notes?: string;
}
interface AIDay {
  day_number: number; day_name: string; focus: string; is_rest_day: boolean;
  exercises: AIExercise[];
  warmup?: string; main_block_note?: string; accessory_note?: string;
  core_note?: string; cardio_note?: string;
  warmup_notes?: string; cooldown_notes?: string;
  total_duration_min?: number; notes?: string;
  injury_note?: string;
}
interface AIMeal { name: string; time: string; foods: string[]; calories: number; }
interface AIProgram {
  title: string; summary: string;
  weeks: [{ week_number: 1; notes: string; days: AIDay[] }];
  nutrition: {
    daily_calories: number; protein_g: number; carb_g: number; fat_g: number;
    water_ml: number; meal_count: number; meals: AIMeal[]; general_notes: string;
  };
}

interface ExerciseRow {
  id: string; exercise_name: string; category: string; primary_muscle: string;
  equipment: string; difficulty: string; default_sets: number | null;
  default_reps: string | null; rest_seconds: number | null;
  coaching_notes: string | null; contraindications: string | null;
}

function calcBMI(w: number, h: number) {
  const bmi = Math.round((w / Math.pow(h / 100, 2)) * 10) / 10;
  const cat  = bmi < 18.5 ? "Zayıf" : bmi < 25 ? "Normal" : bmi < 30 ? "Fazla kilolu" : "Obez";
  return { bmi, category: cat };
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function calcTDEE(weight: number, height: number, age: number, gender: string, daysPerWeek: number): number {
  const bmr = gender === "erkek"
    ? (10 * weight) + (6.25 * height) - (5 * age) + 5
    : (10 * weight) + (6.25 * height) - (5 * age) - 161;
  const multiplier = daysPerWeek <= 1 ? 1.2
    : daysPerWeek <= 2 ? 1.375
    : daysPerWeek <= 4 ? 1.55
    : daysPerWeek <= 6 ? 1.725
    : 1.9;
  return Math.round(bmr * multiplier);
}

function calcMacros(tdee: number, weight: number, goal: string): { calories: number; protein: number; carb: number; fat: number } {
  let calories = tdee;
  if (goal.includes("kilo_ver")) calories = tdee - 450;
  else if (goal.includes("kas_kazan")) calories = tdee + 350;
  calories = Math.max(calories, 1200);

  const proteinPerKg = goal.includes("kas_kazan") ? 2.2 : goal.includes("kilo_ver") ? 2.0 : 1.6;
  const protein = Math.round(weight * proteinPerKg);
  const fatCals = Math.round(calories * 0.27);
  const fat = Math.round(fatCals / 9);
  const carbCals = calories - protein * 4 - fatCals;
  const carb = Math.round(Math.max(carbCals, 0) / 4);

  return { calories: Math.round(calories), protein, carb, fat };
}

function filterByBodyComposition(exercises: ExerciseRow[], bmi: number, weightKg: number): ExerciseRow[] {
  const PULL_UP = /pull[\s-]?up|chin[\s-]?up|muscle[\s-]?up|bar[kK][iı][sş]|assisted pull/i;
  const DIP     = /\bdip\b|ring dip|parallel bar dip|chest dip/i;
  const PLYO    = /box jump|broad jump|burpee|tuck jump|jump squat|depth jump/i;
  const IMPACT  = /jumping jack|high knee sprint|skipping rope/i;

  return exercises.filter(ex => {
    const name = ex.exercise_name;
    if ((bmi >= 30 || weightKg >= 110) && PULL_UP.test(name)) return false;
    if ((bmi >= 30 || weightKg >= 110) && DIP.test(name)) return false;
    if (bmi >= 32 && PLYO.test(name)) return false;
    if (bmi >= 35 && IMPACT.test(name)) return false;
    return true;
  });
}

function mapDifficulty(level: string): string[] {
  const l = level.toLowerCase();
  if (l.includes("baslangic") || l.includes("beginner"))    return ["beginner"];
  if (l.includes("orta") || l.includes("intermediate"))     return ["beginner", "intermediate"];
  if (l.includes("ileri") || l.includes("advanced"))        return ["intermediate", "advanced"];
  return ["beginner", "intermediate"];
}

function formatExerciseList(exercises: ExerciseRow[]): string {
  return exercises
    .map(e =>
      `[${e.id}] ${e.exercise_name} | kas:${e.primary_muscle || e.category} | ekipman:${e.equipment || "serbest"} | sets:${e.default_sets ?? 3} | reps:${e.default_reps ?? "10-12"} | dinlenme:${e.rest_seconds ?? 60}sn${e.contraindications ? ` | KONTRENDIKE:${e.contraindications}` : ""}`
    )
    .join("\n");
}

// Legacy stem-based filters for backward compat
const INJURY_FILTERS: Record<string, RegExp> = {
  "fitı":  /deadlift|squat|good.morning|roman|bent.over|back.extension|hyperextension|stiff.leg|rdl|romanian/i,
  "fiti":  /deadlift|squat|good.morning/i,
  "disk":  /deadlift|squat|back.extension|hyperextension|good.morning|roman/i,
  "diz":   /squat|lunge|leg.press|jump|step.up|box.jump|knee.extension/i,
  "sirt":  /deadlift|good.morning|bent.over|roman|back.extension|hyperextension/i,
  "omuz":  /overhead|shoulder.press|upright.row|arnold|behind.neck|military.press/i,
  "bilek": /wrist|barbell.curl|pushup|push.up|plank/i,
  "boyun": /overhead|behind.neck|shrug|neck.extension/i,
  "kalca": /deadlift|deep.squat|romanian|rdl|hip.hinge/i,
  "bel":   /deadlift|good.morning|bent.over|roman|back.extension|hyperextension/i,
};

function getInjuryRegexes(injuryAreas: string[], injuryText?: string): RegExp[] {
  const regexes: RegExp[] = [];
  const sources = [...injuryAreas];
  if (injuryText) sources.push(injuryText.toLowerCase());

  for (const src of sources) {
    for (const [k, r] of Object.entries(INJURY_FILTERS)) {
      if (src.includes(k) && !regexes.includes(r)) regexes.push(r);
    }
  }
  return regexes;
}

async function fetchExercisesForProfile(
  admin: ReturnType<typeof createAdminClient>,
  profile: UserProfile,
  bmi: number
): Promise<ExerciseRow[]> {
  const difficulties = mapDifficulty(profile.fitness_level ?? "orta");
  const isHome = /ev|home|none/i.test(profile.available_equipment ?? "");

  let query = admin
    .from("exercises")
    .select("id, exercise_name, category, primary_muscle, equipment, difficulty, default_sets, default_reps, rest_seconds, coaching_notes, contraindications")
    .eq("is_active", true)
    .in("difficulty", difficulties);

  if (isHome) query = query.in("home_or_gym", ["home", "both"]);

  const { data } = await query.limit(900);
  let rows = (data ?? []) as ExerciseRow[];

  rows = filterByBodyComposition(rows, bmi, profile.weight_kg);

  const injuryRegexes = getInjuryRegexes(profile.injury_areas ?? [], profile.injuries);
  if (injuryRegexes.length > 0) {
    rows = rows.filter(ex => {
      const nameAndNotes = `${ex.exercise_name} ${ex.contraindications ?? ""}`.toLowerCase();
      return !injuryRegexes.some(re => re.test(nameAndNotes));
    });
  }

  if (profile.banned_movements?.trim()) {
    const banned = profile.banned_movements.toLowerCase().split(/[,;\/]/).map(s => s.trim()).filter(Boolean);
    rows = rows.filter(ex => {
      const name = ex.exercise_name.toLowerCase();
      return !banned.some(b => b.length > 3 && name.includes(b));
    });
  }

  const byCategory: Record<string, ExerciseRow[]> = {};
  for (const r of rows) {
    const cat = r.category ?? "other";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(r);
  }

  const balanced: ExerciseRow[] = [];
  for (const cat of Object.keys(byCategory)) {
    balanced.push(...shuffleArray(byCategory[cat]).slice(0, 10));
  }

  return shuffleArray(balanced).slice(0, 75);
}

async function getRecentExercises(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<string[]> {
  const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await admin
    .from("user_program_history")
    .select("exercise_names")
    .eq("user_id", userId)
    .gte("created_at", eightWeeksAgo)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!data?.length) return [];
  const allNames: string[] = [];
  for (const row of data) {
    const names = (row.exercise_names ?? []) as string[];
    allNames.push(...names);
  }
  return [...new Set(allNames)].slice(0, 30);
}

async function saveHistory(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  programId: string,
  profile: UserProfile,
  exerciseNames: string[]
) {
  const hash = Buffer.from(exerciseNames.sort().join("|")).toString("base64").slice(0, 32);
  await admin.from("user_program_history").insert({
    user_id:       userId,
    program_id:    programId,
    goal:          profile.goal,
    days_per_week: profile.days_per_week,
    split_type:    profile.split_preference ?? "auto",
    exercise_names: exerciseNames,
    program_hash:  hash,
  }).select().single();
}

async function callOpenAI(apiKey: string, systemMsg: string, userMsg: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method:  "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model:           "gpt-4o-mini",
      max_tokens:      4000,
      temperature:     0.8,
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
  const body = await req.json().catch(() => null) as {
    profile: UserProfile; user_id?: string; email?: string;
    red_flags?: RedFlagInput;
  } | null;

  if (!body?.profile) return NextResponse.json({ error: "Profile verisi eksik" }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY ayarlı değil" }, { status: 500 });

  const p = body.profile;
  if (!p.age || !p.height_cm || !p.weight_kg || !p.goal)
    return NextResponse.json({ error: "Yaş, boy, kilo ve hedef zorunludur" }, { status: 400 });

  // Server-side red flag check
  if (body.red_flags) {
    const rfMsg = checkRedFlags(body.red_flags);
    if (rfMsg) return NextResponse.json({ error: rfMsg, red_flag: true }, { status: 422 });
  }

  const admin = createAdminClient();
  const { bmi, category: bmiCategory } = calcBMI(p.weight_kg, p.height_cm);
  const tdee   = calcTDEE(p.weight_kg, p.height_cm, p.age, p.gender, p.days_per_week);
  const macros = calcMacros(tdee, p.weight_kg, p.goal);

  // Build injury context using the rules engine
  const injuryCtx = buildInjuryContext(
    p.injury_areas ?? [],
    p.pain_level ?? 0,
    p.has_diagnosis ?? false,
    p.banned_movements ?? ""
  );

  // Get recent exercises for variety
  const recentExercises = body.user_id
    ? await getRecentExercises(admin, body.user_id)
    : [];

  const dbExercises = await fetchExercisesForProfile(admin, p, bmi);
  const exerciseList = dbExercises.length > 0
    ? formatExerciseList(dbExercises)
    : "DB'de egzersiz bulunamadı, genel bilginle oluştur";

  const hasDbExercises = dbExercises.length > 0;

  // Age-based note
  const ageNote = p.age >= 50
    ? "50+ yaş: eklem dostu egzersizler, uzun dinlenme, düşük ağırlık yüksek tekrar."
    : p.age <= 18
    ? "18 yaş altı: olimpik hareketler ve maksimal yükten kaçın, teknik geliştirmeye odaklan."
    : "";

  const genderNote = p.gender === "kadin"
    ? "Kadın: bacak/glute ağırlıklı programlama önerilir."
    : "";

  const focusNote = p.focus_areas?.length
    ? `Odak bölgeler: ${p.focus_areas.join(", ")}`
    : "";

  // Split selection logic
  const splitNote = p.split_preference && p.split_preference !== "otomatik_sec"
    ? `Split tercihi: ${p.split_preference} — buna uy.`
    : "";

  const cardioNote = p.cardio_preference && p.cardio_preference !== "kardiyo_yok"
    ? `Kardiyo tercihi: ${p.cardio_preference} — her antrenman günü sonuna ekle.`
    : "Kardiyo: yok veya minimal.";

  const diversityNote = recentExercises.length > 0
    ? `ÇEŞITLILIK: Son 8 haftada kullanılan hareketler: ${recentExercises.slice(0, 20).join(", ")}. Bu hareketleri MÜMKÜN OLDUĞUNCA KULLANMA. Kütüphanedeki farklı varyasyonları ve az kullanılan egzersizleri tercih et.`
    : "ÇEŞITLILIK ZORUNLU: Bench Press, Squat, Lat Pulldown, Deadlift, Dips gibi standart hareketleri bu programa yazma — kütüphanedeki varyasyonlarını ve alternatiflerini kullan. Her egzersiz farklı olsun.";

  const bmiBodyNote = bmi >= 30 || p.weight_kg >= 110
    ? `⚠ KİLO/BMI UYARISI (BMI: ${bmi}, ${p.weight_kg}kg): Pull-up, chin-up, dips, muscle-up, barkiş gibi TÜM VÜCUT AĞIRLIĞINI KALDIRMAYI gerektiren egzersizler KESİNLİKLE YAZMA. Bunlar yerine: Lat Pulldown, Cable Row, Chest Supported Row, Tricep Pushdown, Machine Chest Press kullan.`
    : bmi >= 27
    ? `Kullanıcının BMI değeri ${bmi}. Pull-up ve dips yerine Lat Pulldown, Cable Row, Tricep Pushdown gibi makine varyasyonlarını tercih et.`
    : "";

  const volumeInfo = injuryCtx.volumeModifier < 1
    ? `⚠ HACIM KISITLAMASI: Önerilen set hacmini ${Math.round((1 - injuryCtx.volumeModifier) * 100)}% azalt (sakatlık nedeniyle).`
    : "";

  const tempoInfo = injuryCtx.tempoNote
    ? `Tempo rehberi: ${injuryCtx.tempoNote}`
    : "";

  const systemPrompt = `Sen kıdemli bir strength & conditioning coach ve corrective exercise odaklı program tasarım uzmanısın. Kullanıcı için tıbbi teşhis koymadan, verilen inputlara göre güvenli ve kişiselleştirilmiş bir program oluştur.

${hasDbExercises ? `EGZERSİZ KURALLARI:
- SADECE "Egzersiz Kütüphanesi"ndeki egzersizleri kullan
- Her egzersiz için listedeki [ID] değerini "exercise_id" alanına yaz
- EGZERSİZLERİ ÇEŞİTLİ SEÇ — kütüphanedeki farklı hareketleri kullan, standart hareketleri tekrarlama` : ""}
- SADECE geçerli JSON döndür

${injuryCtx.promptNote ? `⚠ SAKАТLIK GÜVENLİK KURALLARI (ZORUNLU):
${injuryCtx.promptNote}` : ""}${bmiBodyNote ? `\n${bmiBodyNote}\n` : ""}
${volumeInfo}
${tempoInfo}
BESLENME KURALI: "=== BESLENME HEDEFLERİ ===" bölümündeki kalori ve makro değerleri JSON'a AYNEN yaz. Değiştirme, yeniden hesaplama.

GÜN YAPISI (her antrenman günü şunları içersin):
1. warmup: "5dk ısınma notu"
2. main_block_note: "Ana hareketler hakkında kısa açıklama"
3. exercises: set/reps/tempo/dinlenme ile hareket listesi
4. accessory_note: "Aksesuar blok açıklaması"
5. core_note: "Core/stabilite bloğu notu"
6. cardio_note: "Kardiyo önerisi"
7. injury_note: "Bu günün sakatlık/güvenlik notu (varsa)"

Her egzersiz için: exercise_id (UUID), name, sets, reps, tempo (örn: "3-1-3-0"), rest_seconds, notes (kısa teknik not)

${diversityNote}`;

  const userPrompt = `=== KULLANICI PROFİLİ ===
${p.gender === "erkek" ? "Erkek" : "Kadın"} | ${p.age} yaş | ${p.height_cm}cm | ${p.weight_kg}kg | BMI: ${bmi} (${bmiCategory})

=== HEDEF & PROGRAM ===
Hedef: ${p.goal} | Seviye: ${p.fitness_level} | ${p.days_per_week} gün/hafta | ${p.session_duration ?? 60}dk/seans
Ekipman: ${p.available_equipment || "tam donanımlı spor salonu"}
${splitNote}
${cardioNote}
${focusNote ? focusNote : ""}
Beslenme: ${p.diet_preference || "standart"}

=== KISITLAMALAR ===
${injuryCtx.promptNote ? `Sakatlık Bölgesi: ${(p.injury_areas ?? []).join(", ")}
Durum: ${p.injury_type || "belirtilmemiş"} | Ağrı Seviyesi: ${p.pain_level ?? 0}/10
Tanı: ${p.has_diagnosis ? "var" : "yok/belirsiz"} | Doktor kısıtı: ${p.has_doctor_restriction ? "var" : "yok"}` : "Sakatlık: yok"}
${p.banned_movements ? `Kesinlikle yasak: ${p.banned_movements}` : ""}
${p.medical_notes ? `Sağlık notu: ${p.medical_notes}` : ""}
${p.extra_notes ? `Ek not: ${p.extra_notes}` : ""}
${ageNote ? ageNote : ""}
${genderNote ? genderNote : ""}

=== ÇEŞİTLİLİK ===
${diversityNote}

=== BESLENME HEDEFLERİ (AYNEN KULLAN) ===
Günlük Kalori: ${macros.calories} kcal | Protein: ${macros.protein}g | Karbonhidrat: ${macros.carb}g | Yağ: ${macros.fat}g
Su: ${Math.round(p.weight_kg * 35)}ml/gün | Öğün Sayısı: ${macros.calories >= 2500 ? 5 : 4}

${hasDbExercises ? `=== EGZERSİZ KÜTÜPHANESİ (${dbExercises.length} egzersiz — SADECE BUNLARI KULLAN) ===
${exerciseList}

` : ""}=== GÖREV ===
${p.days_per_week} antrenman + ${7 - p.days_per_week} dinlenme günlü 1 haftalık program.
Her antrenman günü farklı kas grubuna odaklan.

JSON FORMAT:
{"title":"...","summary":"2-3 cümle özet","weeks":[{"week_number":1,"notes":"...","days":[
{"day_number":1,"day_name":"Pazartesi","focus":"Göğüs+Triseps","is_rest_day":false,
"warmup":"5dk kardiyo + dinamik ısınma","main_block_note":"Göğüs ve triseps odaklı",
"accessory_note":"Zayıf nokta egzersizleri","core_note":"Plank serisı","cardio_note":"10dk orta tempolu bisiklet",
"injury_note":"Omuz kısıtı nedeniyle düz bench tercih edildi",
"warmup_notes":"5dk kardiyo","cooldown_notes":"5dk esneme","total_duration_min":60,"notes":"...",
"exercises":[{"exercise_id":"UUID","name":"Bench Press","sets":4,"reps":"8-10","tempo":"2-1-2-1","rest_seconds":90,"notes":"Kontrollü eksantrik"}]},
{"day_number":2,"day_name":"Salı","focus":"Dinlenme","is_rest_day":true,"exercises":[],"warmup":"","main_block_note":"","accessory_note":"","core_note":"","cardio_note":"Hafif yürüyüş","injury_note":"","warmup_notes":null,"cooldown_notes":null,"total_duration_min":null,"notes":"Aktif dinlenme"}
]}],"nutrition":{"daily_calories":2200,"protein_g":165,"carb_g":220,"fat_g":73,"water_ml":2500,"meal_count":5,"meals":[{"name":"Kahvaltı","time":"07:30","foods":["Yulaf 80g","Yumurta 3"],"calories":550}],"general_notes":"..."}}`;

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
      warmup_notes:  d.warmup ?? d.warmup_notes ?? null,
      cooldown_notes: d.cooldown_notes ?? null,
      total_duration_min: d.total_duration_min ?? null,
      notes: [d.notes, d.main_block_note, d.accessory_note, d.core_note, d.cardio_note, d.injury_note]
              .filter(Boolean).join(" | ") || null,
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
      tempo:          ex.tempo ?? null,
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

  // Save program history for diversity (async, non-blocking)
  if (body.user_id) {
    const exerciseNames = allExercises.map(e => e.exercise_name);
    saveHistory(admin, body.user_id, programId, p, exerciseNames).catch(() => null);
  }

  return NextResponse.json({
    success:         true,
    programId,
    title:           "Fitness ve Beslenme Programı",
    summary:         prog.summary,
    status:          "pending",
    bmi,
    bmiCategory,
    calories:        macros.calories,
    protein:         macros.protein,
    carb:            macros.carb,
    fat:             macros.fat,
    water_ml:        Math.round(p.weight_kg * 35),
    exercisesFromDb: hasDbExercises ? dbExercises.length : 0,
    injuryFiltered:  (p.injury_areas?.length ?? 0) > 0,
    message:         "Programın hazırlandı! Admin onayı sonrası sana iletilecek.",
  });
}
