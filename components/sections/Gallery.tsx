"use client";

import { motion } from "framer-motion";

const images = [
  { src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80", alt: "Fitness Salonu", span: "row-span-2" },
  { src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80", alt: "Antrenman Alanı", span: "" },
  { src: "https://images.unsplash.com/photo-1549476464-37392f717541?w=600&q=80", alt: "Boks Alanı", span: "" },
  { src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80", alt: "Kickboks", span: "" },
  { src: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=600&q=80", alt: "Personal Training", span: "col-span-2" },
];

export default function Gallery() {
  return (
    <section id="galeri" className="py-24 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-gold text-sm font-semibold tracking-widest uppercase">
            Tesisimiz
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 font-heading">
            Salon Galerimiz
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-[220px]">
          {images.map((img, i) => (
            <motion.div
              key={img.alt}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-2xl group cursor-pointer ${img.span}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white text-sm font-medium">{img.alt}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
