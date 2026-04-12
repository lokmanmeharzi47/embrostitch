import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CreatorSettingsClient from "./SettingsClient"

export default async function CreatorSettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const defaultSettings = { 
    shopName: "", 
    shopDescription: "", 
    isVisible: true,
    emailUpdates: true, 
    smsAlerts: false 
  }

  const settings = user.user_metadata?.settings || defaultSettings

  return <CreatorSettingsClient initialSettings={{ ...defaultSettings, ...settings }} />
}
