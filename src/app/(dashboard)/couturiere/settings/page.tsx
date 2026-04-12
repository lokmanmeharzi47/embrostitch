import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CouturiereSettingsClient from "./SettingsClient"

export default async function CouturiereSettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: couturiereProfile } = await supabase
    .from("couturiere_profiles")
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
    <CouturiereSettingsClient 
      initialSettings={{ ...defaultSettings, ...settings }} 
      initialAvailability={couturiereProfile?.is_available ?? true}
    />
  )
}
