import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CreatorSettingsClient from "./SettingsClient"

export default async function CreatorSettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: creatorProfile } = await supabase
    .from("creator_profiles")
    .select("is_available")
    .eq("id", user.id)
    .single()

  const defaultSettings = { 
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    emailUpdates: true, 
    smsAlerts: false 
  }

  const settings = user.user_metadata?.settings || defaultSettings

  return (
    <CreatorSettingsClient 
      initialSettings={{ ...defaultSettings, ...settings }} 
      initialAvailability={creatorProfile?.is_available ?? true}
    />
  )
}
