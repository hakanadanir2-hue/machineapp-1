"use client";

import { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Loader2, ChevronRight, ChevronLeft, CheckCircle, Dumbbell, MessageCircle, AlertCircle } from "lucide-react";

type Gender   = "male" | "female";
type Goal     = "weight_loss"|"muscle_gain"|"toning"|"maintenance"|"boxing"|"health";
type Activity = "sedentary"|"light"|"moderate"|"active"|"extra_active";
type Level    = "beginner"|"intermediate"|"advanced";
type Equip    = "gym"|"home_basic"|"home_none"|"outdoor";
type Diet     = "standard"|"high_protein"|"low_carb"|"vegetarian"|"vegan";

interface F {
  full_name:string; email:string; gender:Gender;
  age:string; weight:string; height:string;
  goal:Goal; activity_level:Activity; level:Level;
  weekly_days:number; equipment:Equip; diet_preference:Diet;
  injury_notes:string; extra_notes:string;
}
interface ProgramResult {
  programId:string; title:string; summary:string;
  bmi:number; bmiCategory:string; message:string;
}

const INP:React.CSSProperties={width:"100%",padding:"0.875rem 1rem",background:"#111",border:"1px solid #2A2A2A",borderRadius:12,color:"#fff",fontSize:"0.9375rem",outline:"none",boxSizing:"border-box"};
const LBL:React.CSSProperties={display:"block",color:"rgba(255,255,255,0.6)",fontSize:"0.8125rem",fontWeight:500,marginBottom:"0.4rem"};
const ERR:React.CSSProperties={color:"#f87171",fontSize:"0.75rem",marginTop:4,display:"flex",alignItems:"center",gap:4};

function Chip({active,onClick,children}:{active:boolean;onClick:()=>void;children:React.ReactNode}){
  return(
    <button type="button" onClick={onClick} style={{padding:"0.625rem 0.875rem",borderRadius:10,cursor:"pointer",border:`1px solid ${active?"rgba(212,175,55,0.5)":"#2A2A2A"}`,background:active?"rgba(106,13,37,0.3)":"#111",color:active?"#D4AF37":"rgba(255,255,255,0.55)",fontWeight:active?700:500,fontSize:"0.875rem",textAlign:"left",transition:"all 0.15s"}}>
      {children}
    </button>
  );
}

const GOALS=[{v:"weight_loss",l:"Kilo Verme"},{v:"muscle_gain",l:"Kas Kazanma"},{v:"toning",l:"Sıkılaşma"},{v:"maintenance",l:"Form Koruma"},{v:"boxing",l:"Boks Performansı"},{v:"health",l:"Genel Sağlık"}];
const ACTS=[{v:"sedentary",l:"Sedanter",s:"Masa başı / hareketsiz"},{v:"light",l:"Hafif",s:"1-2 gün/hafta"},{v:"moderate",l:"Orta",s:"3-4 gün/hafta"},{v:"active",l:"Aktif",s:"5-6 gün/hafta"},{v:"extra_active",l:"Ekstra Aktif",s:"Günde 2x antrenman"}];
const LVLS=[{v:"beginner",l:"Başlangıç"},{v:"intermediate",l:"Orta Seviye"},{v:"advanced",l:"İleri Seviye"}];
const EQUIPS=[{v:"gym",l:"Spor Salonu"},{v:"home_basic",l:"Evde Temel Ekipman"},{v:"home_none",l:"Ekipmansız / Vücut Ağırlığı"},{v:"outdoor",l:"Dışarıda / Park"}];
const DIETS=[{v:"standard",l:"Standart"},{v:"high_protein",l:"Yüksek Protein"},{v:"low_carb",l:"Az Karbonhidrat"},{v:"vegetarian",l:"Vejetaryen"},{v:"vegan",l:"Vegan"}];

const INIT:F={full_name:"",email:"",gender:"male",age:"",weight:"",height:"",goal:"weight_loss",activity_level:"moderate",level:"beginner",weekly_days:3,equipment:"gym",diet_preference:"standard",injury_notes:"",extra_notes:""};

const actMap:Record<Activity,string>={sedentary:"sedanter",light:"hafif",moderate:"orta",active:"aktif",extra_active:"extra_aktif"};
const goalMap:Record<Goal,string>={weight_loss:"kilo_ver",muscle_gain:"kas_kazan",toning:"kondisyon",maintenance:"saglikli_kal",boxing:"genel_fitness",health:"saglikli_kal"};
const levelMap:Record<Level,string>={beginner:"baslangic",intermediate:"orta",advanced:"ileri"};
const equipMap:Record<Equip,string>={gym:"spor salonu, tüm ekipman",home_basic:"dumbbell, resistance band",home_none:"vücut ağırlığı",outdoor:"açık alan, vücut ağırlığı"};

function buildProfile(form:F){
  return{
    full_name:          form.full_name,
    age:                Number(form.age),
    gender:             form.gender==="male"?"erkek":"kadin",
    height_cm:          Number(form.height),
    weight_kg:          Number(form.weight),
    goal:               goalMap[form.goal],
    fitness_level:      levelMap[form.level],
    activity_level:     actMap[form.activity_level],
    days_per_week:      form.weekly_days,
    session_duration:   60,
    available_equipment:equipMap[form.equipment],
    diet_preference:    form.diet_preference,
    injuries:           form.injury_notes,
    medical_notes:      form.extra_notes,
  };
}

export default function ProgramAlPage(){
  const topRef = useRef<HTMLDivElement>(null);
  const [step,setStep]=useState(0);
  const [form,setForm]=useState<F>(INIT);
  const [errs,setErrs]=useState<Partial<Record<keyof F,string>>>({});
  const [loading,setLoading]=useState(false);
  const [transitioning,setTransitioning]=useState(false);
  const [kvkk,setKvkk]=useState(false);
  const [kvkkErr,setKvkkErr]=useState("");
  const [result,setResult]=useState<ProgramResult|null>(null);
  const [apiErr,setApiErr]=useState("");

  const fset=<K extends keyof F>(k:K,v:F[K])=>setForm(f=>({...f,[k]:v}));

  function validate(){
    const e:Partial<Record<keyof F,string>>={};
    if(step===0){
      if(!form.full_name.trim()) e.full_name="Ad soyad zorunludur";
      if(!form.email.trim()) e.email="E-posta zorunludur";
      else if(!form.email.includes("@")||!form.email.includes(".")) e.email="Geçerli bir e-posta adresi girin";
    }
    if(step===1){
      const age=Number(form.age);
      const w=Number(form.weight);
      const h=Number(form.height);
      if(!form.age||isNaN(age)||age<15||age>80) e.age="15 ile 80 arasında bir yaş girin";
      if(!form.weight||isNaN(w)||w<40||w>200)   e.weight="40 ile 200 kg arasında bir değer girin";
      if(!form.height||isNaN(h)||h<140||h>220)  e.height="140 ile 220 cm arasında bir değer girin";
    }
    setErrs(e);
    if(Object.keys(e).length>0){
      // Scroll to top of form so errors are visible
      topRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
    }
    return Object.keys(e).length===0;
  }

  const next=async()=>{
    if(!validate()) return;

    // Steps 0 and 1 — simple advance with brief visual feedback
    if(step<2){
      setTransitioning(true);
      setTimeout(()=>{
        setStep(s=>s+1);
        setTransitioning(false);
        topRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
      },120);
      return;
    }

    // Step 2 — check KVKK then call API
    if(!kvkk){
      setKvkkErr("Devam etmek için KVKK metnini onaylamanız zorunludur");
      topRef.current?.scrollIntoView({behavior:"smooth",block:"end"});
      return;
    }
    setKvkkErr("");
    setLoading(true);
    setApiErr("");
    try{
      const profile=buildProfile(form);
      const r=await fetch("/api/programs/generate",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({profile,email:form.email}),
        signal:AbortSignal.timeout(55000),
      });
      const text=await r.text();
      if(!text) throw new Error("Sunucu yanıt vermedi. Lütfen tekrar deneyin.");
      let d:Record<string,unknown>;
      try{ d=JSON.parse(text); }
      catch{ throw new Error("Sunucu geçersiz yanıt döndürdü. Lütfen tekrar deneyin."); }
      if(!r.ok) throw new Error((d.error as string)||`Sunucu hatası (${r.status})`);
      setResult({
        programId:   d.programId,
        title:       d.title,
        summary:     d.summary,
        bmi:         d.bmi,
        bmiCategory: d.bmiCategory,
        message:     d.message,
      });
      setStep(3);
      topRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
    }catch(e){
      const msg=e instanceof Error?e.message:"Bir hata oluştu. Lütfen tekrar deneyin.";
      setApiErr(msg);
      topRef.current?.scrollIntoView({behavior:"smooth",block:"end"});
    }finally{
      setLoading(false);
    }
  };

  const isBusy=loading||transitioning;

  const CARD:React.CSSProperties={background:"#1A1A1A",borderRadius:20,border:"1px solid #2A2A2A",padding:"clamp(1.25rem,4vw,2rem)"};
  const NBTN=(active:boolean):React.CSSProperties=>({
    flex:1,padding:"0.875rem",borderRadius:12,fontWeight:700,fontSize:"0.9375rem",
    cursor:isBusy?"not-allowed":"pointer",opacity:isBusy?0.7:1,
    background:active?"#6A0D25":"#1A1A1A",
    color:active?"#fff":"rgba(255,255,255,0.5)",
    border:active?"1px solid rgba(212,175,55,0.3)":"1px solid #2A2A2A",
    display:"flex",alignItems:"center",justifyContent:"center",gap:"0.375rem",
    transition:"opacity 0.15s",
  });

  const wa=`https://wa.me/903742701455?text=${encodeURIComponent(`Merhaba, AI programım hazır. Adım: ${form.full_name}. Programı görmek istiyorum.`)}`;

  return(
    <>
      <Navbar/>
      <main style={{minHeight:"100vh",background:"#0B0B0B"}}>
        {/* Header */}
        <div style={{paddingTop:96,paddingBottom:"2.5rem",borderBottom:"1px solid rgba(106,13,37,0.12)"}}>
          <div className="page-container" style={{textAlign:"center"}}>
            <p style={{color:"#D4AF37",fontSize:"0.6875rem",fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"0.75rem"}}>Kişisel Program</p>
            <h1 style={{fontSize:"clamp(1.75rem,5vw,2.75rem)",fontWeight:800,color:"#fff",fontFamily:"var(--font-heading)",marginBottom:"0.75rem"}}>Beslenme &amp; Fitness Programı</h1>
            <p style={{color:"rgba(255,255,255,0.45)",fontSize:"0.9375rem",maxWidth:"34rem",marginInline:"auto"}}>Yapay zeka ile tamamen kişiye özel — ücretsiz</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.75rem",maxWidth:"36rem",marginInline:"auto",marginTop:"1.5rem"}}>
              {[["1","Formu Doldur","Kişisel bilgi ve hedeflerini gir"],["2","AI Analiz Eder","885 egzersizden kişisel program"],["3","Programı Al","Admin onayı sonrası WhatsApp ile"]].map(([n,t,d])=>(
                <div key={n} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"0.875rem 0.625rem",textAlign:"center"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(106,13,37,0.5)",border:"1px solid rgba(212,175,55,0.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 0.5rem",fontSize:"0.75rem",fontWeight:800,color:"#D4AF37"}}>{n}</div>
                  <p style={{color:"#fff",fontWeight:700,fontSize:"0.8125rem",marginBottom:"0.25rem"}}>{t}</p>
                  <p style={{color:"rgba(255,255,255,0.4)",fontSize:"0.7rem",lineHeight:1.5}}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="page-container" style={{paddingTop:"2.5rem",paddingBottom:"5rem"}}>
          <div style={{maxWidth:600,marginInline:"auto"}}>
            {/* Scroll anchor */}
            <div ref={topRef} style={{scrollMarginTop:80}}/>

            {/* Step indicator */}
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"1.75rem"}}>
              {["Kişisel","Ölçüler","Hedef","Program"].map((label,i)=>(
                <div key={label} style={{display:"flex",alignItems:"center",flex:i<3?1:"none"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",fontWeight:700,background:i<step?"#4ade80":i===step?"#6A0D25":"#1A1A1A",border:i===step?"1px solid rgba(212,175,55,0.5)":"1px solid transparent",color:i<step?"#000":i===step?"#D4AF37":"rgba(255,255,255,0.3)",transition:"all 0.2s"}}>
                    {i<step?"✓":i+1}
                  </div>
                  {i<3&&<div style={{flex:1,height:2,margin:"0 6px",background:i<step?"rgba(74,222,128,0.4)":"#2A2A2A",transition:"background 0.3s"}}/>}
                </div>
              ))}
            </div>

            {/* ── Step 0: Kişisel Bilgiler ── */}
            {step===0&&(
              <div style={CARD}>
                <h2 style={{color:"#fff",fontWeight:800,fontSize:"1.125rem",fontFamily:"var(--font-heading)",marginBottom:"1.5rem"}}>Kişisel Bilgiler</h2>
                <div style={{display:"flex",flexDirection:"column",gap:"1.125rem"}}>
                  <div>
                    <label style={LBL}>Ad Soyad *</label>
                    <input value={form.full_name} onChange={e=>fset("full_name",e.target.value)} placeholder="Adınız Soyadınız" style={{...INP,border:errs.full_name?"1px solid #f87171":INP.border}}/>
                    {errs.full_name&&<p style={ERR}><AlertCircle size={12}/>{errs.full_name}</p>}
                  </div>
                  <div>
                    <label style={LBL}>E-posta *</label>
                    <input value={form.email} onChange={e=>fset("email",e.target.value)} type="email" placeholder="ornek@mail.com" style={{...INP,border:errs.email?"1px solid #f87171":INP.border}}/>
                    {errs.email&&<p style={ERR}><AlertCircle size={12}/>{errs.email}</p>}
                  </div>
                  <div>
                    <label style={LBL}>Cinsiyet</label>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.625rem"}}>
                      <Chip active={form.gender==="male"}   onClick={()=>fset("gender","male")}>Erkek</Chip>
                      <Chip active={form.gender==="female"} onClick={()=>fset("gender","female")}>Kadın</Chip>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 1: Fiziksel Ölçüler ── */}
            {step===1&&(
              <div style={CARD}>
                <h2 style={{color:"#fff",fontWeight:800,fontSize:"1.125rem",fontFamily:"var(--font-heading)",marginBottom:"1.5rem"}}>Fiziksel Ölçüler</h2>
                <div style={{display:"flex",flexDirection:"column",gap:"1.125rem"}}>
                  {([{k:"age",l:"Yaş",u:"yaş",p:"25",min:15,max:80},{k:"weight",l:"Kilo",u:"kg",p:"75",min:40,max:200},{k:"height",l:"Boy",u:"cm",p:"175",min:140,max:220}] as const).map(f=>(
                    <div key={f.k}>
                      <label style={LBL}>{f.l} *</label>
                      <div style={{position:"relative"}}>
                        <input type="number" value={form[f.k]} placeholder={f.p} min={f.min} max={f.max}
                          onChange={e=>fset(f.k,e.target.value as never)}
                          style={{...INP,paddingRight:"3.5rem",border:errs[f.k]?"1px solid #f87171":INP.border}}/>
                        <span style={{position:"absolute",right:"1rem",top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,0.3)",fontSize:"0.875rem",pointerEvents:"none"}}>{f.u}</span>
                      </div>
                      {errs[f.k]&&<p style={ERR}><AlertCircle size={12}/>{errs[f.k]}</p>}
                    </div>
                  ))}
                  <div>
                    <label style={LBL}>Sakatlık / Sağlık Notu</label>
                    <textarea value={form.injury_notes} onChange={e=>fset("injury_notes",e.target.value)} rows={2} placeholder="Bel fıtığı, diz sorunu vb. (yoksa boş bırakın)" style={{...INP,resize:"vertical"}}/>
                  </div>
                  <div>
                    <label style={LBL}>Ek Not</label>
                    <textarea value={form.extra_notes} onChange={e=>fset("extra_notes",e.target.value)} rows={2} placeholder="Eğitmene özel not (opsiyonel)" style={{...INP,resize:"vertical"}}/>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Hedef & Tercihler ── */}
            {step===2&&(
              <div style={CARD}>
                <h2 style={{color:"#fff",fontWeight:800,fontSize:"1.125rem",fontFamily:"var(--font-heading)",marginBottom:"1.5rem"}}>Hedef ve Tercihler</h2>
                <div style={{display:"flex",flexDirection:"column",gap:"1.5rem"}}>
                  <div>
                    <label style={LBL}>Hedefiniz</label>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>
                      {GOALS.map(o=><Chip key={o.v} active={form.goal===o.v} onClick={()=>fset("goal",o.v as Goal)}>{o.l}</Chip>)}
                    </div>
                  </div>
                  <div>
                    <label style={LBL}>Aktivite Seviyesi</label>
                    <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                      {ACTS.map(o=>(
                        <Chip key={o.v} active={form.activity_level===o.v} onClick={()=>fset("activity_level",o.v as Activity)}>
                          <span style={{fontWeight:600}}>{o.l}</span>
                          <span style={{color:"rgba(255,255,255,0.35)",fontSize:"0.75rem",marginLeft:8}}>{o.s}</span>
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={LBL}>Antrenman Deneyimi</label>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.5rem"}}>
                      {LVLS.map(o=><Chip key={o.v} active={form.level===o.v} onClick={()=>fset("level",o.v as Level)}>{o.l}</Chip>)}
                    </div>
                  </div>
                  <div>
                    <label style={LBL}>Haftalık Antrenman Günü</label>
                    <div style={{display:"flex",gap:"0.4rem"}}>
                      {[1,2,3,4,5,6,7].map(d=>(
                        <button key={d} type="button" onClick={()=>fset("weekly_days",d)}
                          style={{flex:1,padding:"0.625rem 0",borderRadius:10,cursor:"pointer",border:`1px solid ${form.weekly_days===d?"rgba(212,175,55,0.5)":"#2A2A2A"}`,background:form.weekly_days===d?"rgba(106,13,37,0.3)":"#111",color:form.weekly_days===d?"#D4AF37":"rgba(255,255,255,0.4)",fontWeight:700,fontSize:"0.875rem",transition:"all 0.15s"}}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={LBL}>Ekipman Durumu</label>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>
                      {EQUIPS.map(o=><Chip key={o.v} active={form.equipment===o.v} onClick={()=>fset("equipment",o.v as Equip)}>{o.l}</Chip>)}
                    </div>
                  </div>
                  <div>
                    <label style={LBL}>Beslenme Tercihi</label>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>
                      {DIETS.map(o=><Chip key={o.v} active={form.diet_preference===o.v} onClick={()=>fset("diet_preference",o.v as Diet)}>{o.l}</Chip>)}
                    </div>
                  </div>

                  {/* KVKK */}
                  <div style={{background:kvkkErr?"rgba(248,113,113,0.06)":"rgba(212,175,55,0.06)",border:`1px solid ${kvkkErr?"rgba(248,113,113,0.4)":"rgba(212,175,55,0.15)"}`,borderRadius:10,padding:"0.875rem",transition:"border-color 0.2s"}}>
                    <label style={{display:"flex",alignItems:"flex-start",gap:"0.625rem",cursor:"pointer"}}>
                      <input type="checkbox" id="kvkk" checked={kvkk} onChange={e=>{setKvkk(e.target.checked);if(e.target.checked)setKvkkErr("");}}
                        style={{marginTop:3,accentColor:"#6A0D25",width:16,height:16,flexShrink:0,cursor:"pointer"}}/>
                      <span style={{color:"rgba(255,255,255,0.6)",fontSize:"0.8rem",lineHeight:1.6}}>
                        Kişisel verilerimin (ad, e-posta, sağlık bilgileri) Machine Gym tarafından program oluşturma amacıyla işlenmesini onaylıyorum.{" "}
                        <a href="/kvkk" target="_blank" style={{color:"#D4AF37",textDecoration:"underline"}}>KVKK Metni</a>
                      </span>
                    </label>
                    {kvkkErr&&(
                      <p style={{color:"#f87171",fontSize:"0.8125rem",marginTop:8,display:"flex",alignItems:"center",gap:6,fontWeight:600}}>
                        <AlertCircle size={14}/>{kvkkErr}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Sonuç ── */}
            {step===3&&result&&(
              <div style={CARD}>
                <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1.5rem"}}>
                  <CheckCircle style={{width:28,height:28,color:"#4ade80",flexShrink:0}}/>
                  <div>
                    <h2 style={{color:"#fff",fontWeight:800,fontSize:"1.125rem",fontFamily:"var(--font-heading)",marginBottom:"0.2rem"}}>{result.title}</h2>
                    <p style={{color:"rgba(255,255,255,0.45)",fontSize:"0.8125rem"}}>4 haftalık kişisel program hazır</p>
                  </div>
                </div>
                <p style={{color:"rgba(255,255,255,0.6)",fontSize:"0.875rem",lineHeight:1.6,marginBottom:"1.5rem"}}>{result.summary}</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem",marginBottom:"1.5rem"}}>
                  <div style={{background:"#111",borderRadius:12,padding:"0.875rem",border:"1px solid #2A2A2A"}}>
                    <p style={{color:"rgba(255,255,255,0.4)",fontSize:"0.6875rem",marginBottom:"0.375rem"}}>BMI</p>
                    <p style={{color:"#D4AF37",fontWeight:800,fontSize:"1.0625rem",fontFamily:"var(--font-heading)"}}>{result.bmi}</p>
                    <p style={{color:"rgba(255,255,255,0.35)",fontSize:"0.6875rem"}}>{result.bmiCategory}</p>
                  </div>
                  <div style={{background:"#111",borderRadius:12,padding:"0.875rem",border:"1px solid #2A2A2A"}}>
                    <p style={{color:"rgba(255,255,255,0.4)",fontSize:"0.6875rem",marginBottom:"0.375rem"}}>Durum</p>
                    <p style={{color:"#4ade80",fontWeight:700,fontSize:"0.875rem"}}>Admin Onayı Bekleniyor</p>
                    <p style={{color:"rgba(255,255,255,0.35)",fontSize:"0.6875rem"}}>Kısa sürede iletilecek</p>
                  </div>
                </div>
                <div style={{display:"flex",gap:10,padding:"1rem",background:"rgba(74,222,128,0.06)",borderRadius:12,border:"1px solid rgba(74,222,128,0.15)",marginBottom:"1rem",alignItems:"flex-start"}}>
                  <Dumbbell style={{width:18,height:18,color:"#4ade80",flexShrink:0,marginTop:2}}/>
                  <p style={{color:"rgba(255,255,255,0.6)",fontSize:"0.8125rem",lineHeight:1.6}}>
                    4 haftalık antrenman programın ve kişisel beslenme planın oluşturuldu. Admin onayından sonra e-posta veya WhatsApp üzerinden sana iletilecek.
                  </p>
                </div>
                <a href={wa} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem",width:"100%",padding:"0.875rem",background:"#6A0D25",color:"#fff",fontWeight:700,fontSize:"0.9375rem",borderRadius:12,border:"1px solid rgba(212,175,55,0.3)",textDecoration:"none",boxSizing:"border-box"}}>
                  <MessageCircle style={{width:18,height:18}}/>WhatsApp ile Takip Et
                </a>
              </div>
            )}

            {/* Loading indicator */}
            {loading&&(
              <div style={{marginTop:"1rem",padding:"1rem",background:"rgba(212,175,55,0.06)",border:"1px solid rgba(212,175,55,0.15)",borderRadius:12,display:"flex",alignItems:"center",gap:"0.75rem"}}>
                <Loader2 style={{width:18,height:18,color:"#D4AF37",animation:"spin 0.8s linear infinite",flexShrink:0}}/>
                <div>
                  <p style={{color:"#D4AF37",fontWeight:700,fontSize:"0.875rem"}}>AI programın oluşturuluyor...</p>
                  <p style={{color:"rgba(255,255,255,0.35)",fontSize:"0.75rem",marginTop:2}}>885 egzersizden kişiselleştiriliyor — 30–60 saniye sürebilir</p>
                </div>
              </div>
            )}

            {/* API Error */}
            {apiErr&&(
              <div style={{marginTop:"1rem",padding:"0.875rem 1rem",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",borderRadius:10,display:"flex",alignItems:"flex-start",gap:"0.5rem"}}>
                <AlertCircle style={{width:16,height:16,color:"#f87171",flexShrink:0,marginTop:1}}/>
                <div>
                  <p style={{color:"#f87171",fontSize:"0.875rem",fontWeight:600,marginBottom:2}}>Program oluşturulamadı</p>
                  <p style={{color:"rgba(248,113,113,0.7)",fontSize:"0.8125rem"}}>{apiErr}</p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            {step<3&&(
              <div style={{display:"flex",gap:"0.75rem",marginTop:"1.25rem"}}>
                {step>0&&(
                  <button onClick={()=>{setStep(s=>s-1);topRef.current?.scrollIntoView({behavior:"smooth",block:"start"});}} disabled={isBusy}
                    style={NBTN(false)}>
                    <ChevronLeft style={{width:16,height:16}}/>Geri
                  </button>
                )}
                <button onClick={next} disabled={isBusy} style={NBTN(true)}>
                  {(loading||transitioning)
                    ?<Loader2 style={{width:16,height:16,animation:"spin 0.8s linear infinite"}}/>
                    :null}
                  {loading?"Oluşturuluyor...":transitioning?"...":step===2?"Programı Oluştur":"Devam Et"}
                  {!isBusy&&step<2&&<ChevronRight style={{width:16,height:16}}/>}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <WhatsAppButton/>
      <Footer/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
