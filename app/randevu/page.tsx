"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DayPicker } from "react-day-picker";
import { tr } from "date-fns/locale";
import { format } from "date-fns";
import { Loader2, CheckCircle, Calendar, Clock, User, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { createClient } from "@/lib/supabase/client";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

const SERVICES = [
  { id: "fitness",   label: "Fitness Üyelik Danışma" },
  { id: "pt",        label: "Personal Trainer" },
  { id: "boks",      label: "Boks Özel Ders" },
  { id: "kickboks",  label: "Kickboks" },
  { id: "muay_thai", label: "Muay Thai" },
  { id: "deneme",    label: "Ücretsiz Deneme Antrenmanı" },
];

const schema = z.object({
  full_name: z.string().min(2, "Ad soyad gerekli"),
  email:     z.string().email("Geçerli e-posta girin"),
  phone:     z.string().min(10, "Telefon numarası gerekli"),
  service:   z.string().min(1, "Hizmet seçin"),
  notes:     z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const WA_FALLBACK = "905551234567";

export default function RandevuPage() {
  const [selected,     setSelected]     = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [waNumber,     setWaNumber]     = useState(WA_FALLBACK);
  const [error,        setError]        = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const watched = watch();

  const onSubmit = async (data: FormData) => {
    if (!selected)     { setError("Lütfen bir tarih seçin.");  return; }
    if (!selectedTime) { setError("Lütfen bir saat seçin.");  return; }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const dateStr  = format(selected, "yyyy-MM-dd");

    // Fetch WhatsApp number from settings
    const { data: waSetting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "contact_whatsapp")
      .single();
    if (waSetting?.value) setWaNumber(String(waSetting.value).replace(/\D/g, ""));

    const { error: leadErr } = await supabase.from("leads").insert({
      type:         "appointment",
      status:       "new",
      is_read:      false,
      name:         data.full_name,
      email:        data.email,
      phone:        data.phone,
      appt_date:    dateStr,
      appt_time:    selectedTime,
      appt_service: data.service,
      appt_notes:   data.notes || null,
      message:      `Randevu: ${SERVICES.find(s => s.id === data.service)?.label ?? data.service} — ${dateStr} ${selectedTime}`,
    });

    if (leadErr) {
      setError("Randevu alınamadı. Lütfen WhatsApp üzerinden ulaşın.");
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const waMessage = success && selected
    ? encodeURIComponent(`Merhaba, ${format(selected, "d MMMM yyyy", { locale: tr })} tarihinde ${selectedTime} saatinde randevu almak istiyorum. Ad: ${watched.full_name}`)
    : "";

  if (success) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "100vh", background: "#0B0B0B", display: "flex", alignItems: "center", justifyContent: "center", padding: "5rem 1rem" }}>
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <div style={{ width: 80, height: 80, background: "rgba(74,222,128,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <CheckCircle style={{ width: 40, height: 40, color: "#4ade80" }} />
            </div>
            <h2 style={{ fontSize: "clamp(1.5rem,4vw,2rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)", marginBottom: "0.75rem" }}>
              Randevunuz Alındı!
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "0.5rem" }}>
              <strong style={{ color: "#D4AF37" }}>{selected ? format(selected, "d MMMM yyyy", { locale: tr }) : ""}</strong>{" "}tarihinde{" "}
              <strong style={{ color: "#D4AF37" }}>{selectedTime}</strong> saatinde sizi bekliyoruz.
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", marginBottom: "2rem" }}>
              Onay ve hatırlatma için WhatsApp üzerinden iletişime geçebilirsiniz.
            </p>
            <a
              href={`https://wa.me/${waNumber}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", padding: "0.875rem 2rem", background: "#25D366", color: "#fff", fontWeight: 800, fontSize: "0.9375rem", borderRadius: 14, textDecoration: "none" }}
            >
              <MessageCircle style={{ width: 20, height: 20 }} />
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
      <main style={{ minHeight: "100vh", background: "#0B0B0B", paddingTop: 96, paddingBottom: "4rem" }}>
        <div className="page-container">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Online Randevu</p>
            <h1 style={{ fontSize: "clamp(1.875rem,5vw,2.75rem)", fontWeight: 800, color: "#fff", fontFamily: "var(--font-heading)", marginBottom: "0.75rem" }}>Randevu Al</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9375rem" }}>
              Ücretsiz deneme antrenmanı dahil tüm hizmetler için randevu alın
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem", maxWidth: 900, marginInline: "auto" }} className="randevu-grid">
            <style>{`
              @media(min-width:768px){ .randevu-grid{ grid-template-columns: 1fr 1fr !important; } }
              .rdp { --rdp-accent-color: #6A0D25; color: white; margin: 0; }
              .rdp-day_selected, .rdp-day_selected:hover { background-color: #6A0D25 !important; color: #D4AF37 !important; border-radius: 8px; }
              .rdp-day:hover:not(.rdp-day_selected) { background-color: #2A2A2A; border-radius: 8px; }
              .rdp-caption_label { color: #D4AF37; font-weight: 700; }
              .rdp-nav_button { color: rgba(255,255,255,0.6); }
              .rdp-nav_button:hover { color: #D4AF37; background: #2A2A2A; }
              .rdp-head_cell { color: rgba(255,255,255,0.4); font-size: 0.75rem; }
              .rdp-day_disabled { opacity: 0.25; }
              .rdp-day_outside { opacity: 0.3; }
            `}</style>

            {/* Calendar & Time */}
            <div style={{ background: "#141414", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Calendar style={{ width: 18, height: 18, color: "#D4AF37" }} />
                <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "0.9375rem" }}>Tarih Seç</h3>
              </div>
              <DayPicker
                mode="single"
                selected={selected}
                onSelect={setSelected}
                locale={tr}
                disabled={{ before: new Date() }}
              />

              {selected && (
                <div style={{ marginTop: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <Clock style={{ width: 15, height: 15, color: "#D4AF37" }} />
                    <h4 style={{ color: "#fff", fontSize: "0.875rem", fontWeight: 600 }}>Saat Seç</h4>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.5rem" }}>
                    {TIME_SLOTS.map(t => (
                      <button key={t} type="button" onClick={() => setSelectedTime(t)}
                        style={{ padding: "0.5rem", borderRadius: 9, fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s", background: selectedTime === t ? "#6A0D25" : "#1A1A1A", border: `1px solid ${selectedTime === t ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.07)"}`, color: selectedTime === t ? "#D4AF37" : "rgba(255,255,255,0.6)" }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div style={{ background: "#141414", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                <User style={{ width: 18, height: 18, color: "#D4AF37" }} />
                <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "0.9375rem" }}>Kişisel Bilgiler</h3>
              </div>

              {error && (
                <div style={{ marginBottom: "1rem", padding: "10px 14px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 10, color: "#f87171", fontSize: 13 }}>{error}</div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {([
                  { name: "full_name", label: "Ad Soyad",  type: "text",  placeholder: "Adın Soyadın" },
                  { name: "email",     label: "E-posta",   type: "email", placeholder: "ornek@mail.com" },
                  { name: "phone",     label: "Telefon",   type: "tel",   placeholder: "05xx xxx xx xx" },
                ] as const).map(f => (
                  <div key={f.name}>
                    <label style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.375rem" }}>{f.label}</label>
                    <input {...register(f.name)} type={f.type} placeholder={f.placeholder}
                      style={{ width: "100%", padding: "0.75rem 1rem", background: "#111", border: "1px solid #2A2A2A", borderRadius: 10, color: "#fff", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                    {errors[f.name] && <p style={{ color: "#f87171", fontSize: "0.75rem", marginTop: 4 }}>{errors[f.name]?.message}</p>}
                  </div>
                ))}

                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.375rem" }}>Hizmet</label>
                  <select {...register("service")}
                    style={{ width: "100%", padding: "0.75rem 1rem", background: "#111", border: "1px solid #2A2A2A", borderRadius: 10, color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", outline: "none", cursor: "pointer" }}>
                    <option value="">Seçin...</option>
                    {SERVICES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  {errors.service && <p style={{ color: "#f87171", fontSize: "0.75rem", marginTop: 4 }}>{errors.service.message}</p>}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.375rem" }}>Notunuz (İsteğe bağlı)</label>
                  <textarea {...register("notes")} rows={2} placeholder="Özel isteğiniz..."
                    style={{ width: "100%", padding: "0.75rem 1rem", background: "#111", border: "1px solid #2A2A2A", borderRadius: 10, color: "#fff", fontSize: "0.875rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                </div>

                {selected && selectedTime && (
                  <div style={{ padding: "0.75rem 1rem", background: "rgba(106,13,37,0.2)", borderRadius: 10, border: "1px solid rgba(106,13,37,0.3)", fontSize: "0.8125rem", color: "rgba(255,255,255,0.8)" }}>
                    <strong style={{ color: "#D4AF37" }}>{format(selected, "d MMMM yyyy", { locale: tr })}</strong> — <strong style={{ color: "#D4AF37" }}>{selectedTime}</strong>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  style={{ width: "100%", padding: "0.875rem", background: "#6A0D25", color: "#fff", fontWeight: 800, fontSize: "0.9375rem", borderRadius: 12, border: "1px solid rgba(212,175,55,0.3)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  {loading && <Loader2 style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }} />}
                  Randevu Onayla
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
