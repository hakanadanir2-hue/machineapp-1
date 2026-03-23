"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const items = [
  {
    label: "Hizmetler",
    sub: "Fitness · Personal Trainer · Boks · Kickboks · Muay Thai",
    href: "/hizmetler",
  },
  {
    label: "Fiyat Listesi",
    sub: "Üyelik · PT Seansları · Boks Paketleri",
    href: "/fiyatlar",
  },
  {
    label: "Randevu Al",
    sub: "Deneme antrenmanı veya danışmanlık için",
    href: "/randevu",
  },
  {
    label: "AI Program",
    sub: "Kişisel antrenman & beslenme programı",
    href: "/program-al",
  },
  {
    label: "BMI Hesapla",
    sub: "Vücut kitle endeksi & ideal kilo",
    href: "/bki",
  },
  {
    label: "Blog",
    sub: "Fitness, beslenme ve sağlıklı yaşam",
    href: "/blog",
  },
];

export default function HomeCards() {
  return (
    <section className="bg-dark py-16">
      <div className="max-w-4xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-gold text-xs font-bold tracking-[0.2em] uppercase text-center mb-10"
        >
          Hızlı Erişim
        </motion.p>

        <div className="divide-y divide-white/5">
          {items.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link
                href={item.href}
                className="group flex items-center justify-between py-5 hover:pl-2 transition-all duration-300"
              >
                <div>
                  <span className="block text-white font-semibold text-lg group-hover:text-gold transition-colors font-heading">
                    {item.label}
                  </span>
                  <span className="text-white/35 text-sm">{item.sub}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300 shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
