"use client";
import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  quote?: string;
  author?: string;
}

export default function AuthLayout({
  children,
  imageSrc = "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=2070&auto=format&fit=crop",
  imageAlt = "Artisanat algérien",
  quote = "Chaque création porte l'âme de son artisane — une histoire tissée avec amour.",
  author = "MALIXA",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col lg:flex-row">
      {/* ── Form side ── */}
      <div className="flex-1 flex flex-col justify-center px-5 sm:px-10 lg:px-16 xl:px-20 py-10">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[1.15rem] font-black text-foreground tracking-tight">
                MALIXA<span className="text-primary">DZ</span>
              </span>
              <span className="text-[9px] text-muted-foreground font-bold tracking-[0.2em] uppercase mt-0.5">
                Couture Artisanale
              </span>
            </div>
          </Link>

          {children}

          {/* Footer */}
          <div className="mt-10 pt-5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground/70">
            <span>© 2026 MALIXA</span>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-primary transition-colors">Confidentialité</Link>
              <Link href="/terms"   className="hover:text-primary transition-colors">Conditions</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Image side (desktop) ── */}
      <div className="hidden lg:block relative w-[46%] xl:w-[48%] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageSrc} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" />

        {/* Warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#130800]/88 via-[#2d1a0e]/30 to-[#0f0930]/20" />

        {/* Decorative geometry */}
        <div className="absolute top-10 right-10 w-20 h-20 border border-white/10 rounded-3xl rotate-12" />
        <div className="absolute top-16 right-16 w-12 h-12 border border-amber-400/15 rounded-xl rotate-6" />
        <div className="absolute bottom-40 left-8 w-6 h-6 rounded-full bg-amber-400/20" />

        {/* Top brand mark */}
        <div className="absolute top-8 left-8 flex items-center gap-2 text-white/75">
          <div className="w-7 h-7 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[13px] font-black tracking-tight">MALIXA</span>
        </div>

        {/* Quote block */}
        <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
          {/* Stars */}
          <div className="flex gap-1 mb-5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-[1.15rem] font-medium leading-relaxed mb-5 text-white/95">
            &ldquo;{quote}&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-amber-400/70" />
            <p className="text-xs font-semibold text-white/65 tracking-wide uppercase">{author}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
