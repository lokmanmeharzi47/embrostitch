import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { DollarSign, ShoppingBag, Eye, PlusCircle, LayoutDashboard, Share2, Star } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface CreatorDesign {
  id: string
  title: string
  image_url: string | null
  category: string | null
}

interface CouturiereStats {
  avg_rating: number | string | null
  total_reviews: number | null
}

interface OrderClient {
  first_name: string | null
  last_name: string | null
}

interface CreatorOrder {
  id: string
  title: string
  status: string
  price: number | string | null
  client: OrderClient | OrderClient[] | null
}

function getOrderClient(order: CreatorOrder) {
  return Array.isArray(order.client) ? order.client[0] : order.client
}

export default async function CreatorDashboard() {
  const supabase = await createClient()

  // 1. Check Session & Profile
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "creator") redirect("/login")

  // 2. Fetch Creator Data in parallel to avoid waterfalls
  const [
    { data: designs },
    { data: couturiereProfile },
    { data: orders }
  ] = await Promise.all([
    supabase
      .from("designs")
      .select("*")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false }),
    
    supabase
      .from("couturiere_profiles")
      .select("avg_rating, total_reviews")
      .eq("id", user.id)
      .maybeSingle(),
      
    supabase
      .from("orders")
      .select("*, client:profiles!orders_client_id_fkey(first_name, last_name)")
      .eq("couturiere_id", user.id)
      .order("created_at", { ascending: false })
  ])

  const creatorDesigns = (designs || []) as CreatorDesign[]
  const creatorOrders = (orders || []) as CreatorOrder[]
  const creatorStats = couturiereProfile as CouturiereStats | null
  const activeOrders = creatorOrders.filter(o => o.status !== "completed" && o.status !== "rejected")
  const totalRevenue = creatorOrders.filter(o => o.status === "completed").reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)
  const avgRating = creatorStats?.avg_rating ? Number(creatorStats.avg_rating).toFixed(1) : "0.0";

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Creator Studio</h1>
          <p className="text-muted-foreground mt-2 text-lg">Gérez votre univers créatif et vos commandes en un coup d'œil.</p>
        </div>
        <Button variant="luxury" size="lg" className="gap-2 shadow-xl shadow-primary/10" asChild>
           <Link href="/creator/portfolio"><PlusCircle size={20} /> Nouvelle Création</Link>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Revenus Est.", value: `${totalRevenue} DZD`, desc: "Commandes terminées", icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
          { label: "Portfolio", value: creatorDesigns.length, desc: "Designs publiés", icon: Share2, color: "text-primary", bg: "bg-primary/5" },
          { label: "Projets Actifs", value: activeOrders.length, desc: "En cours de réalisation", icon: ShoppingBag, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Note Globale", value: `${avgRating}/5`, desc: "Moyenne des avis", icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((metric, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{metric.label}</p>
                  <div className="text-3xl font-black mt-2 text-foreground tracking-tight">{metric.value}</div>
                  <p className="text-xs text-muted-foreground mt-2 font-medium">{metric.desc}</p>
                </div>
                <div className={cn("p-3 rounded-2xl", metric.bg)}>
                  <metric.icon className={metric.color} size={22} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Portfolio Grid Snippet */}
         <Card className="lg:col-span-2 overflow-hidden border-none shadow-sm">
            <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between">
               <div>
                 <CardTitle className="text-xl font-bold">Dernières Créations</CardTitle>
                 <CardDescription>Vos pièces les plus récentes exposées.</CardDescription>
               </div>
               <Button variant="ghost" size="sm" className="rounded-xl" asChild><Link href="/creator/portfolio">Tout voir</Link></Button>
            </CardHeader>
            <CardContent className="p-8">
              {creatorDesigns.length === 0 ? (
                 <div className="text-center py-16 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                     <PlusCircle className="text-muted-foreground" />
                   </div>
                   <h3 className="font-bold text-lg">Aucun design pour le moment</h3>
                   <p className="text-muted-foreground mb-6 max-w-xs mx-auto">Commencez par ajouter vos plus belles pièces à votre portfolio.</p>
                   <Button variant="luxury" asChild><Link href="/creator/portfolio">Ajouter mon premier design</Link></Button>
                 </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                   {creatorDesigns.slice(0, 6).map((design) => (
                      <div key={design.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-secondary hover:shadow-2xl transition-all duration-500">
                        {design.image_url ? (
                           <img src={design.image_url} alt={design.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-muted-foreground">Pas d'image</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                           <p className="text-white text-sm font-bold truncate">{design.title}</p>
                           <p className="text-white/70 text-[10px] uppercase tracking-wider">{design.category || 'Sur mesure'}</p>
                        </div>
                      </div>
                   ))}
                </div>
              )}
            </CardContent>
         </Card>

         <Card className="flex flex-col border-none shadow-sm overflow-hidden">
            <CardHeader className="p-8 border-b border-border/50">
               <CardTitle className="text-xl font-bold">Nouvelles Requêtes</CardTitle>
               <CardDescription>Commandes en attente de réponse.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
               <div className="divide-y divide-border/50">
                  {activeOrders.length === 0 ? (
                     <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                           <ShoppingBag size={20} className="text-muted-foreground/50" />
                        </div>
                        <p className="text-muted-foreground text-sm font-medium">Aucune requête en cours.</p>
                     </div>
                  ) : (
                    activeOrders.map((order) => (
                       <div key={order.id} className="p-6 hover:bg-secondary/50 transition-colors group">
                          <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{order.title}</h4>
                             <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tight rounded-md">{order.status}</Badge>
                          </div>
                          <p className="text-[10px] font-bold text-muted-foreground/70 uppercase mb-4">
                            Client: {getOrderClient(order)?.first_name || "Client"} {getOrderClient(order)?.last_name || ""}
                          </p>
                          <Button size="sm" variant="luxury" className="w-full rounded-xl text-xs h-9" asChild>
                             <Link href={`/creator/orders/${order.id}`}>Détails de la commande</Link>
                          </Button>
                       </div>
                    ))
                  )}
               </div>
            </CardContent>
            <div className="p-6 border-t border-border/50 bg-secondary/20">
               <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-widest hover:bg-white" asChild><Link href="/creator/orders">Toutes les commandes</Link></Button>
            </div>
         </Card>
      </div>
    </div>
  )
}
