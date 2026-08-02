import { ALGERIA_WILAYAS } from "@/lib/data/algeria";

export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

export function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function getGoogleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

// Simple deterministic string hash (djb2), used only to derive a stable,
// non-random jitter offset per atelier — not for anything security-sensitive.
function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return hash >>> 0;
}

// ~1-2km jitter in degrees at Algeria's latitudes, so ateliers sharing a
// wilaya (but with no precise address) don't stack on the exact same pixel.
const JITTER_DEGREES = 0.015;

function jitterFromId(id: string): LatLng {
  const hash = hashString(id);
  const angle = (hash % 360) * (Math.PI / 180);
  const magnitude = ((hash >> 8) % 100) / 100; // 0..1
  return {
    lat: Math.sin(angle) * magnitude * JITTER_DEGREES,
    lng: Math.cos(angle) * magnitude * JITTER_DEGREES,
  };
}

export interface AtelierPositionInput {
  id: string;
  wilaya?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

// Fallback chain for placing an atelier on the map:
// 1. Explicit lat/lng set on the creator profile -> use as-is.
// 2. Wilaya set, no coordinates -> wilaya centroid + small deterministic jitter.
// 3. Neither set -> null (excluded from the map, never a faked position).
export function resolveAtelierPosition(atelier: AtelierPositionInput): LatLng | null {
  if (typeof atelier.latitude === "number" && typeof atelier.longitude === "number") {
    return { lat: atelier.latitude, lng: atelier.longitude };
  }

  if (atelier.wilaya) {
    const wilaya = ALGERIA_WILAYAS.find(
      (w) => w.name_fr.toLowerCase() === atelier.wilaya!.toLowerCase()
    );
    if (wilaya) {
      const jitter = jitterFromId(atelier.id);
      return { lat: wilaya.lat + jitter.lat, lng: wilaya.lng + jitter.lng };
    }
  }

  return null;
}

// Shared specialty/category taxonomy — reused by the map's specialty filter
// and the measurement form's "dress type" field, so both features speak the
// same vocabulary as `creator_profiles.category`/`specialty` values already
// used across the marketplace (see MarketplaceClient.tsx's CATEGORIES),
// extended with "abaya" and "handmade".
export interface SpecialtyCategory {
  value: string;
  label_fr: string;
  label_ar: string;
  label_en: string;
}

export const SPECIALTY_CATEGORIES: SpecialtyCategory[] = [
  { value: "karakou", label_fr: "Karakou", label_ar: "قراقو", label_en: "Karakou" },
  { value: "wedding", label_fr: "Robe de mariée", label_ar: "فستان زفاف", label_en: "Wedding Dress" },
  { value: "embroidery", label_fr: "Broderie", label_ar: "تطريز", label_en: "Embroidery" },
  { value: "caftan", label_fr: "Caftan", label_ar: "قفطان", label_en: "Caftan" },
  { value: "traditional", label_fr: "Tenue traditionnelle", label_ar: "لباس تقليدي", label_en: "Traditional Dress" },
  { value: "evening_wear", label_fr: "Robe de soirée", label_ar: "فستان سهرة", label_en: "Evening Dress" },
  { value: "abaya", label_fr: "Abaya", label_ar: "عباية", label_en: "Abaya" },
  { value: "alterations", label_fr: "Retouches", label_ar: "تعديلات", label_en: "Alterations" },
  { value: "vintage", label_fr: "Restauration vintage", label_ar: "ترميم عتيق", label_en: "Vintage Restoration" },
  { value: "handmade", label_fr: "Fait main", label_ar: "صنع يدوي", label_en: "Handmade" },
];

export function getSpecialtyLabel(value: string, locale: string): string {
  const found = SPECIALTY_CATEGORIES.find((c) => c.value === value);
  if (!found) return value;
  if (locale === "ar") return found.label_ar;
  if (locale === "en") return found.label_en;
  return found.label_fr;
}
