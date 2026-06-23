"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProfessionalCard from "@/components/ui/ProfessionalCard";
import { createClient } from "@/lib/supabase/client";

interface CreatorData {
  id: string;
  first_name: string;
  last_name: string;
  creator_profiles: {
    specialty: string[];
    description: string;
    avg_rating: number;
    total_reviews: number;
    category: string;
  };
}

export default function FeaturedProfessionals() {
  const [professionals, setProfessionals] = useState<CreatorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTop = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select(
          `
          id, first_name, last_name,
          creator_profiles!inner (
            specialty, description, avg_rating, total_reviews, category
          )
        `
        )
        .eq("role", "creator")
        .order("creator_profiles(avg_rating)", { ascending: false })
        .limit(3);

      if (data) setProfessionals(data as unknown as CreatorData[]);
      setLoading(false);
    };
    fetchTop();
  }, []);

  return (
    <section id="professionals" className="py-24 md:py-32 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-4 leading-tight">
              Featured Designers
            </h2>
            <p className="text-lg text-secondary-foreground/70 font-light leading-relaxed">
              Discover the most highly rated artisans on our platform this month.
            </p>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-light transition-colors shrink-0 group uppercase tracking-widest"
          >
            View All Designers
            <span className="material-icons text-base group-hover:translate-x-1 transition-transform">trending_flat</span>
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
              const cp = Array.isArray(pro.creator_profiles)
                ? pro.creator_profiles[0]
                : pro.creator_profiles;
              return (
                <Link key={pro.id} href={`/professionals/${pro.id}`}>
                  <ProfessionalCard
                    name={`${pro.first_name} ${pro.last_name}`}
                    specialty={cp.specialty?.join(", ") || "Couture"}
                    description={cp.description || ""}
                    rating={Number(cp.avg_rating) || 0}
                    reviewCount={cp.total_reviews || 0}
                    location="Alger, Algérie"
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
