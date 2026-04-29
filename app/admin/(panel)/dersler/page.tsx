"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X, Users, Calendar, Clock } from "lucide-react";

type ClassType = "boks" | "kickboks" | "muay_thai" | "fitness";

interface GymClass {
  id: string;
  title: string;
  class_type: ClassType;
  instructor: string | null;
  start_time: string;
  duration_min: number;
  capacity: number;
  created_at: string;
}

interface Booking {
  id: string;
  class_id: string;
  member_id: string;
  booked_at: string;
  members: { full_name: string | null; email: string | null } | null;
}

const CLASS_TYPE_LABELS: Record<ClassType, string> = {
  boks: "Boks",
  kickboks: "Kickboks",
  muay_thai: "Muay Thai",
  fitness: "Fitness",
};

const CLASS_COLORS: Record<ClassType, string> = {
  boks: "#f87171",
  kickboks: "#f59e0b",
  muay_thai: "#a78bfa",
  fitness: "#4ade80",
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

const emptyForm = {
  title: "",
  class_type: "fitness" as ClassType,
  instructor: "",
  start_time: "",
  duration_min: 60,
  capacity: 20,
};

export default function DerslerPage() {
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<GymClass | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [participantsClass, setParticipantsClass] = useState<GymClass | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchClasses = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("gym_classes")
      .select("*")
      .order("start_time", { ascending: false });
    setClasses((data as GymClass[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchClasses(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (c: GymClass) => {
    setEditItem(c);
    setForm({
      title: c.title,
      class_type: c.class_type,
      instructor: c.instructor ?? "",
      start_time: c.start_time.slice(0, 16),
      duration_min: c.duration_min,
      capacity: c.capacity,
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.title || !form.start_time) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      title: form.title,
      class_type: form.class_type,
      instructor: form.instructor || null,
      start_time: form.start_time,
      duration_min: Number(form.duration_min),
      capacity: Number(form.capacity),
    };
    const { error } = editItem
      ? await supabase.from("gym_classes").update(payload).eq("id", editItem.id)
      : await supabase.from("gym_classes").insert(payload);
    setSaving(false);
    if (!error) {
      showToast(editItem ? "Ders güncellendi" : "Ders oluşturuldu");
      setShowModal(false);
      fetchClasses();
    } else {
      showToast("Hata: " + error.message, false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const supabase = createClient();
    const { error } = await supabase.from("gym_classes").delete().eq("id", deleteId);
    setDeleteId(null);
    if (!error) { showToast("Ders silindi"); fetchClasses(); }
    else showToast("Hata: " + error.message, false);
  };

  const openParticipants = async (c: GymClass) => {
    setParticipantsClass(c);
    setLoadingBookings(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("class_bookings")
      .select("id, class_id, member_id, booked_at, members(full_name, email)")
      .eq("class_id", c.id)
      .order("booked_at");
    setBookings((data as unknown as Booking[]) ?? []);
    setLoadingBookings(false);
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ maxWidth: 1100 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#141414", border: `1px solid ${toast.ok ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`, color: toast.ok ? "#4ade80" : "#f87171", padding: "10px 18px", borderRadius: 10, fontSize: 13, zIndex: 999 }}>
          {toast.msg}
        </div>
      )}

      {/* Başlık */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Ders Yönetimi</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>Grup dersleri oluştur, düzenle ve katılımcıları yönet</p>
        </div>
        <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", color: "#fff", borderRadius: 9, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
          <Plus size={15} /> Yeni Ders
        </button>
      </div>

      {/* İstatistikler */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {(["boks", "kickboks", "muay_thai", "fitness"] as ClassType[]).map((t) => {
          const cnt = classes.filter((c) => c.class_type === t).length;
          return (
            <div key={t} style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: CLASS_COLORS[t], flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{cnt}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{CLASS_TYPE_LABELS[t]}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ders Listesi */}
      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Ders Adı", "Tür", "Eğitmen", "Başlangıç", "Süre", "Kapasite", "İşlem"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Yükleniyor...</td></tr>
            ) : classes.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Henüz ders eklenmedi</td></tr>
            ) : (
              classes.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: "#fff" }}>{c.title}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ background: `${CLASS_COLORS[c.class_type]}18`, color: CLASS_COLORS[c.class_type], padding: "2px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                      {CLASS_TYPE_LABELS[c.class_type]}
                    </span>
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                    {c.instructor || <span style={{ color: "rgba(255,255,255,0.2)" }}>–</span>}
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>{fmt(c.start_time)}</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{c.duration_min} dk</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{c.capacity} kişi</td>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openParticipants(c)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 9px", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 7, color: "#60a5fa", cursor: "pointer", fontSize: 11 }}>
                        <Users size={12} /> Katılımcılar
                      </button>
                      <button onClick={() => openEdit(c)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.5)", borderRadius: 6, padding: "5px 7px", cursor: "pointer" }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDeleteId(c.id)} style={{ background: "rgba(248,113,113,0.1)", border: "none", color: "#f87171", borderRadius: 6, padding: "5px 7px", cursor: "pointer" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Oluştur/Düzenle Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, maxWidth: 500, width: "100%", marginTop: 24, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: 0 }}>{editItem ? "Dersi Düzenle" : "Yeni Ders"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>Ders Adı *</label>
                <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={inputStyle} placeholder="Örn: Sabah Boks Dersi" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>Ders Türü</label>
                <select value={form.class_type} onChange={(e) => setForm((f) => ({ ...f, class_type: e.target.value as ClassType }))} style={inputStyle}>
                  {(Object.keys(CLASS_TYPE_LABELS) as ClassType[]).map((t) => (
                    <option key={t} value={t}>{CLASS_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>Eğitmen</label>
                <input type="text" value={form.instructor} onChange={(e) => setForm((f) => ({ ...f, instructor: e.target.value }))} style={inputStyle} placeholder="Eğitmen adı" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>Başlangıç Zamanı *</label>
                <input type="datetime-local" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>Süre (dk)</label>
                  <input type="number" value={form.duration_min} onChange={(e) => setForm((f) => ({ ...f, duration_min: Number(e.target.value) }))} style={inputStyle} min={15} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>Kapasite</label>
                  <input type="number" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))} style={inputStyle} min={1} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
              <button onClick={() => setShowModal(false)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", padding: "8px 16px", borderRadius: 9, cursor: "pointer", fontSize: 13 }}>İptal</button>
              <button onClick={save} disabled={saving || !form.title || !form.start_time} style={{ background: saving ? "#1A1A1A" : "#7A0D2A", border: "1px solid rgba(212,175,55,0.3)", color: "#fff", padding: "8px 18px", borderRadius: 9, cursor: saving ? "default" : "pointer", fontWeight: 600, fontSize: 13 }}>
                {saving ? "Kaydediliyor..." : editItem ? "Güncelle" : "Oluştur"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Katılımcılar Modal */}
      {participantsClass && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, maxWidth: 520, width: "100%", marginTop: 24, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: "0 0 4px" }}>{participantsClass.title}</h2>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>
                  {new Date(participantsClass.start_time).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} • {participantsClass.duration_min} dk
                </p>
              </div>
              <button onClick={() => setParticipantsClass(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ background: "#1A1A1A", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>KAYITLI</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{bookings.length}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>KAPASİTE</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{participantsClass.capacity}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>DOLULUK</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: bookings.length >= participantsClass.capacity ? "#f87171" : "#4ade80" }}>
                  {Math.round((bookings.length / participantsClass.capacity) * 100)}%
                </div>
              </div>
            </div>
            {loadingBookings ? (
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Yükleniyor...</p>
            ) : bookings.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Henüz kayıt yok</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {bookings.map((b) => (
                  <div key={b.id} style={{ background: "#1E1E1E", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{b.members?.full_name || "İsimsiz"}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{b.members?.email}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                      {new Date(b.booked_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Silme Onayı */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, maxWidth: 360, width: "100%", padding: 28, textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={20} color="#f87171" />
            </div>
            <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>Dersi Sil</h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 24px" }}>Bu dersi ve tüm rezervasyonları kalıcı olarak silmek istediğinize emin misiniz?</p>
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
