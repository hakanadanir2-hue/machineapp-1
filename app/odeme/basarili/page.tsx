"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

function BasariliContent() {
  const params = useSearchParams();
  const plan  = params.get("plan") ?? "";
  const order = params.get("order") ?? "";

  const isUyelik = !params.get("type") || params.get("type") === "uyelik";

  return (
    <main style={{ minHeight: "100vh", background: "#0B0B0B", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", paddingTop: 96 }}>
      <div style={{ textAlign: "center", maxWidth: 440 }}>
        <div style={{ width: 80, height: 80, background: "rgba(74,222,128,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 36, border: "2px solid rgba(74,222,128,0.3)" }}>
          ✓
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 12, fontFamily: "var(--font-heading)" }}>
          Ödeme Başarılı!
        </h1>
        {plan && (
          <div style={{ display: "inline-block", background: "#6A0D25", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 10, padding: "6px 16px", marginBottom: 16 }}>
            <span style={{ color: "#D4AF37", fontWeight: 700, fontSize: 14 }}>{decodeURIComponent(plan)}</span>
          </div>
        )}
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.65, marginBottom: 8 }}>
          {isUyelik
            ? "Üyeliğiniz işleme alındı. Kısa süre içinde aktif edilecek ve e-postanıza bilgi gönderilecektir."
            : "Programınız hazırlanıyor. PDF kısa süre içinde panelinize yüklenecektir."}
        </p>
        {order && (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: 28 }}>
            Sipariş: <code style={{ color: "rgba(255,255,255,0.4)" }}>{order}</code>
          </p>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href={isUyelik ? "/uye" : "/dashboard/programlarim"}
            style={{ display: "inline-block", padding: "12px 28px", background: "#6A0D25", color: "#fff", fontWeight: 700, fontSize: 14, borderRadius: 12, textDecoration: "none", border: "1px solid rgba(212,175,55,0.3)" }}
          >
            {isUyelik ? "Üye Paneline Git →" : "Programlarıma Git →"}
          </Link>
          <Link
            href="/"
            style={{ display: "inline-block", padding: "12px 24px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: 14, borderRadius: 12, textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Ana Sayfa
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OdemeBasariliPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <main style={{ minHeight: "100vh", background: "#0B0B0B", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.3)" }}>Yükleniyor...</p>
        </main>
      }>
        <BasariliContent />
      </Suspense>
    </>
  );
}
