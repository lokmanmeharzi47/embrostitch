"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, MapPin, Shield, Clock, MessageSquare, Heart,
  ChevronLeft, ChevronRight, Check, Quote, Sparkles,
  Calendar, Award, Package, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";

interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  bio: string;
  city: string;
  avatar_url: string | null;
}

interface CouturiereData {
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

interface Props {
  id: string;
  profile: ProfileData;
  couturiereProfile: CouturiereData;
  reviews: ReviewData[];
}

const COVER_COLORS = [
  "from-violet-400 via-purple-500 to-indigo-600",
  "from-rose-400 via-pink-500 to-fuchsia-600",
  "from-amber-400 via-orange-400 to-rose-500",
  "from-teal-400 via-emerald-500 to-cyan-600",
];

const SAMPLE_SERVICES = [
  { name: "Consultation initiale", price: "Gratuit", duration: "30 min" },
  { name: "Tenue sur mesure (base)", price: "À partir de 8,000 DA", duration: "2–3 semaines" },
  { name: "Karakou complet", price: "À partir de 25,000 DA", duration: "3–4 semaines" },
  { name: "Robe de mariée", price: "Sur devis", duration: "4–6 semaines" },
  { name: "Broderie artisanale", price: "À partir de 3,000 DA", duration: "1–2 semaines" },
];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`${s} ${i < Math.round(rating) ? "fill-accent text-accent" : "fill-muted text-muted"}`} />
      ))}
    </div>
  );
}

export default function ProfessionalProfileClient({ id, profile, couturiereProfile, reviews }: Props) {
  const { user, profile: authProfile } = useAuth();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<"portfolio" | "services" | "reviews">("portfolio");

  const portfolioImages = couturiereProfile.portfolio_images || [];
  const coverColor = COVER_COLORS[profile.id.charCodeAt(0) % COVER_COLORS.length];
  const initials = `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`;
  const fullName = `${profile.first_name} ${profile.last_name}`;

  const prevImage = () => setLightboxIdx((i) => (i - 1 + portfolioImages.length) % portfolioImages.length);
  const nextImage = () => setLightboxIdx((i) => (i + 1) % portfolioImages.length);

  return (
    <main className="bg-background min-h-screen pb-24">

      {/* Cover */}
      <div className="relative">
        <div className={`h-64 md:h-80 w-full bg-gradient-to-r ${coverColor} relative overflow-hidden`}>
          {portfolioImages[0] && (
            <Image 
              src={portfolioImages[0]} 
              alt="Cover" 
              fill 
              sizes="100vw" 
              className="object-cover opacity-25" 
              priority 
            />
          )}
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }} />
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent" />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? "fill-rose-500 text-rose-500" : "text-white"}`} />
          </motion.button>
        </div>

        {/* Profile card */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
          <div className="bg-white rounded-3xl border border-border/50 shadow-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl overflow-hidden border-4 border-white shadow-lg">
                  {profile.avatar_url ? (
                    <Image src={profile.avatar_url} alt={fullName} width={112} height={112} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${coverColor} flex items-center justify-center`}>
                      <span className="text-white text-3xl font-black">{initials}</span>
                    </div>
                  )}
                </div>
                {couturiereProfile.is_available && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-2 border-white" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-2xl md:text-3xl font-black text-foreground">{fullName}</h1>
                      {couturiereProfile.is_verified && (
                        <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
                          <Shield className="w-3 h-3 text-emerald-500" />
                          <span className="text-xs font-bold text-emerald-600">Vérifié</span>
                        </div>
                      )}
                    </div>
                    <p className="text-primary font-bold text-base mb-2 capitalize">
                      {couturiereProfile.category
                        ? couturiereProfile.category.replace("_", " ")
                        : (couturiereProfile.specialty?.[0] || "Couturière")}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="font-black text-foreground">{Number(couturiereProfile.avg_rating).toFixed(1)}</span>
                        <span>({couturiereProfile.total_reviews} avis)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{couturiereProfile.location || profile.city || "Algérie"}</span>
                      </div>
                      {couturiereProfile.years_experience > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Award className="w-4 h-4" />
                          <span>{couturiereProfile.years_experience} ans</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span className={couturiereProfile.is_available ? "text-success font-semibold" : ""}>
                          {couturiereProfile.is_available ? "Disponible maintenant" : "Occupée"}
                        </span>
                      </div>
                    </div>
                    {couturiereProfile.specialty && couturiereProfile.specialty.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {couturiereProfile.specialty.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs font-semibold rounded-full px-3">{s}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                    {user && authProfile?.role === "client" ? (
                      <>
                        <Button variant="luxury" className="gap-2 rounded-xl shadow-lg shadow-primary/20" asChild>
                          <Link href={`/order/create?couturiereId=${id}`}>
                            <Sparkles className="w-4 h-4" />
                            Demander un projet
                          </Link>
                        </Button>
                        <Button variant="outline" className="gap-2 rounded-xl" asChild>
                          <Link href="/messages">
                            <MessageSquare className="w-4 h-4" />
                            Envoyer un message
                          </Link>
                        </Button>
                      </>
                    ) : !user ? (
                      <Button variant="luxury" className="gap-2 rounded-xl" asChild>
                        <Link href={`/login?redirect=/profile/${id}`}>
                          Contacter <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
              {[
                { icon: Star, label: "Note", value: `${Number(couturiereProfile.avg_rating).toFixed(1)}/5`, color: "text-amber-500" },
                { icon: Package, label: "Projets", value: `${couturiereProfile.total_reviews * 2}+`, color: "text-primary" },
                { icon: Calendar, label: "Délai Moy.", value: "2–3 sem.", color: "text-emerald-500" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="text-center">
                  <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
                  <p className="text-lg font-black text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        {/* Bio */}
        {(profile.bio || couturiereProfile.description) && (
          <div className="bg-white rounded-3xl border border-border/50 p-6 mb-6 shadow-sm">
            <h2 className="font-black text-lg text-foreground mb-3">À propos</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {couturiereProfile.description || profile.bio}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/60 rounded-2xl p-1 mb-6">
          {(["portfolio", "services", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "portfolio" && "Portfolio"}
              {tab === "services" && "Services"}
              {tab === "reviews" && `Avis (${reviews.length})`}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Portfolio */}
          {activeTab === "portfolio" && (
            <motion.div key="portfolio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {portfolioImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {portfolioImages.map((img, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => { setLightboxIdx(i); setLightboxOpen(true); }}
                      className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-sm border border-border/30"
                    >
                      <Image 
                        src={img} 
                        alt={`Création ${i + 1}`} 
                        fill 
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 340px" 
                        className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <div className="text-white opacity-0 group-hover:opacity-100 text-2xl font-bold transition-opacity">+</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-border/50 p-12 text-center shadow-sm">
                  <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="font-bold text-foreground mb-1">Portfolio en construction</p>
                  <p className="text-sm text-muted-foreground">Les créations seront bientôt disponibles.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Services */}
          {activeTab === "services" && (
            <motion.div key="services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-3">
              {SAMPLE_SERVICES.map((service, i) => (
                <div key={i} className="bg-white rounded-2xl border border-border/50 p-5 flex items-center justify-between shadow-sm hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">{service.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {service.duration}
                      </p>
                    </div>
                  </div>
                  <p className="font-black text-primary text-sm">{service.price}</p>
                </div>
              ))}
              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 flex gap-3 mt-2">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">Prix indicatifs. Un devis personnalisé vous sera fourni après consultation.</p>
              </div>
            </motion.div>
          )}

          {/* Reviews */}
          {activeTab === "reviews" && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="bg-white rounded-3xl border border-border/50 p-6 mb-4 shadow-sm">
                <div className="flex items-center gap-8">
                  <div className="text-center shrink-0">
                    <p className="text-5xl font-black text-foreground">{Number(couturiereProfile.avg_rating).toFixed(1)}</p>
                    <StarRating rating={couturiereProfile.avg_rating} size="md" />
                    <p className="text-xs text-muted-foreground mt-1">{couturiereProfile.total_reviews} avis</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const pct = star === 5 ? 78 : star === 4 ? 15 : star === 3 ? 5 : 1;
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-2">{star}</span>
                          <Star className="w-3 h-3 fill-accent text-accent" />
                          <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-border/50 p-10 text-center shadow-sm">
                    <Quote className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="font-bold text-foreground mb-1">Aucun avis pour le moment</p>
                    <p className="text-sm text-muted-foreground">Soyez le premier à partager votre expérience.</p>
                  </div>
                ) : (
                  reviews.map((review) => {
                    const client = Array.isArray(review.client) ? review.client[0] : review.client;
                    const name = `${client.first_name} ${client.last_name}`;
                    const ini = `${client.first_name.charAt(0)}${client.last_name.charAt(0)}`;
                    return (
                      <div key={review.id} className="bg-white rounded-2xl border border-border/50 p-5 shadow-sm hover:border-primary/20 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-9 h-9 rounded-full primary-gradient flex items-center justify-center shrink-0">
                            <span className="text-white text-xs font-black">{ini}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-sm text-foreground">{name}</p>
                              <span className="text-xs text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                              </span>
                            </div>
                            <StarRating rating={review.rating} />
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground leading-relaxed italic">
                            &ldquo;{review.comment}&rdquo;
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && portfolioImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full"
              style={{ aspectRatio: "1" }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image 
                src={portfolioImages[lightboxIdx]} 
                alt="" 
                fill 
                sizes="(max-width: 1024px) 100vw, 1024px" 
                className="object-contain rounded-2xl" 
              />
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
              <button onClick={() => setLightboxOpen(false)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white text-lg hover:bg-white/25 transition-colors">
                ×
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {portfolioImages.map((_, i) => (
                  <button key={i} onClick={() => setLightboxIdx(i)} className={`h-1.5 rounded-full transition-all ${i === lightboxIdx ? "bg-white w-5" : "bg-white/40 w-1.5"}`} />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky mobile CTA */}
      {user && authProfile?.role === "client" && (
        <div className="fixed bottom-0 inset-x-0 z-40 md:hidden p-4 bg-white/95 backdrop-blur-md border-t border-border/50 shadow-xl">
          <Button variant="luxury" size="lg" className="w-full rounded-2xl gap-2" asChild>
            <Link href={`/order/create?couturiereId=${id}`}>
              <Sparkles className="w-4 h-4" />
              Démarrer un projet
            </Link>
          </Button>
        </div>
      )}
    </main>
  );
}
