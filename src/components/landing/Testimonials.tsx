"use client";

import React, { useEffect, useState } from "react";
import TestimonialCard from "@/components/ui/TestimonialCard";
import { createClient } from "@/lib/supabase/client";

interface ReviewData {
  comment: string;
  rating: number;
  client: { first_name: string; last_name: string };
  couturiere: { first_name: string; last_name: string };
  order: { title: string };
}

export default function Testimonials() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("reviews")
        .select(
          `
          comment, rating,
          client:profiles!reviews_client_id_fkey (first_name, last_name),
          couturiere:profiles!reviews_couturiere_id_fkey (first_name, last_name),
          order:orders!reviews_order_id_fkey (title)
        `
        )
        .order("created_at", { ascending: false })
        .limit(3);

      if (data) setReviews(data as unknown as ReviewData[]);
      setLoading(false);
    };
    fetchReviews();
  }, []);

  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-4">
            <span className="material-icons text-primary text-sm">
              favorite
            </span>
            <span className="text-xs font-semibold text-primary">
              Témoignages
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Avis de nos Clients
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Découvrez ce que notre communauté dit de ses créations sur mesure.
          </p>
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border p-6 animate-pulse"
              >
                <div className="h-4 bg-muted rounded w-full mb-3" />
                <div className="h-4 bg-muted rounded w-5/6 mb-3" />
                <div className="h-4 bg-muted rounded w-2/3 mb-6" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, idx) => {
              const client = Array.isArray(review.client)
                ? review.client[0]
                : review.client;
              const order = Array.isArray(review.order)
                ? review.order[0]
                : review.order;
              return (
                <TestimonialCard
                  key={idx}
                  quote={review.comment || "Excellent travail !"}
                  authorName={`${client.first_name} ${client.last_name}`}
                  role={order?.title || "Commande personnalisée"}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Pas encore d&apos;avis. Soyez le premier !
          </p>
        )}
      </div>
    </section>
  );
}
