"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Brain, FileText, Dumbbell, Apple, ChevronRight } from "lucide-react";

const features = [
  { icon: Brain, text: "BMR & TDEE Hesaplama (Mifflin-St Jeor)" },
  { icon: Apple, text: "Günlük Öğün Planı (5 Öğün)" },
  { icon: Dumbbell, text: "8 Haftalık Antrenman Programı" },
  { icon: FileText, text: "Kişisel PDF Rapor" },
];

export default function ProgramCTA() {
  return (
    <section className="py-24 bg-dark-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-bordo/20 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-gold text-sm font-semibold tracking-widest uppercase">
              Bilimsel Program
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-6 font-heading leading-tight">
              Sana Özel Program,{" "}
              <span className="text-gold">Sadece 199₺</span>
            </h2>
            <p className="text-white/60 mb-8 leading-relaxed">
              ACSM, NASM ve NSCA prensipleri ile hazırlanan bilimsel programınız.
              Boy, kilo, yaş ve hedefinize göre BMR/TDEE hesaplanır; kişisel
              antrenman ve beslenme planı PDF olarak teslim edilir.
            </p>

            <ul className="space-y-3 mb-8">
              {features.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-bordo/30 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-gold" />
                  </div>
                  <span className="text-white/80 text-sm">{text}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/program-al"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold hover:bg-gold-light text-dark font-bold rounded-xl transition-all duration-300 text-base hover:scale-105 shadow-lg hover:shadow-gold/30"
            >
              Programımı Oluştur
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="bg-dark-700 rounded-2xl border border-bordo/30 p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-bordo/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-white font-bold text-lg font-heading">Örnek Program Özeti</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "BMR", value: "1.847 kcal/gün" },
                  { label: "TDEE", value: "2.861 kcal/gün" },
                  { label: "Hedef Kalori", value: "2.361 kcal/gün" },
                  { label: "Protein", value: "176g / gün" },
                  { label: "Karbonhidrat", value: "248g / gün" },
                  { label: "Yağ", value: "74g / gün" },
                  { label: "Program Süresi", value: "8 Hafta" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-dark-600">
                    <span className="text-white/60 text-sm">{item.label}</span>
                    <span className="text-gold font-semibold text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-3 bg-bordo/20 rounded-xl text-center">
                <p className="text-gold text-xs font-medium">Sadece 199₺ — Anında PDF Teslim</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
