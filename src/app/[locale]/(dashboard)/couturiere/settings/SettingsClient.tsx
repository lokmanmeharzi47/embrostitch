"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Bell, Calendar, Eye, Lock, Loader2, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function CreatorSettingsClient({ 
  initialSettings,
  initialAvailability 
}: { 
  initialSettings: { 
    workingDays: string[];
    emailUpdates: boolean; 
    smsAlerts: boolean;
  };
  initialAvailability: boolean;
}) {
  const [settings, setSettings] = useState(initialSettings)
  const [isAvailable, setIsAvailable] = useState(initialAvailability)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    setLoading(true)
    setSuccess(false)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Update user_metadata for settings
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          settings: settings
        }
      })
      
      // Update creator_profiles for is_available
      const { error: cpError } = await supabase
        .from("creator_profiles")
        .update({
          is_available: isAvailable
        })
        .eq("id", user.id)

      if (!userError && !cpError) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    }
    
    setLoading(false)
  }

  const toggleWorkingDay = (day: string) => {
    const current = settings.workingDays || [];
    if (current.includes(day)) {
      setSettings({ ...settings, workingDays: current.filter(d => d !== day) })
    } else {
      setSettings({ ...settings, workingDays: [...current, day] })
    }
  }

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your platform preferences and notification settings.</p>
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
             <CardTitle className="text-lg font-bold flex items-center gap-2"><Eye size={18} /> Order Acceptance</CardTitle>
             <CardDescription>Control your availability for taking new orders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => setIsAvailable(!isAvailable)}
            >
               <div>
                  <h4 className="font-medium text-sm">Accept New Orders</h4>
                  <p className="text-xs text-muted-foreground mt-1">Status: {isAvailable ? 'Available' : 'Busy'}</p>
               </div>
               <div className={`w-10 h-6 ${isAvailable ? 'bg-primary' : 'bg-muted'} rounded-full relative transition-colors`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${isAvailable ? 'left-[22px]' : 'left-1'}`}></div>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
           <CardHeader>
             <CardTitle className="text-lg font-bold flex items-center gap-2"><Calendar size={18} /> Working Schedule</CardTitle>
             <CardDescription>Select the days you are available to work.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="flex flex-wrap gap-2">
               {DAYS.map(day => {
                 const isSelected = (settings.workingDays || []).includes(day);
                 return (
                   <button
                     key={day}
                     onClick={() => toggleWorkingDay(day)}
                     className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                       isSelected 
                         ? 'bg-primary text-white border border-primary' 
                         : 'bg-muted/30 text-muted-foreground border border-border hover:bg-muted/50'
                     }`}
                   >
                     {day}
                   </button>
                 )
               })}
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
      </div>
    </div>
  )
}
