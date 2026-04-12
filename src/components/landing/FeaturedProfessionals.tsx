"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProfessionalCard from "@/components/ui/ProfessionalCard";
import { createClient } from "@/lib/supabase/client";

interface CouturiereData {
  id: string;
  first_name: string;
  last_name: string;
  couturiere_profiles: {
    specialty: string[];
    description: string;
    avg_rating: number;
    total_reviews: number;
    category: string;
  };
}

export default function FeaturedProfessionals() {
  const [professionals, setProfessionals] = useState<CouturiereData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTop = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select(
          `
          id, first_name, last_name,
          couturiere_profiles!inner (
            specialty, description, avg_rating, total_reviews, category
          )
        `
        )
        .eq("role", "couturiere")
        .order("couturiere_profiles(avg_rating)", { ascending: false })
        .limit(3);

      if (data) setProfessionals(data as unknown as CouturiereData[]);
      setLoading(false);
    };
    fetchTop();
  }, []);

  return (
    <section id="professionals" className="py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-4">
              <span className="material-icons text-primary text-sm">
                workspace_premium
              </span>
              <span className="text-xs font-semibold text-primary">
                Les Mieux Notées
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Couturières en Vedette
            </h2>
            <p className="text-muted-foreground">
              Les créatrices les mieux notées de notre plateforme ce mois-ci.
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:underline mt-4 sm:mt-0"
          >
            Voir toutes les couturières
            <span className="material-icons text-base">trending_flat</span>
          </Link>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border overflow-hidden animate-pulse"
              >
                <div className="h-56 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((pro) => {
              const cp = Array.isArray(pro.couturiere_profiles)
                ? pro.couturiere_profiles[0]
                : pro.couturiere_profiles;
              return (
                <Link key={pro.id} href={`/professionals/${pro.id}`}>
                  <ProfessionalCard
                    name={`${pro.first_name} ${pro.last_name}`}
                    specialty={cp.specialty?.join(", ") || "Couture"}
                    description={cp.description || ""}
                    rating={Number(cp.avg_rating) || 0}
                    reviewCount={cp.total_reviews || 0}
                    imagePlaceholder={cp.category || ""}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
