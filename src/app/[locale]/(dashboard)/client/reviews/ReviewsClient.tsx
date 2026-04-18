"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface CompletedOrder {
  id: string;
  title: string;
  couturiere_id: string;
  couturiere: { first_name: string; last_name: string } | { first_name: string; last_name: string }[];
}

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  order_id: string;
  couturiere: { first_name: string; last_name: string } | { first_name: string; last_name: string }[];
  order: { title: string } | { title: string }[];
}

interface ReviewsClientProps {
  initialReviews: ReviewData[];
  initialUnreviewed: CompletedOrder[];
  userId: string;
}

export default function ReviewsClient({ initialReviews, initialUnreviewed, userId }: ReviewsClientProps) {
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews);
  const [unreviewed, setUnreviewed] = useState<CompletedOrder[]>(initialUnreviewed);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(null);
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedOrder) return;

    setSubmitting(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        client_id: userId,
        couturiere_id: selectedOrder.couturiere_id,
        order_id: selectedOrder.id,
        rating: formRating,
        comment: formComment || null,
      })
      .select(
        `
        id, rating, comment, created_at, order_id,
        couturiere:profiles!reviews_couturiere_id_fkey (first_name, last_name),
        order:orders!reviews_order_id_fkey (title)
      `
      )
      .single();

    if (error) {
      toast.error("Erreur lors de l'envoi de l'avis");
    } else if (data) {
      setReviews((prev) => [data as unknown as ReviewData, ...prev]);
      setUnreviewed((prev) => prev.filter((o) => o.id !== selectedOrder.id));
      toast.success("Avis envoyé avec succès !");

      await supabase.from("notifications").insert({
        user_id: selectedOrder.couturiere_id,
        type: "review",
        title: "Nouvel avis reçu",
        body: `Note de ${formRating}★ pour "${selectedOrder.title}"`,
        link: "/creator/reviews",
      });

      setShowForm(false);
      setSelectedOrder(null);
      setFormRating(5);
      setFormComment("");
    }
    setSubmitting(false);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Mes Avis
        </h1>
        <p className="text-muted-foreground">
          Consultez et laissez des avis sur vos commandes terminées.
        </p>
      </div>

      {unreviewed.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-icons text-primary">rate_review</span>
            <h2 className="font-bold text-foreground">
              {unreviewed.length} commande
              {unreviewed.length > 1 ? "s" : ""} en attente d&apos;avis
            </h2>
          </div>
          <div className="space-y-3">
            {unreviewed.map((order) => {
              const c = Array.isArray(order.couturiere)
                ? order.couturiere[0]
                : order.couturiere;
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between bg-card rounded-lg p-4 border border-border"
                >
                  <div>
                    <p className="font-bold text-foreground text-sm">
                      {order.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      par {c?.first_name} {c?.last_name}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowForm(true);
                    }}
                  >
                    <span className="material-icons text-sm mr-1">star</span>
                    Laisser un Avis
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showForm && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Évaluer votre commande
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedOrder.title}
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Note
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <span
                        className={`material-icons text-3xl ${
                          star <= formRating
                            ? "text-warning"
                            : "text-muted/50"
                        }`}
                      >
                        star
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Commentaire (optionnel)
                </label>
                <textarea
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Partagez votre expérience..."
                  rows={3}
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={submitting}
                >
                  {submitting ? "Envoi..." : "Envoyer l'Avis"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-foreground mb-4">
        Avis Envoyés ({reviews.length})
      </h2>
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => {
            const c = Array.isArray(review.couturiere)
              ? review.couturiere[0]
              : review.couturiere;
            const o = Array.isArray(review.order)
              ? review.order[0]
              : review.order;
            return (
              <div
                key={review.id}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-foreground">
                      {o?.title || "Commande"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      pour {c?.first_name} {c?.last_name} ·{" "}
                      {new Date(review.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex text-warning">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-icons text-sm">
                        {i < review.rating ? "star" : "star_border"}
                      </span>
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground italic">
                    &quot;{review.comment}&quot;
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <span className="material-icons text-4xl mb-2 opacity-30">
            star_border
          </span>
          <p className="text-sm">
            Vous n&apos;avez pas encore laissé d&apos;avis.
          </p>
        </div>
      )}
    </>
  );
}
