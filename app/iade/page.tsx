import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata = {
  title: "İade ve Değişim Politikası | Machine Gym",
  description:
    "Machine Gym üyelik iadesi ve mağaza ürünleri için iade ve değişim politikamızı öğrenin. Sorularınız için WhatsApp üzerinden bize ulaşın.",
};

export default function IadePage() {
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

  const alertBoxStyle: React.CSSProperties = {
    backgroundColor: "#130609",
    border: "1px solid #7A0D2A",
    borderRadius: "8px",
    padding: "1rem 1.25rem",
    marginBottom: "0.75rem",
    color: "#e0a0b0",
    lineHeight: 1.7,
  };

  const infoBoxStyle: React.CSSProperties = {
    backgroundColor: "#0f0d05",
    border: "1px solid #D4AF37",
    borderRadius: "8px",
    padding: "1rem 1.25rem",
    marginBottom: "0.75rem",
    color: "#e8d9a0",
    lineHeight: 1.7,
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
            İade ve Değişim Politikası
          </h1>
          <p style={{ color: "#888888", marginBottom: "2.5rem", fontSize: "0.9rem" }}>
            Son güncelleme: Mart 2025
          </p>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>1. Üyelik İadesi</h2>
            <p style={textStyle}>
              Machine Gym olarak üyeliklerinizin size en iyi değeri sunmasını önemsiyoruz. Üyelik iade
              süreçlerimiz aşağıdaki koşullara tabidir:
            </p>

            <p style={{ color: "#ffffff", fontWeight: 600, marginBottom: "0.5rem" }}>
              İade Hakkı Doğuran Durumlar
            </p>
            <ul style={listStyle}>
              <li>
                <strong style={{ color: "#D4AF37" }}>14 günlük cayma hakkı:</strong> Çevrimiçi olarak satın
                alınan üyelik paketlerinde, üyelik henüz başlatılmamış olmak koşuluyla, satın alma tarihinden
                itibaren 14 gün içinde cayma hakkı kullanılabilir.
              </li>
              <li>
                <strong style={{ color: "#D4AF37" }}>Sağlık gerekçesi:</strong> Doktor raporu ile belgelenen
                uzun süreli sakatlık, kronik hastalık veya operasyon gerektiren sağlık durumlarında orantılı
                iade değerlendirilebilir.
              </li>
              <li>
                <strong style={{ color: "#D4AF37" }}>Şehir dışı taşınma:</strong> İkametgah değişikliğini
                belgeleyen resmi evrak ibraz edilmesi hâlinde kalan süre için orantılı iade değerlendirilebilir.
              </li>
            </ul>

            <div style={alertBoxStyle}>
              Üyelik başlatıldıktan sonra yalnızca kullanılmayan süre için kısmi iade değerlendirilebilir.
              Kullanılmış süre ve aktivasyon bedeli iade kapsamına dahil değildir.
            </div>

            <p style={{ color: "#ffffff", fontWeight: 600, marginBottom: "0.5rem" }}>
              İade Edilemeyen Durumlar
            </p>
            <ul style={listStyle}>
              <li>Üyelik süresi başladıktan sonra kişisel tercih değişikliği</li>
              <li>Tesisi kullanmadığını beyan etme (üyelik aktif olduğu sürece geçerli değil)</li>
              <li>Kural ihlali nedeniyle üyeliği sonlandırılan kişiler</li>
              <li>Kampanya veya promosyon kapsamında elde edilen üyelikler</li>
              <li>Hediye üyelik paketleri</li>
            </ul>

            <div style={infoBoxStyle}>
              Üyelik dondurma hakkı: Yılda 1 kez, maksimum 30 gün süreyle üyelik dondurulabilir. Dondurma
              talebi için en az 3 gün öncesinden personelle iletişime geçilmelidir.
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>2. Mağaza Ürünleri İadesi</h2>
            <p style={textStyle}>
              Çevrimiçi mağazamızdan satın aldığınız ürünlere ilişkin iade koşulları 6502 sayılı Tüketicinin
              Korunması Hakkında Kanun ve ilgili yönetmelikler kapsamında belirlenmektedir.
            </p>

            <p style={{ color: "#ffffff", fontWeight: 600, marginBottom: "0.5rem" }}>
              İade Edilebilecek Ürünler
            </p>
            <ul style={listStyle}>
              <li>Teslim tarihinden itibaren <strong style={{ color: "#D4AF37" }}>14 gün</strong> içinde cayma hakkı kullanılabilir.</li>
              <li>Ürün orijinal ambalajında, kullanılmamış ve hasarsız olmalıdır.</li>
              <li>Ürüne ait tüm etiketler sökülmemiş olmalıdır.</li>
              <li>Fatura veya sipariş belgesi iade sürecinde ibraz edilmelidir.</li>
            </ul>

            <p style={{ color: "#ffffff", fontWeight: 600, marginBottom: "0.5rem" }}>
              İade Edilemeyen Ürünler
            </p>
            <ul style={listStyle}>
              <li>Ambalajı açılmış gıda takviyesi ve beslenme ürünleri</li>
              <li>İç giyim, çorap ve kişisel hijyen ürünleri</li>
              <li>Kişiselleştirilmiş veya özel sipariş ürünleri</li>
              <li>Dijital içerik ve online program erişimleri (indirme başladıktan sonra)</li>
              <li>Tahrip edilmiş, kullanılmış veya eksik parçaları olan ürünler</li>
            </ul>

            <div style={alertBoxStyle}>
              Açık ambalajlı takviye ürünleri, hijyen ve güvenlik gerekçesiyle iade kabul edilmemektedir.
              Satın almadan önce ürün içeriğini ve bileşenlerini kontrol ediniz.
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>3. Değişim Koşulları</h2>
            <p style={textStyle}>
              Ürünlerde beden veya renk değişimi yapmak istemeniz hâlinde aşağıdaki koşullar geçerlidir:
            </p>
            <ul style={listStyle}>
              <li>Değişim talebi teslim tarihinden itibaren 14 gün içinde yapılmalıdır.</li>
              <li>Ürün kullanılmamış, yıkanmamış ve orijinal etiketleri sökülmemiş olmalıdır.</li>
              <li>Değişim talebi yalnızca stok durumuna bağlıdır; talep ettiğiniz beden/renk stokta yoksa iade işlemi uygulanır.</li>
              <li>Değişim kargo ücreti müşteriye aittir; ancak ürün hatası kaynaklı değişimlerde kargo ücreti Machine Gym tarafından karşılanır.</li>
            </ul>
            <p style={textStyle}>
              Değişim veya iade etmek istediğiniz ürünü, fatura veya sipariş belgesiyle birlikte Machine Gym
              mağazasına getirerek veya kargo aracılığıyla gönderebilirsiniz.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>4. İşlem Süreci</h2>
            <p style={textStyle}>
              İade ve değişim taleplerinin sonuçlandırılma süreci aşağıdaki adımlardan oluşmaktadır:
            </p>
            <ol
              style={{
                color: "#cccccc",
                lineHeight: 1.8,
                paddingLeft: "1.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <li style={{ marginBottom: "0.5rem" }}>
                <strong style={{ color: "#ffffff" }}>Talep bildirimi:</strong> WhatsApp veya telefon aracılığıyla
                iade/değişim talebinizi bildirin.
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                <strong style={{ color: "#ffffff" }}>Değerlendirme:</strong> Talebiniz, koşulların sağlanıp
                sağlanmadığı açısından en geç 2 iş günü içinde değerlendirilir.
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                <strong style={{ color: "#ffffff" }}>Ürün kontrolü:</strong> Fiziksel ürünlerde, ürünün
                Machine Gym'e ulaşması ardından durum kontrolü yapılır.
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                <strong style={{ color: "#ffffff" }}>İade/Değişim işlemi:</strong> Uygunluğu onaylanan iade
                talepleri, onay tarihinden itibaren 5-10 iş günü içinde aynı ödeme yöntemiyle sonuçlandırılır.
              </li>
            </ol>
            <p style={textStyle}>
              Online program ücret iadelerinde, program içeriğine erişim sağlandıktan sonra iade
              gerçekleştirilemez.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>5. İletişim</h2>
            <p style={textStyle}>
              İade ve değişim talepleriniz veya sorularınız için aşağıdaki kanallardan bize ulaşabilirsiniz:
            </p>
            <div
              style={{
                backgroundColor: "#111111",
                border: "1px solid #1f1f1f",
                borderRadius: "8px",
                padding: "1.25rem 1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span
                  style={{
                    backgroundColor: "#1a3a1a",
                    color: "#4ade80",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}
                >
                  WHATSAPP
                </span>
                <a
                  href="https://wa.me/905374270145"
                  style={{ color: "#D4AF37", textDecoration: "none", fontWeight: 600 }}
                >
                  0374 270 14 55
                </a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span
                  style={{
                    backgroundColor: "#1a1a3a",
                    color: "#818cf8",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}
                >
                  ADRES
                </span>
                <span style={{ color: "#aaaaaa" }}>
                  Tabaklar Mahallesi / Uygur Sokak NO:3, Bolu
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span
                  style={{
                    backgroundColor: "#2a1a10",
                    color: "#fb923c",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}
                >
                  TELEFON
                </span>
                <a
                  href="tel:03742701455"
                  style={{ color: "#D4AF37", textDecoration: "none", fontWeight: 600 }}
                >
                  0374 270 14 55
                </a>
              </div>
            </div>
            <p style={{ ...textStyle, marginTop: "1rem", fontSize: "0.85rem", color: "#777777" }}>
              Hafta içi 09:00 - 20:00 saatleri arasında müşteri hizmetlerimiz aracılığıyla taleplerinizi
              iletebilirsiniz.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
