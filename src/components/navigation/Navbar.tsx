"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useState, useEffect } from "react"
import { Menu, X, LayoutDashboard, Search, Sparkles, LogOut, User, Bell, Heart } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image";


export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { user, profile, loading, signOut } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "Marketplace", href: "/marketplace" },
    { name: "How it works", href: "/how-it-works" },
    { name: "Creations", href: "/creations" },
  ]

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-out px-4 flex flex-col justify-center",
        "h-[var(--header-height)]"
      )}
    >
      <div className="container mx-auto max-w-7xl">
        <div
          className={cn(
            "relative flex items-center justify-between transition-all duration-500 px-6 backdrop-blur-md",
            isScrolled
              ? "glass rounded-2xl py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border-white/40 dark:border-white/10"
              : "bg-white/40 dark:bg-black/20 rounded-3xl py-4 border border-white/20 dark:border-white/5 shadow-sm"
          )}
        >
          {/* Logo Area */}
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

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 mx-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative px-5 py-2 group"
              >
                <span className="relative z-10 text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors duration-300">
                  {link.name}
                </span>
                <span className="absolute bottom-1 left-1/2 w-0 h-0.5 bg-primary group-hover:w-1/2 group-hover:left-1/4 transition-all duration-300 ease-out rounded-full" />
              </Link>
            ))}
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden xl:flex items-center flex-1 max-w-sm mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search styles, creators..."
                className="w-full bg-muted/30 border-none pl-10 h-10 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="h-10 w-20 animate-pulse rounded-xl bg-muted" />
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
              </div>
            ) : user && profile ? (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                  <Bell size={20} />
                </Button>
                <div className="h-8 w-px bg-border/50 mx-1" />
                <Link href={profile.role === "creator" ? "/creator" : `/${profile.role}`}>
                  <Button variant="ghost" size="sm" className="rounded-xl gap-2 font-semibold">
                    <User size={18} />
                    <span>Dashboard</span>
                  </Button>
                </Link>
                <Button
                  variant="luxury"
                  size="sm"
                  onClick={signOut}
                  className="rounded-xl px-5 h-10 bg-zinc-900 border-none text-white hover:bg-zinc-800"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="rounded-xl font-semibold" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button variant="luxury" size="sm" className="rounded-xl px-6 h-10 shadow-lg shadow-primary/20" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu & Search Toggles */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search size={22} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl bg-primary/5 text-primary"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-[400px] bg-white dark:bg-zinc-950 z-[120] p-8 shadow-2xl flex flex-col lg:hidden border-l border-white/10"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                    <Sparkles size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold tracking-tight">EmbroCraftDZ</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Premium Marketplace</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={24} />
                </Button>
              </div>

              <div className="flex flex-col gap-6 mb-12">
                {navLinks.map((link, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={link.name}
                  >
                    <Link
                      href={link.href}
                      className="text-2xl font-bold text-foreground hover:text-primary transition-colors flex items-center justify-between group"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        →
                      </motion.span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto pt-10 border-t border-border/50">
                {user && profile ? (
                  <div className="flex flex-col gap-4">
                    <Link
                      href={profile.role === "creator" ? "/creator" : `/${profile.role}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full h-14 rounded-2xl gap-3 text-lg font-semibold border-2">
                        <LayoutDashboard size={20} />
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="luxury" className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20" onClick={signOut}>
                      <LogOut size={20} className="mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Button variant="outline" className="w-full h-14 rounded-2xl text-lg font-semibold border-2" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button variant="luxury" className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link href="/register">Create Account</Link>
                    </Button>
                  </div>
                )}

                <p className="mt-8 text-center text-sm text-muted-foreground font-medium">
                  Designing the future of craft.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Search Overlay (Mobile) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-24 z-[130] lg:hidden"
          >
            <div className="relative glass p-5 rounded-[2.5rem] shadow-2xl border-white/50 border-2">
              <Input
                placeholder="Search designs, artisans..."
                className="h-14 bg-white/50 dark:bg-black/30 border-none text-lg pl-14 rounded-3xl focus:ring-0 placeholder:text-muted-foreground/50"
                autoFocus
              />
              <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-primary" size={24} />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-8 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 hover:bg-red-50 text-red-500"
                onClick={() => setSearchOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
