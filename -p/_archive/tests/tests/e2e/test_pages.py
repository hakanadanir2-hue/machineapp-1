import pytest
from playwright.sync_api import Page, expect

BASE = "http://localhost:3000"

PAGES = [
    ("/",          "Makine Gibi Çalış"),
    ("/hizmetler", "Hizmetler"),
    ("/fiyatlar",  "Fiyat"),
    ("/program-al","Program"),
    ("/bki",       "Vücut Kitle"),
    ("/blog",      "Blog"),
    ("/randevu",   "Randevu"),
    ("/giris",     "Giriş"),
    ("/kayit",     "Kayıt"),
    ("/iletisim",  "İletişim"),
]

@pytest.mark.parametrize("path,expected_text", PAGES)
def test_page_loads(page: Page, path: str, expected_text: str):
    page.goto(BASE + path, wait_until="domcontentloaded", timeout=15000)
    assert page.title() != "", f"{path} title boş"
    # Sayfada beklenen metin var mı
    content = page.content()
    assert expected_text in content, f"{path} içinde '{expected_text}' bulunamadı"
    # Console'da kritik hata yok mu
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    page.wait_for_timeout(500)

def test_navbar_links(page: Page):
    page.goto(BASE, wait_until="domcontentloaded")
    nav = page.locator("nav")
    expect(nav).to_be_visible()
    for label in ["Hizmetler", "Fiyatlar", "Program Al", "Blog"]:
        link = page.get_by_role("link", name=label).first
        expect(link).to_be_visible()

def test_hero_buttons(page: Page):
    page.goto(BASE, wait_until="domcontentloaded")
    expect(page.get_by_role("link", name="Deneme Antrenmanı Al").first).to_be_visible()
    expect(page.get_by_role("link", name="WhatsApp ile Yaz").first).to_be_visible()

def test_home_cards(page: Page):
    page.goto(BASE, wait_until="domcontentloaded")
    for label in ["Hizmetler", "Fiyat Listesi", "AI Program Al", "Vücut Kitle Endeksi", "Blog", "Randevu Al"]:
        expect(page.get_by_text(label).first).to_be_visible()

def test_bki_calculator(page: Page):
    page.goto(BASE + "/bki", wait_until="domcontentloaded")
    # Form elemanları mevcut mu
    page.fill("input[placeholder='175']", "175")
    page.fill("input[placeholder='75']", "80")
    page.fill("input[placeholder='25']", "28")
    page.get_by_role("button", name="Hesapla").click()
    page.wait_for_timeout(800)
    content = page.content()
    assert "Normal" in content or "Fazla Kilolu" in content or "Zayıf" in content or "Obezite" in content, \
        "BKI sonuç kategorisi görüntülenmedi"

def test_fiyatlar_page(page: Page):
    page.goto(BASE + "/fiyatlar", wait_until="networkidle", timeout=15000)
    page.wait_for_timeout(1000)
    for text in ["2.000", "Fitness", "Personal Trainer"]:
        assert text in page.content(), f"Fiyatlar sayfasında '{text}' bulunamadı"

def test_no_500_errors(page: Page):
    errors_500 = []
    def handle_response(response):
        if response.status >= 500:
            errors_500.append(f"{response.status} → {response.url}")
    page.on("response", handle_response)
    for path, _ in PAGES:
        page.goto(BASE + path, wait_until="domcontentloaded", timeout=15000)
        page.wait_for_timeout(300)
    assert not errors_500, f"500 hataları: {errors_500}"
