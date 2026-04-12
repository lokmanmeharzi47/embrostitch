"use client"
import { useAuth } from "@/context/AuthContext"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
    router.refresh()
  }
  
  return (
    <button onClick={handleLogout} className="w-full flex items-center justify-start text-muted-foreground gap-3 px-3 py-2.5 text-sm font-medium hover:text-destructive hover:bg-destructive/5 rounded-xl transition-colors">
       <LogOut size={18} /> Sign Out
    </button>
  )
}
