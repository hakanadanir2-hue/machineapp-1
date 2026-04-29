"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, Send, Users, UserCheck, Search, CheckCircle } from "lucide-react";

type NotifType = "water" | "renewal" | "birthday" | "trainer_comment" | "info";

interface Member {
  id: string;
  full_name: string | null;
  email: string | null;
  membership_end: string | null;
}

interface SentNotif {
  id: string;
  title: string;
  body: string | null;
  type: NotifType;
  created_at: string;
  member_id: string;
  members: { full_name: string | null } | null;
}

const TYPE_LABELS: Record<NotifType, string> = {
  water: "Su Hatırlatıcı",
  renewal: "Üyelik Yenileme",
  birthday: "Doğum Günü",
  trainer_comment: "Trainer Yorumu",
  info: "Bilgilendirme",
};

const TYPE_COLORS: Record<NotifType, string> = {
  water: "#60a5fa",
  renewal: "#f59e0b",
  birthday: "#a78bfa",
  trainer_comment: "#D4AF37",
  info: "#4ade80",
};

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

export default function BildirimlerPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filtered, setFiltered] = useState<Member[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"bulk" | "single">("bulk");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [notifType, setNotifType] = useState<NotifType>("info");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [recentNotifs, setRecentNotifs] = useState<SentNotif[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const [{ data: m }, { data: n }] = await Promise.all([
        supabase.from("members").select("id, full_name, email, membership_end").order("full_name"),
        supabase
          .from("member_notifications")
          .select("id, title, body, type, created_at, member_id, members(full_name)")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      setMembers((m as Member[]) ?? []);
      setRecentNotifs((n as unknown as SentNotif[]) ?? []);
      setLoading(false);
      setLoadingNotifs(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(members); return; }
    const s = search.toLowerCase();
    setFiltered(members.filter((m) =>
      (m.full_name ?? "").toLowerCase().includes(s) ||
      (m.email ?? "").toLowerCase().includes(s)
    ));
  }, [members, search]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filtered.map((m) => m.id)));
  const clearAll = () => setSelected(new Set());

  const send = async () => {
    if (!title.trim()) return;
    const isBulk = mode === "bulk";
    const targets = isBulk ? members.map((m) => m.id) : [...selected];
    if (targets.length === 0) { showToast("Hedef üye seçiniz", false); return; }
    setSending(true);

    // Web Push + DB kaydı için admin API kullan
    const res = await fetch("/api/admin/send-notification", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(isBulk ? { send_all: true } : { member_id: targets[0] }),
        type:    notifType,
        title:   title.trim(),
        message: body.trim() || undefined,
      }),
    });

    // Toplu seçim için (birden fazla ID) ek kayıtlar
    if (!isBulk && targets.length > 1) {
      const supabase = createClient();
      const extras = targets.slice(1).map((member_id) => ({
        member_id, title: title.trim(), body: body.trim() || null, type: notifType,
      }));
      await supabase.from("member_notifications").insert(extras);
    }

    setSending(false);
    if (res.ok) {
      showToast(`${targets.length} üyeye bildirim gönderildi`);
      setTitle("");
      setBody("");
      setSelected(new Set());
      // Reload recent
      const supabase = createClient();
      const { data: n } = await supabase
        .from("member_notifications")
        .select("id, title, body, type, created_at, member_id, members(full_name)")
        .order("created_at", { ascending: false })
        .limit(20);
      setRecentNotifs((n as unknown as SentNotif[]) ?? []);
    } else {
      const err = await res.json().catch(() => ({}));
      showToast("Hata: " + (err.error ?? res.statusText), false);
    }
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#141414", border: `1px solid ${toast.ok ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`, color: toast.ok ? "#4ade80" : "#f87171", padding: "10px 18px", borderRadius: 10, fontSize: 13, zIndex: 999 }}>
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Bildirim Gönder</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>Üyelere toplu veya tekil bildirim gönderin</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, alignItems: "start" }}>
        {/* Sol: Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Mod seçimi */}
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Gönderme Modu</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setMode("bulk")}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: mode === "bulk" ? "rgba(122,13,37,0.4)" : "rgba(255,255,255,0.04)", border: mode === "bulk" ? "1px solid rgba(212,175,55,0.3)" : "1px solid rgba(255,255,255,0.07)", color: mode === "bulk" ? "#fff" : "rgba(255,255,255,0.4)", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                <Users size={15} /> Tüm Üyeler ({members.length})
              </button>
              <button
                onClick={() => setMode("single")}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: mode === "single" ? "rgba(122,13,37,0.4)" : "rgba(255,255,255,0.04)", border: mode === "single" ? "1px solid rgba(212,175,55,0.3)" : "1px solid rgba(255,255,255,0.07)", color: mode === "single" ? "#fff" : "rgba(255,255,255,0.4)", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                <UserCheck size={15} /> Seçili Üyeler ({selected.size})
              </button>
            </div>
          </div>

          {/* Üye seçimi (single modda) */}
          {mode === "single" && (
            <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Üye Seç</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={selectAll} style={{ fontSize: 11, color: "#D4AF37", background: "none", border: "none", cursor: "pointer" }}>Tümünü Seç</button>
                  <button onClick={clearAll} style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer" }}>Temizle</button>
                </div>
              </div>
              <div style={{ position: "relative", marginBottom: 10 }}>
                <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                <input type="text" placeholder="Üye ara..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 30, fontSize: 13 }} />
              </div>
              <div style={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                {loading ? (
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Yükleniyor...</p>
                ) : filtered.map((m) => (
                  <label key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer", background: selected.has(m.id) ? "rgba(122,13,37,0.2)" : "transparent", border: selected.has(m.id) ? "1px solid rgba(122,13,37,0.3)" : "1px solid transparent" }}>
                    <div
                      onClick={() => toggleSelect(m.id)}
                      style={{ width: 16, height: 16, borderRadius: 4, border: selected.has(m.id) ? "none" : "1px solid rgba(255,255,255,0.2)", background: selected.has(m.id) ? "#7A0D2A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}
                    >
                      {selected.has(m.id) && <CheckCircle size={12} color="#fff" />}
                    </div>
                    <div onClick={() => toggleSelect(m.id)} style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "#fff" }}>{m.full_name || "İsimsiz"}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{m.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Bildirim formu */}
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Bildirim İçeriği</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>Bildirim Türü</label>
              <select value={notifType} onChange={(e) => setNotifType(e.target.value as NotifType)} style={inputStyle}>
                {(Object.keys(TYPE_LABELS) as NotifType[]).map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>Başlık *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="Bildirim başlığı..." />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>Mesaj</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Bildirim mesajı..." style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
            </div>
            <button
              onClick={send}
              disabled={sending || !title.trim()}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 22px", background: sending || !title.trim() ? "#1A1A1A" : "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", color: "#fff", borderRadius: 9, cursor: sending || !title.trim() ? "default" : "pointer", fontWeight: 600, fontSize: 13 }}
            >
              <Send size={14} />
              {sending ? "Gönderiliyor..." : mode === "bulk" ? `Tüm Üyelere Gönder (${members.length})` : `Seçilenlere Gönder (${selected.size})`}
            </button>
          </div>
        </div>

        {/* Sağ: Son bildirimler */}
        <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Bell size={15} color="#D4AF37" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Son Gönderilen</span>
          </div>
          {loadingNotifs ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Yükleniyor...</p>
          ) : recentNotifs.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Henüz bildirim gönderilmedi</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentNotifs.map((n) => (
                <div key={n.id} style={{ background: "#1A1A1A", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", flex: 1, marginRight: 8 }}>{n.title}</span>
                    <span style={{ background: `${TYPE_COLORS[n.type]}18`, color: TYPE_COLORS[n.type], padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
                      {TYPE_LABELS[n.type]}
                    </span>
                  </div>
                  {n.body && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "0 0 4px", lineHeight: 1.4 }}>{n.body}</p>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{n.members?.full_name ?? "–"}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
                      {new Date(n.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
