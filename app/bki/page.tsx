"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Link from "next/link";
import { Calculator, ChevronRight, Info } from "lucide-react";

interface BKIResult {
  bki: number;
  category: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  recommendation: string;
  idealMin: number;
  idealMax: number;
}

function calculateBKI(height: number, weight: number, gender: string, age: number): BKIResult {
  const heightM = height / 100;
  const bki = weight / (heightM * heightM);
  const rounded = Math.round(bki * 10) / 10;

  const idealMin = Math.round(18.5 * heightM * heightM * 10) / 10;
  const idealMax = Math.round(24.9 * heightM * heightM * 10) / 10;

  let category: string;
  let color: string;
  let bgColor: string;
  let borderColor: string;
  let description: string;
  let recommendation: string;

  if (bki < 18.5) {
    category = "Zayıf";
    color = "text-blue-400";
    bgColor = "bg-blue-500/10";
    borderColor = "border-blue-500/30";
    description = "Vücut kitle endeksiniz normal aralığın altında. Kas kütlesi ve yağ oranı düşük olabilir.";
    recommendation = "Kalori artışı + direnç antrenmanı ile kas kütlesi kazanmanı öneririz. Personal trainer desteği faydalı olacaktır.";
  } else if (bki < 25) {
    category = "Normal";
    color = "text-emerald-400";
    bgColor = "bg-emerald-500/10";
    borderColor = "border-emerald-500/30";
    description = "Vücut kitle endeksiniz sağlıklı aralıkta. Bu değeri korumak uzun vadeli sağlık için idealdir.";
    recommendation = "Mevcut kilonuzu koruyarak fitness seviyenizi artırabilirsiniz. Form çalışması veya boks dersleri harika bir seçim!";
  } else if (bki < 30) {
    category = "Fazla Kilolu";
    color = "text-yellow-400";
    bgColor = "bg-yellow-500/10";
    borderColor = "border-yellow-500/30";
    description = "Vücut kitle endeksiniz sağlıklı aralığın biraz üzerinde. Kardiyovasküler risk artmış olabilir.";
    recommendation = "Düzenli egzersiz ve dengeli beslenme ile normal kiloya ulaşabilirsiniz. Kilo verme programımız tam size göre.";
  } else if (bki < 35) {
    category = "Obezite 1. Derece";
    color = "text-orange-400";
    bgColor = "bg-orange-500/10";
    borderColor = "border-orange-500/30";
    description = "Obezite 1. derece aralığında. Diyabet, hipertansiyon ve kardiyovasküler hastalık riski artmış.";
    recommendation = "Hedefli kilo yönetimi programı ve haftada en az 3 gün egzersiz önerilir. Uzman eğitmenlerimizle başlayabilirsiniz.";
  } else if (bki < 40) {
    category = "Obezite 2. Derece";
    color = "text-red-400";
    bgColor = "bg-red-500/10";
    borderColor = "border-red-500/30";
    description = "Obezite 2. derece. Sağlık riskleri ciddi seviyede artmış durumda.";
    recommendation = "Önce doktorunuzla görüşmenizi tavsiye ederiz. Ardından kişisel antrenör eşliğinde güvenli bir egzersiz programı başlatılabilir.";
  } else {
    category = "Obezite 3. Derece";
    color = "text-red-500";
    bgColor = "bg-red-600/10";
    borderColor = "border-red-600/30";
    description = "Obezite 3. derece (morbid obezite). Acil tıbbi değerlendirme gerektirir.";
    recommendation = "Doktor gözetiminde, kişisel antrenör desteğiyle güvenli ve yavaş bir program başlatabilirsiniz. İlk adım için bizi arayın.";
  }

  return { bki: rounded, category, color, bgColor, borderColor, description, recommendation, idealMin, idealMax };
}

const categories = [
  { label: "Zayıf", range: "< 18.5", color: "bg-blue-500" },
  { label: "Normal", range: "18.5 – 24.9", color: "bg-emerald-500" },
  { label: "Fazla Kilolu", range: "25 – 29.9", color: "bg-yellow-500" },
  { label: "Obezite 1", range: "30 – 34.9", color: "bg-orange-500" },
  { label: "Obezite 2", range: "35 – 39.9", color: "bg-red-500" },
  { label: "Obezite 3", range: "≥ 40", color: "bg-red-700" },
];

export default function BKIPage() {
  const [form, setForm] = useState({ height: "", weight: "", gender: "male", age: "" });
  const [result, setResult] = useState<BKIResult | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    const h = parseFloat(form.height);
    const w = parseFloat(form.weight);
    const a = parseInt(form.age);

    if (!h || !w || !a || h < 100 || h > 250 || w < 20 || w > 300 || a < 10 || a > 100) {
      setError("Lütfen geçerli değerler girin.");
      setResult(null);
      return;
    }
    setError("");
    setResult(calculateBKI(h, w, form.gender, a));
  };

  const bkiPercent = result
    ? Math.min(Math.max(((result.bki - 10) / (50 - 10)) * 100, 0), 100)
    : null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dark pt-28 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-bordo/20 border border-bordo/40 rounded-full text-gold text-xs font-bold tracking-widest uppercase mb-5">
              <Calculator className="w-3.5 h-3.5" />
              Ücretsiz Hesaplama
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white font-heading mb-3">
              Vücut Kitle Endeksi
            </h1>
            <p className="text-white/50 text-sm leading-relaxed">
              BKI (BMI), boy ve kilona göre vücut yağ oranını tahmin eden bir ölçüttür.
              Dünya Sağlık Örgütü (WHO) sınıflandırmasına göre sonuç alırsın.
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-dark-800 border border-dark-600 rounded-2xl p-6 sm:p-8 mb-6"
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">
                  Boy (cm)
                </label>
                <input
                  type="number"
                  placeholder="175"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-600 focus:border-gold/50 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none transition-colors text-lg font-semibold"
                />
              </div>
              <div>
                <label className="block text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">
                  Kilo (kg)
                </label>
                <input
                  type="number"
                  placeholder="75"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-600 focus:border-gold/50 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none transition-colors text-lg font-semibold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">
                  Cinsiyet
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ value: "male", label: "Erkek" }, { value: "female", label: "Kadın" }].map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setForm({ ...form, gender: g.value })}
                      className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                        form.gender === g.value
                          ? "bg-bordo border-gold/40 text-white"
                          : "bg-dark-700 border-dark-600 text-white/50 hover:border-bordo/40"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">
                  Yaş
                </label>
                <input
                  type="number"
                  placeholder="25"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-600 focus:border-gold/50 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none transition-colors text-lg font-semibold"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
            )}

            <button
              onClick={handleCalculate}
              className="w-full py-4 bg-bordo hover:bg-bordo-light text-white font-bold rounded-xl transition-all duration-300 border border-gold/30 hover:border-gold/60 hover:scale-[1.02] text-base"
            >
              Hesapla
            </button>
          </motion.div>

          {/* Sonuç */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className={`${result.bgColor} border ${result.borderColor} rounded-2xl p-6 sm:p-8 mb-6`}
              >
                <div className="text-center mb-6">
                  <p className="text-white/50 text-sm mb-1">Senin BKI değerin</p>
                  <p className={`text-6xl font-bold font-heading ${result.color} mb-2`}>
                    {result.bki}
                  </p>
                  <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold bg-dark-700 ${result.color}`}>
                    {result.category}
                  </span>
                </div>

                {/* Gösterge çubuğu */}
                <div className="mb-6">
                  <div className="relative h-3 rounded-full overflow-hidden bg-dark-700">
                    <div className="absolute inset-0 flex">
                      <div className="flex-1 bg-blue-500 opacity-70" />
                      <div className="flex-1 bg-emerald-500 opacity-70" />
                      <div className="flex-1 bg-yellow-500 opacity-70" />
                      <div className="flex-1 bg-orange-500 opacity-70" />
                      <div className="flex-1 bg-red-500 opacity-70" />
                    </div>
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-dark shadow-lg transition-all duration-700"
                      style={{ left: `calc(${bkiPercent}% - 8px)` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/30 mt-1.5">
                    <span>10</span>
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                    <span>35</span>
                    <span>40+</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-dark/40 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
                      <p className="text-white/70 text-sm leading-relaxed">{result.description}</p>
                    </div>
                  </div>

                  <div className="bg-dark/40 rounded-xl p-4">
                    <p className="text-xs text-white/40 font-bold uppercase tracking-wide mb-2">Öneri</p>
                    <p className="text-white/80 text-sm leading-relaxed">{result.recommendation}</p>
                  </div>

                  <div className="bg-dark/40 rounded-xl p-4">
                    <p className="text-xs text-white/40 font-bold uppercase tracking-wide mb-2">
                      Sağlıklı Kilo Aralığın
                    </p>
                    <p className="text-white font-bold text-lg">
                      {result.idealMin} – {result.idealMax} <span className="text-white/40 font-normal text-sm">kg</span>
                    </p>
                    <p className="text-white/40 text-xs mt-1">Boy: {form.height} cm için BKI 18.5–24.9 aralığı</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/program-al"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-bordo hover:bg-bordo-light text-white text-sm font-bold rounded-xl border border-gold/30 transition-all"
                  >
                    AI Program Al <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/randevu"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-dark-700 hover:bg-dark-600 text-white text-sm font-semibold rounded-xl border border-dark-600 transition-all"
                  >
                    Danışmanlık Al <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Kategori Tablosu */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-dark-800 border border-dark-600 rounded-2xl p-6"
          >
            <h3 className="text-white font-bold mb-4 font-heading">WHO BKI Sınıflandırması</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${cat.color}`} />
                  <span className="text-white/70 text-sm flex-1">{cat.label}</span>
                  <span className="text-white/40 text-sm font-mono">{cat.range}</span>
                </div>
              ))}
            </div>
            <p className="text-white/30 text-xs mt-4 leading-relaxed">
              BKI tek başına vücut yağ oranını kesin olarak ölçmez. Kas kütlesi yüksek bireylerde yanıltıcı olabilir. Kesin analiz için salon ölçümlerimizi öneririz.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
