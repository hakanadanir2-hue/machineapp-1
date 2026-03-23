"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pencil, Trash2, X, Search } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  admin_note: string | null;
  membership_type: string | null;
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

const btnPrimary: React.CSSProperties = {
  background: "#7A0D2A",
  border: "1px solid rgba(212,175,55,0.3)",
  color: "#fff",
  padding: "8px 16px",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Süper Admin",
  admin: "Admin",
  editor: "Editör",
  support: "Destek",
  user: "Kullanıcı",
};

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  super_admin: { bg: "rgba(212,175,55,0.2)", color: "#D4AF37" },
  admin: { bg: "rgba(212,175,55,0.12)", color: "#c9a227" },
  editor: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
  support: { bg: "rgba(168,85,247,0.15)", color: "#c084fc" },
  user: { bg: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)" },
};

const MEMBERSHIP_LABELS: Record<string, string> = {
  free: "Ücretsiz",
  monthly: "Aylık",
  quarterly: "3 Aylık",
  semi_annual: "6 Aylık",
  annual: "Yıllık",
  pt: "PT",
};

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editModal, setEditModal] = useState<Profile | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [editFullName, setEditFullName] = useState("");
  const [editRole, setEditRole] = useState("user");
  const [editActive, setEditActive] = useState(true);
  const [editNote, setEditNote] = useState("");
  const [editMembership, setEditMembership] = useState("free");

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchProfiles = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, is_active, admin_note, membership_type, created_at")
      .order("created_at", { ascending: false });
    setProfiles(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    let result = profiles;
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (p) =>
          (p.email ?? "").toLowerCase().includes(s) ||
          (p.full_name ?? "").toLowerCase().includes(s)
      );
    }
    if (roleFilter !== "all") {
      result = result.filter((p) => p.role === roleFilter);
    }
    setFiltered(result);
  }, [profiles, search, roleFilter]);

  const total = profiles.length;
  const activeCount = profiles.filter((p) => p.is_active).length;
  const roleCounts = profiles.reduce<Record<string, number>>((acc, p) => {
    acc[p.role] = (acc[p.role] || 0) + 1;
    return acc;
  }, {});

  const openEdit = (p: Profile) => {
    setEditModal(p);
    setEditFullName(p.full_name ?? "");
    setEditRole(p.role);
    setEditActive(p.is_active);
    setEditNote(p.admin_note ?? "");
    setEditMembership(p.membership_type ?? "free");
  };

  const saveEdit = async () => {
    if (!editModal) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editFullName,
        role: editRole,
        is_active: editActive,
        admin_note: editNote,
        membership_type: editMembership,
      })
      .eq("id", editModal.id);
    setSaving(false);
    if (!error) {
      showToast("Kullanıcı güncellendi");
      setEditModal(null);
      fetchProfiles();
    } else {
      showToast("Hata: " + error.message, false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const supabase = createClient();
    const { error } = await supabase.from("profiles").delete().eq("id", deleteId);
    setDeleteId(null);
    if (!error) {
      showToast("Kullanıcı silindi");
      fetchProfiles();
    } else {
      showToast("Hata: " + error.message, false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });

  const statCards = [
    { label: "Toplam Üye", value: total },
    { label: "Aktif", value: activeCount },
    { label: "Admin", value: (roleCounts["admin"] || 0) + (roleCounts["super_admin"] || 0) },
    { label: "Editör", value: roleCounts["editor"] || 0 },
  ];

  return (
    <div style={{ maxWidth: 1140 }}>
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#141414",
            border: `1px solid ${toast.ok ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`,
            color: toast.ok ? "#4ade80" : "#f87171",
            padding: "10px 18px",
            borderRadius: 10,
            fontSize: 13,
            zIndex: 999,
          }}
        >
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: 0, marginBottom: 4 }}>
          Kullanıcılar
        </h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>
          Kayıtlı üyeleri ve rolleri yönetin
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {statCards.map((s) => (
          <div
            key={s.label}
            style={{
              background: "#141414",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              padding: "16px 18px",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: "#D4AF37" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: "14px 18px",
          marginBottom: 14,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
          <input
            type="text"
            placeholder="E-posta veya isim ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 32 }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ ...inputStyle, width: "auto", minWidth: 150 }}
        >
          <option value="all">Tüm Roller</option>
          <option value="super_admin">Süper Admin</option>
          <option value="admin">Admin</option>
          <option value="editor">Editör</option>
          <option value="support">Destek</option>
          <option value="user">Kullanıcı</option>
        </select>
      </div>

      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Ad Soyad", "E-posta", "Rol", "Üyelik", "Durum", "Kayıt Tarihi", "İşlem"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.05em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
                  Yükleniyor...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
                  Kullanıcı bulunamadı
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const rc = ROLE_COLORS[p.role] ?? ROLE_COLORS["user"];
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "11px 14px", fontSize: 13, color: "#fff" }}>
                      {p.full_name || <span style={{ color: "rgba(255,255,255,0.25)" }}>–</span>}
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{p.email}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ background: rc.bg, color: rc.color, padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                        {ROLE_LABELS[p.role] ?? p.role}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                      {p.membership_type ? (MEMBERSHIP_LABELS[p.membership_type] ?? p.membership_type) : <span style={{ color: "rgba(255,255,255,0.2)" }}>–</span>}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span
                        style={{
                          background: p.is_active ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)",
                          color: p.is_active ? "#4ade80" : "#f87171",
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {p.is_active ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                      {formatDate(p.created_at)}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => openEdit(p)}
                          style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.5)", borderRadius: 6, padding: "5px 7px", cursor: "pointer" }}
                          title="Düzenle"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          style={{ background: "rgba(248,113,113,0.1)", border: "none", color: "#f87171", borderRadius: 6, padding: "5px 7px", cursor: "pointer" }}
                          title="Sil"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, maxWidth: 480, width: "100%", marginTop: 24, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: 0 }}>Kullanıcı Düzenle</h2>
              <button onClick={() => setEditModal(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>E-posta</div>
              <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)" }}>{editModal.email}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>Ad Soyad</label>
              <input
                type="text"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                style={inputStyle}
                placeholder="Ad soyad giriniz"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>Rol</label>
              <select value={editRole} onChange={(e) => setEditRole(e.target.value)} style={inputStyle}>
                <option value="user">Kullanıcı</option>
                <option value="support">Destek</option>
                <option value="editor">Editör</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Süper Admin</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>Üyelik Tipi</label>
              <select value={editMembership} onChange={(e) => setEditMembership(e.target.value)} style={inputStyle}>
                <option value="free">Ücretsiz</option>
                <option value="monthly">Aylık</option>
                <option value="quarterly">3 Aylık</option>
                <option value="semi_annual">6 Aylık</option>
                <option value="annual">Yıllık</option>
                <option value="pt">PT</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>Hesap Durumu</label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div
                  onClick={() => setEditActive((a) => !a)}
                  style={{
                    width: 40,
                    height: 22,
                    borderRadius: 11,
                    background: editActive ? "#7A0D2A" : "rgba(255,255,255,0.1)",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    border: editActive ? "1px solid rgba(212,175,55,0.3)" : "1px solid rgba(255,255,255,0.1)",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      left: editActive ? 19 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left 0.15s",
                    }}
                  />
                </div>
                <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)" }}>
                  {editActive ? "Hesap Aktif" : "Hesap Pasif"}
                </span>
              </label>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>Admin Notu</label>
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                rows={3}
                placeholder="Dahili not (kullanıcıya gösterilmez)..."
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setEditModal(null)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", padding: "8px 16px", borderRadius: 9, cursor: "pointer", fontSize: 13 }}>
                İptal
              </button>
              <button onClick={saveEdit} disabled={saving} style={btnPrimary}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, maxWidth: 380, width: "100%", padding: 28, textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={20} color="#f87171" />
            </div>
            <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>Kullanıcıyı Sil</h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 24px" }}>Bu kullanıcıyı profilden kalıcı olarak silmek istediğinize emin misiniz?</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setDeleteId(null)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", padding: "8px 20px", borderRadius: 9, cursor: "pointer", fontSize: 13 }}>İptal</button>
              <button onClick={confirmDelete} style={{ background: "rgba(220,38,38,0.8)", border: "none", color: "#fff", padding: "8px 20px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
