"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DayPicker } from "react-day-picker";
import { tr } from "date-fns/locale";
import { format } from "date-fns";
import { Loader2, CheckCircle, Calendar, Clock, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { createClient } from "@/lib/supabase/client";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

const SERVICES = [
  { id: "fitness", label: "Fitness Üyelik Danışma" },
  { id: "pt", label: "Personal Trainer" },
  { id: "boks", label: "Boks Özel Ders" },
  { id: "kickboks", label: "Kickboks" },
  { id: "muay_thai", label: "Muay Thai" },
  { id: "deneme", label: "Ücretsiz Deneme Antrenmanı" },
];

const schema = z.object({
  full_name: z.string().min(2, "Ad soyad gerekli"),
  email: z.email("Geçerli e-posta girin"),
  phone: z.string().min(10, "Telefon numarası gerekli"),
  service: z.string().min(1, "Hizmet seçin"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RandevuPage() {
  const [selected, setSelected] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!selected) { setError("Lütfen bir tarih seçin."); return; }
    if (!selectedTime) { setError("Lütfen bir saat seçin."); return; }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const dateStr = format(selected, "yyyy-MM-dd");

    // Write to leads table (primary)
    await supabase.from("leads").insert({
      type: "appointment",
      status: "new",
      is_read: false,
      name: data.full_name,
      email: data.email,
      phone: data.phone,
      appt_date: dateStr,
      appt_time: selectedTime,
      appt_service: data.service,
      appt_notes: data.notes || null,
      message: `Randevu: ${data.service} — ${dateStr} ${selectedTime}`,
    });

    // Also write to legacy appointments table (fallback)
    const { error: dbError } = await supabase.from("appointments").insert({
      date: dateStr,
      time_slot: selectedTime,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      service_id: null,
      notes: `Hizmet: ${data.service}${data.notes ? ` | Not: ${data.notes}` : ""}`,
      status: "pending",
    });

    if (dbError) {
      setError("Randevu alınamadı. Lütfen tekrar deneyin.");
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-dark flex items-center justify-center px-4 pt-24">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 font-heading">Randevunuz Alındı!</h2>
            <p className="text-white/60">
              <strong className="text-gold">{format(selected!, "d MMMM yyyy", { locale: tr })}</strong> tarihinde{" "}
              <strong className="text-gold">{selectedTime}</strong> saatinde sizi bekliyoruz.
            </p>
            <p className="text-white/50 text-sm mt-3">Admin onayı sonrası size bildirim göndereceğiz.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dark pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-gold text-sm font-semibold tracking-widest uppercase">Online Randevu</span>
            <h1 className="text-4xl font-bold text-white mt-3 mb-3 font-heading">Randevu Al</h1>
            <p className="text-white/60 text-sm">Ücretsiz deneme antrenmanı dahil tüm hizmetler için randevu alın</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar & Time */}
            <div className="bg-dark-700 rounded-2xl border border-dark-600 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gold" />
                <h3 className="text-white font-semibold">Tarih Seç</h3>
              </div>
              <style>{`
                .rdp { --rdp-accent-color: #6A0D25; --rdp-background-color: #1A1A1A; color: white; margin: 0; }
                .rdp-day_selected { background-color: #6A0D25 !important; color: #D4AF37 !important; }
                .rdp-day:hover { background-color: #2A2A2A; }
                .rdp-caption_label { color: #D4AF37; }
                .rdp-nav_button { color: #D4AF37; }
                .rdp-head_cell { color: rgba(255,255,255,0.4); }
                .rdp-day_disabled { opacity: 0.3; }
              `}</style>
              <DayPicker
                mode="single"
                selected={selected}
                onSelect={setSelected}
                locale={tr}
                disabled={{ before: new Date() }}
              />

              {selected && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-gold" />
                    <h4 className="text-white text-sm font-medium">Saat Seç</h4>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`py-2 rounded-lg text-sm transition-all ${
                          selectedTime === t ? "bg-bordo border border-gold/50 text-gold" : "bg-dark-800 border border-dark-600 text-white/70 hover:border-bordo/40"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="bg-dark-700 rounded-2xl border border-dark-600 p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-gold" />
                <h3 className="text-white font-semibold">Kişisel Bilgiler</h3>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1.5">Ad Soyad</label>
                  <input {...register("full_name")} placeholder="Adın Soyadın" className="w-full px-4 py-3 bg-dark-800 border border-dark-600 focus:border-gold/50 rounded-xl text-white text-sm outline-none placeholder:text-white/30" />
                  {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1.5">E-posta</label>
                  <input {...register("email")} type="email" placeholder="ornek@mail.com" className="w-full px-4 py-3 bg-dark-800 border border-dark-600 focus:border-gold/50 rounded-xl text-white text-sm outline-none placeholder:text-white/30" />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1.5">Telefon</label>
                  <input {...register("phone")} type="tel" placeholder="05xx xxx xx xx" className="w-full px-4 py-3 bg-dark-800 border border-dark-600 focus:border-gold/50 rounded-xl text-white text-sm outline-none placeholder:text-white/30" />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1.5">Hizmet</label>
                  <select {...register("service")} className="w-full px-4 py-3 bg-dark-800 border border-dark-600 focus:border-gold/50 rounded-xl text-white text-sm outline-none">
                    <option value="">Seçin...</option>
                    {SERVICES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  {errors.service && <p className="text-red-400 text-xs mt-1">{errors.service.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1.5">Notunuz (İsteğe bağlı)</label>
                  <textarea {...register("notes")} rows={3} placeholder="Özel isteğiniz..." className="w-full px-4 py-3 bg-dark-800 border border-dark-600 focus:border-gold/50 rounded-xl text-white text-sm outline-none placeholder:text-white/30 resize-none" />
                </div>

                {selected && selectedTime && (
                  <div className="p-3 bg-bordo/20 rounded-xl border border-bordo/30 text-sm text-white/80">
                    <strong className="text-gold">{format(selected, "d MMMM yyyy", { locale: tr })}</strong> — <strong className="text-gold">{selectedTime}</strong>
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full py-3 bg-bordo hover:bg-bordo-light text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Randevu Onayla
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
