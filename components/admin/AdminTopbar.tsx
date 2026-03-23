"use client";
import React from "react";
import { Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AdminTopbarProps {
  onMenuToggle: () => void;
}

export default function AdminTopbar({ onMenuToggle }: AdminTopbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        height: 56,
        background: "#111111",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        zIndex: 50,
      }}
    >
      <button
        onClick={onMenuToggle}
        style={{
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          color: "rgba(255,255,255,0.6)",
          cursor: "pointer",
          padding: "6px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s",
        }}
        title="Menü"
      >
        <Menu size={18} />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.03em",
          }}
        >
          Machine Gym Admin
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: "rgba(122,13,37,0.15)",
            border: "1px solid rgba(122,13,37,0.4)",
            borderRadius: 8,
            color: "rgba(255,100,100,0.8)",
            cursor: "pointer",
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            fontWeight: 500,
            transition: "background 0.15s",
          }}
          title="Çıkış Yap"
        >
          <LogOut size={14} />
          <span>Çıkış</span>
        </button>
      </div>
    </div>
  );
}
