"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Announcement {
  id: string;
  title: string;
  message: string;
  bg_color: string;
  text_color: string;
  link_url: string;
  link_text: string;
}

export default function AnnouncementBar() {
  const [item, setItem] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sb = createClient();
    const load = async () => {
      const [{ data: setting }, { data: announcements }] = await Promise.all([
        sb.from("site_settings").select("value").eq("key", "announcement_bar_enabled").single(),
        sb.from("announcements")
          .select("id,title,message,bg_color,text_color,link_url,link_text")
          .eq("is_active", true)
          .or("starts_at.is.null,starts_at.lte." + new Date().toISOString())
          .or("ends_at.is.null,ends_at.gte." + new Date().toISOString())
          .order("order_index")
          .limit(1),
      ]);
      if (setting?.value === "true" && announcements && announcements.length > 0) {
        const dismissed_ids = JSON.parse(sessionStorage.getItem("dismissed_announcements") || "[]");
        const first = (announcements as Announcement[]).find(a => !dismissed_ids.includes(a.id));
        if (first) { setItem(first); setEnabled(true); }
      }
    };
    load();
  }, []);

  const dismiss = () => {
    if (!item) return;
    const ids = JSON.parse(sessionStorage.getItem("dismissed_announcements") || "[]");
    sessionStorage.setItem("dismissed_announcements", JSON.stringify([...ids, item.id]));
    setDismissed(true);
  };

  if (!enabled || dismissed || !item) return null;

  return (
    <div style={{ background: item.bg_color || "#7A0D2A", color: item.text_color || "#fff", padding: "9px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 13, fontWeight: 500, position: "relative", zIndex: 60 }}>
      <span><strong>{item.title}</strong> — {item.message}</span>
      {item.link_url && item.link_text && (
        <Link href={item.link_url} style={{ color: item.text_color || "#fff", fontWeight: 700, textDecoration: "underline", fontSize: 13 }}>{item.link_text}</Link>
      )}
      <button onClick={dismiss} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: item.text_color || "#fff", cursor: "pointer", opacity: 0.7, display: "flex", alignItems: "center", padding: 4 }}>
        <X size={14} />
      </button>
    </div>
  );
}
