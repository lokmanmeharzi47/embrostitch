import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Clock, CheckCircle, PlusCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function ClientDashboardPage() {
  const supabase = await createClient()

  // 1. Get Session & Profile
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .single()
    
  if (!profile) redirect("/login")

  // 2. Fetch Client Specific Data
  const { data: orders } = await supabase
    .from("orders")
    .select("id, title, status, delivery_date, price, couturiere:couturiere_id (first_name, last_name)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  const activeOrders = orders?.filter(o => o.status !== "completed" && o.status !== "rejected") || []
  const completedOrders = orders?.filter(o => o.status === "completed") || []

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile.first_name}</h1>
          <p className="text-muted-foreground mt-1">Ready for your next custom outfit?</p>
        </div>
        <Button variant="luxury" size="lg" className="gap-2" asChild>
           <Link href="/search"><PlusCircle size={20} /> Find a Couturière</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader className="pb-3">
             <CardTitle className="text-lg font-bold text-muted-foreground flex items-center gap-2"><Clock size={18} /> Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-4xl font-bold">{activeOrders.length}</div>
             <Link href="/client/orders" className="text-sm text-primary font-medium mt-1 hover:underline flex items-center gap-1">View details <ArrowRight size={14}/></Link>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-3">
             <CardTitle className="text-lg font-bold text-muted-foreground flex items-center gap-2"><CheckCircle size={18} /> Completed</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-4xl font-bold">{completedOrders.length}</div>
             <p className="text-sm text-muted-foreground mt-1">Total lifetime orders</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mt-12 mb-6">Recent Orders</h2>
      <Card className="bg-white overflow-hidden">
        <div className="divide-y divide-border">
           
           {!orders || orders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                 You haven't placed any orders yet. 
                 <div className="mt-4">
                    <Button asChild><Link href="/search">Explore Professionals</Link></Button>
                 </div>
              </div>
           ) : (
             orders.map((order) => (
                <div key={order.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-4">
                     <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                        <Clock size={24} className="text-orange-600" />
                     </div>
                     <div>
                        <h4 className="font-bold text-foreground">{order.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                           With {(order.couturiere as any)?.first_name} {(order.couturiere as any)?.last_name} • {order.price} DZD
                        </p>
                     </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                     <Badge variant={order.status === "completed" ? "default" : "outline"} className="capitalize">
                        {order.status.replace("_", " ")}
                     </Badge>
                     <span className="text-xs text-muted-foreground">
                        {order.delivery_date ? `Due ${new Date(order.delivery_date).toLocaleDateString()}` : "No delivery date set"}
                     </span>
                  </div>
                </div>
             ))
           )}
           
        </div>
      </Card>
    </div>
  )
}
