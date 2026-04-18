import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
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
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Avis Clients
          </h1>
          <p className="text-muted-foreground text-lg">
            Retrouvez les retours et évaluations de vos clients.
          </p>
        </div>
        <div className="bg-muted/30 p-1 rounded-2xl flex items-center">
            <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="text-sm font-bold bg-transparent border-none focus:ring-0 text-foreground px-4 py-2 cursor-pointer"
            >
                <option value="all">Toutes les notes</option>
                {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r.toString()}>
                        {r} étoile{r > 1 ? "s" : ""}
                    </option>
                ))}
            </select>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card className="border-none shadow-sm flex flex-col items-center justify-center text-center p-8 bg-white">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Note Globale</p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-6xl font-black text-foreground tracking-tighter">
              {avgRating.toFixed(1)}
            </span>
            <Star className="text-warning fill-warning" size={32} />
          </div>
          <p className="text-xs font-bold text-muted-foreground/60">
            Basé sur {reviews.length} avis
          </p>
        </Card>

        <Card className="border-none shadow-sm md:col-span-3 p-8 bg-white">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Distribution des notes</p>
          <div className="space-y-4">
            {ratingBreakdown.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-12 shrink-0">
                  <span className="text-sm font-bold text-foreground">
                    {star}
                  </span>
                  <Star className="text-warning fill-warning" size={12} />
                </div>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                        "h-full bg-primary rounded-full transition-all duration-700 delay-300",
                        pct === 0 ? "w-0" : ""
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-muted-foreground/60 w-12 text-right">
                  {count} ({Math.round(pct)}%)
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground mb-4 px-2">Avis récents</h2>

        {filtered.length > 0 ? (
          filtered.map((review) => {
            const client = Array.isArray(review.client)
              ? review.client[0]
              : review.client;
            const order = Array.isArray(review.order)
              ? review.order[0]
              : review.order;

            return (
              <Card key={review.id} className="border-none shadow-sm hover:shadow-md transition-all duration-300 p-8 bg-white">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 shadow-inner">
                      <span className="text-primary font-black text-xl">
                        {(client?.first_name?.[0] || client?.last_name?.[0] || "?").toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                         <h4 className="font-black text-lg text-foreground leading-none">
                            {(client?.first_name || client?.last_name) ? `${client.first_name || ""} ${client.last_name || ""}`.trim() : "Client Anonyme"}
                          </h4>
                          <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                            {new Date(review.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}
                          </span>
                       </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={cn(
                                "transition-colors",
                                i < review.rating ? "text-warning fill-warning" : "text-muted/30"
                              )}
                            />
                          ))}
                        </div>
                        {order?.title && (
                          <div className="px-2 py-0.5 bg-secondary/50 rounded-md text-[10px] font-bold text-primary uppercase tracking-tight">
                            Projet: {order.title}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {review.comment && (
                  <div className="mt-8 relative">
                    <p className="text-foreground leading-relaxed italic text-lg opacity-90 pl-6 border-l-2 border-primary/20">
                      &quot;{review.comment}&quot;
                    </p>
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <div className="text-center py-24 bg-muted/10 rounded-3xl border-2 border-dashed border-border/50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Star size={32} className="text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Aucun avis trouvé
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {filterRating !== "all"
                ? "Il n'y a pas d'avis correspondant à cette note."
                : "Les avis de vos clients apparaîtront ici dès que vos commandes seront terminées."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
