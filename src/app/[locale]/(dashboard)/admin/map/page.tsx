import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminMapWrapper from "./AdminMapWrapper";
import { type AdminCreator } from "@/components/map/AdminAtelierMap";

interface CreatorProfileOwner {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
}

interface CreatorProfileRow {
  id: string;
  shop_name: string | null;
  specialty: string[] | null;
  category: string | null;
  is_verified: boolean | null;
  wilaya: string | null;
  commune: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  profiles: CreatorProfileOwner | CreatorProfileOwner[] | null;
}

interface AdminMapPageProps {
  searchParams: Promise<{ creatorId?: string }>;
}

export const metadata = {
  title: "Carte & Géolocalisation Ateliers — Admin MALIXA",
  description: "Gestion des positions GPS et adresses des ateliers de couture et broderie.",
};

export default async function AdminMapPage({ searchParams }: AdminMapPageProps) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const resolvedParams = await searchParams;
  const initialSelectedCreatorId = resolvedParams?.creatorId || null;

  // Fetch all creators (both verified and unverified, with or without coordinates)
  const { data: creatorsData, error } = await supabase
    .from("creator_profiles")
    .select("*, profiles!inner(first_name, last_name, avatar_url, phone)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching map data for admin:", error);
  }

  const creators: AdminCreator[] = ((creatorsData || []) as unknown as CreatorProfileRow[]).map((pro) => {
    const profile = Array.isArray(pro.profiles) ? pro.profiles[0] : pro.profiles;
    return {
      id: pro.id,
      shopName: pro.shop_name || null,
      ownerFirstName: profile?.first_name || "Créatrice",
      ownerLastName: profile?.last_name || "",
      ownerAvatarUrl: profile?.avatar_url || null,
      ownerPhone: profile?.phone || null,
      specialty: pro.specialty || [],
      category: pro.category || null,
      isVerified: pro.is_verified || false,
      wilaya: pro.wilaya || null,
      commune: pro.commune || null,
      address: pro.address || null,
      latitude: pro.latitude !== null && pro.latitude !== undefined ? Number(pro.latitude) : null,
      longitude: pro.longitude !== null && pro.longitude !== undefined ? Number(pro.longitude) : null,
    };
  });

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Carte & Géolocalisation des Ateliers
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visualisez, positionnez et mettez à jour les coordonnées GPS des couturières et artisanes à travers l'Algérie.
        </p>
      </div>

      <div className="flex-1 min-h-[500px] bg-card border border-border rounded-2xl shadow-sm overflow-hidden relative">
        <AdminMapWrapper
          creators={creators}
          initialSelectedCreatorId={initialSelectedCreatorId}
        />
      </div>
    </div>
  );
}
