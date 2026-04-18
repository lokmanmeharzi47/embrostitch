"use client"

import { motion } from "framer-motion"
import { Users, Receipt, Activity, TrendingUp, Sparkles, ArrowUpRight, Shield, BarChart3 } from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"

interface Props {
  stats: {
    userCount: number
    orderCount: number
    couturiereCount: number
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
    label: "Utilisateurs Totaux",
    value: stats.userCount.toLocaleString(),
    sub: `${stats.userTrend > 0 ? '+' : ''}${stats.userTrend}% ce mois`,
    icon: Users,
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    trend: stats.userTrend >= 0 ? "up" : "down",
  },
  {
    label: "Couturières",
    value: stats.couturiereCount.toLocaleString(),
    sub: "Artisans actifs",
    icon: Sparkles,
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
    trend: "up",
  },
  {
    label: "Commandes Totales",
    value: stats.orderCount.toLocaleString(),
    sub: `${stats.orderTrend > 0 ? '+' : ''}${stats.orderTrend}% ce mois`,
    icon: Receipt,
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    trend: stats.orderTrend >= 0 ? "up" : "down",
  },
  {
    label: "Revenus Générés",
    value: `${stats.totalRevenue.toLocaleString()} DA`,
    sub: "Commandes complétées",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    trend: "up",
  },
]

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    in_progress: "bg-blue-50 text-blue-700 border-blue-100",
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    rejected: "bg-red-50 text-red-700 border-red-100",
  }
  const labels: Record<string, string> = {
    completed: "Terminé",
    in_progress: "En cours",
    pending: "En attente",
    rejected: "Rejeté",
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${styles[status] || "bg-gray-50 text-gray-600 border-gray-100"}`}>
      {labels[status] || status}
    </span>
  )
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: "bg-violet-50 text-violet-700",
    couturiere: "bg-primary/8 text-primary",
    client: "bg-gray-50 text-gray-600",
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${styles[role] || "bg-gray-50 text-gray-600"}`}>
      {role}
    </span>
  )
}

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function AdminDashboardClient({ stats, chartData, recentUsers, recentOrders }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Tableau de Bord Admin</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${stats.isHealthy ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stats.isHealthy ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              {stats.isHealthy ? "Système Actif" : "Faible Activité"}
            </span>
            Aperçu général de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-4 h-4 text-primary" />
          <span className="font-semibold">Mode Administrateur</span>
        </div>
      </div>

      {/* Stats cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
      >
        {STAT_CARDS(stats).map((card) => {
          const Icon = card.icon
          return (
            <motion.div key={card.label} variants={itemVariants}>
              <div className="stat-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">{card.label}</p>
                    <p className="text-2xl font-black text-foreground">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-success" />
                      {card.sub}
                    </p>
                  </div>
                  <div className={`w-11 h-11 rounded-2xl ${card.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders area chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl border border-border/50 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-black text-foreground">Commandes (7 jours)</h3>
              <p className="text-xs text-muted-foreground">Évolution des nouvelles commandes</p>
            </div>
            <div className="p-2 bg-primary/8 rounded-xl">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", fontSize: "12px" }}
                cursor={{ stroke: "#4F46E5", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area type="monotone" dataKey="commandes" stroke="#4F46E5" strokeWidth={2.5} fill="url(#colorOrders)" dot={{ fill: "#4F46E5", r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl border border-border/50 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-black text-foreground">Revenus (7 jours)</h3>
              <p className="text-xs text-muted-foreground">Revenus des commandes complétées (DA)</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", fontSize: "12px" }}
                cursor={{ fill: "rgba(16,185,129,0.05)" }}
              />
              <Bar dataKey="revenus" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-border/50">
            <h3 className="font-black text-foreground">Inscriptions Récentes</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Derniers utilisateurs inscrits</p>
          </div>
          <div className="divide-y divide-border/50">
            {recentUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Aucun utilisateur récent.</div>
            ) : (
              recentUsers.map((u) => (
                <div key={u.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full primary-gradient flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-black">
                        {u.first_name.charAt(0)}{u.last_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{u.first_name} {u.last_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
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
          className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-border/50">
            <h3 className="font-black text-foreground">Commandes Récentes</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Dernières demandes sur la plateforme</p>
          </div>
          <div className="divide-y divide-border/50">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Aucune commande récente.</div>
            ) : (
              recentOrders.map((o) => (
                <div key={o.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
                      <Receipt className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">#{o.id.substring(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
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
