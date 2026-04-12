"use client";

import React, { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  client: { first_name: string; last_name: string };
  order: { title: string };
}

export default function CreatorReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState("all");

  useEffect(() => {
    if (!user) return;
    const fetchReviews = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("reviews")
        .select(
          `
          id, rating, comment, created_at,
          client:profiles!reviews_client_id_fkey (first_name, last_name),
          order:orders!reviews_order_id_fkey (title)
        `
        )
        .eq("couturiere_id", user.id)
        .order("created_at", { ascending: false });

      setReviews((data || []) as unknown as ReviewData[]);
      setLoading(false);
    };
    fetchReviews();
  }, [user]);

  const filtered =
    filterRating === "all"
      ? reviews
      : reviews.filter((r) => r.rating === parseInt(filterRating));

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === star).length / reviews.length) *
          100
        : 0,
  }));

  if (loading) {
    return (
    <>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded-xl w-1/3" />
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
    </>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Mes Avis
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Consultez les retours de vos clients.
          </p>
        </div>
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="text-sm border border-border rounded-md px-3 py-2 bg-secondary/50 focus:outline-none focus:border-primary"
        >
          <option value="all">Toutes les notes</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r.toString()}>
              {r} étoile{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            Note Globale
          </h3>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-4xl font-bold text-foreground">
              {avgRating.toFixed(1)}
            </span>
            <span className="material-icons text-warning text-3xl">star</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Basé sur {reviews.length} avis
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm md:col-span-2">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">
            Distribution
          </h3>
          <div className="space-y-2">
            {ratingBreakdown.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12 shrink-0">
                  <span className="text-sm font-medium text-foreground">
                    {star}
                  </span>
                  <span className="material-icons text-warning text-[14px]">
                    star
                  </span>
                </div>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/20">
          <h2 className="font-bold text-foreground">Avis Récents</h2>
        </div>

        <div className="divide-y divide-border">
          {filtered.length > 0 ? (
            filtered.map((review) => {
              const client = Array.isArray(review.client)
                ? review.client[0]
                : review.client;
              const order = Array.isArray(review.order)
                ? review.order[0]
                : review.order;

              return (
                <div key={review.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold">
                          {client?.first_name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-foreground">
                          {client?.first_name} {client?.last_name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex text-warning">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className="material-icons text-[14px]"
                              >
                                {i < review.rating ? "star" : "star_border"}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ·{" "}
                            {new Date(review.created_at).toLocaleDateString(
                              "fr-FR"
                            )}
                          </span>
                        </div>
                        {order?.title && (
                          <p className="text-xs text-primary font-medium mt-1">
                            Projet: {order.title}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-sm text-foreground leading-relaxed ml-14">
                      &quot;{review.comment}&quot;
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <span className="material-icons text-5xl text-muted-foreground/30 mb-3 block">
                rate_review
              </span>
              <h3 className="text-lg font-bold text-foreground mb-1">
                Aucun avis
              </h3>
              <p className="text-sm text-muted-foreground">
                {filterRating !== "all"
                  ? "Aucun avis avec cette note."
                  : "Vos avis apparaîtront ici après vos premières commandes terminées."}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
