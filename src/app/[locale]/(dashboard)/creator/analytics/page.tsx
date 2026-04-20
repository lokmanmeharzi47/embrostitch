import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/Card"
import { DollarSign, TrendingUp, ShoppingBag, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

export default async function CreatorAnalyticsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Fetch profile and orders in parallel
  const [
    { data: profile },
    { data: orders }
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single(),
    
    supabase
      .from("orders")
      .select("id, status, price, created_at")
      .eq("couturiere_id", user.id)
      .order("created_at", { ascending: false })
  ])

  if (!profile || profile.role !== "creator") redirect("/")

  const completedOrders = orders?.filter(o => o.status === "completed") || []
  const totalRevenue = completedOrders.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)
  const pendingRevenue = orders
    ?.filter(o => o.status === "in_progress")
    .reduce((acc, curr) => acc + (Number(curr.price) || 0), 0) || 0
  const totalOrders = orders?.length || 0
  const avgOrderValue = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Analytiques & Revenus</h1>
        <p className="text-muted-foreground mt-2 text-lg">Suivez vos performances financières et la croissance de votre activité.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Gagné", value: `${totalRevenue} DZD`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
          { label: "En Cours", value: `${pendingRevenue} DZD`, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Commandes", value: totalOrders, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Panier Moyen", value: `${avgOrderValue} DZD`, icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((metric, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{metric.label}</p>
                  <div className="text-2xl font-black mt-2 text-foreground">{metric.value}</div>
                </div>
                <div className={cn("p-3 rounded-2xl", metric.bg)}>
                  <metric.icon className={metric.color} size={22} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-border/50">
          <CardTitle className="text-xl font-bold">Historique des Revenus</CardTitle>
          <CardDescription>Détails de vos gains par commande terminée.</CardDescription>
        </CardHeader>
        <div className="divide-y divide-border/50">
          {completedOrders.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="text-muted-foreground/30" size={32} />
              </div>
              <h3 className="font-bold text-xl text-foreground">Aucun revenu pour le moment</h3>
              <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Vos gains s'afficheront ici une fois vos premières commandes terminées.</p>
            </div>
          ) : (
            completedOrders.map((order) => (
              <div key={order.id} className="p-8 flex justify-between items-center hover:bg-secondary/30 transition-all group">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-muted/20 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <ShoppingBag size={20} />
                   </div>
                   <div>
                      <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors pr-2">Commande #{order.id.substring(0, 8)}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">{new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                   </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-green-600">+{order.price || 0} DZD</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
