"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { CircleUser, Loader2, CheckCircle2, Image as ImageIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function CouturiereProfileClient({ 
  initialProfile 
}: { 
  initialProfile: { 
    id: string;
    first_name: string; 
    last_name: string; 
    email: string;
    phone: string;
    city: string;
    bio: string;
    avatar_url: string;
    specialty: string[];
    price_range: string;
    years_experience: number;
    atelier_name: string; // we can use user_metadata for this if first_name is an actual name
  } 
}) {
  const [profile, setProfile] = useState(initialProfile)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    setLoading(true)
    setSuccess(false)
    
    // Update profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        city: profile.city,
        bio: profile.bio
      })
      .eq("id", profile.id)

    // Update couturiere_profiles table
    const { error: cpError } = await supabase
      .from("couturiere_profiles")
      .update({
        specialty: profile.specialty,
        description: profile.bio, // Keep in sync
        location: profile.city,   // Keep in sync
        price_range: profile.price_range,
        years_experience: profile.years_experience
      })
      .eq("id", profile.id)

    // Also update atelier_name in user_metadata
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.auth.updateUser({
        data: {
          atelier_name: profile.atelier_name
        }
      })
    }

    if (!profileError && !cpError) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    
    setLoading(false)
  }

  const toggleSpecialty = (spec: string) => {
    const current = profile.specialty || [];
    if (current.includes(spec)) {
      setProfile({ ...profile, specialty: current.filter(s => s !== spec) })
    } else {
      setProfile({ ...profile, specialty: [...current, spec] })
    }
  }

  const SPECIALTIES = ["Karakou", "Blousa", "Caftan", "Bridal", "Traditional", "Modern", "Custom"]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Couturière Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your public storefront identity and bio.</p>
        </div>
        <div className="flex items-center gap-4">
          {success && (
            <span className="text-sm text-green-600 flex items-center gap-1 font-medium select-none">
              <CheckCircle2 size={16} /> Saved successfully
            </span>
          )}
          <Button variant="default" size="lg" onClick={handleSave} disabled={loading} className="min-w-[120px]">
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Profile"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white md:col-span-1 border-0 shadow-sm ring-1 ring-border shadow-black/5">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-32 h-32 mb-4 bg-muted/50 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-sm ring-1 ring-border/50 relative group cursor-pointer transition-all hover:bg-muted">
               {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                  <CircleUser size={56} className="text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
               )}
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-white text-xs font-semibold">Change</span>
               </div>
            </div>
            <CardTitle className="text-xl font-bold">{profile.atelier_name || profile.first_name || "Your Name"}</CardTitle>
            <CardDescription className="text-primary font-medium mt-1">Couturière / Atelier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 py-4 px-6 text-sm text-muted-foreground text-center">
            Upload a profile picture to make your atelier stand out to clients.
          </CardContent>
        </Card>
        
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-white border-0 shadow-sm ring-1 ring-border shadow-black/5">
            <CardHeader className="pb-4">
               <CardTitle className="text-lg font-bold">Personal Information</CardTitle>
               <CardDescription>Update your contact and brand details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Input 
                   label="First and Last Name" 
                   value={profile.first_name || ""} 
                   onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} 
                   placeholder="e.g. Amina" 
                 />
                 <Input 
                   label="Atelier Name (Optional)" 
                   value={profile.atelier_name || ""} 
                   onChange={(e) => setProfile({ ...profile, atelier_name: e.target.value })} 
                   placeholder="e.g. Elegance Couture" 
                 />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Input 
                   label="City / Location" 
                   value={profile.city || ""} 
                   onChange={(e) => setProfile({ ...profile, city: e.target.value })} 
                   placeholder="e.g. Algiers" 
                 />
                 <Input 
                   label="Phone Number" 
                   value={profile.phone || ""} 
                   onChange={(e) => setProfile({ ...profile, phone: e.target.value })} 
                   placeholder="e.g. +213 555 123 456" 
                 />
               </div>

               <Input 
                 label="Email Address" 
                 value={profile.email || ""} 
                 disabled
                 className="bg-muted/30 cursor-not-allowed" 
               />

               <div className="w-full space-y-1.5 pt-2">
                    <label className="text-sm font-semibold text-foreground tracking-tight">Bio / Description</label>
                    <textarea
                      value={profile.bio || ""}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell clients about your background, style, and what you love to create..."
                      className="flex min-h-[120px] w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
                    />
               </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm ring-1 ring-border shadow-black/5">
            <CardHeader className="pb-4">
               <CardTitle className="text-lg font-bold">Professional Details</CardTitle>
               <CardDescription>Details about your work and specialties.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Input 
                   label="Price Range" 
                   value={profile.price_range || ""} 
                   onChange={(e) => setProfile({ ...profile, price_range: e.target.value })} 
                   placeholder="e.g. €€ - €€€ or 5000 DZD - 15000 DZD" 
                 />
                 <Input 
                   label="Years of Experience" 
                   type="number"
                   value={profile.years_experience || 0} 
                   onChange={(e) => setProfile({ ...profile, years_experience: parseInt(e.target.value) || 0 })} 
                   placeholder="e.g. 5" 
                 />
               </div>

               <div className="w-full space-y-2 pt-2">
                 <label className="text-sm font-semibold text-foreground tracking-tight">Specialties</label>
                 <div className="flex flex-wrap gap-2">
                   {SPECIALTIES.map(spec => {
                     const isSelected = (profile.specialty || []).includes(spec);
                     return (
                       <button
                         key={spec}
                         onClick={() => toggleSpecialty(spec)}
                         className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                           isSelected 
                             ? 'bg-primary text-white border border-primary' 
                             : 'bg-muted/30 text-muted-foreground border border-border hover:bg-muted/50'
                         }`}
                       >
                         {spec}
                       </button>
                     )
                   })}
                 </div>
               </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm ring-1 ring-border shadow-black/5 overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
               <CardTitle className="text-lg font-bold flex items-center gap-2">
                 <ImageIcon size={18} className="text-primary"/> Portfolio Preview
               </CardTitle>
               <CardDescription>A sneak peek of the designs visible on your public storefront.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
               <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/5">
                  <ImageIcon size={40} className="mb-3 opacity-20" />
                  <p className="font-medium text-foreground">No portfolio items found</p>
                  <p className="text-sm mt-1 mb-4 flex max-w-[250px] mx-auto text-muted-foreground/80">Upload your creations in the Portfolio tab to attract more clients.</p>
                  <Button variant="outline" size="sm" className="bg-white shadow-sm border-border/50 font-medium text-primary hover:text-primary hover:bg-primary/5">Go to Portfolio Manager</Button>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
