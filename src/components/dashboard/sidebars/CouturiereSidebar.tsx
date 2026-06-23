"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Scissors, MessageSquare, Briefcase, Settings, CircleUser, Star } from "lucide-react"
import { LogoutButton } from "@/components/dashboard/LogoutButton"
import { cn } from "@/lib/utils"

export function CreatorSidebar() {
  const pathname = usePathname()

  const links = [
    { name: "Atelier", href: "/creator", icon: <LayoutDashboard size={20} /> },
    { name: "My Portfolio", href: "/creator/portfolio", icon: <Briefcase size={20} /> },
    { name: "Client Orders", href: "/creator/orders", icon: <Scissors size={20} /> },
    { name: "Messages", href: "/creator/messages", icon: <MessageSquare size={20} /> },
    { name: "My Reviews", href: "/creator/reviews", icon: <Star size={20} /> },
  ]

  return (
    <aside className="hidden md:flex w-72 border-r border-border bg-white flex-col h-screen sticky top-0 shrink-0">
      <div className="h-20 flex items-center px-8 border-b border-border">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-black tracking-tighter text-primary">
            MALIXA<span className="text-foreground">DZ</span>
          </span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-8 px-4 space-y-6">
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className={cn(
                  "transition-colors",
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {link.icon}
                </span> 
                {link.name}
              </Link>
            )
          })}
        </nav>
        
        <div className="pt-2 border-t border-border mt-6">
          <p className="px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-4">Professional</p>
          <div className="space-y-1">
            <Link 
              href="/creator/profile" 
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all group",
                pathname.startsWith("/creator/profile") 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <CircleUser size={20} /> Public Profile
            </Link>
            <Link 
              href="/creator/settings" 
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all group",
                pathname.startsWith("/creator/settings") 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Settings size={20} /> Preferences
            </Link>
          </div>
        </div>
      </div>
      
      <div className="p-6 border-t border-border mt-auto bg-muted/30">
        <LogoutButton />
      </div>
    </aside>
  )
}
