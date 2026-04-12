import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export default function FeaturedGridSkeleton() {
  const MOCK_SKELETONS = [1, 2, 3]
  
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div className="max-w-2xl text-left">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              Featured <span className="text-primary animate-pulse">Couturières</span>
            </h2>
            <div className="h-6 w-3/4 bg-muted animate-pulse rounded"></div>
            <div className="h-6 w-1/2 bg-muted animate-pulse rounded mt-2"></div>
          </div>
          <Button variant="ghost" className="mt-4 md:mt-0 gap-2 shrink-0 animate-pulse bg-muted text-transparent">
            View all professionals
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_SKELETONS.map((id) => (
            <Card key={id} className="group overflow-hidden border-border/50 bg-white shadow-sm">
              <div className="relative h-64 w-full overflow-hidden bg-muted animate-pulse"></div>

              <CardHeader className="p-5 pb-0">
                <div className="flex justify-between items-start">
                  <div className="w-full">
                    <div className="h-6 w-2/3 bg-muted animate-pulse rounded mb-2"></div>
                    <div className="h-4 w-1/3 bg-muted/50 animate-pulse rounded"></div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5">
                <div className="flex items-center text-muted-foreground text-sm gap-4">
                  <div className="flex items-center gap-1 w-full">
                    <div className="h-4 w-1/4 bg-muted animate-pulse rounded"></div>
                  </div>
                  <div className="h-4 w-8 bg-muted animate-pulse rounded"></div>
                </div>
              </CardContent>

              <CardFooter className="p-5 pt-0">
                <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
