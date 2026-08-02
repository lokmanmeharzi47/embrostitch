import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminDashboardClient from "@/components/dashboard/AdminDashboardClient"

interface WeeklyOrder {
  created_at: string
  status: string
  price: number | string
}

interface AdminDashboardStats {
  userCount: number
  orderCount: number
  creatorCount: number
  recentActivityCount: number
  usersThisMonth: number
  usersLastMonth: number
  ordersThisMonth: number
  ordersLastMonth: number
  recentUsers: { id: string; first_name: string; last_name: string; role: string; created_at: string }[]
  recentOrders: { id: string; status: string; price: number; created_at: string }[]
  weeklyOrders: WeeklyOrder[]
  completedOrders: { price: number | string; created_at: string }[]
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data, error } = await supabase.rpc("get_admin_dashboard_stats")

  if (error) {
    console.error("Error fetching dashboard stats:", JSON.stringify(error, null, 2))
  }

  const {
    userCount = 0,
    orderCount = 0,
    creatorCount = 0,
    recentActivityCount = 0,
    usersThisMonth = 0,
    usersLastMonth = 0,
    ordersThisMonth = 0,
    ordersLastMonth = 0,
    recentUsers = [],
    recentOrders = [],
    weeklyOrders = [],
    completedOrders = []
  } = (data as Partial<AdminDashboardStats> | null) || {}

  const totalRevenue = completedOrders?.reduce((acc: number, curr: { price: string | number }) => acc + (Number(curr.price) || 0), 0) || 0

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
    
    const dayOrders = (weeklyOrders || []).filter((o: WeeklyOrder) => {
      const oDate = new Date(o.created_at)
      return oDate.toDateString() === date.toDateString()
    })
    return {
      day,
      commandes: dayOrders.length,
      revenus: dayOrders.filter((o) => o.status === "completed").reduce((acc: number, o) => acc + (Number(o.price) || 0), 0),
    }
  })

  return (
    <AdminDashboardClient
      stats={{
        userCount: userCount || 0,
        orderCount: orderCount || 0,
        creatorCount: creatorCount || 0,
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
