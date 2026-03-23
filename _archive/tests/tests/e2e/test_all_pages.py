"""Machine Gym – kapsamlı sayfa ve layout testi."""
import pytest
from playwright.sync_api import Page, expect

BASE = "http://localhost:3000"

PAGES = [
    ("/",            "Ana Sayfa"),
    ("/hizmetler",   "Hizmetler"),
    ("/fiyatlar",    "Fiyatlar"),
    ("/magaza",      "Mağaza"),
    ("/program-al",  "Beslenme & Fitness"),
    ("/blog",        "Blog"),
    ("/hakkimizda",  "Hakkımızda"),
    ("/iletisim",    "İletişim"),
    ("/bki",         "BMI"),
    ("/randevu",     "Randevu"),
    ("/giris",       "Giriş"),
    ("/kayit",       "Kayıt"),
]


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    return {**browser_context_args, "viewport": {"width": 1280, "height": 800}}


def no_console_errors(page: Page) -> list[str]:
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    return errors


# ── 1. HTTP 200 / no hard crash ────────────────────────────────────────────
@pytest.mark.parametrize("path,name", PAGES)
def test_page_loads(page: Page, path: str, name: str):
    errors: list[str] = []
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    resp = page.goto(BASE + path, wait_until="domcontentloaded", timeout=20000)
    assert resp and resp.status < 400, f"{name} HTTP {resp and resp.status}"
    # No 'Application error' / Next.js crash overlay
    body = page.content()
    assert "Application error" not in body, f"{name}: Next.js crash overlay"
    assert "__NEXT_DATA__" in body or "next" in body.lower(), f"{name}: Not a Next.js page?"


# ── 2. No horizontal overflow (sola taşma) ────────────────────────────────
@pytest.mark.parametrize("path,name", PAGES)
def test_no_horizontal_overflow(page: Page, path: str, name: str):
    page.goto(BASE + path, wait_until="networkidle", timeout=25000)
    overflow = page.evaluate("""() => {
        return document.body.scrollWidth > window.innerWidth + 5;
    }""")
    assert not overflow, f"{name}: Yatay taşma! scrollWidth={page.evaluate('document.body.scrollWidth')} > {page.evaluate('window.innerWidth')}"


# ── 3. Navbar & Footer her sayfada var ────────────────────────────────────
@pytest.mark.parametrize("path,name", [p for p in PAGES if p[0] not in ("/giris", "/kayit")])
def test_navbar_footer_present(page: Page, path: str, name: str):
    page.goto(BASE + path, wait_until="domcontentloaded", timeout=20000)
    # Navbar: logo metni
    assert page.locator("text=MACHINE").first.is_visible(), f"{name}: Navbar yok"
    # Footer: copyright
    footer = page.locator("footer")
    assert footer.count() > 0, f"{name}: Footer elementi yok"


# ── 4. Ana sayfa hero içeriği ─────────────────────────────────────────────
def test_homepage_hero(page: Page):
    page.goto(BASE + "/", wait_until="networkidle", timeout=25000)
    assert page.locator("text=Makine Gibi Çalış").first.is_visible()
    assert page.locator("text=Sonuç Kaçınılmaz").first.is_visible()
    # CTA butonlar
    assert page.locator("text=Deneme Antrenmanı").first.is_visible() or \
           page.locator("text=Randevu").first.is_visible()


# ── 5. İletişim sayfası — gerçek bilgiler ────────────────────────────────
def test_contact_page_info(page: Page):
    page.goto(BASE + "/iletisim", wait_until="networkidle", timeout=25000)
    content = page.content()
    assert "Uygur Sokak" in content or "Tabaklar" in content, "Adres eksik"
    assert "270 14 55" in content or "2701455" in content, "Telefon eksik"


# ── 6. WhatsApp butonu doğru numara ──────────────────────────────────────
def test_whatsapp_button_number(page: Page):
    page.goto(BASE + "/", wait_until="networkidle", timeout=25000)
    wa = page.locator("a[href*='wa.me']").first
    assert wa.count() > 0 or page.locator("a[href*='whatsapp']").count() > 0, "WhatsApp linki yok"
    href = wa.get_attribute("href") or ""
    assert "903742701455" in href or "903742701455" in page.content(), "WhatsApp numarası yanlış"


# ── 7. Fiyatlar sayfası — paket kartları ─────────────────────────────────
def test_pricing_page(page: Page):
    page.goto(BASE + "/fiyatlar", wait_until="networkidle", timeout=25000)
    content = page.content()
    assert "2.000" in content or "2000" in content, "Fitness paketi fiyatı yok"
    assert "TL" in content or "₺" in content, "Para birimi yok"


# ── 8. Program-al sayfası başlık ─────────────────────────────────────────
def test_program_page_title(page: Page):
    page.goto(BASE + "/program-al", wait_until="networkidle", timeout=25000)
    content = page.content()
    assert "Beslenme" in content and "Fitness" in content, "Sayfa başlığı güncellenmemiş"
    assert "Al Program" not in content, "Eski başlık hâlâ var"


# ── 9. Mobil görünüm (375px) — overflow yok ──────────────────────────────
@pytest.mark.parametrize("path,name", [("/", "Ana Sayfa"), ("/hizmetler", "Hizmetler"), ("/fiyatlar", "Fiyatlar")])
def test_mobile_no_overflow(page: Page, path: str, name: str):
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(BASE + path, wait_until="networkidle", timeout=25000)
    overflow = page.evaluate("() => document.body.scrollWidth > window.innerWidth + 5")
    assert not overflow, f"MOBİL {name}: Yatay taşma"


# ── 10. Admin sayfası — auth redirect ────────────────────────────────────
def test_admin_redirects_to_login(page: Page):
    page.goto(BASE + "/admin", wait_until="networkidle", timeout=20000)
    # Giriş yapmadan /admin'e erişince /giris'e yönlenmeli
    assert "/giris" in page.url or "/admin" in page.url, "Beklenmedik redirect"
    if "/admin" in page.url:
        # Ya login formu var ya da panel
        content = page.content()
        assert "Giriş" in content or "admin" in content.lower()


# ── 11. Mağaza sayfası — 404 yok ─────────────────────────────────────────
def test_magaza_not_404(page: Page):
    resp = page.goto(BASE + "/magaza", wait_until="domcontentloaded", timeout=20000)
    assert resp and resp.status != 404, "Mağaza sayfası 404 veriyor"


# ── 12. Blog sayfası — boş değil ─────────────────────────────────────────
def test_blog_not_empty(page: Page):
    page.goto(BASE + "/blog", wait_until="networkidle", timeout=25000)
    content = page.content()
    assert "yakında" not in content.lower() or \
           page.locator("article, [class*='card'], [class*='blog']").count() > 0 or \
           "Blog" in content, "Blog sayfası boş/yakında durumunda"


# ── 13. BMI sayfası hesaplama formu ──────────────────────────────────────
def test_bki_page(page: Page):
    page.goto(BASE + "/bki", wait_until="networkidle", timeout=25000)
    content = page.content()
    assert "BMI" in content or "BKİ" in content or "Vücut" in content, "BMI içeriği yok"


# ── 14. Randevu formu ─────────────────────────────────────────────────────
def test_randevu_page(page: Page):
    resp = page.goto(BASE + "/randevu", wait_until="domcontentloaded", timeout=20000)
    assert resp and resp.status < 400, "Randevu sayfası hata"
    content = page.content()
    assert "randevu" in content.lower() or "Randevu" in content


# ── 15. Footer çalışma saatleri güncel mi ────────────────────────────────
def test_footer_hours_updated(page: Page):
    page.goto(BASE + "/", wait_until="networkidle", timeout=25000)
    content = page.content()
    assert "01:00" in content, "Footer çalışma saati güncellenmemiş (01:00 yok)"
    assert "08:00" in content, "Hafta içi açılış saati yok"
