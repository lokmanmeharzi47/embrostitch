"use client";

import React, { useState } from "react";
import { Star, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ReviewFormProps {
  orderId: string;
  creatorId: string;
}

export default function ReviewForm({ orderId, creatorId }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, creatorId, rating, comment }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la soumission de l'avis");
      }

      setIsOpen(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button variant="primary" onClick={() => setIsOpen(true)}>
        <Star className="w-4 h-4 mr-2" />
        Laisser un avis
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
          <h3 className="font-bold text-foreground">Évaluer la créatrice</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              {error}
            </div>
          )}
          
          <div className="mb-6 flex flex-col items-center">
            <p className="text-sm font-semibold text-muted-foreground mb-3">
              Combien d'étoiles donnez-vous ?
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-accent text-accent"
                        : "fill-muted text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              Votre commentaire (optionnel)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience avec cette créatrice..."
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 min-h-[100px] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Publier l'avis"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
