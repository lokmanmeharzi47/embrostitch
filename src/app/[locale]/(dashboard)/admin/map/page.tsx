import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminMapWrapper from "./AdminMapWrapper"

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
  bio: string | null;
  category: string | null;
  avg_rating: number | null;
  total_reviews: number | null;
  portfolio_images: string[] | null;
  cover_image: string | null;
  is_verified: boolean | null;
  wilaya: string | null;
  commune: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  profiles: CreatorProfileOwner | CreatorProfileOwner[] | null;
}

export default async function AdminMapPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: creatorsData, error } = await supabase
    .from("creator_profiles")
    .select("*, profiles!inner(first_name, last_name, avatar_url, phone)")
    .eq("is_verified", true)

  if (error) {
    console.error("Error fetching map data:", error)
  }

  const ateliers = ((creatorsData || []) as unknown as CreatorProfileRow[]).map((pro) => {
    const profile = Array.isArray(pro.profiles) ? pro.profiles[0] : pro.profiles;
    return {
      id: pro.id,
      shopName: pro.shop_name || null,
      ownerFirstName: profile?.first_name || "",
      ownerLastName: profile?.last_name || "",
      ownerAvatarUrl: profile?.avatar_url || null,
      ownerPhone: profile?.phone || null,
      specialty: pro.specialty || [],
      description: pro.bio || null,
      category: pro.category || null,
      avgRating: Number(pro.avg_rating) || 0,
      totalReviews: pro.total_reviews || 0,
      portfolioImages: pro.portfolio_images || [],
      coverImage: pro.cover_image || null,
      isVerified: pro.is_verified || false,
      wilaya: pro.wilaya || null,
      commune: pro.commune || null,
      address: pro.address || null,
      latitude: pro.latitude || null,
      longitude: pro.longitude || null,
    }
  })

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Artisan Map
        </h1>
        <p className="text-muted-foreground">
          Interactive map of all verified creators on the platform.
        </p>
      </div>
      <div className="flex-1 min-h-[500px] bg-card border border-border rounded-xl shadow-sm overflow-hidden relative">
        <AdminMapWrapper ateliers={ateliers} />
      </div>
    </div>
  )
}
