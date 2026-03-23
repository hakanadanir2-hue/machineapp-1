import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://nyobwxhyoxtbtmkmrwyc.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55b2J3eGh5b3h0YnRta21yd3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODU1OTIsImV4cCI6MjA4OTI2MTU5Mn0.Oe65ADT54v6hVHyFbor_yLtiBu_zWnNnyVhS_C-Civo",
    NEXT_PUBLIC_WHATSAPP_NUMBER: "905xxxxxxxxx",
    NEXT_PUBLIC_SITE_URL: "https://machinegym.com.tr",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "nyobwxhyoxtbtmkmrwyc.supabase.co" },
    ],
  },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
