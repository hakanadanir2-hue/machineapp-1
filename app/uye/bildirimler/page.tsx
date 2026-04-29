"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, Check, CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  type: string;
  read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
  water:            "💧",
  renewal:          "⏰",
  birthday:         "🎂",
  trainer_comment:  "💬",
  info:             "ℹ️",
};

const TYPE_COLORS: Record<string, string> = {
  water:           "#60a5fa",
  renewal:         "#f97316",
  birthday:        "#f472b6",
  trainer_comment: "#C9A84C",
  info:            "rgba(255,255,255,.4)",
};

export default function BildirimlerPage() {
  const supabase = createClient();
  const [notifs, setNotifs]   = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setMemberId(session.user.id);
      const { data } = await supabase
        .from("member_notifications")
        .select("*")
        .eq("member_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setNotifs((data as Notification[]) ?? []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function markRead(id: string) {
    await supabase.from("member_notifications").update({ read: true }).eq("id", id);
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllRead() {
    await supabase.from("member_notifications").update({ read: true }).eq("member_id", memberId).eq("read", false);
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unread = notifs.filter((n) => !n.read).length;

  if (loading) return <div style={{ color: "rgba(255,255,255,.3)", padding: 40 }}>Yükleniyor...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Bildirimler</h1>
          {unread > 0 && (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>{unread} okunmamış bildirim</p>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
            background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.25)",
            borderRadius: 9, color: "#C9A84C", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>
            <CheckCheck size={13} />
            Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Bell size={48} color="rgba(255,255,255,.15)" style={{ marginBottom: 16 }} />
          <p style={{ color: "rgba(255,255,255,.35)", fontSize: 14 }}>Henüz bildirim yok</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notifs.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              style={{
                background: n.read ? "#141414" : "rgba(201,168,76,.05)",
                border: `1px solid ${n.read ? "rgba(255,255,255,.07)" : "rgba(201,168,76,.2)"}`,
                borderRadius: 12, padding: "14px 16px",
                display: "flex", alignItems: "flex-start", gap: 12,
                cursor: n.read ? "default" : "pointer",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                background: `${TYPE_COLORS[n.type] ?? "rgba(255,255,255,.1)"}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>
                {TYPE_ICONS[n.type] ?? "🔔"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: "#fff" }}>{n.title}</span>
                  {!n.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A84C", flexShrink: 0 }} />}
                </div>
                {n.body && <p style={{ fontSize: 12, color: "rgba(255,255,255,.45)", lineHeight: 1.5, margin: 0 }}>{n.body}</p>}
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 6 }}>
                  {new Date(n.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              {n.read && <Check size={14} color="rgba(255,255,255,.2)" style={{ flexShrink: 0, marginTop: 2 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
