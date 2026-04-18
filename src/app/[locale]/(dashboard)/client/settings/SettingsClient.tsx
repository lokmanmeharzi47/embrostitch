"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Bell, Lock, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import toast from "react-hot-toast"

export default function SettingsClient({ initialPrefs }: { initialPrefs: { emailUpdates: boolean; smsAlerts: boolean } }) {
  const [prefs, setPrefs] = useState(initialPrefs)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase
      .from("profiles")
      .update({
        notifications_email: prefs.emailUpdates,
        notifications_sms: prefs.smsAlerts
      })
      .eq("id", (await supabase.auth.getUser()).data.user?.id)

    if (!error) {
      toast.success("Préférences mises à jour !")
    } else {
      console.error(error)
      toast.error("Échec de la mise à jour.")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
          <p className="text-muted-foreground mt-1">Manage notifications and account security</p>
        </div>
        <Button variant="luxury" size="lg" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader>
             <CardTitle className="text-lg font-bold flex items-center gap-2"><Bell size={18} /> Notifications</CardTitle>
             <CardDescription>How would you like us to contact you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => setPrefs({ ...prefs, emailUpdates: !prefs.emailUpdates })}
            >
               <div>
                  <h4 className="font-medium text-sm">Email Updates</h4>
                  <p className="text-xs text-muted-foreground mt-1">Receive order updates and promotions via email</p>
               </div>
               <div className={`w-10 h-6 ${prefs.emailUpdates ? 'bg-primary' : 'bg-muted'} rounded-full relative transition-colors`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${prefs.emailUpdates ? 'left-[22px]' : 'left-1'}`}></div>
               </div>
            </div>
            
            <div 
              className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => setPrefs({ ...prefs, smsAlerts: !prefs.smsAlerts })}
            >
               <div>
                  <h4 className="font-medium text-sm">SMS Alerts</h4>
                  <p className="text-xs text-muted-foreground mt-1">Critical alerts for order deliveries only</p>
               </div>
               <div className={`w-10 h-6 ${prefs.smsAlerts ? 'bg-primary' : 'bg-muted'} rounded-full relative transition-colors`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${prefs.smsAlerts ? 'left-[22px]' : 'left-1'}`}></div>
               </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader>
             <CardTitle className="text-lg font-bold flex items-center gap-2"><Lock size={18} /> Security</CardTitle>
             <CardDescription>Protect your account login methods.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-xl text-sm flex items-start gap-4">
                <Lock size={24} className="text-destructive shrink-0 mt-1" />
                <div>
                   <h4 className="font-bold text-destructive">Password Reset</h4>
                   <p className="text-muted-foreground text-xs mt-1 mb-3">If you forgot your password or wish to update it.</p>
                   <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive/10">Request Reset Link</Button>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
