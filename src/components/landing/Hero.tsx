"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Search, MapPin, Sparkles, Star, ArrowRight, Shield, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

interface PlatformStats {
  total_couturieres: number;
  total_orders_completed: number;
  overall_avg_rating: number;
  cities_covered: number;
}

const SEARCH_SUGGESTIONS = [
  "Karakou en velours...",
  "Robe de mariée...",
  "Broderie traditionnelle...",
  "Caftan moderne...",
  "Costume sur mesure...",
];

const CATEGORY_PILLS = ["Karakou", "Mariée", "Broderie", "Caftan", "Moderne", "Retouches"];

const getFloatingBadges = (stats: PlatformStats | null) => [
  {
    icon: "⭐",
    text: stats ? `${Number(stats.overall_avg_rating).toFixed(1)} / 5` : "4.9 / 5",
    sub: "Note Moyenne",
    colorFrom: "#fffbeb",
    colorTo: "#fef3c7",
    border: "rgba(251,191,36,0.25)",
    delay: 0,
    duration: 5.5,
  },
  {
    icon: "✅",
    text: "Vérifié",
    sub: "Artisan Expert",
    colorFrom: "#f0fdf4",
    colorTo: "#dcfce7",
    border: "rgba(34,197,94,0.2)",
    delay: 1.2,
    duration: 6.5,
  },
  {
    icon: "🎨",
    text: stats ? `${stats.total_orders_completed}+ Créations` : "500+ Créations",
    sub: "Portfolio Riche",
    colorFrom: "#faf5ff",
    colorTo: "#f3e8ff",
    border: "rgba(167,139,250,0.25)",
    delay: 0.7,
    duration: 7,
  },
];

export default function Hero() {
  const t = useTranslations("Hero");
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, 60]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % SEARCH_SUGGESTIONS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/hero/stats');
        const data = await response.json();
        if (data.stats) {
           setStats(data.stats);
        }
      } catch (e) {
        console.error("Failed to fetch hero stats", e);
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-var(--header-height))] flex flex-col items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/6 rounded-full blur-[120px] pointer-events-none" />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #4F46E5 1.5px, transparent 1.5px)`,
          backgroundSize: "52px 52px",
        }}
      />

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-muted-foreground/60"
        animate={{ y: [0, 7, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
      >
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Défiler</span>
        <ChevronDown className="w-4 h-4" />
      </motion.div>

      <motion.div
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20"
      >
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* ── LEFT: Content ── */}
          <div className="flex-1 max-w-2xl text-center lg:text-left">

            {/* Trust pill */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2.5 bg-white/90 border border-primary/12 rounded-full px-4 py-2 mb-8 shadow-sm"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                ))}
              </div>
              <div className="h-3.5 w-px bg-border" />
              <span className="text-xs font-bold text-foreground">
                {stats
                  ? `${stats.total_couturieres}+ ${t('verifiedCouturieres')}`
                  : t('verifiedCouturieres')}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-[4.5rem] font-black leading-[1.06] tracking-tight mb-6 text-balance"
            >
              <span className="text-foreground">{t('titlePart1')}</span>
              <br />
              <span className="text-gradient-primary inline-block">{t('titlePart2')}</span>
              <br />
              <span className="text-foreground">{t('titlePart3')}</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.35 }}
              className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0"
            >
              {t('subtitle')}
            </motion.p>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.45 }}
              className="mb-8"
            >
              <div className="relative flex items-center bg-white rounded-2xl shadow-lg border border-border/50 p-1.5 max-w-xl mx-auto lg:mx-0 hover:shadow-xl hover:border-primary/20 transition-all duration-300 focus-within:border-primary/30 focus-within:shadow-lg">
                <div className="flex items-center gap-2 px-3 pr-4 border-r border-border shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground hidden sm:block">Alger</span>
                </div>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchValue) {
                      window.location.href = `/marketplace?q=${encodeURIComponent(searchValue)}`;
                    }
                  }}
                  placeholder={SEARCH_SUGGESTIONS[placeholderIdx]}
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/50 transition-all"
                />
                <Link href={`/marketplace${searchValue ? `?q=${encodeURIComponent(searchValue)}` : ""}`}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-4 sm:px-5 py-2.5 primary-gradient text-white rounded-xl font-bold text-sm shadow-md cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:block">{t('search')}</span>
                  </motion.div>
                </Link>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center lg:justify-start">
                {CATEGORY_PILLS.map((cat, i) => (
                  <motion.div
                    key={cat}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.07 }}
                  >
                    <Link href={`/marketplace?category=${encodeURIComponent(cat)}`}>
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-border/80 text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 cursor-pointer shadow-sm">
                        {cat}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.55 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-12"
            >
              <Button variant="luxury" size="lg" asChild className="gap-2 shadow-lg shadow-primary/20 rounded-2xl">
                <Link href="/marketplace">
                  {t('findCouturiere')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="rounded-2xl border-2">
                <Link href="/auth/register">{t('becomeCouturiere')}</Link>
              </Button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.65 }}
              className="flex flex-wrap items-center gap-6 justify-center lg:justify-start"
            >
              {[
                { value: stats ? `${stats.total_orders_completed.toLocaleString()}+` : "1,200+", label: "Commandes" },
                { value: stats ? `${Number(stats.overall_avg_rating).toFixed(1)}/5` : "4.9/5", label: "Note Moyenne" },
                { value: stats ? `${stats.cities_covered}+` : "48+", label: "Wilayas" },
              ].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="w-px h-8 bg-border" />}
                  <div className="text-center lg:text-left">
                    <p className="text-2xl font-black text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                  </div>
                </React.Fragment>
              ))}
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground ml-2">
                <Shield className="w-4 h-4 text-success" />
                <span className="font-semibold">Paiements sécurisés</span>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT: Showcase Card ── */}
          <div className="hidden lg:block relative flex-shrink-0 w-[420px] h-[500px]">

            {/* Main showcase card */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, type: "spring", stiffness: 80, damping: 18 }}
              className="absolute top-8 inset-x-0 bg-white rounded-3xl shadow-2xl overflow-hidden border border-border/30"
            >
              {/* Image area */}
              <div
                className="relative h-52 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 40%, #fef3c7 100%)",
                }}
              >
                {/* Algerian geometric pattern */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 25% 75%, rgba(79,70,229,0.3) 0%, transparent 45%),
                      radial-gradient(circle at 75% 25%, rgba(245,158,11,0.3) 0%, transparent 45%)
                    `,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 border-[3px] border-primary/25 rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 border-[2px] border-accent/30 rotate-45" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 border-[2px] border-primary/20 rounded-full" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary/40" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md">
                    <div className="status-online animate-pulse" />
                    <span className="text-xs font-bold text-foreground">Disponible</span>
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-black text-lg text-foreground">Yasmine Bouchebak</h3>
                    <p className="text-primary font-semibold text-sm">Haute Couture · Broderie Traditionnelle</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-xl px-2.5 py-1.5">
                    <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                    <span className="text-xs font-black text-amber-700">4.97</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Alger Centre
                  </div>
                  <div className="h-3 w-px bg-border" />
                  <span>214 avis</span>
                  <div className="h-3 w-px bg-border" />
                  <span className="font-bold text-foreground">$$</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {["Karakou", "Mariée", "Moderne"].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-primary/8 text-primary rounded-full text-[10px] font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="w-full py-2.5 primary-gradient text-white rounded-xl font-bold text-sm text-center">
                  Voir le profil →
                </div>
              </div>
            </motion.div>

            {/* Floating badge elements */}
            {getFloatingBadges(stats).map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + badge.delay, type: "spring", stiffness: 130, damping: 15 }}
                style={{
                  position: "absolute",
                  background: `linear-gradient(135deg, ${badge.colorFrom}, ${badge.colorTo})`,
                  border: `1px solid ${badge.border}`,
                  borderRadius: "1rem",
                  padding: "10px 14px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  animation: `float ${badge.duration}s ease-in-out infinite`,
                  animationDelay: `${badge.delay}s`,
                  top: i === 0 ? "-10px" : "auto",
                  bottom: i === 1 ? "120px" : i === 2 ? "55px" : "auto",
                  right: i === 0 ? "-18px" : i === 1 ? "-22px" : "auto",
                  left: i === 2 ? "-18px" : "auto",
                  zIndex: 20,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl leading-none">{badge.icon}</span>
                  <div>
                    <p className="text-xs font-black text-gray-800 leading-tight">{badge.text}</p>
                    <p className="text-[10px] text-gray-500 leading-tight">{badge.sub}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </motion.div>
    </section>
  );
}
