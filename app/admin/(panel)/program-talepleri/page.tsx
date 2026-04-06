"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, Loader2, ChevronDown, ChevronUp, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";

const IS: React.CSSProperties = { background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "#fff", padding: "9px 12px", fontSize: 13.5, outline: "none", width: "100%", boxSizing: "border-box" };
const TS: React.CSSProperties = { ...IS, minHeight: 300, resize: "vertical", fontFamily: "monospace", lineHeight: 1.7 };
const LBL: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.4)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" };

type Status = "waiting" | "in_progress" | "sent";
type PayStatus = "pending" | "paid" | "failed";

interface ProgramRequest {
  id: string;
  full_name: string; email: string; phone?: string;
  age?: number; gender?: string; height_cm?: number; weight_kg?: number;
  goal?: string; fitness_level?: string; days_per_week?: number; session_duration?: number;
  health_issues?: string; injuries?: string; diet_preference?: string; extra_notes?: string;
  program_type: string;
  payment_status: PayStatus;
  status: Status;
  amount?: number;
  admin_program?: string;
  sent_at?: string;
  created_at: string;
}

const STATUS_LABELS: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
  waiting:     { label: "Bekliyor",      color: "#facc15", icon: <Clock size={12} /> },
  in_progress: { label: "Hazırlanıyor",  color: "#60a5fa", icon: <Loader2 size={12} /> },
  sent:        { label: "Gönderildi",    color: "#4ade80", icon: <CheckCircle size={12} /> },
};

const PAY_LABELS: Record<PayStatus, { label: string; color: string }> = {
  pending: { label: "Ödeme Bekleniyor", color: "#facc15" },
  paid:    { label: "Ödendi ✓",         color: "#4ade80" },
  failed:  { label: "Başarısız",         color: "#f87171" },
};

const TYPE_LABELS: Record<string, string> = {
  fitness:  "Fitness Programı",
  beslenme: "Beslenme Programı",
  combo:    "Fitness + Beslenme",
};

export default function ProgramTalepleriPage() {
  const sb = createClient();
  const [requests, setRequests] = useState<ProgramRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [programTexts, setProgramTexts] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; err: boolean } | null>(null);
  const [filterPay, setFilterPay] = useState<string>("paid");

  const showToast = (msg: string, err = false) => { setToast({ msg, err }); setTimeout(() => setToast(null), 4000); };

  const load = async () => {
    setLoading(true);
    const query = sb.from("program_requests").select("*").order("created_at", { ascending: false });
    if (filterPay !== "all") query.eq("payment_status", filterPay);
    const { data } = await query;
    setRequests((data as ProgramRequest[]) || []);
    const texts: Record<string, string> = {};
    (data || []).forEach((r: ProgramRequest) => { if (r.admin_program) texts[r.id] = r.admin_program; });
    setProgramTexts(prev => ({ ...texts, ...prev }));
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterPay]);

  const handleSend = async (req: ProgramRequest) => {
    const text = programTexts[req.id]?.trim();
    if (!text) { showToast("Program metni boş bırakılamaz", true); return; }
    setSending(req.id);
    try {
      const res = await fetch("/api/program-requests/send-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: req.id, programText: text }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Hata oluştu", true); }
      else { showToast(`PDF oluşturuldu ve ${req.email} adresine gönderildi ✓`); await load(); }
    } catch { showToast("Bağlantı hatası", true); }
    setSending(null);
  };

  const infoRow = (label: string, value?: string | number | null) =>
    value ? (
      <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,.3)", minWidth: 130 }}>{label}:</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,.75)", flex: 1 }}>{value}</span>
      </div>
    ) : null;

  return (
    <div style={{ maxWidth: 900 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#141414", border: `1px solid ${toast.err ? "rgba(248,113,113,0.3)" : "rgba(74,222,128,0.3)"}`, color: toast.err ? "#f87171" : "#4ade80", padding: "12px 20px", borderRadius: 10, fontSize: 13, zIndex: 999, maxWidth: 380 }}>{toast.msg}</div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 24, margin: "0 0 4px" }}>Program Talepleri</h1>
          <p style={{ color: "rgba(255,255,255,.3)", fontSize: 13, margin: 0 }}>Kullanıcı başvurularını görüntüle, program yaz ve gönder</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={filterPay} onChange={e => setFilterPay(e.target.value)} style={{ ...IS, width: "auto", fontSize: 12 }}>
            <option value="all">Tüm Ödemeler</option>
            <option value="paid">Ödendi</option>
            <option value="pending">Beklemede</option>
            <option value="failed">Başarısız</option>
          </select>
          <button onClick={load} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 9, color: "rgba(255,255,255,.5)", padding: "8px 12px", cursor: "pointer" }}>
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,.3)" }}><Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} /></div>
      ) : requests.length === 0 ? (
        <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 40, textAlign: "center", color: "rgba(255,255,255,.25)" }}>
          Henüz talep yok
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {requests.map(req => {
            const isOpen = expanded === req.id;
            const payInfo = PAY_LABELS[req.payment_status];
            const stInfo = STATUS_LABELS[req.status];

            return (
              <div key={req.id} style={{ background: "#141414", border: `1px solid ${req.payment_status === "paid" && req.status !== "sent" ? "rgba(250,204,21,0.25)" : "rgba(255,255,255,.07)"}`, borderRadius: 14, overflow: "hidden" }}>
                {/* Kart başlığı */}
                <div
                  onClick={() => setExpanded(isOpen ? null : req.id)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", cursor: "pointer" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{req.full_name}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.4)" }}>{TYPE_LABELS[req.program_type] || req.program_type}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: `${payInfo.color}18`, color: payInfo.color }}>{payInfo.label}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: `${stInfo.color}18`, color: stInfo.color, display: "flex", alignItems: "center", gap: 4 }}>{stInfo.icon} {stInfo.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)" }}>{req.email} · {new Date(req.created_at).toLocaleString("tr-TR")}</div>
                  </div>
                  {isOpen ? <ChevronUp size={18} color="rgba(255,255,255,.3)" /> : <ChevronDown size={18} color="rgba(255,255,255,.3)" />}
                </div>

                {/* Genişletilmiş detay */}
                {isOpen && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "20px 20px 24px" }}>
                    {/* Kullanıcı bilgileri */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#D4AF37", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Kişisel Bilgiler</div>
                        {infoRow("Ad Soyad", req.full_name)}
                        {infoRow("E-posta", req.email)}
                        {infoRow("Telefon", req.phone)}
                        {infoRow("Yaş", req.age)}
                        {infoRow("Cinsiyet", req.gender === "erkek" ? "Erkek" : req.gender === "kadin" ? "Kadın" : req.gender)}
                        {infoRow("Boy", req.height_cm ? `${req.height_cm} cm` : null)}
                        {infoRow("Kilo", req.weight_kg ? `${req.weight_kg} kg` : null)}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#D4AF37", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Program & Hedef</div>
                        {infoRow("Hedef", req.goal)}
                        {infoRow("Seviye", req.fitness_level)}
                        {infoRow("Antrenman", req.days_per_week ? `${req.days_per_week} gün/hafta` : null)}
                        {infoRow("Seans", req.session_duration ? `${req.session_duration} dk` : null)}
                        {infoRow("Beslenme", req.diet_preference)}
                        {infoRow("Program Türü", TYPE_LABELS[req.program_type])}
                        {infoRow("Ödeme", req.amount ? `₺${req.amount}` : null)}
                      </div>
                    </div>

                    {(req.health_issues || req.injuries || req.extra_notes) && (
                      <div style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                          <AlertCircle size={14} /> Sağlık Bilgileri
                        </div>
                        {req.health_issues && <div style={{ marginBottom: 8 }}>{infoRow("Sağlık Sorunları", req.health_issues)}</div>}
                        {req.injuries && <div style={{ marginBottom: 8 }}>{infoRow("Sakatlıklar", req.injuries)}</div>}
                        {req.extra_notes && infoRow("Ek Notlar", req.extra_notes)}
                      </div>
                    )}

                    {/* Program yazma alanı */}
                    {req.payment_status === "paid" && (
                      <div>
                        <label style={LBL}>
                          {req.status === "sent" ? "Gönderilen Program" : "Program Metni — Buraya Yazın / Yapıştırın"}
                        </label>
                        <textarea
                          value={programTexts[req.id] || ""}
                          onChange={e => setProgramTexts(p => ({ ...p, [req.id]: e.target.value }))}
                          style={{ ...TS, borderColor: programTexts[req.id]?.trim() ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,.1)" }}
                          placeholder={`${TYPE_LABELS[req.program_type]} için program içeriğini buraya yazın veya yapıştırın.\n\nÖrnek format:\n\n=== FİTNESS PROGRAMI ===\n\nHAFTA 1\n\nPazartesi - Göğüs & Triseps\n• Bench Press: 4 set x 8-10 tekrar\n• İnklinli Dumbbell Press: 3 set x 12 tekrar\n...\n\n=== BESLENME PROGRAMI ===\nGünlük: 2.200 kcal | Protein: 165g | Karb: 220g | Yağ: 73g\n\nKahvaltı (07:30): Yulaf 80g + 3 yumurta...`}
                          readOnly={req.status === "sent"}
                        />
                        {req.status === "sent" && req.sent_at && (
                          <div style={{ fontSize: 12, color: "#4ade80", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                            <CheckCircle size={13} /> Gönderildi: {new Date(req.sent_at).toLocaleString("tr-TR")}
                          </div>
                        )}
                        {req.status !== "sent" && (
                          <button
                            onClick={() => handleSend(req)}
                            disabled={sending === req.id || !programTexts[req.id]?.trim()}
                            style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", color: "#fff", padding: "11px 22px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, opacity: !programTexts[req.id]?.trim() ? 0.5 : 1 }}
                          >
                            {sending === req.id
                              ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> PDF Oluşturuluyor & Mail Gönderiliyor...</>
                              : <><Send size={16} /> PDF Oluştur & {req.email} Adresine Gönder</>
                            }
                          </button>
                        )}
                      </div>
                    )}

                    {req.payment_status === "pending" && (
                      <div style={{ background: "rgba(250,204,21,0.06)", border: "1px solid rgba(250,204,21,0.15)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "rgba(250,204,21,0.7)" }}>
                        ⏳ Ödeme henüz tamamlanmadı. Ödeme onaylandıktan sonra program yazabilirsiniz.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
