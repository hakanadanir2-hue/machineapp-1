"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Dumbbell, Eye, EyeOff, Loader2 } from "lucide-react";

const schema = z.object({
  full_name: z.string().min(2, "Ad soyad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  phone: z.string().min(10, "Geçerli bir telefon numarası girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

type FormData = z.infer<typeof schema>;

function KayitForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name, phone: data.phone },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else if (authData.user) {
      setSuccess(true);
      setTimeout(() => router.push(redirectTo), 2000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Kayıt Başarılı!</h2>
        <p className="text-white/60 text-sm">Paneline yönlendiriliyorsun...</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-700 rounded-2xl border border-dark-600 p-8 shadow-xl">
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm text-white/70 mb-1.5">Ad Soyad</label>
          <input
            {...register("full_name")}
            placeholder="Adın Soyadın"
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 focus:border-gold/50 rounded-xl text-white text-sm outline-none transition-colors placeholder:text-white/30"
          />
          {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1.5">E-posta</label>
          <input
            {...register("email")}
            type="email"
            placeholder="ornek@mail.com"
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 focus:border-gold/50 rounded-xl text-white text-sm outline-none transition-colors placeholder:text-white/30"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1.5">Telefon</label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="05xx xxx xx xx"
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 focus:border-gold/50 rounded-xl text-white text-sm outline-none transition-colors placeholder:text-white/30"
          />
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1.5">Şifre</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 focus:border-gold/50 rounded-xl text-white text-sm outline-none transition-colors placeholder:text-white/30 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-bordo hover:bg-bordo-light text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Kayıt Ol
        </button>
      </form>

      <p className="text-center text-white/50 text-sm mt-6">
        Zaten hesabın var mı?{" "}
        <Link href="/giris" className="text-gold hover:text-gold-light">
          Giriş Yap
        </Link>
      </p>
    </div>
  );
}

export default function KayitPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-bordo rounded-xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-gold" />
            </div>
            <span className="text-2xl font-bold text-white font-heading">
              MACHINE <span className="text-gold">GYM</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white font-heading">Hesap Oluştur</h1>
          <p className="text-white/60 mt-2 text-sm">Ücretsiz kayıt ol, avantajlardan yararlan</p>
        </div>

        <Suspense fallback={<div className="bg-dark-700 rounded-2xl border border-dark-600 p-8 h-80" />}>
          <KayitForm />
        </Suspense>
      </div>
    </div>
  );
}
