"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Bell, Store, Eye, Lock, Loader2, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function CreatorSettingsClient({ 
  initialSettings 
}: { 
  initialSettings: { 
    shopName: string; 
    shopDescription: string; 
    isVisible: boolean;
    emailUpdates: boolean; 
    smsAlerts: boolean;
    isVerified: boolean;
  } 
}) {
  const [settings, setSettings] = useState(initialSettings)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    setLoading(true)
    setSuccess(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase
        .from("creator_profiles")
        .update({
          shop_name: settings.shopName,
          shop_description: settings.shopDescription,
          is_visible: settings.isVisible,
          email_updates: settings.emailUpdates,
          sms_alerts: settings.smsAlerts,
        })
        .eq("id", user.id)

      if (!error) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        console.error("Failed to save creator settings:", error)
      }
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shop Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your shop preferences and notifications.</p>
        </div>
        <div className="flex items-center gap-4">
          {success && (
            <span className="text-sm text-green-600 flex items-center gap-1 font-medium select-none">
              <CheckCircle2 size={16} /> Saved successfully
            </span>
          )}
          <Button variant="default" size="lg" onClick={handleSave} disabled={loading} className="min-w-[120px]">
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white">
           <CardHeader>
             <CardTitle className="text-lg font-bold flex items-center gap-2"><Store size={18} /> Store Configuration</CardTitle>
             <CardDescription>Configure how your shop appears to buyers.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
              <Input 
                 label="Shop Name" 
                 value={settings.shopName} 
                 onChange={(e) => setSettings({ ...settings, shopName: e.target.value })} 
                 placeholder="My Awesome Shop" 
              />
              <div className="w-full space-y-1.5">
                  <label className="text-sm font-semibold text-foreground tracking-tight">Shop Subtitle/Short Description</label>
                  <textarea
                    value={settings.shopDescription}
                    onChange={(e) => setSettings({ ...settings, shopDescription: e.target.value })}
                    placeholder="Brief description of your shop..."
                    className="flex min-h-[80px] w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
                  />
              </div>
           </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
             <CardTitle className="text-lg font-bold flex items-center gap-2"><Eye size={18} /> Visibility</CardTitle>
             <CardDescription>Control who can see your shop and profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => setSettings({ ...settings, isVisible: !settings.isVisible })}
            >
               <div>
                  <h4 className="font-medium text-sm">Public visibility</h4>
                  <p className="text-xs text-muted-foreground mt-1">Allow buyers to find your shop in search results</p>
               </div>
               <div className={`w-10 h-6 ${settings.isVisible ? 'bg-primary' : 'bg-muted'} rounded-full relative transition-colors`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${settings.isVisible ? 'left-[22px]' : 'left-1'}`}></div>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
             <CardTitle className="text-lg font-bold flex items-center gap-2"><Bell size={18} /> Notifications</CardTitle>
             <CardDescription>How would you like us to contact you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => setSettings({ ...settings, emailUpdates: !settings.emailUpdates })}
            >
               <div>
                  <h4 className="font-medium text-sm">Email Updates</h4>
                  <p className="text-xs text-muted-foreground mt-1">Receive new order alerts via email</p>
               </div>
               <div className={`w-10 h-6 ${settings.emailUpdates ? 'bg-primary' : 'bg-muted'} rounded-full relative transition-colors`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${settings.emailUpdates ? 'left-[22px]' : 'left-1'}`}></div>
               </div>
            </div>
            
            <div 
              className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => setSettings({ ...settings, smsAlerts: !settings.smsAlerts })}
            >
               <div>
                  <h4 className="font-medium text-sm">SMS Alerts</h4>
                  <p className="text-xs text-muted-foreground mt-1">Critical alerts for order deadlines</p>
               </div>
               <div className={`w-10 h-6 ${settings.smsAlerts ? 'bg-primary' : 'bg-muted'} rounded-full relative transition-colors`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${settings.smsAlerts ? 'left-[22px]' : 'left-1'}`}></div>
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

        <Card className="bg-white">
          <CardHeader>
             <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CheckCircle2 size={18} className={settings.isVerified ? "text-emerald-500" : "text-muted-foreground"} /> 
                Verification Status
             </CardTitle>
             <CardDescription>Your verification status for the Artisan Map.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {settings.isVerified ? (
               <div className="p-4 border border-emerald-200 bg-emerald-50 rounded-xl text-sm flex items-start gap-4">
                  <CheckCircle2 size={24} className="text-emerald-600 shrink-0 mt-1" />
                  <div>
                     <h4 className="font-bold text-emerald-800">Verified Creator</h4>
                     <p className="text-emerald-700/80 text-xs mt-1">Your profile is verified and is visible to clients on the Artisan Map.</p>
                  </div>
               </div>
             ) : (
               <div className="p-4 border border-border bg-muted/30 rounded-xl text-sm flex items-start gap-4">
                  <Loader2 size={24} className="text-muted-foreground shrink-0 mt-1 animate-pulse" />
                  <div>
                     <h4 className="font-bold text-foreground">Pending Verification</h4>
                     <p className="text-muted-foreground text-xs mt-1 mb-3">Your profile is currently awaiting verification from an admin. Once verified, you will appear on the Artisan Map.</p>
                  </div>
               </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
