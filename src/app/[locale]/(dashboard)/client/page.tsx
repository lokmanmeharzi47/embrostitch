import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/Button"
import {
  Clock, CheckCircle, PlusCircle, ArrowRight,
  Star, Package, MessageSquare, Heart,
  ArrowUpRight, Search, Sparkles
} from "lucide-react"
import Link from "next/link"

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending:     { label: "Pending", className: "bg-secondary text-secondary-foreground border-border" },
    in_progress: { label: "In Progress",   className: "bg-primary/5 text-primary border-primary/20" },
    completed:   { label: "Completed",    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    rejected:    { label: "Rejected",     className: "bg-destructive/10 text-destructive border-destructive/20" },
  }
  const { label, className } = map[status] || { label: status, className: "bg-secondary text-secondary-foreground border-border" }
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${className}`}>
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
    .select("id, title, status, delivery_date, price, images, creator:creator_id (first_name, last_name)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  const allOrders = orders || []
  const activeOrders = allOrders.filter((o) => o.status !== "completed" && o.status !== "rejected")
  const completedOrders = allOrders.filter((o) => o.status === "completed")
  const totalSpent = completedOrders.reduce((acc, o) => acc + (Number(o.price) || 0), 0)

  const quickStats = [
    {
      label: "Active Orders",
      value: activeOrders.length,
      icon: Clock,
      sub: "In progress",
      href: "/client/orders",
    },
    {
      label: "Completed",
      value: completedOrders.length,
      icon: CheckCircle,
      sub: "Received creations",
      href: "/client/orders",
    },
    {
      label: "Total Spent",
      value: totalSpent.toLocaleString(),
      unit: "DA",
      icon: Star,
      sub: "All time",
      href: "#",
    },
    {
      label: "Messages",
      value: 0,
      icon: MessageSquare,
      sub: "Unread",
      href: "/client/messages",
    },
  ]

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <h1 className="text-4xl font-serif text-foreground tracking-tight mb-2">
            Welcome back, {profile.first_name}
          </h1>
          <p className="text-secondary-foreground font-light text-lg">Ready to start your next bespoke creation?</p>
        </div>
        <Button variant="luxury" size="lg" className="gap-2 rounded-full px-8 shadow-sm" asChild>
          <Link href="/marketplace">
            <Search className="w-4 h-4" />
            Find a Designer
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {quickStats.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.label} href={s.href} className="group">
              <div className="bg-surface border border-border rounded-[20px] p-6 h-full transition-all duration-400 group-hover:border-primary/40 group-hover:shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                    <Icon className="w-4 h-4 text-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />
                </div>
                <p className="text-3xl font-serif text-foreground mb-1">
                  {s.value}
                  {(s as any).unit && <span className="text-base font-sans font-light text-secondary-foreground ml-1.5">{(s as any).unit}</span>}
                </p>
                <p className="text-xs font-medium text-primary uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-xs text-secondary-foreground font-light">{s.sub}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Orders + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders */}
        <div className="lg:col-span-2 bg-surface rounded-[24px] border border-border overflow-hidden">
          <div className="p-8 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif text-foreground">My Orders</h2>
              <p className="text-sm text-secondary-foreground font-light mt-1">{allOrders.length} order{allOrders.length !== 1 ? "s" : ""}</p>
            </div>
            <Link href="/client/orders" className="text-xs font-medium text-primary uppercase tracking-widest hover:text-primary-light transition-colors flex items-center gap-1 group">
              View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {allOrders.length === 0 ? (
            <div className="p-16 text-center">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-serif text-foreground mb-2">No orders yet</p>
              <p className="text-sm text-secondary-foreground font-light mb-8 max-w-sm mx-auto">Discover our talented artisans and start your first custom project.</p>
              <Button variant="outline" className="rounded-full px-8 gap-2 border-border text-foreground hover:border-primary/40" asChild>
                <Link href="/marketplace"><Search className="w-4 h-4" /> Explore Marketplace</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {allOrders.slice(0, 6).map((order) => {
                const creator = Array.isArray(order.creator) ? order.creator[0] : order.creator
                const progress = order.status === "completed" ? 100 : order.status === "in_progress" ? 60 : order.status === "pending" ? 20 : 0
                return (
                  <div key={order.id} className="px-8 py-6 hover:bg-secondary/30 transition-colors flex items-center gap-5">
                    {/* Thumbnail */}
                    {order.images?.[0] ? (
                      <div className="w-14 h-14 rounded-[10px] overflow-hidden shrink-0 border border-border">
                        <img src={order.images[0]} alt={order.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-[10px] bg-secondary flex items-center justify-center shrink-0 border border-border">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="text-base font-serif text-foreground truncate">{order.title}</p>
                          <p className="text-xs text-secondary-foreground font-light mt-0.5">
                            With {(creator as any)?.first_name} {(creator as any)?.last_name}
                            {order.price ? ` · ${Number(order.price).toLocaleString()} DA` : ""}
                          </p>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                      {progress > 0 && (
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium w-6 text-right">{progress}%</span>
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
          <div className="rounded-[24px] p-8 border border-border bg-secondary/50">
            <Sparkles className="w-6 h-6 text-primary mb-4" />
            <h3 className="text-xl font-serif text-foreground mb-2">New Creation</h3>
            <p className="text-sm text-secondary-foreground font-light mb-8 leading-relaxed">
              Find the perfect artisan to bring your custom design vision to life.
            </p>
            <Button variant="luxury" className="w-full rounded-full gap-2 shadow-sm" asChild>
              <Link href="/marketplace"><PlusCircle className="w-4 h-4" /> Start a Project</Link>
            </Button>
          </div>

          {[
            { icon: Heart, label: "Favorites", sub: "Saved designers", href: "/client/wardrobe" },
            { icon: MessageSquare, label: "Messages", sub: "Your conversations", href: "/client/messages" },
            { icon: Star, label: "My Reviews", sub: "Feedback & ratings", href: "/client/reviews" },
          ].map(({ icon: Icon, label, sub, href }) => (
            <Link key={label} href={href}>
              <div className="bg-surface border border-border rounded-[20px] p-5 flex items-center gap-4 hover:border-primary/40 transition-all group">
                <div className={`w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors`}>
                  <Icon className="w-4 h-4 text-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-secondary-foreground font-light mt-0.5">{sub}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
