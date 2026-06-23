"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";


interface DashboardProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  avatar_url: string | null;
}

interface NotificationRow {
  id: string;
  user_id: string;
  type: string | null;
  title: string | null;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

interface DashboardHeaderProps {
  profile: DashboardProfile | null;
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const supabase = useMemo(() => createClient(), []);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchUnreadNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, user_id, type, title, message, link, is_read, created_at")
        .eq("user_id", profile.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Failed to load notifications:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return;
      }

      setNotifications((data || []) as NotificationRow[]);
    };

    fetchUnreadNotifications();

    let cleanup: (() => void) | undefined;

    const setupRealtime = () => {
      const channel = supabase
        .channel('dashboard-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${profile.id}`
          },
          (payload) => {
            const notification = payload.new as NotificationRow;
            if (notification.is_read) return;
            setNotifications((current) => [notification, ...current].slice(0, 10));
          }
        )
        .subscribe();

      cleanup = () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();

    return () => {
      cleanup?.();
    };
  }, [profile?.id, supabase]);

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  const handleToggleNotifications = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (!nextOpen || !profile?.id || unreadCount === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", profile.id)
      .eq("is_read", false);

    if (error) {
      console.error("Failed to mark notifications as read:", error);
      return;
    }

    setNotifications((current) =>
      current.map((notification) => ({ ...notification, is_read: true }))
    );
  };

  const initials = `${profile?.first_name?.charAt(0) || ""}${profile?.last_name?.charAt(0) || ""}` || "U";

  return (
    <header className="h-14 md:h-16 bg-white border-b border-border flex items-center justify-between px-4 md:px-8 shrink-0 z-10 sticky top-0">
      {/* Mobile: brand logo on left */}
      <Link href="/" className="md:hidden flex items-center">
        <span className="text-lg font-black tracking-tight">
          <span className="text-primary">MALIXA</span>
          <span className="text-foreground">DZ</span>
        </span>
      </Link>
      {/* Desktop: left spacer */}
      <div className="hidden md:block" />
      <div className="flex items-center gap-6">
        <div className="relative">
          <button
            onClick={handleToggleNotifications}
            className="relative text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-full"
            aria-label="Notifications"
            aria-expanded={isOpen}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-red-500 rounded-full border-2 border-white text-[10px] leading-4 text-white font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-border rounded-xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-bold text-foreground">Notifications</h2>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Aucune notification non lue.
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="px-4 py-3 border-b border-border/60 last:border-b-0">
                      <p className="text-sm font-semibold text-foreground">
                        {notification.title || "Notification"}
                      </p>
                      {(notification.message) && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
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
              {initials}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
