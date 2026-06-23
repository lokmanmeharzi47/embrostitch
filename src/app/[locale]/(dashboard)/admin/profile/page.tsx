"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface AdminProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  role: string;
  phone: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, role, phone, city, bio, avatar_url, created_at, updated_at")
        .eq("id", user.id)
        .single();

      if (data && !error) {
        const p = data as AdminProfile;
        setProfile(p);
        setFirstName(p.first_name || "");
        setLastName(p.last_name || "");
        setEmail(p.email || user.email || "");
        setPhone(p.phone || "");
        setCity(p.city || "");
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || null,
        city: city || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              first_name: firstName,
              last_name: lastName,
              email,
              phone: phone || null,
              city: city || null,
              updated_at: new Date().toISOString(),
            }
          : null
      );
      toast.success("Profil mis à jour avec succès");
    }
    setSaving(false);
  };

  const hasChanges =
    profile &&
    (firstName !== (profile.first_name || "") ||
      lastName !== (profile.last_name || "") ||
      email !== (profile.email || "") ||
      phone !== (profile.phone || "") ||
      city !== (profile.city || ""));

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-8 bg-muted rounded w-1/4 mb-2" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </div>
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="h-20 w-20 bg-muted rounded-full" />
          <div className="h-10 bg-muted rounded w-full" />
          <div className="h-10 bg-muted rounded w-full" />
          <div className="h-10 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Impossible de charger le profil.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    client: "Client",
    creator: "Créatrice",
    admin: "Administrateur",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Admin Profile
          </h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles d&apos;administrateur.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-white"
            disabled={!hasChanges || saving}
            onClick={() => {
              setFirstName(profile.first_name || "");
              setLastName(profile.last_name || "");
              setEmail(profile.email || "");
              setPhone(profile.phone || "");
              setCity(profile.city || "");
            }}
          >
            Annuler
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
                Enregistrement...
              </span>
            ) : (
              "Enregistrer"
            )}
          </Button>
        </div>
      </div>

      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du Compte</CardTitle>
          <CardDescription>
            Données de votre profil administrateur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Avatar + Meta */}
            <div className="flex items-center gap-4 pb-6 border-b border-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-xl">
                  {profile.first_name?.charAt(0) || "A"}
                  {profile.last_name?.charAt(0) || ""}
                </span>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {profile.first_name} {profile.last_name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-warning/10 text-warning text-xs font-semibold">
                    {roleLabels[profile.role] || profile.role}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Membre depuis{" "}
                    {new Date(profile.created_at).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Prénom
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Nom
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="—"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Ville
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="—"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Rôle
                </label>
                <input
                  type="text"
                  value={roleLabels[profile.role] || profile.role}
                  disabled
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="pt-4 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Créé le :</span>{" "}
                  <span className="font-medium text-foreground">
                    {new Date(profile.created_at).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Dernière mise à jour :
                  </span>{" "}
                  <span className="font-medium text-foreground">
                    {new Date(profile.updated_at).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
