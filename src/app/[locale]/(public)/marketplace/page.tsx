import { createClient } from "@/lib/supabase/server"
import MarketplaceClient from "@/components/shared/MarketplaceClient"

export const metadata = {
  title: "Marketplace — EmbroCraftDZ",
  description: "Explorez des centaines de couturières et artisans algériens. Karakou, mariée, broderie, caftan et bien plus.",
}

export default async function MarketplacePage() {
  const supabase = await createClient()

  const { data: professionals } = await supabase
    .from("couturiere_profiles")
    .select(`
      id, specialty, avg_rating, total_reviews, price_range, category, portfolio_images, is_verified,
      profile:profiles!couturiere_profiles_id_fkey (first_name, last_name, city, avatar_url)
    `)
    .eq("is_available", true)
    .order("avg_rating", { ascending: false })

  return (
    <main className="flex-1 w-full">
      <MarketplaceClient initialProfessionals={(professionals as any) || []} />
    </main>
  )
}
