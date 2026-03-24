import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getSettings, s } from "@/lib/settings";
import LegalPageContent from "@/components/LegalPageContent";

export const metadata = {
  title: "Kullanım Koşulları | Machine Gym",
  description:
    "Machine Gym web sitesi ve hizmetlerine ilişkin kullanım koşullarını okuyun. Siteyi kullanarak bu koşulları kabul etmiş sayılırsınız.",
};

export default async function KosullarPage() {
  const settings = await getSettings();
  const dynamic = s(settings, "legal_kosullar");
  if (dynamic) {
    return (
      <>
        <Navbar />
        <LegalPageContent title="Kullanım Koşulları" content={dynamic} />
        <WhatsAppButton />
        <Footer />
      </>
    );
  }

  // ── Fallback: hardcoded default ──────────────────────────────────────────
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
            Kullanım Koşulları
          </h1>
          <p style={{ color: "#888888", marginBottom: "2.5rem", fontSize: "0.9rem" }}>
            Son güncelleme: Mart 2025
          </p>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>1. Kabul</h2>
            <p style={textStyle}>
              Bu web sitesini ("Site") ziyaret etmek veya kullanmak suretiyle aşağıda belirtilen kullanım
              koşullarını okuduğunuzu, anladığınızı ve bağlayıcılığını kabul ettiğinizi beyan etmiş
              sayılırsınız. Bu koşulları kabul etmiyorsanız lütfen siteyi kullanmayınız.
            </p>
            <p style={textStyle}>
              Site, <strong style={{ color: "#ffffff" }}>Machine Gym</strong> (Tabaklar Mahallesi / Uygur Sokak NO:3,
              Bolu) tarafından işletilmektedir. Machine Gym, bu koşulları önceden haber vermeksizin değiştirme
              hakkını saklı tutar. Değişiklikler sitede yayımlandığı andan itibaren geçerli olur.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>2. Hizmetler</h2>
            <p style={textStyle}>
              Machine Gym, Bolu ilinde faaliyet gösteren bir spor ve fitness merkezi olup aşağıdaki hizmetleri
              sunmaktadır:
            </p>
            <ul style={listStyle}>
              <li>Spor salonu (gym) üyeliği ve ekipmanlara erişim</li>
              <li>Boks ve dövüş sanatları dersleri</li>
              <li>Kişisel antrenörlük hizmetleri</li>
              <li>Grup fitness dersleri</li>
              <li>Online program satışı</li>
              <li>Spor ürünleri ve takviyeleri satışı</li>
              <li>Deneme antrenmanı ve üyelik danışmanlığı</li>
            </ul>
            <p style={textStyle}>
              Bu Site; söz konusu hizmetlere ilişkin bilgi sunmak, randevu almak, üyelik işlemleri yapmak ve
              çevrimiçi satın alım gerçekleştirmek amacıyla kullanılmaktadır.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>3. Üyelik</h2>
            <p style={textStyle}>
              Machine Gym üyeliği, fiziksel tesisimizde veya web sitesi üzerinden gerçekleştirilebilir. Üyelik
              tesisi için geçerli bir kimlik belgesi ve üyelik sözleşmesinin imzalanması zorunludur.
            </p>
            <p style={textStyle}>
              Üyeler aşağıdaki kurallara uymayı kabul eder:
            </p>
            <ul style={listStyle}>
              <li>Tesis kurallarına ve personelin yönlendirmelerine uymak</li>
              <li>Diğer üyelerin ve personelin haklarına saygı göstermek</li>
              <li>Ekipmanları doğru ve güvenli biçimde kullanmak, kullanım sonrası yerlerine bırakmak</li>
              <li>Tesis içinde uygun spor kıyafeti ve kapalı spor ayakkabısı giymek</li>
              <li>Sağlık durumunda değişiklik olması hâlinde personeli bilgilendirmek</li>
              <li>Üyelik kartını veya kimliğini girişte ibraz etmek</li>
              <li>Alkol, uyuşturucu veya tüm performans artırıcı yasadışı maddelerden uzak durmak</li>
            </ul>
            <p style={textStyle}>
              Kural ihlali, taciz, saldırı veya tesis düzenini bozucu davranış tespiti hâlinde Machine Gym,
              üyeliği iptal etme ve tesise girişi yasaklama hakkını saklı tutar.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>4. Ücretler ve Ödemeler</h2>
            <p style={textStyle}>
              Üyelik ücretleri ve paket fiyatları Machine Gym tarafından belirlenir ve önceden duyurulmak
              kaydıyla değiştirilebilir. Geçerli fiyatlar web sitesindeki fiyat listesinde yer almaktadır.
            </p>
            <ul style={listStyle}>
              <li>Ödemeler peşin veya taksitli olarak gerçekleştirilebilir.</li>
              <li>
                Kredi kartı, banka kartı veya nakit ödeme yöntemleri kabul edilmektedir; çevrimiçi ödemelerde
                güvenli ödeme altyapısı kullanılır.
              </li>
              <li>Üyelik süresi başladıktan sonra kullanılmayan günlere dair geri ödeme yapılmaz.</li>
              <li>Dondurma ve erteleme talepleri ayrı koşullara tabidir; detay için personelle iletişime geçiniz.</li>
              <li>
                Çevrimiçi mağazadan yapılan ürün satın alımlarına ilişkin ücretler, siparişin onaylanmasıyla
                tahsil edilir.
              </li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>5. Sorumluluk Reddi</h2>
            <p style={textStyle}>
              Machine Gym, sunduğu hizmetlerde azami özeni göstermekle birlikte aşağıdaki hususlarda
              sorumluluk kabul etmez:
            </p>
            <ul style={listStyle}>
              <li>
                <strong style={{ color: "#ffffff" }}>Yaralanma ve kaza:</strong> Tesis içinde veya tesis
                hizmetleri sırasında meydana gelebilecek kaza veya yaralanmalardan doğan zararlar (kasıt veya
                ağır ihmal hâlleri hariç).
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>Kişisel eşyalar:</strong> Üyelerin tesis içinde bıraktığı
                kişisel eşyaların kaybolmasından veya çalınmasından doğan zararlar.
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>Site erişimi:</strong> Bakım, teknik arıza veya mücbir
                sebepler nedeniyle sitenin geçici olarak erişilemez olmasından doğan zararlar.
              </li>
              <li>
                <strong style={{ color: "#ffffff" }}>Üçüncü taraf içerikleri:</strong> Sitede bağlantı verilen
                üçüncü taraf web sitelerinin içerik, gizlilik politikası veya uygulamalarından doğan zararlar.
              </li>
            </ul>
            <p style={textStyle}>
              Üyeler, fiziksel aktivitelere katılmadan önce bir sağlık uzmanına danışmakla yükümlüdür. Herhangi
              bir sağlık durumu, fiziksel kısıtlama veya geçirilmiş ameliyat/yaralanmayı antrenörlerine bildirmeleri
              gerekmektedir.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>6. Fikri Mülkiyet</h2>
            <p style={textStyle}>
              Bu site üzerindeki tüm içerikler (metin, görsel, logo, marka, tasarım, yazılım kodu) Machine Gym'in
              veya lisans verenlerinin mülkiyetindedir ve fikri mülkiyet mevzuatı kapsamında koruma altındadır.
            </p>
            <ul style={listStyle}>
              <li>Site içeriklerini Machine Gym'in yazılı izni olmaksızın çoğaltmak, dağıtmak veya ticari amaçla kullanmak yasaktır.</li>
              <li>Kişisel, ticari olmayan kullanım amacıyla sınırlı ve kaynak göstererek alıntı yapılabilir.</li>
              <li>Machine Gym logolarını ve markasını izinsiz kullanmak hukuki sonuçlar doğurabilir.</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>7. Değişiklikler</h2>
            <p style={textStyle}>
              Machine Gym, bu kullanım koşullarını herhangi bir zamanda değiştirme hakkına sahiptir.
              Değişiklikler, web sitesinde yayımlandığı tarihten itibaren geçerli olur. Önemli değişiklikler
              site üzerinden duyurulacaktır.
            </p>
            <p style={textStyle}>
              Değişiklik sonrasında siteyi kullanmaya devam etmeniz, güncel koşulları kabul ettiğiniz anlamına
              gelir. Bu nedenle kullanım koşullarını periyodik olarak gözden geçirmenizi öneririz.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>8. Uygulanacak Hukuk</h2>
            <p style={textStyle}>
              Bu kullanım koşulları, Türkiye Cumhuriyeti kanunlarına tabidir. Bu koşullardan doğabilecek her
              türlü anlaşmazlıkta Bolu Mahkemeleri ve İcra Daireleri yetkilidir.
            </p>
            <p style={textStyle}>
              Bu koşulların herhangi bir hükmünün geçersiz veya uygulanamaz bulunması hâlinde, ilgili hüküm
              koşullardan çıkarılır; kalan hükümler geçerliliğini korur.
            </p>
            <p style={textStyle}>
              Bu koşullara ilişkin sorularınız için{" "}
              <strong style={{ color: "#ffffff" }}>0374 270 14 55</strong> numaralı telefondan veya{" "}
              <strong style={{ color: "#ffffff" }}>Tabaklar Mahallesi / Uygur Sokak NO:3, Bolu</strong>{" "}
              adresinden bize ulaşabilirsiniz.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
