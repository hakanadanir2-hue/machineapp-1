"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Dumbbell, LayoutDashboard, Activity, Camera, Utensils,
  Droplets, CalendarDays, Bell, User, LogOut, Menu, X,
} from "lucide-react";
import PushPermissionBanner from "@/components/PushPermissionBanner";
import { useServiceWorker } from "@/hooks/useServiceWorker";

const NAV = [
  { href: "/uye",                 label: "Genel Bakış",   icon: LayoutDashboard, exact: true },
  { href: "/uye/antrenman",       label: "Antrenmanım",   icon: Dumbbell },
  { href: "/uye/olcumler",        label: "Ölçümlerim",    icon: Activity },
  { href: "/uye/ilerleme",        label: "İlerleme",      icon: Camera },
  { href: "/uye/beslenme",        label: "Beslenme",      icon: Utensils },
  { href: "/uye/su",              label: "Su Takibi",     icon: Droplets },
  { href: "/uye/dersler",         label: "Grup Dersleri", icon: CalendarDays },
  { href: "/uye/bildirimler",     label: "Bildirimler",   icon: Bell },
  { href: "/uye/profil",          label: "Profilim",      icon: User },
];

interface UyeShellProps {
  children: React.ReactNode;
}

export default function UyeShell({ children }: UyeShellProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [member, setMember]       = useState<{ full_name?: string; email?: string; membership_end?: string } | null>(null);
  const [loading, setLoading]     = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const routerRef = useRef(router);
  routerRef.current = router;

  // Service Worker kaydı
  useServiceWorker();

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { routerRef.current.replace("/giris"); return; }

      const [memberRes, notifRes] = await Promise.all([
        supabase.from("members").select("full_name, email, membership_end").eq("id", session.user.id).single(),
        supabase.from("member_notifications").select("id", { count: "exact", head: true }).eq("member_id", session.user.id).eq("read", false),
      ]);

      setMember(memberRes.data ?? { email: session.user.email });
      setUnreadCount(notifRes.count ?? 0);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/giris");
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0B0B0B", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(255,255,255,.3)", fontSize: 14 }}>Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0B0B0B", color: "#fff" }}>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex" style={{
        width: 230, background: "#111", borderRight: "1px solid rgba(255,255,255,.07)",
        flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 50,
      }}>
        <SidebarContent
          pathname={pathname} member={member} signOut={signOut}
          isActive={isActive} unreadCount={unreadCount}
        />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.75)" }} onClick={() => setMobileOpen(false)} />
          <aside style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 230, background: "#111", borderRight: "1px solid rgba(255,255,255,.07)", display: "flex", flexDirection: "column" }}>
            <button onClick={() => setMobileOpen(false)} style={{ position: "absolute", right: 12, top: 12, background: "none", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer" }}>
              <X size={18} />
            </button>
            <SidebarContent
              pathname={pathname} member={member} signOut={signOut}
              isActive={isActive} unreadCount={unreadCount} onNav={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }} className="md:ml-[230px]">
        {/* Topbar */}
        <header style={{
          height: 56, borderBottom: "1px solid rgba(255,255,255,.07)", background: "#111",
          display: "flex", alignItems: "center", padding: "0 20px", gap: 12,
          position: "sticky", top: 0, zIndex: 40,
        }}>
          <button onClick={() => setMobileOpen(true)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer" }} className="md:hidden">
            <Menu size={20} />
          </button>
          <div style={{ flex: 1 }} />
          {/* Bildirim rozeti */}
          <Link href="/uye/bildirimler" style={{ position: "relative", color: "rgba(255,255,255,.5)", display: "flex" }}>
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -4,
                width: 16, height: 16, borderRadius: "50%",
                background: "#C9A84C", color: "#0B0B0B",
                fontSize: 9, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginLeft: 12 }}>
            {member?.full_name || member?.email}
          </div>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#C9A84C", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={16} color="#0B0B0B" />
          </div>
        </header>

        <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>{children}</main>
      </div>

      {/* Web Push izni banner */}
      <PushPermissionBanner />
    </div>
  );
}

function SidebarContent({
  pathname: _pathname, member, signOut, isActive, unreadCount, onNav,
}: {
  pathname: string;
  member: { full_name?: string; email?: string; membership_end?: string } | null;
  signOut: () => void;
  isActive: (href: string, exact?: boolean) => boolean;
  unreadCount: number;
  onNav?: () => void;
}) {
  const daysLeft = member?.membership_end
    ? Math.ceil((new Date(member.membership_end).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <>
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <Link href="/uye" onClick={onNav} style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, background: "#7A0D2A", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Dumbbell size={16} color="#C9A84C" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", letterSpacing: "0.08em", fontFamily: "var(--font-bebas-neue, inherit)" }}>
            MACHINE <span style={{ color: "#C9A84C" }}>GYM</span>
          </span>
        </Link>
      </div>

      {/* Üye bilgisi */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {member?.full_name || "Üye"}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member?.email}</div>
        {daysLeft !== null && (
          <div style={{
            marginTop: 8, padding: "4px 8px", borderRadius: 6,
            background: daysLeft <= 7 ? "rgba(239,68,68,.15)" : "rgba(201,168,76,.1)",
            border: `1px solid ${daysLeft <= 7 ? "rgba(239,68,68,.3)" : "rgba(201,168,76,.25)"}`,
            fontSize: 11, color: daysLeft <= 7 ? "#f87171" : "#C9A84C",
          }}>
            {daysLeft <= 0
              ? "Üyelik süresi doldu"
              : daysLeft <= 7
              ? `${daysLeft} gün içinde bitiyor`
              : `${daysLeft} gün kaldı`}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href} onClick={onNav} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderRadius: 10, textDecoration: "none", fontSize: 13,
              fontWeight: active ? 700 : 400,
              background: active ? "rgba(201,168,76,.12)" : "transparent",
              color: active ? "#C9A84C" : "rgba(255,255,255,.45)",
              border: active ? "1px solid rgba(201,168,76,.25)" : "1px solid transparent",
              transition: "all .12s", position: "relative",
            }}>
              <Icon size={15} />
              {label}
              {href === "/uye/bildirimler" && unreadCount > 0 && (
                <span style={{
                  marginLeft: "auto", background: "#C9A84C", color: "#0B0B0B",
                  fontSize: 10, fontWeight: 800, padding: "1px 5px", borderRadius: 10,
                }}>
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Çıkış */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
        <button onClick={signOut} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
          borderRadius: 10, background: "none", border: "1px solid transparent",
          color: "rgba(255,255,255,.3)", fontSize: 13, cursor: "pointer",
        }}>
          <LogOut size={15} />
          Çıkış Yap
        </button>
      </div>
    </>
  );
}
