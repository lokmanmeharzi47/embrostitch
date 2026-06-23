"use client"

import { motion } from "framer-motion"
import { Users, Receipt, TrendingUp, Sparkles, ArrowUpRight, Shield, BarChart3 } from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"

interface Props {
  stats: {
    userCount: number
    orderCount: number
    creatorCount: number
    totalRevenue: number
    isHealthy: boolean
    userTrend: number
    orderTrend: number
  }
  chartData: { day: string; commandes: number; revenus: number }[]
  recentUsers: { id: string; first_name: string; last_name: string; role: string; created_at: string }[]
  recentOrders: { id: string; status: string; price: number; created_at: string }[]
}

const STAT_CARDS = (stats: Props["stats"]) => [
  {
    label: "Total Users",
    value: stats.userCount.toLocaleString(),
    sub: `${stats.userTrend > 0 ? '+' : ''}${stats.userTrend}% this month`,
    icon: Users,
  },
  {
    label: "Artisans",
    value: stats.creatorCount.toLocaleString(),
    sub: "Active creators",
    icon: Sparkles,
  },
  {
    label: "Total Orders",
    value: stats.orderCount.toLocaleString(),
    sub: `${stats.orderTrend > 0 ? '+' : ''}${stats.orderTrend}% this month`,
    icon: Receipt,
  },
  {
    label: "Revenue Generated",
    value: `${stats.totalRevenue.toLocaleString()} DA`,
    sub: "Completed orders",
    icon: TrendingUp,
  },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    COMPLETED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    IN_PRODUCTION: "bg-primary/5 text-primary border-primary/20",
    READY: "bg-primary/5 text-primary border-primary/20",
    SHIPPED: "bg-primary/5 text-primary border-primary/20",
    DELIVERED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    PENDING: "bg-secondary text-secondary-foreground border-border",
    ACCEPTED: "bg-primary/5 text-primary border-primary/20",
    CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
  }
  const labels: Record<string, string> = {
    COMPLETED: "Completed",
    IN_PRODUCTION: "In Prod.",
    READY: "Ready",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    CANCELLED: "Cancelled",
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${styles[status] || "bg-secondary text-secondary-foreground border-border"}`}>
      {labels[status] || status}
    </span>
  )
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: "bg-primary/10 text-primary border-primary/20",
    creator: "bg-secondary text-foreground border-border",
    client: "bg-background text-secondary-foreground border-border",
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${styles[role] || "bg-background text-secondary-foreground border-border"}`}>
      {role}
    </span>
  )
}

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function AdminDashboardClient({ stats, chartData, recentUsers, recentOrders }: Props) {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <h1 className="text-4xl font-serif tracking-tight text-foreground mb-2">Admin Overview</h1>
          <p className="text-secondary-foreground font-light text-lg flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${stats.isHealthy ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stats.isHealthy ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              {stats.isHealthy ? "System Active" : "Low Activity"}
            </span>
            Platform status and metrics
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-widest">
          <Shield className="w-4 h-4" />
          <span>Admin Access</span>
        </div>
      </div>

      {/* Stats cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {STAT_CARDS(stats).map((card) => {
          const Icon = card.icon
          return (
            <motion.div key={card.label} variants={itemVariants}>
              <div className="bg-surface border border-border rounded-[20px] p-6 transition-all duration-400 hover:border-primary/40 hover:shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <Icon className="w-4 h-4 text-foreground" />
                  </div>
                </div>
                <p className="text-3xl font-serif text-foreground mb-1">{card.value}</p>
                <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">{card.label}</p>
                <p className="text-xs text-secondary-foreground font-light flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                  {card.sub}
                </p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orders area chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface rounded-[24px] border border-border p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-serif text-xl text-foreground">Orders (7 Days)</h3>
              <p className="text-sm text-secondary-foreground font-light mt-1">New request volume</p>
            </div>
            <div className="p-3 bg-secondary rounded-full border border-border">
              <BarChart3 className="w-4 h-4 text-foreground" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", boxShadow: "0 8px 24px rgba(0,0,0,0.05)", fontSize: "12px" }}
                cursor={{ stroke: "var(--color-primary)", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area type="monotone" dataKey="commandes" stroke="var(--color-primary)" strokeWidth={2} fill="url(#colorOrders)" dot={{ fill: "var(--color-primary)", r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface rounded-[24px] border border-border p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-serif text-xl text-foreground">Revenue (7 Days)</h3>
              <p className="text-sm text-secondary-foreground font-light mt-1">Completed order revenue</p>
            </div>
            <div className="p-3 bg-secondary rounded-full border border-border">
              <TrendingUp className="w-4 h-4 text-foreground" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)", boxShadow: "0 8px 24px rgba(0,0,0,0.05)", fontSize: "12px" }}
                cursor={{ fill: "var(--color-secondary)" }}
              />
              <Bar dataKey="revenus" fill="var(--color-foreground)" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-surface rounded-[24px] border border-border overflow-hidden"
        >
          <div className="p-8 border-b border-border">
            <h3 className="font-serif text-xl text-foreground">Recent Registrations</h3>
            <p className="text-sm text-secondary-foreground font-light mt-1">Latest users joined</p>
          </div>
          <div className="divide-y divide-border">
            {recentUsers.length === 0 ? (
              <div className="p-12 text-center text-secondary-foreground font-light text-sm">No recent users.</div>
            ) : (
              recentUsers.map((u) => (
                <div key={u.id} className="px-8 py-5 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                      <span className="text-primary text-sm font-serif">
                        {u.first_name.charAt(0)}{u.last_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-base font-medium text-foreground">{u.first_name} {u.last_name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                        {new Date(u.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <RoleBadge role={u.role} />
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-surface rounded-[24px] border border-border overflow-hidden"
        >
          <div className="p-8 border-b border-border">
            <h3 className="font-serif text-xl text-foreground">Recent Orders</h3>
            <p className="text-sm text-secondary-foreground font-light mt-1">Latest platform requests</p>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.length === 0 ? (
              <div className="p-12 text-center text-secondary-foreground font-light text-sm">No recent orders.</div>
            ) : (
              recentOrders.map((o) => (
                <div key={o.id} className="px-8 py-5 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center">
                      <Receipt className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-foreground">#{o.id.substring(0, 8)}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                        {new Date(o.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                        {o.price ? ` · ${Number(o.price).toLocaleString()} DA` : ""}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
