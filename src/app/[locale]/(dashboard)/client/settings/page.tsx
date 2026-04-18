import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SettingsClient from "./SettingsClient"

export default async function ClientSettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const prefs = user.user_metadata?.preferences || { emailUpdates: true, smsAlerts: false }

  return <SettingsClient initialPrefs={prefs} />
}
