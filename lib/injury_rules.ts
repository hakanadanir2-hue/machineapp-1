export type InjuryProfile =
  | "shoulder_impingement"
  | "rotator_cuff_irritation"
  | "low_back_pain_general"
  | "disc_irritation"
  | "neck_pain"
  | "lateral_epicondylitis"
  | "wrist_pain"
  | "patellofemoral_pain"
  | "meniscus_irritation"
  | "ankle_instability"
  | "hamstring_strain_history"
  | "postural_deconditioning";

export interface InjuryRule {
  label: string;
  avoid_tags: string[];
  caution_tags: string[];
  preferred_tags: string[];
  max_pain_allowed: number;
  allowed_rom_notes: string;
  volume_modifier: number;
  intensity_modifier: number;
  tempo_modifier: string;
  cardio_preferences: string[];
  prompt_note: string;
}

export const INJURY_RULES: Record<InjuryProfile, InjuryRule> = {
  shoulder_impingement: {
    label: "Omuz Sikismasi",
    avoid_tags: ["overhead","upright_row","behind_neck","high_impact_shoulder"],
    caution_tags: ["chest_press","dip","push_up"],
    preferred_tags: ["row","lat_pulldown_neutral","external_rotation","scapular_stability"],
    max_pain_allowed: 3,
    allowed_rom_notes: "90 derece uzeri omuz fleksiyonu/abduksiyonu kacin",
    volume_modifier: 0.8,
    intensity_modifier: 0.75,
    tempo_modifier: "3-1-3-1 (yavas eksentrik)",
    cardio_preferences: ["yuruyus","bisiklet","rowing makinesi (dusuk direnc)"],
    prompt_note: "Omuz sikismasi: overhead hareketleri (overhead press, upright row, behind neck press) KESINLIKLE YAZMA. Notral tutus lat pulldown, omuz dis rotasyon, sirt kurek egzersizleri tercih et.",
  },
  rotator_cuff_irritation: {
    label: "Rotator Cuff Tahris",
    avoid_tags: ["overhead","internal_rotation_load","upright_row","bench_press_wide_grip"],
    caution_tags: ["lateral_raise","front_raise","chest_press"],
    preferred_tags: ["external_rotation","low_row","scapular_retraction","face_pull"],
    max_pain_allowed: 2,
    allowed_rom_notes: "Agri esigi icinde kal, provoke edici acılardan kacin",
    volume_modifier: 0.7,
    intensity_modifier: 0.65,
    tempo_modifier: "3-0-3-1",
    cardio_preferences: ["yuruyus","bisiklet","eliptik"],
    prompt_note: "Rotator cuff tahrisi: overhead hareketler, genis tutuslu bench press, upright row YOK. Dis rotasyon, face pull, kurek kaslari egzersizleri ekle. Cok dusuk agirlik, yavas tempo.",
  },
  low_back_pain_general: {
    label: "Bel Agrisi (Genel)",
    avoid_tags: ["spinal_flexion_load","deadlift","good_morning","roman_deadlift","back_extension","hyperextension"],
    caution_tags: ["squat","bent_over_row","leg_press"],
    preferred_tags: ["core_stability","bird_dog","glute_bridge","plank","hip_hinge_light"],
    max_pain_allowed: 3,
    allowed_rom_notes: "Notral omurga pozisyonunu koru, fleksiyon yuklemesinden kacin",
    volume_modifier: 0.75,
    intensity_modifier: 0.7,
    tempo_modifier: "2-1-2-1",
    cardio_preferences: ["yuruyus","eliptik","yuzme","bisiklet (dik pozisyon)"],
    prompt_note: "Bel agrisi: deadlift, good morning, roman deadlift, back extension, hyperextension KESINLIKLE YAZMA. Squat yapilacaksa goblet veya box squat tercih et. Core stabilite egzersizleri (bird dog, dead bug, plank) ekle.",
  },
  disc_irritation: {
    label: "Disk Sorunu (Fitik/Basi)",
    avoid_tags: ["spinal_flexion_load","spinal_shear","deadlift","squat_heavy","good_morning","roman_deadlift","back_extension","hyperextension","leg_press_deep"],
    caution_tags: ["rotation_loaded","hip_flexor_stretch_forced"],
    preferred_tags: ["core_bracing","glute_bridge","bird_dog","wall_sit","hip_abduction"],
    max_pain_allowed: 2,
    allowed_rom_notes: "Omurga fleksiyonunda yuklenme kesinlikle yok, notral pozisyon zorunlu",
    volume_modifier: 0.65,
    intensity_modifier: 0.6,
    tempo_modifier: "3-1-3-0",
    cardio_preferences: ["yuruyus (duz zemin)","yuzme (sirtüstu veya serbest)","bisiklet (dik)"],
    prompt_note: "Disk sorunu: deadlift, squat, good morning, roman deadlift, back extension, hyperextension HICBIR KOSULDA YAZMA. Sadece notral omurga pozisyonunda yapilabilen egzersizler sec. Glute bridge, bird dog, dead bug agirlikli program yap.",
  },
  neck_pain: {
    label: "Boyun Agrisi",
    avoid_tags: ["overhead_heavy","behind_neck","neck_extension_loaded","shrug_heavy","front_squat_bar"],
    caution_tags: ["overhead","shoulder_press","upright_row"],
    preferred_tags: ["chin_tuck","scapular_depression","low_row","face_pull","lat_pulldown_front"],
    max_pain_allowed: 3,
    allowed_rom_notes: "Boyun notral pozisyonda kal, eksenel yuklemeden kacin",
    volume_modifier: 0.8,
    intensity_modifier: 0.75,
    tempo_modifier: "2-1-2-1",
    cardio_preferences: ["yuruyus","bisiklet","eliptik"],
    prompt_note: "Boyun agrisi: behind neck press, overhead agir hareketler, shrug YOK. Boyunla notral pozisyonda yapilabilen hareketleri sec.",
  },
  lateral_epicondylitis: {
    label: "Dirsek Dis Tendiniti (Tenisci Dirsegi)",
    avoid_tags: ["wrist_extension_load","pronation_load","gripping_heavy","barbell_curl"],
    caution_tags: ["pull_up","row_underhand","hammer_curl"],
    preferred_tags: ["wrist_flexion_gentle","forearm_stretch","eccentric_wrist_ext"],
    max_pain_allowed: 3,
    allowed_rom_notes: "Bilek ekstansiyonunda yuklenme yok, kavrama kuvvetini sinirla",
    volume_modifier: 0.75,
    intensity_modifier: 0.7,
    tempo_modifier: "3-1-3-1",
    cardio_preferences: ["yuruyus","bisiklet (duz gidon)","eliptik"],
    prompt_note: "Tenisci dirsegi: agir barbell curl, bilek ekstansiyonlu egzersizler YOK. Kavrama gerektiren egzersizlerde modifiye variasyon kullan.",
  },
  wrist_pain: {
    label: "Bilek Agrisi",
    avoid_tags: ["wrist_extension_flag","push_up","plank_wrist","barbell_press_grip","snatch","clean"],
    caution_tags: ["dumbbell_press","bicep_curl"],
    preferred_tags: ["fist_pushup","forearm_plank","cable_row","neutral_grip"],
    max_pain_allowed: 3,
    allowed_rom_notes: "Bilek ekstansiyonunda yuklenme yok, notral tutus tercih et",
    volume_modifier: 0.8,
    intensity_modifier: 0.75,
    tempo_modifier: "2-1-2-1",
    cardio_preferences: ["yuruyus","bisiklet","eliptik","kossu bandi"],
    prompt_note: "Bilek agrisi: push-up, plank, bilekte ekstansiyon gerektiren egzersizler YOK. Forearm plank, notral tutuslu dumbbell hareketleri tercih et.",
  },
  patellofemoral_pain: {
    label: "Patellofemoral Agri (Diz Kapagi)",
    avoid_tags: ["deep_knee_flexion","squat_below_parallel","lunge_deep","leg_extension_machine","jump","box_jump"],
    caution_tags: ["squat","lunge","step_up","leg_press"],
    preferred_tags: ["terminal_knee_extension","straight_leg_raise","hip_abduction","glute_bridge","hip_extension"],
    max_pain_allowed: 3,
    allowed_rom_notes: "Diz 90 derecenin altina gitmesin, diz one gecmesin",
    volume_modifier: 0.75,
    intensity_modifier: 0.7,
    tempo_modifier: "3-1-3-0",
    cardio_preferences: ["bisiklet (dusuk direnc)","yuzme","eliptik"],
    prompt_note: "Diz kapagi (patellofemoral) agrisi: derin squat, lunge, leg extension, jump, box jump YOK. Yuzey squat (45 derece kadar), terminal knee extension, straight leg raise, glute bridge tercih et.",
  },
  meniscus_irritation: {
    label: "Meniskus Tahrisi",
    avoid_tags: ["deep_knee_flexion","squat_below_parallel","lunge_deep","twist_loaded_knee","jump","box_jump","leg_press_deep"],
    caution_tags: ["squat","lunge","step_up"],
    preferred_tags: ["straight_leg_raise","hip_abduction","clamshell","terminal_knee_extension","glute_bridge"],
    max_pain_allowed: 2,
    allowed_rom_notes: "Diz bukulmesini 90 derece ile sinirla, rotasyonlu yuklenme yok",
    volume_modifier: 0.7,
    intensity_modifier: 0.65,
    tempo_modifier: "3-1-3-0",
    cardio_preferences: ["bisiklet (sabit, dusuk direnc)","yuzme","eliptik"],
    prompt_note: "Meniskus tahrisi: derin squat, lunge, jump, leg press (derin), diz rotasyonu gerektiren hareketler YOK. Duz bacak kaldirma, hip abduction, glute bridge tercih et.",
  },
  ankle_instability: {
    label: "Ayak Bilegi Instabilitesi",
    avoid_tags: ["impact_flag","lateral_jump","plyometric","single_leg_unstable","box_jump"],
    caution_tags: ["single_leg_squat","lunge","step_up"],
    preferred_tags: ["seated_calf_raise","hip_strengthening","bilateral_stable"],
    max_pain_allowed: 3,
    allowed_rom_notes: "Stabilsiz zemin ve tek tarafli yuksek yuk iceren hareketlerden kacin",
    volume_modifier: 0.85,
    intensity_modifier: 0.8,
    tempo_modifier: "2-1-2-1",
    cardio_preferences: ["bisiklet","yuzme","eliptik"],
    prompt_note: "Ayak bilegi instabilitesi: ziplama, lateral jump, plyometric egzersizler YOK. Oturarak yapilan egzersizler ve bilateral hareketler tercih et.",
  },
  hamstring_strain_history: {
    label: "Hamstring Gecmisi (Cekme/Yirtik)",
    avoid_tags: ["spinal_flexion_load","straight_leg_deadlift_heavy","sprint","high_impact"],
    caution_tags: ["rdl","good_morning","leg_curl"],
    preferred_tags: ["hip_extension_controlled","glute_bridge","leg_curl_light","hip_hinge_light"],
    max_pain_allowed: 3,
    allowed_rom_notes: "Ani hamstring gerilmesinden kacin, kontrollu eksentrik ile progres",
    volume_modifier: 0.75,
    intensity_modifier: 0.7,
    tempo_modifier: "3-1-3-0 (eksentrik odakli)",
    cardio_preferences: ["bisiklet","yuruyus","yuzme"],
    prompt_note: "Hamstring gecmisi: agir stiff-leg deadlift, sprint YOK. Kontrollu hip hinge, hafif leg curl, glute bridge ile basla.",
  },
  postural_deconditioning: {
    label: "Postural Bozukluk / Genel Gucsuizluk",
    avoid_tags: ["spinal_compression_heavy","plyometric","max_load","olympic_lift"],
    caution_tags: ["squat_heavy","deadlift","overhead_heavy"],
    preferred_tags: ["core_activation","scapular_stability","hip_hinge_bodyweight","thoracic_mobility","glute_activation"],
    max_pain_allowed: 5,
    allowed_rom_notes: "Eklem mobilitesi gelisene kadar tam ROM dan kacin",
    volume_modifier: 0.7,
    intensity_modifier: 0.65,
    tempo_modifier: "2-1-2-1",
    cardio_preferences: ["yuruyus","bisiklet","eliptik","hafif yuzme"],
    prompt_note: "Postural bozukluk: agir compound hareketler ve olimpik kaldirisllar yerine vucut farkindaligi, core aktivasyon, mobilite egzersizlerine oncelik ver.",
  },
};

export const BODY_AREA_TO_PROFILES: Record<string, InjuryProfile[]> = {
  omuz: ["shoulder_impingement", "rotator_cuff_irritation"],
  bel: ["low_back_pain_general", "disc_irritation"],
  boyun: ["neck_pain"],
  diz: ["patellofemoral_pain", "meniscus_irritation"],
  bilek: ["wrist_pain", "lateral_epicondylitis"],
  kalca: ["hamstring_strain_history", "postural_deconditioning"],
  ayak_bilegi: ["ankle_instability"],
};

export interface RedFlagInput {
  chest_pain?: boolean;
  fainting?: boolean;
  severe_dizziness?: boolean;
  progressive_numbness?: boolean;
  bowel_bladder_change?: boolean;
  new_trauma?: boolean;
  post_surgery_no_clearance?: boolean;
  resting_high_pain?: boolean;
}

export function checkRedFlags(flags: RedFlagInput): string | null {
  if (flags.chest_pain)
    return "Gogus agrisi bildirdiniz. Egzersiz programi olusturulmadan once lutfen bir saglik uzmanina basvurun.";
  if (flags.fainting)
    return "Bayilma/senkop oykünuz var. Tibbi degerlendirme olmadan program olusturulamaz.";
  if (flags.severe_dizziness)
    return "Ciddi bas donmesi bildirdiniz. Lutfen once bir doktora danisin.";
  if (flags.progressive_numbness)
    return "Ilerleyici uyusma veya guc kaybi var. Norolojik degerlendirme gerekebilir.";
  if (flags.bowel_bladder_change)
    return "Idrar/bagırsak kontrolunde degisiklik ciddi bir uyari isarecidir. Lutfen acilen saglik uzmanina basvurun.";
  if (flags.new_trauma)
    return "Yeni travma bildirdiniz. Goruntuleme/degerlendirme olmadan program olusturulamaz.";
  if (flags.post_surgery_no_clearance)
    return "Ameliyat sonrasi donemdesiniz ve doktor onayi almadınız. Lutfen once doktorunuzdan egzersize baslama onayi alin.";
  if (flags.resting_high_pain)
    return "Istirahatte yuksek agri bildirdiniz. Aktif antrenman baslamadan once tibbi degerlendirme gereklidir.";
  return null;
}

export function buildInjuryContext(
  bodyAreas: string[],
  painLevel: number,
  diagnosisConfirmed: boolean,
  bannedMovements: string
): {
  promptNote: string;
  volumeModifier: number;
  intensityModifier: number;
  tempoNote: string;
  cardioPreferences: string[];
} {
  const matchedRules: InjuryRule[] = [];

  for (const area of bodyAreas) {
    const profiles = BODY_AREA_TO_PROFILES[area] ?? [];
    for (const p of profiles) {
      const rule = INJURY_RULES[p];
      if (!matchedRules.includes(rule)) matchedRules.push(rule);
    }
  }

  if (matchedRules.length === 0) {
    return { promptNote: "", volumeModifier: 1, intensityModifier: 1, tempoNote: "", cardioPreferences: [] };
  }

  const minVolume    = Math.min(...matchedRules.map((r) => r.volume_modifier));
  const minIntensity = Math.min(...matchedRules.map((r) => r.intensity_modifier));
  const painPenalty  = painLevel >= 7 ? 0.6 : painLevel >= 5 ? 0.75 : painLevel >= 3 ? 0.9 : 1;
  const conservativeBonus = !diagnosisConfirmed ? 0.9 : 1;

  const allNotes = matchedRules.map((r) => r.prompt_note).join("\n");
  const tempos   = [...new Set(matchedRules.map((r) => r.tempo_modifier))].join(", ");
  const cardio   = [...new Set(matchedRules.flatMap((r) => r.cardio_preferences))].slice(0, 4);

  let extraNote = "";
  if (!diagnosisConfirmed) extraNote += "\nKesin tani YOK — belirsiz durumlarda daha konservatif tercih yap.";
  if (painLevel >= 7) extraNote += "\nAgri seviyesi yuksek (7+) — sadece cok guvenli, dusuk yuklemeli hareketler ekle.";

  const bannedNote = bannedMovements.trim()
    ? "\n KULLANICININ YASAKLI HAREKETLERI KESINLIKLE YAZMA: " + bannedMovements
    : "";

  return {
    promptNote:        allNotes + extraNote + bannedNote,
    volumeModifier:    Math.round(minVolume    * painPenalty * conservativeBonus * 100) / 100,
    intensityModifier: Math.round(minIntensity * painPenalty * conservativeBonus * 100) / 100,
    tempoNote:         tempos,
    cardioPreferences: cardio,
  };
}
