import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Scissors, AlertCircle, TrendingUp, ArrowRight, User } from "lucide-react"
import Link from "next/link"

export default async function CouturiereDashboardPage() {
  const supabase = await createClient()

  // 1. Check Session & Profile
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "couturiere") redirect("/login")

  // 2. Fetch Couturière Specific Data
  // Orders
  const { data: orders } = await supabase
    .from("orders")
    .select("id, title, status, delivery_date, price, client:client_id (first_name, last_name)")
    .eq("couturiere_id", user.id)
    .order("created_at", { ascending: false })

  // Profile Specifics (Rating, Portfolio completion)
  const { data: proStats } = await supabase
    .from("couturiere_profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const pendingOrders = orders?.filter(o => o.status === "pending") || []
  const activeOrders = orders?.filter(o => o.status === "in_progress") || []
  const completedOrders = orders?.filter(o => o.status === "completed") || []

  // Mock revenue stat for demonstration based on completed
  const totalRevenue = completedOrders.reduce((acc, curr) => acc + (curr.price || 0), 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Bonjour, {profile.first_name}</h1>
        <p className="text-muted-foreground mt-1">Here's your atelier overview for today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white">
          <CardContent className="p-6">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-semibold text-muted-foreground uppercase">New Requests</p>
                   <div className="text-3xl font-bold mt-2 text-foreground">{pendingOrders.length}</div>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl"><AlertCircle className="text-blue-600" /></div>
             </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-6">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-semibold text-muted-foreground uppercase">In Progress</p>
                   <div className="text-3xl font-bold mt-2 text-foreground">{activeOrders.length}</div>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl"><Scissors className="text-orange-600" /></div>
             </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-semibold text-muted-foreground uppercase">Completed</p>
                   <div className="text-3xl font-bold mt-2 text-foreground">{completedOrders.length}</div>
                </div>
                <div className="p-3 bg-green-100 rounded-xl"><TrendingUp className="text-green-600" /></div>
             </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-semibold text-muted-foreground uppercase">Revenue</p>
                   <div className="text-3xl font-bold mt-2 text-foreground">{totalRevenue} <span className="text-sm font-normal text-muted-foreground">DZD</span></div>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl"><TrendingUp className="text-purple-600" /></div>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
         {/* Orders Feed */}
         <Card className="bg-white lg:col-span-2 overflow-hidden">
           <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" asChild><Link href="/couturiere/orders">View All</Link></Button>
           </CardHeader>
           <div className="divide-y divide-border">
              {!orders || orders.length === 0 ? (
                 <div className="p-8 text-center text-muted-foreground">No orders yet.</div>
              ) : (
                orders.slice(0, 5).map((order) => (
                   <div key={order.id} className="p-6 flex justify-between items-center hover:bg-muted/50 transition-colors">
                     <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                           <User size={18} className="text-slate-500" />
                        </div>
                        <div>
                           <h4 className="font-bold text-foreground">{order.title}</h4>
                           <p className="text-sm text-muted-foreground mt-1">Client: {(order.client as any)?.first_name} {(order.client as any)?.last_name}</p>
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-2 text-right">
                        <Badge variant={order.status === "in_progress" ? "default" : order.status === "completed" ? "secondary" : "outline"} className="capitalize">
                           {order.status.replace("_", " ")}
                        </Badge>
                     </div>
                   </div>
                ))
              )}
           </div>
         </Card>

         {/* Pro Profile Snapshot */}
         <Card className="bg-white">
           <CardHeader className="border-b border-border pb-4">
              <CardTitle>Professional Profile</CardTitle>
           </CardHeader>
           <CardContent className="p-6">
              <div className="space-y-6">
                 <div>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                    <p className="text-2xl font-bold mt-1 text-primary">{proStats?.avg_rating || "New"} <span className="text-sm font-normal text-muted-foreground">({proStats?.total_reviews || 0} reviews)</span></p>
                 </div>
                 <hr className="border-border" />
                 <div>
                    <p className="text-sm text-muted-foreground">Specialty</p>
                    <Badge variant="outline" className="mt-2">{proStats?.specialty || "General Couture"}</Badge>
                 </div>
                 <Button className="w-full mt-4" variant="outline" asChild><Link href="/couturiere/portfolio">Manage Portfolio</Link></Button>
              </div>
           </CardContent>
         </Card>
      </div>
    </div>
  )
}
