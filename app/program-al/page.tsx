"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Loader2, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";

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
interface Prog { bmr:number; tdee:number; targetCalories:number; nutrition:{protein:number;carbs:number;fat:number}; }

const INP:React.CSSProperties={width:"100%",padding:"0.875rem 1rem",background:"#111",border:"1px solid #2A2A2A",borderRadius:12,color:"#fff",fontSize:"0.9375rem",outline:"none",boxSizing:"border-box"};
const LBL:React.CSSProperties={display:"block",color:"rgba(255,255,255,0.6)",fontSize:"0.8125rem",fontWeight:500,marginBottom:"0.4rem"};

function Chip({active,onClick,children}:{active:boolean;onClick:()=>void;children:React.ReactNode}){
  return <button type="button" onClick={onClick} style={{padding:"0.625rem 0.875rem",borderRadius:10,cursor:"pointer",border:`1px solid ${active?"rgba(212,175,55,0.5)":"#2A2A2A"}`,background:active?"rgba(106,13,37,0.3)":"#111",color:active?"#D4AF37":"rgba(255,255,255,0.55)",fontWeight:active?700:500,fontSize:"0.875rem",textAlign:"left"}}>{children}</button>;
}

const GOALS=[{v:"weight_loss",l:"Kilo Verme",e:"\u{1F525}"},{v:"muscle_gain",l:"Kas Kazanma",e:"\u{1F4AA}"},{v:"toning",l:"Sikalasma",e:"\u26A1"},{v:"maintenance",l:"Form Koruma",e:"\u2696\uFE0F"},{v:"boxing",l:"Boks Perf.",e:"\u{1F94A}"},{v:"health",l:"Genel Saglik",e:"\u2764\uFE0F"}];
const ACTS=[{v:"sedantary",l:"Sedanter",s:"Masa basi"},{v:"light",l:"Hafif",s:"1-2 gun/hafta"},{v:"moderate",l:"Orta",s:"3-4 gun/hafta"},{v:"active",l:"Aktif",s:"5-6 gun/hafta"},{v:"extra_active",l:"Ekstra Aktif",s:"Gunde 2x"}];
const LVLS=[{v:"beginner",l:"Baslangic"},{v:"intermediate",l:"Orta"},{v:"advanced",l:"Ileri"}];
const EQUIPS=[{v:"gym",l:"Spor Salonu"},{v:"home_basic",l:"Evde Temel"},{v:"home_none",l:"Ekipmansiz"},{v:"outdoor",l:"Disarida"}];
const DIETS=[{v:"standard",l:"Standart"},{v:"high_protein",l:"Yuksek Protein"},{v:"low_carb",l:"Az Karb"},{v:"vegetarian",l:"Vejetaryen"},{v:"vegan",l:"Vegan"}];

const INIT:F={full_name:"",email:"",gender:"male",age:"",weight:"",height:"",goal:"weight_loss",activity_level:"moderate",level:"beginner",weekly_days:3,equipment:"gym",diet_preference:"standard",injury_notes:"",extra_notes:""};

export default function ProgramAlPage(){
  const [step,setStep]=useState(0);
  const [form,setForm]=useState<F>(INIT);
  const [errs,setErrs]=useState<Partial<Record<keyof F,string>>>({});
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState<Prog|null>(null);
  const [apiErr,setApiErr]=useState("");

  const set=<K extends keyof F>(k:K,v:F[K])=>setForm(f=>({...f,[k]:v}));

  function validate(){
    const e:Partial<Record<keyof F,string>>={};
    if(step===0){if(!form.full_name.trim())e.full_name="Ad soyad gerekli";if(!form.email.includes("@"))e.email="Gecerli e-posta girin";}
    if(step===1){
      if(!form.age||Number(form.age)<15||Number(form.age)>80)e.age="15-80 arasi giriniz";
      if(!form.weight||Number(form.weight)<40||Number(form.weight)>200)e.weight="40-200 kg arasi giriniz";
      if(!form.height||Number(form.height)<140||Number(form.height)>220)e.height="140-220 cm arasi giriniz";
    }
    setErrs(e);return Object.keys(e).length===0;
  }

  const next=async()=>{
    if(!validate())return;
    if(step<2){setStep(s=>s+1);return;}
    setLoading(true);setApiErr("");
    try{
      const r=await fetch("/api/programs/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,age:Number(form.age),weight:Number(form.weight),height:Number(form.height)})});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||"Program olusturulamadi");
      setResult(d.program);setStep(3);
    }catch(e){setApiErr(e instanceof Error?e.message:"Bir hata olustu");}
    setLoading(false);
  };

  const buy=async()=>{
    setLoading(true);
    try{
      const r=await fetch("/api/payment/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"program",amount:199,email:form.email,full_name:form.full_name})});
      const d=await r.json();
      if(d.iframeToken)window.location.href=`https://www.paytr.com/odeme/guvenli/${d.iframeToken}`;
    }catch{}
    setLoading(false);
  };

  const CARD:React.CSSProperties={background:"#1A1A1A",borderRadius:20,border:"1px solid #2A2A2A",padding:"clamp(1.25rem,4vw,2rem)"};
  const NBTN=(a:boolean):React.CSSProperties=>({flex:1,padding:"0.875rem",borderRadius:12,fontWeight:700,fontSize:"0.9375rem",cursor:loading?"not-allowed":"pointer",opacity:loading?0.6:1,background:a?"#6A0D25":"#111",color:a?"#fff":"rgba(255,255,255,0.5)",border:a?"1px solid rgba(212,175,55,0.3)":"1px solid #2A2A2A",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.375rem"});

  return(
    <>
      <Navbar/>
      <main style={{minHeight:"100vh",background:"#0B0B0B"}}>
        <div style={{paddingTop:96,paddingBottom:"2.5rem",borderBottom:"1px solid rgba(106,13,37,0.12)"}}>
          <div className="page-container" style={{textAlign:"center"}}>
            <p style={{color:"#D4AF37",fontSize:"0.6875rem",fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"0.75rem"}}>Kisisel Program</p>
            <h1 style={{fontSize:"clamp(1.75rem,5vw,2.75rem)",fontWeight:800,color:"#fff",fontFamily:"var(--font-heading)",marginBottom:"0.75rem"}}>Beslenme &amp; Fitness Programi</h1>
            <p style={{color:"rgba(255,255,255,0.45)",fontSize:"0.9375rem",maxWidth:"34rem",marginInline:"auto"}}>8 haftalik antrenman + kisisel beslenme plani - sadece 199 TL</p>
          </div>
        </div>

        <div className="page-container" style={{paddingTop:"2.5rem",paddingBottom:"5rem"}}>
          <div style={{maxWidth:600,marginInline:"auto"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"1.75rem"}}>
              {["Kisisel","Olculer","Hedef","Program"].map((s,i)=>(
                <div key={s} style={{display:"flex",alignItems:"center",flex:i<3?1:"none"}}>
                  <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",fontWeight:700,background:i<step?"#4ade80":i===step?"#6A0D25":"#1A1A1A",border:i===step?"1px solid rgba(212,175,55,0.5)":"1px solid transparent",color:i<step?"#000":i===step?"#D4AF37":"rgba(255,255,255,0.3)"}}>{i<step?"v":i+1}</div>
                  {i<3&&<div style={{flex:1,height:2,margin:"0 6px",background:i<step?"rgba(74,222,128,0.4)":"#2A2A2A"}}/>}
                </div>
              ))}
            </div>

            {step===0&&(
              <div style={CARD}>
                <h2 style={{color:"#fff",fontWeight:800,fontSize:"1.125rem",fontFamily:"var(--font-heading)",marginBottom:"1.5rem"}}>Kisisel Bilgiler</h2>
                <div style={{display:"flex",flexDirection:"column",gap:"1.125rem"}}>
                  <div><label style={LBL}>Ad Soyad *</label><input value={form.full_name} onChange={e=>set("full_name",e.target.value)} placeholder="Adin Soyadin" style={INP}/>{errs.full_name&&<p style={{color:"#f87171",fontSize:"0.75rem",marginTop:4}}>{errs.full_name}</p>}</div>
                  <div><label style={LBL}>E-posta *</label><input value={form.email} onChange={e=>set("email",e.target.value)} type="email" placeholder="ornek@mail.com" style={INP}/>{errs.email&&<p style={{color:"#f87171",fontSize:"0.75rem",marginTop:4}}>{errs.email}</p>}</div>
                  <div><label style={LBL}>Cinsiyet</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.625rem"}}><Chip active={form.gender==="male"} onClick={()=>set("gender","male")}>Erkek</Chip><Chip active={form.gender==="female"} onClick={()=>set("gender","female")}>Kadin</Chip></div></div>
                </div>
              </div>
            )}

            {step===1&&(
              <div style={CARD}>
                <h2 style={{color:"#fff",fontWeight:800,fontSize:"1.125rem",fontFamily:"var(--font-heading)",marginBottom:"1.5rem"}}>Fiziksel Olculer</h2>
                <div style={{display:"flex",flexDirection:"column",gap:"1.125rem"}}>
                  {([{k:"age",l:"Yas",u:"yas",p:"25"},{k:"weight",l:"Kilo",u:"kg",p:"75"},{k:"height",l:"Boy",u:"cm",p:"175"}] as const).map(f=>(
                    <div key={f.k}>
                      <label style={LBL}>{f.l} *</label>
                      <div style={{position:"relative"}}><input type="number" value={form[f.k]} placeholder={f.p} onChange={e=>set(f.k,e.target.value as never)} style={{...INP,paddingRight:"3.5rem"}}/><span style={{position:"absolute",right:"1rem",top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,0.3)",fontSize:"0.875rem",pointerEvents:"none"}}>{f.u}</span></div>
                      {errs[f.k]&&<p style={{color:"#f87171",fontSize:"0.75rem",marginTop:4}}>{errs[f.k]}</p>}
                    </div>
                  ))}
                  <div><label style={LBL}>Sakatlik / Saglik Notu</label><textarea value={form.injury_notes} onChange={e=>set("injury_notes",e.target.value)} rows={2} placeholder="Bel fitigi, diz sorunu vb." style={{...INP,resize:"vertical"}}/></div>
                  <div><label style={LBL}>Ek Not</label><textarea value={form.extra_notes} onChange={e=>set("extra_notes",e.target.value)} rows={2} placeholder="Egitmene ozel not..." style={{...INP,resize:"vertical"}}/></div>
                </div>
              </div>
            )}

            {step===2&&(
              <div style={CARD}>
                <h2 style={{color:"#fff",fontWeight:800,fontSize:"1.125rem",fontFamily:"var(--font-heading)",marginBottom:"1.5rem"}}>Hedef ve Tercihler</h2>
                <div style={{display:"flex",flexDirection:"column",gap:"1.5rem"}}>
                  <div><label style={LBL}>Hedefiniz</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>{GOALS.map(o=><Chip key={o.v} active={form.goal===o.v} onClick={()=>set("goal",o.v as Goal)}>{o.l}</Chip>)}</div></div>
                  <div><label style={LBL}>Aktivite Seviyesi</label><div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>{ACTS.map(o=><Chip key={o.v} active={form.activity_level===o.v} onClick={()=>set("activity_level",o.v as Activity)}><span style={{fontWeight:600}}>{o.l}</span><span style={{color:"rgba(255,255,255,0.35)",fontSize:"0.75rem",marginLeft:8}}>{o.s}</span></Chip>)}</div></div>
                  <div><label style={LBL}>Antrenman Deneyimi</label><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.5rem"}}>{LVLS.map(o=><Chip key={o.v} active={form.level===o.v} onClick={()=>set("level",o.v as Level)}>{o.l}</Chip>)}</div></div>
                  <div><label style={LBL}>Haftalik Antrenman Gunu</label><div style={{display:"flex",gap:"0.4rem"}}>{[1,2,3,4,5,6,7].map(d=><button key={d} type="button" onClick={()=>set("weekly_days",d)} style={{flex:1,padding:"0.625rem 0",borderRadius:10,cursor:"pointer",border:`1px solid ${form.weekly_days===d?"rgba(212,175,55,0.5)":"#2A2A2A"}`,background:form.weekly_days===d?"rgba(106,13,37,0.3)":"#111",color:form.weekly_days===d?"#D4AF37":"rgba(255,255,255,0.4)",fontWeight:700,fontSize:"0.875rem"}}>{d}</button>)}</div></div>
                  <div><label style={LBL}>Ekipman</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>{EQUIPS.map(o=><Chip key={o.v} active={form.equipment===o.v} onClick={()=>set("equipment",o.v as Equip)}>{o.l}</Chip>)}</div></div>
                  <div><label style={LBL}>Beslenme Tercihi</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>{DIETS.map(o=><Chip key={o.v} active={form.diet_preference===o.v} onClick={()=>set("diet_preference",o.v as Diet)}>{o.l}</Chip>)}</div></div>
                </div>
              </div>
            )}

            {step===3&&result&&(
              <div style={CARD}>
                <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1.5rem"}}><CheckCircle style={{width:24,height:24,color:"#4ade80"}}/><h2 style={{color:"#fff",fontWeight:800,fontSize:"1.125rem",fontFamily:"var(--font-heading)"}}>Programin Hazir!</h2></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem",marginBottom:"1.5rem"}}>
                  {[{l:"BMR",v:`${result.bmr} kcal`},{l:"TDEE",v:`${result.tdee} kcal`},{l:"Hedef Kalori",v:`${result.targetCalories} kcal`},{l:"Gunluk Protein",v:`${result.nutrition.protein}g`}].map(item=>(
                    <div key={item.l} style={{background:"#111",borderRadius:12,padding:"0.875rem",border:"1px solid #2A2A2A"}}><p style={{color:"rgba(255,255,255,0.4)",fontSize:"0.6875rem",marginBottom:"0.375rem"}}>{item.l}</p><p style={{color:"#D4AF37",fontWeight:800,fontSize:"1.0625rem",fontFamily:"var(--font-heading)"}}>{item.v}</p></div>
                  ))}
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1.125rem",background:"#111",borderRadius:14,border:"1px solid rgba(212,175,55,0.2)"}}>
                  <div><p style={{color:"#fff",fontWeight:800,fontSize:"1.625rem",fontFamily:"var(--font-heading)"}}>199 TL</p><p style={{color:"rgba(255,255,255,0.35)",fontSize:"0.75rem"}}>Tek seferlik - Aninda teslim</p></div>
                  <button onClick={buy} disabled={loading} style={{padding:"0.875rem 1.5rem",background:"#D4AF37",color:"#000",fontWeight:800,fontSize:"0.9375rem",borderRadius:12,border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"0.5rem"}}>{loading&&<Loader2 style={{width:16,height:16,animation:"spin 0.8s linear infinite"}}/>}Satin Al</button>
                </div>
              </div>
            )}

            {apiErr&&<div style={{marginTop:"1rem",padding:"0.75rem 1rem",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",borderRadius:10,color:"#f87171",fontSize:"0.875rem"}}>{apiErr}</div>}

            {step<3&&(
              <div style={{display:"flex",gap:"0.75rem",marginTop:"1.25rem"}}>
                {step>0&&<button onClick={()=>setStep(s=>s-1)} style={NBTN(false)}><ChevronLeft style={{width:16,height:16}}/>Geri</button>}
                <button onClick={next} disabled={loading} style={NBTN(true)}>
                  {loading&&<Loader2 style={{width:16,height:16,animation:"spin 0.8s linear infinite"}}/>}
                  {step===2?"Programi Olustur":"Devam Et"}{step<2&&<ChevronRight style={{width:16,height:16}}/>}
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
