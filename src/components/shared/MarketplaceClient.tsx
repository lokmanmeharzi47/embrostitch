"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Star, SlidersHorizontal, X, Check, ChevronDown, Sparkles } from "lucide-react";

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Karakou", value: "karakou" },
  { label: "Bridal", value: "wedding" },
  { label: "Embroidery", value: "embroidery" },
  { label: "Caftan", value: "caftan" },
  { label: "Alterations", value: "alterations" },
  { label: "Vintage", value: "vintage" },
  { label: "Evening Wear", value: "evening_wear" },
  { label: "Traditional", value: "traditional" },
];

const SORT_OPTIONS = [
  { label: "Highest Rated", value: "rating" },
  { label: "Newest", value: "new" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

const ALGERIAN_CITIES = [
  "Alger", "Oran", "Constantine", "Annaba", "Blida",
  "Sétif", "Tlemcen", "Batna", "Sidi Bel Abbès", "Béjaïa",
];

const PRICE_RANGES = [
  { label: "Budget", value: "$" },
  { label: "Intermediate", value: "$$" },
  { label: "Premium", value: "$$$" },
  { label: "Luxury", value: "$$$$" },
];

interface ProfileJoin {
  first_name: string;
  last_name: string;
  city: string | null;
  avatar_url: string | null;
}

interface Professional {
  id: string;
  specialty: string[];
  avg_rating: number;
  total_reviews: number;
  price_range: string | null;
  category: string | null;
  portfolio_images: string[];
  is_verified: boolean;
  profile: ProfileJoin | ProfileJoin[];
}

interface Props {
  initialProfessionals: Professional[];
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80";

function ProfessionalCardGrid({ pro, index }: { pro: Professional; index: number }) {
  const profile = Array.isArray(pro.profile) ? pro.profile[0] : pro.profile;
  const image = pro.portfolio_images?.[0] || DEFAULT_IMAGE;
  const name = profile ? `${profile.first_name} ${profile.last_name}` : "Designer";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }}
      className="group bg-surface rounded-[14px] border border-border overflow-hidden transition-all duration-400 hover:border-primary/20 hover:shadow-sm"
    >
      <Link href={`/profile/${pro.id}`}>
        <div className="relative h-64 w-full overflow-hidden bg-secondary">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Subtle gradient overlay at bottom for text contrast if needed, but keeping it minimal */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

          {/* Verified badge */}
          {pro.is_verified && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-surface/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm border border-border">
              <Check className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Verified</span>
            </div>
          )}

          {/* Rating */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-surface/90 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-sm border border-border">
            <Star className="w-3.5 h-3.5 fill-primary text-primary" />
            <span className="text-xs font-semibold text-foreground">{Number(pro.avg_rating).toFixed(1)}</span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-serif text-lg text-foreground leading-tight group-hover:text-primary transition-colors">{name}</h3>
            <span className="text-xs font-medium text-muted-foreground ml-2 shrink-0">{pro.price_range || "$$"}</span>
          </div>
          
          <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">
            {pro.category?.replace("_", " ") || pro.specialty?.[0] || "Couture Générale"}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-secondary-foreground/70 mb-5">
            <MapPin className="w-3.5 h-3.5" />
            <span className="tracking-wide">{profile?.city || "Algérie"}</span>
            <span className="mx-2 text-border">•</span>
            <span className="tracking-wide">{pro.total_reviews} Reviews</span>
          </div>

          <div className="w-full text-center border-t border-border pt-4 text-[11px] font-medium text-primary uppercase tracking-widest group-hover:text-primary-light transition-colors">
            View Profile
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function MarketplaceClient({ initialProfessionals }: Props) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const filtered = useMemo(() => {
    let results = [...initialProfessionals];

    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter((p) => {
        const profile = Array.isArray(p.profile) ? p.profile[0] : p.profile;
        const fullName = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.toLowerCase();
        const cat = (p.category ?? "").toLowerCase();
        const specs = (p.specialty ?? []).join(" ").toLowerCase();
        return fullName.includes(q) || cat.includes(q) || specs.includes(q);
      });
    }

    if (selectedCategory !== "all") {
      results = results.filter((p) => {
        const cat = (p.category ?? "").toLowerCase();
        const specs = (p.specialty ?? []).map((s) => s.toLowerCase());
        return cat === selectedCategory || specs.includes(selectedCategory);
      });
    }

    if (selectedCity) {
      results = results.filter((p) => {
        const profile = Array.isArray(p.profile) ? p.profile[0] : p.profile;
        return (profile?.city ?? "").toLowerCase().includes(selectedCity.toLowerCase());
      });
    }

    if (selectedPriceRange.length > 0) {
      results = results.filter((p) => selectedPriceRange.includes(p.price_range ?? "$"));
    }

    if (minRating > 0) {
      results = results.filter((p) => (p.avg_rating ?? 0) >= minRating);
    }

    if (sortBy === "rating") results.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0));
    else if (sortBy === "price_asc") {
      const priceOrder = { $: 1, $$: 2, $$$: 3, $$$$: 4 };
      results.sort((a, b) => (priceOrder[a.price_range as keyof typeof priceOrder] ?? 0) - (priceOrder[b.price_range as keyof typeof priceOrder] ?? 0));
    } else if (sortBy === "price_desc") {
      const priceOrder = { $: 1, $$: 2, $$$: 3, $$$$: 4 };
      results.sort((a, b) => (priceOrder[b.price_range as keyof typeof priceOrder] ?? 0) - (priceOrder[a.price_range as keyof typeof priceOrder] ?? 0));
    }

    return results;
  }, [initialProfessionals, search, selectedCategory, selectedCity, selectedPriceRange, minRating, sortBy]);

  const activeFilterCount = [
    selectedCategory !== "all",
    selectedCity !== "",
    selectedPriceRange.length > 0,
    minRating > 0,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedCity("");
    setSelectedPriceRange([]);
    setMinRating(0);
  };

  const togglePriceRange = (val: string) => {
    setSelectedPriceRange((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Editorial Header ── */}
      <div className="bg-secondary/40 py-16 md:py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Discover Designers</h1>
          <p className="text-lg text-secondary-foreground/70 font-light max-w-2xl mx-auto">
            Explore our curated selection of premium artisans and find the perfect creator for your custom piece.
          </p>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="sticky top-[72px] z-40 bg-surface/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search designers, specialties..."
                className="w-full pl-11 pr-4 py-3 text-sm bg-background border border-border rounded-xl outline-none focus:border-primary/40 transition-all font-light"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              {/* Category Chips */}
              <div className="flex items-center gap-2">
                {CATEGORIES.slice(0, 4).map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                      selectedCategory === cat.value
                        ? "bg-primary text-white border-primary"
                        : "bg-surface border-border text-foreground hover:border-primary/40"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Filter button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium text-xs transition-all border shrink-0 ${
                  showFilters || activeFilterCount > 0
                    ? "bg-secondary text-primary border-primary/20"
                    : "bg-surface border-border text-foreground hover:border-primary/40"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>

              {/* Sort */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 px-5 py-2 rounded-full font-medium text-xs bg-surface border border-border text-foreground hover:border-primary/40 transition-all"
                >
                  {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <AnimatePresence>
                  {showSort && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-12 z-50 w-48 bg-surface rounded-xl shadow-lg border border-border p-2"
                    >
                      {SORT_OPTIONS.map((opt) => (
                         <button
                         key={opt.value}
                         onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                         className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                           sortBy === opt.value ? "bg-secondary text-primary" : "hover:bg-secondary/50 text-foreground"
                         }`}
                       >
                         {opt.label}
                       </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Expanding filters panel ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden bg-secondary/30 border-b border-border relative"
          >
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                
                <div>
                  <label className="text-[10px] font-medium text-primary uppercase tracking-widest mb-3 block">Location</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-surface border border-border rounded-xl outline-none focus:border-primary/40 appearance-none"
                  >
                    <option value="">All Cities</option>
                    {ALGERIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-primary uppercase tracking-widest mb-3 block">Price Range</label>
                  <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES.map((range) => (
                      <button key={range.value} onClick={() => togglePriceRange(range.value)}
                        className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${selectedPriceRange.includes(range.value) ? "bg-primary text-white border-primary" : "bg-surface border-border text-foreground hover:border-primary/40"}`}>
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-primary uppercase tracking-widest mb-3 block">Minimum Rating</label>
                  <div className="flex gap-2">
                    {[0, 3, 4, 4.5].map((r) => (
                      <button key={r} onClick={() => setMinRating(r)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border transition-all ${minRating === r ? "bg-primary text-white border-primary" : "bg-surface border-border text-foreground hover:border-primary/40"}`}>
                        {r === 0 ? "Any" : <><Star className="w-3.5 h-3.5 fill-current" />{r}+</>}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-primary uppercase tracking-widest mb-3 block">All Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button key={cat.value} onClick={() => setSelectedCategory(cat.value)}
                        className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${selectedCategory === cat.value ? "bg-primary text-white border-primary" : "bg-surface border-border text-foreground hover:border-primary/40"}`}>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {activeFilterCount > 0 && (
                <div className="mt-8 flex justify-end">
                  <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-2">
                    <X className="w-4 h-4" /> Reset Filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Results header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-serif text-foreground">
            {filtered.length === 0 ? "No designers found" : `${filtered.length} Designer${filtered.length > 1 ? "s" : ""}`}
            {search && <span className="text-secondary-foreground font-sans text-sm ml-2 font-light">for "{search}"</span>}
          </h2>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-primary/40" />
            </div>
            <h3 className="text-2xl font-serif text-foreground mb-3">No designers match your criteria</h3>
            <p className="text-secondary-foreground font-light text-sm max-w-sm mb-8">
              Try adjusting your filters or searching with different keywords to find what you're looking for.
            </p>
            <button
              onClick={clearFilters}
              className="px-8 py-3 bg-surface border border-border text-foreground rounded-full font-medium text-sm hover:border-primary/40 transition-colors"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((pro, i) => (
                <ProfessionalCardGrid key={pro.id} pro={pro} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
