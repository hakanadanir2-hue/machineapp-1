"use client";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle, Navigation, Instagram, Facebook } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  weekday: string;
  saturday: string;
  sunday: string;
  instagram: string;
  facebook: string;
}

export default function ContactClient({ info }: { info: ContactInfo }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) { setError("Ad ve mesaj alanları zorunludur."); return; }
    setLoading(true); setError("");
    try {
      const supabase = createClient();
      const { error: dbError } = await supabase.from("leads").insert({
        type: "contact",
        name: form.name, phone: form.phone || null, email: form.email || null,
        message: form.message, status: "new", is_read: false,
      });
      // Also try legacy table (fallback)
      if (dbError) {
        await supabase.from("contact_requests").insert({
          name: form.name, phone: form.phone || null, email: form.email || null,
          message: form.message, status: "new",
        });
      }
      setSuccess(true);
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch {
      setError("Mesaj gönderilemedi. Lütfen tekrar deneyin veya WhatsApp ile yazın.");
    }
    setLoading(false);
  };

  const wa = `https://wa.me/${info.whatsapp}?text=${encodeURIComponent("Merhaba, Machine Gym hakkında bilgi almak istiyorum.")}`;

  const infoCards = [
    { icon: MapPin, label: "Adres", value: info.address, sub: "Bolu Merkez, Türkiye", action: { text: "Yol Tarifi Al", href: "https://maps.app.goo.gl/ggCzmj3idz2Vtovj8" } },
    { icon: Phone, label: "Telefon", value: info.phone, sub: "Aramak için tıklayın", action: { text: "Şimdi Ara", href: `tel:+9${info.phone.replace(/\D/g, "")}` } },
    { icon: Mail, label: "E-posta", value: info.email, sub: "24 saat içinde yanıtlarız", action: { text: "E-posta Gönder", href: `mailto:${info.email}` } },
    { icon: Clock, label: "Çalışma Saatleri", value: `Pzt – Cum: ${info.weekday}`, sub: `Cumartesi: ${info.saturday} | Pazar: ${info.sunday}` },
  ];

  const IS: React.CSSProperties = { width: "100%", background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#fff", padding: "11px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box" };

  return (
    <div className="page-container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", marginBottom: "3rem" }}>
        {infoCards.map(({ icon: Icon, label, value, sub, action }) => (
          <div key={label} style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "1.5rem" }}>
            <div style={{ width: "40px", height: "40px", background: "rgba(106,13,37,0.2)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <Icon style={{ width: "18px", height: "18px", color: "#D4AF37" }} />
            </div>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>{label}</p>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.25rem" }}>{value}</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8125rem", marginBottom: action ? "1rem" : 0 }}>{sub}</p>
            {action && (
              <a href={action.href} target={action.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#D4AF37", fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none" }}>
                <Navigation style={{ width: "13px", height: "13px" }} /> {action.text}
              </a>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "1fr 1fr", alignItems: "start" }} className="contact-grid">
        <style>{`@media(max-width:768px){.contact-grid{grid-template-columns:1fr !important;}}`}</style>

        {/* Map */}
        <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", overflow: "hidden" }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d765.4678209738247!2d31.60641096962959!3d40.73538959879427!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x408818b11d4ab0c3%3A0x8c21b3d6f9c2c6e1!2sUygur%20Sk.%20No%3A3%2C%2014100%20Merkez%2FBolu!5e0!3m2!1str!2str!4v1710000000000!5m2!1str!2str"
            width="100%" height="300" style={{ border: "none", display: "block" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          />
          <div style={{ padding: "1.25rem" }}>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.25rem" }}>{info.address}</p>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
              <a href="https://maps.app.goo.gl/ggCzmj3idz2Vtovj8" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "7px 14px", background: "#6A0D25", borderRadius: "8px", color: "#fff", fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none" }}>
                <Navigation style={{ width: "13px", height: "13px" }} /> Yol Tarifi
              </a>
              <a href={wa} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "7px 14px", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "8px", color: "#4ade80", fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none" }}>
                <MessageCircle style={{ width: "13px", height: "13px" }} /> WhatsApp
              </a>
              {info.instagram && (
                <a href={info.instagram} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "7px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none" }}>
                  <Instagram style={{ width: "13px", height: "13px" }} /> Instagram
                </a>
              )}
              {info.facebook && (
                <a href={info.facebook} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "7px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none" }}>
                  <Facebook style={{ width: "13px", height: "13px" }} /> Facebook
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "1.75rem" }}>
          <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "1.125rem", marginBottom: "1.25rem" }}>Mesaj Gönder</h2>
          {success ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <CheckCircle style={{ width: "40px", height: "40px", color: "#4ade80", margin: "0 auto 0.75rem" }} />
              <p style={{ color: "#4ade80", fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem" }}>Mesajınız iletildi!</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>En kısa sürede size geri döneceğiz.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600, marginBottom: "5px" }}>Ad Soyad *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={IS} placeholder="Adınız" />
                </div>
                <div>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600, marginBottom: "5px" }}>Telefon</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={IS} placeholder="05xx xxx xx xx" />
                </div>
              </div>
              <div>
                <label style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600, marginBottom: "5px" }}>E-posta</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={IS} placeholder="email@örnek.com" />
              </div>
              <div>
                <label style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600, marginBottom: "5px" }}>Mesaj *</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} style={{ ...IS, resize: "vertical", minHeight: "100px" }} placeholder="Mesajınızı yazın..." />
              </div>
              {error && <p style={{ color: "#f87171", fontSize: "13px" }}>{error}</p>}
              <button type="submit" disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", background: loading ? "#333" : "#6A0D25", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
                <Send style={{ width: "15px", height: "15px" }} />
                {loading ? "Gönderiliyor..." : "Mesajı Gönder"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
