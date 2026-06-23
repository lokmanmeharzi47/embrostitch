import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { DollarSign, ShoppingBag, PlusCircle, Share2, Star, ArrowRight, Image as ImageIcon } from "lucide-react"
import Link from "next/link"

interface CreatorDesign {
  id: string
  title: string
  image_url: string | null
  category: string | null
}

interface CreatorStats {
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending:     { label: "Pending", className: "bg-secondary text-secondary-foreground border-border" },
    in_progress: { label: "In Progress",   className: "bg-primary/5 text-primary border-primary/20" },
    completed:   { label: "Completed",    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    rejected:    { label: "Rejected",     className: "bg-destructive/10 text-destructive border-destructive/20" },
  }
  const { label, className } = map[status] || { label: status, className: "bg-secondary text-secondary-foreground border-border" }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${className}`}>
      {label}
    </span>
  )
}

export default async function CreatorDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "creator") redirect("/login")

  const [
    { data: designs },
    { data: creatorProfile },
    { data: orders }
  ] = await Promise.all([
    supabase
      .from("designs")
      .select("*")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false }),
    
    supabase
      .from("creator_profiles")
      .select("avg_rating, total_reviews")
      .eq("id", user.id)
      .maybeSingle(),
      
    supabase
      .from("orders")
      .select("*, client:profiles!orders_client_id_fkey(first_name, last_name)")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false })
  ])

  const creatorDesigns = (designs || []) as CreatorDesign[]
  const creatorOrders = (orders || []) as CreatorOrder[]
  const creatorStats = creatorProfile as CreatorStats | null
  const activeOrders = creatorOrders.filter(o => o.status !== "completed" && o.status !== "rejected")
  const totalRevenue = creatorOrders.filter(o => o.status === "completed").reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)
  const avgRating = creatorStats?.avg_rating ? Number(creatorStats.avg_rating).toFixed(1) : "0.0";

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 pb-6 border-b border-border">
        <div>
          <h1 className="text-4xl font-serif text-foreground tracking-tight mb-2">Designer Studio</h1>
          <p className="text-secondary-foreground font-light text-lg">Manage your creative universe and bespoke orders.</p>
        </div>
        <Button variant="luxury" size="lg" className="gap-2 rounded-full px-8 shadow-sm" asChild>
           <Link href="/creator/products"><PlusCircle size={16} /> New Design</Link>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Est. Revenue", value: `${totalRevenue.toLocaleString()} DA`, desc: "Completed orders", icon: DollarSign },
          { label: "Portfolio", value: creatorDesigns.length, desc: "Published designs", icon: ImageIcon },
          { label: "Active Projects", value: activeOrders.length, desc: "In progress", icon: ShoppingBag },
          { label: "Global Rating", value: `${avgRating}/5`, desc: "Average reviews", icon: Star },
        ].map((metric, i) => (
          <div key={i} className="bg-surface border border-border rounded-[20px] p-6 transition-all duration-400 hover:border-primary/40 hover:shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">
                <metric.icon size={18} />
              </div>
            </div>
            <p className="text-3xl font-serif text-foreground mb-1">{metric.value}</p>
            <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">{metric.label}</p>
            <p className="text-xs text-secondary-foreground font-light">{metric.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Portfolio Section */}
         <div className="lg:col-span-2 bg-surface rounded-[24px] border border-border overflow-hidden">
            <div className="p-8 border-b border-border flex flex-row items-center justify-between">
               <div>
                 <h2 className="text-xl font-serif text-foreground">Latest Creations</h2>
                 <p className="text-sm text-secondary-foreground font-light mt-1">Your most recent pieces on display.</p>
               </div>
               <Link href="/creator/products" className="text-xs font-medium text-primary uppercase tracking-widest hover:text-primary-light transition-colors flex items-center gap-1 group">
                 View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
            <div className="p-8">
              {creatorDesigns.length === 0 ? (
                 <div className="text-center py-20 bg-secondary/30 rounded-[16px] border border-dashed border-border">
                   <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 border border-border shadow-sm">
                     <ImageIcon className="text-muted-foreground w-6 h-6" />
                   </div>
                   <h3 className="font-serif text-xl text-foreground mb-2">No designs yet</h3>
                   <p className="text-sm text-secondary-foreground font-light mb-8 max-w-sm mx-auto">Start showcasing your beautiful work to attract clients.</p>
                   <Button variant="luxury" className="rounded-full px-8" asChild><Link href="/creator/products">Add First Design</Link></Button>
                 </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                   {creatorDesigns.slice(0, 6).map((design) => (
                      <div key={design.id} className="group relative aspect-[4/5] rounded-[16px] overflow-hidden bg-secondary">
                        {design.image_url ? (
                           <img src={design.image_url} alt={design.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-muted-foreground font-light text-sm">No Image</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                           <p className="text-foreground text-sm font-medium truncate mb-1">{design.title}</p>
                           <p className="text-primary text-[10px] uppercase tracking-widest">{design.category || 'Bespoke'}</p>
                        </div>
                      </div>
                   ))}
                </div>
              )}
            </div>
         </div>

         {/* Active Requests */}
         <div className="bg-surface rounded-[24px] border border-border overflow-hidden flex flex-col">
            <div className="p-8 border-b border-border">
               <h2 className="text-xl font-serif text-foreground">New Requests</h2>
               <p className="text-sm text-secondary-foreground font-light mt-1">Orders awaiting your attention.</p>
            </div>
            <div className="flex-1 flex flex-col">
               <div className="divide-y divide-border">
                  {activeOrders.length === 0 ? (
                     <div className="p-16 text-center">
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                           <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-secondary-foreground text-sm font-light">No pending requests.</p>
                     </div>
                  ) : (
                    activeOrders.map((order) => (
                       <div key={order.id} className="p-6 hover:bg-secondary/30 transition-colors group">
                          <div className="flex justify-between items-start mb-3">
                             <h4 className="font-serif text-base text-foreground group-hover:text-primary transition-colors">{order.title}</h4>
                             <StatusBadge status={order.status} />
                          </div>
                          <p className="text-xs text-secondary-foreground font-light mb-5 flex items-center gap-2">
                            <span>Client:</span> <span className="font-medium text-foreground">{getOrderClient(order)?.first_name || "Client"} {getOrderClient(order)?.last_name || ""}</span>
                          </p>
                          <Button variant="outline" className="w-full rounded-full text-xs h-10 border-border text-foreground hover:border-primary/40 transition-colors" asChild>
                             <Link href={`/creator/orders/${order.id}`}>View Details</Link>
                          </Button>
                       </div>
                    ))
                  )}
               </div>
            </div>
            <div className="p-6 border-t border-border bg-secondary/10 text-center">
               <Link href="/creator/orders" className="text-xs font-medium text-primary uppercase tracking-widest hover:text-primary-light transition-colors">
                 All Orders
               </Link>
            </div>
         </div>
      </div>
    </div>
  )
}
