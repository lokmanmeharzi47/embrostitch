"use client"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Loader2, LogOut } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import toast from "react-hot-toast"


export function LogoutButton() {
  const { signOut, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleLogout = async () => {
    if (isSigningOut) return

    setIsSigningOut(true)
    
    try {
      const { error } = await signOut()
      
      const locale = pathname.split("/").filter(Boolean)[0]
      const loginPath = ["fr", "ar", "en"].includes(locale) ? `/${locale}/login` : "/login"

      if (error) {
        console.error("Sign out error:", error)
        toast.error("Erreur lors de la déconnexion. Redirection forcée...")
      }

      // Use window.location.href for a full refresh to clear all local state/context
      window.location.href = loginPath
    } catch (error) {
      console.error("Unexpected sign out error:", error)
      window.location.reload()
    } finally {
      setIsSigningOut(false)
    }
  }
  
  return (
    <button 
      onClick={handleLogout} 
      disabled={isSigningOut}
      className="w-full flex items-center justify-start text-muted-foreground gap-3 px-2 py-2 text-sm font-medium hover:text-foreground hover:bg-muted/50 rounded-xl transition-all group"
    >
      <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
        {user?.email?.charAt(0).toUpperCase() || "U"}
      </div>
      <span className="flex-1 text-left">{isSigningOut ? "Signing out..." : "Sign Out"}</span>
      {isSigningOut ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <LogOut size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  )
}
