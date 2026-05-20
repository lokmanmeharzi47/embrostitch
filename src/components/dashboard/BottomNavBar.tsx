"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, MessageSquare, User,
  Briefcase, BarChart3, Users, Star, Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "client" | "couturiere" | "creator" | "admin";

interface NavTab {
  name: string;
  href: string;
  icon: React.ReactNode;
  exactMatch?: boolean;
}

const NAV_TABS: Record<Role, NavTab[]> = {
  client: [
    { name: "Accueil", href: "/client", icon: <LayoutDashboard size={22} />, exactMatch: true },
    { name: "Commandes", href: "/client/orders", icon: <ShoppingBag size={22} /> },
    { name: "Explorer", href: "/marketplace", icon: <Compass size={22} /> },
    { name: "Messages", href: "/client/messages", icon: <MessageSquare size={22} /> },
    { name: "Profil", href: "/client/profile", icon: <User size={22} /> },
  ],
  couturiere: [
    { name: "Atelier", href: "/couturiere", icon: <LayoutDashboard size={22} />, exactMatch: true },
    { name: "Commandes", href: "/couturiere/orders", icon: <ShoppingBag size={22} /> },
    { name: "Portfolio", href: "/couturiere/portfolio", icon: <Briefcase size={22} /> },
    { name: "Messages", href: "/couturiere/messages", icon: <MessageSquare size={22} /> },
    { name: "Profil", href: "/couturiere/profile", icon: <User size={22} /> },
  ],
  creator: [
    { name: "Studio", href: "/creator", icon: <LayoutDashboard size={22} />, exactMatch: true },
    { name: "Commandes", href: "/creator/orders", icon: <ShoppingBag size={22} /> },
    { name: "Portfolio", href: "/creator/portfolio", icon: <Briefcase size={22} /> },
    { name: "Messages", href: "/creator/messages", icon: <MessageSquare size={22} /> },
    { name: "Profil", href: "/creator/profile", icon: <User size={22} /> },
  ],
  admin: [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard size={22} />, exactMatch: true },
    { name: "Stats", href: "/admin/stats", icon: <BarChart3 size={22} /> },
    { name: "Utilisateurs", href: "/admin/users", icon: <Users size={22} /> },
    { name: "Commandes", href: "/admin/orders", icon: <ShoppingBag size={22} /> },
    { name: "Avis", href: "/admin/reviews", icon: <Star size={22} /> },
  ],
};

export function BottomNavBar({ role }: { role: Role }) {
  const pathname = usePathname();
  const tabs = NAV_TABS[role] ?? [];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border"
      style={{
        boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-stretch h-16">
        {tabs.map((tab) => {
          const isActive = tab.exactMatch
            ? pathname === tab.href || pathname.endsWith(tab.href)
            : pathname.includes(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors touch-manipulation",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
              <span className={cn("transition-transform duration-150", isActive && "scale-110")}>
                {tab.icon}
              </span>
              <span className="text-[10px] font-semibold leading-tight">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
