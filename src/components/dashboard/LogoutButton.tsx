"use client"
import { useAuth } from "@/context/AuthContext"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const { signOut, user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
    router.refresh()
  }
  
  return (
    <button 
      onClick={handleLogout} 
      className="w-full flex items-center justify-start text-muted-foreground gap-3 px-2 py-2 text-sm font-medium hover:text-foreground hover:bg-muted/50 rounded-xl transition-all group"
    >
      <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
        {user?.email?.charAt(0).toUpperCase() || "U"}
      </div>
      <span className="flex-1 text-left">Sign Out</span>
      <LogOut size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}
