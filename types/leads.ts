export type LeadType = "contact" | "trial" | "quote" | "program" | "appointment";
export type LeadStatus = "new" | "read" | "in_progress" | "done" | "cancelled";

export interface Lead {
  id: string;
  type: LeadType;
  status: LeadStatus;
  name: string;
  phone?: string | null;
  email?: string | null;
  message?: string | null;
  admin_note?: string | null;
  trial_service?: string | null;
  trial_goal?: string | null;
  trial_level?: string | null;
  quote_package?: string | null;
  quote_budget?: string | null;
  prog_goal?: string | null;
  prog_level?: string | null;
  prog_days?: number | null;
  prog_weight?: number | null;
  prog_height?: number | null;
  prog_age?: number | null;
  prog_injuries?: string | null;
  appt_date?: string | null;
  appt_time?: string | null;
  appt_service?: string | null;
  appt_notes?: string | null;
  source?: string;
  is_read?: boolean;
  created_at: string;
  updated_at?: string;
}

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  contact: "İletişim",
  trial: "Deneme Antrenmanı",
  quote: "Fiyat Teklifi",
  program: "Program Başvurusu",
  appointment: "Randevu",
};

export const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  new:         { label: "Yeni",        color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  read:        { label: "Okundu",      color: "#D4AF37", bg: "rgba(212,175,55,0.12)" },
  in_progress: { label: "İşlemde",     color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  done:        { label: "Tamamlandı",  color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  cancelled:   { label: "İptal",       color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.05)" },
};

export const LEAD_TYPE_COLORS: Record<LeadType, { color: string; bg: string }> = {
  contact:     { color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  trial:       { color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  quote:       { color: "#D4AF37", bg: "rgba(212,175,55,0.12)" },
  program:     { color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  appointment: { color: "#f97316", bg: "rgba(249,115,22,0.12)" },
};
