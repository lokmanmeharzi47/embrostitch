"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, MapPin, Shield, Clock, MessageSquare, Heart,
  ChevronLeft, ChevronRight, Check, Quote, Sparkles,
  Calendar, Award, Package, ArrowRight, X
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

interface Props {
  id: string;
  profile: ProfileData;
  creatorProfile: CreatorData;
  reviews: ReviewData[];
}

const SAMPLE_SERVICES = [
  { name: "Initial Consultation", price: "Complimentary", duration: "30 min" },
  { name: "Bespoke Couture", price: "From 8,000 DA", duration: "2–3 weeks" },
  { name: "Full Karakou Set", price: "From 25,000 DA", duration: "3–4 weeks" },
  { name: "Bridal Gown", price: "Custom Quote", duration: "4–6 weeks" },
  { name: "Artisanal Embroidery", price: "From 3,000 DA", duration: "1–2 weeks" },
];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`${s} ${i < Math.round(rating) ? "fill-primary text-primary" : "fill-border text-border"}`} />
      ))}
    </div>
  );
}

export default function ProfessionalProfileClient({ id, profile, creatorProfile, reviews }: Props) {
  const { user, profile: authProfile } = useAuth();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<"portfolio" | "services" | "reviews">("portfolio");

  const portfolioImages = creatorProfile.portfolio_images || [];
  const initials = `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`;
  const fullName = `${profile.first_name} ${profile.last_name}`;

  const prevImage = () => setLightboxIdx((i) => (i - 1 + portfolioImages.length) % portfolioImages.length);
  const nextImage = () => setLightboxIdx((i) => (i + 1) % portfolioImages.length);

  return (
    <main className="bg-background min-h-screen pb-32">

      {/* ── Editorial Cover ── */}
      <div className="relative h-72 md:h-96 w-full bg-secondary overflow-hidden">
        {portfolioImages[0] ? (
          <Image 
            src={portfolioImages[0]} 
            alt="Cover" 
            fill 
            sizes="100vw" 
            className="object-cover opacity-80" 
            priority 
          />
        ) : (
          <div className="absolute inset-0 bg-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-6 right-6 w-12 h-12 rounded-full bg-surface/50 backdrop-blur-md border border-border flex items-center justify-center hover:bg-surface transition-colors z-10"
        >
          <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? "fill-primary text-primary" : "text-foreground"}`} />
        </motion.button>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-32 relative z-10">
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* ── Left Column: Profile Info ── */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-background bg-surface shadow-md">
                  {profile.avatar_url ? (
                    <Image src={profile.avatar_url} alt={fullName} width={160} height={160} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center text-primary font-serif text-4xl">
                      {initials}
                    </div>
                  )}
                </div>
                {creatorProfile.is_available && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-emerald-500 border-4 border-background flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  </div>
                )}
              </div>

              {/* Header Details */}
              <div className="pt-2 md:pt-10">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-5xl font-serif text-foreground">{fullName}</h1>
                  {creatorProfile.is_verified && (
                    <div className="flex items-center gap-1.5 bg-surface border border-border rounded-full px-3 py-1 shadow-sm mt-1">
                      <Check className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Verified</span>
                    </div>
                  )}
                </div>
                
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">
                  {creatorProfile.category
                    ? creatorProfile.category.replace("_", " ")
                    : (creatorProfile.specialty?.[0] || "Designer")}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm text-secondary-foreground font-light mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-semibold text-foreground">{Number(creatorProfile.avg_rating).toFixed(1)}</span>
                    <span>({creatorProfile.total_reviews} Reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{creatorProfile.location || profile.city || "Algérie"}</span>
                  </div>
                  {creatorProfile.years_experience > 0 && (
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      <span>{creatorProfile.years_experience} Years Exp.</span>
                    </div>
                  )}
                </div>

                {creatorProfile.specialty && creatorProfile.specialty.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {creatorProfile.specialty.map((s) => (
                      <span key={s} className="px-4 py-1.5 border border-border rounded-full text-xs text-secondary-foreground uppercase tracking-wider font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {(profile.bio || creatorProfile.description) && (
              <div className="mt-12 max-w-3xl">
                <h2 className="text-xs font-medium text-primary uppercase tracking-widest mb-4">About the Designer</h2>
                <p className="text-lg text-secondary-foreground/80 leading-relaxed font-light">
                  {creatorProfile.description || profile.bio}
                </p>
              </div>
            )}

            {/* ── Tabs ── */}
            <div className="mt-16">
              <div className="flex gap-8 border-b border-border">
                {(["portfolio", "services", "reviews"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-sm font-medium uppercase tracking-widest transition-colors relative ${
                      activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "portfolio" && "Portfolio"}
                    {tab === "services" && "Services"}
                    {tab === "reviews" && `Reviews (${reviews.length})`}
                    {activeTab === tab && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-10">
                <AnimatePresence mode="wait">
                  {/* Portfolio Tab */}
                  {activeTab === "portfolio" && (
                    <motion.div key="portfolio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                      {portfolioImages.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {portfolioImages.map((img, i) => (
                            <motion.div
                              key={i}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => { setLightboxIdx(i); setLightboxOpen(true); }}
                              className="relative aspect-[3/4] overflow-hidden cursor-pointer group rounded-[10px] bg-secondary"
                            >
                              <Image 
                                src={img} 
                                alt={`Creation ${i + 1}`} 
                                fill 
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 340px" 
                                className="object-cover transition-transform duration-700 group-hover:scale-105" 
                              />
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-20 text-center">
                          <p className="text-lg font-serif text-foreground mb-2">Portfolio in progress</p>
                          <p className="text-sm font-light text-secondary-foreground">Check back later for new creations.</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Services Tab */}
                  {activeTab === "services" && (
                    <motion.div key="services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-4">
                      {SAMPLE_SERVICES.map((service, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-surface border border-border rounded-[20px] hover:border-primary/30 transition-colors gap-4">
                          <div>
                            <p className="font-serif text-lg text-foreground mb-1">{service.name}</p>
                            <p className="text-sm text-secondary-foreground font-light flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" /> {service.duration}
                            </p>
                          </div>
                          <p className="font-medium text-primary text-sm uppercase tracking-widest">{service.price}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Reviews Tab */}
                  {activeTab === "reviews" && (
                    <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                      
                      <div className="flex flex-col md:flex-row items-center gap-12 p-8 bg-secondary/30 rounded-[20px] mb-8">
                        <div className="text-center shrink-0">
                          <p className="text-6xl font-serif text-foreground mb-2">{Number(creatorProfile.avg_rating).toFixed(1)}</p>
                          <div className="flex justify-center mb-2">
                            <StarRating rating={creatorProfile.avg_rating} size="md" />
                          </div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest">{creatorProfile.total_reviews} Reviews</p>
                        </div>
                        <div className="flex-1 w-full space-y-3">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const pct = star === 5 ? 78 : star === 4 ? 15 : star === 3 ? 5 : 1;
                            return (
                              <div key={star} className="flex items-center gap-4">
                                <span className="text-xs font-medium text-foreground w-3">{star}</span>
                                <Star className="w-3.5 h-3.5 fill-primary text-primary shrink-0" />
                                <div className="flex-1 bg-border rounded-full h-1 overflow-hidden">
                                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-6">
                        {reviews.length === 0 ? (
                          <div className="py-12 text-center">
                            <p className="text-lg font-serif text-foreground mb-2">No reviews yet</p>
                            <p className="text-sm font-light text-secondary-foreground">Be the first to share your experience with this designer.</p>
                          </div>
                        ) : (
                          reviews.map((review) => {
                            const client = Array.isArray(review.client) ? review.client[0] : review.client;
                            const name = `${client.first_name} ${client.last_name}`;
                            return (
                              <div key={review.id} className="p-6 bg-surface border border-border rounded-[20px]">
                                <div className="flex items-center justify-between mb-4">
                                  <p className="font-serif text-lg text-foreground">{name}</p>
                                  <span className="text-xs text-muted-foreground uppercase tracking-widest">
                                    {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                  </span>
                                </div>
                                <div className="mb-4">
                                  <StarRating rating={review.rating} />
                                </div>
                                {review.comment && (
                                  <p className="text-secondary-foreground font-light leading-relaxed">
                                    "{review.comment}"
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
            </div>
          </div>

          {/* ── Right Column: Floating Action Card ── */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="sticky top-[100px] bg-surface border border-border rounded-[24px] p-8 shadow-sm">
              <h3 className="text-2xl font-serif text-foreground mb-2">Start a Project</h3>
              <p className="text-sm text-secondary-foreground font-light mb-8">
                Discuss your vision and receive a custom quote directly from the designer.
              </p>

              <div className="space-y-4">
                {user && authProfile?.role === "client" ? (
                  <>
                    <Button variant="luxury" size="lg" className="w-full rounded-full py-6 text-sm" asChild>
                      <Link href={`/order/create?creatorId=${id}`}>
                        Request Custom Order
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="w-full rounded-full py-6 text-sm bg-transparent border-border text-foreground hover:border-primary/40"
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/conversations/start", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ creatorId: id }),
                          });
                          if (!res.ok) throw new Error("Failed to start conversation");
                          const data = await res.json();
                          if (data.redirectUrl) {
                            window.location.href = data.redirectUrl;
                          }
                        } catch (error) {
                          console.error("Error starting conversation:", error);
                          window.location.href = "/messages";
                        }
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message Designer
                    </Button>
                  </>
                ) : !user ? (
                  <Button variant="luxury" size="lg" className="w-full rounded-full py-6 text-sm" asChild>
                    <Link href={`/login?redirect=/profile/${id}`}>
                      Login to Contact
                    </Link>
                  </Button>
                ) : null}
              </div>

              <div className="mt-8 pt-8 border-t border-border space-y-4">
                <div className="flex items-center gap-3 text-sm text-secondary-foreground font-light">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Usually responds within 24 hours</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-secondary-foreground font-light">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span>Payments protected by MALIXA</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && portfolioImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            onClick={() => setLightboxOpen(false)}
          >
            <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-surface transition-colors z-50">
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full max-w-5xl h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image 
                src={portfolioImages[lightboxIdx]} 
                alt="" 
                fill 
                className="object-contain" 
              />
              <button onClick={prevImage} className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-border bg-surface/50 backdrop-blur-md flex items-center justify-center hover:bg-surface transition-colors -ml-4 md:-ml-12">
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <button onClick={nextImage} className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-border bg-surface/50 backdrop-blur-md flex items-center justify-center hover:bg-surface transition-colors -mr-4 md:-mr-12">
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Sticky CTA ── */}
      {user && authProfile?.role === "client" && (
        <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden p-4 bg-surface/95 backdrop-blur-md border-t border-border">
          <Button variant="luxury" size="lg" className="w-full rounded-full py-6 text-sm" asChild>
            <Link href={`/order/create?creatorId=${id}`}>
              Request Custom Order
            </Link>
          </Button>
        </div>
      )}
    </main>
  );
}
