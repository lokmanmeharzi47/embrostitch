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
  userRole: "client" | "couturiere" | "admin" | "atelier" | "creator";
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
        { name: "Tableau de bord", href: "/client", icon: "dashboard" },
        { name: "Mes Commandes", href: "/client/orders", icon: "shopping_bag" },
        { name: "Nouvelle Commande", href: "/marketplace", icon: "add_circle" },
        { name: "Messages", href: "/client/messages", icon: "chat_bubble" },
        { name: "Mes Avis", href: "/client/reviews", icon: "star_rate" },
      ];
    case "couturiere":
      return [
        { name: "Tableau de bord", href: "/couturiere", icon: "dashboard" },
        { name: "Commandes", href: "/couturiere/orders", icon: "receipt_long" },
        { name: "Portfolio", href: "/couturiere/portfolio", icon: "photo_library" },
        { name: "Avis", href: "/couturiere/reviews", icon: "star_rate" },
        { name: "Messages", href: "/couturiere/messages", icon: "chat_bubble" },
      ];
    case "creator":
      return [
        { name: "Tableau de bord", href: "/creator", icon: "dashboard" },
        { name: "Commandes", href: "/creator/orders", icon: "receipt_long" },
        { name: "Portfolio", href: "/creator/portfolio", icon: "photo_library" },
        { name: "Avis", href: "/creator/reviews", icon: "star_rate" },
        { name: "Messages", href: "/creator/messages", icon: "chat_bubble" },
      ];
    case "admin":
      return [
        { name: "Tableau de bord", href: "/admin", icon: "dashboard" },
        { name: "Statistiques", href: "/admin/stats", icon: "bar_chart" },
        { name: "Utilisateurs", href: "/admin/users", icon: "people" },
        { name: "Commandes", href: "/admin/orders", icon: "receipt_long" },
        { name: "Avis", href: "/admin/reviews", icon: "rate_review" },
      ];
    default:
      return [];
  }
};

const ROLE_LABEL: Record<string, string> = {
  client: "Espace Client",
  couturiere: "Espace Couturière",
  creator: "Espace Créateur",
  admin: "Administration",
  atelier: "Espace Atelier",
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
    <div className="min-h-screen bg-[#f8f7ff] flex flex-col md:flex-row">

      {/* ── Mobile Header ── */}
      <div className="md:hidden bg-white border-b border-border/60 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 primary-gradient rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black text-foreground tracking-tight">
            EmbroCraft<span className="text-primary">DZ</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
            <Bell className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center text-primary"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 flex flex-col shadow-2xl md:hidden"
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
      <aside className="hidden md:flex w-64 bg-white border-r border-border/60 flex-col h-screen sticky top-0 shadow-sm">
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
        <header className="hidden md:flex h-14 bg-white border-b border-border/60 items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground">{ROLE_LABEL[userRole] || "Dashboard"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-semibold">
              <ArrowLeft className="w-4 h-4" />
              Retour au site
            </Link>
            <div className="h-5 w-px bg-border" />
            <button className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</div>
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
      <Link href="/" className="flex items-center group relative z-10 shrink-0">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="relative mr-3 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl"            >
              <Image
                src="/logo.png"
                alt="EmbroCraftDZ Logo"
                fill
                className="object-cover"
              />
            </motion.div>

            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                EmbroCraft
                <span className="text-primary group-hover:text-foreground transition-colors">
                  DZ
                </span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-muted-foreground/80 leading-tight">
                Premium Stitch
              </span>
            </div>
          </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Back to site link */}
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/6 transition-all mb-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Home className="w-4 h-4" />
          </div>
          <span>Retour au Site</span>
        </Link>

        <div className="h-px bg-border/50 mx-2 mb-2" />

        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = ICON_MAP[link.icon] || LayoutDashboard;
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isActive ? "bg-white/20" : "bg-muted group-hover:bg-white"
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : ""}`} />
              </div>
              <span>{link.name}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
            </Link>
          );
        })}
      </nav>

      {/* User profile & signout */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/60 hover:bg-muted transition-colors cursor-default">
          <div className="w-9 h-9 rounded-xl primary-gradient flex items-center justify-center shrink-0 text-white text-sm font-black shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">
              {profile ? `${profile.first_name} ${profile.last_name}` : "Utilisateur"}
            </p>
            <p className="text-xs text-muted-foreground capitalize truncate">
              {ROLE_LABEL[profile?.role || userRole] || userRole}
            </p>
          </div>
          <button
            onClick={onSignOut}
            className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all"
            title="Déconnexion"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
