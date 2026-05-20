"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Star, SlidersHorizontal, X, Check, ChevronDown, Grid3X3, List, Sparkles, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const CATEGORIES = [
  { label: "Tous", value: "all" },
  { label: "Karakou", value: "karakou" },
  { label: "Mariée", value: "wedding" },
  { label: "Broderie", value: "embroidery" },
  { label: "Caftan", value: "caftan" },
  { label: "Retouches", value: "alterations" },
  { label: "Vintage", value: "vintage" },
  { label: "Tenue du Soir", value: "evening_wear" },
  { label: "Traditionnel", value: "traditional" },
];

const SORT_OPTIONS = [
  { label: "Mieux notés", value: "rating" },
  { label: "Nouveaux", value: "new" },
  { label: "Prix croissant", value: "price_asc" },
  { label: "Prix décroissant", value: "price_desc" },
];

const ALGERIAN_CITIES = [
  "Alger", "Oran", "Constantine", "Annaba", "Blida",
  "Sétif", "Tlemcen", "Batna", "Sidi Bel Abbès", "Béjaïa",
];

const PRICE_RANGES = [
  { label: "Budget", value: "$", max: 5000 },
  { label: "Intermédiaire", value: "$$", max: 15000 },
  { label: "Premium", value: "$$$", max: 40000 },
  { label: "Luxe", value: "$$$$", max: 999999 },
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

function priceLabel(range: string | null) {
  const map: Record<string, string> = {
    "$": "Budget",
    "$$": "Intermédiaire",
    "$$$": "Premium",
    "$$$$": "Luxe",
  };
  return range ? map[range] || range : "Sur devis";
}

function ProfessionalCardGrid({ pro, index }: { pro: Professional; index: number }) {
  const profile = Array.isArray(pro.profile) ? pro.profile[0] : pro.profile;
  const image = pro.portfolio_images?.[0] || DEFAULT_IMAGE;
  const name = profile ? `${profile.first_name} ${profile.last_name}` : "Couturière";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="pro-card group"
    >
      {/* Image */}
      <div className="relative h-40 sm:h-52 w-full overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Rating badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-sm">
            <Star className="w-3 h-3 fill-accent text-accent" />
            <span className="text-xs font-black text-gray-800">{Number(pro.avg_rating).toFixed(1)}</span>
          </div>
        </div>

        {/* Verified badge */}
        {pro.is_verified && (
          <div className="absolute top-3 left-3 z-10">
            <div className="flex items-center gap-1 bg-emerald-500 rounded-full px-2.5 py-1 shadow-sm">
              <Check className="w-2.5 h-2.5 text-white" />
              <span className="text-[10px] font-black text-white">Vérifié</span>
            </div>
          </div>
        )}

        {/* Availability dot */}
        <div className="absolute bottom-3 left-3 z-10">
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-bold text-gray-700">Disponible</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-black text-base text-foreground leading-tight line-clamp-1">{name}</h3>
          <span className="text-xs font-bold text-muted-foreground ml-2 shrink-0">{pro.price_range || "$$"}</span>
        </div>
        <p className="text-xs font-semibold text-primary mb-2 capitalize">
          {pro.category?.replace("_", " ") || pro.specialty?.[0] || "Couture Générale"}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{profile?.city || "Algérie"}</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <span>{pro.total_reviews} avis</span>
        </div>

        {/* Specialty tags */}
        {pro.specialty && pro.specialty.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {pro.specialty.slice(0, 2).map((s) => (
              <span key={s} className="px-2 py-0.5 bg-primary/6 text-primary rounded-full text-[10px] font-bold">
                {s}
              </span>
            ))}
          </div>
        )}

        <Link href={`/profile/${pro.id}`}>
          <button className="w-full py-2.5 primary-gradient text-white rounded-xl font-bold text-xs hover:opacity-90 transition-opacity">
            Voir le Profil
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function MarketplaceClient({ initialProfessionals }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const filtered = useMemo(() => {
    let results = [...initialProfessionals];

    // Search filter
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

    // Category
    if (selectedCategory !== "all") {
      results = results.filter((p) => {
        const cat = (p.category ?? "").toLowerCase();
        const specs = (p.specialty ?? []).map((s) => s.toLowerCase());
        return cat === selectedCategory || specs.includes(selectedCategory);
      });
    }

    // City
    if (selectedCity) {
      results = results.filter((p) => {
        const profile = Array.isArray(p.profile) ? p.profile[0] : p.profile;
        return (profile?.city ?? "").toLowerCase().includes(selectedCity.toLowerCase());
      });
    }

    // Price range
    if (selectedPriceRange.length > 0) {
      results = results.filter((p) => selectedPriceRange.includes(p.price_range ?? "$"));
    }

    // Rating
    if (minRating > 0) {
      results = results.filter((p) => (p.avg_rating ?? 0) >= minRating);
    }

    // Sort
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
      {/* ── Top bar ── */}
      <div className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-md border-b border-border/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom, spécialité, style..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-muted/60 border border-border/50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category pills (desktop) */}
            <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === cat.value
                      ? "primary-gradient text-white shadow-sm"
                      : "bg-muted/80 text-muted-foreground hover:bg-primary/8 hover:text-primary"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Filter button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                showFilters || activeFilterCount > 0
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-border text-foreground hover:border-primary/40"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:block">Filtres</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white/20 text-white text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-white border border-border text-foreground hover:border-primary/40 transition-all"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:block">{SORT_OPTIONS.find((s) => s.value === sortBy)?.label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <AnimatePresence>
                {showSort && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 z-50 w-48 bg-white rounded-2xl shadow-xl border border-border/60 p-2 overflow-hidden"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          sortBy === opt.value ? "bg-primary/8 text-primary" : "hover:bg-muted text-foreground"
                        }`}
                      >
                        {sortBy === opt.value && <Check className="w-3.5 h-3.5 inline mr-2 text-primary" />}
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* View mode */}
            <div className="hidden md:flex items-center bg-muted rounded-xl p-1">
              {(["grid", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-lg transition-all ${viewMode === mode ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {mode === "grid" ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop: Expanding filters panel ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="hidden md:block overflow-hidden bg-white border-b border-border/60 shadow-sm z-30 relative"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 block">Ville</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 text-sm bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                    >
                      <option value="">Toutes les villes</option>
                      {ALGERIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 block">Budget</label>
                  <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES.map((range) => (
                      <button key={range.value} onClick={() => togglePriceRange(range.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${selectedPriceRange.includes(range.value) ? "bg-primary text-white border-primary" : "bg-white border-border text-foreground hover:border-primary/40"}`}>
                        {range.value} · {range.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 block">Note minimum</label>
                  <div className="flex gap-2">
                    {[0, 3, 4, 4.5].map((r) => (
                      <button key={r} onClick={() => setMinRating(r)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${minRating === r ? "bg-primary text-white border-primary" : "bg-white border-border text-foreground hover:border-primary/40"}`}>
                        {r === 0 ? "Tous" : <><Star className="w-3 h-3 fill-current" />{r}+</>}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="lg:hidden">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 block">Catégorie</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button key={cat.value} onClick={() => setSelectedCategory(cat.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${selectedCategory === cat.value ? "bg-primary text-white border-primary" : "bg-white border-border text-foreground hover:border-primary/40"}`}>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                {activeFilterCount > 0 && (
                  <div className="flex items-end">
                    <button onClick={clearFilters} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors font-semibold">
                      <X className="w-4 h-4" />Réinitialiser les filtres
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile: Bottom sheet filters ── */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl overflow-hidden"
              style={{ maxHeight: "85vh", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
                <h3 className="text-base font-black text-foreground">
                  Filtres {activeFilterCount > 0 && <span className="ml-1.5 text-xs font-bold text-white bg-primary px-2 py-0.5 rounded-full">{activeFilterCount}</span>}
                </h3>
                <button onClick={() => setShowFilters(false)} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Scrollable content */}
              <div className="overflow-y-auto px-5 py-5 space-y-6" style={{ maxHeight: "calc(85vh - 100px)" }}>
                {/* Catégorie */}
                <div>
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 block">Catégorie</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button key={cat.value} onClick={() => setSelectedCategory(cat.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${selectedCategory === cat.value ? "bg-primary text-white border-primary" : "bg-white border-border text-foreground"}`}>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Ville */}
                <div>
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 block">Ville</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 text-sm bg-muted/50 border border-border rounded-xl outline-none appearance-none">
                      <option value="">Toutes les villes</option>
                      {ALGERIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                {/* Budget */}
                <div>
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 block">Budget</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRICE_RANGES.map((range) => (
                      <button key={range.value} onClick={() => togglePriceRange(range.value)}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all text-center ${selectedPriceRange.includes(range.value) ? "bg-primary text-white border-primary" : "bg-white border-border text-foreground"}`}>
                        {range.value} · {range.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Note */}
                <div>
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 block">Note minimum</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 3, 4, 4.5].map((r) => (
                      <button key={r} onClick={() => setMinRating(r)}
                        className={`flex flex-col items-center py-3 rounded-xl text-xs font-bold border transition-all ${minRating === r ? "bg-primary text-white border-primary" : "bg-white border-border text-foreground"}`}>
                        {r === 0 ? "Tous" : <><Star className="w-3 h-3 fill-current mb-0.5" />{r}+</>}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex gap-3 pt-2 pb-4">
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-muted-foreground">
                      Réinitialiser
                    </button>
                  )}
                  <button onClick={() => setShowFilters(false)} className="flex-1 py-3 primary-gradient text-white rounded-xl text-sm font-bold">
                    Voir les résultats ({filtered.length})
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-foreground">
              {filtered.length === 0 ? "Aucun résultat" : `${filtered.length} Couturière${filtered.length > 1 ? "s" : ""}`}
            </h1>
            {search && (
              <p className="text-sm text-muted-foreground mt-0.5">
                pour &ldquo;<span className="text-foreground font-semibold">{search}</span>&rdquo;
              </p>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors font-semibold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Effacer les filtres
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">Aucune couturière trouvée</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Essayez d&apos;ajuster vos filtres ou d&apos;élargir votre recherche.
            </p>
            <button
              onClick={clearFilters}
              className="mt-6 px-6 py-3 primary-gradient text-white rounded-xl font-bold text-sm"
            >
              Réinitialiser les filtres
            </button>
          </motion.div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5"
                : "flex flex-col gap-4"
            }
          >
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
