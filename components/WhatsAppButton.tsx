"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const phone = "903742701455";
  const message = encodeURIComponent(
    "Merhaba, Machine Gym hakkında bilgi almak istiyorum."
  );
  const href = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile yaz"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-green-500/30 transition-all duration-300 hover:scale-110"
    >
      <MessageCircle className="w-7 h-7 text-white fill-white" />
    </a>
  );
}
