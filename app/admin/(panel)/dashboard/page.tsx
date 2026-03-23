"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Users, BookOpen, Layers, MessageSquare, ArrowRight, TrendingUp,
  ShoppingBag, Calendar, Package, Download,
} from "lucide-react";

interface Stats {
  users: number;
  blogPosts: number;
  services: number;
  newMessages: number;
  products: number;
  appointments: number;
  orders: number;
  exercises: number;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  created_at: string;
  status: string;
}

const cardStyle: React.CSSProperties = {
  background: "#141414",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  padding: "20px 24px",
};

const statCards = [
  { key: "users", label: "Toplam Kullanıcı", icon: <Users size={20} color="#7A0D25" />, href: "/admin/kullanicilar" },
  { key: "blogPosts", label: "Blog Yazısı", icon: <BookOpen size={20} color="#D4AF37" />, href: "/admin/blog" },
  { key: "services", label: "Hizmet", icon: <Layers size={20} color="#7A0D25" />, href: "/admin/services" },
  { key: "newMessages", label: "Yeni Mesaj", icon: <MessageSquare size={20} color="#D4AF37" />, href: "/admin/contact" },
  { key: "products", label: "Ürün", icon: <ShoppingBag size={20} color="#60a5fa" />, href: "/admin/magaza" },
  { key: "appointments", label: "Randevu", icon: <Calendar size={20} color="#4ade80" />, href: "/admin/randevular" },
  { key: "exercises", label: "Egzersiz", icon: <Package size={20} color="#f59e0b" />, href: "/admin/egzersizler" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ users: 0, blogPosts: 0, services: 0, newMessages: 0, products: 0, appointments: 0, orders: 0, exercises: 0 });
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const [
        { count: usersCount },
        { count: blogCount },
        { count: servicesCount },
        { count: messagesCount },
        { count: productsCount },
        { count: appointmentsCount },
        { count: exercisesCount },
        { data: recentMessages },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
        supabase.from("services").select("*", { count: "exact", head: true }),
        supabase.from("contact_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("exercises").select("*", { count: "exact", head: true }),
        supabase.from("contact_requests").select("id, name, email, subject, created_at, status").order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        users: usersCount ?? 0,
        blogPosts: blogCount ?? 0,
        services: servicesCount ?? 0,
        newMessages: messagesCount ?? 0,
        products: productsCount ?? 0,
        appointments: appointmentsCount ?? 0,
        orders: 0,
        exercises: exercisesCount ?? 0,
      });
      setMessages(recentMessages ?? []);
      setLoading(false);
    };

    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusBadge = (status: string) => {
    if (status === "new")
      return (
        <span
          style={{
            background: "rgba(248,113,113,0.15)",
            color: "#f87171",
            padding: "2px 8px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          Yeni
        </span>
      );
    if (status === "read")
      return (
        <span
          style={{
            background: "rgba(212,175,55,0.15)",
            color: "#D4AF37",
            padding: "2px 8px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          Okundu
        </span>
      );
    return (
      <span
        style={{
          background: "rgba(74,222,128,0.15)",
          color: "#4ade80",
          padding: "2px 8px",
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        Tamamlandı
      </span>
    );
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            color: "#fff",
            fontWeight: 800,
            fontSize: 26,
            letterSpacing: "-0.02em",
            margin: 0,
            marginBottom: 4,
          }}
        >
          Dashboard
        </h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>
          Machine Gym yönetim paneline hoş geldiniz
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {statCards.map((card) => (
          <Link key={card.key} href={card.href} style={{ textDecoration: "none" }}>
            <div
              style={{
                ...cardStyle,
                display: "flex",
                alignItems: "center",
                gap: 16,
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#fff",
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {loading ? "–" : stats[card.key as keyof Stats]}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                  {card.label}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom section: Messages + Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        {/* Recent Messages */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={16} color="#D4AF37" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                Son İletişim Mesajları
              </span>
            </div>
            <Link
              href="/admin/contact"
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.35)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Tümü <ArrowRight size={11} />
            </Link>
          </div>

          {loading ? (
            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
              Yükleniyor...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
              Henüz mesaj yok
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {["Ad", "Konu", "Tarih", "Durum"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "7px 10px",
                        textAlign: "left",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.3)",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <td style={{ padding: "10px 10px", fontSize: 13, color: "#fff" }}>{msg.name}</td>
                    <td
                      style={{
                        padding: "10px 10px",
                        fontSize: 12.5,
                        color: "rgba(255,255,255,0.5)",
                        maxWidth: 160,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {msg.subject}
                    </td>
                    <td style={{ padding: "10px 10px", fontSize: 12, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>
                      {formatDate(msg.created_at)}
                    </td>
                    <td style={{ padding: "10px 10px" }}>{statusBadge(msg.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick Actions */}
        <div style={cardStyle}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 16,
            }}
          >
            Hızlı Erişim
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Yeni Blog Yazısı", href: "/admin/blog", icon: <BookOpen size={14} /> },
              { label: "Kullanıcı Yönetimi", href: "/admin/users", icon: <Users size={14} /> },
              { label: "Hizmetleri Düzenle", href: "/admin/services", icon: <Layers size={14} /> },
              { label: "Mesajları Görüntüle", href: "/admin/contact", icon: <MessageSquare size={14} /> },
              { label: "Site Ayarları", href: "/admin/settings", icon: <TrendingUp size={14} /> },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 9,
                  color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 500,
                  transition: "background 0.15s",
                }}
              >
                <span style={{ color: "#7A0D25" }}>{action.icon}</span>
                {action.label}
                <ArrowRight size={12} style={{ marginLeft: "auto", opacity: 0.4 }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
