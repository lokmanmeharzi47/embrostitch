import CreationsGalleryClient, {
  type Creation,
} from "@/components/shared/CreationsGalleryClient";
import { createClient } from "@/lib/supabase/server";

interface PortfolioImageRow {
  id: string;
  user_id: string;
  image_url: string;
  title: string | null;
  category: string | null;
  price: number | string | null;
  created_at: string | null;
}

interface PublicProfileRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  city: string | null;
}

interface CouturiereProfileRow {
  id: string;
  category: string | null;
  price_range: string | null;
  avg_rating: number | string | null;
  total_reviews: number | null;
}

export const metadata = {
  title: "Creations — EmbroCraftDZ",
  description:
    "Explorez les creations publiees par les couturieres et artisans EmbroCraftDZ.",
};

function formatCreatorName(profile?: PublicProfileRow) {
  const name = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "Createur EmbroCraftDZ";
}

function categoryLabel(category: string | null) {
  const labels: Record<string, string> = {
    traditional: "Traditional",
    wedding: "Wedding",
    evening_wear: "Wedding",
    embroidery: "Traditional",
    vintage: "Traditional",
    tailoring: "Modern",
    alterations: "Modern",
    modern: "Modern",
    accessories: "Accessories",
  };

  return category ? labels[category.toLowerCase()] || category.replace(/_/g, " ") : "Portfolio";
}

function toCreation(
  row: PortfolioImageRow,
  profile?: PublicProfileRow,
  couturiere?: CouturiereProfileRow
): Creation {
  const category = row.category || couturiere?.category || null;
  const label = categoryLabel(category);

  return {
    id: row.id,
    creatorId: row.user_id,
    title: row.title?.trim() || `${label} creation`,
    creatorName: formatCreatorName(profile),
    creatorAvatar: profile?.avatar_url || null,
    city: profile?.city || null,
    imageUrl: row.image_url,
    category,
    categoryLabel: label,
    price: row.price === null || row.price === undefined ? null : Number(row.price),
    priceRange: couturiere?.price_range || null,
    rating:
      couturiere?.avg_rating === null || couturiere?.avg_rating === undefined
        ? null
        : Number(couturiere.avg_rating),
    reviewCount: couturiere?.total_reviews || 0,
    createdAt: row.created_at,
  };
}

export default async function CreationsPage() {
  const supabase = await createClient();
  let creations: Creation[] = [];
  let errorMessage: string | null = null;

  try {
    const { data: portfolioRows, error } = await supabase
      .from("portfolio_images")
      .select(`
        id, user_id, image_url, title, category, price, created_at,
        profile:profiles!inner(role)
      `)
      .eq("is_published", true)
      .eq("profile.role", "creator")
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      throw error;
    }

    const rows = (portfolioRows || []) as PortfolioImageRow[];
    const creatorIds = Array.from(new Set(rows.map((row) => row.user_id)));

    if (creatorIds.length > 0) {
      const [{ data: profiles, error: profilesError }, { data: couturieres, error: couturieresError }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id, first_name, last_name, avatar_url, city")
            .in("id", creatorIds),
          supabase
            .from("couturiere_profiles")
            .select("id, category, price_range, avg_rating, total_reviews")
            .in("id", creatorIds),
        ]);

      if (profilesError || couturieresError) {
        throw profilesError || couturieresError;
      }

      const profilesById = new Map(
        ((profiles || []) as PublicProfileRow[]).map((profile) => [profile.id, profile])
      );
      const couturieresById = new Map(
        ((couturieres || []) as CouturiereProfileRow[]).map((profile) => [profile.id, profile])
      );

      creations = rows.map((row) =>
        toCreation(row, profilesById.get(row.user_id), couturieresById.get(row.user_id))
      );
    }
  } catch (error) {
    console.error("Creations page failed to load portfolio images:", error);
    errorMessage = "Impossible de charger les créations pour le moment.";
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <CreationsGalleryClient initialCreations={creations} errorMessage={errorMessage} />
    </main>
  );
}
