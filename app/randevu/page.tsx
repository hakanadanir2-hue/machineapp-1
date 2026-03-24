"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { tr } from "date-fns/locale";
import { format } from "date-fns";
import { Loader2, CheckCircle, Calendar, Clock, User, MessageCircle, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const TIME_SLOTS = ["09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];

const SERVICES = [
  { id: "deneme",    label: "Ücretsiz Deneme Antrenmanı" },
  { id: "fitness",   label: "Fitness Üyelik Danışma"     },
  { id: "pt",        label: "Personal Trainer"           },
  { id: "boks",      label: "Boks Özel Ders"             },
  { id: "kickboks",  label: "Kickboks"                   },
  { id: "muay_thai", label: "Muay Thai"                  },
];

const WA = "903742701455";

interface Form { full_name:string; email:string; phone:string; service:string; notes:string; }
const INIT: Form = { full_name:"", email:"", phone:"", service:"", notes:"" };

const INP: React.CSSProperties = { width:"100%", padding:"0.75rem 1rem", background:"#111", border:"1px solid #2A2A2A", borderRadius:10, color:"#fff", fontSize:"0.875rem", outline:"none", boxSizing:"border-box" };
const LBL: React.CSSProperties = { display:"block", fontSize:"0.8125rem", color:"rgba(255,255,255,0.6)", marginBottom:"0.375rem" };

export default function RandevuPage() {
  const [form, setForm]         = useState<Form>(INIT);
  const [selected, setSelected] = useState<Date | undefined>();
  const [selectedTime, setTime] = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [errs, setErrs]         = useState<Partial<Form & { date: string; time: string }>>({});
  const [error, setError]       = useState("");

  const set = (k: keyof Form, v: string) => setForm(f => ({ ...f, [k]: v }));

  function validate() {
    const e: Partial<Form & { date: string; time: string }> = {};
    if (!form.full_name.trim())                             e.full_name = "Ad soyad gerekli";
    if (!form.email.includes("@"))                          e.email    = "Geçerli e-posta girin";
    if (form.phone.replace(/\D/g,"").length < 10)           e.phone    = "Geçerli telefon girin";
    if (!form.service)                                      e.service  = "Hizmet seçin";
    if (!selected)                                          e.date     = "Tarih seçin";
    if (!selectedTime)                                      e.time     = "Saat seçin";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setError("");

    const serviceLabel = SERVICES.find(s => s.id === form.service)?.label ?? form.service;
    const dateStr = format(selected!, "yyyy-MM-dd");

    try {
      const res = await fetch("/api/randevu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name:    form.full_name,
          email:        form.email,
          phone:        form.phone,
          service:      form.service,
          serviceLabel,
          date:         dateStr,
          time:         selectedTime,
          notes:        form.notes || undefined,
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Randevu alınamadı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const selectedService = SERVICES.find(s => s.id === form.service);

  const waMsg = success && selected
    ? encodeURIComponent(
        `Merhaba, ${format(selected, "d MMMM yyyy", {locale:tr})} tarihinde ${selectedTime} saatinde randevu aldım.\n` +
        `Hizmet: ${selectedService?.label ?? form.service}\n` +
        `Ad: ${form.full_name}\nTelefon: ${form.phone}`
      )
    : "";

  if (success) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight:"100vh", background:"#0B0B0B", display:"flex", alignItems:"center", justifyContent:"center", padding:"5rem 1rem" }}>
          <div style={{ textAlign:"center", maxWidth:520 }}>
            <div style={{ width:80, height:80, background:"rgba(74,222,128,0.15)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.5rem" }}>
              <CheckCircle style={{ width:40, height:40, color:"#4ade80" }} />
            </div>
            <h2 style={{ fontSize:"clamp(1.5rem,4vw,2rem)", fontWeight:800, color:"#fff", fontFamily:"var(--font-heading)", marginBottom:"0.75rem" }}>
              Randevunuz Alındı!
            </h2>
            <p style={{ color:"rgba(255,255,255,0.65)", lineHeight:1.7, marginBottom:"0.5rem", fontSize:"0.9375rem" }}>
              <strong style={{ color:"#D4AF37" }}>{selected ? format(selected,"d MMMM yyyy",{locale:tr}) : ""}</strong> tarihinde{" "}
              <strong style={{ color:"#D4AF37" }}>{selectedTime}</strong> saatinde sizi bekliyoruz.
            </p>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.875rem", marginBottom:"2rem" }}>
              Hizmet: <strong style={{ color:"rgba(255,255,255,0.7)" }}>{selectedService?.label}</strong>
            </p>
            <div style={{ padding:"1rem 1.25rem", background:"rgba(74,222,128,0.07)", border:"1px solid rgba(74,222,128,0.2)", borderRadius:12, marginBottom:"1.5rem", fontSize:"0.875rem", color:"rgba(255,255,255,0.6)", lineHeight:1.6 }}>
              Randevu talebiniz salona iletildi. Herhangi bir değişiklik için WhatsApp üzerinden ulaşabilirsiniz.
            </div>
            <a href={`https://wa.me/${WA}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0.625rem", padding:"0.875rem 1.5rem", background:"#25D366", color:"#fff", fontWeight:800, fontSize:"0.9375rem", borderRadius:14, textDecoration:"none" }}>
              <MessageCircle style={{ width:20, height:20 }} />
              WhatsApp ile Onayla
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight:"100vh", background:"#0B0B0B", paddingTop:96, paddingBottom:"4rem" }}>
        <div className="page-container">
          <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
            <p style={{ color:"#D4AF37", fontSize:"0.6875rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:"0.75rem" }}>Online Randevu</p>
            <h1 style={{ fontSize:"clamp(1.875rem,5vw,2.75rem)", fontWeight:800, color:"#fff", fontFamily:"var(--font-heading)", marginBottom:"0.75rem" }}>Randevu Al</h1>
            <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.9375rem" }}>Ücretsiz deneme antrenmanı dahil tüm hizmetler için randevu alın</p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:"1.5rem", maxWidth:900, marginInline:"auto" }} className="randevu-grid">
            <style>{`
              @media(min-width:768px){ .randevu-grid{ grid-template-columns: 1fr 1fr !important; } }
              .rdp-root { --rdp-accent-color: #6A0D25; --rdp-accent-background-color: #6A0D25; color: white; margin: 0; font-family: inherit; }
              .rdp-day_button { color: rgba(255,255,255,0.85); background: transparent; border: none; cursor: pointer; border-radius: 8px; width: 36px; height: 36px; }
              .rdp-selected .rdp-day_button, .rdp-selected .rdp-day_button:hover { background-color: #6A0D25 !important; color: #D4AF37 !important; border-radius: 8px; font-weight: 700; }
              .rdp-day_button:hover:not([disabled]) { background-color: #2A2A2A !important; border-radius: 8px; }
              .rdp-caption_label { color: #D4AF37; font-weight: 700; font-size: 0.9375rem; }
              .rdp-button_previous, .rdp-button_next { color: rgba(255,255,255,0.6); background: transparent; border: none; cursor: pointer; border-radius: 6px; padding: 4px; }
              .rdp-button_previous:hover, .rdp-button_next:hover { color: #D4AF37; background: #2A2A2A; }
              .rdp-weekday { color: rgba(255,255,255,0.4); font-size: 0.75rem; font-weight: 600; }
              .rdp-disabled .rdp-day_button { opacity: 0.25; cursor: not-allowed; }
              .rdp-outside .rdp-day_button { opacity: 0.3; }
              .rdp-today .rdp-day_button { border: 1px solid rgba(212,175,55,0.4); }
            `}</style>

            {/* Takvim + Saat */}
            <div style={{ background:"#141414", borderRadius:20, border:"1px solid rgba(255,255,255,0.07)", padding:"1.5rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"1rem" }}>
                <Calendar style={{ width:18, height:18, color:"#D4AF37" }} />
                <h3 style={{ color:"#fff", fontWeight:700, fontSize:"0.9375rem" }}>Tarih Seç</h3>
              </div>
              {errs.date && (
                <p style={{ color:"#f87171", fontSize:"0.75rem", display:"flex", alignItems:"center", gap:4, marginBottom:"0.5rem" }}>
                  <AlertCircle size={12}/>{errs.date}
                </p>
              )}
              <DayPicker
                mode="single"
                selected={selected}
                onSelect={(day) => { setSelected(day); setErrs(p => ({ ...p, date: undefined })); }}
                locale={tr}
                disabled={{ before: new Date() }}
              />

              {selected && (
                <div style={{ marginTop:"1rem" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.75rem" }}>
                    <Clock style={{ width:15, height:15, color:"#D4AF37" }} />
                    <h4 style={{ color:"#fff", fontSize:"0.875rem", fontWeight:600 }}>Saat Seç</h4>
                  </div>
                  {errs.time && (
                    <p style={{ color:"#f87171", fontSize:"0.75rem", display:"flex", alignItems:"center", gap:4, marginBottom:"0.5rem" }}>
                      <AlertCircle size={12}/>{errs.time}
                    </p>
                  )}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.5rem" }}>
                    {TIME_SLOTS.map(t => (
                      <button key={t} type="button" onClick={() => { setTime(t); setErrs(p => ({ ...p, time: undefined })); }}
                        style={{ padding:"0.5rem", borderRadius:9, fontSize:"0.8125rem", fontWeight:600, cursor:"pointer", background:selectedTime===t?"#6A0D25":"#1A1A1A", border:`1px solid ${selectedTime===t?"rgba(212,175,55,0.5)":"rgba(255,255,255,0.07)"}`, color:selectedTime===t?"#D4AF37":"rgba(255,255,255,0.6)" }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div style={{ background:"#141414", borderRadius:20, border:"1px solid rgba(255,255,255,0.07)", padding:"1.5rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"1.5rem" }}>
                <User style={{ width:18, height:18, color:"#D4AF37" }} />
                <h3 style={{ color:"#fff", fontWeight:700, fontSize:"0.9375rem" }}>Kişisel Bilgiler</h3>
              </div>

              {error && (
                <div style={{ marginBottom:"1rem", padding:"10px 14px", background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.25)", borderRadius:10, color:"#f87171", fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
                  <AlertCircle size={14}/>{error}
                </div>
              )}

              <form onSubmit={onSubmit} style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                {([
                  { k:"full_name", l:"Ad Soyad",  t:"text",  p:"Adın Soyadın" },
                  { k:"email",     l:"E-posta",   t:"email", p:"ornek@mail.com" },
                  { k:"phone",     l:"Telefon",   t:"tel",   p:"05xx xxx xx xx" },
                ] as const).map(f => (
                  <div key={f.k}>
                    <label style={LBL}>{f.l}</label>
                    <input value={form[f.k]} onChange={e=>set(f.k,e.target.value)} type={f.t} placeholder={f.p}
                      style={{ ...INP, border: errs[f.k] ? "1px solid #f87171" : INP.border }} />
                    {errs[f.k] && <p style={{ color:"#f87171", fontSize:"0.75rem", marginTop:4 }}>{errs[f.k]}</p>}
                  </div>
                ))}

                <div>
                  <label style={LBL}>Hizmet</label>
                  <select value={form.service} onChange={e=>set("service",e.target.value)}
                    style={{ ...INP, color:"rgba(255,255,255,0.8)", cursor:"pointer", border: errs.service ? "1px solid #f87171" : INP.border }}>
                    <option value="">Seçin...</option>
                    {SERVICES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  {errs.service && <p style={{ color:"#f87171", fontSize:"0.75rem", marginTop:4 }}>{errs.service}</p>}
                </div>

                <div>
                  <label style={LBL}>Notunuz (İsteğe bağlı)</label>
                  <textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={2} placeholder="Özel isteğiniz..."
                    style={{ ...INP, resize:"vertical" }} />
                </div>

                {selected && selectedTime && (
                  <div style={{ padding:"0.75rem 1rem", background:"rgba(106,13,37,0.2)", borderRadius:10, border:"1px solid rgba(106,13,37,0.3)", fontSize:"0.8125rem", color:"rgba(255,255,255,0.8)" }}>
                    <strong style={{ color:"#D4AF37" }}>{format(selected,"d MMMM yyyy",{locale:tr})}</strong> — <strong style={{ color:"#D4AF37" }}>{selectedTime}</strong>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  style={{ width:"100%", padding:"0.875rem", background:"#6A0D25", color:"#fff", fontWeight:800, fontSize:"0.9375rem", borderRadius:12, border:"1px solid rgba(212,175,55,0.3)", cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem" }}>
                  {loading && <Loader2 style={{ width:16, height:16, animation:"spin 0.8s linear infinite" }} />}
                  {loading ? "Gönderiliyor..." : "Randevu Onayla"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
