import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClientSidebar } from "@/components/dashboard/sidebars/ClientSidebar"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"

export default async function ClientLayout({
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

  if (!profile || profile.role !== "client") {
    redirect("/")
  }

  return (
    <div className="flex h-screen w-full bg-[#FAFAFA] overflow-hidden">
      <ClientSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader profile={profile} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
           <div className="max-w-7xl mx-auto">
              {children}
           </div>
        </main>
      </div>
    </div>
  )
}
