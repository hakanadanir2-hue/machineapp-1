"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Dumbbell, Eye, EyeOff, Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

type FormData = z.infer<typeof schema>;

export default function GirisPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setError("E-posta veya şifre hatalı.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4">
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
          <h1 className="text-3xl font-bold text-white font-heading">Giriş Yap</h1>
          <p className="text-white/60 mt-2 text-sm">Hesabına giriş yap</p>
        </div>

        <div className="bg-dark-700 rounded-2xl border border-dark-600 p-8 shadow-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              Giriş Yap
            </button>
          </form>

          <p className="text-center text-white/50 text-sm mt-6">
            Hesabın yok mu?{" "}
            <Link href="/kayit" className="text-gold hover:text-gold-light">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
