import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminDashboardClient from "@/components/dashboard/AdminDashboardClient"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  // Start of current month and last month
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  const [
    { count: userCount },
    { count: orderCount },
    { count: couturiereCount },
    { data: completedOrders },
    { count: recentActivityCount },
    { data: recentUsers },
    { data: recentOrders },
    { data: weeklyOrders },
    { count: usersThisMonth },
    { count: usersLastMonth },
    { count: ordersThisMonth },
    { count: ordersLastMonth }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("couturiere_profiles").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("price, created_at").eq("status", "completed"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gt("created_at", oneDayAgo),
    supabase.from("profiles").select("id, first_name, last_name, role, created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("orders").select("id, status, price, created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("orders").select("created_at, status, price").gte("created_at", sevenDaysAgo),
    
    // Trends queries
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", startOfCurrentMonth),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", startOfLastMonth).lte("created_at", endOfLastMonth),
    supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", startOfCurrentMonth),
    supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", startOfLastMonth).lte("created_at", endOfLastMonth),
  ])

  const totalRevenue = completedOrders?.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0) || 0

  // Calculate trends properly using Math.round
  const calculateTrend = (current: number | null, previous: number | null) => {
    const c = current || 0;
    const p = previous || 0;
    if (p === 0) return c > 0 ? 100 : 0;
    return Math.round(((c - p) / p) * 100);
  }

  const userTrend = calculateTrend(usersThisMonth, usersLastMonth);
  const orderTrend = calculateTrend(ordersThisMonth, ordersLastMonth);

  // Build chart data from weeklyOrders
  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
  // Align correctly to past 7 days up to today
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const day = days[date.getDay()];
    
    const dayOrders = (weeklyOrders || []).filter((o) => {
      const oDate = new Date(o.created_at)
      return oDate.toDateString() === date.toDateString()
    })
    return {
      day,
      commandes: dayOrders.length,
      revenus: dayOrders.filter((o) => o.status === "completed").reduce((acc, o) => acc + (Number(o.price) || 0), 0),
    }
  })

  return (
    <AdminDashboardClient
      stats={{
        userCount: userCount || 0,
        orderCount: orderCount || 0,
        couturiereCount: couturiereCount || 0,
        totalRevenue,
        isHealthy: (recentActivityCount ?? 0) > 0,
        userTrend,
        orderTrend
      }}
      chartData={chartData}
      recentUsers={recentUsers || []}
      recentOrders={recentOrders || []}
    />
  )
}
