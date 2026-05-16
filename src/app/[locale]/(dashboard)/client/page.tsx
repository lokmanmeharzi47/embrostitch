import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/Button"
import {
  Clock, CheckCircle, PlusCircle, ArrowRight,
  Star, Package, MessageSquare, Heart,
  ArrowUpRight, Sparkles, Search
} from "lucide-react"
import Link from "next/link"

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending:     { label: "En attente", className: "bg-amber-50 text-amber-700 border-amber-100" },
    in_progress: { label: "En cours",   className: "bg-blue-50 text-blue-700 border-blue-100" },
    completed:   { label: "Terminé",    className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    rejected:    { label: "Refusé",     className: "bg-red-50 text-red-700 border-red-100" },
  }
  const { label, className } = map[status] || { label: status, className: "bg-gray-50 text-gray-600" }
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${className}`}>
      {label}
    </span>
  )
}

export default async function ClientDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single()

  if (!profile) redirect("/login")

  const { data: orders } = await supabase
    .from("orders")
    .select("id, title, status, delivery_date, price, images, couturiere:couturiere_id (first_name, last_name)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  const allOrders = orders || []
  const activeOrders = allOrders.filter((o) => o.status !== "completed" && o.status !== "rejected")
  const completedOrders = allOrders.filter((o) => o.status === "completed")
  const totalSpent = completedOrders.reduce((acc, o) => acc + (Number(o.price) || 0), 0)

  const quickStats = [
    {
      label: "Commandes Actives",
      value: activeOrders.length,
      icon: Clock,
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      sub: "En cours de réalisation",
      href: "/client/orders",
    },
    {
      label: "Terminées",
      value: completedOrders.length,
      icon: CheckCircle,
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      sub: "Créations reçues",
      href: "/client/orders",
    },
    {
      label: "Total Dépensé",
      value: totalSpent.toLocaleString(),
      unit: "DA",
      icon: Star,
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
      sub: "Toutes commandes",
      href: "#",
    },
    {
      label: "Messages",
      value: 0,
      icon: MessageSquare,
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
      sub: "Non lus",
      href: "/client/messages",
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Bonjour, {profile.first_name} ✨
          </h1>
          <p className="text-muted-foreground mt-1">Prête pour votre prochaine création sur mesure ?</p>
        </div>
        <Button variant="luxury" size="lg" className="gap-2 rounded-2xl shadow-lg shadow-primary/20" asChild>
          <Link href="/marketplace">
            <Search className="w-4 h-4" />
            Trouver une Couturière
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.label} href={s.href}>
              <div className="stat-card group hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-2xl ${s.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" style={{ color: s.iconColor.replace("text-", "").split("-").join("") }} />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-2xl font-black text-foreground">
                  {s.value}
                  {(s as any).unit && <span className="text-sm font-normal text-muted-foreground ml-1">{(s as any).unit}</span>}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Orders + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <div>
              <h2 className="font-black text-foreground">Mes Commandes</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{allOrders.length} commande{allOrders.length !== 1 ? "s" : ""}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs font-bold gap-1 rounded-xl" asChild>
              <Link href="/client/orders">Tout voir <ArrowRight className="w-3.5 h-3.5" /></Link>
            </Button>
          </div>

          {allOrders.length === 0 ? (
            <div className="p-10 text-center">
              <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-bold text-foreground">Aucune commande pour l&apos;instant</p>
              <p className="text-sm text-muted-foreground mt-1 mb-5">Commencez par trouver votre couturière idéale.</p>
              <Button variant="luxury" className="rounded-xl gap-2" asChild>
                <Link href="/marketplace"><Search className="w-4 h-4" /> Explorer le Marketplace</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {allOrders.slice(0, 6).map((order) => {
                const couturiere = Array.isArray(order.couturiere) ? order.couturiere[0] : order.couturiere
                const progress = order.status === "completed" ? 100 : order.status === "in_progress" ? 60 : order.status === "pending" ? 20 : 0
                return (
                  <div key={order.id} className="px-6 py-4 hover:bg-muted/30 transition-colors flex items-center gap-4">
                    {/* Thumbnail */}
                    {order.images?.[0] ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border/50">
                        <img src={order.images[0]} alt={order.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-primary/30" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="text-sm font-bold text-foreground line-clamp-1">{order.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Avec {(couturiere as any)?.first_name} {(couturiere as any)?.last_name}
                            {order.price ? ` · ${Number(order.price).toLocaleString()} DA` : ""}
                          </p>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                    {progress > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${progress}%`,
                              background: "linear-gradient(90deg, #4F46E5, #6366f1)"
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold">{progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="rounded-3xl p-6 border border-primary/15" style={{ background: "linear-gradient(135deg, rgba(79,70,229,0.06), rgba(79,70,229,0.12))" }}>
            <Sparkles className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-black text-foreground mb-2">Nouvelle Création</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Trouvez la couturière parfaite pour votre prochaine tenue sur mesure.
            </p>
            <Button variant="luxury" className="w-full rounded-xl gap-2 shadow-md" asChild>
              <Link href="/marketplace"><PlusCircle className="w-4 h-4" /> Commencer un projet</Link>
            </Button>
          </div>

          {[
            { icon: Heart, label: "Favoris", sub: "Couturières sauvegardées", href: "/client/wardrobe", bg: "bg-rose-50", iconClass: "text-rose-500" },
            { icon: MessageSquare, label: "Messages", sub: "Vos conversations", href: "/client/messages", bg: "bg-violet-50", iconClass: "text-violet-500" },
            { icon: Star, label: "Mes Avis", sub: "Notes et retours", href: "/client/reviews", bg: "bg-amber-50", iconClass: "text-amber-500" },
          ].map(({ icon: Icon, label, sub, href, bg, iconClass }) => (
            <Link key={label} href={href}>
              <div className="bg-white border border-border/50 rounded-2xl p-4 flex items-center gap-3 hover:border-primary/30 hover:shadow-sm transition-all group shadow-sm">
                <div className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${iconClass}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
