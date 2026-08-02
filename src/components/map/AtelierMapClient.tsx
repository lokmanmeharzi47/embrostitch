"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, Popup, NavigationControl, type MapRef } from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, LocateFixed, SlidersHorizontal, X, Star, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import {
  ALGERIA_CENTER,
  ALGERIA_DEFAULT_ZOOM,
  getWilayaName,
} from "@/lib/data/algeria";
import {
  haversineDistanceKm,
  resolveAtelierPosition,
  type LatLng,
} from "@/lib/map-helpers";
import MapMarkerPopup from "./MapMarkerPopup";
import MapFilters, { type MapFiltersState } from "./MapFilters";

let rtlPluginLoaded = false;
function ensureRtlPlugin() {
  if (rtlPluginLoaded || typeof window === "undefined") return;
  rtlPluginLoaded = true;
  try {
    mapboxgl.setRTLTextPlugin(
      "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.4.0/mapbox-gl-rtl-text.js",
      undefined,
      true
    );
  } catch {
    // Plugin may already be set (fast refresh in dev) — safe to ignore.
  }
}

export interface Atelier {
  id: string;
  shopName: string | null;
  ownerFirstName: string;
  ownerLastName: string;
  ownerAvatarUrl: string | null;
  ownerPhone: string | null;
  specialty: string[];
  description: string | null;
  category: string | null;
  avgRating: number;
  totalReviews: number;
  portfolioImages: string[];
  coverImage: string | null;
  isVerified: boolean;
  wilaya: string | null;
  commune: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface PositionedAtelier extends Atelier {
  position: LatLng;
  distanceKm: number | null;
}

const DEFAULT_FILTERS: MapFiltersState = {
  search: "",
  wilaya: "",
  commune: "",
  specialties: [],
  minRating: 0,
  maxDistanceKm: null,
};

function useIsMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [breakpointPx]);
  return isMobile;
}

export default function AtelierMapClient({ ateliers }: { ateliers: Atelier[] }) {
  const t = useTranslations("Map");
  const locale = useLocale();
  const isMobile = useIsMobile();
  const mapRef = useRef<MapRef | null>(null);

  const [filters, setFilters] = useState<MapFiltersState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    ensureRtlPlugin();
  }, []);

  const positioned: PositionedAtelier[] = useMemo(() => {
    return ateliers
      .map((atelier) => {
        const position = resolveAtelierPosition({
          id: atelier.id,
          wilaya: atelier.wilaya,
          latitude: atelier.latitude,
          longitude: atelier.longitude,
        });
        if (!position) return null;
        const distanceKm = userLocation ? haversineDistanceKm(userLocation, position) : null;
        return { ...atelier, position, distanceKm };
      })
      .filter((a): a is PositionedAtelier => a !== null);
  }, [ateliers, userLocation]);

  const filtered = useMemo(() => {
    let results = positioned;

    const q = filters.search.trim().toLowerCase();
    if (q) {
      results = results.filter((a) => {
        const shopName = (a.shopName || "").toLowerCase();
        const ownerName = `${a.ownerFirstName} ${a.ownerLastName}`.toLowerCase();
        return shopName.includes(q) || ownerName.includes(q);
      });
    }

    if (filters.wilaya) {
      results = results.filter((a) => (a.wilaya || "").toLowerCase() === filters.wilaya.toLowerCase());
    }

    if (filters.commune.trim()) {
      const c = filters.commune.trim().toLowerCase();
      results = results.filter((a) => (a.commune || "").toLowerCase().includes(c));
    }

    if (filters.specialties.length > 0) {
      results = results.filter((a) => {
        const cat = (a.category || "").toLowerCase();
        const specs = Array.isArray(a.specialty)
          ? a.specialty.map((s) => s.toLowerCase())
          : typeof a.specialty === "string"
          ? (a.specialty as string).toLowerCase().split(",").map((s) => s.trim())
          : [];
        return filters.specialties.some((s) => s === cat || specs.includes(s));
      });
    }

    if (filters.minRating > 0) {
      results = results.filter((a) => a.avgRating >= filters.minRating);
    }

    if (filters.maxDistanceKm !== null && userLocation) {
      results = results.filter((a) => a.distanceKm !== null && a.distanceKm <= filters.maxDistanceKm!);
    }

    return [...results].sort((a, b) => {
      if (userLocation && a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      return b.avgRating - a.avgRating;
    });
  }, [positioned, filters, userLocation]);

  const selectedAtelier = useMemo(
    () => filtered.find((a) => a.id === selectedId) || positioned.find((a) => a.id === selectedId) || null,
    [filtered, positioned, selectedId]
  );

  const flyTo = useCallback((lat: number, lng: number, zoom = 12) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom, duration: 900 });
  }, []);

  const handleSelect = useCallback(
    (atelier: PositionedAtelier) => {
      setSelectedId(atelier.id);
      flyTo(atelier.position.lat, atelier.position.lng);
    },
    [flyTo]
  );

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError(t("locationUnsupported"));
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocating(false);
        flyTo(loc.lat, loc.lng, 9);
      },
      () => {
        setLocating(false);
        setLocationError(t("locationDenied"));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [flyTo, t]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const activeFilterCount =
    (filters.wilaya ? 1 : 0) +
    (filters.commune.trim() ? 1 : 0) +
    filters.specialties.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxDistanceKm !== null ? 1 : 0);

  if (!mapboxToken) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3 bg-secondary/30 px-6 text-center">
        <MapPin className="h-10 w-10 text-primary/40" />
        <p className="max-w-md text-sm font-medium text-muted-foreground">{t("configMissing")}</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-var(--header-height))] w-full flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-[380px] shrink-0 flex-col overflow-y-auto border-e border-border bg-card md:flex">
        <div className="border-b border-border p-6">
          <h1 className="font-serif text-2xl text-foreground">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <MapFilters
          state={filters}
          onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
          onReset={() => setFilters(DEFAULT_FILTERS)}
          hasUserLocation={!!userLocation}
          onRequestLocation={handleLocateMe}
          locating={locating}
          locationError={locationError}
        />
        <div className="flex-1 border-t border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("resultsCount", { count: filtered.length })}
            </p>
            {userLocation && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{t("sortNearest")}</span>
            )}
          </div>
          <ul className="space-y-2 px-4 pb-6">
            {filtered.map((atelier) => (
              <li key={atelier.id}>
                <button
                  onClick={() => handleSelect(atelier)}
                  className={cn(
                    "w-full rounded-2xl border p-3 text-start transition-all hover:border-primary/40",
                    selectedId === atelier.id ? "border-primary bg-primary/5" : "border-border bg-card"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-secondary">
                      {(atelier.coverImage || (Array.isArray(atelier.portfolioImages) && atelier.portfolioImages[0])) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={atelier.coverImage || (Array.isArray(atelier.portfolioImages) ? atelier.portfolioImages[0] : "")}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">
                        {atelier.shopName || `${atelier.ownerFirstName} ${atelier.ownerLastName}`}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          {atelier.avgRating.toFixed(1)}
                        </span>
                        <span>{getWilayaName(atelier.wilaya, locale) || "—"}</span>
                        {atelier.distanceKm !== null && (
                          <span className="font-semibold text-primary">{atelier.distanceKm.toFixed(1)} km</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-2 py-10 text-center text-sm text-muted-foreground">{t("noResults")}</li>
            )}
          </ul>
        </div>
      </aside>

      {/* Map */}
      <div className="relative flex-1">
        <Map
          ref={mapRef}
          mapboxAccessToken={mapboxToken}
          RTLTextPlugin="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.4.0/mapbox-gl-rtl-text.js"
          initialViewState={{ latitude: ALGERIA_CENTER.lat, longitude: ALGERIA_CENTER.lng, zoom: ALGERIA_DEFAULT_ZOOM }}
          mapStyle="mapbox://styles/mapbox/light-v11"
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position={locale === "ar" ? "top-left" : "top-right"} />

          {filtered.map((atelier) => (
            <Marker
              key={atelier.id}
              longitude={atelier.position.lng}
              latitude={atelier.position.lat}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleSelect(atelier);
              }}
            >
              <button
                type="button"
                aria-label={atelier.shopName || atelier.ownerFirstName}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 shadow-lg transition-transform hover:scale-110",
                  selectedId === atelier.id
                    ? "scale-110 border-primary bg-primary text-white"
                    : "border-primary bg-white text-primary"
                )}
              >
                <MapPin className="h-4 w-4" fill="currentColor" />
              </button>
            </Marker>
          ))}

          {userLocation && (
            <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
              <span className="relative flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-60" />
                <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow" />
              </span>
            </Marker>
          )}

          {!isMobile && selectedAtelier && (
            <Popup
              longitude={selectedAtelier.position.lng}
              latitude={selectedAtelier.position.lat}
              anchor="top"
              onClose={() => setSelectedId(null)}
              closeButton={false}
              maxWidth="360px"
              className="atelier-popup"
            >
              <MapMarkerPopup atelier={selectedAtelier} onClose={() => setSelectedId(null)} />
            </Popup>
          )}
        </Map>

        {/* Mobile top bar */}
        <div className="absolute inset-x-3 top-3 flex items-center gap-2 md:hidden">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <input
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-card/95 shadow-lg backdrop-blur-sm"
            aria-label={t("filtersButton")}
          >
            <SlidersHorizontal className="h-4 w-4 text-foreground" />
            {activeFilterCount > 0 && (
              <span className="absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            onClick={handleLocateMe}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-card/95 shadow-lg backdrop-blur-sm"
            aria-label={t("locateMe")}
          >
            {locating ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <LocateFixed className="h-4 w-4 text-primary" />
            )}
          </button>
        </div>

        {/* Desktop search bar (floats over map, top of map pane) */}
        <div className="pointer-events-none absolute inset-x-0 top-4 hidden justify-center md:flex">
          <div className="pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <input
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={handleLocateMe}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-primary hover:bg-primary/10"
              aria-label={t("locateMe")}
            >
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {locationError && (
          <div className="absolute inset-x-4 bottom-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-center text-xs font-medium text-destructive md:inset-x-auto md:end-4 md:w-72">
            {locationError}
          </div>
        )}
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-[210] max-h-[85vh] overflow-y-auto rounded-t-[2rem] bg-card shadow-2xl md:hidden"
            >
              <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-6 py-4">
                <h2 className="font-serif text-lg text-foreground">{t("filtersButton")}</h2>
                <button onClick={() => setShowFilters(false)} className="rounded-full p-2 hover:bg-secondary">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <MapFilters
                state={filters}
                onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
                onReset={() => setFilters(DEFAULT_FILTERS)}
                hasUserLocation={!!userLocation}
                onRequestLocation={handleLocateMe}
                locating={locating}
                locationError={locationError}
              />
              <div className="p-6 pt-0">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white shadow-lg"
                >
                  {t("resultsCount", { count: filtered.length })}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom sheet popup */}
      <AnimatePresence>
        {isMobile && selectedAtelier && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 z-[200] bg-black/40 md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-[210] max-h-[80vh] overflow-y-auto rounded-t-[2rem] bg-card shadow-2xl md:hidden"
            >
              <div className="flex justify-center pt-3">
                <span className="h-1.5 w-12 rounded-full bg-border" />
              </div>
              <MapMarkerPopup atelier={selectedAtelier} onClose={() => setSelectedId(null)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
