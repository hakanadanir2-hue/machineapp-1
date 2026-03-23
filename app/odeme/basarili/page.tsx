import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function OdemeBasariliPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dark flex items-center justify-center px-4 pt-24">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            ✓
          </div>
          <h1 className="text-3xl font-bold text-white font-heading mb-3">Ödeme Başarılı!</h1>
          <p className="text-white/60 mb-6">Programınız hazırlanıyor. PDF&apos;iniz kısa süre içinde panelinize yüklenecektir.</p>
          <Link href="/dashboard/programlarim" className="inline-block px-6 py-3 bg-bordo text-white font-bold rounded-xl hover:bg-bordo-light transition-colors">
            Programlarıma Git →
          </Link>
        </div>
      </main>
    </>
  );
}
