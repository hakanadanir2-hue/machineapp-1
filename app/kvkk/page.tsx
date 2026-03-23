import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata = {
  title: "KVKK Aydınlatma Metni | Machine Gym",
  description:
    "Machine Gym olarak 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerinizin işlenmesine ilişkin aydınlatma metnimizi okuyun.",
};

export default function KvkkPage() {
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

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "0.75rem",
  };

  const thStyle: React.CSSProperties = {
    backgroundColor: "#1a1a1a",
    color: "#D4AF37",
    padding: "0.6rem 1rem",
    textAlign: "left",
    fontWeight: 600,
    fontSize: "0.85rem",
    border: "1px solid #2a2a2a",
  };

  const tdStyle: React.CSSProperties = {
    color: "#cccccc",
    padding: "0.6rem 1rem",
    fontSize: "0.85rem",
    border: "1px solid #2a2a2a",
    verticalAlign: "top",
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
            KVKK Aydınlatma Metni
          </h1>
          <p style={{ color: "#888888", marginBottom: "2.5rem", fontSize: "0.9rem" }}>
            6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında — Son güncelleme: Mart 2025
          </p>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>1. Veri Sorumlusu</h2>
            <p style={textStyle}>
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz; veri sorumlusu
              sıfatıyla <strong style={{ color: "#ffffff" }}>Machine Gym</strong> tarafından aşağıda açıklanan
              kapsamda işlenecektir.
            </p>
            <div
              style={{
                backgroundColor: "#111111",
                border: "1px solid #1f1f1f",
                borderRadius: "8px",
                padding: "1.25rem 1.5rem",
                marginTop: "1rem",
              }}
            >
              <p style={{ color: "#ffffff", marginBottom: "0.3rem", fontWeight: 700, fontSize: "1rem" }}>
                Machine Gym
              </p>
              <p style={{ color: "#aaaaaa", marginBottom: "0.3rem" }}>
                Tabaklar Mahallesi / Uygur Sokak NO:3, Bolu
              </p>
              <p style={{ color: "#aaaaaa", marginBottom: "0.3rem" }}>Tel: 0374 270 14 55</p>
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>2. İşlenen Kişisel Veriler</h2>
            <p style={textStyle}>
              Hizmetlerimiz kapsamında aşağıdaki kategorilerde kişisel verileriniz işlenebilmektedir:
            </p>
            <ul style={listStyle}>
              <li>
                <strong style={{ color: "#ffffff" }}>Kimlik verileri:</strong> Ad, soyad, doğum tarihi, cinsiyet, T.C.
                kimlik numarası (gerektiğinde)
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>İletişim verileri:</strong> Telefon numarası, e-posta adresi, adres
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>Sağlık verileri:</strong> Antrenman programı hazırlanması ve
                sağlık durumunuza uygun hizmet sunulabilmesi amacıyla beyan ettiğiniz sağlık bilgileri (açık
                rızanıza dayanarak)
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>Finansal veriler:</strong> Üyelik ücreti ödeme kayıtları,
                fatura bilgileri
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>İşlem güvenliği verileri:</strong> IP adresi, çerez verileri,
                log kayıtları
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>Görsel/işitsel veriler:</strong> Tesisimizde bulunan güvenlik
                kamerası kayıtları
              </li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>3. Kişisel Verilerin İşlenme Amaçları</h2>
            <p style={textStyle}>Kişisel verileriniz aşağıdaki amaçlar doğrultusunda işlenmektedir:</p>
            <ul style={listStyle}>
              <li>Üyelik sözleşmesinin kurulması ve ifası</li>
              <li>Spor merkezi hizmetlerinin sunulması ve yönetilmesi</li>
              <li>Kişiselleştirilmiş antrenman programları hazırlanması</li>
              <li>Randevu ve ders rezervasyonlarının yönetimi</li>
              <li>Ödeme ve fatura işlemlerinin gerçekleştirilmesi</li>
              <li>Müşteri hizmetleri ve şikayet yönetimi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Tesis güvenliğinin sağlanması</li>
              <li>İzniniz dahilinde kampanya ve duyuru bildirimleri gönderilmesi</li>
              <li>İstatistiksel analizler ve hizmet kalitesinin iyileştirilmesi</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>4. Hukuki Dayanaklar</h2>
            <p style={textStyle}>
              Kişisel verileriniz, KVKK'nın 5. ve 6. maddeleri kapsamında aşağıdaki hukuki dayanaklara
              dayanılarak işlenmektedir:
            </p>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Kişisel Veri Kategorisi</th>
                  <th style={thStyle}>Hukuki Dayanak</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Kimlik ve iletişim verileri</td>
                  <td style={tdStyle}>Sözleşmenin kurulması ve ifası (md. 5/2-c)</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, backgroundColor: "#0f0f0f" }}>Sağlık verileri</td>
                  <td style={{ ...tdStyle, backgroundColor: "#0f0f0f" }}>Açık rıza (md. 6/2)</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Finansal veriler</td>
                  <td style={tdStyle}>Yasal yükümlülük (md. 5/2-ç) ve sözleşmenin ifası</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, backgroundColor: "#0f0f0f" }}>Güvenlik kamerası kayıtları</td>
                  <td style={{ ...tdStyle, backgroundColor: "#0f0f0f" }}>Meşru menfaat (md. 5/2-f)</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Pazarlama ve bildirim</td>
                  <td style={tdStyle}>Açık rıza (md. 5/1)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>5. Kişisel Verilerin Aktarımı</h2>
            <p style={textStyle}>
              Kişisel verileriniz; hizmetin ifası için zorunlu olmak kaydıyla aşağıdaki taraflara aktarılabilir:
            </p>
            <ul style={listStyle}>
              <li>
                <strong style={{ color: "#ffffff" }}>Ödeme hizmet sağlayıcıları:</strong> Ödeme işlemlerinin
                gerçekleştirilmesi amacıyla
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>Bulut ve yazılım hizmet sağlayıcıları:</strong> Üyelik yönetim
                sistemleri ve altyapı hizmetleri kapsamında
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>Yetkili kamu kurumları ve adli makamlar:</strong> Yasal
                yükümlülükler çerçevesinde
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>Muhasebe ve hukuk danışmanları:</strong> Mesleki
                danışmanlık hizmetleri kapsamında
              </li>
            </ul>
            <p style={textStyle}>
              Yurt dışına veri aktarımı söz konusu olduğunda KVKK'nın 9. maddesindeki güvenceler sağlanır.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>6. Saklama Süreleri</h2>
            <p style={textStyle}>
              Kişisel verileriniz, işlenme amacının gerektirdiği süre ve yasal zorunluluklar çerçevesinde saklanır:
            </p>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Veri Kategorisi</th>
                  <th style={thStyle}>Saklama Süresi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Üyelik bilgileri</td>
                  <td style={tdStyle}>Üyelik bitiminden itibaren 10 yıl</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, backgroundColor: "#0f0f0f" }}>Ödeme ve fatura kayıtları</td>
                  <td style={{ ...tdStyle, backgroundColor: "#0f0f0f" }}>10 yıl (Vergi Usul Kanunu)</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Güvenlik kamerası kayıtları</td>
                  <td style={tdStyle}>30 gün</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, backgroundColor: "#0f0f0f" }}>İletişim formu verileri</td>
                  <td style={{ ...tdStyle, backgroundColor: "#0f0f0f" }}>3 yıl</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Pazarlama onayları</td>
                  <td style={tdStyle}>Rıza geri alınana kadar</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>7. KVKK Madde 11 Kapsamındaki Haklarınız</h2>
            <p style={textStyle}>
              KVKK'nın 11. maddesi uyarınca veri sahibi olarak aşağıdaki haklara sahipsiniz:
            </p>
            <ul style={listStyle}>
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
              <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
              <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
              <li>
                KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok
                edilmesini isteme
              </li>
              <li>
                Düzeltme, silme ve yok etme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini
                isteme
              </li>
              <li>
                İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize
                bir sonucun ortaya çıkmasına itiraz etme
              </li>
              <li>
                Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın
                giderilmesini talep etme
              </li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>8. Başvuru Yöntemi</h2>
            <p style={textStyle}>
              Yukarıda belirtilen haklarınızı kullanmak için, kimliğinizi doğrulayan belgelerle birlikte yazılı
              başvurunuzu aşağıdaki yollarla iletebilirsiniz:
            </p>
            <ul style={listStyle}>
              <li>
                <strong style={{ color: "#ffffff" }}>Şahsen:</strong> Tabaklar Mahallesi / Uygur Sokak NO:3, Bolu
                adresine kimlik belgesiyle
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>Telefon:</strong> 0374 270 14 55
              </li>
            </ul>
            <p style={textStyle}>
              Başvurularınız, talebin niteliğine göre en geç <strong style={{ color: "#ffffff" }}>30 gün</strong>{" "}
              içinde ücretsiz olarak sonuçlandırılacaktır. Talebin ayrıca bir maliyet gerektirmesi hâlinde Kişisel
              Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret alınabilir.
            </p>
            <p style={textStyle}>
              Başvurunuzun reddedilmesi, verilen yanıtın yetersiz bulunması veya süresinde yanıt verilmemesi hâlinde
              Kişisel Verileri Koruma Kurulu'na şikayette bulunma hakkınız saklıdır.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
