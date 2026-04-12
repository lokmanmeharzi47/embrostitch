"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface PlatformStats {
  total_couturieres: number;
  total_orders_completed: number;
  overall_avg_rating: number;
  cities_covered: number;
}

export default function HeroSection() {
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("platform_stats")
        .select("*")
        .single();
      if (data) setStats(data as PlatformStats);
    };
    fetchStats();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-secondary via-white to-[#f0eeff]" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text Content */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-primary">
                {stats
                  ? `${stats.total_couturieres}+ Couturières Expertes`
                  : "Couturières Expertes"}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-6">
              Votre Style,{" "}
              <span className="text-primary">Sur Mesure.</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Connectez-vous avec des couturières expertes et des ateliers de
              broderie pour donner vie à vos créations uniques. Du quotidien au
              luxe.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/search">
                <Button variant="primary" size="lg">
                  <span className="material-icons text-base">search</span>
                  Trouver une Couturière
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg">
                  Rejoindre en tant que Couturière
                </Button>
              </Link>
            </div>

            {/* Dynamic Stats */}
            <div className="flex items-center gap-8 mt-10 pt-8 border-t border-border/50">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats ? `${stats.total_orders_completed.toLocaleString()}+` : "..."}
                </p>
                <p className="text-xs text-muted-foreground">
                  Commandes Réalisées
                </p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats ? `${stats.overall_avg_rating}/5` : "..."}
                </p>
                <p className="text-xs text-muted-foreground">Note Moyenne</p>
              </div>
              <div className="w-px h-10 bg-border hidden sm:block" />
              <div className="hidden sm:block">
                <p className="text-2xl font-bold text-foreground">
                  {stats ? `${stats.cities_covered}+` : "..."}
                </p>
                <p className="text-xs text-muted-foreground">Villes</p>
              </div>
            </div>
          </div>

          {/* Right: Visual Grid */}
          <div className="hidden lg:block relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-4 transform hover:scale-105 transition-transform duration-300 mt-8">
                <div className="h-48 bg-linear-to-br from-[#f0eeff] to-[#e0deff] rounded-xl mb-3 flex items-center justify-center">
                  <span className="material-icons text-primary/40 text-6xl">
                    checkroom
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Haute Couture
                </p>
                <p className="text-xs text-muted-foreground">
                  Robes de mariée sur mesure
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-4 transform hover:scale-105 transition-transform duration-300">
                <div className="h-48 bg-linear-to-br from-[#fff0f0] to-[#ffe0e0] rounded-xl mb-3 flex items-center justify-center">
                  <span className="material-icons text-[#e05048]/40 text-6xl">
                    design_services
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Tailleur Sur Mesure
                </p>
                <p className="text-xs text-muted-foreground">
                  Costumes et tailleurs parfaits
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-4 transform hover:scale-105 transition-transform duration-300">
                <div className="h-48 bg-linear-to-br from-[#f0fff4] to-[#e0ffe8] rounded-xl mb-3 flex items-center justify-center">
                  <span className="material-icons text-success/40 text-6xl">
                    palette
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Broderie Artisanale
                </p>
                <p className="text-xs text-muted-foreground">
                  Motifs traditionnels et modernes
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-4 transform hover:scale-105 transition-transform duration-300 mt-8">
                <div className="h-48 bg-linear-to-br from-[#fff8f0] to-[#ffeed0] rounded-xl mb-3 flex items-center justify-center">
                  <span className="material-icons text-warning/40 text-6xl">
                    auto_fix_high
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Retouches
                </p>
                <p className="text-xs text-muted-foreground">
                  Ajustements experts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
