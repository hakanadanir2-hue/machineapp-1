"use client";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LeadType } from "@/types/leads";
import { CheckCircle, Loader2 } from "lucide-react";

interface Field {
  key: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  half?: boolean;
  leadKey?: string; // maps to DB column; defaults to key
}

interface LeadFormProps {
  type: LeadType;
  title: string;
  subtitle?: string;
  fields: Field[];
  successTitle?: string;
  successMsg?: string;
  submitLabel?: string;
  staticFields?: Record<string, string | number>;
}

const inputBase: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  color: "#fff",
  padding: "12px 14px",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "rgba(255,255,255,0.45)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

export default function LeadForm({
  type, title, subtitle, fields, successTitle, successMsg, submitLabel, staticFields,
}: LeadFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (k: string, v: string) => {
    setValues(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    fields.forEach(f => {
      if (f.required && !values[f.key]?.trim()) errs[f.key] = "Bu alan zorunlu";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError("");

    const payload: Record<string, string | number | boolean> = { type, status: "new", is_read: false };
    fields.forEach(f => {
      const col = f.leadKey ?? f.key;
      payload[col] = values[f.key] ?? "";
    });
    if (staticFields) Object.assign(payload, staticFields);

    const supabase = createClient();
    const { error } = await supabase.from("leads").insert(payload);
    setLoading(false);
    if (error) {
      setServerError("Gönderim sırasında hata oluştu. Lütfen WhatsApp üzerinden ulaşın.");
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 2rem" }}>
        <CheckCircle style={{ width: 52, height: 52, color: "#4ade80", margin: "0 auto 16px" }} />
        <h3 style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
          {successTitle ?? "Başvurunuz Alındı!"}
        </h3>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.6, maxWidth: 400, margin: "0 auto" }}>
          {successMsg ?? "En kısa sürede sizinle iletişime geçeceğiz. Teşekkürler!"}
        </p>
      </div>
    );
  }

  // Group half fields
  const rows: Field[][] = [];
  let i = 0;
  while (i < fields.length) {
    if (fields[i].half && fields[i + 1]?.half) {
      rows.push([fields[i], fields[i + 1]]);
      i += 2;
    } else {
      rows.push([fields[i]]);
      i++;
    }
  }

  return (
    <div>
      {title && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>{title}</h3>
          {subtitle && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: 0 }}>{subtitle}</p>}
        </div>
      )}

      <form onSubmit={submit} noValidate>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: "grid", gridTemplateColumns: row.length === 2 ? "1fr 1fr" : "1fr", gap: 12, marginBottom: 14 }}>
            {row.map(field => (
              <div key={field.key}>
                <label style={labelStyle}>{field.label}{field.required && <span style={{ color: "#7A0D2A" }}> *</span>}</label>
                {field.type === "textarea" ? (
                  <textarea
                    value={values[field.key] ?? ""}
                    onChange={e => set(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    style={{ ...inputBase, minHeight: 100, resize: "vertical" }}
                  />
                ) : field.type === "select" ? (
                  <select
                    value={values[field.key] ?? ""}
                    onChange={e => set(field.key, e.target.value)}
                    style={{ ...inputBase, appearance: "none", cursor: "pointer" }}
                  >
                    <option value="">Seçiniz...</option>
                    {(field.options ?? []).map(opt => (
                      <option key={opt} value={opt} style={{ background: "#1A1A1A" }}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type ?? "text"}
                    value={values[field.key] ?? ""}
                    onChange={e => set(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    style={{ ...inputBase, borderColor: errors[field.key] ? "#f87171" : "rgba(255,255,255,0.1)" }}
                  />
                )}
                {errors[field.key] && (
                  <p style={{ color: "#f87171", fontSize: 11, margin: "4px 0 0" }}>{errors[field.key]}</p>
                )}
              </div>
            ))}
          </div>
        ))}

        {serverError && (
          <p style={{ color: "#f87171", fontSize: 13, marginBottom: 14, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "10px 14px" }}>
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", padding: "14px 0", marginTop: 4,
            background: loading ? "#333" : "linear-gradient(135deg,#7A0D2A,#6A0D25)",
            border: "1px solid rgba(212,175,55,0.35)",
            borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {loading && <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />}
          {loading ? "Gönderiliyor..." : (submitLabel ?? "Gönder")}
        </button>
      </form>
    </div>
  );
}
