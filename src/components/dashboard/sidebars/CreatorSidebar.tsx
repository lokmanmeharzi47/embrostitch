"use client"
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Paintbrush, ShoppingBag, MessageSquare, Settings, CircleUser, Star, BarChart3 } from "lucide-react"
import { LogoutButton } from "@/components/dashboard/LogoutButton"
import { cn } from "@/lib/utils"

export function CreatorSidebar() {
  const pathname = usePathname()

  const links = [
    { name: "Dashboard", href: "/creator", icon: <LayoutDashboard size={18} /> },
    { name: "My Designs", href: "/creator/portfolio", icon: <Paintbrush size={18} /> },
    { name: "Sales & Orders", href: "/creator/orders", icon: <ShoppingBag size={18} /> },
    { name: "Messages", href: "/creator/messages", icon: <MessageSquare size={18} /> },
    { name: "Earnings", href: "/creator/analytics", icon: <BarChart3 size={18} /> },
    { name: "Reviews", href: "/creator/reviews", icon: <Star size={18} /> },
  ]

  return (
    <aside className="w-72 border-r border-border bg-white flex flex-col h-screen sticky top-0 shrink-0">
      <div className="h-20 flex items-center px-8 border-b border-border">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-black tracking-tighter text-primary">
            EmbroCraft<span className="text-foreground">DZ</span>
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
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-secondary text-foreground" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <span className={cn(
                  "transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {link.icon}
                </span> 
                {link.name}
              </Link>
            )
          })}
        </nav>
        
        <div className="pt-4 border-t border-border mt-6">
          <p className="px-4 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-3">Designer Profile</p>
          <div className="space-y-1">
            <Link 
              href="/creator/profile" 
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group",
                pathname.startsWith("/creator/profile") 
                  ? "bg-secondary text-foreground" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <CircleUser size={18} /> Portfolio Bio
            </Link>
            <Link 
              href="/creator/settings" 
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group",
                pathname.startsWith("/creator/settings") 
                  ? "bg-secondary text-foreground" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Settings size={18} /> Shop Settings
            </Link>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-border mt-auto">
        <LogoutButton />
      </div>
    </aside>
  )
}
