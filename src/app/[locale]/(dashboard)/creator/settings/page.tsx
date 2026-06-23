import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CreatorSettingsClient from "./SettingsClient"

interface CreatorProfileSettings {
  shop_name: string | null
  shop_description: string | null
  is_visible: boolean | null
  email_updates: boolean | null
  sms_alerts: boolean | null
}

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

  const { data: profileSettings } = await supabase
    .from("creator_profiles")
    .select("shop_name, shop_description, is_visible, email_updates, sms_alerts")
    .eq("id", user.id)
    .maybeSingle()

  const settings = {
    shopName: (profileSettings as CreatorProfileSettings | null)?.shop_name || defaultSettings.shopName,
    shopDescription: (profileSettings as CreatorProfileSettings | null)?.shop_description || defaultSettings.shopDescription,
    isVisible: (profileSettings as CreatorProfileSettings | null)?.is_visible ?? defaultSettings.isVisible,
    emailUpdates: (profileSettings as CreatorProfileSettings | null)?.email_updates ?? defaultSettings.emailUpdates,
    smsAlerts: (profileSettings as CreatorProfileSettings | null)?.sms_alerts ?? defaultSettings.smsAlerts,
  }

  return <CreatorSettingsClient initialSettings={settings} />
}
