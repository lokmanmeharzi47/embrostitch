import { createClient } from "@/lib/supabase/server"
import MarketplaceClient from "@/components/shared/MarketplaceClient"

interface ProfileJoin {
  first_name: string
  last_name: string
  city: string | null
  avatar_url: string | null
}

interface CreatorProfile {
  id: string
  specialty: string[]
  avg_rating: number
  total_reviews: number
  price_range: string | null
  category: string | null
  portfolio_images: string[]
  is_verified: boolean
  profile: ProfileJoin | ProfileJoin[]
}

export const metadata = {
  title: "Marketplace — MALIXA",
  description: "Explorez des centaines de couturières et artisans algériens. Karakou, mariée, broderie, caftan et bien plus.",
}

export default async function MarketplacePage() {
  const supabase = await createClient()

  const { data: professionals } = await supabase
    .from("creator_profiles")
    .select(`
      id, specialty, avg_rating, total_reviews, price_range, category, portfolio_images, is_verified,
      profile:profiles!inner (first_name, last_name, city, avatar_url, role)
    `)
    .eq("is_available", true)
    .eq("profile.role", "creator")
    .order("avg_rating", { ascending: false })

  const initialProfessionals = (professionals || []) as CreatorProfile[]

  return (
    <main className="flex-1 w-full">
      <MarketplaceClient initialProfessionals={initialProfessionals} />
    </main>
  )
}
