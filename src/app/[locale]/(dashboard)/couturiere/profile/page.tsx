import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CouturiereProfileClient from "./ProfileClient"

export default async function CouturiereProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email, phone, city, bio, avatar_url")
    .eq("id", user.id)
    .single()
    
  if (!profile) redirect("/login")

  const { data: couturiereProfile } = await supabase
    .from("couturiere_profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const initialProfile = {
    id: user.id,
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    email: profile.email || user.email || "",
    phone: profile.phone || "",
    city: profile.city || "",
    bio: profile.bio || "",
    avatar_url: profile.avatar_url || "",
    specialty: couturiereProfile?.specialty || [],
    price_range: couturiereProfile?.price_range || "",
    years_experience: couturiereProfile?.years_experience || 0,
    atelier_name: user.user_metadata?.atelier_name || "",
  }

  return <CouturiereProfileClient initialProfile={initialProfile} />
}
