import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/dashboard/sidebars/AdminSidebar"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { BottomNavBar } from "@/components/dashboard/BottomNavBar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // 2. Role check
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="flex h-screen w-full bg-[#FAFAFA] overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader profile={profile} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
           <div className="max-w-7xl mx-auto">
              {children}
           </div>
        </main>
      </div>
      <BottomNavBar role="admin" />
    </div>
  )
}
