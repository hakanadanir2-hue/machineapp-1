import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function AuthConfirmPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0B0B0B", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 440, width: "100%", background: "#141414", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 24, padding: "48px 40px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, background: "rgba(74,222,128,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <CheckCircle size={36} color="#4ade80" />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: "0 0 10px", lineHeight: 1.2 }}>
          Üyeliğiniz Aktif Edilmiştir!
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,.45)", lineHeight: 1.7, margin: "0 0 32px" }}>
          Machine Gym ailesine hoş geldiniz. 🎉<br />
          Hesabınız başarıyla doğrulandı, şimdi giriş yapabilirsiniz.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href="/giris" style={{ display: "block", background: "#7A0D2A", color: "#fff", textDecoration: "none", padding: "14px 24px", borderRadius: 12, fontWeight: 800, fontSize: 15 }}>
            Giriş Yap →
          </Link>
          <Link href="/" style={{ display: "block", color: "rgba(255,255,255,.35)", textDecoration: "none", fontSize: 13, padding: "8px" }}>
            Ana Sayfaya Dön
          </Link>
        </div>
        <div style={{ marginTop: 32, padding: "16px 20px", background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.1)", borderRadius: 12 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)", margin: 0, lineHeight: 1.6 }}>
            📧 E-posta kutunuza hoşgeldin maili gönderildi.<br />
            📞 Sorularınız için: <strong style={{ color: "#D4AF37" }}>+90 374 270 14 55</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
