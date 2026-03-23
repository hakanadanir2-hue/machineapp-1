"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ahmet Y.",
    role: "Fitness Üyesi — 8 Ay",
    text: "Machine Gym'e gelmeden önce 3 salonu denedim. Buradaki profesyonellik ve ekipman kalitesi gerçekten üstün. 8 ayda 22 kg verdim.",
    stars: 5,
  },
  {
    name: "Selin K.",
    role: "Personal Training — 6 Ay",
    text: "Kişisel antrenörüm Gökhan Bey harika. Programa sadakatle yaklaşıyorum çünkü bilimsel temel var. Güvenilir, sonuç odaklı bir salon.",
    stars: 5,
  },
  {
    name: "Mert T.",
    role: "Boks — 1 Yıl",
    text: "Boks antrenmanlarım sayesinde hem kondisyon hem de özgüven kazandım. Hocalar gerçekten işini bilen profesyoneller.",
    stars: 5,
  },
  {
    name: "Fatma D.",
    role: "Kickboks — 4 Ay",
    text: "Kadın olarak çekiniyordum ama ekip çok destekleyici. Şu an hayatımın en iyi formundayım. Teşekkürler Machine Gym!",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-gold text-sm font-semibold tracking-widest uppercase">
            Üye Yorumları
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 font-heading">
            Gerçek Sonuçlar, Gerçek İnsanlar
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-dark-700 rounded-2xl p-6 border border-dark-600 hover:border-bordo/30 transition-colors relative"
            >
              <Quote className="w-8 h-8 text-bordo/40 mb-4" />
              <p className="text-white/80 leading-relaxed mb-5 text-sm">{t.text}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/50 text-xs mt-0.5">{t.role}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-gold fill-gold" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
