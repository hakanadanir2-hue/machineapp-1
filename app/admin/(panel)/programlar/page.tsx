"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, XCircle, Eye, ChevronDown, ChevronUp, User, Dumbbell, Apple, Pencil, Save, X } from "lucide-react";

interface Program {
  id: string; title: string; summary: string | null; goal: string | null;
  fitness_level: string | null; days_per_week: number | null; duration_weeks: number | null;
  status: string; admin_notes: string | null; rejection_reason: string | null;
  approved_at: string | null; rejected_at: string | null; created_at: string;
  requester_name: string | null; requester_email: string | null;
  profile?: { full_name:string|null; age:number|null; gender:string|null; height_cm:number|null; weight_kg:number|null; bmi:number|null; bmi_category:string|null; injuries:string|null; available_equipment:string|null; } | null;
}
interface ProgramDetail { program: Program; profile: Record<string,unknown>|null; weeks: WeekDetail[]; nutrition: NutritionPlan|null; }
interface WeekDetail { id:string; week_number:number; notes:string|null; days:DayDetail[]; }
interface DayDetail { id:string; day_number:number; day_name:string|null; focus:string|null; is_rest_day:boolean; warmup_notes:string|null; cooldown_notes:string|null; total_duration_min:number|null; notes:string|null; exercises:ExerciseRow[]; }
interface ExerciseRow { id:string; exercise_name:string; sets:number|null; reps:string|null; rest_seconds:number|null; modification:string|null; notes:string|null; order_index:number; }
interface NutritionPlan { daily_calories:number|null; protein_g:number|null; carb_g:number|null; fat_g:number|null; water_ml:number|null; meal_count:number|null; meals:{name:string;time:string;foods:string[];calories:number;notes?:string}[]|null; supplement_notes:string|null; general_notes:string|null; }

type EditEx = Record<string, { sets:number; reps:string; rest_seconds:number; notes:string; exercise_name:string }>;
interface EditNut { daily_calories:number; protein_g:number; carb_g:number; fat_g:number; water_ml:number; general_notes:string; }

const STATUS_LABELS: Record<string,{label:string;color:string;bg:string}> = {
  pending:  {label:"Onay Bekliyor",color:"#facc15",bg:"rgba(250,204,21,.1)"},
  approved: {label:"Onaylandı",   color:"#4ade80",bg:"rgba(74,222,128,.1)"},
  rejected: {label:"Reddedildi",  color:"#f87171",bg:"rgba(248,113,113,.1)"},
  active:   {label:"Aktif",       color:"#60a5fa",bg:"rgba(96,165,250,.1)"},
  completed:{label:"Tamamlandı",  color:"#a78bfa",bg:"rgba(167,139,250,.1)"},
};
const GOAL_LABELS: Record<string,string> = {
  kilo_ver:"Kilo Verme",kas_kazan:"Kas Kazanma",kondisyon:"Kondisyon",
  saglikli_kal:"Sağlıklı Kalma",rehabilitasyon:"Rehabilitasyon",genel_fitness:"Genel Fitness",
};

const INP: React.CSSProperties = { background:"#0F0F0F", border:"1px solid rgba(255,255,255,.15)", borderRadius:6, color:"#fff", padding:"5px 8px", fontSize:12, width:"100%", boxSizing:"border-box" as const };

export default function AdminProgramlarPage() {
  const supabase = useMemo(() => createClient(), []);
  const [programs, setPrograms]   = useState<Program[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filterStatus, setFilter] = useState("all");
  const [detailId, setDetailId]   = useState<string|null>(null);
  const [detail, setDetail]       = useState<ProgramDetail|null>(null);
  const [detailLoading, setDetLoad] = useState(false);
  const [actionLoading, setActLoad] = useState<string|null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [rejectReason, setRejectR]= useState("");
  const [toast, setToast]         = useState<string|null>(null);

  // Edit state
  const [isEditing, setEditing]   = useState(false);
  const [editEx, setEditEx]       = useState<EditEx>({});
  const [editNut, setEditNut]     = useState<EditNut|null>(null);
  const [editSummary, setEditSum] = useState("");
  const [saving, setSaving]       = useState(false);

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(null),3500); };

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("programs")
      .select("*, profile:user_profiles(full_name,age,gender,height_cm,weight_kg,bmi,bmi_category,injuries,available_equipment)")
      .order("created_at",{ascending:false});
    if (filterStatus !== "all") q = q.eq("status", filterStatus);
    const { data } = await q;
    setPrograms((data ?? []) as Program[]);
    setLoading(false);
  }, [filterStatus, supabase]);

  useEffect(() => { load(); }, [load]);

  async function openDetail(id:string) {
    setDetailId(id); setDetail(null); setDetLoad(true); setEditing(false);
    const res = await fetch(`/api/programs/${id}`);
    const d   = await res.json() as ProgramDetail;
    setDetail(d);
    // Init edit state
    const exMap: EditEx = {};
    d.weeks.forEach(w => w.days.forEach(day => day.exercises.forEach(ex => {
      exMap[ex.id] = { sets: ex.sets??3, reps: ex.reps??"10", rest_seconds: ex.rest_seconds??60, notes: ex.notes??"", exercise_name: ex.exercise_name };
    })));
    setEditEx(exMap);
    if (d.nutrition) {
      setEditNut({ daily_calories: d.nutrition.daily_calories??2000, protein_g: d.nutrition.protein_g??150, carb_g: d.nutrition.carb_g??200, fat_g: d.nutrition.fat_g??70, water_ml: d.nutrition.water_ml??2500, general_notes: d.nutrition.general_notes??"" });
    }
    setEditSum(d.program.summary ?? "");
    setDetLoad(false);
  }

  async function handleAction(id:string, action:"approve"|"reject") {
    setActLoad(action);
    const res = await fetch(`/api/programs/${id}`, {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action, admin_notes:adminNote, rejection_reason:rejectReason }),
    });
    const data = await res.json() as { success?:boolean; error?:string };
    setActLoad(null);
    if (!data.success) { showToast("Hata: "+data.error); return; }
    showToast(action==="approve" ? "Program onaylandı ✓" : "Program reddedildi");
    setDetailId(null); setAdminNote(""); setRejectR(""); load();
  }

  async function saveEdits() {
    if (!detail || !detailId) return;
    setSaving(true);
    try {
      // Update program summary
      await supabase.from("programs").update({ summary: editSummary, updated_at: new Date().toISOString() }).eq("id", detailId);
      // Update exercises in batches
      const exUpdates = Object.entries(editEx).map(([id, vals]) =>
        supabase.from("program_exercises").update({ sets:vals.sets, reps:vals.reps, rest_seconds:vals.rest_seconds, notes:vals.notes||null, exercise_name:vals.exercise_name }).eq("id", id)
      );
      await Promise.all(exUpdates);
      // Update nutrition
      if (editNut) {
        await supabase.from("nutrition_plans").update({ daily_calories:editNut.daily_calories, protein_g:editNut.protein_g, carb_g:editNut.carb_g, fat_g:editNut.fat_g, water_ml:editNut.water_ml, general_notes:editNut.general_notes||null }).eq("program_id", detailId);
      }
      showToast("Değişiklikler kaydedildi ✓");
      setEditing(false);
      // Reload detail
      const res = await fetch(`/api/programs/${detailId}`);
      const d   = await res.json() as ProgramDetail;
      setDetail(d);
    } catch {
      showToast("Kayıt sırasında hata oluştu");
    }
    setSaving(false);
  }

  const pendingCount  = programs.filter(p=>p.status==="pending").length;
  const approvedCount = programs.filter(p=>p.status==="approved").length;

  return (
    <div style={{padding:24,background:"#0A0A0A",minHeight:"100vh",color:"#fff"}}>
      {toast && (
        <div style={{position:"fixed",top:20,right:20,zIndex:999,background:"#1a1a1a",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"12px 18px",color:"#fff",fontSize:13,fontWeight:600}}>
          {toast}
        </div>
      )}

      <h1 style={{fontSize:22,fontWeight:900,marginBottom:4}}>Program Yönetimi</h1>
      <p style={{color:"rgba(255,255,255,.3)",fontSize:13,marginBottom:24}}>AI tarafından oluşturulan kişisel programları incele, düzenle ve onayla</p>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[
          {label:"Toplam",        value:programs.length,                                        color:"#fff"},
          {label:"Onay Bekliyor", value:pendingCount,                                           color:"#facc15"},
          {label:"Onaylı",        value:approvedCount,                                          color:"#4ade80"},
          {label:"Reddedildi",    value:programs.filter(p=>p.status==="rejected").length,       color:"#f87171"},
        ].map(s=>(
          <div key={s.label} style={{background:"#141414",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.value}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
        {[["all","Tümü"],["pending","Bekleyen"],["approved","Onaylı"],["rejected","Reddedilen"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)}
            style={{padding:"7px 14px",borderRadius:8,border:"none",fontWeight:600,fontSize:12,cursor:"pointer",
              background:filterStatus===v?"#7A0D2A":"rgba(255,255,255,.07)",
              color:filterStatus===v?"#fff":"rgba(255,255,255,.4)"}}>
            {l}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{color:"rgba(255,255,255,.3)",padding:40,textAlign:"center"}}>Yükleniyor...</div>
      ) : programs.length===0 ? (
        <div style={{color:"rgba(255,255,255,.2)",padding:40,textAlign:"center",background:"#111",borderRadius:12,border:"1px solid rgba(255,255,255,.05)"}}>Henüz program yok</div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {programs.map(p=>{
            const st = STATUS_LABELS[p.status]??STATUS_LABELS.pending;
            const prof = p.profile;
            const name = prof?.full_name ?? p.requester_name ?? "—";
            return (
              <div key={p.id} style={{background:"#111",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,padding:"16px 18px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:14,flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:200}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{background:st.bg,color:st.color,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:6}}>{st.label}</span>
                      {p.goal&&<span style={{fontSize:10,color:"rgba(255,255,255,.3)",background:"rgba(255,255,255,.05)",padding:"2px 8px",borderRadius:6}}>{GOAL_LABELS[p.goal]??p.goal}</span>}
                      {p.fitness_level&&<span style={{fontSize:10,color:"rgba(255,255,255,.3)",background:"rgba(255,255,255,.05)",padding:"2px 8px",borderRadius:6}}>{p.fitness_level}</span>}
                    </div>
                    <div style={{fontWeight:700,fontSize:14,color:"#fff",marginBottom:4}}>{p.title}</div>
                    {p.summary&&<div style={{fontSize:12,color:"rgba(255,255,255,.4)",lineHeight:1.5,marginBottom:8}}>{p.summary}</div>}
                    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,color:"rgba(255,255,255,.4)"}}><User size={10} style={{display:"inline"}}/> {name}</span>
                      {p.requester_email&&<span style={{fontSize:11,color:"rgba(255,255,255,.3)"}}>{p.requester_email}</span>}
                      {prof?.age&&<span style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>{prof.age} yaş · {prof.gender==="erkek"?"E":"K"}</span>}
                      {prof?.bmi&&<span style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>BMI: {prof.bmi}</span>}
                      {prof?.injuries&&<span style={{fontSize:11,color:"#facc15"}}>⚠ {prof.injuries}</span>}
                    </div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.2)",marginTop:6}}>
                      {new Date(p.created_at).toLocaleString("tr-TR")} · {p.days_per_week} gün/hafta
                    </div>
                  </div>
                  <button onClick={()=>openDetail(p.id)}
                    style={{display:"flex",alignItems:"center",gap:5,background:p.status==="pending"?"rgba(250,204,21,.1)":"rgba(255,255,255,.07)",border:`1px solid ${p.status==="pending"?"rgba(250,204,21,.25)":"transparent"}`,color:p.status==="pending"?"#facc15":"rgba(255,255,255,.6)",padding:"8px 14px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700}}>
                    <Eye size={13}/> {p.status==="pending"?"İncele & Onayla":"Detay"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {detailId && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.95)",zIndex:200,overflowY:"auto",padding:"20px 16px"}}
          onClick={e=>{if(e.target===e.currentTarget){setDetailId(null);setEditing(false);}}}>
          <div style={{maxWidth:780,margin:"0 auto",background:"#111",border:"1px solid rgba(255,255,255,.1)",borderRadius:20,overflow:"hidden"}}>

            {/* Modal header */}
            <div style={{padding:"18px 22px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontWeight:800,fontSize:16,color:"#fff"}}>Program Detayı</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {detail && !isEditing && (
                  <button onClick={()=>setEditing(true)}
                    style={{display:"flex",alignItems:"center",gap:5,background:"rgba(212,175,55,.1)",border:"1px solid rgba(212,175,55,.25)",color:"#D4AF37",padding:"7px 13px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700}}>
                    <Pencil size={12}/> Düzenle
                  </button>
                )}
                {isEditing && (
                  <>
                    <button onClick={saveEdits} disabled={saving}
                      style={{display:"flex",alignItems:"center",gap:5,background:"rgba(74,222,128,.12)",border:"1px solid rgba(74,222,128,.25)",color:"#4ade80",padding:"7px 13px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700}}>
                      <Save size={12}/> {saving?"Kaydediliyor...":"Kaydet"}
                    </button>
                    <button onClick={()=>setEditing(false)}
                      style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,.06)",border:"none",color:"rgba(255,255,255,.4)",padding:"7px 13px",borderRadius:8,cursor:"pointer",fontSize:12}}>
                      <X size={12}/> İptal
                    </button>
                  </>
                )}
                <button onClick={()=>{setDetailId(null);setEditing(false);}}
                  style={{background:"rgba(255,255,255,.06)",border:"none",color:"rgba(255,255,255,.4)",padding:"6px 10px",borderRadius:8,cursor:"pointer"}}>✕</button>
              </div>
            </div>

            {detailLoading ? (
              <div style={{padding:40,textAlign:"center",color:"rgba(255,255,255,.3)"}}>Yükleniyor...</div>
            ) : detail ? (
              <div style={{padding:"20px 22px",display:"flex",flexDirection:"column",gap:20}}>

                {/* Summary */}
                <div>
                  <div style={{fontWeight:800,fontSize:17,color:"#fff",marginBottom:6}}>{detail.program.title}</div>
                  {isEditing ? (
                    <textarea value={editSummary} onChange={e=>setEditSum(e.target.value)} rows={3}
                      style={{...INP,resize:"vertical",lineHeight:1.5}} placeholder="Program özeti..."/>
                  ) : (
                    <p style={{color:"rgba(255,255,255,.45)",fontSize:13,lineHeight:1.6,margin:0}}>{detail.program.summary}</p>
                  )}
                </div>

                {/* Profile */}
                {detail.profile && (
                  <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"14px 16px"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
                      <User size={11}/> Kullanıcı Profili
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                      {([
                        ["Ad",      String(detail.profile.full_name??"—")],
                        ["Yaş",     String(detail.profile.age??"—")],
                        ["Cinsiyet",String(detail.profile.gender??"—")],
                        ["Boy",     `${detail.profile.height_cm??"—"} cm`],
                        ["Kilo",    `${detail.profile.weight_kg??"—"} kg`],
                        ["BMI",     `${detail.profile.bmi??"—"} (${detail.profile.bmi_category??"—"})`],
                        ["E-posta", String(detail.program.requester_email??"—")],
                        ["Ekipman", String(detail.profile.available_equipment??"—")],
                      ] as [string,string][]).map(([k,v])=>(
                        <div key={k}>
                          <div style={{fontSize:10,color:"rgba(255,255,255,.25)"}}>{k}</div>
                          <div style={{fontSize:12,color:"#fff",fontWeight:600,wordBreak:"break-word"}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {detail.profile.injuries && (
                      <div style={{marginTop:10,background:"rgba(250,204,21,.08)",border:"1px solid rgba(250,204,21,.15)",borderRadius:8,padding:"8px 10px",color:"#facc15",fontSize:12}}>
                        ⚠ Yaralanma/Kısıtlama: {String(detail.profile.injuries)}
                      </div>
                    )}
                  </div>
                )}

                {/* Weeks / Exercises */}
                {detail.weeks.length>0 && (
                  <WeekEditView
                    weeks={detail.weeks}
                    isEditing={isEditing}
                    editEx={editEx}
                    onExChange={(id, field, val) => setEditEx(prev=>({...prev,[id]:{...prev[id],[field]:val}}))}
                  />
                )}

                {/* Nutrition */}
                {detail.nutrition && (
                  <NutritionEditView
                    nutrition={detail.nutrition}
                    isEditing={isEditing}
                    editNut={editNut}
                    onNutChange={(field, val) => setEditNut(prev=>prev?{...prev,[field]:val}:null)}
                  />
                )}

                {/* Actions */}
                {detail.program.status==="pending" && !isEditing && (
                  <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"16px 18px",display:"flex",flexDirection:"column",gap:12}}>
                    <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase"}}>Admin Kararı</div>
                    <textarea value={adminNote} onChange={e=>setAdminNote(e.target.value)} rows={2}
                      placeholder="Admin notu (opsiyonel)..."
                      style={{background:"#0F0F0F",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,color:"#fff",padding:"9px 12px",fontSize:12,width:"100%",boxSizing:"border-box",resize:"vertical"}}/>
                    <input value={rejectReason} onChange={e=>setRejectR(e.target.value)}
                      placeholder="Red sebebi (reddedilirse)..."
                      style={{background:"#0F0F0F",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,color:"#fff",padding:"9px 12px",fontSize:12,width:"100%",boxSizing:"border-box"}}/>
                    <div style={{display:"flex",gap:10}}>
                      <button onClick={()=>handleAction(detailId,"approve")} disabled={actionLoading==="approve"}
                        style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"rgba(74,222,128,.12)",border:"1px solid rgba(74,222,128,.25)",color:"#4ade80",padding:"12px",borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:13}}>
                        <CheckCircle2 size={15}/> {actionLoading==="approve"?"İşleniyor...":"Onayla"}
                      </button>
                      <button onClick={()=>handleAction(detailId,"reject")} disabled={actionLoading==="reject"}
                        style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.2)",color:"#f87171",padding:"12px",borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:13}}>
                        <XCircle size={15}/> {actionLoading==="reject"?"İşleniyor...":"Reddet"}
                      </button>
                    </div>
                  </div>
                )}

                {detail.program.status==="approved" && (
                  <div style={{background:"rgba(74,222,128,.06)",border:"1px solid rgba(74,222,128,.2)",borderRadius:10,padding:"12px 14px",color:"#4ade80",fontSize:13}}>
                    ✓ Onaylandı: {new Date(detail.program.approved_at!).toLocaleString("tr-TR")}
                    {detail.program.admin_notes&&<div style={{marginTop:4,color:"rgba(74,222,128,.6)",fontSize:12}}>Not: {detail.program.admin_notes}</div>}
                  </div>
                )}
                {detail.program.status==="rejected" && (
                  <div style={{background:"rgba(248,113,113,.06)",border:"1px solid rgba(248,113,113,.2)",borderRadius:10,padding:"12px 14px",color:"#f87171",fontSize:13}}>
                    ✗ Reddedildi{detail.program.rejection_reason?` — ${detail.program.rejection_reason}`:""}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function WeekEditView({ weeks, isEditing, editEx, onExChange }: {
  weeks: WeekDetail[];
  isEditing: boolean;
  editEx: EditEx;
  onExChange: (id:string, field:string, val:string|number) => void;
}) {
  const [openWeek, setOpenWeek] = useState<number>(1);
  return (
    <div>
      <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
        <Dumbbell size={11}/> Program ({weeks.length} Hafta)
        {isEditing&&<span style={{fontSize:10,color:"#D4AF37",marginLeft:8}}>— Düzenleme modu</span>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {weeks.map(week=>(
          <div key={week.id} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,overflow:"hidden"}}>
            <button onClick={()=>setOpenWeek(openWeek===week.week_number?0:week.week_number)}
              style={{width:"100%",background:"none",border:"none",color:"#fff",padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontWeight:700,fontSize:13}}>Hafta {week.week_number}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {week.notes&&<span style={{fontSize:11,color:"rgba(255,255,255,.3)"}}>{week.notes.slice(0,40)}</span>}
                {openWeek===week.week_number?<ChevronUp size={14}/>:<ChevronDown size={14}/>}
              </div>
            </button>
            {openWeek===week.week_number && (
              <div style={{padding:"0 14px 14px",display:"flex",flexDirection:"column",gap:8}}>
                {week.days.map(day=>(
                  <div key={day.id} style={{background:day.is_rest_day?"rgba(255,255,255,.02)":"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)",borderRadius:10,padding:"10px 12px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:day.is_rest_day?0:8}}>
                      <span style={{fontWeight:700,fontSize:12,color:day.is_rest_day?"rgba(255,255,255,.3)":"#fff"}}>
                        {day.day_name} — {day.focus}
                      </span>
                      {day.is_rest_day&&<span style={{fontSize:10,color:"rgba(255,255,255,.2)",background:"rgba(255,255,255,.05)",padding:"1px 7px",borderRadius:5}}>Dinlenme</span>}
                      {day.total_duration_min&&!day.is_rest_day&&<span style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{day.total_duration_min} dk</span>}
                    </div>
                    {!day.is_rest_day && day.exercises.length>0 && (
                      <div style={{display:"flex",flexDirection:"column",gap:4}}>
                        {day.warmup_notes&&<div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginBottom:4}}>🔥 {day.warmup_notes}</div>}
                        {/* Table header */}
                        {isEditing && (
                          <div style={{display:"grid",gridTemplateColumns:"1fr 60px 60px 60px 1fr",gap:4,marginBottom:2}}>
                            {["Hareket","Set","Tekrar","Dinl.(s)","Not"].map(h=>(
                              <div key={h} style={{fontSize:9,color:"rgba(255,255,255,.2)",textAlign:"center"}}>{h}</div>
                            ))}
                          </div>
                        )}
                        {day.exercises.map((ex,i)=>{
                          const ed = editEx[ex.id];
                          return isEditing && ed ? (
                            <div key={ex.id} style={{display:"grid",gridTemplateColumns:"1fr 60px 60px 60px 1fr",gap:4,alignItems:"center"}}>
                              <input value={ed.exercise_name} onChange={e=>onExChange(ex.id,"exercise_name",e.target.value)} style={{fontSize:11,background:"#0F0F0F",border:"1px solid rgba(255,255,255,.15)",borderRadius:5,color:"#fff",padding:"4px 6px"}}/>
                              <input type="number" value={ed.sets} onChange={e=>onExChange(ex.id,"sets",Number(e.target.value))} style={{...{fontSize:11,background:"#0F0F0F",border:"1px solid rgba(255,255,255,.15)",borderRadius:5,color:"#D4AF37",padding:"4px 6px",textAlign:"center" as const}}}/>
                              <input value={ed.reps} onChange={e=>onExChange(ex.id,"reps",e.target.value)} style={{fontSize:11,background:"#0F0F0F",border:"1px solid rgba(255,255,255,.15)",borderRadius:5,color:"#D4AF37",padding:"4px 6px",textAlign:"center"}}/>
                              <input type="number" value={ed.rest_seconds} onChange={e=>onExChange(ex.id,"rest_seconds",Number(e.target.value))} style={{fontSize:11,background:"#0F0F0F",border:"1px solid rgba(255,255,255,.15)",borderRadius:5,color:"rgba(255,255,255,.4)",padding:"4px 6px",textAlign:"center"}}/>
                              <input value={ed.notes} onChange={e=>onExChange(ex.id,"notes",e.target.value)} placeholder="not..." style={{fontSize:11,background:"#0F0F0F",border:"1px solid rgba(255,255,255,.15)",borderRadius:5,color:"rgba(255,255,255,.5)",padding:"4px 6px"}}/>
                            </div>
                          ) : (
                            <div key={ex.id} style={{display:"flex",gap:8,alignItems:"center",background:"rgba(0,0,0,.2)",borderRadius:6,padding:"6px 8px"}}>
                              <span style={{fontSize:10,color:"rgba(255,255,255,.2)",width:16,textAlign:"center"}}>{i+1}</span>
                              <span style={{fontSize:12,color:"#fff",flex:1,fontWeight:500}}>{ex.exercise_name}</span>
                              <span style={{fontSize:11,color:"rgba(255,255,255,.5)",whiteSpace:"nowrap"}}>{ex.sets}×{ex.reps}</span>
                              {ex.rest_seconds&&<span style={{fontSize:10,color:"rgba(255,255,255,.25)"}}>{ex.rest_seconds}s</span>}
                              {ex.notes&&<span style={{fontSize:10,color:"rgba(255,255,255,.3)",fontStyle:"italic"}}>{ex.notes}</span>}
                            </div>
                          );
                        })}
                        {day.cooldown_notes&&<div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:4}}>🧘 {day.cooldown_notes}</div>}
                      </div>
                    )}
                    {!day.is_rest_day&&day.exercises.length===0&&(
                      <div style={{fontSize:11,color:"rgba(255,165,0,.5)",fontStyle:"italic",padding:"4px 0"}}>⚠ Egzersizler kaydedilmemiş</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function NutritionEditView({ nutrition, isEditing, editNut, onNutChange }: {
  nutrition: NutritionPlan;
  isEditing: boolean;
  editNut: EditNut|null;
  onNutChange: (field:string, val:number|string) => void;
}) {
  const INP2: React.CSSProperties = {background:"#0F0F0F",border:"1px solid rgba(255,255,255,.15)",borderRadius:6,color:"#fff",padding:"6px 8px",fontSize:12,width:"100%",boxSizing:"border-box" as const,textAlign:"center" as const};
  return (
    <div>
      <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
        <Apple size={11}/> Beslenme Planı
        {isEditing&&<span style={{fontSize:10,color:"#D4AF37",marginLeft:8}}>— Düzenleme modu</span>}
      </div>
      <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"14px 16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
          {([
            {field:"daily_calories",label:"Kalori",unit:"kcal",color:"#facc15",val:isEditing&&editNut?editNut.daily_calories:nutrition.daily_calories},
            {field:"protein_g",     label:"Protein",unit:"g",  color:"#4ade80",val:isEditing&&editNut?editNut.protein_g:nutrition.protein_g},
            {field:"carb_g",        label:"Karb",   unit:"g",  color:"#60a5fa",val:isEditing&&editNut?editNut.carb_g:nutrition.carb_g},
            {field:"fat_g",         label:"Yağ",    unit:"g",  color:"#fb923c",val:isEditing&&editNut?editNut.fat_g:nutrition.fat_g},
          ] as {field:string;label:string;unit:string;color:string;val:number|null}[]).map(m=>(
            <div key={m.label} style={{textAlign:"center",background:"rgba(0,0,0,.2)",borderRadius:8,padding:"10px 6px"}}>
              {isEditing&&editNut ? (
                <>
                  <input type="number" value={m.val??0} onChange={e=>onNutChange(m.field,Number(e.target.value))} style={{...INP2,color:m.color,fontWeight:800,fontSize:14}}/>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:4}}>{m.label} ({m.unit})</div>
                </>
              ) : (
                <>
                  <div style={{fontSize:15,fontWeight:800,color:m.color}}>{m.val??"—"} {m.unit}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:2}}>{m.label}</div>
                </>
              )}
            </div>
          ))}
        </div>
        {isEditing&&editNut && (
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,color:"rgba(255,255,255,.3)",display:"block",marginBottom:4}}>Su (ml)</label>
            <input type="number" value={editNut.water_ml} onChange={e=>onNutChange("water_ml",Number(e.target.value))} style={{...INP2,width:"auto",textAlign:"left"}}/>
          </div>
        )}
        {nutrition.meals&&nutrition.meals.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {nutrition.meals.map((meal,i)=>(
              <div key={i} style={{background:"rgba(0,0,0,.15)",borderRadius:8,padding:"8px 10px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontWeight:700,fontSize:12,color:"#fff"}}>{meal.name}</span>
                  <span style={{fontSize:11,color:"rgba(255,255,255,.3)"}}>{meal.time} · {meal.calories} kcal</span>
                </div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.4)",lineHeight:1.5}}>{meal.foods?.join(", ")}</div>
              </div>
            ))}
          </div>
        )}
        {(isEditing&&editNut ? (
          <div style={{marginTop:10}}>
            <label style={{fontSize:11,color:"rgba(255,255,255,.3)",display:"block",marginBottom:4}}>Genel Notlar</label>
            <textarea value={editNut.general_notes} onChange={e=>onNutChange("general_notes",e.target.value)} rows={2}
              style={{background:"#0F0F0F",border:"1px solid rgba(255,255,255,.15)",borderRadius:6,color:"#fff",padding:"6px 8px",fontSize:12,width:"100%",boxSizing:"border-box",resize:"vertical"}}/>
          </div>
        ) : nutrition.general_notes ? (
          <div style={{marginTop:10,fontSize:12,color:"rgba(255,255,255,.4)",lineHeight:1.6,borderTop:"1px solid rgba(255,255,255,.05)",paddingTop:10}}>
            {nutrition.general_notes}
          </div>
        ) : null)}
      </div>
    </div>
  );
}
