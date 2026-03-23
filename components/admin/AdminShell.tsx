"use client";
import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0A0A0A" }}>
      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: sidebarOpen ? 240 : 64,
          transition: "margin-left 0.2s",
        }}
      >
        <AdminTopbar onMenuToggle={() => setSidebarOpen(o => !o)} />
        <main
          style={{
            flex: 1,
            padding: "28px",
            overflowY: "auto",
            marginTop: 56,
            background: "#0A0A0A",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
