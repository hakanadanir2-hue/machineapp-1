"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Dumbbell, User, Target, Zap, Shield } from "lucide-react";

const services = [
  {
    icon: Dumbbell,
    title: "Fitness Üyelik",
    description:
      "Modern ekipmanlar, klimatize ortam ve profesyonel rehberlik eşliğinde fitness hedeflerinize ulaşın.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
    cta: "Üyelik Başlat",
    href: "/fiyatlar",
  },
  {
    icon: User,
    title: "Personal Trainer",
    description:
      "Sertifikalı kişisel antrenörlerimizle bire bir çalışın. Kişiye özel program, hızlı ve güvenli ilerleme.",
    image: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=600&q=80",
    cta: "Randevu Al",
    href: "/randevu",
  },
  {
    icon: Target,
    title: "Boks Özel Ders",
    description:
      "Profesyonel boks teknikleri, kondisyon ve defans çalışmalarıyla kendinizi geliştirin.",
    image: "https://images.unsplash.com/photo-1549476464-37392f717541?w=600&q=80",
    cta: "Ders Planla",
    href: "/randevu",
  },
  {
    icon: Zap,
    title: "Kickboks",
    description:
      "Tam vücut egzersizi sağlayan kickboks dersleriyle hem kondisyon hem de öz savunma becerisi kazanın.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
    cta: "Hemen Başla",
    href: "/randevu",
  },
  {
    icon: Shield,
    title: "Muay Thai",
    description:
      "Tayland boks sanatı ile sekiz uzvunuzu kullanmayı öğrenin. Disiplin, güç ve esneklik.",
    image: "https://images.unsplash.com/photo-1604480132736-44c188fe4d20?w=600&q=80",
    cta: "Deneme Dersi",
    href: "/randevu",
  },
];

export default function Services() {
  return (
    <section id="hizmetler" className="py-24 bg-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-gold text-sm font-semibold tracking-widest uppercase">
            Ne Sunuyoruz
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4 font-heading">
            Hizmetlerimiz
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Her seviye ve hedefe uygun profesyonel spor hizmetleri. Uzman
            kadromuzla hedeflerinize ulaşmanız garantili.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-dark-700 border border-dark-600 hover:border-bordo/50 transition-all duration-300 hover:shadow-2xl hover:shadow-bordo/10"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-700 via-dark-700/40 to-transparent" />
                  <div className="absolute top-4 left-4 w-10 h-10 bg-bordo/90 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 font-heading group-hover:text-gold transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-5">
                    {service.description}
                  </p>
                  <Link
                    href={service.href}
                    className="inline-flex items-center gap-1 text-gold text-sm font-semibold hover:gap-2 transition-all"
                  >
                    {service.cta} →
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
