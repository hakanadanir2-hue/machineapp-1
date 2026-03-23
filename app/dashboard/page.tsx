"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ClipboardList, Plus, User } from "lucide-react";

interface Stats {
  total: number;
  pending: number;
  approved: number;
  active: number;
}

export default function DashboardPage() {
  const supabase = createClient();
  const [stats, setStats]   = useState<Stats>({ total: 0, pending: 0, approved: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setUserName(session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "");

      const { data } = await supabase
        .from("programs")
        .select("status")
        .eq("user_id", session.user.id);

      if (data) {
        setStats({
          total:    data.length,
          pending:  data.filter((p) => p.status === "pending").length,
          approved: data.filter((p) => p.status === "approved").length,
          active:   data.filter((p) => p.status === "active").length,
        });
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
          Merhaba{userName ? `, ${userName.split(" ")[0]}` : ""} 👋
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>
          Kişisel fitness paneline hoş geldin
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Toplam Program",    value: loading ? "—" : stats.total,    color: "#fff" },
          { label: "Onay Bekliyor",     value: loading ? "—" : stats.pending,   color: "#facc15" },
          { label: "Onaylandı",         value: loading ? "—" : stats.approved,  color: "#4ade80" },
          { label: "Aktif Program",     value: loading ? "—" : stats.active,    color: "#60a5fa" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#141414", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
        <Link href="/dashboard/programlarim" style={{ textDecoration: "none" }}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "20px", cursor: "pointer", transition: "border-color .15s", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ width: 40, height: 40, background: "rgba(96,165,250,.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ClipboardList size={20} color="#60a5fa" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 3 }}>Programlarım</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", lineHeight: 1.5 }}>AI tarafından oluşturulan kişisel programlarını görüntüle</div>
            </div>
          </div>
        </Link>

        <Link href="/program-basvuru" style={{ textDecoration: "none" }}>
          <div style={{ background: "rgba(122,13,42,.15)", border: "1px solid rgba(122,13,42,.3)", borderRadius: 14, padding: "20px", cursor: "pointer", transition: "border-color .15s", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ width: 40, height: 40, background: "rgba(122,13,42,.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Plus size={20} color="#f87171" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 3 }}>Yeni Program Al</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", lineHeight: 1.5 }}>Fiziksel verilerini gir, AI kişisel programını hazırlasın</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Info card */}
      <div style={{ marginTop: 20, background: "rgba(96,165,250,.05)", border: "1px solid rgba(96,165,250,.1)", borderRadius: 14, padding: "16px 18px", display: "flex", gap: 12 }}>
        <User size={20} color="rgba(96,165,250,.6)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Nasıl çalışır?</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.7 }}>
            1. <strong style={{ color: "rgba(255,255,255,.6)" }}>Başvuru yap</strong> — fiziksel bilgilerini ve hedeflerini gir<br />
            2. <strong style={{ color: "rgba(255,255,255,.6)" }}>AI programını hazırlar</strong> — 885 egzersizlik kütüphaneden sana özel seçim<br />
            3. <strong style={{ color: "rgba(255,255,255,.6)" }}>Admin onaylar</strong> — uzman gözetiminde güvenlik kontrolü<br />
            4. <strong style={{ color: "rgba(255,255,255,.6)" }}>Programını uygula</strong> — beslenme planıyla birlikte tam rehber
          </div>
        </div>
      </div>
    </div>
  );
}
