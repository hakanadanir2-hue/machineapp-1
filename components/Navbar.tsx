"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Dumbbell, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cartContext";

const NAV_LINKS = [
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/fiyatlar", label: "Fiyatlar" },
  { href: "/magaza", label: "Mağaza" },
  { href: "/program-al", label: "Program Al" },
  { href: "/blog", label: "Blog" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCart();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transition: "all 0.3s",
          background: scrolled ? "rgba(11,11,11,0.97)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(106,13,37,0.25)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none",
        }}
      >
        <div
          className="page-container"
          style={{
            height: "68px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: "34px", height: "34px", background: "#6A0D25", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Dumbbell style={{ width: "18px", height: "18px", color: "#fff" }} />
            </div>
            <span style={{ fontWeight: 800, color: "#fff", fontSize: "1rem", letterSpacing: "0.04em", fontFamily: "var(--font-heading)" }}>
              MACHINE <span style={{ color: "#D4AF37" }}>GYM</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="desktop-nav">
            {NAV_LINKS.map(l => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    padding: "0.35rem 0.45rem",
                    fontSize: "0.75rem",
                    fontWeight: active ? 700 : 500,
                    borderRadius: "8px",
                    color: active ? "#D4AF37" : "rgba(255,255,255,0.7)",
                    background: active ? "rgba(106,13,37,0.2)" : "transparent",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right */}
          <div className="desktop-right" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/sepet" style={{ position: "relative", display: "flex", alignItems: "center", color: "rgba(255,255,255,0.55)" }}>
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span style={{ position: "absolute", top: -6, right: -7, background: "#6A0D25", color: "#fff", fontSize: 9, fontWeight: 800, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{totalItems}</span>
              )}
            </Link>
            <Link href="/giris" style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>
              Giriş
            </Link>
            <Link
              href="/randevu"
              style={{ padding: "0.5rem 1rem", background: "#6A0D25", color: "#fff", fontSize: "0.8125rem", fontWeight: 700, borderRadius: "10px", border: "1px solid rgba(212,175,55,0.35)", textDecoration: "none", whiteSpace: "nowrap" }}
            >
              Randevu Al
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="mobile-btn"
            onClick={() => setOpen(!open)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: "0.25rem", display: "flex" }}
            aria-label="Menü"
          >
            {open ? <X style={{ width: "22px", height: "22px" }} /> : <Menu style={{ width: "22px", height: "22px" }} />}
          </button>
        </div>

        <style>{`
          .desktop-nav { display: none; align-items: center; gap: 0; flex-shrink: 1; }
          .desktop-right { display: none; align-items: center; gap: 0.5rem; flex-shrink: 0; }
          .mobile-btn { display: flex; }
          header { overflow: visible !important; }
          @media (min-width: 1024px) {
            .desktop-nav { display: flex !important; }
            .desktop-right { display: flex !important; }
            .mobile-btn { display: none !important; }
          }
        `}</style>
      </header>

      {/* Mobile Menu Overlay */}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 40 }}>
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setOpen(false)}
          />
          <div style={{ position: "absolute", top: "68px", left: 0, right: 0, background: "#111111", borderBottom: "1px solid rgba(106,13,37,0.25)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
            <div className="page-container" style={{ paddingTop: "0.875rem", paddingBottom: "1rem" }}>
              {NAV_LINKS.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    display: "block",
                    padding: "0.875rem 0",
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    color: pathname === l.href ? "#D4AF37" : "rgba(255,255,255,0.8)",
                    textDecoration: "none",
                  }}
                >
                  {l.label}
                </Link>
              ))}
              <div style={{ paddingTop: "0.875rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <Link href="/giris" style={{ display: "block", textAlign: "center", padding: "0.75rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", textDecoration: "none" }}>
                  Giriş Yap
                </Link>
                <Link href="/randevu" style={{ display: "block", textAlign: "center", padding: "0.875rem", background: "#6A0D25", color: "#fff", fontSize: "0.875rem", fontWeight: 700, borderRadius: "12px", border: "1px solid rgba(212,175,55,0.3)", textDecoration: "none" }}>
                  Ücretsiz Deneme Antrenmanı Al
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
