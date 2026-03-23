import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata = {
  title: "Gizlilik Politikası | Machine Gym",
  description:
    "Machine Gym olarak kişisel verilerinizin gizliliğini ve güvenliğini ciddiye alıyoruz. Gizlilik politikamızı okuyarak haklarınız hakkında bilgi edinin.",
};

export default function GizlilikPage() {
  const sectionStyle: React.CSSProperties = {
    marginBottom: "2.5rem",
  };

  const headingStyle: React.CSSProperties = {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#D4AF37",
    marginBottom: "0.75rem",
    paddingBottom: "0.5rem",
    borderBottom: "1px solid #1f1f1f",
  };

  const textStyle: React.CSSProperties = {
    color: "#cccccc",
    lineHeight: 1.8,
    marginBottom: "0.75rem",
  };

  const listStyle: React.CSSProperties = {
    color: "#cccccc",
    lineHeight: 1.8,
    paddingLeft: "1.5rem",
    marginBottom: "0.75rem",
  };

  return (
    <div style={{ backgroundColor: "#0B0B0B", minHeight: "100vh" }}>
      <Navbar />
      <WhatsAppButton />
      <main style={{ paddingTop: "7rem", paddingBottom: "5rem" }}>
        <div
          style={{
            maxWidth: "860px",
            margin: "0 auto",
            padding: "0 1.5rem",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "#ffffff",
              marginBottom: "0.5rem",
            }}
          >
            Gizlilik Politikası
          </h1>
          <p style={{ color: "#888888", marginBottom: "2.5rem", fontSize: "0.9rem" }}>
            Son güncelleme: Mart 2025
          </p>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>1. Giriş</h2>
            <p style={textStyle}>
              Machine Gym ("biz", "bizim" veya "şirket") olarak, Tabaklar Mahallesi / Uygur Sokak NO:3, Bolu adresinde
              faaliyet göstermekteyiz. Bu gizlilik politikası, web sitemizi ziyaret ettiğinizde veya hizmetlerimizden
              yararlandığınızda kişisel verilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklamaktadır.
            </p>
            <p style={textStyle}>
              Web sitemizi kullanarak bu politikada belirtilen uygulamaları kabul etmiş sayılırsınız. Bu politikayı
              periyodik olarak gözden geçirmenizi öneririz; zira zaman zaman güncellenebilir.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>2. Toplanan Bilgiler</h2>
            <p style={textStyle}>
              Hizmetlerimizi sunmak amacıyla çeşitli kişisel veriler toplayabiliriz. Bu veriler aşağıdaki yollarla
              elde edilebilir:
            </p>
            <ul style={listStyle}>
              <li>
                <strong style={{ color: "#ffffff" }}>Üyelik kaydı sırasında:</strong> Ad, soyad, e-posta adresi,
                telefon numarası, doğum tarihi, cinsiyet.
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>İletişim formları aracılığıyla:</strong> Ad, e-posta adresi,
                telefon numarası, mesajınız.
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>Randevu ve program başvurularında:</strong> Kişisel sağlık
                beyanları, antrenman hedefleri, mevcut fiziksel durumunuz.
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>Ödeme işlemlerinde:</strong> Ödeme bilgileri güvenli ödeme
                altyapısı üzerinden işlenir; kart bilgileri sistemlerimizde saklanmaz.
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>Otomatik olarak:</strong> IP adresi, tarayıcı türü, ziyaret
                edilen sayfalar, erişim tarihi ve saati.
              </li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>3. Bilgilerin Kullanımı</h2>
            <p style={textStyle}>Topladığımız kişisel verileri aşağıdaki amaçlarla kullanmaktayız:</p>
            <ul style={listStyle}>
              <li>Üyelik ve hizmet süreçlerini yönetmek</li>
              <li>Randevu, program ve deneme antrenmanı taleplerini işleme almak</li>
              <li>Sipariş ve ödeme işlemlerini gerçekleştirmek</li>
              <li>Müşteri hizmetleri sunmak ve sorularınızı yanıtlamak</li>
              <li>Kampanya, etkinlik ve duyurular hakkında bilgilendirme yapmak (onayınız dahilinde)</li>
              <li>Web sitemizin performansını ve kullanıcı deneyimini iyileştirmek</li>
              <li>Yasal yükümlülüklerimizi yerine getirmek</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>4. Bilgilerin Paylaşımı</h2>
            <p style={textStyle}>
              Kişisel verilerinizi aşağıdaki durumlar dışında üçüncü taraflarla paylaşmayız:
            </p>
            <ul style={listStyle}>
              <li>
                <strong style={{ color: "#ffffff" }}>Hizmet sağlayıcıları:</strong> Ödeme işlemcileri, bulut depolama
                ve e-posta hizmeti gibi teknik altyapı sağlayıcılarıyla, yalnızca hizmet sunumu amacıyla.
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>Yasal yükümlülükler:</strong> Yetkili kamu kurumları ve
                mahkemelerden gelen yasal talepler doğrultusunda.
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>İş transferleri:</strong> Şirket birleşmesi veya devri gibi
                işletme süreçlerinde, önceden bilgilendirilmeniz koşuluyla.
              </li>
            </ul>
            <p style={textStyle}>
              Verilerinizi hiçbir koşulda pazarlama amacıyla üçüncü taraflara satmayız veya kiralamayız.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>5. Güvenlik</h2>
            <p style={textStyle}>
              Kişisel verilerinizi yetkisiz erişim, değiştirme, ifşa veya imhaya karşı korumak için endüstri
              standartlarında teknik ve idari güvenlik önlemleri uygulamaktayız. Web sitemizde SSL/TLS şifrelemesi
              kullanılmaktadır.
            </p>
            <p style={textStyle}>
              Ancak internet üzerinden hiçbir veri iletiminin veya elektronik depolama yönteminin %100 güvenli
              olmadığını hatırlatmak isteriz. Güvenliğiniz için çaba göstersek de mutlak güvenliği garanti
              edemeyiz.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>6. Çerezler</h2>
            <p style={textStyle}>
              Web sitemiz, kullanıcı deneyimini iyileştirmek, site trafiğini analiz etmek ve tercihlerinizi
              hatırlamak amacıyla çerezler (cookies) kullanmaktadır. Çerezler şu kategorilerde sınıflandırılabilir:
            </p>
            <ul style={listStyle}>
              <li>
                <strong style={{ color: "#ffffff" }}>Zorunlu çerezler:</strong> Sitenin temel işlevleri için
                gereklidir; devre dışı bırakılamaz.
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>Analitik çerezler:</strong> Ziyaretçi davranışlarını anlamamıza
                yardımcı olur (ör. Google Analytics).
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>Tercih çerezleri:</strong> Dil ve görünüm tercihlerinizi
                kaydeder.
              </li>
            </ul>
            <p style={textStyle}>
              Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durumda bazı site
              özelliklerinin düzgün çalışmayabileceğini bilginize sunarız.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>7. Haklarınız</h2>
            <p style={textStyle}>
              6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul style={listStyle}>
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
              <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
              <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
              <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
              <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>8. İletişim</h2>
            <p style={textStyle}>
              Gizlilik politikamıza ilişkin sorularınız veya haklarınızı kullanmak amacıyla aşağıdaki iletişim
              kanallarından bize ulaşabilirsiniz:
            </p>
            <div
              style={{
                backgroundColor: "#111111",
                border: "1px solid #1f1f1f",
                borderRadius: "8px",
                padding: "1.25rem 1.5rem",
              }}
            >
              <p style={{ color: "#ffffff", marginBottom: "0.4rem", fontWeight: 600 }}>Machine Gym</p>
              <p style={{ color: "#aaaaaa", marginBottom: "0.4rem" }}>
                Tabaklar Mahallesi / Uygur Sokak NO:3, Bolu
              </p>
              <p style={{ color: "#aaaaaa", marginBottom: "0.4rem" }}>Tel: 0374 270 14 55</p>
              <p style={{ color: "#aaaaaa" }}>
                Web:{" "}
                <a
                  href="/"
                  style={{ color: "#D4AF37", textDecoration: "none" }}
                >
                  www.machinegym.com.tr
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
