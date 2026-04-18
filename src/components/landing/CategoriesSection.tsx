"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    name: "Karakou & Karako",
    description: "Le joyau de la mode algérienne — veste brodée d'or, pantalon serré.",
    emoji: "✨",
    color: "from-violet-500 to-purple-700",
    bg: "from-violet-50 to-purple-50",
    border: "border-violet-100",
    count: "140+ Artisans",
    href: "/marketplace?category=Karakou",
    featured: true,
  },
  {
    name: "Robes de Mariée",
    description: "Créations somptueuses pour le jour le plus beau de votre vie.",
    emoji: "👰",
    color: "from-rose-400 to-pink-600",
    bg: "from-rose-50 to-pink-50",
    border: "border-rose-100",
    count: "95+ Créatrices",
    href: "/marketplace?category=wedding",
  },
  {
    name: "Caftan & Hayek",
    description: "Élégance marocaine et algérienne fusionnées dans un seul vêtement.",
    emoji: "🌸",
    color: "from-amber-400 to-orange-500",
    bg: "from-amber-50 to-orange-50",
    border: "border-amber-100",
    count: "110+ Ateliers",
    href: "/marketplace?category=caftan",
  },
  {
    name: "Haute Couture",
    description: "Pièces uniques façonnées à la main par des couturières d'exception.",
    emoji: "💎",
    color: "from-indigo-500 to-blue-600",
    bg: "from-indigo-50 to-blue-50",
    border: "border-indigo-100",
    count: "75+ Couturières",
    href: "/marketplace?category=haute_couture",
  },
  {
    name: "Broderie & Dentelle",
    description: "Art ancestral algérien — motifs floraux, géométriques et calligraphiques.",
    emoji: "🧵",
    color: "from-teal-500 to-emerald-600",
    bg: "from-teal-50 to-emerald-50",
    border: "border-teal-100",
    count: "200+ Brodeuses",
    href: "/marketplace?category=embroidery",
  },
  {
    name: "Tenues Quotidiennes",
    description: "Mode pratique et élégante pour sublimer votre style de tous les jours.",
    emoji: "👗",
    color: "from-sky-400 to-cyan-600",
    bg: "from-sky-50 to-cyan-50",
    border: "border-sky-100",
    count: "180+ Couturières",
    href: "/marketplace?category=casual",
  },
  {
    name: "Costumes & Tailleurs",
    description: "Tenues professionnelles sur mesure avec finitions impeccables.",
    emoji: "💼",
    color: "from-slate-500 to-zinc-700",
    bg: "from-slate-50 to-zinc-50",
    border: "border-slate-100",
    count: "60+ Tailleurs",
    href: "/marketplace?category=tailoring",
  },
  {
    name: "Retouches & Ajustements",
    description: "Donnez une seconde vie à vos vêtements préférés.",
    emoji: "✂️",
    color: "from-fuchsia-500 to-purple-600",
    bg: "from-fuchsia-50 to-purple-50",
    border: "border-fuchsia-100",
    count: "300+ Experts",
    href: "/marketplace?category=alterations",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function CategoriesSection() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch('/api/categories/stats');
        const data = await response.json();
        if (data.counts) {
          setCounts(data.counts);
        }
      } catch (e) {
        console.error("Failed to fetch category stats", e);
      }
    };
    fetchCounts();
  }, []);

  const getDynamicCount = (catName: string, catHref: string, fallback: string) => {
    // Attempt to match category identifier from href or name
    const id = catHref.split("=")[1]?.toLowerCase();
    
    // Default suffix depending on original fallback text
    const suffix = fallback.split(' ')[1] || 'Artisans';
    
    // Aggregation logic could be mapped properly, but falling back to original logic if no real users are found 
    // to encourage platform usage without looking completely dead, but since requirement is strictly no fake numbers:
    const realCount = id ? counts[id] || 0 : 0;
    
    // User requested NO FAKE NUMBERS. Strict adherence: actual count from DB!
    return `${realCount} ${suffix}`;
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/4 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/4 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6"
        >
          <div className="max-w-xl">
            <span className="section-label mb-4 inline-flex">
              <span>🧵</span>
              Spécialités
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-4 leading-tight">
              Explorez par{" "}
              <span className="text-gradient-primary">Catégorie</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Des tenues traditionnelles aux créations contemporaines — chaque spécialité vous attend avec les meilleurs artisans d&apos;Algérie.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors shrink-0 group"
          >
            Voir tout le marketplace
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Categories grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {CATEGORIES.map((cat, i) => (
            <motion.div key={cat.name} variants={itemVariants}>
              <Link href={cat.href} className="block h-full group">
                <div
                  className={`relative h-full rounded-2xl bg-gradient-to-br ${cat.bg} border ${cat.border} p-5 overflow-hidden
                    hover:shadow-lg transition-all duration-300 cursor-pointer
                    ${cat.featured ? "lg:col-span-2 row-span-1" : ""}
                  `}
                  style={{
                    transform: "translateZ(0)",
                  }}
                >
                  {/* Hover overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />

                  {/* Top row */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}
                    >
                      {cat.emoji}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                  </div>

                  {/* Content */}
                  <h3 className="font-black text-base text-foreground mb-2 leading-tight group-hover:text-primary transition-colors duration-200">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {cat.description}
                  </p>

                  {/* Count badge */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${cat.color} bg-opacity-10`}
                    style={{ background: "rgba(255,255,255,0.7)" }}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${cat.color}`}
                    />
                    <span className="text-[10px] font-bold text-gray-600">
                      {getDynamicCount(cat.name, cat.href, cat.count)}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl px-8 py-6 border border-primary/10"
        >
          <div>
            <p className="font-bold text-foreground text-lg">Vous ne trouvez pas votre style ?</p>
            <p className="text-sm text-muted-foreground mt-1">Décrivez votre vision et nous trouverons la couturière idéale pour vous.</p>
          </div>
          <Link
            href="/marketplace"
            className="flex items-center gap-2 px-6 py-3 primary-gradient text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:opacity-95 transition-all shrink-0"
          >
            Explorer le Marketplace
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
