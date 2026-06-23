import CreationsGalleryClient, {
  type Creation,
} from "@/components/shared/CreationsGalleryClient";
import { createClient } from "@/lib/supabase/server";

interface CategoryRow {
  name_fr: string;
}

interface ProfileRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  city: string | null;
}

interface ProductRow {
  id: string;
  creator_id: string;
  title: string;
  price: number | null;
  images: string[];
  created_at: string | null;
  category: CategoryRow | null;
  creator: ProfileRow | null;
}

export const metadata = {
  title: "Boutique — MALIXA",
  description:
    "Explorez les créations et produits disponibles sur MALIXA.",
};

function formatCreatorName(profile?: ProfileRow | null) {
  const name = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "Créatrice MALIXA";
}

function toCreation(row: ProductRow): Creation {
  const categoryLabel = row.category?.name_fr || "Produit";
  const firstImage = Array.isArray(row.images) && row.images.length > 0 
    ? row.images[0] 
    : "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80";

  return {
    id: row.id,
    creatorId: row.creator_id,
    title: row.title,
    creatorName: formatCreatorName(row.creator),
    creatorAvatar: row.creator?.avatar_url || null,
    city: row.creator?.city || null,
    imageUrl: firstImage,
    category: categoryLabel,
    categoryLabel: categoryLabel,
    price: row.price,
    priceRange: null,
    rating: null,
    reviewCount: 0,
    createdAt: row.created_at,
  };
}

export default async function CreationsPage() {
  const supabase = await createClient();
  let creations: Creation[] = [];
  let errorMessage: string | null = null;

  try {
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id, creator_id, title, price, images, created_at,
        category:categories(name_fr),
        creator:profiles(id, first_name, last_name, avatar_url, city)
      `)
      .order("created_at", { ascending: false })
      .limit(24);

    if (error) {
      throw error;
    }

    const rows = (products || []) as any as ProductRow[];
    creations = rows.map(toCreation);

  } catch (error) {
    console.error("Creations page failed to load products:", error);
    errorMessage = "Impossible de charger les produits pour le moment.";
  }

  return (
    <main className="min-h-screen bg-[#fffdf8]">
      <CreationsGalleryClient initialCreations={creations} errorMessage={errorMessage} />
    </main>
  );
}
