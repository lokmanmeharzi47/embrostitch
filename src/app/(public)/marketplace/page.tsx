import { createClient } from "@/lib/supabase/server"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Search, MapPin, Star, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const CATEGORIES = ["All", "Wedding", "Tailoring", "Embroidery", "Alterations", "Vintage", "Evening Wear", "Traditional"]

interface CouturiereResult {
  id: string
  specialty: string[]
  avg_rating: number
  total_reviews: number
  price_range: string | null
  category: string | null
  portfolio_images: string[]
  is_verified: boolean
  profile: {
    first_name: string
    last_name: string
    city: string | null
    avatar_url: string | null
  }
}

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<{ category?: string; city?: string; q?: string }> }) {
  const supabase = await createClient()
  const { category, city, q } = await searchParams;

  let query = supabase
    .from("couturiere_profiles")
    .select(`
      id, specialty, avg_rating, total_reviews, price_range, category, portfolio_images, is_verified,
      profile:profiles!couturiere_profiles_id_fkey (first_name, last_name, city, avatar_url)
    `)
    .eq("is_available", true)

  if (category && category !== "All") {
    const dbCategory = category.toLowerCase().replace(" ", "_");
    query = query.eq("category", dbCategory);
  }

  if (city) {
    // City filter on the profiles table via the relationship
    query = query.ilike("profiles.city", `%${city}%`);
  }

  if (q) {
    // Search by name in the profiles table via the relationship
    query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`, { foreignTable: "profiles" });
  }

  const { data: professionals } = await query.order("avg_rating", { ascending: false })

  const results = (professionals || []) as unknown as CouturiereResult[]

  // Map price_range to display label
  const priceLabel = (range: string | null) => {
    const map: Record<string, string> = { "$": "Budget", "$$": "Mid-range", "$$$": "Premium", "$$$$": "Luxury" }
    return range ? map[range] || range : "Contact"
  }

  // Default image when no portfolio
  const defaultImage = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"

  return (
    <>
      <main className="flex-1 pt-12 pb-12 w-full">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Sidebar Filters */}
            <aside className="w-full md:w-64 shrink-0 space-y-6">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <SlidersHorizontal size={20} className="text-muted-foreground" />
                </div>
                
                <div className="space-y-6 bg-card border rounded-2xl p-5 shadow-sm">
                  {/* Category Filter */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Category</h3>
                    <div className="flex flex-col gap-2">
                      {CATEGORIES.map(cat => (
                        <label key={cat} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                          <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" defaultChecked={cat === "All"} />
                          {cat}
                        </label>
                      ))}
                    </div>
                  </div>

                  <hr className="border-border" />

                  {/* City Filter */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">City</h3>
                    <Input placeholder="Type a city..." className="h-9" />
                  </div>

                  <hr className="border-border" />

                  {/* Price Filter */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Max Price</h3>
                    <input type="range" className="w-full accent-primary" min="100" max="2000" defaultValue="1000" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>10k DA</span>
                      <span>200k DA</span>
                    </div>
                  </div>
                  
                  <hr className="border-border" />
                  
                  {/* Rating Filter */}
                  <div>
                     <h3 className="text-sm font-semibold mb-3">Rating</h3>
                     <div className="flex items-center gap-2">
                        <Star className="fill-accent text-accent" size={16} />
                        <span className="text-sm">4.0 & up</span>
                     </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                  <h1 className="text-3xl font-bold">Find a Couturière</h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    {results.length} professional{results.length !== 1 ? "s" : ""} available
                  </p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input placeholder="Search by name or keyword..." className="pl-10 rounded-full" />
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.length > 0 ? (
                  results.map((pro) => {
                    const profile = Array.isArray(pro.profile) ? pro.profile[0] : pro.profile
                    const displayImage = pro.portfolio_images?.[0] || defaultImage
                    const displayName = profile ? `${profile.first_name} ${profile.last_name}` : "Couturière"

                    return (
                      <Card key={pro.id} className="group overflow-hidden bg-white hover:border-primary/50 flex flex-col h-full transition-all duration-300">
                        <div className="relative h-56 w-full overflow-hidden bg-muted shrink-0">
                          <Image
                            src={displayImage}
                            alt={displayName}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-3 right-3 z-10">
                            <Badge variant="gold" className="backdrop-blur-md">
                              <Star className="mr-1 h-3 w-3 fill-accent text-accent" />
                              {Number(pro.avg_rating).toFixed(1)}
                            </Badge>
                          </div>
                          {pro.is_verified && (
                            <div className="absolute top-3 left-3 z-10">
                              <Badge className="bg-green-600 text-white text-[10px]">
                                ✓ Verified
                              </Badge>
                            </div>
                          )}
                        </div>

                        <CardHeader className="p-4 pb-2">
                           <h3 className="font-bold text-lg text-foreground line-clamp-1">{displayName}</h3>
                           <p className="text-primary text-sm font-medium capitalize">
                             {pro.category?.replace("_", " ") || (pro.specialty?.[0] || "General Couture")}
                           </p>
                        </CardHeader>

                        <CardContent className="p-4 pt-0 flex-1">
                          <div className="flex items-center text-muted-foreground text-xs gap-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {profile?.city || "Algeria"}
                            </div>
                            <div>
                              {pro.total_reviews} review{pro.total_reviews !== 1 ? "s" : ""}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Price range: <span className="font-semibold text-foreground">{priceLabel(pro.price_range)}</span>
                          </p>
                        </CardContent>

                        <CardFooter className="p-4 pt-0 border-t mt-auto">
                          <Button className="w-full mt-4" variant="luxury" asChild>
                            <Link href={`/professionals/${pro.id}`}>View Profile</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    )
                  })
                ) : (
                  <div className="col-span-full text-center py-16 text-muted-foreground">
                    <span className="material-icons text-5xl mb-3 opacity-30">search_off</span>
                    <h3 className="text-lg font-bold text-foreground mb-2">No professionals found</h3>
                    <p className="text-sm">Try adjusting your filters or check back later.</p>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </>
  )
}
