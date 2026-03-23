"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Dumbbell, LayoutDashboard, ClipboardList, LogOut, User, Menu, X, UserCircle } from "lucide-react";

const NAV = [
  { href: "/dashboard",              label: "Genel Bakış",  icon: LayoutDashboard },
  { href: "/dashboard/programlarim", label: "Programlarım", icon: ClipboardList },
  { href: "/dashboard/profil",       label: "Profilim",     icon: UserCircle },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser]     = useState<{ email?: string; full_name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/giris"); return; }
      setUser({
        email:     session.user.email,
        full_name: session.user.user_metadata?.full_name,
      });
      setLoading(false);
    });
  }, [router, supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/giris");
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(255,255,255,.3)", fontSize: 14 }}>Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0A0A0A", color: "#fff" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: "#111", borderRight: "1px solid rgba(255,255,255,.07)",
        display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh",
        zIndex: 50, transform: mobileOpen ? "translateX(0)" : undefined,
      }} className="hidden md:flex">
        <SidebarContent pathname={pathname} user={user} signOut={signOut} />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.7)" }} onClick={() => setMobileOpen(false)} />
          <aside style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 220, background: "#111", borderRight: "1px solid rgba(255,255,255,.07)", display: "flex", flexDirection: "column" }}>
            <SidebarContent pathname={pathname} user={user} signOut={signOut} onNav={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 0, display: "flex", flexDirection: "column" }} className="md:ml-[220px]">
        {/* Topbar */}
        <header style={{ height: 56, borderBottom: "1px solid rgba(255,255,255,.07)", background: "#111", display: "flex", alignItems: "center", padding: "0 20px", gap: 12, position: "sticky", top: 0, zIndex: 40 }}>
          <button onClick={() => setMobileOpen(true)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer", display: "flex" }} className="md:hidden">
            <Menu size={20} />
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>{user?.full_name || user?.email}</div>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#7A0D2A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={16} />
          </div>
        </header>
        <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname, user, signOut, onNav
}: {
  pathname: string;
  user: { email?: string; full_name?: string } | null;
  signOut: () => void;
  onNav?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, background: "#7A0D2A", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Dumbbell size={16} color="#D4AF37" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: "0.05em" }}>
            MACHINE <span style={{ color: "#D4AF37" }}>GYM</span>
          </span>
        </Link>
      </div>

      {/* User */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user?.full_name || "Kullanıcı"}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} onClick={onNav} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: active ? 700 : 500,
              background: active ? "rgba(122,13,42,.3)" : "transparent",
              color: active ? "#fff" : "rgba(255,255,255,.45)",
              border: active ? "1px solid rgba(122,13,42,.4)" : "1px solid transparent",
              transition: "all .15s",
            }}>
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
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
