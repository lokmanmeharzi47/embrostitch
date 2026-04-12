import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { DollarSign, ShoppingBag, Eye, PlusCircle, LayoutDashboard, Share2, Star } from "lucide-react"
import Link from "next/link"

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

  // 2. Fetch Creator Data
  // Designs (Portfolio)
  const { data: designs } = await supabase
    .from("designs")
    .select("*")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false })

  // Related Orders (Filtering where this user is the assigned professional)
  const { data: orders } = await supabase
    .from("orders")
    .select("*, client:client_id (first_name, last_name)")
    .eq("couturiere_id", user.id)
    .order("created_at", { ascending: false })

  const activeOrders = orders?.filter(o => o.status !== "completed" && o.status !== "rejected") || []
  const totalRevenue = orders?.filter(o => o.status === "completed").reduce((acc, curr) => acc + (Number(curr.price) || 0), 0) || 0

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Creator Studio</h1>
          <p className="text-muted-foreground mt-1">Showcase your designs and manage creative requests.</p>
        </div>
        <Button variant="luxury" className="gap-2" asChild>
           <Link href="/creator/portfolio"><PlusCircle size={20} /> Upload New Design</Link>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Est. Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue} DZD</div>
            <p className="text-xs text-muted-foreground mt-1">From completed orders</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Items</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{designs?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Live in marketplace</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress status</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Design Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.0/5</div>
            <p className="text-xs text-muted-foreground mt-1">Average across designs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
         {/* Portfolio Grid Snippet */}
         <Card className="bg-white lg:col-span-2 overflow-hidden">
            <CardHeader className="border-b border-border flex flex-row items-center justify-between">
               <CardTitle>My Latest Designs</CardTitle>
               <Button variant="ghost" size="sm" asChild><Link href="/creator/portfolio">Manage Portfolio</Link></Button>
            </CardHeader>
            <div className="p-6">
              {!designs || designs.length === 0 ? (
                 <div className="text-center py-12">
                   <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                     <PlusCircle className="text-muted-foreground" />
                   </div>
                   <h3 className="font-bold text-lg">No designs uploaded yet</h3>
                   <p className="text-muted-foreground mb-6">Start building your creative portfolio today.</p>
                   <Button variant="luxury" asChild><Link href="/creator/portfolio">Add First Design</Link></Button>
                 </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {designs.slice(0, 6).map((design) => (
                      <div key={design.id} className="group relative aspect-square rounded-xl overflow-hidden bg-muted">
                        {design.image_url ? (
                           <img src={design.image_url} alt={design.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                           <p className="text-white text-xs font-bold">{design.title}</p>
                        </div>
                      </div>
                   ))}
                </div>
              )}
            </div>
         </Card>

         <Card className="bg-white flex flex-col">
            <CardHeader className="pb-3 border-b border-border">
               <CardTitle>Design Requests</CardTitle>
            </CardHeader>
            <div className="flex-1 overflow-y-auto">
               <div className="divide-y divide-border">
                  {/* For now, filter orders where they might be the assigned professional */}
                  {!activeOrders || activeOrders.length === 0 ? (
                     <div className="p-8 text-center text-muted-foreground text-sm">No new requests found.</div>
                  ) : (
                    activeOrders.map((order) => (
                       <div key={order.id} className="p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                             <h4 className="font-bold text-sm">{order.title}</h4>
                             <Badge variant="outline" className="text-[10px] capitalize">{order.status}</Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mb-2">From: {(order.client as any)?.first_name} {(order.client as any)?.last_name}</p>
                          <Button size="sm" className="w-full h-8 text-xs" asChild>
                             <Link href={`/creator/orders/${order.id}`}>View Details</Link>
                          </Button>
                       </div>
                    ))
                  )}
               </div>
            </div>
            <div className="p-4 border-t border-border mt-auto">
               <Button variant="ghost" className="w-full text-sm" asChild><Link href="/creator/orders">View All Orders</Link></Button>
            </div>
         </Card>
      </div>
    </div>
  )
}
