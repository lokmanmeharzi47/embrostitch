"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

interface PlatformStats {
  total_creators: number;
}

export default function Hero() {
  const t = useTranslations("Hero");
  const [stats, setStats] = useState<PlatformStats | null>(null);

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
    <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Editorial Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1583391733958-d25e07fac044?auto=format&fit=crop&q=80')`,
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
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
            ))}
          </div>
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
          Your Vision, Crafted by Artisans
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-lg sm:text-xl text-secondary-foreground/80 leading-relaxed mb-12 max-w-2xl text-balance font-light"
        >
          Discover the art of custom couture. Connect with premium Algerian designers and bring your unique fashion dreams to life.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto"
        >
          <Button size="lg" asChild className="rounded-full px-8 py-6 text-base font-medium shadow-none hover:shadow-lg transition-all duration-300">
            <Link href="/marketplace">
              Create Your Custom Order
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="rounded-full px-8 py-6 text-base font-medium bg-transparent border-primary text-primary hover:bg-primary/5 transition-all duration-300">
            <Link href="/discover">
              Discover Designers
            </Link>
          </Button>
        </motion.div>

      </div>
    </section>
  );
}
