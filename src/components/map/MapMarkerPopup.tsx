"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import {
  Star,
  MapPinned,
  Phone,
  MessageCircle,
  Navigation,
  X,
  CircleUser,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getGoogleMapsDirectionsUrl, getSpecialtyLabel } from "@/lib/map-helpers";
import { getWilayaName } from "@/lib/data/algeria";
import type { PositionedAtelier } from "./AtelierMapClient";

export default function MapMarkerPopup({
  atelier,
  onClose,
}: {
  atelier: PositionedAtelier;
  onClose: () => void;
}) {
  const t = useTranslations("Map");
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const [messaging, setMessaging] = useState(false);

  const specialties = Array.isArray(atelier.specialty)
    ? atelier.specialty
    : typeof atelier.specialty === "string"
    ? (atelier.specialty as string).split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const portfolioImages = Array.isArray(atelier.portfolioImages) ? atelier.portfolioImages : [];
  const displayTags = specialties.length > 0 ? specialties : atelier.category ? [atelier.category] : [];

  const displayName = atelier.shopName || `${atelier.ownerFirstName} ${atelier.ownerLastName}`.trim();
  const coverImage = atelier.coverImage || portfolioImages[0] || null;
  const locationLine = [getWilayaName(atelier.wilaya, locale), atelier.commune].filter(Boolean).join(" · ");

  const handleMessage = async () => {
    if (!user) {
      router.push(`/login?redirect=/map`);
      return;
    }
    setMessaging(true);
    try {
      const res = await fetch("/api/conversations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: atelier.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start conversation");
      router.push(data.redirectUrl);
    } catch {
      toast.error(t("messageError"));
    } finally {
      setMessaging(false);
    }
  };

  return (
    <div className="w-full max-w-[360px] overflow-hidden rounded-2xl bg-card text-start">
      <div className="relative h-36 w-full bg-secondary">
        {coverImage ? (
          <Image src={coverImage} alt={displayName} fill className="object-cover" sizes="360px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MapPinned className="h-10 w-10 text-primary/30" />
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
          aria-label={t("closePopup")}
        >
          <X className="h-4 w-4" />
        </button>
        <div className="absolute -bottom-6 start-4 h-14 w-14 overflow-hidden rounded-2xl border-4 border-card bg-secondary shadow-md">
          {atelier.ownerAvatarUrl ? (
            <Image src={atelier.ownerAvatarUrl} alt="" width={56} height={56} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <CircleUser className="h-7 w-7 text-muted-foreground/40" />
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 pt-8">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif text-lg leading-tight text-foreground">{displayName}</h3>
              {atelier.isVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {atelier.ownerFirstName} {atelier.ownerLastName}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-secondary/40 px-2.5 py-1">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="text-xs font-bold text-foreground">{atelier.avgRating.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground">({atelier.totalReviews})</span>
          </div>
        </div>

        {atelier.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{atelier.description}</p>
        )}

        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-start gap-1.5">
            <MapPinned className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              {[atelier.address, locationLine].filter(Boolean).join(" — ") || t("noLocation")}
              {atelier.distanceKm !== null && (
                <span className="ms-1 font-semibold text-primary">· {atelier.distanceKm.toFixed(1)} km</span>
              )}
            </span>
          </div>
          {atelier.ownerPhone && (
            <a href={`tel:${atelier.ownerPhone}`} className="flex items-center gap-1.5 hover:text-primary">
              <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
              {atelier.ownerPhone}
            </a>
          )}
        </div>

        {displayTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {displayTags.slice(0, 4).map((s) => (
              <span
                key={s}
                className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary"
              >
                {getSpecialtyLabel(s, locale)}
              </span>
            ))}
          </div>
        )}

        {portfolioImages.length > 0 && (
          <div className="mt-3 flex gap-1.5 overflow-x-auto">
            {portfolioImages.slice(0, 4).map((img, i) => (
              <div key={i} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                <Image src={img} alt="" fill className="object-cover" sizes="56px" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={`/profile/${atelier.id}`}
            className="flex items-center justify-center rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-bold text-foreground transition-colors hover:border-primary/40"
          >
            {t("visitProfile")}
          </Link>
          <button
            onClick={handleMessage}
            disabled={messaging}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-light disabled:opacity-60"
          >
            {messaging ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-3.5 w-3.5" />}
            {user ? t("messageCreator") : t("loginToContact")}
          </button>
        </div>

        {atelier.position && (
          <a
            href={getGoogleMapsDirectionsUrl(atelier.position.lat, atelier.position.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs font-bold text-primary transition-colors hover:bg-primary/10"
          >
            <Navigation className="h-3.5 w-3.5" />
            {t("getDirections")}
          </a>
        )}
      </div>
    </div>
  );
}
