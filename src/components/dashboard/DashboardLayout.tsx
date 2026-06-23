"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, PlusCircle, MessageSquare, Star,
  ClipboardList, Image as ImageIcon, BarChart3, Users,
  Settings, LogOut, Sparkles, Home, Menu, X, Bell, ArrowLeft
} from "lucide-react";
import Image from "next/image";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: "client" | "creator" | "admin" | "atelier" | "creator";
}

const ICON_MAP: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  shopping_bag: ShoppingBag,
  add_circle: PlusCircle,
  chat_bubble: MessageSquare,
  star_rate: Star,
  receipt_long: ClipboardList,
  photo_library: ImageIcon,
  bar_chart: BarChart3,
  people: Users,
  rate_review: Star,
  settings: Settings,
};

const getNavigationLinks = (role: string) => {
  switch (role) {
    case "client":
      return [
        { name: "Dashboard", href: "/client", icon: "dashboard" },
        { name: "My Orders", href: "/client/orders", icon: "shopping_bag" },
        { name: "New Custom Order", href: "/marketplace", icon: "add_circle" },
        { name: "Messages", href: "/client/messages", icon: "chat_bubble" },
        { name: "My Reviews", href: "/client/reviews", icon: "star_rate" },
      ];
    case "creator":
      return [
        { name: "Dashboard", href: "/creator", icon: "dashboard" },
        { name: "Orders", href: "/creator/orders", icon: "receipt_long" },
        { name: "Products", href: "/creator/products", icon: "shopping_bag" },
        { name: "Collections", href: "/creator/collections", icon: "photo_library" },
        { name: "Reviews", href: "/creator/reviews", icon: "star_rate" },
        { name: "Messages", href: "/creator/messages", icon: "chat_bubble" },
      ];
    case "admin":
      return [
        { name: "Dashboard", href: "/admin", icon: "dashboard" },
        { name: "Statistics", href: "/admin/stats", icon: "bar_chart" },
        { name: "Users", href: "/admin/users", icon: "people" },
        { name: "Orders", href: "/admin/orders", icon: "receipt_long" },
        { name: "Reviews", href: "/admin/reviews", icon: "rate_review" },
      ];
    default:
      return [];
  }
};

const ROLE_LABEL: Record<string, string> = {
  client: "Client Space",
  creator: "Artisan Space",
  admin: "Administration",
  atelier: "Atelier Space",
};

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const links = getNavigationLinks(userRole);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = profile
    ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`
    : "U";

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">

      {/* ── Mobile Header ── */}
      <div className="md:hidden bg-surface border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-xl font-serif text-foreground tracking-tight">
            MALIXA
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-foreground"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Sidebar ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-surface z-50 flex flex-col border-r border-border md:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent
                profile={profile}
                initials={initials}
                links={links}
                pathname={pathname}
                userRole={userRole}
                onClose={() => setMobileOpen(false)}
                onSignOut={signOut}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-72 bg-surface border-r border-border flex-col h-screen sticky top-0 shrink-0">
        <SidebarContent
          profile={profile}
          initials={initials}
          links={links}
          pathname={pathname}
          userRole={userRole}
          onSignOut={signOut}
        />
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="hidden md:flex h-20 bg-background border-b border-border items-center justify-between px-10 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">{ROLE_LABEL[userRole] || "Dashboard"}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-sm text-secondary-foreground font-light hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Return to Website
            </Link>
            <div className="h-4 w-px bg-border" />
            <button className="text-secondary-foreground hover:text-foreground transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary border-2 border-background" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-10 overflow-x-hidden">{children}</div>
      </main>
    </div>
  );
}

function SidebarContent({
  profile,
  initials,
  links,
  pathname,
  userRole,
  onClose,
  onSignOut,
}: {
  profile: any;
  initials: string;
  links: { name: string; href: string; icon: string }[];
  pathname: string;
  userRole: string;
  onClose?: () => void;
  onSignOut: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="p-8">
        <Link href="/" className="flex items-center group relative z-10 shrink-0">
          <div className="flex flex-col">
            <span className="text-3xl font-serif tracking-tight text-foreground group-hover:text-primary transition-colors">
              MALIXA
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] font-medium text-secondary-foreground mt-1">
              Premium Stitch
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 space-y-1 overflow-y-auto">
        <div className="mb-8">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 px-2">Menu</p>
          
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-4 px-4 py-3 rounded-[12px] text-sm font-light text-secondary-foreground hover:text-primary hover:bg-secondary transition-all mb-2 group"
          >
            <Home className="w-4 h-4" />
            <span>Return to Site</span>
          </Link>

          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = ICON_MAP[link.icon] || LayoutDashboard;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-3 rounded-[12px] text-sm transition-all group ${
                  isActive
                    ? "bg-secondary text-primary font-medium"
                    : "text-secondary-foreground font-light hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User profile & signout */}
      <div className="p-6 border-t border-border">
        <div className="flex items-center gap-4 p-4 rounded-[16px] bg-secondary border border-border/50">
          <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 text-primary font-serif text-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {profile ? `${profile.first_name} ${profile.last_name}` : "User"}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate mt-0.5">
              {ROLE_LABEL[profile?.role || userRole] || userRole}
            </p>
          </div>
          <button
            onClick={onSignOut}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-surface transition-all border border-transparent hover:border-border"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
