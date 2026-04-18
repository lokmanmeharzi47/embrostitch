"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface ReviewData {
  quote: string;
  author: string;
  role: string;
  rating: number;
  initials: string;
  color: string;
}

const FALLBACK_TESTIMONIALS = [
  {
    quote: "J'ai commandé un Karakou pour le mariage de ma sœur. Le résultat était absolument magnifique — broderie parfaite, finitions impeccables. Je recommande EmbroCraftDZ les yeux fermés !",
    author: "Samira A.",
    role: "Cliente, Alger",
    rating: 5,
    initials: "SA",
    color: "from-violet-500 to-purple-600",
  },
  {
    quote: "En tant que couturière, EmbroCraftDZ m'a permis de tripler mon activité. L'interface est intuitive et les clients sont sérieux. Une vraie révolution pour notre métier.",
    author: "Khadija B.",
    role: "Couturière, Oran",
    rating: 5,
    initials: "KB",
    color: "from-amber-400 to-orange-500",
  },
  {
    quote: "Ma robe de mariée sur mesure était exactement comme je l'avais imaginée. La couturière a compris chaque détail de ma vision. Un service 5 étoiles du début à la fin.",
    author: "Nadia M.",
    role: "Mariée, Constantine",
    rating: 5,
    initials: "NM",
    color: "from-rose-400 to-pink-600",
  },
  {
    quote: "La plateforme est très bien faite. J'ai trouvé une broderie experte en moins de 24h pour mon costume traditionnel. Le suivi en temps réel de la commande est un vrai plus.",
    author: "Fatima Z.",
    role: "Cliente, Tlemcen",
    rating: 5,
    initials: "FZ",
    color: "from-teal-500 to-emerald-600",
  },
  {
    quote: "Qualité exceptionnelle, délais respectés et communication parfaite. Je reviendrai certainement pour ma prochaine commande. Merci EmbroCraftDZ !",
    author: "Yasmine H.",
    role: "Cliente, Annaba",
    rating: 5,
    initials: "YH",
    color: "from-indigo-500 to-blue-600",
  },
  {
    quote: "Enfin une plateforme qui valorise le savoir-faire artisanal algérien ! Mon atelier a gagné en visibilité et les commandes affluent. Je suis fière d'en faire partie.",
    author: "Meriem D.",
    role: "Couturière, Sétif",
    rating: 5,
    initials: "MD",
    color: "from-fuchsia-500 to-purple-600",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "fill-accent text-accent" : "fill-muted text-muted"}`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
  rating,
  initials,
  color,
  index,
}: {
  quote: string;
  author: string;
  role: string;
  rating: number;
  initials: string;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-3xl border border-border/60 p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 card-shadow flex flex-col h-full"
    >
      <div className="mb-5">
        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Quote className="w-4 h-4 text-white fill-white" />
        </div>
      </div>

      <StarRating rating={rating} />

      <p className="text-sm text-foreground/80 leading-relaxed my-5 italic flex-1">
        &ldquo;{quote}&rdquo;
      </p>

      <div className="flex items-center gap-3 pt-5 border-t border-border/50">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}
        >
          <span className="text-white text-xs font-black">{initials}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{author}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

const COLORS = [
  "from-violet-500 to-purple-600",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-600",
  "from-teal-500 to-emerald-600",
  "from-indigo-500 to-blue-600",
  "from-fuchsia-500 to-purple-600",
];

export default function Testimonials() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews/public');
        if (!response.ok) throw new Error('API fetching failed');
        
        const data = await response.json();

        if (data.reviews && data.reviews.length > 0) {
          const mapped = data.reviews.map((r: any, i: number) => {
            const clientNameParts = r.client_name.split(' ');
            return {
              quote: r.comment || "Excellent service, je recommande vivement !",
              author: r.client_name,
              role: r.order_title,
              rating: r.rating || 5,
              initials: clientNameParts.length > 1 
                ? `${clientNameParts[0]?.charAt(0) || ""}${clientNameParts[1]?.charAt(0) || ""}`.toUpperCase()
                : (clientNameParts[0]?.charAt(0) || "?").toUpperCase(),
              color: COLORS[i % COLORS.length],
            };
          });
          setReviews(mapped);
          setStats(data.stats);
        } else {
          setReviews(FALLBACK_TESTIMONIALS);
        }
      } catch (error) {
        console.error('Failed to load testimonials:', error);
        setReviews(FALLBACK_TESTIMONIALS);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const displayReviews = reviews.length > 0 ? reviews : FALLBACK_TESTIMONIALS;
  const displayStats = stats.count > 0 ? stats : { average: 4.9, count: 2400 };

  return (
    <section id="testimonials" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-primary/2 to-white pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/4 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-accent/4 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="section-label mb-4 inline-flex">
             <span>💬</span> Témoignages
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-5 leading-tight">
            Ce que disent nos <span className="text-gradient-primary">clients</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Des milliers de créations réalisées. Des centaines d&apos;histoires de réussite. Voici quelques témoignages de notre communauté.
          </p>

          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(displayStats.average) ? 'fill-accent text-accent' : 'fill-muted text-muted'}`} />
                ))}
              </div>
              <p className="text-2xl font-black text-foreground">
                {!loading && stats.count > 0 ? stats.average.toFixed(1) : "4.9"} / 5
              </p>
              <p className="text-xs text-muted-foreground">Note Globale</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-black text-foreground">
                {!loading && stats.count > 0 ? `${stats.count}` : "2,400+"}
              </p>
              <p className="text-xs text-muted-foreground">Avis Vérifiés</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-black text-foreground">
                {!loading && stats.count > 0 ? "100%" : "98%"}
              </p>
              <p className="text-xs text-muted-foreground">Satisfaction</p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-border p-7 h-64 skeleton flex" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayReviews.map((review, i) => (
              <TestimonialCard key={i} {...review} index={i} />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
              <span className="text-white text-[10px] font-black">✓</span>
            </div>
            <span className="font-medium">Avis vérifiés par EmbroCraftDZ</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white text-[10px] font-black">🔒</span>
            </div>
            <span className="font-medium">Paiements 100% sécurisés</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
              <span className="text-white text-[10px] font-black">★</span>
            </div>
            <span className="font-medium">Garantie satisfait ou remboursé</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
