import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CreatorProfileClient from "./ProfileClient"

export default async function CreatorProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email, phone, city, bio, avatar_url")
    .eq("id", user.id)
    .single()
    
  if (!profile) redirect("/login")

  const initialProfile = {
    id: user.id,
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    email: profile.email || user.email || "",
    phone: profile.phone || "",
    city: profile.city || "",
    bio: profile.bio || "",
    avatar_url: profile.avatar_url || "",
  }

  return <CreatorProfileClient initialProfile={initialProfile} />
}
