"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";

interface PlatformStats {
  total_creators: number;
}

export default function Hero() {
  const t = useTranslations("Hero");
  const router = useRouter();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [query, setQuery] = useState("");

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/marketplace?search=${encodeURIComponent(trimmed)}` : "/marketplace");
  };

  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Editorial Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />

      {/* Warm Cream Overlay */}
      <div className="absolute inset-0 z-0 bg-[#F8EDE1]/85 backdrop-blur-sm" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 py-20 text-center flex flex-col items-center">

        {/* Trust pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2.5 bg-surface/80 backdrop-blur-md border border-border rounded-full px-5 py-2 mb-10 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <div className="h-4 w-px bg-border" />
          <span className="text-xs font-medium tracking-wide text-foreground uppercase">
            {stats ? `${stats.total_creators}+ ${t('verifiedCreators')}` : t('verifiedCreators')}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
          className="text-4xl sm:text-6xl lg:text-7xl font-serif text-foreground leading-[1.1] mb-8 text-balance max-w-4xl"
        >
          {t('titlePart1')}{" "}
          <span className="text-primary italic">{t('titlePart2')}</span>{" "}
          {t('titlePart3')}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-lg sm:text-xl text-secondary-foreground/80 leading-relaxed mb-10 max-w-2xl text-balance font-light"
        >
          {t('subtitle')}
        </motion.p>

        {/* Search bar */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease: "easeOut" }}
          className="w-full max-w-xl mb-8"
        >
          <div className="flex items-center gap-2 bg-surface border border-border rounded-full p-2 shadow-sm focus-within:border-primary/40 transition-colors">
            <Search className="w-4 h-4 text-muted-foreground ms-3 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-2 min-w-0"
            />
            <Button type="submit" className="rounded-full px-6 shrink-0">
              {t('search')}
            </Button>
          </div>
        </motion.form>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto"
        >
          <Button size="lg" asChild className="rounded-full px-8 py-6 text-base font-medium shadow-none hover:shadow-lg transition-all duration-300">
            <Link href="/marketplace">
              {t('findCreator')}
              <ArrowRight className="w-4 h-4 ms-2" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="rounded-full px-8 py-6 text-base font-medium bg-transparent border-primary text-primary hover:bg-primary/5 transition-all duration-300">
            <Link href="/register">
              {t('becomeCreator')}
            </Link>
          </Button>
        </motion.div>

      </div>
    </section>
  );
}
