"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Camera, MapPin, Search, Sparkles, Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export interface Creation {
  id: string;
  creatorId: string;
  title: string;
  creatorName: string;
  creatorAvatar: string | null;
  city: string | null;
  imageUrl: string;
  category: string | null;
  categoryLabel: string;
  price: number | null;
  priceRange: string | null;
  rating: number | null;
  reviewCount: number;
  createdAt: string | null;
}

interface Props {
  initialCreations: Creation[];
  errorMessage: string | null;
}

const CATEGORIES = ["All", "Traditional", "Modern", "Wedding", "Accessories"] as const;

function categoryBucket(category: string | null, label: string) {
  const normalized = (category || label).toLowerCase();

  if (["traditional", "vintage", "embroidery", "karakou", "caftan"].includes(normalized)) {
    return "Traditional";
  }

  if (["wedding", "evening_wear", "bridal", "mariage"].includes(normalized)) {
    return "Wedding";
  }

  if (["accessory", "accessories", "bijoux", "veil"].includes(normalized)) {
    return "Accessories";
  }

  if (["modern", "tailoring", "alterations", "evening"].includes(normalized)) {
    return "Modern";
  }

  return "Portfolio";
}

function formatPrice(price: number | null, priceRange: string | null) {
  if (typeof price === "number" && Number.isFinite(price) && price > 0) {
    return `${price.toLocaleString("fr-DZ")} DZD`;
  }

  const ranges: Record<string, string> = {
    "$": "Budget",
    "$$": "Intermediaire",
    "$$$": "Premium",
    "$$$$": "Luxe",
  };

  return priceRange ? ranges[priceRange] || priceRange : "Sur devis";
}

function optimizeCloudinaryUrl(url: string) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  return url.replace("/upload/", "/upload/f_auto,q_auto,w_900,c_fill/");
}

function CreationCard({ creation, index }: { creation: Creation; index: number }) {
  const rating = creation.rating && creation.rating > 0 ? creation.rating.toFixed(1) : null;

  return (
    <motion.article
      layout
      key={creation.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.03, 0.18) }}
      className="group overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm transition-shadow hover:shadow-xl"
    >
      <Link href={`/profile/${creation.creatorId}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <Image
            src={optimizeCloudinaryUrl(creation.imageUrl)}
            alt={creation.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 390px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={index < 3}
          />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Badge variant="luxury" className="bg-black/45 px-3 py-1 text-white">
              {creation.categoryLabel}
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-4 pt-16">
            <h2 className="line-clamp-2 text-xl font-black leading-tight text-white">
              {creation.title}
            </h2>
          </div>
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={`/profile/${creation.creatorId}`}
              className="line-clamp-1 font-bold text-foreground hover:text-primary"
            >
              {creation.creatorName}
            </Link>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{creation.city || "Algerie"}</span>
            </div>
          </div>
          <div className="shrink-0 rounded-full bg-primary/8 px-3 py-1 text-sm font-bold text-primary">
            {formatPrice(creation.price, creation.priceRange)}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/70 pt-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Star
              className={cn("h-4 w-4", rating ? "fill-accent text-accent" : "text-muted-foreground/40")}
            />
            <span className="font-semibold text-foreground">{rating || "Nouveau"}</span>
            {rating && <span>({creation.reviewCount} avis)</span>}
          </div>
          <span className="font-semibold capitalize text-muted-foreground">
            {creation.category?.replace(/_/g, " ") || "portfolio"}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default function CreationsGalleryClient({ initialCreations, errorMessage }: Props) {
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCreations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return initialCreations.filter((creation) => {
      const bucket = categoryBucket(creation.category, creation.categoryLabel);
      const matchesCategory = activeCategory === "All" || bucket === activeCategory;
      const matchesSearch =
        query.length === 0 ||
        [
          creation.title,
          creation.creatorName,
          creation.categoryLabel,
          creation.category || "",
          creation.city || "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, initialCreations, searchQuery]);

  const clearFilters = () => {
    setActiveCategory("All");
    setSearchQuery("");
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 pb-20 pt-8">
      <section className="mb-12 max-w-3xl px-2">
        <div className="mb-4 flex items-center gap-2 text-primary">
          <Sparkles size={20} />
          <span className="text-sm font-bold uppercase tracking-widest">Inspiration Gallery</span>
        </div>
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-7xl">
          Masterpiece <span className="text-primary italic">Creations</span>
        </h1>
        <p className="text-lg font-medium leading-relaxed text-muted-foreground md:text-xl">
          Explore the latest published portfolio pieces from EmbroCraftDZ creators.
        </p>
      </section>

      <section className="mb-10 flex flex-col gap-5 border-b border-border/60 px-2 pb-8 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-xl">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={21}
          />
          <Input
            placeholder="Search by creation, creator, city..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-14 rounded-2xl border-border/70 bg-white pl-14 text-base shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex w-full items-center gap-3 overflow-x-auto pb-2 md:w-auto md:pb-0">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              variant={activeCategory === category ? "primary" : "ghost"}
              className={cn(
                "h-11 shrink-0 rounded-xl px-5 font-semibold",
                activeCategory !== category && "bg-white shadow-sm hover:bg-muted"
              )}
            >
              {category}
            </Button>
          ))}
        </div>
      </section>

      {errorMessage && (
        <div className="mb-8 rounded-2xl border border-destructive/20 bg-destructive/8 px-5 py-4 text-sm font-semibold text-destructive">
          {errorMessage}
        </div>
      )}

      {!errorMessage && filteredCreations.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 px-2 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredCreations.map((creation, index) => (
              <CreationCard key={creation.id} creation={creation} index={index} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-4 py-32 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <Camera size={44} className="text-muted-foreground/40" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            {errorMessage ? "Creations indisponibles" : "No creations found"}
          </h2>
          <p className="max-w-md text-muted-foreground">
            {errorMessage
              ? "Veuillez reessayer dans quelques instants."
              : "Try adjusting your category or search terms."}
          </p>
          {!errorMessage && (activeCategory !== "All" || searchQuery) && (
            <Button variant="outline" className="mt-8 rounded-xl px-6" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
