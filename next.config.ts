import type { NextConfig } from "next";

// Supabase host'u env'den al — hardcode etme (build-time mismatch önlenir)
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_HOST = SUPABASE_URL.replace("https://", "").replace("http://", "").split("/")[0];

const GOOGLE_HOSTS =
  "https://www.googletagmanager.com " +
  "https://www.google-analytics.com " +
  "https://googleads.g.doubleclick.net " +
  "https://www.googleadservices.com " +
  "https://googlesyndication.com";

// CSP — Supabase host dinamik, fazladan servis izinleri açık
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${GOOGLE_HOSTS}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  `img-src 'self' data: blob: https://images.unsplash.com https://${SUPABASE_HOST} https://www.google.com https://www.google.com.tr https://www.googletagmanager.com`,
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://api.resend.com ${GOOGLE_HOSTS}`,
  "frame-src https://www.paytr.com https://www.googletagmanager.com https://www.youtube.com https://www.youtube-nocookie.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://www.paytr.com",
  "object-src 'none'",
  "worker-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // SUPABASE_HOST build-time'da boş olabilir (Vercel'de env'den gelir)
      // Bu yüzden wildcard pattern ekliyoruz
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy",   value: CSP },
          { key: "Strict-Transport-Security",  value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options",            value: "DENY" },
          { key: "X-Content-Type-Options",     value: "nosniff" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control",     value: "on" },
        ],
      },
    ];
  },

  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
