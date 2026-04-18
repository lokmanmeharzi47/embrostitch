"use client";

import React, { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  client: { first_name: string; last_name: string };
  couturiere: { first_name: string; last_name: string };
  order: { title: string };
}

export default function AdminReviewModerationPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState("all");

  useEffect(() => {
    const fetchReviews = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("reviews")
        .select(
          `
          id, rating, comment, created_at,
          client:profiles!reviews_client_id_fkey (first_name, last_name),
          couturiere:profiles!reviews_couturiere_id_fkey (first_name, last_name),
          order:orders!reviews_order_id_fkey (title)
        `
        )
        .order("created_at", { ascending: false });

      setReviews((data || []) as unknown as Review[]);
      setLoading(false);
    };
    fetchReviews();
  }, []);

  const handleDelete = async (reviewId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);
    if (error) {
      toast.error("Erreur lors de la suppression de l'avis");
    } else {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Avis supprimé avec succès");
    }
  };

  const filtered =
    filterRating === "all"
      ? reviews
      : reviews.filter((r) => r.rating === parseInt(filterRating));

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  if (loading) {
    return (
    <>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded-xl w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
    </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Modération des Avis
          </h1>
          <p className="text-muted-foreground">
            Gérez et modérez les avis de la plateforme.
          </p>
        </div>
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="text-sm border border-border rounded-md px-3 py-2 bg-secondary/50 focus:outline-none focus:border-primary"
        >
          <option value="all">Toutes les notes</option>
          <option value="5">5 étoiles</option>
          <option value="4">4 étoiles</option>
          <option value="3">3 étoiles</option>
          <option value="2">2 étoiles</option>
          <option value="1">1 étoile</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Total Avis
          </p>
          <p className="text-2xl font-bold text-foreground">
            {reviews.length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Note Moyenne
          </p>
          <div className="flex items-center gap-1">
            <p className="text-2xl font-bold text-foreground">
              {avgRating.toFixed(1)}
            </p>
            <span className="material-icons text-warning">star</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Avis 1-2★
          </p>
          <p className="text-2xl font-bold text-destructive">
            {reviews.filter((r) => r.rating <= 2).length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Potentiellement à modérer
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((review) => {
            const client = Array.isArray(review.client)
              ? review.client[0]
              : review.client;
            const couturiere = Array.isArray(review.couturiere)
              ? review.couturiere[0]
              : review.couturiere;
            const order = Array.isArray(review.order)
              ? review.order[0]
              : review.order;

            return (
              <div
                key={review.id}
                className={`bg-card border rounded-xl p-5 shadow-sm transition-colors ${
                  review.rating <= 2
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-border"
                }`}
              >
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold text-xs">
                            {(client?.first_name?.[0] || client?.last_name?.[0] || "?").toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">
                            {(client?.first_name || client?.last_name) ? `${client.first_name || ""} ${client.last_name || ""}`.trim() : "Client Anonyme"}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString(
                              "fr-FR"
                            )}{" "}
                            · Commande: {order?.title || "—"}
                          </p>
                        </div>
                      </div>
                      {review.rating <= 2 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive text-white">
                          <span className="material-icons text-[12px]">
                            flag
                          </span>{" "}
                          Attention
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex text-warning">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="material-icons text-[16px]">
                            {i < review.rating ? "star" : "star_border"}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Pour:{" "}
                        <span className="font-medium text-foreground">
                          {(couturiere?.first_name || couturiere?.last_name) ? `${couturiere.first_name || ""} ${couturiere.last_name || ""}`.trim() : "Couturière Inconnue"}
                        </span>
                      </span>
                    </div>

                    {review.comment && (
                      <p className="text-sm text-foreground leading-relaxed italic">
                        &quot;{review.comment}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col justify-end gap-2 md:pl-6 md:border-l md:border-border/50 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-center bg-white border-destructive text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(review.id)}
                    >
                      <span className="material-icons text-sm mr-2">
                        delete
                      </span>
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <span className="material-icons text-5xl mb-3 opacity-30">
              rate_review
            </span>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Aucun avis à afficher
            </h3>
            <p className="text-sm">
              {filterRating !== "all"
                ? "Essayez un autre filtre."
                : "Les avis des clients apparaîtront ici."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
