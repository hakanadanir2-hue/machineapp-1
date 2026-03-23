"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Dumbbell, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("E-posta veya şifre hatalı. Lütfen tekrar deneyin.");
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Background accent */}
      <div
        style={{
          position: "fixed",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(122,13,37,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20,
          padding: "40px 36px",
          width: "100%",
          maxWidth: 420,
          position: "relative",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              background: "rgba(122,13,37,0.15)",
              border: "1px solid rgba(122,13,37,0.4)",
              borderRadius: 16,
              marginBottom: 16,
            }}
          >
            <Dumbbell size={26} color="#D4AF37" />
          </div>
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "0.08em",
                marginBottom: 4,
              }}
            >
              <span style={{ color: "#7A0D25" }}>MACHINE</span>{" "}
              <span style={{ color: "#D4AF37" }}>GYM</span>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: 6,
              }}
            >
              Admin Girişi
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
              Yönetim paneline erişmek için giriş yapın
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              color: "#f87171",
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 12.5,
                fontWeight: 500,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 6,
                letterSpacing: "0.03em",
              }}
            >
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@machinegym.com"
              style={{
                background: "#0F0F0F",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 9,
                color: "#fff",
                padding: "11px 12px",
                fontSize: 13.5,
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 12.5,
                fontWeight: 500,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 6,
                letterSpacing: "0.03em",
              }}
            >
              Şifre
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  background: "#0F0F0F",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 9,
                  color: "#fff",
                  padding: "11px 40px 11px 12px",
                  fontSize: 13.5,
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.3)",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "rgba(122,13,42,0.5)" : "#7A0D2A",
              border: "1px solid rgba(212,175,55,0.3)",
              borderRadius: 9,
              color: "#fff",
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.03em",
              transition: "background 0.15s",
            }}
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: 11.5,
            color: "rgba(255,255,255,0.2)",
          }}
        >
          Machine Gym &copy; {new Date().getFullYear()} &mdash; Tüm hakları saklıdır
        </div>
      </div>
    </div>
  );
}
