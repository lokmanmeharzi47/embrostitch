import { Bell } from "lucide-react"

interface DashboardHeaderProps {
  profile: any
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-end px-8 shrink-0 z-10 sticky top-0">
      <div className="flex items-center gap-6">
        <button className="relative text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-full">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-6 w-px bg-border"></div>
        
        <div className="flex items-center gap-3 group cursor-pointer p-1.5 hover:bg-muted rounded-xl transition-all">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-foreground leading-tight">{profile?.first_name} {profile?.last_name}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{profile?.role}</p>
          </div>
          
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              className="w-9 h-9 rounded-full object-cover border border-border shadow-sm" 
              alt="avatar" 
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
              {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
