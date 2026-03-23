"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Eye } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  new: { label: "Yeni", bg: "rgba(248,113,113,0.15)", color: "#f87171" },
  read: { label: "Okundu", bg: "rgba(212,175,55,0.15)", color: "#D4AF37" },
  done: { label: "Tamamlandı", bg: "rgba(74,222,128,0.15)", color: "#4ade80" },
};

export default function ContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewModal, setViewModal] = useState<ContactMessage | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMessages = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("contact_messages")
      .select("id, name, email, phone, subject, message, status, created_at")
      .order("created_at", { ascending: false });
    setMessages(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filtered =
    statusFilter === "all" ? messages : messages.filter((m) => m.status === statusFilter);

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase.from("contact_messages").update({ status }).eq("id", id);
    showToast("Durum güncellendi");
    if (viewModal?.id === id) {
      setViewModal((v) => (v ? { ...v, status } : null));
    }
    fetchMessages();
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("contact_messages").delete().eq("id", id);
    showToast("Mesaj silindi");
    if (viewModal?.id === id) setViewModal(null);
    fetchMessages();
  };

  const openView = async (msg: ContactMessage) => {
    setViewModal(msg);
    if (msg.status === "new") {
      await updateStatus(msg.id, "read");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("tr-TR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = statusConfig[status] ?? statusConfig.new;
    return (
      <span style={{ background: cfg.bg, color: cfg.color, padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
        {cfg.label}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#141414", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", padding: "10px 18px", borderRadius: 10, fontSize: 13, zIndex: 999 }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: 0, marginBottom: 4 }}>İletişim Talepleri</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>
          Formdan gelen mesajları yönetin
        </p>
      </div>

      {/* Status Filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "new", "read", "done"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)",
              background: statusFilter === s ? "#7A0D2A" : "rgba(255,255,255,0.04)",
              color: statusFilter === s ? "#fff" : "rgba(255,255,255,0.45)",
              cursor: "pointer", fontSize: 12.5, fontWeight: statusFilter === s ? 600 : 400,
            }}
          >
            {s === "all" ? "Tümü" : statusConfig[s]?.label ?? s}
            {s !== "all" && (
              <span style={{ marginLeft: 6, opacity: 0.6 }}>
                ({messages.filter((m) => m.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Ad", "E-posta", "Telefon", "Konu", "Mesaj", "Durum", "Tarih", ""].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 28, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Yükleniyor...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 28, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Mesaj bulunamadı</td></tr>
            ) : (
              filtered.map((msg) => (
                <tr
                  key={msg.id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    background: msg.status === "new" ? "rgba(248,113,113,0.02)" : "transparent",
                  }}
                  onClick={() => openView(msg)}
                >
                  <td style={{ padding: "11px 14px", fontSize: 13, color: msg.status === "new" ? "#fff" : "rgba(255,255,255,0.7)", fontWeight: msg.status === "new" ? 600 : 400 }}>
                    {msg.name}
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 12.5, color: "rgba(255,255,255,0.5)" }}>{msg.email}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12.5, color: "rgba(255,255,255,0.4)" }}>{msg.phone || "–"}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12.5, color: "rgba(255,255,255,0.6)", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {msg.subject}
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "rgba(255,255,255,0.35)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {msg.message}
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <StatusBadge status={msg.status} />
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 11.5, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>
                    {formatDate(msg.created_at)}
                  </td>
                  <td style={{ padding: "11px 14px" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openView(msg)}
                      style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.5)", borderRadius: 6, padding: "5px 7px", cursor: "pointer" }}
                      title="Görüntüle"
                    >
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, maxWidth: 560, width: "100%", marginTop: 24, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: 0 }}>Mesaj Detayı</h2>
              <button onClick={() => setViewModal(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {/* Sender Info */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>Ad Soyad</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{viewModal.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>E-posta</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{viewModal.email}</div>
                </div>
                {viewModal.phone && (
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>Telefon</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{viewModal.phone}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>Tarih</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{formatDate(viewModal.created_at)}</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>Konu</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{viewModal.subject}</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>Mesaj</div>
              <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px", fontSize: 13.5, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {viewModal.message}
              </div>
            </div>

            {/* Status Change */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>Durumu Güncelle</div>
              <div style={{ display: "flex", gap: 8 }}>
                {(["new", "read", "done"] as const).map((s) => {
                  const cfg = statusConfig[s];
                  const isActive = viewModal.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => updateStatus(viewModal.id, s)}
                      style={{
                        padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12.5, fontWeight: 600,
                        background: isActive ? cfg.bg : "rgba(255,255,255,0.04)",
                        color: isActive ? cfg.color : "rgba(255,255,255,0.4)",
                        border: isActive ? `1px solid ${cfg.color}40` : "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
              <button
                onClick={() => handleDelete(viewModal.id)}
                style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", padding: "8px 16px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                Mesajı Sil
              </button>
              <button
                onClick={() => setViewModal(null)}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", padding: "8px 16px", borderRadius: 9, cursor: "pointer", fontSize: 13 }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
