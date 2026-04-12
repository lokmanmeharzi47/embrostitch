import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function MessagesRedirect({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect("/login")
  }

  const params = await searchParams
  const toParam = params.to ? `?to=${params.to}` : ""

  // Redirect to the role-specific messages page
  const roleRoutes: Record<string, string> = {
    client: "/client/messages",
    couturiere: "/couturiere/messages",
    creator: "/creator/messages",
    admin: "/admin/dashboard",
  }

  const target = roleRoutes[profile.role] || "/login"
  redirect(`${target}${toParam}`)
}
