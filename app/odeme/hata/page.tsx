import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function OdemeHataPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dark flex items-center justify-center px-4 pt-24">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            ✕
          </div>
          <h1 className="text-3xl font-bold text-white font-heading mb-3">Ödeme Başarısız</h1>
          <p className="text-white/60 mb-6">Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin veya bize ulaşın.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/program-al" className="px-5 py-3 bg-bordo text-white font-bold rounded-xl hover:bg-bordo-light transition-colors">
              Tekrar Dene
            </Link>
            <Link href="/iletisim" className="px-5 py-3 border border-white/20 text-white/70 rounded-xl hover:border-bordo/50 transition-colors">
              İletişime Geç
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
