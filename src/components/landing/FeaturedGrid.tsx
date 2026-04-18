import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Star, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/routing"

export default async function FeaturedGrid() {
  const t = await getTranslations("FeaturedGrid")
  const supabase = await createClient()
  
  const { data: pros } = await supabase
    .from("couturiere_profiles")
    .select(`
      id, specialty, avg_rating, total_reviews, location, price_range, portfolio_images,
      profiles ( first_name, last_name )
    `)
    .eq("is_available", true)
    .order("avg_rating", { ascending: false })
    .limit(3)

  const couturieres = pros || []

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div className="max-w-2xl text-left">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              {t('titleFirst')} <span className="text-primary">{t('titleSecond')}</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
          <Button variant="ghost" className="mt-4 md:mt-0 gap-2 shrink-0" asChild>
            <Link href="/search">
              {t('viewAll')}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {couturieres.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              {t('emptyState')}
            </div>
          ) : (
            couturieres.map((pro: any) => (
              <Card key={pro.id} className="group overflow-hidden border-border/50 bg-white hover:border-primary/50">
                <div className="relative h-64 w-full overflow-hidden bg-muted">
                  <Image
                    src={(pro.portfolio_images && pro.portfolio_images.length > 0) ? pro.portfolio_images[0] : "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2000&auto=format&fit=crop"}
                    alt={`${pro.profiles?.first_name} ${pro.profiles?.last_name}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="gold" className="backdrop-blur-md shadow-sm">
                      <Star className="mr-1 h-3 w-3 fill-accent text-accent" />
                      {pro.avg_rating} ({pro.total_reviews})
                    </Badge>
                  </div>
                </div>

                <CardHeader className="p-5 pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {pro.profiles?.first_name} {pro.profiles?.last_name}
                      </h3>
                      <p className="text-primary font-medium">{pro.specialty && pro.specialty.length > 0 ? pro.specialty[0] : "Couturière"}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5">
                  <div className="flex items-center text-muted-foreground text-sm gap-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {pro.location || "Algeria"}
                    </div>
                    <div className="font-medium text-foreground">
                      {pro.price_range || "$$"}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-0">
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/profile/${pro.id}`}>{t('viewProfile')}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
