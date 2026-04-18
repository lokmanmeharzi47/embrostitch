import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { CircleUser, Mail, Phone, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ClientProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email, phone, city")
    .eq("id", user.id)
    .single()
    
  if (!profile) redirect("/login")

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your public information and measurements</p>
        </div>
        <Button variant="outline" size="lg">Edit Profile</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-24 h-24 mb-4 bg-muted rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
               <CircleUser size={48} className="text-muted-foreground" />
            </div>
            <CardTitle className="text-xl font-bold">{profile.first_name} {profile.last_name}</CardTitle>
            <CardDescription>Client Account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 py-4">
            <div className="flex items-center gap-3 text-sm text-foreground hover:bg-muted/30 p-2 rounded-md transition-colors">
               <Mail size={16} className="text-muted-foreground" /> {profile.email || user.email}
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground hover:bg-muted/30 p-2 rounded-md transition-colors">
               <Phone size={16} className="text-muted-foreground" /> {profile.phone || "Not provided"}
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground hover:bg-muted/30 p-2 rounded-md transition-colors">
               <MapPin size={16} className="text-muted-foreground" /> {profile.city || "Not provided"}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white md:col-span-2">
          <CardHeader>
             <CardTitle className="text-lg font-bold">Measurements & Sizes</CardTitle>
             <CardDescription>Saved sizes to help couturiers craft the perfect fit.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <CircleUser size={48} className="mb-4 opacity-20" />
                <p>No measurements saved yet.</p>
                <Button variant="outline" className="mt-4">Add Measurements</Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
