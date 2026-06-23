import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import {
  Scissors, AlertCircle, TrendingUp, ArrowRight,
  User, Star, Calendar, Sparkles, Clock, CheckCircle,
  ArrowUpRight, Package
} from "lucide-react"
import Link from "next/link"

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending:     { label: "En attente", className: "bg-amber-50 text-amber-700 border-amber-100" },
    in_progress: { label: "En cours", className: "bg-blue-50 text-blue-700 border-blue-100" },
    completed:   { label: "Terminé", className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    rejected:    { label: "Refusé", className: "bg-red-50 text-red-700 border-red-100" },
  }
  const { label, className } = map[status] || { label: status, className: "bg-gray-50 text-gray-600" }
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${className}`}>
      {label}
    </span>
  )
}

export default async function CreatorDashboardPage() {
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
    { data: orders },
    { data: proStats }
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id, title, status, delivery_date, price, client:client_id (first_name, last_name)")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("creator_profiles")
      .select("*")
      .eq("id", user.id)
      .single()
  ])

  const allOrders = orders || []
  const pendingOrders = allOrders.filter((o) => o.status === "pending")
  const activeOrders = allOrders.filter((o) => o.status === "in_progress")
  const completedOrders = allOrders.filter((o) => o.status === "completed")
  const totalRevenue = completedOrders.reduce((acc, o) => acc + (Number(o.price) || 0), 0)

  const stats = [
    {
      label: "Nouvelles Demandes",
      value: pendingOrders.length,
      icon: AlertCircle,
      color: "from-amber-400 to-orange-500",
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
      sub: "En attente de réponse",
      href: "/creator/orders",
    },
    {
      label: "En Cours",
      value: activeOrders.length,
      icon: Scissors,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      sub: "Projets actifs",
      href: "/creator/orders",
    },
    {
      label: "Terminées",
      value: completedOrders.length,
      icon: CheckCircle,
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      sub: "Commandes livrées",
      href: "/creator/orders",
    },
    {
      label: "Revenus Totaux",
      value: `${totalRevenue.toLocaleString()}`,
      unit: "DA",
      icon: TrendingUp,
      color: "from-violet-500 to-purple-600",
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
      sub: "Chiffre d'affaires",
      href: "#",
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Bonjour, {profile.first_name} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Voici un aperçu de votre atelier aujourd&apos;hui.</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingOrders.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-bold text-amber-700">
                {pendingOrders.length} demande{pendingOrders.length > 1 ? "s" : ""} en attente
              </span>
            </div>
          )}
          <Button variant="luxury" size="sm" className="rounded-xl gap-2 shadow-md shadow-primary/20" asChild>
            <Link href="/creator/portfolio">
              <Sparkles className="w-4 h-4" />
              Mon Portfolio
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.label} href={s.href}>
              <div className="stat-card group hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">{s.label}</p>
                    <p className="text-2xl font-black text-foreground">
                      {s.value}
                      {s.unit && <span className="text-sm font-normal text-muted-foreground ml-1">{s.unit}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-success" />
                      {s.sub}
                    </p>
                  </div>
                  <div className={`w-11 h-11 rounded-2xl ${s.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${s.iconColor}`} />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Rating & portfolio snapshot + Orders feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders feed */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <div>
              <h2 className="font-black text-foreground">Commandes Récentes</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{allOrders.length} commandes au total</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs font-bold rounded-xl gap-1" asChild>
              <Link href="/creator/orders">
                Voir tout <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-border/50">
            {allOrders.length === 0 ? (
              <div className="p-10 text-center">
                <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-bold text-foreground">Aucune commande pour le moment</p>
                <p className="text-sm text-muted-foreground mt-1">Les demandes clients apparaîtront ici.</p>
              </div>
            ) : (
              allOrders.slice(0, 6).map((order) => {
                const client = Array.isArray(order.client) ? order.client[0] : order.client
                return (
                  <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground line-clamp-1">{order.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {(client as any)?.first_name} {(client as any)?.last_name}
                          {order.price ? ` · ${Number(order.price).toLocaleString()} DA` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusBadge status={order.status} />
                      {order.delivery_date && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(order.delivery_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Profile snapshot */}
        <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <h2 className="font-black text-foreground">Mon Profil Pro</h2>
          </div>
          <div className="p-6 space-y-5">
            {/* Rating */}
            <div className="text-center py-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
              <div className="flex items-center justify-center gap-0.5 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.round(proStats?.avg_rating || 0) ? "fill-accent text-accent" : "fill-muted text-muted"}`}
                  />
                ))}
              </div>
              <p className="text-2xl font-black text-foreground">
                {proStats?.avg_rating ? Number(proStats.avg_rating).toFixed(1) : "Nouveau"}
                {proStats?.avg_rating ? " / 5" : ""}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {proStats?.total_reviews || 0} avis
              </p>
            </div>

            {/* Specialty */}
            {proStats?.specialty && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Spécialité</p>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(proStats.specialty) ? proStats.specialty : [proStats.specialty]).map((s: string) => (
                    <span key={s} className="px-2.5 py-1 bg-primary/8 text-primary rounded-full text-xs font-bold">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio images count */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Portfolio</p>
              <p className="text-sm font-bold text-foreground">
                {proStats?.portfolio_images?.length || 0} création{(proStats?.portfolio_images?.length || 0) !== 1 ? "s" : ""}
              </p>
            </div>

            <Button className="w-full rounded-xl font-bold" variant="outline" asChild>
              <Link href="/creator/portfolio">
                <Sparkles className="w-4 h-4 mr-2" />
                Gérer le portfolio
              </Link>
            </Button>
            <Button className="w-full rounded-xl font-bold" variant="luxury" asChild>
              <Link href="/creator/profile">
                <User className="w-4 h-4 mr-2" />
                Modifier le profil
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
