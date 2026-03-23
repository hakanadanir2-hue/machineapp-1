"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HomeCTA() {
  return (
    <section className="bg-bordo/10 border-t border-bordo/20 py-16">
      <div className="max-w-xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-white/60 text-sm mb-6">
            Taahhüt yok — ilk antrenman ücretsiz.
          </p>
          <Link
            href="/randevu"
            className="inline-block px-10 py-4 bg-bordo hover:bg-bordo-light text-white font-bold rounded-xl transition-all duration-300 border border-gold/30 hover:border-gold/60 hover:scale-105 text-sm"
          >
            Şimdi Randevu Al
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
