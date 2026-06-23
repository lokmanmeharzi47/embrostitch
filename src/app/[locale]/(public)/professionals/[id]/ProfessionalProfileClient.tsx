"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  bio: string;
  city: string;
  avatar_url: string | null;
}

interface CreatorData {
  specialty: string[];
  description: string;
  location: string;
  category: string;
  price_range: string;
  avg_rating: number;
  total_reviews: number;
  portfolio_images: string[];
  is_verified: boolean;
  is_available: boolean;
  years_experience: number;
}

interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  client: { first_name: string; last_name: string } | { first_name: string; last_name: string }[];
}

interface ProfessionalProfileClientProps {
  id: string;
  profile: ProfileData;
  creatorProfile: CreatorData;
  reviews: ReviewData[];
}

export default function ProfessionalProfileClient({
  id,
  profile,
  creatorProfile,
  reviews,
}: ProfessionalProfileClientProps) {
  const { user, profile: authProfile } = useAuth();
  const router = useRouter();
  const [isStartingChat, setIsStartingChat] = useState(false);
  const portfolioImages = creatorProfile.portfolio_images || [];

  const handleStartConversation = async () => {
    if (!user) {
      router.push(`/login?redirect=/professionals/${id}`);
      return;
    }

    try {
      setIsStartingChat(true);
      const res = await fetch("/api/conversations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start conversation");
      }

      router.push(data.redirectUrl);
    } catch (error) {
      console.error(error);
      toast.error("Impossible d'ouvrir la conversation");
    } finally {
      setIsStartingChat(false);
    }
  };

  return (
    <main className="flex-1 pt-12 pb-16 w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 overflow-hidden">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-icons text-primary text-5xl">person</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {profile.first_name} {profile.last_name}
                    </h1>
                    {creatorProfile.is_verified && (
                      <span className="material-icons text-primary text-xl" title="Vérifiée">
                        verified
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1 mb-2">
                    <span className="material-icons text-sm">location_on</span>
                    {creatorProfile.location || profile.city || "—"}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <span className="material-icons text-warning text-base">star</span>
                      <span className="font-bold">
                        {Number(creatorProfile.avg_rating).toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        ({creatorProfile.total_reviews} avis)
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      {creatorProfile.years_experience} ans d&apos;expérience
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  {user && authProfile?.role === "client" && (
                    <>
                      <Button variant="outline" size="lg" onClick={handleStartConversation} disabled={isStartingChat}>
                        <span className="material-icons text-base mr-2">chat</span>
                        {isStartingChat ? "Ouverture..." : "Envoyer un message"}
                      </Button>
                      <Link href={`/order/create?creatorId=${id}`}>
                        <Button variant="luxury" size="lg">
                          <span className="material-icons text-base mr-2">shopping_bag</span>
                          Passer Commande
                        </Button>
                      </Link>
                    </>
                  )}
                  {!user && (
                    <Link href="/login">
                      <Button variant="default" size="lg">
                        Connectez-vous pour contacter
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {creatorProfile.specialty?.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                  >
                    {s}
                  </span>
                ))}
                {creatorProfile.price_range && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold">
                    {creatorProfile.price_range}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-3">À propos</h2>
          <p className="text-muted-foreground leading-relaxed">
            {creatorProfile.description || profile.bio || "Aucune description disponible."}
          </p>
        </div>

        {/* Portfolio */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Portfolio ({portfolioImages.length})
          </h2>
          {portfolioImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {portfolioImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-xl overflow-hidden border border-border group"
                >
                  <Image
                    src={imageUrl}
                    alt={`Portfolio ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="material-icons text-4xl text-muted-foreground/30 mb-2 block">
                photo_library
              </span>
              <p className="text-muted-foreground">
                Aucune image dans le portfolio pour le moment.
              </p>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">
              Avis ({reviews.length})
            </h2>
            <div className="flex items-center gap-1">
              <span className="material-icons text-warning text-lg">star</span>
              <span className="font-bold text-foreground">
                {Number(creatorProfile.avg_rating).toFixed(1)}
              </span>
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => {
                const client = Array.isArray(review.client)
                  ? review.client[0]
                  : review.client;
                return (
                  <div key={review.id} className="border-b border-border pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {(client?.first_name?.[0] || client?.last_name?.[0] || "?").toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {(client?.first_name || client?.last_name) ? `${client.first_name || ""} ${client.last_name || ""}`.trim() : "Anonyme"}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`material-icons text-sm ${
                              i < review.rating ? "text-warning" : "text-muted"
                            }`}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(review.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Pas encore d&apos;avis pour cette couturière.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
