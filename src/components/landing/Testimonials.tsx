"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Sparkles, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

interface ReviewData {
  quote: string;
  author: string;
  role: string;
  rating: number;
  initials: string;
}

interface Review {
  client_name: string;
  order_title: string;
  comment: string | null;
  rating: number | null;
}

interface ReviewsResponse {
  reviews?: Review[];
  stats?: {
    average: number;
    count: number;
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "fill-primary text-primary" : "fill-muted text-muted"}`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ quote, author, role, rating, initials, index }: ReviewData & { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="bg-card rounded-[20px] border border-border p-7 premium-shadow hover-lift flex flex-col h-full"
    >
      <div className="mb-5">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Quote className="w-4 h-4 text-primary fill-primary" />
        </div>
      </div>

      <StarRating rating={rating} />

      <p className="text-sm text-foreground/80 leading-relaxed my-5 italic flex-1">
        &ldquo;{quote}&rdquo;
      </p>

      <div className="flex items-center gap-3 pt-5 border-t border-border/50">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-primary text-xs font-bold">{initials}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{author}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  const t = useTranslations("Testimonials");
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews/public');
        if (!response.ok) throw new Error('API fetching failed');

        const data = (await response.json()) as ReviewsResponse;

        if (data.reviews && data.reviews.length > 0) {
          const mapped = data.reviews.map((r: Review) => {
            const clientNameParts = r.client_name.split(' ');
            return {
              quote: r.comment || "Excellent service, je recommande vivement !",
              author: r.client_name,
              role: r.order_title,
              rating: r.rating || 5,
              initials: clientNameParts.length > 1
                ? `${clientNameParts[0]?.charAt(0) || ""}${clientNameParts[1]?.charAt(0) || ""}`.toUpperCase()
                : (clientNameParts[0]?.charAt(0) || "?").toUpperCase(),
            };
          });
          setReviews(mapped);
          if (data.stats) {
            setStats(data.stats);
          }
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error('Failed to load testimonials:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{t("eyebrow")}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-5 leading-tight">
            {t("title")}
          </h2>
          <p className="text-lg text-secondary-foreground/70 font-light leading-relaxed">
            {t("subtitle")}
          </p>

          {!loading && stats.count > 0 && (
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(stats.average) ? 'fill-primary text-primary' : 'fill-muted text-muted'}`} />
                  ))}
                </div>
                <p className="text-2xl font-serif text-foreground">
                  {stats.average.toFixed(1)} / 5
                </p>
                <p className="text-xs text-muted-foreground">{t("overallRating")}</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-serif text-foreground">{stats.count}</p>
                <p className="text-xs text-muted-foreground">{t("verifiedReviews")}</p>
              </div>
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-[20px] border border-border p-7 h-64 skeleton flex" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center py-16 px-6 bg-secondary/30 rounded-[24px] border border-border max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-border">
              <Quote className="w-6 h-6 text-primary/50" />
            </div>
            <h3 className="font-serif text-2xl text-foreground mb-3">{t("emptyTitle")}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed mb-8">
              {t("emptySubtitle")}
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium text-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
            >
              {t("emptyCta")}
              <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
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
            <span className="font-medium">{t("trustVerified")}</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white text-[10px] font-black">🔒</span>
            </div>
            <span className="font-medium">{t("trustSecure")}</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Star className="w-2.5 h-2.5 fill-white text-white" />
            </div>
            <span className="font-medium">{t("trustGuarantee")}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
