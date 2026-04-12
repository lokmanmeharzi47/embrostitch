"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: "client" | "couturiere" | "admin" | "atelier" | "creator";
}

const getNavigationLinks = (role: string) => {
  switch (role) {
    case "client":
      return [
        { name: "Tableau de bord", href: "/client", icon: "dashboard" },
        { name: "Mes Commandes", href: "/client/orders", icon: "shopping_bag" },
        { name: "Nouvelle Commande", href: "/order/create", icon: "add_circle" },
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
        { name: "Tableau de bord", href: "/admin/dashboard", icon: "dashboard" },
        { name: "Statistiques", href: "/admin/dashboard/stats", icon: "bar_chart" },
        { name: "Utilisateurs", href: "/admin/dashboard/users", icon: "people" },
        { name: "Commandes", href: "/admin/dashboard/orders", icon: "receipt_long" },
        { name: "Avis", href: "/admin/dashboard/reviews", icon: "rate_review" },
      ];
    case "atelier":
      return [
        { name: "Tableau de bord", href: "/atelier/dashboard", icon: "dashboard" },
        { name: "Messages", href: "/atelier/dashboard/messages", icon: "chat_bubble" },
      ];
    default:
      return [];
  }
};

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const links = getNavigationLinks(userRole);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary/50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">
            EmbroCraftDZ
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="material-icons text-foreground p-1"
        >
          {mobileOpen ? "close" : "menu"}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 bg-card h-full border-r border-border p-4 space-y-2 animate-in slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2 mb-6">
              <div className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-primary-light flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {profile ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}` : "U"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {profile ? `${profile.first_name} ${profile.last_name}` : "Utilisateur"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {profile?.role === "couturiere" ? "Couturière" : profile?.role || userRole}
                  </p>
                </div>
              </div>
            </div>
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <span
                    className={`material-icons ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {link.icon}
                  </span>
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-border mt-4">
              <button
                onClick={signOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors w-full"
              >
                <span className="material-icons text-destructive">logout</span>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col pt-6 h-screen sticky top-0">
        <div className="px-6 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              EmbroCraftDZ
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border-l-4 border-primary ml-[-4px] pl-[16px]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary group"
                }`}
              >
                <span
                  className={`material-icons transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-primary"
                  }`}
                >
                  {link.icon}
                </span>
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-secondary transition-colors">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-primary-light flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">
                {profile ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}` : "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {profile ? `${profile.first_name} ${profile.last_name}` : "Utilisateur"}
              </p>
              <p className="text-xs text-muted-foreground capitalize truncate">
                {profile?.role === "couturiere" ? "Couturière" : profile?.role || userRole}
              </p>
            </div>
            <button
              onClick={signOut}
              className="material-icons text-muted-foreground text-sm hover:text-destructive transition-colors cursor-pointer"
              title="Déconnexion"
            >
              logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10 hidden md:flex">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {profile?.role === "couturiere"
                ? "Espace Couturière"
                : profile?.role === "admin"
                ? "Administration"
                : "Espace Client"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-icons text-sm">arrow_back</span>
              Retour au site
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8 flex-1 overflow-x-hidden">{children}</div>
      </main>
    </div>
  );
}
