"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Loader2, CheckCircle, XCircle, Clock, RefreshCw, Trash2 } from "lucide-react";

interface JobRow {
  id: string;
  type: "wger_import" | "ai_batch";
  status: "running" | "completed" | "failed" | "timeout";
  started_at: string;
  finished_at: string | null;
  meta: Record<string, unknown> | null;
}

interface JobsData {
  active: JobRow | null;
  recent: JobRow[];
}

const TYPE_LABEL: Record<string, string> = {
  wger_import: "wger Import",
  ai_batch: "AI Görsel Batch",
};

function StatusIcon({ status }: { status: JobRow["status"] }) {
  if (status === "running")   return <Loader2 size={13} style={{ color: "#facc15", animation: "spin 1s linear infinite" }} />;
  if (status === "completed") return <CheckCircle size={13} style={{ color: "#4ade80" }} />;
  if (status === "failed")    return <XCircle size={13} style={{ color: "#f87171" }} />;
  return <Clock size={13} style={{ color: "#fb923c" }} />;
}

function StatusLabel({ status }: { status: JobRow["status"] }) {
  const map = { running: "Çalışıyor", completed: "Tamamlandı", failed: "Başarısız", timeout: "Zaman Aşımı" };
  return <span>{map[status] ?? status}</span>;
}

function dur(row: JobRow) {
  const end = row.finished_at ? new Date(row.finished_at) : new Date();
  const s = Math.floor((end.getTime() - new Date(row.started_at).getTime()) / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

interface Props {
  /** If true, poll every 3s while a job is running */
  autoRefresh?: boolean;
  /** Show only this job type */
  filterType?: "wger_import" | "ai_batch";
}

export default function JobStatusPanel({ autoRefresh = true, filterType }: Props) {
  const [data, setData] = useState<JobsData | null>(null);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) setData(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Poll only while a job is running
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      if (data?.active) load();
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, data?.active, load]);

  const reset = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/jobs?action=reset", { method: "DELETE" });
      const json = await res.json();
      setToast(`${json.reset} stuck job sıfırlandı`);
      setTimeout(() => setToast(null), 4000);
      await load();
    } finally {
      setResetting(false);
    }
  };

  const recent = filterType
    ? (data?.recent ?? []).filter((j) => j.type === filterType)
    : (data?.recent ?? []);

  const activeFiltered = data?.active && (!filterType || data.active.type === filterType)
    ? data.active : null;

  const card: React.CSSProperties = {
    background: "#141414",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "16px 18px",
    marginBottom: 14,
  };

  return (
    <div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {toast && (
        <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 10, padding: "8px 14px", marginBottom: 12, color: "#4ade80", fontSize: 12 }}>
          {toast}
        </div>
      )}

      {/* Active job */}
      {activeFiltered ? (
        <div style={{ ...card, border: "1px solid rgba(250,204,21,0.25)", background: "rgba(250,204,21,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Loader2 size={15} style={{ color: "#facc15", animation: "spin 1s linear infinite" }} />
            <span style={{ color: "#facc15", fontWeight: 700, fontSize: 13 }}>Aktif Job: {TYPE_LABEL[activeFiltered.type]}</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginLeft: "auto" }}>{dur(activeFiltered)} önce başladı</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: 0 }}>
            ID: {activeFiltered.id.slice(0, 8)}... · Yeni job bu tamamlanana kadar başlatılamaz.
          </p>
        </div>
      ) : (
        <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Aktif job yok — yeni job başlatılabilir</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={load} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.4)", padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
              <RefreshCw size={12} /> Yenile
            </button>
            <button onClick={reset} disabled={resetting} style={{ background: "transparent", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, color: "#f87171", padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, opacity: resetting ? 0.5 : 1 }}>
              <Trash2 size={12} /> Stuck Reset
            </button>
          </div>
        </div>
      )}

      {/* Recent jobs */}
      {recent.length > 0 && (
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Son Joblar</span>
            {activeFiltered && (
              <button onClick={load} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 11 }}>
                <RefreshCw size={11} />
              </button>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {recent.slice(0, 8).map((j) => (
              <div key={j.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <StatusIcon status={j.status} />
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, flex: 1 }}>{TYPE_LABEL[j.type] ?? j.type}</span>
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}><StatusLabel status={j.status} /></span>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>{dur(j)}</span>
                <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 10 }}>{new Date(j.started_at).toLocaleTimeString("tr-TR")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
