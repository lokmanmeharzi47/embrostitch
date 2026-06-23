"use client";

import React, { useEffect, useState, useCallback } from "react";
import ProfessionalCard from "@/components/ui/ProfessionalCard";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface CreatorResult {
  id: string;
  first_name: string;
  last_name: string;
  creator_profiles: {
    specialty: string[];
    description: string;
    avg_rating: number;
    total_reviews: number;
    category: string;
    location: string;
    price_range: string;
    is_verified: boolean;
  };
}

const categoryOptions = [
  { value: "wedding", label: "Robes de mariée" },
  { value: "tailoring", label: "Tailleur sur mesure" },
  { value: "embroidery", label: "Broderie" },
  { value: "alterations", label: "Retouches" },
  { value: "evening_wear", label: "Robes de soirée" },
  { value: "traditional", label: "Tenues traditionnelles" },
  { value: "vintage", label: "Restauration vintage" },
];

const ratingOptions = ["4.5", "4.0", "3.0"];

export default function SearchProfessionalsPage() {
  const [professionals, setProfessionals] = useState<CreatorResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<string>("");
  const [sortBy, setSortBy] = useState("avg_rating");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 9;

  const fetchProfessionals = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("profiles")
      .select(
        `
        id, first_name, last_name,
        creator_profiles!inner (
          specialty, description, avg_rating, total_reviews,
          category, location, price_range, is_verified
        )
      `,
        { count: "exact" }
      )
      .eq("role", "creator");

    // Apply filters
    if (locationQuery.trim()) {
      query = query.ilike("creator_profiles.location", `%${locationQuery.trim()}%`);
    }

    if (selectedCategories.length > 0) {
      query = query.in("creator_profiles.category", selectedCategories);
    }

    if (minRating) {
      query = query.gte("creator_profiles.avg_rating", parseFloat(minRating));
    }

    // Sort
    if (sortBy === "avg_rating") {
      query = query.order("creator_profiles(avg_rating)", { ascending: false });
    } else if (sortBy === "total_reviews") {
      query = query.order("creator_profiles(total_reviews)", { ascending: false });
    }

    // Pagination
    query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, count } = await query;

    if (data) {
      // Client-side search filter on name/specialty
      let filtered = data as unknown as CreatorResult[];
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter((p) => {
          const cp = Array.isArray(p.creator_profiles) ? p.creator_profiles[0] : p.creator_profiles;
          return (
            `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
            cp.specialty?.some((s: string) => s.toLowerCase().includes(q)) ||
            cp.description?.toLowerCase().includes(q)
          );
        });
      }
      setProfessionals(filtered);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [locationQuery, selectedCategories, minRating, sortBy, page, searchQuery]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setPage(0);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMinRating("");
    setSearchQuery("");
    setLocationQuery("");
    setPage(0);
  };

  return (
    <>
      {/* Top Search Banner */}
      <div className="bg-primary/5 py-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">
              Explorer les Créatrices
            </h1>
            <p className="text-muted-foreground mb-6">
              Trouvez les meilleures couturières et créatrices en Algérie
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons text-muted-foreground">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Que recherchez-vous ?"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="sm:w-64 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons text-muted-foreground">
                  location_on
                </span>
                <input
                  type="text"
                  placeholder="Ville"
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    setPage(0);
                  }}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <Button size="lg" className="px-8" onClick={() => fetchProfessionals()}>
                Rechercher
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-28 bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="material-icons text-primary/80">tune</span>
                Filtres
              </h2>
              <button
                className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                onClick={clearFilters}
              >
                Tout effacer
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Spécialité
              </h3>
              <div className="space-y-2">
                {categoryOptions.map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(item.value)}
                      onChange={() => handleCategoryToggle(item.value)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 transition-colors"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Note minimum
              </h3>
              <div className="space-y-2">
                {ratingOptions.map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === item}
                      onChange={() => {
                        setMinRating(item);
                        setPage(0);
                      }}
                      className="w-4 h-4 border-border text-primary focus:ring-primary/20 transition-colors"
                    />
                    <div className="flex items-center gap-1">
                      <span className="material-icons text-warning text-sm">
                        star
                      </span>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {item} et plus
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">
              {loading ? "Recherche..." : `${totalCount} couturière${totalCount > 1 ? "s" : ""} trouvée${totalCount > 1 ? "s" : ""}`}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Trier par :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="avg_rating">Mieux notées</option>
                <option value="total_reviews">Plus d&apos;avis</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
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
          ) : professionals.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                      location={cp.location || ""}
                    />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <span className="material-icons text-muted-foreground text-6xl mb-4">
                search_off
              </span>
              <p className="text-lg font-semibold text-foreground mb-2">
                Aucune couturière trouvée
              </p>
              <p className="text-muted-foreground mb-4">
                Essayez de modifier vos filtres ou votre recherche.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalCount > PAGE_SIZE && (
            <div className="mt-12 flex justify-center gap-3">
              <Button
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Précédent
              </Button>
              <span className="flex items-center text-sm text-muted-foreground">
                Page {page + 1} sur {Math.ceil(totalCount / PAGE_SIZE)}
              </span>
              <Button
                variant="outline"
                disabled={(page + 1) * PAGE_SIZE >= totalCount}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
