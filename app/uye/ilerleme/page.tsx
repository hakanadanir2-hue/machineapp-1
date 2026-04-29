"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera, Plus, X } from "lucide-react";

const ANGLES = ["ön", "arka", "yan"] as const;
type Angle = typeof ANGLES[number];

interface Photo {
  id: string;
  photo_url: string;
  angle: Angle;
  taken_at: string;
}

export default function IlerlemePhotoPage() {
  const supabase = createClient();
  const [photos, setPhotos]     = useState<Photo[]>([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedAngle, setSelectedAngle] = useState<Angle>("ön");
  const [memberId, setMemberId] = useState("");
  const [preview, setPreview]   = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setMemberId(session.user.id);
      const { data } = await supabase
        .from("progress_photos")
        .select("id, photo_url, angle, taken_at")
        .eq("member_id", session.user.id)
        .order("taken_at", { ascending: false })
        .limit(30);
      setPhotos((data as Photo[]) ?? []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !memberId) return;
    setUploading(true);

    const ext      = file.name.split(".").pop() ?? "jpg";
    const filePath = `${memberId}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("member-photos")
      .upload(filePath, file);

    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from("member-photos").getPublicUrl(filePath);
      const photoUrl = urlData.publicUrl;

      const { data: inserted } = await supabase
        .from("progress_photos")
        .insert({ member_id: memberId, photo_url: photoUrl, angle: selectedAngle })
        .select()
        .single();

      if (inserted) {
        setPhotos((prev) => [inserted as Photo, ...prev]);
      }
    }

    e.target.value = "";
    setUploading(false);
  }

  // Açılara göre grupla
  const grouped = ANGLES.reduce<Record<Angle, Photo[]>>((acc, a) => {
    acc[a] = photos.filter((p) => p.angle === a);
    return acc;
  }, { ön: [], arka: [], yan: [] });

  if (loading) return <div style={{ color: "rgba(255,255,255,.3)", padding: 40 }}>Yükleniyor...</div>;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 4 }}>İlerleme Fotoğrafları</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>Fiziksel değişimini takip et</p>
      </div>

      {/* Yükleme kutusu */}
      <div style={{ background: "#141414", border: "1px solid rgba(201,168,76,.2)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {ANGLES.map((a) => (
            <button
              key={a}
              onClick={() => setSelectedAngle(a)}
              style={{
                padding: "7px 14px", borderRadius: 9, fontWeight: 600, fontSize: 12,
                background: selectedAngle === a ? "#C9A84C" : "rgba(255,255,255,.06)",
                color: selectedAngle === a ? "#0B0B0B" : "rgba(255,255,255,.5)",
                border: selectedAngle === a ? "none" : "1px solid rgba(255,255,255,.1)",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {a}
            </button>
          ))}
        </div>

        <label style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          padding: "12px 20px", background: "rgba(201,168,76,.08)",
          border: "1px dashed rgba(201,168,76,.3)", borderRadius: 12,
          cursor: uploading ? "not-allowed" : "pointer", color: "#C9A84C",
          fontSize: 14, fontWeight: 600, opacity: uploading ? 0.6 : 1,
        }}>
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} disabled={uploading} />
          {uploading ? (
            "Yükleniyor..."
          ) : (
            <>
              <Camera size={16} />
              {selectedAngle.charAt(0).toUpperCase() + selectedAngle.slice(1)} Fotoğraf Yükle
            </>
          )}
        </label>
      </div>

      {/* Açıya göre foto galerisi */}
      {ANGLES.map((angle) => (
        grouped[angle].length > 0 && (
          <div key={angle} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.5)", textTransform: "capitalize", marginBottom: 12, letterSpacing: "0.05em" }}>
              {angle} — {grouped[angle].length} fotoğraf
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {grouped[angle].map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPreview(p.photo_url)}
                  style={{ aspectRatio: "3/4", borderRadius: 10, overflow: "hidden", cursor: "pointer", position: "relative", background: "#1A1A1A" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.photo_url} alt={angle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "4px 6px", background: "rgba(0,0,0,.6)", fontSize: 10, color: "rgba(255,255,255,.6)" }}>
                    {new Date(p.taken_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {photos.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Camera size={48} color="rgba(255,255,255,.15)" style={{ marginBottom: 16 }} />
          <p style={{ color: "rgba(255,255,255,.35)", fontSize: 14 }}>Henüz fotoğraf yüklenmedi</p>
        </div>
      )}

      {/* Lightbox */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.9)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <button onClick={() => setPreview(null)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", color: "#fff" }}>
            <X size={28} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="preview" style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 12 }} />
        </div>
      )}
    </div>
  );
}
