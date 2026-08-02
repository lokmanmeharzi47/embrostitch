import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Star, MapPin, Sparkles, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/routing"

interface FeaturedProfile {
  id: string
  specialty: string[] | null
  avg_rating: number | null
  total_reviews: number | null
  location: string | null
  price_range: string | null
  portfolio_images: string[] | null
  profiles: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null
}

export default async function FeaturedGrid() {
  const t = await getTranslations("FeaturedGrid")
  const supabase = await createClient()

  const { data: pros } = await supabase
    .from("creator_profiles")
    .select(`
      id, specialty, avg_rating, total_reviews, location, price_range, portfolio_images,
      profiles ( first_name, last_name )
    `)
    .eq("is_available", true)
    .order("avg_rating", { ascending: false })
    .limit(3)

  const creators = (pros || []) as unknown as FeaturedProfile[]

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{t('eyebrow')}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-4 leading-tight">
              {t('titleFirst')} {t('titleSecond')}
            </h2>
            <p className="text-lg text-secondary-foreground/70 font-light leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-light transition-colors shrink-0 group uppercase tracking-widest"
          >
            {t('viewAll')}
            <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>

        {creators.length === 0 ? (
          <div className="text-center py-16 px-6 bg-secondary/30 rounded-[24px] border border-border max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-border">
              <Sparkles className="w-6 h-6 text-primary/50" />
            </div>
            <h3 className="font-serif text-2xl text-foreground mb-3">{t('emptyTitle')}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed mb-8">
              {t('emptySubtitle')}
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium text-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
            >
              {t('emptyCta')}
              <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {creators.map((pro) => {
              const profile = Array.isArray(pro.profiles) ? pro.profiles[0] : pro.profiles
              return (
                <Card key={pro.id} className="group overflow-hidden border-border/50 bg-card rounded-[20px] premium-shadow">
                  <div className="relative h-64 w-full overflow-hidden bg-muted">
                    <Image
                      src={(pro.portfolio_images && pro.portfolio_images.length > 0) ? pro.portfolio_images[0] : "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2000&auto=format&fit=crop"}
                      alt={`${profile?.first_name} ${profile?.last_name}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-4 end-4 z-10">
                      <Badge variant="gold" className="backdrop-blur-md shadow-sm">
                        <Star className="me-1 h-3 w-3 fill-primary text-primary" />
                        {pro.avg_rating} ({pro.total_reviews})
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="p-5 pb-0">
                    <h3 className="font-serif text-xl text-foreground mb-1">
                      {profile?.first_name} {profile?.last_name}
                    </h3>
                    <p className="text-primary text-sm font-medium">{pro.specialty && pro.specialty.length > 0 ? pro.specialty[0] : t('generalCouture')}</p>
                  </CardHeader>

                  <CardContent className="p-5">
                    <div className="flex items-center text-muted-foreground text-sm gap-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {pro.location || "Algérie"}
                      </div>
                      <div className="font-medium text-foreground">
                        {pro.price_range || "$$"}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-5 pt-0">
                    <Button className="w-full rounded-xl" variant="outline" asChild>
                      <Link href={`/profile/${pro.id}`}>{t('viewProfile')}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
