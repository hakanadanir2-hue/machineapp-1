import Link from "next/link";
import { Dumbbell, MapPin, Phone, Mail, Instagram, Clock, MessageCircle, Facebook } from "lucide-react";

const DEFAULTS = {
  whatsapp:  "903742701455",
  phone:     "0374 270 14 55",
  email:     "info@machinegym.biz",
  address:   "Tabaklar Mah. / Uygur Sokak NO:3, Bolu Merkez",
  instagram: "https://instagram.com/gymachinebolu",
  facebook:  "https://facebook.com/machinegym",
  weekday:   "08:00 – 01:00",
  saturday:  "10:00 – 01:00",
  sunday:    "12:00 – 20:00",
};

export default function Footer() {
  const year = new Date().getFullYear();
  const wa = `https://wa.me/${DEFAULTS.whatsapp}?text=${encodeURIComponent("Merhaba, Machine Gym hakkında bilgi almak istiyorum.")}`;

  return (
    <footer style={{ background: "#111111", borderTop: "1px solid rgba(106,13,37,0.2)", paddingTop: "4rem", paddingBottom: "2rem" }}>
      <div className="page-container">
        <div style={{ display: "grid", gap: "2.5rem", marginBottom: "3rem" }} className="footer-grid">
          <style>{`
            .footer-grid { grid-template-columns: 1fr; }
            @media (min-width: 640px) { .footer-grid { grid-template-columns: repeat(2, 1fr); } }
            @media (min-width: 1024px) { .footer-grid { grid-template-columns: 1.6fr 1fr 1fr 1.4fr; } }
          `}</style>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <div style={{ width: "36px", height: "36px", background: "#6A0D25", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Dumbbell style={{ width: "20px", height: "20px", color: "#fff" }} />
              </div>
              <span style={{ fontWeight: 800, color: "#fff", fontSize: "1rem", fontFamily: "var(--font-heading)" }}>
                MACHINE <span style={{ color: "#D4AF37" }}>GYM</span>
              </span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8125rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>
              Bolu&apos;nun en disiplinli fitness &amp; boks salonu. Bilimsel programlar, uzman eğitmenler, premium ekipman.
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[
                { href: DEFAULTS.instagram, Icon: Instagram, label: "Instagram" },
                { href: DEFAULTS.facebook, Icon: Facebook, label: "Facebook" },
                { href: wa, Icon: MessageCircle, label: "WhatsApp" },
              ].map(({ href, Icon, label }) => (
                <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" style={{ width: "36px", height: "36px", background: "rgba(255,255,255,0.06)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}>
                  <Icon style={{ width: "16px", height: "16px", color: "rgba(255,255,255,0.55)" }} />
                </a>
              ))}
            </div>
          </div>

          {/* Hizmetler */}
          <div>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>Hizmetler</p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {["Fitness Üyelik", "Personal Trainer", "Boks Özel Ders", "Kickboks", "Muay Thai"].map(sv => (
                <li key={sv}>
                  <Link href="/hizmetler" style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8125rem", textDecoration: "none" }}>{sv}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>Hızlı Linkler</p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {[
                { href: "/fiyatlar", label: "Fiyatlar" },
                { href: "/magaza", label: "Mağaza" },
                { href: "/program-al", label: "Beslenme & Fitness" },
                { href: "/bki", label: "BMI Hesapla" },
                { href: "/randevu", label: "Randevu Al" },
                { href: "/blog", label: "Blog" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8125rem", textDecoration: "none" }}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <p style={{ color: "#D4AF37", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>İletişim</p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                <MapPin style={{ width: "15px", height: "15px", color: "#6A0D25", marginTop: "1px", flexShrink: 0 }} />
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8125rem" }}>{DEFAULTS.address}</span>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                <Phone style={{ width: "15px", height: "15px", color: "#6A0D25", marginTop: "1px", flexShrink: 0 }} />
                <a href={`tel:+9${DEFAULTS.phone.replace(/\D/g, "")}`} style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8125rem", textDecoration: "none" }}>{DEFAULTS.phone}</a>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                <Mail style={{ width: "15px", height: "15px", color: "#6A0D25", marginTop: "1px", flexShrink: 0 }} />
                <a href={`mailto:${DEFAULTS.email}`} style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8125rem", textDecoration: "none" }}>{DEFAULTS.email}</a>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                <Clock style={{ width: "15px", height: "15px", color: "#6A0D25", marginTop: "1px", flexShrink: 0 }} />
                <div>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8125rem" }}>Pzt–Cum: {DEFAULTS.weekday}</p>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8125rem" }}>Cumartesi: {DEFAULTS.saturday}</p>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8125rem" }}>Pazar: {DEFAULTS.sunday}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>© {year} Machine Gym. Tüm hakları saklıdır.</p>
          <div style={{ display: "flex", gap: "1.25rem" }}>
            {[
              { href: "/gizlilik", label: "Gizlilik" },
              { href: "/kvkk", label: "KVKK" },
              { href: "/kosullar", label: "Kullanım Koşulları" },
              { href: "/iade", label: "İade Politikası" },
              { href: "/sss", label: "SSS" },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem", textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
