"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  TrendingUp, TrendingDown, Users, CreditCard, Download,
  BarChart3, Calendar, CheckCircle, Clock, XCircle,
} from "lucide-react";

interface Member {
  id: string;
  full_name: string | null;
  email: string | null;
  membership_end: string | null;
  membership_start: string | null;
  created_at: string;
}

interface Order {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  user_id?: string | null;
}

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
  members: number;
}

function getMembershipStatus(end: string | null): "active" | "expiring" | "expired" | "none" {
  if (!end) return "none";
  const diff = Math.floor((new Date(end).getTime() - Date.now()) / 86400000);
  if (diff < 0) return "expired";
  if (diff <= 14) return "expiring";
  return "active";
}

// ─── Mini Bar Chart ──────────────────────────────────────────────────────────
function BarChart({ data, color = "#D4AF37", height = 80 }: { data: number[]; color?: string; height?: number }) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height }}>
      {data.map((v, i) => (
        <div
          key={i}
          title={`${v}`}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            minHeight: 3,
            background: color,
            opacity: i === data.length - 1 ? 1 : 0.4 + (i / data.length) * 0.4,
            borderRadius: "3px 3px 0 0",
            transition: "height 0.3s",
          }}
        />
      ))}
    </div>
  );
}

// ─── Line Chart (SVG) ────────────────────────────────────────────────────────
function LineChart({ data, color = "#D4AF37", h = 80, w = 320 }: { data: number[]; color?: string; h?: number; w?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth={2} points={pts} strokeLinejoin="round" />
    </svg>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#141414",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  padding: "20px 22px",
};

export default function MaliPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: m }, { data: o }] = await Promise.all([
        supabase.from("members").select("id, full_name, email, membership_end, membership_start, created_at").order("created_at", { ascending: false }),
        supabase.from("orders").select("id, amount, status, created_at, user_id").order("created_at", { ascending: false }).limit(200),
      ]);
      const memberList = (m as Member[]) ?? [];
      const orderList = (o as Order[]) ?? [];
      setMembers(memberList);
      setOrders(orderList);
      // Aylık veri hesapla (son 12 ay)
      const monthly: MonthlyData[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const yr = d.getFullYear(), mo = d.getMonth();
        const label = d.toLocaleDateString("tr-TR", { month: "short", year: "2-digit" });
        const revenue = orderList
          .filter((o) => {
            const od = new Date(o.created_at);
            return od.getFullYear() === yr && od.getMonth() === mo && o.status === "paid";
          })
          .reduce((sum, o) => sum + (o.amount ?? 0), 0);
        const ordersCount = orderList.filter((o) => {
          const od = new Date(o.created_at);
          return od.getFullYear() === yr && od.getMonth() === mo;
        }).length;
        const newMembers = memberList.filter((mem) => {
          const md = new Date(mem.created_at);
          return md.getFullYear() === yr && md.getMonth() === mo;
        }).length;
        monthly.push({ month: label, revenue, orders: ordersCount, members: newMembers });
      }
      setMonthlyData(monthly);
      setLoading(false);
    }
    load();
  }, []);

  const totalRevenue = orders.filter((o) => o.status === "paid").reduce((s, o) => s + (o.amount ?? 0), 0);
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.status === "paid").length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => getMembershipStatus(m.membership_end) === "active").length;
  const expiringMembers = members.filter((m) => getMembershipStatus(m.membership_end) === "expiring").length;
  const expiredMembers = members.filter((m) => getMembershipStatus(m.membership_end) === "expired").length;
  const activeMemberRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

  // Geçen aya göre karşılaştırma
  const thisMonth = monthlyData[monthlyData.length - 1];
  const lastMonth = monthlyData[monthlyData.length - 2];
  const revenueDiff = thisMonth && lastMonth ? thisMonth.revenue - lastMonth.revenue : 0;
  const revenuePct = lastMonth && lastMonth.revenue > 0 ? Math.round((revenueDiff / lastMonth.revenue) * 100) : 0;

  // Yıllık toplamlar
  const yearlyRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0);
  const yearlyOrders = monthlyData.reduce((s, m) => s + m.orders, 0);
  const revenueData = monthlyData.map((m) => m.revenue);
  const membersData = monthlyData.map((m) => m.members);

  const fmt = (n: number) =>
    n.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" }) : "–";

  const exportCSV = (type: "members" | "orders") => {
    let csv = "";
    if (type === "members") {
      const headers = ["Ad Soyad", "E-posta", "Üyelik Başlangıcı", "Üyelik Bitişi", "Durum", "Kayıt Tarihi"];
      const rows = members.map((m) => [
        m.full_name ?? "",
        m.email ?? "",
        m.membership_start ?? "",
        m.membership_end ?? "",
        getMembershipStatus(m.membership_end),
        m.created_at,
      ]);
      csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    } else {
      const headers = ["ID", "Tutar", "Durum", "Tarih"];
      const rows = orders.map((o) => [o.id, o.amount, o.status, o.created_at]);
      csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    }
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Başlık */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
            Mali Dashboard
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>
            Gelir, gider ve üyelik finansal raporu
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => exportCSV("members")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", color: "#D4AF37", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            <Download size={13} /> Üyeler CSV
          </button>
          <button onClick={() => exportCSV("orders")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            <Download size={13} /> Siparişler CSV
          </button>
        </div>
      </div>

      {/* Ana İstatistik Kartları */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          {
            label: "Toplam Gelir (12 ay)",
            value: loading ? "–" : fmt(yearlyRevenue),
            sub: `Bu ay: ${loading ? "–" : fmt(thisMonth?.revenue ?? 0)}`,
            color: "#D4AF37",
            icon: <TrendingUp size={20} />,
            trend: revenuePct,
          },
          {
            label: "Toplam Sipariş",
            value: loading ? "–" : totalOrders.toString(),
            sub: `Ödenen: ${paidOrders} | Bekleyen: ${pendingOrders}`,
            color: "#60a5fa",
            icon: <CreditCard size={20} />,
            trend: null,
          },
          {
            label: "Toplam Üye",
            value: loading ? "–" : totalMembers.toString(),
            sub: `Aktif üyelik oranı: %${activeMemberRate}`,
            color: "#4ade80",
            icon: <Users size={20} />,
            trend: null,
          },
          {
            label: "Üyelik Durumu",
            value: loading ? "–" : `${activeMembers} Aktif`,
            sub: `${expiringMembers} bitecek | ${expiredMembers} dolmuş`,
            color: activeMembers > expiredMembers ? "#4ade80" : "#f87171",
            icon: <BarChart3 size={20} />,
            trend: null,
          },
        ].map((card) => (
          <div key={card.label} style={{ ...cardStyle }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${card.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: card.color }}>
                {card.icon}
              </div>
              {card.trend !== null && (
                <span style={{ fontSize: 11, fontWeight: 700, color: card.trend >= 0 ? "#4ade80" : "#f87171", display: "flex", alignItems: "center", gap: 2 }}>
                  {card.trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {card.trend >= 0 ? "+" : ""}{card.trend}%
                </span>
              )}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{card.value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{card.label}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Grafik Satırı */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Gelir grafiği */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Aylık Gelir Trendi</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Son 12 ay</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#D4AF37" }}>{fmt(yearlyRevenue)}</div>
          </div>
          {loading ? (
            <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Yükleniyor...</span>
            </div>
          ) : (
            <div>
              <BarChart data={revenueData} color="#D4AF37" height={80} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{monthlyData[0]?.month}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{monthlyData[monthlyData.length - 1]?.month}</span>
              </div>
            </div>
          )}
          {/* Önceki ay karşılaştırma */}
          {!loading && thisMonth && lastMonth && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
              <div style={{ background: "#1A1A1A", borderRadius: 9, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Bu Ay</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#D4AF37" }}>{fmt(thisMonth.revenue)}</div>
              </div>
              <div style={{ background: "#1A1A1A", borderRadius: 9, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Geçen Ay</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "rgba(255,255,255,0.5)" }}>{fmt(lastMonth.revenue)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Üye artışı */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Yeni Üye Kazanımı</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Son 12 ay</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#4ade80" }}>{totalMembers} toplam</div>
          </div>
          {loading ? (
            <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Yükleniyor...</span>
            </div>
          ) : (
            <div>
              <BarChart data={membersData} color="#4ade80" height={80} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{monthlyData[0]?.month}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{monthlyData[monthlyData.length - 1]?.month}</span>
              </div>
            </div>
          )}
          {/* Üyelik dağılım */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 14 }}>
            {[
              { label: "Aktif", value: activeMembers, color: "#4ade80" },
              { label: "Bitecek", value: expiringMembers, color: "#f59e0b" },
              { label: "Dolmuş", value: expiredMembers, color: "#f87171" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#1A1A1A", borderRadius: 9, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aylık Karşılaştırma Tablosu */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Aylık/Yıllık Karşılaştırma</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setViewMode("monthly")} style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, border: viewMode === "monthly" ? "1px solid rgba(212,175,55,0.4)" : "1px solid rgba(255,255,255,0.07)", background: viewMode === "monthly" ? "rgba(212,175,55,0.1)" : "transparent", color: viewMode === "monthly" ? "#D4AF37" : "rgba(255,255,255,0.4)", cursor: "pointer" }}>
              Aylık
            </button>
            <button onClick={() => setViewMode("yearly")} style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, border: viewMode === "yearly" ? "1px solid rgba(212,175,55,0.4)" : "1px solid rgba(255,255,255,0.07)", background: viewMode === "yearly" ? "rgba(212,175,55,0.1)" : "transparent", color: viewMode === "yearly" ? "#D4AF37" : "rgba(255,255,255,0.4)", cursor: "pointer" }}>
              Yıllık Özet
            </button>
          </div>
        </div>
        {viewMode === "monthly" ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Ay", "Gelir", "Sipariş", "Yeni Üye", "Değişim"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...monthlyData].reverse().map((row, i, arr) => {
                const prev = arr[i + 1];
                const pct = prev && prev.revenue > 0 ? Math.round(((row.revenue - prev.revenue) / prev.revenue) * 100) : null;
                return (
                  <tr key={row.month} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "9px 12px", fontSize: 13, color: i === 0 ? "#fff" : "rgba(255,255,255,0.55)", fontWeight: i === 0 ? 700 : 400 }}>{row.month}</td>
                    <td style={{ padding: "9px 12px", fontSize: 13, color: "#D4AF37", fontWeight: 700 }}>{fmt(row.revenue)}</td>
                    <td style={{ padding: "9px 12px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{row.orders}</td>
                    <td style={{ padding: "9px 12px", fontSize: 13, color: "#4ade80" }}>{row.members > 0 ? `+${row.members}` : "0"}</td>
                    <td style={{ padding: "9px 12px" }}>
                      {pct !== null ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: pct >= 0 ? "#4ade80" : "#f87171" }}>
                          {pct >= 0 ? "+" : ""}{pct}%
                        </span>
                      ) : <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>–</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[
              { label: "Yıllık Gelir", value: fmt(yearlyRevenue), color: "#D4AF37", icon: <TrendingUp size={20} /> },
              { label: "Yıllık Sipariş", value: yearlyOrders.toString(), color: "#60a5fa", icon: <CreditCard size={20} /> },
              { label: "Yıllık Yeni Üye", value: monthlyData.reduce((s, m) => s + m.members, 0).toString(), color: "#4ade80", icon: <Users size={20} /> },
            ].map((card) => (
              <div key={card.label} style={{ background: "#1A1A1A", borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${card.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: card.color }}>
                  {card.icon}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{card.value}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{card.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Üyelik Ödemeleri Takibi */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Üyelik Durumu Takibi</div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{members.length} üye</span>
        </div>
        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Yükleniyor...</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Üye", "Üyelik Başlangıcı", "Üyelik Bitişi", "Süre (gün)", "Durum"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.slice(0, 25).map((m) => {
                const st = getMembershipStatus(m.membership_end);
                const diff = m.membership_end
                  ? Math.floor((new Date(m.membership_end).getTime() - Date.now()) / 86400000)
                  : null;
                const stConf: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
                  active: { label: "Aktif", color: "#4ade80", bg: "rgba(74,222,128,0.15)", icon: <CheckCircle size={11} /> },
                  expiring: { label: "Bitecek", color: "#f59e0b", bg: "rgba(245,158,11,0.15)", icon: <Clock size={11} /> },
                  expired: { label: "Dolmuş", color: "#f87171", bg: "rgba(248,113,113,0.15)", icon: <XCircle size={11} /> },
                  none: { label: "Tanımsız", color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.06)", icon: null },
                };
                const conf = stConf[st];
                return (
                  <tr key={m.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "9px 12px" }}>
                      <div style={{ fontSize: 13, color: "#fff" }}>{m.full_name || "İsimsiz"}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{m.email}</div>
                    </td>
                    <td style={{ padding: "9px 12px", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{fmtDate(m.membership_start)}</td>
                    <td style={{ padding: "9px 12px", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{fmtDate(m.membership_end)}</td>
                    <td style={{ padding: "9px 12px", fontSize: 13, color: diff !== null ? (diff < 0 ? "#f87171" : diff <= 14 ? "#f59e0b" : "rgba(255,255,255,0.5)") : "rgba(255,255,255,0.2)" }}>
                      {diff !== null ? (diff < 0 ? `${Math.abs(diff)} gün önce doldu` : `${diff} gün kaldı`) : "–"}
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: conf.bg, color: conf.color, padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                        {conf.icon}{conf.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {members.length > 25 && (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 12, textAlign: "center" }}>
            İlk 25 üye gösteriliyor. Tamamı için CSV indirin.
          </p>
        )}
      </div>
    </div>
  );
}
