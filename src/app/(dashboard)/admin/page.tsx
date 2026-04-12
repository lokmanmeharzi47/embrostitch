import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { Users, Receipt, AlertTriangle, Activity } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 1. Get Session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // 2. Fetch Admin Data (System stats)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [
    { count: userCount }, 
    { count: orderCount }, 
    { data: completedOrders },
    { count: recentActivityCount }
  ] = await Promise.all([
     supabase.from("profiles").select("*", { count: "exact", head: true }),
     supabase.from("orders").select("*", { count: "exact", head: true }),
     supabase.from("orders").select("price").eq("status", "completed"),
     supabase.from("profiles").select("*", { count: "exact", head: true }).gt("created_at", oneDayAgo),
  ])
  
  const totalRevenue = completedOrders?.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0) || 0
  const isHealthy = recentActivityCount && recentActivityCount > 0;
  
  // Recent Platform Activity
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, status, price, created_at")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-2">
        <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
        <p className="text-muted-foreground mt-1">Platform overview and administration metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white">
          <CardContent className="p-6">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-semibold text-muted-foreground uppercase">Total Users</p>
                   <div className="text-3xl font-bold mt-2 text-foreground">{userCount || 0}</div>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl"><Users className="text-blue-600" /></div>
             </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-6">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-semibold text-muted-foreground uppercase">Total Orders</p>
                   <div className="text-3xl font-bold mt-2 text-foreground">{orderCount || 0}</div>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl"><Receipt className="text-orange-600" /></div>
             </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-6">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-semibold text-muted-foreground uppercase">Platform Health</p>
                   <div className={`text-2xl font-bold mt-2 ${isHealthy ? "text-success" : "text-warning"}`}>
                     {isHealthy ? "Active" : "Low Activity"}
                   </div>
                </div>
                <div className="p-3 bg-green-100 rounded-xl"><Activity className="text-green-600" /></div>
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
                <div className="p-3 bg-purple-100 rounded-xl"><Activity className="text-purple-600" /></div>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
         {/* Recent Users */}
         <Card className="bg-white overflow-hidden">
           <CardHeader className="border-b border-border pb-4">
              <CardTitle>Recent Signups</CardTitle>
           </CardHeader>
           <div className="divide-y divide-border">
              {recentUsers?.map((u) => (
                 <div key={u.id} className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
                    <div>
                       <p className="font-semibold text-sm">{u.first_name} {u.last_name}</p>
                       <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-secondary rounded-full uppercase">{u.role}</span>
                 </div>
              ))}
           </div>
         </Card>

         {/* Recent Activity */}
         <Card className="bg-white overflow-hidden">
           <CardHeader className="border-b border-border pb-4">
              <CardTitle>Recent Orders</CardTitle>
           </CardHeader>
           <div className="divide-y divide-border">
              {recentOrders?.map((o) => (
                 <div key={o.id} className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
                    <div>
                       <p className="font-semibold text-sm">Order #{o.id.substring(0,8)}</p>
                       <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                       <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase ${o.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{o.status}</span>
                       <p className="text-xs text-muted-foreground mt-1">{o.price || 0} DZD</p>
                    </div>
                 </div>
              ))}
           </div>
         </Card>
      </div>
    </div>
  )
}
