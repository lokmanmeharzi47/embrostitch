import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/Card"
import { DollarSign, TrendingUp, ShoppingBag, BarChart3 } from "lucide-react"

export default async function CreatorAnalyticsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "creator") redirect("/")

  // Fetch earnings data
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, price, created_at")
    .eq("couturiere_id", user.id)
    .order("created_at", { ascending: false })

  const completedOrders = orders?.filter(o => o.status === "completed") || []
  const totalRevenue = completedOrders.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)
  const pendingRevenue = orders
    ?.filter(o => o.status === "in_progress")
    .reduce((acc, curr) => acc + (Number(curr.price) || 0), 0) || 0
  const totalOrders = orders?.length || 0
  const avgOrderValue = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Earnings & Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your revenue and performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase">Total Earned</p>
                <div className="text-3xl font-bold mt-2 text-foreground">{totalRevenue} <span className="text-sm font-normal text-muted-foreground">DZD</span></div>
              </div>
              <div className="p-3 bg-green-100 rounded-xl"><DollarSign className="text-green-600" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase">Pending</p>
                <div className="text-3xl font-bold mt-2 text-foreground">{pendingRevenue} <span className="text-sm font-normal text-muted-foreground">DZD</span></div>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl"><TrendingUp className="text-orange-600" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase">Total Orders</p>
                <div className="text-3xl font-bold mt-2 text-foreground">{totalOrders}</div>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl"><ShoppingBag className="text-blue-600" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase">Avg. Order</p>
                <div className="text-3xl font-bold mt-2 text-foreground">{avgOrderValue} <span className="text-sm font-normal text-muted-foreground">DZD</span></div>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl"><BarChart3 className="text-purple-600" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white overflow-hidden">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle>Revenue History</CardTitle>
          <CardDescription>Your completed order earnings over time.</CardDescription>
        </CardHeader>
        <div className="divide-y divide-border">
          {completedOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg">No earnings yet</h3>
              <p className="text-sm mt-1">Complete your first order to start tracking revenue.</p>
            </div>
          ) : (
            completedOrders.map((order) => (
              <div key={order.id} className="p-6 flex justify-between items-center hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-semibold text-sm">Order #{order.id.substring(0, 8)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-green-600">+{order.price || 0} DZD</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
