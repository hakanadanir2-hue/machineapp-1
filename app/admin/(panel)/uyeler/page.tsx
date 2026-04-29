"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Search, Users, UserCheck, UserX, Clock, ChevronRight, Download } from "lucide-react";

interface Member {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  membership_start: string | null;
  membership_end: string | null;
  streak_days: number;
  gender: string | null;
  goal: string | null;
  created_at: string;
}

const inputStyle: React.CSSProperties = {
  background: "#0F0F0F",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 9,
  color: "#fff",
  padding: "9px 12px",
  fontSize: 13.5,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

function getMembershipStatus(end: string | null): { label: string; color: string; bg: string } {
  if (!end) return { label: "Tanımsız", color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.06)" };
  const diff = Math.floor((new Date(end).getTime() - Date.now()) / 86400000);
  if (diff < 0) return { label: "Süresi Doldu", color: "#f87171", bg: "rgba(248,113,113,0.15)" };
  if (diff <= 7) return { label: `${diff}g kaldı`, color: "#f59e0b", bg: "rgba(245,158,11,0.15)" };
  return { label: "Aktif", color: "#4ade80", bg: "rgba(74,222,128,0.15)" };
}

export default function UyelerPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filtered, setFiltered] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("members")
        .select("id, full_name, email, phone, membership_start, membership_end, streak_days, gender, goal, created_at")
        .order("created_at", { ascending: false });
      setMembers((data as Member[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    let result = members;
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (m) =>
          (m.full_name ?? "").toLowerCase().includes(s) ||
          (m.email ?? "").toLowerCase().includes(s) ||
          (m.phone ?? "").toLowerCase().includes(s)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((m) => {
        const status = getMembershipStatus(m.membership_end);
        if (statusFilter === "active") return status.label === "Aktif";
        if (statusFilter === "expiring") return status.label.includes("kaldı");
        if (statusFilter === "expired") return status.label === "Süresi Doldu";
        return true;
      });
    }
    setFiltered(result);
  }, [members, search, statusFilter]);

  const total = members.length;
  const active = members.filter((m) => getMembershipStatus(m.membership_end).label === "Aktif").length;
  const expiring = members.filter((m) => getMembershipStatus(m.membership_end).label.includes("kaldı")).length;
  const expired = members.filter((m) => getMembershipStatus(m.membership_end).label === "Süresi Doldu").length;

  const exportCSV = () => {
    const headers = ["Ad Soyad", "E-posta", "Telefon", "Üyelik Başlangıç", "Üyelik Bitiş", "Streak", "Durum"];
    const rows = filtered.map((m) => [
      m.full_name ?? "",
      m.email ?? "",
      m.phone ?? "",
      m.membership_start ?? "",
      m.membership_end ?? "",
      m.streak_days,
      getMembershipStatus(m.membership_end).label,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uyeler-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" }) : "–";

  const statCards = [
    { label: "Toplam Üye", value: total, color: "#D4AF37", icon: <Users size={18} /> },
    { label: "Aktif", value: active, color: "#4ade80", icon: <UserCheck size={18} /> },
    { label: "Yakında Bitecek", value: expiring, color: "#f59e0b", icon: <Clock size={18} /> },
    { label: "Süresi Dolmuş", value: expired, color: "#f87171", icon: <UserX size={18} /> },
  ];

  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
          Üye Yönetimi
        </h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>
          Spor salonu üyelerini yönetin ve takip edin
        </p>
      </div>

      {/* İstatistik kartları */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {statCards.map((s) => (
          <div
            key={s.label}
            style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtreler */}
      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "12px 16px", marginBottom: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
          <input
            type="text"
            placeholder="Ad, e-posta veya telefon ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 32 }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ ...inputStyle, width: "auto", minWidth: 160 }}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="expiring">Yakında Bitecek</option>
          <option value="expired">Süresi Dolmuş</option>
        </select>
        <button
          onClick={exportCSV}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.25)", color: "#D4AF37", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}
        >
          <Download size={14} />
          CSV İndir
        </button>
      </div>

      {/* Tablo */}
      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Ad Soyad", "Telefon", "Üyelik Bitiş", "Streak", "Durum", "Detay"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.05em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
                  Yükleniyor...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
                  Üye bulunamadı
                </td>
              </tr>
            ) : (
              filtered.map((m) => {
                const status = getMembershipStatus(m.membership_end);
                return (
                  <tr key={m.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                        {m.full_name || <span style={{ color: "rgba(255,255,255,0.25)" }}>İsimsiz</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{m.email ?? ""}</div>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                      {m.phone || <span style={{ color: "rgba(255,255,255,0.2)" }}>–</span>}
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                      {formatDate(m.membership_end)}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ fontSize: 13, color: m.streak_days > 0 ? "#f59e0b" : "rgba(255,255,255,0.25)", fontWeight: 600 }}>
                        {m.streak_days > 0 ? `🔥 ${m.streak_days}` : "0"}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ background: status.bg, color: status.color, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <Link
                        href={`/admin/uyeler/${m.id}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", background: "rgba(122,13,37,0.2)", border: "1px solid rgba(122,13,37,0.4)", borderRadius: 7, color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 12 }}
                      >
                        Detay <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
