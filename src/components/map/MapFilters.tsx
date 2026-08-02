"use client";

import { useTranslations, useLocale } from "next-intl";
import { Star, LocateFixed, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALGERIA_WILAYAS } from "@/lib/data/algeria";
import { SPECIALTY_CATEGORIES, getSpecialtyLabel } from "@/lib/map-helpers";

export interface MapFiltersState {
  search: string;
  wilaya: string;
  commune: string;
  specialties: string[];
  minRating: number;
  maxDistanceKm: number | null;
}

const RATING_OPTIONS = [0, 3, 4, 4.5];
const DISTANCE_OPTIONS_KM = [5, 10, 25, 50, 100];

interface Props {
  state: MapFiltersState;
  onChange: (patch: Partial<MapFiltersState>) => void;
  onReset: () => void;
  hasUserLocation: boolean;
  onRequestLocation: () => void;
  locating: boolean;
  locationError: string | null;
}

export default function MapFilters({
  state,
  onChange,
  onReset,
  hasUserLocation,
  onRequestLocation,
  locating,
  locationError,
}: Props) {
  const t = useTranslations("Map");
  const locale = useLocale();

  const toggleSpecialty = (value: string) => {
    onChange({
      specialties: state.specialties.includes(value)
        ? state.specialties.filter((s) => s !== value)
        : [...state.specialties, value],
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {t("wilayaLabel")}
        </label>
        <select
          value={state.wilaya}
          onChange={(e) => onChange({ wilaya: e.target.value })}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/40"
        >
          <option value="">{t("allWilayas")}</option>
          {ALGERIA_WILAYAS.map((w) => (
            <option key={w.code} value={w.name_fr}>
              {locale === "ar" ? w.name_ar : locale === "en" ? w.name_en : w.name_fr}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {t("communeLabel")}
        </label>
        <input
          value={state.commune}
          onChange={(e) => onChange({ commune: e.target.value })}
          placeholder={t("communePlaceholder")}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary/40"
        />
      </div>

      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {t("specialtyLabel")}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SPECIALTY_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => toggleSpecialty(cat.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                state.specialties.includes(cat.value)
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              )}
            >
              {getSpecialtyLabel(cat.value, locale)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {t("ratingLabel")}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {RATING_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => onChange({ minRating: r })}
              className={cn(
                "flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                state.minRating === r
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              )}
            >
              {r === 0 ? (
                t("anyRating")
              ) : (
                <>
                  <Star className="h-3 w-3 fill-current" />
                  {r}+
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {t("distanceLabel")}
        </label>
        {hasUserLocation ? (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onChange({ maxDistanceKm: null })}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                state.maxDistanceKm === null
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              )}
            >
              {t("anyRating")}
            </button>
            {DISTANCE_OPTIONS_KM.map((d) => (
              <button
                key={d}
                onClick={() => onChange({ maxDistanceKm: d })}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                  state.maxDistanceKm === d
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card text-foreground hover:border-primary/40"
                )}
              >
                {d} km
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={onRequestLocation}
            disabled={locating}
            className="flex items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-3 py-2.5 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-60"
          >
            {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
            {t("enableLocationForDistance")}
          </button>
        )}
        {locationError && <p className="mt-2 text-xs text-destructive">{locationError}</p>}
      </div>

      <button
        onClick={onReset}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {t("resetFilters")}
      </button>
    </div>
  );
}
