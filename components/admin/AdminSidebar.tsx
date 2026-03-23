"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Layers,
  Tag,
  BookOpen,
  Users,
  MessageSquare,
  Settings,
  ChevronRight,
  ShoppingBag,
  ImageIcon,
  Search,
  Inbox,
  Wrench,
  Dumbbell,
  ClipboardList,
  Shield,
  Video,
  HelpCircle,
  Megaphone,
  Calendar,
  Download,
  CreditCard,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    group: "ANA",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={17} /> },
    ],
  },
  {
    group: "İÇERİK",
    items: [
      { label: "Site İçeriği", href: "/admin/content", icon: <FileText size={17} /> },
      { label: "Hero Medya", href: "/admin/hero", icon: <Video size={17} /> },
      { label: "Hizmetler", href: "/admin/services", icon: <Layers size={17} /> },
      { label: "Fiyatlar", href: "/admin/pricing", icon: <Tag size={17} /> },
      { label: "SSS", href: "/admin/sss", icon: <HelpCircle size={17} /> },
      { label: "Blog", href: "/admin/blog", icon: <BookOpen size={17} /> },
      { label: "Mağaza", href: "/admin/magaza", icon: <ShoppingBag size={17} /> },
      { label: "Medya Kütüphanesi", href: "/admin/medya", icon: <ImageIcon size={17} /> },
      { label: "SEO Yönetimi", href: "/admin/seo", icon: <Search size={17} /> },
    ],
  },
  {
    group: "EGZERSİZ & PROGRAM",
    items: [
      { label: "Egzersiz Kütüphanesi", href: "/admin/egzersizler", icon: <Dumbbell size={17} /> },
      { label: "Program Yönetimi", href: "/admin/programlar", icon: <ClipboardList size={17} /> },
    ],
  },
  {
    group: "YÖNETİM",
    items: [
      { label: "Kullanıcılar", href: "/admin/kullanicilar", icon: <Users size={17} /> },
      { label: "Roller & Yetkiler", href: "/admin/kullanicilar?tab=roles", icon: <Shield size={17} /> },
      { label: "Randevular", href: "/admin/randevular", icon: <Calendar size={17} /> },
      { label: "İletişim Talepleri", href: "/admin/contact", icon: <MessageSquare size={17} /> },
      { label: "Başvuru & Talepler", href: "/admin/leads", icon: <Inbox size={17} /> },
    ],
  },
  {
    group: "SİSTEM",
    items: [
      { label: "Duyurular", href: "/admin/duyurular", icon: <Megaphone size={17} /> },
      { label: "PayTR Ödeme", href: "/admin/settings?tab=paytr", icon: <CreditCard size={17} /> },
      { label: "Veri Dışa Aktar", href: "/admin/export", icon: <Download size={17} /> },
      { label: "Ayarlar", href: "/admin/settings", icon: <Settings size={17} /> },
      { label: "Sistem Kurulumu", href: "/admin/setup", icon: <Wrench size={17} /> },
    ],
  },
];

interface AdminSidebarProps {
  open: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ open, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: open ? 240 : 64,
        background: "#111111",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s",
        zIndex: 100,
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      {/* Logo Area */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "flex-start" : "center",
          padding: open ? "0 16px" : "0",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        {open ? (
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "0.08em",
                lineHeight: 1.1,
              }}
            >
              <span style={{ color: "#7A0D25" }}>MACHINE</span>{" "}
              <span style={{ color: "#D4AF37" }}>GYM</span>
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.12em",
                marginTop: 2,
              }}
            >
              Admin Panel
            </div>
          </div>
        ) : (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(122,13,37,0.3)",
              border: "1px solid rgba(212,175,55,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 800,
              color: "#D4AF37",
            }}
          >
            M
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 0" }}>
        {navGroups.map((group) => (
          <div key={group.group} style={{ marginBottom: 8 }}>
            {open && (
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.25)",
                  padding: "8px 16px 4px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const isHovered = hoveredHref === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    height: 38,
                    padding: open ? "0 12px" : "0",
                    justifyContent: open ? "flex-start" : "center",
                    borderRadius: 8,
                    margin: "1px 8px",
                    textDecoration: "none",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                    background: isActive
                      ? "rgba(122,13,42,0.4)"
                      : isHovered
                      ? "rgba(255,255,255,0.04)"
                      : "transparent",
                    borderLeft: isActive ? "2px solid #D4AF37" : "2px solid transparent",
                    transition: "background 0.15s, color 0.15s",
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 13.5,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                  onMouseEnter={() => setHoveredHref(item.href)}
                  onMouseLeave={() => setHoveredHref(null)}
                  title={!open ? item.label : undefined}
                >
                  <span style={{ flexShrink: 0 }}>{item.icon}</span>
                  {open && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse button */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "12px 8px",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onToggle}
          style={{
            width: "100%",
            height: 36,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 8,
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontSize: 12,
            transition: "background 0.15s",
          }}
          title={open ? "Daralt" : "Genişlet"}
        >
          <ChevronRight
            size={14}
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          />
          {open && <span>Daralt</span>}
        </button>
      </div>
    </div>
  );
}
