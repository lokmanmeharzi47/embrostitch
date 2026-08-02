import { createClient } from "@/lib/supabase/server";
import AtelierMapClient, { type Atelier } from "@/components/map/AtelierMapClient";

interface ProfileJoin {
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  role: string;
}

interface CreatorProfileRow {
  id: string;
  specialty: string | string[] | null;
  category: string | null;
  avg_rating: number | null;
  total_reviews: number | null;
  cover_image: string | null;
  is_verified: boolean | null;
  wilaya: string | null;
  commune: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  profile: ProfileJoin | ProfileJoin[];
}

export const metadata = {
  title: "Atelier Map — MALIXA",
  description: "Discover every registered couture atelier across Algeria on an interactive map.",
};

export default async function MapPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("creator_profiles")
    .select(
      `
      id, specialty, category, avg_rating, total_reviews,
      cover_image, is_verified, wilaya, commune, address, latitude, longitude,
      profile:profiles!inner (first_name, last_name, avatar_url, phone, bio, role)
    `
    )
    .eq("profile.role", "creator");

  const rows = (data || []) as unknown as CreatorProfileRow[];

  const ateliers: Atelier[] = rows.map((row) => {
    const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;
    const rawSpec = row.specialty;
    const specialtyList = Array.isArray(rawSpec)
      ? rawSpec
      : typeof rawSpec === "string"
      ? rawSpec.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    return {
      id: row.id,
      shopName: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || null,
      ownerFirstName: profile?.first_name || "",
      ownerLastName: profile?.last_name || "",
      ownerAvatarUrl: profile?.avatar_url || null,
      ownerPhone: profile?.phone || null,
      specialty: specialtyList,
      description: profile?.bio || null,
      category: row.category,
      avgRating: Number(row.avg_rating) || 0,
      totalReviews: row.total_reviews || 0,
      portfolioImages: [],
      coverImage: row.cover_image,
      isVerified: row.is_verified || false,
      wilaya: row.wilaya,
      commune: row.commune,
      address: row.address,
      latitude: row.latitude,
      longitude: row.longitude,
    };
  });

  return <AtelierMapClient ateliers={ateliers} />;
}
