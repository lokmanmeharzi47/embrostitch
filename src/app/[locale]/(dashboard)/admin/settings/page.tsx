"use client";

import React, { useEffect, useState, useCallback } from "react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface SettingsMap {
  platform_name: string;
  support_email: string;
  marketplace_active: string;
  two_factor_enabled: string;
  session_timeout: string;
  order_notifications: string;
  dispute_alerts: string;
  maintenance_notifications: string;
}

const defaultSettings: SettingsMap = {
  platform_name: "MALIXA",
  support_email: "support@malixa.com",
  marketplace_active: "true",
  two_factor_enabled: "true",
  session_timeout: "30",
  order_notifications: "true",
  dispute_alerts: "true",
  maintenance_notifications: "true",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>(defaultSettings);
  const [original, setOriginal] = useState<SettingsMap>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("platform_settings")
      .select("key, value");

    if (data && !error) {
      const map = { ...defaultSettings };
      data.forEach((row: { key: string; value: string }) => {
        if (row.key in map) {
          (map as Record<string, string>)[row.key] = row.value;
        }
      });
      setSettings(map);
      setOriginal(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();

    // Only upsert changed settings
    const changedEntries = Object.entries(settings).filter(
      ([key, value]) => value !== original[key as keyof SettingsMap]
    );

    if (changedEntries.length === 0) {
      toast("Aucune modification détectée");
      setSaving(false);
      return;
    }

    const upserts = changedEntries.map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("platform_settings")
      .upsert(upserts, { onConflict: "key" });

    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      setOriginal({ ...settings });
      toast.success("Configuration sauvegardée");
    }
    setSaving(false);
  };

  const handleDiscard = () => {
    setSettings({ ...original });
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(original);

  const updateSetting = (key: keyof SettingsMap, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSetting = (key: keyof SettingsMap) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === "true" ? "false" : "true",
    }));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-muted rounded-xl w-1/3" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="md:col-span-3 space-y-6">
            <div className="h-48 bg-muted rounded-xl" />
            <div className="h-48 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            System Settings
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Configure global settings, marketplace policies, and third-party
            integrations.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-white"
            disabled={!hasChanges || saving}
            onClick={handleDiscard}
          >
            Discard Changes
          </Button>
          <Button
            variant="primary"
            disabled={!hasChanges || saving}
            onClick={handleSave}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="material-icons animate-spin text-base">
                  progress_activity
                </span>
                Saving...
              </span>
            ) : (
              "Save Configuration"
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Settings Navigation Sidebar */}
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-bold text-sm text-left transition-colors">
            <span className="material-icons text-[20px]">public</span>
            General Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground font-medium text-sm text-left transition-colors">
            <span className="material-icons text-[20px]">security</span>
            Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground font-medium text-sm text-left transition-colors">
            <span className="material-icons text-[20px]">
              notifications_active
            </span>
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground font-medium text-sm text-left transition-colors">
            <span className="material-icons text-[20px]">storefront</span>
            Marketplace Controls
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground font-medium text-sm text-left transition-colors">
            <span className="material-icons text-[20px]">extension</span>
            Integrations
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-3 space-y-6">
          {/* General Settings Section */}
          <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-secondary/20">
              <h2 className="text-lg font-bold text-foreground">
                Platform Identity
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Basic information about the marketplace.
              </p>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value={settings.platform_name}
                    onChange={(e) =>
                      updateSetting("platform_name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={settings.support_email}
                    onChange={(e) =>
                      updateSetting("support_email", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-border">
                <label className="text-sm font-semibold text-foreground">
                  Platform Status
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Temporarily disable marketplace functions during maintenance.
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative inline-block w-12 h-6 cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.marketplace_active === "true"}
                      onChange={() => toggleSetting("marketplace_active")}
                    />
                    <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Marketplace Active
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Security Settings Section */}
          <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-secondary/20">
              <h2 className="text-lg font-bold text-foreground">
                Administrative Security
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Policies applied to admin and staff accounts.
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Two-Factor Authentication (2FA)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md">
                    Require two-factor authentication for all platform
                    administrators upon login.
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.two_factor_enabled === "true"}
                    onChange={() => toggleSetting("two_factor_enabled")}
                  />
                  <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Session Timeout
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md">
                    Automatically log out inactive administrative staff.
                  </p>
                </div>
                <select
                  value={settings.session_timeout}
                  onChange={(e) =>
                    updateSetting("session_timeout", e.target.value)
                  }
                  className="text-sm border border-border rounded-lg px-3 py-2 bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shrink-0"
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">1 Hour</option>
                  <option value="240">4 Hours</option>
                </select>
              </div>
            </div>
          </section>

          {/* Notification Settings Section */}
          <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-secondary/20 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  System Notifications
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure automated platform alerts.
                </p>
              </div>
            </div>
            <div className="p-0">
              <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/10 transition-colors">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Order Notifications
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Emails and push alerts triggered by new marketplace orders.
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.order_notifications === "true"}
                    onChange={() => toggleSetting("order_notifications")}
                  />
                  <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </div>
              <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/10 transition-colors">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Dispute Alerts
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Instantly notify the moderation team when an order dispute is
                    raised.
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.dispute_alerts === "true"}
                    onChange={() => toggleSetting("dispute_alerts")}
                  />
                  <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </div>
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/10 transition-colors">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    System Maintenance
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Critical infrastructure and maintenance updates.
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.maintenance_notifications === "true"}
                    onChange={() => toggleSetting("maintenance_notifications")}
                  />
                  <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
